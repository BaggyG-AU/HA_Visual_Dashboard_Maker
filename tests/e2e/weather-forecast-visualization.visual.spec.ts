import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import { WEATHER_TEST_ENTITIES } from '../fixtures/weatherEntities';

const HOURLY_YAML = `type: weather-forecast
entity: weather.home
name: Hourly Weather
forecast_type: hourly
metrics:
  - temperature
  - precipitation
  - wind_speed
icon_animation: off
days: 2
unit_system: metric
show_current: true
show_forecast: true
`;

const DAILY_YAML = `type: weather-forecast
entity: weather.home
name: Daily Weather
forecast_type: daily
metrics:
  - temperature
  - wind_speed
icon_animation: pulse
days: 5
unit_system: imperial
show_current: true
show_forecast: true
`;

test.describe('Weather Forecast Visualization Visual Regression', () => {
  test('captures hourly and daily weather visualization variants', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, weatherViz, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await ctx.entityContext.setEntities(WEATHER_TEST_ENTITIES, testInfo);
      await dashboard.createNew();

      await weatherViz.addWeatherForecastCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(HOURLY_YAML, 'properties');
      await properties.switchTab('Form');
      await weatherViz.verifyRendered();

      const card = window.getByTestId('canvas-card').first();
      await card.scrollIntoViewIfNeeded();

      const firstBox = await card.boundingBox();
      if (!firstBox) {
        throw new Error('Failed to capture card bounding box for hourly weather screenshot');
      }

      await test.expect(window).toHaveScreenshot('weather-viz-hourly-off.png', {
        clip: {
          x: Math.floor(firstBox.x),
          y: Math.floor(firstBox.y),
          width: Math.ceil(firstBox.width) + 1,
          height: Math.ceil(firstBox.height) + 1,
        },
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixels: 2500,
      });

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(DAILY_YAML, 'properties');
      await properties.switchTab('Form');

      const secondBox = await card.boundingBox();
      if (!secondBox) {
        throw new Error('Failed to capture card bounding box for daily weather screenshot');
      }

      await test.expect(window).toHaveScreenshot('weather-viz-daily-pulse.png', {
        clip: {
          x: Math.floor(secondBox.x),
          y: Math.floor(secondBox.y),
          width: Math.ceil(secondBox.width) + 1,
          height: Math.ceil(secondBox.height) + 1,
        },
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixels: 2500,
      });
    } finally {
      await close(ctx);
    }
  });
});
