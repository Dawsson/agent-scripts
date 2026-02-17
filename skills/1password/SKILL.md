---
name: 1password
description: Use 1Password CLI (op) for secrets management, npm publish with OTP, API keys, and secure credential injection. Use when publishing to npm, reading secrets, or any task requiring authentication tokens.
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

## Injecting Secrets

```bash
# Run a command with secrets injected as env vars
export DB_PASSWORD="op://app-prod/db/password"
op run -- my-command

# Template injection
echo "password: {{ op://Vault/Item/password }}" | op inject
```

## npm Publish with OTP

Use a tmux session for npm publish to avoid secrets in shell history.

```bash
SOCKET_DIR="${TMPDIR:-/tmp}/agent-tmux-sockets"
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/op-auth.sock"
SESSION="op-auth-$(date +%Y%m%d-%H%M%S)"

tmux -S "$SOCKET" new -d -s "$SESSION" -n shell
```

### With automation token + OTP

```bash
TOKEN_REF='op://<Vault>/<Item>/token'
OTP_REF='op://<Vault>/<Item>/one-time password?attribute=otp'

tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- \
  "NODE_AUTH_TOKEN=\"\$(op read \"$TOKEN_REF\" | tr -d \"\\n\")\" npm publish --otp \"\$(op read \"$OTP_REF\" | tr -d \"\\n\")\"" Enter
```

### Already logged in: OTP-only

```bash
OTP_REF='op://<Vault>/<Item>/one-time password?attribute=otp'
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- \
  "npm publish --otp \"\$(op read \"$OTP_REF\" | tr -d \"\\n\")\"" Enter
```

### Verify + cleanup

```bash
npm view <pkg> version
tmux -S "$SOCKET" kill-session -t "$SESSION"
rm -f "$SOCKET"
```

## Guardrails

- Never paste secrets into logs, chat, or code.
- Prefer `op run` / `op inject` over writing secrets to disk.
- `tr -d "\n"` on `op read` calls to avoid accidental extra submits.
- Don't `tmux capture-pane` right after pasting OTP (it may echo).
