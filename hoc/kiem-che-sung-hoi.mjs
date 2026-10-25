/* ============================================================================
   kiem-che-sung-hoi.mjs — máy kiểm chương `che-sung-hoi` (Chế lệnh súng hơi) của "Robot Chấn Hưng" và các luật lõi mới của nó (KE-HOACH-CHE-LENH.md, mục 5c.3).
   Gồm:
   - daoChieu 'sung' (súng lắp ngược): shoot() bắn ra sau + xe giật tới, shoot_back() bắn ra trước + giật lùi; cấu hình sai bị từ chối; sân thử của Xưởng dùng daoChieu của màn;
   - màn hỏng (phanCung thiếu shoot_back): gọi lệnh hỏng → lenh-goc-hong nói "Nòng sau hỏng" / canhBao của màn; bộ dò chỉ cho ban-truoc;
   - bongMo.thung (thùng mờ) + ô ◆ + xe mờ, chẩn đoán lech-bong-mo / chua-qua-diem nói bằng lời người;
   - Sổ lệnh có đủ sáu hàm mới (fixed_kick, go_out, come_back là HÀM CỦA MÀN nên không có ở đó, không vào kho);
   - 10 màn che-sung-hoi: lời giải 3 sao, mọi công thức khác thắng, lời giải khác đúng 2 sao, lời sai đúng mã, chinhCoDinh chặn chương trình chính gửi lên,
     nhịp: đường ngắn nhất BFS (do-duong-che-sung-hoi.mjs) ≤ sao.nhip;
   - đường BFS đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS (so chéo ngẫu nhiên với san-hoc.js: kiem-sung-hoi.mjs);
   - thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs. Luật giật / thùng / nút / cửa / băng: kiem-sung-hoi.mjs.
   Chạy: node hoc/kiem-che-sung-hoi.mjs        (trượt thì thoát mã 1)
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
const DoDuong = await import('./do-duong-che-sung-hoi.mjs');
const { nhipCheSungHoiNganNhat, nhipCheSungHoiTatCa, chuoiThanhMa } = DoDuong;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-sung-hoi');
const man = (so) => ManHoc.timMa('che-sung-hoi.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const viTri = (r) => r.x + ',' + r.y;

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
const HOI = ['shoot', 'shoot_back'];
const KHAY = BANH.concat(HOI);
const KHAY_HONG = BANH.concat(['shoot']);
const BAN = L('shoot()', 'wait()'), BAN_SAU = L('shoot_back()', 'wait()');
const trong = (n) => Array.from({ length: n }, () => '.'.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: KHAY }, extra || {}), code);
}
/** Cấu hình SanHoc.chay của sân thứ i của màn m (như ChamHoc.cham truyền xuống). */
function cfgSan(m, i, extra) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({ san: sanCua(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co',
    bongMo: lm.bongMo || undefined, daoChieu: m.daoChieu, camBien: m.robot.camBien, nhipToiDa: 200 }, extra || {});
}

