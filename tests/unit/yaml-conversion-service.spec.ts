import { describe, expect, it } from 'vitest';
import {
  exportCard,
  exportDashboard,
  importCard,
  importDashboard,
  migrateLegacyCard,
} from '../../src/services/yamlConversionService';
import type { ExportWarning } from '../../src/services/exportWarnings';

describe('yaml conversion service', () => {
  it('imports upstream swipe-card into HAVDM internal fields and generated slides', () => {
    const upstream = {
      type: 'custom:swipe-card',
      start_card: 2,
      reset_after: 30,
      parameters: {
        slidesPerView: 2,
        spaceBetween: 20,
        centeredSlides: true,
        freeMode: true,
        navigation: true,
        effect: 'coverflow',
        loop: true,
        direction: 'vertical',
        speed: 250,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
          stopOnLastSlide: true,
        },
        pagination: {
          type: 'fraction',
          clickable: false,
        },
      },
      cards: [
        { type: 'markdown', content: 'One' },
        { type: 'markdown', content: 'Two' },
      ],
      custom_upstream_flag: 'keep-me',
    };

    const imported = importCard(upstream);

    expect(imported).toMatchObject({
      type: 'custom:swipe-card',
      slides_per_view: 2,
      space_between: 20,
      centered_slides: true,
      free_mode: true,
      navigation: true,
      effect: 'coverflow',
      loop: true,
      direction: 'vertical',
      speed: 250,
      autoplay: {
        delay: 3000,
        pause_on_interaction: false,
        stop_on_last_slide: true,
      },
      start_card: 2,
      reset_after: 30,
      cards: [
        { type: 'markdown', content: 'One' },
        { type: 'markdown', content: 'Two' },
      ],
      custom_upstream_flag: 'keep-me',
    });
    expect(imported.slides).toEqual([
      { cards: [{ type: 'markdown', content: 'One' }] },
      { cards: [{ type: 'markdown', content: 'Two' }] },
    ]);
  });

  it('exports swipe-card to upstream parameters, strips HAVDM-only slide fields, and omits disabled autoplay', () => {
    const internal = {
      type: 'custom:swipe-card',
      slides_per_view: 2,
      space_between: 16,
      centered_slides: true,
      free_mode: false,
      navigation: true,
      effect: 'slide',
      loop: false,
      direction: 'horizontal',
      speed: 300,
      autoplay: { enabled: false, delay: 3000 },
      pagination: { type: 'bullets', clickable: true },
      slides: [
        {
          cards: [{ type: 'button', entity: 'light.a' }],
          background: { type: 'color', value: '#000000' },
          alignment: 'top',
          autoplay_delay: 1000,
          skip_navigation: true,
        },
      ],
      parameters: {
        customParameter: 'preserved',
      },
      extraTopLevel: true,
    };

    const exported = exportCard(internal);

    expect(exported).toMatchObject({
      type: 'custom:swipe-card',
      cards: [{ type: 'button', entity: 'light.a' }],
      parameters: {
        slidesPerView: 2,
        spaceBetween: 16,
        centeredSlides: true,
        freeMode: false,
        navigation: true,
        effect: 'slide',
        loop: false,
        direction: 'horizontal',
        speed: 300,
        pagination: { type: 'bullets', clickable: true },
        customParameter: 'preserved',
      },
      extraTopLevel: true,
    });

    expect((exported.parameters as Record<string, unknown>).autoplay).toBeUndefined();
    expect((exported.cards as Array<Record<string, unknown>>)[0].background).toBeUndefined();
  });

  it('imports and exports expander-card with kebab/camel mappings, strips _expanderDepth + invented icon keys, and emits gap+expanded-gap on export', () => {
    const upstream = {
      type: 'custom:expander-card',
      title: 'Section',
      'title-card': { type: 'markdown', content: 'Header' },
      'title-card-button-overlay': true,
      cards: [{ type: 'button', entity: 'switch.tv' }],
      expanded: true,
      'expanded-icon': 'mdi:plus',
      'collapsed-icon': 'mdi:minus',
      gap: '0.5em',
      padding: '8px',
      clear: true,
      'overlay-margin': '1em',
      'child-padding': '4px',
      'button-background': 'rgba(0,0,0,0.3)',
    };

    const imported = importCard(upstream);
    // The icons remain HAVDM canvas concepts on import (ExpanderPanel renders them).
    expect(imported).toMatchObject({
      titleCard: { type: 'markdown', content: 'Header' },
      titleCardButtonOverlay: true,
      expandedIcon: 'mdi:plus',
      collapsedIcon: 'mdi:minus',
      overlayMargin: '1em',
      childPadding: '4px',
      buttonBackground: 'rgba(0,0,0,0.3)',
    });

    const exported = exportCard({ ...imported, _expanderDepth: 2 });
    // Phase 4 PR-6: the invented icon keys are STRIPPED on export; the open `gap`
    // is emitted under BOTH `gap` (Alia5) and `expanded-gap` (MelleD v7.1.10+).
    expect(exported).toMatchObject({
      type: 'custom:expander-card',
      title: 'Section',
      'title-card': { type: 'markdown', content: 'Header' },
      'title-card-button-overlay': true,
      cards: [{ type: 'button', entity: 'switch.tv' }],
      expanded: true,
      gap: '0.5em',
      'expanded-gap': '0.5em',
      padding: '8px',
      clear: true,
      'overlay-margin': '1em',
      'child-padding': '4px',
      'button-background': 'rgba(0,0,0,0.3)',
    });
    expect(exported).not.toHaveProperty('expanded-icon');
    expect(exported).not.toHaveProperty('collapsed-icon');
    expect((exported as Record<string, unknown>)._expanderDepth).toBeUndefined();
  });

  it('imports tabbed-card and merges global attributes into tabs while preserving styles', () => {
    const upstream = {
      type: 'custom:tabbed-card',
      options: { defaultTabIndex: 1 },
      attributes: { stacked: true, minWidth: true },
      styles: { '--mdc-theme-primary': 'yellow' },
      tabs: [
        {
          attributes: { label: 'Lights', icon: 'mdi:lightbulb' },
          card: { type: 'markdown', content: 'A' },
        },
      ],
    };

    const imported = importCard(upstream);

    expect(imported).toMatchObject({
      type: 'custom:tabbed-card',
      default_tab: 1,
      _havdm_styles: { '--mdc-theme-primary': 'yellow' },
      tabs: [
        {
          title: 'Lights',
          icon: 'mdi:lightbulb',
          cards: [{ type: 'markdown', content: 'A' }],
        },
      ],
    });

    const tab = (imported.tabs as Array<Record<string, unknown>>)[0];
    expect((tab.attributes as Record<string, unknown>).stacked).toBe(true);
    expect((tab.attributes as Record<string, unknown>).minWidth).toBe(true);
  });

  it('exports tabbed-card to upstream singular card shape and strips HAVDM-only fields', () => {
    const internal = {
      type: 'custom:tabbed-card',
      default_tab: 0,
      _havdm_styles: { '--mdc-theme-primary': 'yellow' },
      tab_position: 'left',
      tabs: [
        {
          title: 'Single',
          icon: 'mdi:one',
          badge: 'NEW',
          count: 3,
          cards: [{ type: 'markdown', content: 'One' }],
          custom: 'keep-tab',
        },
        {
          title: 'Multi',
          cards: [
            { type: 'markdown', content: 'Two' },
            { type: 'markdown', content: 'Three' },
          ],
        },
      ],
      topLevelUnknown: 'keep-top',
    };

    const exported = exportCard(internal);

    expect(exported).toMatchObject({
      type: 'custom:tabbed-card',
      options: { defaultTabIndex: 0 },
      styles: { '--mdc-theme-primary': 'yellow' },
      topLevelUnknown: 'keep-top',
      tabs: [
        {
          attributes: { label: 'Single', icon: 'mdi:one' },
          card: { type: 'markdown', content: 'One' },
          custom: 'keep-tab',
        },
        {
          attributes: { label: 'Multi' },
          card: {
            type: 'vertical-stack',
            cards: [
              { type: 'markdown', content: 'Two' },
              { type: 'markdown', content: 'Three' },
            ],
          },
        },
      ],
    });

    expect((exported as Record<string, unknown>).tab_position).toBeUndefined();
    expect((exported.tabs as Array<Record<string, unknown>>)[0].badge).toBeUndefined();
    expect((exported.tabs as Array<Record<string, unknown>>)[0].count).toBeUndefined();
  });

  it('migrates legacy card types including accordion multi-sections', () => {
    expect(migrateLegacyCard({ type: 'custom:swiper-card' })).toMatchObject({
      type: 'custom:swipe-card',
    });

    expect(migrateLegacyCard({ type: 'custom:tabs-card' })).toMatchObject({
      type: 'custom:tabbed-card',
    });

    const migratedAccordion = migrateLegacyCard({
      type: 'custom:accordion-card',
      sections: [
        { title: 'A', cards: [{ type: 'markdown', content: 'A1' }] },
        { title: 'B', cards: [{ type: 'markdown', content: 'B1' }] },
      ],
    });

    expect(migratedAccordion).toEqual({
      type: 'vertical-stack',
      cards: [
        {
          type: 'custom:expander-card',
          title: 'A',
          expanded: true,
          cards: [{ type: 'markdown', content: 'A1' }],
        },
        {
          type: 'custom:expander-card',
          title: 'B',
          expanded: false,
          cards: [{ type: 'markdown', content: 'B1' }],
        },
      ],
    });
  });

  it('recursively processes nested container cards for import and export', () => {
    const dashboard = {
      title: 'Nested',
      views: [
        {
          title: 'Main',
          cards: [
            {
              type: 'vertical-stack',
              cards: [
                {
                  type: 'custom:swipe-card',
                  parameters: { slidesPerView: 1 },
                  cards: [{ type: 'markdown', content: 'Slide' }],
                },
                {
                  type: 'conditional',
                  conditions: [{ entity: 'light.a', state: 'on' }],
                  card: {
                    type: 'custom:tabbed-card',
                    options: { defaultTabIndex: 0 },
                    tabs: [
                      {
                        attributes: { label: 'Inner' },
                        card: {
                          type: 'custom:popup-card',
                          popup: { cards: [{ type: 'markdown', content: 'Popup child' }] },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const imported = importDashboard(dashboard);
    const importedSwipe = (
      (imported.views as Array<Record<string, unknown>>)[0].cards as Array<Record<string, unknown>>
    )[0].cards as Array<Record<string, unknown>>;
    expect((importedSwipe[0] as Record<string, unknown>).slides).toBeTruthy();

    const exported = exportDashboard(imported);
    const exportedVertical = (
      (exported.views as Array<Record<string, unknown>>)[0].cards as Array<Record<string, unknown>>
    )[0].cards as Array<Record<string, unknown>>;
    const exportedSwipe = exportedVertical[0];
    const exportedConditional = exportedVertical[1];
    const exportedTabbed = exportedConditional.card as Record<string, unknown>;
    const exportedTabCard = (exportedTabbed.tabs as Array<Record<string, unknown>>)[0]
      .card as Record<string, unknown>;

    expect(exportedSwipe.type).toBe('custom:swipe-card');
    expect((exportedSwipe.parameters as Record<string, unknown>).slidesPerView).toBe(1);
    expect(exportedTabbed.options).toEqual({ defaultTabIndex: 0 });
    // B7: the deeply-nested custom:popup-card (a phantom type) is substituted with
    // a native "Card Not Available" markdown placeholder — proving the B7
    // substitution reaches every depth, and its design-time popup content is
    // intentionally dropped.
    expect(exportedTabCard.type).toBe('markdown');
    expect(String(exportedTabCard.content)).toContain('Card Not Available');
    expect(exportedTabCard).not.toHaveProperty('popup');
  });

  it('preserves unknown properties and handles empty/missing/null edge cases', () => {
    const imported = importCard({
      type: 'custom:swipe-card',
      parameters: {},
      cards: [],
      unknownA: 'x',
      nullish: null,
    });

    expect(imported.unknownA).toBe('x');
    expect(imported.nullish).toBeNull();
    expect(imported.cards).toEqual([]);
    expect(imported.slides).toEqual([]);

    const exported = exportCard({
      type: 'custom:tabbed-card',
      tabs: [],
      unknownB: 'y',
      lazy_render: true,
    });

    expect(exported.unknownB).toBe('y');
    expect((exported as Record<string, unknown>).lazy_render).toBeUndefined();
    expect(exported).toMatchObject({ tabs: [], options: { defaultTabIndex: 0 } });
  });

  it('imports and exports calendar card while converting HAVDM-only fields', () => {
    const upstream = {
      type: 'calendar',
      title: 'Household',
      entities: ['calendar.home', 'calendar.work'],
      // legacy HAVDM-emitted initial_view value — still imported for back-compat
      initial_view: 'list',
      extra: 'keep',
    };

    const imported = importCard(upstream);
    expect(imported).toMatchObject({
      type: 'calendar',
      calendar_entities: ['calendar.home', 'calendar.work'],
      view: 'week',
      extra: 'keep',
    });

    const exported = exportCard({
      ...imported,
      show_week_numbers: true,
      show_agenda: true,
      on_date_select: { action: 'more-info' },
      selected_date: '2026-02-15',
      events: [{ title: 'Preview event', start: '2026-02-15T10:00:00Z' }],
    });

    expect(exported).toMatchObject({
      type: 'calendar',
      title: 'Household',
      entities: ['calendar.home', 'calendar.work'],
      // exported with the current HA FullCalendar view name
      initial_view: 'listWeek',
      extra: 'keep',
    });
    expect((exported as Record<string, unknown>).show_week_numbers).toBeUndefined();
    expect((exported as Record<string, unknown>).show_agenda).toBeUndefined();
    expect((exported as Record<string, unknown>).calendar_entities).toBeUndefined();
    expect((exported as Record<string, unknown>).on_date_select).toBeUndefined();
    expect((exported as Record<string, unknown>).events).toBeUndefined();
  });

  // Phase 4 PR-2 — built-in card VALUE fixes: the exported config must use the
  // values Home Assistant actually accepts. RED-BEFORE-GREEN: confirmed red when
  // the PR-2 src is reverted in the same checkout (on the base commit calendar
  // exports initial_view month/list/day, logbook has no exporter so it emits
  // `entity` and the 7 Timeline keys, and alarm-panel emits armed_* verbatim).
  describe('built-in value fixes (Phase 4 PR-2)', () => {
    it('calendar: exports the current HA FullCalendar initial_view names', () => {
      const cases: Array<['month' | 'week' | 'day', string]> = [
        ['month', 'dayGridMonth'],
        ['week', 'listWeek'],
        ['day', 'dayGridDay'],
      ];
      for (const [view, expected] of cases) {
        const exported = exportCard({
          type: 'calendar',
          calendar_entities: ['calendar.home'],
          view,
        });
        expect(exported.initial_view).toBe(expected);
      }
    });

    it('calendar: imports the current HA initial_view names back to the internal view', () => {
      expect(importCard({ type: 'calendar', initial_view: 'dayGridDay' }).view).toBe('day');
      expect(importCard({ type: 'calendar', initial_view: 'listWeek' }).view).toBe('week');
      expect(importCard({ type: 'calendar', initial_view: 'dayGridMonth' }).view).toBe('month');
    });

    it('logbook: exports a required target map from entity and drops the Timeline keys', () => {
      const exported = exportCard({
        type: 'logbook',
        title: 'Timeline',
        entity: 'light.kitchen',
        hours_to_show: 48,
        orientation: 'vertical',
        group_by: 'day',
        show_now_marker: true,
        enable_scrubber: true,
        max_items: 50,
        item_density: 'comfortable',
        truncate_length: 72,
        selected_timestamp: 123,
        events: [{ x: 1 }],
      });
      expect(exported.type).toBe('logbook');
      expect(exported.target).toEqual({ entity_id: ['light.kitchen'] });
      expect(exported.title).toBe('Timeline');
      expect(exported.hours_to_show).toBe(48);
      // no top-level entity, and every invented Timeline key gone
      for (const key of [
        'entity',
        'orientation',
        'group_by',
        'show_now_marker',
        'enable_scrubber',
        'max_items',
        'item_density',
        'truncate_length',
        'selected_timestamp',
        'events',
      ]) {
        expect(exported).not.toHaveProperty(key);
      }
    });

    it('logbook: builds target entity_id from an entities[] list', () => {
      const exported = exportCard({
        type: 'logbook',
        entities: ['light.a', 'light.b'],
      });
      expect(exported.target).toEqual({ entity_id: ['light.a', 'light.b'] });
      expect(exported).not.toHaveProperty('entities');
    });

    it('logbook: re-homes a real HA target map into entity on import (round-trip)', () => {
      expect(importCard({ type: 'logbook', target: { entity_id: 'light.kitchen' } }).entity).toBe(
        'light.kitchen',
      );
      expect(
        importCard({ type: 'logbook', target: { entity_id: ['light.a', 'light.b'] } }).entities,
      ).toEqual(['light.a', 'light.b']);
    });

    it('alarm-panel: translates armed_* states to arm_* actions and drops disarmed', () => {
      const exported = exportCard({
        type: 'alarm-panel',
        entity: 'alarm_control_panel.home',
        states: ['armed_home', 'armed_away', 'armed_night', 'disarmed'],
      });
      expect(exported.states).toEqual(['arm_home', 'arm_away', 'arm_night']);
    });

    it('alarm-panel: drops the invalid armed_vacation value', () => {
      const exported = exportCard({
        type: 'alarm-panel',
        entity: 'alarm_control_panel.home',
        states: ['armed_home', 'armed_vacation'],
      });
      expect(exported.states).toEqual(['arm_home']);
    });

    it('alarm-panel: omits states entirely when nothing maps (HA falls back to its default)', () => {
      const exported = exportCard({
        type: 'alarm-panel',
        entity: 'alarm_control_panel.home',
        states: ['disarmed'],
      });
      expect(exported).not.toHaveProperty('states');
    });

    it('alarm-panel: leaves already-correct arm_* actions unchanged', () => {
      const exported = exportCard({
        type: 'alarm-panel',
        entity: 'alarm_control_panel.home',
        states: ['arm_home', 'arm_away'],
      });
      expect(exported.states).toEqual(['arm_home', 'arm_away']);
    });
  });

  // Phase 4 PR-3 — HAVDM's "Progress Ring" no longer squats on the real
  // custom:modern-circular-gauge type string: it is the HAVDM-only phantom
  // custom:havdm-progress-ring, migrated by value shape on import and substituted
  // with a placeholder on export. RED-BEFORE-GREEN: confirmed red when the PR-3
  // src is reverted in the same checkout (on the base commit the legacy type is
  // not migrated and exports as custom:modern-circular-gauge unchanged).
  describe('Progress Ring phantom (Phase 4 PR-3)', () => {
    it('migrates a legacy Progress Ring (modern-circular-gauge + rings) to the phantom type on import', () => {
      const imported = importCard({
        type: 'custom:modern-circular-gauge',
        title: 'Energy',
        rings: [{ entity: 'sensor.e', min: 0, max: 100 }],
      });
      expect(imported.type).toBe('custom:havdm-progress-ring');
      expect(imported.rings).toEqual([{ entity: 'sensor.e', min: 0, max: 100 }]);
    });

    it('leaves a REAL modern-circular-gauge (top-level entity, no rings) untouched on import', () => {
      const imported = importCard({
        type: 'custom:modern-circular-gauge',
        entity: 'sensor.e',
        min: 0,
        max: 100,
      });
      expect(imported.type).toBe('custom:modern-circular-gauge');
    });

    it('substitutes the phantom Progress Ring with a Card Not Available placeholder on export', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        {
          type: 'custom:havdm-progress-ring',
          rings: [{ entity: 'sensor.e' }],
          grid_options: { columns: 6 },
        },
        { warnings },
      );
      expect(exported.type).toBe('markdown');
      expect(String(exported.content)).toContain('Card Not Available');
      // friendly name strips the havdm- namespace prefix
      expect(String(exported.content)).toContain('progress-ring');
      // slot-holding key carried over; invented config dropped
      expect(exported.grid_options).toEqual({ columns: 6 });
      expect(exported).not.toHaveProperty('rings');
      expect(warnings.some((w) => w.category === 'placeholder')).toBe(true);
    });
  });

  // Phase 4 PR-4 — custom-card export translators: slider-button-card's
  // advanced-slider schema is approximated to the real card, and the nonexistent
  // custom:mushroom-switch-card is remapped to the real custom:mushroom-entity-card.
  // RED-BEFORE-GREEN: confirmed red when the PR-4 src is reverted in the same
  // checkout (on the base commit both hit the {...source} fall-through — the
  // invented slider keys leak and mushroom-switch keeps its nonexistent type).
  describe('custom export translators (Phase 4 PR-4)', () => {
    it('slider-button: translates orientation to slider.direction and maps show_value', () => {
      const horizontal = exportCard({
        type: 'custom:slider-button-card',
        entity: 'input_number.level',
        orientation: 'horizontal',
        show_value: true,
      });
      expect(horizontal.type).toBe('custom:slider-button-card');
      expect(horizontal.entity).toBe('input_number.level');
      expect(horizontal.slider).toEqual({ direction: 'left-right' });
      expect(horizontal.show_state).toBe(true);
      expect(horizontal).not.toHaveProperty('orientation');
      expect(horizontal).not.toHaveProperty('show_value');

      const vertical = exportCard({
        type: 'custom:slider-button-card',
        entity: 'input_number.level',
        orientation: 'vertical',
      });
      expect(vertical.slider).toEqual({ direction: 'bottom-top' });
    });

    it('slider-button: strips the invented advanced-slider keys and records ONE schema warning', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        {
          type: 'custom:slider-button-card',
          entity: 'input_number.level',
          min: 0,
          max: 100,
          step: 5,
          precision: 0,
          show_markers: true,
          commit_on_release: false,
          animate_fill: true,
          zones: [{ from: 0, to: 30, color: '#f00' }],
        },
        { warnings },
      );
      for (const key of [
        'min',
        'max',
        'step',
        'precision',
        'show_markers',
        'commit_on_release',
        'animate_fill',
        'zones',
      ]) {
        expect(exported).not.toHaveProperty(key);
      }
      const schemaWarnings = warnings.filter((w) => w.category === 'card-schema');
      expect(schemaWarnings).toHaveLength(1);
      expect(schemaWarnings[0]).toMatchObject({
        cardType: 'custom:slider-button-card',
        reason: 'schema-approximated',
      });
      expect(schemaWarnings[0].keys).toEqual(expect.arrayContaining(['zones', 'min', 'max']));
    });

    it('slider-button: emits no slider object and no warning when there is nothing to translate', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        { type: 'custom:slider-button-card', entity: 'switch.a' },
        { warnings },
      );
      expect(exported).not.toHaveProperty('slider');
      expect(warnings.filter((w) => w.category === 'card-schema')).toHaveLength(0);
    });

    it('mushroom-switch: remaps the nonexistent type to the real mushroom-entity-card', () => {
      const exported = exportCard({
        type: 'custom:mushroom-switch-card',
        entity: 'switch.fan',
        name: 'Fan',
        icon: 'mdi:fan',
        icon_color: 'blue',
        layout: 'horizontal',
      });
      expect(exported.type).toBe('custom:mushroom-entity-card');
      // the valid mushroom-entity keys are preserved
      expect(exported).toMatchObject({
        entity: 'switch.fan',
        name: 'Fan',
        icon: 'mdi:fan',
        icon_color: 'blue',
        layout: 'horizontal',
      });
    });
  });

  // Phase 4 PR-5 — bubble-card pop-up `hash`: a pop-up needs a hash for Home
  // Assistant to open it, so an empty-hash pop-up raises one honest card-schema
  // warning at export. A present hash passes through untouched (bubble has no
  // per-card exporter; it falls through {...source}). RED-BEFORE-GREEN: confirmed
  // red when the PR-5 src is reverted in the same checkout (on the base commit
  // exportCard has no bubble warning branch, so no warning is pushed).
  describe('bubble-card pop-up hash warning (Phase 4 PR-5)', () => {
    it('warns when a pop-up bubble-card has no hash', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        { type: 'custom:bubble-card', card_type: 'pop-up', name: 'Kitchen' },
        { warnings },
      );
      const schemaWarnings = warnings.filter((w) => w.category === 'card-schema');
      expect(schemaWarnings).toHaveLength(1);
      expect(schemaWarnings[0]).toMatchObject({
        cardType: 'custom:bubble-card',
        reason: 'missing-required-key',
        keys: ['hash'],
      });
      // the card type is not otherwise altered
      expect(exported.type).toBe('custom:bubble-card');
    });

    it('warns when a pop-up bubble-card hash is blank/whitespace', () => {
      const warnings: ExportWarning[] = [];
      exportCard({ type: 'custom:bubble-card', card_type: 'pop-up', hash: '   ' }, { warnings });
      expect(warnings.filter((w) => w.reason === 'missing-required-key')).toHaveLength(1);
    });

    it('does NOT warn when a pop-up bubble-card carries a hash', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        { type: 'custom:bubble-card', card_type: 'pop-up', hash: '#kitchen' },
        { warnings },
      );
      expect(warnings.filter((w) => w.category === 'card-schema')).toHaveLength(0);
      // a valid hash survives export untouched
      expect(exported.hash).toBe('#kitchen');
    });

    it('does NOT warn for a non-pop-up bubble-card without a hash', () => {
      const warnings: ExportWarning[] = [];
      exportCard({ type: 'custom:bubble-card', card_type: 'button' }, { warnings });
      expect(warnings.filter((w) => w.category === 'card-schema')).toHaveLength(0);
    });
  });

  // Phase 4 PR-6 — expander-card: `expanded-icon`/`collapsed-icon` exist in NEITHER
  // fork (Alia5 or MelleD, verified read-only) so they are stripped on export
  // (the HAVDM canvas keeps them). HAVDM's single `gap` is the OPEN child gap; the
  // forks read the open gap under different keys, so export emits BOTH `gap`
  // (Alia5) and `expanded-gap` (MelleD v7.1.10+), and import prefers `expanded-gap`.
  // RED-BEFORE-GREEN: confirmed red when the PR-6 exporter change is reverted in
  // the same checkout (base emits the icon keys and no `expanded-gap`).
  describe('expander-card icon strip + gap/expanded-gap (Phase 4 PR-6)', () => {
    it('strips the invented expanded-icon/collapsed-icon on export', () => {
      const exported = exportCard({
        type: 'custom:expander-card',
        title: 'S',
        'expanded-icon': 'mdi:plus',
        'collapsed-icon': 'mdi:minus',
        expandedIcon: 'mdi:plus',
        collapsedIcon: 'mdi:minus',
        cards: [],
      });
      expect(exported).not.toHaveProperty('expanded-icon');
      expect(exported).not.toHaveProperty('collapsed-icon');
      expect(exported).not.toHaveProperty('expandedIcon');
      expect(exported).not.toHaveProperty('collapsedIcon');
      expect(exported.type).toBe('custom:expander-card');
    });

    it('emits the open gap under both gap and expanded-gap', () => {
      const exported = exportCard({
        type: 'custom:expander-card',
        gap: '0.6em',
        cards: [],
      });
      expect(exported.gap).toBe('0.6em');
      expect(exported['expanded-gap']).toBe('0.6em');
    });

    it('emits neither gap key when the card carries no gap', () => {
      const exported = exportCard({ type: 'custom:expander-card', cards: [] });
      expect(exported).not.toHaveProperty('gap');
      expect(exported).not.toHaveProperty('expanded-gap');
    });

    it('imports a MelleD expander preferring expanded-gap as the open gap', () => {
      const imported = importCard({
        type: 'custom:expander-card',
        gap: '0em',
        'expanded-gap': '0.6em',
        cards: [],
      });
      // HAVDM's single `gap` takes the OPEN value (expanded-gap), not the closed one.
      expect(imported.gap).toBe('0.6em');
    });

    it('imports an Alia5 expander using gap as the open gap when no expanded-gap', () => {
      const imported = importCard({
        type: 'custom:expander-card',
        gap: '0.5em',
        cards: [],
      });
      expect(imported.gap).toBe('0.5em');
    });
  });

  // Phase 4 PR-7 — power-flow-card-plus (flixlix) REQUIRES a battery state_of_charge
  // entity; without it the battery leg does not render. Scoped to -plus only
  // (power-flow-card [ulic75] uses a different, optional key). RED-BEFORE-GREEN:
  // confirmed red when the PR-7 exporter change is reverted (base has no power-flow
  // warning branch, so no warning is pushed).
  describe('power-flow-card-plus battery state_of_charge warning (Phase 4 PR-7)', () => {
    it('warns when a power-flow-card-plus battery has no state_of_charge', () => {
      const warnings: ExportWarning[] = [];
      exportCard(
        { type: 'custom:power-flow-card-plus', entities: { battery: { entity: 'sensor.batt' } } },
        { warnings },
      );
      const missing = warnings.filter((w) => w.reason === 'missing-required-key');
      expect(missing).toHaveLength(1);
      expect(missing[0]).toMatchObject({
        cardType: 'custom:power-flow-card-plus',
        keys: ['entities.battery.state_of_charge'],
      });
    });

    it('does NOT warn when state_of_charge is present', () => {
      const warnings: ExportWarning[] = [];
      exportCard(
        {
          type: 'custom:power-flow-card-plus',
          entities: { battery: { entity: 'sensor.batt', state_of_charge: 'sensor.soc' } },
        },
        { warnings },
      );
      expect(warnings.filter((w) => w.reason === 'missing-required-key')).toHaveLength(0);
    });

    it('does NOT warn when there is no battery configured', () => {
      const warnings: ExportWarning[] = [];
      exportCard(
        { type: 'custom:power-flow-card-plus', entities: { grid: { entity: 'sensor.grid' } } },
        { warnings },
      );
      expect(warnings.filter((w) => w.reason === 'missing-required-key')).toHaveLength(0);
    });

    it('does NOT warn for power-flow-card (ulic75) missing a state_of_charge', () => {
      const warnings: ExportWarning[] = [];
      exportCard(
        { type: 'custom:power-flow-card', entities: { battery: { entity: 'sensor.batt' } } },
        { warnings },
      );
      expect(warnings.filter((w) => w.reason === 'missing-required-key')).toHaveLength(0);
    });
  });

  // Slice B6 — the TRANSLATE→card-mod path exercised directly through exportCard /
  // exportDashboard: the capability-gate default (assume present), the strip+warn
  // branch, the collision guard, and merge-not-clobber. RED-BEFORE-GREEN: the
  // strip/translate assertions were confirmed red when the B6 src is reverted in
  // the same checkout (on main exportCard has no options param and never touches
  // these keys).
  describe('card-mod translate (B6) — export options', () => {
    it('strips TRANSLATE keys and records a plain-language warning when card-mod is unavailable', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        {
          type: 'horizontal-stack',
          gap: 12,
          align_items: 'center',
          style: 'background: blue;',
          cards: [],
        },
        { cardModAvailable: false, warnings },
      );
      expect(exported).not.toHaveProperty('card_mod');
      expect(exported).not.toHaveProperty('gap');
      expect(exported).not.toHaveProperty('align_items');
      expect(exported).not.toHaveProperty('style');
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toMatchObject({
        cardType: 'horizontal-stack',
        reason: 'card-mod-unavailable',
      });
      expect(warnings[0].keys).toEqual(expect.arrayContaining(['gap', 'align_items', 'style']));
      expect(warnings[0].message).toContain('card-mod');
    });

    it('emits a card_mod block by default (card-mod assumed present)', () => {
      const exported = exportCard({ type: 'markdown', content: 'x', style: 'color: red;' });
      const cardMod = exported.card_mod as { style: string } | undefined;
      expect(cardMod?.style).toContain('ha-card {');
      expect(cardMod?.style).toContain('color: red;');
      expect(exported).not.toHaveProperty('style');
    });

    it('merges the generated CSS into an existing string card_mod, not clobbering it', () => {
      const exported = exportCard({
        type: 'markdown',
        content: 'x',
        style: 'background: green;',
        card_mod: { style: 'ha-card { color: white; }' },
      });
      const cardMod = exported.card_mod as { style: string };
      expect(cardMod.style).toContain('color: white;'); // pre-existing preserved
      expect(cardMod.style).toContain('background: green;'); // ours appended
      expect(exported).not.toHaveProperty('style');
    });

    it('does not translate a string `gap` on a non-expander card (numeric collision guard)', () => {
      const exported = exportCard({ type: 'custom:some-card', gap: '1rem', cards: [] });
      expect(exported.gap).toBe('1rem');
      expect(exported).not.toHaveProperty('card_mod');
    });

    it('collects warnings from NESTED cards through exportDashboard', () => {
      const warnings: ExportWarning[] = [];
      exportDashboard(
        {
          title: 'D',
          views: [
            {
              title: 'V',
              cards: [
                {
                  type: 'vertical-stack',
                  cards: [{ type: 'markdown', content: 'n', style: 'background: red;' }],
                },
              ],
            },
          ],
        },
        { cardModAvailable: false, warnings },
      );
      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings.some((w) => w.cardType === 'markdown')).toBe(true);
    });
  });

  // Slice B6b — the TRANSLATE→HA-native-`visibility` path (visibility_conditions +
  // visibility_operator -> native `visibility`), exercised directly through
  // exportCard / exportDashboard. RED-BEFORE-GREEN: confirmed red when the B6b src
  // is reverted in the same checkout (on main the visibility keys pass through).
  describe('visibility translate (B6b) — export options', () => {
    it('approximates entity_exists to state_not unavailable + records a warning', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        {
          type: 'markdown',
          content: 'x',
          visibility_conditions: [{ condition: 'entity_exists', entity: 'light.a' }],
        },
        { warnings },
      );
      expect(exported.visibility).toEqual([
        { condition: 'state', entity: 'light.a', state_not: ['unavailable', 'unknown'] },
      ]);
      expect(exported).not.toHaveProperty('visibility_conditions');
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toMatchObject({
        category: 'visibility',
        cardType: 'markdown',
        reason: 'visibility-approximated',
      });
      expect(warnings[0].message.toLowerCase()).toContain('exist');
    });

    it('appends translated conditions to an existing native visibility (merge, not clobber)', () => {
      const exported = exportCard({
        type: 'markdown',
        content: 'x',
        visibility: [{ condition: 'user', users: ['abc'] }],
        visibility_conditions: [{ condition: 'state_equals', entity: 'light.a', value: 'on' }],
      });
      expect(exported.visibility).toEqual([
        { condition: 'user', users: ['abc'] },
        { condition: 'state', entity: 'light.a', state: 'on' },
      ]);
    });

    it('leaves cards without visibility keys unchanged', () => {
      const exported = exportCard({ type: 'markdown', content: 'x' });
      expect(exported).not.toHaveProperty('visibility');
    });

    it('collects visibility warnings from NESTED cards through exportDashboard', () => {
      const warnings: ExportWarning[] = [];
      exportDashboard(
        {
          title: 'D',
          views: [
            {
              title: 'V',
              cards: [
                {
                  type: 'vertical-stack',
                  cards: [
                    {
                      type: 'markdown',
                      content: 'n',
                      visibility_conditions: [{ condition: 'entity_exists', entity: 'light.a' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        { warnings },
      );
      expect(warnings.some((w) => w.category === 'visibility')).toBe(true);
    });
  });

  // Slice B7 — canvas-only phantom card TYPES -> markdown "Card Not Available"
  // placeholder, exercised directly through exportCard / exportDashboard.
  // RED-BEFORE-GREEN: confirmed red when the B7 src is reverted in the same
  // checkout (on main the phantom type passes through unchanged).
  describe('canvas-only placeholder (B7) — export options', () => {
    it('replaces a phantom type with a markdown placeholder + records a warning', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        { type: 'custom:native-graph-card', entity: 'sensor.x', grid_options: { columns: 6 } },
        { warnings },
      );
      expect(exported.type).toBe('markdown');
      expect(String(exported.content)).toContain('Card Not Available');
      // slot-holding key carried over
      expect(exported.grid_options).toEqual({ columns: 6 });
      // original phantom fields dropped
      expect(exported).not.toHaveProperty('entity');
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toMatchObject({
        category: 'placeholder',
        cardType: 'custom:native-graph-card',
        reason: 'canvas-only-type',
      });
    });

    it('leaves a real deployable card unchanged (no placeholder, no warning)', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard({ type: 'custom:apexcharts-card', series: [] }, { warnings });
      expect(exported.type).toBe('custom:apexcharts-card');
      expect(warnings).toHaveLength(0);
    });

    it('collects placeholder warnings from NESTED phantom cards through exportDashboard', () => {
      const warnings: ExportWarning[] = [];
      exportDashboard(
        {
          title: 'D',
          views: [
            {
              title: 'V',
              cards: [
                {
                  type: 'vertical-stack',
                  cards: [{ type: 'custom:popup-card', popup: { cards: [] } }],
                },
              ],
            },
          ],
        },
        { warnings },
      );
      expect(
        warnings.some((w) => w.category === 'placeholder' && w.cardType === 'custom:popup-card'),
      ).toBe(true);
    });
  });

  // Phase 4 PR-1 — canvas-only behavioural keys are stripped on export, with a
  // plain-language warning for the ones a user actively configures. Exercised
  // through the stable exportCard / exportDashboard API. RED-BEFORE-GREEN:
  // confirmed red when the PR-1 src is reverted in the same checkout (on the base
  // commit exportCard leaves these keys on the card and raises no canvas-key
  // warning).
  describe('canvas-only behavioural-key strip+warn (Phase 4 PR-1)', () => {
    it('strips the behavioural keys and records ONE warning naming them', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        {
          type: 'custom:button-card',
          entity: 'light.a',
          sound: { enabled: true },
          multi_entity_mode: 'aggregate',
          aggregate_function: 'sum',
          trigger_animations: [{ trigger: 'state', animation: 'pulse' }],
          state_icons: { on: 'mdi:flash' },
        },
        { warnings },
      );
      // Real key survives; every canvas key is gone.
      expect(exported.entity).toBe('light.a');
      for (const key of [
        'sound',
        'multi_entity_mode',
        'aggregate_function',
        'trigger_animations',
        'state_icons',
      ]) {
        expect(exported).not.toHaveProperty(key);
      }
      // Exactly one canvas-key warning, listing all the dropped keys.
      const canvasWarnings = warnings.filter((w) => w.category === 'canvas-key');
      expect(canvasWarnings).toHaveLength(1);
      expect(canvasWarnings[0]).toMatchObject({
        category: 'canvas-key',
        cardType: 'custom:button-card',
        reason: 'canvas-behavioural',
      });
      expect(canvasWarnings[0].keys).toEqual(
        expect.arrayContaining([
          'sound',
          'multi_entity_mode',
          'aggregate_function',
          'trigger_animations',
          'state_icons',
        ]),
      );
    });

    it('strips haptic (now a canvas key) and warns', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        { type: 'button', entity: 'light.a', haptic: { enabled: true, pattern: 'light' } },
        { warnings },
      );
      expect(exported).not.toHaveProperty('haptic');
      expect(warnings.some((w) => w.category === 'canvas-key' && w.keys.includes('haptic'))).toBe(
        true,
      );
    });

    it('silently strips the derived/internal keys (no canvas-key warning)', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard(
        {
          type: 'custom:button-card',
          entity: 'light.a',
          icon_color_states: { on: '#fff', off: '#000' },
          icon_color_attribute: 'rgb_color',
          smart_defaults: true,
        },
        { warnings },
      );
      for (const key of ['icon_color_states', 'icon_color_attribute', 'smart_defaults']) {
        expect(exported).not.toHaveProperty(key);
      }
      expect(warnings.filter((w) => w.category === 'canvas-key')).toHaveLength(0);
    });

    it('leaves a card with no canvas keys unchanged and raises no warning', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportCard({ type: 'markdown', content: 'x' }, { warnings });
      expect(exported).toEqual({ type: 'markdown', content: 'x' });
      expect(warnings).toHaveLength(0);
    });

    it('strips canvas keys from NESTED cards through exportDashboard', () => {
      const warnings: ExportWarning[] = [];
      const exported = exportDashboard(
        {
          title: 'D',
          views: [
            {
              title: 'V',
              cards: [
                {
                  type: 'vertical-stack',
                  cards: [
                    { type: 'custom:button-card', entity: 'light.a', sound: { enabled: true } },
                  ],
                },
              ],
            },
          ],
        },
        { warnings },
      );
      const views = exported.views as Array<Record<string, unknown>>;
      const topCard = (views[0].cards as Array<Record<string, unknown>>)[0];
      const nested = (topCard.cards as Array<Record<string, unknown>>)[0];
      expect(nested).not.toHaveProperty('sound');
      expect(
        warnings.some((w) => w.category === 'canvas-key' && w.cardType === 'custom:button-card'),
      ).toBe(true);
    });
  });
});
