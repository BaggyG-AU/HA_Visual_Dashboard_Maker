# Releases

Repo versioning follows the `package.json` version and annotated git tags. Current package version: `0.1.1-beta.1`; next tag should be `v0.1.1-beta.2` unless bumped.

## Preconditions
- All tests green (`npx playwright test --project=electron-integration --reporter=dot --workers=1 --trace=retain-on-failure` and e2e if relevant).
- Working tree clean; docs and changelog updated.

## Cut a release

```bash
git status
git add -A
git commit -m "docs: consolidate testing/mocking guidance" -m "All tests already passing."

# tag the new version
git tag -a v0.1.1-beta.2 -m "v0.1.1-beta.2: docs cleanup + testing/mocking guidance"

# push
git push
git push --tags
```

## Release notes (template)
- Consolidated testing/mocking/troubleshooting docs; removed temporary diagnostics.
- Confirmed Playwright integration/e2e suites are passing.
- No functional code changes.

If publishing GitHub Releases, create a draft pointing to `v0.1.1-beta.2` with the notes above.
