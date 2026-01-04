import { create } from 'zustand';
import { DashboardConfig } from '../types/dashboard';

/**
 * Editor mode types:
 * - 'visual': Traditional visual canvas editing (default)
 * - 'code': YAML code editor only
 * - 'split': Split view with visual and code side-by-side
 */
export type EditorMode = 'visual' | 'code' | 'split';

/**
 * Sync status between visual and code views
 */
export type SyncStatus = 'synced' | 'pending-visual' | 'pending-code' | 'error';

interface EditorModeState {
  // Current editor mode
  mode: EditorMode;

  // Last known good YAML state (for rollback on parse errors)
  lastValidYaml: string | null;

  // Last known good config state (for rollback)
  lastValidConfig: DashboardConfig | null;

  // Sync status
  syncStatus: SyncStatus;

  // Pending YAML changes (not yet applied to visual)
  pendingYaml: string | null;

  // Validation error from YAML parsing
  validationError: string | null;

  // Selected card index for YAML jump feature
  selectedCardForYamlJump: { viewIndex: number; cardIndex: number } | null;

  // Actions
  setMode: (mode: EditorMode) => void;
  setLastValidYaml: (yaml: string) => void;
  setLastValidConfig: (config: DashboardConfig) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPendingYaml: (yaml: string | null) => void;
  setValidationError: (error: string | null) => void;
  setSelectedCardForYamlJump: (selection: { viewIndex: number; cardIndex: number } | null) => void;

  // Rollback to last valid state
  rollbackToLastValid: () => { yaml: string | null; config: DashboardConfig | null };

  // Clear pending changes
  clearPending: () => void;

  // Reset store to initial state
  reset: () => void;
}

const initialState = {
  mode: 'visual' as EditorMode,
  lastValidYaml: null,
  lastValidConfig: null,
  syncStatus: 'synced' as SyncStatus,
  pendingYaml: null,
  validationError: null,
  selectedCardForYamlJump: null,
};

export const useEditorModeStore = create<EditorModeState>((set, get) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),

  setLastValidYaml: (yaml) => set({ lastValidYaml: yaml }),

  setLastValidConfig: (config) => set({ lastValidConfig: config }),

  setSyncStatus: (status) => set({ syncStatus: status }),

  setPendingYaml: (yaml) => set({ pendingYaml: yaml }),

  setValidationError: (error) => set({ validationError: error }),

  setSelectedCardForYamlJump: (selection) => set({ selectedCardForYamlJump: selection }),

  rollbackToLastValid: () => {
    const state = get();
    return {
      yaml: state.lastValidYaml,
      config: state.lastValidConfig,
    };
  },

  clearPending: () => set({
    pendingYaml: null,
    validationError: null,
    syncStatus: 'synced',
  }),

  reset: () => set(initialState),
}));
