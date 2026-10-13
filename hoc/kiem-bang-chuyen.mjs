/* ============================================================================
   kiem-bang-chuyen.mjs — máy kiểm chương `bang-chuyen` (Băng chuyền) của "Đường học".
   Gồm: luật băng chuyền ở những chỗ chương này dựa vào (xe quay / đứng chờ / cầm vật trên băng,
   tay hạ không cản băng, vật dưới đất không bị đẩy), dữ liệu 10 màn, hamCuaEmCan đủ và không thừa,
   từng màn "sai một nhịp thì trượt" (màn 2 sai số lần lặp, màn 9 thiếu một nhịp chờ…), canFor (trải
   for ra thì tràn khung / mất sao), đường tắt (BFS có tính băng; chuỗi BFS chạy lại trong SanHoc) và
   bảng 10 màn. Các kiểm chung cho cả 50 màn (đi tuần tự, sao, lời sai…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-bang-chuyen.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipDuaVatNganNhat, chuoiThanhMa } from './do-duong-tay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
require(path.join(day, 'man-chuoi-2.js'));
require(path.join(day, 'man-tay-gap.js'));
require(path.join(day, 'man-vong-lap.js'));
const ManHoc = require(path.join(day, 'man-bang-chuyen.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const vt = (r) => r.x + ',' + r.y;
const L = (...d) => d.join('\n') + '\n';
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const FOR = (n, than, b = 'i') => ['for ' + b + ' in range(' + n + '):'].concat(than.map((s) => '    ' + s));
const lap = (s, n) => Array(n).fill(s);

const HG = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
const chay = (rows, bd, code, extra) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: HG }, extra || {}), code);
const MOVE = L('left_move()', 'right_move()', 'wait()');
const BANG_PHAI = ['#######', '>>>>>>F', '#######'];

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'bang-chuyen');
const tronKho = (kho, moi) => {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
};

/* kho đầy đủ như học sinh đã chơi hết 4 chương đầu (mỗi màn tạo / sửa hàm theo loiGiai; màn tietKiemNhip sửa riêng) */
const tenCotTruyen = [...new Set(ManHoc.danhSach.flatMap((m) => m.taoHam))];
const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
for (const m of ManHoc.danhSach) {
  if (m.chuong === 'bang-chuyen') break;
  if (m.tietKiemNhip === true) continue;
  for (const h of m.loiGiai.hamCuaEmMoi) {
    if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam });
    kho.sua(h.ten, h.than);
  }
}
const KHO = kho.ds();

