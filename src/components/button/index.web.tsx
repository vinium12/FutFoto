import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ButtonProps } from './types';
import { Colors } from '@/constants/colors';

const ButtonWeb: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  disabled,
  style,
  textStyle,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);

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
    <TouchableOpacity
      activeOpacity={0.85}
      // @ts-ignore
      onMouseEnter={() => setIsHovered(true)}
      // @ts-ignore
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading || disabled}
      style={[
        styles.button,
        getVariantStyle(),
        isHovered && !disabled && !isLoading && styles.btnHover,
        (isLoading || disabled) && styles.btnDisabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.text} />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
    cursor: 'pointer',
    transitionDuration: '150ms',
    transitionProperty: 'all',
  } as any,
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
  },
  btnDanger: {
    backgroundColor: Colors.danger,
  },
  btnHover: {
    opacity: 0.9,
    transform: [{ translateY: -1 }],
  } as any,
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as any,
  text: {
    fontSize: 15,
    fontWeight: '700',
    userSelect: 'none',
  } as any,
  textPrimary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: Colors.primary,
  },
});

export default ButtonWeb;
