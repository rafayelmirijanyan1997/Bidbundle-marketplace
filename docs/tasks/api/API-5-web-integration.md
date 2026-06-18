# API-5 — Web Integration

**Status:** Pending
**Depends on:** API-4 complete

---

## Goal

Replace all mock data in the Next.js web app with real API calls to the
FastAPI backend. The web app should work end-to-end with a live database.

---

## Approach

Create a thin API client at `src/lib/api.ts` that wraps `fetch` with the
base URL and auth header injection. Each page/component that currently
reads from `src/data/mock/` is updated to call the API client instead.

No mock data files are deleted — they stay as fallbacks during the
transition and for Storybook/tests if added later.

---

## What Codex Will Implement

### src/lib/api.ts

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T>
```

- Injects `Authorization: Bearer` header if token provided
- Throws `ApiError` with `status` + `message` on non-2xx responses
- Used by all server components and client components

### src/lib/auth.ts

- `login(email, password)` → stores tokens in `localStorage`
- `logout()` → clears tokens, redirects to `/`
- `getAccessToken()` → returns stored token or null
- `getUser()` → decodes JWT payload (no verify — server does that)

### Pages / components to update

| File | Change |
|------|--------|
| Homeowner dashboard | fetch `GET /requests?neighborhood=...` |
| Homeowner bids | fetch `GET /users/me/bids` (or filter from requests) |
| Bidding room | fetch `GET /requests/{id}` with bids |
| Provider dashboard | fetch `GET /requests?status=live` |
| Provider bids | fetch `GET /users/me/bids` |
| Admin community | fetch `GET /community/members` |
| Admin reports | fetch `GET /admin/reports/savings` + `/admin/stats` |
| Onboarding | `POST /auth/register` then `POST /auth/login` |

### Environment variable

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Add to `.env.local.example` in the web root.

---

## Files to Create / Modify

```
src/lib/api.ts             (new)
src/lib/auth.ts            (new)
src/app/(homeowner)/...    (updated data fetching)
src/app/(provider)/...     (updated data fetching)
src/app/(admin)/...        (updated data fetching)
src/app/get-started/...    (updated — calls /auth/register)
.env.local.example         (new or updated)
```

---

## Acceptance Criteria

1. Homeowner dashboard loads real requests from the API
2. Submitting a new request via the web form creates a row in the database
3. Provider submitting a bid creates a row in the `bids` table
4. Admin approve/decline updates the database
5. Logging out clears the token and redirects to `/`
6. If the API is unreachable, the app shows a graceful error state (not a crash)
7. `npx tsc --noEmit` passes with zero errors

---

## Out of Scope

- Server-side rendering with per-request auth (all client-side fetching for now)
- Optimistic updates
- Real-time WebSocket updates

---

## Codex Implementation Prompt

```
Implement API-5 web integration for the NeighBid Next.js app at /src/.

Create src/lib/api.ts and src/lib/auth.ts, then update the homeowner,
provider, and admin pages to fetch from the FastAPI backend instead of
importing mock data.

Critical requirements:
1. apiFetch throws a typed ApiError (with status + message) on non-2xx
2. All protected pages read the token from localStorage via getAccessToken()
3. Onboarding calls POST /auth/register then stores the returned tokens
4. Add NEXT_PUBLIC_API_URL=http://localhost:8000 to .env.local.example
5. Do NOT delete any files in src/data/mock/ — only stop importing them
   in the updated pages
6. Run: npx tsc --noEmit
   Fix all type errors before finishing
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
