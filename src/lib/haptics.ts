import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function safelyRun(effect: () => Promise<void>) {
  if (Platform.OS === 'web') return;

  try {
    await effect();
  } catch {
    // Haptics are an enhancement and should never block a learning action.
  }
}

export const haptics = {
  selection: () => safelyRun(() => Haptics.selectionAsync()),
  success: () => safelyRun(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safelyRun(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