/* ================================================================= 1. SÚNG LẮP NGƯỢC (daoChieu 'sung') */
console.log('\n== 1. daoChieu "sung": shoot() bắn ra sau và giật tới, shoot_back() bắn ra trước và giật lùi ==');
{
  const rows = trong(7), bd = { x: 3, y: 3, huong: 0 };
  const dc = (code, dao, extra) => chay(rows, bd, code, Object.assign({ daoChieu: dao }, extra || {}));
  const thuong = dc(BAN, []);
  kiem('không đảo: shoot() bắn ra trước, xe giật lùi xuống (đối chứng)', thuong.robot.y === 4 && ev(thuong, 'ban')[0].sau === false);
  const d1 = dc(BAN, ['sung']);
  kiem('daoChieu ["sung"]: shoot() bắn ra SAU (bóng bay xuống, sau = true) và xe giật TỚI (lên); vết lệnh vẫn ghi tên lệnh gọi (shoot, wait)', d1.robot.y === 2 && ev(d1, 'ban')[0].sau === true && ev(d1, 'ban')[0].huong === 2 && d1.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).join() === 'shoot,wait');
  const d2 = dc(BAN_SAU, ['sung']);
  kiem('daoChieu ["sung"]: shoot_back() bắn ra TRƯỚC (bóng bay lên) và xe giật LÙI', d2.robot.y === 4 && ev(d2, 'ban')[0].huong === 0);
  kiem('nhịp có bắn thì bánh vẫn nghỉ khi đảo; daoChieu "sung" ghép được với "trai"', maCua(ChamHoc.cham(Object.assign({}, man(7), { daoChieu: ['sung', 'trai'], chinhCoDinh: false }), { chinh: ['shoot()', 'left_move()', 'wait()'] }, khoTruoc(man(7).id))).includes('ban-dung-yen'));
  const nem = (f) => { try { f(); return false; } catch (e) { return /daoChieu/.test(e.message); } };
  kiem('daoChieu "sung" cần robot có súng hơi: robot chỉ có bánh bị từ chối', nem(() => SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH, daoChieu: ['sung'] }, '')));
  kiem('bộ dò: ban-truoc / ban-sau là hiệu quả THẬT; chuoiThanhMa ghi tên lệnh ngược khi súng lắp ngược (ban-truoc → shoot_back, ban-sau → shoot)',
    /shoot_back\(\)/.test(chuoiThanhMa([{ ban: 'truoc' }], { daoChieu: ['sung'], phanCung: KHAY })) && /^shoot\(\)/.test(chuoiThanhMa([{ ban: 'sau' }], { daoChieu: ['sung'], phanCung: KHAY })) && /^shoot\(\)/.test(chuoiThanhMa([{ ban: 'truoc' }], { daoChieu: [], phanCung: KHAY })));
  const m7 = man(7);
  const thuSan = ChamHoc.thuHam(Object.assign({}, m7), { chinh: [], hamCuaMan: m7.maMau.hamCuaMan }, 'fixed_kick', khoTruoc(m7.id), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, thung: [{ x: 3, y: 2 }] } });
  kiem('sân thử của Xưởng hàm dùng daoChieu của màn: fixed_kick() cũ với thùng bên phải: súng ngược nên xe giật sang TRÁI, thùng không nhúc nhích', thuSan.thung && thuSan.thung[0].x === 3 && thuSan.robot.x === 1, J([thuSan.thung, thuSan.robot]));
}

/* ================================================================= 2. MÀN HỎNG: THIẾU NÒNG SAU */
console.log('\n== 2. Màn hỏng: phanCung thiếu shoot_back ==');
{
  const m8 = man(8);
  kiem('che-sung-hoi.8 hỏng nòng sau: hamGoc = phanCung (có shoot, không shoot_back) và canhBao "Nòng sau hỏng"', J(m8.phanCung) === J(m8.hamGoc) && J(m8.hamGoc) === J(KHAY_HONG) && /Nòng sau hỏng/.test(m8.canhBao));
  const k = ChamHoc.cham(Object.assign({}, m8, { chinhCoDinh: false }), { chinh: ['shoot_back()', 'wait()'] }, khoTruoc(m8.id));
  const cd = k.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('gọi shoot_back() ở màn hỏng: lenh-goc-hong (không phải ham-chua-co), lời nêu canhBao và tên lệnh, chỉ dòng của lệnh', !!cd && cd.ten === 'shoot_back' && /Nòng sau hỏng/.test(cd.loi) && /shoot_back\(\) không chạy được/.test(cd.loi) && !maCua(k).includes('ham-chua-co') && cd.cho && cd.cho.cot === 'chinh' && cd.cho.dong === 1, J(k.chanDoan));
  const k2 = ChamHoc.cham(Object.assign({}, m8, { chinhCoDinh: false, canhBao: undefined }), { chinh: ['shoot_back()', 'wait()'] }, khoTruoc(m8.id));
  kiem('không khai canhBao: lời mặc định "Nòng sau của súng hơi hỏng"', /Nòng sau của súng hơi hỏng/.test((k2.chanDoan.find((c) => c.ma === 'lenh-goc-hong') || {}).loi || ''));
  kiem('kick_ahead (u_turn, shoot, u_turn) chạy được ở màn hỏng: không lenh-goc-hong, thùng bị đá lên mép', (() => { const r = ChamHoc.cham(m8, m8.loiGiai, tron(khoTruoc(m8.id), m8.loiGiai.hamCuaEmMoi)); return r.thang && !maCua(r).includes('lenh-goc-hong'); })());
  const hd = DoDuong.Bo.hanhDongChoPhep(m8);
  kiem('bộ dò: màn hỏng nòng sau chỉ cho ban-truoc (thiếu ban-sau); màn thường cho cả hai', hd.some((x) => x.ban === 'truoc') && !hd.some((x) => x.ban === 'sau') && DoDuong.Bo.hanhDongChoPhep(man(1)).filter((x) => x.ban).length === 2);
  kiem('hàm của em dùng được lệnh thuộc phần cứng dù chưa có trên khay; ở màn hỏng chính shoot_back() trong hàm của em báo lenh-goc-hong', (() => {
    const r = ChamHoc.cham(Object.assign({}, m8, { chinhCoDinh: false }), { chinh: ['jet_fwd()'] }, tron(khoTruoc(m8.id), []));
    return maCua(r).includes('lenh-goc-hong') && r.chanDoan.find((c) => c.ma === 'lenh-goc-hong').cho.cot === 'hamEm';
  })());
}

