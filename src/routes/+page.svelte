<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import AppLayout from '$lib/components/AppLayout.svelte';

	let { data } = $props<{ data: PageData }>();
	
	let assets = $state<any[]>([]);
	let categories = $state<any[]>([]);
	let loading = $state(false);
	let stats = $state({
		total: 0,
		available: 0,
		inUse: 0,
		maintenance: 0,
		checkouts: 0
	});

	onMount(async () => {
		await loadDashboardData();
	});

	async function loadDashboardData() {
		try {
			console.log('Dashboard - Starting to load data...');
			console.log('Dashboard - Current user:', data.user);
			
			const [assetsRes, categoriesRes, statsRes] = await Promise.all([
				fetch('/api/assets'),
				fetch('/api/categories'),
				fetch('/api/stats')
			]);
			
			console.log('Dashboard - Assets response status:', assetsRes.status);
			console.log('Dashboard - Categories response status:', categoriesRes.status);
			console.log('Dashboard - Stats response status:', statsRes.status);
			
			if (!assetsRes.ok) {
				console.error('Dashboard - Assets API error:', assetsRes.status, assetsRes.statusText);
				const errorText = await assetsRes.text();
				console.error('Dashboard - Assets API error details:', errorText);
			}
			
			if (!categoriesRes.ok) {
				console.error('Dashboard - Categories API error:', categoriesRes.status, categoriesRes.statusText);
				const errorText = await categoriesRes.text();
				console.error('Dashboard - Categories API error details:', errorText);
			}
			
			if (!statsRes.ok) {
				console.error('Dashboard - Stats API error:', statsRes.status, statsRes.statusText);
				const errorText = await statsRes.text();
				console.error('Dashboard - Stats API error details:', errorText);
			}
			
			console.log('Dashboard - About to parse JSON responses...');
			
			assets = await assetsRes.json();
			categories = await categoriesRes.json();
			
			console.log('Dashboard - Raw assets response:', assets);
			console.log('Dashboard - Raw categories response:', categories);
			console.log('Dashboard - Assets loaded:', assets.length);
			console.log('Dashboard - Categories loaded:', categories.length);
			console.log('Dashboard - First asset:', assets[0] ? assets[0].itemName : 'No assets');
			
			// Check if assets is an error object
			if (assets.error) {
				console.error('Dashboard - Assets API returned error:', assets.error);
				assets = [];
			}
			
			// Check if categories is an error object
			if (categories.error) {
				console.error('Dashboard - Categories API returned error:', categories.error);
				categories = [];
			}
			
			if (statsRes.ok) {
				const statsData = await statsRes.json();
				// Use API stats for more accurate counts
				stats = {
					total: statsData.totalAssets || assets.length,
					available: statsData.availableAssets || assets.filter(a => a.status === 'Available').length,
					inUse: statsData.checkedOutAssets || assets.filter(a => a.status === 'In Use' || a.status === 'Checked Out').length,
					maintenance: statsData.maintenanceNeeded || assets.filter(a => a.status === 'Maintenance').length,
					checkouts: statsData.activeCheckouts || 0
				};
			} else {
				// Fallback to client-side calculation
				stats = {
					total: assets.length,
					available: assets.filter(a => a.status === 'Available').length,
					inUse: assets.filter(a => a.status === 'In Use' || a.status === 'Checked Out').length,
					maintenance: assets.filter(a => a.status === 'Maintenance').length,
					checkouts: 0
				};
			}
		} catch (error) {
			console.error('Error loading dashboard data:', error);
			// Fallback to client-side calculation
			stats = {
				total: assets.length,
				available: assets.filter(a => a.status === 'Available').length,
				inUse: assets.filter(a => a.status === 'In Use' || a.status === 'Checked Out').length,
				maintenance: assets.filter(a => a.status === 'Maintenance').length,
				checkouts: 0
			};
		} finally {
			loading = false;
		}
	}

	function getCategoryCount(categoryName: string) {
		return assets.filter(a => a.category?.name === categoryName).length;
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'Available': return 'bg-success-light text-success';
			case 'In Use': return 'bg-primary-100 text-primary-600';
			case 'Maintenance': return 'bg-warning-light text-warning';
			case 'Retired': return 'bg-error-light text-error';
			default: return 'bg-secondary-100 text-secondary-600';
		}
	}

	function getCategoryColor(categoryName: string) {
		const colors = [
			'bg-primary-100 text-primary-600',
			'bg-success-light text-success',
			'bg-tertiary-100 text-tertiary-600',
			'bg-warning-light text-warning',
			'bg-error-light text-error',
			'bg-info-light text-info'
		];
		const index = categories.findIndex(c => c.name === categoryName);
		return colors[index % colors.length];
	}
