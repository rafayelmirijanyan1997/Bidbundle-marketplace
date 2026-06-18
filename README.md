# NeighBid Claude + Codex Starter

This starter directory is for building **NeighBid** as a responsive website first, not a native mobile app.

The workflow is:

1. **Claude Code acts as senior advisor, product architect, UX planner, and reviewer.**
2. **Codex writes the actual code.**
3. Claude creates one task at a time.
4. Before each task starts, Claude must ask the user: **"Should I start with this task?"**
5. Codex implements only the approved task.
6. Claude reviews the Codex output with a Playwright UI check before moving to the next task.

## Product Direction

NeighBid is a neighbourhood service bidding platform where homeowners can group together for services, trigger competitive bids from local providers, and save money through collective bargaining.

Initial goal:

- Build the website UI/UX first.
- Make it work on laptop browsers and mobile browsers.
- Make mobile screens feel like an app, using bottom tab navigation and app-style flows from the design references.
- Add placeholders/provisions for AI, database, authentication, real-time bidding, and notifications.
- Do not build production AI/database features until later phases.

## Recommended Workflow

```text
User gives product idea
      ↓
Claude decides UX, pages, workflows, and task order
      ↓
Claude asks: "Should I start with this task?"
      ↓
User approves
      ↓
Claude writes Codex-ready task spec
      ↓
Codex implements code
      ↓
Claude reviews implementation
      ↓
Codex fixes review issues
      ↓
Repeat
```

## Start Here in Claude Code

Open this folder in Claude Code and say:

```text
Read CLAUDE.md and docs/03-phases/phase-roadmap.md.
Act as senior advisor only.
Decide the first task for NeighBid.
Before writing any implementation task, ask me: "Should I start with this task?"
```

## Claude Local Development Setup

This repo now includes shared Claude Code project config for local development:

- `.claude/settings.json` enables the project-scoped `playwright` MCP server and common local dev commands.
- `.claude/settings.local.json` is for personal machine-specific command allowances and is ignored by git.
- `.mcp.json` registers the official Playwright MCP server using `npx @playwright/mcp@latest`.

If Playwright MCP has not been used on your machine before, Claude Code may need to download the package on first use.

## Start Here in Codex

After Claude creates a task file, run Codex with:

```bash
codex "Read CLAUDE.md and docs/tasks/<task-file>.md. Implement only this task. Make minimal clean changes. Do not build future AI/database features yet."
```
