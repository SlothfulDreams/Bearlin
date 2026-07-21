import type {
  ContentFilters,
  ContentRepository,
  ContentSearchResult,
} from '@/data/content-repository';
import {
  chapterSchema,
  contentCollectionSchema,
  contentDetailSchema,
  contentSummarySchema,
  dictionaryEntrySchema,
  grammarPointSchema,
  type CefrLevel,
  type Chapter,
  type ContentCollection,
  type ContentDetail,
  type ContentSummary,
  type DictionaryEntry,
  type GrammarPoint,
  type HomeFeed,
} from '@/data/schemas';

export interface MockContentDataset {
  content: ContentSummary[];
  details: ContentDetail[];
  chapters: Chapter[];
  collections: ContentCollection[];
  dictionary: DictionaryEntry[];
  grammar: GrammarPoint[];
}

interface MockRepositoryOptions {
  latencyMs?: number;
}

const levelOrder: Record<CefrLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('de-DE');
}

export class MockContentRepository implements ContentRepository {
  private readonly dataset: MockContentDataset;
  private readonly latencyMs: number;

  constructor(dataset: MockContentDataset, options: MockRepositoryOptions = {}) {
    this.dataset = {
      content: dataset.content.map((item) => contentSummarySchema.parse(item)),
      details: dataset.details.map((item) => contentDetailSchema.parse(item)),
      chapters: dataset.chapters.map((item) => chapterSchema.parse(item)),
      collections: dataset.collections.map((item) => contentCollectionSchema.parse(item)),
      dictionary: dataset.dictionary.map((item) => dictionaryEntrySchema.parse(item)),
      grammar: dataset.grammar.map((item) => grammarPointSchema.parse(item)),
    };
    this.latencyMs = options.latencyMs ?? 180;
  }

  private async wait() {
    if (this.latencyMs <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }

  async getHomeFeed(level?: CefrLevel): Promise<HomeFeed> {
    await this.wait();
    const learnerLevel = level ?? 'A1';
    const distance = (item: ContentSummary) => Math.abs(levelOrder[item.level] - levelOrder[learnerLevel]);
    const recommended = [...this.dataset.content]
      .sort((a, b) => distance(a) - distance(b) || b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 6);

    return {
      featured: this.dataset.content.filter((item) => item.featured).slice(0, 6),
      recommended,
      newReleases: [...this.dataset.content]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 6),
      collections: this.dataset.collections,
    };
  }

  async searchContent(filters: ContentFilters = {}): Promise<ContentSearchResult> {
    await this.wait();
    const query = filters.query ? normalize(filters.query) : '';
    const levels = filters.levels?.length ? new Set(filters.levels) : null;
    const types = filters.types?.length ? new Set(filters.types) : null;
    const topics = filters.topics?.length ? new Set(filters.topics) : null;
    let items = this.dataset.content.filter((item) => {
      const searchable = normalize([item.title, item.subtitle, item.description, item.topic, ...item.tags].filter(Boolean).join(' '));
      return (
        (!query || searchable.includes(query)) &&
        (!levels || levels.has(item.level)) &&
        (!types || types.has(item.type)) &&
        (!topics || topics.has(item.topic)) &&
        (!filters.access || filters.access === 'all' || item.access === filters.access)
      );
    });

    switch (filters.sort) {
      case 'newest':
        items = items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
        break;
      case 'shortest':
        items = items.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
        break;
      case 'level':
        items = items.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
        break;
      case 'recommended':
      default:
        items = items.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return {
      items,
      total: items.length,
      availableTopics: [...new Set(this.dataset.content.map((item) => item.topic))].sort(),
    };
  }

  async getContent(idOrSlug: string) {
    await this.wait();
    return this.dataset.details.find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
  }

  async getChapter(contentId: string, chapterId: string) {
    await this.wait();
    return this.dataset.chapters.find((item) => item.contentId === contentId && item.id === chapterId) ?? null;
  }

  async getCollection(id: string) {
    await this.wait();
    return this.dataset.collections.find((item) => item.id === id) ?? null;
  }

  async getDictionaryEntry(id: string) {
    await this.wait();
    return this.dataset.dictionary.find((item) => item.id === id) ?? null;
  }

  async getDictionaryEntries(ids: string[]) {
    await this.wait();
    const wanted = new Set(ids);
    return this.dataset.dictionary.filter((item) => wanted.has(item.id));
  }

  async getGrammarPoint(id: string) {
    await this.wait();
    return this.dataset.grammar.find((item) => item.id === id) ?? null;
  }

  async getGrammarPoints(ids: string[]) {
    await this.wait();
    const wanted = new Set(ids);
    return this.dataset.grammar.filter((item) => wanted.has(item.id));
  }
}
