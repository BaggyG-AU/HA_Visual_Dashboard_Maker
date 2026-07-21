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
                _havdm_layout: { x: 0, y: 0, w: 4, h: 2 }, // HAVDM-specific
              } as any,
            ],
          } as DashboardConfig['views'][number],
        ],
      };

      const sanitized = yamlService.sanitizeForHA(configWithLayout);

      expect(sanitized.views[0]?.cards?.[0]).not.toHaveProperty('_havdm_layout');
      expect(sanitized.views[0]?.cards?.[0]?.type).toBe('markdown');
      expect((sanitized.views[0]?.cards?.[0] as any).content).toBe('Hello');
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

      expect(sanitized.views[0]?.cards?.length).toBe(2);
      expect((sanitized.views[0]?.cards?.[0] as any).content).toBe('Real card');
      expect((sanitized.views[0]?.cards?.[1] as any).content).toBe('Another real card');
    });

    it('removes HAVDM-specific view properties', () => {
      const configWithViewProps: DashboardConfig = {
        title: 'Test Dashboard',
        views: [
          {
            title: 'Test View',
            path: 'test',
            type: 'custom:grid-layout', // HAVDM-specific
            layout: {
              // HAVDM-specific
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
      expect(sanitized.views[0]?.cards?.[0]).not.toHaveProperty('entity');
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
                _havdm_layout: { x: 0, y: 0, w: 4, h: 2 }, // HAVDM-specific
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
      expect(parsed.data?.views[0]?.cards?.length).toBe(1); // Spacer removed
      expect(parsed.data?.views[0]?.cards?.[0]).not.toHaveProperty('_havdm_layout');
    });

    it('produces valid YAML output', () => {
      const yaml = yamlService.serializeForHA(config);
      expect(yaml).toContain('title: Sample Dashboard');
      expect(yaml).toContain('views:');
      expect(yaml).toContain('- title: View A');
    });
  });

  // Slice B0 of the export-boundary work: the deploy path must send the
  // sanitised OBJECT directly, not re-serialise it and parse it back. Parsing
  // re-runs the import mappers, which re-inflate HAVDM-internal keys that the
  // export mappers had just removed. These tests lock the property that makes
  // the direct object the correct thing to deploy.
  describe('deploy boundary (B0): sanitizeForHA vs a re-parse round-trip', () => {
    const configWithSwipe: DashboardConfig = {
      title: 'Deploy Test',
      views: [
        {
          title: 'View',
          path: 'v',
          cards: [
            {
              type: 'custom:swipe-card',
              parameters: { pagination: true },
              cards: [{ type: 'markdown', content: 'A' }],
            } as any,
          ],
        } as any,
      ],
    };

    const swipeOf = (dash: DashboardConfig | undefined) =>
      dash?.views?.[0]?.cards?.[0] as Record<string, unknown> | undefined;

    it('the sanitised object does not carry HAVDM-internal swipe keys', () => {
      // This is what DeployDialog now sends to Home Assistant.
      const direct = yamlService.sanitizeForHA(configWithSwipe);
      const card = swipeOf(direct);
      expect(card?.type).toBe('custom:swipe-card');
      expect(card).not.toHaveProperty('slides');
      expect(card).not.toHaveProperty('slides_per_view');
    });

    it('a re-parse round-trip RE-INFLATES those keys (the old deploy path)', () => {
      // The pre-B0 path: serializeForHA -> string -> parseDashboard (import).
      const roundTripped = yamlService.parseDashboard(
        yamlService.serializeForHA(configWithSwipe),
      ).data;
      const card = swipeOf(roundTripped);
      // Documents WHY B0 exists: the import mappers put the internal keys back.
      expect(card).toHaveProperty('slides');
      expect(card).toHaveProperty('slides_per_view');
    });
  });

  // Slices B2 + B3 of the export-boundary work: the STRIP class of the export
  // contract (haExportContract.ts) is folded into exportCard, which the
  // recursive export pass applies at every depth, and the spacer filter moves
  // out of sanitizeForHA's top-level-only .filter into that recursive pass.
  //
  // RED-BEFORE-GREEN: every assertion here that is marked "fails on main" was
  // confirmed to fail when only src/services/yamlConversionService.ts +
  // src/services/yamlService.ts are reverted to their pre-B2 state in the same
  // checkout — see the PR notes. On main today: nested STRIP keys survive, the
  // recursion misses custom containers, and nested spacers leak.
  describe('export boundary (B2/B3): recursive STRIP + nested spacer removal', () => {
    const nestedConfig: DashboardConfig = {
      title: 'Nested Deploy',
      views: [
        {
          title: 'V',
          path: 'v',
          cards: [
            {
              type: 'vertical-stack',
              cards: [
                {
                  type: 'markdown',
                  content: 'inner',
                  _havdm_layout: { x: 0, y: 0, w: 2, h: 2 },
                  icon_color_mode: 'state',
                  _expanderDepth: 1,
                },
                { type: 'spacer' },
                { type: 'entities', entities: [], _isSpacer: true },
                {
                  // A custom container the pre-B2 hard-coded recursion list MISSES.
                  type: 'custom:vertical-stack-in-card',
                  cards: [
                    {
                      type: 'markdown',
                      content: 'deep',
                      _havdm_layout: { x: 1 },
                      icon_color_mode: 'entity',
                    },
                  ],
                },
                {
                  // Mushroom's REAL layout option — must survive (B5 boundary).
                  type: 'custom:mushroom-template-card',
                  layout: 'horizontal',
                },
              ],
            },
          ],
        } as unknown as DashboardConfig['views'][number],
      ],
    } as unknown as DashboardConfig;

    const stackOf = (config: DashboardConfig) =>
      yamlService.sanitizeForHA(config).views[0]?.cards?.[0] as unknown as {
        cards: Record<string, unknown>[];
      };

    it('strips STRIP-class keys from a NESTED card (fails on main)', () => {
      const inner = stackOf(nestedConfig).cards;
      const markdown = inner.find((c) => c.content === 'inner');
      expect(markdown).toBeDefined();
      expect(markdown).not.toHaveProperty('_havdm_layout');
      expect(markdown).not.toHaveProperty('icon_color_mode');
      expect(markdown).not.toHaveProperty('_expanderDepth');
      // Real content is untouched.
      expect(markdown?.content).toBe('inner');
    });

    it('recurses into custom containers the old allowlist missed (fails on main)', () => {
      const inner = stackOf(nestedConfig).cards;
      const stackInCard = inner.find((c) => c.type === 'custom:vertical-stack-in-card') as {
        cards: Record<string, unknown>[];
      };
      expect(stackInCard).toBeDefined();
      const deep = stackInCard.cards[0];
      expect(deep).not.toHaveProperty('_havdm_layout');
      expect(deep).not.toHaveProperty('icon_color_mode');
      expect(deep.content).toBe('deep');
    });

    it('removes NESTED spacer cards, not just top-level ones (fails on main)', () => {
      const inner = stackOf(nestedConfig).cards;
      expect(inner.some((c) => c.type === 'spacer')).toBe(false);
      expect(inner.some((c) => c._isSpacer === true)).toBe(false);
      // markdown, custom:vertical-stack-in-card, mushroom — both spacers gone.
      expect(inner).toHaveLength(3);
    });

    it("preserves Mushroom's real layout: 'horizontal' (does not clobber it)", () => {
      const inner = stackOf(nestedConfig).cards;
      const mushroom = inner.find((c) => c.type === 'custom:mushroom-template-card');
      expect(mushroom).toBeDefined();
      expect(mushroom?.layout).toBe('horizontal');
    });

    it('applies the STRIP at the TOP level too (fails on main)', () => {
      const topLevel: DashboardConfig = {
        title: 'Top',
        views: [
          {
            title: 'V',
            path: 'v',
            cards: [
              {
                type: 'markdown',
                content: 'top',
                icon_color_mode: 'state',
                _expanderDepth: 0,
              },
            ],
          } as unknown as DashboardConfig['views'][number],
        ],
      } as unknown as DashboardConfig;

      const card = yamlService.sanitizeForHA(topLevel).views[0]?.cards?.[0] as Record<
        string,
        unknown
      >;
      expect(card).not.toHaveProperty('icon_color_mode');
      expect(card).not.toHaveProperty('_expanderDepth');
      expect(card.content).toBe('top');
    });
  });

  // Slice B5: the internal grid-geometry key is renamed `layout` -> `_havdm_layout`
  // (so it no longer collides with Mushroom's real `layout: 'horizontal'`), with a
  // value-shape migration shim on import. Both "fails on main" assertions were
  // confirmed red when only the B5 src changes are reverted in the same checkout.
  describe('layout key rename + Mushroom collision (B5)', () => {
    const importFirstCard = (yaml: string): Record<string, unknown> => {
      const parsed = yamlService.parseDashboard(yaml);
      expect(parsed.success).toBe(true);
      return parsed.data?.views[0]?.cards?.[0] as unknown as Record<string, unknown>;
    };

    it('migrates a bare `layout: {x,y,w,h}` object to `_havdm_layout` on import (fails on main)', () => {
      const card = importFirstCard(
        [
          'title: Migrate',
          'views:',
          '  - title: V',
          '    path: v',
          '    cards:',
          '      - type: markdown',
          '        content: Hello',
          '        layout:',
          '          x: 1',
          '          y: 2',
          '          w: 4',
          '          h: 3',
        ].join('\n'),
      );
      expect(card._havdm_layout).toEqual({ x: 1, y: 2, w: 4, h: 3 });
      expect(card).not.toHaveProperty('layout');
    });

    it("leaves Mushroom's string `layout: 'horizontal'` untouched on import (value-shape disambiguation)", () => {
      const card = importFirstCard(
        [
          'title: Mushroom',
          'views:',
          '  - title: V',
          '    path: v',
          '    cards:',
          '      - type: custom:mushroom-template-card',
          '        layout: horizontal',
        ].join('\n'),
      );
      expect(card.layout).toBe('horizontal');
      expect(card).not.toHaveProperty('_havdm_layout');
    });

    it("preserves Mushroom's `layout: 'horizontal'` through sanitizeForHA at the top level (fails on main)", () => {
      const config: DashboardConfig = {
        title: 'Mushroom Deploy',
        views: [
          {
            title: 'V',
            path: 'v',
            cards: [{ type: 'custom:mushroom-template-card', layout: 'horizontal' }],
          } as unknown as DashboardConfig['views'][number],
        ],
      } as unknown as DashboardConfig;

      const card = yamlService.sanitizeForHA(config).views[0]?.cards?.[0] as unknown as Record<
        string,
        unknown
      >;
      expect(card.layout).toBe('horizontal');
    });
  });
});
