// Đóng gói phim CLB để game chiếu thẳng trên web (không xuất mp4): src/web/entry.tsx + React + @remotion/player → hoc/game/phim-clb/phim-clb.js.
//   node tools/web/dong-goi.mjs        (chạy từ phim-clb/)
// 1. Ghi src/web/ds-goi.ts: mã 10 gói mỗi mùa có phim, lấy theo thứ tự ở hoc/thu-tu-chuong.js (gói thứ n mùa m ↔ phim M<m>G<n>-Mo).
// 2. Ghi hoc/game/phim-clb/ds.js: danh sách gói có phim, để phim-goi.js biết gói nào chiếu phim CLB mà chưa phải tải gói lớn.
// 3. esbuild: mọi `import 'remotion'` đi qua shim staticFile (ảnh .png / .jpg → .webp, gốc là thư mục chứa phim-clb.js).
// 4. tools/web/nen-anh.py: chép, thu nhỏ ảnh sang hoc/game/phim-clb/a/.
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const MUA = [1, 2, 3];
const require = createRequire(import.meta.url);
const GAME = path.resolve('..', 'hoc', 'game');
const RA = path.join(GAME, 'phim-clb');

const TT = require('../../../hoc/thu-tu-chuong.js');
require('../../../hoc/lo-trinh-hoc.js');
const dsGoi = Object.fromEntries(MUA.map((m) => [m, TT.goi.filter((g) => g.mua === `mua-${m}`).map((g) => g.ma)]));
for (const [m, ds] of Object.entries(dsGoi)) if (ds.length !== 10) throw new Error(`mùa ${m} có ${ds.length} gói, phim cần 10`);
fs.writeFileSync('src/web/ds-goi.ts', `// Sinh bởi tools/web/dong-goi.mjs từ hoc/thu-tu-chuong.js, đừng sửa tay.\nexport const DS_GOI: Record<string, string[]> = ${JSON.stringify(dsGoi, null, 2)};\n`);
fs.mkdirSync(RA, {recursive: true});
fs.writeFileSync(path.join(RA, 'ds.js'), `// Sinh bởi phim-clb/tools/web/dong-goi.mjs: gói có phim CLB (phim-goi.js tải phim-clb.js khi cần).\nwindow.PhimCLBDs = ${JSON.stringify(Object.values(dsGoi).flat())};\n`);

const SHIM = path.resolve('tools/web/remotion-shim.ts');
const quaShim = {
  name: 'qua-shim',
  setup(b) {
    b.onResolve({filter: /^remotion$/}, (a) => (a.importer === SHIM ? undefined : {path: SHIM}));
  },
};
await build({
  entryPoints: ['src/web/entry.tsx'],
  outfile: path.join(RA, 'phim-clb.js'),
  bundle: true, minify: true, format: 'iife', target: 'es2019', jsx: 'automatic',
  define: {'process.env.NODE_ENV': '"production"'},
  plugins: [quaShim], logLevel: 'warning', legalComments: 'none',
});
console.error('phim-clb.js', (fs.statSync(path.join(RA, 'phim-clb.js')).size / 1e6).toFixed(2), 'MB');
execFileSync('python', ['tools/web/nen-anh.py'], {stdio: 'inherit'});
