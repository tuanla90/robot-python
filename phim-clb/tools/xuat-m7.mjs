// Xuất hình robot, ô sân, vật mùa 7 (Hang động đá vôi · Xe thám hiểm & cứu hộ hang động R1) ra public/robot/m7/,
// (nền dọc public/nen-doc/mua-hang.png nay là ảnh TopView, chỉ vẽ tạm lại khi NEN_TAM=1).
// Chạy: node tools/xuat-m7.mjs
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = existsSync(resolve(goc, '../../server.mjs')) ? resolve(goc, '../..') : 'd:/Users/tuanla2/game/doi-robot-chan-hung';
const ra = resolve(goc, '../public/robot/m7');
const PORT = 4217, CANH = 480, CANH_O = 320;
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

  await trang.evaluate(() => {
    const V = window.VeVector, BM = window.BangMau;

    // 1. THÂN BÁNH GAI BÁM ĐÁ ('banh-gai'): 4 bánh lốp địa hình 3D có cổ trục motor, vành thép và đinh gai thép (s.thu = thu gai trượt nhanh)
    V.dangKy({
      loai: 'than', ma: 'banh-gai', hamGoc: ['left_move', 'right_move', 'retract_spikes', 'extend_spikes'], ten: 'Thân bánh gai bám đá',
      oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 71, y: 47 }, hongPhai: { x: 29, y: 47 }, tren: { x: 71, y: 78 }, sau: { x: 37, y: 27 } },
      oCam: { x: 63, y: 29 }, vo: { x: 23, y: 26, w: 54, h: 54 },
      ve: function (g, s, M, H) {
        s = s || {};
        const thu = !!s.thu;
        for (const [bx, by] of [[14.5, 36.5], [85.5, 36.5], [14.5, 70.5], [85.5, 70.5]]) {
          const dir = bx < 50 ? -1 : 1;
          const ax = dir < 0 ? bx + 3.0 : bx - 11.5, fx = dir < 0 ? bx + 4.8 : bx - 7.6;
          H.bo(g, ax, by - 4.4, 8.5, 8.8, 1.8); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 2.2);
          H.bo(g, fx, by - 6.0, 2.8, 12.0, 1.0); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 1.6);
          if (!thu) {
            for (const dy of [-8.5, 0, 8.5]) {
              g.beginPath();
              g.moveTo(bx + dir * 4.5, by + dy - 3.6);
              g.lineTo(bx + dir * 13.5, by + dy);
              g.lineTo(bx + dir * 4.5, by + dy + 3.6);
              g.closePath();
              H.to(g, '#FACC15'); H.vien(g, BM.vecVien, 2.1);
            }
          }
          H.bo(g, bx - 6.6, by - 13.5, 13.2, 27, 4.8);
          H.to(g, thu ? '#38BDF8' : BM.vecBanh);
          H.vien(g, BM.vecVien, 2.8);
          for (const dy of [-7.5, 0, 7.5]) {
            H.bo(g, bx - 4.8, by + dy - 2, 9.6, 4, 1.4);
            H.to(g, thu ? '#E0F2FE' : BM.vecBanhGach);
            H.vien(g, BM.vecVien, 1.2);
          }
        }
        // Vỏ chuẩn R1 (54 × 54, r = 18) như thân omni / xích
        H.bo(g, 23, 26, 54, 54, 18);
        g.fillStyle = H.gradVo(g, 23, 26, 54, 54);
        g.fill();
        H.vien(g, BM.vecVien, 3.5);
        H.duong(g, 'M35 34 C33 44 33 53 35 62 M65 34 C67 44 67 53 65 62 M50 26 v11');
        H.vien(g, BM.vecVoGhep, 2.5);
        H.duong(g, 'M31 36 C34 31 39 30 45 30');
        H.vien(g, BM.vecVo, 4);
        H.kinh(g, M, 29, 57, 42, 15.5, s);
        H.angTen(g, M, 50, 27, 13, 5);
      }
    });

    // 3. CẢM BIẾN ÂM THANH SONAR ('am-thanh'): đôi phễu thu tiếng vang 3D gắn ổ 'tren'
    V.dangKy({
      loai: 'cam-bien', ma: 'am-thanh', hamGoc: ['listen'], ten: 'Cảm biến âm thanh Sonar', gan: 'tren', diemNeo: { x: 50, y: 50 },
      ve: function (g, s, M, H) {
        s = s || {};
        if (s.bat) {
          H.tron(g, 50, 50, 12.5); H.to(g, 'rgba(45, 212, 191, 0.35)');
          g.beginPath(); g.arc(50, 54, 10.5, 0.16 * Math.PI, 0.84 * Math.PI); H.vien(g, '#2DD4BF', 2.0);
          g.beginPath(); g.arc(50, 54, 13.0, 0.22 * Math.PI, 0.78 * Math.PI); H.vien(g, '#5EEAD4', 1.5);
        }
        H.tron(g, 50, 50, 8.2);
        g.fillStyle = H.gradVo(g, 41.8, 41.8, 16.4, 16.4);
        g.fill();
        H.vien(g, BM.vecVien, 2.2);
        for (const dx of [-4.4, 4.4]) {
          H.elip(g, 50 + dx, 52.5, 3.6, 5.2); H.to(g, '#0D9488'); H.vien(g, BM.vecVien, 1.5);
          H.tron(g, 50 + dx, 53.5, 1.8); H.to(g, s.bat ? '#5EEAD4' : '#CCFBF1');
        }
        H.tron(g, 50, 46.5, 1.8); H.to(g, s.bat ? '#FACC15' : '#38BDF8'); H.vien(g, BM.vecVien, 1);
      }
    });

    // 4. CÁC Ô SÂN MÙA 7: SÀN ĐÁ ƯỚT, DỐC ĐÁ ƯỚT, ĐÈN TIÊU
    V.dangKy({
      loai: 'o', ma: 'da-uot', ten: 'Sàn đá vôi ướt',
      ve: function (g, s, H) {
        g.fillStyle = '#0F172A'; g.fillRect(0, 0, 100, 100);
        H.bo(g, 3, 3, 94, 94, 8);
        g.fillStyle = H.gradDoc(g, 0, 3, 0, 97, [[0, '#5EEAD4'], [0.5, '#14B8A6'], [1, '#0F766E']]);
        g.fill();
        H.vien(g, BM.vecVien, 3);
        // Vệt bóng nước trơn loáng trên mặt đá vôi
        H.duong(g, 'M18 32 L38 18 M28 44 L52 26 M54 78 L80 58');
        H.vien(g, '#CCFBF1', 4.5);
        H.elip(g, 68, 34, 14, 7); H.to(g, 'rgba(204, 251, 241, 0.55)');
        H.elip(g, 32, 70, 16, 8); H.to(g, 'rgba(204, 251, 241, 0.55)');
      }
    });

    V.dangKy({
      loai: 'o', ma: 'doc-da-uot', ten: 'Máng dốc đá vôi ướt',
      ve: function (g, s, H) {
        V.lay('o', 'da-uot').ve(g, {}, H);
        for (const y of [28, 58]) {
          H.duong(g, `M30 ${y} L50 ${y + 18} L70 ${y}`);
          H.vien(g, BM.vecVien, 8);
          H.duong(g, `M30 ${y} L50 ${y + 18} L70 ${y}`);
          H.vien(g, '#FEF08A', 4.5);
        }
      }
    });

    V.dangKy({
      loai: 'o', ma: 'den-tieu', ten: 'Đèn tiêu dẫn đường',
      ve: function (g, s, H) {
        s = s || {};
        V.lay('o', 'da-uot').ve(g, {}, H);
        if (s.bat) {
          H.tron(g, 50, 50, 38); H.to(g, 'rgba(250, 204, 21, 0.35)');
        }
        H.tron(g, 50, 50, 24); H.to(g, '#334155'); H.vien(g, BM.vecVien, 3);
        H.tron(g, 50, 50, 14); H.to(g, s.bat ? '#FACC15' : '#64748B'); H.vien(g, BM.vecVien, 2.2);
        if (s.bat) {
          H.tron(g, 46, 46, 4.5); H.to(g, '#FEF9C3');
        }
      }
    });

    // 5. VẬT MÙA 7: ĐÁ CHUÔNG (THẠCH NHŨ RỖNG), BA LÔ ĐỎ KHẢO SÁT, ĐÁ VÔI TRÒN
    V.dangKy({
      loai: 'vat', ma: 'da-chuong', ten: 'Khối thạch nhũ đá chuông',
      ve: function (g, s, H) {
        s = s || {};
        H.elip(g, 50, 82, 34, 12); H.to(g, 'rgba(15, 23, 42, 0.3)');
        // Thân cột thạch nhũ đá vôi vàng hổ phách có vòng cộng hưởng
        g.beginPath();
        g.moveTo(22, 80); g.lineTo(30, 18); g.lineTo(50, 10); g.lineTo(70, 18); g.lineTo(78, 80); g.closePath();
        g.fillStyle = H.gradDoc(g, 0, 10, 0, 80, [[0, '#FDE68A'], [0.5, '#F59E0B'], [1, '#92400E']]);
        g.fill();
        H.vien(g, BM.vecVien, 3.6);
        // Khe rỗng cộng hưởng âm thanh ở giữa cột đá
        H.elip(g, 50, 48, 12, 20); H.to(g, '#0F172A'); H.vien(g, '#38BDF8', 2.8);
        // Vạch tần số nốt nhạc
        for (const y of [32, 48, 64]) {
          H.duong(g, `M28 ${y} H36 M64 ${y} H72`); H.vien(g, '#FEF08A', 3);
        }
      }
    });

    V.dangKy({
      loai: 'vat', ma: 'balo-do', ten: 'Ba lô đỏ & đèn báo đoàn khảo sát',
      ve: function (g, s, H) {
        H.tron(g, 50, 50, 40); H.to(g, 'rgba(250, 204, 21, 0.28)');
        H.bo(g, 20, 22, 60, 62, 16);
        g.fillStyle = H.gradDoc(g, 0, 22, 0, 84, [[0, '#F87171'], [0.5, '#EF4444'], [1, '#B91C1C']]);
        g.fill();
        H.vien(g, BM.vecVien, 3.4);
        // Dây đeo vàng & chữ thập cứu hộ trắng
        H.bo(g, 30, 14, 40, 12, 6); H.to(g, '#F59E0B'); H.vien(g, BM.vecVien, 2.4);
        H.bo(g, 34, 40, 32, 30, 8); H.to(g, '#FEE2E2'); H.vien(g, BM.vecVien, 2.2);
        H.duong(g, 'M50 46 V64 M41 55 H59'); H.vien(g, '#EF4444', 5.5);
        // Đèn pin phát sáng góc trên phải
        H.tron(g, 74, 26, 9); H.to(g, '#FACC15'); H.vien(g, BM.vecVien, 2.2);
      }
    });

    V.dangKy({
      loai: 'vat', ma: 'da-tron', ten: 'Tảng ngọc động tròn',
      ve: function (g, s, H) {
        H.tron(g, 50, 50, 38);
        g.fillStyle = H.gradToa(g, 36, 34, 48, [[0, '#CCFBF1'], [0.55, '#2DD4BF'], [1, '#0F766E']]);
        g.fill();
        H.vien(g, BM.vecVien, 3.8);
        H.tron(g, 36, 34, 7); H.to(g, '#F0FDFA');
      }
    });
  });

  const AM = [{ ma: 'am-thanh', o: 'tren' }];
  const cfg = (tay = null, cam = []) => ({ than: 'banh-gai', tay, camBien: cam });

  const HINH = {
    'omni': [{ than: 'omni', tay: null, camBien: [] }, {}],
    'omni-ngac': [{ than: 'omni', tay: null, camBien: [] }, { mat: 'ngac' }],
    'gai': [cfg(), {}],
    'gai-vui': [cfg(), { mat: 'vui' }],
    'gai-ngac': [cfg(), { mat: 'ngac' }],
    'gai-thu': [cfg(), { thu: true, mat: 'vui' }],
    'gai-loa': [cfg('loa'), {}],
    'gai-loa-vui': [cfg('loa'), { mat: 'vui' }],
    'gai-loa-ngac': [cfg('loa'), { mat: 'ngac' }],
    'gai-loa-phat': [cfg('loa'), { mat: 'vui', tay: { bat: true, notLoa: 5, pha: 0.35 } }],
    'gai-am': [cfg('loa', AM), {}],
    'gai-am-vui': [cfg('loa', AM), { mat: 'vui', camBien: { bat: true } }],
    'gai-am-ngac': [cfg('loa', AM), { mat: 'ngac' }],
    'gai-am-nghe': [cfg('loa', AM), { camBien: { bat: true } }],
    'gai-am-phat': [cfg('loa', AM), { mat: 'vui', tay: { bat: true, notLoa: 5, pha: 0.35 }, camBien: { bat: true } }],
    'gai-du': [cfg('loa', AM), { camBien: { bat: true } }],
    'gai-du-vui': [cfg('loa', AM), { mat: 'vui', tay: { bat: true, notLoa: 5, pha: 0.35 }, camBien: { bat: true } }],
    'gai-du-thu': [cfg('loa', AM), { thu: true, mat: 'vui', camBien: { bat: true } }],
    'r2': [{ than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }], son: 'lam' }, {}],
    'r2-vui': [{ than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }], son: 'lam' }, { mat: 'vui', camBien: { bat: true, mat: true } }],
  };

  const O_SAN = {
    'o-da-uot': ['da-uot', {}],
    'o-doc-da': ['doc-da-uot', {}],
    'o-ngach-1': ['cong', { so: '1', pha: 0 }],
    'o-ngach-2': ['cong', { so: '2', pha: 2 }],
    'o-den-tat': ['den-tieu', { bat: false }],
    'o-den-bat': ['den-tieu', { bat: true }],
    'o-ho': ['ho', {}],
    'o-dich': ['dich', {}],
  };

  const VAT = {
    'vat-da-chuong': ['da-chuong', {}],
    'vat-balo-do': ['balo-do', {}],
    'vat-da-tron': ['da-tron', {}],
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

  // Nền dọc Hang động vẽ tạm (public/nen-doc/mua-hang.png, 1080x1920). 31/10 đã thay bằng ảnh TopView: chỉ vẽ lại khi NEN_TAM=1.
  if (process.env.NEN_TAM) await luu(resolve(goc, '../public/nen-doc/mua-hang.png'), await trang.evaluate(() => {
    const cv = document.createElement('canvas');
    cv.width = 1080; cv.height = 1920;
    const g = cv.getContext('2d');
    // Nền lòng hang đá vôi xanh chàm trầm
    const bg = g.createLinearGradient(0, 0, 0, 1920);
    bg.addColorStop(0, '#0F172A');
    bg.addColorStop(0.5, '#134E4A');
    bg.addColorStop(1, '#0F172A');
    g.fillStyle = bg;
    g.fillRect(0, 0, 1080, 1920);

    // Hồ nước ngầm ngọc bích phát sáng dịu ở rìa hang
    for (const [cx, cy, rx, ry] of [[150, 420, 140, 220], [930, 680, 150, 260], [140, 1380, 150, 240], [940, 1480, 140, 220]]) {
      g.fillStyle = 'rgba(45, 212, 191, 0.22)';
      g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(94, 234, 212, 0.45)';
      g.lineWidth = 5;
      g.stroke();
    }

    // Vách đá vôi và măng đá hai bên rìa trái/phải
    g.fillStyle = '#1E293B';
    g.strokeStyle = '#090D16';
    g.lineWidth = 8;
    for (let y = 0; y < 1920; y += 160) {
      g.beginPath(); g.arc(20, y + 80, 95, -Math.PI / 2, Math.PI / 2); g.fill(); g.stroke();
      g.beginPath(); g.arc(1060, y + 80, 95, Math.PI / 2, -Math.PI / 2); g.fill(); g.stroke();
    }

    // Các cụm tinh thể thạch nhũ vàng hổ phách & ngọc bích ở 4 góc
    for (const [x, y] of [[90, 180], [960, 220], [85, 920], [970, 1060], [90, 1680], [960, 1720]]) {
      g.fillStyle = '#F59E0B';
      g.strokeStyle = '#1E293B';
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(x - 32, y + 40); g.lineTo(x, y - 48); g.lineTo(x + 32, y + 40); g.closePath();
      g.fill(); g.stroke();
    }
    return { url: cv.toDataURL('image/png'), w: 1080, h: 1920 };
  }));

  await tr.close();
} finally {
  may.kill();
}
