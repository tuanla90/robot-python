// Chụp khung soát phim gói CLB theo luật hoc/LUAT-SUA-PHIM-CLB.md mục 7: mở game (server.mjs), gắn phim của gói bằng PhimCLB.mo,
// với mỗi cảnh chụp khung GIỮA câu 1 (đầu cảnh + 70) và KHUNG DỪNG (ngay trước đoạn chuyển sang cảnh sau; cảnh cuối: khung áp chót).
// Ảnh 1080×1920 (sân khấu 360×640 × 3) ra out/soat/<mã gói>/<stt>-<id cảnh>-<giua|dung>.png, rồi tools/ghep-soat.py ghép thành bảng.
// Chạy (từ phim-clb/): node tools/chup-khung.mjs tay-gap cam-bien …   (mã gói như hoc/thu-tu-chuong.js; 'mo-dau' cũng được)
// Cần đóng gói trước: node tools/web/dong-goi.mjs. Chrome: biến CHROME hoặc chỗ cài mặc định.
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const PORT = Number(process.env.PORT || 4211);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const dsGoi = process.argv.slice(2);
if (!dsGoi.length) { console.error('Dùng: node tools/chup-khung.mjs <mã gói> …'); process.exit(1); }

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 900));
const trinh = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
try {
  const ctx = await trinh.newContext({ viewport: { width: 420, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('  lỗi trang:', e.message));
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.PhimGoi && !!document.getElementById('stage'), null, { timeout: 30000 });
  await page.evaluate(() => { document.body.classList.add('san-sang'); });
  await page.addScriptTag({ url: `/hoc/game/phim-clb/phim-clb.js?v=${Date.now()}` });
  await page.waitForFunction(() => !!window.PhimCLB, null, { timeout: 30000 });
  await page.addStyleTag({ content: '.pc-play{display:none !important}' });

  for (const ma of dsGoi) {
    const moc = await page.evaluate((m) => window.PhimCLB.moc(m), ma);
    if (!moc) { console.error(`  ${ma}: không có phim`); continue; }
    const ra = resolve(goc, '../out/soat', ma);
    await mkdir(ra, { recursive: true });
    await page.evaluate((m) => window.PhimCLB.mo(m, document.getElementById('stage'), { boQua: 'Bỏ qua', cuoi: 'Vào gói', tiep: 'Tiếp' }), ma);
    await page.waitForFunction(() => !!window.PhimCLB.player(), null, { timeout: 15000 });
    await page.waitForTimeout(600);
    await page.evaluate(() => window.PhimCLB.player().pause());
    const stage = page.locator('#stage');
    const n = moc.starts.length;
    // CANH=<id cảnh> KHUNG=30,55,80 → chỉ chụp cảnh ấy ở các khung (tính từ đầu cảnh) để soát hoạt cảnh
    const chiCanh = process.env.CANH, khungRieng = (process.env.KHUNG || '').split(',').filter(Boolean).map(Number);
    for (let i = 0; i < n; i++) {
      if (chiCanh && moc.ids[i] !== chiCanh) continue;
      const giua = moc.starts[i] + 70;
      const dung = i + 1 < n ? moc.starts[i + 1] - 1 : moc.total - 2;
      const ds = khungRieng.length ? khungRieng.map((k) => [`k${String(k).padStart(3, '0')}`, moc.starts[i] + k]) : [['giua', giua], ['dung', dung]];
      for (const [nhan, f] of ds) {
        await page.evaluate((k) => { const p = window.PhimCLB.player(); p.pause(); p.seekTo(k); }, f);
        await page.waitForTimeout(1500);
        const tep = resolve(ra, `${String(i + 1).padStart(2, '0')}-${moc.ids[i]}-${nhan}.png`);
        await stage.screenshot({ path: tep });
      }
    }
    await page.evaluate(() => window.PhimCLB.dong());
    console.log(`${ma}: ${n} cảnh, ${n * 2} ảnh → ${ra}`);
  }
} finally {
  await trinh.close();
  may.kill();
}
