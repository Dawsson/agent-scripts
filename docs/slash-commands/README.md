---
summary: 'Index of slash commands and where they live.'
read_when:
  - Auditing or updating slash command docs.
---
# Slash Commands

Slash commands are reusable prompt templates. They live in `.claude/commands/` (repo-local) or `~/.claude/commands/` (global). This folder documents all available commands.

## Available commands
- `/acceptpr` — Land one PR end-to-end (changelog + thanks, lint, merge, back to main).
- `/fixissue` — Fix an issue end-to-end (tests, changelog, commit, push, comment, close).
- `/handoff` — Capture current state for the next agent (running sessions, tmux targets, blockers, next steps).
- `/landpr` — Land PR via temp-branch rebase + full gate before commit; merge via `gh pr merge` and verify `MERGED`.
- `/pickup` — Rehydrate context when starting work (status, tmux sessions, CI/PR state).
- `/raise` — If changelog is released, open next patch `Unreleased` section (commit + push `CHANGELOG.md`).

See the individual files in this directory for details.
