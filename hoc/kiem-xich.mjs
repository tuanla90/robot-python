/* ============================================================================
   kiem-xich.mjs — máy kiểm chương `xich` (Bánh xích) của "Đường học".
   Gồm: luật xích (cùng bộ lệnh với xe bánh; tiến / lùi 1 ô; QUAY CHẬM: cần 2 nhịp liên tiếp cùng tổ hợp mới đủ 90°,
   quay dở bị mất khi nhịp kế khác tổ hợp; leo bậc thang; băng chuyền không đẩy được), hàm quay của xe bánh quay sai trên
   xích, bộ dò đường tắt cho xích (do-duong-xich.mjs) và so chéo với san-hoc.js bằng chương trình ngẫu nhiên, dữ liệu 10 màn,
   canHam (không dùng hàm thì tràn khung), chẩn đoán 'xich-quay-do', Xưởng hàm với xích và bảng 10 màn.
   Các kiểm chung cho cả 80 màn (đi tuần tự, sao, lời sai, đường tắt BFS…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-xich.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipXichNganNhat, buocMotNhip, dungNguCanh, trangThaiDau, hanhDongTuDo, chuoiThanhMa, TO_HOP, soOCoNganNhat } from './do-duong-xich.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
require(path.join(day, 'man-chuoi-2.js'));
require(path.join(day, 'man-tay-gap.js'));
require(path.join(day, 'man-vong-lap.js'));
require(path.join(day, 'man-bang-chuyen.js'));
require(path.join(day, 'man-tham-so.js'));
require(path.join(day, 'man-nhen.js'));
const ManHoc = require(path.join(day, 'man-xich.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const vt = (r) => r.x + ',' + r.y;
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'xich');
const tatCa = ManHoc.danhSach;
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). */
function khoTruoc(id) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam });
      kho.sua(h.ten, h.than);
    }
  }
  return kho.ds();
}
const tron = (kho, moi) => {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
};
const man = (id) => ManHoc.tim(id);
const chamGiai = (m) => ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));

const XICH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const XICH_TAY = XICH.concat(['arm_down', 'arm_up', 'grab', 'release']);
const L = (...d) => d.join('\n') + '\n';
const lapLenh = (l, n) => Array(n).fill(l).join('\n') + '\n';
const xich = (rows, bd, code, extra) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'xich' }, extra || {}), code);
const xichTay = (rows, bd, code, extra) => xich(rows, bd, code, Object.assign({ hamGoc: XICH_TAY }, extra || {}));
const TRONG = ['.......', '.......', '.......', '.......', '.......'];
const O = { x: 3, y: 2, huong: 0 };
const QP = L('left_move()', 'wait()');       // một nhịp quay phải nửa vòng
const QT = L('right_move()', 'wait()');
const huongSau = (code, h0 = 0) => xich(TRONG, { x: 3, y: 2, huong: h0 }, code).robot.huong;

