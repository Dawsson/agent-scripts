# Agent Scripts

Dawson's agent orchestration hub. Canonical config for AI coding agents (Claude Code, Codex) across all projects.

## What's Here

- **`AGENTS.md`** — Main agent config: stack, tools, git rules, hotline integration, multi-agent safety.
- **`CLAUDE.md`** — Symlink to `AGENTS.md` (Claude Code reads this automatically).
- **`tools.md`** — Full tool catalog (committer, peekaboo, hotline, agent-device, etc.).
- **`scripts/`** — Portable helper scripts (committer, issues CLI, browser-tools, docs-list).
- **`skills/`** — Reusable skill definitions for AI agents.
- **`docs/`** — Workflow docs (releasing, subagents, slash commands).
- **`.claude/commands/`** — Slash command prompts for Claude Code.
- **`.issues/`** — File-based issue tracker.

## Stack

TypeScript everywhere. Bun runtime. Expo/React Native for mobile. Next.js for web. Hono + ORPC on Cloudflare Workers. Turborepo monorepos. Drizzle ORM.

## Key Scripts

```bash
# Commit helper (stages only listed files, blocks ".")
scripts/committer "feat: add feature" file1.ts file2.ts

# Issue tracker
bun scripts/issues.ts create "Add dark mode"
bun scripts/issues.ts list
bun scripts/issues.ts status 001 in_progress

# Docs lister
bun scripts/docs-list.ts
# or compiled: bin/docs-list

# Browser tools
bun scripts/browser-tools.ts --help
# or compiled: bin/browser-tools
```

## Pointer-Style AGENTS

Other repos reference this config with a pointer line in their `CLAUDE.md`:
```
READ ~/projects/agent-scripts/AGENTS.md BEFORE ANYTHING (skip if missing).
```

Repo-specific rules go after the pointer line.

## Syncing

This repo is the canonical source for shared agent helpers. When editing `scripts/committer` or `scripts/docs-list.ts` in any repo, sync the change back here.
