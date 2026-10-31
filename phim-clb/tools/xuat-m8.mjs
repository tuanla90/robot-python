// Xuất hình các Robot Lai (kết hợp linh kiện 7 mùa), ô sân và vật mùa 8 (Về CLB · Giải cứu thị trấn) ra public/robot/m8/.
// Chạy: node tools/xuat-m8.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
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

  // Đăng ký các part mùa 4, 6, 7 để ghép Robot Lai tự do với part mùa 1, 2, 3, 5 có sẵn
  await trang.evaluate(() => {
    const V = window.VeVector, BM = window.BangMau;

    // Thân xuồng mùa 4
    V.dangKy({
      loai: 'than', ma: 'xuong', ten: 'Thân xuồng',
      oGan: { tay: { x: 50, y: 84 }, hongTrai: { x: 78, y: 50 }, hongPhai: { x: 22, y: 50 }, tren: { x: 72, y: 78 }, sau: { x: 50, y: 20 } },
      oCam: { x: 50, y: 28 }, vo: { x: 20, y: 20, w: 60, h: 66 },
      ve: function (g, s, M, H) {
        for (const cx of [35, 65]) {
          H.bo(g, cx - 5, 13, 10, 9, 3); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2);
          H.elip(g, cx - 4, 12, 4.5, 2.2); H.to(g, '#38BDF8'); H.vien(g, BM.vecVien, 1.5);
          H.elip(g, cx + 4, 12, 4.5, 2.2); H.to(g, '#38BDF8'); H.vien(g, BM.vecVien, 1.5);
        }
        g.beginPath();
        g.moveTo(22, 26); g.lineTo(78, 26); g.quadraticCurveTo(84, 54, 74, 80);
        g.quadraticCurveTo(50, 92, 26, 80); g.quadraticCurveTo(16, 54, 22, 26); g.closePath();
        g.fillStyle = H.gradDoc(g, 0, 22, 0, 90, [[0, '#0284C7'], [1, '#0369A1']]); g.fill();
        H.vien(g, BM.vecVien, 3.8);
        H.bo(g, 18, 44, 6, 18, 3); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 1.8);
        H.bo(g, 76, 44, 6, 18, 3); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 1.8);
        H.bo(g, 26, 26, 48, 54, 16); g.fillStyle = H.gradVo(g, 26, 26, 48, 54); g.fill(); H.vien(g, BM.vecVien, 3.4);
        H.kinh(g, M, 30, 56, 40, 15, s);
        H.angTen(g, M, 50, 27, 12, 4.8);
      }
    });

    // Thân bánh gai mùa 7
    V.dangKy({
      loai: 'than', ma: 'banh-gai', ten: 'Thân bánh gai',
      oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 74, y: 50 }, hongPhai: { x: 26, y: 50 }, tren: { x: 71, y: 78 }, sau: { x: 50, y: 24 } },
      oCam: { x: 63, y: 29 }, vo: { x: 23, y: 24, w: 54, h: 59 },
      ve: function (g, s, M, H) {
        for (const [bx, by] of [[15, 36], [85, 36], [15, 72], [85, 72]]) {
          const dir = bx < 50 ? -1 : 1;
          for (const dy of [-9, 0, 9]) {
            g.beginPath(); g.moveTo(bx + dir * 4, by + dy - 3.5); g.lineTo(bx + dir * 13, by + dy); g.lineTo(bx + dir * 4, by + dy + 3.5); g.closePath();
            H.to(g, '#FACC15'); H.vien(g, BM.vecVien, 2);
          }
          H.bo(g, bx - 7, by - 14, 14, 28, 5); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 3);
        }
        H.bo(g, 23, 24, 54, 59, 18); g.fillStyle = H.gradVo(g, 23, 24, 54, 59); g.fill(); H.vien(g, BM.vecVien, 3.5);
        H.kinh(g, M, 29, 58, 42, 16, s);
        H.angTen(g, M, 50, 25, 13, 5);
      }
    });

    // Tay dây phao kéo mùa 4
    V.dangKy({
      loai: 'tay', ma: 'day-keo', ten: 'Dây phao kéo', gan: 'tay', diemNeo: { x: 50, y: 82 },
      ve: function (g, s, M, H) {
        H.bo(g, 38, 77, 24, 11, 4); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
        H.duong(g, 'M50 86 V96'); H.vien(g, BM.vecVien, 5.5); H.duong(g, 'M50 86 V96'); H.vien(g, '#F97316', 3);
        H.tron(g, 50, 96, 7.5); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 2.4);
        H.tron(g, 50, 96, 3.2); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 1.5);
      }
    });

    // Tay loa cộng hưởng mùa 7
    V.dangKy({
      loai: 'tay', ma: 'loa', ten: 'Loa cộng hưởng', gan: 'tay', diemNeo: { x: 50, y: 80 },
      ve: function (g, s, M, H) {
        H.bo(g, 38, 76, 24, 9, 4); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.4);
        g.beginPath(); g.moveTo(41, 83); g.lineTo(59, 83); g.lineTo(66, 96); g.lineTo(34, 96); g.closePath();
        g.fillStyle = H.gradDoc(g, 0, 83, 0, 96, [[0, '#F59E0B'], [1, '#D97706']]); g.fill(); H.vien(g, BM.vecVien, 2.8);
        H.elip(g, 50, 96, 15, 4.5); H.to(g, '#1E293B'); H.vien(g, BM.vecVien, 2.2);
        H.tron(g, 50, 95, 4); H.to(g, '#38BDF8');
      }
    });

    // Radar mùa 6 & Sonar mùa 7
    V.dangKy({
      loai: 'cam-bien', ma: 'radar', ten: 'Radar', gan: 'tren', diemNeo: { x: 50, y: 50 },
      ve: function (g, s, M, H) {
        H.tron(g, 50, 50, 9.5); g.fillStyle = H.gradVo(g, 40.5, 40.5, 19, 19); g.fill(); H.vien(g, BM.vecVien, 2.3);
        H.tron(g, 50, 50, 6.8); H.to(g, '#064E3B'); H.vien(g, BM.vecVien, 1.4);
        H.duong(g, 'M50 50 L55 45'); H.vien(g, '#4ADE80', 2.2);
      }
    });

    V.dangKy({
      loai: 'cam-bien', ma: 'am-thanh', ten: 'Sonar', gan: 'tren', diemNeo: { x: 50, y: 50 },
      ve: function (g, s, M, H) {
        H.tron(g, 50, 50, 9); g.fillStyle = H.gradVo(g, 41, 41, 18, 18); g.fill(); H.vien(g, BM.vecVien, 2.2);
        for (const dx of [-5, 5]) {
          H.elip(g, 50 + dx, 53, 3.8, 5.5); H.to(g, '#0D9488'); H.vien(g, BM.vecVien, 1.5);
          H.tron(g, 50 + dx, 54, 1.8); H.to(g, '#5EEAD4');
        }
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
    'lai-omni-loa': [{ than: 'omni', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] }, { mat: 'vui' }],
    // G8–G10: Cặp Robot Lai tối thượng của Sola (Bánh gai + Loa + Radar) & Luna (Drone + Máy sơn + Camera 4 hướng, sơn lam)
    'sola-bot': [{ than: 'banh-gai', tay: 'loa', camBien: [{ ma: 'radar', o: 'tren' }, { ma: 'tu', o: 'hongTrai' }] }, { mat: 'vui' }],
    'luna-bot': [{ than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }, { ma: 'camera-bay', o: 'bung' }], son: 'lam' }, { mat: 'vui', camBien: { mat: true } }],
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
