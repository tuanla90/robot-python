/* ============================================================================
   kiem-doi-mau.mjs — MÁY KIỂM RIÊNG gói Đội màu và súng hơi (hoc/man-doi-mau.js: chương doi-mau + che-doi-mau).
   Luật chung của mọi gói đội (10 màn khác nhau, mẫu chưa thắng, cần cả đội, ngưỡng sao…) ở kiem-goi-doi.mjs; ở đây kiểm phần đặc thù:
   - đội: R1 robot màu (camera + tay kẹp + cảm biến khoảng cách, không súng), R2 robot súng hơi (súng + cảm biến khoảng cách, không đọc màu, không tay);
   - kỹ năng K6 (báo nhau bằng vị trí): R1 đứng sát trái / phải R2 làm tín hiệu, R2 hỏi left_clear() / right_clear() rồi bắn đúng nút;
   - lời sai tiêu biểu từng màn bị chặn: không chờ, chờ sai điều kiện, bắn cả hai nút, mở cửa sớm, nhìn màu sau khi nhặt, viết thẳng tràn khung,
     đếm nhịp / ghi cứng phía ở trùm, hàm chế sai;
   - hàm chế của chương 2 (watch_side, answer_side, show_color) là tên mới, chưa có trong kho trước gói; hàm của màn không trùng kho.
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const M = require(path.join(day, 'lo-trinh-hoc.js'));
const Cham = require(path.join(day, 'cham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const clone = (x) => JSON.parse(JSON.stringify(x));
const nhieu = (...a) => [].concat(...a);
const H = (ten, than, thamSo) => ({ ten, thamSo: thamSo || [], than });

const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
const man = (ma) => M.danhSach.find((m) => m.ma === ma);
/** Chấm bài hai robot: o.ham thay các hàm của em mới của lời giải (mặc định: dùng của lời giải), o.hamCuaMan thay hàm của màn. */
function cham(m, d1, d2, o = {}) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of (o.ham || m.loiGiai.hamCuaEmMoi || [])) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: [], hamCuaMan: o.hamCuaMan || m.loiGiai.hamCuaMan || [], doi: [{ chinh: d1 }, { chinh: d2 }] }, [...hs.values()]);
}
const lg = (m, i) => m.loiGiai.doi[i].chinh;
const maCD = (r) => r.chanDoan.map((c) => c.ma);
/** Lời sai: không thắng; phaiCo (tuỳ chọn) là các mã chẩn đoán phải có. */
function sai(ma, moTa, d1, d2, o = {}) {
  const m = man(ma), r = cham(m, d1 || lg(m, 0), d2 || lg(m, 1), o);
  const thieu = (o.phaiCo || []).filter((c) => !maCD(r).includes(c));
  kiem(ma + ': ' + moTa, !r.thang && !thieu.length, r.thang ? 'vẫn thắng' : 'thiếu ' + thieu.join(', ') + ' trong ' + maCD(r).join(', '));
}
function dung(ma, moTa, d1, d2, o = {}) {
  const m = man(ma), r = cham(m, d1 || lg(m, 0), d2 || lg(m, 1), o);
  kiem(ma + ': ' + moTa, r.thang, J(r.chanDoan.map((c) => c.ma + ': ' + (c.loi || '').slice(0, 80))).slice(0, 300));
  return r;
}

const CHO_CUA = ['while not front_clear():', '    wait()'];
const CHO_BAO = ['while left_clear() and right_clear():', '    wait()'];
const TRA_LOI = ['if not left_clear():', '    spray()', 'else:', '    spray_back()', 'wait()'];
const DEM = (n) => ['for i in range(' + n + '):', '    wait()'];

