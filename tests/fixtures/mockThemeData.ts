/**
 * Mock Theme Data for Testing
 * Simulates Home Assistant theme responses
 */

export const mockThemes = {
  default_theme: 'default',
  default_dark_theme: null,
  theme: 'default',
  darkMode: true,
  themes: {
    default: {
      'primary-color': '#03a9f4',
      'accent-color': '#ff9800',
      'primary-text-color': '#ffffff',
      'text-primary-color': '#ffffff',
      'secondary-text-color': 'rgba(255, 255, 255, 0.7)',
      'primary-background-color': '#111111',
      'card-background-color': '#1c1c1c',
    },
    noctis: {
      'primary-color': '#5294E2',
      'accent-color': '#E45E65',
      'primary-text-color': '#FFFFFF',
      'text-primary-color': '#FFFFFF',
      'secondary-text-color': 'rgba(255, 255, 255, 0.7)',
      'primary-background-color': '#252932',
      'card-background-color': '#263137',
      modes: {
        dark: {
          'primary-background-color': '#252932',
          'card-background-color': '#263137',
        },
        light: {
          'primary-background-color': '#f9f9f9',
          'card-background-color': '#ffffff',
        },
      },
    },
    mushroom: {
      'primary-color': '#2196f3',
      'accent-color': '#ff5722',
      'primary-text-color': '#ffffff',
      'text-primary-color': '#ffffff',
      'secondary-text-color': 'rgba(255, 255, 255, 0.7)',
      'primary-background-color': '#1a1a1a',
      'card-background-color': 'rgba(255, 255, 255, 0.1)',
    },
    'mushroom-shadow': {
      'primary-color': '#2196f3',
      'accent-color': '#ff5722',
      'primary-text-color': '#ffffff',
      'text-primary-color': '#ffffff',
      'secondary-text-color': 'rgba(255, 255, 255, 0.7)',
      'primary-background-color': '#1a1a1a',
      'card-background-color': 'rgba(255, 255, 255, 0.05)',
    },
  },
};

export const mockThemesUpdatedEvent = {
  event_type: 'themes_updated',
  data: mockThemes,
};

export const mockWebSocketResponse = {
  id: 1,
  type: 'result',
  success: true,
  result: mockThemes,
};
