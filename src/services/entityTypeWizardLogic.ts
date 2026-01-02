import { DashboardCategory, Entity } from './dashboardGeneratorService';

export type WizardState =
  | 'offline'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'error';

export interface WizardContext {
  isConnected: boolean;
  loading: boolean;
  entities: Entity[];
  categories: DashboardCategory[];
  error?: string | null;
}

/**
 * Pure helper used to reason about the wizard UI without coupling to React.
 */
export function evaluateWizardState(ctx: WizardContext): WizardState {
  if (!ctx.isConnected) {
    return 'offline';
  }
  if (ctx.error) {
    return 'error';
  }
  if (ctx.loading) {
    return 'loading';
  }
  if (ctx.categories.length === 0 || ctx.entities.length === 0) {
    return 'empty';
  }
  return 'ready';
}

/**
 * Summarize entity domains to support availability/count logic.
 */
export function countEntitiesByDomain(entities: Entity[]): Record<string, number> {
  return entities.reduce<Record<string, number>>((acc, entity) => {
    const domain = entity.entity_id.split('.')[0];
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});
}

