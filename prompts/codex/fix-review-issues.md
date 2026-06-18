# Codex Fix Review Issues Prompt

```text
Read the Claude review file below:

docs/reviews/<REVIEW_FILE>.md

Fix only the required issues listed by Claude.

Rules:
- Do not redesign unrelated parts.
- Do not add new unapproved features.
- Preserve working behavior.
- Run available build/test/lint commands.
- Summarize fixes and files changed.
```
