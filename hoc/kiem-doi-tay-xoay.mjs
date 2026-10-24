/* ============================================================================
   kiem-doi-tay-xoay.mjs — máy kiểm RIÊNG của gói Đội tay xoay và nam châm (hoc/man-doi-tay-xoay.js: chương doi-tay-xoay + che-doi-tay-xoay).
   Luật chung (10 màn khác nhau, mẫu không thắng, cần cả đội, ngưỡng sao…) ở kiem-goi-doi.mjs; ở đây kiểm phần đặc thù:
   - đội: R1 nam châm (cảm biến từ + khoảng cách), R2 tay xoay (cảm biến khoảng cách); robot khóa đúng màn (ch1: 2, 6; ch2: 5, 8);
   - hàm chế ở chương 2 (load_belt, catch_belt, wait_belt) tên mới, chưa có trong kho; hàm của màn (load_up, wait_cargo, make_way) không trùng kho;
   - cần cả đội: một robot đi một mình (đồng đội đứng yên) không thắng được ở các màn đã chặn bằng hàng rào hay chỗ đứng của đồng đội
     (bổ sung cho tools/do-mot-robot.mjs, vốn có thể hết hạn dò);
   - ý của từng màn: lời sai tiêu biểu (không chờ, chờ cứng, sai điều kiện chờ, sai thứ tự, viết thẳng, một robot tự làm hết, lối tắt cờ…)
     phải THUA hay MẤT SAO (thắng dưới 3 sao), cách đúng khác phải thắng.
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

const CH1 = 'doi-tay-xoay', CH2 = 'che-doi-tay-xoay';
const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
/** Chấm bài làm như người chơi tới màn: kho lúc tới màn + hàm của em mới của bài (them). */
function cham(m, bai, them) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of (them || [])) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: [], hamCuaMan: bai.hamCuaMan || m.loiGiai.hamCuaMan || [], doi: bai.doi }, [...hs.values()]);
}
const man = (ma) => M.danhSach.find((m) => m.ma === ma);
const T = (ds) => ds.map((d) => '    ' + d);
const lap = (dau, than) => [dau].concat(T(than));
const H = (ten, than) => ({ ten, thamSo: [], than });
/** Bài làm: chương trình hai robot; null = giữ chương trình lời giải của robot đó. */
function bai(m, c1, c2, hm) {
  return { doi: [{ chinh: c1 === null ? m.loiGiai.doi[0].chinh : c1 }, { chinh: c2 === null ? m.loiGiai.doi[1].chinh : c2 }], hamCuaMan: hm || m.loiGiai.hamCuaMan };
}
const NAP = ['grip()', 'u_turn()', 'kick()', 'u_turn()'];
const CHO_VAT = ['while front_clear():', '    wait()'];
const DON = CHO_VAT.concat(['pick()', 'drop_right()', 'move()']);
const cho = (n) => lap('for i in range(' + n + '):', ['wait()']);

