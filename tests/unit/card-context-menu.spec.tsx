/**
 * Regression tests for the v1.0.0 UAT round-1 defect CANVAS-06 — "No right-click
 * context menu display".
 *
 * `CardContextMenu` was correct all along: it renders
 * `<Dropdown menu={{ items }} trigger={['contextMenu']}>`. The break was in its
 * CHILD. antd implements a contextMenu trigger by React.cloneElement-ing the
 * child with an `onContextMenu` handler and a ref, and `BaseCard` destructured
 * exactly { card, isSelected, onClick } and spread nothing — so both were
 * silently dropped. No error, no warning, right-click just did nothing, in both
 * GridCanvas and SectionsCanvas.
 *
 * ⭐ These tests pin the CONTRACT (BaseCard is transparent to injected props and
 * accepts a ref) as well as the OUTCOME (the menu opens), because the contract
 * is the thing that is easy to break again — the next person to tidy up
 * BaseCard's props would reintroduce the defect with a green outcome test only
 * if the contract test did not exist.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseCard } from '../../src/components/BaseCard';
import { CardContextMenu } from '../../src/components/CardContextMenu';
import { HAEntityProvider } from '../../src/contexts/HAEntityContext';
import type { Card } from '../../src/types/dashboard';

// The jsdom ResizeObserver polyfill this file needs now lives in the shared
// tests/unit/setup.ts. It used to be duplicated here, guarded, because that
// shared file and this spec arrived in two different non-stacked PRs and
// identical lines in the same file would have handed the second merge a
// conflict. Both are on main, so the local copy is gone.

const BUTTON_CARD = { type: 'button', name: 'UAT Button' } as Card;

const withProvider = (ui: React.ReactElement) =>
  render(<HAEntityProvider enabled={false}>{ui}</HAEntityProvider>);

describe('BaseCard is transparent to injected props (the CardContextMenu contract)', () => {
  it('attaches an injected onContextMenu to a real DOM node', () => {
    const onContextMenu = vi.fn();

    withProvider(<BaseCard card={BUTTON_CARD} onContextMenu={onContextMenu} />);

    fireEvent.contextMenu(screen.getByTestId('conditional-visibility-wrapper'));

    expect(onContextMenu).toHaveBeenCalledTimes(1);
  });

  it('accepts a ref, which antd needs as its positioning anchor', () => {
    const ref = React.createRef<HTMLDivElement>();

    withProvider(<BaseCard card={BUTTON_CARD} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('forwards props on the SPACER branch too, not just the main one', () => {
    // The spacer branch returns early from a different `return`, so it is a
    // separate code path and was equally broken.
    const onContextMenu = vi.fn();
    const ref = React.createRef<HTMLDivElement>();

    withProvider(
      <BaseCard card={{ type: 'spacer' } as Card} onContextMenu={onContextMenu} ref={ref} />,
    );

    fireEvent.contextMenu(screen.getByTestId('conditional-visibility-wrapper'));

    expect(onContextMenu).toHaveBeenCalledTimes(1);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('does not let injected props clobber the testids the suites rely on', () => {
    withProvider(<BaseCard card={BUTTON_CARD} className="injected-class" />);

    const wrapper = screen.getByTestId('conditional-visibility-wrapper');
    // The injected className reaches the DOM...
    expect(wrapper).toHaveClass('injected-class');
    // ...without displacing our own attributes.
    expect(wrapper).toHaveAttribute('data-visible', 'true');
  });
});

describe('CardContextMenu opens on right-click', () => {
  const renderMenu = (overrides: Partial<Parameters<typeof CardContextMenu>[0]> = {}) => {
    const handlers = {
      onCut: vi.fn(),
      onCopy: vi.fn(),
      onPaste: vi.fn(),
      onDelete: vi.fn(),
      canPaste: true,
      ...overrides,
    };
    withProvider(
      <CardContextMenu {...handlers}>
        <BaseCard card={BUTTON_CARD} />
      </CardContextMenu>,
    );
    return handlers;
  };

  it('shows Cut, Copy, Paste and Delete', async () => {
    renderMenu();

    fireEvent.contextMenu(screen.getByTestId('conditional-visibility-wrapper'));

    // ⭐ Before the fix this found nothing at all — the menu never mounted.
    expect(await screen.findByText('Cut')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('invokes the matching handler when an item is chosen', async () => {
    const handlers = renderMenu();

    fireEvent.contextMenu(screen.getByTestId('conditional-visibility-wrapper'));
    fireEvent.click(await screen.findByText('Copy'));

    expect(handlers.onCopy).toHaveBeenCalledTimes(1);
    expect(handlers.onCut).not.toHaveBeenCalled();
    expect(handlers.onDelete).not.toHaveBeenCalled();
  });
});
