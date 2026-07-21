# Bearlin Data Architecture

## Boundary rule

Route components consume query hooks and learning-store actions. They do not import fixture arrays or know whether data comes from TypeScript fixtures, HTTP, SQLite, Supabase, or another database.

```text
Screen → TanStack Query hook → ContentRepository → active adapter
Screen → Zustand action      → local persistence / future sync adapter
```

The composition root is `src/data/repositories.ts`.

## Content entities

| Entity | Production responsibility |
| --- | --- |
| `ContentSummary` | Search/catalog projection for an article, story, or course |
| `ContentDetail` | Overview data plus chapter/resource references |
| `Chapter` | Ordered sentences, keyword IDs, grammar IDs, names, and audio metadata |
| `Sentence` | Translation and ordered token/timing data |
| `Token` | Display surface plus dictionary/grammar references and audio cue boundaries |
| `DictionaryEntry` | German lemma, morphology, pronunciation, meanings, forms, examples, and tags |
| `GrammarPoint` | CEFR-aligned explanation, pattern, examples, and mistakes |
| `AudioTrack` | Stable media source, duration, speaker, and mock/production marker |
| `ContentCollection` | Curated ordered list of catalog IDs |

All network/database adapters should validate their returned projections with Zod schemas from `src/data/schemas.ts`.

## Learning entities

The local prototype persists:

- profile, CEFR level, interests, and daily goal
- reader and audio preferences
- bookmarks and mock download state
- latest reader position and content completion
- saved dictionary-entry IDs
- FSRS card state and review count
- daily reading minutes and streak

A future cloud model should introduce a repository contract when its backend requirements are known. Persist timestamps as ISO 8601 UTC strings at boundaries. Convert FSRS `due` and `last_review` values to `Date` only inside the scheduling adapter.

## Recommended backend mapping

A normalized relational implementation could use:

- `contents`
- `chapters`
- `sentences`
- `tokens`
- `dictionary_entries`
- `grammar_points`
- `chapter_keywords`
- `chapter_grammar_points`
- `audio_tracks`
- `audio_cues`
- `collections` and `collection_items`
- `profiles`
- `reading_progress`
- `bookmarks`
- `downloads` (metadata only)
- `saved_words`
- `flashcards`
- `review_events`

A document backend can denormalize chapters and sentences, but should retain stable IDs for token dictionary links and user progress.

## Adapter migration checklist

1. Add the selected database/client package with Bun only after the backend is chosen.
2. Keep secrets and privileged database access outside the client application.
3. Implement pagination in `searchContent`; do not fetch the whole production catalog.
4. Preserve the current loading, empty, and error shapes exposed to TanStack Query.
5. Add cache invalidation for content releases and user mutations.
6. Reconcile offline writes with server timestamps and idempotency keys.
7. Move premium authorization to the server; UI locks are not access control.
8. Use signed or public media URLs compatible with Expo Audio and web CORS.
9. Add migration tests proving the production adapter satisfies the same repository contract as the mock adapter.
10. Remove fixture seeding from production builds only after backend fallback/error behavior is ready.

## Current mock limitations

- Audio metadata is synchronized, but fixture tracks have `source: null`; the player intentionally shows a demo timeline.
- Downloads persist UI state but do not copy files.
- Billing, authentication, cloud sync, and external integrations do not make network calls.
- Recommendations are deterministic level-distance sorting, not a recommendation service.
