import { clsx } from 'clsx';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import Square from 'lucide-react-native/icons/square';
import Volume2 from 'lucide-react-native/icons/volume-2';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { useWordPronunciation } from '@/hooks/use-word-pronunciation';

type PronunciationButtonProps = {
  text: string;
  pronunciation?: string;
  showPronunciation?: boolean;
  compact?: boolean;
  className?: string;
};

/** Shared German word-pronunciation control backed by expo-speech. */
export function PronunciationButton({
  text,
  pronunciation,
  showPronunciation = false,
  compact = false,
  className,
}: PronunciationButtonProps) {
  const { speak, status, isSpeaking } = useWordPronunciation(text);
  const failed = status === 'error';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${failed ? 'Retry' : 'Play'} German pronunciation for ${text}`}
      accessibilityHint="Uses the device German text-to-speech voice"
      accessibilityState={{ busy: status === 'loading' || isSpeaking }}
      onPress={(event) => {
        event.stopPropagation();
        void speak();
      }}
      className={clsx(
        'items-center justify-center rounded-chip bg-element active:opacity-70 dark:bg-element-dark',
        showPronunciation ? 'min-h-11 flex-row gap-2 px-4' : compact ? 'h-10 w-10' : 'h-12 w-12',
        className,
      )}>
      <AppIcon
        icon={failed ? CircleAlert : isSpeaking ? Square : Volume2}
        size={showPronunciation ? 18 : 20}
        themeColor={failed ? 'danger' : 'primary'}
      />
      {showPronunciation && pronunciation ? (
        <ThemedText type="small" themeColor="textSecondary">{pronunciation}</ThemedText>
      ) : null}
    </Pressable>
  );
}