/* ============================================================ 1. LUẬT BĂNG */
console.log('\n== 1. Băng chuyền và xe có tay gắp: những chỗ chương này dựa vào ==');
{
  // quay hoặc chờ tại chỗ trên băng đều được đếm
  const a = chay(BANG_PHAI, { x: 0, y: 1, huong: 1 }, L('wait()', 'wait()'));
  kiem('đứng chờ trên băng 2 nhịp: đẩy 1 ô', vt(a.robot) === '1,1' && a.nhip === 2, vt(a.robot));
  const b = chay(BANG_PHAI, { x: 0, y: 1, huong: 1 }, L('left_move()', 'wait()', 'left_move()', 'wait()'));
  kiem('quay phải hai lần tại chỗ trên băng: bị đẩy 1 ô theo mũi tên (băng không quan tâm xe quay hướng nào)', vt(b.robot) === '1,1' && b.robot.huong === 3, J(b.robot));
  // cùng chiều / ngược chiều
  const th = chay(BANG_PHAI, { x: 0, y: 1, huong: 1 }, MOVE + MOVE + MOVE + MOVE);
  kiem('cùng chiều băng: 6 ô / 4 nhịp (5.1)', th.thang && th.nhip === 4, String(th.nhip));
  const ng = chay(['#######', 'F>>>>>.', '#######'], { x: 6, y: 1, huong: 3 }, L(...lap(MOVE.trim(), 10)));
  kiem('ngược chiều băng: 6 ô / 10 nhịp (5.2)', ng.thang && ng.nhip === 10, String(ng.nhip));
  // dải băng rộng: vào hàng thứ hai thì bị đẩy sang bên (5.4)
  const dai = ['#.....#', '#>>>>>#', '#>>>>>#', '#>>>>>#', '#>>>>>#', '#.....#'];
  const d1 = chay(dai, { x: 3, y: 5, huong: 0 }, L(...lap(MOVE.trim(), 5)));
  kiem('đi thẳng qua dải 4 hàng băng ngang: lệch phải 2 ô (3 → 5)', vt(d1.robot) === '5,0', vt(d1.robot));
  // tay gắp: xe cầm vật đi theo băng; tay hạ không cản băng; vật dưới đất không bị đẩy
  const MANG = ['o>>>.', '.....'];
  const c = chay(MANG, { x: 0, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()') + L('arm_up()', 'left_move()', 'right_move()', 'wait()') + 'wait()\nwait()\n', { mucTieu: 'dua-vat' });
  const nc = nhipVet(c);
  kiem('xe cầm vật đi theo băng: vật cùng ô với xe sau mỗi lần băng đẩy', nc.every((n) => n.vat.every((v) => v.trangThai !== 'cam' || (v.x === n.robot.x && v.y === n.robot.y))) && nc[nc.length - 1].robot.x >= 2, J(nc.map((n) => n.robot.x)));
  const d = chay(['>>>>>'], { x: 0, y: 0, huong: 1 }, L('arm_down()', 'wait()', 'wait()'));
  kiem('tay hạ sát đất không cản băng: xe vẫn bị đẩy 1 ô sau 2 nhịp', vt(d.robot) === '1,0' && d.tay.tuThe === 'duoi', vt(d.robot));
  const e = chay(['.>>>.'], { x: 0, y: 0, huong: 1 }, L('left_move()', 'right_move()', 'wait()', 'wait()', 'wait()'), { vat: [{ x: 2, y: 0 }], dich: [{ x: 4, y: 0 }], mucTieu: 'dua-vat' });
  kiem('vật nằm dưới đất trên ô băng KHÔNG bị băng đẩy', e.vat[0].x === 2 && e.vat[0].trangThai === 'dat', J(e.vat));
  const f = chay(['>>#'], { x: 0, y: 0, huong: 1 }, L('wait()', 'wait()', 'wait()', 'wait()'));
  kiem('băng đẩy vào tường: đứng yên, nhịp vẫn tính', vt(f.robot) === '1,0' && f.nhip === 4, vt(f.robot));
  // bẫy 5.6: quay trên ô băng
  const cum = ['.>.####', '##.>.##', '####.>.', '######F'];
  const bac = chay(cum, { x: 0, y: 0, huong: 1 }, L('left_move()', 'right_move()', 'wait()') + L('left_move()', 'wait()'));
  kiem('bậc thang băng (5.6): move() lên ô băng rồi turn_right() ngay trên băng → bị đẩy sang ô kế, xe đã quay xuống', vt(bac.robot) === '2,0' && bac.robot.huong === 2 && bac.nhip === 2, J(bac.robot));
}

/* ====================================================== 2. DỮ LIỆU 10 MÀN */
console.log('\n== 2. Chương bang-chuyen: dữ liệu 10 màn ==');
{
  kiem('đúng 10 màn, số 1..10, id 5.1…5.10 (chương thứ 5), mã bang-chuyen.1…', ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '5.' + (i + 1) && m.ma === 'bang-chuyen.' + (i + 1)));
  kiem('chương đứng thứ 5 trong thứ tự chương (sau vong-lap, trước tham-so), tên "Băng chuyền"', ThuTu.thuTu[4] === 'bang-chuyen' && ThuTu.ten['bang-chuyen'] === 'Băng chuyền');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn 10 có huy hiệu bang-chuyen',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'bang-chuyen' && ds[9].huyHieu.ten === 'Huy hiệu Băng chuyền');
  kiem('màn nào cũng: xe hai bánh có tay gắp, Xưởng mở, chương trình 10 ô + mỗi hàm 10 ô, cauTruc ["for"], được dùng hàm của em',
    ds.every((m) => m.loaiRobot === 'banh' && J(m.hamGoc) === J(HG) && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10 && J(m.cauTruc) === '["for"]' && J(m.khung.cauTruc) === '["for"]'));
  kiem('mục tiêu: 5.5, 5.9, 5.10 là dua-vat; bảy màn còn lại tới cờ', J(ds.map((m) => m.mucTieu === 'dua-vat')) === J([false, false, false, false, true, false, false, false, true, true]));
  kiem('sân tối đa 7×7, mỗi sân có ít nhất một ô băng chuyền', ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7 && /[><^v]/.test(m.san.join(''))));
  kiem('sân dua-vat có vật và ô đích; sân tới cờ có đúng một cờ F', ds.every((m) => {
    const s = SanHoc.docSan(m.san);
    return m.mucTieu === 'dua-vat' ? s.vat.length >= 1 && s.dich.length >= s.vat.length && !s.co : !!s.co && s.vat.length === 0 && s.dich.length === 0;
  }));
  kiem('không màn nào tạo hàm mới (taoHam rỗng, hamCuaEmMoi rỗng): dùng nguyên kho từ chương trước',
    ds.every((m) => m.taoHam.length === 0 && m.loiGiai.hamCuaEmMoi.length === 0));
  kiem('hamCuaEmCan ⊆ kho đầy đủ lúc tới chương này (move, turn_right, turn_left, pick, drop, carry, bend_left, bend_right)',
    ds.every((m) => m.hamCuaEmCan.every((t) => KHO.some((h) => h.ten === t))) && KHO.length === 14, KHO.map((h) => h.ten).join());
  kiem('nhipTheoLoiGiai chỉ ở 5.5, 5.9, 5.10 (ba màn dua-vat); màn tới cờ chấm theo BFS đúng', J(ds.map((m) => !!m.nhipTheoLoiGiai)) === J([false, false, false, false, true, false, false, false, true, true]));
  kiem('mọi màn khai canFor ("tran-khung" hoặc "mat-sao") và lời giải có dùng for', ds.every((m) => ['tran-khung', 'mat-sao'].includes(m.canFor) && m.loiGiai.chinh.some((s) => /^\s*for\b/.test(s))));
  kiem('màn có maMau khác rỗng thì có veMaMau: 5.1, 5.7, 5.9; các màn khác maMau rỗng và không có veMaMau',
    J(ds.map((m) => m.maMau.chinh.length > 0)) === J([true, false, false, false, false, false, true, false, true, false]) && ds.every((m) => (m.maMau.chinh.length > 0) === (typeof m.veMaMau === 'string')));
  kiem('deBai luôn đúng mục tiêu: không nói về "chương trình có sẵn" (đó là việc của veMaMau)', ds.every((m) => !/có sẵn/.test(m.deBai)));
  kiem('lời giải mỗi màn vừa khung 10 ô và chẩn đoán sạch (kho đầy đủ)', ds.every((m) => { const r = ChamHoc.cham(m, m.loiGiai, KHO); return r.thang && r.sao === 3 && r.chanDoan.length === 0; }));
}

