export type ApexChartMode = 'line' | 'area' | 'bar';

export type ApexSeriesMode = 'line' | 'area' | 'column' | 'bar';

export interface ApexChartsSeriesConfig {
  entity: string;
  name?: string;
  type?: ApexSeriesMode;
  color?: string;
  stroke_width?: number;
  group_by?: {
    func?: string;
    duration?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ApexChartsHeaderConfig {
  title?: string;
  show?: boolean;
  show_states?: boolean;
  colorize_states?: boolean;
  [key: string]: unknown;
}

export interface ApexChartsCardConfig {
  type: 'custom:apexcharts-card';
  header?: ApexChartsHeaderConfig;
  graph_span?: string;
  update_interval?: string;
  series?: ApexChartsSeriesConfig[];
  apex_config?: {
    chart?: {
      type?: string;
      height?: number;
      [key: string]: unknown;
    };
    stroke?: {
      width?: number;
      curve?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  yaxis?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface NormalizedApexChartsSeriesConfig extends ApexChartsSeriesConfig {
  entity: string;
  name: string;
  type?: ApexSeriesMode;
}

export interface NormalizedApexChartsCardConfig extends ApexChartsCardConfig {
  header: ApexChartsHeaderConfig;
  graph_span: string;
  graph_span_seconds: number;
  update_interval: string;
  update_interval_seconds: number;
  series: NormalizedApexChartsSeriesConfig[];
  apex_config: {
    chart: {
      type: ApexChartMode;
      height: number;
      [key: string]: unknown;
    };
    stroke: {
      width: number;
      curve: 'smooth' | 'straight' | 'stepline';
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  warnings: string[];
}

export interface ApexDataPoint {
  x: number;
  y: number;
}
