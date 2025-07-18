<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  type Communication = {
    id: number;
    type: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
  };

  const communications = writable<Communication[]>([]);
  const loading = writable(true);
  const error = writable('');

  async function load() {
    loading.set(true);
    try {
      const res = await fetch('/api/admin/communications');
      if (!res.ok) throw new Error('Failed to load communications');
      communications.set(await res.json());
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Failed');
    } finally {
      loading.set(false);
    }
  }

  onMount(load);

  async function createCommunication() {
    const type = prompt('Type (email|sms|notification)');
    if (!type) return;
    const subject = prompt('Subject');
    const message = prompt('Message');
    await fetch('/api/admin/communications', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ type, subject, message }) 
    });
    await load();
  }

  async function deleteCommunication(id: number) {
    if (!confirm('Delete communication?')) return;
    await fetch(`/api/admin/communications/${id}`, { method: 'DELETE' });
    await load();
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  function getTypeColor(type: string) {
    switch (type.toLowerCase()) {
      case 'email': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'sms': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'notification': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }
</script>

<svelte:head>
  <title>Communications - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->

  <div class="bg-gradient-to-r from-cyan-700 to-blue-800 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Communications</h1>
        <p class="text-white/80 mt-2 text-lg">Manage system notifications and user communications</p>
      </div>
      <div class="text-right flex space-x-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{$communications.length}</div>
          <div class="text-white/90 text-sm">Total Messages</div>
        </div>
        <div class="text-center">
                      <Button on:click={createCommunication} className="flex items-center gap-2 bg-white text-cyan-700 hover:bg-white/90">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Communication
          </Button>
        </div>
      </div>
    </div>
  </div>

  {#if $loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  {:else if $error}
    <Card className="border-accent-error">
      <p class="text-accent-error">{$error}</p>
    </Card>
  {:else if $communications.length === 0}
    <div class="text-center py-12">
      <div class="text-tertiary text-4xl mb-4">📧</div>
      <h3 class="text-lg font-medium text-primary mb-2">No communications yet</h3>
      <p class="text-secondary mb-4">Create your first communication to start messaging users.</p>
      <Button on:click={createCommunication}>New Communication</Button>
    </div>
  {:else}
    <!-- Communications Table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-card">
          <thead class="bg-tertiary">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Subject</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-card bg-card">
            {#each $communications as comm}
              <tr class="hover:bg-tertiary transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getTypeColor(comm.type)}">
                    {comm.type}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-primary">{comm.subject}</div>
                    <div class="text-sm text-secondary truncate max-w-xs">{comm.message}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(comm.status)}">
                    {comm.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {new Date(comm.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button variant="danger" size="sm" on:click={() => deleteCommunication(comm.id)}>Delete</Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card>
  {/if}
</div> 