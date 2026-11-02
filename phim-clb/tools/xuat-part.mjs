// Xuất ẢNH PART RIÊNG cho hoạt cảnh lắp part trong xe trạm (user 2/11: ghép bằng ảnh part, không cắt từ ảnh xe đủ).
// Cách làm: vẽ robot CÓ part và robot KHÔNG part bằng đúng bộ vẽ vector của game (VeRobot.veCo, cùng khung 576 px, mũi quay sang phải),
// giữ lại những điểm ảnh khác nhau → đúng hình part ở đúng chỗ gắn trên thân, nền trong suốt; `nua` = 'tren' | 'duoi' chỉ giữ nửa trên / dưới khung
// (hai bánh, hai cảm biến hông: mỗi bên một ảnh để trượt vào từ hai phía). Ra public/robot/part/<tên>.png.
// Chạy (từ phim-clb/): node tools/xuat-part.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../public/robot/part');
const PORT = 4212, CANH = 480;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const cfg = (tay, cam = []) => ({ than: 'hai-banh', tay, camBien: cam });
const TRUOC = [{ ma: 'khoang-cach', o: 'truoc' }];
const DU = [{ ma: 'khoang-cach', o: 'truoc' }, { ma: 'khoang-cach', o: 'hong' }];
const TT = { tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } };
// Thân 'rong' = thân không vẽ gì nhưng giữ nguyên điểm gắn (oGan, oCam, vo) của thân hai bánh → part vẽ lên đó ra NGUYÊN HÌNH, đúng chỗ gắn,
// không bị thân che. tên → [cấu hình CÓ part, cấu hình KHÔNG part, trạng thái, nửa khung giữ lại]
const RONG = (tay, cam = []) => ({ than: 'rong', tay, camBien: cam });
const PART = {
  // gói 1: hai bánh xe (thân 'banh-r1' chỉ vẽ hai bánh, như tools/xuat-lab.mjs) lắp vào đầu R1
  'banh-trai': [{ than: 'banh-r1', tay: null, camBien: [] }, RONG(null), {}, 'tren'],
  'banh-phai': [{ than: 'banh-r1', tay: null, camBien: [] }, RONG(null), {}, 'duoi'],
  // gói 2: tay kẹp trước mũi
  'kep': [RONG('kep'), RONG(null), TT, null],
  // gói 3: mắt khoảng cách (hai tai, cấu hình 'kep-cam' của xuat-m1)
  'cam-kc-trai': [RONG('kep', TRUOC), RONG('kep'), TT, 'tren'],
  'cam-kc-phai': [RONG('kep', TRUOC), RONG('kep'), TT, 'duoi'],
  // gói 7 (nâng cấp): thêm mắt hông cho xe tay xoay (khung 922)
  'cam-ben-trai': [RONG('xoay', DU), RONG('xoay', TRUOC), TT, 'tren'],
  'cam-ben-phai': [RONG('xoay', DU), RONG('xoay', TRUOC), TT, 'duoi'],
};

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await trang.evaluate(() => {
    const BM = window.BangMau, V = window.VeVector;
    if (V.lay('than', 'rong')) return;
    const hb = V.lay('than', 'hai-banh');
    V.dangKy({ loai: 'than', ma: 'rong', hamGoc: [], ten: 'Thân rỗng', oGan: hb.oGan, oCam: hb.oCam, vo: hb.vo, ve: function () {} });
    V.dangKy({
      loai: 'than', ma: 'banh-r1', hamGoc: [], ten: 'Hai bánh R1', oGan: hb.oGan, oCam: hb.oCam, vo: hb.vo,
      ve: function (g, s, M, H) {
        [10, 74].forEach(function (x) { H.bo(g, x, 36, 16, 44, 8); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 3); });
        g.beginPath();
        for (let i = 0; i < 4; i++) { const y = 46 + ((i * 8) % 32); g.moveTo(14, y); g.lineTo(22, y); g.moveTo(78, y); g.lineTo(86, y); }
        H.vien(g, BM.vecBanhGach, 3);
        H.duong(g, 'M24 42v32M76 42v32'); H.vien(g, BM.vecDen, 3);
      }
    });
  });
  await mkdir(ra, { recursive: true });
  for (const [ten, [co, khong, tt, nua]] of Object.entries(PART)) {
    const url = await trang.evaluate(([co, khong, tt, nua, canh]) => {
      try {
        const a = VeRobot.veCo(co, tt, 1, canh), b = VeRobot.veCo(khong, tt, 1, canh);
        const w = a.width, h = a.height;
        const da = a.getContext('2d').getImageData(0, 0, w, h), db = b.getContext('2d').getImageData(0, 0, w, h);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d'), out = g.createImageData(w, h);
        for (let y = 0; y < h; y++) {
          if (nua === 'tren' && y >= h / 2) break;
          if (nua === 'duoi' && y < h / 2) continue;
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const khac = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]) + Math.abs(da.data[i + 3] - db.data[i + 3]);
            if (khac > 24 && da.data[i + 3] > 8) { out.data[i] = da.data[i]; out.data[i + 1] = da.data[i + 1]; out.data[i + 2] = da.data[i + 2]; out.data[i + 3] = da.data[i + 3]; }
          }
        }
        g.putImageData(out, 0, 0);
        return c.toDataURL('image/png');
      } catch (e) { return 'LOI ' + e.message; }
    }, [co, khong, tt, nua, CANH]);
    if (url && url.startsWith('data:')) { await writeFile(resolve(ra, ten + '.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('xong', ten); }
    else console.log('LOI', ten, url);
  }
  await tr.close();
} finally {
  may.kill();
}
