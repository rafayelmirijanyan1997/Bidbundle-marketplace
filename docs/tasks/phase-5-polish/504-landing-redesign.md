# Task 504 — Landing Page Redesign

**Status:** Completed

## Owner
Codex, after Claude approval.

## Goal
Replace the current landing page (built from Navbar + Splash + HowItWorks + Footer
components) with a new self-contained design that faithfully ports
`claude_website_designs/NeighBid Landing.html` into Next.js.

## Why This Task Comes Now
Tasks 502 and 503 redesigned all homeowner and provider app pages with the warm palette.
The landing page still uses the old dark-navy hero design. The HTML file provides the
complete new design: cream background, Instrument Serif display font, terracotta accent,
7 sections, live bid card, and a smooth bid-rotation animation.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/app/layout.tsx` | Add Instrument_Serif as `--font-serif` variable |
| `src/app/landing.css` | CREATE — all landing-specific CSS from the HTML file |
| `src/app/page.tsx` | Full rewrite — single Server Component using the new CSS |
| `src/components/marketing/LandingAnimations.tsx` | CREATE — `"use client"` for bid rotation + smooth scroll |

**Do NOT modify** any existing marketing components (Splash.tsx, HowItWorks.tsx,
Footer.tsx, Navbar.tsx) — they just become unused, leave them in place.

---

## Step 1 — `src/app/layout.tsx`: Add Instrument Serif

Add `Instrument_Serif` alongside the existing fonts:

```tsx
import { Fraunces, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
  weight: "400",
});
```

Add `${instrumentSerif.variable}` to the `<html>` className alongside the other font variables.

---

## Step 2 — `src/app/landing.css`: Landing CSS

Create this file and import it in `page.tsx` via `import "./landing.css"`.

Copy the ENTIRE `<style>` block from `claude_website_designs/NeighBid Landing.html`
(lines 10–418) verbatim, with these three small Next.js adaptations:
- Remove the outer `<style>` and `</style>` tags (it's a plain CSS file now)
- Add at the very top: `:root { --font-serif-family: var(--font-serif, 'Instrument Serif', serif); }`
- Replace every `font-family:'Instrument Serif',serif` with `font-family: var(--font-serif-family)`
- Replace every `font-family:'Inter',system-ui,sans-serif` in `body {}` with `font-family: var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif)`

Everything else in the CSS stays exactly as written in the HTML file.

---

## Step 3 — `src/app/page.tsx`: Full rewrite

Replace the entire file with a Server Component that:
1. Imports `"./landing.css"` at the top
2. Imports `Link` from `"next/link"`
3. Imports `LandingAnimations` from `"@/components/marketing/LandingAnimations"`
4. Renders the full HTML body structure from `NeighBid Landing.html` translated to JSX

**Critical JSX translation rules:**
- `class=` → `className=`
- `stroke-width=` → `strokeWidth=`
- `stroke-linecap=` → `strokeLinecap=`
- `stroke-linejoin=` → `strokeLinejoin=`
- `stop-color=` → `stopColor=`
- `stop-opacity=` → `stopOpacity=`
- `fill-opacity=` → `fillOpacity=`
- `preserveAspectRatio=` → `preserveAspectRatio=` (already camelCase-safe, keep as string)
- `<br>` → `<br />`
- `href="#"` on nav/footer links → keep as `href="#"` (they are anchor/section links)
- `href="#how"` etc. → keep as-is (in-page anchor links)
- HTML comment `<!-- ... -->` → `{/* ... */}`
- `&amp;` → `&amp;` (keep HTML entity in JSX strings) OR use `{"&"}`
- `<button>` with `onClick` — the animation buttons are handled by `LandingAnimations`

**Link substitutions (use `<Link>` from next/link for these only):**
- "Get started free" buttons and "Join your neighborhood" button → `<Link href="/get-started" ...>`
- "Sign in" link → `<Link href="/get-started" ...>`
- Brand logo link (`<a class="brand" href="#">`) → `<Link href="/" ...>`
- Footer brand link → `<Link href="/" ...>`

All other `href="#"` and `href="#section-id"` links stay as plain `<a>` tags.

**Remove the `<script>` block entirely** — that logic moves to `LandingAnimations`.

**Add `<LandingAnimations />` as the last child inside the outermost `<div>`** (or directly before `</main>` — just ensure it renders on the page).

The page structure (JSX outline):

```tsx
import "./landing.css";
import Link from "next/link";
import { LandingAnimations } from "@/components/marketing/LandingAnimations";

