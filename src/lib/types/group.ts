import type { CaseState } from './caseState';
import type { StickerHidden } from './stickering';

export type GroupId = 'basic' | 'basicBack' | 'advanced' | 'expert' | 'oll2Look' | 'ollFull' | 'pll2Look' | 'pllFull';
export const GROUP_IDS: readonly GroupId[] = ['basic', 'basicBack', 'advanced', 'expert', 'oll2Look', 'ollFull', 'pll2Look', 'pllFull'];

export type StepId = 'F2L' | 'OLL' | 'PLL';
export const STEP_IDS: readonly StepId[] = ['F2L', 'OLL', 'PLL'];
export const STEP_TO_GROUPS: Record<StepId, GroupId[]> = {
	F2L: ['basic', 'basicBack', 'advanced', 'expert'],
	OLL: ['oll2Look', 'ollFull'],
	PLL: ['pll2Look', 'pllFull']
};

export type CaseId = number; // 1-based, matches existing assets

export interface GroupState {
	cases: Record<CaseId, CaseState>;
	collapsedCategories: Record<number, boolean>;
}

// export interface GlobalState {
//     groups: Record<GroupId, GroupState>;
//     currentGroup: GroupId; // GroupId that is selected in selection view
//     trainStateSelection: Record<TrainState, boolean>;
//     trainGroupSelection: Record<GroupId, boolean>;
//     trainSideSelection: Record<"left" | "right", boolean>;
//     colorSelection: Record<"cross" | "front", string>;
// }

export interface GroupDefinition {
	readonly id: GroupId;
	readonly name: string;
	readonly editName: string;
	readonly numberCases: number;
	readonly categories: readonly { name: string; cases: readonly CaseId[] }[];
	readonly ignoreAUF?: readonly CaseId[];
	readonly caseNumberMapping?: Readonly<Record<CaseId, string>>;
	readonly piecesToHide?: Readonly<Record<number, StickerHidden>>;
	readonly hashOllMapping?: Readonly<Record<CaseId, string>>;
}

const BASIC_DEFINITION: GroupDefinition = {
	id: 'basic',
	name: 'Basic Cases',
	editName: 'Basic',
	numberCases: 41,
	categories: [
		{ name: 'Basic Inserts', cases: [4, 3, 1, 2] },
		{ name: 'Pieces on Top / White facing Front / Edge oriented', cases: [5, 7, 15] },
		{ name: 'Pieces on Top / White facing Front / Edge unoriented', cases: [9, 11, 13] },
		{ name: 'Pieces on Top / White facing Side / Edge oriented', cases: [10, 12, 14] },
		{ name: 'Pieces on Top / white facing Side / Edge unoriented', cases: [6, 8, 16] },
		{ name: 'Pieces on Top / White facing Up / Edge oriented', cases: [17, 19, 21, 23] },
		{ name: 'Pieces on Top / White facing Up / Edge unoriented', cases: [18, 20, 22, 24] },
		{ name: 'Edge solved', cases: [32, 33, 34, 38, 39] },
		{ name: 'Edge flipped', cases: [31, 35, 36, 40, 41, 37] },
		{ name: 'Corner on Bottom / Edge on Top / Edge oriented', cases: [27, 30, 25] },
		{ name: 'Corner on Bottom / Edge on Top / Edge unoriented', cases: [29, 28, 26] }
	],
	ignoreAUF: [37, 38, 39, 40, 41]
} as const;

