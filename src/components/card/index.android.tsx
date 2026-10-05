import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CardProps } from './types';
import { Colors } from '@/constants/colors';

const CardAndroid: React.FC<CardProps> = ({ match, onPress, onDelete, onShare }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.imageWrapper}>
        {match.photoUri ? (
          <Image source={{ uri: match.photoUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={40} color={Colors.textMuted} />
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {match.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{match.playerName}</Text>
            <Text style={styles.position}>{match.position}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statText}>⚽ {match.goals} {match.goals === 1 ? 'Gol' : 'Gols'}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>🎯 {match.assists} Ast</Text>
          </View>
          {match.yellowCards > 0 && (
            <View style={[styles.statPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={[styles.statText, { color: Colors.accent }]}>🟨 {match.yellowCards}</Text>
            </View>
          )}
        </View>

        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={14} color={Colors.primary} />
          <Text style={styles.locText} numberOfLines={1}>
            {match.location.addressName || 'Campo Local'} • {match.location.city || ''}
          </Text>
        </View>

        {onShare && (
          <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
            <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
            <Text style={styles.shareText}>Compartilhar Estatísticas</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
    height: 180,
    backgroundColor: Colors.surfaceLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  ratingText: {
    color: Colors.accent,
    fontWeight: '800',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  position: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statPill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locText: {
    color: Colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  shareText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default CardAndroid;
