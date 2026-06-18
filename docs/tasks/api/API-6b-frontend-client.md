# API-6b — Frontend API Client + Auth State + Provider Dashboard Wiring

**Status:** Completed
**Depends on:** API-6a complete (provider backend live on :8000)

## Goal

1. Build the frontend API client and auth layer (`src/lib/`, `src/hooks/`)
2. Wire the onboarding/get-started flow to call real `/auth/register`
3. Add a real sign-in page that calls `/auth/login`
4. Wire the provider dashboard to real API data with a cold start UI
5. Wire the provider job feed page to real `/provider/job-feed`
6. Wire the provider bids page to real `/provider/bids`

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/lib/api.ts` | CREATE — fetch wrapper with auth header injection |
| `src/lib/auth.ts` | CREATE — token storage, login, register, logout helpers |
| `src/hooks/useAuth.ts` | CREATE — React hook for auth state |
| `src/hooks/useProviderDashboard.ts` | CREATE — hook for provider dashboard data |
| `src/hooks/useProviderJobFeed.ts` | CREATE — hook for job feed |
| `src/hooks/useProviderBids.ts` | CREATE — hook for provider bids |
| `src/app/get-started/page.tsx` | MODIFY — call real /auth/register on finish |
| `src/app/sign-in/page.tsx` | MODIFY — call real /auth/login |
| `src/app/app/provider/dashboard/page.tsx` | MODIFY — use real data + cold start UI |
| `src/app/app/provider/job-feed/page.tsx` | MODIFY — use real data |
| `src/app/app/provider/bids/page.tsx` | MODIFY — use real data |

---

## Step 1 — `src/lib/api.ts`

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.detail ?? message;
    } catch {}
    throw new ApiError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
```

---

## Step 2 — `src/lib/auth.ts`

```ts
import { apiFetch } from "./api";

const TOKEN_KEY = "neighbid.token";
const USER_KEY = "neighbid.user";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: "homeowner" | "provider" | "admin";
  neighborhood: string | null;
  is_verified: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/* ── Token storage ── */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("neighbid.role");
}

/* ── Auth calls ── */
export async function register(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: string;
}): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  // FastAPI OAuth2PasswordRequestForm expects form-encoded body
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Login failed");
  }
  return res.json();
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/users/me", { token });
}

export function logout(): void {
  clearAuth();
  window.location.href = "/";
}
```

---

## Step 3 — `src/hooks/useAuth.ts`

```ts
"use client";

import { useEffect, useState } from "react";
import { type AuthUser, fetchMe, getToken } from "@/lib/auth";

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getToken();
    if (!stored) { setLoading(false); return; }
    setToken(stored);
    fetchMe(stored)
      .then(setUser)
      .catch(() => { /* token expired — ignore, user stays null */ })
      .finally(() => setLoading(false));
  }, []);

  return { user, token, loading, isAuthenticated: !!user };
}
```

---

## Step 4 — `src/hooks/useProviderDashboard.ts`

```ts
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface ProviderDashboard {
  cold_start: boolean;
  active_bids: number;
  jobs_completed: number;
  revenue_30d_cents: number;
  revenue_total_cents: number;
  win_rate_pct: number | null;
  avg_rating: number | null;
  reviews_count: number;
  unread_messages: number;
}

export interface ProviderProfile {
  company_name: string | null;
  bio: string | null;
  trades: string;
  service_radius_mi: number;
  is_insured: boolean;
  is_licensed: boolean;
}

export function useProviderDashboard() {
  const [dashboard, setDashboard] = useState<ProviderDashboard | null>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    Promise.all([
      apiFetch<ProviderDashboard>("/provider/dashboard", { token }),
      apiFetch<ProviderProfile>("/provider/me", { token }),
    ])
      .then(([dash, prof]) => { setDashboard(dash); setProfile(prof); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { dashboard, profile, loading, error };
}
```

---

## Step 5 — `src/hooks/useProviderJobFeed.ts`

