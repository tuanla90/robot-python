// Xuất hình robot từ bộ vẽ vector của game (VeRobot.veCo) ra public/robot/*.png cho phim Remotion.
// Robot nhìn từ trên, mũi quay sang PHẢI (hướng 1). Mỗi hình là một ô cạnh CANH px (có lề tràn của bộ vẽ).
// Chạy: npm run xuat-hinh   (cần Chrome; đường dẫn lấy từ biến CHROME hoặc chỗ cài mặc định)
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../public/robot');
const PORT = 4207;
const CANH = 480;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const R1 = { than: 'hai-banh', tay: null, camBien: [] };
const R2 = { than: 'hai-banh', tay: null, camBien: [], son: 'lam' };
const XICH = { than: 'xich', tay: null, camBien: [] };
// tên tệp → [cấu hình, trạng thái]. Bộ vẽ vector không vẽ khác theo bánh chạy (wl / wr / ph cho ra hình y hệt), nên phim tự vẽ lớp bánh lăn (kit.tsx Robot).
const HINH = {
  'r1': [R1, {}],
  'r1-vui': [R1, { mat: 'vui' }],
  'r1-ngac': [R1, { mat: 'ngac' }],
  'r1-xoay': [R1, { mat: 'xoay' }],
  'r2': [R2, {}],
  'r1-xich': [XICH, {}],
};

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await mkdir(ra, { recursive: true });
  for (const [ten, [cfg, tt]] of Object.entries(HINH)) {
    const url = await trang.evaluate(([cfg, tt, canh]) => VeRobot.veCo(cfg, tt, 1, canh).toDataURL('image/png'), [cfg, tt, CANH]);
    await writeFile(resolve(ra, ten + '.png'), Buffer.from(url.split(',')[1], 'base64'));
    console.log('xong', ten);
  }
  // vật trên sân: thùng gỗ (PhimVector.o 'crate', cạnh 14·s px)
  for (const [ten, ma] of [['thung-go', 'crate'], ['thung-nang', 'thung']]) {
    const url = await trang.evaluate(([ma, canh]) => {
      const e = PhimVector.o(ma, canh / 14, 0), cv = e && (e.toDataURL ? e : e.querySelector('canvas'));
      return cv ? cv.toDataURL('image/png') : null;
    }, [ma, 320]);
    if (url) { await writeFile(resolve(ra, ten + '.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('xong', ten); }
    else console.log('không lấy được', ten);
  }
  await tr.close();
} finally {
  may.kill();
}
