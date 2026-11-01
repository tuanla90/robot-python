// Xuất hình robot, ô sân và vật mùa 3 (Bãi tái chế) từ bộ vẽ vector của game ra public/robot/m3/ cho 10 phim gói mùa 3.
// Nhện nhìn từ trên, mắt hướng LÊN (-y, góc 0 trong m3.tsx); xe xích hướng PHẢI (+x).
// Chạy: node tools/xuat-m3.mjs
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = existsSync(resolve(goc, '../../server.mjs')) ? resolve(goc, '../..') : 'd:/Users/tuanla2/game/doi-robot-chan-hung';
const ra = resolve(goc, '../public/robot/m3');
const PORT = 4211, CANH = 480, CANH_O = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const TU = [{ ma: 'tu', o: 'hong' }];
const cfg = (tay, cam = []) => ({ than: 'nhen', tay, camBien: cam });

// tên → [cấu hình, trạng thái, thêm nam châm chữ U ('tat' | 'N' | 'S' | null), thêm lưỡi ủi]
const HINH = {
  'xich': [{ than: 'xich', tay: null, camBien: [] }, {}, null, false],
  'xich-ngac': [{ than: 'xich', tay: null, camBien: [] }, { mat: 'ngac' }, null, false],
  'nhen': [cfg(null), {}, null, false],
  'nhen-vui': [cfg(null), { mat: 'vui' }, null, false],
  'nhen-ngac': [cfg(null), { mat: 'ngac' }, null, false],
  'nhen-nc': [cfg('nam-cham'), { tay: { bat: false } }, 'tat', false],
  'nhen-nc-vui': [cfg('nam-cham'), { mat: 'vui', tay: { bat: true, cuc: 'N' } }, 'N', false],
  'nhen-nc-ngac': [cfg('nam-cham'), { mat: 'ngac', tay: { bat: false } }, 'tat', false],
  'nhen-nc-hut': [cfg('nam-cham'), { tay: { bat: true, cuc: 'N' } }, 'N', false],
  'nhen-tu': [cfg('nam-cham', TU), { tay: { bat: false } }, 'tat', false],
  'nhen-tu-vui': [cfg('nam-cham', TU), { mat: 'vui', tay: { bat: true, cuc: 'N' }, camBien: { bat: true } }, 'N', false],
  'nhen-tu-ngac': [cfg('nam-cham', TU), { mat: 'ngac', tay: { bat: false } }, 'tat', false],
  'nhen-tu-do': [cfg('nam-cham', TU), { tay: { bat: false }, camBien: { bat: true } }, 'tat', false],
  'nhen-tu-n': [cfg('nam-cham', TU), { tay: { bat: true, cuc: 'N' }, camBien: { bat: true } }, 'N', false],
  'nhen-tu-s': [cfg('nam-cham', TU), { tay: { bat: true, cuc: 'S' }, camBien: { bat: true } }, 'S', false],
  'nhen-co': [cfg('nam-cham', TU), { co: true, tay: { bat: false } }, 'tat', false],
  'r2': [{ than: 'xich', tay: null, camBien: [], son: 'lam' }, {}, null, true],
  'r2-vui': [{ than: 'xich', tay: null, camBien: [], son: 'lam' }, { mat: 'vui' }, null, true],
};

const O_SAN = {
  'o-ho': ['ho', {}],
  'o-dem-tu-n': ['dem-tu', { cuc: 'N' }],
  'o-dem-tu-s': ['dem-tu', { cuc: 'S' }],
  'o-nut-de': ['nut-de', {}],
  'o-cua': ['cua', {}],
  'o-bang': ['bang', { huong: 1, pha: 0 }],
  'o-nut-ban': ['nut-ban', { bat: false }],
  'o-nut-ban-mo': ['nut-ban', { bat: true }],
  'o-dich': ['dich', {}],
  'o-tuong-bai-tai-che': ['tuong-bai-tai-che', {}],
};
const VAT = {
  'vat-khoi-sat': ['khoi-sat', {}],
  'vat-nam-cham-n': ['nam-cham', { cuc: 'N' }],
  'vat-nam-cham-s': ['nam-cham', { cuc: 'S' }],
  'vat-thung-go': ['thung-go', {}],
  'vat-thung-nang': ['thung-nang', {}],
};

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await mkdir(ra, { recursive: true });
  const luu = async (ten, kq) => {
    if (kq && kq.url) {
      await writeFile(resolve(ra, ten + '.png'), Buffer.from(kq.url.split(',')[1], 'base64'));
      console.log('xong', ten, kq.w + 'x' + kq.h);
    } else console.log('KHÔNG', ten);
  };
  for (const [ten, [c, tt, _ncU, luoiUi]] of Object.entries(HINH)) {
    await luu(ten, await trang.evaluate(([c, tt, luoiUi, canh]) => {
      try {
        const huong = c.than === 'nhen' ? 2 : 1;
        const cv = VeRobot.veCo(c, luoiUi ? { ...tt, xichDay: true } : tt, huong, canh);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [c, tt, luoiUi, CANH]));
  }
  for (const [ten, [ma, st]] of Object.entries(O_SAN)) {
    await luu(ten, await trang.evaluate(([ma, st, canh]) => {
      const orig = CanvasRenderingContext2D.prototype.fillRect;
      if (ma === 'tuong-bai-tai-che') {
        CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
          if (x === 0 && y === 0 && w === 100 && h === 100) return;
          return orig.call(this, x, y, w, h);
        };
        VeVector.xoaDem();
      }
      try {
        const cv = VeVector.o(ma, canh, st);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; } finally {
        CanvasRenderingContext2D.prototype.fillRect = orig;
      }
    }, [ma, st, CANH_O]));
  }
  for (const [ten, [ma, st]] of Object.entries(VAT)) {
    await luu(ten, await trang.evaluate(([ma, st, canh]) => {
      try {
        const cv = VeVector.vat(ma, canh, st);
        const c2 = cv || VeVector.o(ma, canh, st);
        return c2 ? { url: c2.toDataURL('image/png'), w: c2.width, h: c2.height } : null;
      } catch (e) { return null; }
    }, [ma, st, CANH_O]));
  }
  await tr.close();
} finally {
  may.kill();
}
