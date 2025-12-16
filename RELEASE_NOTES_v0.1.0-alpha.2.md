# Release Notes - v0.1.0-alpha.2

**Release Date**: December 16, 2025

## Overview

Alpha 2 release focuses on improved dashboard rendering accuracy and full **layout-card** integration for pixel-perfect dashboard layouts that match Home Assistant's UI exactly.

## New Features

### Layout-Card Integration (Phase 7)
- **Full layout-card support** with bidirectional conversion
- **Three layout modes** automatically detected:
  1. **Layout-Card Grid** - Uses `view_layout` with `grid_column`/`grid_row` for exact positioning
  2. **Internal Layout** - Custom `layout` property for app-specific dashboards
  3. **Smart Masonry** - Auto-calculated dimensions based on card content
- **CSS Grid parsing** - Supports all layout-card syntax ("1 / 7", "span 6", etc.)
- **Automatic mode detection** - App recognizes and handles all three modes seamlessly

### Improved Card Dimension Calculations
- **Smart height estimation** based on card type and content
- **Compact rendering** matching Home Assistant's visual density
- **Card-specific calculations**:
  - Entities cards: 1.5 rows per entity + 2 rows for title
  - ApexCharts: 40% reduction from configured height
  - Power Flow cards: Reduced to 8 rows (was 12)
  - Vertical stacks: 20% total height reduction
- **More compact placeholders** for unsupported cards

## Technical Improvements

### New Utilities
- **layoutCardParser.ts** - Parse layout-card `view_layout` to react-grid-layout coordinates
  - Parse CSS Grid syntax (1-based → 0-based indexing)
  - Extract grid configuration from view layout
  - Support for named grid areas and mediaquery
- **layoutCardExporter.ts** - Export react-grid-layout back to `view_layout` format
  - Convert coordinates to CSS Grid syntax
  - Apply view_layout to cards automatically
  - Check dashboard layout mode

### Enhanced Components
- **GridCanvas.tsx** - Three-mode layout generation with automatic detection
- **UnsupportedCard.tsx** - More compact placeholder design
- **App.tsx** - Handles both layout-card and internal layout systems

### Type System Updates
- **ViewLayout interface** - Full type support for layout-card properties
- **View interface** - Added layout-card type, layout_type, and layout configuration
- **Card interfaces** - Support for view_layout property

## Documentation

### New Documentation
- **LAYOUT_CARD_INTEGRATION.md** - Comprehensive guide covering:
  - Three layout modes explained
  - Installation and setup
  - Grid coordinate system
  - Advanced features (mediaquery, named grid areas)
  - Troubleshooting and best practices
  - Conversion between modes

### Test Dashboards
- **test-dashboards/control_panel.json** - Real Home Assistant dashboard for testing
  - Contains custom HACS cards (power-flow-card-plus, apexcharts-card)
  - Masonry layout with multiple entity cards
  - Used for rendering comparison and validation

## Bug Fixes

- **Fixed: Cards rendering too tall** - Adjusted dimension calculations to better match HA's compact rendering
- **Fixed: UnsupportedCard excessive height** - Reduced padding and content size for more accurate space usage
- **Fixed: Layout preservation** - Proper handling of both view_layout and internal layout properties

## Known Limitations

- **Custom card rendering** - Cards like ApexCharts and Power Flow show placeholders instead of actual content
  - This causes slight height discrepancies
  - Will be resolved when card-specific renderers are implemented in future phases
- **Masonry dashboards** - Height calculations are estimates, not exact
  - Layout-card mode provides exact positioning
  - Recommend converting masonry dashboards to layout-card for precise control

## Migration Notes

### From Alpha 1 to Alpha 2

1. **Dashboards with no layout** - Will automatically use smart masonry mode
2. **Dashboards with internal layout** - Continue working as before
3. **Home Assistant dashboards** - Can now be imported with exact positioning if using layout-card

### Recommended Workflow

For pixel-perfect dashboards that render identically in both the app and Home Assistant:

1. Install **layout-card** in Home Assistant (via HACS)
2. Create/edit dashboards in the visual editor
3. Dashboards automatically export with `view_layout` properties
4. Import to Home Assistant - layout will be identical

Alternatively, continue using masonry or internal layout for simpler workflows.

## Technical Details

### Grid System
- **12-column grid** (standard)
- **30px row height** (default)
- **8px gap** between cards
- **CSS Grid 1-based indexing** converted to react-grid-layout 0-based

### Layout-Card Format
```yaml
views:
  - type: custom:layout-card
    layout_type: grid
    layout:
      grid_template_columns: repeat(12, 1fr)
      grid_template_rows: repeat(auto-fill, 30px)
    cards:
      - type: entities
        view_layout:
          grid_column: 1 / 7    # Columns 1-6 (0-indexed: x:0, w:6)
          grid_row: 1 / 5       # Rows 1-4 (0-indexed: y:0, h:4)
```

## Next Steps (Planned for Alpha 3)

- **Card-specific renderers** - Implement actual rendering for:
  - ApexCharts cards (charts, graphs)
  - Power Flow cards (energy diagrams)
  - Enhanced entities card styling
  - Stack containers (vertical/horizontal)
- **Improved visual fidelity** - More accurate rendering to match HA UI
- **Card properties editor** - Edit card-specific properties in the properties panel

## Contributors

- BaggyG-AU
- Claude Sonnet 4.5

## Resources

- [Layout-Card GitHub](https://github.com/thomasloven/lovelace-layout-card)
- [Layout-Card Integration Guide](LAYOUT_CARD_INTEGRATION.md)
- [Home Assistant Dashboard Docs](https://www.home-assistant.io/dashboards/)

---

**Full Changelog**: [v0.1.0-alpha.1...v0.1.0-alpha.2](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/compare/v0.1.0-alpha.1...v0.1.0-alpha.2)
