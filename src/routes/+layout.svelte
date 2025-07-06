<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/stores/theme';

	let { children } = $props<{ children: any }>();
</script>

{@render children()}
