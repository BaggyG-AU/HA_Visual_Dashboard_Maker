import * as yaml from 'js-yaml';
import { DashboardConfig, ViewSection, YAMLParseResult } from '../types/dashboard';
import { logger } from './logger';
import { exportDashboard, importDashboard } from './yamlConversionService';
import {
  isHavdmScaffoldView,
  isLayoutCardViewType,
  isHavdmInternalViewKey,
} from './haExportContract';
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

      // ⭐ WS3 slice F: pass-through on the IMPORT side too.
      //
      // This was an allowlist of `title` / `views` / `background` / `theme`, the
      // mirror image of the export-side one — so a dashboard-level key HAVDM did
      // not model was destroyed at LOAD time, before the user ever saw it.
      // ⚠ That silently defeated half of slice 4.7b: the export boundary was
      // taught to carry a dashboard-level `strategy`, but this dropped it first,
      // so it could never survive opening the file. 4.7b's unit test missed it
      // by constructing the config object directly rather than parsing YAML.
      const dashboardConfig: DashboardConfig = {
        ...(imported as unknown as DashboardConfig),
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

    // ⭐ WS3 slice F: the DASHBOARD level is pass-through for the same reason the
    // view level is. It used to be an allowlist of `title` / `views` /
    // `background` / `theme`, which is why a dashboard-level `strategy:` was
    // dropped wholesale (slice 4.7b) — and why any other top-level key Home
    // Assistant supports would have been too. `views` is replaced below.
    const sanitizedTop: Record<string, unknown> = {};
    Object.keys(config).forEach((key) => {
      if (isHavdmInternalViewKey(key)) return;
      sanitizedTop[key] = (config as unknown as Record<string, unknown>)[key];
    });

    const sanitized: DashboardConfig = {
      ...(sanitizedTop as unknown as DashboardConfig),
      title: config.title,
      views: config.views.map((view) => {
        // ⭐ WS3 slice F: the view boundary is SAFE-BY-DEFAULT, mirroring the card
        // path (`exportCard` -> `stripInternalKeys`). Start from the user's own
        // view and remove only HAVDM's bookkeeping; every other key — including
        // Home Assistant view keys HAVDM does not model, like `header` — passes
        // through untouched.
        //
        // This replaced an ALLOWLIST that rebuilt the view from a fixed set of
        // fields. That allowlist, not any single missing key, is what caused
        // three separate silent data-loss bugs: `subview`/`back_path` (4.6a),
        // `layout`/`layout_type` (4.7a) and `strategy` (4.7b, which blanked the
        // whole view). Each was found by accident. The compile-time guard
        // `_AllViewKeysClassified` in `haExportContract.ts` is what stops a
        // fourth from appearing silently.
        const cleanView: any = {};
        Object.keys(view).forEach((key) => {
          if (isHavdmInternalViewKey(key)) return;
          cleanView[key] = (view as unknown as Record<string, unknown>)[key];
        });

        Object.assign(cleanView, {
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
        });

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
        // itself never reaches HA — the internal-key filter above drops it.
        //
        // ⭐ WS3 slice F inverted this block. Under the allowlist it ADDED
        // `type` / `layout` / `layout_type` back; under pass-through they are
        // already present, so the job is to REMOVE the ones that must not
        // deploy. The rules themselves are unchanged.
        const viewType = typeof view.type === 'string' ? view.type : undefined;
        if (!viewType || isHavdmScaffoldView(view)) {
          // HAVDM's internal canvas scaffold: drop the type and its paired grid
          // so the view deploys as its real HA type (masonry).
          delete cleanView.type;
          delete cleanView.layout;
          delete cleanView.layout_type;
        } else if (!isLayoutCardViewType(viewType)) {
          // A real HA view type. `layout` / `layout_type` only mean anything to
          // layout-card; HA's own view types ignore them, and HAVDM keeps a
          // user's layout-card config around after a type change so they can
          // switch back (`setViewType`) — so gate on the TYPE, not on the key's
          // presence, and keep the config in HAVDM while declining to deploy it.
          delete cleanView.layout;
          delete cleanView.layout_type;
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
          // drop the (empty) placeholder array.
          delete cleanView.cards;
          // NOTE (slice F): `max_columns` / `dense_section_placement` /
          // `top_margin` used to be re-added here because the allowlist had
          // dropped them. Pass-through carries them already.
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

    // Prune top-level undefined/null so an absent `background`/`theme` does not
    // deploy as an empty key (the allowlist relied on the same sweep).
    Object.keys(sanitized).forEach((key) => {
      const value = (sanitized as unknown as Record<string, unknown>)[key];
      if (value === undefined || value === null) {
        delete (sanitized as unknown as Record<string, unknown>)[key];
      }
    });

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
