import type { AlgorithmCollection } from '..';

export const oll2LookScrambles: AlgorithmCollection = {
	// Dot (0 edges oriented) — corresponds to full OLL 1, 2, 3, 4, 17, 18, 19, 20
	1: [
		"F R' F' R U2 F R' F' R2 U2 R'",
		"f U R U' R' f' F U R U' R' F'",
		"F U R U' R' F' U f U R U' R' f'",
		"F U R U' R' F' U' f U R U' R' f'",
		"M U R U R' U' r R2 F R F'",
		"r' U2 R U R' U r2 U2 R' U' R U' r'",
		"F R' F' R M U R U' R' U' R' r",
		"M U R U R' U' M2 U R U' r'"
	],
	// L-shape (2 adjacent edges oriented) — corresponds to full OLL 5–16, 29–50, 53, 54
	2: [
		"r' U' R U' R' U2 r",
		"r U R' U R U2 r'",
		"r U2 R' U' R U' r'",
		"r' U2 R U R' U r",
		"F U R U' R2 F' R U R U' R'",
		"R U2 R' F R' F' R U' R U' R'",
		"r U2 R' F R' F' R U' R U' r'",
		"r R' U R' U2 R U R' U R M",
		"R U R' U' R' F R2 U R' U' F'",
		"F U F' R' F R U' R' F' R",
		"l' U' l U' L' U L l' U l",
		"r U r' U R U' R' r U' r'",
		"R U' R' F' U F R U R' U R U' R'",
		"F2 R U' R' U R U R2 F' R F'",
		"R' F R U R' U' F' U R",
		"f R' F' R U R U' R' S'",
		"F R' F' R U R U' R'",
		"F U R' U' R' F' R U R2 U' R'",
		"R U2 R' F R' F' R2 U2 R'",
		"F' L F L' U' L' U' L U L' U L",
		"R U R' U' R' F R F'",
		"F R' F' R U R U R' U' R U' R'",
		"L U F' U' L' U L F L'",
		"R' U' F U R U' R' F' R",
		"F U R U' R' F' R U2 R' U' R U' R'",
		"F U R U' R' F' R' U2 R U R' U R",
		"F' L' U' L U F",
		"F R U R' U' F'",
		"F U R U' R' F'",
		"R' U' F R' F' R U R",
		"R' U' F R' F' R F R' F' R U R",
		"F U R U' R' U R U' R' F'",
		"r' U r2 U' r2 U' r2 U r'",
		"r U' r2 U r2 U r2 U' r",
		"r' U' R U' R' U R U' R' U2 r",
		"r U R' U R U' R' U R U2 r'"
	],
	// Line (2 opposite edges oriented) — corresponds to full OLL 51, 52, 55, 56
	3: [
		"f U R U' R' U R U' R' f'",
		"R B U B' U R' U' R U' R'",
		"F R' F' U2 R U R' U R2 U2 R'",
		"r' U' r R' U' R U R' U' R U r' U r"
	],
	4: ["R U2' R' U' R U' R'"],
	5: ["R U R' U R U2' R'"],
	6: ["R' U2 R2 U R2 U R2 U2 R'"],
	7: ["R U2 R D R' U2 R D' R2"],
	8: ["F R' F' r U R U' r'"],
	9: ["r U R' U' r' F R F'"],
	10: ["R U R' U R U' R' U R U2' R'"]
} as const;
