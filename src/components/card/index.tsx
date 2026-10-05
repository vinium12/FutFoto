import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { CardItem } from '@/data/futfoto';

interface CardProps {
  card: CardItem;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ card, onPress }) => {
  const getRarityColor = (rarity: CardItem['rarity']) => {
    return colors.card[rarity] || colors.primary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.container, { borderColor: getRarityColor(card.rarity) }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.overallBadge}>
          <Text style={styles.overallText}>{card.overall}</Text>
          <Text style={styles.positionText}>{card.position}</Text>
        </View>
        <Text style={[styles.rarityBadge, { color: getRarityColor(card.rarity) }]}>
          {card.rarity.toUpperCase()}
        </Text>
      </View>

      <Image source={{ uri: card.imageUrl }} style={styles.image} resizeMode="cover" />

      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>{card.name}</Text>
        <Text style={styles.club} numberOfLines={1}>{card.club}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{card.stats.pac}</Text>
            <Text style={styles.statLabel}>PAC</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{card.stats.sho}</Text>
            <Text style={styles.statLabel}>SHO</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{card.stats.pas}</Text>
            <Text style={styles.statLabel}>PAS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{card.stats.dri}</Text>
            <Text style={styles.statLabel}>DRI</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{card.stats.def}</Text>
            <Text style={styles.statLabel}>DEF</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{card.stats.phy}</Text>
            <Text style={styles.statLabel}>PHY</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  overallBadge: {
    alignItems: 'center',
  },
  overallText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  rarityBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  image: {
    width: '100%',
    height: 180,
  },
  footer: {
    padding: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  club: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
