import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../utils/theme';

export default function LoadingOverlay({ visible, message = 'Analyzing...' }) {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(0.3);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Animated.View style={[styles.dot, { opacity: pulse }]}>
          <Text style={styles.emoji}>🧠</Text>
        </Animated.View>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} style={[styles.smallDot, { opacity: pulse }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay,
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.xxl, alignItems: 'center', minWidth: 200,
  },
  dot: { marginBottom: SPACING.md },
  emoji: { fontSize: 48 },
  message: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  dots: { flexDirection: 'row', gap: 6 },
  smallDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
});
