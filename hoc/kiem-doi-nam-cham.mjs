/* ============================================================================
   kiem-doi-nam-cham.mjs — máy kiểm RIÊNG của gói Đội nam châm và màu (man-doi-nam-cham.js: chương doi-nam-cham + che-doi-nam-cham, 20 màn).
   Luật chung của mọi gói đội (10 màn khác nhau, mẫu không thắng, cần cả đội, ngưỡng sao…) nằm ở kiem-goi-doi.mjs; ở đây kiểm phần đặc thù:
   - đội: R1 nam châm + cảm biến từ (không đọc màu), R2 tay kẹp + camera + cảm biến khoảng cách (không nam châm);
   - robot tự động khóa đúng các màn đã định, chương trình mẫu của robot khóa chạy đúng lời giải;
   - kỹ năng K7 (đường lui khi đồng đội không làm được): mỗi màn có danh sách lời sai tiêu biểu (chờ mãi, không chờ, chờ quá ngắn, chờ cứng,
     R1 không nhường đường, R2 làm hết, sai cực…) phải THUA, hay thắng nhưng MẤT SAO;
   - trùm: ba sân, có sân vật gỗ mà R1 bó tay (chờ mãi thì quá nhịp), có sân vật sau rào mà R2 không với tới;
   - chương 2: ba hàm cốt truyện mới hold_on(n), hand_off(), plan_b() (tên chưa có trong kho, chỉ gói này tạo), hàm của màn không trùng kho,
     màn cờ riêng doi[i].co (đổi chỗ).
   Chạy: node hoc/kiem-doi-nam-cham.mjs        (trượt thì thoát mã 1)
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
const LAP = (n, l) => ['for i in range(' + n + '):'].concat(l.map((s) => '    ' + s));
const H = (ten, thamSo, than) => ({ ten, thamSo, than });

const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
/** Chấm bài hai robot với kho người chơi có lúc tới màn; dsHam (nếu có) thay / thêm hàm của em, không thì dùng hàm mới của lời giải. */
function cham(m, doi, hamCuaMan, dsHam) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of (dsHam || m.loiGiai.hamCuaEmMoi || [])) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: [], hamCuaMan: hamCuaMan || m.loiGiai.hamCuaMan || [], doi: doi.map((c) => ({ chinh: c })) }, [...hs.values()]);
}
const man = (ma) => M.danhSach.find((m) => m.ma === ma);
const ds1 = M.danhSach.filter((m) => m.chuong === 'doi-nam-cham');
const ds2 = M.danhSach.filter((m) => m.chuong === 'che-doi-nam-cham');
const tatCa = ds1.concat(ds2);

// chương trình hay dùng trong lời sai
const R1_TU_DONG = ['if front_metal() or front_pole() != "none":', '    grip()', '    u_turn()', '    magnet_off()', '    wait()', 'else:', '    turn_left()', '    move()'];
const CHO_MAI = ['while front_clear():', '    wait()'];
const CHO_HAN = (n) => LAP(n, ['if front_clear():', '    wait()']);
const R2_BA_MAU = ['if color() == "green":', '    pass_back()', 'else:', '    sort_color()'];
const HOLD_WHILE = H('hold_on', ['n'], ['while front_clear():', '    wait()']);
const HOLD_CUNG = H('hold_on', ['n'], ['for i in range(n):', '    wait()']);

