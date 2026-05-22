import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function NutritionCard({ data }) {
  if (!data) return null;

  const macros = [
    { label: 'Calories', value: `${data.calories}`, unit: 'kcal', color: COLORS.error, pct: Math.min(data.calories / 500, 1) },
    { label: 'Protein', value: `${data.protein}`, unit: 'g', color: COLORS.primary, pct: Math.min(data.protein / 30, 1) },
    { label: 'Carbs', value: `${data.carbs}`, unit: 'g', color: COLORS.warning, pct: Math.min(data.carbs / 50, 1) },
    { label: 'Fats', value: `${data.fats}`, unit: 'g', color: COLORS.accent, pct: Math.min(data.fats / 20, 1) },
    { label: 'Fiber', value: `${data.fiber}`, unit: 'g', color: COLORS.success, pct: Math.min(data.fiber / 10, 1) },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Nutrition Facts</Text>
      <Text style={styles.subtitle}>Per 100g serving</Text>
      {macros.map((m) => (
        <View key={m.label} style={styles.row}>
          <Text style={styles.label}>{m.label}</Text>
          <View style={styles.barWrap}>
            <View style={[styles.bar, { width: `${m.pct * 100}%`, backgroundColor: m.color }]} />
          </View>
          <Text style={[styles.value, { color: m.color }]}>{m.value}<Text style={styles.unit}>{m.unit}</Text></Text>
        </View>
      ))}
      {data.vitamins?.length > 0 && (
        <View style={styles.tagsRow}>
          <Text style={styles.tagsLabel}>Vitamins: </Text>
          {data.vitamins.map((v) => (
            <View key={v} style={styles.tag}><Text style={styles.tagText}>{v}</Text></View>
          ))}
        </View>
      )}
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
  title: { fontSize: TYPOGRAPHY.h4, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  label: { width: 60, fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  barWrap: { flex: 1, height: 8, backgroundColor: COLORS.surfaceAlt, borderRadius: 4, marginHorizontal: SPACING.sm, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
  value: { width: 55, textAlign: 'right', fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.semiBold },
  unit: { fontSize: TYPOGRAPHY.tiny, fontWeight: TYPOGRAPHY.regular, color: COLORS.textTertiary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: SPACING.md },
  tagsLabel: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary },
  tag: { backgroundColor: COLORS.primarySurface, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, marginRight: 4, marginBottom: 4 },
  tagText: { fontSize: TYPOGRAPHY.tiny, color: COLORS.primaryDark },
});
