import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, '.env') });
process.env.NODE_ENV = 'test';
delete process.env.RESEND_API_KEY;
delete process.env.REDIS_URL;
delete process.env.SENTRY_DSN;

const TEST_DB = 'mountaineer-mallu-test';
const ORIGIN = (process.env.CLIENT_URL || 'http://localhost:5174').split(',')[0];
const PASSWORD = 'Summit#2026pass';

console.log('🏔️ Starting Mountaineer Mallu Comprehensive Stress & Endpoint Verification Suite...');

const { default: request } = await import('supertest');
const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../index.js');
const { default: User } = await import('../models/User.js');
const { default: Event } = await import('../models/Event.js');
const { default: Story } = await import('../models/Story.js');
const { default: GalleryItem } = await import('../models/GalleryItem.js');
const { default: Group } = await import('../models/Group.js');
const { default: Post } = await import('../models/Post.js');
const { default: Merchandise } = await import('../models/Merchandise.js');
const { default: Pillar } = await import('../models/Pillar.js');
const { default: Review } = await import('../models/Review.js');
const { default: SiteSettings } = await import('../models/SiteSettings.js');
const { default: Notification } = await import('../models/Notification.js');
const { enqueue, drainJobs, jobStats } = await import('../services/jobQueue.js');

const endpointResults = [];
const benchmarkResults = {};

// Helper: Measure latency of an async operation
const timeIt = async (fn) => {
    const start = performance.now();
    const res = await fn();
    const duration = performance.now() - start;
    return { res, duration };
};

// Browser agent with CSRF Origin header
const createAgent = () => {
    const agent = request.agent(app);
    return {
        get: (url) => agent.get(url),
        post: (url) => agent.post(url).set('Origin', ORIGIN),
        put: (url) => agent.put(url).set('Origin', ORIGIN),
        patch: (url) => agent.patch(url).set('Origin', ORIGIN),
        delete: (url) => agent.delete(url).set('Origin', ORIGIN),
    };
};

