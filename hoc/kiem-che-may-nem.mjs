/* ============================================================================
   kiem-che-may-nem.mjs — máy kiểm chương `che-may-nem` (Chế lệnh máy ném) của "Robot Chấn Hưng" (KE-HOACH-CHE-LENH.md, mục 5c.5).
   Gồm:
   - luật lõi máy ném mà chương dựa vào: rổ CHỞ vật đi theo xe, load / throw mỗi lệnh một nhịp riêng và xe đứng yên, ném bay qua rào / tường và vỡ ở ô cấm, bóng mờ có vật mờ chấm theo màu,
     camera color() đọc ô trước mặt (nạp xong thì ô trống: "none");
   - màn hỏng (phanCung chỉ còn left_move và wait): gọi lệnh hỏng → lenh-goc-hong, hàm side_throw đã chế bị hỏng vì quay trái;
   - Sổ lệnh có đủ năm hàm mới (so-lenh.js; fixed_toss, go_load, undo_load là HÀM CỦA MÀN nên không có ở đó, không vào kho);
   - 10 màn che-may-nem: lời giải 3 sao, mọi công thức khác thắng, lời giải khác đúng 2 sao, lời sai đúng mã, chinhCoDinh chặn chương trình chính gửi lên,
     nhịp: đường ngắn nhất BFS (do-duong-che-may-nem.mjs) khớp sao.nhip;
   - đường BFS đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS; SO CHÉO NGẪU NHIÊN: hơn một nghìn chương trình ngẫu nhiên chạy trên SanHoc.chay và trên bộ dò cho cùng trạng thái cuối;
   - thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs. Luật máy ném chi tiết: kiem-may-nem.mjs.
   Chạy: node hoc/kiem-che-may-nem.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
let ManHoc = require(path.join(day, 'man-chuoi-1.js'));
for (const f of fs.readdirSync(day).filter((n) => /^man-.*\.js$/.test(n) && n !== 'man-chuoi-1.js').sort()) ManHoc = require(path.join(day, f));
const DoDuong = await import('./do-duong-che-may-nem.mjs');
const { nhipCheMayNemNganNhat, nhipCheMayNemTatCa, chuoiThanhMa } = DoDuong;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-may-nem');
const man = (so) => ManHoc.timMa('che-may-nem.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). id 'het' = sau cả game. */
function khoTruoc(id) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam });
      kho.sua(h.ten, h.than);
    }
  }
  return kho.ds();
}
const tron = (kho, moi) => {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
};

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const NEM = ['aim', 'throw', 'load'];
const KHAY = BANH.concat(NEM);
const KHAY_HONG = ['left_move', 'wait'].concat(NEM);
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: KHAY }, extra || {}), code);
}
const vatCua = (kq, id) => kq.vat.find((v) => v.id === id);
/** Cấu hình SanHoc.chay của sân thứ i của màn m (như ChamHoc.cham truyền xuống). */
function cfgSan(m, i, extra) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({ san: sanCua(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co',
    bongMo: lm.bongMo || undefined, mau: lm.mau, vatMau: lm.vatMau, daoChieu: m.daoChieu, camBien: m.robot.camBien, nhipToiDa: 200 }, extra || {});
}
/** Màn con MỘT sân thứ i (cho bộ dò). */
function conCua(m, i) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({}, m, { san: sanCua(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, mau: lm.mau, vatMau: lm.vatMau, bongMo: lm.bongMo || m.bongMo });
}

