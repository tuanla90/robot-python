// Xuất hình robot và ô sân các mùa sau (m2 Nhà máy, m3 Bãi tái chế, m5 Nông trại hoa) từ bộ vẽ vector của game ra public/robot/<mùa>/,
// theo cách của xuat-m1.mjs: robot nhìn từ trên, mũi quay sang PHẢI, ô vuông 576 px; ô sân / vật xuất ĐỦ mọi trạng thái mẫu (cacTrangThai).
// Tên ô: o-<mã>[-<trạng thái>], vật: vat-<mã>[-<trạng thái>] (trạng thái = các giá trị nối gạch, chữ thường: dem-tu-n, lua-tat, hoa-red, bao-yellow).
// Chạy: node tools/xuat-mua.mjs [m2 m3 m5]   (không ghi mùa = cả ba)
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const PORT = 4211, CANH = 480, CANH_O = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const HN = [{ ma: 'hong-ngoai', o: 'tren' }];
const TU = [{ ma: 'tu', o: 'hong' }];
const CAM4 = [{ ma: 'camera-4', o: 'tren' }];
const CAM4_BAY = [{ ma: 'camera-4', o: 'tren' }, { ma: 'camera-bay', o: 'bung' }];
const KEP = { tuThe: 'tren', kep: false };

/** Mỗi tên gốc tự có thêm bản -vui và -ngac (mắt). [cấu hình, trạng thái] */
const bien = (ten, cfg, tt = {}) => ({ [ten]: [cfg, tt], [ten + '-vui']: [cfg, { ...tt, mat: 'vui' }], [ten + '-ngac']: [cfg, { ...tt, mat: 'ngac' }] });
const HN_XICH = { than: 'xich', tay: 'hoi', camBien: HN };
const HINH = {
  m2: {
    ...bien('r1-banh', { than: 'hai-banh', tay: null, camBien: [] }),
    ...bien('xich', { than: 'xich', tay: null, camBien: [] }),
    ...bien('xich-voi', { than: 'xich', tay: 'hoi', camBien: [] }),
    'xich-voi-phun': [{ than: 'xich', tay: 'hoi', camBien: [] }, { tay: { dangBanTruoc: true } }],
    'xich-voi-phun-sau': [{ than: 'xich', tay: 'hoi', camBien: [] }, { tay: { dangBanSau: true } }],
    ...bien('xich-hn', HN_XICH),
    'xich-hn-do': [HN_XICH, { camBien: { bat: true, mat: true } }],
    'xich-hn-phun': [HN_XICH, { tay: { dangBanTruoc: true } }],
    ...bien('du', HN_XICH),
    'du-do': [HN_XICH, { camBien: { bat: true, mat: true } }],
    'du-phun': [HN_XICH, { tay: { dangBanTruoc: true } }],
    ...bien('r2', { than: 'hai-banh', tay: 'kep', camBien: [], son: 'lam' }, { tay: KEP }),
  },
  m3: {
    ...bien('xich', { than: 'xich', tay: null, camBien: [] }),
    ...bien('nhen', { than: 'nhen', tay: null, camBien: [] }),
    ...bien('nhen-co', { than: 'nhen', tay: null, camBien: [] }, { co: true }),
    ...bien('nhen-nc', { than: 'nhen', tay: 'nam-cham', camBien: [] }),
    'nhen-nc-n': [{ than: 'nhen', tay: 'nam-cham', camBien: [] }, { tay: { cuc: 'N', bat: true } }],
    ...bien('nhen-tu', { than: 'nhen', tay: 'nam-cham', camBien: TU }),
    'nhen-tu-do': [{ than: 'nhen', tay: 'nam-cham', camBien: TU }, { camBien: { bat: true, mat: true } }],
    'nhen-tu-n': [{ than: 'nhen', tay: 'nam-cham', camBien: TU }, { tay: { cuc: 'N', bat: true } }],
    'nhen-tu-s': [{ than: 'nhen', tay: 'nam-cham', camBien: TU }, { tay: { cuc: 'S', bat: true } }],
    ...bien('nhen-tu-co', { than: 'nhen', tay: 'nam-cham', camBien: TU }, { co: true }),
    ...bien('r2', { than: 'xich', tay: null, camBien: [], son: 'lam' }),
  },
  m5: {
    ...bien('nhen', { than: 'nhen', tay: null, camBien: [] }),
    ...bien('drone', { than: 'drone', tay: null, camBien: [] }),
    'drone-pin': [{ than: 'drone', tay: null, camBien: [] }, { camBien: { bat: true } }],
    ...bien('drone-son', { than: 'drone', tay: 'son', camBien: [] }),
    'drone-son-red': [{ than: 'drone', tay: 'son', camBien: [] }, { tay: { mauSon: 'red' } }],
    'drone-son-yellow': [{ than: 'drone', tay: 'son', camBien: [] }, { tay: { mauSon: 'yellow' } }],
    'drone-son-blue': [{ than: 'drone', tay: 'son', camBien: [] }, { tay: { mauSon: 'blue' } }],
    'drone-son-green': [{ than: 'drone', tay: 'son', camBien: [] }, { tay: { mauSon: 'green' } }],
    ...bien('drone-cam', { than: 'drone', tay: 'son', camBien: CAM4 }),
    'drone-cam-do': [{ than: 'drone', tay: 'son', camBien: CAM4 }, { camBien: { mat: true } }],
    'drone-cam-red': [{ than: 'drone', tay: 'son', camBien: CAM4 }, { tay: { mauSon: 'red' } }],
    'drone-cam-blue': [{ than: 'drone', tay: 'son', camBien: CAM4 }, { tay: { mauSon: 'blue' } }],
    'drone-cam-yellow': [{ than: 'drone', tay: 'son', camBien: CAM4 }, { tay: { mauSon: 'yellow' } }],
    'drone-cam-green': [{ than: 'drone', tay: 'son', camBien: CAM4 }, { tay: { mauSon: 'green' } }],
    'drone-duoi-red': [{ than: 'drone', tay: 'son', camBien: CAM4_BAY }, { tay: { mauSon: 'red' } }],
    ...bien('drone-duoi', { than: 'drone', tay: 'son', camBien: CAM4_BAY }),
    'drone-duoi-do': [{ than: 'drone', tay: 'son', camBien: CAM4_BAY }, { camBien: { mat: true } }],
    ...bien('r2', { than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }),
  },
};
/** Tên ngắn cho ô / vật có tên dài hay trùng tiền tố. */
const TEN_O = { 'luong-hoa': 'luong', 'o-hoa': 'hoa' };
const TEN_VAT = { 'bao-hat': 'bao' };
const DUOI = (s) => {
  if (!s || typeof s !== 'object' || !Object.keys(s).length) return '';
  if ('suc' in s) return s.suc === 0 ? 'tat' : '';      // lửa: chỉ tách bản đã tắt
  if ('pha' in s || 'mask' in s || 'le' in s || 'manh' in s) return '';
  return Object.values(s).map((v) => String(v).toLowerCase()).join('-');
};

