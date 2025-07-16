<script lang="ts">
  export let group: string;
  export let value: string | number;
  export let bindGroup: string | number | undefined = undefined;
  export let disabled: boolean = false;
  export let label: string = '';
  export let className: string = '';
  export let id: string = `radio-${Math.random().toString(36).slice(2, 9)}`;
</script>

<label class={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`} for={id}>
  <input
    id={id}
    type="radio"
    bind:group={bindGroup}
    {value}
    {disabled}
    class="h-4 w-4 text-accent bg-input border-input rounded-full focus:ring-accent focus:ring-2 transition mr-2"
  />
  <span class="text-input select-none">{label}</span>
</label> 