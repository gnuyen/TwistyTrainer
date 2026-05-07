import { Alg } from 'cubing/alg';
import type { Side } from '$lib/types/Side';
import type { StickerHidden } from '$lib/types/stickering';

// Type definitions for KPuzzle pattern structure
interface PieceData {
	pieces: number[];
	orientation: number[];
}

interface PatternData {
	CORNERS: PieceData;
	EDGES: PieceData;
}

interface NormalizedPattern {
	patternData: PatternData;
}

interface KPuzzleInterface {
	algToTransformation: (alg: Alg) => {
		toKPattern: () => NormalizedPattern;
	};
}

export interface PuzzlePattern {
	kpuzzle: KPuzzleInterface;
}

// Bottom-layer slot positions in KPattern (F2L slots)
const BOTTOM_SLOTS = {
	fr: { edge: 8, corner: 4 }, // FR edge, DRF corner
	fl: { edge: 9, corner: 5 }, // FL edge, DFL corner
	br: { edge: 10, corner: 7 }, // BR edge, DBR corner
	bl: { edge: 11, corner: 6 } // BL edge, DLB corner
} as const;

/**
 * Mirrors a slot position when switching from right to left side
 */
function mirrorSlot(slot: NonNullable<StickerHidden>): NonNullable<StickerHidden> {
	const mirrorMap: Record<NonNullable<StickerHidden>, NonNullable<StickerHidden>> = {
		fr: 'fl',
		fl: 'fr',
		br: 'bl',
		bl: 'br'
	};
	return mirrorMap[slot];
}

/**
 * Checks if a specific F2L slot is solved
 */
function isSlotSolved(
	corners: { pieces: number[]; orientation: number[] },
	edges: { pieces: number[]; orientation: number[] },
	slot: NonNullable<StickerHidden>
): boolean {
	const { edge, corner } = BOTTOM_SLOTS[slot];
	return (
		corners.pieces[corner] === corner &&
		corners.orientation[corner] === 0 &&
		edges.pieces[edge] === edge &&
		edges.orientation[edge] === 0
	);
}

// Cross edge positions (bottom layer edges): DF(4), DR(5), DB(6), DL(7)
const CROSS_EDGES = [4, 5, 6, 7] as const;

/**
 * Checks if the cross (all 4 bottom layer edges) is solved
 */
function isCrossSolved(edges: { pieces: number[]; orientation: number[] }): boolean {
	for (const edgePos of CROSS_EDGES) {
		if (edges.pieces[edgePos] !== edgePos || edges.orientation[edgePos] !== 0) {
			return false;
		}
	}
	return true;
}

/**
 * Checks if the F2L is solved according to the case requirements
 */
function isSlotGroupSolved(
	corners: { pieces: number[]; orientation: number[] },
	edges: { pieces: number[]; orientation: number[] },
	piecesToHide: StickerHidden | undefined,
	side: Side
): boolean {
	// First, check if the cross (bottom layer edges) is solved
	if (!isCrossSolved(edges)) {
		return false;
	}

	// Determine which slot to exclude from checking
	let slotToExclude: NonNullable<StickerHidden> | undefined = piecesToHide;
	if (piecesToHide && side === 'left') {
		slotToExclude = mirrorSlot(piecesToHide);
	}

	// Check all slots except the one to exclude
	const slotsToCheck: NonNullable<StickerHidden>[] = ['fr', 'fl', 'br', 'bl'];
	for (const slot of slotsToCheck) {
		if (slot === slotToExclude) {
			continue; // Skip the slot that doesn't need to be solved
		}
		if (!isSlotSolved(corners, edges, slot)) {
			return false;
		}
	}

	return true;
}

/**
 * Check if the cube is fully solved
 */
function isCubeSolved(normalizedPattern: NormalizedPattern): boolean {
	return (
		normalizedPattern.patternData.CORNERS.pieces.every((v, i) => v === i) &&
		normalizedPattern.patternData.CORNERS.orientation.every((v) => v === 0) &&
		normalizedPattern.patternData.EDGES.pieces.every((v, i) => v === i) &&
		normalizedPattern.patternData.EDGES.orientation.every((v) => v === 0)
	);
}

// LL edge/corner indices (top face)
const LL_EDGES = [0, 1, 2, 3] as const; // UF, UR, UB, UL
const LL_CORNERS = [0, 1, 2, 3] as const; // URF, UFL, ULB, UBR

/**
 * Checks if OLL is solved: all 4 LL edges and corners have correct orientation
 */
