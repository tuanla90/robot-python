/* ============================================================================
   do-meo-dien-so.cjs — BỘ DÒ "MẸO ĐIỀN THẲNG SỐ" (13/11).
   Câu hỏi: ở màn mà lời giải ĐỌC dữ liệu viết sẵn trong code (list, list lồng, tuple, dict, set), người chơi có qua màn được
   bằng cách bỏ hẳn dữ liệu và điền thẳng số không?
   Cách dò: chạy thử chương trình chính của lời giải bằng một máy thông dịch nhỏ (đủ cho phần Python các màn dùng), ghi lại
   mọi lời gọi hàm kèm đối số ĐÃ TÍNH RA SỐ → được một chương trình "phẳng" không còn dữ liệu, vòng lặp hay phép đọc nào.
   Rồi chấm chương trình phẳng đó bằng máy chấm thật (ChamHoc.cham). Thắng = màn lách được.
   Không dò: màn nhiều robot, màn khoá chương trình chính, màn có while / cảm biến trả giá trị (dữ liệu đến từ sân).
   Chạy: node hoc/do-meo-dien-so.cjs            (in bảng theo gói)
         node hoc/do-meo-dien-so.cjs --chi-tiet (in cả chương trình phẳng của màn lách được)
   ========================================================================== */
const path = require('path');
const ManHoc = require(path.join(__dirname, 'lo-trinh-hoc.js'));
const ChamHoc = require(path.join(__dirname, 'cham.js'));
const CHI_TIET = process.argv.includes('--chi-tiet');

class PySet { constructor(a) { this.v = []; (a || []).forEach((x) => this.add(x)); } add(x) { if (!this.v.some((y) => y === x)) this.v.push(x); } }
class Dung extends Error {}
const CAM_BIEN = ['listen', 'hear', 'read_code', 'weight', 'flow', 'flow_dir', 'radar', 'shape', 'color', 'look', 'distance', 'battery',
  'front_clear', 'left_clear', 'right_clear', 'back_clear', 'on_flag', 'holding', 'sense', 'magnet', 'heat', 'temp'];
const SAN = ['has', 'len', 'min', 'max', 'iter', 'abs', 'PySet', 'C', 'Math', 'Number', 'String', 'true', 'false', 'null', 'new', 'if', 'for', 'else', 'let', 'const', 'of', 'return', 'function'];

function toPy(v) {
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return '"' + v + '"';
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (v instanceof PySet) return v.v.length ? '{' + v.v.map(toPy).join(', ') + '}' : 'set()';
  if (Array.isArray(v)) return '[' + v.map(toPy).join(', ') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).map((k) => (/^\d+$/.test(k) ? k : '"' + k + '"') + ': ' + toPy(v[k])).join(', ') + '}';
  throw new Dung('gia-tri-la');
}
const donGian = (v) => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean';
const rt = {
  PySet,
  has: (b, a) => (b instanceof PySet ? b.v.includes(a) : Array.isArray(b) ? b.includes(a) : typeof b === 'string' ? b.includes(a) : Object.prototype.hasOwnProperty.call(b, String(a))),
  len: (x) => (x instanceof PySet ? x.v.length : Array.isArray(x) || typeof x === 'string' ? x.length : Object.keys(x).length),
  iter: (x) => (x instanceof PySet ? x.v.slice() : Array.isArray(x) ? x : typeof x === 'string' ? x.split('') : Object.keys(x).map((k) => (/^\d+$/.test(k) ? +k : k))),
  cmp: (a, b) => { if (Array.isArray(a)) { for (let i = 0; i < Math.min(a.length, b.length); i++) { const c = rt.cmp(a[i], b[i]); if (c) return c; } return a.length - b.length; } return a < b ? -1 : a > b ? 1 : 0; },
  min: (...a) => { const l = a.length === 1 ? rt.iter(a[0]) : a; return l.reduce((m, x) => (rt.cmp(x, m) < 0 ? x : m)); },
  max: (...a) => { const l = a.length === 1 ? rt.iter(a[0]) : a; return l.reduce((m, x) => (rt.cmp(x, m) > 0 ? x : m)); },
  abs: Math.abs
};

