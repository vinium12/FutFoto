import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export type NotificationReceivedCallback = (notification: Notifications.Notification) => void;
export type NotificationResponseCallback = (response: Notifications.NotificationResponse) => void;

/**
 * Registra ouvintes para eventos de notificações.
 * Retorna uma função de cancelamento para limpar as inscrições.
 */
export function registerNotificationListeners(
  onReceived?: NotificationReceivedCallback,
  onResponse?: NotificationResponseCallback
): () => void {
  const receivedSubscription = onReceived
    ? Notifications.addNotificationReceivedListener(onReceived)
    : null;

  const responseSubscription = onResponse
    ? Notifications.addNotificationResponseReceivedListener(onResponse)
    : null;

  return () => {
    receivedSubscription?.remove();
    responseSubscription?.remove();
  };
}

/**
 * Hook React para observar notificações recebidas e cliques no aplicativo.
 */
export function useNotificationObserver(
  onReceived?: NotificationReceivedCallback,
  onResponse?: NotificationResponseCallback
): void {
  useEffect(() => {
    const unsubscribe = registerNotificationListeners(onReceived, onResponse);
    return () => {
      unsubscribe();
    };
  }, [onReceived, onResponse]);
}
