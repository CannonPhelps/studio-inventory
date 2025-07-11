<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let snapshot: any = null;
  let error: string | null = null;
  let loading = true;

  async function loadSnapshot() {
    try {
      const res = await fetch('/api/admin/debug');
      if (!res.ok) {
        error = `Error ${res.status}: ${res.statusText}`;
        return;
      }
      snapshot = await res.json();
    } catch (e) {
      console.error(e);
      error = 'Fetch failed';
    } finally {
      loading = false;
    }
  }

  onMount(loadSnapshot);
</script>

<svelte:head>
  <title>Debug – Raw Snapshot</title>
</svelte:head>

<div class="p-6 space-y-4">
  <h1 class="text-2xl font-bold">Debug: Raw Database Snapshot</h1>

  {#if loading}
    <p class="text-secondary">Loading…</p>
  {:else if error}
    <p class="text-error">{error}</p>
  {:else}
    <pre class="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto max-h-[80vh]">
      {JSON.stringify(snapshot, null, 2)}
    </pre>
  {/if}
</div> 