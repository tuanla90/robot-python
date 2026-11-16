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
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const NEN = 'bf718c0';                                                       // nền so hình cũ: main lúc gộp vào nhánh mùa 9 (16/11; trước là e80c5e8 = HEAD trước gói M9H2 4/11, main sau đó đổi cẩu 4 hướng, tời)

if (process.argv[2] === '--chup') chupCon();                                 // chế độ con (phần d): chỉ nạp bộ vẽ nền, không nạp bộ vẽ hiện tại
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

/* -------------------------------------------- d. ô cũ không đổi hình (so lệnh vẽ với NEN) */
console.log('d. hình cũ y nguyên: mọi bộ ba ngoài nhóm có hình riêng M9H2 ra đúng từng lệnh vẽ như nền ' + NEN);
/** Nhóm bộ ba CÓ HÌNH RIÊNG M9H2 (được phép khác nền): drone + vòi phun (L15 bình xịt bụng) / tay lưới (L10 phao); nhện + gieo hạt / loa (L6 / L7 bụng), nhện + radar / camera bốn hướng / mic
 *  (L12 / L4 trên nóc); cần cẩu + kẹp / nam châm / tay lưới (L8 gầu, L1 đĩa nam châm, L9 giỏ: thẻ ở đầu đoạn cần, sân chỉ tời, đầu cáp không móc), cần cẩu + từ / camera bụng (L13 ở đầu cần). */
