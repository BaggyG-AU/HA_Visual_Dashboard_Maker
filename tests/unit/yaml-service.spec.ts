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

  describe('sanitizeForHA', () => {
    it('removes HAVDM-specific card properties', () => {
      const configWithLayout: DashboardConfig = {
        title: 'Test Dashboard',
        views: [
          {
            title: 'Test View',
            path: 'test',
            cards: [
              {
                type: 'markdown',
                content: 'Hello',
                layout: { x: 0, y: 0, w: 4, h: 2 }, // HAVDM-specific
              } as any,
            ],
          } as DashboardConfig['views'][number],
        ],
      };

      const sanitized = yamlService.sanitizeForHA(configWithLayout);

      expect(sanitized.views[0].cards[0]).not.toHaveProperty('layout');
      expect(sanitized.views[0].cards[0].type).toBe('markdown');
      expect((sanitized.views[0].cards[0] as any).content).toBe('Hello');
    });

    it('removes spacer cards from views', () => {
      const configWithSpacers: DashboardConfig = {
        title: 'Test Dashboard',
        views: [
          {
            title: 'Test View',
            path: 'test',
            cards: [
              { type: 'markdown', content: 'Real card' },
              { type: 'spacer' } as any, // HAVDM spacer
              { type: 'entities', entities: [], _isSpacer: true } as any, // HAVDM spacer flag
              { type: 'markdown', content: 'Another real card' },
            ],
          } as DashboardConfig['views'][number],
        ],
      };

      const sanitized = yamlService.sanitizeForHA(configWithSpacers);

      expect(sanitized.views[0].cards.length).toBe(2);
      expect((sanitized.views[0].cards[0] as any).content).toBe('Real card');
      expect((sanitized.views[0].cards[1] as any).content).toBe('Another real card');
    });

    it('removes HAVDM-specific view properties', () => {
      const configWithViewProps: DashboardConfig = {
        title: 'Test Dashboard',
        views: [
          {
            title: 'Test View',
            path: 'test',
            type: 'custom:grid-layout', // HAVDM-specific
            layout: { // HAVDM-specific
              grid_template_columns: 'repeat(12, 1fr)',
              grid_template_rows: 'repeat(auto-fill, 56px)',
              grid_gap: '8px',
            },
            cards: [{ type: 'markdown', content: 'Hello' }],
          } as any,
        ],
      };

      const sanitized = yamlService.sanitizeForHA(configWithViewProps);

      expect(sanitized.views[0]).not.toHaveProperty('type');
      expect(sanitized.views[0]).not.toHaveProperty('layout');
      expect(sanitized.views[0].title).toBe('Test View');
      expect(sanitized.views[0].path).toBe('test');
    });

    it('preserves valid HA view properties', () => {
      const configWithValidProps: DashboardConfig = {
        title: 'Test Dashboard',
        views: [
          {
            title: 'Test View',
            path: 'test',
            icon: 'mdi:home',
            theme: 'default',
            background: '#ffffff',
            badges: ['sensor.temperature'],
            panel: false,
            visible: true,
            cards: [{ type: 'markdown', content: 'Hello' }],
          } as any,
        ],
      };

      const sanitized = yamlService.sanitizeForHA(configWithValidProps);

      expect(sanitized.views[0].title).toBe('Test View');
      expect(sanitized.views[0].path).toBe('test');
      expect(sanitized.views[0].icon).toBe('mdi:home');
      expect(sanitized.views[0].theme).toBe('default');
      expect(sanitized.views[0].background).toBe('#ffffff');
      expect((sanitized.views[0] as any).badges).toEqual(['sensor.temperature']);
      expect((sanitized.views[0] as any).panel).toBe(false);
      expect((sanitized.views[0] as any).visible).toBe(true);
    });

    it('removes undefined and null properties', () => {
      const configWithNulls: DashboardConfig = {
        title: 'Test Dashboard',
        views: [
          {
            title: 'Test View',
            path: 'test',
            icon: undefined,
            theme: null,
            cards: [
              {
                type: 'markdown',
                content: 'Hello',
                entity: undefined,
              } as any,
            ],
          } as any,
        ],
      };

      const sanitized = yamlService.sanitizeForHA(configWithNulls);

      expect(sanitized.views[0]).not.toHaveProperty('icon');
      expect(sanitized.views[0]).not.toHaveProperty('theme');
      expect(sanitized.views[0].cards[0]).not.toHaveProperty('entity');
    });

    it('handles empty cards array', () => {
      const configWithEmptyCards: DashboardConfig = {
        title: 'Test Dashboard',
        views: [
          {
            title: 'Empty View',
            path: 'empty',
            cards: [],
          } as DashboardConfig['views'][number],
        ],
      };

      const sanitized = yamlService.sanitizeForHA(configWithEmptyCards);

      expect(sanitized.views[0].cards).toEqual([]);
    });
  });

  describe('serializeForHA', () => {
    it('sanitizes and serializes dashboard config', () => {
      const configWithHAVDMProps: DashboardConfig = {
        title: 'Test Dashboard',
        views: [
          {
            title: 'Test View',
            path: 'test',
            type: 'custom:grid-layout', // HAVDM-specific
            cards: [
              {
                type: 'markdown',
                content: 'Hello',
                layout: { x: 0, y: 0, w: 4, h: 2 }, // HAVDM-specific
              } as any,
              { type: 'spacer' } as any, // HAVDM spacer
            ],
          } as any,
        ],
      };

      const yaml = yamlService.serializeForHA(configWithHAVDMProps);

      // Parse the YAML back to verify sanitization worked
      const parsed = yamlService.parseDashboard(yaml);
      expect(parsed.success).toBe(true);
      expect(parsed.data?.views[0]).not.toHaveProperty('type');
      expect(parsed.data?.views[0]).not.toHaveProperty('layout');
      expect(parsed.data?.views[0].cards.length).toBe(1); // Spacer removed
      expect(parsed.data?.views[0].cards[0]).not.toHaveProperty('layout');
    });

    it('produces valid YAML output', () => {
      const yaml = yamlService.serializeForHA(config);
      expect(yaml).toContain('title: Sample Dashboard');
      expect(yaml).toContain('views:');
      expect(yaml).toContain('- title: View A');
    });
  });
});
