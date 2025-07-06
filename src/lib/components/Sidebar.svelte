<script lang="ts">
	import type { User } from '$lib/types';

	interface Props {
		user: User | null;
		currentPath: string;
		sidebarOpen: boolean;
		onCloseSidebar?: () => void;
	}

	let { user, currentPath, sidebarOpen, onCloseSidebar } = $props();

	const navigation = [
		{ name: 'Dashboard', href: '/', icon: '📊', current: true },
		{ name: 'Assets', href: '/assets', icon: '📦', current: false },
		{ name: 'Checkout', href: '/checkout-panel', icon: '📤', current: false },
		{ name: 'My Checkouts', href: '/my-checkouts', icon: '📋', current: false },
		{ name: 'Returns', href: '/returns', icon: '📥', current: false },
		{ name: 'Settings', href: '/settings', icon: '⚙️', current: false }
	];

	const navigationWithCurrent = $derived(navigation.map(item => ({
		...item,
		current: currentPath === item.href
	})));

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout error:', error);
		}
	}

	function goToAdmin() {
		window.location.href = '/admin';
	}
</script>

<!-- User Sidebar -->
<div class="h-screen sticky top-0 left-0 z-50 w-64 bg-sidebar shadow-custom-lg border-r border-sidebar transform transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:z-auto">
	<!-- Desktop header -->
	<div class="hidden md:block p-6 border-b border-sidebar">
		<div class="flex items-center">
			<div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-custom">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
				</svg>
			</div>
			<div class="ml-3">
				<h1 class="text-lg font-bold text-primary">Studio Inventory</h1>
				<p class="text-sm text-secondary">Equipment Management</p>
			</div>
		</div>
	</div>

	<!-- Mobile header (hidden on desktop) -->
	<div class="md:hidden p-4 border-b border-sidebar">
		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-custom">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
				</div>
				<div class="ml-3">
					<h1 class="text-base font-bold text-primary">Studio Inventory</h1>
				</div>
			</div>
			<button
				onclick={onCloseSidebar}
				class="p-2 rounded-lg text-secondary hover:text-primary hover:bg-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-sidebar transition-all duration-200"
				aria-label="Close sidebar"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
		{#each navigationWithCurrent as item}
			<a
				href={item.href}
				onclick={onCloseSidebar}
				class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 {item.current ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-custom' : 'text-secondary hover:bg-tertiary hover:text-primary'}"
			>
				<span class="mr-3 text-lg">{item.icon}</span>
				{item.name}
				{#if item.current}
					<div class="ml-auto w-2 h-2 bg-white rounded-full shadow-custom"></div>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- User Section -->
	{#if user}
		<div class="border-t border-sidebar p-4 absolute bottom-0 w-full bg-sidebar">
			<div class="flex items-center">
				<div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-custom">
					<span class="text-sm font-semibold text-white">{user.name.charAt(0)}</span>
				</div>
				<div class="ml-3 flex-1 min-w-0">
					<p class="text-sm font-semibold text-primary truncate">{user.name}</p>
					<p class="text-xs text-secondary truncate">{user.role}</p>
				</div>
				<div class="flex space-x-1">
					{#if user.role === 'admin'}
						<button
							onclick={goToAdmin}
							class="p-2 rounded-lg text-secondary hover:text-primary hover:bg-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-sidebar transition-all duration-200"
							title="Go to Admin Panel"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</button>
					{/if}
					<button
						onclick={handleLogout}
						class="p-2 rounded-lg text-secondary hover:text-primary hover:bg-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-sidebar transition-all duration-200"
						title="Logout"
					>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
				</button>
			</div>
		</div>
	</div>
	{/if}
</div> 