<script lang="ts">
	import { magicLink } from './magic-link.remote';

	const { email } = magicLink.fields;
</script>

<form {...magicLink} class="flex items-center justify-center gap-3">
	{#each email.issues() || [] as issue}
		<p class="issue">{issue.message}</p>
	{/each}
	<input {...email.as('email')} class="w-60 rounded border p-2" />
	<button type="submit" class=" rounded bg-blue-500 p-2 text-white hover:bg-blue-600">
		Send Magic Link
	</button>
</form>

{#if magicLink.result?.success}
	<p>Email Sent!</p>
{:else if magicLink.result?.error}
	<p class="error">{magicLink.result.error}</p>
{/if}
