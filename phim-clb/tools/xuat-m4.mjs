// Xuất hình robot, ô sân, vật mùa 4 (Bến sông · Tàu thủy lợi R1) ra public/robot/m4/,
// (nền dọc public/nen-doc/mua-song.png và bác Ba public/nguoi/ba-a.png nay là ảnh TopView, không xuất từ đây).
// Chạy: node tools/xuat-m4.mjs
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = existsSync(resolve(goc, '../../server.mjs')) ? resolve(goc, '../..') : 'd:/Users/tuanla2/game/doi-robot-chan-hung';
const ra = resolve(goc, '../public/robot/m4');
const PORT = 4214, CANH = 480, CANH_O = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await mkdir(ra, { recursive: true });

  const luu = async (duongDan, kq) => {
    if (kq && kq.url) {
      await writeFile(duongDan, Buffer.from(kq.url.split(',')[1], 'base64'));
      console.log('xong', duongDan.split(/[\\/]/).pop(), kq.w + 'x' + kq.h);
    } else console.log('KHÔNG', duongDan);
  };

  // Các part xuong, day-keo, dong-chay, cau, moc-cau, quet-ma, nuoc, dong-nuoc, cong-thuy-loi, phao-dich, be-go, luc-binh đã nạp sẵn từ hoc/game/ve-vector-*-song.js & *-cang.js.
  // Chỉ đăng ký thêm ô bo-da và vật phao-sat riêng cho phim mùa 4.
  await trang.evaluate(() => {
    const V = window.VeVector, BM = window.BangMau;
    if (!V.lay('o', 'bo-da')) {
      V.dangKy({
        loai: 'o', ma: 'bo-da', ten: 'Bờ kè đá',
        ve: function (g, s, H) {
          g.fillStyle = '#475569'; g.fillRect(0, 0, 100, 100);
          H.bo(g, 3, 3, 94, 94, 8);
          g.fillStyle = H.gradDoc(g, 0, 3, 0, 97, [[0, '#CBD5E1'], [1, '#94A3B8']]);
          g.fill();
          H.vien(g, BM.vecVien, 3);
          H.bo(g, 12, 12, 36, 34, 5); H.to(g, '#E2E8F0'); H.vien(g, '#64748B', 2);
          H.bo(g, 52, 12, 36, 34, 5); H.to(g, '#CBD5E1'); H.vien(g, '#64748B', 2);
          H.bo(g, 12, 52, 50, 36, 5); H.to(g, '#CBD5E1'); H.vien(g, '#64748B', 2);
          H.bo(g, 66, 52, 22, 36, 5); H.to(g, '#E2E8F0'); H.vien(g, '#64748B', 2);
        }
      });
    }
    if (!V.lay('vat', 'phao-sat')) {
      V.dangKy({
        loai: 'vat', ma: 'phao-sat', ten: 'Thùng phao sắt',
        ve: function (g, s, H) {
          H.bo(g, 12, 12, 76, 76, 14);
          g.fillStyle = H.gradDoc(g, 0, 12, 0, 88, [[0, '#E2E8F0'], [1, '#94A3B8']]);
          g.fill();
          H.vien(g, BM.vecVien, 3.2);
          H.bo(g, 8, 22, 10, 56, 5); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 2.2);
          H.bo(g, 82, 22, 10, 56, 5); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 2.2);
          H.duong(g, 'M26 36 H74 M26 64 H74'); H.vien(g, '#475569', 3);
        }
      });
    }
  });

  const CAM = [{ ma: 'dong-chay', o: 'tren' }];
  const CAM_CAU = [{ ma: 'quet-ma', o: 'tren' }];
  const cfg = (tay = null, cam = []) => ({ than: 'xuong', tay, camBien: cam });
  const cfgCau = (tay = null, cam = []) => ({ than: 'cau', tay, camBien: cam });

  const HINH = {
    'nhen': [{ than: 'nhen', tay: null, camBien: [] }, {}],
    'nhen-ngac': [{ than: 'nhen', tay: null, camBien: [] }, { mat: 'ngac' }],
    'cau': [cfgCau(), {}],
    'cau-vui': [cfgCau(), { mat: 'vui' }],
    'cau-du': [cfgCau('moc-cau', CAM_CAU), { ray: true, tay: { doi: true }, camBien: { bat: true, can: true } }],
    'cau-du-vui': [cfgCau('moc-cau', CAM_CAU), { ray: true, mat: 'vui', tay: { doi: true }, camBien: { bat: true, can: true } }],
    'xuong': [cfg(), {}],
    'xuong-vui': [cfg(), { mat: 'vui', chay: true }],
    'xuong-ngac': [cfg(), { mat: 'ngac' }],
    'xuong-keo': [cfg('day-keo'), {}],
    'xuong-keo-vui': [cfg('day-keo'), { mat: 'vui', chay: true }],
    'xuong-keo-ngac': [cfg('day-keo'), { mat: 'ngac' }],
    'xuong-keo-day': [cfg('day-keo'), { chay: true, tay: { day: true } }],
    'xuong-do': [cfg('day-keo', CAM), {}],
    'xuong-do-vui': [cfg('day-keo', CAM), { mat: 'vui', chay: true }],
    'xuong-do-ngac': [cfg('day-keo', CAM), { mat: 'ngac' }],
    'xuong-do-bat': [cfg('day-keo', CAM), { chay: true, camBien: { bat: true, nang: true } }],
    'xuong-neo': [cfg('day-keo', CAM), { neo: true, camBien: { bat: true } }],
    'xuong-neo-vui': [cfg('day-keo', CAM), { neo: true, mat: 'vui', tay: { day: true }, camBien: { bat: true } }],
    'xuong-dat': [cfg('day-keo', CAM), { dat: true, dangDat: true, chay: true }],
    'xuong-dat-vui': [cfg('day-keo', CAM), { dat: true, dangDat: true, chay: true, mat: 'vui' }],
    'xuong-du': [cfg('day-keo', CAM), { dat: true, neo: true, chay: true, camBien: { bat: true, nang: true } }],
    'xuong-du-vui': [cfg('day-keo', CAM), { dat: true, neo: true, chay: true, mat: 'vui', tay: { day: true }, camBien: { bat: true, nang: true } }],
    'r2': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { tay: { bat: false } }],
    'r2-hut': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { tay: { bat: true, cuc: 'N' } }],
    'r2-vui': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { mat: 'vui', tay: { bat: true, cuc: 'N' } }],
  };

  const O_SAN = {
    'o-nuoc': ['nuoc', {}],
    'o-dong-len': ['dong-nuoc', { huong: 0 }],
    'o-dong-phai': ['dong-nuoc', { huong: 1 }],
    'o-dong-xuong': ['dong-nuoc', { huong: 2 }],
    'o-dong-trai': ['dong-nuoc', { huong: 3 }],
    'o-xiet-len': ['dong-nuoc', { huong: 0, xiet: true }],
    'o-xiet-phai': ['dong-nuoc', { huong: 1, xiet: true }],
    'o-xiet-xuong': ['dong-nuoc', { huong: 2, xiet: true }],
    'o-xiet-trai': ['dong-nuoc', { huong: 3, xiet: true }],
    'o-cong-dong': ['cong-thuy-loi', { mo: false }],
    'o-cong-mo': ['cong-thuy-loi', { mo: true }],
    'o-van-cong': ['nut-ban', { bat: false }],
    'o-van-cong-bat': ['nut-ban', { bat: true }],
    'o-bo-da': ['bo-da', {}],
    'o-phao-dich': ['phao-dich', {}],
    'o-bang-phai': ['bang', { huong: 1, pha: 0 }],
  };

  const VAT = {
    'vat-be-go': ['be-go', {}],
    'vat-luc-binh': ['luc-binh', {}],
    'vat-phao-sat': ['phao-sat', {}],
    'vat-khoi-sat': ['khoi-sat', {}],
  };

  for (const [ten, [c, tt]] of Object.entries(HINH)) {
    await luu(resolve(ra, ten + '.png'), await trang.evaluate(([c, tt, canh]) => {
      try {
        const cv = VeRobot.veCo(c, tt, 1, canh);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [c, tt, CANH]));
  }

  for (const [ten, [ma, st]] of Object.entries(O_SAN)) {
    await luu(resolve(ra, ten + '.png'), await trang.evaluate(([ma, st, canh]) => {
      try {
        const cv = VeVector.o(ma, canh, st);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [ma, st, CANH_O]));
  }

  for (const [ten, [ma, st]] of Object.entries(VAT)) {
    await luu(resolve(ra, ten + '.png'), await trang.evaluate(([ma, st, canh]) => {
      try {
        const cv = VeVector.vat(ma, canh, st);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [ma, st, CANH_O]));
  }

  // Nền dọc Bến sông vẽ tạm (public/nen-doc/mua-song.png, 1080x1920). 31/10 đã thay bằng ảnh TopView: chỉ vẽ lại khi NEN_TAM=1.
  if (process.env.NEN_TAM) await luu(resolve(goc, '../public/nen-doc/mua-song.png'), await trang.evaluate(() => {
    const cv = document.createElement('canvas');
    cv.width = 1080; cv.height = 1920;
    const g = cv.getContext('2d');
    // Nền sông xanh biếc từ trên xuống
    const gr = g.createLinearGradient(0, 0, 0, 1920);
    gr.addColorStop(0, '#0284C7');
    gr.addColorStop(0.5, '#0369A1');
    gr.addColorStop(1, '#075985');
    g.fillStyle = gr;
    g.fillRect(0, 0, 1080, 1920);

    // Gợn sóng mặt sông ở vùng trung tâm
    g.strokeStyle = 'rgba(186, 230, 253, 0.18)';
    g.lineWidth = 6;
    for (let y = 180; y < 1800; y += 140) {
      g.beginPath();
      for (let x = 140; x <= 940; x += 80) {
        g.quadraticCurveTo(x + 20, y - 12, x + 40, y);
        g.quadraticCurveTo(x + 60, y + 12, x + 80, y);
      }
      g.stroke();
    }

    // Hai bờ kè đá + cầu gỗ bến sông ở rìa trái (x: 0..145) và rìa phải (x: 935..1080)
    const veBo = (x0, w, isLeft) => {
      g.fillStyle = '#CBD5E1';
      g.fillRect(x0, 0, w, 1920);
      g.strokeStyle = '#1E1B4B';
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(isLeft ? x0 + w : x0, 0);
      g.lineTo(isLeft ? x0 + w : x0, 1920);
      g.stroke();
      for (let y = 40; y < 1900; y += 120) {
        g.fillStyle = y % 240 === 40 ? '#E2E8F0' : '#94A3B8';
        g.fillRect(x0 + 14, y, w - 28, 96);
        g.strokeRect(x0 + 14, y, w - 28, 96);
      }
    };
    veBo(0, 135, true);
    veBo(945, 135, false);

    // Cầu tàu gỗ bên trái (y: 480..760) và bên phải (y: 1020..1300)
    const veCau = (x, y, w, h) => {
      g.fillStyle = '#D97706';
      g.strokeStyle = '#1E1B4B';
      g.lineWidth = 6;
      for (let py = y; py < y + h; py += 36) {
        g.fillRect(x, py, w, 28);
        g.strokeRect(x, py, w, 28);
      }
    };
    veCau(90, 520, 75, 240);
    veCau(915, 1080, 75, 240);

    // Trạm thủy lợi mái xanh ở góc trên và bụi cây/lục bình ven bờ
    for (const [cx, cy, r] of [[80, 220, 55], [1000, 260, 60], [75, 1650, 65], [1010, 1620, 60]]) {
      g.fillStyle = '#22C55E';
      g.strokeStyle = '#1E1B4B';
      g.lineWidth = 7;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    return { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height };
  }));

  await tr.close();
} finally {
  may.kill();
}
