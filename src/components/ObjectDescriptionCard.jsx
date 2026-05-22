/**
 * NutriVision AI — Object Description Card
 * Shown when the scanned item is not a food item.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function ObjectDescriptionCard({ item, description, summary }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔍</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Object Identified</Text>
          <Text style={styles.subtitle}>This is not a food item</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Object name */}
      <View style={styles.nameRow}>
        <Text style={styles.nameLabel}>Detected:</Text>
        <Text style={styles.nameValue}>
          {item === 'unknown' ? 'Unknown Object' : item}
        </Text>
      </View>

      {/* Description */}
      {description ? (
        <View style={styles.descSection}>
          <Text style={styles.descLabel}>📝 Description</Text>
          <Text style={styles.descText}>{description}</Text>
        </View>
      ) : null}

      {/* Summary */}
      {summary && summary !== 'Not a food item' ? (
        <View style={styles.summarySection}>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      ) : null}

      {/* Hint */}
      <View style={styles.hintWrap}>
        <Text style={styles.hintText}>
          💡 Try scanning a fruit, vegetable, or food item for nutrition info
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF980015',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: { fontSize: 24 },
  headerText: { flex: 1 },
  title: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.caption,
    color: '#FF9800',
    fontWeight: TYPOGRAPHY.medium,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nameLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    marginRight: SPACING.sm,
  },
  nameValue: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  descSection: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  descLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  descText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  summarySection: { marginBottom: SPACING.md },
  summaryText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  hintWrap: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  hintText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
});
