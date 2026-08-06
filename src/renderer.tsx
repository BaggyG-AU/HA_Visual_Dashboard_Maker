/**
 * Renderer process entry point
 * This file sets up the React application
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CapabilityProfileProvider } from './contexts/CapabilityProfileContext';
import './index.css';

// Import Material Design Icons locally (bundled, not from CDN)
import '@mdi/font/css/materialdesignicons.min.css';

// CRITICAL: Configure Monaco Editor workers BEFORE any Monaco usage
// This must be imported before App to ensure workers are configured
import './monaco-setup';

// Get the root element
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

// Create root and render the app
const root = createRoot(container);
// ⚠ The capability provider wraps App rather than living INSIDE it, because App
// is itself a consumer: it owns `captureCapabilityProfile` and has to refresh
// the shared profile once a capture lands (EXPORT-04 defect 1). A provider a
// component renders cannot be read by that same component.
root.render(
  <React.StrictMode>
    <CapabilityProfileProvider>
      <App />
    </CapabilityProfileProvider>
  </React.StrictMode>,
);
