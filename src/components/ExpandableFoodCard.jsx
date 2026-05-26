/**
 * VitaNova — Premium Expandable Food Card
 * Apple Health-inspired animated nutrition card with glassmorphism design.
 */
import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, LayoutAnimation,
  Platform, UIManager, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { NUTRITION_GUIDANCE } from '../data/nutritionGuidanceDB';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SPRING_CONFIG = {
  duration: 350,
  update: { type: LayoutAnimation.Types.spring, springDamping: 0.82 },
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

const CATEGORY_ICONS = {
  fruit: '🍎', vegetable: '🥦', grain: '🌾', protein: '🥩', dairy: '🥛', nut: '🥜',
};

const FREQUENCY_CONFIG = {
  daily: { label: 'Daily', emoji: '✅', color: '#10B981', bg: '#10B98118' },
  weekly: { label: '2-3x/Week', emoji: '📅', color: '#3B82F6', bg: '#3B82F618' },
  monthly: { label: 'Occasionally', emoji: '📆', color: '#8B5CF6', bg: '#8B5CF618' },
  moderate: { label: 'In Moderation', emoji: '⚖️', color: '#F59E0B', bg: '#F59E0B18' },
};

const GOAL_TAGS = {
  weight_loss: { label: 'Weight Loss', icon: '🏃', color: '#10B981' },
  muscle_gain: { label: 'Muscle Gain', icon: '💪', color: '#3B82F6' },
  immunity: { label: 'Immunity', icon: '🛡️', color: '#F59E0B' },
  digestion: { label: 'Digestion', icon: '🫃', color: '#8B5CF6' },
  heart_health: { label: 'Heart Health', icon: '❤️', color: '#EF4444' },
  skin_health: { label: 'Skin Health', icon: '✨', color: '#EC4899' },
  bone_health: { label: 'Bone Health', icon: '🦴', color: '#64748B' },
  energy: { label: 'Energy', icon: '⚡', color: '#F59E0B' },
  brain_health: { label: 'Brain Health', icon: '🧠', color: '#6366F1' },
  eye_health: { label: 'Eye Health', icon: '👁️', color: '#14B8A6' },
  hydration: { label: 'Hydration', icon: '💧', color: '#0EA5E9' },
};

function ExpandableFoodCard({ food, index = 0 }) {
  const { isDark, colors } = useAppTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  const foodKey = food.name?.toLowerCase().replace(/\s+/g, '_').replace(/\(.*\)/, '').trim() ||
    Object.keys(NUTRITION_GUIDANCE).find(k => food.name?.toLowerCase().includes(k)) || '';
  const guidance = NUTRITION_GUIDANCE[foodKey] || null;
  const freq = guidance?.frequency ? FREQUENCY_CONFIG[guidance.frequency] : null;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true, delay: index * 60 }).start();
  }, []);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(SPRING_CONFIG);
    const next = !expanded;
    setExpanded(next);
    Animated.parallel([
      Animated.spring(arrowAnim, { toValue: next ? 1 : 0, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: next ? 1 : 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [expanded]);

  const arrowRotate = arrowAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const catIcon = CATEGORY_ICONS[food.category] || '🍽️';

  const healthScore = guidance?.healthScore || Math.min(10, Math.max(1, (10 - food.calories / 70 + food.fiber * 0.8 + food.protein * 0.3)));
  const scoreColor = healthScore >= 8 ? '#10B981' : healthScore >= 5 ? '#F59E0B' : '#EF4444';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={toggleExpand}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(21, 31, 50, 0.85)' : 'rgba(255, 255, 255, 0.82)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
          },
        ]}
      >
        {/* Header Row */}
        <View style={styles.header}>
          <Text style={styles.catIcon}>{catIcon}</Text>
          <View style={styles.headerInfo}>
            <Text style={[styles.foodName, { color: colors.textPrimary }]}>{food.name}</Text>
            <Text style={[styles.category, { color: colors.textTertiary }]}>
              {food.category?.charAt(0).toUpperCase() + food.category?.slice(1)} • per 100g
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.calBadge, { backgroundColor: isDark ? '#EF444425' : '#EF444412' }]}>  
              <Text style={styles.calValue}>{food.calories}</Text>
              <Text style={styles.calUnit}>kcal</Text>
            </View>
            <Animated.Text style={[styles.arrow, { color: colors.textTertiary, transform: [{ rotate: arrowRotate }] }]}>
              ▼
            </Animated.Text>
          </View>
        </View>

        {/* Macro Pills */}
        <View style={styles.macroRow}>
          <MacroPill label="Protein" value={food.protein} color={colors.primary} isDark={isDark} />
          <MacroPill label="Carbs" value={food.carbs} color={COLORS.warning} isDark={isDark} />
          <MacroPill label="Fats" value={food.fats} color={COLORS.accent} isDark={isDark} />
          <MacroPill label="Fiber" value={food.fiber} color={COLORS.success} isDark={isDark} />
        </View>

        {/* Frequency Badge (always visible) */}
        {freq && (
          <View style={[styles.freqBadge, { backgroundColor: freq.bg }]}>
            <Text style={styles.freqEmoji}>{freq.emoji}</Text>
            <Text style={[styles.freqLabel, { color: freq.color }]}>{freq.label}</Text>
          </View>
        )}

        {/* EXPANDED CONTENT */}
        {expanded && (
          <Animated.View style={[styles.expandedWrap, { opacity: fadeAnim }]}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Health Score */}
            <View style={styles.scoreSection}>
              <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>HEALTH SCORE</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreTrack, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <View style={[styles.scoreFill, { width: `${healthScore * 10}%`, backgroundColor: scoreColor }]} />
                </View>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>{healthScore.toFixed(1)}/10</Text>
              </View>
            </View>

            {/* Recommended Quantity */}
            {(guidance?.recommendedQty || food.recommendedQty) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📏</Text>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>RECOMMENDED QUANTITY</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {guidance?.recommendedQty || food.recommendedQty}
                  </Text>
                </View>
              </View>
            )}

            {/* Best Time */}
            {(guidance?.bestTime || food.bestTime) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>⏰</Text>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>BEST TIME TO EAT</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {guidance?.bestTime || food.bestTime}
                  </Text>
                </View>
              </View>
            )}

            {/* Health Benefits */}
            {guidance?.benefits && guidance.benefits.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>HEALTH BENEFITS</Text>
                {guidance.benefits.map((b, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <Text style={styles.benefitIcon}>{b.icon || '✅'}</Text>
                    <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{b.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Fallback benefits text */}
            {!guidance?.benefits && food.benefits && (
              <View style={styles.benefitsSection}>
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>HEALTH BENEFITS</Text>
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{food.benefits}</Text>
              </View>
            )}

            {/* Overconsumption Warning */}
            {guidance?.overconsumptionWarning && (
              <View style={[styles.warningBox, {
                backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
                borderColor: isDark ? 'rgba(239,68,68,0.25)' : '#FECACA',
              }]}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.warningLabel, { color: isDark ? '#F87171' : '#B91C1C' }]}>Avoid Excess</Text>
                  <Text style={[styles.warningText, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
                    {guidance.overconsumptionWarning}
                  </Text>
                </View>
              </View>
            )}

            {/* Suitable For Tags */}
            {guidance?.suitableFor && guidance.suitableFor.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PERFECT FOR</Text>
                <View style={styles.tagsWrap}>
                  {guidance.suitableFor.map((goal, i) => {
                    const tag = GOAL_TAGS[goal];
                    if (!tag) return null;
                    return (
                      <View key={i} style={[styles.goalTag, { backgroundColor: tag.color + '15' }]}>
                        <Text style={styles.goalTagIcon}>{tag.icon}</Text>
                        <Text style={[styles.goalTagLabel, { color: tag.color }]}>{tag.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Vitamins & Hydration Row */}
            <View style={styles.metaRow}>
              {food.hydration > 0 && (
                <View style={[styles.metaChip, { backgroundColor: isDark ? '#0EA5E915' : '#E0F2FE' }]}>
                  <Text style={styles.metaChipIcon}>💧</Text>
                  <Text style={[styles.metaChipText, { color: '#0EA5E9' }]}>{food.hydration}% water</Text>
                </View>
              )}
              {food.vitamins?.slice(0, 2).map((v, i) => (
                <View key={i} style={[styles.metaChip, { backgroundColor: isDark ? '#8B5CF615' : '#F5F3FF' }]}>
                  <Text style={styles.metaChipIcon}>💊</Text>
                  <Text style={[styles.metaChipText, { color: '#8B5CF6' }]}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
                onPress={() => router.push({ pathname: '/(tabs)/assistant', params: { query: `Tell me about ${food.name}` } })}
              >
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>🤖 Ask AI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.accent + '15' }]}
                onPress={() => {
                  router.push({
                    pathname: '/nutrition-details',
                    params: { data: JSON.stringify({ item: food.name, confidence: 1, summary: food.benefits, nutritionSnapshot: food }) }
                  });
                }}
              >
                <Text style={[styles.actionBtnText, { color: COLORS.accent }]}>📊 Details</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const MacroPill = memo(({ label, value, color, isDark }) => (
  <View style={[styles.pill, { backgroundColor: color + (isDark ? '20' : '12') }]}>
    <Text style={[styles.pillLabel, { color }]}>{label}</Text>
    <Text style={[styles.pillValue, { color }]}>{value}g</Text>
  </View>
));

export default memo(ExpandableFoodCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  catIcon: { fontSize: 28 },
  headerInfo: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: '700' },
  category: { fontSize: 10, marginTop: 1 },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  calBadge: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.md },
  calValue: { fontSize: 14, fontWeight: '800', color: COLORS.error },
  calUnit: { fontSize: 9, fontWeight: '600', color: COLORS.error, marginLeft: 2 },
  arrow: { fontSize: 10 },
  macroRow: { flexDirection: 'row', gap: 6, marginTop: SPACING.sm },
  pill: { flex: 1, alignItems: 'center', paddingVertical: 4, borderRadius: RADIUS.md },
  pillLabel: { fontSize: 9, fontWeight: '600' },
  pillValue: { fontSize: 12, fontWeight: '800' },
  freqBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: SPACING.sm, gap: 4,
  },
  freqEmoji: { fontSize: 12 },
  freqLabel: { fontSize: 11, fontWeight: '700' },
  expandedWrap: { marginTop: SPACING.sm },
  divider: { height: 1, marginBottom: SPACING.md },
  scoreSection: { marginBottom: SPACING.md },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  scoreBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  scoreTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  scoreFill: { height: 6, borderRadius: 3 },
  scoreValue: { fontSize: 13, fontWeight: '800', width: 48, textAlign: 'right' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  infoIcon: { fontSize: 18, marginTop: 1 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  infoValue: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  benefitsSection: { marginBottom: SPACING.md },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  benefitIcon: { fontSize: 14 },
  benefitText: { fontSize: 12, lineHeight: 18, flex: 1 },
  warningBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.md,
  },
  warningIcon: { fontSize: 16, marginTop: 1 },
  warningLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  warningText: { fontSize: 11, lineHeight: 16 },
  tagsSection: { marginBottom: SPACING.md },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  goalTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, gap: 4 },
  goalTagIcon: { fontSize: 12 },
  goalTagLabel: { fontSize: 10, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  metaChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, gap: 4 },
  metaChipIcon: { fontSize: 11 },
  metaChipText: { fontSize: 10, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.md, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
});
