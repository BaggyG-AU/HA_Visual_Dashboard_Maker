import { Card } from '../types/dashboard';

/**
 * Which cards hold other cards, and how a card is nested into one.
 *
 * PROPS-06 (v1.0.0 UAT round 1, High): the tester added a Vertical Stack and
 * tried to drag a Button into it. The card landed on the CANVAS beside the
 * stack instead — measured as the top-level grid-item count going 1 -> 2 with
 * the stack's own child count unchanged. `GridCanvas.handleDrop` had no notion
 * of a container at all: every palette drop appended to the view's flat `cards`.
 *
 * ⚠ The Properties panel made this worse by documenting the broken route — a
 * stack's help text said "Add or edit cards using the canvas", while every
 * other container type correctly points at the YAML editor.
 *
 * Scope is deliberately the three NATIVE Home Assistant containers that take a
 * `cards` array. HAVDM has other card types with nested content (popup,
 * expander, card-mod wrappers), but their nesting semantics differ and they are
 * out of this slice — an unknown type simply is not a drop target, which is the
 * safe default.
 */
export const CONTAINER_CARD_TYPES = ['vertical-stack', 'horizontal-stack', 'grid'] as const;

export type ContainerCardType = (typeof CONTAINER_CARD_TYPES)[number];

/** True when this card holds a `cards` array that a drop may append to. */
export const isContainerCard = (card: Card | undefined | null): boolean => {
  if (!card || typeof card.type !== 'string') return false;
  return (CONTAINER_CARD_TYPES as readonly string[]).includes(card.type);
};

/**
 * Append `child` to `container.cards`, returning a NEW card. A non-container is
 * returned unchanged and REFERENCE-EQUAL, so callers can skip a state update the
 * same way the sections helpers do.
 *
 * ⚠ A container with no `cards` key yet, or with a malformed one, is treated as
 * empty rather than being refused — "never silently destroy user data" cuts both
 * ways, and refusing here would lose the dropped card instead.
 */
export const appendCardToContainer = (container: Card, child: Card): Card => {
  if (!isContainerCard(container)) return container;
  // `Card` is a union and only some members declare `cards`, so read it through
  // a record view rather than narrowing on every container type in turn.
  const record = container as unknown as Record<string, unknown>;
  const existing = Array.isArray(record.cards) ? (record.cards as Card[]) : [];
  return { ...record, cards: [...existing, child] } as unknown as Card;
};
