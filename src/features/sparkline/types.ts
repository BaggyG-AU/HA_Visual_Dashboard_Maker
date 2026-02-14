import type { BaseCard } from '../../types/dashboard';

export type SparklineRangePreset = '1h' | '6h' | '24h' | '7d';
export type SparklineStyle = 'line' | 'area';

export interface SparklineShowConfig {
  name?: boolean;
  state?: boolean;
  icon?: boolean;
  graph?: 'line' | 'bar' | 'none' | string | boolean;
  fill?: boolean;
  extrema?: boolean;
}

export interface SparklineCardConfig extends BaseCard {
  type: 'custom:mini-graph-card';
  entity?: string;
  entities?: Array<string | { entity: string; [key: string]: unknown }>;
  color?: string;
  line_width?: number;
  points_per_hour?: number;
  hours_to_show?: number;
  height?: number;
  animate?: boolean;
  show?: SparklineShowConfig;
}

export interface NormalizedSparklineCardConfig {
  type: 'custom:mini-graph-card';
  entity?: string;
  name?: string;
  color: string;
  lineWidth: number;
  pointsPerHour: number;
  hoursToShow: number;
  rangePreset: SparklineRangePreset;
  style: SparklineStyle;
  showName: boolean;
  showCurrent: boolean;
  showIcon: boolean;
  showMinMax: boolean;
  compact: boolean;
  height: number;
}

export interface SparklinePoint {
  timestamp: number;
  value: number;
}

export interface SparklineDataset {
  points: SparklinePoint[];
  minIndex: number;
  maxIndex: number;
  currentIndex: number;
  min: number;
  max: number;
  current: number;
}
