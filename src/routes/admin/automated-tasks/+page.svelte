<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

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
  const loading = writable(true);
  const error = writable('');

  async function load() {
    loading.set(true);
    try {
      const res = await fetch('/api/automated-tasks');
      if (!res.ok) throw new Error('Failed to load tasks');
      tasks.set(await res.json());
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Failed');
    } finally {
      loading.set(false);
    }
  }

  onMount(load);

  async function create() {
    const name = prompt('Task name');
    if (!name) return;
    const type = prompt('Type (cron|interval)');
    const schedule = prompt('Schedule (cron expr or ms)');
    await fetch('/api/automated-tasks', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ name, type, schedule }) 
    });
    await load();
  }

  async function pause(task: Task) {
    await fetch(`/api/automated-tasks/${task.id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ status: task.status === 'active' ? 'paused' : 'active' }) 
    });
    await load();
  }

  async function remove(task: Task) {
    if (confirm('Delete task?')) {
      await fetch(`/api/automated-tasks/${task.id}`, { method: 'DELETE' });
      await load();
    }
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  function getTypeColor(type: string) {
    switch (type.toLowerCase()) {
      case 'cron': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'interval': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }
</script>

<svelte:head>
  <title>Automated Tasks - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <SectionHeader 
    title="Automated Tasks" 
    subtitle="Manage scheduled and automated system tasks" 
    gradient="from-accent to-accent-secondary">
    <Button on:click={create} className="flex items-center gap-2">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New Task
    </Button>
  </SectionHeader>

  {#if $loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  {:else if $error}
    <Card className="border-accent-error">
      <p class="text-accent-error">{$error}</p>
    </Card>
  {:else if $tasks.length === 0}
    <div class="text-center py-12">
      <div class="text-tertiary text-4xl mb-4">⚙️</div>
      <h3 class="text-lg font-medium text-primary mb-2">No automated tasks yet</h3>
      <p class="text-secondary mb-4">Create your first automated task to start automating workflows.</p>
      <Button on:click={create}>New Task</Button>
    </div>
  {:else}
    <!-- Tasks Table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-card">
          <thead class="bg-tertiary">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Schedule</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Last Run</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-card bg-card">
            {#each $tasks as task}
              <tr class="hover:bg-tertiary transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-primary">{task.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getTypeColor(task.type)}">
                    {task.type}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {task.schedule || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(task.status)}">
                    {task.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {task.lastRun ? new Date(task.lastRun).toLocaleString() : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <Button 
                      variant={task.status === 'active' ? 'warning' : 'success'} 
                      size="sm" 
                      on:click={() => pause(task)}
                    >
                      {task.status === 'active' ? 'Pause' : 'Resume'}
                    </Button>
                    <Button variant="danger" size="sm" on:click={() => remove(task)}>Delete</Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card>
  {/if}
</div>

<style>
  /* Tailwind used via classes */
</style> 