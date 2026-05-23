/**
 * NutriVision AI — Profile Screen
 * Shows user name/email at the top + all profile settings.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProfile } from '../src/providers/ProfileProvider';
import { useAuth } from '../src/providers/AuthProvider';
import { FITNESS_GOALS, DIET_PREFERENCES, GENDERS, LANGUAGES } from '../src/utils/constants';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';
import { useAppTheme } from '../src/hooks/useAppTheme';

export default function ProfileScreen() {
  const { profile, updateProfile } = useProfile();
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isSetup = params.setup === 'true';
  const [form, setForm] = useState(profile);
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || profile.name || user?.name || '',
      email: prev.email || profile.email || user?.email || '',
      nickname: prev.nickname || profile.nickname || '',
      age: prev.age || profile.age || '',
      gender: prev.gender || profile.gender || '',
      height: prev.height || profile.height || '',
      weight: prev.weight || profile.weight || '',
      fitnessGoal: prev.fitnessGoal || profile.fitnessGoal || 'maintenance',
      dietPreference: prev.dietPreference || profile.dietPreference || 'no_preference',
    }));
  }, [profile, user]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateProfile(form);
    Alert.alert('Saved', 'Your profile has been updated!', [
      { text: 'OK', onPress: () => {
        if (isSetup) {
          router.replace('/(tabs)');
        } else {
          router.back();
        }
      }},
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/login');
      }},
    ]);
  };

  const renderPicker = (label, options, currentValue, field) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      <View style={styles.chips}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.chip,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              currentValue === opt.value && { backgroundColor: isDark ? colors.surface : COLORS.primarySurface, borderColor: colors.primary }
            ]}
            onPress={() => updateField(field, opt.value)}
          >
            <Text style={[
              styles.chipText,
              { color: colors.textSecondary },
              currentValue === opt.value && { color: isDark ? colors.primaryLight : colors.primaryDark, fontWeight: TYPOGRAPHY.bold }
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Get user display name
  const displayName = form.name || user?.name || 'User';
  const displayEmail = form.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!isSetup ? (
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip to Dashboard →</Text>
          </TouchableOpacity>
        )}

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={[styles.avatar, { backgroundColor: isDark ? colors.surfaceAlt : COLORS.primarySurface }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials || '👤'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{displayName}</Text>
            {form.nickname ? <Text style={[styles.userNickname, { color: colors.primary }]}>@{form.nickname}</Text> : null}
          </View>
        </View>

        {isSetup && (
          <View style={[styles.setupBanner, { backgroundColor: isDark ? colors.surfaceAlt : COLORS.primarySurface, borderColor: isDark ? colors.border : COLORS.primary + '30' }]}>
            <Text style={[styles.setupBannerTitle, { color: isDark ? colors.primaryLight : COLORS.primaryDark }]}>👋 Welcome to VitaNova!</Text>
            <Text style={[styles.setupBannerText, { color: colors.textSecondary }]}>Please set up your profile details below to get personalized nutrition and health guidance.</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Personal Information</Text>

        {/* Name */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            value={form.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder="Your name"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Nickname */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Nickname</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            value={form.nickname}
            onChangeText={(v) => updateField('nickname', v)}
            placeholder="e.g. Yash"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Email (read only) */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
          <View style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[styles.disabledText, { color: colors.textTertiary }]}>{displayEmail || 'Not set'}</Text>
          </View>
        </View>

        {/* Age */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Age</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            value={form.age !== undefined && form.age !== null ? String(form.age) : ''}
            onChangeText={(v) => updateField('age', v.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 25"
            keyboardType="numeric"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Gender */}
        {renderPicker('Gender', GENDERS, form.gender, 'gender')}

        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Body Measurements</Text>

        {/* Height */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Height (cm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            value={form.height !== undefined && form.height !== null ? String(form.height) : ''}
            onChangeText={(v) => updateField('height', v.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 175"
            keyboardType="numeric"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Weight */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            value={form.weight !== undefined && form.weight !== null ? String(form.weight) : ''}
            onChangeText={(v) => updateField('weight', v.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 70"
            keyboardType="numeric"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Preferences</Text>

        {/* Goal */}
        {renderPicker('Fitness Goal', FITNESS_GOALS, form.fitnessGoal, 'fitnessGoal')}

        {/* Diet */}
        {renderPicker('Diet Preference', DIET_PREFERENCES, form.dietPreference, 'dietPreference')}

        {/* Save */}
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>💾 Save Profile</Text>
        </TouchableOpacity>

        {/* Logout */}
        {!isSetup && (
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error }]} onPress={handleLogout}>
            <Text style={[styles.logoutBtnText, { color: colors.error }]}>🚪 Log Out</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold, marginBottom: SPACING.md },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.xxl, ...SHADOWS.md,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.lg,
  },
  avatarText: { fontSize: 22, fontWeight: TYPOGRAPHY.bold },
  userInfo: { flex: 1 },
  userName: { fontSize: TYPOGRAPHY.h3, fontWeight: TYPOGRAPHY.bold },
  userNickname: { fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.semiBold, marginTop: 2 },
  sectionTitle: {
    fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.bold,
    textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: SPACING.md, marginTop: SPACING.sm,
  },
  fieldWrap: { marginBottom: SPACING.xl },
  label: { fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.semiBold, marginBottom: SPACING.sm },
  input: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body, borderWidth: 1.5, ...SHADOWS.sm,
  },
  disabledText: { fontSize: TYPOGRAPHY.body },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, borderWidth: 1.5,
  },
  chipText: { fontSize: TYPOGRAPHY.bodySmall },
  saveBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg, alignItems: 'center', marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  saveBtnText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse },
  logoutBtn: {
    borderWidth: 2, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.md,
  },
  logoutBtnText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold },
  skipBtn: { alignSelf: 'flex-end', marginBottom: SPACING.md },
  skipText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold },
  setupBanner: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
  },
  setupBannerTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: 4,
  },
  setupBannerText: {
    fontSize: TYPOGRAPHY.bodySmall,
    lineHeight: 18,
  },
});
