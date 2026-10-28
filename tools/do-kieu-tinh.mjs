/* ============================================================================
   tools/do-kieu-tinh.mjs — MÁY ĐO KIỂU TÍNH (V7c3, 29/10): giao diện có đổi không khi sửa CSS / phông.
   Chạy Chrome headless thật (DevTools Protocol qua WebSocket có sẵn của Node, không cần gói ngoài), mở game qua server.mjs (cổng tạm),
   đi qua các cảnh (màn đầu, Cài đặt, chọn gói, lưới màn, màn chơi: khay + hộp gợi ý + thua + thắng, Lắp robot, Sổ lệnh, thẻ Bộ phận, phim mở đầu, phim gói)
   ở hai khổ 1280 × 800 và 360 × 640. Mỗi phần tử nhìn thấy (và ::before / ::after có content) ghi: hộp bao (làm tròn 0,5 px) + kiểu tính (getComputedStyle)
   color, background*, border*, border-radius, box-shadow, font-family / size / weight, opacity, transform, display, visibility (+ vài thuộc tính hay dính pixel:
   clip-path, image-rendering, text-shadow, filter, letter-spacing, line-height, animation-name / timing). Hoạt cảnh CSS được dừng ở cùng thời điểm (400 ms) trước khi đo.
   Mỗi cảnh: xoá localStorage, tải lại trang, dựng cảnh, đợi, đo. svg / canvas đo phần tử gốc, không đi vào trong.

   Cách chạy (tại gốc repo; server.mjs được máy tự bật ở cổng tạm rồi tự tắt):
     node tools/do-kieu-tinh.mjs --ghi-nen            ghi NỀN ra tools/nen-kieu-tinh.json (chỉ khi cố ý, ghi lý do vào commit)
     node tools/do-kieu-tinh.mjs                      đo cây hiện tại, so với nền, in khác biệt; mã thoát 1 nếu khác
     node tools/do-kieu-tinh.mjs --cong 4202 --chrome "<đường dẫn chrome.exe>"  (mặc định cổng 4202, Chrome ở Program Files)
     node tools/do-kieu-tinh.mjs --canh man-dau,cai-dat   chỉ đo vài cảnh
   ========================================================================== */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEN = path.join(GOC, 'tools', 'nen-kieu-tinh.json');
const arg = (ten, md) => { const i = process.argv.indexOf(ten); return i > 0 ? process.argv[i + 1] : md; };
const GHI_NEN = process.argv.includes('--ghi-nen');
const CONG = +arg('--cong', 4202), CONG_DT = CONG + 5000;
const CHROME = arg('--chrome', ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((f) => fs.existsSync(f)));
const CHI = arg('--canh', '') ? arg('--canh').split(',') : null;
const KHO = [[1280, 800], [360, 640]];
const THU = arg('--thu', '');           // gỡ lỗi máy đo: chạy một biểu thức trong trang (sau khi tải, đã bỏ phim) rồi in kết quả
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------------------- đo trong trang (chuỗi hàm, chạy bằng Runtime.evaluate) */
const P = ['display', 'visibility', 'opacity', 'transform', 'color', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
  'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'borderRadius', 'boxShadow', 'outline', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
  'textShadow', 'textTransform', 'textAlign', 'clipPath', 'imageRendering', 'filter', 'animationName', 'animationTimingFunction', 'zIndex', 'content'];
const DO = '(' + String(function do_(P) {
  for (const a of document.getAnimations()) { try { if (a instanceof CSSTransition) a.finish(); else { a.pause(); a.currentTime = 400; } } catch (e) { /* bỏ qua */ } }
  const r5 = (v) => Math.round(v * 2) / 2;
  const kq = {};
  // js = phần tử JS đặt transform nội tuyến theo thời gian (robot màn đầu đi lại…): hộp bao + transform đổi theo lúc đo, không phải CSS → ghi 'js'
  const ghi = (k, cs, hop, js) => {
    const o = (js ? 'js' : hop ? [r5(hop.left), r5(hop.top), r5(hop.width), r5(hop.height)].join(',') : '') + '|';
    kq[k] = o + P.map((p) => (js && p === 'transform' ? 'js' : p === 'content' && (cs[p] === 'normal' || cs[p] === 'none') ? '' : cs[p])).join('|');
  };
  const di = (el, k) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') return;
    const conTrong = cs.display === 'contents';
    if (!conTrong && el.getClientRects().length === 0) return;
    if (!conTrong) ghi(k, cs, el.getBoundingClientRect(), !!(el.style && el.style.transform));
    for (const ps of ['::before', '::after']) { const c2 = getComputedStyle(el, ps); if (c2.content && c2.content !== 'none' && c2.content !== 'normal' && c2.display !== 'none') ghi(k + ps, c2, null); }
    const tg = el.tagName.toLowerCase();
    if (tg === 'svg' || tg === 'canvas' || tg === 'script' || tg === 'style') return;
    let i = 0;
    for (const c of el.children) { i++; const t2 = c.tagName.toLowerCase(); if (t2 === 'script' || t2 === 'style' || t2 === 'link') continue;
      di(c, k + '/' + i + t2 + (c.id ? '#' + c.id : '') + (typeof c.className === 'string' && c.className.trim() ? '.' + c.className.trim().split(/\s+/).join('.') : '')); }
  };
  di(document.documentElement, 'html');
  return kq;
}) + ')(' + JSON.stringify(P) + ')';

