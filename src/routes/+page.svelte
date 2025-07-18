<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Card from '$lib/components/Card.svelte';

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
			if (typeof assets === 'object' && assets !== null && 'error' in assets) {
				console.error('Dashboard - Assets API returned error:', (assets as any).error);
				assets = [];
			}
			
			// Check if categories is an error object
			if (typeof categories === 'object' && categories !== null && 'error' in categories) {
				console.error('Dashboard - Categories API returned error:', (categories as any).error);
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

<div class="space-y-6">
	<!-- Header -->

	<div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
		  <div>
			<h1 class="text-3xl font-bold">Dashboard</h1>
			<p class="text-white/80 mt-2 text-lg">Welcome to your studio inventory management system</p>
		  </div>
		  <div class="text-right flex space-x-4">
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{stats.total}</div>
				<div class="text-white/90 text-sm">Total Items</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{stats.available}</div>
				<div class="text-white/90 text-sm">Available</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{stats.inUse}</div>
				<div class="text-white/90 text-sm">In Use</div>
			</div>
		  </div>
		</div>
	  </div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-4 border-accent/20 border-t-accent"></div>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
			<Card gradient="from-accent to-accent-secondary">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="p-3 bg-gradient-to-br from-accent to-accent-secondary rounded-xl">
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-white">Total Items</p>
						<p class="text-3xl font-bold text-white">{stats.total}</p>
					</div>
				</div>
			</Card>

			<Card gradient="from-accent-success to-green-500">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="p-3 bg-gradient-to-br from-accent-success to-green-500 rounded-xl">
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-white">Available</p>
						<p class="text-3xl font-bold text-white">{stats.available}</p>
					</div>
				</div>
			</Card>

			<Card gradient="from-accent-info to-cyan-500">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="p-3 bg-gradient-to-br from-accent-info to-cyan-500 rounded-xl">
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-white">In Use</p>
						<p class="text-3xl font-bold text-white">{stats.inUse}</p>
					</div>
				</div>
			</Card>

			<Card gradient="from-accent-warning to-yellow-500">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="p-3 bg-gradient-to-br from-accent-warning to-yellow-500 rounded-xl">
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-white">Maintenance</p>
						<p class="text-3xl font-bold text-white">{stats.maintenance}</p>
					</div>
				</div>
			</Card>

			<Card gradient="from-accent-error to-red-500">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="p-3 bg-gradient-to-br from-accent-error to-red-500 rounded-xl">
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-white">Checkouts</p>
						<p class="text-3xl font-bold text-white">{stats.checkouts}</p>
					</div>
				</div>
			</Card>
		</div>

		<!-- Quick Actions -->
		<Card gradient="from-accent-secondary to-accent" padding="p-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center space-x-4">
					<div class="p-3 bg-gradient-to-br from-accent-secondary to-accent rounded-lg">
						<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<h3 class="text-2xl font-semibold text-white">Quick Actions</h3>
				</div>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<a href="/assets" class="group flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 transition-all duration-300">
					<div class="p-3 bg-gradient-to-br from-white/20 to-white/10 rounded-lg mr-4 group-hover:scale-110 transition-transform">
						<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					</div>
					<div>
						<h4 class="text-white font-medium">Browse Assets</h4>
						<p class="text-white/70 text-sm">View all equipment</p>
					</div>
				</a>
				<a href="/checkout-panel" class="group flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 transition-all duration-300">
					<div class="p-3 bg-gradient-to-br from-white/20 to-white/10 rounded-lg mr-4 group-hover:scale-110 transition-transform">
						<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
						</svg>
					</div>
					<div>
						<h4 class="text-white font-medium">Checkout Items</h4>
						<p class="text-white/70 text-sm">Borrow equipment</p>
					</div>
				</a>
				<a href="/my-checkouts" class="group flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 transition-all duration-300">
					<div class="p-3 bg-gradient-to-br from-white/20 to-white/10 rounded-lg mr-4 group-hover:scale-110 transition-transform">
						<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div>
						<h4 class="text-white font-medium">My Checkouts</h4>
						<p class="text-white/70 text-sm">View borrowed items</p>
					</div>
				</a>
			</div>
		</Card>

		<!-- Recent Assets -->
		<Card gradient="from-accent-warning to-yellow-500" padding="p-6">
			<div class="flex items-center space-x-4 mb-6">
				<div class="p-3 bg-gradient-to-br from-accent-warning to-yellow-500 rounded-lg">
					<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
					</svg>
				</div>
				<h3 class="text-2xl font-semibold text-white">Recent Assets</h3>
			</div>
			{#if assets.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each assets.slice(0, 6) as asset}
						<div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
							<div class="flex items-center justify-between mb-2">
								<h4 class="text-white font-medium truncate">{asset.itemName}</h4>
								<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {getStatusColor(asset.status)}">
									{asset.status}
								</span>
							</div>
							{#if asset.category}
								<p class="text-white/70 text-sm">{asset.category.name}</p>
							{/if}
							{#if asset.serialNumber}
								<p class="text-white/60 text-xs">SN: {asset.serialNumber}</p>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<div class="p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full mb-4 inline-block">
						<svg class="h-12 w-12 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					</div>
					<p class="text-white/60 text-lg">No assets found</p>
				</div>
			{/if}
		</Card>
	{/if}
</div>
