// Tests for the performance plumbing that needs no database: the background job queue, the
// real-user vitals endpoint and request timing headers.
//   npm test
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });
process.env.NODE_ENV = 'test';
delete process.env.RESEND_API_KEY;
delete process.env.REDIS_URL;
delete process.env.SENTRY_DSN;

const ORIGIN = (process.env.CLIENT_URL || 'http://localhost:5174').split(',')[0];
const { enqueue, drainJobs, jobStats } = await import('../services/jobQueue.js');
const { default: request } = await import('supertest');
const { default: app } = await import('../index.js');

after(() => {
    // index.js opens a socket server and timers; nothing else should keep the test run alive
    setTimeout(() => process.exit(process.exitCode ?? 0), 200).unref();
});

test('background jobs run with bounded concurrency and drain before shutdown', async () => {
    let running = 0, peak = 0, done = 0;
    for (let i = 0; i < 12; i++) {
        enqueue('test', async () => {
            running++; peak = Math.max(peak, running);
            await new Promise(r => setTimeout(r, 20));
            running--; done++;
        });
    }
    await drainJobs(5000);
    assert.equal(done, 12);
    assert.ok(peak <= 4, `at most 4 jobs at once by default, saw ${peak}`);
    assert.equal(jobStats().queued, 0);
});

test('a failing job is retried before it is given up', async () => {
    let attempts = 0;
    enqueue('flaky', async () => { if (++attempts < 2) throw new Error('transient'); }, { retries: 2 });
    await drainJobs(10000);
    assert.equal(attempts, 2);
});

test('the vitals endpoint accepts beacons and keeps the summary admin-only', async () => {
    const beacon = JSON.stringify([{ name: 'LCP', value: 2100, page: '/events', conn: '4g' }, { name: 'BOGUS', value: 1 }]);
    await request(app).post('/api/vitals').set('Origin', ORIGIN).set('Content-Type', 'text/plain').send(beacon).expect(204);
    await request(app).post('/api/vitals').set('Origin', ORIGIN).set('Content-Type', 'text/plain').send('not json').expect(400);
    await request(app).get('/api/vitals').expect(401);
});

test('responses carry a Server-Timing header', async () => {
    const res = await request(app).get('/livez').expect(200);
    assert.match(res.headers['server-timing'] || '', /^app;dur=\d+(\.\d+)?$/);
});