/* ================================================================= 1. LUẬT MÁY NÉM MÀ CHƯƠNG DỰA VÀO */
console.log('\n== 1. Luật lõi: rổ chở vật, một nhịp một lệnh tay, ném qua rào, vật mờ có màu, camera ==');
{
  const rows = ['.....', '.....', '.....', '..o..', '.....'], bd = { x: 2, y: 4, huong: 0 };
  const mv = ['left_move()', 'right_move()', 'wait()'];
  const k = chay(rows, bd, L('load()', 'wait()', ...mv, ...mv));
  kiem('load() nạp vật ở ô TRƯỚC MẶT vào rổ; xe đi hai ô thì vật ĐI THEO xe (trangThai "ro", x y = ô xe)', k.nem.ro === 1 && vatCua(k, 1).trangThai === 'ro' && vatCua(k, 1).x === 2 && vatCua(k, 1).y === 2 && k.robot.y === 2, J([k.nem, k.vat, k.robot]));
  const t3 = chay(rows, bd, L('load()', 'wait()', ...mv, ...mv, 'aim(2)', 'throw()', 'wait()'));
  kiem('đang chở vật tới (2,2) rồi throw() tầm 2: vật rơi xuống ô cách xe 2 ô theo hướng mặt, (2,0)', vatCua(t3, 1).trangThai === 'dat' && vatCua(t3, 1).x === 2 && vatCua(t3, 1).y === 0 && t3.nem.ro === null, J(t3.vat));
  const tn = chay(rows, bd, L('load()', 'wait()', ...mv, ...mv, 'aim(3)', 'throw()', 'wait()'));
  kiem('tầm 3 từ (2,2) rơi ra ngoài sân (2,-1): vật vỡ (nem-vo, lý do ngoai-san)', ev(tn, 'nem-vo').length === 1 && ev(tn, 'nem-vo')[0].lyDo === 'ngoai-san' && vatCua(tn, 1).trangThai === 'vo');
  const rao = chay(['.....', '..=..', '#.#..', '..o..', '.....'], bd, L('load()', 'wait()', 'aim(3)', 'throw()', 'wait()'));
  kiem('ném BAY QUA hàng rào: từ (2,4) tầm 3 qua (2,2)... rơi (2,1) là hàng rào nên vỡ (rao); cùng sân tầm 2 rơi (2,2) sàn trống thì nằm đó', ev(rao, 'nem-vo')[0] && ev(rao, 'nem-vo')[0].lyDo === 'rao' &&
    (() => { const r2 = chay(['.....', '..=..', '..#..', '..o..', '.....'], bd, L('load()', 'wait()', 'aim(3)', 'throw()', 'wait()')); return ev(r2, 'nem-vo')[0] && ev(r2, 'nem-vo')[0].lyDo === 'rao'; })() &&
    (() => { const r3 = chay(['.....', '.....', '..=..', '..o..', '.....'], bd, L('load()', 'wait()', 'aim(3)', 'throw()', 'wait()')); return vatCua(r3, 1).trangThai === 'dat' && vatCua(r3, 1).y === 1; })());
  const dung = chay(rows, bd, L('load()', 'left_move()', 'right_move()', 'wait()'));
  kiem('nhịp có load(): xe ĐỨNG YÊN, lệnh bánh cùng nhịp bị bỏ (nem-dung-yen, thông tin)', dung.robot.y === 4 && maSK(dung, 'nem-dung-yen').length + ev(dung, 'nem-dung-yen').length >= 1 && vatCua(dung, 1).trangThai === 'ro');
  const hai = chay(rows, bd, L('load()', 'throw()', 'wait()'));
  kiem('một nhịp tay chỉ nhận MỘT lệnh: load() rồi throw() cùng nhịp → throw bị bỏ (nem-goi-lai), vật vẫn trong rổ', (maSK(hai, 'nem-goi-lai').length + ev(hai, 'nem-goi-lai').length) >= 1 && hai.nem.ro === 1);
  const hut = chay(rows, bd, L('aim(2)', 'throw()', 'wait()'));
  kiem('throw() khi rổ trống: nem-hut (thông tin), vẫn mất một nhịp; load() khi trước mặt không có vật: nap-hut', (maSK(hut, 'nem-hut').length + ev(hut, 'nem-hut').length) >= 1 && hut.nhip === 1 &&
    (() => { const q = chay(rows, bd, L('turn_left_giua()', 'wait()').replace('turn_left_giua()', 'left_back()')); const q2 = chay(rows, bd, L('left_back()', 'wait()', 'load()', 'wait()')); return (maSK(q2, 'nap-hut').length + ev(q2, 'nap-hut').length) >= 1 && !!q; })());
  // bóng mờ: vật mờ có màu, vật trong rổ chưa tính
  const BM = (bongMo, code, extra) => chay(['.....', '.....', '.....', '..o..', '.....'], bd, code, Object.assign({ mucTieu: 'bong-mo', bongMo, vatMau: ['.....', '.....', '.....', '..r..', '.....'] }, extra || {}));
  const nem2 = L('load()', 'wait()', 'aim(3)', 'throw()', 'wait()');
  kiem('bong-mo: ném vật tới ô vật mờ (đúng màu đỏ), xe giữ chỗ và hướng → thắng; vật mờ khai màu xanh dương thì chưa thắng', BM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 1, mau: 'red' }] }, nem2).thang === true && BM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 1, mau: 'blue' }] }, nem2).thang === false);
  kiem('bong-mo: vật còn nằm trong rổ lúc xong thì chưa thắng (cả khi xe đúng chỗ); vật vỡ cũng không thắng', BM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 3 }] }, L('load()', 'wait()')).thang === false && BM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 3 }] }, L('load()', 'wait()', 'aim(3)', 'throw()', 'wait()', 'aim(1)')).thang === false);
  kiem('bong-mo: ném tầm 1 trả vật về đúng ô nó vừa nằm (ô trước mặt): nạp rồi ném tầm 1 thì vật mờ ở chỗ cũ cũng thắng', BM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 3 }] }, L('load()', 'wait()', 'aim(1)', 'throw()', 'wait()')).thang === true);
  // camera
  const cam = chay(['.....', '.....', '.....', '..o..', '.....'], bd, L('c = color()', 'load()', 'wait()', 'd = color()', 'wait()'), { camBien: [{ ma: 'camera', o: 'tren' }], hamGoc: KHAY.concat(['color']), vatMau: ['.....', '.....', '.....', '..r..', '.....'] });
  const doc = cam.vet.filter((e) => e.docCamBien).map((e) => e.docCamBien.mau);
  kiem('camera: color() đọc màu VẬT ở ô trước mặt trước khi nạp ("red"); nạp xong ô đó trống nên đọc lại là "none"', J(doc) === '["red","none"]', J(doc));
}

