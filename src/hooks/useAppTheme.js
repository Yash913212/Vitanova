/**
 * VitaNova — Custom Theme Hook for Dark Mode Support
 */
import { useSettings } from '../providers/SettingsProvider';
import { COLORS } from '../utils/theme';

export function useAppTheme() {
  const settingsContext = useSettings();
  
  // Safe default if settings is not loaded yet
  const settings = settingsContext ? settingsContext.settings : { theme: 'light' };
  const updateSetting = settingsContext ? settingsContext.updateSetting : () => {};

  const isDark = settings.theme === 'dark';

  const themeColors = {
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    primaryDark: COLORS.primaryDark,
    accent: COLORS.accent,
    accentLight: COLORS.accentLight,
    accentDark: COLORS.accentDark,
    
    // Dynamic theme background and surface cards
    background: isDark ? '#090D16' : '#F8FAFC',
    surface: isDark ? '#151F32' : '#FFFFFF',
    surfaceAlt: isDark ? '#0F172A' : '#F1F5F9',
    card: isDark ? '#151F32' : '#FFFFFF',
    cardAlt: isDark ? '#0F172A' : '#F8FAFC',
    
    // Text color states
    textPrimary: isDark ? '#F8FAFC' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#475569',
    textTertiary: isDark ? '#64748B' : '#94A3B8',
    textInverse: '#FFFFFF',
    
    // Semantic states
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    info: COLORS.info,

    // Border states
    border: isDark ? '#1E293B' : '#E2E8F0',
    borderLight: isDark ? '#2D3748' : '#F1F5F9',
    divider: isDark ? '#1E293B' : '#E2E8F0',

    // Glassmorphism styling values
    glassBg: isDark ? 'rgba(21, 31, 50, 0.8)' : 'rgba(255, 255, 255, 0.75)',
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
  };

  const toggleTheme = () => {
    updateSetting('theme', isDark ? 'light' : 'dark');
  };

  return { isDark, colors: themeColors, toggleTheme };
}