/* ================================================================= 3. THÙNG MỜ, XE MỜ, ◆ */
console.log('\n== 3. bongMo.thung (thùng mờ) với ô ◆ và xe mờ; lech-bong-mo nói thùng ==');
{
  const SAN = ['.....', '.....', '...H.', '.....', '.....'], bd = { x: 2, y: 2, huong: 0 };
  const BM = (bongMo, code, extra) => chay(SAN, bd, code, Object.assign({ mucTieu: 'bong-mo', bongMo }, extra || {}));
  const da = L('turn_l', 'x').length && L('right_move()', 'wait()') + BAN + L('left_move()', 'wait()');          // quay trái (right_move), bắn, quay lại phải (left_move)
  const t = BM({ x: 2, y: 2, huong: 0, thung: [{ x: 4, y: 2 }] }, da);
  kiem('đá thùng sang phải rồi quay lại: xe đúng tư thế và thùng đúng ô thùng mờ → thắng, nhịp cuối ghi toi-bong-mo', t.thang === true && t.bongMo.thung.length === 1 && ev(t, 'toi-bong-mo').length === 1);
  kiem('thùng chưa tới ô thùng mờ thì chưa thắng; thùng thừa / thiếu so với thùng mờ cũng không thắng', BM({ x: 2, y: 2, huong: 0, thung: [{ x: 4, y: 2 }] }, '').thang === false && BM({ x: 2, y: 2, huong: 0, thung: [{ x: 4, y: 2 }, { x: 0, y: 0 }] }, da).thang === false && BM({ x: 2, y: 2, huong: 0, thung: [] }, da).thang === false);
  kiem('không khai bongMo.thung thì không xét thùng (thùng đứng yên vẫn thắng nếu xe đúng chỗ)', BM({ x: 2, y: 2, huong: 0 }, '').thang === true);
  const lv = (kq) => kq.chanDoan.find((c) => c.ma === 'lech-bong-mo');
  const manBM = (bongMo) => Object.assign({ chuong: 'thu', loaiRobot: 'banh', hamGoc: KHAY, moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: [], mucTieu: 'bong-mo', san: SAN, batDau: bd, bongMo }, {});
  const r1 = ChamHoc.cham(manBM({ x: 2, y: 2, huong: 0, thung: [{ x: 4, y: 2 }] }), { chinh: [] }, []);
  kiem('xe đúng chỗ mà thùng chưa đúng: "Xe đúng chỗ rồi. Thùng nặng chưa nằm đúng ô như thùng mờ."', !!lv(r1) && lv(r1).loi === 'Xe đúng chỗ rồi. Thùng nặng chưa nằm đúng ô như thùng mờ.', J(r1.chanDoan));
  const r2 = ChamHoc.cham(manBM({ x: 2, y: 3, huong: 0, thung: [{ x: 4, y: 2 }] }), { chinh: [] }, []);
  kiem('xe lệch và thùng chưa đúng: lời nói cả hai (xe lệch một ô về phía trên so với xe mờ; thùng chưa đúng)', !!lv(r2) && /Xe dừng lệch một ô về phía trên/.test(lv(r2).loi) && /Thùng nặng chưa nằm đúng ô như thùng mờ\./.test(lv(r2).loi), J(r2.chanDoan));
  const nem = (f) => { try { f(); return null; } catch (e) { return e.message; } };
  kiem('cấu hình sai bị từ chối: bongMo.thung không phải mảng; thùng mờ nằm trong tường', /bongMo\.thung phải là mảng/.test(nem(() => BM({ x: 2, y: 2, huong: 0, thung: 3 }, '')) || '') && /thùng không đứng được/.test(nem(() => chay(['..#..', '.....'], { x: 0, y: 1, huong: 1 }, '', { mucTieu: 'bong-mo', bongMo: { x: 0, y: 1, huong: 1, thung: [{ x: 2, y: 0 }] } })) || ''));
  kiem('xe mờ + ô ◆: đi qua ◆ rồi dừng đúng tư thế mới thắng (lùi hai ô bằng giật rồi tiến một ô: ◆ ở ô lùi thứ hai)', (() => {
    const ok = chay(trong(5), { x: 2, y: 1, huong: 0 }, BAN + BAN + BAN_SAU, { mucTieu: 'bong-mo', bongMo: { x: 2, y: 2, huong: 0, diQua: [{ x: 2, y: 3 }] } });
    const thieu = chay(trong(5), { x: 2, y: 1, huong: 0 }, BAN + BAN_SAU, { mucTieu: 'bong-mo', bongMo: { x: 2, y: 1, huong: 0, diQua: [{ x: 2, y: 3 }] } });
    return ok.thang && !thieu.thang && ev(ok, 'qua-diem').length === 1;
  })());
}

