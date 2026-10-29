/* kiem-o-so.mjs — "Robot Chấn Hưng": MỌI Ô SỐ TRONG LỜI GIẢI GHÉP ĐƯỢC BẰNG KHỐI (mùa 1, mùa 2 đã mở).
   Máy chấm (cham.js) chấm CODE CHỮ, nên một màn có thể "đạt" mà người chơi không ghép nổi bằng khối: 29/10 (nghiệm thu gói T) phát hiện
   bảng chọn số không có distance() / biến d = distance(), 12 màn mùa 2 (range(distance()), forward(distance() + n), forward(d)…) kẹt.
   Máy này dựng khung chương trình thật (TP.Editor của game/thanh-phan.js trên DOM giả, như kiem-list.mjs), với cảm biến / đối số / kiểu đối số
   của đúng màn (đúng robot ở màn đội; thân hàm như trong Xưởng), rồi với MỖI ô số trong lời giải: ô phải CHẠM ĐƯỢC (.num) và bảng chọn mở ra phải
   CÓ giá trị của lời giải (nút số 1..tối đa, hay chip biến / biểu thức). Dòng danh sách (kiem-list), chuỗi / màu / lực, điều kiện: không xét ở đây.
   Chạy: node hoc/kiem-o-so.mjs [--tat-ca] [--loi-gia]
     --tat-ca: xét cả các mùa chưa mở (chỉ in, không làm đỏ);
     --loi-gia: bỏ distance() khỏi cảm biến của màn (như trước bản sửa): máy phải ĐỎ ở các màn hồng ngoại (tự chứng minh). */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));
const TT = require(path.join(day, 'thu-tu-chuong.js'));
const TAT_CA = process.argv.includes('--tat-ca'), LOI_GIA = process.argv.includes('--loi-gia');

function unesc(s) { return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function khop(el, sel) {                                                   // một phần chọn đơn: tag.a.b[data-x="y"][data-z]
  const tag = /^[a-z]+/.exec(sel);
  if (tag && el.tag !== tag[0]) return false;
  const m = sel.match(/\.[\w-]+|\[[\w-]+(?:="[^"]*")?\]/g) || [];
  return m.every((p) => {
    if (p[0] === '.') return el._cls.has(p.slice(1));
    const a = /\[([\w-]+)(?:="([^"]*)")?\]/.exec(p);
    return a[2] === undefined ? el.attrs[a[1]] !== undefined : el.attrs[a[1]] === a[2];
  });
}
class El {
  constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.handlers = {}; this._cls = new Set(); this.style = {}; this.parentNode = null; this._text = ''; this._html = ''; this.disabled = false; this.scrollTop = 0; this.clientHeight = 400; this.scrollHeight = 300; this.clientWidth = 40; this.scrollWidth = 40; this.offsetHeight = 40; this.offsetWidth = 100; }
  get className() { return [...this._cls].join(' '); }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() {
    const s = this._cls;
    return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), contains: (c) => s.has(c), toggle: (c, f) => { const on = f === undefined ? !s.has(c) : !!f; if (on) s.add(c); else s.delete(c); return on; } };
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c, ref) { c.parentNode = this; const i = this.children.indexOf(ref); if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; }
  get firstChild() { return this.children[0] || null; }
  get nextSibling() { const p = this.parentNode; if (!p) return null; const i = p.children.indexOf(this); return p.children[i + 1] || null; }
  set innerHTML(v) {                                                      // chỉ các <span class=".." data-..>…</span> (kể cả lồng nhau) được dựng lại thành phần tử: đủ cho dòng code
    this.children = []; this._html = String(v); this._text = '';
    const re = /<span class="([^"]*)"((?:\s+[\w-]+="[^"]*")*)>|<\/span>|([^<]+)/g, pila = [this];
    let m;
    while ((m = re.exec(this._html))) {
      const top = pila[pila.length - 1];
      if (m[3] !== undefined) { if (top !== this) top._text += unesc(m[3]); continue; }
      if (m[0] === '</span>') { if (pila.length > 1) pila.pop(); continue; }
      const e = new El('span'); e.className = m[1];
      (m[2].match(/[\w-]+="[^"]*"/g) || []).forEach((a) => { const q = /([\w-]+)="([^"]*)"/.exec(a); e.attrs[q[1]] = unesc(q[2]); });
      e.parentNode = top; top.children.push(e); pila.push(e);
    }
  }
  get innerHTML() { return this._html; }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
  click() { if (this.disabled) return; (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {}, target: this })); }
  contains(el) { for (let n = el; n; n = n.parentNode) if (n === this) return true; return false; }
  closest(sel) { for (let n = this; n; n = n.parentNode) if (n._cls && khop(n, sel)) return n; return null; }
  querySelectorAll(sel) {
    const phan = sel.trim().split(/\s+/), kq = [];
    const di = (n, ngu) => { for (const k of n.children) { const du = ngu < phan.length && khop(k, phan[ngu]); if (du && ngu === phan.length - 1) kq.push(k); di(k, du ? ngu + 1 : ngu); } };
    di(this, 0);
    return kq;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  getBoundingClientRect() { return { left: 50, right: 80, top: 100, bottom: 120, width: 30, height: 20 }; }
}
const stage = new El('div'); stage.id = 'stage'; stage.offsetWidth = 360; stage.offsetHeight = 640; stage.getBoundingClientRect = () => ({ left: 0, top: 0, right: 360, bottom: 640, width: 360, height: 640 });
const doc = {
  addEventListener() {}, createElement: (tag) => new El(tag), createTextNode: (s) => { const e = new El('#text'); e._text = String(s); return e; },
  getElementById: (id) => (id === 'stage' ? stage : null), body: new El('body')
};
const luuGia = { co: {}, daXem(k) { return !!this.co[k]; }, datDaXem(k) { this.co[k] = true; return true; } };
const ctx = vm.createContext({
  console, document: doc, getComputedStyle: () => ({ fontSize: '11px' }), Ve: { ico: () => new El('i'), khoa: () => new El('i') }, SanHoc, KhungCode, ManHoc, Luu: luuGia,
  setTimeout: (f, ms) => { const h = setTimeout(f, ms); if (h && h.unref) h.unref(); return h; }, clearTimeout, addEventListener() {}, removeEventListener() {}
});
ctx.window = ctx;
for (const f of ['chu.js', 'huong-dan.js', 'thanh-phan.js']) vm.runInContext(fs.readFileSync(path.join(day, 'game', f), 'utf8'), ctx, { filename: f });
const TP = ctx.TP;

