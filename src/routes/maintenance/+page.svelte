<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import AppLayout from '$lib/components/AppLayout.svelte';

	let { data } = $props<{ data: PageData }>();

	let maintenanceRecords = $state<any[]>([]);
	let assets = $state<any[]>([]);
	let loading = $state(true);
	let showMaintenanceModal = $state(false);
	let statusFilter = $state('');

	// Form data
	let newMaintenance = $state({
		assetId: '',
		type: '',
		description: '',
		scheduledDate: '',
		estimatedCost: '',
		priority: 'MEDIUM'
	});

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

	let filteredMaintenance = $derived(maintenanceRecords.filter(record => {
		return !statusFilter || record.status === statusFilter;
	}));

	function getStatusColor(status: string) {
		switch (status) {
			case 'SCHEDULED': return 'bg-primary-100 text-primary-600';
			case 'IN_PROGRESS': return 'bg-warning-light text-warning';
			case 'COMPLETED': return 'bg-success-light text-success';
			case 'CANCELLED': return 'bg-error-light text-error';
			default: return 'bg-secondary-100 text-secondary-600';
		}
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'HIGH': return 'bg-error-light text-error';
			case 'MEDIUM': return 'bg-warning-light text-warning';
			case 'LOW': return 'bg-success-light text-success';
			default: return 'bg-secondary-100 text-secondary-600';
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

<svelte:head>
	<title>Maintenance - Studio Inventory</title>
</svelte:head>

<AppLayout user={data.user}>
	<div class="space-y-6">
		<!-- Header -->
		<div class="bg-gradient-to-r from-accent to-accent-secondary rounded-2xl p-4 md:p-6 text-white">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
				<div>
					<h1 class="text-2xl md:text-3xl font-bold">Maintenance</h1>
					<p class="text-white/80 mt-2">Track asset maintenance and repairs</p>
				</div>
				<button
					on:click={() => showMaintenanceModal = true}
					class="bg-white text-accent px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-medium"
				>
					Schedule Maintenance
				</button>
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-card rounded-xl shadow-custom border border-card p-4 md:p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-secondary mb-2">Status</label>
					<select
						bind:value={statusFilter}
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
		<div class="bg-card rounded-xl shadow-custom border border-card overflow-hidden">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
				</div>
			{:else if filteredMaintenance.length === 0}
				<div class="text-center py-12">
					<div class="text-6xl mb-4">🔧</div>
					<h3 class="text-lg font-medium text-primary mb-2">No maintenance records</h3>
					<p class="text-secondary mb-4">Schedule maintenance to keep your assets in top condition</p>
					<button
						on:click={() => showMaintenanceModal = true}
						class="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Schedule Maintenance
					</button>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-card">
						<thead class="bg-secondary">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Asset</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Type</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Scheduled Date</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Priority</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Cost</th>
							</tr>
						</thead>
						<tbody class="bg-card divide-y divide-card">
							{#each filteredMaintenance as record}
								<tr class="hover:bg-secondary transition-colors">
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-primary">{record.asset?.name}</div>
											<div class="text-sm text-secondary">{record.asset?.category?.name}</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-primary">{record.type}</div>
											{#if record.description}
												<div class="text-sm text-secondary truncate max-w-xs">{record.description}</div>
											{/if}
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
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
									<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
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
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-card rounded-xl shadow-custom border border-card p-6 w-full max-w-md">
				<h3 class="text-lg font-semibold text-primary mb-4">Schedule Maintenance</h3>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Asset</label>
						<select
							bind:value={newMaintenance.assetId}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						>
							<option value="">Select an asset</option>
							{#each assets as asset}
								<option value={asset.id}>{asset.name} - {asset.category?.name}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Type</label>
						<input
							type="text"
							bind:value={newMaintenance.type}
							placeholder="e.g., Preventive, Repair, Calibration"
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Description</label>
						<textarea
							bind:value={newMaintenance.description}
							rows="3"
							placeholder="Describe the maintenance needed..."
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						></textarea>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Scheduled Date</label>
						<input
							type="date"
							bind:value={newMaintenance.scheduledDate}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Priority</label>
						<select
							bind:value={newMaintenance.priority}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						>
							<option value="LOW">Low</option>
							<option value="MEDIUM">Medium</option>
							<option value="HIGH">High</option>
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Estimated Cost</label>
						<input
							type="number"
							bind:value={newMaintenance.estimatedCost}
							placeholder="0.00"
							step="0.01"
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						/>
					</div>
				</div>
				
				<div class="flex space-x-3 mt-6">
					<button
						on:click={() => showMaintenanceModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={createMaintenance}
						class="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Schedule
					</button>
				</div>
			</div>
		</div>
	{/if}
</AppLayout> 