import ExpoSlider from '@expo/ui/community/slider';
import { clsx } from 'clsx';
import { useLocalSearchParams } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import FastForward from 'lucide-react-native/icons/fast-forward';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import Rewind from 'lucide-react-native/icons/rewind';
import SkipBack from 'lucide-react-native/icons/skip-back';
import SkipForward from 'lucide-react-native/icons/skip-forward';
import Volume2 from 'lucide-react-native/icons/volume-2';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { ContentCover } from '@/components/ui/content-cover';
import { Screen } from '@/components/ui/screen';
import { useChapter, useContentDetail } from '@/hooks/use-content';
import { useNarrationPlayer } from '@/hooks/use-narration-player';
import { useTheme } from '@/hooks/use-theme';

export default function AudiobookScreen() {
  const { contentId = '' } = useLocalSearchParams<{ contentId: string }>();
  const theme = useTheme();
  const detail = useContentDetail(contentId);
  const [chapterIndex, setChapterIndex] = useState(0);
  const currentSummary = detail.data?.chapters[chapterIndex];
  const chapter = useChapter(contentId, currentSummary?.id ?? '');
  const narration = useNarrationPlayer(chapter.data?.audio, setChapterIndex, (detail.data?.chapters.length ?? 1) - 1);

  if (detail.isPending) return <Screen includeTabInset={false}><ThemedText>Loading audio mode…</ThemedText></Screen>;
  if (!detail.data || !currentSummary) return <Screen includeTabInset={false}><ThemedText>No chapters available.</ThemedText></Screen>;

  const content = detail.data;
  const skipChapter = (direction: -1 | 1) => {
    const next = chapterIndex + direction;
    if (next < 0 || next >= content.chapters.length) return;
    narration.pause();
    setChapterIndex(next);
  };
  const cycleRate = () => narration.setRate(narration.rate >= 1.75 ? 0.75 : narration.rate + 0.25);

  return (
    <Screen includeTabInset={false}>
      <View className="w-full max-w-[680px] self-center items-center gap-6 pt-4">
        <ContentCover content={content} className="aspect-square w-[78%] max-w-[360px] rounded-card" />

        <View className="items-center gap-1">
          <ThemedText type="caption" themeColor="textSecondary">CHAPTER {chapterIndex + 1} OF {content.chapters.length}</ThemedText>
          <ThemedText className="text-center" type="subtitle">{currentSummary.title}</ThemedText>
          <ThemedText className="text-center" themeColor="textSecondary">{content.title}</ThemedText>
          {narration.isMock && <ThemedText type="caption" themeColor="warning">DEMO AUDIO TIMELINE</ThemedText>}
        </View>

        <View accessible accessibilityLabel="Playback position" className="w-full">
          <ExpoSlider
            value={narration.positionMs}
            minimumValue={0}
            maximumValue={Math.max(1, narration.durationMs)}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.backgroundSelected}
            thumbTintColor={theme.primary}
            onValueChange={narration.seekToMs}
            style={{ width: '100%', height: 36 }}
          />
          <View className="flex-row justify-between">
            <ThemedText type="caption" themeColor="textSecondary">{formatTime(narration.positionMs)}</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">−{formatTime(Math.max(0, narration.durationMs - narration.positionMs))}</ThemedText>
          </View>
        </View>

        <View className="w-full flex-row items-center justify-around">
          <PlayerButton icon={Rewind} accessibilityLabel="Back 15 seconds" onPress={() => narration.seekToMs(narration.positionMs - 15_000)} />
          <PlayerButton icon={SkipBack} accessibilityLabel="Previous chapter" disabled={chapterIndex === 0} onPress={() => skipChapter(-1)} />
          <Pressable accessibilityLabel={narration.playing ? 'Pause' : 'Play'} onPress={narration.playing ? narration.pause : narration.play} className="h-[72px] w-[72px] items-center justify-center rounded-chip bg-primary active:opacity-80 dark:bg-primary-dark">
            <AppIcon icon={narration.playing ? Pause : Play} size={28} themeColor="onPrimary" />
          </Pressable>
          <PlayerButton icon={SkipForward} accessibilityLabel="Next chapter" disabled={chapterIndex === content.chapters.length - 1} onPress={() => skipChapter(1)} />
          <PlayerButton icon={FastForward} accessibilityLabel="Forward 15 seconds" onPress={() => narration.seekToMs(narration.positionMs + 15_000)} />
        </View>

        <Pressable onPress={cycleRate} className="rounded-chip bg-element px-4 py-2 active:opacity-70 dark:bg-element-dark">
          <ThemedText type="smallBold">Speed {narration.rate}×</ThemedText>
        </Pressable>

        <View className="mt-4 w-full gap-3">
          <ThemedText type="section">Up next</ThemedText>
          {content.chapters.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityState={{ selected: index === chapterIndex }}
              onPress={() => { narration.pause(); setChapterIndex(index); }}
              className={clsx(
                'flex-row items-center gap-3 rounded-control border border-line p-3 active:opacity-70 dark:border-line-dark',
                index === chapterIndex && 'bg-element dark:bg-element-dark',
              )}>
              <View className={clsx('h-[34px] w-[34px] items-center justify-center rounded-chip', index === chapterIndex ? 'bg-primary dark:bg-primary-dark' : 'bg-element dark:bg-element-dark')}>
                <ThemedText className={index === chapterIndex ? 'text-white dark:text-content' : undefined} type="caption">{index + 1}</ThemedText>
              </View>
              <View className="flex-1"><ThemedText type="bodyStrong">{item.title}</ThemedText><ThemedText type="caption" themeColor="textSecondary">{item.estimatedMinutes} min</ThemedText></View>
              {index === chapterIndex && <AppIcon icon={Volume2} size={18} themeColor="primary" />}
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function PlayerButton({ icon, accessibilityLabel, onPress, disabled }: { icon: LucideIcon; accessibilityLabel: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onPress} className="h-12 w-12 items-center justify-center disabled:opacity-[0.35]"><AppIcon icon={icon} size={22} /></Pressable>;
}

function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
