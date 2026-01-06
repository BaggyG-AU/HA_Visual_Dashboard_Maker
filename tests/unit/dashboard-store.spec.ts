import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../../src/store/dashboardStore';
import { DashboardConfig } from '../../src/types/dashboard';

const resetStore = () => {
  useDashboardStore.setState({
    config: null,
    filePath: null,
    isLoading: false,
    error: null,
    isDirty: false,
    selectedViewIndex: null,
    selectedCardIndex: null,
    isBatching: false,
    past: [],
    future: [],
  });
};

const baseConfig: DashboardConfig = {
  title: 'Test',
  views: [
    {
      title: 'Main',
      path: 'main',
      cards: [],
    } as DashboardConfig['views'][number],
  ],
};

describe('dashboard store model utilities', () => {
  beforeEach(() => {
    resetStore();
  });

  it('loads dashboard YAML successfully and sets selection', () => {
    const yaml = `title: Test\nviews:\n  - title: Main\n    path: main\n    cards:\n      - type: markdown\n        content: "Hello"`;
    useDashboardStore.getState().loadDashboard(yaml, '/tmp/test.yaml');

    const state = useDashboardStore.getState();
    expect(state.config?.title).toBe('Test');
    expect(state.selectedViewIndex).toBe(0);
    expect(state.error).toBeNull();
    expect(state.isDirty).toBe(false);
  });

  it('sets error when loading invalid YAML', () => {
    useDashboardStore.getState().loadDashboard('title: Missing views', '/tmp/invalid.yaml');
    const state = useDashboardStore.getState();
    expect(state.config).toBeNull();
    expect(state.error).toBeTruthy();
  });

  it('tracks history, dirty state, and undo/redo', () => {
    // seed config
    useDashboardStore.setState({ config: baseConfig });

    const nextConfig: DashboardConfig = {
      ...baseConfig,
      views: [
        { ...baseConfig.views[0], cards: [{ type: 'markdown', content: 'Updated' }] } as DashboardConfig['views'][number],
      ],
    };

    useDashboardStore.getState().updateConfig(nextConfig);
    let state = useDashboardStore.getState();
    expect(state.past.length).toBe(1);
    expect(state.isDirty).toBe(true);

    state.undo();
    state = useDashboardStore.getState();
    expect(state.future.length).toBe(1);
    expect(state.isDirty).toBe(true);

    state.redo();
    state = useDashboardStore.getState();
    expect(state.config?.views[0].cards.length).toBe(1);
  });

  it('batches rapid edits into a single history entry', () => {
    useDashboardStore.setState({ config: baseConfig, isBatching: false });

    const state = useDashboardStore.getState();
    state.beginBatchUpdate();

    const v0 = baseConfig.views[0] as DashboardConfig['views'][number];
    const baseCards = v0.cards ?? [];

    state.applyBatchedConfig({
      ...baseConfig,
      views: [{ ...v0, cards: [...baseCards, { type: 'markdown', content: 'A' }] } as DashboardConfig['views'][number]],
    });
    state.applyBatchedConfig({
      ...baseConfig,
      views: [{ ...v0, cards: [...baseCards, { type: 'markdown', content: 'AB' }] } as DashboardConfig['views'][number]],
    });

    let after = useDashboardStore.getState();
    expect(after.past.length).toBe(1); // only the pre-edit snapshot
    expect(after.isDirty).toBe(true);

    after.endBatchUpdate();
    after = useDashboardStore.getState();
    expect(after.isBatching).toBe(false);

    after.undo();
    after = useDashboardStore.getState();
    expect(after.future.length).toBe(1);
  });

  it('supports selection updates and dirty toggles', () => {
    const actions = useDashboardStore.getState();
    actions.setSelectedView(2);
    let state = useDashboardStore.getState();
    expect(state.selectedViewIndex).toBe(2);
    expect(state.selectedCardIndex).toBeNull();

    actions.setSelectedCard(2, 1);
    state = useDashboardStore.getState();
    expect(state.selectedCardIndex).toBe(1);

    actions.markDirty();
    actions.markClean();
    expect(useDashboardStore.getState().isDirty).toBe(false);
  });
});
