/* ============================================================================
   kiem-doi-xich.mjs — máy kiểm RIÊNG của gói Đội xích và nhện (man-doi-xich.js: doi-xich + che-doi-xich).
   Luật chung của mọi gói đội (10 màn khác nhau, mẫu không thắng, cần cả đội, ngưỡng sao…) ở kiem-goi-doi.mjs; ở đây kiểm phần đặc thù:
   - đội đúng xích (R1) + nhện (R2), nhện không có cảm biến; mỗi sân có địa hình của part (bậc S, băng, hố, gầm);
   - K3 robot tự động: chương 1 có ≥ 4 màn khóa một robot (cả xích lẫn nhện), chờ thiếu nhịp thì hỏng, chờ dư thì vẫn thắng nhưng mất sao;
   - mọi lời sai khai trong màn (loiSai) không được 3 sao và có đủ mã chẩn đoán;
   - chương 2: ba hàm chế wait_box / lift_up / duck mới (không trùng kho, không trùng chương khác); pause / hop_box học ở che-doi-ho-bang thì chỉ dùng lại; robot khóa gọi hàm đó,
     hàm của màn hỏng (mẫu) thì thua, sửa thì thắng; màn đổi chỗ cần cờ riêng;
   - trùm: ba sân khác nhau, lời giải "chỉ đúng một sân" bị chặn ở sân khác.
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
const CHO = (n) => LAP(n, ['wait()']);
const B = (c1, c2, hamCuaMan) => ({ doi: [{ chinh: c1 }, { chinh: c2 }], hamCuaMan: hamCuaMan || [] });

// kho hàm người chơi có trước mỗi màn (đi tuần tự lộ trình xuất bản, như kiem-goi-doi.mjs)
const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
/** Chấm bài: hamMoi = hàm của em bài làm tạo thêm (mặc định: của lời giải). */
function cham(m, bai, hamMoi) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of (hamMoi || m.loiGiai.hamCuaEmMoi || [])) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: [], hamCuaMan: bai.hamCuaMan || m.loiGiai.hamCuaMan || [], doi: bai.doi }, [...hs.values()]);
}
const ma = (r) => r.chanDoan.map((c) => c.ma);
const tim = (x) => M.danhSach.find((m) => m.ma === x);
// 29/10 khung mùa 3: màn chia lại chương (doi-xich.3, .9 ở mùa 3; còn lại ở doi-xich-bac / che-doi-xich-bac, mùa 4) nên lấy theo MÃ gốc 1–10, thứ tự theo số mã.
const theoMa = (c) => M.danhSach.filter((m) => new RegExp('^' + c + '\\.([1-9]|10)$').test(m.ma)).sort((a, b) => Number(a.ma.split('.')[1]) - Number(b.ma.split('.')[1]));
const c1 = theoMa('doi-xich');
const c2 = theoMa('che-doi-xich');
const ca = c1.concat(c2);

console.log('— đội và sân');
kiem('hai chương đủ 20 màn, 20 tên khác nhau', c1.length === 10 && c2.length === 10 && new Set(ca.map((m) => m.ten)).size === 20);
kiem('mọi màn: R1 là xích, R2 là nhện', ca.every((m) => m.doi.length === 2 && m.doi[0].loaiRobot === 'xich' && m.doi[1].loaiRobot === 'nhen' && m.doi[0].robot.than === 'xich' && m.doi[1].robot.than === 'nhen'),
  ca.filter((m) => !(m.doi[0].loaiRobot === 'xich' && m.doi[1].loaiRobot === 'nhen')).map((m) => m.ma).join(', '));
kiem('nhện không bao giờ có cảm biến khoảng cách', ca.every((m) => !m.doi[1].hamGoc.some((h) => /_clear$/.test(h))));
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
kiem('mọi sân có địa hình của part: bậc S, băng chuyền, hố u hay gầm n', ca.every((m) => sanCua(m).every((s) => /[S<>^vun]/.test(s.join('')))),
  ca.filter((m) => !sanCua(m).every((s) => /[S<>^vun]/.test(s.join('')))).map((m) => m.ma).join(', '));
kiem('xích leo bậc hay đi trên băng ở ít nhất 12 màn; nhện bật hố hay chui gầm ở ít nhất 12 màn',
  ca.filter((m) => /[S<>^v]/.test(J(m.san))).length >= 12 && ca.filter((m) => /[un]/.test(J(m.san))).length >= 12);

