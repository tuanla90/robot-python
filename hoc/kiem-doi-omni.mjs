/* ============================================================================
   kiem-doi-omni.mjs — MÁY KIỂM RIÊNG gói Đội omni và xích (hoc/man-doi-omni.js; luật chung ở kiem-goi-doi.mjs).
   - Đội: R1 luôn là xe xích, R2 luôn là xe omni, cả hai có cảm biến khoảng cách; robot tự động (coDinh) chỉ là xích.
   - Ba hàm chương 2 (give_way, tail, let_pass) là tên mới: không trùng hàm gốc, không trùng kho trước gói; chỉ màn tạo mới có taoHam.
   - Ý của từng màn: các lời sai / lối tắt tiêu biểu (đi ngay không chờ, chờ đếm nhịp sai, không trượt né băng, robot kia nhường,
     hàm hỏng của màn…) phải THUA hoặc MẤT SAO; lời đúng khác cách (chờ bằng cảm biến thay vì đếm) vẫn thắng.
   - Trùm: ba sân khác nhau ở chỗ buộc quyết định (vị trí hốc, giờ xích tới), nên chờ đếm nhịp không qua được cả ba sân với 3 sao.
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const M = require(path.join(day, 'lo-trinh-hoc.js'));
const Cham = require(path.join(day, 'cham.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const clone = (x) => JSON.parse(JSON.stringify(x));

const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
const get = (ma) => M.danhSach.find((m) => m.ma === ma);
/** Chấm bài hai robot: doi = [chương trình xích, chương trình omni]; hamEm = hàm của em thay / thêm (mặc định hàm mới của lời giải); hamCuaMan = hàm của màn (mặc định của lời giải). */
function cham(m, doi, opt = {}) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of (opt.hamEm || m.loiGiai.hamCuaEmMoi || [])) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: [], hamCuaMan: opt.hamCuaMan || m.loiGiai.hamCuaMan || [], doi: doi.map((c) => ({ chinh: c })) }, [...hs.values()]);
}
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const LAP = (n, ds) => ['for i in range(' + n + '):'].concat(ds.map((s) => '    ' + s));
const CHO = (dk) => ['while ' + dk + ':', '    wait()'];
const tom = (r) => (r.thang ? r.sao + ' sao, ô ' + r.soO + ', nhịp ' + r.soNhip : 'thua: ' + (r.chanDoan[0] || {}).ma);

const ds = M.danhSach.filter((m) => m.chuong === 'doi-omni' || m.chuong === 'che-doi-omni');
console.log('— đội, robot khóa, hàm mới');
kiem('gói có 20 màn (doi-omni 10, che-doi-omni 10)', ds.length === 20 && ds.filter((m) => m.chuong === 'doi-omni').length === 10);
kiem('mọi màn: R1 là xích, R2 là omni, cả hai có cảm biến khoảng cách', ds.every((m) => m.doi.length === 2 && m.doi[0].loaiRobot === 'xich' && m.doi[1].loaiRobot === 'omni' &&
  m.doi.every((d) => d.robot.camBien && d.robot.camBien[0].ma === 'khoang-cach' && ['front_clear', 'left_clear', 'right_clear'].every((t) => d.hamGoc.includes(t)))));
kiem('robot tự động (coDinh) chỉ là xích; có ít nhất 3 màn mỗi chương', !ds.some((m) => m.doi[1].coDinh) &&
  ['doi-omni', 'che-doi-omni'].every((c) => ds.filter((m) => m.chuong === c && m.doi[0].coDinh).length >= 3));
