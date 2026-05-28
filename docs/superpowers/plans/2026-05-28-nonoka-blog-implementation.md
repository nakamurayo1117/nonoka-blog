# ののかの推し活ルーム 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 既存のAstroデフォルトブログを「ののかの推し活ルーム」キャラクターサイトにカスタマイズする

**Architecture:** CSS変数でカラーパレットを全体適用し、各コンポーネントを個別に書き換える。新ページ（/space, /profile）を追加し、既存の/aboutを削除。ブログ記事は既存5本を削除して推し活テーマの日本語3本に差し替える。

**Tech Stack:** Astro 6.3.8, Noto Sans JP (Google Fonts via Astro font optimization), Markdown/MDX

---

## ファイルマップ

| ファイル | 操作 |
|----------|------|
| `src/consts.ts` | SITE_TITLE・SITE_DESCRIPTION を更新 |
| `astro.config.mjs` | Atkinsonフォント削除 → Noto Sans JP (Google Fonts) 追加 |
| `src/styles/global.css` | CSS変数をラベンダー・ピンク・白に変更、フォント変数更新 |
| `src/components/BaseHead.astro` | Fontコンポーネントの変数名更新 |
| `src/components/Header.astro` | サイト名・ナビ4項目・SNSアイコン削除 |
| `src/components/Footer.astro` | SNSアイコン削除・予約ボタン追加 |
| `src/layouts/BlogPost.astro` | lang="ja"に変更 |
| `src/pages/index.astro` | トップページ全面書き換え |
| `src/pages/blog/index.astro` | カードグリッドに変更・lang="ja" |
| `src/pages/space.astro` | 新規作成（スペース紹介ページ） |
| `src/pages/profile.astro` | 新規作成（プロフィールページ） |
| `src/pages/about.astro` | 削除 |
| `src/content/blog/first-post.md` | 削除 |
| `src/content/blog/second-post.md` | 削除 |
| `src/content/blog/third-post.md` | 削除 |
| `src/content/blog/markdown-style-guide.md` | 削除 |
| `src/content/blog/using-mdx.mdx` | 削除 |
| `src/content/blog/cinema-room-oshi.md` | 新規作成 |
| `src/content/blog/birthday-party-oshi.md` | 新規作成 |
| `src/content/blog/room-decoration-tips.md` | 新規作成 |

---

## Task 1: 定数とフォント設定の更新

**Files:**
- Modify: `src/consts.ts`
- Modify: `astro.config.mjs`

- [ ] **Step 1: consts.ts を更新する**

`src/consts.ts` を以下の内容に書き換える:

```typescript
export const SITE_TITLE = 'ののかの推し活ルーム';
export const SITE_DESCRIPTION = '推し活大好きゆるかわ女子・ののかが、六本木シネマルームでの推し活の楽しみ方を発信するブログです。';
```

- [ ] **Step 2: astro.config.mjs のフォント設定を Noto Sans JP に変更する**

`astro.config.mjs` を以下の内容に書き換える:

```javascript
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Noto Sans JP',
			cssVariable: '--font-noto-sans-jp',
			fallbacks: ['sans-serif'],
		},
	],
});
```

- [ ] **Step 3: ビルドが通ることを確認する**

```bash
cd /Users/nakamura/Desktop/nonoka-blog && npm run build
```

エラーがないことを確認する。

- [ ] **Step 4: コミットする**

```bash
git add src/consts.ts astro.config.mjs
git commit -m "feat: update site title and switch font to Noto Sans JP"
```

---

## Task 2: グローバルCSSのカラーパレット・フォント変更

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: global.css を全面書き換えする**

`src/styles/global.css` を以下の内容に書き換える:

```css
:root {
	--accent: #c084fc;
	--accent-dark: #a855f7;
	--pink: #f9a8d4;
	--black: 61, 44, 78;
	--gray: 150, 120, 180;
	--gray-light: 243, 232, 255;
	--gray-dark: 61, 44, 78;
	--gray-gradient: rgba(var(--gray-light), 50%), #fff;
	--box-shadow:
		0 2px 6px rgba(var(--gray), 25%), 0 8px 24px rgba(var(--gray), 33%),
		0 16px 32px rgba(var(--gray), 33%);
}
body {
	font-family: var(--font-noto-sans-jp), sans-serif;
	margin: 0;
	padding: 0;
	text-align: left;
	background: linear-gradient(var(--gray-gradient)) no-repeat;
	background-size: 100% 600px;
	word-wrap: break-word;
	overflow-wrap: break-word;
	color: rgb(var(--gray-dark));
	font-size: 18px;
	line-height: 1.8;
}
main {
	width: 720px;
	max-width: calc(100% - 2em);
	margin: auto;
	padding: 3em 1em;
}
h1,
h2,
h3,
h4,
h5,
h6 {
	margin: 0 0 0.5rem 0;
	color: rgb(var(--black));
	line-height: 1.4;
}
h1 {
	font-size: 2.2em;
}
h2 {
	font-size: 1.6em;
}
h3 {
	font-size: 1.3em;
}
h4 {
	font-size: 1.1em;
}
h5 {
	font-size: 1em;
}
strong,
b {
	font-weight: 700;
}
a {
	color: var(--accent-dark);
}
a:hover {
	color: var(--accent);
}
p {
	margin-bottom: 1em;
}
.prose p {
	margin-bottom: 1.8em;
}
textarea {
	width: 100%;
	font-size: 16px;
}
input {
	font-size: 16px;
}
table {
	width: 100%;
}
img {
	max-width: 100%;
	height: auto;
	border-radius: 8px;
}
code {
	padding: 2px 5px;
	background-color: rgb(var(--gray-light));
	border-radius: 2px;
}
pre {
	padding: 1.5em;
	border-radius: 8px;
}
pre > code {
	all: unset;
}
blockquote {
	border-left: 4px solid var(--accent);
	padding: 0 0 0 20px;
	margin: 0;
	font-size: 1.1em;
}
hr {
	border: none;
	border-top: 1px solid rgb(var(--gray-light));
}
@media (max-width: 720px) {
	body {
		font-size: 16px;
	}
	main {
		padding: 1em;
	}
}

.sr-only {
	border: 0;
	padding: 0;
	margin: 0;
	position: absolute !important;
	height: 1px;
	width: 1px;
	overflow: hidden;
	clip: rect(1px 1px 1px 1px);
	clip: rect(1px, 1px, 1px, 1px);
	clip-path: inset(50%);
	white-space: nowrap;
}
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/styles/global.css
git commit -m "feat: apply lavender/pink/white color palette and Noto Sans JP font"
```

---

## Task 3: BaseHead.astro のフォント変数更新

**Files:**
- Modify: `src/components/BaseHead.astro`

- [ ] **Step 1: Fontコンポーネントの cssVariable を更新する**

`src/components/BaseHead.astro` の35行目付近にある以下の行を:

```astro
<Font cssVariable="--font-atkinson" preload />
```

以下に変更する:

```astro
<Font cssVariable="--font-noto-sans-jp" preload />
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/components/BaseHead.astro
git commit -m "feat: update BaseHead to use Noto Sans JP font variable"
```

---

## Task 4: Header.astro の書き換え

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Header.astro を以下の内容に書き換える**

```astro
---
import { SITE_TITLE } from '../consts';
import HeaderLink from './HeaderLink.astro';
---

<header>
	<nav>
		<h2><a href="/">{SITE_TITLE}</a></h2>
		<div class="internal-links">
			<HeaderLink href="/">ホーム</HeaderLink>
			<HeaderLink href="/blog">ブログ</HeaderLink>
			<HeaderLink href="/space">スペース紹介</HeaderLink>
			<HeaderLink href="/profile">プロフィール</HeaderLink>
		</div>
	</nav>
</header>
<style>
	header {
		margin: 0;
		padding: 0 1em;
		background: #fdf4ff;
		box-shadow: 0 2px 8px rgba(var(--gray), 10%);
	}
	h2 {
		margin: 0;
		font-size: 1em;
	}

	h2 a,
	h2 a.active {
		text-decoration: none;
		color: rgb(var(--black));
		font-weight: 700;
		white-space: nowrap;
	}
	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
	}
	nav a {
		padding: 1em 0.4em;
		color: rgb(var(--black));
		border-bottom: 3px solid transparent;
		text-decoration: none;
		font-size: 0.9em;
	}
	nav a.active {
		text-decoration: none;
		border-bottom-color: var(--accent);
	}
	.internal-links {
		display: flex;
		gap: 0;
	}
	@media (max-width: 480px) {
		h2 {
			font-size: 0.85em;
		}
		nav a {
			padding: 1em 0.3em;
			font-size: 0.8em;
		}
	}
</style>
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/components/Header.astro
git commit -m "feat: update header nav to 4 items, remove SNS icons"
```

