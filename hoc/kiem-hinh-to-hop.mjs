/* ============================================================================
   kiem-hinh-to-hop.mjs — máy kiểm HÌNH TỔ HỢP robot (gói M9H2, 4/11): mọi ô ● ✔ ★ của bảng ghép (hoc/bang-ghep.js) vẽ được bằng VeVector như trong game, và trang xem
   hoc/game/xem-to-hop.html nạp đủ. Gồm:
   a. mọi ô ● ✔ ★ (thân + một part): VeVector.robot không ném ở cỡ ô sân (56 px) và cỡ thẻ (192 px = 160 × 1,2 của VeRobot.veCo), 4 hướng, nghỉ và đang làm; cần cẩu: veCanCau;
   b. bộ ba mùa 9 (game/xem-to-hop-ds.js): bảng ghép cho (mở mọi lai), vẽ được;
   c. trang xem: nạp đủ mọi tệp ve-vector-than / tay / cam có trong game/, chạy được trên DOM giả (không thẻ "Lỗi vẽ"), danh sách ô màn cũ đã dùng khớp man-*.js;
   Chạy: node hoc/kiem-hinh-to-hop.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const game = path.join(day, 'game');
const require = createRequire(import.meta.url);
const BG = require(path.join(day, 'bang-ghep.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const VV = LapRap.veVector();
const DS = require(path.join(game, 'xem-to-hop-ds.js')).DS;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1500) : '')); }
}
const J = (o) => JSON.stringify(o);
const MO_HET = { moLai: Array.from({ length: 15 }, (_, i) => 'L' + (i + 1)) };
const TT_HIEN = ['goc', 'duoc', 'lai'];
const CO = [56, 192];
const cfgCua = (than, tay, cam, son) => Object.assign(LapRap.cauHinhCua({ than, tay, camBien: cam }), son ? { son } : {});
/** Trạng thái "đang làm" như trang xem (stCua). */
function stLam(cfg) {
  return { than: { banh: { trai: 1, phai: 1 }, buoc: 1, quat: true, doc: true, chay: true },
    tay: cfg.tay ? { bat: true, tuThe: 'duoi', kep: 'dong', dangBanTruoc: true, dangNem: true, day: true, mauSon: 'green', notLoa: 3, pha: 0.3, cuc: 'N' } : undefined, camBien: { bat: true, mat: true } };
}
function veThu(cfg) {
  try {
    for (const canh of CO) for (const h of [0, 1, 2, 3]) for (const lam of [false, true]) { VV.xoaDem(); if (!VV.robot(cfg, lam ? stLam(cfg) : {}, h, canh)) return 'robot() trả null'; }
    if (cfg.than === 'cau') for (const nac of [0, 2, 4, 6]) { const cv = new VV.CanvasGia(168, 168); VV.veCanCau(cv.getContext('2d'), { bx: 84, by: 84, nac, tam: 1, o: 56, be: true, cfg }); }
    return null;
  } catch (e) { return e.message; }
}

/* ------------------------------------------------------------------ a. ô bảng */
console.log('a. mọi ô ● ✔ ★ vẽ được (thân + một part)');
const O_HIEN = BG.dsO().filter((x) => TT_HIEN.includes(x.tt));
{
  const loi = [];
  for (const x of O_HIEN) { const l = veThu(cfgCua(x.than, x.khe === 'tay' ? x.ma : null, x.khe === 'camBien' ? x.ma : null)); if (l) loi.push(x.than + '/' + x.ma + ': ' + l); }
  kiem(O_HIEN.length + ' ô ● ✔ ★: VeVector.robot không ném ở ' + CO.join(' / ') + ' px, 4 hướng, nghỉ / đang làm (cần cẩu: cả veCanCau 4 nấc)', loi.length === 0, loi.slice(0, 6).join(' | '));
  const tk = BG.tongKet();
  kiem('số ô hiện trên trang = ● ' + tk.goc + ' + ✔ ' + tk.duoc + ' + ★ ' + tk.lai, O_HIEN.length === tk.goc + tk.duoc + tk.lai, O_HIEN.length);
}

