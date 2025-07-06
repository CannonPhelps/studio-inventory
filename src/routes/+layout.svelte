<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data } = $props<{ children: any; data: LayoutData }>();
	
	const user = $derived(data.user);
	const currentPath = $derived($page.url.pathname);
	const isLoginPage = currentPath === '/login';
	const isOnboardingPage = currentPath === '/onboarding';
	let sidebarOpen = true;

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout error:', error);
		}
	}

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
</script>

{#if isLoginPage || isOnboardingPage}
	<!-- Login or onboarding page - render children directly without sidebar -->
	{@render children()}
{:else}
	<!-- Main app layout with sidebar -->
	<div class="min-h-screen bg-gray-50">
		<!-- Sidebar -->
		<div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0">


		<!-- Navigation -->
		<nav class="flex-1 px-4 py-6 space-y-2">
			{#each navigationWithCurrent as item}
				<a
					href={item.href}
					class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 {item.current ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}"
				>
					<span class="mr-3 text-lg">{item.icon}</span>
					{item.name}
					{#if item.current}
						<div class="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- User Section -->
		{#if user}
			<div class="border-t border-gray-200 p-4">
				<div class="flex items-center">
					<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
						<span class="text-sm font-medium text-blue-700">{user.name.charAt(0)}</span>
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
	<div class="md:ml-64 min-h-screen">


		<!-- Page content -->
		<main class="p-6">
			{@render children()}
		</main>
	</div>
</div>
{/if}
