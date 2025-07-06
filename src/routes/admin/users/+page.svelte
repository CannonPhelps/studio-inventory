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
			case 'admin': return 'text-red-600 bg-red-50';
			case 'user': return 'text-blue-600 bg-blue-50';
			default: return 'text-gray-600 bg-gray-50';
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
			<h1 class="text-3xl font-bold text-gray-900">User Management</h1>
			<p class="text-gray-600 mt-1">Manage system users and permissions</p>
		</div>
		<div class="flex space-x-3">
			<button
				onclick={fixUsers}
				class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
			>
				Fix Users
			</button>
			<button
				onclick={openAddModal}
				class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
			>
				Add User
			</button>
		</div>
	</div>

	<!-- Users Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200">
		<div class="p-6 border-b border-gray-200">
			<h2 class="text-xl font-semibold text-gray-900">All Users</h2>
			<p class="text-gray-600 mt-1">System users and their roles</p>
		</div>
		<div class="overflow-x-auto">
			{#if loading}
				<div class="p-6 text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
					<p class="text-gray-500 mt-2">Loading users...</p>
				</div>
			{:else if users.length === 0}
				<div class="p-6 text-center">
					<div class="text-gray-400 text-4xl mb-4">👥</div>
					<p class="text-gray-500">No users found</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each users as user}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{user.name}</div>
										<div class="text-sm text-gray-500">{user.email}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getRoleColor(user.role)}">
										{user.role}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.department || '-'}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone || '-'}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{new Date(user.createdAt).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div class="flex space-x-2">
										<button
											onclick={() => openEditModal(user)}
											class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
										>
											Edit
										</button>
										<button
											onclick={() => openDeleteModal(user)}
											class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div>

<!-- Add User Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Add New User</h2>
			<form onsubmit={handleAddUser} class="space-y-4">
				<div>
					<label for="add-email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
					<input
						type="email"
						id="add-email"
						bind:value={formData.email}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
						required
					/>
				</div>
				<div>
					<label for="add-name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
					<input
						type="text"
						id="add-name"
						bind:value={formData.name}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
						required
					/>
				</div>
				<div>
					<label for="add-password" class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
					<input
						type="password"
						id="add-password"
						bind:value={formData.password}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
						required
					/>
				</div>
				<div>
					<label for="add-role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
					<select
						id="add-role"
						bind:value={formData.role}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
				</div>
				<div>
					<label for="add-department" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
					<input
						type="text"
						id="add-department"
						bind:value={formData.department}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>
				<div>
					<label for="add-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
					<input
						type="tel"
						id="add-phone"
						bind:value={formData.phone}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>
				<div class="flex justify-end space-x-3 pt-4">
					<button
						type="button"
						onclick={() => showAddModal = false}
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
					>
						Add User
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit User Modal -->
{#if showEditModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Edit User</h2>
			<form onsubmit={handleEditUser} class="space-y-4">
				<div>
					<label for="edit-email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
					<input
						type="email"
						id="edit-email"
						bind:value={formData.email}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
						required
					/>
				</div>
				<div>
					<label for="edit-name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
					<input
						type="text"
						id="edit-name"
						bind:value={formData.name}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
						required
					/>
				</div>
				<div>
					<label for="edit-password" class="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
					<input
						type="password"
						id="edit-password"
						bind:value={formData.password}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>
				<div>
					<label for="edit-role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
					<select
						id="edit-role"
						bind:value={formData.role}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
				</div>
				<div>
					<label for="edit-department" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
					<input
						type="text"
						id="edit-department"
						bind:value={formData.department}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>
				<div>
					<label for="edit-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
					<input
						type="tel"
						id="edit-phone"
						bind:value={formData.phone}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>
				<div class="flex justify-end space-x-3 pt-4">
					<button
						type="button"
						onclick={() => showEditModal = false}
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
					>
						Update User
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Delete User</h2>
			<p class="text-gray-600 mb-6">
				Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
			</p>
			<div class="flex justify-end space-x-3">
				<button
					onclick={() => showDeleteModal = false}
					class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={handleDeleteUser}
					class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
				>
					Delete User
				</button>
			</div>
		</div>
	</div>
{/if} 