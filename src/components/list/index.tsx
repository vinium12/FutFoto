import React from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';

interface CustomListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function List<T>({
  data,
  renderItem,
  emptyMessage = 'Nenhum item encontrado',
  isLoading = false,
  ...rest
}: CustomListProps<T>) {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={[
        styles.listContent,
        data.length === 0 && styles.emptyListContent,
      ]}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
