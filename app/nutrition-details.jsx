import React, { useMemo, useCallback, useState } from 'react';
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
import AnimatedScoreIndicator from '../src/components/AnimatedScoreIndicator';
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

  // Accordion Expand/Collapse States for Premium View
  const [benefitsExpanded, setBenefitsExpanded] = useState(true);
  const [risksExpanded, setRisksExpanded] = useState(false);
  const [combosExpanded, setCombosExpanded] = useState(false);

  const entry = useMemo(() => {
    try {
      return JSON.parse(params.data);
    } catch {
      return null;
    }
  }, [params.data]);

  const nutrition = entry?.nutritionSnapshot;
  const detailed = entry?.detailedAnalysis;

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

  // Specialized Speech Synthesis Text
  const speechText = useMemo(() => {
    if (detailed) {
      return `${detailed.foodIdentification.name}. Category: ${detailed.foodIdentification.category}. Dietician report: ${detailed.healthExplanation}`;
    }
    return ragDoc
      ? `${entry.item}. ${ragDoc.benefits}. Recommended intake is ${ragDoc.recommendedIntake}. Ideal time is ${ragDoc.bestTime}.`
      : nutrition
        ? `${entry.item}. ${nutrition.calories} calories, ${nutrition.protein} grams protein. ${nutrition.benefits}`
        : `${entry.item}. ${entry.summary}`;
  }, [detailed, ragDoc, nutrition, entry]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>

        {/* Hero image or scanned image */}
        {entry.imageUri && (
          <Image source={{ uri: entry.imageUri }} style={styles.image} resizeMode="cover" />
        )}

        {/* Premium Dietician Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemName, { color: colors.textPrimary }]}>
              {detailed?.foodIdentification?.name || entry.item}
            </Text>
            <Text style={[styles.summary, { color: colors.textSecondary }]}>
              {detailed
                ? `${detailed.foodIdentification.preparationStyle} • ${detailed.foodIdentification.category}`
                : entry.summary}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: confidence.color + '18' }]}>
            <Text style={[styles.badgeText, { color: confidence.color }]}>
              {Math.round((entry.confidence || 0) * 100)}%
            </Text>
          </View>
          <VoiceButton icon="🔊" size={40} onPress={() => handleSpeak(speechText)} />
        </View>

        {/* ============================================================== */}
        {/* PREMIUM DIETICIAN DASHBOARD (Activated when detailedAnalysis is present) */}
        {/* ============================================================== */}
        {detailed ? (
          <View style={{ gap: SPACING.lg }}>
            
            {/* 1. Health & Dietician Insights Quote Card */}
            <View style={[
              styles.premiumCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary + '18',
                borderLeftColor: colors.primary,
                borderLeftWidth: 4,
              }
            ]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.premiumSectionTitle, { color: colors.textPrimary }]}>
                  🧑‍⚕️ Clinical Dietician Explanation
                </Text>
                <View style={[styles.premiumBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.premiumBadgeText, { color: colors.primary }]}>AI COACH</Text>
                </View>
              </View>
              <Text style={[styles.premiumExplanationText, { color: colors.textSecondary }]}>
                "{detailed.healthExplanation}"
              </Text>
            </View>

            {/* 2. Interactive Circular Score Meters */}
            <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
                📊 Intelligent Nutrition Scores
              </Text>
              <View style={styles.scoreRow}>
                <AnimatedScoreIndicator
                  score={detailed.aiFoodScore.healthScore}
                  title="Health"
                  gradientColors={['#10B981', '#059669']}
                  gradientId="healthScoreGrad"
                  size={72}
                  strokeWidth={6}
                />
                <AnimatedScoreIndicator
                  score={detailed.aiFoodScore.nutritionScore}
                  title="Nutrition"
                  gradientColors={['#06B6D4', '#0891B2']}
                  gradientId="nutritionScoreGrad"
                  size={72}
                  strokeWidth={6}
                  delay={150}
                />
                <AnimatedScoreIndicator
                  score={detailed.aiFoodScore.proteinScore}
                  title="Protein"
                  gradientColors={['#8B5CF6', '#7C3AED']}
                  gradientId="proteinScoreGrad"
                  size={72}
                  strokeWidth={6}
                  delay={300}
                />
                <AnimatedScoreIndicator
                  score={detailed.aiFoodScore.hydrationScore}
                  title="Hydrate"
                  gradientColors={['#3B82F6', '#2563EB']}
                  gradientId="hydrateScoreGrad"
                  size={72}
                  strokeWidth={6}
                  delay={450}
                />
              </View>
            </View>

            {/* 3. Portions & Consumption Guidance Hub */}
            <View style={styles.flexRowContainer}>
              <View style={[styles.flexHalfCard, { backgroundColor: colors.surface }]}>
                <Text style={styles.cardEmoji}>⚖️</Text>
                <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>PORTION ESTIMATE</Text>
                <Text style={[styles.metricValueBold, { color: colors.textPrimary }]}>
                  {detailed.portionEstimationDetails.servingSize}
                </Text>
                <Text style={[styles.metricSubText, { color: colors.textSecondary }]}>
                  ~{detailed.portionEstimationDetails.approxGrams} grams
                </Text>
              </View>

              <View style={[styles.flexHalfCard, { backgroundColor: colors.surface }]}>
                <Text style={styles.cardEmoji}>⏰</Text>
                <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>BEST TIME TO EAT</Text>
                <Text style={[styles.metricValueBold, { color: colors.textPrimary }]}>
                  {detailed.bestTimeToEat.timing}
                </Text>
                <Text style={[styles.metricSubText, { color: colors.textSecondary, fontSize: 10 }]}>
                  {detailed.bestTimeToEat.explanation}
                </Text>
              </View>
            </View>

            {/* 4. Target Demographic & Frequency Compatibility */}
            <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[styles.captionLabel, { color: colors.textTertiary }]}>RECOMMENDED FREQUENCY</Text>
                  <Text style={[styles.frequencyTitle, { color: colors.primary }]}>
                    {detailed.consumptionGuidance.frequency}
                  </Text>
                </View>
                <View style={[styles.tagBadge, { backgroundColor: colors.primary + '10' }]}>
                  <Text style={[styles.tagBadgeText, { color: colors.primary }]}>
                    {detailed.hydrationAndDigestion.mealStatus}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.metricLabel, { color: colors.textTertiary, marginTop: SPACING.md, marginBottom: 8 }]}>
                IDEAL AUDIENCES
              </Text>
              <View style={styles.tagRow}>
                {detailed.whoShouldEatThis.demographics.map((demo, idx) => (
                  <View key={idx} style={[styles.tag, { backgroundColor: colors.borderLight }]}>
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>👍 {demo}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 5. Health Cautions Alert (If detailed cautions are present) */}
            {detailed.whoShouldEatThis.cautions && detailed.whoShouldEatThis.cautions.length > 0 && (
              <View style={[
                styles.cautionBox,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF5F5',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FEE2E2',
                  borderWidth: 1,
                }
              ]}>
                <Text style={[styles.cautionTitle, { color: '#E53E3E' }]}>⚠️ Medical Warnings & Cautions</Text>
                {detailed.whoShouldEatThis.cautions.map((caution, idx) => (
                  <Text key={idx} style={[styles.cautionText, { color: isDark ? '#FED7D7' : '#9B2C2C' }]}>
                    • {caution}
                  </Text>
                ))}
              </View>
            )}

            {/* 6. Accordion: Health Benefits Breakdown */}
            <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                activeOpacity={0.8}
                onPress={() => setBenefitsExpanded(!benefitsExpanded)}
              >
                <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                  🌟 Therapeutic Health Benefits
                </Text>
                <Text style={[styles.accordionArrow, { color: colors.primary }]}>
                  {benefitsExpanded ? '▼' : '▲'}
                </Text>
              </TouchableOpacity>
              
              {benefitsExpanded && (
                <View style={styles.accordionContent}>
                  <View style={styles.benefitListItem}>
                    <Text style={styles.benefitListIcon}>🛡️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.benefitListTitle, { color: colors.textPrimary }]}>Immunity Support</Text>
                      <Text style={[styles.benefitListDesc, { color: colors.textSecondary }]}>{detailed.healthBenefits.immunitySupport}</Text>
                    </View>
                  </View>

                  <View style={styles.benefitListItem}>
                    <Text style={styles.benefitListIcon}>🍂</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.benefitListTitle, { color: colors.textPrimary }]}>Digestion & Gut</Text>
                      <Text style={[styles.benefitListDesc, { color: colors.textSecondary }]}>{detailed.healthBenefits.digestionBenefits}</Text>
                    </View>
                  </View>

                  <View style={styles.benefitListItem}>
                    <Text style={styles.benefitListIcon}>❤️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.benefitListTitle, { color: colors.textPrimary }]}>Heart Health</Text>
                      <Text style={[styles.benefitListDesc, { color: colors.textSecondary }]}>{detailed.healthBenefits.heartHealth}</Text>
                    </View>
                  </View>

                  <View style={styles.benefitListItem}>
                    <Text style={styles.benefitListIcon}>💪</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.benefitListTitle, { color: colors.textPrimary }]}>Muscle Tissue Repair</Text>
                      <Text style={[styles.benefitListDesc, { color: colors.textSecondary }]}>{detailed.healthBenefits.muscleGrowth}</Text>
                    </View>
                  </View>

                  <View style={styles.benefitListItem}>
                    <Text style={styles.benefitListIcon}>⚡</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.benefitListTitle, { color: colors.textPrimary }]}>Metabolic Energy</Text>
                      <Text style={[styles.benefitListDesc, { color: colors.textSecondary }]}>{detailed.healthBenefits.energyBoost}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* 7. Accordion: Risk Warnings Analysis */}
            <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                activeOpacity={0.8}
                onPress={() => setRisksExpanded(!risksExpanded)}
              >
                <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                  🚨 Risk & Overconsumption Warnings
                </Text>
                <Text style={[styles.accordionArrow, { color: colors.primary }]}>
                  {risksExpanded ? '▼' : '▲'}
                </Text>
              </TouchableOpacity>
              
              {risksExpanded && (
                <View style={styles.accordionContent}>
                  <View style={styles.riskListItem}>
                    <Text style={styles.riskListIcon}>🍬</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.riskListTitle, { color: colors.textPrimary }]}>High Sugar Warning</Text>
                      <Text style={[styles.riskListDesc, { color: colors.textSecondary }]}>{detailed.healthRisks.highSugarWarning}</Text>
                    </View>
                  </View>

                  <View style={styles.riskListItem}>
                    <Text style={styles.riskListIcon}>🍳</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.riskListTitle, { color: colors.textPrimary }]}>Fat & Excess Oil Warning</Text>
                      <Text style={[styles.riskListDesc, { color: colors.textSecondary }]}>{detailed.healthRisks.excessOilWarning}</Text>
                    </View>
                  </View>

                  <View style={styles.riskListItem}>
                    <Text style={styles.riskListIcon}>🥫</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.riskListTitle, { color: colors.textPrimary }]}>Processing & Additives</Text>
                      <Text style={[styles.riskListDesc, { color: colors.textSecondary }]}>{detailed.healthRisks.processedFoodRisk}</Text>
                    </View>
                  </View>

                  <View style={styles.riskListItem}>
                    <Text style={styles.riskListIcon}>🧂</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.riskListTitle, { color: colors.textPrimary }]}>Sodium Warning</Text>
                      <Text style={[styles.riskListDesc, { color: colors.textSecondary }]}>{detailed.healthRisks.sodiumWarning}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* 8. Accordion: Kitchen Pairings & Combos */}
            <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                activeOpacity={0.8}
                onPress={() => setCombosExpanded(!combosExpanded)}
              >
                <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                  🍽️ Smart Combinations & Side Dishes
                </Text>
                <Text style={[styles.accordionArrow, { color: colors.primary }]}>
                  {combosExpanded ? '▼' : '▲'}
                </Text>
              </TouchableOpacity>
              
              {combosExpanded && (
                <View style={styles.accordionContent}>
                  <View style={styles.comboSection}>
                    <Text style={[styles.comboLabel, { color: '#059669' }]}>🟢 Pairs Beautifully With</Text>
                    {detailed.aiMealCombination.pairsWellWith.map((pair, idx) => (
                      <Text key={idx} style={[styles.comboItemText, { color: colors.textSecondary }]}>
                        • {pair}
                      </Text>
                    ))}
                  </View>

                  <View style={[styles.comboSection, { marginTop: SPACING.md }]}>
                    <Text style={[styles.comboLabel, { color: '#D97706' }]}>🟡 Recommended Sides</Text>
                    {detailed.aiMealCombination.recommendedSides.map((side, idx) => (
                      <Text key={idx} style={[styles.comboItemText, { color: colors.textSecondary }]}>
                        • {side}
                      </Text>
                    ))}
                  </View>

                  <View style={[styles.comboSection, { marginTop: SPACING.md }]}>
                    <Text style={[styles.comboLabel, { color: '#DC2626' }]}>🔴 Avoid Combining With</Text>
                    {detailed.aiMealCombination.avoidCombining.map((avoid, idx) => (
                      <Text key={idx} style={[styles.comboItemText, { color: colors.textSecondary }]}>
                        • {avoid}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* 9. AI Healthier Alternatives */}
            <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>💡 AI Recommended Swaps & Cooking</Text>
              {detailed.aiAlternatives.map((alt, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.alternativeItem,
                    { borderTopColor: idx > 0 ? colors.borderLight : 'transparent', borderTopWidth: idx > 0 ? 1 : 0 }
                  ]}
                >
                  <Text style={[styles.alternativeName, { color: colors.primary }]}>🔁 {alt.name}</Text>
                  <Text style={[styles.alternativeText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700' }}>Benefit: </Text>{alt.benefit}
                  </Text>
                  <Text style={[styles.alternativeText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700' }}>Method: </Text>{alt.method}
                  </Text>
                </View>
              ))}
            </View>

            {/* 10. Core Macronutrients Display */}
            <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
                🥦 Nutrient & Mineral Breakdowns
              </Text>
              
              {/* Render local macro graphics */}
              <View style={styles.macroBadgeRow}>
                <View style={[styles.macroItem, { backgroundColor: colors.borderLight }]}>
                  <Text style={[styles.macroVal, { color: colors.textPrimary }]}>{detailed.nutritionBreakdown.calories} kcal</Text>
                  <Text style={styles.macroLabelText}>Calories</Text>
                </View>
                <View style={[styles.macroItem, { backgroundColor: colors.borderLight }]}>
                  <Text style={[styles.macroVal, { color: colors.textPrimary }]}>{detailed.nutritionBreakdown.protein}g</Text>
                  <Text style={styles.macroLabelText}>Protein</Text>
                </View>
                <View style={[styles.macroItem, { backgroundColor: colors.borderLight }]}>
                  <Text style={[styles.macroVal, { color: colors.textPrimary }]}>{detailed.nutritionBreakdown.carbs}g</Text>
                  <Text style={styles.macroLabelText}>Carbs</Text>
                </View>
                <View style={[styles.macroItem, { backgroundColor: colors.borderLight }]}>
                  <Text style={[styles.macroVal, { color: colors.textPrimary }]}>{detailed.nutritionBreakdown.fats}g</Text>
                  <Text style={styles.macroLabelText}>Fats</Text>
                </View>
              </View>

              <Text style={[styles.metricLabel, { color: colors.textTertiary, marginTop: SPACING.md, marginBottom: 6 }]}>
                VITAMINS PREVALENT
              </Text>
              <View style={styles.tagRow}>
                {detailed.nutritionBreakdown.vitamins.map((vit, idx) => (
                  <View key={idx} style={[styles.vitBadge, { backgroundColor: '#EEF2F6' }]}>
                    <Text style={styles.vitBadgeText}>💊 {vit}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.metricLabel, { color: colors.textTertiary, marginTop: SPACING.sm, marginBottom: 6 }]}>
                MINERALS PREVALENT
              </Text>
              <View style={styles.tagRow}>
                {detailed.nutritionBreakdown.minerals.map((min, idx) => (
                  <View key={idx} style={[styles.vitBadge, { backgroundColor: '#EEF2F6' }]}>
                    <Text style={styles.vitBadgeText}>💎 {min}</Text>
                  </View>
                ))}
              </View>
            </View>

          </View>
        ) : (
          /* ============================================================== */
          /* STANDARD FALLBACK UI (For items scanned before the upgrade) */
          /* ============================================================== */
          <View>
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
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  cardText: { fontSize: TYPOGRAPHY.bodySmall, lineHeight: 22 },
  tip: { fontSize: TYPOGRAPHY.caption, marginTop: 6 },
  row: { flexDirection: 'row', marginBottom: SPACING.lg },
  miniCard: { borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOWS.sm },
  miniIcon: { fontSize: 28, marginBottom: 4 },
  miniLabel: { fontSize: TYPOGRAPHY.caption },
  miniValue: { fontSize: TYPOGRAPHY.caption, fontWeight: TYPOGRAPHY.medium, textAlign: 'center', marginTop: 4 },
  warningCard: { borderWidth: 1 },
  warningTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  warningText: { fontSize: 12, lineHeight: 18 },
  insightCard: { borderWidth: 1 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  insightTitle: { fontSize: 16, fontWeight: '700' },
  ragBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  ragBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  insightRow: { flexDirection: 'row', marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, gap: SPACING.md },
  insightMetric: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricIcon: { fontSize: 22 },
  metricLabel: { fontSize: 10 },
  metricValue: { fontSize: 12, fontWeight: '600' },
  carouselSectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.xs },
  carouselContainer: { gap: SPACING.sm, paddingVertical: 4 },
  carouselCard: { width: 120, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', borderWidth: 1, ...SHADOWS.sm },
  carouselFoodIcon: { fontSize: 32, marginBottom: 4 },
  carouselFoodTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  carouselFoodCat: { fontSize: 9, textTransform: 'uppercase', marginTop: 2, marginBottom: 6 },
  carouselActionText: { fontSize: 10, fontWeight: '700' },

  // ==========================================
  // PREMIUM STYLING BLOCK
  // ==========================================
  premiumCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  premiumSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  premiumExplanationText: {
    fontSize: 13,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: SPACING.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  flexRowContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flexHalfCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  cardEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  metricValueBold: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  metricSubText: {
    fontSize: 10,
    lineHeight: 14,
  },
  captionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  frequencyTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cautionBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  cautionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  cautionText: {
    fontSize: 11,
    lineHeight: 18,
    marginTop: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionArrow: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  accordionContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },
  benefitListItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  benefitListIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  benefitListTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  benefitListDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 1,
  },
  riskListItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  riskListIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  riskListTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  riskListDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 1,
  },
  comboSection: {
    paddingLeft: SPACING.xs,
  },
  comboLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  comboItemText: {
    fontSize: 11,
    lineHeight: 18,
    marginLeft: 6,
  },
  alternativeItem: {
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  alternativeName: {
    fontSize: 12,
    fontWeight: '800',
  },
  alternativeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  macroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: SPACING.md,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  macroVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  macroLabelText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  vitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  vitBadgeText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
  },
});
