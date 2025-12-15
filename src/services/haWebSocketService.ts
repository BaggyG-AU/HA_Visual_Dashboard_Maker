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

/**
 * Home Assistant WebSocket Service
 * Handles WebSocket connections to Home Assistant for retrieving dashboard configurations
 */
export class HAWebSocketService {
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingMessages = new Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }>();

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
}

// Export a singleton instance
export const haWebSocketService = new HAWebSocketService();
