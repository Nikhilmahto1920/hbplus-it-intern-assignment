/**
 * HB+ Design System & Theme
 * Fitness, Nutrition, Mental health & Beyond
 */

export type ThemeMode = 'light' | 'dark';

export const lightColors = {
  // Brand Warm Canvas
  background: '#F5F0E8', // Warm cream
  surface: '#FFFFFF',
  surfaceSubtle: '#F9F7F2',
  surfaceWarm: '#EFE9DF',
  surfaceElevated: '#FFFFFF',

  // Typography (Raised contrast to meet WCAG AA >= 4.5:1)
  text: '#1A1A1A', // Near-black (15.6:1 against #FFFFFF)
  textSecondary: '#403D37', // Deep warm slate (>7.5:1 against #F5F0E8)
  textMuted: '#54504A', // High-contrast muted text (>6.8:1 against #F5F0E8, WCAG AA compliant)
  textLight: '#FAF8F5',

  // Brand Accent (Deep Forest/Teal Green)
  primary: '#0F766E', // Confident deep teal-green
  primaryHover: '#0D645E',
  primaryDark: '#042F2E',
  primaryLight: '#E6F4F2',
  primaryBorder: '#99F6E4',

  // Secondary Warm Accent
  accentOrange: '#EA580C',
  accentOrangeLight: '#FFEDD5',

  // Borders & Dividers
  border: '#D8D2C6', // Enhanced border contrast
  borderLight: '#E5DFD4',
  borderFocus: '#0F766E',

  // Role Badges & Status
  adminBadgeBg: '#ECFDF5',
  adminBadgeText: '#065F46',
  adminBadgeBorder: '#A7F3D0',

  userBadgeBg: '#EFF6FF',
  userBadgeText: '#1E40AF',
  userBadgeBorder: '#BFDBFE',

  // Alerts
  errorBg: '#FEF2F2',
  errorText: '#991B1B',
  errorBorder: '#FECACA',

  successBg: '#F0FDF4',
  successText: '#166534',
  successBorder: '#BBF7D0',

  infoBg: '#EFF6FF',
  infoText: '#1D4ED8',
  infoBorder: '#BFDBFE',

  // Skeletons
  skeletonBase: '#EAE5DB',
  skeletonHighlight: '#F3EFE7',
};

export const darkColors = {
  // Dark Wellness Canvas
  background: '#121615',
  surface: '#1A211F',
  surfaceSubtle: '#222B29',
  surfaceWarm: '#283330',
  surfaceElevated: '#202826',

  // Typography (Raised contrast to meet WCAG AA >= 4.5:1)
  text: '#F5F0E8', // Light cream (14.5:1 against #121615)
  textSecondary: '#D4CFCA', // High-contrast secondary (>10:1 against #121615)
  textMuted: '#B8B3AC', // High-contrast muted text (7.5:1 against #121615, WCAG AA compliant)
  textLight: '#FFFFFF',

  // Brand Accent (Vibrant Teal in Dark Mode)
  primary: '#14B8A6',
  primaryHover: '#0D9488',
  primaryDark: '#042F2E',
  primaryLight: '#133531',
  primaryBorder: '#2DD4BF',

  // Secondary Warm Accent
  accentOrange: '#F97316',
  accentOrangeLight: '#431407',

  // Borders & Dividers
  border: '#3A4843', // Enhanced border visibility
  borderLight: '#2C3734',
  borderFocus: '#14B8A6',

  // Role Badges & Status
  adminBadgeBg: '#064E3B',
  adminBadgeText: '#6EE7B7',
  adminBadgeBorder: '#047857',

  userBadgeBg: '#1E3A8A',
  userBadgeText: '#93C5FD',
  userBadgeBorder: '#1D4ED8',

  // Alerts
  errorBg: '#450A0A',
  errorText: '#FCA5A5',
  errorBorder: '#7F1D1D',

  successBg: '#052E16',
  successText: '#86EFAC',
  successBorder: '#166534',

  infoBg: '#172554',
  infoText: '#93C5FD',
  infoBorder: '#1E40AF',

  // Skeletons
  skeletonBase: '#252F2C',
  skeletonHighlight: '#2F3C38',
};

export type ThemeColors = typeof lightColors;

// Default exported colors for backwards compatibility
export const colors = lightColors;

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  card: 18,
  xl: 20,
  pill: 9999,
};

export const typography = {
  // Heading weight 600 as requested
  h1: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13, // minimum 13px
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 13, // raised from 12px to meet minimum 13px rule
    fontWeight: '500' as const,
    lineHeight: 18,
  },
};

export const shadows = {
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  hover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
};
