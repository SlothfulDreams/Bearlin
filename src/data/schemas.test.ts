import { sentenceSchema, type LexicalUnit } from './schemas';

const unit = (id: string, tokenIds: string[]): LexicalUnit => ({
  id,
  tokenIds,
  lemma: id,
  contextualTranslation: id,
  partOfSpeech: 'Verb',
  pronunciation: '',
  unitType: tokenIds.length > 1 ? 'separable-verb' : 'word',
  grammarPointIds: [],
});

const sentence = {
  id: 'sentence-1',
  order: 0,
  translation: 'He gets up today.',
  tokens: [
    { id: 't1', surface: 'steht', punctuation: false },
    { id: 't2', surface: 'heute', punctuation: false },
    { id: 't3', surface: 'auf', punctuation: false },
    { id: 't4', surface: '.', punctuation: true },
  ],
  lexicalUnits: [unit('aufstehen', ['t1', 't3']), unit('heute', ['t2'])],
};

describe('sentence lexical-unit validation', () => {
  it('accepts a non-contiguous separable verb with complete token coverage', () => {
    expect(sentenceSchema.safeParse(sentence).success).toBe(true);
  });

  it('rejects missing and duplicate token membership', () => {
    const missing = { ...sentence, lexicalUnits: [unit('aufstehen', ['t1', 't3'])] };
    const duplicate = {
      ...sentence,
      lexicalUnits: [...sentence.lexicalUnits, unit('duplicate', ['t3'])],
    };

    expect(sentenceSchema.safeParse(missing).error?.issues.some((issue) => issue.message.includes('missing a lexical unit'))).toBe(true);
    expect(sentenceSchema.safeParse(duplicate).error?.issues.some((issue) => issue.message.includes('more than one lexical unit'))).toBe(true);
  });

  it('rejects unknown and punctuation token references', () => {
    const invalid = {
      ...sentence,
      lexicalUnits: [unit('aufstehen', ['t1', 't3']), unit('heute', ['t2']), unit('invalid', ['missing', 't4'])],
    };
    const result = sentenceSchema.safeParse(invalid);

    expect(result.error?.issues.some((issue) => issue.message.includes('unknown token'))).toBe(true);
    expect(result.error?.issues.some((issue) => issue.message.includes('Punctuation token'))).toBe(true);
  });
});
