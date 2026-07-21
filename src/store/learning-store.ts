import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Card } from 'ts-fsrs';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CefrLevel } from '@/data/schemas';
import { localDateKey } from '@/lib/calendar';
import { createReviewCard, scheduleReview, type ReviewGrade } from '@/lib/fsrs';

interface ReviewRecord {
  entryId: string;
  card: Card;
  lastGrade?: ReviewGrade;
}

interface ReaderPreferencesState {
  appTheme: 'system' | 'light' | 'dark';
  fontSize: number;
  readerTheme: 'paper' | 'sepia' | 'night';
  translationVisible: boolean;
  showPronunciation: boolean;
  highlightGrammar: boolean;
  showDifficult: boolean;
  playbackRate: number;
}

interface StoredProgress {
  contentId: string;
  chapterId: string;
  sentenceIndex: number;
  percent: number;
  updatedAt: string;
  completedAt: string | null;
}

interface LearningState {
  hydrated: boolean;
  onboardingComplete: boolean;
  profile: {
    displayName: string;
    level: CefrLevel;
    dailyGoalMinutes: number;
    interests: string[];
    premium: boolean;
  };
  preferences: ReaderPreferencesState;
  savedEntryIds: string[];
  reviews: Record<string, ReviewRecord>;
  reviewCount: number;
  bookmarks: string[];
  downloads: Record<string, 'downloaded'>;
  progress: Record<string, StoredProgress>;
  completedContentIds: string[];
  minutesReadToday: number;
  dailyReadingMinutes: Record<string, number>;
  streakDays: number;
  setHydrated: (value: boolean) => void;
  completeOnboarding: (level: CefrLevel, goal: number, interests: string[]) => void;
  updateProfile: (patch: Partial<LearningState['profile']>) => void;
  updatePreferences: (patch: Partial<ReaderPreferencesState>) => void;
  toggleSavedEntry: (entryId: string) => void;
  gradeEntry: (entryId: string, grade: ReviewGrade, now?: Date) => void;
  toggleBookmark: (contentId: string) => void;
  toggleDownload: (contentId: string) => void;
  saveProgress: (progress: Omit<StoredProgress, 'updatedAt'>) => void;
  markContentRead: (contentId: string, read: boolean) => void;
  addReadingMinutes: (minutes: number) => void;
  resetLearningData: () => void;
}

const seedEntries = ['word-schluessel', 'word-suchen', 'word-verschwinden', 'word-see', 'word-koennten', 'word-strassenbahn', 'word-geraeusch', 'word-erinnerung'];
const createSeedReviews = () => Object.fromEntries(seedEntries.map((entryId) => [entryId, { entryId, card: createReviewCard() }]));
const createSeedDailyActivity = (today = new Date()) => Object.fromEntries(
  [3, 2, 1, 0].map((daysAgo) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return [localDateKey(date), daysAgo === 0 ? 7 : 10];
  }),
);

const initialData = {
  onboardingComplete: false,
  profile: { displayName: 'Aaron Mann', level: 'A1' as CefrLevel, dailyGoalMinutes: 10, interests: ['Everyday life', 'Travel'], premium: false },
  preferences: {
    appTheme: 'system' as const,
    fontSize: 19,
    readerTheme: 'paper' as const,
    translationVisible: false,
    showPronunciation: false,
    highlightGrammar: true,
    showDifficult: true,
    playbackRate: 1,
  },
  savedEntryIds: seedEntries,
  reviews: createSeedReviews(),
  reviewCount: 0,
  bookmarks: ['missing-key'],
  downloads: {} as Record<string, 'downloaded'>,
  progress: {
    'missing-key': { contentId: 'missing-key', chapterId: 'key-1', sentenceIndex: 0, percent: 0.35, updatedAt: new Date().toISOString(), completedAt: null },
  },
  completedContentIds: [] as string[],
  minutesReadToday: 7,
  dailyReadingMinutes: createSeedDailyActivity(),
  streakDays: 4,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      hydrated: false,
      ...initialData,
      setHydrated: (hydrated) => set({ hydrated }),
      completeOnboarding: (level, dailyGoalMinutes, interests) => set((state) => ({ onboardingComplete: true, profile: { ...state.profile, level, dailyGoalMinutes, interests } })),
      updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      updatePreferences: (patch) => set((state) => ({ preferences: { ...state.preferences, ...patch } })),
      toggleSavedEntry: (entryId) => set((state) => {
        const saved = state.savedEntryIds.includes(entryId);
        if (saved) {
          const reviews = { ...state.reviews };
          delete reviews[entryId];
          return { savedEntryIds: state.savedEntryIds.filter((id) => id !== entryId), reviews };
        }
        return { savedEntryIds: [...state.savedEntryIds, entryId], reviews: { ...state.reviews, [entryId]: { entryId, card: createReviewCard() } } };
      }),
      gradeEntry: (entryId, grade, now = new Date()) => set((state) => {
        const record = state.reviews[entryId] ?? { entryId, card: createReviewCard(now) };
        const result = scheduleReview(record.card, grade, now);
        return { reviews: { ...state.reviews, [entryId]: { entryId, card: result.card, lastGrade: grade } }, reviewCount: state.reviewCount + 1 };
      }),
      toggleBookmark: (contentId) => set((state) => ({ bookmarks: state.bookmarks.includes(contentId) ? state.bookmarks.filter((id) => id !== contentId) : [...state.bookmarks, contentId] })),
      toggleDownload: (contentId) => set((state) => {
        const downloads = { ...state.downloads };
        if (downloads[contentId]) delete downloads[contentId];
        else downloads[contentId] = 'downloaded';
        return { downloads };
      }),
      saveProgress: (progress) => set((state) => ({
        progress: { ...state.progress, [progress.contentId]: { ...progress, updatedAt: new Date().toISOString() } },
      })),
      markContentRead: (contentId, read) => set((state) => ({
        completedContentIds: read ? [...new Set([...state.completedContentIds, contentId])] : state.completedContentIds.filter((id) => id !== contentId),
      })),
      addReadingMinutes: (minutes) => set((state) => {
        const addedMinutes = Math.max(0, minutes);
        const today = localDateKey(new Date());
        return {
          minutesReadToday: state.minutesReadToday + addedMinutes,
          dailyReadingMinutes: {
            ...state.dailyReadingMinutes,
            [today]: (state.dailyReadingMinutes[today] ?? state.minutesReadToday) + addedMinutes,
          },
        };
      }),
      resetLearningData: () => set({ ...initialData, reviews: createSeedReviews(), dailyReadingMinutes: createSeedDailyActivity(), onboardingComplete: true }),
    }),
    {
      name: 'bearlin-learning-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => {
          if ((key === 'due' || key === 'last_review') && typeof value === 'string') return new Date(value);
          return value;
        },
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
