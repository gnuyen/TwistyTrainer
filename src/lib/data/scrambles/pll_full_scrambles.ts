import type { AlgorithmCollection } from '..';

export const pllFullScrambles: AlgorithmCollection = {
    1: ["R2 U R U R' U' R' U' R' U R'"],
    2: ["R U' R U R U R U' R' U' R2"],
    3: ["M U2 M2 U2 M U' M2 U' M2"],
    4: ["M2 U' M2 U2 M2 U' M2"],
    5: ["x R2 D2 R U R' D2 R U' R x'"],
    6: ["x R' U R' D2 R U' R' D2 R2 x'"],
    7: ["x' D R U R' D' R U' R' D R U' R' D' R U R' x"],
    8: ["F R U' R' U R U R2 F' R U R U' R'"],
    9: ["R' U' R U' R' U R U R2 F' R U R U' R' F U R"],
    10: ["x U2 r' U' r U2 R' F R' F' R2 x'"],
    11: ["U R U R2 F' R U R U' R' F R U' R'"],
    12: ["R U2 R D R' U R D' R' U' R' U R U R'"],
    13: ["R2 F R U R U' R' F' R U2 R' U2 R"],
    14: ["F' R' F' R U' R U R2 F R y' U R U' R"],
    15: ["F R' F' R U R U' R' F R U' R' U R U R' F'"],
    16: ["R U R' U2 R U R2 F' R U R U' R' F R U' R' U' R U' R'"],
    17: ["R' U R' F R F' R U' R' F' U F R U R' U' R"],
    18: ["R' U' R y R2 u R' U R U' R u' R2"],
    19: ["R2 u R' U R' U' R u' R2 y' R' U R"],
    20: ["R U R' y' R2 u' R U' R' U R' u R2"],
    21: ["R2 u' R U' R U R' u R2 y R U' R'"]
} as const;
