import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { levelClasses } from '@/components/ui/level-badge.variants';
import type { CefrLevel } from '@/data/schemas';

export function LevelBadge({ level }: { level: CefrLevel }) {
  const classes = levelClasses[level];
  return (
    <View
      accessibilityLabel={`CEFR ${level}`}
      className={`self-start rounded-chip px-3 py-1 ${classes.background}`}>
      <ThemedText className={classes.text} type="label">{level}</ThemedText>
    </View>
  );
}

