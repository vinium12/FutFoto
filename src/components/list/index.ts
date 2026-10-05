import { Platform } from 'react-native';
import { CustomListProps } from './types';

import ListAndroid from './index.android';
import ListIOS from './index.ios';
import ListWeb from './index.web';

const ListImplementation = Platform.select({
  ios: ListIOS,
  android: ListAndroid,
  web: ListWeb,
  default: ListAndroid,
}) as <T>(props: CustomListProps<T>) => any;

export { ListImplementation as List };
export * from './types';
export default ListImplementation;