const BASIC_BACK_DEFINITION: GroupDefinition = {
	id: 'basicBack',
	name: 'Basic Backslot',
	editName: 'Basic Backslot',
	numberCases: 41,
	categories: [
		{ name: 'Basic Inserts', cases: [4, 3, 1, 2] },
		{ name: 'Pieces on Top / White facing Back / Edge oriented', cases: [6, 8, 16] },
		{ name: 'Pieces on Top / White facing Back / Edge unoriented', cases: [10, 12, 14] },
		{ name: 'Pieces on Top / White facing Side / Edge oriented', cases: [9, 11, 13] },
		{ name: 'Pieces on Top / white facing Side / Edge unoriented', cases: [5, 7, 15] },
		{ name: 'Pieces on Top / White facing Up / Edge oriented', cases: [18, 20, 22, 24] },
		{ name: 'Pieces on Top / White facing Up / Edge unoriented', cases: [17, 19, 21, 23] },
		{ name: 'Edge solved', cases: [32, 34, 33, 39, 38] },
		{ name: 'Edge flipped', cases: [31, 36, 35, 41, 40, 37] },
		{ name: 'Corner on Bottom / Edge on Top / Edge oriented', cases: [28, 29, 26] },
		{ name: 'Corner on Bottom / Edge on Top / Edge unoriented', cases: [30, 27, 25] }
	],
	ignoreAUF: [37, 38, 39, 40, 41]
} as const;

const ADVANCED_DEFINITION: GroupDefinition = {
	id: 'advanced',
	name: 'Advanced Cases',
	editName: 'Advanced',
	numberCases: 60, // 42,
	categories: [
		{ name: 'Slot in Front  / White facing Up', cases: [1, 2, 3, 4] },
		{ name: 'Slot in Front / White facing Front', cases: [9, 10, 13, 14] },
		{ name: 'Slot in Front / White facing Side', cases: [7, 8, 11, 12] },
		{ name: 'Slot in Front / Corner in Adjacent Slot', cases: [19, 20, 21, 22, 23, 24] },
		{ name: 'Slot in Back / Edge in Adjacent Front Slot', cases: [37, 38, 39, 40, 41, 42] },
		{ name: 'Slot in Back / Corner in Adjacent Front Slot', cases: [25, 26, 27, 28, 29, 30] },
		{ name: 'Edge in Opposite Slot', cases: [5, 6, 17, 18, 15, 16] },
		{ name: 'Corner in Opposite Slot', cases: [31, 32, 33, 34, 35, 36] },
		{
			name: 'Basic Cases / Free Slot',
			cases: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
		}
	],
	caseNumberMapping: {
		43: '10B',
		44: '12B',
		45: '15B',
		46: '23B',
		47: '25B',
		48: '25F',
		49: '26B',
		50: '26F',
		51: '33B',
		52: '33F',
		53: '34B',
		54: '34F',
		55: '37B',
		56: '37F',
		57: '38B',
		58: '38F',
		59: '39B',
		60: '39F'
	},
	piecesToHide: {
		1: 'br',
		2: 'br',
		3: 'fl',
		4: 'fl',
		5: 'fr',
		6: 'fr',
		7: 'br',
		8: 'br',
		9: 'fl',
		10: 'fl',
		11: 'fl',
		12: 'fl',
		13: 'br',
		14: 'br',
		15: 'fr',
		16: 'fr',
		17: 'fr',
		18: 'fr',
		19: 'fr',
		20: 'fr',
		21: 'fr',
		22: 'fr',
		23: 'fr',
		24: 'fr',
		25: 'fr',
		26: 'fr',
		27: 'fr',
		28: 'fr',
		29: 'fr',
		30: 'fr',
		31: 'fr',
		32: 'fr',
		33: 'fr',
		34: 'fr',
		35: 'fr',
		36: 'fr',
		37: 'fr',
		38: 'fr',
		39: 'fr',
		40: 'fr',
		41: 'fr',
		42: 'fr',
		43: 'br',
		44: 'br',
		45: 'br',
		46: 'fl',
		47: 'br',
		48: 'fl',
		49: 'br',
		50: 'fl',
		51: 'br',
		52: 'fl',
		53: 'br',
		54: 'fl',
		55: 'br',
		56: 'fl',
		57: 'br',
		58: 'fl',
		59: 'br',
		60: 'fl'
	},
	// fr: front-right, fl: front-left, br: back-right, bl: back-left
	ignoreAUF: [55, 56, 57, 58, 59, 60]
} as const;

