/* ============================================================================
   kiem-che-xich.mjs — máy kiểm chương `che-xich` (Chế lệnh xích) của "Học lập trình" và các luật lõi nó dùng (KE-HOACH-CHE-LENH.md, mục 5c.1).
   Gồm:
   - daoChieu ['trai'] / ['phai'] trên XE XÍCH (đấu dây ngược): left_move() làm xích trái quay lùi…; vết lệnh vẫn ghi tên lệnh gọi, vết nhịp ghi giá trị bánh THẬT; cấu hình sai bị từ chối;
   - màn hỏng (phanCung thiếu left_move): gọi lệnh hỏng (cả gián tiếp qua hàm của em) → lenh-goc-hong nói "Xích trái hỏng…" / canhBao của màn;
   - bóng mờ với xích: quay dở lúc xong không cản thắng, tay hạ thì xe không quay, bongMo.cam / bongMo.vat với tay kẹp, ô ◆;
   - bộ dò đường tắt do-duong-che-xich.mjs: BFS khớp tay với san-hoc.js (hơn nghìn chương trình ngẫu nhiên: bóng mờ, ◆, vật, tay, daoChieu, phanCung) và kiểm chính bộ dò;
   - Sổ lệnh có đủ năm hàm mới (so-lenh.js; to_hill, back_home, fixed_drive, fixed_turn là HÀM CỦA MÀN nên không có ở đó; tr_right được SỬA ở che-xich.9 chứ không tạo mới);
   - 10 màn che-xich: lời giải 3 sao, mọi công thức khác thắng, lời giải khác đúng 2 sao, lời sai đúng mã, chinhCoDinh chặn chương trình chính gửi lên,
     nhịp: đường ngắn nhất BFS không dài hơn sao.nhip (bằng nhau trừ màn 10), BFS đổi thành lệnh gốc chạy SanHoc.chay thắng đúng nhịp BFS;
   - huy hiệu che-xich và thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs. Luật quay chậm của xích: kiem-xich.mjs.
   Chạy: node hoc/kiem-che-xich.mjs        (trượt thì thoát mã 1)
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
const DoDuong = await import('./do-duong-che-xich.mjs');
const { nhipCheXichNganNhat, nhipCheXichTatCa, chuoiThanhMa, toHopChoPhep, dungNguCanh, trangThaiDau, buocMotNhip, laThang } = DoDuong;

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
const che = tatCa.filter((m) => m.chuong === 'che-xich');
const man = (so) => ManHoc.timMa('che-xich.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const VT = ThuTu.thuTu.indexOf('che-xich') + 1;               // số thứ tự của chương che-xich (không ghi cứng)

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

const XICH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const XICH_TAY = XICH.concat(['arm_down', 'arm_up', 'grab', 'release']);
const trong = (n) => Array.from({ length: n }, () => '.'.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'xich', hamGoc: XICH }, extra || {}), code);
}
const QP = L('left_move()', 'wait()', 'left_move()', 'wait()');             // quay phải 90° (hai nhịp cùng tổ hợp)
const huongSau = (code, h0, extra) => chay(trong(7), { x: 3, y: 3, huong: h0 }, code, extra).robot.huong;
/** Cấu hình SanHoc.chay của sân thứ i của màn m (như ChamHoc.cham truyền xuống). */
function cfgSan(m, i, extra) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({ san: sanCua(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, loaiRobot: 'xich', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co',
    bongMo: lm.bongMo || undefined, daoChieu: m.daoChieu, nhipToiDa: 200 }, extra || {});
}

/* ================================================================= 1. ĐẤU DÂY NGƯỢC TRÊN XÍCH (daoChieu 'trai' / 'phai') */
console.log('\n== 1. daoChieu trên xe xích: đấu dây ngược một hay hai xích ==');
{
  const bd = { x: 3, y: 3, huong: 0 };
  const dc = (code, dao, extra) => chay(trong(7), bd, code, Object.assign({ daoChieu: dao }, extra || {}));
  const MOVE_CU = L('left_move()', 'right_move()', 'wait()');
  const thuong = dc(MOVE_CU, []);
  kiem('đối chứng (không đảo): left_move() + right_move() + wait() tiến một ô', thuong.robot.x === 3 && thuong.robot.y === 2 && thuong.robot.huong === 0);
  const d1 = dc(MOVE_CU, ['trai']);
  kiem('daoChieu ["trai"]: left_move() làm xích trái quay LÙI, right_move() tiến → xe không đi, chỉ nhích nửa vòng quay trái (bánh THẬT ghi (-1, 1) ở vết nhịp)',
    d1.robot.x === 3 && d1.robot.y === 3 && nhipVet(d1)[0].robot.banh.trai === -1 && nhipVet(d1)[0].robot.banh.phai === 1 && ev(d1, 'quay-nua').length === 1, J(nhipVet(d1)[0].robot.banh));
  const d2 = dc(MOVE_CU + MOVE_CU, ['trai']);
  kiem('daoChieu ["trai"]: hai lần liền "move() cũ" cộng lại thành quay trái 90° (hai nhịp cùng tổ hợp thật)', d2.robot.huong === 3 && d2.robot.x === 3 && d2.robot.y === 3);
  const d3 = dc(L('left_back()', 'right_move()', 'wait()'), ['trai']);
  kiem('daoChieu ["trai"]: left_back() làm xích trái quay TỚI thật nên left_back() + right_move() tiến một ô (bản sửa của fixed_drive)', d3.robot.x === 3 && d3.robot.y === 2 && d3.robot.huong === 0);
  const d4 = dc(L('left_back()', 'wait()', 'left_back()', 'wait()'), ['trai']);
  kiem('daoChieu ["trai"]: hai lần left_back() + wait() quay PHẢI 90° (bản sửa của fixed_turn)', d4.robot.huong === 1);
  kiem('vết lệnh vẫn ghi tên lệnh người chơi gọi (left_back, right_move, wait)', d3.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).join() === 'left_back,right_move,wait');
  const d5 = dc(L('right_back()', 'wait()', 'right_back()', 'wait()'), ['trai']);
  kiem('daoChieu ["trai"] không đổi xích phải: right_back() + wait() hai lần vẫn quay phải 90° (cách khác sửa fixed_turn)', d5.robot.huong === 1);
  const d6 = dc(L('left_move()', 'right_move()', 'wait()'), ['trai', 'phai']);
  kiem('daoChieu ["trai", "phai"]: left_move() + right_move() thành LÙI một ô (xe không quay)', d6.robot.x === 3 && d6.robot.y === 4 && d6.robot.huong === 0);
  const nem = (f) => { try { f(); return false; } catch (e) { return /daoChieu/.test(e.message); } };
  kiem('cấu hình sai bị từ chối: tên lạ ("giua"); daoChieu không phải mảng', nem(() => dc('', ['giua'])) && nem(() => dc('', 'trai')));
  kiem('bộ dò: toHopChoPhep tính theo bánh THẬT; chuoiThanhMa đổi lại thành lệnh người chơi gọi (đảo trái: bánh trái tới thật → left_back())',
    J(toHopChoPhep({ phanCung: XICH, daoChieu: [] }).map((x) => x.join())) === J(['0,0', '0,1', '0,-1', '1,0', '1,1', '1,-1', '-1,0', '-1,1', '-1,-1']) &&
      /left_back\(\)/.test(chuoiThanhMa([{ tuThe: null, kep: null, banh: [1, 1] }], { daoChieu: ['trai'] })) && /left_move\(\)/.test(chuoiThanhMa([{ tuThe: null, kep: null, banh: [1, 1] }], { daoChieu: [] })));
  const sk = nhipCheXichNganNhat({ loaiRobot: 'xich', san: ['....F'], batDau: { x: 0, y: 0, huong: 1 }, hamGoc: XICH, daoChieu: ['trai'] });
  const k = chay(['....F'], { x: 0, y: 0, huong: 1 }, chuoiThanhMa(sk.chuoi, { daoChieu: ['trai'] }), { daoChieu: ['trai'] });
  kiem('bộ dò với daoChieu ["trai"]: đường tới cờ 4 ô = 4 nhịp; mã sinh ra (đã đảo) chạy trong san-hoc.js thắng đúng 4 nhịp', sk.nhip === 4 && k.thang && k.nhip === 4, J([sk.nhip, k.thang, k.nhip]));
  const thuSan = ChamHoc.thuHam(Object.assign({}, man(8)), { chinh: [], hamCuaMan: man(8).maMau.hamCuaMan }, 'fixed_drive', khoTruoc(man(8).id), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 3, huong: 0 }, vat: [] } });
  kiem('sân thử của Xưởng hàm dùng daoChieu của màn: fixed_drive() cũ chỉ nhích nửa vòng quay trái, xe không rời ô', thuSan.robot.x === 2 && thuSan.robot.y === 3 && thuSan.robot.huong === 0, J(thuSan.robot));
}

