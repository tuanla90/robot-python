/* ============================================================================
   kiem-lon-nhat.mjs — máy kiểm TÌM LỚN NHẤT / NHỎ NHẤT THEO HÀNG NGANG (mùa 4 Cảng sông, hoc/KE-HOACH-GHEP-NHIP.md mục 3f).
   Sân "dãy ngang": một dãy ô bãi song song ray, mỗi ô MỘT container. Cẩu quét qua từng ô, giữ BIẾN KỶ LỤC (read_code() hay weight()),
   rồi mang container kỷ lục đi. Trẻ tự viết vòng quét (biến + if): không max() / min() / list (bài mùa 5, 6). Không sửa lõi.
     1. Lõi có sẵn đủ cho bài: ô trống read_code() = -1, weight() = 0; một lời giải quét thắng MỌI bộ số ngẫu nhiên (chấm theo kỷ lục, không theo dãy lệnh).
     2. MÀN (đi qua hoc/lo-trinh-hoc.js): đủ các màn khai ở DS_MAN; lời giải thắng mọi sân; màn ép nhiều sân, mỗi sân một bộ số, ô kỷ lục khác chỗ;
        lời giải không dùng max / min / list, có if giữ kỷ lục; mọi loiSai không thắng và ra đúng mã.
     3. "Làm theo sân 1": dãy lệnh cố định chạy thẳng tới ô kỷ lục của sân 1 THẮNG sân 1 một mình mà THUA cả màn.
     4. "Quên cập nhật kỷ lục": đổi tên biến ở dòng ghi kỷ lục (lon = c → m = c) → thua.
   Chạy: node hoc/kiem-lon-nhat.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-lon-nhat.mjs --pha      (nộp lời giải quên cập nhật kỷ lục làm "lời giải" của màn ép đầu tiên → phải in HỎNG và thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const LoTrinh = require(path.join(day, 'lo-trinh-hoc.js'));
const PHA = process.argv.includes('--pha');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const clone = (x) => JSON.parse(JSON.stringify(x));

// mã · việc tìm · màn ép (không khoá) phải ≥ bao nhiêu sân
const DS_MAN = [
  { ma: 'can-tai.8', viec: 'lon' },
  { ma: 'can-tai.9', viec: 'lon', san: 3 },
  { ma: 'che-can-tai.8', viec: 'nang', san: 3 }
];

console.log('\n== 1. Lõi: ô trống, quét thắng mọi bộ số ==');
{
  const CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail'];
  const SAN = ['~~~~~~~', '~~~~~~~', '~DDDDD~', 'RRRRRR.', 'DDDDDD.', '.......', '.......'];
  const cfg = (ds, kieu) => {
    let k = 0;
    ds.forEach((p, i) => { if ((kieu === 'nang' ? p[1] > ds[k][1] : kieu === 'nho' ? p[0] < ds[k][0] : p[0] > ds[k][0])) k = i; });
    const chong = ds.map((p, i) => ({ x: i + 1, y: 4, so: i === k ? [] : [p[0]] }));
    chong.push({ x: k + 1, y: 2, so: [ds[k][0]] });
    return { loaiRobot: 'cau', canGatDoi: true, hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], san: SAN, batDau: { x: 0, y: 3, nac: 2, tam: 1 }, taiToiDa: 4,
      chong: ds.map((p, i) => ({ x: i + 1, y: 4, cont: [{ so: p[0], tan: p[1] }] })), nhipToiDa: 200, mucTieu: 'bong-mo', bongMo: { x: k + 1, y: 3, chong } };
  };
  const GIAO = 'pick_up()\nswing_left()\nswing_left()\nset_down()\n';
  const LON = 'lon = -1\nfor i in range(5):\n    rail(1)\n    c = read_code()\n    if c > lon:\n        lon = c\nwhile read_code() != lon:\n    rail(-1)\n' + GIAO;
  const NHO = 'nho = 100\nfor i in range(5):\n    rail(1)\n    c = read_code()\n    if c < nho:\n        nho = c\nwhile read_code() != nho:\n    rail(-1)\n' + GIAO;
  const NANG = 'nang = 0\nfor i in range(5):\n    rail(1)\n    w = weight()\n    if w > nang:\n        nang = w\nwhile weight() != nang:\n    rail(-1)\n' + GIAO;
  const r0 = SanHoc.chay(cfg([[5, 1], [9, 2], [3, 3], [7, 4], [1, 1]], 'lon'), 'a = read_code()\nb = weight()\nif a == -1:\n    if b == 0:\n        rail(1)\n');
  kiem('bệ ở đầu ray (0, 3): đầu cần (0, 4) trống → read_code() = -1, weight() = 0 (bệ mới chạy sang x = 1)', r0.dau && r0.dau.x === 1 && r0.dau.y === 4, J(r0.dau));
  const r1 = SanHoc.chay(cfg([[5, 1], [9, 2], [3, 3], [7, 4], [1, 1]], 'lon'), 'rail(2)\nif read_code() == 9:\n    if weight() == 2:\n        rail(1)\n');
  kiem('ô (2, 4) có container 9 nặng 2 tấn: read_code() = 9, weight() = 2', r1.dau && r1.dau.x === 3, J(r1.dau));
  let hat = 7;
  const ngauNhien = () => { hat = (hat * 1103515245 + 12345) % 2147483648; return hat; };
  let thangLon = 0, thangNho = 0, thangNang = 0, coDinhThang = 0;
  const N = 40;
  for (let t = 0; t < N; t++) {
    const so = [];
    while (so.length < 5) { const n = 1 + (ngauNhien() % 99); if (!so.includes(n)) so.push(n); }
    const tan = [1, 2, 3, 4, 1 + (ngauNhien() % 3)].sort(() => (ngauNhien() % 3) - 1);
    const ds = so.map((n, i) => [n, tan[i]]);
    const tanMax = Math.max(...tan);
    if (SanHoc.chay(cfg(ds, 'lon'), LON).thang) thangLon++;
    if (SanHoc.chay(cfg(ds, 'nho'), NHO).thang) thangNho++;
    if (tan.filter((x) => x === tanMax).length === 1 && SanHoc.chay(cfg(ds, 'nang'), NANG).thang) thangNang++;
    else if (tan.filter((x) => x === tanMax).length > 1) thangNang++;      // hoà kỷ lục tấn: không xét (màn không dựng như vậy)
    if (SanHoc.chay(cfg(ds, 'lon'), 'rail(3)\n' + GIAO).thang) coDinhThang++;
  }
  kiem('quét giữ kỷ lục LỚN nhất thắng ' + N + '/' + N + ' bộ số ngẫu nhiên', thangLon === N, thangLon);
  kiem('quét giữ kỷ lục NHỎ nhất (nho = 100, c < nho) thắng ' + N + '/' + N + ' bộ số', thangNho === N, thangNho);
  kiem('quét weight() giữ kỷ lục NẶNG nhất thắng mọi bộ có một kỷ lục tấn', thangNang === N, thangNang);
  kiem('dãy lệnh cố định rail(3) chỉ thắng bộ có số lớn nhất ở ô 3 (không thắng mọi bộ)', coDinhThang < N / 2, coDinhThang);
}

/* ---- 2–4. MÀN thật: đi qua lộ trình xuất bản ---- */
const khoHam = new Map(), khoTruoc = new Map();
for (const m of LoTrinh.danhSach) {
  khoTruoc.set(m.ma, [...khoHam.values()].map(clone));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) khoHam.set(h.ten, clone(h));
}
function chamMan(m, lg) {
  const hs = new Map((khoTruoc.get(m.ma) || []).map((h) => [h.ten, clone(h)]));
  for (const h of lg.hamCuaEmMoi || m.loiGiai.hamCuaEmMoi || []) hs.set(h.ten, clone(h));
  return ChamHoc.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [], doi: lg.doi }, [...hs.values()]);
}
const cdMa = (r) => (r.chanDoan || []).map((c) => c.ma);
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);
function motSan(m, k) {                                    // màn chỉ còn sân k (giữ dạng mảng song song một phần tử)
  const n = soSan(m), q = clone(m);
  for (const f of ['san', 'batDau', 'chong', 'bongMo', 'tau', 'giao']) if (Array.isArray(q[f]) && q[f].length === n && n > 1) q[f] = [q[f][k]];
  return q;
}
const oKyLuc = (m, k) => { const b = Array.isArray(m.bongMo) ? m.bongMo[k] : m.bongMo; return b.x; };
function quenKyLuc(bai) {                                  // dòng ghi kỷ lục ngay dưới if: "lon = c" → "m = c"
  const b = clone(bai);
  const i = b.chinh.findIndex((d, j) => j > 0 && /^\s+if \w+ [<>] \w+:\s*$/.test(b.chinh[j - 1]) && /^\s+\w+ = \w+\s*$/.test(d));
  if (i >= 0) b.chinh[i] = b.chinh[i].replace(/^(\s+)\w+ =/, '$1m =');
  return { bai: b, doi: i >= 0 };
}
const GIAO_CO_DINH = (x) => ({ chinh: ['rail(' + x + ')', 'pick_up()', 'swing_left()', 'swing_left()', 'set_down()'] });

