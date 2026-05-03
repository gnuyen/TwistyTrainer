import type { AlgorithmCollection } from '..';

export const pll2LookAlgorithms: AlgorithmCollection = {
	1: ["(R U R' U') R' F R2 (U' R' U') (R U R' F')"], // T Perm
	2: ["F (R U' R' U') (R U R' F') (R U R' U') (R' F R F')"], // Y Perm
	3: ["R U' (R U R U) (R U' R' U') R2"], // Ua Perm
	4: ["R2 U (R U R' U') (R' U' R' U R')"], // Ub Perm
	5: ["M2 U M2 U M' U2 M2 U2 M'"], // Z Perm
	6: ["M2 U M2 U2 M2 U M2"] // H Perm
} as const;
