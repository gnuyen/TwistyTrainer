import type { AlgorithmCollection } from '..';

export const oll2LookAlgorithms: AlgorithmCollection = {
	1: ["F (R U R' U') F' f (R U R' U') f'"],
	2: ["f (R U R' U') f'"],
	3: ["F (R U R' U') F'"],
	4: ["(R U R' U) (R U2 R')"],
	5: ["(R U2 R') (U' R U' R')"],
	6: ["R U2 (R2 U' R2 U') (R2 U2 R)"],
	7: ["R2 D (R' U2 R) D' (R' U2 R')"],
	8: ["(r U R' U') r' (F R F')"],
	9: ["(F R' F') r (U R U' r')"],
	10: ["F (R U R' U') (R U R' U') F'"]
} as const;
