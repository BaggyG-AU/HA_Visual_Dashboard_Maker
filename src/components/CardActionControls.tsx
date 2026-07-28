import React from 'react';
import { Input, Select, Space, Typography, theme } from 'antd';
import type { DashboardAction, DashboardActionType } from '../types/actions';

const { Text } = Typography;

/**
 * Manual tap / hold / double-tap action editor — the missing half of "Smart
 * Default Actions".
 *
 * ⚠⚠ WHY THIS EXISTS — the v1.0.0 UAT round-1 defect PROPS-04 (High). Before
 * this component, `PropertiesPanel.renderSmartDefaultsConfig` shipped a
 * `smart_defaults` Switch and a READ-ONLY preview, and nothing anywhere in the
 * app could write `tap_action` / `hold_action` / `double_tap_action`. That is
 * worse than an undiscoverable control: trace `resolveCardAction` with the
 * toggle switched OFF and every branch falls through —
 *
 *   1. explicit action        -> undefined (nothing could set it)
 *   2. smart_defaults === true -> false, the user just turned it off
 *   3. legacy tap fallback     -> requires smart_defaults === undefined, and it
 *                                 is now `false`, not absent
 *
 * — so the card resolved to `{ action: undefined, source: 'none' }` and the
 * author had no way back. Turning Smart Defaults off stranded the card.
 *
 * ⭐ THE "Not set" OPTION IS LOAD-BEARING, NOT COSMETIC. An explicit action
 * ALWAYS outranks smart defaults in `resolveCardAction`, so without a way back
 * to "unset" the author's first pick would be a one-way door out of smart
 * defaults forever. `undefined` — not `{ action: 'none' }` — is what restores
 * the fallback; `{ action: 'none' }` is HA's real "do nothing" and is a
 * different, deliberate choice.
 *
 * ⭐ SUB-FIELD PRUNING IS PART OF THE CONTRACT. Changing the action type builds
 * a FRESH object rather than spreading the old one, so the YAML can never carry
 * `tap_action: { action: toggle, navigation_path: /lovelace/0 }` — a shape that
 * is valid to the parser and meaningless to Home Assistant. `confirmation` is
 * deliberately carried across, because it is orthogonal to the action type.
 */

export const UNSET_ACTION_VALUE = '__unset__';

export const ACTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: UNSET_ACTION_VALUE, label: 'Not set (use Smart Defaults)' },
  { value: 'none', label: 'None' },
  { value: 'more-info', label: 'More Info' },
  { value: 'toggle', label: 'Toggle' },
  { value: 'call-service', label: 'Call Service' },
  { value: 'navigate', label: 'Navigate' },
  { value: 'url', label: 'URL' },
  { value: 'popup', label: 'Popup' },
];

/** The one sub-field each action type reveals, if any. */
export type SubField = 'service' | 'navigation_path' | 'url_path' | 'popup_title';

const SUB_FIELD_BY_ACTION: Partial<Record<DashboardActionType, SubField>> = {
  'call-service': 'service',
  navigate: 'navigation_path',
  url: 'url_path',
  popup: 'popup_title',
};

const SUB_FIELD_LABEL: Record<SubField, string> = {
  service: 'Service',
  navigation_path: 'Navigation path',
  url_path: 'URL',
  popup_title: 'Popup title',
};

const SUB_FIELD_PLACEHOLDER: Record<SubField, string> = {
  service: 'light.turn_on',
  navigation_path: '/lovelace/0',
  url_path: 'https://example.com',
  popup_title: 'Details',
};

/** `-service`, `-navigation-path`, ... appended to the caller's testId base. */
const SUB_FIELD_TESTID: Record<SubField, string> = {
  service: 'service',
  navigation_path: 'navigation-path',
  url_path: 'url-path',
  popup_title: 'popup-title',
};

export interface CardActionControlsProps {
  value?: DashboardAction;
  onChange?: (next: DashboardAction | undefined) => void;
  /** Base for every data-testid, e.g. `button-card-tap-action`. */
  testIdBase: string;
}

/**
 * A card action can arrive from the YAML editor as anything at all, so read it
 * defensively — a render-time throw in PropertiesPanel whites out the whole app.
 */
export const readAction = (value: unknown): DashboardAction | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const typed = value as DashboardAction;
  return typeof typed.action === 'string' ? typed : undefined;
};

const readSubFieldValue = (action: DashboardAction | undefined, field: SubField): string => {
  const raw = action?.[field];
  return typeof raw === 'string' ? raw : '';
};

/** Which extra input, if any, the chosen action type reveals. */
export const subFieldForAction = (action: DashboardAction | undefined): SubField | undefined =>
  action ? SUB_FIELD_BY_ACTION[action.action] : undefined;

/**
 * The action after the author picks a new type.
 *
 * `undefined` for "Not set" — that is what restores the smart-default fallback,
 * because `resolveCardAction` treats ANY explicit action as outranking it.
 * Otherwise a FRESH object, so a sub-field belonging to the old type can never
 * ride along. `confirmation` survives because HA treats it as orthogonal to
 * which action runs.
 */
export const nextActionForType = (
  current: DashboardAction | undefined,
  nextType: string,
): DashboardAction | undefined => {
  if (nextType === UNSET_ACTION_VALUE) return undefined;

  const fresh: DashboardAction = { action: nextType as DashboardActionType };
  if (current?.confirmation) fresh.confirmation = current.confirmation;
  return fresh;
};

/**
 * The action after the author edits a revealed sub-field. An empty box means
 * "not filled in yet", so the key is dropped rather than written as `''`.
 */
export const nextActionForSubField = (
  current: DashboardAction | undefined,
  field: SubField,
  text: string,
): DashboardAction | undefined => {
  if (!current) return undefined;
  return { ...current, [field]: text.trim().length > 0 ? text : undefined };
};

export const CardActionControls: React.FC<CardActionControlsProps> = ({
  value,
  onChange,
  testIdBase,
}) => {
  const { token } = theme.useToken();
  const action = readAction(value);
  const selected = action?.action ?? UNSET_ACTION_VALUE;
  const subField = subFieldForAction(action);

  const handleTypeChange = (next: string) => onChange?.(nextActionForType(action, next));

  const handleSubFieldChange = (field: SubField, text: string) => {
    if (!action) return;
    onChange?.(nextActionForSubField(action, field, text));
  };

  return (
    <Space orientation="vertical" size={6} style={{ width: '100%' }}>
      {/* ⚠ The testid goes on a WRAPPER, not on <Select> itself. antd v6 does
          not forward an unknown prop to the `.ant-select` root, so a testid on
          the Select resolves to a node that does not contain
          `.ant-select-selector` or `.ant-select-selection-item` — which makes
          both "click the field" and "read the chosen label" silently target the
          wrong element. Cost this a full e2e round to find. */}
      <div data-testid={`${testIdBase}-select`}>
        <Select
          value={selected}
          onChange={handleTypeChange}
          options={ACTION_OPTIONS}
          style={{ width: '100%' }}
        />
      </div>

      {subField && (
        <div>
          <Text style={{ color: token.colorTextSecondary, fontSize: 12 }}>
            {SUB_FIELD_LABEL[subField]}
          </Text>
          <Input
            data-testid={`${testIdBase}-${SUB_FIELD_TESTID[subField]}`}
            value={readSubFieldValue(action, subField)}
            onChange={(event) => handleSubFieldChange(subField, event.target.value)}
            placeholder={SUB_FIELD_PLACEHOLDER[subField]}
          />
        </div>
      )}
    </Space>
  );
};

export default CardActionControls;
