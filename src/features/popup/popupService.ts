import type { Action, Card } from '../../types/dashboard';
import type {
  NormalizedPopupConfig,
  PopupCardConfig,
  PopupConfig,
  PopupFooterAction,
  PopupSize,
  PopupStackItem,
} from './types';

export const DEFAULT_POPUP_TRIGGER_ICON = 'mdi:open-in-new';
export const MAX_POPUP_DEPTH = 3;

const DEFAULT_POPUP_TITLE = 'Popup';

const DEFAULT_CONFIG: Omit<NormalizedPopupConfig, 'cards'> = {
  title: DEFAULT_POPUP_TITLE,
  size: 'medium',
  close_on_backdrop: true,
  backdrop_opacity: 0.45,
  show_header: true,
  show_footer: false,
  close_label: 'Close',
  footer_actions: [],
};

const isPopupSize = (value: unknown): value is PopupSize =>
  value === 'auto'
  || value === 'small'
  || value === 'medium'
  || value === 'large'
  || value === 'fullscreen'
  || value === 'custom';

const toFiniteNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const normalizeBackdropOpacity = (value: unknown): number => {
  const n = toFiniteNumber(value);
  if (typeof n !== 'number') return DEFAULT_CONFIG.backdrop_opacity;
  return Math.max(0, Math.min(1, n));
};

const normalizeCustomSize = (input: unknown): { width?: number; height?: number } | undefined => {
  if (!input || typeof input !== 'object') return undefined;
  const typed = input as { width?: unknown; height?: unknown };
  const width = toFiniteNumber(typed.width);
  const height = toFiniteNumber(typed.height);

  const next: { width?: number; height?: number } = {};
  if (typeof width === 'number' && width > 0) next.width = Math.floor(width);
  if (typeof height === 'number' && height > 0) next.height = Math.floor(height);
  return Object.keys(next).length > 0 ? next : undefined;
};

const normalizeFooterActions = (input: unknown): PopupFooterAction[] => {
  const allowedButtonTypes = new Set(['default', 'primary', 'dashed', 'link', 'text']);
  if (!Array.isArray(input)) return [];
  return input.flatMap((action) => {
    if (!action || typeof action !== 'object') return [];
    const typed = action as { label?: unknown; action?: unknown; button_type?: unknown };
    if (typeof typed.label !== 'string' || typed.label.trim().length === 0) return [];
    return [{
      label: typed.label.trim(),
      action: typed.action === 'close' ? 'close' : 'none',
      button_type: typeof typed.button_type === 'string' && allowedButtonTypes.has(typed.button_type)
        ? typed.button_type as PopupFooterAction['button_type']
        : 'default',
    }];
  });
};

export const normalizePopupConfig = (input: PopupConfig | undefined, titleFallback?: string): NormalizedPopupConfig => {
  const title = typeof input?.title === 'string' && input.title.trim().length > 0
    ? input.title
    : (typeof titleFallback === 'string' && titleFallback.trim().length > 0 ? titleFallback : DEFAULT_CONFIG.title);

  const size = isPopupSize(input?.size) ? input.size : DEFAULT_CONFIG.size;
  const customSize = size === 'custom' ? normalizeCustomSize(input?.custom_size) : undefined;

  return {
    title,
    size,
    custom_size: customSize,
    close_on_backdrop: typeof input?.close_on_backdrop === 'boolean'
      ? input.close_on_backdrop
      : DEFAULT_CONFIG.close_on_backdrop,
    backdrop_opacity: normalizeBackdropOpacity(input?.backdrop_opacity),
    show_header: typeof input?.show_header === 'boolean' ? input.show_header : DEFAULT_CONFIG.show_header,
    show_footer: typeof input?.show_footer === 'boolean' ? input.show_footer : DEFAULT_CONFIG.show_footer,
    close_label: typeof input?.close_label === 'string' && input.close_label.trim().length > 0
      ? input.close_label
      : DEFAULT_CONFIG.close_label,
    footer_actions: normalizeFooterActions(input?.footer_actions),
    cards: Array.isArray(input?.cards) ? input.cards : [],
  };
};

