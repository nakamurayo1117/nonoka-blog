// photos-inbox/ の写真を、記事で使える webp に変換して src/assets/ に出力する。
//
// 使い方:
//   npm run photos -- IMG_1234.HEIC keyakizaka-illumination-night
//   node scripts/import-photos.mjs <photos-inbox 内のファイル名> <出力名（英小文字・数字・ハイフン）>
//
// - 横幅1600pxに縮小（それより小さい写真は拡大しない）
// - EXIF・位置情報などのメタデータはすべて削除（向きだけは画素に反映してから捨てる）
// - HEIC/HEIF は heic-convert で読み込む

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INBOX_DIR = path.join(ROOT, 'photos-inbox');
const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const MAX_WIDTH = 1600;
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
	console.error(message);
	process.exit(1);
}

const [inputName, outputName] = process.argv.slice(2);
if (!inputName || !outputName) {
	fail('使い方: npm run photos -- <photos-inbox 内のファイル名> <出力名>\n例: npm run photos -- IMG_1234.HEIC keyakizaka-illumination-night');
}
if (!NAME_RE.test(outputName)) {
	fail(`出力名は英小文字・数字・ハイフンだけにしてください: ${outputName}`);
}

const inputPath = path.join(INBOX_DIR, inputName);
if (!existsSync(inputPath)) {
	fail(`photos-inbox/ に見つかりません: ${inputName}`);
}
const outputPath = path.join(ASSETS_DIR, `${outputName}.webp`);
if (existsSync(outputPath)) {
	fail(`同じ名前の画像がすでにあります（上書きしません）: src/assets/${outputName}.webp`);
}

let input = readFileSync(inputPath);
if (/\.(heic|heif)$/i.test(inputName)) {
	// HEIC は sharp で読めないので、いったん JPEG に変換する（EXIF の向きは下の rotate() で反映）
	input = Buffer.from(await heicConvert({ buffer: input, format: 'JPEG', quality: 1 }));
}

// sharp は withMetadata() / keepMetadata() を付けない限りメタデータを出力しない
const info = await sharp(input)
	.rotate()
	.resize({ width: MAX_WIDTH, withoutEnlargement: true })
	.webp({ quality: 80 })
	.toFile(outputPath);

const meta = await sharp(outputPath).metadata();
if (meta.exif || meta.xmp || meta.iptc) {
	fail(`メタデータが残っています。出力を確認してください: ${outputPath}`);
}

console.log(`src/assets/${outputName}.webp（${info.width}×${info.height}、${Math.round(info.size / 1024)}KB、メタデータなし）`);
