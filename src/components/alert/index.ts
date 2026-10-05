import React from 'react';
import { Platform } from 'react-native';
import { AlertProps } from './types';

import AlertAndroid from './index.android';
import AlertIOS from './index.ios';
import AlertWeb from './index.web';

const AlertImplementation = Platform.select({
  ios: AlertIOS,
  android: AlertAndroid,
  web: AlertWeb,
  default: AlertWeb,
}) as React.FC<AlertProps>;

export { AlertImplementation as Alert };
export * from './types';

// Helper utilitário para invocar alertas programaticamente
export const showCustomAlert = (
  title: string,
  message?: string,
  buttons?: { text?: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[],
  _type: 'success' | 'error' | 'info' | 'warning' = 'info'
) => {
  if (Platform.OS === 'web') {
    const textMsg = message ? `${title}\n\n${message}` : title;
    const confirmed = window.confirm(textMsg);
    if (confirmed && buttons && buttons.length > 0) {
      const confirmAction = buttons.find((b) => b.style !== 'cancel') || buttons[0];
      confirmAction?.onPress?.();
    } else if (!confirmed && buttons) {
      const cancelAction = buttons.find((b) => b.style === 'cancel');
      cancelAction?.onPress?.();
    }
  } else {
    const { Alert: RNAlert } = require('react-native');
    RNAlert.alert(
      title,
      message,
      buttons?.map((b) => ({
        text: b.text,
        onPress: b.onPress,
        style: b.style,
      }))
    );
  }
};
