# Task 502 — Homeowner Warm Redesign

**Status:** Completed

## Owner
Codex, after Claude approval.

## Goal
Replace the current cool Slate/Amber design system with a warm community aesthetic
(cream, terracotta, sage) across the homeowner app shell and all four homeowner pages.
Source of truth: `/claude_website_designs/` folder.

## Why This Task Comes Now
The current homeowner pages were flagged as visually inconsistent with the intended
community-platform brand. New design files have been produced that define the exact
layout, color system, and component hierarchy. This task ports those designs exactly
into the Next.js codebase.

---

## Files to Modify

| File | Action |
|------|--------|
| `src/app/layout.tsx` | Replace DM Sans with Plus Jakarta Sans |
| `src/app/globals.css` | Add warm design tokens |
| `src/app/app/layout.tsx` | Update background to cream |
| `src/components/layout/AppBottomNav.tsx` | Sidebar warm redesign |
| `src/app/app/homeowner/dashboard/page.tsx` | Full rewrite |
| `src/app/app/homeowner/bids/page.tsx` | Full rewrite |
| `src/app/app/homeowner/chat/page.tsx` | Full rewrite |
| `src/app/app/homeowner/profile/page.tsx` | Full rewrite |

---

## Implementation Details

### 1. `src/app/layout.tsx` — Replace body font

Replace `DM_Sans` import with `Plus_Jakarta_Sans`:

```tsx
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
```

In the `<html>` tag, replace `${dmSans.variable}` with `${plusJakartaSans.variable}`.

---

### 2. `src/app/globals.css` — Add warm design tokens

Add these CSS custom properties inside the existing `:root {}` block, after the existing tokens:

```css
/* ── Warm community palette (homeowner redesign) ─────────────────── */
--cream-50:  #FBF7F1;
--cream-100: #F5EFE5;
--cream-200: #EDE4D3;
--cream-300: #E0D4BD;

--ink-900: #1F1A14;
--ink-700: #3D362B;
--ink-500: #6E6557;
--ink-400: #8C8273;
--ink-300: #B5AC9C;
--ink-200: #D7CFBF;

--terracotta-600: #C2552B;
--terracotta-500: #D26B3F;
--terracotta-400: #E08758;
--terracotta-100: #F7DDCB;
--terracotta-50:  #FBEEE3;

--sage-700: #4A6A4D;
--sage-600: #5C7E60;
--sage-500: #7A9A7E;
--sage-100: #DCE7DD;
--sage-50:  #EBF1EC;

--gold-600: #B8862B;
--gold-500: #D6A23E;
--gold-100: #F2E2B8;
--gold-50:  #F8EFD6;

--plum-600: #7A4A6E;
--plum-100: #E5D2DF;

--danger-600: #B64430;

--bg-app:             #FBF7F1;
--bg-card:            #FFFFFF;
--bg-sidebar:         #221C16;
--bg-sidebar-hover:   #2D261D;
--border-warm:        #ECE3D2;
--border-warm-strong: #D7CFBF;

--shadow-warm-sm: 0 1px 2px rgba(31,26,20,0.04), 0 1px 1px rgba(31,26,20,0.03);
--shadow-warm-md: 0 4px 12px rgba(31,26,20,0.06), 0 2px 4px rgba(31,26,20,0.04);
--shadow-warm-lg: 0 12px 32px rgba(31,26,20,0.10), 0 4px 8px rgba(31,26,20,0.05);
```

---

### 3. `src/app/app/layout.tsx` — Update background

Change both `style={{ background: "#f8fafc" }}` occurrences to `style={{ background: "var(--bg-app)" }}`.

---

### 4. `src/components/layout/AppBottomNav.tsx` — Sidebar warm redesign

Replace the entire sidebar JSX (the `orientation === "sidebar"` branch) with the following.
Keep all existing role-switching logic, `tabsByRole`, `roleLabel`, mobile nav, and icon helpers exactly as-is.
Only replace the rendered JSX in the sidebar branch:

