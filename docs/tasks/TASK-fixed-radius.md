# TASK — Remove user-configurable radius, standardise to 4 mi

**Status:** Approved
**Approved:** 2026-05-07

---

## Goal

The NeighBid platform auto-detects the user's community within a **fixed 4-mile radius**.
Remove every radius selector, slider, and user-configurable input from the entire app.
Replace all hardcoded distance strings (5 mi, 8 mi, 10 mi) with "4 mi" or remove entirely.

---

## Product rule

The community radius is **always 4 miles**. It is set by the platform, not the user.
No UI surface — onboarding, profile, job feed, filters, map — should ever offer a radius
selector or "Adjust" link.

---

## Changes required

### Backend — 4 files

#### `api/models/provider_profile.py`
Change `service_radius_mi` default from 10 → 4:
```python
service_radius_mi: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
```

#### `api/models/homeowner_profile.py`
Change `service_radius_mi` default from 8 → 4:
```python
service_radius_mi: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
```

#### `api/schemas/provider.py`
Remove `service_radius_mi` from the provider profile **update** schema so users cannot
change it via the API. Find the Pydantic model used for PATCH/update requests (the one with
`Optional[int] = None` fields) and delete the `service_radius_mi` line from it.
Leave it in the read/output schema (it still needs to be returned in responses).

#### `api/schemas/homeowner.py`
Same as above — remove `service_radius_mi` from the homeowner profile **update** schema.
Leave it in the read/output schema.

---

### Frontend — 6 files

#### 1. `src/components/onboarding/VerifyAreaStep.tsx`

**Remove the entire radius slider block** (the `<div>` containing the `community-radius` label
and `<input type="range">`). The block to delete starts with:
```tsx
<div className="rounded-[24px] border bg-[var(--cream-50)] p-4"...>
  <div className="mb-2.5 flex items-center justify-between">
    <label htmlFor="community-radius"...>Community radius</label>
    ...
  </div>
  <input id="community-radius" type="range" .../>
</div>
```

**Remove `radius` and `onRadiusChange` from the props type and destructuring.**
The component should no longer accept or use these props.

Replace the heading subtitle with:
```tsx
<p className="mt-2 text-[14px] leading-6 text-[var(--ink-500)]">
  Tell us where you live so we can match you with neighbors within your 4 mi community radius
</p>
```

#### 2. `src/app/get-started/page.tsx`

**Remove** `const [radius, setRadius] = useState(6);`

**Remove** the `radius={radius}` and `onRadiusChange={...}` props from the `<VerifyAreaStep>`
call (or replace with nothing — those props no longer exist on the component).

#### 3. `src/app/app/provider/job-feed/page.tsx`

Make these four targeted replacements:

**A.** Job feed subtitle — change "8 mi service area":
```
"5 live group RFPs · 3 closing today · matched to your trades & 8 mi service area"
```
→
```
"5 live group RFPs · 3 closing today · matched to your trades · 4 mi community radius"
```

**B.** Filter row — remove the "Within 5 mi" button entirely:
```tsx
<button style={btnSmGhost}>Within 5 mi</button>
```
Delete this line.

**C.** Auto-bid card — change "within **5 mi**":
```tsx
We&apos;ll draft a quote when a job matches <strong>≥85%</strong> within <strong>5 mi</strong>.
```
→
```tsx
We&apos;ll draft a quote when a job matches <strong>≥85%</strong> within your <strong>4 mi radius</strong>.
```

**D.** Service map footer — change "Radius: **8 mi** · Adjust →":
```tsx
<span>Radius: <strong style={{ color: "var(--ink-900)" }}>8 mi</strong></span>
<a href="#" onClick={(e) => e.preventDefault()} style={...}>Adjust →</a>
```
→ Replace both elements with just:
```tsx
<span style={{ color: "var(--ink-500)" }}>Community radius: <strong style={{ color: "var(--ink-900)" }}>4 mi</strong></span>
```
(Delete the anchor element entirely.)

#### 4. `src/app/app/provider/profile/page.tsx`

Find this string on line ~250:
```typescript
`${profile.neighborhood ?? "Not set"} · ${profile.service_radius_mi} mi · ${profile.trades...}`
```
Remove ` · ${profile.service_radius_mi} mi` from the template literal so it becomes:
```typescript
`${profile.neighborhood ?? "Not set"} · ${profile.trades ? ...}`
```

