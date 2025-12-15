/**
 * Card Type Registry
 *
 * Manages available card types for the palette.
 * Designed to support:
 * - Static standard HA cards (Phase 4 - MVP)
 * - Dynamic discovery from HA API (Phase 13)
 * - HACS custom cards (Phase 13+)
 */

export type CardCategory =
  | 'layout'
  | 'sensor'
  | 'control'
  | 'media'
  | 'information'
  | 'custom';

export type CardSource =
  | 'builtin'    // Standard HA cards
  | 'hacs'       // HACS custom cards
  | 'custom'     // User custom cards
  | 'discovered'; // Discovered from HA instance

export interface CardTypeMetadata {
  type: string;
  name: string;
  category: CardCategory;
  icon: string; // Ant Design icon name or MDI icon
  description: string;
  isCustom: boolean;
  source: CardSource;
  defaultProps?: Record<string, any>;
  requiredProps?: string[];
}

class CardRegistry {
  private cards: Map<string, CardTypeMetadata> = new Map();

  constructor() {
    // Initialize with standard HA cards
    this.registerStandardCards();
  }

  /**
   * Register standard Home Assistant cards
   * This will be the default set for MVP
   */
  private registerStandardCards() {
    const standardCards: CardTypeMetadata[] = [
      // Layout Cards
      {
        type: 'horizontal-stack',
        name: 'Horizontal Stack',
        category: 'layout',
        icon: 'BorderHorizontalOutlined',
        description: 'Stack cards horizontally in a row',
        isCustom: false,
        source: 'builtin',
        defaultProps: { cards: [] },
        requiredProps: ['cards'],
      },
      {
        type: 'vertical-stack',
        name: 'Vertical Stack',
        category: 'layout',
        icon: 'BorderVerticleOutlined',
        description: 'Stack cards vertically in a column',
        isCustom: false,
        source: 'builtin',
        defaultProps: { cards: [] },
        requiredProps: ['cards'],
      },
      {
        type: 'grid',
        name: 'Grid',
        category: 'layout',
        icon: 'AppstoreOutlined',
        description: 'Display cards in a grid layout',
        isCustom: false,
        source: 'builtin',
        defaultProps: { cards: [], columns: 3 },
        requiredProps: ['cards'],
      },
      {
        type: 'spacer',
        name: 'Spacer',
        category: 'layout',
        icon: 'BorderOutlined',
        description: 'Empty space for layout purposes',
        isCustom: false,
        source: 'builtin',
        defaultProps: { _isSpacer: true },
      },

      // Sensor/Display Cards
      {
        type: 'entities',
        name: 'Entities',
        category: 'sensor',
        icon: 'UnorderedListOutlined',
        description: 'Display multiple entities in a list',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [] },
        requiredProps: ['entities'],
      },
      {
        type: 'glance',
        name: 'Glance',
        category: 'sensor',
        icon: 'EyeOutlined',
        description: 'Quick overview of multiple entities',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [] },
        requiredProps: ['entities'],
      },
      {
        type: 'sensor',
        name: 'Sensor',
        category: 'sensor',
        icon: 'DashboardOutlined',
        description: 'Display a single sensor value',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'gauge',
        name: 'Gauge',
        category: 'sensor',
        icon: 'DashboardOutlined',
        description: 'Display sensor value as a gauge',
        isCustom: false,
        source: 'builtin',
        defaultProps: { min: 0, max: 100 },
        requiredProps: ['entity'],
      },
      {
        type: 'history-graph',
        name: 'History Graph',
        category: 'sensor',
        icon: 'LineChartOutlined',
        description: 'Display entity history as a graph',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [], hours_to_show: 24 },
        requiredProps: ['entities'],
      },

      // Control Cards
      {
        type: 'button',
        name: 'Button',
        category: 'control',
        icon: 'PushpinOutlined',
        description: 'Single entity control button',
        isCustom: false,
        source: 'builtin',
        defaultProps: { tap_action: { action: 'toggle' } },
        requiredProps: ['entity'],
      },
      {
        type: 'light',
        name: 'Light',
        category: 'control',
        icon: 'BulbOutlined',
        description: 'Control a light entity',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },
      {
        type: 'thermostat',
        name: 'Thermostat',
        category: 'control',
        icon: 'FireOutlined',
        description: 'Control climate entities',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },

      // Information Cards
      {
        type: 'markdown',
        name: 'Markdown',
        category: 'information',
        icon: 'FileTextOutlined',
        description: 'Display formatted text and markdown',
        isCustom: false,
        source: 'builtin',
        defaultProps: { content: '# Title\n\nYour content here...' },
        requiredProps: ['content'],
      },
      {
        type: 'picture',
        name: 'Picture',
        category: 'information',
        icon: 'PictureOutlined',
        description: 'Display an image',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['image'],
      },
      {
        type: 'picture-entity',
        name: 'Picture Entity',
        category: 'information',
        icon: 'PictureOutlined',
        description: 'Display image with entity state',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity', 'image'],
      },
      {
        type: 'picture-glance',
        name: 'Picture Glance',
        category: 'information',
        icon: 'PictureOutlined',
        description: 'Picture with entity controls',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [] },
        requiredProps: ['image', 'entities'],
      },

      // Media Cards
      {
        type: 'media-control',
        name: 'Media Control',
        category: 'media',
        icon: 'PlayCircleOutlined',
        description: 'Control media player entities',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },

      // Other
      {
        type: 'map',
        name: 'Map',
        category: 'information',
        icon: 'EnvironmentOutlined',
        description: 'Display device tracker on map',
        isCustom: false,
        source: 'builtin',
        defaultProps: { entities: [] },
        requiredProps: ['entities'],
      },
      {
        type: 'weather-forecast',
        name: 'Weather Forecast',
        category: 'information',
        icon: 'CloudOutlined',
        description: 'Display weather forecast',
        isCustom: false,
        source: 'builtin',
        defaultProps: {},
        requiredProps: ['entity'],
      },
    ];

    standardCards.forEach(card => this.register(card));
  }

  /**
   * Register a new card type
   */
  register(metadata: CardTypeMetadata): void {
    this.cards.set(metadata.type, metadata);
  }

  /**
   * Get metadata for a specific card type
   */
  get(type: string): CardTypeMetadata | undefined {
    return this.cards.get(type);
  }

  /**
   * Get all registered card types
   */
  getAll(): CardTypeMetadata[] {
    return Array.from(this.cards.values());
  }

  /**
   * Get cards by category
   */
  getByCategory(category: CardCategory): CardTypeMetadata[] {
    return this.getAll().filter(card => card.category === category);
  }

  /**
   * Get cards by source
   */
  getBySource(source: CardSource): CardTypeMetadata[] {
    return this.getAll().filter(card => card.source === source);
  }

  /**
   * Get all custom cards (HACS + custom)
   */
  getCustomCards(): CardTypeMetadata[] {
    return this.getAll().filter(card => card.isCustom);
  }

  /**
   * Load cards from Home Assistant instance (Phase 13)
   * This will be implemented when HA connection is added
   */
  async loadFromHomeAssistant(haUrl: string, token: string): Promise<void> {
    // TODO: Phase 13 - Fetch available cards from HA API
    // This will discover HACS cards and custom cards
    console.log('Loading cards from Home Assistant...', { haUrl, token });
    throw new Error('Home Assistant connection not yet implemented (Phase 13)');
  }

  /**
   * Clear all registered cards
   */
  clear(): void {
    this.cards.clear();
  }

  /**
   * Reset to standard cards only
   */
  reset(): void {
    this.clear();
    this.registerStandardCards();
  }
}

// Export singleton instance
export const cardRegistry = new CardRegistry();
