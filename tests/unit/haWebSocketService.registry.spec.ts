/**
 * ⭐⭐⭐ THE PROTOCOL SEAM.
 *
 * HAVDM's existing HA mock (`tests/helpers/mockHelpers.ts`) mocks at the **IPC**
 * layer — `ipcMain.handle('ha:ws:fetchEntities')` — not at the WebSocket
 * protocol. That is exactly the gap the owner's ruling names: *a test suite that
 * mocks (or omits) the other side of a seam cannot see the seam*. An IPC-only
 * mock would happily go green against a WRONG COMMAND NAME.
 *
 * So this spec drives the real `HAWebSocketService` against a fake socket and
 * asserts the **exact frame** that leaves the process, then replies with rows
 * captured VERBATIM from the live instance. It costs milliseconds, where the
 * equivalent Electron round costs minutes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { realEntityRegistryRows } from '../fixtures/haEntityRegistry';

interface Frame {
  id?: number;
  type: string;
  [key: string]: unknown;
}

const sockets: FakeSocket[] = [];

class FakeSocket {
  static OPEN = 1;
  static CLOSED = 3;

  readyState = FakeSocket.OPEN;
  sent: Frame[] = [];
  private handlers: Record<string, ((...args: unknown[]) => void)[]> = {};

  constructor(public url: string) {
    sockets.push(this);
  }

  on(event: string, cb: (...args: unknown[]) => void): this {
    (this.handlers[event] ||= []).push(cb);
    return this;
  }

  send(data: string): void {
    this.sent.push(JSON.parse(data) as Frame);
  }

  close(): void {
    this.readyState = FakeSocket.CLOSED;
    this.emit('close');
  }

  emit(event: string, ...args: unknown[]): void {
    (this.handlers[event] ?? []).forEach((h) => h(...args));
  }

  /** Push a frame from "Home Assistant" into the service. */
  receive(frame: unknown): void {
    this.emit('message', Buffer.from(JSON.stringify(frame)));
  }

  /** The last frame the service sent, ignoring the auth handshake. */
  lastCommand(): Frame {
    return this.sent.filter((f) => f.type !== 'auth').at(-1) as Frame;
  }
}

vi.mock('ws', () => ({ default: FakeSocket }));

// Imported after the mock so the service binds to FakeSocket.
const { HAWebSocketService } = await import('../../src/services/haWebSocketService');

async function connected(): Promise<{
  svc: InstanceType<typeof HAWebSocketService>;
  sock: FakeSocket;
}> {
  const svc = new HAWebSocketService();
  const pending = svc.connect('http://ha.test:8123', 'test-token');
  const sock = sockets.at(-1) as FakeSocket;

  sock.emit('open');
  sock.receive({ type: 'auth_required', ha_version: '2026.7.4' });
  sock.receive({ type: 'auth_ok', ha_version: '2026.7.4' });
  await pending;

  return { svc, sock };
}

beforeEach(() => {
  sockets.length = 0;
  // The service arms 10s handshake and 30s request timeouts. Fake timers keep
  // them from holding the worker open; nothing here needs a timer to fire.
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('HAWebSocketService.fetchEntityRegistry — the wire protocol', () => {
  it('⭐⭐⭐ sends exactly `config/entity_registry/list` and nothing else', async () => {
    const { svc, sock } = await connected();

    const pending = svc.fetchEntityRegistry();
    const frame = sock.lastCommand();

    // The whole point of this spec: the COMMAND NAME is asserted against the
    // wire, not against our own mock's expectations of it.
    expect(frame.type).toBe('config/entity_registry/list');
    expect(typeof frame.id).toBe('number');
    // No filter/pagination arguments — HA takes none, and sending one errors.
    expect(Object.keys(frame).sort()).toEqual(['id', 'type']);

    sock.receive({ id: frame.id, type: 'result', success: true, result: realEntityRegistryRows });
    await expect(pending).resolves.toHaveLength(realEntityRegistryRows.length);
  });

  it('returns the rows verbatim, extra keys intact, for the projector to narrow', async () => {
    const { svc, sock } = await connected();

    const pending = svc.fetchEntityRegistry();
    const frame = sock.lastCommand();
    sock.receive({ id: frame.id, type: 'result', success: true, result: realEntityRegistryRows });

    const rows = await pending;
    expect(rows[0].entity_id).toBe('sensor.sun_next_dawn');
    expect(rows[0].platform).toBe('sun');
    expect(rows[0].entity_category).toBe('diagnostic');
    // Untouched — narrowing is the projector's job, not the transport's.
    expect(rows[0]).toHaveProperty('unique_id');
  });

  it('⭐ rejects when Home Assistant refuses the command (a non-admin token)', async () => {
    // `config/entity_registry/list` is admin-only. A non-admin user must get a
    // rejection the caller can degrade on — never a silent empty list, which
    // would read as "this instance has no registry" and hide nothing forever.
    const { svc, sock } = await connected();

    const pending = svc.fetchEntityRegistry();
    const frame = sock.lastCommand();
    sock.receive({
      id: frame.id,
      type: 'result',
      success: false,
      error: { code: 'unauthorized', message: 'Unauthorized' },
    });

    await expect(pending).rejects.toThrow('Unauthorized');
  });

  it('CONTROL: an empty registry resolves to an empty array, not a rejection', async () => {
    const { svc, sock } = await connected();

    const pending = svc.fetchEntityRegistry();
    const frame = sock.lastCommand();
    sock.receive({ id: frame.id, type: 'result', success: true, result: [] });

    await expect(pending).resolves.toEqual([]);
  });

  it('CONTROL: a non-array result resolves to an empty array rather than leaking the shape', async () => {
    const { svc, sock } = await connected();

    const pending = svc.fetchEntityRegistry();
    const frame = sock.lastCommand();
    sock.receive({ id: frame.id, type: 'result', success: true, result: null });

    await expect(pending).resolves.toEqual([]);
  });

  it('CONTROL: throws when not connected, exactly like every other command', async () => {
    const svc = new HAWebSocketService();
    await expect(svc.fetchEntityRegistry()).rejects.toThrow('WebSocket is not connected');
  });

  it('CONTROL: does not disturb the existing get_states command', async () => {
    const { svc, sock } = await connected();

    const pending = svc.fetchAllEntities();
    const frame = sock.lastCommand();
    expect(frame.type).toBe('get_states');

    sock.receive({ id: frame.id, type: 'result', success: true, result: [] });
    await expect(pending).resolves.toEqual([]);
  });
});
