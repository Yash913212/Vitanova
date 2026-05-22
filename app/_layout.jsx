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
import { SettingsProvider, useSettings } from '../src/providers/SettingsProvider';
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
  const { settings, loaded: settingsLoaded } = useSettings();
  const { isDark } = useAppTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !settingsLoaded) return;

    const currentRoute = segments[0];
    const isWelcome = currentRoute === 'welcome';
    const isLogin = currentRoute === 'login';
    const isSignup = currentRoute === 'signup';
    const isForgotPassword = currentRoute === 'forgot-password';
    const isProfileSetup = currentRoute === 'profile-setup';

    // 1. Welcome Onboarding check
    if (!settings.has_onboarded) {
      if (!isWelcome) {
        router.replace('/welcome');
      }
      return;
    }

    // 2. Authentication check
    if (!isAuthenticated) {
      const inAuthGroup = isLogin || isSignup || isForgotPassword || isWelcome;
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else {
      // 3. Physical profile configuration check
      if (!settings.has_configured_profile) {
        if (!isProfileSetup) {
          router.replace('/profile-setup');
        }
      } else {
        // Authenticated and set up: bounce away from login/onboarding back to tabs
        const inAuthGroup = isLogin || isSignup || isForgotPassword || isWelcome || isProfileSetup;
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, isLoading, settings, settingsLoaded, segments]);

  if (isLoading || !settingsLoaded) {
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
