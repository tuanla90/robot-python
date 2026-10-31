// Xuất hình robot, ô sân và vật mùa 3 (Bãi tái chế) từ bộ vẽ vector của game ra public/robot/m3/ cho 10 phim gói mùa 3.
// Nhện nhìn từ trên, mắt hướng LÊN (-y, góc 0 trong m3.tsx); xe xích hướng PHẢI (+x).
// Chạy: node tools/xuat-m3.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
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
  'nhen-tu-vui': [cfg('nam-cham', TU), { mat: 'vui', tay: { bat: false }, camBien: { bat: true } }, 'tat', false],
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
  for (const [ten, [c, tt, ncU, luoiUi]] of Object.entries(HINH)) {
    await luu(ten, await trang.evaluate(([c, tt, ncU, luoiUi, canh]) => {
      try {
        const goc = VeRobot.veCo(c, tt, 1, canh);
        const cv = document.createElement('canvas');
        cv.width = goc.width; cv.height = goc.height;
        const g = cv.getContext('2d');
        const cx = cv.width / 2, cy = cv.height / 2, k = canh / 100;
        if (luoiUi) {
          g.save(); g.translate(cx, cy); g.lineJoin = 'round';
          g.fillStyle = '#475569'; g.strokeStyle = '#1E293B'; g.lineWidth = 2.2 * k;
          for (const s of [-1, 1]) { g.beginPath(); g.rect(30 * k, (s * 18 - 3.5) * k, 12 * k, 7 * k); g.fill(); g.stroke(); }
          g.fillStyle = '#EC4899'; g.strokeStyle = '#1E293B'; g.lineWidth = 2.6 * k;
          g.beginPath(); g.moveTo(40 * k, -34 * k); g.lineTo(48 * k, -28 * k); g.lineTo(48 * k, 28 * k); g.lineTo(40 * k, 34 * k); g.closePath(); g.fill(); g.stroke();
          g.restore();
        }
        if (ncU) {
          // Vẽ thêm hai gọng nam châm điện nhô lên phía trước đầu nhện (-y) có đầu cực đỏ (N) và xanh (S) rõ nét
          g.save(); g.translate(cx, cy); g.lineJoin = 'round'; g.lineCap = 'round';
          g.fillStyle = '#64748B'; g.strokeStyle = '#1E293B'; g.lineWidth = 2.4 * k;
          g.beginPath();
          g.rect(-18 * k, -42 * k, 9 * k, 14 * k);
          g.rect(9 * k, -42 * k, 9 * k, 14 * k);
          g.rect(-18 * k, -32 * k, 36 * k, 7 * k);
          g.fill(); g.stroke();
          // Đầu cực trái (Đỏ N khi tat hoặc N; Xanh S khi S)
          const mauTrai = ncU === 'S' ? '#2563EB' : '#EF4444';
          const mauPhai = ncU === 'N' ? '#EF4444' : '#2563EB';
          g.fillStyle = mauTrai; g.beginPath(); g.rect(-18 * k, -48 * k, 9 * k, 8 * k); g.fill(); g.stroke();
          g.fillStyle = mauPhai; g.beginPath(); g.rect(9 * k, -48 * k, 9 * k, 8 * k); g.fill(); g.stroke();
          if (ncU === 'N' || ncU === 'S') {
            g.strokeStyle = ncU === 'N' ? 'rgba(239,68,68,0.85)' : 'rgba(37,99,235,0.85)';
            g.lineWidth = 2.2 * k;
            g.beginPath(); g.arc(0, -49 * k, 12 * k, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
            g.beginPath(); g.arc(0, -49 * k, 18 * k, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
          }
          g.restore();
        }
        g.drawImage(goc, 0, 0);
        return { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height };
      } catch (e) { return null; }
    }, [c, tt, ncU, luoiUi, CANH]));
  }
  for (const [ten, [ma, st]] of Object.entries(O_SAN)) {
    await luu(ten, await trang.evaluate(([ma, st, canh]) => {
      try {
        const cv = VeVector.o(ma, canh, st);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
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
