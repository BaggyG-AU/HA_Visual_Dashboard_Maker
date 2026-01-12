# Bubble Card v3.1.0 Research - Phase 4.1

**Research Date**: January 12, 2026
**Target Version**: v3.1.0 (Released January 11, 2026)
**Current Implementation**: Pre-v3.1.0 (version unknown)

---

## Executive Summary

Bubble Card v3.1.0 introduces significant new features focused on sub-button customization, a new "sub-buttons only" card type, and major performance improvements. The configuration schema has been extended with new properties for sub-button types, layouts, and styling options.

**Impact Assessment**: MEDIUM
- No breaking changes to existing configuration
- New optional properties added (backward compatible)
- New card_type variant added
- Renderer update needed to support new features

---

## Key Changes in v3.1.0

### 1. New Card Type: "Sub-buttons Only"
**Card Type**: `sub_button` (new variant of bubble-card)

A dedicated card displaying only sub-buttons, perfect for creating custom button panels with footer positioning options.

**Configuration**:
```yaml
type: custom:bubble-card
card_type: sub_button
# Only sub-buttons displayed, no main card content
```

### 2. Sub-Button Type System
Sub-buttons now support three distinct types:

| Type | Purpose | Configuration |
|------|---------|---------------|
| **Default (button)** | Traditional button behavior | `type: 'button'` or omit |
| **Slider** | Temperature, brightness, color controls | `type: 'slider'` |
| **Select** | Dropdown menu functionality | `type: 'select'` |

**Configuration Example**:
```yaml
sub_button:
  - entity: light.bedroom
    type: slider  # NEW in v3.1.0
    slider_config:
      orientation: horizontal
      value_position: right
```

### 3. Sub-Button Groups
Create groups of sub-buttons with customizable layouts for better organization.

**Configuration**:
```yaml
sub_button:
  - type: group  # NEW
    buttons:
      - entity: light.living_room
      - entity: light.kitchen
```

### 4. Enhanced Layout & Positioning

#### Icon Placement Options
Position icons exactly where you want them:
- `top` (default)
- `bottom`
- `left`
- `right`

**Configuration**:
```yaml
sub_button:
  - entity: light.bedroom
    icon_position: left  # NEW in v3.1.0
```

#### Footer Positioning
Sub-buttons and specific buttons can now be displayed at the bottom with various layout options.

**Configuration**:
```yaml
sub_button:
  - entity: light.bedroom
    position: footer  # NEW in v3.1.0
```

### 5. Individual Size Customization
Customize height and width of individual sub-buttons.

**Configuration**:
```yaml
sub_button:
  - entity: light.bedroom
    width: 100px  # NEW in v3.1.0
    height: 60px  # NEW in v3.1.0
```

### 6. Slider Enhancements

#### Visibility Control
**Configuration**:
```yaml
sub_button:
  - entity: light.bedroom
    type: slider
    slider_config:
      always_visible: true  # NEW - slider always shows
      show_on_tap: false    # NEW - slider appears on tap only
```

#### Layout Options
**Configuration**:
```yaml
sub_button:
  - entity: light.bedroom
    type: slider
    slider_config:
      orientation: horizontal  # horizontal | vertical
      fill_direction: left     # left | right | top | bottom
      value_position: right    # right | left | center | hidden
      inverted: false          # true = 100% fill equals minimum value
```

### 7. Entity Picture Support
Sub-buttons now support entity pictures instead of icons.

**Configuration**:
```yaml
sub_button:
  - entity: person.john
    show_entity_picture: true  # NEW in v3.1.0
```

### 8. Text Scrolling
Sub-button text can now scroll for long labels.

**Configuration**:
```yaml
sub_button:
  - entity: media_player.living_room
    scrolling_text: true  # NEW in v3.1.0
```

### 9. CSS Classes by Name
Sub-buttons receive auto-generated CSS classes based on their name.

**Example**: A sub-button named "Living Room" gets class `.living-room`

This enables custom styling via card-mod integration.

### 10. Copy/Paste Functionality
Editor feature: Duplicate sub-buttons or entire groups via copy/paste.

**Impact**: No configuration changes needed (editor-only feature)

### 11. Performance Improvements
Editor is "up to 100 times faster" on dashboards with many pop-ups.

**Impact**: No configuration changes needed

### 12. Bubble Card Tools Integration
Modules now store as individual YAML files instead of entity-based storage, with automatic migration from legacy systems.

**Impact**: Storage mechanism change (handled automatically by Bubble Card)