export const resolvePopupFromCard = (card: Card): NormalizedPopupConfig | null => {
  if (card.type !== 'custom:popup-card') return null;
  const typed = card as PopupCardConfig;
  return normalizePopupConfig(typed.popup, typed.title ?? typed.trigger_label);
};

export const resolvePopupFromAction = (action: Action | undefined): NormalizedPopupConfig | null => {
  if (!action || action.action !== 'popup') return null;

  return normalizePopupConfig(
    {
      title: action.popup_title,
      size: action.popup_size,
      custom_size: action.popup_custom_size,
      close_on_backdrop: action.popup_close_on_backdrop,
      backdrop_opacity: action.popup_backdrop_opacity,
      show_header: action.popup_show_header,
      show_footer: action.popup_show_footer,
      close_label: action.popup_close_label,
      footer_actions: action.popup_footer_actions,
      cards: action.popup_cards,
    },
    action.popup_title,
  );
};

export const getPopupModalDimensions = (
  config: NormalizedPopupConfig,
): { width?: number; bodyMaxHeight?: string } => {
  switch (config.size) {
    case 'small':
      return { width: 480, bodyMaxHeight: '60vh' };
    case 'medium':
      return { width: 720, bodyMaxHeight: '70vh' };
    case 'large':
      return { width: 980, bodyMaxHeight: '76vh' };
    case 'fullscreen':
      return { width: undefined, bodyMaxHeight: 'calc(100vh - 120px)' };
    case 'custom':
      return {
        width: config.custom_size?.width,
        bodyMaxHeight: config.custom_size?.height
          ? `${Math.max(160, Math.floor(config.custom_size.height - 120))}px`
          : '70vh',
      };
    case 'auto':
    default:
      return { width: undefined, bodyMaxHeight: '70vh' };
  }
};

type PopupListener = (stack: PopupStackItem[]) => void;

class PopupStackService {
  private stack: PopupStackItem[] = [];

  private listeners = new Set<PopupListener>();

  private counter = 0;

  subscribe(listener: PopupListener): () => void {
    this.listeners.add(listener);
    listener(this.stack);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.stack));
  }

  private restoreFocus(item?: PopupStackItem) {
    const target = item?.restoreFocusEl;
    if (!target || typeof target.focus !== 'function') return;
    if (typeof document !== 'undefined' && !document.contains(target)) return;
    if (typeof window === 'undefined') return;
    window.setTimeout(() => {
      try {
        target.focus();
      } catch {
        // Best effort: focus target may be detached by the time modal closes.
      }
    }, 0);
  }

  getStack(): PopupStackItem[] {
    return this.stack;
  }

  open(config: NormalizedPopupConfig): string | null {
    if (this.stack.length >= MAX_POPUP_DEPTH) return null;
    this.counter += 1;
    const id = `popup-${this.counter}`;
    const activeElement = typeof document !== 'undefined' ? document.activeElement : null;
    const restoreFocusEl = activeElement instanceof HTMLElement ? activeElement : null;
    this.stack = [...this.stack, { id, config, restoreFocusEl }];
    this.emit();
    return id;
  }

  close(id: string): void {
    const closedItem = this.stack.find((entry) => entry.id === id);
    this.stack = this.stack.filter((entry) => entry.id !== id);
    this.emit();
    this.restoreFocus(closedItem);
  }

  closeTop(): void {
    if (this.stack.length === 0) return;
    const closedItem = this.stack[this.stack.length - 1];
    this.stack = this.stack.slice(0, this.stack.length - 1);
    this.emit();
    this.restoreFocus(closedItem);
  }

  clear(): void {
    if (this.stack.length === 0) return;
    this.stack = [];
    this.emit();
  }
}

export const popupStackService = new PopupStackService();
