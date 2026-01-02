/**
 * Unit Test: Custom Cards Part 2 Implementation
 *
 * Purpose:
 * - Verify that newly implemented custom cards are properly registered
 * - Validate card metadata (defaults, required props, etc.)
 * - Ensure cards appear in correct categories
 *
 * Scope:
 * - Card-mod
 * - Auto-entities
 * - Vertical-stack-in-card
 * - Custom button-card
 * - Surveillance cards (4 types)
 */

import { describe, it, expect } from 'vitest';
import { cardRegistry } from '../../src/services/cardRegistry';

describe('Custom Cards Part 2 - Registry Validation', () => {
  describe('Card-mod', () => {
    it('should be registered with correct metadata', () => {
      const meta = cardRegistry.get('custom:card-mod');
      expect(meta).toBeTruthy();
      expect(meta?.name).toBe('Card Mod');
      expect(meta?.category).toBe('custom');
      expect(meta?.source).toBe('hacs');
      expect(meta?.isCustom).toBe(true);
    });

    it('should have style as default prop', () => {
      const meta = cardRegistry.get('custom:card-mod');
      expect(meta?.defaultProps).toHaveProperty('style');
    });
  });

  describe('Auto-entities', () => {
    it('should be registered with correct metadata', () => {
      const meta = cardRegistry.get('custom:auto-entities');
      expect(meta).toBeTruthy();
      expect(meta?.name).toBe('Auto Entities');
      expect(meta?.category).toBe('custom');
      expect(meta?.source).toBe('hacs');
      expect(meta?.isCustom).toBe(true);
    });

    it('should have filter and card as required props', () => {
      const meta = cardRegistry.get('custom:auto-entities');
      expect(meta?.requiredProps).toContain('filter');
      expect(meta?.requiredProps).toContain('card');
    });

    it('should have default filter and card props', () => {
      const meta = cardRegistry.get('custom:auto-entities');
      expect(meta?.defaultProps).toBeTruthy();
      expect(meta?.defaultProps?.filter).toBeTruthy();
      expect(meta?.defaultProps?.card).toBeTruthy();
    });
  });

  describe('Vertical-stack-in-card', () => {
    it('should be registered with correct metadata', () => {
      const meta = cardRegistry.get('custom:vertical-stack-in-card');
      expect(meta).toBeTruthy();
      expect(meta?.name).toBe('Vertical Stack in Card');
      expect(meta?.category).toBe('custom');
      expect(meta?.source).toBe('hacs');
      expect(meta?.isCustom).toBe(true);
    });

    it('should have cards as required prop', () => {
      const meta = cardRegistry.get('custom:vertical-stack-in-card');
      expect(meta?.requiredProps).toContain('cards');
    });

    it('should have empty cards array as default', () => {
      const meta = cardRegistry.get('custom:vertical-stack-in-card');
      expect(meta?.defaultProps).toBeTruthy();
      expect(Array.isArray(meta?.defaultProps?.cards)).toBe(true);
    });
  });

  describe('Custom Button Card', () => {
    it('should be registered with correct metadata', () => {
      const meta = cardRegistry.get('custom:button-card');
      expect(meta).toBeTruthy();
      expect(meta?.name).toBe('Button Card');
      expect(meta?.category).toBe('custom');
      expect(meta?.source).toBe('hacs');
      expect(meta?.isCustom).toBe(true);
    });

    it('should have entity as required prop', () => {
      const meta = cardRegistry.get('custom:button-card');
      expect(meta?.requiredProps).toContain('entity');
    });
  });

  describe('Surveillance Cards', () => {
    const surveillanceCards = [
      { type: 'custom:surveillance-card', name: 'Surveillance Card' },
      { type: 'custom:frigate-card', name: 'Frigate Card' },
      { type: 'custom:camera-card', name: 'Camera Card' },
      { type: 'custom:webrtc-camera', name: 'WebRTC Camera' },
    ];

    surveillanceCards.forEach(({ type, name }) => {
      describe(name, () => {
        it('should be registered with correct metadata', () => {
          const meta = cardRegistry.get(type);
          expect(meta).toBeTruthy();
          expect(meta?.name).toBe(name);
          expect(meta?.category).toBe('custom');
          expect(meta?.source).toBe('hacs');
          expect(meta?.isCustom).toBe(true);
        });

        it('should be categorized as custom', () => {
          const customCards = cardRegistry.getCustomCards();
          expect(customCards.some(c => c.type === type)).toBe(true);
        });
      });
    });

    it('surveillance-card should require cameras prop', () => {
      const meta = cardRegistry.get('custom:surveillance-card');
      expect(meta?.requiredProps).toContain('cameras');
    });

    it('frigate-card should require cameras prop', () => {
      const meta = cardRegistry.get('custom:frigate-card');
      expect(meta?.requiredProps).toContain('cameras');
    });

    it('camera-card should require entity prop', () => {
      const meta = cardRegistry.get('custom:camera-card');
      expect(meta?.requiredProps).toContain('entity');
    });

    it('webrtc-camera should require url prop', () => {
      const meta = cardRegistry.get('custom:webrtc-camera');
      expect(meta?.requiredProps).toContain('url');
    });
  });

  describe('Custom Cards Collection', () => {
    it('should include all newly implemented cards in custom cards list', () => {
      const customCards = cardRegistry.getCustomCards();
      const customCardTypes = customCards.map(c => c.type);

      const expectedCards = [
        'custom:card-mod',
        'custom:auto-entities',
        'custom:vertical-stack-in-card',
        'custom:button-card',
        'custom:surveillance-card',
        'custom:frigate-card',
        'custom:camera-card',
        'custom:webrtc-camera',
      ];

      expectedCards.forEach(type => {
        expect(customCardTypes).toContain(type);
      });
    });

    it('should have at least 8 new custom cards implemented', () => {
      const customCards = cardRegistry.getCustomCards();

      const newCards = [
        'custom:card-mod',
        'custom:auto-entities',
        'custom:vertical-stack-in-card',
        'custom:button-card',
        'custom:surveillance-card',
        'custom:frigate-card',
        'custom:camera-card',
        'custom:webrtc-camera',
      ];

      const foundCards = customCards.filter(c => newCards.includes(c.type));
      expect(foundCards.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Card Source Filtering', () => {
    it('should return all new cards when filtering by HACS source', () => {
      const hacsCards = cardRegistry.getBySource('hacs');
      const hacsTypes = hacsCards.map(c => c.type);

      const expectedHacsCards = [
        'custom:card-mod',
        'custom:auto-entities',
        'custom:vertical-stack-in-card',
        'custom:button-card',
        'custom:surveillance-card',
        'custom:frigate-card',
        'custom:camera-card',
        'custom:webrtc-camera',
      ];

      expectedHacsCards.forEach(type => {
        expect(hacsTypes).toContain(type);
      });
    });
  });

  describe('Card Category Filtering', () => {
    it('should return all new cards when filtering by custom category', () => {
      const customCategoryCards = cardRegistry.getByCategory('custom');
      const customTypes = customCategoryCards.map(c => c.type);

      const expectedCustomCards = [
        'custom:card-mod',
        'custom:auto-entities',
        'custom:vertical-stack-in-card',
        'custom:button-card',
        'custom:surveillance-card',
        'custom:frigate-card',
        'custom:camera-card',
        'custom:webrtc-camera',
      ];

      expectedCustomCards.forEach(type => {
        expect(customTypes).toContain(type);
      });
    });
  });
});
