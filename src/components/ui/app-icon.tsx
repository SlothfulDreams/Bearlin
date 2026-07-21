import type { LucideIcon, LucideProps } from 'lucide-react-native';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppIconProps = Omit<LucideProps, 'color'> & {
  icon: LucideIcon;
  themeColor?: ThemeColor;
  color?: string;
};

/** Theme-aware Lucide icon used throughout Bearlin. */
export function AppIcon({
  icon: Icon,
  themeColor = 'text',
  color,
  size = 20,
  strokeWidth = 2,
  ...props
}: AppIconProps) {
  const theme = useTheme();
  return <Icon color={color ?? theme[themeColor]} size={size} strokeWidth={strokeWidth} {...props} />;
}
