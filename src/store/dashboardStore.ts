import { create } from 'zustand';
import { DashboardConfig, DashboardState } from '../types/dashboard';
import { yamlService } from '../services/yamlService';

interface DashboardActions {
  loadDashboard: (yamlContent: string, filePath: string) => void;
  updateConfig: (config: DashboardConfig) => void;
  setSelectedView: (index: number | null) => void;
  setSelectedCard: (viewIndex: number | null, cardIndex: number | null) => void;
  markDirty: () => void;
  markClean: () => void;
  clearDashboard: () => void;
  setError: (error: string | null) => void;
}

type DashboardStore = DashboardState & DashboardActions;

const initialState: DashboardState = {
  config: null,
  filePath: null,
  isLoading: false,
  error: null,
  isDirty: false,
  selectedViewIndex: null,
  selectedCardIndex: null,
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
    set({
      config,
      isDirty: true,
    });
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
}));
