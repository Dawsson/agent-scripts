# Tools Reference

CLI tools available on Dawson's machines. Use these for agentic tasks.

## committer
Commit helper script. Stages only the listed files; blocks `.` to prevent staging entire repo.

**Location**: `scripts/committer` (also on PATH)

```bash
committer "feat: add login flow" src/login.ts src/auth.ts
committer --force "fix: resolve lock" file.ts  # removes stale index.lock on failure
```

---

## trash
Move files to macOS Trash instead of `rm`.

```bash
trash file.ts old-dir/
```

---

## peekaboo
Screenshot, screen inspection, and click automation for macOS.

**Location**: `~/projects/Peekaboo`

```bash
peekaboo capture                       # take screenshot
peekaboo see                           # describe what's on screen (OCR)
peekaboo click                         # click at coordinates
peekaboo list                          # list windows/apps
```

**Requirements**: Screen Recording + Accessibility permissions.

Use for macOS-level screenshots and visual review of simulator windows.

---

## agent-device
iOS simulator and Android emulator automation. XCTest-backed accessibility tree.

**Location**: `~/.agents/skills/agent-device`

```bash
# iOS simulator
agent-device describe-ui --udid <sim-id>
agent-device tap --udid <sim-id> -x 100 -y 200
agent-device type --udid <sim-id> "hello"
agent-device scroll --udid <sim-id> --direction down
agent-device list-simulators
```

The right tool for Expo dev builds on simulator.

---

## hotline
WebSocket dev bridge between agents and running React Native apps.

**Location**: `~/.agents/skills/hotline` (port 8675, runs via launchd)

```bash
hotline cmd <type> --key value       # send command with inline args
hotline wait <event>                 # block until app emits event
hotline wait-for-app [appId]         # block until app connects
hotline watch                        # interactive TUI
hotline query <key>                  # shorthand for get-state
```

---

## claude-in-chrome
Browser automation via MCP. Available in Claude Code sessions with the extension installed.

Use for web app testing, form filling, visual verification of Next.js apps.

---

## oracle
Hand prompts + files to a second AI model for review/second opinion.

```bash
npx -y @anthropic/oracle --help      # run once per session to learn syntax
```

---

## gh
GitHub CLI for PRs, issues, CI, releases.

```bash
gh issue view <url> --comments
gh pr view <url> --comments --files
gh run list / gh run view <id>
```

When someone shares a GitHub URL, use `gh` to read it (not web search).

---

## mcporter
MCP server launcher for browser automation, web scraping.

```bash
npx mcporter --help
npx mcporter <server>
```

---

## imageoptim
Image optimization CLI. Lossless compression for PNGs/JPGs.

```bash
imageoptim <file>
```

Install: `brew install imageoptim-cli`

---

## 1password (op)
Secrets management via 1Password CLI. Use for npm publish OTP, API keys, etc.

```bash
op signin
op whoami
op read "op://Vault/Item/field"
```

See `docs/npm-publish-with-1password.md` for npm publish workflow.

---

## clawdis
WhatsApp/Telegram messaging gateway and agent interface.

**Location**: `~/projects/clawdis`

```bash
clawdis login                          # link WhatsApp via QR
clawdis send --to <number> --message "text"
clawdis agent --message "text"         # talk to agent directly
clawdis gateway                        # run WebSocket gateway
clawdis status                         # session health
```

---

## bin/docs-list / scripts/docs-list.ts
Lists `docs/` directory and enforces front-matter on doc files.

```bash
bin/docs-list                          # run compiled binary
bun build scripts/docs-list.ts --compile --outfile bin/docs-list  # rebuild
```

---

## bin/browser-tools / scripts/browser-tools.ts
Chrome DevTools helper for headless browser automation.

```bash
bin/browser-tools start                # launch Chrome with debugging
bin/browser-tools nav <url>            # navigate
bin/browser-tools eval "document.title" # run JS
bin/browser-tools screenshot           # capture page
bin/browser-tools pick <selector>      # extract element
bin/browser-tools cookies              # list cookies
bin/browser-tools inspect              # DOM inspection
bin/browser-tools kill                 # close Chrome
```

Rebuild: `bun build scripts/browser-tools.ts --compile --target bun --outfile bin/browser-tools`
