import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { router } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import X from 'lucide-react-native/icons/x';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { AppIcon } from '@/components/ui/app-icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import { PronunciationButton } from '@/components/ui/pronunciation-button';
import { contentRepository } from '@/data/repositories';
import type { DictionaryEntry } from '@/data/schemas';
import { haptics } from '@/lib/haptics';
import type { ReviewGrade } from '@/lib/fsrs';
import { useLearningStore } from '@/store/learning-store';

export default function ReviewScreen() {
  const reducedMotion = useReducedMotion();
  const reviews = useLearningStore((state) => state.reviews);
  const gradeEntry = useLearningStore((state) => state.gradeEntry);
  const [sessionIds] = useState(() => Object.values(reviews).reduce<string[]>((ids, review) => {
    if (review.card.due.getTime() <= Date.now()) ids.push(review.entryId);
    return ids;
  }, []));
  const entries = useQuery({ queryKey: ['review-session', sessionIds], queryFn: () => contentRepository.getDictionaryEntries(sessionIds) });
  const entryMap = new Map(entries.data?.map((entry) => [entry.id, entry]));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState<Record<ReviewGrade, number>>({ forgot: 0, almost: 0, 'got-it': 0 });
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const current = entryMap.get(sessionIds[index]);

  const grade = (value: ReviewGrade) => {
    const entryId = sessionIds[index];
    if (!entryId) return;
    gradeEntry(entryId, value);
    setStats((currentStats) => ({ ...currentStats, [value]: currentStats[value] + 1 }));
    setRevealed(false);
    setIndex((currentIndex) => currentIndex + 1);
    translateX.set(0);
    rotate.set(0);
    if (value === 'forgot') haptics.warning();
    else haptics.success();
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.set(event.translationX);
      rotate.set(interpolate(event.translationX, [-220, 0, 220], [-8, 0, 8]));
    })
    .onEnd((event) => {
      if (event.translationX <= -90) scheduleOnRN(grade, 'forgot');
      else if (event.translationX >= 90) scheduleOnRN(grade, 'got-it');
      else {
        translateX.set(reducedMotion ? 0 : withSpring(0));
        rotate.set(reducedMotion ? 0 : withSpring(0));
      }
    });
  const animatedCard = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.get() }, { rotate: `${rotate.get()}deg` }] }));

  if (entries.isPending) return <SafeAreaView className="flex-1 items-center justify-center bg-app dark:bg-app-dark"><ThemedText>Preparing your review…</ThemedText></SafeAreaView>;
  if (index >= sessionIds.length || !sessionIds.length) return <ReviewComplete total={sessionIds.length} stats={stats} />;
  if (!current) return <SafeAreaView className="flex-1 items-center justify-center bg-app dark:bg-app-dark"><ThemedText>This card is unavailable.</ThemedText></SafeAreaView>;

  return (
    <SafeAreaView className="flex-1 bg-app dark:bg-app-dark">
      <View className="min-h-[60px] flex-row items-center gap-4 px-4">
        <Pressable accessibilityLabel="Close review" hitSlop={8} onPress={() => router.back()}><AppIcon icon={X} size={22} /></Pressable>
        <View className="flex-1"><ProgressBar value={index / sessionIds.length} /></View>
        <ThemedText type="smallBold">{index + 1}/{sessionIds.length}</ThemedText>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <View className="absolute left-4 top-1/2 rounded-control bg-danger p-4 dark:bg-danger-dark"><ThemedText themeColor="onPrimary">FORGOT</ThemedText></View>
        <View className="absolute right-4 top-1/2 rounded-control bg-success p-4 dark:bg-success-dark"><ThemedText themeColor="onPrimary">GOT IT</ThemedText></View>
        <GestureDetector gesture={pan}>
          <Animated.View className="min-h-[480px] w-full max-w-[520px] rounded-card border border-line bg-surface shadow-xl dark:border-line-dark dark:bg-surface-dark" style={animatedCard}>
            <ReviewCard entry={current} revealed={revealed} onReveal={() => setRevealed(true)} />
          </Animated.View>
        </GestureDetector>
      </View>

      <ThemedText className="px-4 text-center" type="caption" themeColor="textSecondary">Swipe left or right, or choose a rating below.</ThemedText>
      <View className="flex-row gap-2 p-4">
        <GradeButton label="Forgot" tone="danger" onPress={() => grade('forgot')} />
        <GradeButton label="Almost" tone="warning" onPress={() => grade('almost')} />
        <GradeButton label="Got it" tone="success" onPress={() => grade('got-it')} />
      </View>
    </SafeAreaView>
  );
}