kiem('màn tới cờ: hai xe đều có cờ riêng', ds.filter((m) => m.mucTieu === 'toi-co').every((m) => m.doi.every((d) => Array.isArray(d.co) && d.co.length)));
const hamGoc = new Set(M.danhSach.flatMap((m) => (m.hamGoc || []).concat(...(m.doi || []).map((d) => d.hamGoc || []))));
const HAM_MOI = { 'che-doi-omni.1': 'give_way', 'che-doi-omni.2': 'tail', 'che-doi-omni.3': 'let_pass' };
for (const [ma, ten] of Object.entries(HAM_MOI)) {
  const m = get(ma);
  kiem(ma + ': tạo ' + ten + '() (taoHam), tên mới chưa có trong kho, không phải hàm gốc', J(m.taoHam) === J([ten]) && m.loiGiai.hamCuaEmMoi.length === 1 && m.loiGiai.hamCuaEmMoi[0].ten === ten &&
    !khoTruoc.get(M.danhSach.find((x) => x.chuong === 'doi-omni').ma).some((h) => h.ten === ten) && !hamGoc.has(ten));
}
kiem('chỉ ba màn tạo hàm có taoHam; màn sau dùng lại hàm (hamCuaEmCan)', ds.filter((m) => m.taoHam.length).map((m) => m.ma).join() === Object.keys(HAM_MOI).join() &&
  ['give_way', 'tail', 'let_pass'].every((t) => ds.some((m) => m.chuong === 'che-doi-omni' && m.so > 3 && m.hamCuaEmCan.includes(t))));
kiem('một màn có robot tự động gọi hàm em chế (let_pass / tail)', ds.some((m) => m.doi[0].coDinh && m.so > 3 && /let_pass|tail/.test(m.maMau.doi[0].chinh.join())));

