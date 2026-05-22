import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { getConfidenceLevel } from '../utils/helpers';

export default function ScanResultCard({ item, confidence, summary }) {
  const level = getConfidenceLevel(confidence);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔍</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.itemName}>{item}</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: level.color + '20' }]}>
          <Text style={[styles.badgeText, { color: level.color }]}>
            {Math.round(confidence * 100)}%
          </Text>
          <Text style={[styles.badgeLabel, { color: level.color }]}>{level.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.accentSurface, alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  headerText: { flex: 1, marginLeft: SPACING.md },
  itemName: { fontSize: TYPOGRAPHY.h4, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, textTransform: 'capitalize' },
  summary: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  badge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.md },
  badgeText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold },
  badgeLabel: { fontSize: TYPOGRAPHY.tiny },
});
