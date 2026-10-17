/* ============================================================================
   kiem-rap-nao.mjs — máy kiểm chương `rap-nao` (Lắp ráp: Thân + Não, 10 màn) của "Đường học" (KE-HOACH-LAP-RAP.md; lõi lap-rap.js; bộ dò do-duong-rap-nao.mjs). Gồm:
   1. dữ liệu chương: 10 màn đúng hàng (3 làm quen · 3 luyện · 3 biến thể · 1 trùm có huy hiệu), thân chỉ hai bánh · xích · omni · nhện, não chỉ khoảng cách · màu · camera,
      không khe tay, không drone / cảm biến từ, sân chỉ dùng ký hiệu đã gặp tới gói Cảm biến màu, sân ≤ 7 × 9, màn có não là màn 3 sân (còn lại một sân);
   2. cân màn: mọi màn qua LapRap.kiemCanMan (≥ 2 cách mẫu đều thắng bằng lời giải chạy thật, cachLap[0] ba sao, không cách mẫu nào hơn hẳn cách khác), lời giải mẫu vừa khung, đúng sao.o / sao.nhip;
   2b. NGƯỠNG Ô (sao.o): lời giải TỰ NHIÊN dùng hàm có sẵn trong kho lúc tới chương (move, forward, slide_r, to_gap, read_turn, go / walk, sidestep…; man.loiGiaiHam) cũng đạt 3 sao trên kho THẬT lẫn kho CỔ ĐIỂN
      (kho cổ điển không nhận bản sửa turn_left / u_turn của che-xe, như kiem-hoc.mjs), cho cùng ô / nhịp ở hai kho; sao.o = max(ô lời giải thuần của cachLap[0], ô lời giải dùng hàm đầu tiên);
      lời giải mặc định của màn (m.loiGiai) là bên nhiều ô hơn, chạy kho cổ điển ra đúng sao.o ô và sao.nhip nhịp; loiGiaiKhac vẫn nhiều ô hơn ngưỡng mới;
   3. BFS CHO MỌI CÁCH LẮP vừa ngân sách (LapRap.dsCachLap): nhịp ngắn nhất theo thân (hay không tới được), không thân nào đi ít nhịp hơn sao.nhip — riêng nhện được "nhảy cóc"
      (co chân rồi duỗi chân cùng bước đi = bật qua một ô) nên màn khai nhipTheoLoiGiai thì chỉ nhện được dưới ngưỡng; mọi cách mẫu chạy không ít nhịp hơn BFS của thân của nó;
   4. bộ dò hai bánh đối chiếu SanHoc.chay (đường BFS đổi thành lệnh gốc thắng đúng nhịp; chương trình ngẫu nhiên không bao giờ thắng sớm hơn BFS);
   5. bẫy có chủ ý: thân không tới được cờ (BFS null), thẻ quá ngân sách, ghép sai (nhện + khoảng cách…), chương trình "mù" (không cảm biến) không thắng cả ba sân;
   6. giao diện: huong-dan-man.js có hướng dẫn màn Lắp robot ở màn đầu, huy hiệu 'rap-nao', choi.html nạp man-rap-nao.js, kiem-hoc.mjs nạp chương và có nhánh dò đường.
   Id màn KHÔNG ghi cứng số chương: ThuTu.thuTu.indexOf('rap-nao') + 1.
   Chạy: node robotics/hoc/kiem-rap-nao.mjs        (trượt thì thoát mã 1)
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
const KhoHam = require(path.join(day, 'kho-ham.js'));
let ManHoc = null;
for (const f of fs.readdirSync(day).filter((x) => /^man-.*[.]js$/.test(x)).sort()) {
  try { ManHoc = require(path.join(day, f)); } catch (e) { console.log('  (không nạp được ' + f + ': ' + String(e.message).split('\n')[0] + ')'); }
}
const DD = await import('./do-duong-rap-nao.mjs');

// KHO lúc tới màn đầu chương rap-nao, dựng như kiem-hoc.mjs: hàm của em mà các màn đứng trước tạo / sửa (màn tietKiemNhip chỉ sửa riêng).
// Kho THẬT nhận mọi bản sửa; kho CỔ ĐIỂN không nhận bản sửa hàm cũ ở các chương che-xe, che-tay… (turn_left, u_turn khác nhau).
const CHUONG_SUA = new Set(['che-xe', 'che-tay', 'robot-hoan-thien', 'che-nam-cham', 'che-sung-hoi', 'che-may-nem', 'rap-tay']);
const tenCotTruyen = [...new Set(ManHoc.danhSach.flatMap((x) => x.taoHam))];
const khoThatH = KhoHam.moi({ tenCoDinh: tenCotTruyen }), khoCoH = KhoHam.moi({ tenCoDinh: tenCotTruyen });
for (const x of ManHoc.danhSach) {
  if (x.ma === 'rap-nao.1') break;
  for (const h of x.loiGiai.hamCuaEmMoi) {
    if (x.tietKiemNhip === true && khoThatH.tim(h.ten)) continue;
    if (!khoThatH.tim(h.ten)) khoThatH.tao(h.ten, h.thamSo, { taoHam: x.taoHam });
    khoThatH.sua(h.ten, h.than);
    if (!CHUONG_SUA.has(x.chuong) || !khoCoH.tim(h.ten)) { if (!khoCoH.tim(h.ten)) khoCoH.tao(h.ten, h.thamSo, { taoHam: x.taoHam }); khoCoH.sua(h.ten, h.than); }
  }
}
const KHO = { that: khoThatH.ds(), coDien: khoCoH.ds() };

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const doc = (f) => fs.readFileSync(path.join(day, f), 'utf8');
const ds = ManHoc.danhSach.filter((m) => m.chuong === 'rap-nao');
const soChuong = ThuTu.thuTu.indexOf('rap-nao') + 1;                     // KHÔNG ghi cứng số chương: id tự tính theo vị trí
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const THAN = ['hai-banh', 'xich', 'omni', 'nhen'], NAO = ['khoang-cach', 'mau', 'camera'];

/* --------------------------------------------------------------------- 1. dữ liệu chương */
console.log('1. dữ liệu chương (' + ds.length + ' màn, chương số ' + soChuong + ')');
kiem('đúng 10 màn, mã rap-nao.1 … rap-nao.10, id bắt đầu bằng số chương', ds.length === 10 && ds.every((m, i) => m.ma === 'rap-nao.' + (i + 1) && m.id === soChuong + '.' + (i + 1)), ds.map((m) => m.id).join());
kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn trùm có huy hiệu "rap-nao"',
  J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
  ds.every((m) => (m.so === 10) === !!m.huyHieu) && ds[9].huyHieu.ma === 'rap-nao' && /Lắp ráp/.test(ds[9].huyHieu.ten));