/* ===================== 3. HAMCUAEMCAN ĐỦ VÀ KHÔNG THỪA: kho chỉ có đúng những hàm đã khai */
console.log('\n== 3. hamCuaEmCan đủ (chỉ kho đã khai vẫn 3 sao) và không thừa (mỗi hàm đã khai được gọi tới) ==');
for (const m of ds) {
  const toiThieu = KHO.filter((h) => m.hamCuaEmCan.includes(h.ten));
  const r = ChamHoc.cham(m, m.loiGiai, toiThieu);
  kiem(m.id + ': kho chỉ gồm ' + (m.hamCuaEmCan.join(', ')) + ' → lời giải vẫn 3 sao', r.thang && r.sao === 3 && r.soO === m.sao.o, J([r.thang, r.sao, r.soO, maCua(r)]));
  const dung = ChamHoc.cham(m, m.loiGiai, KHO).hamDaDung;
  kiem(m.id + ': mỗi hàm đã khai trong hamCuaEmCan đều được lời giải gọi tới (trực tiếp hoặc gián tiếp)', m.hamCuaEmCan.every((t) => dung.includes(t)) && dung.every((t) => m.hamCuaEmCan.includes(t)), 'dùng ' + dung.join() + ' · khai ' + m.hamCuaEmCan.join());
}

