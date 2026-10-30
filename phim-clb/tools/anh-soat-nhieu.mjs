// Như anh-soat.mjs nhưng nhiều phim một lần bundle: node tools/anh-soat-nhieu.mjs <tỉ lệ> <phim:k1,k2,...> <phim:...> ...
// Khung âm = tính từ cuối phim (vd -1 = khung cuối). Ra out/soat/<phim>-<khung>.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const goc = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [tl, ...ds] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveUrl = await bundle({entryPoint: resolve(goc, 'src/index.ts')});
await mkdir(resolve(goc, 'out/soat'), {recursive: true});
for (const muc of ds) {
  const [id, khung] = muc.split(':');
  const composition = await selectComposition({serveUrl, id, browserExecutable: CHROME});
  for (let k of khung.split(',').map(Number)) {
    if (k < 0) k = composition.durationInFrames + k;
    const output = resolve(goc, `out/soat/${id}-${k}.png`);
    await renderStill({serveUrl, composition, frame: k, output, scale: Number(tl), browserExecutable: CHROME});
    console.log(id, k, composition.durationInFrames);
  }
}
