# Entity Type Dashboard Generator

## Overview

The Entity Type Dashboard Generator is a feature that automatically creates pre-configured dashboards based on your Home Assistant entity types and domains. Instead of starting from scratch, users can select a category (like Lights, Surveillance, Climate, etc.) and get an instant dashboard with relevant cards already configured.

## User Flow

### 1. Creating a Dashboard from Entity Type

1. Click "New Dashboard" button
2. Select "From Entity Type" option (requires HA connection)
3. Choose a category from available options
4. Click "Create Dashboard"
5. Dashboard opens in edit mode with auto-generated cards

### 2. Available Categories

The system supports the following categories:

#### Lights 💡
- **Description**: Control and monitor all your lighting
- **Required Domains**: `light`
- **Generated Cards**: Light cards with on/off toggles and brightness controls
- **Layout**: Two-column grid with up to 6 light entities

#### Surveillance 📹
- **Description**: Monitor security cameras
- **Required Domains**: `camera`
- **Generated Cards**: Picture-entity cards with live camera streams
- **Layout**: Two-column grid with up to 6 camera entities

#### Power Management ⚡
- **Description**: Energy consumption and battery monitoring
- **Required Domains**: `sensor` (filtered by device_class: power, energy, battery)
- **Generated Cards**: Sensor cards with line graphs for trend visualization
- **Layout**: Two-column grid with up to 6 power/energy/battery sensors

#### Environment/Aircon 🌡️
- **Description**: Climate control and environmental monitoring
- **Required Domains**: `climate`, `sensor` (temperature/humidity)
- **Generated Cards**:
  - Thermostat cards for climate entities
  - Sensor cards with line graphs for temperature/humidity
- **Layout**: Mixed layout with climate controls first, then sensors

## Technical Implementation

### Components

#### 1. `NewDashboardDialog.tsx`
Main entry point for dashboard creation with three options:
- Blank Dashboard
- From Template (placeholder)
- From Entity Type (new feature)

#### 2. `EntityTypeDashboardWizard.tsx`
Category selection wizard that:
- Loads cached entities from HA
- Filters available categories based on entity domains
- Shows entity counts per category
- Handles offline/error states
- Triggers dashboard generation

#### 3. `dashboardGeneratorService.ts`
Core logic for:
- Category availability checking
- Entity filtering and sorting
- Dashboard configuration generation
- Card creation with appropriate properties

### Data Flow

```
User clicks "From Entity Type"
  ↓
EntityTypeDashboardWizard opens
  ↓
Loads cached entities via window.electronAPI.getCachedEntities()
  ↓
Filters categories based on available entity domains
  ↓
User selects category
  ↓
dashboardGeneratorService.generateDashboard(categoryId, entities)
  ↓
Returns DashboardConfig object
  ↓
Serialized to YAML via yamlService
  ↓
Loaded into editor via loadDashboard()
```

### Entity Selection Logic

1. **Filtering**: Entities are filtered by domain matching the category's required domains
2. **Sorting**: Filtered entities are sorted alphabetically by `entity_id`
3. **Limiting**: Only the first 6 entities are used to prevent overwhelming dashboards
4. **Layout**: Cards are placed in a two-column grid with automatic positioning

### Error Handling

- **Offline State**: Shows clear error message and blocks feature access
- **No Entities**: Displays empty state with refresh button
- **No Categories**: Shows message if no entities match any category
- **Partial Failure**: Not implemented (generates what it can or nothing)

## Testing

### E2E Tests (`tests/e2e/entity-type-dashboard.spec.ts`)

Tests cover:
- ✅ Option visibility in new dashboard dialog
- ✅ Blank dashboard creation
- ✅ Offline error handling
- ✅ Category display when connected
- ✅ Dashboard generation for each category
- ✅ Empty state when no entities available
- ✅ Entity limit (6 max per category)

### Integration Tests (`tests/integration/dashboard-generator.spec.ts`)

Tests cover:
- ✅ Category filtering logic
- ✅ Entity sorting and limiting
- ✅ Dashboard structure generation
- ✅ Card type and property correctness
- ✅ Grid layout positioning

## Manual QA Checklist

### Category Selection
- [ ] All three dashboard creation options visible in dialog
- [ ] Tooltips show appropriate help text for each option
- [ ] "From Entity Type" disabled when offline with clear message
- [ ] Category cards show correct entity counts
- [ ] Selected category highlighted with blue border
- [ ] Create button disabled until category selected

### Dashboard Generation
- [ ] Lights dashboard creates light cards with correct entities
- [ ] Surveillance dashboard creates picture-entity cards
- [ ] Power dashboard filters correct sensor types (power/energy/battery)
- [ ] Climate dashboard includes both climate and sensor cards
- [ ] Maximum 6 entities used per dashboard
- [ ] Entities sorted alphabetically
- [ ] Cards have proper grid layout positions
- [ ] Dashboard opens in edit mode after creation
- [ ] Success message shows correct title and card count

### Error States
- [ ] Offline: Clear error message in wizard
- [ ] No entities: Empty state with refresh button
- [ ] No matching entities for category: Not selectable or shows 0 count
- [ ] Loading state shows spinner while fetching entities

### Platform Support
- [ ] Windows: All features work correctly
- [ ] Linux/WSL: All features work correctly
- [ ] Layout renders properly on both platforms

## Future Enhancements

### Planned
- [ ] More categories (Media, Security, Weather, etc.)
- [ ] Customizable entity limits
- [ ] Area-based filtering (e.g., "Living Room Lights")
- [ ] Advanced card customization options
- [ ] Save custom category templates

### Deferred
- [ ] AI-suggested layouts based on entity relationships
- [ ] Multi-category dashboards
- [ ] Custom category creation
- [ ] Entity deduplication across categories

## Known Limitations

1. **Fixed Entity Limit**: Currently hardcoded to 6 entities max per dashboard
2. **No Area Support**: Doesn't group entities by HA areas yet
3. **No Partial Failure Recovery**: All-or-nothing generation (no fallback to partial dashboard)
4. **Power Category Filtering**: Relies on device_class and unit_of_measurement, may miss some sensors
5. **No Template Option Yet**: "From Template" option is a placeholder

## Related Documentation

- [Testing Standards](../testing/TESTING_STANDARDS.md)
- [Dashboard Generator Service](../../src/services/dashboardGeneratorService.ts)
- [Entity Browser](../../src/components/EntityBrowser.tsx)
- [Architecture Decision](../architecture/ARCHITECTURE_DECISION.md)