/* ============================ 4. TỪNG MÀN: SAI MỘT NHỊP THÌ TRƯỢT, MỘT SỐ ĐẾM ĐÚNG */
console.log('\n== 4. Từng màn: số đếm đúng thì thắng, sai một thì trượt hoặc chậm ==');
{
  const chamMan = (id, chinh) => { const m = ManHoc.tim(id); return ChamHoc.cham(m, { chinh }, KHO); };
  const rs = (id, f, ns) => ns.map((n) => { const r = f(n); return n + ':' + (r.thang ? 'T' + r.soNhip + '/' + r.sao : 'x'); }).join(' ');

  // 5.1
  const m1 = ManHoc.tim('5.1');
  const r1 = ChamHoc.cham(m1, m1.maMau, KHO);
  kiem('5.1: maMau cho xe đứng yên 3 nhịp trên băng: xe chỉ nhích 1 ô (còn ở (1,1)), chưa tới cờ', !r1.thang && vt(r1.theoSan[0].robot) === '1,1' && maCua(r1).join() === 'chua-toi-co', vt(r1.theoSan[0].robot));
  const cho = (n) => chamMan('5.1', FOR(n, ['wait()']));
  kiem('5.1: chỉ đứng chờ thì phải chờ đúng 12 nhịp (11 chưa tới), và được đúng 2 sao (ít ô hơn lời giải nhưng chậm)', !cho(11).thang && cho(12).thang && cho(12).soNhip === 12 && cho(12).sao === 2, rs('5.1', cho, [10, 11, 12]));
  const di = (n) => chamMan('5.1', FOR(n, ['move()']));
  kiem('5.1: move() mỗi nhịp: 3 lần chưa tới, 4 lần tới cờ ở nhịp 4 (3 sao), 5 lần vẫn dừng ở nhịp 4', !di(3).thang && di(4).sao === 3 && di(4).soNhip === 4 && di(5).soNhip === 4, rs('5.1', di, [3, 4, 5]));

  // 5.2
  const f2 = (n) => chamMan('5.2', FOR(n, ['move()']));
  kiem('5.2: lặp move() n lần: n < 10 chưa tới cờ, n = 10 thắng ở nhịp 10 (3 sao), n lớn hơn vẫn dừng ở nhịp 10 (thắng ngay khi chạm cờ)',
    [1, 5, 6, 9].every((n) => !f2(n).thang) && f2(10).sao === 3 && f2(10).soNhip === 10 && f2(14).sao === 3 && f2(14).soNhip === 10, rs('5.2', f2, [6, 9, 10, 11, 14]));
  kiem('5.2: tốc độ ngược băng: lặp 10 lần mà xe đứng ở ô cờ; lặp 9 lần xe còn ở ô (1,1) sát cờ', vt(f2(9).theoSan[0].robot) === '1,1', vt(f2(9).theoSan[0].robot));

  // 5.3
  const phai = ['turn_right()'].concat(FOR(2, ['move()']), ['turn_left()'], FOR(4, ['move()']), ['turn_left()'], FOR(2, ['move()']));
  const trai = (n) => ['turn_left()'].concat(FOR(2, ['move()']), ['turn_right()'], FOR(n, ['move()']), ['turn_right()'], FOR(2, ['move()']));
  const rP = chamMan('5.3', phai), rT = chamMan('5.3', trai(10));
  kiem('5.3: cột phải (băng chạy lên) 11 nhịp = 3 sao; cột trái (băng chạy xuống) cần 17 nhịp, hơn 6 nhịp, chỉ 2 sao; cột trái lặp thiếu thì trượt',
    rP.sao === 3 && rP.soNhip === 11 && rT.thang && rT.soNhip === 17 && rT.sao === 2 && !chamMan('5.3', trai(9)).thang, J([rP.soNhip, rT.soNhip, rT.sao]));

  // 5.4
  const bu = (n) => chamMan('5.4', FOR(6, ['move()']).concat(['turn_left()'], FOR(n, ['move()'])));
  kiem('5.4: đi thẳng 6 ô thì xe tới (5,0) (lệch phải 2); bù 2 ô sang trái thì tới cờ (3 sao, 9 nhịp); bù 1 ô thì trượt; bù 3 ô vẫn dừng ở cờ (thắng ngay khi chạm cờ)',
    vt(chamMan('5.4', FOR(6, ['move()'])).theoSan[0].robot) === '5,0' && bu(2).sao === 3 && bu(2).soNhip === 9 && !bu(1).thang && bu(3).soNhip === 9, rs('5.4', bu, [1, 2, 3]));
  const truoc = chamMan('5.4', ['turn_left()'].concat(FOR(2, ['move()']), ['turn_right()'], FOR(6, ['move()'])));
  kiem('5.4: cách bù TRƯỚC (lệch trái 2 ô rồi đi thẳng) cũng tới cờ nhưng chậm hơn 1 nhịp (10), chỉ 2 sao', truoc.thang && truoc.soNhip === 10 && truoc.sao < 3, J([truoc.thang, truoc.soNhip, truoc.sao]));

  // 5.5
  const f5 = (n) => chamMan('5.5', ['pick()'].concat(FOR(n, ['move()']), ['turn_right()'], FOR(2, ['move()']), ['drop()']));
  kiem('5.5: lặp n lần move() rồi rẽ: n = 5 là lời giải (11 nhịp, 3 sao); n = 4 rẽ ngay trên băng nên xe bị đẩy tới ô rẽ, nhanh hơn 1 nhịp (10); n = 3 trượt; n = 6 thừa 1 nhịp',
    f5(5).sao === 3 && f5(5).soNhip === 11 && f5(4).thang && f5(4).soNhip === 10 && f5(4).sao === 3 && !f5(3).thang && f5(6).thang && f5(6).soNhip === 12 && f5(6).sao === 2, rs('5.5', f5, [3, 4, 5, 6]));

  // 5.6
  const bacLoi = chamMan('5.6', FOR(3, ['move()', 'move()', 'turn_right()', 'move()', 'turn_left()']));
  kiem('5.6: không để ý băng (mỗi bậc đi hai ô): vẫn tới cờ nhưng 14 nhịp, chưa tới 2 sao', bacLoi.thang && bacLoi.soNhip === 14 && bacLoi.sao < 3, J([bacLoi.soNhip, bacLoi.sao]));
  const bac = (n) => chamMan('5.6', FOR(n, ['move()', 'turn_right()', 'move()', 'turn_left()']));
  kiem('5.6: lặp ba bậc 11 nhịp (3 sao), hai bậc trượt, bốn bậc vẫn 11 nhịp (thắng ngay khi chạm cờ)', bac(3).sao === 3 && bac(3).soNhip === 11 && !bac(2).thang && bac(4).soNhip === 11, rs('5.6', bac, [2, 3, 4]));

  // 5.7
  const f7 = (n) => chamMan('5.7', FOR(n, ['move()']).concat(['turn_right()'], FOR(4, ['move()'])));
  kiem('5.7: số lần lặp ở hàng ngược băng: n ≤ 9 trượt; n = 10 là 3 sao (15 nhịp); n = 11 hay 12 vẫn thắng nhưng chậm hơn và đâm tường',
    [6, 8, 9].every((n) => !f7(n).thang) && f7(10).sao === 3 && f7(10).soNhip === 15 && f7(11).thang && f7(11).sao < 3 && maCua(f7(11)).includes('dam-tuong') && f7(12).soNhip === 17, rs('5.7', f7, [6, 9, 10, 11, 12]));

  // 5.8
  const f8 = (k) => chamMan('5.8', FOR(4, ['move()']).concat(['bend_right()'], FOR(k, ['move()']), ['bend_left()'], FOR(4, ['move()'])));
  kiem('5.8: hàng giữa đi ngược băng: lặp k lần: k ≤ 9 trượt; k = 10 là 3 sao (26 nhịp); k = 11 chậm hơn 1 nhịp',
    [4, 6, 8, 9].every((k) => !f8(k).thang) && f8(10).sao === 3 && f8(10).soNhip === 26 && f8(11).thang && f8(11).soNhip === 27 && f8(11).sao < 3, rs('5.8', f8, [6, 9, 10, 11]));
  kiem('5.8: hai hàng xuôi băng chỉ cần 4 lần (tới đúng ô cuối), 5 lần thì đâm mép sân', maCua(f8(10)).length === 0 &&
    maCua(chamMan('5.8', FOR(5, ['move()']).concat(['bend_right()'], FOR(10, ['move()']), ['bend_left()'], FOR(4, ['move()'])))).includes('dam-tuong'));

  // 5.9
  const f9 = (n) => chamMan('5.9', ['pick()', 'move()'].concat(FOR(n, ['wait()']), ['drop()']));
  kiem('5.9: chờ n nhịp: n ≤ 6 thì thả vật trên băng (chưa tới đích), n = 7 là 3 sao (11 nhịp), n lớn hơn vẫn tới nhưng chậm — thiếu MỘT nhịp chờ thì vật không tới',
    [0, 2, 4, 5, 6].every((n) => !f9(n).thang && maCua(f9(n)).includes('chua-dua-vat')) && f9(7).sao === 3 && f9(7).soNhip === 11 && f9(8).thang && f9(8).soNhip === 12 && f9(8).sao === 2 && f9(20).thang, rs('5.9', f9, [5, 6, 7, 8, 9]));
  const m9 = ManHoc.tim('5.9');
  const sua9 = ChamHoc.cham(m9, m9.maMau, KHO);
  kiem('5.9: maMau (chờ 4 nhịp) trượt vì thả sớm giữa lối băng; sửa 4 → 7 là xong', !sua9.thang && maCua(sua9).join() === 'chua-dua-vat' && f9(7).sao === 3);

  // 5.10
  const f10 = (chinh) => chamMan('5.10', chinh);
  const CH = ['carry()', 'turn_right()', 'move()'];
  kiem('5.10: ba chuyến: hai chuyến carry() + chuyến cuối đi 4 bước = 3 sao (23 nhịp); chuyến cuối dùng carry() thì trượt (băng ngược, 2 bước không đủ); 3 hoặc 5 bước đều trượt hoặc chậm',
    f10(FOR(2, CH).concat(['pick()'], FOR(4, ['move()']), ['drop()'])).sao === 3 && f10(FOR(2, CH).concat(['pick()'], FOR(4, ['move()']), ['drop()'])).soNhip === 23 &&
      !f10(FOR(3, CH)).thang && !f10(FOR(2, CH).concat(['pick()'], FOR(3, ['move()']), ['drop()'])).thang &&
      f10(FOR(2, CH).concat(['pick()'], FOR(5, ['move()']), ['drop()'])).sao < 3);
  kiem('5.10: carry() chạy nguyên vẹn trên đoạn băng xuôi 3 ô (hai move() = 3 ô nhờ băng), cả ngang lẫn dọc',
    (() => { const r = f10(FOR(2, CH).concat(['pick()'], FOR(4, ['move()']), ['drop()'])); const v = r.theoSan[0].vat; return r.thang && v.every((x) => x.trangThai === 'dat'); })());
}

