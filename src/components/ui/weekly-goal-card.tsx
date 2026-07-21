import { clsx } from 'clsx';
import Check from 'lucide-react-native/icons/check';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import { localDateKey, weekContaining } from '@/lib/calendar';

type WeeklyGoalCardProps = {
  dailyGoalMinutes: number;
  minutesByDate: Record<string, number>;
  today: Date;
};

export function WeeklyGoalCard({ dailyGoalMinutes, minutesByDate, today }: WeeklyGoalCardProps) {
  const todayKey = localDateKey(today);
  const todayMinutes = minutesByDate[todayKey] ?? 0;
  const progress = Math.min(1, todayMinutes / dailyGoalMinutes);

  return (
    <View className="w-full gap-4 rounded-control bg-element p-4 dark:bg-element-dark">
      <View className="flex-row">
        {weekContaining(today).map((date) => {
          const key = localDateKey(date);
          const minutes = minutesByDate[key] ?? 0;
          const isToday = key === todayKey;
          const completed = minutes >= dailyGoalMinutes;
          const weekday = date.toLocaleDateString('en-US', { weekday: 'narrow' });

          return (
            <View
              key={key}
              accessible
              accessibilityLabel={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, ${minutes} of ${dailyGoalMinutes} minutes`}
              className="flex-1 items-center gap-1.5">
              <ThemedText type="caption" themeColor={isToday ? 'primary' : 'textSecondary'}>{weekday}</ThemedText>
              <View
                className={clsx(
                  'h-8 w-8 items-center justify-center rounded-chip',
                  completed
                    ? 'bg-success dark:bg-success-dark'
                    : isToday
                      ? 'bg-primary dark:bg-primary-dark'
                      : 'bg-surface/60 dark:bg-surface-dark/60',
                )}>
                {completed ? (
                  <AppIcon icon={Check} size={15} strokeWidth={2.5} themeColor="onPrimary" />
                ) : (
                  <ThemedText type="smallBold" themeColor={isToday ? 'onPrimary' : 'textSecondary'}>{date.getDate()}</ThemedText>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View className="gap-2 border-t border-line pt-3 dark:border-line-dark">
        <View className="flex-row items-center justify-between gap-3">
          <ThemedText type="caption" themeColor="textSecondary">TODAY&apos;S GOAL</ThemedText>
          <ThemedText type="smallBold">{todayMinutes} / {dailyGoalMinutes} min</ThemedText>
        </View>
        <ProgressBar value={progress} />
      </View>
    </View>
  );
}
