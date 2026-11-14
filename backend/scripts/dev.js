// Development supervisor for the API.
// `node --watch` restarts on file changes but leaves the API down after a crash until you save a file.
// This runs server.js, restarts it when it exits for any reason (with a short backoff), and restarts it
// when a backend source file changes.
import { spawn } from 'child_process';
import { watch } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IGNORE = /(^|[\\/])(node_modules|logs|backups|tests|\.git)([\\/]|$)/;

let child = null;
let restarting = false;
let quickExits = 0;
let startedAt = 0;

const start = () => {
    startedAt = Date.now();
    child = spawn(process.execPath, ['--import', './tracing.js', 'server.js'], { cwd: root, stdio: 'inherit', env: process.env });
    child.on('exit', (code, signal) => {
        child = null;
        if (restarting) return;
        // Crashing again within 10 s means something is really broken: back off up to 15 s between tries
        quickExits = Date.now() - startedAt < 10_000 ? quickExits + 1 : 0;
        const delay = Math.min(1000 * 2 ** quickExits, 15_000);
        console.warn(`\n⚠️  [dev] API exited (${signal || `code ${code}`}). Restarting in ${delay / 1000}s...\n`);
        setTimeout(start, delay);
    });
};

const restart = () => {
    if (!child) return start();
    restarting = true;
    child.once('exit', () => { restarting = false; quickExits = 0; start(); });
    child.kill();
};

let debounce = null;
watch(root, { recursive: true }, (_event, file) => {
    if (!file || IGNORE.test(file) || !/\.(js|json|env)$|^\.env/.test(path.basename(file))) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
        console.log(`\n🔁 [dev] ${file} changed — restarting API...\n`);
        restart();
    }, 300);
});

const stop = () => {
    restarting = true;
    if (child) child.kill();
    process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

start();
