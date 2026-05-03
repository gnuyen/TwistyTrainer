import re

with open('src/lib/data/algorithms/oll_full_algorithms.ts', 'r') as f:
    text = f.read()

# Replace specific triggers directly
replacements = [
    ("F R U R' U' F'", "F (R U R' U') F'"),
    ("f R U R' U' f'", "f (R U R' U') f'"),
    ("R U R' U'", "(R U R' U')"),
    ("R' F R F'", "(R' F R F')"),
    ("R U R' F'", "(R U R' F')"),
    ("r U R' U'", "(r U R' U')"),
    ("r' U' R U' R' U2 r", "(r' U' R U') (R' U2 r)"),
    ("R U R' U R U2 R'", "(R U R' U) (R U2 R')"),
    ("R U2 R' U' R U' R'", "(R U2 R') (U' R U' R')"),
    ("r U R' U R U2 r'", "(r U R' U) (R U2 r')"),
    ("R U R' U R' F R F' R U2 R'", "(R U R' U) (R' F R F') (R U2 R')"),
    ("r U R' U R' F R F' R U2 r'", "(r U R' U) (R' F R F') (R U2 r')"),
    ("R' U' R U' R' U2 R", "(R' U' R U') (R' U2 R)"),
    ("F U R U' R' F'", "F (U R U' R') F'"),
    ("R U R2 U' R' F R U R U' F'", "R U R2 U' R' F (R U R U') F'"),
]

for old, new in replacements:
    # avoid double replacement
    if old in text and new not in text:
        text = text.replace(old, new)

with open('src/lib/data/algorithms/oll_full_algorithms.ts', 'w') as f:
    f.write(text)
