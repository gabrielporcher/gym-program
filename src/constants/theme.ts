import '@/global.css';

import { Platform } from 'react-native';

const palette = {
  primary: '#2C7A7F',
  accent: '#4FD1C5',
  ink: '#2C3E50',
  surface: '#E6FFFA',
  danger: '#FF3B30',
  canvas: '#FFFFFF',
  text: '#2C3E50',
  background: '#FFFFFF',
  backgroundElement: '#E6FFFA',
  backgroundSelected: '#4FD1C5',
  textSecondary: '#2C3E50',
} as const;

export const Colors = {
  light: palette,
  dark: palette,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const space = [4, 8, 16, 24, 32] as const;

export const Spacing = {
  half: 4,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 32,
} as const;

export const radius = {
  control: 12,
  card: 16,
} as const;

export const border = {
  width: 1,
  color: '#D5E8E6',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
