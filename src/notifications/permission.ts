import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Solicita a permissão do usuário para envio de notificações.
 * Trata Android 13+ (POST_NOTIFICATIONS) e iOS.
 * No ambiente Web retorna falso para evitar falhas silenciosas.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('[Notifications] Erro ao solicitar permissão:', error);
    return false;
  }
}

/**
 * Verifica se a permissão de notificação já foi concedida previamente.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Notifications] Erro ao verificar permissão:', error);
    return false;
  }
}
