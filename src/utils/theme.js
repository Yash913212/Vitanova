/**
 * VitaNova — Premium Design System
 * Clean, modern health & wellness branding with a sleek slate backdrop,
 * vibrant emerald primary, rich purple accent, and glassmorphism styling.
 */

export const COLORS = {
  // Primary — Vibrant Green
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  primarySurface: '#E6FDF5',

  // Accent — Beautiful Purple
  accent: '#8B5CF6',
  accentLight: '#A78BFA',
  accentDark: '#7C3AED',
  accentSurface: '#F5F3FF',

  // Secondary — Soft Violet/Purple alternative
  secondary: '#6366F1',
  secondaryLight: '#818CF8',
  secondaryDark: '#4F46E5',
  secondarySurface: '#EEF2FF',

  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  card: '#FFFFFF',
  cardAlt: '#F8FAFC',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Gradients (start/end pairs)
  gradientPrimary: ['#10B981', '#34D399'],
  gradientAccent: ['#8B5CF6', '#A78BFA'],
  gradientSecondary: ['#6366F1', '#818CF8'],
  gradientDark: ['#0F172A', '#1E293B'],
  gradientWarm: ['#EF4444', '#F59E0B'],
  gradientCool: ['#10B981', '#8B5CF6'],

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',

  // Confidence levels
  confidenceHigh: '#10B981',
  confidenceMedium: '#F59E0B',
  confidenceLow: '#EF4444',

  // Glassmorphism overlays
  glassBg: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  overlay: 'rgba(15, 23, 42, 0.5)',
  shimmer: '#E2E8F0',
  tabBarBg: '#FFFFFF',
  tabBarActive: '#10B981',
  tabBarInactive: '#94A3B8',

  // Category colors
  fruit: '#EF4444',
  vegetable: '#10B981',
  grain: '#F59E0B',
  protein: '#3B82F6',
  dairy: '#6366F1',
  nut: '#8B5CF6',
};

export const TYPOGRAPHY = {
  // Font sizes
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,

  // React Native Font Family Mappings
  poppinsBold: 'Poppins_700Bold',
  poppinsSemiBold: 'Poppins_600SemiBold',
  poppinsMedium: 'Poppins_500Medium',
  poppinsRegular: 'Poppins_400Regular',

  // Font weights
  bold: '700',
  semiBold: '600',
  medium: '500',
  regular: '400',
  light: '300',

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const SHADOWS = {
  // Extra soft modern shadows tailored for slate background
  sm: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 36,
    elevation: 12,
  },
  glow: (color = '#10B981') => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  }),
};

// Glassmorphism component style generator
export const GLASS = {
  container: {
    backgroundColor: COLORS.glassBg,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderColor: 'rgba(255, 255, 255, 0.30)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    color: COLORS.textPrimary,
  }
};

export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
};