function laHinhRieng(than, tay, cam) {
  if (than === 'drone') return tay === 'hoi' || tay === 'day-keo';
  if (than === 'nhen') return tay === 'son' || tay === 'loa' || ['radar', 'camera-4', 'am-thanh'].includes(cam);
  if (than === 'cau') return ['kep', 'nam-cham', 'day-keo'].includes(tay) || ['tu', 'camera-bay'].includes(cam);
  return false;
}
/** Mọi bộ ba của thân: (tay hợp lệ | không) × (cảm biến hợp lệ | không), trừ bộ trống; ô ● ✔ ★. */
function moiBoBa() {
  const kq = [];
  for (const th of BG.THAN) {
    const hop = (khe) => [null].concat(BG.dsCua(khe).filter((m) => TT_HIEN.includes(BG.trangThai(th, khe, m))));
    for (const tay of hop('tay')) for (const cam of hop('camBien')) if (BG.kiemGhep(th, tay, cam, MO_HET).ok) kq.push([th, tay, cam]);
  }
  return kq;
}
/** Danh sách lần vẽ để so: mỗi bộ ba × 4 hướng × (nghỉ, đang làm, nhện co chân) ở cỡ 56, R1 và R2; cần cẩu thêm veCanCau 3 nấc. */
function dsVe() {
  const ds = [];
  for (const [th, tay, cam] of moiBoBa()) {
    for (const son of ['', 'lam']) {
      const cfg = cfgCua(th, tay, cam, son);
      const sts = [{}, stLam(cfg)].concat(th === 'nhen' ? [{ than: { co: true } }] : []);
      for (const h of [0, 1, 2, 3]) sts.forEach((s, i) => ds.push({ k: [th, tay, cam, son, h, i].join('|'), bo: [th, tay, cam], cfg, st: s, h }));
      if (th === 'cau') [1, 4, 6].forEach((nac) => [{}, stLam(cfg)].forEach((s, i) => ds.push({ k: [th, tay, cam, son, 'nac' + nac, i].join('|'), bo: [th, tay, cam], cfg, st: s, nac })));
    }
  }
  return ds;
}
function bam(VVx, d) {
  VVx.xoaDem();
  let lenh;
  if (d.nac !== undefined) { const cv = new VVx.CanvasGia(168, 168); VVx.veCanCau(cv.getContext('2d'), { bx: 84, by: 84, nac: d.nac, tam: 1, o: 56, be: true, cfg: d.cfg, st: d.st }); lenh = cv.lenh; }
  else lenh = VVx.robot(d.cfg, d.st, d.h, 56).lenh;
  return crypto.createHash('sha1').update(JSON.stringify(lenh)).digest('hex');
}
/* chế độ con: nạp bộ vẽ của nền từ thư mục, băm từng lần vẽ, ghi ra tệp */
function chupCon() {
  const [, , , dirNen, vao, ra] = process.argv, g = path.join(dirNen, 'hoc', 'game'), rq = createRequire(path.join(g, 'x.js'));
  const V0 = rq('./ve-vector.js');
  fs.readdirSync(g).filter((n) => /^ve-vector-(than|tay)-[\w-]+\.js$|^ve-vector-cam(-[\w-]+)?\.js$/.test(n)).sort().forEach((n) => rq('./' + n));
  const kq = {};
  for (const d of JSON.parse(fs.readFileSync(vao, 'utf8'))) { try { kq[d.k] = bam(V0, d); } catch (e) { kq[d.k] = 'LOI ' + e.message; } }
  fs.writeFileSync(ra, JSON.stringify(kq));
  process.exit(0);
}
function chupNen(ds) {
  const tm = path.join(os.tmpdir(), 'kiem-hinh-to-hop-' + NEN), g = path.join(tm, 'hoc', 'game');
  fs.mkdirSync(g, { recursive: true });
  const tep = execFileSync('git', ['ls-tree', '--name-only', NEN, 'hoc/game/'], { cwd: path.dirname(day), encoding: 'utf8' }).split('\n').filter((n) => /^hoc\/game\/(ve-vector[\w-]*|bang-mau)\.js$/.test(n)).concat(['hoc/bang-ghep.js']);
  for (const t of tep) fs.writeFileSync(path.join(tm, t), execFileSync('git', ['show', NEN + ':' + t], { cwd: path.dirname(day), encoding: 'utf8', maxBuffer: 1 << 26 }));
  const vao = path.join(tm, 'ds.json'), ra = path.join(tm, 'bam.json');
  fs.writeFileSync(vao, JSON.stringify(ds));
  execFileSync(process.execPath, [fileURLToPath(import.meta.url), '--chup', tm, vao, ra], { stdio: 'inherit' });
  return JSON.parse(fs.readFileSync(ra, 'utf8'));
}
function soNen(ds, nen) {
  const khacCu = [], giongMoi = new Map();
  for (const d of ds) {
    let b; try { b = bam(VV, d); } catch (e) { b = 'LOI ' + e.message; }
    const rieng = laHinhRieng(...d.bo), khac = b !== nen[d.k];
    if (!rieng && khac) khacCu.push(d.k);
    if (rieng) { const kb = d.bo.join('+'); giongMoi.set(kb, (giongMoi.get(kb) || false) || khac); }
  }
  return { khacCu, chuaDoi: [...giongMoi].filter(([, khac]) => !khac).map(([k]) => k), soRieng: giongMoi.size };
}
const DS_VE = dsVe();
let NEN_BAM = null;
try { NEN_BAM = chupNen(DS_VE); } catch (e) { kiem('chụp hình nền ' + NEN + ' (git show + node con)', false, e.message); }
if (NEN_BAM) {
  const r = soNen(DS_VE, NEN_BAM), soBo = new Set(DS_VE.map((d) => d.bo.join('+'))).size;
  kiem(DS_VE.length + ' lần vẽ (' + soBo + ' bộ ba × 4 hướng × nghỉ / đang làm / co chân × R1 / R2; cần cẩu thêm veCanCau 3 nấc): mọi bộ ba NGOÀI nhóm hình riêng ra đúng từng lệnh như ' + NEN, r.khacCu.length === 0, r.khacCu.length + ' khác: ' + r.khacCu.slice(0, 8).join(', '));
  kiem(r.soRieng + ' bộ ba nhóm hình riêng M9H2: mỗi bộ đều khác nền (hình đã đổi thật)', r.chuaDoi.length === 0, r.chuaDoi.join(', '));
}

