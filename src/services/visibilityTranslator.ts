/**
 * Visibility translator — slice **B6b** of the export boundary.
 *
 * The TRANSLATE→HA-native-`visibility` class of the export contract
 * (`haExportContract.ts`, `HA_VISIBILITY_KEYS`): HAVDM's own
 * `visibility_conditions` + `visibility_operator` invention has a real Home
 * Assistant target — the native card-level `visibility` conditions (HA 2024.6+;
 * the reference instance runs 2026.7.2). On export these compile into a
 * `visibility: [...]` array; the HAVDM keys are removed.
 *
 * Unlike card-mod (B6), native `visibility` is a CORE HA feature (not an add-on),
 * so there is NO capability gate — the translation always runs.
 *
 * Design: `docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md` §6b. The per-rule
 * mapping mirrors HAVDM's own evaluator (`conditionalVisibility.ts`) so a card
 * behaves in HA exactly as it did on the HAVDM canvas:
 *
 *   ROOT operator (`visibility_operator`, default `and` per the evaluator):
 *     and → `visibility: [ …conditions ]`   (HA ANDs the array implicitly)
 *     or  → `visibility: [ { condition: 'or', conditions: [ … ] } ]`
 *
 *   PER-RULE:
 *     state_equals {entity,value}            → { condition: state, entity, state: <value> }
 *     state_not_equals {entity,value}        → { condition: state, entity, state_not: <value> }
 *     state_in {entity,values}               → { condition: state, entity, state: [ … ] }
 *     state_not_in {entity,values}           → { condition: state, entity, state_not: [ … ] }
 *     attribute_equals {entity,attribute,value}       → { condition: state, entity, attribute, state: <value> }
 *     attribute_greater_than {entity,attribute,value} → { condition: numeric_state, entity, attribute, above: <n> }
 *     attribute_less_than {entity,attribute,value}    → { condition: numeric_state, entity, attribute, below: <n> }
 *     and/or group {conditions}              → { condition: and/or, conditions: [ …recursive ] }
 *     entity_exists {entity}                 → { condition: state, entity, state_not: [unavailable, unknown] }  (+warn — approximation)
 *
 * `entity_exists` has NO native HA `visibility` condition; per the ratified
 * decision (2026-07-21) it is APPROXIMATED to "the entity is available" and a
 * plain-language warning is recorded (surfaced in B8).
 *
 * Scalar `state`/`state_not` values are stringified to mirror the evaluator's
 * `String(value)` comparison; numeric_state `above`/`below` are coerced to Number.
 */
import type { ExportWarning } from './exportWarnings';

export interface TranslateVisibilityResult {
  card: Record<string, unknown>;
  warnings: ExportWarning[];
}

type HaCondition = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Translate a single HAVDM visibility condition (rule or nested group) into an HA
 * condition, or `null` when it cannot be represented. Approximation warnings are
 * pushed to `warnings`.
 */
const translateCondition = (
  condition: unknown,
  cardType: string,
  warnings: ExportWarning[],
): HaCondition | null => {
  if (!isRecord(condition) || typeof condition.condition !== 'string') {
    return null;
  }
  const kind = condition.condition;

  // Nested and/or groups — HA supports these natively (2024.6+).
  if (kind === 'and' || kind === 'or') {
    const inner = Array.isArray(condition.conditions) ? condition.conditions : [];
    const conditions = inner
      .map((child) => translateCondition(child, cardType, warnings))
      .filter((child): child is HaCondition => child !== null);
    return { condition: kind, conditions };
  }

  const entity = condition.entity;
  if (typeof entity !== 'string' || entity.length === 0) {
    return null;
  }

  switch (kind) {
    case 'state_equals':
      return condition.value !== undefined
        ? { condition: 'state', entity, state: String(condition.value) }
        : null;
    case 'state_not_equals':
      return condition.value !== undefined
        ? { condition: 'state', entity, state_not: String(condition.value) }
        : null;
    case 'state_in':
      return Array.isArray(condition.values) && condition.values.length > 0
        ? { condition: 'state', entity, state: condition.values.map((v) => String(v)) }
        : null;
    case 'state_not_in':
      return Array.isArray(condition.values) && condition.values.length > 0
        ? { condition: 'state', entity, state_not: condition.values.map((v) => String(v)) }
        : null;
    case 'attribute_equals':
      return typeof condition.attribute === 'string' && condition.value !== undefined
        ? {
            condition: 'state',
            entity,
            attribute: condition.attribute,
            state: String(condition.value),
          }
        : null;
    case 'attribute_greater_than': {
      const above = Number(condition.value);
      return typeof condition.attribute === 'string' && Number.isFinite(above)
        ? { condition: 'numeric_state', entity, attribute: condition.attribute, above }
        : null;
    }
    case 'attribute_less_than': {
      const below = Number(condition.value);
      return typeof condition.attribute === 'string' && Number.isFinite(below)
        ? { condition: 'numeric_state', entity, attribute: condition.attribute, below }
        : null;
    }
    case 'entity_exists':
      warnings.push({
        category: 'visibility',
        cardType,
        keys: ['visibility_conditions'],
        reason: 'visibility-approximated',
        message:
          `A "show only if the entity exists" rule on this "${cardType}" card has no ` +
          `direct Home Assistant equivalent, so it was approximated to "the entity is ` +
          `available" (state is not unavailable/unknown). In most cases the card behaves ` +
          `the same.`,
      });
      return { condition: 'state', entity, state_not: ['unavailable', 'unknown'] };
    default:
      return null;
  }
};

/**
 * Translate a card's `visibility_conditions` + `visibility_operator` into a
 * native HA `visibility` array, removing the HAVDM keys. Returns a NEW card; the
 * input is not mutated. Cards without visibility keys are returned unchanged.
 *
 * If a native `visibility` already exists on the card, the translated conditions
 * are appended to it (both are ANDed at the top level).
 */
export const translateVisibility = (card: Record<string, unknown>): TranslateVisibilityResult => {
  const hasConditions = Array.isArray(card.visibility_conditions);
  const hasOperator = card.visibility_operator !== undefined;
  if (!hasConditions && !hasOperator) {
    return { card, warnings: [] };
  }

  const cardType = typeof card.type === 'string' ? card.type : 'card';
  const warnings: ExportWarning[] = [];

  const rawConditions = Array.isArray(card.visibility_conditions) ? card.visibility_conditions : [];
  const operator = card.visibility_operator === 'or' ? 'or' : 'and';

  const translated = rawConditions
    .map((condition) => translateCondition(condition, cardType, warnings))
    .filter((condition): condition is HaCondition => condition !== null);

  // Drop the HAVDM-only keys (they must never reach HA) — keep everything else,
  // including any pre-existing native `visibility`.
  const { visibility_conditions: _conditions, visibility_operator: _operator, ...output } = card;
  void _conditions;
  void _operator;

  if (translated.length > 0) {
    const compiled: HaCondition[] =
      operator === 'or' ? [{ condition: 'or', conditions: translated }] : translated;

    output.visibility = Array.isArray(card.visibility)
      ? [...card.visibility, ...compiled]
      : compiled;
  }

  return { card: output, warnings };
};
