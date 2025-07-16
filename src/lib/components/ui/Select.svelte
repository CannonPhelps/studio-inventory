<script lang="ts">
  export let options: { value: string | number; label: string }[] = [];
  export let bindValue: string | number | undefined = undefined;
  export let placeholder: string = 'Select...';
  export let disabled: boolean = false;
  export let className: string = '';
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let required: boolean = false;
</script>

<select
  bind:value={bindValue}
  {disabled}
  {name}
  {id}
  {required}
  class={`w-full rounded-lg border border-input bg-input text-input focus:ring-2 focus:ring-accent focus:border-accent/50 px-4 py-2 appearance-none ${className}`}
>
  {#if placeholder}
    <option value="" disabled selected={bindValue === undefined}>{placeholder}</option>
  {/if}
  {#each options as opt}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</select>

<style>
  select {
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7L10 12L15 7' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
  }
</style> 