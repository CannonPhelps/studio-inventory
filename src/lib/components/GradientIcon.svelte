<script lang="ts">
  export let icon: typeof import('svelte').SvelteComponent;
  export let gradient: string = 'from-accent to-accent-secondary';
  export let size: string = 'h-6 w-6';
  export let padding: string = 'p-3';
</script>

<div class={`rounded-lg bg-gradient-to-br ${gradient} inline-flex items-center justify-center ${padding}`}
    >
  <svelte:component this={icon} class={`text-white ${size}`} />
</div> 