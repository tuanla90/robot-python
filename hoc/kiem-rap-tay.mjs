/* ============================================================================
   kiem-rap-tay.mjs — máy kiểm chương `rap-tay` (Lắp ráp: Thân + Tay, 10 màn) của "Học lập trình" (KE-HOACH-LAP-RAP.md; lõi lap-rap.js; bộ dò do-duong-rap-tay.mjs). Gồm:
   1. dữ liệu chương: 10 màn đúng hàng (3 làm quen · 3 luyện · 3 biến thể · 1 trùm có huy hiệu), thân ⊆ {hai bánh, xích, omni, nhện}, tay ⊆ {kẹp, xoay, nam châm, máy ném, súng hơi}, không drone,
      không khe não (cảm biến), sân chỉ dùng ký hiệu đã gặp tới gói Máy ném, sân ≤ 7 × 9, khung 10 ô như giao diện, lời giải mẫu dùng kho (lapRap.dungKho) và không tạo hàm của em nào;
   2. cân màn: mọi màn qua LapRap.kiemCanMan (≥ 2 cách mẫu đều THẮNG bằng lời giải chạy thật, cachLap[0] ba sao, không cách mẫu nào hơn hẳn cách khác ở cả giá, nhịp lẫn ô), lời giải mẫu vừa khung,
      đúng sao.o / sao.nhip, lời giải khác đúng hai sao, công thức khác thắng, lời sai không thắng và có đúng mã chẩn đoán (phaiCoMa);
   3. BFS CHO MỌI CÁCH LẮP vừa ngân sách (LapRap.dsCachLap, bộ dò do-duong-rap-tay.mjs dùng chính SanHoc.chay làm thước đo): nhịp ngắn nhất của từng cách (hay không tới được);
      robot của cachLap[0] có BFS ≤ sao.nhip (= sao.nhip nếu màn không khai nhipTheoLoiGiai) và KHÔNG cách lắp nào ít nhịp hơn nó; không cách nào KHÁC cachLap[0] đạt sao.nhip;
      mỗi cách mẫu chạy không ít nhịp hơn BFS của thân + tay của nó; đường BFS đổi thành lệnh gốc rồi chạy SanHoc.chay thắng đúng số nhịp BFS;
   4. bẫy có chủ ý: cách không tới được (BFS null), thẻ quá ngân sách, ghép sai (nhện + nam châm…);
   5. giao diện: choi.html nạp man-rap-tay.js, huy hiệu 'rap-tay', kiem-hoc.mjs nạp chương và có nhánh dò đường.
   Id màn KHÔNG ghi cứng số chương: ThuTu.thuTu.indexOf('rap-tay') + 1.
   Chạy: node hoc/kiem-rap-tay.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
let ManHoc = null;
for (const f of fs.readdirSync(day).filter((x) => /^man-.*[.]js$/.test(x)).sort()) {
  try { ManHoc = require(path.join(day, f)); } catch (e) { console.log('  (không nạp được ' + f + ': ' + String(e.message).split('\n')[0] + ')'); }
}
const DD = await import('./do-duong-rap-tay.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const doc = (f) => fs.readFileSync(path.join(day, f), 'utf8');
const ds = ManHoc.danhSach.filter((m) => m.chuong === 'rap-tay');
const soChuong = ThuTu.thuTu.indexOf('rap-tay') + 1;                     // KHÔNG ghi cứng số chương: id tự tính theo vị trí
const maCua = (r) => r.chanDoan.map((c) => c.ma);
const THAN = ['hai-banh', 'xich', 'omni', 'nhen'], TAY = ['kep', 'xoay', 'nam-cham', 'nem', 'hoi'];
const khoMau = (m) => LapRap.khoMau(m);
const tenCach = (c) => LapRap.moTa(c);
const cungRobot = (a, b) => (a.than || null) === (b.than || null) && (a.tay || null) === (b.tay || null) && (a.camBien || null) === (b.camBien || null);

/* --------------------------------------------------------------------- 1. dữ liệu chương */
console.log('1. dữ liệu chương (' + ds.length + ' màn, chương số ' + soChuong + ')');
kiem('đúng 10 màn, mã rap-tay.1 … rap-tay.10, id bắt đầu bằng số chương', ds.length === 10 && ds.every((m, i) => m.ma === 'rap-tay.' + (i + 1) && m.id === soChuong + '.' + (i + 1)), ds.map((m) => m.id).join());
kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn trùm có huy hiệu "rap-tay"',
  J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
  ds.every((m) => (m.so === 10) === !!m.huyHieu) && ds[9].huyHieu.ma === 'rap-tay' && /Lắp ráp/.test(ds[9].huyHieu.ten));
