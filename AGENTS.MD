# AGENTS.md

Dawson owns this. Start: say hi + 1 motivating line.
Work style: telegraph; noun-phrases ok; drop grammar; min tokens.

## Agent Protocol
- Contact: Dawson (hello@dawson.gg).
- Workspace: `~/projects`. Missing repo: clone from GitHub.
- 3rd-party/OSS: clone under `~/projects/oss`.
- Files: repo or `~/projects/agent-scripts`.
- PRs: use `gh pr view/diff` (no URLs).
- "Make a note" => edit AGENTS.md (shortcut; not a blocker).
- Guardrails: use `trash` for deletes.
- Need upstream file: stage in `/tmp/`, then cherry-pick; never overwrite tracked.
- Bugs: add regression test when it fits.
- Keep files <~500 LOC; split/refactor as needed.
- Commits: Conventional Commits (`feat|fix|refactor|build|ci|chore|docs|style|perf|test`).
- Subagents: read `docs/subagent.md`.
- CI: `gh run list/view` (rerun/fix til green).
- Prefer end-to-end verify; if blocked, say what's missing.
- New deps: quick health check (recent releases/commits, adoption).
- Slash cmds: `.claude/commands/` (repo-local) or `~/.claude/commands/` (global).
- Web: search early; quote exact errors; prefer 2025–2026 sources.
- Oracle: run `npx -y @steipete/oracle --help` once/session before first use.
- Style: telegraph. Drop filler/grammar. Min tokens (global AGENTS + replies).

## Defaults
- **Package manager**: `bun` — always. Never `npm`, `pnpm`, `yarn`.
- **Language**: TypeScript (unless repo says otherwise).
- **Agent runtime**: Claude Code (primary), Codex (secondary).
- Follow each repo's own stack/framework choices — don't assume.

## Hotline (Dev Bridge)
Port 8675, runs via launchd. WebSocket bridge between agents and running React Native apps.

```bash
hotline cmd <type> --key value       # send command with inline args
hotline wait <event>                 # block until app emits event, print payload, exit
hotline wait-for-app [appId]         # block until an app connects (use after hot reload)
hotline watch                        # interactive TUI for browsing app commands
hotline query <key>                  # shorthand for get-state
```

Apps emit events: `hotline.emit("navigation", { screen })` — agents can `hotline wait navigation` to block until it fires.

### Agent Automation Pattern
After writing code that triggers a hot reload:
```bash
hotline wait-for-app                    # block until app reconnects
hotline wait error --timeout 3000 || true  # check for crashes (timeout = no crash)
hotline cmd get-state --key <key>       # verify state
```

## Screenshots ("use a screenshot")
- Pick newest PNG in `~/Desktop` or `~/Downloads`.
- Verify it's the right UI (ignore filename).
- Size: `sips -g pixelWidth -g pixelHeight <file>` (prefer 2x).
- Optimize: `imageoptim <file>` (install: `brew install imageoptim-cli`).
- Replace asset; keep dimensions; commit; run gate; verify CI.

## Docs
- Start: run docs list (`bin/docs-list` if present; ignore if not installed); open docs before coding.
- Follow links until domain makes sense; honor `read_when` hints.
- Keep notes short; update docs when behavior/API changes (no ship w/o docs).
- Add `read_when` hints on cross-cutting docs.

## PR Feedback
- Active PR: `gh pr view --json number,title,url --jq '"PR #\(.number): \(.title)\n\(.url)"'`.
- PR comments: `gh pr view …` + `gh api …/comments --paginate`.
- Replies: cite fix + file/line; resolve threads only after fix lands.
- When merging a PR: thank the contributor in `CHANGELOG.md`.

## Flow & Runtime
- Use repo's package manager/runtime (Bun); no swaps w/o approval.
- Never start dev servers — API (3001) and Web (3000) already running.
- tmux for interactive/persistent (debugger/server). See `docs/subagent.md`.

## Build / Test
- Before handoff: run full gate (lint/typecheck/tests).
- CI red: `gh run list/view`, rerun, fix, push, repeat til green.
- Keep it observable (logs, panes, tails, MCP/browser tools).
- Release: read `docs/RELEASING.md`.