/* ================================================================= 2. MÀN HỎNG: XÍCH TRÁI KẸT SỐ LÙI */
console.log('\n== 2. Màn hỏng: phanCung thiếu left_move ==');
{
  const m9 = man(9);
  kiem('che-xich.9 hỏng: hamGoc = phanCung = right_move, left_back, right_back, wait (không left_move) và canhBao "Xích trái hỏng số tiến"',
    J(m9.phanCung) === J(m9.hamGoc) && !m9.phanCung.includes('left_move') && ['right_move', 'left_back', 'right_back', 'wait'].every((t) => m9.phanCung.includes(t)) && /Xích trái hỏng/.test(m9.canhBao));
  const k = ChamHoc.cham(m9, { chinh: ['move()'] }, khoTruoc(m9.id));
  const cd = k.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('gọi move() (cần left_move) ở màn hỏng: lenh-goc-hong (không phải ham-chua-co), lời nêu canhBao và tên lệnh left_move, chỉ dòng của move trong hàm của em',
    !!cd && cd.ten === 'left_move' && /Xích trái hỏng/.test(cd.loi) && /left_move\(\) không chạy được/.test(cd.loi) && !maCua(k).includes('ham-chua-co') && cd.cho && cd.cho.cot === 'hamEm' && cd.cho.ten === 'move', J(k.chanDoan));
  const k2 = ChamHoc.cham(Object.assign({}, m9, { canhBao: undefined }), { chinh: ['move()'] }, khoTruoc(m9.id));
  kiem('không khai canhBao: lời mặc định "Bánh trái hỏng"', /Bánh trái hỏng/.test((k2.chanDoan.find((c) => c.ma === 'lenh-goc-hong') || {}).loi || ''));
  const k3 = ChamHoc.cham(m9, { chinh: ['tr_left()', 'tr_left()'] }, khoTruoc(m9.id));
  kiem('tr_left() (chỉ dùng xích phải) chạy được ở màn hỏng: không lenh-goc-hong, quay trái hai lần thì quay đầu', !maCua(k3).includes('lenh-goc-hong') && k3.theoSan[0].robot.huong === 3);
  const k4 = ChamHoc.cham(m9, { chinh: ['spin()'] }, khoTruoc(m9.id));
  kiem('spin() chưa sửa tr_right() cũng báo lenh-goc-hong (hàm gọi hàm: tr_right gọi left_move)', maCua(k4).includes('lenh-goc-hong'));
  const suaTR = tron(khoTruoc(m9.id), m9.loiGiai.hamCuaEmMoi);
  const k5 = ChamHoc.cham(m9, { chinh: ['spin()'] }, suaTR);
  kiem('sửa tr_right() xong thì spin() chạy lại được (không lỗi, xe quay đầu sau 4 nhịp)', !maCua(k5).includes('lenh-goc-hong') && k5.theoSan[0].robot.huong === 3 && k5.soNhip === 4, J(maCua(k5)));
  const dem = (phanCung) => toHopChoPhep({ phanCung }).length;
  kiem('bộ dò: phần cứng thiếu left_move có ít tổ hợp hơn (6 thay vì 9), không có tổ hợp tiến (1, 1); màn thường đủ 9',
    dem(m9.phanCung) === 6 && !toHopChoPhep(m9).some(([t, p]) => t === 1 && p === 1) && toHopChoPhep(man(1)).length === 9);
}

