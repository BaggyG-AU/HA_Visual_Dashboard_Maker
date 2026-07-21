import type { DashboardConfig, View } from '../types/dashboard';

/**
 * Live-Preview deploy — target resolution and multi-view preservation (Phase 0.2).
 *
 * Two destructive defects lived on the Live-Preview → Deploy path (audit
 * `drawer_havdm_investigations_b7af8f1d2740b59a6463c815`):
 *   1. The deploy call passed a hardcoded `null` target, which the WS layer
 *      coerces to `'lovelace'` (the DEFAULT dashboard) — so deploying a *custom*
 *      dashboard silently overwrote the user's default.
 *   2. The temp-write replaced the whole dashboard with an array of the single
 *      edited view, truncating a multi-view dashboard on the first drag.
 *
 * These two pure functions encode the fixes so they can be unit-tested without a
 * live Home Assistant or an App-level harness.
 */

/**
 * Identity of the Home Assistant dashboard the current design was loaded from.
 *
 * `urlPath === null` means the genuine HA DEFAULT dashboard (`lovelace`). This is
 * DISTINCT from having no known source at all: when a design was opened from a
 * file or newly created, the caller holds `null` for the whole `SourceDashboard`
 * — see {@link resolveLivePreviewDeployTarget}.
 */
export interface SourceDashboard {
  /** HA `url_path` of the source dashboard; `null` ONLY for the default `lovelace`. */
  urlPath: string | null;
  /** Human-readable title, for confirmation prompts. */
  title: string;
}

/** Outcome of {@link resolveLivePreviewDeployTarget}. */
export type LivePreviewDeployTarget =
  { kind: 'known'; urlPath: string | null; title: string } | { kind: 'unknown' };

/**
 * Resolve where a Live-Preview deploy should write.
 *
 * The historical destructive bug passed a hardcoded `null` to the deploy call,
 * which the WS layer coerces to `'lovelace'`. This guard makes a `null` target
 * reachable ONLY when the source explicitly IS the default dashboard; every
 * other case is either a real `url_path` or `'unknown'` (route the caller to
 * explicit target selection instead of guessing).
 */
export function resolveLivePreviewDeployTarget(
  source: SourceDashboard | null,
): LivePreviewDeployTarget {
  if (!source) {
    return { kind: 'unknown' };
  }
  return { kind: 'known', urlPath: source.urlPath, title: source.title };
}

/**
 * Human-readable description of the Live-Preview deploy target, for the deploy
 * confirmation prompt. Returns `null` when there is no known target (the caller
 * then routes to the explicit DeployDialog instead of naming a destination).
 */
export function describeLiveDeployTarget(source: SourceDashboard | null): string | null {
  const target = resolveLivePreviewDeployTarget(source);
  if (target.kind === 'unknown') {
    return null;
  }
  return target.urlPath === null
    ? `your default dashboard “${target.title}”`
    : `“${target.title}” (/${target.urlPath})`;
}

/**
 * Merge an edited single view back into the full dashboard config, preserving
 * every OTHER view untouched.
 *
 * The Live-Preview temp-write historically replaced the whole dashboard with an
 * array of the ONE edited view (`views: [updatedView]`), truncating a multi-view
 * dashboard on the first drag. This merge is the fix: only the view at
 * `viewIndex` is replaced. An out-of-range index returns the config unchanged
 * (defensive — never drop views).
 */
export function mergeEditedView(
  config: DashboardConfig,
  viewIndex: number,
  updatedView: View,
): DashboardConfig {
  if (viewIndex < 0 || viewIndex >= config.views.length) {
    return config;
  }
  return {
    ...config,
    views: config.views.map((view, index) => (index === viewIndex ? updatedView : view)),
  };
}
