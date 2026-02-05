# Releases

Repo versioning follows the `package.json` version and annotated git tags. Current package version: `0.4.3-beta.1`; next tag should match the version bump (e.g., `v0.4.3-beta.2` or higher).

## Current Progress Snapshot
- Entity Intelligence Feature 3.7 (Multi-entity Support): complete in working tree (2026-02-05).
- Detailed implementation, Must Have/Should Have status, and verification commands are recorded in `docs/features/ENTITY_INTELLIGENCE_LAYER_IMPLIMENTATION.md`.

## Preconditions
- All tests green:
  - `npx playwright test --project=electron-integration --workers=1 --trace=retain-on-failure`
  - `npx playwright test --project=electron-e2e --workers=1 --trace=retain-on-failure`
- Working tree clean; docs and release notes updated in `docs/releases/`.

## Cut a release

```bash
git status
git add -A
git commit -m "docs: update release notes for vX.Y.Z" -m "All tests already passing."
git tag -a vX.Y.Z -m "vX.Y.Z: summary of changes"
git push
git push --tags
```

## Release notes (template)
- Summary of major features/fixes since last release
- Testing status (integration + e2e)
- Known issues or follow-up work

If publishing GitHub Releases, create a draft pointing to the new tag and attach the relevant `docs/releases/RELEASE_NOTES_*.md`.