kiem('chương nằm trong gói riêng "rap-nao" ngay sau gói Cảm biến màu (thứ tự chương: sau che-mau)', ThuTu.thuTu.indexOf('rap-nao') === ThuTu.thuTu.indexOf('che-mau') + 1 && ThuTu.goi.some((g) => g.ma === 'rap-nao' && g.chuong.length === 1 && g.chuong[0] === 'rap-nao'));
kiem('mọi màn là màn lắp ráp: có lapRap, bỏ khe tay (tay rỗng), thân ⊆ {hai bánh, xích, omni, nhện}, não ⊆ {khoảng cách, màu, camera}, ngân sách nguyên ≥ 1',
  ds.every((m) => m.lapRap && J(m.lapRap.tay) === '[]' && m.lapRap.than.every((t) => THAN.includes(t)) && m.lapRap.camBien.every((c) => NAO.includes(c)) && Number.isInteger(m.lapRap.nganSach) && m.lapRap.nganSach >= 1 && !(m.lapRap.phaiCo || []).length));
kiem('không màn nào dùng drone, cảm biến từ, camera bụng, tay (các cách mẫu cũng vậy)',
  ds.every((m) => m.lapRap.cachLap.every((c) => THAN.includes(c.than) && !c.tay && (!c.camBien || NAO.includes(c.camBien)))));
kiem('khe não chỉ có ở màn nhiều sân (5, 6, 9, 10); màn một sân (1, 2, 3, 4, 7, 8) ẩn khe não: không gắn não thì chạy được, nên gắn thêm chỉ phí xu',
  ds.every((m) => (m.lapRap.camBien.length > 0) === [5, 6, 9, 10].includes(m.so) && Array.isArray(m.san[0]) === [5, 6, 9, 10].includes(m.so)));
kiem('màn nhiều sân: 3 sân cùng cỡ, batDau song song, nhipTheo "tong"; màn một sân không có nhipTheo',
  ds.every((m) => Array.isArray(m.san[0]) ? m.san.length === 3 && Array.isArray(m.batDau) && m.batDau.length === 3 && m.nhipTheo === 'tong' && m.san.every((s) => s.length === m.san[0].length && s[0].length === m.san[0][0].length) : m.nhipTheo === undefined && !Array.isArray(m.batDau)));
kiem('sân tối đa 7 cột × 9 hàng', ds.every((m) => dsSan(m).every((s) => s.length <= 9 && s.every((h) => h.length <= 7))));
const KY_HIEU = new Set('.#FSnu=<>^vrgbyo'.split(''));
kiem('sân chỉ dùng ký hiệu đã gặp tới gói Cảm biến màu (. # F S n u = băng chuyền ô màu; vật o chỉ làm hộp chỉ đường có màu ở màn 9, 10); không đích, thùng, nút, cửa, ô sạc',
  ds.every((m) => dsSan(m).every((s) => s.every((h) => h.split('').every((c) => KY_HIEU.has(c) && (c !== 'o' || [9, 10].includes(m.so))))) && (!/o/.test(dsSan(ds[8]).join('')) ? false : true)));
