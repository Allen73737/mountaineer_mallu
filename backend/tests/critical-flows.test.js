// End-to-end API tests for the flows that must never break: signup, login, session, logout, event
// registration, story submission and admin approval.
//
// They run against a separate database (mountaineer-mallu-test on the same MONGODB_URI) that is wiped
// before and after, so real data is never touched. Email sending is switched off.
//   npm test
import { test, before, after } from 'node:test';
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

const TEST_DB = 'mountaineer-mallu-test';
const ORIGIN = (process.env.CLIENT_URL || 'http://localhost:5174').split(',')[0];
const PASSWORD = 'Summit#2026pass';

let request, mongoose, app, User, Event, Story;

before(async () => {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must be set to run the tests.');
    ({ default: request } = await import('supertest'));
    ({ default: mongoose } = await import('mongoose'));
    ({ default: app } = await import('../index.js'));
    ({ default: User } = await import('../models/User.js'));
    ({ default: Event } = await import('../models/Event.js'));
    ({ default: Story } = await import('../models/Story.js'));
    await mongoose.connect(process.env.MONGODB_URI, { dbName: TEST_DB, serverSelectionTimeoutMS: 15000 });
    assert.equal(mongoose.connection.db.databaseName, TEST_DB, 'refusing to run outside the test database');
    await mongoose.connection.db.dropDatabase();
});

after(async () => {
    if (mongoose?.connection.readyState === 1 && mongoose.connection.db.databaseName === TEST_DB) {
        await mongoose.connection.db.dropDatabase();
    }
    await mongoose?.disconnect();
    // index.js opens a socket server and timers; nothing else should keep the test run alive
    setTimeout(() => process.exit(process.exitCode ?? 0), 200).unref();
});

// A browser-like agent: keeps the session cookie and sends the Origin header the CSRF check expects
const browser = () => {
    const agent = request.agent(app);
    const withOrigin = (req) => req.set('Origin', ORIGIN);
    return {
        get: (url) => agent.get(url),
        post: (url) => withOrigin(agent.post(url)),
        patch: (url) => withOrigin(agent.patch(url)),
    };
};

const explorer = { name: 'Test Explorer', email: 'explorer@example.test', password: PASSWORD };

test('signup creates a session and /auth/me returns the user', async () => {
    const b = browser();
    const res = await b.post('/api/auth/signup').send({ ...explorer, gdprConsent: true });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    const me = await b.get('/api/auth/me');
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, explorer.email);
});

test('login, session check and logout', async () => {
    const b = browser();
    const bad = await b.post('/api/auth/login').send({ email: explorer.email, password: 'Wrong#pass123' });
    assert.equal(bad.status, 401);

    const ok = await b.post('/api/auth/login').send({ email: explorer.email, password: PASSWORD });
    assert.equal(ok.status, 200, JSON.stringify(ok.body));
    assert.equal((await b.get('/api/auth/me')).status, 200);

    await b.post('/api/auth/logout');
    assert.equal((await b.get('/api/auth/me')).status, 401);
});

test('state-changing requests from another site are rejected (CSRF)', async () => {
    const res = await request(app).post('/api/auth/login')
        .set('Origin', `${ORIGIN}.evil.example`)
        .send({ email: explorer.email, password: PASSWORD });
    assert.equal(res.status, 403);
});

test('an explorer can register for an event once, and the slot count is enforced', async () => {
    const owner = await User.findOne({ email: explorer.email });
    const event = await Event.create({
        title: 'Test Ridge Traverse', date: 'Dec 20, 2099', time: '7:00 AM', location: 'Test Valley',
        difficulty: 'Beginner', totalSlots: 1, type: 'Trek', image: 'https://images.unsplash.com/photo-1',
        category: 'expedition', createdBy: owner._id,
    });

    const b = browser();
    await b.post('/api/auth/login').send({ email: explorer.email, password: PASSWORD });
    const first = await b.post(`/api/events/${event._id}/register`);
    assert.ok([200, 201].includes(first.status), JSON.stringify(first.body));
    const again = await b.post(`/api/events/${event._id}/register`);
    assert.equal(again.status, 400);

    // The single slot is taken: a second explorer is turned away
    const other = browser();
    await other.post('/api/auth/signup').send({ name: 'Second Explorer', email: 'second@example.test', password: PASSWORD, gdprConsent: true });
    const full = await other.post(`/api/events/${event._id}/register`);
    assert.equal(full.status, 400);
});

