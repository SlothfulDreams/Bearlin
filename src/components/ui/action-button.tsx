import type { VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { Pressable, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { buttonVariants, labelVariants } from '@/components/ui/action-button.variants';

interface ActionButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ActionButton({
  className,
  label,
  icon,
  variant = 'primary',
  compact = false,
  ...props
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={clsx(buttonVariants({ variant, compact }), className)}
      {...props}>
      <View className="flex-row items-center justify-center gap-2">
        {icon}
        <ThemedText className={labelVariants({ variant })}>{label}</ThemedText>
      </View>
    </Pressable>
  );
}

