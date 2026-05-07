<!-- Lightweight display-only version of TwistyPlayer for use in card grids.
     No model subscriptions, no click handlers, no F2L checking, no addMove. -->
<script lang="ts">
	import { casesState, getCaseAlg, getCaseScramble } from '$lib/casesState.svelte';
	import { casesStatic } from '$lib/casesStatic';
	import type { CustomAlgorithm, AlgorithmSelection } from '$lib/types/caseState';
	import getRotationAlg from '$lib/rotation';
	import getStickeringString, { getLLStickeringString } from '$lib/stickering';
	import type { GroupId } from '$lib/types/group';
	import type { Side } from '$lib/types/Side';
	import type { StickerColor } from '$lib/types/stickering';
	import type { Auf } from '$lib/types/trainCase';
	import { concatenateAuf } from '$lib/utils/addAuf';
	import { simplifyAlg } from '$lib/utils/simplifyAlg';
	import { PLL_ARROWS } from '$lib/data/pll_arrows';
	import { CUBING_JS_COLORS, OPPOSITE_COLOR, SIDE_COLOR } from '$lib/types/stickering';
	import { onMount } from 'svelte';
	import type { HintStickering } from '$lib/types/globalState';
	import { globalState } from '$lib/globalState.svelte';
	import { cubeSVG, Masking } from 'sr-visualizer';

	interface Props {
		groupId?: GroupId;
		caseId?: number;
		scrambleSelection?: number;
		algorithmSelection?: AlgorithmSelection;
		customAlgorithm?: CustomAlgorithm;
		auf?: Auf;
		side: Side;
		crossColor?: StickerColor;
		frontColor?: StickerColor;
		stickering?: HintStickering;
		controlPanel?: 'bottom-row' | 'none';
		scramble?: string;
		alg?: string;
		class?: string;
	}

	let {
		groupId,
		caseId,
		scrambleSelection = 0,
		algorithmSelection,
		customAlgorithm,
		auf = '',
		side,
		crossColor = 'white',
		frontColor = 'red',
		stickering = 'masked',
		controlPanel = 'none',
		scramble = $bindable(''),
		alg = $bindable(''),
		class: extraClass = ''
	}: Props = $props();

	const wrapperClass = $derived(['relative mx-auto', extraClass].filter(Boolean).join(' '));

	const staticData = $derived(
		groupId !== undefined && caseId !== undefined ? casesStatic[groupId]?.[caseId] : undefined
	);
	const caseState = $derived(
		groupId !== undefined && caseId !== undefined ? casesState[groupId]?.[caseId] : undefined
	);

	const algWithoutAUF = $derived(
		staticData
			? getCaseAlg(
					staticData,
					algorithmSelection ?? caseState?.algorithmSelection ?? { left: 0, right: 0 },
					customAlgorithm ?? caseState?.customAlgorithm ?? { left: '', right: '' },
					side
				)
			: undefined
	);

	const scrambleWithoutAUF = $derived(
		staticData ? getCaseScramble(staticData, side, scrambleSelection) : undefined
	);

	$effect(() => {
		if (scrambleWithoutAUF !== undefined && algWithoutAUF !== undefined) {
			const [newScramble, newAlg] = concatenateAuf(scrambleWithoutAUF, algWithoutAUF, auf);
			scramble = newScramble;
			alg = simplifyAlg(newAlg);
		}
	});

	const setupRotation = $derived(getRotationAlg(crossColor, frontColor));

	const stepId = $derived(
		groupId?.toLowerCase().includes('oll')
			? 'OLL'
			: groupId?.toLowerCase().includes('pll')
				? 'PLL'
				: 'F2L'
	);

	const cameraLongitude = $derived(
		stepId === 'F2L'
			? (side === 'right' ? 1 : -1) * globalState.cameraLongitude
			: side === 'right'
				? 15
				: -15
	);
	const cameraLatitude = $derived(stepId === 'F2L' ? globalState.cameraLatitude : 60);

	const isOELL = $derived(groupId === 'oll2Look' && [1, 2, 3].includes(caseId ?? -1));

	const stickeringString = $derived(
		stepId === 'F2L'
			? stickering === 'masked' && staticData
				? getStickeringString(staticData.pieceToHide, side, crossColor, frontColor)
				: undefined
			: getLLStickeringString(crossColor, isOELL)
	);

	let el: HTMLElement | undefined = $state();
	let srContainer: HTMLElement | undefined = $state();

	function getAlgRotation(algorithm: string): number {
		const match = algorithm.trim().match(/^(y'|y2?|U'|U2?)/);
		if (!match) return 0;
		const move = match[1];
		if (move === 'y' || move === 'U') return 90;
		if (move === "y'" || move === "U'") return -90;
		if (move === 'y2' || move === 'U2') return 180;
		return 0;
	}

	$effect(() => {
		if ((stepId === 'OLL' || stepId === 'PLL') && srContainer && alg) {
			srContainer.innerHTML = '';
			const caseName = staticData?.caseName;
			let arrows = stepId === 'PLL' && caseName ? PLL_ARROWS[caseName] : undefined;

			// Format arrows with black color and scale (-s7 makes them shorter)
			if (arrows) {
				// sr-visualizer regex expects scale BEFORE color (e.g. U1U3-s7-black)
				arrows = arrows
					.split(',')
					.map((a) => `${a}-s7-black`)
					.join(',');
			}
			// Use the primary algorithm to always generate a standard orientation
			const baseAlg = staticData?.algPool?.[0] ?? alg;

			cubeSVG(srContainer, {
				case: baseAlg,
				view: 'plan',
				mask: stepId === 'OLL' ? (isOELL ? Masking.OELL : Masking.OLL) : Masking.LL,
				arrows: arrows,
				width: 300,
				height: 300,
				viewportRotations: [
					// VisualCube defaults might need rotation depending on standard U face orientation
				],
				colorScheme: {
					// Use cubing js colors to keep it consistent
					0: crossColor ? CUBING_JS_COLORS[OPPOSITE_COLOR[crossColor]] : CUBING_JS_COLORS['yellow'], // U
					1:
						crossColor && frontColor && SIDE_COLOR[crossColor]?.[frontColor]?.right
							? CUBING_JS_COLORS[SIDE_COLOR[crossColor][frontColor]!.right]
							: CUBING_JS_COLORS['green'], // R
					2: frontColor ? CUBING_JS_COLORS[frontColor] : CUBING_JS_COLORS['red'], // F
					3: crossColor ? CUBING_JS_COLORS[crossColor] : CUBING_JS_COLORS['white'], // D
					4:
						crossColor && frontColor && SIDE_COLOR[crossColor]?.[frontColor]?.left
							? CUBING_JS_COLORS[SIDE_COLOR[crossColor][frontColor]!.left]
							: CUBING_JS_COLORS['blue'], // L
					5: frontColor ? CUBING_JS_COLORS[OPPOSITE_COLOR[frontColor]] : CUBING_JS_COLORS['orange'] // B
				}
			});
		}
	});

	onMount(async () => {
		await import('cubing/twisty');
	});
</script>

<div class={wrapperClass}>
	{#if stepId === 'OLL' || stepId === 'PLL'}
		{@const baseAlg = staticData?.algPool?.[0] ?? alg}
		{@const rotationOffset = getAlgRotation(alg) - getAlgRotation(baseAlg)}
		<div
			bind:this={srContainer}
			class="sr-container"
			style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; transform: rotate({rotationOffset}deg);"
		></div>
	{:else}
		<twisty-player
			bind:this={el}
			style:width="100%"
			style:height="100%"
			puzzle="3x3x3"
			{alg}
			experimental-setup-alg={[setupRotation, scramble].join(' ')}
			camera-longitude={cameraLongitude}
			camera-latitude={cameraLatitude}
			experimental-stickering-mask-orbits={stickeringString}
			experimental-stickering={undefined}
			control-panel={controlPanel}
			experimental-drag-input="none"
			background="none"
			hint-facelets="none"
			back-view="none"
			viewer-link="none"
			camera-distance="4.7"
			visualization="3D"
		></twisty-player>
	{/if}
</div>

<style>
	/* Ensure the generated SVG scales to fit the wrapper */
	:global(.sr-container svg) {
		width: 100% !important;
		height: 100% !important;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
</style>
