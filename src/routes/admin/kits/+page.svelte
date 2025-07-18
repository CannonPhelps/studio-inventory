<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  import Card from '$lib/components/Card.svelte';

  type Kit = {
    id: number;
    name: string;
    description?: string;
    status: string;
  };

  const kits = writable<Kit[]>([]);
  const loading = writable(true);
  const error = writable('');
  
  // Modal state
  let showCreateModal = false;
  let newKitName = '';
  let newKitDescription = '';
  
  // Delete modal state
  let showDeleteModal = false;
  let kitToDelete: Kit | null = null;

  async function load() {
    loading.set(true);
    try {
      const res = await fetch('/api/kits');
      if (!res.ok) throw new Error('Failed to load kits');
      kits.set(await res.json());
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Failed');
    } finally {
      loading.set(false);
    }
  }

  onMount(async () => {
    // Check authentication status first
    try {
      const authResponse = await fetch('/api/auth/me');
      const authData = await authResponse.json();
      
      if (!authData.user) {
        error.set('Not authenticated. Please log in.');
        return;
      }
      
      if (authData.user.role !== 'admin') {
        error.set('Admin access required.');
        return;
      }
      
      await load();
    } catch (e) {
      console.error('Auth check error:', e);
      error.set('Authentication check failed.');
    }
  });

  async function createKit() {
    console.log('createKit function called'); // Debug log
    error.set(''); // Clear any previous errors
    
    // Show the modal instead of using prompt
    showCreateModal = true;
  }

  async function submitCreateKit() {
    console.log('submitCreateKit function called'); // Debug log
    
    if (!newKitName.trim()) {
      error.set('Kit name is required');
      return;
    }
    
    try {
      const response = await fetch('/api/kits', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name: newKitName.trim(), 
          description: newKitDescription.trim() || undefined 
        }) 
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create kit: ${response.status} ${errorData}`);
      }
      
      // Reset form and close modal
      newKitName = '';
      newKitDescription = '';
      showCreateModal = false;
      
      await load();
    } catch (e) {
      console.error('Error creating kit:', e);
      error.set(e instanceof Error ? e.message : 'Failed to create kit');
    }
  }

  function cancelCreateKit() {
    newKitName = '';
    newKitDescription = '';
    showCreateModal = false;
  }

  async function deleteKit(id: number) {
    // Find the kit to delete
    const kit = $kits.find(k => k.id === id);
    if (!kit) return;
    
    kitToDelete = kit;
    showDeleteModal = true;
  }

  async function confirmDeleteKit() {
    if (!kitToDelete) return;
    
    error.set(''); // Clear any previous errors
    try {
      const response = await fetch(`/api/kits/${kitToDelete.id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete kit: ${response.status} ${errorData}`);
      }
      
      // Close modal and reset
      showDeleteModal = false;
      kitToDelete = null;
      
      await load();
    } catch (e) {
      console.error('Error deleting kit:', e);
      error.set(e instanceof Error ? e.message : 'Failed to delete kit');
    }
  }

  function cancelDeleteKit() {
    showDeleteModal = false;
    kitToDelete = null;
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }
</script>

<svelte:head>
  <title>Kits - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->

  <div class="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Kits</h1>
        <p class="text-white/80 mt-2 text-lg">Manage equipment kits and their components</p>
      </div>
      <div class="text-right flex space-x-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{$kits.length}</div>
          <div class="text-white/90 text-sm">Total Kits</div>
        </div>
        <div class="text-center">
          <button 
            type="button" 
            on:click={createKit}
            class="flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-white/90 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Kit
          </button>
        </div>
      </div>
    </div>
  </div>

  {#if $loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  {:else if $error}
    <Card className="border-accent-error">
      <div class="flex items-center justify-between">
        <p class="text-accent-error">{$error}</p>
        <button 
          type="button" 
          on:click={() => error.set('')} 
          class="px-3 py-1.5 text-sm bg-transparent text-accent-error hover:bg-accent-error/10 rounded-lg transition-colors"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Card>
  {:else if $kits.length === 0}
    <div class="text-center py-12">
      <div class="text-tertiary text-4xl mb-4">📦</div>
      <h3 class="text-lg font-medium text-primary mb-2">No kits yet</h3>
      <p class="text-secondary mb-4">Create your first kit to start organizing equipment sets.</p>
      <button 
        type="button" 
        on:click={createKit}
        class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
      >
        New Kit
      </button>
    </div>
  {:else}
    <!-- Kits Table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-card">
          <thead class="bg-tertiary">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-card bg-card">
            {#each $kits as kit}
              <tr class="hover:bg-tertiary transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <a href={`/admin/kits/${kit.id}`} class="text-sm font-medium text-accent hover:text-accent-secondary">
                      {kit.name}
                    </a>
                    {#if kit.description}
                      <div class="text-sm text-secondary">{kit.description}</div>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(kit.status)}">
                    {kit.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    type="button" 
                    on:click={() => deleteKit(kit.id)}
                    class="px-3 py-1.5 text-sm bg-accent-error text-white rounded-lg hover:bg-accent-error/80 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card>
  {/if}
</div>

<!-- Create Kit Modal -->
{#if showCreateModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={cancelCreateKit}>
    <div class="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4" on:click|stopPropagation>
      <h3 class="text-lg font-semibold text-primary mb-4">Create New Kit</h3>
      
      <div class="space-y-4">
        <div>
          <label for="kitName" class="block text-sm font-medium text-primary mb-1">Kit Name *</label>
          <input
            id="kitName"
            type="text"
            bind:value={newKitName}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter kit name"
            on:keydown={(e) => e.key === 'Enter' && submitCreateKit()}
          />
        </div>
        
        <div>
          <label for="kitDescription" class="block text-sm font-medium text-primary mb-1">Description</label>
          <textarea
            id="kitDescription"
            bind:value={newKitDescription}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter description (optional)"
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <button 
          type="button" 
          on:click={cancelCreateKit}
          class="px-4 py-2 bg-transparent text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button" 
          on:click={submitCreateKit}
          class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
        >
          Create Kit
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Kit Confirmation Modal -->
{#if showDeleteModal && kitToDelete}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={cancelDeleteKit}>
    <div class="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4" on:click|stopPropagation>
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-semibold text-primary">Delete Kit</h3>
        </div>
      </div>
      
      <div class="mb-6">
        <p class="text-primary mb-2">Are you sure you want to delete this kit?</p>
        <div class="bg-tertiary rounded-lg p-3">
          <p class="font-medium text-primary">{kitToDelete.name}</p>
          {#if kitToDelete.description}
            <p class="text-sm text-secondary">{kitToDelete.description}</p>
          {/if}
          <p class="text-sm text-secondary">Status: {kitToDelete.status}</p>
        </div>
        <p class="text-sm text-accent-error mt-2">This action cannot be undone.</p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button" 
          on:click={cancelDeleteKit}
          class="px-4 py-2 bg-transparent text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button" 
          on:click={confirmDeleteKit}
          class="px-4 py-2 bg-accent-error text-white rounded-lg hover:bg-accent-error/80 transition-colors"
        >
          Delete Kit
        </button>
      </div>
    </div>
  </div>
{/if} 