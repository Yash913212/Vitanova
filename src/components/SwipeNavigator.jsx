/**
 * SwipeNavigator — Edge-only swipe to switch tabs.
 * Only captures swipes starting from the left/right 30px edges.
 */
import React, { useRef, useState } from 'react';
import { View, PanResponder, Dimensions, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const EDGE_WIDTH = 30;
const SWIPE_THRESHOLD = 60;

const TAB_ORDER = [
  '/(tabs)',
  '/(tabs)/diet',
  '/(tabs)/assistant',
  '/(tabs)/history',
  '/(tabs)/settings',
];

const TAB_ALIASES = {
  '/': 0,
  '/(tabs)': 0,
  '/(tabs)/index': 0,
  '/(tabs)/diet': 1,
  '/(tabs)/assistant': 2,
  '/(tabs)/history': 3,
  '/(tabs)/settings': 4,
};

export default function SwipeNavigator({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);

  const getCurrentIndex = () => {
    if (TAB_ALIASES[pathname] !== undefined) return TAB_ALIASES[pathname];
    for (const [path, idx] of Object.entries(TAB_ALIASES)) {
      if (pathname.startsWith(path) && path !== '/') return idx;
    }
    return 0;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        const x = evt.nativeEvent.pageX;
        // Only capture touches starting at screen edges
        return x < EDGE_WIDTH || x > SCREEN_WIDTH - EDGE_WIDTH;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const x = evt.nativeEvent.pageX;
        const isEdge = startX.current < EDGE_WIDTH || startX.current > SCREEN_WIDTH - EDGE_WIDTH;
        return isEdge && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 15;
      },
      onPanResponderGrant: (evt) => {
        startX.current = evt.nativeEvent.pageX;
        setSwiping(true);
      },
      onPanResponderRelease: (_, gestureState) => {
        setSwiping(false);
        const { dx } = gestureState;
        const currentIndex = getCurrentIndex();

        if (dx > SWIPE_THRESHOLD && currentIndex > 0) {
          router.replace(TAB_ORDER[currentIndex - 1]);
        } else if (dx < -SWIPE_THRESHOLD && currentIndex < TAB_ORDER.length - 1) {
          router.replace(TAB_ORDER[currentIndex + 1]);
        }
      },
      onPanResponderTerminate: () => {
        setSwiping(false);
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
