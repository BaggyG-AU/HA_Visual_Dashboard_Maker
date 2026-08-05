/**
 * capabilityLabel — how HAVDM says WHEN it learned what your instance has.
 *
 * Ruling R1 (`drawer_havdm_decisions_6e8d4788d9513ccce593c378`) settled that
 * after a disconnect the availability marks keep reflecting the LAST CAPTURED
 * profile rather than reverting to permissive — the persisted profile is the
 * offline source of truth, and yanking the marks would re-create the dangling
 * -reference class of defect F2 exists to fix. The cost of that ruling is that a
 * mark can be arbitrarily old and still look authoritative, so R1 attached an
 * "as of last capture <time>" note to F4's scope. This composes it.
 *
 * ⚠ PURE, AND DELIBERATELY TAKES `now` — a label built from an ambient clock
 * cannot be asserted without freezing time, and every test that tried would be
 * measuring the harness rather than the product.
 */

/** Formatted absolute fallback, e.g. `3 Aug 2026, 14:05`. */
function absolute(when: Date): string {
  return when.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Render a capture timestamp as human-readable recency.
 *
 * ⚠ `null` means NEVER CAPTURED, which is a different statement from "captured
 * long ago" and must not be rendered as a date. The caller only reaches this
 * branch when `haVersion !== null`, so a null timestamp there means the profile
 * was written by an older build that did not record one — say so plainly rather
 * than inventing a time.
 */
export function capturedAtLabel(capturedAt: string | null, now: Date = new Date()): string {
  if (!capturedAt) return 'time unknown';

  const when = new Date(capturedAt);
  if (Number.isNaN(when.getTime())) return 'time unknown';

  const elapsedMs = now.getTime() - when.getTime();
  // A clock skew or a profile written by a machine ahead of this one should not
  // read as "in 3 hours" — fall back to the absolute stamp rather than lie.
  if (elapsedMs < 0) return absolute(when);

  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  // Past a week a relative count stops being useful ("23 days ago" tells you
  // less than a date does), so hand over to the absolute stamp.
  if (days < 7) return `${days} days ago`;

  return absolute(when);
}