/* ================================================================= 4. SỔ LỆNH */
console.log('\n== 4. Sổ lệnh: sáu hàm mới của che-sung-hoi (fixed_kick, go_out, come_back là hàm của màn); lệnh gốc shoot ↔ shoot_back ==');
{
  const moi = ['jet_back', 'jet_fwd', 'kick_right', 'tap_right', 'kick_left', 'kick_ahead'];
  kiem('SoLenh.theoChuong("che-sung-hoi") đúng sáu hàm theo thứ tự chế; nhóm hoi (Súng hơi)', J(SoLenh.theoChuong('che-sung-hoi').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('che-sung-hoi').every((h) => h.nhom === 'hoi') && SoLenh.tenNhom.hoi === 'Súng hơi');
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('fixed_kick, go_out, come_back là hàm CỦA MÀN: không là hàm cốt truyện, không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào', ['fixed_kick', 'come_back'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))));
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó (taoHam của màn che-sung-hoi)', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'che-sung-hoi'));
  kiem('moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối', moi.every((t) => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); }));
  kiem('tên hàm cốt truyện không trùng lệnh gốc hay hàm của chương khác', moi.every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t)));
  kiem('thứ tự trong Sổ lệnh: hàm của che-sung-hoi đứng sau hàm của omni (slide_l) và trước hàm của nam châm (grip)', SoLenh.ds.findIndex((h) => h.ten === 'jet_back') > SoLenh.ds.findIndex((h) => h.ten === 'slide_l') && SoLenh.ds.findIndex((h) => h.ten === 'kick_ahead') < SoLenh.ds.findIndex((h) => h.ten === 'grip'));
  kiem('SanHoc.LENH_NGUOC khớp bảng Sổ lệnh với shoot / shoot_back', ['shoot', 'shoot_back'].every((t) => SanHoc.LENH_NGUOC[t] === SoLenh.lenhGoc.find((l) => l.ten === t).nguoc));
}

