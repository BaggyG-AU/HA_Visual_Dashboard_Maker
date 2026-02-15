/**
 * Card Type Registry
 *
 * Manages available card types for the palette.
 * Designed to support:
 * - Static standard HA cards (Phase 4 - MVP)
 * - Dynamic discovery from HA API (Phase 13)
 * - HACS custom cards (Phase 13+)
 */
import { logger } from './logger';

export type CardCategory =
  | 'layout'
  | 'sensor'
  | 'control'
  | 'media'
  | 'information'
  | 'custom';

export type CardSource =
  | 'builtin'    // Standard HA cards
  | 'hacs'       // HACS custom cards
  | 'custom'     // User custom cards
  | 'discovered'; // Discovered from HA instance

export interface CardTypeMetadata {
  type: string;
  name: string;
  category: CardCategory;
  icon: string; // Ant Design icon name or MDI icon
  description: string;
  isCustom: boolean;
  source: CardSource;
  defaultProps?: Record<string, any>;
  requiredProps?: string[];
}

class CardRegistry {
  private cards: Map<string, CardTypeMetadata> = new Map();

  constructor() {
    // Initialize with standard HA cards
    this.registerStandardCards();
  }

  /**
   * Register standard Home Assistant cards
   * This will be the default set for MVP
   */
  private registerStandardCards() {
    const standardCards: CardTypeMetadata[] = [
      // Layout Cards
      {
        type: 'horizontal-stack',
        name: 'Horizontal Stack',
        category: 'layout',
        icon: 'BorderHorizontalOutlined',
        description: 'Stack cards horizontally in a row',
        isCustom: false,
        source: 'builtin',
        defaultProps: { cards: [] },
        requiredProps: ['cards'],
      },
      {
        type: 'vertical-stack',
        name: 'Vertical Stack',
        category: 'layout',
        icon: 'BorderVerticleOutlined',
        description: 'Stack cards vertically in a column',
        isCustom: false,
        source: 'builtin',
        defaultProps: { cards: [] },
        requiredProps: ['cards'],
      },
      {
        type: 'grid',
        name: 'Grid',
        category: 'layout',
        icon: 'AppstoreOutlined',
        description: 'Display cards in a grid layout',
        isCustom: false,
        source: 'builtin',
        defaultProps: { cards: [], columns: 3 },
        requiredProps: ['cards'],
      },
      {
        type: 'spacer',
        name: 'Spacer',
        category: 'layout',
        icon: 'BorderOutlined',
        description: 'Empty space for layout purposes',
        isCustom: false,
        source: 'builtin',
        defaultProps: { _isSpacer: true },
      },

      // Sensor/Display Cards
      {
        type: 'entities',
        name: 'Entities',
        category: 'sensor',
        icon: 'UnorderedListOutlined',
        description: 'Display multiple entities in a list',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [] },
        requiredProps: ['entities'],
      },
      {
        type: 'glance',
        name: 'Glance',
        category: 'sensor',
        icon: 'EyeOutlined',
        description: 'Quick overview of multiple entities',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [] },
        requiredProps: ['entities'],
      },
      {
        type: 'sensor',
        name: 'Sensor',
        category: 'sensor',
        icon: 'DashboardOutlined',
        description: 'Display a single sensor value',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'gauge',
        name: 'Gauge',
        category: 'sensor',
        icon: 'DashboardOutlined',
        description: 'Display sensor value as a gauge',
        isCustom: false,
        source: 'builtin',
        defaultProps: { min: 0, max: 100 },
        requiredProps: ['entity'],
      },
      {
        type: 'history-graph',
        name: 'History Graph',
        category: 'sensor',
        icon: 'LineChartOutlined',
        description: 'Display entity history as a graph',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [], hours_to_show: 24 },
        requiredProps: ['entities'],
      },
      {
        type: 'calendar',
        name: 'Calendar View',
        category: 'sensor',
        icon: 'CalendarOutlined',
        description: 'Calendar events with month, week, and day previews',
        isCustom: false,
        source: 'builtin',
        defaultProps: {
          title: 'Calendar',
          calendar_entities: ['calendar.home'],
          view: 'month',
          show_week_numbers: true,
          show_agenda: true,
          on_date_select: {
            action: 'more-info',
          },
        },
      },
      {
        type: 'logbook',
        name: 'Timeline (Logbook)',
        category: 'sensor',
        icon: 'ClockCircleOutlined',
        description: 'Chronological event timeline backed by Home Assistant logbook semantics',
        isCustom: false,
        source: 'builtin',
        defaultProps: {
          title: 'Timeline',
          hours_to_show: 24,
          orientation: 'vertical',
          show_now_marker: true,
          group_by: 'day',
          max_items: 50,
          enable_scrubber: true,
          item_density: 'comfortable',
          truncate_length: 72,
        },
      },

      // Control Cards
      {
        type: 'button',
        name: 'Button',
        category: 'control',
        icon: 'PushpinOutlined',
        description: 'Single entity control button',
        isCustom: false,
        source: 'builtin',
        defaultProps: { smart_defaults: true },
        requiredProps: ['entity'],
      },
      {
        type: 'light',
        name: 'Light',
        category: 'control',
        icon: 'BulbOutlined',
        description: 'Control a light entity',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'thermostat',
        name: 'Thermostat',
        category: 'control',
        icon: 'FireOutlined',
        description: 'Control climate entities',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },

      // Information Cards
      {
        type: 'markdown',
        name: 'Markdown',
        category: 'information',
        icon: 'FileTextOutlined',
        description: 'Display formatted text and markdown',
        isCustom: false,
        source: 'builtin',
        defaultProps: { content: '# Title\n\nYour content here...' },
        requiredProps: ['content'],
      },
      {
        type: 'picture',
        name: 'Picture',
        category: 'information',
        icon: 'PictureOutlined',
        description: 'Display an image',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['image'],
      },
      {
        type: 'picture-entity',
        name: 'Picture Entity',
        category: 'information',
        icon: 'PictureOutlined',
        description: 'Display image with entity state',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity', 'image'],
      },
      {
        type: 'picture-glance',
        name: 'Picture Glance',
        category: 'information',
        icon: 'PictureOutlined',
        description: 'Picture with entity controls',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [] },
        requiredProps: ['image', 'entities'],
      },

      // Media Cards
      {
        type: 'media-control',
        name: 'Media Control',
        category: 'media',
        icon: 'PlayCircleOutlined',
        description: 'Control media player entities',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },

      // Other
      {
        type: 'map',
        name: 'Map',
        category: 'information',
        icon: 'EnvironmentOutlined',
        description: 'Display device tracker on map',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [] },
        requiredProps: ['entities'],
      },
      {
        type: 'weather-forecast',
        name: 'Weather Forecast',
        category: 'information',
        icon: 'CloudOutlined',
        description: 'Display weather forecast',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'alarm-panel',
        name: 'Alarm Panel',
        category: 'control',
        icon: 'SafetyOutlined',
        description: 'Control alarm panel entity',
        isCustom: false,
        source: 'builtin',
        defaultProps: { states: ['armed_home', 'armed_away', 'armed_night', 'disarmed'] },
        requiredProps: ['entity'],
      },
      {
        type: 'plant-status',
        name: 'Plant Status',
        category: 'sensor',
        icon: 'ExperimentOutlined',
        description: 'Display plant health metrics',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'conditional',
        name: 'Conditional',
        category: 'layout',
        icon: 'BranchesOutlined',
        description: 'Show card based on conditions',
        isCustom: false,
        source: 'builtin',
        defaultProps: { conditions: [], card: {} },
        requiredProps: ['conditions', 'card'],
      },
      {
        type: 'custom:swipe-card',
        name: 'Swipe Card',
        category: 'layout',
        icon: 'SwapOutlined',
        description: 'Carousel container with swipeable slides (Swiper.js)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {
          parameters: {
            pagination: { type: 'bullets', clickable: true },
            navigation: true,
            effect: 'slide',
            slidesPerView: 1,
            spaceBetween: 16,
            loop: false,
            direction: 'horizontal',
          },
          cards: [],
        },
        requiredProps: ['cards'],
      },
      {
        type: 'custom:expander-card',
        name: 'Expander Card',
        category: 'layout',
        icon: 'MenuFoldOutlined',
        description: 'Expandable section container for organizing cards',
        isCustom: true,
        source: 'hacs',
        defaultProps: {
          title: 'Section 1',
          expanded: false,
          cards: [],
        },
        requiredProps: ['cards'],
      },
      {
        type: 'custom:tabbed-card',
        name: 'Tabbed Card',
        category: 'layout',
        icon: 'AppstoreOutlined',
        description: 'Tabbed container for organizing cards',
        isCustom: true,
        source: 'hacs',
        defaultProps: {
          tabs: [
            {
              attributes: { label: 'Tab 1', icon: 'mdi:tab' },
              card: { type: 'markdown', content: 'Tab content' },
            },
          ],
        },
        requiredProps: ['tabs'],
      },
      {
        type: 'custom:popup-card',
        name: 'Popup Card (HAVDM-only)',
        category: 'layout',
        icon: 'ExpandOutlined',
        description: 'Trigger a modal popup containing cards. HAVDM editor feature - not a standard HACS card.',
        isCustom: true,
        source: 'custom',
        defaultProps: {
          title: 'Popup Trigger',
          trigger_label: 'Open Popup',
          trigger_icon: 'mdi:open-in-new',
          popup: {
            title: 'Details',
            size: 'medium',
            close_on_backdrop: true,
            backdrop_opacity: 0.45,
            show_header: true,
            show_footer: false,
            close_label: 'Close',
            footer_actions: [],
            cards: [
              { type: 'markdown', content: 'Popup content' },
            ],
          },
        },
        requiredProps: ['popup'],
      },

      // Custom HACS Cards
      {
        type: 'custom:mini-graph-card',
        name: 'Sparkline (Mini Graph)',
        category: 'custom',
        icon: 'LineChartOutlined',
        description: 'Compact sparkline trend card (HACS mini-graph-card)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {
          entities: [],
          hours_to_show: 24,
          points_per_hour: 1,
          line_width: 2,
          height: 96,
          show: {
            name: true,
            state: true,
            icon: true,
            fill: false,
            extrema: false,
          },
        },
        requiredProps: ['entities'],
      },
      {
        type: 'custom:apexcharts-card',
        name: 'ApexCharts',
        category: 'custom',
        icon: 'AreaChartOutlined',
        description: 'Advanced charting (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { series: [] },
        requiredProps: ['series'],
      },
      {
        type: 'custom:native-graph-card',
        name: 'Native Graph',
        category: 'custom',
        icon: 'LineChartOutlined',
        description: 'Native Recharts visualization with line/bar/area/pie modes',
        isCustom: true,
        source: 'custom',
        defaultProps: {
          chart_type: 'line',
          time_range: '24h',
          refresh_interval: '30s',
          x_axis: { mode: 'time' },
          y_axis: { min: 'auto', max: 'auto' },
          zoom_pan: true,
          series: [
            {
              entity: 'sensor.example_temperature',
              label: 'Series 1',
              color: '#4fa3ff',
              axis: 'left',
              smooth: true,
              stack: false,
            },
          ],
        },
        requiredProps: ['series'],
      },
      {
        type: 'custom:gauge-card-pro',
        name: 'Gauge Card Pro',
        category: 'custom',
        icon: 'DashboardOutlined',
        description: 'HACS Gauge Card Pro with segments, gradient, and needle modes',
        isCustom: true,
        source: 'hacs',
        defaultProps: {
          entity: 'sensor.example_temperature',
          header: 'Gauge Card Pro',
          min: 0,
          max: 100,
          needle: false,
          gradient: false,
          segments: [
            { from: 0, color: '#ff6b6b', label: 'Low' },
            { from: 30, color: '#ffd166', label: 'Medium' },
            { from: 70, color: '#6ccf7f', label: 'High' },
          ],
          value_texts: {
            primary_unit: '%',
          },
        },
        requiredProps: ['entity'],
      },
      {
        type: 'custom:slider-button-card',
        name: 'Slider Button Card',
        category: 'custom',
        icon: 'SlidersOutlined',
        description: 'Upstream-aligned slider button card with HAVDM advanced slider controls',
        isCustom: true,
        source: 'hacs',
        defaultProps: {
          entity: 'input_number.example_level',
          min: 0,
          max: 100,
          step: 5,
          precision: 0,
          orientation: 'horizontal',
          show_markers: true,
          show_value: true,
          commit_on_release: false,
          animate_fill: true,
          zones: [
            { from: 0, to: 30, color: '#ff6b6b', label: 'Low' },
            { from: 31, to: 70, color: '#ffd166', label: 'Medium' },
            { from: 71, to: 100, color: '#6ccf7f', label: 'High' },
          ],
          haptic: {
            enabled: false,
            pattern: 'light',
          },
        },
        requiredProps: ['entity'],
      },
      {
        type: 'custom:modern-circular-gauge',
        name: 'Modern Circular Gauge',
        category: 'custom',
        icon: 'DashboardOutlined',
        description: 'Progress ring visualization with single or nested gauges',
        isCustom: true,
        source: 'hacs',
        defaultProps: {
          title: 'Progress Ring',
          thickness: 12,
          start_angle: 0,
          direction: 'clockwise',
          animate: true,
          animation_duration_ms: 500,
          show_labels: true,
          label_precision: 0,
          rings: [
            {
              entity: 'sensor.daily_energy_progress',
              label: 'Daily',
              min: 0,
              max: 100,
              color: '#4fa3ff',
            },
          ],
        },
        requiredProps: ['rings'],
      },
      {
        type: 'custom:button-card',
        name: 'Button Card',
        category: 'custom',
        icon: 'BorderOutlined',
        description: 'Advanced button card (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { smart_defaults: true },
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-entity-card',
        name: 'Mushroom Entity',
        category: 'custom',
        icon: 'AppstoreOutlined',
        description: 'Mushroom style entity (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-light-card',
        name: 'Mushroom Light',
        category: 'custom',
        icon: 'BulbOutlined',
        description: 'Mushroom style light (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-climate-card',
        name: 'Mushroom Climate',
        category: 'custom',
        icon: 'FireOutlined',
        description: 'Mushroom style thermostat (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-cover-card',
        name: 'Mushroom Cover',
        category: 'custom',
        icon: 'BorderOutlined',
        description: 'Mushroom style cover (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-fan-card',
        name: 'Mushroom Fan',
        category: 'custom',
        icon: 'BorderOutlined',
        description: 'Mushroom style fan (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-switch-card',
        name: 'Mushroom Switch',
        category: 'custom',
        icon: 'PoweroffOutlined',
        description: 'Mushroom style switch (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:bubble-card',
        name: 'Bubble Card',
        category: 'custom',
        icon: 'BorderOutlined',
        description: 'Bubble style card with sub-buttons (HACS v3.1.0+)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { card_type: 'button', sub_button: [] },
        requiredProps: ['card_type'],
      },
      {
        type: 'custom:better-thermostat-ui-card',
        name: 'Better Thermostat',
        category: 'custom',
        icon: 'FireOutlined',
        description: 'Enhanced thermostat (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:power-flow-card',
        name: 'Power Flow',
        category: 'custom',
        icon: 'ThunderboltOutlined',
        description: 'Energy flow visualization (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: [],
      },
      {
        type: 'custom:power-flow-card-plus',
        name: 'Power Flow Plus',
        category: 'custom',
        icon: 'ThunderboltOutlined',
        description: 'Advanced energy flow visualization (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: [],
      },
      {
        type: 'custom:webrtc-camera',
        name: 'WebRTC Camera',
        category: 'custom',
        icon: 'VideoCameraOutlined',
        description: 'Low-latency camera streaming (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['url'],
      },
      {
        type: 'custom:surveillance-card',
        name: 'Surveillance Card',
        category: 'custom',
        icon: 'VideoCameraOutlined',
        description: 'Multi-camera surveillance view (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { cameras: [] },
        requiredProps: ['cameras'],
      },
      {
        type: 'custom:frigate-card',
        name: 'Frigate Card',
        category: 'custom',
        icon: 'VideoCameraOutlined',
        description: 'Advanced Frigate NVR integration (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { cameras: [] },
        requiredProps: ['cameras'],
      },
      {
        type: 'custom:camera-card',
        name: 'Camera Card',
        category: 'custom',
        icon: 'VideoCameraOutlined',
        description: 'Enhanced camera card with PTZ controls (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },

      // Tier 1 Priority Cards
      {
        type: 'custom:card-mod',
        name: 'Card Mod',
        category: 'custom',
        icon: 'FormatPainterOutlined',
        description: 'Add custom CSS styling to any card (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { style: '' },
        requiredProps: [],
      },
      {
        type: 'custom:auto-entities',
        name: 'Auto Entities',
        category: 'custom',
        icon: 'ThunderboltOutlined',
        description: 'Automatically populate entities based on filters (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { filter: { include: [] }, card: { type: 'entities' } },
        requiredProps: ['filter', 'card'],
      },
      {
        type: 'custom:vertical-stack-in-card',
        name: 'Vertical Stack in Card',
        category: 'custom',
        icon: 'BorderVerticleOutlined',
        description: 'Stack cards vertically in single bordered container (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { cards: [] },
        requiredProps: ['cards'],
      },
      {
        type: 'custom:mini-media-player',
        name: 'Mini Media Player',
        category: 'custom',
        icon: 'PlayCircleOutlined',
        description: 'Minimalistic media player card (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:multiple-entity-row',
        name: 'Multiple Entity Row',
        category: 'custom',
        icon: 'UnorderedListOutlined',
        description: 'Show multiple entities on single row (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { entities: [] },
        requiredProps: ['entity'],
      },

      // Tier 2 Priority Cards
      {
        type: 'custom:fold-entity-row',
        name: 'Fold Entity Row',
        category: 'custom',
        icon: 'MenuFoldOutlined',
        description: 'Collapsible rows in entities cards (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { head: {}, items: [] },
        requiredProps: ['head'],
      },
      {
        type: 'custom:slider-entity-row',
        name: 'Slider Entity Row',
        category: 'custom',
        icon: 'SlidersFilled',
        description: 'Add sliders to entities cards (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:battery-state-card',
        name: 'Battery State Card',
        category: 'custom',
        icon: 'ThunderboltOutlined',
        description: 'Track battery states across devices (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { entities: [] },
        requiredProps: ['entities'],
      },
      {
        type: 'custom:simple-swipe-card',
        name: 'Simple Swipe Card',
        category: 'custom',
        icon: 'SwapOutlined',
        description: 'Swipe through cards with touch gestures (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { cards: [] },
        requiredProps: ['cards'],
      },
      {
        type: 'custom:decluttering-card',
        name: 'Decluttering Card',
        category: 'custom',
        icon: 'FileProtectOutlined',
        description: 'Reusable card templates (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { template: '', variables: [] },
        requiredProps: ['template'],
      },

      // Additional Mushroom Cards
      {
        type: 'custom:mushroom-chips-card',
        name: 'Mushroom Chips',
        category: 'custom',
        icon: 'AppstoreOutlined',
        description: 'Compact chip-style controls (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { chips: [] },
        requiredProps: ['chips'],
      },
      {
        type: 'custom:mushroom-title-card',
        name: 'Mushroom Title',
        category: 'custom',
        icon: 'FontSizeOutlined',
        description: 'Section headers with icons (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: { title: 'Title' },
        requiredProps: ['title'],
      },
      {
        type: 'custom:mushroom-template-card',
        name: 'Mushroom Template',
        category: 'custom',
        icon: 'CodeOutlined',
        description: 'Custom templated displays (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: [],
      },
      {
        type: 'custom:mushroom-select-card',
        name: 'Mushroom Select',
        category: 'custom',
        icon: 'SelectOutlined',
        description: 'Input select controls (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-number-card',
        name: 'Mushroom Number',
        category: 'custom',
        icon: 'NumberOutlined',
        description: 'Number input controls (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-person-card',
        name: 'Mushroom Person',
        category: 'custom',
        icon: 'UserOutlined',
        description: 'Person/presence display (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-media-player-card',
        name: 'Mushroom Media Player',
        category: 'custom',
        icon: 'PlayCircleOutlined',
        description: 'Media player control (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-lock-card',
        name: 'Mushroom Lock',
        category: 'custom',
        icon: 'LockOutlined',
        description: 'Lock controls (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-alarm-control-panel-card',
        name: 'Mushroom Alarm',
        category: 'custom',
        icon: 'SafetyOutlined',
        description: 'Alarm panel controls (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'custom:mushroom-vacuum-card',
        name: 'Mushroom Vacuum',
        category: 'custom',
        icon: 'BorderOutlined',
        description: 'Vacuum controls (HACS)',
        isCustom: true,
        source: 'hacs',
        defaultProps: {},
        requiredProps: ['entity'],
      },
    ];

    standardCards.forEach(card => this.register(card));
  }

  /**
   * Register a new card type
   */
  register(metadata: CardTypeMetadata): void {
    const isCustom =
      metadata.isCustom === true ||
      metadata.source === 'custom' ||
      metadata.category === 'custom';

    this.cards.set(metadata.type, { ...metadata, isCustom });
  }

  /**
   * Get metadata for a specific card type
   */
  get(type: string): CardTypeMetadata | undefined {
    return this.cards.get(type);
  }

  /**
   * Get all registered card types
   */
  getAll(): CardTypeMetadata[] {
    return Array.from(this.cards.values());
  }

  /**
   * Get cards by category
   */
  getByCategory(category: CardCategory): CardTypeMetadata[] {
    return this.getAll().filter(card => card.category === category);
  }

  /**
   * Get cards by source
   */
  getBySource(source: CardSource): CardTypeMetadata[] {
    return this.getAll().filter(card => card.source === source);
  }

  /**
   * Get all custom cards (HACS + custom)
   */
  getCustomCards(): CardTypeMetadata[] {
    return this.getAll().filter(card => card.isCustom);
  }

  /**
   * Load cards from Home Assistant instance (Phase 13)
   * This will be implemented when HA connection is added
   */
  async loadFromHomeAssistant(haUrl: string, token: string): Promise<void> {
    void token;
    // TODO: Phase 13 - Fetch available cards from HA API
    // This will discover HACS cards and custom cards
    logger.debug('Loading cards from Home Assistant', { haUrl });
    throw new Error('Home Assistant connection not yet implemented (Phase 13)');
  }

  /**
   * Clear all registered cards
   */
  clear(): void {
    this.cards.clear();
  }

  /**
   * Reset to standard cards only
   */
  reset(): void {
    this.clear();
    this.registerStandardCards();
  }
}

// Export singleton instance
export const cardRegistry = new CardRegistry();
