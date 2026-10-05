import { Alert as RNAlert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const showCustomAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    // Tratamento para Web
    const confirmed = window.confirm(
      message ? `${title}\n\n${message}` : title
    );
    if (confirmed && buttons && buttons.length > 0) {
      const confirmAction = buttons.find((b) => b.style !== 'cancel') || buttons[0];
      confirmAction?.onPress?.();
    } else if (!confirmed && buttons) {
      const cancelAction = buttons.find((b) => b.style === 'cancel');
      cancelAction?.onPress?.();
    }
  } else {
    // Tratamento para Android e iOS
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