```ts
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface JobFeedItem {
  id: number;
  title: string;
  category: string;
  neighborhood: string;
  status: string;
  budget_min: number;
  budget_max: number;
  bid_count: number;
  created_at: string;
  closes_at: string | null;
}

export function useProviderJobFeed(category?: string) {
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    const params = category ? `?category=${encodeURIComponent(category)}` : "";
    apiFetch<JobFeedItem[]>(`/provider/job-feed${params}`, { token })
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  return { jobs, loading, error };
}
```

---

## Step 6 — `src/hooks/useProviderBids.ts`

```ts
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface ProviderBid {
  id: number;
  request_id: number;
  request_title: string;
  request_category: string;
  request_neighborhood: string;
  request_status: string;
  amount: number;        // cents
  estimated_days: number;
  status: string;
  created_at: string;
}

export function useProviderBids(status?: string) {
  const [bids, setBids] = useState<ProviderBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    const params = status ? `?status=${status}` : "";
    apiFetch<ProviderBid[]>(`/provider/bids${params}`, { token })
      .then(setBids)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  return { bids, loading, error };
}
```

---

## Step 7 — Update `/auth/register` endpoint in FastAPI

The current `/auth/register` response does not return a `UserOut` — it only returns `Token`.
The frontend needs user info. Add a `/users/me` endpoint to `api/routers/users.py` if it
does not already exist:

```python
@router.get("/users/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return current_user
```

Check the file first — if it's already there, skip this.

---

## Step 8 — Update `src/app/get-started/page.tsx`

Find the `handleFinish` function and replace it with a real API call:

```ts
const [submitting, setSubmitting] = useState(false);
const [apiError, setApiError] = useState<string | null>(null);

const handleFinish = async () => {
  setSubmitting(true);
  setApiError(null);
  try {
    const tokens = await register({
      email: signup.email,
      password: signup.password,
      full_name: signup.fullName,
      phone: signup.phone || undefined,
      role,
    });
    setToken(tokens.access_token);
    saveRole(role);
    router.push(destinationByRole[role]);
  } catch (e: unknown) {
    setApiError(e instanceof Error ? e.message : "Registration failed");
    setSubmitting(false);
  }
};
```

Add imports at the top:
```ts
import { register, setToken } from "@/lib/auth";
```

Add `useState` for `submitting` and `apiError`.

Show `apiError` as a red text below the finish button when set.
Disable the finish button when `submitting === true` and show "Creating account…" text.

---

## Step 9 — Update `src/app/sign-in/page.tsx`

Find the existing sign-in page. Replace the form submit handler with:

```ts
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);
  try {
    const tokens = await login(email, password);
    setToken(tokens.access_token);
    // Fetch user role then redirect
    const me = await fetchMe(tokens.access_token);
    saveRole(me.role as UserRole);
    const dest = me.role === "provider"
      ? "/app/provider/dashboard"
      : me.role === "admin"
      ? "/app/admin/dashboard"
      : "/app/homeowner/dashboard";
    router.push(dest);
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "Sign in failed");
    setSubmitting(false);
  }
};
```

Add imports:
```ts
import { login, setToken, fetchMe } from "@/lib/auth";
import { saveRole } from "@/utils/onboardingState";
```

Show `error` as red text below the submit button.
Show "Signing in…" when `submitting === true`.

---

## Step 10 — Provider Dashboard: real data + cold start UI

Replace `src/app/app/provider/dashboard/page.tsx` with a version that:

1. Calls `useProviderDashboard()` at the top
2. Shows a loading state while `loading === true`
3. Shows the **cold start screen** when `dashboard?.cold_start === true`
4. Shows the existing rich dashboard layout when data is available, with real numbers

### Loading state (simple, full-height centered):
```tsx
if (loading) {
  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--ink-400)", fontSize: 14 }}>Loading your dashboard…</div>
    </div>
  );
}
```

