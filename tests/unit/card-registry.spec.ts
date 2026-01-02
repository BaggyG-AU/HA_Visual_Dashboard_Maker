/**
 * Unit Test: Card Registry (Vitest)
 *
 * Purpose:
 * - Validate the card registry’s core behaviors (lookup, filtering, registration).
 * - Run fast without Electron/Playwright (pure unit tests).
 *
 * Notes:
 * - Update the import path for cardRegistry to match your repo structure.
 * - The registry appears to be a singleton; we attempt to reset between tests if supported.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  cardRegistry,
  CardTypeMetadata,
  CardSource,
  CardCategory,
} from '../../src/services/cardRegistry';

type RegistryAPI = {
  reset?: () => void;
  clear?: () => void;
  register?: (meta: CardTypeMetadata) => void;
  get?: (type: string) => CardTypeMetadata | undefined;
  getAll?: () => CardTypeMetadata[];
  getByCategory?: (category: CardCategory) => CardTypeMetadata[];
  getBySource?: (source: CardSource) => CardTypeMetadata[];
  getCustomCards?: () => CardTypeMetadata[];
};

const reg = cardRegistry as unknown as RegistryAPI;

function tryResetRegistry() {
  // Prefer reset() if available; otherwise try clear().
  if (typeof reg.reset === 'function') reg.reset();
  else if (typeof reg.clear === 'function') reg.clear();
}

describe('cardRegistry', () => {
  beforeEach(() => {
    tryResetRegistry();
  });

  afterEach(() => {
    // Ensure any test-added cards don’t leak.
    tryResetRegistry();
  });

  it('should expose getAll() with at least one registered card', () => {
    expect(typeof reg.getAll).toBe('function');

    const all = reg.getAll?.() ?? [];
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);

    // Basic shape sanity (don’t overfit)
    const first = all[0];
    expect(first).toBeTruthy();
    expect(typeof first.type).toBe('string');
    expect(typeof first.name).toBe('string');
    expect(typeof first.category).toBe('string');
  });

  it('should be able to lookup a known built-in card type (e.g., "button")', () => {
    expect(typeof reg.get).toBe('function');

    const meta = reg.get?.('button');
    expect(meta).toBeTruthy();

    // Basic invariants (avoid brittle asserts like exact name)
    expect(meta.type).toBe('button');
    expect(typeof meta.name).toBe('string');
    expect(typeof meta.category).toBe('string');
  });

  it('should filter by category when getByCategory() is available', () => {
    expect(typeof reg.getByCategory).toBe('function');

    // Use a category that commonly exists in your registry implementation.
    // If your categories differ, update this list accordingly.
    const categoriesToTry = ['control', 'information', 'layout', 'sensor', 'media', 'custom'];

    const all = reg.getAll?.() ?? [];
    expect(all.length).toBeGreaterThan(0);

    for (const category of categoriesToTry) {
      const filtered = reg.getByCategory?.(category) ?? [];
      expect(Array.isArray(filtered)).toBe(true);

      // If any cards exist for this category, they must all match the category.
      for (const card of filtered) {
        expect(card.category).toBe(category);
      }
    }
  });

  it('should filter by source when getBySource() is available', () => {
    expect(typeof reg.getBySource).toBe('function');

    // These sources are typical for HA card registries.
    // Update if your CardSource differs.
    const sourcesToTry = ['builtin', 'hacs', 'custom', 'discovered'];

    for (const source of sourcesToTry) {
      const filtered = reg.getBySource?.(source) ?? [];
      expect(Array.isArray(filtered)).toBe(true);

      // If any exist, verify they match.
      for (const card of filtered) {
        // Some implementations may omit source on built-ins;
        // if so, relax this assertion in your codebase.
        if (card.source != null) {
          expect(card.source).toBe(source);
        }
      }
    }
  });

  it('should allow registering a custom card and retrieving it', () => {
    expect(typeof reg.register).toBe('function');
    expect(typeof reg.get).toBe('function');

    const customType = 'custom:test-card';

    // Ensure it doesn’t already exist
    const pre = reg.get?.(customType);
    if (pre) {
      // If it exists, that’s fine but this test becomes meaningless—fail fast so you notice.
      throw new Error(
        `Test assumes "${customType}" is not pre-registered, but it already exists. Pick a different customType.`
      );
    }

    reg.register?.({
      type: customType,
      name: 'Test Card',
      category: 'custom',
      source: 'custom',
      description: 'A test-only custom card',
      defaultProps: { foo: 'bar' },
      requiredProps: ['foo'],
    });

    const meta = reg.get?.(customType);
    expect(meta).toBeTruthy();
    expect(meta.type).toBe(customType);
    expect(meta.category).toBe('custom');
    if (meta.source != null) {
      expect(meta.source).toBe('custom');
    }
  });

  it('should list custom cards via getCustomCards() if available', () => {
    if (typeof reg.getCustomCards !== 'function' || typeof reg.register !== 'function') {
      // If your implementation doesn’t support this, skip the assertion.
      // You can replace with expect(...) once implemented.
      return;
    }

    const customType = 'custom:test-card-2';

    reg.register?.({
      type: customType,
      name: 'Test Card 2',
      category: 'custom',
      source: 'custom',
    });

    const customCards = reg.getCustomCards?.() ?? [];
    expect(Array.isArray(customCards)).toBe(true);
    expect(customCards.some(c => c.type === customType)).toBe(true);
  });
});
