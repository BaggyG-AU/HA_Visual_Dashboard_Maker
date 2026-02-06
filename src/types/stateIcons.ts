export interface StateIconConfig {
  icon: string;
  color?: string;
  size?: number;
}

export type StateIconsMap = Record<string, StateIconConfig | string>;

export interface ResolvedStateIconConfig {
  icon: string;
  color?: string;
  size?: number;
  source: 'user' | 'domain' | 'generic';
}