console.log('\n== 2. Màn dãy ngang (' + DS_MAN.length + ' màn) ==');
const dsMan = [];
for (const d of DS_MAN) {
  const m = LoTrinh.danhSach.find((q) => q.ma === d.ma);
  kiem(d.ma + ' có trong lộ trình xuất bản', !!m);
  if (!m) continue;
  dsMan.push([d, m]);
  const epDau = PHA && d === DS_MAN.find((q) => q.san);
  const giai = epDau ? quenKyLuc(m.loiGiai).bai : m.loiGiai;
  let r = chamMan(m, giai);
  kiem(d.ma + ' "' + m.ten + '": lời giải thắng mọi sân (' + soSan(m) + ' sân)', r.thang === true, J(cdMa(r)));
  const code = m.loiGiai.chinh.join('\n');
  kiem(d.ma + ': lời giải tự giữ kỷ lục (có if + gán), không max / min / list', /\bif \w+ [<>] \w+:/.test(code) && !/\b(max|min|list|sorted)\s*\(|\[/.test(code), code);
  kiem(d.ma + ': lời giải dùng ' + (d.viec === 'nang' ? 'weight()' : 'read_code()'), (d.viec === 'nang' ? /weight\(\)/ : /read_code\(\)/).test(code));
  if (d.san) {
    const n = soSan(m);
    const bo = n > 1 ? m.chong.map((c) => J(c)) : [];
    const oKL = [...Array(n).keys()].map((k) => oKyLuc(m, k));
    kiem(d.ma + ': ≥ ' + d.san + ' sân, mỗi sân một bộ số', n >= d.san && new Set(bo).size === n, n + ' sân');
    kiem(d.ma + ': ô kỷ lục khác chỗ giữa các sân (' + J(oKL) + ')', new Set(oKL).size >= 2);
  } else kiem(d.ma + ': màn trình diễn khoá mã, không loiSai', m.chinhCoDinh === true && (m.loiSai || []).length === 0);
  (m.loiSai || []).forEach((ls) => {
    r = chamMan(m, Object.assign({}, ls.baiLam, { hamCuaEmMoi: ls.hamCuaEmMoi }));
    kiem(d.ma + ' lời sai "' + ls.moTa.slice(0, 60) + '": không thắng, có mã ' + (ls.phaiCoMa || []).join(' + '), r.thang === false && (ls.phaiCoMa || []).every((ma) => cdMa(r).includes(ma)), J(cdMa(r)));
  });
}

console.log('\n== 3. Làm theo sân 1: dãy lệnh cố định thắng một sân, thua cả màn ==');
for (const [d, m] of dsMan) {
  if (!d.san) continue;
  const x1 = oKyLuc(m, 0);
  const coDinh = GIAO_CO_DINH(x1);
  const r1 = chamMan(motSan(m, 0), coDinh);
  const r = chamMan(m, coDinh);
  kiem(d.ma + ': rail(' + x1 + ') rồi giao THẮNG sân 1 một mình', r1.thang === true, J(cdMa(r1)));
  kiem(d.ma + ': cùng dãy lệnh đó THUA cả màn (sân khác kỷ lục ở chỗ khác)', r.thang === false, J(cdMa(r)));
}

console.log('\n== 4. Quên cập nhật kỷ lục → thua ==');
for (const [d, m] of dsMan) {
  if (!d.san) continue;
  const q = quenKyLuc(m.loiGiai);
  const r = chamMan(m, q.bai);
  kiem(d.ma + ': tìm được dòng ghi kỷ lục và đổi tên biến', q.doi);
  kiem(d.ma + ': lời giải quên cập nhật kỷ lục → thua', r.thang === false, J(cdMa(r)));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' · ' : '') + 'ĐẠT ' + dat + ' · HỎNG ' + hong + (PHA ? '   (chạy --pha: PHẢI hỏng)' : ''));
process.exit(hong ? 1 : 0);
