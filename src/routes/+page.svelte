<!-- App.svelte -->
<script lang="ts">
	import Icon from "@iconify/svelte";
	import directoryJson from "./directory.json";

	interface DirectoryItem {
		name: string;
		type: "file" | "directory";
		children: DirectoryItem[];
		properties?: {
			[key: string]: string;
		};
	}

	const directory: DirectoryItem = JSON.parse(JSON.stringify(directoryJson));

	const fileIcons = {
		file: "mdi:file",
		directory: "mdi:folder",
		no: "bi:question",
	};

	let currentPath: string[] = [];
	let currentDirectory = directory;

	function navigateToPath(path: string[]) {
		let currentDirectory = directory;
		for (const pathPart of path) {
			const child = currentDirectory.children.find(
				(child) => child.name === pathPart
			);
			if (!child) {
				throw new Error("Path not found");
			}
			currentDirectory = child;
		}
		return currentDirectory;
	}

	function navigateToParent() {
		currentPath = currentPath.slice(0, currentPath.length - 1);
		currentDirectory = navigateToPath(currentPath);
	}

	function navigateBack() {
		if (currentPath.length > 0) {
			navigateToParent();
		}
	}

	function createDirectory() {
		creatingDir = true;
	}

	$: console.log(currentPath, currentPath.join("/"));

	let creatingDir = false;
	let creatingDirName = "";

	let openFileUrl = "";
</script>

<div class="h-screen p-6">
	<p class="p-2 px-4 bg-gray-800 border border-gray-700 rounded-md">
		<button
			on:click={() => {
				currentPath = [];
				currentDirectory = directory;
			}}
			class="p-1 mr-2 rounded-md hover:bg-gray-700 active:bg-gray-600"
		>
			📁
		</button>

		{#each currentPath as pathItem}
			<span class="font-mono">
				{`>`}
			</span>

			<button
				class="p-1 mr-2 rounded-md hover:bg-gray-700 active:bg-gray-600"
				on:click={() => {
					currentPath = currentPath.slice(0, currentPath.indexOf(pathItem) + 1);
					currentDirectory = navigateToPath(currentPath);
				}}
			>
				{pathItem}
			</button>
		{/each}
	</p>

	<button
		on:click={navigateBack}
		class="p-1 mt-2 rounded-md hover:bg-gray-700 active:bg-gray-600"
	>
		Back
	</button>

	{#if creatingDir}
		<div class="inline-flex">
			<input
				type="text"
				class="p-1 mt-2 bg-gray-700 rounded-md outline-none focus:ring-1 hover:bg-gray-800 active:bg-gray-600"
				bind:value={creatingDirName}
			/>
			<button
				on:click={() => {
					/* If the directory already exists, don't create it */
					if (
						currentDirectory.children.find(
							(child) => child.name === creatingDirName
						) ||
						creatingDirName.trim().length === 0
					) {
						return;
					}

					currentDirectory.children.push({
						name: creatingDirName,
						type: "directory",
						children: [],
					});
					creatingDir = false;
					currentDirectory = navigateToPath(currentPath);
					creatingDirName = "";
				}}
				class="p-1 mt-2 rounded-md hover:bg-gray-700 active:bg-gray-600"
			>
				Create
			</button>

			<button
				on:click={() => {
					creatingDir = false;
					creatingDirName = "";
				}}
				class="p-1 mt-2 rounded-md hover:bg-gray-700 active:bg-gray-600"
			>
				Cancel
			</button>
		</div>
	{:else}
		<button
			on:click={createDirectory}
			class="p-1 mt-2 rounded-md hover:bg-gray-700 active:bg-gray-600"
		>
			Create Directory
		</button>
	{/if}

	<div class="explorer-top">
		{#each currentDirectory.children as child, i}
			<div>
				{#if child.type === "directory"}
					<button
						on:click={() => {
							currentPath = [...currentPath, child.name];
							currentDirectory = navigateToPath(currentPath);
						}}
						class="item hover:bg-gray-700 active:bg-gray-600 {i <
						currentDirectory.children.length - 1
							? 'border-b-0'
							: ''}"
					>
						📁 {child.name}
					</button>
				{:else if child.type === "file"}
					<button
						class="item hover:bg-gray-700 active:bg-gray-600 {i <
						currentDirectory.children.length - 1
							? 'border-b-0'
							: ''}"
						on:click={() => {
							if (child.properties?.contentURL) {
								openFileUrl = child.properties.contentURL;
								console.log(openFileUrl);
							} else {
								openFileUrl = "";
							}
						}}
					>
						<span class="inline">
							<Icon
								icon={(() => {
									//@ts-ignore
									return fileIcons[child.name.split(".").pop()] || fileIcons.no;
								})()}
								class="inline-block w-4 h-4 mr-2"
							/>
						</span>

						{child.name}
					</button>
				{/if}
			</div>
		{/each}
	</div>
</div>

{#if openFileUrl}
	<div
		class="fixed p-4 text-white transform -translate-x-1/2 -translate-y-1/2 bg-gray-700 rounded-md shadow-md top-1/2 left-1/2"
	>
		<p>
			{openFileUrl}

			<button
				on:click={() => {
					openFileUrl = "";
				}}
			>
				Close
			</button>
		</p>

		{#await fetch(openFileUrl)}
			<p>Loading...</p>
		{:then response}
			{#if response.ok}
				{#await response.text()}
					<p>Loading...</p>
				{:then text}
					<pre
						class="p-2 mt-2 text-white bg-gray-800 border border-gray-700 rounded-md max-h-[80vh] max-w-[80vw] overflow-y-auto"><code
							class="text-sm">{text}</code
						></pre>
				{:catch error}
					<p>{error.message}</p>
				{/await}
			{:else}
				<p>Failed to load file</p>
			{/if}
		{:catch error}
			<p>{error.message}</p>
		{/await}
	</div>
{/if}

<style>
	:global(body) {
		@apply text-white bg-gray-900;
	}

	.item {
		@apply w-full p-2 text-left border border-gray-800;
	}
</style>
