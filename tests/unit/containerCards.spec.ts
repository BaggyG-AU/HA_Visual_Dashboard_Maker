import { describe, it, expect } from 'vitest';
import {
  CONTAINER_CARD_TYPES,
  isContainerCard,
  appendCardToContainer,
} from '../../src/utils/containerCards';
import { Card } from '../../src/types/dashboard';

const card = (type: string, extra: Record<string, unknown> = {}): Card =>
  ({ type, ...extra }) as Card;

/** `Card` is a union and only some members declare `cards`. */
const cardsOf = (c: Card): Card[] => (c as unknown as { cards: Card[] }).cards;

describe('containerCards (PROPS-06)', () => {
  describe('isContainerCard', () => {
    it('accepts the three native HA containers', () => {
      for (const t of CONTAINER_CARD_TYPES) {
        expect(isContainerCard(card(t))).toBe(true);
      }
    });

    // ⭐ CONTROL LEGS — an over-broad predicate would make every card a drop
    // target and swallow drops that should land on the canvas.
    it('rejects ordinary cards', () => {
      expect(isContainerCard(card('markdown'))).toBe(false);
      expect(isContainerCard(card('button'))).toBe(false);
      expect(isContainerCard(card('entities'))).toBe(false);
    });

    it('rejects nested-content types deliberately left out of scope', () => {
      expect(isContainerCard(card('custom:popup-card'))).toBe(false);
      expect(isContainerCard(card('custom:expander-card'))).toBe(false);
    });

    it('rejects malformed input rather than throwing', () => {
      expect(isContainerCard(undefined)).toBe(false);
      expect(isContainerCard(null)).toBe(false);
      expect(isContainerCard({} as Card)).toBe(false);
      expect(isContainerCard({ type: 42 } as unknown as Card)).toBe(false);
    });
  });

  describe('appendCardToContainer', () => {
    it('appends to an existing cards array', () => {
      const stack = card('vertical-stack', { cards: [card('markdown')] });
      const next = appendCardToContainer(stack, card('button'));
      expect(cardsOf(next)).toHaveLength(2);
      expect(cardsOf(next)[1].type).toBe('button');
    });

    it('treats a container with NO cards key as empty rather than refusing', () => {
      const next = appendCardToContainer(card('grid'), card('button'));
      expect(cardsOf(next)).toHaveLength(1);
    });

    it('treats a malformed cards value as empty rather than losing the drop', () => {
      const bad = card('vertical-stack', { cards: 'nonsense' });
      const next = appendCardToContainer(bad, card('button'));
      expect(cardsOf(next)).toHaveLength(1);
    });

    it('does not mutate the original container', () => {
      const original = card('vertical-stack', { cards: [card('markdown')] });
      const snapshot = JSON.stringify(original);
      appendCardToContainer(original, card('button'));
      expect(JSON.stringify(original)).toBe(snapshot);
    });

    it('preserves the container other properties', () => {
      const stack = card('vertical-stack', { cards: [], title: 'Keep me' });
      const next = appendCardToContainer(stack, card('button'));
      expect((next as unknown as { title: string }).title).toBe('Keep me');
    });

    // ⭐ CONTROL LEG: a non-container must come back REFERENCE-equal so the
    // caller can skip the state update, matching the sections helpers.
    it('returns a non-container unchanged and reference-equal', () => {
      const plain = card('markdown');
      expect(appendCardToContainer(plain, card('button'))).toBe(plain);
    });
  });
});
