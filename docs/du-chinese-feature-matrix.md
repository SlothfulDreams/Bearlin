# Du Chinese Feature Matrix

Research sources:

- [Du Chinese product site](https://duchinese.net/)
- [Official usage guide](https://duchinese.net/blog/2021/04/14/welcome-to-du-chinese/)
- [Official reading-selection guide](https://duchinese.net/blog/2024/09/23/chinese-reading-practice-how-to-choose-a-reading-on-du-chinese/)
- [Apple App Store listing](https://apps.apple.com/us/app/du-chinese-read-mandarin-%E8%AF%BB%E4%B8%AD%E6%96%87/id1052961520)
- [Google Play listing](https://play.google.com/store/apps/details?id=org.sinamon.duchinese&hl=en_US)

This matrix captures publicly documented product behavior. Bearlin will adapt these patterns for German learning with original branding, assets, and content.

| Area | Du Chinese behavior | Bearlin German adaptation | Mock implementation target |
| --- | --- | --- | --- |
| Discovery | Discover tab with search, filters, recommendations, and frequently added readings | Browse German material by CEFR level, topic, format, and availability | Searchable/filterable local catalog with loading, empty, error, free, and premium states |
| Content formats | Standalone articles, collections, multi-chapter stories/series, and structured courses | German articles, story series, and progressive vocabulary/grammar courses | Original A1–C2 articles, stories, and courses linked through stable IDs |
| Grading | Newbie through Master, aligned approximately with HSK 1–6+ | CEFR A1, A2, B1, B2, C1, and C2 | Level badges, filters, recommendations, and user level preference |
| Overview | Cover, summary, level, bookmark, download, read status, Read & Listen, audiobook, names, keywords, and grammar | Same information, replacing names/HSK metadata with German linguistic resources | Functional overview actions, chapter progress, vocabulary preview, and grammar list |
| Reader | Paginated reading with swipe navigation and progress | Paginated German reader with chapter navigation | Persist page/chapter position and completion locally |
| Instant definitions | Tap/gesture on a word for context-sensitive meaning and dictionary details | Lemma, article, gender, plural, part of speech, verb forms, pronunciation, translation, and contextual meaning | Token-driven dictionary bottom sheet with save action |
| Readings/annotations | Optional pinyin, difficult-character readings, tone marks, and HSK underlines | Optional pronunciation/IPA, stress hints, difficult-word hints, separable-verb and case annotations | Per-user annotation toggles and level-aware word emphasis |
| Translation | Tap the translation box or configure translations to remain visible | Toggle English sentence translations individually or globally | Translation reveal state plus persistent preference |
| Grammar | Highlighted grammar points open explanations with structures, examples, and common mistakes | Highlight cases, word order, separable verbs, adjective endings, prepositions, and tense patterns | Grammar highlights and routed grammar detail sheets/screens |
| Synchronized audio | Native-speaker audio follows text karaoke-style; tapping a word can start playback there | German narration with sentence/token timing cues | Audio state connected to timing metadata and active-token highlighting |
| Reader audio controls | Play/pause, seek, page position, and playback speed around 0.5×–1.5× | Play/pause, scrub, skip, and adjustable speed | Expo Audio-backed controls with local or permitted mock sources |
| Audiobook | Background-capable continuous listening with previous/next item and playlist behavior | Continuous chapter/story playback | Playlist screen, chapter queue, progress, and lock-screen-ready architecture |
| Bookmarks | Save readings for quick access later | Personal German reading list | Persist bookmark IDs and expose saved sections |
| Downloads | Premium offline reading/audio downloads | Offline German lessons and audio | Persist mock download lifecycle/state; repository shape supports real files later |
| Read/completion state | Mark as read and count toward progress | Complete chapters/readings and update goals | Completion timestamps, progress bars, and continue-reading state |
| Progress | Reading history and progress tracking | Reading minutes, completed chapters, level progress, and vocabulary growth | Local progress summary, streak, daily goal, and history |
| Recommendations | Recommendations informed by history and learner level | Suggest German readings near the selected CEFR level and interests | Deterministic mock recommendation query over profile/history |
| Keywords/resources | Overview and in-reader access to keywords, names, grammar, and audiobook | Vocabulary, people/places, grammar, and audio resource hub | Expandable/routed resource lists based on repository entities |
| Saved words | Save an unfamiliar word from the reader into a word bank | Save German lexemes with the exact sentence/context encountered | Searchable saved-word list with source links and review status |
| Flashcards | SRS review of due words | FSRS scheduling for German vocabulary | `ts-fsrs` scheduling with persisted card state and due counts |
| Card reveal | Reveal reading/pronunciation, source sentence, translation, and dictionary definition | Reveal lemma metadata, translation, source context, forms, and examples | Multi-stage card reveal with audio affordance |
| Card grading | Forgot, Almost, and Got It; swipe or tap | Same three user-facing choices mapped onto FSRS ratings | Swipe/tap grading, haptics, schedule updates, and session statistics |
| Reader preferences | Light/dark/system theme, font size/family, translation visibility, grammar highlights, script/readings options | Theme, font size/family, translations, grammar highlights, pronunciation, and difficulty hints | Persisted preference store shared by reader and settings |
| Integrations | Pleco, Skritter, Hack Chinese, Hanping, and related dictionary/flashcard integrations | Future export/dictionary integrations appropriate for German | Non-functional labeled placeholders only; no unsupported claims |
| Monetization | Free readings plus premium catalog, downloads, and audiobook access | Free sample catalog with premium preview states | Mock paywall and locked states; no billing/backend implementation |
| Cross-platform | iOS, Android, and web | Expo Android, iOS, and responsive web | Shared routes/components with platform-native navigation and sheets |

## Core parity boundary

The first implementation will make the principal learning loops interactive with local mock data: discover → overview → read/listen → inspect/save a word → review it → see progress. Authentication, billing, cloud sync, production downloads, content authoring, and external integrations remain explicit placeholders until a backend and service providers are selected.
