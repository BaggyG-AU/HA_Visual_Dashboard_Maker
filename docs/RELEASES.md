# Releases

Repo versioning follows the `package.json` version and annotated git tags. Current package version: `0.2.0-beta.2`; next tag should match the version bump (e.g., `v0.2.0-beta.3` or higher).

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
