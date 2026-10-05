import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
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

export default function DashboardAndroid() {
  const router = useRouter();
  const { auth, setAuth } = useAuth();

  const [matches, setMatches] = useState<MatchPlayerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadData = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert('Sair da Conta', 'Deseja realmente sair?', [
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
    Alert.alert('Excluir Registro', `Deseja remover ${name} do arquivo .json?`, [
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
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível exportar o arquivo JSON.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo,</Text>
            <Text style={styles.userName}>{auth?.user?.name || 'Scout'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Botão de Ação Principal: Novo Registro com Câmera e GPS */}
        <TouchableOpacity
          style={styles.newMatchBtn}
          onPress={() => router.push('/(app)/new-match')}
        >
          <View style={styles.newMatchIconBox}>
            <Ionicons name="camera" size={26} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.newMatchTitle}>Registrar Novo Craque</Text>
            <Text style={styles.newMatchSubtitle}>Tirar foto, pegar GPS e marcar gols</Text>
          </View>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>

        {/* Barra de Ação Secundária: Admin se for administrador */}
        {auth?.roles?.some((r) => (typeof r === 'string' ? r : r.name).includes('ADMIN')) && (
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => router.push('/(app)/admin')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.secondary} />
            <Text style={styles.adminBtnText}>Acessar Painel de Moderação Admin</Text>
          </TouchableOpacity>
        )}

        {/* Título da Lista de Partidas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚽ Partidas e Craques Salvos ({matches.length})</Text>
          <Text style={styles.sectionSubtitle}>Persistência em arquivo JSON</Text>
        </View>

        {/* Lista de Registros */}
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="football-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma partida registrada</Text>
            <Text style={styles.emptyDesc}>Toque em "Registrar Novo Craque" para tirar a primeira foto.</Text>
          </View>
        ) : (
          matches.map((item) => (
            <View key={item.id} style={styles.matchCard}>
              {/* Foto do Jogador */}
              <View style={styles.cardImageWrapper}>
                {item.photoUri ? (
                  <Image source={{ uri: item.photoUri }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Ionicons name="person" size={40} color={Colors.textMuted} />
                  </View>
                )}
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>⭐ {item.rating.toFixed(1)}</Text>
                </View>
              </View>

              {/* Informações */}
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playerName} numberOfLines={1}>{item.playerName}</Text>
                    <Text style={styles.playerPosition}>{item.position}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.playerName)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>

                {/* Estatísticas resumidas */}
                <View style={styles.statsBadgeRow}>
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

                {/* Localização GPS */}
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.primary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item.location.addressName || 'Campo Local'} • {item.location.city || ''}
                  </Text>
                </View>

                {/* Botão Compartilhar NATIVO */}
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => shareMatchSummary(item)}
                >
                  <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
                  <Text style={styles.shareBtnText}>Compartilhar Estatísticas</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 14,
  },
  newMatchIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMatchTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  newMatchSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  exportBtnText: {
    color: Colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  adminBtnText: {
    color: Colors.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  matchCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
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
  cardImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  ratingBadgeText: {
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
    marginBottom: 10,
  },
  playerName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  playerPosition: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  statsBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statPill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    marginBottom: 14,
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
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    height: 42,
    borderRadius: 10,
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
