<script lang="ts">
	import { page } from '$app/stores';
	import type { User } from '$lib/types';
	import Sidebar from './Sidebar.svelte';
	import AdminSidebar from './AdminSidebar.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	interface Props {
		user: User | null;
		children: any;
	}

	let { user, children } = $props();
	
	const currentPath = $derived($page.url.pathname);
	const isAdminRoute = $derived(currentPath.startsWith('/admin'));
	let sidebarOpen = $state(false);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<!-- Main app layout with sidebar -->
<div class="min-h-screen bg-primary">
	<!-- Mobile header -->
	<div class="lg:hidden bg-card shadow-custom border-b border-card px-4 py-3 fixed top-0 left-0 right-0 z-50">
		<div class="flex items-center justify-between">
			<button
				onclick={toggleSidebar}
				class="p-2 rounded-lg text-secondary hover:text-primary hover:bg-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card transition-all duration-200"
				aria-label="Toggle sidebar"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			<div class="flex items-center space-x-3">
				<div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-custom">
					<span class="text-sm font-semibold text-white">{user?.name?.charAt(0) || 'U'}</span>
				</div>
				<span class="text-sm font-medium text-primary">{user?.name || 'User'}</span>
				<ThemeToggle />
			</div>
		</div>
	</div>

	<!-- Desktop layout with sticky sidebar -->
	<div class="lg:flex">
		<!-- Sidebar Component -->
		{#if isAdminRoute}
			<AdminSidebar {user} {currentPath} {sidebarOpen} onCloseSidebar={closeSidebar} />
		{:else}
			<Sidebar {user} {currentPath} {sidebarOpen} onCloseSidebar={closeSidebar} />
		{/if}

		<!-- Main content -->
		<div class="flex-1 min-h-screen pt-16 lg:pt-0 bg-primary">
			<!-- Page content -->
			<main class="p-4 md:p-6 lg:p-8">
				{@render children()}
			</main>
		</div>
	</div>

	<!-- Mobile overlay -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
			onclick={closeSidebar}
		></div>
	{/if}
</div> 