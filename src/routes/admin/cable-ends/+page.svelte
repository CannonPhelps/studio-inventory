<script lang="ts">
	import { onMount } from 'svelte';

	interface CableEnd {
		id: number;
		name: string;
		type: string;
		gender: string;
		description?: string;
		color: string;
	}

	interface NewCableEnd {
		name: string;
		type: string;
		gender: string;
		description: string;
		color: string;
	}

	let cableEnds: CableEnd[] = [];
	let loading = true;
	let showAddModal = false;
	let editingCableEnd: CableEnd | null = null;

	let newCableEnd: NewCableEnd = {
		name: '',
		type: '',
		gender: '',
		description: '',
		color: '#000000'
	};

	const connectorTypes = [
		// Coaxial connectors
		'BNC', 'F-Type', 'N-Type', 'SMA', 'SMB', 'SMC',
		
		// Twisted pair connectors
		'RJ45', 'RJ11',
		
		// Fiber optic connectors
		'SC', 'ST', 'LC', 'FC',
		
		// Audio connectors
		'XLR', 'RCA', '1/4" TRS', '1/4" TS', '3.5mm', '6.35mm', 'DIN',
		
		// Video connectors
		'HDMI', 'DisplayPort', 'VGA', 'DVI',
		
		// USB connectors
		'USB-A', 'USB-B', 'USB-C',
		
		// Power connectors
		'Power', 'AC', 'DC', 'IEC', 'Edison', 'Molex',
		
		// Specialized connectors
		'Firewire', 'IEEE1394', 'Thunderbolt', 'eSATA', 'DB9', 'DB25',
		
		'Other'
	];

	const genderOptions = ['Male', 'Female'];

	onMount(async () => {
		await loadCableEnds();
	});

	async function loadCableEnds() {
		try {
			const response = await fetch('/api/cable-ends');
			const data = await response.json();
			
			if (response.ok) {
				cableEnds = data;
			} else {
				console.error('Failed to load cable ends:', data.error);
			}
		} catch (error) {
			console.error('Error loading cable ends:', error);
		} finally {
			loading = false;
		}
	}

	async function addCableEnd() {
		try {
			const response = await fetch('/api/cable-ends', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCableEnd)
			});

			if (response.ok) {
				await loadCableEnds();
				showAddModal = false;
				newCableEnd = {
					name: '',
					type: '',
					gender: '',
					description: '',
					color: '#000000'
				};
			}
		} catch (error) {
			console.error('Error adding cable end:', error);
		}
	}

	async function updateCableEnd() {
		if (!editingCableEnd) return;

		try {
			const response = await fetch(`/api/cable-ends/${editingCableEnd.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingCableEnd)
			});

			if (response.ok) {
				await loadCableEnds();
				editingCableEnd = null;
			}
		} catch (error) {
			console.error('Error updating cable end:', error);
		}
	}

	async function deleteCableEnd(id: number) {
		if (!confirm('Are you sure you want to delete this cable end?')) return;

		try {
			const response = await fetch(`/api/cable-ends/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadCableEnds();
			}
		} catch (error) {
			console.error('Error deleting cable end:', error);
		}
	}

	function startEdit(cableEnd: CableEnd) {
		editingCableEnd = { ...cableEnd };
	}

	function cancelEdit() {
		editingCableEnd = null;
	}

	function getTypeColor(type: string) {
		const colors: { [key: string]: string } = {
			'BNC': '#FF6B6B',
			'XLR': '#4ECDC4',
			'RCA': '#45B7D1',
			'HDMI': '#96CEB4',
			'RJ45': '#FFEAA7',
			'USB-A': '#DDA0DD',
			'USB-B': '#98D8C8',
			'USB-C': '#F7DC6F',
			'Power': '#BB8FCE',
			'AC': '#85C1E9',
			'DC': '#F8C471'
		};
		return colors[type] || '#6B7280';
	}
</script>

