import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getMessage, logout } from '@/integration/authIntegration';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/card';
import { List } from '@/components/list';
import { Input } from '@/components/input';
import { Icon } from '@/components/icon';
import { showCustomAlert } from '@/components/alert';
import { MOCK_CARDS, CardItem } from '@/data/futfoto';

export default function DashboardWeb() {
  const router = useRouter();
  const { auth, setAuth } = useAuth();

  const isAdmin = !!auth?.roles?.some(
    (role) => (typeof role === 'string' ? role : role.name) === 'ROLE_ADMIN' || (typeof role === 'string' ? role : role.name) === 'admin'
  );

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'gold' | 'silver' | 'legendary'>('all');
  const [serverMessage, setServerMessage] = useState('');
  const [isLoadingMsg, setIsLoadingMsg] = useState(false);

  useEffect(() => {
    async function loadInfo() {
      setIsLoadingMsg(true);
      try {
        const data = await getMessage();
        setServerMessage(data.message);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMsg(false);
      }
    }
    loadInfo();
  }, []);

  const filteredCards = MOCK_CARDS.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.club.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || card.rarity === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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

  const handleCardPress = (card: CardItem) => {
    showCustomAlert(
      card.name,
      `Clube: ${card.club}\nPosição: ${card.position}\nOverall: ${card.overall}\nRaridade: ${card.rarity.toUpperCase()}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header com Informações do Usuário e Logout */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {auth?.user?.name || 'Jogador'} 👋</Text>
            <Text style={styles.subGreeting}>FutFoto Web Dashboard</Text>
            {isAdmin && <Text style={styles.adminBadge}>ADMINISTRADOR</Text>}
          </View>
          <View style={styles.headerActions}>
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={() => router.push('/(app)/admin')}
              >
                <Icon name="shield-checkmark" size={18} color={Colors.accent} />
                <Text style={styles.adminBtnText}>Admin</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              accessibilityLabel="Sair"
            >
              <Icon name="log-out-outline" size={22} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notificação / Status do Servidor */}
        <View style={styles.statusBox}>
          <Icon name="information-circle-outline" size={18} color={Colors.primary} />
          {isLoadingMsg ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.statusText}>{serverMessage || 'Conectado ao sistema FutFoto'}</Text>
          )}
        </View>

        {/* Busca */}
        <Input
          placeholder="Buscar jogador ou clube..."
          icon="search-outline"
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchContainer}
        />

        {/* Filtros rápidos por raridade */}
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
            {(['all', 'gold', 'silver', 'legendary'] as const).map((rarity) => (
              <TouchableOpacity
                key={rarity}
                style={[
                  styles.filterChip,
                  selectedFilter === rarity && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(rarity)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === rarity && styles.filterChipTextActive,
                  ]}
                >
                  {rarity === 'all' ? 'Todos' : rarity.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista de Cards */}
        <View style={styles.listContainer}>
          <List
            data={filteredCards}
            emptyMessage="Nenhum jogador encontrado com esses filtros."
            renderItem={({ item }) => (
              <Card card={item} onPress={() => handleCardPress(item)} />
            )}
          />
        </View>
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
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  adminBtnText: {
    color: Colors.accent,
    fontWeight: '700',
    fontSize: 13,
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
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  searchContainer: {
    marginBottom: 12,
  },
  filterWrapper: {
    marginBottom: 12,
  },
  filterList: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
});
