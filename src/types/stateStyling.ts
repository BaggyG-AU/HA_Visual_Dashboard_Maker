export type IconColorMode = 'default' | 'custom' | 'state' | 'attribute';

export type StateStyleMap<TValue> = Record<string, TValue>;

export interface StateStyleResolutionInput<TValue> {
  state?: string;
  styles?: StateStyleMap<TValue>;
}
