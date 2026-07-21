import { z } from 'zod';

const cefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const contentTypeSchema = z.enum(['article', 'story', 'course']);
const accessTierSchema = z.enum(['free', 'premium']);

const paletteSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  accent: z.string(),
});

export const contentSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  type: contentTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  level: cefrLevelSchema,
  topic: z.string(),
  tags: z.array(z.string()),
  coverImage: z.string().optional(),
  palette: paletteSchema,
  chapterCount: z.number().int().positive(),
  estimatedMinutes: z.number().int().positive(),
  publishedAt: z.string(),
  access: accessTierSchema,
  featured: z.boolean().default(false),
});

const chapterSummarySchema = z.object({
  id: z.string(),
  contentId: z.string(),
  number: z.number().int().positive(),
  title: z.string(),
  summary: z.string(),
  estimatedMinutes: z.number().int().positive(),
  access: accessTierSchema,
});

export const dictionaryEntrySchema = z.object({
  id: z.string(),
  lemma: z.string(),
  article: z.enum(['der', 'die', 'das']).optional(),
  gender: z.enum(['masculine', 'feminine', 'neuter']).optional(),
  plural: z.string().optional(),
  partOfSpeech: z.string(),
  pronunciation: z.string(),
  translations: z.array(z.string()).min(1),
  contextualMeaning: z.string(),
  forms: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  examples: z.array(z.object({ german: z.string(), translation: z.string() })).default([]),
  grammarTags: z.array(z.string()).default([]),
});

export const grammarPointSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: cefrLevelSchema,
  summary: z.string(),
  explanation: z.array(z.string()),
  pattern: z.string().optional(),
  examples: z.array(z.object({ german: z.string(), translation: z.string(), note: z.string().optional() })),
  commonMistakes: z.array(z.string()).default([]),
});

const tokenSchema = z.object({
  id: z.string(),
  surface: z.string(),
  dictionaryEntryId: z.string().optional(),
  grammarPointIds: z.array(z.string()).default([]),
  pronunciation: z.string().optional(),
  difficulty: cefrLevelSchema.optional(),
  audioStartMs: z.number().int().nonnegative().optional(),
  audioEndMs: z.number().int().positive().optional(),
  punctuation: z.boolean().default(false),
});

const sentenceSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  translation: z.string(),
  tokens: z.array(tokenSchema),
  audioStartMs: z.number().int().nonnegative().optional(),
  audioEndMs: z.number().int().positive().optional(),
});

const audioTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  speaker: z.string(),
  source: z.string().nullable(),
  durationMs: z.number().int().positive(),
  mock: z.boolean().default(true),
});

export const chapterSchema = chapterSummarySchema.extend({
  sentences: z.array(sentenceSchema),
  audio: audioTrackSchema.nullable(),
  keywordIds: z.array(z.string()),
  grammarPointIds: z.array(z.string()),
  peopleAndPlaceNames: z.array(z.object({ name: z.string(), note: z.string() })),
});

export const contentDetailSchema = contentSummarySchema.extend({
  longDescription: z.string(),
  chapters: z.array(chapterSummarySchema),
  keywordIds: z.array(z.string()),
  grammarPointIds: z.array(z.string()),
});

export const contentCollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  contentIds: z.array(z.string()),
});

export type CefrLevel = z.infer<typeof cefrLevelSchema>;
export type ContentType = z.infer<typeof contentTypeSchema>;
export type ContentSummary = z.infer<typeof contentSummarySchema>;
export type ChapterSummary = z.infer<typeof chapterSummarySchema>;
export type DictionaryEntry = z.infer<typeof dictionaryEntrySchema>;
export type GrammarPoint = z.infer<typeof grammarPointSchema>;
export type Token = z.infer<typeof tokenSchema>;
export type Sentence = z.infer<typeof sentenceSchema>;
export type AudioTrack = z.infer<typeof audioTrackSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type ContentDetail = z.infer<typeof contentDetailSchema>;
export type ContentCollection = z.infer<typeof contentCollectionSchema>;
export interface HomeFeed {
  featured: ContentSummary[];
  recommended: ContentSummary[];
  newReleases: ContentSummary[];
  collections: ContentCollection[];
}
