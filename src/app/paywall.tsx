import { clsx } from 'clsx';
import Check from 'lucide-react-native/icons/check';
import { Alert, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { AppIcon } from '@/components/ui/app-icon';
import { Screen } from '@/components/ui/screen';

function showPreviewNotice() {
  Alert.alert('Preview only', 'Subscriptions are not connected in mock data mode.');
}

export default function PaywallScreen() {
  return (
    <Screen includeTabInset={false}>
      <View className="items-center gap-4 py-8"><View className="h-[92px] w-[92px] items-center justify-center rounded-[30px] bg-primary dark:bg-primary-dark"><ThemedText className="text-[38px] font-black leading-[44px]" themeColor="onPrimary">B+</ThemedText></View><ThemedText className="text-center" type="display">Bearlin Plus</ThemedText><ThemedText className="text-center" themeColor="textSecondary">More stories, audio mode, and offline learning once the real service is connected.</ThemedText></View>
      <View className="w-full max-w-[540px] self-center gap-4">{['Full A1–C2 catalog', 'Audio mode and background playback', 'Save readings for offline use', 'New original texts and courses'].map((feature) => <View key={feature} className="flex-row items-center gap-3"><View className="h-7 w-7 items-center justify-center rounded-chip bg-success dark:bg-success-dark"><AppIcon icon={Check} size={16} themeColor="onPrimary" /></View><ThemedText type="bodyStrong">{feature}</ThemedText></View>)}</View>
      <View className="my-6 flex-row gap-3">
        <Plan title="Monthly" price="Demo" detail="cancel anytime" />
        <Plan title="Yearly" price="Demo" detail="best preview" featured />
      </View>
      <ActionButton label="Choose Plus preview" onPress={showPreviewNotice} />
      <Pressable onPress={showPreviewNotice}><ThemedText className="text-center" type="caption" themeColor="textSecondary">Restore purchases (placeholder)</ThemedText></Pressable>
      <ThemedText className="text-center" type="caption" themeColor="textSecondary">No payment will be made. Prices and terms will be added when a billing provider is connected.</ThemedText>
    </Screen>
  );
}

function Plan({ title, price, detail, featured }: { title: string; price: string; detail: string; featured?: boolean }) {
  return (
    <View className={clsx('relative flex-1 gap-1 rounded-card border-2 bg-surface p-5 dark:bg-surface-dark', featured ? 'border-primary dark:border-primary-dark' : 'border-line dark:border-line-dark')}>
      {featured && <View className="absolute -top-3 right-3 rounded-chip bg-primary px-3 py-1 dark:bg-primary-dark"><ThemedText type="caption" themeColor="onPrimary">RECOMMENDED</ThemedText></View>}
      <ThemedText type="section">{title}</ThemedText><ThemedText type="title" themeColor="primary">{price}</ThemedText><ThemedText type="small" themeColor="textSecondary">{detail}</ThemedText>
    </View>
  );
}
