import fs from 'fs';
import path from 'path';

const routesDir = 'c:/My_Project/mounatineer__mallu/backend/routes';
const files = fs.readdirSync(routesDir);

for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if it imports upload
    if (content.includes('../middleware/upload.js')) {
        // Import verifyFileSignature
        if (!content.includes('verifyFileSignature')) {
            content = content.replace(/import\s+{\s*upload\s*}\s+from\s+['"]\.\.\/middleware\/upload\.js['"];/, 
                "import { upload, verifyFileSignature } from '../middleware/upload.js';");
        }

        // Add verifyFileSignature after upload.*(...)
        content = content.replace(/upload\.(single|array|fields)\([^)]*\),/g, (match) => {
            if (content.includes(`${match} verifyFileSignature`)) return match; // Already added
            return `${match} verifyFileSignature,`;
        });

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${file}`);
    }
}
console.log('Done.');
