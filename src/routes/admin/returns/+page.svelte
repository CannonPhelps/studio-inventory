<script lang="ts">
	import { onMount } from 'svelte';

	interface Asset {
		id: string;
		itemName: string;
		serialNumbers?: Array<{ serialNumber: string }>;
		status: string;
	}

	interface Checkout {
		id: string;
		user: string;
		checkoutAt: string;
		dueAt: string;
		returnedAt?: string;
		asset: Asset;
	}

	let checkouts: Checkout[] = [];
	let loading = true;

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			const response = await fetch('/api/checkouts');
			if (response.ok) {
				checkouts = await response.json();
			}
			loading = false;
		} catch (error) {
			console.error('Error loading data:', error);
			loading = false;
		}
	}

	async function handleReturn(checkoutId: string) {
		try {
			const response = await fetch('/api/checkouts', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					checkoutId,
					notes: 'Returned by admin'
				})
			});

			if (response.ok) {
				await loadData();
			} else {
				alert('Failed to return item');
			}
		} catch (error) {
			console.error('Error returning item:', error);
			alert('Error returning item');
		}
	}

	function getStatusColor(status: string) {
		return status === 'Checked Out' 
			? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20' 
			: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
	}
</script>

<svelte:head>
	<title>Admin Returns - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-primary">Admin Returns</h1>
		<p class="text-primary mt-1">Manage asset returns and track return history</p>
	</div>

	<!-- Active Checkouts -->
	<div class="bg-card rounded-xl shadow-sm border border-border">
		<div class="p-6 border-b border-border">
			<h2 class="text-xl font-semibold text-primary">Active Checkouts</h2>
			<p class="text-primary mt-1">Items currently checked out</p>
		</div>
		<div class="overflow-x-auto">
			{#if loading}
				<div class="p-6 text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p class="text-muted-foreground mt-2">Loading checkouts...</p>
				</div>
			{:else if checkouts.filter(c => !c.returnedAt).length === 0}
				<div class="p-6 text-center">
					<div class="text-muted-foreground text-4xl mb-4">📥</div>
					<p class="text-primary">No active checkouts</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-muted/50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Checkout Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="bg-card divide-y divide-border">
						{#each checkouts.filter(c => !c.returnedAt) as checkout}
							<tr class="hover:bg-muted/50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-primary">{checkout.asset.itemName}</div>
										<div class="text-sm text-muted-foreground">{checkout.asset.serialNumbers?.[0]?.serialNumber || 'No Serial'}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">{checkout.user}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
									{new Date(checkout.checkoutAt).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
									{new Date(checkout.dueAt).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(checkout.asset.status)}">
										Checked Out
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button
										on:click={() => handleReturn(checkout.id)}
										class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 px-3 py-1 rounded-md transition-colors"
									>
										Return
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>

	<!-- Return History -->
	<div class="bg-card rounded-xl shadow-sm border border-border">
		<div class="p-6 border-b border-border">
			<h2 class="text-xl font-semibold text-primary">Return History</h2>
			<p class="text-primary mt-1">Recently returned items</p>
		</div>
		<div class="overflow-x-auto">
			{#if checkouts.filter(c => c.returnedAt).length === 0}
				<div class="p-6 text-center">
					<div class="text-muted-foreground text-4xl mb-4">📋</div>
					<p class="text-primary">No return history</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-muted/50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">User</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Checkout Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Return Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Status</th>
						</tr>
					</thead>
					<tbody class="bg-card divide-y divide-border">
						{#each checkouts.filter(c => c.returnedAt).slice(0, 10) as checkout}
							<tr class="hover:bg-muted/50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-primary">{checkout.asset.itemName}</div>
										<div class="text-sm text-primary">{checkout.asset.serialNumbers?.[0]?.serialNumber || 'No Serial'}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">{checkout.user}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
									{new Date(checkout.checkoutAt).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
									{checkout.returnedAt ? new Date(checkout.returnedAt).toLocaleDateString() : '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20">
										Returned
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div> 