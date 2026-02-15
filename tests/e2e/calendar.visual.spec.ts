import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const MONTH_YAML = `type: calendar
title: Calendar Month
view: month
show_week_numbers: true
show_agenda: true
events:
  - start: '2026-02-15T08:30:00Z'
    end: '2026-02-15T09:00:00Z'
    title: Morning routine
    status: confirmed
  - start: '2026-02-16T12:00:00Z'
    end: '2026-02-16T13:00:00Z'
    title: Lunch prep
    status: tentative
`;

const WEEK_YAML = `type: calendar
title: Calendar Week
view: week
show_week_numbers: true
show_agenda: false
events:
  - start: '2026-02-15T08:30:00Z'
    end: '2026-02-15T09:00:00Z'
    title: Morning routine
    status: confirmed
`;

const DAY_YAML = `type: calendar
title: Calendar Day
view: day
show_week_numbers: false
show_agenda: true
events:
  - start: '2026-02-15T08:30:00Z'
    end: '2026-02-15T09:00:00Z'
    title: Morning routine
    status: confirmed
  - start: '2026-02-15T18:00:00Z'
    end: '2026-02-15T19:00:00Z'
    title: Evening lights
    status: cancelled
`;

test.describe('Calendar Visual Regression', () => {
  test('captures month, week, and day variants', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, calendar, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await calendar.addCalendarCard();
      await canvas.selectCard(0);

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(MONTH_YAML, 'properties');
      await properties.switchTab('Form');
      await calendar.verifyRendered();
      await window.getByTestId('canvas-card').first().screenshot({
        path: 'test-results/artifacts/calendar-month.png',
      });

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(WEEK_YAML, 'properties');
      await properties.switchTab('Form');
      await calendar.verifyRendered();
      await window.getByTestId('canvas-card').first().screenshot({
        path: 'test-results/artifacts/calendar-week.png',
      });

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(DAY_YAML, 'properties');
      await properties.switchTab('Form');
      await calendar.verifyRendered();
      await window.getByTestId('canvas-card').first().screenshot({
        path: 'test-results/artifacts/calendar-day.png',
      });
    } finally {
      await close(ctx);
    }
  });
});
