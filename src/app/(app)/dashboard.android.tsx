import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMessage, logout } from '@/integration/authIntegration';

export default function Dashboard() {
  const router = useRouter();
  const { auth, setAuth } = useAuth();

  const isAdmin = !!auth?.roles?.some(
    (role) => (typeof role === 'string' ? role : role.name) === 'ROLE_ADMIN' || (typeof role === 'string' ? role : role.name) === 'admin'
  );

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    fetchMessage();
  }, []);

  async function fetchMessage() {
    setError('');
    setIsLoading(true);

    try {
      const data = await getMessage();
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar mensagem do servidor');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTakePickPhoto() {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'É necessário permitir o acesso à câmera para tirar fotos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        Alert.alert('Sucesso', 'Foto capturada com sucesso!');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  }

  async function handlePickFromGallery() {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'É necessário permitir o acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        Alert.alert('Sucesso', 'Foto selecionada da galeria!');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível selecionar foto da galeria.');
    }
  }

  async function handleLogout() {
    Alert.alert('Sair da Conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            setAuth(null);
            router.replace('/(auth)');
          } catch (err) {
            Alert.alert('Erro', 'Falha ao deslogar.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack.Screen options={{ title: 'FutFoto Dashboard', headerShown: false }} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header com Perfil e Ação de Sair */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo,</Text>
            <Text style={styles.userName}>{auth?.user?.name || 'Jogador'}</Text>
            {isAdmin && <Text style={styles.adminBadge}>ADMINISTRADOR</Text>}
          </View>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={Colors.danger} />
            ) : (
              <Ionicons name="log-out-outline" size={24} color={Colors.danger} />
            )}
          </Pressable>
        </View>

        {/* Mensagem da Integração */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Status do Sistema</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 8 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.messageText}>{message}</Text>
          )}
        </View>

        {/* Área de Câmera / Foto */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Capturar / Selecionar Foto</Text>
          </View>

          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <Pressable
                style={styles.removePhotoButton}
                onPress={() => setPhotoUri(null)}
              >
                <Ionicons name="close-circle" size={28} color={Colors.danger} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.placeholderText}>Nenhuma foto selecionada ainda</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, styles.btnPrimary]} onPress={handleTakePickPhoto}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
              <Text style={styles.btnText}>Tirar Foto</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.btnSecondary]} onPress={handlePickFromGallery}>
              <Ionicons name="images" size={18} color={Colors.text} />
              <Text style={[styles.btnText, { color: Colors.text }]}>Galeria</Text>
            </Pressable>
          </View>
        </View>

        {/* Botão de Painel Admin se tiver permissão */}
        {isAdmin && (
          <Pressable
            style={styles.adminCard}
            onPress={() => router.push('/(app)/admin')}
          >
            <Ionicons name="shield-checkmark" size={24} color={Colors.accent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.adminCardTitle}>Painel Administrativo</Text>
              <Text style={styles.adminCardDesc}>Gerencie fotos, usuários e permissões</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </Pressable>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
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
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  messageText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
  },
  placeholderContainer: {
    height: 160,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
  photoPreviewContainer: {
    position: 'relative',
    height: 200,
    marginBottom: 14,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginTop: 8,
  },
  adminCardTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  adminCardDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
