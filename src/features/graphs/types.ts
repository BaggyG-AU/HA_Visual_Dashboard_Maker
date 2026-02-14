import type { BaseCard } from '../../types/dashboard';

export type GraphChartType = 'line' | 'bar' | 'area' | 'pie';
export type GraphAxisSide = 'left' | 'right';
export type GraphXAxisMode = 'time' | 'category';

export interface GraphSeriesConfig {
  entity: string;
  label?: string;
  color?: string;
  axis?: GraphAxisSide;
  smooth?: boolean;
  stack?: boolean;
}

export interface GraphAxisConfig {
  mode?: GraphXAxisMode;
}

export interface GraphYAxisConfig {
  min?: number | 'auto' | string;
  max?: number | 'auto' | string;
}

export interface NativeGraphCardConfig extends BaseCard {
  type: 'custom:native-graph-card';
  title?: string;
  chart_type?: GraphChartType;
  time_range?: string;
  refresh_interval?: string;
  x_axis?: GraphAxisConfig;
  y_axis?: GraphYAxisConfig;
  series?: GraphSeriesConfig[];
  zoom_pan?: boolean;
}

export interface NormalizedGraphSeriesConfig {
  entity: string;
  label: string;
  color: string;
  axis: GraphAxisSide;
  smooth: boolean;
  stack: boolean;
}

export interface NormalizedNativeGraphConfig {
  type: 'custom:native-graph-card';
  title?: string;
  chart_type: GraphChartType;
  time_range: string;
  refresh_interval: string;
  time_range_seconds: number;
  refresh_interval_seconds: number;
  x_axis: { mode: GraphXAxisMode };
  y_axis: { min: number | 'auto'; max: number | 'auto' };
  series: NormalizedGraphSeriesConfig[];
  zoom_pan: boolean;
}

export interface GraphDataPoint {
  timestamp: number;
  [seriesKey: string]: number;
}

export interface GraphServiceDataResult {
  points: GraphDataPoint[];
  pie: Array<{ name: string; value: number; color: string }>;
}
