import fs from 'fs';
const content = fs.readFileSync('node_modules/cubing/dist/lib/cubing/twisty/index.js', 'utf8');

// Find the stickering definitions
const idx = content.indexOf('const stickerings = {');
if (idx !== -1) {
    console.log(content.substring(idx, idx + 1000));
} else {
    // search for OLL
    const ollIdx = content.indexOf('"OLL"');
    if (ollIdx !== -1) {
        console.log(content.substring(ollIdx - 200, ollIdx + 500));
    }
}
