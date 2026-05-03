import type { AlgorithmCollection } from '..';

export const oll2LookScrambles: AlgorithmCollection = {
	1: ["f U R U' R' f' F U R U' R' F'"],
	2: ["f U R U' R' f'"],
	3: ["F U R U' R' F'"],
	4: ["R U2 R' U' R U' R'"],
	5: ["R U R' U R U2 R'"],
	6: ["R' U2 R2 U R2 U R2 U2 R'"],
	7: ["R U2 R D R' U2 R D' R2"],
	8: ["F R' F' r U R U' r'"],
	9: ["r U R' U' r' F R F'"],
	10: ["F U R U' R' U R U' R' F'"]
} as const;
