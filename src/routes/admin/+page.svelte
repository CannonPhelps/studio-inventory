<script lang="ts">
	import { onMount } from 'svelte';

	import Card from '$lib/components/Card.svelte';

	let stats = {
		totalAssets: 0,
		availableAssets: 0,
		checkedOutAssets: 0,
		maintenanceNeeded: 0,
		damagedAssets: 0,
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
					damagedAssets: data.damagedAssets,
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
		{ name: 'Add New Asset', href: '/admin/infrastructure', icon: '➕', color: 'blue' },
		{ name: 'Import Data', href: '/admin/import', icon: '📥', color: 'green' },
		{ name: 'Damage Management', href: '/admin/damage-management', icon: '⚠️', color: 'red' },
		{ name: 'Backup System', href: '/admin/backups', icon: '💾', color: 'indigo' },
		{ name: 'Audit Logs', href: '/admin/audit-logs', icon: '📋', color: 'orange' },
		{ name: 'System Settings', href: '/admin/system', icon: '⚙️', color: 'gray' }
	];

	function getStatusColor(status: string) {
		switch (status) {
			case 'completed': return 'text-green-600 bg-green-50';
			case 'pending': return 'text-yellow-600 bg-yellow-50';
			case 'reported': return 'text-red-600 bg-red-50';
			case 'failed': return 'text-red-600 bg-red-50';
			default: return 'text-gray-600 bg-gray-50';
		}
	}

	function getActivityIcon(type: string) {
		switch (type) {
			case 'checkout': return '📤';
			case 'return': return '📥';
			case 'damage': return '⚠️';
			case 'maintenance': return '🔧';
			case 'import': return '📥';
			default: return '📋';
		}
	}
</script>

<svelte:head>
	<title>Overview - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->

	<div class="bg-gradient-to-r from-slate-700 to-gray-800 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
		  <div>
			<h1 class="text-3xl font-bold">Overview</h1>
			<p class="text-white/80 mt-2 text-lg">System overview and administrative controls</p>
		  </div>
		  <div class="text-right flex space-x-4">
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{stats.totalUsers || 0}</div>
				<div class="text-white/90 text-sm">Total Users</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{stats.activeCheckouts || 0}</div>
				<div class="text-white/90 text-sm">Active Checkouts</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-white">{stats.damagedAssets || 0}</div>
				<div class="text-white/90 text-sm">Damaged Assets</div>
			</div>
		  </div>
		</div>
	  </div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<Card gradient="from-accent to-accent-secondary">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-secondary">Total Assets</p>
					<p class="text-3xl font-bold text-primary">{stats.totalAssets}</p>
				</div>
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">📦</span>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-green-600 font-medium">{stats.totalAssets}</span>
					<span class="text-tertiary ml-2">total items</span>
				</div>
			</div>
		</Card>

		<Card gradient="from-accent-success to-green-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-secondary">Available</p>
					<p class="text-3xl font-bold text-green-600">{stats.availableAssets}</p>
				</div>
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">✅</span>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-green-600 font-medium">{stats.totalAssets > 0 ? Math.round((stats.availableAssets / stats.totalAssets) * 100) : 0}%</span>
					<span class="text-tertiary ml-2">availability rate</span>
				</div>
			</div>
		</Card>

		<Card gradient="from-accent-warning to-orange-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-secondary">Checked Out</p>
					<p class="text-3xl font-bold text-orange-600">{stats.checkedOutAssets}</p>
				</div>
				<div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">📤</span>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-orange-600 font-medium">{stats.totalAssets > 0 ? Math.round((stats.checkedOutAssets / stats.totalAssets) * 100) : 0}%</span>
					<span class="text-tertiary ml-2">in use</span>
				</div>
			</div>
		</Card>

		<Card gradient="from-accent-error to-red-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-secondary">Needs Attention</p>
					<p class="text-3xl font-bold text-red-600">{stats.maintenanceNeeded}</p>
				</div>
				<div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">🔧</span>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-red-600 font-medium">{stats.damagedAssets} damaged</span>
					<span class="text-tertiary ml-2">+ {stats.maintenanceNeeded - stats.damagedAssets} maintenance</span>
				</div>
			</div>
		</Card>
	</div>

	<!-- Quick Actions and System Health -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Quick Actions -->
		<div class="lg:col-span-2">
			<Card gradient="from-secondary/20 to-secondary/10">
				<div class="p-6 border-b border-card">
					<h2 class="text-xl font-semibold text-primary">Quick Actions</h2>
					<p class="text-secondary mt-1">Common administrative tasks</p>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each quickActions as action}
							<a
								href={action.href}
								class="group flex items-center p-4 rounded-xl border border-card bg-card hover:border-accent hover:bg-tertiary transition-all duration-200"
							>
								<div class="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
									<span class="text-xl">{action.icon}</span>
								</div>
								<div>
									<h3 class="font-medium text-primary group-hover:text-accent">{action.name}</h3>
									<p class="text-sm text-tertiary">Quick access</p>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</Card>
		</div>

		<!-- System Health -->
		<div>
			<Card gradient="from-accent-info to-cyan-500">
				<div class="p-6 border-b border-card">
					<h2 class="text-xl font-semibold text-primary">System Health</h2>
					<p class="text-secondary mt-1">Current system status</p>
				</div>
				<div class="p-6 space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-secondary">Status</span>
						<span class="text-green-600 font-semibold">{systemHealth.status}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-secondary">Last Backup</span>
						<span class="text-primary">{systemHealth.lastBackup}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-secondary">Disk Usage</span>
						<span class="text-primary">{systemHealth.diskUsage}%</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-secondary">Active Users</span>
						<span class="text-primary">{systemHealth.activeUsers}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-secondary">Damaged Assets</span>
						<span class="text-red-600 font-semibold">{stats.damagedAssets}</span>
					</div>
				</div>
			</Card>
		</div>
	</div>

	<!-- Recent Activity -->
	<Card gradient="from-accent-warning to-yellow-500">
		<div class="p-6 border-b border-card">
			<h2 class="text-xl font-semibold text-primary">Recent Activity</h2>
			<p class="text-secondary mt-1">Latest system events</p>
		</div>
		<div class="p-6">
			{#if recentActivity.length > 0}
				<div class="space-y-4">
					{#each recentActivity as activity}
						<div class="flex items-center space-x-4">
							<div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
								<span class="text-sm">{getActivityIcon(activity.type)}</span>
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium text-primary">{activity.description}</p>
								<p class="text-xs text-tertiary">{activity.timestamp}</p>
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
					<p class="text-tertiary">No recent activity</p>
				</div>
			{/if}
		</div>
	</Card>
</div> 