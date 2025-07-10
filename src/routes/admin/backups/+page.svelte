<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';

  interface BackupMetadata {
    id: string;
    timestamp: string;
    version: string;
    tables: string[];
    recordCount: number;
    size: number;
    checksum: string;
    encrypted: boolean;
    description?: string;
  }

  interface BackupStats {
    totalBackups: number;
    totalSize: number;
    oldestBackup: string | null;
    newestBackup: string | null;
    averageSize: number;
  }

  let backups: BackupMetadata[] = [];
  let stats: BackupStats | null = null;
  let loading = true;
  let error = '';
  let creatingBackup = false;
  let restoreModal = false;
  let selectedBackup: BackupMetadata | null = null;
  let restoreOptions = {
    dryRun: true,
    skipAuditLogs: true,
    tables: [] as string[]
  };

  async function loadBackups() {
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/api/admin/backups');
      
      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }

      const data = await response.json();
      backups = data.backups;
      stats = data.stats;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }

  async function createBackup() {
    creatingBackup = true;
    error = '';
    
    try {
      const description = prompt('Enter backup description (optional):');
      
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      await loadBackups();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create backup';
    } finally {
      creatingBackup = false;
    }
  }

  async function deleteBackup(backupId: string) {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backups/${backupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete backup');
      }

      await loadBackups();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete backup';
    }
  }

  function openRestoreModal(backup: BackupMetadata) {
    selectedBackup = backup;
    restoreModal = true;
    restoreOptions = {
      dryRun: true,
      skipAuditLogs: true,
      tables: backup.tables
    };
  }

  async function restoreBackup() {
    if (!selectedBackup) return;

    try {
      const response = await fetch(`/api/admin/backups/${selectedBackup.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'restore',
          options: restoreOptions
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Restore ${restoreOptions.dryRun ? 'dry run' : 'operation'} completed: ${result.message}`);
        if (!restoreOptions.dryRun) {
          // Reload the page after successful restore
          window.location.reload();
        }
      } else {
        alert(`Restore failed: ${result.message}`);
      }
      
      restoreModal = false;
      selectedBackup = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to restore backup';
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onMount(() => {
    loadBackups();
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Backup Management</h1>
      <p class="text-gray-600">Create, manage, and restore database backups</p>
    </div>
    <button
      on:click={createBackup}
      disabled={creatingBackup}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {creatingBackup ? 'Creating...' : 'Create Backup'}
    </button>
  </div>

  <!-- Stats Cards -->
  {#if stats}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💾</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Backups</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalBackups}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📊</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Size</p>
            <p class="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📅</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Latest Backup</p>
            <p class="text-sm font-bold text-gray-900">
              {stats.newestBackup ? format(new Date(stats.newestBackup), 'MMM dd, yyyy') : 'None'}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📏</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Average Size</p>
            <p class="text-2xl font-bold text-gray-900">{formatFileSize(stats.averageSize)}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Error Message -->
  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-800">{error}</p>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else}
    <!-- Backups Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Available Backups</h2>
      </div>
      
      {#if backups.length === 0}
        <div class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">💾</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No backups found</h3>
          <p class="text-gray-600">Create your first backup to get started</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tables</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each backups as backup}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(backup.timestamp), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {backup.description || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {backup.recordCount.toLocaleString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFileSize(backup.size)}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {backup.tables.length} tables
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <a
                        href={`/api/admin/backups/${backup.id}/download`}
                        class="text-green-600 hover:text-green-900"
                      >
                        Download
                      </a>
                      <a
                        href={`/api/admin/backups/${backup.id}/download?plain=true`}
                        class="text-orange-600 hover:text-orange-900"
                      >
                        Raw JSON
                      </a>
                      <button
                        on:click={() => openRestoreModal(backup)}
                        class="text-blue-600 hover:text-blue-900"
                      >
                        Restore
                      </button>
                      <button
                        on:click={() => deleteBackup(backup.id)}
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Restore Modal -->
{#if restoreModal && selectedBackup}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Restore Backup</h3>
      
      <div class="space-y-4">
        <div>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={restoreOptions.dryRun}
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Dry run (test only)</span>
          </label>
        </div>
        
        <div>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={restoreOptions.skipAuditLogs}
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Skip audit logs</span>
          </label>
        </div>

        <div class="text-sm text-gray-600">
          <p><strong>Backup:</strong> {selectedBackup.description || 'No description'}</p>
          <p><strong>Date:</strong> {format(new Date(selectedBackup.timestamp), 'MMM dd, yyyy HH:mm')}</p>
          <p><strong>Records:</strong> {selectedBackup.recordCount.toLocaleString()}</p>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          on:click={() => { restoreModal = false; selectedBackup = null; }}
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          on:click={restoreBackup}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {restoreOptions.dryRun ? 'Test Restore' : 'Restore'}
        </button>
      </div>
    </div>
  </div>
{/if} 