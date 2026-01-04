import { describe, it, expect, beforeEach } from 'vitest';
import { yamlService } from '../../src/services/yamlService';
import { useEditorModeStore } from '../../src/store/editorModeStore';
import { DashboardConfig } from '../../src/types/dashboard';

describe('Advanced YAML Editor - Round-Trip Serialization', () => {
  const sampleDashboard: DashboardConfig = {
    title: 'Test Dashboard',
    views: [
      {
        title: 'Home',
        path: 'home',
        type: 'custom:grid-layout',
        layout: {
          grid_template_columns: 'repeat(12, 1fr)',
          grid_template_rows: 'repeat(auto-fill, 56px)',
          grid_gap: '8px',
        },
        cards: [
          {
            type: 'entities',
            title: 'Test Card',
            entities: ['light.living_room', 'switch.kitchen'],
            layout: {
              x: 0,
              y: 0,
              w: 6,
              h: 4,
            },
          },
          {
            type: 'button',
            entity: 'light.bedroom',
            name: 'Bedroom Light',
            layout: {
              x: 6,
              y: 0,
              w: 3,
              h: 2,
            },
          },
        ],
      },
    ],
  };

  describe('YAML Serialization', () => {
    it('should serialize dashboard to valid YAML', () => {
      const yaml = yamlService.serializeDashboard(sampleDashboard);

      expect(yaml).toBeTruthy();
      expect(yaml).toContain('title: Test Dashboard');
      expect(yaml).toContain('views:');
      expect(yaml).toContain('type: entities');
      expect(yaml).toContain('type: button');
    });

    it('should preserve indentation (2 spaces)', () => {
      const yaml = yamlService.serializeDashboard(sampleDashboard);

      // Check for 2-space indentation (views is top-level, so no leading spaces)
      expect(yaml).toContain('views:');
      expect(yaml).toContain('  - title: Home');
      expect(yaml).toContain('    cards:');
    });

    it('should preserve array structures', () => {
      const yaml = yamlService.serializeDashboard(sampleDashboard);

      expect(yaml).toContain('entities:');
      expect(yaml).toContain('- light.living_room');
      expect(yaml).toContain('- switch.kitchen');
    });
  });

  describe('YAML Parsing', () => {
    it('should parse serialized YAML back to config', () => {
      const yaml = yamlService.serializeDashboard(sampleDashboard);
      const result = yamlService.parseDashboard(yaml);

      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
      expect(result.data?.title).toBe('Test Dashboard');
      expect(result.data?.views).toHaveLength(1);
      expect(result.data?.views[0].cards).toHaveLength(2);
    });

    it('should reject invalid YAML syntax', () => {
      const invalidYaml = 'title: Test\n  bad indentation:';
      const result = yamlService.parseDashboard(invalidYaml);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject YAML without views array', () => {
      const invalidYaml = 'title: Test Dashboard\ntheme: default';
      const result = yamlService.parseDashboard(invalidYaml);

      expect(result.success).toBe(false);
      expect(result.error).toContain('views');
    });
  });

  describe('Round-Trip Consistency', () => {
    it('should maintain dashboard structure through serialize → parse cycle', () => {
      const yaml1 = yamlService.serializeDashboard(sampleDashboard);
      const parsed = yamlService.parseDashboard(yaml1);

      expect(parsed.success).toBe(true);
      expect(parsed.data).toBeTruthy();

      if (!parsed.data) {
        throw new Error('Expected parsed.data to be defined');
      }

      const yaml2 = yamlService.serializeDashboard(parsed.data);
      const parsed2 = yamlService.parseDashboard(yaml2);

      expect(parsed2.success).toBe(true);
      expect(parsed2.data).toEqual(parsed.data);
    });

    it('should preserve card layout properties', () => {
      const yaml = yamlService.serializeDashboard(sampleDashboard);
      const result = yamlService.parseDashboard(yaml);

      expect(result.success).toBe(true);
      const cards = result.data?.views[0].cards;
      expect(cards).toBeDefined();
      if (!cards) {
        throw new Error('Expected cards to be defined');
      }
      const card = cards[0];

      expect(card).toHaveProperty('layout');
      expect(card.layout).toEqual({
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      });
    });

    it('should preserve view layout configuration', () => {
      const yaml = yamlService.serializeDashboard(sampleDashboard);
      const result = yamlService.parseDashboard(yaml);

      expect(result.success).toBe(true);
      const view = result.data?.views[0];

      expect(view).toHaveProperty('layout');
      expect(view.layout).toEqual({
        grid_template_columns: 'repeat(12, 1fr)',
        grid_template_rows: 'repeat(auto-fill, 56px)',
        grid_gap: '8px',
      });
    });

    it('should handle empty cards array', () => {
      const emptyDashboard: DashboardConfig = {
        title: 'Empty Dashboard',
        views: [
          {
            title: 'Empty View',
            path: 'empty',
            cards: [],
          },
        ],
      };

      const yaml = yamlService.serializeDashboard(emptyDashboard);
      const result = yamlService.parseDashboard(yaml);

      expect(result.success).toBe(true);
      expect(result.data?.views[0].cards).toEqual([]);
    });
  });

  describe('YAML Formatting', () => {
    it('should format YAML with consistent indentation', () => {
      const messyYaml = `title:  Test Dashboard
views:
- title: Home
  cards:
    - type: entities
      entities: [ light.test ]`;

      const formatted = yamlService.formatYAML(messyYaml);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain('title: Test Dashboard');
      expect(formatted).toContain('  - title: Home');
    });

    it('should return null for invalid YAML during formatting', () => {
      const invalidYaml = 'title: [invalid';
      const formatted = yamlService.formatYAML(invalidYaml);

      expect(formatted).toBeNull();
    });
  });

  describe('YAML Validation', () => {
    it('should validate correct YAML syntax', () => {
      const validYaml = yamlService.serializeDashboard(sampleDashboard);
      const result = yamlService.validateYAMLSyntax(validYaml);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect invalid YAML syntax', () => {
      const invalidYaml = 'title: [unclosed array';
      const result = yamlService.validateYAMLSyntax(invalidYaml);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should provide line number for syntax errors', () => {
      const invalidYaml = 'title: Test\nviews:\n  - bad: [unclosed';
      const result = yamlService.validateYAMLSyntax(invalidYaml);

      expect(result.valid).toBe(false);
      expect(result.lineNumber).toBeGreaterThan(0);
    });
  });
});

