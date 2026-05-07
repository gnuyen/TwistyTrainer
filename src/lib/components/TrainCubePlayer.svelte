<!-- Cube viewer for training views — mirrors the cubedex TwistyCube approach:
     camera at lat=0/lon=0, rAF loop always running, HOME_ORIENTATION applied
     when gyro is on, DR_LOCK_ORIENTATION when gyro is off. -->
<script lang="ts">
	import { casesState, getCaseAlg, getCaseScramble } from '$lib/casesState.svelte';
	import { casesStatic } from '$lib/casesStatic';
	import type { CustomAlgorithm } from '$lib/types/caseState';
	import getRotationAlg from '$lib/rotation';
	import getStickeringString, { getLLStickeringString } from '$lib/stickering';
	import type { AlgorithmSelection } from '$lib/types/caseState';
	import type { GroupId } from '$lib/types/group';
	import type { Side } from '$lib/types/Side';
	import type { StickerColor } from '$lib/types/stickering';
	import type { Auf } from '$lib/types/trainCase';
	import { concatenateAuf } from '$lib/utils/addAuf';
	import { simplifyAlg } from '$lib/utils/simplifyAlg';
	import { onMount, onDestroy } from 'svelte';
	import { Eye, EyeOff } from '@lucide/svelte';
	import { setupTwistyPlayerClickHandlers } from '$lib/utils/twistyPlayerClickHandler';
	import type { HintStickering } from '$lib/types/globalState';
	import { checkSolveState } from '$lib/utils/checkSolvedState';
	import { bluetoothState } from '$lib/bluetooth/store.svelte';

	// ── Cubedex orientation constants (precomputed from THREE.Euler) ─────────
	// HOME_ORIENTATION = Euler(15°, -5°, 0): natural gyro resting position.
	// When the user holds the cube in the calibrated pose, this is what they see.
	const HW = 0.99051,
		HX = 0.1304,
		HY = -0.04325,
		HZ = 0.005694;
	// DR_LOCK_ORIENTATION = Euler(15°, -20°, 0): static view when gyro is off.
	const DW = 0.97638,
		DX = 0.12853,
		DY = -0.17216,
		DZ = 0.022669;

	interface Props {
		groupId?: GroupId;
		caseId?: number;
		scrambleSelection?: number;
		algorithmSelection?: AlgorithmSelection;
		customAlgorithm?: CustomAlgorithm;
		auf?: Auf;
		side: Side;
		crossColor: StickerColor;
		frontColor: StickerColor;
		stickering?: HintStickering;
		controlPanel?: 'bottom-row' | 'none';
		experimentalDragInput?: 'auto' | 'none';
		scramble?: string;
		alg?: string;
		onclick?: () => void;
		class?: string;
		hidePlayer?: boolean;
		showVisibilityToggle?: boolean;
		tempoScale?: number;
		showAlg?: boolean;
		onPhaseSolved?: () => void;
		onCubeSolved?: () => void;
		backView?: 'none' | 'floating';
		backViewEnabled?: boolean;
		movesAdded?: string;
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
		experimentalDragInput = 'none',
		scramble = $bindable(''),
		alg = $bindable(''),
		onclick,
		class: extraClass = '',
		hidePlayer = $bindable(false),
		showVisibilityToggle = false,
		tempoScale = 1,
		showAlg = true,
		onPhaseSolved,
		onCubeSolved,
		backView = 'none',
		backViewEnabled = false,
		movesAdded = $bindable('')
	}: Props = $props();

	let rawMovesAdded = $state('');
	const enableSolveCheck = $derived(!!(onPhaseSolved || onCubeSolved));

	let el: HTMLElement;
	let isPlayerInitialized = $state(false);
	let kpuzzle: any = null;
	let rafId: number | null = null;
	// Set to true to make the rAF loop re-fetch the puzzle object (e.g. after case change)
	let forceRefresh = true;
	let cleanupClickHandlers: (() => void) | null = null;

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
			if (showAlg) {
				alg = simplifyAlg(newAlg);
			} else {
				alg = '';
			}
		}
	});

	$effect(() => {
		void groupId;
		void caseId;
		void side;
		void scrambleSelection;
		void algorithmSelection;
		void customAlgorithm;
		void auf;
		void crossColor;
		void frontColor;

		if (el && isPlayerInitialized) {
			movesAdded = '';
			rawMovesAdded = '';

			setTimeout(() => {
				const player = el as any;
				if (player) {
					player.alg = alg || '';
					player.experimentalSetupAlg = [setupRotation, scramble].join(' ');
					jumpToStart();
					forceRefresh = true;
				}
			}, 10);
		}
	});

	const setupRotation = $derived(getRotationAlg(crossColor, frontColor));

	const isOELL = $derived(groupId === 'oll2Look' && [1, 2, 3].includes(caseId ?? -1));

	const stepId = $derived(
		groupId?.toLowerCase().includes('oll')
			? isOELL
				? 'OLL_CROSS'
				: 'OLL'
			: groupId?.toLowerCase().includes('pll')
				? 'PLL'
				: 'F2L'
	);

	let stickeringString = $derived(
		stepId === 'F2L'
			? stickering === 'masked' && staticData
				? getStickeringString(staticData.pieceToHide, side, crossColor, frontColor)
				: undefined
			: getLLStickeringString(crossColor, isOELL)
	);

	export function getElement() {
		return el as HTMLElement;
	}

	export function jumpToStart() {
		if (el) {
			const player = el as any;
			if (typeof player.jumpToStart === 'function') player.jumpToStart();
		}
	}

	export function jumpToEnd() {
		if (el) {
			const player = el as any;
			if (typeof player.jumpToEnd === 'function') player.jumpToEnd();
		}
	}

	export function play() {
		if (el) {
			const player = el as any;
			if (typeof player.play === 'function') player.play();
		}
	}

	export function pause() {
		if (el) {
			const player = el as any;
			if (typeof player.pause === 'function') player.pause();
		}
	}

	export function togglePlay() {
		if (el) {
			const player = el as any;
			if (typeof player.togglePlay === 'function') player.togglePlay();
		}
	}

	export function reset() {
		if (el) {
			const player = el as any;
			player.alg = alg || '';
			jumpToStart();
		}
		movesAdded = '';
		rawMovesAdded = '';
	}

	function toggleVisibility() {
		hidePlayer = !hidePlayer;
	}

	export async function addMove(move: string, rawMove?: string) {
		if (el) {
			const player = el as any;
			if (player.experimentalAddMove) {
				if (move !== '') {
					player.experimentalAddMove(move);
					movesAdded += (movesAdded ? ' ' : '') + move;
				}

				if (rawMove !== '') {
					const actualRawMove = rawMove ?? move;
					if (actualRawMove !== '') {
						rawMovesAdded += (rawMovesAdded ? ' ' : '') + actualRawMove;
					}
				}

				if (stickeringString) {
					player.experimentalStickeringMaskOrbits = stickeringString;
				}

				if (enableSolveCheck && kpuzzle && staticData) {
					await checkSolveState(
						{ kpuzzle },
						scramble,
						rawMovesAdded,
						staticData.pieceToHide,
						side,
						onPhaseSolved,
						onCubeSolved,
						stepId
					);
				}
			}
		}
	}

	// ── Quaternion helpers ────────────────────────────────────────────────────

	// Left-multiply by HOME_ORIENTATION: result = HOME * q
	// Returns [w, x, y, z]
	function mulHome(
		rw: number,
		rx: number,
		ry: number,
		rz: number
	): [number, number, number, number] {
		return [
			HW * rw - HX * rx - HY * ry - HZ * rz,
			HW * rx + HX * rw + HY * rz - HZ * ry,
			HW * ry - HX * rz + HY * rw + HZ * rx,
			HW * rz + HX * ry - HY * rx + HZ * rw
		];
	}

	// Slerp pq toward (tw, tx, ty, tz) at alpha=0.25, in-place on a THREE.Quaternion-like object
	function slerpInPlace(pq: any, tw: number, tx: number, ty: number, tz: number) {
		const dot = pq.x * tx + pq.y * ty + pq.z * tz + pq.w * tw;
		const sign = dot < 0 ? -1 : 1;
		const alpha = 0.25;
		pq.x += alpha * (sign * tx - pq.x);
		pq.y += alpha * (sign * ty - pq.y);
		pq.z += alpha * (sign * tz - pq.z);
		pq.w += alpha * (sign * tw - pq.w);
		const m = Math.sqrt(pq.x * pq.x + pq.y * pq.y + pq.z * pq.z + pq.w * pq.w);
		if (m > 0) {
			pq.x /= m;
			pq.y /= m;
			pq.z /= m;
			pq.w /= m;
		}
	}

	onMount(async () => {
		await import('cubing/twisty');

		setTimeout(() => {
			if (el) {
				isPlayerInitialized = true;
				try {
					const player = el as any;
					if (player.experimentalModel?.kpuzzle) {
						player.experimentalModel.kpuzzle.addFreshListener((kp: any) => {
							kpuzzle = kp;
						});
					}
					if (onclick) {
						const { cleanup } = setupTwistyPlayerClickHandlers(player, onclick);
						cleanupClickHandlers = cleanup;
					}
				} catch (e) {
					console.warn('Could not set up player listeners:', e);
				}
			}
		}, 100);

		// ── Cubedex-style rAF orientation loop ───────────────────────────────
		// Always runs. When gyro is on: puzzle quaternion = HOME * conjugate(ref) * raw.
		// When gyro is off: puzzle slerps to DR_LOCK_ORIENTATION for a natural static view.
		let puzzleObj: any = null;
		let vantage: any = null;

		async function animateOrientation() {
			const player = el as any;
			if (!player) {
				rafId = null;
				return;
			}

			if (!puzzleObj || !vantage || forceRefresh) {
				try {
					const vantages = await player.experimentalCurrentVantages();
					vantage = [...vantages][0] ?? null;
					puzzleObj = await player.experimentalCurrentThreeJSPuzzleObject();
					forceRefresh = false;
				} catch {
					puzzleObj = null;
					vantage = null;
				}
			}

			if (puzzleObj && vantage) {
				const liveQ = bluetoothState.gyroQuatRef.current;
				if (bluetoothState.gyroEnabled && liveQ) {
					// display = HOME_ORIENTATION * conjugate(ref) * raw
					const [tw, tx, ty, tz] = mulHome(liveQ.w, liveQ.x, liveQ.y, liveQ.z);
					slerpInPlace(puzzleObj.quaternion, tw, tx, ty, tz);
				} else {
					slerpInPlace(puzzleObj.quaternion, DW, DX, DY, DZ);
				}
				vantage.render?.();
			}

			rafId = requestAnimationFrame(animateOrientation);
		}

		rafId = requestAnimationFrame(animateOrientation);
	});

	onDestroy(() => {
		if (cleanupClickHandlers) cleanupClickHandlers();
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	});
</script>