kiem('mọi sân có đúng một cờ F và xe xuất phát trên ô đi được (không tường, không hố)',
  ds.every((m) => dsSan(m).every((s, i) => { const k = s.join(''); const bd = Array.isArray(m.batDau) ? m.batDau[i] : m.batDau; return (k.match(/F/g) || []).length === 1 && '.rgbyvS^<>'.includes(s[bd.y][bd.x]); })));
kiem('hamGoc / loaiRobot / robot mặc định theo cachLap[0] (ManHoc.chuanHoa → LapRap.macDinh); khung 10 dòng chương trình chính và 10 ô mỗi hàm, Xưởng mở, được dùng hàm của em, đủ for / if / while',
  ds.every((m) => { const c0 = LapRap.chuanCach(m.lapRap.cachLap[0]); const a = LapRap.apDung(m, c0); return m.loaiRobot === a.loaiRobot && J(m.robot) === J(a.robot) && J(m.hamGoc) === J(a.hamGoc) && m.moXuong === true && m.camHamCuaEm === false && m.khung.moiHam === 10 && m.khung.chinh === 10 && J(m.cauTruc) === '["for","if","while"]'; }));
kiem('thân mặc định theo cachLap[0] đúng như thiết kế: xích · omni · nhện · xích · omni · hai bánh · nhện · nhện · omni · xích',
  J(ds.map((m) => m.lapRap.cachLap[0].than)) === J(['xich', 'omni', 'nhen', 'xich', 'omni', 'hai-banh', 'nhen', 'nhen', 'omni', 'xich']));
