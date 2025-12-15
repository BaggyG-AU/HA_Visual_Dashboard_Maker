// Home Assistant API types

export interface HAConnectionConfig {
  url: string;
  token: string;
  ignoreSslErrors?: boolean;
}

export interface HAEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface HAConfig {
  location_name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  time_zone: string;
  components: string[];
  config_dir: string;
  whitelist_external_dirs: string[];
  version: string;
}

export interface HAApiError {
  error: string;
  message?: string;
}

export interface HAConnectionStatus {
  connected: boolean;
  url?: string;
  version?: string;
  error?: string;
}

export interface EntityDomain {
  domain: string;
  entities: HAEntity[];
}
