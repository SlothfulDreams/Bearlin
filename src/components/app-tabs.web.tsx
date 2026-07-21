import { Tabs } from 'expo-router';
import BookOpenText from 'lucide-react-native/icons/book-open-text';
import Compass from 'lucide-react-native/icons/compass';
import House from 'lucide-react-native/icons/house';
import Settings from 'lucide-react-native/icons/settings';

import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 7,
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} />
      <Tabs.Screen name="words" options={{ title: 'Words', tabBarIcon: ({ color, size }) => <BookOpenText color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
