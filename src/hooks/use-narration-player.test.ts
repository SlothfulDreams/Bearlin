import { act, renderHook } from '@testing-library/react-native';

import type { AudioTrack } from '@/data/schemas';
import { useNarrationPlayer } from './use-narration-player';

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(), pause: jest.fn(), seekTo: jest.fn(), setPlaybackRate: jest.fn(), setActiveForLockScreen: jest.fn(),
  })),
  useAudioPlayerStatus: jest.fn(() => ({ playing: false, currentTime: 0, duration: 0, playbackRate: 1, isBuffering: false, didJustFinish: false })),
}));

const mockTrack: AudioTrack = {
  id: 'audio-test', title: 'Testkapitel', speaker: 'Demo', source: null, durationMs: 2_000, mock: true,
};

describe('useNarrationPlayer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('supports play, pause, seek, and speed for mock tracks', async () => {
    const hook = await renderHook(() => useNarrationPlayer(mockTrack));
    await act(async () => hook.result.current.play());
    await act(async () => jest.advanceTimersByTime(300));
    expect(hook.result.current.playing).toBe(true);
    expect(hook.result.current.positionMs).toBeGreaterThan(0);

    await act(async () => hook.result.current.seekToMs(1_000));
    await act(async () => hook.result.current.setRate(1.5));
    expect(hook.result.current.positionMs).toBe(1_000);
    expect(hook.result.current.rate).toBe(1.5);

    await act(async () => hook.result.current.pause());
    expect(hook.result.current.playing).toBe(false);
    await hook.unmount();
  });
});
