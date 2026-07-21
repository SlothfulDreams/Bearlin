import { Platform } from 'react-native';

// E-ink / Kindle-inspired palette: warm paper, soft black ink, muted accents.
// Keep in sync with tailwind.config.js.
export const Brand = {
  red: '#A63D40',
  redDark: '#833134',
  gold: '#C99A45',
  green: '#4F7A5B',
} as const;

/** Runtime colors for native APIs that cannot consume NativeWind class names. */
export const Colors = {
  light: {
    text: '#26241F',
    textSecondary: '#6E675A',
    background: '#F7F4EC',
    backgroundElement: '#EEE9DD',
    backgroundSelected: '#E3DCCC',
    surface: '#FDFBF6',
    surfaceElevated: '#FFFFFF',
    border: '#DCD5C4',
    primary: Brand.red,
    primaryPressed: Brand.redDark,
    onPrimary: '#FFFFFF',
    success: Brand.green,
    warning: '#8A6B29',
    danger: '#9C3332',
    overlay: 'rgba(38, 36, 31, 0.45)',
  },
  // Dark mode is a cool graphite "night reading" scheme: neutral-cool grays
  // instead of the warm paper tones, so the brand red reads clean, not muddy.
  dark: {
    text: '#EAECEF',
    textSecondary: '#9CA3AD',
    background: '#131417',
    backgroundElement: '#22242A',
    backgroundSelected: '#32353D',
    surface: '#1A1C20',
    surfaceElevated: '#24262C',
    border: '#33363E',
    primary: '#EE8578',
    primaryPressed: '#A63D40',
    onPrimary: '#1A1B1E',
    success: '#82C99B',
    warning: '#E6B95E',
    danger: '#F49A90',
    overlay: 'rgba(0, 0, 0, 0.62)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

const BottomTabInset = Platform.select({ ios: 0, android: 76 }) ?? 0;
const ContentEndSpacing = 24;

/** iOS native tabs adjust the first scroll view automatically; Android needs an explicit inset. */
export function getBottomContentPadding(safeAreaBottom: number, includeTabInset = true) {
  if (Platform.OS === 'ios') return ContentEndSpacing;
  return (includeTabInset ? BottomTabInset : 0) + safeAreaBottom + ContentEndSpacing;
}

export const ReaderContentWidth = 720;
