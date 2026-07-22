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

  it('authors complete lexical metadata and groups reflexive and split verbs', async () => {
    const keyChapter = await repository.getChapter('missing-key', 'key-1');
    const soundChapter = await repository.getChapter('city-sound', 'sound-1');
    const kneelSentence = keyChapter?.sentences.find((sentence) => sentence.id === 'key-1-s9');
    const perceiveSentence = soundChapter?.sentences.find((sentence) => sentence.id === 'sound-1-s2');
    const kneel = kneelSentence?.lexicalUnits.find((unit) => unit.lemma === 'sich hinknien');
    const perceive = perceiveSentence?.lexicalUnits.find((unit) => unit.lemma === 'wahrnehmen');
    const surfaces = (sentenceId: typeof kneelSentence, tokenIds: string[] = []) => sentenceId?.tokens
      .filter((token) => tokenIds.includes(token.id))
      .map((token) => token.surface);

    expect(surfaces(kneelSentence, kneel?.tokenIds)).toEqual(['kniet', 'sich', 'hin']);
    expect(surfaces(perceiveSentence, perceive?.tokenIds)).toEqual(['nehmen', 'wahr']);
    expect(perceive?.unitType).toBe('separable-verb');
    expect(mockDataset.chapters.every((chapter) => chapter.sentences.every((sentence) => (
      sentence.lexicalUnits.every((unit) => unit.contextualTranslation && unit.partOfSpeech)
    )))).toBe(true);
  });

  it('returns the linked reflexive and separable grammar explanations', async () => {
    const reflexive = await repository.getGrammarPoint('grammar-reflexive-verbs');
    const separable = await repository.getGrammarPoint('grammar-separable-verbs');

    expect(reflexive?.title).toBe('Reflexive verbs');
    expect(separable?.examples[0].german).toContain('steigen');
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