console.log('— đội và phần cứng');
{
  const ds = M.danhSach.filter((m) => /^(che-)?doi-mau$/.test(m.chuong));
  kiem('20 màn, hai chương doi-mau + che-doi-mau', ds.length === 20);
  kiem('R1 là robot màu: camera đọc ô trước mặt, tay kẹp, không súng', ds.every((m) => m.doi[0].robot.tay === 'kep' && m.doi[0].robot.camBien.some((c) => c.ma === 'camera') &&
    m.doi[0].hamGoc.includes('color') && !m.doi[0].hamGoc.some((h) => /spray/.test(h))));
  kiem('R2 là robot súng hơi: không đọc màu, không tay kẹp, có cảm biến hai bên', ds.every((m) => m.doi[1].robot.tay === 'hoi' && !m.doi[1].hamGoc.includes('color') &&
    !m.doi[1].hamGoc.includes('grab') && m.doi[1].hamGoc.includes('left_clear') && m.doi[1].hamGoc.includes('right_clear')));
  const docBen = ds.filter((m) => /left_clear|right_clear|watch_side|stand_by/.test(J(m.loiGiai.doi[1]) + J(m.loiGiai.hamCuaMan) + J(m.loiGiai.hamCuaEmMoi)));
  kiem('K6: ít nhất 14 màn R2 hỏi bên trái / phải (trực tiếp hay qua hàm)', docBen.length >= 14, docBen.length);
  const docMau = ds.filter((m) => /color\(\)|sort_color|show_color|pick_side/.test(J(m.loiGiai.doi[0]) + J(m.loiGiai.hamCuaMan) + J(m.loiGiai.hamCuaEmMoi)));
  kiem('mọi màn R1 đọc màu (color, sort_color, show_color)', docMau.length === 20, ds.filter((m) => !docMau.includes(m)).map((m) => m.ma).join(', '));
  const khoa = ds.filter((m) => m.doi.some((d) => d.coDinh));
  kiem('có robot tự động khóa ở ít nhất 9 màn, robot màu khóa ở ít nhất 6', khoa.length >= 9 && ds.filter((m) => m.doi[0].coDinh).length >= 6, khoa.length);
}

console.log('\n— chương doi-mau');
// 1: R2 khóa mở cửa; R1 phải nhìn màu
sai('doi-mau.1', 'R1 đặt hộp đỏ sang trái (không nhìn màu) thì sai màu', ['forward(3)', 'pick()', 'turn_left()', 'drop()'], null, { phaiCo: ['dat-sai-mau'] });
sai('doi-mau.1', 'R1 phân loại khi chưa tới trước hộp: kẹp hụt', ['forward(2)', 'sort_color()'], null);
// 2: R2 phải tới đúng hàng nút; R1 khóa chờ cửa
sai('doi-mau.2', 'R2 bắn ngay ở chỗ xuất phát: bóng không tới nút', null, ['spray()', 'wait()']);
sai('doi-mau.2', 'R2 quay nhầm trái rồi bắn', null, ['forward(2)', 'turn_left()', 'spray()', 'wait()']);
// 3: dọn đường bắn
sai('doi-mau.3', 'R2 không chờ hộp được dọn: bóng trúng hộp', null, ['spray()', 'wait()'], { phaiCo: ['ban-bi-chan'] });
sai('doi-mau.3', 'R1 chỉ dọn hộp, không vào kho phân loại hộp thứ hai', ['sort_color()'], null);
// 4: đứng bên nào
sai('doi-mau.4', 'R2 không chờ tín hiệu (if ngay): bắn nhầm nút sau lưng', null, TRA_LOI);
sai('doi-mau.4', 'R2 bắn cả hai nút (chỉ có một viên): nút sau trước thì hết đạn cho nút trước', null, nhieu(CHO_BAO, ['spray_back()', 'wait()', 'spray()', 'wait()']), { phaiCo: ['het-dan'] });
sai('doi-mau.4', 'R2 mở cửa đỏ ngay từ đầu: R1 chạy tuột vào phòng', null, ['spray()', 'wait()']);
sai('doi-mau.4', 'R2 hiểu ngược tín hiệu (bên trái thì bắn nút sau)', null, nhieu(CHO_BAO, ['if not left_clear():', '    spray_back()', 'else:', '    spray()', 'wait()']));
// 5: lộn ngược
sai('doi-mau.5', 'R2 chép cách hỏi của màn 4 (left_clear): bắn nhầm', null, nhieu(CHO_BAO, TRA_LOI));
sai('doi-mau.5', 'R1 né bằng dodge_left() như màn 4: đâm tường', nhieu(['c = color()', 'pick()', 'if c == "red":', '    dodge_left()', '    dodge_left()', 'go_wall()'], CHO_CUA, ['move()', 'drop()']), null);
// 6: cổng nhịp
sai('doi-mau.6', 'R2 không chờ: cửa kho mở sớm, R1 chạy tuột vào kho', null, ['spray()', 'wait()']);
sai('doi-mau.6', 'R2 đếm nhịp đoán ít (3 nhịp) rồi bắn: cửa mở sớm', null, nhieu(DEM(3), ['spray()', 'wait()']));
{
  const m = man('doi-mau.6');
  const r1 = nhieu(['go_wall()', 'go_wall()'], CHO_CUA, ['go_wall()', 'sort_color()']);
  sai('doi-mau.6', 'cổng nhịp thật sự chặn R1: bỏ vòng chờ cổng thì R1 hỏng', r1, null);
  const r = cham(m, lg(m, 0), lg(m, 1));
  const cho = r.theoSan[0].doi[0].vet.filter((v) => v.loai === 'nhip' && v.robot && v.robot.x === 2 && v.robot.y === 2).length;
  kiem('doi-mau.6: R1 đứng chờ trước cổng nhịp ít nhất 2 nhịp', cho >= 2, cho);
}
// 7: sửa điều kiện chờ
sai('doi-mau.7', 'sửa thành chỉ canh bên trái: R1 đứng bên phải nên R2 chờ mãi', null, nhieu(['while left_clear():', '    wait()'], TRA_LOI));
// 8: nhìn trước khi nhặt
sai('doi-mau.8', 'mẫu: nhặt rồi mới nhìn màu thì đặt sai màu', man('doi-mau.8').maMau.doi[0].chinh, null, { phaiCo: ['dat-sai-mau'] });
// 9: ba cổng một nút
sai('doi-mau.9', 'R2 không chờ, cứ bắn rồi tiến: cổng đổi sai lúc', null, ['for i in range(3):', '    spray()', '    wait()', '    forward(3)']);
sai('doi-mau.9', 'R2 đứng yên bắn ba lần liền', null, ['for i in range(3):', '    spray()', '    wait()']);
{
  const thang = nhieu(...[0, 1, 2].map(() => ['while left_clear():', '    wait()', 'spray()', 'wait()', 'forward(3)']));
  sai('doi-mau.9', 'R2 viết thẳng ba lượt: tràn khung 10 ô', null, thang);
  const r1 = nhieu(...[0, 1, 2].map(() => nhieu(['go_wall()'], CHO_CUA, ['move()'])), ['go_wall()', 'sort_color()']);
  sai('doi-mau.9', 'R1 viết thẳng ba lượt: tràn khung 10 ô', r1, null);
}
// 10: trùm
sai('doi-mau.10', 'R2 ghi cứng bắn nút trước (đỏ)', null, nhieu(['go_wall()'], CHO_BAO, ['spray()', 'wait()']));
sai('doi-mau.10', 'R2 đếm nhịp rồi bắn (không đọc tín hiệu)', null, nhieu(['go_wall()'], DEM(10), ['spray()', 'wait()']));
sai('doi-mau.10', 'R2 không lên chốt (chép màn 4)', null, nhieu(CHO_BAO, TRA_LOI));
sai('doi-mau.10', 'R2 lên chốt nhưng không chờ tín hiệu', null, nhieu(['go_wall()'], TRA_LOI));
kiem('doi-mau.10: ba sân khác màu hộp và khác chỗ xuất phát của R2', (() => {
  const m = man('doi-mau.10');
  return J(m.vatMau.map((v) => v[4][4])) === J(['r', 'b', 'r']) && new Set(m.doi[1].batDau.map(J)).size === 3;
})());

