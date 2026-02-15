import { describe, expect, it } from 'vitest';
import type { Action } from '../../src/types/actions';
import type { Phase6CardContracts } from '../../src/types/phase6';
import type { TemplateMetadata } from '../../src/types/templates';
import type { VisibilityCondition } from '../../src/types/logic';

describe('phase6 contract types', () => {
  it('supports shared action and logic contracts on cards', () => {
    const condition: VisibilityCondition = {
      condition: 'state_equals',
      entity: 'light.kitchen',
      value: 'on',
    };
    const tapAction: Action = { action: 'toggle' };
    const contract: Phase6CardContracts = {
      smart_defaults: true,
      tap_action: tapAction,
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'none' },
      visibility_conditions: [condition],
      visibility_operator: 'and',
      state_styles: [{ condition, style: { color: '#ffffff' }, priority: 10 }],
      trigger_animations: [{ trigger: 'state-change', animation: 'pulse', duration_ms: 240 }],
    };

    expect(contract.tap_action?.action).toBe('toggle');
    expect(contract.visibility_conditions?.[0]).toEqual(condition);
    expect(contract.trigger_animations?.[0].animation).toBe('pulse');
  });

  it('supports unified template metadata contracts', () => {
    const metadata: TemplateMetadata = {
      templates: [{
        id: 'home-overview',
        name: 'Home Overview',
        description: 'Main dashboard',
        category: 'overview',
        difficulty: 'beginner',
        file: 'home-overview.yaml',
        features: ['overview'],
        requiredEntities: ['light.kitchen'],
        tags: ['home'],
      }],
      categories: [{
        id: 'overview',
        name: 'Overview',
        description: 'General purpose templates',
        icon: 'mdi:view-dashboard',
      }],
    };

    expect(metadata.templates).toHaveLength(1);
    expect(metadata.categories[0].id).toBe('overview');
  });
});
