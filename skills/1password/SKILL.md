---
name: 1password
description: Use 1Password CLI (op) for secrets management, npm publish with passkey auth, API keys, and secure credential injection. Use when publishing to npm, reading secrets, or any task requiring authentication tokens.
homepage: https://developer.1password.com/docs/cli/get-started/
---

# 1Password CLI

Secure secrets management via `op`.

## References

- `references/get-started.md` (install + app integration + sign-in flow)
- `references/cli-examples.md` (real `op` examples)

## Prerequisites

- 1Password desktop app installed, unlocked, and desktop app integration enabled.
- `op` CLI installed: `brew install 1password-cli`
- Verify: `op --version` and `op whoami`

## Reading Secrets

With desktop app integration, `op` works in any shell:

```bash
op read "op://Vault/Item/field"
```

## Injecting Secrets

```bash
# Run a command with secrets injected as env vars
export DB_PASSWORD="op://app-prod/db/password"
op run -- my-command

# Template injection
echo "password: {{ op://Vault/Item/password }}" | op inject
```

## npm Publish with Passkey Auth

npm uses passkey/browser-based auth — **cannot be automated**. The user must authenticate in the browser.

### Flow

1. Agent prepares the package (build, version bump, changelog).
2. Agent opens a new interactive Ghostty window with the publish command:

```bash
# Opens a new Ghostty window running npm publish in the package dir
open -na Ghostty.app --args -e bash -c "cd /path/to/package && npm publish; echo '--- done ---'"
```

3. npm prints an auth URL in the Ghostty window, e.g.:
   ```
   npm notice Login required.
   npm notice Visit https://www.npmjs.com/auth/... to continue.
   ```
4. **User**: click the URL, authenticate with passkey in browser.
5. Publish completes automatically once passkey is verified.
6. Agent verifies:

```bash
npm view <pkg> version
```

### Notes

- Pass the exact package dir to the `cd` command — don't assume CWD.
- Use `bun publish` if the repo uses bun; same passkey flow applies.
- After opening Ghostty, tell the user: *"A Ghostty window just opened running `npm publish`. Authenticate with your passkey when the browser prompt appears."*
- Wait for user to confirm publish is done before running the verify step.

## Guardrails

- Never paste secrets into logs, chat, or code.
- Prefer `op run` / `op inject` over writing secrets to disk.
- Passkey auth cannot be bypassed or automated — always hand off to the user.
