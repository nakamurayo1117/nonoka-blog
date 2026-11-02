// IndexNow で更新URLを Bing などに通知する（Google は対象外）
// 使い方：
//   node scripts/indexnow.mjs                  本番サイトマップの全URLを送信
//   node scripts/indexnow.mjs <スラッグ|URL> …  指定したURLだけ送信
const SITE = 'https://www.oshikatsu-room.com';
const HOST = 'www.oshikatsu-room.com';
const KEY = '0877768a42bf3464626006a6971d0b91';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function fetchText(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${url} の取得に失敗しました（${res.status}）`);
	return res.text();
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

// サイトマップインデックスから子サイトマップをたどって全URLを集める
async function urlsFromSitemap() {
	const index = await fetchText(`${SITE}/sitemap-index.xml`);
	const urls = [];
	for (const sitemap of locs(index)) urls.push(...locs(await fetchText(sitemap)));
	return urls;
}

// スラッグなら記事URLに、URLならそのまま
function toUrl(arg) {
	if (/^https?:\/\//.test(arg)) return arg;
	return `${SITE}/blog/${arg.replace(/^\/+|\/+$/g, '').replace(/^blog\//, '')}/`;
}

const args = process.argv.slice(2);
const urlList = args.length ? args.map(toUrl) : await urlsFromSitemap();
if (urlList.length === 0) {
	console.error('送信するURLがありません');
	process.exit(1);
}

console.log(`送信するURL：${urlList.length}件`);
for (const u of urlList.slice(0, 5)) console.log(`  ${u}`);
if (urlList.length > 5) console.log(`  …ほか${urlList.length - 5}件`);

const res = await fetch(ENDPOINT, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json; charset=utf-8' },
	body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});
const ok = res.status === 200 || res.status === 202;
console.log(`ステータス：${res.status} ${ok ? '成功' : '失敗'}`);
if (!ok) {
	console.log(await res.text());
	process.exit(1);
}