/** Lời sai / lối tắt: ky 'thua' (không thắng), 'duoi3' (thắng nhưng dưới 3 sao), 'thang' (cách khác vẫn thắng). */
const LOI = {
  'doi-tay-xoay.1': [
    { moTa: 'R2 đặt vật về lại bên trái', c2: ['pick_left()', 'drop_left()'], ky: 'thua' },
    { moTa: 'R2 dùng relay(): thắng nhưng chậm hai nhịp', c2: ['relay()'], ky: 'duoi3' }
  ],
  'doi-tay-xoay.2': [
    { moTa: 'R2 không chờ: kẹp hụt vì vật chưa tới', c2: ['pick_left()', 'drop_right()'], ky: 'thua' },
    { moTa: 'R2 chờ cứng 1 nhịp: vẫn hụt', c2: cho(1).concat(['pick_left()', 'drop_right()']), ky: 'thua' },
    { moTa: 'R2 chờ cứng đúng 2 nhịp: thắng (sân này đoán được)', c2: cho(2).concat(['pick_left()', 'drop_right()']), ky: 'thang' }
  ],
  'doi-tay-xoay.3': [
    { moTa: 'R1 không chờ thấy vật: kéo trúng gỗ', c1: ['reel()'], ky: 'thua' },
    { moTa: 'R1 chờ ngược điều kiện', c1: ['while front_pole() != "none":', '    wait()', 'reel()'], ky: 'thua' },
    { moTa: 'R1 chờ bằng front_metal(): vật sau rào là vật nam châm, không phải sắt', c1: ['while not front_metal():', '    wait()', 'reel()'], ky: 'thua' },
    { moTa: 'R2 tự làm hết: dời gỗ rồi vào ô đích, vật sau hàng rào không với tới', c1: [], c2: ['forward(2)', 'pick()', 'drop_right()', 'move()', 'turn_right()', 'pick()'], ky: 'thua' }
  ],
  'doi-tay-xoay.4': [
    { moTa: 'R1 không chờ băng trống: hai vật ùn lại', c1: lap('for i in range(2):', NAP), ky: 'thua' },
    { moTa: 'R1 chờ bằng front_clear(): không thấy ô bàn giao cách 3 ô', c1: lap('for i in range(2):', ['grip()', 'u_turn()', 'while not front_clear():', '    wait()', 'kick()', 'u_turn()']), ky: 'thua' },
    { moTa: 'R2 không dọn gỗ: ô đích trước mặt còn gỗ, vật thứ hai không đặt được', c2: ['pick_left()', 'drop_right()', 'while left_clear():', '    wait()', 'pick_left()', 'drop()'], ky: 'thua' },
    { moTa: 'R2 đặt cả hai vật sang phải', c2: ['pick()', 'turn_right()', 'move()', 'drop()', 'back()', 'turn_left()', 'pick_left()', 'drop_right()', 'pick_left()', 'drop_right()'], ky: 'thua' },
    { moTa: 'R1 tự chở vật vào đích: tay xoay đứng chặn lối duy nhất', c1: lap('for i in range(2):', ['grip()', 'u_turn()', 'move()', 'move()', 'turn_right()', 'magnet_off()', 'wait()']), c2: [], ky: 'thua' }
  ],
  'doi-tay-xoay.5': [
    { moTa: 'R2 không chờ ô bàn giao trống: tay vẫn cầm vật thứ hai', c2: ['pick_left()', 'drop_right()', 'pick()', 'drop_right()'], ky: 'thua' },
    { moTa: 'R1 dừng sớm một ô: vật trượt quá hàng ô đích', c1: ['forward(5)'].concat(lap('for i in range(2):', NAP)), ky: 'thua' },
    { moTa: 'R1 một mình: hàng rào chặn, vật của tay xoay ngoài tầm', c1: ['forward(6)', 'turn_right()', 'grip()', 'turn_right()', 'kick()'], c2: [], ky: 'thua' },
    { moTa: 'R2 một mình: hàng rào chặn đường tới hàng ô đích', c1: [], c2: ['pick_left()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'drop()'], ky: 'thua' }
  ],
  'doi-tay-xoay.6': [
    { moTa: 'R2 không chờ: nhặt hụt', c2: lap('for i in range(3):', ['pick()', 'drop_right()', 'move()']), ky: 'thua' },
    { moTa: 'R2 chờ cứng 3 nhịp mỗi vật', c2: lap('for i in range(3):', ['for j in range(3):', '    wait()', 'pick()', 'drop_right()', 'move()']), ky: 'thua' },
    { moTa: 'R2 đếm nhịp đúng từng vật: thắng nhưng tốn ô (mất sao)',
      c2: cho(3).concat(lap('for i in range(2):', ['pick()', 'drop_right()', 'move()']), cho(2), ['pick()', 'drop_right()']), ky: 'duoi3' }
  ],
  'doi-tay-xoay.7': [
    { moTa: 'Không sửa: chờ cứng 2 nhịp, ô bàn giao còn vật nên tay vẫn cầm', c2: ['pick_left()', 'drop_right()', 'pick()'].concat(cho(2), ['drop_right()']), ky: 'thua' },
    { moTa: 'Chờ ngược điều kiện', c2: ['pick_left()', 'drop_right()', 'pick()', 'while right_clear():', '    wait()', 'drop_right()'], ky: 'thua' },
    { moTa: 'Bỏ hẳn vòng chờ', c2: ['pick_left()', 'drop_right()', 'pick()', 'drop_right()'], ky: 'thua' }
  ],
  'doi-tay-xoay.8': [
    { moTa: 'Không sửa: bắn trước khi quay, vật bay về ô bàn giao', c1: lap('for i in range(2):', ['while front_pole() == "none":', '    wait()', 'grip()', 'kick()', 'turn_left()', 'turn_right()']), ky: 'thua' },
    { moTa: 'Quay phải thay vì quay trái: bắn vào tay xoay', c1: lap('for i in range(2):', ['while front_pole() == "none":', '    wait()', 'grip()', 'turn_right()', 'kick()', 'turn_left()']), ky: 'thua' },
    { moTa: 'Bỏ vòng chờ: kéo hụt khi vật chưa tới', c1: lap('for i in range(2):', ['grip()', 'turn_left()', 'kick()', 'turn_right()']), ky: 'thua' }
  ],
  'doi-tay-xoay.9': [
    { moTa: 'R1 viết thẳng ba chuyến: tràn khung', c1: [0, 1, 2].flatMap(() => ['grip()', 'turn_right()', 'kick()', 'turn_left()']), ky: 'thua' },
    { moTa: 'R2 lặp hai lần: còn một vật', c2: lap('for i in range(2):', CHO_VAT.concat(['pick()', 'drop_left()', 'move()'])), ky: 'thua' },
    { moTa: 'R2 đặt sang phải: bên phải là tường', c2: lap('for i in range(3):', DON), ky: 'thua' }
  ],
  'doi-tay-xoay.10': [
    { moTa: 'R2 luôn đặt sang phải: sân 2 ô đích ở dưới', c2: lap('for i in range(3):', DON), ky: 'thua' },
    { moTa: 'R1 lặp cứng 2 lần: sân 2 có ba vật', c1: lap('for i in range(2):', NAP), ky: 'thua' },
    { moTa: 'R1 lặp cứng 3 lần: thắng (vòng thừa không hại)', c1: lap('for i in range(3):', NAP), ky: 'thang' }
  ],
  'che-doi-tay-xoay.1': [
    { moTa: 'Viết thẳng hai chuyến trong chương trình chính, không chế load_belt()', c1: NAP.concat(NAP), moi: [], ky: 'thua' },
    { moTa: 'load_belt() quên quay về kho', c1: lap('for i in range(2):', ['load_belt()']), moi: [H('load_belt', ['grip()', 'u_turn()', 'kick()'])], ky: 'thua' }
  ],
  'che-doi-tay-xoay.2': [
    { moTa: 'catch_belt() không chờ', c2: lap('for i in range(3):', ['catch_belt()']), moi: [H('catch_belt', ['pick()', 'drop_right()', 'move()'])], ky: 'thua' },
    { moTa: 'Viết đón vật trong chương trình chính, không chế catch_belt()', c2: lap('for i in range(3):', DON), moi: [], ky: 'thua' }
  ],
  'che-doi-tay-xoay.3': [
    { moTa: 'Không gọi wait_belt(): hai vật ùn lại', c1: lap('for i in range(2):', NAP), moi: [H('wait_belt', ['while front_pole() != "none":', '    wait()'])], ky: 'thua' },
    { moTa: 'wait_belt() chờ bằng front_clear()', c1: null, moi: [H('wait_belt', ['while not front_clear():', '    wait()'])], ky: 'thua' }
  ],
  'che-doi-tay-xoay.4': [
    { moTa: 'R1 không quay đầu về kho', c1: lap('for i in range(3):', ['load_belt()']), ky: 'thua' },
    { moTa: 'R2 không tiến lên: vật dừng cách mũi một ô', c2: lap('for i in range(3):', ['catch_belt()']), ky: 'thua' }
  ],
  'che-doi-tay-xoay.5': [
    { moTa: 'R1 lặp load_belt() ba lần: vật thứ ba ở phía trên', c1: lap('for i in range(3):', ['load_belt()']), ky: 'thua' },
    { moTa: 'R1 quay trái thay vì quay phải', c1: lap('for i in range(2):', ['load_belt()']).concat(['turn_left()', 'grip()', 'turn_left()', 'kick()']), ky: 'thua' }
  ],
  'che-doi-tay-xoay.6': [
    { moTa: 'R2 không chờ ô bàn giao trống', c2: ['pick_left()', 'drop_right()', 'pick()', 'drop_right()'], ky: 'thua' },
    { moTa: 'R1 kéo rồi bắn ngay, không quay đầu: vật kẹt sau hàng rào', c1: ['forward(6)'].concat(lap('for i in range(2):', ['grip()', 'kick()'])), ky: 'thua' },
    { moTa: 'R2 một mình: hàng rào chặn đường tới hàng ô đích', c1: [], c2: ['pick_left()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'drop()'], ky: 'thua' }
  ],
  'che-doi-tay-xoay.7': [
    { moTa: 'Không sửa load_up(): cực N còn bật đẩy vật trong kho ra xa', hm: [H('load_up', ['grip()', 'turn_right()', 'magnet_n()', 'wait()', 'turn_left()'])], ky: 'thua' },
    { moTa: 'R1 một mình chở vật: ô đích dưới tay xoay không với tới', c1: lap('for i in range(2):', ['grip()', 'turn_right()', 'move()', 'move()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_left()']), c2: [], ky: 'thua' },
    { moTa: 'Sửa bằng cách thêm magnet_off()', hm: [H('load_up', ['grip()', 'turn_right()', 'magnet_n()', 'wait()', 'magnet_off()', 'wait()', 'turn_left()'])], ky: 'thang' }
  ],
  'che-doi-tay-xoay.8': [
    { moTa: 'Không sửa wait_cargo(): chờ ngược điều kiện', hm: [H('wait_cargo', ['while not front_clear():', '    wait()'])], ky: 'thua' },
    { moTa: 'wait_cargo() chờ bằng front_pole()', hm: [H('wait_cargo', ['while front_pole() == "none":', '    wait()'])], ky: 'thang' }
  ],
  'che-doi-tay-xoay.9': [
    { moTa: 'Lối tắt cờ: mỗi robot lùi về cờ sau lưng (cờ của đồng đội)', c1: ['back()'], c2: ['back()'], ky: 'thua' },
    { moTa: 'Không sửa make_way(): tay xoay lùi sai hướng, chặn hành lang', hm: [H('make_way', ['pick_left()', 'drop()', 'back()'])], ky: 'thua' },
    { moTa: 'R1 đi ngay không chờ vật sắt: kẹt sau vật, đâm vào tay xoay', c1: ['forward(6)'], ky: 'thua' },
    { moTa: 'R1 chờ vật sắt nhưng không hút: vật chắn hành lang', c1: ['while not front_metal():', '    wait()', 'forward(6)'], ky: 'thua' }
  ],
  'che-doi-tay-xoay.10': [
    { moTa: 'R1 không hỏi hướng: sân 2 quay mũi ra băng', c1: lap('while front_pole() == "N":', ['load_belt()']), ky: 'thua' },
    { moTa: 'R2 không hỏi hướng: sân 2, 3 quay lưng vào tường', c2: lap('for i in range(3):', ['catch_belt()']), ky: 'thua' },
    { moTa: 'R2 lặp hai lần: sân 2 có ba vật', c2: ['if not front_clear():', '    u_turn()'].concat(lap('for i in range(2):', ['catch_belt()'])), ky: 'thua' }
  ]
};

const ds1 = M.danhSach.filter((m) => m.chuong === CH1), ds2 = M.danhSach.filter((m) => m.chuong === CH2);
console.log('— đội và robot khóa');
kiem('hai chương đủ 10 màn', ds1.length === 10 && ds2.length === 10);
for (const m of ds1.concat(ds2)) {
  const d = m.doi;
  kiem(m.ma + ': R1 nam châm (cảm biến từ), R2 tay xoay',
    d.length === 2 && d[0].robot.tay === 'nam-cham' && d[0].hamGoc.includes('front_pole') && d[0].hamGoc.includes('front_metal') &&
    d[1].robot.tay === 'xoay' && d[1].hamGoc.includes('arm_left') && d[1].hamGoc.includes('right_clear'));
}
const khoaDung = { 'doi-tay-xoay.2': 0, 'doi-tay-xoay.6': 0, 'che-doi-tay-xoay.5': 1, 'che-doi-tay-xoay.8': 0 };
kiem('robot khóa đúng các màn "robot tự động"', ds1.concat(ds2).every((m) => J(m.doi.map((d) => !!d.coDinh)) === J([0, 1].map((i) => khoaDung[m.ma] === i))),
  ds1.concat(ds2).filter((m) => m.doi.some((d) => d.coDinh)).map((m) => m.ma).join(', '));

console.log('\n— hàm chế và hàm của màn');
const TAO = { 'che-doi-tay-xoay.1': 'load_belt', 'che-doi-tay-xoay.2': 'catch_belt', 'che-doi-tay-xoay.3': 'wait_belt' };
for (const [ma, ten] of Object.entries(TAO)) {
  const m = man(ma);
  kiem(ma + ': tạo ' + ten + '() lần đầu (tên mới, chưa có trong kho)', J(m.taoHam) === J([ten]) && !khoTruoc.get(ma).some((h) => h.ten === ten) && m.loiGiai.hamCuaEmMoi.some((h) => h.ten === ten));
}
kiem('chương 1 không tạo hàm', ds1.every((m) => !m.taoHam.length && !m.loiGiai.hamCuaEmMoi.length));
for (const m of ds2.filter((x) => (x.maMau.hamCuaMan || []).length)) {
  const ten = m.maMau.hamCuaMan.map((h) => h.ten);
  kiem(m.ma + ': hàm của màn ' + ten.join(', ') + ' không trùng kho, mẫu hỏng còn lời giải sửa',
    ten.every((t) => !khoTruoc.get(m.ma).some((h) => h.ten === t) && !kho.has(t)) && J(m.maMau.hamCuaMan) !== J(m.loiGiai.hamCuaMan));
}
{
  const c9 = man('che-doi-tay-xoay.9');
  kiem('che-doi-tay-xoay.9: cờ riêng cho từng robot', c9.mucTieu === 'toi-co' && c9.doi.every((d) => Array.isArray(d.co) && d.co.length === 1) && J(c9.doi[0].co) !== J(c9.doi[1].co));
}

console.log('\n— lời sai và lối tắt từng màn');
for (const m of ds1.concat(ds2)) {
  for (const l of LOI[m.ma] || []) {
    const b = bai(m, l.c1 === undefined ? null : l.c1, l.c2 === undefined ? null : l.c2, l.hm);
    const moi = l.moi !== undefined ? l.moi : m.loiGiai.hamCuaEmMoi;
    const r = cham(m, b, moi);
    const ok = l.ky === 'thua' ? !r.thang : l.ky === 'duoi3' ? r.thang && r.sao < 3 : l.ky === 'khong3' ? !r.thang || r.sao < 3 : r.thang;
    kiem(m.ma + ': ' + l.moTa + ' → ' + l.ky, ok, r.thang ? 'thắng ' + r.sao + ' sao (ô ' + r.soO + ', nhịp ' + r.soNhip + ')' : 'thua: ' + J((r.chanDoan[0] || {}).loi || '').slice(0, 160));
  }
}

console.log('\n— ý riêng');
{
  // 6: các lần chờ của R2 dài ngắn khác nhau (đếm nhịp thì không gói được vào một vòng lặp)
  const m6 = man('doi-tay-xoay.6'), r6 = cham(m6, m6.loiGiai);
  const quang = []; let n = 0;
  for (const e of r6.doi[1].vet.filter((x) => x.loai === 'lenh')) {
    if (e.ten === 'wait' && e.cho && e.cho.cot === 'chinh') n++;
    else if (e.ten === 'grab') { quang.push(n); n = 0; }
  }
  kiem('doi-tay-xoay.6: R2 chờ mỗi vật một quãng khác nhau', new Set(quang).size >= 2, J(quang));
  // 9: viết thẳng tràn khung
  const m9 = man('doi-tay-xoay.9');
  const thang9 = ['grip()', 'turn_right()', 'kick()', 'turn_left()'];
  kiem('doi-tay-xoay.9: R1 viết thẳng ba chuyến quá 10 ô', thang9.length * 3 > m9.khung.chinh);
  // 10 và che 10: ba sân khác nhau ở chỗ buộc quyết định
  for (const ma of ['doi-tay-xoay.10', 'che-doi-tay-xoay.10']) {
    const m = man(ma);
    kiem(ma + ': ba sân khác nhau', new Set(m.san.map((s) => J(s))).size === 3 && m.san.length === 3);
  }
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
