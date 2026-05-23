/**
 * VitaNova — Settings Screen
 * Nickname editor, email display, voice settings, and logout.
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet,
  TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettings } from '../../src/providers/SettingsProvider';
import { useProfile } from '../../src/providers/ProfileProvider';
import { useAuth } from '../../src/providers/AuthProvider';
import SettingRow from '../../src/components/SettingRow';
import { LANGUAGES } from '../../src/utils/constants';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/utils/theme';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import TabTransitionWrapper from '../../src/components/TabTransitionWrapper';

export default function SettingsScreen() {
  const { settings, updateSetting } = useSettings();
  const { isDark, colors, toggleTheme } = useAppTheme();
  const { profile, updateProfile } = useProfile();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameValue, setNicknameValue] = useState(profile.nickname || '');

  const currentLang = LANGUAGES.find((l) => l.code === settings.ttsLanguage) || LANGUAGES[0];

  const cycleLang = useCallback(() => {
    const idx = LANGUAGES.findIndex((l) => l.code === settings.ttsLanguage);
    const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
    updateSetting('ttsLanguage', next.code);
    updateSetting('sttLanguage', next.code);
  }, [settings.ttsLanguage, updateSetting]);

  const displayName = profile.nickname || profile.name || user?.name || 'User';
  const displayEmail = profile.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const saveNickname = () => {
    updateProfile({ nickname: nicknameValue.trim() });
    setEditingNickname(false);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabTransitionWrapper>
        <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>⚙️ Settings</Text>
        </View>

        {/* Profile card */}
        <TouchableOpacity style={[styles.profileCard, { backgroundColor: colors.surface }]} onPress={() => router.push('/profile')}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.profileInitials, { color: colors.primaryDark }]}>{initials || '👤'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{displayName}</Text>
            <Text style={[styles.profileSub, { color: colors.textTertiary }]}>
              {displayEmail || (profile.fitnessGoal ? profile.fitnessGoal.replace('_', ' ') : 'Tap to configure')}
            </Text>
          </View>
          <Text style={[styles.arrow, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        {/* Appearance settings */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <SettingRow
          label="Dark Theme"
          description="Enjoy a beautiful Obsidian dark look"
          value={isDark}
          onValueChange={toggleTheme}
        />

        {/* Nickname Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Nickname</Text>
        <View style={[styles.nicknameCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.nicknameLabel, { color: colors.textSecondary }]}>Display Nickname</Text>
          <Text style={[styles.nicknameHint, { color: colors.textTertiary }]}>This name will be shown on the home page greeting</Text>
          {editingNickname ? (
            <View style={styles.nicknameEditRow}>
              <TextInput
                style={[styles.nicknameInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
                value={nicknameValue}
                onChangeText={setNicknameValue}
                placeholder="Enter your nickname"
                placeholderTextColor={colors.textTertiary}
                autoFocus
                maxLength={20}
              />
              <TouchableOpacity style={styles.nicknameSaveBtn} onPress={saveNickname}>
                <Text style={styles.nicknameSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.nicknameDisplayRow, { backgroundColor: colors.surfaceAlt }]} onPress={() => {
              setNicknameValue(profile.nickname || '');
              setEditingNickname(true);
            }}>
              <Text style={[styles.nicknameValue, { color: colors.textPrimary }]}>
                {profile.nickname || 'Not set — tap to add'}
              </Text>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Info — email only visible here */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
        <View style={[styles.accountCard, { backgroundColor: colors.surface }]}>
          <View style={styles.accountRow}>
            <Text style={[styles.accountLabel, { color: colors.textPrimary }]}>📧 Email</Text>
            <Text style={[styles.accountValue, { color: colors.textSecondary }]}>{displayEmail || 'Not set'}</Text>
          </View>
          <View style={[styles.accountDivider, { backgroundColor: colors.border }]} />
          <View style={styles.accountRow}>
            <Text style={[styles.accountLabel, { color: colors.textPrimary }]}>👤 Full Name</Text>
            <Text style={[styles.accountValue, { color: colors.textSecondary }]}>{profile.name || user?.name || 'Not set'}</Text>
          </View>
          <View style={[styles.accountDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: colors.primarySurface || COLORS.primarySurface }]} onPress={() => router.push('/profile')}>
            <Text style={[styles.editProfileBtnText, { color: colors.primaryDark || COLORS.primaryDark }]}>✏️ Edit Profile Details</Text>
          </TouchableOpacity>
        </View>

        {/* Voice settings */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Voice & Language</Text>
        <SettingRow
          label="Auto Read Results"
          description="Automatically speak AI responses"
          value={settings.autoTTS}
          onValueChange={(v) => updateSetting('autoTTS', v)}
        />
        <TouchableOpacity onPress={cycleLang}>
          <SettingRow
            label="Voice Language"
            description="Language for text-to-speech"
            value={currentLang.label}
            type="value"
          />
        </TouchableOpacity>

        {/* App info */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.infoHeader}>
            <Image source={require('../../assets/logo.png')} style={styles.infoLogo} resizeMode="contain" />
            <View>
              <Text style={[styles.infoRow, { color: colors.textPrimary }]}>VitaNova</Text>
              <Text style={[styles.infoSub, { color: colors.textTertiary }]}>The New Life</Text>
            </View>
          </View>
          <Text style={[styles.infoVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.infoSub, { color: colors.textTertiary }]}>Powered by OpenRouter AI</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      </TabTransitionWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: 96 },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.h2, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary },

  // Profile card
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl, ...SHADOWS.md,
  },
  profileAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  profileInitials: { fontSize: 18, fontWeight: TYPOGRAPHY.bold, color: COLORS.primaryDark },
  profileInfo: { flex: 1, marginLeft: SPACING.md },
  profileName: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.textPrimary },
  profileSub: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, marginTop: 2 },
  arrow: { fontSize: 24, color: COLORS.textTertiary },

  // Section
  sectionTitle: {
    fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.bold, color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm, marginTop: SPACING.md,
  },

  // Nickname
  nicknameCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  nicknameLabel: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.textPrimary },
  nicknameHint: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, marginTop: 2, marginBottom: SPACING.md },
  nicknameEditRow: { flexDirection: 'row', gap: SPACING.sm },
  nicknameInput: {
    flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.body, color: COLORS.textPrimary,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  nicknameSaveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl, justifyContent: 'center',
  },
  nicknameSaveText: { fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse },
  nicknameDisplayRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  nicknameValue: { fontSize: TYPOGRAPHY.body, color: COLORS.textPrimary },
  editIcon: { fontSize: 16 },

  // Account info
  accountCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  accountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
  accountLabel: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  accountValue: { fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.textPrimary },
  accountDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },

  // Info
  infoCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.sm },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  infoLogo: { width: 36, height: 36, borderRadius: 18, marginRight: SPACING.md },
  infoRow: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary },
  infoSub: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, marginTop: 2 },
  infoVersion: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, marginTop: SPACING.xs },

  // Logout
  logoutBtn: {
    borderWidth: 2, borderColor: COLORS.error, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.xxl,
    marginBottom: SPACING.xxxl,
  },
  logoutText: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.error },
  editProfileBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  editProfileBtnText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
  },
});
