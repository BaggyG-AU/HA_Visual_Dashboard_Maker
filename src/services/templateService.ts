/**
 * Dashboard Template Service
 *
 * Manages dashboard templates for quick-start and common use cases.
 * Provides template discovery, loading, and metadata management.
 */
import { logger } from './logger';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  file: string;
  preview?: string;
  features: string[];
  requiredEntities: string[];
  tags: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface TemplateMetadata {
  templates: DashboardTemplate[];
  categories: TemplateCategory[];
}

class TemplateService {
  private metadata: TemplateMetadata | null = null;

  /**
   * Load template metadata
   */
  async loadMetadata(): Promise<TemplateMetadata> {
    if (this.metadata) {
      return this.metadata;
    }

    try {
      // Use Electron IPC to read template metadata file
      const metadataPath = await window.electronAPI.getTemplatePath('templates.json');
      const content = await window.electronAPI.readFile(metadataPath);

      this.metadata = JSON.parse(content) as TemplateMetadata;
      return this.metadata;
    } catch (error) {
      logger.error('Failed to load template metadata', error);
      // Return empty metadata if file doesn't exist
      return {
        templates: [],
        categories: [],
      };
    }
  }

  /**
   * Get all available templates
   */
  async getTemplates(): Promise<DashboardTemplate[]> {
    const metadata = await this.loadMetadata();
    return metadata.templates;
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(categoryId: string): Promise<DashboardTemplate[]> {
    const templates = await this.getTemplates();
    return templates.filter(t => t.category === categoryId);
  }

  /**
   * Get templates by difficulty
   */
  async getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<DashboardTemplate[]> {
    const templates = await this.getTemplates();
    return templates.filter(t => t.difficulty === difficulty);
  }

  /**
   * Search templates by query
   */
  async searchTemplates(query: string): Promise<DashboardTemplate[]> {
    const templates = await this.getTemplates();
    const lowerQuery = query.toLowerCase();

    return templates.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      t.features.some(feature => feature.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<TemplateCategory[]> {
    const metadata = await this.loadMetadata();
    return metadata.categories;
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(id: string): Promise<DashboardTemplate | null> {
    const templates = await this.getTemplates();
    return templates.find(t => t.id === id) || null;
  }

  /**
   * Load template content (YAML)
   */
  async loadTemplate(id: string): Promise<string> {
    const template = await this.getTemplate(id);
    if (!template) {
      throw new Error(`Template '${id}' not found`);
    }

    try {
      const templatePath = await window.electronAPI.getTemplatePath(template.file);
      const content = await window.electronAPI.readFile(templatePath);
      return content;
    } catch (error) {
      throw new Error(`Failed to load template '${id}': ${(error as Error).message}`);
    }
  }

  /**
   * Check if user has required entities for a template
   */
  async checkRequiredEntities(template: DashboardTemplate, userEntities: string[]): Promise<{
    hasAll: boolean;
    missing: string[];
    present: string[];
  }> {
    const userEntitySet = new Set(userEntities.map(e => e.toLowerCase()));
    const missing: string[] = [];
    const present: string[] = [];

    template.requiredEntities.forEach(requiredEntity => {
      const entityLower = requiredEntity.toLowerCase();
      if (userEntitySet.has(entityLower)) {
        present.push(requiredEntity);
      } else {
        missing.push(requiredEntity);
      }
    });

    return {
      hasAll: missing.length === 0,
      missing,
      present,
    };
  }

  /**
   * Get template recommendations based on user's entities
   */
  async getRecommendations(userEntities: string[]): Promise<DashboardTemplate[]> {
    const templates = await this.getTemplates();
    const recommendations: Array<{ template: DashboardTemplate; score: number }> = [];

    for (const template of templates) {
      const check = await this.checkRequiredEntities(template, userEntities);
      const score = check.present.length / template.requiredEntities.length;

      // Only recommend if user has at least 50% of required entities
      if (score >= 0.5) {
        recommendations.push({ template, score });
      }
    }

    // Sort by score (descending)
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.map(r => r.template);
  }

  /**
   * Clear cached metadata
   */
  clearCache(): void {
    this.metadata = null;
  }
}

// Export singleton instance
export const templateService = new TemplateService();
