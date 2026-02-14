# Documentation Index

Use this page to navigate project docs. Follow the storage standards in `ai_rules.md` and keep docs in the folders below.

- **Architecture**: `docs/architecture/`  
  - Technical design: `ARCHITECTURE.md`  
  - Decisions and render strategy: `ARCHITECTURE_DECISION.md`
- **Security**: `docs/security/`  
  - Content Security Policy: `CSP_IMPLEMENTATION.md`
- **Testing**: `docs/testing/`  
  - Playwright commands and DSL overview: `PLAYWRIGHT_TESTING.md`  
  - Mandatory standards: `TESTING_STANDARDS.md`
- **Releases**: `docs/releases/`
  - Release process: `RELEASES.md`
  - Latest notes: `RELEASE_NOTES_v0.7.5-beta.0.md`
  - Previous: `RELEASE_NOTES_v0.2.0-beta.2.md`, `RELEASE_NOTES_v0.2.0-beta.1.md`
  - Older notes archived under `docs/archive/releases/`
- **Product**: `docs/product/`
  - Roadmap: `PROJECT_PLAN.md`
  - Templates overview: `TEMPLATES.md`
  - Entity Type Dashboard Generator: `Entity-type dashboard generator.md`
  - Keyboard shortcuts: `KEYBOARD_SHORTCUTS.md`
  - Color picker user guide: `COLOR_PICKER_USER_GUIDE.md`
- **Features**: `docs/features/`
  - Entity Type Dashboard Generator: `ENTITY_TYPE_DASHBOARD_GENERATOR.md`
  - Color picker component API: `COLOR_PICKER_COMPONENT_API.md`
- **Research**: `docs/research/`
  - Home Assistant WebSocket API research
- **Archive**: `docs/archive/`  
  - Legacy release notes and research/diagnostics

For contributors:
- Start with `ai_rules.md` (immutable rules), `docs/testing/TESTING_STANDARDS.md`, and `docs/releases/RELEASES.md`.
- Tests must be run locally (not in the AI sandbox); see verification checklists provided with changes.
