import { GradientPreset } from '../types/gradient';

export const gradientPresets: GradientPreset[] = [
  {
    id: 'material-sunset',
    name: 'Material Sunset',
    css: 'linear-gradient(120deg, #ff5858 0%, #f09819 100%)',
    category: 'Material',
    description: 'Warm material orange/pink',
  },
  {
    id: 'material-sky',
    name: 'Material Sky',
    css: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    category: 'Material',
    description: 'Cool blue gradient',
  },
  {
    id: 'nature-forest',
    name: 'Forest',
    css: 'linear-gradient(135deg, #5a3f37 0%, #2c7744 100%)',
    category: 'Nature',
  },
  {
    id: 'nature-ocean',
    name: 'Ocean',
    css: 'linear-gradient(120deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    category: 'Nature',
  },
  {
    id: 'tech-cyber',
    name: 'Cyberpunk',
    css: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    category: 'Tech',
  },
  {
    id: 'tech-neon',
    name: 'Neon',
    css: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    category: 'Tech',
  },
  {
    id: 'mono-steel',
    name: 'Steel',
    css: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    category: 'Monochrome',
  },
  {
    id: 'mono-smoke',
    name: 'Smoked',
    css: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
    category: 'Monochrome',
  },
];
