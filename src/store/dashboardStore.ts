import { create } from 'zustand';
import { DashboardConfig, DashboardState } from '../types/dashboard';
import { yamlService } from '../services/yamlService';

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
  markDirty: () => void;
  markClean: () => void;
  clearDashboard: () => void;
  setError: (error: string | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

type DashboardStore = DashboardState & DashboardActions & HistoryState;

const initialState: DashboardState & HistoryState = {
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
        past: [...state.past, currentConfig],
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
      past: [...current.past, current.config as DashboardConfig],
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
    });
  },

  setSelectedCard: (viewIndex: number | null, cardIndex: number | null) => {
    set({
      selectedViewIndex: viewIndex,
      selectedCardIndex: cardIndex,
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
      future: state.config ? [state.config, ...state.future] : state.future,
      config: previous,
      isDirty: true,
      isBatching: false,
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    set({
      past: state.config ? [...state.past, state.config] : state.past,
      future: newFuture,
      config: next,
      isDirty: true,
      isBatching: false,
    });
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },
}));
