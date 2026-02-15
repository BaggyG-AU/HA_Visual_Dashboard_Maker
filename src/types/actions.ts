import type { Card } from './dashboard';

export type DashboardActionType =
  | 'more-info'
  | 'toggle'
  | 'call-service'
  | 'navigate'
  | 'url'
  | 'none'
  | 'popup';

export type PopupSize = 'auto' | 'small' | 'medium' | 'large' | 'fullscreen' | 'custom';

export interface PopupCustomSize {
  width?: number;
  height?: number;
}

export interface PopupFooterAction {
  label: string;
  action?: 'close' | 'none';
  button_type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
}

export interface DashboardAction {
  action: DashboardActionType;
  service?: string;
  service_data?: Record<string, any>;
  navigation_path?: string;
  url_path?: string;
  popup_title?: string;
  popup_size?: PopupSize;
  popup_custom_size?: PopupCustomSize;
  popup_close_on_backdrop?: boolean;
  popup_backdrop_opacity?: number;
  popup_show_header?: boolean;
  popup_show_footer?: boolean;
  popup_close_label?: string;
  popup_footer_actions?: PopupFooterAction[];
  popup_cards?: Card[];
  confirmation?: {
    text?: string;
    exemptions?: any[];
  };
}

export type Action = DashboardAction;

export type ActionTrigger = 'tap' | 'hold' | 'double_tap';

export type CardActionField = 'tap_action' | 'hold_action' | 'double_tap_action';

export type ActionResolutionSource = 'user' | 'smart' | 'legacy' | 'none';

export interface ResolvedAction {
  action?: Action;
  source: ActionResolutionSource;
}
