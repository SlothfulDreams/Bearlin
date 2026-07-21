import { FlashList } from '@shopify/flash-list';
import { clsx } from 'clsx';
import Search from 'lucide-react-native/icons/search';
import X from 'lucide-react-native/icons/x';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { ContentCard } from '@/components/ui/content-card';
import { getBottomContentPadding } from '@/constants/theme';
import type { ContentFilters } from '@/data/content-repository';
import type { CefrLevel, ContentType } from '@/data/schemas';
import { useContentSearch } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';

const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const types: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'story', label: 'Stories' },
  { value: 'course', label: 'Courses' },
];

export default function DiscoverScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 2 : 1;
  const [query, setQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<CefrLevel[]>([]);
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [access, setAccess] = useState<'all' | 'free' | 'premium'>('all');

  const filters: ContentFilters = {
    query,
    levels: selectedLevels,
    types: selectedType === 'all' ? undefined : [selectedType],
    access,
    sort: 'recommended',
  };
  const result = useContentSearch(filters);

  const toggleLevel = (level: CefrLevel) => {
    setSelectedLevels((current) => current.includes(level) ? current.filter((item) => item !== level) : [...current, level]);
  };
  const clearFilters = () => {
    setQuery('');
    setSelectedLevels([]);
    setSelectedType('all');
    setAccess('all');
  };

  return (
    <SafeAreaView className="flex-1 bg-app dark:bg-app-dark" edges={['top']}>
      <View className="w-full max-w-app self-center">
        <View className="flex-row items-end justify-between px-4 pb-4 pt-3">
          <View>
            <ThemedText type="title">Discover</ThemedText>
            <ThemedText themeColor="textSecondary">Find your next German reading</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">{result.data?.total ?? 0} readings</ThemedText>
        </View>

        <View className="gap-3 pb-2">
          <View className="mx-4 min-h-12 flex-row items-center gap-3 rounded-control border border-line bg-element px-4 dark:border-line-dark dark:bg-element-dark">
            <AppIcon icon={Search} size={19} themeColor="textSecondary" />
            <TextInput
              accessibilityLabel="Search readings"
              className="flex-1 py-3 text-base text-content dark:text-content-dark"
              placeholder="Title, topic, or keyword"
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
            {query ? <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQuery('')}><AppIcon icon={X} size={18} themeColor="textSecondary" /></Pressable> : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4">
            {types.map((type) => (
              <FilterChip key={type.value} label={type.label} selected={selectedType === type.value} onPress={() => setSelectedType(type.value)} />
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4">
            {levels.map((level) => <FilterChip key={level} label={level} selected={selectedLevels.includes(level)} onPress={() => toggleLevel(level)} />)}
            <FilterChip label="Free only" selected={access === 'free'} onPress={() => setAccess(access === 'free' ? 'all' : 'free')} />
            <FilterChip label="Plus" selected={access === 'premium'} onPress={() => setAccess(access === 'premium' ? 'all' : 'premium')} />
            {(query || selectedLevels.length > 0 || selectedType !== 'all' || access !== 'all') && (
              <Pressable accessibilityRole="button" onPress={clearFilters} className="justify-center px-2 active:opacity-70">
                <ThemedText type="smallBold" themeColor="primary">Reset</ThemedText>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>

      {result.isPending ? (
        <LoadingState />
      ) : result.isError ? (
        <CenteredState title="Something went wrong" message="The library could not be loaded." action="Try again" onPress={() => result.refetch()} />
      ) : !result.data.items.length ? (
        <CenteredState title="No matching readings" message="Change your search or remove a filter." action="Reset filters" onPress={clearFilters} />
      ) : (
        <FlashList
          key={`discover-${columns}`}
          data={result.data.items}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <View className="flex-1 px-2"><ContentCard content={item} compact /></View>}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListFooterComponent={<View style={{ height: getBottomContentPadding(insets.bottom) }} />}
        />
      )}
    </SafeAreaView>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={clsx(
        'rounded-chip border px-4 py-2 active:opacity-70',
        selected
          ? 'border-primary bg-primary dark:border-primary-dark dark:bg-primary-dark'
          : 'border-line bg-element dark:border-line-dark dark:bg-element-dark',
      )}>
      <ThemedText className={selected ? 'text-white dark:text-content' : undefined} type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

function LoadingState() {
  return (
    <View accessibilityLabel="Loading library" className="gap-4 p-4">
      {[0, 1, 2].map((item) => <View key={item} className="h-[156px] rounded-card bg-element opacity-75 dark:bg-element-dark" />)}
    </View>
  );
}

function CenteredState({ title, message, action, onPress }: { title: string; message: string; action: string; onPress: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-8">
      <ThemedText type="section">{title}</ThemedText>
      <ThemedText className="text-center" themeColor="textSecondary">{message}</ThemedText>
      <Pressable onPress={onPress}><ThemedText type="linkPrimary" themeColor="primary">{action}</ThemedText></Pressable>
    </View>
  );
}
