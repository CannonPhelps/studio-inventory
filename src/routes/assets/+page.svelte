<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Card from '$lib/components/Card.svelte';

	let { data } = $props<{ data: PageData }>();
	
	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedStatus = $state('all');
	let viewMode = $state('grid'); // 'grid' or 'list'
	let assets = $state<any[]>([]);
	let categories = $state<any[]>([]);
	let filteredAssets = $state<any[]>([]);
	
	// Damage report modal
	let showDamageModal = $state(false);
	let selectedAsset = $state<any>(null);
	let damageForm = $state({
		description: '',
		severity: 'minor',
		location: '',
		reportedBy: ''
	});

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
								 (asset.serialNumbers && asset.serialNumbers.some((sn: any) => sn.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())));
			const matchesCategory = selectedCategory === 'all' || asset.category?.name.toLowerCase() === selectedCategory;
			const matchesStatus = selectedStatus === 'all' || asset.status.toLowerCase() === selectedStatus;
			return matchesSearch && matchesCategory && matchesStatus;
		});
	}

	function getStatusColor(status: string) {
		switch (status.toLowerCase()) {
			case 'available': return 'bg-success-light text-success';
			case 'in use': return 'bg-primary-100 text-primary-600';
			case 'maintenance': return 'bg-warning-light text-warning';
			case 'damaged': return 'bg-error-light text-error';
			case 'broken': return 'bg-error-light text-error';
			case 'retired': return 'bg-error-light text-error';
			default: return 'bg-secondary-100 text-secondary-600';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function openDamageModal(asset: any) {
		selectedAsset = asset;
		damageForm = {
			description: '',
			severity: 'minor',
			location: asset.location || '',
			reportedBy: 'current-user' // TODO: Get from auth
		};
		showDamageModal = true;
	}

	async function handleDamageReport() {
		if (!selectedAsset) return;
		
		try {
			const response = await fetch(`/api/assets/${selectedAsset.id}/damage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					description: damageForm.description,
					severity: damageForm.severity,
					location: damageForm.location,
					reportedBy: damageForm.reportedBy
				})
			});

			if (response.ok) {
				showDamageModal = false;
				// Refresh assets data
				const assetsResponse = await fetch('/api/assets');
				if (assetsResponse.ok) {
					assets = await assetsResponse.json();
					filterAssets();
				}
			} else {
				const error = await response.json();
				alert(`Error: ${error.error}`);
			}
		} catch (error) {
			console.error('Error reporting damage:', error);
			alert('Failed to report damage');
		}
	}
</script>

<svelte:head>
	<title>Assets - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->

	<div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
		  <div>
			<h1 class="text-3xl font-bold">Equipment Inventory</h1>
			<p class="text-white/80 mt-2 text-lg">Browse available studio equipment</p>
		  </div>
		  <div class="text-right flex space-x-4">
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{assets.filter(a => a.status === 'Available').length}</div>
				<div class="text-white/90 text-sm">Available</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{assets.filter(a => a.status === 'In Use').length}</div>
				<div class="text-white/90 text-sm">In Use</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{assets.filter(a => ['Damaged', 'Broken'].includes(a.status)).length}</div>
				<div class="text-white/90 text-sm">Damaged</div>
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
						class="w-full pl-10 pr-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-base"
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
					class="flex-1 px-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-base"
				>
					{#each categories as category}
						<option value={category.id}>{category.name} ({category.count})</option>
					{/each}
				</select>

				<select
					bind:value={selectedStatus}
					on:change={filterAssets}
					class="flex-1 px-4 py-3 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-base"
				>
					<option value="all">All Status</option>
					<option value="available">Available</option>
					<option value="in use">In Use</option>
					<option value="maintenance">Maintenance</option>
					<option value="damaged">Damaged</option>
					<option value="broken">Broken</option>
				</select>

				<!-- View Mode Toggle -->
				<div class="hidden sm:flex border border-input rounded-lg self-center">
					<button
						on:click={() => viewMode = 'grid'}
						class="p-3 {viewMode === 'grid' ? 'bg-accent text-white' : 'bg-input text-input hover:bg-tertiary'} rounded-l-lg transition-all duration-200 touch-manipulation"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<button
						on:click={() => viewMode = 'list'}
						class="p-3 {viewMode === 'list' ? 'bg-accent text-white' : 'bg-input text-input hover:bg-tertiary'} rounded-r-lg transition-all duration-200 touch-manipulation"
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

	<!-- Assets Grid/List -->
	<Card>
		<div class="p-4 sm:p-6 border-b border-card">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
				<h2 class="text-base sm:text-lg md:text-xl font-semibold text-primary">Equipment ({filteredAssets.length} items)</h2>
				<a href="/checkout-panel" class="text-accent hover:text-accent-secondary text-sm font-medium transition-colors duration-200">
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
								<div class="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-accent to-accent-secondary rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
									<svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
									<span class="text-primary truncate ml-2">
										{#if asset.serialNumbers && asset.serialNumbers.length > 0}
											{asset.serialNumbers[0].serialNumber}
											{#if asset.serialNumbers.length > 1}
												<span class="text-secondary"> +{asset.serialNumbers.length - 1}</span>
											{/if}
										{:else}
											-
										{/if}
									</span>
								</div>
							</div>
							
							<div class="flex flex-col space-y-2">
								{#if asset.status === 'Available'}
									<a href="/checkout-panel" class="w-full bg-accent text-white text-center py-2 px-4 rounded-lg hover:bg-accent-secondary transition-colors duration-200 text-sm font-medium">
										Check Out
									</a>
								{/if}
								<button
									on:click={() => openDamageModal(asset)}
									class="w-full bg-error-light text-error text-center py-2 px-4 rounded-lg hover:bg-error hover:text-white transition-colors duration-200 text-sm font-medium"
								>
									Report Damage
								</button>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="space-y-3">
					{#each filteredAssets as asset}
						<div class="bg-secondary border border-card rounded-xl p-4 hover:shadow-custom-md transition-all duration-200">
							<div class="flex items-center space-x-4">
								<div class="w-12 h-12 bg-gradient-to-br from-accent to-accent-secondary rounded-lg flex items-center justify-center flex-shrink-0">
									<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
									</svg>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center justify-between">
										<h3 class="font-semibold text-primary truncate">{asset.itemName}</h3>
										<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(asset.status)} ml-2">
											{asset.status}
										</span>
									</div>
									<p class="text-sm text-secondary truncate">{asset.category?.name || 'Uncategorized'}</p>
									<div class="flex items-center space-x-4 mt-1 text-xs text-secondary">
										<span>Location: {asset.location || '-'}</span>
										<span>Serial: {asset.serialNumbers && asset.serialNumbers.length > 0 ? asset.serialNumbers[0].serialNumber : '-'}</span>
									</div>
								</div>
								<div class="flex-shrink-0 flex space-x-2">
									{#if asset.status === 'Available'}
										<a href="/checkout-panel" class="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-secondary transition-colors duration-200 text-sm font-medium">
											Check Out
										</a>
									{/if}
									<button
										on:click={() => openDamageModal(asset)}
										class="bg-error-light text-error px-4 py-2 rounded-lg hover:bg-error hover:text-white transition-colors duration-200 text-sm font-medium"
									>
										Report Damage
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
			
			{#if filteredAssets.length === 0}
				<div class="text-center py-12">
					<div class="text-6xl mb-4">📦</div>
					<h3 class="text-lg font-medium text-primary mb-2">No equipment found</h3>
					<p class="text-secondary mb-4">Try adjusting your search or filters</p>
				</div>
			{/if}
		</div>
	</Card>
</div>

<!-- Damage Report Modal -->
{#if showDamageModal && selectedAsset}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-card rounded-xl shadow-custom-lg max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-primary">Report Equipment Damage</h3>
				<button
					on:click={() => showDamageModal = false}
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
				<p class="text-sm text-secondary">Serial: {selectedAsset.serialNumbers && selectedAsset.serialNumbers.length > 0 ? selectedAsset.serialNumbers[0].serialNumber : 'N/A'}</p>
			</div>
			
			<form on:submit|preventDefault={handleDamageReport} class="space-y-4">
				<div>
					<label for="severity" class="block text-sm font-medium text-primary mb-2">Damage Severity</label>
					<select
						id="severity"
						bind:value={damageForm.severity}
						required
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent"
					>
						<option value="minor">Minor - Cosmetic damage, still functional</option>
						<option value="moderate">Moderate - Some functionality affected</option>
						<option value="major">Major - Significant functionality issues</option>
						<option value="broken">Broken - Non-functional, needs repair</option>
					</select>
				</div>
				
				<div>
					<label for="location" class="block text-sm font-medium text-primary mb-2">Current Location</label>
					<input
						id="location"
						type="text"
						bind:value={damageForm.location}
						required
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent"
						placeholder="Where is the equipment located?"
					/>
				</div>
				
				<div>
					<label for="description" class="block text-sm font-medium text-primary mb-2">Damage Description</label>
					<textarea
						id="description"
						bind:value={damageForm.description}
						required
						rows="4"
						class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent"
						placeholder="Describe the damage in detail..."
					></textarea>
				</div>
				
				<div class="flex space-x-3">
					<button
						type="button"
						on:click={() => showDamageModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error-dark transition-colors"
					>
						Report Damage
					</button>
				</div>
			</form>
		</div>
	</div>
{/if} 