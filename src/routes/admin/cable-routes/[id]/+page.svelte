<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';

  const route = writable<any>(null);
  const segments = writable<any[]>([]);
  const loading = writable(true);
  const showAddModal = writable(false);
  const showDeleteModal = writable(false);
  const selectedSegment = writable<any>(null);
  const rooms = writable<any[]>([]);
  const cableAssets = writable<any[]>([]);

  // Form data for new segment
  const newSegment = writable({
    order: '',
    fromRoomId: '',
    toRoomId: '',
    cableAssetId: ''
  });

  async function load() {
    loading.set(true);
    try {
      const id = $page.params.id;
      const [rRes, sRes, roomsRes, assetsRes] = await Promise.all([
        fetch(`/api/cable-routes/${id}`),
        fetch(`/api/cable-routes/${id}/segments`),
        fetch('/api/admin/rooms'),
        fetch('/api/assets')
      ]);

      if (!rRes.ok || !sRes.ok || !roomsRes.ok || !assetsRes.ok) {
        throw new Error('Failed to load data');
      }

      const routeData = await rRes.json();
      const segmentsData = await sRes.json();
      const roomsData = await roomsRes.json();
      const assetsData = await assetsRes.json();
      
      route.set(routeData);
      segments.set(segmentsData);
      rooms.set(roomsData);
      // Filter assets to only show cables
      const cableAssetsData = assetsData.filter((asset: any) => asset.isCable);
      cableAssets.set(cableAssetsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load route data');
    } finally {
      loading.set(false);
    }
  }

  onMount(load);

  function openAddModal() {
    newSegment.set({
      order: '',
      fromRoomId: '',
      toRoomId: '',
      cableAssetId: ''
    });
    showAddModal.set(true);
  }

  function closeAddModal() {
    showAddModal.set(false);
  }

  function openDeleteModal(segment: any) {
    selectedSegment.set(segment);
    showDeleteModal.set(true);
  }

  function closeDeleteModal() {
    showDeleteModal.set(false);
    selectedSegment.set(null);
  }

  async function addSegment() {
    try {
      const segmentData = $newSegment;
      
      if (!segmentData.order || !segmentData.fromRoomId || !segmentData.toRoomId) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch(`/api/cable-routes/${$page.params.id}/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: Number(segmentData.order),
          fromRoomId: Number(segmentData.fromRoomId),
          toRoomId: Number(segmentData.toRoomId),
          cableAssetId: segmentData.cableAssetId ? Number(segmentData.cableAssetId) : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add segment');
      }

      closeAddModal();
      await load();
    } catch (error) {
      console.error('Error adding segment:', error);
      alert('Failed to add segment');
    }
  }

  async function deleteSegment() {
    try {
      const response = await fetch(`/api/cable-routes/${$page.params.id}/segments/${$selectedSegment.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete segment');
      }

      closeDeleteModal();
      await load();
    } catch (error) {
      console.error('Error deleting segment:', error);
      alert('Failed to delete segment');
    }
  }

  function getRoomName(roomId: number) {
    const room = $rooms.find(r => r.id === roomId);
    return room ? room.name : `Room ${roomId}`;
  }

  function getCableName(assetId: number) {
    const asset = $cableAssets.find(a => a.id === assetId);
    return asset ? asset.itemName : `Asset ${assetId}`;
  }
</script>

{#if $loading}
  <div class="flex items-center justify-center py-12">
    <div class="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full"></div>
  </div>
{:else}
  <div class="space-y-6">
      <!-- Route Header -->
      {#if $route}
        <div class="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{$route.name}</h1>
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span class="px-3 py-1 bg-teal-100 text-teal-800 rounded-full font-medium">
              {$route.status}
            </span>
            <span class="text-gray-500">•</span>
            <span>{$segments.length} segments</span>
          </div>
          {#if $route.description}
            <p class="mt-3 text-gray-700">{$route.description}</p>
          {/if}
        </div>
      {/if}

      <!-- Segments Section -->
      <Card>
        <SectionHeader title="Route Segments" subtitle="Manage the cable path segments">
          <button 
            on:click={openAddModal}
            class="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Segment
          </button>
        </SectionHeader>

        {#if $segments.length === 0}
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No segments yet</h3>
            <p class="text-gray-500 mb-4">Add your first segment to start building the cable route</p>
            <button 
              on:click={openAddModal}
              class="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add First Segment
            </button>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Room</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Room</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cable Asset</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each $segments as segment}
                  <tr class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {segment.order}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getRoomName(segment.fromRoomId)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getRoomName(segment.toRoomId)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {#if segment.cableAssetId}
                        <span class="text-teal-600 font-medium">{getCableName(segment.cableAssetId)}</span>
                      {:else}
                        <span class="text-gray-400">-</span>
                      {/if}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        on:click={() => openDeleteModal(segment)}
                        class="text-red-600 hover:text-red-900 transition-colors duration-150"
                      >
                        Delete
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
  {/if}

  <!-- Add Segment Modal -->
  {#if $showAddModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Add New Segment</h3>
          <button 
            on:click={closeAddModal}
            class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Order Index *</label>
            <input 
              type="number" 
              bind:value={$newSegment.order}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter order number"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Room *</label>
            <select 
              bind:value={$newSegment.fromRoomId}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select from room</option>
              {#each $rooms as room}
                <option value={room.id}>{room.name}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To Room *</label>
            <select 
              bind:value={$newSegment.toRoomId}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select to room</option>
              {#each $rooms as room}
                <option value={room.id}>{room.name}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cable Asset (Optional)</label>
            <select 
              bind:value={$newSegment.cableAssetId}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select cable asset (optional)</option>
              {#each $cableAssets as asset}
                <option value={asset.id}>{asset.itemName}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button 
            on:click={closeAddModal}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
          >
            Cancel
          </button>
          <button 
            on:click={addSegment}
            class="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors duration-150"
          >
            Add Segment
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if $showDeleteModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-semibold text-gray-900">Delete Segment</h3>
          </div>
        </div>

        <p class="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this segment? This action cannot be undone.
        </p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="text-sm">
            <div class="flex justify-between mb-1">
              <span class="text-gray-500">Order:</span>
              <span class="font-medium">{$selectedSegment.order}</span>
            </div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-500">From:</span>
              <span class="font-medium">{getRoomName($selectedSegment.fromRoomId)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">To:</span>
              <span class="font-medium">{getRoomName($selectedSegment.toRoomId)}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button 
            on:click={closeDeleteModal}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
          >
            Cancel
          </button>
          <button 
            on:click={deleteSegment}
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-150"
          >
            Delete Segment
          </button>
        </div>
      </div>
    </div>
  {/if}