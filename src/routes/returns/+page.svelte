<script lang="ts">
	import { onMount } from 'svelte';

	let returns: any[] = [];
	let checkouts: any[] = [];
	let loading = true;
	let showReturnModal = false;

	// Form data
	let newReturn = {
		checkoutId: '',
		returnDate: '',
		condition: 'GOOD',
		notes: ''
	};

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
			case 'GOOD': return 'bg-green-100 text-green-800';
			case 'FAIR': return 'bg-yellow-100 text-yellow-800';
			case 'POOR': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Returns</h1>
			<p class="mt-2 text-gray-600">Process asset returns and track conditions</p>
		</div>
		<button
			on:click={() => showReturnModal = true}
			class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
		>
			Return Asset
		</button>
	</div>

	<!-- Returns Table -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		{:else if returns.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">📥</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No returns yet</h3>
				<p class="text-gray-500 mb-4">Assets will appear here once they are returned</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each returns as returnRecord}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">
											{returnRecord.checkout?.asset?.name}
										</div>
										<div class="text-sm text-gray-500">
											{returnRecord.checkout?.asset?.category?.name}
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm text-gray-900">
										{returnRecord.checkout?.user?.name || returnRecord.checkout?.userId}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatDate(returnRecord.returnDate)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getConditionColor(returnRecord.condition)}">
										{returnRecord.condition}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-gray-900">
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
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-md">
			<h2 class="text-xl font-bold mb-4">Return Asset</h2>
			
			<form on:submit|preventDefault={createReturn} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Checkout Record *</label>
					<select
						bind:value={newReturn.checkoutId}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
					<label class="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
					<input
						type="date"
						bind:value={newReturn.returnDate}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Condition</label>
					<select
						bind:value={newReturn.condition}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="GOOD">Good</option>
						<option value="FAIR">Fair</option>
						<option value="POOR">Poor</option>
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
					<textarea
						bind:value={newReturn.notes}
						rows="3"
						placeholder="Optional notes about the return"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
				</div>
				
				<div class="flex justify-end space-x-3 pt-4">
					<button
						type="button"
						on:click={() => { showReturnModal = false; resetForm(); }}
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
					>
						Return Asset
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 