<script lang="ts">
	import { onMount } from 'svelte';

	let checkouts = [];
	let activeCheckouts = [];
	let pastCheckouts = [];
	let selectedCheckout = null;
	let showReturnModal = false;
	let returnForm = {
		condition: 'good',
		notes: ''
	};

	onMount(async () => {
		try {
			// Load all checkouts for current user
			const response = await fetch('/api/checkouts?user=current-user');
			if (response.ok) {
				checkouts = await response.json();
				activeCheckouts = checkouts.filter(c => c.status === 'Checked Out' || c.status === 'Overdue');
				pastCheckouts = checkouts.filter(c => c.status === 'Returned');
			}
		} catch (error) {
			console.error('Error loading checkouts:', error);
		}
	});

	function openReturnModal(checkout) {
		selectedCheckout = checkout;
		returnForm = {
			condition: 'good',
			notes: ''
		};
		showReturnModal = true;
	}

	async function handleReturn() {
		try {
			const response = await fetch('/api/checkouts', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					checkoutId: selectedCheckout.id,
					notes: returnForm.notes
				})
			});

			if (response.ok) {
				showReturnModal = false;
				// Refresh data
				await loadCheckouts();
			} else {
				const error = await response.json();
				alert(`Error: ${error.error}`);
			}
		} catch (error) {
			console.error('Error returning item:', error);
			alert('Failed to return item');
		}
	}

	async function loadCheckouts() {
		try {
			const response = await fetch('/api/checkouts?user=current-user');
			if (response.ok) {
				checkouts = await response.json();
				activeCheckouts = checkouts.filter(c => c.status === 'Checked Out' || c.status === 'Overdue');
				pastCheckouts = checkouts.filter(c => c.status === 'Returned');
			}
		} catch (error) {
			console.error('Error loading checkouts:', error);
		}
	}

	function getStatusColor(status) {
		switch (status) {
			case 'Checked Out': return 'text-blue-600 bg-blue-50';
			case 'Overdue': return 'text-red-600 bg-red-50';
			case 'Returned': return 'text-green-600 bg-green-50';
			default: return 'text-gray-600 bg-gray-50';
		}
	}

	function getStatusIcon(status) {
		switch (status) {
			case 'Checked Out': return '📤';
			case 'Overdue': return '⚠️';
			case 'Returned': return '✅';
			default: return '📋';
		}
	}

	function isOverdue(expectedReturn) {
		return new Date(expectedReturn) < new Date();
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getDaysRemaining(expectedReturn) {
		const today = new Date();
		const returnDate = new Date(expectedReturn);
		const diffTime = returnDate - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}
</script>

<svelte:head>
	<title>My Checkouts - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">My Checkouts</h1>
				<p class="text-blue-100 mt-2">Manage your checked out equipment</p>
			</div>
			<div class="hidden md:flex items-center space-x-4">
				<div class="text-center">
					<div class="text-2xl font-bold">{activeCheckouts.length}</div>
					<div class="text-blue-100 text-sm">Active Checkouts</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold">{pastCheckouts.length}</div>
					<div class="text-blue-100 text-sm">Past Checkouts</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Active Checkouts -->
	{#if activeCheckouts.length > 0}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200">
			<div class="p-6 border-b border-gray-200">
				<h2 class="text-xl font-semibold text-gray-900">Active Checkouts</h2>
				<p class="text-gray-600 mt-1">Items currently checked out to you</p>
			</div>
			<div class="p-6">
				<div class="space-y-4">
					{#each activeCheckouts as checkout}
						<div class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
							<div class="flex items-start justify-between">
								<div class="flex items-start space-x-4">
									<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
										<span class="text-2xl">{getStatusIcon(checkout.status)}</span>
									</div>
									<div class="flex-1">
										<div class="flex items-center space-x-3 mb-2">
											<h3 class="text-lg font-semibold text-gray-900">{checkout.assetName}</h3>
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(checkout.status)}">
												{checkout.status}
											</span>
										</div>
										
										<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
											<div>
												<span class="text-gray-600">Serial Number:</span>
												<p class="font-mono text-gray-900">{checkout.serialNumber}</p>
											</div>
											<div>
												<span class="text-gray-600">Location:</span>
												<p class="text-gray-900">{checkout.location}</p>
											</div>
											<div>
												<span class="text-gray-600">Checkout Date:</span>
												<p class="text-gray-900">{formatDate(checkout.checkoutDate)}</p>
											</div>
											<div>
												<span class="text-gray-600">Expected Return:</span>
												<p class="text-gray-900 {isOverdue(checkout.expectedReturn) ? 'text-red-600 font-medium' : ''}">
													{formatDate(checkout.expectedReturn)}
													{#if isOverdue(checkout.expectedReturn)}
														<span class="text-xs text-red-500 block">Overdue</span>
													{:else}
														<span class="text-xs text-gray-500 block">
															{getDaysRemaining(checkout.expectedReturn)} days remaining
														</span>
													{/if}
												</p>
											</div>
										</div>
										
										{#if checkout.notes}
											<div class="mt-3">
												<span class="text-gray-600 text-sm">Notes:</span>
												<p class="text-gray-900 text-sm italic">"{checkout.notes}"</p>
											</div>
										{/if}
									</div>
								</div>
								
								<div class="flex flex-col space-y-2">
									<button
										on:click={() => openReturnModal(checkout)}
										class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
									>
										Return Item
									</button>
									<a
										href="/checkout-panel"
										class="text-blue-600 hover:text-blue-700 text-sm font-medium text-center"
									>
										Check Out More
									</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
			<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<span class="text-3xl">📦</span>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">No Active Checkouts</h3>
			<p class="text-gray-600 mb-6">You don't have any items checked out right now.</p>
			<a
				href="/checkout-panel"
				class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				Browse Available Equipment
				<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</a>
		</div>
	{/if}

	<!-- Past Checkouts -->
	{#if pastCheckouts.length > 0}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200">
			<div class="p-6 border-b border-gray-200">
				<h2 class="text-xl font-semibold text-gray-900">Checkout History</h2>
				<p class="text-gray-600 mt-1">Previously returned items</p>
			</div>
			<div class="p-6">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-gray-200">
								<th class="text-left py-3 px-4 font-medium text-gray-900">Item</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Checkout Date</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Expected Return</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Actual Return</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each pastCheckouts as checkout}
								<tr class="hover:bg-gray-50 transition-colors">
									<td class="py-4 px-4">
										<div>
											<div class="font-medium text-gray-900">{checkout.assetName}</div>
											<div class="text-sm text-gray-600 font-mono">{checkout.serialNumber}</div>
										</div>
									</td>
									<td class="py-4 px-4 text-sm text-gray-900">{formatDate(checkout.checkoutDate)}</td>
									<td class="py-4 px-4 text-sm text-gray-900">{formatDate(checkout.expectedReturn)}</td>
									<td class="py-4 px-4 text-sm text-gray-900">{formatDate(checkout.actualReturn)}</td>
									<td class="py-4 px-4">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(checkout.status)}">
											{checkout.status}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<a
				href="/checkout-panel"
				class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
			>
				<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
					<span class="text-xl">📤</span>
				</div>
				<div>
					<h4 class="font-medium text-gray-900">Check Out Equipment</h4>
					<p class="text-sm text-gray-600">Browse available items</p>
				</div>
			</a>
			
			<a
				href="/assets"
				class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200"
			>
				<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
					<span class="text-xl">📦</span>
				</div>
				<div>
					<h4 class="font-medium text-gray-900">Browse Inventory</h4>
					<p class="text-sm text-gray-600">View all equipment</p>
				</div>
			</a>
			
			<a
				href="/maintenance"
				class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
			>
				<div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
					<span class="text-xl">🔧</span>
				</div>
				<div>
					<h4 class="font-medium text-gray-900">Report Issues</h4>
					<p class="text-sm text-gray-600">Maintenance requests</p>
				</div>
			</a>
		</div>
	</div>
</div>

<!-- Return Modal -->
{#if showReturnModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Return Item</h3>
				<button
					on:click={() => showReturnModal = false}
					class="text-gray-400 hover:text-gray-600"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="mb-4 p-4 bg-gray-50 rounded-lg">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
						<span class="text-xl">📦</span>
					</div>
					<div>
						<h4 class="font-medium text-gray-900">{selectedCheckout?.assetName}</h4>
						<p class="text-sm text-gray-600">Serial: {selectedCheckout?.serialNumber}</p>
					</div>
				</div>
			</div>

			<form on:submit|preventDefault={handleReturn} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Item Condition</label>
					<select
						bind:value={returnForm.condition}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="excellent">Excellent - Like new</option>
						<option value="good">Good - Minor wear</option>
						<option value="fair">Fair - Some damage</option>
						<option value="poor">Poor - Significant damage</option>
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Return Notes (Optional)</label>
					<textarea
						bind:value={returnForm.notes}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Any issues or notes about the return..."
					></textarea>
				</div>

				<div class="flex space-x-3 pt-4">
					<button
						type="button"
						on:click={() => showReturnModal = false}
						class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						Return Item
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 