/* ====================================================== 1. LUẬT QUAY CHẬM */
console.log('\n== 1. Xích: tiến / lùi 1 ô; quay chậm cần 2 nhịp liên tiếp cùng tổ hợp ==');
{
  kiem('xích dùng đúng bộ lệnh của xe bánh: HAM_GOC.xich = left_move, right_move, left_back, right_back, wait', J(SanHoc.HAM_GOC.xich) === J(SanHoc.HAM_GOC.banh) && J(SanHoc.HAM_GOC.xich) === J(XICH));
  kiem('tiến một nhịp = 1 ô (hai bánh cùng tiến), lùi một nhịp = lùi 1 ô', vt(xich(TRONG, O, L('left_move()', 'right_move()', 'wait()')).robot) === '3,1' && vt(xich(TRONG, O, L('left_back()', 'right_back()', 'wait()')).robot) === '3,3');
  kiem('move() cũ của xe bánh vẫn đúng trên xích: ba lần = 3 ô, 3 nhịp', (() => { const r = xich(TRONG, { x: 3, y: 4, huong: 0 }, lapLenh(L('left_move()', 'right_move()', 'wait()').trim(), 3)); return vt(r.robot) === '3,1' && r.nhip === 3; })());
  kiem('wait() là một nhịp đứng yên', xich(TRONG, O, 'wait()').nhip === 1 && vt(xich(TRONG, O, 'wait()').robot) === '3,2');

  // một nhịp quay: nửa vòng
  const nua = xich(TRONG, O, QP);
  kiem('một nhịp chỉ bánh trái tiến: xe chỉ "nhích nửa vòng": huong chưa đổi, quayDo = +1, sự kiện quay-nua', nua.robot.huong === 0 && nua.quayDo === 1 && nhipVet(nua)[0].suKien[0].ma === 'quay-nua' && nhipVet(nua)[0].robot.quayDo === 1);
  kiem('một nhịp chỉ bánh phải tiến: nửa vòng sang trái (quayDo = -1)', xich(TRONG, O, QT).quayDo === -1);
  // hai nhịp liên tiếp cùng tổ hợp: 90°
  const bonTuHop = [
    ['left_move()', 'quay phải (chỉ trái tiến)', 1], ['right_back()', 'quay phải (chỉ phải lùi)', 1], ['left_move()\nright_back()', 'quay phải tại chỗ (trái tiến, phải lùi)', 1],
    ['right_move()', 'quay trái (chỉ phải tiến)', 3], ['left_back()', 'quay trái (chỉ trái lùi)', 3], ['right_move()\nleft_back()', 'quay trái tại chỗ (phải tiến, trái lùi)', 3]
  ];
  for (const [lenh, mota, h] of bonTuHop) {
    const r = xich(TRONG, O, L(lenh, 'wait()', lenh, 'wait()'));
    kiem('hai nhịp liên tiếp cùng lệnh ' + mota + ': quay đủ 90° (huong ' + h + '), đúng 2 nhịp, không rời ô', r.robot.huong === h && r.nhip === 2 && vt(r.robot) === '3,2' && r.quayDo === 0 && !r.suKien.length, J([r.robot, r.nhip, r.suKien]));
  }
  kiem('quay tại chỗ (hai bên ngược chiều) cũng cần 2 nhịp cho 90°, KHÔNG phải quay đầu 180° trong một nhịp như xe bánh', (() => {
    const mot = xich(TRONG, O, L('left_move()', 'right_back()', 'wait()')), banhMot = SanHoc.chay({ san: TRONG, batDau: O, loaiRobot: 'banh' }, L('left_move()', 'right_back()', 'wait()'));
    return mot.robot.huong === 0 && mot.quayDo === 1 && banhMot.robot.huong === 2;
  })());
  kiem('bốn lần quay phải đủ 90° (8 nhịp) về hướng cũ; hai lần quay phải đủ 90° (4 nhịp) = một lần quay trái thường 3 lần', huongSau(lapLenh(QP.trim(), 8)) === 0 && huongSau(lapLenh(QP.trim(), 4)) === 2);
  kiem('ba nhịp liền cùng tổ hợp: nhịp 3 lại là nửa vòng mới (90° rồi nửa vòng): huong 1, quayDo +1', (() => { const r = xich(TRONG, O, lapLenh(QP.trim(), 3)); return r.robot.huong === 1 && r.quayDo === 1; })());
  kiem('vết nhịp có robot.quayDo cho hoạt cảnh: nửa vòng +1 rồi về 0 khi quay xong', J(nhipVet(xich(TRONG, O, lapLenh(QP.trim(), 2))).map((n) => n.robot.quayDo)) === '[1,0]');

  // quay dở bị mất
  const mat = [
    ['nhịp kế là tiến (move)', L('left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'), '3,1', 0],
    ['nhịp kế là lùi', L('left_move()', 'wait()', 'left_back()', 'right_back()', 'wait()'), '3,3', 0],
    ['nhịp kế là đứng yên (wait)', L('left_move()', 'wait()', 'wait()', 'left_move()', 'wait()'), '3,2', 0],
    ['nhịp kế là tổ hợp quay khác bên cùng chiều (left_move rồi right_back)', L('left_move()', 'wait()', 'right_back()', 'wait()', 'right_back()', 'wait()'), '3,2', 1]
  ];
  for (const [mota, code, vtri, h] of mat) {
    const r = xich(TRONG, O, code);
    kiem('quay dở bị MẤT khi ' + mota + ': ghi xich-quay-do', maSK(r, 'xich-quay-do').filter((x) => !x.cuoi).length === 1 && vt(r.robot) === vtri && r.robot.huong === h, J([vt(r.robot), r.robot.huong, r.suKien]));
  }
  const s1 = xich(TRONG, O, L('left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  const e = maSK(s1, 'xich-quay-do')[0];
  kiem('sự kiện xich-quay-do nêu nhịp mất (2), nhịp bắt đầu quay (1), chiều (+1) và lệnh gây ra (left_move ở dòng 1)', e.nhip === 2 && e.nhipNua === 1 && e.huong === 1 && e.lenh.ten === 'left_move' && e.lenh.dongPy === 1, J(e));
  kiem('hàm turn_right() cũ (left_move + wait: MỘT nhịp) chạy trên xích chỉ quay nửa vòng, rồi move() đi thẳng theo hướng cũ', (() => {
    const code = L('def turn_right():', '    left_move()', '    wait()', 'def move():', '    left_move()', '    right_move()', '    wait()', 'turn_right()', 'move()');
    const r = xich(TRONG, O, code);
    return r.robot.huong === 0 && vt(r.robot) === '3,1' && maSK(r, 'xich-quay-do').length === 1;
  })());
  kiem('turn_right() cũ gọi HAI lần liền = một lần quay 90° đúng (hai nhịp cùng lệnh): u_turn() cũ trên xích chỉ quay 90°, không phải 180°', (() => {
    const base = L('def turn_right():', '    left_move()', '    wait()', 'def u_turn():', '    turn_right()', '    turn_right()');
    const r = xich(TRONG, O, base + 'u_turn()');
    const hai = xich(TRONG, O, base + 'u_turn()\nu_turn()');
    return r.robot.huong === 1 && r.nhip === 2 && hai.robot.huong === 2 && hai.nhip === 4;
  })());
  kiem('chương trình dừng khi còn quay dở (chưa thắng): ghi xich-quay-do với cuoi: true, quayDo vẫn +1', (() => { const r = xich(TRONG, O, QP); const ev = maSK(r, 'xich-quay-do'); return ev.length === 1 && ev[0].cuoi === true && r.quayDo === 1; })());
  kiem('quay dở rồi vẫn tới cờ: ghi xich-quay-do ở nhịp tiến (mất) nhưng không có bản "cuối chương trình"', (() => { const r = xich(['...F'], { x: 0, y: 0, huong: 1 }, L('left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()')); const ev = maSK(r, 'xich-quay-do'); return r.thang && ev.length === 1 && !ev[0].cuoi; })());
  kiem('quay dở mất cả khi đâm tường (nhịp tiến bị chặn vẫn là nhịp tiến)', (() => { const r = xich(['..#'], { x: 1, y: 0, huong: 1 }, L('left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()')); return maSK(r, 'xich-quay-do').length === 1 && maSK(r, 'dam-tuong').length === 1 && r.robot.huong === 1; })());
}

/* ====================================================== 2. BẬC THANG VÀ BĂNG CHUYỀN */
console.log('\n== 2. Bậc thang: xích leo được; băng chuyền không đẩy được xích ==');
{
  const SANG = ['...S...', '...S...', '...S...', '...S...', '...S...'];
  const r = xich(SANG, { x: 3, y: 4, huong: 0 }, L('left_move()', 'right_move()', 'wait()').repeat(4));
  kiem('xích leo bậc thang S như đi trên sàn: 4 ô lên liên tiếp, không đâm', vt(r.robot) === '3,0' && r.nhip === 4 && !r.suKien.length);
  const banh = SanHoc.chay({ san: ['..S..'], batDau: { x: 1, y: 0, huong: 1 }, loaiRobot: 'banh' }, L('left_move()', 'right_move()', 'wait()'));
  kiem('xe bánh không leo được: cùng đường đó xe bánh đâm (dam-tuong, bac-thang)', maSK(banh, 'dam-tuong').length === 1 && maSK(banh, 'dam-tuong')[0].vat === 'bac-thang' && vt(banh.robot) === '1,0');
  kiem('lyDoChan: S chặn xe bánh, không chặn xích và nhện', SanHoc.lyDoChan(SanHoc.docSan(['S']), 'banh', 0, 0) === 'bac-thang' && SanHoc.lyDoChan(SanHoc.docSan(['S']), 'xich', 0, 0) === null && SanHoc.lyDoChan(SanHoc.docSan(['S']), 'nhen', 0, 0) === null);
  const BANG_PHAI = ['.......', '.......', '.>>>>>.', '.......', '.......'], BANG_TRAI = ['.......', '.......', '.<<<<<.', '.......', '.......'];
  kiem('đứng chờ trên băng chuyền xuôi chiều: xe bánh bị đẩy 1 ô sau 2 nhịp, xích đứng im', (() => {
    const b = SanHoc.chay({ san: BANG_PHAI, batDau: { x: 1, y: 2, huong: 1 }, loaiRobot: 'banh' }, L('wait()', 'wait()'));
    const x = xich(BANG_PHAI, { x: 1, y: 2, huong: 1 }, L('wait()', 'wait()'));
    return vt(b.robot) === '2,2' && vt(x.robot) === '1,2';
  })());
  kiem('đi xuôi băng: xích đi đúng 1 ô / nhịp, không được lời (6 nhịp = 6 ô, không phải 9)', (() => { const x = xich(['>>>>>>>>>'], { x: 0, y: 0, huong: 1 }, L('left_move()', 'right_move()', 'wait()').repeat(6)); return vt(x.robot) === '6,0' && x.nhip === 6; })());
  kiem('đi NGƯỢC băng: xích vẫn tiến 1 ô / nhịp, qua được hết băng (xe bánh và nhện thì bị đẩy lùi / kẹt)', (() => {
    const x = xich(['.<<<<<<<F'], { x: 0, y: 0, huong: 1 }, L('left_move()', 'right_move()', 'wait()').repeat(8));
    const b = SanHoc.chay({ san: ['.<<<<<<<F'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh' }, L('left_move()', 'right_move()', 'wait()').repeat(8));
    return x.thang && x.nhip === 8 && (!b.thang || b.nhip > 8);
  })());
  kiem('băng chuyền 4 hướng đều không đẩy xích (đứng chờ 4 nhịp trên ">", "<", "^", "v")', ['>', '<', '^', 'v'].every((c) => { const x = xich(['...', '.' + c + '.', '...'], { x: 1, y: 1, huong: 0 }, lapLenh('wait()', 4)); return vt(x.robot) === '1,1'; }));
  kiem('xích đứng đủ 2 nhịp trên băng: ghi bang-khong-day (thông tin cho hoạt cảnh), không phải lỗi chẩn đoán', (() => {
    const x = xich(BANG_PHAI, { x: 1, y: 2, huong: 1 }, L('wait()', 'wait()', 'wait()', 'wait()'));
    return nhipVet(x).filter((n) => n.suKien.some((s) => s.ma === 'bang-khong-day')).length === 2 && !x.suKien.some((s) => s.ma === 'bang-khong-day') && !maSK(x, 'bang-day').length;
  })());
  kiem('xích trên băng vẫn quay được 90° bình thường (bám chắc): quay phải 2 nhịp tại ô băng', (() => { const x = xich(BANG_TRAI, { x: 2, y: 2, huong: 1 }, QP + QP); return x.robot.huong === 2 && vt(x.robot) === '2,2'; })());
  kiem('xích có tay kẹp: vật đang cầm đi theo, băng không đẩy xe', (() => {
    const x = xichTay(['.o>>>.'], { x: 0, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'wait()', 'wait()', 'wait()'), { mucTieu: 'dua-vat', dich: [{ x: 5, y: 0 }] });
    return vt(x.robot) === '2,0' && x.vat[0].trangThai === 'cam' && x.vat[0].x === 2;
  })());
}

/* ====================================================== 3. TAY KẸP CỦA XÍCH */
console.log('\n== 3. Tay kẹp của xích: như xe bánh; tay hạ thì xe không đi hay quay, quay dở cũng mất ==');
{
  // LUẬT VẬT (14/10): vật chiếm ô; gắp / thả ở ô TRƯỚC MẶT (mũi xe, huong 0 = lên)
  const S = ['.......', '..o....', '.......', '.......', '.......'];
  const bd = { x: 2, y: 2, huong: 0 };
  const a = xichTay(S, bd, L('arm_down()', 'grab()', 'wait()'));
  kiem('arm_down + grab + wait: một nhịp nhặt được vật ở ô ngay trước mũi xe', a.nhip === 1 && a.tay.cam === 1 && a.vat[0].trangThai === 'cam');
  const a2 = xichTay(S, bd, L('left_move()', 'right_move()', 'wait()'));
  kiem('vật chiếm ô: xích tiến vào ô có vật thì đứng im, dam-tuong vat "vat" (tay không với thì xe cũng không đi xuyên)', vt(a2.robot) === '2,2' && maSK(a2, 'dam-tuong').length === 1 && maSK(a2, 'dam-tuong')[0].vat === 'vat');
  const a3 = xichTay(S, { x: 2, y: 0, huong: 0 }, L('left_back()', 'right_back()', 'wait()'));
  kiem('vật chiếm ô: xích LÙI vào ô có vật cũng bị chặn', vt(a3.robot) === '2,0' && maSK(a3, 'dam-tuong')[0].vat === 'vat');
  const a4 = xichTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), { mucTieu: 'dua-vat', dich: [{ x: 2, y: 0 }] });
  kiem('nhặt rồi tiến một ô vào ô vật vừa nằm (đã trống), thả xuống ô trước mặt (2,0) là ô đích: thắng', a4.thang && vt(a4.robot) === '2,1' && a4.vat[0].x === 2 && a4.vat[0].y === 0 && a4.vat[0].trangThai === 'dat', J([a4.thang, a4.robot, a4.vat]));
  const a5 = xichTay(['###', '.o.', '...'], { x: 1, y: 2, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'));
  kiem('thả vào ô trước mặt là tường: tha-bi-chan (vat "tuong"), vật vẫn ở tay', (() => { const e = maSK(a5, 'tha-bi-chan'); return e.length === 1 && e[0].vat === 'tuong' && a5.tay.cam === 1 && a5.vat[0].trangThai === 'cam'; })(), J(a5.suKien));
  const b = xichTay(S, bd, L('arm_down()', 'left_move()', 'wait()'));
  kiem('tay hạ mà ra lệnh quay: lệnh bánh bị bỏ (tay-vuong), xe không quay (cũng không "nhích nửa vòng")', maSK(b, 'tay-vuong').length === 1 && b.robot.huong === 0 && b.quayDo === 0 && !maSK(b, 'xich-quay-do').length);
  const c = xichTay(S, bd, L('left_move()', 'wait()', 'arm_down()', 'left_move()', 'wait()', 'arm_up()', 'left_move()', 'wait()'));
  kiem('quay dở rồi hạ tay + ra lệnh bánh: tay vướng, phần quay dở mất (ghi xich-quay-do), nhịp quay sau đó chỉ là nửa vòng mới', maSK(c, 'tay-vuong').length === 1 && maSK(c, 'xich-quay-do').filter((x) => !x.cuoi).length === 1 && c.robot.huong === 0 && c.quayDo === 1, J(c.suKien.map((x) => x.ma)));
  const d = xichTay(S, bd, L('left_move()', 'wait()', 'arm_down()', 'wait()', 'left_move()', 'wait()'));
  kiem('hạ tay (nhịp không có lệnh bánh) giữa hai nhịp quay cũng làm mất phần quay dở: nhịp đứng yên không cùng tổ hợp', maSK(d, 'xich-quay-do').filter((x) => !x.cuoi).length === 1 && d.robot.huong === 0);
  const e = xichTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'wait()', 'left_move()', 'wait()'));
  kiem('nâng tay ở cùng nhịp với nửa vòng quay đầu: vẫn tính, quay đủ 90° ở nhịp 3 (pick() xong rồi quay được)', e.robot.huong === 1 && e.tay.tuThe === 'tren' && e.tay.cam === 1 && e.nhip === 3, J([e.robot, e.nhip]));
  const f = xichTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'wait()', 'left_move()', 'wait()'));
  kiem('pick() như trong kho (hạ, kẹp, nâng, mỗi nhóm một nhịp) rồi quay 90°: 4 nhịp, không chẩn đoán', f.nhip === 4 && f.robot.huong === 1 && !f.suKien.length);
  const g = xichTay(S, bd, L('arm_down()', 'grab()', 'wait()'), { mucTieu: 'dua-vat', dich: [{ x: 2, y: 1 }] });
  kiem('mục tiêu dua-vat với xích: nhặt rồi không đặt xuống đích thì chưa thắng', !g.thang);
  kiem('không khai lệnh tay thì xích gọi arm_down() là lỗi chạy', (() => { const r = xich(S, bd, 'arm_down()\nwait()'); return r.loi && r.loi.loai === 'runtime-error' && r.tay === null; })());
  kiem('xích chỉ nhận lệnh bánh: go_up() là lỗi chạy (tên lạ)', (() => { const r = xich(S, bd, 'go_up()'); return r.loi && r.loi.loai === 'runtime-error'; })());
  kiem('banh-goi-lai và quen-wait giữ nguyên với xích (hai lệnh cùng một bánh trong một nhịp; lệnh treo cuối chương trình)', (() => {
    const r1 = xich(TRONG, O, L('left_move()', 'left_move()', 'wait()')), r2 = xich(TRONG, O, 'left_move()\nright_move()');
    return maSK(r1, 'banh-goi-lai').length === 1 && maSK(r2, 'quen-wait').length === 1;
  })());
  kiem('loại robot lạ vẫn bị từ chối', (() => { try { xich(TRONG, O, 'wait()', { loaiRobot: 'tank' }); return false; } catch (err) { return /Loại robot lạ/.test(err.message); } })());
}

/* ====================================================== 4. BỘ DÒ ĐƯỜNG TẮT CHO XÍCH */
console.log('\n== 4. Bộ dò đường tắt cho xích (BFS theo nhịp) và so chéo với san-hoc.js ==');
{
  const bfs = (san, bd, ex) => nhipXichNganNhat(Object.assign({ loaiRobot: 'xich', san, batDau: bd }, ex || {}));
  kiem('đường thẳng 4 ô = 4 nhịp', bfs(['.....F'].map((s) => s.slice(1)), { x: 0, y: 0, huong: 1 }).nhip === 4);
  kiem('rẽ một góc vuông = 2 nhịp quay + số ô: ["...", "##.", "##F"] từ (0,0) hướng phải = 2 + 2 + 2', bfs(['...', '##.', '##F'], { x: 0, y: 0, huong: 1 }).nhip === 6);
  kiem('BFS: cờ ngay sau lưng thì lùi 1 nhịp là thắng, không cần quay đầu', bfs(['F.'], { x: 1, y: 0, huong: 1 }).nhip === 1 && bfs(['F.', '##'], { x: 1, y: 0, huong: 1 }).nhip === 1);
  kiem('BFS biết lùi: cờ ở đúng sau lưng, 3 ô → 3 nhịp lùi, không quay đầu', bfs(['F...'], { x: 3, y: 0, huong: 1 }).nhip === 3);
  kiem('bậc thang S đi qua được', bfs(['.S.F'], { x: 0, y: 0, huong: 1 }).nhip === 3);
  kiem('băng chuyền không ảnh hưởng: đường qua băng = đường qua sàn', bfs(['.<<F'], { x: 0, y: 0, huong: 1 }).nhip === 3 && bfs(['.>>F'], { x: 0, y: 0, huong: 1 }).nhip === 3);
  kiem('cờ bị tường vây kín → null', bfs(['.....', '.###.', '.#F#.', '.###.', '.....'], { x: 0, y: 0, huong: 1 }).nhip === null);
  const co = bfs(['.o.D'], { x: 0, y: 0, huong: 1 }, { hamGoc: XICH_TAY, mucTieu: 'dua-vat' });
  kiem('dua-vat: nhặt vật ngay trước mũi xe (1: hạ tay + kẹp) + đi 2 ô (2) + thả xuống ô đích trước mũi xe (1) = 4 nhịp, nâng tay gộp vào nhịp đi', co.nhip === 4, String(co.nhip));
  kiem('vật chiếm ô: hành lang bị vật chắn, xe không có tay thì BFS null; có tay thì nhặt đi được', bfs(['.o.F'], { x: 0, y: 0, huong: 1 }).nhip === null && bfs(['.o.F'], { x: 0, y: 0, huong: 1 }, { hamGoc: XICH_TAY }).nhip !== null);
  kiem('chuoiThanhMa: mã sinh từ BFS chạy trong san-hoc.js cho đúng số nhịp (dua-vat)', (() => {
    const r = xichTay(['.o.D'], { x: 0, y: 0, huong: 1 }, chuoiThanhMa(co.chuoi), { mucTieu: 'dua-vat' });
    return r.thang && r.nhip === co.nhip;
  })());
  kiem('soOCoNganNhat: số ô ngắn nhất tới cờ (bỏ hướng), null nếu không tới', soOCoNganNhat({ san: ['..F'], batDau: { x: 0, y: 0, huong: 1 } }) === 2 && soOCoNganNhat({ san: ['.#F'], batDau: { x: 0, y: 0, huong: 1 } }) === null);

  // so chéo: chương trình ngẫu nhiên (xorshift cố định)
  let seed = 987654321;
  const rnd = (n) => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed % n; };
  const KY = '.....##SS>><<^^vv';
  let soCa = 0, lech = 0, ghiLech = '', soMat = 0, soQuay = 0;
  for (let lan = 0; lan < 500; lan++) {
    const rong = 4 + rnd(3), cao = 4 + rnd(3);
    const rows = [];
    for (let y = 0; y < cao; y++) { let s = ''; for (let x = 0; x < rong; x++) s += KY[rnd(KY.length)]; rows.push(s); }
    const dat1 = (ch, n) => { for (let i = 0; i < n; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] === '.') rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); } };
    dat1('o', 2); dat1('D', 2);
    let bd = null;
    for (let i = 0; i < 50 && !bd; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] !== '#') bd = { x, y, huong: rnd(4) }; }
    if (!bd) continue;
    const manR = { loaiRobot: 'xich', san: rows, batDau: bd, hamGoc: XICH_TAY, mucTieu: 'dua-vat' };
    const ctx = dungNguCanh(manR), HD = hanhDongTuDo(ctx);
    const chuoi = [];
    for (let i = 0; i < 14; i++) chuoi.push(rnd(3) === 0 && chuoi.length ? chuoi[chuoi.length - 1] : HD[rnd(HD.length)]);   // hay lặp lại hành động trước để có cặp quay liên tiếp
    const code = chuoiThanhMa(chuoi);
    let S = trangThaiDau(ctx), nhip = 0;
    for (const a of chuoi) { S = buocMotNhip(ctx, S, a); nhip++; }
    const kq = SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'xich', hamGoc: XICH_TAY, mucTieu: 'toi-co' }, code);
    soCa++;
    const vatBfs = S.pos.map((p) => (p === -2 ? 'vo' : p === -1 ? 'cam' : (p % ctx.rong) + ',' + Math.floor(p / ctx.rong)));
    const vatSan = kq.vat.map((v) => (v.trangThai === 'vo' ? 'vo' : v.trangThai === 'cam' ? 'cam' : v.x + ',' + v.y));
    const tayBfs = S.t === 1 ? 'duoi' : 'tren';
    const quayBfs = S.q < 0 ? 0 : (TO_HOP[S.q] ? SanHoc.XICH_QUAY[TO_HOP[S.q].join(',')] : 0);
    const ok = kq.robot.x === S.x && kq.robot.y === S.y && kq.robot.huong === S.h && kq.nhip === nhip && kq.tay.tuThe === tayBfs && kq.quayDo === quayBfs && J(vatBfs) === J(vatSan);
    if (maSK(kq, 'xich-quay-do').length) soMat++;
    if (nhipVet(kq).some((n) => n.suKien.some((s) => s.ma === 'quay-phai' || s.ma === 'quay-trai'))) soQuay++;
    if (!ok) { lech++; if (!ghiLech) ghiLech = J({ rows, bd, code, bfs: [S.x, S.y, S.h, quayBfs, nhip, tayBfs, vatBfs], san: [kq.robot.x, kq.robot.y, kq.robot.huong, kq.quayDo, kq.nhip, kq.tay.tuThe, vatSan] }); }
  }
  kiem('so chéo ' + soCa + ' chương trình ngẫu nhiên (sân có tường, bậc thang, băng 4 chiều, vật, đích, tay): BFS và san-hoc.js trùng vị trí, hướng, quay dở, nhịp, tay, vật', soCa >= 450 && lech === 0, lech + ' lệch · ' + ghiLech);
  kiem('mẫu ngẫu nhiên có đủ cả hai loại ca: nhiều chương trình có quay đủ 90° (' + soQuay + ') và có quay dở bị mất (' + soMat + ')', soQuay >= 80 && soMat >= 80, soQuay + ' / ' + soMat);
}

