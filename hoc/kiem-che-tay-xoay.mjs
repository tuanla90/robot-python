/* ============================================================================
   kiem-che-tay-xoay.mjs — máy kiểm chương `che-tay-xoay` (Chế lệnh tay xoay, chương 22) của "Đường học" (KE-HOACH-CHE-LENH.md, mục 5b.3). Luật lõi tay xoay và chương làm quen: kiem-tay-xoay.mjs.
   Gồm:
   - 10 màn che-tay-xoay: lời giải 3 sao (đúng sao.o, sao.nhip với kho cổ điển; kho THẬT không chậm hơn), mọi công thức khác (congThucKhac) thắng, lời giải khác đúng 2 sao, lời sai đúng mã,
     chinhCoDinh chặn chương trình chính gửi lên, nhịp: đường ngắn nhất BFS (do-duong-tay-xoay.mjs) không dài hơn sao.nhip (bằng khi không nhipTheoLoiGiai);
   - sáu hàm cốt truyện mới (pick_left, drop_right, pick_right, drop_left, swap_sides, sort_two) có trong Sổ lệnh đúng thứ tự, đúng chương; hàm CỦA MÀN (put_back, lift_left, fixed_pick_left, fixed_drop_right,
     side_pick, side_drop) không vào kho, không vào Sổ lệnh;
   - 6.7 Đường về (lệnh ngược theo thứ tự ngược; đảo nguyên dòng thì thả khi tay đã nâng → vật vỡ), 6.8 khớp lắp ngược (daoChieu "xoay"), 6.9 khớp kẹt cứng (phanCung không có arm_left / arm_right → lenh-goc-hong,
     sửa bằng quay xe), 6.10 trùm (gioiHanHam 3, huy hiệu che-tay-xoay);
   - kho hàm: các hàm của em từ che-tay-xoay vẫn đúng ở mọi màn sau, đo trên bộ dò BFS không quá chậm (hàm ghép đúng nhịp tối ưu: pick_left + drop_right = 4 nhịp = BFS).
   Chạy: node hoc/kiem-che-tay-xoay.mjs        (trượt thì thoát mã 1)
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
const DoDuong = await import('./do-duong-tay-xoay.mjs');
const { nhipTayXoayNganNhat, nhipTayXoayTatCa, chuoiThanhMa } = DoDuong;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-tay-xoay');
const man = (so) => ManHoc.timMa('che-tay-xoay.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';

function khoTruoc(id, classic) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (classic && ['che-xe', 'che-tay', 'robot-hoan-thien'].includes(m.chuong) && kho.tim(h.ten)) continue;
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
const KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'];
const KHAY_KET = KHAY.filter((t) => t !== 'arm_left' && t !== 'arm_right');

/* ================================================================= 1. CHƯƠNG che-tay-xoay: khuôn chung */
console.log('\n== 1. Chương che-tay-xoay (chương 22): khuôn chung ==');
kiem('có 10 màn, hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; mã che-tay-xoay.1…10; chương tên "Chế lệnh tay xoay"; nằm ngay sau tay-xoay trong thứ tự chương',
  che.length === 10 && J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m, i) => m.ma === 'che-tay-xoay.' + (i + 1)) &&
    ThuTu.ten['che-tay-xoay'] === 'Chế lệnh tay xoay' && ThuTu.thuTu.indexOf('che-tay-xoay') === ThuTu.thuTu.indexOf('tay-xoay') + 1);
