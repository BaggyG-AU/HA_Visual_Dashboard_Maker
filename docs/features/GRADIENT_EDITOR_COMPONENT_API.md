# Gradient Editor Component API

Location: `src/components/GradientEditor.tsx` and `src/components/GradientPickerInput.tsx`

## `<GradientEditor>`
| Prop | Type | Description |
|------|------|-------------|
| `value?` | `string` | Current gradient CSS or raw background value; parsed to initialize state. |
| `onChange?` | `(css: string) => void` | Fired whenever the gradient updates (angle/type/stop/preset). Emits normalized CSS. |
| `data-testid?` | `string` | Base test id (defaults to `gradient-editor`). Derived ids append `-type-toggle`, `-angle-input`, `-stop-<id>`, etc. |

Behavior:
- Supports `linear` and `radial` gradients with angle/shape/position controls.
- Color stops can be added/removed/reordered; color uses ColorPickerInput.
- Preset library with search, save, import/export (JSON).
- Emits normalized CSS via `onChange`.

## `<GradientPickerInput>`
| Prop | Type | Description |
|------|------|-------------|
| `value?` | `string` | Current background value; parsed to gradient for preview. |
| `onChange?` | `(css: string) => void` | Called when inline input text or popover GradientEditor changes. |
| `disabled?` | `boolean` | Disables popover and input. |
| `readOnly?` | `boolean` | Prevents edits but keeps display. |
| `data-testid?` | `string` | Base test id (defaults to `gradient-picker-input`). Swatch/test ids mirror the GradientEditor (`-swatch`, `-editor`, `-preview`). |

Behavior:
- Renders text input with gradient swatch prefix and live inline preview.
- Opens GradientEditor in a Popover rendered to `document.body` for portal safety.
- Keyboard: swatch is focusable; `Enter`/`Space` opens popover.

## Testing Hooks
- Gradient editor base: `advanced-style-gradient-input-editor`
- Stops list: `...-stops` with rows `...-stop-<id>`
- Angle input: `...-angle-input`
- Presets: `...-preset-<presetId>`, user presets `...-user-preset-<id>`
- Import/export: `...-preset-import`, `...-preset-export`, hidden file input `...-preset-file-input`

## Events and Side Effects
- Uses `useGradientPresets` for user preset persistence (localStorage).
- File operations use `fileService` to support Electron (native dialogs) and web (download/anchor fallback).
- Emits ARIA labels for sliders, inputs, and stop rows to satisfy WCAG keyboard navigation.
