import WebSocket from 'ws';

interface WebSocketMessage {
  id?: number;
  type: string;
  [key: string]: any;
}

interface DashboardListItem {
  id: string;
  title: string;
  icon?: string;
  url_path: string;
  require_admin: boolean;
  show_in_sidebar: boolean;
  mode: string;
}

export interface EntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export type EntityStates = Record<string, EntityState>;

/**
 * Home Assistant WebSocket Service
 * Handles WebSocket connections to Home Assistant for retrieving dashboard configurations
 */
export class HAWebSocketService {
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingMessages = new Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }>();
  private entitySubscriptionId: number | null = null;
  private entityStateCallbacks: Set<(entities: EntityStates) => void> = new Set();
  private currentEntityStates: EntityStates = {};

  /**
   * Connect to Home Assistant WebSocket API
   */
  async connect(url: string, token: string): Promise<void> {
    // Convert HTTP URL to WebSocket URL
    const wsUrl = url.replace(/^http/, 'ws') + '/api/websocket';

    console.log(`Connecting to Home Assistant WebSocket: ${wsUrl}`);

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('WebSocket connection opened');
      });

      this.ws.on('message', async (data: WebSocket.Data) => {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        console.log('Received message:', message);

        // Handle authentication flow
        if (message.type === 'auth_required') {
          console.log('Authentication required, sending token...');
          this.send({
            type: 'auth',
            access_token: token,
          });
        } else if (message.type === 'auth_ok') {
          console.log('Authentication successful!');
          resolve();
        } else if (message.type === 'auth_invalid') {
          console.error('Authentication failed:', message);
          this.close();
          reject(new Error('Authentication failed: ' + (message.message || 'Invalid token')));
        } else if (message.type === 'event' && message.id === this.entitySubscriptionId) {
          // Handle entity state change events
          const event = message.event;
          if (event && event.a) {
            // Update changed entities
            Object.assign(this.currentEntityStates, event.a);
          }
          if (event && event.r) {
            // Remove deleted entities
            event.r.forEach((entityId: string) => {
              delete this.currentEntityStates[entityId];
            });
          }
          if (event && event.c) {
            // Update changed properties
            Object.entries(event.c).forEach(([entityId, changes]) => {
              if (this.currentEntityStates[entityId]) {
                Object.assign(this.currentEntityStates[entityId], changes);
              }
            });
          }

          // Notify all subscribers
          this.entityStateCallbacks.forEach(callback => {
            callback({ ...this.currentEntityStates });
          });
        } else if (message.id !== undefined) {
          // Handle response to a specific request
          const pending = this.pendingMessages.get(message.id);
          if (pending) {
            this.pendingMessages.delete(message.id);
            if (message.type === 'result') {
              if (message.success) {
                pending.resolve(message.result);
              } else {
                pending.reject(new Error(message.error?.message || 'Unknown error'));
              }
            } else {
              pending.reject(new Error('Unexpected message type: ' + message.type));
            }
          }
        }
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.ws = null;
        // Reject all pending messages
        this.pendingMessages.forEach((pending) => {
          pending.reject(new Error('WebSocket connection closed'));
        });
        this.pendingMessages.clear();
      });
    });
  }

  /**
   * Send a message and wait for response
   */
  private async sendAndWait<T>(message: Omit<WebSocketMessage, 'id'>): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const id = this.messageId++;
    const fullMessage = { ...message, id };

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, { resolve, reject });
      this.send(fullMessage);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Send a message without waiting for response
   */
  private send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    console.log('Sending message:', message);
    this.ws.send(JSON.stringify(message));
  }

  /**
   * List all Lovelace dashboards
   */
  async listDashboards(): Promise<DashboardListItem[]> {
    const result = await this.sendAndWait<DashboardListItem[]>({
      type: 'lovelace/dashboards/list',
    });

    console.log('Dashboard list result:', result);
    return result;
  }

  /**
   * Get dashboard configuration
   * @param urlPath - null for default dashboard, or dashboard ID for custom dashboards
   */
  async getDashboardConfig(urlPath: string | null): Promise<any> {
    const result = await this.sendAndWait<any>({
      type: 'lovelace/config',
      url_path: urlPath,
      force: false,
    });

    console.log(`Dashboard config result for ${urlPath}:`, result);
    return result;
  }

  /**
   * Close the WebSocket connection
   */
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Create a new Lovelace dashboard resource
   * @param urlPath - Dashboard URL path (e.g., 'temp_dashboard_editor_123456')
   * @param title - Dashboard title
   * @param icon - Dashboard icon (optional)
   */
  async createDashboardResource(urlPath: string, title: string, icon?: string): Promise<void> {
    await this.sendAndWait<void>({
      type: 'lovelace/dashboards/create',
      url_path: urlPath,
      title: title,
      icon: icon || 'mdi:view-dashboard',
      mode: 'storage', // Use storage mode for programmatic dashboards
      require_admin: false,
      show_in_sidebar: false, // Don't show temp dashboards in sidebar
    });

    console.log(`Created dashboard resource: ${urlPath}`);
  }

  /**
   * Save/update Lovelace dashboard configuration
   * @param urlPath - Dashboard URL path (e.g., 'temp_dashboard_editor_123456')
   * @param config - Dashboard configuration object
   */
  async saveDashboardConfig(urlPath: string, config: any): Promise<void> {
    await this.sendAndWait<void>({
      type: 'lovelace/config/save',
      url_path: urlPath,
      config: config,
    });

    console.log(`Saved dashboard config for ${urlPath}`);
  }

  /**
   * Delete a Lovelace dashboard (both resource and config)
   * @param urlPath - Dashboard URL path to delete
   */
  async deleteDashboardConfig(urlPath: string): Promise<void> {
    await this.sendAndWait<void>({
      type: 'lovelace/dashboards/delete',
      dashboard_id: urlPath,
    });

    console.log(`Deleted dashboard: ${urlPath}`);
  }

  /**
   * Create a temporary dashboard for editing
   * @param baseConfig - Base dashboard configuration to copy
   * @returns URL path of the temporary dashboard
   */
  async createTempDashboard(baseConfig: any): Promise<string> {
    // HA requires URL paths to contain hyphens, not underscores
    const tempUrlPath = `temp-dashboard-editor-${Date.now()}`;
    const tempTitle = `${baseConfig.title || 'Dashboard'} (Editing)`;

    // Step 1: Create the dashboard resource
    await this.createDashboardResource(tempUrlPath, tempTitle, 'mdi:pencil');

    // Step 2: Save the dashboard config to the newly created resource
    const tempConfig = {
      ...baseConfig,
      title: tempTitle,
    };

    await this.saveDashboardConfig(tempUrlPath, tempConfig);

    console.log(`Created temporary dashboard: ${tempUrlPath}`);
    return tempUrlPath;
  }

  /**
   * Deploy temporary dashboard to production
   * 1. Backup current production dashboard
   * 2. Copy temp dashboard to production
   * 3. Delete temp dashboard
   *
   * @param tempUrlPath - Temporary dashboard URL path
   * @param productionUrlPath - Production dashboard URL path (null for default dashboard)
   * @returns Result object with success status and backup path
   */
  async deployDashboard(
    tempUrlPath: string,
    productionUrlPath: string | null
  ): Promise<{ success: boolean; backupPath?: string; error?: string }> {
    try {
      // 1. Get current production config for backup
      const productionConfig = await this.getDashboardConfig(productionUrlPath);

      // 2. Create backup dashboard with timestamp
      const backupPath = `${productionUrlPath || 'default'}_backup_${Date.now()}`;
      const backupTitle = `${productionConfig.title || 'Dashboard'} (Backup)`;

      // Create backup dashboard resource first
      await this.createDashboardResource(backupPath, backupTitle, 'mdi:backup-restore');
      // Then save the production config to the backup
      await this.saveDashboardConfig(backupPath, productionConfig);
      console.log(`Backed up production dashboard to: ${backupPath}`);

      // 3. Get temp dashboard config
      const tempConfig = await this.getDashboardConfig(tempUrlPath);

      // 4. Save temp config to production (no need to create resource, it already exists)
      await this.saveDashboardConfig(productionUrlPath || 'lovelace', tempConfig);
      console.log(`Deployed temp dashboard to production: ${productionUrlPath || 'default'}`);

      // 5. Delete temp dashboard
      await this.deleteDashboardConfig(tempUrlPath);
      console.log(`Deleted temporary dashboard: ${tempUrlPath}`);

      return { success: true, backupPath };
    } catch (error: any) {
      console.error('Failed to deploy dashboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete temporary dashboard (cleanup)
   * @param tempUrlPath - Temporary dashboard URL path to delete
   */
  async deleteTempDashboard(tempUrlPath: string): Promise<void> {
    await this.deleteDashboardConfig(tempUrlPath);
    console.log(`Deleted temporary dashboard: ${tempUrlPath}`);
  }

  /**
   * Update temporary dashboard with new config (for live updates during editing)
   * @param tempUrlPath - Temporary dashboard URL path
   * @param config - Updated dashboard configuration
   */
  async updateTempDashboard(tempUrlPath: string, config: any): Promise<void> {
    await this.saveDashboardConfig(tempUrlPath, config);
    console.log(`Updated temporary dashboard: ${tempUrlPath}`);
  }

  /**
   * Subscribe to entity state changes
   * Returns the current state immediately and updates whenever state changes
   *
   * @param callback - Function called with all entity states when they change
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToEntityStates(callback: (entities: EntityStates) => void): Promise<() => void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    // Add callback to set
    this.entityStateCallbacks.add(callback);

    // If this is the first subscription, subscribe to state_changed events
    if (this.entitySubscriptionId === null) {
      const id = this.messageId++;
      this.entitySubscriptionId = id;

      // Subscribe to state_changed events
      this.send({
        id: id,
        type: 'subscribe_entities',
      });

      // Wait for initial state
      try {
        const initialStates = await this.sendAndWait<EntityStates>({
          type: 'get_states',
        });

        // Convert array to object keyed by entity_id
        if (Array.isArray(initialStates)) {
          this.currentEntityStates = initialStates.reduce((acc: EntityStates, entity: EntityState) => {
            acc[entity.entity_id] = entity;
            return acc;
          }, {});
        } else {
          this.currentEntityStates = initialStates;
        }

        // Send initial state to this callback
        callback({ ...this.currentEntityStates });

        // Also notify any other existing callbacks
        this.entityStateCallbacks.forEach(cb => {
          if (cb !== callback) {
            cb({ ...this.currentEntityStates });
          }
        });
      } catch (error) {
        console.error('Failed to get initial entity states:', error);
        this.entityStateCallbacks.delete(callback);
        throw error;
      }
    } else {
      // Already subscribed, just send current state to new callback
      callback({ ...this.currentEntityStates });
    }

    // Return unsubscribe function
    return () => {
      this.entityStateCallbacks.delete(callback);

      // If no more callbacks, unsubscribe from websocket
      if (this.entityStateCallbacks.size === 0 && this.entitySubscriptionId !== null) {
        this.send({
          id: this.entitySubscriptionId,
          type: 'unsubscribe_events',
          subscription: this.entitySubscriptionId,
        });
        this.entitySubscriptionId = null;
        this.currentEntityStates = {};
      }
    };
  }

  /**
   * Get current entity states (cached from subscription)
   * Returns empty object if not subscribed
   */
  getCurrentEntityStates(): EntityStates {
    return { ...this.currentEntityStates };
  }

  /**
   * Get a specific entity state
   */
  getEntityState(entityId: string): EntityState | null {
    return this.currentEntityStates[entityId] || null;
  }

  /**
   * Fetch all entity states from Home Assistant
   * @returns Array of all entity states
   */
  async fetchAllEntities(): Promise<EntityState[]> {
    const states = await this.sendAndWait<EntityState[]>({
      type: 'get_states',
    });

    console.log(`Fetched ${states.length} entities from Home Assistant`);
    return states;
  }
}

// Export a singleton instance
export const haWebSocketService = new HAWebSocketService();