kiem('robot { than "hai-banh", tay "xoay", camBien [] }; xe bánh; chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em; cauTruc for / if / while',
  che.every((m) => J(m.robot) === J({ than: 'hai-banh', tay: 'xoay', camBien: [] }) && m.loaiRobot === 'banh' && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while"]'));
kiem('mục tiêu: bóng mờ (bong-mo) với xe mờ / vật mờ; riêng 22.3 tới cờ; khay đủ sáu lệnh tay, riêng 22.9 hỏng: khay = phanCung = bánh + bốn lệnh tay, không còn arm_left / arm_right',
  che.every((m) => (m.so === 3 ? m.mucTieu === undefined && /F/.test(m.san.join('')) : m.mucTieu === 'bong-mo' && !!m.bongMo && !/F/.test(m.san.join(''))) && (m.so === 9 ? J(m.hamGoc) === J(KHAY_KET) && J(m.phanCung) === J(KHAY_KET) : J(m.hamGoc) === J(KHAY) && m.phanCung === undefined)));
kiem('chương trình chính khóa (chinhCoDinh) ở mọi màn trừ 22.3 và 22.10 (người chơi tự viết); mọi màn có ≥ 1 congThucKhac và loiGiaiKhac',
  che.every((m) => (m.chinhCoDinh === true) === ![3, 10].includes(m.so) && (m.congThucKhac || []).length >= 1 && !!m.loiGiaiKhac));
kiem('hàm cốt truyện mới theo thứ tự chế: pick_left (1), drop_right (2), pick_right + drop_left (4), swap_sides (5), sort_two (6); 22.3 và 22.7–22.10 không tạo hàm',
  J(che.map((m) => m.taoHam)) === J([['pick_left'], ['drop_right'], [], ['pick_right', 'drop_left'], ['swap_sides'], ['sort_two'], [], [], [], []]) && ['pick_left', 'drop_right', 'pick_right', 'drop_left', 'swap_sides', 'sort_two'].every((t) => tenCotTruyen.includes(t)));
kiem('mô tả Sổ lệnh: sáu hàm của che-tay-xoay (nhóm "tay-xoay", chương che-tay-xoay, màn đầu tiên chế, moTa một câu ≤ 80 chữ cái, không dấu chấm cuối), đúng thứ tự chế; SoLenh.theoChuong có 6 mục',
  (() => { const moi = ['pick_left', 'drop_right', 'pick_right', 'drop_left', 'swap_sides', 'sort_two']; return moi.every((t) => { const h = SoLenh.tim(t); return h && h.nhom === 'tay-xoay' && h.chuong === 'che-tay-xoay' && che.find((m) => m.taoHam.includes(t)).ma === h.man && h.moTa.length >= 8 && h.moTa.length <= 80 && !/[.]$/.test(h.moTa); }) && J(SoLenh.theoChuong('che-tay-xoay').map((h) => h.ten)) === J(moi) && J(SoLenh.theoNhom('tay-xoay').map((h) => h.ten)) === J(['clear_left', 'relay'].concat(moi)); })());
kiem('hàm CỦA MÀN (put_back, lift_left, fixed_pick_left, fixed_drop_right, side_pick, side_drop, 15/10) không là hàm cốt truyện, không trong Sổ lệnh, không trong lời giải nào như hàm của em',
  ['put_back', 'lift_left', 'fixed_pick_left', 'fixed_drop_right', 'side_pick', 'side_drop'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))));
kiem('tên hàm cốt truyện không trùng lệnh gốc hay hàm của chương khác (put_right, swap… của che-tay vẫn là của che-tay)', ['pick_left', 'drop_right', 'pick_right', 'drop_left', 'swap_sides', 'sort_two'].every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t)) &&
  SoLenh.tim('put_right').chuong === 'che-tay' && SoLenh.tim('swap').chuong === 'che-tay');
kiem('22.10 (trùm): huyHieu { ma "che-tay-xoay", ten "Huy hiệu Chế lệnh tay xoay" } và gioiHanHam 3; các màn khác không có huy hiệu, không có giới hạn hàm', J(man(10).huyHieu) === J({ ma: 'che-tay-xoay', ten: 'Huy hiệu Chế lệnh tay xoay' }) && man(10).gioiHanHam === 3 && che.every((m) => m.so === 10 || (!m.huyHieu && m.gioiHanHam === undefined)));
kiem('hàm của màn: 22.7 khóa lift_left (khoaHamMan), 22.8 và 22.9 không khóa hàm nào; daoChieu ["xoay"] chỉ ở 22.8; canhBao ở 22.8 và 22.9',
  J(man(7).khoaHamMan) === '["lift_left"]' && che.filter((m) => m.so !== 7).every((m) => m.khoaHamMan === undefined) && J(man(8).daoChieu) === '["xoay"]' && che.every((m) => m.so === 8 || m.daoChieu === undefined) && !!man(8).canhBao && !!man(9).canhBao && che.every((m) => [8, 9].includes(m.so) || m.canhBao === undefined));
