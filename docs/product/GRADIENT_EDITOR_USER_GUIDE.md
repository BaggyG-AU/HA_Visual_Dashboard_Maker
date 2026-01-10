# Gradient Editor User Guide

The Gradient Editor lets you configure linear or radial gradients for card backgrounds directly inside the Properties Panel. It uses the same Color Picker controls for each stop and keeps YAML in sync without manual edits.

## Where You’ll See It
- Properties Panel → Advanced Styling tab → **Background** → select **Gradient** → open the Gradient picker.
- Works for any card that supports `style` with `background`.

## Supported CSS Formats
- Linear: `linear-gradient(<angle>deg, <color> <percent>%, ...)`
  - Example: `linear-gradient(120deg, #ff5858 0%, #f09819 100%)`
- Radial: `radial-gradient(<shape> at <position>, <color> <percent>%, ...)`
  - Example: `radial-gradient(circle at center, #111111 0%, #222222 100%)`
- Colors: hex (`#rgb`, `#rgba`), `rgb/rgba`, `hsl/hsla`, and CSS variables (`var(--primary)`).

## Keyboard-Only Workflow
1) Focus the swatch and press `Enter` to open the popover.
2) `Tab` to the stop list; `Enter` adds a new stop; `Delete` removes the focused stop.
3) `ArrowLeft/ArrowRight` adjust stop position (hold `Shift` for 10% steps).
4) `Tab` to the angle input; `Arrow` keys adjust angle (Shift = 10°).
5) Press `Escape` to close color popovers; `Tab`/`Shift+Tab` cycles within the editor.

## Presets, Import/Export
- Built-in categories (Material, Nature, Tech, Monochrome) plus user presets.
- **Save** stores the current gradient as a user preset.
- **Export** downloads `gradient-presets.json`; **Import** loads a JSON file created by Export.

## YAML Round-Trip
- Gradients persist in YAML as `style` background, e.g. `background: linear-gradient(...);`
- Switching between Advanced Styling and YAML tabs preserves the gradient; edits in YAML rehydrate the editor.

## Accessibility
- ARIA labels on angle/position controls and stop rows.
- Stop list uses `role="listbox"` and `role="option"` for screen readers.
- Focus state is visible on the selected stop; swatch is keyboard-focusable.

## Troubleshooting
- **Gradient disappeared after typing**: ensure the value matches the formats above; invalid strings revert to the last valid gradient.
- **Import failed**: JSON must contain an array of presets with `{ id, name, category, css }`.
- **Keyboard focus lost**: press `Tab` to re-enter the popover; `Escape` closes nested color pickers before tabbing.
