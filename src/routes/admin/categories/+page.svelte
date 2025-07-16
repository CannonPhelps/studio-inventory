<script lang="ts">
	import { onMount } from 'svelte';

	let categories: any[] = [];
	let loading = true;
	let showAddModal = false;
	let editingCategory: any = null;

	let newCategory = {
		name: ''
	};

	onMount(async () => {
		await loadCategories();
	});

	async function loadCategories() {
		try {
			const response = await fetch('/api/categories');
			categories = await response.json();
		} catch (error) {
			console.error('Error loading categories:', error);
		} finally {
			loading = false;
		}
	}

	async function addCategory() {
		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCategory)
			});

			if (response.ok) {
				await loadCategories();
				showAddModal = false;
				newCategory = { name: '' };
			}
		} catch (error) {
			console.error('Error adding category:', error);
		}
	}

	async function updateCategory() {
		if (!editingCategory) return;

		try {
			const response = await fetch(`/api/categories/${editingCategory.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingCategory)
			});

			if (response.ok) {
				await loadCategories();
				editingCategory = null;
			}
		} catch (error) {
			console.error('Error updating category:', error);
		}
	}

	async function deleteCategory(id: number) {
		if (!confirm('Are you sure you want to delete this category?')) return;

		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadCategories();
			}
		} catch (error) {
			console.error('Error deleting category:', error);
		}
	}

	function startEdit(category: any) {
		editingCategory = { ...category };
	}

	function cancelEdit() {
		editingCategory = null;
	}

	// Import unified UI components
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

</script>

<svelte:head>
	<title>Categories - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-primary">Categories</h1>
			<p class="mt-2 text-secondary">Organize your inventory with categories</p>
		</div>
		<Button
			className="mt-4 sm:mt-0 flex items-center gap-2"
			on:click={() => (showAddModal = true)}
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Category
		</Button>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
		</div>
	{:else if categories.length === 0}
		<div class="text-center py-12">
			<div class="text-tertiary text-4xl mb-4">🏷️</div>
			<h3 class="text-lg font-medium text-primary mb-2">No categories yet</h3>
			<p class="text-secondary mb-4">Create your first category to start organizing your inventory.</p>
			<Button on:click={() => (showAddModal = true)}>Add Category</Button>
		</div>
	{:else}
		<!-- Categories Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each categories as category}
				<div class="bg-card rounded-xl shadow-sm border border-card hover:shadow-md transition-shadow">
					<div class="p-6">
						<div class="flex items-start justify-between mb-4">
							<div class="flex items-center">
								<h3 class="text-lg font-semibold text-primary">{category.name}</h3>
							</div>
							<div class="flex items-center space-x-2">
								<Button
									variant="ghost"
									size="sm"
									className="text-accent hover:text-accent-secondary p-1"
									on:click={() => startEdit(category)}
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</Button>
								<Button
									variant="danger"
									size="sm"
									className="p-1"
									on:click={() => deleteCategory(category.id)}
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</Button>
							</div>
						</div>

						<div class="flex items-center justify-between pt-4 border-t border-card">
							<div class="flex items-center text-sm text-secondary">
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
								{category.assetCount || 0} items
							</div>
							<span class="text-xs text-tertiary">ID: {category.id}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Add Category Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-md border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Add New Category</h2>
			<form on:submit|preventDefault={addCategory} class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-secondary mb-1">Name *</label>
					<Input id="name" bind:value={newCategory.name} placeholder="Enter category name" required />
				</div>
				<div class="flex space-x-3 pt-4">
					<Button type="submit" className="flex-1">Add Category</Button>
					<Button variant="secondary" type="button" className="flex-1" on:click={() => (showAddModal = false)}>Cancel</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Category Modal -->
{#if editingCategory}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-md border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Edit Category</h2>
			<form on:submit|preventDefault={updateCategory} class="space-y-4">
				<div>
					<label for="edit-name" class="block text-sm font-medium text-secondary mb-1">Name *</label>
					<Input id="edit-name" bind:value={editingCategory.name} placeholder="Enter category name" required />
				</div>
				<div class="flex space-x-3 pt-4">
					<Button type="submit" className="flex-1">Update Category</Button>
					<Button variant="secondary" type="button" className="flex-1" on:click={cancelEdit}>Cancel</Button>
				</div>
			</form>
		</div>
	</div>
{/if} 