# Task 505 — Landing Page UX Polish

**Status:** Completed

## Owner
Codex, after Claude approval.

## Goal
Fix three UX issues identified in the Task 504 audit:
1. Body font is Plus Jakarta Sans — should be Inter (design spec)
2. No scroll-reveal animations — every section pops in flatly
3. Hero bottom padding too large — 80px creates a dead-space gap before "How it works"

---

## Files to Modify

| File | Action |
|------|--------|
| `src/app/layout.tsx` | Add Inter font as `--font-inter` CSS variable |
| `src/app/landing.css` | Override body font to Inter; fix hero padding; add reveal base styles |
| `src/components/marketing/LandingAnimations.tsx` | Add IntersectionObserver scroll reveal + bar chart animation |

No other files touch.

---

## Change 1 — `src/app/layout.tsx`: Add Inter

Add `Inter` from `next/font/google` alongside the existing fonts:

```tsx
import { Fraunces, Instrument_Serif, Plus_Jakarta_Sans, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
```

Add `${inter.variable}` to the `<html>` className.

---

## Change 2 — `src/app/landing.css`: Three targeted edits

### 2a — Fix body font (line ~32)

Find the current body font line:
```css
font-family: var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif);
```
Replace with:
```css
font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
```
This scopes Inter to the landing page only. App pages keep Plus Jakarta Sans via their own `--font-body` token.

### 2b — Fix hero bottom padding (line ~88)

Find:
```css
.hero{padding:72px 0 80px;position:relative;overflow:hidden}
```
Replace with:
```css
.hero{padding:72px 0 40px;position:relative;overflow:hidden}
```

### 2c — Add scroll reveal base styles

Append these rules at the very end of the file (before any existing `@media` blocks at the bottom, or after them — just add at the end):

```css
/* ---------- scroll reveal ---------- */
.sr {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.sr.sr-visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## Change 3 — `src/components/marketing/LandingAnimations.tsx`: Full rewrite

Replace the entire file with the following. Keep the smooth-scroll and bid-rotation logic from the original, and add IntersectionObserver scroll reveal + bar chart entrance animation:

```tsx
"use client";

import { useEffect } from "react";