/* -------------------------------------------------- e. hình riêng: gắn đúng chỗ */
console.log('e. hình riêng M9H2: part gắn trên thân, không tràn ô, cảm biến nóc nhện không che mắt');
/** Hộp bao (px thiết bị) của các lệnh vẽ do hàm `ve` của bộ phận (loai, ma) ra khi vẽ robot cfg: bọc hàm ve ghi chỉ số lệnh, rồi phát lại lệnh theo dõi phép biến đổi. */
function hopPart(cfg, st, h, canh, loai, ma) {
  const d = VV.lay(loai, ma), goc = d.ve, khoang = [];
  d.ve = function (g) { const i0 = g.lenh.length; const kq = goc.apply(this, arguments); khoang.push([i0, g.lenh.length]); return kq; };
  let cv; try { VV.xoaDem(); cv = VV.robot(cfg, st, h, canh); } finally { d.ve = goc; }
  return hopLenh(cv.lenh, khoang);
}
function hopLenh(lenh, khoang) {
  let m = [1, 0, 0, 1, 0, 0]; const stack = [], hop = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const trong = (i) => khoang.some(([a, b]) => i >= a && i < b);
  const them = (x, y, r) => { const X = m[0] * x + m[2] * y + m[4], Y = m[1] * x + m[3] * y + m[5], R = (r || 0) * Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])); hop.x0 = Math.min(hop.x0, X - R); hop.y0 = Math.min(hop.y0, Y - R); hop.x1 = Math.max(hop.x1, X + R); hop.y1 = Math.max(hop.y1, Y + R); };
  lenh.forEach((l, i) => {
    const [k, ...a] = l;
    if (k === 'save') stack.push(m.slice()); else if (k === 'restore') m = stack.pop() || m;
    else if (k === 'translate') m = mul(m, [1, 0, 0, 1, a[0], a[1]]); else if (k === 'scale') m = mul(m, [a[0], 0, 0, a[1], 0, 0]);
    else if (k === 'rotate') { const c = Math.cos(a[0]), s = Math.sin(a[0]); m = mul(m, [c, s, -s, c, 0, 0]); }
    else if (trong(i)) {
      if (k === 'moveTo' || k === 'lineTo') them(a[0], a[1]);
      else if (k === 'arc') them(a[0], a[1], a[2]); else if (k === 'ellipse') them(a[0], a[1], Math.max(a[2], a[3]));
      else if (k === 'rect') { them(a[0], a[1]); them(a[0] + a[2], a[1] + a[3]); }
      else if (k === 'bezierCurveTo') { them(a[4], a[5]); } else if (k === 'quadraticCurveTo') { them(a[2], a[3]); } else if (k === 'arcTo') { them(a[0], a[1]); them(a[2], a[3]); }
    }
  });
  return hop;
}
/** Hộp (px thiết bị) của hộp thân `b` ({ x, y, w, h } hệ thân) trên canvas cạnh `canh` sau xoay (dung: thân đứng thẳng thanDung). */
function hopThan(cfg, b, h, canh, dung) {
  const t = VV.lay('than', cfg.than), pts = [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].map(([x, y]) => VV.diemTrenO({ x, y }, h, canh, t, dung));
  return { x0: Math.min(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), x1: Math.max(...pts.map((p) => p.x)), y1: Math.max(...pts.map((p) => p.y)) };
}
const giao = (a, b, lo) => a.x0 <= b.x1 + lo && b.x0 <= a.x1 + lo && a.y0 <= b.y1 + lo && b.y0 <= a.y1 + lo;
const trongHop = (a, b, lo) => a.x0 >= b.x0 - lo && a.x1 <= b.x1 + lo && a.y0 >= b.y0 - lo && a.y1 <= b.y1 + lo;
const chongLen = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
function kiemHinhRieng() {
  const C = 100, loi = { tran: [], loLung: [], noc: [], cheMat: [] };
  for (const [th, tay, cam] of moiBoBa().filter((b) => laHinhRieng(...b))) {
    const cfg = cfgCua(th, tay, cam), t = VV.lay('than', th), ten = [th, tay, cam].join('+');
    for (const h of [0, 1, 2, 3]) for (const st of [{}, stLam(cfg)]) {
      const o = { x0: 0, y0: 0, x1: C, y1: C }, vo = hopThan(cfg, t.vo, h, C, !!t.thanDung);
      const rieng = [];
      if (tay && (th !== 'nhen' || tay === 'son' || tay === 'loa') && (th !== 'drone' || tay === 'hoi' || tay === 'day-keo') && (th !== 'cau' || ['kep', 'nam-cham', 'day-keo'].includes(tay))) rieng.push(['tay', tay]);
      if (cam && VV.choVeCam(t, { ma: cam, o: 'tren' }).o) rieng.push(['cam-bien', cam]);
      for (const [loai, ma] of rieng) {
        const p = hopPart(cfg, st, h, C, loai, ma);
        if (!trongHop(p, o, 0.5)) loi.tran.push(ten + ' h' + h + ' ' + ma + ' ' + J(p));
        if (!giao(p, vo, C * 0.12)) loi.loLung.push(ten + ' h' + h + ' ' + ma);
        if (th === 'nhen' && loai === 'cam-bien') {
          if (!trongHop(p, vo, 1)) loi.noc.push(ten + ' h' + h);
          const k = VV.kinhCua(t), kb = hopThan(cfg, k, h, C, true);
          if (!st.camBien && chongLen(p, kb) > 0.08 * (kb.x1 - kb.x0) * (kb.y1 - kb.y0)) loi.cheMat.push(ten + ' h' + h);   // lúc nghỉ (đang đọc: quầng sáng mờ của mic được loang qua mắt)
        }
      }
    }
  }
  return loi;
}
{
  const loi = kiemHinhRieng();
  kiem('part hình riêng nằm trong ô (không tràn) ở 4 hướng, nghỉ / đang làm', loi.tran.length === 0, loi.tran.slice(0, 4).join(' | '));
  kiem('part hình riêng chạm vỏ thân (cách vỏ ≤ 0,12 ô: không lơ lửng)', loi.loLung.length === 0, loi.loLung.slice(0, 6).join(' | '));
  kiem('nhện: radar / camera bốn hướng / mic nằm trọn trên vỏ (nóc) và lúc nghỉ che dải mắt ≤ 8%', loi.noc.length === 0 && loi.cheMat.length === 0, J({ noc: loi.noc.slice(0, 4), cheMat: loi.cheMat.slice(0, 4) }));
}
{
  const ok = (cfg, h) => { const d = VV.lay('tay', cfg.tay); return VV.oTay(VV.lay('than', cfg.than), d, cfg)[0]; };
  kiem('nhện + gieo hạt / loa treo ổ bụng (duoi) như nam châm; nhện + kẹp vẫn ở ổ tay; drone + vòi phun / tay lưới ở ổ duoi',
    ok(cfgCua('nhen', 'son')) === 'duoi' && ok(cfgCua('nhen', 'loa')) === 'duoi' && ok(cfgCua('nhen', 'kep')) === 'tay' && ok(cfgCua('drone', 'hoi')) === 'duoi' && ok(cfgCua('drone', 'day-keo')) === 'duoi');
  const tc = VV.lay('than', 'cau');
  kiem('cần cẩu: tay lai thay chỗ móc (VeVector.TAY_THAY_MOC_CAU = nam châm, kẹp, tay lưới) đúng các ô ★ L1 / L8 / L9 của bảng; cảm biến đầu cần đúng ô ★ L13',
    J([...VV.TAY_THAY_MOC_CAU].sort()) === J(BG.TAY.filter((m) => BG.trangThai('cau', 'tay', m) === 'lai').sort()) && J([...tc.camDauCan].sort()) === J(BG.CAM_BIEN.filter((m) => BG.o('cau', 'camBien', m).lai === 'L13').sort()));
}