/* ================================================================= 5. MƯỜI MÀN CHE-SUNG-HOI */
console.log('\n== 5. Chương che-sung-hoi: dữ liệu và luật từng màn ==');
const BANG = [];
{
  const vt = ThuTu.thuTu.indexOf('che-sung-hoi') + 1;
  kiem('đúng 10 màn, số 1..10, mã che-sung-hoi.1…, id theo vị trí trong thuTu (ngay sau sung-hoi), tên "Chế lệnh súng hơi"',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === vt + '.' + (i + 1) && m.ma === 'che-sung-hoi.' + (i + 1)) && ThuTu.thuTu.indexOf('che-sung-hoi') === ThuTu.thuTu.indexOf('sung-hoi') + 1 && ThuTu.ten['che-sung-hoi'] === 'Chế lệnh súng hơi' && ThuTu.laDot2('che-sung-hoi'));
  kiem('tên các màn: Lùi bằng giật, Tiến bằng giật, Giật tới giật lùi, Đá thùng sang phải, Bắn nút rồi về, Đá thùng sang trái, Súng lắp ngược, Nòng sau hỏng, Đường về, Kho hàng; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-sung-hoi "Huy hiệu Chế lệnh súng hơi"',
    J(che.map((m) => m.ten)) === J(['Lùi bằng giật', 'Tiến bằng giật', 'Giật tới giật lùi', 'Đá thùng sang phải', 'Bắn nút rồi về', 'Đá thùng sang trái', 'Súng lắp ngược', 'Nòng sau hỏng', 'Đường về', 'Kho hàng']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-sung-hoi' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh súng hơi');
  kiem('mọi màn: xe hai bánh gắn súng hơi (robot { than "hai-banh", tay "hoi", camBien [] }), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, cauTruc for/if/while, nhipTheoLoiGiai',
    che.every((m) => m.loaiRobot === 'banh' && J(m.robot) === J({ than: 'hai-banh', tay: 'hoi', camBien: [] }) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while"]' && m.nhipTheoLoiGiai === true));
  kiem('khay: đủ bánh (cả lùi) và hai nòng ở mọi màn trừ 8; 8 hỏng nòng sau: khay = phần cứng = trừ shoot_back; không màn nào còn push',
    che.every((m) => J(m.hamGoc) === J(m.so === 8 ? KHAY_HONG : KHAY) && !m.hamGoc.includes('push')) && che.every((m) => m.so === 8 || m.phanCung === undefined));
  kiem('lệnh chế ở từng màn (taoHam): jet_back, jet_fwd, —, kick_right, tap_right, kick_left, —, kick_ahead, —, —; 7 sửa fixed_kick và 9 viết come_back là HÀM CỦA MÀN (không hàm của em mới)',
    J(che.map((m) => m.taoHam)) === J([['jet_back'], ['jet_fwd'], [], ['kick_right'], ['tap_right'], ['kick_left'], [], ['kick_ahead'], [], []]) && [7, 9].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) &&
      J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["fixed_kick"]' && J(man(9).loiGiai.hamCuaMan.map((h) => h.ten)) === '["go_out","come_back"]');
  kiem('mục tiêu: mọi màn bong-mo có bongMo, không có chữ F, D, X, h; thùng H chỉ ở màn có thùng mờ (4, 6, 7, 8, 10); chinhCoDinh ở mọi màn trừ 3 và 10; khoaHamMan ["go_out"] chỉ ở 9; daoChieu ["sung"] + canhBao chỉ ở 7; phanCung + canhBao chỉ ở 8; gioiHanHam 4 chỉ ở 10; ô ◆ ở 3, 9; cửa C ở 5, 10; nút N ở 5, 10',
    che.every((m) => m.mucTieu === 'bong-mo' && !!m.bongMo && !/[FDXh]/.test(sanCua(m).flat().join('')) && /H/.test(sanCua(m).flat().join('')) === [4, 6, 7, 8, 10].includes(m.so) && [].concat(m.bongMo).every((b) => !!b.thung === [4, 6, 7, 8, 10].includes(m.so)) &&
      (m.chinhCoDinh === true) === ![3, 10].includes(m.so) && (m.so === 9) === (J(m.khoaHamMan) === '["go_out"]') && (m.so === 7 ? J(m.daoChieu) === '["sung"]' && /lắp ngược/.test(m.canhBao) : m.daoChieu === undefined) && (m.so === 8) === !!m.phanCung && (m.so === 10 ? m.gioiHanHam === 4 : m.gioiHanHam === undefined) &&
      ([3, 9].includes(m.so) === !!(m.bongMo.diQua && m.bongMo.diQua.length)) && ([5, 10].includes(m.so) === (/C/.test(m.san.join('')) && /N/.test(m.san.join(''))))));
  kiem('sân ≤ 7 cột × 9 hàng; một sân mỗi màn', che.every((m) => !Array.isArray(m.san[0]) && m.san.length <= 9 && m.san[0].length <= 7));

  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfs = nhipCheSungHoiTatCa(m, kho);
    BANG.push({ m, r, bfs });
    kiem(m.id + ': BFS đường ngắn nhất = ' + bfs + ' ≤ sao.nhip ' + m.sao.nhip, bfs !== null && bfs <= m.sao.nhip, 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
      const rong = ChamHoc.cham(m, { chinh: [], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính RỖNG gửi lên vẫn chạy bản mẫu (cùng nhịp, cùng sao)', rong.thang === r.thang && rong.sao === r.sao && rong.soNhip === r.soNhip);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, gọi hàm đã chế)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // bóng mờ: nằm trên ô đi được; chạy xong thắng đúng ở nhịp cuối
    kiem(m.id + ': bóng mờ nằm trên ô đi được; thùng mờ trùng số thùng của sân; chạy xong thắng đúng ở nhịp cuối', (() => {
      const lm = SanHoc.lopMauCuaSan(m, 0), sn = SanHoc.docSan(m.san, lm.mau, lm.vatMau, lm.vatChat), bm = m.bongMo, rs = r.theoSan[0];
      return !SanHoc.lyDoChan(sn, 'banh', bm.x, bm.y) && (bm.thung ? bm.thung.length === sn.thung.length && bm.thung.every((q) => !SanHoc.lyDoChan(sn, 'banh', q.x, q.y)) : sn.thung.length === 0) &&
        rs.thang && rs.bongMo.x === bm.x && rs.bongMo.huong === bm.huong && nhipVet(rs).slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo');
    })());
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (Array.isArray(c.hamCuaEmMoi) || c.baiLam) && J({ b: c.baiLam || m.loiGiai, h: c.hamCuaEmMoi || [] }) !== J({ b: m.loiGiai, h: m.loiGiai.hamCuaEmMoi })));
    m.congThucKhac.forEach((c, i) => {
      const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && maLoi(rc).length === 0, J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
    });
    const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && !maCua(rk).includes('tran-khung'), J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip, cd: maCua(rk) }));
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    const khoaTen = m.khoaHamMan || [];
    const suaTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => !khoaTen.includes(h.ten)).map((h) => h.ten));
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (suaTen.join(', ') || 'màn dùng') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '()')), m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút trên giao diện (bấm); đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm/i.test(m.goiY.join(' ')), m.deBai);
  }

  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id);
  kiem('20.1 Lùi bằng giật: chưa chế jet_back thì không thắng (xe đứng sẵn ở sân, xe mờ ở ô sau); jet_back cách 1 (shoot + wait) và bánh lùi đều 1 nhịp; BFS 1', !ChamHoc.cham(m1, m1.maMau, k1).thang && m1.bongMo.y - m1.batDau.y === 1 && nhipCheSungHoiTatCa(m1, k1) === 1 && m1.sao.nhip === 1);
  const m2 = man(2), k2 = khoTruoc(m2.id);
  kiem('20.2 Tiến bằng giật: xe mờ ở ô trước xe một ô; jet_fwd = shoot_back + wait; BFS 1', m2.batDau.y - m2.bongMo.y === 1 && nhipCheSungHoiTatCa(m2, k2) === 1 && J(m2.loiGiai.hamCuaEmMoi[0].than) === J(['shoot_back()', 'wait()']));
  const m3 = man(3), k3 = khoTruoc(m3.id);
  kiem('20.3 Giật tới giật lùi: ◆ cách xe 3 ô phía sau, xe mờ 1 ô phía sau; lùi hai ô rồi tiến một: đúng chỗ nhưng chưa qua ◆ (chua-qua-diem); dùng jet_back, jet_fwd, for; BFS 5 = sao.nhip', (() => {
    const sai = ChamHoc.cham(m3, m3.loiSai[1].baiLam, k3);
    return m3.bongMo.diQua[0].y - m3.batDau.y === 3 && m3.bongMo.y - m3.batDau.y === 1 && maCua(sai).includes('chua-qua-diem') && !maCua(sai).includes('lech-bong-mo') && nhipCheSungHoiTatCa(m3, k3) === 5 && m3.loiGiai.chinh.length <= 10;
  })());
  const m4 = man(4), k4 = khoTruoc(m4.id);
  kiem('20.4 Đá thùng sang phải: thùng ngay bên phải xe trượt tới mép (4,2); cách 1 quay trái-bắn-quay phải 3 nhịp, cách 2 quay phải-bắn ra sau-quay trái cũng 3 nhịp; BFS 3', m4.bongMo.thung[0].x === 4 && m4.bongMo.thung[0].y === m4.batDau.y && nhipCheSungHoiTatCa(m4, k4) === 3 && ChamHoc.cham(m4, m4.loiGiai, tron(k4, m4.loiGiai.hamCuaEmMoi)).soNhip === 3 && ChamHoc.cham(m4, m4.congThucKhac[0].baiLam || m4.loiGiai, tron(k4, m4.congThucKhac[0].hamCuaEmMoi)).soNhip === 3);
  const m5 = man(5), k5 = khoTruoc(m5.id);
  kiem('20.5 Bắn nút rồi về: nút ở tường bên phải, cửa chắn lối lên chỗ xe mờ; bỏ bước tiến lại thì xe lệch cột và đâm tường; BFS 6 = sao.nhip', (() => {
    const sai = ChamHoc.cham(m5, m5.loiSai[0].baiLam, tron(k5, m5.loiSai[0].hamCuaEmMoi));
    return maCua(sai).includes('dam-tuong') && nhipCheSungHoiTatCa(m5, k5) === 6 && m5.sao.nhip === 6 && /N/.test(m5.san[2]) && /C/.test(m5.san[1]);
  })());
  const m6 = man(6), k6 = khoTruoc(m6.id);
  kiem('20.6 Đá thùng sang trái: hai thùng hai bên, chương trình chính gọi kick_right() rồi kick_left(); chép nguyên kick_right() vào kick_left() thì không thắng; BFS 4 < sao.nhip 6 (có đường tắt ngắn hơn, nên nhipTheoLoiGiai)', (() => {
    const sai = ChamHoc.cham(m6, m6.loiSai[0].baiLam, tron(k6, m6.loiSai[0].hamCuaEmMoi));
    return !sai.thang && J(m6.maMau.chinh) === J(['kick_right()', 'kick_left()']) && nhipCheSungHoiTatCa(m6, k6) < m6.sao.nhip && m6.nhipTheoLoiGiai === true;
  })());
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const cu = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('20.7 Súng lắp ngược: hàm của màn fixed_kick() cũ (giống kick_right) chạy sai (xe đi trái, thùng đứng); đổi shoot() thành shoot_back() hoặc đổi hướng quay thì thắng', !cu.thang && maCua(cu).includes('lech-bong-mo') && ChamHoc.cham(m7, m7.loiGiai, k7).thang && ChamHoc.cham(m7, m7.congThucKhac[0].baiLam, k7).thang && !ChamHoc.cham(m7, { chinh: ['kick_right()'] }, k7).thang);
  const m8 = man(8), k8 = khoTruoc(m8.id);
  kiem('20.8 Nòng sau hỏng: thùng ngay trước xe, chỉ còn shoot(): phải quay đầu rồi bắn rồi quay đầu lại (3 nhịp với u_turn một nhịp); BFS 3; dùng shoot_back báo lenh-goc-hong', (() => {
    const hong8 = ChamHoc.cham(m8, m8.loiSai[0].baiLam, tron(k8, m8.loiSai[0].hamCuaEmMoi));
    return nhipCheSungHoiTatCa(m8, k8) === 3 && m8.sao.nhip === 3 && maCua(hong8).includes('lenh-goc-hong') && m8.bongMo.thung[0].y === 0 && m8.san[1][2] === 'H' && m8.batDau.y === 2;
  })());
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const pre = ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: ['go_out()'], hamCuaMan: m9.maMau.hamCuaMan }, k9);
  kiem('20.9 Đường về: go_out() của màn đưa xe tới ◆ (4 nhịp: lùi, quay phải, lùi, lùi); come_back() là lệnh NGƯỢC theo thứ tự ngược (jet_fwd, jet_fwd, turn_left, jet_fwd); go_out khóa và xem được; tổng 8 nhịp = BFS',
    pre.theoSan[0].soNhip === 4 && pre.theoSan[0].diQua[0].da === true && viTri(pre.theoSan[0].robot) === '1,2' && J(m9.khoaHamMan) === '["go_out"]' && m9.maMau.hamCuaMan.some((h) => h.ten === 'go_out') && J(m9.maMau.hamCuaMan[1].than) === J(['pass']) && nhipCheSungHoiTatCa(m9, k9) === 8 && m9.sao.nhip === 8);
  kiem('20.9: sửa go_out gửi lên vẫn bị bản mẫu thay (khoaHamMan); để nguyên pass hay làm lại đúng thứ tự cũ thì không thắng; come_back và go_out không vào kho', (() => {
    const a = ChamHoc.cham(m9, { chinh: [], hamCuaMan: [H('go_out', ['jet_back()']), m9.loiGiai.hamCuaMan[1]] }, k9), b = ChamHoc.cham(m9, m9.loiGiai, k9);
    return J([a.thang, a.soO, a.soNhip]) === J([b.thang, b.soO, b.soNhip]) && b.sao === 3 && !k9.some((h) => h.ten === 'come_back' || h.ten === 'go_out') && m9.taoHam.length === 0;
  })());
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  const gh = ChamHoc.cham(m10, m10.loiSai[3].baiLam, k10);
  kiem('20.10 Kho hàng: gioiHanHam 4 — lời giải gọi 4 hàm khác nhau (kick_right, kick_left, forward, tap_right) vừa giới hạn; 5 hàm khác nhau bị qua-gioi-han-ham (nêu "4"); trùm không khóa chương trình chính; BFS 11 < sao.nhip 13',
    r10.thang && J([...new Set(m10.loiGiai.chinh.map((s) => s.replace(/\(.*\)/, '')))].sort()) === J(['forward', 'kick_left', 'kick_right', 'tap_right']) && maCua(gh).join() === 'qua-gioi-han-ham' && /4/.test(gh.chanDoan[0].loi) && !gh.thang && m10.chinhCoDinh !== true && nhipCheSungHoiTatCa(m10, k10) === 11);
  kiem('20.10: công thức khác dùng move() cũng đúng bốn hàm khác nhau (kick_right, kick_left, move, tap_right) và thắng', (() => { const rk = ChamHoc.cham(m10, m10.congThucKhac[0].baiLam, k10); return rk.thang && maLoi(rk).length === 0; })());

  console.log('\n  Bảng 10 màn che-sung-hoi (lời giải cách 1, sao; BFS = nhịp ngắn nhất, lệnh bắn một nhịp riêng)');
  console.log('  màn   | tên                  | ô  | nhịp | BFS | tạo / sửa      | lời giải (chương trình chính)');
  for (const { m, bfs } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(20) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfs).padEnd(3) + ' | ' + (m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',') || (m.loiGiai.hamCuaMan.length ? 'hàm của màn' : '—')).padEnd(14) + ' | ' + m.loiGiai.chinh.join(' ; '));
  }
}