/* ================================================================= 3. BÓNG MỜ VỚI XÍCH */
console.log('\n== 3. Bóng mờ với xe xích: quay dở, tay hạ, vật mờ, xe mờ cầm vật, ô ◆ ==');
{
  const SAN = trong(5), bd = { x: 2, y: 2, huong: 0 };
  const BM = (bongMo, code, extra) => chay(SAN, bd, code, Object.assign({ mucTieu: 'bong-mo', bongMo }, extra || {}));
  const qp = L('left_move()', 'wait()', 'left_move()', 'wait()');
  const bm1 = BM({ x: 2, y: 2, huong: 1 }, qp);
  kiem('quay phải đủ hai nhịp rồi dừng: xe đúng tư thế xe mờ (cùng ô, quay phải): thắng, nhịp cuối ghi toi-bong-mo', bm1.thang === true && bm1.nhip === 2 && ev(bm1, 'toi-bong-mo').length === 1);
  const bm2 = BM({ x: 2, y: 2, huong: 1 }, L('left_move()', 'wait()'));
  kiem('mới quay nửa vòng thì xe chưa đổi hướng nên chưa thắng; ghi xich-quay-do (cuoi) và lech-bong-mo nói quay mặt lên', bm2.thang === false && bm2.quayDo === 1 && ev(bm2, 'xich-quay-do').length === 0 && bm2.suKien.some((e) => e.ma === 'xich-quay-do' && e.cuoi === true));
  const m1 = man(1), k1 = ChamHoc.cham(m1, { chinh: ['wait()'] }, tron(khoTruoc(m1.id), [H('spin', ['wait()'])]));
  kiem('màn che-xich.1 với spin() chưa làm gì (chỉ wait()): lech-bong-mo "đúng chỗ nhưng quay mặt lên, bóng mờ quay mặt xuống"', k1.chanDoan.some((c) => c.ma === 'lech-bong-mo' && /quay mặt lên, còn bóng mờ quay mặt xuống/.test(c.loi)), J(k1.chanDoan));
  const bm3 = BM({ x: 2, y: 2, huong: 0, diQua: [{ x: 2, y: 1 }] }, L('wait()'));
  kiem('◆ chưa ghé thì không thắng dù xe đứng đúng chỗ (xe chưa qua điểm ◆)', bm3.thang === false && bm3.diQua[0].da === false);
  const bm4 = BM({ x: 2, y: 2, huong: 0, diQua: [{ x: 2, y: 1 }] }, L('left_move()', 'right_move()', 'wait()', 'left_back()', 'right_back()', 'wait()'));
  kiem('◆ ghé rồi về lại ô xe mờ: thắng, ghi qua-diem', bm4.thang === true && ev(bm4, 'qua-diem').length === 1);
  // tay kẹp + vật mờ + xe mờ cầm vật
  const SANV = dat1(trong(5), 2, 3, 'o');
  const TAY = (bongMo, code) => chay(SANV, bd, code, { hamGoc: XICH_TAY, mucTieu: 'bong-mo', bongMo });
  const nhat = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()');
  const quay2 = (l) => L(l + '()', 'wait()', l + '()', 'wait()', l + '()', 'wait()', l + '()', 'wait()');       // quay đầu: bốn nhịp cùng tổ hợp
  const t1 = TAY({ x: 2, y: 2, huong: 0, cam: true }, quay2('left_move') + nhat + quay2('left_move'));
  kiem('nhặt vật sau lưng (quay đầu, nhặt, quay đầu lại): xe đúng ô và hướng cũ, đang cầm vật: thắng với bongMo.cam true', t1.thang === true && t1.tay.cam !== null && t1.bongMo.cam === true);
  const t2 = TAY({ x: 2, y: 2, huong: 0, cam: true }, quay2('left_move') + L('arm_down()', 'grab()', 'wait()') + quay2('left_move'));
  kiem('quay đầu khi tay còn hạ: tay vướng sàn nên xe không quay, quay dở mất (tay-vuong), không thắng', t2.thang === false && ev(t2, 'tay-vuong').length >= 1 && t2.robot.huong === 2);
  const t3 = TAY({ x: 2, y: 2, huong: 0, vat: [{ x: 2, y: 3 }] }, L('wait()'));
  kiem('vật mờ khai đúng chỗ vật đang nằm, xe chưa động: thắng (đối chứng vật mờ với xích)', t3.thang === true);
  const t4 = TAY({ x: 2, y: 2, huong: 0, vat: [{ x: 3, y: 3 }] }, L('wait()'));
  kiem('vật nằm lệch vật mờ một ô: không thắng, lech-bong-mo nói "Một vật chưa nằm đúng ô"', t4.thang === false);
  const manBM = { chuong: 'thu', loaiRobot: 'xich', hamGoc: XICH_TAY, moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: [], mucTieu: 'bong-mo', san: SANV, batDau: bd, bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 3, y: 3 }] } };
  const kl = ChamHoc.cham(manBM, { chinh: [] }, []);
  kiem('chẩn đoán lech-bong-mo của xích nói bằng lời "Một vật chưa nằm đúng ô như bóng mờ."', kl.chanDoan.some((c) => c.ma === 'lech-bong-mo' && /Một vật chưa nằm đúng ô như bóng mờ\./.test(c.loi)), J(kl.chanDoan));
}

/* ================================================================= 4. SỔ LỆNH */
console.log('\n== 4. Sổ lệnh: năm hàm mới của che-xich ==');
{
  const moi = ['spin', 'sidestep', 'climb', 'descend', 'pick_behind'];
  kiem('SoLenh.theoChuong("che-xich") đúng năm hàm theo thứ tự chế: spin, sidestep, climb, descend, pick_behind; nhóm xich', J(SoLenh.theoChuong('che-xich').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('che-xich').every((h) => h.nhom === 'xich'));
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('to_hill, back_home, fixed_drive, fixed_turn là hàm CỦA MÀN: không là hàm cốt truyện, không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào',
    ['to_hill', 'back_home', 'fixed_drive', 'fixed_turn'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))));
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó (taoHam của màn che-xich)', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'che-xich'));
  kiem('moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối', moi.every((t) => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); }));
  kiem('tên hàm cốt truyện không trùng với lệnh gốc hay hàm của chương khác (mỗi tên đúng một mục Sổ lệnh, đúng một taoHam)',
    moi.every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && tatCa.filter((m) => m.taoHam.includes(t)).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t)));
  const idx = (t) => SoLenh.ds.findIndex((h) => h.ten === t);
  kiem('thứ tự trong Sổ lệnh: hàm của che-xich đứng sau tr_left (xich) và trước slide_r (omni)', idx('spin') > idx('tr_left') && idx('pick_behind') < idx('slide_r'));
  kiem('tr_right được SỬA ở che-xich.9 (hamCuaEmMoi) chứ không tạo mới: mục Sổ lệnh vẫn của chương xich, taoHam của che-xich.9 rỗng',
    SoLenh.tim('tr_right').chuong === 'xich' && J(man(9).taoHam) === '[]' && man(9).loiGiai.hamCuaEmMoi.length === 1 && man(9).loiGiai.hamCuaEmMoi[0].ten === 'tr_right');
}