/* ====================================================== 5. DỮ LIỆU 10 MÀN */
console.log('\n== 5. Dữ liệu 10 màn: xích, tay kẹp ở 7 và 10, hàm tr_right / tr_left, bậc thang, băng, vòng hai đường ==');
{
  kiem('đúng 10 màn, số 1..10, id 15.1…15.10 (chương thứ 10, sau nhen), mã xich.1…, tên "Bánh xích"',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '15.' + (i + 1) && m.ma === 'xich.' + (i + 1)) && ThuTu.thuTu[14] === 'xich' && ThuTu.thuTu[12] === 'nhen' && ThuTu.ten.xich === 'Bánh xích');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ 10.10 có huy hiệu xich',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'xich' && ds[9].huyHieu.ten === 'Huy hiệu Bánh xích');
  kiem('mọi màn: loaiRobot xich, robot { than: "xich", tay }, cauTruc ["for","if"], Xưởng mở, được dùng hàm của em, chương trình 10 ô + mỗi hàm 10 ô',
    ds.every((m) => m.loaiRobot === 'xich' && m.robot && m.robot.than === 'xich' && J(m.cauTruc) === '["for","if"]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10));
  kiem('tay kẹp chỉ ở 10.7 và 10.10 (robot.tay "kep", hamGoc có 4 lệnh tay, mục tiêu dua-vat); các màn khác tay null, hamGoc = bộ lệnh xe bánh',
    ds.every((m) => { const co = ['15.7', '15.10'].includes(m.id); return co ? m.robot.tay === 'kep' && J(m.hamGoc) === J(XICH_TAY) && m.mucTieu === 'dua-vat' : m.robot.tay === null && J(m.hamGoc) === J(XICH) && m.mucTieu === undefined; }));
  kiem('sân tối đa 7×7; màn tới cờ có đúng một cờ F; màn dua-vat có vật và ô đích',
    ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7 && (m.mucTieu === 'dua-vat' ? /o/.test(m.san.join('')) && /D/.test(m.san.join('')) : (m.san.join('').match(/F/g) || []).length === 1)));
  kiem('bậc thang S ở 10.5, 10.7, 10.10 (xe bánh không qua); băng chuyền ở 10.6, 10.10; các màn khác sân chỉ có sàn và tường',
    ['15.5', '15.7', '15.10'].every((id) => /S/.test(man(id).san.join(''))) && ['15.6', '15.10'].every((id) => /[<>^v]/.test(man(id).san.join(''))) &&
      ['15.1', '15.2', '15.3', '15.4', '15.8', '15.9'].every((id) => !/[S<>^v]/.test(man(id).san.join(''))));
  kiem('hàm cốt truyện mới: 10.3 tạo tr_right, 10.4 tạo tr_left; các màn khác không tạo; tên không trùng hàm cốt truyện chương trước và không phải hàm gốc',
    ds.every((m) => J(m.taoHam) === J({ '15.3': ['tr_right'], '15.4': ['tr_left'] }[m.id] || [])) &&
      (() => { const cu = tatCa.filter((m) => m.chuong !== 'xich').flatMap((m) => m.taoHam); return ['tr_right', 'tr_left'].every((t) => !cu.includes(t) && !KhoHam.HAM_GOC_MAC_DINH.includes(t) && tenCotTruyen.includes(t)); })());
  kiem('tr_right() và tr_left() không đối số, 3 ô mỗi hàm (for i in range(2): lệnh quay + wait), dùng left_move / right_move', (() => {
    const a = man('15.3').loiGiai.hamCuaEmMoi[0], b = man('15.4').loiGiai.hamCuaEmMoi[0];
    return a.ten === 'tr_right' && J(a.thamSo) === '[]' && KhungCode.soOHam(a) === 3 && a.than[1].trim() === 'left_move()' && b.ten === 'tr_left' && J(b.thamSo) === '[]' && KhungCode.soOHam(b) === 3 && b.than[1].trim() === 'right_move()';
  })());
  kiem('hamCuaEmCan đúng: 10.1 [move], 10.2 [move, turn_right], 10.3 [move], 10.4 [move, tr_right], 10.5/10.6/10.9 [move, tr_right, tr_left], 10.7 [move, tr_left, pick, drop], 10.8 [move], 10.10 [move, tr_right, tr_left, pick, drop]',
    ds.every((m) => J(m.hamCuaEmCan) === J({ '15.1': ['move'], '15.2': ['move', 'turn_right'], '15.3': ['move'], '15.4': ['move', 'tr_right'], '15.5': ['move', 'tr_right', 'tr_left'], '15.6': ['move', 'tr_right', 'tr_left'], '15.7': ['move', 'tr_left', 'pick', 'drop'], '15.8': ['move'], '15.9': ['move', 'tr_right', 'tr_left'], '15.10': ['move', 'tr_right', 'tr_left', 'pick', 'drop'] }[m.id])));
  kiem('kho lúc tới mỗi màn có đủ hàm cần: ⊆ kho thật (chạy tuần tự)', ds.every((m) => { const t = khoTruoc(m.id).map((h) => h.ten); return m.hamCuaEmCan.every((x) => t.includes(x)); }));
  kiem('lời giải 3 sao với cả tr_right / tr_left của kho thật; ô và nhịp khớp sao của đề', ds.every((m) => { const r = chamGiai(m); return r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0; }));

  // đường tắt: BFS bằng nhịp lời giải (hoặc ≤ khi có pick / drop)
  for (const m of ds) {
    const b = nhipXichNganNhat(m), r = chamGiai(m);
    const tk = m.nhipTheoLoiGiai === true;
    kiem(m.id + ' không có ĐƯỜNG TẮT: BFS ' + b.nhip + (tk ? ' ≤ ' : ' = ') + 'nhịp lời giải ' + r.soNhip + ' (sao.nhip ' + m.sao.nhip + ')',
      b.nhip !== null && !b.catNgang && r.soNhip === m.sao.nhip && (tk ? b.nhip <= m.sao.nhip : b.nhip === m.sao.nhip), J([b.nhip, r.soNhip, m.sao.nhip]));
  }
  kiem('nhipTheoLoiGiai chỉ ở màn có pick / drop (10.7, 10.10); chênh BFS đúng 1 nhịp (nâng tay của pick() gộp được vào nhịp đi)',
    ds.every((m) => (m.nhipTheoLoiGiai === true) === ['15.7', '15.10'].includes(m.id)) && ['15.7', '15.10'].every((id) => { const m = man(id); return m.sao.nhip - nhipXichNganNhat(m).nhip === 1; }));

  // 10.2: nhịp lời giải = 3 + 2 + 4: đúng 1 khúc quẹo, 2 nhịp
  kiem('10.2: một khúc quẹo phải tốn 2 nhịp: 3 ô lên + 2 nhịp quay + 4 ô sang = 9 nhịp', man('15.2').sao.nhip === 3 + 2 + 4);
  kiem('10.2: maMau chạy ra xich-quay-do + dam-tuong + chua-toi-co (học sinh thấy vì sao); turn_right() cũ chỉ quay nửa vòng',
    (() => { const m = man('15.2'), r = ChamHoc.cham(m, m.maMau, khoTruoc('15.2')); return !r.thang && ['xich-quay-do', 'dam-tuong', 'chua-toi-co'].every((c) => maCua(r).includes(c)); })());
  kiem('10.2: lời giải không dùng hàm tạo mới và không gọi turn_right() của em', (() => { const r = chamGiai(man('15.2')); return !r.hamDaDung.includes('turn_right') && r.hamDaDung.join() === 'move'; })());
  kiem('10.2: tên tr_right bị khóa cho màn sau (không tạo được ở 10.2)', (() => { const k = KhoHam.moi({ tenCoDinh: tenCotTruyen }); return k.kiemTen('tr_right', undefined, { taoHam: [] }).ma === 'ten-danh-cho-cot-truyen' && k.kiemTen('tr_right', undefined, { taoHam: ['tr_right'] }).ok; })());

  // 10.3 / 10.4 / 10.5 / 10.10: không dùng hàm quay thì tràn khung
  const trai = (ds2, tenHam, than) => ds2.flatMap((s) => (s === tenHam + '()' ? than : [s]));
  const noiLien = (id) => {
    const m = man(id);
    let chinh = m.loiGiai.chinh.slice();
    chinh = trai(chinh, 'tr_right', ['for i in range(2):', '    left_move()', '    wait()']);
    chinh = trai(chinh, 'tr_left', ['for i in range(2):', '    right_move()', '    wait()']);
    chinh = chinh.flatMap((s) => (s === 'pick()' ? ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'] : s === 'drop()' ? ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'] : [s]));
    return chinh;
  };
  for (const m of ds.filter((x) => x.canHam)) {
    const chinh = noiLien(m.id);
    const r = ChamHoc.cham(m, { chinh }, khoTruoc(m.id).filter((h) => ['move', 'forward'].includes(h.ten)));
    kiem(m.id + ' canHam ' + m.canHam + ': viết thẳng các nhịp quay (rút gọn bằng for) thì ' + KhungCode.soDong(chinh) + ' dòng > 10 ô, tran-khung, không chạy',
      m.canHam === 'tran-khung' && KhungCode.soDong(chinh) > m.khung.chinh && maCua(r).includes('tran-khung') && !r.thang && r.sao === 0, J([KhungCode.soDong(chinh), maCua(r)]));
  }
  kiem('canHam chỉ ở 10.3, 10.4, 10.5, 10.10', J(ds.filter((m) => m.canHam).map((m) => m.id)) === J(['15.3', '15.4', '15.5', '15.10']));

  // 10.5: xe bánh không tới được cờ; xích tới được
  const m85 = man('15.5'), s85 = SanHoc.docSan(m85.san);
  const duoc = (m, san, loai) => { const thay = new Set([m.batDau.x + ',' + m.batDau.y]); const q = [[m.batDau.x, m.batDau.y]]; while (q.length) { const [x, y] = q.shift(); for (const v of SanHoc.VEC) { const nx = x + v[0], ny = y + v[1]; if (!SanHoc.lyDoChan(san, loai, nx, ny) && !thay.has(nx + ',' + ny)) { thay.add(nx + ',' + ny); q.push([nx, ny]); } } } return thay; };
  kiem('10.5: cờ chỉ tới được bằng xích hoặc nhện (xe bánh bị bậc thang chặn)', duoc(m85, s85, 'xich').has(s85.co.x + ',' + s85.co.y) && duoc(m85, s85, 'nhen').has(s85.co.x + ',' + s85.co.y) && !duoc(m85, s85, 'banh').has(s85.co.x + ',' + s85.co.y));
  const m87 = man('15.7'), s87 = SanHoc.docSan(m87.san);
  kiem('10.7: ô đích chỉ tới được bằng xích (xe bánh bị bậc thang chặn)', duoc(m87, s87, 'xich').has(s87.dich[0].x + ',' + s87.dich[0].y) && !duoc(m87, s87, 'banh').has(s87.dich[0].x + ',' + s87.dich[0].y));
  const m810 = man('15.10'), s810 = SanHoc.docSan(m810.san);
  kiem('10.10: ô đích chỉ tới được bằng xích (xe bánh bị bậc thang chặn)', duoc(m810, s810, 'xich').has(s810.dich[0].x + ',' + s810.dich[0].y) && !duoc(m810, s810, 'banh').has(s810.dich[0].x + ',' + s810.dich[0].y));

  // 10.6: băng chuyền vô hại — đổi băng thành sàn thì BFS không đổi, đường vẫn đúng
  const m86 = man('15.6'), san86Phang = m86.san.map((r) => r.replace(/[<>^v]/g, '.'));
  kiem('10.6: đổi mọi băng chuyền thành sàn thì nhịp ngắn nhất và lời giải y nguyên (băng không đẩy được xích)', nhipXichNganNhat(Object.assign({}, m86, { san: san86Phang })).nhip === m86.sao.nhip && ChamHoc.cham(Object.assign({}, m86, { san: san86Phang }), m86.loiGiai, khoTruoc('15.6')).soNhip === m86.sao.nhip);
  kiem('10.6: có băng chuyền xuôi và ngược chiều với đường đi; trên đường đi có ô băng khi xe đứng quay (ô quay là băng)', /\^/.test(m86.san.join('')) && />/.test(m86.san.join('')) && /</.test(m86.san.join('')) && m86.san[3][0] === '^');
  kiem('10.6: xe bánh đi cùng chương trình đó (move + turn cũ) trên sân đó bị băng đẩy lệch hoặc lạc: không tới cờ như xích', (() => {
    const code = ChamHoc.cham(m86, m86.loiGiai, khoTruoc('15.6')).py;
    const b = SanHoc.chay({ san: m86.san, batDau: m86.batDau, loaiRobot: 'banh' }, code);
    return !b.thang;
  })());

  // 10.8: tr_sai
  const m88 = man('15.8');
  kiem('10.8: hàm của màn tr_sai (khác tên tr_right) cho sẵn bản quay thiếu một nhịp, lời giải sửa bản đó; không đè hàm của em', m88.maMau.hamCuaMan.length === 1 && m88.maMau.hamCuaMan[0].ten === 'tr_sai' && J(m88.maMau.hamCuaMan[0].than) === J(['left_move()', 'wait()']) && m88.loiGiai.hamCuaMan[0].ten === 'tr_sai' && m88.loiGiai.hamCuaEmMoi.length === 0);
  kiem('10.8: maMau KHÔNG thắng (xich-quay-do), lời giải thắng', !ChamHoc.cham(m88, m88.maMau, khoTruoc('15.8')).thang && chamGiai(m88).thang && maCua(ChamHoc.cham(m88, m88.maMau, khoTruoc('15.8'))).includes('xich-quay-do'));
  kiem('10.8: bỏ qua tr_sai, tự gọi tr_right() của em (có từ 10.3) cũng tới cờ với đúng số nhịp', (() => { const r = ChamHoc.cham(m88, { chinh: m88.loiGiai.chinh.map((s) => s.replace('tr_sai', 'tr_right')) }, khoTruoc('15.8')); return r.thang && r.soNhip === m88.sao.nhip; })());
  kiem('10.8: sân là vòng bốn cạnh, quẹo phải ba lần, ô cờ cách ô xuất phát hai ô nhưng có tường ngăn (không đường tắt)', m88.san.length === 4 && m88.san[0].length === 4 && m88.san[1][0] === '#' && m88.san[2][0] === 'F');

  // 10.9: hai đường, xích chọn đường dài ít khúc quẹo; xe bánh chọn đường ngắn
  const m89 = man('15.9'), b89 = nhipXichNganNhat(m89);
  const demBuoc = (chuoi) => { let t = 0, tong = 0; for (const a of chuoi) { const [x, y] = TO_HOP[a.banh]; if (x === y && x !== 0) tong++; else if (x !== 0 || y !== 0) t++; } return { tien: tong, quay: t }; };
  const dem = demBuoc(b89.chuoi);
  kiem('10.9: đường nhanh nhất của xích (BFS ' + b89.nhip + ' nhịp) đi ' + dem.tien + ' ô, DÀI hơn đường ngắn nhất theo ô (' + soOCoNganNhat(m89) + ' ô)', dem.tien > soOCoNganNhat(m89) && dem.tien === 13 && soOCoNganNhat(m89) === 7);
  kiem('10.9: lời giải đi 13 ô và 2 khúc quẹo (13 + 4 = 17 nhịp)', m89.sao.nhip === 13 + 2 * 2);
  const nganXich = ChamHoc.cham(m89, { chinh: man('15.9').loiSai[0].baiLam.chinh }, khoTruoc('15.9'));
  kiem('10.9: đường ngắn gấp khúc (7 ô, 6 khúc quẹo kể cả khúc đầu) tới cờ nhưng mất 19 nhịp > 17: chỉ 1 sao, không chẩn đoán lỗi', nganXich.thang && nganXich.soNhip === 19 && nganXich.sao === 1 && maCua(nganXich).length === 0, J([nganXich.thang, nganXich.soNhip, nganXich.sao, maCua(nganXich)]));
  // xe bánh: cùng sân, BFS cho xe bánh ưa đường ngắn
  const banhBfs = (m) => {
    const san = SanHoc.docSan(m.san); const khoa = (s) => [s.x, s.y, s.h].join();
    let lop = [{ x: m.batDau.x, y: m.batDau.y, h: m.batDau.huong }]; const thay = new Set([khoa(lop[0])]);
    for (let b = 1; b <= 100 && lop.length; b++) { const tiep = []; for (const s of lop) for (const a of ['tien', 'trai', 'phai']) {
      let { x, y, h } = s; if (a === 'tien') { const v = SanHoc.VEC[h]; if (!SanHoc.lyDoChan(san, 'banh', x + v[0], y + v[1])) { x += v[0]; y += v[1]; } } else if (a === 'trai') h = (h + 3) % 4; else h = (h + 1) % 4;
      if (san.o[y][x] === 'F') return b; const n = { x, y, h }; if (!thay.has(khoa(n))) { thay.add(khoa(n)); tiep.push(n); } } lop = tiep; }
    return null;
  };
  kiem('10.9: trên xe hai bánh (quay 1 nhịp) đường ngắn gấp khúc nhanh hơn (13 nhịp) đường dài (15 nhịp): sân này CHỈ với xích mới phải chọn đường dài', banhBfs(m89) === 13 && b89.nhip === 17 && 13 + 2 === 15);
  kiem('10.9: sân là một VÒNG (hai đường từ xuất phát tới cờ), không có đường thứ ba', (() => {
    const set = new Set(); m89.san.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '#') set.add(x + ',' + y); }));
    let e = 0; for (const k of set) { const [x, y] = k.split(',').map(Number); for (const v of SanHoc.VEC) if (set.has((x + v[0]) + ',' + (y + v[1]))) e++; }
    return e / 2 === set.size;
  })());

  // 10.10: cầu thang
  kiem('10.10: lời giải = pick, 3 bậc thang bằng for (quẹo trái, đi, quẹo phải, đi), drop; vòng lặp trong chương trình 9 ô', (() => { const m = man('15.10'); return m.loiGiai.chinh.length === 9 && m.loiGiai.chinh.includes('for i in range(3):') && m.loiGiai.chinh.includes('    tr_left()') && m.loiGiai.chinh.includes('    tr_right()') && m.loiGiai.chinh.includes('pick()') && m.loiGiai.chinh.includes('drop()'); })());
  // khai triển ra lệnh gốc cho cùng kết quả (hàm không đổi luật)
  for (const m of ds.filter((x) => x.id !== '15.8')) {
    const r = chamGiai(m);
    const raw = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten + '()').join('\n') + '\n';
    const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'xich', hamGoc: m.hamGoc, mucTieu: m.mucTieu || 'toi-co' }, raw);
    kiem(m.id + ': khai triển lời giải ra từng lệnh gốc (' + raw.split('\n').length + ' dòng) chạy ra cùng kết quả, cùng ' + r.soNhip + ' nhịp', k.thang === r.thang && k.nhip === r.soNhip && J(k.robot) === J(r.theoSan[0].robot));
  }
}

