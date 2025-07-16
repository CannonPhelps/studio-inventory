<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';

  type Kit = {
    id: number;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };

  type KitAsset = {
    id: number;
    kitId: number;
    assetId: number;
    quantity?: number;
    assignedAt: string;
    asset: {
      id: number;
      itemName: string;
      category?: string;
      serialNumber?: string;
      status: string;
    };
  };

  const kit = writable<Kit | null>(null);
  const assets = writable<KitAsset[]>([]);
  const loading = writable(true);
  const error = writable('');
  
  // Modal state
  let showAddAssetModal = false;
  let selectedAssetId = '';
  let assetQuantity = 1;
  let availableAssets: any[] = [];

  async function load() {
    loading.set(true);
    error.set('');
    
    try {
      const id = $page.params.id;
      const [kRes, aRes] = await Promise.all([
        fetch(`/api/kits/${id}`),
        fetch(`/api/kits/${id}/assets`)
      ]);
      
      if (!kRes.ok) throw new Error('Failed to load kit');
      if (!aRes.ok) throw new Error('Failed to load kit assets');
      
      kit.set(await kRes.json());
      assets.set(await aRes.json());
    } catch (e) {
      console.error('Error loading kit:', e);
      error.set(e instanceof Error ? e.message : 'Failed to load kit');
    } finally {
      loading.set(false);
    }
  }

  async function loadAvailableAssets() {
    try {
      const response = await fetch('/api/assets');
      if (!response.ok) throw new Error('Failed to load assets');
      availableAssets = await response.json();
    } catch (e) {
      console.error('Error loading available assets:', e);
    }
  }

  onMount(async () => {
    await load();
    await loadAvailableAssets();
  });

  async function addAsset() {
    if (!selectedAssetId) {
      error.set('Please select an asset');
      return;
    }
    
    error.set('');
    try {
      const response = await fetch(`/api/kits/${$page.params.id}/assets`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          assetId: Number(selectedAssetId),
          quantity: assetQuantity 
        }) 
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to add asset: ${response.status} ${errorData}`);
      }
      
      // Reset form and close modal
      selectedAssetId = '';
      assetQuantity = 1;
      showAddAssetModal = false;
      
      await load();
    } catch (e) {
      console.error('Error adding asset:', e);
      error.set(e instanceof Error ? e.message : 'Failed to add asset');
    }
  }

  // Remove asset modal state
  let showRemoveModal = false;
  let assetToRemove: KitAsset | null = null;

  async function removeAsset(assetId: number) {
    // Find the asset to remove
    const asset = $assets.find(a => a.assetId === assetId);
    if (!asset) return;
    
    assetToRemove = asset;
    showRemoveModal = true;
  }

  async function confirmRemoveAsset() {
    if (!assetToRemove) return;
    
    error.set('');
    try {
      const response = await fetch(`/api/kits/${$page.params.id}/assets/${assetToRemove.assetId}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to remove asset: ${response.status} ${errorData}`);
      }
      
      // Close modal and reset
      showRemoveModal = false;
      assetToRemove = null;
      
      await load();
    } catch (e) {
      console.error('Error removing asset:', e);
      error.set(e instanceof Error ? e.message : 'Failed to remove asset');
    }
  }

  function cancelRemoveAsset() {
    showRemoveModal = false;
    assetToRemove = null;
  }

  function cancelAddAsset() {
    selectedAssetId = '';
    assetQuantity = 1;
    showAddAssetModal = false;
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'checked_out': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  function getAssetStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'checked_out': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'damaged': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }
</script>

<svelte:head>
  <title>{$kit ? $kit.name : 'Kit'} - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
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
  {:else if $kit}
    <!-- Header -->
    <SectionHeader 
      title={$kit.name}
      subtitle={$kit.description || 'Kit details and assets'}
      gradient="from-accent to-accent-secondary">
      <button 
        type="button" 
        on:click={() => showAddAssetModal = true}
        class="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Asset
      </button>
    </SectionHeader>

    <!-- Kit Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Kit Info Card -->
      <Card className="lg:col-span-1">
        <h3 class="text-lg font-semibold text-primary mb-4">Kit Information</h3>
        <div class="space-y-3">
          <div>
            <p class="text-sm font-medium text-secondary">Status</p>
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor($kit.status)}">
              {$kit.status}
            </span>
          </div>
          
          {#if $kit.description}
            <div>
              <p class="text-sm font-medium text-secondary">Description</p>
              <p class="text-primary">{$kit.description}</p>
            </div>
          {/if}
          
          <div>
            <p class="text-sm font-medium text-secondary">Created</p>
            <p class="text-primary">{new Date($kit.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div>
            <p class="text-sm font-medium text-secondary">Last Updated</p>
            <p class="text-primary">{new Date($kit.updatedAt).toLocaleDateString()}</p>
          </div>
          
          <div>
            <p class="text-sm font-medium text-secondary">Total Assets</p>
            <p class="text-primary">{$assets.length}</p>
          </div>
        </div>
      </Card>

      <!-- Assets List -->
      <Card className="lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-primary">Assets ({$assets.length})</h3>
          <button 
            type="button" 
            on:click={() => showAddAssetModal = true}
            class="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
          >
            Add Asset
          </button>
        </div>
        
        {#if $assets.length === 0}
          <div class="text-center py-12">
            <div class="text-tertiary text-4xl mb-4">📦</div>
            <h3 class="text-lg font-medium text-primary mb-2">No assets in kit</h3>
            <p class="text-secondary mb-4">Add assets to this kit to get started.</p>
            <button 
              type="button" 
              on:click={() => showAddAssetModal = true}
              class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
            >
              Add Asset
            </button>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-card">
              <thead class="bg-tertiary">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Asset</th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Quantity</th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-card bg-card">
                {#each $assets as kitAsset}
                  <tr class="hover:bg-tertiary transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p class="text-sm font-medium text-primary">{kitAsset.asset.itemName}</p>
                        {#if kitAsset.asset.serialNumber}
                          <p class="text-sm text-secondary">SN: {kitAsset.asset.serialNumber}</p>
                        {/if}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <p class="text-sm text-primary">{kitAsset.asset.category || 'N/A'}</p>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getAssetStatusColor(kitAsset.asset.status)}">
                        {kitAsset.asset.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <p class="text-sm text-primary">{kitAsset.quantity || 1}</p>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        type="button" 
                        on:click={() => removeAsset(kitAsset.assetId)}
                        class="px-3 py-1.5 text-sm bg-accent-error text-white rounded-lg hover:bg-accent-error/80 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </Card>
    </div>
  {:else}
    <div class="text-center py-12">
      <div class="text-tertiary text-4xl mb-4">❌</div>
      <h3 class="text-lg font-medium text-primary mb-2">Kit not found</h3>
      <p class="text-secondary">The kit you're looking for doesn't exist.</p>
    </div>
  {/if}
</div>

<!-- Add Asset Modal -->
{#if showAddAssetModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={cancelAddAsset}>
    <div class="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4" on:click|stopPropagation>
      <h3 class="text-lg font-semibold text-primary mb-4">Add Asset to Kit</h3>
      
      <div class="space-y-4">
        <div>
          <label for="assetSelect" class="block text-sm font-medium text-primary mb-1">Select Asset *</label>
          <select
            id="assetSelect"
            bind:value={selectedAssetId}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">Choose an asset...</option>
            {#each availableAssets as asset}
              <option value={asset.id}>{asset.itemName} {#if asset.serialNumber}({asset.serialNumber}){/if}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label for="assetQuantity" class="block text-sm font-medium text-primary mb-1">Quantity</label>
          <input
            id="assetQuantity"
            type="number"
            min="1"
            bind:value={assetQuantity}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="1"
          />
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <button 
          type="button" 
          on:click={cancelAddAsset}
          class="px-4 py-2 bg-transparent text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button" 
          on:click={addAsset}
          class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
        >
          Add Asset
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Remove Asset Confirmation Modal -->
{#if showRemoveModal && assetToRemove}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={cancelRemoveAsset}>
    <div class="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4" on:click|stopPropagation>
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-semibold text-primary">Remove Asset</h3>
        </div>
      </div>
      
      <div class="mb-6">
        <p class="text-primary mb-2">Are you sure you want to remove this asset from the kit?</p>
        <div class="bg-tertiary rounded-lg p-3">
          <p class="font-medium text-primary">{assetToRemove.asset.itemName}</p>
          {#if assetToRemove.asset.serialNumber}
            <p class="text-sm text-secondary">SN: {assetToRemove.asset.serialNumber}</p>
          {/if}
          {#if assetToRemove.quantity && assetToRemove.quantity > 1}
            <p class="text-sm text-secondary">Quantity: {assetToRemove.quantity}</p>
          {/if}
        </div>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          type="button" 
          on:click={cancelRemoveAsset}
          class="px-4 py-2 bg-transparent text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button" 
          on:click={confirmRemoveAsset}
          class="px-4 py-2 bg-accent-error text-white rounded-lg hover:bg-accent-error/80 transition-colors"
        >
          Remove Asset
        </button>
      </div>
    </div>
  </div>
{/if} 