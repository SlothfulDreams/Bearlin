import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProviders } from '@/providers/app-providers';
import { NativeWindThemeSync } from '@/providers/nativewind-theme-sync';
import { useLearningStore } from '@/store/learning-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemScheme = useSystemColorScheme();
  const themePreference = useLearningStore((state) => state.preferences.appTheme);
  const colorScheme = themePreference === 'system' ? systemScheme : themePreference;
  return (
    <AppProviders>
      <NativeWindThemeSync />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="content/[id]/index" options={{ title: 'Reading' }} />
          <Stack.Screen name="reader/[contentId]/[chapterId]" options={{ headerShown: false }} />
          <Stack.Screen name="audiobook/[contentId]/index" options={{ title: 'Audio mode', presentation: 'modal' }} />
          <Stack.Screen name="grammar/[id]" options={{ title: 'Grammar' }} />
          <Stack.Screen name="dictionary/[id]" options={{ title: 'Dictionary', presentation: 'modal' }} />
          <Stack.Screen name="review" options={{ title: 'Review', presentation: 'fullScreenModal' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="paywall" options={{ title: 'Bearlin Plus', presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </AppProviders>
  );
}
