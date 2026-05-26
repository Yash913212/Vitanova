import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnimatedScoreIndicator({
  score = 0,
  maxScore = 100,
  size = 80,
  strokeWidth = 8,
  title = '',
  gradientColors = ['#10B981', '#059669'],
  gradientId = 'scoreGrad',
  duration = 1200,
  delay = 0,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: score,
        duration: duration,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: false, // strokeDashoffset cannot be animated using native drivers in SVG
      }),
    ]).start();
  }, [score, delay, duration]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, maxScore],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
          {/* Background Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth - 2}
            fill="transparent"
            opacity={0.15}
          />
          {/* Animated SVG Path */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.textContainer}>
          <Text style={[styles.scoreText, { fontSize: size * 0.22, color: gradientColors[0] }]}>
            {Math.round(score)}
          </Text>
        </View>
      </View>
      {title ? <Text style={styles.titleText}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: '800',
    fontFamily: 'System',
  },
  titleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
