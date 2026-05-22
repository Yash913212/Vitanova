/**
 * VitaNova — Swipable TabLayout with Premium Floating Center AI Action
 * Uses native MaterialTopTabNavigator positioned at the bottom,
 * giving native, highly performant swipe-to-navigate transitions.
 * Features an elegant, floating glassmorphic tab bar and elevated AI action button.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS } from '../../src/utils/theme';
import { useAppTheme } from '../../src/hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Create Expo Router-compatible Material Top Tabs Navigator
const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

const TAB_INFO = {
  index: { label: 'Home', icon: '🏠' },
  diet: { label: 'Diet', icon: '🥗' },
  assistant: { label: 'AI', icon: '🤖' },
  history: { label: 'Log', icon: '📋' },
  settings: { label: 'Settings', icon: '⚙️' },
};

function CustomTabButton({ routeName, focused, onPress }) {
  const { colors, isDark } = useAppTheme();
  const info = TAB_INFO[routeName] || { label: routeName, icon: '❓' };
  const isCenter = routeName === 'assistant';

  // Animation values
  const scaleAnim = useRef(new Animated.Value(isCenter ? 1.05 : 0.9)).current;
  const translateAnim = useRef(new Animated.Value(isCenter ? -10 : 0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelSlide = useRef(new Animated.Value(-8)).current;
  const dotScale = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);

  // AI breathing pulse ring animations
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isCenter) {
      // Loop pulse animation representing a soft futuristic AI heart
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseScale, { toValue: 1.35, duration: 1800, useNativeDriver: true }),
            Animated.timing(pulseScale, { toValue: 1.0, duration: 1800, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, { toValue: 0.08, duration: 1800, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.35, duration: 1800, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [isCenter]);

  useEffect(() => {
    clearTimeout(hideTimer.current);

    if (focused) {
      // Reset label values to play animation again on switch
      labelOpacity.setValue(0);
      labelSlide.setValue(-8);

      // Bounce tab item
      scaleAnim.setValue(isCenter ? 1.05 : 0.85);
      if (isCenter) {
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1.2, friction: 5, tension: 180, useNativeDriver: true }),
          Animated.spring(translateAnim, { toValue: -20, friction: 5, tension: 180, useNativeDriver: true }),
        ]).start();
      } else {
        Animated.spring(scaleAnim, { toValue: 1.12, friction: 5, tension: 180, useNativeDriver: true }).start();
        Animated.timing(bgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      }

      // Show dot
      dotScale.setValue(0);
      Animated.spring(dotScale, {
        toValue: 1, friction: 5, tension: 150, useNativeDriver: true,
      }).start();

      // Slide label in
      Animated.parallel([
        Animated.timing(labelOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(labelSlide, { toValue: 0, friction: 8, tension: 100, useNativeDriver: true }),
      ]).start();

      // Auto-hide label after 1.5s
      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(labelOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(labelSlide, { toValue: -8, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 1500);
    } else {
      // Shrink tab item when unfocused
      if (isCenter) {
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1.05, friction: 6, tension: 100, useNativeDriver: true }),
          Animated.spring(translateAnim, { toValue: -10, friction: 6, tension: 100, useNativeDriver: true }),
        ]).start();
      } else {
        Animated.spring(scaleAnim, { toValue: 0.9, friction: 6, tension: 100, useNativeDriver: true }).start();
        Animated.timing(bgOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }

      // Hide dot + label
      Animated.timing(dotScale, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      Animated.timing(labelOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }

    return () => clearTimeout(hideTimer.current);
  }, [focused]);

  if (isCenter) {
    return (
      <View style={styles.centerTabContainer}>
        {/* Animated label above the floating center action */}
        <Animated.Text
          style={[
            styles.tabLabel,
            styles.centerTabLabel,
            { color: focused ? colors.primary : colors.textTertiary },
            { opacity: labelOpacity, transform: [{ translateY: labelSlide }] },
          ]}
          numberOfLines={1}
        >
          {info.label}
        </Animated.Text>

        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          {/* Animated AI Pulse Ring */}
          <Animated.View
            style={[
              styles.aiPulseRing,
              {
                backgroundColor: isDark ? colors.accent : colors.primary,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              }
            ]}
          />
          
          <Animated.View
            style={[
              styles.floatingCenterBtn,
              focused && styles.floatingCenterBtnActive,
              { borderColor: isDark ? '#151F32' : '#FFFFFF' },
              { transform: [{ scale: scaleAnim }, { translateY: translateAnim }] },
              focused && { backgroundColor: colors.accent },
            ]}
          >
            <Text style={styles.floatingCenterIcon}>{info.icon}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.tabItem}>
      {/* Label floats above icon */}
      <Animated.Text
        style={[
          styles.tabLabel,
          { color: focused ? colors.primary : colors.textTertiary },
          { opacity: labelOpacity, transform: [{ translateY: labelSlide }] },
        ]}
        numberOfLines={1}
      >
        {info.label}
      </Animated.Text>

      {/* Icon */}
      <Animated.Text style={[styles.tabIcon, { transform: [{ scale: scaleAnim }] }]}>
        {info.icon}
      </Animated.Text>

      {/* Under dot */}
      <Animated.View style={[styles.activeDot, { backgroundColor: colors.primary, transform: [{ scale: dotScale }] }]} />
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation, position }) {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate dynamic floating pill width based on screen width
  const containerWidth = SCREEN_WIDTH - 32;
  const tabWidth = containerWidth / 5;

  // Fluid sliding tab background movement synced with finger swiping
  const translateX = position.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      tabWidth * 0 + 6,
      tabWidth * 1 + 6,
      tabWidth * 2 + 6,
      tabWidth * 3 + 6,
      tabWidth * 4 + 6,
    ],
  });

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          bottom: Math.max(insets.bottom, 12),
          backgroundColor: isDark ? 'rgba(21, 31, 50, 0.88)' : 'rgba(255, 255, 255, 0.92)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
        }
      ]}
    >
      {/* Sliding Active Tab Background Glow Indicator */}
      <Animated.View
        style={[
          styles.slidingIndicator,
          {
            width: tabWidth - 12,
            transform: [{ translateX }],
            borderColor: isDark ? 'rgba(139, 92, 246, 0.45)' : 'rgba(16, 185, 129, 0.38)',
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.08)',
          }
        ]}
      />

      {state.routes.map((route, index) => {
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <CustomTabButton
            key={route.key}
            routeName={route.name}
            focused={focused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { isDark } = useAppTheme();
  return (
    <MaterialTopTabs
      key={isDark ? 'dark' : 'light'}
      tabBarPosition="bottom"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        lazy: true,
      }}
    >
      <MaterialTopTabs.Screen name="index" options={{ title: 'Home' }} />
      <MaterialTopTabs.Screen name="diet" options={{ title: 'Diet' }} />
      <MaterialTopTabs.Screen name="assistant" options={{ title: 'AI' }} />
      <MaterialTopTabs.Screen name="history" options={{ title: 'Log' }} />
      <MaterialTopTabs.Screen name="settings" options={{ title: 'Settings' }} />
    </MaterialTopTabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 66,
    borderRadius: 33,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderWidth: 1,
    elevation: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    paddingTop: 8,
  },
  slidingIndicator: {
    position: 'absolute',
    left: 0,
    top: 11,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabIcon: {
    fontSize: 23,
    zIndex: 1,
    marginTop: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.semiBold,
    marginBottom: 0,
    zIndex: 2,
    position: 'absolute',
    top: 2,
    fontFamily: TYPOGRAPHY.poppinsBold,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
    marginBottom: 4,
  },
  // Floating Center AI Button Styling
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  centerTabLabel: {
    top: -26,
  },
  floatingCenterBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingCenterBtnActive: {
    backgroundColor: COLORS.accent,
    shadowColor: '#8B5CF6',
  },
  floatingCenterIcon: {
    fontSize: 28,
  },
  aiPulseRing: {
    position: 'absolute',
    alignSelf: 'center',
    width: 66,
    height: 66,
    borderRadius: 33,
    top: -14,
    zIndex: -1,
  },
});
