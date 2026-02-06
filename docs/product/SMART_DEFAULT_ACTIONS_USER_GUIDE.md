# Smart Default Actions (Feature 3.1)

Smart Default Actions automatically choose a sensible `tap_action` based on an entity’s domain (e.g., `switch.*` → `toggle`, `sensor.*` → `more-info`). This reduces manual configuration while keeping an easy override path.

## Where to configure
- Properties Panel → (Button / Custom Button Card) → **Smart Default Actions**

## How precedence works
1) If `tap_action` is explicitly set, it is always used (**User-defined**).
2) Else if `smart_defaults: true`, the computed action is used (**Smart default**).
3) Else, no smart action is applied (**None**).

To preserve existing dashboards, legacy button cards without `smart_defaults` may still behave as **Legacy default** (toggle) until you explicitly opt in/out.

## Domain mapping table

| Domain | Default tap action |
|---|---|
| `switch` | `toggle` |
| `light` | `toggle` |
| `climate` | `more-info` |
| `sensor` | `more-info` |
| `binary_sensor` | `more-info` |
| `cover` | `toggle` |
| `lock` | `call-service: lock.unlock` |
| `script` | `call-service: script.turn_on` |
| `automation` | `toggle` |
| `camera` | `more-info` |
| `media_player` | `toggle` |
| `fan` | `toggle` |
| `vacuum` | `call-service: vacuum.start` |

## YAML examples

Enable smart defaults:
```yaml
smart_defaults: true
```

Override with a user-defined tap action:
```yaml
smart_defaults: true
tap_action:
  action: more-info
```