```tsx
if (orientation === "sidebar") {
  const profileHref =
    role === "homeowner" ? "/app/homeowner/profile"
    : role === "provider" ? "/app/provider/profile"
    : "/app/admin/profile";

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex flex-col"
      style={{
        width: 240,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid #1c1209",
        color: "#E8DFCF",
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2.5"
        style={{
          padding: "8px 10px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: "-0.01em",
          color: "#FBF7F1",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "linear-gradient(135deg, var(--terracotta-500), var(--terracotta-600))",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            N
          </div>
          <span style={{ color: "#FBF7F1", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>
            NeighBid
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col" style={{ padding: "14px 14px 0", gap: 2 }}>
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex items-center"
              style={{
                gap: 12,
                padding: "9px 12px",
                borderRadius: 10,
                color: isActive ? "#FBF7F1" : "#C9C0AE",
                background: isActive ? "rgba(194,85,43,0.18)" : "transparent",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: 2,
                    background: "var(--terracotta-400)",
                  }}
                />
              )}
              <Icon style={{ width: 18, height: 18, flexShrink: 0, color: isActive ? "var(--terracotta-400)" : "currentColor" }} />
              <span style={{ flex: 1 }}>{tab.label}</span>
              {tab.label === "Chat" && (
                <span
                  style={{
                    height: 18,
                    padding: "0 7px",
                    borderRadius: 999,
                    background: "var(--terracotta-600)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  3
                </span>
              )}
            </Link>
          );
        })}

        {/* Neighborhood card — homeowner only */}
        {role === "homeowner" && (
          <>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#8C8273",
                padding: "14px 12px 6px",
                fontWeight: 600,
              }}
            >
              Your neighborhood
            </div>
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.05)",
                margin: "0 0 4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#E8DFCF",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>
                </svg>
                Oakwood Heights
              </div>
              <div style={{ color: "#8C8273", fontSize: 11, marginTop: 4 }}>
                47 neighbors · 2 new this week
              </div>
              <div style={{ marginTop: 10, display: "flex" }}>
                {(["#E08758","#7A9A7E","#D6A23E","#B07AA0"] as string[]).map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: c, border: "2px solid #221C16",
                      marginLeft: i === 0 ? 0 : -6, fontSize: 10, color: "white",
                      display: "grid", placeItems: "center", fontWeight: 600,
                    }}
                  >
                    {(["MC","JR","AP","TS"] as string[])[i]}
                  </div>
                ))}
                <div
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#3D362B", border: "2px solid #221C16",
                    marginLeft: -6, fontSize: 9, color: "#E8DFCF",
                    display: "grid", placeItems: "center", fontWeight: 600,
                  }}
                >
                  +43
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
        <Link
          href={profileHref}
          className="flex items-center"
          style={{ gap: 12, padding: "9px 12px", borderRadius: 10, color: "#C9C0AE", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.97 7.97 0 0 0 0-6l1.6-1.2-2-3.4-1.9.8a8 8 0 0 0-5.2-3L11.5 0h-.001L11 0l-.5 2.2a8 8 0 0 0-5.2 3l-1.9-.8-2 3.4 1.6 1.2a7.97 7.97 0 0 0 0 6L1.4 16l2 3.4 1.9-.8a8 8 0 0 0 5.2 3L11 24l1-2.2a8 8 0 0 0 5.2-3l1.9.8 2-3.4-1.6-1.2z"/>
          </svg>
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center"
          style={{ gap: 12, padding: "9px 12px", borderRadius: 10, color: "#C9C0AE", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6"/>
          </svg>
          Back to site
        </Link>

        {/* User card */}
        <div
          className="flex items-center"
          style={{ gap: 10, padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.04)", marginTop: 8 }}
        >
          <div
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--terracotta-400), var(--plum-600))",
              display: "grid", placeItems: "center",
              color: "white", fontWeight: 600, fontSize: 13,
              flexShrink: 0,
            }}
          >
            LS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <div style={{ color: "#FBF7F1", fontSize: 13, fontWeight: 600 }}>Lance Silva</div>
            <div style={{ color: "#8C8273", fontSize: 11 }}>
              {role === "homeowner" ? "Homeowner · HOA verified" : roleLabel[role]}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

Also update the `md:ml-[220px]` offset in `app/app/layout.tsx` to `md:ml-[240px]` since the new sidebar is 240px wide.

---

### 5. `src/app/app/homeowner/dashboard/page.tsx` — Full rewrite

Replace entire file with:

```tsx
"use client";

import Link from "next/link";

/* ── Inline SVG helpers ── */
function IconClock() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
}
function IconArrowR() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
}
function IconPlus() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconBell() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
}
function IconSpark() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5L19 9.8 14 11.6 12 17l-1.8-5.4L5 9.8 10.2 8z"/></svg>;
}
function IconShield() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>;
}
function IconWrench() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6a4 4 0 0 1 5 5l-9 9-4 1 1-4 9-9z"/></svg>;
}
function IconLeaf() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-9 7-14 16-14-1 9-5 16-14 16a4 4 0 0 1-2-2z"/><path d="M5 19l8-8"/></svg>;
}
function IconBroom() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6-7 7H6v-7z"/><path d="M6 14l-3 6 6-3"/></svg>;
}

