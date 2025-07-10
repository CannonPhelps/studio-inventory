<script lang="ts">
  export let className: string = '';
  export let gradient: string | null = null; // e.g. 'from-accent to-accent-secondary'
  export let padding: string = 'p-6';
  export let shadow: string = 'shadow-custom';
</script>

<div class={`relative rounded-xl border border-card bg-card/90 backdrop-blur-sm ${padding} ${shadow} ${className}`}
    class:overflow-hidden={!!gradient}
>
  {#if gradient}
    <!-- Gradient background overlay -->
    <div class={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 pointer-events-none`}></div>
  {/if}

  <!-- Card content -->
  <div class="relative">
    <slot />
  </div>
</div> 