<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';

  const kit = writable<any>(null);
  const assets = writable<any[]>([]);
  const loading = writable(true);

  async function load() {
    loading.set(true);
    const id = $page.params.id;
    const [kRes, aRes] = await Promise.all([
      fetch(`/api/kits/${id}`),
      fetch(`/api/kits/${id}/assets`)
    ]);
    kit.set(await kRes.json());
    assets.set(await aRes.json());
    loading.set(false);
  }

  onMount(load);

  async function addAsset() {
    const assetId = prompt('Asset ID to add');
    if (!assetId) return;
    await fetch(`/api/kits/${$page.params.id}/assets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId: Number(assetId) }) });
    await load();
  }

  async function removeAsset(assetId: number) {
    await fetch(`/api/kits/${$page.params.id}/assets/${assetId}`, { method: 'DELETE' });
    await load();
  }
</script>

{#if $loading}
  <div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full"></div></div>
{:else}
  <div class="p-4 max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Kit: {$kit.name}</h1>
    <p class="text-gray-600">Status: {$kit.status}</p>
    <div class="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div class="flex justify-between items-center mb-2">
        <h2 class="font-semibold text-lg">Assets</h2>
        <button on:click={addAsset} class="px-2 py-1 bg-purple-600 text-white rounded">Add</button>
      </div>
      <ul>
        {#each $assets as ka}
          <li class="flex justify-between py-1 border-b border-gray-100 last:border-0">
            <span>{ka.asset.itemName} (ID {ka.assetId})</span>
            <button on:click={() => removeAsset(ka.assetId)} class="text-red-600 text-sm">Remove</button>
          </li>
        {/each}
      </ul>
      {#if $assets.length === 0}
        <p class="text-sm text-gray-500">No assets in kit.</p>
      {/if}
    </div>
  </div>
{/if} 