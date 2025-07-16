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
</script>

<svelte:head>
	<title>Admin - Studio Inventory</title>
</svelte:head>

<div class="flex min-h-screen pt-16 lg:pt-0">
	<!-- Mobile Top Bar -->
	<div class="fixed top-0 left-0 right-0 z-40 bg-card border-b border-card shadow-custom lg:hidden">
		<div class="flex items-center justify-between px-4 py-3">
			<div class="flex items-center space-x-4">
				<!-- Sidebar toggle -->
				<Button variant="ghost" size="sm" on:click={toggleSidebar} title="Toggle sidebar" className="p-2">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</Button>
				<h1 class="text-primary font-semibold">Admin Panel</h1>
			</div>
			<div class="flex items-center space-x-3">
				{#if user}
					<div class="relative">
						<Button variant="ghost" size="sm" on:click={toggleUserMenu} className="flex items-center space-x-2 p-2" title="User menu">
							<div class="w-8 h-8 bg-gradient-to-br from-accent-error to-accent-error/80 rounded-full flex items-center justify-center shadow-custom">
								<span class="text-sm font-semibold text-white">{user.name.charAt(0)}</span>
							</div>
							<svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</Button>
						<div id="adminUserMenu" class="hidden absolute right-0 mt-2 w-40 bg-card border border-card rounded-lg shadow-custom z-50">
							<Button variant="ghost" size="sm" className="w-full text-left px-4 py-2 text-sm" on:click={() => goto('/settings')}>Settings</Button>
							<div class="border-t border-card my-1"></div>
							<Button variant="danger" size="sm" className="w-full text-left px-4 py-2 text-sm" on:click={handleLogout}>Logout</Button>
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
