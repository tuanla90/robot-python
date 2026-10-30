// Chụp nhiều khung của một phim để soát nhanh (bundle một lần). Không xuất video.
// node tools/anh-soat.mjs <PhimMoDau|PhimXe> <khung1,khung2,...> [tỉ lệ=0.5]   → out/soat/<phim>-<khung>.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const goc = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [id, ds, tl = '0.5'] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveUrl = await bundle({entryPoint: resolve(goc, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id, browserExecutable: CHROME});
await mkdir(resolve(goc, 'out/soat'), {recursive: true});
for (const k of ds.split(',').map(Number)) {
  const output = resolve(goc, `out/soat/${id}-${k}.png`);
  await renderStill({serveUrl, composition, frame: k, output, scale: Number(tl), browserExecutable: CHROME});
  console.log(output);
}
