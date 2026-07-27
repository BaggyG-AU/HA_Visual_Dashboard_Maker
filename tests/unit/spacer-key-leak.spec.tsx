/**
 * Regression tests for the v1.0.0 UAT round-1 "every card turns into a Spacer"
 * defect — CLIP-01, CLIP-02, CLIP-04 and PROPS-01, all rated High.
 *
 * Two bugs compounded, and either one alone is harmless:
 *
 *  (a) BaseCard asked `'_isSpacer' in card` — a PRESENCE check where a
 *      TRUTHINESS check is meant.
 *  (b) PropertiesPanel spread `form.getFieldsValue(true)` straight onto the
 *      card. antd keeps a "cleared" key in its store with the value undefined,
 *      so that spread re-attached keys belonging to previously-selected cards.
 *
 * Both are covered here, plus the antd behaviour the whole thing rests on — so
 * if a future antd upgrade ever starts genuinely deleting cleared keys, we find
 * out from a named test rather than from a UAT round.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';
import { Form } from 'antd';
import { BaseCard } from '../../src/components/BaseCard';
import { HAEntityProvider } from '../../src/contexts/HAEntityContext';
import { mergeFormValuesIntoCard } from '../../src/utils/mergeFormValuesIntoCard';
import type { Card } from '../../src/types/dashboard';

const SPACER_LABEL = 'Spacer (Empty)';

// BaseCard reads useHAEntities, which throws outside its provider. `enabled`
// false keeps it from opening a connection — these tests are about the spacer
// predicate, not about entity state.
const renderCard = (card: Card) =>
  render(
    <HAEntityProvider enabled={false}>
      <BaseCard card={card} isSelected />
    </HAEntityProvider>,
  );

describe('the antd behaviour this defect rests on', () => {
  it('keeps a cleared key in the form store, with the value undefined', () => {
    const { result } = renderHook(() => Form.useForm());
    const [form] = result.current;

    // Stand in for "the spacer card was selected": the store gains _isSpacer.
    form.setFieldsValue({ name: 'Spacer', _isSpacer: true });
    // Stand in for applyCardValuesToForm clearing what the next card lacks.
    form.setFieldsValue({ _isSpacer: undefined });

    const values = form.getFieldsValue(true) as Record<string, unknown>;

    // ⭐ The whole defect in two assertions: it LOOKS gone and it is NOT gone.
    expect(values._isSpacer).toBeUndefined();
    expect('_isSpacer' in values).toBe(true);
    expect(JSON.stringify(values)).not.toContain('_isSpacer');
  });
});

describe('mergeFormValuesIntoCard', () => {
  it('does not introduce an undefined key the card never had', () => {
    const card = { type: 'markdown', content: '# My card' };
    const values = { content: '# My card\n\nStuff', _isSpacer: undefined };

    const merged = mergeFormValuesIntoCard(card, values);

    // ⭐ The regression: presence, not value, is what BaseCard reacted to.
    expect('_isSpacer' in merged).toBe(false);
    expect(merged).toEqual({ type: 'markdown', content: '# My card\n\nStuff' });
  });

  it('still writes undefined through for a key the card DOES own', () => {
    // Clearing a Select in antd yields undefined. That must keep working, or
    // "remove the icon" would silently do nothing.
    const card = { type: 'button', icon: 'mdi:lightbulb' };

    const merged = mergeFormValuesIntoCard(card, { icon: undefined });

    expect('icon' in merged).toBe(true);
    expect(merged.icon).toBeUndefined();
  });

  it('preserves a genuine spacer', () => {
    const card = { type: 'spacer', _isSpacer: true };

    const merged = mergeFormValuesIntoCard(card, { _isSpacer: true });

    expect(merged._isSpacer).toBe(true);
  });

  it('does not mutate the card it was given', () => {
    const card = { type: 'markdown', content: 'a' };
    const before = { ...card };

    mergeFormValuesIntoCard(card, { content: 'b', _isSpacer: undefined });

    expect(card).toEqual(before);
  });
});

describe('BaseCard spacer detection', () => {
  it('renders a real spacer as a spacer (type: spacer)', () => {
    renderCard({ type: 'spacer' } as Card);
    expect(screen.getByText(SPACER_LABEL)).toBeInTheDocument();
  });

  it('renders a real spacer as a spacer (_isSpacer: true)', () => {
    renderCard({ type: 'spacer', _isSpacer: true } as Card);
    expect(screen.getByText(SPACER_LABEL)).toBeInTheDocument();
  });

  it('does NOT treat a card carrying _isSpacer: undefined as a spacer', () => {
    // ⭐ This is the UAT defect, reduced to one assertion. Before the fix the
    // markdown card below rendered as "Spacer (Empty)" on the canvas while its
    // config — and its YAML — were completely intact, which is why going into
    // the YAML tab and back appeared to "heal" it.
    const card = {
      type: 'markdown',
      content: '# My card',
      _isSpacer: undefined,
    } as unknown as Card;

    renderCard(card);

    expect(screen.queryByText(SPACER_LABEL)).not.toBeInTheDocument();
  });

  it('does NOT treat _isSpacer: false as a spacer either', () => {
    const card = { type: 'markdown', content: '# My card', _isSpacer: false } as unknown as Card;

    renderCard(card);

    expect(screen.queryByText(SPACER_LABEL)).not.toBeInTheDocument();
  });
});

describe('the two bugs together — the actual UAT reproduction', () => {
  it('editing a markdown card after a spacer was selected leaves it a markdown card', () => {
    // 1. The tester opens sample-dashboard.yaml, whose FIRST card in the FIRST
    //    view is `type: spacer / _isSpacer: true`, and selects it.
    const { result } = renderHook(() => Form.useForm());
    const [form] = result.current;
    form.setFieldsValue({ type: 'spacer', _isSpacer: true });

    // 2. They select the markdown card. applyCardValuesToForm clears the keys
    //    the new card does not have — which leaves _isSpacer present-undefined.
    form.setFieldsValue({ _isSpacer: undefined });
    form.setFieldsValue({ type: 'markdown', content: '# My card' });

    // 3. They type into Content, and handleValuesChange merges the store.
    form.setFieldsValue({ content: '# My card\n\nStuff' });
    const markdownCard = { type: 'markdown', content: '# My card' } as Card;
    const updated = mergeFormValuesIntoCard(
      markdownCard,
      form.getFieldsValue(true) as Record<string, unknown>,
    );

    // 4. The canvas renders it. Before the fix: "Spacer (Empty)".
    renderCard(updated);

    expect(screen.queryByText(SPACER_LABEL)).not.toBeInTheDocument();
    expect((updated as { content?: string }).content).toBe('# My card\n\nStuff');
  });
});
