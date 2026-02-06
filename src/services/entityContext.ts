import type { EntityState, EntityStates } from './haWebSocketService';
import type { EntityContextVariable, EntityContextFilter } from '../types/entityContext';

export const ENTITY_CONTEXT_REGEX = /(\[\[|\{\{)([\s\S]+?)(\]\]|\}\})/g;

const DEFAULT_EMPTY = '';

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
};

const normalizeToString = (value: unknown): string => {
  if (value === null || value === undefined) return DEFAULT_EMPTY;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return DEFAULT_EMPTY;
  }
};

const splitFilterChain = (expression: string): string[] => {
  const parts: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let depth = 0;

  for (let i = 0; i < expression.length; i += 1) {
    const char = expression[i];
    const prev = i > 0 ? expression[i - 1] : '';

    if (char === '\'' && !inDouble && prev !== '\\') {
      inSingle = !inSingle;
    } else if (char === '"' && !inSingle && prev !== '\\') {
      inDouble = !inDouble;
    } else if (!inSingle && !inDouble) {
      if (char === '(') depth += 1;
      if (char === ')' && depth > 0) depth -= 1;
    }

    if (char === '|' && !inSingle && !inDouble && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim().length > 0) {
    parts.push(current.trim());
  }

  return parts;
};

const parseFilter = (raw: string): EntityContextFilter => {
  const openParen = raw.indexOf('(');
  if (openParen === -1 || !raw.endsWith(')')) {
    return { name: raw.trim(), args: [] };
  }

  const name = raw.slice(0, openParen).trim();
  const argsRaw = raw.slice(openParen + 1, -1).trim();
  if (!argsRaw) {
    return { name, args: [] };
  }

  return { name, args: [argsRaw] };
};

const parseDefaultArg = (value: string): string => {
  const trimmed = value.trim();
  if ((trimmed.startsWith('\'') && trimmed.endsWith('\'')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const applyFilters = (value: string, filters: EntityContextFilter[]): string => {
  return filters.reduce((current, filter) => {
    switch (filter.name) {
      case 'upper':
        return current.toUpperCase();
      case 'lower':
        return current.toLowerCase();
      case 'round': {
        const precision = filter.args && filter.args[0] ? Number(filter.args[0]) : 0;
        const numeric = Number(current);
        if (Number.isNaN(numeric)) return current;
        const factor = Number.isFinite(precision) ? Math.pow(10, precision) : 1;
        return String(Math.round(numeric * factor) / factor);
      }
      case 'default': {
        if (!filter.args || filter.args.length === 0) return current;
        if (isEmptyValue(current)) {
          return parseDefaultArg(filter.args[0]);
        }
        return current;
      }
      default:
        return current;
    }
  }, value);
};

const getEntityIdParts = (expression: string): { entityId: string | null; propertyPath: string[] } => {
  const trimmed = expression.trim();

  if (trimmed === 'entity_id') {
    return { entityId: null, propertyPath: ['entity_id'] };
  }

  if (trimmed === 'entity') {
    return { entityId: null, propertyPath: ['state'] };
  }

  if (trimmed.startsWith('entity:')) {
    const rest = trimmed.slice('entity:'.length);
    const parts = rest.split('.');
    if (parts.length >= 2) {
      const entityId = `${parts[0]}.${parts[1]}`;
      const propertyPath = parts.slice(2);
      return { entityId, propertyPath: propertyPath.length > 0 ? propertyPath : ['state'] };
    }
    return { entityId: rest, propertyPath: ['state'] };
  }

  const parts = trimmed.split('.');
  if (parts[0] === 'entity') {
    return { entityId: null, propertyPath: parts.slice(1) };
  }

  if (parts.length >= 2) {
    const entityId = `${parts[0]}.${parts[1]}`;
    const propertyPath = parts.slice(2);
    return { entityId, propertyPath: propertyPath.length > 0 ? propertyPath : ['state'] };
  }

  return { entityId: null, propertyPath: [trimmed] };
};

const resolvePropertyPath = (entity: EntityState | undefined, entityId: string | null, propertyPath: string[]): string => {
  if (propertyPath.length === 0) return DEFAULT_EMPTY;

  const [first, ...rest] = propertyPath;

  if (first === 'entity_id') {
    return entity?.entity_id ?? entityId ?? DEFAULT_EMPTY;
  }

  if (first === 'domain') {
    const id = entity?.entity_id ?? entityId;
    return id ? id.split('.')[0] : DEFAULT_EMPTY;
  }

  if (first === 'friendly_name') {
    const friendly = entity?.attributes?.friendly_name;
    if (friendly) return String(friendly);
    const id = entity?.entity_id ?? entityId;
    return id ? id.split('.')[1]?.replace(/_/g, ' ') ?? DEFAULT_EMPTY : DEFAULT_EMPTY;
  }

  if (first === 'state') {
    return normalizeToString(entity?.state);
  }

  if (first === 'last_changed') {
    return normalizeToString(entity?.last_changed);
  }

  if (first === 'last_updated') {
    return normalizeToString(entity?.last_updated);
  }

  if (first === 'attributes') {
    if (!entity?.attributes || rest.length === 0) return DEFAULT_EMPTY;
    const value = rest.reduce<unknown>(
      (acc, key) => (acc && typeof acc === 'object' && (acc as Record<string, unknown>)[key] !== undefined ? (acc as Record<string, unknown>)[key] : undefined),
      entity.attributes as Record<string, unknown>,
    );
    return normalizeToString(value);
  }

  const directValue = (entity as Record<string, unknown> | undefined)?.[first];
  if (directValue !== undefined) {
    return normalizeToString(directValue);
  }

  return DEFAULT_EMPTY;
};

export const parseEntityContextVariables = (template: string): EntityContextVariable[] => {
  const variables: EntityContextVariable[] = [];
  if (!template) return variables;

  const matches = template.matchAll(ENTITY_CONTEXT_REGEX);
  for (const match of matches) {
    if (match.index === undefined) continue;
    const raw = match[0];
    const expression = match[2] ? match[2].trim() : '';
    variables.push({ raw, expression, start: match.index, end: match.index + raw.length });
  }

  return variables;
};

export const extractEntityReferences = (template: string, defaultEntityId?: string | null): string[] => {
  const references = new Set<string>();
  const variables = parseEntityContextVariables(template);

  for (const variable of variables) {
    const parts = splitFilterChain(variable.expression);
    const baseExpression = parts[0] ?? '';
    const { entityId } = getEntityIdParts(baseExpression);
    if (entityId) {
      references.add(entityId);
    } else if (defaultEntityId) {
      references.add(defaultEntityId);
    }
  }

  return Array.from(references);
};

export const getMissingEntityReferences = (
  template: string,
  defaultEntityId: string | null | undefined,
  entityStates: EntityStates,
): string[] => {
  const references = extractEntityReferences(template, defaultEntityId);
  return references.filter((entityId) => !entityStates[entityId]);
};

export const resolveEntityContext = (
  template: string,
  defaultEntityId: string | null | undefined,
  entityStates: EntityStates,
): string => {
  if (!template) return '';

  return template.replace(ENTITY_CONTEXT_REGEX, (match, open, inner, close) => {
    if (open === '[[' && close !== ']]') return match;
    if (open === '{{' && close !== '}}') return match;
    const expression = inner.trim();
    if (!expression) return DEFAULT_EMPTY;

    const parts = splitFilterChain(expression);
    const baseExpression = parts[0] ?? '';
    const filters = parts.slice(1).map(parseFilter);
    const { entityId, propertyPath } = getEntityIdParts(baseExpression);

    const resolvedEntityId = entityId ?? defaultEntityId ?? null;
    const entity = resolvedEntityId ? entityStates[resolvedEntityId] : undefined;
    const value = resolvePropertyPath(entity, resolvedEntityId, propertyPath);
    const normalized = normalizeToString(value);

    return applyFilters(normalized, filters);
  });
};

export const hasEntityContextVariables = (template: string): boolean => {
  if (!template) return false;
  const regex = new RegExp(ENTITY_CONTEXT_REGEX.source, 'g');
  return regex.test(template);
};
