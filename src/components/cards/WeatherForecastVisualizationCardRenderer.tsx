import React from 'react';
import { WeatherForecastVisualizationCard } from '../../features/weather-viz/WeatherForecastVisualizationCard';
import type { WeatherForecastVisualizationCardConfig } from '../../features/weather-viz/types';

interface WeatherForecastVisualizationCardRendererProps {
  card: WeatherForecastVisualizationCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const WeatherForecastVisualizationCardRenderer: React.FC<WeatherForecastVisualizationCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => <WeatherForecastVisualizationCard card={card} isSelected={isSelected} onClick={onClick} />;

