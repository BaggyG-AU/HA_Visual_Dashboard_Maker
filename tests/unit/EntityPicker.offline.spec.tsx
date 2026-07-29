import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import type { HAEntity } from '../../src/types/homeassistant';

// Disconnected: the inline pickers must fall back to the persisted offline cache
// instead of showing a "Not Connected" wall (standalone principle). Before the
// fix these tests are RED — the components ignored the cache when disconnected.
vi.mock('../../src/services/haConnectionService', () => ({
  haConnectionService: {
    isConnected: vi.fn().mockReturnValue(false), // disconnected
    fetchEntities: vi.fn(),
  },
}));

import { EntitySelect } from '../../src/components/EntitySelect';
import { EntityMultiSelect } from '../../src/components/EntityMultiSelect';

const ent = (id: string, friendly: string): HAEntity => ({
  entity_id: id,
  state: 'on',
  attributes: { friendly_name: friendly },
  last_changed: '',
  last_updated: '',
  context: { id: 'c', parent_id: null, user_id: null },
});

const CACHED = [ent('light.kitchen', 'Kitchen Light'), ent('sensor.temp', 'Temperature')];

beforeEach(() => {
  (window as unknown as { electronAPI: unknown }).electronAPI = {
    getCachedEntities: vi.fn().mockResolvedValue({ success: true, entities: CACHED }),
  };
});

afterEach(() => {
  vi.clearAllMocks();
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

describe('inline entity pickers — offline cache fallback', () => {
  it('EntitySelect: disconnected with a cache shows a cached-list hint, not a "Not Connected" wall', async () => {
    render(<EntitySelect data-testid="entity-select" />);

    await waitFor(() => {
      expect(screen.getByText(/showing cached entities/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Not Connected/i)).toBeNull();
  });

  it('EntityMultiSelect: disconnected with a cache shows a cached-list hint, not a "Not Connected" wall', async () => {
    render(<EntityMultiSelect dataTestId="entity-multi" value={[]} />);

    await waitFor(() => {
      expect(screen.getByText(/showing cached entities/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Not Connected/i)).toBeNull();
  });

  it('EntitySelect: disconnected with an EMPTY cache still shows the "Not Connected" hint', async () => {
    (window as unknown as { electronAPI: unknown }).electronAPI = {
      getCachedEntities: vi.fn().mockResolvedValue({ success: true, entities: [] }),
    };
    render(<EntitySelect data-testid="entity-select" />);

    await waitFor(() => {
      expect(screen.getByText(/Not Connected/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/showing cached entities/i)).toBeNull();
  });

  /**
   * ⚠⚠ PROPS-03, AND A COVERAGE LESSON WORTH RECORDING. The test directly above
   * asserts the "Not Connected" hint appears with an empty cache — and it passed
   * throughout the life of the defect, because the hint was never the problem.
   * The problem sat one layer down: that branch rendered an EMPTY `<Select>` with
   * no options and no search, so a never-connected user could not enter an
   * entity id AT ALL. A spec that asserts the presence of a message beside a
   * dead end certifies the message and says nothing about the dead end.
   *
   * The card's own Expected has always required the permissive behaviour: "A
   * non-existent id is accepted — HAVDM is permissive when not connected". This
   * test asserts the part that was actually broken.
   */
  it('EntitySelect: disconnected with an EMPTY cache still accepts a hand-typed entity id', async () => {
    (window as unknown as { electronAPI: unknown }).electronAPI = {
      getCachedEntities: vi.fn().mockResolvedValue({ success: true, entities: [] }),
    };
    const onChange = vi.fn();
    render(<EntitySelect data-testid="entity-select" onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText(/Not connected/i)).toBeInTheDocument();
    });

    // ⭐ The field must be a real text input, not a Select with nothing in it.
    const field = screen.getByTestId('entity-select') as HTMLInputElement;
    expect(field.tagName).toBe('INPUT');

    fireEvent.change(field, { target: { value: 'sensor.hand_typed_entity' } });
    expect(onChange).toHaveBeenCalledWith('sensor.hand_typed_entity');
  });
});
