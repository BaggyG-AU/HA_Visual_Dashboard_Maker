/**
 * TypeScript type definitions for Home Assistant Dashboard (Lovelace) structure
 */

import type { HapticCardConfig } from './haptics';
import type { SoundCardConfig } from './sounds';
import type { AttributeDisplayItem, AttributeDisplayLayout } from './attributeDisplay';
import type { StateIconsMap } from './stateIcons';
import type { AggregateFunction, BatchActionConfig, MultiEntityMode } from './multiEntity';
import type { CardSpacingValue } from './spacing';
import type { Action } from './actions';
import type { Phase6CardContracts } from './phase6';
import type { VisibilityCondition } from './logic';
import type { IconColorMode, StateStyleMap } from './stateStyling';

export type { Action } from './actions';
export type {
  VisibilityCondition,
  VisibilityConditionGroup,
  VisibilityConditionRule,
  VisibilityConditionType,
} from './logic';

// Layout-card view_layout configuration
export interface ViewLayout {
  grid_column?: string; // e.g., "1 / 7" or "span 6"
  grid_row?: string; // e.g., "1 / 5" or "span 4"
  grid_area?: string; // Named grid area
  place_self?: string; // CSS place-self property
  [key: string]: any; // Allow any grid-* properties
}

// Base card configuration
export interface BaseCard extends Phase6CardContracts {
  type: string;
  title?: string;
  entity?: string;
  entities?: any[]; // Can be string[] or (string | EntityConfig)[]
  name?: string;
  icon?: string;
  style?: string;
  attribute_display?: AttributeDisplayItem[];
  attribute_display_layout?: AttributeDisplayLayout;
  haptic?: HapticCardConfig;
  sound?: SoundCardConfig;
  icon_color?: string;
  icon_color_mode?: IconColorMode;
  icon_color_states?: StateStyleMap<string>;
  icon_color_attribute?: string;
  state_icons?: StateIconsMap;
  multi_entity_mode?: MultiEntityMode;
  aggregate_function?: AggregateFunction;
  batch_actions?: Array<BatchActionConfig | string>;
  show_name?: boolean;
  show_icon?: boolean;
  show_state?: boolean;
  view_layout?: ViewLayout; // Layout-card positioning
  card_margin?: CardSpacingValue;
  card_padding?: CardSpacingValue;
  // react-grid-layout canvas position/size (assigned by the generator/store).
  // All optional — some call sites supply only a subset (e.g. sizing constraints).
  // Named `_havdm_layout` (not `layout`) so it does not collide with Mushroom's
  // real `layout: 'horizontal' | 'vertical'` option; classified `strip` in the
  // export contract (haExportContract.ts) so it never reaches Home Assistant.
  _havdm_layout?: {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

// Spacer card for layout purposes (internal use only, not exported to YAML)
export interface SpacerCard extends BaseCard {
  type: 'spacer';
  _isSpacer?: boolean;
}

// Standard card types
export interface EntitiesCard extends BaseCard {
  type: 'entities';
  entities: (string | EntityConfig)[];
  title?: string;
  show_header_toggle?: boolean;
  state_color?: boolean;
  theme?: string;
}

export interface EntityConfig {
  entity: string;
  name?: string;
  icon?: string;
  secondary_info?: string;
  format?: string;
  type?: string;
  visibility_conditions?: VisibilityCondition[];
}

export interface ButtonCard extends BaseCard {
  type: 'button';
  entity?: string;
  name?: string;
  icon?: string;
  show_name?: boolean;
  show_icon?: boolean;
  show_state?: boolean;
  icon_height?: string;
  theme?: string;
}

export interface GlanceCard extends BaseCard {
  type: 'glance';
  entities: (string | EntityConfig)[];
  title?: string;
  show_name?: boolean;
  show_icon?: boolean;
  show_state?: boolean;
  state_color?: boolean;
  theme?: string;
  columns?: number;
}

export interface MarkdownCard extends BaseCard {
  type: 'markdown';
  content: string;
  title?: string;
  theme?: string;
}

export interface PictureCard extends BaseCard {
  type: 'picture';
  image: string;
  tap_action?: Action;
  hold_action?: Action;
  theme?: string;
}

export interface GaugeCard extends BaseCard {
  type: 'gauge';
  entity: string;
  name?: string;
  min?: number;
  max?: number;
  severity?: {
    green?: number;
    yellow?: number;
    red?: number;
  };
  unit?: string;
  needle?: boolean;
  theme?: string;
}

export interface LightCard extends BaseCard {
  type: 'light';
  entity: string;
  name?: string;
  theme?: string;
}

export interface SensorCard extends BaseCard {
  type: 'sensor';
  entity: string;
  name?: string;
  graph?: 'line' | 'none';
  detail?: number;
  hours_to_show?: number;
  theme?: string;
}

/**
 * HA core `tile` card (2023.7+). The most-used modern Home Assistant card and
 * the one HA's own editor reaches for first.
 *
 * ⚠ Built from the CARD'S DOCUMENTED SCHEMA, not from the reference instance —
 * per the card-breadth ruling, an instance is a *sample* of which cards exist,
 * never a *spec* of which options they accept. The reference instance only ever
 * uses `color`, `entity`, `features`, `icon`, `name` and `show_entity_picture`;
 * every other field below is real and would have been missed by copying it.
 */
export interface TileCard extends BaseCard {
  type: 'tile';
  entity?: string;
  name?: string;
  icon?: string;
  /** HA theme colour token (`red`, `green`, …) or `state` to colour by state. */
  color?: string;
  show_entity_picture?: boolean;
  /** Stacks icon above the text instead of beside it. */
  vertical?: boolean;
  hide_state?: boolean;
  /** Which attribute(s) render as the state line. String or ordered list. */
  state_content?: string | string[];
  features?: TileFeatureConfig[];
  /** 2024.11+: where the feature row sits relative to the tile content. */
  features_position?: 'bottom' | 'inline';
  tap_action?: Action;
  hold_action?: Action;
  double_tap_action?: Action;
  icon_tap_action?: Action;
  icon_hold_action?: Action;
  icon_double_tap_action?: Action;
  theme?: string;
}

/**
 * One entry in a tile card's `features[]` row. Every HA feature is `{type, …}`
 * with per-feature extras, so the index signature is the honest expression of
 * "we model the shape, and preserve options we do not interpret".
 */
export interface TileFeatureConfig {
  type: string;
  [key: string]: unknown;
}

/**
 * HA core `heading` card (2024.8+). Every `sections` view HA generates contains
 * these, which is why a tool that cannot draw one cannot draw a modern dashboard.
 */
export interface HeadingCard extends BaseCard {
  type: 'heading';
  heading?: string;
  heading_style?: 'title' | 'subtitle';
  icon?: string;
  badges?: HeadingBadgeConfig[];
  tap_action?: Action;
}

export interface HeadingBadgeConfig {
  type?: string;
  entity?: string;
  content?: string;
  icon?: string;
  state_content?: string | string[];
  tap_action?: Action;
  [key: string]: unknown;
}

/**
 * HA core `entity` card — a single entity's icon, name and state. One of the
 * oldest cards Home Assistant ships, and absent from HAVDM until now.
 */
export interface EntityCard extends BaseCard {
  type: 'entity';
  entity: string;
  name?: string;
  icon?: string;
  /** Render an attribute instead of the state. */
  attribute?: string;
  unit?: string;
  /** Colour the icon by state (HA defaults this on for toggleable domains). */
  state_color?: boolean;
  footer?: Record<string, unknown>;
  color?: string;
  tap_action?: Action;
  hold_action?: Action;
  double_tap_action?: Action;
  theme?: string;
}

/**
 * HA core `statistics-graph` card — long-run recorder statistics.
 *
 * ⚠ HAVDM has no statistics API for the same reason it has no history API, so
 * this renders the honest indicative plot `history-graph` has always rendered
 * rather than inventing a second, different answer beside it on the same canvas.
 */
export interface StatisticsGraphCard extends BaseCard {
  type: 'statistics-graph';
  entities: (string | EntityConfig)[];
  title?: string;
  days_to_show?: number;
  period?: '5minute' | 'hour' | 'day' | 'week' | 'month';
  stat_types?: StatisticType | StatisticType[];
  chart_type?: 'line' | 'bar';
  hide_legend?: boolean;
  logarithmic_scale?: boolean;
  min_y_axis?: number;
  max_y_axis?: number;
  fit_y_data?: boolean;
  unit?: string;
  energy_date_selection?: boolean;
  theme?: string;
}

export type StatisticType = 'min' | 'max' | 'mean' | 'sum' | 'state' | 'change';

export interface HistoryGraphCard extends BaseCard {
  type: 'history-graph';
  entities: (string | EntityConfig)[];
  title?: string;
  hours_to_show?: number;
  refresh_interval?: number;
  theme?: string;
}

export interface WeatherForecastCard extends BaseCard {
  type: 'weather-forecast';
  entity: string;
  name?: string;
  forecast_type?: 'daily' | 'hourly';
  mode?: 'daily' | 'hourly';
  metrics?: Array<'temperature' | 'precipitation' | 'wind_speed'>;
  icon_animation?: 'off' | 'subtle' | 'pulse';
  days?: number;
  locale?: string;
  unit_system?: 'auto' | 'metric' | 'imperial';
  show_current?: boolean;
  show_forecast?: boolean;
  round_temperature?: boolean;
  theme?: string;
}

export interface MapCard extends BaseCard {
  type: 'map';
  entities?: (string | EntityConfig)[];
  title?: string;
  aspect_ratio?: string;
  default_zoom?: number;
  dark_mode?: boolean;
  theme?: string;
}

export interface ThermostatCard extends BaseCard {
  type: 'thermostat';
  entity: string;
  name?: string;
  theme?: string;
  features?: Array<{
    type: string;
    [key: string]: any;
  }>;
}

export interface HorizontalStackCard extends BaseCard {
  type: 'horizontal-stack';
  cards: Card[];
  title?: string;
  gap?: number;
  align_items?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify_content?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export interface VerticalStackCard extends BaseCard {
  type: 'vertical-stack';
  cards: Card[];
  title?: string;
  gap?: number;
  align_items?: 'start' | 'center' | 'end' | 'stretch';
}

export interface GridCard extends BaseCard {
  type: 'grid';
  cards: Card[];
  title?: string;
  columns?: number;
  square?: boolean;
  row_gap?: number;
  column_gap?: number;
  align_items?: 'start' | 'center' | 'end' | 'stretch';
  justify_items?: 'start' | 'center' | 'end' | 'stretch';
}

export interface ConditionalCard extends BaseCard {
  type: 'conditional';
  conditions: Condition[];
  card: Card;
}

export interface Condition {
  entity: string;
  state?: string;
  state_not?: string;
}

export interface PictureEntityCard extends BaseCard {
  type: 'picture-entity';
  entity: string;
  image?: string;
  camera_image?: string;
  camera_view?: 'auto' | 'live';
  name?: string;
  show_name?: boolean;
  show_state?: boolean;
  tap_action?: Action;
  hold_action?: Action;
  theme?: string;
}

export interface PictureGlanceCard extends BaseCard {
  type: 'picture-glance';
  entities: (string | EntityConfig)[];
  image?: string;
  camera_image?: string;
  camera_view?: 'auto' | 'live';
  title?: string;
  show_state?: boolean;
  state_image?: Record<string, string>;
  theme?: string;
}

export interface MediaPlayerCard extends BaseCard {
  type: 'media-control';
  entity: string;
  name?: string;
  theme?: string;
}

export interface AlarmPanelCard extends BaseCard {
  type: 'alarm-panel';
  entity: string;
  name?: string;
  states?: string[];
  theme?: string;
}

export interface PlantStatusCard extends BaseCard {
  type: 'plant-status';
  entity: string;
  name?: string;
  theme?: string;
}

// Custom card types (to be extended)
export interface CustomCard extends BaseCard {
  type: string; // Any custom card type
  [key: string]: any; // Allow any additional properties
}

// Union type for all card types
export type Card =
  | EntitiesCard
  | ButtonCard
  | GlanceCard
  | MarkdownCard
  | PictureCard
  | PictureEntityCard
  | PictureGlanceCard
  | GaugeCard
  | LightCard
  | SensorCard
  | TileCard
  | HeadingCard
  | EntityCard
  | StatisticsGraphCard
  | HistoryGraphCard
  | WeatherForecastCard
  | MapCard
  | ThermostatCard
  | MediaPlayerCard
  | AlarmPanelCard
  | PlantStatusCard
  | HorizontalStackCard
  | VerticalStackCard
  | GridCard
  | ConditionalCard
  | CustomCard;

// Layout-card layout configuration
export interface LayoutCardConfig {
  layout_type?: 'grid' | 'masonry' | 'horizontal' | 'vertical';
  layout?: {
    grid_template_columns?: string;
    grid_template_rows?: string;
    grid_template_areas?: string;
    grid_gap?: string;
    grid_auto_rows?: string;
    mediaquery?: Record<string, any>;
    [key: string]: any; // Allow any CSS grid properties
  };
}

/**
 * A Home Assistant view/dashboard strategy (slice 4.7b). The cards are generated
 * by HA at render time from `type` + the strategy's own options, so a strategy
 * view legitimately has NO `cards` of its own. HAVDM has no strategy editor — it
 * preserves the block verbatim, including options it does not understand.
 */
export interface ViewStrategy {
  type: string;
  [key: string]: unknown;
}

// A section within an HA "sections" view. Each section is normally a grid
// (`type: 'grid'`) of cards with an optional heading. HAVDM preserves these
// verbatim through the export boundary so a Sections view round-trips instead
// of deploying empty (its cards live here, not on the view's top-level `cards`).
export interface ViewSection {
  type?: string; // usually 'grid'
  title?: string;
  cards?: Card[];
  column_span?: number;
  row_span?: number;
  visibility?: Condition[];
  [key: string]: unknown;
}

// View configuration
export interface View {
  title?: string;
  path?: string;
  icon?: string;
  badges?: (string | BadgeConfig)[];
  cards?: Card[];
  panel?: boolean;
  theme?: string;
  background?: string;
  type?: string; // 'masonry', 'custom:layout-card', 'sections', etc.
  // HA "sections" view (type: 'sections'): cards live under sections[].cards.
  sections?: ViewSection[];
  max_columns?: number;
  dense_section_placement?: boolean;
  top_margin?: boolean;
  visible?: boolean | Condition[];
  // Subview navigation model (HA views docs): a subview is hidden from the top
  // navigation and shows a back button; `back_path` overrides where it returns.
  subview?: boolean;
  back_path?: string;
  // Layout-card specific properties
  layout_type?: 'grid' | 'masonry' | 'horizontal' | 'vertical';
  layout?: {
    grid_template_columns?: string;
    grid_template_rows?: string;
    grid_template_areas?: string;
    grid_gap?: string;
    grid_auto_rows?: string;
    mediaquery?: Record<string, any>;
    [key: string]: any;
  };
  /**
   * A Home Assistant view strategy (slice 4.7b). HA generates this view's cards
   * at render time, so a strategy view has no `cards` of its own and HAVDM shows
   * it as a read-only, generated view rather than an empty one.
   */
  strategy?: ViewStrategy;
  // HAVDM-internal (slice 4.7a). Marks a view as HAVDM's own flat-canvas
  // scaffold — `type: 'custom:grid-layout'` + the 12-col/56px `layout` — rather
  // than a layout-card view the user authored or imported. Those two are
  // otherwise indistinguishable, and the export boundary must strip the former
  // while preserving the latter. Dropped on export by the view allowlist; see
  // `isHavdmScaffoldView` (`services/haExportContract.ts`).
  _havdm_scaffold?: boolean;
}

export interface BadgeConfig {
  entity: string;
  name?: string;
  icon?: string;
  state_color?: boolean;
}

// Dashboard configuration (root)
export interface DashboardConfig {
  title?: string;
  views: View[];
  background?: string;
  theme?: string;
  /**
   * A dashboard-level Home Assistant strategy (slice 4.7b). HA generates the
   * whole dashboard from this at render time. HAVDM does not author strategies;
   * it must simply carry one through untouched, or deploying replaces the
   * user's generated dashboard with nothing.
   */
  strategy?: ViewStrategy;
}

// Dashboard state for the application
export interface DashboardState {
  config: DashboardConfig | null;
  filePath: string | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean; // Has unsaved changes
  selectedViewIndex: number | null;
  selectedCardIndex: number | null;
  /**
   * When true, the store is applying a batch of rapid edits (e.g. typing)
   * without pushing each intermediate step into undo/redo history.
   */
  isBatching: boolean;
}

// YAML parsing result
export interface YAMLParseResult {
  success: boolean;
  data?: DashboardConfig;
  error?: string;
  lineNumber?: number;
}
