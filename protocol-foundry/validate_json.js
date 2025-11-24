const fs = require('fs');
const path = require('path');

const files = [
    'src/renderer/src/weapons/classic.json',
    'src/renderer/src/weapons/vandal.json',
    'src/renderer/src/weapons/phantom.json'
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${file} is valid JSON.`);
    } catch (e) {
        console.error(`❌ ${file} is INVALID JSON.`);
        console.error(e.message);
    }
});
