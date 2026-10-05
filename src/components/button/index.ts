import React from 'react';
import { Platform } from 'react-native';
import { ButtonProps } from './types';

import ButtonAndroid from './index.android';
import ButtonIOS from './index.ios';
import ButtonWeb from './index.web';

const ButtonImplementation = Platform.select({
  ios: ButtonIOS,
  android: ButtonAndroid,
  web: ButtonWeb,
  default: ButtonWeb,
}) as React.FC<ButtonProps>;

export { ButtonImplementation as Button };
export * from './types';
export default ButtonImplementation;
