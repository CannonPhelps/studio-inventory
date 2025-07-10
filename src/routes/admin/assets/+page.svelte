<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';

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
		serialNumbers: [] as string[],
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

	let newSerialNumber = '';
	let migratingSerials = false;

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
				console.log(
					'First asset categoryId:',
					assets[0].categoryId,
					'type:',
					typeof assets[0].categoryId
				);
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
					serialNumbers: [],
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
			serialNumbers: asset.serialNumbers ? asset.serialNumbers.map((sn: any) => sn.serialNumber) : [],
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
		console.log(
			'CategoryId in newAsset:',
			newAsset.categoryId,
			'type:',
			typeof newAsset.categoryId
		);
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

	function addSerialNumber() {
		if (newSerialNumber.trim()) {
			newAsset.serialNumbers = [...newAsset.serialNumbers, newSerialNumber.trim()];
			newSerialNumber = '';
		}
	}

	function removeSerialNumber(index: number) {
		newAsset.serialNumbers = newAsset.serialNumbers.filter((_, i) => i !== index);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'Available':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'In Use':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			case 'Maintenance':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
			case 'Retired':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	}

	function getCategoryColor(categoryName: string) {
		const colors = [
			'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
			'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
			'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
			'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
			'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
		];
		const index = categoryName ? categoryName.charCodeAt(0) % colors.length : 0;
		return colors[index];
	}

	$: filteredAssets = assets.filter((asset) => {
		const matchesSearch = searchTerm
			? asset.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			  asset.modelBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			  (asset.serialNumbers && asset.serialNumbers.some((sn: { serialNumber: string }) => 
				sn.serialNumber && sn.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
			  ))
			: true;
		const matchesCategory = selectedCategory ? asset.categoryId.toString() === selectedCategory : true;
		const matchesStatus = selectedStatus ? asset.status === selectedStatus : true;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	async function migrateSerials() {
    if (!confirm('This will copy serialNumber values into the new AssetSerialNumber table. Proceed?')) return;
    migratingSerials = true;
    try {
        const res = await fetch('/api/admin/migrate-serial-numbers', { method: 'POST' });
        const data = await res.json();
        alert(`Migrated ${data.migrated} serial numbers.`);
        await loadAssets();
    } catch (e) {
        alert('Migration failed. Check console for details.');
        console.error(e);
    } finally {
        migratingSerials = false;
    }
 }
</script>

<svelte:head>
	<title>Assets - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<SectionHeader 
	    title="Assets" 
	    subtitle="Manage your studio equipment and inventory" 
	    gradient="from-accent to-accent-secondary">
    <button
        onclick={() => (showAddModal = true)}
        class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:bg-accent-secondary"
    >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Asset
    </button>
    <button
        onclick={migrateSerials}
        class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        disabled={migratingSerials}
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
        </svg>
        {migratingSerials ? 'Migrating...' : 'Migrate Serials'}
      </button>
</SectionHeader>

<Card gradient="from-secondary/20 to-secondary/10" padding="p-6" className="">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
			<!-- Search -->
			<div class="md:col-span-2">
				<label for="search" class="text-secondary mb-1 block text-sm font-medium">Search</label>
				<div class="relative">
					<input
						id="search"
						type="text"
						bind:value={searchTerm}
						oninput={loadAssets}
						placeholder="Search by name, serial number, or notes..."
						class="w-full rounded-lg border border-card bg-input text-input py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-accent focus:outline-none"
					/>
					<svg
						class="absolute top-2.5 left-3 h-5 w-5 text-tertiary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
			</div>

			<!-- Category Filter -->
			<div>
				<label for="category" class="text-secondary mb-1 block text-sm font-medium">Category</label>
				<select
					id="category"
					bind:value={selectedCategory}
					onchange={loadAssets}
					class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-accent focus:outline-none"
				>
					<option value="">All Categories</option>
					{#each categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<!-- Status Filter -->
			<div>
				<label for="status" class="text-secondary mb-1 block text-sm font-medium">Status</label>
				<select
					id="status"
					bind:value={selectedStatus}
					onchange={loadAssets}
					class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-accent focus:outline-none"
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
		<div class="border-card mt-4 flex items-center justify-between border-t pt-4">
			<div class="flex items-center space-x-2">
				<button
					onclick={() => (viewMode = 'cards')}
					class="rounded-lg p-2 transition-colors {viewMode === 'cards'
						? 'bg-accent text-white'
						: 'text-tertiary hover:text-secondary'}"
					aria-label="View as cards"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
						/>
					</svg>
				</button>
				<button
					onclick={() => (viewMode = 'table')}
					class="rounded-lg p-2 transition-colors {viewMode === 'table'
						? 'bg-accent text-white'
						: 'text-tertiary hover:text-secondary'}"
					aria-label="View as table"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 10h16M4 14h16M4 18h16"
						/>
					</svg>
				</button>
			</div>
			<p class="text-sm text-secondary">{filteredAssets.length} assets found</p>
		</div>
	</Card>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-accent"></div>
		</div>
	{:else if filteredAssets.length === 0}
		<div class="py-12 text-center">
			<div class="mb-4 text-tertiary">
				<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-lg font-medium text-primary">No assets found</h3>
			<p class="mb-4 text-secondary">Try adjusting your search or filters.</p>
			<button
				onclick={() => (showAddModal = true)}
				class="rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:bg-accent-secondary"
			>
				Add Asset
			</button>
		</div>
	{:else if viewMode === 'cards'}
		<!-- Card View -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredAssets as asset}
				<div
					class="bg-card rounded-xl border border-card shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="p-6">
						<div class="mb-4 flex items-start justify-between">
							<div class="flex-1">
								<h3 class="text-primary mb-1 text-lg font-semibold">{asset.itemName}</h3>
								<p class="text-secondary text-sm">{asset.category?.name}</p>
							</div>
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(
									asset.status
								)}"
							>
								{asset.status}
							</span>
						</div>

						<div class="mb-4 space-y-2">
							{#if asset.modelBrand}
								<div class="flex justify-between text-sm">
									<span class="text-secondary">Brand:</span>
									<span class="font-medium text-primary">{asset.modelBrand}</span>
								</div>
							{/if}
							{#if asset.serialNumbers && asset.serialNumbers.length > 0}
								<div class="flex justify-between text-sm">
									<span class="text-secondary">Serial:</span>
									<div class="flex flex-wrap gap-1">
										{#each asset.serialNumbers as sn}
											<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
												{sn.serialNumber}
											</span>
										{/each}
									</div>
								</div>
							{/if}
							{#if asset.location}
								<div class="flex justify-between text-sm">
									<span class="text-secondary">Location:</span>
									<span class="font-medium text-primary">{asset.location}</span>
								</div>
							{/if}
							{#if asset.quantity > 1}
								<div class="flex justify-between text-sm">
									<span class="text-secondary">Quantity:</span>
									<span class="font-medium text-primary">{asset.quantity}</span>
								</div>
							{/if}
							{#if asset.isCable && asset.cableLength}
								<div class="flex justify-between text-sm">
									<span class="text-secondary">Length:</span>
									<span class="font-medium text-primary"
										>{asset.cableLength ? asset.cableLength.toFixed(1) : '0'} ft</span
									>
								</div>
							{/if}
						</div>

						<div class="flex items-center justify-between border-t border-card pt-4">
							<div class="flex space-x-2">
								<button
									onclick={() => openEditModal(asset)}
									class="text-sm font-medium text-accent hover:text-accent-secondary transition-colors"
								>
									Edit
								</button>
								<button
									onclick={() => openDeleteModal(asset)}
									class="text-sm font-medium text-error hover:text-red-700 transition-colors"
								>
									Delete
								</button>
							</div>
							{#if asset.purchasePrice}
								<span class="text-sm font-medium text-primary">${asset.purchasePrice}</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Table View -->
		<div class="bg-card overflow-hidden rounded-xl border border-card shadow-sm">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-card">
					<thead class="bg-tertiary">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase"
								>Item</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase"
								>Category</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase"
								>Status</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase"
								>Location</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase"
								>Serial</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase"
								>Price</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-card bg-card">
						{#each filteredAssets as asset}
							<tr class="hover:bg-tertiary transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-primary">{asset.itemName}</div>
										<div class="text-sm text-secondary">{asset.modelBrand || '-'}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getCategoryColor(
											asset.category?.name
										)}"
									>
										{asset.category?.name || 'Uncategorized'}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(
											asset.status
										)}"
									>
										{asset.status}
									</span>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-primary"
									>{asset.location || '-'}</td
								>
								<td class="px-6 py-4 font-mono text-sm whitespace-nowrap text-primary">
									{#if asset.serialNumbers && asset.serialNumbers.length > 0}
										<div class="flex flex-wrap gap-1">
											{#each asset.serialNumbers as sn}
												<span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
													{sn.serialNumber}
												</span>
											{/each}
										</div>
									{:else}
										-
									{/if}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-primary">
									{asset.purchasePrice ? `$${asset.purchasePrice}` : '-'}
								</td>
								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
									<div class="flex space-x-3">
										<button
											onclick={() => openEditModal(asset)}
											class="text-accent hover:text-accent-secondary transition-colors"
										>
											Edit
										</button>
										<button
											onclick={() => openDeleteModal(asset)}
											class="text-error hover:text-red-700 transition-colors"
										>
											Delete
										</button>
									</div>
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
		<div class="bg-card max-h-screen w-full max-w-2xl overflow-y-auto rounded-xl p-6 border border-card">
			<h2 class="mb-4 text-xl font-bold text-primary">Add New Asset</h2>
			<form onsubmit={addAsset} class="space-y-4">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="itemName" class="mb-1 block text-sm font-medium text-secondary"
							>Item Name *</label
						>
						<input
							id="itemName"
							type="text"
							bind:value={newAsset.itemName}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							placeholder="Enter item name"
							required
						/>
					</div>
					<div>
						<label for="categoryId" class="mb-1 block text-sm font-medium text-secondary"
							>Category *</label
						>
						<select
							id="categoryId"
							bind:value={newAsset.categoryId}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							required
						>
							<option value="">Select category</option>
							{#each categories as category}
								<option value={category.id.toString()}>{category.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="modelBrand" class="mb-1 block text-sm font-medium text-gray-700"
							>Model/Brand</label
						>
						<input
							id="modelBrand"
							type="text"
							bind:value={newAsset.modelBrand}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="e.g., Samsung, Apple"
						/>
					</div>
					<div>
						<label for="serialNumber" class="mb-1 block text-sm font-medium text-gray-700"
							>Serial Numbers</label
						>
						<div class="space-y-2">
							<div class="flex gap-2">
								<input
									id="serialNumber"
									type="text"
									bind:value={newSerialNumber}
									onkeypress={(e) => e.key === 'Enter' && (e.preventDefault(), addSerialNumber())}
									class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									placeholder="Enter serial number"
								/>
								<button
									type="button"
									onclick={addSerialNumber}
									class="flex items-center gap-1 rounded-md bg-accent px-3 py-2 text-white text-sm transition-colors hover:bg-accent-secondary"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
									</svg>
									Add
								</button>
							</div>
							{#if newAsset.serialNumbers.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each newAsset.serialNumbers as serialNumber, index}
										<span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
											{serialNumber}
											<button
												type="button"
												onclick={() => removeSerialNumber(index)}
												class="ml-1 text-blue-600 hover:text-blue-800"
											>
												<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="assetNumber" class="mb-1 block text-sm font-medium text-gray-700"
							>Asset Number</label
						>
						<input
							id="assetNumber"
							type="text"
							bind:value={newAsset.assetNumber}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="e.g., AST-001, INV-2024-001"
						/>
					</div>
					<div>
						<label for="supplier" class="mb-1 block text-sm font-medium text-gray-700"
							>Supplier</label
						>
						<input
							id="supplier"
							type="text"
							bind:value={newAsset.supplier}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="e.g., Amazon, Local Store"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="location" class="mb-1 block text-sm font-medium text-gray-700"
							>Location</label
						>
						<input
							id="location"
							type="text"
							bind:value={newAsset.location}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="e.g., Studio, Storage Room"
						/>
					</div>
					<div>
						<label for="status" class="mb-1 block text-sm font-medium text-gray-700">Status</label>
						<select
							id="status"
							bind:value={newAsset.status}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="Available">Available</option>
							<option value="In Use">In Use</option>
							<option value="Maintenance">Maintenance</option>
							<option value="Retired">Retired</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="purchaseDate" class="mb-1 block text-sm font-medium text-gray-700"
							>Purchase Date</label
						>
						<input
							id="purchaseDate"
							type="date"
							bind:value={newAsset.purchaseDate}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="purchasePrice" class="mb-1 block text-sm font-medium text-gray-700"
							>Purchase Price</label
						>
						<input
							id="purchasePrice"
							type="number"
							step="0.01"
							bind:value={newAsset.purchasePrice}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="0.00"
						/>
					</div>
				</div>

				<div>
					<label for="notes" class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
					<textarea
						id="notes"
						bind:value={newAsset.notes}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						rows="3"
						placeholder="Additional notes about this asset"
					></textarea>
				</div>

				<div class="flex space-x-3 pt-4">
					<button
						type="button"
						onclick={() => (showAddModal = false)}
						class="flex-1 bg-tertiary hover:bg-secondary text-primary py-2 px-4 rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 bg-accent hover:bg-accent-secondary text-white py-2 px-4 rounded-lg transition-colors"
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
		<div class="bg-card max-h-screen w-full max-w-2xl overflow-y-auto rounded-xl p-6 border border-card">
			<h2 class="mb-4 text-xl font-bold text-primary">Edit Asset</h2>
			<form onsubmit={handleEditAsset} class="space-y-4">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="edit-itemName" class="mb-1 block text-sm font-medium text-secondary"
							>Item Name *</label
						>
						<input
							id="edit-itemName"
							type="text"
							bind:value={newAsset.itemName}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							placeholder="Enter item name"
							required
						/>
					</div>
					<div>
						<label for="edit-categoryId" class="mb-1 block text-sm font-medium text-secondary"
							>Category *</label
						>
						<select
							id="edit-categoryId"
							bind:value={newAsset.categoryId}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							required
						>
							<option value="">Select category</option>
							{#each categories as category}
								<option value={category.id.toString()}>{category.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="edit-modelBrand" class="mb-1 block text-sm font-medium text-secondary"
							>Model/Brand</label
						>
						<input
							id="edit-modelBrand"
							type="text"
							bind:value={newAsset.modelBrand}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							placeholder="e.g., Samsung, Apple"
						/>
					</div>
					<div>
						<label for="edit-serialNumber" class="mb-1 block text-sm font-medium text-secondary"
							>Serial Numbers</label
						>
						<div class="space-y-2">
							<div class="flex gap-2">
								<input
									id="edit-serialNumber"
									type="text"
									bind:value={newSerialNumber}
									onkeypress={(e) => e.key === 'Enter' && (e.preventDefault(), addSerialNumber())}
									class="flex-1 rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
									placeholder="Enter serial number"
								/>
								<button
									type="button"
									onclick={addSerialNumber}
									class="flex items-center gap-1 rounded-md bg-accent px-3 py-2 text-white text-sm transition-colors hover:bg-accent-secondary"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
									</svg>
									Add
								</button>
							</div>
							{#if newAsset.serialNumbers.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each newAsset.serialNumbers as serialNumber, index}
										<span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
											{serialNumber}
											<button
												type="button"
												onclick={() => removeSerialNumber(index)}
												class="ml-1 text-blue-600 hover:text-blue-800"
											>
												<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="edit-assetNumber" class="mb-1 block text-sm font-medium text-secondary"
							>Asset Number</label
						>
						<input
							id="edit-assetNumber"
							type="text"
							bind:value={newAsset.assetNumber}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							placeholder="e.g., AST-001, INV-2024-001"
						/>
					</div>
					<div>
						<label for="edit-supplier" class="mb-1 block text-sm font-medium text-secondary"
							>Supplier</label
						>
						<input
							id="edit-supplier"
							type="text"
							bind:value={newAsset.supplier}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							placeholder="e.g., Amazon, Local Store"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="edit-location" class="mb-1 block text-sm font-medium text-secondary"
							>Location</label
						>
						<input
							id="edit-location"
							type="text"
							bind:value={newAsset.location}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							placeholder="e.g., Studio, Storage Room"
						/>
					</div>
					<div>
						<label for="edit-status" class="mb-1 block text-sm font-medium text-secondary"
							>Status</label
						>
						<select
							id="edit-status"
							bind:value={newAsset.status}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
						>
							<option value="Available">Available</option>
							<option value="In Use">In Use</option>
							<option value="Maintenance">Maintenance</option>
							<option value="Retired">Retired</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="edit-purchaseDate" class="mb-1 block text-sm font-medium text-secondary"
							>Purchase Date</label
						>
						<input
							id="edit-purchaseDate"
							type="date"
							bind:value={newAsset.purchaseDate}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
						/>
					</div>
					<div>
						<label for="edit-purchasePrice" class="mb-1 block text-sm font-medium text-secondary"
							>Purchase Price</label
						>
						<input
							id="edit-purchasePrice"
							type="number"
							step="0.01"
							bind:value={newAsset.purchasePrice}
							class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
							placeholder="0.00"
						/>
					</div>
				</div>

				<div>
					<label for="edit-notes" class="mb-1 block text-sm font-medium text-secondary">Notes</label>
					<textarea
						id="edit-notes"
						bind:value={newAsset.notes}
						class="w-full rounded-lg border border-card bg-input text-input px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
						rows="3"
						placeholder="Additional notes about this asset"
					></textarea>
				</div>

				<div class="flex space-x-3 pt-4">
					<button
						type="button"
						onclick={() => (showEditModal = false)}
						class="flex-1 bg-tertiary hover:bg-secondary text-primary py-2 px-4 rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 bg-accent hover:bg-accent-secondary text-white py-2 px-4 rounded-lg transition-colors"
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
		<div class="bg-card mx-4 w-full max-w-md rounded-xl p-6 border border-card">
			<h2 class="mb-4 text-xl font-bold text-primary">Delete Asset</h2>
			<p class="mb-6 text-secondary">
				Are you sure you want to delete <strong class="text-primary">{selectedAsset?.itemName}</strong>? This action
				cannot be undone.
			</p>
			<div class="flex space-x-3">
				<button
					onclick={() => (showDeleteModal = false)}
					class="flex-1 bg-tertiary hover:bg-secondary text-primary py-2 px-4 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={handleDeleteAsset}
					class="flex-1 bg-error hover:text-red-700 text-white py-2 px-4 rounded-lg transition-colors"
				>
					Delete Asset
				</button>
			</div>
		</div>
	</div>
{/if}
