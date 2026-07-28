/**
 * Coverage for the v1.0.0 UAT round-1 defect PROPS-04 (High) — "Could only find
 * Smart Default Actions. No other options available."
 *
 * The defect was not undiscoverability. Nothing in HAVDM could write
 * `tap_action` / `hold_action` / `double_tap_action` at all, and with the
 * "Use Smart Defaults" toggle switched OFF every branch of `resolveCardAction`
 * falls through to `{ action: undefined, source: 'none' }` — so turning the
 * toggle off stranded the card with no action and no way to define one.
 *
 * These tests pin the three properties that make the new picker a fix rather
 * than a new trap:
 *
 *   1. the option list the UAT card demands is actually offered,
 *   2. "Not set" round-trips to `undefined`, so the first pick is not a one-way
 *      door out of smart defaults,
 *   3. changing type PRUNES the old type's sub-field, so the YAML can never
 *      carry `{ action: toggle, navigation_path: /lovelace/0 }`.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ACTION_OPTIONS,
  CardActionControls,
  UNSET_ACTION_VALUE,
  nextActionForSubField,
  nextActionForType,
  readAction,
  subFieldForAction,
} from '../../src/components/CardActionControls';
import { resolveCardAction } from '../../src/services/smartActions';
import type { Card } from '../../src/types/dashboard';

const TEST_ID_BASE = 'button-card-tap-action';

describe('the option list PROPS-04 asks for', () => {
  it('offers None, More Info, Toggle, Call Service, Navigate, URL and Popup', () => {
    const labels = ACTION_OPTIONS.map((option) => option.label);

    expect(labels).toEqual(
      expect.arrayContaining([
        'None',
        'More Info',
        'Toggle',
        'Call Service',
        'Navigate',
        'URL',
        'Popup',
      ]),
    );
  });

  it('also offers an explicit "not set", which is what restores smart defaults', () => {
    expect(ACTION_OPTIONS[0].value).toBe(UNSET_ACTION_VALUE);
  });

  it('maps every offered action type onto a real DashboardActionType', () => {
    const actionValues = ACTION_OPTIONS.filter((o) => o.value !== UNSET_ACTION_VALUE).map(
      (o) => o.value,
    );

    expect(actionValues).toEqual([
      'none',
      'more-info',
      'toggle',
      'call-service',
      'navigate',
      'url',
      'popup',
    ]);
  });
});

describe('the defect itself — the state the author was stranded in', () => {
  it('resolves to nothing at all when smart defaults are off and no action is set', () => {
    const card = { type: 'button', entity: 'light.kitchen', smart_defaults: false } as Card;

    const resolved = resolveCardAction(card, 'tap');

    expect(resolved.source).toBe('none');
    expect(resolved.action).toBeUndefined();
  });

  it('resolves to the user action once the picker can write one', () => {
    const card = {
      type: 'button',
      entity: 'light.kitchen',
      smart_defaults: false,
      tap_action: { action: 'toggle' },
    } as Card;

    const resolved = resolveCardAction(card, 'tap');

    expect(resolved.source).toBe('user');
    expect(resolved.action).toEqual({ action: 'toggle' });
  });
});

describe('nextActionForType', () => {
  it('emits undefined for "not set" so the smart default can apply again', () => {
    // ⭐ Not `{ action: 'none' }`. An explicit action ALWAYS outranks a smart
    // default, so returning one here would make the first pick permanent.
    expect(nextActionForType({ action: 'toggle' }, UNSET_ACTION_VALUE)).toBeUndefined();
  });

  it('prunes the previous type’s sub-field instead of spreading it forward', () => {
    const navigate = { action: 'navigate' as const, navigation_path: '/lovelace/0' };

    const next = nextActionForType(navigate, 'toggle');

    expect(next).toEqual({ action: 'toggle' });
    expect(next && 'navigation_path' in next).toBe(false);
  });

  it('prunes a service the same way', () => {
    const callService = { action: 'call-service' as const, service: 'light.turn_on' };

    expect(nextActionForType(callService, 'more-info')).toEqual({ action: 'more-info' });
  });

  it('carries confirmation across, because it is orthogonal to the action type', () => {
    const withConfirmation = {
      action: 'call-service' as const,
      service: 'script.turn_on',
      confirmation: { text: 'Are you sure?' },
    };

    expect(nextActionForType(withConfirmation, 'toggle')).toEqual({
      action: 'toggle',
      confirmation: { text: 'Are you sure?' },
    });
  });

  it('builds an action from nothing when none was set', () => {
    expect(nextActionForType(undefined, 'navigate')).toEqual({ action: 'navigate' });
  });
});

describe('nextActionForSubField', () => {
  it('writes the sub-field onto the current action', () => {
    expect(nextActionForSubField({ action: 'navigate' }, 'navigation_path', '/lovelace/1')).toEqual(
      { action: 'navigate', navigation_path: '/lovelace/1' },
    );
  });

  it('drops the key rather than writing an empty string', () => {
    const cleared = nextActionForSubField(
      { action: 'navigate', navigation_path: '/lovelace/1' },
      'navigation_path',
      '   ',
    );

    expect(cleared).toEqual({ action: 'navigate', navigation_path: undefined });
  });

  it('preserves sibling keys an author configured in YAML', () => {
    const rich = {
      action: 'popup' as const,
      popup_title: 'Old',
      popup_size: 'large' as const,
      popup_show_footer: true,
    };

    expect(nextActionForSubField(rich, 'popup_title', 'New')).toEqual({
      action: 'popup',
      popup_title: 'New',
      popup_size: 'large',
      popup_show_footer: true,
    });
  });
});

describe('subFieldForAction', () => {
  it('reveals exactly one field per action type that needs one', () => {
    expect(subFieldForAction({ action: 'call-service' })).toBe('service');
    expect(subFieldForAction({ action: 'navigate' })).toBe('navigation_path');
    expect(subFieldForAction({ action: 'url' })).toBe('url_path');
    expect(subFieldForAction({ action: 'popup' })).toBe('popup_title');
  });

  it('reveals nothing for the action types that are complete on their own', () => {
    expect(subFieldForAction(undefined)).toBeUndefined();
    expect(subFieldForAction({ action: 'none' })).toBeUndefined();
    expect(subFieldForAction({ action: 'more-info' })).toBeUndefined();
    expect(subFieldForAction({ action: 'toggle' })).toBeUndefined();
  });
});

describe('readAction — PropertiesPanel is blank-app-prone, so malformed YAML must not throw', () => {
  it.each([
    ['a string', 'toggle'],
    ['an array', ['toggle']],
    ['null', null],
    ['a number', 7],
    ['an object with no action key', { navigation_path: '/lovelace/0' }],
  ])('treats %s as "not set" rather than throwing', (_label, value) => {
    expect(readAction(value)).toBeUndefined();
  });

  it('accepts a well-formed action', () => {
    expect(readAction({ action: 'toggle' })).toEqual({ action: 'toggle' });
  });
});

describe('CardActionControls rendering', () => {
  it('renders the picker with no sub-field when nothing is set', () => {
    render(<CardActionControls testIdBase={TEST_ID_BASE} />);

    expect(screen.getByTestId(`${TEST_ID_BASE}-select`)).toBeTruthy();
    expect(screen.queryByTestId(`${TEST_ID_BASE}-navigation-path`)).toBeNull();
    expect(screen.queryByTestId(`${TEST_ID_BASE}-service`)).toBeNull();
  });

  it.each([
    ['navigate', 'navigation-path'],
    ['call-service', 'service'],
    ['url', 'url-path'],
    ['popup', 'popup-title'],
  ])('reveals the %s sub-field', (action, testIdSuffix) => {
    render(
      <CardActionControls
        testIdBase={TEST_ID_BASE}
        value={{ action: action as 'navigate' | 'call-service' | 'url' | 'popup' }}
      />,
    );

    expect(screen.getByTestId(`${TEST_ID_BASE}-${testIdSuffix}`)).toBeTruthy();
  });

  it.each(['none', 'more-info', 'toggle'])(
    'reveals no sub-field for %s, so the form is never half-configured',
    (action) => {
      render(
        <CardActionControls
          testIdBase={TEST_ID_BASE}
          value={{ action: action as 'none' | 'more-info' | 'toggle' }}
        />,
      );

      expect(screen.queryByTestId(`${TEST_ID_BASE}-navigation-path`)).toBeNull();
      expect(screen.queryByTestId(`${TEST_ID_BASE}-service`)).toBeNull();
      expect(screen.queryByTestId(`${TEST_ID_BASE}-url-path`)).toBeNull();
      expect(screen.queryByTestId(`${TEST_ID_BASE}-popup-title`)).toBeNull();
    },
  );

  it('does not throw on a malformed value from the YAML editor', () => {
    const onChange = vi.fn();

    expect(() =>
      render(
        <CardActionControls
          testIdBase={TEST_ID_BASE}
          value={'toggle' as unknown as undefined}
          onChange={onChange}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByTestId(`${TEST_ID_BASE}-select`)).toBeTruthy();
  });
});
