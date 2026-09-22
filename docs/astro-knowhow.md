# Astro 集客サイト構築ノウハウ（nonoka-blog の知見まとめ）

このドキュメントは、既存の `nonoka-blog`（Astro 静的サイト / Vercel）で得た知見を、
**新規事業サイト（サロンオーナー向け集客支援サービス / Cloudflare ホスティング）** に
最初から取り入れるためのまとめです。

> **前提の違い（新サイト）**
> - ホスティング: **Cloudflare Pages**（GitHub 連携の自動デプロイ）
> - 主要 CTA: **LINE 無料相談**（`line.me` へのリンク）。予約サイトへのリンクは無し
> - 構造化データ: 運営者 = **Person**、サービス = **Service / ProfessionalService**、記事 = **Article + author**
> - デザイン: 明るい紙のトーン / フォントは **Noto Sans JP（本文）+ Shippori Mincho B1（見出し）**
> - 記事カテゴリ（悩み軸3つ）: ①予約・顧客対応 ②広告費・固定費 ③SNS・集客作業
> - 将来、クライアント（サロン）サイトも同じ仕組みで量産 → **共通部分をテンプレ化**

> **プレースホルダー**（各サイトで差し替える値）
> `{{SITE_NAME}}` サイト名 / `{{SITE_URL}}` 本番URL（末尾スラッシュ付き）/
> `{{OWNER_NAME}}` 運営者名 / `{{SERVICE_NAME}}` サービス名 /
> `{{LINE_URL}}` LINE相談リンク / `{{GA_ID}}` GA4測定ID /
> `{{AREA}}` 商圏エリア / `{{PHONE}}` `{{ADDRESS}}` 等

> **添付「astro-site-design-principles.md」との突き合わせについて**
> 添付（設計思想ドキュメント）を受領し、実コードとの突き合わせを **§9** にまとめました。
> 大枠は実コードと整合しています（フォント・画像・計測・リダイレクト方針など）。
> 差分は「誤り」より「不足・用語」が中心で、§9 に「違い」と「コード由来の追加知見」を分けて記載。
> 以下 §0〜§8 は**すべて実コードと本プロジェクトの作業履歴に基づく**内容です。

---

## 0. スタック要点（実コードより）