/* ================================================================= 5. MƯỜI MÀN CHE-XICH */
console.log('\n== 5. Chương che-xich: dữ liệu và luật từng màn ==');
const BANG = [];
{
  kiem('đúng 10 màn, số 1..10, mã che-xich.1…, id theo vị trí trong thuTu (ngay sau xich), tên "Chế lệnh xích"',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === VT + '.' + (i + 1) && m.ma === 'che-xich.' + (i + 1)) && ThuTu.thuTu.indexOf('che-xich') === ThuTu.thuTu.indexOf('xich') + 1 && ThuTu.ten['che-xich'] === 'Chế lệnh xích' && ThuTu.laDot2('che-xich'));
  kiem('tên các màn: Quay đầu, Né sang phải, Đường so le, Leo cầu thang, Lùi xuống bậc, Nhặt sau lưng, Đường về, Xích trái đấu ngược, Xích trái chỉ lùi, Kho trên đồi; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-xich "Huy hiệu Chế lệnh xích"',
    J(che.map((m) => m.ten)) === J(['Quay đầu', 'Né sang phải', 'Đường so le', 'Leo cầu thang', 'Lùi xuống bậc', 'Nhặt sau lưng', 'Đường về', 'Xích trái đấu ngược', 'Xích trái chỉ lùi', 'Kho trên đồi']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-xich' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh xích');
  kiem('mọi màn: xe BÁNH XÍCH (robot { than: "xich", tay: null | "kep" }), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, cauTruc for/if; tay kẹp chỉ ở 6 và 10',
    che.every((m) => m.loaiRobot === 'xich' && m.robot.than === 'xich' && (m.robot.tay === ([6, 10].includes(m.so) ? 'kep' : null)) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if"]'));
  const KHAY_HONG = ['right_move', 'left_back', 'right_back', 'wait'];
  kiem('khay: đủ bốn lệnh bánh (cả lùi) và wait() ở mọi màn trừ 9 (+ bốn lệnh tay kẹp ở 6 và 10); 9 hỏng xích trái: khay = phần cứng = thiếu left_move; không màn nào khác khai phanCung',
    che.every((m) => J(m.hamGoc) === J(m.so === 9 ? KHAY_HONG : [6, 10].includes(m.so) ? XICH_TAY : XICH)) && che.every((m) => m.so === 9 || m.phanCung === undefined) && J(man(9).phanCung) === J(KHAY_HONG));
  kiem('lệnh chế ở từng màn (taoHam): spin, sidestep, —, climb, descend, pick_behind, —, —, —, —; 7 và 8 viết / sửa HÀM CỦA MÀN (không hàm của em mới); 9 sửa tr_right của em',
    J(che.map((m) => m.taoHam)) === J([['spin'], ['sidestep'], [], ['climb'], ['descend'], ['pick_behind'], [], [], [], []]) && [7, 8].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) &&
      J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["to_hill","back_home"]' && J(man(8).loiGiai.hamCuaMan.map((h) => h.ten)) === '["fixed_drive","fixed_turn"]' && J(man(9).loiGiai.hamCuaEmMoi.map((h) => h.ten)) === '["tr_right"]');
  kiem('mục tiêu: 3 tới cờ (có chữ F), còn lại bong-mo có bongMo; chinhCoDinh ở 1, 2, 4, 5, 6, 7, 8 (không ở 3, 9, 10); khoaHamMan ["to_hill"] chỉ ở 7; daoChieu ["trai"] + canhBao chỉ ở 8; phanCung + canhBao chỉ ở 9; gioiHanHam 5 chỉ ở 10; vật chỉ ở 6 và 10 (bongMo.cam ở 6, bongMo.vat ở 10); ◆ chỉ ở 7',
    che.every((m) => (m.so === 3 ? m.mucTieu === undefined && /F/.test(m.san.join('')) && m.bongMo === undefined : m.mucTieu === 'bong-mo' && !!m.bongMo && !/F/.test(m.san.join(''))) &&
      (m.chinhCoDinh === true) === ![3, 9, 10].includes(m.so) && (m.so === 7) === (J(m.khoaHamMan) === '["to_hill"]') &&
      (m.so === 8 ? J(m.daoChieu) === '["trai"]' && /đấu ngược/.test(m.canhBao) : m.daoChieu === undefined) && (m.so === 9) === !!m.phanCung && (m.so === 9 ? /hỏng/.test(m.canhBao) : m.canhBao === undefined || m.so === 8) && (m.so === 10 ? m.gioiHanHam === 5 : m.gioiHanHam === undefined) &&
      (m.so === 6) === !!(m.bongMo && m.bongMo.cam === true) && ([6, 10].includes(m.so) ? /o/.test(m.san.join('')) : !/o/.test(m.san.join(''))) && ((m.so === 7) === !!(m.bongMo && m.bongMo.diQua && m.bongMo.diQua.length === 1)) &&
      (m.so === 10 ? J(m.bongMo.vat) === '[{"x":2,"y":0}]' : m.so === 6 || !(m.bongMo && m.bongMo.vat))));
  kiem('sân ≤ 7 cột × 9 hàng, MỘT sân mỗi màn; xe xuất phát đứng được và không dưới vật', che.every((m) => m.san.length <= 9 && m.san[0].length <= 7 && m.san.every((r) => typeof r === 'string') &&
    !SanHoc.lyDoChan(SanHoc.docSan(m.san), 'xich', m.batDau.x, m.batDau.y) && !SanHoc.docSan(m.san).vat.some((v) => v.x === m.batDau.x && v.y === m.batDau.y)));
  kiem('nhipTheoLoiGiai chỉ ở màn 6 và 10 (pick() / drop() có nhịp nâng tay riêng; 10: đường ngắn nhất 27 nhịp lùi suốt đường cần quá 5 hàm, chuẩn 33 nhịp trong giới hạn); các màn khác sao.nhip = đường ngắn nhất BFS', che.every((m) => (m.nhipTheoLoiGiai === true) === [6, 10].includes(m.so)));

  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfs = nhipCheXichTatCa(m, khoNay);
    BANG.push({ m, r, bfs });
    kiem(m.id + ': BFS đường ngắn nhất = ' + bfs + (m.nhipTheoLoiGiai ? ' ≤' : ' =') + ' sao.nhip ' + m.sao.nhip, bfs !== null && (m.nhipTheoLoiGiai ? bfs <= m.sao.nhip : bfs === m.sao.nhip), 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
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
      const bm = m.bongMo;
      const sn = SanHoc.docSan(m.san);
      kiem(m.id + ': bóng mờ nằm trên ô đi được; số vật mờ đúng bằng số vật của sân (hay có xe mờ cầm vật); chạy xong thắng đúng ở nhịp cuối',
        !SanHoc.lyDoChan(sn, 'xich', bm.x, bm.y) && (bm.vat || []).every((q) => !SanHoc.lyDoChan(sn, 'xich', q.x, q.y)) && (bm.vat || []).length + (bm.cam ? 1 : 0) === sn.vat.length && (bm.diQua || []).every((q) => !SanHoc.lyDoChan(sn, 'xich', q.x, q.y)) &&
          r.thang && r.bongMo.x === bm.x && r.bongMo.huong === bm.huong && nhipVet(r).slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo'));
    } else {
      kiem(m.id + ': mục tiêu tới cờ F; sân có băng chuyền và bậc thang mà xe xích không bị đẩy', m.mucTieu === undefined && m.san.join('').includes('F') && m.bongMo === undefined && /[<>^v]/.test(m.san.join('')) && /S/.test(m.san.join('')));
    }
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
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (suaTen.join(', ') || 'màn dùng') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '(')), m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút; đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm|nút/i.test(m.goiY.join(' ')), m.deBai);
  }

  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id), s1 = tron(k1, m1.loiGiai.hamCuaEmMoi);
  kiem('16.1 Quay đầu: xe xuất phát đúng ô của xe mờ nhưng ngược hướng; spin() 4 nhịp = bốn lần nửa vòng; một tr_right() không đủ; BFS 4',
    J([m1.batDau.x, m1.batDau.y]) === J([m1.bongMo.x, m1.bongMo.y]) && (m1.batDau.huong + 2) % 4 === m1.bongMo.huong && ChamHoc.cham(m1, m1.loiGiai, s1).soNhip === 4 && nhipCheXichTatCa(m1, s1) === 4 &&
      !ChamHoc.cham(m1, m1.loiSai[1].baiLam, tron(k1, m1.loiSai[1].hamCuaEmMoi)).thang);
  const sai1 = ChamHoc.cham(m1, m1.loiSai[2].baiLam, tron(k1, m1.loiSai[2].hamCuaEmMoi));
  kiem('16.1: spin() = tr_right() rồi tr_left() thì hai nửa vòng khác tổ hợp: ghi xich-quay-do và xe giữ nguyên hướng', sai1.chanDoan.some((c) => c.ma === 'xich-quay-do') === false || sai1.theoSan[0].robot.huong === 0);
  const m2 = man(2), k2 = khoTruoc(m2.id);
  kiem('16.2 Né sang phải: xe mờ ở ô bên PHẢI xe, cùng hướng; BFS 5 = quay 2 + đi 1 + quay 2; cách tr_left + back + tr_right cũng 5 nhịp', m2.bongMo.x === m2.batDau.x + 1 && m2.bongMo.y === m2.batDau.y && m2.bongMo.huong === m2.batDau.huong && nhipCheXichTatCa(m2, k2) === 5 &&
    ChamHoc.cham(m2, m2.loiGiai, tron(k2, m2.congThucKhac[0].hamCuaEmMoi)).soNhip === 5);
  const m3 = man(3), k3 = khoTruoc(m3.id);
  const r3 = ChamHoc.cham(m3, m3.loiGiai, k3);
  kiem('16.3 Đường so le: hành lang một đường với ba chỗ dịch sang phải, có băng chuyền và bậc thang S; lời giải ≤ 10 dòng, thắng 22 nhịp = 3×(2 + 5) + 1; xe đứng trên băng không bị đẩy (không bang-day)',
    r3.thang && m3.loiGiai.chinh.length <= 10 && r3.soNhip === 22 && ev(r3, 'bang-day').length === 0 && (SanHoc.docSan(m3.san).bang || m3.san.join('').match(/[<>^v]/g)).length >= 1 && m3.san.join('').includes('S'));
  const m4 = man(4), k4 = khoTruoc(m4.id);
  kiem('16.4 Leo cầu thang: climb(3) leo ba bậc chéo lên phải, mỗi bậc 6 nhịp (đi 1, quay 2, đi 1, quay 2) = 18; xe mờ ở đỉnh quay phải; climb(1) lên đúng bậc đầu',
    m4.bongMo.x - m4.batDau.x === 3 && m4.batDau.y - m4.bongMo.y === 3 && m4.bongMo.huong === 1 && ChamHoc.cham(m4, m4.loiGiai, tron(k4, m4.loiGiai.hamCuaEmMoi)).soNhip === 18 &&
      ChamHoc.thuHam(m4, { chinh: [] }, 'climb', tron(k4, m4.loiGiai.hamCuaEmMoi), { sanThu: { rong: 5, cao: 5, batDau: { x: 1, y: 3, huong: 1 }, vat: [] } }) !== null);
  const m5 = man(5), k5 = khoTruoc(m5.id);
  const r5 = ChamHoc.cham(m5, m5.loiGiai, tron(k5, m5.loiGiai.hamCuaEmMoi));
  const quayDau = ChamHoc.cham(m5, m5.congThucKhac[0].baiLam, tron(k5, m5.congThucKhac[0].hamCuaEmMoi));
  kiem('16.5 Lùi xuống bậc: xe ở đỉnh cầu thang bốn bậc, xe mờ ở chân; lùi xuống 24 nhịp; quay đầu rồi đi xuống rồi quay đầu lại 32 nhịp (chậm hơn đúng 8 = hai lần quay đầu)',
    r5.thang && r5.soNhip === 24 && quayDau.thang && quayDau.soNhip === 32 && m5.batDau.huong === 1 && m5.bongMo.huong === 1 && m5.bongMo.x === 0 && m5.batDau.x === 4 && ev(r5, 'quay-trai').length === 4 && ev(r5, 'quay-phai').length === 4);
  const m6 = man(6), k6 = khoTruoc(m6.id);
  const r6 = ChamHoc.cham(m6, m6.loiGiai, tron(k6, m6.loiGiai.hamCuaEmMoi));
  kiem('16.6 Nhặt sau lưng: vật ở ngay SAU lưng xe; pick_behind() = spin, pick, spin cầm vật, xe giữ ô và hướng; lời giải 10 nhịp, BFS 9 (nâng tay gộp vào nhịp quay kế); pick() trước mặt không nhặt được',
    m6.san[m6.batDau.y + 1][m6.batDau.x] === 'o' && r6.thang && r6.soNhip === 10 && nhipCheXichTatCa(m6, k6) === 9 && r6.tay.cam !== null && !ChamHoc.cham(m6, { chinh: ['pick()'] }, k6).thang);
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const pre = ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false }), { chinh: ['to_hill()'], hamCuaMan: m7.maMau.hamCuaMan }, k7);
  kiem('16.7 Đường về: to_hill() của màn đưa xe lên đồi 18 nhịp (lên 2, rẽ phải, sang 2, leo 2 bậc) tới ◆ (4,1) quay phải; to_hill khóa và xem được; thân back_home() ban đầu chỉ có pass; bóng mờ = chỗ và hướng xuất phát, ◆ ở (4,1)',
    pre.theoSan[0].soNhip === 18 && pre.theoSan[0].robot.x === 4 && pre.theoSan[0].robot.y === 1 && pre.theoSan[0].robot.huong === 1 && pre.theoSan[0].diQua[0].da === true && J(m7.khoaHamMan) === '["to_hill"]' &&
      J(m7.maMau.hamCuaMan.map((h) => h.ten)) === '["to_hill","back_home"]' && J(m7.maMau.hamCuaMan[1].than) === J(['pass']) &&
      J(m7.bongMo) === J({ x: m7.batDau.x, y: m7.batDau.y, huong: m7.batDau.huong, diQua: [{ x: 4, y: 1 }] }));
  const hb = m7.loiGiai.hamCuaMan.find((h) => h.ten === 'back_home');
  kiem('16.7: back_home() là LỆNH NGƯỢC của to_hill() theo thứ tự ngược: to_hill = forward(2), tr_right, forward(2), climb(2) → back_home = descend(2), back, back, tr_left, back, back; sửa to_hill gửi lên vẫn bị bản mẫu thay',
    J(hb.than) === J(['descend(2)', 'back()', 'back()', 'tr_left()', 'back()', 'back()']) && (() => { const a = ChamHoc.cham(m7, { chinh: [], hamCuaMan: [H('to_hill', ['move()']), hb] }, k7); const b = ChamHoc.cham(m7, m7.loiGiai, k7); return J([a.thang, a.soO, a.soNhip]) === J([b.thang, b.soO, b.soNhip]) && b.sao === 3; })());
  const rp = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('16.7: để nguyên pass thì không thắng (lech-bong-mo, xe còn trên đồi); back_home KHÔNG khóa; không vào kho, không taoHam', !rp.thang && maCua(rp).includes('lech-bong-mo') && m7.taoHam.length === 0 && !k7.some((h) => h.ten === 'back_home' || h.ten === 'to_hill') && !(m7.khoaHamMan || []).includes('back_home'));
  const m8 = man(8), k8 = khoTruoc(m8.id);
  const cu = ChamHoc.cham(m8, m8.maMau, k8);
  kiem('16.8 Xích trái đấu ngược: hai hàm của màn thân ban đầu = move() cũ và tr_right() cũ chạy sai (xe quay tại chỗ, không tới); sửa cả hai (left_move ↔ left_back) thì thắng; chỉ sửa một thì thua',
    !cu.thang && ChamHoc.cham(m8, m8.loiGiai, k8).thang && !ChamHoc.cham(m8, m8.loiSai[1].baiLam, k8).thang && !ChamHoc.cham(m8, m8.loiSai[2].baiLam, k8).thang && J(m8.maMau.hamCuaMan[0].than) === J(['left_move()', 'right_move()', 'wait()']));
  kiem('16.8: move() của em (kho) và tr_right() của em cũng chạy sai ở màn này (hàm của em dùng lại cũng đảo dây)', !ChamHoc.cham(m8, { chinh: ['move()', 'move()', 'move()', 'tr_right()', 'move()', 'move()'], hamCuaMan: [] }, k8).thang);
  const m9 = man(9), k9 = khoTruoc(m9.id), s9 = tron(k9, m9.loiGiai.hamCuaEmMoi);
  const r9 = ChamHoc.cham(m9, m9.loiGiai, s9);
  const khongSua = ChamHoc.cham(m9, m9.congThucKhac[0].baiLam, k9);
  kiem('16.9 Xích trái chỉ lùi: xe chỉ đi được khi quay lưng về hướng muốn đi; sửa tr_right() (right_back thay left_move) → 12 nhịp 3 sao (quay đầu 4, lùi 3, quay phải 2, lùi 3); không sửa, chỉ tr_left() → 16 nhịp, 2 sao',
    r9.thang && r9.soNhip === 12 && khongSua.thang && khongSua.soNhip === 16 && khongSua.sao === 2 && J(m9.loiGiai.hamCuaEmMoi[0].than) === J(['for i in range(2):', '    right_back()', '    wait()']));
  kiem('16.9: kho cũ có tr_right() dùng left_move (sửa mới có right_back); tr_right() sửa vẫn đúng ở màn thường (che-xich.8 chương trình chính cũ: tr_right() quay phải 90° hai nhịp)',
    k9.find((h) => h.ten === 'tr_right').than.includes('    left_move()') && huongSau(L('right_back()', 'wait()', 'right_back()', 'wait()'), 0) === 1 && huongSau(QP, 0) === 1);
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  const gh = ChamHoc.cham(m10, m10.loiSai[4].baiLam, k10);
  kiem('16.10 Kho trên đồi: gioiHanHam 5 — lời giải gọi 5 hàm khác nhau (pick_behind, forward, sidestep, climb, drop) vừa giới hạn; 6 hàm khác nhau (spin, pick, … ) bị qua-gioi-han-ham (nêu "5"); trùm không khóa chương trình chính',
    r10.thang && J([...new Set(m10.loiGiai.chinh.filter((s) => /^\s*[a-z_]+\(/.test(s)).map((s) => s.trim().replace(/\(.*$/, '')))].sort()) === J(['climb', 'drop', 'forward', 'pick_behind', 'sidestep']) && maCua(gh).join() === 'qua-gioi-han-ham' && /5/.test(gh.chanDoan[0].loi) && !gh.thang && m10.chinhCoDinh !== true);
  const bf10 = nhipCheXichNganNhat(m10);
  const tuongTu = ChamHoc.cham(m10, { chinh: ['pick_behind()', 'forward(2)', 'sidestep()', 'forward(2)', 'climb(2)', 'drop()'] }, k10);
  kiem('16.10: vật sau lưng xe (3,8), vật mờ ở ô trống (2,0) (màn bóng mờ không có ô đích D); lời giải chuẩn 33 nhịp; đường BFS ngắn nhất 27 nhịp quay đầu một lần rồi lùi suốt đường (chạy thật thắng đúng 27, mục 6), cần nhiều hàm gốc hơn 5 hàm của em',
    m10.san[8][3] === 'o' && m10.batDau.y === 7 && m10.san[0][2] === '.' && !/[DXh]/.test(m10.san.join('')) && tuongTu.soNhip === 33 && bf10.nhip === 27 && m10.sao.nhip === 33);

  console.log('\n  Bảng 10 màn che-xich (lời giải cách 1, sao; BFS = nhịp ngắn nhất)');
  console.log('  màn   | tên                  | ô  | nhịp | BFS | tạo / sửa      | lời giải (chương trình chính)');
  for (const { m, bfs } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(20) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfs).padEnd(3) + ' | ' + (m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',') || (m.loiGiai.hamCuaMan.length ? 'hàm của màn' : '—')).padEnd(14) + ' | ' + m.loiGiai.chinh.join(' ; '));
  }
}

