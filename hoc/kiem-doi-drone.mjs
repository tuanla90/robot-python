/* ============================================================================
   kiem-doi-drone.mjs — MÁY KIỂM RIÊNG gói Đội drone và máy ném (man-doi-drone.js: doi-drone + che-doi-drone).
   Luật chung (10 màn khác nhau, mẫu không thắng, cần cả đội, ngưỡng sao…) ở kiem-goi-doi.mjs; ở đây kiểm phần đặc thù K9:
   - mỗi màn: lời sai tiêu biểu (chờ cứng, sai điều kiện chờ, thả trúng đầu xe, thả giữa lối xe, bay đường không có ô sạc, quên về đậu ô sạc,
     viết thẳng tràn khung, hàm chế thiếu bước…) không thắng, kèm chẩn đoán đúng;
   - ý của từng màn có thật trong lời giải: drone bay qua rào / băng / đầu xe, ghé sạc, đậu ô sạc khi chờ, cảm biến xe không thấy drone;
   - robot khóa đúng robot; trùm: lời viết cứng cho một sân trượt sân khác; chương 2: hàm chế (receive, snatch, courier) đúng tên, đúng đối số.
   Chạy: node hoc/kiem-doi-drone.mjs
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

// kho hàm người chơi có trước mỗi màn (đi tuần tự lộ trình xuất bản), như kiem-goi-doi.mjs
const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
const man = (ma) => M.danhSach.find((m) => m.ma === ma);
/** Chấm bài đội: c1 của xe, c2 của drone (null = giữ lời giải), hamCuaMan / moi (hàm của em mới) tuỳ chọn. */
function cham(m, c1, c2, tuy) {
  tuy = tuy || {};
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of (tuy.moi !== undefined ? tuy.moi : (m.loiGiai.hamCuaEmMoi || []))) hs.set(h.ten, clone(h));
  const doi = [c1 || m.loiGiai.doi[0].chinh, c2 || m.loiGiai.doi[1].chinh].map((c) => ({ chinh: c.slice() }));
  return Cham.cham(tuy.man || m, { chinh: [], hamCuaMan: tuy.hamCuaMan || m.loiGiai.hamCuaMan || [], doi }, [...hs.values()]);
}
const ma = (r) => r.chanDoan.map((c) => c.ma);
const tom = (r) => (r.thang ? 'thắng ' + r.sao + ' sao' : 'thua') + ' [' + ma(r).join(', ') + ']';
/** Lời sai: không thắng và (nếu khai) có các mã chẩn đoán. */
function sai(m, moTa, c1, c2, maCan, tuy) {
  const r = cham(m, c1, c2, tuy);
  kiem(m.ma + ': ' + moTa, !r.thang && (maCan || []).every((x) => ma(r).includes(x)), tom(r));
  return r;
}
/** Vết nhịp của robot i ở sân si trong lời giải. */
function vetNhip(m, i, si) { return cham(m).theoSan[si || 0].doi[i].vet.filter((e) => e.loai === 'nhip'); }
const coSuKien = (vet, mac) => vet.some((e) => (e.suKien || []).some((s) => s.ma === mac));
const H = (ten, thamSo, than) => ({ ten, thamSo, than });
const CHO = ['while front_clear():', '    wait()'];

