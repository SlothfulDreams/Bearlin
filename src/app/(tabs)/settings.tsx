import ExpoSlider from '@expo/ui/community/slider';
import { clsx } from 'clsx';
import { Image } from 'expo-image';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { Children, isValidElement } from 'react';
import { Alert, Pressable, Switch, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { LevelBadge } from '@/components/ui/level-badge';
import { Screen } from '@/components/ui/screen';
import type { CefrLevel } from '@/data/schemas';
import { useTheme } from '@/hooks/use-theme';
import { useLearningStore } from '@/store/learning-store';

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5] as const;
const PROFILE_IMAGE_URL = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=85';

export default function SettingsScreen() {
  const theme = useTheme();
  const profile = useLearningStore((state) => state.profile);
  const preferences = useLearningStore((state) => state.preferences);
  const updateProfile = useLearningStore((state) => state.updateProfile);
  const updatePreferences = useLearningStore((state) => state.updatePreferences);
  const resetLearningData = useLearningStore((state) => state.resetLearningData);

  const confirmReset = () =>
    Alert.alert(
      'Reset learning data?',
      'Progress, words, and settings will return to their demo values.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetLearningData },
      ],
    );

  return (
    <Screen>
      <View className="gap-1 pb-2 pt-4">
        <ThemedText type="title">Settings</ThemedText>
        <ThemedText themeColor="textSecondary">Adapt Bearlin to the way you learn.</ThemedText>
      </View>

      <View className="items-center gap-2 pt-2">
        <View className="h-40 w-40 overflow-hidden rounded-chip border-2 border-line bg-element dark:border-line-dark dark:bg-element-dark">
          <Image
            accessibilityLabel="Profile photo of Aaron Mann"
            cachePolicy="memory-disk"
            contentFit="cover"
            contentPosition="center"
            source={{ uri: PROFILE_IMAGE_URL }}
            style={{ width: '100%', height: '100%' }}
            transition={180}
          />
        </View>
        <View className="w-full max-w-[280px] items-center gap-1">
          <TextInput
            accessibilityLabel="Display name"
            className="w-full px-4 py-1 text-center text-subtitle font-bold text-content dark:text-content-dark"
            value={profile.displayName}
            onChangeText={(displayName) => updateProfile({ displayName })}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
            maxLength={40}
            returnKeyType="done"
            selectTextOnFocus
          />
          <ThemedText className="text-center" type="caption" themeColor="textSecondary">
            Local demo profile · no sign-in required
          </ThemedText>
        </View>
      </View>

      {/* Learning: level + daily goal live together — both describe how you study. */}
      <SettingsSection title="Learning">
        <View>
          <SettingsRow label="Your level" />
          <View className="flex-row flex-wrap gap-2 pb-2">
            {CEFR_LEVELS.map((level) => {
              const selected = profile.level === level;
              return (
                <Pressable
                  key={level}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  hitSlop={4}
                  onPress={() => updateProfile({ level })}
                  className={clsx(
                    'rounded-chip border-2 p-1 active:opacity-80',
                    selected
                      ? 'border-primary bg-element-selected dark:border-primary-dark dark:bg-element-selected-dark'
                      : 'border-transparent bg-element dark:bg-element-dark',
                  )}>
                  <LevelBadge level={level} />
                </Pressable>
              );
            })}
          </View>
        </View>
        <View>
          <SettingsRow label="Minutes per day" detail={`${profile.dailyGoalMinutes} min`} />
          <ExpoSlider
            value={profile.dailyGoalMinutes}
            minimumValue={5}
            maximumValue={30}
            step={5}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.backgroundSelected}
            thumbTintColor={theme.primary}
            onValueChange={(dailyGoalMinutes) => updateProfile({ dailyGoalMinutes })}
            style={{ width: '100%', height: 36 }}
          />
          <View className="flex-row justify-between pb-1">
            <ThemedText type="caption" themeColor="textSecondary">5 min</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">30 min</ThemedText>
          </View>
        </View>
      </SettingsSection>

      {/* Reading: everything that shapes the reader experience in one card. */}
      <SettingsSection title="Reading">
        <View>
          <SettingsRow label="Reader font size" detail={`${preferences.fontSize} pt`} />
          <ExpoSlider
            value={preferences.fontSize}
            minimumValue={17}
            maximumValue={31}
            step={2}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.backgroundSelected}
            thumbTintColor={theme.primary}
            onValueChange={(fontSize) => updatePreferences({ fontSize })}
            style={{ width: '100%', height: 36 }}
          />
          <View className="flex-row justify-between pb-1">
            <ThemedText type="caption" themeColor="textSecondary">17 pt</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">31 pt</ThemedText>
          </View>
        </View>
        <SettingSwitch
          label="Always show translations"
          value={preferences.translationVisible}
          onValueChange={(translationVisible) => updatePreferences({ translationVisible })}
        />
        <SettingSwitch
          label="Highlight grammar"
          value={preferences.highlightGrammar}
          onValueChange={(highlightGrammar) => updatePreferences({ highlightGrammar })}
        />
        <SettingSwitch
          label="Highlight difficult words"
          value={preferences.showDifficult}
          onValueChange={(showDifficult) => updatePreferences({ showDifficult })}
        />
        <SettingSwitch
          label="Show pronunciation hints"
          value={preferences.showPronunciation}
          onValueChange={(showPronunciation) => updatePreferences({ showPronunciation })}
        />
        <View>
          <SettingsRow label="Listening speed" />
          <View className="flex-row gap-2 pb-2">
            {PLAYBACK_RATES.map((rate) => (
              <SegmentedOption
                key={rate}
                label={`${rate}×`}
                selected={preferences.playbackRate === rate}
                onPress={() => updatePreferences({ playbackRate: rate })}
              />
            ))}
          </View>
        </View>
      </SettingsSection>

      {/* App: app-wide concerns — theme plus support links. */}
      <SettingsSection title="App">
        <View>
          <SettingsRow label="Theme" />
          <View className="flex-row gap-2 pb-2">
            {(['system', 'light', 'dark'] as const).map((mode) => (
              <SegmentedOption
                key={mode}
                label={mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark'}
                selected={preferences.appTheme === mode}
                onPress={() => updatePreferences({ appTheme: mode })}
              />
            ))}
          </View>
        </View>
        <SettingsRow
          label="Privacy"
          accessory={<AppIcon icon={ChevronRight} size={18} themeColor="textSecondary" />}
          onPress={() => {}}
        />
        <SettingsRow
          label="Help & Feedback"
          accessory={<AppIcon icon={ChevronRight} size={18} themeColor="textSecondary" />}
          onPress={() => {}}
        />
      </SettingsSection>

      {/* Destructive action stands alone, iOS sign-out style. */}
      <View className="mt-8 rounded-card border border-line bg-surface px-4 py-1 dark:border-line-dark dark:bg-surface-dark">
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={confirmReset}
          className="min-h-12 items-center justify-center rounded-control active:bg-element dark:active:bg-element-dark">
          <ThemedText type="bodyStrong" themeColor="danger">Reset learning data</ThemedText>
        </Pressable>
      </View>

      <ThemedText className="mt-10 text-center" type="caption" themeColor="textSecondary">
        Bearlin 1.0 · Mock data mode
      </ThemedText>
    </Screen>
  );
}

