/**
 * NutriVision AI — Animated Subtitle Reveal
 * Word-by-word or character-by-character animated subtitle display.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../utils/theme';

export default function AnimatedSubtitle({ text, language = 'en', visible = true, speed = 'normal' }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [displayedWords, setDisplayedWords] = useState([]);
  const wordAnims = useRef([]).current;

  const durations = { fast: 30, normal: 60, slow: 100 };
  const interval = durations[speed] || 60;

  useEffect(() => {
    if (visible && text) {
      // Fade in container
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      // Word-by-word reveal
      const words = text.split(' ');
      setDisplayedWords([]);
      wordAnims.length = 0;

      words.forEach((word, i) => {
        const anim = new Animated.Value(0);
        wordAnims.push(anim);

        setTimeout(() => {
          setDisplayedWords((prev) => [...prev, word]);
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 120,
            useNativeDriver: true,
          }).start();
        }, i * interval);
      });
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      setDisplayedWords([]);
    }
  }, [text, visible]);

  if (!text || !visible) return null;

  const langIndicator = { en: '🇬🇧', hi: '🇮🇳', te: '🇮🇳' };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.langBadge}>
        <Text style={styles.langFlag}>{langIndicator[language] || '🌐'}</Text>
      </View>
      <View style={styles.textWrap}>
        {displayedWords.map((word, i) => (
          <Animated.Text
            key={`${i}-${word}`}
            style={[
              styles.word,
              {
                opacity: wordAnims[i] || 1,
                transform: [{ scale: wordAnims[i] || 1 }],
              },
            ]}
          >
            {word}{' '}
          </Animated.Text>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langBadge: { marginRight: SPACING.sm, marginTop: 2 },
  langFlag: { fontSize: 16 },
  textWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  word: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
});
