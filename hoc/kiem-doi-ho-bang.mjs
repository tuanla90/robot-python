/* ============================================================================
   kiem-doi-ho-bang.mjs — máy kiểm RIÊNG của gói Đội vượt hố và băng chuyền (man-doi-ho-bang.js), phần đặc thù chương 2 `che-doi-ho-bang`.
   Luật chung (10 màn khác nhau, mẫu không thắng, cần cả đội, ngưỡng sao…) đã ở kiem-goi-doi.mjs; ở đây kiểm ý của từng màn:
   - ba hàm cốt truyện mới (hop_box, take_box, pause) tên không trùng hàm nào khác của lộ trình, mỗi hàm chế đúng một màn, màn sau dùng lại;
   - robot khóa đúng chỗ (xe ở 1, 3, 8; nhện ở 2, 7), cờ riêng ở bài đổi phía (9);
   - lời sai tiêu biểu bị chặn (thua) hay mất sao: chế hàm sai, chờ cứng / chờ thiếu nhịp, viết thẳng, sai thứ tự, không sửa hàm của màn, lối tắt trên ba sân.
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
const CHE = 'che-doi-ho-bang';

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
 *  (robot kia tránh đường; robot khóa không đi thì là vật cản). Trả về ['R1', …] cho sân thứ si. */
