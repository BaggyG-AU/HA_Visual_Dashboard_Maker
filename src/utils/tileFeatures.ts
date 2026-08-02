/**
 * Tile card `features[]` resolution.
 *
 * Home Assistant's `tile` card takes a row of "features" beneath the tile
 * content — the controls that make a tile actionable rather than merely
 * informative. HA ships ~30 of them.
 *
 * ⭐ WHY THIS IS A PURE MODULE AND NOT LOGIC INSIDE THE RENDERER: the same
 * reason `bulkEditDisclosure.ts` and `entityDisclosure.ts` are. A table this
 * size buried in a component cannot be unit-tested, and every consumer that
 * needs one of its answers ends up COPYING it — and a copied table diverges.
 *
 * ⭐⭐ THE DESIGN THAT KEEPS 30 FEATURES HONEST WITHOUT 30 BESPOKE COMPONENTS:
 * every HA tile feature is one of exactly FOUR control archetypes —
 *
 *   `toggle`   an on/off switch
 *   `slider`   a bounded numeric value
 *   `options`  a set of mutually-exclusive modes, one active
 *   `commands` a row of discrete actions with no "current" value
 *
 * so each feature declares its archetype plus where to find its bounds or its
 * option list, and the renderer draws four controls rather than thirty. Adding
 * a new HA feature is a table row, not a component.
 *
 * ⚠ THE OPTION LISTS COME FROM THE ENTITY'S OWN ATTRIBUTES WHEREVER HA SOURCES
 * THEM THERE (`hvac_modes`, `preset_modes`, `options`, `operation_list` …), with
 * the card's explicit config winning when present — because that is precisely
 * what Home Assistant itself does. Hard-coding the lists would make a climate
 * card claim modes its thermostat does not have.
 *
 * ⚠ NOTHING HERE EXECUTES THIRD-PARTY CODE OR CALLS A SERVICE. HAVDM is a
 * design tool: these controls render the configured state so a user can SEE the
 * tile they are building. See the standing security ruling — "supporting" a card
 * always means rendering HAVDM's own approximation from the card's config.
 */
import type { TileFeatureConfig } from '../types/dashboard';

export type TileFeatureControl = 'toggle' | 'slider' | 'options' | 'commands';

export interface TileFeatureOption {
  value: string;
  label: string;
  icon?: string;
}

export interface ResolvedTileFeature {
  /** The `type:` exactly as written in the card config. */
  type: string;
  /** Human-readable name for the control, used as its label. */
  label: string;
  control: TileFeatureControl;
  /**
   * `false` when HAVDM does not model this feature type. The renderer still
   * draws it — named, and marked — rather than dropping it silently.
   */
  supported: boolean;
  /** `toggle` only. */
  on?: boolean;
  /** `slider` only. */
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** `options` and `commands`. */
  options?: TileFeatureOption[];
  /** `options` only — which entry is currently active. */
  active?: string;
}

type AttributeBag = Record<string, unknown>;

interface FeatureSpec {
  label: string;
  control: TileFeatureControl;
  /** Card-config keys that may carry an explicit option list, in priority order. */
  configKeys?: string[];
  /** Entity attributes that may carry the option list, in priority order. */
  attributeKeys?: string[];
  /** Fixed commands for `commands` features that HA does not make configurable. */
  commands?: TileFeatureOption[];
  /** Entity attribute holding the live value for a `slider`. */
  valueAttribute?: string;
  /** `true` when the slider's value is the entity STATE rather than an attribute. */
  valueFromState?: boolean;
  /** Attributes carrying the slider bounds, plus static fallbacks. */
  minAttribute?: string;
  maxAttribute?: string;
  stepAttribute?: string;
  unitAttribute?: string;
  defaultMin?: number;
  defaultMax?: number;
  defaultStep?: number;
  defaultUnit?: string;
  /** Attribute naming the active option when it is not the entity state. */
  activeAttribute?: string;
}

/**
 * Every tile feature Home Assistant ships, as of HA 2026.x.
 *
 * ⚠ ORDERED ALPHABETICALLY SO A MISSING ENTRY IS VISIBLE AT A GLANCE. When HA
 * adds a feature, add a row — do not add a branch to the renderer.
 */
