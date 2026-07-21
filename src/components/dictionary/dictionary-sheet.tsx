import { BottomSheetModal, BottomSheetScrollView } from '@expo/ui/community/bottom-sheet';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { DictionaryEntryContent } from '@/components/dictionary/dictionary-entry-content';
import { ThemedText } from '@/components/themed-text';
import { useDictionaryEntry } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import { useLearningStore } from '@/store/learning-store';

export function DictionarySheet({ entryId, onDismiss }: { entryId?: string; onDismiss: () => void }) {
  const ref = useRef<BottomSheetModal>(null);
  const theme = useTheme();
  const entry = useDictionaryEntry(entryId);
  const saved = useLearningStore((state) => Boolean(entryId && state.savedEntryIds.includes(entryId)));
  const toggleSaved = useLearningStore((state) => state.toggleSavedEntry);

  useEffect(() => {
    if (!entryId) return;
    const frame = requestAnimationFrame(() => ref.current?.present());
    return () => cancelAnimationFrame(frame);
  }, [entryId]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['55%', '90%']}
      enablePanDownToClose
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: theme.surface }}>
      <BottomSheetScrollView>
        {entry.isPending ? (
          <View className="items-center p-8"><ActivityIndicator color={theme.primary} /></View>
        ) : entry.data ? (
          <DictionaryEntryContent
            entry={entry.data}
            saved={saved}
            onToggleSaved={() => {
              if (entryId) toggleSaved(entryId);
              haptics.success();
            }}
          />
        ) : (
          <View className="p-8"><ThemedText>No dictionary entry found.</ThemedText></View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
