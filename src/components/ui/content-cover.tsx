import { clsx } from 'clsx';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ContentSummary } from '@/data/schemas';

type CoverContent = Pick<ContentSummary, 'title' | 'coverImage' | 'palette'>;

type ContentCoverProps = {
  content: CoverContent;
  className?: string;
};

/** Shared remote cover renderer for cards, details, and audio mode. */
export function ContentCover({ content, className }: ContentCoverProps) {
  return (
    <View
      className={clsx('items-center justify-center overflow-hidden', className)}
      style={{ backgroundColor: content.palette.background }}>
      {content.coverImage ? (
        <Image
          accessibilityLabel={`Cover image for ${content.title}`}
          cachePolicy="memory-disk"
          contentFit="cover"
          contentPosition="center"
          source={{ uri: content.coverImage }}
          style={{ width: '100%', height: '100%' }}
          transition={180}
        />
      ) : (
        <>
          <ThemedText
            className="text-[54px] font-black leading-[62px] opacity-[0.88]"
            style={{ color: content.palette.foreground }}>
            {content.title.slice(0, 1)}
          </ThemedText>
          <View
            className="absolute bottom-[18px] h-[9px] w-[70%] rounded-chip"
            style={{ backgroundColor: content.palette.accent }}
          />
        </>
      )}
    </View>
  );
}