/** Biểu thức Python (phần các màn dùng) → JS. */
function bt(e) {
  if (/\/\/|\*\*|lambda|\bis\b/.test(e)) throw new Dung('phep-la');
  const chu = []; e = e.replace(/"[^"]*"/g, (m) => { chu.push(m); return '\u0001' + (chu.length - 1) + '\u0001'; });   // cất chuỗi
  e = e.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null').replace(/\bset\(\)/g, 'new PySet([])');
  for (let cu = null; cu !== e;) { cu = e; e = e.replace(/(^|[^\w\]\)\u0001])\(([^()]*,[^()]*)\)/, '$1[$2]'); }     // (2, 3) → [2, 3]
  e = e.replace(/\{([^{}:]*)\}/g, (m, a) => (a.trim() === '' ? '({})' : 'new PySet([' + a + '])'));
  e = e.replace(/\{([^{}]*:[^{}]*)\}/g, '({$1})');
  const TU = '[\\w\\.\\[\\]\\u0001]+';
  e = e.replace(new RegExp('(' + TU + ')\\s+not\\s+in\\s+(' + TU + ')', 'g'), '!has($2,$1)').replace(new RegExp('(' + TU + ')\\s+in\\s+(' + TU + ')', 'g'), 'has($2,$1)');
  e = e.replace(/\bnot\b/g, '!').replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\.append\(/g, '.push(').replace(/\.add\(/g, '.add(');
  e = e.replace(/(?<![\w.])([A-Za-z_]\w*)\(/g, (m, ten) => (SAN.includes(ten) ? m : 'C("' + ten + '")('));
  return e.replace(/\u0001(\d+)\u0001/g, (m, i) => chu[+i]);
}
/** Các dòng Python → thân hàm JS (khai let cho mọi tên được gán, trừ tham số). */
function dich(dong, thamSo) {
  const ra = [], mo = [], ten = new Set();
  dong.forEach((raw) => {
    const s = String(raw).replace(/\s+#.*$/, ''); if (!s.trim()) return;
    const lui = /^\s*/.exec(s)[0].length, t = s.trim(); let m;
    while (mo.length && mo[mo.length - 1] >= lui) { mo.pop(); ra.push('}'); }
    if (/^while\b/.test(t)) throw new Dung('while');
    if ((m = /^for\s+(\w+)\s+in\s+range\((.+)\)\s*:$/.exec(t))) { const a = m[2].split(','); ra.push('for (let ' + m[1] + ' = ' + (a.length > 1 ? bt(a[0]) : '0') + '; ' + m[1] + ' < (' + bt(a[a.length > 1 ? 1 : 0]) + '); ' + m[1] + '++) {'); mo.push(lui); return; }
    if ((m = /^for\s+(\w+)\s+in\s+(.+?)\s*:$/.exec(t))) { ra.push('for (const ' + m[1] + ' of iter(' + bt(m[2]) + ')) {'); mo.push(lui); return; }
    if ((m = /^if\s+(.+?)\s*:$/.exec(t))) { ra.push('if (' + bt(m[1]) + ') {'); mo.push(lui); return; }
    if ((m = /^elif\s+(.+?)\s*:$/.exec(t))) { ra.push('else if (' + bt(m[1]) + ') {'); mo.push(lui); return; }
    if (/^else\s*:$/.test(t)) { ra.push('else {'); mo.push(lui); return; }
    if ((m = /^return\b\s*(.*)$/.exec(t))) { ra.push('return ' + (m[1] ? bt(m[1].includes(',') && !/^[\[(]/.test(m[1]) ? '(' + m[1] + ')' : m[1]) : '') + ';'); return; }
    if (/^(pass|break|continue)$/.test(t)) { if (t !== 'pass') ra.push(t + ';'); return; }
    if ((m = /^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*=(?!=)\s*(.+)$/.exec(t))) {
      const ds = m[1].split(',').map((x) => x.trim()); ds.forEach((x) => ten.add(x));
      ra.push((ds.length > 1 ? '[' + ds.join(', ') + ']' : ds[0]) + ' = ' + bt(m[2].includes(',') && !/^[\[({]/.test(m[2]) && !/^\w+\(/.test(m[2]) ? '(' + m[2] + ')' : m[2]) + ';'); return;
    }
    ra.push(bt(t) + ';');
  });
  while (mo.length) { mo.pop(); ra.push('}'); }
  const khai = [...ten].filter((x) => !(thamSo || []).includes(x));
  return (khai.length ? 'let ' + khai.join(', ') + ';\n' : '') + ra.join('\n');
}

/** Chạy chương trình chính của `bai` trên kho `kho`; trả các dòng lời gọi phẳng (đối số đã tính). */
function lamPhang(bai, kho, hamGoc) {
  const vet = [], ham = {}; let sau = 0;
  kho.concat(bai.hamCuaMan || []).forEach((h) => { ham[h.ten] = h; });
  const daDich = {};
  function goi(ten) {
    if (CAM_BIEN.includes(ten)) throw new Dung('cam-bien');
    const h = ham[ten];
    return function (...a) {
      const coTra = h && (h.than || []).some((x) => /^\s*return\b/.test(x));
      if (!h || (!coTra && a.every(donGian))) {                                   // lệnh gốc, hay hàm không trả về nhận toàn số: ghi lại nguyên lời gọi
        if (!h && !(hamGoc || []).includes(ten) && ten !== 'wait') throw new Dung('ham-la:' + ten);
        if (!a.every(donGian)) throw new Dung('lenh-goc-nhan-du-lieu');
        vet.push(ten + '(' + a.map(toPy).join(', ') + ')'); if (vet.length > 400) throw new Dung('qua-dai'); return undefined;
      }
      if (++sau > 30) throw new Dung('de-quy');                                   // hàm trả về, hay hàm nhận dữ liệu: đi vào trong
      if (!daDich[ten]) daDich[ten] = new Function('C', 'has', 'len', 'min', 'max', 'iter', 'abs', 'PySet', ...(h.thamSo || []), dich(h.than || [], h.thamSo || []));
      const kq = daDich[ten](goi, rt.has, rt.len, rt.min, rt.max, rt.iter, rt.abs, PySet, ...a); sau--; return kq;
    };
  }
  new Function('C', 'has', 'len', 'min', 'max', 'iter', 'abs', 'PySet', dich(bai.chinh || [], []))(goi, rt.has, rt.len, rt.min, rt.max, rt.iter, rt.abs, PySet);
  return vet;
}

const RE_DU_LIEU = /=\s*(\[|\(|\{|set\(\))|\(\s*\[|\bin\s+\[/;
const khoCua = (m) => { const moi = (m.loiGiai && m.loiGiai.hamCuaEmMoi) || []; return ManHoc.khoThamChieu(m).filter((h) => !moi.some((x) => x.ten === h.ten)).concat(moi); };
const kq = { lach: [], daiQua: [], chan: [], boQua: {} };
let xet = 0;
ManHoc.danhSach.forEach((m) => {
  const bai = m.loiGiai; if (!bai || m.doi || !Array.isArray(bai.chinh)) return;
  if (!bai.chinh.some((s) => RE_DU_LIEU.test(String(s)))) return;                 // lời giải không có dữ liệu viết sẵn trong chương trình chính
  xet++;
  const bo = (ly) => { (kq.boQua[ly] = kq.boQua[ly] || []).push(m.id); };
  if (m.chinhCoDinh) return bo('khoá chương trình chính');
  let phang;
  try { phang = lamPhang(bai, khoCua(m), m.hamGoc); } catch (e) { return bo(e instanceof Dung ? e.message.replace(/:.*/, '') : 'không đọc được: ' + String(e.message).slice(0, 40)); }
  if (!phang.length) return bo('không có lời gọi');
  const k = ChamHoc.cham(m, { chinh: phang, hamCuaMan: bai.hamCuaMan || [] }, khoCua(m));
  const ma = (k.chanDoan || []).map((c) => c.ma);
  const muc = { id: m.id, ma: m.ma, ten: m.ten, sao: k.sao, soDong: phang.length, phang, san: Array.isArray(m.san[0]) ? m.san.length : 1, duLieuSan: !!m.duLieuSan, loi: ma };
  if (k.thang) kq.lach.push(muc);
  else if (ma.includes('tran-khung')) kq.daiQua.push(muc);
  else kq.chan.push(muc);
});

const goi = (id) => String(id).split('.')[0];
function theoGoi(ds) { const o = {}; ds.forEach((x) => { (o[goi(x.id)] = o[goi(x.id)] || []).push(x); }); return o; }
console.log('Màn có dữ liệu viết sẵn trong lời giải: ' + xet);
console.log('\n== LÁCH ĐƯỢC: bỏ hết dữ liệu, điền thẳng số vẫn thắng (' + kq.lach.length + ' màn) ==');
Object.entries(theoGoi(kq.lach)).forEach(([g, ds]) => {
  console.log('  gói ' + g + ' (' + ds[0].ma.split('.')[0] + '): ' + ds.map((x) => x.id + '[' + x.sao + '★,' + x.soDong + ' dòng]').join(' '));
  if (CHI_TIET) ds.forEach((x) => console.log('      ' + x.id + ' ' + x.ten + ': ' + x.phang.join(' ; ')));
});
console.log('\n== CHỈ BỊ CHẶN VÌ DÀI QUÁ KHUNG (' + kq.daiQua.length + ' màn): ' + kq.daiQua.map((x) => x.id + '[' + x.soDong + ']').join(' '));
console.log('\n== ĐÃ CHẶN: chương trình phẳng thua (' + kq.chan.length + ' màn): ' + kq.chan.map((x) => x.id + (x.duLieuSan ? '(dữ liệu theo sân)' : x.san > 1 ? '(' + x.san + ' sân)' : '') + '{' + x.loi.slice(0, 2).join(',') + '}').join(' '));
console.log('\n== KHÔNG DÒ ==');
Object.entries(kq.boQua).forEach(([ly, ds]) => console.log('  ' + ly + ' (' + ds.length + '): ' + ds.slice(0, 40).join(' ') + (ds.length > 40 ? ' …' : '')));
if (process.argv.includes('--xem')) {
  const ds = process.argv.slice(process.argv.indexOf('--xem') + 1);
  ds.forEach((ma) => { const x = kq.lach.concat(kq.daiQua, kq.chan).find((y) => y.ma === ma || y.id === ma); console.log('\n' + ma + ': ' + (x ? x.phang.join(' ; ') + '  → ' + (kq.lach.includes(x) ? 'LÁCH ĐƯỢC' : x.loi.join(',')) : 'không có trong ba nhóm')); });
}
