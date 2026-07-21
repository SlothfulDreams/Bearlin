import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useLearningStore } from '@/store/learning-store';

export default function AppTabs() {
  const systemScheme = useColorScheme();
  const preference = useLearningStore((state) => state.preferences.appTheme);
  const scheme = preference === 'system' ? systemScheme : preference;
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      iconColor={{ default: colors.textSecondary, selected: colors.primary }}
      indicatorColor={colors.backgroundSelected}
      labelVisibilityMode="labeled"
      rippleColor={colors.backgroundSelected}
      tintColor={colors.primary}
      labelStyle={{
        default: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
        selected: { color: colors.primary, fontSize: 12, fontWeight: '700' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/nativeTabIcons/home.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/nativeTabIcons/discover.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="words">
        <NativeTabs.Trigger.Label>Words</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/nativeTabIcons/words.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/nativeTabIcons/settings.png')} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