- Astro `^6.3.8` / 出力は静的（`output` 未指定 = static）
- 依存: `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `sharp`（画像最適化）
- Node `>=22.12.0`
- コンテンツ: `src/content.config.ts` の Content Collections（`glob` ローダ + zod スキーマ）
- フォント: **Astro Fonts**（`astro:assets` の `Font` + `fontProviders.google()`）で
  自己ホスト。CJK は unicode-range でサブセット分割され、`@font-face` は HTML にインライン化される

---

## 1. 設定ファイルの推奨構成

### 1-1. `astro.config.mjs`

実コード（nonoka-blog 現行）をベースに、新サイト向けに調整した推奨形：

```js
// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: '{{SITE_URL}}',            // sitemap / canonical / 構造化データの絶対URL生成に必須
  trailingSlash: 'always',          // ★ URL 形を1つに固定（重複コンテンツ防止・後述1-2）
  integrations: [mdx(), sitemap()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Noto Sans JP',
      cssVariable: '--font-noto-sans-jp',
      // フォールバックを OS 日本語ゴシックに（generic の前に差し込む）
      fallbacks: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Noto Sans JP', 'sans-serif'],
      optimizedFallbacks: false,    // ★ Arial 基準の補正 @font-face を作らせない（英数字拡大バグ回避・4章）
      display: 'optional',          // ★ 切替を起こさず CLS=0（初回はOSフォント、以降キャッシュでWeb font）
    },
    {
      provider: fontProviders.google(),
      name: 'Shippori Mincho B1',
      cssVariable: '--font-shippori-mincho',
      weights: [600, 700],
      fallbacks: ['Hiragino Mincho ProN', 'Yu Mincho', 'serif'],
      optimizedFallbacks: false,
      display: 'optional',
    },
  ],
});
```

**なぜこの設定か**
- `site`: sitemap・canonical・JSON-LD の絶対URLに必須。未設定だと sitemap が生成できない。
- `trailingSlash: 'always'`: Astro は `foo/index.html` を出力するため既定URLは末尾スラッシュ付き。形を1つに固定して重複URLとリダイレクトループを防ぐ（Cloudflare の挙動と合わせる、1-2）。
- `fallbacks`（OS日本語フォント）: Web font 未適用時に**日本語も英数字も**近い字面のOSフォントで表示させる（CLS・見た目の安定）。
- `optimizedFallbacks: false`: これを付けないと Astro が `size-adjust:197%` 等の Arial/Times 基準補正 `@font-face` を自動生成し、**Web font 未適用時に英数字だけ拡大表示**される（4章の実障害）。
- `display: 'optional'`: フォント切替による再フローを起こさず CLS を実質ゼロにする（4章で swap と比較検証済み）。
- **`Font` コンポーネントに `preload` を付けない**（BaseHead側 / 3章）。CJK に付けると全サブセット（例: Noto で 121 個 = 約2.65MB）を強制DLする。

### 1-2. リダイレクト（Vercel `vercel.json` → Cloudflare `_redirects`）

**重要な前提**: Astro の `astro.config.mjs` の `redirects` は、静的出力だと
**meta-refresh（HTTP 200 のHTMLジャンプ）** になり、真の 301 にならない。
→ **プラットフォーム側の機能を使う**（Vercel=`vercel.json` / Cloudflare=`_redirects`）。

現行 `vercel.json`（抜粋・旧URL→新URLの恒久リダイレクト）:

```json
{
  "redirects": [
    { "source": "/blog/seinensai-yarikata",  "destination": "/blog/oshi-seitansai-kanzen-guide/", "permanent": true },
    { "source": "/blog/seinensai-yarikata/", "destination": "/blog/oshi-seitansai-kanzen-guide/", "permanent": true },
    { "source": "/dearroom",  "destination": "/dearroom/", "permanent": true }
  ]
}
```

**Cloudflare Pages 版** = `public/_redirects`（プレーンテキスト。ビルドで `dist/_redirects` にコピーされる）:

```
# 旧slug → 新slug（301 恒久）
/blog/seinensai-yarikata/    /blog/oshi-seitansai-kanzen-guide/   301
/service    /service/    301
```

**末尾スラッシュの扱いの違い（重要）**
- **Vercel**: `/x` と `/x/` を別物として扱うため、`vercel.json` では**両方**列挙していた（現行が実際そうしている）。
- **Cloudflare Pages**: `trailingSlash: 'always'`（Astro側）で出力を末尾スラッシュに統一しておけば、Cloudflare は非スラッシュ→スラッシュを概ね自動処理する。`_redirects` の宛先は**末尾スラッシュ付き**に統一する。
- ルール: **宛先URLは必ず1つの正規形（末尾スラッシュ付き）に揃える**。source は素のslug1行で足りることが多いが、心配なら両形書いても害はない（Cloudflareは上から順にマッチ）。
- `_redirects` は**最大1,000行 / 静的ルールはCDNエッジで評価**。ワイルドカードは `/old/*  /new/:splat  301` の形。

**併せて置くと良い `public/_headers`（キャッシュ最適化・任意）**:

```
# ハッシュ付きアセットは長期immutable、HTMLは短命
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## 2. 使い回せるコンポーネント・スクリプト

各コンポーネントを **「そのまま使える」/「事業ごとに変える」** で分けて記載。

### 2-1. `src/consts.ts`（サイト定数・1か所集約）

現行は最小。テンプレ化するなら**ここを設定の単一ソース**に拡張するのが要。

```ts
// 事業ごとに変える（テンプレの差し替えポイントを1ファイルに集約）
export const SITE_TITLE = '{{SITE_NAME}}';
export const SITE_DESCRIPTION = '…';
export const SITE_URL = '{{SITE_URL}}';
export const OWNER_NAME = '{{OWNER_NAME}}';
export const SERVICE_NAME = '{{SERVICE_NAME}}';
export const LINE_URL = '{{LINE_URL}}';       // 予約URLの代わりに LINE
export const GA_ID = '{{GA_ID}}';
```

- **そのまま使える**: 構造（定数を1ファイルに集約する方針そのもの）
- **事業ごとに変える**: 全値

### 2-2. `BaseHead.astro`（全ページ共通 head）

現行の要点（実コード）:
- `import '../styles/global.css'`（全ページにCSSを載せる起点）
- `<Font cssVariable="--font-noto-sans-jp" />` … **preload なし**（footgun回避 / 3章）
- canonical: `new URL(Astro.url.pathname, Astro.site)`
- OGP: `og:type / og:site_name / og:url / og:title / og:description / og:image` + Twitter card
- GA(gtag) のインラインスクリプト、Google Site Verification メタ
- RSS `<link rel="alternate">`

- **そのまま使える**: 構造全体（canonical, OGP, Twitter, RSS link, Fontの読み込み方）
- **事業ごとに変える**:
  - GA測定ID（`{{GA_ID}}`）と Site Verification（新サイトは自前の値）
  - 見出しフォントの読み込み: 新サイトは `--font-shippori-mincho` も BaseHead で読む
    （nonoka では Shippori はトップ専用で index.astro 側 read だった。新サイトは**全ページ見出しに明朝**を使うので BaseHead に置く）

### 2-3. `ArticleSchema.astro`（記事 JSON-LD）

現行は `Article` に `author: Person` と `publisher: Organization` を持つ（実コード）:

```astro
const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  datePublished: pubDate.toISOString(),
  dateModified: (updatedDate ?? pubDate).toISOString(),
  author: { '@type': 'Person', name: '{{OWNER_NAME}}' },      // ← 記事の author（要件どおり）
  publisher: { '@type': 'Organization', name: '{{SITE_NAME}}', url: '{{SITE_URL}}' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
  ...(image && { image: new URL(image.src, Astro.site).toString() }),
};
```

- **そのまま使える**: Article スキーマの雛形（author=Person は新要件と一致）
- **事業ごとに変える**: `author.name`・`publisher`。新サイトは `publisher` を
  **`ProfessionalService`**（サービス提供者）にしてもよい。運営者 Person は別途トップに置く（下記）。

### 2-4. WebSite / Person / Service 構造化データ

nonoka ではトップ（`index.astro`）に **WebSite のみ**をインラインで置いている:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org', '@type': 'WebSite',
  name: '{{SITE_NAME}}', alternateName: [...], url: '{{SITE_URL}}',
})} />
```

**新サイトのトップに置く推奨セット**（要件: Person + Service/ProfessionalService）:

```astro
<!-- WebSite -->
{ "@type":"WebSite", "name":"{{SITE_NAME}}", "url":"{{SITE_URL}}" }
<!-- 運営者 -->
{ "@type":"Person", "name":"{{OWNER_NAME}}", "url":"{{SITE_URL}}", "jobTitle":"…", "sameAs":["{{LINE_URL}}", "https://instagram.com/…"] }
<!-- サービス -->
{ "@type":"ProfessionalService", "name":"{{SERVICE_NAME}}",
  "provider": { "@type":"Person", "name":"{{OWNER_NAME}}" },
  "areaServed":"{{AREA}}", "url":"{{SITE_URL}}",
  "description":"サロンオーナー向け集客支援" }
```

- **WebSite はトップのみ**に出す（全ページに出さない）。ビルド後 `grep` で「WebSiteがトップだけか」を必ず検証（nonoka で実施した検証手順）。

### 2-5. `Header.astro`（高さ固定・折り返しなし = CLS対策入り）

現行の勘所（実コード / 4章の障害対策済み）:
- `nav { min-height: 3.5rem }` … **フォント切替で高さが変わらない**よう固定
- リンクとサイト名に `white-space: nowrap; flex-shrink: 0` … 字単位の折り返し禁止
- サイト名（`<h2>`）自体をホームへのリンクにし、「ホーム」項目は置かない
- スマホ（`max-width:560px`）でサイト名を短縮表示 + フォント縮小で1行に収める

- **そのまま使える**: 高さ固定 + nowrap + flex-shrink + モバイル短縮の設計（CLSの主要因を封じる）
- **事業ごとに変える**: リンク項目（新サイトは「サービス / 料金 / 事例 / 記事 / LINE相談」等）、
  サイト名テキスト、モバイル短縮名

### 2-6. `sync-toc-anchors.mjs`（手書き目次アンカーの同期）

Markdown の「## 目次」内 `[表示]( #anchor )` を、ビルド後HTMLの実 `id`（github-slugger生成）に同期するスクリプト。

- **前提**: `npm run build` で `dist/` を最新にしてから実行（HTMLの `id` を読むため）
- **スキップ条件**（安全装置）:
  - 目次項目数 ≠ 本文H2数 のとき（1:1対応が信用できない）
  - 最初のH2の id が `目次` でないとき
  - 目次行が `- [text](#anchor)` 形式でないとき
- 使い方: `node scripts/sync-toc-anchors.mjs <slug>` / 全記事なら引数なし / `--dry-run` で確認

- **そのまま使える**: スクリプト全体（サイト非依存。パスだけ確認）
- **事業ごとに変える**: なし（`src/content/blog` 構成を踏襲すれば無改変で動く）
- **運用ルール**: 記事の H2 を増減したら必ずビルド→本スクリプト→再ビルドの順。CI に組み込むと事故が減る。

### 2-7. テンプレ化（新サイト＋クライアントサロン量産）の構成案

**方針: 「共通レイヤ（テンプレ）」と「サイト固有レイヤ（設定＋コンテンツ）」を分離し、
差し替えは `consts.ts` + CSS変数 + `content/` に閉じる。**

推奨フォルダ構成（1リポジトリ1サイトを基本にしつつ、共通部分を npm パッケージ or git submodule 化）:

```
theme-salon/                         # ← 共通テンプレ（複数サイトで使い回す）
  src/components/  BaseHead / ArticleSchema / Header / Footer / StructuredData / LineFloatingCta
  src/layouts/     BlogPost.astro / Base.astro
  scripts/         sync-toc-anchors.mjs
  styles/          tokens.css（CSS変数の“形”だけ定義）/ base.css
  astro-preset.mjs # fonts/sitemap 等の共通 config を関数でexport

site-xxxx/                           # ← 各サイト（新事業 or クライアント）
  astro.config.mjs   # theme の preset を import して site/redirects だけ渡す
  src/consts.ts      # ★ サイト名・色・CTAリンク・GA を1か所で
  src/styles/site-tokens.css  # ★ --brand / --accent などの“値”を上書き
  src/content/blog/  # 記事（サイト固有）
  public/_redirects public/_headers public/fonts/
```

**設定の渡し方（1か所で変える）**
1. **テキスト系**（サイト名・CTAリンク・運営者名・GA）→ `src/consts.ts`
2. **色・トーン**→ CSS変数を `site-tokens.css` で上書き（`--gradient-cta` / `--accent` / 背景色など。
   nonoka では `global.css :root` に `--gradient-cta` 等を集約し、CTA・バッジ・番号が全部これを参照している＝1変数で色替え可能）
3. **構造系**（fonts/sitemap）→ `astro-preset.mjs` の共通関数を呼ぶだけ
4. **リダイレクト**→ 各サイトの `public/_redirects`

こうすると、クライアントサロンのサイトは「`consts.ts` と `site-tokens.css` と `content/` を差し替えるだけ」で立ち上がる。

---

## 3. 画像とフォントの実装ルール

### 3-1. `<Image>` の widths / sizes / LCP

**基本原則: `width={固定大}` 単独指定は禁止。必ず `widths` + `sizes` を組で指定する。**
（`width={2000}` だけだと全デバイスで巨大版をDLする。4章の実障害）

```astro
---
import { Image } from 'astro:assets';
import hero from '../assets/hero.jpg';   // ★ src/assets に置く（Imageは src/assets のimportのみ最適化）
---
<!-- LCP（ファーストビュー）画像: eager + fetchpriority=high -->
<Image src={hero} widths={[640, 1024, 1536]} sizes="100vw"
       loading="eager" fetchpriority="high" alt="…" />

<!-- フォールド外（カード/バナー等）: 表示幅に合わせた widths + lazy -->
<Image src={img} widths={[360, 720]} sizes="(max-width: 768px) 92vw, 360px"
       loading="lazy" alt="…" />
```

- **`sizes` の決め方**: 「その画像が実際に表示される CSS 幅」を書く。カードが 96px なら `sizes="…96px"`、
  全幅バナーなら `(max-width:768px) 92vw, 760px` のように**ブレークポイントごとの実表示幅**。
  `widths` は sizes の最大表示幅 × 2（Retina）までを目安に2〜3段。
- **LCP画像**: ヒーローだけ `loading="eager"` + `fetchpriority="high"`。それ以外は必ず `loading="lazy"`。
- **1枚の目安**: フォールド外画像はモバイルで **100KB以下**を目標（webp化 + 適切な widths で達成）。

**public に置いてよいもの / いけないもの**
- **public に置く**（`<Image>` 最適化されない・パス固定）:
  - favicon、`_redirects` / `_headers`、自己ホストのサブセット woff2（`public/fonts/`）、
    OGP用の固定画像、**Markdown本文から `<img src="/images/...">` で参照する画像**（後述の注意）
- **src/assets に置く**（最適化したい画像は基本こちら）:
  - ヒーロー、記事 heroImage、カードサムネ、装飾写真など
- **落とし穴**: Markdown内の生 `<img>`（例: 執筆者アイコン）は public 固定パス参照になり **`<Image>` 最適化が効かない**。
  → **元画像を事前に手動で圧縮**して public に置く（4章: 316KB→約7KB の実例）。表示は CSS で固定サイズ（例 60px）でも、
  高解像度対応で**表示の2倍（例120px）**にリサイズ + パレットPNG圧縮する。

### 3-2. 日本語フォントの読み込み方

- **preload しない**: `Font` に `preload` を付けると CJK は unicode-range 全サブセット（Notoで121個・約2.65MB）を
  無条件DLする。**付けないと**そのページで使う文字を含むサブセットだけDL（記事で約0.38MB）。
- **`display: 'optional'`**: 初回はOSフォールバックで即描画、Web fontは間に合えば適用/間に合わなければ次回キャッシュから。
  swap と違い**フォント切替の再フローが起きず CLS=0**。
- **`fallbacks` にOS日本語フォントを列挙**: `Hiragino Sans / Yu Gothic`（本文）、`Hiragino Mincho ProN / Yu Mincho`（見出し）。
  generic（`sans-serif`）の**前**に置く。
- **`optimizedFallbacks: false`**: Astro の Arial 基準補正 `@font-face`（`size-adjust:197%` 等）を生成させない。
  これが残ると Web font 未適用時に**英数字だけが別書体で拡大**される（4章の実障害）。
- **見出しは全ページで明朝**なら BaseHead で `--font-shippori-mincho` を読む（nonoka はトップ専用だったので index.astro read）。
- CSS変数で参照: `font-family: var(--font-noto-sans-jp), sans-serif;`（config の `cssVariable` と対応）。

### 3-3. 装飾フォントのサブセット化（手順）

装飾/手書きフォントを「固定した短い文言」でしか使わない場合、Google プロバイダの
チャンク（数十〜数百KB）を丸ごと積むより、**使用文字だけのサブセットを自己ホスト**する方が圧倒的に軽い（実例 5.9KB）。

```bash
# 1) ツール導入（Python）
python3 -m pip install fonttools brotli

# 2) 元フォント（TTF）を取得（例: Google Fonts のリポジトリから）
curl -sL -o Font-SemiBold.ttf \
  "https://github.com/google/fonts/raw/main/ofl/<family>/<Font-SemiBold>.ttf"

# 3) 使用文字だけを woff2 にサブセット化（--text に実際に表示する文字を渡す）
pyftsubset Font-SemiBold.ttf \
  --text="ここに表示する固定文言をそのまま並べる" \
  --flavor=woff2 \
  --output-file=public/fonts/deco-subset.woff2 \
  --layout-features='' --no-hinting --notdef-outline --recalc-bounds
# ※ --desubroutinize は付けない（サイズが増える）。--layout-features='' でOpenType機能を削り最小化
```

CSS 側（スコープCSS内で自己ホスト `@font-face`）:

```css
@font-face {
  font-family: 'DecoSubset';
  src: url('/fonts/deco-subset.woff2') format('woff2');
  font-weight: 600; font-display: swap;
}
.deco { font-family: 'DecoSubset', cursive; }
```

- **保守ルール**: 文言を変えたら**サブセットを作り直す**（`@font-face` 付近にコメントで対象文字を明記）。
- Astro Fonts は「任意の文字だけ」に絞れない（Googleの固定チャンク単位）ため、この用途は**手動サブセット一択**。

---

## 4. ハマったこと・遠回りしたこと（症状→原因→解決→予防）

| # | 症状 | 原因 | 解決 | 最初から避けるには |
|---|---|---|---|---|
| 1 | リダイレクトが 301 にならない | Astro `redirects` は静的出力だと **meta-refresh(200)** | プラットフォーム側（`vercel.json` / Cloudflare `_redirects`）で 301 | 最初からリダイレクトは `_redirects` に書く。Astro configのredirectsは使わない |
| 2 | フォント転送が毎ページ **約2.65MB** | `<Font ... preload />` が CJK 全サブセット(121個)を強制DL | `preload` を外す（unicode-rangeで必要分だけDLに）| Fontに preload を付けない。付けるのは軽量な欧文のみ |
| 3 | 遅い回線で **CLS 悪化** | ①ヘッダーのナビがフォント切替で折り返し→高さ変化 ②ヒーローの中央揃え(`align-items:center`)で内容高さ変化→ブロック再配置 | ①ヘッダー `min-height`固定+`nowrap`+`flex-shrink` ②最終的に `display:'optional'` で切替自体を無くす | 見出し/ナビは高さ固定・nowrap。フォントは最初から `optional` |
| 4 | Web font 未適用時に **英数字だけ拡大・別書体** | Astro 自動生成の Arial 基準補正 `@font-face`(`size-adjust:197%`) が英数字に適用 | `optimizedFallbacks: false` + `fallbacks` にOS日本語フォント | 最初から `optimizedFallbacks:false` を設定 |
| 5 | 手動デプロイの**重複** | GitHub 連携で自動デプロイされているのに `vercel --prod` も叩いていた | `git push` のみで完結（自動デプロイの `source: git` を確認） | 連携状態を最初に確認。CLI手動は緊急時のみ |
| 6 | フォールド外画像が**巨大DL** | `<Image width={2000}>` 単独指定で全デバイス巨大版 | `widths`+`sizes`+`loading="lazy"` に | 画像は最初から widths/sizes 必須。単独 width 禁止をルール化 |
| 7 | 執筆者アイコンが **316KB** | 506px 生PNGを public 直配信（`<Image>`最適化外）で全記事に読み込み | 120px・パレットPNGに手動圧縮(約7KB)。原本は別退避 | Markdownで使う固定画像は事前圧縮 or `<Image>`化を検討 |
| 8 | LCP が **14.4s**（トップ） | フォント/画像/GAが帯域を奪い合い、LCP画像が押し出される | フォント削減(装飾サブセット化・不要フォント削除)+画像最適化で競合バイト削減 → 6.5s | フォント数を絞る/装飾はサブセット/画像はwidths。GAは`async`維持 |
| 9 | 目次アンカー切れ | 手書き目次と実 `id`(github-slugger)がズレる | `sync-toc-anchors.mjs` でビルド後に同期 | H2増減時はビルド→同期→再ビルドを手順化 |
| 10 | 画像の heroImage が読めない | `heroImage` は **src/assets** 前提（public だと `image()` スキーマで解決不可）| 画像を src/assets に置く | コンテンツ画像は src/assets に統一 |

補足:
- **CLS の主犯は「フォント切替 × 可変高さレイアウト」**。ヘッダー（折り返し）とヒーロー（中央揃え）が典型。
  レイアウトを高さ固定にするか、`display:'optional'` で切替を封じるのが確実。新サイトは両方入れる。
- **転送量の実測はキャッシュ無効化して行う**（CDP `Network.setCacheDisabled`）。ローカルプレビューは
  HTMLが無圧縮で数値が悪く出るので、**gzip換算 or 本番デプロイ後**で評価する。

---

## 5. 新サイトの初期構築手順（Cloudflare 前提）

上から順に実行すれば、上記知見が最初から入った状態になる。

**① プロジェクト作成**
```bash
npm create astro@latest site-xxxx    # Empty or Blog テンプレ、TypeScript strict
cd site-xxxx
npx astro add mdx sitemap
npm i sharp
```

**② `astro.config.mjs`** … 1-1 の推奨形（`site`,`trailingSlash:'always'`,fonts×2 に
`fallbacks`/`optimizedFallbacks:false`/`display:'optional'`, `mdx()`,`sitemap()`）。

**③ `src/consts.ts`** … 2-1 のとおり全設定値を集約（SITE_*, OWNER_NAME, SERVICE_NAME, **LINE_URL**, GA_ID）。

**④ CSSトークン** … `:root` に `--gradient-cta`（今回は明るい紙トーン向けに調整）,`--accent`,背景色などを集約。
CTA/バッジ/リンクは全部この変数を参照させる（1変数で色替え可能に）。

**⑤ 共通コンポーネント**
- `BaseHead.astro`（canonical/OGP/Twitter/GA/RSS、Fontは preloadなし、見出し明朝も読む）
- `Header.astro`（min-height固定・nowrap・flex-shrink・サイト名=ホームリンク・モバイル短縮）
- `Footer.astro`
- `ArticleSchema.astro`（Article + author=Person）
- トップに WebSite + Person + ProfessionalService の JSON-LD（2-4）
- `LineFloatingCta.astro`（下記⑨）

**⑥ Content Collections** … `src/content.config.ts`（glob + zod）。frontmatter に
`title/description/pubDate/updatedDate?/heroImage?` と、悩み軸カテゴリ用 `category: z.enum(['reservation','cost','sns'])` を追加。

**⑦ 目次スクリプト** … `scripts/sync-toc-anchors.mjs` を移植。運用手順を README 化。

**⑧ リダイレクト/ヘッダ** … `public/_redirects`（301・末尾スラッシュ統一）、`public/_headers`（アセット長期キャッシュ）。

**⑨ LINE 追従ボタン（CLSを起こさない置き方）**
`position: fixed` は**通常フローから外れる**ため、正しく置けばレイアウトシフトを起こさない。ポイント:
```astro
<!-- Footer付近に一度だけ描画。fixed で画面右下に固定 -->
<a class="line-fab" href="{{LINE_URL}}" target="_blank" rel="noopener noreferrer"
   aria-label="LINEで無料相談">LINEで相談</a>
<style>
  .line-fab{
    position: fixed; right: 16px; bottom: 16px; z-index: 50;
    /* 固定サイズを最初から与える＝アイコン画像後読みでもシフトしない */
    display: inline-flex; align-items: center; gap: 8px;
    width: max-content; height: 48px; padding: 0 18px; border-radius: 999px;
    background: #06C755; color:#fff; font-weight:700; text-decoration:none;
    box-shadow: 0 6px 20px rgba(0,0,0,.18);
  }
  /* 本文がボタンに隠れないよう、body側に余白を予約（fixed自体はCLSを起こさない） */
  @media (max-width: 768px){ .line-fab{ right:12px; bottom:12px; } }
