/* ============================================================================
   kiem-man-mua-4.mjs — máy kiểm MÀN MỚI mùa 4 (10 tệp ngân hàng TEP_MUA_4, KE-HOACH-MUA-4.md P2; chép khuôn kiem-man-mua-3.mjs của phiên Mùa 3). Mỗi màn mới, chấm với kho hàm của em lúc tới màn
   (mỗi màn trước tạo / sửa hàm theo lời giải, như kiem-bien-xich.mjs):
   1. lời giải thắng 3 sao, đúng sao.o / sao.nhip;
   2. mã mẫu: màn trình diễn (chiChay) thì mã mẫu = lời giải và thắng 3 sao; màn khác thì mã mẫu THUA (người chơi phải làm gì đó);
   3. lời giải khác thắng (2 sao nếu khai `saoKhac`), công thức khác thắng; mỗi lời sai thua và có đủ mã phaiCoMa;
   4. hàm cần (hamCuaEmCan) đều có trong kho; màn taoHam có hàm đó trong lời giải (hamCuaEmMoi);
   5. mọi trường bắt buộc (ten, hang, deBai, goiY ≥ 1) có; chữ hiển thị không gạch dài (em dash), không emoji.
   In bảng: chương · mã · hạng · dòng / nhịp / ô (chỉ số đường cong như kiem-lo-trinh mục mùa 3 (h)).
   Chạy: node hoc/kiem-man-mua-4.mjs [mã chương…]   (--bang chỉ in bảng)   (trượt thì thoát mã 1)
   --loi-gia: cắm lỗi giả (lời giải màn mới đầu tiên không trình diễn bỏ dòng cuối) → mục 1 phải đỏ.
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const M = require(path.join(day, 'lo-trinh-hoc.js'));
const Cham = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

const LOI_GIA = process.argv.includes('--loi-gia');
const CHI_BANG = process.argv.includes('--bang');
const loc = process.argv.slice(2).filter((a) => !a.startsWith('--'));
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; if (!CHI_BANG) console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const TEP_MUA_4 = ['manCatCanh', 'manChamSon', 'manCameraBonHuong', 'manPhoMau', 'manTramSac', 'manNetLien', 'manNhinDuoiChan', 'manDoiChiaHang', 'manSonTrenCao', 'manTrumMua4'];
const moi = new Set(TEP_MUA_4.flatMap((k) => M[k] || []));      // chính các đối tượng màn (dungChuong đổi so / chuong khi xếp chỗ)
const tatCa = M.danhSach;
const tenCot = [...new Set(tatCa.flatMap((m) => m.taoHam || []))];
const khoTruoc = (() => {
  const nho = new Map(), kho = KhoHam.moi({ tenCoDinh: tenCot });
  for (const m of tatCa) {
    nho.set(m.id, kho.ds());
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi || []) { if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam }); kho.sua(h.ten, h.than); }
  }
  return (id) => nho.get(id);
})();
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soDong = (m) => (m.doi ? m.loiGiai.doi.filter((d, i) => !m.doi[i].coDinh).reduce((s, d) => s + d.chinh.length, 0) : (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length))
  + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
const soO = (m) => Math.max(...dsSan(m).map((r) => r.join('').replace(/#/g, '').length));
const ma = (r) => r.chanDoan.map((c) => c.ma);
const GACH = /[—–]|[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const goi4 = M.mua4;
const bang = [];
let daLoiGia = false;
for (const g of goi4) for (const [c] of g.chuong) {
  if (loc.length && !loc.includes(c) && !loc.includes(g.ma)) continue;
  const ds = tatCa.filter((m) => m.chuong === c).sort((a, b) => a.so - b.so);
  if (!ds.length) { bang.push([g.ma, c, '(chưa có màn)']); continue; }
  for (const m of ds) {
    const laMoi = moi.has(m);
    bang.push([g.ma, c + '.' + m.so, m.ma + (laMoi ? ' *' : ''), m.hang + (m.chiChay ? ' chiChay' : ''), soDong(m) + ' / ' + m.sao.nhip + ' / ' + soO(m), m.ten]);
    if (!laMoi || CHI_BANG) continue;
    // kho lúc tới màn, cộng hàm của em mới / sửa của bài làm (như kiem-nhen.mjs `tron`): máy chấm đọc hàm của em từ kho, không từ baiLam.hamCuaEmMoi
    const kho = khoTruoc(m.id);
    const cham = (b) => {
      const kq = kho.map((h) => ({ ten: h.ten, thamSo: h.thamSo.slice(), than: h.than.slice() }));
      for (const h of b.hamCuaEmMoi || []) { const i = kq.findIndex((x) => x.ten === h.ten), x = { ten: h.ten, thamSo: (h.thamSo || []).slice(), than: h.than.slice() }; if (i >= 0) kq[i] = x; else kq.push(x); }
      return Cham.cham(m, b, kq);
    };
    let lg = m.loiGiai;
    // màn trình diễn khoá chương trình (máy chấm chạy mã mẫu khoá) nên cắm lỗi giả ở màn mới đầu tiên KHÔNG trình diễn
    if (LOI_GIA && !daLoiGia && !m.chiChay) { lg = Object.assign({}, lg, { chinh: lg.chinh.slice(0, -1) }); daLoiGia = true; }
    const r = cham(lg);
    kiem(m.ma + ' lời giải 3 sao, đúng sao.o ' + m.sao.o + ' / sao.nhip ' + m.sao.nhip, r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip,
      (r.thang ? r.sao + ' sao, ' : 'thua ' + ma(r).join(',') + ', ') + r.soO + ' ô, ' + r.soNhip + ' nhịp');
    const mm = cham(m.maMau);
    if (m.chiChay) kiem(m.ma + ' trình diễn: mã mẫu = lời giải, thắng 3 sao', J(m.maMau.chinh) === J(m.loiGiai.chinh) && mm.thang && mm.sao === 3, mm.sao + ' ' + ma(mm).join(','));
    else kiem(m.ma + ' mã mẫu thua', !mm.thang, ma(mm).join(','));
    if (m.loiGiaiKhac) {
      const b = Object.assign({}, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi ? { hamCuaEmMoi: m.loiGiaiKhac.hamCuaEmMoi } : {});
      const k = cham(b);
      kiem(m.ma + ' lời giải khác thắng' + (m.saoKhac ? ' ' + m.saoKhac + ' sao' : ''), k.thang && (!m.saoKhac || k.sao === m.saoKhac), k.sao + ' ' + ma(k).join(','));
    }
    (m.congThucKhac || []).forEach((x, i) => { const k = cham(Object.assign({}, x.baiLam, x.hamCuaEmMoi ? { hamCuaEmMoi: x.hamCuaEmMoi } : {})); kiem(m.ma + ' công thức khác ' + i + ' thắng', k.thang, ma(k).join(',')); });
    (m.loiSai || []).forEach((x, i) => {
      const k = cham(Object.assign({}, x.baiLam, x.hamCuaEmMoi ? { hamCuaEmMoi: x.hamCuaEmMoi } : {}));
      kiem(m.ma + ' lời sai ' + i + ' thua, có ' + (x.phaiCoMa || []).join(','), !k.thang && (x.phaiCoMa || []).every((y) => ma(k).includes(y)), (k.thang ? 'THẮNG ' + k.sao : '') + ma(k).join(','));
    });
    kiem(m.ma + ' hàm cần đều có trong kho', (m.hamCuaEmCan || []).every((t) => kho.some((h) => h.ten === t)), (m.hamCuaEmCan || []).filter((t) => !kho.some((h) => h.ten === t)).join(','));
    for (const t of m.taoHam || []) kiem(m.ma + ' taoHam ' + t + ' có trong lời giải', (m.loiGiai.hamCuaEmMoi || []).some((h) => h.ten === t));
    const chu = [m.ten, m.deBai, m.veMaMau || ''].concat(m.goiY || [], (m.loiSai || []).map((x) => x.moTa)).join(' ');
    kiem(m.ma + ' đủ ten / hang / deBai / goiY, chữ không gạch dài, không emoji', !!(m.ten && m.hang && m.deBai && (m.goiY || []).length) && !GACH.test(chu));
  }
}
console.log('\nBảng màn mùa 3 (gói | chương.số | mã (* = mới) | hạng | dòng / nhịp / ô | tên):');
for (const b of bang) console.log('  ' + b.join(' | '));
if (LOI_GIA) { console.log('Lỗi giả: ' + (hong ? 'BẮT ĐƯỢC (ĐẠT)' : 'KHÔNG bắt được (HỎNG)')); process.exit(hong ? 0 : 1); }
console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG' : 'ĐẠT') + ' ' + dat + ' · HỎNG ' + hong + ' kiểm (' + moi.size + ' màn mới)');
process.exit(hong ? 1 : 0);
