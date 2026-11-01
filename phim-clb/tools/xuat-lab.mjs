// Xuất hình robot cho chuỗi video Phòng Lab của Luna (tay kẹp, cảm biến khoảng cách, và các xe mùa 2..6)
// ra public/robot/lab/*.png từ bộ vẽ vector VeRobot.veCo.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../public/robot/lab');
const PORT = 4209, CANH = 480;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const TRUOC = [{ ma: 'khoang-cach', o: 'truoc' }];
const DU = [{ ma: 'khoang-cach', o: 'truoc' }, { ma: 'khoang-cach', o: 'hong' }];

// [cauHinh, trangThai, huong]
// Lưu ý: huong = 1 (mũi quay sang phải) cho các xe có hướng để khớp chuẩn xoay của kit.tsx (goc = -90 là hướng lên),
// riêng nhen/drone muốn nhìn thẳng hoặc khớp kit.tsx cũng dùng huong = 1.
const HINH = {
  // 1. Tay kẹp & Khớp xoay
  'kep-tren-mo':   [{ than: 'hai-banh', tay: 'kep', camBien: [] }, { tay: { tuThe: 'tren', kep: false } }, 1],
  'kep-tren-dong': [{ than: 'hai-banh', tay: 'kep', camBien: [] }, { mat: 'ngac', tay: { tuThe: 'tren', kep: true } }, 1],
  'kep-duoi-mo':   [{ than: 'hai-banh', tay: 'kep', camBien: [] }, { tay: { tuThe: 'duoi', kep: false } }, 1],
  'kep-duoi-ket':  [{ than: 'hai-banh', tay: 'kep', camBien: [] }, { mat: 'ngac', loi: 'tay', tay: { tuThe: 'duoi', kep: false } }, 1],
  'kep-duoi-dong': [{ than: 'hai-banh', tay: 'kep', camBien: [] }, { mat: 'vui', tay: { tuThe: 'duoi', kep: true, cam: false } }, 1],
  'kep-tren-cam':  [{ than: 'hai-banh', tay: 'kep', camBien: [] }, { mat: 'vui', tay: { tuThe: 'tren', kep: true, cam: false } }, 1],
  'xoay-truoc':    [{ than: 'hai-banh', tay: 'xoay', camBien: [] }, { tay: { tuThe: 'tren', kep: false, xoay: 'truoc' } }, 1],
  'xoay-trai':     [{ than: 'hai-banh', tay: 'xoay', camBien: [] }, { mat: 'vui', tay: { tuThe: 'tren', kep: false, xoay: 'trai' } }, 1],
  'xoay-phai':     [{ than: 'hai-banh', tay: 'xoay', camBien: [] }, { mat: 'vui', tay: { tuThe: 'tren', kep: false, xoay: 'phai' } }, 1],
  'xoay-trai-kep': [{ than: 'hai-banh', tay: 'xoay', camBien: [] }, { mat: 'vui', tay: { tuThe: 'duoi', kep: true, xoay: 'trai' } }, 1],
  'xoay-phai-kep': [{ than: 'hai-banh', tay: 'xoay', camBien: [] }, { mat: 'vui', tay: { tuThe: 'duoi', kep: true, xoay: 'phai' } }, 1],

  // 2. Cảm biến khoảng cách & Hồng ngoại & Từ
  'cb-kc-truoc':   [{ than: 'hai-banh', tay: 'kep', camBien: TRUOC }, { tay: { tuThe: 'tren', kep: false }, camBien: { bat: true, mat: true } }, 1],
  'cb-kc-du':      [{ than: 'hai-banh', tay: 'xoay', camBien: DU }, { mat: 'vui', tay: { tuThe: 'tren', kep: false }, camBien: { bat: true, mat: true } }, 1],
  'cb-hong-ngoai': [{ than: 'xich', tay: null, camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }, { mat: 'vui', camBien: { bat: true, mat: true } }, 1],
  'cb-tu':         [{ than: 'omni', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] }, { mat: 'vui', tay: { cuc: 'N' }, camBien: { bat: true, mat: true } }, 1],

  // 3. Các xe & bộ phận trong mùa 2..6
  'xich-co-ban':      [{ than: 'xich', tay: null, camBien: [] }, {}, 1],
  'xich-voi-phun':    [{ than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }, { mat: 'vui', tay: { dangBanTruoc: true }, camBien: { bat: true } }, 1],
  'voi-phun-truoc':   [{ than: 'xich', tay: 'hoi', camBien: [] }, { mat: 'vui', tay: { dangBanTruoc: true } }, 1],
  'voi-phun-sau':     [{ than: 'xich', tay: 'hoi', camBien: [] }, { mat: 'vui', tay: { dangBanSau: true } }, 1],
  'omni-co-ban':      [{ than: 'omni', tay: null, camBien: [] }, { mat: 'vui' }, 1],
  'omni-nam-cham':    [{ than: 'omni', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] }, { mat: 'vui', tay: { cuc: 'N' } }, 1],
  'omni-nam-cham-s':  [{ than: 'omni', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] }, { mat: 'vui', tay: { cuc: 'S' } }, 1],
  'omni-nam-cham-tat':[{ than: 'omni', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] }, { tay: { cuc: null } }, 1],
  'omni-gieo-hat':    [{ than: 'omni', tay: 'son', camBien: [{ ma: 'camera', o: 'tren' }] }, { mat: 'vui', tay: { tuThe: 'duoi', mauSon: 'red' }, camBien: { mat: true } }, 1],
  'omni-camera-4':    [{ than: 'omni', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] }, { mat: 'vui', tay: { tuThe: 'tren', mauSon: 'yellow' }, camBien: { mat: true } }, 1],
  'nhen-dung':        [{ than: 'nhen', tay: null, camBien: [] }, { co: false, mat: 'vui' }, 0],
  'nhen-co':          [{ than: 'nhen', tay: null, camBien: [] }, { co: true, mat: 'vui' }, 0],
  'nhen-may-nem':     [{ than: 'nhen', tay: 'nem', camBien: [] }, { co: false, mat: 'vui', tay: { ngam: 2 } }, 1],
  'xe-may-nem':       [{ than: 'hai-banh', tay: 'nem', camBien: [] }, { mat: 'vui', tay: { ngam: 2, dangNem: true } }, 1],
  'drone-bay':        [{ than: 'drone', tay: null, camBien: [{ ma: 'camera-bay', o: 'bung' }] }, { wl: 1, wr: 1, ph: 1, mat: 'vui', camBien: { bat: true, mat: true } }, 0],
  'drone-dau':        [{ than: 'drone', tay: null, camBien: [{ ma: 'camera-bay', o: 'bung' }] }, { wl: 0, wr: 0, mat: 'vui' }, 0],
};

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await trang.evaluate(() => {
    const BM = window.BangMau;
    const V = window.VeVector;
    // Đăng ký riêng 'dau-r1' (chỉ có cái đầu/vỏ trắng, kính mắt, ăng-ten, chưa có bánh xe)
    V.dangKy({
      loai: 'than', ma: 'dau-r1', hamGoc: [], ten: 'Đầu R1',
      oGan: { tay: { x: 50, y: 80 }, hongTrai: { x: 74, y: 46 }, hongPhai: { x: 26, y: 46 }, tren: { x: 71, y: 76 }, sau: { x: 36, y: 25 } },
      oCam: { x: 64, y: 28 }, vo: { x: 20, y: 23, w: 60, h: 58 },
      ve: function (g, s, M, H) {
        H.bo(g, 20, 23, 60, 58, 20); g.fillStyle = H.gradVo(g, 20, 23, 60, 58); g.fill(); H.vien(g, BM.vecVien, 3.5);
        H.duong(g, 'M33 31 C31 41 31 51 33 60 M67 31 C69 41 69 51 67 60 M50 23 v12'); H.vien(g, BM.vecVoGhep, 2.5);
        H.duong(g, 'M30 33 C33 28 39 27 46 27'); H.vien(g, BM.vecVo, 4);
        H.kinh(g, M, 27, 57, 46, 17, s);
        H.angTen(g, M, 50, 24, 12, 5);
      }
    });
    // Đăng ký riêng 'banh-r1' (chỉ có hai bánh xe con nhộng tách rời để diễn hoạt lắp vào đầu R1)
    V.dangKy({
      loai: 'than', ma: 'banh-r1', hamGoc: [], ten: 'Hai bánh R1',
      oGan: { tay: { x: 50, y: 80 } }, vo: { x: 20, y: 23, w: 60, h: 58 },
      ve: function (g, s, M, H) {
        [10, 74].forEach(function (x) { H.bo(g, x, 36, 16, 44, 8); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 3); });
        g.beginPath();
        for (let i = 0; i < 4; i++) { const y = 46 + ((i * 8) % 32); g.moveTo(14, y); g.lineTo(22, y); g.moveTo(78, y); g.lineTo(86, y); }
        H.vien(g, BM.vecBanhGach, 3);
        H.duong(g, 'M24 42v32M76 42v32'); H.vien(g, BM.vecDen, 3);
      }
    });
  });
  HINH['dau-r1'] = [{ than: 'dau-r1', tay: null, camBien: [] }, {}, 1];
  HINH['banh-r1'] = [{ than: 'banh-r1', tay: null, camBien: [] }, {}, 1];
  await mkdir(ra, { recursive: true });
  for (const [ten, [c, tt, h]] of Object.entries(HINH)) {
    const url = await trang.evaluate(([c, tt, h, canh]) => {
      try { return VeRobot.veCo(c, tt, h, canh).toDataURL('image/png'); }
      catch (e) { return null; }
    }, [c, tt, h, CANH]);
    if (url) {
      await writeFile(resolve(ra, ten + '.png'), Buffer.from(url.split(',')[1], 'base64'));
      console.log('xong', ten);
    } else {
      console.log('LOI', ten);
    }
  }
  await tr.close();
} finally {
  may.kill();
}
