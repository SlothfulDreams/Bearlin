import { act, renderHook } from '@testing-library/react-native';

import { useWordPronunciation } from './use-word-pronunciation';

type MockSpeechOptions = { onStart?: () => void; onDone?: () => void; [key: string]: unknown };

const mockStop = jest.fn(() => Promise.resolve());
const mockSpeak = jest.fn((_text: string, options?: MockSpeechOptions) => options?.onStart?.());

jest.mock('expo-speech', () => ({
  maxSpeechInputLength: 4_000,
  speak: (text: string, options: MockSpeechOptions) => mockSpeak(text, options),
  stop: () => mockStop(),
}));

describe('useWordPronunciation', () => {
  beforeEach(() => {
    mockSpeak.mockClear();
    mockStop.mockClear();
  });

  it('interrupts queued speech and uses a German voice configuration', async () => {
    const hook = await renderHook(() => useWordPronunciation('  Schlüssel  '));

    await act(async () => hook.result.current.speak());

    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith(
      'Schlüssel',
      expect.objectContaining({ language: 'de-DE', pitch: 1, rate: 0.82 }),
    );
    expect(hook.result.current.isSpeaking).toBe(true);

    const options = mockSpeak.mock.calls[0]?.[1] as unknown as { onDone: () => void };
    await act(async () => options.onDone());
    expect(hook.result.current.status).toBe('idle');

    await hook.unmount();
  });
});
