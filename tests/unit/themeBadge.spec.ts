import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_THEMES,
  BUILT_IN_THEME_NAMES,
  buildThemeOptions,
  type SavedThemeRecord,
} from '../../src/features/theme-manager';
import { themeService } from '../../src/services/themeService';
import { REAL_HA_THEMES } from '../fixtures/realHaThemes';
import type { Theme } from '../../src/types/homeassistant';

/**
 * F3 / HA-06 — the interim "no preview effect" badge.
 *
 * ⭐ WHAT THIS PINS. `themeService.applyThemeToElement` publishes a theme as
 * ~30 CSS custom properties, but HAVDM has no `var(--…)` consumers anywhere in
 * `src/` (`grep -rn 'var(--' src/` returns two hits, both comments saying so).
 * The only real canvas outcome is the RC5 two-colour workaround in `App.tsx`,
 * which reads `primaryBackground` and `primaryText` out of
 * `themeService.getThemeColors()`. A theme that defines NONE of the fields that
 * function reads therefore changes nothing the user can see, and the picker
 * said nothing about it. This badge marks exactly that case.
 *
 * ⚠⚠⚠ THE RED LEG, AND WHY IT IS VALID.
 * The discriminating assertions below go through `buildThemeOptions`, which
 * ALREADY EXISTS on base and already returns an option object — so on base they
 * fail behaviourally (`undefined !== true`) rather than at import. That matters:
 * a spec for a brand-new export cannot be red-legged at all, because stashing
 * `src/` makes it fail at import or with "X is not a function" (the documented
 * limit, hit in #125, #126, #127 and #129). For the same reason this file
 * deliberately does NOT import the predicate helper directly — it is tested
 * through the public surface that consumes it.
 *
 * ⚠⚠ AND WHY THE FIXTURE IS REAL, NOT SYNTHETIC.
 * `tests/fixtures/mockThemeData.ts:40` defines a `mushroom` theme supplying all
 * seven variables `getThemeColors` reads. The REAL Mushroom themes define none.
 * A badge test written against that fixture would pass VACUOUSLY — it would
 * assert the badge is absent, and be right for the wrong reason. The owner
 * ruled on 2026-08-10 that this leg must exercise the actual population, so
 * `tests/fixtures/realHaThemes.ts` carries the verbatim capture.
 */

/** Every field `themeService.getThemeColors()` returns. */
const CANVAS_FIELDS = [
  'primary',
  'accent',
  'primaryText',
  'secondaryText',
  'primaryBackground',
  'cardBackground',
] as const;

/**
 * The four real themes measured as defining NONE of the canvas fields.
 *
 * ⚠ This is a RECORD OF A MEASUREMENT, not the predicate's population. The
 * badge is computed per theme from `getThemeColors`, never from a name list —
 * a user's instance may carry any themes at all, and saved themes live on the
 * user's disk outside this repository entirely. The list is here so that a
 * change in the captured fixture shows up as a test failure rather than
 * silently altering what the suite proves.
 */
const REAL_THEMES_WITH_NO_CANVAS_COLOURS = [
  'Mushroom',
  'Mushroom Square',
  'Mushroom Shadow',
  'Mushroom Square Shadow',
];

/** The one real theme that DOES define all six — the negative control. */
const REAL_THEME_WITH_CANVAS_COLOURS = 'Material You';

