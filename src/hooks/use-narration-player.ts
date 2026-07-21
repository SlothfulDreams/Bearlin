import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import type { AudioTrack } from '@/data/schemas';

interface MockPlaybackState {
  trackId?: string;
  playing: boolean;
  positionMs: number;
  rate: number;
}

export function useNarrationPlayer(
  track?: AudioTrack | null,
  advanceIndex?: Dispatch<SetStateAction<number>>,
  maximumIndex = 0,
  initialRate = 1,
) {
  const source = track?.source ?? null;
  const player = useAudioPlayer(source, { updateInterval: 100, downloadFirst: false });
  const status = useAudioPlayerStatus(player);
  const [mock, setMock] = useState<MockPlaybackState>({ trackId: track?.id, playing: false, positionMs: 0, rate: initialRate });
  const isMock = !source;
  const currentMock = mock.trackId === track?.id
    ? mock
    : { trackId: track?.id, playing: false, positionMs: 0, rate: mock.rate };

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isMock) player.setPlaybackRate(initialRate, 'medium');
  }, [initialRate, isMock, player]);

  useEffect(() => {
    if (!isMock || !currentMock.playing) return;
    const timer = setInterval(() => {
      const duration = track?.durationMs ?? 0;
      const willEnd = Boolean(duration && currentMock.positionMs + 100 * currentMock.rate >= duration);
      setMock((state) => {
        const normalized = state.trackId === track?.id ? state : { trackId: track?.id, playing: false, positionMs: 0, rate: state.rate };
        const next = normalized.positionMs + 100 * normalized.rate;
        return duration && next >= duration
          ? { ...normalized, playing: false, positionMs: duration }
          : { ...normalized, positionMs: next };
      });
      if (willEnd) advanceIndex?.((index) => Math.min(index + 1, maximumIndex));
    }, 100);
    return () => clearInterval(timer);
  }, [advanceIndex, currentMock.playing, currentMock.positionMs, currentMock.rate, isMock, maximumIndex, track?.durationMs, track?.id]);

  useEffect(() => {
    if (!isMock && status.didJustFinish) advanceIndex?.((index) => Math.min(index + 1, maximumIndex));
  }, [advanceIndex, isMock, maximumIndex, status.didJustFinish]);

  const play = () => {
    if (isMock) {
      setMock((state) => {
        const normalized = state.trackId === track?.id ? state : { trackId: track?.id, playing: false, positionMs: 0, rate: state.rate };
        return { ...normalized, positionMs: normalized.positionMs >= (track?.durationMs ?? Infinity) ? 0 : normalized.positionMs, playing: true };
      });
      return;
    }
    player.setActiveForLockScreen(true, { title: track?.title ?? 'Bearlin', artist: track?.speaker ?? 'Bearlin' });
    player.play();
  };

  const pause = () => {
    if (isMock) setMock((state) => ({ ...(state.trackId === track?.id ? state : currentMock), playing: false }));
    else player.pause();
  };

  const seekToMs = (positionMs: number) => {
    const clamped = Math.max(0, Math.min(positionMs, track?.durationMs ?? positionMs));
    if (isMock) setMock((state) => ({ ...(state.trackId === track?.id ? state : currentMock), positionMs: clamped }));
    else player.seekTo(clamped / 1000);
  };

  const setRate = (rate: number) => {
    if (isMock) setMock((state) => ({ ...(state.trackId === track?.id ? state : currentMock), rate }));
    else player.setPlaybackRate(rate, 'medium');
  };

  return {
    isMock,
    playing: isMock ? currentMock.playing : status.playing,
    positionMs: isMock ? currentMock.positionMs : status.currentTime * 1000,
    durationMs: isMock ? (track?.durationMs ?? 0) : status.duration * 1000,
    rate: isMock ? currentMock.rate : status.playbackRate,
    buffering: isMock ? false : status.isBuffering,
    play,
    pause,
    seekToMs,
    setRate,
  };
}
