import React from 'react';
import type { WeatherForecastCard } from '../../types/dashboard';
import { WeatherForecastVisualizationCardRenderer } from './WeatherForecastVisualizationCardRenderer';

interface WeatherForecastCardRendererProps {
  card: WeatherForecastCard;
  isSelected?: boolean;
  onClick?: () => void;
}

export const WeatherForecastCardRenderer: React.FC<WeatherForecastCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => (
  <WeatherForecastVisualizationCardRenderer
    card={card}
    isSelected={isSelected}
    onClick={onClick}
  />
);

