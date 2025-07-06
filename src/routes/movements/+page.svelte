<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import AppLayout from '$lib/components/AppLayout.svelte';

	let { data } = $props<{ data: PageData }>();

	let movements = $state<any[]>([]);
	let assets = $state<any[]>([]);
	let loading = $state(true);
	let showMovementModal = $state(false);

	// Form data
	let newMovement = $state({
		assetId: '',
		fromLocation: '',
		toLocation: '',
		reason: '',
		notes: ''
	});

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

<svelte:head>
	<title>Movements - Studio Inventory</title>
</svelte:head>

<AppLayout user={data.user}>
	<div class="space-y-6">
		<!-- Header -->
		<div class="bg-gradient-to-r from-accent to-accent-secondary rounded-2xl p-4 md:p-6 text-white">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
				<div>
					<h1 class="text-2xl md:text-3xl font-bold">Movements</h1>
					<p class="text-white/80 mt-2">Track asset location changes and transfers</p>
				</div>
				<button
					on:click={() => showMovementModal = true}
					class="bg-white text-accent px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-medium"
				>
					Record Movement
				</button>
			</div>
		</div>

		<!-- Movements Table -->
		<div class="bg-card rounded-xl shadow-custom border border-card overflow-hidden">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
				</div>
			{:else if movements.length === 0}
				<div class="text-center py-12">
					<div class="text-6xl mb-4">🔄</div>
					<h3 class="text-lg font-medium text-primary mb-2">No movements recorded</h3>
					<p class="text-secondary mb-4">Asset movements will appear here once recorded</p>
					<button
						on:click={() => showMovementModal = true}
						class="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Record Movement
					</button>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-card">
						<thead class="bg-secondary">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Asset</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">From</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">To</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Reason</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date</th>
							</tr>
						</thead>
						<tbody class="bg-card divide-y divide-card">
							{#each movements as movement}
								<tr class="hover:bg-secondary transition-colors">
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-primary">{movement.asset?.name}</div>
											<div class="text-sm text-secondary">{movement.asset?.category?.name}</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
										{movement.fromLocation}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
										<span class="font-medium">{movement.toLocation}</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
										{movement.reason || '-'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
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
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-card rounded-xl shadow-custom border border-card p-6 w-full max-w-md">
				<h3 class="text-lg font-semibold text-primary mb-4">Record Movement</h3>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Asset</label>
						<select
							bind:value={newMovement.assetId}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						>
							<option value="">Select Asset</option>
							{#each assets as asset}
								<option value={asset.id}>{asset.name} - {asset.category?.name}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">From Location</label>
						<input
							type="text"
							bind:value={newMovement.fromLocation}
							placeholder="e.g., Storage Room A"
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">To Location</label>
						<input
							type="text"
							bind:value={newMovement.toLocation}
							placeholder="e.g., Studio B"
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Reason</label>
						<input
							type="text"
							bind:value={newMovement.reason}
							placeholder="e.g., Production setup, Maintenance"
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Notes</label>
						<textarea
							bind:value={newMovement.notes}
							rows="3"
							placeholder="Additional notes..."
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						></textarea>
					</div>
				</div>
				
				<div class="flex space-x-3 mt-6">
					<button
						on:click={() => showMovementModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={createMovement}
						class="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Record
					</button>
				</div>
			</div>
		</div>
	{/if}
</AppLayout> 