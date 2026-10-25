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
import { Colors } from '@/constants/colors';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { showCustomAlert } from '@/components/alert';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !cep.trim() || !password.trim()) {
      showCustomAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      showCustomAlert('Erro', 'As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      // A API cria o usuário e já devolve o cookie de login.
      await signUp(username, password, email, cep);
      router.replace('/(app)/dashboard');
    } catch (error) {
      showCustomAlert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível realizar o cadastro.'
      );
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
              <Icon name="person-add-outline" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Junte-se à comunidade FutFoto</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Usuário"
              placeholder="Escolha um nome de usuário"
              autoCapitalize="none"
              autoCorrect={false}
              icon="person-outline"
              value={username}
              onChangeText={setUsername}
            />

            <Input
              label="E-mail"
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="CEP"
              placeholder="Digite seu CEP"
              keyboardType="numeric"
              icon="location-outline"
              value={cep}
              onChangeText={setCep}
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
            />

            <Input
              label="Confirmar Senha"
              placeholder="••••••••"
              secureTextEntry
              icon="checkmark-circle-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              title="Cadastrar"
              onPress={handleRegister}
              isLoading={isLoading}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)'))}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Já possui uma conta? <Text style={styles.loginHighlight}>Fazer Login</Text></Text>
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
    marginBottom: 24,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginTop: 10,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
