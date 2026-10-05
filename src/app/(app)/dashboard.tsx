import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMatches,
  deleteMatch,
  shareMatchSummary,
} from '@/integration/matchStorage';
import { MatchPlayerRecord } from '@/@types/match';
import { Icon } from '@/components/icon';
import { Card } from '@/components/card';
import { List } from '@/components/list';
import { showCustomAlert } from '@/components/alert';

export default function DashboardWeb() {
  const router = useRouter();
  const { auth, signOut } = useAuth();

  const [matches, setMatches] = useState<MatchPlayerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLogout = () => {
    showCustomAlert('Sair da Conta', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const handleDelete = (id: string, name: string) => {
    showCustomAlert('Excluir Registro', `Deseja remover ${name} do arquivo .json?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteMatch(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header Desktop */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {auth?.user?.name || 'Scout'} 👋</Text>
            <Text style={styles.subGreeting}>FutFoto Web - Gestão de Partidas e Craques</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.newMatchTopBtn}
              onPress={() => router.push('/(app)/new-match')}
            >
              <Icon name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.newMatchTopBtnText}>Novo Craque (PC)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Icon name="log-out-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner de Boas-Vindas Web */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Painel de Scouts e Partidas</Text>
            <Text style={styles.bannerText}>
              Cadastre jogadores, anexe fotos do seu computador e consulte as súmulas salvas no banco JSON.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bannerBtn}
            onPress={() => router.push('/(app)/new-match')}
          >
            <Icon name="cloud-upload-outline" size={20} color={Colors.primary} />
            <Text style={styles.bannerBtnText}>Anexar Imagem e Cadastrar</Text>
          </TouchableOpacity>
        </View>

        {/* Título da Seção */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚽ Partidas e Jogadores Cadastrados ({matches.length})</Text>
          <Text style={styles.sectionSubtitle}>Base de dados carregada do arquivo JSON</Text>
        </View>

        {/* Grid de Cards Multiplataforma */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <List
            data={matches}
            emptyMessage="Nenhum jogador ou partida cadastrada no momento."
            isLoading={isLoading}
            renderItem={({ item }) => (
              <Card
                match={item}
                onDelete={() => handleDelete(item.id, item.playerName)}
                onShare={() => shareMatchSummary(item)}
              />
            )}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  newMatchTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    cursor: 'pointer',
  } as any,
  newMatchTopBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    cursor: 'pointer',
  } as any,
  banner: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  bannerContent: {
    flex: 1,
    minWidth: 300,
  },
  bannerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  bannerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    cursor: 'pointer',
  } as any,
  bannerBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 40,
  },
});
