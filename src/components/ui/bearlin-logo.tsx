import { clsx } from 'clsx';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface BearlinLogoProps {
  compact?: boolean;
  className?: string;
}

export function BearlinLogo({ compact = false, className }: BearlinLogoProps) {
  return (
    <View accessibilityLabel="Bearlin" className={clsx('flex-row items-center gap-3', className)}>
      <View
        className={clsx(
          'relative items-center justify-center bg-brand',
          compact ? 'h-[34px] w-[34px] rounded-[11px]' : 'h-12 w-12 rounded-[15px]',
        )}>
        <View className="absolute -top-[3px] left-[5px] h-3 w-3 rounded-chip bg-brand-dark" />
        <View className="absolute -top-[3px] right-[5px] h-3 w-3 rounded-chip bg-brand-dark" />
        <ThemedText className={clsx('font-black text-white', compact ? 'text-xl leading-6' : 'text-[28px] leading-8')}>
          B
        </ThemedText>
        <View className="absolute bottom-2 h-0.5 w-[52%] rounded-sm bg-white" />
      </View>
      {!compact && <ThemedText type="subtitle">Bearlin</ThemedText>}
    </View>
  );
}
