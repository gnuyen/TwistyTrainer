const fs = require('fs');

function getAxis(move) {
	if (move.includes('(') || move.includes(')')) return null;
	const firstChar = move.charAt(0).toUpperCase();
	if (['U', 'D', 'E', 'Y'].includes(firstChar)) return 'UD';
	if (['L', 'R', 'M', 'X'].includes(firstChar)) return 'LR';
	if (['F', 'B', 'S', 'Z'].includes(firstChar)) return 'FB';
	const lowerChar = move.charAt(0);
	if (['u', 'd'].includes(lowerChar)) return 'UD';
	if (['l', 'r'].includes(lowerChar)) return 'LR';
	if (['f', 'b'].includes(lowerChar)) return 'FB';
	return null;
}

function getBaseMove(move) {
	return move.replace(/['2]/g, '');
}

function getTurnAmount(move) {
	if (move.includes('2')) return 2;
	if (move.includes("'")) return 3;
	return 1;
}

function turnAmountToSuffix(amount) {
	const mod = amount % 4;
	if (mod === 0) return null;
	if (mod === 1) return '';
	if (mod === 2) return '2';
	if (mod === 3) return "'";
	return null;
}

function simplifyGroup(moves) {
	const summary = new Map();
	const order = [];
	for (const move of moves) {
		const base = getBaseMove(move);
		if (!summary.has(base)) {
			summary.set(base, 0);
			order.push(base);
		}
		summary.set(base, (summary.get(base) + getTurnAmount(move)) % 4);
	}
	const result = [];
	for (const base of order) {
		const turns = summary.get(base);
		const suffix = turnAmountToSuffix(turns);
		if (suffix !== null) {
			result.push(base + suffix);
		}
	}
	return result;
}

function simplifyAlg(alg) {
	if (!alg || !alg.trim()) return '';
	const tokens = alg.trim().split(/\s+/);
	if (tokens.length === 0) return '';
	const groups = [];
	let currentGroup = [];
	let currentAxis = null;
	for (const move of tokens) {
		if (!move) continue;
		if (move.includes('(') || move.includes(')')) {
			if (currentGroup.length > 0) groups.push(currentGroup);
			currentGroup = [];
			currentAxis = null;
			groups.push([move]);
			continue;
		}
		const axis = getAxis(move);
		if (currentGroup.length === 0) {
			currentGroup.push(move);
			currentAxis = axis;
		} else {
			if (axis !== null && axis === currentAxis) {
				currentGroup.push(move);
			} else {
				groups.push(currentGroup);
				currentGroup = [move];
				currentAxis = axis;
			}
		}
	}
	if (currentGroup.length > 0) groups.push(currentGroup);
	const simplifiedGroups = groups.map((group) => {
		if (group.length > 0) {
			const axis = getAxis(group[0]);
			if (axis !== null) {
				return simplifyGroup(group);
			}
		}
		return group;
	});
	return simplifiedGroups.flat().join(' ');
}

const alg = "F (R U' R' U') (R U R' F') (R U R' U') (R' F R F')";
console.log(simplifyAlg(alg));
