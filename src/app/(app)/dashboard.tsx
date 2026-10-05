import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/integration/authIntegration';
import {
  getMatches,
  deleteMatch,
  shareMatchSummary,
  exportMatchesJsonFile,
} from '@/integration/matchStorage';
import { MatchPlayerRecord } from '@/@types/match';
import { Icon } from '@/components/icon';
import { showCustomAlert } from '@/components/alert';

export default function DashboardWeb() {
  const router = useRouter();
  const { auth, setAuth } = useAuth();

  const [matches, setMatches] = useState<MatchPlayerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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
          await logout();
          setAuth(null);
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

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      await exportMatchesJsonFile();
      showCustomAlert('Sucesso', 'Arquivo partidas_futfoto.json gerado para download!');
    } catch (e) {
      showCustomAlert('Erro', 'Não foi possível exportar o arquivo JSON.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {auth?.user?.name || 'Scout'} 👋</Text>
            <Text style={styles.subGreeting}>FutFoto - Gestão de Partidas e Craques</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Icon name="log-out-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Registrar Novo Craque */}
        <TouchableOpacity
          style={styles.newMatchBtn}
          onPress={() => router.push('/(app)/new-match')}
        >
          <View style={styles.iconCircle}>
            <Icon name="camera" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.newMatchTitle}>Registrar Novo Craque / Partida</Text>
            <Text style={styles.newMatchSubtitle}>Tirar foto, pegar GPS e preencher gols/assistências</Text>
          </View>
          <Icon name="add-circle" size={26} color={Colors.primary} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚽ Partidas e Jogadores Salvos ({matches.length})</Text>
            <Text style={styles.sectionSubtitle}>Dados persistidos no arquivo JSON local</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : matches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="football-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhuma partida registrada</Text>
              <Text style={styles.emptyDesc}>Clique no botão acima para cadastrar a primeira partida.</Text>
            </View>
          ) : (
            matches.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardImageWrapper}>
                  {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.cardPlaceholder}>
                      <Icon name="person" size={40} color={Colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playerName}>{item.playerName}</Text>
                      <Text style={styles.playerPosition}>{item.position}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id, item.playerName)}
                      style={styles.deleteBtn}
                    >
                      <Icon name="trash-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statPill}>
                      <Text style={styles.statPillText}>⚽ {item.goals} {item.goals === 1 ? 'Gol' : 'Gols'}</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statPillText}>🎯 {item.assists} Ast</Text>
                    </View>
                    {item.yellowCards > 0 && (
                      <View style={[styles.statPill, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                        <Text style={[styles.statPillText, { color: Colors.accent }]}>🟨 {item.yellowCards}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.locationRow}>
                    <Icon name="location-outline" size={14} color={Colors.primary} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.location.addressName || 'Campo Local'} • {item.location.city || ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => shareMatchSummary(item)}
                  >
                    <Icon name="share-social-outline" size={16} color={Colors.primary} />
                    <Text style={styles.shareBtnText}>Compartilhar Craque</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  exportTopBtnText: {
    color: Colors.accent,
    fontWeight: '700',
    fontSize: 12,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newMatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMatchTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  newMatchSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  list: {
    paddingBottom: 30,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImageWrapper: {
    position: 'relative',
    height: 180,
    backgroundColor: Colors.surfaceLight,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  ratingText: {
    color: Colors.accent,
    fontWeight: '800',
    fontSize: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  playerName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  playerPosition: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statPill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statPillText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  shareBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyDesc: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