kiem('sân tối đa 7 cột × 9 hàng; đề bài 1–3 câu, gợi ý 1–2 câu', che.every((m) => m.san.length <= 9 && m.san[0].length <= 7 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.length >= 1 && m.goiY.length <= 2));
kiem('xe mờ cầm vật ở 22.1 (bongMo.cam, không còn vật nằm đất); các vật mờ có màu ở 22.5, 22.6, 22.10 (chấm theo màu)', man(1).bongMo.cam === true && man(1).bongMo.vat.length === 0 && [5, 6, 10].every((so) => man(so).bongMo.vat.every((q) => q.mau) && !!man(so).vatMau));

/* ================================================================= 2. TỪNG MÀN */
console.log('\n== 2. Từng màn: lời giải 3 sao, công thức khác, lời giải khác 2 sao, lời sai, BFS ==');
for (const m of che) {
  const kho = khoTruoc(m.id, true);
  const khoThat = khoTruoc(m.id, false);
  const tenTruoc = kho.map((h) => h.ten);
  kiem(m.id + ' ' + m.ten + ': hamCuaEmCan ⊆ kho lúc tới màn, taoHam = hàm lần đầu xuất hiện ở lời giải', m.hamCuaEmCan.every((t) => tenTruoc.includes(t)) && J(m.loiGiai.hamCuaEmMoi.map((h) => h.ten).filter((t) => !tenTruoc.includes(t)).sort()) === J(m.taoHam.slice().sort()), J({ can: m.hamCuaEmCan, kho: tenTruoc.length }));
  const r = ChamHoc.cham(m, m.loiGiai, tron(kho, m.loiGiai.hamCuaEmMoi));
  kiem(m.id + ': lời giải 3 sao, ' + m.sao.o + ' ô, ' + m.sao.nhip + ' nhịp, không chẩn đoán nào', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, soNhip: r.soNhip, cd: maCua(r) }));
  const rThat = ChamHoc.cham(m, m.loiGiai, tron(khoThat, m.loiGiai.hamCuaEmMoi));
  kiem(m.id + ': với kho THẬT lời giải vẫn thắng, không lỗi, không chậm hơn sao.nhip', rThat.thang && maLoi(rThat).length === 0 && rThat.soNhip <= m.sao.nhip, J({ thang: rThat.thang, nhip: rThat.soNhip, cd: maCua(rThat) }));
  const bfs = nhipTayXoayTatCa(m, kho);
  kiem(m.id + ': nhịp ngắn nhất (BFS) ' + (m.nhipTheoLoiGiai ? '≤ sao.nhip (nhipTheoLoiGiai)' : '= sao.nhip') + (m.khongDoBFS ? ' [màn nhiều vật: không BFS, dùng sao.nhip]' : '') + ' (BFS ' + bfs + ')', bfs !== null && (m.nhipTheoLoiGiai ? bfs <= m.sao.nhip : bfs === m.sao.nhip));
  const k = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
  kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') đúng 2 sao: nhiều ô hơn, cùng nhịp', k.thang && k.sao === 2 && k.soO > m.sao.o && k.soNhip === m.sao.nhip && maCua(k).indexOf('tran-khung') < 0 && J(m.loiGiaiKhac.baiLam) !== J(m.loiGiai), J({ thang: k.thang, sao: k.sao, soO: k.soO, soNhip: k.soNhip }));
  (m.congThucKhac || []).forEach((c, i) => {
    const bai = c.baiLam || { chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan };
    const q = ChamHoc.cham(m, bai, tron(kho, c.baiLam ? c.hamCuaEmMoi : tron(m.loiGiai.hamCuaEmMoi, c.hamCuaEmMoi || [])));
    kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi', q.thang && maLoi(q).length === 0, J({ thang: q.thang, cd: maCua(q) }));
  });
  const mm = ChamHoc.cham(m, m.maMau, kho);
  kiem(m.id + ': maMau vừa khung', maCua(mm).indexOf('tran-khung') < 0);
  if (m.chinhCoDinh) {
    const a = ChamHoc.cham(m, { chinh: ['move()', 'move()'], hamCuaMan: m.loiGiai.hamCuaMan }, tron(kho, m.loiGiai.hamCuaEmMoi));
    kiem(m.id + ': chinhCoDinh chặn chương trình chính gửi lên (đổi thành move() không đổi kết quả, vẫn 3 sao)', a.thang === r.thang && a.sao === r.sao && a.soNhip === r.soNhip && J(a.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten)) === J(r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten)));
  }
  m.loiSai.forEach((ls, i) => {
    const q = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
    const co = maCua(q), thieu = ls.phaiCoMa.filter((x) => co.indexOf(x) < 0);
    kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không đủ 3 sao, đủ mã ' + (ls.phaiCoMa.join('+') || '—'), q.sao < 3 && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + q.sao);
  });
}

