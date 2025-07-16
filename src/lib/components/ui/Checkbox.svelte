<script lang="ts">
  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let label: string = '';
  export let className: string = '';
  export let id: string = `chk-${Math.random().toString(36).slice(2, 9)}`;
</script>

<label class={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`} for={id}>
  <input
    id={id}
    type="checkbox"
    bind:checked
    {disabled}
    class="h-4 w-4 text-accent bg-input border-input rounded focus:ring-accent focus:ring-2 transition mr-2"
  />
  <span class="text-input select-none">{label}</span>
</label> 