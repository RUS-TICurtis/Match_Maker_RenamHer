/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    primary: '#4F46E5',
    card: '#FFFFFF',
    border: '#E2E8F0',
    tint: '#4F46E5',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#4F46E5',
    accent: '#F43F5E',
    gold: '#D97706',
  },
  dark: {
    text: '#F8FAFC',
    background: '#090D16',
    backgroundElement: '#141B2D',
    backgroundSelected: '#1E293B',
    textSecondary: '#94A3B8',
    primary: '#6366F1',
    card: '#0F172A',
    border: '#1E293B',
    tint: '#818CF8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#818CF8',
    accent: '#FB7185',
    gold: '#F59E0B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
