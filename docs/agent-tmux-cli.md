---
summary: 'Spec for agent-tmux: configurable tmux session manager for agent workflows.'
read_when:
  - Building or extending the agent-tmux CLI.
---

# agent-tmux CLI Spec

A configurable tmux session manager that reads project config and spins up dev panes automatically.

## Status: Future (not yet built)

## Config

Reads from `package.json` under the `"agent"` field (no extra config files):

```json
{
  "agent": {
    "tmux": {
      "session": "my-project",
      "panes": [
        { "name": "api", "cmd": "bun run dev --port 3001", "cwd": "packages/api" },
        { "name": "web", "cmd": "bun run dev --port 3000", "cwd": "apps/web" },
        { "name": "expo", "cmd": "bun expo start --dev-client", "cwd": "apps/mobile" },
        { "name": "studio", "cmd": "bun drizzle-kit studio", "cwd": "packages/db" }
      ]
    }
  }
}
```

### Config Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `session` | string | yes | tmux session name |
| `panes` | array | yes | list of pane definitions |
| `panes[].name` | string | yes | pane identifier (used in logs) |
| `panes[].cmd` | string | yes | command to run in the pane |
| `panes[].cwd` | string | no | working directory (relative to project root) |
| `panes[].env` | object | no | extra environment variables |

## CLI Commands

```bash
agent-tmux start [--detach]    # create session + start all panes
agent-tmux stop                # kill session + all panes
agent-tmux logs [pane]         # tail logs from all panes or a specific one
agent-tmux status              # show session/pane status
agent-tmux restart [pane]      # restart a specific pane or all
```

### `agent-tmux start`
1. Read `package.json` from cwd (or nearest parent).
2. Create tmux session with configured name.
3. For each pane: create window/pane, cd to cwd, run cmd.
4. With `--detach`: return immediately. Without: attach to session.

### `agent-tmux stop`
1. Kill the tmux session (all panes die with it).

### `agent-tmux logs [pane]`
1. If pane specified: `tmux capture-pane` for that pane.
2. If no pane: capture all panes, prefix each line with pane name.

### `agent-tmux status`
1. List all panes in the session with their running commands and uptime.

### `agent-tmux restart [pane]`
1. Kill the pane's process, re-run the command from config.
2. If no pane specified: restart all.

## Implementation Notes

- Built with Bun, publishable to npm as `agent-tmux`.
- Use `Bun.spawn` for tmux commands.
- No dependencies beyond Bun stdlib.
- Session name collision: if session exists, `start` should warn and offer `--force` to kill + recreate.
- Log rotation: not in scope v1; tmux scrollback buffer is sufficient.

## Future

- Watch mode: restart pane on file change.
- Health checks: ping endpoints to verify services are up.
- Integration with hotline: auto-run `hotline wait-for-app` after Expo pane starts.
