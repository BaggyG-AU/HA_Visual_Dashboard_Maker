# Home Assistant Visual Dashboard Editor - Requirements Questionnaire

## Project Overview
A visual drag-and-drop dashboard editor for Home Assistant that can:
- Connect to Home Assistant instances
- Read existing dashboard configurations
- Provide a visual WYSIWYG editor
- Write dashboard configurations back to Home Assistant
- Support popular dashboard extensions (bubble-card, apexcharts-card, button-card, card-mod)

## Critical Questions to Define Requirements

### 1. Home Assistant Connection & Authentication
- **Q1.1**: How will users connect to their Home Assistant instance?
  - Via URL/hostname + long-lived access token?  Yes
	 - Support for both local (http) and remote (https) instances? Yes
	- Should we support Home Assistant Cloud connections?  Yes
	
- **Q1.2**: Should the application store connection credentials?
  - If yes, how should they be secured (encrypted storage, keychain integration)? Encrypted storage
  - Support multiple HA instances in one app? No

- **Q1.3**: What Home Assistant API version(s) should we target?
  - Minimum supported HA version?  2025.12

### 2. Dashboard Configuration Management
- **Q2.1**: Which dashboard types should be supported?
  - Lovelace UI dashboards only? Yes
  - Both storage mode and YAML mode dashboards? Yes
  - Should we support converting between modes? Yes

- **Q2.2**: Dashboard operations required:
  - Create new dashboards from scratch? Yes
  - Clone existing dashboards? Yes
  - Export dashboards to file (for backup/sharing)? Yes
  - Import dashboards from file? Yes.  From yaml and json

- **Q2.3**: Should the app work with dashboards offline?
  - Cache dashboard data locally? Yes
  - Ability to design without HA connection and upload later? Yes.  This should be default - work on offline version of a dashboard and you have to explictly click a button to upload it into "production"

