// Database backup: writes every collection to backups/<timestamp>/<collection>.json (Extended JSON, so
// ObjectIds and dates survive the round trip). Keeps the newest BACKUP_KEEP folders (default 14).
//   npm run backup
// Restore with: npm run restore -- backups/<timestamp>
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });
const { EJSON } = mongoose.mongo.BSON;

const KEEP = parseInt(process.env.BACKUP_KEEP || '14', 10);
const backupsDir = path.join(root, 'backups');

const run = async () => {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set.');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'mountaineer-mallu', serverSelectionTimeoutMS: 15000 });
    const db = mongoose.connection.db;

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = path.join(backupsDir, stamp);
    await fs.mkdir(dir, { recursive: true });

    const collections = (await db.listCollections({}, { nameOnly: true }).toArray())
        .map(c => c.name).filter(n => !n.startsWith('system.'));

    let total = 0;
    for (const name of collections) {
        const docs = await db.collection(name).find().toArray();
        await fs.writeFile(path.join(dir, `${name}.json`), EJSON.stringify(docs, { relaxed: false }));
        total += docs.length;
        console.log(`  ✓ ${name}: ${docs.length}`);
    }
    console.log(`✅ Backed up ${collections.length} collections (${total} documents) to ${path.relative(root, dir)}`);

    // Rotate old backups
    const folders = (await fs.readdir(backupsDir)).sort();
    for (const old of folders.slice(0, Math.max(0, folders.length - KEEP))) {
        await fs.rm(path.join(backupsDir, old), { recursive: true, force: true });
        console.log(`  – removed old backup ${old}`);
    }
};

run()
    .catch(err => { console.error('❌ Backup failed:', err.message); process.exitCode = 1; })
    .finally(() => mongoose.disconnect());