/* ---------------------------------------------------------------- các cảnh: [tên, phim? (giữ phim mở đầu), hàm dựng (chuỗi async trong trang)] */
const CHO = `const cho = (f, ms) => new Promise((ok, loi) => { const t0 = Date.now(); (function l() { let v; try { v = f(); } catch (e) { v = null; } if (v) ok(v); else if (Date.now() - t0 > (ms || 20000)) loi(new Error('hết giờ chờ: ' + f)); else setTimeout(l, 50); })(); });
  const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
  const bam = (s) => { const e = document.querySelector(s); if (!e) throw new Error('không thấy ' + s); e.click(); return e; };
  const vaoChoi = async (ma) => { App.vaoMan(ma); await cho(() => App.manHinh === 'choi' && document.querySelector('.pal .brick')); await ngu(800); if (document.querySelector('#lop-hop.mo')) { TP.Hop.dong(); await ngu(700); } };   // đóng thẻ "Bộ phận mới" (ThePart.choMan) rồi đợi hết chặn chạm
  const manChoi = () => ManHoc.danhSach.find((m) => !m.lapRap && !m.doi && m.loiGiai && m.goiY && m.goiY.length && !(window.HuongDanMan && HuongDanMan[m.ma]) && !(m.taoHam && m.taoHam.length) && !(m.loiGiai.hamCuaEmMoi && m.loiGiai.hamCuaEmMoi.length));`;
const CANH = [
  ['phim-mo-dau', true, `await cho(() => document.querySelector('.md'));`],
  ['man-dau', false, ``],
  ['cai-dat', false, `CaiDat.mo(); await cho(() => document.querySelector('#lop-hop.mo .hop'));`],
  ['so-lenh', false, `SoLenhMan.mo(); await cho(() => document.querySelector('#lop-hop.mo .hop'));`],
  ['the-bo-phan', false, `ThePart.mo('kep'); await cho(() => document.querySelector('#lop-hop.mo .hop'));`],
  ['chon-goi', false, `App.hien('goi'); await cho(() => App.manHinh === 'goi');`],
  ['luoi-man', false, `App.vaoGoi(App.dsGoi()[0].ma); await cho(() => App.manHinh === 'chon');`],
  ['phim-goi', false, `const g = App.dsGoi().find((g) => PhimGoi.co(g.ma)); PhimGoi.mo(g.ma, function () {}); await cho(() => document.querySelector('.md'));`],
  ['the-bo-phan-moi', false, `App.vaoMan(manChoi().ma); await cho(() => document.querySelector('#lop-hop.mo .hop-part'));`],
  ['choi-khay', false, `await vaoChoi(manChoi().ma); const nk = document.querySelector('.pal .nk'); if (nk) nk.click();`],
  ['choi-goi-y', false, `await vaoChoi(manChoi().ma); bam('[data-nut="goi-y"]'); await cho(() => document.querySelector('.bong.show'));`],
  ['choi-thua', false, `const m = manChoi(); Luu.ghiNhap(m.ma, { chinh: [], hamCuaMan: [] }); await vaoChoi(m.ma); bam('[data-nut="chay"]'); await ngu(300); await cho(() => !Choi.trangThai().busy); await ngu(500);`],
  ['choi-thang', false, `const m = manChoi(); Luu.ghiNhap(m.ma, { chinh: m.loiGiai.chinh.slice(), hamCuaMan: (m.loiGiai.hamCuaMan || []).map((f) => ({ ten: f.ten, thamSo: (f.thamSo || []).slice(), than: f.than.slice() })) }); await vaoChoi(m.ma);
     bam('[data-nut="toc"]'); bam('[data-nut="chay"]'); await cho(() => document.querySelector('.hop-thang'), 60000); await ngu(400);`],
  ['lap-robot', false, `const m = ManHoc.danhSach.find((m) => m.lapRap); App.vaoMan(m.ma); await cho(() => App.manHinh === 'lap'); await ngu(300);`]
];

