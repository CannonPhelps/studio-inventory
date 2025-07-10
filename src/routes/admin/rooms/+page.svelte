<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';

  let rooms: any[] = [];
  let loading = true;
  let error = '';
  let showCreateModal = false;
  let showEditModal = false;
  let selectedRoom: any = null;
  let filters = {
    building: '',
    floor: '',
    type: '',
    isActive: true
  };

  // Form data
  let formData = {
    name: '',
    description: '',
    building: '',
    floor: '',
    capacity: '',
    type: ''
  };

  onMount(async () => {
    await loadRooms();
  });

  async function loadRooms() {
    try {
      loading = true;
      const response = await fetch('/api/admin/rooms');
      if (!response.ok) throw new Error('Failed to load rooms');
      
      rooms = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load rooms';
    } finally {
      loading = false;
    }
  }

  function openCreateModal() {
    formData = {
      name: '',
      description: '',
      building: '',
      floor: '',
      capacity: '',
      type: ''
    };
    showCreateModal = true;
  }

  function openEditModal(room: any) {
    selectedRoom = room;
    formData = {
      name: room.name,
      description: room.description || '',
      building: room.building || '',
      floor: room.floor || '',
      capacity: room.capacity?.toString() || '',
      type: room.type || ''
    };
    showEditModal = true;
  }

  async function createRoom() {
    try {
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create room');

      showCreateModal = false;
      await loadRooms();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create room';
    }
  }

  async function updateRoom() {
    try {
      const response = await fetch(`/api/admin/rooms/${selectedRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update room');

      showEditModal = false;
      await loadRooms();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update room';
    }
  }

  async function deleteRoom(id: number) {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete room');

      await loadRooms();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete room';
    }
  }

  function getUtilizationColor(utilization: number) {
    if (utilization >= 80) return 'text-error bg-error-light';
    if (utilization >= 60) return 'text-warning bg-warning-light';
    return 'text-success bg-success-light';
  }

  function getStatusColor(isActive: boolean) {
    return isActive ? 'text-success bg-success-light' : 'text-tertiary bg-tertiary';
  }
</script>

<svelte:head>
  <title>Room Management - Studio Inventory</title>
</svelte:head>

<div class="min-h-screen bg-primary">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-primary">Room Management</h1>
          <p class="text-secondary mt-2">Track and manage locations and areas</p>
        </div>
        <button
          on:click={openCreateModal}
          class="bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
        >
          Add Room
        </button>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    {:else if error}
      <div class="bg-error-light border border-accent-error rounded-lg p-4 mb-6">
        <p class="text-error">{error}</p>
        <button 
          on:click={loadRooms}
          class="mt-2 text-accent-error hover:text-error underline"
        >
          Try again
        </button>
      </div>
    {:else}
      <!-- Filters -->
      <div class="bg-card rounded-lg shadow-custom border border-card p-6 mb-6">
        <h2 class="text-lg font-semibold text-primary mb-4">Filters</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="building" class="block text-sm font-medium text-secondary mb-1">Building</label>
            <input
              id="building"
              bind:value={filters.building}
              placeholder="Filter by building"
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            />
          </div>

          <div>
            <label for="floor" class="block text-sm font-medium text-secondary mb-1">Floor</label>
            <input
              id="floor"
              bind:value={filters.floor}
              placeholder="Filter by floor"
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-secondary mb-1">Type</label>
            <select
              id="type"
              bind:value={filters.type}
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            >
              <option value="">All Types</option>
              <option value="studio">Studio</option>
              <option value="office">Office</option>
              <option value="storage">Storage</option>
              <option value="workshop">Workshop</option>
              <option value="meeting">Meeting Room</option>
            </select>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-secondary mb-1">Status</label>
            <select
              id="status"
              bind:value={filters.isActive}
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Rooms Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each rooms.filter(room => 
          (!filters.building || room.building?.includes(filters.building)) &&
          (!filters.floor || room.floor?.includes(filters.floor)) &&
          (!filters.type || room.type === filters.type) &&
          room.isActive === filters.isActive
        ) as room}
          <div class="bg-card rounded-lg shadow-custom border border-card p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-primary">{room.name}</h3>
                {#if room.building || room.floor}
                  <p class="text-sm text-secondary">
                    {room.building}{room.building && room.floor ? ' - ' : ''}{room.floor}
                  </p>
                {/if}
              </div>
              <span class="px-2 py-1 text-xs font-medium rounded-full {getStatusColor(room.isActive)}">
                {room.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {#if room.description}
              <p class="text-sm text-secondary mb-4">{room.description}</p>
            {/if}

            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-secondary">Total Assets:</span>
                <span class="font-medium text-primary">{room.totalAssets}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-secondary">Available:</span>
                <span class="font-medium text-success">{room.availableAssets}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-secondary">Checked Out:</span>
                <span class="font-medium text-accent">{room.checkedOutAssets}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-secondary">Total Value:</span>
                <span class="font-medium text-primary">${room.totalValue?.toLocaleString() || '0'}</span>
              </div>
              {#if room.capacity}
                <div class="flex justify-between text-sm">
                  <span class="text-secondary">Utilization:</span>
                  <span class="px-2 py-1 text-xs font-medium rounded-full {getUtilizationColor(room.utilization)}">
                    {room.utilization}%
                  </span>
                </div>
              {/if}
            </div>

            <div class="flex space-x-2">
              <button
                on:click={() => openEditModal(room)}
                class="flex-1 bg-tertiary text-secondary px-3 py-2 rounded-md text-sm hover:bg-tertiary-200 focus:outline-none focus:ring-2 focus:ring-tertiary-500 transition-colors"
              >
                Edit
              </button>
              <button
                on:click={() => deleteRoom(room.id)}
                class="flex-1 bg-error-light text-error px-3 py-2 rounded-md text-sm hover:bg-error-light/80 focus:outline-none focus:ring-2 focus:ring-error transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>

      {#if rooms.length === 0}
        <div class="text-center py-12">
          <p class="text-tertiary">No rooms found. Create your first room to get started.</p>
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Create Room Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-card rounded-lg p-6 w-full max-w-md border border-card shadow-custom-lg">
      <h3 class="text-lg font-semibold text-primary mb-4">Create New Room</h3>
      
      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-secondary mb-1">Room Name *</label>
          <input
            id="name"
            bind:value={formData.name}
            type="text"
            required
            class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-secondary mb-1">Description</label>
          <textarea
            id="description"
            bind:value={formData.description}
            rows="3"
            class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="building" class="block text-sm font-medium text-secondary mb-1">Building</label>
            <input
              id="building"
              bind:value={formData.building}
              type="text"
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            />
          </div>

          <div>
            <label for="floor" class="block text-sm font-medium text-secondary mb-1">Floor</label>
            <input
              id="floor"
              bind:value={formData.floor}
              type="text"
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="capacity" class="block text-sm font-medium text-secondary mb-1">Capacity</label>
            <input
              id="capacity"
              bind:value={formData.capacity}
              type="number"
              min="1"
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-secondary mb-1">Type</label>
            <select
              id="type"
              bind:value={formData.type}
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            >
              <option value="">Select Type</option>
              <option value="studio">Studio</option>
              <option value="office">Office</option>
              <option value="storage">Storage</option>
              <option value="workshop">Workshop</option>
              <option value="meeting">Meeting Room</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          on:click={() => showCreateModal = false}
          class="px-4 py-2 text-sm font-medium text-secondary bg-tertiary rounded-md hover:bg-tertiary-200 focus:outline-none focus:ring-2 focus:ring-tertiary-500 transition-colors"
        >
          Cancel
        </button>
        <button
          on:click={createRoom}
          disabled={!formData.name}
          class="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create Room
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Room Modal -->
{#if showEditModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-card rounded-lg p-6 w-full max-w-md border border-card shadow-custom-lg">
      <h3 class="text-lg font-semibold text-primary mb-4">Edit Room</h3>
      
      <div class="space-y-4">
        <div>
          <label for="edit-name" class="block text-sm font-medium text-secondary mb-1">Room Name *</label>
          <input
            id="edit-name"
            bind:value={formData.name}
            type="text"
            required
            class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
          />
        </div>

        <div>
          <label for="edit-description" class="block text-sm font-medium text-secondary mb-1">Description</label>
          <textarea
            id="edit-description"
            bind:value={formData.description}
            rows="3"
            class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="edit-building" class="block text-sm font-medium text-secondary mb-1">Building</label>
            <input
              id="edit-building"
              bind:value={formData.building}
              type="text"
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            />
          </div>

          <div>
            <label for="edit-floor" class="block text-sm font-medium text-secondary mb-1">Floor</label>
            <input
              id="edit-floor"
              bind:value={formData.floor}
              type="text"
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="edit-capacity" class="block text-sm font-medium text-secondary mb-1">Capacity</label>
            <input
              id="edit-capacity"
              bind:value={formData.capacity}
              type="number"
              min="1"
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            />
          </div>

          <div>
            <label for="edit-type" class="block text-sm font-medium text-secondary mb-1">Type</label>
            <select
              id="edit-type"
              bind:value={formData.type}
              class="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-input text-input"
            >
              <option value="">Select Type</option>
              <option value="studio">Studio</option>
              <option value="office">Office</option>
              <option value="storage">Storage</option>
              <option value="workshop">Workshop</option>
              <option value="meeting">Meeting Room</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          on:click={() => showEditModal = false}
          class="px-4 py-2 text-sm font-medium text-secondary bg-tertiary rounded-md hover:bg-tertiary-200 focus:outline-none focus:ring-2 focus:ring-tertiary-500 transition-colors"
        >
          Cancel
        </button>
        <button
          on:click={updateRoom}
          disabled={!formData.name}
          class="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Update Room
        </button>
      </div>
    </div>
  </div>
{/if} 