kiem('deBai 1–3 câu, goiY 1–2 câu, có ít nhất 2 lời sai và một loiGiaiKhac, taoHam / hamCuaEmCan rỗng (hàm của kho là tuỳ chọn)',
  ds.every((m) => (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.length >= 1 && m.goiY.length <= 2 && m.loiSai.length >= 2 && !!m.loiGiaiKhac && m.taoHam.length === 0 && m.hamCuaEmCan.length === 0));
kiem('màn 1 chỉ có hai cách mẫu xích / hai bánh, ngân sách 3 và thẻ omni (4 xu) nằm trong danh sách để dạy thanh xu',
  J(ds[0].lapRap.cachLap.map((c) => c.than)) === J(['xich', 'hai-banh']) && ds[0].lapRap.nganSach === 3 && ds[0].lapRap.than.includes('omni') && LapRap.kiemCachLap(ds[0], { than: 'omni' }).ma === 'vuot-ngan-sach' && LapRap.kiemCachLap(ds[0], { than: 'omni' }).thieu === 1);

/* --------------------------------------------------------------------- 2. cân màn + lời giải (mọi chương trình chính ≤ 10 dòng, chạy trên kho tham chiếu) */
console.log('2. cân màn (LapRap.kiemCanMan trên kho tham chiếu), lời giải mẫu / khác / công thức khác / lời sai — mọi chương trình chính ≤ 10 dòng');
const khoMau = (m) => LapRap.khoMau(m);
const maCua = (r) => r.chanDoan.map((c) => c.ma);
const LENH_GOC_OK = new Set([].concat(SanHoc.HAM_GOC.banh, SanHoc.HAM_GOC.omni, SanHoc.HAM_GOC.nhen, ['color', 'front_clear', 'right_clear', 'left_clear', 'wait', 'range']));
function tenGoi(dong) { return (dong.replace(/#.*$/, '').match(/[A-Za-z_]\w*(?=\()/g) || []); }
kiem('lapRap.dungKho ở mọi màn; lời giải mẫu không tạo / sửa hàm của em nào (hamCuaEmMoi rỗng), không hàm của màn, taoHam / hamCuaEmCan rỗng: chương không làm kho phình ra',
  ds.every((m) => m.lapRap.dungKho === true && m.taoHam.length === 0 && m.hamCuaEmCan.length === 0 && m.lapRap.cachLap.every((c) => !(c.loiGiai.hamCuaEmMoi || []).length && !(c.loiGiai.hamCuaMan || []).length) && m.loiGiai.hamCuaEmMoi.length === 0 && m.loiGiai.hamCuaMan.length === 0 && m.maMau.chinh.length === 0));
kiem('khung giao diện: khung.chinh = 10 và khung.moiHam = 10 ở cả 10 màn (khung to hơn 10 thì người chơi không gõ được)', ds.every((m) => m.khung.chinh === 10 && m.khung.moiHam === 10));
kiem('kho tham chiếu LapRap.khoMau tới chương = kho dựng trong máy kiểm (cùng tên hàm, cùng thân hàm, cùng thứ tự) và có đủ hàm lời giải mẫu dùng; không có hàm của chương sau (drone: recharge, airlift; flycam: seek_red)',
  J(khoMau(ds[0]).map((h) => [h.ten, h.than])) === J(KHO.that.map((h) => [h.ten, h.than])) &&
  ['forward', 'move', 'turn_right', 'turn_left', 'stair', 'dodge_right', 'dodge_left', 'to_gap', 'go_wall', 'read_turn', 'follow_right', 'tr_right', 'tr_left', 'sidestep', 'slide_r', 'slide_l', 'go', 'walk', 'leap'].every((t) => khoMau(ds[0]).some((h) => h.ten === t)) &&
  ['recharge', 'airlift', 'seek_red'].every((t) => !khoMau(ds[0]).some((h) => h.ten === t)));
kiem('lời giải mẫu chỉ dùng hàm của em đã có TRƯỚC chương này (kho tham chiếu) hoặc lệnh gốc / cảm biến (không tên hàm lạ)',
  ds.every((m) => { const kho = khoMau(m).map((h) => h.ten); return m.lapRap.cachLap.every((c) => c.loiGiai.chinh.every((d) => tenGoi(d).every((t) => LENH_GOC_OK.has(t) || kho.includes(t)))); }));
kiem('robot mặc định của màn (ManHoc.chuanHoa) theo cachLap[0]: loiGiai = lời giải của cachLap[0]', ds.every((m) => J(m.loiGiai.chinh) === J(m.lapRap.cachLap[0].loiGiai.chinh)));
kiem('mỗi màn ≥ 1 công thức khác (congThucKhac), có lời giải khác; không còn loiGiaiHam / loiGiaiLaHam / khungChinh (cách cũ)', ds.every((m) => Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && !!m.loiGiaiKhac && m.loiGiaiHam === undefined && m.loiGiaiLaHam === undefined && m.khungChinh === undefined));
const bangMau = [];
for (const m of ds) {
  const kho = khoMau(m);
  const loi = LapRap.kiemCanMan(m, kho);
  kiem(m.id + ' ' + m.ten + ': kiemCanMan rỗng (dữ liệu · mọi cách mẫu thắng · cachLap[0] ba sao · không cách nào hơn hẳn cách khác)', loi.length === 0, J(loi));
  const tk = LapRap.thongKeMau(m);                                      // không truyền kho: dungKho tự dùng kho tham chiếu (đúng đường đi của giao diện)
  bangMau.push({ m, tk });
  kiem(m.id + ': thongKeMau không kho (đường của giao diện) cho cùng kết quả với kho tham chiếu', J(tk.map((x) => [x.thang, x.nhip, x.o, x.sao])) === J(LapRap.thongKeMau(m, kho).map((x) => [x.thang, x.nhip, x.o, x.sao])));
  kiem(m.id + ': ' + tk.length + ' cách mẫu (≥ 2, ≤ 3), thân + não khác nhau từng đôi; cách đầu 3 sao đúng sao.nhip ' + m.sao.nhip + ' nhịp, đúng sao.o ' + m.sao.o + ' ô',
    tk.length >= 2 && tk.length <= 3 && tk[0].nhip === m.sao.nhip && tk[0].o === m.sao.o && tk[0].sao === 3 && new Set(tk.map((x) => x.ten)).size === tk.length, J(tk.map((x) => [x.ten, x.gia, x.nhip, x.o, x.sao])));
  const r = ChamHoc.cham(m, m.loiGiai, kho);
  kiem(m.id + ': lời giải cách đầu thắng 3 sao, ' + r.soO + ' ô = sao.o ' + m.sao.o + ', ' + r.soNhip + ' nhịp = sao.nhip ' + m.sao.nhip + ', không chẩn đoán nào (kể cả thông tin), vừa khung',
    r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, o: r.soO, nhip: r.soNhip, cd: maCua(r) }));
  m.lapRap.cachLap.forEach((cl, i) => {
    const x = tk[i], robot = LapRap.apDung(m, cl), rr = ChamHoc.cham(robot, { chinh: cl.loiGiai.chinh.slice(), hamCuaMan: [] }, kho);
    kiem(m.id + ' cách mẫu #' + (i + 1) + ' (' + x.ten + ', ' + x.gia + ' xu): thắng, ' + x.nhip + ' nhịp, ' + x.o + ' ô, ' + x.sao + ' sao, không chẩn đoán lỗi, vừa khung (' + cl.loiGiai.chinh.length + ' dòng ≤ 10)',
      x.thang && rr.thang && x.nhip === rr.soNhip && x.o === rr.soO && !rr.chanDoan.some((c) => c.muc === 'loi') && !maCua(rr).includes('tran-khung') && cl.loiGiai.chinh.length <= 10 && x.gia <= m.lapRap.nganSach && (i === 0 ? x.sao === 3 : x.sao <= 2), J({ thang: x.thang, sao: x.sao, cd: maCua(rr) }));
    const a = ChamHoc.cham(robot, { chinh: cl.loiGiai.chinh.slice(), hamCuaMan: [] }, KHO.that), b = ChamHoc.cham(robot, { chinh: cl.loiGiai.chinh.slice(), hamCuaMan: [] }, KHO.coDien);
    kiem(m.id + ' cách mẫu #' + (i + 1) + ' gọi hàm của kho và chạy GIỐNG HỆT trên kho THẬT lẫn kho CỔ ĐIỂN (cùng thắng, ô, nhịp, hàm dùng; turn_left / u_turn khác nhau giữa hai kho không làm lệch)',
      a.hamDaDung.length >= 1 && a.thang === b.thang && a.soO === b.soO && a.soNhip === b.soNhip && a.sao === b.sao && J(a.hamDaDung) === J(b.hamDaDung), J({ that: [a.soO, a.soNhip], co: [b.soO, b.soNhip] }));
  });
  const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, kho);
  kiem(m.id + ': lời giải khác (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, ' + m.loiGiaiKhac.baiLam.chinh.length + ' dòng ≤ 10, không chẩn đoán',
    rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && rk.chanDoan.length === 0 && m.loiGiaiKhac.baiLam.chinh.length <= 10 && J(m.loiGiaiKhac.baiLam.chinh) !== J(m.loiGiai.chinh), J({ sao: rk.sao, o: rk.soO, nhip: rk.soNhip, cd: maCua(rk) }));
  m.congThucKhac.forEach((c, i) => {
    const rc = ChamHoc.cham(m, c.baiLam, kho);
    kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không chẩn đoán lỗi, ≤ 10 dòng — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && !rc.chanDoan.some((x) => x.muc === 'loi') && !maCua(rc).includes('tran-khung') && c.baiLam.chinh.length <= 10, J({ thang: rc.thang, cd: maCua(rc) }));
  });
  // LỜI GIẢI TỰ NHIÊN: mọi biến thể tự nhiên (dat3sao) đạt 3 sao trên kho thật lẫn kho cổ điển với cùng kết quả; sao.o = ô lớn nhất trong các cách viết tự nhiên (cách đầu)
  const tenKho = kho.map((h) => h.ten);
  const dungHam = (chinh) => chinh.some((d) => tenGoi(d).some((t) => tenKho.includes(t)));
  const tuNhien = m.congThucKhac.filter((c) => c.dat3sao);
  const rTN = tuNhien.map((c) => ChamHoc.cham(m, c.baiLam, kho));
  kiem(m.id + ': lời giải cách đầu dùng hàm có sẵn trong kho (' + (tenGoi(m.loiGiai.chinh.join('\n')).filter((t) => tenKho.includes(t)).join(', ') || 'không') + '); có ≥ 1 biến thể tự nhiên khác (dat3sao)', dungHam(m.loiGiai.chinh) && tuNhien.length >= 1);
  tuNhien.forEach((c, i) => {
    const that = ChamHoc.cham(m, c.baiLam, KHO.that), co = ChamHoc.cham(m, c.baiLam, KHO.coDien);
    kiem(m.id + ' biến thể tự nhiên #' + (i + 1) + ' (' + c.moTa + (dungHam(c.baiLam.chinh) ? ', dùng hàm' : ', thuần lệnh gốc') + '): thắng ' + rTN[i].sao + ' sao, ' + rTN[i].soO + ' ô ≤ sao.o ' + m.sao.o + ', ' + rTN[i].soNhip + ' nhịp ≤ sao.nhip ' + m.sao.nhip + ', ' + c.baiLam.chinh.length + ' dòng ≤ 10, không chẩn đoán, cùng kết quả ở kho thật và kho cổ điển',
      [rTN[i], that, co].every((x) => x.thang && x.sao === 3 && x.soO <= m.sao.o && x.soNhip <= m.sao.nhip && x.chanDoan.length === 0) && c.baiLam.chinh.length <= 10 && that.soO === co.soO && that.soNhip === co.soNhip, J({ sao: rTN[i].sao, o: rTN[i].soO, nhip: rTN[i].soNhip, cd: maCua(rTN[i]) }));
  });
  kiem(m.id + ': sao.o ' + m.sao.o + ' = ô của lời giải cách đầu = ô lớn nhất trong các cách viết tự nhiên (' + [r.soO].concat(rTN.map((x) => x.soO)).join(', ') + ')', r.soO === m.sao.o && rTN.every((x) => x.soO <= r.soO));
  const khoCo = ChamHoc.cham(m, m.loiGiai, KHO.coDien), khoTh = ChamHoc.cham(m, m.loiGiai, KHO.that);
  kiem(m.id + ': lời giải mặc định (cách đầu) cho cùng ô, nhịp, sao ở kho cổ điển (đường kiem-hoc.mjs) và kho thật', khoCo.thang && khoCo.sao === 3 && khoCo.soO === m.sao.o && khoCo.soNhip === m.sao.nhip && khoTh.soO === khoCo.soO && khoTh.soNhip === khoCo.soNhip);
  m.loiSai.forEach((ls, i) => {
    const rs = ChamHoc.cham(m, ls.baiLam, kho);
    const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
    kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không thắng 3 sao, có mã ' + ls.phaiCoMa.join('+') + ', ' + ls.baiLam.chinh.length + ' dòng ≤ 10 (không tràn khung)', rs.sao < 3 && thieu.length === 0 && ls.baiLam.chinh.length <= 10 && !co.includes('tran-khung'), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
  });
  kiem(m.id + ': mọi cách mẫu nằm trong dsCachLap (vừa ngân sách ' + m.lapRap.nganSach + ' xu) và mỗi cách có ghiChu nói đánh đổi', m.lapRap.cachLap.every((cl) => LapRap.dsCachLap(m).some((x) => x.than === cl.than && x.tay === (cl.tay || null) && x.camBien === (cl.camBien || null)) && typeof cl.ghiChu === 'string' && cl.ghiChu.length >= 20));
}
console.log('\n   bảng cách lắp mẫu (giá · nhịp · ô · sao; ô kiểu ngưỡng, dùng hàm của kho)');
for (const { m, tk } of bangMau) console.log('   ' + m.id.padEnd(5) + m.ten.padEnd(22) + tk.map((x) => x.ten + ' ' + x.gia + 'xu/' + x.nhip + 'n/' + x.o + 'ô/' + x.sao + '★').join('  ·  '));
console.log('\n   ngưỡng ô (sao.o · sao.nhip · số dòng chương trình chính của cách đầu · ô các biến thể 3★)');
for (const { m } of bangMau) console.log('   ' + m.id.padEnd(5) + m.ten.padEnd(22) + ('sao.o ' + m.sao.o).padEnd(10) + ('sao.nhip ' + m.sao.nhip).padEnd(13) + m.loiGiai.chinh.length + ' dòng · ' + m.congThucKhac.filter((c) => c.dat3sao).map((c) => ChamHoc.cham(m, c.baiLam, khoMau(m)).soO + 'ô').join(', '));

