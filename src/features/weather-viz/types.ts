import type { WeatherForecastCard } from '../../types/dashboard';

export type WeatherVizMode = 'daily' | 'hourly';
export type WeatherVizMetric = 'temperature' | 'precipitation' | 'wind_speed';
export type WeatherVizIconAnimation = 'off' | 'subtle' | 'pulse';
export type WeatherVizUnitSystem = 'auto' | 'metric' | 'imperial';

export interface WeatherForecastVisualizationCardConfig extends WeatherForecastCard {
  forecast_type?: WeatherVizMode;
  mode?: WeatherVizMode;
  metrics?: WeatherVizMetric[];
  icon_animation?: WeatherVizIconAnimation;
  days?: number;
  locale?: string;
  unit_system?: WeatherVizUnitSystem;
}

export interface NormalizedWeatherVizConfig {
  mode: WeatherVizMode;
  metrics: WeatherVizMetric[];
  iconAnimation: WeatherVizIconAnimation;
  days: number;
  locale?: string;
  unitSystem: WeatherVizUnitSystem;
  showForecast: boolean;
}

export interface WeatherForecastPoint {
  datetime: string;
  timestamp: number;
  condition: string;
  temperature?: number;
  templow?: number;
  precipitation?: number;
  precipitationProbability?: number;
  windSpeed?: number;
  windBearing?: number;
}

export interface WeatherForecastSummary {
  minTemperature?: number;
  maxTemperature?: number;
  avgTemperature?: number;
  totalPrecipitation?: number;
  maxWindSpeed?: number;
}

