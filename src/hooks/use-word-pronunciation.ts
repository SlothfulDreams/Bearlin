import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';

export type PronunciationStatus = 'idle' | 'loading' | 'speaking' | 'error';

const GERMAN_LANGUAGE = 'de-DE';
const WORD_RATE = 0.82;

/**
 * Short-form German text-to-speech for dictionary words.
 * Long-form story narration intentionally remains in useNarrationPlayer/expo-audio.
 */
export function useWordPronunciation(text: string) {
  const [status, setStatus] = useState<PronunciationStatus>('idle');
  const requestId = useRef(0);

  useEffect(() => () => {
    requestId.current += 1;
  }, []);

  const speak = async () => {
    const normalized = text.trim();
    if (!normalized) return;

    const currentRequest = ++requestId.current;
    setStatus('loading');

    try {
      // expo-speech queues calls by default. Words should respond immediately instead.
      await Speech.stop();
      if (requestId.current !== currentRequest) return;

      Speech.speak(normalized.slice(0, Speech.maxSpeechInputLength), {
        language: GERMAN_LANGUAGE,
        pitch: 1,
        rate: WORD_RATE,
        useApplicationAudioSession: false,
        onStart: () => {
          if (requestId.current === currentRequest) setStatus('speaking');
        },
        onDone: () => {
          if (requestId.current === currentRequest) setStatus('idle');
        },
        onStopped: () => {
          if (requestId.current === currentRequest) setStatus('idle');
        },
        onError: () => {
          if (requestId.current === currentRequest) setStatus('error');
        },
      });
    } catch {
      if (requestId.current === currentRequest) setStatus('error');
    }
  };

  const stop = async () => {
    requestId.current += 1;
    await Speech.stop();
    setStatus('idle');
  };

  return {
    speak,
    stop,
    status,
    isSpeaking: status === 'speaking',
  };
}