export default function HomeownerDashboard() {
  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
      {/* Topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "28px 36px 20px",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: "-0.02em",
              margin: "0 0 4px",
              color: "var(--ink-900)",
            }}
          >
            Good morning, Lance
          </h1>
          <p style={{ margin: 0, color: "var(--ink-500)", fontSize: 14 }}>
            Tuesday, April 28 · You have{" "}
            <strong style={{ color: "var(--terracotta-600)" }}>1 bid awaiting your call</strong>{" "}
            and 2 active groups.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              height: 38, padding: "0 16px", borderRadius: 999,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: "transparent", color: "var(--ink-700)",
              border: "1px solid var(--border-warm-strong)",
              fontFamily: "var(--font-body)",
            }}
          >
            <IconBell /> 3
          </button>
          <Link
            href="/app/homeowner/request"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              height: 38, padding: "0 16px", borderRadius: 999,
              fontSize: 14, fontWeight: 600,
              background: "var(--terracotta-600)", color: "white",
              boxShadow: "0 1px 0 rgba(0,0,0,0.05) inset, 0 6px 14px -6px rgba(194,85,43,0.5)",
              textDecoration: "none",
            }}
          >
            <IconPlus /> New request
          </Link>
        </div>
      </div>

      {/* Scroll content */}
      <div style={{ padding: "0 36px 36px" }}>
        {/* Hero — live bidding */}
        <div
          style={{
            background: "linear-gradient(135deg, #2D261D 0%, #1F1A14 60%, #3D2A1F 100%)",
            borderRadius: 22,
            padding: "26px 28px",
            color: "#FBF7F1",
            position: "relative",
            overflow: "hidden",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              position: "absolute", right: -40, top: -40,
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(224,135,88,0.25), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 24, padding: "0 10px", borderRadius: 999,
                background: "rgba(224,135,88,0.2)", color: "#F7DDCB",
                fontSize: 12, fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "#E08758", display: "inline-block", boxShadow: "0 0 0 4px rgba(224,135,88,0.25)" }} />
              Live bidding
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#B5AC9C" }}>
              <IconClock /> Closes in 32h 18m
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 24, alignItems: "flex-end" }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500,
                  letterSpacing: "-0.02em", lineHeight: 1.15,
                }}
              >
                Plumbing leak inspection
              </div>
              <div style={{ color: "#B5AC9C", fontSize: 14, marginTop: 6 }}>
                3 bids in · 3 neighbors joined · ProFix Plumbing leading
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", color: "#8C8273", fontWeight: 600 }}>Best bid</div>
              <div
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 500,
                  fontSize: 38, lineHeight: 1, color: "#FBF7F1", marginTop: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                $490
              </div>
              <div style={{ fontSize: 12, color: "var(--sage-500)", fontWeight: 600, marginTop: 2 }}>−$85 vs solo</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href="/app/homeowner/bids"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  height: 38, padding: "0 16px", borderRadius: 999,
                  fontSize: 14, fontWeight: 600,
                  background: "var(--terracotta-600)", color: "white",
                  textDecoration: "none",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.05) inset, 0 6px 14px -6px rgba(194,85,43,0.5)",
                }}
              >
                Review bids <IconArrowR />
              </Link>
              <Link
                href="/app/homeowner/chat"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  height: 38, padding: "0 16px", borderRadius: 999,
                  fontSize: 14, fontWeight: 600,
                  background: "rgba(255,255,255,0.08)", color: "#FBF7F1",
                  textDecoration: "none",
                }}
              >
                <IconSpark /> Ask AI
              </Link>
            </div>
          </div>
        </div>

        {/* Two-column overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Active requests card */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-warm)",
                borderRadius: 18,
                boxShadow: "var(--shadow-warm-sm)",
              }}
            >
              <div
                style={{
                  padding: "20px 24px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500,
                      color: "var(--ink-900)",
                    }}
                  >
                    Active requests
                  </div>
                  <div style={{ color: "var(--ink-500)", fontSize: 13, marginTop: 2 }}>
                    3 open · group bidding to lower prices
                  </div>
                </div>
                <Link
                  href="/app/homeowner/bids"
                  style={{ color: "var(--terracotta-600)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                >
                  View all →
                </Link>
              </div>
              <div style={{ height: 1, background: "var(--border-warm)" }} />

              {/* Request rows */}
              {[
                { icon: <IconWrench />, avColor: "linear-gradient(135deg,#6F8DB8,#3F608E)", name: "Plumbing leak inspection", loc: "Oakwood Heights", neighbors: 3, status: "Live", chipBg: "var(--terracotta-50)", chipColor: "var(--terracotta-600)", budget: "$450 – $620" },
                { icon: <IconLeaf />, avColor: "linear-gradient(135deg,#7A9A7E,#4A6A4D)", name: "Lawn care bundle", loc: "Lakeview Park", neighbors: 5, status: "Grouping", chipBg: "var(--sage-50)", chipColor: "var(--sage-700)", budget: "$180 – $320" },
                { icon: <IconBroom />, avColor: "linear-gradient(135deg,#D6A23E,#B8862B)", name: "Gutter cleanup", loc: "Oakwood Heights", neighbors: 1, status: "Draft", chipBg: "var(--cream-200)", chipColor: "var(--ink-700)", budget: "$120 – $220" },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 24px",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto",
                    gap: 14,
                    alignItems: "center",
                    borderBottom: i < 2 ? "1px solid var(--border-warm)" : 0,
                  }}
                >
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: r.avColor,
                      display: "grid", placeItems: "center",
                      color: "white", flexShrink: 0,
                    }}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                      {r.loc} · {r.neighbors} {r.neighbors === 1 ? "neighbor" : "neighbors"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13, fontFamily: "var(--font-display)",
                      fontWeight: 500, color: "var(--ink-700)",
                    }}
                  >
                    {r.budget}
                  </div>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      height: 24, padding: "0 10px", borderRadius: 999,
                      fontSize: 12, fontWeight: 600,
                      background: r.chipBg, color: r.chipColor,
                    }}
                  >
                    {r.status === "Live" && (
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} />
                    )}
                    {r.status}
                  </span>
                </div>
              ))}

              <div style={{ padding: 14, borderTop: "1px dashed var(--border-warm-strong)" }}>
                <Link
                  href="/app/homeowner/request"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", height: 42, borderRadius: 12,
                    border: "1px dashed var(--border-warm-strong)",
                    color: "var(--ink-500)", fontWeight: 600, fontSize: 13,
                    textDecoration: "none", background: "transparent",
                  }}
                >
                  <IconPlus /> Add a new service request
                </Link>
              </div>
            </div>

            {/* Neighborhood pulse */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-warm)",
                borderRadius: 18,
                boxShadow: "var(--shadow-warm-sm)",
                padding: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--ink-900)" }}>
                    Neighborhood pulse
                  </div>
                  <div style={{ color: "var(--ink-500)", fontSize: 12, marginTop: 2 }}>
                    What your neighbors are up to
                  </div>
                </div>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    height: 24, padding: "0 10px", borderRadius: 999,
                    fontSize: 12, fontWeight: 600,
                    background: "var(--sage-50)", color: "var(--sage-700)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} />
                  12 today
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { who: "Maria Chen", initials: "MC", avColor: "linear-gradient(135deg,#E08758,#C2552B)", what: "joined your", highlight: "plumbing bid", when: "2h ago" },
                  { who: "ProFix Plumbing", initials: "PF", avColor: "linear-gradient(135deg,#6F8DB8,#3F608E)", what: "submitted a bid", highlight: "$490 · saves $85", when: "4h ago" },
                  { who: "Lawn care group", initials: "LC", avColor: "linear-gradient(135deg,#7A9A7E,#4A6A4D)", what: "formed in Lakeview Park", highlight: "5 neighbors", when: "Yesterday" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: a.avColor,
                        display: "grid", placeItems: "center",
                        color: "white", fontSize: 11, fontWeight: 600, flexShrink: 0,
                      }}
                    >
                      {a.initials}
                    </div>
                    <div style={{ flex: 1, fontSize: 13, color: "var(--ink-700)" }}>
                      <strong style={{ color: "var(--ink-900)" }}>{a.who}</strong> {a.what}{" "}
                      <span style={{ color: "var(--terracotta-600)", fontWeight: 600 }}>{a.highlight}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{a.when}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Savings card */}
            <div
              style={{
                background: "linear-gradient(160deg, var(--cream-100), var(--cream-200))",
                border: "1px solid var(--border-warm)",
                borderRadius: 22,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>
                Your savings this year
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)", fontWeight: 500,
                    fontSize: 56, lineHeight: 1, color: "var(--ink-900)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  $310
                </div>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 9px", borderRadius: 999,
                    fontSize: 12, fontWeight: 600,
                    background: "var(--sage-50)", color: "var(--sage-700)",
                    border: "1px solid var(--sage-100)",
                  }}
                >
                  ↓ 22% vs solo
                </span>
              </div>
              <div style={{ color: "var(--ink-500)", fontSize: 13, marginTop: 6 }}>
                Across 4 services · vs. solo booking
              </div>

              {/* Mini bar chart */}
              <div style={{ marginTop: 20, display: "flex", alignItems: "flex-end", gap: 8, height: 56 }}>
                {[
                  { m: "Jan", h: 14 }, { m: "Feb", h: 0 }, { m: "Mar", h: 32 },
                  { m: "Apr", h: 48 }, { m: "May", h: 22 }, { m: "Jun", h: 36 },
                ].map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: "100%",
                        height: Math.max(b.h, 4),
                        background: b.h > 0 ? "var(--terracotta-500)" : "var(--cream-300)",
                        borderRadius: 4,
                      }}
                    />
                    <div style={{ fontSize: 10, color: "var(--ink-400)" }}>{b.m}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16, paddingTop: 14,
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Neighbors</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink-900)", marginTop: 2, letterSpacing: "-0.02em" }}>14</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Active bids</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink-900)", marginTop: 2, letterSpacing: "-0.02em" }}>2</div>
                </div>
              </div>
            </div>

            {/* AI nudge */}
            <div
              style={{
                background: "linear-gradient(180deg, white, var(--terracotta-50))",
                border: "1px solid var(--terracotta-100)",
                borderRadius: 18,
                padding: 20,
                boxShadow: "var(--shadow-warm-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: "var(--terracotta-600)",
                    display: "grid", placeItems: "center", color: "white",
                  }}
                >
                  <IconSpark />
                </div>
                <div
                  style={{
                    fontSize: 12, fontWeight: 600, color: "var(--terracotta-600)",
                    letterSpacing: "0.04em", textTransform: "uppercase",
                  }}
                >
                  NeighBid AI
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500,
                  lineHeight: 1.35, color: "var(--ink-900)",
                }}
              >
                ProFix is your best plumbing pick — 4.9★, fastest, and saves you $85.
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <button
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    height: 30, padding: "0 12px", borderRadius: 999,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: "var(--terracotta-600)", color: "white", border: 0,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Accept bid
                </button>
                <button
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    height: 30, padding: "0 12px", borderRadius: 999,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: "var(--cream-100)", color: "var(--ink-900)", border: 0,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Why?
                </button>
              </div>
            </div>

            {/* HOA verified */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-warm)",
                borderRadius: 18,
                boxShadow: "var(--shadow-warm-sm)",
                padding: 18,
                display: "flex", gap: 12, alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "var(--sage-50)", color: "var(--sage-700)",
                  display: "grid", placeItems: "center",
                }}
              >
                <IconShield />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>HOA verified member</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Oakwood Heights · since Nov 2024</div>
              </div>
              <IconCheck />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 6. `src/app/app/homeowner/bids/page.tsx` — Full rewrite

