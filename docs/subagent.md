---
summary: 'Subagent coordination rules and tmux-based agent sessions.'
read_when:
  - Coordinating subagents or running tmux-based agent sessions.
---

# Claude Code Subagent Quickstart

## CLI Basics
- Launch long-running subagents inside tmux so the session can persist:

  ```bash
  tmux new-session -d -s claude-haiku 'claude --model haiku'
  tmux attach -t claude-haiku
  ```

- One-shot tasks: `claude --model haiku --dangerously-skip-permissions --print "…"`
- Interactive tasks: start in tmux, send prompts with `tmux send-keys`, capture with `tmux capture-pane`.
- Default to fast Haiku model for subagent work.

## One-Shot Prompts
- The CLI accepts the prompt as a trailing argument in one-shot mode. Multi-line via pipe: `echo "..." | claude --print`.
- Add `--output-format json` for structured output.
- Be explicit about reading full files: "Read docs/example.md in full and produce a 2-3 sentence summary."

## tmux Session Management

```bash
# Start a named session
tmux new-session -d -s agent-shell

# Send a command to the session
tmux send-keys -t agent-shell "bun test" Enter

# Capture output
tmux capture-pane -p -J -t agent-shell:0.0 -S -200

# List all sessions
tmux list-sessions

# Kill when done
tmux kill-session -t agent-shell
```

## Multi-Agent Coordination
- Each agent should check `git status/diff` before making edits.
- Ship small, focused commits with specific file paths (never `git add .`).
- Use `committer` to enforce explicit file listing.
- If you see uncommitted changes you didn't make, another agent is working — leave them alone.

## Hotline Integration
Agents can interact with running React Native apps via the hotline dev bridge:

```bash
hotline wait-for-app                    # block until app reconnects after hot reload
hotline wait error --timeout 3000 || true  # check for crashes
hotline cmd get-state --key <key>       # verify app state
```

See AGENTS.md "Hotline" section for full command reference.