### Cold start screen (shown when `dashboard.cold_start === true`):
```tsx
<div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
  {/* Topbar */}
  <div style={{ padding: "28px 36px 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 4px", color: "var(--ink-900)" }}>
        Welcome to NeighBid{profile?.company_name ? `, ${profile.company_name}` : ""}
      </h1>
      <p style={{ margin: 0, color: "var(--ink-500)", fontSize: 14 }}>
        Let&apos;s get your first job. Three steps to your first bid.
      </p>
    </div>
  </div>

  <div style={{ padding: "0 36px 36px" }}>
    {/* Warm hero banner */}
    <div style={{
      background: "linear-gradient(135deg, var(--terracotta-600) 0%, var(--terracotta-500) 100%)",
      borderRadius: 22, padding: "36px 40px", color: "white",
      display: "grid", gridTemplateColumns: "1fr auto", gap: 32,
      alignItems: "center", marginBottom: 28,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", right: -60, top: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.75, marginBottom: 12 }}>Getting started</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          Your first group job is waiting.
        </div>
        <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.6, maxWidth: 480 }}>
          Neighbors in your area are grouping home-service requests right now. Browse available jobs, submit a competitive bid, and start building your NeighBid reputation.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <Link href="/app/provider/job-feed" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 44, padding: "0 22px", borderRadius: 999,
          background: "white", color: "var(--terracotta-600)",
          fontSize: 14, fontWeight: 700, textDecoration: "none",
        }}>
          Browse job feed →
        </Link>
        <Link href="/app/provider/profile" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 44, padding: "0 22px", borderRadius: 999,
          background: "rgba(255,255,255,0.15)", color: "white",
          fontSize: 14, fontWeight: 600, textDecoration: "none",
        }}>
          Complete your profile
        </Link>
      </div>
    </div>

    {/* Onboarding checklist */}
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-warm)",
      borderRadius: 18, boxShadow: "var(--shadow-warm-sm)", overflow: "hidden",
    }}>
      <div style={{ padding: "20px 24px 16px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>
          Your first 3 steps
        </div>
      </div>
      <div style={{ height: 1, background: "var(--border-warm)" }} />
      {[
        { num: "01", label: "Complete your profile", sub: "Add your trades, service area, and licence info so homeowners can trust you.", href: "/app/provider/profile", done: !!(profile?.trades && profile.trades.length > 0) },
        { num: "02", label: "Browse the job feed", sub: "Live group jobs near you — filter by trade and distance, then submit your first bid.", href: "/app/provider/job-feed", done: false },
        { num: "03", label: "Submit your first bid", sub: "Competitive group bids win more work. Your win rate starts here.", href: "/app/provider/job-feed", done: false },
      ].map((step, i) => (
        <div key={i} style={{
          padding: "18px 24px",
          display: "grid", gridTemplateColumns: "48px 1fr auto",
          gap: 16, alignItems: "center",
          borderTop: i > 0 ? "1px solid var(--border-warm)" : "none",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: step.done ? "var(--sage-50)" : "var(--cream-100)",
            border: step.done ? "1.5px solid var(--sage-100)" : "1.5px solid var(--border-warm)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: 18, color: step.done ? "var(--sage-700)" : "var(--ink-400)",
          }}>
            {step.done ? "✓" : step.num}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)", marginBottom: 2 }}>{step.label}</div>
            <div style={{ fontSize: 12, color: "var(--ink-500)", lineHeight: 1.5 }}>{step.sub}</div>
          </div>
          <Link href={step.href} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            height: 30, padding: "0 12px", borderRadius: 999,
            fontSize: 13, fontWeight: 600,
            background: step.done ? "var(--sage-50)" : "var(--terracotta-600)",
            color: step.done ? "var(--sage-700)" : "white",
            textDecoration: "none", border: 0,
          }}>
            {step.done ? "Done ✓" : "Start →"}
          </Link>
        </div>
      ))}
    </div>
  </div>
</div>
```

