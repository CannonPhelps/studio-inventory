<script lang="ts">
	import { onMount } from 'svelte';

	let assets: any[] = [];
	let categories: any[] = [];
	let loading = true;
	let stats = {
		total: 0,
		available: 0,
		inUse: 0,
		maintenance: 0,
		checkouts: 0
	};

	onMount(async () => {
		await loadDashboardData();
	});

	async function loadDashboardData() {
		try {
			const [assetsRes, categoriesRes, statsRes] = await Promise.all([
				fetch('/api/assets'),
				fetch('/api/categories'),
				fetch('/api/stats')
			]);
			
			assets = await assetsRes.json();
			categories = await categoriesRes.json();
			
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
</script>

<svelte:head>
	<title>Dashboard - Studio Inventory</title>
</svelte:head>

{#if loading}
	<div class="flex justify-center items-center py-12">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
	</div>
{:else}
	<!-- Welcome Section -->
	<div class="mb-8">
		<div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold mb-2">Welcome to Studio Inventory</h1>
					<p class="text-blue-100 text-lg">Manage your equipment and track everything in one place</p>
				</div>
				<div class="hidden md:block">
					<div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
						<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
		<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<div class="flex items-center">
				<div class="p-3 bg-blue-100 rounded-lg">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Total Items</p>
					<p class="text-2xl font-bold text-gray-900">{stats.total}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<div class="flex items-center">
				<div class="p-3 bg-green-100 rounded-lg">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Available</p>
					<p class="text-2xl font-bold text-gray-900">{stats.available}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<div class="flex items-center">
				<div class="p-3 bg-blue-100 rounded-lg">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">In Use</p>
					<p class="text-2xl font-bold text-gray-900">{stats.inUse}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<div class="flex items-center">
				<div class="p-3 bg-yellow-100 rounded-lg">
					<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Maintenance</p>
					<p class="text-2xl font-bold text-gray-900">{stats.maintenance}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<div class="flex items-center">
				<div class="p-3 bg-purple-100 rounded-lg">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Checkouts</p>
					<p class="text-2xl font-bold text-gray-900">{stats.checkouts}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Charts and Analytics -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Category Distribution -->
		<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
			<div class="space-y-4">
				{#each categories as category}
					{@const count = getCategoryCount(category.name)}
					{@const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}
					<div class="flex items-center justify-between">
						<div class="flex items-center">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getCategoryColor(category.name)}">
								{category.name}
							</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-32 bg-gray-200 rounded-full h-2">
								<div 
									class="bg-blue-600 h-2 rounded-full transition-all duration-300"
									style="width: {percentage}%"
								></div>
							</div>
							<span class="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Status Distribution -->
		<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
			<div class="space-y-4">
				{#each ['Available', 'In Use', 'Maintenance', 'Retired'] as status}
					{@const count = assets.filter(a => a.status === status || (status === 'In Use' && a.status === 'Checked Out')).length}
					{@const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}
					<div class="flex items-center justify-between">
						<div class="flex items-center">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(status)}">
								{status === 'In Use' ? 'In Use/Checked Out' : status}
							</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-32 bg-gray-200 rounded-full h-2">
								<div 
									class="h-2 rounded-full transition-all duration-300 {status === 'Available' ? 'bg-green-600' : status === 'In Use' ? 'bg-blue-600' : status === 'Maintenance' ? 'bg-yellow-600' : 'bg-red-600'}"
									style="width: {percentage}%"
								></div>
							</div>
							<span class="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Recent Activity and Quick Actions -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Recent Assets -->
		<div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Recent Assets</h3>
				<a href="/assets" class="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</a>
			</div>
			<div class="space-y-3">
				{#each assets.slice(0, 5) as asset}
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div class="flex items-center space-x-3">
							<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
							</div>
							<div>
								<p class="text-sm font-medium text-gray-900">{asset.itemName}</p>
								<p class="text-xs text-gray-500">{asset.category?.name}</p>
							</div>
						</div>
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
							{asset.status}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
			<div class="space-y-3">
				<a href="/assets" class="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
					<svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					<span class="text-sm font-medium text-blue-900">Add New Asset</span>
				</a>
				
				<a href="/import" class="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
					<svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
					</svg>
					<span class="text-sm font-medium text-green-900">Import Data</span>
				</a>
				
				<a href="/checkouts" class="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
					<svg class="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					<span class="text-sm font-medium text-purple-900">Checkout Item</span>
				</a>
				
				<a href="/maintenance" class="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
					<svg class="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span class="text-sm font-medium text-yellow-900">Schedule Maintenance</span>
				</a>
			</div>
		</div>
	</div>
{/if}
