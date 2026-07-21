import AsyncStorage from '@react-native-async-storage/async-storage';

import { localDateKey } from '@/lib/calendar';
import { useLearningStore } from './learning-store';

describe('persisted learning store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useLearningStore.getState().resetLearningData();
  });

  it('updates mock-functional progress, bookmarks, downloads, and themes', () => {
    const state = useLearningStore.getState();
    state.toggleBookmark('sunday-lake');
    state.toggleDownload('sunday-lake');
    state.updatePreferences({ appTheme: 'dark' });
    state.saveProgress({ contentId: 'sunday-lake', chapterId: 'lake-1', sentenceIndex: 1, percent: 1, completedAt: '2026-07-20T12:00:00.000Z' });

    const updated = useLearningStore.getState();
    expect(updated.bookmarks).toContain('sunday-lake');
    expect(updated.downloads['sunday-lake']).toBe('downloaded');
    expect(updated.preferences.appTheme).toBe('dark');
    expect(updated.progress['sunday-lake'].percent).toBe(1);
  });

  it('records reading minutes in the persisted calendar activity', () => {
    useLearningStore.getState().addReadingMinutes(2);
    const updated = useLearningStore.getState();

    expect(updated.minutesReadToday).toBe(9);
    expect(updated.dailyReadingMinutes[localDateKey(new Date())]).toBe(9);
  });

  it('hydrates through the AsyncStorage-backed persist adapter', async () => {
    await useLearningStore.persist.rehydrate();
    expect(useLearningStore.persist.hasHydrated()).toBe(true);
  });
});
