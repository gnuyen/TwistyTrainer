<script lang="ts">
	import { globalState } from '$lib/globalState.svelte';
	import { Button } from 'flowbite-svelte';
	import { getNumberOfSelectedCases } from '$lib/trainCaseQueue.svelte';

	let buttonText = $derived(
		globalState.view == 'select'
			? `Start Training (${getNumberOfSelectedCases()} cases)`
			: 'Select Cases'
	);

	// Only show the button on select/train views, not timer view
	let isVisible = $derived(globalState.view !== 'timer');

	function onToggleView() {
		if (globalState.view == 'select') {
			globalState.view = 'train';
		} else {
			globalState.view = 'select';
		}
	}
</script>

{#if isVisible}
	<Button
		onclick={onToggleView}
		class="fixed right-4 bottom-4 z-50 text-base sm:text-lg md:text-xl 2xl:text-2xl"
	>
		{buttonText}
	</Button>
{/if}
