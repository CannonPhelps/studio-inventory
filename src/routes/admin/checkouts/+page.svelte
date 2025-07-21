<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';

	interface Asset {
		id: string;
		itemName: string;
		category?: {
			id: string;
			name: string;
		};
		status: string;
		location: string;
		serialNumbers?: Array<{ serialNumber: string }>;
		image?: string;
	}

	interface User {
		id: string;
		name: string;
		email: string;
		role: string;
	}

	interface CheckoutForm {
		assetId: string;
		userId: string;
		expectedReturnDate: string;
		notes: string;
	}

	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let viewMode = $state<'grid' | 'list'>('grid');
	let showCheckoutModal = $state(false);
	let selectedAsset = $state<Asset | null>(null);
	let checkoutForm = $state<CheckoutForm>({
		assetId: '',
		userId: '',
		expectedReturnDate: '',
		notes: ''
	});

	let assets = $state<Asset[]>([]);
	let users = $state<User[]>([]);
	let categories = $state<any[]>([]);
	let filteredAssets = $state<Asset[]>([]);
	let loading = $state(true);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;
			const [assetsRes, usersRes, categoriesRes] = await Promise.all([
				fetch('/api/assets'),
				fetch('/api/admin/users'),
				fetch('/api/categories')
			]);

			if (assetsRes.ok) {
				assets = await assetsRes.json();
			}

			if (usersRes.ok) {
				users = await usersRes.json();
			}

			if (categoriesRes.ok) {
				const categoryData = await categoriesRes.json();
				categories = [
					{ id: 'all', name: 'All Categories', count: assets.length },
					...categoryData.map((cat: any) => ({
						id: cat.name.toLowerCase(),
						name: cat.name,
						count: cat.count
					}))
				];
			}

			filterAssets();
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function filterAssets() {
		filteredAssets = assets.filter((asset: Asset) => {
			const searchLower = searchQuery.toLowerCase();
			const matchesSearch = 
				asset.itemName.toLowerCase().includes(searchLower) ||
				(asset.serialNumbers && asset.serialNumbers.some(sn => sn.serialNumber.toLowerCase().includes(searchLower))) ||
				(asset.category?.name && asset.category.name.toLowerCase().includes(searchLower)) ||
				(asset.location && asset.location.toLowerCase().includes(searchLower));
			const matchesCategory = selectedCategory === 'all' || asset.category?.name.toLowerCase() === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}

	function openCheckoutModal(asset: Asset) {
		selectedAsset = asset;
		checkoutForm = {
			assetId: asset.id,
			userId: '',
			expectedReturnDate: '',
			notes: ''
		};
		showCheckoutModal = true;
	}

	async function handleCheckout() {
		if (!selectedAsset || !checkoutForm.userId) return;
		
		try {
			const response = await fetch('/api/admin/checkouts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					assetId: selectedAsset.id,
					userId: checkoutForm.userId,
					expectedReturnDate: checkoutForm.expectedReturnDate,
					notes: checkoutForm.notes
				})
			});

			if (response.ok) {
				showCheckoutModal = false;
				await loadData();
			} else {
				const error = await response.json();
				alert(`Error: ${error.error}`);
			}
		} catch (error) {
			console.error('Error checking out item:', error);
			alert('Failed to check out item');
		}
	}

	function getStatusColor(status: string) {
		switch (status.toLowerCase()) {
			case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'checked out': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
			case 'retired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
		}
	}
</script>