kiem('chương nằm trong gói riêng "rap-tay" ngay sau gói Máy ném (thứ tự chương: sau che-may-nem)', ThuTu.thuTu.indexOf('rap-tay') === ThuTu.thuTu.indexOf('che-may-nem') + 1 && ThuTu.goi.some((g) => g.ma === 'rap-tay' && g.chuong.length === 1 && g.chuong[0] === 'rap-tay'));
kiem('mọi màn là màn lắp ráp: có lapRap, thân ⊆ {hai bánh, xích, omni, nhện}, tay ⊆ {kẹp, xoay, nam châm, máy ném, súng hơi} (cả hai khe có), KHÔNG khe não, ngân sách nguyên 4–7',
  ds.every((m) => m.lapRap && m.lapRap.than.length >= 1 && m.lapRap.than.every((t) => THAN.includes(t)) && m.lapRap.tay.length >= 1 && m.lapRap.tay.every((t) => TAY.includes(t)) && J(m.lapRap.camBien) === '[]' &&
    Number.isInteger(m.lapRap.nganSach) && m.lapRap.nganSach >= 4 && m.lapRap.nganSach <= 7), ds.map((m) => m.lapRap && m.lapRap.nganSach).join());
kiem('không màn nào dùng drone hay cảm biến (các cách mẫu cũng vậy); mọi cách mẫu có thân hợp lệ',
  ds.every((m) => m.lapRap.cachLap.every((c) => THAN.includes(c.than) && (!c.tay || TAY.includes(c.tay)) && !c.camBien)));
kiem('mỗi màn ≥ 2 cách lắp mẫu (trùm 3), không trùng nhau, cách đầu không bị bỏ trống thân', ds.every((m) => m.lapRap.cachLap.length >= (m.so === 10 ? 3 : 2)) && ds.every((m) => LapRap.kiemDuLieu(m).length === 0), J(ds.map((m) => LapRap.kiemDuLieu(m)).filter((x) => x.length)));
kiem('mỗi thân và mỗi tay xuất hiện ở ít nhất một màn như một cách mẫu: kẹp · xoay · nam châm · máy ném · súng hơi · xích · omni · nhện (hai bánh đã có sẵn)',
  TAY.every((t) => ds.some((m) => m.lapRap.cachLap.some((c) => c.tay === t))) && THAN.every((t) => ds.some((m) => m.lapRap.cachLap.some((c) => c.than === t))));
kiem('tay luôn đi kèm lời giải hợp: màn khai phaiCo ["tay"] thì mọi cách mẫu đều gắn tay (màn 1, 7 và 10 cho phép không tay)',
  ds.every((m) => !(m.lapRap.phaiCo || []).includes('tay') || m.lapRap.cachLap.every((c) => !!c.tay)) && ds.filter((m) => !(m.lapRap.phaiCo || []).length).map((m) => m.so).join() === '1,7,10');
