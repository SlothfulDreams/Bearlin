import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import FastForward from 'lucide-react-native/icons/fast-forward';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import Rewind from 'lucide-react-native/icons/rewind';
import X from 'lucide-react-native/icons/x';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DictionarySheet } from '@/components/dictionary/dictionary-sheet';
import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { AppIcon } from '@/components/ui/app-icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ReaderContentWidth } from '@/constants/theme';
import type { Token } from '@/data/schemas';
import { useChapter, useContentDetail } from '@/hooks/use-content';
import { useNarrationPlayer } from '@/hooks/use-narration-player';
import { useTheme } from '@/hooks/use-theme';
import { paginateReaderItems, SENTENCES_PER_READER_PAGE } from '@/lib/reader-pagination';
import { useLearningStore } from '@/store/learning-store';

export default function ReaderScreen() {
  const { contentId = '', chapterId = '' } = useLocalSearchParams<{ contentId: string; chapterId: string }>();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const chapter = useChapter(contentId, chapterId);
  const detail = useContentDetail(contentId);
  const [page, setPage] = useState(0);
  const preferences = useLearningStore((state) => state.preferences);
  const updatePreferences = useLearningStore((state) => state.updatePreferences);
  const saveProgress = useLearningStore((state) => state.saveProgress);
  const markContentRead = useLearningStore((state) => state.markContentRead);
  const addReadingMinutes = useLearningStore((state) => state.addReadingMinutes);
  const { translationVisible, showPronunciation, highlightGrammar, showDifficult, fontSize, readerTheme } = preferences;
  const setTranslationVisible = (value: boolean) => updatePreferences({ translationVisible: value });
  const setShowPronunciation = (value: boolean) => updatePreferences({ showPronunciation: value });
  const setHighlightGrammar = (value: boolean) => updatePreferences({ highlightGrammar: value });
  const setShowDifficult = (value: boolean) => updatePreferences({ showDifficult: value });
  const setFontSize = (value: number) => updatePreferences({ fontSize: value });
  const setReaderTheme = (value: 'paper' | 'sepia' | 'night') => updatePreferences({ readerTheme: value });
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [chapterComplete, setChapterComplete] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string>();
  const narration = useNarrationPlayer(chapter.data?.audio, undefined, 0, preferences.playbackRate);

  const readerPages = paginateReaderItems(chapter.data?.sentences ?? []);
  const pageSentences = readerPages[page] ?? [];
  const pageWidth = Math.min(width, ReaderContentWidth + 48);
  const readerColors = {
    paper: { background: theme.background, text: theme.text, muted: theme.textSecondary },
    sepia: { background: '#F5EBD8', text: '#342C24', muted: '#766859' },
    night: { background: '#15171A', text: '#F2EEE9', muted: '#AAA39B' },
  }[readerTheme];

  useEffect(() => {
    const timer = setInterval(() => addReadingMinutes(1), 60_000);
    return () => clearInterval(timer);
  }, [addReadingMinutes]);

  useEffect(() => {
    if (!chapter.data) return;
    const completedSentenceCount = Math.min((page + 1) * SENTENCES_PER_READER_PAGE, chapter.data.sentences.length);
    const percent = completedSentenceCount / chapter.data.sentences.length;
    saveProgress({
      contentId,
      chapterId,
      sentenceIndex: Math.max(0, completedSentenceCount - 1),
      percent,
      completedAt: percent >= 1 ? new Date().toISOString() : null,
    });
    if (percent >= 1 && detail.data?.chapters.at(-1)?.id === chapterId) markContentRead(contentId, true);
  }, [chapter.data, chapterId, contentId, detail.data?.chapters, markContentRead, page, saveProgress]);

  const activeTokenId = pageSentences.flatMap((item) => item.tokens).find((token) => (
    token.audioStartMs !== undefined && token.audioEndMs !== undefined && narration.positionMs >= token.audioStartMs && narration.positionMs < token.audioEndMs
  ))?.id;

  if (chapter.isPending || detail.isPending) {
    return <ReaderState background={readerColors.background} text="Preparing chapter…" />;
  }
  if (chapter.isError || !chapter.data || !detail.data) {
    return <ReaderState background={readerColors.background} text="This chapter could not be opened." />;
  }

  const chapterData = chapter.data;
  const chapters = detail.data.chapters;
  const chapterIndex = chapters.findIndex((item) => item.id === chapterId);
  const previousChapter = chapters[chapterIndex - 1];
  const nextChapter = chapters[chapterIndex + 1];
  const completedSentenceCount = Math.min((page + 1) * SENTENCES_PER_READER_PAGE, chapterData.sentences.length);
  const progress = completedSentenceCount / chapterData.sentences.length;
  const isLastPage = page === readerPages.length - 1;

  const goToPage = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= readerPages.length) return;
    setPage(nextPage);
    narration.seekToMs(readerPages[nextPage][0]?.audioStartMs ?? 0);
  };

  const goBack = () => {
    if (page > 0) {
      goToPage(page - 1);
    } else if (previousChapter) {
      narration.pause();
      setPage(0);
      router.replace({ pathname: '/reader/[contentId]/[chapterId]', params: { contentId, chapterId: previousChapter.id } });
    }
  };

  const goNext = () => {
    if (page < readerPages.length - 1) {
      goToPage(page + 1);
      return;
    }

    narration.pause();
    setChapterComplete(true);
  };

  const continueToNextChapter = () => {
    if (!nextChapter) return;
    setPage(0);
    setChapterComplete(false);
    router.replace({
      pathname: '/reader/[contentId]/[chapterId]',
      params: { contentId, chapterId: nextChapter.id },
    });
  };

  const returnToStory = () => {
    narration.pause();
    router.dismissTo({ pathname: '/content/[id]', params: { id: contentId } });
  };

  const openToken = (token: Token) => {
    narration.pause();
    if (token.dictionaryEntryId) {
      setSelectedEntryId(token.dictionaryEntryId);
    } else if (token.grammarPointIds[0]) {
      router.push({ pathname: '/grammar/[id]', params: { id: token.grammarPointIds[0] } });
    }
  };

  if (chapterComplete) {
    return (
      <ChapterCompletion
        chapterNumber={chapterData.number}
        chapterTitle={chapterData.title}
        nextChapter={nextChapter ? { number: nextChapter.number, title: nextChapter.title } : undefined}
        background={readerColors.background}
        textColor={readerColors.text}
        mutedColor={readerColors.muted}
        onContinue={continueToNextChapter}
        onReturn={returnToStory}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center" style={{ backgroundColor: readerColors.background }}>
      <View className="w-full flex-1" style={{ maxWidth: pageWidth }}>
        <View className="min-h-[54px] flex-row items-center px-3">
          <Pressable accessibilityLabel="Close reader" onPress={() => router.back()} className="h-11 w-[46px] items-center justify-center">
            <AppIcon icon={X} color={readerColors.text} size={22} />
          </Pressable>
          <View className="flex-1 items-center">
            <ThemedText type="smallBold" style={{ color: readerColors.text }} numberOfLines={1}>{chapterData.title}</ThemedText>
            <ThemedText type="caption" style={{ color: readerColors.muted }}>Page {page + 1} of {readerPages.length}</ThemedText>
          </View>
          <Pressable accessibilityLabel="Reading settings" onPress={() => setPreferencesOpen(true)} className="h-11 w-[46px] items-center justify-center">
            <ThemedText style={{ color: readerColors.text }}>Aa</ThemedText>
          </Pressable>
        </View>
        <View className="px-4 pb-2"><ProgressBar value={progress} /></View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: translationVisible }}
          accessibilityLabel={translationVisible ? 'Hide English translations' : 'Show English translations'}
          onPress={() => setTranslationVisible(!translationVisible)}
          className="min-h-12 flex-row items-center justify-between border-y px-6"
          style={{ borderColor: theme.border }}>
          <ThemedText type="smallBold" style={{ color: readerColors.text }}>Translations</ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>{translationVisible ? 'Hide English' : 'Show English'}</ThemedText>
        </Pressable>

        <ScrollView
          key={`${chapterId}-${page}`}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-grow justify-center gap-5 px-6 py-6">
          {pageSentences.map((item) => (
            <View key={item.id} className="gap-1.5">
              <Text style={{ fontSize, lineHeight: fontSize * 1.65, color: readerColors.text }}>
                {item.tokens.map((token, index) => (
                  <TokenText
                    key={token.id}
                    token={token}
                    previous={item.tokens[index - 1]}
                    active={token.id === activeTokenId}
                    showPronunciation={showPronunciation}
                    highlightGrammar={highlightGrammar}
                    showDifficult={showDifficult}
                    onPress={() => openToken(token)}
                  />
                ))}
              </Text>
              {translationVisible && <ThemedText type="small" style={{ color: readerColors.muted }}>{item.translation}</ThemedText>}
            </View>
          ))}
        </ScrollView>

        <View className="min-h-[76px] flex-row items-center justify-between border-t px-3" style={{ borderTopColor: theme.border }}>
          <Pressable
            accessibilityLabel={page === 0 && previousChapter ? 'Previous chapter' : 'Previous page'}
            disabled={page === 0 && !previousChapter}
            onPress={goBack}
            className={clsx('min-h-11 min-w-[66px] flex-row items-center justify-start gap-1', page === 0 && !previousChapter && 'opacity-40')}>
            <AppIcon icon={ChevronLeft} color={theme.primary} size={18} />
            <ThemedText type="smallBold" style={{ color: theme.primary }}>Back</ThemedText>
          </Pressable>
          <Pressable accessibilityLabel="Back five seconds" onPress={() => narration.seekToMs(narration.positionMs - 5_000)} className="min-h-11 min-w-11 items-center justify-center"><AppIcon icon={Rewind} color={readerColors.text} size={20} /></Pressable>
          <Pressable accessibilityLabel={narration.playing ? 'Pause' : 'Play'} onPress={narration.playing ? narration.pause : narration.play} className="h-14 w-14 items-center justify-center rounded-chip" style={{ backgroundColor: theme.primary }}>
            <AppIcon icon={narration.playing ? Pause : Play} color={theme.onPrimary} size={24} />
          </Pressable>
          <Pressable accessibilityLabel="Forward five seconds" onPress={() => narration.seekToMs(narration.positionMs + 5_000)} className="min-h-11 min-w-11 items-center justify-center"><AppIcon icon={FastForward} color={readerColors.text} size={20} /></Pressable>
          <Pressable
            accessibilityLabel={isLastPage ? 'Finish chapter' : 'Next page'}
            onPress={goNext}
            className="min-h-11 min-w-[66px] flex-row items-center justify-end gap-1">
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {isLastPage ? 'Finish' : 'Next'}
            </ThemedText>
            <AppIcon icon={ChevronRight} color={theme.primary} size={18} />
          </Pressable>
        </View>
      </View>

      <DictionarySheet entryId={selectedEntryId} onDismiss={() => setSelectedEntryId(undefined)} />

      <ReaderPreferences
        visible={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        translationVisible={translationVisible}
        setTranslationVisible={setTranslationVisible}
        highlightGrammar={highlightGrammar}
        setHighlightGrammar={setHighlightGrammar}
        showDifficult={showDifficult}
        setShowDifficult={setShowDifficult}
        showPronunciation={showPronunciation}
        setShowPronunciation={setShowPronunciation}
        playbackRate={narration.rate}
        setPlaybackRate={(playbackRate) => {
          narration.setRate(playbackRate);
          updatePreferences({ playbackRate });
        }}
        readerTheme={readerTheme}
        setReaderTheme={setReaderTheme}
      />
    </SafeAreaView>
  );
}

