import { get as levenshteinGet } from 'fast-levenshtein';
import type { DashboardConfig } from '../types/dashboard';
import type { EntityState } from './haWebSocketService';

export interface EntitySuggestion {
  entityId: string;
  friendlyName?: string;
  domain: string;
  score: number; // 0 - 1
}

export interface EntityMapping {
  from: string;
  to: string;
}

const ENTITY_ID_PATTERN = /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/;
const AUTO_MAP_THRESHOLD = 0.8;
const STORAGE_KEY = 'havdm.entityMappings';

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/gi, '');

const similarity = (a: string, b: string): number => {
  if (!a.length || !b.length) return 0;
  if (a === b) return 1;
  const distance = levenshteinGet(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - distance / maxLen);
};

const substringBoost = (a: string, b: string): number => {
  if (!a.length || !b.length) return 0;
  if (a.includes(b) || b.includes(a)) return 0.05;
  return 0;
};

const extractDomain = (entityId: string): string => entityId.split('.')[0] ?? '';
const extractName = (entityId: string): string => entityId.split('.').slice(1).join('.') ?? '';

export class EntityRemappingService {
  extractEntityIds(config: DashboardConfig | null): string[] {
    if (!config) return [];
    const found = new Set<string>();

    const walk = (value: unknown): void => {
      if (!value) return;

      if (typeof value === 'string') {
        if (ENTITY_ID_PATTERN.test(value)) {
          found.add(value);
        }
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      if (typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
          if (key === 'entity' && typeof val === 'string' && ENTITY_ID_PATTERN.test(val)) {
            found.add(val);
          }
          if (key === 'entity_id' && typeof val === 'string' && ENTITY_ID_PATTERN.test(val)) {
            found.add(val);
          }
          if (key === 'entities' && Array.isArray(val)) {
            val.forEach((entry) => {
              if (typeof entry === 'string' && ENTITY_ID_PATTERN.test(entry)) {
                found.add(entry);
              } else if (typeof entry === 'object' && entry && 'entity' in entry && typeof (entry as any).entity === 'string') {
                const e = (entry as any).entity as string;
                if (ENTITY_ID_PATTERN.test(e)) found.add(e);
              }
            });
          }
          walk(val);
        });
      }
    };

    walk(config);

    return Array.from(found);
  }

  detectMissing(referenced: string[], availableEntities: EntityState[]): string[] {
    const availableIds = new Set(availableEntities.map((e) => e.entity_id));
    return referenced.filter((id) => !availableIds.has(id)).sort();
  }

  buildSuggestions(missingId: string, availableEntities: EntityState[]): EntitySuggestion[] {
    const missingDomain = extractDomain(missingId);
    const missingName = normalize(extractName(missingId));

    const suggestions = availableEntities.map((entity) => {
      const domain = extractDomain(entity.entity_id);
      const namePart = normalize(extractName(entity.entity_id));
      const friendly = normalize(String(entity.attributes?.friendly_name ?? ''));

      const domainScore = domain === missingDomain ? 0.5 : domain.startsWith(missingDomain) || missingDomain.startsWith(domain) ? 0.25 : 0;
      const nameScore = similarity(missingName, namePart) * 0.35;
      const friendlyScore = similarity(missingName, friendly) * 0.15;
      const boost = substringBoost(missingName, namePart) + substringBoost(missingName, friendly);

      const total = Math.min(1, domainScore + nameScore + friendlyScore + boost);

      return {
        entityId: entity.entity_id,
        friendlyName: entity.attributes?.friendly_name,
        domain,
        score: Number(total.toFixed(3)),
      } as EntitySuggestion;
    });

    return suggestions
      .sort((a, b) => b.score - a.score || a.entityId.localeCompare(b.entityId))
      .slice(0, 5);
  }

  autoMapSuggestions(missing: string[], available: EntityState[]): EntityMapping[] {
    return missing
      .map((id) => {
        const saved = this.getSavedMapping(id);
        if (saved) return saved;

        const suggestions = this.buildSuggestions(id, available);
        const top = suggestions[0];
        if (top && top.score >= AUTO_MAP_THRESHOLD) {
          return { from: id, to: top.entityId };
        }
        return null;
      })
      .filter((m): m is EntityMapping => Boolean(m));
  }

  applyMappings(config: DashboardConfig, mappings: EntityMapping[]): DashboardConfig {
    const mapLookup = new Map<string, string>();
    mappings.forEach(({ from, to }) => mapLookup.set(from, to));

    const cloneAndReplace = (value: any): any => {
      if (typeof value === 'string') {
        return mapLookup.get(value) ?? value;
      }
      if (Array.isArray(value)) {
        return value.map(cloneAndReplace);
      }
      if (value && typeof value === 'object') {
        const entries = Object.entries(value).map(([k, v]) => [k, cloneAndReplace(v)]);
        return Object.fromEntries(entries);
      }
      return value;
    };

    return cloneAndReplace(config) as DashboardConfig;
  }

  persistMappings(mappings: EntityMapping[]): void {
    if (!mappings.length) return;
    const existing = this.getEntityMappings();
    const merged = [...existing];

    mappings.forEach((mapping) => {
      const idx = merged.findIndex((m) => m.from === mapping.from);
      if (idx >= 0) {
        merged[idx] = mapping;
      } else {
        merged.push(mapping);
      }
    });

    this.setEntityMappings(merged);
  }

  getEntityMappings(): EntityMapping[] {
    const storage = this.readStorage();
    return storage;
  }

  clearEntityMappings(): void {
    this.writeStorage([]);
  }

  deleteMapping(source: string): void {
    const filtered = this.getEntityMappings().filter((m) => m.from !== source);
    this.writeStorage(filtered);
  }

  private getSavedMapping(source: string): EntityMapping | null {
    const existing = this.getEntityMappings();
    const match = existing.find((m) => m.from === source);
    return match ? { ...match } : null;
  }

  // Storage helpers (localStorage when available; in-memory fallback for tests/non-browser)
  private memoryStore: EntityMapping[] = [];

  private readStorage(): EntityMapping[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.memoryStore;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as EntityMapping[];
    } catch {
      return [];
    }
  }

  private writeStorage(mappings: EntityMapping[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.memoryStore = mappings;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    } catch {
      // noop
    }
  }
}

export const entityRemappingService = new EntityRemappingService();
export const REMAP_THRESHOLD = AUTO_MAP_THRESHOLD;
