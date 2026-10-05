import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CustomListProps } from './types';
import { Colors } from '@/constants/colors';

export function ListWeb<T>({
  data,
  renderItem,
  emptyMessage = 'Nenhum item encontrado',
  isLoading = false,
}: CustomListProps<T>) {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <div style={styles.gridContainer as any}>
      {data.map((item, index) => (
        <div key={index} style={{ width: '100%' }}>
          {renderItem({ item, index })}
        </div>
      ))}
    </div>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    width: '100%',
    paddingBottom: 24,
  } as any,
  centerContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default ListWeb;
