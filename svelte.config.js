import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		experimental: {
			remoteFunctions: true
		},
		adapter: adapter({
			runtime: 'edge'
		})
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
