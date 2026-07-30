/**
 * Unit tests for the shared entity-insertion decision (UAT card YAML-05).
 *
 * The defect this guards: Monaco reports a caret at (1,1) when an editor has
 * NEVER been focused — it does NOT return null — so a `getSelection() ??
 * getFullModelRange()` fallback never fires, and inserting "at the selection"
 * silently prepends to line 1. Most of these are CONTROL LEGS: the working path
 * must stay working, and every refusal must be a refusal rather than a guess.
 */
import { describe, it, expect } from 'vitest';
import {
  decideEntityInsertion,
  NO_CURSOR_REFUSAL,
  type EditorRange,
} from '../../src/utils/entityInsertion';

const caretAt = (line: number, column: number): EditorRange => ({
  startLineNumber: line,
  startColumn: column,
  endLineNumber: line,
  endColumn: column,
});

describe('decideEntityInsertion', () => {
  it('refuses when the user has never placed a cursor, even though Monaco reports a caret', () => {
    // This is the exact shape Monaco returns for a never-focused editor.
    const decision = decideEntityInsertion(false, caretAt(1, 1));

    expect(decision.allowed).toBe(false);
    expect(decision.refusalReason).toBe(NO_CURSOR_REFUSAL);
    expect(decision.range).toBeUndefined();
  });

  it('refuses when there is no selection at all', () => {
    const decision = decideEntityInsertion(true, null);

    expect(decision.allowed).toBe(false);
    expect(decision.refusalReason).toBe(NO_CURSOR_REFUSAL);
    expect(decision.range).toBeUndefined();
  });

  it('refuses when the selection is undefined', () => {
    const decision = decideEntityInsertion(true, undefined);

    expect(decision.allowed).toBe(false);
    expect(decision.range).toBeUndefined();
  });

  it('CONTROL: allows a caret the user placed, and returns that exact range', () => {
    const decision = decideEntityInsertion(true, caretAt(6, 38));

    expect(decision.allowed).toBe(true);
    expect(decision.refusalReason).toBeUndefined();
    expect(decision.range).toEqual(caretAt(6, 38));
  });

  it('CONTROL: allows a caret the user placed at (1,1) — position is not the test, intent is', () => {
    // A user who genuinely clicks at the top of the document must still be able
    // to insert there. The refusal is about "we were never told where", not
    // about line 1 being forbidden.
    const decision = decideEntityInsertion(true, caretAt(1, 1));

    expect(decision.allowed).toBe(true);
    expect(decision.range).toEqual(caretAt(1, 1));
  });

  it('CONTROL: allows a non-empty selection and returns it, so the id REPLACES the selected text', () => {
    const range: EditorRange = {
      startLineNumber: 6,
      startColumn: 16,
      endLineNumber: 6,
      endColumn: 38,
    };
    const decision = decideEntityInsertion(true, range);

    expect(decision.allowed).toBe(true);
    expect(decision.range).toEqual(range);
  });

  it('CONTROL: allows a multi-line selection unchanged', () => {
    const range: EditorRange = {
      startLineNumber: 2,
      startColumn: 1,
      endLineNumber: 5,
      endColumn: 10,
    };
    const decision = decideEntityInsertion(true, range);

    expect(decision.allowed).toBe(true);
    expect(decision.range).toEqual(range);
  });

  it('does not mutate the range it is given', () => {
    const range = caretAt(3, 4);
    const snapshot = { ...range };

    decideEntityInsertion(true, range);

    expect(range).toEqual(snapshot);
  });

  it('names a reason on every refusal — a refusal without a reason is a silent failure', () => {
    const refusals = [
      decideEntityInsertion(false, caretAt(1, 1)),
      decideEntityInsertion(false, null),
      decideEntityInsertion(true, null),
    ];

    for (const decision of refusals) {
      expect(decision.allowed).toBe(false);
      expect(decision.refusalReason).toBeTruthy();
      expect(decision.refusalReason).toMatch(/cursor/i);
    }
  });
});
