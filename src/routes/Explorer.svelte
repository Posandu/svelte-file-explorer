<!-- Explorer.svelte -->
<script lang="ts">
	import { onMount } from "svelte";

    interface DirectoryItem {
        name: string;
        type: "file" | "directory";
        children: DirectoryItem[];
        properties?: {
            [key: string]: string;
        };
    }

	interface ExplorerProps {
		directory: DirectoryItem;
	}

	export let directory: DirectoryItem;

	let currentPath: string[] = [];

	onMount(() => {
		currentPath.push(directory.name);
	});

	function openFolder(folder: DirectoryItem) {
		currentPath.push(folder.name);
	}

	function goBack() {
		currentPath.pop();
	}
</script>

<div>
	<h2>Current Path: {currentPath.join("/")}</h2>

	{#if currentPath.length > 1}
		<button on:click={goBack}>Back</button>
	{/if}

	<ul>
		{#each directory.children as item}
			<button on:click={() => openFolder(item)}>
				{item.name}
			</button>
		{/each}
	</ul>
</div>