/* ================================== 5. CANFOR: TRẢI FOR RA THÌ TRÀN KHUNG / MẤT SAO */
console.log('\n== 5. canFor: lời giải không dùng for thì tràn khung (tran-khung) hoặc mất sao (mat-sao) ==');
{
  function traiFor(dsd) {
    const kq = [];
    for (let i = 0; i < dsd.length; i++) {
      const mk = /^for (\w+) in range\((\d+)\):$/.exec(dsd[i]);
      if (!mk) { kq.push(dsd[i]); continue; }
      const than = [];
      let j = i + 1;
      while (j < dsd.length && /^ {4}/.test(dsd[j])) { than.push(dsd[j].slice(4)); j++; }
      const trong = traiFor(than);
      for (let k = 0; k < +mk[2]; k++) kq.push(...trong);
      i = j - 1;
    }
    return kq;
  }
  kiem('traiFor tự kiểm: trải for lồng nhau', J(traiFor(['for i in range(2):', '    a()', '    for j in range(2):', '        b()', 'c()'])) === J(['a()', 'b()', 'b()', 'a()', 'b()', 'b()', 'c()']));
  const bangFor = [];
  for (const m of ds) {
    const r = ChamHoc.cham(Object.assign({}, m, { cauTruc: [], khung: Object.assign({}, m.khung, { cauTruc: ['for'] }) }), { chinh: traiFor(m.loiGiai.chinh) }, KHO);
    const tran = maCua(r).includes('tran-khung');
    bangFor.push({ id: m.id, canFor: m.canFor, tran, thang: r.thang, sao: r.sao, o: r.soO, saoO: m.sao.o, nhip: r.soNhip });
    if (m.canFor === 'tran-khung') kiem(m.id + ': CẦN for (tràn khung): trải for ra thì tran-khung, không chạy', tran && !r.thang && r.sao === 0, J(maCua(r)));
    else kiem(m.id + ': for giúp đạt 3 sao: trải for ra vẫn vừa khung, thắng nhưng ' + r.soO + ' ô > ' + m.sao.o + ' → dưới 3 sao', !tran && r.thang && r.soO > m.sao.o && r.sao < 3, J([maCua(r), r.thang, r.soO, r.sao]));
  }
  console.log('\n  Bảng chương bang-chuyen: viết không dùng for thì?');
  for (const b of bangFor) console.log('  ' + b.id.padEnd(5) + ' | ' + b.canFor.padEnd(10) + ' | ' + (b.tran ? 'tràn khung' : 'ô ' + b.o + ' > ' + b.saoO + ' → ' + b.sao + ' sao'));
}

