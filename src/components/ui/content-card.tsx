import { clsx } from 'clsx';
import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ContentCover } from '@/components/ui/content-cover';
import { LevelBadge } from '@/components/ui/level-badge';
import type { ContentSummary } from '@/data/schemas';

type ContentCardProps = {
  content: ContentSummary;
  compact?: boolean;
  footer?: ReactNode;
};

/**
 * Shared reading card for shelves, lists, and the Home resume card.
 * Compact cards use a common minimum height and bottom-aligned metadata so
 * one- and two-line titles remain visually aligned without clipping large text.
 */
export function ContentCard({ content, compact = false, footer }: ContentCardProps) {
  return (
    <View
      className={clsx(
        'w-[244px] overflow-hidden rounded-card border border-line bg-surface dark:border-line-dark dark:bg-surface-dark',
        compact && 'w-full',
      )}>
      <Link href={{ pathname: '/content/[id]', params: { id: content.id } }} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${content.title}, ${content.level}`}
          className={clsx('active:scale-[0.99] active:opacity-75', compact && 'h-[168px] flex-row')}>
          <ContentCover
            content={content}
            className={compact ? 'h-[168px] w-[104px]' : 'h-[126px] w-full'}
          />

          <View className={clsx('flex-1 gap-2 p-4', compact && 'h-[168px]')}>
            <View className="flex-row items-center justify-between gap-2">
              <LevelBadge level={content.level} />
              {content.access === 'premium' && (
                <ThemedText type="caption" themeColor="warning">PREMIUM</ThemedText>
              )}
            </View>
            <ThemedText type="bodyStrong" numberOfLines={2}>{content.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={compact ? 1 : 2}>
              {content.description}
            </ThemedText>
            <ThemedText className="mt-auto" type="caption" themeColor="textSecondary">
              {content.type === 'article' ? 'Article' : content.type === 'story' ? 'Story' : 'Course'} · {content.estimatedMinutes} min
            </ThemedText>
          </View>
        </Pressable>
      </Link>

      {footer ? (
        <View className="gap-3 border-t border-line p-4 dark:border-line-dark">
          {footer}
        </View>
      ) : null}
    </View>
  );
}