Replace entire file with the following TSX. Follow the exact layout from `claude_website_designs/page-bids.jsx`:

```tsx
"use client";

import Link from "next/link";

function IconSearch() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
}
function IconPlus() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconWrench() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6a4 4 0 0 1 5 5l-9 9-4 1 1-4 9-9z"/></svg>;
}
function IconLeaf() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-9 7-14 16-14-1 9-5 16-14 16a4 4 0 0 1-2-2z"/><path d="M5 19l8-8"/></svg>;
}
function IconBroom() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6-7 7H6v-7z"/><path d="M6 14l-3 6 6-3"/></svg>;
}
function IconEdit() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11z"/><path d="M14 5l2.5 2.5"/></svg>;
}
function IconStar() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><path d="M12 2l3 6.5 7 .9-5.1 4.7 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9z"/></svg>;
}

const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-warm)",
  borderRadius: 18,
  boxShadow: "var(--shadow-warm-sm)",
};

const btnPrimary = {
  display: "inline-flex" as const, alignItems: "center" as const, gap: 8,
  height: 38, padding: "0 16px", borderRadius: 999,
  fontSize: 14, fontWeight: 600, cursor: "pointer",
  background: "var(--terracotta-600)", color: "white", border: 0,
  fontFamily: "var(--font-body)",
  boxShadow: "0 1px 0 rgba(0,0,0,0.05) inset, 0 6px 14px -6px rgba(194,85,43,0.5)",
};
const btnGhost = {
  display: "inline-flex" as const, alignItems: "center" as const, gap: 8,
  height: 38, padding: "0 16px", borderRadius: 999,
  fontSize: 14, fontWeight: 600, cursor: "pointer",
  background: "transparent", color: "var(--ink-700)",
  border: "1px solid var(--border-warm-strong)",
  fontFamily: "var(--font-body)",
};
const btnSmQuiet = {
  display: "inline-flex" as const, alignItems: "center" as const, gap: 8,
  height: 30, padding: "0 12px", borderRadius: 999,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  background: "var(--cream-100)", color: "var(--ink-900)", border: 0,
  fontFamily: "var(--font-body)",
};
const btnSmGhost = {
  display: "inline-flex" as const, alignItems: "center" as const, gap: 8,
  height: 30, padding: "0 12px", borderRadius: 999,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  background: "transparent", color: "var(--ink-700)",
  border: "1px solid var(--border-warm-strong)",
  fontFamily: "var(--font-body)",
};

export default function HomeownerBids() {
  const stats = [
    { eyebrow: "Total saved", big: "$310", sub: "across 4 services", numColor: "var(--terracotta-600)", barColor: "var(--terracotta-500)" },
    { eyebrow: "Booked", big: "4", sub: "all-time", numColor: "var(--ink-900)", barColor: "var(--ink-200)" },
    { eyebrow: "Active now", big: "2", sub: "in progress", numColor: "var(--sage-700)", barColor: "var(--sage-500)" },
    { eyebrow: "Completed", big: "1", sub: "this year", numColor: "var(--gold-600)", barColor: "var(--gold-500)" },
  ];

  const tabs = [
    { k: "all", label: "All", n: 4, active: true },
    { k: "active", label: "Active", n: 2 },
    { k: "completed", label: "Completed", n: 1 },
    { k: "archived", label: "Archived", n: 1 },
  ];

  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "28px 36px 20px", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 4px", color: "var(--ink-900)" }}>
            My bids
          </h1>
          <p style={{ margin: 0, color: "var(--ink-500)", fontSize: 14 }}>Track bookings, savings, and provider work in progress.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnGhost}><IconSearch /> Search bids</button>
          <Link href="/app/homeowner/request" style={{ ...btnPrimary, textDecoration: "none" }}><IconPlus /> New request</Link>
        </div>
      </div>

      <div style={{ padding: "0 36px 36px" }}>
        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>{s.eyebrow}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 36, marginTop: 8, color: s.numColor, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.big}</div>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>{s.sub}</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: s.barColor }} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, padding: "0 4px" }}>
          {tabs.map((t) => (
            <button
              key={t.k}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 30, padding: "0 12px", borderRadius: 999,
                fontSize: 13, fontWeight: 600, cursor: "pointer", border: 0,
                background: t.active ? "var(--ink-900)" : "transparent",
                color: t.active ? "white" : "var(--ink-700)",
                fontFamily: "var(--font-body)",
              }}
            >
              {t.label}
              <span
                style={{
                  marginLeft: 2,
                  background: t.active ? "rgba(255,255,255,0.18)" : "var(--cream-200)",
                  color: t.active ? "white" : "var(--ink-500)",
                  fontSize: 11, padding: "1px 7px", borderRadius: 9,
                }}
              >
                {t.n}
              </span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={{ ...btnSmGhost }}>Sort: Recent ↓</button>
        </div>

        {/* Active section */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Active</div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--sage-50)", color: "var(--sage-700)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} /> 2 in progress
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Active bid 1 */}
            <div style={cardStyle}>
              <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 18, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6F8DB8,#3F608E)", display: "grid", placeItems: "center", color: "white" }}>
                  <IconWrench />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--ink-900)" }}>Plumbing leak inspection</div>
                  <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>ProFix Plumbing · 3 neighbors · booked 18m ago</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.02em" }}>$490</div>
                  <div style={{ fontSize: 12, color: "var(--sage-700)", fontWeight: 600, marginTop: 2 }}>−$85 vs solo</div>
                </div>
                <button style={btnSmQuiet}>Track →</button>
              </div>
              <div style={{ padding: "0 24px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--sage-700)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--sage-600)" }} /> In progress
                  </span>
                  <span style={{ color: "var(--ink-500)" }}>35% complete · ETA tomorrow</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "var(--cream-200)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "35%", background: "linear-gradient(90deg, var(--sage-500), var(--sage-700))", borderRadius: 999 }} />
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  {["Booked", "En route", "Inspecting", "Report", "Done"].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1, padding: "6px 8px", borderRadius: 8,
                        background: i <= 1 ? "var(--sage-50)" : "transparent",
                      }}
                    >
                      <div style={{ fontSize: 10, color: i <= 1 ? "var(--sage-700)" : "var(--ink-400)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{s}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 2 }}>{i === 0 ? "18m ago" : i === 1 ? "now" : "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active bid 2 */}
            <div style={cardStyle}>
              <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 18, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#7A9A7E,#4A6A4D)", display: "grid", placeItems: "center", color: "white" }}>
                  <IconLeaf />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--ink-900)" }}>Lawn care bundle</div>
                  <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>GreenThumb Co · 5 neighbors · booked today</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.02em" }}>$275</div>
                  <div style={{ fontSize: 12, color: "var(--sage-700)", fontWeight: 600, marginTop: 2 }}>−$105 vs solo</div>
                </div>
                <button style={btnSmQuiet}>Track →</button>
              </div>
              <div style={{ padding: "0 24px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--sage-700)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--sage-600)" }} /> In progress
                  </span>
                  <span style={{ color: "var(--ink-500)" }}>70% complete · finishing today</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "var(--cream-200)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "70%", background: "linear-gradient(90deg, var(--sage-500), var(--sage-700))", borderRadius: 999 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Completed</div>
            <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--cream-200)", color: "var(--ink-700)", border: "1px solid var(--border-warm)" }}>
              1 awaiting review
            </span>
          </div>
          <div style={{ ...cardStyle, padding: 20, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#B07AA0,#7A4A6E)", display: "grid", placeItems: "center", color: "white" }}>
              <IconBroom />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: "var(--ink-900)" }}>House cleaning</div>
              <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>SparkleClean · April 10 · solo booking</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                {[1,2,3,4,5].map((s) => (
                  <IconStar key={s} />
                ))}
                <span style={{ fontSize: 12, color: "var(--ink-500)", marginLeft: 6 }}>5.0</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.02em" }}>$140</div>
              <button style={btnSmGhost}><IconEdit /> Leave review</button>
            </div>
          </div>
        </div>

        {/* Archived */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Archived</div>
          </div>
          <div style={{ ...cardStyle, padding: "14px 20px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center", opacity: 0.85 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#D6A23E,#B8862B)", display: "grid", placeItems: "center", color: "white" }}>
              <IconBroom />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>Gutter repair</div>
              <div style={{ fontSize: 12, color: "var(--ink-500)" }}>AllWeather Crew · Mar 26</div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--ink-500)", letterSpacing: "-0.02em" }}>$330</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 7. `src/app/app/homeowner/chat/page.tsx` — Full rewrite

Replace entire file with the following TSX, faithfully porting `claude_website_designs/page-chat.jsx`.
The layout is a two-pane split (no top navigation bar): left threads list (320px) + right conversation area.

The page must NOT use `AppPageHeader`. It renders its own internal layout.

```tsx
"use client";