### 3. Visual Editor Features
- **Q3.1**: Core editing capabilities needed:
  - Drag-and-drop card positioning? Yes
  - Grid/layout system (follow HA's grid system exactly)? Yes.  Placement of cards should be limited to whatever HA can do.  I don't want to be able to do something in the visual editor that will not be renedered correctly in HA.
  - Visual property editors (color pickers, icon selectors)? Yes
  - Live preview of changes? Yes

- **Q3.2**: How should entities be handled?
  - Fetch available entities from HA instance? Yes
  - Allow manual entity ID entry? Yes. But the app should validate the entity exists.  If an entity doesn't exist then this should be indicated with an exclamation icon on the card.
  - Entity browser/search interface? Yes
  - Show entity states in preview? Yes

- **Q3.3**: Undo/redo functionality required? Yes

- **Q3.4**: Should there be a code view alongside visual view?
  - Allow switching between visual and YAML editing? Yes.  If yaml is edited, the changes are displayed in real time
  - Syntax highlighting for YAML? Yes

### 4. Dashboard Extensions/Custom Cards
- **Q4.1**: Extension detection:
  - Auto-detect installed HACS/custom cards from HA instance? Yes
  - Manual selection of which extensions to enable? Yes
  - How to handle if extension installed in HA but not supported by editor? Display message listing the extensions that are installed in HA but not supported and provide a link to the issues section of the repository so we can track what people want.

- **Q4.2**: Extension support priority (which to implement first):
  - bubble-card - First - Second
  - apexcharts-card - First
  - button-card - Third
  - card-mod - Fourth
	- power-flow-card-plus - Sixth
  - Others? (mushroom-cards, mini-graph-card, etc.) - Seventh

- **Q4.3**: For each extension:
  - Full visual editing of all properties? Yes
  - Or basic support with YAML editing for advanced features? Yes
  - Should we render actual card previews or simplified representations? Render full card pregviews with dummy data for the entities.

### 5. User Interface & Experience
- **Q5.1**: Primary workflow:
  - Multi-panel interface (file tree, canvas, properties panel)? Yes.  All three
  - Tab-based for multiple dashboards? Yes
  - Single dashboard focus? Yes

- **Q5.2**: Theme/appearance:
  - Match Home Assistant theme? Yes
  - Dark/light mode support? Yes
  - Custom themes? Yes

- **Q5.3**: Asset management:
  - Upload/manage images for backgrounds?
  - Icon library integration (MDI icons)?

### 6. Technical Architecture Preferences  - Based on the requirements I want you to recommend the framework.
- **Q6.1**: Desktop application framework preference:
  - Electron (web technologies)?
  - Tauri (Rust + web frontend, lighter than Electron)?
  - Native frameworks (Qt, .NET MAUI)?
  - Any preference or should I recommend based on requirements?

- **Q6.2**: Distribution method:
  - Portable executable? Yes
  - Installer (Windows MSI, Linux .deb/.rpm)? No
  - Auto-update capability needed? - No.  Notify only

- **Q6.3**: Development priorities:
  - Faster development vs. smaller binary size? - Faster developement
  - Native OS integration importance? - Yes
  - Performance requirements for large dashboards? - Should be little to no delay in render when editing.

### 7. Data Safety & Validation
- **Q7.1**: Before writing to Home Assistant:
  - Validate configuration syntax? Yes
  - Create automatic backup of existing dashboard? - Yes when deploying to production
  - Preview changes before applying? - Yes.  Although preview should be realtime

- **Q7.2**: Error handling:
  - How to handle HA connection failures? - Have a button to test HA connection.  If it fails, provide verbose error/response with a button to open a window to configure connection
  - Validation errors in dashboard config?  - Provide verbose error/response.  If know, provide "Help" or advise on how configuration error can be resolved
  - Unsupported card types? - Display message providing details of unsupported card type and a link to Issues section of repository

### 8. Future Considerations
- **Q8.1**: Collaboration features (future):
  - Share dashboard templates? Yes
  - Community template repository? Yes

- **Q8.2**: Mobile support:
  - Desktop only for now?  Yes
  - Consider mobile app later? No

### 9. Development & Testing
- **Q9.1**: Testing approach:
  - Do you have a Home Assistant instance for testing? - Not yet.  But I can create one.
  - Version of Home Assistant? 2025.12
  - Which extensions do you currently use?  Mushroom, mini-graph, bubble card, button card, apexcharts-card, card mod, power-flow-card-plus, better thermostat ui, muchroom themes, template-entity-row are the key ones.

- **Q9.2**: Development timeline:
  - MVP (Minimum Viable Product) feature set? Yes.  Prioritise the backlog for MVP.
  - Phased development approach?

## Initial Technology Stack Recommendation

Based on requirements so far, I'm considering:

### Option A: Electron + React/Vue (Recommended for MVP) - Use this stack
**Pros:**
- Cross-platform (Windows/Linux) with single codebase
- Rich ecosystem of UI libraries
- Easier to find developers/resources
- Fast development cycle
- Web technologies familiar to most developers

**Cons:**
- Larger application size (~150-200MB)
- Higher memory usage

### Option B: Tauri + React/Vue (Recommended for Production)
**Pros:**
- Cross-platform with smaller footprint (~10-20MB)
- Better security model
- Lower memory usage
- Rust backend for performance-critical operations

**Cons:**
- Newer framework, smaller community
- Slightly more complex setup

### Frontend Framework Suggestion:
- **React** + **TypeScript** for type safety
- **Material-UI** or **Ant Design** for professional UI components
- **React Flow** or **React Grid Layout** for visual editor
- **Monaco Editor** for YAML code editing

### Backend/API Layer:
- Home Assistant REST API for dashboard CRUD
- WebSocket API for live entity states
- TypeScript/JavaScript for API integration

## Next Steps

Please answer the questions above, particularly:
1. **Critical**: Q1.1, Q1.2 (authentication approach)
2. **Critical**: Q2.1 (dashboard type support)
3. **Critical**: Q3.1, Q3.2 (core editor features)
4. **Critical**: Q4.2 (extension priority)
5. **Critical**: Q6.1 (framework preference)

This will help me create a detailed technical specification and project plan.
