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

- Assume login is set up; publish may require 6-digit OTP.
- If OTP is in 1Password, use the `1password` skill's npm publish workflow.
- Verify after publish:
  ```bash
  npm whoami
  npm view <pkg> version
  ```

## Post-Release

- Run `/raise` to open the next Unreleased section in CHANGELOG.md.
- Verify CI is green on main after the changelog commit.
