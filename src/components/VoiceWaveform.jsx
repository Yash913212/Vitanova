/**
 * NutriVision AI — Animated Voice Waveform
 * Shows pulsing audio bars during speech.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

const BAR_COUNT = 5;
const LANG_COLORS = {
  en: COLORS.primary,
  hi: '#FF6B35',
  te: '#8B5CF6',
};

export default function VoiceWaveform({ isActive, language = 'en', size = 'medium' }) {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isActive) {
      const animations = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 0.4 + Math.random() * 0.6,
              duration: 200 + i * 80,
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 0.2 + Math.random() * 0.3,
              duration: 250 + i * 60,
              useNativeDriver: true,
            }),
          ])
        )
      );
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    } else {
      bars.forEach((bar) => {
        Animated.timing(bar, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isActive]);

  const color = LANG_COLORS[language] || COLORS.primary;
  const barHeight = size === 'large' ? 40 : size === 'small' ? 18 : 28;
  const barWidth = size === 'large' ? 6 : size === 'small' ? 3 : 4;
  const gap = size === 'large' ? 5 : 3;

  return (
    <View style={[styles.container, { gap }]}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              width: barWidth,
              height: barHeight,
              backgroundColor: color,
              borderRadius: barWidth / 2,
              transform: [{ scaleY: bar }],
              opacity: isActive ? 1 : 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  bar: {},
});
