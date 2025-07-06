<script lang="ts">
	import { onMount } from 'svelte';

	interface Asset {
		id: string;
		itemName: string;
		serialNumber?: string;
		status: string;
		condition: string;
		lastMaintenance?: string;
		nextMaintenance?: string;
	}

	interface MaintenanceRecord {
		id: string;
		assetId: string;
		asset: Asset;
		maintenanceType: string;
		description: string;
		performedBy: string;
		performedAt: string;
		cost?: number;
		notes?: string;
	}

	let assets: Asset[] = [];
	let maintenanceRecords: MaintenanceRecord[] = [];
	let loading = true;
	let showAddForm = false;

	// Form data
	let selectedAsset = '';
	let maintenanceType = '';
	let description = '';
	let cost = '';
	let notes = '';

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			const [assetsResponse, maintenanceResponse] = await Promise.all([
				fetch('/api/assets'),
				fetch('/api/maintenance')
			]);

			if (assetsResponse.ok) {
				assets = await assetsResponse.json();
			}
			if (maintenanceResponse.ok) {
				maintenanceRecords = await maintenanceResponse.json();
			}
			loading = false;
		} catch (error) {
			console.error('Error loading data:', error);
			loading = false;
		}
	}

	async function handleAddMaintenance(event: Event) {
		event.preventDefault();
		
		if (!selectedAsset || !maintenanceType || !description) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			const response = await fetch('/api/maintenance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					assetId: selectedAsset,
					maintenanceType,
					description,
					cost: cost ? parseFloat(cost) : undefined,
					notes
				})
			});

			if (response.ok) {
				// Reset form
				selectedAsset = '';
				maintenanceType = '';
				description = '';
				cost = '';
				notes = '';
				showAddForm = false;
				
				// Reload data
				await loadData();
			} else {
				alert('Failed to add maintenance record');
			}
		} catch (error) {
			console.error('Error adding maintenance:', error);
			alert('Error adding maintenance record');
		}
	}

	function getConditionColor(condition: string) {
		switch (condition.toLowerCase()) {
			case 'excellent': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
			case 'good': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
			case 'fair': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
			case 'poor': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
			default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
		}
	}

	function getMaintenanceTypeColor(type: string) {
		switch (type.toLowerCase()) {
			case 'preventive': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
			case 'repair': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
			case 'inspection': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
			case 'upgrade': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
			default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
		}
	}
</script>

<svelte:head>
	<title>Admin Maintenance - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-start">
		<div>
			<h1 class="text-3xl font-bold text-primary">Admin Maintenance</h1>
			<p class="text-muted-foreground mt-1">Manage asset maintenance and repairs</p>
		</div>
		<button
			on:click={() => showAddForm = !showAddForm}
			class="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
		>
			{showAddForm ? 'Cancel' : 'Add Maintenance'}
		</button>
	</div>

	<!-- Add Maintenance Form -->
	{#if showAddForm}
		<div class="bg-card rounded-xl shadow-sm border border-border p-6">
			<h2 class="text-xl font-semibold text-primary mb-4">Add Maintenance Record</h2>
			<form on:submit={handleAddMaintenance} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="asset" class="block text-sm font-medium text-primary mb-1">Asset</label>
						<select
							id="asset"
							bind:value={selectedAsset}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-background text-primary"
							required
						>
							<option value="">Select an asset</option>
							{#each assets as asset}
								<option value={asset.id}>{asset.itemName} {asset.serialNumber ? `(${asset.serialNumber})` : ''}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="type" class="block text-sm font-medium text-primary mb-1">Maintenance Type</label>
						<select
							id="type"
							bind:value={maintenanceType}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-background text-primary"
							required
						>
							<option value="">Select type</option>
							<option value="Preventive">Preventive</option>
							<option value="Repair">Repair</option>
							<option value="Inspection">Inspection</option>
							<option value="Upgrade">Upgrade</option>
						</select>
					</div>
				</div>
				<div>
					<label for="description" class="block text-sm font-medium text-primary mb-1">Description</label>
					<textarea
						id="description"
						bind:value={description}
						rows="3"
						class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-background text-primary placeholder:text-muted-foreground"
						placeholder="Describe the maintenance performed..."
						required
					></textarea>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="cost" class="block text-sm font-medium text-primary mb-1">Cost ($)</label>
						<input
							type="number"
							id="cost"
							bind:value={cost}
							step="0.01"
							min="0"
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-background text-primary placeholder:text-muted-foreground"
							placeholder="0.00"
						/>
					</div>
					<div>
						<label for="notes" class="block text-sm font-medium text-primary mb-1">Notes</label>
						<input
							type="text"
							id="notes"
							bind:value={notes}
							class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-background text-primary placeholder:text-muted-foreground"
							placeholder="Additional notes..."
						/>
					</div>
				</div>
				<div class="flex justify-end space-x-3">
					<button
						type="button"
						on:click={() => showAddForm = false}
						class="px-4 py-2 text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md transition-colors"
					>
						Add Maintenance
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Asset Maintenance Status -->
	<div class="bg-card rounded-xl shadow-sm border border-border">
		<div class="p-6 border-b border-border">
			<h2 class="text-xl font-semibold text-primary">Asset Maintenance Status</h2>
			<p class="text-muted-foreground mt-1">Current condition and maintenance schedule</p>
		</div>
		<div class="overflow-x-auto">
			{#if loading}
				<div class="p-6 text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p class="text-muted-foreground mt-2">Loading assets...</p>
				</div>
			{:else if assets.length === 0}
				<div class="p-6 text-center">
					<div class="text-muted-foreground text-4xl mb-4">🔧</div>
					<p class="text-muted-foreground">No assets found</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-muted/50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Condition</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Maintenance</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Next Maintenance</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
						</tr>
					</thead>
					<tbody class="bg-card divide-y divide-border">
						{#each assets as asset}
							<tr class="hover:bg-muted/50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-primary">{asset.itemName}</div>
										<div class="text-sm text-muted-foreground">{asset.serialNumber || 'No Serial'}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getConditionColor(asset.condition)}">
										{asset.condition}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
									{asset.lastMaintenance ? new Date(asset.lastMaintenance).toLocaleDateString() : 'Never'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
									{asset.nextMaintenance ? new Date(asset.nextMaintenance).toLocaleDateString() : 'Not scheduled'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground bg-muted">
										{asset.status}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>

	<!-- Maintenance History -->
	<div class="bg-card rounded-xl shadow-sm border border-border">
		<div class="p-6 border-b border-border">
			<h2 class="text-xl font-semibold text-primary">Maintenance History</h2>
			<p class="text-muted-foreground mt-1">Recent maintenance records</p>
		</div>
		<div class="overflow-x-auto">
			{#if maintenanceRecords.length === 0}
				<div class="p-6 text-center">
					<div class="text-muted-foreground text-4xl mb-4">📋</div>
					<p class="text-muted-foreground">No maintenance records</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-muted/50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Performed By</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</th>
						</tr>
					</thead>
					<tbody class="bg-card divide-y divide-border">
						{#each maintenanceRecords.slice(0, 10) as record}
							<tr class="hover:bg-muted/50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-primary">{record.asset.itemName}</div>
										<div class="text-sm text-muted-foreground">{record.asset.serialNumber || 'No Serial'}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getMaintenanceTypeColor(record.maintenanceType)}">
										{record.maintenanceType}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-primary max-w-xs truncate">
									{record.description}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">{record.performedBy}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
									{new Date(record.performedAt).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
									{record.cost ? `$${record.cost.toFixed(2)}` : '-'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div> 