/* ============================================================ 6. ĐƯỜNG TẮT */
console.log('\n== 6. Đường tắt: BFS có tính băng chuyền; chuỗi hành động của BFS chạy lại trong SanHoc ==');
{
  /** BFS tới cờ (x, y, hướng, bộ đếm băng), trả về nhịp và mã Python của đường ngắn nhất. */
  function bfsCo(man) {
    const san = SanHoc.docSan(man.san), bd = man.batDau;
    const khoa = (s) => [s.x, s.y, s.h, s.d].join();
    let lop = [{ x: bd.x, y: bd.y, h: bd.huong, d: 0, p: [] }];
    const thay = new Set([khoa(lop[0])]);
    const MA = { tien: L('left_move()', 'right_move()', 'wait()'), trai: L('right_move()', 'wait()'), phai: L('left_move()', 'wait()'), cho: 'wait()\n' };
    for (let b = 1; b <= 400 && lop.length; b++) {
      const tiep = [];
      for (const s of lop) {
        for (const a of ['tien', 'trai', 'phai', 'cho']) {
          let { x, y, h, d } = s;
          if (a === 'tien') { const v = SanHoc.VEC[h]; if (!SanHoc.lyDoChan(san, 'banh', x + v[0], y + v[1])) { x += v[0]; y += v[1]; } }
          else if (a === 'trai') h = (h + 3) % 4; else if (a === 'phai') h = (h + 1) % 4;
          const o = san.o[y][x];
          if (SanHoc.BANG[o] !== undefined) {
            d++;
            if (d >= 2) { const v = SanHoc.VEC[SanHoc.BANG[o]]; if (!SanHoc.lyDoChan(san, 'banh', x + v[0], y + v[1])) { x += v[0]; y += v[1]; } d = 0; }
          } else d = 0;
          const p = s.p.concat([a]);
          if (san.o[y][x] === 'F') return { nhip: b, ma: p.map((q) => MA[q]).join('') };
          const n = { x, y, h, d, p };
          if (!thay.has(khoa(n))) { thay.add(khoa(n)); tiep.push(n); }
        }
      }
      lop = tiep;
    }
    return null;
  }
  for (const m of ds) {
    const co = m.mucTieu !== 'dua-vat';
    const k = co ? bfsCo(m) : nhipDuaVatNganNhat(m);
    const ma = co ? k.ma : chuoiThanhMa(k.chuoi);
    const r = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, mucTieu: m.mucTieu || 'toi-co' }, ma);
    const theoLoiGiai = m.nhipTheoLoiGiai === true;
    kiem(m.id + ': BFS ' + k.nhip + ' nhịp ' + (theoLoiGiai ? '≤ sao.nhip ' + m.sao.nhip + ' (chấm theo lời giải chuẩn, chênh ' + (m.sao.nhip - k.nhip) + ')' : '= sao.nhip') + '; chuỗi của BFS chạy trong SanHoc thắng đúng nhịp đó',
      k.nhip !== null && !k.catNgang && (theoLoiGiai ? k.nhip <= m.sao.nhip : k.nhip === m.sao.nhip) && r.thang && r.nhip === k.nhip, J([k.nhip, r.thang, r.nhip]));
  }
  // bỏ tường thì có đường tắt: bộ dò phải bắt được
  const m4 = ManHoc.tim('5.4');
  const mong = Object.assign({}, m4, { san: ['#..F..#', '#.....#', '#.....#', '#>>>>>#', '#>>>>>#', '#>>>>>#', '#.....#'] });
  kiem('bộ dò nhạy với băng: bớt một hàng băng của 5.4 thì lệch ít hơn, đường ngắn nhất giảm xuống dưới ' + m4.sao.nhip + ' nhịp', bfsCo(mong).nhip < m4.sao.nhip, J(bfsCo(mong).nhip));
  const m7 = ManHoc.tim('5.7');
  const ho7 = Object.assign({}, m7, { san: ['.<<<<<.', '.......', '.......', '.......', '......F'] });
  kiem('bộ dò bắt được đường tắt khi bỏ tường: mở hành lang 5.7 thì đi vòng dưới băng, nhanh hơn ' + m7.sao.nhip + ' nhịp', bfsCo(ho7).nhip < m7.sao.nhip, J(bfsCo(ho7).nhip));
}

