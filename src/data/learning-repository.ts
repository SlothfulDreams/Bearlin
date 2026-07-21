import type {
  Bookmark,
  Download,
  Flashcard,
  ReadingProgress,
  ReviewEvent,
  SavedWord,
  UserProfile,
} from '@/data/schemas';
import type { ReviewGrade } from '@/lib/fsrs';

export interface LearningRepository {
  getProfile(): Promise<UserProfile>;
  updateProfile(patch: Partial<UserProfile>): Promise<UserProfile>;

  listBookmarks(): Promise<Bookmark[]>;
  setBookmarked(contentId: string, bookmarked: boolean): Promise<void>;

  listDownloads(): Promise<Download[]>;
  setDownload(contentId: string, download: Download): Promise<void>;

  listProgress(): Promise<ReadingProgress[]>;
  saveProgress(progress: ReadingProgress): Promise<void>;

  listSavedWords(): Promise<SavedWord[]>;
  saveWord(word: SavedWord): Promise<void>;
  removeSavedWord(id: string): Promise<void>;

  listFlashcards(): Promise<Flashcard[]>;
  listDueFlashcards(now?: Date): Promise<Flashcard[]>;
  gradeFlashcard(id: string, grade: ReviewGrade, now?: Date): Promise<ReviewEvent>;
  listReviewEvents(): Promise<ReviewEvent[]>;
}
