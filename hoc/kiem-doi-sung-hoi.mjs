/* ============================================================================
   kiem-doi-sung-hoi.mjs — MÁY KIỂM RIÊNG gói Đội súng hơi và omni (man-doi-sung-hoi.js, hai chương doi-sung-hoi + che-doi-sung-hoi).
   Luật chung của mọi gói đội (vị trí, 10 màn, mẫu không thắng, cần cả đội, ngưỡng sao…) ở hoc/kiem-goi-doi.mjs; ở đây kiểm phần đặc thù:
   - đội: R1 súng hơi (xe hai bánh, tay 'hoi'), R2 omni có cảm biến khoảng cách; robot khóa đúng chỗ, hàm mới chưa có trong kho;
   - ý của từng màn chạy thật bằng máy chấm: lời sai tiêu biểu (không chờ, chờ cứng thiếu nhịp, đứng chắn đường bắn, bắn sớm, bắn hai phát,
     sai nòng, viết thẳng tràn khung, một chương trình đúng một sân) thì thua; vài cách khác hợp lý thì vẫn thắng.
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

// kho hàm người chơi có trước mỗi màn (đi tuần tự lộ trình xuất bản)
const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
const man = (ma) => M.danhSach.find((m) => m.ma === ma);
const H = (ten, than) => ({ ten, thamSo: [], than });
/** Chấm bài làm { doi: [c1, c2], hamCuaMan?, hamEm? } (c1 / c2 null = dùng lời giải chuẩn của robot đó; hamEm thay hàm của em mới của màn). */
function cham(ma, b) {
  const m = man(ma);
  const hs = new Map(khoTruoc.get(ma).map((h) => [h.ten, h]));
  for (const h of (b.hamEm || m.loiGiai.hamCuaEmMoi || [])) hs.set(h.ten, clone(h));
  const doi = b.doi.map((c, i) => ({ chinh: c === null ? m.loiGiai.doi[i].chinh.slice() : c }));
  return Cham.cham(m, { chinh: [], hamCuaMan: b.hamCuaMan || m.loiGiai.hamCuaMan || [], doi }, [...hs.values()]);
}
const ma = (r) => r.chanDoan.map((c) => c.ma);
function thua(ma_, moTa, b, coMa) {
  const r = cham(ma_, b);
  kiem(ma_ + ': ' + moTa + ' → thua' + (coMa ? ' (' + coMa + ')' : ''), !r.thang && (!coMa || ma(r).includes(coMa)), r.thang ? 'lại thắng' : J(ma(r)));
}
function thang(ma_, moTa, b) {
  const r = cham(ma_, b);
  kiem(ma_ + ': ' + moTa + ' → vẫn thắng', r.thang, J(r.chanDoan.map((c) => c.loi.slice(0, 120))));
}
const W = ['while not front_clear():', '    wait()'];
const CHO = (n) => ['for i in range(' + n + '):', '    wait()'];

const ds = M.danhSach.filter((m) => m.chuong === 'doi-sung-hoi' || m.chuong === 'che-doi-sung-hoi');
console.log('— đội và dữ liệu');
kiem('20 màn trong hai chương', ds.length === 20);
kiem('mọi màn: R1 súng hơi (hai bánh, tay hoi), R2 omni có cảm biến khoảng cách', ds.every((m) => m.doi.length === 2
  && m.doi[0].loaiRobot === 'banh' && m.doi[0].robot.tay === 'hoi' && m.doi[0].hamGoc.includes('shoot') && m.doi[0].hamGoc.includes('shoot_back')
  && m.doi[1].loaiRobot === 'omni' && m.doi[1].hamGoc.includes('slide_left') && m.doi[1].hamGoc.includes('front_clear')
  && m.doi[1].robot.camBien.some((c) => c.ma === 'khoang-cach')));
