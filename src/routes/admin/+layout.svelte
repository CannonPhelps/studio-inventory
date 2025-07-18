<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AdminSidebar from '$lib/components/AdminSidebar.svelte';
	import { theme } from '$lib/stores/theme';
	import '../../app.css';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let user: any = null;
	let sidebarOpen: boolean = false;

	onMount(() => {
		// fetch user data asynchronously without making onMount async
		(async () => {
			try {
				const response = await fetch('/api/auth/me');
				const data = await response.json();
				user = data.user;
			} catch (error) {
				console.error('Error loading user:', error);
			}
		})();

		// Close sidebar on navigation (mobile experience)
		const unsubscribe = page.subscribe(() => {
			sidebarOpen = false;
		});

		return () => unsubscribe();
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
		{ name: 'Damage Management', href: '/admin/damage-management', icon: '⚠️', current: false },
		{ name: 'Maintenance', href: '/admin/maintenance', icon: '🔧', current: false },
		{ name: 'Movements', href: '/admin/movements', icon: '🔄', current: false },
		{ name: 'Settings', href: '/admin/settings', icon: '⚙️', current: false }
	];

	$: currentPath = $page.url.pathname;
	$: navigationWithCurrent = navigation.map((item) => ({
		...item,
		current: currentPath === item.href
	}));

	$: _theme = $theme;

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	// user menu helper
	function toggleUserMenu() {
		const el = document.getElementById('adminUserMenu');
		el?.classList.toggle('hidden');
	}

	// Close user menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const menu = document.getElementById('adminUserMenu');
		const button = document.getElementById('adminUserMenuButton');
		if (menu && !menu.contains(event.target as Node) && !button?.contains(event.target as Node)) {
			menu.classList.add('hidden');
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<svelte:head>
	<title>Admin - Studio Inventory</title>
</svelte:head>

<div class="flex min-h-screen pt-16 lg:pt-0">
	<!-- Enhanced Mobile Top Bar -->
	<div class="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-accent-error to-red-500 border-b border-accent-error/20 shadow-custom-lg lg:hidden">
		<div class="flex items-center justify-between px-4 py-3">
			<div class="flex items-center space-x-4">
				<!-- Sidebar toggle with gradient background -->
				<Button 
					variant="ghost" 
					size="sm" 
					on:click={toggleSidebar} 
					title="Toggle sidebar" 
					className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
				>
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</Button>
				
				<!-- Logo and title with gradient text -->
				<div class="flex items-center space-x-3">
					<div class="w-8 h-8 bg-gradient-to-br from-white to-white/80 rounded-lg flex items-center justify-center shadow-custom">
						<svg class="w-5 h-5 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<h1 class="text-white font-bold text-lg">Admin Panel</h1>
				</div>
			</div>
			
			<div class="flex items-center space-x-3">
				<!-- Theme toggle -->
				<button
					onclick={() => $theme === 'dark' ? theme.set('light') : theme.set('dark')}
					class="p-2 rounded-lg text-white hover:text-white/80 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
					title="Toggle theme"
					aria-label="Toggle theme"
				>
					{#if $theme === 'dark'}
						<!-- Sun icon for dark mode -->
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					{:else}
						<!-- Moon icon for light mode -->
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
						</svg>
					{/if}
				</button>
				
				{#if user}
					<div class="relative">
						<Button 
							variant="ghost" 
							size="sm" 
							id="adminUserMenuButton"
							on:click={toggleUserMenu} 
							className="flex items-center space-x-2 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20" 
							title="User menu"
						>
							<div class="w-8 h-8 bg-gradient-to-br from-white to-white/80 rounded-full flex items-center justify-center shadow-custom">
								<span class="text-sm font-semibold text-accent-error">{user.name.charAt(0)}</span>
							</div>
							<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</Button>
						<div id="adminUserMenu" class="hidden absolute right-0 mt-2 w-48 bg-card border border-card rounded-xl shadow-custom-lg z-50 backdrop-blur-sm">
							<div class="p-3 border-b border-card">
								<div class="flex items-center space-x-3">
									<div class="w-10 h-10 bg-gradient-to-br from-accent-error to-red-500 rounded-full flex items-center justify-center">
										<span class="text-sm font-semibold text-white">{user.name.charAt(0)}</span>
									</div>
									<div>
										<p class="text-sm font-medium text-primary">{user.name}</p>
										<p class="text-xs text-secondary capitalize">{user.role}</p>
									</div>
								</div>
							</div>
							<div class="p-2">
								<Button variant="ghost" size="sm" className="w-full text-left px-3 py-2 text-sm hover:bg-tertiary" on:click={() => goto('/settings')}>
									<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									Settings
								</Button>
								<div class="border-t border-card my-1"></div>
								<Button variant="danger" size="sm" className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20" on:click={handleLogout}>
									<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
									Logout
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Sidebar -->
	<AdminSidebar {user} {currentPath} {sidebarOpen} />

	<!-- Main content -->
	<div class="min-h-screen w-full bg-primary lg:ml-64">
		<!-- Page content -->
		<main class="px-12 pt-12">
			<slot />
		</main>
	</div>
</div>
