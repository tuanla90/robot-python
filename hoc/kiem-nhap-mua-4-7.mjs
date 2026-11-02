/* ============================================================================
   kiem-nhap-mua-4-7.mjs — máy kiểm NHẬP LIỆU mùa 4–7 (Cảng sông, Bến sông, Nông trại, Mỏ đá): mọi dòng em phải tự lắp trong lời giải mẫu
   phải LẮP ĐƯỢC bằng khay khối + chạm ô, không gõ chữ (soát gốc: hoc/ban-giao/soat-nhap-lieu-mua-4-7.md).
   Mỗi màn: bật cờ như man-choi.js (datCheList / datCheMau / datCheBT), dựng khay thật (Palette trên DOM giả), rồi với từng dòng cần lắp:
   1. DẠNG: khay có khối cùng dạng (cùng lệnh và số đối số, cùng kiểu dòng biểu thức: gán 1 / 2 biến, return, if / elif / while, for…), hay dòng mã mẫu cùng dạng sửa được.
   2. Ô: dòng biểu thức (TP.tachBT) dựng trong khung (Editor thật) đúng chỗ của nó, chạm TỪNG ô: giá trị của lá có trong bảng chọn (số 0–12, tên / nguồn / hàm, chuỗi),
      phép tính có trong bảng (+ - * // %, so sánh, and / or), tên hàm bọc (abs / min / max) hay hàm nguồn có chip, tên biến được gán có chip;
      dòng cách cũ: ô số ≤ 12, chuỗi, biến, điều kiện cảm biến (như soát gốc).
   Thêm vài phép thử cơ chế (tách / in lại / bọc phép / thêm bỏ ô). Chạy: node hoc/kiem-nhap-mua-4-7.mjs [--chi-tiet]   (còn dòng kẹt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { napKhay } from './dom-gia-khay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));
const TT = require(path.join(day, 'thu-tu-chuong.js'));
const K = napKhay({ SanHoc, KhungCode, ManHoc, ThuTuChuong: TT });
const { TP } = K;
const CHI_TIET = process.argv.includes('--chi-tiet');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); } else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);

/* ================================================================= 1. CƠ CHẾ */
console.log('\n== 1. Tách dòng biểu thức, in lại, bọc phép tính ==');
{
  TP.datCheList(false); TP.datCheMau(false, false, false);
  TP.datCheBT(true, { nguon: ['read_code()'], chu: ['"front"'], ten: ['d'], ham: ['round_steps(1)'], cam: ['front_clear'] });
  const dong = ['swing_by(-2)', 'carry_n(n // 2, d1)', 'swing_r((b - a) % 8)', 'for i in range(abs(d)):', 'if d < 0:', 'while read_code() != -1:', 'h, s = flow()',
    'return a + b, b', 'return flow_dir() == "none"', 'forward(3 - flow_power())', 'if not is_calm_front():', 'g = [[2, 2], [3, 1], [2, 1]]', 'slide_r(g[1][0])',
    'if g[1][2] == "F":', 'ink(color("here"))', 'k = read_code() // 10', '    return d * 2'];
  dong.forEach((l) => { const d = TP.tachDoiSo(l); kiem('tách + in lại `' + l + '`', d && d.loai === 'bt' && d.ghep(d.ds) === l, d && d.ghep ? d.ghep(d.ds) : J(d)); });
  kiem('dòng cách cũ giữ nguyên: forward(2), for i in range(3):, if front_clear():, else:', TP.tachDoiSo('forward(2)').loai === 'goi' && TP.tachDoiSo('for i in range(3):').loai === 'range' && TP.tachDoiSo('if front_clear():').loai === 'dk' && !TP.tachDoiSo('else:'));
  kiem('bọc phép tính: −x, // 2, x[0], [x], == 1, abs()', J([TP.phepBT('am', '2'), TP.phepBT('//2', 'n + 1'), TP.phepBT('chi', 'g'), TP.phepBT('ds', '1'), TP.phepBT('ss', 'flow_dir()'), TP.phepBT('abs', 'd')]) === J(['-2', '(n + 1) // 2', 'g[0]', '[1]', 'flow_dir() == 1', 'abs(d)']));
  kiem('bỏ phép tính giữ vế trái; bỏ dấu trừ', TP.tachDoiSo('carry_n(n // 2, d1)').bo(1) === 'carry_n(n, d1)' && TP.tachDoiSo('rail(-1)').bo(0) === 'rail(1)');
  kiem('thêm / bỏ phần tử của danh sách lồng', TP.tachDoiSo('g = [[2, 2], [3, 1]]').them(2) === 'g = [[2, 2, 1], [3, 1]]' && TP.tachDoiSo('g = [[2, 2], [3, 1]]').bo(1) === 'g = [[2], [3, 1]]');
  kiem('thayDoiSo trên dòng biểu thức: đổi op, đổi lá thành biểu thức', TP.thayDoiSo('if d < 0:', 1, '>=') === 'if d >= 0:' && TP.thayDoiSo('rail(1)', 0, '-1') === 'rail(-1)' && TP.thayDoiSo('n = 1', 1, 'read_code() % 2') === 'n = read_code() % 2');
  const h = TP.mauDong('ink(color("here"))');
  kiem('vẽ: tên hàm bọc là ô (chỉ tên), chuỗi bên trong là ô chuỗi', /data-bt="ham"[^>]*>color</.test(h) && /data-chuoi="here"/.test(h), h);
  TP.datCheBT(false);
  kiem('TẮT chế độ biểu thức: rail(-1) tách kiểu cũ', TP.tachDoiSo('rail(-1)').loai === 'goi');
}

