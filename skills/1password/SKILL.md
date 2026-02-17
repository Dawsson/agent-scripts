---
name: 1password
description: Use 1Password CLI (op) for secrets management, environment variables, API keys, and secure credential injection. Use when reading secrets, injecting env vars, or any task requiring authentication tokens from 1Password.
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
op read "op://Vault/Item/one-time password?attribute=otp"
```

## Injecting Secrets as Env Vars

```bash
# Run a command with secrets injected as env vars
export DB_PASSWORD="op://app-prod/db/password"
op run -- my-command

# Template injection
echo "password: {{ op://Vault/Item/password }}" | op inject
```

## Guardrails

- Never paste secrets into logs, chat, or code.
- Prefer `op run` / `op inject` over writing secrets to disk.
- `tr -d "\n"` on `op read` calls to avoid trailing newlines.
