<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';

  interface AuditLog {
    id: number;
    userId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValues: string | null;
    newValues: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    timestamp: string;
    details: string | null;
    severity: string;
  }

  interface AuditLogsResponse {
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

  let auditLogs: AuditLog[] = [];
  let loading = true;
  let error = '';
  let currentPage = 1;
  let totalPages = 1;
  let totalLogs = 0;

  // Filters
  let filters = {
    userId: '',
    entityType: '',
    entityId: '',
    action: '',
    severity: '',
    startDate: '',
    endDate: ''
  };

  async function loadAuditLogs() {
    loading = true;
    error = '';
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50'
      });

      if (filters.userId) params.append('userId', filters.userId);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.entityId) params.append('entityId', filters.entityId);
      if (filters.action) params.append('action', filters.action);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data: AuditLogsResponse = await response.json();
      auditLogs = data.logs;
      totalPages = data.totalPages;
      totalLogs = data.total;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }

  function handleFilter() {
    currentPage = 1;
    loadAuditLogs();
  }

  function clearFilters() {
    filters = {
      userId: '',
      entityType: '',
      entityId: '',
      action: '',
      severity: '',
      startDate: '',
      endDate: ''
    };
    currentPage = 1;
    loadAuditLogs();
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'ERROR': return 'bg-orange-100 text-orange-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  }

  function getActionColor(action: string) {
    if (action.includes('DELETE')) return 'text-red-600';
    if (action.includes('UPDATE')) return 'text-blue-600';
    if (action.includes('CREATE')) return 'text-green-600';
    return 'text-gray-600';
  }

  onMount(() => {
    loadAuditLogs();
  });
</script>

<div class="space-y-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-primary mb-2">Audit Logs</h1>
    <p class="text-primary">Track all system activities and user actions</p>
  </div>

  <!-- Filters -->
  <div class="bg-primary rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h2 class="text-lg font-semibold text-primary mb-4">Filters</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label for="userId" class="block text-sm font-medium text-primary mb-1">User ID</label>
        <input
          id="userId"
          type="text"
          bind:value={filters.userId}
          placeholder="Enter user ID"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="entityType" class="block text-sm font-medium text-primary mb-1">Entity Type</label>
        <select
          id="entityType"
          bind:value={filters.entityType}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Asset">Asset</option>
          <option value="User">User</option>
          <option value="Checkout">Checkout</option>
          <option value="Auth">Auth</option>
          <option value="Category">Category</option>
          <option value="CableType">CableType</option>
        </select>
      </div>

      <div>
        <label for="action" class="block text-sm font-medium text-primary mb-1">Action</label>
        <input
          id="action"
          type="text"
          bind:value={filters.action}
          placeholder="Enter action"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="severity" class="block text-sm font-medium text-primary mb-1">Severity</label>
        <select
          id="severity"
          bind:value={filters.severity}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Severities</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div>
        <label for="startDate" class="block text-sm font-medium text-primary mb-1">Start Date</label>
        <input
          id="startDate"
          type="date"
          bind:value={filters.startDate}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="endDate" class="block text-sm font-medium text-primary mb-1">End Date</label>
        <input
          id="endDate"
          type="date"
          bind:value={filters.endDate}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div class="flex gap-3 mt-4">
      <button
        on:click={handleFilter}
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Apply Filters
      </button>
      <button
        on:click={clearFilters}
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Clear Filters
      </button>
    </div>
  </div>

  <!-- Results Summary -->
  <div class="mb-4">
    <p class="text-sm text-primary">
      Showing {auditLogs.length} of {totalLogs} logs
    </p>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-red-800">{error}</p>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else}
    <!-- Audit Logs Table -->
    <div class="bg-primary rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-primary">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Timestamp</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Action</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Entity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Severity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody class="bg-primary divide-y divide-gray-200">
            {#each auditLogs as log}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {log.userId || 'System'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium {getActionColor(log.action)}">
                    {log.action}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getSeverityColor(log.severity)}">
                    {log.severity}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-primary max-w-xs truncate">
                  {log.details || '-'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              on:click={() => { currentPage = Math.max(1, currentPage - 1); loadAuditLogs(); }}
              disabled={currentPage === 1}
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              on:click={() => { currentPage = Math.min(totalPages, currentPage + 1); loadAuditLogs(); }}
              disabled={currentPage === totalPages}
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-primary">
                Showing page <span class="font-medium">{currentPage}</span> of <span class="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  on:click={() => { currentPage = Math.max(1, currentPage - 1); loadAuditLogs(); }}
                  disabled={currentPage === 1}
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  on:click={() => { currentPage = Math.min(totalPages, currentPage + 1); loadAuditLogs(); }}
                  disabled={currentPage === totalPages}
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>