/* ------------------------------------------------------ f. tự chứng minh */
console.log('f. tự chứng minh (phá tạm trong bộ nhớ, đặt lại)');
if (NEN_BAM) {
  const kep = VV.lay('tay', 'kep'), goc = kep.ve;
  kep.ve = function (g) { g.save(); g.restore(); return goc.apply(this, arguments); };
  const r = soNen(DS_VE.filter((d) => d.bo[0] === 'hai-banh' && d.bo[1] === 'kep'), NEN_BAM);
  kep.ve = goc;
  kiem('phá tạm tay kẹp (thêm một cặp save / restore): phép d thấy hình cũ hai bánh + kẹp đổi', r.khacCu.length > 0, r.khacCu.length);
  const r2 = soNen(DS_VE.filter((d) => d.bo[0] === 'hai-banh' && d.bo[1] === 'kep'), NEN_BAM);
  kiem('đặt lại xong: hai bánh + kẹp y nguyên nền', r2.khacCu.length === 0, r2.khacCu.length);
}
{
  const t = VV.lay('than', 'nhen'), cu = t.oNoc;
  t.oNoc = { x: 50, y: 58 };
  const l1 = kiemHinhRieng();
  t.oNoc = { x: 50, y: 4 };
  const l2 = kiemHinhRieng();
  t.oNoc = cu;
  const tc = VV.lay('than', 'cau'), cuD = tc.oDauCan;
  tc.oDauCan = { x: 50, y: 160 };
  const l3 = kiemHinhRieng();
  tc.oDauCan = cuD;
  const l4 = kiemHinhRieng();
  kiem('phá tạm nóc nhện xuống dải mắt → phép e kêu "che mắt"; lên ngoài vỏ → kêu "không trên nóc"; đầu cần cẩu ra ngoài ô → kêu "tràn"; đặt lại thì sạch',
    l1.cheMat.length > 0 && l2.noc.length > 0 && l3.tran.length > 0 && !l4.tran.length && !l4.loLung.length && !l4.noc.length && !l4.cheMat.length, J({ che: l1.cheMat.length, noc: l2.noc.length, tran: l3.tran.length, sau: l4 }));
}

