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

export default function NutritionDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useProfile();
  const { getGuidance } = useNutrition();
  const { settings } = useSettings();
  const { queryKnowledge } = useKnowledge();

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
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No data available</Text>
      </SafeAreaView>
    );
  }

  const speechText = ragDoc
    ? `${entry.item}. ${ragDoc.benefits}. Recommended intake is ${ragDoc.recommendedIntake}. Ideal time is ${ragDoc.bestTime}.`
    : nutrition
      ? `${entry.item}. ${nutrition.calories} calories, ${nutrition.protein} grams protein. ${nutrition.benefits}`
      : `${entry.item}. ${entry.summary}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Image */}
        {entry.imageUri && (
          <Image source={{ uri: entry.imageUri }} style={styles.image} resizeMode="cover" />
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{entry.item}</Text>
            <Text style={styles.summary}>{entry.summary}</Text>
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
            <View style={[styles.card, styles.warningCard]}>
              <Text style={styles.warningTitle}>⚠️ Health Caution & Alert</Text>
              <Text style={styles.warningText}>{ragDoc.warnings}</Text>
            </View>
          </View>
        ) : null}

        {/* RAG-Powered AI Insights Card */}
        {ragDoc ? (
          <View style={styles.section}>
            <View style={[styles.card, styles.insightCard]}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>🔬 Verified AI Insights</Text>
                <View style={styles.ragBadge}>
                  <Text style={styles.ragBadgeText}>RAG SECURE</Text>
                </View>
              </View>
              <Text style={styles.cardText}>{ragDoc.benefits}</Text>
              
              <View style={styles.insightRow}>
                <View style={styles.insightMetric}>
                  <Text style={styles.metricIcon}>⏰</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metricLabel}>IDEAL TIME</Text>
                    <Text style={styles.metricValue}>{ragDoc.bestTime || 'Anytime'}</Text>
                  </View>
                </View>
                <View style={styles.insightMetric}>
                  <Text style={styles.metricIcon}>📏</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metricLabel}>RECOMMENDED PORTION</Text>
                    <Text style={styles.metricValue}>{ragDoc.recommendedIntake || 'Moderation'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Standard fallback benefits when RAG isn't matched */
          nutrition?.benefits && (
            <View style={styles.section}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>✨ Health Benefits</Text>
                <Text style={styles.cardText}>{nutrition.benefits}</Text>
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
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🤖 Personalized Advice</Text>
              <Text style={styles.cardText}>{guidance.summary}</Text>
              {guidance.tips?.map((t, i) => (
                <Text key={i} style={styles.tip}>💡 {t}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Timing & Quantity (Standard fallback when RAG isn't matched) */}
        {!ragDoc && nutrition && (
          <View style={styles.row}>
            <View style={[styles.miniCard, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.miniIcon}>⏰</Text>
              <Text style={styles.miniLabel}>Best Time</Text>
              <Text style={styles.miniValue}>{nutrition.bestTime}</Text>
            </View>
            <View style={[styles.miniCard, { flex: 1 }]}>
              <Text style={styles.miniIcon}>📏</Text>
              <Text style={styles.miniLabel}>Quantity</Text>
              <Text style={styles.miniValue}>{nutrition.recommendedQty}</Text>
            </View>
          </View>
        )}

        {/* Related Foods Carousel */}
        {ragDoc?.relatedFoods && ragDoc.relatedFoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.carouselSectionTitle}>🌱 Related & Complementary Foods</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            >
              {ragDoc.relatedFoods.map((food, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.carouselCard, { borderColor: COLORS.border }]}
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
                  <Text style={styles.carouselFoodTitle}>{food.title}</Text>
                  <Text style={styles.carouselFoodCat}>{food.category}</Text>
                  <Text style={styles.carouselActionText}>Ask AI ➔</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  errorText: { fontSize: TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: 100 },
  backBtn: { marginBottom: SPACING.md },
  backText: { fontSize: TYPOGRAPHY.body, color: COLORS.primary, fontWeight: TYPOGRAPHY.semiBold },
  image: { width: '100%', height: 220, borderRadius: RADIUS.lg, marginBottom: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.sm },
  itemName: { fontSize: TYPOGRAPHY.h2, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, textTransform: 'capitalize' },
  summary: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.md },
  badgeText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold },
  section: { marginBottom: SPACING.lg },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.md },
  cardTitle: { fontSize: TYPOGRAPHY.h4, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  cardText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, lineHeight: 22 },
  tip: { fontSize: TYPOGRAPHY.caption, color: COLORS.primaryDark, marginTop: 6 },
  row: { flexDirection: 'row', marginBottom: SPACING.lg },
  miniCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOWS.sm },
  miniIcon: { fontSize: 28, marginBottom: 4 },
  miniLabel: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary },
  miniValue: { fontSize: TYPOGRAPHY.caption, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.medium, textAlign: 'center', marginTop: 4 },
  warningCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C2410C',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 18,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary + '18',
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
    color: COLORS.textPrimary,
  },
  ragBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: COLORS.primary + '12',
  },
  ragBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  insightRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
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
    color: COLORS.textTertiary,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  carouselSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  carouselContainer: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  carouselCard: {
    width: 120,
    backgroundColor: COLORS.surface,
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
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  carouselFoodCat: {
    fontSize: 9,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2,
    marginBottom: 6,
  },
  carouselActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