kiem('cấp ngoài là của R1 (xe súng) để sân vẽ đúng súng', ds.every((m) => m.robot.tay === 'hoi' && m.loaiRobot === 'banh'));
kiem('robot có cảm biến thì khay có hàm cảm biến và ngược lại', ds.every((m) => m.doi.every((d) => (d.robot.camBien.length > 0) === d.hamGoc.includes('front_clear'))));
kiem('tay kẹp chỉ ở màn chở hộp (che-doi-sung-hoi.3)', ds.filter((m) => m.doi[1].robot.tay === 'kep').map((m) => m.ma).join() === 'che-doi-sung-hoi.3');
const khoa = Object.fromEntries(ds.map((m) => [m.ma, m.doi.map((d, i) => d.coDinh ? 'R' + (i + 1) : '').join('')]));
kiem('robot khóa đúng chỗ (R1 tự động ở 2, 6, 7; R2 khóa ở 8; chương 2: 1 R2, 2 3 6 7 8 R1, 9 R2)', J(khoa) === J({
  'doi-sung-hoi.1': '', 'doi-sung-hoi.2': 'R1', 'doi-sung-hoi.3': '', 'doi-sung-hoi.4': '', 'doi-sung-hoi.5': '', 'doi-sung-hoi.6': 'R1', 'doi-sung-hoi.7': 'R1', 'doi-sung-hoi.8': 'R2', 'doi-sung-hoi.9': '', 'doi-sung-hoi.10': '',
  'che-doi-sung-hoi.1': 'R2', 'che-doi-sung-hoi.2': 'R1', 'che-doi-sung-hoi.3': 'R1', 'che-doi-sung-hoi.4': '', 'che-doi-sung-hoi.5': '', 'che-doi-sung-hoi.6': 'R1', 'che-doi-sung-hoi.7': 'R1', 'che-doi-sung-hoi.8': 'R1', 'che-doi-sung-hoi.9': 'R2', 'che-doi-sung-hoi.10': ''
}), J(khoa));
kiem('sân không quá 11 × 8 (vừa khung điện thoại)', ds.every((m) => (Array.isArray(m.san[0]) ? m.san : [m.san]).every((s) => s.length <= 8 && s.every((h) => h.length <= 11 && h.length === s[0].length))));
const moi = ds.flatMap((m) => (m.loiGiai.hamCuaEmMoi || []).map((h) => [m.ma, h.ten]));
kiem('hàm của em mới: wait_gate, fire_clear, pass_gate, catch_crate, open_step (mỗi màn tạo đúng hàm của taoHam)',
  J(moi.map((x) => x[1])) === J(['wait_gate', 'fire_clear', 'pass_gate', 'catch_crate', 'open_step']) && moi.every(([k, t]) => J(man(k).taoHam) === J([t])), J(moi));
kiem('tên hàm mới chưa có trong kho trước gói, không trùng hàm gốc', moi.every(([k, t]) => !khoTruoc.get('doi-sung-hoi.1').some((h) => h.ten === t)) && moi.every(([k, t]) => !man(k).doi.some((d) => d.hamGoc.includes(t))));
kiem('hàm của màn (7, 8, 9 chương 2): mẫu là bản hỏng, lời giải là bản sửa cùng tên', ['che-doi-sung-hoi.7', 'che-doi-sung-hoi.8', 'che-doi-sung-hoi.9'].every((k) => {
  const m = man(k);
  return m.maMau.hamCuaMan.length === 1 && m.loiGiai.hamCuaMan.length === 1 && m.maMau.hamCuaMan[0].ten === m.loiGiai.hamCuaMan[0].ten && J(m.maMau.hamCuaMan[0].than) !== J(m.loiGiai.hamCuaMan[0].than);
}));
kiem('cờ có chủ ở mọi màn tới cờ (không còn lối tắt "cờ nào cũng được")', ds.filter((m) => m.mucTieu === 'toi-co').every((m) => m.doi.every((d) => d.co)));

