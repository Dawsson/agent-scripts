---
summary: 'Work on a project issue from the .issues/ backlog.'
read_when:
  - Starting work on a tracked issue.
---
# /issue

Input: Issue ID (e.g., 001, 1, or 12). Required.

## Parallel Agent Safety

### Never do:
- `git add .` or `git add -A`
- `git checkout .` or `git restore .`
- `git reset --hard`
- `git clean`
- `git stash`

### Always do:
- `git add <specific-file>`
- Use `committer` for all commits
- `git push` immediately after every commit (if pushing is requested)
- `git pull --rebase` if push fails

## Workflow

1) Mark in progress:
   ```bash
   bun scripts/issues.ts status <id> in_progress
   ```
   Read the issue file from `.issues/` (pad ID to 3 digits).

2) Implement the fix following AGENTS.md patterns.

3) After every file changed: commit with `committer` using specific file paths.

4) When done:
   ```bash
   bun scripts/issues.ts status <id> review
   ```
   Add notes to `## Notes` in the issue file.

## If You See Uncommitted Changes You Didn't Make
Another agent is working. Leave them alone. Commit YOUR files only.