/* ================================================================= 6. ĐƯỜNG BFS CHẠY THẬT */
console.log('\n== 6. Đường BFS (do-duong-che-xich.mjs) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS ==');
{
  for (const m of che.filter((x) => !x.khoaHamMan)) {
    const b = nhipCheXichNganNhat(m);
    const code = chuoiThanhMa(b.chuoi, m);
    const k = SanHoc.chay(cfgSan(m, 0), code);
    kiem(m.id + ': đường BFS (' + b.nhip + ' nhịp) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS, không lỗi', k.thang === true && k.nhip === b.nhip && !k.loi, J([b.nhip, k.thang, k.nhip, k.loi]));
  }
  // màn 7: đoạn cố định + BFS
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const bf = nhipCheXichTatCa(m7, k7);
  const sau = nhipCheXichNganNhat(m7, { batDau: { x: 4, y: 1, huong: 1, mask: 1 } });
  const pb = chuoiThanhMa(sau.chuoi, m7).split('\n').filter(Boolean);
  const r = ChamHoc.cham(Object.assign({}, m7, { khung: { chinh: 80, moiHam: 80 } }), { chinh: m7.maMau.chinh, hamCuaMan: [m7.maMau.hamCuaMan[0], H('back_home', pb)] }, k7);     // khung nới ra: thân sinh từ BFS dài hơn 10 dòng
  kiem('16.7: tính cả đoạn to_hill() cố định (18 nhịp chạy thật) + BFS còn lại ' + sau.nhip + ' = ' + bf + '; đường BFS đổi thành lệnh gốc làm thân back_home() chạy thật thắng đúng ' + bf + ' nhịp', bf === 36 && sau.nhip === 18 && r.thang && r.soNhip === bf, J([bf, sau.nhip, r.thang, r.soNhip]));
  // bộ dò tự kiểm
  const m1 = man(1);
  kiem('bộ dò tự kiểm: bỏ hướng khác của xe mờ ở 16.1 (xe mờ cùng hướng với xe) thì chương trình rỗng là xong: 0 nhịp', nhipCheXichNganNhat(Object.assign({}, m1, { bongMo: { x: m1.batDau.x, y: m1.batDau.y, huong: m1.batDau.huong } })).nhip === 0);
  kiem('bộ dò: phần cứng hỏng xích phải thiếu tiến lẫn lùi không quay được nhiều thứ → đường dài hơn hay không giải được; xích trái chỉ lùi ở 16.9 mà khay đủ thì ngắn hơn',
    (() => { const m9 = man(9); const du = nhipCheXichNganNhat(Object.assign({}, m9, { phanCung: undefined, hamGoc: XICH })).nhip, hong = nhipCheXichNganNhat(m9).nhip; return du !== null && hong !== null && du < hong; })());
  kiem('bộ dò: toiDaTrangThai nhỏ → catNgang true (không kết luận)', nhipCheXichNganNhat(man(10), { toiDaTrangThai: 100 }).catNgang === true);
  kiem('bộ dò: lưới tay — thả vật xuống bậc thang S thì không được (vật vẫn ở tay), xuống sàn thì được', (() => {
    const mm = { loaiRobot: 'xich', san: ['.S.', '...'], batDau: { x: 0, y: 0, huong: 1 }, hamGoc: XICH_TAY, mucTieu: 'bong-mo', bongMo: { x: 0, y: 1, huong: 1, vat: [{ x: 1, y: 1 }] }, vatChat: undefined };
    const ctx = dungNguCanh(mm); return ctx.datDuoc[1] === 0 && ctx.datDuoc[4] === 1;
  })());
}

