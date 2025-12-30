# HA Visual Dashboard Maker

A cross-platform desktop application for visually designing Home Assistant dashboards with drag-and-drop functionality and support for popular custom cards.

## Project Status

**Current Phase**: ✅ Ready for Development (Phase 1)

**Phase 0 Complete** - All planning and requirements gathering is finished!

### 📋 Key Documents:
- [READINESS_SUMMARY.md](READINESS_SUMMARY.md) - **START HERE** - Confirms we're ready to begin development
- [REQUIREMENTS_QUESTIONNAIRE.md](REQUIREMENTS_QUESTIONNAIRE.md) - Completed user requirements
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture with offline-first design
- [PROJECT_PLAN.md](PROJECT_PLAN.md) - 18-phase development roadmap
- [docs/MVP_BACKLOG.md](docs/MVP_BACKLOG.md) - Detailed MVP task breakdown

**Next Step**: Initialize Electron project and begin Phase 1

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
├── docs/                      # Documentation
├── src/
│   ├── main/                  # Electron main process
│   ├── renderer/              # React application
│   └── shared/                # Shared types and utilities
├── ARCHITECTURE.md            # Technical architecture
├── REQUIREMENTS_QUESTIONNAIRE.md  # Requirements gathering
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Home Assistant instance (for testing)
- Basic knowledge of Home Assistant dashboards

### Development Setup

_(Coming soon - project initialization in progress)_

Launch commands:
- Standard: `npm start`
- WSL (to avoid sandbox/GPU issues): `npm run start:wsl`

## Contributing

This project is in early planning stages. Contributions and feedback are welcome once the initial structure is established.

## Documentation

- [Requirements Questionnaire](REQUIREMENTS_QUESTIONNAIRE.md) - Answer these questions to help define the project scope
- [Technical Architecture](ARCHITECTURE.md) - Detailed technical design and architecture decisions

## Roadmap

- [x] Requirements gathering
- [x] Architecture design
- [ ] Project initialization
- [ ] Core editor implementation
- [ ] Standard card support
- [ ] Custom card support (bubble, button, apexcharts, card-mod)
- [ ] Home Assistant integration
- [ ] Beta release

## License

_(To be determined)_

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
