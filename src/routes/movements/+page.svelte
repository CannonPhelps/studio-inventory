<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Card from '$lib/components/Card.svelte';

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

<div class="space-y-6">
	<!-- Header -->

	<div class="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
		  <div>
			<h1 class="text-3xl font-bold">Movements</h1>
			<p class="text-white/80 mt-2 text-lg">Track asset location changes and transfers</p>
		  </div>
		  <div class="text-right flex space-x-4">
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{movements.length}</div>
				<div class="text-white/90 text-sm">Total Movements</div>
			</div>
			<div class="text-center">
				<button
					on:click={() => showMovementModal = true}
					class="bg-white text-cyan-600 px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-medium"
				>
					Record Movement
				</button>
			</div>
		  </div>
		</div>
	  </div>

	<!-- Movements Table -->
	<Card gradient="from-accent-info to-cyan-500" padding="p-6">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white"></div>
			</div>
		{:else if movements.length === 0}
			<div class="text-center py-12">
				<div class="p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full mb-4 inline-block">
					<svg class="h-12 w-12 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				</div>
				<h3 class="text-lg font-medium text-white mb-2">No movements recorded</h3>
				<p class="text-white/60 mb-4">Asset movements will appear here once recorded</p>
				<button
					on:click={() => showMovementModal = true}
					class="bg-white text-accent-info px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
				>
					Record Movement
				</button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-white/20">
					<thead class="bg-white/10">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">From</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">To</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Reason</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
						</tr>
					</thead>
					<tbody class="bg-white/5 divide-y divide-white/10">
						{#each movements as movement}
							<tr class="hover:bg-white/10 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-white">{movement.asset?.name}</div>
										<div class="text-sm text-white/70">{movement.asset?.category?.name}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-white">
									{movement.fromLocation}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-white">
									<span class="font-medium">{movement.toLocation}</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-white">
									{movement.reason || '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-white">
									{formatDateTime(movement.createdAt)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</Card>
</div>

<!-- Movement Modal -->
{#if showMovementModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-card rounded-xl shadow-custom-lg border border-card p-6 w-full max-w-md">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-primary">Record Movement</h3>
				<button
					on:click={() => showMovementModal = false}
					class="text-secondary hover:text-primary"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<form on:submit|preventDefault={createMovement} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-primary mb-2">Asset</label>
					<select
						bind:value={newMovement.assetId}
						required
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-info focus:border-transparent"
					>
						<option value="">Select Asset</option>
						{#each assets as asset}
							<option value={asset.id}>{asset.name} - {asset.category?.name}</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-primary mb-2">From Location</label>
					<input
						type="text"
						bind:value={newMovement.fromLocation}
						placeholder="e.g., Storage Room A"
						required
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-info focus:border-transparent"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-primary mb-2">To Location</label>
					<input
						type="text"
						bind:value={newMovement.toLocation}
						placeholder="e.g., Studio B"
						required
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-info focus:border-transparent"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-primary mb-2">Reason</label>
					<input
						type="text"
						bind:value={newMovement.reason}
						placeholder="e.g., Setup for production"
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-info focus:border-transparent"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-primary mb-2">Notes (Optional)</label>
					<textarea
						bind:value={newMovement.notes}
						rows="3"
						placeholder="Additional details..."
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-info focus:border-transparent"
					></textarea>
				</div>
				
				<div class="flex space-x-3">
					<button
						type="button"
						on:click={() => showMovementModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-accent-info text-white rounded-lg hover:bg-cyan-600 transition-colors"
					>
						Record Movement
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 