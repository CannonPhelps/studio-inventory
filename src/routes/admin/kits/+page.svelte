<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  type Kit = {
    id: number;
    name: string;
    description?: string;
    status: string;
  };

  const kits = writable<Kit[]>([]);
  const loading = writable(true);
  const error = writable('');

  async function load() {
    loading.set(true);
    try {
      const res = await fetch('/api/kits');
      if (!res.ok) throw new Error('Failed to load kits');
      kits.set(await res.json());
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Failed');
    } finally {
      loading.set(false);
    }
  }

  onMount(load);

  async function createKit() {
    const name = prompt('Kit name');
    if (!name) return;
    const description = prompt('Description');
    await fetch('/api/kits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) });
    await load();
  }

  async function deleteKit(id: number) {
    if (!confirm('Delete kit?')) return;
    await fetch(`/api/kits/${id}`, { method: 'DELETE' });
    await load();
  }
</script>

<div class="p-4 max-w-5xl mx-auto">
  <h1 class="text-2xl font-bold mb-4">Kits</h1>
  <button on:click={createKit} class="mb-4 px-4 py-2 bg-purple-600 text-white rounded">New Kit</button>

  {#if $loading}
    <div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full"></div></div>
  {:else if $error}
    <p class="text-red-600">{$error}</p>
  {:else}
    <table class="min-w-full divide-y divide-gray-200 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-2 text-left font-medium text-gray-600">Name</th>
          <th class="px-4 py-2 text-left font-medium text-gray-600">Status</th>
          <th class="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each $kits as kit}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-2 whitespace-nowrap"><a href={`/admin/kits/${kit.id}`} class="text-blue-600 hover:underline">{kit.name}</a></td>
            <td class="px-4 py-2 whitespace-nowrap capitalize">{kit.status}</td>
            <td class="px-4 py-2 whitespace-nowrap text-right"><button on:click={() => deleteKit(kit.id)} class="text-red-600 hover:text-red-900">Delete</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if $kits.length === 0}
      <p class="text-center py-8 text-gray-500">No kits created.</p>
    {/if}
  {/if}
</div> 