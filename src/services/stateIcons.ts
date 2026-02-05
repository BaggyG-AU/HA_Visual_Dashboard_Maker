import type { StateIconsMap, StateIconConfig, ResolvedStateIconConfig } from '../types/stateIcons';

interface GetStateIconInput {
  entityId?: string;
  state?: string;
  stateIcons?: StateIconsMap;
  entityAttributes?: Record<string, unknown>;
  fallbackIcon?: string;
}

type DomainStateMap = Record<string, string | StateIconConfig>;

const GENERIC_FALLBACK_ICON = 'mdi:help-circle-outline';

const DOMAIN_DEFAULTS: Record<string, DomainStateMap> = {
  light: {
    on: 'mdi:lightbulb',
    off: 'mdi:lightbulb-outline',
    unavailable: 'mdi:lightbulb-off-outline',
    default: 'mdi:lightbulb-outline',
  },
  switch: {
    on: 'mdi:toggle-switch',
    off: 'mdi:toggle-switch-off',
    unavailable: 'mdi:toggle-switch-off-outline',
    default: 'mdi:toggle-switch-off',
  },
  input_boolean: {
    on: 'mdi:check-circle-outline',
    off: 'mdi:close-circle-outline',
    default: 'mdi:help-circle-outline',
  },
  binary_sensor: {
    on: 'mdi:radiobox-marked',
    off: 'mdi:radiobox-blank',
    unavailable: 'mdi:help-circle-outline',
    default: 'mdi:radiobox-blank',
  },
  lock: {
    locked: 'mdi:lock',
    unlocked: 'mdi:lock-open-variant',
    locking: 'mdi:lock-clock',
    unlocking: 'mdi:lock-open-alert',
    jammed: 'mdi:lock-alert',
    default: 'mdi:lock',
  },
  cover: {
    open: 'mdi:window-shutter-open',
    opening: 'mdi:window-shutter-open',
    closed: 'mdi:window-shutter',
    closing: 'mdi:window-shutter',
    default: 'mdi:window-shutter',
  },
  climate: {
    heat: { icon: 'mdi:fire', color: '#FF5722' },
    cool: { icon: 'mdi:snowflake', color: '#2196F3' },
    auto: 'mdi:thermostat-auto',
    dry: 'mdi:water-percent',
    fan_only: 'mdi:fan',
    off: 'mdi:power',
    default: 'mdi:thermostat',
  },
  fan: {
    on: 'mdi:fan',
    off: 'mdi:fan-off',
    default: 'mdi:fan',
  },
  media_player: {
    playing: 'mdi:play-circle',
    paused: 'mdi:pause-circle',
    idle: 'mdi:stop-circle-outline',
    off: 'mdi:power',
    default: 'mdi:speaker',
  },
  sensor: {
    unavailable: 'mdi:alert-circle-outline',
    unknown: 'mdi:help-circle-outline',
    default: 'mdi:chart-line',
  },
  person: {
    home: 'mdi:home-account',
    not_home: 'mdi:account-arrow-right-outline',
    default: 'mdi:account',
  },
  alarm_control_panel: {
    disarmed: 'mdi:shield-off-outline',
    armed_home: 'mdi:shield-home-outline',
    armed_away: 'mdi:shield-lock-outline',
    armed_night: 'mdi:shield-moon-outline',
    triggered: 'mdi:alarm-light-outline',
    default: 'mdi:shield-outline',
  },
  camera: {
    streaming: 'mdi:video',
    idle: 'mdi:video-off-outline',
    unavailable: 'mdi:video-off',
    default: 'mdi:video-outline',
  },
  vacuum: {
    cleaning: 'mdi:robot-vacuum',
    docked: 'mdi:ev-station',
    returning: 'mdi:home-import-outline',
    paused: 'mdi:pause-circle-outline',
    default: 'mdi:robot-vacuum',
  },
  sun: {
    above_horizon: 'mdi:white-balance-sunny',
    below_horizon: 'mdi:weather-night',
    default: 'mdi:weather-sunset',
  },
  weather: {
    sunny: 'mdi:weather-sunny',
    cloudy: 'mdi:weather-cloudy',
    rainy: 'mdi:weather-rainy',
    snowy: 'mdi:weather-snowy',
    windy: 'mdi:weather-windy',
    default: 'mdi:weather-partly-cloudy',
  },
};