console.log('\n— chương 1: doi-sung-hoi');
thua('doi-sung-hoi.1', 'xe súng chỉ lùi bằng bánh, không tắt băng', { doi: [['for i in range(5):', '    back()'], null] }, 'chua-toi-co');
thua('doi-sung-hoi.1', 'xe súng quay đầu tiến (băng vẫn đẩy về nút)', { doi: [['u_turn()', 'forward(5)'], null] }, 'chua-toi-co');
thang('doi-sung-hoi.1', 'bắn liên tiếp năm phát (cú giật cũng đưa xe về cờ)', { doi: [['for i in range(5):', '    jet_back()'], null] });
thua('doi-sung-hoi.2', 'omni đi thẳng lên không trượt (vướng tường)', { doi: [null, ['forward(6)']] }, 'chua-toi-co');
thua('doi-sung-hoi.3', 'omni không chờ cửa, đi thẳng', { doi: [null, ['forward(5)']] }, 'chua-toi-co');
thua('doi-sung-hoi.3', 'xe súng quay phải (bắn vào tường)', { doi: [['turn_right()', 'shoot()', 'wait()'], null] });
thang('doi-sung-hoi.3', 'omni đếm đúng hai nhịp chờ', { doi: [null, ['wait()', 'wait()', 'forward(5)']] });
thua('doi-sung-hoi.3', 'omni chờ cứng thiếu một nhịp', { doi: [null, ['wait()', 'forward(5)']] }, 'chua-toi-co');
thua('doi-sung-hoi.4', 'omni đi đếm ô forward(4) trong khi băng còn chạy', { doi: [null, ['forward(4)']] }, 'chua-toi-co');
thua('doi-sung-hoi.4', 'xe súng bắn ngay tại chỗ (không thẳng hàng nút)', { doi: [['shoot()', 'wait()'], null] });
thua('doi-sung-hoi.5', 'xe súng bắn ngay khi tới, omni chưa vào chỗ chặn', { doi: [['forward(2)', 'turn_left()', 'shoot()', 'wait()'], null] }, 'chua-day-thung');
thua('doi-sung-hoi.5', 'không có omni chặn: thùng trượt quá ô đích', { doi: [null, []] }, 'chua-day-thung');
thua('doi-sung-hoi.6', 'omni tới rồi đi luôn, không chờ cửa', { doi: [null, ['slide_r(3)', 'forward(2)']] }, 'chua-toi-co');
thua('doi-sung-hoi.6', 'omni trượt qua luôn, không dừng trước mũi xe súng (cửa không bao giờ mở)', { doi: [null, ['slide_r(6)']] });
thua('doi-sung-hoi.7', 'mẫu: while front_clear() chờ nhầm lúc cửa mở, omni đâm cửa', { doi: [null, man('doi-sung-hoi.7').maMau.doi[1].chinh] }, 'dam-tuong');
thua('doi-sung-hoi.7', 'omni không chờ gì', { doi: [null, ['for i in range(3):', '    back()', 'slide_r(3)', 'forward(3)']] }, 'chua-toi-co');
thua('doi-sung-hoi.8', 'mẫu: xe súng bắn ngay, cửa đầu đóng trước mặt omni (omni kẹt ngoài)', { doi: [['shoot()', 'wait()'], null] });
thua('doi-sung-hoi.8', 'xe súng chờ một nhịp rồi bắn: vẫn quá sớm', { doi: [['wait()', 'shoot()', 'wait()'], null] });
thang('doi-sung-hoi.8', 'xe súng đếm đúng ba nhịp rồi bắn', { doi: [nhieu(CHO(3), ['shoot()', 'wait()']), null] });
{
  const thang9 = ['move()', 'kick_right()', 'move()', 'move()', 'kick_right()', 'move()', 'move()', 'kick_right()', 'move()', 'move()', 'kick_right()', 'move()'];
  thua('doi-sung-hoi.9', 'xe súng viết thẳng 12 dòng: tràn khung 10 ô', { doi: [thang9, null] });
  thua('doi-sung-hoi.9', 'omni đi thẳng forward(8)', { doi: [null, ['forward(8)']] }, 'chua-toi-co');
  thua('doi-sung-hoi.9', 'xe súng chỉ bắn ba nút', { doi: [['for i in range(3):', '    move()', '    kick_right()', '    move()', 'forward(2)'], null] }, 'vong-vo-han');
}
thua('doi-sung-hoi.10', 'xe súng luôn quay trái (đúng sân 1, 3; sai sân 2)', { doi: [['go_wall()', 'turn_left()', 'shoot()', 'wait()'], null] });
thua('doi-sung-hoi.10', 'xe súng luôn quay phải (sai sân 1, 3)', { doi: [['go_wall()', 'turn_right()', 'shoot()', 'wait()'], null] });
thua('doi-sung-hoi.10', 'omni đếm ô forward(4) (cửa / băng chưa mở)', { doi: [null, ['forward(4)']] });
thua('doi-sung-hoi.10', 'omni chỉ go_wall() một lần (dừng trước cửa)', { doi: [null, ['go_wall()']] });
{
  const r = cham('doi-sung-hoi.10', { doi: [null, null] });
  kiem('doi-sung-hoi.10: ba sân khác nhau (nút trái / phải, cửa xa / gần, băng thay cửa) và đều thắng', r.theoSan.length === 3 && r.theoSan.every((s) => s.thang)
    && new Set(man('doi-sung-hoi.10').san.map(J)).size === 3);
}