/* ------------------------------------------------------------------ ý từng màn: lời sai thua hoặc mất sao */
// ky: 'thua' = không thắng; 'mat-sao' = thắng nhưng dưới 3 sao; 'thang' = lời đúng khác cách, vẫn 3 sao
const CA = [
  ['doi-omni.1', 'omni quay xe như xe hai bánh thay vì trượt: mất sao nhịp', 'mat-sao', [['forward(6)'], ['turn_right()', 'forward(4)', 'turn_right()', 'move()']]],
  ['doi-omni.2', 'omni đi ngay không chờ: hai xe cùng lao vào ngã tư, đứng im', 'thua', [['forward(6)'], ['forward(6)']]],
  ['doi-omni.2', 'omni chờ hai nhịp: vẫn qua nhưng chậm', 'mat-sao', [['forward(6)'], ['wait()', 'wait()', 'forward(6)']]],
  ['doi-omni.3', 'omni chạy thẳng tới cuối lối: đứng trên cờ xích', 'thua', [['forward(8)'], ['forward(7)']]],
  ['doi-omni.3', 'omni trượt vào hốc ngay ở ô đầu (tường)', 'thua', [['forward(8)'], ['slide_l(1)']]],
  ['doi-omni.4', 'không ai nhường: hai xe đối đầu', 'thua', [['forward(7)'], ['forward(7)']]],
  ['doi-omni.4', 'omni vào hốc rồi ra ngay, không chờ xích qua', 'thua', [['forward(7)'], ['forward(2)', 'slide_r(1)', 'slide_l(1)', 'forward(5)']]],
  ['doi-omni.4', 'omni vào hốc quá trễ: xích đã tới ô trước hốc', 'thua', [['forward(7)'], ['forward(3)', 'slide_r(1)', 'wait()', 'slide_l(1)', 'forward(6)']]],
  ['doi-omni.5', 'omni không lùi khỏi ô giao: xích không đặt được hộp', 'thua', [['forward(2)', 'pick()', 'back()', 'back()', 'tr_right()', 'drop()'], CHO('front_clear()').concat(['pick()', 'slide_r(3)', 'drop()'])]],
  ['doi-omni.5', 'omni chờ cứng 6 nhịp rồi gắp: hộp chưa tới', 'thua', [['forward(2)', 'pick()', 'back()', 'back()', 'tr_right()', 'drop()'], ['back()'].concat(LAP(6, ['wait()']), ['pick()', 'slide_r(3)', 'drop()'])]],
  ['doi-omni.5', 'xích dùng turn_right() của xe hai bánh: quay dở, đặt hộp sai chỗ', 'thua', [['forward(2)', 'pick()', 'back()', 'back()', 'turn_right()', 'drop()'], ['back()'].concat(CHO('front_clear()'), ['pick()', 'slide_r(3)', 'drop()'])]],
  ['doi-omni.6', 'omni lên đường ray ngay: húc đầu xích', 'thua', [null, ['move()', 'slide_l(4)', 'forward(2)']]],
  ['doi-omni.6', 'omni đếm thiếu một nhịp', 'thua', [null, LAP(2, ['wait()']).concat(['move()', 'slide_l(4)', 'forward(2)'])]],
  ['doi-omni.6', 'omni chờ bằng while not front_clear() (sai điều kiện): lên ngay', 'thua', [null, CHO('not front_clear()').concat(['move()', 'slide_l(4)', 'forward(2)'])]],
  ['doi-omni.6', 'omni đếm đúng 3 nhịp: thắng như dùng cảm biến', 'thang', [null, LAP(3, ['wait()']).concat(['move()', 'slide_l(4)', 'forward(2)'])]],
  ['doi-omni.7', 'mẫu: hỏi right_clear() bên tường, omni ra ngay', 'thua', 'mau'],
  ['doi-omni.7', 'đổi sang while not left_clear(): vẫn ra ngay', 'thua', [null, CHO('not left_clear()').concat(['slide_l(1)'], LAP(4, ['back()']))]],
  ['doi-omni.7', 'chờ cứng 2 nhịp: ra trước khi xích tới', 'thua', [null, LAP(2, ['wait()']).concat(['slide_l(1)'], LAP(4, ['back()']))]],
  ['doi-omni.8', 'mẫu: omni chen vào ngõ trước', 'thua', 'mau'],
  ['doi-omni.8', 'omni chờ ở chỗ cũ rồi vào ngay khi xích vừa tới chân ngõ', 'thua', [null, ['move()', 'wait()', 'move()', 'slide_r(3)']]],
  ['doi-omni.8', 'chờ bằng cảm biến (xích tới rồi đi) thay vì đếm: vẫn thắng, chậm một nhịp', 'mat-sao', [null, ['move()'].concat(CHO('front_clear()'), CHO('not front_clear()'), ['move()', 'slide_r(3)'])]],
  ['doi-omni.9', 'omni không trượt né: băng đẩy omni sang làn xích', 'thua', [['forward(6)'], ['forward(6)']]],
  ['doi-omni.9', 'omni chờ một nhịp rồi đi thẳng: vẫn bị đẩy', 'thua', [['forward(6)'], ['wait()', 'forward(6)']]],
  ['doi-omni.9', 'chỉ trượt né ở hàng băng đầu', 'thua', [['forward(6)'], ['slide_r(1)', 'forward(7)']]],
  ['doi-omni.9', 'viết thẳng ba khúc không lặp: mất sao ô', 'mat-sao', [['forward(6)'], ['slide_r(1)', 'forward(2)', 'slide_r(1)', 'forward(2)', 'slide_r(1)', 'forward(2)']]],
  ['doi-omni.10', 'omni đi đúng số ô tới hốc của sân 1 (không dò hốc)', 'thua', [null, ['forward(1)', 'slide_l(1)'].concat(LAP(4, ['wait()']), ['slide_r(1)', 'go_wall()'])]],
  ['doi-omni.10', 'omni trong hốc chờ cứng 1 nhịp', 'thua', [null, ['to_left_gap()', 'slide_l(1)', 'wait()', 'slide_r(1)', 'go_wall()']]],
  ['doi-omni.10', 'omni trong hốc chờ cứng 4 nhịp (đủ cho sân chờ lâu nhất): chậm, mất sao', 'mat-sao', [null, ['to_left_gap()', 'slide_l(1)'].concat(LAP(4, ['wait()']), ['slide_r(1)', 'go_wall()'])]],
  ['doi-omni.10', 'omni hỏi nhầm bên trái trong hốc', 'thua', [null, ['to_left_gap()', 'slide_l(1)'].concat(CHO('left_clear()'), ['slide_r(1)', 'go_wall()'])]],

  ['che-doi-omni.1', 'give_way() chờ cứng một nhịp thay vì cảm biến', 'thua', [null, ['forward(2)', 'give_way()', 'forward(4)']], { hamEm: [H('give_way', ['slide_l(1)', 'wait()', 'slide_r(1)'])] }],
  ['che-doi-omni.1', 'give_way() chờ cứng ba nhịp: chậm, mất sao', 'mat-sao', [null, ['forward(2)', 'give_way()', 'forward(4)']], { hamEm: [H('give_way', ['slide_l(1)'].concat(LAP(3, ['wait()']), ['slide_r(1)']))] }],
  ['che-doi-omni.1', 'give_way() quên vòng chờ', 'thua', [null, ['forward(2)', 'give_way()', 'forward(4)']], { hamEm: [H('give_way', ['slide_l(1)', 'slide_r(1)'])] }],
  ['che-doi-omni.1', 'viết thẳng trong chương trình, không gọi give_way()', 'thua', [null, ['forward(2)', 'slide_l(1)'].concat(CHO('right_clear()'), ['slide_r(1)', 'forward(4)'])]],
  ['che-doi-omni.1', 'omni không nhường, đi thẳng tới cờ: chắn xích', 'thua', [null, ['forward(6)']]],
  ['che-doi-omni.2', 'tail(n) không chờ: húc đuôi xích ở góc', 'thua', [null, null], { hamEm: [H('tail', LAP('n', ['move()']), ['n'])] }],
  ['che-doi-omni.2', 'tail(n) dùng if thay while: bỏ bước khi xích chắn', 'thua', [null, null], { hamEm: [H('tail', LAP('n', ['if front_clear():', '    move()']), ['n'])] }],
  ['che-doi-omni.3', 'let_pass() chỉ chờ omni tới, không chờ omni đi: xích lên băng chặn omni', 'thua', [null, null], { hamEm: [H('let_pass', CHO('front_clear()'))] }],
  ['che-doi-omni.3', 'xích không chờ, lên băng ngay', 'thua', [['move()', 'tr_left()', 'forward(2)', 'tr_left()', 'move()'], null]],
  ['che-doi-omni.4', 'omni bỏ let_pass ở ngã tư trên', 'thua', [null, ['forward(6)', 'slide_r(5)']]],
  ['che-doi-omni.4', 'xích bỏ let_pass ở ngã tư dưới', 'thua', [['forward(4)', 'tr_left()', 'forward(6)'], null]],
  ['che-doi-omni.4', 'omni quay xuống ở góc thay vì trượt: mất một nhịp quay', 'mat-sao', [null, ['let_pass()', 'forward(6)', 'turn_right()', 'forward(5)']]],
  ['che-doi-omni.5', 'omni đi không chờ trên bậc thang', 'thua', [null, LAP(3, ['move()', 'turn_left()', 'move()', 'turn_right()'])]],
  ['che-doi-omni.5', 'omni dùng zig kiểu trượt không chờ', 'thua', [null, LAP(3, ['move()', 'slide_l(1)'])]],
  ['che-doi-omni.6', 'omni đi thẳng lên cột băng: bị đẩy xuống hốc dưới', 'thua', [null, ['forward(6)', 'slide_l(1)']]],
  ['che-doi-omni.6', 'omni đứng chờ ngoài, không đi qua trước mặt xích', 'thua', [null, ['move()', 'slide_l(1)', 'forward(2)']]],
  ['che-doi-omni.6', 'omni đi quá hốc cờ, đỗ chắn đường xích', 'thua', [null, ['move()', 'slide_l(1)', 'forward(7)']]],
  ['che-doi-omni.7', 'mẫu: follow(n) dùng if, xích không đi', 'thua', [null, null], { hamCuaMan: [H('follow', LAP('n', ['if front_clear():', '    move()']), ['n'])] }],
  ['che-doi-omni.7', 'sửa follow(n) bằng while không có wait(): kẹt vòng', 'thua', [null, null], { hamCuaMan: [H('follow', LAP('n', ['while front_clear():', '    move()']), ['n'])] }],
  ['che-doi-omni.7', 'follow(n) viết lại đủ vòng chờ (không gọi tail): vẫn thắng', 'thang', [null, null], { hamCuaMan: [H('follow', LAP('n', ['while not front_clear():', '    wait()', 'move()']), ['n'])] }],
  ['che-doi-omni.7', 'omni đỗ trong lối, không vào hốc', 'thua', [null, ['forward(4)']]],
  ['che-doi-omni.8', 'không có cờ riêng thì đứng yên cũng "tới cờ": ở đây hai xe phải đổi chỗ', 'thua', [['wait()'], ['wait()']]],
  ['che-doi-omni.8', 'omni không nhường', 'thua', [null, ['move()', 'turn_left()', 'forward(4)', 'turn_right()', 'move()']]],
  ['che-doi-omni.8', 'xích dùng turn_left() của xe hai bánh', 'thua', [['move()', 'turn_left()', 'forward(4)', 'tr_right()', 'move()'], null]],
  ['che-doi-omni.9', 'mẫu: next_pass() chỉ chờ xích tới, lần hai trả về ngay', 'thua', 'mau'],
  ['che-doi-omni.9', 'gọi next_pass() một lần: ra lúc xích đang đi tới tường', 'thua', [null, ['next_pass()', 'slide_r(1)', 'forward(4)']]],
  ['che-doi-omni.9', 'thêm vòng chờ xích đi khỏi SAU vòng cũ: đúng nhưng ra trễ một nhịp', 'mat-sao', [null, null], { hamCuaMan: [H('next_pass', CHO('right_clear()').concat(CHO('not right_clear()')))] }],
  ['che-doi-omni.9', 'bỏ hàm, chờ cứng đúng 11 nhịp (một sân thì đếm đúng vẫn qua; trùm mới chặn đếm nhịp)', 'thang', [null, LAP(11, ['wait()']).concat(['slide_r(1)', 'forward(4)'])]],
  ['che-doi-omni.9', 'chờ cứng 10 nhịp: ra sớm một nhịp, đâm đầu xích', 'thua', [null, LAP(10, ['wait()']).concat(['slide_r(1)', 'forward(4)'])]],
  ['che-doi-omni.10', 'xích đi thẳng forward(11) không bám', 'thua', [['forward(11)'], null]],
  ['che-doi-omni.10', 'omni dùng go_wall() sau khi nhường: dừng ngay sau đuôi xích', 'thua', [null, ['to_left_gap()', 'give_way()', 'go_wall()']]],
  ['che-doi-omni.10', 'omni đi đúng số ô tới hốc sân 1', 'thua', [null, ['forward(3)', 'give_way()', 'tail(9)']]],
  ['che-doi-omni.10', 'omni chờ cứng 1 nhịp trong hốc', 'thua', [null, ['to_left_gap()', 'slide_l(1)', 'wait()', 'slide_r(1)', 'tail(9)']]],
  ['che-doi-omni.10', 'omni chờ cứng 3 nhịp (đủ cho sân chờ lâu nhất): chậm, mất sao', 'mat-sao', [null, ['to_left_gap()', 'slide_l(1)'].concat(LAP(3, ['wait()']), ['slide_r(1)', 'tail(9)'])]]
];
console.log('\n— ý từng màn: lời sai, lối tắt');
for (const [ma, moTa, ky, bai, opt] of CA) {
  const m = get(ma);
  let r;
  if (bai === 'mau') r = cham(m, m.maMau.doi.map((d) => d.chinh), { hamCuaMan: m.maMau.hamCuaMan.length ? m.maMau.hamCuaMan : undefined });
  else r = cham(m, bai.map((c, i) => c || m.loiGiai.doi[i].chinh), opt || {});
  const ok = ky === 'thua' ? !r.thang : ky === 'mat-sao' ? r.thang && r.sao < 3 : r.thang && r.sao === 3;
  kiem(ma + ' ' + moTa + ' → ' + (ky === 'thang' ? 'vẫn 3 sao' : ky === 'thua' ? 'thua' : 'mất sao'), ok, tom(r));
}