/* ====================================================== 6. CHẨN ĐOÁN CHO XÍCH + XƯỞNG HÀM */
console.log('\n== 6. Chẩn đoán xich-quay-do (thông tin) và sân thử của Xưởng hàm với xích ==');
{
  const m2 = man('15.2'), k2 = khoTruoc('15.2');
  const r = ChamHoc.cham(m2, m2.maMau, k2);
  const c = r.chanDoan.find((x) => x.ma === 'xich-quay-do');
  kiem('chẩn đoán xich-quay-do: mức thông tin (không phải lỗi), nói rõ "Xe xích cần 2 nhịp liên tiếp cùng một lệnh để quay đủ 90°"', c && c.muc === 'thong-tin' && /Xe xích cần 2 nhịp liên tiếp cùng một lệnh để quay đủ 90°/.test(c.loi), c && c.loi);
  kiem('chẩn đoán xich-quay-do nêu nhịp quay dở, bên quay, và chỉ đúng dòng lệnh gây ra (hàm turn_right, dòng 1)', c && c.nhip === 5 && c.nhipNua === 4 && /sang phải/.test(c.loi) && /left_move\(\)/.test(c.loi) && /hàm turn_right, dòng 1/.test(c.loi) && c.cho && c.cho.cot === 'hamEm' && c.cho.ten === 'turn_right', c && c.loi);
  kiem('xich-quay-do ra cùng dam-tuong (lỗi) và chua-toi-co (lỗi); chỉ xich-quay-do là thông tin', r.chanDoan.filter((x) => x.muc === 'thong-tin').map((x) => x.ma).join() === 'xich-quay-do' && r.chanDoan.filter((x) => x.muc === 'loi').map((x) => x.ma).sort().join() === 'chua-toi-co,dam-tuong');
  const cuoi = ChamHoc.cham(m2, { chinh: ['for i in range(3):', '    move()', 'turn_right()'] }, k2).chanDoan.find((x) => x.ma === 'xich-quay-do');
  kiem('chương trình hết khi còn quay dở: lời nói "kết thúc khi xe xích mới quay nửa vòng"', cuoi && cuoi.cuoi === true && /kết thúc khi xe xích mới quay nửa vòng sang phải/.test(cuoi.loi), cuoi && cuoi.loi);
  const nhieuLan = ChamHoc.cham(m2, { chinh: ['turn_right()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'move()'] }, k2).chanDoan.find((x) => x.ma === 'xich-quay-do');
  kiem('nhiều lần quay dở: báo lần đầu kèm "Chuyện này xảy ra N lần"', nhieuLan && nhieuLan.soLan === 3 && /xảy ra 3 lần/.test(nhieuLan.loi), nhieuLan && nhieuLan.loi);
  kiem('lời giải đúng không có xich-quay-do; xe bánh (màn cũ) không bao giờ có xich-quay-do', maCua(chamGiai(man('15.3'))).length === 0 && tatCa.filter((m) => m.loaiRobot !== 'xich').every((m) => !maCua(ChamHoc.cham(m, m.maMau, khoTruoc(m.id))).includes('xich-quay-do')));
  const dt = ChamHoc.cham(m2, { chinh: ['move()', 'move()', 'move()', 'move()'] }, k2).chanDoan.find((x) => x.ma === 'dam-tuong');
  kiem('dam-tuong của xích: lời nhắc nói "quay mặt hướng nào" (xích có hướng mặt như xe bánh), không nói go_*', dt && /quay mặt/.test(dt.loi) && !/go_\*/.test(dt.loi), dt && dt.loi);
  kiem('chua-toi-co của xích nói quay mặt hướng nào', (() => { const x = ChamHoc.cham(m2, { chinh: ['move()'] }, k2).chanDoan.find((y) => y.ma === 'chua-toi-co'); return x && /quay mặt hướng/.test(x.loi); })());
  // Xưởng hàm
  const k3 = khoTruoc('15.4');
  const thu1 = ChamHoc.thuHam(man('15.4'), { chinh: [] }, 'tr_right', k3, {});
  kiem('Xưởng hàm: thử tr_right() trên sân thử 5×5 mặc định: xe đứng ở (2,2), quay phải 90° (huong 1), 2 nhịp, không chẩn đoán', vt(thu1.robot) === '2,2' && thu1.robot.huong === 1 && thu1.soNhip === 2 && thu1.chanDoan.length === 0, J([thu1.robot, thu1.soNhip, maCua(thu1)]));
  const thu2 = ChamHoc.thuHam(man('15.4'), { chinh: [] }, 'turn_right', k3, {});
  kiem('Xưởng hàm: thử turn_right() cũ trên xích: xe không quay (huong 0), báo xich-quay-do kèm lời nhắc 2 nhịp', thu2.robot.huong === 0 && thu2.soNhip === 1 && maCua(thu2).includes('xich-quay-do') && /2 nhịp/.test(thu2.chanDoan.find((x) => x.ma === 'xich-quay-do').loi), J(maCua(thu2)));
  const thu3 = ChamHoc.thuHam(man('15.4'), { chinh: [] }, 'u_turn', k3, {});
  kiem('Xưởng hàm: thử u_turn() cũ trên xích: chỉ quay 90° (huong 1), không phải 180°', thu3.robot.huong === 1 && thu3.soNhip === 2);
  const thu4 = ChamHoc.thuHam(man('15.4'), { chinh: [] }, 'tr_left', tron(k3, [H('tr_left', ['right_move()', 'wait()'])]), {});
  kiem('Xưởng hàm: thử tr_left() bản thiếu một nhịp: quay dở, xich-quay-do kiểu "kết thúc"', thu4.robot.huong === 0 && maSK({ suKien: thu4.chanDoan }, 'x').length === 0 && thu4.chanDoan.some((x) => x.ma === 'xich-quay-do' && x.cuoi === true), J(maCua(thu4)));
  const thu5 = ChamHoc.thuHam(man('15.8'), { chinh: [], hamCuaMan: [H('tr_sai', ['left_move()', 'wait()'])] }, 'tr_sai', khoTruoc('15.8'), {});
  kiem('Xưởng hàm: thử tr_sai() của màn 10.8 (bản sai): quay nửa vòng, báo xich-quay-do', thu5.robot.huong === 0 && maCua(thu5).includes('xich-quay-do'));
  const thu6 = ChamHoc.thuHam(man('15.7'), { chinh: [] }, 'pick', khoTruoc('15.7'), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }] } });
  kiem('Xưởng hàm: thử pick() với vật ở ô ngay trước mũi xích (sân thử) có tay: nhặt được vật', thu6.tay && thu6.tay.cam === 1 && thu6.vat[0].trangThai === 'cam');
  // lỗi cũ vẫn còn
  const hc = ChamHoc.cham(man('15.3'), man('15.3').maMau, khoTruoc('15.3'));
  kiem('gọi tr_right() khi chưa tạo hàm: ham-chua-co, kèm lời "cần tạo nó trong Xưởng hàm"', maCua(hc).includes('ham-chua-co') && /Xưởng hàm/.test(hc.chanDoan.find((x) => x.ma === 'ham-chua-co').loi));
  kiem('10.2: lời giải chấm với kho đầy đủ (có cả tr_right, tr_left) vẫn 3 sao, không chẩn đoán', (() => { const m = man('15.2'); const day = KhoHam.moi({ tenCoDinh: tenCotTruyen }); for (const x of tatCa) { if (x.tietKiemNhip) continue; for (const h of x.loiGiai.hamCuaEmMoi) { if (!day.tim(h.ten)) day.tao(h.ten, h.thamSo, { taoHam: x.taoHam }); day.sua(h.ten, h.than); } } const q = ChamHoc.cham(m, m.loiGiai, day.ds()); return q.sao === 3 && q.chanDoan.length === 0; })());
}