const BINARY_SENSOR_DEVICE_CLASS_DEFAULTS: Record<string, DomainStateMap> = {
  door: {
    on: 'mdi:door-open',
    off: 'mdi:door-closed',
    default: 'mdi:door',
  },
  window: {
    on: 'mdi:window-open',
    off: 'mdi:window-closed',
    default: 'mdi:window-closed-variant',
  },
  motion: {
    on: 'mdi:run-fast',
    off: 'mdi:motion-sensor-off',
    default: 'mdi:motion-sensor',
  },
  occupancy: {
    on: 'mdi:account',
    off: 'mdi:account-off-outline',
    default: 'mdi:account-question-outline',
  },
};

const getDomain = (entityId?: string): string => {
  if (!entityId || !entityId.includes('.')) return '';
  return entityId.split('.')[0].toLowerCase();
};

const normalizeState = (state?: string): string => {
  if (!state || typeof state !== 'string') return 'unknown';
  return state.trim().toLowerCase();
};

const normalizeMappingEntry = (entry: string | StateIconConfig | undefined): StateIconConfig | undefined => {
  if (!entry) return undefined;
  if (typeof entry === 'string') {
    const value = entry.trim();
    return value ? { icon: value } : undefined;
  }

  if (typeof entry.icon !== 'string' || entry.icon.trim().length === 0) {
    return undefined;
  }

  return {
    icon: entry.icon.trim(),
    color: typeof entry.color === 'string' && entry.color.trim().length > 0 ? entry.color : undefined,
    size: typeof entry.size === 'number' ? entry.size : undefined,
  };
};

const resolveUserStateIcon = (stateIcons: StateIconsMap | undefined, stateKey: string): StateIconConfig | undefined => {
  if (!stateIcons) return undefined;
  const direct = normalizeMappingEntry(stateIcons[stateKey]);
  if (direct) return direct;

  const exactCase = normalizeMappingEntry(stateIcons[stateKey.toUpperCase()]);
  if (exactCase) return exactCase;

  const fallbackDefault = normalizeMappingEntry(stateIcons.default);
  if (fallbackDefault) return fallbackDefault;

  return undefined;
};

const resolveDomainStateIcon = (
  domain: string,
  stateKey: string,
  entityAttributes?: Record<string, unknown>,
): StateIconConfig | undefined => {
  if (!domain) return undefined;

  if (domain === 'binary_sensor') {
    const deviceClass = typeof entityAttributes?.device_class === 'string'
      ? entityAttributes.device_class.toLowerCase()
      : undefined;
    if (deviceClass && BINARY_SENSOR_DEVICE_CLASS_DEFAULTS[deviceClass]) {
      const classMap = BINARY_SENSOR_DEVICE_CLASS_DEFAULTS[deviceClass];
      return normalizeMappingEntry(classMap[stateKey] ?? classMap.default);
    }
  }

  const domainMap = DOMAIN_DEFAULTS[domain];
  if (!domainMap) return undefined;

  return normalizeMappingEntry(domainMap[stateKey] ?? domainMap.default);
};

export const getStateIcon = ({
  entityId,
  state,
  stateIcons,
  entityAttributes,
  fallbackIcon = GENERIC_FALLBACK_ICON,
}: GetStateIconInput): ResolvedStateIconConfig => {
  const domain = getDomain(entityId);
  const stateKey = normalizeState(state);

  const userIcon = resolveUserStateIcon(stateIcons, stateKey);
  if (userIcon) {
    return { ...userIcon, source: 'user' };
  }

  const domainIcon = resolveDomainStateIcon(domain, stateKey, entityAttributes);
  if (domainIcon) {
    return { ...domainIcon, source: 'domain' };
  }

  return {
    icon: fallbackIcon,
    source: 'generic',
  };
};

export const stateIconDefaults = {
  domain: DOMAIN_DEFAULTS,
  binarySensorDeviceClass: BINARY_SENSOR_DEVICE_CLASS_DEFAULTS,
};

export const normalizeStateIconMapping = (stateIcons?: StateIconsMap): Record<string, StateIconConfig> => {
  if (!stateIcons) return {};
  const normalized: Record<string, StateIconConfig> = {};

  Object.entries(stateIcons).forEach(([stateKey, entry]) => {
    const normalizedEntry = normalizeMappingEntry(entry);
    if (!normalizedEntry) return;
    normalized[stateKey.toLowerCase()] = normalizedEntry;
  });

  return normalized;
};
