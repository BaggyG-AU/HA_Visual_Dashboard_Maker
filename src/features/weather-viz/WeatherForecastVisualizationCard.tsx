import React, { useEffect, useMemo, useState } from 'react';
import { Card as AntCard, Empty, Tag, Typography } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useEntityContextValue } from '../../hooks/useEntityContext';
import {
  buildForecastPointAriaLabel,
  buildForecastSummary,
  formatForecastDate,
  formatTemperature,
  formatWindSpeed,
  normalizeForecastPayload,
  normalizeWeatherVizConfig,
  resolveForecastFallback,
} from './weatherVizService';
import type { WeatherForecastVisualizationCardConfig, WeatherForecastPoint } from './types';

const { Text } = Typography;

interface WeatherForecastVisualizationCardProps {
  card: WeatherForecastVisualizationCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const WEATHER_ICON_MAP: Record<string, string> = {
  sunny: '☀️',
  clear: '☀️',
  'partly-cloudy': '⛅',
  partlycloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  pouring: '🌧️',
  snowy: '❄️',
  'snowy-rainy': '🌨️',
  lightning: '⛈️',
  'lightning-rainy': '⛈️',
  fog: '🌫️',
  windy: '💨',
};

const CHART_HEIGHT = 148;
const CHART_PADDING = 18;

const pickMetricValues = (points: WeatherForecastPoint[], metric: 'temperature' | 'precipitation' | 'wind_speed'): number[] => {
  if (metric === 'temperature') {
    return points.map((point) => point.temperature).filter((value): value is number => value !== undefined);
  }
  if (metric === 'precipitation') {
    return points.map((point) => point.precipitation).filter((value): value is number => value !== undefined);
  }
  return points.map((point) => point.windSpeed).filter((value): value is number => value !== undefined);
};

const metricAt = (point: WeatherForecastPoint, metric: 'temperature' | 'precipitation' | 'wind_speed'): number | undefined => {
  if (metric === 'temperature') return point.temperature;
  if (metric === 'precipitation') return point.precipitation;
  return point.windSpeed;
};

const metricLine = (
  points: WeatherForecastPoint[],
  metric: 'temperature' | 'precipitation' | 'wind_speed',
): string => {
  const values = pickMetricValues(points, metric);
  if (values.length === 0 || points.length < 2) return '';

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 100 - CHART_PADDING * 2;
  const height = CHART_HEIGHT - CHART_PADDING * 2;

  return points
    .map((point, index) => {
      const x = CHART_PADDING + (index / Math.max(1, points.length - 1)) * width;
      const raw = metricAt(point, metric) ?? min;
      const normalized = (raw - min) / range;
      const y = CHART_PADDING + (height - normalized * height);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const precipitationBars = (points: WeatherForecastPoint[]): React.ReactNode[] => {
  const values = pickMetricValues(points, 'precipitation');
  if (values.length === 0) return [];

  const max = Math.max(...values, 1);
  const width = 100 - CHART_PADDING * 2;
  const height = CHART_HEIGHT - CHART_PADDING * 2;
  const barWidth = width / Math.max(points.length, 1);

  return points.map((point, index) => {
    const x = CHART_PADDING + index * barWidth + 1;
    const value = point.precipitation ?? 0;
    const normalized = value / max;
    const barHeight = normalized * height;
    const y = CHART_PADDING + (height - barHeight);

    return (
      <rect
        key={`precip-${point.timestamp}-${index}`}
        x={x}
        y={y}
        width={Math.max(2, barWidth - 2)}
        height={Math.max(1, barHeight)}
        fill="rgba(79, 163, 255, 0.38)"
      />
    );
  });
};

const renderIcon = (condition: string): string => WEATHER_ICON_MAP[condition.toLowerCase()] ?? '☁️';

export const WeatherForecastVisualizationCard: React.FC<WeatherForecastVisualizationCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const config = useMemo(() => normalizeWeatherVizConfig(card), [card]);
  const entity = card.entity ? getEntity(card.entity) : null;
  const attributes = entity?.attributes || {};
  const sourceTemperatureUnit = typeof attributes.temperature_unit === 'string' ? attributes.temperature_unit : undefined;
  const sourceWindUnit = typeof attributes.wind_speed_unit === 'string' ? attributes.wind_speed_unit : undefined;

  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    attributes.friendly_name ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Weather';

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const normalizedForecast = useMemo(() => {
    const rawForecast = normalizeForecastPayload(attributes.forecast, config.mode, config.days);
    return resolveForecastFallback(rawForecast, typeof attributes.temperature === 'number' ? attributes.temperature : undefined);
  }, [attributes.forecast, attributes.temperature, config.days, config.mode]);

  const summary = useMemo(() => buildForecastSummary(normalizedForecast), [normalizedForecast]);

  const tempPath = useMemo(() => metricLine(normalizedForecast, 'temperature'), [normalizedForecast]);
  const windPath = useMemo(() => metricLine(normalizedForecast, 'wind_speed'), [normalizedForecast]);

  const weatherState = typeof entity?.state === 'string' ? entity.state : 'unknown';
  const weatherIcon = renderIcon(weatherState);
  const animation = !prefersReducedMotion ? config.iconAnimation : 'off';
  const showCurrent = card.show_current !== false;
  const roundTemperature = card.round_temperature !== false;
  const chartAriaLabel = normalizedForecast.length === 0
    ? 'No forecast data available'
    : normalizedForecast.map((point) => buildForecastPointAriaLabel(point, config, {
      temperature: sourceTemperatureUnit,
      wind: sourceWindUnit,
    })).join('; ');

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(79, 163, 255, 0.12)' : '#1f1f1f',
  );

  const animationStyle =
    animation === 'off'
      ? undefined
      : animation === 'pulse'
        ? { animation: 'weather-icon-pulse 1.6s ease-in-out infinite' }
        : { animation: 'weather-icon-subtle 3.2s ease-in-out infinite' };

  return (
    <AntCard
      size="small"
      data-testid="weather-viz-card"
      onClick={onClick}
      hoverable
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #4fa3ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: '100%',
          padding: 12,
        },
      }}
    >
      <style>
        {`
          @keyframes weather-icon-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          @keyframes weather-icon-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.88; }
          }
        `}
      </style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong style={{ color: '#e6e6e6' }}>{displayName}</Text>
          <Text style={{ color: '#8f8f8f', fontSize: 12, textTransform: 'capitalize' }}>
            {weatherState.replace(/_/g, ' ')}
          </Text>
        </div>