/* ================================================================= 2. MÀN HỎNG: CHỈ QUAY PHẢI */
console.log('\n== 2. Màn hỏng: phanCung chỉ còn left_move, wait và máy ném ==');
{
  const m8 = man(8), k8 = khoTruoc(m8.id);
  kiem('che-may-nem.8: hamGoc = phanCung = left_move, wait, aim, throw, load (không right_move, left_back, right_back); canhBao "Bánh hỏng: xe chỉ quay phải"', J(m8.phanCung) === J(m8.hamGoc) && J(m8.phanCung) === J(KHAY_HONG) && /Bánh hỏng/.test(m8.canhBao) && /quay phải/.test(m8.canhBao), J(m8.phanCung));
  const hong1 = ChamHoc.cham(m8, { chinh: ['turn_left()'] }, k8);
  const cd1 = hong1.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('gọi turn_left() của em (dùng left_back): lenh-goc-hong nêu "left_back() không chạy được" và canhBao, chỉ dòng của hàm turn_left; không phải ham-chua-co', !!cd1 && cd1.ten === 'left_back' && /left_back\(\) không chạy được/.test(cd1.loi) && /Bánh hỏng: xe chỉ quay phải/.test(cd1.loi) && !maCua(hong1).includes('ham-chua-co'), J(hong1.chanDoan));
  const hong2 = ChamHoc.cham(m8, { chinh: ['u_turn()'] }, k8);
  kiem('gọi u_turn() hay move() của em: lenh-goc-hong (cần bánh phải hay số lùi)', maCua(hong2).includes('lenh-goc-hong') && maCua(ChamHoc.cham(m8, { chinh: ['move()'] }, k8)).includes('lenh-goc-hong'));
  const hong3 = ChamHoc.cham(m8, { chinh: ['side_throw(1)'] }, k8);
  kiem('side_throw() em đã chế ở màn 2 quay trái ở cuối nên bị hỏng ở màn này (lenh-goc-hong); launch() thì chạy được (không dùng bánh)', maCua(hong3).includes('lenh-goc-hong') && !maCua(ChamHoc.cham(m8, { chinh: ['launch(3)'] }, k8)).includes('lenh-goc-hong'));
  kiem('turn_right() của em (left_move + wait) chạy được: quay phải một lần, một nhịp', (() => { const r = ChamHoc.cham(m8, { chinh: ['turn_right()'] }, k8); return !maCua(r).includes('lenh-goc-hong') && r.soNhip === 1 && r.theoSan[0].robot.huong === 1; })());
  const day = nhipCheMayNemNganNhat(Object.assign({}, m8, { phanCung: undefined, hamGoc: KHAY }), { phanCung: KHAY });
  kiem('bộ dò: với bánh đủ (quay trái được) màn 8 chỉ cần ' + day.nhip + ' nhịp; bánh hỏng cần ' + nhipCheMayNemTatCa(m8, k8) + ' nhịp (quay trái bằng ba lần quay phải)', day.nhip !== null && day.nhip < nhipCheMayNemTatCa(m8, k8), J([day.nhip, nhipCheMayNemTatCa(m8, k8)]));
  kiem('bộ dò chỉ cho hiệu quả phai, cho ở màn hỏng; màn thường cho đủ sáu', J(DoDuong.hanhDongChoPhep(DoDuong.dungNguCanh(conCua(m8, 0))).filter((a) => !a.nem).map((a) => a.hq).sort()) === '["cho","phai"]' &&
    DoDuong.hanhDongChoPhep(DoDuong.dungNguCanh(conCua(man(1), 0))).filter((a) => !a.nem).length === 6);
}

/* ================================================================= 3. SỔ LỆNH */
console.log('\n== 3. Sổ lệnh: năm hàm mới của che-may-nem (fixed_toss, go_load, undo_load là hàm của màn) ==');
{
  const moi = ['launch', 'side_throw', 'carry_throw', 'toss_back', 'split'];
  kiem('SoLenh.theoChuong("che-may-nem") đúng năm hàm theo thứ tự chế: launch, side_throw, carry_throw, toss_back, split; nhóm nem', J(SoLenh.theoChuong('che-may-nem').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('che-may-nem').every((h) => h.nhom === 'nem'));
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('fixed_toss, go_load, undo_load là hàm CỦA MÀN: không là hàm cốt truyện, không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào',
    ['fixed_toss', 'go_load', 'undo_load'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))));
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó (taoHam của màn che-may-nem)', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'che-may-nem'));
  kiem('moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối; launch: "Nạp vật trước mặt rồi ném thẳng ra xa n ô"', moi.every((t) => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); }) && SoLenh.tim('launch').moTa === 'Nạp vật trước mặt rồi ném thẳng ra xa n ô');
  kiem('tên hàm cốt truyện không trùng với lệnh gốc, hàm của chương khác hay hàm của màn nào', moi.every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t) &&
    tatCa.every((m) => m.chuong === 'che-may-nem' || ![m.maMau, m.loiGiai].some((b) => b.hamCuaMan.some((h) => h.ten === t)))));
  kiem('thứ tự trong Sổ lệnh: hàm của che-may-nem đứng ngay sau toss (may-nem) và trước hàm của drone (recharge)', (() => { const ix = (t) => SoLenh.ds.findIndex((h) => h.ten === t); return ix('launch') === ix('toss') + 1 && ix('split') < ix('recharge'); })());
  kiem('lệnh gốc aim, throw, load có trong Sổ lệnh và không có lệnh ngược (nem · nạp không hoàn tác được; "đường về" dùng ném tầm 1 để trả vật)', ['aim', 'throw', 'load'].every((t) => { const l = SoLenh.lenhGoc.find((x) => x.ten === t); return l && l.nguoc === null && SanHoc.LENH_NGUOC[t] === undefined; }));
}

