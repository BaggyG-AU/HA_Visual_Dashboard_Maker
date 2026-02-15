import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: calendar
title: Household Calendar
calendar_entities:
  - calendar.household
view: month
show_week_numbers: true
show_agenda: true
on_date_select:
  action: more-info
events:
  - start: '2026-02-15T08:30:00Z'
    end: '2026-02-15T09:00:00Z'
    title: Morning routine
    status: confirmed
  - start: '2026-02-16T12:00:00Z'
    end: '2026-02-16T13:00:00Z'
    title: Lunch prep
    status: tentative
  - start: '2026-02-17T19:00:00Z'
    end: '2026-02-17T20:00:00Z'
    title: Evening lights
    status: cancelled
`;

test.describe('Calendar View Card', () => {
  test('renders month/week/day views with event badges and agenda', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, calendar, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await calendar.addCalendarCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await calendar.verifyRendered();
      await expect(window.getByTestId('calendar-event-badge').first()).toBeVisible();
      await expect(window.getByTestId('calendar-agenda')).toBeVisible();
      await expect(window.getByTestId('calendar-date-action')).toContainText('more-info');

      await window.getByTestId('calendar-view-mode').locator('.ant-segmented-item', { hasText: /^Week$/i }).click();
      await expect(window.getByTestId('calendar-grid')).toHaveAttribute('aria-label', /week/i);

      await window.getByTestId('calendar-view-mode').locator('.ant-segmented-item', { hasText: /^Day$/i }).click();
      await expect(window.getByTestId('calendar-grid')).toHaveAttribute('aria-label', /day/i);
    } finally {
      await close(ctx);
    }
  });

  test('supports keyboard date traversal and YAML persistence', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, calendar, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await calendar.addCalendarCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await calendar.configure({
        view: 'month',
        showWeekNumbers: false,
        showAgenda: false,
      });

      await calendar.arrowNavigateDates(2);
      await window.keyboard.press('Enter');
      await expect(window.getByTestId('calendar-date-cell').first()).toHaveAttribute('aria-label', /events/i);

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();

      expect(yaml).toContain('type: calendar');
      expect(yaml).toContain('view: month');
      expect(yaml).toContain('show_week_numbers: false');
      expect(yaml).toContain('show_agenda: false');
      expect(yaml).toContain('action: more-info');
    } finally {
      await close(ctx);
    }
  });
});
