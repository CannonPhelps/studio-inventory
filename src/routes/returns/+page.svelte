<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import AppLayout from '$lib/components/AppLayout.svelte';

	let { data } = $props<{ data: PageData }>();

	let returns = $state<any[]>([]);
	let checkouts = $state<any[]>([]);
	let loading = $state(true);
	let showReturnModal = $state(false);

	// Form data
	let newReturn = $state({
		checkoutId: '',
		returnDate: '',
		condition: 'GOOD',
		notes: ''
	});

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			const [returnsRes, checkoutsRes] = await Promise.all([
				fetch('/api/return'),
				fetch('/api/checkout?status=CHECKED_OUT')
			]);

			returns = await returnsRes.json();
			checkouts = await checkoutsRes.json();
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function createReturn() {
		try {
			const response = await fetch('/api/return', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newReturn)
			});

			if (response.ok) {
				await loadData();
				showReturnModal = false;
				resetForm();
			}
		} catch (error) {
			console.error('Error creating return:', error);
		}
	}

	function resetForm() {
		newReturn = {
			checkoutId: '',
			returnDate: '',
			condition: 'GOOD',
			notes: ''
		};
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function getConditionColor(condition: string) {
		switch (condition) {
			case 'GOOD': return 'bg-success-light text-success';
			case 'FAIR': return 'bg-warning-light text-warning';
			case 'POOR': return 'bg-error-light text-error';
			default: return 'bg-secondary-100 text-secondary-600';
		}
	}
</script>

<svelte:head>
	<title>Returns - Studio Inventory</title>
</svelte:head>

<AppLayout user={data.user}>
	<div class="space-y-6">
		<!-- Header -->
		<div class="bg-gradient-to-r from-accent to-accent-secondary rounded-2xl p-4 md:p-6 text-white">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
				<div>
					<h1 class="text-2xl md:text-3xl font-bold">Returns</h1>
					<p class="text-white/80 mt-2">Process asset returns and track conditions</p>
				</div>
				<button
					on:click={() => showReturnModal = true}
					class="bg-white text-accent px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-medium"
				>
					Return Asset
				</button>
			</div>
		</div>

		<!-- Returns Table -->
		<div class="bg-card rounded-xl shadow-custom border border-card overflow-hidden">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
				</div>
			{:else if returns.length === 0}
				<div class="text-center py-12">
					<div class="text-6xl mb-4">📥</div>
					<h3 class="text-lg font-medium text-primary mb-2">No returns yet</h3>
					<p class="text-secondary mb-4">Assets will appear here once they are returned</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-card">
						<thead class="bg-secondary">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Asset</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">User</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Return Date</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Condition</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Notes</th>
							</tr>
						</thead>
						<tbody class="bg-card divide-y divide-card">
							{#each returns as returnRecord}
								<tr class="hover:bg-secondary transition-colors">
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-primary">
												{returnRecord.checkout?.asset?.name}
											</div>
											<div class="text-sm text-secondary">
												{returnRecord.checkout?.asset?.category?.name}
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="text-sm text-primary">
											{returnRecord.checkout?.user?.name || returnRecord.checkout?.userId}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
										{formatDate(returnRecord.returnDate)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getConditionColor(returnRecord.condition)}">
											{returnRecord.condition}
										</span>
									</td>
									<td class="px-6 py-4 text-sm text-primary">
										{returnRecord.notes || '-'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<!-- Return Modal -->
	{#if showReturnModal}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-card rounded-xl shadow-custom border border-card p-6 w-full max-w-md">
				<h3 class="text-lg font-semibold text-primary mb-4">Return Asset</h3>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Checkout Record</label>
						<select
							bind:value={newReturn.checkoutId}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						>
							<option value="">Select Checkout</option>
							{#each checkouts as checkout}
								<option value={checkout.id}>
									{checkout.asset?.name} - {checkout.user?.name || checkout.userId}
								</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Return Date</label>
						<input
							type="date"
							bind:value={newReturn.returnDate}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Condition</label>
						<select
							bind:value={newReturn.condition}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						>
							<option value="GOOD">Good</option>
							<option value="FAIR">Fair</option>
							<option value="POOR">Poor</option>
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Notes</label>
						<textarea
							bind:value={newReturn.notes}
							rows="3"
							placeholder="Optional notes about the return..."
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						></textarea>
					</div>
				</div>
				
				<div class="flex space-x-3 mt-6">
					<button
						on:click={() => showReturnModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={createReturn}
						class="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Return
					</button>
				</div>
			</div>
		</div>
	{/if}
</AppLayout> 