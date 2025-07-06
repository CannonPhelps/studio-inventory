<script lang="ts">
	import { onMount } from 'svelte';

	let cableTypes: any[] = [];
	let loading = true;
	let showAddModal = false;
	let editingCableType: any = null;

	let newCableType = {
		name: '',
		description: '',
		color: '',
		gauge: '',
		impedance: '',
		maxLength: '',
		connectorType: '',
		voltageRating: '',
		shielding: '',
		standards: ''
	};

	onMount(async () => {
		await loadCableTypes();
	});

	async function loadCableTypes() {
		try {
			const response = await fetch('/api/cable-types');
			cableTypes = await response.json();
		} catch (error) {
			console.error('Error loading cable types:', error);
		} finally {
			loading = false;
		}
	}

	async function addCableType() {
		try {
			const response = await fetch('/api/cable-types', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCableType)
			});

			if (response.ok) {
				await loadCableTypes();
				showAddModal = false;
				newCableType = {
					name: '',
					description: '',
					color: '',
					gauge: '',
					impedance: '',
					maxLength: '',
					connectorType: '',
					voltageRating: '',
					shielding: '',
					standards: ''
				};
			}
		} catch (error) {
			console.error('Error adding cable type:', error);
		}
	}

	async function updateCableType() {
		if (!editingCableType) return;

		try {
			const response = await fetch(`/api/cable-types/${editingCableType.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingCableType)
			});

			if (response.ok) {
				await loadCableTypes();
				editingCableType = null;
			}
		} catch (error) {
			console.error('Error updating cable type:', error);
		}
	}

	async function deleteCableType(id: number) {
		if (!confirm('Are you sure you want to delete this cable type?')) return;

		try {
			const response = await fetch(`/api/cable-types/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadCableTypes();
			}
		} catch (error) {
			console.error('Error deleting cable type:', error);
		}
	}

	function startEdit(cableType: any) {
		editingCableType = { ...cableType };
	}

	function cancelEdit() {
		editingCableType = null;
	}

	const connectorTypes = [
		'BNC', 'XLR', 'RCA', '1/4" TRS', '1/4" TS', '3.5mm', '6.35mm',
		'HDMI', 'DisplayPort', 'VGA', 'DVI', 'USB-C', 'USB-A', 'USB-B',
		'RJ45', 'RJ11', 'F-Type', 'N-Type', 'SMA', 'SMB', 'SMC', 'Other'
	];

	const shieldingTypes = [
		'Unshielded', 'Foil Shielded', 'Braided Shielded', 'Foil + Braid',
		'Triple Shielded', 'Quad Shielded', 'Other'
	];
</script>

