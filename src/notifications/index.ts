import { setupNotificationHandler } from './handler';
import { setupDefaultChannels, createNotificationChannel } from './channel';
import { requestNotificationPermission, hasNotificationPermission } from './permission';

export * from './channel';
export * from './permission';
export * from './handler';
export * from './schedule';
export * from './listeners';

/**
 * Inicialização completa do sistema de notificações do aplicativo.
 * Configura o handler de primeiro plano, registra os canais padrão do Android
 * e, opcionalmente, já solicita a permissão ao usuário.
 */
export async function initNotifications(autoRequestPermission: boolean = false): Promise<boolean> {
  // 1. Configura manipulador de primeiro plano
  setupNotificationHandler();

  // 2. Configura canais do Android
  await setupDefaultChannels();

  // 3. Solicita permissão se solicitado
  if (autoRequestPermission) {
    return await requestNotificationPermission();
  }

  return await hasNotificationPermission();
}
