# Claude Review Prompt

```text
Review the Codex implementation for the latest approved task.

Do not implement fixes directly.

Use Playwright to open the local UI after Codex finishes.
Check the main flow for the task in desktop and mobile-sized viewports before writing the review file.

Check:
1. task requirements
2. acceptance criteria
3. Playwright UI/browser behavior
4. responsive behavior
5. UX clarity
6. code quality
7. mock-data boundaries
8. accidental backend/AI/database overbuild

Create a review file under docs/reviews/.
Include the Playwright UI findings in the review file.

End with:
- Required Codex fixes
- Optional improvements
- Whether the task is accepted or needs another Codex pass
```
