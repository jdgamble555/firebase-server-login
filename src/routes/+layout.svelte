<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<main class="mt-5 flex justify-center space-x-6">
	{@render children()}
</main>
