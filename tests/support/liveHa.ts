/**
 * Live Home Assistant support — Phase 7 amendment 04.
 *
 * ⚠⚠ THE HOSTNAME IS THE SAFETY BOUNDARY, AND IT IS ENFORCED HERE IN CODE.
 * `ha-test.home.local` is WRITABLE. `ha.home.local` is READ-ONLY and is
 * VPP-enrolled via Amber Electric SmartShift — Modbus writes are blocked and
 * Remote EMS cannot be enabled there. Amendment-03 §4 permits writes to it only
 * inside a UAT round, against a temporary dashboard, and amendment-04 does not
 * relax that by one inch.
 *
 * The risk this module guards is NOT a broken test instance — the owner has said
 * it does not matter if that breaks. It is a future change quietly repointing
 * these helpers at production. So the host is asserted on every connection
 * rather than merely defaulted, and the token is read from a location that only
 * ever holds the test instance's credential.
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import WebSocket from 'ws';

/** The ONLY host these helpers may write to. */
export const LIVE_HA_HOST = 'ha-test.home.local:8123';
export const LIVE_HA_BASE = `http://${LIVE_HA_HOST}`;

/**
 * The test instance's token, deliberately OUTSIDE the repository and separate
 * from the reference instance's (which lives in `~/.claude/settings.json`).
 * Amendment-04 §1.1: no single configuration value may serve both hosts, so a
 * misconfiguration cannot point a write at production.
 */
export const LIVE_HA_TOKEN_PATH = resolve(homedir(), '.havdm/ha-test-token');

/** Dashboards this harness creates. Torn down unless HAVDM_LIVE_KEEP=1. */
export const LIVE_DASHBOARD_URL_PATH = 'havdm-agent-test';

export const KEEP_DEPLOYED = process.env.HAVDM_LIVE_KEEP === '1';

/** Read the token, or return null so a spec can SKIP rather than fail. */
export const readLiveToken = (): string | null => {
  try {
    const token = readFileSync(LIVE_HA_TOKEN_PATH, 'utf8').trim();
    return token.length > 0 ? token : null;
  } catch {
    return null;
  }
};

/** Is the instance reachable AND authenticated? Used to skip cleanly. */
export const liveHaAvailable = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${LIVE_HA_BASE}/api/`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export interface HaSocket {
  send: <T = unknown>(type: string, extra?: Record<string, unknown>) => Promise<T>;
  close: () => void;
}

/**
 * An in-flight request, with its generic erased.
 *
 * ⚠ `resolve` takes `unknown`, not `never`. The map holds calls of many result
 * types at once, so the per-call `T` cannot survive into it — and typing the
 * slot as `never` makes the resolver accept nothing at all, which fails to
 * compile at the one place it is used. `unknown` erases the type without
 * closing the door, and without reaching for `any` (which would push the lint
 * warning count off its 145 baseline).
 */
interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

/**
 * Open an authenticated WebSocket to the TEST instance.
 *
 * ⚠ Refuses any host but {@link LIVE_HA_HOST}. This is the guard that makes
 * "these helpers can never touch production" a property of the code rather than
 * a convention someone has to remember.
 */
export const connectLiveHa = (token: string, host: string = LIVE_HA_HOST): Promise<HaSocket> => {
  if (host !== LIVE_HA_HOST) {
    throw new Error(
      `Refusing to connect to "${host}". These helpers may only write to ${LIVE_HA_HOST} ` +
        `(Phase 7 amendment 04). ha.home.local is READ-ONLY.`,
    );
  }

  return new Promise((resolvePromise, rejectPromise) => {
    const socket = new WebSocket(`ws://${host}/api/websocket`);
    const pending = new Map<number, PendingCall>();
    let nextId = 1;
    let settled = false;

    const send = <T = unknown>(type: string, extra: Record<string, unknown> = {}): Promise<T> =>
      new Promise<T>((res, rej) => {
        const id = nextId++;
        pending.set(id, { resolve: res as (value: unknown) => void, reject: rej });
        socket.send(JSON.stringify({ id, type, ...extra }));
      });

    socket.on('message', (raw: WebSocket.RawData) => {
      const message = JSON.parse(String(raw));

      if (message.type === 'auth_required') {
        socket.send(JSON.stringify({ type: 'auth', access_token: token }));
        return;
      }
      if (message.type === 'auth_ok') {
        settled = true;
        resolvePromise({ send, close: () => socket.close() });
        return;
      }
      if (message.type === 'auth_invalid') {
        settled = true;
        socket.close();
        rejectPromise(new Error(`Authentication rejected by ${host}`));
        return;
      }
      if (message.type === 'result') {
        const call = pending.get(message.id);
        if (!call) return;
        pending.delete(message.id);
        if (message.success) call.resolve(message.result);
        else call.reject(new Error(JSON.stringify(message.error)));
      }
    });

    socket.on('error', (error: Error) => {
      if (!settled) rejectPromise(error);
    });
  });
};

interface DashboardSummary {
  id: string;
  url_path: string;
}

/**
 * Remove every dashboard at {@link LIVE_DASHBOARD_URL_PATH}.
 *
 * ⭐ Called BOTH before and after a deploy. Before, because a previous run that
 * died mid-test would otherwise collide; after, because amendment-04 §4 requires
 * teardown by default. Idempotent — safe when there is nothing to remove.
 */
export const removeLiveDashboards = async (ha: HaSocket): Promise<number> => {
  const dashboards = await ha.send<DashboardSummary[]>('lovelace/dashboards/list');
  const mine = dashboards.filter((d) => d.url_path === LIVE_DASHBOARD_URL_PATH);
  for (const dashboard of mine) {
    await ha.send('lovelace/dashboards/delete', { dashboard_id: dashboard.id });
  }
  return mine.length;
};

/** Create the test dashboard and write `config` to it. Returns its url_path. */
export const deployLiveDashboard = async (
  ha: HaSocket,
  config: unknown,
  title = 'HAVDM Agent Test',
): Promise<string> => {
  await removeLiveDashboards(ha);
  await ha.send('lovelace/dashboards/create', {
    url_path: LIVE_DASHBOARD_URL_PATH,
    title,
    require_admin: false,
    show_in_sidebar: true,
    mode: 'storage',
  });
  await ha.send('lovelace/config/save', { url_path: LIVE_DASHBOARD_URL_PATH, config });
  return LIVE_DASHBOARD_URL_PATH;
};

/**
 * The localStorage payload Home Assistant's frontend reads to consider itself
 * logged in. Injecting it is what lets a headless browser render a dashboard
 * without driving the login form.
 *
 * ⚠ `clientId` must be null — long-lived access tokens are not issued to an
 * OAuth client, and a non-null value makes the frontend try to refresh against
 * one that does not exist.
 */
export const haAuthPayload = (token: string) => ({
  access_token: token,
  token_type: 'Bearer',
  expires_in: 315_360_000,
  hassUrl: LIVE_HA_BASE,
  clientId: null,
  expires: Date.now() + 315_360_000_000,
});
