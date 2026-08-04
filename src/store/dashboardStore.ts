import { create } from 'zustand';
import { DashboardConfig, DashboardState } from '../types/dashboard';
import { yamlService } from '../services/yamlService';
import {
  normalizeCardIndices,
  resolveSelectionState,
  type SelectionMode,
} from '../utils/bulkSelection';
import { deepClone } from '../utils/deepClone';

interface HistoryState {
  past: DashboardConfig[];
  future: DashboardConfig[];
}

/**
 * How a `loadDashboard` call relates to the document already on the canvas.
 *
 * ⭐⭐ FILE-04. `loadDashboard` was serving TWO different jobs through one
 * signature, and conflating them is what let a previous dashboard come back:
 *
 * - `'replace'` (default) — a DIFFERENT document takes the canvas: File > Open,
 *   Open Recent, New, a template, a preset, an HA download. The outgoing
 *   document's undo history is meaningless against the incoming one and MUST be
 *   discarded.
 * - `'edit'` — the SAME document, re-parsed from text the user just wrote in the
 *   YAML editor. That is an ordinary edit, so it pushes ONE undo step and leaves
 *   the document dirty, exactly like any other change.
 */
export type LoadDashboardMode = 'replace' | 'edit';

interface DashboardActions {
  loadDashboard: (
    yamlContent: string,
    filePath: string | null,
    options?: { mode?: LoadDashboardMode },
  ) => void;
  updateConfig: (config: DashboardConfig) => void;
  beginBatchUpdate: () => void;
  applyBatchedConfig: (config: DashboardConfig) => void;
  endBatchUpdate: () => void;
  setSelectedView: (index: number | null) => void;
  setSelectedCard: (viewIndex: number | null, cardIndex: number | null) => void;
  setSelectedSectionCard: (
    viewIndex: number | null,
    sectionIndex: number | null,
    cardIndex: number | null,
  ) => void;
  setSelectedCards: (
    viewIndex: number | null,
    cardIndices: number[],
    primaryCardIndex?: number | null,
  ) => void;
  selectCardWithMode: (
    viewIndex: number | null,
    cardIndex: number | null,
    mode?: SelectionMode,
    cardCount?: number,
  ) => void;
  selectSectionCardWithMode: (
    viewIndex: number | null,
    sectionIndex: number,
    cardIndex: number | null,
    mode?: SelectionMode,
    cardCount?: number,
  ) => void;
  setSelectedSectionCards: (
    viewIndex: number | null,
    sectionIndex: number,
    cardIndices: number[],
    primaryCardIndex?: number | null,
  ) => void;
  markDirty: () => void;
  markClean: () => void;
  markSavedAs: (filePath: string) => void;
  clearDashboard: () => void;
  setError: (error: string | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

type SelectionState = {
  selectedCardIndices: number[];
  selectionAnchorCardIndex: number | null;
  historyNavigationVersion: number;
  // Tier 4: which section a section-view card selection targets. `null` means
  // the selection addresses the flat `view.cards` (every non-sections view, and
  // the default). A number addresses `view.sections[i].cards`. Every flat
  // selection path resets this to null so non-sections behaviour is unchanged.
  selectedSectionIndex: number | null;
};

type DashboardStore = DashboardState & DashboardActions & HistoryState & SelectionState;

// Extracted to src/utils/deepClone.ts in WS3 slice C so the clipboard boundary
// can reuse the same guarantee instead of reimplementing it. Behaviour is
// unchanged: structuredClone when available, JSON round-trip otherwise.
const cloneConfig = (config: DashboardConfig): DashboardConfig => deepClone(config);

const initialState: DashboardState & HistoryState & SelectionState = {
  config: null,
  filePath: null,
  isLoading: false,
  error: null,
  isDirty: false,
  selectedViewIndex: null,
  selectedCardIndex: null,
  selectedCardIndices: [],
  selectionAnchorCardIndex: null,
  selectedSectionIndex: null,
  historyNavigationVersion: 0,
  isBatching: false,
  past: [],
  future: [],
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initialState,

  loadDashboard: (
    yamlContent: string,
    filePath: string | null,
    options?: { mode?: LoadDashboardMode },
  ) => {
    const mode: LoadDashboardMode = options?.mode ?? 'replace';
    set({ isLoading: true, error: null });

    const result = yamlService.parseDashboard(yamlContent);

    if (result.success && result.data) {
      const previousConfig = get().config;

      set((state) => ({
        config: result.data as DashboardConfig,
        filePath,
        isLoading: false,
        error: null,
        selectedViewIndex: (result.data as DashboardConfig).views.length > 0 ? 0 : null,
        selectedCardIndex: null,
        selectedCardIndices: [],
        selectionAnchorCardIndex: null,

        // ⭐⭐⭐ FILE-04's SECOND DEFECT — THE ONE THE OWNER ACTUALLY SAW.
        //
        // This used to leave `past`/`future` completely untouched, so the undo
        // history of the PREVIOUS document survived a document replacement. The
        // owner opened a dashboard from disk, added a button, pressed Ctrl+Z —
        // and the canvas became a TEMPLATE DASHBOARD THEY HAD BUILT EARLIER,
        // because the stack still held its snapshots and undo walked straight
        // out of the file they had open and into the previous one.
        //
        // ⚠⚠ Worse than a confusing canvas: `undo` restores a config but NOT a
        // `filePath`, so the document silently kept pointing at the opened file.
        // A Ctrl+S at that moment serialises the OTHER dashboard into the user's
        // file. `fs:createBackup` means it is recoverable, but THE VISION's
        // "never silently destroy user data" is structural, and this broke it.
        //
        // ⚠ The reason it survived UAT round 1 is worth keeping: the defect
        // needs TWO documents in one session, and every test used one.
        //
        // 'replace' therefore discards the history outright. 'edit' (the YAML
        // editor's Apply) pushes ONE undo step instead, because it is the same
        // document re-parsed — see LoadDashboardMode.
        ...(mode === 'edit' && previousConfig
          ? {
              past: [...state.past, cloneConfig(previousConfig)],
              future: [],
              // An applied YAML edit is an UNSAVED change. Marking it clean (the
              // old behaviour, inherited from the replace path) dropped the
              // title's dirty asterisk and, once this branch added the guard
              // below, would have let File > Open discard the edit without ever
              // asking — the guard keys on `isDirty`.
              isDirty: true,
            }
          : { past: [], future: [], isDirty: false }),
      }));
    } else {
      // ⭐ HA-03: a dashboard that fails to parse must NOT destroy the one
      // already open. This used to `set({ config: null, filePath: null })`, so
      // opening a file HAVDM could not read — a Home Assistant strategy
      // dashboard has no `views` at all — WIPED the user's current work off the
      // canvas and left them with nothing, while the caller announced success.
      //
      // Per THE VISION, "never silently destroy user data" is structural, and
      // the owner's ruling on this defect was explicit: refuse, name the
      // reason, leave the canvas untouched. Fixing it HERE rather than at each
      // call site covers every entry point at once — file open, recent files,
      // the HA download, preset import and the YAML editor's Apply, which is
      // where clobbering hurt most.
      //
      // ⚠ `config`/`filePath` are deliberately left as they were: when nothing
      // was loaded they are already null, so a first-load failure still shows
      // the error and the welcome screen exactly as before.
      //
      // ⚠⚠ FILE-04: `past`/`future` are deliberately left alone too. The canvas
      // still holds the ORIGINAL document, so its history is still the correct
      // history for it. Clearing it here would punish the user for opening a
      // file HAVDM could not read by silently destroying their undo stack.
      set({
        isLoading: false,
        error: result.error || 'Failed to parse dashboard',
      });
    }
  },

  updateConfig: (config: DashboardConfig) => {
    const currentConfig = get().config;

    // Only add to history if there's a current config
    if (currentConfig) {
      set((state) => ({
        past: [...state.past, cloneConfig(currentConfig)],
        future: [], // Clear future when making a new change
        config,
        isDirty: true,
        isBatching: false,
      }));
    } else {
      set({
        config,
        isDirty: true,
        isBatching: false,
      });
    }
  },

  beginBatchUpdate: () => {
    const state = get();
    if (state.isBatching) return;
    if (!state.config) {
      set({ isBatching: true });
      return;
    }

    set((current) => ({
      past: [...current.past, cloneConfig(current.config as DashboardConfig)],
      future: [],
      isBatching: true,
    }));
  },

  applyBatchedConfig: (config: DashboardConfig) => {
    // Applies the config without pushing intermediate states into undo history.
    // Caller should start/end batching explicitly.
    set({
      config,
      isDirty: true,
    });
  },

  endBatchUpdate: () => {
    if (!get().isBatching) return;
    set({ isBatching: false });
  },

  setSelectedView: (index: number | null) => {
    set({
      selectedViewIndex: index,
      selectedCardIndex: null,
      selectedCardIndices: [],
      selectionAnchorCardIndex: null,
      selectedSectionIndex: null,
    });
  },

  setSelectedCard: (viewIndex: number | null, cardIndex: number | null) => {
    set({
      selectedViewIndex: viewIndex,
      selectedCardIndex: cardIndex,
      selectedCardIndices: cardIndex === null ? [] : [cardIndex],
      selectionAnchorCardIndex: cardIndex,
      selectedSectionIndex: null,
    });
  },

  // Tier 4: select a single card inside an HA "sections" view, addressed by
  // (sectionIndex, cardIndex). A null cardIndex keeps the section context but
  // clears the card (e.g. deselect within the section). For modifier-driven
  // multi-select within a section, see selectSectionCardWithMode.
  setSelectedSectionCard: (
    viewIndex: number | null,
    sectionIndex: number | null,
    cardIndex: number | null,
  ) => {
    set({
      selectedViewIndex: viewIndex,
      selectedSectionIndex: sectionIndex,
      selectedCardIndex: cardIndex,
      selectedCardIndices: cardIndex === null ? [] : [cardIndex],
      selectionAnchorCardIndex: cardIndex,
    });
  },

  setSelectedCards: (
    viewIndex: number | null,
    cardIndices: number[],
    primaryCardIndex: number | null = null,
  ) => {
    const normalized = normalizeCardIndices(cardIndices);
    const nextPrimary =
      primaryCardIndex !== null && normalized.includes(primaryCardIndex)
        ? primaryCardIndex
        : (normalized[0] ?? null);

    set({
      selectedViewIndex: viewIndex,
      selectedCardIndex: nextPrimary,
      selectedCardIndices: normalized,
      selectionAnchorCardIndex: nextPrimary,
      selectedSectionIndex: null,
    });
  },

  selectCardWithMode: (
    viewIndex: number | null,
    cardIndex: number | null,
    mode: SelectionMode = 'replace',
    cardCount?: number,
  ) => {
    if (viewIndex === null || cardIndex === null) {
      set({
        selectedViewIndex: viewIndex,
        selectedCardIndex: null,
        selectedCardIndices: [],
        selectionAnchorCardIndex: null,
        selectedSectionIndex: null,
      });
      return;
    }

    const current = get();
    const nextSelection = resolveSelectionState({
      previous: {
        selectedCardIndex: current.selectedCardIndex,
        selectedCardIndices: current.selectedCardIndices,
        anchorCardIndex: current.selectionAnchorCardIndex,
      },
      clickedCardIndex: cardIndex,
      mode,
      cardCount,
    });

    set({
      selectedViewIndex: viewIndex,
      selectedCardIndex: nextSelection.selectedCardIndex,
      selectedCardIndices: nextSelection.selectedCardIndices,
      selectionAnchorCardIndex: nextSelection.anchorCardIndex,
      selectedSectionIndex: null,
    });
  },

  // Tier 4 slice 4.3a: multi-select WITHIN one section. `selectedSectionIndex`
  // is a single scalar, so a selection cannot span two sections — clicking into
  // a different section always starts a fresh selection there, whatever the
  // modifier. Within one section this reuses the same resolveSelectionState the
  // flat canvas uses, so ctrl/shift behave identically.
  selectSectionCardWithMode: (
    viewIndex: number | null,
    sectionIndex: number,
    cardIndex: number | null,
    mode: SelectionMode = 'replace',
    cardCount?: number,
  ) => {
    if (viewIndex === null || cardIndex === null) {
      set({
        selectedViewIndex: viewIndex,
        selectedSectionIndex: sectionIndex,
        selectedCardIndex: null,
        selectedCardIndices: [],
        selectionAnchorCardIndex: null,
      });
      return;
    }

    const current = get();
    const sameSection = current.selectedSectionIndex === sectionIndex;
    const nextSelection = resolveSelectionState({
      previous: sameSection
        ? {
            selectedCardIndex: current.selectedCardIndex,
            selectedCardIndices: current.selectedCardIndices,
            anchorCardIndex: current.selectionAnchorCardIndex,
          }
        : { selectedCardIndex: null, selectedCardIndices: [], anchorCardIndex: null },
      clickedCardIndex: cardIndex,
      mode: sameSection ? mode : 'replace',
      cardCount,
    });

    set({
      selectedViewIndex: viewIndex,
      selectedSectionIndex: sectionIndex,
      selectedCardIndex: nextSelection.selectedCardIndex,
      selectedCardIndices: nextSelection.selectedCardIndices,
      selectionAnchorCardIndex: nextSelection.anchorCardIndex,
    });
  },

  // Tier 4 slice 4.3a: select several cards within ONE section at once (e.g.
  // the cards a multi-card paste just landed). The section-view twin of
  // setSelectedCards, which resets selectedSectionIndex to null.
  setSelectedSectionCards: (
    viewIndex: number | null,
    sectionIndex: number,
    cardIndices: number[],
    primaryCardIndex: number | null = null,
  ) => {
    const normalized = normalizeCardIndices(cardIndices);
    const nextPrimary =
      primaryCardIndex !== null && normalized.includes(primaryCardIndex)
        ? primaryCardIndex
        : (normalized[0] ?? null);

    set({
      selectedViewIndex: viewIndex,
      selectedSectionIndex: sectionIndex,
      selectedCardIndex: nextPrimary,
      selectedCardIndices: normalized,
      selectionAnchorCardIndex: nextPrimary,
    });
  },

  markDirty: () => {
    set({ isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
  },

  /**
   * The document has been written to `filePath` — retarget it there and mark it
   * clean (F7 / UAT defect FILE-06).
   *
   * ⭐⭐ WHY THIS IS ONE ACTION RATHER THAN `markClean()` PLUS A SETTER. Before
   * F7 the ONLY writer of `filePath` was `loadDashboard`, so "Save As" wrote the
   * bytes, called `markClean()`, and left the document still pointing at the
   * PREVIOUS file. The next Ctrl+S then saved the user's edits into the file
   * they had just saved AWAY from. Setting the path and clearing the dirty flag
   * together makes the half-updated state — clean, but aimed at the wrong file —
   * unrepresentable, which is the state that caused the defect.
   *
   * ⚠ NOT for `loadDashboard`'s job: this changes only where the document points
   * and whether it is dirty. Content, selection and undo history are untouched,
   * because Save As does not alter the document — it relocates it.
   */
  markSavedAs: (filePath: string) => {
    set({ filePath, isDirty: false });
  },

  clearDashboard: () => {
    set(initialState);
  },

  setError: (error: string | null) => {
    set({ error });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    set({
      past: newPast,
      future: state.config ? [cloneConfig(state.config), ...state.future] : state.future,
      config: cloneConfig(previous),
      isDirty: true,
      isBatching: false,
      historyNavigationVersion: state.historyNavigationVersion + 1,
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    set({
      past: state.config ? [...state.past, cloneConfig(state.config)] : state.past,
      future: newFuture,
      config: cloneConfig(next),
      isDirty: true,
      isBatching: false,
      historyNavigationVersion: state.historyNavigationVersion + 1,
    });
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },
}));
