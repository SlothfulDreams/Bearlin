import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';
import { Platform, ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBottomContentPadding } from '@/constants/theme';

interface ScreenProps extends PropsWithChildren, Omit<ScrollViewProps, 'contentContainerStyle'> {
  padded?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  includeTabInset?: boolean;
  className?: string;
}

export function Screen({
  children,
  className,
  padded = true,
  includeTabInset = true,
  contentContainerStyle,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className={clsx('flex-1 bg-app dark:bg-app-dark', className)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        {
          paddingBottom: getBottomContentPadding(insets.bottom, includeTabInset),
          paddingTop: Platform.OS === 'web' ? 24 : undefined,
        },
        contentContainerStyle,
      ]}
      {...props}>
      <View className="w-full items-center">
        <View className={clsx('w-full max-w-app', padded && 'px-4')}>{children}</View>
      </View>
    </ScrollView>
  );
}
