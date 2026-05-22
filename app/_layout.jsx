/**
 * NutriVision AI — Root Layout
 * Wraps the entire app with all providers.
 * Handles auth gate: redirects to login/signup if not authenticated.
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../src/providers/AuthProvider';
import { SettingsProvider } from '../src/providers/SettingsProvider';
import { ProfileProvider } from '../src/providers/ProfileProvider';
import { HistoryProvider } from '../src/providers/HistoryProvider';
import { NutritionProvider } from '../src/providers/NutritionProvider';
import { AIProvider } from '../src/providers/AIProvider';
import { KnowledgeProvider } from '../src/providers/KnowledgeProvider';
import { COLORS } from '../src/utils/theme';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useAppTheme } from '../src/hooks/useAppTheme';

import { initializeDatabase } from '../src/database/initDB.js';
import { seedDatabase } from '../src/database/seedFoods.js';

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useAppTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in, redirect to login
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Already logged in, redirect to app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [dbReady, setDbReady] = React.useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initializeDatabase();
        await seedDatabase();
        setDbReady(true);
      } catch (err) {
        console.error('[RootLayout] Database bootstrap failed:', err);
        setDbReady(true); // Don't block user permanently
      }
    })();
  }, []);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <ProfileProvider>
            <NutritionProvider>
              <HistoryProvider>
                <KnowledgeProvider>
                  <AIProvider>
                    <AuthGate />
                  </AIProvider>
                </KnowledgeProvider>
              </HistoryProvider>
            </NutritionProvider>
          </ProfileProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
