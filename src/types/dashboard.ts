/**
 * TypeScript type definitions for Home Assistant Dashboard (Lovelace) structure
 */

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
  entities?: string[];
  name?: string;
  icon?: string;
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
}

// YAML parsing result
export interface YAMLParseResult {
  success: boolean;
  data?: DashboardConfig;
  error?: string;
  lineNumber?: number;
}
