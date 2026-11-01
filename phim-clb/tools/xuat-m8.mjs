// Xuất hình các Robot Lai (kết hợp linh kiện 7 mùa), ô sân và vật mùa 8 (Về CLB · Giải cứu thị trấn) ra public/robot/m8/.
// Chạy: node tools/xuat-m8.mjs
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = existsSync(resolve(goc, '../../server.mjs')) ? resolve(goc, '../..') : 'd:/Users/tuanla2/game/doi-robot-chan-hung';
const ra = resolve(goc, '../public/robot/m8');
const PORT = 4218, CANH = 480, CANH_O = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await mkdir(ra, { recursive: true });

  const luu = async (duongDan, kq) => {
    if (kq && kq.url) {
      await writeFile(duongDan, Buffer.from(kq.url.split(',')[1], 'base64'));
      console.log('xong', duongDan.split(/[\\/]/).pop(), kq.w + 'x' + kq.h);
    } else console.log('KHÔNG', duongDan);
  };

  // Các part xuong, day-keo, loa, radar đã nạp sẵn trong choi.html; chỉ đăng ký thêm banh-gai, am-thanh, và các ô/vật mùa 8.
  await trang.evaluate(() => {
    const V = window.VeVector, BM = window.BangMau;

    // Thân bánh gai mùa 7 (bản 3D đồng bộ)
    V.dangKy({
      loai: 'than', ma: 'banh-gai', ten: 'Thân bánh gai',
      oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 71, y: 47 }, hongPhai: { x: 29, y: 47 }, tren: { x: 71, y: 78 }, sau: { x: 37, y: 27 } },
      oCam: { x: 63, y: 29 }, vo: { x: 23, y: 26, w: 54, h: 54 },
      ve: function (g, s, M, H) {
        for (const [bx, by] of [[14.5, 36.5], [85.5, 36.5], [14.5, 70.5], [85.5, 70.5]]) {
          const dir = bx < 50 ? -1 : 1;
          const ax = dir < 0 ? bx + 3.0 : bx - 11.5, fx = dir < 0 ? bx + 4.8 : bx - 7.6;
          H.bo(g, ax, by - 4.4, 8.5, 8.8, 1.8); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 2.2);
          H.bo(g, fx, by - 6.0, 2.8, 12.0, 1.0); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 1.6);
          for (const dy of [-8.5, 0, 8.5]) {
            g.beginPath(); g.moveTo(bx + dir * 4.5, by + dy - 3.6); g.lineTo(bx + dir * 13.5, by + dy); g.lineTo(bx + dir * 4.5, by + dy + 3.6); g.closePath();
            H.to(g, '#FACC15'); H.vien(g, BM.vecVien, 2.1);
          }
          H.bo(g, bx - 6.6, by - 13.5, 13.2, 27, 4.8); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 2.8);
          for (const dy of [-7.5, 0, 7.5]) {
            H.bo(g, bx - 4.8, by + dy - 2, 9.6, 4, 1.4); H.to(g, BM.vecBanhGach); H.vien(g, BM.vecVien, 1.2);
          }
        }
        H.bo(g, 23, 26, 54, 54, 18); g.fillStyle = H.gradVo(g, 23, 26, 54, 54); g.fill(); H.vien(g, BM.vecVien, 3.5);
        H.duong(g, 'M35 34 C33 44 33 53 35 62 M65 34 C67 44 67 53 65 62 M50 26 v11'); H.vien(g, BM.vecVoGhep, 2.5);
        H.duong(g, 'M31 36 C34 31 39 30 45 30'); H.vien(g, BM.vecVo, 4);
        H.kinh(g, M, 29, 57, 42, 15.5, s);
        H.angTen(g, M, 50, 27, 13, 5);
      }
    });

    V.dangKy({
      loai: 'cam-bien', ma: 'am-thanh', ten: 'Sonar', gan: 'tren', diemNeo: { x: 50, y: 50 },
      ve: function (g, s, M, H) {
        s = s || {};
        if (s.bat) {
          H.tron(g, 50, 50, 12.5); H.to(g, 'rgba(45, 212, 191, 0.35)');
          g.beginPath(); g.arc(50, 54, 10.5, 0.16 * Math.PI, 0.84 * Math.PI); H.vien(g, '#2DD4BF', 2.0);
        }
        H.tron(g, 50, 50, 8.2); g.fillStyle = H.gradVo(g, 41.8, 41.8, 16.4, 16.4); g.fill(); H.vien(g, BM.vecVien, 2.2);
        for (const dx of [-4.4, 4.4]) {
          H.elip(g, 50 + dx, 52.5, 3.6, 5.2); H.to(g, '#0D9488'); H.vien(g, BM.vecVien, 1.5);
          H.tron(g, 50 + dx, 53.5, 1.8); H.to(g, '#5EEAD4');
        }
        H.tron(g, 50, 46.5, 1.8); H.to(g, '#FACC15'); H.vien(g, BM.vecVien, 1);
      }
    });

    // Ô nước, đá ướt, dốc đá, đá tròn, đá chuông
    V.dangKy({
      loai: 'o', ma: 'nuoc-lu', ten: 'Nước lũ qua phố',
      ve: function (g, s, H) {
        g.fillStyle = '#0369A1'; g.fillRect(0, 0, 100, 100);
        H.bo(g, 3, 3, 94, 94, 8);
        g.fillStyle = H.gradDoc(g, 0, 3, 0, 97, [[0, '#38BDF8'], [1, '#0284C7']]); g.fill(); H.vien(g, BM.vecVien, 3);
        H.duong(g, 'M18 35 Q34 25 50 35 T82 35 M18 65 Q34 55 50 65 T82 65'); H.vien(g, '#BAE6FD', 4);
      }
    });

    V.dangKy({
      loai: 'o', ma: 'da-uot', ten: 'Đường trơn ướt',
      ve: function (g, s, H) {
        g.fillStyle = '#0F172A'; g.fillRect(0, 0, 100, 100);
        H.bo(g, 3, 3, 94, 94, 8);
        g.fillStyle = H.gradDoc(g, 0, 3, 0, 97, [[0, '#5EEAD4'], [1, '#0F766E']]); g.fill(); H.vien(g, BM.vecVien, 3);
        H.duong(g, 'M18 32 L38 18 M54 78 L80 58'); H.vien(g, '#CCFBF1', 4.5);
      }
    });

    V.dangKy({
      loai: 'vat', ma: 'da-tron', ten: 'Đá tròn',
      ve: function (g, s, H) {
        H.tron(g, 50, 50, 38);
        g.fillStyle = H.gradToa(g, 36, 34, 48, [[0, '#E2E8F0'], [0.55, '#94A3B8'], [1, '#475569']]); g.fill();
        H.vien(g, BM.vecVien, 3.8);
      }
    });

    V.dangKy({
      loai: 'vat', ma: 'da-chuong', ten: 'Đá chuông',
      ve: function (g, s, H) {
        g.beginPath(); g.moveTo(22, 80); g.lineTo(30, 18); g.lineTo(50, 10); g.lineTo(70, 18); g.lineTo(78, 80); g.closePath();
        g.fillStyle = H.gradDoc(g, 0, 10, 0, 80, [[0, '#FDE68A'], [0.5, '#F59E0B'], [1, '#92400E']]); g.fill();
        H.vien(g, BM.vecVien, 3.6);
        H.elip(g, 50, 48, 12, 20); H.to(g, '#0F172A'); H.vien(g, '#38BDF8', 2.8);
      }
    });
  });

  const HINH = {
    'banh-ngac': [{ than: 'hai-banh', tay: 'kep', camBien: [] }, { mat: 'ngac' }],
    // G1: Nhện + Tay gắp + Khoảng cách
    'lai-nhen-kep': [{ than: 'nhen', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hongTrai' }] }, { mat: 'vui', tay: { kep: true } }],
    // G2: Xích + Máy ném + Hồng ngoại
    'lai-xich-nem': [{ than: 'xich', tay: 'nem', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }, { mat: 'vui', tay: { ngam: 2, cam: true } }],
    // G3: Bánh gai + Máy sơn + Camera 4 hướng
    'lai-gai-cam': [{ than: 'banh-gai', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] }, { mat: 'vui', camBien: { mat: true } }],
    // G4: Xuồng + Nam châm + Cảm biến từ
    'lai-xuong-tu': [{ than: 'xuong', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hongTrai' }] }, { mat: 'vui', tay: { bat: true, cuc: 'N' } }],
    // G5: Omni + Dây phao kéo + Radar
    'lai-omni-keo': [{ than: 'omni', tay: 'day-keo', camBien: [{ ma: 'radar', o: 'tren' }] }, { mat: 'vui' }],
    // G6: Drone + Nam châm + Camera bụng
    'lai-drone-tu': [{ than: 'drone', tay: 'nam-cham', camBien: [{ ma: 'camera-bay', o: 'bung' }] }, { mat: 'vui', tay: { bat: true, cuc: 'N' } }],
    // G7: Omni + Loa cộng hưởng + Tai Sonar
    'lai-omni-loa': [{ than: 'omni', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] }, { mat: 'vui', tay: { bat: true, notLoa: 5, pha: 0.35 }, camBien: { bat: true } }],
    // G8–G10: Cặp Robot Lai tối thượng của Sola (Bánh gai + Loa + Radar) & Luna (Drone + Máy sơn + Camera 4 hướng, sơn lam)
    'sola-bot': [{ than: 'banh-gai', tay: 'loa', camBien: [{ ma: 'radar', o: 'tren' }, { ma: 'tu', o: 'hongTrai' }] }, { mat: 'vui', tay: { bat: true, notLoa: 5, pha: 0.35 }, camBien: { bat: true, mat: true } }],
    'luna-bot': [{ than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }, { ma: 'camera-bay', o: 'bung' }], son: 'lam' }, { wl: 1, mat: 'vui', tay: { tuThe: 'duoi', mauSon: 'yellow', pha: 0.25 }, camBien: { bat: true, mat: true } }],
  };

  const O_SAN = {
    'o-ho': ['ho', {}],
    'o-rao': ['rao', {}],
    'o-dich': ['dich', {}],
    'o-nuoc': ['nuoc-lu', {}],
    'o-da-uot': ['da-uot', {}],
    'o-bang': ['bang', { huong: 1, pha: 0 }],
    'o-ban-xoay': ['ban-xoay', { chieu: 1, pha: 0 }],
    'o-ngach-1': ['cong', { so: '1', pha: 0 }],
    'o-san-xanh': ['san-mau', { mau: 'green' }],
    'o-san-do': ['san-mau', { mau: 'red' }],
    'o-san-vang': ['san-mau', { mau: 'yellow' }],
  };

  const VAT = {
    'vat-thung-go': ['thung-go', {}],
    'vat-khoi-sat': ['khoi-sat', {}],
    'vat-da-tron': ['da-tron', {}],
    'vat-da-chuong': ['da-chuong', {}],
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

  await tr.close();
} finally {
  may.kill();
}
