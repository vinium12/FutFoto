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
  enableVibrate?: boolean;
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
    // Configuração limpa e robusta para evitar NullPointerException na serialização nativa do Android
    const channelInput: Notifications.NotificationChannelInput = {
      name: config.name,
      importance: config.importance ?? Notifications.AndroidImportance.HIGH,
      enableVibrate: config.enableVibrate ?? true,
    };

    if (config.description) {
      channelInput.description = config.description;
    }

    if (config.lightColor) {
      channelInput.lightColor = config.lightColor;
    }

    // Apenas repassa sound se for um arquivo customizado explícito (diferente de 'default')
    if (config.sound && config.sound !== 'default') {
      channelInput.sound = config.sound;
    }

    // Apenas inclui vibrationPattern se fornecido explicitamente para não quebrar em versões nativas do Android
    if (config.vibrationPattern && config.vibrationPattern.length > 0) {
      channelInput.vibrationPattern = config.vibrationPattern;
    }

    return await Notifications.setNotificationChannelAsync(config.id, channelInput);
  } catch (error) {
    console.warn(`[Notifications] Aviso ao criar canal '${config.id}':`, error);
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
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    lightColor: '#00E676',
  });

  // Canal geral do app
  await createNotificationChannel({
    id: 'general',
    name: 'Geral',
    description: 'Notificações informativas do FutFoto',
    importance: Notifications.AndroidImportance.DEFAULT,
    enableVibrate: true,
    lightColor: '#00E676',
  });
}