/* ====================================================== 7. BẢNG 10 MÀN */
console.log('\n== 7. Bảng 10 màn chương Bánh xích ==');
{
  console.log('  màn  | sân | tay | ô  | nhịp | BFS | hàng     | tạo hàm  | lời giải');
  for (const m of ds) {
    const r = chamGiai(m), b = nhipXichNganNhat(m);
    console.log('  ' + m.id.padEnd(4) + ' | ' + (m.san[0].length + '×' + m.san.length).padEnd(3) + ' | ' + (m.robot.tay ? 'kẹp' : '-').padEnd(3) + ' | ' + String(r.soO).padEnd(2) + ' | ' + String(r.soNhip).padEnd(4) + ' | ' + String(b.nhip).padEnd(3) + ' | ' + m.hang.padEnd(8) + ' | ' + (m.taoHam.join(', ') || '-').padEnd(8) + ' | ' + m.loiGiai.chinh.map((s) => s.replace(/^ {4}/, '· ')).join(' | '));
  }
  for (const m of ds) {
    console.log('\n  ' + m.id + ' ' + m.ten + ' [' + m.hang + (m.mucTieu === 'dua-vat' ? ', dua-vat' : '') + '] ' + m.san[0].length + '×' + m.san.length + ' · xích (' + m.batDau.x + ', ' + m.batDau.y + ') hướng ' + SanHoc.TEN_HUONG[m.batDau.huong]);
    for (const g of m.san) console.log('    ' + g);
    console.log('    đề: ' + m.deBai);
  }
  kiem('bảng đã in', true);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
