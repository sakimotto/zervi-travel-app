const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) console.info('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  }
};
