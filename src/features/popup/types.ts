import type { Card } from '../../types/dashboard';

export type PopupSize = 'auto' | 'small' | 'medium' | 'large' | 'fullscreen' | 'custom';

export interface PopupSizeCustom {
  width?: number;
  height?: number;
}

export interface PopupFooterAction {
  label: string;
  action?: 'close' | 'none';
  button_type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
}

export interface PopupConfig {
  title?: string;
  size?: PopupSize;
  custom_size?: PopupSizeCustom;
  close_on_backdrop?: boolean;
  backdrop_opacity?: number;
  show_header?: boolean;
  show_footer?: boolean;
  close_label?: string;
  footer_actions?: PopupFooterAction[];
  cards?: Card[];
}

export interface PopupCardConfig {
  type: 'custom:popup-card';
  title?: string;
  trigger_label?: string;
  trigger_icon?: string;
  popup?: PopupConfig;
}

export interface NormalizedPopupConfig {
  title: string;
  size: PopupSize;
  custom_size?: PopupSizeCustom;
  close_on_backdrop: boolean;
  backdrop_opacity: number;
  show_header: boolean;
  show_footer: boolean;
  close_label: string;
  footer_actions: PopupFooterAction[];
  cards: Card[];
}

export interface PopupStackItem {
  id: string;
  config: NormalizedPopupConfig;
  restoreFocusEl?: HTMLElement | null;
}