/* ================================================================= 7. SO CHÉO BỘ DÒ VỚI SAN-HOC.JS */
console.log('\n== 7. So chéo bộ dò (BFS) với san-hoc.js bằng chương trình ngẫu nhiên ==');
{
  let seed = 424242421;
  const rnd = (n) => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed % n; };
  const KY = '......##SS>><<^^vv';
  let soCa = 0, lech = 0, ghiLech = '', soThang = 0, soThua = 0, soQuay = 0, soTay = 0, soDao = 0, soHong = 0, soDiQua = 0, soVat = 0, soCam = 0;
  const CAC_DAO = [[], ['trai'], ['phai'], ['trai', 'phai']];
  for (let lan = 0; lan < 1500; lan++) {
    const rong = 4 + rnd(3), cao = 4 + rnd(3);
    const rows = [];
    for (let y = 0; y < cao; y++) { let s = ''; for (let x = 0; x < rong; x++) s += KY[rnd(KY.length)]; rows.push(s); }
    const datO = (ch, n) => { for (let i = 0; i < n; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] === '.') rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); } };
    const coTay = rnd(2) === 0;
    if (coTay) datO('o', rnd(3));
    datO('D', 1);
    let bd = null;
    for (let i = 0; i < 50 && !bd; i++) { const x = rnd(rong), y = rnd(cao); if (!'#o'.includes(rows[y][x])) bd = { x, y, huong: rnd(4) }; }
    if (!bd) continue;
    let nhatSan = false;
    if (coTay && rnd(2) === 0) {                                              // vật ngay trước mũi xe + mở đầu bằng "hạ tay + kẹp" (để có ca đang cầm vật)
      const v = SanHoc.VEC[bd.huong], fx = bd.x + v[0], fy = bd.y + v[1];
      if (fx >= 0 && fy >= 0 && fx < rong && fy < cao && '.DSS>><<^^vv'.includes(rows[fy][fx])) { rows[fy] = rows[fy].slice(0, fx) + 'o' + rows[fy].slice(fx + 1); nhatSan = true; }
    }
    const dao = CAC_DAO[rnd(4)];
    let phanCung = coTay ? XICH_TAY.slice() : XICH.slice();
    const hongLenh = rnd(4) === 0 ? ['left_move', 'right_move', 'left_back', 'right_back'][rnd(4)] : null;
    if (hongLenh) phanCung = phanCung.filter((t) => t !== hongLenh);
    const manR = { loaiRobot: 'xich', san: rows, batDau: bd, hamGoc: phanCung, phanCung, daoChieu: dao, mucTieu: 'bong-mo', bongMo: { x: bd.x, y: bd.y, huong: bd.huong } };
    const ctx0 = dungNguCanh(manR), HD = ctx0.hanhDong;
    const chuoi = [];
    for (let i = 0; i < 14; i++) chuoi.push(rnd(3) === 0 && chuoi.length ? chuoi[chuoi.length - 1] : HD[rnd(HD.length)]);   // hay lặp lại hành động trước để có cặp quay liên tiếp
    if (nhatSan) { chuoi[0] = { tuThe: 'duoi', kep: 'kep', banh: [0, 0] }; if (rnd(2) === 0) chuoi[1] = { tuThe: 'tren', kep: null, banh: HD[rnd(HD.length)].banh }; }
    // chạy thử bằng bộ dò để biết trạng thái cuối, các ô đã ghé, rồi chọn xe mờ: một nửa số ca lấy đúng tư thế cuối (phải thắng), một nửa chọn lung tung
    let S = trangThaiDau(ctx0), nhip = 0, vaoVo = false;
    const ghe = [];
    for (const a of chuoi) { S = buocMotNhip(ctx0, S, a); nhip++; ghe.push(S.y * ctx0.rong + S.x); if (S.pos.some((p) => p === -2)) vaoVo = true; }
    if (vaoVo) continue;
    const bm = { x: S.x, y: S.y, huong: S.h };
    if (rnd(2) === 0) {                                                  // xe mờ lệch: đổi ô / hướng / vật
      const k = rnd(3);
      if (k === 0) bm.huong = (S.h + 1 + rnd(3)) % 4;
      else if (k === 1) { const x = rnd(rong), y = rnd(cao); if (!ctx0.chan[y * ctx0.rong + x]) { bm.x = x; bm.y = y; } }
    }
    if (rnd(2) === 0) { const nd = 1 + rnd(2), ds = []; for (let i = 0; i < nd; i++) { const c = ghe[rnd(ghe.length)]; if (!ds.includes(c) && rnd(6) !== 0) ds.push(c); } bm.diQua = ds.map((c) => ({ x: c % ctx0.rong, y: Math.floor(c / ctx0.rong) })); }
    if (coTay && rnd(3) !== 0) {
      const dat = S.pos.filter((p) => p >= 0);
      bm.vat = dat.map((p) => ({ x: p % ctx0.rong, y: Math.floor(p / ctx0.rong) }));
      if (rnd(4) === 0 && bm.vat.length) bm.vat[0] = { x: (bm.vat[0].x + 1) % ctx0.rong, y: bm.vat[0].y };
      if (S.pos.includes(-1) && rnd(5) !== 0) bm.cam = true;
    }
    manR.bongMo = bm;
    const ctx = dungNguCanh(manR);
    let S2 = trangThaiDau(ctx);
    for (const a of chuoi) S2 = buocMotNhip(ctx, S2, a);
    const thangBfs = laThang(ctx, S2);
    const code = chuoiThanhMa(chuoi, manR);
    const cfg = { san: rows, batDau: bd, loaiRobot: 'xich', hamGoc: phanCung, phanCung, daoChieu: dao, mucTieu: 'bong-mo', bongMo: bm };
    let kq;
    try { kq = SanHoc.chay(cfg, code); } catch (e) { lech++; if (!ghiLech) ghiLech = 'NÉM LỖI ' + e.message + ' ' + J({ rows, bd, bm }); soCa++; continue; }
    soCa++;
    const vatBfs = S2.pos.map((p) => (p === -2 ? 'vo' : p === -1 ? 'cam' : (p % ctx.rong) + ',' + Math.floor(p / ctx.rong)));
    const vatSan = kq.vat.map((v) => (v.trangThai === 'vo' ? 'vo' : v.trangThai === 'cam' ? 'cam' : v.x + ',' + v.y));
    const tayBfs = S2.t === 1 ? 'duoi' : 'tren';
    const quayBfs = S2.q === '' ? 0 : SanHoc.XICH_QUAY[S2.q];
    const maskSan = kq.diQua.reduce((m, q, i) => m | (q.da ? (1 << i) : 0), 0);
    const ok = kq.robot.x === S2.x && kq.robot.y === S2.y && kq.robot.huong === S2.h && kq.nhip === nhip && kq.quayDo === quayBfs && (!coTay || kq.tay.tuThe === tayBfs) && J(vatBfs) === J(vatSan) && maskSan === S2.mask && kq.thang === thangBfs;
    if (thangBfs) soThang++; else soThua++;
    if (kq.quayDo) soQuay++;
    if (coTay) soTay++;
    if (dao.length) soDao++;
    if (hongLenh) soHong++;
    if (bm.diQua && bm.diQua.length) soDiQua++;
    if (bm.vat && bm.vat.length) soVat++;
    if (bm.cam) soCam++;
    if (!ok) { lech++; if (!ghiLech) ghiLech = J({ rows, bd, bm, dao, code, bfs: [S2.x, S2.y, S2.h, quayBfs, nhip, tayBfs, vatBfs, S2.mask, thangBfs], san: [kq.robot.x, kq.robot.y, kq.robot.huong, kq.quayDo, kq.nhip, kq.tay && kq.tay.tuThe, vatSan, maskSan, kq.thang] }); }
  }
  kiem('so chéo ' + soCa + ' chương trình ngẫu nhiên (sân có tường, S, băng 4 chiều, vật, ô đích; bóng mờ, ◆, vật mờ, xe mờ cầm vật; daoChieu, phanCung hỏng một bánh, tay): BFS và san-hoc.js trùng ô, hướng, quay dở, nhịp, tay, vật, ◆ và kết quả thắng / thua', soCa >= 1000 && lech === 0, lech + ' lệch · ' + ghiLech);
  kiem('mẫu ngẫu nhiên đủ loại ca: thắng ' + soThang + ' / thua ' + soThua + ', quay dở còn lại ' + soQuay + ', có tay ' + soTay + ', đảo dây ' + soDao + ', phần cứng hỏng ' + soHong + ', ◆ ' + soDiQua + ', vật mờ ' + soVat + ', xe mờ cầm vật ' + soCam,
    soThang >= 200 && soThua >= 200 && soQuay >= 20 && soTay >= 300 && soDao >= 300 && soHong >= 150 && soDiQua >= 100 && soVat >= 100 && soCam >= 20);
}