/* ================================================================= 2. KHUNG: chạm ô */
console.log('\n== 2. Khung chương trình: chạm ô của dòng biểu thức ==');
{
  TP.datCheBT(true, { nguon: ['read_code()'], chu: [], ten: ['d', 'k'], ham: [], cam: [] });
  const E = K.dungEditor(['d = read_code()', 'rail(-d)', 'if d < 0:', '    swing_l(abs(d))']);
  const nutCo = (sel) => !!E.nut(sel);
  E.cham(1, '.num[data-k="1"]');
  kiem('chạm d trong rail(-d): bảng có số 0–12, chip d và read_code(), nút phép tính', nutCo('[data-so="0"]') && nutCo('[data-so="12"]') && nutCo('[data-bien="d"]') && nutCo('[data-bien="read_code()"]') && nutCo('[data-phep="//2"]'));
  E.nut('[data-phep="%2"]').click();
  kiem('bấm % 2 → rail(-(d % 2))', E.arr[1] === 'rail(-(d % 2))', E.arr[1]);
  E.cham(2, '.num[data-k="1"]');
  kiem('chạm < trong if d < 0: → bảng phép so sánh', nutCo('[data-op="=="]') && nutCo('[data-op=">="]'));
  E.nut('[data-op="!="]').click();
  kiem('chọn != → if d != 0:', E.arr[2] === 'if d != 0:', E.arr[2]);
  E.cham(3, '.num[data-k="0"]');
  kiem('chạm abs trong swing_l(abs(d)) → có nút bỏ phép tính', nutCo('[data-nut="bt-bo"]'));
  E.nut('[data-nut="bt-bo"]').click();
  kiem('bỏ → swing_l(d) (giữ thụt lề)', E.arr[3] === '    swing_l(d)', E.arr[3]);
  E.cham(0, '.num[data-k="0"]');
  kiem('chạm tên d của d = read_code() → chip tên biến (k)', nutCo('[data-bien="k"]'));
  E.nut('[data-bien="k"]').click();
  kiem('đổi tên → k = read_code()', E.arr[0] === 'k = read_code()', E.arr[0]);
  E.dongBang();
  const E2 = K.dungEditor(['k = read_code()', '']);
  E2.ed.chenTai('if n == 1:', 1, 0);
  kiem('chèn khối if n == 1: dưới k = … → n đổi thành k', E2.arr[1] === 'if k == 1:', J(E2.arr));
  const E3 = K.dungEditor(['rail(1)']);
  E3.cham(0, '.num');
  kiem('ô số cách cũ (rail(1)) ở chế độ biểu thức: bảng có nút −x', !!E3.nut('[data-phep="am"]'));
  E3.nut('[data-phep="am"]').click();
  kiem('−x → rail(-1), dòng chuyển sang ô biểu thức', E3.arr[0] === 'rail(-1)' && TP.tachDoiSo('rail(-1)').loai === 'bt', E3.arr[0]);
  E3.dongBang();
  TP.datCheBT(false);
}