/* ================================================================= 6. ĐƯỜNG BFS CHẠY THẬT */
console.log('\n== 6. Đường BFS (do-duong-che-sung-hoi.mjs) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS ==');
{
  for (const m of che.filter((x) => !x.khoaHamMan)) {
    const b = nhipCheSungHoiNganNhat(m);
    const code = chuoiThanhMa(b.chuoi, m);
    const k = SanHoc.chay(cfgSan(m, 0), code);
    kiem(m.id + ': đường BFS (' + b.nhip + ' nhịp) đổi thành lệnh gốc theo phần cứng / daoChieu của màn rồi chạy SanHoc.chay: thắng đúng số nhịp BFS, không lỗi', k.thang === true && k.nhip === b.nhip && !k.loi, J([b.nhip, k.thang, k.nhip, k.loi]));
  }
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const bf = nhipCheSungHoiTatCa(m9, k9);
  const r = ChamHoc.cham(m9, m9.loiGiai, k9);
  kiem('20.9: tính cả đoạn go_out() cố định (4 nhịp chạy thật) + BFS còn lại 4 = ' + bf + '; lời giải chuẩn chạy thật cũng ' + r.soNhip + ' nhịp', bf === 8 && r.thang && r.soNhip === bf, J([bf, r.thang, r.soNhip]));
  const m1 = man(1);
  kiem('bộ dò tự kiểm: bỏ yêu cầu xe mờ khác chỗ xuất phát (xe mờ ở chỗ xe đứng) thì chương trình rỗng là xong: 0 nhịp', nhipCheSungHoiNganNhat(Object.assign({}, m1, { bongMo: { x: m1.batDau.x, y: m1.batDau.y, huong: m1.batDau.huong } })).nhip === 0);
  kiem('bộ dò: thiếu cả hai nòng thì phải lùi bằng bánh (vẫn 1 nhịp); thiếu bánh lùi và nòng thì không lùi được', (() => {
    const b1 = nhipCheSungHoiNganNhat(m1, { phanCung: BANH }).nhip, b2 = nhipCheSungHoiNganNhat(m1, { phanCung: ['left_move', 'right_move', 'wait'] }).nhip;
    return b1 === 1 && (b2 === null || b2 > 1);
  })());
  kiem('bộ dò: toiDaTrangThai nhỏ → catNgang true (không kết luận)', nhipCheSungHoiNganNhat(man(10), { toiDaTrangThai: 100 }).catNgang === true);
}

