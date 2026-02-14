import { describe, expect, it } from 'vitest';
import type { Card } from '../../src/types/dashboard';
import {
  getExpanderNestingDepth,
  normalizeExpanderConfig,
  validateExpanderNestingDepth,
} from '../../src/features/accordion/accordionService';
import type { ExpanderCardConfig } from '../../src/features/accordion/types';

const makeCard = (overrides: Partial<ExpanderCardConfig> = {}): ExpanderCardConfig => ({
  type: 'custom:expander-card',
  ...overrides,
});

describe('accordionService', () => {
  it('normalizes upstream defaults', () => {
    const config = normalizeExpanderConfig(makeCard({}));

    expect(config.title).toBe('');
    expect(config.cards).toEqual([]);
    expect(config.expanded).toBe(false);
    expect(config.expandedIcon).toBe('mdi:chevron-up');
    expect(config.collapsedIcon).toBe('mdi:chevron-down');
    expect(config.gap).toBe('0.6em');
    expect(config.padding).toBe('0');
    expect(config.clear).toBe(false);
    expect(config.overlayMargin).toBe('2em');
    expect(config.childPadding).toBe('0');
  });

  it('normalizes title-card variant', () => {
    const titleCard: Card = {
      type: 'entities',
      entities: ['light.living_room'],
    } as unknown as Card;

    const config = normalizeExpanderConfig(makeCard({
      'title-card': titleCard,
      'title-card-button-overlay': true,
      cards: [{ type: 'button', entity: 'switch.tv' } as unknown as Card],
    }));

    expect(config.title).toBe('');
    expect(config.titleCard).toEqual(titleCard);
    expect(config.titleCardButtonOverlay).toBe(true);
    expect(config.cards).toHaveLength(1);
  });

  it('keeps explicit upstream values', () => {
    const config = normalizeExpanderConfig(makeCard({
      title: 'My Section',
      expanded: true,
      gap: '1em',
      padding: '8px',
      'expanded-icon': 'mdi:chevron-up',
      'collapsed-icon': 'mdi:chevron-down',
      'button-background': 'rgba(0,0,0,0.3)',
      cards: [
        { type: 'button', entity: 'light.living_room' } as unknown as Card,
        { type: 'entities', entities: ['sensor.temperature'] } as unknown as Card,
      ],
    }));

    expect(config.title).toBe('My Section');
    expect(config.expanded).toBe(true);
    expect(config.gap).toBe('1em');
    expect(config.padding).toBe('8px');
    expect(config.expandedIcon).toBe('mdi:chevron-up');
    expect(config.collapsedIcon).toBe('mdi:chevron-down');
    expect(config.buttonBackground).toBe('rgba(0,0,0,0.3)');
    expect(config.cards).toHaveLength(2);
  });

  it('calculates and validates nesting depth at max 3 levels', () => {
    const level3: Card = {
      type: 'custom:expander-card',
      cards: [],
    } as unknown as Card;

    const level2: Card = {
      type: 'custom:expander-card',
      cards: [level3],
    } as unknown as Card;

    const level1: Card = {
      type: 'custom:expander-card',
      cards: [level2],
    } as unknown as Card;

    const level4: Card = {
      type: 'custom:expander-card',
      cards: [
        {
          type: 'custom:expander-card',
          cards: [level1],
        } as unknown as Card,
      ],
    } as unknown as Card;

    expect(getExpanderNestingDepth(level1)).toBe(3);
    expect(validateExpanderNestingDepth(level1)).toBe(true);
    expect(validateExpanderNestingDepth(level4)).toBe(false);
  });
});
