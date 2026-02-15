export const WEATHER_TEST_ENTITIES: Array<Record<string, unknown>> = [
  {
    entity_id: 'weather.home',
    domain: 'weather',
    state: 'sunny',
    attributes: {
      friendly_name: 'Home Weather',
      temperature: 22,
      temperature_unit: '°C',
      humidity: 48,
      pressure: 1014,
      wind_speed: 12,
      wind_speed_unit: 'km/h',
      forecast: [
        {
          datetime: '2026-02-15T09:00:00Z',
          condition: 'sunny',
          temperature: 23,
          templow: 18,
          precipitation: 0,
          wind_speed: 10,
        },
        {
          datetime: '2026-02-15T12:00:00Z',
          condition: 'partlycloudy',
          temperature: 25,
          templow: 19,
          precipitation: 0.2,
          wind_speed: 14,
        },
        {
          datetime: '2026-02-15T15:00:00Z',
          condition: 'rainy',
          temperature: 21,
          templow: 17,
          precipitation: 1.4,
          wind_speed: 18,
        },
        {
          datetime: '2026-02-16T09:00:00Z',
          condition: 'cloudy',
          temperature: 20,
          templow: 16,
          precipitation: 0.4,
          wind_speed: 11,
        },
      ],
    },
    last_changed: '2026-02-15T08:45:00Z',
    last_updated: '2026-02-15T08:45:00Z',
    context: { id: 'weather-test-1', parent_id: null, user_id: null },
  },
];

