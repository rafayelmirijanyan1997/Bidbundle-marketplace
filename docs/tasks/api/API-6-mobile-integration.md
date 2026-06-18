# API-6 — Mobile Integration

**Status:** Pending
**Depends on:** API-5 complete (API client pattern established)

---

## Goal

Replace all mock data in the Expo mobile app with real API calls.
JWT tokens are stored in AsyncStorage. The app works end-to-end
with the same backend as the web app.

---

## Approach

Create `neighbid-mobile/src/lib/api.ts` mirroring the web pattern.
Each screen that currently reads from `src/data/mock/` is updated to
call the API. Use React `useState` + `useEffect` for data fetching
(no external data-fetching library needed at this stage).

---

## What Codex Will Implement

### neighbid-mobile/src/lib/api.ts

```ts
const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T>
```

Same shape as the web version — throws `ApiError` on non-2xx.

### neighbid-mobile/src/lib/auth.ts

- `login(email, password)` → calls `/auth/login`, stores tokens in AsyncStorage
- `logout()` → removes all auth keys from AsyncStorage
- `getAccessToken()` → reads from AsyncStorage (async)
- `getUser()` → decodes JWT payload

### AsyncStorage keys

```
neighbid.role          (existing — already used by onboarding)
neighbid.access_token
neighbid.refresh_token
neighbid.user
```

### Screens to update

| Screen | Change |
|--------|--------|
| Onboarding step 1 | POST /auth/register, store tokens |
| Homeowner dashboard | GET /requests?neighborhood=... |
| Homeowner bids | GET /users/me bids |
| Bidding room | GET /requests/{id} with bids |
| Provider dashboard | GET /requests?status=live |
| Provider bids | GET /users/me bids |
| Admin community | GET /community/members |
| Admin reports | GET /admin/reports/savings |

### Loading states

Each screen that fetches data shows a centered `ActivityIndicator`
(canvas bg) while loading, and an error card if the fetch fails.

### Environment variable

```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Add to `neighbid-mobile/.env.example`.

---

## Files to Create / Modify

```
neighbid-mobile/src/lib/api.ts         (new)
neighbid-mobile/src/lib/auth.ts        (new)
neighbid-mobile/src/app/(homeowner)/index.tsx   (updated)
neighbid-mobile/src/app/(homeowner)/bids.tsx    (updated)
neighbid-mobile/src/app/bidding-room.tsx        (updated)
neighbid-mobile/src/app/(provider)/index.tsx    (updated)
neighbid-mobile/src/app/(provider)/bids.tsx     (updated)
neighbid-mobile/src/app/(admin)/community.tsx   (updated)
neighbid-mobile/src/app/(admin)/reports.tsx     (updated)
neighbid-mobile/src/app/(onboarding)/get-started.tsx  (updated — calls real API)
neighbid-mobile/.env.example           (updated)
```

---

## Acceptance Criteria

1. Onboarding signup calls `POST /auth/register` and stores tokens
2. Homeowner dashboard loads requests from the live API
3. Provider "Submit bid" POST creates a real bid row
4. Admin approve/decline calls the real PUT endpoints
5. All screens show `ActivityIndicator` while loading
6. All screens show an error card if the API is unreachable
7. Sign out removes all four AsyncStorage keys
8. `npx tsc --noEmit` passes with zero errors

---

## Out of Scope

- Token refresh on 401 (manual re-login is fine for now)
- Offline caching
- Push notifications

---

## Codex Implementation Prompt

```
Implement API-6 mobile integration for the NeighBid Expo app at /neighbid-mobile/.

Create src/lib/api.ts and src/lib/auth.ts, then update all screens
to fetch from the FastAPI backend instead of importing mock data.

Critical requirements:
1. apiFetch reads EXPO_PUBLIC_API_URL from env, falls back to localhost:8000
2. All protected screens call getAccessToken() from AsyncStorage before fetching
3. Each screen shows <ActivityIndicator /> while loading and an error card on failure
4. Onboarding step 1 calls POST /auth/register; on success stores access_token,
   refresh_token, and user in AsyncStorage (in addition to neighbid.role)
5. Sign out in profile screens must remove ALL four AsyncStorage keys
6. Do NOT delete any files in src/data/mock/ — only stop importing them
7. Run: npx tsc --noEmit
   Fix all type errors before finishing
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
