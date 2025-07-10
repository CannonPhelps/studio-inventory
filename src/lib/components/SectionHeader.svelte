<script lang="ts">
  export let title: string;
  export let subtitle: string = '';
  export let icon: typeof import('svelte').SvelteComponent | null = null;
  export let gradient: string = 'from-accent to-accent-secondary';
</script>

<div class="flex items-center space-x-4 mb-6">
  {#if icon}
    <div class={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
      <svelte:component this={icon} class="h-6 w-6 text-white" />
    </div>
  {/if}
  <div>
    <h2 class="text-2xl font-semibold text-primary">{title}</h2>
    {#if subtitle}
      <p class="text-secondary-600 text-sm">{subtitle}</p>
    {/if}
  </div>
  <slot /> <!-- Right aligned actions -->
</div> 