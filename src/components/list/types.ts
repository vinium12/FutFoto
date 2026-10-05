import { FlatListProps } from 'react-native';

export interface CustomListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  emptyMessage?: string;
  isLoading?: boolean;
}