## Git
- Safe by default: `git status/diff/log`. Push only when user asks.
- `git checkout` ok for PR review / explicit request.
- Branch changes require user consent.
- Destructive ops forbidden unless explicit (`reset --hard`, `clean`, `restore`, `rm`, …).
- **NEVER use raw `git add` or `git commit`**. Always use `committer "message" file1 file2`. It enforces explicit file listing and prevents staging the entire repo. If repo has `./scripts/committer`, use that; otherwise use the one on PATH.
- Don't delete/rename unexpected stuff; stop + ask.
- No repo-wide S/R scripts; keep edits small/reviewable.
- Avoid manual `git stash`; if Git auto-stashes during pull/rebase, that's fine.
- If user types a command ("pull and push"), that's consent for that command.
- No amend unless asked.
- Big review: `git --no-pager diff --color=never`.
- Multi-agent: check `git status/diff` before edits; ship small commits.
- Commit as you go — after completing a meaningful unit of work, commit it.
- Never push unless explicitly asked.

## Critical Thinking
- Fix root cause (not band-aid).
- Unsure: read more code; if still stuck, ask w/ short options.
- Conflicts: call out; pick safer path.
- Unrecognized changes: assume other agent; keep going; focus your changes. If causes issues, stop + ask user.

## Multi-Agent Safety
- Check `git status/diff` before edits.
- Ship small, focused commits with specific file paths (never `git add .`).
- If you see uncommitted changes you didn't make, another agent is working — leave them alone.
- All commits go through `committer` — no exceptions.
- Blast radius thinking: prefer small isolated changes over sweeping refactors.

## Prompting (Claude 4.6+ Best Practices)
- No anti-laziness prompts ("be thorough", "don't be lazy") — they don't help and waste tokens.
- Adaptive thinking: Claude calibrates effort automatically; trust it.
- Be specific about what you want, not how hard to try.
- For complex tasks: break into subtasks and verify each step.

## Tools
Read `~/projects/agent-scripts/tools.md` for the full tool catalog.

### committer
- Commit helper (PATH). Stages only listed paths; required here. Repo may also ship `./scripts/committer`.

### trash
- Move files to Trash: `trash …` (system command).

### peekaboo
- macOS screenshot + window management: `~/projects/Peekaboo`. Cmds: `capture`, `see`, `click`, `list`.
- Use for macOS-level screenshots and visual review of simulator windows.

### agent-device
- iOS simulator automation: `~/.agents/skills/agent-device`. XCTest-backed accessibility tree, tap, type, scroll.
- The right tool for Expo dev builds on simulator.

### hotline
- WebSocket dev bridge: `~/.agents/skills/hotline`. Port 8675.
- Commands, events, state queries between agents and React Native apps.

### bin/docs-list / scripts/docs-list.ts
- Optional. Lists `docs/` + enforces front-matter. Rebuild: `bun build scripts/docs-list.ts --compile --outfile bin/docs-list`.

### bin/browser-tools / scripts/browser-tools.ts
- Chrome DevTools helper. Cmds: `start`, `nav`, `eval`, `screenshot`, `pick`, `cookies`, `inspect`, `kill`.
- Rebuild: `bun build scripts/browser-tools.ts --compile --target bun --outfile bin/browser-tools`.

### claude-in-chrome
- Browser automation via MCP. Available in Claude Code sessions with the extension installed.
- Use for web app testing, form filling, visual verification.

### oracle
- Bundle prompt+files for 2nd model. Use when stuck/buggy/review.
- Run `npx -y @steipete/oracle --help` once/session (before first use).

### mcporter
- MCP launcher: `npx mcporter <server>` (see `npx mcporter --help`).

### gh
- GitHub CLI for PRs/CI/releases. Given issue/PR URL: use `gh`, not web search.

### imageoptim
- Image optimization CLI: `imageoptim <file>`. Install: `brew install imageoptim-cli`.

### 1password (op)
- Secrets management. Use for npm publish OTP, API keys, etc.
- Auto-discovered as a skill; includes full npm publish workflow.

### Slash Commands
- Repo-local: `.claude/commands/`. Global: `~/.claude/commands/`.
- Available: `/handoff`, `/pickup`, `/fixissue`, `/landpr`, `/acceptpr`, `/raise`.

### tmux
- Use for persistent sessions (debugger/server/subagent).
- Quick refs: `tmux new -d -s agent-shell`, `tmux attach -t agent-shell`, `tmux list-sessions`.

<frontend_aesthetics>
Avoid "AI slop" UI. Be opinionated + distinctive.

Do:
- Typography: pick a real font; avoid Inter/Roboto/Arial/system defaults.
- Theme: commit to a palette; use CSS vars; bold accents > timid gradients.
- Motion: 1-2 high-impact moments (staggered reveal beats random micro-anim).
- Background: add depth (gradients/patterns), not flat default.

Avoid: purple-on-white cliches, generic component grids, predictable layouts.
</frontend_aesthetics>
