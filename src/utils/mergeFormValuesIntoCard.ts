/**
 * Merge antd form values onto a card WITHOUT resurrecting keys the card never
 * had.
 *
 * ⚠⚠ WHY THIS EXISTS — the v1.0.0 UAT round-1 "every card turns into a Spacer"
 * defect (CLIP-01, CLIP-02, CLIP-04, PROPS-01, all High).
 *
 * `PropertiesPanel.applyCardValuesToForm` clears keys the newly-selected card
 * does not have by calling `form.setFieldsValue({ key: undefined })`. That is
 * the only tool antd offers — and it does NOT remove the key. Verified directly
 * against `@rc-component/util`'s `set`, which backs both `setFieldsValue` and
 * `resetFields`:
 *
 *   set({ a: 1, _isSpacer: true }, ['_isSpacer'], undefined)
 *     -> JSON.stringify        === '{"a":1}'      // looks gone
 *     -> '_isSpacer' in result === true           // is not gone
 *
 * So `form.getFieldsValue(true)` returns every key ever cleared, each with the
 * value `undefined`, and a plain `{ ...card, ...values }` spread re-attached
 * them to whatever card was selected next.
 *
 * ⭐ That is invisible almost everywhere — `JSON.stringify` drops undefined,
 * `cardToYaml` drops it, and the export sweep in `yamlService` deletes it — so
 * the config was never actually corrupted. But `BaseCard` asked
 * `'_isSpacer' in card`, a PRESENCE check, and presence is exactly what
 * survived. Selecting the spacer that leads `sample-dashboard.yaml` once was
 * enough to make every later edit to every card render as "Spacer (Empty)",
 * and round-tripping through the YAML editor healed it because the parse
 * produced an object without the key.
 *
 * ⭐ THE RULE: an `undefined` in the form store means "this field is empty",
 * which is only meaningful for a key the card actually owns. For any other key
 * it means "this belonged to a card you are no longer editing" — and adding it
 * is what caused the defect. Clearing a field the card DOES own still works:
 * the key is already present, so the undefined is written through, and the
 * export sweep strips it exactly as before.
 */
export const mergeFormValuesIntoCard = <T extends object>(
  card: T,
  values: Record<string, unknown>,
): T => {
  const merged = { ...card } as Record<string, unknown>;

  for (const key of Object.keys(values)) {
    const value = values[key];

    // Never INTRODUCE an undefined key. Writing one through for a key the card
    // already owns is a legitimate "the user cleared this field".
    if (value === undefined && !(key in card)) continue;

    merged[key] = value;
  }

  return merged as T;
};
