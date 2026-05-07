<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { timerState } from '$lib/timerState.svelte';
	import { bluetoothState } from '$lib/bluetooth/store.svelte';
	import { globalState } from '$lib/globalState.svelte';
	import { sessionState } from '$lib/sessionState.svelte';
	import TwistyPlayer from '../TwistyPlayer.svelte';
	import TimesList from './TimesList.svelte';
	import {
		Timer,
		Square,
		SkipForward,
		Settings,
		ArrowLeft,
		ArrowRight,
		Plus,
		ChevronDown,
		FolderCog,
		Star,
		Bluetooth
	} from '@lucide/svelte';
	import { formatTime } from '$lib/utils/statistics';
	import { Button, Dropdown, DropdownItem, DropdownHeader, DropdownGroup } from 'flowbite-svelte';
	import type { CfopStep } from '$lib/types/timer';
	import SessionSettingsModal from '../Session/SessionSettingsModal.svelte';
	import SessionManagerModal from '../Session/SessionManagerModal.svelte';

	const SUBSCRIBER_ID = 'free-timer';

	// --- TwistyPlayer props ---
	let scramble = $state('');
	let alg = $state('');
	let twistyPlayerRef: any = $state();

	let showSettings = $state(false);

	// Session toolbar state
	let showSessionSettings = $state(false);
	let isNewSession = $state(false);
	let showSessionManager = $state(false);

	// --- Load initial scramble ---
	onMount(async () => {
		if (!timerState.scrambleLoaded) {
			await timerState.loadNewScramble();
		}
		// Subscribe to smart cube moves
		bluetoothState.subscribeToMoves(SUBSCRIBER_ID, handleCubeMove, 100);
	});

	function handleCubeMove(move: string) {
		const m = move.trim();
		if (!m) return;

		if (twistyPlayerRef) {
			twistyPlayerRef.addMove(m, m);
		}

		timerState.onFaceMove();
	}

	// --- Solve detected (cube is solved after scramble) ---
	function onCubeSolved() {
		if (timerState.isTimerRunning) {
			timerState.stopTimer();
			timerState.loadNewScramble();
		}
	}

	// --- F2L solved callback (for CFOP step detection) ---
	function onPhaseSolved() {
		if (timerState.cfopAutoDetect) {
			timerState.setCurrentStep('F2L');
		}
	}

	// --- Actions ---
	async function onNewScramble() {
		if (timerState.isTimerRunning) {
			timerState.stopTimer();
		}
		timerState.resetTimer();
		await timerState.loadNewScramble();
	}

	function onResetTimer() {
		timerState.resetTimer();
	}

	// --- Formatted timer display ---
	let formattedTime = $derived.by(() => {
		const cs = timerState.elapsedCentiseconds;
		const seconds = Math.floor(cs / 100);
		const centiseconds = cs % 100;
		return `${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
	});

	// Step label for display
	let stepLabel = $derived.by(() => {
		if (!timerState.cfopAutoDetect) return '';
		const s = timerState.currentStep;
		if (s === 'unknown') return '';
		return s;
	});

	// Cleanup
	onDestroy(() => {
		bluetoothState.unsubscribeFromMoves(SUBSCRIBER_ID);
		if (timerState.isTimerRunning) {
			timerState.stopTimer();
		}
	});
</script>

<div class="flex h-full flex-col overflow-hidden">
	<!-- Session toolbar -->
	<div class="shrink-0 border-b border-gray-200 px-4 py-1.5 dark:border-gray-700">
		<div class="flex items-center justify-center gap-2">
			<div class="relative">
				<Button
					color="light"
					class="flex items-center gap-2 border-gray-300 bg-white !px-3 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
				>
					<span class="max-w-[120px] truncate"
						>{sessionState.activeSession?.name || 'Default Session'}</span
					>
					<ChevronDown size={14} class="text-gray-500 dark:text-gray-400" />
				</Button>
				<Dropdown
					class="w-72 max-w-[95vw] rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-700"
				>
					<DropdownHeader
						class="border-b border-gray-200 bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
					>
						Switch Session
					</DropdownHeader>
					<DropdownGroup class="max-h-48 overflow-y-auto">
						{#each sessionState.sessions
							.filter((s) => !s.archived && !s.deletedAt)
							.sort((a, b) => {
								if (a.favorite && !b.favorite) return -1;
								if (!a.favorite && b.favorite) return 1;
								return (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0);
							}) as session (session.id)}
							<DropdownItem
								class="flex w-full items-center justify-between gap-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
								onclick={() => sessionState.setActiveSession(session.id)}
							>
								<div class="flex items-center gap-2">
									{#if session.favorite}
										<Star size={12} class="shrink-0 text-yellow-500" fill="currentColor" />
									{/if}
									<span class="truncate">{session.name || 'Unnamed'}</span>
								</div>
								{#if session.id === sessionState.activeSessionId}
									<span class="h-2 w-2 shrink-0 rounded-full bg-primary-600"></span>
								{/if}
							</DropdownItem>
						{/each}
					</DropdownGroup>
					<DropdownItem
						class="w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-600"
						onclick={() => {
							isNewSession = true;
							showSessionSettings = true;
						}}
					>
						<div
							class="flex w-full items-center gap-2 font-semibold text-primary-600 dark:text-primary-400"
						>
							<Plus size={16} /> Create New Session
						</div>
					</DropdownItem>
					<DropdownItem
						class="w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-600"
						onclick={() => (showSessionManager = true)}
					>
						<div class="flex w-full items-center gap-2 text-gray-600 dark:text-gray-400">
							<FolderCog size={16} /> Manage Sessions
						</div>
					</DropdownItem>
				</Dropdown>
			</div>
			<Button
				color="light"
				size="sm"
				class="border-gray-300 bg-white !p-2 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
				onclick={() => {
					showSessionSettings = true;
					isNewSession = false;
				}}
			>
				<Settings size={16} class="text-gray-600 dark:text-gray-300" />
			</Button>
		</div>
	</div>

	<!-- Scramble bar — matches training view style with ← → navigation -->
	<div class="my-2 flex items-center justify-center gap-0 sm:gap-2 md:my-4 md:gap-4">
		<button
			type="button"
			class="btn-icon-transparent disabled:opacity-30"
			onclick={() => timerState.goToPreviousScramble()}
			disabled={!timerState.canGoBack}
			title="Previous scramble"
		>
			<ArrowLeft class="size-8 text-primary-600 md:size-12" />
		</button>
		{#if timerState.scrambleLoading}
			<div class="min-w-48 text-center font-mono text-sm text-gray-400">Loading scramble...</div>
		{:else}
			<div
				class="min-w-48 text-center font-mono text-2xl font-semibold select-all md:text-3xl dark:text-white"
			>
				{timerState.currentScramble || '—'}
			</div>
		{/if}
		<button
			type="button"
			class="btn-icon-transparent disabled:opacity-30"
			onclick={() => timerState.goToNextScramble()}
			disabled={!timerState.canGoForward}
			title="Next scramble"
		>
			<ArrowRight class="size-8 text-primary-600 md:size-12" />
		</button>
	</div>

	<!-- Main area: cube + times list -->
	<div class="flex flex-1 flex-col overflow-hidden md:flex-row">
		<!-- Cube view -->
		<div class="relative flex flex-1 items-center justify-center p-2">
			<TwistyPlayer
				bind:this={twistyPlayerRef}
				bind:scramble
				bind:alg
				side="right"
				crossColor="white"
				frontColor="red"
				stickering="full"
				controlPanel="bottom-row"
				experimentalDragInput="auto"
				class="aspect-square w-full max-w-md"
				showAlg={false}
				showVisibilityToggle={false}
				{onCubeSolved}
				{onPhaseSolved}
			/>
		</div>

		<!-- Times list (right panel) -->
		<div
			class="shrink-0 border-t border-gray-200 px-2 py-2 md:w-64 md:border-t-0 md:border-l dark:border-gray-700"
		>
			<TimesList />
		</div>
	</div>

	<!-- Timer display + controls -->
	<div class="shrink-0 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
		<div class="flex items-center justify-center gap-4">
			<!-- Settings toggle -->
			<button
				type="button"
				onclick={() => (showSettings = !showSettings)}
				class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
				title="Timer Settings"
				aria-label="Timer Settings"
			>
				<Settings class="size-5" />
			</button>

			<!-- Timer display with CFOP step label -->
			<div class="flex flex-col items-center">
				{#if stepLabel}
					<span class="text-xs font-medium text-primary-600">{stepLabel}</span>
				{/if}
				<div
					class="min-w-[140px] rounded-lg bg-gray-100 px-6 py-2 text-center font-mono text-4xl font-bold tabular-nums dark:bg-gray-800 dark:text-white"
					class:text-green-500={timerState.isTimerRunning}
				>
					{formattedTime}
				</div>
			</div>

			<!-- Reset timer button -->
			<button
				type="button"
				onclick={onResetTimer}
				class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
				title="Reset Timer"
			>
				<Square class="size-5" />
			</button>
		</div>

		<!-- Settings panel -->
		{#if showSettings}
			<div
				class="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="flex items-center justify-between">
					<div>
						<div class="text-sm font-medium text-gray-900 dark:text-white">CFOP Step Detection</div>
						<div class="text-xs text-gray-500">Label solves with detected CFOP phase</div>
					</div>
					<button
						type="button"
						onclick={() => timerState.toggleCfopAutoDetect()}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
						class:bg-primary-600={timerState.cfopAutoDetect}
						class:bg-gray-300={!timerState.cfopAutoDetect}
						role="switch"
						aria-checked={timerState.cfopAutoDetect}
						aria-label="Toggle CFOP step detection"
					>
						<span
							class="inline-block size-4 transform rounded-full bg-white transition-transform"
							class:translate-x-6={timerState.cfopAutoDetect}
							class:translate-x-1={!timerState.cfopAutoDetect}
						></span>
					</button>
				</div>
				<!-- New scramble button -->
				<div class="mt-3 flex justify-center">
					<button
						type="button"
						onclick={onNewScramble}
						class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<SkipForward class="size-3.5" />
						New Scramble
					</button>
				</div>
			</div>
		{/if}

		<!-- Bluetooth status -->
		<div class="mt-2 text-center text-xs text-gray-400">
			{#if bluetoothState.isConnected}
				<span class="text-green-500">●</span> Connected to {bluetoothState.deviceName || 'cube'}
			{:else}
				<span class="text-gray-300">○</span> No cube connected — connect in Training mode first
			{/if}
		</div>
	</div>
</div>

<SessionSettingsModal bind:open={showSessionSettings} />
<SessionManagerModal bind:open={showSessionManager} />
