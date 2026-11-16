import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface SendNotificationParams {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  seconds?: number; // Se informado > 0, agenda para daqui a X segundos
  channelId?: string; // ID do canal no Android (ex: 'matches' ou 'general')
}

/**
 * Dispara uma notificação local imediatamente ou após um intervalo em segundos.
 * Retorna o ID da notificação agendada ou null caso não seja possível enviar.
 */
export async function sendLocalNotification({
  title,
  body,
  data = {},
  seconds = 0,
  channelId = 'matches',
}: SendNotificationParams): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.warn('[Notifications] Notificações locais não são suportadas em navegadores Web.');
    return null;
  }

  try {
    const trigger: Notifications.NotificationTriggerInput =
      seconds > 0
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: false,
          }
        : null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('[Notifications] Erro ao disparar notificação local:', error);
    return null;
  }
}

/**
 * Cancela uma notificação agendada pelo seu identificador.
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error(`[Notifications] Erro ao cancelar notificação ${notificationId}:`, error);
  }
}

/**
 * Cancela todas as notificações pendentes/agendadas.
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications] Erro ao cancelar todas as notificações:', error);
  }
}