const EXPERT_DEFINITION: GroupDefinition = {
	id: 'expert',
	name: 'Expert Cases',
	editName: 'Expert',
	numberCases: 17,
	categories: [
		{ name: 'Corner is solved', cases: [1, 2, 3, 4, 5, 6] },
		{ name: 'Pair in wrong slot', cases: [7, 8, 9] },
		{ name: 'Flipped edge & corner in adjacent slot', cases: [10, 11, 12, 13, 14, 15] },
		{ name: 'Other easy cases', cases: [16, 17] }
	],
	piecesToHide: {
		1: 'br',
		2: 'br',
		3: 'fl',
		4: 'fl',
		5: 'fl',
		6: 'fl',
		7: 'fl',
		8: 'br',
		9: 'fr',
		10: 'fl',
		11: 'br',
		12: 'fl',
		13: 'br',
		14: 'fl',
		15: 'br',
		16: 'fl',
		17: 'br'
	},
	// fr: front-right, fl: front-left, br: back-right, bl: back-left
	ignoreAUF: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
} as const;

const OLL_2LOOK_DEFINITION: GroupDefinition = {
	id: 'oll2Look',
	name: '2-Look OLL',
	editName: 'OLL 2-Look',
	numberCases: 10,
	categories: [
		{ name: 'Edge Orientation', cases: [1, 2, 3] },
		{ name: 'Corner Orientation', cases: [4, 5, 6, 7, 8, 9, 10] }
	],
	caseNumberMapping: {
		1: 'Dot',
		2: 'L-Shape',
		3: 'I-Shape',
		4: 'Sune',
		5: 'Antisune',
		6: 'Pi',
		7: 'U',
		8: 'T',
		9: 'L',
		10: 'H'
	},
	/*
	hashOllMapping: {
		1: 'PD',
		2: 'URB',
		3: 'URL',
		4: 'SO',
		5: 'AO',
		6: 'PO',
		7: 'UO',
		8: 'TO',
		9: 'LO',
		10: 'HO'
	}*/
} as const;

const OLL_FULL_DEFINITION: GroupDefinition = {
	id: 'ollFull',
	name: 'Full OLL',
	editName: 'OLL Full',
	numberCases: 57,
	categories: [
		{ name: 'Dot', cases: [1, 2, 18, 19, 17, 20, 3, 4] },
		{ name: 'Square Shape', cases: [5, 6] },
		{ name: 'Small Lightning Bolt', cases: [7, 8, 11, 12] },
		{ name: 'Fish Shape', cases: [9, 10, 35, 37] },
		{ name: 'Knight Move Shape', cases: [13, 14, 15, 16] },
		{ name: 'Awkward Shape', cases: [29, 30, 41, 42] },
		{ name: 'C Shape', cases: [34, 46] },
		{ name: 'W Shape', cases: [36, 38] },
		{ name: 'Corners Oriented', cases: [28, 57] },
		{ name: 'Cross', cases: [21, 22, 23, 24, 25, 26, 27] },
		{ name: 'P Shape', cases: [31, 32, 43, 44] },
		{ name: 'T Shape', cases: [33, 45] },
		{ name: 'Small L Shape', cases: [47, 48, 49, 50, 53, 54] },
		{ name: 'Big Lightning Bolt', cases: [39, 40] },
		{ name: 'I Shape', cases: [51, 52, 55, 56] }
	],
	hashOllMapping: {
		1: "HD", 2: "PD", 3: "SD", 4: "AD", 5: "SRB", 6: "AFL", 7: "SFR", 8: "AFR", 9: "ARB",
		10: "SFL", 11: "SBL", 12: "ABL", 13: "SFB", 14: "ARL", 15: "SRL", 16: "AFB", 17: "LD",
		18: "UD", 19: "TD", 20: "OD", 21: "HO", 22: "PO", 23: "UO", 24: "TO", 25: "LO", 26: "AO",
		27: "SO", 28: "OFR", 29: "TFL", 30: "TFR", 31: "TBL", 32: "TRB", 33: "TRL", 34: "TFB",
		35: "LFL", 36: "LBL", 37: "LRB", 38: "LFR", 39: "LFB", 40: "LRL", 41: "UFR", 42: "UFL",
		43: "UBL", 44: "URB", 45: "URL", 46: "UFB", 47: "PBL", 48: "PRB", 49: "PFR", 50: "PFL",
		51: "PRL", 52: "PFB", 53: "HRB", 54: "HFR", 55: "HFB", 56: "HRL", 57: "OFB"
	}
} as const;

