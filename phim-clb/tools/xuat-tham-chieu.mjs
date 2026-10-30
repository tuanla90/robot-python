// Xuất tấm tham chiếu R1 cho TopView: R1 các thân, các tay, cảm biến, cùng vật và ô môi trường của game, vẽ bằng bộ vẽ vector thật.
// Ra tam-anh/tc-r1/<tên>.png; ghép thành tấm ở bước sau (python). Chạy: node tools/xuat-tham-chieu.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../tam-anh/tc-r1');
const PORT = 4207, CANH = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const ROBOT = {
  'r1': { than: 'hai-banh', tay: null, camBien: [] },
  ...Object.fromEntries(['xich', 'nhen', 'drone', 'omni'].map((t) => ['than-' + t, { than: t, tay: null, camBien: [] }])),
  ...Object.fromEntries(['kep', 'xoay', 'hoi', 'nam-cham', 'nem', 'son'].map((t) => ['tay-' + t, { than: 'hai-banh', tay: t, camBien: [] }])),
  'cam-khoang-cach': { than: 'hai-banh', tay: null, camBien: [{ ma: 'khoang-cach', o: 'truoc' }] },
  'cam-ben': { than: 'hai-banh', tay: null, camBien: [{ ma: 'khoang-cach', o: 'hong' }] },
  'cam-hong-ngoai': { than: 'xich', tay: null, camBien: [{ ma: 'hong-ngoai', o: 'truoc' }] },
  'cam-tu': { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'truoc' }] },
  'cam-camera': { than: 'drone', tay: null, camBien: [{ ma: 'camera-4', o: 'truoc' }] },
  'r2': { than: 'hai-banh', tay: 'kep', camBien: [], son: 'lam' },
};
const VAT = ['thung-go', 'thung-nang', 'khoi-sat', 'nam-cham', 'bong'];
const O = ['tuong', 'san', 'co', 'cua', 'nut-de', 'nut-ban', 'bang', 'dem-tu', 'ho', 'lua', 'sac', 'san-mau', 'ban-xoay', 'rao', 'cong', 'dich'];

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await mkdir(ra, { recursive: true });
  const luu = async (ten, url) => { if (url) { await writeFile(resolve(ra, ten + '.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('xong', ten); } else console.log('KHÔNG', ten); };
  for (const [ten, cfg] of Object.entries(ROBOT)) {
    await luu(ten, await trang.evaluate(([cfg, canh]) => { try { return VeRobot.veCo(cfg, { mat: 'vui' }, 1, canh).toDataURL('image/png'); } catch (e) { return null; } }, [cfg, CANH]));
  }
  // R1 cỡ lớn cho ô chính của tấm tham chiếu
  await luu('r1-lon', await trang.evaluate(([cfg]) => VeRobot.veCo(cfg, { mat: 'vui' }, 1, 900).toDataURL('image/png'), [ROBOT.r1]));
  for (const [loai, ds] of [['vat', VAT], ['o', O]]) {
    for (const ma of ds) {
      await luu(loai + '-' + ma, await trang.evaluate(([loai, ma, canh]) => {
        try {
          const v = VeVector[loai](ma, canh, {}); const cv = v && (v.toDataURL ? v : v.querySelector && v.querySelector('canvas'));
          if (cv) return cv.toDataURL('image/png');
          const c = document.createElement('canvas'); c.width = c.height = canh; const g = c.getContext('2d');
          const d = VeVector.lay(loai, ma); g.scale(canh / 100, canh / 100); d.ve(g, {}, VeVector.mauDoi(''), VeVector.H); return c.toDataURL('image/png');
        } catch (e) { return null; }
      }, [loai, ma, CANH]));
    }
  }
  await tr.close();
} finally {
  may.kill();
}
