<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import AppLayout from '$lib/components/AppLayout.svelte';

	let { data } = $props<{ data: PageData }>();
	
	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedStatus = $state('all');
	let viewMode = $state('grid'); // 'grid' or 'list'
	let assets = $state<any[]>([]);
	let categories = $state<any[]>([]);
	let filteredAssets = $state<any[]>([]);

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
						count: cat.assetCount || 0
					}))
				];
			}

			filterAssets();
		} catch (error) {
			console.error('Error loading data:', error);
		}
	});

	function filterAssets() {
		filteredAssets = assets.filter(asset => {
			const matchesSearch = asset.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
								 (asset.serialNumbers && asset.serialNumbers.some(sn => sn.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())));
			const matchesCategory = selectedCategory === 'all' || asset.category?.name.toLowerCase() === selectedCategory;
			const matchesStatus = selectedStatus === 'all' || asset.status.toLowerCase() === selectedStatus;
			return matchesSearch && matchesCategory && matchesStatus;
		});
	}

	function getStatusColor(status) {
		switch (status.toLowerCase()) {
			case 'available': return 'bg-success-light text-success';
			case 'in use': return 'bg-primary-100 text-primary-600';
			case 'maintenance': return 'bg-warning-light text-warning';
			case 'retired': return 'bg-error-light text-error';
			default: return 'bg-secondary-100 text-secondary-600';
		}
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Assets - Studio Inventory</title>
</svelte:head>

<AppLayout user={data.user}>
	<div class="space-y-4 sm:space-y-6">
		<!-- Header -->
		<div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 sm:p-6 text-white shadow-custom-lg">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
				<div>
					<h1 class="text-xl sm:text-2xl md:text-3xl font-bold">Equipment Inventory</h1>
					<p class="text-white/90 mt-2 text-sm sm:text-base">Browse available studio equipment</p>
				</div>
				<div class="hidden md:flex items-center space-x-4">
					<div class="text-center">
						<div class="text-2xl font-bold">{assets.filter(a => a.status === 'Available').length}</div>
						<div class="text-white/90 text-sm">Available</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold">{assets.filter(a => a.status === 'In Use').length}</div>
						<div class="text-white/90 text-sm">In Use</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Search and Filters -->
		<div class="bg-card rounded-xl shadow-custom border border-card p-4 sm:p-6">
			<div class="flex flex-col space-y-4">
				<!-- Search -->
				<div class="w-full">
					<div class="relative">
						<input
							type="text"
							bind:value={searchQuery}
							on:input={filterAssets}
							placeholder="Search by name or serial number..."
							class="w-full pl-10 pr-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
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
						class="flex-1 px-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
					>
						{#each categories as category}
							<option value={category.id}>{category.name} ({category.count})</option>
						{/each}
					</select>

					<select
						bind:value={selectedStatus}
						on:change={filterAssets}
						class="flex-1 px-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
					>
						<option value="all">All Status</option>
						<option value="available">Available</option>
						<option value="in use">In Use</option>
						<option value="maintenance">Maintenance</option>
					</select>

					<!-- View Mode Toggle -->
					<div class="hidden sm:flex border border-input rounded-lg self-center">
						<button
							on:click={() => viewMode = 'grid'}
							class="p-3 {viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-input text-input hover:bg-tertiary'} rounded-l-lg transition-all duration-200 touch-manipulation"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
							</svg>
						</button>
						<button
							on:click={() => viewMode = 'list'}
							class="p-3 {viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-input text-input hover:bg-tertiary'} rounded-r-lg transition-all duration-200 touch-manipulation"
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

		<!-- Assets Grid/List -->
		<div class="bg-card rounded-xl shadow-custom border border-card">
			<div class="p-4 sm:p-6 border-b border-card">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
					<h2 class="text-base sm:text-lg md:text-xl font-semibold text-primary">Equipment ({filteredAssets.length} items)</h2>
					<a href="/checkout-panel" class="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors duration-200">
						Check Out Equipment →
					</a>
				</div>
			</div>
			<div class="p-4 sm:p-6">
				{#if viewMode === 'grid'}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
						{#each filteredAssets as asset}
							<div class="bg-secondary border border-card rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-custom-md transition-all duration-200">
								<div class="text-center mb-3 sm:mb-4">
									<div class="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
										<svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
										</svg>
									</div>
									<h3 class="font-semibold text-primary mb-1 text-sm sm:text-base truncate">{asset.itemName}</h3>
									<p class="text-xs sm:text-sm text-secondary truncate">{asset.category?.name || 'Uncategorized'}</p>
								</div>
								
								<div class="space-y-2 mb-3 sm:mb-4">
									<div class="flex justify-between text-xs sm:text-sm">
										<span class="text-secondary">Status:</span>
										<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
											{asset.status}
										</span>
									</div>
									<div class="flex justify-between text-xs sm:text-sm">
										<span class="text-secondary">Location:</span>
										<span class="text-primary truncate ml-2">{asset.location}</span>
									</div>
									<div class="flex justify-between text-xs sm:text-sm">
										<span class="text-secondary">Serial:</span>
										<span class="text-primary font-mono truncate ml-2">{asset.serialNumbers && asset.serialNumbers.length > 0 ? asset.serialNumbers.map(sn => sn.serialNumber).join(', ') : 'N/A'}</span>
									</div>
									<div class="flex justify-between text-xs sm:text-sm">
										<span class="text-secondary">Purchase:</span>
										<span class="text-primary truncate ml-2">{asset.purchaseDate ? formatDate(asset.purchaseDate) : 'N/A'}</span>
									</div>
									<div class="flex justify-between text-xs sm:text-sm">
										<span class="text-secondary">Value:</span>
										<span class="text-primary truncate ml-2">${asset.purchasePrice || 'N/A'}</span>
									</div>
								</div>

								<div class="flex space-x-2">
									<a
										href="/checkout-panel"
										class="flex-1 bg-primary-500 text-white text-center py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-600 transition-all duration-200 shadow-custom-sm touch-manipulation"
									>
										Check Out
									</a>
									<button
										class="flex-1 bg-secondary text-primary text-center py-2 px-3 rounded-lg text-sm font-medium hover:bg-tertiary transition-all duration-200 border border-card touch-manipulation"
									>
										Details
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<!-- List View (hidden on mobile) -->
					<div class="hidden sm:flex flex-col gap-3 sm:gap-4">
						{#each filteredAssets as asset}
							<div class="bg-secondary border border-card rounded-lg p-3 sm:p-4 hover:shadow-custom-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
								<div class="flex items-center space-x-3 min-w-0 flex-1">
									<div class="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<svg class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
										</svg>
									</div>
									<div class="min-w-0 flex-1">
										<h3 class="font-semibold text-primary text-sm sm:text-base truncate">{asset.itemName}</h3>
										<p class="text-xs sm:text-sm text-secondary truncate">{asset.category?.name || 'Uncategorized'}</p>
									</div>
								</div>
								<div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 self-start sm:self-auto">
									<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
										{asset.status}
									</span>
									<a
										href="/checkout-panel"
										class="mt-3 sm:mt-0 bg-primary-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-all duration-200 shadow-custom-sm touch-manipulation text-center w-full sm:w-auto"
									>
										Check&nbsp;Out
									</a>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</AppLayout> 