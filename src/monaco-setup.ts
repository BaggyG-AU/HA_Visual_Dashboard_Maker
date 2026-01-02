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
