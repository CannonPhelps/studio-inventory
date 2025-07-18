<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';


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
  let assets: any[] = [];
  let showAddMaintenanceModal = false;
  let showMaintenanceLogModal = false;
  let showUpdateModal = false;
  let selectedMaintenance: any = null;
  let selectedAsset: any = null;
  let maintenanceLog: any = null;
  
  let newMaintenance = {
    assetId: '',
    notes: '',
    performedBy: '',
    cost: '',
    maintenanceType: 'REPAIR',
    scheduledDate: '',
    priority: 'MEDIUM'
  };
  
  let updateForm = {
    status: 'SCHEDULED',
    notes: '',
    updatedBy: ''
  };
  
  const maintenanceTypes = [
    { value: 'REPAIR', label: 'Repair', icon: '🔧' },
    { value: 'PREVENTIVE', label: 'Preventive', icon: '🛡️' },
    { value: 'INSPECTION', label: 'Inspection', icon: '🔍' },
    { value: 'CALIBRATION', label: 'Calibration', icon: '⚖️' },
    { value: 'UPGRADE', label: 'Upgrade', icon: '⬆️' },
    { value: 'CLEANING', label: 'Cleaning', icon: '🧹' }
  ];
  
  const maintenanceStatuses = [
    { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];
  
  const priorities = [
    { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];
  const returnConditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

  onMount(async () => {
    await loadAllData();
  });

  async function loadAllData() {
    loading = true;
    error = '';
    
    try {
      const [checkoutsRes, returnsRes, movementsRes, maintenanceRes, assetsRes] = await Promise.all([
        fetch('/api/checkouts'),
        fetch('/api/returns'),
        fetch('/api/movements'),
        fetch('/api/maintenance'),
        fetch('/api/assets')
      ]);

      if (!checkoutsRes.ok) throw new Error('Failed to load checkouts');
      if (!returnsRes.ok) throw new Error('Failed to load returns');
      if (!movementsRes.ok) throw new Error('Failed to load movements');
      if (!maintenanceRes.ok) throw new Error('Failed to load maintenance');
      if (!assetsRes.ok) throw new Error('Failed to load assets');

      checkouts = await checkoutsRes.json();
      returns = await returnsRes.json();
      movements = await movementsRes.json();
      maintenanceRecords = await maintenanceRes.json();
      assets = await assetsRes.json();
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
      notes: '',
      performedBy: '',
      cost: '',
      maintenanceType: 'REPAIR',
      scheduledDate: '',
      priority: 'MEDIUM'
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

  async function openMaintenanceLog(asset: any) {
    selectedAsset = asset;
    try {
      const response = await fetch(`/api/assets/${asset.id}/maintenance-log`);
      if (response.ok) {
        maintenanceLog = await response.json();
        showMaintenanceLogModal = true;
      }
    } catch (e) {
      console.error('Error loading maintenance log:', e);
    }
  }

  function openUpdateModal(maintenance: any) {
    selectedMaintenance = maintenance;
    updateForm = {
      status: maintenance.status || 'SCHEDULED',
      notes: '',
      updatedBy: ''
    };
    showUpdateModal = true;
  }

  async function saveUpdate() {
    if (!selectedMaintenance) return;
    
    try {
      const response = await fetch(`/api/maintenance/${selectedMaintenance.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm)
      });

      if (!response.ok) throw new Error('Failed to update maintenance');
      
      showUpdateModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error updating maintenance:', e);
      error = e instanceof Error ? e.message : 'Failed to update maintenance';
    }
  }

  function getStatusColor(status: string) {
    const statusObj = maintenanceStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  }

  function getPriorityColor(priority: string) {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'bg-gray-100 text-gray-800';
  }

  function getGeneralStatusColor(status: string) {
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

  <div class="bg-gradient-to-r from-green-700 to-emerald-800 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Operations Management</h1>
        <p class="text-white/80 mt-2 text-lg">Manage checkouts, returns, movements, and maintenance</p>
      </div>
      <div class="text-right flex space-x-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{checkouts.length}</div>
          <div class="text-white/90 text-sm">Checkouts</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{returns.length}</div>
          <div class="text-white/90 text-sm">Returns</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{movements.length}</div>
          <div class="text-white/90 text-sm">Movements</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{maintenanceRecords.length}</div>
          <div class="text-white/90 text-sm">Maintenance</div>
        </div>
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
            <!-- Header with Stats -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div class="flex justify-between items-center mb-4">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900">Maintenance Management</h2>
                  <p class="text-gray-600 mt-1">Track and manage equipment maintenance activities</p>
                </div>
                <button
                  on:click={openAddMaintenanceModal}
                  class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Record Maintenance
                </button>
              </div>
              
              <!-- Stats Cards -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg p-4 border border-blue-200">
                  <div class="flex items-center">
                    <div class="p-2 bg-blue-100 rounded-lg">
                      <span class="text-2xl">🔧</span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-600">Total Records</p>
                      <p class="text-2xl font-bold text-gray-900">{maintenanceRecords.length}</p>
                    </div>
                  </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 border border-green-200">
                  <div class="flex items-center">
                    <div class="p-2 bg-green-100 rounded-lg">
                      <span class="text-2xl">✅</span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-600">This Month</p>
                      <p class="text-2xl font-bold text-gray-900">
                        {maintenanceRecords.filter(r => {
                          const date = new Date(r.performedAt);
                          const now = new Date();
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 border border-yellow-200">
                  <div class="flex items-center">
                    <div class="p-2 bg-yellow-100 rounded-lg">
                      <span class="text-2xl">💰</span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-600">Total Cost</p>
                      <p class="text-2xl font-bold text-gray-900">
                        ${maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 border border-purple-200">
                  <div class="flex items-center">
                    <div class="p-2 bg-purple-100 rounded-lg">
                      <span class="text-2xl">📊</span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-600">Avg Cost</p>
                      <p class="text-2xl font-bold text-gray-900">
                        ${maintenanceRecords.length > 0 ? (maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0) / maintenanceRecords.length).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Maintenance Records -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
              <div class="p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Recent Maintenance Records</h3>
                <p class="text-gray-600 mt-1">Latest maintenance activities and their details</p>
              </div>
              
              <div class="p-6">
                {#if maintenanceRecords.length === 0}
                  <div class="text-center py-12">
                    <div class="text-6xl mb-4">🔧</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No maintenance records</h3>
                    <p class="text-gray-600 mb-6">Start tracking maintenance activities for your equipment</p>
                    <button
                      on:click={openAddMaintenanceModal}
                      class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Record First Maintenance
                    </button>
                  </div>
                {:else}
                  <div class="space-y-4">
                    {#each maintenanceRecords as record}
                      <div class="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                        <div class="flex items-start justify-between mb-4">
                          <div class="flex items-center space-x-3">
                            <div class="p-2 bg-blue-100 rounded-lg">
                              <span class="text-xl">🔧</span>
                            </div>
                            <div>
                              <h4 class="text-lg font-semibold text-gray-900">{record.asset?.itemName || 'Unknown Asset'}</h4>
                              <p class="text-sm text-gray-600">{record.asset?.category?.name || 'Uncategorized'}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="text-sm text-gray-500">{formatDate(record.performedAt)}</div>
                            {#if record.cost}
                              <div class="text-lg font-bold text-green-600">${record.cost}</div>
                            {/if}
                          </div>
                        </div>
                        
                        <!-- Status and Priority Badges -->
                        <div class="flex items-center space-x-3 mb-4">
                          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusColor(record.status || 'SCHEDULED')}">
                            {maintenanceStatuses.find(s => s.value === (record.status || 'SCHEDULED'))?.label || 'Scheduled'}
                          </span>
                          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getPriorityColor(record.priority || 'MEDIUM')}">
                            {priorities.find(p => p.value === (record.priority || 'MEDIUM'))?.label || 'Medium'}
                          </span>
                          {#if record.maintenanceType}
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              {maintenanceTypes.find(t => t.value === record.maintenanceType)?.label || record.maintenanceType}
                            </span>
                          {/if}
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div class="bg-white rounded-lg p-3 border border-gray-200">
                            <div class="text-sm text-gray-600">Performed By</div>
                            <div class="font-medium text-gray-900">{record.performedBy || 'Not specified'}</div>
                          </div>
                          
                          <div class="bg-white rounded-lg p-3 border border-gray-200">
                            <div class="text-sm text-gray-600">Asset ID</div>
                            <div class="font-medium text-gray-900">#{record.assetId}</div>
                          </div>
                          
                          <div class="bg-white rounded-lg p-3 border border-gray-200">
                            <div class="text-sm text-gray-600">Record ID</div>
                            <div class="font-medium text-gray-900">#{record.id}</div>
                          </div>
                          
                          <div class="bg-white rounded-lg p-3 border border-gray-200">
                            <div class="text-sm text-gray-600">Scheduled Date</div>
                            <div class="font-medium text-gray-900">{record.scheduledDate ? formatDate(record.scheduledDate) : 'Not scheduled'}</div>
                          </div>
                        </div>
                        
                        {#if record.notes}
                          <div class="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                            <div class="text-sm font-medium text-gray-700 mb-2">Maintenance Notes</div>
                            <p class="text-gray-600 leading-relaxed">{record.notes}</p>
                          </div>
                        {/if}
                        
                        <!-- Action Buttons -->
                        <div class="flex items-center space-x-3">
                          <button
                            on:click={() => openUpdateModal(record)}
                            class="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Update Progress
                          </button>
                          
                          <button
                            on:click={() => openMaintenanceLog(record.asset)}
                            class="inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            View Log
                          </button>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
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

<!-- Update Maintenance Modal -->
{#if showUpdateModal && selectedMaintenance}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Update Maintenance Progress</h3>
            <p class="text-gray-600 mt-1">{selectedMaintenance.asset?.itemName}</p>
          </div>
          <button 
            on:click={() => showUpdateModal = false}
            class="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select 
            bind:value={updateForm.status}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {#each maintenanceStatuses as status}
              <option value={status.value}>{status.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Updated By</label>
          <input 
            type="text" 
            bind:value={updateForm.updatedBy}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Progress Notes</label>
          <textarea 
            bind:value={updateForm.notes}
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe the progress made, issues encountered, or completion details..."
          ></textarea>
        </div>
      </div>

      <div class="p-6 border-t border-gray-200">
        <div class="flex justify-end gap-3">
          <button 
            on:click={() => showUpdateModal = false}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            on:click={saveUpdate}
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            Update Progress
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Maintenance Log Modal -->
{#if showMaintenanceLogModal && maintenanceLog}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Maintenance Log</h3>
            <p class="text-gray-600 mt-1">{maintenanceLog.asset?.itemName} - Complete Maintenance History</p>
          </div>
          <button 
            on:click={() => showMaintenanceLogModal = false}
            class="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Asset Summary -->
        <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div class="text-sm text-gray-600">Total Records</div>
              <div class="text-lg font-bold text-gray-900">{maintenanceLog.totalRecords}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Total Cost</div>
              <div class="text-lg font-bold text-green-600">${maintenanceLog.totalCost.toFixed(2)}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Category</div>
              <div class="text-lg font-bold text-gray-900">{maintenanceLog.asset?.category?.name || 'Uncategorized'}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Current Status</div>
              <div class="text-lg font-bold text-gray-900">{maintenanceLog.asset?.status}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6">
        {#if maintenanceLog.maintenanceRecords.length === 0}
          <div class="text-center py-12">
            <div class="text-6xl mb-4">📋</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No maintenance records</h3>
            <p class="text-gray-600">This asset has no maintenance history yet.</p>
          </div>
        {:else}
          <div class="space-y-6">
            {#each maintenanceLog.maintenanceRecords as record}
              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <div class="flex items-center space-x-3 mb-2">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusColor(record.status || 'SCHEDULED')}">
                        {maintenanceStatuses.find(s => s.value === (record.status || 'SCHEDULED'))?.label || 'Scheduled'}
                      </span>
                      {#if record.maintenanceType}
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {maintenanceTypes.find(t => t.value === record.maintenanceType)?.label || record.maintenanceType}
                        </span>
                      {/if}
                      {#if record.priority}
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getPriorityColor(record.priority)}">
                          {priorities.find(p => p.value === record.priority)?.label || record.priority}
                        </span>
                      {/if}
                    </div>
                    <div class="text-sm text-gray-500">{formatDate(record.performedAt)}</div>
                  </div>
                  {#if record.cost}
                    <div class="text-right">
                      <div class="text-lg font-bold text-green-600">${record.cost}</div>
                    </div>
                  {/if}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <div class="text-sm text-gray-600">Performed By</div>
                    <div class="font-medium text-gray-900">{record.performedBy || 'Not specified'}</div>
                  </div>
                  
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <div class="text-sm text-gray-600">Record ID</div>
                    <div class="font-medium text-gray-900">#{record.id}</div>
                  </div>
                  
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <div class="text-sm text-gray-600">Scheduled Date</div>
                    <div class="font-medium text-gray-900">{record.scheduledDate ? formatDate(record.scheduledDate) : 'Not scheduled'}</div>
                  </div>
                </div>
                
                {#if record.notes}
                  <div class="bg-white rounded-lg p-4 border border-gray-200">
                    <div class="text-sm font-medium text-gray-700 mb-2">Maintenance Notes</div>
                    <p class="text-gray-600 leading-relaxed">{record.notes}</p>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
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
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Record Maintenance Activity</h3>
            <p class="text-gray-600 mt-1">Document maintenance work performed on equipment</p>
          </div>
          <button 
            on:click={() => showAddMaintenanceModal = false}
            class="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6 space-y-6">
        <!-- Asset Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Asset *</label>
          <select 
            bind:value={newMaintenance.assetId}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Choose an asset...</option>
            {#each assets as asset}
              <option value={asset.id}>
                #{asset.id} - {asset.itemName} ({asset.category?.name || 'Uncategorized'})
              </option>
            {/each}
          </select>
          {#if newMaintenance.assetId}
            {@const selectedAsset = assets.find(a => a.id == newMaintenance.assetId)}
            {#if selectedAsset}
              <div class="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <span class="text-lg">📦</span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{selectedAsset.itemName}</div>
                    <div class="text-sm text-gray-600">
                      Category: {selectedAsset.category?.name || 'Uncategorized'} | 
                      Status: <span class="font-medium">{selectedAsset.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          {/if}
        </div>

        <!-- Maintenance Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {#each maintenanceTypes as type}
              <label class="relative cursor-pointer">
                <input 
                  type="radio" 
                  bind:group={newMaintenance.maintenanceType} 
                  value={type.value}
                  class="sr-only"
                />
                <div class="p-4 border-2 rounded-lg text-center transition-all duration-200 {newMaintenance.maintenanceType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
                  <div class="text-2xl mb-2">{type.icon}</div>
                  <div class="text-sm font-medium text-gray-900">{type.label}</div>
                </div>
              </label>
            {/each}
          </div>
        </div>

        <!-- Priority and Scheduled Date -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div class="grid grid-cols-2 gap-2">
              {#each priorities as priority}
                <label class="relative cursor-pointer">
                  <input 
                    type="radio" 
                    bind:group={newMaintenance.priority} 
                    value={priority.value}
                    class="sr-only"
                  />
                  <div class="p-3 border-2 rounded-lg text-center transition-all duration-200 {newMaintenance.priority === priority.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
                    <div class="text-sm font-medium text-gray-900">{priority.label}</div>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
            <input 
              type="date" 
              bind:value={newMaintenance.scheduledDate}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Performed By and Cost -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Performed By</label>
            <input 
              type="text" 
              bind:value={newMaintenance.performedBy}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Technician or staff name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cost (USD)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input 
                type="number" 
                bind:value={newMaintenance.cost}
                step="0.01"
                min="0"
                class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Maintenance Notes</label>
          <textarea 
            bind:value={newMaintenance.notes}
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe the maintenance work performed, issues found, parts replaced, etc..."
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">Be detailed to help with future maintenance planning</p>
        </div>
      </div>

      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
        <div class="flex justify-end gap-3">
          <button 
            on:click={() => showAddMaintenanceModal = false}
            class="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            on:click={saveMaintenance}
            class="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Record Maintenance
          </button>
        </div>
      </div>
    </div>
  </div>
{/if} 