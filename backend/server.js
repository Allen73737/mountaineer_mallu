import cluster from 'cluster';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cluster is enabled in production or if explicitly requested via CLUSTER_ENABLED=true
const isClusterEnabled = process.env.CLUSTER_ENABLED === 'true' || 
    (process.env.NODE_ENV === 'production' && process.env.CLUSTER_ENABLED !== 'false' && os.cpus().length > 1);

// Limit workers to WEB_CONCURRENCY or cap at 4 to prevent MongoDB pool exhaustion and high RAM usage
const maxWorkers = parseInt(process.env.WEB_CONCURRENCY || '', 10) || Math.min(os.cpus().length, 4);

if (isClusterEnabled && cluster.isPrimary) {
    console.log(`🏔️ [Cluster Supervisor] Primary ${process.pid} initializing in [${process.env.NODE_ENV || 'development'}] mode`);
    console.log(`🏔️ [Cluster Supervisor] Spawning ${maxWorkers} enterprise worker instances...`);

    const restartTimestamps = [];
    const MAX_CRASH_RESTARTS_IN_WINDOW = 5;
    const CRASH_WINDOW_MS = 30000; // 30 seconds
    let isShuttingDown = false;

    // Fork initial workers
    for (let i = 0; i < maxWorkers; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        if (isShuttingDown) return;

        const now = Date.now();
        restartTimestamps.push(now);

        // Keep only restarts within our sliding time window
        while (restartTimestamps.length > 0 && restartTimestamps[0] < now - CRASH_WINDOW_MS) {
            restartTimestamps.shift();
        }

        console.warn(`⚠️ [Cluster] Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}).`);

        if (restartTimestamps.length > MAX_CRASH_RESTARTS_IN_WINDOW) {
            console.error(`❌ [FATAL: Cluster Supervisor] Worker crashed ${restartTimestamps.length} times in ${CRASH_WINDOW_MS / 1000}s!`);
            console.error('Halting primary process to prevent CPU spin. Inspect database/port binding configurations.');
            process.exit(1);
        }

        // Apply progressive backoff before respawning
        const backoffMs = Math.min(1000 * Math.pow(1.5, restartTimestamps.length - 1), 5000);
        console.log(`🔄 [Cluster] Respawning worker after ${backoffMs}ms backoff...`);
        setTimeout(() => {
            if (!isShuttingDown) {
                cluster.fork();
            }
        }, backoffMs);
    });

    // Graceful cluster shutdown
    const handleShutdown = (sig) => {
        isShuttingDown = true;
        console.log(`\n🛑 [Cluster Supervisor] Received ${sig}. Terminating all workers cleanly...`);
        for (const id in cluster.workers) {
            cluster.workers[id]?.process.kill(sig);
        }
        setTimeout(() => {
            console.error('⚠️ [Cluster Supervisor] Forcing supervisor exit after timeout.');
            process.exit(0);
        }, 10000).unref();
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

} else {
    // Single-process mode or Worker process
    import('./index.js').then(({ default: app, startServer }) => {
        process.on('uncaughtException', (err) => {
            console.error(`[Process ${process.pid}] Uncaught Exception:`, err);
            setTimeout(() => process.exit(1), 1000);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error(`[Process ${process.pid}] Unhandled Rejection at:`, promise, 'reason:', reason);
            setTimeout(() => process.exit(1), 1000);
        });

        startServer();
    }).catch(err => {
        console.error(`[Process ${process.pid}] Failed to start:`, err);
        process.exit(1);
    });
}