---

## Task 5: Footer.astro の書き換え

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Footer.astro を以下の内容に書き換える**

```astro
---
const today = new Date();
---

<footer>
	<div class="footer-inner">
		<a href="#" class="reserve-btn">DEARROOM六本木を予約する</a>
		<p class="copyright">&copy; {today.getFullYear()} ののかの推し活ルーム</p>
	</div>
</footer>
<style>
	footer {
		padding: 2.5em 1em;
		background: #fdf4ff;
		text-align: center;
		border-top: 1px solid rgb(var(--gray-light));
	}
	.footer-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
	}
	.reserve-btn {
		display: inline-block;
		padding: 0.75em 2em;
		background: var(--accent);
		color: #fff;
		border-radius: 999px;
		text-decoration: none;
		font-weight: 700;
		font-size: 0.95em;
		transition: background 0.2s;
	}
	.reserve-btn:hover {
		background: var(--accent-dark);
		color: #fff;
	}
	.copyright {
		margin: 0;
		color: rgb(var(--gray));
		font-size: 0.85em;
	}
</style>
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/components/Footer.astro
git commit -m "feat: update footer with reservation button, remove SNS icons"
```

---

## Task 6: BlogPost.astro の lang 属性を修正

**Files:**
- Modify: `src/layouts/BlogPost.astro`

- [ ] **Step 1: `<html lang="en">` を `<html lang="ja">` に変更する**

`src/layouts/BlogPost.astro` の14行目を:

```astro
<html lang="en">
```

以下に変更する:

```astro
<html lang="ja">
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/layouts/BlogPost.astro
git commit -m "fix: set html lang=ja in BlogPost layout"
```

---

## Task 7: トップページ（index.astro）の全面書き換え

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: index.astro を以下の内容に書き換える**

```astro
---
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import FormattedDate from '../components/FormattedDate.astro';
import Header from '../components/Header.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

const posts = (await getCollection('blog'))
	.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
	.slice(0, 3);
---

<!doctype html>
<html lang="ja">
	<head>
		<BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
	</head>
	<body>
		<Header />
		<main>
			<section class="hero">
				<p class="hero-emoji">🎬✨</p>
				<h1 class="hero-title">ののかの推し活ルーム</h1>
				<p class="hero-text">
					はじめまして、ののかです。推し活が大好きすぎて、六本木にシネマルームを作っちゃいました！<br />
					好きなものに全力で向き合う毎日を、このブログでシェアしていきます。
				</p>
			</section>

			<section class="blog-section">
				<h2 class="section-title">最新の記事</h2>
				<ul class="post-grid">
					{
						posts.map((post) => (
							<li class="post-card">
								<a href={`/blog/${post.id}/`}>
									{post.data.heroImage && (
										<Image
											width={720}
											height={360}
											src={post.data.heroImage}
											alt=""
											class="card-img"
										/>
									)}
									<h3 class="card-title">{post.data.title}</h3>
									<p class="card-date">
										<FormattedDate date={post.data.pubDate} />
									</p>
								</a>
							</li>
						))
					}
				</ul>
				<div class="more-link">
					<a href="/blog">すべての記事を見る →</a>
				</div>
			</section>
		</main>
		<Footer />
	</body>
</html>
<style>
	main {
		max-width: 800px;
	}
	.hero {
		text-align: center;
		padding: 2em 0 3em;
	}
	.hero-emoji {
		font-size: 2.5em;
		margin: 0 0 0.3em;
	}
	.hero-title {
		font-size: 2em;
		color: rgb(var(--black));
		margin: 0 0 0.6em;
	}
	.hero-text {
		font-size: 1em;
		line-height: 1.9;
		color: rgb(var(--gray));
		margin: 0;
	}
	.blog-section {
		margin-top: 2em;
	}
	.section-title {
		font-size: 1.3em;
		margin-bottom: 1em;
		padding-bottom: 0.4em;
		border-bottom: 2px solid rgb(var(--gray-light));
	}
	.post-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.post-card a {
		display: block;
		text-decoration: none;
		color: inherit;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgb(var(--gray-light));
		transition: box-shadow 0.2s, transform 0.2s;
		background: #fff;
	}
	.post-card a:hover {
		box-shadow: var(--box-shadow);
		transform: translateY(-2px);
	}
	.card-img {
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius: 0;
		display: block;
	}
	.card-title {
		font-size: 1em;
		padding: 0.8em 1em 0.3em;
		margin: 0;
		color: rgb(var(--black));
		line-height: 1.5;
	}
	.card-date {
		font-size: 0.8em;
		padding: 0 1em 0.8em;
		margin: 0;
		color: rgb(var(--gray));
	}
	.more-link {
		text-align: center;
		margin-top: 2em;
	}
	.more-link a {
		font-size: 0.95em;
		font-weight: 700;
		color: var(--accent-dark);
	}
	@media (max-width: 720px) {
		.hero-title {
			font-size: 1.6em;
		}
		.post-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/pages/index.astro
git commit -m "feat: rewrite top page with hero section and blog card grid"
```

