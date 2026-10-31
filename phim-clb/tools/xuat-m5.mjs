// Xuất hình robot, ô sân và vật mùa 5 (Nông trại hoa) từ bộ vẽ vector của game ra public/robot/m5/ cho 10 phim gói mùa 5.
// Drone có lồng bảo vệ cánh quạt quanh 4 mô-tơ; chỉ dùng 4 màu hoa (red, yellow, blue, green).
// Chạy: node tools/xuat-m5.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../public/robot/m5');
const PORT = 4212, CANH = 480, CANH_O = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const CAM = [{ ma: 'camera-4', o: 'tren' }];
const cfg = (tay = null, cam = []) => ({ than: 'drone', tay, camBien: cam });

// tên → [cấu hình, trạng thái]
const HINH = {
  'nhen': [{ than: 'nhen', tay: null, camBien: [] }, {}],
  'nhen-ngac': [{ than: 'nhen', tay: null, camBien: [] }, { mat: 'ngac' }],
  'drone': [cfg(), { wl: 1 }],
  'drone-vui': [cfg(), { wl: 1, mat: 'vui' }],
  'drone-ngac': [cfg(), { wl: 1, mat: 'ngac' }],
  'drone-dau': [cfg(), { wl: 0, wr: 0 }],
  'drone-son': [cfg('son'), { wl: 1, tay: { tuThe: 'tren', mauSon: 'red' } }],
  'drone-son-vui': [cfg('son'), { wl: 1, mat: 'vui', tay: { tuThe: 'tren', mauSon: 'red' } }],
  'drone-son-ngac': [cfg('son'), { wl: 1, mat: 'ngac', tay: { tuThe: 'tren', mauSon: 'red' } }],
  'drone-son-red': [cfg('son'), { wl: 1, tay: { tuThe: 'duoi', mauSon: 'red' } }],
  'drone-son-yellow': [cfg('son'), { wl: 1, tay: { tuThe: 'duoi', mauSon: 'yellow' } }],
  'drone-son-blue': [cfg('son'), { wl: 1, tay: { tuThe: 'duoi', mauSon: 'blue' } }],
  'drone-son-green': [cfg('son'), { wl: 1, tay: { tuThe: 'duoi', mauSon: 'green' } }],
  'drone-cam': [cfg('son', CAM), { wl: 1, tay: { tuThe: 'tren', mauSon: 'red' } }],
  'drone-cam-vui': [cfg('son', CAM), { wl: 1, mat: 'vui', tay: { tuThe: 'tren', mauSon: 'yellow' } }],
  'drone-cam-ngac': [cfg('son', CAM), { wl: 1, mat: 'ngac', tay: { tuThe: 'tren', mauSon: 'red' } }],
  'drone-cam-do': [cfg('son', CAM), { wl: 1, tay: { tuThe: 'tren', mauSon: 'red' }, camBien: { bat: true } }],
  'drone-cam-dau': [cfg('son', CAM), { wl: 0, wr: 0, tay: { tuThe: 'tren', mauSon: 'green' }, camBien: { bat: true } }],
  'drone-cam-red': [cfg('son', CAM), { wl: 1, tay: { tuThe: 'duoi', mauSon: 'red' }, camBien: { bat: true } }],
  'drone-cam-yellow': [cfg('son', CAM), { wl: 1, tay: { tuThe: 'duoi', mauSon: 'yellow' }, camBien: { bat: true } }],
  'drone-cam-blue': [cfg('son', CAM), { wl: 1, tay: { tuThe: 'duoi', mauSon: 'blue' }, camBien: { bat: true } }],
  'drone-cam-green': [cfg('son', CAM), { wl: 1, tay: { tuThe: 'duoi', mauSon: 'green' }, camBien: { bat: true } }],
  'r2': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { tay: { bat: false } }],
  'r2-vui': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { mat: 'vui', tay: { bat: true, cuc: 'N' } }],
};

const MAU = ['red', 'yellow', 'blue', 'green'];
const O_SAN = {
  'o-co-non': ['co-non', {}],
  'o-bui-cay': ['bui-cay', {}],
  'o-sac': ['sac', {}],
  'o-rao': ['rao', {}],
  'o-ho': ['ho', {}],
  'o-dich': ['dich', {}],
};
for (const m of MAU) {
  O_SAN[`o-luong-${m}`] = ['luong-hoa', { mau: m }];
  O_SAN[`o-hoa-${m}`] = ['o-hoa', { mau: m }];
}
const VAT = { 'vat-khoi-sat': ['khoi-sat', {}] };
for (const m of MAU) VAT[`vat-bao-${m}`] = ['bao-hat', { mau: m }];

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
  for (const [ten, [c, tt]] of Object.entries(HINH)) {
    await luu(ten, await trang.evaluate(([c, tt, canh]) => {
      try {
        const goc = VeRobot.veCo(c, tt, 1, canh);
        const cv = document.createElement('canvas');
        cv.width = goc.width; cv.height = goc.height;
        const g = cv.getContext('2d');
        g.drawImage(goc, 0, 0);
        if (c.than === 'drone') {
          const k = (cv.width / VeVector.HE) * VeVector.CO_THAN;
          g.save();
          g.translate(cv.width / 2, cv.height / 2);
          g.scale(k, k);
          g.translate(-VeVector.TAM_THAN.x, -VeVector.TAM_THAN.y);
          for (const [cx, cy] of [[22, 29], [78, 29], [22, 83], [78, 83]]) {
            const rOut = 14.2;
            g.strokeStyle = 'rgba(30, 41, 59, 0.55)';
            g.lineWidth = 1.4;
            for (const a of [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]) {
              g.beginPath();
              g.moveTo(cx - Math.cos(a) * rOut, cy - Math.sin(a) * rOut);
              g.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
              g.stroke();
            }
            g.beginPath(); g.arc(cx, cy, rOut, 0, Math.PI * 2);
            g.strokeStyle = '#1E293B'; g.lineWidth = 3.6; g.stroke();
            g.strokeStyle = '#38BDF8'; g.lineWidth = 1.8; g.stroke();
          }
          g.restore();
        }
        return { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height };
      } catch (e) { return null; }
    }, [c, tt, CANH]));
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
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [ma, st, CANH_O]));
  }
  await tr.close();
} finally {
  may.kill();
}