test('a submitted story stays hidden until an admin approves it', async () => {
    const b = browser();
    await b.post('/api/auth/login').send({ email: explorer.email, password: PASSWORD });
    const submitted = await b.post('/api/stories/submit').send({
        title: 'Test Story Above The Clouds', excerpt: 'A short climb.', content: 'We climbed.',
        author: 'Test Explorer', date: 'Nov 2026', region: 'Alps', image: 'https://images.unsplash.com/photo-2',
    });
    assert.equal(submitted.status, 201, JSON.stringify(submitted.body));
    const id = submitted.body.story._id;
    assert.equal(submitted.body.story.status, 'pending');

    // Explorers can't approve their own story
    assert.equal((await b.patch(`/api/stories/${id}/status`).send({ status: 'approved' })).status, 403);

    const publicBefore = await request(app).get('/api/stories?page=1&limit=50&_=1');
    assert.ok(!publicBefore.body.stories.some(s => s._id === id), 'pending story must not be public');

    await User.create({ name: 'Test Admin', email: 'admin@example.test', password: PASSWORD, role: 'superadmin', isProfileComplete: true, gdprConsent: true });
    const admin = browser();
    const login = await admin.post('/api/auth/login').send({ email: 'admin@example.test', password: PASSWORD });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    const approved = await admin.patch(`/api/stories/${id}/status`).send({ status: 'approved' });
    assert.equal(approved.status, 200, JSON.stringify(approved.body));

    assert.equal((await Story.findById(id)).status, 'approved');
    const publicAfter = await request(app).get('/api/stories?page=1&limit=50&_=2');
    assert.ok(publicAfter.body.stories.some(s => s._id === id), 'approved story should be public');
});

test('admin endpoints refuse regular users', async () => {
    const b = browser();
    await b.post('/api/auth/login').send({ email: explorer.email, password: PASSWORD });
    assert.equal((await b.get('/api/admin/overview')).status, 403);
    assert.equal((await request(app).get('/api/admin/overview')).status, 401);
});

test('the daily reminder finds tomorrow\'s expeditions (free-text dates) and notifies participants', async () => {
    const { sendExpeditionReminders } = await import('../services/cron.js');
    const { EVENT_TIMEZONE } = await import('../utils/eventDate.js');
    const { default: Notification } = await import('../models/Notification.js');
    const participant = await User.findOne({ email: explorer.email });

    // "Nov 14, 2026" style, one day ahead in the events' time zone
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const label = new Intl.DateTimeFormat('en-US', { timeZone: EVENT_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' }).format(tomorrow);
    const event = await Event.create({
        title: 'Test Dawn Summit', date: label, time: '6:00 AM', location: 'Test Col',
        difficulty: 'Beginner', totalSlots: 5, type: 'Trek', image: 'https://images.unsplash.com/photo-3',
        category: 'expedition', createdBy: participant._id, participants: [participant._id],
    });

    const result = await sendExpeditionReminders();
    assert.ok(result.events >= 1, 'tomorrow\'s event should be found');
    const note = await Notification.findOne({ recipient: participant._id, link: `/events/${event._id}` });
    assert.ok(note, 'participant should get an in-app reminder');
});

test('the public event page never exposes participants\' email addresses', async () => {
    const event = await Event.findOne({ title: 'Test Ridge Traverse' });
    const res = await request(app).get(`/api/events/${event._id}?_=privacy`);
    assert.equal(res.status, 200);
    assert.ok(res.body.event.participants.length > 0);
    assert.ok(res.body.event.participants.every(p => p.email === undefined), 'participant emails leaked');
});

test('event links get their own share card (title, summary, photo) for chat apps', async () => {
    const { renderSharePage } = await import('../utils/sharePreview.js');
    const os = await import('os');
    const fs = await import('fs/promises');
    const index = path.join(os.tmpdir(), `mm-index-${process.pid}.html`);
    await fs.writeFile(index, [
        '<title>Mountaineer Mallu</title>',
        '<meta name="description" content="generic" />',
        '<meta property="og:title" content="generic" />',
        '<meta property="og:url" content="https://example.test/" />',
        '<meta property="og:image" content="https://example.test/og.jpg" />',
    ].join('\n'));
    const event = await Event.findOne({ title: 'Test Ridge Traverse' });
    const html = await renderSharePage(index, `/events/${event._id}`, 'https://example.test');
    await fs.rm(index, { force: true });
    assert.ok(html, 'expected a share page');
    assert.match(html, /<title>Test Ridge Traverse — Mountaineer Mallu<\/title>/);
    assert.match(html, /og:title" content="Test Ridge Traverse/);
    assert.match(html, new RegExp(`og:url" content="https://example.test/events/${event._id}"`));
    assert.match(html, /og:image" content="https:\/\/images\.unsplash\.com\/photo-1"/);
    assert.equal(await renderSharePage(index, '/events/not-an-id', 'https://example.test'), null);
});