/* ============================================================ 7. BẢNG 10 MÀN */
console.log('\n== 7. Bảng 10 màn (sân in lưới: o vật · D đích · # tường · > < ^ v băng · F cờ; xe và hướng ghi riêng) ==');
{
  const MUI = ['↑', '→', '↓', '←'];
  for (const m of ds) {
    const r = ChamHoc.cham(m, m.loiGiai, KHO);
    const luoi = m.san.slice();
    console.log('\n  ' + m.id + ' ' + m.ten + ' [' + m.hang + (m.mucTieu === 'dua-vat' ? ', dua-vat' : '') + '] ' + m.san[0].length + '×' + m.san.length + ' · ô ' + r.soO + ' · nhịp ' + r.soNhip + (m.nhipTheoLoiGiai ? ' (BFS ' + (m.mucTieu === 'dua-vat' ? nhipDuaVatNganNhat(m).nhip : '=') + ')' : ''));
    for (const g of luoi) console.log('    ' + g);
    console.log('    xe: (' + m.batDau.x + ', ' + m.batDau.y + ') quay ' + MUI[m.batDau.huong] + (SanHoc.docSan(m.san).vat.some((v) => v.x === m.batDau.x && v.y === m.batDau.y) ? ' · đứng trên vật' : ''));
    console.log('    lời giải: ' + m.loiGiai.chinh.map((s) => s.replace(/^ {4}/, '· ')).join(' | '));
  }
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
