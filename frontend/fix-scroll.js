import fs from 'fs';
import path from 'path';

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
};

const files = walk('c:/My_Project/mounatineer__mallu/frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('once: false')) {
        let newContent = content.replace(/once:\s*false/g, 'once: true');
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
});