/* ------------------------------------------------------------------ trùm: ba sân buộc quyết định */
console.log('\n— trùm ba sân');
for (const ma of ['doi-omni.10', 'che-doi-omni.10']) {
  const m = get(ma);
  const hoc = m.san.map((s) => s[1].indexOf('.'));
  const bd = m.doi.map((d) => d.batDau.map((b) => b.x));
  kiem(ma + ': ba sân có hốc ở ba chỗ khác nhau', new Set(hoc).size === 3, J(hoc));
  // số nhịp omni phải chờ trong hốc (đo từ lời giải chuẩn: nhịp omni đứng yên trong hốc ở từng sân)
  const r = cham(m, m.loiGiai.doi.map((d) => d.chinh));
  const cho = r.theoSan.map((s, si) => s.doi[1].vet.filter((v) => v.loai === 'nhip' && v.robot.y === 1).length - 1);
  kiem(ma + ': thời gian omni chờ trong hốc khác nhau giữa các sân (đếm nhịp không dùng chung được)', new Set(cho).size >= 2, J(cho) + ' xuất phát ' + J(bd));
}

/* ------------------------------------------------------------------ luật lõi gói dựa vào */
console.log('\n— luật lõi gói dựa vào');
{
  const cfg = { san: ['#####', '#.>.#', '#...#', '#####'], mucTieu: 'toi-co', doi: [
    { batDau: { x: 2, y: 1, huong: 1 }, loaiRobot: 'xich' }, { batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'omni' }] };
  const r = SanHoc.chay(cfg, ['wait()\nwait()', 'wait()']);
  kiem('xích đứng trên băng không bị đẩy', r.doi[0].robot.x === 2);
  const r2 = SanHoc.chay(Object.assign({}, cfg, { doi: [{ batDau: { x: 1, y: 2, huong: 1 }, loaiRobot: 'xich' }, { batDau: { x: 2, y: 1, huong: 0 }, loaiRobot: 'omni' }] }), ['wait()', 'wait()']);
  kiem('omni đứng trên băng một nhịp là bị đẩy một ô', r2.doi[1].robot.x === 3);
  const r3 = SanHoc.chay({ san: ['######', '#....#', '######'], mucTieu: 'toi-co', doi: [
    { batDau: { x: 2, y: 1, huong: 1 }, loaiRobot: 'xich' }, { batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'omni' }] }, ['left_move()\nright_move()\nwait()', 'left_move()\nright_move()\nwait()']);
  kiem('R2 vào được ô R1 vừa rời trong cùng nhịp (omni bám sát xích)', r3.doi[0].robot.x === 3 && r3.doi[1].robot.x === 2);
  const r4 = SanHoc.chay({ san: ['######', '#....#', '######'], mucTieu: 'toi-co', doi: [
    { batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'xich' }, { batDau: { x: 2, y: 1, huong: 1 }, loaiRobot: 'omni' }] }, ['left_move()\nright_move()\nwait()', 'left_move()\nright_move()\nwait()']);
  kiem('R1 không vào được ô R2 đang rời trong cùng nhịp (xích phải giữ một ô cách)', r4.doi[0].robot.x === 1 && r4.doi[1].robot.x === 3);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
