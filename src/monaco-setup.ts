/**
 * Monaco Editor Worker Setup
 *
 * This file configures Monaco Editor to use bundled workers instead of loading them from CDN.
 * This is required for Electron apps where file:// protocol doesn't support CDN loading.
 *
 * Import this file BEFORE any Monaco editor usage in your app.
 */

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import YamlWorker from 'monaco-yaml/yaml.worker?worker';

// Configure Monaco's worker loading
(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'yaml') {
      return new (YamlWorker as any)();
    }
    // Default editor worker for all other languages
    return new (EditorWorker as any)();
  },
};
