<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import type { DashboardStats, ChartData, RecentActivity } from '$lib/server/dashboard';
  import NotificationBell from '$lib/components/NotificationBell.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';

  let stats: DashboardStats | null = null;
  let activity: RecentActivity[] = [];
  let alerts: { overdue: number; lowStock: number; maintenance: number; security: number } | null = null;
  let loading = true;
  let error = '';
  let selectedChart = 'checkouts';
  let chartData: ChartData | null = null;

  const chartTypes = [
    { value: 'checkouts', label: 'Checkout Trends' },
    { value: 'assets', label: 'Asset Distribution' },
    { value: 'users', label: 'User Activity' },
    { value: 'categories', label: 'Category Values' }
  ];

  onMount(async () => {
    await loadDashboardData();
    await loadChartData();
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
      case 'healthy': return 'text-accent-success bg-success-light';
      case 'warning': return 'text-accent-warning bg-warning-light';
      case 'critical': return 'text-accent-error bg-error-light';
      default: return 'text-secondary-600 bg-secondary-100';
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'success': return 'text-accent-success bg-success-light';
      case 'warning': return 'text-accent-warning bg-warning-light';
      case 'error': return 'text-accent-error bg-error-light';
      default: return 'text-accent-info bg-info-light';
    }
  }

  $: if (selectedChart) {
    loadChartData();
  }
</script>

<svelte:head>
  <title>Analytics - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <SectionHeader 
    title="Analytics" 
    subtitle="Comprehensive analytics and insights for your studio inventory" 
    gradient="from-accent to-accent-secondary">
    <div class="flex items-center space-x-4">
      <NotificationBell />
    </div>
  </SectionHeader>

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
              <p class="text-sm font-medium text-accent-error">Overdue Items</p>
              <p class="text-3xl font-bold text-accent-error">{alerts.overdue}</p>
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
              <p class="text-sm font-medium text-accent-warning">Low Stock</p>
              <p class="text-3xl font-bold text-accent-warning">{alerts.lowStock}</p>
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
              <p class="text-sm font-medium text-accent-warning">Maintenance Due</p>
              <p class="text-3xl font-bold text-accent-warning">{alerts.maintenance}</p>
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
              <p class="text-sm font-medium text-accent-info">Security Alerts</p>
              <p class="text-3xl font-bold text-accent-info">{alerts.security}</p>
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
          <h3 class="text-xl font-semibold text-primary">Assets Overview</h3>
          <div class="p-3 bg-gradient-to-br from-accent to-accent-secondary rounded-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-lg">
            <span class="text-secondary-600 font-medium">Total Assets</span>
            <span class="font-bold text-2xl text-primary">{stats.assets.total}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-success/20 to-accent-success/10 rounded-lg">
            <span class="text-secondary-600 font-medium">Available</span>
            <span class="font-bold text-2xl text-accent-success">{stats.assets.available}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg">
            <span class="text-secondary-600 font-medium">Checked Out</span>
            <span class="font-bold text-2xl text-accent">{stats.assets.checkedOut}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-info/20 to-accent-info/10 rounded-lg">
            <span class="text-secondary-600 font-medium">Total Value</span>
            <span class="font-bold text-2xl text-accent-info">${stats.assets.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      <!-- User Activity -->
      <Card gradient="from-accent-success to-green-500">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-primary">User Activity</h3>
          <div class="p-3 bg-gradient-to-br from-accent-success to-green-500 rounded-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-lg">
            <span class="text-secondary-600 font-medium">Total Users</span>
            <span class="font-bold text-2xl text-primary">{stats.users.total}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-success/20 to-accent-success/10 rounded-lg">
            <span class="text-secondary-600 font-medium">Active Users</span>
            <span class="font-bold text-2xl text-accent-success">{stats.users.active}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-info/20 to-accent-info/10 rounded-lg">
            <span class="text-secondary-600 font-medium">Administrators</span>
            <span class="font-bold text-2xl text-accent-info">{stats.users.admins}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-warning/20 to-accent-warning/10 rounded-lg">
            <span class="text-secondary-600 font-medium">System Health</span>
            <span class="px-3 py-1 text-sm font-medium rounded-full {getHealthColor(stats.system.systemHealth)}">
              {stats.system.systemHealth}
            </span>
          </div>
        </div>
      </Card>

      <!-- Checkout Activity -->
      <Card gradient="from-accent-info to-cyan-500">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-primary">Checkout Activity</h3>
          <div class="p-3 bg-gradient-to-br from-accent-info to-cyan-500 rounded-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-lg">
            <span class="text-secondary-600 font-medium">Total Checkouts</span>
            <span class="font-bold text-2xl text-primary">{stats.checkouts.total}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg">
            <span class="text-secondary-600 font-medium">Active Checkouts</span>
            <span class="font-bold text-2xl text-accent">{stats.checkouts.active}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-success/20 to-accent-success/10 rounded-lg">
            <span class="text-secondary-600 font-medium">This Month</span>
            <span class="font-bold text-2xl text-accent-success">{stats.checkouts.thisMonth}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gradient-to-r from-secondary/30 to-secondary/20 rounded-lg">
            <span class="text-secondary-600 font-medium">Last Month</span>
            <span class="font-bold text-2xl text-secondary-600">{stats.checkouts.lastMonth}</span>
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
          <h3 class="text-2xl font-semibold text-primary">Analytics</h3>
        </div>
        <select 
          bind:value={selectedChart}
          class="border border-input rounded-lg px-4 py-3 text-sm bg-input text-input focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
        >
          {#each chartTypes as type}
            <option value={type.value}>{type.label}</option>
          {/each}
        </select>
      </div>

      {#if chartData}
        <div class="h-80 flex items-center justify-center bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl border border-secondary/20">
          <div class="text-center">
            <div class="p-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full mb-4 inline-block">
              <svg class="h-12 w-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p class="text-primary text-lg font-medium mb-2">Chart visualization would be implemented here</p>
            <p class="text-sm text-secondary-600">
              Data: {chartData.labels.length} data points for {selectedChart}
            </p>
          </div>
        </div>
      {:else}
        <div class="h-80 flex items-center justify-center bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl border border-secondary/20">
          <div class="relative">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-accent/20 border-t-accent"></div>
            <div class="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-accent/30"></div>
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
        <h3 class="text-2xl font-semibold text-primary">Recent Activity</h3>
      </div>
      {#if activity.length > 0}
        <div class="space-y-4">
          {#each activity as item, index}
            <div class="flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-secondary/30 hover:to-secondary/20 transition-all duration-300 group/item">
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
                <p class="text-lg font-semibold text-primary group-hover/item:text-accent transition-colors">{item.title}</p>
                <p class="text-secondary-600 mt-1">{item.description}</p>
                <div class="flex items-center mt-2 text-sm text-secondary-600">
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
          <div class="p-6 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full mb-4 inline-block">
            <svg class="h-12 w-12 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-secondary-600 text-lg">No recent activity</p>
        </div>
      {/if}
    </Card>
  {/if}
</div> 