/* ============================================================ chương 1 */
console.log('— chương doi-drone');
{
  const m = man('doi-drone.1');
  sai(m, 'drone bay thẳng tới đích mà chưa bật nam châm: không mang hộp', null, ['walk("RRRRRR")'], ['chua-dua-vat']);
  sai(m, 'drone hút hộp nhưng chưa tới đích đã thả', null, ['ship("RRRR")'], ['chua-dua-vat']);
  const v = vetNhip(m, 1);
  kiem(m.ma + ': drone bay qua hàng rào và băng chuyền mà xe không qua được', coSuKien(v, 'bay-qua') &&
    v.some((e) => (e.suKien || []).some((s) => s.ma === 'bay-qua' && s.tren.includes('rao'))) && v.some((e) => (e.suKien || []).some((s) => s.ma === 'bay-qua' && s.tren.includes('bang'))));
}
{
  const m = man('doi-drone.2');
  kiem(m.ma + ': R1 (xe) là robot tự động khóa', m.doi[0].coDinh === true && !m.doi[1].coDinh);
  sai(m, 'drone thả hộp xuống đúng ô xe đang đứng: không thả được', null, ['walk("UU")', 'ship("DDL")'], ['tha-bi-chan']);
  const v = vetNhip(m, 1);
  kiem(m.ma + ': đường bay của drone đi ngang qua đầu xe (khác tầng)', v.some((e) => e.robot.x === 6 && e.robot.y === 3));
}
{
  const m = man('doi-drone.3');
  sai(m, 'xe không chờ: go_wall() kẹt ngay ô đầu, ném hụt', ['go_wall()', 'toss(2)'], null, ['chua-dua-vat']);
  sai(m, 'xe chờ sai điều kiện (while front_clear()): không chờ gì cả', CHO.concat(['go_wall()', 'toss(2)']), null);
  sai(m, 'drone nhấc hộp chắn mà không đem cất vào đích', null, ['ship("UUU")'], ['chua-dua-vat']);
  // lối tắt cũ (bộ dò một robot tìm ra): xe ném hộp của mình ra lối, nạp hộp chắn rồi đứng trên giếng ném xuống ô đích; nay ô đích xa 4 ô, quá tầm 3
  sai(m, 'xe làm một mình: dời hộp chắn rồi ném xuống giếng (ô đích quá tầm)', ['toss(2)', 'load()', 'wait()', 'move()', 'turn_right()', 'toss(3)', 'turn_left()', 'load()', 'wait()', 'go_wall()', 'toss(2)'], []);
}
{
  const m = man('doi-drone.4');
  sai(m, 'xe ném hộp sắt mà không chờ: nạp hụt', ['u_turn()', 'launch(3)', 'u_turn()', 'launch(3)'], null, ['chua-dua-vat']);
  const r = cham(m, ['u_turn()', 'launch(3)', 'u_turn()'].concat(CHO, ['launch(3)']), null);
  kiem(m.ma + ': xe ném hộp gỗ trước trong lúc drone bay đi lấy hộp sắt (song song, không phải chờ đồng đội xong)', r.thang && r.soNhip < 3 + 1 + 5 + 1 + 4 + 2, r.soNhip);
}
{
  const m = man('doi-drone.5');
  sai(m, 'drone bay đường trên (không có ô sạc): hết pin giữa đường', null, ['while look() == "none":', '    wait()', 'ship("RRRDD")'], ['het-pin']);
  sai(m, 'drone không chờ hộp: bay đi tay không', null, ['ship("DDRRR")'], ['chua-dua-vat']);
  const v = vetNhip(m, 1);
  kiem(m.ma + ': drone chờ trên ô sạc (pin không hao lúc chờ) và sạc giữa đường', coSuKien(v, 'sac-pin') && v.some((e) => e.robot.x === 5 && e.robot.y === 3 && (e.suKien || []).some((s) => s.ma === 'sac-pin')));
}
{
  const m = man('doi-drone.6');
  kiem(m.ma + ': R2 (drone) là robot tự động khóa, chạy theo pin', m.doi[1].coDinh === true && !m.doi[0].coDinh && m.loiGiai.doi[1].chinh.join(' ').includes('fly('));
  const v = vetNhip(m, 1);
  kiem(m.ma + ': drone ghé ô sạc ít nhất ba lần nên lúc tới không đoán theo độ dài đường bay', v.filter((e) => (e.suKien || []).some((s) => s.ma === 'sac-pin')).length >= 3);
  const xeCung = (n) => ['for i in range(' + n + '):', '    wait()', 'load()', 'wait()', 'turn_left()', 'toss(2)'];
  sai(m, 'xe chờ cứng theo độ dài đường bay (9 nhịp, quên lúc drone ghé sạc): nạp hụt', xeCung(9), null, ['chua-dua-vat']);
  const r = cham(m, CHO.concat(['load()', 'wait()', 'turn_left()', 'toss(2)']), null);
  kiem(m.ma + ': chờ bằng cảm biến thì thắng 3 sao (cảm biến xe không thấy drone bay ngang)', r.thang && r.sao === 3, tom(r));
}
{
  const m = man('doi-drone.7');
  sai(m, 'mẫu: while look() == "none" thoát ngay vì sàn vàng', null, m.maMau.doi[1].chinh, ['chua-dua-vat']);
  sai(m, 'đổi thành while look() != "yellow": cũng thoát ngay', null, ['while look() != "yellow":', '    wait()', 'ship("RRR")'], ['chua-dua-vat']);
  sai(m, 'xe tự ném thẳng vào đích: đích ngoài tầm', ['go_wall()', 'load()', 'wait()', 'u_turn()', 'go_wall()', 'turn_left()', 'toss(3)'], []);
}
{
  const m = man('doi-drone.8');
  for (const p of ['DD', 'DDR', 'DDRR', 'DDRRRR']) sai(m, 'drone thả ở ' + J(p) + ': hộp chắn lối hay sai chỗ xe chờ', null, ['ship("' + p + '")']);
  const r = cham(m, null, ['ship("DD")']);
  kiem(m.ma + ': mẫu: hộp nằm giữa lối nên xe đứng sớm rồi ném vỡ', ma(r).includes('nem-vo'), tom(r));
}
{
  const m = man('doi-drone.9');
  const thang3 = [].concat(...[0, 1, 2].map(() => CHO.concat(['side_throw(2)', 'move()'])));
  sai(m, 'xe viết thẳng ba chuyến: tràn khung', thang3, null, ['tran-khung']);
  sai(m, 'xe không tiến lên sau mỗi lần ném: chờ mãi ở chỗ cũ', ['for i in range(3):', '    while front_clear():', '        wait()', '    side_throw(2)'], null);
  sai(m, 'drone quên go_left(): chuyến sau không có hộp', null, ['for i in range(3):', '    airlift(4)']);
}
{
  const m = man('doi-drone.10');
  kiem(m.ma + ': ba sân khác pin, khác chỗ giao, khác phía đích', J(m.doi[1].pin) === J([9, 6, 4]) && new Set(m.doi[0].batDau.map((b) => b.x)).size === 3);
  const xe = m.loiGiai.doi[0].chinh, dr = m.loiGiai.doi[1].chinh;
  sai(m, 'xe luôn quay trái (viết cứng cho sân 1): sân khác ném vào tường', CHO.concat(['load()', 'wait()', 'turn_left()', 'toss(3)']), null, ['nem-vo']);
  sai(m, 'xe chờ cứng 14 nhịp: hợp sân 1 nhưng hụt sân pin thấp', ['for i in range(14):', '    wait()'].concat(xe.slice(2)), null);
  sai(m, 'drone không ghé sạc: hết pin ở sân pin 4', null, ['magnet_n()', 'wait()', 'while look() != "yellow":', '    go_right()', 'go_down()', 'magnet_off()', 'go_up()', 'go_up()'], ['het-pin']);
  sai(m, 'drone thả xong lơ lửng chờ, không về đậu ô sạc: hết pin trong lúc xe ném', null, dr.slice(0, 7).concat(['wait()']), ['het-pin']);
  {
    const r = cham(m, null, ['magnet_n()', 'wait()', 'fly("RRRRRRRRR")', 'go_down()', 'magnet_off()', 'go_up()', 'go_up()']);
    kiem(m.ma + ': drone bay đường cố định của sân 1 (sân ngắn thì đâm tường cho dừng): không được 3 sao', !r.thang || r.sao < 3, tom(r));
  }
}