/* ================================================================= 3. MỌI MÀN MÙA 4–7 */
console.log('\n== 3. Mọi màn mùa 4–7: dòng lời giải lắp được bằng khay + chạm ==');
const RE_SO = /^\d+$/, RE_BIEN = /^[A-Za-z_]\w*$/, RE_CHUOI = /^"[^"]*"$/, RE_BTH = /^(\d+|[A-Za-z_]\w*)\s*[-+]\s*(\d+|[A-Za-z_]\w*)$/;
const RE_PTU = /^[A-Za-z_]\w*\[(?:\d+|[A-Za-z_]\w*)\]$/, RE_LEN = /^len\([A-Za-z_]\w*\)$/, RE_DO = /^distance\(\)(?:\s*[-+]\s*(?:\d+|[A-Za-z_]\w*))?$/;
const RE_DKC = /^(?:not\s+)?[A-Za-z_]\w*\(\)$|^(?:True|False)$/;
const boThut = (s) => String(s).replace(/^[ \t]+/, '');
const boCT = (s) => { let nhay = false; for (let i = 0; i < s.length; i++) { if (s[i] === '"') nhay = !nhay; else if (s[i] === '#' && !nhay) return s.slice(0, i).trim(); } return s.trim(); };      // # trong chuỗi ("#" là ô tường của radar) không phải chú thích
/** Khoá DẠNG của một dòng: chèn khối cùng khoá rồi chạm ô là ra dòng. */
function dang(dong) {
  const d = TP.tachDoiSo(dong);
  if (!d) return { khoa: 'nguyen:' + dong, d: null };
  const kw = (/^\s*(\w+)/.exec(d.tien || '') || [])[1] || '';
  if (d.loai === 'bt') {
    const k = d.kieu === 'gan' ? 'gan/' + d.dich.length + '/' + d.e.length : d.kieu === 'tra' ? 'tra/' + d.e.length : d.kieu === 'dk' ? 'dk/' + d.kw : d.kieu === 'goi' ? 'goi/' + d.ten + '/' + d.e.length : d.kieu;
    return { khoa: k, d };
  }
  switch (d.loai) {
    case 'goi': return { khoa: 'goi/' + d.ten + '/' + d.ds.length + (d.tien.indexOf('=') >= 0 ? '=' + d.tien.split('=')[0].trim() : ''), d };
    case 'range': return { khoa: 'forR', d };
    case 'forChuoi': return { khoa: 'forChuoi', d };
    case 'if': return { khoa: 'dk/' + kw, d };
    case 'dk': return { khoa: 'dkcu/' + kw, d };
    case 'dkm': return { khoa: 'dkm/' + kw, d };
    case 'goiList': return { khoa: 'goi/' + d.ten + '/' + d.cau.length, d };
    case 'forList': return { khoa: 'forIn', d };
    case 'forLit': return { khoa: 'forLit', d };
    case 'themList': return { khoa: 'them', d };                                // a.append(1) cách cũ: chạm số mở bảng biểu thức (có tên biến) → a.append(c)
    default: return { khoa: d.loai, d };
  }
}
function oDuoc(v, loai) {
  if (loai === 'dk') return RE_DKC.test(v);
  if (RE_SO.test(v)) return +v <= 12;
  return RE_CHUOI.test(v) || RE_BIEN.test(v) || RE_BTH.test(v) || RE_PTU.test(v) || RE_LEN.test(v) || RE_DO.test(v);
}
/** Dòng cách cũ: các ô chạm đổi được tới giá trị trong dòng (như soát gốc). */
function kiemCu(d, LIST_CHU) {
  if (d.loai === 'dkm') return null;
  if (d.cau) {
    const xau = d.ds.filter((v, k) => {
      const c = d.cau.find((x) => k >= x.tu && k < x.den);
      if (!c || !c.lit) return RE_BIEN.test(v) ? (d.loai === 'themList' && k > 0 && LIST_CHU) : !(RE_SO.test(v) || RE_CHUOI.test(v) || RE_PTU.test(v) || RE_LEN.test(v));
      return !RE_SO.test(v) && !RE_CHUOI.test(v);
    });
    return xau.length ? 'ô không chạm đổi được: ' + xau.join(' | ') : null;
  }
  for (const v of d.ds) if (!oDuoc(v, d.loai)) return 'ô không chạm đổi được: ' + v;
  return null;
}
/** Dòng biểu thức: dựng khung với các dòng của nơi đó, chạm từng ô ở dòng i, xem bảng chọn có giá trị. */
function kiemBT(dongNoi, i, thamSo) {
  const n = Math.max(10, dongNoi.length), E = K.dungEditor(dongNoi.map(String), { tong: n, dung: n, bienDuoc: () => thamSo || [], camBien: () => [] });
  const d = TP.tachDoiSo(E.arr[i]), loi = [];
  const nutDs = () => { const b = E.bang(); return b ? b.querySelectorAll('button') : []; };
  for (let k = 0; k < d.ds.length; k++) {
    const vai = d.vt[k], v = d.ds[k];
    if (vai === 'them') continue;
    E.cham(i, '.num[data-k="' + k + '"]');
    const ns = nutDs(), co = (a, x) => ns.some((b) => b.getAttribute(a) === String(x));
    let ok;
    if (vai === 'la') ok = (RE_SO.test(v) && +v <= 12 && co('data-so', v)) || co('data-bien', v) || co('data-chuoi', v);
    else if (vai === 'ham') { const f = d.o[k].nut.f; ok = (/^(abs|min|max)$/.test(f) && co('data-phep', f)) || ns.some((b) => (b.getAttribute('data-bien') || '').indexOf(f + '(') === 0); }
    else if (vai === 'op' || vai === 'ss' || vai === 'noi') ok = co('data-op', v);
    else if (vai === 'dich') ok = co('data-bien', v);
    else ok = true;                                                                // dấu trừ / not: bọc từ bảng của lá (nút −x / not)
    if (!ok) loi.push(vai + ' ' + v);
    E.dongBang();
  }
  const canPhep = [];
  (function di(n) {
    if (!n) return;
    if (n.t === 'am') canPhep.push('am'); if (n.t === 'chi') canPhep.push('chi'); if (n.t === 'ds') canPhep.push('ds'); if (n.t === 'not' && d.kieu !== 'dk') canPhep.push('not');
    ['l', 'r', 'a', 'o', 'i'].forEach((x) => { if (n[x] && typeof n[x] === 'object' && !Array.isArray(n[x])) di(n[x]); });
    (n.a && Array.isArray(n.a) ? n.a : []).concat(n.e || []).forEach(di);
  })({ e: d.e });
  if (canPhep.includes('not')) loi.push('not ngoài if / while');
  return loi.length ? 'ô không chọn được: ' + loi.join(' | ') : null;
}

