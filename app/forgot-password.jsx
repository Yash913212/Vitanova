/**
 * VitaNova — Forgot Password Screen
 * Premium password recovery connected to Supabase Auth.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Animated, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../src/services/supabase/client.js';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Animation values
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true })
    ]).start();
  }, []);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Field', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'vitanova://reset-password'
      });
      if (error) throw error;
      Alert.alert(
        'Email Sent 📧',
        'A secure password reset link has been dispatched to your email. Check your spam folder if it does not arrive within a few minutes.',
        [{ text: 'Return to Login', onPress: () => router.replace('/login') }]
      );
    } catch (err) {
      Alert.alert('Reset Failed', err.message || 'An error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Action */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/login')}>
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>🔒</Text>
          </View>

          <Text style={styles.title}>Password Recovery</Text>
          <Text style={styles.subtitle}>Enter your email to receive a secure recovery link</Text>

          {/* Recovery Card */}
          <Animated.View style={[styles.card, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📧 Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.resetBtn, loading && styles.disabledBtn]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>
                {loading ? '⏳ Dispatching...' : '🚀 Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: SPACING.xxl,
    zIndex: 10
  },
  backText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.bold
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md
  },
  logoText: { fontSize: 44 },
  title: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs
  },
  subtitle: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
    lineHeight: 20
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    ...SHADOWS.md
  },
  inputGroup: { marginBottom: SPACING.xxl },
  label: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border
  },
  resetBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: 16,
    alignItems: 'center',
    ...SHADOWS.glow(COLORS.primary)
  },
  disabledBtn: { opacity: 0.6 },
  resetBtnText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse
  }
});