Also find the fallback string on the next line:
```typescript
"Oakwood Heights · 8 mi · 4 trades"
```
→
```typescript
"Oakwood Heights · 4 trades"
```

#### 5. `src/app/app/homeowner/profile/page.tsx`

Replace the entire "Community radius" block (the label + value row + decorative slider,
lines ~146–153) with a simple static info row:

Current block to replace:
```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
  <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Community radius</div>
  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--terracotta-600)" }}>{profile?.service_radius_mi ?? 0} mi</div>
</div>
<div style={{ position: "relative", height: 6, background: "var(--cream-200)", borderRadius: 999 }}>
  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(((profile?.service_radius_mi ?? 0) / 15) * 100, 100)}%`, background: "var(--terracotta-500)", borderRadius: 999 }} />
  <div style={{ position: "absolute", left: `${Math.min(((profile?.service_radius_mi ?? 0) / 15) * 100, 100)}%`, top: -5, width: 16, height: 16, background: "white", border: "3px solid var(--terracotta-600)", borderRadius: "50%", transform: "translateX(-50%)" }} />
</div>
```

Replace with:
```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
  <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Community radius</div>
  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--terracotta-600)" }}>4 mi</div>
</div>
<div style={{ height: 6, background: "var(--cream-200)", borderRadius: 999, overflow: "hidden" }}>
  <div style={{ width: "26.6%", height: "100%", background: "var(--terracotta-500)", borderRadius: 999 }} />
</div>
```
(26.6% = 4/15 × 100 — honest representation of 4 mi out of a 15 mi max, now a static bar)

Also on line ~202, replace the dynamic radius stat:
```typescript
{ num: `${profile?.service_radius_mi ?? 0} mi`, label: "Radius", color: "var(--terracotta-600)" },
```
→
```typescript
{ num: "4 mi", label: "Radius", color: "var(--terracotta-600)" },
```

#### 6. `src/hooks/useProviderProfile.ts`

The `service_radius_mi: number` in the interface is fine to keep — it is a read-only field
returned from the API, just no longer user-editable. No change needed here.

---

## Acceptance criteria

1. The onboarding "Confirm your area" step has no radius slider.
2. Provider job feed subtitle says "4 mi community radius" — no "8 mi".
3. No "Within 5 mi" filter chip on the job feed.
4. Auto-bid card says "within your **4 mi radius**".
5. Service map shows "Community radius: **4 mi**" with no "Adjust →" link.
6. Provider profile summary does not show `service_radius_mi` value.
7. Homeowner profile shows static "4 mi" with a fixed progress bar.
8. Backend `service_radius_mi` defaults to 4 for both homeowner and provider profiles.
9. `service_radius_mi` cannot be changed via the profile update API endpoints.
10. `tsc --noEmit` passes with no new errors.

---

## Out of scope

- DB migration (existing rows keep their old values — that's fine, they're never shown to users)
- Mobile app (separate codebase)
- Admin pages

---

## Codex implementation prompt

```
Implement the fixed-4-mile-radius cleanup for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/TASK-fixed-radius.md

Files to modify (targeted edits only — do not rewrite entire files):
  api/models/provider_profile.py      (change default to 4)
  api/models/homeowner_profile.py     (change default to 4)
  api/schemas/provider.py             (remove service_radius_mi from update schema)
  api/schemas/homeowner.py            (remove service_radius_mi from update schema)
  src/components/onboarding/VerifyAreaStep.tsx   (remove slider, update subtitle)
  src/app/get-started/page.tsx                   (remove radius state and prop)
  src/app/app/provider/job-feed/page.tsx         (4 targeted string replacements)
  src/app/app/provider/profile/page.tsx          (remove radius from summary string)
  src/app/app/homeowner/profile/page.tsx         (replace dynamic slider with static 4 mi)

After implementation run: npx tsc --noEmit from the project root and fix any errors.
Do not run alembic migrations — the DB column stays, only the default and update schema change.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Backend by Codex (defaults → 4, update schemas cleaned). Frontend by Claude. tsc clean. All 9 files updated. Onboarding slider removed, job feed fixed, profiles static. |
