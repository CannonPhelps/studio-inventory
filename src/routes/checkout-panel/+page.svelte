<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import AppLayout from '$lib/components/AppLayout.svelte';

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
		serialNumber?: string;
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
								 (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
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

	function openReturnModal(asset: Asset) {
		selectedAsset = asset;
		returnForm = {
			condition: 'good',
			notes: ''
		};
		showReturnModal = true;
	}

	async function handleCheckout() {
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
			case 'available': return 'text-success bg-success-light';
			case 'in use': return 'text-warning bg-warning-light';
			case 'maintenance': return 'text-error bg-error-light';
			default: return 'text-secondary bg-secondary-100';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Checkout Panel - Studio Inventory</title>
</svelte:head>

<AppLayout user={data.user}>
	<div class="space-y-6">
		<!-- Header -->
		<div class="bg-gradient-to-r from-accent to-accent-secondary rounded-2xl p-4 md:p-6 text-white">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
				<div>
					<h1 class="text-2xl md:text-3xl font-bold">Checkout Panel</h1>
					<p class="text-white/80 mt-2">Check out and return equipment</p>
				</div>
				<div class="hidden md:flex items-center space-x-4">
					<div class="text-center">
						<div class="text-2xl font-bold">{assets.filter(a => a.status === 'Available').length}</div>
						<div class="text-white/80 text-sm">Available</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold">{myCheckouts.length}</div>
						<div class="text-white/80 text-sm">My Items</div>
					</div>
				</div>
			</div>
		</div>

		<!-- My Checkouts Section -->
		{#if myCheckouts.length > 0}
			<div class="bg-card rounded-xl shadow-custom border border-card p-4 md:p-6">
				<h2 class="text-lg md:text-xl font-semibold text-primary mb-4">My Checked Out Items</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each myCheckouts as checkout}
						<div class="bg-secondary border border-card rounded-lg p-4">
							<div class="flex items-center justify-between mb-3">
								<div class="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center">
									<span class="text-lg">📦</span>
								</div>
								<button
									onclick={() => openReturnModal(checkout.asset)}
									class="text-accent hover:text-accent-secondary text-sm font-medium"
								>
									Return
								</button>
							</div>
							<h3 class="font-semibold text-primary mb-1">{checkout.asset?.itemName}</h3>
							<p class="text-sm text-secondary mb-2">{checkout.asset?.category?.name}</p>
							<div class="text-xs text-secondary">
								Expected Return: {checkout.expectedReturnDate ? formatDate(checkout.expectedReturnDate) : 'Not set'}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Search and Filters -->
		<div class="bg-card rounded-xl shadow-custom border border-card p-4 md:p-6">
			<div class="flex flex-col space-y-4">
				<!-- Search -->
				<div class="w-full">
					<div class="relative">
						<input
							type="text"
							bind:value={searchQuery}
							oninput={filterAssets}
							placeholder="Search equipment..."
							class="w-full pl-10 pr-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
						onchange={filterAssets}
						class="flex-1 px-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
					>
						{#each categories as category}
							<option value={category.id}>{category.name} ({category.count})</option>
						{/each}
					</select>

					<!-- View Mode Toggle -->
					<div class="flex border border-input rounded-lg self-center">
						<button
							onclick={() => viewMode = 'grid'}
							class="p-3 {viewMode === 'grid' ? 'bg-accent text-white' : 'bg-input text-input hover:bg-tertiary'} rounded-l-lg transition-colors"
							aria-label="View as grid"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
							</svg>
						</button>
						<button
							onclick={() => viewMode = 'list'}
							class="p-3 {viewMode === 'list' ? 'bg-accent text-white' : 'bg-input text-input hover:bg-tertiary'} rounded-r-lg transition-colors"
							aria-label="View as list"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Available Equipment -->
		<div class="bg-card rounded-xl shadow-custom border border-card">
			<div class="p-4 md:p-6 border-b border-card">
				<h2 class="text-lg md:text-xl font-semibold text-primary">Available Equipment ({filteredAssets.filter(a => a.status === 'Available').length} items)</h2>
			</div>
			<div class="p-4 md:p-6">
				{#if viewMode === 'grid'}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
						{#each filteredAssets.filter(a => a.status === 'Available') as asset}
							<div class="bg-secondary border border-card rounded-xl p-4 md:p-6 hover:shadow-custom transition-shadow">
								<div class="text-center mb-4">
									<div class="w-12 h-12 md:w-16 md:h-16 bg-tertiary rounded-lg flex items-center justify-center mx-auto mb-3">
										<span class="text-2xl md:text-3xl">📦</span>
									</div>
									<h3 class="font-semibold text-primary mb-1 text-sm md:text-base truncate">{asset.itemName}</h3>
									<p class="text-xs md:text-sm text-secondary truncate">{asset.category?.name}</p>
								</div>
								
								<div class="space-y-2 mb-4">
									<div class="flex justify-between text-xs md:text-sm">
										<span class="text-secondary">Location:</span>
										<span class="text-primary truncate ml-2">{asset.location}</span>
									</div>
									<div class="flex justify-between text-xs md:text-sm">
										<span class="text-secondary">Serial:</span>
										<span class="text-primary font-mono truncate ml-2">{asset.serialNumber || 'N/A'}</span>
									</div>
								</div>

								<button
									onclick={() => openCheckoutModal(asset)}
									class="w-full bg-accent text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-accent-secondary transition-colors"
								>
									Check Out
								</button>
							</div>
						{/each}
					</div>
				{:else}
					<!-- List View -->
					<div class="space-y-4">
						{#each filteredAssets.filter(a => a.status === 'Available') as asset}
							<div class="bg-secondary border border-card rounded-lg p-4 hover:shadow-custom transition-shadow">
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-4">
										<div class="w-12 h-12 bg-tertiary rounded-lg flex items-center justify-center">
											<span class="text-xl">📦</span>
										</div>
										<div>
											<h3 class="font-semibold text-primary">{asset.itemName}</h3>
											<p class="text-sm text-secondary">{asset.category?.name}</p>
										</div>
									</div>
									<button
										onclick={() => openCheckoutModal(asset)}
										class="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-secondary transition-colors"
									>
										Check Out
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Checkout Modal -->
	{#if showCheckoutModal && selectedAsset}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-card rounded-xl shadow-custom border border-card p-6 w-full max-w-md">
				<h3 class="text-lg font-semibold text-primary mb-4">Check Out Equipment</h3>
				<div class="space-y-4">
					<div>
						<p class="block text-sm font-medium text-secondary mb-2">Equipment</p>
						<div class="p-3 bg-secondary border border-card rounded-lg">
							<div class="font-medium text-primary">{selectedAsset.itemName}</div>
							<div class="text-sm text-secondary">{selectedAsset.category?.name}</div>
						</div>
					</div>
					
					<div>
						<label for="expected-return-date" class="block text-sm font-medium text-secondary mb-2">Expected Return Date</label>
						<input
							id="expected-return-date"
							type="date"
							bind:value={checkoutForm.expectedReturnDate}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						/>
					</div>
					
					<div>
						<label for="checkout-notes" class="block text-sm font-medium text-secondary mb-2">Notes</label>
						<textarea
							id="checkout-notes"
							bind:value={checkoutForm.notes}
							rows="3"
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
							placeholder="Optional notes..."
						></textarea>
					</div>
				</div>
				
				<div class="flex space-x-3 mt-6">
					<button
						onclick={() => showCheckoutModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={handleCheckout}
						class="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Check Out
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Return Modal -->
	{#if showReturnModal && selectedAsset}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-card rounded-xl shadow-custom border border-card p-6 w-full max-w-md">
				<h3 class="text-lg font-semibold text-primary mb-4">Return Equipment</h3>
				<div class="space-y-4">
					<div>
						<p class="block text-sm font-medium text-secondary mb-2">Equipment</p>
						<div class="p-3 bg-secondary border border-card rounded-lg">
							<div class="font-medium text-primary">{selectedAsset.itemName}</div>
							<div class="text-sm text-secondary">{selectedAsset.category?.name}</div>
						</div>
					</div>
					
					<div>
						<label for="return-condition" class="block text-sm font-medium text-secondary mb-2">Condition</label>
						<select
							id="return-condition"
							bind:value={returnForm.condition}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						>
							<option value="good">Good</option>
							<option value="fair">Fair</option>
							<option value="poor">Poor</option>
							<option value="damaged">Damaged</option>
						</select>
					</div>
					
					<div>
						<label for="return-notes" class="block text-sm font-medium text-secondary mb-2">Notes</label>
						<textarea
							id="return-notes"
							bind:value={returnForm.notes}
							rows="3"
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
							placeholder="Optional notes..."
						></textarea>
					</div>
				</div>
				
				<div class="flex space-x-3 mt-6">
					<button
						onclick={() => showReturnModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={handleReturn}
						class="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Return
					</button>
				</div>
			</div>
		</div>
	{/if}
</AppLayout> 