<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';

  // Tab management
  let activeTab = 'checkouts';
  const tabs = [
    { id: 'checkouts', name: 'Checkouts', icon: '📤', description: 'Manage equipment checkouts' },
    { id: 'returns', name: 'Returns', icon: '📥', description: 'Process equipment returns' },
    { id: 'movements', name: 'Movements', icon: '🔄', description: 'Track equipment movements' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧', description: 'Schedule and track maintenance' }
  ];

  // Shared data
  let loading = true;
  let error = '';

  // Checkouts data
  let checkouts: any[] = [];
  let showAddCheckoutModal = false;
  let newCheckout = {
    assetId: '',
    userId: '',
    expectedReturnDate: '',
    notes: ''
  };

  // Returns data
  let returns: any[] = [];
  let showAddReturnModal = false;
  let newReturn = {
    checkoutId: '',
    condition: 'good',
    notes: ''
  };

  // Movements data
  let movements: any[] = [];
  let showAddMovementModal = false;
  let newMovement = {
    assetId: '',
    fromLocation: '',
    toLocation: '',
    reason: '',
    notes: ''
  };

  // Maintenance data
  let maintenanceRecords: any[] = [];
  let showAddMaintenanceModal = false;
  let newMaintenance = {
    assetId: '',
    type: '',
    description: '',
    scheduledDate: '',
    completedDate: '',
    cost: '',
    technician: ''
  };

  const maintenanceTypes = ['Preventive', 'Repair', 'Inspection', 'Calibration', 'Upgrade'];
  const returnConditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

  onMount(async () => {
    await loadAllData();
  });

  async function loadAllData() {
    loading = true;
    error = '';
    
    try {
      const [checkoutsRes, returnsRes, movementsRes, maintenanceRes] = await Promise.all([
        fetch('/api/checkouts'),
        fetch('/api/returns'),
        fetch('/api/movements'),
        fetch('/api/maintenance')
      ]);

      if (!checkoutsRes.ok) throw new Error('Failed to load checkouts');
      if (!returnsRes.ok) throw new Error('Failed to load returns');
      if (!movementsRes.ok) throw new Error('Failed to load movements');
      if (!maintenanceRes.ok) throw new Error('Failed to load maintenance');

      checkouts = await checkoutsRes.json();
      returns = await returnsRes.json();
      movements = await movementsRes.json();
      maintenanceRecords = await maintenanceRes.json();
    } catch (e) {
      console.error('Error loading data:', e);
      error = e instanceof Error ? e.message : 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  // Checkout functions
  function openAddCheckoutModal() {
    newCheckout = {
      assetId: '',
      userId: '',
      expectedReturnDate: '',
      notes: ''
    };
    showAddCheckoutModal = true;
  }

  async function saveCheckout() {
    try {
      const response = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCheckout)
      });

      if (!response.ok) throw new Error('Failed to save checkout');
      
      showAddCheckoutModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving checkout:', e);
      error = e instanceof Error ? e.message : 'Failed to save checkout';
    }
  }

  // Return functions
  function openAddReturnModal() {
    newReturn = {
      checkoutId: '',
      condition: 'good',
      notes: ''
    };
    showAddReturnModal = true;
  }

  async function saveReturn() {
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReturn)
      });

      if (!response.ok) throw new Error('Failed to save return');
      
      showAddReturnModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving return:', e);
      error = e instanceof Error ? e.message : 'Failed to save return';
    }
  }

  // Movement functions
  function openAddMovementModal() {
    newMovement = {
      assetId: '',
      fromLocation: '',
      toLocation: '',
      reason: '',
      notes: ''
    };
    showAddMovementModal = true;
  }

  async function saveMovement() {
    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovement)
      });

      if (!response.ok) throw new Error('Failed to save movement');
      
      showAddMovementModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving movement:', e);
      error = e instanceof Error ? e.message : 'Failed to save movement';
    }
  }

  // Maintenance functions
  function openAddMaintenanceModal() {
    newMaintenance = {
      assetId: '',
      type: '',
      description: '',
      scheduledDate: '',
      completedDate: '',
      cost: '',
      technician: ''
    };
    showAddMaintenanceModal = true;
  }

  async function saveMaintenance() {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaintenance)
      });

      if (!response.ok) throw new Error('Failed to save maintenance record');
      
      showAddMaintenanceModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving maintenance:', e);
      error = e instanceof Error ? e.message : 'Failed to save maintenance record';
    }
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'out':
        return 'bg-red-100 text-red-800';
      case 'returned':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Operations Management - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Operations Management</h1>
        <p class="text-white/80 mt-2 text-lg">Manage checkouts, returns, movements, and maintenance</p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold">{checkouts.length + returns.length + movements.length + maintenanceRecords.length}</div>
        <div class="text-white/80 text-sm">Total Operations</div>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <Card>
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8">
        {#each tabs as tab}
          <button
            on:click={() => activeTab = tab.id}
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          >
            <div class="flex items-center space-x-2">
              <span class="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </div>
          </button>
        {/each}
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      {#if loading}
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin h-8 w-8 border-b-2 border-green-600 rounded-full"></div>
        </div>
      {:else if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{error}</p>
        </div>
      {:else}
        <!-- Checkouts Tab -->
        {#if activeTab === 'checkouts'}
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Checkouts ({checkouts.length})</h2>
                <p class="text-secondary">Manage equipment checkouts and assignments</p>
              </div>
              <button
                on:click={openAddCheckoutModal}
                class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                New Checkout
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each checkouts as checkout}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{checkout.asset?.itemName || 'Unknown Asset'}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(checkout.status)}">
                      {checkout.status}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex justify-between">
                      <span>User:</span>
                      <span class="font-medium">{checkout.user?.name || checkout.userId}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Checkout Date:</span>
                      <span class="font-medium">{formatDate(checkout.checkoutDate)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Expected Return:</span>
                      <span class="font-medium">{formatDate(checkout.expectedReturnDate)}</span>
                    </div>
                    {#if checkout.notes}
                      <p class="text-sm">{checkout.notes}</p>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>

        <!-- Returns Tab -->
        {:else if activeTab === 'returns'}
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Returns ({returns.length})</h2>
                <p class="text-secondary">Process equipment returns and condition assessment</p>
              </div>
              <button
                on:click={openAddReturnModal}
                class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Process Return
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each returns as returnItem}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{returnItem.asset?.itemName || 'Unknown Asset'}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(returnItem.status)}">
                      {returnItem.status}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex justify-between">
                      <span>Returned By:</span>
                      <span class="font-medium">{returnItem.user?.name || returnItem.userId}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Return Date:</span>
                      <span class="font-medium">{formatDate(returnItem.returnDate)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Condition:</span>
                      <span class="font-medium capitalize">{returnItem.condition}</span>
                    </div>
                    {#if returnItem.notes}
                      <p class="text-sm">{returnItem.notes}</p>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>

        <!-- Movements Tab -->
        {:else if activeTab === 'movements'}
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Movements ({movements.length})</h2>
                <p class="text-secondary">Track equipment location changes and transfers</p>
              </div>
              <button
                on:click={openAddMovementModal}
                class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Record Movement
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each movements as movement}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{movement.asset?.itemName || 'Unknown Asset'}</h3>
                    <span class="text-sm text-gray-500">{formatDate(movement.movementDate)}</span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex justify-between">
                      <span>From:</span>
                      <span class="font-medium">{movement.fromLocation}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>To:</span>
                      <span class="font-medium">{movement.toLocation}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Reason:</span>
                      <span class="font-medium">{movement.reason}</span>
                    </div>
                    {#if movement.notes}
                      <p class="text-sm">{movement.notes}</p>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>

        <!-- Maintenance Tab -->
        {:else if activeTab === 'maintenance'}
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Maintenance ({maintenanceRecords.length})</h2>
                <p class="text-secondary">Schedule and track equipment maintenance</p>
              </div>
              <button
                on:click={openAddMaintenanceModal}
                class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Schedule Maintenance
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each maintenanceRecords as record}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{record.asset?.itemName || 'Unknown Asset'}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(record.status)}">
                      {record.status}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex justify-between">
                      <span>Type:</span>
                      <span class="font-medium">{record.type}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Scheduled:</span>
                      <span class="font-medium">{formatDate(record.scheduledDate)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Technician:</span>
                      <span class="font-medium">{record.technician || 'N/A'}</span>
                    </div>
                    {#if record.cost}
                      <div class="flex justify-between">
                        <span>Cost:</span>
                        <span class="font-medium">${record.cost}</span>
                      </div>
                    {/if}
                    {#if record.description}
                      <p class="text-sm">{record.description}</p>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </Card>
</div>

<!-- Add Checkout Modal -->
{#if showAddCheckoutModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">New Checkout</h3>
        <button 
          on:click={() => showAddCheckoutModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Asset ID *</label>
          <input 
            type="text" 
            bind:value={newCheckout.assetId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter asset ID"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
          <input 
            type="text" 
            bind:value={newCheckout.userId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter user ID"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
          <input 
            type="date" 
            bind:value={newCheckout.expectedReturnDate}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            bind:value={newCheckout.notes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Additional notes"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddCheckoutModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveCheckout}
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-150"
        >
          Create Checkout
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Add Return Modal -->
{#if showAddReturnModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Process Return</h3>
        <button 
          on:click={() => showAddReturnModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Checkout ID *</label>
          <input 
            type="text" 
            bind:value={newReturn.checkoutId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter checkout ID"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <select 
            bind:value={newReturn.condition}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {#each returnConditions as condition}
              <option value={condition.toLowerCase()}>{condition}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            bind:value={newReturn.notes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Return notes"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddReturnModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveReturn}
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-150"
        >
          Process Return
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Add Movement Modal -->
{#if showAddMovementModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Record Movement</h3>
        <button 
          on:click={() => showAddMovementModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Asset ID *</label>
          <input 
            type="text" 
            bind:value={newMovement.assetId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter asset ID"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">From Location</label>
          <input 
            type="text" 
            bind:value={newMovement.fromLocation}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Current location"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">To Location *</label>
          <input 
            type="text" 
            bind:value={newMovement.toLocation}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="New location"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input 
            type="text" 
            bind:value={newMovement.reason}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Reason for movement"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            bind:value={newMovement.notes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Additional notes"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddMovementModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveMovement}
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-150"
        >
          Record Movement
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Add Maintenance Modal -->
{#if showAddMaintenanceModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Schedule Maintenance</h3>
        <button 
          on:click={() => showAddMaintenanceModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Asset ID *</label>
          <input 
            type="text" 
            bind:value={newMaintenance.assetId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter asset ID"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
          <select 
            bind:value={newMaintenance.type}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            {#each maintenanceTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
          <input 
            type="date" 
            bind:value={newMaintenance.scheduledDate}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Technician</label>
          <input 
            type="text" 
            bind:value={newMaintenance.technician}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Technician name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
          <input 
            type="number" 
            bind:value={newMaintenance.cost}
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            bind:value={newMaintenance.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Maintenance description"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddMaintenanceModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveMaintenance}
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-150"
        >
          Schedule Maintenance
        </button>
      </div>
    </div>
  </div>
{/if} 