import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InputProps } from './types';
import { Colors } from '@/constants/colors';

const InputWeb: React.FC<InputProps> = ({
  label,
  error,
  icon,
  containerStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={18}
              color={isFocused ? Colors.primary : Colors.textSecondary}
            />
          </View>
        )}
        <TextInput
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  } as any,
  inputFocused: {
    borderColor: Colors.primary,
    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
  } as any,
  inputError: {
    borderColor: Colors.danger,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    height: '100%',
    outlineStyle: 'none',
  } as any,
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputWeb;
