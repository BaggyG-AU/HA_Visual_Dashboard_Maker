import { describe, expect, it } from 'vitest';
import {
  BULK_SHOWN_FROM_NOTE,
  BULK_UNTOUCHED_NOTE,
  describeBulkSelection,
  describeBulkTypeSkip,
} from '../../src/utils/bulkEditDisclosure';

describe('bulk edit disclosure wording', () => {
  it('states how many cards the edit will land on', () => {
    expect(describeBulkSelection(2)).toBe('Editing 2 selected cards');
    expect(describeBulkSelection(3)).toBe('Editing 3 selected cards');
  });

  // The type guard is deliberate (owner decision 2026-08-02, option C1: keep
  // the guard, disclose it). What was wrong was that it happened in silence.
  it('names which cards a mixed-type selection will and will not change', () => {
    expect(describeBulkTypeSkip(2, 3, 'Button')).toBe(
      '2 of 3 are Button cards and will change. The other card is a different type and will not.',
    );
    expect(describeBulkTypeSkip(1, 3, 'Markdown')).toBe(
      '1 of 3 is a Markdown card and will change. The other 2 cards are a different type and will not.',
    );
  });

  // ⭐ A notice that fires when nothing is being skipped spends the user's
  // attention for no information — the same argument that killed the
  // over-eager save prompt in FILE-04.
  it('says nothing when every selected card shares the edited card’s type', () => {
    expect(describeBulkTypeSkip(3, 3, 'Button')).toBeNull();
    expect(describeBulkTypeSkip(1, 1, 'Button')).toBeNull();
  });

  it('never reports a negative skip count', () => {
    expect(describeBulkTypeSkip(4, 3, 'Button')).toBeNull();
  });

  // These two are the honesty half of CLIP-04: the form shows ONE card's values
  // while the write may reach several, so the panel has to say which is which.
  it('discloses that untouched fields keep each card’s own value', () => {
    expect(BULK_UNTOUCHED_NOTE).toContain('Only the fields you change are applied');
    expect(BULK_SHOWN_FROM_NOTE).toContain('last-clicked card');
  });
});
