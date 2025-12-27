/**
 * Renderer process entry point
 * This file sets up the React application
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Import Material Design Icons locally (bundled, not from CDN)
import '@mdi/font/css/materialdesignicons.min.css';

// Get the root element
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

// Create root and render the app
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('👋 HA Visual Dashboard Maker is running');