/* ================================================================= 7. KHO CUỐI GAME */
console.log('\n== 7. Kho hàm của em ==');
{
  const cuoi = khoTruoc('het');
  kiem('kho cuối game có đủ sáu hàm của che-sung-hoi và tên cốt truyện khóa; fixed_kick, come_back, go_out (hàm của màn) không có trong kho', ['jet_back', 'jet_fwd', 'kick_right', 'tap_right', 'kick_left', 'kick_ahead'].every((t) => cuoi.some((h) => h.ten === t)) && ['fixed_kick', 'come_back', 'go_out'].every((t) => !cuoi.some((h) => h.ten === t)));
  const sach = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('KhoHam khóa tên: người chơi không tạo được hàm tên jet_back / kick_right… bằng tên trùng ngoài màn chế nó', ['jet_back', 'jet_fwd', 'kick_right', 'tap_right', 'kick_left', 'kick_ahead'].every((t) => tenCotTruyen.includes(t)) && sach.tao('jet_back', [], {}).ok === false);
}

/* ================================================================= 8. THẺ SCRIPT CỦA GAME */
console.log('\n== 8. game/choi.html nạp man-che-sung-hoi.js đúng thứ tự ==');
{
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-sung-hoi.js đúng một lần, sau man-sung-hoi.js và trước man-khoang-cach.js (cùng sổ màn)', tags.filter((t) => t === '../man-che-sung-hoi.js').length === 1 && vtri('man-che-sung-hoi.js') === vtri('man-sung-hoi.js') + 1 && vtri('man-che-sung-hoi.js') < vtri('man-khoang-cach.js'), J(tags));
  kiem('so-lenh.js nạp trước man-che-sung-hoi.js', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-sung-hoi.js'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
