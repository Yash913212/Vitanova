import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../utils/theme';
import { useAppTheme } from '../hooks/useAppTheme';

const LANG_ACCENT = { en: COLORS.primary, hi: '#FF6B35', te: '#8B5CF6' };

export default function ChatBubble({ message, onSpeak, language = 'en', index = 0 }) {
  const { colors } = useAppTheme();
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 40 : -40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const delay = Math.min(index * 50, 200);
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 100, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  const accentColor = LANG_ACCENT[language] || COLORS.primary;

  return (
    <Animated.View
      style={[
        styles.row,
        isUser && styles.rowUser,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: accentColor + '18' }]}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: accentColor }]
            : [styles.bubbleAI, { backgroundColor: colors.surfaceAlt }],
        ]}
      >
        <Text style={[styles.text, isUser ? styles.textUser : [styles.textAI, { color: colors.textPrimary }]]}>
          {message.content}
        </Text>
        {!isUser && onSpeak && (
          <TouchableOpacity
            onPress={() => onSpeak(message.content)}
            style={styles.speakBtn}
            activeOpacity={0.6}
          >
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
        )}
      </View>
      {isUser && (
        <View style={[styles.avatarUser, { backgroundColor: colors.primarySurface }]}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  avatarUser: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  avatarText: { fontSize: 16 },
  bubble: {
    maxWidth: '75%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAI: {
    backgroundColor: COLORS.surfaceAlt,
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: TYPOGRAPHY.bodySmall, lineHeight: 22 },
  textUser: { color: COLORS.textInverse },
  textAI: { color: COLORS.textPrimary },
  speakBtn: { marginTop: 6, alignSelf: 'flex-end' },
  speakIcon: { fontSize: 14 },
});