### Data dashboard (when `cold_start === false`):
Keep the existing rich layout from the current `dashboard/page.tsx` but replace hardcoded
numbers with real values from `dashboard` and `profile`:

- Hero card: `dashboard.active_bids` active bids count
- Revenue: `(dashboard.revenue_30d_cents / 100).toFixed(0)` formatted as "$X,XXX"
- Jobs completed: `dashboard.jobs_completed`
- Avg rating: `dashboard.avg_rating ?? "—"`
- Win rate: `dashboard.win_rate_pct ? dashboard.win_rate_pct + "%" : "—"`
- Unread messages badge: `dashboard.unread_messages`

Keep all the mock job feed cards and schedule rows as-is for now (those get real data in API-6c).

---

## Step 11 — Provider Job Feed: real data

In `src/app/app/provider/job-feed/page.tsx`:

1. Import and call `useProviderJobFeed()`
2. Show a loading state while `loading === true`
3. When jobs are empty AND not loading, show an empty state:
   ```tsx
   <div style={{ textAlign:"center", padding:"80px 0", color:"var(--ink-400)" }}>
     <div style={{ fontSize:14 }}>No matching jobs right now — check back soon.</div>
   </div>
   ```
4. When jobs have data, map over `jobs` to render cards matching the existing card layout.
   Each job card shows:
   - Title: `job.title`
   - Details: `job.neighborhood · ${job.bid_count} bids · budget $${job.budget_min/100}–${job.budget_max/100}`
   - Status chip: `job.status` ("live" → sage-dot chip, "grouping" → gold chip)
   - Budget range: `$${Math.round(job.budget_min/100)}–${Math.round(job.budget_max/100)}`
   - "Bid" button (primary) or "View" button (ghost)

---

## Step 12 — Provider Bids: real data

In `src/app/app/provider/bids/page.tsx`:

1. Import and call `useProviderBids()`
2. Show loading / empty states
3. Map over `bids` to render rows. Each row:
   - Title: `bid.request_title`
   - Sub: `bid.request_neighborhood · ${bid.request_category}`
   - Status chip from `bid.status` (pending → terracotta dot, accepted → sage dot, declined → neutral)
   - Amount: `$${(bid.amount / 100).toFixed(0)}` — show "—" if 0
   - Date: formatted `bid.created_at`
   - "Open →" ghost button

---

## Acceptance Criteria

- [ ] `src/lib/api.ts` exists with `apiFetch` and `ApiError`
- [ ] `src/lib/auth.ts` exists with `login`, `register`, `fetchMe`, `getToken`, `setToken`, `clearAuth`, `logout`
- [ ] `src/hooks/useAuth.ts` returns `{ user, token, loading, isAuthenticated }`
- [ ] `/get-started` calls `POST /auth/register` on step 3 finish — real JWT stored in localStorage
- [ ] `/sign-in` calls `POST /auth/login` — navigates to correct role dashboard
- [ ] Provider dashboard shows loading spinner while fetching
- [ ] Provider dashboard shows cold start onboarding UI when `cold_start: true`
- [ ] Provider dashboard shows real revenue, jobs, rating, win rate when data exists
- [ ] Provider job feed renders real jobs from API (or empty state if none)
- [ ] Provider bids page renders real bids from API (or empty state if none)
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `/users/me` endpoint exists in FastAPI and returns current user

## Out of Scope
- Schedule, Messages, Earnings, Reviews pages (API-6c)
- WebSocket real-time updates
- Homeowner API wiring

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude |
| 2026-05-07 | Completed | Claude implemented directly (Codex sandboxed to api/). tsc clean. Dashboard shows real API data ($0, 0 jobs), cold start triggers on authenticated new provider login, job feed + bids wired with empty states. |
| 2026-05-07 | Extended (API-6c) | All 5 remaining pages wired: Schedule (empty state), Messages (real conversations + live send), Earnings ($0 this month, no completed jobs), Reviews (0 reviews, real distribution), Profile (real company_name/trades/service area). tsc clean. |
