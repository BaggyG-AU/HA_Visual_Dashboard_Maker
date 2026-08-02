/**
 * PROPS-03 — the entity picker must never let its own filtering masquerade as
 * "you have none of those".
 *
 * ⭐ Round-2 UAT, card PROPS-03 (High), owner verbatim, in full:
 * **"'light' not found in entity list."**
 *
 * ⭐⭐⭐ THE FIXTURE BELOW IS BUILT FROM THE INSTANCE, NOT FROM THE REPORT. Measured
 * read-only against `ha.home.local` (HA 2026.7.4) on 2026-08-02:
 *
 *   - 725 live entities, 1397 registry rows, 29 domains.
 *   - **ZERO entities in the `light` domain — live AND in the registry.** The
 *     domain does not exist on that instance at all.
 *   - Exactly THREE live entities match the word "light", and all three are
 *     UniFi Protect camera status lights carrying `entity_category: diagnostic`:
 *     `binary_sensor.garage_360_status_light`, `binary_sensor.front_yard_status_light`,
 *     `binary_sensor.front_door_status_light`.
 *   - The picker's registry cut removes **287 of 725** for an unconstrained card;
 *     the card-type cut removes **0**.
 *
 * ⚠⚠ That inverted the triage's prediction, which named `filterEntitiesForCard`
 * as the stronger candidate on the reasoning that "a light is rarely
 * diagnostic". True, and vacuous — there was never a light to hide. A fixture
 * built from the bug report would have CONTAINED lights, "reproduced" the
 * defect, and aimed the fix at the wrong mechanism entirely.
 */
import { describe, it, expect } from 'vitest';
import {
  SHOW_DIAGNOSTIC_LABEL,
  describeAllHiddenHere,
  describePickerEmpty,
  describeVisibleCount,
} from '../../src/utils/entityDisclosure';

describe('PROPS-03: describeVisibleCount', () => {
  it('names the hidden count when the cut removed something', () => {
    // The reference instance's real numbers for an unconstrained card.
    expect(describeVisibleCount(438, 725)).toBe('Showing 438 of 725 (287 hidden)');
  });

  it('stays quiet about hiding when nothing was hidden', () => {
    // ⭐ CONTROL. A count that always mentions hiding would train the user to
    // ignore it, which is the same failure as never mentioning it.
    expect(describeVisibleCount(438, 438)).toBe('Showing 438');
  });

  it('is byte-identical to the wording the Entity Browser already shipped', () => {
    // ⚠ This module was extracted FROM `EntityBrowser.tsx` so the two entity
    // surfaces cannot drift. If this string changes, the browser's own tests and
    // its users' expectations change with it — which must be a decision, not a
    // side effect of editing the picker.
    expect(describeVisibleCount(6, 44)).toBe('Showing 6 of 44 (38 hidden)');
    expect(describeAllHiddenHere(38)).toBe(
      'All 38 entities here are marked diagnostic or config by Home Assistant. ' +
        'Tick "Show diagnostic & config" to see them.',
    );
  });

  it('names the escape hatch with the same label the control carries', () => {
    expect(describeAllHiddenHere(3)).toContain(`"${SHOW_DIAGNOSTIC_LABEL}"`);
  });
});

