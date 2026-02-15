import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: logbook
title: Home Timeline
entity: sensor.home_events
orientation: vertical
show_now_marker: true
group_by: day
max_items: 20
enable_scrubber: true
item_density: comfortable
truncate_length: 72
events:
  - timestamp: '2026-02-14T09:00:00Z'
    title: Coffee started
    description: Kitchen routine
  - timestamp: '2026-02-14T12:00:00Z'
    title: Work block
    description: Focus session begins
  - timestamp: '2026-02-14T18:00:00Z'
    title: Evening lights
    description: Sunset automation
`;

test.describe('Timeline Card', () => {
  test('renders grouped timeline with now marker and accessible event semantics', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, timeline, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await timeline.addTimelineCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await timeline.verifyRendered();
      await timeline.expectEventCountAtLeast(3);
      await expect(window.getByTestId('timeline-now-marker')).toBeVisible();
      await expect(window.getByTestId('timeline-events')).toHaveAttribute('aria-label', /Selected time/i);
      await expect(window.getByTestId('timeline-event').first()).toHaveAttribute('aria-label', /past|present|future/i);
    } finally {
      await close(ctx);
    }
  });

  test('updates orientation and scrub settings via form and persists YAML', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, timeline, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await timeline.addTimelineCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await timeline.configure({
        orientation: 'horizontal',
        groupBy: 'none',
        itemDensity: 'compact',
        maxItems: 12,
        truncateLength: 40,
      });

      await timeline.moveScrubberTo(1);
      await expect(window.getByTestId('timeline-selected-timestamp')).toContainText('Selected:');

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();

      expect(yaml).toContain('type: logbook');
      expect(yaml).toContain('orientation: horizontal');
      expect(yaml).toContain('group_by: none');
      expect(yaml).toContain('item_density: compact');
      expect(yaml).toContain('max_items: 12');
      expect(yaml).toContain('truncate_length: 40');
    } finally {
      await close(ctx);
    }
  });
});
