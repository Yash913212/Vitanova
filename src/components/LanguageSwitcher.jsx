/**
 * NutriVision AI — Language Switcher
 * Animated pill-based language selector with smooth transitions.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../utils/theme';
import { useAppTheme } from '../hooks/useAppTheme';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧', color: '#2E7D32' },
  { code: 'hi', label: 'हिं', name: 'Hindi', flag: '🇮🇳', color: '#FF6B35' },
  { code: 'te', label: 'తె', name: 'Telugu', flag: '🇮🇳', color: '#8B5CF6' },
];

export default function LanguageSwitcher({ activeLanguage, onSelect }) {
  const { colors } = useAppTheme();
  const scaleAnims = useRef(LANGUAGES.map(() => new Animated.Value(1))).current;
  const bgAnims = useRef(LANGUAGES.map(() => new Animated.Value(0))).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    LANGUAGES.forEach((lang, i) => {
      const isActive = lang.code === activeLanguage;
      Animated.parallel([
        Animated.spring(scaleAnims[i], {
          toValue: isActive ? 1.08 : 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnims[i], {
          toValue: isActive ? 1 : 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    });

    // Pulse glow on switch
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [activeLanguage]);

  return (
    <View style={styles.container}>
      {LANGUAGES.map((lang, i) => {
        const isActive = lang.code === activeLanguage;
        const bgColor = bgAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [colors.surfaceAlt, lang.color + '20'],
        });

        return (
          <Animated.View
            key={lang.code}
            style={[
              { transform: [{ scale: scaleAnims[i] }] },
            ]}
          >
            <TouchableOpacity
              onPress={() => onSelect(lang.code)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.pill,
                  { backgroundColor: bgColor, borderColor: colors.border },
                  isActive && { borderColor: lang.color, borderWidth: 1.5 },
                ]}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.label,
                    { color: colors.textSecondary },
                    isActive && { color: lang.color, fontWeight: TYPOGRAPHY.bold },
                  ]}
                >
                  {lang.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  flag: { fontSize: 16 },
  label: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
});