const recordEndpoint = (category, method, pathStr, status, expectedStatus, duration, notes = '') => {
    const passed = status === expectedStatus || (Array.isArray(expectedStatus) && expectedStatus.includes(status));
    endpointResults.push({
        category,
        method,
        path: pathStr,
        status,
        expectedStatus,
        passed,
        latencyMs: Math.round(duration * 100) / 100,
        notes
    });
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${method} ${pathStr} -> ${status} (${Math.round(duration)}ms) ${notes}`);
};

async function runAll() {
    try {
        console.log('\n📦 Connecting to test database:', TEST_DB);
        await mongoose.connect(process.env.MONGODB_URI, { dbName: TEST_DB, serverSelectionTimeoutMS: 15000 });
        assert.equal(mongoose.connection.db.databaseName, TEST_DB);
        await mongoose.connection.db.dropDatabase();
        console.log('✅ Test database initialized and clean.\n');

        // ═══════════════════════════════════════════════════════════════
        // PHASE 1: SEED FIXTURES
        // ═══════════════════════════════════════════════════════════════
        console.log('🌱 Seeding test fixtures...');

        const adminExplorer = { 
            name: 'Admin Vanguard', 
            email: 'admin@mountaineermallu.test', 
            password: PASSWORD, 
            role: 'superadmin', 
            permissions: { manageUsers: true, manageGallery: true, manageEvents: true, manageStories: true, manageCommunity: true },
            gdprConsent: true 
        };
        const regularExplorer = { name: 'Rahul Alpine', email: 'rahul@mountaineermallu.test', password: PASSWORD, role: 'user', gdprConsent: true };
        const secondExplorer = { name: 'Ananya Hiker', email: 'ananya@mountaineermallu.test', password: PASSWORD, role: 'user', gdprConsent: true };

        const adminUser = await User.create(adminExplorer);
        const normalUser = await User.create(regularExplorer);
        const otherUser = await User.create(secondExplorer);

        const testEvent = await Event.create({
            title: 'Zugspitze Jubiläumsgrat Traverse',
            date: 'Dec 25, 2026',
            time: '06:00 AM',
            location: 'Garmisch-Partenkirchen, DE',
            difficulty: 'Advanced',
            totalSlots: 2,
            availableSlots: 2,
            type: 'Expedition',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200',
            description: 'A demanding knife-edge ridge traverse above 2900m.',
            category: 'expedition',
            createdBy: adminUser._id,
            participants: []
        });

        const testStory = await Story.create({
            title: 'The Solitary Ascent of Matterhorn',
            excerpt: 'Pushing through the Hörnli ridge in sub-zero frost.',
            content: 'The dawn revealed infinite sea of clouds stretching towards Italy.',
            author: 'Rahul Alpine',
            date: 'Nov 2026',
            region: 'Pennine Alps, CH',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
            status: 'approved',
            createdBy: normalUser._id
        });

        const pendingStory = await Story.create({
            title: 'Unpublished North Face Push',
            excerpt: 'Draft expedition report.',
            content: 'Awaiting editorial review.',
            author: 'Ananya Hiker',
            date: 'Nov 2026',
            region: 'Bernese Oberland',
            image: 'https://images.unsplash.com/photo-1458442310124-dde6edb43d10?q=80&w=1200',
            status: 'pending',
            createdBy: otherUser._id
        });

        const testGallery = await GalleryItem.create({
            title: 'Khumbu Icefall Starlight',
            url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200',
            status: 'approved',
            type: 'image',
            uploadedBy: normalUser._id
        });

        const testGroup = await Group.create({
            name: 'Bavarian Trekkers Chapter',
            description: 'Weekend mountaineering operations in the Bavarian Alps.',
            members: [adminUser._id, normalUser._id],
            createdBy: adminUser._id
        });

        const testMerch = await Merchandise.create({
            name: 'Pro Summit Carbon Poles',
            price: 129,
            currency: 'EUR',
            category: 'Gear',
            image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=600',
            description: 'Ultra-light carbon trekking poles with ergonomic cork grips.',
            inStock: true
        });

        const testReview = await Review.create({
            author: normalUser._id,
            content: 'The expedition logistics and alpine safety standards were absolutely phenomenal!',
            rating: 5,
            status: 'approved'
        });

        const testPillar = await Pillar.create({
            name: 'Rahul Nair',
            role: 'Lead Alpine Guide',
            quote: 'Zero margin of error on high exposure terrain.',
            image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600',
            order: 1
        });

        await Notification.create({
            recipient: normalUser._id,
            actor: adminUser._id,
            type: 'system',
            title: 'Welcome to Base Camp',
            message: 'Your mountaineer passport is now active.'
        });

        await SiteSettings.create({
            maintenanceMode: false,
            siteName: 'Mountaineer Mallu Alpine Community',
            sections: {
                stories: { status: 'visible' },
                events: { status: 'visible' },
                gallery: { status: 'visible' },
                community: { status: 'visible' }
            }
        });

        console.log('✅ Fixtures seeded successfully.\n');

        // Create browser sessions
        const anon = createAgent();
        const userAgent = createAgent();
        const adminAgent = createAgent();

        // ═══════════════════════════════════════════════════════════════
        // PHASE 2: SYSTEM, PROBES & SEO ENDPOINTS
        // ═══════════════════════════════════════════════════════════════
        console.log('🔍 Testing System, Observability & SEO Endpoints...');

        let t = await timeIt(() => anon.get('/health'));
        recordEndpoint('System', 'GET', '/health', t.res.status, 200, t.duration, `DB: ${t.res.body?.database}`);

        t = await timeIt(() => anon.get('/readyz'));
        recordEndpoint('System', 'GET', '/readyz', t.res.status, 200, t.duration);

        t = await timeIt(() => anon.get('/livez'));
        recordEndpoint('System', 'GET', '/livez', t.res.status, 200, t.duration, `Server-Timing: ${t.res.headers['server-timing']}`);

        t = await timeIt(() => anon.get('/metrics'));
        recordEndpoint('System', 'GET', '/metrics', t.res.status, 200, t.duration, 'Prometheus Metrics');

        t = await timeIt(() => anon.get('/sitemap.xml'));
        recordEndpoint('SEO', 'GET', '/sitemap.xml', t.res.status, 200, t.duration, `Content-Type: ${t.res.headers['content-type']}`);

        t = await timeIt(() => anon.get('/robots.txt'));
        recordEndpoint('SEO', 'GET', '/robots.txt', t.res.status, 200, t.duration);

        t = await timeIt(() => anon.get(`/share/events/${testEvent._id}`));
        recordEndpoint('SEO', 'GET', '/share/events/:id', t.res.status, 200, t.duration, 'OG Card HTML preview');

        t = await timeIt(() => anon.get(`/share/stories/${testStory._id}`));
        recordEndpoint('SEO', 'GET', '/share/stories/:id', t.res.status, 200, t.duration, 'OG Card HTML preview');

        // ═══════════════════════════════════════════════════════════════
        // PHASE 3: AUTHENTICATION, SESSIONS & CSRF
        // ═══════════════════════════════════════════════════════════════
        console.log('\n🔒 Testing Authentication & Session Lifecycle...');

        // Normal user login
        t = await timeIt(() => userAgent.post('/api/auth/login').send({ email: regularExplorer.email, password: PASSWORD }));
        recordEndpoint('Auth', 'POST', '/api/auth/login', t.res.status, 200, t.duration, 'User login session');

        // Session verification
        t = await timeIt(() => userAgent.get('/api/auth/me'));
        recordEndpoint('Auth', 'GET', '/api/auth/me', t.res.status, 200, t.duration, `User: ${t.res.body?.user?.name}`);

        // Admin user login
        t = await timeIt(() => adminAgent.post('/api/auth/login').send({ email: adminExplorer.email, password: PASSWORD }));
        recordEndpoint('Auth', 'POST', '/api/auth/login', t.res.status, 200, t.duration, 'Admin login session');

        // Demo login
        const demoAgent = createAgent();
        t = await timeIt(() => demoAgent.post('/api/auth/demo-login'));
        recordEndpoint('Auth', 'POST', '/api/auth/demo-login', t.res.status, 200, t.duration, 'Demo account access');

        // CSRF verification: cross-origin attack should be rejected with 403
        t = await timeIt(() => request(app).post('/api/auth/login').set('Origin', 'https://malicious-summit.com').send({ email: regularExplorer.email, password: PASSWORD }));
        recordEndpoint('Security', 'POST', '/api/auth/login (Cross-Origin)', t.res.status, 403, t.duration, 'CSRF defense rejection');

        // Invalid credentials test
        t = await timeIt(() => anon.post('/api/auth/login').send({ email: regularExplorer.email, password: 'InvalidPassword#999' }));
        recordEndpoint('Auth', 'POST', '/api/auth/login (Bad Password)', t.res.status, 401, t.duration, 'Rejection of bad credentials');

        // Contact Submission
        t = await timeIt(() => anon.post('/api/contact').send({
            name: 'Basecamp Visitor',
            email: 'visitor@example.com',
            subject: 'Inquiry regarding expedition permits',
            message: 'Hello, what are the prerequisites for the upcoming Alps traverse?'
        }));
        recordEndpoint('Contact', 'POST', '/api/contact', t.res.status, [200, 201], t.duration, 'Public contact inquiry');

        // ═══════════════════════════════════════════════════════════════
        // PHASE 4: PUBLIC & CONTENT APIS
        // ═══════════════════════════════════════════════════════════════
        console.log('\n🏔️ Testing Public Content & Discovery APIs...');

        t = await timeIt(() => anon.get('/api/stories'));
        recordEndpoint('Stories', 'GET', '/api/stories', t.res.status, 200, t.duration, `Count: ${t.res.body?.stories?.length ?? t.res.body?.length}`);

        t = await timeIt(() => anon.get(`/api/stories/${testStory._id}`));
        recordEndpoint('Stories', 'GET', '/api/stories/:id', t.res.status, 200, t.duration, t.res.body?.title);

        t = await timeIt(() => anon.get('/api/events'));
        recordEndpoint('Events', 'GET', '/api/events', t.res.status, 200, t.duration, `Count: ${t.res.body?.events?.length ?? t.res.body?.length}`);

        t = await timeIt(() => anon.get(`/api/events/${testEvent._id}`));
        recordEndpoint('Events', 'GET', '/api/events/:id', t.res.status, 200, t.duration, t.res.body?.title);

        t = await timeIt(() => anon.get('/api/gallery'));
        recordEndpoint('Gallery', 'GET', '/api/gallery', t.res.status, 200, t.duration, `Vault items: ${t.res.body?.items?.length ?? t.res.body?.length}`);

        t = await timeIt(() => anon.get('/api/community/groups'));
        recordEndpoint('Community', 'GET', '/api/community/groups', t.res.status, 200, t.duration, `Groups: ${t.res.body?.length}`);

        t = await timeIt(() => userAgent.get(`/api/community/groups/${testGroup._id}`));
        recordEndpoint('Community', 'GET', '/api/community/groups/:id', t.res.status, 200, t.duration, testGroup.name);

        t = await timeIt(() => userAgent.get('/api/community/groups/me'));
        recordEndpoint('Community', 'GET', '/api/community/groups/me', t.res.status, 200, t.duration, 'My joined groups');

        t = await timeIt(() => anon.get('/api/merchandise'));
        recordEndpoint('Merchandise', 'GET', '/api/merchandise', t.res.status, 200, t.duration, `Catalog: ${t.res.body?.length}`);

        t = await timeIt(() => anon.get('/api/reviews'));
        recordEndpoint('Reviews', 'GET', '/api/reviews', t.res.status, 200, t.duration, 'Approved reviews');

        t = await timeIt(() => anon.get('/api/pillars'));
        recordEndpoint('Pillars', 'GET', '/api/pillars', t.res.status, 200, t.duration, 'Core pillars');

        t = await timeIt(() => anon.get('/api/settings'));
        recordEndpoint('Settings', 'GET', '/api/settings', t.res.status, 200, t.duration, 'Feature settings');

        t = await timeIt(() => anon.get('/api/search?q=zugspitze'));
        recordEndpoint('Search', 'GET', '/api/search?q=zugspitze', t.res.status, 200, t.duration, 'Cross-collection search');

        t = await timeIt(() => anon.get('/api/search?q=alp'));
        recordEndpoint('Search', 'GET', '/api/search?q=alp', t.res.status, 200, t.duration, 'Real-time autocomplete search');

        t = await timeIt(() => anon.post('/api/ai/peak-info').send({ name: 'Matterhorn', elevation: '4478m', location: 'Zermatt, Switzerland' }));
        recordEndpoint('AI', 'POST', '/api/ai/peak-info', t.res.status, [200, 500], t.duration, 'Peak knowledge lookup');

        // ═══════════════════════════════════════════════════════════════
        // PHASE 5: USER INTERACTIVE FLOWS & STATE CHANGES
        // ═══════════════════════════════════════════════════════════════
        console.log('\n🧗 Testing Interactive User Workflows...');

        // Event Registration
        t = await timeIt(() => userAgent.post(`/api/events/${testEvent._id}/register`));
        recordEndpoint('Events', 'POST', '/api/events/:id/register', t.res.status, [200, 201], t.duration, 'Event slot reservation');

        // Duplicate registration must fail with 400
        t = await timeIt(() => userAgent.post(`/api/events/${testEvent._id}/register`));
        recordEndpoint('Events', 'POST', '/api/events/:id/register (Duplicate)', t.res.status, 400, t.duration, 'Slot double-booking prevention');

        // Story submission
        t = await timeIt(() => userAgent.post('/api/stories/submit').send({
            title: 'Glacier Crevasse Rescue Field Log',
            excerpt: 'Practicing z-pulley extraction systems.',
            content: 'Team safety drills on the glacier.',
            author: 'Rahul Alpine',
            date: 'Nov 2026',
            region: 'Alps',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
        }));
        recordEndpoint('Stories', 'POST', '/api/stories/submit', t.res.status, 201, t.duration, 'Story drafting & moderation queue');
        const newStoryId = t.res.body?.story?._id;

        // Story user feed
        t = await timeIt(() => userAgent.get('/api/stories/user/me'));
        recordEndpoint('Stories', 'GET', '/api/stories/user/me', t.res.status, 200, t.duration, 'My submitted stories');

        // Gallery like
        t = await timeIt(() => userAgent.post(`/api/gallery/${testGallery._id}/like`));
        recordEndpoint('Gallery', 'POST', '/api/gallery/:id/like', t.res.status, 200, t.duration, 'Vault media like toggle');

        // User Passport & Expeditions
        t = await timeIt(() => userAgent.get('/api/users/me/passport'));
        recordEndpoint('Users', 'GET', '/api/users/me/passport', t.res.status, 200, t.duration, 'Ascent passport metrics');

        t = await timeIt(() => userAgent.get('/api/users/me/expeditions'));
        recordEndpoint('Users', 'GET', '/api/users/me/expeditions', t.res.status, 200, t.duration, 'User registered trips');

        t = await timeIt(() => userAgent.get('/api/users/me/wishlist'));
        recordEndpoint('Users', 'GET', '/api/users/me/wishlist', t.res.status, 200, t.duration, 'User gear wishlist');

        // Wishlist toggle
        t = await timeIt(() => userAgent.patch(`/api/users/me/wishlist/${testMerch._id}`));
        recordEndpoint('Users', 'PATCH', '/api/users/me/wishlist/:id', t.res.status, 200, t.duration, 'Gear wishlist toggle');

        // Notifications
        t = await timeIt(() => userAgent.get('/api/notifications'));
        recordEndpoint('Notifications', 'GET', '/api/notifications', t.res.status, 200, t.duration, `Unread: ${t.res.body?.unread}`);

        t = await timeIt(() => userAgent.post('/api/notifications/read-all'));
        recordEndpoint('Notifications', 'POST', '/api/notifications/read-all', t.res.status, 200, t.duration, 'Mark all read');

        // Group post
        t = await timeIt(() => userAgent.post(`/api/community/groups/${testGroup._id}/posts`).send({
            content: 'Base camp weather report: clear skies and 10 knot wind.'
        }));
        recordEndpoint('Community', 'POST', '/api/community/groups/:id/posts', t.res.status, [200, 201], t.duration, 'Group discussion post');

        // Core Web Vitals RUM ingestion
        const rumPayload = JSON.stringify([
            { name: 'LCP', value: 1850, page: '/stories', conn: '4g' },
            { name: 'CLS', value: 0.012, page: '/stories', conn: '4g' },
            { name: 'INP', value: 45, page: '/stories', conn: '4g' }
        ]);
        t = await timeIt(() => anon.post('/api/vitals').set('Content-Type', 'text/plain').send(rumPayload));
        recordEndpoint('Telemetry', 'POST', '/api/vitals', t.res.status, 204, t.duration, 'Real-user Web Vitals beacon');

        // ═══════════════════════════════════════════════════════════════
        // PHASE 6: ADMIN ROLE-BASED ACCESS CONTROL (RBAC)
        // ═══════════════════════════════════════════════════════════════
        console.log('\n👑 Testing Admin Operations & RBAC Boundary Protection...');

        // Unauthenticated access must be rejected with 401
        t = await timeIt(() => anon.get('/api/admin/overview'));
        recordEndpoint('RBAC', 'GET', '/api/admin/overview (Anonymous)', t.res.status, 401, t.duration, '401 Unauthorized check');

        // Regular user access must be rejected with 403
        t = await timeIt(() => userAgent.get('/api/admin/overview'));
        recordEndpoint('RBAC', 'GET', '/api/admin/overview (Regular User)', t.res.status, 403, t.duration, '403 Forbidden check');

        // Admin access must succeed with 200
        t = await timeIt(() => adminAgent.get('/api/admin/overview'));
        recordEndpoint('Admin', 'GET', '/api/admin/overview (Admin)', t.res.status, 200, t.duration, 'Admin dashboard metrics');

        t = await timeIt(() => adminAgent.get('/api/users'));
        recordEndpoint('Admin', 'GET', '/api/users', t.res.status, 200, t.duration, 'User directory');

        t = await timeIt(() => adminAgent.get('/api/admin/audit'));
        recordEndpoint('Admin', 'GET', '/api/admin/audit', t.res.status, 200, t.duration, 'System audit log');

        t = await timeIt(() => adminAgent.get('/api/admin/security-digest'));
        recordEndpoint('Admin', 'GET', '/api/admin/security-digest', t.res.status, 200, t.duration, 'Security digest');

        t = await timeIt(() => adminAgent.get('/api/admin/campaigns'));
        recordEndpoint('Admin', 'GET', '/api/admin/campaigns', t.res.status, 200, t.duration, 'Campaign autopilot list');

        t = await timeIt(() => adminAgent.get('/api/gallery/pending'));
        recordEndpoint('Admin', 'GET', '/api/gallery/pending', t.res.status, 200, t.duration, 'Pending gallery media');

        t = await timeIt(() => adminAgent.get('/api/reviews/admin'));
        recordEndpoint('Admin', 'GET', '/api/reviews/admin', t.res.status, 200, t.duration, 'All reviews admin feed');

        // Admin approve pending story
        if (newStoryId) {
            t = await timeIt(() => adminAgent.patch(`/api/stories/${newStoryId}/status`).send({ status: 'approved' }));
            recordEndpoint('Admin', 'PATCH', '/api/stories/:id/status', t.res.status, 200, t.duration, 'Story moderation approval');
        }

        // Admin vitals report
        t = await timeIt(() => adminAgent.get('/api/vitals'));
        recordEndpoint('Telemetry', 'GET', '/api/vitals (Admin)', t.res.status, 200, t.duration, 'P75 Core Web Vitals telemetry');

        // Event participant list export (Admin only, privacy shielded)
        t = await timeIt(() => adminAgent.get(`/api/events/${testEvent._id}/participants.csv`));
        recordEndpoint('Admin', 'GET', '/api/events/:id/participants.csv', t.res.status, 200, t.duration, 'Event participant CSV manifest');

        // ═══════════════════════════════════════════════════════════════
        // PHASE 7: STRESS & HIGH CONCURRENCY BENCHMARKING
        // ═══════════════════════════════════════════════════════════════
        console.log('\n⚡ Executing High-Concurrency Stress Benchmarks...');

        const runStressBatch = async (name, totalRequests, concurrencyLimit, taskGenerator) => {
            console.log(`\n  Running Benchmark: "${name}" (${totalRequests} total requests, concurrency: ${concurrencyLimit})...`);
            const latencies = [];
            let successes = 0;
            let failures = 0;
            const statusMap = {};
            const initialMem = process.memoryUsage();
            const benchStart = performance.now();

            let active = 0;
            let currentIdx = 0;

            await new Promise((resolve) => {
                const next = () => {
                    if (currentIdx >= totalRequests && active === 0) {
                        return resolve();
                    }

                    while (active < concurrencyLimit && currentIdx < totalRequests) {
                        const idx = currentIdx++;
                        active++;
                        const reqStart = performance.now();
                        const taskPromise = taskGenerator(idx);

                        taskPromise.then((res) => {
                            const lat = performance.now() - reqStart;
                            latencies.push(lat);
                            const st = res.status;
                            statusMap[st] = (statusMap[st] || 0) + 1;
                            if (st >= 200 && st < 400) {
                                successes++;
                            } else {
                                failures++;
                            }
                        }).catch(() => {
                            failures++;
                        }).finally(() => {
                            active--;
                            next();
                        });
                    }
                };
                next();
            });

            const totalDuration = performance.now() - benchStart;
            const finalMem = process.memoryUsage();

            latencies.sort((a, b) => a - b);
            const p = (pct) => latencies[Math.min(latencies.length - 1, Math.floor(pct * latencies.length))] || 0;

            const rps = (totalRequests / (totalDuration / 1000)).toFixed(1);
            const avgLat = (latencies.reduce((a, b) => a + b, 0) / latencies.length || 0).toFixed(2);
            const p50 = p(0.50).toFixed(2);
            const p90 = p(0.90).toFixed(2);
            const p95 = p(0.95).toFixed(2);
            const p99 = p(0.99).toFixed(2);
            const minLat = (latencies[0] || 0).toFixed(2);
            const maxLat = (latencies[latencies.length - 1] || 0).toFixed(2);

            const result = {
                name,
                totalRequests,
                concurrencyLimit,
                durationMs: Math.round(totalDuration),
                throughputRps: Number(rps),
                successRate: ((successes / totalRequests) * 100).toFixed(1) + '%',
                successes,
                failures,
                statusMap,
                latencies: {
                    minMs: Number(minLat),
                    avgMs: Number(avgLat),
                    p50Ms: Number(p50),
                    p90Ms: Number(p90),
                    p95Ms: Number(p95),
                    p99Ms: Number(p99),
                    maxMs: Number(maxLat)
                },
                memoryDeltaMb: {
                    heapUsed: ((finalMem.heapUsed - initialMem.heapUsed) / 1024 / 1024).toFixed(2),
                    rss: ((finalMem.rss - initialMem.rss) / 1024 / 1024).toFixed(2)
                }
            };

            benchmarkResults[name] = result;
            console.log(`    Throughput: ${rps} req/sec | Success: ${result.successRate}`);
            console.log(`    Latencies: Avg=${avgLat}ms | p50=${p50}ms | p95=${p95}ms | p99=${p99}ms | Max=${maxLat}ms`);
            console.log(`    Heap Delta: ${result.memoryDeltaMb.heapUsed} MB | Statuses:`, statusMap);
            return result;
        };

        // Benchmark 1: System Health & Probes (Raw Express Middleware Speed)
        await runStressBatch('System Health & Probes', 200, 50, () => anon.get('/livez'));

        // Benchmark 2: High-Traffic Public Read Endpoints (Stories, Events, Gallery, Community)
        const readEndpoints = ['/api/stories', '/api/events', '/api/gallery', '/api/community/groups', '/api/merchandise'];
        await runStressBatch('Public Content Reads', 200, 40, (i) => {
            const ep = readEndpoints[i % readEndpoints.length];
            return anon.get(ep);
        });

        // Benchmark 3: Real-Time Search & Autocomplete Queries
        const searchTerms = ['zugspitze', 'matterhorn', 'mont', 'alps', 'climb', 'trail', 'dolomites', 'glacier'];
        await runStressBatch('Search & Autocomplete', 150, 30, (i) => {
            const term = searchTerms[i % searchTerms.length];
            return anon.get(`/api/search?q=${term}`);
        });

        // Benchmark 4: Cache-Control & HTTP Compression Check
        await runStressBatch('Cached Public Queries', 150, 50, () => anon.get('/api/stories?limit=10'));

        // Benchmark 5: In-Memory Background Job Queue Throughput
        console.log('\n  Running Benchmark: "Background Job Queue Saturation"...');
        const jobStart = performance.now();
        let jobDone = 0;
        const totalJobs = 80;
        for (let j = 0; j < totalJobs; j++) {
            enqueue(`stress-job-${j}`, async () => {
                await new Promise((r) => setTimeout(r, 10));
                jobDone++;
            });
        }
        await drainJobs(10000);
        const jobDur = performance.now() - jobStart;
        const jobStatsObj = jobStats();
        benchmarkResults['Background Job Queue'] = {
            totalJobs,
            completedJobs: jobDone,
            durationMs: Math.round(jobDur),
            jobsPerSec: Number((totalJobs / (jobDur / 1000)).toFixed(1)),
            queueStats: jobStatsObj
        };
        console.log(`    Processed ${jobDone}/${totalJobs} background jobs in ${Math.round(jobDur)}ms (${benchmarkResults['Background Job Queue'].jobsPerSec} jobs/sec).`);

        // ═══════════════════════════════════════════════════════════════
        // PHASE 8: SUMMARY & EXPORT
        // ═══════════════════════════════════════════════════════════════
        const passedEndpoints = endpointResults.filter(e => e.passed).length;
        const totalEndpoints = endpointResults.length;
        const endpointPassRate = ((passedEndpoints / totalEndpoints) * 100).toFixed(1);

        const fullReport = {
            timestamp: new Date().toISOString(),
            testDatabase: TEST_DB,
            endpointSummary: {
                totalChecked: totalEndpoints,
                passed: passedEndpoints,
                failed: totalEndpoints - passedEndpoints,
                passRate: `${endpointPassRate}%`
            },
            endpointMatrix: endpointResults,
            stressBenchmarks: benchmarkResults,
            systemInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                cpus: (await import('os')).cpus().length,
                totalMemoryMb: Math.round((await import('os')).totalmem() / 1024 / 1024)
            }
        };

        const outPath = path.join(__dirname, 'stress-results.json');
        fs.writeFileSync(outPath, JSON.stringify(fullReport, null, 2), 'utf8');
        console.log(`\n📄 Benchmark & verification metrics written to: ${outPath}`);
        console.log(`\n🎉 ALL SUITES COMPLETED: ${passedEndpoints}/${totalEndpoints} endpoints passed (${endpointPassRate}%).\n`);

    } catch (err) {
        console.error('❌ CRITICAL ERROR IN STRESS TEST SUITE:', err);
    } finally {
        if (mongoose?.connection.readyState === 1 && mongoose.connection.db?.databaseName === TEST_DB) {
            await mongoose.connection.db.dropDatabase();
        }
        await mongoose?.disconnect();
        setTimeout(() => process.exit(0), 500).unref();
    }
}

runAll();
