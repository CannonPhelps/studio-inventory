<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { format } from 'date-fns';

  interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    category: 'system' | 'asset' | 'checkout' | 'maintenance' | 'security';
    read: boolean;
    createdAt: string;
    actionUrl?: string;
  }

  let notifications: Notification[] = [];
  let unreadCount = 0;
  let showDropdown = false;
  let loading = false;

  async function loadNotifications() {
    loading = true;
    try {
      const response = await fetch('/api/notifications?unreadOnly=true&limit=10');
      if (response.ok) {
        const data = await response.json();
        notifications = data.notifications;
        unreadCount = data.total;
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      loading = false;
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsRead', notificationId })
      });
      
      // Update local state
      notifications = notifications.filter(n => n.id !== notificationId);
      unreadCount = Math.max(0, unreadCount - 1);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' })
      });
      
      notifications = [];
      unreadCount = 0;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'success': return '🟢';
      default: return '🔵';
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case 'error': return 'border-accent-error bg-error-light';
      case 'warning': return 'border-accent-warning bg-warning-light';
      case 'success': return 'border-accent-success bg-success-light';
      default: return 'border-accent-info bg-info-light';
    }
  }

  function handleNotificationClick(notification: Notification) {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    showDropdown = false;
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
    if (showDropdown) {
      loadNotifications();
    }
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-bell')) {
      showDropdown = false;
    }
  }

  onMount(() => {
    loadNotifications();
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div class="notification-bell relative">
  <button
    on:click={toggleDropdown}
    class="relative p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
    title="Notifications"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.25 2.25a1.5 1.5 0 0 1-1.5 2.25h-13.5a1.5 1.5 0 0 1-1.5-2.25l2.25-2.25v-4.5a6 6 0 0 1 6-6z" />
    </svg>
    
    {#if unreadCount > 0}
      <span class="absolute -top-1 -right-1 bg-accent-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    {/if}
  </button>

  {#if showDropdown}
    <div class="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-custom-lg border border-card z-50">
      <div class="p-4 border-b border-card">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-primary">Notifications</h3>
          {#if unreadCount > 0}
            <button
              on:click={markAllAsRead}
              class="text-sm text-accent hover:text-accent-secondary"
            >
              Mark all read
            </button>
          {/if}
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        {#if loading}
          <div class="p-4 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
          </div>
        {:else if notifications.length === 0}
          <div class="p-4 text-center text-tertiary">
            <div class="text-4xl mb-2">🔔</div>
            <p>No new notifications</p>
          </div>
        {:else}
          {#each notifications as notification}
            <div
              class="p-4 border-b border-card hover:bg-tertiary cursor-pointer transition-colors {getNotificationColor(notification.type)}"
              on:click={() => handleNotificationClick(notification)}
            >
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 text-lg">
                  {getNotificationIcon(notification.type)}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-primary">
                    {notification.title}
                  </p>
                  <p class="text-sm text-secondary mt-1">
                    {notification.message}
                  </p>
                  <p class="text-xs text-tertiary mt-2">
                    {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                  </p>
                </div>
                {#if !notification.read}
                  <div class="flex-shrink-0">
                    <div class="w-2 h-2 bg-accent rounded-full"></div>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      {#if notifications.length > 0}
        <div class="p-3 border-t border-card">
          <a
            href="/notifications"
            class="block text-center text-sm text-accent hover:text-accent-secondary"
          >
            View all notifications
          </a>
        </div>
      {/if}
    </div>
  {/if}
</div> 