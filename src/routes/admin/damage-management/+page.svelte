<script lang="ts">
	import { onMount } from 'svelte';

	import Card from '$lib/components/Card.svelte';

	let damagedAssets = $state<any[]>([]);
	let damageReports = $state<any[]>([]);
	let loading = $state(true);
	let selectedAsset = $state<any>(null);
	let showRepairModal = $state(false);
	let repairForm = $state({
		description: '',
		cost: '',
		status: 'IN_PROGRESS',
		notes: ''
	});

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			// Load damaged assets
			const assetsResponse = await fetch('/api/assets?status=damaged,broken');
			if (assetsResponse.ok) {
				damagedAssets = await assetsResponse.json();
			}

			// Load damage reports from maintenance records
			const maintenanceResponse = await fetch('/api/maintenance?type=damage');
			if (maintenanceResponse.ok) {
				damageReports = await maintenanceResponse.json();
			}
		} catch (error) {
			console.error('Error loading damage data:', error);
		} finally {
			loading = false;
		}
	}

	function openRepairModal(asset: any) {
		selectedAsset = asset;
		repairForm = {
			description: '',
			cost: '',
			status: 'IN_PROGRESS',
			notes: ''
		};
		showRepairModal = true;
	}

	async function handleRepair() {
		if (!selectedAsset) return;

		try {
			const response = await fetch(`/api/assets/${selectedAsset.id}/repair`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(repairForm)
			});

			if (response.ok) {
				showRepairModal = false;
				await loadData();
			} else {
				const error = await response.json();
				alert(`Error: ${error.error}`);
			}
		} catch (error) {
			console.error('Error updating repair:', error);
			alert('Failed to update repair');
		}
	}

	function getStatusColor(status: string) {
		switch (status.toLowerCase()) {
			case 'available': return 'bg-success-light text-success';
			case 'in use': return 'bg-primary-100 text-primary-600';
			case 'maintenance': return 'bg-warning-light text-warning';
			case 'damaged': return 'bg-error-light text-error';
			case 'broken': return 'bg-error-light text-error';
			default: return 'bg-secondary-100 text-secondary-600';
		}
	}

	function getSeverityColor(severity: string) {
		switch (severity) {
			case 'minor': return 'bg-yellow-100 text-yellow-800';
			case 'moderate': return 'bg-orange-100 text-orange-800';
			case 'major': return 'bg-red-100 text-red-800';
			case 'broken': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Damage Management - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->

	<div class="bg-gradient-to-r from-red-700 to-rose-800 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
		  <div>
			<h1 class="text-3xl font-bold">Damage Management</h1>
			<p class="text-white/80 mt-2 text-lg">Track and manage damaged equipment</p>
		  </div>
		  <div class="text-right flex space-x-4">
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{damagedAssets.length}</div>
				<div class="text-white/90 text-sm">Damaged Assets</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{damageReports.length}</div>
				<div class="text-white/90 text-sm">Damage Reports</div>
			</div>
		  </div>
		</div>
	  </div>

	<!-- Damaged Assets -->
	<Card>
		<div class="p-6 border-b border-card">
			<h2 class="text-xl font-semibold text-primary">Damaged Assets ({damagedAssets.length})</h2>
			<p class="text-secondary mt-1">Equipment requiring repair or replacement</p>
		</div>
		<div class="p-6">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
				</div>
			{:else if damagedAssets.length === 0}
				<div class="text-center py-12">
					<div class="text-6xl mb-4">✅</div>
					<h3 class="text-lg font-medium text-primary mb-2">No damaged assets</h3>
					<p class="text-secondary">All equipment is in good condition</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each damagedAssets as asset}
						<div class="bg-secondary border border-card rounded-xl p-4 hover:shadow-custom-md transition-all duration-200">
							<div class="flex items-center justify-between mb-3">
								<h3 class="font-semibold text-primary truncate">{asset.itemName}</h3>
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
									{asset.status}
								</span>
							</div>
							
							<div class="space-y-2 mb-4">
								<div class="flex justify-between text-sm">
									<span class="text-secondary">Category:</span>
									<span class="text-primary">{asset.category?.name || 'Uncategorized'}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-secondary">Location:</span>
									<span class="text-primary truncate">{asset.location || '-'}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-secondary">Serial:</span>
									<span class="text-primary truncate">
										{#if asset.serialNumbers && asset.serialNumbers.length > 0}
											{asset.serialNumbers[0].serialNumber}
										{:else}
											-
										{/if}
									</span>
								</div>
							</div>
							
							<div class="flex space-x-2">
								<button
									on:click={() => openRepairModal(asset)}
									class="flex-1 bg-accent text-white text-center py-2 px-4 rounded-lg hover:bg-accent-secondary transition-colors duration-200 text-sm font-medium"
								>
									Start Repair
								</button>
								<a
									href="/admin/infrastructure"
									class="flex-1 bg-secondary text-primary text-center py-2 px-4 rounded-lg hover:bg-tertiary transition-colors duration-200 text-sm font-medium border border-card"
								>
									View Details
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Card>

	<!-- Damage Reports -->
	<Card>
		<div class="p-6 border-b border-card">
			<h2 class="text-xl font-semibold text-primary">Recent Damage Reports ({damageReports.length})</h2>
			<p class="text-secondary mt-1">Latest damage reports and their status</p>
		</div>
		<div class="p-6">
			{#if damageReports.length === 0}
				<div class="text-center py-8">
					<div class="text-4xl mb-4">📋</div>
					<p class="text-secondary">No damage reports found</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each damageReports as report}
						<div class="bg-secondary border border-card rounded-xl p-4 hover:shadow-custom-md transition-all duration-200">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="flex items-center space-x-3 mb-2">
										<h3 class="font-semibold text-primary">{report.asset?.itemName || 'Unknown Asset'}</h3>
										<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(report.asset?.status || 'unknown')}">
											{report.asset?.status || 'Unknown'}
										</span>
									</div>
									
									<div class="text-sm text-secondary mb-2">
										Reported by: {report.performedBy || 'Unknown'} • {formatDate(report.performedAt)}
									</div>
									
									{#if report.notes}
										<div class="text-sm text-primary bg-tertiary rounded-lg p-3 mb-3">
											{report.notes}
										</div>
									{/if}
									
									<div class="flex items-center space-x-4 text-xs text-secondary">
										{#if report.cost}
											<span>Cost: {formatCurrency(report.cost)}</span>
										{/if}
										<span>ID: {report.id}</span>
									</div>
								</div>
								
								<div class="flex-shrink-0 ml-4">
									<button
										on:click={() => openRepairModal(report.asset)}
										class="bg-accent text-white px-3 py-1 rounded-lg hover:bg-accent-secondary transition-colors duration-200 text-sm font-medium"
									>
										Manage
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Card>
</div>

<!-- Repair Modal -->
{#if showRepairModal && selectedAsset}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-card rounded-xl shadow-custom-lg max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-primary">Manage Repair</h3>
				<button
					on:click={() => showRepairModal = false}
					class="text-secondary hover:text-primary"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="mb-4 p-4 bg-secondary rounded-lg">
				<h4 class="font-medium text-primary">{selectedAsset.itemName}</h4>
				<p class="text-sm text-secondary">{selectedAsset.category?.name || 'Uncategorized'}</p>
				<p class="text-sm text-secondary">Status: {selectedAsset.status}</p>
			</div>
			
			<form on:submit|preventDefault={handleRepair} class="space-y-4">
				<div>
					<label for="repairDescription" class="block text-sm font-medium text-primary mb-2">Repair Description</label>
					<textarea
						id="repairDescription"
						bind:value={repairForm.description}
						required
						rows="3"
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						placeholder="Describe the repair work..."
					></textarea>
				</div>
				
				<div>
					<label for="repairCost" class="block text-sm font-medium text-primary mb-2">Repair Cost</label>
					<input
						id="repairCost"
						type="number"
						step="0.01"
						bind:value={repairForm.cost}
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						placeholder="0.00"
					/>
				</div>
				
				<div>
					<label for="repairStatus" class="block text-sm font-medium text-primary mb-2">Status</label>
					<select
						id="repairStatus"
						bind:value={repairForm.status}
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
					>
						<option value="IN_PROGRESS">In Progress</option>
						<option value="COMPLETED">Completed</option>
						<option value="CANCELLED">Cancelled</option>
					</select>
				</div>
				
				<div>
					<label for="repairNotes" class="block text-sm font-medium text-primary mb-2">Additional Notes</label>
					<textarea
						id="repairNotes"
						bind:value={repairForm.notes}
						rows="2"
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						placeholder="Any additional notes..."
					></textarea>
				</div>
				
				<div class="flex space-x-3">
					<button
						type="button"
						on:click={() => showRepairModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Update Repair
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 