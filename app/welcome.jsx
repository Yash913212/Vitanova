/**
 * VitaNova — Onboarding & Welcome Screen
 * Premium animated sliding onboarding carousel introducing key pillars.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
  Dimensions, Image, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettings } from '../src/providers/SettingsProvider';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Smart Food Scanner',
    subtitle: 'Scan your food via camera or gallery. Get detailed calorie counts, macronutrients, and vitamins in milliseconds.',
    icon: '📷',
    badge: 'AI Vision Recognition',
    color: COLORS.primary
  },
  {
    title: 'RAG Health Intelligence',
    subtitle: 'Conversational wellness coaching drawing directly from verified medical guidelines. Available 100% offline.',
    icon: '🤖',
    badge: 'Retrieval-Augmented Generation',
    color: COLORS.accent
  },
  {
    title: 'Real-Time Sync Queue',
    subtitle: 'Automated background cloud backups that sync seamlessly across devices. Designed offline-first.',
    icon: '☁️',
    badge: 'Supabase Cloud Sync',
    color: COLORS.success
  }
];

export default function WelcomeScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const router = useRouter();
  const { updateSetting } = useSettings();

  // Floating ambient animations
  const bubbleY1 = useRef(new Animated.Value(0)).current;
  const bubbleY2 = useRef(new Animated.Value(0)).current;
  const scaleCTA = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ambient floating animations
    const float1 = Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleY1, { toValue: -15, duration: 2500, useNativeDriver: true }),
        Animated.timing(bubbleY1, { toValue: 15, duration: 2500, useNativeDriver: true })
      ])
    );
    const float2 = Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleY2, { toValue: 10, duration: 3000, useNativeDriver: true }),
        Animated.timing(bubbleY2, { toValue: -10, duration: 3000, useNativeDriver: true })
      ])
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleCTA, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(scaleCTA, { toValue: 1, duration: 1200, useNativeDriver: true })
      ])
    );

    float1.start();
    float2.start();
    pulse.start();

    return () => {
      float1.stop();
      float2.stop();
      pulse.stop();
    };
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (slideIndex !== activeSlide && slideIndex >= 0 && slideIndex < SLIDES.length) {
          setActiveSlide(slideIndex);
        }
      }
    }
  );

  const handleNext = async () => {
    if (activeSlide < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeSlide + 1) * SCREEN_WIDTH,
        animated: true
      });
    } else {
      // Completed onboarding
      await updateSetting('has_onboarded', true);
      router.replace('/login');
    }
  };

  const handleSkip = async () => {
    await updateSetting('has_onboarded', true);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative ambient bubbles */}
      <Animated.View style={[styles.decoBubble, styles.bubbleLeft, { transform: [{ translateY: bubbleY1 }] }]} />
      <Animated.View style={[styles.decoBubble, styles.bubbleRight, { transform: [{ translateY: bubbleY2 }] }]} />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Swipeable ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={styles.slideFrame}>
            {/* Visual Icon Container */}
            <View style={[styles.graphicContainer, { backgroundColor: slide.color + '15' }]}>
              <Text style={styles.slideIcon}>{slide.icon}</Text>
              <View style={[styles.badge, { backgroundColor: slide.color }]}>
                <Text style={styles.badgeText}>{slide.badge}</Text>
              </View>
            </View>

            {/* Typography Description Card */}
            <View style={styles.textCard}>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSub}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer Indicators and Actions */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const width = scrollX.interpolate({
              inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp'
            });
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width,
                    opacity,
                    backgroundColor: SLIDES[activeSlide]?.color || COLORS.primary
                  }
                ]}
              />
            );
          })}
        </View>

        {/* CTA Next Button */}
        <Animated.View style={{ transform: [{ scale: scaleCTA }] }}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: SLIDES[activeSlide]?.color || COLORS.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextText}>
              {activeSlide === SLIDES.length - 1 ? 'Get Started 🚀' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl
  },
  scroll: {
    flex: 1
  },
  slideFrame: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl
  },
  graphicContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl,
    position: 'relative',
    ...SHADOWS.md
  },
  slideIcon: {
    fontSize: 84
  },
  badge: {
    position: 'absolute',
    bottom: -10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm
  },
  badgeText: {
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.caption
  },
  textCard: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md
  },
  slideSub: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.xs
  },
  footer: {
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.xxl
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md
  },
  dot: {
    height: 8,
    borderRadius: 4
  },
  nextBtn: {
    width: SCREEN_WIDTH - 2 * SPACING.xxl,
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow(COLORS.primary)
  },
  nextText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: SPACING.xxl,
    zIndex: 10,
    padding: 8
  },
  skipText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium
  },
  decoBubble: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: COLORS.primary + '05'
  },
  bubbleLeft: {
    width: 200,
    height: 200,
    top: 80,
    left: -80
  },
  bubbleRight: {
    width: 150,
    height: 150,
    bottom: 120,
    right: -60,
    backgroundColor: COLORS.accent + '05'
  }
});
