# MB-7: Mobile Auth — Switch to Supabase Auth

## Status
Approved

## Goal
Replace the old `/auth/login` + `/auth/register` FastAPI calls with
Supabase Auth. The screen components stay unchanged — only the API
layer is updated.

## Why this comes now
API-10 removed `/auth/login` and `/auth/register` from FastAPI.
The mobile app now gets "Network request failed" on sign-in because
those endpoints no longer exist.

---

## New auth flow

```
login(email, password)
  → supabase.auth.signInWithPassword()   // Supabase issues JWT
  → POST /auth/sync  { role, full_name } // FastAPI links profile
  → store JWT in AsyncStorage
  → return User

register(email, password, ...)
  → supabase.auth.signUp()
  → POST /auth/sync  { role, full_name, latitude, longitude }
  → store JWT in AsyncStorage
  → return User

logout()
  → supabase.auth.signOut()
  → clearToken()
```

---

## What Codex will implement

### 1. Install dependencies
From `neighbid-iphone/` directory:
```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

### 2. `index.js` — add URL polyfill (first line)
```js
import 'react-native-url-polyfill/auto';
```
This must be the very first import.

### 3. Create `src/api/supabase.ts`
```ts
import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL  = 'https://omtyrmscccjibacullie.supabase.co';
const SUPABASE_ANON = 'sb_publishable_s7TEC1mL9RkzynwFrHzbXQ_VhSQohE1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 4. Rewrite `src/api/auth.ts`

Replace the entire file with this implementation.
Keep the `User`, `Role` types and `fetchMe()` exactly as-is.
Remove `TokenResponse` — it is no longer needed.

```ts
import {supabase} from './supabase';
import {apiFetch, setToken, clearToken, API_BASE} from './client';

export type Role = 'homeowner' | 'provider' | 'admin' | 'hoa_homeowner';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  neighbourhood_id: number | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  community_id: number | null;
  unit_number: string | null;
}

export async function login(email: string, password: string): Promise<User> {
  const {data, error} = await supabase.auth.signInWithPassword({email, password});
  if (error || !data.session) throw new Error(error?.message ?? 'Sign in failed');
  await setToken(data.session.access_token);
  // Sync profile — user already exists in DB, just links supabase_uid
  await apiFetch('/auth/sync', {
    method: 'POST',
    body: JSON.stringify({role: 'homeowner', full_name: data.user?.email ?? ''}),
  }).catch(() => {}); // non-fatal if already synced
  return fetchMe();
}

export async function register(params: {
  email: string;
  password: string;
  full_name: string;
  role: Role;
  latitude?: number;
  longitude?: number;
}): Promise<User> {
  const {data, error} = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  });
  if (error || !data.session) throw new Error(error?.message ?? 'Registration failed');
  await setToken(data.session.access_token);
  await apiFetch('/auth/sync', {
    method: 'POST',
    body: JSON.stringify({
      role: params.role,
      full_name: params.full_name,
      latitude: params.latitude,
      longitude: params.longitude,
    }),
  });
  return fetchMe();
}

export async function registerHoa(params: {
  email: string;
  password: string;
  full_name: string;
  community_name: string;
  community_type: string;
  community_address: string;
  unit_count?: number;
}): Promise<User> {
  const {data, error} = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  });
  if (error || !data.session) throw new Error(error?.message ?? 'Registration failed');
  await setToken(data.session.access_token);
  await apiFetch('/auth/register-hoa', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      full_name: params.full_name,
      community_name: params.community_name,
      community_type: params.community_type,
      community_address: params.community_address,
      unit_count: params.unit_count,
    }),
  });
  return fetchMe();
}

export async function validateInvite(code: string): Promise<{
  community_name: string;
  community_type: string | null;
  unit_number: string | null;
  invite_id: number;
}> {
  return apiFetch('/auth/validate-invite', {
    method: 'POST',
    body: JSON.stringify({code}),
  });
}

export async function acceptInvite(params: {
  invite_code: string;
  email: string;
  password: string;
  full_name: string;
  unit_number?: string;
}): Promise<User> {
  const {data, error} = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  });
  if (error || !data.session) throw new Error(error?.message ?? 'Registration failed');
  await setToken(data.session.access_token);
  await apiFetch('/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify({
      invite_code: params.invite_code,
      email: params.email,
      full_name: params.full_name,
      unit_number: params.unit_number,
    }),
  });
  return fetchMe();
}

export async function fetchMe(): Promise<User> {
  return apiFetch<User>('/users/me');
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  await clearToken();
}
```

### 5. Update `src/hooks/useAuth.ts`

On startup, restore the session from Supabase (which persists via
AsyncStorage automatically) and sync the token:

```ts
import {useState, useEffect, useCallback} from 'react';
import {fetchMe, logout as apiLogout, User} from '../api/auth';
import {setToken, clearToken} from '../api/client';
import {supabase} from '../api/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore existing Supabase session
    supabase.auth.getSession().then(async ({data: {session}}) => {
      if (session) {
        await setToken(session.access_token);
        try {
          setUser(await fetchMe());
        } catch {
          await clearToken();
        }
      }
      setLoading(false);
    });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return {user, setUser, loading, logout};
}
```

---

## Files to create
- `neighbid-iphone/src/api/supabase.ts`

## Files to modify
- `neighbid-iphone/index.js` — add URL polyfill import (first line)
- `neighbid-iphone/src/api/auth.ts` — full rewrite
- `neighbid-iphone/src/hooks/useAuth.ts` — restore session via Supabase

## Files to leave untouched
- All screen components — they call `login()`, `register()` etc. unchanged
- `src/api/client.ts` — unchanged
- `src/navigation/` — unchanged

---

## Acceptance criteria
- Sign in with `alice@neighbid.com` / `Demo1234!` works in the simulator
- After sign-in, the app navigates to the homeowner dashboard
- Closing and reopening the app keeps the user signed in (session persists)
- Logout clears the session and returns to sign-in screen

## Out of scope
- OAuth / social login
- Email verification flow
- Password reset flow

---

## Codex implementation prompt

Implement MB-7 for the NeighBid React Native app at
`/Users/lancedsilva/Documents/neighbid-claude-codex-starter/neighbid-iphone/`.

The app currently calls `/auth/login` on the FastAPI server which no
longer exists. Auth is now handled by Supabase.

Steps:
1. Run: `npm install @supabase/supabase-js react-native-url-polyfill`
   from the `neighbid-iphone/` directory.

2. Add `import 'react-native-url-polyfill/auto';` as the FIRST line
   of `index.js`.

3. Create `src/api/supabase.ts` — Supabase client with AsyncStorage,
   URL `https://omtyrmscccjibacullie.supabase.co`,
   anon key `sb_publishable_s7TEC1mL9RkzynwFrHzbXQ_VhSQohE1`.

4. Rewrite `src/api/auth.ts` — replace `login()` and `register()` to
   call `supabase.auth.signInWithPassword()` / `signUp()`, store the
   Supabase JWT via `setToken()`, then call `/auth/sync` on FastAPI.
   Keep `fetchMe()`, `validateInvite()`, `acceptInvite()`,
   `registerHoa()` signatures identical — only their internals change.

5. Rewrite `src/hooks/useAuth.ts` — on mount call
   `supabase.auth.getSession()` to restore a persisted session, set
   the token, then call `fetchMe()`.

Do NOT touch any screen components or navigation files.
Full implementation details are in
`docs/tasks/mobile/MB-7-supabase-auth.md`.
