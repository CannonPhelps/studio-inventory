<script lang="ts">
	import { onMount } from 'svelte';

	let user: any = null;
	let loading = true;
	let message = '';
	let messageType = '';

	// Password change form
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let showPasswordForm = false;

	// Profile form
	let profileForm = {
		name: '',
		email: '',
		department: '',
		phone: ''
	};

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
</script>

<svelte:head>
	<title>Settings - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Settings</h1>
		<p class="mt-2 text-gray-600">Manage your account settings and preferences</p>
	</div>

	{#if message}
		<div class="p-4 rounded-lg {messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}">
			{message}
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		</div>
	{:else if user}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Profile Settings -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
				<form on:submit|preventDefault={handleProfileUpdate} class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							Full Name
						</label>
						<input
							id="name"
							type="text"
							bind:value={profileForm.name}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your full name"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						<input
							id="email"
							type="email"
							bind:value={profileForm.email}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your email"
						/>
					</div>

					<div>
						<label for="department" class="block text-sm font-medium text-gray-700 mb-1">
							Department
						</label>
						<input
							id="department"
							type="text"
							bind:value={profileForm.department}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your department"
						/>
					</div>

					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<input
							id="phone"
							type="tel"
							bind:value={profileForm.phone}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your phone number"
						/>
					</div>

					<div class="pt-4">
						<button
							type="submit"
							class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Update Profile
						</button>
					</div>
				</form>
			</div>

			<!-- Password Settings -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
				
				{#if !showPasswordForm}
					<div class="text-center py-8">
						<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
							</svg>
						</div>
						<p class="text-gray-600 mb-4">Keep your account secure by using a strong password</p>
						<button
							on:click={() => showPasswordForm = true}
							class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Change Password
						</button>
					</div>
				{:else}
					<form on:submit|preventDefault={handlePasswordChange} class="space-y-4">
						<div>
							<label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
								Current Password
							</label>
							<input
								id="currentPassword"
								type="password"
								bind:value={currentPassword}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your current password"
							/>
						</div>

						<div>
							<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
								New Password
							</label>
							<input
								id="newPassword"
								type="password"
								bind:value={newPassword}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your new password"
							/>
							<p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
						</div>

						<div>
							<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
								Confirm New Password
							</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Confirm your new password"
							/>
						</div>

						<div class="flex space-x-3 pt-4">
							<button
								type="submit"
								class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
								class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
							>
								Cancel
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>

		<!-- Account Information -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-500">User ID</label>
					<p class="text-sm text-gray-900 font-mono">{user.id}</p>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-500">Role</label>
					<p class="text-sm text-gray-900 capitalize">{user.role}</p>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-500">Member Since</label>
					<p class="text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-500">Last Updated</label>
					<p class="text-sm text-gray-900">{new Date(user.updatedAt).toLocaleDateString()}</p>
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