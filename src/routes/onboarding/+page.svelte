<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let name = '';
	let department = '';
	let phone = '';
	let isLoading = false;
	let error = '';
	let success = '';

	async function handleSubmit() {
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/onboarding', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					name,
					department,
					phone
				})
			});

			const data = await response.json();

			if (response.ok) {
				success = 'Admin account created successfully! Redirecting to login...';
				setTimeout(() => {
					goto('/login');
				}, 2000);
			} else {
				error = data.error || 'Failed to create admin account';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Studio Inventory - First Time Setup</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
>
	<div class="w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl">
		<div class="mb-8 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
				<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
					></path>
				</svg>
			</div>
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Welcome to Studio Inventory</h1>
			<p class="text-gray-600">Let's set up your first admin account</p>
		</div>

		{#if error}
			<div class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
				{success}
			</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <div class="flex gap-4">

			<div class="w-full space-y-4">
				<div>
					<label for="name" class="mb-2 block text-sm font-medium text-gray-700">
						Full Name *
					</label>
					<input
						type="text"
						id="name"
						bind:value={name}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						placeholder="Enter your full name"
					/>
				</div>

				<div>
					<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
						Email Address *
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						placeholder="Enter your email address"
					/>
				</div>

				<div>
					<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
						Password *
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						minlength="8"
						class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						placeholder="Create a strong password"
					/>
					<p class="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
				</div>
			</div>

			<div class="w-full space-y-4">
				<div>
					<label for="confirmPassword" class="mb-2 block text-sm font-medium text-gray-700">
						Confirm Password *
					</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={confirmPassword}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						placeholder="Confirm your password"
					/>
				</div>

				<div>
					<label for="department" class="mb-2 block text-sm font-medium text-gray-700">
						Department
					</label>
					<input
						type="text"
						id="department"
						bind:value={department}
						class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						placeholder="e.g., IT, Operations, Studio"
					/>
				</div>

				<div>
					<label for="phone" class="mb-2 block text-sm font-medium text-gray-700">
						Phone Number
					</label>
					<input
						type="tel"
						id="phone"
						bind:value={phone}
						class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						placeholder="Enter your phone number"
					/>
				</div>
			</div>
            </div>

			<button
				type="submit"
				disabled={isLoading}
				class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
			</button>
		</form>

		<div class="mt-8 text-center">
			<p class="text-sm text-gray-500">
				This will create the first admin account for your Studio Inventory system.
			</p>
		</div>
	</div>
</div>
