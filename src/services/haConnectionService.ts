import {
  HAConnectionConfig,
  HAEntity,
  HAConfig,
  HAConnectionStatus,
  EntityDomain,
} from '../types/homeassistant';
import { logger } from './logger';

/**
 * Service for connecting to and interacting with Home Assistant
 */
class HAConnectionService {
  private config: HAConnectionConfig | null = null;
  private entitiesCache: HAEntity[] = [];
  private lastFetchTime = 0;
  private cacheDuration = 30000; // 30 seconds

  /**
   * Test connection to Home Assistant
   */
  async testConnection(url: string, token: string): Promise<HAConnectionStatus> {
    try {
      const apiUrl = this.normalizeUrl(url);

      // Use Electron IPC to bypass CORS
      const result = await window.electronAPI.haFetch(`${apiUrl}/api/config`, token);

      if (!result.success) {
        return {
          connected: false,
          error: result.error || `HTTP ${result.status}`,
        };
      }

      const config: HAConfig = result.data;
      return {
        connected: true,
        url: apiUrl,
        version: config.version,
      };
    } catch (error) {
      return {
        connected: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Set connection configuration
   */
  setConfig(config: HAConnectionConfig): void {
    this.config = {
      ...config,
      url: this.normalizeUrl(config.url),
    };
    // Clear cache when connection changes
    this.entitiesCache = [];
    this.lastFetchTime = 0;
  }

  /**
   * Get current connection configuration
   */
  getConfig(): HAConnectionConfig | null {
    return this.config;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.config !== null;
  }

  /**
   * Fetch all entities from Home Assistant
   */
  async fetchEntities(forceRefresh = false): Promise<HAEntity[]> {
    if (!this.config) {
      throw new Error('Not connected to Home Assistant. Please configure connection first.');
    }

    // Return cached entities if available and not expired
    const now = Date.now();
    if (!forceRefresh && this.entitiesCache.length > 0 && (now - this.lastFetchTime) < this.cacheDuration) {
      logger.debug('Returning cached entities');
      return this.entitiesCache;
    }

    try {
      // Use Electron IPC to bypass CORS
      const result = await window.electronAPI.haFetch(`${this.config.url}/api/states`, this.config.token);

      if (!result.success) {
        throw new Error(`Failed to fetch entities: ${result.error || `HTTP ${result.status}`}`);
      }

      const entities: HAEntity[] = result.data;

      // Update cache
      this.entitiesCache = entities;
      this.lastFetchTime = now;

      logger.info(`Fetched ${entities.length} entities from Home Assistant`);
      return entities;
    } catch (error) {
      throw new Error(`Failed to fetch entities: ${(error as Error).message}`);
    }
  }

  /**
   * Get entities grouped by domain
   */
  async getEntitiesByDomain(forceRefresh = false): Promise<EntityDomain[]> {
    const entities = await this.fetchEntities(forceRefresh);

    // Group entities by domain
    const domainMap = new Map<string, HAEntity[]>();

    entities.forEach(entity => {
      const domain = entity.entity_id.split('.')[0];
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(entity);
    });

    // Convert to array and sort by domain name
    return Array.from(domainMap.entries())
      .map(([domain, entities]) => ({ domain, entities }))
      .sort((a, b) => a.domain.localeCompare(b.domain));
  }

  /**
   * Search entities by query
   */
  async searchEntities(query: string, forceRefresh = false): Promise<HAEntity[]> {
    const entities = await this.fetchEntities(forceRefresh);
    const lowerQuery = query.toLowerCase();

    return entities.filter(entity => {
      // Search in entity_id
      if (entity.entity_id.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in friendly_name attribute
      const friendlyName = entity.attributes.friendly_name;
      if (friendlyName && friendlyName.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Validate if an entity exists
   */
  async validateEntity(entityId: string, forceRefresh = false): Promise<boolean> {
    const entities = await this.fetchEntities(forceRefresh);
    return entities.some(entity => entity.entity_id === entityId);
  }

  /**
   * Validate multiple entities
   */
  async validateEntities(entityIds: string[], forceRefresh = false): Promise<Map<string, boolean>> {
    const entities = await this.fetchEntities(forceRefresh);
    const entitySet = new Set(entities.map(e => e.entity_id));

    const validationMap = new Map<string, boolean>();
    entityIds.forEach(id => {
      validationMap.set(id, entitySet.has(id));
    });

    return validationMap;
  }

  /**
   * Get entity by ID
   */
  async getEntity(entityId: string, forceRefresh = false): Promise<HAEntity | null> {
    const entities = await this.fetchEntities(forceRefresh);
    return entities.find(entity => entity.entity_id === entityId) || null;
  }

  /**
   * Normalize URL (remove trailing slash, ensure http/https)
   */
  private normalizeUrl(url: string): string {
    let normalized = url.trim();

    // Add http:// if no protocol specified
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `http://${normalized}`;
    }

    // Remove trailing slash
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  /**
   * Fetch Home Assistant configuration
   */
  async fetchConfig(): Promise<HAConfig> {
    if (!this.config) {
      throw new Error('Not connected to Home Assistant. Please configure connection first.');
    }

    try {
      const result = await window.electronAPI.haFetch(`${this.config.url}/api/config`, this.config.token);

      if (!result.success) {
        throw new Error(`Failed to fetch config: ${result.error || `HTTP ${result.status}`}`);
      }

      return result.data as HAConfig;
    } catch (error) {
      throw new Error(`Failed to fetch config: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a component is enabled in Home Assistant
   */
  async isComponentEnabled(componentName: string): Promise<boolean> {
    try {
      const config = await this.fetchConfig();
      return config.components.includes(componentName);
    } catch (error) {
      logger.error(`Failed to check component ${componentName}`, error);
      return false;
    }
  }

  /**
   * Check if stream component is enabled (required for camera live streaming)
   */
  async isStreamComponentEnabled(): Promise<boolean> {
    return this.isComponentEnabled('stream');
  }

  /**
   * Clear cached entities
   */
  clearCache(): void {
    this.entitiesCache = [];
    this.lastFetchTime = 0;
  }

  /**
   * Disconnect from Home Assistant
   */
  disconnect(): void {
    this.config = null;
    this.clearCache();
  }
}

// Export singleton instance
export const haConnectionService = new HAConnectionService();
