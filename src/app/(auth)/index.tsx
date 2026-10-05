import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/integration/authIntegration';
import { Colors } from '@/constants/colors';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { showCustomAlert } from '@/components/alert';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
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
      const authData = await login(email, password);
      setAuth(authData);
      router.replace('/(app)/dashboard');
    } catch (error) {
      showCustomAlert('Erro', 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.cardWrapper}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Icon name="football" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>FutFoto Web</Text>
            <Text style={styles.subtitle}>Gerencie e visualize suas fotos e cards</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="E-mail"
              placeholder="admin@futfoto.com ou usuario@futfoto.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.submitBtn}
            />

            <Button
              title="Entrar como Admin"
              variant="secondary"
              onPress={() => {
                setEmail('admin@futfoto.com');
                setPassword('123456');
              }}
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
    alignItems: 'center',
    padding: 20,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
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