kiem('mọi màn một sân (không nhiều sân), sân tối đa 7 cột × 9 hàng; khung chương trình 10 ô, mỗi hàm 10 ô (như giao diện); Xưởng mở, được dùng hàm của em; cauTruc for/if/while',
  ds.every((m) => !Array.isArray(m.san[0]) && m.san.length <= 9 && m.san.every((h) => h.length <= 7) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while"]' && m.nhipTheo === undefined));
const KY_HIEU = new Set('.#FSnu=<>^vDoNCc'.split(''));
kiem('sân chỉ dùng ký hiệu đã gặp tới gói Máy ném (. # F S u = băng chuyền D o N C c); không thùng nặng H, không ô màu, không ô sạc P; mục tiêu: 1, 7, 10 tới cờ · còn lại đưa vật (dua-vat)',
  ds.every((m) => m.san.join('').split('').every((ch) => KY_HIEU.has(ch))) && ds.every((m) => (m.mucTieu === 'dua-vat') === ![1, 7, 10].includes(m.so)) &&
  ds.every((m) => (m.mucTieu === 'dua-vat') ? /D/.test(m.san.join('')) && /o/.test(m.san.join('')) : /F/.test(m.san.join(''))));
kiem('mọi yếu tố sân chỉ dùng thứ đã gặp: bậc thang S (màn 2, 10), hàng rào = (3, 4), vật sắt (4), hố u (8), băng chuyền (9), nút N + cửa C (7, 10); không gầm n, không thùng, không ô màu',
  J(ds.filter((m) => /S/.test(m.san.join(''))).map((m) => m.so)) === '[2,10]' && J(ds.filter((m) => /=/.test(m.san.join(''))).map((m) => m.so)) === '[3,4]' && J(ds.filter((m) => /u/.test(m.san.join(''))).map((m) => m.so)) === '[8]' &&
  J(ds.filter((m) => /[<>^v]/.test(m.san.join(''))).map((m) => m.so)) === '[9]' && J(ds.filter((m) => /N/.test(m.san.join(''))).map((m) => m.so)) === '[7,10]' && J(ds.filter((m) => /n/.test(m.san.join(''))).map((m) => m.so)) === '[]');
kiem('lapRap.dungKho ở mọi màn; lời giải mẫu không tạo / sửa hàm của em nào (hamCuaEmMoi rỗng), không hàm của màn, taoHam rỗng: chương không làm kho phình ra',
  ds.every((m) => m.lapRap.dungKho === true && m.taoHam.length === 0 && m.lapRap.cachLap.every((c) => !(c.loiGiai.hamCuaEmMoi || []).length && !(c.loiGiai.hamCuaMan || []).length) && m.loiGiai.hamCuaEmMoi.length === 0 && m.loiGiai.hamCuaMan.length === 0 && m.maMau.chinh.length === 0));
const LENH_GOC_OK = new Set([].concat(SanHoc.HAM_GOC.banh, SanHoc.HAM_GOC.omni, SanHoc.HAM_GOC.nhen, SanHoc.TAY_LENH, SanHoc.TAY_NAM_CHAM, SanHoc.TAY_NEM, SanHoc.TAY_HOI, ['for', 'range']));
function tenGoi(dong) { return (dong.replace(/#.*$/, '').match(/[A-Za-z_]\w*(?=\()/g) || []); }
kiem('lời giải mẫu chỉ dùng hàm của em đã có TRƯỚC chương này (kho tham chiếu) hoặc lệnh gốc, mỗi chương trình chính ≤ 10 dòng',
  ds.every((m) => {
    const kho = khoMau(m).map((h) => h.ten);
    return m.lapRap.cachLap.every((c) => c.loiGiai.chinh.length <= 10 && c.loiGiai.chinh.every((d) => tenGoi(d).every((t) => LENH_GOC_OK.has(t) || kho.includes(t))));
  }));
kiem('Sổ lệnh không đổi: chương không có hàm cốt truyện mới (không màn nào có taoHam, không mục Sổ lệnh nào thuộc chuong "rap-tay")', ds.every((m) => !(m.taoHam || []).length) && SoLenh.ds.every((h) => h.chuong !== 'rap-tay'));
kiem('robot mặc định của màn (ManHoc.chuanHoa) theo cachLap[0]: loaiRobot, robot, hamGoc khớp LapRap.apDung; loiGiai = lời giải của cachLap[0]',
  ds.every((m) => { const a = LapRap.apDung(m, m.lapRap.cachLap[0]); return m.loaiRobot === a.loaiRobot && J(m.robot) === J(a.robot) && J(m.hamGoc) === J(a.hamGoc) && J(m.loiGiai.chinh) === J(m.lapRap.cachLap[0].loiGiai.chinh); }));
kiem('cách lắp đầu tiên của từng màn: 1 hai bánh + kẹp · 2 xích + kẹp · 3 hai bánh + máy ném · 4 hai bánh + nam châm · 5 omni + kẹp · 6 hai bánh + xoay · 7 hai bánh + súng hơi · 8 nhện + kẹp · 9 xích + kẹp · 10 hai bánh + súng hơi',
  J(ds.map((m) => [m.lapRap.cachLap[0].than, m.lapRap.cachLap[0].tay])) === J([['hai-banh', 'kep'], ['xich', 'kep'], ['hai-banh', 'nem'], ['hai-banh', 'nam-cham'], ['omni', 'kep'], ['hai-banh', 'xoay'], ['hai-banh', 'hoi'], ['nhen', 'kep'], ['xich', 'kep'], ['hai-banh', 'hoi']]));
kiem('đề 1–3 câu, gợi ý 1–2 câu và không nói tên nút bấm của giao diện; đề không rao cách lắp đáp án (không nêu tên part được chọn trong đề)',
  ds.every((m) => m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.deBai.length > 20 && !/bấm/i.test(m.goiY.join(' ')) && !/tay kẹp|tay xoay|nam châm|máy ném|súng hơi|xích|omni|nhện/i.test(m.deBai)));
kiem('mỗi màn ≥ 1 công thức khác (thắng), ≥ 1 lời sai, có lời giải khác; ghiChu từng cách mẫu có chữ',
  ds.every((m) => m.congThucKhac.length >= 1 && m.loiSai.length >= 1 && !!m.loiGiaiKhac && m.lapRap.cachLap.every((c) => typeof c.ghiChu === 'string' && c.ghiChu.length > 10)));

/* --------------------------------------------------------------------- 2. cân màn + lời giải */
console.log('2. cân màn (kiemCanMan), lời giải mẫu, lời giải khác, công thức khác, lời sai');
const BANG = [];
for (const m of ds) {
  const kho = khoMau(m);
  const loi = LapRap.kiemCanMan(m, kho);
  kiem(m.id + ' ' + m.ten + ': kiemCanMan rỗng (dữ liệu · mọi cách mẫu thắng · cachLap[0] ba sao · không cách nào hơn hẳn cách khác)', loi.length === 0, J(loi));
  const tk = LapRap.thongKeMau(m);                                      // không truyền kho: dungKho tự dùng kho tham chiếu (đúng đường đi của giao diện)
  BANG.push({ m, tk });
  kiem(m.id + ': thongKeMau không kho (đường của giao diện) cho cùng kết quả với kho tham chiếu', J(tk.map((x) => [x.thang, x.nhip, x.o, x.sao])) === J(LapRap.thongKeMau(m, kho).map((x) => [x.thang, x.nhip, x.o, x.sao])));
  const r = ChamHoc.cham(m, m.loiGiai, kho);
  kiem(m.id + ': lời giải cách đầu thắng 3 sao, ' + r.soO + ' ô = sao.o ' + m.sao.o + ', ' + r.soNhip + ' nhịp = sao.nhip ' + m.sao.nhip + ', không chẩn đoán nào (kể cả thông tin), vừa khung',
    r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, o: r.soO, nhip: r.soNhip, cd: maCua(r) }));
  tk.forEach((x, i) => {
    const rr = ChamHoc.cham(LapRap.apDung(m, m.lapRap.cachLap[i]), { chinh: m.lapRap.cachLap[i].loiGiai.chinh }, kho);
    kiem(m.id + ' cách mẫu #' + (i + 1) + ' (' + x.ten + ', ' + x.gia + ' xu): thắng, ' + x.nhip + ' nhịp, ' + x.o + ' ô, ' + x.sao + ' sao, không chẩn đoán lỗi, vừa khung (' + m.lapRap.cachLap[i].loiGiai.chinh.length + ' dòng)',
      x.thang && rr.thang && x.nhip === rr.soNhip && x.o === rr.soO && !rr.chanDoan.some((c) => c.muc === 'loi') && !maCua(rr).includes('tran-khung') && x.gia <= m.lapRap.nganSach && (i === 0 || x.gia <= m.sao.re.gia ? x.sao === 3 : x.sao <= 2), J({ thang: x.thang, sao: x.sao, cd: maCua(rr) }));
  });
  // cân đối giá: cách đầu đắt nhất hoặc nhanh nhất; thứ tự xu giảm thì nhịp tăng
  const sapXep = tk.slice().sort((a, b) => b.gia - a.gia);
  kiem(m.id + ': đánh đổi thật — cách mẫu càng đắt càng ít nhịp (giá giảm thì nhịp không giảm theo), cách đầu nhanh nhất', tk.every((x) => x.nhip >= tk[0].nhip) && sapXep.every((x, i) => i === 0 || x.gia === sapXep[i - 1].gia || x.nhip >= sapXep[i - 1].nhip), J(tk.map((x) => [x.gia, x.nhip, x.o])));
  const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, kho);
  kiem(m.id + ': lời giải khác (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung, không chẩn đoán', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && rk.chanDoan.length === 0, J({ sao: rk.sao, o: rk.soO, nhip: rk.soNhip, cd: maCua(rk) }));
  m.congThucKhac.forEach((c, i) => {
    const rc = ChamHoc.cham(m, c.baiLam, kho);
    kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không chẩn đoán lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && !rc.chanDoan.some((x) => x.muc === 'loi') && !maCua(rc).includes('tran-khung'), J({ thang: rc.thang, cd: maCua(rc) }));
  });
  // LỜI GIẢI TỰ NHIÊN (điều phối 17/10): cách đầu có lời giải DÙNG HÀM của kho; mọi biến thể tự nhiên (dat3sao: hàm khác, viết thẳng, có / không vòng for, lệnh gốc) cũng đạt 3 sao;
  // sao.o = ô lớn nhất trong các cách viết tự nhiên đạt sao.nhip (lời giải của cách đầu chính là cách ô lớn nhất), nên không ai bị mất sao ô chỉ vì dùng hàm.
  const tenKho = kho.map((h) => h.ten);
  const dungHam = (chinh) => chinh.some((d) => tenGoi(d).some((t) => tenKho.includes(t)));
  const tuNhien = m.congThucKhac.filter((c) => c.dat3sao);
  const rTN = tuNhien.map((c) => ChamHoc.cham(m, c.baiLam, kho));
  kiem(m.id + ': lời giải cách đầu dùng hàm có sẵn trong kho (' + (tenGoi(m.loiGiai.chinh.join('\n')).filter((t) => tenKho.includes(t)).join(', ') || 'không') + '); có ≥ 1 biến thể tự nhiên khác (dat3sao)', dungHam(m.loiGiai.chinh) && tuNhien.length >= 1);
  tuNhien.forEach((c, i) => {
    kiem(m.id + ' biến thể tự nhiên #' + (i + 1) + ' (' + c.moTa + (dungHam(c.baiLam.chinh) ? ', dùng hàm' : ', thuần lệnh gốc') + '): thắng ' + rTN[i].sao + ' sao, ' + rTN[i].soO + ' ô ≤ sao.o ' + m.sao.o + ', ' + rTN[i].soNhip + ' nhịp ≤ sao.nhip ' + m.sao.nhip + ', vừa khung, không chẩn đoán',
      rTN[i].thang && rTN[i].sao === 3 && rTN[i].soO <= m.sao.o && rTN[i].soNhip <= m.sao.nhip && rTN[i].chanDoan.length === 0 && c.baiLam.chinh.length <= 10, J({ sao: rTN[i].sao, o: rTN[i].soO, nhip: rTN[i].soNhip, cd: maCua(rTN[i]) }));
  });
  kiem(m.id + ': sao.o ' + m.sao.o + ' = ô của lời giải cách đầu = ô lớn nhất trong các cách viết tự nhiên (' + [r.soO].concat(rTN.map((x) => x.soO)).join(', ') + ')', r.soO === m.sao.o && rTN.every((x) => x.soO <= r.soO));
  m.loiSai.forEach((ls, i) => {
    const rs = ChamHoc.cham(m, ls.baiLam, kho);
    const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
    kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không thắng, có mã ' + ls.phaiCoMa.join('+'), rs.sao < 3 && !rs.thang && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
  });
}

/* --------------------------------------------------------------------- 3. BFS cho MỌI cách lắp vừa ngân sách */
console.log('3. BFS cho mọi cách lắp vừa ngân sách (do-duong-rap-tay.mjs)');
const KQ_BFS = [];
const t0 = Date.now();
for (const { m, tk } of BANG) {
  const cs = LapRap.dsCachLap(m);
  const dau = m.lapRap.cachLap[0];
  const hang = [];
  for (const c of cs) {
    const mau = m.lapRap.cachLap.findIndex((x) => cungRobot(LapRap.chuanCach(x), c));
    // cách mẫu: dò tới nhịp lời giải mẫu của nó (BFS ≤ nhịp mẫu); cách khác: chỉ cần biết có đạt sao.nhip không (dò tới sao.nhip)
    const gioiHan = mau >= 0 ? tk[mau].nhip : m.sao.nhip;
    const kq = DD.nhipRapTayNganNhat(m, c, { toiDaNhip: gioiHan });
    hang.push({ c, mau, gioiHan, kq });
  }
  KQ_BFS.push({ m, hang });
  const catNgang = hang.filter((h) => h.kq.catNgang);
  kiem(m.id + ': BFS ' + hang.length + ' cách lắp vừa ' + m.lapRap.nganSach + ' xu — không cách nào bị cắt ngang (đủ trạng thái để kết luận)', catNgang.length === 0, catNgang.map((h) => tenCach(h.c)).join());
  const robotDau = hang.find((h) => cungRobot(LapRap.chuanCach(h.c), LapRap.chuanCach(dau)));
  kiem(m.id + ': robot của cách đầu (' + tenCach(dau) + ') có BFS = ' + (robotDau && robotDau.kq.nhip) + ' ' + (m.nhipTheoLoiGiai ? '≤ sao.nhip ' + m.sao.nhip + ' (khai nhipTheoLoiGiai: lời giải tự nhiên dùng pick() / drop() hai nhịp)' : '= sao.nhip ' + m.sao.nhip),
    !!robotDau && robotDau.kq.nhip !== null && (m.nhipTheoLoiGiai ? robotDau.kq.nhip <= m.sao.nhip : robotDau.kq.nhip === m.sao.nhip), J(robotDau && robotDau.kq.nhip));
  kiem(m.id + ': nhipTheoLoiGiai chỉ khai khi lời giải mẫu chậm hơn đường ngắn nhất (và không khai thừa)', !!m.nhipTheoLoiGiai === (robotDau.kq.nhip < m.sao.nhip), 'BFS ' + robotDau.kq.nhip + ' · sao.nhip ' + m.sao.nhip);
  const duoi = hang.filter((h) => h.kq.nhip !== null && h.kq.nhip <= m.sao.nhip && !cungRobot(LapRap.chuanCach(h.c), LapRap.chuanCach(dau)));
  kiem(m.id + ': không cách lắp nào KHÁC cách đầu đạt sao.nhip ' + m.sao.nhip + ' (không đường tắt cho robot khác)', duoi.length === 0, duoi.map((h) => tenCach(h.c) + '=' + h.kq.nhip).join());
  const nhanHon = hang.filter((h) => h.kq.nhip !== null && h.kq.nhip < robotDau.kq.nhip);
  kiem(m.id + ': không cách lắp nào đi ít nhịp hơn robot của cách đầu (BFS ' + robotDau.kq.nhip + ')', nhanHon.length === 0, nhanHon.map((h) => tenCach(h.c) + '=' + h.kq.nhip).join());
  const mauNhanHonBFS = hang.filter((h) => h.mau >= 0 && (h.kq.nhip === null || h.kq.nhip > tk[h.mau].nhip));
  kiem(m.id + ': mỗi cách mẫu chạy không ít nhịp hơn BFS của robot nó (lời giải mẫu thật sự thắng trong ' + hang.filter((h) => h.mau >= 0).map((h) => h.kq.nhip + '/' + tk[h.mau].nhip).join(', ') + ' nhịp: BFS / mẫu)', mauNhanHonBFS.length === 0, mauNhanHonBFS.map((h) => tenCach(h.c)).join());
  // đường BFS đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp
  const ngoai = [];
  for (const h of hang) {
    if (h.kq.nhip === null) continue;
    const mm = LapRap.apDung(m, h.c);
    const kc = SanHoc.chay(DD.cfgCua(mm, 0), h.kq.ma);
    if (!(kc.thang === true && kc.nhip === h.kq.nhip && !kc.loi)) ngoai.push(tenCach(h.c) + ': ' + J([kc.thang, kc.nhip, h.kq.nhip]));
  }
  kiem(m.id + ': đường BFS của từng cách đổi thành lệnh gốc rồi chạy SanHoc.chay thắng đúng nhịp BFS', ngoai.length === 0, ngoai.join(' | '));
}
console.log('  (BFS mọi cách mất ' + Math.round((Date.now() - t0) / 1000) + ' giây)');

/* --------------------------------------------------------------------- 4. bẫy có chủ ý */
console.log('4. bẫy có chủ ý');
{
  const kyLa = (m, c) => { const r = DD.nhipRapTayNganNhat(m, c, { toiDaNhip: 20 }); return r.nhip; };
  const m9 = ds[8], m4 = ds[3], m10 = ds[9], m3 = ds[2];
  kiem('9 Băng chuyền ngược: omni + kẹp vừa ngân sách mà KHÔNG tới được (omni bị băng đẩy mạnh, đi ngược băng thì đứng im): BFS null', LapRap.kiemCachLap(m9, { than: 'omni', tay: 'kep' }).ok && kyLa(m9, { than: 'omni', tay: 'kep' }) === null);
  kiem('4 Hút qua rào: hai bánh + máy ném không có ở danh sách tay, nhưng nam châm chỉ hút vật SẮT: đổi vật sắt thành vật gỗ thì BFS của nam châm đổi sang null hoặc nhiều hơn 4 nhịp',
    (() => { const go = Object.assign({}, m4, { vatChat: undefined }); const r = DD.nhipRapTayNganNhat(go, { than: 'hai-banh', tay: 'nam-cham' }, { toiDaNhip: 6 }); return r.nhip === null; })());
  kiem('3 Qua hàng rào: máy ném đắt hơn tay kẹp 1 xu (5 > 4); ngân sách 4 thì máy ném bị khóa (vuot-ngan-sach, thiếu 1 xu)', (() => { const r = LapRap.kiemCachLap(Object.assign({}, m3, { lapRap: Object.assign({}, m3.lapRap, { nganSach: 4 }) }), { than: 'hai-banh', tay: 'nem' }); return !r.ok && r.ma === 'vuot-ngan-sach' && r.thieu === 1; })());
  kiem('10 Ba lối vào kho: thân hai bánh một mình, omni một mình và hai bánh + nam châm (vật gỗ) đều vừa 5 xu nhưng KHÔNG tới được cờ', ['hai-banh', 'omni'].every((t) => kyLa(m10, { than: t }) === null) && kyLa(m10, { than: 'hai-banh', tay: 'nam-cham' }) === null);
  kiem('ghép sai bị chặn ngay ở thẻ: nhện + nam châm / máy ném / súng hơi / xoay (nhện chỉ gắn tay kẹp) không có trong dsCachLap của màn 10', LapRap.dsCachLap(m10).every((c) => c.than !== 'nhen' || !c.tay || c.tay === 'kep') && LapRap.dsCachLap(m10).some((c) => c.than === 'nhen' && !c.tay));
  kiem('bộ dò tự kiểm: sân nhỏ tự dựng — xích leo thẳng bậc thang 3 nhịp, hai bánh đi vòng nhiều hơn; vật chắn khe thì không tay không tới được (null)', (() => {
    const nho = Object.assign({}, ds[0], { san: ['.....', '..F..', '.#S##', '.....', '.....'], batDau: { x: 2, y: 4, huong: 0 }, lapRap: Object.assign({}, ds[0].lapRap, { than: ['hai-banh', 'xich'], tay: [], nganSach: 4 }) });
    return DD.nhipRapTayNganNhat(nho, { than: 'xich' }, { toiDaNhip: 12 }).nhip === 3 && DD.nhipRapTayNganNhat(nho, { than: 'hai-banh' }, { toiDaNhip: 12 }).nhip > 3;
  })());
  kiem('bộ dò: giới hạn toiDaTrangThai nhỏ → catNgang true (không kết luận)', DD.nhipRapTayNganNhat(ds[4], ds[4].lapRap.cachLap[1], { toiDaNhip: 20, toiDaTrangThai: 50 }).catNgang === true);
}

/* --------------------------------------------------------------------- 5. giao diện */
console.log('5. giao diện (tệp)');
{
  const html = doc('game/choi.html'), hieu = doc('game/huy-hieu.js'), kh = doc('kiem-hoc.mjs');
  kiem('choi.html nạp man-rap-tay.js (sau man-che-may-nem.js, trước man-drone.js), sau lap-rap.js', /src="\.\.\/man-rap-tay\.js"/.test(html) && html.indexOf('man-rap-tay.js') > html.indexOf('man-che-may-nem.js') && html.indexOf('man-rap-tay.js') < html.indexOf('man-drone.js') && html.indexOf('lap-rap.js') < html.indexOf('man-rap-tay.js'));
  kiem("huy-hieu.js có HINH['rap-tay']", /HINH\['rap-tay'\]/.test(hieu));
  kiem('kiem-hoc.mjs nạp man-rap-tay.js, có nhánh nhipTat cho chương rap-tay và dùng kho thật cho chương này', /man-rap-tay\.js/.test(kh) && /nhipRapTayTatCa/.test(kh) && /m\.chuong === 'rap-tay'/.test(kh));
  kiem('lap-rap.js có khoMau (kho tham chiếu) và kiemCanMan nhận kho', typeof LapRap.khoMau === 'function' && LapRap.khoMau(ds[0]).length > 90 && LapRap.khoMau(ds[0]).every((h) => h.ten && Array.isArray(h.than)));
  kiem('kho tham chiếu lúc tới màn gồm các hàm cần dùng: forward · pick · drop · turn_right · back · u_turn · carry_throw · slide_r · pick_left · jet_fwd · jump · tr_right · bend_left · leap',
    ['forward', 'pick', 'drop', 'turn_right', 'turn_left', 'back', 'u_turn', 'carry_throw', 'toss', 'slide_r', 'slide_l', 'pick_left', 'drop_right', 'jet_fwd', 'jet_back', 'jump', 'go', 'walk', 'leap', 'tr_right', 'bend_left'].every((t) => LapRap.khoMau(ds[0]).some((h) => h.ten === t)));
  kiem('kho tham chiếu KHÔNG có hàm của chương sau (drone: recharge, airlift; flycam: seek_red)', ['recharge', 'airlift', 'seek_red'].every((t) => !LapRap.khoMau(ds[0]).some((h) => h.ten === t)));
}

/* --------------------------------------------------------------------- bảng tóm tắt */
console.log('\n  Bảng 10 màn rap-tay (xu · nhịp mẫu · ô mẫu · sao · BFS nhịp ngắn nhất của robot đó)');
for (const { m, tk } of BANG) {
  console.log('  ' + m.id.padEnd(5) + ' ' + m.ten + ' — ngân sách ' + m.lapRap.nganSach + ' xu, sao.nhip ' + m.sao.nhip + ', sao.o ' + m.sao.o + (m.nhipTheoLoiGiai ? ' (nhipTheoLoiGiai)' : ''));
  const bf = KQ_BFS.find((x) => x.m === m);
  tk.forEach((x, i) => {
    const h = bf.hang.find((y) => y.mau === i);
    console.log('       ' + (i === 0 ? '★ ' : '  ') + x.ten.padEnd(26) + String(x.gia).padStart(2) + ' xu · ' + String(x.nhip).padStart(2) + ' nhịp · ' + String(x.o).padStart(2) + ' ô · ' + x.sao + ' sao · BFS ' + (h ? h.kq.nhip : '?'));
  });
  const khac = bf.hang.filter((h) => h.mau < 0);
  console.log('       (còn ' + khac.length + ' cách lắp khác vừa ngân sách: ' + khac.map((h) => h.c.than + (h.c.tay ? '+' + h.c.tay : '') + (h.kq.nhip === null ? ' (> ' + h.gioiHan + ')' : ' = ' + h.kq.nhip)).join(' · ') + ')');
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
