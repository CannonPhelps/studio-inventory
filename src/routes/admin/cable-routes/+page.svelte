<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';

  type Route = { 
    id: number; 
    name: string; 
    status: string; 
    description?: string;
    totalLength?: number;
    createdAt: string;
    updatedAt: string;
  };

  const routes = writable<Route[]>([]);
  const loading = writable(true);
  const error = writable('');
  
  // Modal state
  let showCreateModal = false;
  let newRouteName = '';
  let newRouteDescription = '';
  let newRouteStatus = 'active';
  
  // Delete modal state
  let showDeleteModal = false;
  let routeToDelete: Route | null = null;

  async function load() {
    loading.set(true);
    error.set('');
    
    try {
      const res = await fetch('/api/cable-routes');
      if (!res.ok) throw new Error('Failed to load routes');
      routes.set(await res.json());
    } catch (e) {
      console.error('Error loading routes:', e);
      error.set(e instanceof Error ? e.message : 'Failed to load routes');
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

  async function createRoute() {
    error.set(''); // Clear any previous errors
    
    // Show the modal instead of using prompt
    showCreateModal = true;
  }

  async function submitCreateRoute() {
    if (!newRouteName.trim()) {
      error.set('Route name is required');
      return;
    }
    
    try {
      const response = await fetch('/api/cable-routes', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name: newRouteName.trim(), 
          description: newRouteDescription.trim() || undefined,
          status: newRouteStatus
        }) 
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create route: ${response.status} ${errorData}`);
      }
      
      // Reset form and close modal
      newRouteName = '';
      newRouteDescription = '';
      newRouteStatus = 'active';
      showCreateModal = false;
      
      await load();
    } catch (e) {
      console.error('Error creating route:', e);
      error.set(e instanceof Error ? e.message : 'Failed to create route');
    }
  }

  function cancelCreateRoute() {
    newRouteName = '';
    newRouteDescription = '';
    newRouteStatus = 'active';
    showCreateModal = false;
  }

  async function deleteRoute(id: number) {
    // Find the route to delete
    const route = $routes.find(r => r.id === id);
    if (!route) return;
    
    routeToDelete = route;
    showDeleteModal = true;
  }

  async function confirmDeleteRoute() {
    if (!routeToDelete) return;
    
    error.set(''); // Clear any previous errors
    try {
      const response = await fetch(`/api/cable-routes/${routeToDelete.id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete route: ${response.status} ${errorData}`);
      }
      
      // Close modal and reset
      showDeleteModal = false;
      routeToDelete = null;
      
      await load();
    } catch (e) {
      console.error('Error deleting route:', e);
      error.set(e instanceof Error ? e.message : 'Failed to delete route');
    }
  }

  function cancelDeleteRoute() {
    showDeleteModal = false;
    routeToDelete = null;
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }
</script>

<svelte:head>
  <title>Cable Routes - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <SectionHeader 
    title="Cable Routes" 
    subtitle="Manage cable routing paths and infrastructure" 
    gradient="from-accent to-accent-secondary">
    <button 
      type="button" 
      on:click={createRoute}
      class="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New Route
    </button>
  </SectionHeader>

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
  {:else if $routes.length === 0}
    <div class="text-center py-12">
      <div class="text-tertiary text-4xl mb-4">🔌</div>
      <h3 class="text-lg font-medium text-primary mb-2">No cable routes yet</h3>
      <p class="text-secondary mb-4">Create your first cable route to start organizing infrastructure.</p>
      <button 
        type="button" 
        on:click={createRoute}
        class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
      >
        New Route
      </button>
    </div>
  {:else}
    <!-- Cable Routes Table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-card">
          <thead class="bg-tertiary">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Total Length</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-card bg-card">
            {#each $routes as route}
              <tr class="hover:bg-tertiary transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <a href={`/admin/cable-routes/${route.id}`} class="text-sm font-medium text-accent hover:text-accent-secondary">
                      {route.name}
                    </a>
                    {#if route.description}
                      <div class="text-sm text-secondary">{route.description}</div>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(route.status)}">
                    {route.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-primary">
                    {route.totalLength ? `${route.totalLength}ft` : 'N/A'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    type="button" 
                    on:click={() => deleteRoute(route.id)}
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

<!-- Create Route Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={cancelCreateRoute}>
    <div class="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4" on:click|stopPropagation>
      <h3 class="text-lg font-semibold text-primary mb-4">Create New Cable Route</h3>
      
      <div class="space-y-4">
        <div>
          <label for="routeName" class="block text-sm font-medium text-primary mb-1">Route Name *</label>
          <input
            id="routeName"
            type="text"
            bind:value={newRouteName}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter route name"
            on:keydown={(e) => e.key === 'Enter' && submitCreateRoute()}
          />
        </div>
        
        <div>
          <label for="routeDescription" class="block text-sm font-medium text-primary mb-1">Description</label>
          <textarea
            id="routeDescription"
            bind:value={newRouteDescription}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter description (optional)"
            rows="3"
          ></textarea>
        </div>
        
        <div>
          <label for="routeStatus" class="block text-sm font-medium text-primary mb-1">Status</label>
          <select
            id="routeStatus"
            bind:value={newRouteStatus}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="planned">Planned</option>
          </select>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <button 
          type="button" 
          on:click={cancelCreateRoute}
          class="px-4 py-2 bg-transparent text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button" 
          on:click={submitCreateRoute}
          class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
        >
          Create Route
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Route Confirmation Modal -->
{#if showDeleteModal && routeToDelete}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={cancelDeleteRoute}>
    <div class="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4" on:click|stopPropagation>
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-semibold text-primary">Delete Cable Route</h3>
        </div>
      </div>
      
      <div class="mb-6">
        <p class="text-primary mb-2">Are you sure you want to delete this cable route?</p>
        <div class="bg-tertiary rounded-lg p-3">
          <p class="font-medium text-primary">{routeToDelete.name}</p>
          {#if routeToDelete.description}
            <p class="text-sm text-secondary">{routeToDelete.description}</p>
          {/if}
          <p class="text-sm text-secondary">Status: {routeToDelete.status}</p>
        </div>
        <p class="text-sm text-accent-error mt-2">This action cannot be undone.</p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button" 
          on:click={cancelDeleteRoute}
          class="px-4 py-2 bg-transparent text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button" 
          on:click={confirmDeleteRoute}
          class="px-4 py-2 bg-accent-error text-white rounded-lg hover:bg-accent-error/80 transition-colors"
        >
          Delete Route
        </button>
      </div>
    </div>
  </div>
{/if} 