---

## Task 8: ブログ一覧ページ（blog/index.astro）の更新

**Files:**
- Modify: `src/pages/blog/index.astro`

- [ ] **Step 1: blog/index.astro を以下の内容に書き換える**

```astro
---
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';
import BaseHead from '../../components/BaseHead.astro';
import Footer from '../../components/Footer.astro';
import FormattedDate from '../../components/FormattedDate.astro';
import Header from '../../components/Header.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';

const posts = (await getCollection('blog')).sort(
	(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);
---

<!doctype html>
<html lang="ja">
	<head>
		<BaseHead title={`ブログ | ${SITE_TITLE}`} description={SITE_DESCRIPTION} />
	</head>
	<body>
		<Header />
		<main>
			<h1 class="page-title">ブログ</h1>
			<ul class="post-grid">
				{
					posts.map((post) => (
						<li class="post-card">
							<a href={`/blog/${post.id}/`}>
								{post.data.heroImage && (
									<Image
										width={720}
										height={360}
										src={post.data.heroImage}
										alt=""
										class="card-img"
									/>
								)}
								<h2 class="card-title">{post.data.title}</h2>
								<p class="card-date">
									<FormattedDate date={post.data.pubDate} />
								</p>
							</a>
						</li>
					))
				}
			</ul>
		</main>
		<Footer />
	</body>
</html>
<style>
	main {
		width: 860px;
	}
	.page-title {
		font-size: 1.6em;
		margin-bottom: 1.2em;
		padding-bottom: 0.4em;
		border-bottom: 2px solid rgb(var(--gray-light));
	}
	.post-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.post-card a {
		display: block;
		text-decoration: none;
		color: inherit;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgb(var(--gray-light));
		transition: box-shadow 0.2s, transform 0.2s;
		background: #fff;
	}
	.post-card a:hover {
		box-shadow: var(--box-shadow);
		transform: translateY(-2px);
	}
	.card-img {
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius: 0;
		display: block;
	}
	.card-title {
		font-size: 1em;
		padding: 0.8em 1em 0.3em;
		margin: 0;
		color: rgb(var(--black));
		line-height: 1.5;
	}
	.card-date {
		font-size: 0.8em;
		padding: 0 1em 0.8em;
		margin: 0;
		color: rgb(var(--gray));
	}
	@media (max-width: 720px) {
		.post-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: update blog list page to card grid layout"
```

---

## Task 9: 新規ページの作成（space.astro・profile.astro）

**Files:**
- Create: `src/pages/space.astro`
- Create: `src/pages/profile.astro`

- [ ] **Step 1: space.astro を作成する**

`src/pages/space.astro` を以下の内容で作成する:

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import { SITE_TITLE } from '../consts';
---

