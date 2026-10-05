import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CardProps } from './types';
import { Colors } from '@/constants/colors';

const CardWeb: React.FC<CardProps> = ({ match, onPress, onDelete, onShare }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'translateY(-3px)' : 'none',
      }}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        style={[styles.container, isHovered && styles.containerHover]}
        onPress={onPress}
      >
        <View style={styles.imageWrapper}>
          {match.photoUri ? (
            <Image source={{ uri: match.photoUri }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="person" size={44} color={Colors.textMuted} />
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
              <Text style={styles.shareText}>Copiar / Compartilhar Súmula</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </div>
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
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  } as any,
  containerHover: {
    borderColor: Colors.primary,
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
  } as any,
  imageWrapper: {
    position: 'relative',
    height: 190,
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
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    cursor: 'pointer',
  } as any,
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
    cursor: 'pointer',
  } as any,
  shareText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default CardWeb;
