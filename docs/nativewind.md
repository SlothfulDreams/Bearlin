# NativeWind Styling

Bearlin uses stable NativeWind 4.2.6 with Tailwind CSS 3.4. NativeWind v5 is still prerelease and is intentionally not used.

## Installation

Dependencies are managed with Bun:

```bash
bun add nativewind@4.2.6 class-variance-authority clsx
bun add -d tailwindcss@^3.4.17
```

Expo SDK 57 already supplies compatible `react-native-reanimated` and `react-native-safe-area-context` versions. Do not downgrade them to versions shown in older setup examples.

## Configuration files

- `babel.config.js`: Expo preset with `jsxImportSource: "nativewind"` and the NativeWind Babel preset.
- `metro.config.js`: wraps Expo Metro with `withNativeWind` and points to `src/global.css`.
- `tailwind.config.js`: scans `src`, includes `nativewind/preset`, uses class-based dark mode, and defines Bearlin tokens.
- `nativewind-env.d.ts`: merges `className` into React Native component types.
- `src/global.css`: Tailwind directives plus web font variables.
- `app.json`: uses Metro as the web bundler.

The CSS entry is imported exactly once from `src/app/_layout.tsx`.

## Theme behavior

`NativeWindThemeSync` mirrors the persisted `system | light | dark` preference into NativeWind’s `setColorScheme`. Components should use semantic classes such as:

```tsx
<View className="bg-app dark:bg-app-dark" />
<ThemedText className="text-content-muted dark:text-content-muted-dark" />
```

`src/constants/theme.ts` remains only for APIs that need actual color strings, including Native Tabs, Expo Slider, BottomSheet, and navigation themes.

## `className` versus `style`

Use `className` for all static and state-based visual styling:

- layout, spacing, sizing, typography, borders, radii, and shadows
- light/dark colors
- pressed, disabled, responsive, and platform variants
- finite variants represented by static class maps or CVA

Use `style` only when the value is calculated at runtime or required by a non-interop API:

- reader page width and independent paper/sepia/night colors
- audio/token timing highlights and Reanimated transforms
- percentage progress width
- content-specific cover palettes from data
- FlashList content container values and Expo UI component props
- native navigation, slider, and bottom-sheet color values

Never construct Tailwind classes from arbitrary data. Use complete static strings in a lookup map so Tailwind can discover them.

## Shared variants

Use CVA for reusable component variants (`ActionButton`, `ThemedText`) and `clsx` for conditional class composition. Avoid reintroducing `StyleSheet.create` for application UI.

## Development

After changing Babel, Metro, Tailwind configuration, global CSS, or theme tokens, restart Metro with a cleared cache:

```bash
bunx expo start --clear
```

Run all automated checks with:

```bash
bun run check
bun run doctor
bunx expo-doctor
```
