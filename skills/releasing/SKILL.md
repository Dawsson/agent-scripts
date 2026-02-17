---
name: releasing
description: Release workflow for GitHub releases, npm publish, and changelog management. Use when cutting a release, publishing a package, updating changelog, or drafting release notes.
---

# Releasing

End-to-end release workflow: changelog curation, GitHub release creation, npm publish.

## Changelog Curation

1. **Pick baseline**: use provided version or `git describe --tags --abbrev=0`.
2. **Collect commits**:
   ```bash
   git log <tag>..HEAD --oneline --reverse
   ```
3. **Curate entries (user-facing only)**:
   - Include: features, fixes, breaking changes, UX/behavior tweaks.
   - Exclude: internal refactors, typo edits, dep bumps without user impact.
   - Order: breaking > features > fixes > misc.
   - Add PR/issue numbers when available (`#123`).
4. **Edit CHANGELOG.md**:
   - Ensure `## Unreleased` section at top; create if missing.
   - Append bullets under Unreleased; match existing style.
5. **Sanity check**: markdown renders, no duplicates, wording concise.

### Format example
```markdown
## Unreleased
- Added configurable refresh interval. #123
- Fixed icon dimming on sleep/wake. #128
```

## GitHub Release

- Title: `<Project> <version>` — never version alone.
- Body = curated changelog bullets, verbatim and in order; no extra meta.
- Attach all shipping artifacts (zips/tarballs/checksums) downstream clients expect.
- Verify tag, assets, and notes on GitHub before announcing.

## npm Publish

npm uses passkey/browser-based auth — **cannot be automated**. The user must authenticate in the browser.

### Flow

1. Agent prepares the package (build, version bump, changelog, tag).
2. Agent opens a new interactive Ghostty window with the publish command:

```bash
open -na Ghostty.app --args -e bash -c "cd /path/to/package && npm publish; echo '--- done ---'"
```

3. npm prints an auth URL in the Ghostty window — user clicks it, authenticates with passkey in browser.
4. Publish completes; window closes automatically.
5. Agent verifies:

```bash
npm view <pkg> version
```

### Notes

- Pass the exact package dir — don't assume CWD.
- Use `bun publish` if the repo uses bun; same passkey flow applies.
- After opening Ghostty, tell the user: *"A Ghostty window opened running `npm publish`. Authenticate with your passkey when prompted."*
- Wait for user to confirm before running the verify step.

## Post-Release

- Run `/raise` to open the next Unreleased section in CHANGELOG.md.
- Verify CI is green on main after the changelog commit.
