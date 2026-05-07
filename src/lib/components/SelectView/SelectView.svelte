<script lang="ts">
	import { Tabs, TabItem } from 'flowbite-svelte';
	import GroupComponent from '$lib/components/SelectView/GroupComponent.svelte';
	import { GROUP_DEFINITIONS, STEP_TO_GROUPS, type GroupId } from '$lib/types/group';
	import { globalState } from '$lib/globalState.svelte';
	import { untrack } from 'svelte';

	let selectedGroup: GroupId = $state(globalState.selectedGroup || 'basic');

	// Current step from globalState (set by navbar dropdown)
	let currentStep = $derived(globalState.selectedStep || 'F2L');
	let groupsInStep = $derived(STEP_TO_GROUPS[currentStep]);

	// Pull group changes from globalState
	$effect(() => {
		const group = globalState.selectedGroup;
		const validGroup = groupsInStep.includes(group) ? group : groupsInStep[0];
		untrack(() => {
			selectedGroup = validGroup;
		});
	});

	// Push group tab changes back to globalState
	$effect(() => {
		const group = selectedGroup;
		const validGroup = groupsInStep.includes(group) ? group : groupsInStep[0];
		if (group !== validGroup) {
			untrack(() => {
				selectedGroup = validGroup;
			});
		}
		globalState.selectedGroup = validGroup;
	});
</script>

{#key currentStep}
	<Tabs
		bind:selected={selectedGroup}
		tabStyle="underline"
		classes={{
			content: 'p-0 bg-gray-50 rounded-lg dark:bg-gray-800 mt-2'
		}}
	>
		{#each groupsInStep as groupId}
			<TabItem key={groupId}>
				{#snippet titleSlot()}
					<span class="text-base font-bold md:text-lg">{GROUP_DEFINITIONS[groupId].name}</span>
				{/snippet}
				<GroupComponent {groupId} />
			</TabItem>
		{/each}
	</Tabs>
{/key}
