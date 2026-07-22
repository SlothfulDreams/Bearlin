import { mockDataset } from './mock-data';
import { MockContentRepository } from './mock-content-repository';

describe('MockContentRepository', () => {
  const repository = new MockContentRepository(mockDataset, { latencyMs: 0 });

  it('validates and exposes all CEFR levels', async () => {
    const result = await repository.searchContent({ sort: 'level' });
    expect([...new Set(result.items.map((item) => item.level))]).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('filters by level, type, access, and search query', async () => {
    const result = await repository.searchContent({ query: 'night', levels: ['B2'], types: ['story'], access: 'premium' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('last-tram');
  });

  it('includes the free twenty-minute C2 sample story', async () => {
    const result = await repository.searchContent({ levels: ['C2'], types: ['story'], access: 'free' });
    const story = result.items.find((item) => item.id === 'silent-atlas');
    const detail = await repository.getContent('silent-atlas');

    expect(story).toMatchObject({ level: 'C2', type: 'story', estimatedMinutes: 20, chapterCount: 3 });
    expect(detail?.chapters.map((chapter) => chapter.estimatedMinutes)).toEqual([7, 7, 6]);
  });

  it('returns linked chapter and linguistic resources', async () => {
    const detail = await repository.getContent('missing-key');
    const chapter = await repository.getChapter('missing-key', 'key-1');
    const words = await repository.getDictionaryEntries(detail?.keywordIds ?? []);
    const grammar = await repository.getGrammarPoints(detail?.grammarPointIds ?? []);

    expect(chapter?.sentences[0].tokens.length).toBeGreaterThan(0);
    expect(words.length).toBeGreaterThan(0);
    expect(grammar[0].level).toBe('A1');
  });
});
