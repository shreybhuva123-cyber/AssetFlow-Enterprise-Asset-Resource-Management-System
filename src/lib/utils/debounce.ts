export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number,
): T & { cancel: () => void; flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    lastArgs = args;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, delayMs);
  } as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      if (lastArgs !== null) {
        fn(...lastArgs);
      }
    }
  };

  return debounced;
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limitMs: number,
): T & { cancel: () => void } {
  let lastCallTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = limitMs - (now - lastCallTime);

    if (remaining <= 0) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      lastCallTime = now;
      fn.apply(this, args);
    } else if (timer === null) {
      timer = setTimeout(() => {
        lastCallTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return throttled;
}
