import { describe, expect, it } from 'vitest';
import {
  exportCard,
  exportDashboard,
  importCard,
  importDashboard,
  migrateLegacyCard,
} from '../../src/services/yamlConversionService';

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

  it('imports and exports expander-card with kebab/camel mappings and strips _expanderDepth on export', () => {
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
    expect(exported).toMatchObject(upstream);
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
    expect(((exported.tabs as Array<Record<string, unknown>>)[0]).badge).toBeUndefined();
    expect(((exported.tabs as Array<Record<string, unknown>>)[0]).count).toBeUndefined();
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
    const importedSwipe = ((imported.views as Array<Record<string, unknown>>)[0].cards as Array<Record<string, unknown>>)[0]
      .cards as Array<Record<string, unknown>>;
    expect((importedSwipe[0] as Record<string, unknown>).slides).toBeTruthy();

    const exported = exportDashboard(imported);
    const exportedVertical = (((exported.views as Array<Record<string, unknown>>)[0].cards as Array<Record<string, unknown>>)[0]
      .cards as Array<Record<string, unknown>>);
    const exportedSwipe = exportedVertical[0];
    const exportedConditional = exportedVertical[1];
    const exportedTabbed = exportedConditional.card as Record<string, unknown>;
    const exportedPopup = ((exportedTabbed.tabs as Array<Record<string, unknown>>)[0].card as Record<string, unknown>);

    expect(exportedSwipe.type).toBe('custom:swipe-card');
    expect((exportedSwipe.parameters as Record<string, unknown>).slidesPerView).toBe(1);
    expect(exportedTabbed.options).toEqual({ defaultTabIndex: 0 });
    expect(exportedPopup.popup).toMatchObject({ cards: [{ type: 'markdown', content: 'Popup child' }] });
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
      initial_view: 'list',
      extra: 'keep',
    });
    expect((exported as Record<string, unknown>).show_week_numbers).toBeUndefined();
    expect((exported as Record<string, unknown>).show_agenda).toBeUndefined();
    expect((exported as Record<string, unknown>).calendar_entities).toBeUndefined();
    expect((exported as Record<string, unknown>).on_date_select).toBeUndefined();
    expect((exported as Record<string, unknown>).events).toBeUndefined();
  });
});
