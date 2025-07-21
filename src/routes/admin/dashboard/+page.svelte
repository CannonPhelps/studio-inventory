<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import { page } from '$app/stores';
  import type { DashboardStats, ChartData, RecentActivity } from '$lib/server/dashboard';
  import NotificationBell from '$lib/components/NotificationBell.svelte';

  import Card from '$lib/components/Card.svelte';

  let stats: DashboardStats | null = null;
  let activity: RecentActivity[] = [];
  let alerts: { overdue: number; lowStock: number; maintenance: number; security: number } | null = null;
  let loading = true;
  let error = '';
  let selectedChart = 'checkouts';
  let chartData: ChartData | null = null;
  let showCheckoutSection = false;
  let checkoutSearchQuery = '';
  let checkoutStatusFilter = 'all';
  let checkoutUserFilter = 'all';
  let checkouts: any[] = [];
  let filteredCheckouts: any[] = [];
  let users: any[] = [];
  let assets: any[] = [];
  let showCheckoutModal = false;
  let showReturnModal = false;
  let selectedCheckout: any = null;
  let checkoutForm = {
    assetId: '',
    userId: '',
    expectedReturnDate: '',
    notes: ''
  };
  let returnForm = {
    condition: 'good',
    notes: ''
  };

  const chartTypes = [
    { value: 'checkouts', label: 'Checkout Trends' },
    { value: 'assets', label: 'Asset Distribution' },
    { value: 'users', label: 'User Activity' },
    { value: 'categories', label: 'Category Values' }
  ];

  onMount(async () => {
    await loadDashboardData();
    await loadChartData();
    
    // Check if checkout parameter is present to auto-show checkout section
    if ($page.url.searchParams.get('checkout') === 'true') {
      showCheckoutSection = true;
      await loadCheckoutData();
    }
  });

  async function loadDashboardData() {
    try {
      loading = true;
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to load dashboard data');
      
      const data = await response.json();
      stats = data.stats;
      activity = data.activity;
      alerts = data.alerts;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load dashboard data';
    } finally {
      loading = false;
    }
  }

  async function loadChartData() {
    try {
      const response = await fetch(`/api/dashboard?type=chart&chartType=${selectedChart}`);
      if (!response.ok) throw new Error('Failed to load chart data');
      
      chartData = await response.json();
    } catch (err) {
      console.error('Failed to load chart data:', err);
    }
  }

  function getHealthColor(health: string) {
    switch (health) {
      case 'healthy': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'success': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    }
  }

  $: if (selectedChart) {
    loadChartData();
  }

  // Checkout functions
  async function loadCheckoutData() {
    try {
      const [checkoutsRes, usersRes, assetsRes] = await Promise.all([
        fetch('/api/checkouts'),
        fetch('/api/admin/users'),
        fetch('/api/assets')
      ]);

      if (checkoutsRes.ok) checkouts = await checkoutsRes.json();
      if (usersRes.ok) users = await usersRes.json();
      if (assetsRes.ok) assets = await assetsRes.json();

      filteredCheckouts = checkouts;
    } catch (error) {
      console.error('Error loading checkout data:', error);
    }
  }

  function filterCheckouts() {
    filteredCheckouts = checkouts.filter(checkout => {
      const searchLower = checkoutSearchQuery.toLowerCase();
      const matchesSearch = 
        (checkout.asset?.itemName && checkout.asset.itemName.toLowerCase().includes(searchLower)) ||
        (checkout.user?.name && checkout.user.name.toLowerCase().includes(searchLower)) ||
        (checkout.asset?.serialNumbers && checkout.asset.serialNumbers.some((sn: any) => 
          (sn.serialNumber || sn).toLowerCase().includes(searchLower)
        ));
      
      const matchesStatus = checkoutStatusFilter === 'all' || checkout.status.toLowerCase() === checkoutStatusFilter.toLowerCase();
      const matchesUser = checkoutUserFilter === 'all' || checkout.user?.name === checkoutUserFilter;
      
      return matchesSearch && matchesStatus && matchesUser;
    });
  }

  function openCheckoutModal() {
    checkoutForm = {
      assetId: '',
      userId: '',
      expectedReturnDate: '',
      notes: ''
    };
    showCheckoutModal = true;
  }

  function openReturnModal(checkout: any) {
    selectedCheckout = checkout;
    returnForm = {
      condition: 'good',
      notes: ''
    };
    showReturnModal = true;
  }

  async function handleCheckout() {
    try {
      const response = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutForm)
      });

      if (response.ok) {
        showCheckoutModal = false;
        await loadCheckoutData();
        filterCheckouts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error checking out item:', error);
      alert('Failed to check out item');
    }
  }

  async function handleReturn() {
    if (!selectedCheckout) return;
    try {
      const response = await fetch(`/api/checkouts/${selectedCheckout.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnForm)
      });

      if (response.ok) {
        showReturnModal = false;
        selectedCheckout = null;
        await loadCheckoutData();
        filterCheckouts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error returning item:', error);
      alert('Failed to return item');
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Analytics - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->

  <div class="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Analytics</h1>
        <p class="text-white/80 mt-2 text-lg">Comprehensive analytics and insights for your studio inventory</p>
      </div>
      <div class="text-right flex space-x-4">
        <button
          on:click={() => {
            showCheckoutSection = !showCheckoutSection;
            if (showCheckoutSection) {
              loadCheckoutData();
            }
          }}
          class="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {showCheckoutSection ? 'Hide Checkouts' : 'Manage Checkouts'}
        </button>
        <div class="text-center">
          <NotificationBell />
        </div>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-accent/20 border-t-accent"></div>
    </div>
  {:else if error}
    <Card gradient="from-accent-error/10 to-accent-error/5" className="border-accent-error/30">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="h-8 w-8 text-accent-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <p class="text-accent-error font-medium">{error}</p>
          <button 
            on:click={loadDashboardData}
            class="mt-2 text-accent-error hover:text-accent-error/80 underline transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </Card>
  {:else if stats}
    <!-- Alerts Summary -->
    {#if alerts}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card gradient="from-accent-error to-red-500" className="border-accent-error/30">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 bg-gradient-to-br from-accent-error to-red-500 rounded-xl">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-white">Overdue Items</p>
              <p class="text-3xl font-bold text-white">{alerts.overdue}</p>
            </div>
          </div>
        </Card>

        <Card gradient="from-accent-warning to-yellow-500" className="border-accent-warning/30">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 bg-gradient-to-br from-accent-warning to-yellow-500 rounded-xl">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-white">Low Stock</p>
              <p class="text-3xl font-bold text-white">{alerts.lowStock}</p>
            </div>
          </div>
        </Card>

        <Card gradient="from-accent-warning to-orange-500" className="border-accent-warning/30">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 bg-gradient-to-br from-accent-warning to-orange-500 rounded-xl">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-white">Maintenance Due</p>
              <p class="text-3xl font-bold text-white">{alerts.maintenance}</p>
            </div>
          </div>
        </Card>

        <Card gradient="from-accent-info to-cyan-500" className="border-accent-info/30">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 bg-gradient-to-br from-accent-info to-cyan-500 rounded-xl">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-white">Security Alerts</p>
              <p class="text-3xl font-bold text-white">{alerts.security}</p>
            </div>
          </div>
        </Card>
      </div>
    {/if}

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Assets Overview -->
      <Card gradient="from-accent to-accent-secondary">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-white">Assets Overview</h3>
          <div class="p-3 bg-gradient-to-br from-accent to-accent-secondary rounded-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 rounded-lg">
            <span class="text-white/90 font-medium">Total Assets</span>
            <span class="font-bold text-2xl text-white">{stats.assets.total}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-success/20 to-accent-success/10 rounded-lg">
            <span class="text-white/90 font-medium">Available</span>
            <span class="font-bold text-2xl text-green-300">{stats.assets.available}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 rounded-lg">
            <span class="text-white/90 font-medium">Checked Out</span>
            <span class="font-bold text-2xl text-white">{stats.assets.checkedOut}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-info/20 to-accent-info/10 rounded-lg">
            <span class="text-white/90 font-medium">Total Value</span>
            <span class="font-bold text-2xl text-green-300">${stats.assets.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      <!-- User Activity -->
      <Card gradient="from-accent-success to-green-500">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-white">User Activity</h3>
          <div class="p-3 bg-gradient-to-br from-accent-success to-green-500 rounded-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 rounded-lg">
            <span class="text-white/90 font-medium">Total Users</span>
            <span class="font-bold text-2xl text-white">{stats.users.total}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-success/20 to-accent-success/10 rounded-lg">
            <span class="text-white/90 font-medium">Active Users</span>
            <span class="font-bold text-2xl text-white">{stats.users.active}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-info/20 to-accent-info/10 rounded-lg">
            <span class="text-white/90 font-medium">Administrators</span>
            <span class="font-bold text-2xl text-white">{stats.users.admins}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-warning/20 to-accent-warning/10 rounded-lg">
            <span class="text-white/90 font-medium">System Health</span>
            <span class="px-3 py-1 text-sm font-medium rounded-full {getHealthColor(stats.system.systemHealth)}">
              {stats.system.systemHealth}
            </span>
          </div>
        </div>
      </Card>

      <!-- Checkout Activity -->
      <Card gradient="from-accent-info to-cyan-500">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-white">Checkout Activity</h3>
          <div class="p-3 bg-gradient-to-br from-accent-info to-cyan-500 rounded-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 rounded-lg">
            <span class="text-white/90 font-medium">Total Checkouts</span>
            <span class="font-bold text-2xl text-white">{stats.checkouts.total}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 rounded-lg">
            <span class="text-white/90 font-medium">Active Checkouts</span>
            <span class="font-bold text-2xl text-white">{stats.checkouts.active}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-success/20 to-accent-success/10 rounded-lg">
            <span class="text-white/90 font-medium">This Month</span>
            <span class="font-bold text-2xl text-white">{stats.checkouts.thisMonth}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-white/10 to-white/5 rounded-lg">
            <span class="text-white/70 font-medium">Last Month</span>
            <span class="font-bold text-2xl text-white/70">{stats.checkouts.lastMonth}</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- Charts Section -->
    <Card gradient="from-accent-secondary to-accent" padding="p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-accent-secondary to-accent rounded-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-2xl font-semibold text-white">Analytics</h3>
        </div>
        <select 
          bind:value={selectedChart}
          class="border border-white/20 rounded-lg px-4 py-3 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 backdrop-blur-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          {#each chartTypes as type}
            <option value={type.value} class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{type.label}</option>
          {/each}
        </select>
      </div>

      {#if chartData}
        <div class="h-80 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 backdrop-blur-sm dark:from-gray-800/50 dark:to-gray-900/50 dark:border-gray-700">
          <div class="text-center">
            <div class="p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full mb-4 inline-block dark:from-gray-700/50 dark:to-gray-800/50">
              <svg class="h-12 w-12 text-white dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p class="text-white dark:text-gray-300 text-lg font-medium mb-2">Chart visualization would be implemented here</p>
            <p class="text-sm text-white/70 dark:text-gray-400">
              Data: {chartData.labels.length} data points for {selectedChart}
            </p>
          </div>
        </div>
      {:else}
        <div class="h-80 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 backdrop-blur-sm dark:from-gray-800/50 dark:to-gray-900/50 dark:border-gray-700">
          <div class="relative">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white dark:border-gray-600 dark:border-t-gray-300"></div>
            <div class="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-white/30 dark:border-gray-500"></div>
          </div>
        </div>
      {/if}
    </Card>

    <!-- Recent Activity -->
    <Card gradient="from-accent-warning to-yellow-500" padding="p-6">
      <div class="flex items-center space-x-4 mb-6">
        <div class="p-3 bg-gradient-to-br from-accent-warning to-yellow-500 rounded-lg">
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-white">Recent Activity</h3>
      </div>
      {#if activity.length > 0}
        <div class="space-y-4">
          {#each activity as item, index}
            <div class="flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 transition-all duration-300 group/item">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center {getSeverityColor(item.severity)} shadow-lg">
                  {#if item.type === 'checkout'}
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                  {:else if item.type === 'return'}
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  {:else if item.type === 'maintenance'}
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  {:else}
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  {/if}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-lg font-semibold text-white group-hover/item:text-yellow-200 transition-colors">{item.title}</p>
                <p class="text-white/80 mt-1">{item.description}</p>
                <div class="flex items-center mt-2 text-sm text-white/60">
                  <span class="font-medium">{item.user}</span>
                  <span class="mx-2">•</span>
                  <span>{format(new Date(item.timestamp), 'MMM dd, HH:mm')}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12">
          <div class="p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full mb-4 inline-block dark:from-gray-700/50 dark:to-gray-800/50">
            <svg class="h-12 w-12 text-white/60 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-white/60 dark:text-gray-400 text-lg">No recent activity</p>
        </div>
      {/if}
    </Card>

    <!-- Checkout Management Section -->
    {#if showCheckoutSection}
      <Card gradient="from-accent-info to-cyan-500" padding="p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gradient-to-br from-accent-info to-cyan-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-2xl font-semibold text-white">Checkout Management ({filteredCheckouts.length} items)</h3>
          </div>
          <button
            on:click={openCheckoutModal}
            class="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New Checkout
          </button>
        </div>

        <!-- Search and Filters -->
        <div class="mb-6 space-y-4">
          <div class="relative">
            <input
              type="text"
              bind:value={checkoutSearchQuery}
              on:input={filterCheckouts}
              placeholder="Search by item name, user, or serial number..."
              class="w-full pl-10 pr-4 py-3 border border-white/20 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-base placeholder-white/60"
            />
            <svg class="absolute left-3 top-3.5 h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <select
              bind:value={checkoutStatusFilter}
              on:change={filterCheckouts}
              class="flex-1 px-4 py-3 border border-white/20 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-base"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              bind:value={checkoutUserFilter}
              on:change={filterCheckouts}
              class="flex-1 px-4 py-3 border border-white/20 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-base"
            >
              <option value="all">All Users</option>
              {#each users as user}
                <option value={user.name}>{user.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Checkouts List -->
        <div class="space-y-3">
          {#each filteredCheckouts as checkout}
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-white font-medium truncate">{checkout.asset?.itemName || 'Unknown Item'}</h4>
                  <p class="text-white/70 text-sm truncate">{checkout.asset?.category?.name || 'Uncategorized'}</p>
                  <div class="flex items-center space-x-4 mt-1 text-xs text-white/60">
                    <span>User: {checkout.user?.name || 'Unknown'}</span>
                    <span>Due: {checkout.expectedReturnDate ? formatDate(checkout.expectedReturnDate) : 'Not set'}</span>
                    <span>Status: {checkout.status}</span>
                    <span>Checked out: {formatDate(checkout.createdAt)}</span>
                  </div>
                </div>
                <div class="flex-shrink-0 flex space-x-2">
                  {#if checkout.status === 'active'}
                    <button
                      on:click={() => openReturnModal(checkout)}
                      class="bg-white text-accent-warning px-4 py-2 rounded-lg hover:bg-white/90 transition-colors duration-200 text-sm font-medium"
                    >
                      Return
                    </button>
                  {/if}
                  <button
                    class="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if filteredCheckouts.length === 0}
          <div class="text-center py-12">
            <div class="p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full mb-4 inline-block">
              <svg class="h-12 w-12 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-white/60 text-lg">No checkouts found</p>
          </div>
        {/if}
      </Card>
    {/if}
  {/if}
</div>

<!-- Checkout Modal -->
{#if showCheckoutModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Create New Checkout</h3>
        <button
          on:click={() => showCheckoutModal = false}
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form on:submit|preventDefault={handleCheckout} class="space-y-4">
        <div>
          <label for="assetId" class="block text-sm font-medium text-gray-700 mb-2">Asset</label>
          <select
            id="assetId"
            bind:value={checkoutForm.assetId}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an asset</option>
            {#each assets.filter(a => a.status === 'Available') as asset}
              <option value={asset.id}>{asset.itemName} - {asset.category?.name || 'Uncategorized'}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label for="userId" class="block text-sm font-medium text-gray-700 mb-2">User</label>
          <select
            id="userId"
            bind:value={checkoutForm.userId}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a user</option>
            {#each users as user}
              <option value={user.id}>{user.name}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label for="returnDate" class="block text-sm font-medium text-gray-700 mb-2">Expected Return Date</label>
          <input
            id="returnDate"
            type="date"
            bind:value={checkoutForm.expectedReturnDate}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
          <textarea
            id="notes"
            bind:value={checkoutForm.notes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes..."
          ></textarea>
        </div>
        
        <div class="flex space-x-3">
          <button
            type="button"
            on:click={() => showCheckoutModal = false}
            class="flex-1 px-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Checkout
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Return Modal -->
{#if showReturnModal && selectedCheckout}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Return Equipment</h3>
        <button
          on:click={() => showReturnModal = false}
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-medium text-gray-900">{selectedCheckout.asset?.itemName || 'Unknown Item'}</h4>
        <p class="text-sm text-gray-600">{selectedCheckout.asset?.category?.name || 'Uncategorized'}</p>
        <p class="text-sm text-gray-600">Checked out by: {selectedCheckout.user?.name || 'Unknown'}</p>
      </div>
      
      <form on:submit|preventDefault={handleReturn} class="space-y-4">
        <div>
          <label for="condition" class="block text-sm font-medium text-gray-700 mb-2">Return Condition</label>
          <select
            id="condition"
            bind:value={returnForm.condition}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        
        <div>
          <label for="returnNotes" class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
          <textarea
            id="returnNotes"
            bind:value={returnForm.notes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Any issues or notes..."
          ></textarea>
        </div>
        
        <div class="flex space-x-3">
          <button
            type="button"
            on:click={() => showReturnModal = false}
            class="flex-1 px-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Return Item
          </button>
        </div>
      </form>
    </div>
  </div>
{/if} 