import type { DashboardConfig } from '../../types/dashboard';

export interface PresetMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  entityIds: string[];
  cardCount: number;
}

export interface PresetRecord extends PresetMetadata {
  yaml: string;
}

export interface PresetCollection {
  kind: string;
  version: number;
  presets: unknown[];
}

export interface ParsedPresetCollection {
  presets: PresetRecord[];
  errors: string[];
}

export interface PresetImportPayload {
  id: string;
  title: string;
  yaml: string;
  config: DashboardConfig;
}