export function LandingAnimations() {
  useEffect(() => {
    /* ── 1. Smooth scroll ── */
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const handleClick = (e: MouseEvent) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: (target as HTMLElement).offsetTop - 60,
            behavior: "smooth",
          });
        }
      }
    };
    links.forEach((a) => a.addEventListener("click", handleClick));

    /* ── 2. Bid row rotation ── */
    const rows = document.querySelectorAll<HTMLElement>(".bid-row");
    const bestTag = document.querySelector<HTMLElement>(".best-tag");
    let idx = 0;
    const bidInterval = setInterval(() => {
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

    /* ── 3. Scroll reveal setup ── */
    // Elements to reveal — with optional stagger delay (ms per sibling index)
    const revealTargets: { selector: string; stagger: number }[] = [
      { selector: ".how .sec-head",       stagger: 0   },
      { selector: ".step",                stagger: 90  },
      { selector: ".how-strip",           stagger: 0   },
      { selector: ".roles .sec-head",     stagger: 0   },
      { selector: ".role",                stagger: 100 },
      { selector: ".preview .sec-head",   stagger: 0   },
      { selector: ".savings-card",        stagger: 0   },
      { selector: ".ai-card",             stagger: 0   },
      { selector: ".verified",            stagger: 120 },
      { selector: ".pulse .sec-eye",      stagger: 0   },
      { selector: ".pulse-list",          stagger: 0   },
      { selector: ".pl-row",              stagger: 70  },
      { selector: ".pulse-copy h2",       stagger: 0   },
      { selector: ".pulse-copy p",        stagger: 80  },
      { selector: ".pulse-copy .btn",     stagger: 160 },
      { selector: ".pulse-meta > div",    stagger: 80  },
      { selector: ".final .sec-eye",      stagger: 0   },
      { selector: ".final .sec-title",    stagger: 60  },
      { selector: ".final .lead",         stagger: 120 },
      { selector: ".final .ctas",         stagger: 180 },
    ];

    const allRevealEls: { el: HTMLElement; delay: number }[] = [];

    revealTargets.forEach(({ selector, stagger }) => {
      const els = document.querySelectorAll<HTMLElement>(selector);
      els.forEach((el, i) => {
        const delay = stagger > 0 ? i * stagger : 0;
        el.classList.add("sr");
        el.style.transitionDelay = `${delay}ms`;
        allRevealEls.push({ el, delay });
      });
    });

    /* ── 4. Bar chart — store heights then reset to 0 ── */
    const bars = document.querySelectorAll<HTMLElement>(".chart .bar");
    const originalHeights: string[] = [];
    bars.forEach((bar) => {
      originalHeights.push(bar.style.height);
      bar.style.height = "0%";
      bar.style.transition = "height 0.65s cubic-bezier(0.16, 1, 0.3, 1)";
    });

    /* ── 5. IntersectionObserver for reveal ── */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("sr-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    allRevealEls.forEach(({ el }) => revealObserver.observe(el));

    /* ── 6. Bar chart observer ── */
    const chart = document.querySelector<HTMLElement>(".chart");
    if (chart) {
      const barObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            bars.forEach((bar, i) => {
              setTimeout(() => {
                bar.style.height = originalHeights[i] ?? "0%";
              }, i * 80);
            });
            barObserver.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      barObserver.observe(chart);
    }

    return () => {
      clearInterval(bidInterval);
      links.forEach((a) => a.removeEventListener("click", handleClick));
      revealObserver.disconnect();
    };
  }, []);

  return null;
}
```

---

## How the scroll reveal works

- `LandingAnimations` runs after mount (client-side only)
- It finds all target elements and adds the `.sr` class (opacity:0, translateY:26px)
- An `IntersectionObserver` watches each element — when it enters the viewport it adds `.sr-visible` (opacity:1, translateY:0) and stops watching it
- Stagger: sibling elements within the same selector get a transition-delay of `index × staggerMs`
- The bar chart is handled separately: heights are read, reset to 0, then restored with a staggered `setTimeout` when the chart enters view
- Hero elements are NOT in the revealTargets list — they're above the fold and appear immediately

---

## Acceptance Criteria

- [ ] Body text on landing page uses Inter (not Plus Jakarta Sans) — check nav links, hero sub, step descriptions
- [ ] Hero bottom gap is reduced — "How it works" section starts closer to the hero stats
- [ ] Scrolling down: "How it works" heading fades up as it enters view
- [ ] Step cards stagger in one by one (90ms apart) as section enters view
- [ ] Role cards stagger in (100ms apart)
- [ ] Savings bar chart bars grow upward from 0 when the preview section enters view
- [ ] Neighborhood pulse rows slide in sequentially
- [ ] Final CTA elements animate in on scroll
- [ ] Bid row rotation still cycles every 3.2 seconds ✅ (must not regress)
- [ ] Smooth scroll on nav links still works ✅
- [ ] `tsc --noEmit` passes with zero errors

## Out of Scope
- App pages (homeowner/provider) — untouched
- Stat number count-up animation (too complex for this pass)
- Mobile responsiveness changes
- Any new sections or copy changes

## Test Steps
1. `npm run dev` from project root
2. Open `localhost:3000/` — check Inter font on body text vs Instrument Serif on headings
3. Scroll slowly through the page — verify each section fades/slides in
4. Watch the savings bar chart animate upward when it enters view
5. Pulse rows should stagger in left-to-right
6. Final CTA should fade up as you reach it
7. `tsc --noEmit`

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-06 | Approved | Spec written by Claude after UX audit of Task 504 output |
| 2026-05-06 | Completed | Codex implemented all 3 changes. tsc clean. Playwright confirmed Inter loading, .sr classes applied, bars at 0%, hero gap reduced. |
