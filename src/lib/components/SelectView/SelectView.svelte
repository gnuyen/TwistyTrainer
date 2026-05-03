<script lang="ts">
	import { Tabs, TabItem } from 'flowbite-svelte';
	import GroupComponent from '$lib/components/SelectView/GroupComponent.svelte';
	import { GROUP_DEFINITIONS, STEP_IDS, STEP_TO_GROUPS, type GroupId, type StepId } from '$lib/types/group';
	import { globalState } from '$lib/globalState.svelte';

	let selectedStep: StepId = $state(globalState.selectedStep || 'F2L');
	let selectedGroup: GroupId = $state(globalState.selectedGroup || 'basic');

	$effect(() => {
		globalState.selectedStep = selectedStep;

		// Ensure selectedGroup is valid for the selectedStep
		const groupsInStep = STEP_TO_GROUPS[selectedStep];
		if (!groupsInStep.includes(selectedGroup)) {
			selectedGroup = groupsInStep[0];
		}

		globalState.selectedGroup = selectedGroup;
	});
</script>

<Tabs
	bind:selected={selectedStep}
	tabStyle="underline"
	classes={{
		content: 'p-0 bg-transparent mt-2'
	}}
>
	{#each STEP_IDS as stepId}
		<TabItem key={stepId}>
			{#snippet titleSlot()}
				<span class="text-xl font-bold md:text-2xl">{stepId}</span>
			{/snippet}
			
			<div class="mt-2">
				<Tabs
					bind:selected={selectedGroup}
					tabStyle="underline"
					classes={{
						content: 'p-0 bg-gray-50 rounded-lg dark:bg-gray-800 mt-0'
					}}
				>
					{#each STEP_TO_GROUPS[stepId] as groupId}
						<TabItem key={groupId}>
							{#snippet titleSlot()}
								<span class="text-base font-bold md:text-lg">{GROUP_DEFINITIONS[groupId].name}</span>
							{/snippet}
							<GroupComponent {groupId} />
						</TabItem>
					{/each}
				</Tabs>
			</div>
		</TabItem>
	{/each}
</Tabs>