<!doctype html>
<html lang="ja">
	<head>
		<BaseHead
			title={`スペース紹介 | ${SITE_TITLE}`}
			description="六本木DEARROOM六本木のシネマルームをご紹介します。推し活・誕生日会・鑑賞会など様々なシーンでご利用いただけます。"
		/>
	</head>
	<body>
		<Header />
		<main>
			<div class="page-hero">
				<p class="page-emoji">🎬</p>
				<h1>シネマルームのご紹介</h1>
				<p class="page-sub">六本木で「好き」を思いっきり楽しむための特別な空間です。</p>
			</div>

			<section class="space-body">
				<h2>こんな空間です</h2>
				<p>
					DEARROOM六本木は、六本木にある完全個室のシネマルームです。100インチ超えの大画面プロジェクターと高品質な音響システムを備えており、映画・アニメ・ライブ映像などを最高の環境で楽しめます。
				</p>
				<p>
					推し活・誕生日会・女子会・鑑賞会など、様々なシーンでご利用いただけます。飲食物の持ち込みも自由なので、好きなものを囲みながらとっておきの時間を過ごしてください。
				</p>

				<h2>設備のご案内</h2>
				<ul>
					<li>100インチ超え大画面プロジェクター</li>
					<li>高品質サラウンドサウンドシステム</li>
					<li>快適なソファ席</li>
					<li>Wi-Fi完備</li>
					<li>飲食物持ち込み自由</li>
					<li>デコレーション持ち込み可（原状回復が必要な場合を除く）</li>
				</ul>

				<h2>アクセス</h2>
				<p>東京都港区六本木（詳細は予約時にお知らせします）</p>
			</section>

			<div class="reserve-wrap">
				<a href="#" class="reserve-btn">DEARROOM六本木を予約する</a>
			</div>
		</main>
		<Footer />
	</body>
</html>
<style>
	.page-hero {
		text-align: center;
		padding: 1.5em 0 2em;
	}
	.page-emoji {
		font-size: 3em;
		margin: 0 0 0.3em;
	}
	.page-sub {
		color: rgb(var(--gray));
		margin: 0.5em 0 0;
	}
	.space-body {
		margin-top: 1em;
	}
	.space-body h2 {
		margin-top: 1.5em;
		font-size: 1.2em;
		color: var(--accent-dark);
	}
	.space-body ul {
		padding-left: 1.5em;
		line-height: 2;
	}
	.reserve-wrap {
		text-align: center;
		margin: 3em 0 1em;
	}
	.reserve-btn {
		display: inline-block;
		padding: 0.85em 2.5em;
		background: var(--accent);
		color: #fff;
		border-radius: 999px;
		text-decoration: none;
		font-weight: 700;
		font-size: 1em;
		transition: background 0.2s;
	}
	.reserve-btn:hover {
		background: var(--accent-dark);
		color: #fff;
	}
</style>
```

- [ ] **Step 2: profile.astro を作成する**

`src/pages/profile.astro` を以下の内容で作成する:

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import { SITE_TITLE } from '../consts';
---

<!doctype html>
<html lang="ja">
	<head>
		<BaseHead
			title={`プロフィール | ${SITE_TITLE}`}
			description="ののか（のの）のプロフィールページです。推し活大好きなゆるかわ女子です。"
		/>
	</head>
	<body>
		<Header />
		<main>
			<div class="profile-hero">
				<div class="avatar">🎬</div>
				<h1>ののか<span class="nickname">（のの）</span></h1>
				<p class="tagline">推し活大好きゆるかわ女子</p>
			</div>

			<section class="profile-body">
				<p>
					はじめまして！ののかです。推し活をこよなく愛する20代女子です。好きなものに全力で向き合う生き方をしています。
				</p>
				<p>
					「推しをもっといい環境で楽しみたい」という一心で、六本木にシネマルームを作ってしまいました。我ながら行動力はあると思っています（笑）。
				</p>
				<p>
					このブログでは、推し活の楽しみ方・シネマルームの活用アイデア・デコレーションのコツなどを発信していきます。推し活仲間のみなさんのヒントになればうれしいです！
				</p>

				<h2>すきなもの</h2>
				<ul>
					<li>映画・アニメ・ドラマ鑑賞</li>
					<li>推しグッズ集め</li>
					<li>おしゃれなカフェ巡り</li>
					<li>推し仲間とのわいわいタイム</li>
				</ul>

				<h2>このブログについて</h2>
				<p>
					六本木のシネマルームで推し活をもっと楽しく、もっと特別に。スペースの使い方アイデアや推し活のtipsをシェアしていきます。どうぞよろしくお願いします！
				</p>
			</section>
		</main>
		<Footer />
	</body>
</html>
<style>
	.profile-hero {
		text-align: center;
		padding: 1.5em 0 2em;
	}
	.avatar {
		font-size: 4em;
		margin-bottom: 0.2em;
	}
	.profile-hero h1 {
		font-size: 1.8em;
		margin: 0 0 0.3em;
	}
	.nickname {
		font-size: 0.65em;
		color: rgb(var(--gray));
		font-weight: 400;
	}
	.tagline {
		color: var(--accent-dark);
		font-weight: 700;
		margin: 0;
	}
	.profile-body {
		margin-top: 1em;
	}
	.profile-body h2 {
		margin-top: 1.5em;
		font-size: 1.2em;
		color: var(--accent-dark);
	}
	.profile-body ul {
		padding-left: 1.5em;
		line-height: 2;
	}
</style>
```

