import { useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { DictionaryEntryContent } from '@/components/dictionary/dictionary-entry-content';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { useDictionaryEntry } from '@/hooks/use-content';
import { useLearningStore } from '@/store/learning-store';

export default function DictionaryScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const entry = useDictionaryEntry(id);
  const saved = useLearningStore((state) => state.savedEntryIds.includes(id));
  const toggleSaved = useLearningStore((state) => state.toggleSavedEntry);

  if (entry.isPending) return <Screen includeTabInset={false}><ThemedText>Loading entry…</ThemedText></Screen>;
  if (!entry.data) return <Screen includeTabInset={false}><View className="items-center gap-3 p-6"><ThemedText type="section">Entry not found</ThemedText><Pressable onPress={() => entry.refetch()}><ThemedText themeColor="primary">Try again</ThemedText></Pressable></View></Screen>;

  return <Screen includeTabInset={false} padded={false}><DictionaryEntryContent entry={entry.data} saved={saved} onToggleSaved={() => toggleSaved(id)} /></Screen>;
}
