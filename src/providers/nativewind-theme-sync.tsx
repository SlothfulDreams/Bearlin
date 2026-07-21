import { useEffect } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { useLearningStore } from '@/store/learning-store';

export function NativeWindThemeSync() {
  const themePreference = useLearningStore((state) => state.preferences.appTheme);
  const { setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    setColorScheme(themePreference);
  }, [setColorScheme, themePreference]);

  return null;
}