const FEATURE_SPECS: Record<string, FeatureSpec> = {
  'alarm-modes': {
    label: 'Alarm modes',
    control: 'options',
    configKeys: ['alarm_modes'],
    attributeKeys: ['supported_features_modes'],
  },
  'climate-fan-modes': {
    label: 'Fan modes',
    control: 'options',
    configKeys: ['fan_modes'],
    attributeKeys: ['fan_modes'],
    activeAttribute: 'fan_mode',
  },
  'climate-hvac-modes': {
    label: 'HVAC modes',
    control: 'options',
    configKeys: ['hvac_modes'],
    attributeKeys: ['hvac_modes'],
  },
  'climate-preset-modes': {
    label: 'Preset modes',
    control: 'options',
    configKeys: ['preset_modes'],
    attributeKeys: ['preset_modes'],
    activeAttribute: 'preset_mode',
  },
  'climate-swing-modes': {
    label: 'Swing modes',
    control: 'options',
    configKeys: ['swing_modes'],
    attributeKeys: ['swing_modes'],
    activeAttribute: 'swing_mode',
  },
  'climate-swing-horizontal-modes': {
    label: 'Horizontal swing',
    control: 'options',
    configKeys: ['swing_horizontal_modes'],
    attributeKeys: ['swing_horizontal_modes'],
    activeAttribute: 'swing_horizontal_mode',
  },
  'counter-actions': {
    label: 'Counter',
    control: 'commands',
    configKeys: ['actions'],
    commands: [
      { value: 'increment', label: 'Increment', icon: 'mdi:plus' },
      { value: 'decrement', label: 'Decrement', icon: 'mdi:minus' },
      { value: 'reset', label: 'Reset', icon: 'mdi:restore' },
    ],
  },
  'cover-open-close': {
    label: 'Open / close',
    control: 'commands',
    commands: [
      { value: 'open', label: 'Open', icon: 'mdi:arrow-up' },
      { value: 'stop', label: 'Stop', icon: 'mdi:stop' },
      { value: 'close', label: 'Close', icon: 'mdi:arrow-down' },
    ],
  },
  'cover-position': {
    label: 'Position',
    control: 'slider',
    valueAttribute: 'current_position',
    defaultMin: 0,
    defaultMax: 100,
    defaultStep: 1,
    defaultUnit: '%',
  },
  'cover-tilt': {
    label: 'Tilt',
    control: 'commands',
    commands: [
      { value: 'open_tilt', label: 'Open tilt', icon: 'mdi:arrow-top-right' },
      { value: 'stop_tilt', label: 'Stop', icon: 'mdi:stop' },
      { value: 'close_tilt', label: 'Close tilt', icon: 'mdi:arrow-bottom-left' },
    ],
  },
  'cover-tilt-position': {
    label: 'Tilt position',
    control: 'slider',
    valueAttribute: 'current_tilt_position',
    defaultMin: 0,
    defaultMax: 100,
    defaultStep: 1,
    defaultUnit: '%',
  },
  'fan-preset-modes': {
    label: 'Fan presets',
    control: 'options',
    configKeys: ['preset_modes'],
    attributeKeys: ['preset_modes'],
    activeAttribute: 'preset_mode',
  },
  'fan-speed': {
    label: 'Speed',
    control: 'slider',
    valueAttribute: 'percentage',
    defaultMin: 0,
    defaultMax: 100,
    defaultStep: 1,
    defaultUnit: '%',
  },
  'humidifier-modes': {
    label: 'Humidifier modes',
    control: 'options',
    configKeys: ['modes'],
    attributeKeys: ['available_modes'],
    activeAttribute: 'mode',
  },
  'humidifier-toggle': {
    label: 'Humidifier',
    control: 'toggle',
  },
  'lawn-mower-commands': {
    label: 'Mower',
    control: 'commands',
    configKeys: ['commands'],
    commands: [
      { value: 'start_mowing', label: 'Start', icon: 'mdi:play' },
      { value: 'pause', label: 'Pause', icon: 'mdi:pause' },
      { value: 'dock', label: 'Dock', icon: 'mdi:home-import-outline' },
    ],
  },
  'light-brightness': {
    label: 'Brightness',
    control: 'slider',
    valueAttribute: 'brightness',
    defaultMin: 0,
    defaultMax: 255,
    defaultStep: 1,
  },
  'light-color-temp': {
    label: 'Colour temperature',
    control: 'slider',
    valueAttribute: 'color_temp_kelvin',
    minAttribute: 'min_color_temp_kelvin',
    maxAttribute: 'max_color_temp_kelvin',
    defaultMin: 2000,
    defaultMax: 6500,
    defaultStep: 50,
    defaultUnit: 'K',
  },
  'lock-commands': {
    label: 'Lock',
    control: 'commands',
    commands: [
      { value: 'lock', label: 'Lock', icon: 'mdi:lock' },
      { value: 'unlock', label: 'Unlock', icon: 'mdi:lock-open' },
    ],
  },
  'lock-open-door': {
    label: 'Open door',
    control: 'commands',
    commands: [{ value: 'open', label: 'Open door', icon: 'mdi:door-open' }],
  },
  'media-player-volume-slider': {
    label: 'Volume',
    control: 'slider',
    valueAttribute: 'volume_level',
    defaultMin: 0,
    defaultMax: 1,
    defaultStep: 0.01,
  },
  'numeric-input': {
    label: 'Value',
    control: 'slider',
    valueFromState: true,
    minAttribute: 'min',
    maxAttribute: 'max',
    stepAttribute: 'step',
    unitAttribute: 'unit_of_measurement',
    defaultMin: 0,
    defaultMax: 100,
    defaultStep: 1,
  },
  'select-options': {
    label: 'Options',
    control: 'options',
    attributeKeys: ['options'],
  },
  'target-humidity': {
    label: 'Target humidity',
    control: 'slider',
    valueAttribute: 'humidity',
    minAttribute: 'min_humidity',
    maxAttribute: 'max_humidity',
    defaultMin: 0,
    defaultMax: 100,
    defaultStep: 1,
    defaultUnit: '%',
  },
  'target-temperature': {
    label: 'Target temperature',
    control: 'slider',
    valueAttribute: 'temperature',
    minAttribute: 'min_temp',
    maxAttribute: 'max_temp',
    stepAttribute: 'target_temp_step',
    defaultMin: 7,
    defaultMax: 35,
    defaultStep: 0.5,
    defaultUnit: '°',
  },
  toggle: {
    label: 'Toggle',
    control: 'toggle',
  },
  'update-actions': {
    label: 'Update',
    control: 'commands',
    commands: [
      { value: 'install', label: 'Install', icon: 'mdi:download' },
      { value: 'skip', label: 'Skip', icon: 'mdi:debug-step-over' },
    ],
  },
  'vacuum-commands': {
    label: 'Vacuum',
    control: 'commands',
    configKeys: ['commands'],
    commands: [
      { value: 'start_pause', label: 'Start / pause', icon: 'mdi:play-pause' },
      { value: 'stop', label: 'Stop', icon: 'mdi:stop' },
      { value: 'return_home', label: 'Return home', icon: 'mdi:home-map-marker' },
      { value: 'clean_spot', label: 'Clean spot', icon: 'mdi:target-variant' },
      { value: 'locate', label: 'Locate', icon: 'mdi:map-marker' },
    ],
  },
  'valve-open-close': {
    label: 'Open / close',
    control: 'commands',
    commands: [
      { value: 'open', label: 'Open', icon: 'mdi:valve-open' },
      { value: 'stop', label: 'Stop', icon: 'mdi:stop' },
      { value: 'close', label: 'Close', icon: 'mdi:valve-closed' },
    ],
  },
  'water-heater-operation-modes': {
    label: 'Operation modes',
    control: 'options',
    configKeys: ['operation_modes'],
    attributeKeys: ['operation_list'],
  },
};

