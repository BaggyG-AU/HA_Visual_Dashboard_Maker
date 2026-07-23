import * as yaml from 'js-yaml';
import { DashboardConfig, ViewSection, YAMLParseResult } from '../types/dashboard';
import { logger } from './logger';
import { exportDashboard, importDashboard } from './yamlConversionService';
import { selfCheckHaConfig } from './exportSelfCheck';
import { summarizeExportWarnings } from './exportWarningSummary';
import type { ExportWarning } from './exportWarnings';

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
          error: 'Empty or invalid YAML file',
        };
      }

      // Ensure views array exists
      if (!data.views || !Array.isArray(data.views)) {
        return {
          success: false,
          error: 'Dashboard must contain a "views" array',
        };
      }

      const imported = importDashboard(data as Record<string, unknown>) as Record<string, unknown>;

      // Basic validation passed
      const dashboardConfig: DashboardConfig = {
        title: imported.title as string | undefined,
        views: imported.views as DashboardConfig['views'],
        background: imported.background as string | undefined,
        theme: imported.theme as string | undefined,
      };

      return {
        success: true,
        data: dashboardConfig,
      };
    } catch (error) {
      const err = error as yaml.YAMLException;

      return {
        success: false,
        error: err.message,
        lineNumber: err.mark?.line,
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
        sortKeys: false,
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
        lineNumber: err.mark?.line,
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
        sortKeys: false,
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Sanitize dashboard config for Home Assistant deployment, and report what the
   * boundary did (slice B8). Threads a warnings accumulator through the export so
   * the card-mod (B6) / visibility (B6b) / placeholder (B7) translations are
   * collected, then runs a warn-only self-check (`exportSelfCheck.ts`) for any
   * HAVDM-only artefact that leaked through. `sanitizeForHA` returns just the
   * config; this variant also returns the warnings for the deploy UI.
   */
  sanitizeForHAWithReport(config: DashboardConfig): {
    config: DashboardConfig;
    warnings: ExportWarning[];
  } {
    const warnings: ExportWarning[] = [];
    const sanitized: DashboardConfig = {
      title: config.title,
      views: config.views.map((view) => {
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
          cards:
            view.cards?.map((card) => {
              // Create a clean copy. The HAVDM grid geometry is now the internal
              // key `_havdm_layout` (slice B5) and is removed by the recursive
              // export pass below (exportDashboard -> exportCard applies the
              // STRIP class at every depth). Bare `layout` is left untouched — it
              // is Mushroom's real `layout: 'horizontal' | 'vertical'` option,
              // not HAVDM geometry. `_isSpacer` is likewise left intact so the
              // recursive pass can detect and drop spacer cards (B3).
              const cleanCard: any = { ...card };

              // Remove any undefined or null values
              Object.keys(cleanCard).forEach((key) => {
                if (cleanCard[key] === undefined || cleanCard[key] === null) {
                  delete cleanCard[key];
                }
              });

              return cleanCard;
            }) || [],
        };

        // HA "sections" view: its cards live under `sections[].cards`, not the
        // top-level `cards`. The allowlist above would drop `type` and
        // `sections`, deploying the view EMPTY (validation still passes because
        // `cards: []` is valid). Preserve the sections surface so the view
        // round-trips. Only a REAL HA sections view opts in — HAVDM-internal
        // view types (e.g. custom:grid-layout) stay stripped by the allowlist
        // (see yaml-service.spec: "removes HAVDM-specific view properties").
        // The per-card export pass (STRIP / translate / spacer-drop at every
        // depth) descends into each section's cards in exportDashboard below.
        if (view.type === 'sections') {
          cleanView.type = 'sections';
          const sourceSections: ViewSection[] = Array.isArray(view.sections) ? view.sections : [];
          cleanView.sections = sourceSections.map((section) => {
            const cleanSection: Record<string, unknown> = { ...section };
            if (Array.isArray(section.cards)) {
              cleanSection.cards = section.cards.map((card) => {
                const cleanCard: Record<string, unknown> = { ...card };
                Object.keys(cleanCard).forEach((key) => {
                  if (cleanCard[key] === undefined || cleanCard[key] === null) {
                    delete cleanCard[key];
                  }
                });
                return cleanCard;
              });
            }
            Object.keys(cleanSection).forEach((key) => {
              if (cleanSection[key] === undefined || cleanSection[key] === null) {
                delete cleanSection[key];
              }
            });
            return cleanSection;
          });
          // Sections views render from `sections`, not the top-level `cards`;
          // drop the (empty) placeholder array the allowlist created.
          delete cleanView.cards;
          // Carry the sections-view layout keys (undefined ones are pruned by
          // the null/undefined sweep below).
          cleanView.max_columns = view.max_columns;
          cleanView.dense_section_placement = view.dense_section_placement;
          cleanView.top_margin = view.top_margin;
        }

        // Remove undefined/null properties from view
        Object.keys(cleanView).forEach((key) => {
          if (cleanView[key] === undefined || cleanView[key] === null) {
            delete cleanView[key];
          }
        });

        return cleanView;
      }),
      background: config.background,
      theme: config.theme,
    };

    const exported = exportDashboard(sanitized as unknown as Record<string, unknown>, {
      warnings,
    }) as unknown as DashboardConfig;

    // B8 warn-only self-check: flag any HAVDM-only artefact that leaked through.
    warnings.push(...selfCheckHaConfig(exported));

    return { config: exported, warnings };
  }

  /**
   * Sanitize dashboard config for Home Assistant deployment.
   * Removes HAVDM-specific internal properties that HA doesn't recognize.
   */
  sanitizeForHA(config: DashboardConfig): DashboardConfig {
    return this.sanitizeForHAWithReport(config).config;
  }

  /**
   * Serialize dashboard config for Home Assistant deployment. Automatically
   * sanitizes HAVDM-internal properties and, when the boundary translated,
   * stripped, or substituted anything, prepends a plain-language comment
   * summary (slice B8) so a user reading the exported file sees what changed.
   */
  serializeForHA(config: DashboardConfig): string {
    const { config: sanitized, warnings } = this.sanitizeForHAWithReport(config);
    logger.debug('Sanitized config for HA', sanitized);
    const serialized = this.serializeDashboard(sanitized);

    const comment = summarizeExportWarnings(warnings).commentBlock;
    return comment ? `${comment}\n${serialized}` : serialized;
  }
}

export const yamlService = new YAMLService();