/* --------------------------------------------------------------------- 3. BFS mọi cách lắp */
console.log('\n3. BFS cho mọi cách lắp vừa ngân sách');
const bangBfs = [];
for (const { m } of bangMau) {
  const ds2 = LapRap.dsCachLap(m);
  const theoThan = {};
  for (const c of ds2) if (theoThan[c.than] === undefined) theoThan[c.than] = DD.nhipTheoCach(m, c);
  bangBfs.push({ m, theoThan, n: ds2.length });
  const duoi = Object.keys(theoThan).filter((t) => theoThan[t] !== null && theoThan[t] < m.sao.nhip);
  const b0 = theoThan[m.lapRap.cachLap[0].than];
  const hoiNhen = m.nhipTheoLoiGiai === true;
  kiem(m.id + ': ' + ds2.length + ' cách lắp vừa ngân sách; nhịp ngắn nhất theo thân ' + J(theoThan), ds2.length >= 2);
  kiem(m.id + ': BFS của cách 3 sao ' + (hoiNhen ? '≤' : '=') + ' sao.nhip (' + b0 + ' / ' + m.sao.nhip + '): không có đường tắt', b0 !== null && (hoiNhen ? b0 <= m.sao.nhip : b0 === m.sao.nhip), String(b0));
  kiem(m.id + ': không thân nào đi ít nhịp hơn sao.nhip ' + m.sao.nhip + (hoiNhen ? ' (trừ nhện nhảy cóc: ' + (duoi.join() || 'không') + ')' : ''),
    hoiNhen ? duoi.length > 0 && duoi.every((t) => t === 'nhen') : duoi.length === 0, J({ duoi, theoThan }));
  const mau = m.lapRap.cachLap.map((cl) => ({ cl, tk: bangMau.find((b) => b.m === m).tk[m.lapRap.cachLap.indexOf(cl)] }));
  kiem(m.id + ': mỗi cách mẫu chạy không ít nhịp hơn BFS của thân của nó (BFS thân → nhịp mẫu)', mau.every(({ cl, tk }) => theoThan[cl.than] !== null && tk.nhip >= theoThan[cl.than]), J(mau.map(({ cl, tk }) => [cl.than, theoThan[cl.than], tk.nhip])));
  kiem(m.id + ': cách mẫu 3 sao dùng thân có đường ngắn nhất (hoặc ngắn nhất trong các thân vừa ngân sách không tính nhện nhảy cóc)',
    Object.keys(theoThan).filter((t) => theoThan[t] !== null && t !== 'nhen').every((t) => theoThan[t] >= (m.lapRap.cachLap[0].than === 'nhen' ? 0 : b0)) || m.lapRap.cachLap[0].than === 'nhen', J(theoThan));
}
kiem('cờ "nhipTheoLoiGiai" có lý do: chỉ màn nào có thân dưới ngưỡng mới khai (7, 8, 10)', J(ds.filter((m) => m.nhipTheoLoiGiai === true).map((m) => m.so)) === J([7, 8, 10]) && bangBfs.every(({ m, theoThan }) => (m.nhipTheoLoiGiai === true) === Object.keys(theoThan).some((t) => theoThan[t] !== null && theoThan[t] < m.sao.nhip)));
console.log('\n   bảng BFS (nhịp ngắn nhất theo thân; null = không tới được)');
for (const { m, theoThan, n } of bangBfs) console.log('   ' + m.id.padEnd(5) + m.ten.padEnd(22) + ('ngân sách ' + m.lapRap.nganSach).padEnd(14) + n + ' cách · ' + J(theoThan));

