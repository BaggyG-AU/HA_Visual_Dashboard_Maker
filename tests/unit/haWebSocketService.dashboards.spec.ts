/**
 * ⭐⭐⭐ THE PROTOCOL SEAM, FOR DASHBOARD DELETION — HA-08.
 *
 * HAVDM's Live Preview creates a temporary dashboard in Home Assistant and
 * promises, in HA-08's own title, that Close deletes it. It did not. Three
 * orphaned dashboards accumulated on the reference instance across two UAT
 * rounds, two of them 31 seconds apart — which also rules out "the tester never
 * pressed Close", since Live Preview cannot be re-entered without leaving it.
 *
 * THE CAUSE IS A ONE-WORD PROTOCOL MISMATCH. `lovelace/dashboards/delete` takes
 * a `dashboard_id`, and HAVDM passed the `url_path`. Home Assistant requires a
 * url_path to contain a HYPHEN and derives the storage id by replacing hyphens
 * with UNDERSCORES, so those are never the same string:
 *
 *   id                                   | url_path
 *   temp_dashboard_editor_1785488482593  | temp-dashboard-editor-1785488482593
 *
 * ⚠ AND THIS IS EXACTLY THE CLASS OF DEFECT AN IPC-LEVEL MOCK CANNOT SEE. A mock
 * of `ipcMain.handle('ha:ws:deleteTempDashboard')` goes green against a delete
 * that Home Assistant would refuse, because nothing in the test ever inspects
 * the frame that leaves the process. So this spec drives the real
 * `HAWebSocketService` against a fake socket and asserts the EXACT frame.
 *
 * ⓘ `FakeSocket` is duplicated from `haWebSocketService.registry.spec.ts` rather
 * than shared: `vi.mock` factories are hoisted above imports, so a shared class
 * would have to be pulled in through an async factory in every consumer. The
 * duplication is the cheaper of the two.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

  /** Every frame the service sent, ignoring the auth handshake. */
  commands(): Frame[] {
    return this.sent.filter((f) => f.type !== 'auth');
  }

  /** The last frame the service sent, ignoring the auth handshake. */
  lastCommand(): Frame {
    return this.commands().at(-1) as Frame;
  }
}

vi.mock('ws', () => ({ default: FakeSocket }));

// Imported after the mock so the service binds to FakeSocket.
const { HAWebSocketService } = await import('../../src/services/haWebSocketService');

/**
 * Captured from the live reference instance (`lovelace/dashboards/list`). The
 * hyphen/underscore split below is REAL, not invented for the test — every
 * dashboard on that instance shows it.
 */
const REAL_DASHBOARD_ROWS = [
  {
    id: 'control_panel',
    title: 'Control Panel',
    url_path: 'control-panel',
    require_admin: false,
    show_in_sidebar: true,
    mode: 'storage',
  },
  {
    id: 'temp_dashboard_editor_1785488482593',
    title: 'Home Energy & EV (Editing)',
    url_path: 'temp-dashboard-editor-1785488482593',
    require_admin: false,
    show_in_sidebar: false,
    mode: 'storage',
  },
];

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

/**
 * Wait for a frame of `type` to leave the service.
 *
 * ⚠ The delete path is `await listDashboards()` THEN `await sendAndWait(delete)`,
 * so the delete frame is several microtasks behind the list reply. A single
 * `await Promise.resolve()` is not enough and produced a spurious `undefined` —
 * a red leg that would have measured the tick count, not the protocol.
 */
async function nextCommand(sock: FakeSocket, type: string): Promise<Frame> {
  for (let i = 0; i < 50; i++) {
    const frame = sock.commands().find((f) => f.type === type);
    if (frame) return frame;
    await Promise.resolve();
  }
  throw new Error(`the service never sent a "${type}" frame`);
}

/** Answer the dashboard-list query the delete path makes first. */
async function answerList(sock: FakeSocket, rows = REAL_DASHBOARD_ROWS): Promise<void> {
  const listFrame = await nextCommand(sock, 'lovelace/dashboards/list');
  sock.receive({ id: listFrame.id, type: 'result', success: true, result: rows });
}

