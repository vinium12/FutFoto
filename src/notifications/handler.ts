import * as Notifications from 'expo-notifications';

/**
 * Configura como o aplicativo deve se comportar ao receber notificações
 * quando estiver aberto em primeiro plano (foreground).
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