/* ============================================================ chương 2 */
console.log('\n— chương che-doi-drone');
const RECEIVE = H('receive', [], CHO.concat(['load()', 'wait()']));
{
  const m = man('che-doi-drone.1');
  kiem(m.ma + ': dạy chế receive() (không đối số), tên chưa có trong kho', J(m.taoHam) === J(['receive']) && !khoTruoc.get(m.ma).some((h) => h.ten === 'receive') && J(m.loiGiai.hamCuaEmMoi[0].thamSo) === '[]');
  sai(m, 'receive() quên chờ: nạp hụt', null, null, ['chua-dua-vat'], { moi: [H('receive', [], ['load()', 'wait()'])] });
  sai(m, 'không chế hàm, viết thẳng vòng chờ trong chương trình: chưa tạo hàm', CHO.concat(['load()', 'wait()', 'turn_right()', 'toss(3)']), null, ['chua-tao-ham'], { moi: [] });
}
{
  const m = man('che-doi-drone.2');
  kiem(m.ma + ': dạy chế snatch(), tên chưa có trong kho', J(m.taoHam) === J(['snatch']) && !khoTruoc.get(m.ma).some((h) => h.ten === 'snatch'));
  sai(m, 'snatch() chờ sai điều kiện (!= "none"): hút hụt', null, null, ['chua-dua-vat'], { moi: [H('snatch', [], ['while look() != "none":', '    wait()', 'magnet_n()', 'wait()'])] });
  sai(m, 'snatch() quên bật nam châm', null, null, ['chua-dua-vat'], { moi: [H('snatch', [], ['while look() == "none":', '    wait()'])] });
}
{
  const m = man('che-doi-drone.3');
  kiem(m.ma + ': dạy chế courier(path, back), tên chưa có trong kho', J(m.taoHam) === J(['courier']) && J(m.loiGiai.hamCuaEmMoi[0].thamSo) === J(['path', 'back']) && !khoTruoc.get(m.ma).some((h) => h.ten === 'courier'));
  sai(m, 'courier chỉ chở, quên bay về (back): hết pin lúc xe ném', null, null, ['het-pin'], { moi: [H('courier', ['path', 'back'], ['ship(path)'])] });
  sai(m, 'courier bay về trước rồi mới chở', null, null, null, { moi: [H('courier', ['path', 'back'], ['walk(back)', 'ship(path)'])] });
  const v = vetNhip(m, 1);
  kiem(m.ma + ': drone kết thúc trên ô sạc', v.length && v[v.length - 1].robot.x === 6 && v[v.length - 1].robot.y === 1);
}
{
  const m = man('che-doi-drone.4');
  sai(m, 'xe nạp ngay hộp thứ hai, không dùng receive(): nạp hụt', ['launch(3)', 'load()', 'wait()', 'turn_right()', 'toss(3)'], null, ['chua-dua-vat']);
  sai(m, 'drone không đỡ bằng snatch(): bật nam châm khi hộp chưa tới', null, ['magnet_n()', 'wait()', 'walk("RRR")', 'magnet_off()', 'walk("LLD")', 'ship("LLLU")']);
  kiem(m.ma + ': lời giải dùng hàm chế cho cả hai robot', m.loiGiai.doi[0].chinh.includes('receive()') && m.loiGiai.doi[1].chinh.includes('snatch()'));
}
{
  const m = man('che-doi-drone.5');
  kiem(m.ma + ': R2 (drone) khóa và gọi courier() em đã chế', m.doi[1].coDinh === true && m.loiGiai.doi[1].chinh.some((s) => s.startsWith('courier(')));
  sai(m, 'xe ném cả hai hộp tầm 2: hộp sau rơi trúng hộp trước', ['for i in range(2):', '    receive()', '    turn_right()', '    toss(2)', '    turn_left()'], null, ['nem-vo']);
  const m6 = clone(m); m6.doi[1].pin = 6;
  sai(m, 'cùng chương trình mà pin 6: drone hết pin trước khi về đậu', null, null, ['het-pin'], { man: m6 });
}
{
  const m = man('che-doi-drone.6');
  // bộ dò một robot dò drone ở màn này hết hạn: kiểm bằng loang ô — drone không qua tường cao nên không tới được ô đích nào; xe bị hàng rào chặn, không tới cạnh hộp nào
  {
    const san = m.san, o = (x, y) => (san[y] || '')[x] || '#';
    const loang = (bd, qua) => { const da = new Set([bd.x + ',' + bd.y]), hang = [bd]; while (hang.length) { const p = hang.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = p.x + dx, y = p.y + dy, k = x + ',' + y; if (!da.has(k) && qua(o(x, y))) { da.add(k); hang.push({ x, y }); } } } return da; };
    const dDrone = loang(m.doi[1].batDau, (c) => c !== '#');
    const dXe = loang(m.doi[0].batDau, (c) => c === '.' || c === 'D' || c === 'P');
    const hop = []; san.forEach((h, y) => [...h].forEach((c, x) => { if (c === 'o') hop.push({ x, y }); }));
    const dich = []; san.forEach((h, y) => [...h].forEach((c, x) => { if (c === 'D') dich.push(x + ',' + y); }));
    kiem(m.ma + ': drone một mình không bay tới ô đích nào (ô đích trong hốc tường cao)', dich.every((k) => !dDrone.has(k)));
    kiem(m.ma + ': xe một mình không tới cạnh hộp nào (hàng rào chặn)', hop.every((h) => [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => !dXe.has((h.x + dx) + ',' + (h.y + dy)))));
  }
  sai(m, 'drone bay thẳng về theo hàng hộp (không lên dải ô sạc): hết pin', null, ['for i in range(3):', '    courier("RRRR", "LLLLL")'], ['het-pin']);
  const t = [].concat(...[0, 1, 2].map(() => ['receive()', 'turn_left()', 'toss(2)', 'turn_right()', 'move()']));
  sai(m, 'xe viết thẳng ba chuyến: tràn khung', t, null, ['tran-khung']);
}
{
  const m = man('che-doi-drone.7');
  kiem(m.ma + ': R2 khóa, hàm drop_off của màn hỏng ở mẫu', m.doi[1].coDinh === true && m.maMau.hamCuaMan[0].ten === 'drop_off');
  sai(m, 'giữ drop_off hỏng (thả trước khi bay): hộp nằm lại, xe chờ mãi', null, null, [], { hamCuaMan: m.maMau.hamCuaMan });
  const r = cham(m, null, null, { hamCuaMan: [H('drop_off', ['path'], ['ship(path)'])] });
  kiem(m.ma + ': sửa drop_off thành ship(path) cũng đúng', r.thang, tom(r));
}
{
  const m = man('che-doi-drone.8');
  sai(m, 'giữ standby() chờ cứng ba nhịp', null, null, ['chua-dua-vat'], { hamCuaMan: m.maMau.hamCuaMan });
  const r = cham(m, null, null, { hamCuaMan: [H('standby', [], ['while look() == "none":', '    wait()', 'magnet_n()', 'wait()'])] });
  kiem(m.ma + ': standby() viết lại vòng chờ camera cũng đúng', r.thang, tom(r));
  const v = vetNhip(m, 1);
  kiem(m.ma + ': drone chờ trên ô sạc nên pin vẫn đầy lúc hút hộp', v.some((e) => (e.suKien || []).some((s) => s.ma === 'hut-vat')) && v.find((e) => (e.suKien || []).some((s) => s.ma === 'hut-vat')).robot.pin === 5);
}
{
  const m = man('che-doi-drone.9');
  kiem(m.ma + ': cờ riêng, mỗi robot đứng trên cờ của robot kia', J(m.doi[0].co) === J([{ x: 7, y: 2 }]) && J(m.doi[1].co) === J([{ x: 1, y: 2 }]) && m.doi[0].batDau.x === 1 && m.doi[1].batDau.x === 7);
  sai(m, 'xe không chờ lối trống: kẹt trước hộp', ['go_wall()', 'go_wall()'], null, ['chua-toi-co']);
  sai(m, 'drone nhấc hộp rồi cất vào hốc giữa đường cũ, không về cờ của mình', null, ['ship("LLLLLU")'], ['chua-toi-co']);
  const v0 = vetNhip(m, 0), v1 = vetNhip(m, 1);
  const o = (v, n) => v.find((e) => e.nhip === n) || v[v.length - 1];
  const cheo = v0.some((e) => e.nhip > 1 && (() => { const a0 = o(v0, e.nhip - 1).robot, a1 = e.robot, b0 = o(v1, e.nhip - 1).robot, b1 = o(v1, e.nhip).robot;
    return a0.x === b1.x && a0.y === b1.y && a1.x === b0.x && a1.y === b0.y && (a0.x !== a1.x || a0.y !== a1.y); })());
  kiem(m.ma + ': xe và drone đổi ô cho nhau trong cùng một nhịp (khác tầng, bay ngang qua đầu xe)', cheo);
}
{
  const m = man('che-doi-drone.10');
  kiem(m.ma + ': ba sân khác pin, khác chỗ hộp của xe, khác ô đích của drone', J(m.doi[1].pin) === J([8, 5, 4]));
  sai(m, 'xe ném ngay từ chỗ nạp (không về đầu lối): hộp rơi sai chỗ', ['go_wall()', 'receive()', 'u_turn()', 'turn_right()', 'toss(3)'], null);
  sai(m, 'drone không ghé sạc: hết pin ở sân pin thấp', null, ['snatch()', 'while look() != "yellow":', '    go_right()', 'magnet_off()', 'wait()'], ['het-pin']);
  sai(m, 'drone chờ cứng thay cho snatch()', null, ['for i in range(8):', '    wait()', 'magnet_n()', 'wait()'].concat(m.loiGiai.doi[1].chinh.slice(1)));
  sai(m, 'drone bay đường cố định của sân 1', null, ['snatch()', 'fly("RRRRR")', 'magnet_off()', 'wait()']);
}

