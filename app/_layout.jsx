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
import { ProfileProvider, useProfile } from '../src/providers/ProfileProvider';
import { HistoryProvider } from '../src/providers/HistoryProvider';
import { NutritionProvider } from '../src/providers/NutritionProvider';
import { AIProvider } from '../src/providers/AIProvider';
import { KnowledgeProvider } from '../src/providers/KnowledgeProvider';
import { COLORS } from '../src/utils/theme';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { initDatabaseAsync } from '../src/services/sqlite/database';
import { useUploadSync } from '../src/hooks/useUploadSync';

function AuthGate() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { profile, loaded: profileLoaded, profileUserEmail } = useProfile();
  const { isDark, colors } = useAppTheme();
  const segments = useSegments();
  const router = useRouter();

  // Activate background upload sync when connected to internet
  useUploadSync();

  useEffect(() => {
    // Only proceed if auth has loaded, and if authenticated, ensure the profile belongs to the CURRENT user
    if (isLoading) return;
    if (isAuthenticated && (!profileLoaded || profileUserEmail !== user?.email)) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
    const onProfilePage = segments[0] === 'profile';

    // Check if the profile needs setup (missing essential fields)
    const needsProfileSetup = !profile.age && !profile.height && !profile.weight;

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in, redirect to login
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Just logged in — always show profile page first
      router.replace('/profile?setup=true');
    } else if (isAuthenticated && onProfilePage) {
      // Already on profile page, don't interfere — let the user complete setup
    }
  }, [isAuthenticated, isLoading, profileLoaded, profileUserEmail, user, segments, profile]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} translucent={false} />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    (async () => {
      try {
        await initDatabaseAsync();
      } catch (err) {
        console.error('[Root Layout] SQLite initialization failed:', err);
      }
    })();
  }, []);

  if (!fontsLoaded) {
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
