/**
 * NutriVision AI — Nutrition Details Screen
 */
import React, { useMemo, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProfile } from '../src/providers/ProfileProvider';
import { useNutrition } from '../src/providers/NutritionProvider';
import { useSettings } from '../src/providers/SettingsProvider';
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

  const entry = useMemo(() => {
    try { return JSON.parse(params.data); }
    catch { return null; }
  }, [params.data]);

  const nutrition = entry?.nutritionSnapshot;
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

  const speechText = nutrition
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

        {/* Nutrition */}
        {nutrition && (
          <View style={styles.section}>
            <NutritionCard data={nutrition} />
          </View>
        )}

        {/* Guidance */}
        {guidance && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🤖 AI Recommendation</Text>
              <Text style={styles.cardText}>{guidance.summary}</Text>
              {guidance.tips?.map((t, i) => (
                <Text key={i} style={styles.tip}>💡 {t}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Benefits */}
        {nutrition?.benefits && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✨ Health Benefits</Text>
              <Text style={styles.cardText}>{nutrition.benefits}</Text>
            </View>
          </View>
        )}

        {/* Timing & Quantity */}
        {nutrition && (
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
});
