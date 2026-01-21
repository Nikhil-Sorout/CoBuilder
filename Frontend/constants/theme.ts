/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  // Reserved for React Navigation - do not modify
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  
  // App styling colors - simple, subtle tones
  lightMode: {
    // Primary colors
    primary: '#0a7ea4',
    primaryLight: '#4da3c4',
    primaryDark: '#085d7a',
    
    // Secondary colors
    secondary: '#6b7280',
    secondaryLight: '#9ca3af',
    secondaryDark: '#4b5563',
    
    // Backgrounds
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceElevated: '#ffffff',
    card: '#ffffff',
    
    // Text colors
    textPrimary: '#11181C',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',
    
    // Borders and dividers
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    divider: '#e5e7eb',
    
    // Semantic colors (subtle)
    success: '#10b981',
    successLight: '#d1fae5',
    error: '#ef4444',
    errorLight: '#fee2e2',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    
    // Interactive elements
    input: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocus: '#0a7ea4',
    placeholder: '#9ca3af',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.4)',
    backdrop: 'rgba(0, 0, 0, 0.2)',
    
    // Disabled states
    disabled: '#d1d5db',
    disabledText: '#9ca3af',
  },
  
  darkMode: {
    // Primary colors
    primary: '#4da3c4',
    primaryLight: '#7bc4dd',
    primaryDark: '#0a7ea4',
    
    // Secondary colors
    secondary: '#9ca3af',
    secondaryLight: '#d1d5db',
    secondaryDark: '#6b7280',
    
    // Backgrounds
    background: '#151718',
    surface: '#1f2937',
    surfaceElevated: '#374151',
    card: '#1f2937',
    
    // Text colors
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    textInverse: '#11181C',
    
    // Borders and dividers
    border: '#374151',
    borderLight: '#4b5563',
    divider: '#374151',
    
    // Semantic colors (subtle)
    success: '#34d399',
    successLight: '#065f46',
    error: '#f87171',
    errorLight: '#7f1d1d',
    warning: '#fbbf24',
    warningLight: '#78350f',
    info: '#60a5fa',
    infoLight: '#1e3a8a',
    
    // Interactive elements
    input: '#1f2937',
    inputBorder: '#4b5563',
    inputFocus: '#4da3c4',
    placeholder: '#6b7280',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.6)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
    
    // Disabled states
    disabled: '#374151',
    disabledText: '#6b7280',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Get app colors based on color scheme
 * @param colorScheme - 'light' | 'dark' | null | undefined
 * @returns Color object for the specified theme
 */
export const getAppColors = (colorScheme: 'light' | 'dark' | null | undefined = 'light') => {
  return colorScheme === 'dark' ? Colors.darkMode : Colors.lightMode;
};