/* ------------------------------------------- g. năm chỗ giao diện thô (M9H2 mục c) */
console.log('g. năm chỗ giao diện: thẻ cỗ máy Chọn đội, ổ khóa thẻ R3, chữ thắng cứu người, thanh pin drone, trạm cứu màn giả');
{
  const css = fs.readFileSync(path.join(game, 'choi.css'), 'utf8'), cssV = fs.readFileSync(path.join(game, 'choi-vector.css'), 'utf8');
  const luat = (src, sel) => src.split('\n').filter((d) => d.startsWith(sel + '{')).join(' ');   // mọi luật đúng bộ chọn (cùng bộ chọn có thể khai nhiều dòng)
  const hang = luat(css, '.cd-menu .lr-hang'), ten = luat(css, '.cd-menu .lr-the-ten'), the = luat(css, '.cd-menu .lr-the');
  kiem('1. Chọn đội: bảng cỗ máy 2 cột xuống hàng (grid, không cuộn ngang), thẻ không giới hạn bề ngang, tên xuống dòng không "…"',
    /display:grid/.test(hang) && /repeat\(2,/.test(hang) && /overflow-x:hidden/.test(hang) && /max-width:none/.test(the) && /white-space:normal/.test(ten) && /text-overflow:clip/.test(ten), J({ hang, the, ten }));
  const mc = fs.readFileSync(path.join(game, 'man-choi.js'), 'utf8');
  kiem('2. Màn đội: ổ khóa "Cố định" ở tiêu đề chỉ còn biểu tượng (.co-doi ẩn chữ), tên đọc qua title + aria-label',
    luat(css, '.co-doi .bh .chinh-khoa .ck-chu').includes('display:none') && /e\.parentNode\.setAttribute\('title', nhan\); e\.parentNode\.setAttribute\('aria-label', nhan\)/.test(mc) && /body\.ve-vector \.co-doi \.bh \.chinh-khoa\{/.test(cssV));
  const chu = fs.readFileSync(path.join(game, 'chu.js'), 'utf8');
  kiem("3. Bảng thắng mục tiêu 'cuu-nguoi': chữ 'thang.tieuDe.cuuNguoi' (CỨU ĐƯỢC NGƯỜI!), không còn TỚI CỜ!",
    /'thang\.tieuDe\.cuuNguoi': 'CỨU ĐƯỢC NGƯỜI!'/.test(chu) && /m\.mucTieu === 'cuu-nguoi' \? 'thang\.tieuDe\.cuuNguoi'/.test(mc));
  /* 4. thanh pin: nạp san-ve.js trong vm (như kiem-ve-mua-9), thử SanVe.Field.prototype.coGiTrenDrone trên vài sân */
  const cvGia = () => ({ width: 300, height: 150, style: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, appendChild() {},
    getContext: () => new Proxy({}, { get: (t, k) => k in t ? t[k] : k === 'measureText' ? () => ({ width: 5 }) : k === 'getTransform' ? () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }) : /^create/.test(k) ? () => ({ addColorStop() {} }) : () => {}, set: (t, k, v) => { t[k] = v; return true; } }) });
  const ctx = { console: { log() {}, warn() {}, error() {}, info() {} }, document: { createElement: cvGia, querySelector: () => null, body: {} }, devicePixelRatio: 2, location: { search: '?ve=vector' },
    localStorage: { getItem: () => null, setItem() {} }, performance: { now: () => 0 }, setTimeout() {}, clearTimeout() {}, requestAnimationFrame: () => 0,
    Math, JSON, Object, Array, String, Number, Boolean, Date, Error, RegExp, Map, Set, WeakMap, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Uint8ClampedArray };
  ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
  let loiNap = null;
  try {
    const choi = fs.readFileSync(path.join(game, 'choi.html'), 'utf8');
    [...choi.matchAll(/<script src="([\w./-]+\.js)"/g)].map((m) => m[1]).filter((f) => /^(bang-mau|chu|ve|ve-vector[\w-]*|ve-robot|san-ve)\.js$/.test(f))
      .forEach((f) => vm.runInContext(fs.readFileSync(path.join(game, f), 'utf8'), ctx, { filename: f }));
  } catch (e) { loiNap = e.message; }
  const P = ctx.SanVe && ctx.SanVe.Field.prototype;
  const tren = (rows, x, y, them) => P.coGiTrenDrone.call({ vis: { x, y }, cfg: Object.assign({ rows }, them || {}), objs: (them && them.objs) || [] });
  const ca = P && P.coGiTrenDrone ? [
    ["ThuMua9 'be-sac': drone ngay dưới bè sạc B", tren(['~B~~', '....', '...F'], 1, 1), true],
    ['ô trên là nước trống', tren(['~~~~', '....', '...F'], 1, 1), false],
    ['ô trên là trạm cứu', tren(['....', '....'], 1, 1, { tramCuu: [{ x: 1, y: 0 }] }), true],
    ['ô trên có vật trên sân', tren(['....', '....'], 1, 1, { objs: [{ x: 1, y: 0, tt: 'dat' }] }), true],
    ['ô trên có vật đã vào rổ (tt ro)', tren(['....', '....'], 1, 1, { objs: [{ x: 1, y: 0, tt: 'ro' }] }), false],
    ['drone ở hàng trên cùng', tren(['....', '....'], 1, 0), false]
  ].filter(([, co, can]) => co !== can).map(([t]) => t) : ['không nạp được san-ve.js: ' + loiNap];
  const sv = fs.readFileSync(path.join(game, 'san-ve.js'), 'utf8');
  kiem('4. Thanh pin drone: sân mùa 9, ô phía trên có bè / vật / ký hiệu / trạm cứu → thanh mờ (globalAlpha 0,38), sạc / đọc pin / pin thấp vẫn rõ; sân cũ (không co9) y nguyên',
    ca.length === 0 && /var mo = this\.co9 && !sac && !nay && !thap && this\.coGiTrenDrone\(\)/.test(sv), ca.join(' | '));
  const t9 = fs.readFileSync(path.join(game, 'thu-mua-9.js'), 'utf8'), mCuu = t9.match(/'cuu-nguoi': function[\s\S]*?san: (\[[^\]]*\])[\s\S]*?tramCuu: (\[[^\]]*\])/);
  let ok5 = false, ct5 = '';
  if (mCuu) {
    const san = JSON.parse(mCuu[1].replace(/'/g, '"')), tram = JSON.parse(mCuu[2].replace(/(\w+):/g, '"$1":'));
    ok5 = tram.every((q) => san[q.y] && san[q.y][q.x] !== 'F');
    const XUONG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net'];
    const r = require(path.join(day, 'san-hoc.js')).chay({ san, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: tram }, 'cast_net()\n' + 'wait()\n'.repeat(5));
    ok5 = ok5 && r.thang; ct5 = J({ tram, thang: r.thang });
  }
  kiem("5. ThuMua9 'cuu-nguoi': trạm cứu không nằm trên ô cờ F, lời giải nạp sẵn vẫn thắng (lõi san-hoc)", ok5, ct5 || 'không đọc được màn giả');
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
