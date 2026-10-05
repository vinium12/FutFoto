import React from 'react';
import {
  TouchableNativeFeedback,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ButtonProps } from './types';
import { Colors } from '@/constants/colors';

const ButtonAndroid: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  disabled,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.btnSecondary;
      case 'outline':
        return styles.btnOutline;
      case 'danger':
        return styles.btnDanger;
      default:
        return styles.btnPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <View style={[styles.container, (isLoading || disabled) && styles.btnDisabled]}>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={isLoading || disabled}
        onPress={onPress}
        style={[styles.button, getVariantStyle(), style]}
        {...rest}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.text} />
        ) : (
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 6,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 3,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    elevation: 0,
  },
  btnDanger: {
    backgroundColor: Colors.danger,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: Colors.primary,
  },
});

export default ButtonAndroid;
