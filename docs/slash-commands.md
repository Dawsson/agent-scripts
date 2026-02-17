---
summary: 'Slash commands overview and redirect to docs/slash-commands.'
read_when:
  - Editing or adding slash commands.
---
# Slash Commands

Moved to `docs/slash-commands/`. See `docs/slash-commands/README.md` for the index.

## Creating Commands

1. **Create a markdown file** in `.claude/commands/` (repo-local) or `~/.claude/commands/` (global):
   ```bash
   echo "# /mycommand\n\nYour prompt..." > .claude/commands/mycommand.md
   ```

2. **Use the command** in any Claude Code session: `/mycommand`

## Best Practices

- **Be specific:** Include exact commands, safety checks, and exit conditions.
- **Document constraints:** No destructive git, coordination rules, scope boundaries.
- **Make them reusable:** Avoid task-specific details (dates, ticket numbers).
- **Version control:** Store in `.claude/commands/` so they're shared with the team.
