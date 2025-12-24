// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://tfs2006.github.io/the_tiny_house_nation',
	base: '/the_tiny_house_nation',
	integrations: [sitemap()],
});
