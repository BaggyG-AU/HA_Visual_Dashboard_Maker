# Release Notes — v0.2.0-beta.2

## Highlights
- Centralized documentation under `/docs` with an index and clear subfolders (architecture, security, testing, product, releases, research, archive).
- Updated project plan (restored from v0.1.1-beta.1) reflecting shipped phases (Electron shell, visual editor, Monaco YAML modal, HA WebSocket/entity browser) and pending work (split view, deploy workflow, custom cards).
- Consolidated AI/automation rules at repo root (`ai_rules.md`) with storage standards and sandbox verification guidance; testing standards timestamped and clarified.
- Archived legacy artifacts (early release notes and control panel prototype) to `docs/archive/`.

## Changes
- Docs: moved architecture, CSP, research, testing, and release files into `/docs`; added `/docs/index.md` and archive structure.
- Product: added `docs/product/PROJECT_PLAN.md` and `TEMPLATES.md` reference; updated README to point to new docs and current status.
- Testing: relocated Playwright docs to `docs/testing/` and added a reminder about main-window selection; AI rules include document storage standards.
- Archives: relocated old release notes to `docs/archive/releases/` and an unused control panel artifact to `docs/archive/misc/`.

## Testing
- Integration (local): `npx playwright test --project=electron-integration --workers=1 --trace=retain-on-failure`
- E2E smoke (local): `npx playwright test --project=electron-e2e --workers=1 --trace=retain-on-failure`

## Notes
- No application code changes; version bumped to align docs and release tagging.
