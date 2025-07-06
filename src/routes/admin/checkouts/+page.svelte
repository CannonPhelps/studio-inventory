<script lang="ts">
	import { onMount } from 'svelte';

	let checkouts = [];
	let assets = [];
	let users = [];
	let loading = true;
	let showCheckoutForm = false;
	let selectedAsset = null;
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

	async function handleReturn(checkoutId) {
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

	function getStatusColor(status) {
		return status === 'Checked Out' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50';
	}
</script>

<svelte:head>
	<title>Admin Checkouts - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Admin Checkouts</h1>
			<p class="text-gray-600 mt-1">Manage all asset checkouts and returns</p>
		</div>
		<button
			onclick={() => showCheckoutForm = !showCheckoutForm}
			class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
		>
			{showCheckoutForm ? 'Cancel' : 'New Checkout'}
		</button>
	</div>

	<!-- Checkout Form -->
	{#if showCheckoutForm}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Create New Checkout</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Asset</label>
					<select
						bind:value={selectedAsset}
						class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
					>
						<option value="">Select an asset</option>
						{#each assets.filter(a => a.status === 'Available') as asset}
							<option value={asset.id}>{asset.itemName} - {asset.serialNumber || 'No Serial'}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">User</label>
					<select
						bind:value={selectedUser}
						class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
					>
						<option value="">Select a user</option>
						{#each users as user}
							<option value={user.name}>{user.name} ({user.email})</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
					<input
						type="date"
						bind:value={dueDate}
						class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
					<input
						type="text"
						bind:value={notes}
						placeholder="Optional notes"
						class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
					/>
				</div>
			</div>
			<div class="mt-6 flex justify-end space-x-3">
				<button
					onclick={() => showCheckoutForm = false}
					class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={handleCheckout}
					class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
				>
					Create Checkout
				</button>
			</div>
		</div>
	{/if}

	<!-- Checkouts Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200">
		<div class="p-6 border-b border-gray-200">
			<h2 class="text-xl font-semibold text-gray-900">All Checkouts</h2>
			<p class="text-gray-600 mt-1">View and manage all checkouts</p>
		</div>
		<div class="overflow-x-auto">
			{#if loading}
				<div class="p-6 text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
					<p class="text-gray-500 mt-2">Loading checkouts...</p>
				</div>
			{:else if checkouts.length === 0}
				<div class="p-6 text-center">
					<div class="text-gray-400 text-4xl mb-4">📤</div>
					<p class="text-gray-500">No checkouts found</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each checkouts as checkout}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{checkout.asset.itemName}</div>
										<div class="text-sm text-gray-500">{checkout.asset.serialNumber || 'No Serial'}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{checkout.user}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{new Date(checkout.checkoutAt).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
											class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
										>
											Return
										</button>
									{:else}
										<span class="text-gray-400">Returned</span>
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