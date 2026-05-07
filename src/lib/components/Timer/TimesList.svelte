<script lang="ts">
	import { timerState } from '$lib/timerState.svelte';
	import { sessionState } from '$lib/sessionState.svelte';
	import type { TimerSolve } from '$lib/types/timer';
	import {
		formatTime,
		calculateAo5,
		calculateAo12,
		calculateBestTime,
		calculateMean
	} from '$lib/utils/statistics';
	import { flip } from 'svelte/animate';
	import { Trash2 } from '@lucide/svelte';

	// Filter solves by active session
	let sessionSolves = $derived(
		sessionState.activeSessionId
			? timerState.solves.filter((s) => s.sessionId === sessionState.activeSessionId)
			: timerState.solves
	);

	// Convert timer solves to Solve-like objects for statistics functions
	let statSolves = $derived(
		sessionSolves.map((s): any => ({
			time: s.penalty === 'DNF' ? undefined : s.penalty === '+2' ? s.time + 200 : s.time,
			timestamp: s.timestamp
		}))
	);

	let effectiveTimes = $derived(
		sessionSolves.map((s) =>
			s.penalty === 'DNF' ? undefined : s.penalty === '+2' ? s.time + 200 : s.time
		)
	);

	let ao5 = $derived(calculateAo5(statSolves));
	let ao12 = $derived(calculateAo12(statSolves));
	let best = $derived(calculateBestTime(statSolves));
	let mean = $derived(calculateMean(statSolves));

	// Rolling Ao5 per solve
	let rollingAo5 = $derived.by(() => {
		const result: (number | undefined)[] = [];
		const times: number[] = [];
		for (let i = 0; i < sessionSolves.length; i++) {
			const t = effectiveTimes[i];
			if (t !== undefined) times.push(t);
			if (times.length < 5) {
				result.push(undefined);
			} else {
				const last5 = times.slice(-5);
				const sorted = [...last5].sort((a, b) => a - b);
				const avg = Math.round((sorted[1] + sorted[2] + sorted[3]) / 3);
				result.push(avg);
			}
		}
		return result;
	});

	function onTogglePlus2(solve: TimerSolve) {
		timerState.setPenalty(solve.id, solve.penalty === '+2' ? '' : '+2');
	}

	function onToggleDNF(solve: TimerSolve) {
		timerState.setPenalty(solve.id, solve.penalty === 'DNF' ? '' : 'DNF');
	}

	function onDelete(solve: TimerSolve) {
		timerState.removeSolve(solve.id);
	}

	function onClearAll() {
		if (confirm('Clear all timer solves for this session?')) {
			const ids = sessionSolves.map((s) => s.id);
			for (const id of ids) timerState.removeSolve(id);
		}
	}
</script>

<div class="flex h-full flex-col overflow-hidden text-sm">
	<!-- Stats summary -->
	<div class="mb-2 shrink-0 space-y-0.5 rounded-lg bg-gray-100 px-2 py-1.5 dark:bg-gray-800">
		<div class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600 dark:text-gray-400">
			<span
				>best: <strong class="text-gray-900 dark:text-white"
					>{best !== undefined ? formatTime(best) : '-'}</strong
				></span
			>
			<span
				>ao5: <strong class="text-gray-900 dark:text-white"
					>{ao5 !== undefined ? formatTime(ao5) : '-'}</strong
				></span
			>
			<span
				>ao12: <strong class="text-gray-900 dark:text-white"
					>{ao12 !== undefined ? formatTime(ao12) : '-'}</strong
				></span
			>
			<span
				>mean: <strong class="text-gray-900 dark:text-white"
					>{mean !== undefined ? formatTime(mean) : '-'}</strong
				></span
			>
		</div>
	</div>

	<!-- Solve list -->
	<div class="flex-1 overflow-y-auto">
		{#if sessionSolves.length === 0}
			<div class="py-6 text-center text-xs text-gray-400">
				No solves yet. Connect a smart cube to start.
			</div>
		{:else}
			<ul class="space-y-0.5">
				{#each sessionSolves.toReversed() as solve, i (solve.id)}
					{@const idx = sessionSolves.length - i}
					<li
						class="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						animate:flip={{ duration: 200 }}
					>
						<span class="w-5 text-right text-xs text-gray-400">{idx}</span>
						<span
							class="min-w-0 flex-1 text-right font-mono text-sm"
							class:text-red-500={solve.penalty === 'DNF'}
							class:text-amber-500={solve.penalty === '+2'}
						>
							{solve.penalty === 'DNF'
								? 'DNF'
								: formatTime(solve.penalty === '+2' ? solve.time + 200 : solve.time)}
						</span>
						{#if solve.cfopStep && solve.cfopStep !== 'unknown'}
							<span class="w-8 text-center text-[10px] font-medium text-primary-600"
								>{solve.cfopStep}</span
							>
						{/if}
						<span class="w-14 text-right text-xs text-gray-400">
							{rollingAo5[idx - 1] !== undefined ? formatTime(rollingAo5[idx - 1]!) : '-'}
						</span>
						<!-- Penalty buttons -->
						<button
							type="button"
							onclick={() => onTogglePlus2(solve)}
							class="rounded px-1 text-xs font-medium transition-colors"
							class:text-amber-600={solve.penalty === '+2'}
							class:text-gray-400={solve.penalty !== '+2'}
							class:hover:bg-gray-200={true}
							class:dark:hover:bg-gray-700={true}
							title="+2">+2</button
						>
						<button
							type="button"
							onclick={() => onToggleDNF(solve)}
							class="rounded px-1 text-xs font-medium transition-colors"
							class:text-red-600={solve.penalty === 'DNF'}
							class:text-gray-400={solve.penalty !== 'DNF'}
							class:hover:bg-gray-200={true}
							class:dark:hover:bg-gray-700={true}
							title="DNF">DNF</button
						>
						<button
							type="button"
							onclick={() => onDelete(solve)}
							class="rounded px-0.5 text-gray-400 transition-colors hover:text-red-500"
							title="Delete"
						>
							<Trash2 class="size-3" />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Clear all -->
	{#if sessionSolves.length > 0}
		<button
			type="button"
			onclick={onClearAll}
			class="mt-1 shrink-0 rounded py-1 text-center text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
		>
			Clear all
		</button>
	{/if}
</div>
