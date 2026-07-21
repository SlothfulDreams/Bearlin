import { clsx } from 'clsx';
import { Text, type TextProps } from 'react-native';

import { textVariants } from '@/components/themed-text.variants';
import type { ThemeColor } from '@/constants/theme';

export type TextVariant =
  | 'body'
  | 'bodyStrong'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'section'
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'label'
  | 'link'
  | 'linkPrimary'
  | 'code'
  | 'default';

export type ThemedTextProps = TextProps & {
  type?: TextVariant;
  themeColor?: ThemeColor;
  className?: string;
};

const colorClasses: Record<ThemeColor, string> = {
  text: 'text-content dark:text-content-dark',
  textSecondary: 'text-content-muted dark:text-content-muted-dark',
  background: 'text-app dark:text-app-dark',
  backgroundElement: 'text-element dark:text-element-dark',
  backgroundSelected: 'text-element-selected dark:text-element-selected-dark',
  surface: 'text-surface dark:text-surface-dark',
  surfaceElevated: 'text-surface-elevated dark:text-surface-elevated-dark',
  border: 'text-line dark:text-line-dark',
  primary: 'text-primary dark:text-primary-dark',
  primaryPressed: 'text-primary-pressed',
  onPrimary: 'text-white dark:text-content',
  success: 'text-success dark:text-success-dark',
  warning: 'text-warning dark:text-warning-dark',
  danger: 'text-danger dark:text-danger-dark',
  overlay: 'text-content/50 dark:text-black/60',
};

export function ThemedText({
  className,
  style,
  type = 'body',
  themeColor = 'text',
  maxFontSizeMultiplier = 2,
  ...rest
}: ThemedTextProps) {
  const normalizedType = type === 'default' ? 'body' : type;

  return (
    <Text
      className={clsx(textVariants({ type: normalizedType }), colorClasses[themeColor], className)}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={style}
      {...rest}
    />
  );
}

