<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';


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
  let filteredAssets: any[] = [];
  let assetSearchQuery = '';
  let assetStatusFilter = 'all';
  let assetCategoryFilter = 'all';
  let showAddAssetModal = false;
  let showEditAssetModal = false;
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
      filteredAssets = assets; // Initialize filtered assets
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

  // Edit Asset functions
  function openEditAssetModal(asset: any) {
    editingAsset = {
      ...asset,
      serialNumbers: asset.serialNumbers?.map((sn: any) => sn.serialNumber || sn) || [],
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : ''
    };
    showEditAssetModal = true;
  }

  function addEditSerialNumber() {
    if (newSerialNumber.trim()) {
      editingAsset.serialNumbers = [...editingAsset.serialNumbers, newSerialNumber.trim()];
      newSerialNumber = '';
    }
  }

  function removeEditSerialNumber(index: number) {
    editingAsset.serialNumbers = editingAsset.serialNumbers.filter((_: string, i: number) => i !== index);
  }

  async function updateAsset() {
    try {
      const response = await fetch(`/api/assets/${editingAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAsset)
      });

      if (!response.ok) throw new Error('Failed to update asset');
      
      showEditAssetModal = false;
      editingAsset = null;
      await loadAllData();
    } catch (e) {
      console.error('Error updating asset:', e);
      error = e instanceof Error ? e.message : 'Failed to update asset';
    }
  }

  function cancelEdit() {
    showEditAssetModal = false;
    editingAsset = null;
    newSerialNumber = '';
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
      case 'in use':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Asset filtering function
  function filterAssets() {
    filteredAssets = assets.filter(asset => {
      const searchLower = assetSearchQuery.toLowerCase();
      const matchesSearch = 
        asset.itemName.toLowerCase().includes(searchLower) ||
        (asset.serialNumbers && asset.serialNumbers.some((sn: any) => 
          (sn.serialNumber || sn).toLowerCase().includes(searchLower)
        )) ||
        (asset.category?.name && asset.category.name.toLowerCase().includes(searchLower)) ||
        (asset.location && asset.location.toLowerCase().includes(searchLower)) ||
        (asset.modelBrand && asset.modelBrand.toLowerCase().includes(searchLower)) ||
        (asset.assetNumber && asset.assetNumber.toLowerCase().includes(searchLower)) ||
        (asset.supplier && asset.supplier.toLowerCase().includes(searchLower));
      
      const matchesStatus = assetStatusFilter === 'all' || asset.status.toLowerCase() === assetStatusFilter.toLowerCase();
      const matchesCategory = assetCategoryFilter === 'all' || asset.category?.name.toLowerCase() === assetCategoryFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }
</script>

<svelte:head>
  <title>Infrastructure Management - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->

  <div class="bg-gradient-to-r from-violet-700 to-purple-800 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Infrastructure Management</h1>
        <p class="text-white/80 mt-2 text-lg">Manage rooms, cable routes, categories, and assets</p>
      </div>
      <div class="text-right flex space-x-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{rooms.length}</div>
          <div class="text-white/90 text-sm">Rooms</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{cableRoutes.length}</div>
          <div class="text-white/90 text-sm">Cable Routes</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{categories.length}</div>
          <div class="text-white/90 text-sm">Categories</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{assets.length}</div>
          <div class="text-white/90 text-sm">Assets</div>
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
                <h2 class="text-xl font-semibold text-primary">Rooms ({rooms.length})</h2>
                <p class="text-secondary">Manage building locations and spaces</p>
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
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{room.name}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(room.isActive ? 'active' : 'inactive')}">
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>{room.description}</p>
                    <div class="flex justify-between">
                      <span>Building:</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{room.building || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Floor:</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{room.floor || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Type:</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{room.type || 'N/A'}</span>
                    </div>
                  </div>
                  <div class="mt-4 flex justify-end">
                    <button
                      on:click={() => deleteRoom(room.id)}
                      class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
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
                <h2 class="text-xl font-semibold text-primary">Cable Routes ({cableRoutes.length})</h2>
                <p class="text-secondary">Manage cable infrastructure paths</p>
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
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{route.name}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(route.status)}">
                      {route.status}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>{route.description}</p>
                    <div class="flex justify-between">
                      <span>Segments:</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{route.segments?.length || 0}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Created:</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{formatDate(route.createdAt)}</span>
                    </div>
                  </div>
                  <div class="mt-4 flex justify-end space-x-2">
                    <a
                      href="/admin/cable-routes/{route.id}"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View
                    </a>
                    <button
                      on:click={() => deleteRoute(route.id)}
                      class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
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
                <h2 class="text-xl font-semibold text-primary">Categories ({categories.length})</h2>
                <p class="text-secondary">Organize equipment classifications</p>
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
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <div class="w-4 h-4 rounded-full" style="background-color: {category.color}"></div>
                      <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{category.name}</h3>
                    </div>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{category.assetCount || 0} assets</span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>{category.description}</p>
                  </div>
                  <div class="mt-4 flex justify-end">
                    <button
                      on:click={() => deleteCategory(category.id)}
                      class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
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
                 <h2 class="text-xl font-semibold text-primary">Assets ({filteredAssets.length} of {assets.length})</h2>
                 <p class="text-secondary">Manage equipment and inventory items</p>
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

             <!-- Search and Filters -->
             <Card>
               <div class="flex flex-col space-y-4">
                 <!-- Search -->
                 <div class="w-full">
                   <div class="relative">
                     <input
                       type="text"
                       bind:value={assetSearchQuery}
                       on:input={filterAssets}
                       placeholder="Search by name, serial number, category, location, model, asset number, or supplier..."
                       class="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                     />
                     <svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                   </div>
                 </div>

                 <!-- Filters -->
                 <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                   <select
                     bind:value={assetStatusFilter}
                     on:change={filterAssets}
                     class="flex-1 px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                   >
                     <option value="all">All Status</option>
                     {#each assetStatuses as status}
                       <option value={status}>{status}</option>
                     {/each}
                   </select>

                   <select
                     bind:value={assetCategoryFilter}
                     on:change={filterAssets}
                     class="flex-1 px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                   >
                     <option value="all">All Categories</option>
                     {#each categories as category}
                       <option value={category.name}>{category.name}</option>
                     {/each}
                   </select>
                 </div>
               </div>
             </Card>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {#each filteredAssets as asset}
                 <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                   <!-- Header -->
                   <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                     <div class="flex items-start justify-between">
                       <div class="flex-1 min-w-0">
                         <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">{asset.itemName}</h3>
                         <p class="text-sm text-gray-500 dark:text-gray-400">{asset.category?.name || 'Uncategorized'}</p>
                       </div>
                       <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(asset.status)} ml-3 flex-shrink-0">
                       {asset.status}
                     </span>
                   </div>
                     </div>

                   <!-- Content -->
                   <div class="px-6 py-4 space-y-3">
                     <div class="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <span class="text-gray-500 dark:text-gray-400 font-medium">Location:</span>
                         <p class="text-gray-900 dark:text-gray-100 mt-1">{asset.location || 'Not specified'}</p>
                     </div>
                       <div>
                         <span class="text-gray-500 dark:text-gray-400 font-medium">Quantity:</span>
                         <p class="text-gray-900 dark:text-gray-100 mt-1">{asset.quantity}</p>
                     </div>
                       <div>
                         <span class="text-gray-500 dark:text-gray-400 font-medium">Serial Number:</span>
                         <p class="text-gray-900 dark:text-gray-100 mt-1">{asset.serialNumbers?.length > 0 ? (asset.serialNumbers[0].serialNumber || asset.serialNumbers[0]) : 'Not specified'}</p>
                     </div>
                       <div>
                         <span class="text-gray-500 dark:text-gray-400 font-medium">Asset #:</span>
                         <p class="text-gray-900 dark:text-gray-100 mt-1">{asset.assetNumber || 'Not specified'}</p>
                   </div>
                       <div>
                         <span class="text-gray-500 dark:text-gray-400 font-medium">Model/Brand:</span>
                         <p class="text-gray-900 dark:text-gray-100 mt-1">{asset.modelBrand || 'Not specified'}</p>
                       </div>
                       <div>
                         <span class="text-gray-500 dark:text-gray-400 font-medium">Supplier:</span>
                         <p class="text-gray-900 dark:text-gray-100 mt-1">{asset.supplier || 'Not specified'}</p>
                       </div>
                       <div>
                         <span class="text-gray-500 dark:text-gray-400 font-medium">Purchase Date:</span>
                         <p class="text-gray-900 dark:text-gray-100 mt-1">{asset.purchaseDate ? formatDate(asset.purchaseDate) : 'Not specified'}</p>
                       </div>
                       <div>
                         <span class="text-gray-500 dark:text-gray-400 font-medium">Assigned To:</span>
                         <p class="text-gray-900 dark:text-gray-100 mt-1">{asset.assigned || 'Not assigned'}</p>
                       </div>
                     </div>

                     {#if asset.notes}
                       <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                         <span class="text-gray-500 dark:text-gray-400 font-medium text-sm">Notes:</span>
                         <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">{asset.notes}</p>
                       </div>
                     {/if}
                   </div>

                   <!-- Actions -->
                   <div class="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex justify-end space-x-2">
                     <button
                       on:click={() => openEditAssetModal(asset)}
                       class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                     >
                       <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                       </svg>
                       Edit
                     </button>
                     <button
                       on:click={() => deleteAsset(asset.id)}
                       class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                     >
                       <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                       </svg>
                       Delete
                     </button>
                   </div>
                 </div>
               {/each}
             </div>

             {#if filteredAssets.length === 0 && assets.length > 0}
               <div class="text-center py-12">
                 <div class="text-6xl mb-4">🔍</div>
                 <h3 class="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
                 <p class="text-gray-500 mb-4">Try adjusting your search or filters</p>
                 <button
                   on:click={() => {
                     assetSearchQuery = '';
                     assetStatusFilter = 'all';
                     assetCategoryFilter = 'all';
                     filterAssets();
                   }}
                   class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                 >
                   Clear Filters
                 </button>
               </div>
             {/if}
           </div>

         <!-- Finances Tab -->
         {:else if activeTab === 'finances'}
           <div class="space-y-6">
             <div class="flex justify-between items-center">
               <div>
                 <h2 class="text-xl font-semibold text-primary">Financial Records ({financialRecords.length})</h2>
                 <p class="text-secondary">Track financial transactions and budgets</p>
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
                 <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                   <div class="flex items-center justify-between mb-3">
                     <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{record.type}</h3>
                     <span class="text-lg font-bold {record.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                       ${Math.abs(record.amount)}
                     </span>
                   </div>
                   <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                     <p>{record.description}</p>
                     <div class="flex justify-between">
                       <span>Date:</span>
                       <span class="font-medium text-gray-900 dark:text-gray-100">{formatDate(record.date)}</span>
                     </div>
                     <div class="flex justify-between">
                       <span>Category:</span>
                       <span class="font-medium text-gray-900 dark:text-gray-100">{record.category}</span>
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

<!-- Edit Asset Modal -->
{#if showEditAssetModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Edit Asset</h3>
        <button 
          on:click={cancelEdit}
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
            bind:value={editingAsset.itemName}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter item name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select 
            bind:value={editingAsset.categoryId}
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
            bind:value={editingAsset.modelBrand}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Model or brand"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input 
            type="number" 
            bind:value={editingAsset.quantity}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input 
            type="text" 
            bind:value={editingAsset.location}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Storage location"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            bind:value={editingAsset.status}
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
            bind:value={editingAsset.purchaseDate}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
          <input 
            type="number" 
            bind:value={editingAsset.purchasePrice}
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Asset Number</label>
          <input 
            type="text" 
            bind:value={editingAsset.assetNumber}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Asset number"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
          <input 
            type="text" 
            bind:value={editingAsset.supplier}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Supplier name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <input 
            type="text" 
            bind:value={editingAsset.assigned}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Assigned person"
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
            on:keydown={(e) => e.key === 'Enter' && addEditSerialNumber()}
          />
          <button
            on:click={addEditSerialNumber}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        {#if editingAsset.serialNumbers.length > 0}
          <div class="space-y-1">
            {#each editingAsset.serialNumbers as serial, index}
              <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span class="text-sm">{serial}</span>
                <button
                  on:click={() => removeEditSerialNumber(index)}
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
          bind:value={editingAsset.notes}
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Additional notes"
        ></textarea>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={cancelEdit}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={updateAsset}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150"
        >
          Update Asset
        </button>
      </div>
    </div>
  </div>
{/if}