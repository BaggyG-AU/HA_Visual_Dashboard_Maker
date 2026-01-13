# HACS Custom Cards Version Research - January 2026

**Research Date:** January 12, 2026
**Purpose:** Document latest versions and changes for supported Home Assistant custom cards

---

## 1. Mushroom Cards

**Repository:** https://github.com/piitaya/lovelace-mushroom
**Latest Stable Version:** v5.0.9
**Release Date:** January 1, 2026

### Breaking Changes

#### v5.0.5 (September 2025) - Template Card Redesign
- **Mushroom theme variables no longer applied** to template cards
- **Icons only show backgrounds when actions assigned** (previously always shown)
- **Default action changed from `toggle` to `more-info`**
- **Card Mod customizations will break** - requires updates for template cards
- Legacy fallback available via `mushroom-legacy-template-card` type

#### v4.3.0 (February 2025)
- **Light brightness slider minimum changed from 0 to 1** - affects minimum brightness configuration

### Major New Features

#### v5.0.9 (January 2026)
- Fixed color temperature slider to use Kelvin instead of mired
- Vietnamese translation updates

#### v5.0.7 (September 2025)
- Switched color library from previous implementation to **culori**
- Improved tabs in chips editor

#### v5.0.6 (September 2025)
- **RGB color format support** in template card
- Template slot implementation for tile info

#### v5.0.5 (September 2025)
- **Template Card Complete Redesign:**
  - Keyboard accessibility support
  - Icon interaction support (tap, hold, double-tap actions)
  - Badge text display capability
  - Automatic migration from legacy versions

#### v4.5.0 (July 2025)
- **Quickbar access via Mushroom chips**
- Thermostat icon modernization

#### v4.4.0 (April 2025)
- **Empty Card component** for spacing/layout purposes
- **Fan direction button** for fan card

#### v4.3.0 (February 2025)
- Header text alignment support
- Humidifier humidity/action display

### Configuration Schema Updates

- **Template Card:** Complete schema redesign in v5.0.5
  - New action configuration for icons
  - Badge text configuration options
  - Legacy template card requires explicit type declaration
- **Light Card:** Minimum brightness value changed (v4.3.0)
- **Fan Card:** Direction control added (v4.4.0)
- **Humidifier Card:** New humidity and action display options (v4.3.0)
- **Empty Card:** New card type for layouts (v4.4.0)

### Renderer Impact
- **HIGH PRIORITY:** Template card rendering requires complete overhaul due to v5.0.5 changes
- Icon background rendering logic must be conditional on action presence
- Default action behavior changed (toggle → more-info)
- Color temperature handling updated to Kelvin (v5.0.9)
- Color library migration to culori may affect color parsing

---

## 2. Mini Graph Card

**Repository:** https://github.com/kalkih/mini-graph-card
**Latest Stable Version:** v0.13.0
**Release Date:** May 29, 2025

### Breaking Changes

**No explicit breaking changes documented** in recent releases. The card maintains backward compatibility.

### Major New Features

#### v0.13.0 (May 2025)
- **Loader/spinner component** for improved UX during data loading
- **`show_legend_state` configuration option** - control legend state display
- **CSS class `tooltip--label`** added for custom styling
- Color interpolation improvements using D3 library
- Legend unit formatting (percent without whitespace)
- Attribute configuration respect for name, icon color, and indicators

#### v0.12.0 (January 2024)
- **Attribute tree structure support** when available
- **`icon_image` option** to override icons with image URLs
- First datapoint tooltip support for line graphs
- Zero value tooltip support
- Out-of-bounds coordinate handling improvements

### Configuration Schema Updates

- **`show_legend_state`** (v0.13.0): Boolean to control legend state display
- **`icon_image`** (v0.12.0): String URL to override icon with image
- **`logarithmic`** (earlier): Boolean to enable logarithmic scale
- **`value_factor`** (earlier): Scaling by order of magnitude for unit conversion
- **`bar_spacing`** (earlier): Control spacing between bars in bar graphs
- **`attribute`** field: Now supports nested access (e.g., `dict_attribute.value_1` or `list_attribute.0.value_1`)

### Renderer Impact
- **LOW PRIORITY:** Mostly additive features
- Consider implementing loader/spinner component for better UX
- Add support for `show_legend_state` option
- Support `icon_image` for custom icon rendering
- Ensure nested attribute access is supported
- Validate color interpolation rendering with D3 algorithm

---

## 3. ApexCharts Card

**Repository:** https://github.com/RomRider/apexcharts-card
**Latest Stable Version:** v2.2.3
**Release Date:** August 21, 2025

### Breaking Changes

**Note:** Repository maintainers warn that "since this card is in its debut, you should expect breaking changes moving forward."

