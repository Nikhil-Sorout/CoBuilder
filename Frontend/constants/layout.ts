/**
 * Responsive Design Constants
 * 
 * This file contains all responsive values for text, spacing, dimensions,
 * and platform-specific properties to ensure consistent design across
 * Android and Web platforms.
 */

import { Dimensions, Platform } from 'react-native';
import { Fonts } from '@/constants/theme';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (using a standard mobile screen as reference)
const BASE_WIDTH = 375; // iPhone standard width
const BASE_HEIGHT = 812; // iPhone standard height

// Breakpoints for responsive design
export const Breakpoints = {
  xs: 320,   // Small phones
  sm: 375,   // Standard phones
  md: 768,   // Tablets / Small laptops
  lg: 1024,  // Tablets / Laptops
  xl: 1440,  // Large screens
} as const;

// Responsive scaling function
export const scale = (size: number): number => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scaleFactor);
};

// Responsive font scaling function
export const scaleFont = (size: number): number => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scaleFactor;
  
  // Ensure minimum font size
  if (Platform.OS === 'android') {
    return Math.max(newSize, size * 0.8);
  }
  return Math.round(newSize);
};

// Get responsive value based on screen width
export const getResponsiveValue = <T>(
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    default: T;
  }
): T => {
  if (SCREEN_WIDTH >= Breakpoints.xl && values.xl) return values.xl;
  if (SCREEN_WIDTH >= Breakpoints.lg && values.lg) return values.lg;
  if (SCREEN_WIDTH >= Breakpoints.md && values.md) return values.md;
  if (SCREEN_WIDTH >= Breakpoints.sm && values.sm) return values.sm;
  if (SCREEN_WIDTH >= Breakpoints.xs && values.xs) return values.xs;
  return values.default;
};

// Font Sizes
export const FontSizes = {
  xs: scaleFont(10),
  sm: scaleFont(12),
  base: scaleFont(14),
  md: scaleFont(16),
  lg: scaleFont(18),
  xl: scaleFont(20),
  '2xl': scaleFont(24),
  '3xl': scaleFont(30),
  '4xl': scaleFont(36),
  '5xl': scaleFont(48),
  
  // Platform-specific adjustments
  ...Platform.select({
    web: {
      xs: 12,
      sm: 14,
      base: 16,
      md: 18,
      lg: 20,
      xl: 24,
      '2xl': 28,
      '3xl': 32,
      '4xl': 40,
      '5xl': 48,
    },
    android: {
      xs: scaleFont(10),
      sm: scaleFont(12),
      base: scaleFont(14),
      md: scaleFont(16),
      lg: scaleFont(18),
      xl: scaleFont(20),
      '2xl': scaleFont(24),
      '3xl': scaleFont(30),
      '4xl': scaleFont(36),
      '5xl': scaleFont(48),
    },
    default: {},
  }),
} as const;

// Spacing System (padding, margin, gaps)
export const Spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  '2xl': scale(40),
  '3xl': scale(48),
  '4xl': scale(64),
  
  // Platform-specific spacing
  ...Platform.select({
    web: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 40,
      '3xl': 48,
      '4xl': 64,
    },
    android: {
      xs: scale(4),
      sm: scale(8),
      md: scale(16),
      lg: scale(24),
      xl: scale(32),
      '2xl': scale(40),
      '3xl': scale(48),
      '4xl': scale(64),
    },
    default: {},
  }),
} as const;

// Border Radius
export const BorderRadius = {
  none: 0,
  xs: scale(2),
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  '2xl': scale(24),
  full: 9999,
  
  ...Platform.select({
    web: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      full: 9999,
    },
    android: {
      none: 0,
      xs: scale(2),
      sm: scale(4),
      md: scale(8),
      lg: scale(12),
      xl: scale(16),
      '2xl': scale(24),
      full: 9999,
    },
    default: {},
  }),
} as const;

