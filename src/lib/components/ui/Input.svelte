<script lang="ts">
  export let type: string = 'text';
  export let value: string | number | undefined = undefined;
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let className: string = '';
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let required: boolean = false;
  // autocomplete removed for simplification
  export let autofocus: boolean = false;
</script>

<input
  {type}
  bind:value
  {placeholder}
  {disabled}
  {name}
  {id}
  {required}
  {autofocus}
  class={`w-full rounded-lg border border-input bg-input text-input placeholder:text-tertiary focus:ring-2 focus:ring-accent focus:border-accent/50 px-4 py-2 ${className}`}
/> 