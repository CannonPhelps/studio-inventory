<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  type Route = { id: number; name: string; status: string; description?: string };
  const routes = writable<Route[]>([]);
  const loading = writable(true);
  const error = writable('');

  async function load() {
    loading.set(true);
    try {
      const res = await fetch('/api/cable-routes');
      if (!res.ok) throw new Error('Failed to load routes');
      routes.set(await res.json());
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Failed');
    } finally {
      loading.set(false);
    }
  }

  onMount(load);

  async function createRoute() {
    const name = prompt('Route name');
    if (!name) return;
    const description = prompt('Description');
    await fetch('/api/cable-routes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) });
    await load();
  }

  async function deleteRoute(id: number) {
    if (!confirm('Delete route?')) return;
    await fetch(`/api/cable-routes/${id}`, { method: 'DELETE' });
    await load();
  }
</script>

<div class="p-4 max-w-6xl mx-auto">
  <h1 class="text-2xl font-bold mb-4">Cable Routes</h1>
  <button on:click={createRoute} class="mb-4 px-4 py-2 bg-teal-600 text-white rounded">New Route</button>

  {#if $loading}
    <div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full"></div></div>
  {:else if $error}
    <p class="text-red-600">{$error}</p>
  {:else}
    <table class="min-w-full divide-y divide-gray-200 text-sm">
      <thead class="bg-gray-50">
        <tr><th class="px-4 py-2 text-left font-medium text-gray-600">Name</th><th class="px-4 py-2 text-left">Status</th><th class="px-4 py-2"></th></tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each $routes as rt}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-2 whitespace-nowrap"><a href={`/admin/cable-routes/${rt.id}`} class="text-teal-600 hover:underline">{rt.name}</a></td>
            <td class="px-4 py-2 capitalize">{rt.status}</td>
            <td class="px-4 py-2 text-right"><button on:click={() => deleteRoute(rt.id)} class="text-red-600 hover:text-red-900">Delete</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if $routes.length === 0}
      <p class="text-center py-8 text-gray-500">No routes created.</p>
    {/if}
  {/if}
</div> 