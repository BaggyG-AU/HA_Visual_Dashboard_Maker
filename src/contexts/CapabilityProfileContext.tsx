/**
 * CapabilityProfileContext — one source of truth for the persisted capability
 * profile, shared by every surface that has to be honest about what Home
 * Assistant can actually render.
 *
 * ⭐ WHY THIS EXISTS (EXPORT-04 / F4 defect 1 — PROPAGATION). `CardPalette`
 * used to fetch the profile itself in a `useEffect(..., [])` with an EMPTY
 * dependency array, so a capture performed mid-session never reached an already
 * open palette: the user connected, HAVDM captured 24 installed elements, and
 * the palette went on showing the never-connected permissive list until the app
 * was restarted. Lifting the fetch here gives the profile a single owner that
 * can be REFRESHED, and `BaseCard` needs the very same value to mark a PLACED
 * not-installed card (defect 3) — two consumers, one fetch.
 *
 * ⚠ THE PROFILE IS STILL THE OFFLINE SOURCE OF TRUTH AND THIS IS STILL NEVER A
 * LIVE QUERY (the standalone principle). `refresh()` re-reads the PERSISTED
 * store — `capability:capture` writes it to disk (`main.ts:605`) before it
 * resolves, so re-reading after a capture is guaranteed to see the new profile
 * and keeps disk the only authority. Nothing here talks to Home Assistant.
 *
 * ⚠⚠ `useCapabilityProfile` DELIBERATELY DOES NOT THROW WHEN THERE IS NO
 * PROVIDER, which is the opposite of `useHAEntities`. A card renderer and the
 * palette are both rendered bare in unit tests (and `BaseCard` is reachable from
 * several harnesses that mount no app chrome); making the hook throw would turn
 * this into a test-infrastructure change instead of a behaviour change, and the
 * permissive default is exactly the right answer for a component with no app
 * around it. See `tests/unit/CardPalette.availability.spec.tsx`, which renders
 * the palette with nothing but a stubbed `window.electronAPI`.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  defaultCapabilityProfile,
  type CapabilityProfile,
} from '../services/capability/capabilityProfile';

interface CapabilityProfileContextValue {
  profile: CapabilityProfile;
  /** Re-read the persisted profile. Call after a capture. */
  refresh: () => Promise<void>;
}

const CapabilityProfileContext = createContext<CapabilityProfileContextValue | null>(null);

interface CapabilityProfileProviderProps {
  children: React.ReactNode;
}

export function CapabilityProfileProvider({ children }: CapabilityProfileProviderProps) {
  const [profile, setProfile] = useState<CapabilityProfile>(defaultCapabilityProfile());

  const refresh = useCallback(async () => {
    const api = window.electronAPI;
    if (!api?.capabilityGetProfile) return; // no bridge (unit tests) → permissive default
    try {
      const res = await api.capabilityGetProfile();
      if (res?.profile) setProfile(res.profile);
    } catch {
      /* keep whatever we already had — a read failure must not un-mark cards */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <CapabilityProfileContext.Provider value={{ profile, refresh }}>
      {children}
    </CapabilityProfileContext.Provider>
  );
}

/**
 * Read the shared profile. Returns the permissive never-connected default when
 * rendered outside a provider — see the ⚠⚠ note in this file's header; that is a
 * deliberate contract, not a missing guard.
 */
export function useCapabilityProfile(): CapabilityProfile {
  return useContext(CapabilityProfileContext)?.profile ?? defaultCapabilityProfile();
}

/**
 * Refresh handle for the one caller that owns capture (`App`). Returns a no-op
 * outside a provider so a bare render cannot crash.
 */
export function useRefreshCapabilityProfile(): () => Promise<void> {
  const ctx = useContext(CapabilityProfileContext);
  return ctx?.refresh ?? (async () => {});
}
