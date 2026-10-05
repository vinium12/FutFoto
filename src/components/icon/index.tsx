import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export type IconName = keyof typeof Ionicons.glyphMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = colors.text,
}) => {
  return <Ionicons name={name} size={size} color={color} />;
};
