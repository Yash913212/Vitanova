/**
 * VitaNova — Sign Up Screen
 * Premium animated registration with step indicator and staggered animations.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Animated, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { useProfile } from '../src/providers/ProfileProvider';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';
import { useAppTheme } from '../src/hooks/useAppTheme';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const { updateProfile } = useProfile();
  const { isDark, colors, toggleTheme } = useAppTheme();

  // Animation refs
  const bgGradient = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-40)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const field1 = useRef(new Animated.Value(0)).current;
  const field2 = useRef(new Animated.Value(0)).current;
  const field3 = useRef(new Animated.Value(0)).current;
  const field4 = useRef(new Animated.Value(0)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(40)).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  // Floating particles
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entrance sequence: Rapid staggered glide-in
    Animated.stagger(30, [
      // Logo bounce
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }),
      // Title
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(titleSlide, { toValue: 0, friction: 7, tension: 180, useNativeDriver: true }),
      ]),
      // Subtitle
      Animated.timing(subtitleFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      // Card
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 7, tension: 180, useNativeDriver: true }),
      ]),
      // Fields stagger
      Animated.spring(field1, { toValue: 1, friction: 7, tension: 180, useNativeDriver: true }),
      Animated.spring(field2, { toValue: 1, friction: 7, tension: 180, useNativeDriver: true }),
      Animated.spring(field3, { toValue: 1, friction: 7, tension: 180, useNativeDriver: true }),
      Animated.spring(field4, { toValue: 1, friction: 7, tension: 180, useNativeDriver: true }),
      // Button + footer
      Animated.parallel([
        Animated.spring(btnFade, { toValue: 1, friction: 7, tension: 180, useNativeDriver: true }),
        Animated.spring(btnSlide, { toValue: 0, friction: 7, tension: 180, useNativeDriver: true }),
      ]),
      Animated.timing(footerFade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Floating logo animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 8, duration: 2000, useNativeDriver: true }),
      ])
    );
    floatLoop.start();

    // Floating particles
    const startParticle = (anim, duration) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();
    startParticle(particle1, 3000);
    startParticle(particle2, 4000);
    startParticle(particle3, 3500);

    return () => floatLoop.stop();
  }, []);

  const fieldAnim = (anim) => ({
    opacity: anim,
    transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  });

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: COLORS.border, width: 0 };
    if (password.length < 6) return { label: 'Weak', color: COLORS.error, width: 33 };
    if (password.length < 10) return { label: 'Medium', color: COLORS.warning, width: 66 };
    return { label: 'Strong', color: COLORS.success, width: 100 };
  };

  const strength = getPasswordStrength();

  const handleSignup = async () => {
    if (!name.trim()) return Alert.alert('Missing Name', 'Please enter your name.');
    if (!email.trim()) return Alert.alert('Missing Email', 'Please enter your email.');
    if (!password) return Alert.alert('Missing Password', 'Please create a password.');
    if (password.length < 6) return Alert.alert('Weak Password', 'Password must be at least 6 characters.');
    if (password !== confirmPassword) return Alert.alert('Mismatch', 'Passwords do not match.');

    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim().toLowerCase(), password });
      // Also save name to profile
      await updateProfile({ name: name.trim(), email: email.trim().toLowerCase() });
      router.replace('/profile?setup=true');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Theme Toggle */}
      <TouchableOpacity activeOpacity={0.8} onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
        <Text style={[styles.themeToggleText, { color: colors.textPrimary }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
      </TouchableOpacity>

      {/* Floating particles */}
      <Animated.View style={[styles.particle, styles.particle1, {
        opacity: particle1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.6, 0.2] }),
        transform: [{ translateY: particle1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }],
      }]} />
      <Animated.View style={[styles.particle, styles.particle2, {
        opacity: particle2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.5, 0.15] }),
        transform: [{ translateY: particle2.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }],
      }]} />
      <Animated.View style={[styles.particle, styles.particle3, {
        opacity: particle3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.1, 0.4, 0.1] }),
        transform: [{ translateY: particle3.interpolate({ inputRange: [0, 1], outputRange: [0, -25] }) }],
      }]} />

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
          <Animated.View style={[
            styles.logoWrap,
            { transform: [{ scale: logoScale }, { translateY: logoFloat }] },
          ]}>
            <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          </Animated.View>

          {/* Title */}
          <Animated.Text style={[
            styles.title,
            { opacity: titleFade, transform: [{ translateY: titleSlide }], color: colors.textPrimary },
          ]}>
            Create Account
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleFade, color: colors.textSecondary }]}>
            Start your wellness journey with VitaNova
          </Animated.Text>

          {/* Progress dots */}
          <Animated.View style={[styles.progressRow, { opacity: subtitleFade }]}>
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={[styles.progressLine, { backgroundColor: colors.border }, name && email ? styles.progressLineActive : {}]} />
            <View style={[styles.progressDot, { backgroundColor: colors.border }, name && email ? styles.progressActive : {}]} />
            <View style={[styles.progressLine, { backgroundColor: colors.border }, password.length >= 6 ? styles.progressLineActive : {}]} />
            <View style={[styles.progressDot, { backgroundColor: colors.border }, password.length >= 6 && confirmPassword === password ? styles.progressActive : {}]} />
          </Animated.View>

          {/* Card */}
          <Animated.View style={[
            styles.card,
            { opacity: cardFade, transform: [{ translateY: cardSlide }], backgroundColor: colors.surface },
          ]}>
            {/* Name */}
            <Animated.View style={[styles.inputGroup, fieldAnim(field1)]}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>👤 Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
              />
            </Animated.View>

            {/* Email */}
            <Animated.View style={[styles.inputGroup, fieldAnim(field2)]}>
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
            </Animated.View>

            {/* Password */}
            <Animated.View style={[styles.inputGroup, fieldAnim(field3)]}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>🔒 Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {/* Strength bar */}
              {password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBar}>
                    <View style={[styles.strengthFill, { width: `${strength.width}%`, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
            </Animated.View>

            {/* Confirm Password */}
            <Animated.View style={[styles.inputGroup, fieldAnim(field4)]}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>🔐 Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border },
                  confirmPassword.length > 0 && confirmPassword !== password && styles.inputError,
                  confirmPassword.length > 0 && confirmPassword === password && styles.inputSuccess,
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              {confirmPassword.length > 0 && (
                <Text style={[
                  styles.matchText,
                  { color: confirmPassword === password ? COLORS.success : COLORS.error },
                ]}>
                  {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords don\'t match'}
                </Text>
              )}
            </Animated.View>
          </Animated.View>

          {/* Sign Up Button */}
          <Animated.View style={{ opacity: btnFade, transform: [{ translateY: btnSlide }] }}>
            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.signupBtnText}>
                {loading ? '⏳ Creating Account...' : '✨ Create Account'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: footerFade }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Features preview */}
          <Animated.View style={[styles.features, { opacity: footerFade }]}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📷</Text>
              <Text style={[styles.featureText, { color: colors.textTertiary }]}>Scan Food</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={[styles.featureText, { color: colors.textTertiary }]}>AI Chat</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🥗</Text>
              <Text style={[styles.featureText, { color: colors.textTertiary }]}>Diet Plans</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔊</Text>
              <Text style={[styles.featureText, { color: colors.textTertiary }]}>Voice</Text>
            </View>
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
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl,
  },
  particle: { position: 'absolute', borderRadius: 50 },
  particle1: { width: 120, height: 120, backgroundColor: COLORS.primary + '08', top: 60, right: -30 },
  particle2: { width: 80, height: 80, backgroundColor: COLORS.accent + '08', top: 200, left: -20 },
  particle3: { width: 60, height: 60, backgroundColor: COLORS.success + '08', bottom: 150, right: 20 },
  logoWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#EDF7ED',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: SPACING.xl, ...SHADOWS.lg,
  },
  logoImage: { width: 75, height: 75 },
  title: {
    fontSize: 30, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: SPACING.lg,
  },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: SPACING.xxl,
  },
  progressDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  progressActive: { backgroundColor: COLORS.primary },
  progressLine: { width: 40, height: 2, backgroundColor: COLORS.border },
  progressLineActive: { backgroundColor: COLORS.primary },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.xxl, marginBottom: SPACING.xxl, ...SHADOWS.md,
  },
  inputGroup: { marginBottom: SPACING.lg },
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
  inputError: { borderColor: COLORS.error },
  inputSuccess: { borderColor: COLORS.success },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: {
    position: 'absolute', right: 14, top: 0, bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: { fontSize: 20 },
  strengthWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: SPACING.sm, gap: SPACING.sm,
  },
  strengthBar: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, overflow: 'hidden',
  },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: TYPOGRAPHY.tiny, fontWeight: TYPOGRAPHY.semiBold },
  matchText: { fontSize: TYPOGRAPHY.caption, marginTop: SPACING.xs },
  signupBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.xl,
    paddingVertical: 16, alignItems: 'center',
    ...SHADOWS.glow(COLORS.accent),
  },
  signupBtnDisabled: { opacity: 0.6 },
  signupBtnText: {
    fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  footerText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  footerLink: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.accent, fontWeight: TYPOGRAPHY.bold },
  features: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.xl,
    marginTop: SPACING.xxl, paddingBottom: SPACING.xxl,
  },
  featureItem: { alignItems: 'center' },
  featureIcon: { fontSize: 24, marginBottom: 4 },
  featureText: { fontSize: TYPOGRAPHY.tiny, color: COLORS.textTertiary },
});
