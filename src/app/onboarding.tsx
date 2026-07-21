import { clsx } from 'clsx';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { BearlinLogo } from '@/components/ui/bearlin-logo';
import { LevelBadge } from '@/components/ui/level-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { CefrLevel } from '@/data/schemas';
import { useLearningStore } from '@/store/learning-store';

const levelCopy: Record<CefrLevel, string> = {
  A1: 'I understand a few words and very simple sentences.', A2: 'I can manage familiar everyday situations.',
  B1: 'I understand clear texts about familiar topics.', B2: 'I can read longer stories and arguments.',
  C1: 'I understand demanding texts and subtle distinctions.', C2: 'I can read almost anything fluently and precisely.',
};
const interests = ['Everyday life', 'Travel', 'Culture', 'Science', 'Mystery', 'History'];

export default function OnboardingScreen() {
  const complete = useLearningStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<CefrLevel>('A1');
  const [goal, setGoal] = useState(10);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Everyday life']);
  const finish = () => { complete(level, goal, selectedInterests); router.replace('/'); };

  return (
    <SafeAreaView className="flex-1 bg-app dark:bg-app-dark">
      <View className="flex-row items-center gap-6 p-4"><BearlinLogo /><View className="flex-1"><ProgressBar value={(step + 1) / 4} /></View></View>
      <View className="w-full max-w-[680px] flex-1 self-center p-6">
        {step === 0 && <Welcome />}
        {step === 1 && (
          <View className="flex-1 gap-4"><ThemedText type="title">How much German can you read?</ThemedText><ThemedText themeColor="textSecondary">You can change this at any time.</ThemedText><View className="gap-2">{(Object.keys(levelCopy) as CefrLevel[]).map((item) => <Option key={item} selected={level === item} onPress={() => setLevel(item)}><View className="flex-row items-center gap-3"><LevelBadge level={item} /><ThemedText className="flex-1" type="small">{levelCopy[item]}</ThemedText></View></Option>)}</View></View>
        )}
        {step === 2 && (
          <View className="flex-1 gap-4"><ThemedText type="title">Your daily goal</ThemedText><ThemedText themeColor="textSecondary">A little every day beats long, occasional sessions.</ThemedText><View className="flex-row flex-wrap gap-3">{[5, 10, 15, 20].map((minutes) => <Option key={minutes} selected={goal === minutes} onPress={() => setGoal(minutes)}><View className="w-[110px] items-center"><ThemedText type="title">{minutes}</ThemedText><ThemedText type="small" themeColor="textSecondary">minutes</ThemedText></View></Option>)}</View></View>
        )}
        {step === 3 && (
          <View className="flex-1 gap-4"><ThemedText type="title">What interests you?</ThemedText><ThemedText themeColor="textSecondary">We will use this to personalize your recommendations.</ThemedText><View className="flex-row flex-wrap gap-3">{interests.map((item) => <Option key={item} selected={selectedInterests.includes(item)} onPress={() => setSelectedInterests((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}><ThemedText type="bodyStrong">{item}</ThemedText></Option>)}</View></View>
        )}
      </View>
      <View className="w-full max-w-[680px] self-center flex-row gap-3 p-4">
        {step > 0 && <ActionButton label="Back" variant="ghost" onPress={() => setStep((value) => value - 1)} />}
        <ActionButton className="flex-1" label={step === 3 ? 'Start Bearlin' : 'Continue'} onPress={step === 3 ? finish : () => setStep((value) => value + 1)} />
      </View>
    </SafeAreaView>
  );
}

function Welcome() {
  return (
    <View className="flex-1 items-center justify-center gap-6">
      <View className="h-28 w-28 items-center justify-center rounded-[36px] bg-brand"><ThemedText className="text-[64px] font-black leading-[72px]" themeColor="onPrimary">B</ThemedText></View>
      <ThemedText className="text-center" type="display">Read German.{`\n`}Learn naturally.</ThemedText>
      <ThemedText className="text-center" themeColor="textSecondary">Discover stories at your level, tap any word for help, and review vocabulary at the right time.</ThemedText>
    </View>
  );
}

function Option({ selected, onPress, children }: React.PropsWithChildren<{ selected: boolean; onPress: () => void }>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={clsx(
        'rounded-control border-2 p-4 active:opacity-70',
        selected
          ? 'border-primary bg-element-selected dark:border-primary-dark dark:bg-element-selected-dark'
          : 'border-line bg-surface dark:border-line-dark dark:bg-surface-dark',
      )}>
      {children}
    </Pressable>
  );
}
