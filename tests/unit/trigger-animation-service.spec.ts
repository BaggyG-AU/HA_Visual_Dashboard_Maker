import { describe, expect, it } from 'vitest';
import type { Card } from '../../src/types/dashboard';
import type { EntityStates } from '../../src/services/haWebSocketService';
import {
  buildStateChangeSnapshot,
  normalizeTriggerAnimations,
  resolveStateChangeTrigger,
  resolveTriggerAnimation,
  toAnimationKeyframes,
  toAnimationTiming,
} from '../../src/services/triggerAnimationService';

const ENTITIES: EntityStates = {
  'light.kitchen': {
    entity_id: 'light.kitchen',
    state: 'off',
    attributes: {},
    last_changed: '2026-01-01T00:00:00.000Z',
    last_updated: '2026-01-01T00:00:00.000Z',
    context: { id: '1', parent_id: null, user_id: null },
  },
  'switch.garage': {
    entity_id: 'switch.garage',
    state: 'on',
    attributes: {},
    last_changed: '2026-01-01T00:00:00.000Z',
    last_updated: '2026-01-01T00:00:00.000Z',
    context: { id: '2', parent_id: null, user_id: null },
  },
};

describe('triggerAnimationService', () => {
  it('normalizes trigger animation configs with bounded defaults', () => {
    const normalized = normalizeTriggerAnimations([
      {
        trigger: 'state-change',
        animation: 'pulse',
        duration_ms: 100000,
        iterations: 100,
        easing: 'linear',
      },
      {
        trigger: 'action',
        animation: 'not valid keyframes name!',
        duration_ms: -10,
      },
      {
        trigger: 'manual',
        animation: 'bounce',
        iterations: 'infinite',
      },
      {
        trigger: 'invalid',
        animation: 'pulse',
      },
    ]);

    expect(normalized).toHaveLength(3);
    expect(normalized[0]).toMatchObject({
      trigger: 'state-change',
      animationName: 'havdm-trigger-pulse',
      durationMs: 5000,
      iterations: 10,
      easing: 'linear',
    });
    expect(normalized[1]).toMatchObject({
      trigger: 'action',
      animationName: 'havdm-trigger-pulse',
      durationMs: 80,
      iterations: 1,
      easing: 'ease-out',
    });
    expect(normalized[2]).toMatchObject({
      trigger: 'manual',
      animationName: 'havdm-trigger-bounce',
      iterations: 1,
    });
  });

  it('detects state-change triggers deterministically after baseline snapshot', () => {
    const card = { type: 'button', entity: 'light.kitchen' } as Card;
    const configs = normalizeTriggerAnimations([
      { id: 'one', trigger: 'state-change', animation: 'pulse' },
      { id: 'two', trigger: 'state-change', animation: 'flash', target: 'switch.garage' },
    ]);

    const firstPass = resolveStateChangeTrigger(card, configs, ENTITIES, {});
    expect(firstPass.triggered).toBeNull();

    const updatedEntities: EntityStates = {
      ...ENTITIES,
      'light.kitchen': {
        ...ENTITIES['light.kitchen'],
        state: 'on',
      },
    };

    const secondPass = resolveStateChangeTrigger(card, configs, updatedEntities, firstPass.nextSnapshots);
    expect(secondPass.triggered?.id).toBe('one');

    const thirdEntities: EntityStates = {
      ...updatedEntities,
      'switch.garage': {
        ...ENTITIES['switch.garage'],
        state: 'off',
      },
    };

    const thirdPass = resolveStateChangeTrigger(card, configs, thirdEntities, secondPass.nextSnapshots);
    expect(thirdPass.triggered?.id).toBe('two');
  });

  it('uses fallback card entity selection for state snapshots', () => {
    const card = {
      type: 'entities',
      entities: [{ entity: 'switch.garage' }],
    } as Card;
    const [config] = normalizeTriggerAnimations([{ trigger: 'state-change', animation: 'pulse' }]);

    expect(buildStateChangeSnapshot(card, config, ENTITIES)).toBe('on');
  });

  it('resolves action trigger animation and creates keyframes/timing', () => {
    const configs = normalizeTriggerAnimations([
      { trigger: 'state-change', animation: 'pulse' },
      { trigger: 'action', animation: 'shake', duration_ms: 420, easing: 'ease-in' },
    ]);

    const action = resolveTriggerAnimation(configs, 'action');
    expect(action).not.toBeNull();
    expect(action?.animationName).toBe('havdm-trigger-shake');

    const keyframes = toAnimationKeyframes(action!.animationName);
    expect(keyframes.length).toBeGreaterThan(0);

    const timing = toAnimationTiming(action!);
    expect(timing.duration).toBe(420);
    expect(timing.easing).toBe('ease-in');
    expect(timing.iterations).toBe(1);
  });
});
