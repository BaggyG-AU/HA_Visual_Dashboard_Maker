import { describe, it, expect } from 'vitest';
import { yamlService } from '../../src/services/yamlService';
import { DashboardConfig } from '../../src/types/dashboard';

describe('yamlService', () => {
  const config: DashboardConfig = {
    title: 'Sample Dashboard',
    views: [
      {
        title: 'View A',
        path: 'a',
        cards: [{ type: 'markdown', content: 'Hello' }],
      } as DashboardConfig['views'][number],
      {
        title: 'View B',
        path: 'b',
        cards: [{ type: 'entities', entities: ['light.living_room'] }],
      } as DashboardConfig['views'][number],
    ],
  };

  it('serializes and parses dashboards round-trip', () => {
    const yaml = yamlService.serializeDashboard(config);
    const parsed = yamlService.parseDashboard(yaml);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.title).toBe(config.title);
    expect(parsed.data?.views.length).toBe(2);
    expect(parsed.data?.views[0].title).toBe('View A');
  });

  it('preserves view ordering in serialized output', () => {
    const yaml = yamlService.serializeDashboard(config);
    expect(yaml.indexOf('View A')).toBeLessThan(yaml.indexOf('View B'));
  });

  it('returns errors for invalid YAML', () => {
    const bad = yamlService.parseDashboard('title: test');
    expect(bad.success).toBe(false);
    expect(bad.error).toBeTruthy();
  });
});
