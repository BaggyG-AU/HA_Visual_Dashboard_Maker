import * as yaml from 'js-yaml';
import { DashboardConfig, YAMLParseResult } from '../types/dashboard';
import { logger } from './logger';
import { toUpstreamSwipeCardFromConfig } from '../features/carousel/carouselService';
import type { SwiperCardConfig } from '../features/carousel/types';
import { normalizeTabsConfig, toUpstreamTabbedCard } from './tabsService';
import type { TabsCardConfig } from '../types/tabs';

class YAMLService {
  /**
   * Parse YAML string to DashboardConfig
   */
  parseDashboard(yamlContent: string): YAMLParseResult {
    try {
      const data = yaml.load(yamlContent) as any;

      // Validate basic structure
      if (!data) {
        return {
          success: false,
          error: 'Empty or invalid YAML file'
        };
      }

      // Ensure views array exists
      if (!data.views || !Array.isArray(data.views)) {
        return {
          success: false,
          error: 'Dashboard must contain a "views" array'
        };
      }

      // Basic validation passed
      const dashboardConfig: DashboardConfig = {
        title: data.title,
        views: data.views,
        background: data.background,
        theme: data.theme
      };

      return {
        success: true,
        data: dashboardConfig
      };
    } catch (error) {
      const err = error as yaml.YAMLException;

      return {
        success: false,
        error: err.message,
        lineNumber: err.mark?.line
      };
    }
  }

  /**
   * Serialize DashboardConfig to YAML string
   */
  serializeDashboard(config: DashboardConfig): string {
    try {
      return yaml.dump(config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false
      });
    } catch (error) {
      throw new Error(`Failed to serialize dashboard: ${(error as Error).message}`);
    }
  }

  /**
   * Validate YAML syntax without full parsing
   */
  validateYAMLSyntax(yamlContent: string): { valid: boolean; error?: string; lineNumber?: number } {
    try {
      yaml.load(yamlContent);
      return { valid: true };
    } catch (error) {
      const err = error as yaml.YAMLException;
      return {
        valid: false,
        error: err.message,
        lineNumber: err.mark?.line
      };
    }
  }

  /**
   * Pretty print YAML (reformat with consistent indentation)
   */
  formatYAML(yamlContent: string): string | null {
    try {
      const data = yaml.load(yamlContent);
      return yaml.dump(data, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Sanitize dashboard config for Home Assistant deployment
   * Removes HAVDM-specific internal properties that HA doesn't recognize
   */
  sanitizeForHA(config: DashboardConfig): DashboardConfig {
    const sanitized: DashboardConfig = {
      title: config.title,
      views: config.views.map(view => {
        // Create clean view object, removing HAVDM-specific properties
        const cleanView: any = {
          title: view.title,
          path: view.path,
          icon: view.icon,
          theme: view.theme,
          background: view.background,
          badges: view.badges,
          panel: view.panel,
          visible: view.visible,
          cards: view.cards
            ?.filter(card => {
              // Remove spacer cards - HA doesn't have a spacer type
              if (card.type === 'spacer' || (card as any)._isSpacer) {
                return false;
              }
              return true;
            })
            .map(card => {
              // Create a clean copy without HAVDM-internal properties
              const cleanCard: any = { ...card };

              // Remove HAVDM-specific properties
              delete cleanCard.layout;  // HAVDM grid positioning {x, y, w, h}
              delete cleanCard._isSpacer;  // Internal spacer flag

              // Remove any undefined or null values
              Object.keys(cleanCard).forEach(key => {
                if (cleanCard[key] === undefined || cleanCard[key] === null) {
                  delete cleanCard[key];
                }
              });

              if (cleanCard.type === 'custom:swipe-card') {
                return toUpstreamSwipeCardFromConfig(cleanCard as SwiperCardConfig);
              }
              if (cleanCard.type === 'custom:tabbed-card') {
                const normalizedTabs = normalizeTabsConfig(cleanCard as TabsCardConfig);
                return toUpstreamTabbedCard(normalizedTabs, cleanCard as TabsCardConfig);
              }

              return cleanCard;
            }) || []
        };

        // Remove undefined/null properties from view
        Object.keys(cleanView).forEach(key => {
          if (cleanView[key] === undefined || cleanView[key] === null) {
            delete cleanView[key];
          }
        });

        return cleanView;
      }),
      background: config.background,
      theme: config.theme
    };

    return sanitized;
  }

  /**
   * Serialize dashboard config for Home Assistant deployment
   * Automatically sanitizes HAVDM-internal properties
   */
  serializeForHA(config: DashboardConfig): string {
    const sanitized = this.sanitizeForHA(config);
    logger.debug('Sanitized config for HA', sanitized);
    return this.serializeDashboard(sanitized);
  }
}

export const yamlService = new YAMLService();
