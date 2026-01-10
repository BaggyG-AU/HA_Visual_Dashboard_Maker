import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const statMtimeMs = (filePath: string): number => {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
};

const getLatestMtimeMs = (rootPath: string): number => {
  try {
    const stat = fs.statSync(rootPath);
    if (stat.isFile()) return stat.mtimeMs;
    if (!stat.isDirectory()) return 0;
  } catch {
    return 0;
  }

  let latest = 0;
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      latest = Math.max(latest, getLatestMtimeMs(full));
      continue;
    }
    if (entry.isFile()) {
      latest = Math.max(latest, statMtimeMs(full));
    }
  }
  return latest;
};

const shouldRebuildRenderer = (): boolean => {
  const viteMain = path.join(process.cwd(), '.vite/build/main.js');
  const viteRendererIndex = path.join(process.cwd(), '.vite/renderer/main_window/index.html');

  const outputMtime = Math.min(statMtimeMs(viteMain), statMtimeMs(viteRendererIndex));
  if (!outputMtime) return true;

  const inputs = [
    path.join(process.cwd(), 'src'),
    path.join(process.cwd(), 'forge.config.ts'),
    path.join(process.cwd(), 'vite.main.config.ts'),
    path.join(process.cwd(), 'vite.preload.config.ts'),
    path.join(process.cwd(), 'vite.renderer.config.ts'),
    path.join(process.cwd(), 'package.json'),
    path.join(process.cwd(), 'package-lock.json'),
  ];

  const latestInputMtime = Math.max(...inputs.map(getLatestMtimeMs));
  return latestInputMtime > outputMtime;
};

async function globalSetup(): Promise<void> {
  if (!shouldRebuildRenderer()) return;

  // Playwright E2E/integration runs the packaged renderer (not the Vite dev server) while in test mode.
  // Ensure `.vite/**` build outputs are current so UI changes are reflected in the runtime DOM.
  // Use Electron Forge as the single source of truth for producing these artifacts.
  // eslint-disable-next-line no-console
  console.log('[playwright globalSetup] Rebuilding Electron renderer via `npm run package`...');

  execSync('npm run package', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });
}

export default globalSetup;

