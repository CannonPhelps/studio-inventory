<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AdminSidebar from '$lib/components/AdminSidebar.svelte';
	import { theme } from '$lib/stores/theme';
	import '../../app.css';

	let sidebarOpen = false;
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
	$: navigationWithCurrent = navigation.map((item) => ({
		...item,
		current: currentPath === item.href
	}));

	$: _theme = $theme;
</script>

<svelte:head>
	<title>Admin - Studio Inventory</title>
</svelte:head>

<div class="flex min-h-screen">
	<!-- Sidebar -->
	<AdminSidebar {user} {currentPath} {sidebarOpen} onCloseSidebar={() => (sidebarOpen = false)} />

	<!-- Mobile overlay -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-gray-600/75 md:hidden"
			onclick={() => (sidebarOpen = false)}
		></div>
	{/if}

	<!-- Main content -->
	<div class="min-h-screen w-full bg-primary">
		<!-- Page content -->
		<main class="px-12 pt-12">
			<slot />
		</main>
	</div>
</div>
