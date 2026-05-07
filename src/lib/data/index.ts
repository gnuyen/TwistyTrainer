import type { GroupId } from '../types/group';
import { advancedAlgorithms } from './algorithms/advanced_algorithms';
import { basicAlgorithms } from './algorithms/basic_algorithms';
import { basicAlgorithmsBack } from './algorithms/basic_algorithms_back';
import { expertAlgorithms } from './algorithms/expert_algorithms';
import { advancedScrambles } from './scrambles/advanced_scrambles';
import { basicScrambles } from './scrambles/basic_scrambles';
import { basicScramblesBack } from './scrambles/basic_scrambles_back';
import { expertScrambles } from './scrambles/expert_scrambles';
import { ollFullScrambles } from './scrambles/oll_full_scrambles';
import { pllFullScrambles } from './scrambles/pll_full_scrambles';
import { oll2LookAlgorithms } from './algorithms/oll_2look_algorithms';
import { ollFullAlgorithms } from './algorithms/oll_full_algorithms';
import { pll2LookAlgorithms } from './algorithms/pll_2look_algorithms';
import { pllFullAlgorithms } from './algorithms/pll_full_algorithms';

// export { basicAlgorithms } from "./algorithms/basic_algorithms";
// export { basicAlgorithmsBack } from "./algorithms/basic_algorithms_back";
// export { advancedAlgorithms } from "./algorithms/advanced_algorithms";
// export { expertAlgorithms } from "./algorithms/expert_algorithms";

// export { basicScrambles } from "./scrambles/basic_scrambles";
// export { basicScramblesBack } from "./scrambles/basic_scrambles_back";
// export { advancedScrambles } from "./scrambles/advanced_scrambles";
// export { expertScrambles } from "./scrambles/expert_scrambles";

export type AlgorithmCollection = Record<number, string[]>;

export const GROUP_SCRAMBLES: Partial<Record<GroupId, AlgorithmCollection>> = {
	basic: basicScrambles,
	basicBack: basicScramblesBack,
	advanced: advancedScrambles,
	expert: expertScrambles,
	ollFull: ollFullScrambles,
	pllFull: pllFullScrambles
};

export const GROUP_ALGORITHMS: Record<GroupId, AlgorithmCollection> = {
	basic: basicAlgorithms,
	basicBack: basicAlgorithmsBack,
	advanced: advancedAlgorithms,
	expert: expertAlgorithms,
	oll2Look: oll2LookAlgorithms,
	ollFull: ollFullAlgorithms,
	pll2Look: pll2LookAlgorithms,
	pllFull: pllFullAlgorithms
};
