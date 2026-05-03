const oll = {
1: ["R U2 R2 F R F' U2 R' F R F'"],
2: ["F R U R' U' F' f R U R' U' f'"],
3: ["f R U R' U' f' U' F R U R' U' F'"],
4: ["f R U R' U' f' U F R U R' U' F'"],
5: ["r' U2 R U R' U r"],
6: ["r U2 R' U' R U' r'"],
7: ["r U R' U R U2 r'"],
8: ["r' U' R U' R' U2 r"],
9: ["R U R' U' R' F R2 U R' U' F'"],
10: ["R U R' U R' F R F' R U2 R'"],
11: ["r U R' U R' F R F' R U2 r'"],
12: ["M' R' U' R U' R' U2 R U' R r'"],
13: ["F U R U' R2 F' R U R U' R'"],
14: ["R' F R U R' F' R F U' F'"],
15: ["l' U' l L' U' L U l' U l"],
16: ["r U r' R U R' U' r U' r'"],
17: ["F R' F' R2 r' U R U' R' U' M'"],
18: ["r U R' U R U2 r2 U' R U' R' U2 r"],
19: ["r' R U R U R' U' M' R' F R F'"],
20: ["r U R' U' M2 U R U' R' U' M'"],
21: ["R U2 R' U' R U R' U' R U' R'"],
22: ["R U2 R2 U' R2 U' R2 U2 R"],
23: ["R2 D R' U2 R D' R' U2 R'"],
24: ["r U R' U' r' R U R U' R'"],
25: ["F R' F' r U R U' r'"],
26: ["R U2 R' U' R U' R'"],
27: ["R U R' U R U2 R'"],
28: ["M U M' U2 M U M'"],
29: ["R U R' U' R U' R' F' U' F R U R'"],
30: ["F R' F R2 U' R' U' R U R' F2"],
31: ["R' U' F U R U' R' F' R"],
32: ["S R U R' U' R' F R f'"],
33: ["R U R' U' R' F R F'"],
34: ["R U R2 U' R' F R U R U' F'"],
35: ["R U2 R2 F R F' R U2 R'"],
36: ["L' U' L U' L' U L U L F' L' F"],
37: ["F R' F' R U R U' R'"],
38: ["R U R' U R U' R' U' R' F R F'"],
39: ["L F' L' U' L U F U' L'"],
40: ["R' F R U R' U' F' U R"],
41: ["R U R' U R U2 R' F R U R' U' F'"],
42: ["R' U' R U' R' U2 R F R U R' U' F'"],
43: ["F' U' L' U L F"],
44: ["F U R U' R' F'"],
45: ["F R U R' U' F'"],
46: ["R' U' R' F R F' U R"],
47: ["R' U' R' F R F' R' F R F' U R"],
48: ["F R U R' U' R U R' U' F'"],
49: ["r U' r2 U r2 U r2 U' r"],
50: ["r' U r2 U' r2 U' r2 U r'"],
51: ["f R U R' U' R U R' U' f'"],
52: ["R U R' U R U' B U' B' R'"],
53: ["r' U2 R U R' U' R U R' U r"],
54: ["r U2 R' U' R U R' U' R U' r'"],
55: ["R U2 R2 U' R U' R' U2 F R F'"],
56: ["r' U' r U' R' U R U' R' U R r' U r"],
57: ["R U R' U' M' U R U' r'"]
};

const pll = {
1: ["R U' R U R U R U' R' U' R2"], // Ua
2: ["R2 U R U R' U' R' U' R' U R'"], // Ub
3: ["M2 U M2 U M' U2 M2 U2 M'"], // Z
4: ["M2 U M2 U2 M2 U M2"], // H
5: ["x R' U R' D2 R U' R' D2 R2 x'"], // Aa
6: ["x R2 D2 R U R' D2 R U' R x'"], // Ab
7: ["x' R U' R' D R U R' D' R U R' D R U' R' D' x"], // E
8: ["R U R' U' R' F R2 U' R' U' R U R' F'"], // T
9: ["R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"], // F
10: ["x R2 F R F' R U2 r' U r U2 x'"], // Ja
11: ["R U R' F' R U R' U' R' F R2 U' R' U'"], // Jb
12: ["R U' R' U' R U R D R' U' R D' R' U2 R'"], // Ra
13: ["R' U2 R U2 R' F R U R' U' R' F' R2"], // Rb
14: ["R' U R' U' y R' F' R2 U' R' U R' F R F"], // V
15: ["F R U' R' U' R U R' F' R U R' U' R' F R F'"], // Y
16: ["R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"], // Na
17: ["R' U R U' R' F' U' F R U R' F R' F' R U' R"], // Nb
18: ["R2 u R' U R' U' R u' R2 y' R' U R"], // Ga
19: ["R' U' R y R2 u R' U R U' R u' R2"], // Gb
20: ["R2 u' R U' R U R' u R2 y R U' R'"], // Gc
21: ["R U R' y' R2 u' R U' R' U R' u R2"]  // Gd
};

function invert(alg) {
    const moves = alg.split(' ').filter(Boolean).reverse();
    return moves.map(m => {
        if (m.endsWith("'")) return m[0];
        if (m.endsWith("2")) return m;
        return m + "'";
    }).join(' ');
}

function printCollection(name, dict, isScramble) {
    console.log(`export const ${name} = {`);
    for(let i=1; i<=Object.keys(dict).length; i++) {
        let alg = dict[i][0];
        if (isScramble) alg = invert(alg);
        console.log(`    ${i}: ["${alg}"],`);
    }
    console.log(`} as const;`);
}

printCollection('ollFullAlgorithms', oll, false);
console.log('---');
printCollection('ollFullScrambles', oll, true);
console.log('---');
printCollection('pllFullAlgorithms', pll, false);
console.log('---');
printCollection('pllFullScrambles', pll, true);
