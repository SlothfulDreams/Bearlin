# Bearlin

Bearlin is an Expo 57 German graded-reader prototype for English-speaking learners. The interface, explanations, and translations are English, while reading passages and target vocabulary remain German. It uses original Bearlin branding and original A1–C2 mock content.

## Included prototype flows

- Home dashboard with goal, streak, progress, recommendations, and recent words
- Discover search and filters for CEFR level, format, topic, and access tier
- Article, story, and course overviews with chapters, keywords, grammar, bookmarks, and mock downloads
- Paginated German reader with token lookup, translations, grammar highlights, reading preferences, and synchronized timing metadata
- Long-form reader narration and audiobook controls backed by `expo-audio`, with a timed fallback for mock tracks
- German word pronunciation backed by `expo-speech` across dictionary, saved-word, and review surfaces
- Contextual dictionary sheets with German gender, article, plural, forms, pronunciation, examples, and save actions
- Saved-word library and `ts-fsrs` review sessions with swipe grading
- Persisted profile, goals, settings, progress, saved words, downloads, and review schedules
- Onboarding, Bearlin Plus preview, dark mode, responsive web/tablet layouts, and reduced motion

Authentication, billing, production downloads, cloud sync, and external dictionary integrations are intentionally placeholders.

## Requirements

- [Bun](https://bun.sh/)
- A supported Expo development environment for iOS or Android

## Install and run

```bash
bun install
bun run start
```

Other targets:

```bash
bun run ios
bun run android
bun run web
```

Use Expo development builds when testing production background-audio behavior. On physical iOS devices, system text-to-speech is muted when the hardware silent switch is enabled.

## Validation

```bash
bun run check
bunx expo-doctor
```

Individual commands:

```bash
bun run typecheck
bun run lint
bun run test
```

Regenerate the original raster brand marks after changing the palette or geometry:

```bash
python3 scripts/generate-brand-assets.py
```

## Project layout

```text
src/
  app/                       Expo Router routes
  components/                Bearlin UI and dictionary components
  constants/                 Runtime colors for native APIs
  data/
    content-repository.ts    Database-neutral content contract
    learning-repository.ts   Database-neutral user-learning contract
    mock/                    Original validated fixtures + mock repository
    repositories.ts          Active repository composition root
    schemas.ts               Zod entities and boundary validation
  hooks/                     Query and audio adapters
  lib/                       FSRS, haptics, and query client
  store/                     Persisted local learning state
```

Application UI is styled with NativeWind utilities. See [`docs/nativewind.md`](docs/nativewind.md) for setup, dark-mode behavior, and the rule for choosing `className` versus runtime `style`.

## Replacing mock data with a database

Screens do not import fixture arrays. They use TanStack Query hooks, which call `ContentRepository` through `src/data/repositories.ts`.

To connect a backend:

1. Implement `ContentRepository` from `src/data/content-repository.ts` in a new adapter such as `src/data/api/api-content-repository.ts`.
2. Validate API/database payloads with the schemas in `src/data/schemas.ts` at the adapter boundary.
3. Replace the `MockContentRepository` construction in `src/data/repositories.ts` with the production implementation.
4. Keep entity IDs stable so persisted progress, bookmarks, saved words, and deep links continue to resolve.
5. Implement `LearningRepository` for authenticated/cloud state when cloud sync is introduced. Reconcile it with the local Zustand store rather than coupling screens directly to a database SDK.
6. Store audio files and timing cues behind stable URLs. `useNarrationPlayer` already accepts real `AudioTrack.source` values.

See [`docs/data-architecture.md`](docs/data-architecture.md) for field mapping and migration boundaries.

## Product and research notes

- [`docs/du-chinese-feature-matrix.md`](docs/du-chinese-feature-matrix.md)
- [`docs/brand-guidelines.md`](docs/brand-guidelines.md)
- [`docs/dependency-audit.md`](docs/dependency-audit.md)
- [`docs/data-architecture.md`](docs/data-architecture.md)
- [`docs/nativewind.md`](docs/nativewind.md)

## Content and asset policy

Do not copy Du Chinese trademarks, stories, recordings, illustrations, or interface assets. All production content and non-code assets must be original, public domain, or properly licensed, with attribution recorded when required.
