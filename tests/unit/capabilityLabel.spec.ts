/**
 * Breadth over `capturedAtLabel` — ruling R1's "as of last capture <time>" note.
 *
 * ⚠⚠ HONEST LIMIT, STATED RATHER THAN PAPERED OVER: THIS SPEC CANNOT BE
 * RED-LEGGED. `src/utils/capabilityLabel.ts` does not exist on base, so
 * `git stash push -u src/` makes every test here fail at IMPORT rather than on
 * an assertion — `[STATE]`'s red-leg limit (6), now hit by four consecutive
 * slices (#125, #126, #127 and this one), so treat it as a property of any
 * new-module slice rather than a surprise. The legs that actually MEASURE
 * EXPORT-04 are in `tests/unit/CardPalette.availability.spec.tsx`,
 * `tests/unit/BaseCard.availability.spec.tsx` and
 * `tests/e2e/round1-final-honesty.spec.ts`; this file's job is breadth over the
 * formatting rules.
 *
 * ⭐ Every case passes an explicit `now`. A label built from an ambient clock
 * cannot be asserted without freezing time, and a test that froze it would be
 * measuring the harness rather than the product.
 */
import { describe, expect, it } from 'vitest';
import { capturedAtLabel } from '../../src/utils/capabilityLabel';

const NOW = new Date('2026-08-06T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('capturedAtLabel', () => {
  it('says "just now" under a minute', () => {
    expect(capturedAtLabel(ago(30_000), NOW)).toBe('just now');
  });

  it('singularises one minute and one hour', () => {
    expect(capturedAtLabel(ago(MINUTE), NOW)).toBe('1 minute ago');
    expect(capturedAtLabel(ago(HOUR), NOW)).toBe('1 hour ago');
  });

  it('counts minutes below an hour and hours below a day', () => {
    expect(capturedAtLabel(ago(45 * MINUTE), NOW)).toBe('45 minutes ago');
    expect(capturedAtLabel(ago(5 * HOUR), NOW)).toBe('5 hours ago');
  });

  it('says "yesterday" at one day and counts days below a week', () => {
    expect(capturedAtLabel(ago(DAY), NOW)).toBe('yesterday');
    expect(capturedAtLabel(ago(3 * DAY), NOW)).toBe('3 days ago');
  });

  // ⭐ Past a week a relative count tells you LESS than a date does — "23 days
  // ago" is worse information than the day it happened.
  it('hands over to an absolute stamp past a week', () => {
    const label = capturedAtLabel(ago(30 * DAY), NOW);
    expect(label).not.toMatch(/ago/);
    expect(label).toMatch(/2026/);
  });

  // ⚠ NEVER CAPTURED is a different statement from CAPTURED LONG AGO, and
  // rendering it as a date would invent a fact.
  it('never invents a time it does not have', () => {
    expect(capturedAtLabel(null, NOW)).toBe('time unknown');
    expect(capturedAtLabel('not-a-date', NOW)).toBe('time unknown');
  });

  // ⚠ A profile written by a machine whose clock runs ahead must not read as
  // "in 3 hours". Falling back to the absolute stamp is the honest answer.
  it('does not render a future capture as negative recency', () => {
    const future = new Date(NOW.getTime() + 3 * HOUR).toISOString();
    const label = capturedAtLabel(future, NOW);
    expect(label).not.toMatch(/ago|just now/);
    expect(label).toMatch(/2026/);
  });
});