/* Lời sai tiêu biểu từng màn. doi: [R1 | null, R2 | null] (null = giữ chương trình lời giải); ket: 'thua' | 'matSao' | 'chan' (thua hay mất sao đều được); ham: hàm của em thay thế; hamMan: hàm của màn. */
const LOI_SAI = {
  'doi-nam-cham.1': [
    { moTa: 'R1 bật cùng cực S: vật bị đẩy đi', doi: [['magnet_s()', 'wait()', 'turn_left()', 'magnet_off()', 'wait()'], null], ket: 'thua' },
    { moTa: 'R1 thả ngay, chưa rẽ vào đích', doi: [['grip()', 'magnet_off()', 'wait()'], null], ket: 'thua' }
  ],
  'doi-nam-cham.2': [
    { moTa: 'R2 phân loại ngay, không chờ vật tới', doi: [null, ['sort_color()']], ket: 'thua' },
    { moTa: 'R2 chờ sai điều kiện (while not front_clear)', doi: [null, ['while not front_clear():', '    wait()', 'sort_color()']], ket: 'thua' }
  ],
  'doi-nam-cham.3': [
    { moTa: 'R1 kéo về rồi giữ mãi', doi: [['magnet_n()', 'wait()'], null], ket: 'thua' },
    { moTa: 'R1 thả ngay vào hàng rào', doi: [['magnet_n()', 'wait()', 'magnet_off()', 'wait()'], null], ket: 'thua' },
    { moTa: 'R1 chuyền sang trái, sai phía R2', doi: [['grip()', 'turn_left()', 'magnet_off()', 'wait()'], null], ket: 'thua' }
  ],
  'doi-nam-cham.4': [
    { moTa: 'R2 chờ mãi vật gỗ (quá nhịp)', doi: [null, CHO_MAI.concat(['sort_color()'])], ket: 'thua' },
    { moTa: 'R2 không chờ, lao lên lúc R1 còn giữa lối', doi: [null, ['fetch_back()', 'sort_color()']], ket: 'thua' },
    { moTa: 'R2 chờ có hạn nhưng không có đường lui', doi: [null, CHO_HAN(3).concat(['sort_color()'])], ket: 'thua' }
  ],
  'doi-nam-cham.5': [
    { moTa: 'R1 bật nam châm ngay vào khúc gỗ', doi: [['grip()', 'u_turn()', 'magnet_off()', 'wait()'], null], ket: 'thua' },
    { moTa: 'R2 phân loại tại chỗ, chưa tới cạnh khúc gỗ', doi: [null, ['sort_color()']], ket: 'thua' }
  ],
  'doi-nam-cham.6': [
    { moTa: 'R2 đếm nhịp từng chuyến (viết thẳng): mất sao ô', doi: [null, ['for i in range(3):', '    wait()', 'sort_color()', 'for i in range(5):', '    wait()', 'sort_color()']], ket: 'matSao' },
    { moTa: 'R2 vòng lặp đếm cứng 5 nhịp: mất sao nhịp', doi: [null, LAP(2, ['for j in range(5):', '    wait()', 'sort_color()'])], ket: 'matSao' },
    { moTa: 'R2 đếm nhịp ít quá', doi: [null, LAP(2, ['for j in range(2):', '    wait()', 'sort_color()'])], ket: 'thua' }
  ],
  'doi-nam-cham.7': [
    { moTa: 'R2 giới hạn chờ 2 nhịp: camera chưa thấy vật, đặt nhầm màu', doi: [null, CHO_HAN(2).concat(['sort_color()'])], ket: 'thua' },
    { moTa: 'R2 không chờ', doi: [null, ['sort_color()']], ket: 'thua' },
    { moTa: 'R2 tự lái đi lấy (R1 chắn lối)', doi: [null, ['fetch_back()', 'sort_color()']], ket: 'thua' }
  ],
  'doi-nam-cham.8': [
    { moTa: 'R1 thử nam châm rồi mới tránh (muộn)', doi: [['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'turn_left()', 'move()'], null], ket: 'thua' },
    { moTa: 'R1 tránh sai phía, vào tường', doi: [R1_TU_DONG, null], ket: 'thua' },
    { moTa: 'R1 không tránh', doi: [['grip()', 'u_turn()', 'magnet_off()', 'wait()'], null], ket: 'thua' }
  ],
  'doi-nam-cham.9': [
    { moTa: 'R1 viết thẳng ba trạm: tràn khung', doi: [[].concat(...[1, 2, 3].map(() => ['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'u_turn()', 'step(0, 2)'])), null], ket: 'thua' },
    { moTa: 'R1 dịch một ô mỗi trạm', doi: [LAP(3, ['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'u_turn()', 'dodge_right()']), null], ket: 'thua' },
    { moTa: 'R2 không chờ vật', doi: [null, LAP(3, ['pass_back()', 'step(0, 2)'])], ket: 'thua' },
    { moTa: 'R2 chờ cứng 3 nhịp mỗi trạm: mất sao nhịp', doi: [null, LAP(3, ['for j in range(3):', '    wait()', 'pass_back()', 'step(0, 2)'])], ket: 'matSao' }
  ],
  'doi-nam-cham.10': [
    { moTa: 'R2 chờ mãi (sân gỗ quá nhịp)', doi: [null, LAP(2, CHO_MAI.concat(['sort_color()']))], ket: 'thua' },
    { moTa: 'R2 không chờ, chỉ có đường lui', doi: [null, LAP(2, ['if front_clear():', '    fetch_back()', 'sort_color()'])], ket: 'thua' },
    { moTa: 'R2 chờ cứng 3 rồi luôn fetch_back: thua hay mất sao', doi: [null, LAP(2, ['for j in range(3):', '    wait()', 'fetch_back()', 'sort_color()'])], ket: 'chan' },
    { moTa: 'R2 giới hạn chờ 2 nhịp: thua hay mất sao', doi: [null, LAP(2, CHO_HAN(2).concat(['if front_clear():', '    fetch_back()', 'sort_color()']))], ket: 'chan' },
    { moTa: 'R2 đặt hết sang phải, không nhìn màu', doi: [null, LAP(2, CHO_HAN(3).concat(['if front_clear():', '    fetch_back()', 'put_right()']))], ket: 'thua' },
    { moTa: 'R2 chỉ một lượt', doi: [null, CHO_HAN(3).concat(['if front_clear():', '    fetch_back()', 'sort_color()'])], ket: 'thua' },
    { moTa: 'R1 không nhường đường khi gặp gỗ', doi: [LAP(2, ['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'u_turn()']), null], ket: 'thua' },
    { moTa: 'R1 quên quay lại sau khi giao', doi: [LAP(2, R1_TU_DONG), null], ket: 'thua' },
    { moTa: 'R1 luôn tránh, R2 làm hết (vật sau rào)', doi: [['turn_left()', 'move()'], null], ket: 'thua' },
    { moTa: 'R1 luôn bật cực N (đẩy vật chữ N)', doi: [LAP(2, ['if front_metal() or front_pole() != "none":', '    magnet_n()', '    wait()', '    u_turn()', '    magnet_off()', '    wait()', '    u_turn()', 'else:', '    turn_left()', '    move()']), null], ket: 'thua' },
    { moTa: 'R1 chỉ hỏi front_metal (bỏ sót vật nam châm)', doi: [LAP(2, ['if front_metal():'].concat(R1_TU_DONG.slice(1, 5), ['    u_turn()'], R1_TU_DONG.slice(5))), null], ket: 'thua' }
  ],
  'che-doi-nam-cham.1': [
    { moTa: 'hold_on viết bằng while: lần chờ thứ hai kéo dài mãi', doi: [null, null], ham: [HOLD_WHILE], ket: 'thua' },
    { moTa: 'hold_on chờ cứng đủ n nhịp: mất sao nhịp', doi: [null, null], ham: [HOLD_CUNG], ket: 'matSao' },
    { moTa: 'hold_on không chờ (pass)', doi: [null, null], ham: [H('hold_on', ['n'], ['pass'])], ket: 'thua' },
    { moTa: 'Không dùng hold_on, viết vòng chờ ngay trong R2', doi: [null, CHO_HAN(5).concat(['sort_color()'], CHO_HAN(5), ['fetch_back()', 'sort_color()'])], ham: [], ket: 'thua' }
  ],
  'che-doi-nam-cham.2': [
    { moTa: 'hand_off quên quay đầu: thả xuống hố', doi: [null, null], ham: [H('hand_off', [], ['grip()', 'magnet_off()', 'wait()'])], ket: 'thua' },
    { moTa: 'hand_off luôn bật cực N: đẩy vật chữ N', doi: [null, null], ham: [H('hand_off', [], ['magnet_n()', 'wait()', 'u_turn()', 'magnet_off()', 'wait()'])], ket: 'thua' },
    { moTa: 'R1 gọi hand_off một lần', doi: [['hand_off()'], null], ket: 'thua' }
  ],
  'che-doi-nam-cham.3': [
    { moTa: 'plan_b luôn fetch_back: mất sao nhịp', doi: [null, null], ham: [H('plan_b', [], ['fetch_back()'])], ket: 'matSao' },
    { moTa: 'plan_b không làm gì', doi: [null, null], ham: [H('plan_b', [], ['pass'])], ket: 'thua' },
    { moTa: 'R2 bỏ plan_b', doi: [null, LAP(2, ['hold_on(3)', 'sort_color()'])], ket: 'thua' }
  ],
  'che-doi-nam-cham.4': [
    { moTa: 'R1 chỉ dịch trạm khi giao được (kẹt ở trạm gỗ)', doi: [LAP(3, ['if front_metal() or front_pole() != "none":', '    hand_off()', '    u_turn()', '    dodge_right()']), null], ket: 'thua' },
    { moTa: 'R2 bỏ plan_b', doi: [null, LAP(3, ['hold_on(3)', 'pass_back()', 'dodge_right()'])], ket: 'thua' },
    { moTa: 'hold_on viết bằng while', doi: [null, null], ham: [HOLD_WHILE], ket: 'thua' }
  ],
  'che-doi-nam-cham.5': [
    { moTa: 'R2 không xét xanh lá: vật xanh lá vào đích xanh dương', doi: [null, LAP(3, ['hold_on(3)', 'sort_color()'])], ket: 'thua' },
    { moTa: 'R1 quên quay lại sau mỗi lần giao', doi: [LAP(3, ['hand_off()']), null], ket: 'thua' },
    { moTa: 'R2 không chờ', doi: [null, LAP(3, ['if color() == "green":', '    pass_back()', 'else:', '    sort_color()'])], ket: 'thua' }
  ],
  'che-doi-nam-cham.6': [
    { moTa: 'R1 quay rồi mới hút: giao chậm một nhịp', doi: [['turn_left()', 'magnet_n()', 'wait()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_left()', 'move()'], null], ket: 'thua' },
    { moTa: 'R1 giao kịp nhưng không tránh lối', doi: [['magnet_n()', 'turn_left()', 'turn_left()', 'magnet_off()', 'wait()'], null], ket: 'thua' }
  ],
  'che-doi-nam-cham.7': [
    { moTa: 'Chưa sửa lane_left: thả vào hàng rào', doi: [null, null], hamMan: [H('lane_left', [], ['grip()', 'magnet_off()', 'wait()', 'turn_left()', 'turn_right()'])], ket: 'thua' },
    { moTa: 'lane_left quay phải: thả vào tường', doi: [null, null], hamMan: [H('lane_left', [], ['grip()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()'])], ket: 'thua' }
  ],
  'che-doi-nam-cham.8': [
    { moTa: 'Chưa sửa scan_wait: R1 không chờ', doi: [null, null], hamMan: [H('scan_wait', ['n'], ['for i in range(n):', '    if front_pole() != "none":', '        wait()'])], ket: 'thua' },
    { moTa: 'scan_wait chờ quá ít (2 nhịp)', doi: [['scan_wait(2)', 'hand_off()'], null], ket: 'thua' }
  ],
  'che-doi-nam-cham.9': [
    { moTa: 'Chưa sửa tuck_in: R2 đâm vào khúc gỗ', doi: [null, null], hamMan: [H('tuck_in', [], ['forward(3)', 'turn_right()', 'move()'])], ket: 'thua' },
    { moTa: 'R1 không hút vật sắt chắn lối', doi: [['go_wall()', 'while not front_clear():', '    wait()', 'go_wall()'], null], ket: 'thua' },
    { moTa: 'R1 dừng sau lưng R2 rồi thôi', doi: [['magnet_n()', 'wait()', 'go_wall()'], null], ket: 'thua' }
  ],
  'che-doi-nam-cham.10': [
    { moTa: 'hold_on viết bằng while (sân gỗ quá nhịp)', doi: [null, null], ham: [HOLD_WHILE], ket: 'thua' },
    { moTa: 'R2 bỏ plan_b', doi: [null, LAP(2, ['hold_on(3)'].concat(R2_BA_MAU))], ket: 'thua' },
    { moTa: 'plan_b luôn fetch_back: thua hay mất sao', doi: [null, null], ham: [H('plan_b', [], ['fetch_back()'])], ket: 'chan' },
    { moTa: 'R2 không xét xanh lá', doi: [null, LAP(2, ['hold_on(3)', 'plan_b()', 'sort_color()'])], ket: 'thua' },
    { moTa: 'R1 luôn tránh, R2 làm hết (vật sau rào)', doi: [['turn_left()', 'move()'], null], ket: 'thua' },
    { moTa: 'R1 không tránh khi gặp gỗ', doi: [LAP(2, ['hand_off()', 'u_turn()']), null], ket: 'thua' }
  ]
};

console.log('— đội và cấu trúc');
kiem('20 màn: 10 doi-nam-cham + 10 che-doi-nam-cham', ds1.length === 10 && ds2.length === 10);
kiem('R1 là nam châm + cảm biến từ, không đọc màu', tatCa.every((m) => m.doi[0].robot.tay === 'nam-cham' && m.doi[0].hamGoc.includes('front_metal') && m.doi[0].hamGoc.includes('front_pole') && !m.doi[0].hamGoc.includes('color')));
kiem('R2 là tay kẹp + camera, không có nam châm', tatCa.every((m) => m.doi[1].robot.tay === 'kep' && m.doi[1].robot.camBien.some((c) => c.ma === 'camera') && m.doi[1].hamGoc.includes('color') && !m.doi[1].hamGoc.some((h) => /^magnet/.test(h))));
const KHOA = { 'doi-nam-cham.2': 0, 'doi-nam-cham.4': 0, 'doi-nam-cham.6': 0, 'doi-nam-cham.8': 1, 'che-doi-nam-cham.3': 0, 'che-doi-nam-cham.6': 1, 'che-doi-nam-cham.7': 1, 'che-doi-nam-cham.8': 0, 'che-doi-nam-cham.9': 1 };
kiem('robot tự động khóa đúng các màn đã định', tatCa.every((m) => J(m.doi.map((d, i) => !!d.coDinh)) === J([KHOA[m.ma] === 0, KHOA[m.ma] === 1])),
  tatCa.filter((m) => m.doi.some((d) => d.coDinh)).map((m) => m.ma).join(', '));
for (const ma of Object.keys(KHOA)) {
  const m = man(ma), i = KHOA[ma];
  const r = cham(m, m.loiGiai.doi.map((d, j) => (j === i ? m.maMau.doi[i].chinh : d.chinh)));
  kiem(ma + ': robot khóa chạy đúng chương trình mẫu của nó thì thắng 3 sao', r.thang && r.sao === 3);
}
kiem('mọi màn dùng mục tiêu đưa vật, trừ màn cờ riêng che-doi-nam-cham.9', tatCa.every((m) => m.mucTieu === (m.ma === 'che-doi-nam-cham.9' ? 'toi-co' : 'dua-vat')));

console.log('\n— lời sai tiêu biểu (phải thua, hay thắng mà mất sao)');
for (const m of tatCa) {
  for (const ls of LOI_SAI[m.ma] || []) {
    const doi = ls.doi.map((c, i) => c || m.loiGiai.doi[i].chinh);
    const r = cham(m, doi, ls.hamMan, ls.ham);
    const ok = ls.ket === 'thua' ? !r.thang : ls.ket === 'matSao' ? (r.thang && r.sao < 3) : (!r.thang || r.sao < 3);
    kiem(m.ma + ': ' + ls.moTa, ok, r.thang ? 'thắng ' + r.sao + ' sao (ô ' + r.soO + ', nhịp ' + r.soNhip + ')' : 'thua: ' + r.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma).join(', '));
  }
}
kiem('màn nào cũng có ít nhất hai lời sai được thử', tatCa.every((m) => (LOI_SAI[m.ma] || []).length >= 2));
{
  const ma = (m) => J(m.loiGiai.doi.map((d) => d.chinh));
  const trung = tatCa.filter((m, i) => tatCa.some((n, k) => k !== i && n.chuong === m.chuong && ma(n) === ma(m))).map((m) => m.ma);
  kiem('không có hai màn cùng chương chung một lời giải (cả hai chương trình)', !trung.length, trung.join(', '));
}

console.log('\n— trùm');
for (const m of [man('doi-nam-cham.10'), man('che-doi-nam-cham.10')]) {
  const chat = m.vatChat.map((s) => s.join(''));
  const san = m.san.map((s) => s.join(''));
  kiem(m.ma + ': ba sân, có sân vật gỗ và có sân vật sau hàng rào', m.san.length === 3 && chat.some((c) => c.includes('g')) && san.some((s) => s.includes('=')));
}
{
  const m = man('doi-nam-cham.10');
  const r = cham(m, [m.loiGiai.doi[0].chinh, LAP(2, CHO_MAI.concat(['sort_color()']))]);
  const coGo = m.vatChat.map((sc) => sc.join('').includes('g'));
  kiem('doi-nam-cham.10: chờ mãi thì sân có gỗ chạy quá nhịp, sân không gỗ vẫn thắng', !r.thang && r.theoSan.every((s, i) => s.thang === !coGo[i]) &&
    r.theoSan.filter((s, i) => coGo[i]).every((s) => s.chanDoan.some((c) => /qua-nhieu-nhip|vong-vo-han/.test(c.ma))));
  kiem('doi-nam-cham.10: lời giải lặp hai lượt, khác lời giải màn 4', J(m.loiGiai.doi).includes('for i in range(2)') && J(m.loiGiai.doi) !== J(man('doi-nam-cham.4').loiGiai.doi));
}

console.log('\n— chương 2: hàm chế, hàm của màn, cờ riêng');
const MOI = { 'che-doi-nam-cham.1': 'hold_on', 'che-doi-nam-cham.2': 'hand_off', 'che-doi-nam-cham.3': 'plan_b' };
for (const ma of Object.keys(MOI)) {
  const m = man(ma), ten = MOI[ma];
  kiem(ma + ': tạo hàm mới ' + ten + ' (taoHam, chưa có trong kho)', J(m.taoHam) === J([ten]) && J(m.loiGiai.hamCuaEmMoi.map((h) => h.ten)) === J([ten]) && !khoTruoc.get(ma).some((h) => h.ten === ten));
}
kiem('ba tên hàm chỉ gói này tạo', M.danhSach.filter((m) => m.taoHam.some((t) => Object.values(MOI).includes(t))).map((m) => m.ma).sort().join() === Object.keys(MOI).sort().join());
kiem('hold_on có một tham số n', J(man('che-doi-nam-cham.1').loiGiai.hamCuaEmMoi[0].thamSo) === J(['n']));
kiem('màn 4–6 và trùm dùng các hàm vừa chế (hold_on ở cả bốn; plan_b ở 4, 6, 10)', [4, 5, 6, 10].every((so) => {
  const m = man('che-doi-nam-cham.' + so), ma = J(m.loiGiai.doi);
  return ma.includes('hold_on(') && (so === 5 || ma.includes('plan_b()'));
}));
kiem('trùm chương 2 không trùng thân vòng lặp của màn nào trước nó', ds2.slice(0, 9).every((m) => J(m.loiGiai.doi.map((d) => d.chinh.slice(1))) !== J(man('che-doi-nam-cham.10').loiGiai.doi.map((d) => d.chinh.slice(1)))));
kiem('một màn luyện có robot khóa gọi hàm vừa chế (che-doi-nam-cham.6)', man('che-doi-nam-cham.6').doi[1].coDinh && J(man('che-doi-nam-cham.6').maMau.doi[1]).includes('hold_on('));
const HAM_MAN = { 'che-doi-nam-cham.7': 'lane_left', 'che-doi-nam-cham.8': 'scan_wait', 'che-doi-nam-cham.9': 'tuck_in' };
for (const ma of Object.keys(HAM_MAN)) {
  const m = man(ma), ten = HAM_MAN[ma];
  const mau = m.maMau.hamCuaMan.find((h) => h.ten === ten), lg = m.loiGiai.hamCuaMan.find((h) => h.ten === ten);
  kiem(ma + ': sửa hàm của màn ' + ten + ' (bản mẫu hỏng, tên không trùng kho)', !!mau && !!lg && J(mau.than) !== J(lg.than) && !kho.has(ten) && !khoTruoc.get(ma).some((h) => h.ten === ten));
}
{
  const m = man('che-doi-nam-cham.9');
  kiem('che-doi-nam-cham.9: cờ riêng cho từng robot, cờ của mỗi robot nằm sau lưng đồng đội (phải đổi chỗ)',
    m.doi.every((d) => Array.isArray(d.co) && d.co.length === 1) && m.doi[0].co[0].x > m.doi[1].batDau.x && m.doi[1].co[0].x < m.doi[0].batDau.x);
  const r = cham(m, [m.loiGiai.doi[0].chinh, ['u_turn()', 'move()']]);
  kiem('che-doi-nam-cham.9: R2 đứng lên cờ của R1 không tính là tới cờ', !r.thang && r.theoSan[0].doi[1].toiCo === false);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
