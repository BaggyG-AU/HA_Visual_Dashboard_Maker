/**
 * Capability Profile Service
 *
 * Persists the Phase 3 CapabilityProfile to `electron-store` so the palette can
 * resolve card availability OFFLINE, from the profile captured on the last
 * connect — never a live query at render time (standalone principle,
 * MemPalace `drawer_havdm_decisions_0a5220b0b581800521a959f6`). Slice **I3**.
 *
 * Dedicated store (`name: 'ha-capability-profile'`), matching the per-concern
 * precedent of `credentialsService` (`ha-credentials`) and `settingsService`.
 * Main-process only — the renderer reaches it via the `capability:*` IPC in
 * `main.ts`.
 */
import Store from 'electron-store';
import {
  defaultCapabilityProfile,
  withOverride,
  type CapabilityProfile,
  type CardOverride,
} from './capability/capabilityProfile';

interface CapabilityProfileStore {
  profile: CapabilityProfile;
}

class CapabilityProfileService {
  private store: Store<CapabilityProfileStore>;

  constructor() {
    this.store = new Store<CapabilityProfileStore>({
      name: 'ha-capability-profile',
      defaults: {
        profile: defaultCapabilityProfile(),
      },
    });
  }

  /** The persisted profile, or the permissive never-connected default. */
  getProfile(): CapabilityProfile {
    return this.store.get('profile', defaultCapabilityProfile());
  }

  /** Persist a freshly captured profile (overwrites — capture preserves overrides itself). */
  saveProfile(profile: CapabilityProfile): void {
    this.store.set('profile', profile);
  }

  /** Set or clear (`override === null`) a manual per-card override; returns the new profile. */
  setOverride(cardType: string, override: CardOverride | null): CapabilityProfile {
    const next = withOverride(this.getProfile(), cardType, override);
    this.saveProfile(next);
    return next;
  }

  /** Reset to the permissive never-connected default (drops captured data AND overrides). */
  clearProfile(): void {
    this.store.set('profile', defaultCapabilityProfile());
  }
}

export const capabilityProfileService = new CapabilityProfileService();
