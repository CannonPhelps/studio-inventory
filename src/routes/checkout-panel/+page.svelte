<script lang="ts">
	import { onMount } from 'svelte';

	let searchQuery = '';
	let selectedCategory = 'all';
	let viewMode = 'grid'; // 'grid' or 'list'
	let showCheckoutModal = false;
	let showReturnModal = false;
	let selectedAsset = null;
	let checkoutForm = {
		userId: '',
		expectedReturnDate: '',
		notes: ''
	};
	let returnForm = {
		condition: 'good',
		notes: ''
	};

	let assets = [];
	let categories = [];
	let filteredAssets = [];
	let myCheckouts = [];

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
		filteredAssets = assets.filter(asset => {
			const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
								 asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = selectedCategory === 'all' || asset.category.toLowerCase() === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}

	function openCheckoutModal(asset) {
		selectedAsset = asset;
		checkoutForm = {
			userId: 'current-user-id', // TODO: Get from auth
			expectedReturnDate: '',
			notes: ''
		};
		showCheckoutModal = true;
	}

	function openReturnModal(asset) {
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

	function getStatusColor(status) {
		switch (status.toLowerCase()) {
			case 'available': return 'text-green-600 bg-green-50';
			case 'in use': return 'text-orange-600 bg-orange-50';
			case 'maintenance': return 'text-red-600 bg-red-50';
			default: return 'text-gray-600 bg-gray-50';
		}
	}

	function getCheckoutStatusColor(status) {
		switch (status) {
			case 'Checked Out': return 'text-blue-600 bg-blue-50';
			case 'Overdue': return 'text-red-600 bg-red-50';
			default: return 'text-gray-600 bg-gray-50';
		}
	}
</script>

<svelte:head>
	<title>Checkout Panel - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Checkout Panel</h1>
				<p class="text-blue-100 mt-2">Check out and return studio equipment</p>
			</div>
			<div class="hidden md:flex items-center space-x-4">
				<div class="text-center">
					<div class="text-2xl font-bold">{myCheckouts.length}</div>
					<div class="text-blue-100 text-sm">My Checkouts</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold">{assets.filter(a => a.status === 'Available').length}</div>
					<div class="text-blue-100 text-sm">Available Items</div>
				</div>
			</div>
		</div>
	</div>

	<!-- My Checkouts Summary -->
	{#if myCheckouts.length > 0}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200">
			<div class="p-6 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900">My Checkouts</h2>
					<a href="/my-checkouts" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
						View All →
					</a>
				</div>
			</div>
			<div class="p-6">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each myCheckouts as checkout}
						<div class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
							<div class="flex items-center justify-between mb-2">
								<h3 class="font-medium text-gray-900">{checkout.assetName}</h3>
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getCheckoutStatusColor(checkout.status)}">
									{checkout.status}
								</span>
							</div>
							<div class="text-sm text-gray-600 space-y-1">
								<p>Checked out: {checkout.checkoutDate}</p>
								<p>Expected return: {checkout.expectedReturn}</p>
							</div>
							<div class="mt-3">
								<button 
									on:click={() => openReturnModal({ name: checkout.assetName })}
									class="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
								>
									Return Item
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Search and Filters -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
			<!-- Search -->
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						on:input={filterAssets}
						placeholder="Search by name or serial number..."
						class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			<!-- Category Filter -->
			<div class="flex items-center space-x-4">
				<select
					bind:value={selectedCategory}
					on:change={filterAssets}
					class="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					{#each categories as category}
						<option value={category.id}>{category.name} ({category.count})</option>
					{/each}
				</select>

				<!-- View Mode Toggle -->
				<div class="flex border border-gray-300 rounded-lg">
					<button
						on:click={() => viewMode = 'grid'}
						class="p-3 {viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} rounded-l-lg transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<button
						on:click={() => viewMode = 'list'}
						class="p-3 {viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} rounded-r-lg transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Assets Grid/List -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200">
		<div class="p-6 border-b border-gray-200">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-900">Available Equipment</h2>
				<p class="text-sm text-gray-600">{filteredAssets.length} items found</p>
			</div>
		</div>
		<div class="p-6">
			{#if viewMode === 'grid'}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{#each filteredAssets as asset}
						<div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
							<div class="text-center mb-4">
								<div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
									<span class="text-3xl">{asset.image}</span>
								</div>
								<h3 class="font-semibold text-gray-900 mb-1">{asset.name}</h3>
								<p class="text-sm text-gray-600">{asset.category}</p>
							</div>
							
							<div class="space-y-2 mb-4">
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Status:</span>
									<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
										{asset.status}
									</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Location:</span>
									<span class="text-gray-900">{asset.location}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Serial:</span>
									<span class="text-gray-900 font-mono">{asset.serialNumber}</span>
								</div>
							</div>

							{#if asset.status === 'Available'}
								<button
									on:click={() => openCheckoutModal(asset)}
									class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
								>
									Check Out
								</button>
							{:else}
								<button
									disabled
									class="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
								>
									Not Available
								</button>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="space-y-4">
					{#each filteredAssets as asset}
						<div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
							<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
								<span class="text-2xl">{asset.image}</span>
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-gray-900">{asset.name}</h3>
								<p class="text-sm text-gray-600">{asset.category} • {asset.location}</p>
								<p class="text-sm text-gray-500 font-mono">SN: {asset.serialNumber}</p>
							</div>
							<div class="flex items-center space-x-3">
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
									{asset.status}
								</span>
								{#if asset.status === 'Available'}
									<button
										on:click={() => openCheckoutModal(asset)}
										class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
									>
										Check Out
									</button>
								{:else}
									<button
										disabled
										class="bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
									>
										Not Available
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Checkout Modal -->
{#if showCheckoutModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Check Out Item</h3>
				<button
					on:click={() => showCheckoutModal = false}
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
						<span class="text-xl">{selectedAsset?.image}</span>
					</div>
					<div>
						<h4 class="font-medium text-gray-900">{selectedAsset?.name}</h4>
						<p class="text-sm text-gray-600">{selectedAsset?.category}</p>
					</div>
				</div>
			</div>

			<form on:submit|preventDefault={handleCheckout} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Expected Return Date</label>
					<input
						type="date"
						bind:value={checkoutForm.expectedReturnDate}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
					<textarea
						bind:value={checkoutForm.notes}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Any additional notes..."
					></textarea>
				</div>

				<div class="flex space-x-3 pt-4">
					<button
						type="button"
						on:click={() => showCheckoutModal = false}
						class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Check Out
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

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
						<h4 class="font-medium text-gray-900">{selectedAsset?.name}</h4>
						<p class="text-sm text-gray-600">Returning item</p>
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