<script lang="ts">
	import { onMount } from 'svelte';

	let maintenanceRecords: any[] = [];
	let assets: any[] = [];
	let loading = true;
	let showMaintenanceModal = false;
	let statusFilter = '';

	// Form data
	let newMaintenance = {
		assetId: '',
		type: '',
		description: '',
		scheduledDate: '',
		estimatedCost: '',
		priority: 'MEDIUM'
	};

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			const [maintenanceRes, assetsRes] = await Promise.all([
				fetch('/api/maintenance'),
				fetch('/api/assets')
			]);

			maintenanceRecords = await maintenanceRes.json();
			assets = await assetsRes.json();
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function createMaintenance() {
		try {
			const response = await fetch('/api/maintenance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newMaintenance)
			});

			if (response.ok) {
				await loadData();
				showMaintenanceModal = false;
				resetForm();
			}
		} catch (error) {
			console.error('Error creating maintenance record:', error);
		}
	}

	function resetForm() {
		newMaintenance = {
			assetId: '',
			type: '',
			description: '',
			scheduledDate: '',
			estimatedCost: '',
			priority: 'MEDIUM'
		};
	}

	$: filteredMaintenance = maintenanceRecords.filter(record => {
		return !statusFilter || record.status === statusFilter;
	});

	function getStatusColor(status: string) {
		switch (status) {
			case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
			case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
			case 'COMPLETED': return 'bg-green-100 text-green-800';
			case 'CANCELLED': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'HIGH': return 'bg-red-100 text-red-800';
			case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
			case 'LOW': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Maintenance</h1>
			<p class="mt-2 text-gray-600">Track asset maintenance and repairs</p>
		</div>
		<button
			on:click={() => showMaintenanceModal = true}
			class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
		>
			Schedule Maintenance
		</button>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow p-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
				<select
					bind:value={statusFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="">All Statuses</option>
					<option value="SCHEDULED">Scheduled</option>
					<option value="IN_PROGRESS">In Progress</option>
					<option value="COMPLETED">Completed</option>
					<option value="CANCELLED">Cancelled</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Maintenance Records -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		{:else if filteredMaintenance.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🔧</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No maintenance records</h3>
				<p class="text-gray-500 mb-4">Schedule maintenance to keep your assets in top condition</p>
				<button
					on:click={() => showMaintenanceModal = true}
					class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
				>
					Schedule Maintenance
				</button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredMaintenance as record}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{record.asset?.name}</div>
										<div class="text-sm text-gray-500">{record.asset?.category?.name}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{record.type}</div>
										{#if record.description}
											<div class="text-sm text-gray-500 truncate max-w-xs">{record.description}</div>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{record.scheduledDate ? formatDate(record.scheduledDate) : '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getPriorityColor(record.priority)}">
										{record.priority}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(record.status)}">
										{record.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{record.estimatedCost ? formatCurrency(record.estimatedCost) : '-'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Maintenance Modal -->
{#if showMaintenanceModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-md">
			<h2 class="text-xl font-bold mb-4">Schedule Maintenance</h2>
			
			<form on:submit|preventDefault={createMaintenance} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Asset *</label>
					<select
						bind:value={newMaintenance.assetId}
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
					<label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
					<input
						type="text"
						bind:value={newMaintenance.type}
						required
						placeholder="e.g., Preventive, Repair, Calibration"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
					<textarea
						bind:value={newMaintenance.description}
						required
						rows="3"
						placeholder="Describe the maintenance needed"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
					<input
						type="date"
						bind:value={newMaintenance.scheduledDate}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
						<select
							bind:value={newMaintenance.priority}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="LOW">Low</option>
							<option value="MEDIUM">Medium</option>
							<option value="HIGH">High</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
						<input
							type="number"
							bind:value={newMaintenance.estimatedCost}
							step="0.01"
							placeholder="0.00"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				
				<div class="flex justify-end space-x-3 pt-4">
					<button
						type="button"
						on:click={() => { showMaintenanceModal = false; resetForm(); }}
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Schedule Maintenance
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 