/* ================================================================= dò từng màn */
const RE_CHUOI = /^"[^"]*"$/;
const muaCua = {};
for (const g of TT.goi) for (const c of g.chuong) muaCua[Array.isArray(c) ? c[0] : c] = g.mua;
const daMo = new Set(TT.mua.filter((x) => !x.an).map((x) => x.ma));

/** Một khung chương trình trên DOM giả cho dãy dòng `dong`, tùy chọn như man-choi.js (chính) / xuong-ham.js (thân hàm). */
function dungEditor(dong, tuyChon) {
  const arr = dong.slice(), host = new El('div');
  const ed = new TP.Editor(host, Object.assign({ tong: 40, dung: 40, lay: () => arr, khiDoi: () => {}, thutLe: () => true }, tuyChon));
  return { ed, arr };
}
/** Chạm ô số k của dòng i; trả { cham: false } nếu không có ô chạm được, hay { cham: true, chon: [giá trị chọn được] }. */
function chamO(E, i, k) {
  const hang = E.ed.hangEl(i), strip = hang && hang.children[1];
  const so = strip && strip.querySelector('.num[data-k="' + k + '"]');
  if (!so) return { cham: false };
  TP.dongChonSo();
  hang.handlers.click[0]({ target: { closest: (s) => (s === '.num' ? so : null) }, pointerType: 'mouse' });
  const bang = stage.children.filter((c) => c._cls.has('chon-so'))[0];
  if (!bang) return { cham: true, chon: null };
  const chon = bang.querySelectorAll('button').map((b) => b.getAttribute('data-bien') || b.getAttribute('data-so')).filter((x) => x !== null);
  TP.dongChonSo();
  return { cham: true, chon };
}

/** Ô kẹt đã biết, CHỜ USER QUYẾT (29/10): bảng chọn số 1–12 (đối số hàm thêm 0) mà lời giải lặp 20 / 30 / 60 lần. In ra mỗi lần chạy, không làm đỏ;
 *  ô kẹt MỚI (khác danh sách) thì đỏ. Khoá: mã màn + giá trị. */
