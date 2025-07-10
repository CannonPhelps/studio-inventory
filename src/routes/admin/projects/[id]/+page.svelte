<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  import { format } from 'date-fns';

  const project = writable<any>(null);
  const assets = writable<any[]>([]);
  const tasks = writable<any[]>([]);
  const loading = writable(true);

  async function load() {
    loading.set(true);
    const id = $page.params.id;
    const [pRes, aRes, tRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/projects/${id}/assets`),
      fetch(`/api/projects/${id}/tasks`)
    ]);
    project.set(await pRes.json());
    assets.set(await aRes.json());
    tasks.set(await tRes.json());
    loading.set(false);
  }

  onMount(load);

  // Asset assignment
  async function addAsset() {
    const assetId = prompt('Asset ID to assign');
    if (!assetId) return;
    await fetch(`/api/projects/${$page.params.id}/assets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId: Number(assetId) }) });
    await load();
  }

  async function removeAsset(assetId: number) {
    await fetch(`/api/projects/${$page.params.id}/assets/${assetId}`, { method: 'DELETE' });
    await load();
  }

  // Task management
  async function addTask() {
    const name = prompt('Task name');
    if (!name) return;
    const dueDate = prompt('Due date YYYY-MM-DD');
    await fetch(`/api/projects/${$page.params.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, dueDate }) });
    await load();
  }

  async function toggleTaskStatus(task: any) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await fetch(`/api/projects/${$page.params.id}/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, completedAt: newStatus === 'completed' ? new Date() : null }) });
    await load();
  }

  async function deleteTask(taskId: number) {
    await fetch(`/api/projects/${$page.params.id}/tasks/${taskId}`, { method: 'DELETE' });
    await load();
  }
</script>

{#if $loading}
  <div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
{:else}
  <div class="p-4 max-w-6xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Project: {$project.name}</h1>
    <p class="text-gray-600">Status: {$project.status}</p>
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Assets -->
      <div class="bg-card rounded-xl shadow-custom border border-card p-4">
        <div class="flex justify-between items-center mb-2">
          <h2 class="font-semibold text-lg">Assets</h2>
          <button on:click={addAsset} class="px-2 py-1 bg-blue-600 text-white rounded">Add</button>
        </div>
        <ul>
          {#each $assets as pa}
            <li class="flex justify-between py-1 border-b border-gray-100 last:border-0">
              <span>{pa.asset.itemName} (ID {pa.assetId})</span>
              <button on:click={() => removeAsset(pa.assetId)} class="text-red-600 text-sm">Remove</button>
            </li>
          {/each}
        </ul>
        {#if $assets.length === 0}
          <p class="text-sm text-gray-500">No assets assigned.</p>
        {/if}
      </div>
      <!-- Tasks -->
      <div class="bg-card rounded-xl shadow-custom border border-card p-4">
        <div class="flex justify-between items-center mb-2">
          <h2 class="font-semibold text-lg">Tasks</h2>
          <button on:click={addTask} class="px-2 py-1 bg-green-600 text-white rounded">Add</button>
        </div>
        <ul>
          {#each $tasks as t}
            <li class="flex justify-between py-1 border-b border-gray-100 last:border-0">
              <div>
                <span class="{t.status === 'completed' ? 'line-through' : ''}">{t.name}</span>
                {#if t.dueDate}
                  <span class="text-xs text-gray-500 ml-2">(due {format(new Date(t.dueDate), 'yyyy-MM-dd')})</span>
                {/if}
              </div>
              <div class="space-x-2 text-sm">
                <button on:click={() => toggleTaskStatus(t)} class="text-blue-600">{t.status === 'completed' ? 'Undo' : 'Done'}</button>
                <button on:click={() => deleteTask(t.id)} class="text-red-600">Delete</button>
              </div>
            </li>
          {/each}
        </ul>
        {#if $tasks.length === 0}
          <p class="text-sm text-gray-500">No tasks yet.</p>
        {/if}
      </div>
    </div>
  </div>
{/if} 