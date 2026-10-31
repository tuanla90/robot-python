// Xuất hình robot, ô sân, vật mùa 6 (Mỏ đá · Máy khai thác đá R1) ra public/robot/m6/.
// Chạy: node tools/xuat-m6.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../public/robot/m6');
const PORT = 4216, CANH = 480, CANH_O = 320;
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

  await trang.evaluate(() => {
    const V = window.VeVector, BM = window.BangMau;

    // 1. CẢM BIẾN RADAR TRÒN ('radar') gắn ổ 'tren'
    V.dangKy({
      loai: 'cam-bien', ma: 'radar', hamGoc: ['radar', 'radar_shape'], ten: 'Radar tròn quét 4 hướng', gan: 'tren', diemNeo: { x: 50, y: 50 },
      ve: function (g, s, M, H) {
        s = s || {};
        if (s.bat) {
          H.tron(g, 50, 50, 15); H.to(g, 'rgba(34, 197, 94, 0.25)');
          H.tron(g, 50, 50, 12); H.vien(g, '#22C55E', 1.8);
        }
        // Đế tháp radar tròn
        H.tron(g, 50, 50, 9.5);
        g.fillStyle = H.gradVo(g, 40.5, 40.5, 19, 19);
        g.fill();
        H.vien(g, BM.vecVien, 2.3);
        // Mặt màn hình radar xanh lá đậm
        H.tron(g, 50, 50, 6.8); H.to(g, '#064E3B'); H.vien(g, BM.vecVien, 1.4);
        // Kim quét radar + chấm mục tiêu
        H.duong(g, 'M50 50 L55 45'); H.vien(g, '#4ADE80', 2.2);
        H.tron(g, 50, 50, 2); H.to(g, '#FACC15');
        if (s.dang) {
          // Chế độ nhận diện hình dạng (tròn/vuông): thêm vành vàng cam
          H.tron(g, 50, 50, 10.5); H.vien(g, '#F59E0B', 2);
        }
      }
    });

    // 2. Ô SÀN DỐC ĐÁ ('san-doc'): s.huong = 0(lên), 1(phải), 2(xuống), 3(trái)
    V.dangKy({
      loai: 'o', ma: 'san-doc', ten: 'Sàn dốc mỏ đá',
      ve: function (g, s, H) {
        s = s || {};
        const h = ((s.huong | 0) % 4 + 4) % 4;
        g.save();
        g.translate(50, 50); g.rotate((h * Math.PI) / 2); g.translate(-50, -50);
        g.fillStyle = '#78350F'; g.fillRect(0, 0, 100, 100);
        H.bo(g, 3, 3, 94, 94, 8);
        g.fillStyle = H.gradDoc(g, 0, 3, 0, 97, [[0, '#FDE68A'], [0.5, '#F59E0B'], [1, '#B45309']]);
        g.fill();
        H.vien(g, BM.vecVien, 3);
        // Hai thanh dẫn hướng hai bên
        H.bo(g, 8, 8, 10, 84, 4); H.to(g, '#78350F'); H.vien(g, BM.vecVien, 2);
        H.bo(g, 82, 8, 10, 84, 4); H.to(g, '#78350F'); H.vien(g, BM.vecVien, 2);
        // Mũi tên đôi chỉ chiều dốc (mặc định hướng 0 = lên -y)
        for (const y of [32, 64]) {
          H.duong(g, `M30 ${y + 12} L50 ${y - 6} L70 ${y + 12}`);
          H.vien(g, BM.vecVien, 8);
          H.duong(g, `M30 ${y + 12} L50 ${y - 6} L70 ${y + 12}`);
          H.vien(g, '#FEF08A', 4.5);
        }
        g.restore();
      }
    });

    // 3. VẬT MÙA 6: ĐÁ HỘC TRÒN ('da-tron') & ĐÁ XẺ VUÔNG ('da-xe')
    V.dangKy({
      loai: 'vat', ma: 'da-tron', ten: 'Tảng đá tròn',
      ve: function (g, s, H) {
        H.elip(g, 52, 58, 38, 34); H.to(g, 'rgba(15, 23, 42, 0.22)');
        H.tron(g, 50, 50, 38);
        g.fillStyle = H.gradToa(g, 36, 34, 48, [[0, '#E2E8F0'], [0.55, '#94A3B8'], [1, '#475569']]);
        g.fill();
        H.vien(g, BM.vecVien, 3.8);
        // Vết vân đá tự nhiên
        H.duong(g, 'M30 36 Q42 26 56 32 M34 64 Q52 70 68 56');
        H.vien(g, '#334155', 2.5);
        H.tron(g, 36, 34, 7); H.to(g, '#F8FAFC');
      }
    });

    V.dangKy({
      loai: 'vat', ma: 'da-xe', ten: 'Khối đá xẻ vuông',
      ve: function (g, s, H) {
        H.bo(g, 14, 16, 74, 74, 8); H.to(g, 'rgba(15, 23, 42, 0.22)');
        H.bo(g, 12, 12, 76, 76, 8);
        g.fillStyle = H.gradDoc(g, 0, 12, 0, 88, [[0, '#F8FAFC'], [0.5, '#CBD5E1'], [1, '#64748B']]);
        g.fill();
        H.vien(g, BM.vecVien, 3.8);
        // Mặt vát khối đá xẻ vuông vắn + đai vàng phân loại
        H.bo(g, 22, 22, 56, 56, 4); H.to(g, '#E2E8F0'); H.vien(g, '#475569', 2.4);
        H.duong(g, 'M12 12 L22 22 M88 12 L78 22 M12 88 L22 78 M88 88 L78 78'); H.vien(g, '#475569', 2.2);
        H.bo(g, 30, 44, 40, 12, 3); H.to(g, '#F59E0B'); H.vien(g, BM.vecVien, 2);
      }
    });
  });

  const RAD = [{ ma: 'radar', o: 'tren' }];
  const cfg = (tay = null, cam = []) => ({ than: 'omni', tay, camBien: cam });

  const HINH = {
    'drone': [{ than: 'drone', tay: null, camBien: [] }, {}],
    'drone-ngac': [{ than: 'drone', tay: null, camBien: [] }, { mat: 'ngac' }],
    'omni': [cfg(), {}],
    'omni-vui': [cfg(), { mat: 'vui' }],
    'omni-ngac': [cfg(), { mat: 'ngac' }],
    'omni-nem': [cfg('nem'), { tay: { ngam: 1 } }],
    'omni-nem-vui': [cfg('nem'), { mat: 'vui', tay: { ngam: 2 } }],
    'omni-nem-ngac': [cfg('nem'), { mat: 'ngac', tay: { ngam: 1 } }],
    'omni-nem-cam': [cfg('nem'), { tay: { ngam: 2, cam: true } }],
    'omni-nem-vung': [cfg('nem'), { mat: 'vui', tay: { ngam: 2, dangNem: true } }],
    'omni-radar': [cfg('nem', RAD), { tay: { ngam: 2 } }],
    'omni-radar-vui': [cfg('nem', RAD), { mat: 'vui', tay: { ngam: 2 }, camBien: { bat: true } }],
    'omni-radar-ngac': [cfg('nem', RAD), { mat: 'ngac', tay: { ngam: 2 } }],
    'omni-radar-quet': [cfg('nem', RAD), { tay: { ngam: 2, cam: true }, camBien: { bat: true } }],
    'omni-du': [cfg('nem', RAD), { tay: { ngam: 3 }, camBien: { bat: true, dang: true } }],
    'omni-du-vui': [cfg('nem', RAD), { mat: 'vui', tay: { ngam: 3 }, camBien: { bat: true, dang: true } }],
    'omni-du-vung': [cfg('nem', RAD), { mat: 'vui', tay: { ngam: 3, dangNem: true }, camBien: { bat: true, dang: true } }],
    'r2': [{ than: 'drone', tay: null, camBien: [{ ma: 'camera-4', o: 'tren' }, { ma: 'camera-bay', o: 'bung' }], son: 'lam' }, {}],
    'r2-quet': [{ than: 'drone', tay: null, camBien: [{ ma: 'camera-4', o: 'tren' }, { ma: 'camera-bay', o: 'bung' }], son: 'lam' }, { camBien: { mat: true, bat: true } }],
    'r2-vui': [{ than: 'drone', tay: null, camBien: [{ ma: 'camera-4', o: 'tren' }, { ma: 'camera-bay', o: 'bung' }], son: 'lam' }, { mat: 'vui', camBien: { mat: true, bat: true } }],
  };

  const O_SAN = {
    'o-doc-len': ['san-doc', { huong: 0 }],
    'o-doc-phai': ['san-doc', { huong: 1 }],
    'o-doc-xuong': ['san-doc', { huong: 2 }],
    'o-doc-trai': ['san-doc', { huong: 3 }],
    'o-ban-xoay-p': ['ban-xoay', { chieu: 1, pha: 0 }],
    'o-ban-xoay-t': ['ban-xoay', { chieu: -1, pha: 0 }],
    'o-ho': ['ho', {}],
    'o-rao': ['rao', {}],
    'o-dich': ['dich', {}],
    'o-sac': ['sac', {}],
    'o-vach-vang': ['san-mau', { mau: 'yellow' }],
    'o-vach-xanh': ['san-mau', { mau: 'green' }],
    'o-vach-lam': ['san-mau', { mau: 'blue' }],
  };

  const VAT = {
    'vat-da-tron': ['da-tron', {}],
    'vat-da-xe': ['da-xe', {}],
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
