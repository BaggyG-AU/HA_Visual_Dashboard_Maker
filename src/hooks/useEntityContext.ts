import { useCallback, useMemo } from 'react';
import { useHAEntities } from '../contexts/HAEntityContext';
import { getMissingEntityReferences, resolveEntityContext } from '../services/entityContext';

export const useEntityContextResolver = () => {
  const { entities } = useHAEntities();

  return useCallback(
    (template: string, defaultEntityId?: string | null) => resolveEntityContext(template, defaultEntityId, entities),
    [entities],
  );
};

export const useEntityContextValue = (template: string, defaultEntityId?: string | null) => {
  const resolver = useEntityContextResolver();

  return useMemo(() => resolver(template, defaultEntityId), [resolver, template, defaultEntityId]);
};

export const useMissingEntityReferences = (template: string, defaultEntityId?: string | null) => {
  const { entities } = useHAEntities();

  return useMemo(
    () => getMissingEntityReferences(template, defaultEntityId, entities),
    [entities, template, defaultEntityId],
  );
};
