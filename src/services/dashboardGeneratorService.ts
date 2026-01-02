/**
 * Dashboard Generator Service
 *
 * Generates dashboard configurations automatically based on entity types/domains.
 * Creates pre-configured layouts with appropriate cards for different categories.
 */

import { DashboardConfig } from '../types/dashboard';

export interface Entity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    device_class?: string;
    icon?: string;
    unit_of_measurement?: string;
    [key: string]: any;
  };
}

export interface DashboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredDomains: string[];
  helpText: string;
}

export const DASHBOARD_CATEGORIES: DashboardCategory[] = [
  {
    id: 'lights',
    name: 'Lights',
    description: 'Control and monitor all your lighting',
    icon: '💡',
    requiredDomains: ['light'],
    helpText: 'Grid layout with light controls including on/off toggles and brightness sliders',
  },
  {
    id: 'surveillance',
    name: 'Surveillance',
    description: 'Monitor security cameras',
    icon: '📹',
    requiredDomains: ['camera'],
    helpText: 'Camera panel grid with live streams and snapshots',
  },
  {
    id: 'power',
    name: 'Power Management',
    description: 'Energy consumption and battery monitoring',
    icon: '⚡',
    requiredDomains: ['sensor'],
    helpText: 'Energy overview with power, consumption, and battery sensors plus trend charts',
  },
  {
    id: 'climate',
    name: 'Environment/Aircon',
    description: 'Climate control and environmental monitoring',
    icon: '🌡️',
    requiredDomains: ['climate', 'sensor'],
    helpText: 'Climate/thermostat cards with temperature and humidity sensors, including mode controls',
  },
  {
    id: 'presence',
    name: 'Presence & People',
    description: 'Track who is home and location status',
    icon: '👥',
    requiredDomains: ['person', 'device_tracker'],
    helpText: 'House status view with presence tracking, last arrival/departure, and quick mode toggles',
  },
  {
    id: 'covers',
    name: 'Covers & Shades',
    description: 'Control doors, garage, gates, and window covers',
    icon: '🚪',
    requiredDomains: ['cover'],
    helpText: 'Openings view with door/garage/gate controls grouped by room, with quick open/close/stop actions',
  },
  {
    id: 'security',
    name: 'Security & Access',
    description: 'Arm/disarm alarm and monitor locks',
    icon: '🔒',
    requiredDomains: ['alarm_control_panel', 'lock', 'binary_sensor'],
    helpText: 'Security view with arm/disarm controls, lock status, perimeter sensors, and quick actions',
  },
  {
    id: 'rooms',
    name: 'Appliances & Rooms',
    description: 'Room-based device and sensor overview',
    icon: '🏠',
    requiredDomains: ['switch', 'sensor'],
    helpText: 'Compact room cards showing key sensors and top actions, grouped by area when available',
  },
  {
    id: 'media',
    name: 'Media & Entertainment',
    description: 'Control media players and entertainment',
    icon: '🎬',
    requiredDomains: ['media_player'],
    helpText: 'Room-based media cards with now-playing info, volume controls, and scene activation',
  },
];

class DashboardGeneratorService {
  /**
   * Get available categories based on user entities
   */
  getAvailableCategories(entities: Entity[]): DashboardCategory[] {
    const entityDomains = new Set(entities.map(e => e.entity_id.split('.')[0]));

    return DASHBOARD_CATEGORIES.filter(category => {
      // Category is available if user has at least one required domain
      return category.requiredDomains.some(domain => entityDomains.has(domain));
    });
  }

  /**
   * Get entities for a specific category
   */
  getEntitiesForCategory(categoryId: string, allEntities: Entity[]): Entity[] {
    const category = DASHBOARD_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];

    // Filter entities that match category's domains
    const filteredEntities = allEntities.filter(entity => {
      const domain = entity.entity_id.split('.')[0];
      return category.requiredDomains.includes(domain);
    });

