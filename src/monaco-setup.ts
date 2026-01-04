/**
 * Monaco Editor Worker Setup
 *
 * This file configures Monaco Editor to use bundled workers instead of loading them from CDN.
 * This is required for Electron apps where file:// protocol doesn't support CDN loading.
 *
 * Import this file BEFORE any Monaco editor usage in your app.
 */

// eslint-disable-next-line import/no-unresolved
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// eslint-disable-next-line import/no-unresolved
import YamlWorker from 'monaco-yaml/yaml.worker?worker';
import dashboardSchema from './schemas/ha-dashboard-schema.json';

type WorkerConstructor = new () => Worker;
const editorWorkerCtor = EditorWorker as unknown as WorkerConstructor;
const yamlWorkerCtor = YamlWorker as unknown as WorkerConstructor;
const monacoGlobal = self as unknown as {
  MonacoEnvironment?: {
    getWorker: (moduleId: string, label: string) => Worker;
  };
};

// Configure Monaco's worker loading
monacoGlobal.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'yaml') {
      return new yamlWorkerCtor();
    }
    // Default editor worker for all other languages
    return new editorWorkerCtor();
  },
};

/**
 * Configure YAML language server with Home Assistant dashboard schema
 * This enables autocomplete and validation for HA dashboard YAML files
 */
export async function configureYamlSchema() {
  // Dynamically import setDiagnosticsOptions from monaco-yaml
  const { setDiagnosticsOptions } = await import('monaco-yaml');

  setDiagnosticsOptions({
    enableSchemaRequest: true,
    hover: true,
    completion: true,
    validate: true,
    format: true,
    schemas: [
      {
        // Match files that look like dashboard YAML
        uri: 'https://home-assistant.io/schemas/dashboard.json',
        fileMatch: ['*'],
        schema: dashboardSchema,
      },
    ],
  });
}
