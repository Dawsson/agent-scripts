---
name: 1password
description: Use 1Password CLI (op) for secrets management, npm publish with OTP, API keys, and secure credential injection. Use when publishing to npm, reading secrets, or any task requiring authentication tokens.
homepage: https://developer.1password.com/docs/cli/get-started/
---

# 1Password CLI

Secure secrets management via `op`. All `op` commands MUST run inside tmux.

## References

- `references/get-started.md` (install + app integration + sign-in flow)
- `references/cli-examples.md` (real `op` examples)

## Setup

1. Check OS + shell.
2. Verify CLI present: `op --version`.
3. Confirm desktop app integration is enabled and the app is unlocked.
4. REQUIRED: create a fresh tmux session for all `op` commands.
5. Sign in inside tmux: `op signin` (expect app prompt).
6. Verify: `op whoami` (must succeed before any secret read).
7. If multiple accounts: use `--account` or `OP_ACCOUNT`.

## tmux Session (required)

The shell tool uses a fresh TTY per command. Always run `op` inside a dedicated tmux session.

```bash
SOCKET_DIR="${TMPDIR:-/tmp}/agent-tmux-sockets"
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/op-auth.sock"
SESSION="op-auth-$(date +%Y%m%d-%H%M%S)"

tmux -S "$SOCKET" new -d -s "$SESSION" -n shell
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- "op signin" Enter
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- "op whoami" Enter
```

## npm Publish with OTP

When publishing to npm and OTP is required:

### Preferred: granular automation token + OTP

Store a granular npm token in 1Password (item field `token`), plus TOTP if required.

```bash
TOKEN_REF='op://<Vault>/<Item>/token'
OTP_REF='op://<Vault>/<Item>/one-time password?attribute=otp'

tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- \
  "NODE_AUTH_TOKEN=\"\$(op read \"$TOKEN_REF\" | tr -d \"\\n\")\" npm publish --otp \"\$(op read \"$OTP_REF\" | tr -d \"\\n\")\"" Enter
```

### If already logged in: OTP-only publish

```bash
OTP_REF='op://<Vault>/<Item>/one-time password?attribute=otp'
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- \
  "npm publish --otp \"\$(op read \"$OTP_REF\" | tr -d \"\\n\")\"" Enter
```

Tip: unset CI tokens so you don't accidentally override your local login:
```bash
env -u NPM_TOKEN -u NODE_AUTH_TOKEN npm whoami
```

### Verify

```bash
npm whoami
npm view <pkg> version
```

### Cleanup

```bash
tmux -S "$SOCKET" kill-session -t "$SESSION"
rm -f "$SOCKET"
```

## Guardrails

- Never paste secrets into logs, chat, or code.
- Prefer `op run` / `op inject` over writing secrets to disk.
- `tr -d "\n"` on all `op read` calls to avoid accidental extra submits.
- Don't `tmux capture-pane` after pasting OTP (it may echo).
- Do not run `op` outside tmux; stop and ask if tmux is unavailable.