const savedRecord = (name: string, theme: Theme): SavedThemeRecord => ({
  name,
  theme,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const optionFor = <T extends { value: string }>(options: T[], name: string) =>
  options.find((option) => option.value === name);

describe('the real installed themes — what getThemeColors actually returns', () => {
  /**
   * CONTROL LEG: passes on base AND on the branch. It measures the fixture and
   * the existing service, not the new field, and exists so that a red leg
   * failing for the wrong reason is distinguishable from one failing for the
   * right one.
   */
  it.each(REAL_THEMES_WITH_NO_CANVAS_COLOURS)(
    '%s defines none of the six canvas fields, in either mode',
    (themeName) => {
      const theme = REAL_HA_THEMES[themeName];
      expect(theme, `${themeName} is missing from the captured fixture`).toBeDefined();

      (['light', 'dark'] as const).forEach((mode) => {
        const colors = themeService.getThemeColors(theme, mode === 'dark');
        CANVAS_FIELDS.forEach((field) => {
          expect(colors[field], `${themeName}/${mode} unexpectedly defines ${field}`).toBeFalsy();
        });
      });
    },
  );

  /** CONTROL LEG: the negative control must genuinely be negative. */
  it('Material You defines all six canvas fields, in both modes', () => {
    const theme = REAL_HA_THEMES[REAL_THEME_WITH_CANVAS_COLOURS];

    (['light', 'dark'] as const).forEach((mode) => {
      const colors = themeService.getThemeColors(theme, mode === 'dark');
      CANVAS_FIELDS.forEach((field) => {
        expect(colors[field], `Material You/${mode} is missing ${field}`).toBeTruthy();
      });
    });
  });

  /** CONTROL LEG: the built-ins are the reason the picker is usable offline. */
  it.each(BUILT_IN_THEME_NAMES)('built-in %s defines all six canvas fields', (themeName) => {
    (['light', 'dark'] as const).forEach((mode) => {
      const colors = themeService.getThemeColors(BUILT_IN_THEMES[themeName], mode === 'dark');
      CANVAS_FIELDS.forEach((field) => {
        expect(colors[field], `${themeName}/${mode} is missing ${field}`).toBeTruthy();
      });
    });
  });
});

describe('buildThemeOptions marks themes with no canvas effect', () => {
  /** ⚠ RED LEG — fails on base with `undefined !== true`. */
  it.each(REAL_THEMES_WITH_NO_CANVAS_COLOURS)('marks the real %s theme', (themeName) => {
    const options = buildThemeOptions(REAL_HA_THEMES, {});
    const option = optionFor(options, themeName);

    expect(option, `${themeName} produced no option`).toBeDefined();
    expect(option?.definesNoCanvasColors).toBe(true);
  });

  /** ⚠ RED LEG on the accepting side — a false positive here is the worse bug. */
  it('does not mark Material You, which defines all six', () => {
    const options = buildThemeOptions(REAL_HA_THEMES, {});

    expect(optionFor(options, REAL_THEME_WITH_CANVAS_COLOURS)?.definesNoCanvasColors).toBe(false);
  });

  /** ⚠ RED LEG — no built-in may ever be marked. */
  it('marks no built-in theme', () => {
    const options = buildThemeOptions({ ...BUILT_IN_THEMES }, {});

    expect(options.map((option) => option.definesNoCanvasColors)).toEqual(
      BUILT_IN_THEME_NAMES.map(() => false),
    );
  });

  /**
   * ⚠ RED LEG covering the SAVED arm. `buildThemeOptions` has two sources and
   * the HA arm alone does not exercise the second; a saved theme lives on the
   * user's disk, outside this repository, and is the one population member no
   * capture can enumerate.
   */
  it('marks a saved theme that defines no canvas colours', () => {
    const savedMushroom = savedRecord('saved-mushroom', REAL_HA_THEMES['Mushroom Square']);
    const options = buildThemeOptions({}, { 'saved-mushroom': savedMushroom });

    expect(optionFor(options, 'saved-mushroom')?.definesNoCanvasColors).toBe(true);
  });

  it('does not mark a saved theme that defines canvas colours', () => {
    const savedRich = savedRecord('saved-rich', REAL_HA_THEMES[REAL_THEME_WITH_CANVAS_COLOURS]);
    const options = buildThemeOptions({}, { 'saved-rich': savedRich });

    expect(optionFor(options, 'saved-rich')?.definesNoCanvasColors).toBe(false);
  });

  /**
   * ⚠ RED LEG on the boundary, and the case that decides WHY the predicate
   * tests all six fields rather than the canvas's two.
   *
   * `getThemeColors` has two consumers: the canvas in `App.tsx`, which reads
   * only `primaryBackground` and `primaryText`, and `ThemePreviewPanel`, which
   * renders a swatch for ALL SIX and returns `null` for any unset one. A theme
   * defining only `primary-color` therefore leaves the canvas untouched but
   * still renders a Primary swatch — a visible effect. Marking it would tell
   * the user a lie about their own theme, so the predicate must stay false
   * here. This is the assertion that fails if anyone later "optimises" the
   * predicate down to the two fields the canvas reads.
   */
  it('does not mark a theme that defines exactly one of the six', () => {
    const oneFieldOnly = { 'primary-color': '#03a9f4' } as unknown as Theme;
    const options = buildThemeOptions({ 'One Field': oneFieldOnly }, {});

    expect(optionFor(options, 'One Field')?.definesNoCanvasColors).toBe(false);
  });

  /**
   * KNOWN-OPEN: a theme whose value is an UNRESOLVABLE `var()` reference is not
   * badged, even though it paints nothing.
   *
   * ⚠ This asserts the CURRENT, PASSING behaviour so the limit is pinned rather
   * than described in prose nobody re-reads. `definesNoCanvasColors` is a pure
   * function over the theme object: it can see that a value is a non-empty
   * string, but not whether that string resolves to a colour in a browser.
   * `var(--does-not-exist)` is truthy, so the theme escapes the badge while
   * having no visible effect — the exact case the badge exists to mark.
   *
   * ⓘ NOT hypothetical in form: `Material You` reaches the canvas through
   * `var(--md-sys-color-surface-container)` and paints only because that chain
   * bottoms out in a literal hex fallback — measured as `#eeedf4` on the
   * reference instance. A theme whose chain does NOT bottom out would slip
   * through, and no theme on that instance does.
   *
   * ⚠ Closing this needs computed styles, i.e. a rendered document — a
   * different mechanism from a pure predicate, and it belongs with the canvas
   * fidelity contract rather than this interim marking. Whoever closes it
   * BREAKS THIS TEST and must correct the docblocks in the same commit.
   */
  it('KNOWN-OPEN: does not mark a theme whose colours are unresolvable var() refs', () => {
    const unresolvable = {
      'primary-background-color': 'var(--does-not-exist)',
    } as unknown as Theme;
    const options = buildThemeOptions({ Unresolvable: unresolvable }, {});

    expect(optionFor(options, 'Unresolvable')?.definesNoCanvasColors).toBe(false);
  });

  /**
   * ⚠ RED LEG for mode-sensitivity, and the one place a SYNTHETIC theme is the
   * right instrument. The canvas reads `getThemeColors(theme, darkMode)`, so
   * the badge must follow the selected mode. No real theme on the reference
   * instance distinguishes the two modes, so the real population cannot prove
   * this property at all — the class being tested here is the PREDICATE'S
   * BEHAVIOUR, not the population's composition, and a constructed input is
   * what exercises it.
   */
  it('follows the selected mode when a theme defines colours in one mode only', () => {
    const darkOnly: Theme = {
      modes: {
        dark: {
          'primary-color': '#03a9f4',
          'text-primary-color': '#ffffff',
          'accent-color': '#ff9800',
          'primary-background-color': '#111417',
          'card-background-color': '#1c2126',
          'secondary-text-color': '#b3c1cc',
        },
      },
    };

    const light = buildThemeOptions({ 'Dark Only': darkOnly }, {}, false);
    const dark = buildThemeOptions({ 'Dark Only': darkOnly }, {}, true);

    expect(optionFor(light, 'Dark Only')?.definesNoCanvasColors).toBe(true);
    expect(optionFor(dark, 'Dark Only')?.definesNoCanvasColors).toBe(false);
  });
});

describe('buildThemeOptions keeps the contract the rest of the suite depends on', () => {
  /**
   * CONTROL LEG — passes on base AND branch.
   *
   * ⚠ `label` must stay a PLAIN STRING. `tests/e2e/theme-restore.spec.ts:79`
   * clicks `.ant-select-item-option[title="${themeName}"]`, and
   * `tests/support/dsl/themeManager.ts` matches anchored `^${name}$` text —
   * antd derives that `title` from a string label. Rendering the badge INTO the
   * label would change both and break those selectors, which is why the badge
   * is a separate field rendered via `optionRender`/`labelRender` instead.
   */
  it('leaves label and value as the bare theme name for every real theme', () => {
    const options = buildThemeOptions(REAL_HA_THEMES, {});

    options.forEach((option) => {
      expect(option.label).toBe(option.value);
      expect(typeof option.label).toBe('string');
    });
    expect(options.map((option) => option.value)).toEqual(Object.keys(REAL_HA_THEMES));
  });

  /** CONTROL LEG: the empty case still yields an empty list. */
  it('returns an empty list when both sources are empty', () => {
    expect(buildThemeOptions({}, {})).toEqual([]);
  });

  /** CONTROL LEG: the union and de-duplication behaviour is unchanged. */
  it('still unions saved themes without duplicating an available one', () => {
    const name = BUILT_IN_THEME_NAMES[0];
    const options = buildThemeOptions(
      { ...BUILT_IN_THEMES },
      {
        [name]: savedRecord(name, BUILT_IN_THEMES[name]),
        'Only Saved': savedRecord('Only Saved', BUILT_IN_THEMES[name]),
      },
    );

    expect(options.filter((option) => option.value === name)).toHaveLength(1);
    expect(options.map((option) => option.value)).toContain('Only Saved');
  });
});
