/**
 * Home Assistant Entity State Context
 * Provides live entity states to all card renderers
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EntityStates, haWebSocketService } from '../services/haWebSocketService';

interface HAEntityContextValue {
  entities: EntityStates;
  getEntity: (entityId: string) => any | null;
  isLoading: boolean;
  error: Error | null;
}

const HAEntityContext = createContext<HAEntityContextValue | null>(null);

interface HAEntityProviderProps {
  children: ReactNode;
  enabled?: boolean; // Allow enabling/disabling live data
}

export function HAEntityProvider({ children, enabled = true }: HAEntityProviderProps) {
  const [entities, setEntities] = useState<EntityStates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const subscribe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Subscribe to entity state changes via IPC (main process handles WebSocket)
        // For now, we'll fetch entities via the WebSocket service
        // This assumes the WebSocket connection is already established
        if (haWebSocketService.isConnected()) {
          unsubscribe = await haWebSocketService.subscribeToEntityStates((newEntities) => {
            setEntities(newEntities);
            setIsLoading(false);
          });
        } else {
          console.warn('WebSocket not connected, entity states unavailable');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to subscribe to entity states:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    subscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [enabled]);

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
