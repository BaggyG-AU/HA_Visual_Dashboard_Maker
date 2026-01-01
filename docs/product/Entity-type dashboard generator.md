User Story
As a user, I want to automatically create a dashboard based on an entity type so that I can start with a base dashboard and edit from there.

Description / Context
New dashboard flow adds From entity type / category alongside Blank and From template, leveraging HA entity data to offer curated starting dashboards per entity domain, keeping edit mode consistent with existing creation paths and handling offline/empty states gracefully.

Acceptance Criteria
- Given the user opens New Dashboard, When the menu appears, Then it shows Blank dashboard, From template, and From entity type / category options, each with a tooltip explaining what it does.
- Given the user selects From entity type / category while connected to HA, When categories are loaded, Then only categories with at least one available entity (derived from existing HA entities/domains) are listed with helper text on what will be generated.
- Given the user selects a category that has entities, When they confirm, Then a new dashboard is created, auto-populated with relevant cards/entities for that category (see Data & Logic Notes), named after the category, and opened immediately in edit mode like other creation paths.
- Given HA is offline, When the user tries From entity type / category, Then they see a clear error and the flow is blocked with guidance to connect.
- Given no entities are available or the selected category has no entities, When the user tries to proceed, Then the UI shows an empty-state message and disables creation (or offers fallback to Blank).
- Given dashboard generation fails partially (e.g., some entities missing), When creation completes, Then the dashboard still opens (falling back to blank if needed) with a warning that lists what failed.

UI / UX Notes
- Tooltips on New Dashboard options clarify Blank, From template, and From entity type / category.
- Entity type selection screen uses existing entity browser styling; include helper text describing what the generated dashboard includes.
- Loading/empty/error states are inline with existing patterns; retry button for loading categories.
- Default dashboard title is the category name (e.g., Lights Dashboard); user can rename immediately in edit mode.
- Post-create toast or inline banner summarizes what was auto-added and links to remove/edit.

Data & Logic Notes
- Reuse existing Entity Browser / HA entity retrieval logic; no new API paths.
- Categories are derived from actual entity domains/types and filtered to ones with at least one entity.
- Auto-population rules (cap at 6 entities by default, ordered by name; include HA areas when available):
  - Lights: grid with Light or Entities cards; include on/off toggles and brightness where available.
  - Surveillance: camera panel grid with available camera entities; include stream snapshots.
  - Power Management: energy/consumption overview (entities for power, energy, battery); include trend card if sensors available.
  - Environment/Aircon: climate/thermostat card per climate entity plus sensors for temperature/humidity; include mode controls.
- Layout starts with two-column responsive grid; cards grouped by category; users can edit/remove as with other dashboards.

Definition of Done
- New dashboard flow shows the three creation options with tooltips.
- Entity type flow creates dashboards with category-derived cards/entities and opens in edit mode.
- Error/empty states and fallback to blank dashboard with warning are implemented and logged for debugging.
- QA notes and documentation updated to reflect the new creation path.

Test Notes
- Add automated tests for: option visibility, category filtering by available entities, successful dashboard creation per category, partial failure fallback, and offline/empty states.
- Add manual QA checklist covering tooltip copy, helper text, and layout sanity per category on supported platforms.