const H = (f) => ({ ten: f.ten, thamSo: (f.thamSo || []).slice(), than: (f.than || []).slice() });
function gachCua(n, kq) { for (const c of n.children) { if (c._cls.has('brick')) kq.push(c.getAttribute('data-goi')); gachCua(c, kq); } return kq; }
function khoiMau(spec) {
  const k = K.khayMoi(); k.pal.dung(spec);
  const kq = new Set();
  for (const the of k.pal.dsThe()) { k.pal.chonThe(the); gachCua(k.host, []).forEach((g) => kq.add(g)); }
  gachCua(k.host.parentNode, []).forEach((g) => kq.add(g));                      // hàng ghim wait()
  return [...kq];
}
const ketQua = [];
for (const mu of ['mua-4', 'mua-5', 'mua-6', 'mua-7']) {
  let nMan = 0, nKet = 0;
  for (const g of TT.goi.filter((x) => x.mua === mu)) for (const ch of g.chuong) for (const m of ManHoc.danhSach.filter((x) => x.chuong === ch)) {
    nMan++;
    const lg = m.loiGiai || {}, mm = m.maMau || {};
    const kho = ManHoc.khoThamChieu(m).map(H);
    (lg.hamCuaEmMoi || []).forEach((f) => { const i = kho.findIndex((x) => x.ten === f.ten); if (i >= 0) kho[i] = H(f); else kho.push(H(f)); });
    const hamMan = (lg.hamCuaMan || mm.hamCuaMan || []).map(H);
    TP.datCheTD(false);
    TP.datCheList(TP.coListCua(m));
    TP.datCheMau(TP.coMauCua(m), TP.coPinCua(m), m.vaHoac === true);
    TP.datCheBT(TP.coBTCua(m), TP.nguonBTCua(m, kho.concat(hamMan)));
    // màn nhiều robot: khay của xe đang chọn (man-choi.js manCuaXe); hàm thuộc robot có chương trình chính gọi nó
    const xe = m.doi ? m.doi.map((r, k) => { const o = Object.assign({}, m, r); delete o.doi; return o; }) : [m];
    const chinhXe = (b, k) => (m.doi ? (((b || {}).doi || [])[k] || {}).chinh : (b || {}).chinh) || [];
    const xeCuaHam = (ten) => { const re = new RegExp('\\b' + ten + '\\('); const k = xe.findIndex((_, j) => chinhXe(lg, j).some((s) => re.test(s))); return k < 0 ? 0 : k; };
    const can = [], du = {};
    const truMau = (ds, co, noi, khoa, ts, k) => {
      const con = (co || []).map((x) => boCT(boThut(x)));
      (ds || []).forEach((x, i) => { const t = boCT(boThut(x)); if (!t) return; const j = con.indexOf(t); if (j >= 0) con.splice(j, 1); else can.push({ noi, dong: x, i, ds, ts, xe: k }); });
      du[noi] = new Set(khoa ? [] : con.filter(Boolean).map((x) => dang(x).khoa));
    };
    xe.forEach((_, k) => truMau(chinhXe(lg, k), chinhXe(mm, k), 'chinh' + k, !!(m.chinhCoDinh || m.chiChay), [], k));
    const khoTruoc = ManHoc.khoThamChieu(m);
    for (const f of lg.hamCuaEmMoi || []) { const cu = (mm.hamCuaEmMoi || []).find((x) => x.ten === f.ten) || khoTruoc.find((x) => x.ten === f.ten); truMau(f.than, cu ? cu.than : [], 'em:' + f.ten, false, f.thamSo, xeCuaHam(f.ten)); }
    for (const f of lg.hamCuaMan || []) { const cu = (mm.hamCuaMan || []).find((x) => x.ten === f.ten); truMau(f.than, cu ? cu.than : [], 'man:' + f.ten, false, f.thamSo, xeCuaHam(f.ten)); }
    if (!can.length) continue;
    const tatCa = [].concat(lg.chinh || [], ...((lg.doi || []).map((r) => r.chinh || [])), ...(lg.hamCuaEmMoi || []).map((f) => f.than), ...(lg.hamCuaMan || []).map((f) => f.than)).join(' ');
    const LIST_CHU = !!TP.coMauCua(m) || /\[\s*"/.test(tatCa);
    const khay = xe.map((mx) => {
      const spec = {
        goc: mx.hamGoc, loai: mx.loaiRobot, vong: TP.coCauTruc(mx, 'for'), vongWhile: TP.coCauTruc(mx, 'while') && TP.coDieuKienCua(mx), cam: TP.camBienCua(mx), mau: TP.coMauCua(mx), pin: TP.coPinCua(mx),
        bienDem: !!mx.bienDem, list: TP.coListCua(mx), dict: false, set: false, am: [],
        chuoi: TP.coCauTruc(mx, 'for') && TP.coMauCua(mx) !== 'look' && (!!mx.chuoi || (mx.hamGoc || []).some((n) => /^go_/.test(n))),
        dieuKien: TP.coCauTruc(mx, 'if') && TP.coDieuKienCua(mx), bt: TP.khayBTCua(mx),
        em: (mx.moXuong !== false && !mx.camHamCuaEm) ? TP.locHamTheoRobot(mx, kho) : null, man: hamMan, coNutMoi: true, lamMoi: true
      };
      let mauDs = [];
      try { mauDs = khoiMau(spec); } catch (e) { console.log('  khay lỗi ' + m.ma + ': ' + e.message); }
      return { mau: new Set(mauDs.map(boCT)), dang: new Set(mauDs.map((x) => dang(boCT(x)).khoa)) };
    });
    const ket = [];
    for (const c of can) {
      const s = boCT(boThut(c.dong)), kh = khay[c.xe];
      if (kh.mau.has(s)) continue;
      const { khoa, d } = dang(s);
      let ly = null;
      if (!d) ly = 'không tách được thành ô';
      else if (!kh.dang.has(khoa) && !(du[c.noi] || new Set()).has(khoa)) ly = 'khay không có khối dạng ' + khoa;
      else ly = d.loai === 'bt' ? kiemBT(c.ds, c.i, c.ts) : kiemCu(d, LIST_CHU);
      if (ly) ket.push({ noi: c.noi, dong: s, ly });
    }
    TP.datCheBT(false);
    if (ket.length) { nKet++; ketQua.push({ mua: mu, ma: m.ma, ket }); }
  }
  kiem(mu + ': ' + nMan + ' màn, không màn nào có dòng lời giải không lắp được', nKet === 0, nKet + ' màn kẹt');
}
if (ketQua.length) {
  const nhom = {};
  ketQua.forEach((x) => x.ket.forEach((k) => { const key = k.ly.replace(/: .*/, ': ') + (k.ly.match(/dạng (\S+)/) || k.ly.match(/: (.*)/) || ['', ''])[1].replace(/\d+/g, '#').slice(0, 60); (nhom[key] = nhom[key] || []).push(x.ma + ' `' + k.dong + '`'); }));
  Object.entries(nhom).sort((a, b) => b[1].length - a[1].length).forEach(([k, v]) => console.log('    ' + v.length + ' × ' + k + '   vd: ' + v.slice(0, CHI_TIET ? 99 : 3).join(' · ')));
}
console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT cả ' + dat) + ' phép kiểm nhập liệu mùa 4–7');
process.exit(hong ? 1 : 0);
