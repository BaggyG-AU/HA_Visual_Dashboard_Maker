/**
 * Test Data Generator
 *
 * Utilities for generating test dashboards, cards, and entities.
 */

import * as yaml from 'js-yaml';

export interface GeneratedDashboard {
  title: string;
  views: GeneratedView[];
}

export interface GeneratedView {
  title: string;
  path: string;
  cards: GeneratedCard[];
}

export interface GeneratedCard {
  type: string;
  [key: string]: any;
}

/**
 * Generate a simple test dashboard
 */
export function generateSimpleDashboard(): GeneratedDashboard {
  return {
    title: 'Test Dashboard',
    views: [
      {
        title: 'Main View',
        path: 'main',
        cards: [
          {
            type: 'entities',
            title: 'Test Entities',
            entities: [
              { entity: 'light.living_room' },
              { entity: 'sensor.temperature' },
              { entity: 'switch.fan' },
            ],
          },
          {
            type: 'button',
            entity: 'light.bedroom',
            name: 'Bedroom Light',
            icon: 'mdi:lightbulb',
          },
          {
            type: 'markdown',
            content: '# Test Dashboard\n\nThis is a test.',
          },
        ],
      },
    ],
  };
}

/**
 * Generate a dashboard with layout-card grid
 */
export function generateLayoutCardDashboard(): GeneratedDashboard {
  return {
    title: 'Layout Card Dashboard',
    views: [
      {
        title: 'Grid Layout',
        path: 'grid',
        cards: [
          {
            type: 'entities',
            title: 'Left Panel',
            view_layout: {
              grid_column: '1 / 7',
              grid_row: '1 / 5',
            },
            entities: [
              { entity: 'light.living_room' },
              { entity: 'light.bedroom' },
            ],
          },
          {
            type: 'button',
            entity: 'scene.movie_mode',
            name: 'Movie Mode',
            view_layout: {
              grid_column: '7 / 13',
              grid_row: '1 / 3',
            },
          },
        ],
      },
    ],
  };
}

/**
 * Generate a dashboard with many cards
 */
export function generateLargeDashboard(cardCount = 50): GeneratedDashboard {
  const cards: GeneratedCard[] = [];

  for (let i = 0; i < cardCount; i++) {
    const cardType = ['entities', 'button', 'glance', 'markdown'][i % 4];

    switch (cardType) {
      case 'entities':
        cards.push({
          type: 'entities',
          title: `Entities ${i + 1}`,
          entities: [
            { entity: `light.light_${i}` },
            { entity: `sensor.sensor_${i}` },
          ],
        });
        break;

      case 'button':
        cards.push({
          type: 'button',
          entity: `switch.switch_${i}`,
          name: `Button ${i + 1}`,
          icon: 'mdi:toggle-switch',
        });
        break;

      case 'glance':
        cards.push({
          type: 'glance',
          title: `Glance ${i + 1}`,
          entities: [
            { entity: `sensor.temp_${i}` },
            { entity: `sensor.humidity_${i}` },
          ],
        });
        break;

      case 'markdown':
        cards.push({
          type: 'markdown',
          content: `# Card ${i + 1}\n\nTest content for card ${i + 1}.`,
        });
        break;
    }
  }

  return {
    title: 'Large Dashboard',
    views: [
      {
        title: 'Main View',
        path: 'main',
        cards,
      },
    ],
  };
}

/**
 * Generate a multi-view dashboard
 */
export function generateMultiViewDashboard(): GeneratedDashboard {
  return {
    title: 'Multi-View Dashboard',
    views: [
      {
        title: 'Lights',
        path: 'lights',
        cards: [
          {
            type: 'entities',
            title: 'Living Room Lights',
            entities: [
              { entity: 'light.living_room_ceiling' },
              { entity: 'light.living_room_lamp' },
            ],
          },
          {
            type: 'entities',
            title: 'Bedroom Lights',
            entities: [
              { entity: 'light.bedroom_ceiling' },
              { entity: 'light.bedroom_lamp' },
            ],
          },
        ],
      },
      {
        title: 'Climate',
        path: 'climate',
        cards: [
          {
            type: 'thermostat',
            entity: 'climate.living_room',
            name: 'Living Room',
          },
          {
            type: 'glance',
            title: 'Climate Sensors',
            entities: [
              { entity: 'sensor.living_room_temperature' },
              { entity: 'sensor.living_room_humidity' },
            ],
          },
        ],
      },
      {
        title: 'Security',
        path: 'security',
        cards: [
          {
            type: 'glance',
            title: 'Doors & Windows',
            entities: [
              { entity: 'binary_sensor.front_door' },
              { entity: 'binary_sensor.back_door' },
              { entity: 'binary_sensor.living_room_window' },
            ],
          },
          {
            type: 'button',
            entity: 'alarm_control_panel.home',
            name: 'Alarm',
            icon: 'mdi:shield-home',
          },
        ],
      },
    ],
  };
}