describe('Editor Mode Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useEditorModeStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should start in visual mode', () => {
      const { mode } = useEditorModeStore.getState();
      expect(mode).toBe('visual');
    });

    it('should have synced status initially', () => {
      const { syncStatus } = useEditorModeStore.getState();
      expect(syncStatus).toBe('synced');
    });

    it('should have no validation errors initially', () => {
      const { validationError } = useEditorModeStore.getState();
      expect(validationError).toBeNull();
    });

    it('should have no pending changes initially', () => {
      const { pendingYaml } = useEditorModeStore.getState();
      expect(pendingYaml).toBeNull();
    });
  });

  describe('Mode Switching', () => {
    it('should switch to split mode', () => {
      const { setMode } = useEditorModeStore.getState();
      setMode('split');

      const { mode } = useEditorModeStore.getState();
      expect(mode).toBe('split');
    });

    it('should switch to code mode', () => {
      const { setMode } = useEditorModeStore.getState();
      setMode('code');

      const { mode } = useEditorModeStore.getState();
      expect(mode).toBe('code');
    });

    it('should switch back to visual mode', () => {
      const { setMode } = useEditorModeStore.getState();

      setMode('split');
      setMode('visual');

      const { mode } = useEditorModeStore.getState();
      expect(mode).toBe('visual');
    });
  });

  describe('Sync Status Management', () => {
    it('should update sync status to pending-code', () => {
      const { setSyncStatus } = useEditorModeStore.getState();
      setSyncStatus('pending-code');

      const { syncStatus } = useEditorModeStore.getState();
      expect(syncStatus).toBe('pending-code');
    });

    it('should update sync status to error', () => {
      const { setSyncStatus } = useEditorModeStore.getState();
      setSyncStatus('error');

      const { syncStatus } = useEditorModeStore.getState();
      expect(syncStatus).toBe('error');
    });

    it('should clear sync status with clearPending', () => {
      const { setSyncStatus, clearPending } = useEditorModeStore.getState();

      setSyncStatus('pending-code');
      clearPending();

      const { syncStatus } = useEditorModeStore.getState();
      expect(syncStatus).toBe('synced');
    });
  });

  describe('Pending Changes', () => {
    it('should set pending YAML', () => {
      const { setPendingYaml } = useEditorModeStore.getState();
      const yaml = 'title: Test\nviews: []';

      setPendingYaml(yaml);

      const { pendingYaml } = useEditorModeStore.getState();
      expect(pendingYaml).toBe(yaml);
    });

    it('should clear pending YAML', () => {
      const { setPendingYaml, clearPending } = useEditorModeStore.getState();

      setPendingYaml('title: Test');
      clearPending();

      const { pendingYaml } = useEditorModeStore.getState();
      expect(pendingYaml).toBeNull();
    });
  });

  describe('Validation Error Management', () => {
    it('should set validation error', () => {
      const { setValidationError } = useEditorModeStore.getState();
      const error = 'Invalid YAML syntax';

      setValidationError(error);

      const { validationError } = useEditorModeStore.getState();
      expect(validationError).toBe(error);
    });

    it('should clear validation error', () => {
      const { setValidationError } = useEditorModeStore.getState();

      setValidationError('Error');
      setValidationError(null);

      const { validationError } = useEditorModeStore.getState();
      expect(validationError).toBeNull();
    });
  });

  describe('Last Valid State', () => {
    const validYaml = 'title: Test\nviews: []';
    const validConfig: DashboardConfig = {
      title: 'Test',
      views: [],
    };

    it('should store last valid YAML', () => {
      const { setLastValidYaml } = useEditorModeStore.getState();

      setLastValidYaml(validYaml);

      const { lastValidYaml } = useEditorModeStore.getState();
      expect(lastValidYaml).toBe(validYaml);
    });

    it('should store last valid config', () => {
      const { setLastValidConfig } = useEditorModeStore.getState();

      setLastValidConfig(validConfig);

      const { lastValidConfig } = useEditorModeStore.getState();
      expect(lastValidConfig).toEqual(validConfig);
    });

    it('should rollback to last valid state', () => {
      const { setLastValidYaml, setLastValidConfig, rollbackToLastValid } = useEditorModeStore.getState();

      setLastValidYaml(validYaml);
      setLastValidConfig(validConfig);

      const result = rollbackToLastValid();

      expect(result.yaml).toBe(validYaml);
      expect(result.config).toEqual(validConfig);
    });
  });

  describe('Card Jump Selection', () => {
    it('should set selected card for YAML jump', () => {
      const { setSelectedCardForYamlJump } = useEditorModeStore.getState();
      const selection = { viewIndex: 0, cardIndex: 2 };

      setSelectedCardForYamlJump(selection);

      const { selectedCardForYamlJump } = useEditorModeStore.getState();
      expect(selectedCardForYamlJump).toEqual(selection);
    });

    it('should clear selected card for YAML jump', () => {
      const { setSelectedCardForYamlJump } = useEditorModeStore.getState();

      setSelectedCardForYamlJump({ viewIndex: 0, cardIndex: 1 });
      setSelectedCardForYamlJump(null);

      const { selectedCardForYamlJump } = useEditorModeStore.getState();
      expect(selectedCardForYamlJump).toBeNull();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state to initial values', () => {
      const {
        setMode,
        setSyncStatus,
        setPendingYaml,
        setValidationError,
        setLastValidYaml,
        reset,
      } = useEditorModeStore.getState();

      // Modify all state
      setMode('split');
      setSyncStatus('error');
      setPendingYaml('test');
      setValidationError('error');
      setLastValidYaml('yaml');

      // Reset
      reset();

      // Verify reset
      const state = useEditorModeStore.getState();
      expect(state.mode).toBe('visual');
      expect(state.syncStatus).toBe('synced');
      expect(state.pendingYaml).toBeNull();
      expect(state.validationError).toBeNull();
      expect(state.lastValidYaml).toBeNull();
    });
  });
});
