import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useAppTheme } from '../hooks/useAppTheme';

const STORAGE_KEY_WATER = 'vitanova_hydration_today';
const STORAGE_KEY_DATE = 'vitanova_hydration_date';

function ProgressRing({ size = 94, strokeWidth = 8, percentage = 0, color, gradStart, gradStop, colors, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
  
  const activeColors = colors || COLORS;

  return (
    <View style={styles.ringContainer}>
      <View style={styles.svgWrap}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id={`grad_${gradStart.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradStart} />
              <Stop offset="100%" stopColor={gradStop} />
            </LinearGradient>
          </Defs>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={activeColors.borderLight}
            strokeWidth={strokeWidth - 1}
            fill="transparent"
          />
          {/* Active Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#grad_${gradStart.replace('#', '')})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {/* Absolute Center Content */}
        <View style={styles.centerContent}>
          {children}
        </View>
      </View>
    </View>
  );
}

export default function DailyProgress({ loggedCalories = 0, loggedProtein = 0 }) {
  const { colors } = useAppTheme();
  const [hydration, setHydration] = useState(1.6); // Seed with 1.6L to look awesome out of the box!
  const targetCalories = 2000;
  const targetProtein = 120;
  const targetHydration = 2.0;

  // Actual base + logged
  const totalCalories = 1360 + loggedCalories;
  const totalProtein = 68 + loggedProtein;

  useEffect(() => {
    // Load persisted water for today
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
          // Reset to seed 1.6L for new days
          await AsyncStorage.setItem(STORAGE_KEY_DATE, todayDate);
          await AsyncStorage.setItem(STORAGE_KEY_WATER, '1.6');
          setHydration(1.6);
        }
      } catch (e) {
        console.warn('AsyncStorage error loading hydration:', e);
      }
    })();
  }, []);

  const addWater = async () => {
    try {
      const nextWater = parseFloat((Math.min(targetHydration + 1.0, hydration + 0.2)).toFixed(1));
      setHydration(nextWater);
      await AsyncStorage.setItem(STORAGE_KEY_WATER, nextWater.toString());
      await AsyncStorage.setItem(STORAGE_KEY_DATE, new Date().toDateString());
    } catch (e) {
      console.warn('AsyncStorage error saving hydration:', e);
    }
  };

  const resetWater = async () => {
    try {
      setHydration(0);
      await AsyncStorage.setItem(STORAGE_KEY_WATER, '0');
    } catch (e) {
      console.warn('AsyncStorage error resetting hydration:', e);
    }
  };

  // Percentages
  const calPercent = (totalCalories / targetCalories) * 100;
  const protPercent = (totalProtein / targetProtein) * 100;
  const waterPercent = (hydration / targetHydration) * 100;

  return (
    <View style={[styles.card, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Daily Progress</Text>
      
      <View style={styles.ringsRow}>
        {/* Ring 1: Calories */}
        <View style={styles.progressItem}>
          <ProgressRing
            percentage={calPercent}
            color={COLORS.primary}
            gradStart="#10B981"
            gradStop="#059669"
            colors={colors}
          >
            <Text style={[styles.valueNumber, { color: colors.textPrimary }]}>{totalCalories.toLocaleString()}</Text>
            <Text style={[styles.valueUnit, { color: colors.textSecondary }]}>kcal</Text>
          </ProgressRing>
          <Text style={[styles.label, { color: colors.textSecondary }]}>CALORIES</Text>
        </View>

        {/* Ring 2: Proteins */}
        <View style={styles.progressItem}>
          <ProgressRing
            percentage={protPercent}
            color={COLORS.accent}
            gradStart="#8B5CF6"
            gradStop="#7C3AED"
            colors={colors}
          >
            <Text style={[styles.valueNumber, { color: colors.textPrimary }]}>{totalProtein}g</Text>
            <Text style={[styles.valueSub, { color: colors.textTertiary }]}>/ {targetProtein}g</Text>
          </ProgressRing>
          <Text style={[styles.label, { color: colors.textSecondary }]}>PROTEINS</Text>
        </View>

        {/* Ring 3: Hydration */}
        <TouchableOpacity style={styles.progressItem} onPress={addWater} onLongPress={resetWater} activeOpacity={0.85}>
          <ProgressRing
            percentage={waterPercent}
            color="#3B82F6"
            gradStart="#3B82F6"
            gradStop="#2563EB"
            colors={colors}
          >
            <Text style={[styles.valueNumber, { color: colors.textPrimary }]}>{hydration}L</Text>
            <Text style={[styles.valueSub, { color: colors.textTertiary }]}>/ {targetHydration}L</Text>
          </ProgressRing>
          <Text style={[styles.label, { color: colors.textSecondary }]}>HYDRATION</Text>
          <Text style={styles.tapTip}>+0.2L Tap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.poppinsBold,
    marginBottom: SPACING.md,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  ringContainer: {
    width: 94,
    height: 94,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  svgWrap: {
    position: 'relative',
    width: 94,
    height: 94,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  valueNumber: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.poppinsBold,
    textAlign: 'center',
    lineHeight: 14,
  },
  valueUnit: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.poppinsMedium,
    textAlign: 'center',
    marginTop: 1,
  },
  valueSub: {
    fontSize: 9,
    color: COLORS.textTertiary,
    fontFamily: TYPOGRAPHY.poppinsRegular,
    textAlign: 'center',
    marginTop: 1,
  },
  label: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.poppinsBold,
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  tapTip: {
    fontSize: 8,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.poppinsMedium,
    marginTop: 2,
  },
});
