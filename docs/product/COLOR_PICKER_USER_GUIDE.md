# Color Picker User Guide

The Properties Panel uses a popover color picker for card color fields. It supports multiple formats, recent colors, and keyboard-only workflows.

## Where You’ll See It

Common examples:
- `custom:button-card` → **Color** (card border/accent) and **Icon Color**
- Mushroom cards → **Icon color** (where supported)
- Card-mod style field helper → inline `color:` in CSS style strings

## Supported Formats

You can type any of these directly into the value field:
- Hex: `#RRGGBB`, `#RRGGBBAA`
- RGB/RGBA: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
- HSL/HSLA: `hsl(210, 50%, 50%)`, `hsla(210, 50%, 50%, 0.5)`

Notes:
- Invalid values are rejected and the input reverts to the last valid value.
- Some card fields may accept special values like `auto` (where supported by that card); these bypass the picker validation and are treated as a raw string.

## Recent Colors

- Recent colors appear after you successfully commit a value.
- Recent colors persist locally (per test profile / user profile).
- Use **Clear** to remove the stored recent colors.

## Keyboard-Only Workflow

1) Tab to the color swatch and press `Enter` to open the popover.
2) Tab to the value field and type a color.
3) Press `Enter` to confirm the typed value.
4) Press `Escape` to close the popover.

## Troubleshooting

- **Popover closes unexpectedly**: click back into the input field to reopen, or use the swatch and `Enter`.
- **Value “reverts” after typing**: the value was not valid for the current format; type a supported format and press `Enter`.

