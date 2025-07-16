<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';

  // Tab management
  let activeTab = 'assets';
  const tabs = [
    { id: 'assets', name: 'Assets', icon: '📦', description: 'Manage equipment and inventory items' },
    { id: 'categories', name: 'Categories', icon: '🏷️', description: 'Organize equipment classifications' },
    { id: 'rooms', name: 'Rooms', icon: '🏢', description: 'Manage building locations and spaces' },
    { id: 'cable-routes', name: 'Cable Routes', icon: '🗺️', description: 'Manage cable infrastructure paths' },
    { id: 'finances', name: 'Finances', icon: '💰', description: 'Track financial records and budgets' }
  ];

  // Shared data
  let loading = true;
  let error = '';

  // Rooms data
  let rooms: any[] = [];
  let showAddRoomModal = false;
  let editingRoom: any = null;
  let newRoom = {
    name: '',
    description: '',
    building: '',
    floor: '',
    capacity: '',
    type: '',
    isActive: true
  };

  // Cable Routes data
  let cableRoutes: any[] = [];
  let showAddRouteModal = false;
  let editingRoute: any = null;
  let newRoute = {
    name: '',
    description: '',
    status: 'active'
  };

  // Categories data
  let categories: any[] = [];
  let showAddCategoryModal = false;
  let editingCategory: any = null;
  let newCategory = {
    name: '',
    description: '',
    color: '#3B82F6'
  };

  // Assets data
  let assets: any[] = [];
  let showAddAssetModal = false;
  let editingAsset: any = null;
  let newAsset = {
    itemName: '',
    quantity: 1,
    categoryId: '',
    modelBrand: '',
    serialNumbers: [] as string[],
    location: '',
    status: 'Available',
    purchaseDate: '',
    purchasePrice: '',
    notes: '',
    assigned: '',
    assetNumber: '',
    supplier: '',
    isCable: false,
    cableTypeId: '',
    cableLength: ''
  };

  let newSerialNumber = '';

  // Finances data
  let financialRecords: any[] = [];
  let showAddFinancialModal = false;
  let newFinancialRecord = {
    assetId: '',
    type: '',
    amount: '',
    description: '',
    date: '',
    category: ''
  };



  const roomTypes = [
    'Studio', 'Control Room', 'Equipment Room', 'Storage', 'Office', 
    'Conference Room', 'Lobby', 'Hallway', 'Utility', 'Other'
  ];

  const routeStatuses = ['active', 'inactive', 'maintenance', 'planned'];

  const assetStatuses = ['Available', 'In Use', 'Maintenance', 'Retired', 'Lost'];

  onMount(async () => {
    await loadAllData();
  });

  async function loadAllData() {
    loading = true;
    error = '';
    
    try {
      const [roomsRes, routesRes, categoriesRes, assetsRes, financesRes] = await Promise.all([
        fetch('/api/admin/rooms'),
        fetch('/api/cable-routes'),
        fetch('/api/categories'),
        fetch('/api/assets'),
        fetch('/api/admin/financial-records')
      ]);

      if (!roomsRes.ok) throw new Error('Failed to load rooms');
      if (!routesRes.ok) throw new Error('Failed to load cable routes');
      if (!categoriesRes.ok) throw new Error('Failed to load categories');
      if (!assetsRes.ok) throw new Error('Failed to load assets');
      if (!financesRes.ok) throw new Error('Failed to load financial records');

      rooms = await roomsRes.json();
      cableRoutes = await routesRes.json();
      categories = await categoriesRes.json();
      assets = await assetsRes.json();
      financialRecords = await financesRes.json();
    } catch (e) {
      console.error('Error loading data:', e);
      error = e instanceof Error ? e.message : 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  // Rooms functions
  function openAddRoomModal() {
    newRoom = {
      name: '',
      description: '',
      building: '',
      floor: '',
      capacity: '',
      type: '',
      isActive: true
    };
    showAddRoomModal = true;
  }

  async function saveRoom() {
    try {
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      });

      if (!response.ok) throw new Error('Failed to save room');
      
      showAddRoomModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving room:', e);
      error = e instanceof Error ? e.message : 'Failed to save room';
    }
  }

  async function deleteRoom(id: number) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const response = await fetch(`/api/admin/rooms/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete room');
      await loadAllData();
    } catch (e) {
      console.error('Error deleting room:', e);
      error = e instanceof Error ? e.message : 'Failed to delete room';
    }
  }

  // Cable Routes functions
  function openAddRouteModal() {
    newRoute = {
      name: '',
      description: '',
      status: 'active'
    };
    showAddRouteModal = true;
  }

  async function saveRoute() {
    try {
      const response = await fetch('/api/cable-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoute)
      });

      if (!response.ok) throw new Error('Failed to save route');
      
      showAddRouteModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving route:', e);
      error = e instanceof Error ? e.message : 'Failed to save route';
    }
  }

  async function deleteRoute(id: number) {
    if (!confirm('Are you sure you want to delete this route?')) return;
    
    try {
      const response = await fetch(`/api/cable-routes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete route');
      await loadAllData();
    } catch (e) {
      console.error('Error deleting route:', e);
      error = e instanceof Error ? e.message : 'Failed to delete route';
    }
  }

  // Categories functions
  function openAddCategoryModal() {
    newCategory = {
      name: '',
      description: '',
      color: '#3B82F6'
    };
    showAddCategoryModal = true;
  }

  async function saveCategory() {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (!response.ok) throw new Error('Failed to save category');
      
      showAddCategoryModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving category:', e);
      error = e instanceof Error ? e.message : 'Failed to save category';
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete category');
      await loadAllData();
    } catch (e) {
      console.error('Error deleting category:', e);
      error = e instanceof Error ? e.message : 'Failed to delete category';
    }
  }

  // Assets functions
  function openAddAssetModal() {
    newAsset = {
      itemName: '',
      quantity: 1,
      categoryId: '',
      modelBrand: '',
      serialNumbers: [],
      location: '',
      status: 'Available',
      purchaseDate: '',
      purchasePrice: '',
      notes: '',
      assigned: '',
      assetNumber: '',
      supplier: '',
      isCable: false,
      cableTypeId: '',
      cableLength: ''
    };
    newSerialNumber = '';
    showAddAssetModal = true;
  }

  function addSerialNumber() {
    if (newSerialNumber.trim()) {
      newAsset.serialNumbers = [...newAsset.serialNumbers, newSerialNumber.trim()];
      newSerialNumber = '';
    }
  }

  function removeSerialNumber(index: number) {
    newAsset.serialNumbers = newAsset.serialNumbers.filter((_, i) => i !== index);
  }

  async function saveAsset() {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      });

      if (!response.ok) throw new Error('Failed to save asset');
      
      showAddAssetModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving asset:', e);
      error = e instanceof Error ? e.message : 'Failed to save asset';
    }
  }

  async function deleteAsset(id: number) {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      const response = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete asset');
      await loadAllData();
    } catch (e) {
      console.error('Error deleting asset:', e);
      error = e instanceof Error ? e.message : 'Failed to delete asset';
    }
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'in use':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
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
  <title>Infrastructure Management - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Infrastructure Management</h1>
        <p class="text-white/80 mt-2 text-lg">Manage rooms, cable routes, categories, and assets</p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold">{rooms.length + cableRoutes.length + categories.length + assets.length}</div>
        <div class="text-white/80 text-sm">Total Items</div>
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
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
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
          <div class="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      {:else if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{error}</p>
        </div>
      {:else}
        <!-- Rooms Tab -->
        {#if activeTab === 'rooms'}
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Rooms ({rooms.length})</h2>
                <p class="text-gray-600">Manage building locations and spaces</p>
              </div>
              <button
                on:click={openAddRoomModal}
                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Room
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each rooms as room}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{room.name}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(room.isActive ? 'active' : 'inactive')}">
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <p>{room.description}</p>
                    <div class="flex justify-between">
                      <span>Building:</span>
                      <span class="font-medium">{room.building || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Floor:</span>
                      <span class="font-medium">{room.floor || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Type:</span>
                      <span class="font-medium">{room.type || 'N/A'}</span>
                    </div>
                  </div>
                  <div class="mt-4 flex justify-end">
                    <button
                      on:click={() => deleteRoom(room.id)}
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>

        <!-- Cable Routes Tab -->
        {:else if activeTab === 'cable-routes'}
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Cable Routes ({cableRoutes.length})</h2>
                <p class="text-gray-600">Manage cable infrastructure paths</p>
              </div>
              <button
                on:click={openAddRouteModal}
                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Route
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each cableRoutes as route}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{route.name}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(route.status)}">
                      {route.status}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <p>{route.description}</p>
                    <div class="flex justify-between">
                      <span>Segments:</span>
                      <span class="font-medium">{route.segments?.length || 0}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Created:</span>
                      <span class="font-medium">{formatDate(route.createdAt)}</span>
                    </div>
                  </div>
                  <div class="mt-4 flex justify-end space-x-2">
                    <a
                      href="/admin/cable-routes/{route.id}"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                    <button
                      on:click={() => deleteRoute(route.id)}
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>

        <!-- Categories Tab -->
        {:else if activeTab === 'categories'}
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Categories ({categories.length})</h2>
                <p class="text-gray-600">Organize equipment classifications</p>
              </div>
              <button
                on:click={openAddCategoryModal}
                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Category
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each categories as category}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <div class="w-4 h-4 rounded-full" style="background-color: {category.color}"></div>
                      <h3 class="font-semibold text-lg">{category.name}</h3>
                    </div>
                    <span class="text-sm text-gray-500">{category.assetCount || 0} assets</span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <p>{category.description}</p>
                  </div>
                  <div class="mt-4 flex justify-end">
                    <button
                      on:click={() => deleteCategory(category.id)}
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>

                 <!-- Assets Tab -->
         {:else if activeTab === 'assets'}
           <div class="space-y-6">
             <div class="flex justify-between items-center">
               <div>
                 <h2 class="text-xl font-semibold text-gray-900">Assets ({assets.length})</h2>
                 <p class="text-gray-600">Manage equipment and inventory items</p>
               </div>
               <button
                 on:click={openAddAssetModal}
                 class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
               >
                 <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                 </svg>
                 Add Asset
               </button>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {#each assets as asset}
                 <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                   <div class="flex items-center justify-between mb-3">
                     <h3 class="font-semibold text-lg">{asset.itemName}</h3>
                     <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(asset.status)}">
                       {asset.status}
                     </span>
                   </div>
                   <div class="space-y-2 text-sm text-gray-600">
                     <div class="flex justify-between">
                       <span>Category:</span>
                       <span class="font-medium">{asset.category?.name || 'N/A'}</span>
                     </div>
                     <div class="flex justify-between">
                       <span>Location:</span>
                       <span class="font-medium">{asset.location || 'N/A'}</span>
                     </div>
                     <div class="flex justify-between">
                       <span>Quantity:</span>
                       <span class="font-medium">{asset.quantity}</span>
                     </div>
                     <div class="flex justify-between">
                       <span>Serial:</span>
                       <span class="font-medium">{asset.serialNumbers?.length > 0 ? asset.serialNumbers[0].serialNumber : 'N/A'}</span>
                     </div>
                   </div>
                   <div class="mt-4 flex justify-end">
                     <button
                       on:click={() => deleteAsset(asset.id)}
                       class="text-red-600 hover:text-red-800 text-sm font-medium"
                     >
                       Delete
                     </button>
                   </div>
                 </div>
               {/each}
             </div>
           </div>

         <!-- Finances Tab -->
         {:else if activeTab === 'finances'}
           <div class="space-y-6">
             <div class="flex justify-between items-center">
               <div>
                 <h2 class="text-xl font-semibold text-gray-900">Financial Records ({financialRecords.length})</h2>
                 <p class="text-gray-600">Track financial transactions and budgets</p>
               </div>
               <button
                 on:click={() => showAddFinancialModal = true}
                 class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
               >
                 <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                 </svg>
                 Add Record
               </button>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {#each financialRecords as record}
                 <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                   <div class="flex items-center justify-between mb-3">
                     <h3 class="font-semibold text-lg">{record.type}</h3>
                     <span class="text-lg font-bold {record.amount > 0 ? 'text-green-600' : 'text-red-600'}">
                       ${Math.abs(record.amount)}
                     </span>
                   </div>
                   <div class="space-y-2 text-sm text-gray-600">
                     <p>{record.description}</p>
                     <div class="flex justify-between">
                       <span>Date:</span>
                       <span class="font-medium">{formatDate(record.date)}</span>
                     </div>
                     <div class="flex justify-between">
                       <span>Category:</span>
                       <span class="font-medium">{record.category}</span>
                     </div>
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

<!-- Add Room Modal -->
{#if showAddRoomModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Add New Room</h3>
        <button 
          on:click={() => showAddRoomModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
          <input 
            type="text" 
            bind:value={newRoom.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter room name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            bind:value={newRoom.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Room description"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Building</label>
            <input 
              type="text" 
              bind:value={newRoom.building}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Building name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Floor</label>
            <input 
              type="text" 
              bind:value={newRoom.floor}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Floor number"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input 
              type="number" 
              bind:value={newRoom.capacity}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Capacity"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              bind:value={newRoom.type}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              {#each roomTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="room-active" 
            bind:checked={newRoom.isActive}
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          >
          <label for="room-active" class="text-sm font-medium text-gray-700">Active</label>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddRoomModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveRoom}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150"
        >
          Save Room
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Add Route Modal -->
{#if showAddRouteModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Add New Cable Route</h3>
        <button 
          on:click={() => showAddRouteModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
          <input 
            type="text" 
            bind:value={newRoute.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter route name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            bind:value={newRoute.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Route description"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            bind:value={newRoute.status}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {#each routeStatuses as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddRouteModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveRoute}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150"
        >
          Save Route
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Add Category Modal -->
{#if showAddCategoryModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Add New Category</h3>
        <button 
          on:click={() => showAddCategoryModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
          <input 
            type="text" 
            bind:value={newCategory.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter category name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            bind:value={newCategory.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Category description"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input 
            type="color" 
            bind:value={newCategory.color}
            class="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddCategoryModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveCategory}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150"
        >
          Save Category
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Add Asset Modal -->
{#if showAddAssetModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Add New Asset</h3>
        <button 
          on:click={() => showAddAssetModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
          <input 
            type="text" 
            bind:value={newAsset.itemName}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter item name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select 
            bind:value={newAsset.categoryId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            {#each categories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Model/Brand</label>
          <input 
            type="text" 
            bind:value={newAsset.modelBrand}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Model or brand"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input 
            type="number" 
            bind:value={newAsset.quantity}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input 
            type="text" 
            bind:value={newAsset.location}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Storage location"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            bind:value={newAsset.status}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {#each assetStatuses as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input 
            type="date" 
            bind:value={newAsset.purchaseDate}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
          <input 
            type="number" 
            bind:value={newAsset.purchasePrice}
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Asset Number</label>
          <input 
            type="text" 
            bind:value={newAsset.assetNumber}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Asset number"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
          <input 
            type="text" 
            bind:value={newAsset.supplier}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Supplier name"
          />
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Serial Numbers</label>
        <div class="flex space-x-2 mb-2">
          <input 
            type="text" 
            bind:value={newSerialNumber}
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter serial number"
            on:keydown={(e) => e.key === 'Enter' && addSerialNumber()}
          />
          <button
            on:click={addSerialNumber}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        {#if newAsset.serialNumbers.length > 0}
          <div class="space-y-1">
            {#each newAsset.serialNumbers as serial, index}
              <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span class="text-sm">{serial}</span>
                <button
                  on:click={() => removeSerialNumber(index)}
                  class="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea 
          bind:value={newAsset.notes}
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Additional notes"
        ></textarea>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddAssetModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveAsset}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150"
        >
          Save Asset
        </button>
      </div>
    </div>
  </div>
{/if} 