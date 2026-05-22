import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../utils/theme';

export default function VoiceButton({ onPress, isActive, icon = '🔊', size = 48 }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [isActive]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.btn, { width: size, height: size, borderRadius: size / 2 },
          isActive && styles.btnActive]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>{icon}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.accentSurface, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.sm,
  },
  btnActive: { backgroundColor: COLORS.accent, ...SHADOWS.glow(COLORS.accent) },
  icon: { fontSize: 22 },
});
