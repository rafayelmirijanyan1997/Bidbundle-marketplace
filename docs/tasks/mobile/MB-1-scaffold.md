# MB-1 — Project Scaffold & Foundation

**Status:** Completed
**Depends on:** Nothing
**Estimated scope:** ~25 files created

---

## Goal

Bootstrap the `/neighbid-mobile/` Expo project from zero to a running app
that proves the full tech stack works: Expo Router navigates between screens,
NativeWind applies Tailwind classes, Fraunces and DM Sans fonts render, and
the theme color system is in place.

## Why This Task Comes Now

Every other mobile task depends on this foundation. MB-2 through MB-6 cannot
start until the project runs, fonts load, NativeWind is configured, and the
folder structure exists.

## What Codex Will Implement

### 1. Expo project init + dependencies

Run from the repo root (not inside neighbid-mobile):
```
npx create-expo-app neighbid-mobile --template blank-typescript
```

Then install:
```
npx expo install expo-router expo-font expo-status-bar expo-system-ui
npx expo install react-native-safe-area-context react-native-screens
npx expo install @react-native-async-storage/async-storage
npm install nativewind@^4.0.1 tailwindcss@^3.4.0
npm install @expo-google-fonts/fraunces @expo-google-fonts/dm-sans
```

### 2. Config files

**app.json**
```json
{
  "expo": {
    "name": "NeighBid",
    "slug": "neighbid",
    "scheme": "neighbid",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": { "backgroundColor": "#152033" },
    "android": { "adaptiveIcon": { "backgroundColor": "#152033" } },
    "plugins": ["expo-router"],
    "experiments": { "typedRoutes": true }
  }
}
```

**babel.config.js**
```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: ['nativewind/babel'],
  };
};
```

**metro.config.js**
```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

**tailwind.config.js**
```js
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas:   '#f7f4ef',
        surface:  '#152033',
        primary:  '#1d4ed8',
        accent:   '#d97706',
        card:     '#ffffff',
        divider:  '#e8e3d9',
        muted:    '#7c7268',
        fg:       '#1a1714',
        success:  '#0e7b56',
      },
      fontFamily: {
        display: ['Fraunces_700Bold_Italic'],
        'display-reg': ['Fraunces_400Regular'],
        sans:    ['DMSans_400Regular'],
        'sans-medium': ['DMSans_500Medium'],
        'sans-semibold': ['DMSans_600SemiBold'],
        'sans-bold': ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
};
```

**global.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**tsconfig.json**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### 3. Theme constants

**src/theme/colors.ts**
```ts
export const colors = {
  canvas:   '#f7f4ef',
  surface:  '#152033',
  primary:  '#1d4ed8',
  accent:   '#d97706',
  card:     '#ffffff',
  divider:  '#e8e3d9',
  muted:    '#7c7268',
  fg:       '#1a1714',
  success:  '#0e7b56',
  white:    '#ffffff',
} as const;
```

**src/theme/typography.ts**
```ts
export const typography = {
  display:  'Fraunces_700Bold_Italic',
  displayReg: 'Fraunces_400Regular',
  body:     'DMSans_400Regular',
  medium:   'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold:     'DMSans_700Bold',
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 14,
  md:   15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
} as const;
```

**src/theme/spacing.ts**
```ts
export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48,
} as const;
```

### 4. Font loading in root layout

**src/app/_layout.tsx**
- Load fonts with `useFonts` from `@expo-google-fonts/fraunces` and
  `@expo-google-fonts/dm-sans`
- Show `<SplashScreen>` until fonts are ready
- Wrap in `<SafeAreaProvider>` and `<GestureHandlerRootView>`
- Set background color to `#f7f4ef` (canvas)

Fonts to load:
- Fraunces_400Regular
- Fraunces_700Bold_Italic
- DMSans_400Regular
- DMSans_500Medium
- DMSans_600SemiBold
- DMSans_700Bold

### 5. Entry redirect

**src/app/index.tsx**
- Check AsyncStorage for saved role on mount
- If role exists → redirect to `/(homeowner)` / `/(provider)` / `/(admin)`
- If no role → redirect to `/(onboarding)/get-started`

### 6. Mock data + types (copy from web)

Copy these files verbatim from the web project (they are plain TypeScript,
no browser APIs):
- `src/data/mock/mockServiceRequests.ts`
- `src/data/mock/mockBids.ts`
- `src/data/mock/mockBiddingRoom.ts`
- `src/data/mock/mockBidHistory.ts`
- `src/data/mock/mockProviderDashboard.ts`
- `src/data/mock/mockProviderBidHistory.ts`
- `src/data/mock/mockProviderReviews.ts`
- `src/data/mock/mockAdminDashboard.ts`
- `src/types/index.ts`

