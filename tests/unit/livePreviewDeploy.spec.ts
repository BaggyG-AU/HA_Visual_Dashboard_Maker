import { describe, it, expect } from 'vitest';
import {
  resolveLivePreviewDeployTarget,
  describeLiveDeployTarget,
  mergeEditedView,
  type SourceDashboard,
} from '../../src/services/livePreviewDeploy';
import type { DashboardConfig, View } from '../../src/types/dashboard';

const view = (title: string): View => ({ title, path: title.toLowerCase(), cards: [] });

const multiView = (): DashboardConfig => ({
  title: 'My Home',
  theme: 'dark',
  views: [view('Overview'), view('Energy'), view('Security')],
});

describe('resolveLivePreviewDeployTarget (Phase 0.2 — never silently default to lovelace)', () => {
  it('returns unknown when there is no known source dashboard (file / new dashboard)', () => {
    expect(resolveLivePreviewDeployTarget(null)).toEqual({ kind: 'unknown' });
  });

  it('routes a custom dashboard back to its own url_path', () => {
    const source: SourceDashboard = { urlPath: 'energy', title: 'Energy' };
    expect(resolveLivePreviewDeployTarget(source)).toEqual({
      kind: 'known',
      urlPath: 'energy',
      title: 'Energy',
    });
  });

  it('permits a null target ONLY when the source explicitly IS the default dashboard', () => {
    const source: SourceDashboard = { urlPath: null, title: 'Overview' };
    expect(resolveLivePreviewDeployTarget(source)).toEqual({
      kind: 'known',
      urlPath: null,
      title: 'Overview',
    });
  });
});

describe('describeLiveDeployTarget (Phase 0.2 — the confirm names the destination)', () => {
  it('returns null when there is no known target', () => {
    expect(describeLiveDeployTarget(null)).toBeNull();
  });

  it('names the default dashboard plainly', () => {
    expect(describeLiveDeployTarget({ urlPath: null, title: 'Overview' })).toContain('default');
    expect(describeLiveDeployTarget({ urlPath: null, title: 'Overview' })).toContain('Overview');
  });

  it('names a custom dashboard with its url_path', () => {
    const label = describeLiveDeployTarget({ urlPath: 'energy', title: 'Energy' });
    expect(label).toContain('Energy');
    expect(label).toContain('/energy');
  });
});

describe('mergeEditedView (Phase 0.2 — multi-view preservation)', () => {
  it('replaces only the edited view and keeps every other view', () => {
    const config = multiView();
    const edited: View = { ...view('Energy'), background: '#123456' };

    const merged = mergeEditedView(config, 1, edited);

    expect(merged.views).toHaveLength(3);
    expect(merged.views[0]).toBe(config.views[0]); // Overview untouched
    expect(merged.views[2]).toBe(config.views[2]); // Security untouched
    expect(merged.views[1]).toEqual(edited); // Energy replaced
    expect(merged.views[1].background).toBe('#123456');
  });

  it('preserves top-level dashboard keys (title, theme)', () => {
    const config = multiView();
    const merged = mergeEditedView(config, 0, view('Overview v2'));
    expect(merged.title).toBe('My Home');
    expect(merged.theme).toBe('dark');
  });

  it('returns the config unchanged for an out-of-range index (never drops views)', () => {
    const config = multiView();
    expect(mergeEditedView(config, 5, view('X')).views).toHaveLength(3);
    expect(mergeEditedView(config, -1, view('X')).views).toHaveLength(3);
  });

  it('does not mutate the input config', () => {
    const config = multiView();
    const before = config.views[1];
    mergeEditedView(config, 1, view('Energy edited'));
    expect(config.views[1]).toBe(before);
  });
});
