// Xuất hình robot, ô sân, vật mùa 7 (Hang động đá vôi · Xe thám hiểm & cứu hộ hang động R1) ra public/robot/m7/,
// (nền dọc public/nen-doc/mua-hang.png nay là ảnh TopView, chỉ vẽ tạm lại khi NEN_TAM=1).
// Chạy: node tools/xuat-m7.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
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

    // 1. THÂN BÁNH GAI BÁM ĐÁ ('banh-gai'): 4 bánh lốp dày có đinh gai thép (s.thu = thu gai trượt nhanh)
    V.dangKy({
      loai: 'than', ma: 'banh-gai', hamGoc: ['left_move', 'right_move', 'retract_spikes', 'extend_spikes'], ten: 'Thân bánh gai bám đá',
      oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 74, y: 50 }, hongPhai: { x: 26, y: 50 }, tren: { x: 71, y: 78 }, sau: { x: 50, y: 24 } },
      oCam: { x: 63, y: 29 }, vo: { x: 23, y: 24, w: 54, h: 59 },
      ve: function (g, s, M, H) {
        s = s || {};
        const thu = !!s.thu;
        for (const [bx, by] of [[15, 36], [85, 36], [15, 72], [85, 72]]) {
          if (!thu) {
            // Đinh gai thép nhô ra hai bên lốp
            const dir = bx < 50 ? -1 : 1;
            for (const dy of [-9, 0, 9]) {
              g.beginPath();
              g.moveTo(bx + dir * 4, by + dy - 3.5);
              g.lineTo(bx + dir * 13, by + dy);
              g.lineTo(bx + dir * 4, by + dy + 3.5);
              g.closePath();
              H.to(g, '#FACC15'); H.vien(g, BM.vecVien, 2);
            }
          }
          H.bo(g, bx - 7, by - 14, 14, 28, 5);
          H.to(g, thu ? '#38BDF8' : BM.vecBanh);
          H.vien(g, BM.vecVien, 3);
          H.duong(g, `M${bx - 5} ${by - 6} H${bx + 5} M${bx - 5} ${by + 6} H${bx + 5}`);
          H.vien(g, thu ? '#E0F2FE' : '#94A3B8', 2.2);
        }
        // Vỏ trắng gia đình thân A + đèn pha hang động trên nóc
        H.bo(g, 23, 24, 54, 59, 18);
        g.fillStyle = H.gradVo(g, 23, 24, 54, 59);
        g.fill();
        H.vien(g, BM.vecVien, 3.5);
        H.duong(g, 'M35 32 C33 42 33 51 35 60 M65 32 C67 42 67 51 65 60 M50 24 v12');
        H.vien(g, BM.vecVoGhep, 2.5);
        H.kinh(g, M, 29, 58, 42, 16, s);
        H.angTen(g, M, 50, 25, 13, 5);
      }
    });

    // 2. TAY LOA CỘNG HƯỞNG ('loa'): loa phát xung âm & nốt nhạc ở mũi xe
    V.dangKy({
      loai: 'tay', ma: 'loa', hamGoc: ['beat', 'note'], ten: 'Loa phát xung cộng hưởng', gan: 'tay', diemNeo: { x: 50, y: 80 },
      ve: function (g, s, M, H) {
        s = s || {};
        H.bo(g, 38, 76, 24, 9, 4); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.4);
        // Vành loa hình phễu hướng về +y
        g.beginPath();
        g.moveTo(41, 83); g.lineTo(59, 83); g.lineTo(66, 96); g.lineTo(34, 96); g.closePath();
        g.fillStyle = H.gradDoc(g, 0, 83, 0, 96, [[0, '#F59E0B'], [1, '#D97706']]);
        g.fill();
        H.vien(g, BM.vecVien, 2.8);
        H.elip(g, 50, 96, 15, 4.5); H.to(g, '#1E293B'); H.vien(g, BM.vecVien, 2.2);
        H.tron(g, 50, 95, 4); H.to(g, s.phat ? '#38BDF8' : '#94A3B8');
        if (s.phat) {
          for (const [r, mau] of [[11, '#38BDF8'], [18, '#FACC15'], [25, '#2DD4BF']]) {
            g.beginPath(); g.arc(50, 96, r, 0.18 * Math.PI, 0.82 * Math.PI);
            H.vien(g, mau, 3);
          }
        }
      }
    });

    // 3. CẢM BIẾN ÂM THANH SONAR ('am-thanh'): đôi tai dơi thu tiếng vang gắn ổ 'tren'
    V.dangKy({
      loai: 'cam-bien', ma: 'am-thanh', hamGoc: ['listen'], ten: 'Cảm biến âm thanh Sonar', gan: 'tren', diemNeo: { x: 50, y: 50 },
      ve: function (g, s, M, H) {
        s = s || {};
        if (s.bat) {
          H.tron(g, 50, 50, 15); H.to(g, 'rgba(45, 212, 191, 0.28)');
          g.beginPath(); g.arc(50, 56, 13, 0.15 * Math.PI, 0.85 * Math.PI);
          H.vien(g, '#2DD4BF', 2.4);
        }
        H.tron(g, 50, 50, 9);
        g.fillStyle = H.gradVo(g, 41, 41, 18, 18);
        g.fill();
        H.vien(g, BM.vecVien, 2.2);
        // Hai vành tai thu âm hướng chéo trước
        for (const dx of [-5, 5]) {
          H.elip(g, 50 + dx, 53, 3.8, 5.5); H.to(g, '#0D9488'); H.vien(g, BM.vecVien, 1.5);
          H.tron(g, 50 + dx, 54, 1.8); H.to(g, s.bat ? '#5EEAD4' : '#CCFBF1');
        }
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

    V.dangKy({
      loai: 'cam-bien', ma: 'radar', ten: 'Radar', gan: 'tren', diemNeo: { x: 50, y: 50 },
      ve: function (g, s, M, H) {
        H.tron(g, 50, 50, 9); H.to(g, '#064E3B'); H.vien(g, BM.vecVien, 2);
        H.duong(g, 'M50 50 L55 45'); H.vien(g, '#4ADE80', 2);
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
    'gai-loa-phat': [cfg('loa'), { mat: 'vui', tay: { phat: true } }],
    'gai-am': [cfg('loa', AM), {}],
    'gai-am-vui': [cfg('loa', AM), { mat: 'vui', camBien: { bat: true } }],
    'gai-am-ngac': [cfg('loa', AM), { mat: 'ngac' }],
    'gai-am-nghe': [cfg('loa', AM), { camBien: { bat: true } }],
    'gai-am-phat': [cfg('loa', AM), { mat: 'vui', tay: { phat: true }, camBien: { bat: true } }],
    'gai-du': [cfg('loa', AM), { camBien: { bat: true } }],
    'gai-du-vui': [cfg('loa', AM), { mat: 'vui', tay: { phat: true }, camBien: { bat: true } }],
    'gai-du-thu': [cfg('loa', AM), { thu: true, mat: 'vui', camBien: { bat: true } }],
    'r2': [{ than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }], son: 'lam' }, {}],
    'r2-vui': [{ than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }], son: 'lam' }, { mat: 'vui' }],
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
