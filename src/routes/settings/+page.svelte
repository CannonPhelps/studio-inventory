<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import AppLayout from '$lib/components/AppLayout.svelte';

	let { data } = $props<{ data: PageData }>();

	let user = $state<any>(null);
	let loading = $state(true);
	let message = $state('');
	let messageType = $state('');

	// Password change form
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showPasswordForm = $state(false);

	// Profile form
	let profileForm = $state({
		name: '',
		email: '',
		department: '',
		phone: ''
	});

	onMount(async () => {
		await loadUserData();
	});

	async function loadUserData() {
		try {
			const response = await fetch('/api/auth/me');
			const data = await response.json();
			
			if (data.user) {
				user = data.user;
				profileForm = {
					name: user.name || '',
					email: user.email || '',
					department: user.department || '',
					phone: user.phone || ''
				};
			}
		} catch (error) {
			console.error('Error loading user data:', error);
		} finally {
			loading = false;
		}
	}

	async function handlePasswordChange() {
		if (!currentPassword || !newPassword || !confirmPassword) {
			showMessage('Please fill in all password fields', 'error');
			return;
		}

		if (newPassword !== confirmPassword) {
			showMessage('New passwords do not match', 'error');
			return;
		}

		if (newPassword.length < 8) {
			showMessage('New password must be at least 8 characters long', 'error');
			return;
		}

		try {
			const response = await fetch('/api/auth/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					currentPassword,
					newPassword
				})
			});

			const data = await response.json();

			if (response.ok) {
				showMessage('Password changed successfully! You will be redirected to login.', 'success');
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
				showPasswordForm = false;
				
				// Redirect to login after a short delay
				setTimeout(() => {
					window.location.href = '/login';
				}, 2000);
			} else {
				showMessage(data.error || 'Failed to change password', 'error');
			}
		} catch (error) {
			console.error('Error changing password:', error);
			showMessage('An error occurred. Please try again.', 'error');
		}
	}

	async function handleProfileUpdate() {
		try {
			const response = await fetch('/api/auth/update-profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(profileForm)
			});

			const data = await response.json();

			if (response.ok) {
				showMessage('Profile updated successfully!', 'success');
				user = { ...user, ...profileForm };
			} else {
				showMessage(data.error || 'Failed to update profile', 'error');
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			showMessage('An error occurred. Please try again.', 'error');
		}
	}

	function showMessage(text: string, type: 'success' | 'error') {
		message = text;
		messageType = type;
		setTimeout(() => {
			message = '';
			messageType = '';
		}, 5000);
	}

	function handleProfileSubmit(event: Event) {
		event.preventDefault();
		handleProfileUpdate();
	}

	function handlePasswordSubmit(event: Event) {
		event.preventDefault();
		handlePasswordChange();
	}

	function showPasswordFormHandler() {
		showPasswordForm = true;
	}

	function cancelPasswordForm() {
		showPasswordForm = false;
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
	}
</script>

<svelte:head>
	<title>Settings - Studio Inventory</title>
</svelte:head>

