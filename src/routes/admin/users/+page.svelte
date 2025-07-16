<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Card from '$lib/components/Card.svelte';

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
			case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	}

	const roleOptions = [
		{ value: 'user', label: 'User' },
		{ value: 'admin', label: 'Admin' }
	];
</script>

<svelte:head>
	<title>User Management - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<SectionHeader 
		title="User Management" 
		description="Manage system users and permissions"
	>
		<div class="flex space-x-3">
			<Button on:click={openAddModal}>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add User
			</Button>
			<Button variant="secondary" on:click={fixUsers}>Fix Users</Button>
		</div>
	</SectionHeader>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
		</div>
	{:else if users.length === 0}
		<div class="text-center py-12">
			<div class="text-tertiary text-4xl mb-4">👥</div>
			<h3 class="text-lg font-medium text-primary mb-2">No users found</h3>
			<p class="text-secondary mb-4">Create your first user to get started.</p>
			<Button on:click={openAddModal}>Add User</Button>
		</div>
	{:else}
		<!-- Users Table -->
		<Card>
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
							<tr class="hover:bg-tertiary/50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-primary">{user.name}</div>
										<div class="text-sm text-secondary">{user.email}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getRoleColor(user.role)}">
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
										<Button
											variant="ghost"
											size="sm"
											className="text-accent hover:text-accent-secondary"
											on:click={() => openEditModal(user)}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
										</Button>
										<Button
											variant="danger"
											size="sm"
											on:click={() => openDeleteModal(user)}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</Button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
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
					<Input id="name" bind:value={formData.name} placeholder="Enter full name" required />
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-secondary mb-1">Email *</label>
					<Input id="email" type="email" bind:value={formData.email} placeholder="Enter email address" required />
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-secondary mb-1">Password *</label>
					<Input id="password" type="password" bind:value={formData.password} placeholder="Enter password" required />
				</div>
				<div>
					<label for="role" class="block text-sm font-medium text-secondary mb-1">Role</label>
					<Select 
						id="role" 
						bind:value={formData.role}
						options={roleOptions}
						placeholder="Select role"
					/>
				</div>
				<div>
					<label for="department" class="block text-sm font-medium text-secondary mb-1">Department</label>
					<Input id="department" bind:value={formData.department} placeholder="Enter department" />
				</div>
				<div>
					<label for="phone" class="block text-sm font-medium text-secondary mb-1">Phone</label>
					<Input id="phone" bind:value={formData.phone} placeholder="Enter phone number" />
				</div>
				<div class="flex space-x-3 pt-4">
					<Button type="submit" className="flex-1">Add User</Button>
					<Button variant="secondary" type="button" className="flex-1" on:click={() => (showAddModal = false)}>Cancel</Button>
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
					<Input id="edit-name" bind:value={formData.name} placeholder="Enter full name" required />
				</div>
				<div>
					<label for="edit-email" class="block text-sm font-medium text-secondary mb-1">Email *</label>
					<Input id="edit-email" type="email" bind:value={formData.email} placeholder="Enter email address" required />
				</div>
				<div>
					<label for="edit-password" class="block text-sm font-medium text-secondary mb-1">Password (leave blank to keep current)</label>
					<Input id="edit-password" type="password" bind:value={formData.password} placeholder="Enter new password" />
				</div>
				<div>
					<label for="edit-role" class="block text-sm font-medium text-secondary mb-1">Role</label>
					<Select 
						id="edit-role" 
						bind:value={formData.role}
						options={roleOptions}
						placeholder="Select role"
					/>
				</div>
				<div>
					<label for="edit-department" class="block text-sm font-medium text-secondary mb-1">Department</label>
					<Input id="edit-department" bind:value={formData.department} placeholder="Enter department" />
				</div>
				<div>
					<label for="edit-phone" class="block text-sm font-medium text-secondary mb-1">Phone</label>
					<Input id="edit-phone" bind:value={formData.phone} placeholder="Enter phone number" />
				</div>
				<div class="flex space-x-3 pt-4">
					<Button type="submit" className="flex-1">Update User</Button>
					<Button variant="secondary" type="button" className="flex-1" on:click={() => (showEditModal = false)}>Cancel</Button>
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
			<p class="text-secondary mb-6">Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.</p>
			<div class="flex space-x-3">
				<Button variant="danger" className="flex-1" on:click={handleDeleteUser}>Delete User</Button>
				<Button variant="secondary" className="flex-1" on:click={() => (showDeleteModal = false)}>Cancel</Button>
			</div>
		</div>
	</div>
{/if} 