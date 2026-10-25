import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/icon';
import { Button } from '@/components/button';
import { showCustomAlert } from '@/components/alert';

export default function AdminScreen() {
  const router = useRouter();
  const { auth } = useAuth();

  const [stats] = useState({
    totalUsers: 142,
    totalPhotos: 859,
    storageUsed: '3.4 GB',
    activeMatches: 12,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Painel Admin', headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/dashboard'))}>
            <Icon name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title}>Painel Administrativo</Text>
            <Text style={styles.subtitle}>Controle geral do FutFoto</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Cards de Métricas */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Icon name="people-outline" size={28} color={Colors.primary} />
              <Text style={styles.metricValue}>{stats.totalUsers}</Text>
              <Text style={styles.metricLabel}>Usuários Cadastrados</Text>
            </View>

            <View style={styles.metricCard}>
              <Icon name="images-outline" size={28} color={Colors.secondary} />
              <Text style={styles.metricValue}>{stats.totalPhotos}</Text>
              <Text style={styles.metricLabel}>Fotos Enviadas</Text>
            </View>

            <View style={styles.metricCard}>
              <Icon name="server-outline" size={28} color={Colors.accent} />
              <Text style={styles.metricValue}>{stats.storageUsed}</Text>
              <Text style={styles.metricLabel}>Armazenamento</Text>
            </View>

            <View style={styles.metricCard}>
              <Icon name="football-outline" size={28} color={Colors.success} />
              <Text style={styles.metricValue}>{stats.activeMatches}</Text>
              <Text style={styles.metricLabel}>Partidas Ativas</Text>
            </View>
          </View>

          {/* Seção de Ações Rápidas do Admin */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações de Gerenciamento</Text>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => showCustomAlert('Usuários', 'Módulo de moderação de usuários')}
            >
              <Icon name="person-circle-outline" size={24} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.actionItemTitle}>Gerenciar Usuários</Text>
                <Text style={styles.actionItemDesc}>Alterar papéis, banir ou redefinir senhas</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => showCustomAlert('Fotos', 'Módulo de moderação de fotos')}
            >
              <Icon name="image-outline" size={24} color={Colors.secondary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.actionItemTitle}>Moderação de Fotos</Text>
                <Text style={styles.actionItemDesc}>Aprovar ou rejeitar fotos enviadas</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => showCustomAlert('Configurações', 'Módulo de configuração do servidor')}
            >
              <Icon name="settings-outline" size={24} color={Colors.accent} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.actionItemTitle}>Configurações da API</Text>
                <Text style={styles.actionItemDesc}>Ajustar endpoints e chaves de integração</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Button
            title="Voltar ao Dashboard"
            variant="secondary"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/dashboard'))}
            style={{ marginTop: 20 }}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    paddingBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  actionItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  actionItemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