<AppLayout user={data.user}>
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<h1 class="text-3xl font-bold text-primary">Settings</h1>
			<p class="mt-2 text-secondary text-base">Manage your account settings and preferences</p>
		</div>

		{#if message}
			<div class="p-4 rounded-lg {messageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'}">
				{message}
			</div>
		{/if}

		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
			</div>
		{:else if user}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Profile Settings -->
				<div class="bg-card rounded-xl shadow-custom border border-card p-6">
					<h2 class="text-xl font-semibold text-primary mb-4">Profile Information</h2>
					<form onsubmit={handleProfileSubmit} class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-medium text-primary mb-1">
								Full Name
							</label>
							<input
								id="name"
								type="text"
								bind:value={profileForm.name}
								class="w-full px-3 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-input text-input placeholder-secondary text-base"
								placeholder="Enter your full name"
							/>
						</div>

						<div>
							<label for="email" class="block text-sm font-medium text-primary mb-1">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								bind:value={profileForm.email}
								class="w-full px-3 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-input text-input placeholder-secondary text-base"
								placeholder="Enter your email"
							/>
						</div>

						<div>
							<label for="department" class="block text-sm font-medium text-primary mb-1">
								Department
							</label>
							<input
								id="department"
								type="text"
								bind:value={profileForm.department}
								class="w-full px-3 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-input text-input placeholder-secondary text-base"
								placeholder="Enter your department"
							/>
						</div>

						<div>
							<label for="phone" class="block text-sm font-medium text-primary mb-1">
								Phone Number
							</label>
							<input
								id="phone"
								type="tel"
								bind:value={profileForm.phone}
								class="w-full px-3 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-input text-input placeholder-secondary text-base"
								placeholder="Enter your phone number"
							/>
						</div>

						<button
							type="submit"
							class="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-secondary transition-colors duration-200 shadow-custom-sm touch-manipulation"
						>
							Update Profile
						</button>
					</form>
				</div>

				<!-- Password Settings -->
				<div class="bg-card rounded-xl shadow-custom border border-card p-6">
					<h2 class="text-xl font-semibold text-primary mb-4">Change Password</h2>
					
					{#if !showPasswordForm}
						<div class="text-center py-6">
							<div class="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
								<svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
								</svg>
							</div>
							<p class="text-secondary text-base mb-4">Keep your account secure by updating your password regularly</p>
							<button
								onclick={showPasswordFormHandler}
								class="bg-accent text-white py-2 px-4 rounded-lg font-medium hover:bg-accent-secondary transition-colors duration-200 shadow-custom-sm touch-manipulation"
							>
								Change Password
							</button>
						</div>
					{:else}
						<form onsubmit={handlePasswordSubmit} class="space-y-4">
							<div>
								<label for="currentPassword" class="block text-sm font-medium text-primary mb-1">
									Current Password
								</label>
								<input
									id="currentPassword"
									type="password"
									bind:value={currentPassword}
									class="w-full px-3 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-input text-input placeholder-secondary text-base"
									placeholder="Enter current password"
								/>
							</div>

							<div>
								<label for="newPassword" class="block text-sm font-medium text-primary mb-1">
									New Password
								</label>
								<input
									id="newPassword"
									type="password"
									bind:value={newPassword}
									class="w-full px-3 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-input text-input placeholder-secondary text-base"
									placeholder="Enter new password"
								/>
							</div>

							<div>
								<label for="confirmPassword" class="block text-sm font-medium text-primary mb-1">
									Confirm New Password
								</label>
								<input
									id="confirmPassword"
									type="password"
									bind:value={confirmPassword}
									class="w-full px-3 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-input text-input placeholder-secondary text-base"
									placeholder="Confirm new password"
								/>
							</div>

							<div class="flex space-x-3">
								<button
									type="submit"
									class="flex-1 bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-secondary transition-colors duration-200 shadow-custom-sm touch-manipulation"
								>
									Update Password
								</button>
								<button
									type="button"
									onclick={cancelPasswordForm}
									class="flex-1 bg-secondary text-primary py-3 px-4 rounded-lg font-medium hover:bg-tertiary transition-colors duration-200 border border-card touch-manipulation"
								>
									Cancel
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>

			<!-- Account Information -->
			<div class="bg-card rounded-xl shadow-custom border border-card p-6">
				<h2 class="text-xl font-semibold text-primary mb-4">Account Information</h2>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-secondary mb-1">User ID</label>
						<p class="text-primary font-mono text-sm">{user.id}</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-secondary mb-1">Role</label>
						<p class="text-primary capitalize text-sm">{user.role}</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-secondary mb-1">Member Since</label>
						<p class="text-primary text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-secondary mb-1">Last Updated</label>
						<p class="text-primary text-sm">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="text-center py-12">
				<div class="text-gray-400 text-6xl mb-4">🔒</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
				<p class="text-gray-500">You need to be logged in to access settings.</p>
			</div>
		{/if}
	</div>
</AppLayout> 