// Xuất hình robot, ô sân, vật mùa Cảng sông (Cần cẩu container R1) ra public/robot/cang/.
// Chạy: node tools/xuat-cang.mjs
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = existsSync(resolve(goc, '../../server.mjs')) ? resolve(goc, '../..') : 'd:/Users/tuanla2/game/doi-robot-chan-hung';
const ra = resolve(goc, '../public/robot/cang');
const PORT = 4219, CANH = 480, CANH_O = 320;
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

  const CAM = [{ ma: 'quet-ma', o: 'tren' }];
  const cfg = (tay = null, cam = []) => ({ than: 'cau', tay, camBien: cam });

  const HINH = {
    'nhen': [{ than: 'nhen', tay: null, camBien: [] }, {}],
    'nhen-ngac': [{ than: 'nhen', tay: null, camBien: [] }, { mat: 'ngac' }],
    'cau': [cfg(), {}],
    'cau-vui': [cfg(), { mat: 'vui' }],
    'cau-ngac': [cfg(), { mat: 'ngac' }],
    'cau-moc': [cfg('moc-cau'), {}],
    'cau-moc-vui': [cfg('moc-cau'), { mat: 'vui', tay: { kep: true } }],
    'cau-moc-ngac': [cfg('moc-cau'), { mat: 'ngac' }],
    'cau-moc-kep': [cfg('moc-cau'), { tay: { kep: true, cam: true } }],
    'cau-quet': [cfg('moc-cau', CAM), {}],
    'cau-quet-vui': [cfg('moc-cau', CAM), { mat: 'vui', camBien: { bat: true } }],
    'cau-quet-ngac': [cfg('moc-cau', CAM), { mat: 'ngac' }],
    'cau-quet-bat': [cfg('moc-cau', CAM), { camBien: { bat: true } }],
    'cau-ray': [cfg('moc-cau', CAM), { ray: true, camBien: { bat: true } }],
    'cau-ray-vui': [cfg('moc-cau', CAM), { ray: true, mat: 'vui', camBien: { bat: true } }],
    'cau-doi': [cfg('moc-cau', CAM), { ray: true, tay: { doi: true }, camBien: { bat: true } }],
    'cau-doi-vui': [cfg('moc-cau', CAM), { ray: true, mat: 'vui', tay: { doi: true, kep: true }, camBien: { bat: true } }],
    'cau-du': [cfg('moc-cau', CAM), { ray: true, tay: { doi: true }, camBien: { bat: true, can: true } }],
    'cau-du-vui': [cfg('moc-cau', CAM), { ray: true, mat: 'vui', tay: { doi: true, kep: true }, camBien: { bat: true, can: true } }],
    'cau-du-ngac': [cfg('moc-cau', CAM), { ray: true, mat: 'ngac', tay: { doi: true }, camBien: { bat: true, can: true } }],
    'r2': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { tay: { bat: false } }],
    'r2-hut': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { tay: { bat: true, cuc: 'N' } }],
    'r2-vui': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { mat: 'vui', tay: { bat: true, cuc: 'N' } }],
  };

  const O_SAN = {
    'o-bai-cont': ['bai-cont', {}],
    'o-boong-tau': ['boong-tau', { co: true }],
    'o-boong-tau-1': ['boong-tau', { co: true, so: 1 }],
    'o-boong-tau-2': ['boong-tau', { co: true, so: 2 }],
    'o-tau-vang': ['boong-tau', { co: false }],
    'o-ray': ['ray', {}],
    'o-ray-doc': ['ray', { doc: true }],
    'o-tuong-cang': ['tuong-cang', {}],
    'o-nuoc': ['nuoc', {}],
    'o-dich': ['dich', {}],
    'o-bang-phai': ['bang', { huong: 1, pha: 0 }],
    'o-nut-tat': ['nut-de', { bat: false }],
    'o-nut-bat': ['nut-de', { bat: true }],
  };

  const VAT = {
    'vat-cont-do': ['container', { so: 12, mau: 0 }],
    'vat-cont-lam': ['container', { so: 25, mau: 1 }],
    'vat-cont-vang': ['container', { so: 38, mau: 2 }],
    'vat-cont-xanh': ['container', { so: 47, mau: 3 }],
    'vat-cont-nang': ['container', { so: 84, mau: 0, tan: 4, hienTan: true }],
    'vat-chong-2': ['chong-cont', { cont: [{ so: 14 }, { so: 28 }] }],
    'vat-chong-3': ['chong-cont', { cont: [{ so: 11 }, { so: 22 }, { so: 36 }] }],
    'vat-kien-cang': ['kien-cang', { mau: 'blue' }],
    'vat-khoi-sat': ['khoi-sat', { sat: true }],
  };

  for (const [ten, [c, tt]] of Object.entries(HINH)) {
    const kq = await trang.evaluate(([cfg, trangThai, canh]) => {
      const c = window.VeRobot.veCo(cfg, trangThai, 1, canh);
      return { url: c.toDataURL('image/png'), w: c.width, h: c.height };
    }, [c, tt, CANH]);
    await luu(resolve(ra, `${ten}.png`), kq);
  }

  for (const [ten, [ma, tt]] of Object.entries(O_SAN)) {
    const kq = await trang.evaluate(([m, t, canh]) => {
      const c = window.VeVector.o(m, canh, t);
      return c ? { url: c.toDataURL('image/png'), w: c.width, h: c.height } : null;
    }, [ma, tt, CANH_O]);
    await luu(resolve(ra, `${ten}.png`), kq);
  }

  for (const [ten, [ma, tt]] of Object.entries(VAT)) {
    const kq = await trang.evaluate(([m, t, canh]) => {
      const c = window.VeVector.vat(m, canh, t);
      return c ? { url: c.toDataURL('image/png'), w: c.width, h: c.height } : null;
    }, [ma, tt, CANH_O]);
    await luu(resolve(ra, `${ten}.png`), kq);
  }

  await tr.close();
} finally {
  may.kill();
}
