// Sync hand-written "## 目次" links in src/content/blog/*.md to the real
// heading ids Astro generates at build time (github-slugger via
// @astrojs/markdown-remark's rehypeHeadingIds). Only the "(#...)" anchor
// part of each toc line is rewritten; the visible "[text]" is untouched.
//
// Usage:
//   npm run build                          # dist/ must be up to date first
//   node scripts/sync-toc-anchors.mjs                 # process all articles, write changes
//   node scripts/sync-toc-anchors.mjs --dry-run        # preview changes, no writes
//   node scripts/sync-toc-anchors.mjs <slug>           # process a single article
//   node scripts/sync-toc-anchors.mjs <slug> --dry-run # preview a single article
//
// An article is skipped (with a warning, no file write) whenever the number
// of "## 目次" list items doesn't equal the number of content H2 sections in
// the built HTML (i.e. an order-based 1:1 mapping can't be trusted).

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_SRC_DIR = path.join(ROOT, 'src/content/blog');
const DIST_BLOG_DIR = path.join(ROOT, 'dist/blog');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetSlug = args.find((a) => !a.startsWith('--'));

const TOC_BLOCK_RE = /^## 目次\n((?:- \[.*\]\(#.*\)\n?)+)/m;
const TOC_LINE_RE = /^- \[(.*)\]\(#(.*)\)$/;
const H2_ID_RE = /<h2[^>]*\bid="([^"]*)"[^>]*>/g;

function getSlugs() {
	const all = readdirSync(BLOG_SRC_DIR)
		.filter((f) => f.endsWith('.md'))
		.map((f) => f.slice(0, -3));
	if (targetSlug) {
		if (!all.includes(targetSlug)) {
			throw new Error(`Unknown article slug: ${targetSlug}`);
		}
		return [targetSlug];
	}
	return all;
}

function extractH2Ids(distHtmlPath) {
	const html = readFileSync(distHtmlPath, 'utf-8');
	return Array.from(html.matchAll(H2_ID_RE), (m) => m[1]);
}

function processArticle(slug) {
	const mdPath = path.join(BLOG_SRC_DIR, `${slug}.md`);
	const distPath = path.join(DIST_BLOG_DIR, slug, 'index.html');

	const content = readFileSync(mdPath, 'utf-8');
	const tocMatch = content.match(TOC_BLOCK_RE);
	if (!tocMatch) {
		return { slug, status: 'no-toc' };
	}

	let distHtmlIds;
	try {
		distHtmlIds = extractH2Ids(distPath);
	} catch {
		return { slug, status: 'skip', reason: `dist output not found (${distPath}); run npm run build first` };
	}

	if (distHtmlIds[0] !== '目次') {
		return { slug, status: 'skip', reason: `first H2 id is not "目次" (got "${distHtmlIds[0]}")` };
	}
	const contentIds = distHtmlIds.slice(1);

	const tocBlock = tocMatch[1];
	const lines = tocBlock.replace(/\n$/, '').split('\n');
	const parsed = lines.map((line) => {
		const m = line.match(TOC_LINE_RE);
		return m ? { text: m[1], oldAnchor: m[2] } : null;
	});

	if (parsed.some((p) => p === null)) {
		return { slug, status: 'skip', reason: 'a toc line did not match the expected "- [text](#anchor)" format' };
	}
	if (parsed.length !== contentIds.length) {
		return {
			slug,
			status: 'skip',
			reason: `toc item count (${parsed.length}) !== content H2 count (${contentIds.length})`,
		};
	}

	const before = tocBlock;
	const after =
		parsed.map((p, i) => `- [${p.text}](#${contentIds[i]})`).join('\n') + '\n';

	if (before === after) {
		return { slug, status: 'unchanged', before, after };
	}

	if (!dryRun) {
		const newContent = content.slice(0, tocMatch.index) + '## 目次\n' + after + content.slice(tocMatch.index + tocMatch[0].length);
		writeFileSync(mdPath, newContent, 'utf-8');
	}

	return { slug, status: dryRun ? 'would-update' : 'updated', before, after };
}

function main() {
	const slugs = getSlugs();
	const results = slugs.map(processArticle).filter((r) => r.status !== 'no-toc');

	for (const r of results) {
		console.log(`\n--- ${r.slug} [${r.status}] ---`);
		if (r.reason) console.log(`  reason: ${r.reason}`);
		if (r.before !== undefined) {
			console.log('  before:\n' + r.before.replace(/^/gm, '    '));
			console.log('  after:\n' + r.after.replace(/^/gm, '    '));
		}
	}

	const summary = results.reduce((acc, r) => {
		acc[r.status] = (acc[r.status] || 0) + 1;
		return acc;
	}, {});
	console.log('\n=== summary ===');
	console.log(summary);
}

main();
