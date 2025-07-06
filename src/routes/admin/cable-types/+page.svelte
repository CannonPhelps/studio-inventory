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
			<h1 class="text-3xl font-bold text-gray-900">Cable Types</h1>
			<p class="mt-2 text-gray-600">Define cable specifications and standards</p>
		</div>
		<button
			on:click={() => (showAddModal = true)}
			class="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Cable Type
		</button>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		</div>
	{:else if cableTypes.length === 0}
		<div class="text-center py-12">
			<div class="text-gray-400 mb-4">
				<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No cable types yet</h3>
			<p class="text-gray-500 mb-4">Create your first cable type to start managing cable specifications.</p>
			<button
				on:click={() => (showAddModal = true)}
				class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
			>
				Add Cable Type
			</button>
		</div>
	{:else}
		<!-- Cable Types Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each cableTypes as cableType}
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
					<div class="p-6">
						<div class="flex items-start justify-between mb-4">
							<div class="flex-1">
								<h3 class="text-lg font-semibold text-gray-900 mb-1">{cableType.name}</h3>
								{#if cableType.color}
									<div class="flex items-center text-sm text-gray-600">
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
									on:click={() => startEdit(cableType)}
									class="text-blue-600 hover:text-blue-800 p-1 rounded"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</button>
								<button
									on:click={() => deleteCableType(cableType.id)}
									class="text-red-600 hover:text-red-800 p-1 rounded"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>

						{#if cableType.description}
							<p class="text-gray-600 mb-4 text-sm">{cableType.description}</p>
						{/if}

						<div class="space-y-2 mb-4">
							{#if cableType.gauge}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Gauge:</span>
									<span class="font-medium">{cableType.gauge}</span>
								</div>
							{/if}
							{#if cableType.impedance}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Impedance:</span>
									<span class="font-medium">{cableType.impedance} Ω</span>
								</div>
							{/if}
							{#if cableType.maxLength}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Max Length:</span>
									<span class="font-medium">{cableType.maxLength} ft</span>
								</div>
							{/if}
							{#if cableType.connectorType}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Connector:</span>
									<span class="font-medium">{cableType.connectorType}</span>
								</div>
							{/if}
							{#if cableType.voltageRating}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Voltage:</span>
									<span class="font-medium">{cableType.voltageRating}V</span>
								</div>
							{/if}
							{#if cableType.shielding}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Shielding:</span>
									<span class="font-medium">{cableType.shielding}</span>
								</div>
							{/if}
						</div>

						<div class="flex items-center justify-between pt-4 border-t border-gray-100">
							<div class="flex items-center text-sm text-gray-500">
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								{cableType.cableCount || 0} cables
							</div>
							<span class="text-xs text-gray-400">ID: {cableType.id}</span>
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
		<div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
			<h2 class="text-xl font-bold mb-4">Add New Cable Type</h2>
			<form on:submit|preventDefault={addCableType} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
						<input
							id="name"
							type="text"
							bind:value={newCableType.name}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., SDI Cable, XLR Cable"
							required
						/>
					</div>
					<div>
						<label for="color" class="block text-sm font-medium text-gray-700 mb-1">Color</label>
						<input
							id="color"
							type="text"
							bind:value={newCableType.color}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Black, Red, Blue"
						/>
					</div>
				</div>

				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
					<textarea
						id="description"
						bind:value={newCableType.description}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows="2"
						placeholder="Optional description"
					></textarea>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="gauge" class="block text-sm font-medium text-gray-700 mb-1">Gauge</label>
						<input
							id="gauge"
							type="text"
							bind:value={newCableType.gauge}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., 22 AWG"
						/>
					</div>
					<div>
						<label for="impedance" class="block text-sm font-medium text-gray-700 mb-1">Impedance</label>
						<input
							id="impedance"
							type="text"
							bind:value={newCableType.impedance}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., 75"
						/>
					</div>
					<div>
						<label for="maxLength" class="block text-sm font-medium text-gray-700 mb-1">Max Length (ft)</label>
						<input
							id="maxLength"
							type="number"
							bind:value={newCableType.maxLength}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., 300"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="connectorType" class="block text-sm font-medium text-gray-700 mb-1">Connector Type</label>
						<select
							id="connectorType"
							bind:value={newCableType.connectorType}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select connector type</option>
							{#each connectorTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="voltageRating" class="block text-sm font-medium text-gray-700 mb-1">Voltage Rating</label>
						<input
							id="voltageRating"
							type="text"
							bind:value={newCableType.voltageRating}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., 300"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="shielding" class="block text-sm font-medium text-gray-700 mb-1">Shielding</label>
						<select
							id="shielding"
							bind:value={newCableType.shielding}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select shielding type</option>
							{#each shieldingTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="standards" class="block text-sm font-medium text-gray-700 mb-1">Standards</label>
						<input
							id="standards"
							type="text"
							bind:value={newCableType.standards}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., SMPTE 259M, AES/EBU"
						/>
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button
						type="button"
						on:click={() => (showAddModal = false)}
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
					>
						Add Cable Type
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Cable Type Modal -->
{#if editingCableType}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
			<h2 class="text-xl font-bold mb-4">Edit Cable Type</h2>
			<form on:submit|preventDefault={updateCableType} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="editName" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
						<input
							id="editName"
							type="text"
							bind:value={editingCableType.name}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label for="editColor" class="block text-sm font-medium text-gray-700 mb-1">Color</label>
						<input
							id="editColor"
							type="text"
							bind:value={editingCableType.color}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				<div>
					<label for="editDescription" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
					<textarea
						id="editDescription"
						bind:value={editingCableType.description}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows="2"
					></textarea>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="editGauge" class="block text-sm font-medium text-gray-700 mb-1">Gauge</label>
						<input
							id="editGauge"
							type="text"
							bind:value={editingCableType.gauge}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label for="editImpedance" class="block text-sm font-medium text-gray-700 mb-1">Impedance</label>
						<input
							id="editImpedance"
							type="text"
							bind:value={editingCableType.impedance}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label for="editMaxLength" class="block text-sm font-medium text-gray-700 mb-1">Max Length (ft)</label>
						<input
							id="editMaxLength"
							type="number"
							bind:value={editingCableType.maxLength}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="editConnectorType" class="block text-sm font-medium text-gray-700 mb-1">Connector Type</label>
						<select
							id="editConnectorType"
							bind:value={editingCableType.connectorType}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select connector type</option>
							{#each connectorTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="editVoltageRating" class="block text-sm font-medium text-gray-700 mb-1">Voltage Rating</label>
						<input
							id="editVoltageRating"
							type="text"
							bind:value={editingCableType.voltageRating}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="editShielding" class="block text-sm font-medium text-gray-700 mb-1">Shielding</label>
						<select
							id="editShielding"
							bind:value={editingCableType.shielding}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select shielding type</option>
							{#each shieldingTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="editStandards" class="block text-sm font-medium text-gray-700 mb-1">Standards</label>
						<input
							id="editStandards"
							type="text"
							bind:value={editingCableType.standards}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button
						type="button"
						on:click={cancelEdit}
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
					>
						Update Cable Type
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 