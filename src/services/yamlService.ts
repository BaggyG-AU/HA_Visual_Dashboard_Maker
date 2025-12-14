import * as yaml from 'js-yaml';
import { DashboardConfig, YAMLParseResult } from '../types/dashboard';

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
}

export const yamlService = new YAMLService();
