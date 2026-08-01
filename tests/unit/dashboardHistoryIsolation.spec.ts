/**
 * FILE-04's SECOND defect — the undo stack must not tunnel between documents.
 *
 * ⭐ Round-2 UAT, card FILE-04 (High, regression), owner verbatim: "I opened and
 * new dashboard (C:\dev\homeassistant2\dashboards\uat_dashboard.yaml). At first
 * the dashboard opened as expected. However when I created a new button on the
 * canvas the dashboard reverted back to the template dashboard that I had
 * previously created. … In any event, if a new dashboard is created or opened,
 * previous loaded dashboards should not be loaded."
 *
 * That last sentence is a SEPARATE defect from the missing save prompt, and it
 * is the one that actually produced the revert: `loadDashboard` replaced the
 * config but left `past`/`future` holding the OUTGOING document's snapshots, so
 * undo walked out of the opened file and into the previous one. `undo` restores
 * a config but NOT a `filePath`, so a Ctrl+S at that moment writes the wrong
 * dashboard into the user's file.
 *
 * ⚠ Why it survived round 1: the defect needs TWO documents in one session, and
 * every test used one. These assertions are all two-document by construction.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../../src/store/dashboardStore';

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

const dashboardYaml = (title: string, cardTypes: string[]) =>
  [
    `title: ${title}`,
    'views:',
    '  - title: Home',
    '    path: home',
    '    cards:',
    ...(cardTypes.length ? cardTypes.map((t) => `      - type: ${t}`) : ['      []']),
    '',
  ].join('\n');

/** Edit whatever is loaded, the way any canvas action does. */
const addCard = (type: string) => {
  const state = useDashboardStore.getState();
  const config = state.config!;
  state.updateConfig({
    ...config,
    views: config.views.map((view, i) =>
      i === 0 ? { ...view, cards: [...(view.cards ?? []), { type } as never] } : view,
    ),
  });
};

const titles = () => useDashboardStore.getState().past.map((c) => c.title);

describe('FILE-04: undo history is scoped to one document', () => {
  beforeEach(resetStore);

  it('records history for the document actually open (control leg)', () => {
    // ⭐ CONTROL. Without this, every "the history is empty" assertion below
    // could pass against a store that never records history at all — and
    // asserting an absence is the most dangerous assertion in this codebase.
    useDashboardStore.getState().loadDashboard(dashboardYaml('TEMPLATE', ['markdown']), null);
    expect(useDashboardStore.getState().canUndo()).toBe(false);

    addCard('gauge');

    expect(useDashboardStore.getState().past).toHaveLength(1);
    expect(useDashboardStore.getState().canUndo()).toBe(true);
    expect(titles()).toEqual(['TEMPLATE']);
  });

  it('discards the outgoing document history when another dashboard is opened', () => {
    useDashboardStore.getState().loadDashboard(dashboardYaml('TEMPLATE', ['markdown']), null);
    addCard('gauge');
    expect(useDashboardStore.getState().canUndo()).toBe(true);

    // ---- the defect under test ----
    useDashboardStore
      .getState()
      .loadDashboard(dashboardYaml('UAT DASHBOARD', ['entities']), 'C:\\dev\\uat_dashboard.yaml');

    const state = useDashboardStore.getState();
    // Pre-fix: past.length === 1 and past[0].title === 'TEMPLATE'.
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
    // ⚠ THE OBSERVABLE THE OWNER WOULD HAVE SEEN: a freshly-opened, CLEAN
    // document whose Undo button was nonetheless enabled, pointing at a file
    // they were no longer editing.
    expect(state.canUndo()).toBe(false);
    expect(state.canRedo()).toBe(false);
    expect(state.isDirty).toBe(false);
  });

  it('cannot reach a previously created dashboard by undoing (the reported symptom)', () => {
    // The owner's exact sequence.
    useDashboardStore.getState().loadDashboard(dashboardYaml('TEMPLATE', ['markdown']), null);
    addCard('gauge'); // they built the template out

    useDashboardStore
      .getState()
      .loadDashboard(dashboardYaml('UAT DASHBOARD', ['entities']), 'C:\\dev\\uat_dashboard.yaml');
    addCard('button'); // "when I created a new button on the canvas"

    // Undo as many times as the stack allows, then some.
    for (let i = 0; i < 5; i += 1) useDashboardStore.getState().undo();

    const state = useDashboardStore.getState();
    // Pre-fix this read 'TEMPLATE' — the revert.
    expect(state.config?.title).toBe('UAT DASHBOARD');
    // ⚠⚠ And the file the document claims to be must never disagree with its
    // content: `undo` restores no filePath, so a stale config here would be
    // saved straight over uat_dashboard.yaml by the next Ctrl+S.
    expect(state.filePath).toBe('C:\\dev\\uat_dashboard.yaml');
  });

  it('does not leak forward through redo either', () => {
    useDashboardStore.getState().loadDashboard(dashboardYaml('TEMPLATE', ['markdown']), null);
    addCard('gauge');
    useDashboardStore.getState().undo(); // populates `future` from the template
    expect(useDashboardStore.getState().canRedo()).toBe(true);

    useDashboardStore.getState().loadDashboard(dashboardYaml('UAT DASHBOARD', ['entities']), null);

    // Pre-fix: canRedo() was true and one Ctrl+Y produced the other document.
    expect(useDashboardStore.getState().canRedo()).toBe(false);
    useDashboardStore.getState().redo();
    expect(useDashboardStore.getState().config?.title).toBe('UAT DASHBOARD');
  });

  it('keeps the history of the open document when a load FAILS', () => {
    // ⚠ Interaction with HA-03's fix: a dashboard that will not parse leaves the
    // canvas untouched, so the history still belongs to what is on it. Clearing
    // it here would punish the user for opening an unreadable file.
    useDashboardStore.getState().loadDashboard(dashboardYaml('TEMPLATE', ['markdown']), null);
    addCard('gauge');

    useDashboardStore.getState().loadDashboard('strategy:\n  type: original-states\n', null);

    const state = useDashboardStore.getState();
    expect(state.error).toBeTruthy();
    expect(state.config?.title).toBe('TEMPLATE');
    expect(state.canUndo()).toBe(true);
    expect(titles()).toEqual(['TEMPLATE']);
  });
});

describe("FILE-04: the YAML editor's Apply is an edit, not a replacement", () => {
  beforeEach(resetStore);

  it('pushes one undo step and leaves the document dirty', () => {
    useDashboardStore
      .getState()
      .loadDashboard(dashboardYaml('UAT DASHBOARD', ['entities']), '/tmp/uat.yaml');
    addCard('button');
    const historyBefore = useDashboardStore.getState().past.length;

    useDashboardStore
      .getState()
      .loadDashboard(
        dashboardYaml('UAT DASHBOARD', ['entities', 'button', 'markdown']),
        '/tmp/uat.yaml',
        {
          mode: 'edit',
        },
      );

    const state = useDashboardStore.getState();
    expect(state.past).toHaveLength(historyBefore + 1);
    expect(state.canUndo()).toBe(true);
    // ⚠ Pre-fix this was FALSE: Apply routed through the replace path, which
    // marks the document clean. An applied-but-unsaved edit reported as saved
    // also defeats the unsaved-changes guard, which keys on isDirty.
    expect(state.isDirty).toBe(true);

    // And the step it pushed is the right one — undo returns the pre-Apply doc.
    useDashboardStore.getState().undo();
    expect(useDashboardStore.getState().config?.views[0].cards).toHaveLength(2);
  });
});