<div class={wrapperClass}>
	{#if onclick && hidePlayer}
		<div
			role="button"
			tabindex="0"
			class="absolute inset-0 z-10 cursor-pointer"
			{onclick}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onclick?.();
				}
			}}
			aria-label="Next case"
		></div>
	{/if}

	<twisty-player
		style:width="100%"
		style:height="100%"
		style:opacity={hidePlayer ? '0' : '1'}
		style:pointer-events={hidePlayer ? 'none' : 'auto'}
		bind:this={el}
		puzzle="3x3x3"
		{alg}
		experimental-setup-alg={[setupRotation, scramble].join(' ')}
		camera-latitude={0}
		camera-longitude={0}
		experimental-stickering-mask-orbits={stickeringString}
		experimental-stickering={stepId !== 'F2L' ? stepId : undefined}
		control-panel={controlPanel}
		experimental-drag-input={experimentalDragInput}
		background="none"
		hint-facelets={backView}
		back-view={backViewEnabled ? 'top-right' : 'none'}
		viewer-link="none"
		camera-distance="4.7"
		tempo-scale={tempoScale}
	></twisty-player>

	{#if showVisibilityToggle}
		<button
			type="button"
			onclick={toggleVisibility}
			class="hover:bg-opacity-90 absolute top-1 left-1 z-20 rounded-full p-2 text-primary-600 transition-all duration-200"
			title={hidePlayer ? 'Show Cube' : 'Hide Cube'}
			aria-label={hidePlayer ? 'Show Cube' : 'Hide Cube'}
		>
			{#if hidePlayer}
				<Eye class="size-6" strokeWidth={3} />
			{:else}
				<EyeOff class="size-6" strokeWidth={3} />
			{/if}
		</button>
	{/if}
</div>