function isOLLSolved(normalizedPattern: NormalizedPattern): boolean {
	const { CORNERS, EDGES } = normalizedPattern.patternData;
	for (const i of LL_EDGES) {
		if (EDGES.orientation[i] !== 0) return false;
	}
	for (const i of LL_CORNERS) {
		if (CORNERS.orientation[i] !== 0) return false;
	}
	return true;
}

/**
 * Checks if the OLL cross is formed: all 4 LL edges have correct orientation.
 * Used for 2-look OLL edge-orientation cases (dot, line, L-shape).
 */
function isOLLCrossFormed(normalizedPattern: NormalizedPattern): boolean {
	const { EDGES } = normalizedPattern.patternData;
	for (const i of LL_EDGES) {
		if (EDGES.orientation[i] !== 0) return false;
	}
	return true;
}

export interface SolveState {
	slotsSolved: boolean;
	cubeSolved: boolean;
	ollSolved: boolean;
	ollCrossFormed: boolean;
}

/**
 * Checks the current F2L state and optionally triggers callbacks when solved.
 * @param pattern - The current KPattern from TwistyPlayer
 * @param scramble - The scramble algorithm
 * @param alg - The solution algorithm (moves made by user)
 * @param piecesToHide - Which F2L slot to exclude from checking
 * @param side - Which side (right/left) for mirroring
 * @param onPhaseSolved - Optional callback when F2L is solved
 * @param onCubeSolved - Optional callback when cube is fully solved
 * @returns The current F2L state
 */
export type StepId = 'F2L' | 'OLL' | 'OLL_CROSS' | 'PLL';

export async function checkSolveState(
	pattern: PuzzlePattern,
	scramble: string,
	alg: string,
	piecesToHide?: StickerHidden,
	side: Side = 'right',
	onPhaseSolved?: () => void,
	onCubeSolved?: () => void,
	stepId: StepId = 'F2L'
): Promise<SolveState> {
	try {
		// Generate normalized pattern from scramble + alg (ignores setupRotation)
		const currentAppliedAlg = new Alg(scramble + ' ' + alg);
		const normalizedPattern = pattern.kpuzzle.algToTransformation(currentAppliedAlg).toKPattern();

		// Check solve conditions
		const isSlotSolved = isSlotGroupSolved(
			normalizedPattern.patternData.CORNERS,
			normalizedPattern.patternData.EDGES,
			piecesToHide,
			side
		);
		const cubeSolved = isCubeSolved(normalizedPattern);
		const ollSolved = isOLLSolved(normalizedPattern);
		const ollCrossFormed = isOLLCrossFormed(normalizedPattern);

		// Fire callbacks based on step type
		if (stepId === 'OLL_CROSS') {
			if (ollCrossFormed) {
				console.log(
					'%c\u2713 OLL CROSS!',
					'color: #fff; background: #e67e22; font-size:1.2rem; font-weight: bold; padding: 4px 12px; border-radius: 4px;'
				);
				onPhaseSolved?.();
			}
		} else if (stepId === 'OLL') {
			if (ollSolved) {
				console.log(
					'%c\u2713 OLL SOLVED!',
					'color: #fff; background: #e67e22; font-size:1.2rem; font-weight: bold; padding: 4px 12px; border-radius: 4px;'
				);
				onPhaseSolved?.();
			}
		} else if (stepId === 'PLL') {
			if (cubeSolved) {
				console.log(
					'%c\u2713 PLL SOLVED!',
					'color: #fff; background: #8e44ad; font-size:1.2rem; font-weight: bold; padding: 4px 12px; border-radius: 4px;'
				);
				onPhaseSolved?.();
			}
		} else {
			// F2L / other
			if (isSlotSolved) {
				console.log(
					'%c\u2713 F2L SOLVED!',
					'color: #fff; background: #27ae60; font-size:1.2rem; font-weight: bold; padding: 4px 12px; border-radius: 4px;'
				);
				onPhaseSolved?.();
			}
		}

		if (cubeSolved) {
			console.log(
				'%c\u2713 CUBE SOLVED!',
				'color: #fff; background: #3498db; font-size:1.2rem; font-weight: bold; padding: 4px 12px; border-radius: 4px;'
			);
			onCubeSolved?.();
		}

		return { slotsSolved: isSlotSolved, cubeSolved, ollSolved, ollCrossFormed };
	} catch (e) {
		console.error('%c[Solve Check Error]', 'color: #e74c3c; font-weight: bold', e);
		return { slotsSolved: false, cubeSolved: false, ollSolved: false, ollCrossFormed: false };
	}
}
