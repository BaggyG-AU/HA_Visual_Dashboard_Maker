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

  // Slice B6: the TRANSLATE→card-mod class (haExportContract CARD_MOD_KEYS) is
  // compiled into a `card_mod: { style: <css> }` block that mirrors what the
  // HAVDM canvas renders — box keys (style/card_margin/card_padding) into an
  // `ha-card { … }` rule, layout keys (gap/align_items/justify_*/wrap/row_gap/
  // column_gap) into a `#root { … }` rule. sanitizeForHA runs the boundary with
  // card-mod ASSUMED PRESENT (the default; the reference instance has it).
  //
  // RED-BEFORE-GREEN: every "fails on main" assertion was confirmed red when the
  // B6 src (src/services/cardModTranslator.ts + the exportCard/exportDashboard
  // wiring in src/services/yamlConversionService.ts) is reverted in the same
  // checkout — on main the TRANSLATE keys pass through as inert bare keys and no
  // `card_mod` block is produced.
  describe('card-mod translate (B6)', () => {
    const config: DashboardConfig = {
      title: 'Translate',
      views: [
        {
          title: 'V',
          path: 'v',
          cards: [
            {
              type: 'horizontal-stack',
              gap: 12,
              align_items: 'center',
              justify_content: 'space-between',
              wrap: 'wrap',
              cards: [
                {
                  type: 'markdown',
                  content: 'inner',
                  style: 'background: red; border-radius: 8px;',
                  card_margin: 4,
                  card_padding: 8,
                },
              ],
            },
            {
              type: 'grid',
              row_gap: 6,
              column_gap: 10,
              align_items: 'start',
              justify_items: 'end',
              cards: [{ type: 'markdown', content: 'g' }],
            },
            {
              // expander-card's real `gap` option is a STRING — must survive.
              type: 'custom:expander-card',
              gap: '0.5em',
              cards: [{ type: 'markdown', content: 'e' }],
            },
          ],
        } as unknown as DashboardConfig['views'][number],
      ],
    } as unknown as DashboardConfig;

    const cardsOf = (cfg: DashboardConfig) =>
      yamlService.sanitizeForHA(cfg).views[0]?.cards as unknown as Record<string, unknown>[];

    it('compiles stack layout keys into a card_mod #root block (fails on main)', () => {
      const stack = cardsOf(config).find((c) => c.type === 'horizontal-stack') as Record<
        string,
        unknown
      >;
      const cardMod = stack.card_mod as { style: string } | undefined;
      expect(typeof cardMod?.style).toBe('string');
      expect(cardMod?.style).toContain('#root {');
      expect(cardMod?.style).toContain('gap: 12px;');
      expect(cardMod?.style).toContain('align-items: center;');
      expect(cardMod?.style).toContain('justify-content: space-between;');
      expect(cardMod?.style).toContain('flex-wrap: wrap;');
      // the raw TRANSLATE keys are removed
      expect(stack).not.toHaveProperty('gap');
      expect(stack).not.toHaveProperty('align_items');
      expect(stack).not.toHaveProperty('justify_content');
      expect(stack).not.toHaveProperty('wrap');
    });

    it('compiles style/margin/padding into ha-card, recursively (fails on main)', () => {
      const stack = cardsOf(config).find((c) => c.type === 'horizontal-stack') as {
        cards: Record<string, unknown>[];
      };
      const inner = stack.cards[0];
      const cardMod = inner.card_mod as { style: string } | undefined;
      expect(cardMod?.style).toContain('ha-card {');
      expect(cardMod?.style).toContain('background: red;');
      expect(cardMod?.style).toContain('border-radius: 8px;');
      expect(cardMod?.style).toContain('margin: 4px 4px 4px 4px;');
      expect(cardMod?.style).toContain('padding: 8px 8px 8px 8px;');
      expect(inner).not.toHaveProperty('style');
      expect(inner).not.toHaveProperty('card_margin');
      expect(inner).not.toHaveProperty('card_padding');
    });

    it('compiles grid gap/justify keys into #root, mapping start -> flex-start (fails on main)', () => {
      const grid = cardsOf(config).find((c) => c.type === 'grid') as Record<string, unknown>;
      const cardMod = grid.card_mod as { style: string } | undefined;
      expect(cardMod?.style).toContain('row-gap: 6px;');
      expect(cardMod?.style).toContain('column-gap: 10px;');
      expect(cardMod?.style).toContain('align-items: flex-start;');
      expect(cardMod?.style).toContain('justify-items: end;');
      expect(grid).not.toHaveProperty('row_gap');
      expect(grid).not.toHaveProperty('column_gap');
    });

    it("leaves expander-card's string `gap` option untouched (collision guard)", () => {
      const expander = cardsOf(config).find((c) => c.type === 'custom:expander-card') as Record<
        string,
        unknown
      >;
      expect(expander.gap).toBe('0.5em');
      expect(expander).not.toHaveProperty('card_mod');
    });

    it('does not add card_mod to cards without any TRANSLATE keys', () => {
      const plain: DashboardConfig = {
        title: 'Plain',
        views: [
          {
            title: 'V',
            path: 'v',
            cards: [{ type: 'markdown', content: 'nothing' }],
          } as unknown as DashboardConfig['views'][number],
        ],
      } as unknown as DashboardConfig;
      const card = cardsOf(plain)[0];
      expect(card).not.toHaveProperty('card_mod');
    });
  });

  // Slice B6b: the TRANSLATE→HA-native-`visibility` class (haExportContract
  // HA_VISIBILITY_KEYS: visibility_conditions + visibility_operator) is compiled
  // into HA's native card-level `visibility` array, mirroring HAVDM's own
  // evaluator (conditionalVisibility.ts). No capability gate — native HA feature.
  //
  // RED-BEFORE-GREEN: every "fails on main" assertion was confirmed red when the
  // B6b src (src/services/visibilityTranslator.ts + the exportCard wiring) is
  // reverted in the same checkout — on main the visibility keys pass through
  // untranslated and no `visibility` array is produced.
  describe('visibility translate (B6b)', () => {
    const cardsOf = (cfg: DashboardConfig) =>
      yamlService.sanitizeForHA(cfg).views[0]?.cards as unknown as Record<string, unknown>[];

    const wrap = (cards: Record<string, unknown>[]): DashboardConfig =>
      ({
        title: 'Vis',
        views: [{ title: 'V', path: 'v', cards } as unknown as DashboardConfig['views'][number]],
      }) as unknown as DashboardConfig;

    it('translates state_equals + default AND operator into native visibility (fails on main)', () => {
      const card = cardsOf(
        wrap([
          {
            type: 'markdown',
            content: 'x',
            visibility_conditions: [{ condition: 'state_equals', entity: 'light.a', value: 'on' }],
          },
        ]),
      )[0];
      expect(card.visibility).toEqual([{ condition: 'state', entity: 'light.a', state: 'on' }]);
      expect(card).not.toHaveProperty('visibility_conditions');
      expect(card).not.toHaveProperty('visibility_operator');
    });

    it('wraps an OR operator in a single or-group (fails on main)', () => {
      const card = cardsOf(
        wrap([
          {
            type: 'markdown',
            content: 'x',
            visibility_operator: 'or',
            visibility_conditions: [
              { condition: 'state_equals', entity: 'light.a', value: 'on' },
              { condition: 'state_equals', entity: 'light.b', value: 'on' },
            ],
          },
        ]),
      )[0];
      expect(card.visibility).toEqual([
        {
          condition: 'or',
          conditions: [
            { condition: 'state', entity: 'light.a', state: 'on' },
            { condition: 'state', entity: 'light.b', state: 'on' },
          ],
        },
      ]);
    });

    it('maps state_in + numeric + attribute conditions (fails on main)', () => {
      const card = cardsOf(
        wrap([
          {
            type: 'markdown',
            content: 'x',
            visibility_conditions: [
              { condition: 'state_in', entity: 'sensor.mode', values: ['home', 'away'] },
              {
                condition: 'attribute_greater_than',
                entity: 'sensor.t',
                attribute: 'temperature',
                value: 20,
              },
              {
                condition: 'attribute_equals',
                entity: 'climate.x',
                attribute: 'preset',
                value: 'eco',
              },
            ],
          },
        ]),
      )[0];
      expect(card.visibility).toEqual([
        { condition: 'state', entity: 'sensor.mode', state: ['home', 'away'] },
        { condition: 'numeric_state', entity: 'sensor.t', attribute: 'temperature', above: 20 },
        { condition: 'state', entity: 'climate.x', attribute: 'preset', state: 'eco' },
      ]);
    });

    it('recursively translates nested and/or groups (fails on main)', () => {
      const card = cardsOf(
        wrap([
          {
            type: 'markdown',
            content: 'x',
            visibility_conditions: [
              {
                condition: 'or',
                conditions: [
                  { condition: 'state_equals', entity: 'light.a', value: 'on' },
                  { condition: 'state_not_equals', entity: 'light.b', value: 'on' },
                ],
              },
            ],
          },
        ]),
      )[0];
      expect(card.visibility).toEqual([
        {
          condition: 'or',
          conditions: [
            { condition: 'state', entity: 'light.a', state: 'on' },
            { condition: 'state', entity: 'light.b', state_not: 'on' },
          ],
        },
      ]);
    });

    it('translates visibility on a NESTED card (recursion) (fails on main)', () => {
      const stack = cardsOf(
        wrap([
          {
            type: 'vertical-stack',
            cards: [
              {
                type: 'markdown',
                content: 'inner',
                visibility_conditions: [
                  { condition: 'state_equals', entity: 'light.a', value: 'on' },
                ],
              },
            ],
          },
        ]),
      )[0] as { cards: Record<string, unknown>[] };
      const inner = stack.cards[0];
      expect(inner.visibility).toEqual([{ condition: 'state', entity: 'light.a', state: 'on' }]);
      expect(inner).not.toHaveProperty('visibility_conditions');
    });
  });

  // Slice B7: CANVAS-ONLY phantom card TYPES (haExportContract
  // CANVAS_ONLY_CARD_TYPES) are substituted on export with a native `markdown`
  // "Card Not Available" placeholder that holds the slot (view_layout /
  // grid_options / layout_options carried over) — NOT `type: spacer`.
  //
  // RED-BEFORE-GREEN: every "fails on main" assertion was confirmed red when the
  // B7 src (src/services/canvasPlaceholderTranslator.ts + the exportCard wiring)
  // is reverted in the same checkout — on main the phantom type passes through
  // and would deploy as an unknown-card error tile.
  describe('canvas-only placeholder (B7)', () => {
    const cardsOf = (cfg: DashboardConfig) =>
      yamlService.sanitizeForHA(cfg).views[0]?.cards as unknown as Record<string, unknown>[];

    const wrap = (cards: Record<string, unknown>[]): DashboardConfig =>
      ({
        title: 'Phantom',
        views: [{ title: 'V', path: 'v', cards } as unknown as DashboardConfig['views'][number]],
      }) as unknown as DashboardConfig;

    it('substitutes custom:popup-card with a markdown placeholder holding the slot (fails on main)', () => {
      const card = cardsOf(
        wrap([
          {
            type: 'custom:popup-card',
            view_layout: { grid_area: 'a' },
            popup: { cards: [{ type: 'markdown', content: 'inside' }] },
          },
        ]),
      )[0];
      expect(card.type).toBe('markdown');
      expect(String(card.content)).toContain('Card Not Available');
      // slot-holding geometry preserved
      expect(card.view_layout).toEqual({ grid_area: 'a' });
      // the phantom type + its design-time children are gone
      expect(card).not.toHaveProperty('popup');
    });

    it('substitutes custom:native-graph-card (fails on main)', () => {
      const card = cardsOf(wrap([{ type: 'custom:native-graph-card', entity: 'sensor.x' }]))[0];
      expect(card.type).toBe('markdown');
      expect(String(card.content)).toContain('Card Not Available');
    });

    it('substitutes an entity-row offered as a standalone card (fails on main)', () => {
      const card = cardsOf(wrap([{ type: 'custom:multiple-entity-row', entity: 'sensor.x' }]))[0];
      expect(card.type).toBe('markdown');
      expect(String(card.content)).toContain('Card Not Available');
    });

    it('substitutes a NESTED phantom card (recursion) (fails on main)', () => {
      const stack = cardsOf(
        wrap([
          {
            type: 'vertical-stack',
            cards: [
              { type: 'markdown', content: 'real' },
              { type: 'custom:popup-card', popup: { cards: [] } },
            ],
          },
        ]),
      )[0] as { cards: Record<string, unknown>[] };
      expect(stack.cards[0].type).toBe('markdown');
      expect(String(stack.cards[0].content)).toBe('real');
      expect(stack.cards[1].type).toBe('markdown');
      expect(String(stack.cards[1].content)).toContain('Card Not Available');
    });

    it('leaves a REAL custom card untouched (not substituted)', () => {
      const card = cardsOf(wrap([{ type: 'custom:mushroom-entity-card', entity: 'light.a' }]))[0];
      expect(card.type).toBe('custom:mushroom-entity-card');
    });

    it('still DROPS spacer cards (B3), does not turn them into placeholders', () => {
      const cards = cardsOf(wrap([{ type: 'markdown', content: 'real' }, { type: 'spacer' }]));
      expect(cards).toHaveLength(1);
      expect(cards[0].type).toBe('markdown');
      expect(String(cards[0].content)).toBe('real');
    });
  });

  // Slice B8: the boundary now REPORTS what it did. sanitizeForHAWithReport
  // returns the collected card-mod/visibility/placeholder warnings + a warn-only
  // self-check; serializeForHA prepends a plain-language comment summary.
  //
  // RED-BEFORE-GREEN: the report method + the comment prepend do not exist on
  // main (confirmed by reverting src/services/yamlService.ts in the same
  // checkout — sanitizeForHAWithReport is undefined and serializeForHA emits no
  // summary comment).
  describe('export report + warning comment (B8)', () => {
    const config: DashboardConfig = {
      title: 'Report',
      views: [
        {
          title: 'V',
          path: 'v',
          cards: [
            // phantom type -> placeholder warning
            { type: 'custom:native-graph-card', entity: 'sensor.x' },
            // entity_exists -> visibility-approximated warning
            {
              type: 'markdown',
              content: 'x',
              visibility_conditions: [{ condition: 'entity_exists', entity: 'light.a' }],
            },
          ],
        } as unknown as DashboardConfig['views'][number],
      ],
    } as unknown as DashboardConfig;

    it('sanitizeForHAWithReport returns the collected warnings (fails on main)', () => {
      const report = yamlService.sanitizeForHAWithReport(config);
      expect(report.config).toBeTruthy();
      const reasons = report.warnings.map((w) => w.reason);
      expect(reasons).toContain('canvas-only-type');
      expect(reasons).toContain('visibility-approximated');
    });

    it('serializeForHA prepends a plain-language summary comment when the boundary adjusted anything (fails on main)', () => {
      const yaml = yamlService.serializeForHA(config);
      expect(yaml).toContain('# Home Assistant export summary');
      expect(yaml.split('\n')[0].startsWith('#')).toBe(true);
      // still valid YAML — the comment parses away, real content survives
      const parsed = yamlService.parseDashboard(yaml);
      expect(parsed.success).toBe(true);
      expect(parsed.data?.title).toBe('Report');
    });

    it('serializeForHA adds NO comment for a clean config', () => {
      const clean: DashboardConfig = {
        title: 'Clean',
        views: [
          {
            title: 'V',
            path: 'v',
            cards: [{ type: 'markdown', content: 'hi' }],
          } as unknown as DashboardConfig['views'][number],
        ],
      } as unknown as DashboardConfig;
      const yaml = yamlService.serializeForHA(clean);
      expect(yaml).not.toContain('# Home Assistant export summary');
    });
  });

  describe('sanitizeForHA — sections views (WS4-A)', () => {
    const sectionsConfig = (): DashboardConfig =>
      ({
        title: 'Sections Dashboard',
        views: [
          {
            title: 'Home',
            path: 'home',
            type: 'sections',
            max_columns: 3,
            sections: [
              {
                type: 'grid',
                title: 'Lights',
                cards: [{ type: 'entity', entity: 'light.living_room' }],
              },
            ],
          } as unknown as DashboardConfig['views'][number],
        ],
      }) as unknown as DashboardConfig;

    it('preserves the sections view type and its section cards (would deploy EMPTY otherwise)', () => {
      const sanitized = yamlService.sanitizeForHA(sectionsConfig());
      const view = sanitized.views[0] as any;
      expect(view.type).toBe('sections');
      expect(Array.isArray(view.sections)).toBe(true);
      expect(view.sections[0].cards[0]).toMatchObject({
        type: 'entity',
        entity: 'light.living_room',
      });
      // the section heading and the view-level layout key survive too
      expect(view.sections[0].title).toBe('Lights');
      expect(view.max_columns).toBe(3);
      // sections views render from `sections`, not a stray top-level empty `cards`
      expect(view).not.toHaveProperty('cards');
    });

    it('keeps the narrow scope: a HAVDM-internal view type is still stripped, gains no sections', () => {
      const cfg = {
        title: 'D',
        views: [
          {
            title: 'V',
            path: 'v',
            type: 'custom:grid-layout',
            cards: [{ type: 'markdown', content: 'hi' }],
          },
        ],
      } as unknown as DashboardConfig;
      const sanitized = yamlService.sanitizeForHA(cfg);
      expect(sanitized.views[0]).not.toHaveProperty('type');
      expect((sanitized.views[0] as any).sections).toBeUndefined();
    });
  });

  describe('sanitizeForHA — real HA view types (Tier 3)', () => {
    const viewConfig = (view: Record<string, unknown>): DashboardConfig =>
      ({
        title: 'D',
        views: [{ title: 'V', path: 'v', cards: [], ...view }],
      }) as unknown as DashboardConfig;

    it('preserves a panel view type (was silently flattened to masonry)', () => {
      const sanitized = yamlService.sanitizeForHA(viewConfig({ type: 'panel' }));
      expect(sanitized.views[0].type).toBe('panel');
    });

    it('preserves a sidebar view type', () => {
      const sanitized = yamlService.sanitizeForHA(viewConfig({ type: 'sidebar' }));
      expect(sanitized.views[0].type).toBe('sidebar');
    });

    it('preserves a layout-card custom:*-layout view type AND its layout config', () => {
      const sanitized = yamlService.sanitizeForHA(
        viewConfig({ type: 'custom:vertical-layout', layout: { width: 400, max_cols: 2 } }),
      );
      const view = sanitized.views[0] as any;
      expect(view.type).toBe('custom:vertical-layout');
      expect(view.layout).toEqual({ width: 400, max_cols: 2 });
    });

    it('still strips HAVDM internal custom:grid-layout scaffold (type + layout)', () => {
      const sanitized = yamlService.sanitizeForHA(
        viewConfig({
          type: 'custom:grid-layout',
          layout: { grid_template_columns: 'repeat(12, 1fr)' },
        }),
      );
      expect(sanitized.views[0]).not.toHaveProperty('type');
      expect(sanitized.views[0]).not.toHaveProperty('layout');
    });
  });
});
