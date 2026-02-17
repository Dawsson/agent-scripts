---
summary: 'Deploy to Cloudflare Workers via Wrangler.'
read_when:
  - Deploying a Cloudflare Workers project.
---
# /deploy

Purpose: deploy the current project (or a specific package) to Cloudflare Workers.

## Guardrails
- `git status -sb` clean. No uncommitted changes.
- Must be on `main` (or repo default branch).
- All tests/lint must pass before deploy.

## Workflow

1) Confirm target:
   - If monorepo: identify which package to deploy (check `wrangler.toml` locations).
   - If single project: deploy from root.

2) Run gate:
   ```bash
   bun lint && bun typecheck && bun test
   ```

3) Deploy:
   ```bash
   bun wrangler deploy
   # or from monorepo package:
   bun --filter <package> wrangler deploy
   ```

4) Verify:
   - Check deploy output for URL.
   - Hit health endpoint if available.
   - `wrangler tail` briefly to watch for errors.

5) Report: note the deployed URL and any relevant details.

## If Deploy Fails
- Check `wrangler.toml` for config issues.
- Verify Cloudflare auth: `wrangler whoami`.
- Check for missing env vars/secrets: `wrangler secret list`.
