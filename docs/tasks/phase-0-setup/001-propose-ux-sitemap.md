# Task 001 — Claude Proposes UX Sitemap

**Status:** Completed

## Owner

Claude Code only.

## Goal

Claude should inspect the product docs and propose the initial website sitemap, pages, workflows, and development order.

## Important

Claude must not code this task.

Claude must ask the user:

```text
Should I start with this task?
```

before creating or finalizing the sitemap.

## Expected Output

Create:

```text
docs/01-design-ux/claude-proposed-sitemap.md
docs/decision-log/001-initial-ux-direction.md
```

## Acceptance Criteria

- [x] Defines public website pages
- [x] Defines homeowner workflow pages
- [x] Defines provider workflow pages
- [x] Defines HOA admin preview pages
- [x] Defines responsive navigation approach
- [x] Defines first 5 implementation tasks for Codex
- [x] Clearly states what is out of scope

---

## Task Update Log

### 2026-04-24 — Completed

- **Status:** Completed
- **What Claude did:** Read all product docs and proposed full sitemap, navigation architecture, page hierarchy for all three roles, responsive behavior table, AI placeholder UX, and first 5 Codex task sequence.
- **Files created:**
  - `docs/01-design-ux/claude-proposed-sitemap.md`
  - `docs/decision-log/001-initial-ux-direction.md`
- **Key decisions:** Sidebar + bottom nav pattern; single `/get-started` entry; AI as inline placeholder; Next.js + Tailwind recommended for Task 002.
- **Next task:** Task 002 — Frontend Foundation (pending user approval).
