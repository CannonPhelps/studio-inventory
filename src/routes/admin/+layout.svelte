<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let sidebarOpen = true;
	let user: any = null;

	onMount(async () => {
		try {
			const response = await fetch('/api/auth/me');
			const data = await response.json();
			user = data.user;
		} catch (error) {
			console.error('Error loading user:', error);
		}
	});

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout error:', error);
		}
	}

	const navigation = [
		{ name: 'Dashboard', href: '/admin', icon: '📊', current: true },
		{ name: 'Assets', href: '/admin/assets', icon: '📦', current: false },
		{ name: 'Categories', href: '/admin/categories', icon: '🏷️', current: false },
		{ name: 'Cable Management', href: '/admin/bulk-cables', icon: '🔌', current: false },
		{ name: 'Users', href: '/admin/users', icon: '👥', current: false },
		{ name: 'Import', href: '/admin/import', icon: '📥', current: false },
		{ name: 'Admin Checkouts', href: '/admin/checkouts', icon: '📤', current: false },
		{ name: 'Admin Returns', href: '/admin/returns', icon: '📥', current: false },
		{ name: 'Maintenance', href: '/admin/maintenance', icon: '🔧', current: false },
		{ name: 'Movements', href: '/admin/movements', icon: '🔄', current: false },
		{ name: 'Settings', href: '/admin/settings', icon: '⚙️', current: false }
	];

	$: currentPath = $page.url.pathname;
	$: navigationWithCurrent = navigation.map(item => ({
		...item,
		current: currentPath === item.href
	}));
</script>

<svelte:head>
	<title>Admin - Studio Inventory</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0">
		<!-- Sidebar Header -->
		<div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
			<div class="flex items-center">
				<div class="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
				</div>
				<h1 class="text-xl font-bold text-gray-900">Studio Inventory</h1>
			</div>
			<button
				onclick={() => sidebarOpen = false}
				class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 px-4 py-6 space-y-2">
			{#each navigationWithCurrent as item}
				<a
					href={item.href}
					class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 {item.current ? 'bg-red-50 text-red-700 border-r-2 border-red-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}"
				>
					<span class="mr-3 text-lg">{item.icon}</span>
					{item.name}
					{#if item.current}
						<div class="ml-auto w-2 h-2 bg-red-600 rounded-full"></div>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- User Section -->
		{#if user}
			<div class="border-t border-gray-200 p-4">
				<div class="flex items-center">
					<div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
						<span class="text-sm font-medium text-red-700">{user.name.charAt(0)}</span>
					</div>
					<div class="ml-3 flex-1">
						<p class="text-sm font-medium text-gray-900">{user.name}</p>
						<p class="text-xs text-gray-500">{user.role}</p>
					</div>
					<button
						onclick={handleLogout}
						class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
						title="Logout"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Mobile overlay -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
			onclick={() => sidebarOpen = false}
		></div>
	{/if}

	<!-- Main content -->
	<div class="min-h-screen">


		<!-- Page content -->
		<main class="p-6">
			<slot />
		</main>
	</div>
</div> 