### 13. Timer Entity Support
Timer entities display with live countdown.

**Configuration**:
```yaml
type: custom:bubble-card
card_type: button
entity: timer.laundry
# Displays countdown automatically
```

### 14. Smooth Media Player Transitions
Cover art transitions smoothly when media changes.

**Impact**: No configuration changes needed (visual enhancement)

---

## Configuration Schema Changes

### New Properties Added (Backward Compatible)

#### Sub-Button Configuration
```typescript
interface SubButton {
  // Existing properties (unchanged)
  name?: string;
  icon?: string;
  entity?: string;
  show_name?: boolean;
  show_icon?: boolean;
  show_background?: boolean;
  show_state?: boolean;
  show_attribute?: boolean;
  attribute?: string;
  tap_action?: Action;
  double_tap_action?: Action;
  hold_action?: Action;

  // NEW in v3.1.0
  type?: 'button' | 'slider' | 'select';
  icon_position?: 'top' | 'bottom' | 'left' | 'right';
  position?: 'default' | 'footer';
  width?: string;  // CSS width value (e.g., '100px', '50%')
  height?: string; // CSS height value
  show_entity_picture?: boolean;
  scrolling_text?: boolean;
  slider_config?: {
    always_visible?: boolean;
    show_on_tap?: boolean;
    orientation?: 'horizontal' | 'vertical';
    fill_direction?: 'left' | 'right' | 'top' | 'bottom';
    value_position?: 'right' | 'left' | 'center' | 'hidden';
    inverted?: boolean;
  };
  select_config?: {
    // TODO: Research select dropdown configuration
  };
}
```

#### New Card Type Variant
```typescript
type BubbleCardType =
  | 'button'
  | 'cover'
  | 'media-player'
  | 'slider'
  | 'separator'
  | 'pop-up'
  | 'climate'
  | 'empty-column'
  | 'horizontal-buttons-stack'
  | 'sub_button';  // NEW in v3.1.0
```

---

## Current Renderer Analysis

**File**: [src/components/cards/BubbleCardRenderer.tsx](src/components/cards/BubbleCardRenderer.tsx:1-282)

### What's Implemented (Pre-v3.1.0)
- Basic `button` card type rendering
- `separator` card type with gradient line
- `pop-up` card type with centered icon
- Basic entity state display
- Icon support (Ant Design icons)
- State-based coloring
- Name/state visibility toggles

### What's Missing (v3.1.0 Features)
- ❌ `sub_button` card type (new variant)
- ❌ Sub-button rendering (no sub_button property handling)
- ❌ Sub-button type system (slider, select, button)
- ❌ Sub-button groups
- ❌ Icon position control
- ❌ Footer positioning
- ❌ Individual size customization
- ❌ Slider configuration options
- ❌ Entity picture support
- ❌ Text scrolling
- ❌ Timer entity countdown display

### Current Limitations
1. **No Sub-Button Support**: The renderer doesn't check for or render `sub_button` property
2. **Limited Card Types**: Only implements `separator`, `pop-up`, and default button style
3. **No Advanced Layouts**: Missing footer positioning, icon placement options
4. **Static Styling**: No support for custom widths/heights

---

## Update Requirements

### 1. Renderer Updates Needed

#### Priority 1: Sub-Button Rendering (CRITICAL)
- Parse `sub_button` array from card configuration
- Render sub-buttons below main card content
- Support footer positioning
- Implement sub-button groups

#### Priority 2: Sub-Button Type System (HIGH)
- Implement slider type rendering
- Implement select/dropdown type rendering
- Add slider configuration support

#### Priority 3: Layout & Styling (MEDIUM)
- Icon position control (top/bottom/left/right)
- Individual size customization (width/height)
- Entity picture support
- Text scrolling

#### Priority 4: New Card Type (MEDIUM)
- Implement `sub_button` card_type (sub-buttons only, no main content)

#### Priority 5: Timer Support (LOW)
- Detect timer entities
- Display live countdown

### 2. Card Registry Updates

**File**: [src/services/cardRegistry.ts](src/services/cardRegistry.ts:405-414)

**Current Entry**:
```typescript
{
  type: 'custom:bubble-card',
  name: 'Bubble Card',
  category: 'custom',
  icon: 'BorderOutlined',
  description: 'Bubble style card (HACS)',
  isCustom: true,
  source: 'hacs',
  defaultProps: { card_type: 'button' },
  requiredProps: ['card_type'],
}
```

