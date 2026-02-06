/**
 * Home Assistant Entity State Context
 * Provides live entity states to all card renderers
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { EntityState, EntityStates, haWebSocketService } from '../services/haWebSocketService';
import { logger } from '../services/logger';

interface HAEntityContextValue {
  entities: EntityStates;
  getEntity: (entityId: string) => EntityState | null;
  isLoading: boolean;
  error: Error | null;
}

const HAEntityContext = createContext<HAEntityContextValue | null>(null);

interface HAEntityProviderProps {
  children: ReactNode;
  enabled?: boolean; // Allow enabling/disabling live data
}

type TestEntityApi = {
  setEntities: (entities: EntityStates | Array<EntityState>) => void;
  patchEntities: (changes: Partial<EntityStates>, removed?: string[]) => void;
};

const isTestEnv = () => {
  if (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.E2E === '1')) {
    return true;
  }
  if (typeof window !== 'undefined') {
    const testWindow = window as Window & { E2E?: string; PLAYWRIGHT_TEST?: string };
    return Boolean(testWindow.E2E || testWindow.PLAYWRIGHT_TEST);
  }
  return false;
};

export function HAEntityProvider({ children, enabled = true }: HAEntityProviderProps) {
  const [entities, setEntities] = useState<EntityStates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const normalizeEntities = useCallback((payload: EntityStates | Array<EntityState>): EntityStates => {
    if (Array.isArray(payload)) {
      return payload.reduce<EntityStates>((acc, entity) => {
        const entityId = entity?.entity_id;
        if (entityId) {
          acc[entityId] = entity;
        }
        return acc;
      }, {});
    }
    return payload;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let testApiCleanup: (() => void) | null = null;

    const installTestApi = () => {
      if (!isTestEnv() || typeof window === 'undefined') return;

      const testWindow = window as Window & { __testEntityApi?: TestEntityApi };
      const api: TestEntityApi = {
        setEntities: (payload) => {
          setEntities(normalizeEntities(payload));
          setIsLoading(false);
        },
        patchEntities: (changes, removed = []) => {
          setEntities((prev) => {
            const next = { ...prev };
            Object.entries(changes).forEach(([entityId, patch]) => {
              if (!patch) return;
              const current = next[entityId] ?? ({ entity_id: entityId } as EntityState);
              next[entityId] = { ...current, ...patch } as EntityState;
            });
            removed.forEach((entityId) => {
              delete next[entityId];
            });
            return next;
          });
          setIsLoading(false);
        },
      };

      testWindow.__testEntityApi = api;
      testApiCleanup = () => {
        if (testWindow.__testEntityApi === api) {
          delete testWindow.__testEntityApi;
        }
      };
    };

    const subscribe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        installTestApi();

        // Subscribe to entity state changes via IPC (main process handles WebSocket)
        // For now, we'll fetch entities via the WebSocket service
        // This assumes the WebSocket connection is already established
        if (haWebSocketService.isConnected()) {
          unsubscribe = await haWebSocketService.subscribeToEntityStates((newEntities) => {
            setEntities(newEntities);
            setIsLoading(false);
          });
        } else {
          logger.warn('WebSocket not connected, entity states unavailable');
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('Failed to subscribe to entity states', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    subscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (testApiCleanup) {
        testApiCleanup();
      }
    };
  }, [enabled, normalizeEntities]);

  const getEntity = (entityId: string) => {
    return entities[entityId] || null;
  };

  return (
    <HAEntityContext.Provider value={{ entities, getEntity, isLoading, error }}>
      {children}
    </HAEntityContext.Provider>
  );
}

/**
 * Hook to access entity states
 */
export function useHAEntities() {
  const context = useContext(HAEntityContext);
  if (!context) {
    throw new Error('useHAEntities must be used within HAEntityProvider');
  }
  return context;
}

/**
 * Hook to access a specific entity
 */
export function useHAEntity(entityId: string) {
  const { getEntity } = useHAEntities();
  const entity = getEntity(entityId);

  return {
    state: entity?.state || 'unknown',
    attributes: entity?.attributes || {},
    lastChanged: entity?.last_changed,
    lastUpdated: entity?.last_updated,
    exists: entity !== null,
  };
}
