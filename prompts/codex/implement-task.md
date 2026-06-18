# Codex Implementation Prompt

Use this after Claude creates a task file.

```text
Read CLAUDE.md, .codex/instructions.md, and the task file below:

docs/tasks/<TASK_FILE>.md

Implement only this approved task.

Rules:
- Keep changes minimal and modular.
- Do not implement unapproved features.
- Use mock data for now.
- Do not add real AI/database/auth/WebSocket/notification/payment integrations.
- Make the website responsive for laptop and mobile browsers.
- Run available build/test/lint commands.
- Summarize changed files, commands run, and anything not completed.
```
