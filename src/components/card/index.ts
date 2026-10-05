import React from 'react';
import { Platform } from 'react-native';
import { CardProps } from './types';

import CardAndroid from './index.android';
import CardIOS from './index.ios';
import CardWeb from './index.web';

const CardImplementation = Platform.select({
  ios: CardIOS,
  android: CardAndroid,
  web: CardWeb,
  default: CardWeb,
}) as React.FC<CardProps>;

export { CardImplementation as Card };
export * from './types';
export default CardImplementation;