function ChapterCompletion({
  chapterNumber,
  chapterTitle,
  nextChapter,
  background,
  textColor,
  mutedColor,
  onContinue,
  onReturn,
}: {
  chapterNumber: number;
  chapterTitle: string;
  nextChapter?: { number: number; title: string };
  background: string;
  textColor: string;
  mutedColor: string;
  onContinue: () => void;
  onReturn: () => void;
}) {
  const theme = useTheme();
  const storyComplete = !nextChapter;

  return (
    <SafeAreaView className="flex-1 items-center" style={{ backgroundColor: background }}>
      <View className="w-full max-w-reader flex-1 justify-center gap-8 px-6 py-10">
        <View className="items-center gap-4">
          <View
            className="h-16 w-16 items-center justify-center rounded-chip"
            style={{ backgroundColor: theme.primary }}>
            <AppIcon icon={Check} color={theme.onPrimary} size={30} />
          </View>
          <View className="items-center gap-2">
            <ThemedText type="label" style={{ color: theme.primary }}>
              {storyComplete ? 'STORY COMPLETE' : `CHAPTER ${chapterNumber} COMPLETE`}
            </ThemedText>
            <ThemedText className="text-center" type="title" style={{ color: textColor }}>
              {storyComplete ? 'You finished the story' : 'Chapter complete'}
            </ThemedText>
            <ThemedText className="text-center" style={{ color: mutedColor }}>
              You finished “{chapterTitle}”.
            </ThemedText>
          </View>
        </View>

        {nextChapter ? (
          <View
            className="gap-2 rounded-card border p-5"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <ThemedText type="label" style={{ color: mutedColor }}>UP NEXT</ThemedText>
            <ThemedText type="section" style={{ color: textColor }}>
              {nextChapter.number}. {nextChapter.title}
            </ThemedText>
          </View>
        ) : null}

        <View className="gap-3">
          {nextChapter ? (
            <ActionButton label="Continue to next chapter" onPress={onContinue} />
          ) : (
            <ActionButton label="Return to story" onPress={onReturn} />
          )}
          {nextChapter ? (
            <ActionButton label="Return to story" variant="secondary" onPress={onReturn} />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function TokenText({ token, previous, active, showPronunciation, highlightGrammar, showDifficult, onPress }: {
  token: Token; previous?: Token; active: boolean; showPronunciation: boolean; highlightGrammar: boolean; showDifficult: boolean; onPress: () => void;
}) {
  const theme = useTheme();
  const needsSpace = previous && !token.punctuation && !['„', '“', '—', '–'].includes(previous.surface);
  const grammar = highlightGrammar && token.grammarPointIds.length > 0;
  const difficult = showDifficult && Boolean(token.dictionaryEntryId);
  const interactive = Boolean(token.dictionaryEntryId || token.grammarPointIds.length);

  return (
    <Text
      accessibilityHint={showPronunciation ? token.pronunciation : undefined}
      onPress={interactive ? onPress : undefined}
      suppressHighlighting
      style={{
        backgroundColor: active ? '#C99A4552' : 'transparent',
        textDecorationLine: grammar || difficult ? 'underline' : 'none',
        textDecorationColor: grammar ? theme.success : difficult ? theme.primary : 'transparent',
      }}>
      {needsSpace ? ` ${token.surface}` : token.surface}
    </Text>
  );
}

function ReaderPreferences(props: {
  visible: boolean; onClose: () => void; fontSize: number; setFontSize: (value: number) => void;
  translationVisible: boolean; setTranslationVisible: (value: boolean) => void;
  highlightGrammar: boolean; setHighlightGrammar: (value: boolean) => void;
  showDifficult: boolean; setShowDifficult: (value: boolean) => void;
  showPronunciation: boolean; setShowPronunciation: (value: boolean) => void;
  playbackRate: number; setPlaybackRate: (value: number) => void;
  readerTheme: 'paper' | 'sepia' | 'night'; setReaderTheme: (value: 'paper' | 'sepia' | 'night') => void;
}) {
  const theme = useTheme();
  return (
    <Modal visible={props.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={props.onClose}>
      <SafeAreaView className="flex-1 gap-6 bg-app p-6 dark:bg-app-dark">
        <View className="flex-row items-center justify-between"><ThemedText type="section">Reading settings</ThemedText><Pressable onPress={props.onClose}><ThemedText themeColor="primary">Done</ThemedText></Pressable></View>
        <View className="gap-3">
          <ThemedText type="label">FONT SIZE</ThemedText>
          <View className="flex-row items-center justify-between"><Pressable onPress={() => props.setFontSize(Math.max(17, props.fontSize - 2))}><ThemedText type="title">A−</ThemedText></Pressable><ThemedText>{props.fontSize} pt</ThemedText><Pressable onPress={() => props.setFontSize(Math.min(31, props.fontSize + 2))}><ThemedText type="title">A+</ThemedText></Pressable></View>
        </View>
        <View className="flex-row gap-3">{(['paper', 'sepia', 'night'] as const).map((item) => <Pressable key={item} onPress={() => props.setReaderTheme(item)} className="flex-1 items-center rounded-control border-2 py-4" style={{ borderColor: props.readerTheme === item ? theme.primary : theme.border, backgroundColor: item === 'paper' ? '#FDFBF6' : item === 'sepia' ? '#F5EBD8' : '#15171A' }}><ThemedText style={{ color: item === 'night' ? '#FFF' : '#342C24' }}>{item === 'paper' ? 'Paper' : item === 'sepia' ? 'Sepia' : 'Night'}</ThemedText></Pressable>)}</View>
        <PreferenceSwitch label="Always show translations" value={props.translationVisible} onValueChange={props.setTranslationVisible} />
        <PreferenceSwitch label="Highlight grammar" value={props.highlightGrammar} onValueChange={props.setHighlightGrammar} />
        <PreferenceSwitch label="Highlight difficult words" value={props.showDifficult} onValueChange={props.setShowDifficult} />
        <PreferenceSwitch label="Show pronunciation hints" value={props.showPronunciation} onValueChange={props.setShowPronunciation} />
        <View className="min-h-[52px] flex-row items-center justify-between">
          <ThemedText>Playback speed</ThemedText>
          <Pressable
            accessibilityLabel={`Playback speed ${props.playbackRate} times`}
            onPress={() => props.setPlaybackRate(props.playbackRate >= 1.5 ? 0.75 : props.playbackRate + 0.25)}
            className="min-h-11 min-w-14 items-center justify-center rounded-control bg-element dark:bg-element-dark">
            <ThemedText type="smallBold" themeColor="primary">{props.playbackRate}×</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function PreferenceSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return <View className="min-h-[52px] flex-row items-center justify-between"><ThemedText>{label}</ThemedText><Switch value={value} onValueChange={onValueChange} /></View>;
}

function ReaderState({ text, background }: { text: string; background: string }) {
  return <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: background }}><ThemedText type="section">{text}</ThemedText></View>;
}

