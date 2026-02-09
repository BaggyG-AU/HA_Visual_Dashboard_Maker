import { describe, expect, it } from 'vitest';
import type { Card } from '../../src/types/dashboard';
import {
  getDefaultExpandedSections,
  normalizeAccordionConfig,
  setAllSectionsExpanded,
  toggleAccordionSection,
  validateAccordionNestingDepth,
} from '../../src/features/accordion/accordionService';
import type { AccordionCardConfig } from '../../src/features/accordion/types';

const makeCard = (overrides: Partial<AccordionCardConfig> = {}): AccordionCardConfig => ({
  type: 'custom:accordion-card',
  ...overrides,
});

describe('accordionService', () => {
  it('normalizes defaults and section fallbacks', () => {
    const config = normalizeAccordionConfig(makeCard({ sections: [{}] }));

    expect(config.expand_mode).toBe('single');
    expect(config.style).toBe('bordered');
    expect(config.content_padding).toBe(12);
    expect(config.sections[0]).toMatchObject({
      title: 'Section 1',
      icon: 'mdi:folder-outline',
      default_expanded: false,
    });
  });

  it('enforces single-expand defaults to one section', () => {
    const config = normalizeAccordionConfig(makeCard({
      expand_mode: 'single',
      sections: [
        { title: 'One', default_expanded: true },
        { title: 'Two', default_expanded: true },
      ],
    }));

    expect(config.sections.filter((section) => section.default_expanded)).toHaveLength(1);
    expect(getDefaultExpandedSections(config)).toEqual([0]);
  });

  it('allows all sections collapsed in single mode when none are default-expanded', () => {
    const config = normalizeAccordionConfig(makeCard({
      expand_mode: 'single',
      sections: [
        { title: 'One', default_expanded: false },
        { title: 'Two', default_expanded: false },
      ],
    }));

    expect(getDefaultExpandedSections(config)).toEqual([]);
  });

  it('supports multi-expand default indexes', () => {
    const config = normalizeAccordionConfig(makeCard({
      expand_mode: 'multi',
      sections: [
        { title: 'One', default_expanded: true },
        { title: 'Two', default_expanded: false },
        { title: 'Three', default_expanded: true },
      ],
    }));

    expect(getDefaultExpandedSections(config)).toEqual([0, 2]);
  });

  it('toggles section expansion by mode', () => {
    const single = toggleAccordionSection(new Set([0]), 1, 'single');
    expect([...single]).toEqual([1]);

    const multi = toggleAccordionSection(new Set([0]), 1, 'multi');
    expect([...multi].sort((a, b) => a - b)).toEqual([0, 1]);
  });

  it('expands and collapses all sections with mode semantics', () => {
    expect([...setAllSectionsExpanded(3, true, 'multi')]).toEqual([0, 1, 2]);
    expect([...setAllSectionsExpanded(3, true, 'single')]).toEqual([0]);
    expect([...setAllSectionsExpanded(3, false, 'multi')]).toEqual([]);
  });

  it('validates nesting depth at max 3 levels', () => {
    const level3: Card = {
      type: 'custom:accordion-card',
      sections: [{ title: 'Level 3', cards: [] }],
    } as unknown as Card;

    const level2: Card = {
      type: 'custom:accordion-card',
      sections: [{ title: 'Level 2', cards: [level3] }],
    } as unknown as Card;

    const level1: Card = {
      type: 'custom:accordion-card',
      sections: [{ title: 'Level 1', cards: [level2] }],
    } as unknown as Card;

    const level4: Card = {
      type: 'custom:accordion-card',
      sections: [{
        title: 'Level 0',
        cards: [
          {
            type: 'custom:accordion-card',
            sections: [{ title: 'L1', cards: [level1] }],
          } as unknown as Card,
        ],
      }],
    } as unknown as Card;

    expect(validateAccordionNestingDepth(level1)).toBe(true);
    expect(validateAccordionNestingDepth(level4)).toBe(false);
  });
});
