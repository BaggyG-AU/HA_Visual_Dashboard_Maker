# HA Visual Dashboard Maker - Architecture Roadmap & Standards

This document contains **planned / aspirational** architecture guidance, code organization standards, and non-functional targets.

- For the **current implemented architecture**, see `docs/architecture/ARCHITECTURE.md`.
- This content was split out of `docs/architecture/ARCHITECTURE.md` on **January 9, 2026** to avoid mixing current-state documentation with roadmap items.

---

## Code Organization Standards (Updated January 2026)

### Hybrid Organization Strategy

**Principle**: Organize code based on feature complexity, not arbitrary folder limits.

**Decision Matrix**:

| Feature Type | Criteria | Location | Example |
|-------------|----------|----------|---------|
| **Single Component** | 1 file, reusable, no complex state | `src/components/` | ColorPicker, FontSelector, GradientEditor |
| **Simple Service** | 1-2 files, utility functions | `src/services/` | smartActionService, fontService, animationService |
| **Complex Feature** | 3+ files, internal state, sub-components | `src/features/[name]/` | Entity Remapping, Carousel, Graphs |
| **Global Styles** | CSS/theming | `src/styles/` | animations.css |

### Updated Directory Structure

```
src/
├── components/          # Single-file reusable components
│   ├── ColorPicker.tsx          # react-colorful integration
│   ├── FontSelector.tsx          # Google Fonts selector
│   ├── GradientEditor.tsx        # Gradient configuration
│   ├── FavoriteColorsManager.tsx # Color palette manager
│   ├── ShadowControls.tsx        # Shadow configuration
│   ├── BorderControls.tsx        # Border configuration
│   ├── OpacityControls.tsx       # Opacity slider
│   ├── IconColorCustomizer.tsx   # Icon color overrides
│   ├── TypographyControls.tsx    # Full typography panel
│   └── ...
│
├── services/           # Utility services (1-2 files)
│   ├── smartActionService.ts     # Auto tap_action logic
│   ├── fontService.ts            # Google Fonts API, caching
│   ├── animationService.ts       # Animation CSS application
│   ├── styleService.ts           # CSS generation utilities
│   ├── contrastService.ts        # Accessibility contrast checks
│   ├── lenientValidationService.ts # Existing service
│   ├── yamlService.ts            # Existing service
│   └── ...
│
├── features/          # Complex multi-component features (NEW)
│   ├── entity-remapping/
│   │   ├── EntityRemappingDialog.tsx    # Main UI
│   │   ├── FuzzyEntityMatcher.ts        # Matching algorithm
│   │   ├── entityRemappingService.ts    # Business logic
│   │   ├── types.ts                     # Feature types
│   │   └── EntityRemappingDialog.test.tsx
│   │
│   ├── carousel/
│   │   ├── SwiperCarousel.tsx           # Swiper.js integration
│   │   ├── CarouselConfig.tsx           # Configuration UI
│   │   ├── carouselPresets.ts           # Default configs
│   │   ├── types.ts
│   │   └── SwiperCarousel.test.tsx
│   │
│   ├── graphs/
│   │   ├── NativeGraphsCard.tsx         # Recharts wrapper
│   │   ├── LineChart.tsx                # Chart variants
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── graphService.ts              # Data transformation
│   │   ├── types.ts
│   │   └── NativeGraphsCard.test.tsx
│   │
│   ├── logic-editor/
│   │   ├── VisualLogicEditor.tsx        # No-code builder
│   │   ├── ConditionBuilder.tsx         # Condition UI
│   │   ├── ActionBuilder.tsx            # Action UI
│   │   ├── FlowDiagram.tsx              # Visual flow
│   │   ├── logicService.ts              # Logic evaluation
│   │   ├── types.ts
│   │   └── VisualLogicEditor.test.tsx
│   │
│   ├── template-system/
│   │   ├── TemplateEditor.tsx           # Jinja2 editor
│   │   ├── TemplatePreview.tsx          # Live preview
│   │   ├── TemplateLibrary.tsx          # Snippets/templates
│   │   ├── templateService.ts           # Template engine
│   │   ├── types.ts
│   │   └── TemplateEditor.test.tsx
│   │
│   ├── preset-marketplace/
│   │   ├── PresetBrowser.tsx            # Marketplace UI
│   │   ├── PresetDetail.tsx             # Preset details
│   │   ├── PresetImporter.tsx           # Import logic
│   │   ├── presetService.ts             # API client
│   │   ├── types.ts
│   │   └── PresetBrowser.test.tsx
│   │
│   └── theme-manager/
│       ├── ThemeManager.tsx             # Theme UI
│       ├── ThemePreview.tsx             # Theme preview
│       ├── ThemeEditor.tsx              # Theme customization
│       ├── themeService.ts              # Theme application
│       ├── types.ts
│       └── ThemeManager.test.tsx
│
├── styles/             # Global CSS/theming
│   ├── animations.css              # Animation keyframes (NEW)
│   ├── theme.css                   # Existing theme
│   └── variables.css               # CSS variables
│
├── hooks/              # Reusable React hooks
│   ├── useRecentColors.ts          # Recent colors history (NEW)
│   ├── useGoogleFonts.ts           # Font loading hook (NEW)
│   ├── useEntityContext.ts         # Entity context variables (NEW)
│   ├── useSmartActions.ts          # Smart default actions (NEW)
│   └── ...
│
├── types/              # Shared TypeScript types
│   ├── animation.ts                # Animation config types (NEW)
│   ├── typography.ts               # Typography types (NEW)
│   ├── style.ts                    # Shadow/border types (NEW)
│   ├── entityContext.ts            # Entity context types (NEW)
│   └── ...
│
└── (existing structure)
    ├── main/           # Electron main process
    ├── preload/        # Electron preload scripts
    └── ...
```

