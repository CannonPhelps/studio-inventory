<script lang="ts">
	import { onMount } from 'svelte';

	let stats = {
		totalAssets: 0,
		availableAssets: 0,
		checkedOutAssets: 0,
		maintenanceNeeded: 0,
		totalUsers: 0,
		activeCheckouts: 0,
		categories: 0,
		cableTypes: 0
	};

	let recentActivity: any[] = [];
	let systemHealth = {
		status: 'healthy',
		lastBackup: '2024-01-15',
		diskUsage: 0,
		activeUsers: 0
	};

	onMount(async () => {
		try {
			const response = await fetch('/api/stats');
			if (response.ok) {
				const data = await response.json();
				stats = {
					totalAssets: data.totalAssets,
					availableAssets: data.availableAssets,
					checkedOutAssets: data.checkedOutAssets,
					maintenanceNeeded: data.maintenanceNeeded,
					totalUsers: data.totalUsers,
					activeCheckouts: data.activeCheckouts,
					categories: data.categories,
					cableTypes: data.cableTypes
				};
				recentActivity = data.recentActivity || [];
				
				// Update system health with real data
				systemHealth = {
					...systemHealth,
					activeUsers: data.totalUsers || 0,
					diskUsage: Math.round((data.totalAssets / 100) * 100) // Simple calculation based on assets
				};
			}
		} catch (error) {
			console.error('Error loading admin stats:', error);
		}
	});

	const quickActions = [
		{ name: 'Add New Asset', href: '/admin/assets/new', icon: '➕', color: 'blue' },
		{ name: 'Import Data', href: '/admin/import', icon: '📥', color: 'green' },
		{ name: 'User Management', href: '/admin/users', icon: '👥', color: 'purple' },
		{ name: 'Generate Report', href: '/admin/reports', icon: '📊', color: 'orange' },
		{ name: 'System Settings', href: '/admin/settings', icon: '⚙️', color: 'gray' },
		{ name: 'Backup System', href: '#', icon: '💾', color: 'indigo' }
	];

	function getStatusColor(status: string) {
		switch (status) {
			case 'completed': return 'text-green-600 bg-green-50';
			case 'pending': return 'text-yellow-600 bg-yellow-50';
			case 'failed': return 'text-red-600 bg-red-50';
			default: return 'text-gray-600 bg-gray-50';
		}
	}

	function getActivityIcon(type: string) {
		switch (type) {
			case 'checkout': return '📤';
			case 'return': return '📥';
			case 'maintenance': return '🔧';
			case 'import': return '📥';
			default: return '📋';
		}
	}
</script>

<svelte:head>
	<title>Dashboard - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
			<p class="text-gray-600 mt-1">System overview and administrative controls</p>
		</div>
		<div class="flex items-center space-x-4">
			<div class="text-center">
				<div class="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</div>
				<div class="text-gray-500 text-sm">Total Users</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-gray-900">{stats.activeCheckouts || 0}</div>
				<div class="text-gray-500 text-sm">Active Checkouts</div>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Total Assets</p>
					<p class="text-3xl font-bold text-gray-900">{stats.totalAssets}</p>
				</div>
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">📦</span>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-green-600 font-medium">{stats.totalAssets}</span>
					<span class="text-gray-500 ml-2">total items</span>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Available</p>
					<p class="text-3xl font-bold text-green-600">{stats.availableAssets}</p>
				</div>
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">✅</span>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-green-600 font-medium">{stats.totalAssets > 0 ? Math.round((stats.availableAssets / stats.totalAssets) * 100) : 0}%</span>
					<span class="text-gray-500 ml-2">availability rate</span>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Checked Out</p>
					<p class="text-3xl font-bold text-orange-600">{stats.checkedOutAssets}</p>
				</div>
				<div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">📤</span>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-orange-600 font-medium">{stats.totalAssets > 0 ? Math.round((stats.checkedOutAssets / stats.totalAssets) * 100) : 0}%</span>
					<span class="text-gray-500 ml-2">in use</span>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Maintenance</p>
					<p class="text-3xl font-bold text-red-600">{stats.maintenanceNeeded}</p>
				</div>
				<div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">🔧</span>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-red-600 font-medium">{stats.maintenanceNeeded} items</span>
					<span class="text-gray-500 ml-2">need attention</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions and System Health -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Quick Actions -->
		<div class="lg:col-span-2">
			<div class="bg-white rounded-xl shadow-sm border border-gray-200">
				<div class="p-6 border-b border-gray-200">
					<h2 class="text-xl font-semibold text-gray-900">Quick Actions</h2>
					<p class="text-gray-600 mt-1">Common administrative tasks</p>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each quickActions as action}
							<a
								href={action.href}
								class="group flex items-center p-4 rounded-xl border border-gray-200 hover:border-{action.color}-300 hover:bg-{action.color}-50 transition-all duration-200"
							>
								<div class="w-10 h-10 bg-{action.color}-100 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
									<span class="text-xl">{action.icon}</span>
								</div>
								<div>
									<h3 class="font-medium text-gray-900 group-hover:text-{action.color}-700">{action.name}</h3>
									<p class="text-sm text-gray-500">Quick access</p>
								</div>
								<svg class="w-5 h-5 text-gray-400 ml-auto group-hover:text-{action.color}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</a>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- System Health -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200">
			<div class="p-6 border-b border-gray-200">
				<h2 class="text-xl font-semibold text-gray-900">System Health</h2>
				<p class="text-gray-600 mt-1">Current system status</p>
			</div>
			<div class="p-6 space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-gray-700">Status</span>
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
						{systemHealth.status}
					</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-gray-700">Last Backup</span>
					<span class="text-sm text-gray-600">{systemHealth.lastBackup}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-gray-700">Disk Usage</span>
					<span class="text-sm text-gray-600">{systemHealth.diskUsage}%</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-gray-700">Active Users</span>
					<span class="text-sm text-gray-600">{systemHealth.activeUsers}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Activity -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200">
		<div class="p-6 border-b border-gray-200">
			<h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
			<p class="text-gray-600 mt-1">Latest system events</p>
		</div>
		<div class="p-6">
			{#if recentActivity.length > 0}
				<div class="space-y-4">
					{#each recentActivity as activity}
						<div class="flex items-center space-x-4">
							<div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
								<span class="text-sm">{getActivityIcon(activity.type)}</span>
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium text-gray-900">{activity.description}</p>
								<p class="text-xs text-gray-500">{activity.timestamp}</p>
							</div>
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(activity.status)}">
								{activity.status}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-8">
					<div class="text-gray-400 text-4xl mb-4">📋</div>
					<p class="text-gray-500">No recent activity</p>
				</div>
			{/if}
		</div>
	</div>
</div> 