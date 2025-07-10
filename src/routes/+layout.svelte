<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/stores/theme';

	let { children } = $props<{ children: any }>();
</script>

<div class="bg-gradient-to-br from-primary via-secondary to-tertiary min-h-screen">
	{@render children()}
</div>
