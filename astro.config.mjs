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
			// CLS対策: フォールバックをOSの日本語ゴシックに＋optional（切替を起こさずCLS=0。初回はOS日本語フォント、以降キャッシュでNoto）
			fallbacks: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Noto Sans JP', 'sans-serif'],
			display: 'optional',
		},
		{
			provider: fontProviders.google(),
			name: 'Shippori Mincho B1',
			cssVariable: '--font-shippori-mincho',
			weights: [600, 700],
			// CLS対策: フォールバックをOSの日本語明朝に＋optional
			fallbacks: ['Hiragino Mincho ProN', 'Yu Mincho', 'serif'],
			display: 'optional',
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
