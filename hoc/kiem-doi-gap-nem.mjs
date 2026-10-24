/* ============================================================================
   kiem-doi-gap-nem.mjs — máy kiểm RIÊNG của gói Đội tay gắp và máy ném (man-doi-gap-nem.js), phần đặc thù chương 2 `che-doi-gap-nem`.
   Luật chung (10 màn khác nhau, mẫu không thắng, cần cả đội, ngưỡng sao…) đã ở kiem-goi-doi.mjs; ở đây kiểm ý của từng màn:
   - chương 2 là đội TAY XOAY + MÁY NÉM (chương 1 vẫn tay kẹp + máy ném), tay xoay đặt vật sang ô bên cạnh không quay xe;
   - ba hàm cốt truyện mới (feed, relay_throw, catch_box) tên không trùng hàm nào khác của lộ trình, mỗi hàm chế đúng một màn, màn sau dùng lại;
   - robot khóa đúng chỗ, cờ riêng ở bài đổi phía (9);
   - lời sai tiêu biểu bị chặn (thua) hay mất sao: chế hàm sai, không chờ, viết thẳng, không sửa hàm của màn, lối tắt trên ba kho.
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
const H = (ten, thamSo, than) => ({ ten, thamSo, than });
const CHE = 'che-doi-gap-nem';

const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
const get = (so) => M.timMa(CHE + '.' + so);
/** Chấm bài làm ở màn `so`: kho như người chơi tới màn, cộng hàm của em mới của lời giải; `ham` thay hàm của em cùng tên. */
function cham(so, doi, opt = {}) {
  const m = get(so);
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of (m.loiGiai.hamCuaEmMoi || [])) hs.set(h.ten, clone(h));
  for (const h of opt.ham || []) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: [], hamCuaMan: opt.hamCuaMan || m.loiGiai.hamCuaMan || [], doi: doi.map((c) => ({ chinh: c })) }, [...hs.values()]);
}
const LG = (so, i) => get(so).loiGiai.doi[i].chinh;
const ma = (r) => r.chanDoan.map((c) => c.ma);
function thua(so, moTa, doi, opt) {
  const r = cham(so, doi, opt);
  kiem(CHE + '.' + so + ': ' + moTa + ' → không thắng', !r.thang, 'thắng ' + r.sao + ' sao');
  return r;
}
function itSao(so, moTa, doi, opt) {
  const r = cham(so, doi, opt);
  kiem(CHE + '.' + so + ': ' + moTa + ' → thắng nhưng dưới 3 sao', r.thang && r.sao < 3, r.thang ? r.sao + ' sao' : J(ma(r)));
}

/** Dò hình sân (điều kiện cần, bỏ qua số dòng / nhịp): robot nào không khóa mà MỘT MÌNH với tới được mọi vật và đủ ô đích
 *  (như tools/do-mot-robot.mjs: đồng đội em viết đứng yên, robot khóa không đi cũng đứng yên, là vật cản). Trả về ['R1', …] cho sân thứ si. */
