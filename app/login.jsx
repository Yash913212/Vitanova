/**
 * VitaNova — Login Screen
 * Premium animated login with logo, Google Sign-In, and staggered animations.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Animated, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';
import { useAppTheme } from '../src/hooks/useAppTheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { isDark, colors, toggleTheme } = useAppTheme();

  // Animation refs
  const logoScale = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(50)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(30)).current;
  const footerFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const googleFade = useRef(new Animated.Value(0)).current;
  const googleSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.stagger(40, [
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(titleSlide, { toValue: 0, friction: 7, tension: 180, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 7, tension: 180, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(btnSlide, { toValue: 0, friction: 7, tension: 180, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(googleFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(googleSlide, { toValue: 0, friction: 7, tension: 180, useNativeDriver: true }),
      ]),
      Animated.timing(footerFade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace('/profile?setup=true');
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Google Sign-In',
      'Google Sign-In requires OAuth configuration. Set up your Google Cloud Console project and add your client ID to enable this feature.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Theme Toggle */}
      <TouchableOpacity activeOpacity={0.8} onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
        <Text style={[styles.themeToggleText, { color: colors.textPrimary }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }] }]}>
            <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          </Animated.View>

          {/* Title */}
          <Animated.Text style={[styles.title, { opacity: titleFade, transform: [{ translateY: titleSlide }], color: colors.textPrimary }]}>
            Welcome Back
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleFade, color: colors.textSecondary }]}>
            Sign in to your VitaNova account
          </Animated.Text>

          {/* Card */}
          <Animated.View style={[styles.card, { opacity: cardFade, transform: [{ translateY: cardSlide }], backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>📧 Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border }]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>🔒 Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Login Button */}
          <Animated.View style={{ opacity: btnFade, transform: [{ translateY: btnSlide }] }}>
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginBtnText}>
                {loading ? '⏳ Signing in...' : '🚀 Sign In'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <Animated.View style={[styles.dividerRow, { opacity: googleFade }]}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </Animated.View>

          {/* Google Sign-In */}
          <Animated.View style={{ opacity: googleFade, transform: [{ translateY: googleSlide }] }}>
            <TouchableOpacity style={[styles.googleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleGoogleSignIn} activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={[styles.googleBtnText, { color: colors.textPrimary }]}>Continue with Google</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: footerFade }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Decorative dots */}
          <Animated.View style={[styles.decoRow, { opacity: footerFade }]}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  themeToggle: {
    position: 'absolute', top: 52, right: 20, zIndex: 10,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    ...SHADOWS.sm,
  },
  themeIcon: { fontSize: 16, marginRight: 6 },
  themeToggleText: { fontSize: TYPOGRAPHY.caption, fontWeight: TYPOGRAPHY.semiBold },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1, paddingHorizontal: SPACING.xxl,
    justifyContent: 'center', paddingVertical: SPACING.xxxl,
  },
  logoWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#EDF7ED',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  logoImage: { width: 90, height: 90 },
  title: {
    fontSize: 30, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.xxl, marginBottom: SPACING.xl, ...SHADOWS.md,
  },
  inputGroup: { marginBottom: SPACING.xl },
  label: {
    fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary, marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    fontSize: TYPOGRAPHY.body, color: COLORS.textPrimary,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  eyeIcon: { fontSize: 20 },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: 16, alignItems: 'center',
    ...SHADOWS.glow(COLORS.primary),
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary,
    marginHorizontal: SPACING.md,
  },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    paddingVertical: 14, borderWidth: 1.5, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  googleIcon: {
    fontSize: 20, fontWeight: TYPOGRAPHY.bold, color: '#4285F4',
    marginRight: SPACING.sm,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#EBF1FF',
    textAlign: 'center', lineHeight: 28,
    overflow: 'hidden',
  },
  googleBtnText: {
    fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  footerText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  footerLink: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: TYPOGRAPHY.bold },
  decoRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