- [ ] **Step 3: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 4: コミットする**

```bash
git add src/pages/space.astro src/pages/profile.astro
git commit -m "feat: add space introduction and profile pages"
```

---

## Task 10: ブログ記事の差し替え（削除＋新規作成）

**Files:**
- Delete: `src/content/blog/first-post.md`
- Delete: `src/content/blog/second-post.md`
- Delete: `src/content/blog/third-post.md`
- Delete: `src/content/blog/markdown-style-guide.md`
- Delete: `src/content/blog/using-mdx.mdx`
- Create: `src/content/blog/cinema-room-oshi.md`
- Create: `src/content/blog/birthday-party-oshi.md`
- Create: `src/content/blog/room-decoration-tips.md`

- [ ] **Step 1: 既存サンプル記事を削除する**

```bash
rm src/content/blog/first-post.md \
   src/content/blog/second-post.md \
   src/content/blog/third-post.md \
   src/content/blog/markdown-style-guide.md \
   src/content/blog/using-mdx.mdx
```

- [ ] **Step 2: 記事1「シネマルームで推し映画を観るって最高すぎた話」を作成する**

`src/content/blog/cinema-room-oshi.md` を以下の内容で作成する:

```markdown
---
title: 'シネマルームで推し映画を観るって最高すぎた話'
description: '大画面・高音質でお気に入りの映画を観る体験は、普通の映画館とはまったく違う感動がありました。'
pubDate: '2026-05-01'
heroImage: '../../assets/blog-placeholder-1.jpg'
---

みなさんは、推し映画を「最高の環境」で観たいと思ったことはありませんか？

私はずっとそう思っていました。映画館は好きだけど、好きな場面で一時停止できないし、好きなものを飲み食いしながら観られないし、友達と好きなだけ語れない。そんなもどかしさを解消するために、六本木のシネマルームを借りてみたんです。

結論から言うと、最高でした！！！

まず画面が大きい。100インチ超えの大画面で推し映画を観ると、映画館と変わらない没入感があります。しかも音響がしっかりしているので、アクションシーンなんかはほんとに体に響くような迫力です。

そして何より「自由」なのがうれしかったです。好きな場面でポーズをかけて、友達と「ここよかったよね！」と語り合えるんです。推し活ってやっぱり共有してこそ楽しさが倍増しますよね。

差し入れも自由に持ち込めるので、推しキャラのデザインのお菓子を並べたりして、気分をぐっと上げることもできました。レンタルスペースならではの楽しみ方だと思います。

ひとりで静かに推しと向き合いたいときにも、みんなでわいわい語り合いたいときにも、どちらにも対応できるのがシネマルームの魅力です。ぜひ一度、試してみてください。六本木のシネマルームでお待ちしています！
```

- [ ] **Step 3: 記事2「推しのお誕生日会」を作成する**

`src/content/blog/birthday-party-oshi.md` を以下の内容で作成する:

```markdown
---
title: '六本木のレンタルスペースで推しのお誕生日会をやってみた'
description: '仲間と一緒に推しのお誕生日を特別なスペースでお祝いしました。準備から当日までをレポートします。'
pubDate: '2026-05-10'
heroImage: '../../assets/blog-placeholder-2.jpg'
---

先日、仲間たちと「推しのお誕生日会」を開催しました。場所はもちろん六本木のシネマルームです。

誕生日会の準備ってわくわくしますよね。まずはデコレーションから。推しのカラーをベースにした風船やガーランドを用意して、当日スペースに飾り付けました。推しのポスターやアクリルスタンドも持ち込んで、まるでお誕生日パーティー仕様のシネマルームが完成！テンション上がりまくりです！！

当日のプログラムはこんな感じでした。

まず推しの出演作品を大画面で鑑賞しました。みんなで一番好きな場面になるたびに歓声を上げながら観るの、本当に最高でした。次に、推しにまつわるクイズ大会。みんなファンなのにそれぞれ違う推しポイントがあって、知らなかったエピソードが続出してめちゃくちゃ盛り上がりました。

持ち寄りのごはんも豪華でした。推しカラーのスイーツやドリンクが並んで、テーブルが一気に華やかになりました。記念撮影もたくさんして、いい思い出ができました。

レンタルスペースなら自分たちでセッティングできるので、完全に「自分たちだけの空間」が作れるのが魅力です。ホテルや居酒屋と違って、推しグッズをのびのび広げられるのが本当にありがたいです。

推し活仲間がいる方は、ぜひお誕生日会の候補に入れてみてください。きっと特別な一日になりますよ。
```

- [ ] **Step 4: 記事3「デコレーションTips」を作成する**

`src/content/blog/room-decoration-tips.md` を以下の内容で作成する:

```markdown
---
title: '推し活部屋づくり：シネマルームをどうデコレーションしたか'
description: 'レンタルスペースを推しカラーに染めるデコレーションのアイデアをご紹介します。'
pubDate: '2026-05-20'
heroImage: '../../assets/blog-placeholder-3.jpg'
---

推し活の醍醐味のひとつが、空間を推し色に染めること。シネマルームをデコレーションするときに私が試したアイデアをまとめました。

## カラーテーマを決める

まず「推しカラー」を中心にテーマを決めます。メインカラー1色＋サブカラー1色くらいにまとめると、統一感が出てきれいです。バラバラになりすぎると「にぎやかだけどうるさい」印象になってしまうので要注意です。

## バルーンでボリュームを出す

風船は一番手軽に部屋の雰囲気を変えられるアイテムです。同系色の大きさ違いを複数組み合わせると、華やかさが増します。ヘリウムガスを使えば天井から浮かせることもできますよ。

## グッズは「見せる収納」で

アクリルスタンドやフォトカードは、そのまま並べると雑然としてしまいます。小さいイーゼルや専用スタンドに立てかけると、一気に「展示」っぽくなって様になります。

## ガーランドで動線を演出

入口から奥にかけてガーランドを飾ると、視線が自然に奥へと引き込まれます。文字入りのガーランドで推しの名前や「Happy Birthday」を入れると、さらに特別感が出ます。

## フォトスポットをひとつ作る

全体をデコレーションするより、「ここで写真を撮ってほしい」という場所をひとつ決めてそこに集中させるのがコツです。背景をすっきりさせて、グッズや装飾を集中させると映え写真が撮れます。

シネマルームはもともと照明の調整ができるので、雰囲気作りがしやすいのも魅力です。ぜひ自分だけのデコレーションを楽しんでみてください！
```

- [ ] **Step 5: ビルドが通ることを確認する**

```bash
npm run build
```

- [ ] **Step 6: コミットする**

```bash
git add src/content/blog/
git commit -m "feat: replace sample posts with 3 oshi-katsu themed Japanese articles"
```

---

## Task 11: about.astro の削除・最終確認

**Files:**
- Delete: `src/pages/about.astro`

- [ ] **Step 1: about.astro を削除する**

```bash
rm src/pages/about.astro
```

- [ ] **Step 2: 最終ビルドが通ることを確認する**

```bash
npm run build
```

出力例（エラーがないこと）:
```
▶ Completed in X.XXs
```

- [ ] **Step 3: 開発サーバーで全ページを目視確認する**

```bash
npm run dev
```

確認するページ:
- `http://localhost:4321/` → ヒーロー＋記事カード3枚
- `http://localhost:4321/blog` → ブログ一覧カードグリッド
- `http://localhost:4321/blog/cinema-room-oshi/` → 記事1
- `http://localhost:4321/blog/birthday-party-oshi/` → 記事2
- `http://localhost:4321/blog/room-decoration-tips/` → 記事3
- `http://localhost:4321/space` → スペース紹介
- `http://localhost:4321/profile` → プロフィール
- モバイル幅（375px）でヘッダーナビが崩れないこと

- [ ] **Step 4: コミットする**

```bash
git add -A
git commit -m "feat: remove about page, complete nonoka blog customization"
```