    // Sort by entity_id and limit to 6
    return filteredEntities
      .sort((a, b) => a.entity_id.localeCompare(b.entity_id))
      .slice(0, 6);
  }

  /**
   * Generate dashboard for Lights category
   */
  private generateLightsDashboard(entities: Entity[]): DashboardConfig {
    const lightEntities = entities.filter(e => e.entity_id.startsWith('light.'));

    const cards = lightEntities.map((entity, index) => ({
      type: 'light',
      entity: entity.entity_id,
      name: entity.attributes.friendly_name || entity.entity_id,
      layout: {
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 4,
        w: 6,
        h: 4,
      },
    }));

    return {
      title: 'Lights Dashboard',
      views: [
        {
          title: 'Lights',
          path: 'lights',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard for Surveillance category
   */
  private generateSurveillanceDashboard(entities: Entity[]): DashboardConfig {
    const cameraEntities = entities.filter(e => e.entity_id.startsWith('camera.'));

    const cards = cameraEntities.map((entity, index) => ({
      type: 'picture-entity',
      entity: entity.entity_id,
      name: entity.attributes.friendly_name || entity.entity_id,
      show_name: true,
      show_state: true,
      camera_view: 'live',
      layout: {
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 6,
        w: 6,
        h: 6,
      },
    }));

    return {
      title: 'Surveillance Dashboard',
      views: [
        {
          title: 'Cameras',
          path: 'surveillance',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard for Power Management category
   */
  private generatePowerDashboard(entities: Entity[]): DashboardConfig {
    const powerSensors = entities.filter(e => {
      const domain = e.entity_id.split('.')[0];
      if (domain !== 'sensor') return false;

      const deviceClass = e.attributes.device_class?.toLowerCase();
      const unit = e.attributes.unit_of_measurement?.toLowerCase();

      return (
        deviceClass === 'power' ||
        deviceClass === 'energy' ||
        deviceClass === 'battery' ||
        unit === 'w' ||
        unit === 'kw' ||
        unit === 'kwh' ||
        unit === '%'
      );
    });

    const cards = powerSensors.map((entity, index) => ({
      type: 'sensor',
      entity: entity.entity_id,
      name: entity.attributes.friendly_name || entity.entity_id,
      graph: 'line',
      layout: {
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 4,
        w: 6,
        h: 4,
      },
    }));

    return {
      title: 'Power Management Dashboard',
      views: [
        {
          title: 'Energy',
          path: 'power',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard for Climate/Environment category
   */
  private generateClimateDashboard(entities: Entity[]): DashboardConfig {
    const climateEntities = entities.filter(e => e.entity_id.startsWith('climate.'));
    const tempHumiditySensors = entities.filter(e => {
      if (!e.entity_id.startsWith('sensor.')) return false;
      const deviceClass = e.attributes.device_class?.toLowerCase();
      return deviceClass === 'temperature' || deviceClass === 'humidity';
    });

    const cards: any[] = [];
    let yPosition = 0;

    // Add climate controls
    climateEntities.forEach((entity, index) => {
      cards.push({
        type: 'thermostat',
        entity: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        layout: {
          x: (index % 2) * 6,
          y: yPosition,
          w: 6,
          h: 5,
        },
      });
      if (index % 2 === 1) yPosition += 5;
    });

    if (climateEntities.length % 2 === 1) yPosition += 5;

    // Add temperature and humidity sensors
    tempHumiditySensors.forEach((entity, index) => {
      cards.push({
        type: 'sensor',
        entity: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        graph: 'line',
        layout: {
          x: (index % 2) * 6,
          y: yPosition + Math.floor(index / 2) * 4,
          w: 6,
          h: 4,
        },
      });
    });

    return {
      title: 'Climate Dashboard',
      views: [
        {
          title: 'Environment',
          path: 'climate',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard for Presence & People category
   */
  private generatePresenceDashboard(entities: Entity[]): DashboardConfig {
    const personEntities = entities.filter(e => e.entity_id.startsWith('person.'));
    const trackerEntities = entities.filter(e => e.entity_id.startsWith('device_tracker.'));

    const cards: any[] = [];

    // Add person cards
    personEntities.forEach((entity, index) => {
      cards.push({
        type: 'entity',
        entity: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        layout: {
          x: (index % 2) * 6,
          y: Math.floor(index / 2) * 3,
          w: 6,
          h: 3,
        },
      });
    });

    // Add device tracker cards
    const personCount = personEntities.length;
    const yOffset = Math.ceil(personCount / 2) * 3;
    trackerEntities.forEach((entity, index) => {
      cards.push({
        type: 'entity',
        entity: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        layout: {
          x: (index % 2) * 6,
          y: yOffset + Math.floor(index / 2) * 3,
          w: 6,
          h: 3,
        },
      });
    });

    return {
      title: 'Presence Dashboard',
      views: [
        {
          title: 'House Status',
          path: 'presence',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard for Covers & Shades category
   */
  private generateCoversDashboard(entities: Entity[]): DashboardConfig {
    const coverEntities = entities.filter(e => e.entity_id.startsWith('cover.'));

    const cards = coverEntities.map((entity, index) => ({
      type: 'cover',
      entity: entity.entity_id,
      name: entity.attributes.friendly_name || entity.entity_id,
      layout: {
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 4,
        w: 6,
        h: 4,
      },
    }));

    return {
      title: 'Covers & Shades Dashboard',
      views: [
        {
          title: 'Openings',
          path: 'covers',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard for Security & Access category
   */
  private generateSecurityDashboard(entities: Entity[]): DashboardConfig {
    const alarmEntities = entities.filter(e => e.entity_id.startsWith('alarm_control_panel.'));
    const lockEntities = entities.filter(e => e.entity_id.startsWith('lock.'));
    const sensorEntities = entities.filter(e => {
      if (!e.entity_id.startsWith('binary_sensor.')) return false;
      const deviceClass = e.attributes.device_class?.toLowerCase();
      return deviceClass === 'door' || deviceClass === 'window' || deviceClass === 'motion' || deviceClass === 'opening';
    });

    const cards: any[] = [];
    let yPosition = 0;

    // Add alarm panels
    alarmEntities.forEach((entity, index) => {
      cards.push({
        type: 'alarm-panel',
        entity: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        layout: {
          x: (index % 2) * 6,
          y: yPosition,
          w: 6,
          h: 5,
        },
      });
      if (index % 2 === 1) yPosition += 5;
    });

    if (alarmEntities.length % 2 === 1) yPosition += 5;

    // Add locks
    lockEntities.forEach((entity, index) => {
      cards.push({
        type: 'lock',
        entity: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        layout: {
          x: (index % 2) * 6,
          y: yPosition + Math.floor(index / 2) * 3,
          w: 6,
          h: 3,
        },
      });
    });

    yPosition += Math.ceil(lockEntities.length / 2) * 3;

    // Add sensors
    sensorEntities.forEach((entity, index) => {
      cards.push({
        type: 'entity',
        entity: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        layout: {
          x: (index % 2) * 6,
          y: yPosition + Math.floor(index / 2) * 2,
          w: 6,
          h: 2,
        },
      });
    });

    return {
      title: 'Security Dashboard',
      views: [
        {
          title: 'Security',
          path: 'security',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard for Appliances & Rooms category
   */
  private generateRoomsDashboard(entities: Entity[]): DashboardConfig {
    const switchEntities = entities.filter(e => e.entity_id.startsWith('switch.'));
    const sensorEntities = entities.filter(e => e.entity_id.startsWith('sensor.'));

    // Mix switches and sensors
    const combined = [...switchEntities, ...sensorEntities].slice(0, 6);

    const cards = combined.map((entity, index) => {
      const isSwitch = entity.entity_id.startsWith('switch.');
      return {
        type: isSwitch ? 'switch' : 'sensor',
        entity: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        ...(isSwitch ? {} : { graph: 'line' }),
        layout: {
          x: (index % 2) * 6,
          y: Math.floor(index / 2) * 4,
          w: 6,
          h: 4,
        },
      };
    });

    return {
      title: 'Rooms Dashboard',
      views: [
        {
          title: 'Rooms',
          path: 'rooms',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard for Media & Entertainment category
   */
  private generateMediaDashboard(entities: Entity[]): DashboardConfig {
    const mediaEntities = entities.filter(e => e.entity_id.startsWith('media_player.'));

    const cards = mediaEntities.map((entity, index) => ({
      type: 'media-control',
      entity: entity.entity_id,
      name: entity.attributes.friendly_name || entity.entity_id,
      layout: {
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 5,
        w: 6,
        h: 5,
      },
    }));

    return {
      title: 'Media Dashboard',
      views: [
        {
          title: 'Entertainment',
          path: 'media',
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards,
        },
      ],
    };
  }

  /**
   * Generate dashboard configuration for a specific category
   */
  generateDashboard(categoryId: string, entities: Entity[]): DashboardConfig | null {
    const categoryEntities = this.getEntitiesForCategory(categoryId, entities);

    if (categoryEntities.length === 0) {
      return null;
    }

    switch (categoryId) {
      case 'lights':
        return this.generateLightsDashboard(categoryEntities);
      case 'surveillance':
        return this.generateSurveillanceDashboard(categoryEntities);
      case 'power':
        return this.generatePowerDashboard(categoryEntities);
      case 'climate':
        return this.generateClimateDashboard(categoryEntities);
      case 'presence':
        return this.generatePresenceDashboard(categoryEntities);
      case 'covers':
        return this.generateCoversDashboard(categoryEntities);
      case 'security':
        return this.generateSecurityDashboard(categoryEntities);
      case 'rooms':
        return this.generateRoomsDashboard(categoryEntities);
      case 'media':
        return this.generateMediaDashboard(categoryEntities);
      default:
        return null;
    }
  }

  /**
   * Get entity count for a category
   */
  getCategoryEntityCount(categoryId: string, entities: Entity[]): number {
    return this.getEntitiesForCategory(categoryId, entities).length;
  }
}

// Export singleton instance
export const dashboardGeneratorService = new DashboardGeneratorService();
