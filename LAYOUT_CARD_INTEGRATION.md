# Layout-Card Integration Guide

## Overview

This application now supports **layout-card** for precise grid-based positioning of Home Assistant dashboard cards. This ensures your dashboards render identically in both the visual editor and Home Assistant's UI.

## What is Layout-Card?

[layout-card](https://github.com/thomasloven/lovelace-layout-card) is a custom Lovelace card by Thomas Lovén that provides full control over card placement using CSS Grid. It's the recommended approach for creating dashboards that look exactly the same across all devices and in this visual editor.

## Three Layout Modes

The app automatically detects and supports three layout modes:

### 1. **Layout-Card Grid** (Recommended)
- Uses `view_layout` with `grid_column` and `grid_row` properties
- Exact positioning that's identical in HA and this app
- Supports responsive layouts with mediaquery
- **Best for**: Production dashboards that need precise control

**Example:**
```yaml
views:
  - type: custom:layout-card
    layout_type: grid
    layout:
      grid_template_columns: repeat(12, 1fr)
      grid_template_rows: repeat(auto-fill, 30px)
    cards:
      - type: entities
        title: "Living Room"
        view_layout:
          grid_column: 1 / 7    # Columns 1-6
          grid_row: 1 / 5       # Rows 1-4
```

### 2. **Internal Layout**
- Uses custom `layout` property (app-specific)
- Simple x, y, w, h coordinates
- **Best for**: Quick prototyping, local dashboards

**Example:**
```yaml
cards:
  - type: entities
    title: "Kitchen"
    layout:
      x: 0
      y: 0
      w: 6
      h: 4
```

### 3. **Smart Masonry**
- Automatically calculated based on card content
- No manual positioning required
- **Best for**: Simple dashboards, getting started

## Installation

### Prerequisites

To use layout-card mode with Home Assistant, you need to install layout-card:

1. **Via HACS** (recommended):
   - Open HACS in Home Assistant
   - Go to Frontend
   - Search for "layout-card"
   - Install

2. **Manual Installation**:
   ```bash
   cd /config/www
   wget https://github.com/thomasloven/lovelace-layout-card/releases/latest/download/layout-card.js
   ```

3. **Add to resources** in Configuration → Dashboards → Resources:
   ```yaml
   url: /hacsfiles/lovelace-layout-card/layout-card.js
   type: module
   ```

## Using Layout-Card Mode

### Creating a New Dashboard

1. Create cards using drag-and-drop
2. Position and resize cards in the visual editor
3. Save the dashboard
4. The app automatically exports in layout-card format with `view_layout`

### Converting Existing Dashboards

When you download a dashboard from Home Assistant:
- If it has `view_layout` properties → automatically uses layout-card mode
- If it has `type: custom:layout-card` → automatically uses layout-card mode
- Otherwise → uses smart masonry mode

You can convert by:
1. Opening the dashboard in the app
2. Dragging cards to desired positions
3. Saving - the app will add `view_layout` properties

### Understanding Grid Coordinates

Layout-card uses CSS Grid with 1-based indexing:

- **Grid Columns**: `1 / 7` means "start at column 1, end before column 7" (spans 6 columns)
- **Grid Rows**: `1 / 5` means "start at row 1, end before row 5" (spans 4 rows)
- **Span Syntax**: `span 6` means "span 6 columns/rows"

#### Default Grid System

The app uses a 12-column grid:
- 12 columns (each 1fr = one fraction of available width)
- Rows are 30px tall
- 8px gap between cards

**Common Layouts:**
- Half width: `1 / 7` (6 columns)
- Full width: `1 / 13` (12 columns)
- Third width: `1 / 5` (4 columns)
- Quarter width: `1 / 4` (3 columns)

## Advanced Features

### Custom Grid Configuration

You can customize the grid in your dashboard YAML:

```yaml
views:
  - type: custom:layout-card
    layout_type: grid
    layout:
      grid_template_columns: repeat(12, 1fr)  # 12 equal columns
      grid_template_rows: repeat(auto-fill, 30px)  # 30px rows
      grid_gap: 8px  # Gap between cards
```

### Responsive Layouts with Mediaquery

Layout-card supports different layouts for different screen sizes:

```yaml
layout:
  mediaquery:
    "(max-width: 600px)":
      grid_template_columns: 1fr  # Single column on mobile
    "(min-width: 1200px)":
      grid_template_columns: repeat(16, 1fr)  # More columns on large screens
```

### Named Grid Areas

For complex layouts, use named grid areas:

```yaml
layout:
  grid_template_areas: |
    "header header header"
    "sidebar main main"
    "footer footer footer"
  grid_template_columns: 1fr 2fr 2fr

cards:
  - type: markdown
    view_layout:
      grid_area: header
  - type: entities
    view_layout:
      grid_area: sidebar
```

## How It Works

### Parsing (Loading Dashboards)

1. App detects layout-card dashboards by checking for:
   - `type: custom:layout-card`
   - `layout_type: grid`
   - Cards with `view_layout` properties

2. Converts `view_layout` to react-grid-layout coordinates:
   ```
   grid_column: "1 / 7"  →  x: 0, w: 6
   grid_row: "1 / 5"     →  y: 0, h: 4
   ```

3. Renders cards using react-grid-layout

### Exporting (Saving Dashboards)

1. App detects if using layout-card mode

2. Converts react-grid-layout coordinates to `view_layout`:
   ```
   x: 0, w: 6  →  grid_column: "1 / 7"
   y: 0, h: 4  →  grid_row: "1 / 5"
   ```

3. Exports YAML with layout-card structure

## Utilities

### layoutCardParser.ts

- `isLayoutCardGrid(view)` - Check if view uses layout-card
- `convertLayoutCardToGridLayout(view)` - Parse view_layout to coordinates
- `parseViewLayout(card, index, config)` - Parse individual card positions

### layoutCardExporter.ts

- `convertToLayoutCardView(view, layout)` - Convert view to layout-card format
- `convertDashboardToLayoutCard(config)` - Convert entire dashboard
- `getLayoutMode(view)` - Get human-readable layout mode description

## Troubleshooting

### Cards Not Positioning Correctly

**Problem**: Cards overlap or don't appear where expected

**Solution**:
- Check that grid coordinates don't overlap
- Ensure `grid_column` and `grid_row` use correct syntax
- Verify grid system has enough columns/rows

### Dashboard Looks Different in HA

**Problem**: Layout differs between app and Home Assistant

**Solution**:
- Ensure layout-card is installed in Home Assistant
- Check that view type is `custom:layout-card`
- Verify `layout` configuration is exported correctly

### Converting from Masonry

**Problem**: Want to switch from masonry to grid layout

**Solution**:
1. Open dashboard in app
2. Cards will auto-position in masonry
3. Manually adjust positions to desired layout
4. Add to view YAML:
   ```yaml
   type: custom:layout-card
   layout_type: grid
   ```
5. Save - app will add `view_layout` to all cards

## Best Practices

1. **Start with Layout-Card**: For new dashboards, enable layout-card mode from the start
2. **Use 12-Column Grid**: Stick to the standard 12-column system for consistency
3. **Test Responsive**: Use mediaquery to ensure layouts work on all devices
4. **Document Layouts**: Add comments in YAML to explain complex grid areas
5. **Version Control**: Keep dashboard YAML in git to track layout changes

## Resources

- [Layout-Card GitHub](https://github.com/thomasloven/lovelace-layout-card)
- [Layout-Card Community Thread](https://community.home-assistant.io/t/layout-card-take-control-of-where-your-cards-end-up/147805)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Home Assistant Dashboard Docs](https://www.home-assistant.io/dashboards/)

## Examples

See `test-dashboards/` for example dashboards using different layout modes.
