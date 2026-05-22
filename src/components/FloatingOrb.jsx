/**
 * NutriVision AI — Breathing Glowing Floating AI Orb Component
 * Premium visual indicator of conversational AI presence and audio tracking.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { COLORS, SHADOWS } from '../utils/theme';

export default function FloatingOrb({ isActive = false, size = 'medium' }) {
  // Animation hooks
  const scaleVal = useRef(new Animated.Value(1)).current;
  const floatVal = useRef(new Animated.Value(0)).current;
  const glowVal = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1. Core breathing cycle
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleVal, {
          toValue: isActive ? 1.15 : 1.05,
          duration: isActive ? 1000 : 2000,
          useNativeDriver: true
        }),
        Animated.timing(scaleVal, {
          toValue: 0.95,
          duration: isActive ? 1000 : 2000,
          useNativeDriver: true
        })
      ])
    );

    // 2. Core floating cycle
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatVal, {
          toValue: isActive ? -8 : -15,
          duration: isActive ? 1500 : 3000,
          useNativeDriver: true
        }),
        Animated.timing(floatVal, {
          toValue: isActive ? 8 : 15,
          duration: isActive ? 1500 : 3000,
          useNativeDriver: true
        })
      ])
    );

    // 3. Ambient glow pulse cycle
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowVal, {
          toValue: isActive ? 0.95 : 0.6,
          duration: isActive ? 800 : 2500,
          useNativeDriver: true
        }),
        Animated.timing(glowVal, {
          toValue: isActive ? 0.4 : 0.2,
          duration: isActive ? 800 : 2500,
          useNativeDriver: true
        })
      ])
    );

    breathe.start();
    float.start();
    glow.start();

    return () => {
      breathe.stop();
      float.stop();
      glow.stop();
    };
  }, [isActive]);

  const getOrbSize = () => {
    switch (size) {
      case 'small': return { width: 50, height: 50, radius: 25 };
      case 'large': return { width: 140, height: 140, radius: 70 };
      default: return { width: 90, height: 90, radius: 45 };
    }
  };

  const dims = getOrbSize();

  return (
    <View style={styles.container}>
      {/* Outer ambient glow halo */}
      <Animated.View
        style={[
          styles.glowHalo,
          {
            width: dims.width * 1.5,
            height: dims.height * 1.5,
            borderRadius: dims.radius * 1.5,
            opacity: glowVal,
            backgroundColor: isActive ? COLORS.accent : COLORS.primary,
            transform: [{ scale: scaleVal }, { translateY: floatVal }]
          }
        ]}
      />

      {/* Main Glassmorphic Orb Body */}
      <Animated.View
        style={[
          styles.orbBody,
          {
            width: dims.width,
            height: dims.height,
            borderRadius: dims.radius,
            borderColor: isActive ? COLORS.accent + '60' : COLORS.primary + '60',
            transform: [{ scale: scaleVal }, { translateY: floatVal }],
            shadowColor: isActive ? COLORS.accent : COLORS.primary
          }
        ]}
      >
        {/* Core light reflection dot */}
        <View style={styles.reflection} />
        {/* Inner energy core */}
        <View style={[
          styles.coreEnergy,
          {
            width: dims.width * 0.4,
            height: dims.height * 0.4,
            borderRadius: dims.radius * 0.4,
            backgroundColor: isActive ? '#00E5FF' : '#10B981'
          }
        ]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    position: 'relative'
  },
  glowHalo: {
    position: 'absolute',
    alignSelf: 'center',
    filter: 'blur(20px)'
  },
  orbBody: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...SHADOWS.glow(COLORS.primary),
    shadowRadius: 15,
    elevation: 8
  },
  reflection: {
    position: 'absolute',
    top: 6,
    left: '20%',
    width: '20%',
    height: '20%',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.65)'
  },
  coreEnergy: {
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3
  }
});