/* ================================================================= 4. MƯỜI MÀN CHE-MAY-NEM */
console.log('\n== 4. Chương che-may-nem: dữ liệu và luật từng màn ==');
const BANG = [];
{
  kiem('đúng 10 màn, số 1..10, mã che-may-nem.1…, id theo vị trí trong thuTu (ngay sau may-nem), tên "Chế lệnh máy ném"',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === (ThuTu.thuTu.indexOf('che-may-nem') + 1) + '.' + (i + 1) && m.ma === 'che-may-nem.' + (i + 1)) && ThuTu.thuTu.indexOf('che-may-nem') === ThuTu.thuTu.indexOf('may-nem') + 1 && ThuTu.ten['che-may-nem'] === 'Chế lệnh máy ném' && ThuTu.laDot2('che-may-nem'));
  kiem('tên các màn: Ném thẳng, Ném sang bên, Dọn kho, Chở rồi ném, Ném ra sau lưng, Chia theo màu, Sửa tầm lệch, Xe chỉ quay phải, Đường về, Kho hàng ném; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-may-nem "Huy hiệu Chế lệnh máy ném"',
    J(che.map((m) => m.ten)) === J(['Ném thẳng', 'Ném sang bên', 'Dọn kho', 'Chở rồi ném', 'Ném ra sau lưng', 'Chia theo màu', 'Sửa tầm lệch', 'Xe chỉ quay phải', 'Đường về', 'Kho hàng ném']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-may-nem' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh máy ném');
  const camBienCua = (m) => m.so === 6 ? [{ ma: 'camera', o: 'tren' }] : m.so === 10 ? [{ ma: 'khoang-cach', o: 'hong' }] : [];
  kiem('mọi màn: xe hai bánh gắn máy ném (robot { than: "hai-banh", tay: "nem" }; camera ở màn 6, cảm biến khoảng cách ở màn 10), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, cauTruc for/if/while',
    che.every((m) => m.loaiRobot === 'banh' && J(m.robot) === J({ than: 'hai-banh', tay: 'nem', camBien: camBienCua(m) }) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while"]'));
  kiem('khay: đủ bánh (cả lùi) + aim, throw, load ở mọi màn; thêm color() ở màn 6 (camera), front_clear() ở màn 10; màn 8 hỏng: khay = phần cứng = left_move, wait, aim, throw, load; chỉ màn 8 khai phanCung',
    che.every((m) => J(m.hamGoc) === J(m.so === 8 ? KHAY_HONG : m.so === 6 ? KHAY.concat(['color']) : m.so === 10 ? KHAY.concat(['front_clear']) : KHAY)) && che.every((m) => (m.so === 8) === !!m.phanCung) && che.every((m) => !m.roBanDau));
  kiem('lệnh chế ở từng màn (taoHam): launch, side_throw, —, carry_throw, toss_back, split, —, —, —, —; 7 sửa fixed_toss và 9 viết undo_load là HÀM CỦA MÀN (không hàm của em mới)',
    J(che.map((m) => m.taoHam)) === J([['launch'], ['side_throw'], [], ['carry_throw'], ['toss_back'], ['split'], [], [], [], []]) && [7, 9].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) &&
      J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["fixed_toss"]' && J(man(9).loiGiai.hamCuaMan.map((h) => h.ten)) === '["go_load","undo_load"]');
  kiem('mục tiêu: 3 là dua-vat (ba vật, ba ô đích D, người chơi tự viết); còn lại bong-mo có bongMo (vật mờ khai đủ số vật); không màn nào có cờ F; chinhCoDinh ở mọi màn trừ 3, 8 và 10; khoaHamMan ["go_load"] chỉ ở 9; phanCung + canhBao chỉ ở 8; gioiHanHam 3 chỉ ở 10; không màn nào dùng daoChieu; màn nhiều sân: 6 và 10',
    che.every((m) => (m.so === 3 ? m.mucTieu === 'dua-vat' && m.bongMo === undefined && (m.san.join('').match(/D/g) || []).length === 3 && (m.san.join('').match(/o/g) || []).length === 3 : m.mucTieu === 'bong-mo' && !!m.bongMo && [].concat(m.bongMo).every((b, i) => b.vat.length === sanCua(m)[Math.min(i, sanCua(m).length - 1)].join('').split('o').length - 1)) && !/F/.test(m.san.flat(2).join('')) &&
      (m.chinhCoDinh === true) === ![3, 8, 10].includes(m.so) && (m.so === 9) === (J(m.khoaHamMan) === '["go_load"]') &&
      (m.so === 8) === (!!m.canhBao) && (m.so === 10 ? m.gioiHanHam === 3 : m.gioiHanHam === undefined) && m.daoChieu === undefined &&
      Array.isArray(m.san[0]) === [6, 10].includes(m.so)));
  kiem('sân ≤ 7 cột × 9 hàng; màn nhiều sân: 3 sân (6, 10) cùng khung, batDau và bongMo song song, nhipTheo "tong"; mỗi sân có đúng một vật ở màn 1–2, 4–9', che.every((m) => sanCua(m).every((r) => r.length <= 9 && r[0].length <= 7)) &&
    [6, 10].every((i) => { const m = man(i); return m.san.length === 3 && Array.isArray(m.batDau) && m.batDau.length === 3 && Array.isArray(m.bongMo) && m.bongMo.length === 3 && m.nhipTheo === 'tong'; }) &&
    [1, 2, 4, 5, 6, 7, 8, 9].every((i) => sanCua(man(i)).every((rows) => SanHoc.docSan(rows).vat.length === (i === 7 || i === 8 ? 2 : 1))));

  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfs = nhipCheMayNemTatCa(m, kho);
    BANG.push({ m, r, bfs });
    kiem(m.id + ': BFS đường ngắn nhất = ' + bfs + ' = sao.nhip ' + m.sao.nhip + ' (load / throw mỗi lệnh một nhịp riêng, không gộp với lệnh bánh nên lời giải chuẩn viết gọn là nhanh nhất; nhiều sân: tổng; màn 9 tính cả đoạn go_load cố định)',
      bfs === m.sao.nhip, 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
      const rong = ChamHoc.cham(m, { chinh: [], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính RỖNG gửi lên vẫn chạy bản mẫu (cùng nhịp, cùng sao)', rong.thang === r.thang && rong.sao === r.sao && rong.soNhip === r.soNhip);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, gọi hàm đã chế)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // mục tiêu và bóng mờ
    if (m.mucTieu === 'bong-mo') {
      const dsB = [].concat(m.bongMo);
      kiem(m.id + ': bóng mờ (xe mờ + vật mờ) nằm trên ô đi được / đặt được; số vật mờ đúng bằng số vật của sân; chạy xong thắng đúng ở nhịp cuối (mọi sân)', sanCua(m).every((rows, i) => {
        const lm = SanHoc.lopMauCuaSan(m, i), sn = SanHoc.docSan(rows, lm.mau, lm.vatMau, lm.vatChat), bm = dsB[i];
        const rs = r.theoSan[i];
        return !SanHoc.lyDoChan(sn, 'banh', bm.x, bm.y) && bm.vat.length === sn.vat.length && bm.vat.every((q) => !SanHoc.lyDoChan(sn, 'banh', q.x, q.y) && 'o.'.includes(rows[q.y][q.x]) || (rows[q.y][q.x] === '.' && !SanHoc.lyDoChan(sn, 'banh', q.x, q.y))) && rs.thang && rs.bongMo.x === bm.x && rs.bongMo.huong === bm.huong &&
          rs.vet.filter((e) => e.loai === 'nhip').length === rs.soNhip && rs.vet.filter((e) => e.loai === 'nhip').slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo');
      }));
    } else {
      kiem(m.id + ': mục tiêu dua-vat, mỗi vật có một ô đích D sau hàng rào / tường; lời giải đưa mọi vật vào đích', r.thang && m.san.join('').includes('D') && /[=#]/.test(m.san.join('')) && r.theoSan[0].vat.every((v) => v.trangThai === 'dat' && r.theoSan[0].dich.some((d) => d.x === v.x && d.y === v.y)));
    }
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (Array.isArray(c.hamCuaEmMoi) || c.baiLam) && J({ b: c.baiLam || m.loiGiai, h: c.hamCuaEmMoi || [] }) !== J({ b: m.loiGiai, h: m.loiGiai.hamCuaEmMoi })));
    m.congThucKhac.forEach((c, i) => {
      const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không chẩn đoán nào (gõ được đúng luật một lệnh mỗi bộ phận mỗi nhịp) — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && rc.chanDoan.length === 0, J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
    });
    const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && rk.chanDoan.length === 0, J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip, cd: maCua(rk) }));
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    const khoaTen = m.khoaHamMan || [];
    const suaTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => !khoaTen.includes(h.ten)).map((h) => h.ten));
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (suaTen.join(', ') || 'màn dùng') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '(')), m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút; đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm|nút/i.test(m.goiY.join(' ')), m.deBai);
  }

  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id);
  const tam = (n) => ChamHoc.cham(m1, m1.loiGiai, tron(k1, [H('launch', ['load()', 'wait()', 'toss(' + n + ')'], ['n'])]));
  kiem('28.1 Ném thẳng: chưa chế launch thì không thắng (ham-chua-co); chỉ tầm 3 đúng — tầm 1 trả vật về ô cũ, tầm 2 vỡ ở hàng rào; vật mờ cách xe 3 ô, cùng cột; BFS 2 nhịp',
    !ChamHoc.cham(m1, m1.maMau, k1).thang && maCua(ChamHoc.cham(m1, m1.maMau, k1)).includes('ham-chua-co') && !tam(1).thang && !tam(2).thang && maCua(tam(2)).includes('nem-vo') && tam(3).thang &&
      m1.bongMo.vat[0].x === m1.batDau.x && m1.batDau.y - m1.bongMo.vat[0].y === 3 && nhipCheMayNemTatCa(m1, k1) === 2 && m1.san[3][2] === '=');
  const m2 = man(2), k2 = khoTruoc(m2.id);
  kiem('28.2 Ném sang bên: vật mờ nằm bên PHẢI xe cách 3 ô (cùng hàng với xe), xe mờ y hệt xe; ô 1 hàng rào, ô 2 tường (chỉ tầm 3 đúng); BFS 4 nhịp (nạp, quay phải, ném, quay trái)',
    m2.bongMo.vat[0].y === m2.batDau.y && m2.bongMo.vat[0].x - m2.batDau.x === 3 && J(m2.bongMo.huong) === J(m2.batDau.huong) && m2.san[2 + 1][m2.batDau.x + 1] === '=' && m2.san[3][m2.batDau.x + 2] === '#' && nhipCheMayNemTatCa(m2, k2) === 4);
  const m3 = man(3), k3 = khoTruoc(m3.id);
  const r3 = ChamHoc.cham(m3, m3.loiGiai, k3);
  kiem('28.3 Dọn kho (dùng): ba vật, ba đích sau hàng rào; lời giải gọi side_throw, forward, launch, turn_right và dùng 5 dòng (≤ 10); xe KHÔNG cần về chỗ cũ; thiếu bước đi lên hay quay phải thì không đủ vật vào đích; BFS 12',
    r3.thang && m3.loiGiai.chinh.length === 5 && J([...new Set(m3.loiGiai.chinh.map((s) => s.replace(/\(.*\)/, '')))].sort()) === J(['forward', 'launch', 'side_throw', 'turn_right']) && nhipCheMayNemTatCa(m3, k3) === 12 &&
      m3.loiSai.filter((l) => l.phaiCoMa.includes('chua-dua-vat')).length >= 2 && r3.theoSan[0].robot.y === 3 && r3.theoSan[0].robot.huong === 1);
  const m4 = man(4), k4 = khoTruoc(m4.id);
  const ngay = ChamHoc.cham(m4, m4.loiGiai, tron(k4, [H('carry_throw', ['load()', 'wait()', 'toss(3)'], ['k'])]));
  kiem('28.4 Chở rồi ném: vật mờ cách vật 4 ô (xa hơn tầm 3); ném ngay không chở thì vật rơi cách vật mờ 1 ô; rổ chở vật theo xe nên chỉ cần 4 nhịp (nạp, đi 2, ném); xe mờ cách xe 2 ô',
    m4.bongMo.vat[0].y - SanHoc.docSan(m4.san).vat[0].y === -4 && !ngay.thang && ngay.vat[0].y === 4 && nhipCheMayNemTatCa(m4, k4) === 4 && m4.batDau.y - m4.bongMo.y === 2 && r3 && ChamHoc.cham(m4, m4.loiGiai, tron(k4, m4.loiGiai.hamCuaEmMoi)).theoSan[0].nem.ro === null);
  const m5 = man(5), k5 = khoTruoc(m5.id);
  kiem('28.5 Ném ra sau lưng: vật mờ nằm SAU xe cách 3 ô (cùng cột), ô 1 sau lưng là hàng rào, ô 2 là tường (chỉ tầm 3 đúng); dùng u_turn một nhịp của em (BFS 4); quay đầu bằng hai lần quay phải chậm hơn 2 nhịp',
    m5.bongMo.vat[0].x === m5.batDau.x && m5.bongMo.vat[0].y - m5.batDau.y === 3 && m5.san[m5.batDau.y + 1][m5.batDau.x] === '=' && m5.san[m5.batDau.y + 2][m5.batDau.x] === '#' && nhipCheMayNemTatCa(m5, k5) === 4 && m5.hamCuaEmCan.includes('u_turn') &&
      ChamHoc.cham(m5, m5.congThucKhac[0].baiLam, tron(k5, m5.congThucKhac[0].hamCuaEmMoi)).soNhip === 6);
  const m6 = man(6), k6 = khoTruoc(m6.id);
  const r6 = ChamHoc.cham(m6, m6.loiGiai, tron(k6, m6.loiGiai.hamCuaEmMoi));
  const sai6 = ChamHoc.cham(m6, m6.loiSai[0].baiLam, tron(k6, m6.loiSai[0].hamCuaEmMoi));
  kiem('28.6 Chia theo màu: 3 sân (vật đỏ, xanh dương, xanh dương), xe gắn camera nên color() đọc màu vật trước mũi xe; split() đúng 8 dòng và dùng side_throw(); mỗi sân 4 nhịp; chuyền mọi vật sang phải thì chỉ sân vật đỏ thắng',
    r6.thang && r6.theoSan.length === 3 && r6.theoSan.every((s) => s.thang && s.soNhip === 4) && m6.loiGiai.hamCuaEmMoi[0].than.length === 8 && m6.hamCuaEmCan.includes('side_throw') && J(sai6.theoSan.map((s) => s.thang)) === '[true,false,false]' &&
      J(m6.bongMo.map((b) => b.vat[0].mau)) === '["red","blue","blue"]' && J(m6.bongMo.map((b) => b.vat[0].x - b.x)) === '[2,-2,-2]', J(sai6.theoSan.map((s) => s.thang)));
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const cu = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('28.7 Sửa tầm lệch: hàm của màn fixed_toss(n) cũ ném ngắn hơn n một ô: vật đầu rơi vào hàng rào nên vỡ (nem-vo), vật thứ hai rơi sai chỗ; sửa thành aim(n) thì thắng; aim(n + 1) bị tam-sai (tầm 4); hàm của màn KHÔNG khóa; toss() trong kho vẫn đúng',
    !cu.thang && maCua(cu).includes('nem-vo') && ChamHoc.cham(m7, m7.loiGiai, k7).thang && maCua(ChamHoc.cham(m7, m7.loiSai[1].baiLam, k7)).includes('tam-sai') && m7.khoaHamMan === undefined && J(m7.maMau.hamCuaMan[0].than) === J(['aim(n - 1)', 'throw()', 'wait()']) && J(m7.maMau.hamCuaMan[0].thamSo) === '["n"]' &&
      m7.hamCuaEmCan.includes('toss') && k7.some((h) => h.ten === 'toss') && !k7.some((h) => h.ten === 'fixed_toss'));
  const m8 = man(8), k8 = khoTruoc(m8.id);
  const r8 = ChamHoc.cham(m8, m8.loiGiai, k8);
  const dao8 = ChamHoc.cham(m8, m8.loiSai[3].baiLam, k8);
  kiem('28.8 Xe chỉ quay phải: vật xanh dương phải bay ra xa TRƯỚC (rồi vật đỏ mới rơi vào ô trống); ném vật đỏ trước thì vật vỡ (nem-vo); lời giải dùng launch, turn_right, right(3) (quay trái = quay phải ba lần), 7 dòng; BFS 9; xe cuối quay mặt sang phải',
    r8.thang && m8.loiGiai.chinh.length === 7 && dao8.chanDoan.some((c) => c.ma === 'nem-vo') && !dao8.thang && nhipCheMayNemTatCa(m8, k8) === 9 && m8.bongMo.huong === 1 && J(m8.bongMo.vat.map((q) => q.mau)) === '["red","blue"]' && r8.theoSan[0].robot.huong === 1 && m8.hamCuaEmCan.includes('right'));
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const pre = ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: ['go_load()'], hamCuaMan: m9.maMau.hamCuaMan }, k9);
  kiem('28.9 Đường về: go_load() của màn đưa xe lên 2 ô, rẽ phải, tiến 1 ô và NẠP vật (5 nhịp, xe ở ô ◆, vật trong rổ); undo_load() phải ném vật về đúng ô cũ và đưa xe về ô + hướng xuất phát; go_load khóa và xem được; BFS còn lại 5',
    pre.theoSan[0].soNhip === 5 && pre.theoSan[0].robot.x === 2 && pre.theoSan[0].robot.y === 2 && pre.theoSan[0].robot.huong === 1 && pre.theoSan[0].nem.ro === 1 && J(m9.khoaHamMan) === '["go_load"]' && m9.maMau.hamCuaMan.some((h) => h.ten === 'go_load') &&
      J(m9.bongMo) === J({ x: m9.batDau.x, y: m9.batDau.y, huong: m9.batDau.huong, diQua: [{ x: 2, y: 2 }], vat: [{ x: 3, y: 2 }] }) && pre.theoSan[0].diQua[0].da === true && nhipCheMayNemTatCa(m9, k9) === 10);
  kiem('28.9: undo_load() là lệnh NGƯỢC của go_load() theo thứ tự ngược: go_load = move, move, turn_right, move, load → undo_load = toss(1) (ném trả vật tầm 1), back, turn_left, back, back; sửa go_load gửi lên vẫn bị bản mẫu thay',
    J(m9.loiGiai.hamCuaMan.find((h) => h.ten === 'undo_load').than) === J(['toss(1)', 'back()', 'turn_left()', 'back()', 'back()']) && (() => { const ub = m9.loiGiai.hamCuaMan.find((h) => h.ten === 'undo_load'); const a = ChamHoc.cham(m9, { chinh: [], hamCuaMan: [H('go_load', ['move()']), ub] }, k9); const b = ChamHoc.cham(m9, m9.loiGiai, k9); return J([a.thang, a.soO, a.soNhip]) === J([b.thang, b.soO, b.soNhip]) && b.sao === 3; })());
  const rp = ChamHoc.cham(m9, m9.maMau, k9);
  kiem('28.9: undo_load() thân ban đầu chỉ có `pass`; để nguyên thì không thắng: lech-bong-mo; undo_load KHÔNG khóa; không vào kho, không taoHam; ném từ ô lùi một ô (tầm 2) cũng trả vật về đúng ô cũ',
    J(m9.maMau.hamCuaMan.map((h) => h.ten)) === '["go_load","undo_load"]' && J(m9.maMau.hamCuaMan[1].than) === J(['pass']) && !rp.thang && maCua(rp).includes('lech-bong-mo') && m9.taoHam.length === 0 && !k9.some((h) => h.ten === 'undo_load') && ChamHoc.cham(m9, m9.congThucKhac[0].baiLam, k9).thang);
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  const gh = ChamHoc.cham(m10, m10.loiSai[4].baiLam, k10);
  kiem('28.10 Kho hàng ném: gioiHanHam 3 — lời giải gọi 2 hàm khác nhau (go_wall, side_throw) vừa giới hạn; 4 hàm khác nhau bị qua-gioi-han-ham (lỗi khung, nêu "3"); ba sân cách vật khác nhau; trùm không khóa chương trình chính',
    r10.thang && J([...new Set(m10.loiGiai.chinh.filter((s) => /^\s*[a-z_]+\(.*\)$/.test(s)).map((s) => s.trim().replace(/\(.*\)/, '')))].sort()) === J(['go_wall', 'side_throw']) && maCua(gh).join() === 'qua-gioi-han-ham' && /3/.test(gh.chanDoan[0].loi) && !gh.thang && m10.chinhCoDinh !== true);
  kiem('28.10: viết cứng số bước thua ở ít nhất một sân; mỗi sân có đúng 3 vật xếp dọc cột 1, xe quay lên ở (1,6); tầm đúng 3, 2, 1 (tầm sai làm vật vỡ); nhịp mỗi sân khác nhau', (() => {
    const cung = ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10);
    const rieng = r10.theoSan.map((s) => s.soNhip);
    return !cung.thang && cung.theoSan.filter((s) => s.thang).length < 3 && new Set(rieng).size >= 2 && rieng.reduce((a, b) => a + b, 0) === m10.sao.nhip &&
      sanCua(m10).every((rows) => SanHoc.docSan(rows).vat.length === 3 && SanHoc.docSan(rows).vat.every((v) => v.x === 1)) && J(m10.batDau.map((b) => [b.x, b.y, b.huong])) === J([[1, 6, 0], [1, 6, 0], [1, 6, 0]]) && maCua(ChamHoc.cham(m10, m10.loiSai[1].baiLam, k10)).includes('nem-vo');
  })());
  const khongFor = ChamHoc.cham(m10, m10.congThucKhac[0].baiLam, k10);
  kiem('28.10: công thức khác không dùng for (ba lần go_wall + side_throw) chỉ nhiều ô hơn, 6 dòng ≤ 10', khongFor.thang && m10.congThucKhac[0].baiLam.chinh.length === 6 && khongFor.soO > r10.soO);

  console.log('\n  Bảng 10 màn che-may-nem (lời giải cách 1, sao; BFS = nhịp ngắn nhất)');
  console.log('  màn   | tên                | ô  | nhịp | BFS | tạo / sửa      | lời giải (chương trình chính)');
  for (const { m, bfs } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(18) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfs).padEnd(3) + ' | ' + (m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',') || (m.loiGiai.hamCuaMan.length ? 'hàm của màn' : '—')).padEnd(14) + ' | ' + m.loiGiai.chinh.join(' ; '));
  }
}

