import * as yaml from 'js-yaml';
import { DashboardConfig, ViewSection, YAMLParseResult } from '../types/dashboard';
import { logger } from './logger';
import { exportDashboard, importDashboard } from './yamlConversionService';
import { isHavdmScaffoldView, isLayoutCardViewType } from './haExportContract';
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
          // Subview navigation model (slice 4.6a). Undefined ones are pruned by
          // the null/undefined sweep below.
          subview: view.subview,
          back_path: view.back_path,
          // ⚠ Slice 4.7b: a view STRATEGY must survive. Home Assistant generates
          // a strategy view's cards at render time, so the view legitimately has
          // no `cards` of its own — and this allowlist previously dropped
          // `strategy` while forcing `cards: []` below, deploying the view as
          // `{title, path, cards: []}`. The user's entire generated view came
          // back BLANK. Import always kept the strategy in memory (a plain
          // spread in `yamlConversionService.importDashboard`), so HAVDM held
          // the config and then wrote nothing over it. Same class as the 4.7a
          // custom:grid-layout collision; larger blast radius.
          strategy: view.strategy,
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
              // A strategy view has no cards of its own — HA generates them.
              // Emitting `cards: []` there is not merely noise, it is the
              // destructive half of the 4.7b bug: it overwrites the generated
              // view with an empty one. Undefined is pruned by the sweep below.
            }) || (view.strategy ? undefined : []),
        };

        // Preserve the view's REAL Home Assistant type (masonry, panel, sidebar,
        // sections, a layout-card custom:*-layout). HAVDM stamps its internal
        // canvas-grid scaffold on every view it generates; that, and its paired
        // `layout`, is HAVDM-internal and must be stripped so the view deploys
        // as its real HA type.
        //
        // ⚠ Slice 4.7a: the scaffold is identified by `isHavdmScaffoldView`, NOT
        // by its `custom:grid-layout` type string. That string is ALSO a real
        // layout-card view type, so keying off it destroyed a user's own
        // layout-card grid config on every deploy. The marker (with an exact
        // legacy-signature fallback) tells the two apart. `_havdm_scaffold`
        // itself never reaches HA — the view allowlist above does not copy it.
        const viewType = typeof view.type === 'string' ? view.type : undefined;
        if (viewType && !isHavdmScaffoldView(view)) {
          cleanView.type = viewType;
          // `layout` / `layout_type` only mean anything to layout-card. HA's own
          // view types ignore them, and HAVDM keeps a user's layout-card config
          // around after a type change so they can switch back (setViewType) —
          // so gate on the TYPE, not on the key's presence.
          if (isLayoutCardViewType(viewType)) {
            if (view.layout !== undefined) {
              cleanView.layout = view.layout;
            }
            if (view.layout_type !== undefined) {
              cleanView.layout_type = view.layout_type;
            }
          }
        }

        // HA "sections" view: its cards live under `sections[].cards`, not the
        // top-level `cards` (which stays empty). The rule above already
        // preserved `type: 'sections'`; here we additionally carry the sections
        // payload. The per-card export pass (STRIP / translate / spacer-drop at
        // every depth) descends into each section's cards in exportDashboard.
        if (viewType === 'sections') {
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

    // Slice 4.7b: a DASHBOARD-level strategy generates the entire dashboard.
    // The allowlist above reduces the config to title/views/background/theme, so
    // without this the whole thing was dropped on deploy. Only set the key when
    // one is present, so a normal dashboard gains no empty `strategy:`.
    if (config.strategy !== undefined) {
      (sanitized as DashboardConfig).strategy = config.strategy;
    }

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