console.log('\n— lời sai khai trong màn');
for (const m of ca) {
  (m.loiSai || []).forEach((ls, i) => {
    const r = cham(m, ls.baiLam, ls.hamCuaEmMoi || []);
    const thieu = (ls.phaiCoMa || []).filter((x) => !ma(r).includes(x));
    kiem(m.ma + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): chưa 3 sao, đủ mã ' + (ls.phaiCoMa || []).join('+'), r.sao < 3 && !thieu.length, 'sao ' + r.sao + ' · thiếu ' + thieu.join() + ' · có ' + ma(r).join());
  });
}
kiem('mỗi màn chương 1 và các màn chương 2 không chỉ chế hàm đều có ít nhất một lời sai', ca.filter((m) => !(m.loiSai || []).length).length === 0,
  ca.filter((m) => !(m.loiSai || []).length).map((m) => m.ma).join(', '));

console.log('\n— K3: robot tự động có sẵn');
const khoaC1 = c1.filter((m) => m.doi.some((d) => d.coDinh));
kiem('chương 1 có ít nhất 4 màn khóa một robot, có màn khóa xích và màn khóa nhện', khoaC1.length >= 4 && khoaC1.some((m) => m.doi[0].coDinh) && khoaC1.some((m) => m.doi[1].coDinh),
  khoaC1.map((m) => m.ma + (m.doi[0].coDinh ? '(xích)' : '(nhện)')).join(', '));
kiem('màn khóa: không khóa cả hai robot', ca.every((m) => !(m.doi[0].coDinh && m.doi[1].coDinh)));
// nhện không cảm biến: chờ thiếu thì hỏng, chờ dư vẫn thắng nhưng mất sao nhịp (đọc chương trình xích để đếm)
for (const [x, i, dung, cuoi] of [['doi-xich.4', 1, 4, ['go("R")', 'jump("U")']], ['doi-xich.5', 1, 5, ['pick()', 'jump("R")', 'drop()']]]) {
  const m = tim(x), lg = m.loiGiai.doi.map((d) => d.chinh);
  const truoc = x === 'doi-xich.5' ? ['crawl("R")'] : [];
  const bai = (n) => { const d = lg.map((c) => c.slice()); d[i] = truoc.concat(CHO(n), cuoi); return B(d[0], d[1]); };
  const thieu = cham(m, bai(dung - 2)), du = cham(m, bai(dung + 3));
  kiem(x + ': nhện chờ thiếu hai nhịp thì không thắng, chờ dư ba nhịp thì thắng nhưng mất sao', !thieu.thang && du.thang && du.sao === 2, J([thieu.thang, du.thang, du.sao]));
}
{ // doi-xich.6: xích tự động chờ bằng cảm biến nên nhện đi lúc nào cũng được
  const m = tim('doi-xich.6'), lg = m.loiGiai.doi.map((d) => d.chinh);
  const r = cham(m, B(lg[0], CHO(7).concat(lg[1])));
  kiem('doi-xich.6: xích chờ bằng cảm biến, nhện chậm 7 nhịp vẫn thắng (chỉ mất sao)', r.thang && r.sao < 3, J([r.thang, r.sao]));
}
{ // doi-xich.7: xích phải chờ nhện tới rồi chờ nhện đi khỏi; mẫu (chờ sai điều kiện) làm nhện rơi hố
  const m = tim('doi-xich.7');
  kiem('doi-xich.7: chương trình mẫu của xích làm nhện rơi hố', ma(cham(m, m.maMau)).includes('roi-ho'));
}

