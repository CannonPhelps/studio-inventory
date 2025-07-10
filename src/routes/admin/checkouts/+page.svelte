<script lang="ts">
	import { onMount } from 'svelte';

	interface Asset {
		id: number;
		itemName: string;
		serialNumbers?: Array<{ serialNumber: string }>;
		status: string;
	}

	interface User {
		id: string;
		name: string;
		email: string;
	}

	interface Checkout {
		id: number;
		asset: Asset;
		user: string;
		checkoutAt: string;
		dueAt: string;
		returnedAt?: string;
	}

	let checkouts: Checkout[] = [];
	let assets: Asset[] = [];
	let users: User[] = [];
	let loading = true;
	let showCheckoutForm = false;
	let selectedAsset: number | null = null;
	let selectedUser = '';
	let dueDate = '';
	let notes = '';

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			const [checkoutsRes, assetsRes, usersRes] = await Promise.all([
				fetch('/api/checkouts'),
				fetch('/api/assets'),
				fetch('/api/admin/users')
			]);

			if (checkoutsRes.ok) checkouts = await checkoutsRes.json();
			if (assetsRes.ok) assets = await assetsRes.json();
			if (usersRes.ok) users = await usersRes.json();

			loading = false;
		} catch (error) {
			console.error('Error loading data:', error);
			loading = false;
		}
	}

	async function handleCheckout() {
		if (!selectedAsset || !selectedUser || !dueDate) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			const response = await fetch('/api/checkouts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					assetId: selectedAsset,
					user: selectedUser,
					expectedReturnDate: dueDate,
					notes
				})
			});

			if (response.ok) {
				await loadData();
				showCheckoutForm = false;
				selectedAsset = null;
				selectedUser = '';
				dueDate = '';
				notes = '';
			} else {
				alert('Failed to create checkout');
			}
		} catch (error) {
			console.error('Error creating checkout:', error);
			alert('Error creating checkout');
		}
	}

	async function handleReturn(checkoutId: number) {
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
			? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' 
			: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
	}
</script>

<svelte:head>
	<title>Admin Checkouts - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-primary">Admin Checkouts</h1>
			<p class="text-secondary mt-1">Manage all asset checkouts and returns</p>
		</div>
		<button
			onclick={() => showCheckoutForm = !showCheckoutForm}
			class="bg-accent hover:bg-accent-secondary text-white px-4 py-2 rounded-lg transition-colors"
		>
			{showCheckoutForm ? 'Cancel' : 'New Checkout'}
		</button>
	</div>

	<!-- Checkout Form -->
	{#if showCheckoutForm}
		<div class="bg-card rounded-xl shadow-sm border border-card p-6">
			<h2 class="text-xl font-semibold text-primary mb-4">Create New Checkout</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-secondary mb-2">Asset</label>
					<select
						bind:value={selectedAsset}
						class="w-full p-3 border border-card bg-input text-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
					>
						<option value="">Select an asset</option>
						{#each assets.filter(a => a.status === 'Available') as asset}
							<option value={asset.id}>{asset.itemName} - {asset.serialNumbers?.[0]?.serialNumber || 'No Serial'}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-secondary mb-2">User</label>
					<select
						bind:value={selectedUser}
						class="w-full p-3 border border-card bg-input text-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
					>
						<option value="">Select a user</option>
						{#each users as user}
							<option value={user.name}>{user.name} ({user.email})</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-secondary mb-2">Due Date</label>
					<input
						type="date"
						bind:value={dueDate}
						class="w-full p-3 border border-card bg-input text-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-secondary mb-2">Notes</label>
					<input
						type="text"
						bind:value={notes}
						placeholder="Optional notes"
						class="w-full p-3 border border-card bg-input text-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
					/>
				</div>
			</div>
			<div class="mt-6 flex space-x-3">
				<button
					onclick={() => showCheckoutForm = false}
					class="flex-1 bg-tertiary hover:bg-secondary text-primary px-4 py-2 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={handleCheckout}
					class="flex-1 bg-accent hover:bg-accent-secondary text-white px-6 py-2 rounded-lg transition-colors"
				>
					Create Checkout
				</button>
			</div>
		</div>
	{/if}

	<!-- Checkouts Table -->
	<div class="bg-card rounded-xl shadow-sm border border-card">
		<div class="p-6 border-b border-card">
			<h2 class="text-xl font-semibold text-primary">All Checkouts</h2>
			<p class="text-secondary mt-1">View and manage all checkouts</p>
		</div>
		<div class="overflow-x-auto">
			{#if loading}
				<div class="p-6 text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
					<p class="text-secondary mt-2">Loading checkouts...</p>
				</div>
			{:else if checkouts.length === 0}
				<div class="p-6 text-center">
					<div class="text-tertiary text-4xl mb-4">📤</div>
					<h3 class="text-lg font-medium text-primary mb-2">No checkouts found</h3>
					<p class="text-secondary">Create your first checkout to get started.</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-tertiary">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">User</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Checkout Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Due Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-card">
						{#each checkouts as checkout}
							<tr class="hover:bg-tertiary transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-primary">{checkout.asset.itemName}</div>
										<div class="text-sm text-secondary">{checkout.asset.serialNumbers?.[0]?.serialNumber || 'No Serial'}</div>
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
										{checkout.returnedAt ? 'Returned' : 'Checked Out'}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									{#if !checkout.returnedAt}
										<button
											onclick={() => handleReturn(checkout.id)}
											class="text-error hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 px-3 py-1 rounded-md transition-colors"
										>
											Return
										</button>
									{:else}
										<span class="text-tertiary">Returned</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div> 