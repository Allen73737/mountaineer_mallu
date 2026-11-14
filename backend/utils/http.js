/**
 * Timeouts for calls to external services. A slow third party must never hold a request (or a worker's
 * connection pool) open indefinitely.
 */
const DEFAULT_TIMEOUT_MS = parseInt(process.env.EXTERNAL_TIMEOUT_MS || '8000', 10);

/** fetch() that aborts after `timeoutMs`. Rejects with a TimeoutError. */
export const fetchWithTimeout = (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) =>
    fetch(url, { ...options, signal: options.signal ?? AbortSignal.timeout(timeoutMs) });

/** Race any promise (SDK calls without a timeout option) against a deadline. */
export const withTimeout = (promise, timeoutMs = DEFAULT_TIMEOUT_MS, label = 'External call') => {
    let timer;
    const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
};
