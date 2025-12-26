/**
 * Credentials Service
 *
 * Securely stores and manages Home Assistant connection credentials
 * using electron-store with encryption via Electron's safeStorage API.
 *
 * Features:
 * - Encrypted storage of long-lived access tokens
 * - Support for multiple HA instances
 * - Auto-reconnect to last used instance
 * - Credential management (add/remove/update)
 */

import Store from 'electron-store';
import { safeStorage } from 'electron';

export interface HACredential {
  id: string;              // Unique identifier (timestamp-based)
  name: string;            // User-friendly name (e.g., "Home HA", "Remote HA")
  url: string;             // HA instance URL
  encryptedToken: string;  // Encrypted long-lived access token
  lastUsed?: number;       // Timestamp of last use
  createdAt: number;       // Timestamp of creation
}

export interface CredentialsStore {
  credentials: HACredential[];
  lastUsedId?: string;
}

class CredentialsService {
  private store: Store<CredentialsStore>;

  constructor() {
    this.store = new Store<CredentialsStore>({
      projectName: 'ha-visual-dashboard-maker',
      name: 'ha-credentials',
      defaults: {
        credentials: [],
      },
      encryptionKey: 'ha-visual-dashboard-maker-encryption-key',
    });
  }

  /**
   * Check if encryption is available on this system
   */
  isEncryptionAvailable(): boolean {
    return safeStorage.isEncryptionAvailable();
  }

  /**
   * Encrypt a token using Electron's safeStorage
   */
  private encryptToken(token: string): string {
    if (!this.isEncryptionAvailable()) {
      console.warn('Encryption not available, storing token in plain text');
      return token;
    }

    const buffer = safeStorage.encryptString(token);
    return buffer.toString('base64');
  }

  /**
   * Decrypt a token using Electron's safeStorage
   */
  private decryptToken(encryptedToken: string): string {
    if (!this.isEncryptionAvailable()) {
      console.warn('Encryption not available, token was stored in plain text');
      return encryptedToken;
    }

    try {
      const buffer = Buffer.from(encryptedToken, 'base64');
      return safeStorage.decryptString(buffer);
    } catch (error) {
      console.error('Failed to decrypt token:', error);
      throw new Error('Failed to decrypt access token');
    }
  }

  /**
   * Add or update a credential
   */
  saveCredential(name: string, url: string, token: string, id?: string): HACredential {
    const credentials = this.store.get('credentials', []);

    // Normalize URL (remove trailing slash)
    const normalizedUrl = url.replace(/\/$/, '');

    if (id) {
      // Update existing credential
      const index = credentials.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error(`Credential with id ${id} not found`);
      }

      const updated: HACredential = {
        ...credentials[index],
        name,
        url: normalizedUrl,
        encryptedToken: this.encryptToken(token),
        lastUsed: Date.now(),
      };

      credentials[index] = updated;
      this.store.set('credentials', credentials);
      this.store.set('lastUsedId', id);
      return updated;
    } else {
      // Create new credential
      const newCredential: HACredential = {
        id: `ha_${Date.now()}`,
        name,
        url: normalizedUrl,
        encryptedToken: this.encryptToken(token),
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };

      credentials.push(newCredential);
      this.store.set('credentials', credentials);
      this.store.set('lastUsedId', newCredential.id);
      return newCredential;
    }
  }

  /**
   * Get all stored credentials (without decrypted tokens)
   */
  getAllCredentials(): Omit<HACredential, 'encryptedToken'>[] {
    const credentials = this.store.get('credentials', []);
    return credentials.map(({ encryptedToken, ...rest }) => rest);
  }

  /**
   * Get a specific credential with decrypted token
   */
  getCredential(id: string): { name: string; url: string; token: string } | null {
    const credentials = this.store.get('credentials', []);
    const credential = credentials.find(c => c.id === id);

    if (!credential) {
      return null;
    }

    try {
      return {
        name: credential.name,
        url: credential.url,
        token: this.decryptToken(credential.encryptedToken),
      };
    } catch (error) {
      console.error('Failed to get credential:', error);
      return null;
    }
  }

  /**
   * Get the last used credential
   */
  getLastUsedCredential(): { id: string; name: string; url: string; token: string } | null {
    const lastUsedId = this.store.get('lastUsedId');
    if (!lastUsedId) {
      return null;
    }

    const credential = this.getCredential(lastUsedId);
    if (!credential) {
      return null;
    }

    return {
      id: lastUsedId,
      ...credential,
    };
  }

  /**
   * Update last used timestamp for a credential
   */
  markAsUsed(id: string): void {
    const credentials = this.store.get('credentials', []);
    const index = credentials.findIndex(c => c.id === id);

    if (index !== -1) {
      credentials[index].lastUsed = Date.now();
      this.store.set('credentials', credentials);
      this.store.set('lastUsedId', id);
    }
  }

  /**
   * Delete a credential
   */
  deleteCredential(id: string): boolean {
    const credentials = this.store.get('credentials', []);
    const filtered = credentials.filter(c => c.id !== id);

    if (filtered.length === credentials.length) {
      return false; // Credential not found
    }

    this.store.set('credentials', filtered);

    // Clear lastUsedId if it was the deleted credential
    if (this.store.get('lastUsedId') === id) {
      this.store.delete('lastUsedId');
    }

    return true;
  }

  /**
   * Clear all credentials (use with caution)
   */
  clearAllCredentials(): void {
    this.store.set('credentials', []);
    this.store.delete('lastUsedId');
  }

  /**
   * Get credential by URL (for checking duplicates)
   */
  findByUrl(url: string): Omit<HACredential, 'encryptedToken'> | null {
    const normalizedUrl = url.replace(/\/$/, '');
    const credentials = this.store.get('credentials', []);
    const credential = credentials.find(c => c.url === normalizedUrl);

    if (!credential) {
      return null;
    }

    const { encryptedToken, ...rest } = credential;
    return rest;
  }
}

// Export singleton instance
export const credentialsService = new CredentialsService();
