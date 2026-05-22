/**
 * NutriVision AI — Translation Indicator
 * Animated pulse that shows when AI is translating between languages.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../utils/theme';

const LANG_LABELS = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు' };

export default function TranslationIndicator({ isTranslating, fromLang, toLang }) {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTranslating) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 600, useNativeDriver: true }),
        ])
      );

      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      pulse.start();
      rotate.start();

      return () => { pulse.stop(); rotate.stop(); };
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [isTranslating]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.iconWrap, { opacity: pulseAnim }]}>
        <Animated.Text style={[styles.icon, { transform: [{ rotate: spin }] }]}>
          🔄
        </Animated.Text>
      </Animated.View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>Translating</Text>
        <Text style={styles.langText}>
          {LANG_LABELS[fromLang] || fromLang} → {LANG_LABELS[toLang] || toLang}
        </Text>
      </View>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { opacity: pulseAnim, transform: [{ scale: pulseAnim }] }]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentSurface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'center',
    gap: SPACING.xs,
  },
  iconWrap: { marginRight: 2 },
  icon: { fontSize: 16 },
  textWrap: { alignItems: 'center' },
  label: { fontSize: TYPOGRAPHY.tiny, color: COLORS.accent, fontWeight: TYPOGRAPHY.bold },
  langText: { fontSize: TYPOGRAPHY.tiny, color: COLORS.textTertiary },
  dots: { flexDirection: 'row', gap: 3, marginLeft: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.accent },
});