console.log('\n— chương 2: hàm phối hợp tự chế');
const TAO = { 'che-doi-xich.1': 'wait_box', 'che-doi-xich.2': 'lift_up', 'che-doi-xich.3': 'duck' };
for (const [x, ten] of Object.entries(TAO)) {
  const m = tim(x);
  kiem(x + ': màn bắt chế ' + ten + '(), tên mới chưa có trong kho', J(m.taoHam) === J([ten]) && !khoTruoc.get(x).some((h) => h.ten === ten) && m.loiGiai.hamCuaEmMoi.some((h) => h.ten === ten));
  kiem(x + ': không chế ' + ten + '() thì chưa thắng (mẫu, kho chưa có hàm)', !cham(m, m.loiGiai, []).thang);
}
const tenKhac = M.danhSach.filter((m) => !ca.includes(m)).flatMap((m) => m.taoHam.concat((m.loiGiai.hamCuaEmMoi || []).map((h) => h.ten), (m.loiGiai.hamCuaMan || []).map((h) => h.ten)));
kiem('wait_box, lift_up, duck không trùng tên hàm của chương nào khác', Object.values(TAO).every((t) => !tenKhac.includes(t)));
kiem('pause và hop_box đã học trước gói (che-doi-ho-bang), chương 2 không bắt chế lại mà dùng như hàm đã có',
  ['pause', 'hop_box'].every((t) => khoTruoc.get('che-doi-xich.1').some((h) => h.ten === t) && !c2.some((m) => m.taoHam.includes(t))) &&
  c2.filter((m) => /pause\(|hop_box\(/.test(J(m.loiGiai.doi))).every((m) => /pause|hop_box/.test(J(m.hamCuaEmCan))));
kiem('chương 2 chỉ màn 1–3 chế hàm mới', c2.filter((m) => m.taoHam.length).map((m) => m.ma.split('.')[1]).join() === '1,2,3');
{ // che-doi-xich.5: nhện tự động gọi pause(8) và hop_box: xích phải kịp giờ
  const m = tim('che-doi-xich.5');
  kiem('che-doi-xich.5: nhện khóa và chương trình nhện gọi pause và hop_box', m.doi[1].coDinh && /pause\(/.test(J(m.maMau.doi[1])) && /hop_box\(/.test(J(m.maMau.doi[1])));
  const tre = cham(m, B(['pick()', 'forward(2)', 'tr_left()', 'wait()', 'wait()', 'move()', 'drop()'], m.loiGiai.doi[1].chinh));
  kiem('che-doi-xich.5: xích trễ hai nhịp so với pause(8) là nhện gắp hụt', !tre.thang && ma(tre).includes('kep-hut'), J(ma(tre)));
}
for (const x of ['che-doi-xich.7', 'che-doi-xich.8']) {
  const m = tim(x), khoa = m.doi.findIndex((d) => d.coDinh);
  const hong1 = cham(m, Object.assign({}, m.loiGiai, { hamCuaMan: m.maMau.hamCuaMan }));
  kiem(x + ': robot khóa gọi hàm của màn; giữ hàm hỏng của mẫu thì thua, sửa thân hàm thì thắng', khoa >= 0 && m.maMau.hamCuaMan.length === 1 &&
    J(m.maMau.hamCuaMan.map((h) => h.ten)) === J(m.loiGiai.hamCuaMan.map((h) => h.ten)) && !hong1.thang && cham(m, m.loiGiai).thang &&
    new RegExp(m.maMau.hamCuaMan[0].ten + '\\(').test(J(m.maMau.doi[khoa].chinh)));
}
{ // che-doi-xich.9: đổi chỗ, cần cờ riêng
  const m = tim('che-doi-xich.9');
  const khongCo = Object.assign({}, m, { doi: m.doi.map((d) => { const o = Object.assign({}, d); delete o.co; return o; }) });
  const r = Cham.cham(khongCo, { chinh: [], hamCuaMan: [], doi: [{ chinh: ['wait()'] }, { chinh: ['wait()'] }] }, [...kho.values()]);
  kiem('che-doi-xich.9: bỏ cờ riêng thì đứng yên cũng "thắng" (đường tắt), có cờ riêng thì phải đổi chỗ', r.thang && !cham(m, B(['wait()'], ['wait()'])).thang && m.doi.every((d) => d.co));
}
{ // che-doi-xich.6: viết thẳng tràn khung, phải lặp
  const m = tim('che-doi-xich.6');
  kiem('che-doi-xich.6: lời giải xích là một vòng for gọi wait_box()', /^for i in range\(3\)/.test(m.loiGiai.doi[0].chinh[0]) && m.loiGiai.doi[0].chinh.includes('    wait_box()'));
}

console.log('\n— trùm ba sân');
for (const x of ['doi-xich.10', 'che-doi-xich.10']) {
  const m = tim(x);
  kiem(x + ': ba sân khác nhau, cùng làn của nhện', m.san.length === 3 && new Set(m.san.map(J)).size === 3 && new Set(m.doi[1].batDau.map(J)).size === 1);
}
{
  const m = tim('che-doi-xich.10'), lg = m.loiGiai.doi.map((d) => d.chinh);
  const r = cham(m, B(lg[0], ['pause(3)'].concat(lg[1].slice(1))));
  kiem('che-doi-xich.10: nhện chờ đủ cho hai sân đầu (pause(3)) thì chỉ hỏng sân thứ ba, nơi xích tới chặn muộn nhất',
    !r.thang && J(r.theoSan.map((s) => s.thang)) === J([true, true, false]), J(r.theoSan.map((s) => s.thang)));
  const bo = cham(m, B([], lg[1]));
  kiem('che-doi-xich.10: không có xích chặn ở cuối băng thì nhện không gắp kịp ở sân nào', bo.theoSan.every((s) => !s.thang));
}
{
  const m = tim('doi-xich.10'), lg = m.loiGiai.doi.map((d) => d.chinh);
  const trai = cham(m, B(['while front_clear():', '    wait()', 'pick()', 'tr_left()', 'go_wall()', 'back()', 'drop()'], lg[1]));
  kiem('doi-xich.10: xích luôn rẽ trái thì chỉ hỏng sân có lối bên kia', J(trai.theoSan.map((s) => s.thang)) === J([true, false, true]), J(trai.theoSan.map((s) => s.thang)));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