<svelte:head>
	<title>Cable Types - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-primary">Cable Types</h1>
			<p class="mt-2 text-secondary">Define cable specifications and standards</p>
		</div>
		<button
			onclick={() => (showAddModal = true)}
			class="mt-4 sm:mt-0 bg-accent hover:bg-accent-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Cable Type
		</button>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
		</div>
	{:else if cableTypes.length === 0}
		<div class="text-center py-12">
			<div class="text-tertiary text-4xl mb-4">🔌</div>
			<h3 class="text-lg font-medium text-primary mb-2">No cable types yet</h3>
			<p class="text-secondary mb-4">Create your first cable type to start managing cable specifications.</p>
			<button
				onclick={() => (showAddModal = true)}
				class="bg-accent hover:bg-accent-secondary text-white px-4 py-2 rounded-lg transition-colors"
			>
				Add Cable Type
			</button>
		</div>
	{:else}
		<!-- Cable Types Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each cableTypes as cableType}
				<div class="bg-card rounded-xl shadow-sm border border-card hover:shadow-md transition-shadow">
					<div class="p-6">
						<div class="flex items-start justify-between mb-4">
							<div class="flex-1">
								<h3 class="text-lg font-semibold mb-1 text-primary">{cableType.name}</h3>
								{#if cableType.color}
									<div class="flex items-center text-sm text-secondary">
										<div 
											class="w-3 h-3 rounded-full mr-2"
											style="background-color: {cableType.color}"
										></div>
										{cableType.color}
									</div>
								{/if}
							</div>
							<div class="flex items-center space-x-2">
								<button
									onclick={() => startEdit(cableType)}
									class="text-accent hover:text-accent-secondary p-1 rounded transition-colors"
									aria-label="Edit cable type"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</button>
								<button
									onclick={() => deleteCableType(cableType.id)}
									class="text-error hover:text-red-700 p-1 rounded transition-colors"
									aria-label="Delete cable type"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>

						{#if cableType.description}
							<p class="text-sm text-secondary mb-4">{cableType.description}</p>
						{/if}

						<div class="space-y-2 text-sm">
							{#if cableType.gauge}
								<div class="flex justify-between">
									<span class="text-secondary">Gauge:</span>
									<span class="font-medium text-primary">{cableType.gauge}</span>
								</div>
							{/if}
							{#if cableType.impedance}
								<div class="flex justify-between">
									<span class="text-secondary">Impedance:</span>
									<span class="font-medium text-primary">{cableType.impedance}</span>
								</div>
							{/if}
							{#if cableType.connectorType}
								<div class="flex justify-between">
									<span class="text-secondary">Connector:</span>
									<span class="font-medium text-primary">{cableType.connectorType}</span>
								</div>
							{/if}
							{#if cableType.maxLength}
								<div class="flex justify-between">
									<span class="text-secondary">Max Length:</span>
									<span class="font-medium text-primary">{cableType.maxLength}</span>
								</div>
							{/if}
						</div>

						<div class="flex items-center justify-between pt-4 border-t border-card">
							<div class="flex items-center text-sm text-secondary">
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								{cableType.assetCount || 0} cables
							</div>
							<span class="text-xs text-tertiary">ID: {cableType.id}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Add Cable Type Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-2xl border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Add New Cable Type</h2>
			<form onsubmit={addCableType} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-secondary mb-1">Name *</label>
						<input
							id="name"
							type="text"
							bind:value={newCableType.name}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., XLR Cable, HDMI Cable"
							required
						/>
					</div>
					<div>
						<label for="color" class="block text-sm font-medium text-secondary mb-1">Color</label>
						<input
							id="color"
							type="color"
							bind:value={newCableType.color}
							class="w-full px-3 py-2 border border-card bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						/>
					</div>
				</div>

				<div>
					<label for="description" class="block text-sm font-medium text-secondary mb-1">Description</label>
					<textarea
						id="description"
						bind:value={newCableType.description}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						rows="3"
						placeholder="Describe the cable type and its typical use cases"
					></textarea>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="gauge" class="block text-sm font-medium text-secondary mb-1">Gauge</label>
						<input
							id="gauge"
							type="text"
							bind:value={newCableType.gauge}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., 22 AWG, 24 AWG"
						/>
					</div>
					<div>
						<label for="impedance" class="block text-sm font-medium text-secondary mb-1">Impedance</label>
						<input
							id="impedance"
							type="text"
							bind:value={newCableType.impedance}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., 75Ω, 50Ω"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="connectorType" class="block text-sm font-medium text-secondary mb-1">Connector Type</label>
						<select
							id="connectorType"
							bind:value={newCableType.connectorType}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						>
							<option value="">Select connector type</option>
							{#each connectorTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="maxLength" class="block text-sm font-medium text-secondary mb-1">Max Length</label>
						<input
							id="maxLength"
							type="text"
							bind:value={newCableType.maxLength}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., 100ft, 50m"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="voltageRating" class="block text-sm font-medium text-secondary mb-1">Voltage Rating</label>
						<input
							id="voltageRating"
							type="text"
							bind:value={newCableType.voltageRating}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., 300V, 600V"
						/>
					</div>
					<div>
						<label for="shielding" class="block text-sm font-medium text-secondary mb-1">Shielding</label>
						<select
							id="shielding"
							bind:value={newCableType.shielding}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						>
							<option value="">Select shielding type</option>
							{#each shieldingTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
				</div>

				<div>
					<label for="standards" class="block text-sm font-medium text-secondary mb-1">Standards</label>
					<input
						id="standards"
						type="text"
						bind:value={newCableType.standards}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="e.g., UL, CE, RoHS"
					/>
				</div>

				<div class="flex space-x-3 pt-4">
					<button
						type="submit"
						class="flex-1 bg-accent hover:bg-accent-secondary text-white py-2 px-4 rounded-lg transition-colors"
					>
						Add Cable Type
					</button>
					<button
						type="button"
						onclick={() => (showAddModal = false)}
						class="flex-1 bg-tertiary hover:bg-secondary text-primary py-2 px-4 rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Cable Type Modal -->
{#if editingCableType}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-2xl border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Edit Cable Type</h2>
			<form onsubmit={updateCableType} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-name" class="block text-sm font-medium text-secondary mb-1">Name *</label>
						<input
							id="edit-name"
							type="text"
							bind:value={editingCableType.name}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., XLR Cable, HDMI Cable"
							required
						/>
					</div>
					<div>
						<label for="edit-color" class="block text-sm font-medium text-secondary mb-1">Color</label>
						<input
							id="edit-color"
							type="color"
							bind:value={editingCableType.color}
							class="w-full px-3 py-2 border border-card bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						/>
					</div>
				</div>

				<div>
					<label for="edit-description" class="block text-sm font-medium text-secondary mb-1">Description</label>
					<textarea
						id="edit-description"
						bind:value={editingCableType.description}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						rows="3"
						placeholder="Describe the cable type and its typical use cases"
					></textarea>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-gauge" class="block text-sm font-medium text-secondary mb-1">Gauge</label>
						<input
							id="edit-gauge"
							type="text"
							bind:value={editingCableType.gauge}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., 22 AWG, 24 AWG"
						/>
					</div>
					<div>
						<label for="edit-impedance" class="block text-sm font-medium text-secondary mb-1">Impedance</label>
						<input
							id="edit-impedance"
							type="text"
							bind:value={editingCableType.impedance}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., 75Ω, 50Ω"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-connectorType" class="block text-sm font-medium text-secondary mb-1">Connector Type</label>
						<select
							id="edit-connectorType"
							bind:value={editingCableType.connectorType}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						>
							<option value="">Select connector type</option>
							{#each connectorTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="edit-maxLength" class="block text-sm font-medium text-secondary mb-1">Max Length</label>
						<input
							id="edit-maxLength"
							type="text"
							bind:value={editingCableType.maxLength}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., 100ft, 50m"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-voltageRating" class="block text-sm font-medium text-secondary mb-1">Voltage Rating</label>
						<input
							id="edit-voltageRating"
							type="text"
							bind:value={editingCableType.voltageRating}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							placeholder="e.g., 300V, 600V"
						/>
					</div>
					<div>
						<label for="edit-shielding" class="block text-sm font-medium text-secondary mb-1">Shielding</label>
						<select
							id="edit-shielding"
							bind:value={editingCableType.shielding}
							class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						>
							<option value="">Select shielding type</option>
							{#each shieldingTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
				</div>

				<div>
					<label for="edit-standards" class="block text-sm font-medium text-secondary mb-1">Standards</label>
					<input
						id="edit-standards"
						type="text"
						bind:value={editingCableType.standards}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="e.g., UL, CE, RoHS"
					/>
				</div>

				<div class="flex space-x-3 pt-4">
					<button
						type="submit"
						class="flex-1 bg-accent hover:bg-accent-secondary text-white py-2 px-4 rounded-lg transition-colors"
					>
						Update Cable Type
					</button>
					<button
						type="button"
						onclick={cancelEdit}
						class="flex-1 bg-tertiary hover:bg-secondary text-primary py-2 px-4 rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 