/** Every tile feature type HAVDM models. Exported so a test can pin the count. */
export const SUPPORTED_TILE_FEATURES: readonly string[] = Object.keys(FEATURE_SPECS).sort();

/** States Home Assistant treats as "on" for a toggle. */
const ON_STATES = new Set(['on', 'open', 'opening', 'unlocked', 'home', 'playing', 'cleaning']);

const titleCase = (raw: string): string => {
  const words = raw.replace(/[_-]+/g, ' ').trim();
  if (!words) return raw;
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const asStringList = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const list = value.filter((entry): entry is string => typeof entry === 'string');
  return list.length > 0 ? list : undefined;
};

/**
 * Resolve an option list, HA's own precedence: the card's explicit config wins,
 * then the entity's attributes.
 *
 * ⚠ Returning an EMPTY list rather than inventing one is deliberate. A climate
 * tile whose thermostat reports no `hvac_modes` must not display modes it does
 * not have — that would be HAVDM lying about the user's hardware.
 */
const resolveOptions = (
  spec: FeatureSpec,
  feature: TileFeatureConfig,
  attributes: AttributeBag,
): TileFeatureOption[] => {
  for (const key of spec.configKeys ?? []) {
    const fromConfig = asStringList(feature[key]);
    if (fromConfig) return fromConfig.map((value) => ({ value, label: titleCase(value) }));
  }
  for (const key of spec.attributeKeys ?? []) {
    const fromAttributes = asStringList(attributes[key]);
    if (fromAttributes) return fromAttributes.map((value) => ({ value, label: titleCase(value) }));
  }
  return [];
};

