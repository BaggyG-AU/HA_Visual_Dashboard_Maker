import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
});
