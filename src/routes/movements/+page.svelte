<script lang="ts">
	import { onMount } from 'svelte';

	let movements: any[] = [];
	let assets: any[] = [];
	let loading = true;
	let showMovementModal = false;

	// Form data
	let newMovement = {
		assetId: '',
		fromLocation: '',
		toLocation: '',
		reason: '',
		notes: ''
	};

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			const [movementsRes, assetsRes] = await Promise.all([
				fetch('/api/movements'),
				fetch('/api/assets')
			]);

			movements = await movementsRes.json();
			assets = await assetsRes.json();
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function createMovement() {
		try {
			const response = await fetch('/api/movements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newMovement)
			});

			if (response.ok) {
				await loadData();
				showMovementModal = false;
				resetForm();
			}
		} catch (error) {
			console.error('Error creating movement:', error);
		}
	}

	function resetForm() {
		newMovement = {
			assetId: '',
			fromLocation: '',
			toLocation: '',
			reason: '',
			notes: ''
		};
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function formatDateTime(dateString: string) {
		return new Date(dateString).toLocaleString();
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Movements</h1>
			<p class="mt-2 text-gray-600">Track asset location changes and transfers</p>
		</div>
		<button
			on:click={() => showMovementModal = true}
			class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
		>
			Record Movement
		</button>
	</div>

	<!-- Movements Table -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		{:else if movements.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🔄</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No movements recorded</h3>
				<p class="text-gray-500 mb-4">Asset movements will appear here once recorded</p>
				<button
					on:click={() => showMovementModal = true}
					class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
				>
					Record Movement
				</button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each movements as movement}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{movement.asset?.name}</div>
										<div class="text-sm text-gray-500">{movement.asset?.category?.name}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{movement.fromLocation}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									<span class="font-medium">{movement.toLocation}</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{movement.reason || '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatDateTime(movement.createdAt)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Movement Modal -->
{#if showMovementModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-md">
			<h2 class="text-xl font-bold mb-4">Record Movement</h2>
			
			<form on:submit|preventDefault={createMovement} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Asset *</label>
					<select
						bind:value={newMovement.assetId}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Select Asset</option>
						{#each assets as asset}
							<option value={asset.id}>{asset.name} - {asset.category?.name}</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">From Location *</label>
					<input
						type="text"
						bind:value={newMovement.fromLocation}
						required
						placeholder="e.g., Storage Room A"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">To Location *</label>
					<input
						type="text"
						bind:value={newMovement.toLocation}
						required
						placeholder="e.g., Studio B"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
					<input
						type="text"
						bind:value={newMovement.reason}
						placeholder="e.g., Production setup, Maintenance"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
					<textarea
						bind:value={newMovement.notes}
						rows="3"
						placeholder="Optional additional notes"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
				</div>
				
				<div class="flex justify-end space-x-3 pt-4">
					<button
						type="button"
						on:click={() => { showMovementModal = false; resetForm(); }}
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Record Movement
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 