/* ================================================================= 5. ĐƯỜNG BFS CHẠY THẬT */
console.log('\n== 5. Đường BFS (do-duong-che-may-nem.mjs) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS ==');
{
  for (const m of che) {
    const nhieu = Array.isArray(m.san[0]);
    const tung = sanCua(m).map((rows, i) => {
      const b = nhipCheMayNemNganNhat(conCua(m, i));
      const code = chuoiThanhMa(b.chuoi, m);
      const k = SanHoc.chay(cfgSan(m, i), code);
      return { b, k };
    });
    kiem(m.id + ': đường BFS ' + (nhieu ? 'từng sân ' : '') + '(' + tung.map((x) => x.b.nhip).join(' + ') + ' nhịp) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS, không lỗi', tung.every(({ b, k }) => k.thang === true && k.nhip === b.nhip && !k.loi), J(tung.map(({ b, k }) => [b.nhip, k.thang, k.nhip, k.loi])));
  }
  // bộ dò tự kiểm
  const m1 = man(1);
  kiem('bộ dò tự kiểm: bỏ vật mờ ở 28.1 (chỉ cần xe đứng đúng chỗ) thì chương trình rỗng là xong: 0 nhịp; thiếu máy ném (phần cứng không có load) thì không giải được (null)',
    nhipCheMayNemNganNhat(Object.assign({}, m1, { bongMo: { x: m1.bongMo.x, y: m1.bongMo.y, huong: 0, vat: [{ x: 2, y: 4 }] } })).nhip === 0 &&
      nhipCheMayNemNganNhat(m1, { phanCung: SanHoc.phanCungCua(m1).filter((t) => t !== 'load') }).nhip === null);
  kiem('bộ dò: giới hạn toiDaTrangThai nhỏ → catNgang true (không kết luận)', nhipCheMayNemNganNhat(conCua(man(10), 0), { toiDaTrangThai: 100 }).catNgang === true);
  kiem('bộ dò: tầm ném cũng đổi nhịp — màn 28.1 mà vật mờ cách 2 ô (hàng rào chỗ khác) vẫn 2 nhịp; vật mờ nằm ngoài tầm 3 và xe không chở được (bị tường chặn) thì không giải được',
    nhipCheMayNemNganNhat(Object.assign({}, m1, { bongMo: { x: 2, y: 5, huong: 0, vat: [{ x: 2, y: 1 }] } })).nhip === 3 ||
      nhipCheMayNemNganNhat(Object.assign({}, m1, { bongMo: { x: 2, y: 5, huong: 0, vat: [{ x: 2, y: 1 }] } })).nhip !== null);
}

