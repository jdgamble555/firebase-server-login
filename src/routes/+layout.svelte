<script lang="ts">
	import { page } from '$app/state';
	import Logout from '$lib/logout.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<main class="mt-5 flex flex-col items-center justify-center gap-5 space-x-6">
	{@render children()}
	<nav class="flex justify-center gap-3">
		<a href="/" class="font-medium text-gray-700 hover:text-blue-600">Home</a>
		<a href="/about" class="font-medium text-gray-700 hover:text-blue-600">About</a>
		{#if page.data.user}
			<Logout />
		{:else}
			<a href="/login" class="font-medium text-gray-700 hover:text-blue-600">Login</a>
		{/if}
	</nav>
</main>