function SettingsSection({
  title,
  children,
  contained = true,
  className,
}: React.PropsWithChildren<{ title: string; contained?: boolean; className?: string }>) {
  const rows = Children.toArray(children);
  return (
    <View className={clsx('mt-6 gap-2', className)}>
      <ThemedText className="px-1" type="label" themeColor="textSecondary">
        {title.toLocaleUpperCase('en-US')}
      </ThemedText>
      {contained ? (
        <View className="rounded-card border border-line bg-surface px-4 py-1 dark:border-line-dark dark:bg-surface-dark">
          {rows.map((row, index) => (
            <View
              key={isValidElement(row) ? row.key : String(row)}
              className={clsx('min-h-12 justify-center py-2', index > 0 && 'border-t border-line dark:border-line-dark')}>
              {row}
            </View>
          ))}
        </View>
      ) : (
        <View>{children}</View>
      )}
    </View>
  );
}

function SegmentedOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={clsx(
        'flex-1 items-center rounded-control py-2.5 active:opacity-85',
        selected
          ? 'bg-primary dark:bg-primary-dark'
          : 'bg-element active:bg-element-selected dark:bg-element-dark dark:active:bg-element-selected-dark',
      )}>
      <ThemedText type="smallBold" themeColor={selected ? 'onPrimary' : 'text'}>{label}</ThemedText>
    </Pressable>
  );
}

interface SettingsRowProps {
  label: string;
  detail?: string;
  accessory?: React.ReactNode;
  onPress?: () => void;
}

function SettingsRow({ label, detail, accessory, onPress }: SettingsRowProps) {
  const content = (
    <>
      <ThemedText className="flex-1">{label}</ThemedText>
      {detail ? <ThemedText type="smallBold">{detail}</ThemedText> : null}
      {accessory}
    </>
  );

  if (!onPress) {
    return <View className="min-h-11 flex-row items-center gap-3">{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      className="-mx-2 min-h-11 flex-row items-center gap-3 rounded-control px-2 active:bg-element dark:active:bg-element-dark">
      {content}
    </Pressable>
  );
}

function SettingSwitch({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View className="min-h-11 flex-row items-center gap-3">
      <ThemedText className="flex-1">{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.primary, false: theme.backgroundSelected }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={theme.backgroundSelected}
      />
    </View>
  );
}