/* ================================================================= 3. LUẬT TỪNG MÀN */
console.log('\n== 3. Luật riêng từng màn ==');
{
  const sh = (so, chinh, hamMan, hamEm) => ChamHoc.cham(man(so), { chinh, hamCuaMan: hamMan || [] }, tron(khoTruoc(man(so).id, true), hamEm || []));
  // 22.1 / 22.2 / 22.4: hàm ghép đúng nhịp BFS
  kiem('22.1: pick_left() = hai nhịp (xoay trái + hạ + kẹp; nâng + xoay về), đúng BFS; xong tay chỉ phía trước (nấc truoc) và đang cầm vật', (() => { const r = sh(1, ['pick_left()'], [], man(1).loiGiai.hamCuaEmMoi); return r.thang && r.soNhip === 2 && r.tay.xoay === 'truoc' && r.tay.cam !== null && r.vat.every((v) => v.trangThai === 'cam'); })());
  kiem('22.2 / 22.4: drop_right() và drop_left() đều hai nhịp, xong tay về phía trước; pick() + drop_right() đúng 4 nhịp = BFS', nhipTayXoayNganNhat(man(2)).nhip === 4 && ChamHoc.cham(man(2), man(2).loiGiai, tron(khoTruoc(man(2).id, true), man(2).loiGiai.hamCuaEmMoi)).soNhip === 4 && nhipTayXoayNganNhat(man(4)).nhip === 4);
  // 22.3: nhặt vật, mang theo tới cờ
  kiem('22.3: không dọn vật thì xe rẽ trái đâm vật (dam-tuong vat "vat"); dọn bằng pick_left() + drop_right() rồi rẽ trái tới cờ thắng; vật nằm ngay ô bên trái xe ở ngã rẽ', (() => { const r = sh(3, ['move()', 'move()', 'turn_left()', 'move()', 'move()']); const k = sh(3, man(3).loiGiai.chinh); return !r.thang && r.chanDoan.some((c) => c.ma === 'dam-tuong' && /vật nằm đất/.test(c.loi)) && k.thang; })());
  // 22.5: đổi chỗ hai vật khác màu
  const r5 = sh(5, ['swap_sides()'], [], man(5).loiGiai.hamCuaEmMoi);
  kiem('22.5: swap_sides() đổi chỗ vật đỏ (trái) và vật xanh dương (phải), xe và tay về như cũ, đúng 12 nhịp = BFS; vật đỏ nằm ô phải (3,3), vật xanh dương ô trái (1,3)', r5.thang && r5.soNhip === 12 && r5.vat.find((v) => v.mau === 'red').x === 3 && r5.vat.find((v) => v.mau === 'blue').x === 1 && nhipTayXoayNganNhat(man(5)).nhip === 12);
  kiem('22.5: bongMo.vat có màu: hai vật đổi chỗ nhưng KHÔNG đổi màu (chấm theo màu): để nguyên hai vật thì không thắng', !sh(5, []).thang && J(man(5).bongMo.vat.map((q) => q.mau)) === '["blue","red"]');
  kiem('22.5: swap_sides() trong thân hàm chỉ có 6 dòng (gọi pick_left, drop, pick_right, drop_left, pick, drop_right), vừa khung 10 ô; viết thẳng lệnh tay thì tràn khung', man(5).loiGiai.hamCuaEmMoi[0].than.length === 6 && man(5).loiSai.some((l) => l.phaiCoMa.includes('tran-khung')));
  // 22.6: phân loại
  const r6 = sh(6, ['sort_two()', 'sort_two()'], [], man(6).loiGiai.hamCuaEmMoi);
  kiem('22.6: gọi sort_two() hai lần: vật đỏ sang trái, vật xanh dương sang phải, xe tiến bốn ô; vật xếp hai hàng', r6.thang && r6.soNhip === 20 && r6.vat.filter((v) => v.mau === 'red').every((v) => v.x === 1) && r6.vat.filter((v) => v.mau === 'blue').every((v) => v.x === 3) && r6.theoSan[0].robot.y === 1);
  // 22.7: Đường về
  const T7 = man(7).maMau.hamCuaMan[0].than;
  kiem('22.7: hàm của màn lift_left() (khóa) = arm_left, arm_down, grab, wait, arm_up, wait; thân ban đầu put_back() là pass (chưa làm gì): xe còn cầm vật, tay chỉ trái → lech-bong-mo; lời giải đúng hai nhịp (hạ + thả; nâng + xoay về)',
    J(T7) === J(['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']) && J(man(7).maMau.hamCuaMan[1].than) === '["pass"]' && !ChamHoc.cham(man(7), man(7).maMau, khoTruoc(man(7).id, true)).thang && J(man(7).loiGiai.hamCuaMan[1].than) === J(['arm_down()', 'release()', 'wait()', 'arm_up()', 'arm_right()', 'wait()']) && ChamHoc.cham(man(7), man(7).loiGiai, khoTruoc(man(7).id, true)).soNhip === 4);
  const dao = ChamHoc.cham(man(7), { chinh: man(7).maMau.chinh, hamCuaMan: [man(7).maMau.hamCuaMan[0], H('put_back', ['wait()', 'arm_down()', 'wait()', 'release()', 'arm_up()', 'arm_right()', 'wait()'])] }, khoTruoc(man(7).id, true));
  kiem('22.7 bẫy: đảo NGUYÊN từng dòng của lift_left (kẹp → mở, nâng ↔ hạ, trái → phải) rồi thả chung nhịp với nâng tay: máy nâng tay trước khi thả nên vật vỡ (vat-vo)', maCua(dao).includes('vat-vo') && !dao.thang, J(maCua(dao)));
  const r7 = ChamHoc.cham(man(7), { chinh: man(7).maMau.chinh, hamCuaMan: [H('lift_left', ['arm_left()', 'wait()'])] }, khoTruoc(man(7).id, true));
  kiem('22.7: lift_left() bị khóa (khoaHamMan): thân hàm người chơi gửi lên bị thay bằng bản mẫu — đổi thân thành arm_left(); wait() không đổi kết quả (xe vẫn nhặt vật rồi put_back rỗng xử lý)', J(r7.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).slice(0, 4)) === J(['arm_left', 'arm_down', 'grab', 'wait']));
  // 22.8: lắp ngược
  const r8 = ChamHoc.cham(man(8), man(8).maMau, khoTruoc(man(8).id, true));
  kiem('22.8: maMau (hai hàm cũ pick_left / drop_right) thắng KHÔNG: khớp lắp ngược nên arm_left() xoay sang phải, tay kẹp hụt ô trống; sửa bằng đổi arm_left ↔ arm_right trong cả hai hàm', !r8.thang && maCua(r8).includes('kep-hut') && J(man(8).loiGiai.hamCuaMan[0].than) === J(man(8).maMau.hamCuaMan[0].than.map((d) => d === 'arm_left()' ? 'arm_right()' : d === 'arm_right()' ? 'arm_left()' : d)));
  const th8 = ChamHoc.thuHam(man(8), { chinh: [], hamCuaMan: [H('thu', ['arm_right()', 'wait()'])] }, 'thu', khoTruoc(man(8).id, true), {});
  kiem('22.8: sân thử của Xưởng hàm dùng daoChieu của màn: thử arm_right() thì khớp xoay sang TRÁI', th8.tay && th8.tay.xoay === 'trai', J(th8.tay));
  // 22.9: khớp kẹt cứng
  const r9 = ChamHoc.cham(man(9), man(9).maMau, khoTruoc(man(9).id, true));
  kiem('22.9: maMau gọi khớp đã hỏng: lenh-goc-hong nói "Khớp xoay kẹt cứng"; lời giải sửa bằng quay xe, không gọi arm_left / arm_right', maCua(r9).includes('lenh-goc-hong') && /Khớp xoay kẹt cứng/.test(r9.chanDoan.find((c) => c.ma === 'lenh-goc-hong').loi) && man(9).loiGiai.hamCuaMan.every((h) => h.than.every((d) => !/arm_(left|right)/.test(d))));
  kiem('22.9: bộ dò với phanCung hỏng (không arm_left / arm_right) tìm được đường 5 nhịp bằng quay xe; thêm hai lệnh xoay vào phần cứng thì còn 2 + 2 = 4', nhipTayXoayNganNhat(man(9)).nhip === 5 && nhipTayXoayNganNhat(Object.assign({}, man(9), { hamGoc: KHAY, phanCung: KHAY })).nhip === 4);
  // 22.10: trùm
  const r10 = sh(10, man(10).loiGiai.chinh, [], []);
  kiem('22.10: ba hàm khác nhau (swap_sides, move, sort_two) vừa giới hạn; gọi thêm pick() trực tiếp thành bốn hàm thì qua-gioi-han-ham', r10.thang && !maCua(r10).includes('qua-gioi-han-ham') && maCua(sh(10, ['swap_sides()', 'move()', 'move()', 'pick()', 'sort_two()', 'drop()'])).includes('qua-gioi-han-ham'));
  kiem('22.10: bốn vật xếp thẳng hàng phía trước và hai vật hai bên xe (6 vật); xe mờ ở cuối hành lang (2,0)', (man(10).san.join('').match(/o/g) || []).length === 6 && man(10).bongMo.x === 2 && man(10).bongMo.y === 0 && man(10).bongMo.vat.length === 6);
}

