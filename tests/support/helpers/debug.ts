import type { TestInfo } from '@playwright/test';

type DebugAttachOptions = {
  contentType?: string;
  alsoConsole?: boolean;
};

const isDebugEnabled = (): boolean => {
  return process.env.PW_DEBUG === '1' || process.env.E2E_DEBUG === '1';
};

export const debugEnabled = isDebugEnabled;

export function debugLog(message: string, ...optionalParams: unknown[]): void {
  if (!isDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.log(message, ...optionalParams);
}

export async function attachDebug(
  testInfo: TestInfo,
  name: string,
  body: string | Buffer,
  options: DebugAttachOptions = {}
): Promise<void> {
  const contentType = options.contentType ?? 'text/plain';
  const shouldConsole = options.alsoConsole ?? isDebugEnabled();

  const safeName = name.includes('.') ? name : `${name}.txt`;
  await testInfo.attach(safeName, { body, contentType });

  if (shouldConsole) {
    // eslint-disable-next-line no-console
    console.log(`[debug] attached: ${safeName}`);
  }
}

export async function attachDebugJson(
  testInfo: TestInfo,
  name: string,
  data: unknown,
  options: Omit<DebugAttachOptions, 'contentType'> = {}
): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const safeName = name.endsWith('.json') ? name : `${name}.json`;
  await attachDebug(testInfo, safeName, json, { ...options, contentType: 'application/json' });
}
