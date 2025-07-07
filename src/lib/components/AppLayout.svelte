<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { User } from '$lib/types';
	import Sidebar from './Sidebar.svelte';
	import AdminSidebar from './AdminSidebar.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	interface Props {
		user: User | null;
		children: any;
	}

	let { user, children } = $props();
	let sidebarOpen = false;

	const currentPath = $derived($page.url.pathname);
	const isAdminRoute = $derived(currentPath.startsWith('/admin'));

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout error:', error);
		}
	}

	function goToSettings() {
		window.location.href = '/settings';
	}

	function goToAdmin() {
		window.location.href = '/admin';
	}

	function goToMainApp() {
		window.location.href = '/';
	}

	onMount(() => {
		// Close dropdown when clicking outside
		document.addEventListener('click', function (event) {
			const userMenu = document.getElementById('userMenu');
			const userButton = event.target.closest('button');

			if (userMenu && !userButton?.closest('.relative')) {
				userMenu.classList.add('hidden');
			}
		});
	});
</script>

<!-- Main app layout with sidebar -->
<div class="bg-primary min-h-screen">
	<!-- Top Bar (Mobile Only) -->
	<div class="bg-card border-card shadow-custom fixed top-0 right-0 left-0 z-40 border-b lg:hidden">
		<div class="flex items-center justify-between px-4 py-3">
			<!-- Left side: Sidebar toggle and breadcrumb -->
			<div class="flex items-center space-x-4">
				<!-- Sidebar toggle (mobile only) -->
				<button
					onclick={toggleSidebar}
					class="text-secondary hover:text-primary hover:bg-tertiary rounded-lg p-2 transition-colors"
					title="Toggle sidebar"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<!-- Breadcrumb -->
				<div class="flex items-center space-x-2 text-sm">
					<span class="text-secondary">Studio Inventory</span>
					{#if isAdminRoute}
						<svg
							class="text-tertiary h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
						<span class="text-primary font-medium">Admin</span>
					{/if}
				</div>
			</div>

			<!-- Right side: User menu and actions -->
			<div class="flex items-center space-x-3">
				<!-- User menu -->
				{#if user}
					<div class="relative">
						<button
							onclick={() => document.getElementById('userMenu')?.classList.toggle('hidden')}
							class="text-secondary hover:text-primary hover:bg-tertiary flex items-center space-x-2 rounded-lg p-2 transition-colors"
							title="User menu"
						>
							<div
								class="from-primary-500 to-primary-600 shadow-custom flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br"
							>
								<span class="text-sm font-semibold text-white">{user.name.charAt(0)}</span>
							</div>
							<div class="text-left">
								<p class="text-primary text-sm font-medium">{user.name}</p>
								<p class="text-secondary text-xs capitalize">{user.role}</p>
							</div>
							<svg
								class="text-secondary h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>

						<!-- User dropdown menu -->
						<div
							id="userMenu"
							class="bg-card border-card shadow-custom-lg absolute right-0 z-50 mt-2 hidden w-48 rounded-lg border"
						>
							<div class="py-1">
								<button
									onclick={goToSettings}
									class="text-secondary hover:text-primary hover:bg-tertiary flex w-full items-center space-x-2 px-4 py-2 text-left text-sm transition-colors"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									<span>Settings</span>
								</button>

								{#if user.role === 'admin' && !isAdminRoute}
									<button
										onclick={goToAdmin}
										class="text-secondary hover:text-primary hover:bg-tertiary flex w-full items-center space-x-2 px-4 py-2 text-left text-sm transition-colors"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
											/>
										</svg>
										<span>Admin Panel</span>
									</button>
								{/if}

								<div class="border-card my-1 border-t"></div>

								<button
									onclick={handleLogout}
									class="text-error flex w-full items-center space-x-2 px-4 py-2 text-left text-sm transition-colors hover:bg-red-50 hover:text-red-700"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
										/>
									</svg>
									<span>Logout</span>
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Desktop layout with sticky sidebar -->
	<div class="flex">
		<!-- Sidebar Component -->
		{#if isAdminRoute}
			<AdminSidebar {user} {currentPath} {sidebarOpen} />
		{:else}
			<Sidebar {user} {currentPath} {sidebarOpen} />
		{/if}

		<!-- Main content -->
		<div class="bg-primary min-h-screen flex-1 lg:ml-64">
			<!-- Page content with top bar offset -->
			<main class="mx-auto w-full max-w-7xl px-2 pt-20 sm:px-6 lg:px-12 lg:pt-6">
				{@render children()}
			</main>
		</div>
	</div>
</div>
