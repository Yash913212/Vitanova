import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export default function TabTransitionWrapper({ children, style }) {
  const isFocused = useIsFocused();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 110,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 9,
          tension: 110,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 12,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
