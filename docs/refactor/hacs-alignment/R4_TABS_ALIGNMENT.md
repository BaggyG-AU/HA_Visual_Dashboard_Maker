# R4: Tabs Alignment — `custom:tabs-card` → `custom:tabbed-card`

## Mandatory Pre-Reading

1. `ai_rules.md` (highest priority; immutable)
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md`

**Tripwire phrase (quote exactly):** "The fastest correct fix is already in the repository."

---

## Objective

Rename `custom:tabs-card` to `custom:tabbed-card` and restructure the config to match the upstream kinghat/tabbed-card HACS card. The key structural change is moving from HAVDM's flat `tabs[].title`/`tabs[].icon` to upstream's `tabs[].attributes.label`/`tabs[].attributes.icon` pattern, and from `tabs[].cards[]` (plural) to `tabs[].card` (singular).

---

## Upstream HACS Card Schema: `custom:tabbed-card`

### Top-Level Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `string` | — | Must be `custom:tabbed-card` |
| `options` | `object` | — | Global options |
| `options.defaultTabIndex` | `number` | `0` | 0-based index of default active tab |
| `styles` | `object` | — | CSS custom properties applied to ALL tabs |
| `attributes` | `object` | — | Default attributes applied to ALL tabs |
| `tabs` | `TabDef[]` | — | **Required.** Array of tab definitions |

### Tab Definition

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `card` | `Card` | — | **Required.** Single HA card config for this tab's content |
| `styles` | `object` | — | Per-tab CSS overrides (take precedence over global) |
| `attributes` | `object` | — | Per-tab attribute overrides (take precedence over global) |

### Tab Attributes

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | `string` | `""` | Tab header text |
| `icon` | `string` | `""` | MDI icon (e.g., `mdi:fire`) |
| `isFadingIndicator` | `boolean` | `false` | Fade indicator instead of slide |
| `minWidth` | `boolean` | `false` | Shrink tab to minimum width |
| `isMinWidthIndicator` | `boolean` | `false` | Shrink indicator to content |
| `stacked` | `boolean` | `false` | Stack icon above label |

### CSS Custom Properties (via `styles`)

| Property | Default | Description |
|----------|---------|-------------|
| `--mdc-theme-primary` | HA theme color | Active tab text/indicator/ripple color |
| `--mdc-tab-text-label-color-default` | `rgba(225,225,225,0.8)` | Inactive tab label color |
| `--mdc-typography-button-font-size` | `14px` | Tab label font size |

### Upstream YAML Examples

**Basic:**
```yaml
type: custom:tabbed-card
tabs:
  - attributes:
      label: Lights
    card:
      type: entities
      entities:
        - light.living_room
        - light.kitchen
  - attributes:
      label: Sensors
    card:
      type: entities
      entities:
        - sensor.temperature
        - sensor.humidity
```

**With icons, stacking, and default tab:**
```yaml
type: custom:tabbed-card
options:
  defaultTabIndex: 1
styles:
  --mdc-theme-primary: yellow
  --mdc-tab-text-label-color-default: rgba(225, 225, 225, 0.8)
attributes:
  stacked: true
tabs:
  - attributes:
      label: Lights
      icon: mdi:lightbulb
    card:
      type: entities
      entities:
        - light.living_room
  - attributes:
      label: Climate
      icon: mdi:thermometer
    card:
      type: thermostat
      entity: climate.living_room
```

**Multiple cards in one tab (use a stack):**
```yaml
type: custom:tabbed-card
tabs:
  - attributes:
      label: Overview
    card:
      type: vertical-stack
      cards:
        - type: button
          entity: light.living_room
        - type: entities
          entities:
            - sensor.temperature
```

---

## Current HAVDM Implementation (What Exists Today)

### Type string: `custom:tabs-card`

### HAVDM YAML format:
```yaml
type: custom:tabs-card
tab_position: top        # 'top' | 'bottom' | 'left' | 'right'  (HAVDM-only)
tab_size: default        # 'default' | 'small' | 'large'  (HAVDM-only)
default_tab: 0
animation: none          # 'none' | 'fade' | 'slide'  (HAVDM-only)
lazy_render: true        # (HAVDM-only)
tabs:
  - title: Lights
    icon: mdi:lightbulb
    badge: "3"           # (HAVDM-only)
    count: 5             # (HAVDM-only)
    cards:
      - type: button
        entity: light.living_room
      - type: entities
        entities:
          - sensor.temperature
