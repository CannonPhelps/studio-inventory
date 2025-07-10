<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';

  type Task = {
    id: number;
    name: string;
    type: string;
    schedule?: string;
    event?: string;
    status: string;
    lastRun?: string;
  };

  const tasks = writable<Task[]>([]);

  async function load() {
    const res = await fetch('/api/automated-tasks');
    tasks.set(await res.json());
  }

  onMount(load);

  async function create() {
    const name = prompt('Task name');
    if (!name) return;
    const type = prompt('Type (cron|interval)');
    const schedule = prompt('Schedule (cron expr or ms)');
    await fetch('/api/automated-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type, schedule }) });
    load();
  }

  async function pause(task: Task) {
    await fetch(`/api/automated-tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: task.status === 'active' ? 'paused' : 'active' }) });
    load();
  }

  async function remove(task: Task) {
    if (confirm('Delete task?')) {
      await fetch(`/api/automated-tasks/${task.id}`, { method: 'DELETE' });
      load();
    }
  }
</script>

<div class="p-4 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-4">Automated Tasks</h1>
  <button on:click={create} class="mb-4 px-4 py-2 bg-blue-500 text-white rounded">New Task</button>

  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
        <th class="px-6 py-3" />
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200" >
      {#each $tasks as task}
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">{task.name}</td>
          <td class="px-6 py-4 whitespace-nowrap">{task.type}</td>
          <td class="px-6 py-4 whitespace-nowrap">{task.schedule}</td>
          <td class="px-6 py-4 whitespace-nowrap">{task.status}</td>
          <td class="px-6 py-4 whitespace-nowrap">{task.lastRun ? new Date(task.lastRun).toLocaleString() : '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button on:click={() => pause(task)} class="text-indigo-600 hover:text-indigo-900 mr-2">{task.status === 'active' ? 'Pause' : 'Resume'}</button>
            <button on:click={() => remove(task)} class="text-red-600 hover:text-red-900">Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  /* Tailwind used via classes */
</style> 