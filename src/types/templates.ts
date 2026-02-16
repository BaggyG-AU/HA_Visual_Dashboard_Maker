export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: TemplateDifficulty;
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