```

### HAVDM-Only Features (keep internally, strip on export):
- `tab_position` — upstream tabs are always on top
- `tab_size` — upstream uses CSS custom properties instead
- `animation` — upstream has no animation config
- `lazy_render` — upstream always renders active tab
- `tabs[].badge` — upstream has no badge support
- `tabs[].count` — upstream has no count support
- `tabs[].cards[]` (plural) — upstream uses singular `tabs[].card`

### Key Structural Differences:
1. **`tabs[].title` → `tabs[].attributes.label`**
2. **`tabs[].icon` → `tabs[].attributes.icon`**
3. **`tabs[].cards[]` (array) → `tabs[].card` (singular Card)**
4. **`default_tab` → `options.defaultTabIndex`**
5. **No global `attributes` or `styles` support in HAVDM**

---

## Files to Modify

### 1. Type Definitions
**File**: `src/types/tabs.ts`

**Replace with upstream-aligned types:**

```typescript
import type { Card } from './dashboard';

// Upstream tabbed-card types
export interface TabbedCardAttributes {
  label?: string;
  icon?: string;
  isFadingIndicator?: boolean;
  minWidth?: boolean;
  isMinWidthIndicator?: boolean;
  stacked?: boolean;
}

export interface TabbedCardStyles {
  [key: string]: string;  // CSS custom properties
}

export interface TabbedCardTab {
  card?: Card;
  styles?: TabbedCardStyles;
  attributes?: TabbedCardAttributes;
}

export interface TabbedCardOptions {
  defaultTabIndex?: number;
}

export interface TabsCardConfig {
  type: 'custom:tabbed-card';
  options?: TabbedCardOptions;
  styles?: TabbedCardStyles;
  attributes?: TabbedCardAttributes;
  tabs?: TabbedCardTab[];
  // HAVDM-only extensions (stripped on export)
  _havdm_tab_position?: 'top' | 'bottom' | 'left' | 'right';
  _havdm_tab_size?: 'default' | 'small' | 'large';
  _havdm_animation?: 'none' | 'fade' | 'slide';
  _havdm_lazy_render?: boolean;
}

// Internal normalized config (used by TabsPanel component)
export type TabsPosition = 'top' | 'bottom' | 'left' | 'right';
export type TabsSize = 'default' | 'small' | 'large';
export type TabsAnimation = 'none' | 'fade' | 'slide';

export interface NormalizedTabConfig {
  title: string;
  icon: string;
  badge?: string;
  count?: number;
  cards: Card[];
}

export interface NormalizedTabsCardConfig {
  tab_position: TabsPosition;
  tab_size: TabsSize;
  default_tab: number;
  animation: TabsAnimation;
  lazy_render: boolean;
  tabs: NormalizedTabConfig[];
}
```

### 2. Service Layer
**File**: `src/services/tabsService.ts`

**Changes:**
- `normalizeTabsConfig()` must now parse the upstream `tabs[].attributes.label`/`tabs[].attributes.icon` format
- When `tabs[].card` (singular) is present, wrap it in a single-element `cards[]` array internally
- When `tabs[].cards[]` (HAVDM format) is present, keep as-is internally
- Map `options.defaultTabIndex` → `default_tab`
- Map `_havdm_*` prefixed properties to internal config
- Add `toUpstreamTabbedCard(config: NormalizedTabsCardConfig): object` export function:
  - Converts `tabs[].title` → `tabs[].attributes.label`
  - Converts `tabs[].icon` → `tabs[].attributes.icon`
  - Converts `tabs[].cards[]` → `tabs[].card` (if single card) or `tabs[].card: { type: 'vertical-stack', cards: [...] }` (if multiple)
  - Converts `default_tab` → `options.defaultTabIndex`
  - Strips `_havdm_*` properties

### 3. Component
**File**: `src/features/tabs/TabsPanel.tsx`

**Changes:**
- Update import of `TabsCardConfig` type (same module, new shape)
- Component already works with `NormalizedTabsCardConfig` — no structural changes needed
- Update the type reference in props interface if needed

### 4. Card Registry
**File**: `src/services/cardRegistry.ts` (line ~343)

**Changes:**
```typescript
// BEFORE:
{
  type: 'custom:tabs-card',
  name: 'Tabs',
  source: 'custom',
  defaultProps: {
    tab_position: 'top',
    tab_size: 'default',
    default_tab: 0,
    animation: 'none',
    lazy_render: true,
    tabs: [{ title: 'Tab 1', icon: 'mdi:tab', cards: [] }],
  },
  requiredProps: ['tabs'],
}

