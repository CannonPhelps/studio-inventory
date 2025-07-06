<script lang="ts">
	import { onMount } from 'svelte';

	let checkouts: any[] = [];
	let assets: any[] = [];
	let loading = true;
	let showCheckoutModal = false;
	let statusFilter = '';

	// Form data
	let newCheckout = {
		assetId: '',
		userId: '',
		expectedReturnDate: '',
		notes: ''
	};

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			const [checkoutsRes, assetsRes] = await Promise.all([
				fetch('/api/checkout'),
				fetch('/api/assets?status=AVAILABLE')
			]);

			checkouts = await checkoutsRes.json();
			assets = await assetsRes.json();
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function createCheckout() {
		try {
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCheckout)
			});

			if (response.ok) {
				await loadData();
				showCheckoutModal = false;
				resetForm();
			}
		} catch (error) {
			console.error('Error creating checkout:', error);
		}
	}

	function resetForm() {
		newCheckout = {
			assetId: '',
			userId: '',
			expectedReturnDate: '',
			notes: ''
		};
	}

	$: filteredCheckouts = checkouts.filter(checkout => {
		return !statusFilter || checkout.status === statusFilter;
	});

	function getStatusColor(status: string) {
		switch (status) {
			case 'CHECKED_OUT': return 'bg-yellow-100 text-yellow-800';
			case 'RETURNED': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Checkouts</h1>
			<p class="mt-2 text-gray-600">Track asset checkouts and returns</p>
		</div>
		<button
			on:click={() => showCheckoutModal = true}
			class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
		>
			Checkout Asset
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
					<option value="CHECKED_OUT">Checked Out</option>
					<option value="RETURNED">Returned</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Checkouts Table -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		{:else if filteredCheckouts.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">📤</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No checkouts found</h3>
				<p class="text-gray-500 mb-4">Start by checking out an asset</p>
				<button
					on:click={() => showCheckoutModal = true}
					class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
				>
					Checkout Asset
				</button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredCheckouts as checkout}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{checkout.asset?.name}</div>
										<div class="text-sm text-gray-500">{checkout.asset?.category?.name}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm text-gray-900">{checkout.user?.name || checkout.userId}</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatDate(checkout.checkoutDate)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{checkout.expectedReturnDate ? formatDate(checkout.expectedReturnDate) : '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(checkout.status)}">
										{checkout.status}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Checkout Modal -->
{#if showCheckoutModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-md">
			<h2 class="text-xl font-bold mb-4">Checkout Asset</h2>
			
			<form on:submit|preventDefault={createCheckout} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Asset *</label>
					<select
						bind:value={newCheckout.assetId}
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
					<label class="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
					<input
						type="text"
						bind:value={newCheckout.userId}
						required
						placeholder="Enter user ID"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
					<input
						type="date"
						bind:value={newCheckout.expectedReturnDate}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
					<textarea
						bind:value={newCheckout.notes}
						rows="3"
						placeholder="Optional notes"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
				</div>
				
				<div class="flex justify-end space-x-3 pt-4">
					<button
						type="button"
						on:click={() => { showCheckoutModal = false; resetForm(); }}
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Checkout Asset
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 