### When to Use Feature Folders

Create a feature folder when:
1. **3+ related files** are needed for the feature
2. **Complex internal state** that doesn't belong in global store
3. **Sub-components** specific to the feature
4. **Feature-specific types** that aren't used elsewhere
5. **Feature-specific services/utilities**

Examples:
- ✅ Entity Remapping (dialog + matcher + service + types)
- ✅ Visual Logic Editor (multiple builders + flow diagram + service)
- ✅ Carousel (Swiper integration + config + presets)
- ❌ Color Picker (single component, no sub-components)
- ❌ Animation Service (utility service, no UI components)

### Co-location Benefits

Feature folders enable:
- **Easier refactoring** (all related code in one place)
- **Better testability** (tests co-located with implementation)
- **Clear boundaries** (feature doesn't leak into global state)
- **Independent evolution** (features can be updated/removed without affecting others)

### Migration Path for Existing Code

**Do NOT** migrate existing code to feature folders unless:
1. Actively working on that feature
2. Feature meets criteria for folder (3+ files, complexity)
3. Migration improves maintainability

**Existing code stays in current structure** (`src/components/`, `src/services/`) until there's a reason to move it.

---

## HAVDM Advanced Features

### Technology Choices

| Component | Selected Technology | Location | Rationale |
|-----------|-------------------|----------|-----------|
| **Color Picker** | react-colorful | `src/components/ColorPicker.tsx` | 2KB, modern, accessible |
| **Animations** | Custom CSS library | `src/styles/animations.css` + `src/services/animationService.ts` | Maximum flexibility, YAML storage |
| **Carousel/Slider** | Swiper.js v12+ | `src/features/carousel/` | Feature-rich, battle-tested |
| **Charts** | Recharts | `src/features/graphs/` | React-native, composable, SVG |
| **Fonts** | Google Fonts (CDN + cache) | `src/services/fontService.ts` + `src/assets/fonts/` | Best of both: speed online, works offline |

### Quality Standards for New Features

All new features MUST comply with:

1. **Testing Requirements**:
   - Unit tests for all services/utilities (95%+ coverage)
   - E2E tests using DSL (comprehensive scenarios)
   - Visual regression tests for UI components
   - Performance benchmarks for critical paths
   - Accessibility tests (WCAG 2.1 AA)

2. **Documentation Requirements**:
   - User-facing help text/tooltips in UI
   - Developer documentation in feature README
   - Feature documentation in `docs/features/`
   - Architecture decision records (if applicable)

3. **Accessibility Requirements**:
   - WCAG 2.1 AA compliance
   - Keyboard navigation fully functional
   - Screen reader compatible
   - Proper ARIA labels
   - Respect `prefers-reduced-motion`

4. **Internationalization**:
   - All user-facing strings translatable
   - Phase-based i18n rollout
   - English only in Phase 1, translations in later phases

5. **Backward Compatibility**:
   - Progressive enhancement (new features don't break old dashboards)
   - Auto-mapping for configuration changes
   - Graceful degradation for missing features

### Feature Development Workflow

For each new feature:

1. **Planning**:
   - Review feature user story in `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`
   - Check dependency requirements
   - Create technical design doc (if complex)

2. **Implementation**:
   - Follow code organization standards (component vs feature folder)
   - Write unit tests first (TDD approach)
   - Implement feature with compliance to standards
   - Add E2E tests using DSL pattern

3. **Quality Assurance**:
   - All tests passing (unit + E2E + visual + accessibility)
   - Performance benchmarks met
   - Code review completed
   - Documentation complete

4. **Integration**:
   - Merge to feature branch
   - Phase-based release testing
   - User acceptance testing (beta program)

---

## Performance Standards (Updated)

### Rendering Performance

- **60fps target**: All animations and interactions must maintain 60fps (16ms frame time)
- **Initial load**: < 2s to interactive for typical dashboard (10-20 cards)
- **Card rendering**: < 100ms per card initial render
- **YAML sync**: < 50ms bidirectional sync for typical changes

### Memory Constraints

- **Dashboard size**: Support dashboards with 100+ cards without degradation
- **Memory usage**: < 500MB for typical dashboard editing session
- **Memory leaks**: No detectable leaks over 1-hour editing session

### Bundle Size Targets

- **Main bundle**: < 2MB gzipped (current baseline)
- **Per-feature overhead**: < 50KB gzipped per major feature
- **Lazy loading**: Code split features that aren't always used
- **Font cache**: < 500KB total for pre-cached fonts

### Network Performance

- **Google Fonts loading**: < 200ms cached, < 2s uncached (with timeout fallback)
- **Entity fetching**: < 1s for typical HA instance (100-500 entities)
- **Preset marketplace**: < 3s to load preset list

---

## Security Considerations (Updated)

### New Security Requirements

1. **Font Loading**:
   - Google Fonts loaded over HTTPS only
   - CSP policy allows Google Fonts CDN
   - Local fallback prevents tracking concerns

2. **Preset Marketplace**:
   - Presets sandboxed during import
   - Entity remapping required (no hardcoded entity IDs executed blindly)
   - User review before import
   - Digital signatures for official presets (future)

3. **Template System**:
   - Jinja2 templates run in sandboxed environment
   - No code execution outside sandbox
   - Template validation before execution
   - Timeout protection for infinite loops

4. **Plugin System** (Phase 7):
   - Plugins run in isolated context
   - Strict CSP for plugin code
   - Permission model for API access
   - Code signing for official plugins (future)

---

## Accessibility Standards (Updated)

### WCAG 2.1 AA Compliance (Mandatory)

All new features must meet WCAG 2.1 Level AA:

1. **Perceivable**:
   - Color is not the only visual means of conveying information
   - Minimum contrast ratio 4.5:1 for normal text, 3:1 for large text
   - All non-text content has text alternatives
   - Visual information has non-visual alternatives (e.g., screen reader announcements)

2. **Operable**:
   - All functionality available via keyboard
   - No keyboard traps
   - Sufficient time for interactions (no aggressive timeouts)
   - No content that causes seizures (flashing < 3 times per second)
   - Respect `prefers-reduced-motion`

3. **Understandable**:
   - UI text is readable and understandable
   - Pages operate in predictable ways
   - Input errors are identified and described
   - Labels and instructions provided

4. **Robust**:
   - Compatible with current and future assistive technologies
   - Valid HTML/ARIA markup
   - Proper semantic structure

### Specific Requirements

- **Color Picker**: Keyboard navigation (tab, arrows), ARIA labels, screen reader value announcements
- **Animations**: Disabled when `prefers-reduced-motion: reduce`, never essential
- **Typography**: Respects user font size preferences, minimum 12px
- **Contrast**: Warnings when custom colors/opacity violate contrast ratios
- **Forms**: All inputs labeled, errors associated with inputs, validation messages clear

---

## References (Updated)

### New Dependencies

- [react-colorful](https://github.com/omgovich/react-colorful) - Color picker component
- [Swiper.js](https://swiperjs.com/) - Carousel/slider component
- [Recharts](https://recharts.org/) - React charting library
- [Google Fonts API](https://developers.google.com/fonts/docs/developer_api) - Font browsing and loading

### Existing References

- [Home Assistant Documentation](https://www.home-assistant.io/dashboards/)
- [REST API Documentation](https://developers.home-assistant.io/docs/api/rest/)
- [WebSocket API Documentation](https://developers.home-assistant.io/docs/api/websocket/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: January 4, 2026
**Next Review**: After Phase 1 completion (v0.4.0)
