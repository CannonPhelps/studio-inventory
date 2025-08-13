<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import Card from '$lib/components/Card.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  // Tabs
  let activeTab: 'reports' | 'packLists' = 'reports';

  // ——— Reports State/Logic (copied from reports page) ———
  let categories: any[] = [];
  let cableTypes: any[] = [];
  let selectedCategories: string[] = [];
  let selectedCableType: string = 'all';
  let selectedReportType: string = 'summary';
  let dateRange: string = 'all';
  let customStartDate: string = '';
  let customEndDate: string = '';
  let groupBy: string = 'none';
  let isLoadingReport = false;
  let reportData: any = null;

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      categories = Array.isArray(data) ? data : (data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadCableTypes() {
    try {
      const response = await fetch('/api/cable-types');
      const data = await response.json();
      cableTypes = Array.isArray(data) ? data : (data.cableTypes || []);
    } catch (error) {
      console.error('Error loading cable types:', error);
    }
  }

  async function generateReport() {
    isLoadingReport = true;
    try {
      const payload: any = {
        type: selectedReportType,
        categories: (selectedCategories || []).map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
        cableTypeId: selectedCableType !== 'all' ? Number(selectedCableType) : undefined,
        dateRange,
        startDate: dateRange === 'custom' && customStartDate ? new Date(customStartDate).toISOString() : undefined,
        endDate: dateRange === 'custom' && customEndDate ? new Date(customEndDate).toISOString() : undefined,
        groupBy
      };

      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        reportData = data.report;
      } else {
        alert('Error generating report: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      isLoadingReport = false;
    }
  }

  function getReportDescription() {
    const descriptions = {
      summary: 'Overview of all assets with counts by category and type',
      detailed: 'Comprehensive list of all assets with full details',
      financial: 'Financial summary including purchase costs and maintenance expenses',
      maintenance: 'Maintenance history and upcoming scheduled maintenance',
      location: 'Asset distribution by location and room',
      cables: 'Totals per cable type with lengths (min/max/avg), and bulk remaining'
    } as const;
    // @ts-ignore
    return descriptions[selectedReportType] || '';
  }

  // ——— Pack Lists State/Logic (copied from pack-lists page) ———
  type PackList = { id: number; name: string; description?: string; status: string; createdAt: string };
  const packLists = writable<PackList[]>([]);
  const loadingPL = writable(true);
  const errorPL = writable('');

  let showCreateModal = false;
  let newName = '';
  let newDescription = '';
  let fromKitId: string = '';

  async function loadPackLists() {
    loadingPL.set(true);
    try {
      const res = await fetch('/api/pack-lists');
      if (!res.ok) throw new Error('Failed to load pack lists');
      packLists.set(await res.json());
    } catch (e) {
      errorPL.set(e instanceof Error ? e.message : 'Failed');
    } finally {
      loadingPL.set(false);
    }
  }

  function openCreate() { showCreateModal = true; }
  function cancelCreate() { newName = ''; newDescription = ''; fromKitId = ''; showCreateModal = false; }

  async function submitCreate() {
    if (!newName.trim()) { errorPL.set('Name is required'); return; }
    try {
      const body: any = { name: newName.trim(), description: newDescription.trim() || undefined };
      if (fromKitId) body.fromKitId = Number(fromKitId);
      const res = await fetch('/api/pack-lists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to create pack list');
      cancelCreate();
      await loadPackLists();
    } catch (e) {
      errorPL.set(e instanceof Error ? e.message : 'Failed to create');
    }
  }

  async function deletePackList(id: number) {
    try {
      const res = await fetch(`/api/pack-lists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete pack list');
      await loadPackLists();
    } catch (e) {
      errorPL.set(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  onMount(async () => {
    await Promise.all([loadCategories(), loadCableTypes(), loadPackLists()]);
  });

  // —— Pack List Detail (inline) ——
  type PackListDetail = PackList & {
    updatedAt: string;
    referenceCode?: string;
    destination?: string;
    dueAt?: string;
    checkedOutAt?: string;
    packedBy?: string;
    checkedBy?: string;
    notes?: string;
  };
  type PackListItem = {
    id: number;
    packListId: number;
    assetId: number;
    quantityRequested: number;
    quantityPacked: number;
    notes?: string;
    asset: { id: number; itemName: string; status: string; purchasePrice?: number | string };
  };

  let selectedPackListId: number | null = null;
  const selectedPackList = writable<PackListDetail | null>(null);
  const selectedItems = writable<PackListItem[]>([]);
  const loadingDetail = writable(false);
  const errorDetail = writable('');
  const metaSaving = writable(false);

  // Add/remove items like Kits
  let showAddItemModal = false;
  let selectedAssetId = '';
  let requestedQty = 1;
  let availableAssets: Array<{ id: number; itemName: string }>= [];

  async function loadAvailableAssets() {
    try {
      const response = await fetch('/api/assets');
      if (!response.ok) throw new Error('Failed to load assets');
      availableAssets = await response.json();
    } catch (e) {
      console.error('Error loading available assets:', e);
    }
  }

  async function loadSelectedPackList() {
    if (!selectedPackListId) return;
    loadingDetail.set(true);
    errorDetail.set('');
    try {
      const [plRes, itemsRes] = await Promise.all([
        fetch(`/api/pack-lists/${selectedPackListId}`),
        fetch(`/api/pack-lists/${selectedPackListId}/items`)
      ]);
      if (!plRes.ok) throw new Error('Failed to load pack list');
      if (!itemsRes.ok) throw new Error('Failed to load items');
      selectedPackList.set(await plRes.json());
      selectedItems.set(await itemsRes.json());
    } catch (e) {
      errorDetail.set(e instanceof Error ? e.message : 'Failed');
    } finally {
      loadingDetail.set(false);
    }
  }

  function openPackList(id: number) {
    activeTab = 'packLists';
    selectedPackListId = id;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'packLists');
    url.searchParams.set('pl', String(id));
    history.replaceState(null, '', url);
    loadSelectedPackList();
    loadAvailableAssets();
  }

  function closePackList() {
    selectedPackListId = null;
    selectedPackList.set(null);
    selectedItems.set([] as any);
    const url = new URL(window.location.href);
    url.searchParams.delete('pl');
    history.replaceState(null, '', url);
  }

  async function setPacked(assetId: number, quantityPacked: number) {
    if (!selectedPackListId) return;
    try {
      const res = await fetch(`/api/pack-lists/${selectedPackListId}/items/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityPacked })
      });
      if (!res.ok) throw new Error('Failed to update');
      await loadSelectedPackList();
    } catch (e) {
      errorDetail.set(e instanceof Error ? e.message : 'Failed to update');
    }
  }

  async function savePnlMeta() {
    if (!selectedPackListId) return;
    const pl = $selectedPackList;
    if (!pl) return;
    metaSaving.set(true);
    try {
      const res = await fetch(`/api/pack-lists/${selectedPackListId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode: pl.referenceCode || null,
          destination: pl.destination || null,
          dueAt: pl.dueAt || null,
          notes: pl.notes || null
        })
      });
      if (!res.ok) throw new Error('Failed to save PNL');
      await loadSelectedPackList();
    } catch (e) {
      errorDetail.set(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      metaSaving.set(false);
    }
  }

  async function changeStatus(newStatus: string) {
    if (!selectedPackListId) return;
    try {
      const res = await fetch(`/api/pack-lists/${selectedPackListId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await loadSelectedPackList();
    } catch (e) {
      errorDetail.set(e instanceof Error ? e.message : 'Failed to update status');
    }
  }

  async function addItemToPnl() {
    if (!selectedPackListId || !selectedAssetId) {
      errorDetail.set('Please select an asset');
      return;
    }
    try {
      const res = await fetch(`/api/pack-lists/${selectedPackListId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: Number(selectedAssetId), quantityRequested: requestedQty })
      });
      if (!res.ok) throw new Error('Failed to add item');
      selectedAssetId = '';
      requestedQty = 1;
      showAddItemModal = false;
      await loadSelectedPackList();
    } catch (e) {
      errorDetail.set(e instanceof Error ? e.message : 'Failed to add item');
    }
  }

  async function removeItemFromPnl(assetId: number) {
    if (!selectedPackListId) return;
    try {
      const res = await fetch(`/api/pack-lists/${selectedPackListId}/items/${assetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
      await loadSelectedPackList();
    } catch (e) {
      errorDetail.set(e instanceof Error ? e.message : 'Failed to remove item');
    }
  }

  // Totals
  $: totalRequested = $selectedItems.reduce((acc, it) => acc + (it.quantityRequested || 0), 0);
  $: totalPacked = $selectedItems.reduce((acc, it) => acc + (it.quantityPacked || 0), 0);

  onMount(() => {
    const params = $page.url.searchParams;
    const tab = params.get('tab');
    const pl = params.get('pl');
    if (tab === 'packLists') activeTab = 'packLists';
    if (pl) openPackList(Number(pl));
  });
</script>

<svelte:head>
  <title>Finances - Admin - Studio Inventory</title>
  <meta name="description" content="Reports and Pack Lists" />
</svelte:head>

<div class="space-y-6">
  <SectionHeader title="Finances" subtitle="Reports and PNL" gradient="from-accent to-accent-secondary" />

  <!-- Tabs -->
  <div class="border-b border-border">
    <nav class="flex space-x-4" aria-label="Finances Tabs">
      <button type="button" class={`px-4 py-2 rounded-t-lg ${activeTab === 'reports' ? 'bg-card text-primary border border-b-transparent border-border' : 'text-secondary hover:text-primary'}`} on:click={() => activeTab = 'reports'}>
        Reports
      </button>
      <button type="button" class={`px-4 py-2 rounded-t-lg ${activeTab === 'packLists' ? 'bg-card text-primary border border-b-transparent border-border' : 'text-secondary hover:text-primary'}`} on:click={() => activeTab = 'packLists'}>
        PNLs
      </button>
    </nav>
  </div>

  {#if activeTab === 'reports'}
    <!-- Reports Content -->
    <Card>
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-primary">Report Configuration</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label for="fin-report-type" class="text-sm font-medium text-secondary">Report Type</label>
            <Select id="fin-report-type" bind:bindValue={selectedReportType} options={[{ value:'summary', label:'Summary' },{ value:'detailed', label:'Detailed' },{ value:'financial', label:'Financial' },{ value:'maintenance', label:'Maintenance' },{ value:'location', label:'Location' },{ value:'cables', label:'Cables' }]} />
            <p class="text-xs text-tertiary">{getReportDescription()}</p>
          </div>
          <div class="space-y-2">
            <label for="fin-categories" class="text-sm font-medium text-secondary">Categories (Multi-select)</label>
            <select id="fin-categories" multiple bind:value={selectedCategories} class="w-full rounded-lg border border-input bg-input text-input focus:ring-2 focus:ring-accent focus:border-accent/50 px-4 py-2 min-h-[120px]">
              {#each categories as cat}
                <option value={cat.id.toString()}>{cat.name}</option>
              {/each}
            </select>
            <p class="text-xs text-tertiary">Leave empty to include all categories.</p>
          </div>
          <div class="space-y-2">
            <label for="fin-cable-type" class="text-sm font-medium text-secondary">Cable Type</label>
            <Select id="fin-cable-type" bind:bindValue={selectedCableType} options={[{ value:'all', label:'All Cable Types' }, ...cableTypes.map((ct:any)=>({ value: ct.id.toString(), label: ct.name }))]} />
          </div>
          <div class="space-y-2">
            <label for="fin-date-range" class="text-sm font-medium text-secondary">Date Range</label>
            <Select id="fin-date-range" bind:bindValue={dateRange} options={[{ value:'all', label:'All Time' },{ value:'thisMonth', label:'This Month' },{ value:'thisYear', label:'This Year' },{ value:'custom', label:'Custom' }]} />
          </div>
          {#if dateRange === 'custom'}
            <div class="space-y-2">
              <label for="fin-start-date" class="text-sm font-medium text-secondary">Start Date</label>
              <Input id="fin-start-date" type="date" bind:value={customStartDate} />
            </div>
            <div class="space-y-2">
              <label for="fin-end-date" class="text-sm font-medium text-secondary">End Date</label>
              <Input id="fin-end-date" type="date" bind:value={customEndDate} />
            </div>
          {/if}
        </div>
        <div class="flex justify-center pt-2">
          <Button onclick={generateReport} disabled={isLoadingReport} className="px-8 py-3 bg-accent text-white rounded-xl">
            {isLoadingReport ? 'Generating…' : 'Generate Report'}
          </Button>
        </div>
      </div>
    </Card>

    {#if reportData}
      <Card>
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-primary">Report Preview</h3>
          <pre class="bg-tertiary rounded-lg p-4 overflow-x-auto text-xs">{JSON.stringify(reportData, null, 2)}</pre>
        </div>
      </Card>
    {/if}
  {:else}
    <!-- PNLs Content -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-primary">PNLs</h3>
        <button class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary" on:click={openCreate}>New PNL</button>
      </div>
      {#if $loadingPL}
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      {:else if $errorPL}
        <Card className="border-accent-error">
          <div class="flex items-center justify-between">
            <p class="text-accent-error">{$errorPL}</p>
            <button type="button" on:click={() => errorPL.set('')} class="px-3 py-1.5 text-sm bg-transparent text-accent-error hover:bg-accent-error/10 rounded-lg">Dismiss</button>
          </div>
        </Card>
      {:else}
        <Card>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-card">
              <thead class="bg-tertiary">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Created</th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-card bg-card">
                {#each $packLists as p}
                <tr class="hover:bg-tertiary">
                  <td class="px-6 py-4">
                    <button type="button" class="text-sm font-medium text-accent hover:text-accent-secondary" on:click={() => openPackList(p.id)}>{p.name}</button>
                    {#if p.description}
                      <div class="text-sm text-secondary">{p.description}</div>
                    {/if}
                  </td>
                  <td class="px-6 py-4"><span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">{p.status}</span></td>
                  <td class="px-6 py-4 text-sm text-secondary">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td class="px-6 py-4 text-sm">
                    <button class="px-3 py-1.5 bg-accent-error text-white rounded-lg hover:bg-accent-error/80" on:click={() => deletePackList(p.id)}>Delete</button>
                  </td>
                </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </Card>

        {#if selectedPackListId}
          <Card>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-primary">PNL Details</h3>
                <p class="text-sm text-secondary">Requested: {totalRequested} • Packed: {totalPacked}</p>
              </div>
              <div class="flex gap-2">
                <button type="button" class="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-secondary" on:click={() => showAddItemModal = true}>Add Item</button>
                <button type="button" class="px-3 py-1.5 text-sm bg-tertiary rounded-lg hover:bg-tertiary/80" on:click={closePackList}>Close</button>
              </div>
            </div>
            {#if $loadingDetail}
              <div class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
              </div>
            {:else if $errorDetail}
              <div class="text-accent-error">{$errorDetail}</div>
            {:else if $selectedPackList}
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="space-y-4">
                  <div>
                    <label for="pnl-status" class="block text-sm font-medium text-secondary">Status</label>
                    <select id="pnl-status" class="mt-1 w-full rounded-md border border-border bg-card text-primary px-3 py-2" bind:value={$selectedPackList.status} on:change={(e:any)=> changeStatus(e.currentTarget.value)}>
                      <option value="draft">Draft</option>
                      <option value="picking">Picking</option>
                      <option value="packed">Packed</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="returned">Returned</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label for="pnl-ref" class="block text-sm font-medium text-secondary">Reference Code</label>
                    <input id="pnl-ref" class="mt-1 w-full rounded-md border border-border bg-card text-primary px-3 py-2" bind:value={$selectedPackList.referenceCode} />
                  </div>
                  <div>
                    <label for="pnl-dest" class="block text-sm font-medium text-secondary">Destination</label>
                    <input id="pnl-dest" class="mt-1 w-full rounded-md border border-border bg-card text-primary px-3 py-2" bind:value={$selectedPackList.destination} />
                  </div>
                  <div>
                    <label for="pnl-due" class="block text-sm font-medium text-secondary">Due Date</label>
                    <input id="pnl-due" type="datetime-local" class="mt-1 w-full rounded-md border border-border bg-card text-primary px-3 py-2" bind:value={$selectedPackList.dueAt} />
                  </div>
                  <div>
                    <label for="pnl-notes" class="block text-sm font-medium text-secondary">Notes</label>
                    <textarea id="pnl-notes" rows="3" class="mt-1 w-full rounded-md border border-border bg-card text-primary px-3 py-2" bind:value={$selectedPackList.notes}></textarea>
                  </div>
                  <div class="flex justify-end">
                    <button type="button" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary disabled:opacity-60" on:click={savePnlMeta} disabled={$metaSaving}>{$metaSaving ? 'Saving…' : 'Save'}</button>
                  </div>
                </div>
                <div class="lg:col-span-2">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-card">
                      <thead class="bg-tertiary">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Asset</th>
                          <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Quantity</th>
                          <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Variance</th>
                          <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Unit Value</th>
                          <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-card bg-card">
                        {#each $selectedItems as it}
                          <tr>
                            <td class="px-6 py-3 text-sm text-primary">{it.asset.itemName}</td>
                            <td class="px-6 py-3">
                              <input type="number" min="0" class="w-24 px-2 py-1 border border-border rounded-md bg-card text-primary" value={it.quantityRequested} on:change={async (e:any)=> {
                                const qty = Number(e.currentTarget.value);
                                try {
                                  await fetch(`/api/pack-lists/${selectedPackListId}/items/${it.assetId}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ quantity: qty })});
                                  await loadSelectedPackList();
                                } catch {}
                              }} />
                            </td>
                            <td class="px-6 py-3 text-sm text-primary">0</td>
                            <td class="px-6 py-3 text-sm text-primary">${Number(it.asset.purchasePrice ?? 0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                            <td class="px-6 py-3 text-sm">
                              <button class="px-3 py-1.5 bg-accent-error text-white rounded-lg hover:bg-accent-error/80" on:click={() => removeItemFromPnl(it.assetId)}>Remove</button>
                            </td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                  <!-- Totals row -->
                  <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="p-3 rounded-lg bg-tertiary"><span class="text-secondary text-sm">Total Quantity</span><div class="text-primary font-semibold">{totalRequested}</div></div>
                    <div class="p-3 rounded-lg bg-tertiary"><span class="text-secondary text-sm">Total Value</span><div class="text-primary font-semibold">${$selectedItems.reduce((acc, it)=> acc + (Number(it.asset.purchasePrice ?? 0) * (it.quantityRequested ?? 0)), 0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</div></div>
                    <div class="p-3 rounded-lg bg-tertiary"><span class="text-secondary text-sm">Lines</span><div class="text-primary font-semibold">{$selectedItems.length}</div></div>
                  </div>
                </div>
              </div>
            {/if}
          </Card>

          {#if showAddItemModal}
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" on:click|self={() => (showAddItemModal = false)} on:keydown={(e)=> e.key==='Escape' && (showAddItemModal=false)} tabindex="-1">
              <div role="document" class="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h3 class="text-lg font-semibold text-primary mb-4">Add Item to PNL</h3>
                <div class="space-y-4">
                  <div>
                    <label for="pnl-asset" class="block text-sm font-medium text-primary mb-1">Select Asset *</label>
                    <select id="pnl-asset" bind:value={selectedAssetId} class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent">
                      <option value="">Choose an asset...</option>
                      {#each availableAssets as a}
                        <option value={a.id}>{a.itemName}</option>
                      {/each}
                    </select>
                  </div>
                  <div>
                    <label for="pnl-qty" class="block text-sm font-medium text-primary mb-1">Requested Quantity</label>
                    <input id="pnl-qty" type="number" min="1" bind:value={requestedQty} class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                  <button class="px-4 py-2 bg-transparent text-accent hover:bg-accent/10 rounded-lg" on:click={() => (showAddItemModal = false)}>Cancel</button>
                  <button class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary" on:click={addItemToPnl}>Add</button>
                </div>
              </div>
            </div>
          {/if}
        {/if}
      {/if}

      {#if showCreateModal}
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" on:click|self={cancelCreate} on:keydown={(e) => e.key === 'Escape' && cancelCreate()} tabindex="-1">
          <div role="document" aria-labelledby="pl-modal-title" class="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 id="pl-modal-title" class="text-lg font-semibold text-primary mb-4">Create Pack List</h3>
            <div class="space-y-4">
              <div>
                <label for="pl-name" class="block text-sm font-medium text-primary mb-1">Name *</label>
                <input id="pl-name" class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent" bind:value={newName} />
              </div>
              <div>
                <label for="pl-desc" class="block text-sm font-medium text-primary mb-1">Description</label>
                <textarea id="pl-desc" class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent" bind:value={newDescription} rows="3"></textarea>
              </div>
              <div>
                <label for="pl-from-kit" class="block text-sm font-medium text-primary mb-1">Create From Kit (optional)</label>
                <input id="pl-from-kit" class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent" type="number" min="1" placeholder="Kit ID" bind:value={fromKitId} />
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button class="px-4 py-2 bg-transparent text-accent hover:bg-accent/10 rounded-lg" on:click={cancelCreate}>Cancel</button>
              <button class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary" on:click={submitCreate}>Create</button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>


