import type {
  CefrLevel,
  Chapter,
  ContentCollection,
  ContentDetail,
  ContentSummary,
  ContentType,
  DictionaryEntry,
  GrammarPoint,
  HomeFeed,
} from '@/data/schemas';

type ContentSort = 'recommended' | 'newest' | 'shortest' | 'level';

export interface ContentFilters {
  query?: string;
  levels?: CefrLevel[];
  types?: ContentType[];
  topics?: string[];
  access?: 'all' | 'free' | 'premium';
  sort?: ContentSort;
}

export interface ContentSearchResult {
  items: ContentSummary[];
  total: number;
  availableTopics: string[];
}

export interface ContentRepository {
  getHomeFeed(level?: CefrLevel): Promise<HomeFeed>;
  searchContent(filters?: ContentFilters): Promise<ContentSearchResult>;
  getContent(idOrSlug: string): Promise<ContentDetail | null>;
  getChapter(contentId: string, chapterId: string): Promise<Chapter | null>;
  getCollection(id: string): Promise<ContentCollection | null>;
  getDictionaryEntry(id: string): Promise<DictionaryEntry | null>;
  getDictionaryEntries(ids: string[]): Promise<DictionaryEntry[]>;
  getGrammarPoint(id: string): Promise<GrammarPoint | null>;
  getGrammarPoints(ids: string[]): Promise<GrammarPoint[]>;
}