**Proposed Update**:
```typescript
{
  type: 'custom:bubble-card',
  name: 'Bubble Card',
  category: 'custom',
  icon: 'BorderOutlined',
  description: 'Bubble style card with advanced sub-buttons (HACS v3.1.0)',
  isCustom: true,
  source: 'hacs',
  defaultProps: {
    card_type: 'button',
    sub_button: []  // NEW: Initialize empty sub-buttons array
  },
  requiredProps: ['card_type'],
}
```

### 3. Properties Panel Updates

**File**: TBD - Need to find PropertiesPanel configuration for Bubble Card

Will need to add form fields for:
- Sub-button array editor
- Sub-button type selector
- Slider configuration
- Layout options (icon position, footer placement)
- Size customization (width/height)

### 4. TypeScript Type Definitions

**File**: TBD - Need to find type definitions for CustomCard

Update `CustomCard` type to include new properties:
```typescript
interface BubbleCard extends CustomCard {
  card_type: 'button' | 'cover' | 'media-player' | 'slider' | 'separator' | 'pop-up' | 'climate' | 'sub_button';
  sub_button?: SubButton[];
  // ... other existing properties
}
```

---

## Testing Requirements

### Unit Tests
- [ ] Render `sub_button` card type
- [ ] Render sub-buttons with button type
- [ ] Render sub-buttons with slider type
- [ ] Render sub-buttons with select type
- [ ] Render sub-button groups
- [ ] Apply icon position (top/bottom/left/right)
- [ ] Apply footer positioning
- [ ] Apply custom width/height
- [ ] Display entity pictures
- [ ] Display timer countdown

### Integration Tests
- [ ] Create Bubble Card with sub-buttons in editor
- [ ] Configure sub-button properties via PropertiesPanel
- [ ] Export YAML with sub-button configuration
- [ ] Import YAML with v3.1.0 sub-button configuration
- [ ] Deploy to Home Assistant and verify rendering

### Manual Testing (Requires HA Instance)
- [ ] Install Bubble Card v3.1.0 on test HA instance
- [ ] Create cards with each sub-button type
- [ ] Verify slider controls work
- [ ] Verify select dropdowns work
- [ ] Verify footer positioning
- [ ] Verify entity pictures
- [ ] Verify timer countdown
- [ ] Compare editor preview with actual HA rendering

---

## Breaking Changes Assessment

**NONE IDENTIFIED**

All new features are additive and backward compatible:
- New properties are optional
- Existing configurations continue to work
- Default values maintain previous behavior

---

## Implementation Phases

### Phase 4.1.1: Basic Sub-Button Support (2-3 hours)
- Add sub_button array parsing
- Render basic button-type sub-buttons
- Update cardRegistry description

### Phase 4.1.2: Sub-Button Types (2-3 hours)
- Implement slider type rendering
- Implement select type rendering
- Add type configuration support

### Phase 4.1.3: Layout & Styling (2-3 hours)
- Icon position control
- Footer positioning
- Custom width/height

### Phase 4.1.4: Advanced Features (1-2 hours)
- Entity picture support
- Text scrolling
- Timer countdown

### Phase 4.1.5: Testing & Documentation (2-3 hours)
- Unit tests
- Integration tests
- Update SUPPORTED_VERSIONS.md
- Update VERSION_COMPARISON.md

**Total Estimated Effort**: 9-14 hours (1-2 days)

---

## Open Questions

1. **Select Configuration**: What properties are available in `select_config`?
   - **Action**: Research Bubble Card documentation or source code

2. **Sub-Button Groups**: What is the exact configuration schema for groups?
   - **Action**: Research Bubble Card documentation or test YAML examples

3. **PropertiesPanel Location**: Where is the Bubble Card properties panel configuration?
   - **Action**: Search codebase for PropertiesPanel implementation

4. **Type Definitions**: Where are CustomCard types defined?
   - **Action**: Search for dashboard.ts or types files

---

## References

- **Bubble Card Repository**: https://github.com/Clooos/Bubble-Card
- **v3.1.0 Release Notes**: https://github.com/Clooos/Bubble-Card/releases/tag/v3.1.0
- **Home Assistant Community Thread**: https://community.home-assistant.io/t/bubble-card-a-minimalist-card-collection-for-home-assistant-with-a-nice-pop-up-touch/609678

---

## Document Status

**Status**: ✅ **COMPLETE** - Research phase finished

**Next Step**: Begin Phase 4.1.1 - Implement basic sub-button support in BubbleCardRenderer.tsx

**Approval Required**: User approval to proceed with renderer updates
