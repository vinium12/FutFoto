import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { initNotifications } from '@/notifications';

export default function RootLayout() {
  useEffect(() => {
    initNotifications(true).catch((err) => {
      console.warn('[RootLayout] Não foi possível inicializar notificações:', err);
    });
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
