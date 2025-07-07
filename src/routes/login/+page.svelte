<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface User {
		id: string;
		email: string;
		role: string;
	}

	interface LoginResponse {
		user: User;
		error?: string;
	}

	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	let showPassword = false;

	onMount(() => {
		// Check if user is already logged in
		checkAuth();
	});

	async function checkAuth() {
		try {
			const response = await fetch('/api/auth/me');
			const data = await response.json();
			
			if (data.user) {
				// Redirect based on role
				if (data.user.role === 'admin') {
					goto('/admin');
				} else {
					goto('/');
				}
			}
		} catch (error) {
			console.error('Auth check error:', error);
		}
	}

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please enter both email and password';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data: LoginResponse = await response.json();

			if (response.ok) {
				// Redirect based on role
				if (data.user.role === 'admin') {
					window.location.href = '/admin';
				} else {
					window.location.href = '/';
				}
			} else {
				error = data.error || 'Login failed';
			}
		} catch (error) {
			console.error('Login error:', error);
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>Login - Studio Inventory</title>
</svelte:head>

<div class="min-h-screen bg-primary flex items-center justify-center py-8 px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<div class="mx-auto h-12 w-12 bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 rounded-full flex items-center justify-center shadow-lg">
				<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
				</svg>
			</div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-primary">
				Sign in to Studio Inventory
			</h2>
			<p class="mt-2 text-center text-base text-primary">
				Manage your equipment and track everything in one place
			</p>
		</div>

		<div class="bg-card rounded-xl shadow-lg border border-border p-8">
			<form class="space-y-6" on:submit|preventDefault={handleLogin}>
				<div class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-medium text-primary mb-1">
							Email Address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							bind:value={email}
							on:keypress={handleKeyPress}
							class="appearance-none relative block w-full px-3 py-3 border border-border placeholder:text-muted-foreground text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-base transition-all duration-200 bg-background"
							placeholder="Enter your email"
						/>
					</div>
					<div>
						<label for="password" class="block text-sm font-medium text-primary mb-1">
							Password
						</label>
						<div class="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								autocomplete="current-password"
								required
								bind:value={password}
								on:keypress={handleKeyPress}
								class="appearance-none relative block w-full px-3 py-3 pr-10 border border-border placeholder:text-muted-foreground text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-base transition-all duration-200 bg-background"
								placeholder="Enter your password"
							/>
							<button
								type="button"
								on:click={() => showPassword = !showPassword}
								class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors duration-200 touch-manipulation"
							>
								{#if showPassword}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
									</svg>
								{:else}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								{/if}
							</button>
						</div>
					</div>
				</div>

				{#if error}
					<div class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm text-red-800 dark:text-red-200">{error}</p>
							</div>
						</div>
					</div>
				{/if}

				<div>
					<button
						type="submit"
						disabled={loading}
						class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
					>
						{#if loading}
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Signing in...
						{:else}
							<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
							</svg>
							Sign in
						{/if}
					</button>
				</div>

				<div class="text-center space-y-2">
					<p class="text-sm text-primary">
						Contact your administrator to get access
					</p>
					<div class="flex items-center justify-center space-x-2 text-xs text-primary">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<span>Secure login with session management</span>
					</div>
				</div>
			</form>
		</div>
	</div>
</div> 