# Manual Workflow Script

## 1. Start Claude

```bash
claude
```

Then paste:

```text
Read CLAUDE.md.
Act as senior advisor only.
Plan NeighBid as a responsive website, not a native app.
On mobile, follow the app-like reference screenshots with bottom tab navigation where appropriate so it feels like an app inside the browser.
What is the next best task for NeighBid?
Before starting, ask me: "Should I start with this task?"
```

## 2. After Claude Creates Task

Run Codex:

```bash
codex "Read CLAUDE.md, .codex/instructions.md, and docs/tasks/<task>.md. Implement only this task."
```

## 3. After Codex Finishes

Ask Claude:

```text
Review the Codex implementation for docs/tasks/<task>.md.
Use Playwright to open the local UI and test the main task flow in desktop and mobile viewports.
Do not code.
Create docs/reviews/<task>-review.md.
```

## 4. If Fixes Needed

Run Codex:

```bash
codex "Read docs/reviews/<review>.md and fix only the required issues."
```
