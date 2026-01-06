export interface DebouncedCommit<T> {
  schedule: (value: T) => void;
  cancel: () => void;
  flush: () => void;
  getPending: () => T | null;
}

export function createDebouncedCommit<T>(params: {
  delayMs: number;
  onCommit: (value: T) => void;
  onBeforeCommit?: (value: T) => void;
}): DebouncedCommit<T> {
  const { delayMs, onCommit, onBeforeCommit } = params;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: T | null = null;

  const run = () => {
    if (pending === null) return;
    const value = pending;
    pending = null;
    timer = null;
    onBeforeCommit?.(value);
    onCommit(value);
  };

  return {
    schedule: (value: T) => {
      pending = value;
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, delayMs);
    },
    cancel: () => {
      if (timer) clearTimeout(timer);
      timer = null;
      pending = null;
    },
    flush: () => {
      if (timer) clearTimeout(timer);
      run();
    },
    getPending: () => pending,
  };
}

