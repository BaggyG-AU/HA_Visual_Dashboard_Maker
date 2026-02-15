import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const VERTICAL_GROUPED_YAML = `type: logbook
title: Timeline Vertical
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
    title: Morning routine started
    description: Kitchen and lights automated
  - timestamp: '2026-02-14T12:00:00Z'
    title: Midday checkpoint
    description: Workspace climate adjusted
  - timestamp: '2026-02-14T18:00:00Z'
    title: Evening scene ready
    description: Lights and media ambience set
`;

const HORIZONTAL_UNGROUPED_YAML = `type: logbook
title: Timeline Horizontal
entity: sensor.home_events
orientation: horizontal
show_now_marker: false
group_by: none
max_items: 20
enable_scrubber: true
item_density: compact
truncate_length: 42
events:
  - timestamp: '2026-02-14T09:00:00Z'
    title: Morning routine started
    description: Kitchen and lights automated
  - timestamp: '2026-02-14T12:00:00Z'
    title: Midday checkpoint
    description: Workspace climate adjusted
  - timestamp: '2026-02-14T18:00:00Z'
    title: Evening scene ready
    description: Lights and media ambience set
`;

test.describe('Timeline Visual Regression', () => {
  test('captures vertical grouped and horizontal ungrouped variants', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, timeline, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await timeline.addTimelineCard();
      await canvas.selectCard(0);

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(VERTICAL_GROUPED_YAML, 'properties');
      await properties.switchTab('Form');
      await timeline.verifyRendered();
      await timeline.expectTimelineScreenshot('timeline-vertical-grouped.png');

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(HORIZONTAL_UNGROUPED_YAML, 'properties');
      await properties.switchTab('Form');
      await timeline.verifyRendered();
      await timeline.expectTimelineScreenshot('timeline-horizontal-ungrouped.png');
    } finally {
      await close(ctx);
    }
  });
});
