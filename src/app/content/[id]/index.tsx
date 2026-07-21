import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import Bookmark from 'lucide-react-native/icons/bookmark';
import BookmarkCheck from 'lucide-react-native/icons/bookmark-check';
import Check from 'lucide-react-native/icons/check';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Circle from 'lucide-react-native/icons/circle';
import Download from 'lucide-react-native/icons/download';
import LockKeyhole from 'lucide-react-native/icons/lock-keyhole';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { AppIcon } from '@/components/ui/app-icon';
import { ContentCover } from '@/components/ui/content-cover';
import { LevelBadge } from '@/components/ui/level-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { contentRepository } from '@/data/repositories';
import { haptics } from '@/lib/haptics';
import { contentKeys, useContentDetail } from '@/hooks/use-content';
import { useLearningStore } from '@/store/learning-store';

export default function ContentOverviewScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const detail = useContentDetail(id);
  const bookmarked = useLearningStore((state) => state.bookmarks.includes(id));
  const downloaded = useLearningStore((state) => Boolean(state.downloads[id]));
  const markedRead = useLearningStore((state) => state.completedContentIds.includes(id));
  const savedProgress = useLearningStore((state) => state.progress[id]);
  const toggleBookmark = useLearningStore((state) => state.toggleBookmark);
  const toggleDownload = useLearningStore((state) => state.toggleDownload);
  const markContentRead = useLearningStore((state) => state.markContentRead);

  const keywords = useQuery({
    queryKey: [...contentKeys.detail(id), 'keywords'],
    queryFn: () => contentRepository.getDictionaryEntries(detail.data?.keywordIds ?? []),
    enabled: Boolean(detail.data),
  });
  const grammar = useQuery({
    queryKey: [...contentKeys.detail(id), 'grammar'],
    queryFn: () => contentRepository.getGrammarPoints(detail.data?.grammarPointIds ?? []),
    enabled: Boolean(detail.data),
  });

  if (detail.isPending) return <OverviewState title="Loading reading…" />;
  if (detail.isError) return <OverviewState title="The reading could not be loaded" action="Try again" onPress={() => detail.refetch()} />;
  if (!detail.data) return <OverviewState title="This reading was not found" />;

  const content = detail.data;
  const firstChapter = content.chapters[0];

  return (
    <Screen includeTabInset={false} padded={false}>
      <Stack.Screen options={{ title: content.type === 'article' ? 'Article' : content.type === 'story' ? 'Story' : 'Course' }} />
      <ContentCover content={content} className="h-[270px] w-full" />

      <View className="w-full max-w-[760px] self-center gap-4 p-6">
        <View className="flex-row flex-wrap items-center gap-3">
          <LevelBadge level={content.level} />
          <ThemedText type="caption" themeColor="textSecondary">{content.topic} · {content.estimatedMinutes} min</ThemedText>
          {content.access === 'premium' && <ThemedText type="caption" themeColor="warning">BEARLIN PLUS</ThemedText>}
        </View>
        <ThemedText type="title">{content.title}</ThemedText>
        {content.subtitle && <ThemedText type="section" themeColor="textSecondary">{content.subtitle}</ThemedText>}
        <ThemedText themeColor="textSecondary">{content.longDescription}</ThemedText>

        <View className="mt-3 flex-row flex-wrap gap-3">
          {firstChapter && (
            <Link href={{ pathname: '/reader/[contentId]/[chapterId]', params: { contentId: content.id, chapterId: firstChapter.id } }} asChild>
              <ActionButton className="min-w-40 flex-1" label="Read & Listen" />
            </Link>
          )}
          <Link href={{ pathname: '/audiobook/[contentId]', params: { contentId: content.id } }} asChild>
            <ActionButton className="min-w-40 flex-1" label="Audio mode" variant="secondary" />
          </Link>
        </View>

        <View className="flex-row justify-around py-4">
          <UtilityButton label={bookmarked ? 'Saved' : 'Save'} icon={bookmarked ? BookmarkCheck : Bookmark} selected={bookmarked} onPress={() => { toggleBookmark(id); haptics.selection(); }} />
          <UtilityButton label={downloaded ? 'Offline' : 'Download'} icon={downloaded ? Check : Download} selected={downloaded} onPress={() => { toggleDownload(id); haptics.success(); }} />
          <UtilityButton label={markedRead ? 'Read' : 'Mark as read'} icon={markedRead ? Check : Circle} selected={markedRead} onPress={() => markContentRead(id, !markedRead)} />
        </View>

        <Section title="Chapters">
          <View className="gap-3">
            {content.chapters.map((chapter) => (
              <Link key={chapter.id} href={{ pathname: '/reader/[contentId]/[chapterId]', params: { contentId: content.id, chapterId: chapter.id } }} asChild>
                <Pressable className="flex-row items-center gap-3 rounded-control border border-line bg-surface p-4 active:opacity-70 dark:border-line-dark dark:bg-surface-dark">
                  <View className="h-9 w-9 items-center justify-center rounded-chip bg-element dark:bg-element-dark"><ThemedText type="smallBold">{chapter.number}</ThemedText></View>
                  <View className="flex-1 gap-1">
                    <ThemedText type="bodyStrong">{chapter.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">{chapter.summary}</ThemedText>
                    {savedProgress?.chapterId === chapter.id && <View className="mt-2 gap-1"><ProgressBar value={savedProgress.percent} /><ThemedText type="caption" themeColor="textSecondary">{Math.round(savedProgress.percent * 100)}% read</ThemedText></View>}
                  </View>
                  <AppIcon icon={chapter.access === 'premium' ? LockKeyhole : ChevronRight} size={18} themeColor="textSecondary" />
                </Pressable>
              </Link>
            ))}
          </View>
        </Section>

        <Section title="Key words">
          <View className="flex-row flex-wrap gap-2">
            {keywords.data?.map((word) => (
              <Link key={word.id} href={{ pathname: '/dictionary/[id]', params: { id: word.id } }} asChild>
                <Pressable className="gap-1 rounded-control bg-element px-4 py-3 active:opacity-70 dark:bg-element-dark">
                  <ThemedText type="smallBold">{word.article ? `${word.article} ` : ''}{word.lemma}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">{word.translations[0]}</ThemedText>
                </Pressable>
              </Link>
            ))}
          </View>
        </Section>

        <Section title="Grammar">
          <View className="gap-2">
            {grammar.data?.map((point) => (
              <Link key={point.id} href={{ pathname: '/grammar/[id]', params: { id: point.id } }} asChild>
                <Pressable className="flex-row items-center gap-3 border-b border-line py-4 active:opacity-70 dark:border-line-dark">
                  <View className="flex-1 gap-1"><ThemedText type="bodyStrong">{point.title}</ThemedText><ThemedText type="small" themeColor="textSecondary">{point.summary}</ThemedText></View>
                  <AppIcon icon={ChevronRight} size={18} themeColor="primary" />
                </Pressable>
              </Link>
            ))}
          </View>
        </Section>
      </View>
    </Screen>
  );
}

function UtilityButton({ label, icon, selected, onPress }: { label: string; icon: LucideIcon; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} className="min-w-[82px] items-center gap-2">
      <View className={clsx('h-11 w-11 items-center justify-center rounded-chip', selected ? 'bg-primary dark:bg-primary-dark' : 'bg-element dark:bg-element-dark')}>
        <AppIcon icon={icon} size={20} themeColor={selected ? 'onPrimary' : 'textSecondary'} />
      </View>
      <ThemedText className={selected ? 'text-primary dark:text-primary-dark' : undefined} type="caption" themeColor={selected ? 'primary' : 'textSecondary'}>{label}</ThemedText>
    </Pressable>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return <View className="mt-6 gap-4"><ThemedText type="section">{title}</ThemedText>{children}</View>;
}

function OverviewState({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <Screen includeTabInset={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View className="items-center gap-3 p-6"><ThemedText type="section">{title}</ThemedText>{action && <Pressable onPress={onPress}><ThemedText themeColor="primary">{action}</ThemedText></Pressable>}</View>
    </Screen>
  );
}
