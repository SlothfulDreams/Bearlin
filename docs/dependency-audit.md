# Dependency Audit

Audited against Expo SDK 57 documentation and the installed dependency tree.

## Reuse without adding packages

| Capability | Existing dependency | Decision |
| --- | --- | --- |
| File-based routing and deep links | `expo-router` | Use route groups and dynamic routes; do not add another navigator |
| Native bottom tabs | `expo-router/unstable-native-tabs` | Keep native tabs on mobile and Expo Router UI tabs on web |
| Dictionary/filter sheets | `@expo/ui/community/bottom-sheet` | Use Expo SDK 57’s cross-platform BottomSheet; do not add `@gorhom/bottom-sheet` |
| Images and cache-aware covers | `expo-image` | Use for covers and illustrations |
| Icons | `lucide-react-native` with `react-native-svg` | Use `AppIcon`; native-tab PNGs are generated from Lucide source because Apple native tabs cannot mount SVG React components |
| Reader/card animation | `react-native-reanimated` | Use for progress/highlight/card motion |
| Swipe and gesture input | `react-native-gesture-handler` | Use for flashcard gestures |
| Safe areas | `react-native-safe-area-context` | Use on all full-screen readers/players |
| Native screen primitives | `react-native-screens` | Reuse through Expo Router |
| Themes | NativeWind plus existing JavaScript theme helpers | Use NativeWind for component styling; retain JavaScript colors only for APIs that require values |
| Web | `react-native-web` | Keep shared layouts responsive |

## Add only where the platform does not already provide the feature

- `expo-audio`: narration, playlists, seek, speed, and playback status.
- `expo-haptics`: tactile confirmation for save/review actions.
- `@react-native-async-storage/async-storage`: Expo-compatible local persistence.
- `@shopify/flash-list`: recycled large catalog and vocabulary lists.
- `@tanstack/react-query`: asynchronous repository access, cache, and backend-ready loading/error states.
- `zustand`: focused local learning/session state with persistence.
- `zod`: repository payload and mock fixture validation.
- `ts-fsrs`: established spaced-repetition scheduling instead of a custom scheduler.
- `nativewind@4.2.6`: current stable NativeWind release matching the linked v4 setup documentation.
- `tailwindcss@^3.4`: NativeWind v4-compatible compiler; NativeWind v5/Tailwind 4 remain excluded while v5 is prerelease.
- `class-variance-authority` and `clsx`: established class composition for shared component variants and conditional utilities.

NativeWind v4.2.6 includes the React Native 0.81+/Reanimated 4 compatibility fixes needed by Expo SDK 57. Existing `react-native-reanimated@4.5.0` and `react-native-safe-area-context@5.7.0` remain Expo-managed and must not be downgraded to versions shown in older NativeWind examples.

## Deliberately not adding

- A second navigation package, UI kit, styling framework, image package, icon package, gesture package, or bottom-sheet library.
- SQLite or a database client before the production backend is selected.
- A billing, authentication, analytics, or download SDK while those flows are mock placeholders.
- A second state/query library that duplicates the responsibilities above.
