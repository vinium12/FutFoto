import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { initNotifications } from '@/notifications';
import { initSqliteDatabase } from '@/database';

export default function RootLayout() {
  useEffect(() => {
    // Base de dados local (expo-sqlite) e notificações apenas no Mobile
    if (Platform.OS !== 'web') {
      initSqliteDatabase().catch((err) => {
        console.warn('[RootLayout] Não foi possível inicializar SQLite:', err);
      });
      initNotifications(true).catch((err) => {
        console.warn('[RootLayout] Não foi possível inicializar notificações:', err);
      });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(auth)/index" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(app)" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