/**
 * Generate a dashboard with custom cards
 */
export function generateCustomCardDashboard(): GeneratedDashboard {
  return {
    title: 'Custom Cards Dashboard',
    views: [
      {
        title: 'Custom',
        path: 'custom',
        cards: [
          {
            type: 'custom:apexcharts-card',
            graph_span: '24h',
            series: [
              {
                entity: 'sensor.temperature',
                name: 'Temperature',
              },
            ],
          },
          {
            type: 'custom:power-flow-card-plus',
            entities: {
              grid: 'sensor.grid_power',
              solar: 'sensor.solar_power',
              home: 'sensor.home_power',
            },
          },
          {
            type: 'custom:bubble-card',
            card_type: 'button',
            entity: 'light.living_room',
            name: 'Living Room',
          },
        ],
      },
    ],
  };
}

/**
 * Convert dashboard object to YAML string
 */
export function dashboardToYAML(dashboard: GeneratedDashboard): string {
  return yaml.dump(dashboard, {
    lineWidth: 120,
    noRefs: true,
  });
}

/**
 * Generate random entity ID
 */
export function generateEntityId(domain: string, name?: string): string {
  const randomName = name || `test_${Math.random().toString(36).substr(2, 9)}`;
  return `${domain}.${randomName.toLowerCase().replace(/\s+/g, '_')}`;
}

/**
 * Generate test entities for a given domain
 */
export function generateEntities(domain: string, count: number): string[] {
  const entities: string[] = [];
  for (let i = 0; i < count; i++) {
    entities.push(generateEntityId(domain, `item_${i + 1}`));
  }
  return entities;
}

/**
 * Create a card configuration
 */
export function createCard(
  type: string,
  props: Record<string, any> = {}
): GeneratedCard {
  return {
    type,
    ...props,
  };
}

/**
 * Create an entities card with random entities
 */
export function createEntitiesCard(
  title: string,
  entityCount = 3
): GeneratedCard {
  return createCard('entities', {
    title,
    entities: [
      ...generateEntities('light', Math.ceil(entityCount / 3)),
      ...generateEntities('sensor', Math.ceil(entityCount / 3)),
      ...generateEntities('switch', Math.floor(entityCount / 3)),
    ].map((entity) => ({ entity })),
  });
}

/**
 * Create a button card
 */
export function createButtonCard(entity: string, name: string): GeneratedCard {
  return createCard('button', {
    entity,
    name,
    icon: 'mdi:gesture-tap',
  });
}

/**
 * Create a glance card
 */
export function createGlanceCard(
  title: string,
  entities: string[]
): GeneratedCard {
  return createCard('glance', {
    title,
    entities: entities.map((entity) => ({ entity })),
  });
}

/**
 * Create a markdown card
 */
export function createMarkdownCard(content: string): GeneratedCard {
  return createCard('markdown', { content });
}

/**
 * Validate dashboard structure
 */
export function validateDashboard(dashboard: GeneratedDashboard): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dashboard.title) {
    errors.push('Dashboard must have a title');
  }

  if (!dashboard.views || dashboard.views.length === 0) {
    errors.push('Dashboard must have at least one view');
  }

  dashboard.views?.forEach((view, index) => {
    if (!view.title) {
      errors.push(`View ${index} must have a title`);
    }
    if (!view.path) {
      errors.push(`View ${index} must have a path`);
    }
    if (!view.cards || view.cards.length === 0) {
      errors.push(`View ${index} must have at least one card`);
    }

    view.cards?.forEach((card, cardIndex) => {
      if (!card.type) {
        errors.push(`View ${index}, Card ${cardIndex} must have a type`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
