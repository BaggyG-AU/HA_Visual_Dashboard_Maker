import * as yaml from 'js-yaml';
import { DashboardConfig, YAMLParseResult } from '../types/dashboard';
import { logger } from './logger';
import { exportDashboard, importDashboard } from './yamlConversionService';

class YAMLService {
  private static readonly POPUP_EXPORT_WARNING = [
    '# WARNING: custom:popup-card is a HAVDM editor feature.',
    '# This card will not render in Home Assistant without the HAVDM runtime.',
    '# Consider using browser_mod popup or Bubble Card pop-up for HA-native popups.',
  ].join('\n');

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

      const imported = importDashboard(data as Record<string, unknown>) as Record<string, unknown>;

      // Basic validation passed
      const dashboardConfig: DashboardConfig = {
        title: imported.title as string | undefined,
        views: imported.views as DashboardConfig['views'],
        background: imported.background as string | undefined,
        theme: imported.theme as string | undefined
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

    return exportDashboard(sanitized as unknown as Record<string, unknown>) as DashboardConfig;
  }

  /**
   * Serialize dashboard config for Home Assistant deployment
   * Automatically sanitizes HAVDM-internal properties
   */
  serializeForHA(config: DashboardConfig): string {
    const sanitized = this.sanitizeForHA(config);
    logger.debug('Sanitized config for HA', sanitized);
    const serialized = this.serializeDashboard(sanitized);

    if (!this.containsPopupCard(sanitized)) {
      return serialized;
    }

    return `${YAMLService.POPUP_EXPORT_WARNING}\n${serialized}`;
  }

  private containsPopupCard(value: unknown): boolean {
    if (Array.isArray(value)) {
      return value.some(item => this.containsPopupCard(item));
    }
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as Record<string, unknown>;
    if (record.type === 'custom:popup-card') {
      return true;
    }

    return Object.values(record).some(entry => this.containsPopupCard(entry));
  }
}

export const yamlService = new YAMLService();
