import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { Link } from 'expo-router';
import Search from 'lucide-react-native/icons/search';
import X from 'lucide-react-native/icons/x';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { AppIcon } from '@/components/ui/app-icon';
import { PronunciationButton } from '@/components/ui/pronunciation-button';
import { getBottomContentPadding } from '@/constants/theme';
import { contentRepository } from '@/data/repositories';
import type { DictionaryEntry } from '@/data/schemas';
import { useTheme } from '@/hooks/use-theme';
import { useLearningStore } from '@/store/learning-store';

const SESSION_NOW = Date.now();

export default function WordsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const savedEntryIds = useLearningStore((state) => state.savedEntryIds);
  const reviews = useLearningStore((state) => state.reviews);
  const toggleSaved = useLearningStore((state) => state.toggleSavedEntry);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'due' | 'learning'>('all');
  const entries = useQuery({
    queryKey: ['saved-words', savedEntryIds],
    queryFn: () => contentRepository.getDictionaryEntries(savedEntryIds),
  });
  const now = SESSION_NOW;
  const dueCount = savedEntryIds.filter((id) => (reviews[id]?.card.due.getTime() ?? 0) <= now).length;
  const filtered = (entries.data ?? []).filter((entry) => {
    const matches = `${entry.article ?? ''} ${entry.lemma} ${entry.translations.join(' ')}`.toLocaleLowerCase('de-DE').includes(query.toLocaleLowerCase('de-DE'));
    if (!matches) return false;
    const review = reviews[entry.id];
    if (filter === 'due') return (review?.card.due.getTime() ?? 0) <= SESSION_NOW;
    if (filter === 'learning') return (review?.card.reps ?? 0) > 0;
    return true;
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-app dark:bg-app-dark">
      <View className="w-full max-w-app self-center">
        <View className="flex-row items-center justify-between gap-3 p-4">
          <View><ThemedText type="title">Words</ThemedText><ThemedText themeColor="textSecondary">{savedEntryIds.length} saved · {dueCount} due</ThemedText></View>
          <Link href="/review" asChild><ActionButton label={dueCount ? `Study ${dueCount}` : 'Practice'} compact /></Link>
        </View>

        <View className="m-4 mb-3 min-h-[46px] flex-row items-center gap-3 rounded-control border border-line bg-element px-4 dark:border-line-dark dark:bg-element-dark">
          <AppIcon icon={Search} size={19} themeColor="textSecondary" />
          <TextInput
            accessibilityLabel="Search saved words"
            className="flex-1 py-3 text-base text-content dark:text-content-dark"
            placeholder="Search words"
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View className="flex-row gap-2 px-4 pb-2">
          <Filter label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Filter label={`Due (${dueCount})`} selected={filter === 'due'} onPress={() => setFilter('due')} />
          <Filter label="Learning" selected={filter === 'learning'} onPress={() => setFilter('learning')} />
        </View>
      </View>

      {entries.isPending ? (
        <View className="flex-1 items-center justify-center gap-2 p-6"><ThemedText>Loading words…</ThemedText></View>
      ) : !filtered.length ? (
        <View className="flex-1 items-center justify-center gap-2 p-6"><ThemedText type="section">No words here</ThemedText><ThemedText className="text-center" themeColor="textSecondary">Save words while reading or change your filter.</ThemedText></View>
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WordRow entry={item} due={(reviews[item.id]?.card.due.getTime() ?? 0) <= now} reps={reviews[item.id]?.card.reps ?? 0} onRemove={() => toggleSaved(item.id)} />}
          ItemSeparatorComponent={() => <View className="h-2" />}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: getBottomContentPadding(insets.bottom),
          }}
        />
      )}
    </SafeAreaView>
  );
}

function WordRow({ entry, due, reps, onRemove }: { entry: DictionaryEntry; due: boolean; reps: number; onRemove: () => void }) {
  return (
    <Link href={{ pathname: '/dictionary/[id]', params: { id: entry.id } }} asChild>
      <Pressable className="min-h-24 w-full max-w-app self-center flex-row items-center gap-3 rounded-control border border-line bg-surface p-4 active:opacity-70 dark:border-line-dark dark:bg-surface-dark">
        <View className="h-[52px] w-[52px] items-center justify-center rounded-control bg-element dark:bg-element-dark"><ThemedText type="section" themeColor="primary">{entry.lemma.slice(0, 1)}</ThemedText></View>
        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2"><ThemedText type="bodyStrong">{entry.article ? `${entry.article} ` : ''}{entry.lemma}</ThemedText>{due && <View className="rounded-chip bg-primary px-2 py-0.5 dark:bg-primary-dark"><ThemedText type="caption" themeColor="onPrimary">DUE</ThemedText></View>}</View>
          <ThemedText type="small" themeColor="textSecondary">{entry.translations.join(', ')}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">{entry.partOfSpeech} · {reps ? `reviewed ${reps}×` : 'new'}</ThemedText>
        </View>
        <View className="items-center gap-2">
          <PronunciationButton text={entry.lemma} compact />
          <Pressable accessibilityLabel={`Remove ${entry.lemma}`} hitSlop={10} onPress={(event) => { event.stopPropagation(); onRemove(); }}><AppIcon icon={X} size={18} themeColor="textSecondary" /></Pressable>
        </View>
      </Pressable>
    </Link>
  );
}

function Filter({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityState={{ selected }}
      onPress={onPress}
      className={clsx(
        'rounded-chip px-3 py-2 active:opacity-70',
        selected ? 'bg-primary dark:bg-primary-dark' : 'bg-element dark:bg-element-dark',
      )}>
      <ThemedText className={selected ? 'text-white dark:text-content' : undefined} type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}
