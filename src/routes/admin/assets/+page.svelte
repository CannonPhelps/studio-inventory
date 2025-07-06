<script lang="ts">
	import { onMount } from 'svelte';

	let assets: any[] = [];
	let categories: any[] = [];
	let loading = true;
	let showAddModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let selectedAsset: any = null;
	let searchTerm = '';
	let selectedCategory = '';
	let selectedStatus = '';
	let viewMode = 'cards'; // 'cards' or 'table'

	let newAsset = {
		itemName: '',
		quantity: 1,
		categoryId: '',
		modelBrand: '',
		serialNumber: '',
		location: '',
		status: 'Available',
		purchaseDate: '',
		purchasePrice: '',
		notes: '',
		assigned: '',
		assetNumber: '',
		supplier: '',
		isCable: false,
		cableTypeId: '',
		cableLength: ''
	};

	onMount(async () => {
		await Promise.all([loadAssets(), loadCategories()]);
	});

	async function loadAssets() {
		try {
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			if (selectedCategory) params.append('categoryId', selectedCategory);
			if (selectedStatus) params.append('status', selectedStatus);

			const response = await fetch(`/api/assets?${params}`);
			assets = await response.json();
			console.log('Loaded assets:', assets);
			if (assets.length > 0) {
				console.log('First asset categoryId:', assets[0].categoryId, 'type:', typeof assets[0].categoryId);
			}
		} catch (error) {
			console.error('Error loading assets:', error);
		} finally {
			loading = false;
		}
	}

	async function loadCategories() {
		try {
			const response = await fetch('/api/categories');
			categories = await response.json();
			console.log('Loaded categories:', categories);
		} catch (error) {
			console.error('Error loading categories:', error);
		}
	}

	async function addAsset(event: Event) {
		event.preventDefault();
		
		try {
			const response = await fetch('/api/assets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newAsset)
			});

			if (response.ok) {
				await loadAssets();
				showAddModal = false;
				newAsset = {
					itemName: '',
					quantity: 1,
					categoryId: '',
					modelBrand: '',
					serialNumber: '',
					location: '',
					status: 'Available',
					purchaseDate: '',
					purchasePrice: '',
					notes: '',
					assigned: '',
					assetNumber: '',
					supplier: '',
					isCable: false,
					cableTypeId: '',
					cableLength: ''
				};
			}
		} catch (error) {
			console.error('Error adding asset:', error);
		}
	}

	function openEditModal(asset: any) {
		console.log('Opening edit modal for asset:', asset);
		console.log('Asset categoryId type:', typeof asset.categoryId, 'value:', asset.categoryId);
		console.log('Available categories:', categories);
		
		selectedAsset = asset;
		newAsset = {
			itemName: asset.itemName,
			quantity: asset.quantity,
			categoryId: asset.categoryId ? asset.categoryId.toString() : '',
			modelBrand: asset.modelBrand || '',
			serialNumber: asset.serialNumber || '',
			location: asset.location || '',
			status: asset.status,
			purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
			purchasePrice: asset.purchasePrice || '',
			notes: asset.notes || '',
			assigned: asset.assigned || '',
			assetNumber: asset.assetNumber || '',
			supplier: asset.supplier || '',
			isCable: asset.isCable,
			cableTypeId: asset.cableTypeId ? asset.cableTypeId.toString() : '',
			cableLength: asset.cableLength ? asset.cableLength.toString() : ''
		};
		console.log('New asset data for edit:', newAsset);
		console.log('CategoryId in newAsset:', newAsset.categoryId, 'type:', typeof newAsset.categoryId);
		showEditModal = true;
	}

	function openDeleteModal(asset: any) {
		selectedAsset = asset;
		showDeleteModal = true;
	}

	async function handleEditAsset(event: Event) {
		event.preventDefault();
		
		try {
			console.log('Submitting edit with data:', newAsset);
			const response = await fetch(`/api/assets/${selectedAsset.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newAsset)
			});

			if (response.ok) {
				await loadAssets();
				showEditModal = false;
				selectedAsset = null;
			} else {
				const errorData = await response.json();
				console.error('Error response:', errorData);
			}
		} catch (error) {
			console.error('Error updating asset:', error);
		}
	}

	async function handleDeleteAsset() {
		try {
			const response = await fetch(`/api/assets/${selectedAsset.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadAssets();
				showDeleteModal = false;
				selectedAsset = null;
			}
		} catch (error) {
			console.error('Error deleting asset:', error);
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'Available': return 'bg-green-100 text-green-800';
			case 'In Use': return 'bg-blue-100 text-blue-800';
			case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
			case 'Retired': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getCategoryColor(categoryName: string) {
		const colors = [
			'bg-blue-100 text-blue-800',
			'bg-green-100 text-green-800',
			'bg-purple-100 text-purple-800',
			'bg-orange-100 text-orange-800',
			'bg-pink-100 text-pink-800',
			'bg-indigo-100 text-indigo-800'
		];
		const index = categories.findIndex(c => c.name === categoryName);
		return colors[index % colors.length];
	}

	$: filteredAssets = assets.filter(asset => {
		if (searchTerm && !asset.itemName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
		if (selectedCategory && asset.categoryId !== parseInt(selectedCategory)) return false;
		if (selectedStatus && asset.status !== selectedStatus) return false;
		return true;
	});

	$: if (showEditModal) {
		console.log('Edit modal is open, categoryId:', newAsset.categoryId);
	}
</script>

<svelte:head>
	<title>Assets - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Assets</h1>
			<p class="mt-2 text-gray-600">Manage your studio equipment and inventory</p>
		</div>
		<button
			onclick={() => (showAddModal = true)}
			class="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Asset
		</button>
	</div>

	<!-- Filters and Search -->
	<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<!-- Search -->
			<div class="md:col-span-2">
				<label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
				<div class="relative">
					<input
						id="search"
						type="text"
						bind:value={searchTerm}
						oninput={loadAssets}
						placeholder="Search by name, serial number, or notes..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			<!-- Category Filter -->
			<div>
				<label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
				<select
					id="category"
					bind:value={selectedCategory}
					onchange={loadAssets}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="">All Categories</option>
					{#each categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<!-- Status Filter -->
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
				<select
					id="status"
					bind:value={selectedStatus}
					onchange={loadAssets}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="">All Status</option>
					<option value="Available">Available</option>
					<option value="In Use">In Use</option>
					<option value="Maintenance">Maintenance</option>
					<option value="Retired">Retired</option>
					<option value="Checked Out">Checked Out</option>
				</select>
			</div>
		</div>

		<!-- View Toggle -->
		<div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
			<div class="flex items-center space-x-2">
				<button
					onclick={() => viewMode = 'cards'}
					class="p-2 rounded-lg transition-colors {viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
					</svg>
				</button>
				<button
					onclick={() => viewMode = 'table'}
					class="p-2 rounded-lg transition-colors {viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
					</svg>
				</button>
			</div>
			<p class="text-sm text-gray-600">{filteredAssets.length} assets found</p>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		</div>
	{:else if filteredAssets.length === 0}
		<div class="text-center py-12">
			<div class="text-gray-400 mb-4">
				<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
			<p class="text-gray-500 mb-4">Try adjusting your search or filters.</p>
			<button
				onclick={() => (showAddModal = true)}
				class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
			>
				Add Asset
			</button>
		</div>
	{:else if viewMode === 'cards'}
		<!-- Card View -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each filteredAssets as asset}
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
					<div class="p-6">
						<div class="flex items-start justify-between mb-4">
							<div class="flex-1">
								<h3 class="text-lg font-semibold text-gray-900 mb-1">{asset.itemName}</h3>
								<p class="text-sm text-gray-500">{asset.category?.name}</p>
							</div>
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
								{asset.status}
							</span>
						</div>

						<div class="space-y-2 mb-4">
							{#if asset.modelBrand}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Brand:</span>
									<span class="font-medium">{asset.modelBrand}</span>
								</div>
							{/if}
							{#if asset.serialNumber}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Serial:</span>
									<span class="font-mono text-xs">{asset.serialNumber}</span>
								</div>
							{/if}
							{#if asset.location}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Location:</span>
									<span class="font-medium">{asset.location}</span>
								</div>
							{/if}
							{#if asset.quantity > 1}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Quantity:</span>
									<span class="font-medium">{asset.quantity}</span>
								</div>
							{/if}
							{#if asset.isCable && asset.cableLength}
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Length:</span>
																				<span class="font-medium">{asset.cableLength ? asset.cableLength.toFixed(1) : '0'} ft</span>
								</div>
							{/if}
						</div>

						<div class="flex items-center justify-between pt-4 border-t border-gray-100">
							<div class="flex space-x-2">
								<button 
									onclick={() => openEditModal(asset)}
									class="text-blue-600 hover:text-blue-800 text-sm font-medium"
								>
									Edit
								</button>
								<button 
									onclick={() => openDeleteModal(asset)}
									class="text-red-600 hover:text-red-800 text-sm font-medium"
								>
									Delete
								</button>
							</div>
							{#if asset.purchasePrice}
								<span class="text-sm font-medium text-gray-900">${asset.purchasePrice}</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Table View -->
		<div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredAssets as asset}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{asset.itemName}</div>
										<div class="text-sm text-gray-500">{asset.modelBrand}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getCategoryColor(asset.category?.name)}">
										{asset.category?.name}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
										{asset.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.location || '-'}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{asset.serialNumber || '-'}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{asset.purchasePrice ? `$${asset.purchasePrice}` : '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button 
										onclick={() => openEditModal(asset)}
										class="text-blue-600 hover:text-blue-900 mr-3"
									>
										Edit
									</button>
									<button 
										onclick={() => openDeleteModal(asset)}
										class="text-red-600 hover:text-red-900"
									>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- Add Asset Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
			<h2 class="text-xl font-bold mb-4">Add New Asset</h2>
			<form onsubmit={addAsset} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="itemName" class="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
						<input
							id="itemName"
							type="text"
							bind:value={newAsset.itemName}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter item name"
							required
						/>
					</div>
					<div>
						<label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
						<select
							id="categoryId"
							bind:value={newAsset.categoryId}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						>
							<option value="">Select category</option>
							{#each categories as category}
								<option value={category.id.toString()}>{category.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="modelBrand" class="block text-sm font-medium text-gray-700 mb-1">Model/Brand</label>
						<input
							id="modelBrand"
							type="text"
							bind:value={newAsset.modelBrand}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Samsung, Apple"
						/>
					</div>
					<div>
						<label for="serialNumber" class="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
						<input
							id="serialNumber"
							type="text"
							bind:value={newAsset.serialNumber}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter serial number"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="assetNumber" class="block text-sm font-medium text-gray-700 mb-1">Asset Number</label>
						<input
							id="assetNumber"
							type="text"
							bind:value={newAsset.assetNumber}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., AST-001, INV-2024-001"
						/>
					</div>
					<div>
						<label for="supplier" class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
						<input
							id="supplier"
							type="text"
							bind:value={newAsset.supplier}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Amazon, Local Store"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
						<input
							id="location"
							type="text"
							bind:value={newAsset.location}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Studio, Storage Room"
						/>
					</div>
					<div>
						<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
						<select
							id="status"
							bind:value={newAsset.status}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="Available">Available</option>
							<option value="In Use">In Use</option>
							<option value="Maintenance">Maintenance</option>
							<option value="Retired">Retired</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="purchaseDate" class="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
						<input
							id="purchaseDate"
							type="date"
							bind:value={newAsset.purchaseDate}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label for="purchasePrice" class="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
						<input
							id="purchasePrice"
							type="number"
							step="0.01"
							bind:value={newAsset.purchasePrice}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="0.00"
						/>
					</div>
				</div>

				<div>
					<label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
					<textarea
						id="notes"
						bind:value={newAsset.notes}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows="3"
						placeholder="Additional notes about this asset"
					></textarea>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button
						type="button"
						onclick={() => (showAddModal = false)}
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
					>
						Add Asset
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Asset Modal -->
{#if showEditModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
			<h2 class="text-xl font-bold mb-4">Edit Asset</h2>
			<form onsubmit={handleEditAsset} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-itemName" class="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
						<input
							id="edit-itemName"
							type="text"
							bind:value={newAsset.itemName}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter item name"
							required
						/>
					</div>
					<div>
						<label for="edit-categoryId" class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
						<select
							id="edit-categoryId"
							bind:value={newAsset.categoryId}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						>
							<option value="">Select category</option>
							{#each categories as category}
								<option value={category.id.toString()}>{category.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-modelBrand" class="block text-sm font-medium text-gray-700 mb-1">Model/Brand</label>
						<input
							id="edit-modelBrand"
							type="text"
							bind:value={newAsset.modelBrand}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Samsung, Apple"
						/>
					</div>
					<div>
						<label for="edit-serialNumber" class="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
						<input
							id="edit-serialNumber"
							type="text"
							bind:value={newAsset.serialNumber}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter serial number"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-assetNumber" class="block text-sm font-medium text-gray-700 mb-1">Asset Number</label>
						<input
							id="edit-assetNumber"
							type="text"
							bind:value={newAsset.assetNumber}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., AST-001, INV-2024-001"
						/>
					</div>
					<div>
						<label for="edit-supplier" class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
						<input
							id="edit-supplier"
							type="text"
							bind:value={newAsset.supplier}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Amazon, Local Store"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
						<input
							id="edit-location"
							type="text"
							bind:value={newAsset.location}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Studio, Storage Room"
						/>
					</div>
					<div>
						<label for="edit-status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
						<select
							id="edit-status"
							bind:value={newAsset.status}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="Available">Available</option>
							<option value="In Use">In Use</option>
							<option value="Maintenance">Maintenance</option>
							<option value="Retired">Retired</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-purchaseDate" class="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
						<input
							id="edit-purchaseDate"
							type="date"
							bind:value={newAsset.purchaseDate}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label for="edit-purchasePrice" class="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
						<input
							id="edit-purchasePrice"
							type="number"
							step="0.01"
							bind:value={newAsset.purchasePrice}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="0.00"
						/>
					</div>
				</div>

				<div>
					<label for="edit-notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
					<textarea
						id="edit-notes"
						bind:value={newAsset.notes}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows="3"
						placeholder="Additional notes about this asset"
					></textarea>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button
						type="button"
						onclick={() => (showEditModal = false)}
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
					>
						Update Asset
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
			<h2 class="text-xl font-bold mb-4">Delete Asset</h2>
			<p class="text-gray-600 mb-6">
				Are you sure you want to delete <strong>{selectedAsset?.itemName}</strong>? This action cannot be undone.
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={() => (showDeleteModal = false)}
					class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={handleDeleteAsset}
					class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
				>
					Delete Asset
				</button>
			</div>
		</div>
	</div>
{/if} 