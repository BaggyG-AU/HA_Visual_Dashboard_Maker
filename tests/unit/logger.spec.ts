import { describe, it, expect, vi } from 'vitest';
import { logger } from '../../src/services/logger';

describe('logger', () => {
  it('honors logging levels', () => {
    logger.setLevel('error');
    expect(logger.getLevel()).toBe('error');
    logger.setLevel('debug');
    expect(logger.getLevel()).toBe('debug');
  });

  it('redacts tokens in strings', () => {
    logger.setLevel('trace');
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    logger.trace('Bearer abcdef1234567890');
    expect(spy).toHaveBeenCalled();
    const call = spy.mock.calls[0][0] as string;
    expect(call).not.toContain('abcdef1234567890');
    spy.mockRestore();
  });
});