console.log('\n— chương 2: che-doi-sung-hoi');
thua('che-doi-sung-hoi.1', 'mẫu: chưa chế wait_gate()', { doi: [null, null], hamEm: [] }, 'ham-chua-co');
thua('che-doi-sung-hoi.1', 'wait_gate() thân rỗng (pass): omni lao vào cửa', { doi: [null, null], hamEm: [H('wait_gate', ['pass'])] }, 'chua-toi-co');
thua('che-doi-sung-hoi.1', 'wait_gate() dùng if: chỉ chờ một nhịp', { doi: [null, null], hamEm: [H('wait_gate', ['if not front_clear():', '    wait()'])] }, 'chua-toi-co');
thua('che-doi-sung-hoi.2', 'omni đi thẳng lên trước: đứng chắn đường bóng', { doi: [null, ['move()', 'slide_l(1)', 'slide_l(2)']] }, 'ban-bi-chan');
thua('che-doi-sung-hoi.2', 'fire_clear() bắn không chờ: bóng trúng omni', { doi: [null, null], hamEm: [H('fire_clear', ['shoot()', 'wait()'])] }, 'ban-bi-chan');
thua('che-doi-sung-hoi.3', 'omni không chờ cửa: tiến thẳng rồi thả hộp', { doi: [null, ['pick()', 'forward(4)', 'drop()']], hamEm: [] }, 'chua-dua-vat');
thua('che-doi-sung-hoi.3', 'pass_gate() quên chờ (chỉ forward(2))', { doi: [null, null], hamEm: [H('pass_gate', ['forward(2)'])] }, 'chua-dua-vat');
thua('che-doi-sung-hoi.4', 'xe súng không chờ omni: húc đồng đội, bắn lệch nút', { doi: [['forward(2)', 'turn_left()', 'shoot()', 'wait()', 'turn_right()', 'move()'], null] });
thua('che-doi-sung-hoi.4', 'omni không chờ cửa', { doi: [null, ['forward(6)']] }, 'chua-toi-co');
thua('che-doi-sung-hoi.5', 'omni chờ cứng một nhịp mỗi cột thay vì catch_crate()', { doi: [null, ['slide_r(1)', 'for i in range(3):', '    wait()', '    slide_r(2)']], hamEm: [] }, 'chua-day-thung');
thua('che-doi-sung-hoi.5', 'catch_crate() viết nhầm thành wait_gate (chờ khi chưa trống)', { doi: [null, null], hamEm: [H('catch_crate', ['while not front_clear():', '    wait()'])] }, 'chua-day-thung');
thua('che-doi-sung-hoi.6', 'open_step() bắn nhầm phía (kick_left)', { doi: [null, null], hamEm: [H('open_step', ['kick_left()', 'forward(2)'])] });
thua('che-doi-sung-hoi.6', 'omni đi thẳng forward(6)', { doi: [null, ['forward(6)']] }, 'chua-toi-co');
thua('che-doi-sung-hoi.7', 'mẫu: open_gate() bắn hai phát, cửa đóng lại trước khi omni tới', { doi: [null, null], hamCuaMan: man('che-doi-sung-hoi.7').maMau.hamCuaMan });
thang('che-doi-sung-hoi.7', 'open_gate() sửa bằng kick_right() (cùng động tác)', { doi: [null, null], hamCuaMan: [H('open_gate', ['kick_right()'])] });
thua('che-doi-sung-hoi.8', 'mẫu: open_back() bắn nòng trước, bóng vào tường', { doi: [null, null], hamCuaMan: man('che-doi-sung-hoi.8').maMau.hamCuaMan });
thua('che-doi-sung-hoi.8', 'sửa hàm nhưng omni không chờ cửa', { doi: [null, ['forward(6)']] }, 'chua-toi-co');
thang('che-doi-sung-hoi.8', 'open_back() = jet_fwd() (cùng động tác)', { doi: [null, null], hamCuaMan: [H('open_back', ['jet_fwd()'])] });
thua('che-doi-sung-hoi.9', 'mẫu: make_way() ra khỏi hốc quá sớm, hai robot chặn nhau', { doi: [null, null], hamCuaMan: man('che-doi-sung-hoi.9').maMau.hamCuaMan });
thua('che-doi-sung-hoi.9', 'make_way() không nép vào hốc (chỉ chờ)', { doi: [null, null], hamCuaMan: [H('make_way', ['while front_clear():', '    wait()'])] });
thua('che-doi-sung-hoi.9', 'xe súng không mở cửa, đi thẳng', { doi: [['forward(6)'], null] });
{
  const r = cham('che-doi-sung-hoi.10', { doi: [['for i in range(8):', '    kick_right()', '    move()'], null] });
  kiem('che-doi-sung-hoi.10: xe súng bắn ở mọi ô (không hỏi cảm biến) → thắng nhưng mất sao nhịp', r.thang && r.sao < 3 && r.soNhip > man('che-doi-sung-hoi.10').sao.nhip, 'sao ' + r.sao + ', nhịp ' + r.soNhip);
}
thua('che-doi-sung-hoi.10', 'xe súng chỉ bắn ở ô 4 (đúng sân 1)', { doi: [['forward(3)', 'kick_right()', 'go_wall()'], null] });
thua('che-doi-sung-hoi.10', 'omni đi thẳng forward(8)', { doi: [null, ['forward(8)']] });
{
  const m = man('che-doi-sung-hoi.10');
  const r = cham('che-doi-sung-hoi.10', { doi: [null, null] });
  kiem('che-doi-sung-hoi.10: ba sân có 1, 2, 3 cửa (mỗi nút một cửa) và đều thắng', J(m.noi.map((n) => n.length)) === J([1, 2, 3]) && r.theoSan.every((s) => s.thang));
}

function nhieu() { let kq = []; for (const a of arguments) kq = kq.concat(a); return kq; }

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