// AFTER:
{
  type: 'custom:tabbed-card',
  name: 'Tabbed Card',
  source: 'hacs',
  defaultProps: {
    tabs: [{
      attributes: { label: 'Tab 1', icon: 'mdi:tab' },
      card: { type: 'markdown', content: 'Tab content' },
    }],
  },
  requiredProps: ['tabs'],
}
```

### 5. BaseCard
**File**: `src/components/BaseCard.tsx` (line ~260)

**Changes:**
```typescript
// BEFORE:
case 'custom:tabs-card':

// AFTER:
case 'custom:tabbed-card':
```

### 6. PropertiesPanel
**File**: `src/components/PropertiesPanel.tsx`

**Changes:**
- Replace all `'custom:tabs-card'` with `'custom:tabbed-card'`
- Lines: ~631, ~1177, ~3002
- Update form field names to match new property paths (e.g., `attributes.label` instead of `title`)
- Keep HAVDM-only properties (tab_position, animation, etc.) in the form as editor features
- Add new upstream properties to form: `stacked`, `isFadingIndicator`, `minWidth`, `styles`

### 7. JSON Schema
**File**: `src/schemas/ha-dashboard-schema.json` (line ~191)

**Changes:**
- Replace `"custom:tabs-card"` with `"custom:tabbed-card"` in the type enum

### 8. Unit Tests
**File**: `tests/unit/tabs-service.spec.ts`

**Changes:**
- Replace all `'custom:tabs-card'` with `'custom:tabbed-card'`
- Add test cases for parsing upstream format (`tabs[].attributes.label`, `tabs[].card` singular)
- Add test cases for `toUpstreamTabbedCard()` export
- Add round-trip test cases

### 9. E2E Tests
**Files:**
- `tests/e2e/tabs.spec.ts` — Update BASE_YAML, all type string refs
- `tests/e2e/tabs.visual.spec.ts` — Update BASE_YAML

### 10. DSL
**File**: `tests/support/dsl/tabs.ts` (line ~86)

**Changes:**
- Update palette search from `'custom:tabs-card'` to `'custom:tabbed-card'`
- Update palette card test ID reference

---

## Validation

The executing agent must run all three test levels after implementing changes. Follow `ai_rules.md` §5 for test execution and reporting policy.

1. **Lint**: `npm run lint`
2. **Unit tests**: `npm run test:unit -- --grep tabs`
3. **Targeted E2E tests**: `npx playwright test tests/e2e/tabs.spec.ts tests/e2e/tabs.visual.spec.ts --project=electron-e2e`

After one test run, pause → diagnose any failures → report results to the user before proceeding (per ai_rules §5).

Full regression and CI testing are handled separately and are not part of this phase.

---

## YAML Round-Trip Test Cases

### Import Test (upstream → HAVDM):
```yaml
# Input:
type: custom:tabbed-card
options:
  defaultTabIndex: 1
styles:
  --mdc-theme-primary: yellow
attributes:
  stacked: true
tabs:
  - attributes:
      label: Lights
      icon: mdi:lightbulb
    card:
      type: entities
      entities:
        - light.living_room
  - attributes:
      label: Climate
      icon: mdi:thermometer
    card:
      type: vertical-stack
      cards:
        - type: thermostat
          entity: climate.living_room
        - type: sensor
          entity: sensor.temperature
```

Expected normalized config:
- `default_tab`: 1
- `tab_position`: 'top' (default, not in upstream)
- Tab 0: title='Lights', icon='mdi:lightbulb', cards=[{type:'entities',...}]
- Tab 1: title='Climate', icon='mdi:thermometer', cards=[{type:'vertical-stack',...}]

### Export Test (HAVDM → upstream):
- `default_tab: 1` → `options: { defaultTabIndex: 1 }`
- `tabs[0].title` → `tabs[0].attributes.label`
- `tabs[0].icon` → `tabs[0].attributes.icon`
- `tabs[0].cards` (if single) → `tabs[0].card`
- `tabs[0].cards` (if multiple) → `tabs[0].card: { type: 'vertical-stack', cards: [...] }`
- `tab_position`, `animation`, `lazy_render`, `badge`, `count` → **stripped**