/* ================================================================= 8. KHO CUỐI GAME VÀ HUY HIỆU */
console.log('\n== 8. Kho hàm của em, huy hiệu, thẻ script ==');
{
  const cuoi = khoTruoc('het');
  kiem('kho cuối game có đủ năm hàm của che-xich, tr_right bản sửa (right_back), tr_right / tr_left của xich và tên cốt truyện khóa; to_hill, back_home, fixed_drive, fixed_turn (hàm của màn) không có trong kho',
    ['spin', 'sidestep', 'climb', 'descend', 'pick_behind', 'tr_right', 'tr_left'].every((t) => cuoi.some((h) => h.ten === t)) && ['to_hill', 'back_home', 'fixed_drive', 'fixed_turn'].every((t) => !cuoi.some((h) => h.ten === t)) &&
      J(cuoi.find((h) => h.ten === 'tr_right').than) === J(['for i in range(2):', '    right_back()', '    wait()']));
  const sach = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('KhoHam khóa tên: người chơi không tạo được hàm tên spin / sidestep / climb / descend / pick_behind bằng tên trùng ngoài màn chế nó', ['spin', 'sidestep', 'climb', 'descend', 'pick_behind'].every((t) => tenCotTruyen.includes(t) && sach.tao(t, [], {}).ok === false));
  const hh = fs.readFileSync(path.join(day, 'game', 'huy-hieu.js'), 'utf8');
  kiem("huy hiệu: game/huy-hieu.js có HINH['che-xich'] dựng bằng code, có bánh răng (themBanhRang)", /HINH\['che-xich'\] = function \(\)[\s\S]*?themBanhRang\(p\);\s*return p;\s*\};/.test(hh));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-xich.js đúng một lần, sau man-xich.js và trước man-omni.js (cùng sổ màn)', tags.filter((t) => t === '../man-che-xich.js').length === 1 && vtri('man-che-xich.js') > vtri('man-xich.js') && vtri('man-che-xich.js') < vtri('man-omni.js'), J(tags));
  kiem('so-lenh.js nạp trước man-che-xich.js', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-xich.js'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
