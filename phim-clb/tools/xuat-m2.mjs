// Xuất hình robot, ô sân và vật mùa 2 (Nhà máy) từ bộ vẽ vector của game ra public/robot/m2/ cho 10 phim gói mùa 2.
// Robot nhìn từ trên, mũi quay sang PHẢI (huong = 1), ô vuông 576 px (CANH 480 + lề tràn).
// Chạy: node tools/xuat-m2.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../public/robot/m2');
const PORT = 4209, CANH = 480, CANH_O = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const HN = [{ ma: 'hong-ngoai', o: 'tren' }];
const KC = [{ ma: 'khoang-cach', o: 'truoc' }];
const cfg = (tay, cam = []) => ({ than: 'xich', tay, camBien: cam });

// tên → [cấu hình, trạng thái, có lưỡi ủi]
const HINH = {
  'r1-banh': [{ than: 'hai-banh', tay: null, camBien: [] }, {}, false],
  'r1-banh-ngac': [{ than: 'hai-banh', tay: null, camBien: [] }, { mat: 'ngac' }, false],
  'xich': [cfg(null), {}, false],
  'xich-vui': [cfg(null), { mat: 'vui' }, false],
  'xich-ngac': [cfg(null), { mat: 'ngac' }, false],
  'xich-voi': [cfg('hoi'), { tay: { tuThe: 'tren' } }, false],
  'xich-voi-vui': [cfg('hoi'), { mat: 'vui', tay: { tuThe: 'tren' } }, false],
  'xich-voi-ngac': [cfg('hoi'), { mat: 'ngac', tay: { tuThe: 'tren' } }, false],
  'xich-voi-phun': [cfg('hoi'), { mat: 'vui', tay: { tuThe: 'tren', dangBanTruoc: true } }, false],
  'xich-hn': [cfg('hoi', HN), { tay: { tuThe: 'tren' } }, false],
  'xich-hn-vui': [cfg('hoi', HN), { mat: 'vui', tay: { tuThe: 'tren' } }, false],
  'xich-hn-ngac': [cfg('hoi', HN), { mat: 'ngac', tay: { tuThe: 'tren' } }, false],
  'xich-hn-do': [cfg('hoi', HN), { tay: { tuThe: 'tren' }, camBien: { bat: true } }, false],
  'xich-hn-phun': [cfg('hoi', HN), { mat: 'vui', tay: { tuThe: 'tren', dangBanTruoc: true }, camBien: { bat: true } }, false],
  'du': [cfg('hoi', HN), { tay: { tuThe: 'tren' } }, true],
  'du-vui': [cfg('hoi', HN), { mat: 'vui', tay: { tuThe: 'tren' } }, true],
  'du-ngac': [cfg('hoi', HN), { mat: 'ngac', tay: { tuThe: 'tren' } }, true],
  'du-do': [cfg('hoi', HN), { tay: { tuThe: 'tren' }, camBien: { bat: true } }, true],
  'du-phun': [cfg('hoi', HN), { mat: 'vui', tay: { tuThe: 'tren', dangBanTruoc: true }, camBien: { bat: true } }, true],
  'r2': [{ than: 'hai-banh', tay: 'kep', camBien: KC, son: 'lam' }, { tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }, false],
  'r2-vui': [{ than: 'hai-banh', tay: 'kep', camBien: KC, son: 'lam' }, { mat: 'vui', tay: { tuThe: 'tren', kep: true }, camBien: { mat: true, bat: true } }, false],
};

// ô sân → [mã ô, trạng thái]
const O_SAN = {
  'o-bang': ['bang', { huong: 1, pha: 0 }],
  'o-nut-ban': ['nut-ban', { bat: false }],
  'o-nut-ban-mo': ['nut-ban', { bat: true }],
  'o-lua-nho': ['lua', { suc: 1, pha: 0.2 }],
  'o-lua': ['lua', { suc: 3, pha: 0.5 }],
  'o-lua-tat': ['lua', { suc: 0 }],
  'o-cua': ['cua', {}],
  'o-nut-de': ['nut-de', {}],
  'o-dich': ['dich', {}],
  'o-rao': ['rao', {}],
};
const VAT = ['thung-nang', 'thung-go', 'bong'];

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
  for (const [ten, [c, tt, luoiUi]] of Object.entries(HINH)) {
    await luu(ten, await trang.evaluate(([c, tt, luoiUi, canh]) => {
      try {
        const goc = VeRobot.veCo(c, tt, 1, canh);
        const cv = document.createElement('canvas');
        cv.width = goc.width; cv.height = goc.height;
        const g = cv.getContext('2d');
        if (luoiUi) {
          // Vẽ lưỡi ủi thép vàng-cam ở mũi xe (bên phải, +x) trước khi vẽ thân để gắn liền vào đầu khung xích
          const cx = cv.width / 2, cy = cv.height / 2, k = canh / 100;
          g.save();
          g.translate(cx, cy);
          g.lineJoin = 'round'; g.lineCap = 'round';
          // Hai thanh chống nối khung vào lưỡi ủi
          g.fillStyle = '#475569'; g.strokeStyle = '#1E293B'; g.lineWidth = 2.2 * k;
          for (const s of [-1, 1]) {
            g.beginPath(); g.rect(30 * k, (s * 18 - 3.5) * k, 12 * k, 7 * k); g.fill(); g.stroke();
          }
          // Bản lưỡi ủi cong ở mũi trước
          g.fillStyle = '#F59E0B'; g.strokeStyle = '#1E293B'; g.lineWidth = 2.6 * k;
          g.beginPath();
          g.moveTo(40 * k, -34 * k);
          g.lineTo(48 * k, -28 * k);
          g.lineTo(48 * k, 28 * k);
          g.lineTo(40 * k, 34 * k);
          g.closePath();
          g.fill(); g.stroke();
          // Vạch cảnh báo trên lưỡi ủi
          g.fillStyle = '#1E293B';
          for (const y of [-20, -6, 8, 22]) {
            g.fillRect(42 * k, y * k, 4.5 * k, 5 * k);
          }
          g.restore();
        }
        g.drawImage(goc, 0, 0);
        return { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height };
      } catch (e) { return null; }
    }, [c, tt, luoiUi, CANH]));
  }
  for (const [ten, [ma, st]] of Object.entries(O_SAN)) {
    await luu(ten, await trang.evaluate(([ma, st, canh]) => {
      try {
        const cv = VeVector.o(ma, canh, st);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [ma, st, CANH_O]));
  }
  for (const ma of VAT) {
    await luu('vat-' + ma, await trang.evaluate(([ma, canh]) => {
      try {
        const cv = VeVector.vat(ma, canh, {});
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [ma, CANH_O]));
  }
  await tr.close();
} finally {
  may.kill();
}
