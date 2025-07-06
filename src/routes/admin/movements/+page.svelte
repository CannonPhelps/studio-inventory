<script lang="ts">
	import { onMount } from 'svelte';

	interface Asset {
		id: string;
		itemName: string;
		serialNumber?: string;
		location: string;
		status: string;
	}

	interface Movement {
		id: string;
		assetId: string;
		asset: Asset;
		fromLocation: string;
		toLocation: string;
		movedBy: string;
		movedAt: string;
		reason: string;
		notes?: string;
	}

	let assets: Asset[] = [];
	let movements: Movement[] = [];
	let loading = true;
	let showAddForm = false;

	// Form data
	let selectedAsset = '';
	let fromLocation = '';
	let toLocation = '';
	let reason = '';
	let notes = '';

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			const [assetsResponse, movementsResponse] = await Promise.all([
				fetch('/api/assets'),
				fetch('/api/movements')
			]);

			if (assetsResponse.ok) {
				assets = await assetsResponse.json();
			}
			if (movementsResponse.ok) {
				movements = await movementsResponse.json();
			}
			loading = false;
		} catch (error) {
			console.error('Error loading data:', error);
			loading = false;
		}
	}

	async function handleAddMovement(event: Event) {
		event.preventDefault();
		
		if (!selectedAsset || !fromLocation || !toLocation || !reason) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			const response = await fetch('/api/movements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					assetId: selectedAsset,
					fromLocation,
					toLocation,
					reason,
					notes
				})
			});

			if (response.ok) {
				// Reset form
				selectedAsset = '';
				fromLocation = '';
				toLocation = '';
				reason = '';
				notes = '';
				showAddForm = false;
				
				// Reload data
				await loadData();
			} else {
				alert('Failed to add movement record');
			}
		} catch (error) {
			console.error('Error adding movement:', error);
			alert('Error adding movement record');
		}
	}

	function getMovementTypeColor(reason: string) {
		switch (reason.toLowerCase()) {
			case 'relocation': return 'text-blue-600 bg-blue-50';
			case 'maintenance': return 'text-orange-600 bg-orange-50';
			case 'repair': return 'text-red-600 bg-red-50';
			case 'storage': return 'text-gray-600 bg-gray-50';
			case 'deployment': return 'text-green-600 bg-green-50';
			default: return 'text-purple-600 bg-purple-50';
		}
	}
</script>

<svelte:head>
	<title>Admin Movements - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-start">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Admin Movements</h1>
			<p class="text-gray-600 mt-1">Track asset movements and location changes</p>
		</div>
		<button
			onclick={() => showAddForm = !showAddForm}
			class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
		>
			{showAddForm ? 'Cancel' : 'Add Movement'}
		</button>
	</div>

	<!-- Add Movement Form -->
	{#if showAddForm}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Add Movement Record</h2>
			<form onsubmit={handleAddMovement} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="asset" class="block text-sm font-medium text-gray-700 mb-1">Asset</label>
						<select
							id="asset"
							bind:value={selectedAsset}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							required
						>
							<option value="">Select an asset</option>
							{#each assets as asset}
								<option value={asset.id}>{asset.itemName} {asset.serialNumber ? `(${asset.serialNumber})` : ''}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="reason" class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
						<select
							id="reason"
							bind:value={reason}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							required
						>
							<option value="">Select reason</option>
							<option value="Relocation">Relocation</option>
							<option value="Maintenance">Maintenance</option>
							<option value="Repair">Repair</option>
							<option value="Storage">Storage</option>
							<option value="Deployment">Deployment</option>
							<option value="Other">Other</option>
						</select>
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="fromLocation" class="block text-sm font-medium text-gray-700 mb-1">From Location</label>
						<input
							type="text"
							id="fromLocation"
							bind:value={fromLocation}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							placeholder="Current location"
							required
						/>
					</div>
					<div>
						<label for="toLocation" class="block text-sm font-medium text-gray-700 mb-1">To Location</label>
						<input
							type="text"
							id="toLocation"
							bind:value={toLocation}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							placeholder="New location"
							required
						/>
					</div>
				</div>
				<div>
					<label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
					<textarea
						id="notes"
						bind:value={notes}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
						placeholder="Additional details about the movement..."
					></textarea>
				</div>
				<div class="flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => showAddForm = false}
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
					>
						Add Movement
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Current Asset Locations -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200">
		<div class="p-6 border-b border-gray-200">
			<h2 class="text-xl font-semibold text-gray-900">Current Asset Locations</h2>
			<p class="text-gray-600 mt-1">Where assets are currently located</p>
		</div>
		<div class="overflow-x-auto">
			{#if loading}
				<div class="p-6 text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
					<p class="text-gray-500 mt-2">Loading assets...</p>
				</div>
			{:else if assets.length === 0}
				<div class="p-6 text-center">
					<div class="text-gray-400 text-4xl mb-4">📍</div>
					<p class="text-gray-500">No assets found</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Location</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Moved</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each assets as asset}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{asset.itemName}</div>
										<div class="text-sm text-gray-500">{asset.serialNumber || 'No Serial'}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.location}</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600 bg-gray-50">
										{asset.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									-
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>

	<!-- Movement History -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200">
		<div class="p-6 border-b border-gray-200">
			<h2 class="text-xl font-semibold text-gray-900">Movement History</h2>
			<p class="text-gray-600 mt-1">Recent asset movements</p>
		</div>
		<div class="overflow-x-auto">
			{#if movements.length === 0}
				<div class="p-6 text-center">
					<div class="text-gray-400 text-4xl mb-4">📋</div>
					<p class="text-gray-500">No movement records</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moved By</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each movements.slice(0, 10) as movement}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{movement.asset.itemName}</div>
										<div class="text-sm text-gray-500">{movement.asset.serialNumber || 'No Serial'}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.fromLocation}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.toLocation}</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getMovementTypeColor(movement.reason)}">
										{movement.reason}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.movedBy}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{new Date(movement.movedAt).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div> 