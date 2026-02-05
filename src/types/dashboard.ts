/**
 * TypeScript type definitions for Home Assistant Dashboard (Lovelace) structure
 */

import type { HapticCardConfig } from './haptics';
import type { SoundCardConfig } from './sounds';
import type { AttributeDisplayItem, AttributeDisplayLayout } from './attributeDisplay';
import type { StateIconsMap } from './stateIcons';

// Layout-card view_layout configuration
export interface ViewLayout {
  grid_column?: string;    // e.g., "1 / 7" or "span 6"
  grid_row?: string;       // e.g., "1 / 5" or "span 4"
  grid_area?: string;      // Named grid area
  place_self?: string;     // CSS place-self property
  [key: string]: any;      // Allow any grid-* properties
}

// Base card configuration
export interface BaseCard {
  type: string;
  entity?: string;
  entities?: any[]; // Can be string[] or (string | EntityConfig)[]
  name?: string;
  icon?: string;
  style?: string;
  smart_defaults?: boolean;
  visibility_conditions?: VisibilityCondition[];
  attribute_display?: AttributeDisplayItem[];
  attribute_display_layout?: AttributeDisplayLayout;
  haptic?: HapticCardConfig;
  sound?: SoundCardConfig;
  icon_color?: string;
  icon_color_mode?: 'default' | 'custom' | 'state' | 'attribute';
  icon_color_states?: Record<string, string>;
  icon_color_attribute?: string;
  state_icons?: StateIconsMap;
  show_name?: boolean;
  show_icon?: boolean;
  show_state?: boolean;
  tap_action?: Action;
  hold_action?: Action;
  double_tap_action?: Action;
  view_layout?: ViewLayout; // Layout-card positioning
}

// Spacer card for layout purposes (internal use only, not exported to YAML)
export interface SpacerCard extends BaseCard {
  type: 'spacer';
  _isSpacer?: boolean;
}

// Action types
export interface Action {
  action: 'more-info' | 'toggle' | 'call-service' | 'navigate' | 'url' | 'none';
  service?: string;
  service_data?: Record<string, any>;
  navigation_path?: string;
  url_path?: string;
  confirmation?: {
    text?: string;
    exemptions?: any[];
  };
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

export type VisibilityConditionType =
  | 'state_equals'
  | 'state_not_equals'
  | 'state_in'
  | 'state_not_in'
  | 'attribute_equals'
  | 'attribute_greater_than'
  | 'attribute_less_than'
  | 'entity_exists';

export interface VisibilityConditionRule {
  condition: VisibilityConditionType;
  entity: string;
  attribute?: string;
  value?: string | number | boolean;
  values?: Array<string | number | boolean>;
}

export interface VisibilityConditionGroup {
  condition: 'and' | 'or';
  conditions: VisibilityCondition[];
}

export type VisibilityCondition = VisibilityConditionRule | VisibilityConditionGroup;

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
  show_forecast?: boolean;
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
}

export interface VerticalStackCard extends BaseCard {
  type: 'vertical-stack';
  cards: Card[];
  title?: string;
}

export interface GridCard extends BaseCard {
  type: 'grid';
  cards: Card[];
  title?: string;
  columns?: number;
  square?: boolean;
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
  visible?: boolean | Condition[];
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
