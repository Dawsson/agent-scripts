---
summary: 'Agent pickup checklist when starting on a task.'
read_when:
  - Creating a /pickup prompt or onboarding a new task.
---
# /pickup

Purpose: rehydrate context quickly when you start work.

Steps:
1) Read AGENTS.md + relevant docs (run `bin/docs-list` if present).
2) Repo state: `git status -sb`; check for local commits; confirm current branch/PR.
3) CI/PR: `gh pr view <num> --comments --files` (or derive PR from branch) and note failing checks.
4) tmux/processes: list sessions and attach if needed:
   - `tmux list-sessions`
   - If sessions exist: `tmux attach -t agent-shell` or `tmux capture-pane -p -J -t agent-shell:0.0 -S -200`
5) Hotline: `hotline watch` to check if any apps are connected; review available commands.
6) Tests/checks: note what last ran (from handoff notes/CI) and what you will run first.
7) Plan next 2-3 actions as bullets and execute.

Output format: concise bullet summary; include copy/paste tmux attach/capture commands when live sessions are present.

Location: `.claude/commands/pickup.md` (repo-local) or `~/.claude/commands/pickup.md` (global).