/* ---------------------------------------------------------------- CDP tối thiểu */
async function moTrang() {
  for (let i = 0; i < 100; i++) { try { const r = await fetch('http://127.0.0.1:' + CONG_DT + '/json/version'); if (r.ok) break; } catch (e) { /* chưa lên */ } await ngu(100); }
  const t = await (await fetch('http://127.0.0.1:' + CONG_DT + '/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((ok, loi) => { ws.onopen = ok; ws.onerror = loi; });
  let id = 0; const cho = new Map(), suKien = [];
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && cho.has(m.id)) { const c = cho.get(m.id); cho.delete(m.id); m.error ? c[1](new Error(m.error.message)) : c[0](m.result); } else if (m.method) suKien.push(m); };
  const goi = (method, params = {}) => new Promise((ok, loi) => { const i = ++id; cho.set(i, [ok, loi]); ws.send(JSON.stringify({ id: i, method, params })); });
  const chay = async (bt) => {
    const r = await goi('Runtime.evaluate', { expression: bt, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
    return r.result.value;
  };
  return { goi, chay, suKien, dong: () => ws.close() };
}

async function main() {
  if (!CHROME) throw new Error('không thấy Chrome / Edge; chỉ đường bằng --chrome');
  const tam = fs.mkdtempSync(path.join(os.tmpdir(), 'do-kieu-tinh-'));
  const sv = spawn(process.execPath, ['-e', "import('./server.mjs')"], { cwd: GOC, env: Object.assign({}, process.env, { PORT: String(CONG) }), stdio: 'ignore' });
  const cr = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--remote-debugging-port=' + CONG_DT, '--user-data-dir=' + tam, 'about:blank'], { stdio: 'ignore' });
  const URL_ = 'http://localhost:' + CONG + '/hoc/game/choi.html';
  const kq = {}, loiTrang = [];
  try {
    for (let i = 0; i < 100; i++) { try { if ((await fetch(URL_)).ok) break; } catch (e) { /* server chưa lên */ } await ngu(100); }
    const T = await moTrang();
    await T.goi('Page.enable'); await T.goi('Runtime.enable'); await T.goi('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await T.goi('Page.navigate', { url: URL_ }); await ngu(1500);
    if (THU) {
      await T.chay(`localStorage.clear(); true`); await T.goi('Page.reload', { ignoreCache: true }); await ngu(2500);
      await T.chay(`Luu.datDaXem(MoDau.CO); Luu.datDaXem('gioi-thieu'); location.reload(); true`).catch(() => 0); await ngu(2500);
      console.log(JSON.stringify(await T.chay(`(async () => { ${CHO} return (${THU}); })()`), null, 1)); T.dong(); return;
    }
    for (const [w, h] of KHO) {
      await T.goi('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
      for (const [ten, phim, dung] of CANH) {
        if (CHI && !CHI.includes(ten)) continue;
        const khoa = w + 'x' + h + ':' + ten;
        await T.chay(`localStorage.clear(); sessionStorage.clear(); ${phim ? '' : "localStorage.setItem('__do_kieu_tinh_bo_phim', '1');"} true`);
        T.suKien.length = 0;
        await T.goi('Page.reload', { ignoreCache: true });
        await ngu(300);
        await T.chay(`(async () => { ${CHO} await cho(() => window.App && App.manHinh === 'dau' && document.body.classList.contains('san-sang')); await document.fonts.ready;
          if (localStorage.getItem('__do_kieu_tinh_bo_phim')) { localStorage.removeItem('__do_kieu_tinh_bo_phim'); Luu.datDaXem(MoDau.CO); Luu.datDaXem('gioi-thieu'); TP.Hop.dong(); location.reload(); return 'tai-lai'; } return 'ok'; })()`).catch((e) => 'tai-lai');
        await ngu(400);
        try {
          await T.chay(`(async () => { ${CHO} await cho(() => window.App && App.manHinh === 'dau' && document.body.classList.contains('san-sang')); await document.fonts.ready; await ngu(500); ${dung} await ngu(700); return true; })()`);
          kq[khoa] = await T.chay(DO);
        } catch (e) { kq[khoa] = { __loi: String(e.message || e) }; }
        for (const s of T.suKien) if (s.method === 'Runtime.exceptionThrown') loiTrang.push(khoa + ': ' + (s.params.exceptionDetails.exception ? s.params.exceptionDetails.exception.description : s.params.exceptionDetails.text).split('\n')[0]);
        process.stdout.write('  ' + khoa + ': ' + (kq[khoa].__loi ? 'LỖI ' + kq[khoa].__loi : Object.keys(kq[khoa]).length + ' phần tử') + '\n');
      }
    }
    T.dong();
  } finally {
    cr.kill(); sv.kill();
    await ngu(500);
    try { fs.rmSync(tam, { recursive: true, force: true }); } catch (e) { /* Chrome còn giữ tệp: bỏ */ }
  }
  if (loiTrang.length) console.log('Lỗi trong trang (' + loiTrang.length + '):\n  ' + loiTrang.slice(0, 10).join('\n  '));
  const tong = Object.values(kq).reduce((s, o) => s + Object.keys(o).length, 0);
  if (GHI_NEN) {
    // tệp nền: bảng kiểu (chuỗi kiểu tính không trùng) + mỗi cảnh: phần tử → "hộp bao|#số kiểu" (gọn nhiều lần so với ghi thẳng)
    const bang = [], so = new Map(), nen = {};
    const ma = (v) => { const i = v.indexOf('|'), kieu = v.slice(i + 1); if (!so.has(kieu)) { so.set(kieu, bang.length); bang.push(kieu); } return v.slice(0, i) + '|#' + so.get(kieu); };
    for (const k of Object.keys(kq)) { nen[k] = {}; for (const e of Object.keys(kq[k])) nen[k][e] = e === '__loi' ? kq[k][e] : ma(kq[k][e]); }
    fs.writeFileSync(NEN, '{\n"__kieu": [\n' + bang.map((x) => JSON.stringify(x)).join(',\n') + '\n],\n' + Object.keys(nen).map((k) => JSON.stringify(k) + ': {\n' + Object.keys(nen[k]).map((e) => '  ' + JSON.stringify(e) + ': ' + JSON.stringify(nen[k][e])).join(',\n') + '\n}').join(',\n') + '\n}\n');
    console.log('ĐÃ GHI NỀN ' + path.relative(GOC, NEN) + ': ' + Object.keys(kq).length + ' cảnh, ' + tong + ' phần tử, ' + bang.length + ' bộ kiểu khác nhau');
    return;
  }
  const nen = JSON.parse(fs.readFileSync(NEN, 'utf8')), BANG = nen.__kieu; delete nen.__kieu;
  for (const k of Object.keys(nen)) for (const e of Object.keys(nen[k])) if (e !== '__loi') { const v = nen[k][e], i = v.lastIndexOf('|#'); nen[k][e] = v.slice(0, i) + '|' + BANG[+v.slice(i + 2)]; }
  const TEN = ['hộp'].concat(P), khac = [];
  for (const k of Object.keys(nen)) {
    if (CHI && !CHI.includes(k.split(':')[1])) continue;
    const a = nen[k], b = kq[k];
    if (!b) { khac.push(k + ': không đo được'); continue; }
    if (a.__loi || b.__loi) { if (a.__loi !== b.__loi) khac.push(k + ': lỗi dựng cảnh nền=' + a.__loi + ' mới=' + b.__loi); continue; }
    for (const e of Object.keys(a)) if (!(e in b)) khac.push(k + ' MẤT ' + e);
    for (const e of Object.keys(b)) if (!(e in a)) khac.push(k + ' THÊM ' + e);
    for (const e of Object.keys(a)) if (e in b && a[e] !== b[e]) {
      const x = a[e].split('|'), y = b[e].split('|'), ds = [];
      for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) ds.push(TEN[i] + ': ' + x[i] + ' → ' + y[i]);
      khac.push(k + ' ĐỔI ' + e + ': ' + ds.join(' ; '));
    }
  }
  for (const k of Object.keys(kq)) if (!nen[k]) khac.push(k + ': cảnh mới, nền không có');
  console.log('Đo ' + Object.keys(kq).length + ' cảnh, ' + tong + ' phần tử (+ ::before / ::after) ở ' + KHO.map((k) => k.join(' × ')).join(' và '));
  if (khac.length) { console.log('KHÁC NỀN: ' + khac.length + ' chỗ\n  ' + khac.slice(0, 60).join('\n  ') + (khac.length > 60 ? '\n  … còn ' + (khac.length - 60) : '')); process.exitCode = 1; }
  else console.log('KHÔNG KHÁC NỀN (0 chỗ)');
}
main().catch((e) => { console.error(e); process.exitCode = 2; });