### 7. AsyncStorage onboarding util

**src/utils/onboardingState.ts**
```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'homeowner' | 'provider' | 'admin';
const KEY = 'neighbid.role';

export async function saveRole(role: UserRole) {
  await AsyncStorage.setItem(KEY, role);
}

export async function getRole(): Promise<UserRole | null> {
  return (await AsyncStorage.getItem(KEY)) as UserRole | null;
}
```

### 8. Placeholder verification screen

**src/app/(onboarding)/get-started.tsx** — temporary placeholder that:
- Shows the NeighBid dark navy card
- Renders "NeighBid" in Fraunces italic
- Shows "DM Sans body text here" in DM Sans
- Shows a color swatch row (canvas / surface / primary / accent)
- Confirms fonts + NativeWind are both working

---

## Files Codex Creates (complete list)

```
neighbid-mobile/
  app.json
  package.json
  babel.config.js
  metro.config.js
  tailwind.config.js
  global.css
  tsconfig.json
  index.ts
  src/
    app/
      _layout.tsx
      index.tsx
      (onboarding)/
        _layout.tsx
        get-started.tsx      ← verification screen
    theme/
      colors.ts
      typography.ts
      spacing.ts
    utils/
      onboardingState.ts
    types/
      index.ts
    data/
      mock/
        mockServiceRequests.ts
        mockBids.ts
        mockBiddingRoom.ts
        mockBidHistory.ts
        mockProviderDashboard.ts
        mockProviderBidHistory.ts
        mockProviderReviews.ts
        mockAdminDashboard.ts
```

---

## Acceptance Criteria

1. `cd neighbid-mobile && npx expo start` runs without errors
2. App loads in Expo Go (physical device) or Android emulator
3. Verification screen shows Fraunces italic heading rendered correctly
4. DM Sans body text renders (not system fallback)
5. Dark navy surface card visible with correct color
6. `npx tsc --noEmit` passes in neighbid-mobile directory
7. NativeWind: a `className="text-primary"` styled text shows correct blue
8. No missing module errors in Metro bundler console

---

## Test Steps

1. Run `npx expo start` from `/neighbid-mobile/`
2. Open in Expo Go on Android device or press `a` for Android emulator
3. Verify font rendering on verification screen
4. Check Metro bundler terminal — no warnings about missing packages
5. Run `npx tsc --noEmit` — zero errors

---

## Out of Scope

- No real screens yet (only the verification placeholder)
- No navigation between roles
- No UI components (those are MB-2)
- No backend calls

---

## Codex Implementation Prompt

```
Create a new Expo React Native project at /neighbid-mobile/ alongside the
existing Next.js web app. Follow the MB-1 task spec exactly.

Tech stack:
- Expo SDK 51, managed workflow
- Expo Router v3 with typed routes
- NativeWind v4 with Tailwind CSS v3
- @expo-google-fonts/fraunces + @expo-google-fonts/dm-sans
- @react-native-async-storage/async-storage
- TypeScript with strict mode

Key requirements:
1. Create all config files (app.json, babel.config.js, metro.config.js,
   tailwind.config.js, global.css, tsconfig.json) exactly as specified
2. Set up theme constants in src/theme/ (colors, typography, spacing)
3. Root layout loads Fraunces_400Regular, Fraunces_700Bold_Italic,
   DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold
4. Root layout wraps in SafeAreaProvider and GestureHandlerRootView
5. src/app/index.tsx reads AsyncStorage role and redirects accordingly
6. Copy mock data files verbatim from ../src/data/mock/ and ../src/types/
7. Create AsyncStorage-based onboardingState.ts util
8. Create a verification screen at src/app/(onboarding)/get-started.tsx
   that renders a dark navy card with Fraunces italic heading and DM Sans body
9. All files must pass tsc --noEmit with zero errors

Do NOT install or use: react-navigation directly (use Expo Router),
react-native-paper, styled-components, or any other UI library.
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Approved and implemented by Codex. Status: Completed.
  - Codex created 29 files: all config, theme, mock data, root layout, index redirect, onboarding layout + verification screen.
  - Claude post-fixes applied: corrected colors.ts (wrong values generated), removed non-existent DMSans_600SemiBold (package only has 400/500/700), added react-native-gesture-handler to package.json, added nativewind-env.d.ts, fixed tsconfig include array, rewrote get-started.tsx to resolve TypeScript errors.
  - npm install completed. `tsc --noEmit` passes with zero errors.
  - Ready for MB-2.
