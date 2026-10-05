import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { showCustomAlert } from '@/components/alert';

export default function LoginAndroidScreen() {
  const router = useRouter();
  const { auth, isLoading: authLoading, signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      newErrors.username = 'Usuário é obrigatório';
    }
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Salva a sessão no contexto; o <Redirect> abaixo leva pro dashboard.
      await signIn(username, password);
    } catch (error) {
      showCustomAlert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Enquanto lê a sessão salva, mostra um loading.
  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Já está logado (sessão salva ou login que acabou de dar certo): vai pro app.
  if (auth) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return (
    <KeyboardAvoidingView
      behavior="height"
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.cardWrapper}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Icon name="football" size={44} color={Colors.primary} />
            </View>
            <Text style={styles.title}>FutFoto Mobile</Text>
            <Text style={styles.subtitle}>Acesse suas fotos e tire fotos direto do celular</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Usuário"
              placeholder="Digite seu usuário"
              autoCapitalize="none"
              autoCorrect={false}
              icon="person-outline"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              error={errors.password}
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>Não tem uma conta? <Text style={styles.registerHighlight}>Cadastre-se</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  cardWrapper: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginTop: 8,
  },
  registerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  registerHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
