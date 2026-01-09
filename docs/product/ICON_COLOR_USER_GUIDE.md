# Icon Color Customization Guide

Icon Color customization lets you control icon colors per card using fixed values, state-based rules, or entity attributes.

## Where to configure
- Properties Panel → Custom Button Card → **Icon Color** section.

## Modes
1) **Default (follow button)**  
   Uses the card’s default/icon theme color.

2) **Custom**  
   Pick a fixed color using the Color Picker. Stored as `icon_color`.

3) **State-based**  
   Define colors for `on`, `off`, and `unavailable`. Stored under `icon_color_states`.

4) **Attribute-based**  
   Provide an attribute name (e.g., `icon_color`). If the attribute value is a valid color, the icon uses it. Stored as `icon_color_attribute`.

## YAML fields
```yaml
icon_color_mode: custom
icon_color: "#ff8800"

icon_color_mode: state
icon_color_states:
  on: "#00ff00"
  off: "#666666"
  unavailable: "#999999"

icon_color_mode: attribute
icon_color_attribute: icon_color
```

## Gradient support (SVG icons)
Gradient strings such as `linear-gradient(...)` are supported for SVG icon previews.

## Keyboard accessibility
- Use Tab to navigate fields.
- Enter/Space activates buttons and opens pickers.
- Escape closes open popovers.
