import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { formatTimestamp, getConfidenceLevel } from '../utils/helpers';
import { useAppTheme } from '../hooks/useAppTheme';

export default function HistoryCard({ entry, onPress, onDelete }) {
  const { colors } = useAppTheme();
  const level = getConfidenceLevel(entry.confidence || 0);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]} onPress={onPress} activeOpacity={0.7}>
      {entry.imageUri ? (
        <Image source={{ uri: entry.imageUri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.primarySurface }]}>
          <Text style={styles.thumbEmoji}>🍎</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{entry.item || 'Unknown'}</Text>
        <Text style={[styles.time, { color: colors.textTertiary }]}>{formatTimestamp(entry.timestamp)}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: level.color + '18' }]}>
        <Text style={[styles.badgeText, { color: level.color }]}>
          {Math.round((entry.confidence || 0) * 100)}%
        </Text>
      </View>
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  thumb: { width: 50, height: 50, borderRadius: RADIUS.md },
  thumbPlaceholder: { backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 24 },
  info: { flex: 1, marginLeft: SPACING.md },
  name: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.textPrimary, textTransform: 'capitalize' },
  time: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, marginRight: SPACING.xs },
  badgeText: { fontSize: TYPOGRAPHY.caption, fontWeight: TYPOGRAPHY.bold },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 16 },
});
