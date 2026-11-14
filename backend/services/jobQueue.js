import logger from '../utils/logger.js';

/**
 * In-process background job queue for slow side effects (email fan-out, bulk notifications).
 *
 * Request handlers enqueue work and answer immediately instead of holding the connection open while
 * dozens of emails go out. Jobs run with bounded concurrency so a 500-recipient campaign doesn't open
 * 500 sockets to the mail provider at once, and a failed job is retried with exponential backoff.
 *
 * Jobs live in memory: a restart drops anything still queued. Graceful shutdown waits for the queue to
 * drain (see drainJobs), which covers deploys; move to a Redis-backed queue (BullMQ) if jobs must
 * survive a crash.
 */
const CONCURRENCY = Math.max(1, parseInt(process.env.JOB_CONCURRENCY || '4', 10));

const pending = [];
let running = 0;
let idleWaiters = [];
const stats = { completed: 0, failed: 0 };

const settleIdle = () => {
    if (running === 0 && pending.length === 0) {
        idleWaiters.forEach(resolve => resolve());
        idleWaiters = [];
    }
};

const runNext = () => {
    while (running < CONCURRENCY && pending.length) {
        const job = pending.shift();
        running++;
        Promise.resolve()
            .then(() => job.fn())
            .then(() => { stats.completed++; })
            .catch(err => {
                if (job.attempt < job.retries) {
                    job.attempt++;
                    const delay = Math.min(1000 * 2 ** job.attempt, 30000);
                    logger.warn(`[Jobs] ${job.name} failed (${err.message}); retry ${job.attempt}/${job.retries} in ${delay}ms`);
                    // Not counted as idle while a retry is scheduled, and the timer keeps the process alive
                    running++;
                    setTimeout(() => { running--; pending.push(job); runNext(); }, delay);
                } else {
                    stats.failed++;
                    logger.error(`[Jobs] ${job.name} failed permanently: ${err.message}`);
                }
            })
            .finally(() => {
                running--;
                runNext();
                settleIdle();
            });
    }
};

/**
 * Queue a job. `fn` should throw (or reject) on failure to be retried.
 * @param {string} name   label for logs
 * @param {() => Promise<unknown>} fn
 * @param {{ retries?: number }} [options]
 */
export const enqueue = (name, fn, { retries = 2 } = {}) => {
    pending.push({ name, fn, retries, attempt: 0 });
    runNext();
};

/** Resolve once every queued job has finished, or after `timeoutMs`. */
export const drainJobs = (timeoutMs = 8000) => new Promise(resolve => {
    if (running === 0 && pending.length === 0) return resolve();
    idleWaiters.push(resolve);
    setTimeout(resolve, timeoutMs).unref();
});

export const jobStats = () => ({ queued: pending.length, running, ...stats });