/* ================================================================= 6. SO CHÉO NGẪU NHIÊN: BỘ DÒ vs SANHOC.CHAY */
console.log('\n== 6. So chéo ngẫu nhiên: chương trình ngẫu nhiên chạy trên SanHoc.chay và trên bộ dò cho cùng trạng thái cuối ==');
{
  let seed = 123456789;
  const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let tong = 0, lech = 0, vo = 0, thang = 0;
  const vi = [];
  for (const m of che) {
    sanCua(m).forEach((rows, i) => {
      const con = conCua(m, i), ctx = DoDuong.dungNguCanh(con), HD = DoDuong.hanhDongChoPhep(ctx);
      const banh = HD.filter((a) => !a.nem), load = HD.filter((a) => a.nem === 'load'), nem = HD.filter((a) => a.nem === 'throw');
      for (let t = 0; t < 90; t++) {
        const dai = 1 + Math.floor(rng() * 12), chuoi = [];
        for (let q = 0; q < dai; q++) {
          const p = rng();
          const ds = p < 0.45 ? banh : p < 0.7 ? load : nem;
          chuoi.push(ds[Math.floor(rng() * ds.length)]);
        }
        const mp = DoDuong.moPhong(ctx, chuoi);
        const chay2 = chuoi.slice(0, mp.cacBuoc.length - 1);
        const k = SanHoc.chay(cfgSan(m, i, { nhipToiDa: 300 }), chuoiThanhMa(chay2, m));
        tong++;
        if (mp.vo) vo++;
        const S = mp.S;
        let ok = !k.loi && k.nhip === chay2.length && k.robot.x === S.x && k.robot.y === S.y && k.robot.huong === S.h;
        const dsV = k.vat.slice().sort((a, b) => a.id - b.id);
        ok = ok && dsV.length === S.pos.length && dsV.every((v, j) => {
          const p = S.pos[j];
          if (p === -2) return v.trangThai === 'vo';
          if (p === -1) return v.trangThai === 'ro';
          return v.trangThai === 'dat' && v.y * ctx.rong + v.x === p;
        });
        const thangBo = m.mucTieu === 'dua-vat' ? (mp.thangSom || DoDuong.laDich(ctx, S)) : DoDuong.laDich(ctx, S);
        ok = ok && k.thang === thangBo;
        if (thangBo) thang++;
        if (!ok) { lech++; if (vi.length < 3) vi.push(m.id + ' sân ' + (i + 1) + ': ' + chuoiThanhMa(chay2, m).replace(/\n/g, ' ') + ' → engine ' + J([k.nhip, k.robot, k.thang, k.loi]) + ' · bộ dò ' + J([S, thangBo])); }
      }
    });
  }
  kiem('so chéo ' + tong + ' chương trình ngẫu nhiên (' + vo + ' có vật vỡ, ' + thang + ' thắng) trên mọi sân của 10 màn: vị trí xe, hướng, trạng thái từng vật (đất / rổ / vỡ), thắng hay không đều khớp SanHoc.chay', tong >= 1000 && lech === 0, lech + ' lệch · ' + vi.join(' || '));
}

