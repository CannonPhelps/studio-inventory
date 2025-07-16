<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

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
  <!-- Header -->
  <SectionHeader 
    title="Backup Management" 
    subtitle="Create, manage, and restore database backups" 
    gradient="from-accent to-accent-secondary">
    <Button 
      on:click={createBackup} 
      disabled={creatingBackup} 
      loading={creatingBackup}
      className="flex items-center gap-2"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      {creatingBackup ? 'Creating...' : 'Create Backup'}
    </Button>
  </SectionHeader>

  <!-- Stats Cards -->
  {#if stats}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💾</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-primary">Total Backups</p>
            <p class="text-2xl font-bold text-secondary">{stats.totalBackups}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📊</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-primary">Total Size</p>
            <p class="text-2xl font-bold text-secondary">{formatFileSize(stats.totalSize)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-center">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📅</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-primary">Latest Backup</p>
            <p class="text-sm font-bold text-secondary">
              {stats.newestBackup ? format(new Date(stats.newestBackup), 'MMM dd, yyyy') : 'None'}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📏</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-primary">Average Size</p>
            <p class="text-2xl font-bold text-secondary">{formatFileSize(stats.averageSize)}</p>
          </div>
        </div>
      </Card>
    </div>
  {/if}

  <!-- Error Message -->
  {#if error}
    <Card className="border-accent-error">
      <p class="text-accent-error">{error}</p>
    </Card>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else}
    <!-- Backups Table -->
    <Card>
      <div class="px-6 py-4 border-b border-card">
        <h2 class="text-lg font-semibold text-primary">Available Backups</h2>
      </div>
      
      {#if backups.length === 0}
        <div class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">💾</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No backups found</h3>
          <p class="text-gray-600">Create your first backup to get started</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-card">
            <thead class="bg-tertiary">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tables</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-card divide-y divide-card">
              {#each backups as backup}
                <tr class="hover:bg-tertiary transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                    {format(new Date(backup.timestamp), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td class="px-6 py-4 text-sm text-primary">
                    {backup.description || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                    {backup.recordCount.toLocaleString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                    {formatFileSize(backup.size)}
                  </td>
                  <td class="px-6 py-4 text-sm text-primary">
                    <span class="text-xs bg-tertiary text-secondary px-2 py-1 rounded">
                      {backup.tables.length} tables
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <Button variant="success" size="sm" href={`/api/admin/backups/${backup.id}/download`}>
                        Download
                      </Button>
                      <Button variant="warning" size="sm" href={`/api/admin/backups/${backup.id}/download?plain=true`}>
                        Raw JSON
                      </Button>
                      <Button variant="primary" size="sm" on:click={() => openRestoreModal(backup)}>
                        Restore
                      </Button>
                      <Button variant="danger" size="sm" on:click={() => deleteBackup(backup.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </Card>
  {/if}
</div>

<!-- Restore Modal -->
{#if restoreModal && selectedBackup}
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div class="bg-card rounded-xl p-6 max-w-md w-full mx-4 border border-card">
      <h3 class="text-lg font-semibold text-primary mb-4">Restore Backup</h3>
      
      <div class="space-y-4">
        <div>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={restoreOptions.dryRun}
              class="rounded border-input text-accent focus:ring-accent"
            />
            <span class="ml-2 text-sm text-secondary">Dry run (test only)</span>
          </label>
        </div>
        
        <div>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={restoreOptions.skipAuditLogs}
              class="rounded border-input text-accent focus:ring-accent"
            />
            <span class="ml-2 text-sm text-secondary">Skip audit logs</span>
          </label>
        </div>

        <div class="text-sm text-secondary">
          <p><strong>Backup:</strong> {selectedBackup.description || 'No description'}</p>
          <p><strong>Date:</strong> {format(new Date(selectedBackup.timestamp), 'MMM dd, yyyy HH:mm')}</p>
          <p><strong>Records:</strong> {selectedBackup.recordCount.toLocaleString()}</p>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <Button variant="secondary" on:click={() => { restoreModal = false; selectedBackup = null; }}>
          Cancel
        </Button>
        <Button on:click={restoreBackup}>
          {restoreOptions.dryRun ? 'Test Restore' : 'Restore'}
        </Button>
      </div>
    </div>
  </div>
{/if} 