/* ---------------------------------------------------------- b. bộ ba mùa 9 */
console.log('b. bộ ba mùa 9 (xem-to-hop-ds.js)');
{
  const chan = DS.filter((d) => !BG.kiemGhep(d[0], d[1], d[2], MO_HET).ok), loi = [];
  kiem(DS.length + ' bộ ba: bảng ghép cho (khi mở mọi lai)', chan.length === 0, J(chan));
  for (const d of DS) { const l = veThu(cfgCua(d[0], d[1], d[2])); if (l) loi.push(d.slice(0, 3).join('+') + ': ' + l); }
  kiem(DS.length + ' bộ ba vẽ được ở mọi cỡ / hướng / trạng thái', loi.length === 0, loi.slice(0, 6).join(' | '));
  const trung = DS.map((d) => d.slice(0, 3).join('+')).filter((k, i, a) => a.indexOf(k) !== i);
  kiem('không bộ ba nào trùng', trung.length === 0, trung.join(', '));
}

/* ---------------------------------------------------------- c. trang xem */
console.log('c. trang xem hoc/game/xem-to-hop.html');
const html = fs.readFileSync(path.join(game, 'xem-to-hop.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
{
  const can = fs.readdirSync(game).filter((n) => /^ve-vector-(than|tay)-[\w-]+\.js$|^ve-vector-cam(-[\w-]+)?\.js$/.test(n));
  const thieu = can.filter((n) => !scripts.includes(n));
  kiem('trang nạp đủ ' + can.length + ' tệp hình thân / tay / cảm biến của game/ (cùng bộ lọc với LapRap.veVector)', thieu.length === 0, thieu.join(', '));
  const tayXoay = scripts.indexOf('ve-vector-tay-xoay.js'), tayKep = scripts.indexOf('ve-vector-tay-kep.js');
  kiem('nạp bang-mau, bang-ghep, lap-rap, ve-vector trước các tệp hình; tay kẹp trước tay xoay', ['bang-mau.js', '../bang-ghep.js', '../lap-rap.js', 've-vector.js'].every((s) => scripts.indexOf(s) >= 0 && scripts.indexOf(s) < scripts.indexOf('ve-vector-than-hai-banh.js')) && tayKep >= 0 && tayKep < tayXoay);
  kiem('trang không dùng mã màu hex rời (màu qua biến --g-* của bang-mau.js)', !/#[0-9a-fA-F]{3,8}\b/.test(html.replace(/<script src[^>]*><\/script>/g, '').replace(/getElementById\('[^']*'\)/g, '')));
  /* danh sách ô màn cũ đã dùng (lọc "mới") khớp cách đếm của kiem-bang-ghep.mjs */
  const dung = new Set();
  for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f))) {
    const src = fs.readFileSync(path.join(day, f), 'utf8');
    for (const m of src.matchAll(/than:\s*'([\w-]+)',\s*tay:\s*('([\w-]+)'|null),\s*camBien:\s*\[(?:\{\s*ma:\s*'([\w-]+)')?/g)) { if (m[3]) dung.add(m[1] + '/tay/' + m[3]); if (m[4]) dung.add(m[1] + '/camBien/' + m[4]); }
  }
  const that = BG.dsO('duoc').map((x) => x.than + '/' + x.khe + '/' + x.ma).filter((k) => dung.has(k));
  const trongTrang = (html.match(/var DA_DUNG = \[([^\]]*)\]/) || [, ''])[1].match(/'[^']+'/g)?.map((s) => s.slice(1, -1)) || [];
  kiem('DA_DUNG của trang (' + trongTrang.length + ' ô ✔ màn cũ đã dùng) khớp man-*.js', J([...trongTrang].sort()) === J([...that].sort()), J({ trang: trongTrang, that }));
}
/* chạy trang trên DOM giả: mọi script theo thứ tự, rồi script trong trang; đếm thẻ và "Lỗi vẽ" */
function chayTrang(hanhDong) {
  const ctxGia = () => new Proxy({}, { get: (t, k) => k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : k === 'getTransform' ? () => ({ a: 1, b: 0, c: 0, d: 1 }) : k === 'measureText' ? (s) => ({ width: String(s).length * 6 }) : k in t ? t[k] : () => {}, set: (t, k, v) => { t[k] = v; return true; } });
  const dem = { the: 0, loi: [], canvas: 0 };
  const phan = {};
  function el(tag) {
    const e = { tagName: String(tag).toUpperCase(), children: [], style: {}, attrs: {}, classList: { add() {}, remove() {}, toggle() {} }, _nghe: {}, value: '', className: '',
      appendChild(c) { this.children.push(c); if (c.tagName === 'BUTTON' && /\bthe\b/.test(c.className)) dem.the++; return c; },
      setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(k, f) { this._nghe[k] = f; }, scrollIntoView() {},
      set innerHTML(v) { this._html = v; if (v === '') this.children = []; }, get innerHTML() { return this._html || ''; },
      set textContent(v) { this._text = v; if (/^Lỗi vẽ|^Không vẽ được|^Lỗi:/.test(v)) dem.loi.push(v); }, get textContent() { return this._text || this._html || ''; } };
    if (e.tagName === 'CANVAS') { dem.canvas++; e.width = 300; e.height = 150; const c = ctxGia(); e.getContext = () => c; }
    return e;
  }
  const document = { createElement: el, getElementById: (id) => phan[id] || (phan[id] = el(id === 'huong' || /^loc|^co-/.test(id) ? 'select' : 'div')), documentElement: { style: { setProperty() {} } }, body: { classList: { toggle() {} } } };
  const sb = { document, console, Math, JSON, Object, Array, String, Number, Error, isFinite, parseFloat, Proxy, Set, Map };
  sb.window = sb; sb.globalThis = sb; sb.devicePixelRatio = 1;
  vm.createContext(sb);
  for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(game, s), 'utf8'), sb, { filename: s });
  const inline = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(inline, sb, { filename: 'xem-to-hop.html' });
  if (hanhDong) hanhDong(phan, dem);
  return dem;
}
{
  let dem = null, loi = '';
  try { dem = chayTrang(); } catch (e) { loi = e.stack; }
  const ky = O_HIEN.length + DS.length;
  kiem('trang chạy trên DOM giả không ném; vẽ ' + ky + ' thẻ (' + O_HIEN.length + ' ô + ' + DS.length + ' bộ ba), không thẻ nào "Lỗi vẽ"', !!dem && dem.the === ky && dem.loi.length === 0, loi || J(dem && { the: dem.the, loi: dem.loi.slice(0, 4) }));
  let dem2 = null; loi = '';
  try { dem2 = chayTrang((p, d) => { d.the = 0; p['loc-than'].value = 'gai'; p['loc-than']._nghe.change(); }); } catch (e) { loi = e.stack; }
  const soGai = (() => { const h = (k) => [null].concat(BG.dsCua(k).filter((m) => TT_HIEN.includes(BG.trangThai('gai', k, m)))); return h('tay').length * h('camBien').length - 1; })();
  const kyGai = O_HIEN.filter((x) => x.than === 'gai').length + DS.filter((d) => d[0] === 'gai').length + soGai;
  kiem('lọc thân "gai": hiện ô của thân đó + bộ ba của nó + mọi bộ ba (' + kyGai + ' thẻ), không "Lỗi vẽ"', !!dem2 && dem2.the === kyGai && dem2.loi.length === 0, loi || J(dem2 && { the: dem2.the, loi: dem2.loi.slice(0, 4) }));
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
