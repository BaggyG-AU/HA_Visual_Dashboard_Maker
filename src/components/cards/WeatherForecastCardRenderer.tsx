import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { CloudOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { WeatherForecastCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface WeatherForecastCardRendererProps {
  card: WeatherForecastCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Weather Forecast card type
 * Displays current weather and optional forecast
 */
export const WeatherForecastCardRenderer: React.FC<WeatherForecastCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract weather properties
  const state = entity?.state || 'unknown';
  const attributes = entity?.attributes || {};
  const temperature = attributes.temperature || '--';
  const humidity = attributes.humidity || '--';
  const pressure = attributes.pressure || '--';
  const windSpeed = attributes.wind_speed || '--';
  const windSpeedUnit = attributes.wind_speed_unit || 'km/h';
  const forecast = attributes.forecast || [];

  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    attributes.friendly_name ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Weather';
  const showForecast = card.show_forecast !== false;
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return '☀️';
      case 'partlycloudy':
      case 'partly-cloudy':
        return '⛅';
      case 'cloudy':
        return '☁️';
      case 'rainy':
      case 'pouring':
        return '🌧️';
      case 'snowy':
      case 'snowy-rainy':
        return '❄️';
      case 'fog':
      case 'hazy':
        return '🌫️';
      case 'windy':
        return '💨';
      case 'lightning':
      case 'lightning-rainy':
        return '⛈️';
      default:
        return <CloudOutlined />;
    }
  };

  const weatherIcon = getWeatherIcon(state);

  return (
    <AntCard
      size="small"
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '16px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <EnvironmentOutlined style={{ fontSize: '14px', color: '#999' }} />
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {displayName}
        </Text>
      </div>

      {/* Current weather */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Weather icon and temperature */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{ fontSize: '56px', lineHeight: 1 }}>
            {weatherIcon}
          </div>
          <div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#e6e6e6',
              lineHeight: 1,
            }}>
              {temperature}°
            </div>
            <Text
              style={{
                color: '#999',
                fontSize: '13px',
                textTransform: 'capitalize',
              }}
            >
              {state.replace(/-/g, ' ')}
            </Text>
          </div>
        </div>
      </div>

      {/* Weather details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
      }}>
        {/* Humidity */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
            Humidity
          </Text>
          <Text strong style={{ fontSize: '14px', color: '#03a9f4' }}>
            {humidity}%
          </Text>
        </div>

        {/* Wind */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
            Wind
          </Text>
          <Text strong style={{ fontSize: '14px', color: '#4caf50' }}>
            {windSpeed} {windSpeedUnit}
          </Text>
        </div>

        {/* Pressure */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
            Pressure
          </Text>
          <Text strong style={{ fontSize: '14px', color: '#ff9800' }}>
            {pressure} hPa
          </Text>
        </div>
      </div>

      {/* Forecast (if enabled and available) */}
      {showForecast && forecast.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px 0',
          marginTop: 'auto',
        }}>
          {forecast.slice(0, 5).map((day: any, index: number) => (
            <div
              key={index}
              style={{
                flex: '0 0 auto',
                textAlign: 'center',
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '6px',
                minWidth: '60px',
              }}
            >
              <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
                {day.datetime ? new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short' }) : 'Day'}
              </Text>
              <div style={{ fontSize: '24px', margin: '4px 0' }}>
                {getWeatherIcon(day.condition)}
              </div>
              <Text strong style={{ fontSize: '11px', color: '#e6e6e6', display: 'block' }}>
                {day.temperature}°
              </Text>
              {day.templow !== undefined && (
                <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
                  {day.templow}°
                </Text>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No entity warning */}
      {!entity && card.entity && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
        }}>
          <CloudOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
