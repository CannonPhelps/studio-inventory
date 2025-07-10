<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';

  interface FinancialRecord {
    id: number;
    assetId?: number;
    type: string;
    category?: string;
    amount: number;
    date: string;
    description?: string;
    asset?: { itemName: string };
  }

  let records: FinancialRecord[] = [];
  let totalAmount = 0;
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadRecords();
  });

  async function loadRecords() {
    try {
      loading = true;
      const res = await fetch('/api/admin/financial-records');
      if (!res.ok) throw new Error('Failed to load financial records');
      const data = await res.json();
      records = data.records;
      totalAmount = data.totalAmount;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Error loading records';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Finances - Studio Inventory</title>
</svelte:head>

<div class="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-primary mb-4">Financial Records</h1>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{error}</p>
      </div>
    {:else}
      <div class="mb-4 text-right text-lg font-medium text-secondary">
        Total Tracked Amount: <span class="font-bold text-primary">${totalAmount.toLocaleString()}</span>
      </div>
      <div class="bg-card rounded-xl shadow-custom border border-card overflow-auto">
        <table class="min-w-full divide-y divide-card text-sm">
          <thead class="bg-tertiary">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-secondary">Date</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Type</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Asset</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500">Amount ($)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-card">
            {#each records as rec}
              <tr class="hover:bg-tertiary transition-colors">
                <td class="px-4 py-2 whitespace-nowrap">{format(new Date(rec.date), 'MMM dd, yyyy')}</td>
                <td class="px-4 py-2 whitespace-nowrap capitalize">{rec.type}</td>
                <td class="px-4 py-2 whitespace-nowrap">{rec.category || '-'}</td>
                <td class="px-4 py-2 whitespace-nowrap">{rec.asset?.itemName || '-'}</td>
                <td class="px-4 py-2 whitespace-nowrap text-right">{rec.amount.toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if records.length === 0}
          <p class="text-center py-8 text-secondary">No financial records found.</p>
        {/if}
      </div>
    {/if}
  </div>
</div> 