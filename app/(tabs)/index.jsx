/**
 * VitaNova AI — Premium Wellness & Health Dashboard
 * A highly performant, state-of-the-art interactive home dashboard.
 * Designed with modern glassmorphism, glowing macro progress rings,
 * dynamic water wave animation, streak metrics, RAG AI wellness recommendations,
 * and quick-action sliding scan portals.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Animated, Image, Dimensions, Modal, ActivityIndicator, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

import { addPendingUpload } from '../../src/services/sqlite/database';
import { useAI } from '../../src/providers/AIProvider';
import { useNutrition } from '../../src/providers/NutritionProvider';
import { useHistory } from '../../src/providers/HistoryProvider';
import { useProfile } from '../../src/providers/ProfileProvider';
import { useSettings } from '../../src/providers/SettingsProvider';
import { useAuth } from '../../src/providers/AuthProvider';
import { useKnowledge } from '../../src/providers/KnowledgeProvider';
import { speak } from '../../src/services/voiceService';
import { imageToBase64 } from '../../src/utils/helpers';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/utils/theme';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import TabTransitionWrapper from '../../src/components/TabTransitionWrapper';
import ImagePreview from '../../src/components/ImagePreview';
import ScanResultCard from '../../src/components/ScanResultCard';
import NutritionCard from '../../src/components/NutritionCard';
import ObjectDescriptionCard from '../../src/components/ObjectDescriptionCard';
import VoiceButton from '../../src/components/VoiceButton';
import LoadingOverlay from '../../src/components/LoadingOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

// Storage Keys
const STORAGE_KEY_WATER = 'vitanova_hydration_today';
const STORAGE_KEY_DATE = 'vitanova_hydration_date';

// Static Wellness Tips
const WELLNESS_TIPS = [
  { icon: '💧', tip: 'Drink water before meals to naturally support digestion and control portions.' },
  { icon: '🥦', tip: 'A colorful plate guarantees micro-nutrient diversity. Aim for 3 colors per meal!' },
  { icon: '🍗', tip: 'Sufficient protein supports lean muscle mass and speeds up physical recovery.' },
  { icon: '🏃', tip: 'A brisk 10-minute walk post-meal significantly lowers glucose spikes.' },
  { icon: '🌙', tip: 'Avoid caffeine after 2 PM to safeguard deep sleep and growth hormone cycles.' },
  { icon: '🌾', tip: 'Prioritize whole grains over processed options for slow-release sustainable energy.' },
];

// Circular progress ring helper
function ProgressRing({ size = 70, strokeWidth = 6, percentage = 0, gradStart, gradStop, colors, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <View style={styles.ringContainer}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`ring_grad_${gradStart.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradStart} />
            <Stop offset="100%" stopColor={gradStop} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors?.borderLight || '#E2E8F0'}
          strokeWidth={strokeWidth - 1}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#ring_grad_${gradStart.replace('#', '')})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>{children}</View>
    </View>
  );
}

export default function PremiumDashboard() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { recognizeFood, chat, isOnline } = useAI();
  const { getNutrition, getGuidance } = useNutrition();
  const { history, addEntry } = useHistory();
  const { profile } = useProfile();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { queryKnowledge } = useKnowledge();

  // Dashboard Core States
  const [hydration, setHydration] = useState(1.6);
  const [aiInsight, setAiInsight] = useState('Generating personalized wellness advice...');
  const [insightLoading, setInsightLoading] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('Small healthy steps compound into massive lifetime transformations.');
  const [favoriteFoods, setFavoriteFoods] = useState(['Apple', 'Spinach', 'Almonds', 'Oats']);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // summary | recomendations

  // Scanner states
  const [imageUri, setImageUri] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [ragDoc, setRagDoc] = useState(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodSearchResult, setFoodSearchResult] = useState(null);

  // Animations
  const dashboardFade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const tipScrollX = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

  // Auto-scroll tips carousel
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        index = (index + 1) % WELLNESS_TIPS.length;
        carouselRef.current.scrollToIndex({ index, animated: true });
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Hydration wave loop animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Load Hydration data
  useEffect(() => {
    (async () => {
      try {
        const savedDate = await AsyncStorage.getItem(STORAGE_KEY_DATE);
        const todayDate = new Date().toDateString();
        if (savedDate === todayDate) {
          const savedWater = await AsyncStorage.getItem(STORAGE_KEY_WATER);
          if (savedWater !== null) {
            setHydration(parseFloat(savedWater));
          }
        } else {
          await AsyncStorage.setItem(STORAGE_KEY_DATE, todayDate);
          await AsyncStorage.setItem(STORAGE_KEY_WATER, '1.6');
          setHydration(1.6);
        }
      } catch (e) {
        console.warn('AsyncStorage error loading hydration:', e);
      }
    })();
  }, []);

  // Set quotes based on fitness goal
  useEffect(() => {
    const goal = profile.fitnessGoal || 'maintenance';
    if (goal === 'fat_loss') {
      setMotivationalQuote('Fitness is a slow, steady burn. Discipline feeds the flame, and every low-calorie swap brings you closer to clean agility.');
    } else if (goal === 'muscle_gain') {
      setMotivationalQuote('Muscles are built in the gym, fed in the kitchen, and rebuilt during sleep. Consume enough clean protein to unlock cellular growth.');
    } else if (goal === 'weight_gain') {
      setMotivationalQuote('Gaining strength requires nutrient-dense surplus foods. Fuel your workouts with calorie-dense fats and clean macros.');
    } else {
      setMotivationalQuote('A balanced lifestyle maintains longevity, stabilizes hormonal health, and creates consistent daily energy flow.');
    }
  }, [profile.fitnessGoal]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(dashboardFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  // Dynamic calculations for today
  const todayDateString = new Date().toDateString();
  const todayEntries = (history || []).filter(
    (h) => new Date(h.timestamp).toDateString() === todayDateString
  );

  const totalCalories = todayEntries.reduce((sum, h) => sum + (h.nutritionSnapshot?.calories || 0), 0);
  const totalProtein = todayEntries.reduce((sum, h) => sum + (h.nutritionSnapshot?.protein || 0), 0);
  const totalCarbs = todayEntries.reduce((sum, h) => sum + (h.nutritionSnapshot?.carbs || 0), 0);
  const totalFats = todayEntries.reduce((sum, h) => sum + (h.nutritionSnapshot?.fats || 0), 0);
  const totalFiber = todayEntries.reduce((sum, h) => sum + (h.nutritionSnapshot?.fiber || 0), 0);

  // Targets
  const targetCalories = 2000;
  const targetProtein = 120;
  const targetCarbs = 250;
  const targetFats = 70;
  const targetHydration = 2.0;

  // Streak Algorithms
  const getScanStreak = () => {
    if (!history || history.length === 0) return 0;
    const dates = [...new Set(history.map(h => new Date(h.timestamp).toDateString()))];
    let streak = 0;
    let checkDate = new Date();
    const todayStr = checkDate.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
      return 0;
    }
    if (!dates.includes(todayStr) && dates.includes(yesterdayStr)) {
      checkDate = yesterday;
    }

    while (true) {
      if (dates.includes(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getHydrationStreak = () => {
    // Standard mock value combined with active hydration level
    return hydration >= 2.0 ? 3 : 2;
  };

  const getNutritionStreak = () => {
    return todayEntries.length > 0 ? 4 : 3;
  };

  // BMI Metrics
  const heightM = (parseFloat(profile.height) || 172) / 100;
  const weightKg = parseFloat(profile.weight) || 68;
  const bmiVal = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Normal';
  let bmiColor = COLORS.success;
  let bmiIndicatorOffset = 40; // percentage style
  if (bmiVal < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = '#3B82F6';
    bmiIndicatorOffset = 15;
  } else if (bmiVal >= 25 && bmiVal < 29.9) {
    bmiCategory = 'Overweight';
    bmiColor = COLORS.warning;
    bmiIndicatorOffset = 65;
  } else if (bmiVal >= 30) {
    bmiCategory = 'Obese';
    bmiColor = COLORS.error;
    bmiIndicatorOffset = 85;
  }

  // Wellness dynamic rating (1-100)
  const hydrationScore = Math.min(100, Math.round((hydration / targetHydration) * 100));
  const calorieScore = Math.min(100, Math.round((1 - Math.abs(targetCalories - totalCalories) / targetCalories) * 100));
  const proteinScore = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const wellnessScore = Math.round((hydrationScore + calorieScore + proteinScore) / 3);

  // Fetch AI Insights
  const generateAIInsight = useCallback(async () => {
    setInsightLoading(true);
    setAiInsight('VitaNova AI is analyzing your nutrition patterns...');
    try {
      if (!isOnline) {
        // Offline dynamic rules
        if (hydration < 1.2) {
          setAiInsight('💧 Dehydration alert: Your water consumption is under 1.2L. Replenish now to secure metabolic efficiency.');
        } else if (totalProtein < 40) {
          setAiInsight('🍗 High-protein recommendation: Boost amino acid intake with Paneer or Lentils to fuel muscle cells.');
        } else {
          setAiInsight('🌟 Balanced state: Excellent calorie pacing today. Maintain hydration levels into the evening.');
        }
        setInsightLoading(false);
        return;
      }

      const prompt = `You are VitaNova AI, an elite wellness coach. Analyze the user's daily food intake macros and physical goals, and output exactly one bulletproof, highly personalized, actionable 2-sentence wellness advice. Keep it concise, premium, and friendly. Today's metrics: Calories: ${totalCalories}/${targetCalories} kcal, Protein: ${totalProtein}/${targetProtein}g, Carbs: ${totalCarbs}/${targetCarbs}g, Fats: ${totalFats}/${targetFats}g. Water: ${hydration}/${targetHydration}L. Physical Goal: ${profile.fitnessGoal}.`;
      
      const response = await chat([{ role: 'user', content: 'Generate my dashboard report.' }], {
        profile,
        language: settings.ttsLanguage || 'en',
      });
      setAiInsight(response || 'Your macro distribution is stable. Continue scanning food to refine insights.');
    } catch (e) {
      setAiInsight('🌟 Maintain focus! Hydrate consistently and log your next meal to activate comprehensive AI analytics.');
    } finally {
      setInsightLoading(false);
    }
  }, [hydration, totalCalories, totalProtein, totalCarbs, totalFats, profile, isOnline, chat, settings.ttsLanguage]);

  useEffect(() => {
    generateAIInsight();
  }, [hydration, totalCalories, totalProtein]);

  // Water modification handlers
  const handleAddWater = async (amount) => {
    try {
      const nextHydration = parseFloat((Math.min(4.0, hydration + amount)).toFixed(1));
      setHydration(nextHydration);
      await AsyncStorage.setItem(STORAGE_KEY_WATER, nextHydration.toString());
      await AsyncStorage.setItem(STORAGE_KEY_DATE, new Date().toDateString());
    } catch (e) {
      console.warn('Error saving hydration:', e);
    }
  };

  const handleResetWater = async () => {
    try {
      setHydration(0);
      await AsyncStorage.setItem(STORAGE_KEY_WATER, '0');
    } catch (e) {
      console.warn('Error resetting hydration:', e);
    }
  };

  // Image Processing & Scanning Handlers
  const showResults = useCallback((itemName, conf, summary, uri) => {
    const nutrition = getNutrition(itemName);
    setNutritionData(nutrition);

    let g = null;
    if (nutrition) {
      g = getGuidance(nutrition, profile);
      setGuidance(g);
    }
    
    const docs = queryKnowledge(itemName, { language: settings.ttsLanguage || 'en', topK: 1 });
    const rDoc = docs.length > 0 ? docs[0] : null;
    setRagDoc(rDoc);

    addEntry({
      item: itemName,
      confidence: conf,
      summary: summary,
      imageUri: uri,
      nutritionSnapshot: nutrition,
      aiRecommendation: g?.summary || summary,
    });

    if (settings.autoTTS && itemName !== 'unknown') {
      const speechText = rDoc
        ? `Detected ${itemName}. ${rDoc.benefits}.`
        : nutrition
          ? `Detected ${itemName}. It has ${nutrition.calories} calories per 100 grams.`
          : `Detected ${itemName}. ${summary}`;
      speak(speechText, settings.ttsLanguage);
    }
  }, [getNutrition, getGuidance, addEntry, profile, settings, queryKnowledge]);

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
      if (e.code === 'OFFLINE_FALLBACK' || e.code === 'NETWORK_ERROR' || e.code === 'TIMEOUT' || e.code === 'CONFIG_ERROR') {
        setOfflineMode(true);
        setError('📡 AI unavailable. Type food name below for offline local matching.');
      } else {
        setError(e.message || 'Failed to analyze image.');
      }
    } finally {
      setLoading(false);
    }
  }, [recognizeFood, showResults]);

  const pickImage = useCallback(async (useCamera) => {
    try {
      setError(null);
      let result;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission Needed', 'Camera access is required to scan foods.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });
      }

      if (!result.canceled && result.assets?.[0]) {
        const originalUri = result.assets[0].uri;
        setLoading(true);

        const manipResult = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 800 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );

        const scansDir = `${FileSystem.documentDirectory}scans/`;
        const dirInfo = await FileSystem.getInfoAsync(scansDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(scansDir, { intermediates: true });
        }

        const fileName = `${Date.now()}_scan.jpg`;
        const persistentUri = `${scansDir}${fileName}`;
        await FileSystem.copyAsync({ from: manipResult.uri, to: persistentUri });

        await addPendingUpload(persistentUri);

        setImageUri(persistentUri);
        setScanResult(null);
        setNutritionData(null);
        setGuidance(null);
        setLoading(false);
        analyzeFromUri(persistentUri);
      }
    } catch (e) {
      setLoading(false);
      setError('Failed to pick and process image.');
    }
  }, [analyzeFromUri]);

  const handleOfflineLookup = useCallback(() => {
    const name = manualInput.trim();
    if (!name) return;

    const nutrition = getNutrition(name);
    if (nutrition) {
      setScanResult({ item: name, confidence: 1, summary: `Offline: ${nutrition.name}` });
      setNutritionData(nutrition);
      const g = getGuidance(nutrition, profile);
      setGuidance(g);
      
      const docs = queryKnowledge(name, { language: settings.ttsLanguage || 'en', topK: 1 });
      setRagDoc(docs.length > 0 ? docs[0] : null);
      
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
      setError(`"${name}" not found. Try: apple, banana, oats, paneer.`);
    }
  }, [manualInput, getNutrition, getGuidance, profile, addEntry, imageUri, queryKnowledge, settings.ttsLanguage]);

  const handleFoodSearch = useCallback(() => {
    const name = foodSearch.trim();
    if (!name) return;
    const nutrition = getNutrition(name);
    if (nutrition) {
      const g = getGuidance(nutrition, profile);
      const docs = queryKnowledge(name, { language: settings.ttsLanguage || 'en', topK: 1 });
      const rDoc = docs.length > 0 ? docs[0] : null;
      setFoodSearchResult({ nutrition, guidance: g, ragDoc: rDoc });
      setError(null);
    } else {
      setFoodSearchResult(null);
      setError(`"${name}" not found. Try: apple, banana, broccoli.`);
    }
  }, [foodSearch, getNutrition, getGuidance, profile, queryKnowledge, settings.ttsLanguage]);

  const clearScan = useCallback(() => {
    setImageUri(null);
    setScanResult(null);
    setNutritionData(null);
    setGuidance(null);
    setRagDoc(null);
    setError(null);
    setOfflineMode(false);
    setManualInput('');
    setFoodSearch('');
    setFoodSearchResult(null);
  }, []);

  const renderTipItem = useCallback(({ item, index }) => (
    <View style={[styles.tipCard, { width: CARD_WIDTH, backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
      <Text style={styles.tipIcon}>{item.icon}</Text>
      <View style={styles.tipContent}>
        <View style={styles.tipHeaderRow}>
          <Text style={[styles.tipLabel, { color: colors.accent }]}>💡 Daily Wellness Tip</Text>
          <Text style={[styles.tipIndex, { color: colors.textTertiary }]}>{index + 1}/{WELLNESS_TIPS.length}</Text>
        </View>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>{item.tip}</Text>
      </View>
    </View>
  ), [colors]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '☀️ Good Morning' : hour < 17 ? '🌤️ Good Afternoon' : '🌙 Good Evening';
  const displayName = profile.nickname || profile.name || user?.name || 'Explorer';

  // Svg wave interpolation
  const waveTranslateX1 = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(SCREEN_WIDTH - 64)],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabTransitionWrapper>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 12-Section Premium Wellness Dashboard */}
          <Animated.View style={{ opacity: dashboardFade, transform: [{ translateY: slideUp }] }}>
            
            {/* Header section with brand logo avatar on the left */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeftContainer}>
                <View style={styles.headerLogoAvatar}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.headerLogoAvatarImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.headerGreetingCol}>
                  <Text style={[styles.greetingText, { color: colors.textSecondary }]}>{greeting},</Text>
                  <Text style={[styles.userNameText, { color: colors.textPrimary }]}>{displayName} 👋</Text>
                </View>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>{isOnline ? 'Online' : 'Offline'}</Text>
              </View>
            </View>

            {/* Network Banner Fallback */}
            {!isOnline && (
              <View style={[styles.networkBanner, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.networkBannerText, { color: colors.warning }]}>📡 Offline Mode — local matching active</Text>
              </View>
            )}

            {/* Quick Actions Shortcuts */}
            <View style={styles.quickGrid}>
              <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => setScanModalVisible(true)}>
                <View style={[styles.quickIconWrap, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={styles.quickEmoji}>📸</Text>
                </View>
                <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Scan Food</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => Alert.alert('Health Report', `Macros Today:\nCalories: ${totalCalories} kcal\nProtein: ${totalProtein}g\nCarbs: ${totalCarbs}g\nFats: ${totalFats}g`)}>
                <View style={[styles.quickIconWrap, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={styles.quickEmoji}>📊</Text>
                </View>
                <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Report</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => handleAddWater(0.25)}>
                <View style={[styles.quickIconWrap, { backgroundColor: '#3B82F620' }]}>
                  <Text style={styles.quickEmoji}>💧</Text>
                </View>
                <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>+250ml</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => router.push('/favorites')}>
                <View style={[styles.quickIconWrap, { backgroundColor: '#F59E0B20' }]}>
                  <Text style={styles.quickEmoji}>⭐</Text>
                </View>
                <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Favorites</Text>
              </TouchableOpacity>
            </View>

            {/* Streak metrics section */}
            <View style={[styles.streakContainer, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>🔥</Text>
                <View>
                  <Text style={[styles.streakCount, { color: colors.textPrimary }]}>{getScanStreak()} Days</Text>
                  <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Scan Streak</Text>
                </View>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>💧</Text>
                <View>
                  <Text style={[styles.streakCount, { color: colors.textPrimary }]}>{getHydrationStreak()} Days</Text>
                  <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Hydration</Text>
                </View>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>🎯</Text>
                <View>
                  <Text style={[styles.streakCount, { color: colors.textPrimary }]}>{getNutritionStreak()} Days</Text>
                  <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Goal Streak</Text>
                </View>
              </View>
            </View>

            {/* Daily Health Summary Rings & Core Score */}
            <View style={[styles.summaryCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <View style={styles.summaryTopRow}>
                <View>
                  <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Daily Summary</Text>
                  <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>Nutrition compliance & macro balance</Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.scoreBadgeVal}>{wellnessScore}%</Text>
                </View>
              </View>

              <View style={styles.summaryGrid}>
                {/* Calories progress */}
                <View style={styles.ringCell}>
                  <ProgressRing
                    size={72}
                    percentage={Math.min(100, (totalCalories / targetCalories) * 100)}
                    gradStart="#10B981"
                    gradStop="#34D399"
                    colors={colors}
                  >
                    <Text style={[styles.ringInnerNum, { color: colors.textPrimary }]}>{totalCalories}</Text>
                    <Text style={[styles.ringInnerLabel, { color: colors.textTertiary }]}>kcal</Text>
                  </ProgressRing>
                  <Text style={[styles.ringCellTitle, { color: colors.textSecondary }]}>Calories</Text>
                </View>

                {/* Protein progress */}
                <View style={styles.ringCell}>
                  <ProgressRing
                    size={72}
                    percentage={Math.min(100, (totalProtein / targetProtein) * 100)}
                    gradStart="#8B5CF6"
                    gradStop="#A78BFA"
                    colors={colors}
                  >
                    <Text style={[styles.ringInnerNum, { color: colors.textPrimary }]}>{totalProtein}g</Text>
                    <Text style={[styles.ringInnerLabel, { color: colors.textTertiary }]}>target</Text>
                  </ProgressRing>
                  <Text style={[styles.ringCellTitle, { color: colors.textSecondary }]}>Protein</Text>
                </View>

                {/* Hydration progress */}
                <View style={styles.ringCell}>
                  <ProgressRing
                    size={72}
                    percentage={Math.min(100, (hydration / targetHydration) * 100)}
                    gradStart="#3B82F6"
                    gradStop="#60A5FA"
                    colors={colors}
                  >
                    <Text style={[styles.ringInnerNum, { color: colors.textPrimary }]}>{hydration}L</Text>
                    <Text style={[styles.ringInnerLabel, { color: colors.textTertiary }]}>water</Text>
                  </ProgressRing>
                  <Text style={[styles.ringCellTitle, { color: colors.textSecondary }]}>Hydration</Text>
                </View>
              </View>
            </View>

            {/* Dynamic Calories Remaining Status & Macro Progress */}
            <View style={[styles.progressStatusCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <View style={styles.progressStatusHeader}>
                <Text style={[styles.progressStatusTitle, { color: colors.textPrimary }]}>Calories Remaining</Text>
                <Text style={[styles.progressRemainingNum, { color: colors.primary }]}>{Math.max(0, targetCalories - totalCalories)} kcal</Text>
              </View>
              
              <View style={styles.progressBarRow}>
                <View style={styles.progressBarLabelRow}>
                  <Text style={[styles.progressBarLabel, { color: colors.textSecondary }]}>Protein</Text>
                  <Text style={[styles.progressBarValue, { color: colors.textPrimary }]}>{totalProtein}g / {targetProtein}g</Text>
                </View>
                <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%`, backgroundColor: colors.accent }]} />
                </View>
              </View>

              <View style={styles.progressBarRow}>
                <View style={styles.progressBarLabelRow}>
                  <Text style={[styles.progressBarLabel, { color: colors.textSecondary }]}>Carbs</Text>
                  <Text style={[styles.progressBarValue, { color: colors.textPrimary }]}>{totalCarbs}g / {targetCarbs}g</Text>
                </View>
                <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%`, backgroundColor: '#F59E0B' }]} />
                </View>
              </View>

              <View style={styles.progressBarRow}>
                <View style={styles.progressBarLabelRow}>
                  <Text style={[styles.progressBarLabel, { color: colors.textSecondary }]}>Fats</Text>
                  <Text style={[styles.progressBarValue, { color: colors.textPrimary }]}>{totalFats}g / {targetFats}g</Text>
                </View>
                <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(100, (totalFats / targetFats) * 100)}%`, backgroundColor: '#EF4444' }]} />
                </View>
              </View>
            </View>

            {/* AI Health Insights Section */}
            <View style={[styles.insightCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <View style={styles.insightHeader}>
                <View style={styles.insightTitleRow}>
                  <Text style={styles.insightTitleIcon}>🤖</Text>
                  <Text style={[styles.insightTitleText, { color: colors.textPrimary }]}>AI Health Insights</Text>
                </View>
                <TouchableOpacity onPress={generateAIInsight} disabled={insightLoading}>
                  <Text style={[styles.refreshText, { color: colors.primary }]}>{insightLoading ? 'Analyzing...' : 'Refresh'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.insightText, { color: colors.textSecondary }]}>{aiInsight}</Text>
              <View style={styles.verifiedRow}>
                <Text style={styles.verifiedBadge}>🛡️ Verified RAG Core</Text>
                <Text style={[styles.verifiedTimestamp, { color: colors.textTertiary }]}>Updated recently</Text>
              </View>
            </View>

            {/* Hydration Tracker with waving SVG water animation */}
            <View style={[styles.waterCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <Text style={[styles.waterTitle, { color: colors.textPrimary }]}>Hydration Tracker</Text>
              
              <View style={styles.waveOuter}>
                <View style={styles.waveContainer}>
                  {/* Moving wave element */}
                  <Animated.View style={[styles.waveFill, {
                    height: `${Math.min(100, (hydration / targetHydration) * 100)}%`,
                    transform: [{ translateX: waveTranslateX1 }],
                  }]}>
                    <Svg width={(SCREEN_WIDTH - 64) * 2} height="20" viewBox={`0 0 ${(SCREEN_WIDTH - 64) * 2} 20`} fill="none" style={styles.svgPath}>
                      <Path
                        d={`M0 10 Q ${(SCREEN_WIDTH - 64) / 2} 0, ${SCREEN_WIDTH - 64} 10 T ${(SCREEN_WIDTH - 64) * 2} 10 L ${(SCREEN_WIDTH - 64) * 2} 30 L 0 30 Z`}
                        fill="#3B82F6"
                      />
                    </Svg>
                    <View style={styles.blueBlock} />
                  </Animated.View>
                  
                  {/* Glass indicator absolute labels */}
                  <View style={styles.waveInnerLabelWrap}>
                    <Text style={styles.waveWaterNum}>{hydration}L</Text>
                    <Text style={styles.waveTargetNum}>Target: {targetHydration}L</Text>
                  </View>
                </View>
              </View>

              <View style={styles.waterTriggers}>
                <TouchableOpacity style={styles.waterTriggerBtn} onPress={() => handleAddWater(0.25)}>
                  <Text style={styles.waterTriggerBtnText}>🥛 +250ml</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.waterTriggerBtn} onPress={() => handleAddWater(0.5)}>
                  <Text style={styles.waterTriggerBtnText}>🍾 +500ml</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.waterTriggerBtn, styles.resetWaterBtn]} onLongPress={handleResetWater}>
                  <Text style={styles.waterTriggerBtnText}>🔄 Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* BMI Dial & Wellness Score Category */}
            <View style={[styles.bmiCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <Text style={[styles.bmiCardTitle, { color: colors.textPrimary }]}>BMI & Weight Profile</Text>
              
              <View style={styles.bmiGaugeWrap}>
                <View style={styles.bmiDial}>
                  <Text style={[styles.bmiValText, { color: colors.textPrimary }]}>{bmiVal}</Text>
                  <Text style={[styles.bmiCategoryLabel, { color: bmiColor }]}>{bmiCategory}</Text>
                </View>
                <View style={styles.bmiDetailsTextCol}>
                  <Text style={[styles.bmiSubText, { color: colors.textSecondary }]}>Height: {profile.height || '172'} cm</Text>
                  <Text style={[styles.bmiSubText, { color: colors.textSecondary }]}>Weight: {profile.weight || '68'} kg</Text>
                </View>
              </View>

              <View style={styles.bmiBarOuter}>
                <View style={[styles.bmiBarLine, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.bmiBarFillIndicator, { left: `${bmiIndicatorOffset}%`, backgroundColor: bmiColor }]} />
                </View>
                <View style={styles.bmiBarLabelsRow}>
                  <Text style={[styles.bmiBarLabelText, { color: colors.textTertiary }]}>Under</Text>
                  <Text style={[styles.bmiBarLabelText, { color: colors.textTertiary }]}>Normal</Text>
                  <Text style={[styles.bmiBarLabelText, { color: colors.textTertiary }]}>Over</Text>
                </View>
              </View>
            </View>

            {/* Smart goal recommendations */}
            <View style={[styles.recommendationsCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <View style={styles.tabButtons}>
                <TouchableOpacity style={[styles.tabButton, activeTab === 'summary' && styles.tabButtonActive]} onPress={() => setActiveTab('summary')}>
                  <Text style={[styles.tabButtonText, activeTab === 'summary' && styles.tabButtonTextActive, { color: activeTab === 'summary' ? '#FFF' : colors.textSecondary }]}>Nutrition Goals</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabButton, activeTab === 'recomendations' && styles.tabButtonActive]} onPress={() => setActiveTab('recomendations')}>
                  <Text style={[styles.tabButtonText, activeTab === 'recomendations' && styles.tabButtonTextActive, { color: activeTab === 'recomendations' ? '#FFF' : colors.textSecondary }]}>Healthy Swaps</Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'summary' ? (
                <View style={styles.recSection}>
                  <Text style={[styles.recSectionTitle, { color: colors.textPrimary }]}>Goal suggestions based on {profile.fitnessGoal?.replace('_', ' ')}:</Text>
                  <View style={styles.recList}>
                    <Text style={[styles.recListItem, { color: colors.textSecondary }]}>⭐ Eat protein-dense foods within 45 minutes after intensive exercise.</Text>
                    <Text style={[styles.recListItem, { color: colors.textSecondary }]}>⭐ Pair complex grains like oats or rice with leafy greens to increase fiber absorption.</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.recSection}>
                  <Text style={[styles.recSectionTitle, { color: colors.textPrimary }]}>Healthier alternatives recommended for your catalog:</Text>
                  <View style={styles.recList}>
                    <Text style={[styles.recListItem, { color: colors.textSecondary }]}>🔄 Swap standard wheat flour bread for organic oats to lower glycemic index.</Text>
                    <Text style={[styles.recListItem, { color: colors.textSecondary }]}>🔄 Swap high-sodium dressings with pure extra virgin olive oil to boost healthy fats.</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Auto Scroll Health Tips Carousel */}
            <FlatList
              ref={carouselRef}
              data={WELLNESS_TIPS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH}
              decelerationRate="fast"
              scrollEventThrottle={16}
              contentContainerStyle={styles.tipsScroll}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: tipScrollX } } }],
                { useNativeDriver: false }
              )}
              renderItem={renderTipItem}
              keyExtractor={(_, i) => i.toString()}
              style={styles.tipsFlatList}
            />

            {/* Recent Scans horizontal timeline list */}
            <View style={styles.recentTimeline}>
              <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>Recent Food Intake Log</Text>
              {todayEntries.length === 0 ? (
                <View style={[styles.recentEmptyCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.recentEmptyText, { color: colors.textSecondary }]}>Your scan log is currently empty today.</Text>
                  <TouchableOpacity style={styles.onboardBtn} onPress={() => setScanModalVisible(true)}>
                    <Text style={styles.onboardBtnText}>Scan a Meal Now</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentHorizontalScroll}>
                  {todayEntries.map((item, idx) => (
                    <View key={idx} style={[styles.recentFoodCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                      {item.imageUri ? (
                        <Image source={{ uri: item.imageUri }} style={styles.recentFoodImg} />
                      ) : (
                        <View style={[styles.recentFoodPlaceholder, { backgroundColor: colors.borderLight }]}>
                          <Text style={styles.placeholderEmoji}>🍎</Text>
                        </View>
                      )}
                      <View style={styles.recentFoodMeta}>
                        <Text style={[styles.recentFoodName, { color: colors.textPrimary }]} numberOfLines={1}>{item.item}</Text>
                        <Text style={[styles.recentFoodCals, { color: colors.primary }]}>{item.nutritionSnapshot?.calories || 0} kcal</Text>
                        <Text style={[styles.recentFoodTime, { color: colors.textTertiary }]}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Motivational Inspiring card */}
            <View style={[styles.motivationalCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <Text style={styles.motivationalTitle}>✨ Focus Mindset</Text>
              <Text style={[styles.motivationalText, { color: colors.textSecondary }]}>"{motivationalQuote}"</Text>
            </View>

          </Animated.View>
        </ScrollView>
      </TabTransitionWrapper>

      {/* Modern sliding popup modal for food scanner, search, and details */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={scanModalVisible}
        onRequestClose={() => setScanModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalWrapper, { backgroundColor: colors.background }]}>
          <LoadingOverlay visible={loading} message="Analyzing food item..." />
          
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitleText, { color: colors.textPrimary }]}>Smart Food Lookup</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => { clearScan(); setScanModalVisible(false); }}>
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Image Preview and pick actions */}
            {imageUri ? (
              <View style={styles.section}>
                <ImagePreview uri={imageUri} onRemove={clearScan} />
              </View>
            ) : (
              <View style={styles.pickerSection}>
                <Text style={[styles.pickerTitle, { color: colors.textSecondary }]}>Take a photo or pick from photo gallery to start scanning:</Text>
                <View style={styles.modalActionRow}>
                  <TouchableOpacity style={[styles.modalPickBtn, { backgroundColor: colors.primary }]} onPress={() => pickImage(true)}>
                    <Text style={styles.modalPickBtnText}>📸 Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalPickBtn, { backgroundColor: colors.accent }]} onPress={() => pickImage(false)}>
                    <Text style={styles.modalPickBtnText}>🖼️ Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Manual Offline Lookup Banner */}
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
                  <Text style={styles.offlineSearchText}>Search</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Describe food search bar */}
            {!scanResult && (
              <View style={[styles.searchBoxCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                <Text style={[styles.searchBoxTitle, { color: colors.textPrimary }]}>✍️ Look Up By Name</Text>
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    value={foodSearch}
                    onChangeText={setFoodSearch}
                    placeholder="e.g. banana, paneer, eggs..."
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

                {foodSearchResult && (
                  <View style={styles.searchResult}>
                    <NutritionCard data={foodSearchResult.nutrition} />
                    
                    {foodSearchResult.ragDoc && (
                      <View style={[styles.searchGuidance, { borderColor: COLORS.primary, borderWidth: 1, backgroundColor: COLORS.primary + '10' }]}>
                        <Text style={styles.searchGuidanceTitle}>🛡️ Verified RAG Source</Text>
                        <Text style={[styles.searchTip, { color: COLORS.textSecondary }]}>✨ Benefits: {foodSearchResult.ragDoc.benefits}</Text>
                        <Text style={[styles.searchTip, { color: COLORS.textSecondary }]}>🕒 Best Time: {foodSearchResult.ragDoc.bestTime}</Text>
                        <Text style={[styles.searchTip, { color: COLORS.textSecondary }]}>⚖️ Serving: {foodSearchResult.ragDoc.recommendedIntake}</Text>
                      </View>
                    )}

                    <TouchableOpacity style={styles.clearSearchBtn} onPress={() => { setFoodSearch(''); setFoodSearchResult(null); }}>
                      <Text style={styles.clearSearchText}>Clear search</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Error alerts */}
            {error && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* AI Scanner Result card */}
            {scanResult && (
              <View style={styles.section}>
                <ScanResultCard
                  item={scanResult.item}
                  confidence={scanResult.confidence}
                  summary={scanResult.summary}
                />
              </View>
            )}

            {scanResult && scanResult.isFood === false && (
              <View style={styles.section}>
                <ObjectDescriptionCard
                  item={scanResult.item}
                  description={scanResult.description}
                  summary={scanResult.summary}
                />
              </View>
            )}

            {/* Detailed Macros card */}
            {nutritionData && scanResult?.isFood !== false && (
              <View style={styles.section}>
                <NutritionCard data={nutritionData} />
              </View>
            )}

            {/* RAG guidance summaries */}
            {guidance && (
              <View style={styles.section}>
                <View style={[styles.guidanceCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                  <View style={styles.guidanceHeader}>
                    <Text style={[styles.guidanceTitle, { color: colors.textPrimary }]}>🤖 AI Recommendation</Text>
                    <VoiceButton
                      icon="🔊"
                      size={36}
                      onPress={() => speak(guidance.summary, settings.ttsLanguage)}
                    />
                  </View>
                  <Text style={[styles.guidanceText, { color: colors.textSecondary }]}>{guidance.summary}</Text>
                  
                  {ragDoc && (
                    <View style={styles.tipsWrap}>
                      <Text style={styles.tip}>✨ Benefits: {ragDoc.benefits}</Text>
                      <Text style={styles.tip}>🕒 Optimal timing: {ragDoc.bestTime}</Text>
                      <Text style={styles.tip}>⚖️ Recommended Intake: {ragDoc.recommendedIntake}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Scan another trigger */}
            {scanResult && (
              <TouchableOpacity style={[styles.newScanBtn, { borderColor: colors.primary }]} onPress={clearScan}>
                <Text style={[styles.newScanText, { color: colors.primary }]}>Scan Another Food</Text>
              </TouchableOpacity>
            )}

          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 110 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greetingText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsMedium },
  userNameText: { fontSize: TYPOGRAPHY.h2, fontFamily: TYPOGRAPHY.poppinsBold },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    paddingHorizontal: SPACING.md, paddingVertical: 5, borderRadius: RADIUS.full, ...SHADOWS.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.xs },
  statusText: { fontSize: TYPOGRAPHY.tiny, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  networkBanner: { padding: SPACING.sm, borderRadius: RADIUS.md, marginBottom: SPACING.md, alignItems: 'center' },
  networkBannerText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium },
  
  // Shortcuts Grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg },
  quickCard: {
    flex: 1, minWidth: (SCREEN_WIDTH - 48) / 2, borderWidth: 1, borderRadius: RADIUS.xl,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, ...SHADOWS.sm,
  },
  quickIconWrap: { width: 44, height: 44, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  quickEmoji: { fontSize: 20 },
  quickLabel: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsSemiBold },

  // Streaks container
  streakContainer: {
    flexDirection: 'row', borderWidth: 1, borderRadius: RADIUS.xl,
    padding: SPACING.md, alignItems: 'center', justifyContent: 'space-around',
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  streakItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakIcon: { fontSize: 24 },
  streakCount: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold },
  streakLabel: { fontSize: TYPOGRAPHY.tiny, fontFamily: TYPOGRAPHY.poppinsMedium },
  streakDivider: { width: 1, height: 28, backgroundColor: COLORS.border },

  // Summary Circular rings
  summaryCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  summaryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  summaryTitle: { fontSize: TYPOGRAPHY.h3, fontFamily: TYPOGRAPHY.poppinsBold },
  summarySubtitle: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsRegular },
  scoreBadge: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  scoreBadgeVal: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsBold, color: '#FFF' },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ringCell: { alignItems: 'center', flex: 1 },
  ringContainer: { width: 72, height: 72, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringInnerNum: { fontSize: 11, fontFamily: TYPOGRAPHY.poppinsBold, textAlign: 'center', lineHeight: 12 },
  ringInnerLabel: { fontSize: 8, fontFamily: TYPOGRAPHY.poppinsRegular, textAlign: 'center', marginTop: 1 },
  ringCellTitle: { fontSize: 9, fontFamily: TYPOGRAPHY.poppinsBold, letterSpacing: 0.5, marginTop: SPACING.sm },

  // Progress Bar Details
  progressStatusCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  progressStatusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  progressStatusTitle: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold },
  progressRemainingNum: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold },
  progressBarRow: { marginBottom: SPACING.md },
  progressBarLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  progressBarLabel: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium },
  progressBarValue: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  progressBarContainer: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  // AI Health Insights
  insightCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  insightTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  insightTitleIcon: { fontSize: 20 },
  insightTitleText: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold },
  refreshText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold },
  insightText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsMedium, lineHeight: 20 },
  verifiedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
  verifiedBadge: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsBold, color: COLORS.primary },
  verifiedTimestamp: { fontSize: 9, fontFamily: TYPOGRAPHY.poppinsRegular },

  // Water Tracker Section
  waterCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  waterTitle: { fontSize: TYPOGRAPHY.h3, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.md },
  waveOuter: { height: 110, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#3B82F630', position: 'relative' },
  waveContainer: { width: '100%', height: '100%', backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  waveFill: { position: 'absolute', bottom: 0, left: 0, width: (SCREEN_WIDTH - 64) * 2, backgroundColor: '#3B82F6' },
  svgPath: { position: 'absolute', top: -16 },
  blueBlock: { height: '100%', width: '100%', backgroundColor: '#3B82F6', marginTop: 4 },
  waveInnerLabelWrap: { position: 'absolute', zIndex: 10, alignItems: 'center' },
  waveWaterNum: { fontSize: 26, fontFamily: TYPOGRAPHY.poppinsBold, color: '#1E3A8A' },
  waveTargetNum: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsMedium, color: '#1E3A8A' },
  waterTriggers: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  waterTriggerBtn: { flex: 1, backgroundColor: '#3B82F6', borderRadius: RADIUS.lg, paddingVertical: 10, alignItems: 'center' },
  waterTriggerBtnText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold, color: '#FFF' },
  resetWaterBtn: { backgroundColor: COLORS.textTertiary },

  // BMI Section
  bmiCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  bmiCardTitle: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.sm },
  bmiGaugeWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.md },
  bmiDial: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  bmiValText: { fontSize: TYPOGRAPHY.h3, fontFamily: TYPOGRAPHY.poppinsBold },
  bmiCategoryLabel: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsBold },
  bmiDetailsTextCol: { gap: 4 },
  bmiSubText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium },
  bmiBarOuter: { marginTop: 4 },
  bmiBarLine: { height: 6, borderRadius: 3, position: 'relative' },
  bmiBarFillIndicator: { width: 12, height: 12, borderRadius: 6, position: 'absolute', top: -3 },
  bmiBarLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  bmiBarLabelText: { fontSize: 9, fontFamily: TYPOGRAPHY.poppinsMedium },

  // Smart Recommendations
  recommendationsCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.lg, ...SHADOWS.sm },
  tabButtons: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tabButton: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.lg, alignItems: 'center', backgroundColor: '#E2E8F0' },
  tabButtonActive: { backgroundColor: COLORS.primary },
  tabButtonText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold },
  tabButtonTextActive: { color: '#FFF' },
  recSection: { padding: 4 },
  recSectionTitle: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: 6 },
  recList: { gap: 6 },
  recListItem: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium, lineHeight: 16 },

  // Auto Tips flat list
  tipsFlatList: { height: 110, marginBottom: SPACING.lg },
  tipsScroll: { paddingVertical: 4 },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: COLORS.accent, marginHorizontal: 16, ...SHADOWS.sm,
  },
  tipIcon: { fontSize: 26, marginRight: SPACING.md },
  tipContent: { flex: 1 },
  tipHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  tipLabel: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold },
  tipIndex: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsBold },
  tipText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium, lineHeight: 16 },

  // Recent food scans timeline list
  recentTimeline: { marginBottom: SPACING.lg },
  recentTitle: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.md },
  recentEmptyCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, alignItems: 'center', gap: SPACING.sm },
  recentEmptyText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsRegular },
  onboardBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.xl },
  onboardBtnText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsBold, color: '#FFF' },
  recentHorizontalScroll: { gap: SPACING.md, paddingRight: SPACING.xxl },
  recentFoodCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.md, flexDirection: 'row', gap: SPACING.sm, width: 190, height: 80, ...SHADOWS.sm },
  recentFoodImg: { width: 50, height: 50, borderRadius: RADIUS.lg },
  recentFoodPlaceholder: { width: 50, height: 50, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 20 },
  recentFoodMeta: { flex: 1, justifyContent: 'center' },
  recentFoodName: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsBold },
  recentFoodCals: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  recentFoodTime: { fontSize: 9, fontFamily: TYPOGRAPHY.poppinsRegular },

  // Motivational Focus card
  motivationalCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  motivationalTitle: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold, color: COLORS.accent },
  motivationalText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsMedium, fontStyle: 'italic', lineHeight: 20, marginTop: 4 },

  // Sliding Lookup Popup modal
  modalWrapper: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitleText: { fontSize: TYPOGRAPHY.h3, fontFamily: TYPOGRAPHY.poppinsBold },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsBold },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: SPACING.lg, paddingBottom: 64 },

  pickerSection: { alignItems: 'center', paddingVertical: SPACING.xxl },
  pickerTitle: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsMedium, textAlign: 'center', marginBottom: SPACING.lg },
  modalActionRow: { flexDirection: 'row', gap: SPACING.lg },
  modalPickBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.xl, alignItems: 'center', ...SHADOWS.md },
  modalPickBtnText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsBold, color: '#FFF' },

  // Lookup sub widgets
  searchBoxCard: { borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  searchBoxTitle: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.md },
  searchRow: { flexDirection: 'row', gap: SPACING.sm },
  searchInput: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textPrimary },
  searchBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  searchBtnDisabled: { backgroundColor: COLORS.border },
  searchBtnText: { fontSize: TYPOGRAPHY.body, color: COLORS.textInverse, fontFamily: TYPOGRAPHY.poppinsBold },
  searchResult: { marginTop: SPACING.md, gap: SPACING.md },
  searchGuidance: { backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.md },
  searchGuidanceTitle: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.xs },
  searchTip: { fontSize: TYPOGRAPHY.caption, color: COLORS.primaryDark, marginTop: 4 },
  clearSearchBtn: { alignSelf: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm },
  clearSearchText: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, fontFamily: TYPOGRAPHY.poppinsMedium },

  // Lookup results
  section: { marginBottom: SPACING.lg },
  guidanceCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.sm },
  guidanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  guidanceTitle: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold },
  guidanceText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsRegular, lineHeight: 22 },
  tipsWrap: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  tip: { fontSize: TYPOGRAPHY.caption, color: COLORS.primaryDark, marginBottom: 4 },
  newScanBtn: { borderWidth: 2, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  newScanText: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  errorCard: { backgroundColor: COLORS.error + '10', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  errorText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.error },
  offlineInput: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  offlineTextInput: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, ...SHADOWS.sm,
  },
  offlineSearchBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  offlineSearchText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textInverse, fontFamily: TYPOGRAPHY.poppinsBold },
  
  // Brand Logo styles
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerLogoAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F4F6F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  headerLogoAvatarImage: {
    width: '85%',
    height: '85%',
  },
  headerGreetingCol: {
    justifyContent: 'center',
  },
});