#### v2.1.0 (July 2024)
- **Fixed `extremas` calculation with `time_delta`** - may affect existing chart ranges
- **Corrected display behavior with server time plus series offset** - timing calculations changed

### Major New Features

#### v2.2.3 (August 2025)
- Fixed chart not rendering sometimes (issue #945)

#### v2.2.2 (August 2025)
- Fixed charts failing to display when nested inside vertical or horizontal stack cards

#### v2.2.1 (August 2025)
- Prevented manual `apex_config` xaxis and points annotations from being erased
- Restored legacy behavior for non-section-mode cards in section views

#### v2.2.0 (August 2025)
- **Display card version on the card** (useful for debugging)
- **`section_mode` support** for sections views - major layout feature
- **Option to hide null or zero values in the header**
- **Extended `stroke_dash`** to support array patterns for complex dashing
- Improved text color selection considering human perception
- Fixed graph rendering width when heading titles are lengthy

#### v2.1.0 (July 2024)
- **Change type statistics functionality**
- **Dashed line support** for series
- **`in_legend: false` option** to hide specific series
- **`monotoneCubic` curve support**
- **Stack groups for columns**
- **Weekly statistics period**
- **Server time support**
- **Multiple locale support**

### Configuration Schema Updates

- **`section_mode`** (v2.2.0): Boolean for sections view support
- **`stroke_dash`** (v2.2.0): Now accepts array patterns (e.g., `[5, 10, 15]`)
- **`show_in_header`** (v2.2.0): Option to hide null/zero values
- **`in_legend`** (v2.1.0): Boolean to hide series from legend
- **`curve`** (v2.1.0): Added `monotoneCubic` option
- **`stacked_column_groups`** (v2.1.0): Array for column stack groups
- **`locale`** (v2.1.0): String for language/formatting preferences
- **`yaxis`** (earlier): Array configuration for multi-axis charts
- **`statistics`** (earlier): Object for long-term data sources
- **`experimental`** (earlier): Object housing beta features

### Renderer Impact
- **MEDIUM PRIORITY:** Several rendering changes
- Implement `section_mode` for proper dashboard integration
- Support array-based `stroke_dash` patterns
- Handle null/zero value hiding in headers
- Ensure nested stack card rendering works correctly
- Validate annotation preservation with manual apex_config
- Support multiple y-axis rendering
- Implement statistics-based data sources

---

## 4. Power Flow Card

**Repository:** https://github.com/ulic75/power-flow-card
**Latest Stable Version:** v2.6.2
**Release Date:** March 17, 2023

### Breaking Changes

**No explicit breaking changes documented** in available releases.

### Major New Features

#### v2.6.2 (March 2023)
- Fixed number formatting calculation problem

#### v2.6.1 (November 2022)
- Restored background display capability for entities

#### v2.6.0 (November 2022)
- **Extended card scope to support gas and water flows** - major feature addition
- Corrected solar text color styling

#### v2.5.1 (July 2022)
- Improved animation smoothness for Safari-based interfaces

#### v2.5.0 (May 2022)
- Browser console logging for misconfigured or unavailable entities
- **Off-grid support functionality**

#### v2.4.0 (May 2022)
- **`dashboard_link` configuration option**
- **Bidirectional grid-to-battery power flow support**
- **Configurable decimal places via `w_decimals` option**

### Configuration Schema Updates

Current schema includes:
- **Card options:** `type`, `entities`, `title`, `dashboard_link`, `inverted_entities`, `kw_decimals`, `w_decimals`, `min_flow_rate`, `max_flow_rate`, `watt_threshold`
- **Entities object:** Support for `grid`, `battery`, `battery_charge`, `solar`, `gas`, and `water` entities
- **Split entities:** Configuration for separate consumption and production entity IDs
- **`dashboard_link`** (v2.4.0): Link to detailed dashboard
- **`w_decimals`** (v2.4.0): Decimal precision for watts
- **`gas` and `water`** (v2.6.0): New entity types

### Renderer Impact
- **MEDIUM PRIORITY:** Feature additions for gas/water
- Implement gas and water flow rendering (v2.6.0)
- Support bidirectional grid-to-battery flows (v2.4.0)
- Add dashboard_link rendering (v2.4.0)
- Validate decimal precision handling
- Ensure off-grid mode rendering works correctly
- Note: Card hasn't been updated in nearly 3 years - may need to verify continued compatibility

---

## 5. Better Thermostat UI Card

**Repository:** https://github.com/KartoffelToby/better-thermostat-ui-card
**Latest Stable Version:** v2.2.1
**Release Date:** November 3, 2024

### Breaking Changes

#### v3.0.0 Beta (January 2025) - NOT STABLE
- **MAJOR BREAKING CHANGE:** Card types now split into two variants:
  - `custom:better-thermostat-normal-climate-card`
  - `custom:better-thermostat-mini-climate-card`
- Dashboard resources require verification when upgrading from v3 Beta 2
- **Note:** v3.0.0 is BETA and should NOT be used in production

**Latest stable release (v2.2.1) has no breaking changes.**

### Major New Features

#### v2.2.1 (November 2024)
- Translation updates and localization improvements (Croatian, Polish, Russian, Bulgarian, French, Brazilian Portuguese, Latvian)
- Migration to inlang system for translations

#### v2.2.0 (November 2024)
- Fixed status action icon (HVAC action display)
- Corrected target/current value swap in display mode
- Extended Czech localization support

#### v2.1.3 (September 2024)
- Prepared infrastructure to support cooling mode in the future
- Slovak translation updates

#### v2.1.2 (September 2024)
- Fixed layout issues on small grids
- **Added debounce delay to +/- buttons** to prevent service call flooding
- Further cooling mode preparation

#### v2.1.1 (September 2024)
- Resolved grid stack scaling issues
- Fixed handling of unnamed cards

#### v2.1.0 (September 2024)
- **CRITICAL FIX:** Resolved main bug with HA >= 2023.9.0 that would crash the Home Assistant frontend
- Scaling improvements for smaller screens

### Configuration Schema Updates

Current stable schema (v2.2.1) includes:

| Option | Type | Purpose |
|--------|------|---------|
| `type` | string | Must be `custom:better-thermostat-ui-card` |
| `entity` | string | Climate entity ID (requires better_thermostat 1.3.0+) |
| `eco_temperature` | number | Target temperature for eco modes |
| `disable_window` | boolean | Toggle window indicator |
| `disable_summer` | boolean | Toggle summer indicator |
| `disable_heat` | boolean | Toggle heat button |
| `disable_eco` | boolean | Toggle eco button |
| `disable_off` | boolean | Toggle off button |
| `disable_buttons` | boolean | Toggle temperature adjustment buttons |
| `name` | string/boolean | Override entity name display |

**No schema changes in recent stable releases** - only bug fixes and translations.

### Renderer Impact
- **LOW PRIORITY:** Stable version is mostly bug fixes
- Ensure debounce handling for +/- buttons (v2.1.2)
- Validate HVAC action icon rendering (v2.2.0)
- Ensure target/current value display is correct (v2.2.0)
- Test grid stack scaling on small displays (v2.1.1)
- **DO NOT implement v3.0.0 beta changes** until stable release

---

## Summary of Renderer Implementation Priorities

### HIGH PRIORITY (Breaking Changes / Major Features)
1. **Mushroom Cards v5.0.5+** - Template card redesign requires significant renderer updates
   - Action-based icon background rendering
   - Default action behavior change
   - Legacy template card support
   - Color temperature Kelvin conversion

### MEDIUM PRIORITY (Significant Features)
2. **ApexCharts Card v2.2.0+** - Section mode and rendering improvements
   - `section_mode` implementation
   - Array-based stroke dash patterns
   - Nested stack card compatibility
   - Multiple y-axis support

3. **Power Flow Card v2.6.0** - Extended entity support
   - Gas and water flow rendering
   - Bidirectional battery flows
   - Dashboard link support

### LOW PRIORITY (Minor Updates / Backward Compatible)
4. **Mini Graph Card v0.13.0** - Additive features
   - Loader component
   - `show_legend_state` option
   - `icon_image` support

5. **Better Thermostat UI Card v2.2.1** - Bug fixes and translations
   - Button debounce handling
   - Display value corrections
   - Grid scaling validation

---

## Compatibility Notes

- **Mushroom Cards:** Active development, regular updates, modern Home Assistant compatibility
- **Mini Graph Card:** Stable, backward compatible, last update May 2025
- **ApexCharts Card:** Active development, warns of potential breaking changes, last update August 2025
- **Power Flow Card:** No updates since March 2023 (nearly 3 years old) - verify continued HA compatibility
- **Better Thermostat UI Card:** Active development, stable v2.x series, v3.0 in beta

---

## Recommendations

1. **Immediate Action Required:**
   - Update Mushroom template card renderer for v5.0.5 breaking changes
   - Test all cards with current Home Assistant versions

2. **Near-term Updates:**
   - Implement ApexCharts section_mode support
   - Add Power Flow Card gas/water entity rendering
   - Validate Power Flow Card compatibility (3-year-old codebase)

3. **Future Monitoring:**
   - Watch Better Thermostat UI Card v3.0 stable release
   - Monitor ApexCharts for continued breaking changes
   - Track Mini Graph Card for new features

4. **Testing Priorities:**
   - Mushroom template cards with various action configurations
   - ApexCharts in section views and nested stacks
   - Power Flow Card with modern Home Assistant versions
   - Better Thermostat UI Card on small grid layouts

---

**Document Generated:** January 12, 2026
**Next Review Recommended:** April 2026 (quarterly review cycle)
