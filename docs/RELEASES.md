# Releases

Repo versioning follows the `package.json` version and annotated git tags. Current package version: `0.7.5-beta.0`; next tag should match the version bump (e.g., `v0.7.5-beta.1` or higher).

## Current Progress Snapshot
- Phase 4 (Layout Infrastructure Layer): complete (v0.7.4) as of 2026-02-14.
- Phase 5 (Advanced Visualization Layer): initiated in v0.7.5-beta.0 with prompt set prepared.
- Detailed implementation status and verification guidance are tracked in:
  - `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`
  - `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`

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
