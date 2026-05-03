import { puzzles } from "cubing/puzzles";
// No easy way to check. Let's just output the content of a relevant file.
import fs from 'fs';
const content = fs.readFileSync('node_modules/cubing/dist/lib/cubing/twisty/index.js', 'utf8');

const regex = /"OLL"/g;
// ...