</style>
```
CLSを起こさない理由と注意:
- `position:fixed` はフロー外＝**他要素を押し出さない**（シフトの原因にならない）。
- ボタン内に**画像アイコンを使うなら幅・高さを固定**（`width/height`属性か CSS）し、後読みで大きさが変わらないようにする。
- 表示/非表示をJSで切り替える場合は、**初期状態から DOM に存在**させ `opacity`/`transform` で出す（`display:none↔block` の遅延挿入は避ける）。
- iOS のセーフエリアは `bottom: max(16px, env(safe-area-inset-bottom))` で吸収。

**⑩ ビルド確認 → デプロイ**
```bash
npm run build
node scripts/sync-toc-anchors.mjs      # 目次同期（必要なら再build）
# ローカル検証: font preload 0 / WebSiteはトップのみ / 画像widths / _redirects存在
grep -rl 'rel="preload"[^>]*as="font"' dist && echo "NG: font preload残存" || echo "OK"
```
- **Cloudflare Pages 側設定**: Framework preset = Astro / Build command = `astro build` / Output = `dist` /
  Node 22。GitHub 連携で `main` push → 自動デプロイ。カスタムドメインを本番URL（=`site`）に。
- **デプロイは `git push` のみ**（手動CLIは使わない。#5の重複回避）。

**⑪ デプロイ後の実測（本番URLで）**
- Slow 4G で トップ/記事/サービスページの **FCP・LCP・CLS**（各3回、最大値でCLS<0.1）
- 主要ページの画像転送量（フォールド外は軽いか）
- 構造化データ（Rich Results Test で Article/Person/Service が有効か）
- LINE ボタンのクリック計測（GA4のイベント。※nonokaの教訓＝計測系はいじらない/二重計測しない）

---

## 9. 添付「astro-site-design-principles.md」との突き合わせ

添付は会話ベースの設計思想で、**実コードとおおむね整合**している（特に §2-2 画像 / §2-3 フォント /
§2-4 CLS / §5 計測 は、本プロジェクトで実装済みの内容と一致）。以下は差分（違い・不足・用語）と、
**コードを見て分かる追加知見**（添付に記載がないもの）。

### 9-A. 違い・不足・用語の精緻化

| # | 添付の記述 | コードの実態 | 対応 |
|---|---|---|---|
| D1 | §1-4「記事：Article（datePublished / dateModified / **publisher**）」＝author の記載なし | `ArticleSchema.astro` は **`author: { '@type':'Person' }` を既に含む**。§8-3 も「Article に author を入れる」と要求 | §1-4 に **author=Person** を追記すべき（内部でも§8-3と不整合）。新サイトはこれが必須要件 |
| D2 | §1-1「統合して**301**リダイレクト」/ §1-2「vercel permanent:true だと **308**」 | 実 `vercel.json` は `"permanent": true` = **308**（7件すべて） | 用語を **308** に統一（SEO上 301/308 は同等）。Cloudflare `_redirects` は `301` を明示指定できる |
| D3 | §1-2「canonical は末尾スラッシュあり」 | 実 `astro.config.mjs` に **`trailingSlash` 設定は無い**。Astro既定のディレクトリ出力（`/x/index.html`）で結果的に末尾スラッシュになっているだけ | 挙動を設定で固定するため、新サイトは **`trailingSlash: 'always'` を明示**（1-1 に反映済み） |
| D4 | §2-3「Arial 基準の補正フォールバックを無効にする」 | 実装キーは **`optimizedFallbacks: false`**（各フォント定義に付与） | ドキュメントに**正式なオプション名**を明記すると再現が速い（3-2 に反映済み） |
| D5 | §2-5「`<Image>` の img にスタイル＝`is:global`＋接頭辞クラス」 | 実コードは **スコープ内 `:global(img)`** も使用（例 `.dr-night-img :global(img)`、dearroom で4箇所） | 両手法を併記。局所的には `親クラス :global(img)` が簡潔でスコープ衝突も少ない |

> D1〜D5 はいずれも**致命的な誤りではない**（大半は「不足」か「用語」）。ただし D1（Article の author）は
> 新事業の要件（Person 著者表示）に直結するため、テンプレの `ArticleSchema` に author を残す/明示するのが重要。

### 9-B. コードにあるが添付に無い知見（追加）

- **A1. `intent` フロントマターによる記事レイアウトの出し分け**（`content.config.ts` / `BlogPost.astro`）
  `intent: z.enum(['local_booking','national_affiliate','soft'])` を持ち、`BlogPost` が
  `showSpaceInfo = !intent || intent === 'local_booking'` で店舗情報ブロック(SpaceInfo)の表示可否を決め、
  さらに**本文HTMLを中央のH2で2分割**して間に差し込む（`splitIndex = h2Positions[floor(len/2)]`）。
  → 新サイトでも「記事の意図（サービス誘導 / 外部誘導 / ソフト）」で共通レイアウトを出し分ける設計が使える
  （例: サービス誘導記事だけ末尾に強めのCTAブロックを自動挿入）。
- **A2. `heroImage` は `image()` スキーマ＝src/assets 必須**。public 画像は `image()` で解決できずビルドエラー。
  コンテンツ画像は src/assets に統一（3-1 と整合）。
- **A3. 目次同期スクリプトの前提が2つ**: 「目次項目数 == 本文H2数」に加え、**最初のH2の id が `目次`** であること。
  どちらかを満たさないと安全側でスキップ（2-6 に反映済み）。
- **A4. 共通Footerをページ側で部分無効化する手法**: 店舗ページで Footer の予約ボタンだけ隠す
  `<style is:global> footer .reserve-btn { display: none !important; } </style>`。
  → テンプレの共通Footerを、特定ページで**上書き無効化**する実例（クライアント別カスタムに応用可）。
- **A5. `BaseHead.astro` が `global.css` を import** している＝**全ページCSS配信の起点**。テンプレ化時、
  共通CSS（トークン/ベース）の読み込みは BaseHead に集約すると1経路で管理できる。
- **A6. 実装場所の具体**: WebSite JSON-LD は `index.astro` に**インライン**（トップのみ）。sitemap は `site` 必須。
- **A7. 数値の実績値**（見積り根拠に使える）:
  - Noto Sans JP 全サブセット = **121ファイル / 約2.65MB**（preload時の毎ページDL）
  - preload を外すと記事で実DL **約0.38MB**（使う文字のサブセットのみ）
  - 装飾フォント（Klee）27文字の手動サブセット = **5.9KB**（Google分割単位なら数百KB）
  - 執筆者アイコン **316KB→約7KB**、トップ画像 **14MB→0.3MB**、トップ LCP **14.4s→6.5s**

### 9-C. 整合していて「そのまま採用」でよい添付の記述

- §2-1 デプロイ（git push で自動デプロイ / CLI手動は二重デプロイなので緊急時のみ）… 実運用の結論と一致
- §2-2 画像（src/assets + `<Image>` / widths・sizes / LCPは eager+fetchpriority / それ以外 lazy）… 実装と一致
- §2-3 フォント（preloadしない / optional / OS日本語フォールバック / Arial補正無効 / 装飾はサブセット）… 実装と一致
- §2-4 CLS（ヘッダー高さ固定・nowrap / ヒーロー中央揃えを避ける / Slow4G・複数回計測）… 検証結果と一致
- §5 計測（GA4はキーイベントを管理画面で作成 / リンクは素の `<a href>` / 計測中は仕組みを変えない）… 一致
- §1-3 タイトル（サイト名を末尾に付けない / WebSiteとog:site_nameで表示 / 全角「｜」）… 実装と一致

---

## 付録: nonoka-blog 由来の「効いた」パターン早見

- CSS変数 `--gradient-cta` を1か所に置き、CTA/バッジ/番号/枠が全部参照 → **1行で色替え**
- ヘッダー: サイト名=ホームリンク化して「ホーム」項目を削除（項目数を減らして1行維持）
- 画像は `src/assets` + `<Image>` で webp 自動最適化（public生imgは最適化外＝手動圧縮が必要）
- 構造化データは「トップ=WebSite/Person/Service、記事=Article+author」で役割分担、**WebSiteはトップのみ**
- 計測（GA）は原則いじらない。パフォーマンス改善でも `async` 維持でクリティカル期の遅延ロード等は
  「二重計測・欠測リスク」と天秤にかけて判断

---

*このドキュメントは nonoka-blog の実コード（Astro 6 / Vercel）と本プロジェクトの作業履歴に基づく。
新サイトは Cloudflare 前提のため、リダイレクト・キャッシュ・デプロイ節を差し替えてある。
添付「astro-site-design-principles.md」との突き合わせは §9 に反映済み（違い＝§9-A、追加知見＝§9-B）。*
