<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';

  const route = writable<any>(null);
  const segments = writable<any[]>([]);
  const loading = writable(true);

  async function load() {
    loading.set(true);
    const id = $page.params.id;
    const [rRes, sRes] = await Promise.all([
      fetch(`/api/cable-routes/${id}`),
      fetch(`/api/cable-routes/${id}/segments`)
    ]);
    route.set(await rRes.json());
    segments.set(await sRes.json());
    loading.set(false);
  }

  onMount(load);

  async function addSegment() {
    const order = prompt('Order index (number)');
    if (!order) return;
    const fromRoomId = prompt('From Room ID');
    const toRoomId = prompt('To Room ID');
    const cableAssetId = prompt('Cable Asset ID (optional)');
    await fetch(`/api/cable-routes/${$page.params.id}/segments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: Number(order), fromRoomId: Number(fromRoomId), toRoomId: Number(toRoomId), cableAssetId: cableAssetId ? Number(cableAssetId) : undefined }) });
    await load();
  }

  async function deleteSegment(id: number) {
    await fetch(`/api/cable-routes/${$page.params.id}/segments/${id}`, { method: 'DELETE' });
    await load();
  }
</script>

{#if $loading}
  <div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full"></div></div>
{:else}
  <div class="p-4 max-w-6xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Route: {$route.name}</h1>
    <p class="text-gray-600">Status: {$route.status}</p>
    <p>{$route.description}</p>

    <div class="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div class="flex justify-between items-center mb-2">
        <h2 class="font-semibold text-lg">Segments</h2>
        <button on:click={addSegment} class="px-2 py-1 bg-teal-600 text-white rounded">Add Segment</button>
      </div>
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50"><tr><th class="px-2 py-1 text-left">#</th><th class="px-2 py-1 text-left">From</th><th class="px-2 py-1 text-left">To</th><th class="px-2 py-1 text-left">Cable</th><th></th></tr></thead>
        <tbody class="divide-y divide-gray-100">
          {#each $segments as seg}
            <tr>
              <td class="px-2 py-1">{seg.order}</td>
              <td class="px-2 py-1">{seg.fromRoom?.name ?? seg.fromRoomId}</td>
              <td class="px-2 py-1">{seg.toRoom?.name ?? seg.toRoomId}</td>
              <td class="px-2 py-1">{seg.cable ? seg.cable.itemName : '-'}</td>
              <td class="px-2 py-1 text-right"><button on:click={() => deleteSegment(seg.id)} class="text-red-600 text-xs">Delete</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if $segments.length === 0}
        <p class="text-sm text-gray-500">No segments added.</p>
      {/if}
    </div>
  </div>
{/if} 