import { puzzles } from "cubing/puzzles";
// Let's check the source of cubing.js for stickering names.
import fs from 'fs';
const content = fs.readFileSync('node_modules/cubing/dist/lib/cubing/twisty/index.js', 'utf8');

// find all stickering names
const matches = content.match(/stickering:\s*"([^"]+)"/g) || [];
console.log(matches.slice(0, 50));