function IconSearch() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
}
function IconSpark() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5L19 9.8 14 11.6 12 17l-1.8-5.4L5 9.8 10.2 8z"/></svg>;
}
function IconPaperclip() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12l-9 9a5 5 0 1 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 1 1-3-3l8-8"/></svg>;
}
function IconSend() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>;
}
function IconStar() {
  return <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none"><path d="M12 2l3 6.5 7 .9-5.1 4.7 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9z"/></svg>;
}

export default function HomeownerChat() {
  const suggestions = [
    "Which bid is best value?",
    "Compare ProFix vs AquaFlow",
    "When should I confirm?",
    "What's a fair price?",
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "calc(100vh - 0px)", overflow: "hidden" }}>
      {/* ── Left: Thread list ── */}
      <div
        style={{
          borderRight: "1px solid var(--border-warm)",
          background: "var(--cream-50)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 20px 14px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink-900)" }}>
              Messages
            </div>
            <span
              style={{
                display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px",
                borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: "var(--terracotta-50)", color: "var(--terracotta-600)",
              }}
            >
              3 new
            </span>
          </div>
          <div
            style={{
              marginTop: 14, height: 36, borderRadius: 12,
              background: "var(--cream-100)", display: "flex", alignItems: "center", gap: 8, padding: "0 12px",
              border: "1px solid transparent",
            }}
          >
            <IconSearch />
            <input
              placeholder="Search neighbors, bids, providers…"
              style={{ border: 0, outline: 0, background: "transparent", fontSize: 13, fontFamily: "var(--font-body)", color: "var(--ink-900)", flex: 1 }}
            />
          </div>
        </div>

        {/* Thread list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px" }}>
          {/* AI assistant */}
          <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600, padding: "10px 8px 6px" }}>
            AI assistant
          </div>
          <div
            style={{
              padding: 12, borderRadius: 12,
              background: "linear-gradient(135deg, white, var(--terracotta-50))",
              border: "1px solid var(--terracotta-100)",
              display: "flex", gap: 10, alignItems: "flex-start",
              boxShadow: "0 0 0 3px rgba(194,85,43,0.05)",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--terracotta-600)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
              <IconSpark />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>NeighBid AI</div>
                <div style={{ fontSize: 11, color: "var(--ink-400)" }}>Just now</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Based on the 3 bids received, ProFix is the best…
              </div>
            </div>
          </div>

          {/* Group bids */}
          <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600, padding: "18px 8px 6px" }}>
            Group bids · 2
          </div>
          {[
            { name: "Plumbing group", initials: "PG", avColor: "linear-gradient(135deg,#6F8DB8,#3F608E)", preview: "Has everyone agreed on ProFix?", time: "8:52 AM", unread: 2 },
            { name: "Lawn care group", initials: "LC", avColor: "linear-gradient(135deg,#7A9A7E,#4A6A4D)", preview: "Great! Once we hit 6 neighbors…", time: "7:32 AM", unread: 0 },
          ].map((t, i) => (
            <div
              key={i}
              style={{ padding: 12, borderRadius: 12, marginTop: 4, display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.avColor, display: "grid", placeItems: "center", color: "white", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                {t.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{t.time}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.preview}</div>
              </div>
              {t.unread > 0 && (
                <span style={{ minWidth: 18, height: 18, padding: "0 6px", borderRadius: 9, background: "var(--terracotta-600)", color: "white", fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center" }}>
                  {t.unread}
                </span>
              )}
            </div>
          ))}

          {/* Providers */}
          <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600, padding: "18px 8px 6px" }}>
            Providers · 1
          </div>
          <div style={{ padding: 12, borderRadius: 12, display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#D6A23E,#B8862B)", display: "grid", placeItems: "center", color: "white", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              PF
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)", display: "flex", alignItems: "center", gap: 6 }}>
                  ProFix Plumbing
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--sage-50)", color: "var(--sage-700)", display: "grid", placeItems: "center" }}>
                    <IconCheck />
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-400)" }}>9:00 AM</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Absolutely — if confirmed today…
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Conversation ── */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "white" }}>
        {/* Conversation header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-warm)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--terracotta-600)", display: "grid", placeItems: "center", color: "white" }}>
            <IconSpark />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink-900)" }}>NeighBid AI</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: "var(--sage-50)", color: "var(--sage-700)", border: "1px solid var(--sage-100)" }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} /> Online
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Bids · providers · savings · group decisions</div>
          </div>
          <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--ink-700)", border: "1px solid var(--border-warm-strong)", fontFamily: "var(--font-body)" }}>
            View bids
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--ink-400)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Today</div>

          {/* AI bubble */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", maxWidth: 640 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--terracotta-600)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
              <IconSpark />
            </div>
            <div>
              <div style={{ background: "var(--cream-100)", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", fontSize: 14, lineHeight: 1.55, color: "var(--ink-900)" }}>
                Hi Lance. I can compare bids, explain ratings, and help you decide when to confirm. What&apos;s on your mind?
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4, marginLeft: 4 }}>now</div>
            </div>
          </div>

          {/* User bubble */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: 480 }}>
              <div style={{ background: "var(--terracotta-600)", color: "white", borderRadius: "18px 18px 4px 18px", padding: "12px 16px", fontSize: 14, lineHeight: 1.5 }}>
                Which bid should I accept for the plumbing inspection?
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4, textAlign: "right" }}>Just now</div>
            </div>
          </div>

          {/* AI rich response */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", maxWidth: 720 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--terracotta-600)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
              <IconSpark />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ background: "white", border: "1px solid var(--border-warm)", borderRadius: "18px 18px 18px 4px", overflow: "hidden", boxShadow: "var(--shadow-warm-sm)" }}>
                <div style={{ padding: "14px 18px 8px", fontSize: 14, lineHeight: 1.55, color: "var(--ink-900)" }}>
                  Based on the 3 bids received, <strong>ProFix Plumbing</strong> is the best choice:
                </div>
                <div style={{ padding: "0 18px 14px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 6 }}>
                    <thead>
                      <tr style={{ color: "var(--ink-400)", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600 }}>Provider</th>
                        <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600 }}>Bid</th>
                        <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600 }}>Rating</th>
                        <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600 }}>ETA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { p: "ProFix Plumbing", b: "$490", r: "4.9", e: "2 days", best: true },
                        { p: "AquaFlow", b: "$530", r: "4.6", e: "4 days", best: false },
                        { p: "PipePro", b: "$575", r: "4.4", e: "3 days", best: false },
                      ].map((row, i) => (
                        <tr key={i} style={{ borderTop: "1px solid var(--border-warm)" }}>
                          <td style={{ padding: "10px 0", fontWeight: 600, color: row.best ? "var(--terracotta-600)" : "var(--ink-900)" }}>
                            {row.p}{" "}
                            {row.best && (
                              <span style={{ display: "inline-flex", alignItems: "center", marginLeft: 4, height: 18, padding: "0 7px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: "var(--sage-50)", color: "var(--sage-700)", border: "1px solid var(--sage-100)" }}>
                                Best
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "var(--font-display)", fontWeight: 500, letterSpacing: "-0.02em" }}>{row.b}</td>
                          <td style={{ padding: "10px 0", textAlign: "right", color: "var(--ink-700)" }}>
                            <IconStar /> {row.r}
                          </td>
                          <td style={{ padding: "10px 0", textAlign: "right", color: "var(--ink-700)" }}>{row.e}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "12px 18px", background: "var(--cream-50)", borderTop: "1px solid var(--border-warm)", fontSize: 13, color: "var(--ink-700)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "var(--terracotta-600)" }}>Recommendation:</span>
                  Accept ProFix — saves $85 vs solo, fastest, highest rated.
                  <div style={{ flex: 1 }} />
                  <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "var(--terracotta-600)", color: "white", border: 0, fontFamily: "var(--font-body)" }}>
                    Accept bid
                  </button>
                  <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--ink-700)", border: "1px solid var(--border-warm-strong)", fontFamily: "var(--font-body)" }}>
                    Compare
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4, marginLeft: 4 }}>just now</div>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div style={{ borderTop: "1px solid var(--border-warm)", padding: "14px 28px 22px", background: "white", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {suggestions.map((s, i) => (
              <button key={i} style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "var(--cream-100)", color: "var(--ink-900)", border: 0, fontFamily: "var(--font-body)" }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 6px 6px 14px", background: "var(--cream-100)", borderRadius: 22, border: "1px solid transparent" }}>
            <IconPaperclip />
            <input
              placeholder="Ask NeighBid AI anything…"
              style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 14, fontFamily: "var(--font-body)", color: "var(--ink-900)", padding: "10px 0" }}
            />
            <button style={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--terracotta-600)", color: "white", border: 0, cursor: "pointer" }}>
              <IconSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 8. `src/app/app/homeowner/profile/page.tsx` — Full rewrite

Replace entire file with the following TSX, faithfully porting `claude_website_designs/page-profile.jsx`:

```tsx
"use client";

function IconEdit() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11z"/><path d="M14 5l2.5 2.5"/></svg>;
}
function IconPin() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
}
function IconShield() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>;
}
function IconStar() {
  return <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none"><path d="M12 2l3 6.5 7 .9-5.1 4.7 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9z"/></svg>;
}
function IconBids() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>;
}
function IconSpark() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5L19 9.8 14 11.6 12 17l-1.8-5.4L5 9.8 10.2 8z"/></svg>;
}
function IconChat() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>;
}
function IconArrowR() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
}

const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-warm)",
  borderRadius: 18,
  boxShadow: "var(--shadow-warm-sm)",
};

const iconbtn = {
  width: 32, height: 32, borderRadius: "50%", border: 0,
  background: "transparent", color: "var(--ink-500)",
  display: "grid" as const, placeItems: "center" as const, cursor: "pointer",
};

export default function HomeownerProfile() {
  const notifRows = [
    { t: "Bid updates", s: "When providers submit or update bids", on: true, ch: ["Email", "Push"] },
    { t: "Group activity", s: "When neighbors join or comment", on: true, ch: ["Push"] },
    { t: "Savings reports", s: "Monthly recap of money saved", on: false, ch: ["Email"] },
  ];

  const quickLinks = [
    { t: "View my bids", s: "Active and past bookings", I: <IconBids />, href: "/app/homeowner/bids" },
    { t: "Savings history", s: "$310 across 4 services", I: <IconSpark />, href: "/app/homeowner/bids" },
    { t: "Neighborhood chat", s: "3 unread messages", I: <IconChat />, href: "/app/homeowner/chat" },
  ];

  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "28px 36px 20px", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 4px", color: "var(--ink-900)" }}>Account</h1>
          <p style={{ margin: 0, color: "var(--ink-500)", fontSize: 14 }}>Profile, neighborhood, notifications.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: "var(--sage-50)", color: "var(--sage-700)", border: "1px solid var(--sage-100)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} /> HOA verified
          </span>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--ink-700)", border: "1px solid var(--border-warm-strong)", fontFamily: "var(--font-body)" }}>
            <IconEdit /> Edit profile
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ padding: "0 36px 36px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Profile header card */}
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ height: 88, background: "linear-gradient(135deg, var(--terracotta-100), var(--cream-200) 60%, var(--sage-100))" }} />
            <div style={{ padding: "0 28px 24px", marginTop: -38 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#E08758,#C2552B)", display: "grid", placeItems: "center", color: "white", fontSize: 24, fontWeight: 600, border: "4px solid white", boxShadow: "var(--shadow-warm-md)", flexShrink: 0 }}>
                  LS
                </div>
                <div style={{ flex: 1, paddingBottom: 6 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink-900)" }}>Lance Silva</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, color: "var(--ink-500)", fontSize: 13 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      {[1,2,3,4].map((s) => <span key={s} style={{ color: "var(--gold-500)" }}><IconStar /></span>)}
                      <span style={{ color: "var(--ink-200)" }}><IconStar /></span>
                      <span style={{ marginLeft: 4 }}>4.0 · 3 bookings</span>
                    </span>
                    <span style={{ color: "var(--ink-300)" }}>·</span>
                    <span>Member since Nov 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div style={cardStyle}>
            <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Personal information</div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--ink-700)", border: "1px solid var(--border-warm-strong)", fontFamily: "var(--font-body)" }}>
                Edit all
              </button>
            </div>
            <div style={{ height: 1, background: "var(--border-warm)" }} />
            {[
              { k: "Full name", v: "Lance Silva" },
              { k: "Email", v: "lance@email.com" },
              { k: "Phone", v: "+1 (215) 555-0192" },
            ].map((row, i) => (
              <div key={i} style={{ padding: "14px 24px", display: "grid", gridTemplateColumns: "160px 1fr auto", alignItems: "center", borderBottom: i < 2 ? "1px solid var(--border-warm)" : 0 }}>
                <div style={{ fontSize: 13, color: "var(--ink-500)" }}>{row.k}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-900)" }}>{row.v}</div>
                <button style={iconbtn}><IconEdit /></button>
              </div>
            ))}
          </div>

          {/* Service area */}
          <div style={cardStyle}>
            <div style={{ padding: "20px 24px 12px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Service area</div>
            </div>
            <div style={{ height: 1, background: "var(--border-warm)" }} />
            <div style={{ padding: "18px 24px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ color: "var(--terracotta-600)" }}><IconPin /></span>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>123 Maple St, Oakwood Heights</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 16 }}>Used to match local providers and neighbor groups.</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Community radius</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--terracotta-600)" }}>8 mi</div>
                </div>
                <div style={{ position: "relative", height: 6, background: "var(--cream-200)", borderRadius: 999 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "55%", background: "var(--terracotta-500)", borderRadius: 999 }} />
                  <div style={{ position: "absolute", left: "55%", top: -5, width: 16, height: 16, background: "white", border: "3px solid var(--terracotta-600)", borderRadius: "50%", transform: "translateX(-50%)" }} />
                </div>
              </div>
              {/* Decorative map */}
              <div style={{ position: "relative", height: 140, borderRadius: 14, overflow: "hidden", background: "var(--sage-50)" }}>
                <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="none">
                  <rect width="200" height="140" fill="#EBF1EC" />
                  <path d="M0 60 L60 50 L100 70 L160 55 L200 65 L200 80 L0 80 Z" fill="#DCE7DD" />
                  <path d="M20 100 L80 90 L130 110 L200 100 L200 140 L0 140 Z" fill="#C9DBCB" />
                  <path d="M0 30 H200" stroke="#B5C9B7" strokeWidth="0.6" strokeDasharray="2 3" />
                  <circle cx="100" cy="70" r="38" fill="rgba(194,85,43,0.10)" stroke="rgba(194,85,43,0.4)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="100" cy="70" r="6" fill="#C2552B" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div style={cardStyle}>
            <div style={{ padding: "20px 24px 12px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Notifications</div>
            </div>
            <div style={{ height: 1, background: "var(--border-warm)" }} />
            {notifRows.map((n, i) => (
              <div key={i} style={{ padding: "14px 24px", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center", borderBottom: i < 2 ? "1px solid var(--border-warm)" : 0 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{n.t}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{n.s}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {n.ch.map((c) => (
                    <span key={c} style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: "var(--cream-100)", color: "var(--ink-700)", border: "1px solid var(--border-warm)" }}>
                      {c}
                    </span>
                  ))}
                </div>
                <div style={{ width: 38, height: 22, borderRadius: 11, background: n.on ? "var(--sage-600)" : "var(--cream-300)", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: n.on ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.15s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Impact */}
          <div style={{ background: "linear-gradient(160deg, var(--cream-100), var(--cream-200))", borderRadius: 22, padding: 24, border: "1px solid var(--border-warm)" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Your impact</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
              {[
                { num: "$310", label: "Saved", color: "var(--terracotta-600)" },
                { num: "7", label: "Neighbors", color: "var(--ink-900)" },
                { num: "3", label: "Active bids", color: "var(--ink-900)" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28, color: s.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--sage-50)", color: "var(--sage-700)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <IconShield />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink-900)" }}>HOA verified</div>
                <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Oakwood Heights · 14 months</div>
              </div>
              <span style={{ color: "var(--sage-700)" }}><IconCheck /></span>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ ...cardStyle, padding: "20px 22px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600, marginBottom: 10 }}>Quick links</div>
            {quickLinks.map((l, i) => (
              <a
                key={i}
                href={l.href}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--border-warm)" : "0", textDecoration: "none", color: "var(--ink-900)" }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--cream-100)", color: "var(--terracotta-600)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {l.I}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{l.t}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{l.s}</div>
                </div>
                <span style={{ color: "var(--ink-400)" }}><IconArrowR /></span>
              </a>
            ))}
          </div>

          {/* Sign out */}
          <div style={{ ...cardStyle, padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink-900)" }}>Sign out</div>
              <div style={{ fontSize: 11, color: "var(--ink-500)" }}>End session on this device</div>
            </div>
            <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--danger-600)", border: "1px solid rgba(182,68,48,0.3)", fontFamily: "var(--font-body)" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] Sidebar background is warm dark `#221C16` (not Slate-900 `#0f172a`)
- [ ] Active sidebar item has terracotta fill background + left 3px terracotta border
- [ ] Neighborhood card visible in sidebar when role is homeowner
- [ ] Canvas background is `#FBF7F1` cream on all homeowner pages
- [ ] Body font is Plus Jakarta Sans
- [ ] Dashboard hero card is dark gradient with live bidding, $490 best bid, savings
- [ ] Dashboard has two-column layout (active requests + pulse left, savings + AI + HOA right)
- [ ] Bids page has 4-stat strip, filter tabs, active/completed/archived sections
- [ ] Chat page is full two-pane (no AppPageHeader), AI rich comparison table renders
- [ ] Profile page has header banner card, personal info, service area map SVG, notification toggles
- [ ] TypeScript passes `tsc --noEmit` with zero errors

## Out of Scope

- Provider pages
- Admin pages
- Landing page
- Real data / API wiring
- Mobile app

## Test Steps

1. `npm run dev` from project root
2. Navigate to `/app/homeowner/dashboard` — verify hero, two-column layout, warm palette
3. Navigate to `/app/homeowner/bids` — verify stats strip, bid cards with progress bars
4. Navigate to `/app/homeowner/chat` — verify two-pane layout, AI chat, composer
5. Navigate to `/app/homeowner/profile` — verify profile banner, service area map, toggles
6. Check sidebar: warm dark, terracotta active, neighborhood card
7. Run `tsc --noEmit` — must pass

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-04-30 | Approved | Spec written by Claude, delegated to Codex |
| 2026-04-30 | Completed | Codex implemented all 8 files. tsc --noEmit passes. Playwright review passed all 4 pages. |
