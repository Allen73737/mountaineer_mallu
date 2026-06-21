import cluster from 'cluster';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`[Cluster] Primary ${process.pid} is running`);
    console.log(`[Cluster] Spawning ${numCPUs} workers...`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.warn(`[Cluster] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`);
        // Replace the dead worker instantly
        cluster.fork();
    });
} else {
    // Workers can share any TCP connection. In this case, it is an HTTP server.
    // Import the express app setup logic
    import('./index.js').then(({ default: app, startServer }) => {
        
        // Handle unexpected errors gracefully within the worker
        process.on('uncaughtException', (err) => {
            console.error(`[Worker ${process.pid}] Uncaught Exception:`, err);
            import('fs').then(fs => fs.appendFileSync('crash.log', `Uncaught Exception: ${err.stack || err}\n`));
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error(`[Worker ${process.pid}] Unhandled Rejection at:`, promise, 'reason:', reason);
            import('fs').then(fs => fs.appendFileSync('crash.log', `Unhandled Rejection: ${reason.stack || reason}\n`));
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        });

        startServer();
    }).catch(err => {
        console.error(`[Worker ${process.pid}] Failed to start:`, err);
        process.exit(1);
    });
}
