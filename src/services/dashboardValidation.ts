/**
 * The shared view-type validator (remediation item F1 / UAT defect HA-07).
 *
 * ⭐ THE ONE RULE THIS MODULE EXISTS TO ENFORCE: **HAVDM MUST NOT BE STRICTER
 * THAN HOME ASSISTANT.** The loop this replaces (`DeployDialog.tsx:112-121`)
 * demanded a `title` and a top-level `cards` array on EVERY view, and neither is
 * a Home Assistant requirement. The result was HA-07 — HAVDM refusing to deploy
 * a dashboard HAVDM itself authored, because its Sections view keeps its cards
 * under `sections[].cards` and has no top-level `cards` at all.
 *
 * === WHAT HOME ASSISTANT ACTUALLY DOES, MEASURED 2026-08-04 ===
 *
 * HA resolves a view's layout with a FALLBACK CHAIN, not a bare `type` lookup.
 * Read verbatim out of the reference instance's own served frontend bundle
 * (HA 2026.7.4, webpack module 25932):
 *
 *   type ? type : panel ? "panel" : sections ? "sections" : cards ? "masonry" : "sections"
 *
 * {@link resolveViewKind} below is that chain. Every rule in this module is
 * keyed off it rather than off `view.type` alone.
 *
 * ⚠⚠ THESE RULES ARE MEASUREMENTS, NOT INFERENCES, AND THAT DISTINCTION IS THE
 * WHOLE POINT. A claim about what another system does with our output is a
 * hypothesis until that system is measured — reading our own code proves what we
 * EMIT, never what the CONSUMER accepts. So each shape below was deployed to a
 * real instance and looked at before a rule was written for it:
 *
 *  - THREE views on the reference instance (`ha.home.local`, read-only) work
 *    today with NO top-level `cards`: `family-dashboard`, `admin-dashboard`, and
 *    `environmental-control` — the last one typeless-with-`sections`, which is
 *    exactly the shape HAVDM's own export emits.
 *  - Deployed to `ha-test.home.local` (writable per Phase 7 amendment-04) and
 *    rendered in a real browser, ALL of these were accepted by HA's own
 *    server-side schema and rendered with ZERO error cards: an UNTITLED view
 *    (`hui-masonry-view`, its card present); a view-level STRATEGY view (50
 *    generated cards); a `type: sections` view; a typeless `sections` view; and
 *    a DASHBOARD-level strategy config with no `views` key at all (50 cards).
 *
 * === WHAT THIS MODULE DELIBERATELY DOES NOT DO ===
 *
 * ⚠ IT NEVER MUTATES THE CONFIG TO MAKE IT PASS. The validator reports and the
 * user decides. Deploy sends the already-sanitised object verbatim (slice B0);
 * a validator that quietly inserted `cards: []` to satisfy itself would be
 * editing the user's dashboard behind their back, which is the same class of
 * defect as the one it is fixing.
 *
 * ⚠ A CONTENT-LESS VIEW IS NOT AN ERROR. A view with no cards, no sections and
 * no strategy renders as an empty view in HA, which accepts it — so refusing it
 * would repeat exactly the bug this module removes. An entirely empty DASHBOARD
 * is still refused by {@link validateDashboardForDeploy}.
 */

import type { DashboardConfig, View } from '../types/dashboard';

/**
 * How Home Assistant will lay a view out — the four outcomes of HA's own
 * fallback chain (see the module comment for the verbatim source).
 *
 * `strategy` is not part of HA's chain: it is orthogonal, because HA generates a
 * strategy view's cards before laying them out. It is resolved FIRST here
 * because it is the fact that decides whether missing cards are a problem.
 */
export type ViewKind = 'strategy' | 'sections' | 'panel' | 'cards';

/** A single problem found in a dashboard, in the words the user will read. */
export interface ViewValidationError {
  /** 0-based index of the offending view; `null` for dashboard-level problems. */
  viewIndex: number | null;
  /** The complete, user-facing sentence. Names the view and what is wrong. */
  message: string;
}

/**
 * A validation failure, distinguishable from a connection or deploy failure.
 *
 * ⭐ THIS CLASS IS THE FIX FOR THE FOURTH F1 DEFECT. `DeployDialog` used to tell
 * the user "Please check your connection and try again" for a PURE VALIDATION
 * failure — blaming a cause that had nothing to do with it, for a step that runs
 * before any network call is made. Blaming the wrong cause is worse than
 * silence: it sends the user to go and check something that was never broken.
 */
export class DashboardValidationError extends Error {
  readonly errors: ViewValidationError[];

