/**
 * VitaNova — Scan Screen (Default Tab)
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Animated, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAI } from '../../src/providers/AIProvider';
import { useNutrition } from '../../src/providers/NutritionProvider';
import { useHistory } from '../../src/providers/HistoryProvider';
import { useProfile } from '../../src/providers/ProfileProvider';
import { useSettings } from '../../src/providers/SettingsProvider';
import { useAuth } from '../../src/providers/AuthProvider';
import { speak } from '../../src/services/voiceService';
import { imageToBase64 } from '../../src/utils/helpers';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/utils/theme';
import ImagePreview from '../../src/components/ImagePreview';
import ScanResultCard from '../../src/components/ScanResultCard';
import NutritionCard from '../../src/components/NutritionCard';
import LoadingOverlay from '../../src/components/LoadingOverlay';
import VoiceButton from '../../src/components/VoiceButton';
import ObjectDescriptionCard from '../../src/components/ObjectDescriptionCard';
import DailyProgress from '../../src/components/DailyProgress';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import TabTransitionWrapper from '../../src/components/TabTransitionWrapper';

const DAILY_TIPS = [
  { icon: '🥦', tip: 'Eat 5 servings of fruits & veggies daily for optimal health.' },
  { icon: '💧', tip: 'Drink at least 8 glasses of water to stay hydrated.' },
  { icon: '🏃', tip: '30 minutes of daily activity boosts your metabolism.' },
  { icon: '🥗', tip: 'A colorful plate means a balanced meal — aim for variety.' },
  { icon: '🌙', tip: 'Avoid heavy meals 2 hours before sleep for better digestion.' },
  { icon: '🍳', tip: 'Start your day with protein for sustained energy.' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // Screen width minus padding

export default function ScanScreen() {
  const { isDark, colors } = useAppTheme();
  const [imageUri, setImageUri] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const { recognizeFood, isOnline } = useAI();
  const { getNutrition, getGuidance } = useNutrition();
  const { history, addEntry } = useHistory();
  const { profile } = useProfile();
  const { settings } = useSettings();
  const { user } = useAuth();

  // Dynamic logged intake calculations for today
  const todayDateString = new Date().toDateString();
  const todayEntries = (history || []).filter(
    (h) => new Date(h.timestamp).toDateString() === todayDateString
  );
  const todayCalories = todayEntries.reduce(
    (sum, h) => sum + (h.nutritionSnapshot?.calories || 0),
    0
  );
  const todayProtein = todayEntries.reduce(
    (sum, h) => sum + (h.nutritionSnapshot?.protein || 0),
    0
  );

  // Animations
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;
  const tipFade = useRef(new Animated.Value(0)).current;
  const actionFade = useRef(new Animated.Value(0)).current;
  const actionSlide = useRef(new Animated.Value(40)).current;
  const searchFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderTipItem = useCallback(({ item, index }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.93, 1, 0.93],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.65, 1, 0.65],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.tipCard,
          {
            width: CARD_WIDTH,
            opacity: opacity,
            transform: [{ scale }],
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <Text style={styles.tipIcon}>{item.icon}</Text>
        <View style={styles.tipContent}>
          <View style={styles.tipHeaderRow}>
            <Text style={[styles.tipLabel, { color: colors.accent }]}>💡 Daily Health Tip</Text>
            <Text style={[styles.tipIndex, { color: colors.textTertiary }]}>{index + 1}/{DAILY_TIPS.length}</Text>
          </View>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>{item.tip}</Text>
        </View>
      </Animated.View>
    );
  }, [colors]);

  const dailyTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];
  const displayName = profile.nickname || profile.name || user?.name || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '☀️ Good Morning' : hour < 17 ? '🌤️ Good Afternoon' : '🌙 Good Evening';

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]),
      Animated.timing(tipFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(actionFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(actionSlide, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]),
      Animated.timing(searchFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Pulse for scan button
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
    ])).start();
  }, []);

  const showResults = useCallback((itemName, conf, summary, uri) => {
    const nutrition = getNutrition(itemName);
    setNutritionData(nutrition);

    let g = null;
    if (nutrition) {
      g = getGuidance(nutrition, profile);
      setGuidance(g);
    }

    addEntry({
      item: itemName,
      confidence: conf,
      summary: summary,
      imageUri: uri,
      nutritionSnapshot: nutrition,
      aiRecommendation: g?.summary || summary,
    });

    if (settings.autoTTS && itemName !== 'unknown') {
      const speechText = nutrition
        ? `Detected ${itemName}. It has ${nutrition.calories} calories per 100 grams. ${nutrition.benefits}`
        : `Detected ${itemName}. ${summary}`;
      speak(speechText, settings.ttsLanguage);
    }
  }, [getNutrition, getGuidance, addEntry, profile, settings]);

  const analyzeFromUri = useCallback(async (uri) => {
    setLoading(true);
    setError(null);
    setScanResult(null);
    setNutritionData(null);
    setGuidance(null);
    setOfflineMode(false);

    try {
      const base64 = await imageToBase64(uri);
      const result = await recognizeFood(base64);
      setScanResult(result);
      showResults(result.item, result.confidence, result.summary, uri);
    } catch (e) {
      // If offline or network error, offer manual input
      if (e.code === 'OFFLINE_FALLBACK' || e.code === 'NETWORK_ERROR' || e.code === 'TIMEOUT' || e.code === 'CONFIG_ERROR') {
        setOfflineMode(true);
        setError('📡 AI unavailable. Type the food name below to get nutrition info offline.');
      } else {
        setError(e.message || 'Failed to analyze image.');
      }
    } finally {
      setLoading(false);
    }
  }, [recognizeFood, showResults]);

  const handleOfflineLookup = useCallback(() => {
    const name = manualInput.trim();
    if (!name) return;

    const nutrition = getNutrition(name);
    if (nutrition) {
      setScanResult({ item: name, confidence: 1, summary: `Offline lookup: ${nutrition.name}` });
      setNutritionData(nutrition);
      const g = getGuidance(nutrition, profile);
      setGuidance(g);
      setError(null);
      setOfflineMode(false);
      setManualInput('');

      addEntry({
        item: nutrition.name,
        confidence: 1,
        summary: `Offline lookup`,
        imageUri,
        nutritionSnapshot: nutrition,
        aiRecommendation: g?.summary || '',
      });
    } else {
      setError(`"${name}" not found in offline database. Try: apple, banana, rice, chicken, etc.`);
    }
  }, [manualInput, getNutrition, getGuidance, profile, addEntry, imageUri]);

  const pickImage = useCallback(async (useCamera) => {
    try {
      setError(null);
      let result;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission Needed', 'Camera access is required to scan food items.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
        });
      }

      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setScanResult(null);
        setNutritionData(null);
        setGuidance(null);
        // Auto-trigger analysis immediately after crop
        analyzeFromUri(uri);
      }
    } catch (e) {
      setError('Failed to pick image. Please try again.');
    }
  }, [analyzeFromUri]);

  const retryAnalysis = useCallback(() => {
    if (imageUri) analyzeFromUri(imageUri);
  }, [imageUri, analyzeFromUri]);

  const handleSpeak = useCallback((text) => {
    speak(text, settings.ttsLanguage);
  }, [settings.ttsLanguage]);

  const clearScan = useCallback(() => {
    setImageUri(null);
    setScanResult(null);
    setNutritionData(null);
    setGuidance(null);
    setError(null);
    setOfflineMode(false);
    setManualInput('');
    setFoodSearch('');
    setFoodSearchResult(null);
  }, []);

  // --- Describe Food by name ---
  const [foodSearch, setFoodSearch] = useState('');
  const [foodSearchResult, setFoodSearchResult] = useState(null);

  const handleFoodSearch = useCallback(() => {
    const name = foodSearch.trim();
    if (!name) return;
    const nutrition = getNutrition(name);
    if (nutrition) {
      const g = getGuidance(nutrition, profile);
      setFoodSearchResult({ nutrition, guidance: g });
      setError(null);
    } else {
      setFoodSearchResult(null);
      setError(`"${name}" not found. Try: apple, banana, rice, chicken, spinach, etc.`);
    }
  }, [foodSearch, getNutrition, getGuidance, profile]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabTransitionWrapper>
        <LoadingOverlay visible={loading} message="Analyzing food..." />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/logo.png')} style={styles.heroLogo} resizeMode="contain" />
              </View>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting},</Text>
                <Text style={[styles.heroName, { color: colors.textPrimary }]}>{displayName} 👋</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <Text style={[styles.heroTagline, { color: colors.textSecondary }]}>
            Scan any food to unlock its nutritional secrets 🔬
          </Text>
        </Animated.View>

        {/* Dynamic Daily Progress Tracker */}
        <DailyProgress loggedCalories={todayCalories} loggedProtein={todayProtein} />

        {/* Animated Swipeable Health Tips Carousel */}
        <Animated.View style={{ opacity: tipFade, marginBottom: SPACING.lg }}>
          <Animated.FlatList
            data={DAILY_TIPS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            scrollEventThrottle={16}
            contentContainerStyle={styles.tipsScrollContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            renderItem={renderTipItem}
            keyExtractor={(_, i) => i.toString()}
          />
        </Animated.View>

        {/* Connection status */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>📡 Offline — type food name for local nutrition data</Text>
          </View>
        )}

        {/* Image preview or Scan Actions */}
        {imageUri ? (
          <View style={styles.section}>
            <ImagePreview uri={imageUri} onRemove={clearScan} />
          </View>
        ) : (
          <Animated.View style={{ opacity: actionFade, transform: [{ translateY: actionSlide }] }}>
            <Text style={styles.sectionLabel}>📸 Scan Food</Text>
            <View style={styles.actionRow}>
              <Animated.View style={{ flex: 1, transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity style={styles.scanCard} onPress={() => pickImage(true)} activeOpacity={0.85}>
                  <View style={styles.scanIconWrap}>
                    <Text style={styles.scanIcon}>📷</Text>
                  </View>
                  <Text style={styles.scanCardTitle}>Camera</Text>
                  <Text style={styles.scanCardSub}>Take a photo</Text>
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity style={styles.galleryCard} onPress={() => pickImage(false)} activeOpacity={0.85}>
                <View style={styles.galleryIconWrap}>
                  <Text style={styles.scanIcon}>🖼️</Text>
                </View>
                <Text style={styles.galleryCardTitle}>Gallery</Text>
                <Text style={styles.galleryCardSub}>Pick image</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🍎</Text>
                <Text style={styles.statValue}>42</Text>
                <Text style={styles.statLabel}>Foods</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🌐</Text>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Languages</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🤖</Text>
                <Text style={styles.statValue}>AI</Text>
                <Text style={styles.statLabel}>Powered</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Describe Food by Name */}
        {!scanResult && (
          <View style={styles.searchSection}>
            <Text style={styles.searchTitle}>✍️ Describe a Food</Text>
            <Text style={styles.searchSubtitle}>Type any food name to get nutrition info</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={foodSearch}
                onChangeText={setFoodSearch}
                placeholder="e.g. apple, paneer, oats..."
                placeholderTextColor={COLORS.textTertiary}
                onSubmitEditing={handleFoodSearch}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={[styles.searchBtn, !foodSearch.trim() && styles.searchBtnDisabled]}
                onPress={handleFoodSearch}
                disabled={!foodSearch.trim()}
              >
                <Text style={styles.searchBtnText}>Go</Text>
              </TouchableOpacity>
            </View>

            {/* Food search result */}
            {foodSearchResult && (
              <View style={styles.searchResult}>
                <NutritionCard data={foodSearchResult.nutrition} />
                {foodSearchResult.guidance && (
                  <View style={styles.searchGuidance}>
                    <Text style={styles.searchGuidanceTitle}>🤖 Recommendation</Text>
                    <Text style={styles.searchGuidanceText}>{foodSearchResult.guidance.summary}</Text>
                    {foodSearchResult.guidance.tips?.map((tip, i) => (
                      <Text key={i} style={styles.searchTip}>💡 {tip}</Text>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  onPress={() => { setFoodSearch(''); setFoodSearchResult(null); }}
                >
                  <Text style={styles.clearSearchText}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            {!offlineMode && (
              <TouchableOpacity onPress={retryAnalysis}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Offline manual lookup */}
        {offlineMode && (
          <View style={styles.offlineInput}>
            <TextInput
              style={styles.offlineTextInput}
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="Type food name (e.g. apple, rice, chicken)"
              placeholderTextColor={COLORS.textTertiary}
              onSubmitEditing={handleOfflineLookup}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.offlineSearchBtn} onPress={handleOfflineLookup}>
              <Text style={styles.offlineSearchText}>🔍 Search</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scan result */}
        {scanResult && (
          <View style={styles.section}>
            <ScanResultCard
              item={scanResult.item}
              confidence={scanResult.confidence}
              summary={scanResult.summary}
            />
          </View>
        )}

        {/* Object Description — shown when NOT food */}
        {scanResult && scanResult.isFood === false && (
          <View style={styles.section}>
            <ObjectDescriptionCard
              item={scanResult.item}
              description={scanResult.description}
              summary={scanResult.summary}
            />
          </View>
        )}

        {/* Nutrition — shown when IS food */}
        {nutritionData && scanResult?.isFood !== false && (
          <View style={styles.section}>
            <NutritionCard data={nutritionData} />
          </View>
        )}

        {/* AI Guidance */}
        {guidance && (
          <View style={styles.section}>
            <View style={styles.guidanceCard}>
              <View style={styles.guidanceHeader}>
                <Text style={styles.guidanceTitle}>🤖 AI Recommendation</Text>
                <VoiceButton
                  icon="🔊"
                  size={36}
                  onPress={() => handleSpeak(guidance.summary)}
                />
              </View>
              <Text style={styles.guidanceText}>{guidance.summary}</Text>
              {guidance.tips?.length > 0 && (
                <View style={styles.tipsWrap}>
                  {guidance.tips.map((tip, i) => (
                    <Text key={i} style={styles.tip}>💡 {tip}</Text>
                  ))}
                </View>
              )}
              {guidance.warnings?.length > 0 && (
                <View style={styles.tipsWrap}>
                  {guidance.warnings.map((w, i) => (
                    <Text key={i} style={styles.warning}>⚠️ {w}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Scan new */}
        {scanResult && (
          <TouchableOpacity style={styles.newScanBtn} onPress={clearScan}>
            <Text style={styles.newScanText}>Scan Another Item</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
      </TabTransitionWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 96 },
  hero: { marginBottom: SPACING.lg },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  heroLogo: { width: '100%', height: '100%' },
  greeting: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.poppinsMedium },
  heroName: { fontSize: TYPOGRAPHY.h2, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1,
    paddingHorizontal: SPACING.md, paddingVertical: 5, borderRadius: RADIUS.full, ...SHADOWS.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.xs },
  statusText: { fontSize: TYPOGRAPHY.tiny, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  heroTagline: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textTertiary, fontFamily: TYPOGRAPHY.poppinsRegular, marginTop: SPACING.sm },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentSurface,
    borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderLeftWidth: 4, borderLeftColor: COLORS.accent, ...SHADOWS.sm,
  },
  tipIcon: { fontSize: 32, marginRight: SPACING.md },
  tipContent: { flex: 1 },
  tipHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  tipLabel: { fontSize: TYPOGRAPHY.caption, color: COLORS.accentDark, fontFamily: TYPOGRAPHY.poppinsBold },
  tipIndex: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsBold },
  tipText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, lineHeight: 20 },
  tipsScrollContent: { paddingVertical: 4 },
  offlineBanner: {
    backgroundColor: COLORS.warning + '15', borderRadius: RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.md, alignItems: 'center',
  },
  offlineText: { fontSize: TYPOGRAPHY.caption, color: COLORS.warning, fontFamily: TYPOGRAPHY.poppinsMedium },
  section: { marginBottom: SPACING.lg },
  sectionLabel: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.sm },
  actionRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  scanCard: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.lg, alignItems: 'center',
    ...SHADOWS.glow(COLORS.primary),
  },
  scanIconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  scanIcon: { fontSize: 28 },
  scanCardTitle: { fontSize: TYPOGRAPHY.body, color: COLORS.textInverse, fontFamily: TYPOGRAPHY.poppinsBold },
  scanCardSub: { fontSize: TYPOGRAPHY.tiny, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontFamily: TYPOGRAPHY.poppinsRegular },
  galleryCard: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.lg, alignItems: 'center',
    ...SHADOWS.glow(COLORS.accent),
  },
  galleryIconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  galleryCardTitle: { fontSize: TYPOGRAPHY.body, color: COLORS.textInverse, fontFamily: TYPOGRAPHY.poppinsBold },
  galleryCardSub: { fontSize: TYPOGRAPHY.tiny, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontFamily: TYPOGRAPHY.poppinsRegular },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg, alignItems: 'center', justifyContent: 'space-around',
    marginBottom: SPACING.lg, ...SHADOWS.md,
  },
  statItem: { alignItems: 'center' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: TYPOGRAPHY.h4, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold },
  statLabel: { fontSize: TYPOGRAPHY.tiny, color: COLORS.textTertiary, fontFamily: TYPOGRAPHY.poppinsMedium },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  errorCard: {
    backgroundColor: COLORS.error + '10', borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  errorText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.error, flex: 1 },
  retryText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.primary, fontFamily: TYPOGRAPHY.poppinsBold },
  offlineInput: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  offlineTextInput: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, ...SHADOWS.sm,
  },
  offlineSearchBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  offlineSearchText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textInverse, fontFamily: TYPOGRAPHY.poppinsBold },
  guidanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg, ...SHADOWS.md,
  },
  guidanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  guidanceTitle: { fontSize: TYPOGRAPHY.h4, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold },
  guidanceText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, lineHeight: 22 },
  tipsWrap: { marginTop: SPACING.sm },
  tip: { fontSize: TYPOGRAPHY.caption, color: COLORS.primaryDark, marginBottom: 4 },
  warning: { fontSize: TYPOGRAPHY.caption, color: COLORS.warning, marginBottom: 4 },
  newScanBtn: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  newScanText: { fontSize: TYPOGRAPHY.body, color: COLORS.primary, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  searchSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.md,
  },
  searchTitle: { fontSize: TYPOGRAPHY.h4, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold },
  searchSubtitle: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.md, fontFamily: TYPOGRAPHY.poppinsRegular },
  searchRow: { flexDirection: 'row', gap: SPACING.sm },
  searchInput: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textPrimary },
  searchBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  searchBtnDisabled: { backgroundColor: COLORS.border },
  searchBtnText: { fontSize: TYPOGRAPHY.body, color: COLORS.textInverse, fontFamily: TYPOGRAPHY.poppinsBold },
  searchResult: { marginTop: SPACING.md, gap: SPACING.md },
  searchGuidance: { backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.md },
  searchGuidanceTitle: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.xs },
  searchGuidanceText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, lineHeight: 22 },
  searchTip: { fontSize: TYPOGRAPHY.caption, color: COLORS.primaryDark, marginTop: 4 },
  clearSearchBtn: { alignSelf: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  clearSearchText: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, fontFamily: TYPOGRAPHY.poppinsMedium },
});
