<script lang="ts">
	import { onMount } from 'svelte';

	interface User {
		id: string;
		email: string;
		name: string;
		role: string;
		department?: string;
		phone?: string;
		createdAt: string;
		updatedAt: string;
	}

	let users: User[] = [];
	let loading = true;
	let showAddModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let selectedUser: User | null = null;

	// Form data
	let formData = {
		email: '',
		name: '',
		role: 'user',
		department: '',
		phone: '',
		password: ''
	};

	onMount(async () => {
		await loadUsers();
	});

	async function loadUsers() {
		try {
			const response = await fetch('/api/admin/users');
			if (response.ok) {
				users = await response.json();
			}
			loading = false;
		} catch (error) {
			console.error('Error loading users:', error);
			loading = false;
		}
	}

	function openAddModal() {
		formData = {
			email: '',
			name: '',
			role: 'user',
			department: '',
			phone: '',
			password: ''
		};
		showAddModal = true;
	}

	function openEditModal(user: User) {
		selectedUser = user;
		formData = {
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department || '',
			phone: user.phone || '',
			password: ''
		};
		showEditModal = true;
	}

	function openDeleteModal(user: User) {
		selectedUser = user;
		showDeleteModal = true;
	}

	async function handleAddUser(event: Event) {
		event.preventDefault();
		
		if (!formData.email || !formData.name || !formData.password) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			const response = await fetch('/api/auth/admin-create-user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				showAddModal = false;
				await loadUsers();
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to create user');
			}
		} catch (error) {
			console.error('Error creating user:', error);
			alert('Error creating user');
		}
	}

	async function handleEditUser(event: Event) {
		event.preventDefault();
		
		if (!selectedUser || !formData.email || !formData.name) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					password: formData.password || undefined
				})
			});

			if (response.ok) {
				showEditModal = false;
				selectedUser = null;
				await loadUsers();
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to update user');
			}
		} catch (error) {
			console.error('Error updating user:', error);
			alert('Error updating user');
		}
	}

	async function handleDeleteUser() {
		if (!selectedUser) return;

		try {
			const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				showDeleteModal = false;
				selectedUser = null;
				await loadUsers();
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to delete user');
			}
		} catch (error) {
			console.error('Error deleting user:', error);
			alert('Error deleting user');
		}
	}

	async function fixUsers() {
		try {
			const response = await fetch('/api/auth/fix-users', {
				method: 'POST'
			});

			if (response.ok) {
				const result = await response.json();
				alert(result.message);
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to fix users');
			}
		} catch (error) {
			console.error('Error fixing users:', error);
			alert('Error fixing users');
		}
	}

	function getRoleColor(role: string) {
		switch (role) {
			case 'admin': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
			case 'user': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
			default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
		}
	}
</script>

