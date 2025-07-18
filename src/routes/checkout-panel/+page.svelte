<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Card from '$lib/components/Card.svelte';

	let { data } = $props<{ data: PageData }>();

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

	interface Category {
		id: string;
		name: string;
		count: number;
	}

	interface Checkout {
		id: string;
		asset?: Asset;
		status: string;
		expectedReturnDate?: string;
	}

	interface CheckoutForm {
		userId: string;
		expectedReturnDate: string;
		notes: string;
	}

	interface ReturnForm {
		condition: string;
		notes: string;
	}

	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let viewMode = $state<'grid' | 'list'>('grid');
	let showCheckoutModal = $state(false);
	let showReturnModal = $state(false);
	let selectedAsset = $state<Asset | null>(null);
	let checkoutForm = $state<CheckoutForm>({
		userId: '',
		expectedReturnDate: '',
		notes: ''
	});
	let returnForm = $state<ReturnForm>({
		condition: 'good',
		notes: ''
	});

	let assets = $state<Asset[]>([]);
	let categories = $state<Category[]>([]);
	let filteredAssets = $state<Asset[]>([]);
	let myCheckouts = $state<Checkout[]>([]);

	onMount(async () => {
		try {
			// Load assets
			const assetsResponse = await fetch('/api/assets');
			if (assetsResponse.ok) {
				assets = await assetsResponse.json();
			}

			// Load categories
			const categoriesResponse = await fetch('/api/categories');
			if (categoriesResponse.ok) {
				const categoryData = await categoriesResponse.json();
				categories = [
					{ id: 'all', name: 'All Categories', count: assets.length },
					...categoryData.map((cat: any) => ({
						id: cat.name.toLowerCase(),
						name: cat.name,
						count: cat.count
					}))
				];
			}

			// Load user's checkouts (using a mock user ID for now)
			const checkoutsResponse = await fetch('/api/checkouts?user=current-user&active=true');
			if (checkoutsResponse.ok) {
				myCheckouts = await checkoutsResponse.json();
			}

			filterAssets();
		} catch (error) {
			console.error('Error loading data:', error);
		}
	});

	function filterAssets() {
		filteredAssets = assets.filter((asset: Asset) => {
			const matchesSearch = asset.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
								 (asset.serialNumbers && asset.serialNumbers.some(sn => sn.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())));
			const matchesCategory = selectedCategory === 'all' || asset.category?.name.toLowerCase() === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}

	function openCheckoutModal(asset: Asset) {
		selectedAsset = asset;
		checkoutForm = {
			userId: 'current-user-id', // TODO: Get from auth
			expectedReturnDate: '',
			notes: ''
		};
		showCheckoutModal = true;
	}

	function openReturnModal(asset: Asset | undefined) {
		if (!asset) return;
		selectedAsset = asset;
		returnForm = {
			condition: 'good',
			notes: ''
		};
		showReturnModal = true;
	}

	async function handleCheckout() {
		if (!selectedAsset) return;
		try {
			const response = await fetch('/api/checkouts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					assetId: selectedAsset.id,
					user: checkoutForm.userId,
					expectedReturnDate: checkoutForm.expectedReturnDate,
					notes: checkoutForm.notes
				})
			});

			if (response.ok) {
				showCheckoutModal = false;
				// Refresh data
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

	async function handleReturn() {
		if (!selectedAsset) return;
		try {
			const response = await fetch('/api/checkouts', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					checkoutId: selectedAsset.id,
					notes: returnForm.notes
				})
			});

			if (response.ok) {
				showReturnModal = false;
				// Refresh data
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

	async function loadData() {
		try {
			// Load assets
			const assetsResponse = await fetch('/api/assets');
			if (assetsResponse.ok) {
				assets = await assetsResponse.json();
			}

			// Load user's checkouts
			const checkoutsResponse = await fetch('/api/checkouts?user=current-user&active=true');
			if (checkoutsResponse.ok) {
				myCheckouts = await checkoutsResponse.json();
			}

			filterAssets();
		} catch (error) {
			console.error('Error loading data:', error);
		}
	}

	function getStatusColor(status: string) {
		switch (status.toLowerCase()) {
			case 'available': return 'bg-success-light text-success';
			case 'in use': return 'bg-primary-100 text-primary-600';
			case 'maintenance': return 'bg-warning-light text-warning';
			case 'retired': return 'bg-error-light text-error';
			default: return 'bg-secondary-100 text-secondary-600';
		}
	}
</script>

<svelte:head>
	<title>Checkout Panel - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->

	<div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
		  <div>
			<h1 class="text-3xl font-bold">Checkout Panel</h1>
			<p class="text-white/80 mt-2 text-lg">Check out and return studio equipment</p>
		  </div>
		  <div class="text-right flex space-x-4">
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{assets.filter(a => a.status === 'Available').length}</div>
				<div class="text-white/90 text-sm">Available</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{myCheckouts.length}</div>
				<div class="text-white/90 text-sm">My Checkouts</div>
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
						class="w-full pl-10 pr-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-success focus:border-transparent transition-all duration-200 text-base"
					/>
					<svg class="absolute left-3 top-3.5 h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			<!-- Filters -->
			<div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
				<select
					bind:value={selectedCategory}
					on:change={filterAssets}
					class="flex-1 px-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-success focus:border-transparent transition-all duration-200 text-base"
				>
					{#each categories as category}
						<option value={category.id}>{category.name} ({category.count})</option>
					{/each}
				</select>

				<!-- View Mode Toggle -->
				<div class="hidden sm:flex border border-input rounded-lg self-center">
					<button
						on:click={() => viewMode = 'grid'}
						class="p-3 {viewMode === 'grid' ? 'bg-accent-success text-white' : 'bg-input text-input hover:bg-tertiary'} rounded-l-lg transition-all duration-200 touch-manipulation"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<button
						on:click={() => viewMode = 'list'}
						class="p-3 {viewMode === 'list' ? 'bg-accent-success text-white' : 'bg-input text-input hover:bg-tertiary'} rounded-r-lg transition-all duration-200 touch-manipulation"
						aria-label="View as list"
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
	<Card gradient="from-accent-success to-green-500" padding="p-6">
		<div class="flex items-center space-x-4 mb-6">
			<div class="p-3 bg-gradient-to-br from-accent-success to-green-500 rounded-lg">
				<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h3 class="text-2xl font-semibold text-white">Available Equipment ({filteredAssets.filter(a => a.status === 'Available').length} items)</h3>
		</div>
		
		{#if viewMode === 'grid'}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{#each filteredAssets.filter(a => a.status === 'Available') as asset}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
						<div class="text-center mb-4">
							<div class="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center mx-auto mb-3">
								<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
							</div>
							<h4 class="text-white font-medium truncate">{asset.itemName}</h4>
							<p class="text-white/70 text-sm truncate">{asset.category?.name || 'Uncategorized'}</p>
						</div>
						
						<div class="space-y-2 mb-4">
							<div class="flex justify-between text-sm">
								<span class="text-white/70">Location:</span>
								<span class="text-white truncate ml-2">{asset.location || '-'}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-white/70">Serial:</span>
								<span class="text-white truncate ml-2">
									{#if asset.serialNumbers && asset.serialNumbers.length > 0}
										{asset.serialNumbers[0].serialNumber}
										{#if asset.serialNumbers.length > 1}
											<span class="text-white/60"> +{asset.serialNumbers.length - 1}</span>
										{/if}
									{:else}
										-
									{/if}
								</span>
							</div>
						</div>
						
						<button
							on:click={() => openCheckoutModal(asset)}
							class="w-full bg-white text-accent-success text-center py-2 px-4 rounded-lg hover:bg-white/90 transition-colors duration-200 text-sm font-medium"
						>
							Check Out
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="space-y-3">
				{#each filteredAssets.filter(a => a.status === 'Available') as asset}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<h4 class="text-white font-medium truncate">{asset.itemName}</h4>
								<p class="text-white/70 text-sm truncate">{asset.category?.name || 'Uncategorized'}</p>
								<div class="flex items-center space-x-4 mt-1 text-xs text-white/60">
									<span>Location: {asset.location || '-'}</span>
									<span>Serial: {asset.serialNumbers && asset.serialNumbers.length > 0 ? asset.serialNumbers[0].serialNumber : '-'}</span>
								</div>
							</div>
							<div class="flex-shrink-0">
								<button
									on:click={() => openCheckoutModal(asset)}
									class="bg-white text-accent-success px-4 py-2 rounded-lg hover:bg-white/90 transition-colors duration-200 text-sm font-medium"
								>
									Check Out
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
		
		{#if filteredAssets.filter(a => a.status === 'Available').length === 0}
			<div class="text-center py-12">
				<div class="p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full mb-4 inline-block">
					<svg class="h-12 w-12 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
				</div>
				<p class="text-white/60 text-lg">No available equipment found</p>
			</div>
		{/if}
	</Card>

	<!-- My Checkouts -->
	{#if myCheckouts.length > 0}
		<Card gradient="from-accent-warning to-yellow-500" padding="p-6">
			<div class="flex items-center space-x-4 mb-6">
				<div class="p-3 bg-gradient-to-br from-accent-warning to-yellow-500 rounded-lg">
					<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h3 class="text-2xl font-semibold text-white">My Checkouts ({myCheckouts.length} items)</h3>
			</div>
			
			<div class="space-y-3">
				{#each myCheckouts as checkout}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<h4 class="text-white font-medium truncate">{checkout.asset?.itemName || 'Unknown Item'}</h4>
								<p class="text-white/70 text-sm truncate">{checkout.asset?.category?.name || 'Uncategorized'}</p>
								<div class="flex items-center space-x-4 mt-1 text-xs text-white/60">
									<span>Due: {checkout.expectedReturnDate ? new Date(checkout.expectedReturnDate).toLocaleDateString() : 'Not set'}</span>
									<span>Status: {checkout.status}</span>
								</div>
							</div>
							<div class="flex-shrink-0">
								<button
									on:click={() => openReturnModal(checkout.asset)}
									class="bg-white text-accent-warning px-4 py-2 rounded-lg hover:bg-white/90 transition-colors duration-200 text-sm font-medium"
								>
									Return
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card>
	{/if}
</div>

<!-- Checkout Modal -->
{#if showCheckoutModal && selectedAsset}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-card rounded-xl shadow-custom-lg max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-primary">Check Out Equipment</h3>
				<button
					on:click={() => showCheckoutModal = false}
					class="text-secondary hover:text-primary"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="mb-4 p-4 bg-secondary rounded-lg">
				<h4 class="font-medium text-primary">{selectedAsset.itemName}</h4>
				<p class="text-sm text-secondary">{selectedAsset.category?.name || 'Uncategorized'}</p>
			</div>
			
			<form on:submit|preventDefault={handleCheckout} class="space-y-4">
				<div>
					<label for="returnDate" class="block text-sm font-medium text-primary mb-2">Expected Return Date</label>
					<input
						id="returnDate"
						type="date"
						bind:value={checkoutForm.expectedReturnDate}
						required
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-success focus:border-transparent"
					/>
				</div>
				
				<div>
					<label for="notes" class="block text-sm font-medium text-primary mb-2">Notes (Optional)</label>
					<textarea
						id="notes"
						bind:value={checkoutForm.notes}
						rows="3"
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-success focus:border-transparent"
						placeholder="Any additional notes..."
					></textarea>
				</div>
				
				<div class="flex space-x-3">
					<button
						type="button"
						on:click={() => showCheckoutModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-accent-success text-white rounded-lg hover:bg-green-600 transition-colors"
					>
						Check Out
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Return Modal -->
{#if showReturnModal && selectedAsset}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-card rounded-xl shadow-custom-lg max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-primary">Return Equipment</h3>
				<button
					on:click={() => showReturnModal = false}
					class="text-secondary hover:text-primary"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="mb-4 p-4 bg-secondary rounded-lg">
				<h4 class="font-medium text-primary">{selectedAsset.itemName}</h4>
				<p class="text-sm text-secondary">{selectedAsset.category?.name || 'Uncategorized'}</p>
			</div>
			
			<form on:submit|preventDefault={handleReturn} class="space-y-4">
				<div>
					<label for="condition" class="block text-sm font-medium text-primary mb-2">Return Condition</label>
					<select
						id="condition"
						bind:value={returnForm.condition}
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-warning focus:border-transparent"
					>
						<option value="excellent">Excellent</option>
						<option value="good">Good</option>
						<option value="fair">Fair</option>
						<option value="poor">Poor</option>
					</select>
				</div>
				
				<div>
					<label for="returnNotes" class="block text-sm font-medium text-primary mb-2">Notes (Optional)</label>
					<textarea
						id="returnNotes"
						bind:value={returnForm.notes}
						rows="3"
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-warning focus:border-transparent"
						placeholder="Any issues or notes..."
					></textarea>
				</div>
				
				<div class="flex space-x-3">
					<button
						type="button"
						on:click={() => showReturnModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-accent-warning text-white rounded-lg hover:bg-yellow-600 transition-colors"
					>
						Return
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 