        {showCurrent && (
          <div
            data-testid="weather-viz-current-icon"
            aria-label={`Current weather: ${weatherState}`}
            style={{
              fontSize: 28,
              lineHeight: 1,
              ...animationStyle,
            }}
          >
            {weatherIcon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Tag data-testid="weather-viz-mode" color="blue">{config.mode}</Tag>
        {config.metrics.map((metric) => (
          <Tag key={metric} data-testid="weather-viz-metric-tag" color="geekblue">
            {metric}
          </Tag>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px 8px' }}>
          <Text style={{ color: '#8f8f8f', fontSize: 11, display: 'block' }}>Min/Max</Text>
          <Text style={{ color: '#e6e6e6', fontSize: 12 }}>
            {formatTemperature(summary.minTemperature, config.unitSystem, sourceTemperatureUnit, roundTemperature)} / {formatTemperature(summary.maxTemperature, config.unitSystem, sourceTemperatureUnit, roundTemperature)}
          </Text>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px 8px' }}>
          <Text style={{ color: '#8f8f8f', fontSize: 11, display: 'block' }}>Rain</Text>
          <Text style={{ color: '#e6e6e6', fontSize: 12 }}>
            {summary.totalPrecipitation !== undefined ? `${summary.totalPrecipitation.toFixed(1)} mm` : '--'}
          </Text>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px 8px' }}>
          <Text style={{ color: '#8f8f8f', fontSize: 11, display: 'block' }}>Wind Max</Text>
          <Text style={{ color: '#e6e6e6', fontSize: 12 }}>
            {formatWindSpeed(summary.maxWindSpeed, config.unitSystem, sourceWindUnit)}
          </Text>
        </div>
      </div>

      {!entity && card.entity && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#8f8f8f' }}>{card.entity}</span>}
          style={{ marginTop: 'auto' }}
        />
      )}

      {entity && config.showForecast && (
        <>
          <div
            data-testid="weather-viz-chart"
            role="img"
            aria-label={chartAriaLabel}
            style={{
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <svg
              width="100%"
              height={CHART_HEIGHT}
              viewBox={`0 0 100 ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <line x1={CHART_PADDING} y1={CHART_HEIGHT - CHART_PADDING} x2={100 - CHART_PADDING} y2={CHART_HEIGHT - CHART_PADDING} stroke="rgba(255,255,255,0.16)" strokeWidth="0.4" />
              {config.metrics.includes('precipitation') && precipitationBars(normalizedForecast)}
              {config.metrics.includes('temperature') && tempPath && (
                <path d={tempPath} fill="none" stroke="#ffb74d" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
              )}
              {config.metrics.includes('wind_speed') && windPath && (
                <path d={windPath} fill="none" stroke="#90caf9" strokeDasharray="2 2" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
              )}
            </svg>
          </div>

          <div
            data-testid="weather-viz-forecast-list"
            role="list"
            aria-label="Forecast points"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
              gap: 8,
              marginTop: 'auto',
            }}
          >
            {normalizedForecast.slice(0, config.mode === 'hourly' ? 12 : config.days).map((point, index) => {
              const pointIcon = renderIcon(point.condition);
              const label = buildForecastPointAriaLabel(point, config, {
                temperature: sourceTemperatureUnit,
                wind: sourceWindUnit,
              });

              return (
                <div
                  key={`${point.timestamp}-${index}`}
                  data-testid="weather-viz-forecast-point"
                  role="listitem"
                  aria-label={label}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center',
                  }}
                >
                  <Text style={{ color: '#9f9f9f', fontSize: 11, display: 'block' }}>
                    {formatForecastDate(point.timestamp, config.mode, config.locale)}
                  </Text>
                  <div style={{ fontSize: 20, lineHeight: 1, margin: '2px 0 6px', ...(animation !== 'off' ? animationStyle : undefined) }}>
                    {pointIcon}
                  </div>
                  {config.metrics.includes('temperature') && (
                    <Text style={{ color: '#f5f5f5', fontSize: 12, display: 'block' }}>
                      {formatTemperature(point.temperature, config.unitSystem, sourceTemperatureUnit, roundTemperature)}
                    </Text>
                  )}
                  {config.metrics.includes('precipitation') && (
                    <Text style={{ color: '#9ad0ff', fontSize: 11, display: 'block' }}>
                      {point.precipitation !== undefined ? `${point.precipitation} mm` : '--'}
                    </Text>
                  )}
                  {config.metrics.includes('wind_speed') && (
                    <Text style={{ color: '#c1ddff', fontSize: 11, display: 'block' }}>
                      {formatWindSpeed(point.windSpeed, config.unitSystem, sourceWindUnit)}
                    </Text>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {entity && !config.showForecast && (
        <div style={{ marginTop: 'auto', textAlign: 'center', color: '#8f8f8f' }}>
          <CloudOutlined />
          <Text style={{ color: '#8f8f8f', marginLeft: 8 }}>Forecast hidden</Text>
        </div>
      )}
    </AntCard>
  );
};
