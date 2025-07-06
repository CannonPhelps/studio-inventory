<script lang="ts">
	import { onMount } from 'svelte';

	let searchQuery = '';
	let selectedCategory = 'all';
	let selectedStatus = 'all';
	let viewMode = 'grid'; // 'grid' or 'list'
	let assets = [];
	let categories = [];
	let filteredAssets = [];

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
								 (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchesCategory = selectedCategory === 'all' || asset.category?.name.toLowerCase() === selectedCategory;
			const matchesStatus = selectedStatus === 'all' || asset.status.toLowerCase() === selectedStatus;
			return matchesSearch && matchesCategory && matchesStatus;
		});
	}

	function getStatusColor(status) {
		switch (status.toLowerCase()) {
			case 'available': return 'text-green-600 bg-green-50';
			case 'in use': return 'text-orange-600 bg-orange-50';
			case 'maintenance': return 'text-red-600 bg-red-50';
			default: return 'text-gray-600 bg-gray-50';
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

<div class="space-y-6">
	<!-- Header -->
	<div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Equipment Inventory</h1>
				<p class="text-blue-100 mt-2">Browse available studio equipment</p>
			</div>
			<div class="hidden md:flex items-center space-x-4">
				<div class="text-center">
					<div class="text-2xl font-bold">{assets.filter(a => a.status === 'Available').length}</div>
					<div class="text-blue-100 text-sm">Available</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold">{assets.filter(a => a.status === 'In Use').length}</div>
					<div class="text-blue-100 text-sm">In Use</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Search and Filters -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
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

			<!-- Filters -->
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

				<select
					bind:value={selectedStatus}
					on:change={filterAssets}
					class="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="all">All Status</option>
					<option value="available">Available</option>
					<option value="in use">In Use</option>
					<option value="maintenance">Maintenance</option>
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
				<h2 class="text-xl font-semibold text-gray-900">Equipment ({filteredAssets.length} items)</h2>
				<a href="/checkout-panel" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
					Check Out Equipment →
				</a>
			</div>
		</div>
		<div class="p-6">
			{#if viewMode === 'grid'}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{#each filteredAssets as asset}
						<div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
							<div class="text-center mb-4">
								<div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
									<span class="text-3xl">📦</span>
								</div>
								<h3 class="font-semibold text-gray-900 mb-1">{asset.itemName}</h3>
								<p class="text-sm text-gray-600">{asset.category?.name || 'Uncategorized'}</p>
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
									<span class="text-gray-900 font-mono">{asset.serialNumber || 'N/A'}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Purchase:</span>
									<span class="text-gray-900">{asset.purchaseDate ? formatDate(asset.purchaseDate) : 'N/A'}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Value:</span>
									<span class="text-gray-900">{asset.purchasePrice ? `$${asset.purchasePrice}` : 'N/A'}</span>
								</div>
							</div>

							{#if asset.status === 'Available'}
								<a
									href="/checkout-panel"
									class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
								>
									Check Out
								</a>
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
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-gray-200">
								<th class="text-left py-3 px-4 font-medium text-gray-900">Equipment</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Category</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Status</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Location</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Serial Number</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Purchase Date</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Value</th>
								<th class="text-left py-3 px-4 font-medium text-gray-900">Action</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each filteredAssets as asset}
								<tr class="hover:bg-gray-50 transition-colors">
									<td class="py-4 px-4">
										<div class="flex items-center space-x-3">
											<div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
												<span class="text-sm">{asset.image}</span>
											</div>
											<div>
												<div class="font-medium text-gray-900">{asset.name}</div>
											</div>
										</div>
									</td>
									<td class="py-4 px-4 text-sm text-gray-900">{asset.category}</td>
									<td class="py-4 px-4">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
											{asset.status}
										</span>
									</td>
									<td class="py-4 px-4 text-sm text-gray-900">{asset.location}</td>
									<td class="py-4 px-4 text-sm text-gray-900 font-mono">{asset.serialNumber}</td>
									<td class="py-4 px-4 text-sm text-gray-900">{formatDate(asset.purchaseDate)}</td>
									<td class="py-4 px-4 text-sm text-gray-900">{asset.purchasePrice}</td>
									<td class="py-4 px-4">
										{#if asset.status === 'Available'}
											<a
												href="/checkout-panel"
												class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
											>
												Check Out
											</a>
										{:else}
											<span class="text-gray-500 text-sm">Not Available</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

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
					<p class="text-sm text-gray-600">Reserve items for use</p>
				</div>
			</a>
			
			<a
				href="/my-checkouts"
				class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200"
			>
				<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
					<span class="text-xl">📋</span>
				</div>
				<div>
					<h4 class="font-medium text-gray-900">My Checkouts</h4>
					<p class="text-sm text-gray-600">View your items</p>
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