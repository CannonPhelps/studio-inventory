<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let className: string = '';

  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition focus:outline-none focus-visible:ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses: Record<typeof size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const variantClasses: Record<typeof variant, string> = {
    primary: 'bg-accent text-white hover:bg-accent-secondary',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    success: 'bg-accent-success text-white hover:bg-accent-success/80',
    warning: 'bg-accent-warning text-white hover:bg-accent-warning/80',
    danger: 'bg-accent-error text-white hover:bg-accent-error/80',
    ghost: 'bg-transparent text-accent hover:bg-accent/10'
  };
</script>

<button
  class={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
  disabled={disabled || loading}
  {...$$restProps}
>
  {#if loading}
    <svg
      class="animate-spin -ml-1 mr-2 h-5 w-5 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  {/if}
  <slot />
</button> 