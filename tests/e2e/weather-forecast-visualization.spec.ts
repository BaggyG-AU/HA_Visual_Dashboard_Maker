import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import { WEATHER_TEST_ENTITIES } from '../fixtures/weatherEntities';

const BASE_YAML = `type: weather-forecast
entity: weather.home
name: Forecast Overview
forecast_type: hourly
metrics:
  - temperature
  - precipitation
  - wind_speed
icon_animation: subtle
days: 3
unit_system: metric
locale: en-US
show_current: true
show_forecast: true
`;

test.describe('Weather Forecast Visualization', () => {
  test('renders hourly weather visualization and exposes accessible forecast labels', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, weatherViz, canvas, properties, yamlEditor, window, entityContext } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(WEATHER_TEST_ENTITIES, testInfo);
      await dashboard.createNew();

      await weatherViz.addWeatherForecastCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await weatherViz.verifyRendered();
      await expect(window.getByTestId('weather-viz-card').getByTestId('weather-viz-chart')).toHaveAttribute('aria-label', /temperature|precipitation|wind|No forecast data available/i);
      await expect(window.getByTestId('weather-viz-card').getByTestId('weather-viz-mode')).toContainText(/hourly/i);
      await weatherViz.expectForecastPointCountAtLeast(1);
      await expect(window.getByTestId('weather-viz-card').getByTestId('weather-viz-forecast-point').first()).toHaveAttribute('aria-label', /temperature/i);
    } finally {
      await close(ctx);
    }
  });

  test('updates weather visualization settings from form and persists YAML round-trip', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, weatherViz, canvas, properties, yamlEditor, entityContext } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(WEATHER_TEST_ENTITIES, testInfo);
      await dashboard.createNew();

      await weatherViz.addWeatherForecastCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await weatherViz.configure({
        days: 5,
        locale: 'en-GB',
      });

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();

      expect(yaml).toContain('type: weather-forecast');
      expect(yaml).toContain('days: 5');
      expect(yaml).toContain('locale: en-GB');
      expect(yaml).toContain('metrics:');
    } finally {
      await close(ctx);
    }
  });
});
