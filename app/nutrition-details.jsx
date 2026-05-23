import React, { useMemo, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProfile } from '../src/providers/ProfileProvider';
import { useNutrition } from '../src/providers/NutritionProvider';
import { useSettings } from '../src/providers/SettingsProvider';
import { useKnowledge } from '../src/providers/KnowledgeProvider';
import { speak } from '../src/services/voiceService';
import NutritionCard from '../src/components/NutritionCard';
import VoiceButton from '../src/components/VoiceButton';
import { getConfidenceLevel } from '../src/utils/helpers';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';
import { useAppTheme } from '../src/hooks/useAppTheme';

export default function NutritionDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useProfile();
  const { getGuidance } = useNutrition();
  const { settings } = useSettings();
  const { queryKnowledge } = useKnowledge();
  const { isDark, colors } = useAppTheme();

  const entry = useMemo(() => {
    try { return JSON.parse(params.data); }
    catch { return null; }
  }, [params.data]);

  const nutrition = entry?.nutritionSnapshot;

  const ragDoc = useMemo(() => {
    if (!entry?.item) return null;
    const docs = queryKnowledge(entry.item, { language: settings.ttsLanguage || 'en', topK: 1 });
    return docs.length > 0 ? docs[0] : null;
  }, [entry?.item, queryKnowledge, settings.ttsLanguage]);

  const guidance = useMemo(() => {
    if (nutrition) return getGuidance(nutrition, profile);
    return null;
  }, [nutrition, profile]);

  const confidence = getConfidenceLevel(entry?.confidence || 0);

  const handleSpeak = useCallback((text) => {
    speak(text, settings.ttsLanguage);
  }, [settings.ttsLanguage]);

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>No data available</Text>
      </SafeAreaView>
    );
  }

  const speechText = ragDoc
    ? `${entry.item}. ${ragDoc.benefits}. Recommended intake is ${ragDoc.recommendedIntake}. Ideal time is ${ragDoc.bestTime}.`
    : nutrition
      ? `${entry.item}. ${nutrition.calories} calories, ${nutrition.protein} grams protein. ${nutrition.benefits}`
      : `${entry.item}. ${entry.summary}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>

        {/* Image */}
        {entry.imageUri && (
          <Image source={{ uri: entry.imageUri }} style={styles.image} resizeMode="cover" />
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemName, { color: colors.textPrimary }]}>{entry.item}</Text>
            <Text style={[styles.summary, { color: colors.textSecondary }]}>{entry.summary}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: confidence.color + '18' }]}>
            <Text style={[styles.badgeText, { color: confidence.color }]}>
              {Math.round((entry.confidence || 0) * 100)}%
            </Text>
          </View>
          <VoiceButton icon="🔊" size={40} onPress={() => handleSpeak(speechText)} />
        </View>

        {/* Caution Card */}
        {ragDoc?.warnings ? (
          <View style={styles.section}>
            <View style={[
              styles.card,
              styles.warningCard,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF7ED',
                borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FED7AA',
                borderWidth: 1,
              }
            ]}>
              <Text style={[styles.warningTitle, { color: isDark ? '#F87171' : '#C2410C' }]}>⚠️ Health Caution & Alert</Text>
              <Text style={[styles.warningText, { color: isDark ? '#FEE2E2' : '#7C2D12' }]}>{ragDoc.warnings}</Text>
            </View>
          </View>
        ) : null}

        {/* RAG-Powered AI Insights Card */}
        {ragDoc ? (
          <View style={styles.section}>
            <View style={[
              styles.card,
              styles.insightCard,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.border : colors.primary + '18',
                borderWidth: 1,
              }
            ]}>
              <View style={styles.insightHeader}>
                <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>🔬 Verified AI Insights</Text>
                <View style={[styles.ragBadge, { backgroundColor: colors.primary + '12' }]}>
                  <Text style={[styles.ragBadgeText, { color: colors.primary }]}>RAG SECURE</Text>
                </View>
              </View>
              <Text style={[styles.cardText, { color: colors.textSecondary }]}>{ragDoc.benefits}</Text>
              
              <View style={[styles.insightRow, { borderTopColor: colors.borderLight }]}>
                <View style={styles.insightMetric}>
                  <Text style={styles.metricIcon}>⏰</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>IDEAL TIME</Text>
                    <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{ragDoc.bestTime || 'Anytime'}</Text>
                  </View>
                </View>
                <View style={styles.insightMetric}>
                  <Text style={styles.metricIcon}>📏</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>RECOMMENDED PORTION</Text>
                    <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{ragDoc.recommendedIntake || 'Moderation'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Standard fallback benefits when RAG isn't matched */
          nutrition?.benefits && (
            <View style={styles.section}>
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>✨ Health Benefits</Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>{nutrition.benefits}</Text>
              </View>
            </View>
          )
        )}

        {/* Nutrition Macros Chart */}
        {nutrition && (
          <View style={styles.section}>
            <NutritionCard data={nutrition} />
          </View>
        )}

        {/* AI Recommendations & Goal-Based Guidance */}
        {guidance && (
          <View style={styles.section}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>🤖 Personalized Advice</Text>
              <Text style={[styles.cardText, { color: colors.textSecondary }]}>{guidance.summary}</Text>
              {guidance.tips?.map((t, i) => (
                <Text key={i} style={[styles.tip, { color: isDark ? colors.primaryLight : colors.primaryDark }]}>💡 {t}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Timing & Quantity (Standard fallback when RAG isn't matched) */}
        {!ragDoc && nutrition && (
          <View style={styles.row}>
            <View style={[styles.miniCard, { flex: 1, marginRight: 8, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={styles.miniIcon}>⏰</Text>
              <Text style={[styles.miniLabel, { color: colors.textTertiary }]}>Best Time</Text>
              <Text style={[styles.miniValue, { color: colors.textPrimary }]}>{nutrition.bestTime}</Text>
            </View>
            <View style={[styles.miniCard, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={styles.miniIcon}>📏</Text>
              <Text style={[styles.miniLabel, { color: colors.textTertiary }]}>Quantity</Text>
              <Text style={[styles.miniValue, { color: colors.textPrimary }]}>{nutrition.recommendedQty}</Text>
            </View>
          </View>
        )}

        {/* Related Foods Carousel */}
        {ragDoc?.relatedFoods && ragDoc.relatedFoods.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.carouselSectionTitle, { color: colors.textPrimary }]}>🌱 Related & Complementary Foods</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            >
              {ragDoc.relatedFoods.map((food, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.carouselCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push({
                      pathname: '/(tabs)/assistant',
                      params: { query: `Tell me about ${food.title}` }
                    });
                  }}
                >
                  <Text style={styles.carouselFoodIcon}>
                    {food.category === 'fruits' ? '🍎' : food.category === 'vegetables' ? '🥦' : '🥗'}
                  </Text>
                  <Text style={[styles.carouselFoodTitle, { color: colors.textPrimary }]}>{food.title}</Text>
                  <Text style={[styles.carouselFoodCat, { color: colors.textTertiary }]}>{food.category}</Text>
                  <Text style={[styles.carouselActionText, { color: colors.primary }]}>Ask AI ➔</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg },
  errorText: { fontSize: TYPOGRAPHY.body, textAlign: 'center', marginTop: 100 },
  backBtn: { marginBottom: SPACING.md },
  backText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold },
  image: { width: '100%', height: 220, borderRadius: RADIUS.lg, marginBottom: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.sm },
  itemName: { fontSize: TYPOGRAPHY.h2, fontWeight: TYPOGRAPHY.bold, textTransform: 'capitalize' },
  summary: { fontSize: TYPOGRAPHY.bodySmall, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.md },
  badgeText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold },
  section: { marginBottom: SPACING.lg },
  card: { borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.md },
  cardTitle: { fontSize: TYPOGRAPHY.h4, fontWeight: TYPOGRAPHY.bold, marginBottom: SPACING.sm },
  cardText: { fontSize: TYPOGRAPHY.bodySmall, lineHeight: 22 },
  tip: { fontSize: TYPOGRAPHY.caption, marginTop: 6 },
  row: { flexDirection: 'row', marginBottom: SPACING.lg },
  miniCard: { borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOWS.sm },
  miniIcon: { fontSize: 28, marginBottom: 4 },
  miniLabel: { fontSize: TYPOGRAPHY.caption },
  miniValue: { fontSize: TYPOGRAPHY.caption, fontWeight: TYPOGRAPHY.medium, textAlign: 'center', marginTop: 4 },
  warningCard: {
    borderWidth: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 18,
  },
  insightCard: {
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  ragBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ragBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  insightRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    gap: SPACING.md,
  },
  insightMetric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    fontSize: 22,
  },
  metricLabel: {
    fontSize: 10,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  carouselSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  carouselContainer: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  carouselCard: {
    width: 120,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  carouselFoodIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  carouselFoodTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  carouselFoodCat: {
    fontSize: 9,
    textTransform: 'uppercase',
    marginTop: 2,
    marginBottom: 6,
  },
  carouselActionText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
