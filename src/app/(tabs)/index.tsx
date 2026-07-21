import { Link, router } from 'expo-router';
import Flame from 'lucide-react-native/icons/flame';
import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { AppIcon } from '@/components/ui/app-icon';
import { BearlinLogo } from '@/components/ui/bearlin-logo';
import { ContentCard } from '@/components/ui/content-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { WeeklyGoalCard } from '@/components/ui/weekly-goal-card';
import { useHomeFeed } from '@/hooks/use-content';
import { useLearningStore } from '@/store/learning-store';

const SESSION_NOW = Date.now();

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning!';
  if (hour < 18) return 'Good afternoon!';
  return 'Good evening!';
}

export default function HomeScreen() {
  const hydrated = useLearningStore((state) => state.hydrated);
  const onboardingComplete = useLearningStore((state) => state.onboardingComplete);
  const profile = useLearningStore((state) => state.profile);
  const dailyReadingMinutes = useLearningStore((state) => state.dailyReadingMinutes);
  const streakDays = useLearningStore((state) => state.streakDays);
  const progress = useLearningStore((state) => state.progress);
  const feed = useHomeFeed(profile.level);

  const continueReading = feed.data?.recommended.find((item) => progress[item.id]) ?? feed.data?.recommended[0];
  const currentProgress = continueReading ? progress[continueReading.id] : undefined;

  useEffect(() => {
    if (hydrated && !onboardingComplete) router.replace('/onboarding');
  }, [hydrated, onboardingComplete]);

  return (
    <Screen padded={false}>
      {/* Header: brand + streak. */}
      <View className="flex-row items-center justify-between px-4 pb-5 pt-4">
        <BearlinLogo />
        <View className="flex-row items-center gap-1.5 rounded-chip bg-element px-3 py-2 dark:bg-element-dark">
          <AppIcon icon={Flame} size={16} themeColor="primary" />
          <ThemedText type="smallBold">{streakDays}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">day streak</ThemedText>
        </View>
      </View>

      <View className="gap-1 px-4">
        <ThemedText type="display">{greetingForHour(new Date(SESSION_NOW).getHours())}</ThemedText>
        <ThemedText themeColor="textSecondary">A few minutes of German a day is all it takes.</ThemedText>
      </View>

      {/* Daily goal stays visible without competing with the reading action. */}
      <View className="mt-6 px-4">
        <View className="mb-3">
          <WeeklyGoalCard
            dailyGoalMinutes={profile.dailyGoalMinutes}
            minutesByDate={dailyReadingMinutes}
            today={new Date(SESSION_NOW)}
          />
        </View>

        {feed.isPending ? (
          <LoadingCard />
        ) : feed.isError ? (
          <MessageCard title="Content could not be loaded" action="Try again" onPress={() => feed.refetch()} />
        ) : continueReading ? (
          <ContentCard
            content={continueReading}
            compact
            footer={
              <>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1"><ProgressBar value={currentProgress?.percent ?? 0} /></View>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {currentProgress ? `${Math.round(currentProgress.percent * 100)}%` : 'New'}
                  </ThemedText>
                </View>
                {currentProgress ? (
                  <Link
                    href={{ pathname: '/reader/[contentId]/[chapterId]', params: { contentId: currentProgress.contentId, chapterId: currentProgress.chapterId } }}
                    asChild>
                    <ActionButton label="Continue reading" />
                  </Link>
                ) : (
                  <Link href={{ pathname: '/content/[id]', params: { id: continueReading.id } }} asChild>
                    <ActionButton label="Start reading" />
                  </Link>
                )}
              </>
            }
          />
        ) : (
          <MessageCard title="You have not started a reading yet" action="Discover something" href="/discover" />
        )}
      </View>

      <View className="mt-8">
        <SectionHeader title="For your level" href="/discover" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 px-4 pb-2">
          {feed.data?.recommended.map((item) => <ContentCard key={item.id} content={item} />)}
        </ScrollView>
      </View>

      <View className="mt-8">
        <SectionHeader title="New on Bearlin" href="/discover" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 px-4 pb-2">
          {feed.data?.newReleases.map((item) => <ContentCard key={item.id} content={item} />)}
        </ScrollView>
      </View>
    </Screen>
  );
}

function SectionHeader({ title, href }: { title: string; href?: '/discover' | '/words' }) {
  return (
    <View className="mb-4 flex-row items-center justify-between px-4">
      <ThemedText type="section">{title}</ThemedText>
      {href && <Link href={href} asChild><Pressable hitSlop={8}><ThemedText type="linkPrimary" themeColor="primary">See all</ThemedText></Pressable></Link>}
    </View>
  );
}

function LoadingCard() {
  return <View accessibilityLabel="Loading content" className="h-[220px] rounded-card bg-element opacity-70 dark:bg-element-dark" />;
}

function MessageCard({ title, action, href, onPress }: { title: string; action: string; href?: '/discover'; onPress?: () => void }) {
  const button = <Pressable onPress={onPress}><ThemedText type="linkPrimary" themeColor="primary">{action}</ThemedText></Pressable>;
  return (
    <View className="items-start gap-3 rounded-card bg-element p-6 dark:bg-element-dark">
      <ThemedText type="bodyStrong">{title}</ThemedText>
      {href ? <Link href={href} asChild>{button}</Link> : button}
    </View>
  );
}
