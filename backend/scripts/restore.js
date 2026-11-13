// Restore a backup made by scripts/backup.js.
//   npm run restore -- backups/<timestamp>              (dry run: shows what would change)
//   npm run restore -- backups/<timestamp> --confirm    (replaces those collections' contents)
// Only collections present in the backup folder are touched.
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });
const { EJSON } = mongoose.mongo.BSON;

const [folderArg, flag] = process.argv.slice(2);
const confirm = flag === '--confirm';

const run = async () => {
    if (!folderArg) throw new Error('Usage: npm run restore -- backups/<timestamp> [--confirm]');
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set.');
    const dir = path.resolve(root, folderArg);
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'));
    if (!files.length) throw new Error(`No collection files in ${dir}`);

    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'mountaineer-mallu', serverSelectionTimeoutMS: 15000 });
    const db = mongoose.connection.db;

    for (const file of files) {
        const name = file.replace(/\.json$/, '');
        const docs = EJSON.parse(await fs.readFile(path.join(dir, file), 'utf8'), { relaxed: false });
        const current = await db.collection(name).countDocuments();
        if (!confirm) {
            console.log(`  ${name}: ${current} now → ${docs.length} from backup`);
            continue;
        }
        await db.collection(name).deleteMany({});
        if (docs.length) await db.collection(name).insertMany(docs, { ordered: false });
        console.log(`  ✓ ${name}: restored ${docs.length}`);
    }
    console.log(confirm ? '✅ Restore complete.' : '\nDry run only. Add --confirm to replace these collections.');
};

run()
    .catch(err => { console.error('❌ Restore failed:', err.message); process.exitCode = 1; })
    .finally(() => mongoose.disconnect());