const chon = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(HINH);
const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 900));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  trang.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.log('  [trang]', m.text()); });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  for (const mua of chon) {
    const ra = resolve(goc, '../public/robot', mua);
    await mkdir(ra, { recursive: true });
    const luu = async (ten, url) => { if (url) await writeFile(resolve(ra, ten + '.png'), Buffer.from(url.split(',')[1], 'base64')); else console.log('KHÔNG', mua, ten); };
    for (const [ten, [c, tt]] of Object.entries(HINH[mua])) {
      await luu(ten, await trang.evaluate(([c, tt, canh]) => {
        try { if (window.VeVector.kiemGhep) window.VeVector.kiemGhep(c); return VeRobot.veCo(c, tt, 1, canh).toDataURL('image/png'); } catch (e) { console.warn(e.message); return null; }
      }, [c, tt, CANH]));
    }
    const ten = [];
    for (const loai of ['o', 'vat']) {
      const ds = await trang.evaluate((loai) => VeVector.ds(loai).map((ma) => ({ ma, tt: VeVector.lay(loai, ma).cacTrangThai || [{}] })), loai);
      for (const { ma, tt } of ds) {
        const goc = (loai === 'o' ? TEN_O : TEN_VAT)[ma] ?? ma;
        for (const s of tt) {
          const d = DUOI(s), t = `${loai}-${goc}${d ? '-' + d : ''}`;
          if (ten.includes(t)) continue;
          ten.push(t);
          await luu(t, await trang.evaluate(([loai, ma, s, canh]) => {
            try { const cv = VeVector[loai](ma, canh, s); return cv ? cv.toDataURL('image/png') : null; } catch (e) { return null; }
          }, [loai, ma, s, CANH_O]));
        }
      }
    }
    console.log('xong', mua, Object.keys(HINH[mua]).length, 'robot ·', ten.join(' '));
  }
  await tr.close();
} finally {
  may.kill();
}
