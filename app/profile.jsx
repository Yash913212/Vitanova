/**
 * NutriVision AI — Profile Screen
 * Shows user name/email at the top + all profile settings.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfile } from '../src/providers/ProfileProvider';
import { useAuth } from '../src/providers/AuthProvider';
import { FITNESS_GOALS, DIET_PREFERENCES, GENDERS, LANGUAGES } from '../src/utils/constants';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';

export default function ProfileScreen() {
  const { profile, updateProfile } = useProfile();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(profile);

  useEffect(() => { setForm(profile); }, [profile]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateProfile(form);
    Alert.alert('Saved', 'Your profile has been updated!', [
      { text: 'OK', onPress: () => router.back() },
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
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, currentValue === opt.value && styles.chipActive]}
            onPress={() => updateField(field, opt.value)}
          >
            <Text style={[styles.chipText, currentValue === opt.value && styles.chipTextActive]}>
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || '👤'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            {form.nickname ? <Text style={styles.userNickname}>@{form.nickname}</Text> : null}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personal Information</Text>

        {/* Name */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder="Your name"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {/* Email (read only) */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.input, styles.inputDisabled]}>
            <Text style={styles.disabledText}>{displayEmail || 'Not set'}</Text>
          </View>
        </View>

        {/* Age */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={String(form.age)}
            onChangeText={(v) => updateField('age', v.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 25"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {/* Gender */}
        {renderPicker('Gender', GENDERS, form.gender, 'gender')}

        <Text style={styles.sectionTitle}>Body Measurements</Text>

        {/* Height */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={String(form.height)}
            onChangeText={(v) => updateField('height', v.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 175"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {/* Weight */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={String(form.weight)}
            onChangeText={(v) => updateField('weight', v.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 70"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* Goal */}
        {renderPicker('Fitness Goal', FITNESS_GOALS, form.fitnessGoal, 'fitnessGoal')}

        {/* Diet */}
        {renderPicker('Diet Preference', DIET_PREFERENCES, form.dietPreference, 'dietPreference')}

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>💾 Save Profile</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.body, color: COLORS.primary, fontWeight: TYPOGRAPHY.semiBold, marginBottom: SPACING.md },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.xxl, ...SHADOWS.md,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.lg,
  },
  avatarText: { fontSize: 22, fontWeight: TYPOGRAPHY.bold, color: COLORS.primaryDark },
  userInfo: { flex: 1 },
  userName: { fontSize: TYPOGRAPHY.h3, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary },
  userNickname: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: TYPOGRAPHY.semiBold, marginTop: 2 },
  sectionTitle: {
    fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textTertiary, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: SPACING.md, marginTop: SPACING.sm,
  },
  fieldWrap: { marginBottom: SPACING.xl },
  label: { fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body, color: COLORS.textPrimary, ...SHADOWS.sm,
  },
  inputDisabled: { backgroundColor: COLORS.surfaceAlt },
  disabledText: { fontSize: TYPOGRAPHY.body, color: COLORS.textTertiary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primarySurface, borderColor: COLORS.primary },
  chipText: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primaryDark, fontWeight: TYPOGRAPHY.bold },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg, alignItems: 'center', marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  saveBtnText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse },
  logoutBtn: {
    borderWidth: 2, borderColor: COLORS.error, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.md,
  },
  logoutBtnText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.error },
});