const resolveCommands = (spec: FeatureSpec, feature: TileFeatureConfig): TileFeatureOption[] => {
  const base = spec.commands ?? [];
  for (const key of spec.configKeys ?? []) {
    const chosen = asStringList(feature[key]);
    if (chosen) {
      // Keep the declared order and icons for commands the card asked for, and
      // still surface any the table does not know rather than dropping them.
      return chosen.map(
        (value) => base.find((cmd) => cmd.value === value) ?? { value, label: titleCase(value) },
      );
    }
  }
  return base;
};

/**
 * Turn one raw `features[]` entry into something the renderer can draw.
 *
 * ⭐ An unmodelled `type` returns `supported: false` rather than `null`. The
 * renderer names and marks it — which is the whole "translate where possible,
 * honestly mark what you cannot" promise applied one level down, inside a card.
 */
export const resolveTileFeature = (
  feature: TileFeatureConfig,
  entity?: { state?: string; attributes?: AttributeBag } | null,
): ResolvedTileFeature => {
  const type = typeof feature?.type === 'string' ? feature.type : '';
  const spec = FEATURE_SPECS[type];
  const attributes = entity?.attributes ?? {};
  const state = entity?.state ?? '';

  if (!spec) {
    return {
      type: type || 'unknown',
      label: type ? titleCase(type) : 'Unknown feature',
      control: 'commands',
      supported: false,
      options: [],
    };
  }

  if (spec.control === 'toggle') {
    return {
      type,
      label: spec.label,
      control: 'toggle',
      supported: true,
      on: ON_STATES.has(state),
    };
  }

  if (spec.control === 'slider') {
    const min =
      (spec.minAttribute ? asNumber(attributes[spec.minAttribute]) : undefined) ??
      spec.defaultMin ??
      0;
    const max =
      (spec.maxAttribute ? asNumber(attributes[spec.maxAttribute]) : undefined) ??
      spec.defaultMax ??
      100;
    const step =
      (spec.stepAttribute ? asNumber(attributes[spec.stepAttribute]) : undefined) ??
      spec.defaultStep ??
      1;
    const rawValue = spec.valueFromState
      ? asNumber(state)
      : spec.valueAttribute
        ? asNumber(attributes[spec.valueAttribute])
        : undefined;
    const unit =
      (spec.unitAttribute && typeof attributes[spec.unitAttribute] === 'string'
        ? (attributes[spec.unitAttribute] as string)
        : undefined) ?? spec.defaultUnit;

    return {
      type,
      label: spec.label,
      control: 'slider',
      supported: true,
      // Clamp so a stale or out-of-range reading cannot draw a bar past its track.
      value: rawValue === undefined ? undefined : Math.min(max, Math.max(min, rawValue)),
      min,
      max,
      step,
      unit,
    };
  }

  if (spec.control === 'options') {
    const options = resolveOptions(spec, feature, attributes);
    const activeRaw = spec.activeAttribute ? attributes[spec.activeAttribute] : state;
    const active = typeof activeRaw === 'string' ? activeRaw : undefined;
    return { type, label: spec.label, control: 'options', supported: true, options, active };
  }

  return {
    type,
    label: spec.label,
    control: 'commands',
    supported: true,
    options: resolveCommands(spec, feature),
  };
};

/**
 * Resolve a whole `features[]` array.
 *
 * ⚠ Entries that are not objects, or carry no string `type`, are DROPPED — they
 * cannot name a control and there is nothing honest to draw for them. Every
 * entry that DOES name a type survives, supported or not.
 */
export const resolveTileFeatures = (
  features: TileFeatureConfig[] | undefined,
  entity?: { state?: string; attributes?: AttributeBag } | null,
): ResolvedTileFeature[] => {
  if (!Array.isArray(features)) return [];
  return features
    .filter(
      (feature): feature is TileFeatureConfig =>
        !!feature && typeof feature === 'object' && typeof feature.type === 'string',
    )
    .map((feature) => resolveTileFeature(feature, entity));
};

/** Percentage a slider's fill should occupy, for the renderer's track. */
export const tileSliderPercent = (feature: ResolvedTileFeature): number => {
  if (feature.control !== 'slider' || feature.value === undefined) return 0;
  const min = feature.min ?? 0;
  const max = feature.max ?? 100;
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((feature.value - min) / (max - min)) * 100));
};

/** How a slider's value reads to a human, including its unit. */
export const tileSliderLabel = (feature: ResolvedTileFeature): string => {
  if (feature.value === undefined) return '—';
  const step = feature.step ?? 1;
  // Derive precision from the step so 0.5 °C shows a decimal and 1 % does not.
  const decimals = step >= 1 ? 0 : (String(step).split('.')[1]?.length ?? 2);
  return `${feature.value.toFixed(decimals)}${feature.unit ?? ''}`;
};