  constructor(errors: ViewValidationError[]) {
    super(errors.map((error) => error.message).join(' '));
    this.name = 'DashboardValidationError';
    this.errors = errors;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Resolve how Home Assistant will treat this view — HA's own fallback chain,
 * with `strategy` checked first.
 *
 * ⚠ Note what is NOT here: a strict `view.type === 'sections'` test. That strict
 * test is why HAVDM cannot re-open its own export (`GridCanvas.tsx:295`) — HA
 * infers a sections view from the `sections` KEY, and HAVDM has no equivalent
 * fallback. Fixing the canvas side is F9's; this module at least ensures the
 * DEPLOY side reasons the way the consumer does.
 */
export const resolveViewKind = (view: View): ViewKind => {
  if (view.strategy !== undefined) return 'strategy';
  if (view.type) return view.type === 'sections' ? 'sections' : 'cards';
  if (view.panel) return 'panel';
  if (view.sections !== undefined) return 'sections';
  return 'cards';
};

/**
 * How to name a view in an error message.
 *
 * ⚠ Untitled views are valid in Home Assistant (measured — see the module
 * comment), so a message must never render `View "undefined"`. The 1-based
 * ordinal is what the user sees in the view tabs.
 */
export const describeView = (view: View, index: number): string =>
  typeof view.title === 'string' && view.title.length > 0
    ? `View "${view.title}"`
    : `View ${index + 1}`;

/**
 * Validate one view against what Home Assistant will accept.
 *
 * Returns every problem found in this view, or an empty array when HA could use
 * it. The rules reject ONLY shapes Home Assistant itself cannot use — a
 * malformed container, or a strategy block HA could not run.
 */
export const validateView = (view: View, index: number): ViewValidationError[] => {
  const ordinal = `View ${index + 1}`;

  if (!isRecord(view)) {
    return [
      {
        viewIndex: index,
        message: `${ordinal} is not a valid view — expected a set of view properties, found ${
          view === null ? 'nothing' : typeof view
        }.`,
      },
    ];
  }

  const errors: ViewValidationError[] = [];
  const name = describeView(view, index);

  // `strategy` — Home Assistant runs it to GENERATE the view's cards, so a
  // strategy view legitimately has none of its own. What it must have is a type
  // HA can dispatch on; a strategy block without one cannot be run.
  if (view.strategy !== undefined) {
    const strategy: unknown = view.strategy;
    if (!isRecord(strategy)) {
      errors.push({
        viewIndex: index,
        message: `${name} has a "strategy" that is not a set of strategy options.`,
      });
    } else if (typeof strategy.type !== 'string' || strategy.type.length === 0) {
      errors.push({
        viewIndex: index,
        message: `${name} has a "strategy" with no "type" — Home Assistant needs the strategy's type to generate the view.`,
      });
    }
  }

  // `sections` — where a Sections view's cards actually live. THIS IS HA-07: the
  // old loop never looked here, so a Sections view HAVDM itself authored was
  // rejected for having no top-level `cards`.
  if (view.sections !== undefined) {
    if (!Array.isArray(view.sections)) {
      errors.push({
        viewIndex: index,
        message: `${name} has a "sections" property that is not a list of sections.`,
      });
    } else {
      view.sections.forEach((section, sectionIndex) => {
        if (!isRecord(section)) {
          errors.push({
            viewIndex: index,
            message: `${name}, section ${sectionIndex + 1} is not a valid section.`,
          });
          return;
        }
        if (section.cards !== undefined && !Array.isArray(section.cards)) {
          errors.push({
            viewIndex: index,
            message: `${name}, section ${sectionIndex + 1} has a "cards" property that is not a list of cards.`,
          });
        }
      });
    }
  }

  // `cards` — optional everywhere (a Sections view has none, a strategy view has
  // none, and an empty view is valid), but a `cards` key that is not a list is
  // something Home Assistant cannot render.
  if (view.cards !== undefined && !Array.isArray(view.cards)) {
    errors.push({
      viewIndex: index,
      message: `${name} has a "cards" property that is not a list of cards.`,
    });
  }

  return errors;
};

/**
 * Validate a whole dashboard for deployment.
 *
 * ⭐ Collects EVERY problem rather than throwing on the first. The loop this
 * replaces stopped at the first offending view, so a user with three problems
 * fixed one, redeployed, and was told about the next — three round trips to
 * learn what one message could have said.
 */
export const validateDashboardForDeploy = (
  config: DashboardConfig | null | undefined,
): ViewValidationError[] => {
  if (!config) {
    return [{ viewIndex: null, message: 'No dashboard configuration to deploy.' }];
  }

  // ⭐ A DASHBOARD-LEVEL STRATEGY HAS NO `views` AT ALL, AND THAT IS VALID.
  // Home Assistant generates the entire dashboard from it at render time
  // (measured: accepted and rendered 50 cards with zero error cards). The old
  // "Dashboard must contain at least one view" check refused it — and per
  // `types/dashboard.ts`, deploying anything else in its place "replaces the
  // user's generated dashboard with nothing".
  if (config.strategy !== undefined) {
    const strategy: unknown = config.strategy;
    if (!isRecord(strategy)) {
      return [
        {
          viewIndex: null,
          message: 'This dashboard has a "strategy" that is not a set of options.',
        },
      ];
    }
    if (typeof strategy.type !== 'string' || strategy.type.length === 0) {
      return [
        {
          viewIndex: null,
          message:
            'This dashboard has a "strategy" with no "type" — Home Assistant needs the strategy\'s type to generate the dashboard.',
        },
      ];
    }
    return [];
  }

  if (!config.views || !Array.isArray(config.views) || config.views.length === 0) {
    return [
      {
        viewIndex: null,
        message: 'Dashboard must contain at least one view. Your dashboard appears to be empty.',
      },
    ];
  }

  return config.views.flatMap((view, index) => validateView(view, index));
};

/**
 * Validate, and throw a {@link DashboardValidationError} if anything is wrong.
 *
 * The throwing wrapper exists so the deploy flow reads as a straight line while
 * still letting the dialog tell a validation failure apart from a network one.
 *
 * ⚠ Declared as a `function` rather than an arrow const because it is a TypeScript
 * ASSERTION function: returning normally proves `config` is a `DashboardConfig`,
 * which is what lets the caller use it without a second null check. Assertion
 * signatures are not available on an un-annotated arrow function.
 */
export function assertDeployable(
  config: DashboardConfig | null | undefined,
): asserts config is DashboardConfig {
  const errors = validateDashboardForDeploy(config);
  if (errors.length > 0) throw new DashboardValidationError(errors);
}
