import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLearningStore } from '@/store/learning-store';

export function useTheme() {
  const systemScheme = useColorScheme();
  const preference = useLearningStore((state) => state.preferences.appTheme);
  const scheme = preference === 'system' ? systemScheme : preference;
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