/* ================================================================= 4. KHO: hàm của em vẫn đúng ở các màn khác */
console.log('\n== 4. Kho: hàm của che-tay-xoay dùng lại được ở mọi màn tay xoay ==');
{
  const khoDay = khoTruoc('het', false);
  kiem('kho cuối game có đủ sáu hàm của che-tay-xoay, thân đúng lời giải; pick_left / drop_right không bị sửa ở màn nào (kho dùng chung, không đổi nhịp)',
    ['pick_left', 'drop_right', 'pick_right', 'drop_left', 'swap_sides', 'sort_two'].every((t) => khoDay.some((h) => h.ten === t)) && J(khoDay.find((h) => h.ten === 'pick_left').than) === J(man(1).loiGiai.hamCuaEmMoi[0].than) && J(khoDay.find((h) => h.ten === 'drop_right').than) === J(man(2).loiGiai.hamCuaEmMoi[0].than));
  const r = ChamHoc.cham(man(3), man(3).loiGiai, khoDay);
  kiem('chơi lại 22.3 với kho cuối game: vẫn thắng đủ sao, cùng số ô, cùng nhịp', r.thang && r.sao === 3 && r.soO === man(3).sao.o && r.soNhip === man(3).sao.nhip, J({ sao: r.sao, o: r.soO, nhip: r.soNhip }));
  const tayThuong = ManHoc.timMa('tay-gap.1');
  kiem('hàm tay xoay (pick_left…) gọi lệnh arm_left mà màn tay kẹp thường không có: ở tay-gap.1 gọi pick_left() không chạy (chưa có hàm arm_left), không lẫn vào kết quả', (() => { const q = ChamHoc.cham(tayThuong, { chinh: ['pick_left()'], hamCuaMan: [] }, khoDay); return !q.thang && q.chanDoan.some((c) => /arm_left/.test(c.loi)); })());
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
