import type { AlgorithmCollection } from '..';

export const pll2LookScrambles: AlgorithmCollection = {
	1: ["F R U' R' U R U R2 F' R U R U' R'"], // Inverse T
	2: ["F R' F' R U R U' R' F R U' R' U R U R' F'"], // Inverse Y
	3: ["R2 U R U R' U' R' U' R' U R'"], // Inverse Ua (Ub)
	4: ["R U' R U R U R U' R' U' R2"], // Inverse Ub (Ua)
	5: ["M U2 M2 U2 M U' M2 U' M2"], // Inverse Z
	6: ["M2 U' M2 U2 M2 U' M2"] // Inverse H
} as const;
