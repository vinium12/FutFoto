import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface ChannelConfig {
  id: string;
  name: string;
  description?: string;
  importance?: Notifications.AndroidImportance;
  vibrationPattern?: number[];
  lightColor?: string;
  sound?: string | null;
}

/**
 * Cria ou atualiza um canal de notificação específico no Android.
 * No iOS ou Web, a chamada é ignorada de forma segura.
 */
export async function createNotificationChannel(config: ChannelConfig): Promise<Notifications.NotificationChannel | null> {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    return await Notifications.setNotificationChannelAsync(config.id, {
      name: config.name,
      description: config.description,
      importance: config.importance ?? Notifications.AndroidImportance.MAX,
      vibrationPattern: config.vibrationPattern ?? [0, 250, 250, 250],
      lightColor: config.lightColor ?? '#00E676',
      sound: config.sound ?? 'default',
    });
  } catch (error) {
    console.error(`[Notifications] Erro ao criar canal '${config.id}':`, error);
    return null;
  }
}

/**
 * Configura os canais padrão utilizados pelo FutFoto no Android.
 */
export async function setupDefaultChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  // Canal para partidas e estatísticas
  await createNotificationChannel({
    id: 'matches',
    name: 'Partidas e Jogos',
    description: 'Avisos sobre cadastro e confirmação de novas partidas',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 300, 200, 300],
    lightColor: '#00E676',
  });

  // Canal geral do app
  await createNotificationChannel({
    id: 'general',
    name: 'Geral',
    description: 'Notificações informativas do FutFoto',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 200],
    lightColor: '#00E676',
  });
}
