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
			// Arial基準の補正フォールバック(size-adjust)を生成しない＝英数字が拡大される不具合を防ぐ
			optimizedFallbacks: false,
			display: 'optional',
		},
		{
			provider: fontProviders.google(),
			name: 'Shippori Mincho B1',
			cssVariable: '--font-shippori-mincho',
			weights: [600, 700],
			// CLS対策: フォールバックをOSの日本語明朝に＋optional
			fallbacks: ['Hiragino Mincho ProN', 'Yu Mincho', 'serif'],
			// Times基準の補正フォールバックを生成しない＝英数字の拡大表示を防ぐ
			optimizedFallbacks: false,
			display: 'optional',
		},
	],
});