describe('PROPS-03: describePickerEmpty names WHICH of four causes applies', () => {
  const base = {
    totalEntities: 725,
    eligible: 438,
    offered: 438,
    hiddenMatchingSearch: 0,
    searchText: '',
    cardLabel: null as string | null,
  };

  it('(1) says nothing is cached when nothing is cached', () => {
    expect(describePickerEmpty({ ...base, totalEntities: 0, eligible: 0, offered: 0 })).toBe(
      'No entities cached. Connect to Home Assistant and click Refresh.',
    );
  });

  it('(2) blames the CARD when the card admits nothing on this instance', () => {
    // ⭐⭐⭐ THE CASE THE OWNER ACTUALLY HIT. A Light card on the reference
    // instance has a pool of ZERO, because there is no `light` domain. antd's
    // answer to this was the bare word "No data".
    expect(
      describePickerEmpty({
        ...base,
        eligible: 0,
        offered: 0,
        cardLabel: 'Light',
      }),
    ).toBe('No entity on this Home Assistant can be shown by a Light card.');
  });

  it('(2) still explains itself when the card type has no friendly name', () => {
    expect(describePickerEmpty({ ...base, eligible: 0, offered: 0 })).toBe(
      'No entity on this Home Assistant can be shown by this card.',
    );
  });

  it('(3) blames the CUT when the cut removed everything in scope', () => {
    expect(describePickerEmpty({ ...base, eligible: 38, offered: 0 })).toBe(
      describeAllHiddenHere(38),
    );
  });

  it('(4) says how many MATCHING entities are hidden — the owner’s exact case', () => {
    // Typing "light" on the reference instance matches 3 entities, all of them
    // diagnostic. The picker returned nothing while holding the answer.
    const message = describePickerEmpty({
      ...base,
      hiddenMatchingSearch: 3,
      searchText: 'light',
    });
    expect(message).toContain('No visible entity matches "light"');
    expect(message).toContain('3 entities that match are marked diagnostic or config');
    expect(message).toContain(`Tick "${SHOW_DIAGNOSTIC_LABEL}" to see them`);
  });

  it('(4) reads correctly for a single hidden match', () => {
    const message = describePickerEmpty({
      ...base,
      hiddenMatchingSearch: 1,
      searchText: 'status',
    });
    expect(message).toContain('1 entity that matches is marked diagnostic or config');
    expect(message).toContain('to see it.');
    expect(message).not.toContain('entities that match are');
  });

  it('falls back to a plain no-match when nothing is being hidden', () => {
    // ⭐ CONTROL LEG. If this returned the diagnostic wording too, every
    // assertion above would pass vacuously against a build that blamed the cut
    // for everything.
    expect(describePickerEmpty({ ...base, hiddenMatchingSearch: 0, searchText: 'zzzz' })).toBe(
      'No entities match your search.',
    );
  });

  it('prefers the CARD reason over the search reason when both are true', () => {
    // ⚠ A Light card on an instance with no lights is also a case where the
    // search found nothing. Naming the narrower reason would be true but
    // useless — the user cannot fix it by searching differently.
    expect(
      describePickerEmpty({
        ...base,
        eligible: 0,
        offered: 0,
        hiddenMatchingSearch: 3,
        searchText: 'light',
        cardLabel: 'Light',
      }),
    ).toBe('No entity on this Home Assistant can be shown by a Light card.');
  });
});

describe('PROPS-03: a domain-restricted field blames the DOMAIN, not the cut', () => {
  const base = {
    totalEntities: 5,
    eligible: 0,
    offered: 0,
    hiddenMatchingSearch: 0,
    searchText: '',
    cardLabel: null as string | null,
  };

  it('names the domain when the field restricts to one and the instance has none', () => {
    // ⭐⭐⭐ THE REGRESSION THIS FILE EXISTS TO PIN. `PropertiesPanel.tsx` renders
    // the Light card's picker as `filterDomains={['light']}` with NO `cardType`,
    // so an earlier draft measured "eligible" against the card-type stage only,
    // found it had removed nothing, and blamed the diagnostic cut — "All 5
    // entities here are marked diagnostic or config" — on an instance whose real
    // problem is that it has no lights at all. Unticking the box would have
    // produced nothing, so the message sent the user to a control that could
    // not help. Caught by the integration leg, pinned here.
    expect(describePickerEmpty({ ...base, domains: ['light'] })).toBe(
      'No entity on this Home Assistant is in the light domain.',
    );
  });

  it('reads naturally for a multi-domain field', () => {
    expect(describePickerEmpty({ ...base, domains: ['person', 'device_tracker', 'zone'] })).toBe(
      'No entity on this Home Assistant is in the person, device_tracker or zone domain.',
    );
  });

  it('⭐ CONTROL: with something eligible, the cut IS named', () => {
    // Same field, but now the domain does exist and the cut is genuinely why
    // the list is empty — so the message must change. Without this leg the
    // assertions above would pass against a build that never blames the cut.
    expect(describePickerEmpty({ ...base, eligible: 3, offered: 0, domains: ['light'] })).toBe(
      describeAllHiddenHere(3),
    );
  });
});
