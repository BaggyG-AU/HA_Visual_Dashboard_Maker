# Color Palette User Guide

Favorite Colors Manager adds reusable palettes to the Color Picker so you can apply consistent branding across dashboards.

## Where to find it
- Open any Color Picker (e.g., button card color) and switch to the **Favorites** tab.
- Default palettes (Material, Tailwind, Home Assistant, Flat UI) are read-only but can be duplicated for customization.

## Core actions
- **New / Duplicate / Delete**: manage user palettes (defaults cannot be deleted).
- **Rename**: edit the palette name in-place (read-only for defaults).
- **Add Current**: adds the current color value from the picker into the active palette (max 20 colors, no duplicates).
- **Apply**: click a swatch to set the picker value and preview immediately.
- **Remove**: right-click a swatch in a user palette to remove it.
- **Reorder**: use ↑ / ↓ controls beside swatches in user palettes.

## Import / Export
- **Export JSON**: downloads `color-palettes.json` containing all palettes.
- **Import JSON**: loads palettes from a file created by Export (invalid entries are skipped with errors).
- **Copy CSS vars**: copies a `:root { --palette-<name>-<index>: <color>; }` block to the clipboard.

### JSON schema (per palette)
```json
{
  "name": "My Palette",
  "description": "Optional description",
  "colors": ["#112233", "#445566"],
  "isDefault": false
}
```

## Keyboard accessibility
- Tab through controls; Enter/Space activate buttons and swatches.
- Escape closes the Color Picker popover; focus indicators are visible on swatches.

## Limits & validation
- Max 20 colors per palette; duplicates are ignored (case-insensitive, normalized to hex where possible).
- Supported formats: hex (`#rgb`, `#rrggbb`, `#rrggbbaa`), `rgb/rgba`, `hsl/hsla`, and `var(...)` (stored as-is).
- Default palettes are read-only; duplicate them to customize.