function motMinh(m, si) {
  const VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const rows = Array.isArray(m.san[0]) ? m.san[si] : m.san;
  const at = (x, y) => (rows[y] && rows[y][x]) || '#';
  const bds = m.doi.map((d) => (Array.isArray(d.batDau) ? d.batDau[si] : d.batDau));
  const vat = [], dich = [];
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'o') vat.push([x, y]); if (c === 'D') dich.push([x, y]); }));
  m.doi.forEach((d) => { if (d.roBanDau) vat.push(null); });
  const DI = /move\(|go_wall|back\(|forward|walk|go\(|jump|leap|crawl|hop_box|bring|carry|deliver|step\(|route/;
  const dung = m.doi.map((d, i) => !d.coDinh || !DI.test(J(m.maMau.doi[i].chinh)));        // đồng đội đứng yên: robot em viết (bỏ chương trình) hay robot khóa không đi
  const kq = [];
  m.doi.forEach((d, i) => {
    if (d.coDinh || m.mucTieu !== 'dua-vat') return;
    const nhen = d.loaiRobot === 'nhen', nem = d.robot && d.robot.tay === 'nem';
    const qua = (x, y) => !bds.some((b, j) => j !== i && dung[j] && b.x === x && b.y === y) && !'#=u'.includes(at(x, y)) && (nhen || at(x, y) !== 'n');
    const den = new Set([bds[i].x + ',' + bds[i].y]), hang = [[bds[i].x, bds[i].y]];
    while (hang.length) {
      const [x, y] = hang.shift();
      for (const [dx, dy] of VEC) for (const k of nhen ? [1, 2] : [1]) {
        const nx = x + dx * k, ny = y + dy * k;
        if ((k === 2 && at(x + dx, y + dy) !== 'u') || !qua(nx, ny) || den.has(nx + ',' + ny)) continue;
        den.add(nx + ',' + ny); hang.push([nx, ny]);
      }
    }
    const ds = [...den].map((s) => s.split(',').map(Number));
    const tay = nhen ? [VEC[bds[i].huong || 0]] : VEC;
    const ke = (o) => ds.some(([x, y]) => tay.some(([dx, dy]) => x + dx === o[0] && y + dy === o[1]));
    const nemToi = (o) => ds.some(([x, y]) => VEC.some(([dx, dy]) => [1, 2, 3].some((k) => x + dx * k === o[0] && y + dy * k === o[1])));
    if (vat.every((v) => (v === null ? nem : ke(v))) && dich.filter((o) => (nem ? nemToi(o) : ke(o))).length >= vat.length) kq.push('R' + (i + 1));
  });
  return kq;
}

const ds = M.danhSach.filter((m) => m.chuong === CHE);
console.log('— chương ' + CHE + ' (' + ds.length + ' màn)');
kiem('chương 2 nằm ngay sau chương 1 của gói', M.danhSach.findIndex((m) => m.chuong === CHE) === M.danhSach.findIndex((m) => m.chuong === 'doi-gap-nem') + 10);
kiem('chương 1 giữ nguyên: R1 tay kẹp, không taoHam, không robot khóa',
  M.danhSach.filter((m) => m.chuong === 'doi-gap-nem').every((m) => m.doi[0].robot.tay === 'kep' && !m.taoHam.length && m.doi.every((d) => !d.coDinh)));
kiem('chương 2: R1 gắn tay xoay (arm_left / arm_right), R2 máy ném',
  ds.every((m) => m.doi[0].robot.tay === 'xoay' && m.doi[0].hamGoc.includes('arm_left') && m.doi[0].hamGoc.includes('arm_right') && m.doi[1].robot.tay === 'nem'));
kiem('tay xoay học trước gói (chương che-tay-xoay đứng trước)', M.danhSach.findIndex((m) => m.chuong === 'che-tay-xoay') < M.danhSach.findIndex((m) => m.chuong === CHE));

// hàm cốt truyện mới
const TAO = { 1: 'feed', 2: 'relay_throw', 3: 'catch_box' };
for (const [so, ten] of Object.entries(TAO)) {
  const m = get(so);
  kiem(m.ma + ': chế ' + ten + '() (taoHam, có trong hamCuaEmMoi của lời giải)', J(m.taoHam) === J([ten]) && m.loiGiai.hamCuaEmMoi.some((h) => h.ten === ten));
  const khac = M.danhSach.filter((x) => x.ma !== m.ma && ((x.taoHam || []).includes(ten) || [x.loiGiai, x.maMau].some((b) => [...(b.hamCuaEmMoi || []), ...(b.hamCuaMan || [])].some((h) => h.ten === ten))));
  kiem(ten + ': tên mới, không màn nào khác chế hay khai hàm cùng tên', !khac.length, khac.map((x) => x.ma).join(', '));
  kiem(ten + ': chưa có trong kho trước gói', !khoTruoc.get('doi-gap-nem.1').some((h) => h.ten === ten));
}
kiem('feed() không quay xe: thân chỉ có lệnh tay', !/turn|move|u_turn/.test(J(get(1).loiGiai.hamCuaEmMoi[0].than)));
kiem('các màn 4–10 không chế thêm hàm, dùng lại hàm đã chế', ds.filter((m) => m.so >= 4).every((m) => !m.taoHam.length && !m.loiGiai.hamCuaEmMoi.length));
kiem('hàm đã chế được dùng lại ở màn sau (feed ≥ 3 màn, relay_throw ≥ 4, catch_box ≥ 2)',
  ['feed', 'relay_throw', 'catch_box'].every((t, k) => ds.filter((m) => m.so > 3 && J([m.loiGiai.doi, m.loiGiai.hamCuaMan]).includes(t + '(')).length >= [3, 4, 2][k]));
kiem('robot khóa: máy ném ở 1, 3, 6, 8; tay xoay ở 2, 5, 7, 9', J(ds.map((m) => m.doi.map((d) => d.coDinh ? 1 : 0).join(''))) === J(['01', '10', '01', '00', '10', '01', '10', '01', '10', '00']));
kiem('màn 9 đổi phía: mỗi robot một cờ riêng, cờ là ô F, mục tiêu tới cờ', get(9).mucTieu === 'toi-co' && get(9).doi.every((d) => d.co && d.co.length === 1 && get(9).san[d.co[0].y][d.co[0].x] === 'F'));

// 10 (trùm, tools/do-mot-robot.mjs không dò màn 10): máy ném đi được vào ô bàn giao rồi vào chỗ tay xoay vừa rời, nên về hình sân nó với tới vật;
// muốn làm một mình phải viết một chương trình tự nạp, quay, ném đúng cho cả ba kho. Các màn 1–9 đã chặn bằng hình sân.
for (const m of ds) {
  const n = Array.isArray(m.san[0]) ? m.san.length : 1, mm = [];
  for (let s = 0; s < n; s++) mm.push(...motMinh(m, s));
  if (![10].includes(m.so)) kiem(m.ma + ': không robot nào một mình với tới mọi vật và đủ đích (robot kia đứng yên)', !mm.length, [...new Set(mm)].join(', '));
}

console.log('\n— lời sai và lối tắt');
// 1 feed
thua(1, 'feed đặt sang trái (tường): vật còn trong tay', [['feed()'], LG(1, 1)], { ham: [H('feed', [], ['pick()', 'drop_left()'])] });
thua(1, 'feed quên đặt (chỉ pick())', [['feed()'], LG(1, 1)], { ham: [H('feed', [], ['pick()'])] });
{
  const r = thua(1, 'viết thẳng pick(), drop_right() không chế feed()', [['pick()', 'drop_right()'], LG(1, 1)]);
  kiem(CHE + '.1: viết thẳng bị báo chua-tao-ham', ma(r).includes('chua-tao-ham'), J(ma(r)));
}
// 2 relay_throw
thua(2, 'relay_throw nạp ngay không chờ', [LG(2, 0), ['relay_throw(3)']], { ham: [H('relay_throw', ['n'], ['launch(n)'])] });
thua(2, 'relay_throw chờ sai điều kiện (while not)', [LG(2, 0), ['relay_throw(3)']], { ham: [H('relay_throw', ['n'], ['while not front_clear():', '    wait()', 'launch(n)'])] });
thua(2, 'ném tầm 2: vật rơi trúng hàng rào', [LG(2, 0), ['relay_throw(2)']]);
// 3 catch_box
thua(3, 'catch_box nhặt ngay không chờ', [['catch_box()', 'drop_left()'], LG(3, 1)], { ham: [H('catch_box', [], ['pick()'])] });
thua(3, 'bắt được rồi đặt sang phải (sai bên)', [['catch_box()', 'drop_right()'], LG(3, 1)]);
// 4 hai làn
thua(4, 'tay xoay chỉ chuyền vật trước mặt', [['feed()'], LG(4, 1)]);
thua(4, 'vật bên trái đặt xuống trước mặt (drop) thay vì sang phải', [['feed()', 'pick_left()', 'drop()'], LG(4, 1)]);
thua(4, 'máy ném ném cả hai vật thẳng một làn: vật sau rơi trúng vật trước', [LG(4, 0), ['relay_throw(3)', 'relay_throw(3)']]);
thua(4, 'máy ném không chờ vật thứ hai', [LG(4, 0), ['relay_throw(3)', 'side_throw(3)']]);
// 5 tay xoay khóa gọi catch_box
thua(5, 'máy ném chỉ ném vật trước mặt (rổ còn đầy nên nạp không được)', [LG(5, 0), ['relay_throw(3)']]);
thua(5, 'máy ném chỉ ném vật trong rổ', [LG(5, 0), ['toss(3)']]);
thua(5, 'ném tầm 2: vật rơi trúng hàng rào', [LG(5, 0), ['toss(2)', 'relay_throw(2)']]);
// 6 bắt hai lượt
thua(6, 'tay xoay không tiến: lượt hai chờ mãi', [['for i in range(2):', '    catch_box()', '    drop_left()'], LG(6, 1)]);
thua(6, 'tay xoay nhặt ngay, không catch_box()', [['for i in range(2):', '    pick()', '    drop_left()', '    move()'], LG(6, 1)]);
itSao(6, 'viết thẳng hai lượt (không lặp)', [['catch_box()', 'drop_left()', 'move()', 'catch_box()', 'drop_left()'], LG(6, 1)]);
// 7 swing
{
  const r = thua(7, 'không sửa swing(): khớp kẹt vì tay hạ', [LG(7, 0), LG(7, 1)], { hamCuaMan: get(7).maMau.hamCuaMan });
  kiem(CHE + '.7: mẫu báo tay-xoay-ket', ma(r).includes('tay-xoay-ket'), J(ma(r)));
}
thua(7, 'nâng tay SAU khi xoay: vẫn kẹt', [LG(7, 0), LG(7, 1)], { hamCuaMan: [H('swing', [], ['arm_down()', 'grab()', 'wait()', 'arm_right()', 'wait()', 'arm_up()', 'arm_down()', 'release()', 'wait()'])] });
// 8 long_throw
thua(8, 'không sửa long_throw(): ném tầm cũ 1 ô', [LG(8, 0), LG(8, 1)], { hamCuaMan: get(8).maMau.hamCuaMan });
thua(8, 'aim cứng 2: vật rơi trúng tay xoay', [LG(8, 0), LG(8, 1)], { hamCuaMan: [H('long_throw', ['n'], ['load()', 'wait()', 'aim(2)', 'throw()', 'wait()'])] });
// 9 wait_pass
thua(9, 'không sửa wait_pass(): máy ném ra sớm', [LG(9, 0), LG(9, 1)], { hamCuaMan: get(9).maMau.hamCuaMan });
thua(9, 'wait_pass chỉ chờ máy ném tới: ra khi bạn đang ở trước hốc', [LG(9, 0), LG(9, 1)], { hamCuaMan: [H('wait_pass', [], ['while front_clear():', '    wait()'])] });
thua(9, 'máy ném dừng giữa hành lang (forward(5))', [LG(9, 0), ['forward(5)']]);
// 10 trùm
thua(10, 'tay xoay luôn feed() sang phải', [['go_wall()', 'feed()'], LG(10, 1)]);
thua(10, 'tay xoay luôn đặt sang trái', [['go_wall()', 'pick()', 'drop_left()'], LG(10, 1)]);
thua(10, 'tay xoay không go_wall(): kho xa nhặt hụt', [['if right_clear():', '    feed()', 'else:', '    pick()', '    drop_left()'], LG(10, 1)]);
thua(10, 'máy ném nạp ngay không chờ', [LG(10, 0), ['launch(3)']]);
{
  const r = cham(10, [LG(10, 0), LG(10, 1)]);
  kiem(CHE + '.10: lời giải thắng cả ba kho, tính nhịp theo tổng', r.theoSan.length === 3 && r.theoSan.every((s) => s.thang) && get(10).nhipTheo === 'tong');
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