const PLL_2LOOK_DEFINITION: GroupDefinition = {
	id: 'pll2Look',
	name: '2-Look PLL',
	editName: 'PLL 2-Look',
	numberCases: 6,
	categories: [
		{ name: 'Corner Permutation', cases: [1, 2] },
		{ name: 'Edge Permutation', cases: [3, 4, 5, 6] }
	],
	caseNumberMapping: {
		1: 'T',
		2: 'Y',
		3: 'Ua',
		4: 'Ub',
		5: 'Z',
		6: 'H'
	}
} as const;

const PLL_FULL_DEFINITION: GroupDefinition = {
	id: 'pllFull',
	name: 'Full PLL',
	editName: 'PLL Full',
	numberCases: 21,
	categories: [
		{ name: 'Edges Only', cases: [1, 2, 3, 4] },
		{ name: 'Adjacent Corner Swap', cases: [5, 6, 8, 9, 10, 11, 12, 13, 18, 19, 20, 21] },
		{ name: 'Diagonal Corner Swap', cases: [7, 14, 15, 16, 17] }
	],
	caseNumberMapping: {
		1: 'Ua',
		2: 'Ub',
		3: 'Z',
		4: 'H',
		5: 'Aa',
		6: 'Ab',
		7: 'E',
		8: 'T',
		9: 'F',
		10: 'Ja',
		11: 'Jb',
		12: 'Ra',
		13: 'Rb',
		14: 'V',
		15: 'Y',
		16: 'Na',
		17: 'Nb',
		18: 'Ga',
		19: 'Gb',
		20: 'Gc',
		21: 'Gd'
	}
} as const;

export const GROUP_DEFINITIONS: Record<GroupId, GroupDefinition> = {
	basic: BASIC_DEFINITION,
	basicBack: BASIC_BACK_DEFINITION,
	advanced: ADVANCED_DEFINITION,
	expert: EXPERT_DEFINITION,
	oll2Look: OLL_2LOOK_DEFINITION,
	ollFull: OLL_FULL_DEFINITION,
	pll2Look: PLL_2LOOK_DEFINITION,
	pllFull: PLL_FULL_DEFINITION
} as const;

// export const createGroupState = (group: GroupId, definition: GroupDefinition = GROUP_DEFINITIONS[group]): GroupState => {
//     const categoryCases = definition.categoryCases ?? [];
//     const uniqueCaseIds = Array.from(new Set(categoryCases.flat())).sort((a, b) => a - b);
//     const caseIds = uniqueCaseIds.length > 0
//         ? uniqueCaseIds
//         : Array.from({ length: definition.numberCases }, (_, index) => index + 1);

//     const cases = Object.fromEntries(caseIds.map((caseId) => [caseId, createCaseState()]));

//     const collapsedCategories = Object.fromEntries(
//         definition.categoryNames.map((_, index) => [index, false as boolean]),
//     );

//     return {
//         cases: cases as Record<CaseId, CaseState>,
//         collapsedCategories: collapsedCategories as Record<number, boolean>,
//     };
// };

// export const createInitialGroupsState = (): Record<GroupId, GroupState> =>
//     Object.fromEntries(GROUP_IDS.map((group) => [group, createGroupState(group)])) as Record<GroupId, GroupState>;

// export const createInitialGlobalState = (): GlobalState => ({
//     groups: createInitialGroupsState(),
//     currentGroup: "basic",
//     trainStateSelection: { ...defaultTrainStateSelection },
//     trainGroupSelection: { ...defaultTrainGroupSelection },
//     trainSideSelection: { ...defaultTrainSideSelection },
//     colorSelection: { ...defaultColorSelection },
// });
