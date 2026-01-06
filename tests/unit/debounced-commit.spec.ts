import { describe, it, expect, vi, afterEach } from 'vitest';
import { createDebouncedCommit } from '../../src/utils/debouncedCommit';

describe('createDebouncedCommit', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires exactly once after idle with the latest scheduled value', () => {
    vi.useFakeTimers();
    const onCommit = vi.fn();

    const debounced = createDebouncedCommit<string>({
      delayMs: 500,
      onCommit,
    });

    debounced.schedule('a');
    debounced.schedule('ab');
    debounced.schedule('abc');

    vi.advanceTimersByTime(499);
    expect(onCommit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('abc');
  });
});

