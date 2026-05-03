import fs from 'fs';
const content = fs.readFileSync('node_modules/cubing/dist/lib/cubing/twisty/index.js', 'utf8');

const regex = /--[a-zA-Z0-9-]{3,}/g;
let match;
const vars = new Set();
while ((match = regex.exec(content)) !== null) {
  vars.add(match[0]);
}
console.log(Array.from(vars).filter(v => v.includes('twisty') || v.includes('color') || v.includes('facelet') || v.includes('opacity')));