// Width & Height Utilities
export const Sizes = {
  // Screen dimensions
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  
  // Common component widths
  buttonWidth: {
    sm: scale(80),
    md: scale(120),
    lg: scale(160),
    full: SCREEN_WIDTH - Spacing.md * 2,
  },
  
  // Common component heights
  buttonHeight: {
    sm: scale(32),
    md: scale(44),
    lg: scale(56),
  },
  
  inputHeight: {
    sm: scale(36),
    md: scale(44),
    lg: scale(52),
  },
  
  // Icon sizes
  iconSize: {
    xs: scale(16),
    sm: scale(20),
    md: scale(24),
    lg: scale(32),
    xl: scale(40),
    '2xl': scale(48),
  },
  
  // Avatar sizes
  avatarSize: {
    xs: scale(24),
    sm: scale(32),
    md: scale(40),
    lg: scale(56),
    xl: scale(80),
  },
  
  // Card dimensions
  cardWidth: {
    sm: scale(150),
    md: scale(200),
    lg: scale(300),
    full: SCREEN_WIDTH - Spacing.md * 2,
  },
  
  // Platform-specific adjustments
  ...Platform.select({
    web: {
      maxContentWidth: 1400,
      containerPadding: 24,
    },
    android: {
      maxContentWidth: SCREEN_WIDTH,
      containerPadding: Spacing.md,
    },
    default: {},
  }),
} as const;

// Line Heights
export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// Letter Spacing
export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

// Typography System
export const Typography = {
  h1: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '700' as const,
    fontSize: FontSizes['2xl'],
    lineHeight: FontSizes['2xl'] * LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '700' as const,
    fontSize: FontSizes.xl,
    lineHeight: FontSizes.xl * LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '700' as const,
    fontSize: FontSizes.lg,
    lineHeight: FontSizes.lg * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  h4: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '700' as const,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  h5: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '600' as const,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  h6: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '600' as const,
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  body: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '400' as const,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  bodySmall: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '400' as const,
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  caption: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '500' as const,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  captionSmall: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '400' as const,
    fontSize: FontSizes.xs,
    lineHeight: FontSizes.xs * LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  label: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '500' as const,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  button: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '500' as const,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * LineHeights.tight,
    letterSpacing: LetterSpacing.wide,
  },
  overline: {
    fontFamily: Fonts?.sans || 'system-ui',
    fontWeight: '500' as const,
    fontSize: FontSizes.xs,
    lineHeight: FontSizes.xs * LineHeights.normal,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
} as const;

// Shadows (platform-specific)
export const Shadows = Platform.select({
  web: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  android: {
    sm: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    md: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    lg: {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    xl: {
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
  },
  default: {},
});

// Z-Index layers
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Platform-specific utilities
export const PlatformUtils = {
  isWeb: Platform.OS === 'web',
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  
  // Safe area handling
  safeAreaTop: Platform.select({
    ios: 44,
    android: 0,
    web: 0,
    default: 0,
  }),
  
  safeAreaBottom: Platform.select({
    ios: 34,
    android: 0,
    web: 0,
    default: 0,
  }),
  
  // Status bar height
  statusBarHeight: Platform.select({
    ios: 44,
    android: 24,
    web: 0,
    default: 0,
  }),
  
  // Touch target minimum size (accessibility)
  minTouchTarget: Platform.select({
    web: 44,
    android: 48,
    ios: 44,
    default: 44,
  }),
} as const;

// Helper function to check if screen is tablet-sized
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= Breakpoints.md;
};

// Helper function to check if screen is mobile-sized
export const isMobile = (): boolean => {
  return SCREEN_WIDTH < Breakpoints.md;
};

// Helper function to get responsive padding
export const getResponsivePadding = () => {
  return getResponsiveValue({
    xs: Spacing.sm,
    sm: Spacing.md,
    md: Spacing.lg,
    lg: Spacing.xl,
    default: Spacing.md,
  });
};

// Helper function to get responsive margin
export const getResponsiveMargin = () => {
  return getResponsiveValue({
    xs: Spacing.sm,
    sm: Spacing.md,
    md: Spacing.lg,
    lg: Spacing.xl,
    default: Spacing.md,
  });
};

// Export all as a single object for easy access
export const Layout = {
  Breakpoints,
  FontSizes,
  Spacing,
  BorderRadius,
  Sizes,
  LineHeights,
  LetterSpacing,
  Typography,
  Shadows,
  ZIndex,
  PlatformUtils,
  scale,
  scaleFont,
  getResponsiveValue,
  isTablet,
  isMobile,
  getResponsivePadding,
  getResponsiveMargin,
} as const;

