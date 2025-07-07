<script lang="ts">
	import type { User } from '$lib/types';
	import ThemeToggle from './ThemeToggle.svelte';
	import { writable, derived } from 'svelte/store';
	import '../../app.css';

	interface Props {
		user: User | null;
		currentPath: string;
		sidebarOpen?: boolean;
	}

	let { user, currentPath, sidebarOpen = false } = $props();

	const currentPathStore = writable(currentPath);
	$effect(() => {
		currentPathStore.set(currentPath);
	});

	const adminNavigation = [
		{ name: 'Dashboard', href: '/admin', icon: '📊', current: true },
		{ name: 'Assets', href: '/admin/assets', icon: '📦', current: false },
		{ name: 'Categories', href: '/admin/categories', icon: '🏷️', current: false },
		{ name: 'Bulk Cables', href: '/admin/bulk-cables', icon: '📏', current: false },
		{ name: 'Users', href: '/admin/users', icon: '👥', current: false },
		{ name: 'Checkouts', href: '/admin/checkouts', icon: '📤', current: false },
		{ name: 'Returns', href: '/admin/returns', icon: '📥', current: false },
		{ name: 'Movements', href: '/admin/movements', icon: '🔄', current: false },
		{ name: 'Maintenance', href: '/admin/maintenance', icon: '🔧', current: false },
		{ name: 'Import', href: '/admin/import', icon: '📥', current: false },
		{ name: 'Settings', href: '/admin/settings', icon: '⚙️', current: false }
	];

	const navigationWithCurrent = derived(currentPathStore, $currentPath =>
		adminNavigation.map((item) => ({
			...item,
			current: $currentPath === item.href
		}))
	);

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout error:', error);
		}
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
</script>

<!-- Mobile overlay -->
{#if sidebarOpen}
	<div 
		class="fixed inset-0 bg-black/50 z-40 lg:hidden"
	></div>
{/if}

<!-- Admin Sidebar: always visible, fixed on the left -->
<div class="h-screen fixed top-0 left-0 z-50 w-64 bg-sidebar shadow-custom-lg border-r border-sidebar flex flex-col transform transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}">
	<!-- Header -->
	<div class="border-sidebar border-b p-6">
		<div class="flex items-center">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-error to-accent-error/80 shadow-custom">
				<svg
					class="h-6 w-6 text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			</div>
			<div class="ml-3">
				<h1 class="text-primary text-lg font-bold">Admin Panel</h1>
				<p class="text-secondary text-sm">System Management</p>
			</div>
			<div class="flex items-center space-x-2">
				<ThemeToggle />
				<!-- Close button for mobile -->
				<button
					class="lg:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-tertiary transition-all duration-200 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-sidebar focus:outline-none"
					onclick={toggleSidebar}
					title="Close menu"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 space-y-2 overflow-y-auto px-4 py-6">
		{#each $navigationWithCurrent as item}
			<a
				href={item.href}
				class="group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 min-h-[44px] {item.current
					? 'bg-gradient-to-r from-accent-error to-accent-error/80 text-white shadow-custom'
					: 'text-secondary hover:bg-tertiary hover:text-primary'}"
			>
				<span class="mr-3 text-lg flex-shrink-0">{item.icon}</span>
				<span class="flex-1">{item.name}</span>
				{#if item.current}
					<div class="ml-auto h-2 w-2 rounded-full bg-white shadow-custom flex-shrink-0"></div>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- User Section -->
	{#if user}
		<div class="border-sidebar border-t p-4 bg-sidebar mt-auto">
			<div class="flex items-center">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-error to-accent-error/80 shadow-custom flex-shrink-0"
				>
					<span class="text-sm font-semibold text-white"
						>{user.name.charAt(0)}</span
					>
				</div>
				<div class="ml-3 min-w-0 flex-1">
					<p class="text-primary truncate text-sm font-semibold">{user.name}</p>
					<p class="text-secondary truncate text-xs capitalize">{user.role}</p>
				</div>
				<div class="flex space-x-1 flex-shrink-0">
					<button
						onclick={handleLogout}
						class="text-secondary hover:text-primary hover:bg-tertiary rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:ring-accent-error focus:ring-offset-2 focus:ring-offset-sidebar focus:outline-none"
						title="Logout"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
