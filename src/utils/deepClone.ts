/**
 * Structural deep clone, with a JSON fallback for environments without
 * `structuredClone`.
 *
 * This was previously a private helper inside `src/store/dashboardStore.ts`
 * (`cloneConfig`), where it isolated undo/redo history snapshots from the live
 * config. WS3 slice C needs the same guarantee at the clipboard boundary, so it
 * is extracted here rather than reimplemented — `ai_rules.md` §1 (Immutable
 * Reuse Rule).
 *
 * ⚠ Both backends drop functions, class prototypes and `undefined`-valued keys
 * (JSON) or throw on non-cloneable values (structuredClone). That is fine for
 * dashboard config, which is plain JSON-shaped data by construction: it is
 * parsed from YAML and serialised back to it.
 */
export const deepClone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value) as T;
  }
  return JSON.parse(JSON.stringify(value)) as T;
};
