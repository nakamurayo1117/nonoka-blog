// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
	site: 'https://www.oshikatsu-room.com',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Noto Sans JP',
			cssVariable: '--font-noto-sans-jp',
			fallbacks: ['sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Shippori Mincho B1',
			cssVariable: '--font-shippori-mincho',
			weights: [600, 700],
			fallbacks: ['serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Klee One',
			cssVariable: '--font-klee',
			weights: [600],
			fallbacks: ['cursive'],
		},
		{
			provider: fontProviders.google(),
			name: 'Zen Maru Gothic',
			cssVariable: '--font-zen-maru',
			weights: [500, 700],
			fallbacks: ['sans-serif'],
		},
	],
});