const CHAP_NHAN = {
  'khoang-cach.6 30': 'range(30) lặp đủ lâu: màn có while (có lẽ giải bằng while, chưa kiểm)',
  'me-cung.7 20': 'range(20) lặp đủ lâu: màn có while', 'me-cung.8 60': 'range(60): màn có while', 'me-cung.9 60': 'range(60): màn có while', 'me-cung.10 60': 'range(60): màn có while',
  'hong-ngoai.6 20': 'range(20) có sẵn trong mã mẫu', 'che-hong-ngoai.8 30': 'range(30) lặp đủ lâu: màn có while'
};
const loi = [], loiAn = [], daBiet = [];
let soO = 0, soMan = 0;
for (const m of ManHoc.danhSach) {
  const mua = muaCua[m.chuong];
  if (!mua) continue;                                                          // chương ngân hàng không có trên lộ trình
  const moRoi = daMo.has(mua);
  if (!moRoi && !TAT_CA) continue;
  soMan++;
  const lg = m.loiGiai, kho = ManHoc.khoThamChieu(m).concat(lg.hamCuaEmMoi || []);
  const kieu = TP.taoKieu(() => ({ man: m, hamCuaMan: lg.hamCuaMan || [], kho }));
  const soMax = TP.taoSoToiDa(() => ({ man: m, hamCuaMan: lg.hamCuaMan || [], kho }));
  TP.datCheList(TP.coListCua(m));
  TP.datCheMau(TP.coMauCua(m), TP.coPinCua(m));
  const camCua = (mx) => { const c = TP.camBienCua(mx); return LOI_GIA ? c.filter((n) => n !== 'distance') : c; };
  // các khung cần xét: chính (từng robot ở màn đội) + thân từng hàm người chơi viết / sửa (như trong Xưởng, có đối số)
  const khung = [];
  if (Array.isArray(lg.doi)) lg.doi.forEach((d, i) => { if (!(m.doi[i] || {}).coDinh) { const mx = Object.assign({}, m, m.doi[i]); delete mx.doi; khung.push({ ten: 'R' + (i + 1), dong: d.chinh || [], cam: camCua(mx), ts: [] }); } });
  else if (!m.chinhCoDinh && !m.chiChay) khung.push({ ten: 'main', dong: lg.chinh || [], cam: camCua(m), ts: [] });
  for (const h of (lg.hamCuaEmMoi || []).concat(lg.hamCuaMan || [])) if (!(m.khoaHamMan || []).includes(h.ten)) khung.push({ ten: h.ten + '()', dong: h.than, cam: camCua(m), ts: h.thamSo || [] });
  for (const kh of khung) {
    const E = dungEditor(kh.dong, {
      camBien: () => kh.cam, bienDuoc: () => kh.ts, kieuBien: () => 'so',
      kieuDoiSo: (ten, k) => kieu(ten, k), soToiDa: (ten, k) => soMax(ten, k)
    });
    kh.dong.forEach((dong, i) => {
      const d = TP.tachDoiSo(dong);
      if (!d && /^\s*(?:for\s+\w+\s+in\s+range\(|[A-Za-z_]\w*\()\s*[^)\s]/.test(dong)) {       // lời gọi / range có đối số mà không tách được ô: ô không chạm được (code cũ: range(distance()))
        soO++;
        const noi = m.ma + ' ' + kh.ten + ' dòng ' + (i + 1) + ' `' + dong.trim() + '`';
        (moRoi ? loi : loiAn).push(noi + ': dòng không tách được ô (tachDoiSo null), không chạm đổi được');
        return;
      }
      if (!d || d.cau || !(d.loai === 'range' || d.loai === 'goi')) return;   // danh sách: kiem-list; điều kiện / chuỗi: bảng chọn khác
      d.ds.forEach((v, k) => {
        if (v === '' || RE_CHUOI.test(v)) return;                             // chuỗi / màu / lực: bảng chọn chữ
        if (d.loai === 'goi' && ['don', 'ghep', 'list', 'mau', 'luc'].includes(kieu(d.ten, k))) return;
        soO++;
        const r = chamO(E, i, k), noi = m.ma + ' ' + kh.ten + ' dòng ' + (i + 1) + ' `' + dong.trim() + '` ô "' + v + '"';
        let sai = null;
        if (!r.cham) sai = 'không chạm được (không có ô .num)';
        else if (!r.chon) sai = 'chạm mà không mở bảng chọn số';
        else if (!r.chon.includes(v)) sai = 'bảng chọn không có "' + v + '" (có: ' + r.chon.join(' ') + ')';
        if (sai && CHAP_NHAN[m.ma + ' ' + v]) daBiet.push(noi + ': ' + CHAP_NHAN[m.ma + ' ' + v]);
        else if (sai) (moRoi ? loi : loiAn).push(noi + ': ' + sai);
      });
    });
  }
}
for (const l of daBiet) console.log('· (đã biết, chờ quyết) ' + l);
for (const l of loi) console.log('✗ ' + l);
if (TAT_CA) for (const l of loiAn) console.log('· (mùa chưa mở) ' + l);
const tong = 'trong ' + soO + ' ô số của ' + soMan + ' màn' + (TAT_CA ? ' (cả mùa chưa mở: ' + loiAn.length + ' ô kẹt, chỉ in)' : ' mùa đã mở') + '.';
if (LOI_GIA) {
  const bat = loi.some((l) => /distance/.test(l));
  console.log('Lỗi giả (bỏ distance() khỏi cảm biến của màn): máy ' + (bat ? 'BẮT ĐƯỢC (ĐẠT)' : 'KHÔNG BẮT (HỎNG)'));
  process.exit(bat ? 0 : 1);
}
console.log((loi.length ? 'HỎNG ' : 'ĐẠT ') + loi.length + ' ô số không ghép được bằng khối (+ ' + daBiet.length + ' ô đã biết, chờ quyết) ' + tong);
process.exit(loi.length ? 1 : 0);