console.log('\n— chương che-doi-mau');
const T_WATCH = ['while left_clear() and right_clear():', '    wait()'];
const T_ANSWER = ['if not left_clear():', '    spray()', 'else:', '    spray_back()', 'wait()'];
const T_SHOW = ['c = color()', 'pick()', 'if c == "red":', '    dodge_left()', 'else:', '    dodge_right()'];
{
  const truocGoi = khoTruoc.get('che-doi-mau.1').map((h) => h.ten);
  const moi = M.danhSach.filter((m) => m.chuong === 'che-doi-mau').flatMap((m) => m.taoHam);
  kiem('ba hàm chế watch_side, answer_side, show_color ở màn 1, 2, 3, tên mới (chưa có trong kho)', J(moi) === J(['watch_side', 'answer_side', 'show_color']) &&
    moi.every((t) => !truocGoi.includes(t)) && [1, 2, 3].every((i) => man('che-doi-mau.' + i).taoHam.length === 1));
  const hamMan = M.danhSach.filter((m) => /doi-mau/.test(m.chuong)).flatMap((m) => (m.maMau.hamCuaMan || []).map((h) => h.ten));
  const khoCuoi = [...kho.keys()];
  kiem('hàm của màn (pick_side, stand_by) không trùng hàm nào trong kho cả game', hamMan.length === 2 && hamMan.every((t) => !khoCuoi.includes(t)), hamMan.join(', '));
  kiem('đúng bản thân hàm chế trong lời giải', J(man('che-doi-mau.1').loiGiai.hamCuaEmMoi[0].than) === J(T_WATCH) &&
    J(man('che-doi-mau.2').loiGiai.hamCuaEmMoi[0].than) === J(T_ANSWER) && J(man('che-doi-mau.3').loiGiai.hamCuaEmMoi[0].than) === J(T_SHOW));
}
sai('che-doi-mau.1', 'watch_side chỉ canh bên trái: R1 tới bên phải nên chờ mãi', null, null, { ham: [H('watch_side', ['while left_clear():', '    wait()'])] });
sai('che-doi-mau.1', 'watch_side quên wait() (pass): vòng lặp không có nhịp', null, null, { ham: [H('watch_side', ['while left_clear() and right_clear():', '    pass'])] });
sai('che-doi-mau.1', 'R2 không chờ, bắn ngay: R1 chạy tuột vào kho', null, ['spray()', 'wait()']);
sai('che-doi-mau.2', 'answer_side quên wait(): phát bắn không chạy', null, null, { ham: [H('answer_side', T_ANSWER.slice(0, 4))] });
sai('che-doi-mau.2', 'answer_side hai nhánh ngược', null, null, { ham: [H('answer_side', ['if not left_clear():', '    spray_back()', 'else:', '    spray()', 'wait()'])] });
sai('che-doi-mau.3', 'show_color nhặt rồi mới nhìn màu', null, null, { ham: [H('show_color', ['pick()', 'c = color()', 'if c == "red":', '    dodge_left()', 'else:', '    dodge_right()'])], phaiCo: ['dat-sai-mau'] });
sai('che-doi-mau.3', 'show_color né ngược', null, null, { ham: [H('show_color', ['c = color()', 'pick()', 'if c == "red":', '    dodge_right()', 'else:', '    dodge_left()'])] });
dung('che-doi-mau.4', 'cùng chương trình hàm như màn 3 vẫn đúng khi sân lộn ngược', man('che-doi-mau.3').loiGiai.doi[0].chinh, man('che-doi-mau.3').loiGiai.doi[1].chinh);
sai('che-doi-mau.4', 'R1 tự né theo màn hình (hộp xanh sang phải màn hình): vào phòng đỏ', nhieu(['c = color()', 'pick()', 'dodge_left()', 'go_wall()'], CHO_CUA, ['move()', 'drop()']), null, { phaiCo: ['dat-sai-mau'] });
sai('che-doi-mau.5', 'R2 không đi xuống chốt', null, ['watch_side()', 'answer_side()']);
sai('che-doi-mau.5', 'R2 xuống một ô (đứng giữa hai cửa) rồi đọc', null, ['forward(1)', 'watch_side()', 'answer_side()']);
sai('che-doi-mau.6', 'R2 né về phía R1', null, man('che-doi-mau.9').maMau.doi[1].chinh);
sai('che-doi-mau.6', 'R2 bắn trước rồi mới đọc (đã giật lùi khỏi chốt)', null, ['watch_side()', 'spray()', 'wait()', 'if left_clear():', '    dodge_left()', 'else:', '    dodge_right()', 'go_wall()']);
{
  const m = man('che-doi-mau.6');
  kiem('che-doi-mau.6: hai robot có cờ riêng ở hai phòng khác nhau', m.doi[0].co && m.doi[1].co && J(m.doi[0].co) !== J(m.doi[1].co));
}
sai('che-doi-mau.7', 'mẫu: pick_side né ngược thì hộp đỏ vào phòng xanh', null, null, { hamCuaMan: man('che-doi-mau.7').maMau.hamCuaMan, phaiCo: ['dat-sai-mau'] });
dung('che-doi-mau.7', 'sửa pick_side bằng cách gọi show_color() cũng đúng', null, null, { hamCuaMan: [H('pick_side', ['show_color()'])] });
sai('che-doi-mau.8', 'sửa stand_by chỉ canh bên trái: R1 bên phải nên chờ mãi', null, null, { hamCuaMan: [H('stand_by', ['while left_clear():', '    wait()'])] });
dung('che-doi-mau.8', 'sửa stand_by bằng cách gọi watch_side() cũng đúng', null, null, { hamCuaMan: [H('stand_by', ['watch_side()'])] });
sai('che-doi-mau.9', 'mẫu: R2 né về phía R1', null, man('che-doi-mau.9').maMau.doi[1].chinh);
{
  const m = man('che-doi-mau.9');
  const r = cham(m, lg(m, 0), lg(m, 1));
  kiem('che-doi-mau.9: lời giải đưa mỗi robot tới đúng cờ riêng', r.thang && r.theoSan[0].doi.every((d) => d.toiCo));
}
sai('che-doi-mau.10', 'R1 không tới sát hộp trước (thiếu go_wall đầu)', man('che-doi-mau.3').loiGiai.doi[0].chinh, null);
sai('che-doi-mau.10', 'R2 ghi cứng bắn nút trước', null, ['watch_side()', 'spray()', 'wait()']);
sai('che-doi-mau.10', 'R2 không canh, trả lời ngay', null, ['answer_side()']);
sai('che-doi-mau.10', 'R2 đếm nhịp rồi trả lời', null, nhieu(DEM(8), ['answer_side()']));

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