export default function HomePage() {
  return (
    <div>
      {/* NAV */}
      <nav className="top">...</nav>

      {/* HERO */}
      <section className="hero">...</section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">...</section>

      {/* ROLES */}
      <section className="roles" id="roles">...</section>

      {/* DASHBOARD PREVIEW / SAVINGS */}
      <section className="preview" id="savings">...</section>

      {/* NEIGHBORHOOD PULSE */}
      <section className="pulse" id="pulse">...</section>

      {/* FINAL CTA */}
      <section className="final">...</section>

      {/* FOOTER */}
      <footer>...</footer>

      <LandingAnimations />
    </div>
  );
}
```

Translate EVERY element from the HTML body faithfully — all classes, all inline
styles, all SVG paths, all text content. Do not omit or simplify any section.

---

## Step 4 — `src/components/marketing/LandingAnimations.tsx`: Client animations

```tsx
"use client";

import { useEffect } from "react";

export function LandingAnimations() {
  useEffect(() => {
    // Smooth scroll for anchor links
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const handleClick = (e: MouseEvent) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: (target as HTMLElement).offsetTop - 60, behavior: "smooth" });
        }
      }
    };
    links.forEach((a) => a.addEventListener("click", handleClick));

    // Bid row rotation animation
    const rows = document.querySelectorAll<HTMLElement>(".bid-row");
    const bestTag = document.querySelector<HTMLElement>(".best-tag");
    let idx = 0;
    const interval = setInterval(() => {
      rows.forEach((r) => r.classList.remove("best"));
      if (rows[idx]) {
        rows[idx].classList.add("best");
        if (bestTag) {
          const nameEl = rows[idx].querySelector(".br-name");
          if (nameEl && !nameEl.contains(bestTag)) nameEl.appendChild(bestTag);
        }
      }
      idx = (idx + 1) % rows.length;
    }, 3200);

    return () => {
      clearInterval(interval);
      links.forEach((a) => a.removeEventListener("click", handleClick));
    };
  }, []);

  return null;
}
```

---

## Acceptance Criteria

- [ ] Landing page at `localhost:3000/` shows cream `#F6F1EA` background (not dark navy)
- [ ] Hero title "Bid together, / save together." in Instrument Serif italic
- [ ] Live bid card (dark panel) is present with 3 bid rows and floating notification
- [ ] Bid rotation animation cycles the "best" highlight every 3.2 seconds
- [ ] How it works: 3 steps with numbered circles and dark stats strip
- [ ] Roles section: 3 cards (Homeowner / Service Provider / HOA Admin) on white bg
- [ ] Dashboard preview section has dark ink bg, savings chart bars, AI card
- [ ] Neighborhood pulse section: activity feed + copy + stats
- [ ] Final CTA section: dark bg, "Stop overpaying" headline
- [ ] Footer: 4-column dark footer with product/platform/company links
- [ ] "Get started free" buttons link to `/get-started`
- [ ] "Sign in" links to `/get-started`
- [ ] `tsc --noEmit` passes with zero errors

## Out of Scope
- App pages (already done in 502/503)
- Mobile responsiveness beyond what the HTML CSS already provides
- Real backend wiring

## Test Steps
1. `npm run dev`
2. Open `localhost:3000/` — verify cream bg, hero, all 7 sections
3. Watch bid row animation cycle
4. Click "Get started free" — should navigate to `/get-started`
5. Run `tsc --noEmit`

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-04-30 | Approved | Spec written by Claude, delegated to Codex |
| 2026-04-30 | Completed | Codex implemented all 4 files. tsc --noEmit passes. Playwright review passed all sections. |