<svelte:head>
	<title>Cable Ends - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-primary">Cable Ends</h1>
			<p class="mt-2 text-muted-foreground">Manage cable connectors and terminations</p>
		</div>
		<button
			on:click={() => (showAddModal = true)}
			class="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Cable End
		</button>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
		</div>
	{:else if cableEnds.length === 0}
		<div class="text-center py-12">
			<div class="text-muted-foreground mb-4">
				<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<h3 class="text-lg font-medium text-primary mb-2">No cable ends yet</h3>
			<p class="text-muted-foreground mb-4">Add your first cable end to start building cable assemblies.</p>
			<button
				on:click={() => (showAddModal = true)}
				class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
			>
				Add Cable End
			</button>
		</div>
	{:else}
		<!-- Cable Ends Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each cableEnds as cableEnd}
				<div class="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
					<div class="p-6">
						<div class="flex items-start justify-between mb-4">
							<div class="flex-1">
								<div class="flex items-center mb-2">
									<div 
										class="w-3 h-3 rounded-full mr-2"
										style="background-color: {getTypeColor(cableEnd.type)}"
									></div>
									<h3 class="text-lg font-semibold text-primary">{cableEnd.name}</h3>
								</div>
								<p class="text-sm text-muted-foreground">{cableEnd.type} • {cableEnd.gender}</p>
							</div>
							<div class="flex items-center space-x-2">
								<button
									on:click={() => startEdit(cableEnd)}
									class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
									title="Edit"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</button>
								<button
									on:click={() => deleteCableEnd(cableEnd.id)}
									class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
									title="Delete"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>

						{#if cableEnd.description}
							<div class="mb-4 p-3 bg-muted/50 rounded-lg">
								<p class="text-sm text-primary">{cableEnd.description}</p>
							</div>
						{/if}

						<div class="flex items-center justify-between pt-4 border-t border-border">
							<div class="flex items-center text-sm text-muted-foreground">
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								Cable End
							</div>
							<span class="text-xs text-muted-foreground">ID: {cableEnd.id}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Add Cable End Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto border border-border">
			<h2 class="text-xl font-bold text-primary mb-4">Add New Cable End</h2>
			<form on:submit|preventDefault={addCableEnd} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-primary mb-1">Name *</label>
						<input
							id="name"
							type="text"
							bind:value={newCableEnd.name}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-primary placeholder:text-muted-foreground"
							placeholder="e.g., BNC Male"
							required
						/>
					</div>
					<div>
						<label for="type" class="block text-sm font-medium text-primary mb-1">Type *</label>
						<select
							id="type"
							bind:value={newCableEnd.type}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-primary"
							required
						>
							<option value="">Select connector type</option>
							{#each connectorTypes as connectorType}
								<option value={connectorType}>{connectorType}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="gender" class="block text-sm font-medium text-primary mb-1">Gender *</label>
						<select
							id="gender"
							bind:value={newCableEnd.gender}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-primary"
							required
						>
							<option value="">Select gender</option>
							{#each genderOptions as gender}
								<option value={gender}>{gender}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="color" class="block text-sm font-medium text-primary mb-1">Color</label>
						<input
							id="color"
							type="color"
							bind:value={newCableEnd.color}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
						/>
					</div>
				</div>

				<div>
					<label for="description" class="block text-sm font-medium text-primary mb-1">Description</label>
					<textarea
						id="description"
						bind:value={newCableEnd.description}
						class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-primary placeholder:text-muted-foreground"
						rows="3"
						placeholder="Additional details about this cable end"
					></textarea>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button
						type="button"
						on:click={() => (showAddModal = false)}
						class="px-4 py-2 text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
					>
						Add Cable End
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Cable End Modal -->
{#if editingCableEnd}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto border border-border">
			<h2 class="text-xl font-bold text-primary mb-4">Edit Cable End</h2>
			<form on:submit|preventDefault={updateCableEnd} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="editName" class="block text-sm font-medium text-primary mb-1">Name *</label>
						<input
							id="editName"
							type="text"
							bind:value={editingCableEnd.name}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-primary"
							required
						/>
					</div>
					<div>
						<label for="editType" class="block text-sm font-medium text-primary mb-1">Type *</label>
						<select
							id="editType"
							bind:value={editingCableEnd.type}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-primary"
							required
						>
							<option value="">Select connector type</option>
							{#each connectorTypes as connectorType}
								<option value={connectorType}>{connectorType}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="editGender" class="block text-sm font-medium text-primary mb-1">Gender *</label>
						<select
							id="editGender"
							bind:value={editingCableEnd.gender}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-primary"
							required
						>
							<option value="">Select gender</option>
							{#each genderOptions as gender}
								<option value={gender}>{gender}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="editColor" class="block text-sm font-medium text-primary mb-1">Color</label>
						<input
							id="editColor"
							type="color"
							bind:value={editingCableEnd.color}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
						/>
					</div>
				</div>

				<div>
					<label for="editDescription" class="block text-sm font-medium text-primary mb-1">Description</label>
					<textarea
						id="editDescription"
						bind:value={editingCableEnd.description}
						class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-primary"
						rows="3"
					></textarea>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button
						type="button"
						on:click={cancelEdit}
						class="px-4 py-2 text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
					>
						Update Cable End
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 