<svelte:head>
	<title>Admin Checkouts - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Admin Checkouts</h1>
				<p class="text-white/80 dark:text-white/90 mt-2 text-lg">Check out equipment for any user</p>
			</div>
			<div class="text-right flex space-x-4">
				<div class="text-center">
					<div class="text-2xl font-bold text-white">{assets.filter(a => a.status === 'Available').length}</div>
					<div class="text-white/90 dark:text-white/80 text-sm">Available</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-white">{users.length}</div>
					<div class="text-white/90 dark:text-white/80 text-sm">Users</div>
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
						on:input={filterAssets}
						placeholder="Search by name or serial number..."
						class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base placeholder-gray-500 dark:placeholder-gray-400"
					/>
					<svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			<!-- Filters -->
			<div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
				<select
					bind:value={selectedCategory}
					on:change={filterAssets}
					class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
				>
					{#each categories as category}
						<option value={category.id}>{category.name} ({category.count})</option>
					{/each}
				</select>

				<!-- View Mode Toggle -->
				<div class="hidden sm:flex border border-gray-300 dark:border-gray-600 rounded-lg self-center">
					<button
						on:click={() => viewMode = 'grid'}
						class="p-3 {viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-l-lg transition-all duration-200"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<button
						on:click={() => viewMode = 'list'}
						class="p-3 {viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r-lg transition-all duration-200"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</Card>

	<!-- Available Assets -->
	<Card>
		<div class="flex items-center space-x-4 mb-6">
			<div class="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
				<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Available Equipment ({filteredAssets.filter(a => a.status === 'Available').length} items)</h3>
		</div>
		
		{#if loading}
			<div class="text-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
				<p class="text-gray-500 dark:text-gray-400 mt-4">Loading equipment...</p>
			</div>
		{:else if viewMode === 'grid'}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{#each filteredAssets.filter(a => a.status === 'Available') as asset}
					<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300">
						<div class="text-center mb-4">
							<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-3">
								<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
							</div>
							<h4 class="text-gray-900 dark:text-gray-100 font-medium truncate">{asset.itemName}</h4>
							<p class="text-gray-600 dark:text-gray-400 text-sm truncate">{asset.category?.name || 'Uncategorized'}</p>
						</div>
						
						<div class="space-y-2 mb-4">
							<div class="flex justify-between text-sm">
								<span class="text-gray-600 dark:text-gray-400">Location:</span>
								<span class="text-gray-900 dark:text-gray-100 truncate ml-2">{asset.location || '-'}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-600 dark:text-gray-400">Serial:</span>
								<span class="text-gray-900 dark:text-gray-100 truncate ml-2">
									{#if asset.serialNumbers && asset.serialNumbers.length > 0}
										{asset.serialNumbers[0].serialNumber}
										{#if asset.serialNumbers.length > 1}
											<span class="text-gray-500 dark:text-gray-500"> +{asset.serialNumbers.length - 1}</span>
										{/if}
									{:else}
										-
									{/if}
								</span>
							</div>
						</div>
						
						<button
							on:click={() => openCheckoutModal(asset)}
							class="w-full bg-blue-500 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
						>
							Check Out
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="space-y-3">
				{#each filteredAssets.filter(a => a.status === 'Available') as asset}
					<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300">
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<h4 class="text-gray-900 dark:text-gray-100 font-medium truncate">{asset.itemName}</h4>
								<p class="text-gray-600 dark:text-gray-400 text-sm truncate">{asset.category?.name || 'Uncategorized'}</p>
								<div class="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
									<span>Location: {asset.location || '-'}</span>
									<span>Serial: {asset.serialNumbers && asset.serialNumbers.length > 0 ? asset.serialNumbers[0].serialNumber : '-'}</span>
								</div>
							</div>
							<div class="flex-shrink-0">
								<button
									on:click={() => openCheckoutModal(asset)}
									class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
								>
									Check Out
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
		
		{#if filteredAssets.filter(a => a.status === 'Available').length === 0 && !loading}
			<div class="text-center py-12">
				<div class="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-4 inline-block">
					<svg class="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
				</div>
				<p class="text-gray-500 dark:text-gray-400 text-lg">No available equipment found</p>
			</div>
		{/if}
	</Card>
</div>

<!-- Checkout Modal -->
{#if showCheckoutModal && selectedAsset}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Check Out Equipment</h3>
				<button
					on:click={() => showCheckoutModal = false}
					class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<h4 class="font-medium text-gray-900 dark:text-gray-100">{selectedAsset.itemName}</h4>
				<p class="text-sm text-gray-600 dark:text-gray-400">{selectedAsset.category?.name || 'Uncategorized'}</p>
			</div>
			
			<form on:submit|preventDefault={handleCheckout} class="space-y-4">
				<div>
					<label for="userId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User *</label>
					<select
						id="userId"
						bind:value={checkoutForm.userId}
						required
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="">Select User</option>
						{#each users as user}
							<option value={user.id}>{user.name} ({user.email})</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label for="returnDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Return Date *</label>
					<input
						id="returnDate"
						type="date"
						bind:value={checkoutForm.expectedReturnDate}
						required
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				
				<div>
					<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
					<textarea
						id="notes"
						bind:value={checkoutForm.notes}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Any additional notes..."
					></textarea>
				</div>
				
				<div class="flex space-x-3">
					<button
						type="button"
						on:click={() => showCheckoutModal = false}
						class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Check Out
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 