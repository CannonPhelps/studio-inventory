<script lang="ts">
	import { onMount } from 'svelte';

	interface User {
		id: string;
		name: string;
		email: string;
		department?: string;
		phone?: string;
		role: string;
		createdAt: string;
		updatedAt: string;
	}

	interface ProfileForm {
		name: string;
		email: string;
		department: string;
		phone: string;
	}

	interface AdminSettings {
		systemName: string;
		defaultCheckoutDuration: number;
		enableEmailNotifications: boolean;
		requireApprovalForCheckouts: boolean;
		maxCheckoutsPerUser: number;
	}

	let user: User | null = null;
	let loading = true;
	let message = '';
	let messageType = '';

	// Password change form
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let showPasswordForm = false;

	// Profile form
	let profileForm: ProfileForm = {
		name: '',
		email: '',
		department: '',
		phone: ''
	};

	// Admin-specific settings
	let adminSettings: AdminSettings = {
		systemName: 'Studio Inventory',
		defaultCheckoutDuration: 7, // days
		enableEmailNotifications: false,
		requireApprovalForCheckouts: false,
		maxCheckoutsPerUser: 5
	};

	onMount(async () => {
		await loadUserData();
		await loadAdminSettings();
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

	async function loadAdminSettings() {
		try {
			const response = await fetch('/api/admin/settings');
			if (response.ok) {
				const data = await response.json();
				adminSettings = { ...adminSettings, ...data };
			}
		} catch (error) {
			console.error('Error loading admin settings:', error);
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

	async function handleAdminSettingsUpdate() {
		try {
			const response = await fetch('/api/admin/settings', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(adminSettings)
			});

			const data = await response.json();

			if (response.ok) {
				showMessage('Admin settings updated successfully!', 'success');
			} else {
				showMessage(data.error || 'Failed to update admin settings', 'error');
			}
		} catch (error) {
			console.error('Error updating admin settings:', error);
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
</script>

<svelte:head>
	<title>Admin Settings - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-primary">Admin Settings</h1>
		<p class="mt-2 text-muted-foreground">Manage system settings and your account preferences</p>
	</div>

	{#if message}
		<div class="p-4 rounded-lg {messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}">
			{message}
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
		</div>
	{:else if user}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- System Settings -->
			<div class="bg-card rounded-xl shadow-sm border border-border p-6">
				<h2 class="text-xl font-semibold text-primary mb-4">System Settings</h2>
				<form on:submit|preventDefault={handleAdminSettingsUpdate} class="space-y-4">
					<div>
						<label for="systemName" class="block text-sm font-medium text-primary mb-1">
							System Name
						</label>
						<input
							id="systemName"
							type="text"
							bind:value={adminSettings.systemName}
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary placeholder:text-muted-foreground"
							placeholder="Enter system name"
						/>
					</div>

					<div>
						<label for="defaultCheckoutDuration" class="block text-sm font-medium text-primary mb-1">
							Default Checkout Duration (days)
						</label>
						<input
							id="defaultCheckoutDuration"
							type="number"
							min="1"
							max="30"
							bind:value={adminSettings.defaultCheckoutDuration}
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary"
						/>
					</div>

					<div>
						<label for="maxCheckoutsPerUser" class="block text-sm font-medium text-primary mb-1">
							Max Checkouts Per User
						</label>
						<input
							id="maxCheckoutsPerUser"
							type="number"
							min="1"
							max="20"
							bind:value={adminSettings.maxCheckoutsPerUser}
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary"
						/>
					</div>

					<div class="flex items-center space-x-3">
						<input
							id="enableEmailNotifications"
							type="checkbox"
							bind:checked={adminSettings.enableEmailNotifications}
							class="h-4 w-4 text-red-600 focus:ring-red-500 border-border rounded bg-background"
						/>
						<label for="enableEmailNotifications" class="text-sm font-medium text-primary">
							Enable Email Notifications
						</label>
					</div>

					<div class="flex items-center space-x-3">
						<input
							id="requireApprovalForCheckouts"
							type="checkbox"
							bind:checked={adminSettings.requireApprovalForCheckouts}
							class="h-4 w-4 text-red-600 focus:ring-red-500 border-border rounded bg-background"
						/>
						<label for="requireApprovalForCheckouts" class="text-sm font-medium text-primary">
							Require Approval for Checkouts
						</label>
					</div>

					<div class="pt-4">
						<button
							type="submit"
							class="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
						>
							Update System Settings
						</button>
					</div>
				</form>
			</div>

			<!-- Profile Settings -->
			<div class="bg-card rounded-xl shadow-sm border border-border p-6">
				<h2 class="text-xl font-semibold text-primary mb-4">Profile Information</h2>
				<form on:submit|preventDefault={handleProfileUpdate} class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-primary mb-1">
							Full Name
						</label>
						<input
							id="name"
							type="text"
							bind:value={profileForm.name}
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary placeholder:text-muted-foreground"
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
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary placeholder:text-muted-foreground"
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
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary placeholder:text-muted-foreground"
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
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary placeholder:text-muted-foreground"
							placeholder="Enter your phone number"
						/>
					</div>

					<div class="pt-4">
						<button
							type="submit"
							class="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
						>
							Update Profile
						</button>
					</div>
				</form>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Password Settings -->
			<div class="bg-card rounded-xl shadow-sm border border-border p-6">
				<h2 class="text-xl font-semibold text-primary mb-4">Change Password</h2>
				
				{#if !showPasswordForm}
					<div class="text-center py-8">
						<div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
							</svg>
						</div>
						<p class="text-muted-foreground mb-4">Keep your account secure by using a strong password</p>
						<button
							on:click={() => showPasswordForm = true}
							class="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
						>
							Change Password
						</button>
					</div>
				{:else}
					<form on:submit|preventDefault={handlePasswordChange} class="space-y-4">
						<div>
							<label for="currentPassword" class="block text-sm font-medium text-primary mb-1">
								Current Password
							</label>
							<input
								id="currentPassword"
								type="password"
								bind:value={currentPassword}
								required
								class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary placeholder:text-muted-foreground"
								placeholder="Enter your current password"
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
								required
								class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary placeholder:text-muted-foreground"
								placeholder="Enter your new password"
							/>
							<p class="mt-1 text-xs text-muted-foreground">Password must be at least 8 characters long</p>
						</div>

						<div>
							<label for="confirmPassword" class="block text-sm font-medium text-primary mb-1">
								Confirm New Password
							</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								required
								class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background text-primary placeholder:text-muted-foreground"
								placeholder="Confirm your new password"
							/>
						</div>

						<div class="flex space-x-3 pt-4">
							<button
								type="submit"
								class="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
							>
								Update Password
							</button>
							<button
								type="button"
								on:click={() => {
									showPasswordForm = false;
									currentPassword = '';
									newPassword = '';
									confirmPassword = '';
								}}
								class="flex-1 bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg transition-colors"
							>
								Cancel
							</button>
						</div>
					</form>
				{/if}
			</div>

			<!-- Account Information -->
			<div class="bg-card rounded-xl shadow-sm border border-border p-6">
				<h2 class="text-xl font-semibold text-primary mb-4">Account Information</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="block text-sm font-medium text-muted-foreground">User ID</p>
						<p class="text-sm text-primary font-mono">{user.id}</p>
					</div>
					<div>
						<p class="block text-sm font-medium text-muted-foreground">Role</p>
						<p class="text-sm text-primary capitalize">{user.role}</p>
					</div>
					<div>
						<p class="block text-sm font-medium text-muted-foreground">Member Since</p>
						<p class="text-sm text-primary">{new Date(user.createdAt).toLocaleDateString()}</p>
					</div>
					<div>
						<p class="block text-sm font-medium text-muted-foreground">Last Updated</p>
						<p class="text-sm text-primary">{new Date(user.updatedAt).toLocaleDateString()}</p>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="text-center py-12">
			<div class="text-muted-foreground text-6xl mb-4">🔒</div>
			<h3 class="text-lg font-medium text-primary mb-2">Access Denied</h3>
			<p class="text-muted-foreground">You need to be logged in to access settings.</p>
		</div>
	{/if}
</div> 