/* --------------------------------------------------------------------- 4. bộ dò hai bánh đối chiếu SanHoc.chay */
console.log('\n4. bộ dò hai bánh đối chiếu SanHoc.chay');
let sai = [];
for (const m of ds) {
  const a = LapRap.apDung(m, { than: 'hai-banh' });
  dsSan(m).forEach((s, i) => {
    const con = DD.manCuaSan(a, i);
    const r = DD.nhipBanh(con);
    if (r.nhip === null) return;
    const kq = SanHoc.chay({ san: con.san, batDau: con.batDau, loaiRobot: 'banh', hamGoc: a.hamGoc, mau: con.mau, vatMau: con.vatMau }, DD.chuoiBanhThanhMa(r.chuoi));
    if (!(kq.thang && kq.nhip === r.nhip)) sai.push(m.id + ' sân ' + (i + 1) + ': BFS ' + r.nhip + ' ≠ chạy ' + (kq.thang ? kq.nhip : 'thua'));
  });
}
kiem('đường BFS hai bánh đổi thành lệnh gốc thắng đúng nhịp ở mọi sân của mọi màn', sai.length === 0, sai.join(' | '));
function ngauNhien(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
const MA_LENH = ['left_move()\nright_move()\n', 'left_back()\nright_back()\n', 'left_move()\n', 'right_move()\n', 'left_back()\n', 'right_back()\n', 'left_move()\nright_back()\n', 'left_back()\nright_move()\n', ''];
let nhanh = 0, thangNN = 0;
for (const m of ds) {
  const a = LapRap.apDung(m, { than: 'hai-banh' }), r = ngauNhien(m.so * 7919);
  dsSan(m).forEach((s, i) => {
    const con = DD.manCuaSan(a, i), bfs = DD.nhipBanh(con).nhip;
    for (let k = 0; k < 120; k++) {
      let code = ''; const n = 5 + Math.floor(r() * 50);
      for (let j = 0; j < n; j++) code += MA_LENH[Math.floor(r() * MA_LENH.length)] + 'wait()\n';
      const kq = SanHoc.chay({ san: con.san, batDau: con.batDau, loaiRobot: 'banh', hamGoc: a.hamGoc, mau: con.mau, vatMau: con.vatMau }, code);
      if (kq.thang) { thangNN++; if (bfs === null || kq.nhip < bfs) nhanh++; }
    }
  });
}
kiem('chương trình hai bánh ngẫu nhiên (3600 lượt) không bao giờ thắng sớm hơn BFS (' + thangNN + ' lượt thắng)', nhanh === 0, String(nhanh));

/* --------------------------------------------------------------------- 5. bẫy có chủ ý */
console.log('\n5. bẫy có chủ ý');
const bfsCua = (so) => bangBfs.find((b) => b.m.so === so).theoThan;
kiem('màn 4 (ngược dòng): bánh omni vừa ngân sách nhưng KHÔNG tới được cờ (băng đẩy omni mỗi nhịp), hai bánh bị chậm hơn xích', bfsCua(4).omni === null && bfsCua(4)['hai-banh'] > bfsCua(4).xich && LapRap.kiemCachLap(ds[3], { than: 'omni' }).ok);
kiem('màn 10 (kho hàng): hai bánh và omni không leo được bậc thang (không tới được cờ); xích và nhện tới được', bfsCua(10)['hai-banh'] === null && bfsCua(10).omni === null && bfsCua(10).xich > 0 && bfsCua(10).nhen > 0);
kiem('màn 1: hai bánh đi vòng chậm hơn xích; màn 3 và 7: nhện đi tắt qua gầm', bfsCua(1)['hai-banh'] > bfsCua(1).xich && bfsCua(3).nhen < bfsCua(3)['hai-banh'] && bfsCua(7).nhen < bfsCua(7).xich && bfsCua(7).xich < bfsCua(7)['hai-banh']);
kiem('màn 2: omni nhanh hơn hai bánh và xích (trượt ngang); màn 5: omni nhanh hơn hai bánh', bfsCua(2).omni < bfsCua(2)['hai-banh'] && bfsCua(2)['hai-banh'] < bfsCua(2).xich && bfsCua(5).omni < bfsCua(5)['hai-banh']);
kiem('ghép sai báo lý do: nhện + cảm biến khoảng cách (màn 10); ô thẻ vẫn là bẫy với người chơi không đọc',
  !LapRap.kiemGhep({ than: 'nhen', camBien: 'khoang-cach' }).ok && /hướng mặt/.test(LapRap.kiemGhep({ than: 'nhen', camBien: 'khoang-cach' }).lyDo) && !LapRap.kiemCachLap(ds[9], { than: 'nhen', camBien: 'khoang-cach' }).ok);
kiem('mọi màn có não: cách "không gắn" và cách gắn cảm biến sai việc (màu bụng ở màn 5) vẫn vừa ngân sách, nên người chơi chọn được rồi thua',
  [5, 6, 9, 10].every((so) => { const m = ds[so - 1]; return LapRap.dsCachLap(m).some((c) => !c.camBien) && LapRap.dsCachLap(m).some((c) => c.camBien && !m.lapRap.cachLap.some((cl) => cl.camBien === c.camBien && cl.than === c.than)); }));
// chương trình "mù" (không gắn cảm biến): một dãy lệnh cố định chạy giống nhau ở cả ba sân (đâm tường không mất gì nên dãy "đệm" vẫn thắng được, nhưng rất tốn nhịp).
// Dijkstra trên bộ ba trạng thái, chi phí = số sân chưa thắng ở mỗi nhịp (khớp nhipTheo 'tong'). Cảm biến phải THẮNG chương trình mù cùng thân.
const bangMu = [];
for (const m of ds.filter((x) => Array.isArray(x.san[0]))) {
  const mauCuaThan = {};
  for (const th of m.lapRap.than) {
    if (!LapRap.dsCachLap(m).some((c) => c.than === th && !c.camBien)) continue;
    const r = DD.chuongTrinhMuTotNhat(LapRap.apDung(m, { than: th }), 150);
    mauCuaThan[th] = r;
  }
  bangMu.push({ m, mauCuaThan });
  const ten = Object.keys(mauCuaThan).map((t) => t + ':' + (mauCuaThan[t].tong === null ? 'không thắng được' : mauCuaThan[t].tong + ' nhịp')).join(' · ');
  kiem(m.id + ': chương trình mù tốt nhất theo thân (' + ten + ') không bị cắt ngang và không thể ba sao (tổng nhịp > sao.nhip ' + m.sao.nhip + ')',
    Object.values(mauCuaThan).every((r) => !r.catNgang && (r.tong === null || r.tong > m.sao.nhip)), J(mauCuaThan));
  const yeu = m.lapRap.cachLap.filter((cl) => cl.camBien && cl.than !== 'nhen' && mauCuaThan[cl.than] !== undefined).map((cl, i) => ({ cl, tk: bangMau.find((b) => b.m === m).tk[m.lapRap.cachLap.indexOf(cl)] }))
    .filter(({ cl, tk }) => !(mauCuaThan[cl.than].tong === null || mauCuaThan[cl.than].tong > tk.nhip));
  kiem(m.id + ': mọi cách mẫu có cảm biến (trừ nhện: nhảy cóc làm dãy mù ngắn hơn, nhưng dài hàng chục dòng) đều nhanh hơn chương trình mù tốt nhất của CÙNG thân', yeu.length === 0, J(yeu.map(({ cl, tk }) => [cl.than, cl.camBien, tk.nhip, mauCuaThan[cl.than].tong])));
}
console.log('\n   chương trình mù tốt nhất (tổng nhịp ba sân; null = không có dãy mù nào thắng cả ba)');
for (const { m, mauCuaThan } of bangMu) console.log('   ' + m.id.padEnd(5) + m.ten.padEnd(22) + J(Object.fromEntries(Object.entries(mauCuaThan).map(([t, r]) => [t, r.tong]))));

/* --------------------------------------------------------------------- 6. giao diện + nối máy kiểm */
console.log('\n6. giao diện · nối máy kiểm');
const hdm = doc('game/huong-dan-man.js'), huy = doc('game/huy-hieu.js'), html = doc('game/choi.html'), kh = doc('kiem-hoc.mjs'), lap = doc('game/man-lap.js');
kiem('huong-dan-man.js: hướng dẫn màn Lắp robot cho ' + ds[0].ma + ' (khe thân, thẻ part, thanh xu, nút Lắp xong)', /H\['rap-nao\.1'\]/.test(hdm) && /lap-xong/.test(hdm) && /lr-xu/.test(hdm) && /lr-the/.test(hdm));
kiem('man-lap.js gọi HuongDan.vaoMan khi vào màn Lắp robot và dừng khi Lắp xong', /HuongDan\.vaoMan/.test(lap) && /HuongDan\.(xongMan|dung)/.test(lap));
kiem("huy-hieu.js: có hình HINH['rap-nao']", /HINH\['rap-nao'\]/.test(huy));
kiem('choi.html nạp man-rap-nao.js', /src="\.\.\/man-rap-nao\.js"/.test(html));
kiem('kiem-hoc.mjs: nạp man-rap-nao.js, bộ dò đường của chương (nhipRapNaoTatCa) và ghi chương vào danh sách kiểm', /man-rap-nao\.js/.test(kh) && /nhipRapNaoTatCa/.test(kh) && /do-duong-rap-nao/.test(kh) && /'rap-nao'/.test(kh));

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
