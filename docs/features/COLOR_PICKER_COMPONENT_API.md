# Color Picker Component API

This document describes the public props/events for the Color Picker components used in the Properties Panel.

## `ColorPicker`

File: `src/components/ColorPicker.tsx`

| Prop | Type | Default | Notes |
|---|---|---:|---|
| `value` | `string` | `'#000000'` | Current color value |
| `onChange` | `(value: string) => void` | — | Called when the color changes (picker interaction, format toggle, or validated input) |
| `format` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Initial format |
| `showAlpha` | `boolean` | `true` | Reserved for future alpha UI; alpha is supported via RGBA parsing/formatting |
| `showFormatToggle` | `boolean` | `true` | Shows the format toggle button |
| `showRecentColors` | `boolean` | `true` | Enables recent colors UI |
| `maxRecentColors` | `number` | `10` | Maximum recent colors stored |
| `disabled` | `boolean` | `false` | Disables interactions |
| `ariaLabel` | `string` | `'Color picker'` | Accessible label for the picker root |
| `data-testid` | `string` | `'color-picker'` | Base test id used to derive child ids |

### Test IDs (derived)

If `data-testid="X"`:
- Root: `X`
- Format toggle: `X-format-toggle`
- Value input: `X-input`
- Preview: `X-preview`
- Clear recent button: `X-clear-recent`
- Recent swatches: `X-recent-0`, `X-recent-1`, …

## `ColorPickerInput`

File: `src/components/ColorPickerInput.tsx`

| Prop | Type | Default | Notes |
|---|---|---:|---|
| `value` | `string \| undefined` | — | Current value shown in the input |
| `onChange` | `(value: string) => void` | — | Called on input changes and picker changes |
| `format` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Initial format passed to the picker |
| `showAlpha` | `boolean` | `true` | Passed to `ColorPicker` |
| `showFormatToggle` | `boolean` | `true` | Passed to `ColorPicker` |
| `showRecentColors` | `boolean` | `true` | Passed to `ColorPicker` |
| `maxRecentColors` | `number` | `10` | Passed to `ColorPicker` |
| `disabled` | `boolean` | `false` | Disables input and swatch |
| `placeholder` | `string` | `'#RRGGBB'` | Input placeholder |
| `readOnly` | `boolean` | `false` | Prevents editing/opening |
| `ariaLabel` | `string` | `'Color input'` | Accessible label for the main input |
| `data-testid` | `string` | `'color-picker-input'` | Base test id used to derive child ids |

### Test IDs (derived)

If `data-testid="X"`:
- Main input: `X`
- Swatch button: `X-swatch`
- Popover content picker: `X-picker` (this is the `ColorPicker` root)
- Popover wrapper: `X-popover`

The popover `ColorPicker` uses `data-testid="X-picker"` so its derived IDs become:
- `X-picker-format-toggle`
- `X-picker-input`
- `X-picker-preview`
- `X-picker-clear-recent`
- `X-picker-recent-0`, …

