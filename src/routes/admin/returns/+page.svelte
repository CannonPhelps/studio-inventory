<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';

	interface Checkout {
		id: string;
		asset?: {
			id: string;
			itemName: string;
			category?: {
				id: string;
				name: string;
			};
			serialNumbers?: Array<{ serialNumber: string }>;
		};
		user: string;
		checkoutAt: string;
		dueAt: string;
		returnedAt?: string;
		notes?: string;
	}

	interface ReturnForm {
		checkoutId: string;
		condition: string;
		notes: string;
	}

	let searchQuery = $state('');
	let selectedUser = $state('all');
	let viewMode = $state<'grid' | 'list'>('grid');
	let showReturnModal = $state(false);
	let selectedCheckout = $state<Checkout | null>(null);
	let returnForm = $state<ReturnForm>({
		checkoutId: '',
		condition: 'good',
		notes: ''
	});

	let checkouts = $state<Checkout[]>([]);
	let users = $state<string[]>([]);
	let filteredCheckouts = $state<Checkout[]>([]);
	let loading = $state(true);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;
			const checkoutsRes = await fetch('/api/checkouts');

			if (checkoutsRes.ok) {
				checkouts = await checkoutsRes.json();
				// Extract unique users
				users = [...new Set(checkouts.map(c => c.user))];
			}

			filterCheckouts();
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function filterCheckouts() {
		filteredCheckouts = checkouts.filter((checkout: Checkout) => {
			const searchLower = searchQuery.toLowerCase();
			const matchesSearch = 
				(checkout.asset?.itemName && checkout.asset.itemName.toLowerCase().includes(searchLower)) ||
				(checkout.asset?.serialNumbers && checkout.asset.serialNumbers.some(sn => sn.serialNumber.toLowerCase().includes(searchLower))) ||
				(checkout.asset?.category?.name && checkout.asset.category.name.toLowerCase().includes(searchLower)) ||
				checkout.user.toLowerCase().includes(searchLower);
			const matchesUser = selectedUser === 'all' || checkout.user === selectedUser;
			const isActive = !checkout.returnedAt; // Only show active checkouts
			return matchesSearch && matchesUser && isActive;
		});
	}

	function openReturnModal(checkout: Checkout) {
		selectedCheckout = checkout;
		returnForm = {
			checkoutId: checkout.id,
			condition: 'good',
			notes: ''
		};
		showReturnModal = true;
	}

	async function handleReturn() {
		if (!selectedCheckout) return;
		
		try {
			const response = await fetch('/api/admin/returns', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					checkoutId: selectedCheckout.id,
					condition: returnForm.condition,
					notes: returnForm.notes
				})
			});

			if (response.ok) {
				showReturnModal = false;
				await loadData();
			} else {
				const error = await response.json();
				alert(`Error: ${error.error}`);
			}
		} catch (error) {
			console.error('Error returning item:', error);
			alert('Failed to return item');
		}
	}

	function isOverdue(dueDate: string) {
		return new Date(dueDate) < new Date();
	}

	function getDaysOverdue(dueDate: string) {
		const due = new Date(dueDate);
		const now = new Date();
		const diffTime = now.getTime() - due.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Admin Returns - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Admin Returns</h1>
				<p class="text-white/80 mt-2 text-lg">Return equipment for any user</p>
			</div>
			<div class="text-right flex space-x-4">
				<div class="text-center">
					<div class="text-2xl font-bold text-white">{checkouts.filter(c => !c.returnedAt).length}</div>
					<div class="text-white/90 text-sm">Active Checkouts</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-white">{checkouts.filter(c => !c.returnedAt && isOverdue(c.dueAt)).length}</div>
					<div class="text-white/90 text-sm">Overdue</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Search and Filters -->
	<Card>
		<div class="flex flex-col space-y-4">
			<!-- Search -->
			<div class="w-full">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						on:input={filterCheckouts}
						placeholder="Search by item name or serial number..."
						class="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
					/>
					<svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			<!-- Filters -->
			<div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
				<select
					bind:value={selectedUser}
					on:change={filterCheckouts}
					class="flex-1 px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
				>
					<option value="all">All Users</option>
					{#each users as user}
						<option value={user}>{user}</option>
					{/each}
				</select>

				<!-- View Mode Toggle -->
				<div class="hidden sm:flex border border-gray-300 rounded-lg self-center">
					<button
						on:click={() => viewMode = 'grid'}
						class="p-3 {viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-l-lg transition-all duration-200"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<button
						on:click={() => viewMode = 'list'}
						class="p-3 {viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-r-lg transition-all duration-200"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</Card>

	<!-- Active Checkouts -->
	<Card>
		<div class="flex items-center space-x-4 mb-6">
			<div class="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
				<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<h3 class="text-2xl font-semibold text-gray-900">Active Checkouts ({filteredCheckouts.length} items)</h3>
		</div>
		
		{#if loading}
			<div class="text-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
				<p class="text-gray-500 mt-4">Loading checkouts...</p>
			</div>
		{:else if viewMode === 'grid'}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{#each filteredCheckouts as checkout}
					<div class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 {isOverdue(checkout.dueAt) ? 'border-red-300 bg-red-50' : ''}">
						<div class="text-center mb-4">
							<div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
								<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<h4 class="text-gray-900 font-medium truncate">{checkout.asset?.itemName || 'Unknown Item'}</h4>
							<p class="text-gray-600 text-sm truncate">{checkout.asset?.category?.name || 'Uncategorized'}</p>
						</div>
						
						<div class="space-y-2 mb-4">
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">User:</span>
								<span class="text-gray-900 truncate ml-2">{checkout.user}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Checkout:</span>
								<span class="text-gray-900 truncate ml-2">{formatDate(checkout.checkoutAt)}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Due:</span>
								<span class="text-gray-900 truncate ml-2 {isOverdue(checkout.dueAt) ? 'text-red-600 font-semibold' : ''}">
									{formatDate(checkout.dueAt)}
									{#if isOverdue(checkout.dueAt)}
										<span class="text-red-500 text-xs">({getDaysOverdue(checkout.dueAt)} days overdue)</span>
									{/if}
								</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Serial:</span>
								<span class="text-gray-900 truncate ml-2">
									{#if checkout.asset?.serialNumbers && checkout.asset.serialNumbers.length > 0}
										{checkout.asset.serialNumbers[0].serialNumber}
										{#if checkout.asset.serialNumbers.length > 1}
											<span class="text-gray-500"> +{checkout.asset.serialNumbers.length - 1}</span>
										{/if}
									{:else}
										-
									{/if}
								</span>
							</div>
						</div>
						
						<button
							on:click={() => openReturnModal(checkout)}
							class="w-full bg-orange-500 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm font-medium"
						>
							Return
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="space-y-3">
				{#each filteredCheckouts as checkout}
					<div class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 {isOverdue(checkout.dueAt) ? 'border-red-300 bg-red-50' : ''}">
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<h4 class="text-gray-900 font-medium truncate">{checkout.asset?.itemName || 'Unknown Item'}</h4>
								<p class="text-gray-600 text-sm truncate">{checkout.asset?.category?.name || 'Uncategorized'}</p>
								<div class="flex items-center space-x-4 mt-1 text-xs text-gray-500">
									<span>User: {checkout.user}</span>
									<span>Checkout: {formatDate(checkout.checkoutAt)}</span>
									<span class="{isOverdue(checkout.dueAt) ? 'text-red-600 font-semibold' : ''}">
										Due: {formatDate(checkout.dueAt)}
										{#if isOverdue(checkout.dueAt)}
											<span class="text-red-500">({getDaysOverdue(checkout.dueAt)} days overdue)</span>
										{/if}
									</span>
								</div>
							</div>
							<div class="flex-shrink-0">
								<button
									on:click={() => openReturnModal(checkout)}
									class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm font-medium"
								>
									Return
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
		
		{#if filteredCheckouts.length === 0 && !loading}
			<div class="text-center py-12">
				<div class="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4 inline-block">
					<svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<p class="text-gray-500 text-lg">No active checkouts found</p>
			</div>
		{/if}
	</Card>
</div>

<!-- Return Modal -->
{#if showReturnModal && selectedCheckout}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Return Equipment</h3>
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
				<h4 class="font-medium text-gray-900">{selectedCheckout.asset?.itemName || 'Unknown Item'}</h4>
				<p class="text-sm text-gray-600">{selectedCheckout.asset?.category?.name || 'Uncategorized'}</p>
				<p class="text-sm text-gray-600 mt-1">Checked out by: {selectedCheckout.user}</p>
				<p class="text-sm text-gray-600">Due: {formatDate(selectedCheckout.dueAt)}</p>
			</div>
			
			<form on:submit|preventDefault={handleReturn} class="space-y-4">
				<div>
					<label for="condition" class="block text-sm font-medium text-gray-700 mb-2">Return Condition</label>
					<select
						id="condition"
						bind:value={returnForm.condition}
						class="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
					>
						<option value="excellent">Excellent</option>
						<option value="good">Good</option>
						<option value="fair">Fair</option>
						<option value="poor">Poor</option>
						<option value="damaged">Damaged</option>
					</select>
				</div>
				
				<div>
					<label for="returnNotes" class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
					<textarea
						id="returnNotes"
						bind:value={returnForm.notes}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						placeholder="Any issues or notes..."
					></textarea>
				</div>
				
				<div class="flex space-x-3">
					<button
						type="button"
						on:click={() => showReturnModal = false}
						class="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
					>
						Return
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 