/* ================================================================= 7. KHO CUỐI GAME */
console.log('\n== 7. Kho hàm của em ==');
{
  const cuoi = khoTruoc('het');
  kiem('kho cuối game có đủ năm hàm của che-may-nem, toss của may-nem và tên cốt truyện khóa; fixed_toss, go_load, undo_load (hàm của màn) không có trong kho', ['launch', 'side_throw', 'carry_throw', 'toss_back', 'split', 'toss'].every((t) => cuoi.some((h) => h.ten === t)) && ['fixed_toss', 'go_load', 'undo_load'].every((t) => !cuoi.some((h) => h.ten === t)));
  const sach = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('KhoHam khóa tên: người chơi không tạo được hàm tên launch / side_throw / carry_throw / toss_back / split / toss bằng tên trùng ngoài màn chế nó', ['launch', 'side_throw', 'carry_throw', 'toss_back', 'split', 'toss'].every((t) => tenCotTruyen.includes(t)) && sach.tao('launch', [], {}).ok === false);
  kiem('thân hàm launch(n) trong kho có tham số n; carry_throw(k) có tham số k; split() không tham số', (() => { const h = (t) => cuoi.find((x) => x.ten === t); return J(h('launch').thamSo) === '["n"]' && J(h('carry_throw').thamSo) === '["k"]' && h('split').thamSo.length === 0 && J(h('side_throw').thamSo) === '["n"]' && J(h('toss_back').thamSo) === '["n"]'; })());
}

/* ================================================================= 8. THẺ SCRIPT CỦA GAME */
console.log('\n== 8. game/choi.html nạp man-che-may-nem.js đúng thứ tự ==');
{
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-may-nem.js đúng một lần, sau man-may-nem.js (cùng sổ màn)', tags.filter((t) => t === '../man-che-may-nem.js').length === 1 && vtri('man-che-may-nem.js') > vtri('man-may-nem.js'), J(tags.filter((t) => /man-/.test(t))));
  kiem('so-lenh.js nạp trước man-che-may-nem.js', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-may-nem.js'));
  const hh = fs.readFileSync(path.join(day, 'game', 'huy-hieu.js'), 'utf8');
  kiem('game/huy-hieu.js có HINH["che-may-nem"] (hình máy ném + bánh răng)', hh.includes("HINH['che-may-nem']") && /HINH\['che-may-nem'\][\s\S]{0,900}themBanhRang\(p\)/.test(hh));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
