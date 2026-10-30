// Xuất hình robot và ô sân mùa 1 (Kho hàng) từ bộ vẽ vector của game ra public/robot/m1/ cho 10 phim gói mùa 1.
// Robot nhìn từ trên, mũi quay sang PHẢI, ô vuông 576 px (CANH 480 + lề tràn của bộ vẽ, cùng cỡ r1.png mà kit.tsx đo bánh).
// Chạy: node tools/xuat-m1.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../public/robot/m1');
const PORT = 4208, CANH = 480, CANH_O = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const cfg = (tay, cam = []) => ({ than: 'hai-banh', tay, camBien: cam });
const TRUOC = [{ ma: 'khoang-cach', o: 'truoc' }];
const DU = [{ ma: 'khoang-cach', o: 'truoc' }, { ma: 'khoang-cach', o: 'hong' }];
// tên → [cấu hình, trạng thái]
const HINH = {
  'r1': [cfg(null), {}],
  'r1-ngac': [cfg(null), { mat: 'ngac' }],
  'r1-vui': [cfg(null), { mat: 'vui' }],
  'kep': [cfg('kep'), { tay: { tuThe: 'tren', kep: false } }],
  'kep-ngac': [cfg('kep'), { mat: 'ngac', tay: { tuThe: 'tren', kep: false } }],
  'kep-vui': [cfg('kep'), { mat: 'vui', tay: { tuThe: 'tren', kep: true } }],
  'kep-ha': [cfg('kep'), { tay: { tuThe: 'duoi', kep: false } }],
  'kep-cam': [cfg('kep', TRUOC), { tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }],
  'kep-cam-ngac': [cfg('kep', TRUOC), { mat: 'ngac', tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }],
  'kep-cam-vui': [cfg('kep', TRUOC), { mat: 'vui', tay: { tuThe: 'tren', kep: false }, camBien: { mat: true, bat: true } }],
  'xoay': [cfg('xoay', TRUOC), { tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }],
  'xoay-vui': [cfg('xoay', TRUOC), { mat: 'vui', tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }],
  'du': [cfg('xoay', DU), { tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }],
  'du-vui': [cfg('xoay', DU), { mat: 'vui', tay: { tuThe: 'tren', kep: false }, camBien: { mat: true, bat: true } }],
  'du-ngac': [cfg('xoay', DU), { mat: 'ngac', tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }],
  'r2': [{ than: 'hai-banh', tay: 'kep', camBien: [], son: 'lam' }, { tay: { tuThe: 'tren', kep: false } }],
  'r2-vui': [{ than: 'hai-banh', tay: 'kep', camBien: [], son: 'lam' }, { mat: 'vui', tay: { tuThe: 'tren', kep: true } }],
};
const O = ['tuong', 'san', 'cua', 'nut-de', 'dich', 'co'];
const VAT = ['thung-go'];

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await mkdir(ra, { recursive: true });
  const luu = async (ten, url) => { if (url) { await writeFile(resolve(ra, ten + '.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('xong', ten); } else console.log('KHÔNG', ten); };
  for (const [ten, [c, tt]] of Object.entries(HINH)) {
    await luu(ten, await trang.evaluate(([c, tt, canh]) => { try { return VeRobot.veCo(c, tt, 1, canh).toDataURL('image/png'); } catch (e) { return null; } }, [c, tt, CANH]));
  }
  for (const [loai, ds] of [['vat', VAT], ['o', O]]) {
    for (const ma of ds) {
      await luu(loai + '-' + ma, await trang.evaluate(([loai, ma, canh]) => {
        try {
          const v = VeVector[loai](ma, canh, {}); const cv = v && (v.toDataURL ? v : v.querySelector && v.querySelector('canvas'));
          if (cv) return cv.toDataURL('image/png');
          const c = document.createElement('canvas'); c.width = c.height = canh; const g = c.getContext('2d');
          const d = VeVector.lay(loai, ma); g.scale(canh / 100, canh / 100); d.ve(g, {}, VeVector.mauDoi(''), VeVector.H); return c.toDataURL('image/png');
        } catch (e) { return null; }
      }, [loai, ma, CANH_O]));
    }
  }
  await tr.close();
} finally {
  may.kill();
}