</script>

<svelte:head>
	<title>Dashboard - Studio Inventory</title>
</svelte:head>

<AppLayout user={data.user}>
	<!-- Debug Information (temporary) -->
	<!-- <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
		<strong>Debug Info:</strong><br>
		Loading: {loading}<br>
		Assets Count: {assets.length}<br>
		Categories Count: {categories.length}<br>
		Stats Total: {stats.total}<br>
		User: {data.user?.email} ({data.user?.role})<br>
		First Asset: {assets[0] ? assets[0].itemName : 'None'}<br>
		First Category: {categories[0] ? categories[0].name : 'None'}
	</div> -->

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
		</div>
	{:else}
		<!-- Welcome Section -->
		<div class="mb-8">
			<div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-custom-lg">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-3xl font-bold mb-2">Welcome to Studio Inventory</h1>
						<p class=" text-lg">Manage your equipment and track everything in one place</p>
					</div>
					<div>
						<div class="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-custom">
							<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
			<div class="bg-card rounded-xl shadow-custom p-6 border border-card hover:shadow-custom-md transition-all duration-200">
				<div class="flex flex-col items-start sm:flex-row sm:items-center">
					<div class="p-3 bg-primary-100 rounded-lg self-center">
						<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					</div>
					<div class="mx-auto lg:ml-4 mt-2">
						<p class="text-sm font-medium text-secondary">Total Items</p>
						<p class="text-2xl font-bold text-primary text-center">{stats.total}</p>
					</div>
				</div>
			</div>

			<div class="bg-card rounded-xl shadow-custom p-6 border border-card hover:shadow-custom-md transition-all duration-200">
				<div class="flex flex-col items-start sm:flex-row sm:items-center">
					<div class="p-3 bg-success-light rounded-lg self-center">
						<svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div class="mx-auto lg:ml-4 mt-2">
						<p class="text-sm font-medium text-secondary">Available</p>
						<p class="text-2xl font-bold text-primary text-center">{stats.available}</p>
					</div>
				</div>
			</div>

			<div class="bg-card rounded-xl shadow-custom p-6 border border-card hover:shadow-custom-md transition-all duration-200">
				<div class="flex flex-col items-start sm:flex-row sm:items-center">
					<div class="p-3 bg-primary-100 rounded-lg self-center">
						<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div class="mx-auto lg:ml-4 mt-2">
						<p class="text-sm font-medium text-secondary">In Use</p>
						<p class="text-2xl font-bold text-primary text-center">{stats.inUse}</p>
					</div>
				</div>
			</div>

			<div class="bg-card rounded-xl shadow-custom p-6 border border-card hover:shadow-custom-md transition-all duration-200">
				<div class="flex flex-col items-start sm:flex-row sm:items-center">
					<div class="p-3 bg-warning-light rounded-lg self-center">
						<svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<div class="mx-auto lg:ml-4 mt-2">
						<p class="text-sm font-medium text-secondary">Maintenance</p>
						<p class="text-2xl font-bold text-primary text-center">{stats.maintenance}</p>
					</div>
				</div>
			</div>

			<div class="bg-card rounded-xl shadow-custom p-6 border border-card hover:shadow-custom-md transition-all duration-200">
				<div class="flex flex-col items-start sm:flex-row sm:items-center">
					<div class="p-3 bg-tertiary-100 rounded-lg self-center">
						<svg class="w-6 h-6 text-tertiary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<div class="mx-auto lg:ml-4 mt-2">
						<p class="text-sm font-medium text-secondary">Checkouts</p>
						<p class="text-2xl font-bold text-primary text-center">{stats.checkouts}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Charts and Analytics -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
			<!-- Recent Assets -->
			<div class="bg-card rounded-xl shadow-custom border border-card">
				<div class="p-6 border-b border-card">
					<h2 class="text-lg font-semibold text-primary">Recent Assets</h2>
					<p class="text-sm text-secondary mt-1">Latest equipment additions</p>
				</div>
				<div class="p-6">
					{#if assets.length > 0}
						<div class="space-y-4">
							{#each assets.slice(0, 5) as asset}
								<div class="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-200">
									<div class="flex items-center space-x-3 min-w-0 flex-1">
										<div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
											<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
											</svg>
										</div>
										<div class="min-w-0 flex-1">
											<p class="text-sm font-medium text-primary truncate">{asset.itemName}</p>
											<p class="text-xs text-secondary truncate">{asset.category?.name || 'Uncategorized'}</p>
										</div>
									</div>
									<span class="px-2 py-1 text-xs font-medium rounded-full {getStatusColor(asset.status)} flex-shrink-0 ml-2">
										{asset.status}
									</span>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<svg class="w-12 h-12 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
							<p class="text-secondary">No assets found</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Category Distribution -->
			<div class="bg-card rounded-xl shadow-custom border border-card">
				<div class="p-6 border-b border-card">
					<h2 class="text-lg font-semibold text-primary">Category Distribution</h2>
					<p class="text-sm text-secondary mt-1">Equipment by category</p>
				</div>
				<div class="p-6">
					{#if categories.length > 0}
						<div class="space-y-4">
							{#each categories.slice(0, 6) as category}
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-3 min-w-0 flex-1">
										<div class="w-8 h-8 rounded-lg flex items-center justify-center {getCategoryColor(category.name)} flex-shrink-0">
											<span class="text-xs font-bold">{category.name.charAt(0)}</span>
										</div>
										<span class="text-sm font-medium text-primary truncate">{category.name}</span>
									</div>
									<div class="flex items-center space-x-2 flex-shrink-0">
										<div class="w-16 bg-secondary-200 rounded-full h-2">
											<div class="bg-primary-500 h-2 rounded-full" style="width: {(getCategoryCount(category.name) / stats.total * 100) || 0}%"></div>
										</div>
										<span class="text-xs font-medium text-secondary w-8 text-right">{getCategoryCount(category.name)}</span>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<svg class="w-12 h-12 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							<p class="text-secondary">No categories found</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="bg-card rounded-xl shadow-custom border border-card">
			<div class="p-6 border-b border-card">
				<h2 class="text-lg font-semibold text-primary">Quick Actions</h2>
				<p class="text-sm text-secondary mt-1">Common tasks and shortcuts</p>
			</div>
			<div class="p-6">
				<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
					<a href="/assets" class="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 text-center touch-manipulation">
						<div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-all duration-200">
							<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
						</div>
						<p class="text-sm font-medium text-primary">View Assets</p>
					</a>
					
					<a href="/checkout-panel" class="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 text-center touch-manipulation">
						<div class="w-12 h-12 bg-accent-success/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent-success/20 transition-all duration-200">
							<svg class="w-6 h-6 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
						</div>
						<p class="text-sm font-medium text-primary">Checkout Item</p>
					</a>
					
					<a href="/returns" class="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 text-center touch-manipulation">
						<div class="w-12 h-12 bg-accent-warning/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent-warning/20 transition-all duration-200">
							<svg class="w-6 h-6 text-accent-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
							</svg>
						</div>
						<p class="text-sm font-medium text-primary">Return Item</p>
					</a>
					
					<a href="/settings" class="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 text-center touch-manipulation">
						<div class="w-12 h-12 bg-tertiary-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-tertiary-200 transition-all duration-200">
							<svg class="w-6 h-6 text-tertiary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<p class="text-sm font-medium text-primary">Settings</p>
					</a>
				</div>
			</div>
		</div>
	{/if}
</AppLayout>