/* ============================================================ chung cả gói */
console.log('\n— chung');
const ds = M.danhSach.filter((m) => /^(che-)?doi-drone$/.test(m.chuong));
kiem('20 màn, R1 xe máy ném, R2 drone gắn nam châm + camera nhìn xuống', ds.length === 20 && ds.every((m) => m.doi[0].robot.tay === 'nem' && m.doi[1].loaiRobot === 'drone' && m.doi[1].hamGoc.includes('look') && m.doi[1].hamGoc.includes('magnet_n')));
kiem('màn có pin thì drone có battery(), không có pin thì không', ds.every((m) => (m.doi[1].pin !== undefined) === m.doi[1].hamGoc.includes('battery')));
const pinMan = ds.filter((m) => m.doi[1].pin !== undefined).map((m) => m.ma);
kiem('pin xuất hiện ở cả hai chương (quản lý pin cả đội)', pinMan.some((x) => x.startsWith('doi-')) && pinMan.some((x) => x.startsWith('che-')), pinMan.join(', '));
kiem('có màn xe khóa và màn drone khóa ở mỗi chương', ['doi-drone', 'che-doi-drone'].every((c) => [0, 1].every((i) => ds.some((m) => m.chuong === c && m.doi[i].coDinh))));
kiem('ba hàm chế mới đúng màn: receive (1), snatch (2), courier (3)', J(['che-doi-drone.1', 'che-doi-drone.2', 'che-doi-drone.3'].map((x) => man(x).taoHam[0])) === J(['receive', 'snatch', 'courier']));

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
