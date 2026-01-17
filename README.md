# HA Visual Dashboard Maker

A cross-platform desktop application for visually designing Home Assistant dashboards with drag-and-drop functionality and support for popular custom cards.

## Project Status

- **Version**: `0.4.1-beta.1`
- **Current focus**: Entity Type Dashboard Generator feature with 9 pre-built dashboard categories. Electron app + visual editor with Playwright tests green.
- **Planning docs**: see `/docs/index.md` for architecture, plan, testing, releases, and research.

### 📋 Key Documents
- [Docs index](docs/index.md) — entry point to all documentation
- [Project plan](docs/product/PROJECT_PLAN.md) — phased roadmap with current status
- [Architecture](docs/architecture/ARCHITECTURE.md) — technical design and decisions
- [Testing standards](docs/testing/TESTING_STANDARDS.md) — required Playwright conventions
- [AI rules](ai_rules.md) — immutable rules and constraints for AI agents
- [Release notes](docs/releases/RELEASE_NOTES_v0.4.0-beta.1.md) — latest release details

## Vision

Create a professional WYSIWYG editor for Home Assistant dashboards that:
- Connects to Home Assistant instances to read and write dashboard configurations
- Provides intuitive drag-and-drop visual editing
- Supports popular custom cards (bubble-card, apexcharts-card, button-card, card-mod)
- Works on Windows and Linux
- Offers both visual and code (YAML) editing modes

## Planned Features

### Core Features (MVP)
- Load and parse Home Assistant dashboard YAML files
- Visual canvas with drag-and-drop card positioning
- Property editors for standard HA cards
- Split view: Visual editor + YAML code editor
- Save dashboard configurations to YAML files
- Basic validation and error checking

### Custom Card Support
- Bubble Card: Minimalist card collection with pop-up interfaces
- ApexCharts Card: Advanced data visualization and graphs
- Button Card: Highly customizable button cards
- Card-mod: CSS styling layer for all cards

### Advanced Features (Future)
- Direct Home Assistant connection via WebSocket API
- Live entity state preview
- Entity browser and autocomplete
- Dashboard templates and sharing
- Undo/redo functionality
- Real-time collaboration features

## Technology Stack

- **Framework**: Electron (cross-platform desktop)
- **Frontend**: React + TypeScript
- **UI Library**: Material-UI or Ant Design
- **Editor**: Monaco Editor (VS Code's editor)
- **State Management**: Zustand or Redux Toolkit
- **Build Tool**: Vite
- **Package Manager**: npm

## Supported Platforms

- Windows 10/11
- Linux (Ubuntu, Debian, Fedora, Arch)

## Project Structure

```
HA_Visual_Dashboard_Maker/
├── docs/                 # Documentation (architecture, testing, releases, product)
├── src/                  # Electron main + renderer code
├── tests/                # Playwright specs, helpers, DSL
├── templates/            # Dashboard templates (YAML)
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Home Assistant instance (for testing)
- Basic knowledge of Home Assistant dashboards

### Development Setup

Launch commands:
- Standard: `npm start`
- WSL (to avoid sandbox/GPU issues): `npm run start:wsl`

Key tests (cannot be run in the AI sandbox; run locally):
- Integration: `npx playwright test --project=electron-integration --workers=1 --trace=retain-on-failure`
- E2E smoke: `npx playwright test --project=electron-e2e --workers=1 --trace=retain-on-failure`

## Gradient Editor (UI Enhancement Layer)

- Inline popover editor for background gradients (linear/radial) with live preview and YAML sync.
- Keyboard-complete: angle/position sliders and stop rows support arrow keys, `Enter` (add stop), `Delete` (remove), and focusable swatch to open via keyboard.
- YAML persistence: gradients are stored in card `style` as CSS `background: ...;` and round-trip through Properties Panel and YAML tab.
- Presets: built-in categories + user presets with import/export (JSON).
- Accessibility: ARIA labels on controls, focus ring on selected stop, and screen-reader-friendly list semantics for stops.

Docs:
- User guide: `docs/product/GRADIENT_EDITOR_USER_GUIDE.md`
- Component API: `docs/features/GRADIENT_EDITOR_COMPONENT_API.md`
- Testing patterns: `docs/testing/TESTING_STANDARDS.md#gradient-editor-testing-patterns`
- Keyboard shortcuts: `docs/product/KEYBOARD_SHORTCUTS.md`

## Color Picker (Foundation Layer)

Popover-based color input used across Properties Panel (card color, icon color) and inside the Gradient Editor for stop colors.

- Supported values: `#RRGGBB`, `#RRGGBBAA`, `rgb(r, g, b)`, `rgba(r, g, b, a)`, `hsl(h, s%, l%)`, `hsla(h, s%, l%, a)`
- Recent colors: stored locally, shown on reopen, and can be cleared
- Accessibility: keyboard-operable (swatch is focusable) and labeled controls

Docs:
- User guide: `docs/product/COLOR_PICKER_USER_GUIDE.md`
- Component API: `docs/features/COLOR_PICKER_COMPONENT_API.md`
- Keyboard shortcuts: `docs/product/KEYBOARD_SHORTCUTS.md`

## Contributing

Contributions are welcome. Please read `ai_rules.md`, `docs/testing/TESTING_STANDARDS.md`, and `docs/releases/RELEASES.md` before opening a PR.

## Roadmap

See `docs/product/PROJECT_PLAN.md` for the phased roadmap and backlog.

## License

MIT

## Acknowledgments

- Home Assistant community for excellent documentation
- Custom card developers:
  - [Bubble Card](https://github.com/Clooos/Bubble-Card) by Clooos
  - [ApexCharts Card](https://github.com/RomRider/apexcharts-card) by RomRider
  - [Button Card](https://github.com/custom-cards/button-card) by custom-cards
  - [Card-mod](https://github.com/thomasloven/lovelace-card-mod) by thomasloven

## Support

For questions and discussions, please refer to the project documentation or open an issue.

---

**Note**: This is a community project and is not officially affiliated with Home Assistant.
