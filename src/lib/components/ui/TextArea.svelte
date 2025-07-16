<script lang="ts">
  export let value: string | undefined = undefined;
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let className: string = '';
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let required: boolean = false;
  export let rows: number = 4;
</script>

<textarea
  bind:value
  {placeholder}
  {disabled}
  {name}
  {id}
  {required}
  {rows}
  class={`w-full rounded-lg border border-input bg-input text-input placeholder:text-tertiary focus:ring-2 focus:ring-accent focus:border-accent/50 px-4 py-2 ${className}`}
/> 