<svelte:head>
	<title>User Management - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-start">
		<div>
			<h1 class="text-3xl font-bold text-primary">User Management</h1>
			<p class="text-secondary mt-1">Manage system users and permissions</p>
		</div>
		<div class="flex space-x-3">
			<button
				on:click={openAddModal}
				class="bg-accent hover:bg-accent-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add User
			</button>
			<button
				on:click={fixUsers}
				class="bg-tertiary-500 hover:bg-tertiary-600 text-white px-4 py-2 rounded-lg transition-colors"
			>
				Fix Users
			</button>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
		</div>
	{:else if users.length === 0}
		<div class="text-center py-12">
			<div class="text-tertiary text-4xl mb-4">👥</div>
			<h3 class="text-lg font-medium text-primary mb-2">No users found</h3>
			<p class="text-secondary mb-4">Create your first user to get started.</p>
			<button
				on:click={openAddModal}
				class="bg-accent hover:bg-accent-secondary text-white px-4 py-2 rounded-lg transition-colors"
			>
				Add User
			</button>
		</div>
	{:else}
		<!-- Users Table -->
		<div class="rounded-xl shadow-sm border border-card bg-card">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-tertiary border-b border-card">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">User</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Role</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Department</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Created</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-card">
						{#each users as user}
							<tr class="hover:bg-tertiary transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-primary">{user.name}</div>
										<div class="text-sm text-secondary">{user.email}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getRoleColor(user.role)}">
										{user.role}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-secondary">
									{user.department || '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-secondary">
									{new Date(user.createdAt).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div class="flex space-x-2">
										<button
											on:click={() => openEditModal(user)}
											class="text-accent hover:text-accent-secondary transition-colors"
											aria-label="Edit user"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
										</button>
										<button
											on:click={() => openDeleteModal(user)}
											class="text-error hover:text-red-700 transition-colors"
											aria-label="Delete user"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- Add User Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-md border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Add New User</h2>
			<form on:submit|preventDefault={handleAddUser} class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-secondary mb-1">Name *</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter full name"
						required
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-secondary mb-1">Email *</label>
					<input
						id="email"
						type="email"
						bind:value={formData.email}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter email address"
						required
					/>
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-secondary mb-1">Password *</label>
					<input
						id="password"
						type="password"
						bind:value={formData.password}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter password"
						required
					/>
				</div>
				<div>
					<label for="role" class="block text-sm font-medium text-secondary mb-1">Role</label>
					<select
						id="role"
						bind:value={formData.role}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
				</div>
				<div>
					<label for="department" class="block text-sm font-medium text-secondary mb-1">Department</label>
					<input
						id="department"
						type="text"
						bind:value={formData.department}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter department"
					/>
				</div>
				<div>
					<label for="phone" class="block text-sm font-medium text-secondary mb-1">Phone</label>
					<input
						id="phone"
						type="tel"
						bind:value={formData.phone}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter phone number"
					/>
				</div>
				<div class="flex space-x-3 pt-4">
					<button
						type="submit"
						class="flex-1 bg-accent hover:bg-accent-secondary text-white py-2 px-4 rounded-lg transition-colors"
					>
						Add User
					</button>
					<button
						type="button"
						on:click={() => (showAddModal = false)}
						class="flex-1 bg-tertiary hover:bg-secondary text-primary py-2 px-4 rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit User Modal -->
{#if showEditModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-md border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Edit User</h2>
			<form on:submit|preventDefault={handleEditUser} class="space-y-4">
				<div>
					<label for="edit-name" class="block text-sm font-medium text-secondary mb-1">Name *</label>
					<input
						id="edit-name"
						type="text"
						bind:value={formData.name}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter full name"
						required
					/>
				</div>
				<div>
					<label for="edit-email" class="block text-sm font-medium text-secondary mb-1">Email *</label>
					<input
						id="edit-email"
						type="email"
						bind:value={formData.email}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter email address"
						required
					/>
				</div>
				<div>
					<label for="edit-password" class="block text-sm font-medium text-secondary mb-1">Password (leave blank to keep current)</label>
					<input
						id="edit-password"
						type="password"
						bind:value={formData.password}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter new password"
					/>
				</div>
				<div>
					<label for="edit-role" class="block text-sm font-medium text-secondary mb-1">Role</label>
					<select
						id="edit-role"
						bind:value={formData.role}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
				</div>
				<div>
					<label for="edit-department" class="block text-sm font-medium text-secondary mb-1">Department</label>
					<input
						id="edit-department"
						type="text"
						bind:value={formData.department}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter department"
					/>
				</div>
				<div>
					<label for="edit-phone" class="block text-sm font-medium text-secondary mb-1">Phone</label>
					<input
						id="edit-phone"
						type="tel"
						bind:value={formData.phone}
						class="w-full px-3 py-2 border border-card bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						placeholder="Enter phone number"
					/>
				</div>
				<div class="flex space-x-3 pt-4">
					<button
						type="submit"
						class="flex-1 bg-accent hover:bg-accent-secondary text-white py-2 px-4 rounded-lg transition-colors"
					>
						Update User
					</button>
					<button
						type="button"
						on:click={() => (showEditModal = false)}
						class="flex-1 bg-tertiary hover:bg-secondary text-primary py-2 px-4 rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete User Modal -->
{#if showDeleteModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-md border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Delete User</h2>
			<p class="text-secondary mb-6">
				Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
			</p>
			<div class="flex space-x-3">
				<button
					on:click={handleDeleteUser}
					class="flex-1 bg-error hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
				>
					Delete User
				</button>
				<button
					on:click={() => (showDeleteModal = false)}
					class="flex-1 bg-tertiary hover:bg-secondary text-primary py-2 px-4 rounded-lg transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if} 