/**
 * Drive the delete path to the frame it actually sends, ANSWERING a dashboard
 * list first only if one is asked for.
 *
 * ⚠⚠ DELIBERATELY TOLERANT OF A SERVICE THAT NEVER LISTS. If this insisted on a
 * list frame, the red leg would die with "never sent a list frame" — true, but
 * only a CONSEQUENCE of the defect. Letting an unlisted delete through means the
 * red leg lands on the `dashboard_id` assertion itself and prints the actual
 * defect as `Received: temp-dashboard-editor-…`. A red leg that names the bug
 * beats one that merely fails.
 */
async function deleteFrame(sock: FakeSocket, rows = REAL_DASHBOARD_ROWS): Promise<Frame> {
  for (let i = 0; i < 50; i++) {
    const list = sock.commands().find((f) => f.type === 'lovelace/dashboards/list');
    const del = sock.commands().find((f) => f.type === 'lovelace/dashboards/delete');
    if (del) return del;
    if (list && !list.answered) {
      list.answered = true;
      sock.receive({ id: list.id, type: 'result', success: true, result: rows });
    }
    await Promise.resolve();
  }
  throw new Error('the service never sent a "lovelace/dashboards/delete" frame');
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

describe('HAWebSocketService.deleteDashboardConfig — the wire protocol (HA-08)', () => {
  it('⭐⭐⭐ deletes by the storage `id`, NOT the url_path it was given', async () => {
    const { svc, sock } = await connected();

    const pending = svc.deleteDashboardConfig('temp-dashboard-editor-1785488482593');
    const frame = await deleteFrame(sock);

    // THE ASSERTION THIS SPEC EXISTS FOR. Before the fix this was the hyphenated
    // url_path, which matches no dashboard, so Home Assistant refused every
    // delete and the temporary dashboards survived.
    expect(frame.dashboard_id).toBe('temp_dashboard_editor_1785488482593');
    expect(frame.dashboard_id).not.toBe('temp-dashboard-editor-1785488482593');

    sock.receive({ id: frame.id, type: 'result', success: true, result: null });
    await expect(pending).resolves.toBeUndefined();
  });

  it('accepts a storage id directly, so a caller already holding one still works', async () => {
    const { svc, sock } = await connected();

    const pending = svc.deleteDashboardConfig('temp_dashboard_editor_1785488482593');
    await answerList(sock);

    const deleteFrame = await nextCommand(sock, 'lovelace/dashboards/delete');
    expect(deleteFrame.dashboard_id).toBe('temp_dashboard_editor_1785488482593');

    sock.receive({ id: deleteFrame.id, type: 'result', success: true, result: null });
    await expect(pending).resolves.toBeUndefined();
  });

  it('⭐ rejects with a usable message when no dashboard has that url_path', async () => {
    const { svc, sock } = await connected();

    const pending = svc.deleteDashboardConfig('temp-dashboard-editor-does-not-exist');
    await answerList(sock);

    await expect(pending).rejects.toThrow(/no home assistant dashboard has the url_path/i);

    // ⭐ CONTROL: it must not send a delete it knows will fail. Anything else
    // would be a write attempted against an instance on the strength of a guess.
    expect(sock.commands().some((f) => f.type === 'lovelace/dashboards/delete')).toBe(false);
  });

  it('⭐ never guesses the id by transforming the string — it reads it back from HA', async () => {
    const { svc, sock } = await connected();

    // A dashboard whose id is NOT the url_path with hyphens swapped. A
    // string-replace fix would send `weird_custom_path` and fail; resolving
    // through the list sends what Home Assistant actually filed it under.
    const pending = svc.deleteDashboardConfig('weird-custom-path');
    await answerList(sock, [
      {
        id: 'a3f81b2c9e',
        title: 'Weird',
        url_path: 'weird-custom-path',
        require_admin: false,
        show_in_sidebar: true,
        mode: 'storage',
      },
    ]);

    const deleteFrame = await nextCommand(sock, 'lovelace/dashboards/delete');
    expect(deleteFrame.dashboard_id).toBe('a3f81b2c9e');

    sock.receive({ id: deleteFrame.id, type: 'result', success: true, result: null });
    await pending;
  });
});