function motMinh(m, si) {
  const VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const rows = Array.isArray(m.san[0]) ? m.san[si] : m.san;
  const at = (x, y) => (rows[y] && rows[y][x]) || '#';
  const bds = m.doi.map((d) => (Array.isArray(d.batDau) ? d.batDau[si] : d.batDau));
  const vat = [], dich = [];
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'o') vat.push([x, y]); if (c === 'D') dich.push([x, y]); }));
  m.doi.forEach((d) => { if (d.roBanDau) vat.push(null); });
  const DI = /move\(|go_wall|back\(|forward|walk|go\(|jump|leap|crawl|hop_box|bring|carry|deliver|step\(|route/;
  const dung = m.doi.map((d, i) => d.coDinh && !DI.test(J(m.maMau.doi[i].chinh)));
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
kiem('chương 2 nằm ngay sau chương 1 của gói', M.danhSach.findIndex((m) => m.chuong === CHE) === M.danhSach.findIndex((m) => m.chuong === 'doi-ho-bang') + 10);
kiem('chương 1 giữ nguyên: không màn nào có taoHam, không robot khóa', M.danhSach.filter((m) => m.chuong === 'doi-ho-bang').every((m) => !m.taoHam.length && m.doi.every((d) => !d.coDinh)));

// hàm cốt truyện mới
const TAO = { 1: 'hop_box', 2: 'take_box', 3: 'pause' };
for (const [so, ten] of Object.entries(TAO)) {
  const m = get(so);
  kiem(m.ma + ': chế ' + ten + '() (taoHam, có trong hamCuaEmMoi của lời giải)', J(m.taoHam) === J([ten]) && m.loiGiai.hamCuaEmMoi.some((h) => h.ten === ten));
  const khac = M.danhSach.filter((x) => x.ma !== m.ma && ((x.taoHam || []).includes(ten) || [x.loiGiai, x.maMau].some((b) => [...(b.hamCuaEmMoi || []), ...(b.hamCuaMan || [])].some((h) => h.ten === ten))));
  kiem(ten + ': tên mới, không màn nào khác chế hay khai hàm cùng tên', !khac.length, khac.map((x) => x.ma).join(', '));
  kiem(ten + ': chưa có trong kho trước gói', !khoTruoc.get('doi-ho-bang.1').some((h) => h.ten === ten));
}
kiem('các màn 4–10 không chế thêm hàm, dùng lại hàm đã chế', ds.filter((m) => m.so >= 4).every((m) => !m.taoHam.length && !m.loiGiai.hamCuaEmMoi.length));
kiem('hàm đã chế được dùng lại ở màn sau (hop_box ≥ 6 màn, take_box ≥ 4, pause ≥ 2)',
  ['hop_box', 'take_box', 'pause'].every((t, k) => ds.filter((m) => m.so > 3 && J([m.loiGiai.doi, m.loiGiai.hamCuaMan]).includes(t + '(')).length >= [6, 4, 2][k]));
kiem('robot khóa: xe ở 1, 3, 8; nhện ở 2, 7', J(ds.map((m) => m.doi.map((d) => d.coDinh ? 1 : 0).join(''))) === J(['10', '01', '10', '00', '00', '10', '01', '10', '00', '00']));
kiem('màn 8 khóa cả chương trình chính (chỉ sửa hàm của màn)', get(8).chinhCoDinh === true && get(8).maMau.hamCuaMan.some((h) => h.ten === 'meet'));
kiem('màn 9 đổi phía: mỗi robot một cờ riêng, cờ là ô F, mục tiêu tới cờ', get(9).mucTieu === 'toi-co' && get(9).doi.every((d) => d.co && d.co.length === 1 && get(9).san[d.co[0].y][d.co[0].x] === 'F'));

for (const m of ds) {
  const n = Array.isArray(m.san[0]) ? m.san.length : 1, mm = [];
  for (let s = 0; s < n; s++) mm.push(...motMinh(m, s));
  if (![].includes(m.so)) kiem(m.ma + ': không robot nào một mình với tới mọi vật và đủ đích (robot kia tránh đường)', !mm.length, [...new Set(mm)].join(', '));
}

console.log('\n— lời sai và lối tắt');
// 1 hop_box
thua(1, 'hop_box đi thường không nhảy: nhện rơi hố', [LG(1, 0), ['hop_box("R")']], { ham: [H('hop_box', ['d'], ['pick()', 'go(d)', 'drop()'])] });
thua(1, 'hop_box nhảy trước rồi mới nhặt', [LG(1, 0), ['hop_box("R")']], { ham: [H('hop_box', ['d'], ['jump(d)', 'pick()', 'drop()'])] });
thua(1, 'hop_box quên drop(): xe chờ mãi', [LG(1, 0), ['hop_box("R")']], { ham: [H('hop_box', ['d'], ['pick()', 'jump(d)'])] });
{
  const r = thua(1, 'viết thẳng pick(), jump(), drop() không chế hàm', [LG(1, 0), ['pick()', 'jump("R")', 'drop()']]);
  kiem(CHE + '.1: viết thẳng bị báo chua-tao-ham', ma(r).includes('chua-tao-ham'), J(ma(r)));
}
// 2 take_box
thua(2, 'take_box nhặt ngay không chờ', [LG(2, 0), LG(2, 1)], { ham: [H('take_box', [], ['pick()'])] });
thua(2, 'take_box chờ sai điều kiện (while not)', [LG(2, 0), LG(2, 1)], { ham: [H('take_box', [], ['while not front_clear():', '    wait()', 'pick()'])] });
thua(2, 'take_box chờ cứng 4 nhịp', [LG(2, 0), LG(2, 1)], { ham: [H('take_box', [], ['for i in range(4):', '    wait()', 'pick()'])] });
// 3 pause
thua(3, 'nhện chờ thiếu một nhịp (pause(7))', [LG(3, 0), ['pause(7)', 'hop_box("R")']]);
thua(3, 'pause(n) viết cứng range(3), không dùng n', [LG(3, 0), LG(3, 1)], { ham: [H('pause', ['n'], ['for i in range(3):', '    wait()'])] });
itSao(3, 'chờ dư nhịp (pause(10))', [LG(3, 0), ['pause(10)', 'hop_box("R")']]);
thua(3, 'chờ bằng vòng for thẳng trong chương trình, không chế pause()', [LG(3, 0), ['for i in range(8):', '    wait()', 'hop_box("R")']]);
// 4 ba hố liền
itSao(4, 'nhện viết thẳng ba lần hop_box (không lặp)', [LG(4, 0), ['hop_box("R")', 'hop_box("R")', 'hop_box("R")']]);
thua(4, 'nhện lặp hai lần: hộp dừng giữa đường', [LG(4, 0), ['for i in range(2):', '    hop_box("R")']]);
thua(4, 'xe nhặt ngay, không take_box()', [['pick()', 'u_turn()', 'go_wall()', 'turn_right()', 'drop()'], LG(4, 1)]);
// 5 hai phía
itSao(5, 'xe viết thẳng hai lượt (không lặp)', [['take_box()', 'turn_right()', 'drop()', 'turn_right()', 'take_box()', 'turn_right()', 'drop()'], LG(5, 1)]);
thua(5, 'hộp thứ hai bay sai hướng (hop_box("R"))', [LG(5, 0), ['hop_box("R")', 'walk("RR")', 'jump("R")', 'hop_box("R")']]);
thua(5, 'xe lặp mà quên quay lần hai: hộp sau thả trùng đích', [['for i in range(2):', '    take_box()', '    turn_right()', '    drop()'], LG(5, 1)]);
// 6 thứ tự
thua(6, 'chở hộp xa trước: hộp gần đang chắn chỗ đặt', [LG(6, 0), ['leap("L")', 'hop_box("R")', 'hop_box("R")', 'hop_box("R")']]);
thua(6, 'nhện chỉ chở một hộp: xe chờ mãi', [LG(6, 0), ['hop_box("R")']]);
// 7 hop_two
thua(7, 'không sửa hop_two (vẫn nhảy sang phải)', [LG(7, 0), LG(7, 1)], { hamCuaMan: get(7).maMau.hamCuaMan });
thua(7, 'sửa còn một lần hop_box(d): hộp mới qua một hố', [LG(7, 0), LG(7, 1)], { hamCuaMan: [H('hop_two', ['d'], ['hop_box(d)'])] });
// 8 meet
thua(8, 'không sửa meet() (pause(4))', [LG(8, 0), LG(8, 1)], { hamCuaMan: get(8).maMau.hamCuaMan });
thua(8, 'meet() chờ thiếu một nhịp (pause(9))', [LG(8, 0), LG(8, 1)], { hamCuaMan: [H('meet', [], ['pause(9)', 'hop_box("R")'])] });
itSao(8, 'meet() chờ dư (pause(12))', [LG(8, 0), LG(8, 1)], { hamCuaMan: [H('meet', [], ['pause(12)', 'hop_box("R")'])] });
// 9 đổi phía
thua(9, 'nhện ra khỏi hốc sớm (pause(2))', [LG(9, 0), ['walk("LL")', 'go("D")', 'pause(2)', 'go("U")', 'walk("LLLLLL")']]);
thua(9, 'nhện đi thẳng, không tránh vào hốc', [LG(9, 0), ['walk("LLLLLLLL")']]);
thua(9, 'nhện chờ ở chỗ cũ rồi mới đi (chắn cờ của xe)', [LG(9, 0), ['pause(12)', 'walk("LLLLLLLL")']]);
thua(9, 'xe dừng ở đầu hành lang: chưa tới cờ của mình', [['go_wall()'], LG(9, 1)]);
// 10 trùm
thua(10, 'xe đếm bước cố định forward(8): sai ở sân khác', [['forward(8)', 'turn_right()', 'take_box()', 'turn_right()', 'go_wall()', 'turn_left()', 'drop()'], LG(10, 1)]);
thua(10, 'xe luôn rẽ trái ở đầu hành lang', [['go_wall()', 'turn_right()', 'take_box()', 'turn_right()', 'go_wall()', 'turn_left()', 'drop()'], LG(10, 1)]);
thua(10, 'xe nhặt ngay, không chờ hộp', [['go_wall()', 'turn_right()', 'pick()', 'turn_right()', 'go_wall()', 'if left_clear():', '    turn_left()', 'else:', '    turn_right()', 'drop()'], LG(10, 1)]);
thua(10, 'nhện chỉ chở qua một hố', [LG(10, 0), ['hop_box("R")']]);
{
  const r = cham(10, [LG(10, 0), LG(10, 1)]);
  kiem(CHE + '.10: lời giải thắng cả ba sân, tính nhịp theo tổng', r.theoSan.length === 3 && r.theoSan.every((s) => s.thang) && get(10).nhipTheo === 'tong');
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