function ReviewCard({ entry, revealed, onReveal }: { entry: DictionaryEntry; revealed: boolean; onReveal: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={revealed ? 'Card revealed' : 'Show answer'} onPress={onReveal} className="flex-1 items-center justify-center gap-4 p-8">
      <ThemedText type="caption" themeColor="textSecondary">{entry.partOfSpeech.toLocaleUpperCase('en-US')}</ThemedText>
      <ThemedText className="text-center text-[42px] font-extrabold leading-[50px]">{entry.article ? `${entry.article} ` : ''}{entry.lemma}</ThemedText>
      <PronunciationButton text={entry.lemma} pronunciation={entry.pronunciation} showPronunciation />
      {revealed ? (
        <View className="w-full items-center gap-3 pt-4">
          <ThemedText type="section">{entry.translations.join(', ')}</ThemedText>
          <ThemedText themeColor="textSecondary">{entry.contextualMeaning}</ThemedText>
          {entry.examples[0] && <View className="w-full gap-1 rounded-control p-4"><ThemedText type="bodyStrong">{entry.examples[0].german}</ThemedText><ThemedText type="small" themeColor="textSecondary">{entry.examples[0].translation}</ThemedText></View>}
          {entry.forms.length > 0 && <ThemedText type="small" themeColor="textSecondary">{entry.forms.map((form) => `${form.label}: ${form.value}`).join(' · ')}</ThemedText>}
        </View>
      ) : (
        <View className="mt-6"><ThemedText themeColor="primary">Tap to show the answer</ThemedText></View>
      )}
    </Pressable>
  );
}

const gradeClasses = {
  danger: { border: 'border-danger dark:border-danger-dark', dot: 'bg-danger dark:bg-danger-dark', text: 'text-danger dark:text-danger-dark' },
  warning: { border: 'border-warning dark:border-warning-dark', dot: 'bg-warning dark:bg-warning-dark', text: 'text-warning dark:text-warning-dark' },
  success: { border: 'border-success dark:border-success-dark', dot: 'bg-success dark:bg-success-dark', text: 'text-success dark:text-success-dark' },
} as const;

function GradeButton({ label, tone, onPress }: { label: string; tone: keyof typeof gradeClasses; onPress: () => void }) {
  const classes = gradeClasses[tone];
  return <Pressable accessibilityRole="button" onPress={onPress} className={clsx('min-h-[52px] flex-1 items-center justify-center gap-1 rounded-control border active:opacity-70', classes.border)}><View className={clsx('h-[7px] w-[7px] rounded-chip', classes.dot)} /><ThemedText className={classes.text} type="smallBold">{label}</ThemedText></Pressable>;
}

function ReviewComplete({ total, stats }: { total: number; stats: Record<ReviewGrade, number> }) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-app p-6 dark:bg-app-dark">
      <View className="h-[82px] w-[82px] items-center justify-center rounded-chip bg-success dark:bg-success-dark"><AppIcon icon={Check} size={40} strokeWidth={2.5} themeColor="onPrimary" /></View>
      <ThemedText type="title">Review complete!</ThemedText>
      <ThemedText themeColor="textSecondary">You reviewed {total} {total === 1 ? 'word' : 'words'}.</ThemedText>
      <View className="my-4 w-full max-w-[520px] flex-row gap-3"><Stat value={stats.forgot} label="Forgot" /><Stat value={stats.almost} label="Almost" /><Stat value={stats['got-it']} label="Got it" /></View>
      <ActionButton label="Back to Words" onPress={() => router.back()} />
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <View className="flex-1 items-center rounded-control bg-element p-4 dark:bg-element-dark"><ThemedText type="subtitle">{value}</ThemedText><ThemedText type="caption" themeColor="textSecondary">{label}</ThemedText></View>;
}
