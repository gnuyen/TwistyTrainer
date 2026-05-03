import fs from 'fs';
const content = fs.readFileSync('node_modules/cubing/dist/lib/cubing/twisty/index.js', 'utf8');

const regex = /"OLL"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(content.substring(match.index - 50, match.index + 150));
}
