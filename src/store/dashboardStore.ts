import { create } from 'zustand';
import { DashboardConfig, DashboardState } from '../types/dashboard';
import { yamlService } from '../services/yamlService';
import { normalizeCardIndices, resolveSelectionState, type SelectionMode } from '../utils/bulkSelection';

interface HistoryState {
  past: DashboardConfig[];
  future: DashboardConfig[];
}

interface DashboardActions {
  loadDashboard: (yamlContent: string, filePath: string) => void;
  updateConfig: (config: DashboardConfig) => void;
  beginBatchUpdate: () => void;
  applyBatchedConfig: (config: DashboardConfig) => void;
  endBatchUpdate: () => void;
  setSelectedView: (index: number | null) => void;
  setSelectedCard: (viewIndex: number | null, cardIndex: number | null) => void;
  setSelectedCards: (viewIndex: number | null, cardIndices: number[], primaryCardIndex?: number | null) => void;
  selectCardWithMode: (viewIndex: number | null, cardIndex: number | null, mode?: SelectionMode, cardCount?: number) => void;
  markDirty: () => void;
  markClean: () => void;
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
};

type DashboardStore = DashboardState & DashboardActions & HistoryState & SelectionState;

const cloneConfig = (config: DashboardConfig): DashboardConfig => {
  if (typeof structuredClone === 'function') {
    return structuredClone(config) as DashboardConfig;
  }
  return JSON.parse(JSON.stringify(config)) as DashboardConfig;
};

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
  historyNavigationVersion: 0,
  isBatching: false,
  past: [],
  future: [],
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initialState,

  loadDashboard: (yamlContent: string, filePath: string) => {
    set({ isLoading: true, error: null });

    const result = yamlService.parseDashboard(yamlContent);

    if (result.success && result.data) {
      set({
        config: result.data,
        filePath,
        isLoading: false,
        error: null,
        isDirty: false,
        selectedViewIndex: result.data.views.length > 0 ? 0 : null,
        selectedCardIndex: null,
        selectedCardIndices: [],
        selectionAnchorCardIndex: null,
      });
    } else {
      set({
        config: null,
        filePath: null,
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
    });
  },

  setSelectedCard: (viewIndex: number | null, cardIndex: number | null) => {
    set({
      selectedViewIndex: viewIndex,
      selectedCardIndex: cardIndex,
      selectedCardIndices: cardIndex === null ? [] : [cardIndex],
      selectionAnchorCardIndex: cardIndex,
    });
  },

  setSelectedCards: (viewIndex: number | null, cardIndices: number[], primaryCardIndex: number | null = null) => {
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
    });
  },

  selectCardWithMode: (viewIndex: number | null, cardIndex: number | null, mode: SelectionMode = 'replace', cardCount?: number) => {
    if (viewIndex === null || cardIndex === null) {
      set({
        selectedViewIndex: viewIndex,
        selectedCardIndex: null,
        selectedCardIndices: [],
        selectionAnchorCardIndex: null,
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
    });
  },

  markDirty: () => {
    set({ isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
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
