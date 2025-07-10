<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { format } from 'date-fns';

  type Project = {
    id: number;
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    budget?: string;
  };

  const projects = writable<Project[]>([]);
  const loading = writable<boolean>(true);
  const error = writable<string>('');

  async function load() {
    loading.set(true);
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      projects.set(await res.json());
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Failed');
    } finally {
      loading.set(false);
    }
  }

  onMount(load);

  async function createProject() {
    const name = prompt('Project name');
    if (!name) return;
    const description = prompt('Description');
    const startDate = prompt('Start Date (YYYY-MM-DD)');
    await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description, startDate }) });
    await load();
  }

  async function deleteProject(id: number) {
    if (!confirm('Delete project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    await load();
  }
</script>

<div class="p-4 max-w-5xl mx-auto">
  <h1 class="text-2xl font-bold mb-4">Projects</h1>
  <button on:click={createProject} class="mb-4 px-4 py-2 bg-green-600 text-white rounded">New Project</button>

  {#if $loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if $error}
    <p class="text-red-600">{$error}</p>
  {:else}
    <div class="bg-card rounded-xl shadow-custom border border-card overflow-auto">
      <table class="min-w-full divide-y divide-card text-sm">
        <thead class="bg-tertiary">
          <tr>
            <th class="px-4 py-2 text-left font-medium text-gray-600">Name</th>
            <th class="px-4 py-2 text-left font-medium text-gray-600">Status</th>
            <th class="px-4 py-2 text-left font-medium text-gray-600">Start</th>
            <th class="px-4 py-2 text-left font-medium text-gray-600">End</th>
            <th class="px-4 py-2 text-left font-medium text-gray-600">Budget</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each $projects as proj}
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-2 whitespace-nowrap">{proj.name}</td>
              <td class="px-4 py-2 whitespace-nowrap capitalize">{proj.status}</td>
              <td class="px-4 py-2 whitespace-nowrap">{proj.startDate ? format(new Date(proj.startDate), 'yyyy-MM-dd') : '-'}</td>
              <td class="px-4 py-2 whitespace-nowrap">{proj.endDate ? format(new Date(proj.endDate), 'yyyy-MM-dd') : '-'}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right">{proj.budget ?? '-'}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right">
                <button on:click={() => deleteProject(proj.id)} class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div> 