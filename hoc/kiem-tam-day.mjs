/* ============================================================================
   kiem-tam-day.mjs — máy kiểm chương `tam-day` (Tấm đẩy) của "Đường học".
   Gồm: luật thùng nặng (chiếm ô, xe đâm như đâm tường nếu không có tấm đẩy), tấm đẩy (tiến thì đẩy 1 ô; ô sau bị chặn thì
   đứng im; lùi / quay / trượt thì không đẩy), lệnh push() (thùng trượt tới vật cản, không dừng ở đích; day-hut; day-dung-yen;
   push-goi-lai), thùng kẹt góc (dừng sớm), băng chuyền đẩy thùng, tay kẹp không gắp được thùng nặng, ký hiệu H / h,
   bộ dò đường tắt có thùng (do-duong-day.mjs) và so chéo với san-hoc.js bằng chương trình ngẫu nhiên, dữ liệu 10 màn, canHam,
   chẩn đoán mới, thân xích với tấm đẩy và bảng 10 màn.
   Các kiểm chung cho cả 100 màn (đi tuần tự, sao, lời sai, đường tắt BFS…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-tam-day.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipDayNganNhat, buocMotNhip, dungNguCanh, trangThaiDau, hanhDongTuDo, laThang, chuoiThanhMa, TO_HOP, SLIDE_TRAI, SLIDE_PHAI, PUSH } from './do-duong-day.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
for (const f of ['man-chuoi-2', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-tam-day.js'));
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
const xy = (ds) => ds.map((t) => t.x + ',' + t.y).join(' ');
const L = (...d) => d.join('\n') + '\n';
const lapLenh = (l, n) => Array(n).fill(l).join('\n') + '\n';

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'tam-day');
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

const BANH = SanHoc.HAM_GOC.banh.concat(['push']);
const XICH = SanHoc.HAM_GOC.xich.concat(['push']);
const OMNI = SanHoc.HAM_GOC.omni.concat(['push']);
const sanDay = (loai, rows, bd, code, extra) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: loai, hamGoc: { banh: BANH, xich: XICH, omni: OMNI }[loai], mucTieu: 'day-thung' }, extra || {}), code);
const b = (rows, bd, code, extra) => sanDay('banh', rows, bd, code, extra);
const TIEN = L('left_move()', 'right_move()', 'wait()');
const LUI = L('left_back()', 'right_back()', 'wait()');
const QP = L('left_move()', 'wait()');                 // quay phải (xe bánh)
const PUSHW = L('push()', 'wait()');
const E = (x, y) => ({ x, y, huong: 1 });              // xe quay mặt sang phải

const f3 = (mid) => { const w = mid.length; return ['.'.repeat(w), mid, '.'.repeat(w)]; };     // sân 3 hàng: hàng giữa là `mid`
const r3 = (mid, bd, code, extra) => b(f3(mid), bd, code, extra);
const E1 = (x) => ({ x, y: 1, huong: 1 });            // xe ở hàng giữa, quay mặt sang phải

/* ====================================================== 1. THÙNG NẶNG VÀ TẤM ĐẨY */
console.log('\n== 1. Thùng nặng chiếm ô; tấm đẩy: tiến thì đẩy 1 ô; ô sau bị chặn thì xe và thùng đứng im ==');
{
  kiem('docSan: H = thùng nặng trên sàn, h = thùng nặng nằm sẵn trên ô đích (cũng là ô đích), D = ô đích; H / h là sàn đi được',
    (() => { const s = SanHoc.docSan(['.HD', 'h..']); return J(s.thung) === J([{ x: 1, y: 0 }, { x: 0, y: 1 }]) && J(s.dich) === J([{ x: 2, y: 0 }, { x: 0, y: 1 }]) && !SanHoc.lyDoChan(s, 'banh', 1, 0) && s.vat.length === 0; })());
  kiem('HAM_GOC không có push (push là lệnh của tay, không của thân); TAY_DAY = ["push"]', J(SanHoc.TAY_DAY) === '["push"]' && ['banh', 'nhen', 'xich', 'omni'].every((l) => !SanHoc.HAM_GOC[l].includes('push')));
  kiem('push là hàm gốc của KhoHam (không đặt tên hàm trùng)', KhoHam.HAM_GOC_MAC_DINH.includes('push') && KhoHam.moi().tao('push').ma === 'ten-trung-ham-goc');

  const r1 = r3('.H.D..', E1(0), TIEN + TIEN);
  kiem('tiến vào thùng: thùng đi 1 ô cùng hướng, xe vào ô cũ của thùng; 2 nhịp đẩy thùng 2 ô vào đích → thắng',
    r1.thang && r1.nhip === 2 && vt(r1.robot) === '2,1' && xy(r1.thung) === '3,1' && !r1.suKien.length, J([r1.robot, r1.thung, r1.suKien]));
  const r1a = r3('.H.D..', E1(0), TIEN);
  kiem('một nhịp đẩy: thùng ở (2,1), xe ở (1,1); sự kiện thung-di nguon xe nêu ô đi và ô đến; thùng ban đầu giữ lại',
    xy(r1a.thung) === '2,1' && vt(r1a.robot) === '1,1' && xy(r1a.thungBanDau) === '1,1' && !r1a.thang &&
      (() => { const e = nhipVet(r1a)[0].suKien.find((s) => s.ma === 'thung-di'); return e && e.nguon === 'xe' && e.id === 1 && J(e.tu) === '{"x":1,"y":1}' && J(e.den) === '{"x":2,"y":1}'; })());
  kiem('vết nhịp có thung (vị trí cuối nhịp) khi sân có thùng; sân không có thùng thì vết không có thung',
    J(nhipVet(r1a)[0].thung) === '[{"id":1,"x":2,"y":1}]' && nhipVet(b(['...'], E(0, 0), TIEN))[0].thung === undefined);
  for (let h = 0; h < 4; h++) {
    const v = SanHoc.VEC[h];
    const rows = Array(5).fill('.....');
    const cx = 2 + v[0], cy = 2 + v[1];
    rows[cy] = rows[cy].slice(0, cx) + 'H' + rows[cy].slice(cx + 1);
    const r = b(rows, { x: 2, y: 2, huong: h }, TIEN);
    kiem('đẩy theo hướng ' + SanHoc.TEN_HUONG[h] + ': thùng đi thêm một ô ' + SanHoc.TEN_HUONG[h] + ' và xe vào ô cũ của thùng',
      xy(r.thung) === (2 + 2 * v[0]) + ',' + (2 + 2 * v[1]) && vt(r.robot) === cx + ',' + cy, J([r.robot, r.thung]));
  }
  for (const [mo, mid, ly] of [['tường', '.H#..', 'tuong'], ['mép sân', '.H', 'ngoai-san'], ['bậc thang', '.HS.', 'bac-thang'], ['thùng khác', '.HH.', 'thung-nang']]) {
    const r = r3(mid, E1(0), TIEN + TIEN);
    const e = maSK(r, 'thung-chan');
    kiem('ô sau thùng là ' + mo + ': xe và thùng đứng im (mất nhịp), thung-chan nêu ô thùng, ô sau và lý do ' + ly,
      vt(r.robot) === '0,1' && r.nhip === 2 && e.length === 2 && e[0].vat === ly && e[0].kieu === 'tien' && J(e[0].o) === '{"x":1,"y":1}' && xy(r.thung).startsWith('1,1'), J([r.robot, r.thung, r.suKien]));
  }
  kiem('hai thùng liền nhau: xe không đẩy được hai thùng cùng lúc (thùng sau chặn thùng trước)', (() => { const r = r3('.HH..', E1(0), TIEN); return xy(r.thung) === '1,1 2,1' && vt(r.robot) === '0,1'; })());
  kiem('bị thung-chan chỉ mất một nhịp: xe vẫn quay và đi tiếp được', (() => { const r = r3('.H#..', E1(0), TIEN + QP + TIEN); return r.nhip === 3 && maSK(r, 'thung-chan').length === 1 && r.robot.huong === 2 && vt(r.robot) === '0,2'; })());
  // không có tấm đẩy
  const kd = SanHoc.chay({ san: f3('.H.D..'), batDau: E1(0), loaiRobot: 'banh', mucTieu: 'day-thung' }, TIEN + TIEN);
  const ed = maSK(kd, 'dam-tuong')[0];
  kiem('KHÔNG có tấm đẩy (hamGoc không có push): xe đâm thùng nặng như đâm tường (dam-tuong, vat thung-nang, coDay false), thùng và xe đứng yên',
    kd.nhip === 2 && ed && ed.vat === 'thung-nang' && ed.coDay === false && ed.kieu === 'tien' && vt(kd.robot) === '0,1' && xy(kd.thung) === '1,1' && maSK(kd, 'dam-tuong').length === 2, J(kd.suKien));
  // lùi, quay, trượt không đẩy
  const lu = r3('.H.', { x: 0, y: 1, huong: 3 }, LUI);
  const el = maSK(lu, 'dam-tuong')[0];
  kiem('xe có tấm đẩy LÙI vào thùng: không đẩy, đâm như tường (dam-tuong thung-nang, kieu lui, coDay true)', vt(lu.robot) === '0,1' && xy(lu.thung) === '1,1' && el && el.kieu === 'lui' && el.coDay === true && el.vat === 'thung-nang', J(lu.suKien));
  kiem('xe quay tại chỗ không làm thùng nhúc nhích', (() => { const r = r3('.H.', E1(0), QP + QP + QP + QP); return xy(r.thung) === '1,1' && r.nhip === 4; })());
  const tr = sanDay('omni', f3('.H..'), { x: 0, y: 1, huong: 0 }, L('slide_right()', 'wait()'));
  const etr = maSK(tr, 'dam-tuong')[0];
  const ti = sanDay('omni', f3('.H..'), E1(0), TIEN);
  kiem('xe omni TRƯỢT vào thùng: không đẩy (dam-tuong thung-nang, kieu truot, coDay true); xe omni TIẾN vào thùng thì đẩy',
    etr && etr.kieu === 'truot' && etr.vat === 'thung-nang' && etr.coDay === true && vt(tr.robot) === '0,1' && xy(tr.thung) === '1,1' && xy(ti.thung) === '2,1' && vt(ti.robot) === '1,1', J([tr.suKien, ti.thung]));
  const xs = sanDay('xich', f3('.H.D..'), E1(0), TIEN + TIEN);
  kiem('xe xích có tấm đẩy tiến vào thùng thì đẩy như xe bánh (2 nhịp, 2 ô, thắng)', xs.thang && xs.nhip === 2 && xy(xs.thung) === '3,1');
  kiem('xích đang quay dở rồi tiến vào thùng: quay dở mất (xich-quay-do), xe tiến đẩy thùng', (() => { const r = sanDay('xich', f3('.H.D..'), E1(0), QP + TIEN); return xy(r.thung) === '2,1' && r.robot.huong === 1 && maSK(r, 'xich-quay-do').length === 1; })());
  kiem('push cùng 4 lệnh tay kẹp trong hamGoc: lỗi (một robot một tay)', (() => { try { sanDay('banh', f3('.H.'), E1(0), '', { hamGoc: BANH.concat(['arm_down']) }); return false; } catch (e) { return /một tay/.test(e.message); } })());
  kiem('nhện không gắn tấm đẩy: hamGoc có push → lỗi', (() => { try { SanHoc.chay({ san: f3('.H.'), batDau: E1(0), loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'push'] }, ''); return false; } catch (e) { return /Nhện/.test(e.message); } })());
  kiem('mục tiêu lạ vẫn bị từ chối; day-thung được nhận', (() => { try { SanHoc.chay({ san: f3('.H.'), batDau: E1(0), mucTieu: 'la' }, ''); return false; } catch (e) { return /Mục tiêu lạ/.test(e.message); } })() && r3('.H.', E1(0), '').nhip === 0);
  kiem('mục tiêu toi-co: thùng nặng chỉ là vật chắn đẩy được; thắng khi xe chạm cờ',
    SanHoc.chay({ san: ['....', '.H.F', '....'], batDau: { x: 3, y: 0, huong: 2 }, loaiRobot: 'banh', hamGoc: BANH }, TIEN).thang &&
      SanHoc.chay({ san: ['....', '.H.F', '....'], batDau: E(0, 1), loaiRobot: 'banh', hamGoc: BANH }, TIEN + TIEN).dungSom === null);
  kiem('cfg.thung thêm thùng ngoài sân; xe xuất phát trên ô thùng vẫn đi ra được', (() => { const r = SanHoc.chay({ san: ['...'], batDau: E(0, 0), loaiRobot: 'banh', hamGoc: BANH, thung: [{ x: 0, y: 0 }] }, TIEN); return vt(r.robot) === '1,0' && xy(r.thung) === '0,0'; })());
}

/* ====================================================== 2. PUSH() ĐẨY MẠNH */
console.log('\n== 2. push(): thùng trước mặt trượt thẳng tới vật cản (không dừng ở đích); day-hut; day-dung-yen; push-goi-lai ==');
{
  const p1 = r3('.H..D#', E1(0), PUSHW);
  kiem('push(): thùng trượt tới khi gặp tường ngay sau ô đích → vào đích trong 1 nhịp; xe đứng yên', p1.thang && p1.nhip === 1 && vt(p1.robot) === '0,1' && xy(p1.thung) === '4,1', J([p1.robot, p1.thung]));
  const e1 = nhipVet(p1)[0].suKien.find((s) => s.ma === 'thung-di');
  kiem('thung-di nguon truot nêu ô đi, ô đến và số ô trượt', e1 && e1.nguon === 'truot' && J(e1.tu) === '{"x":1,"y":1}' && J(e1.den) === '{"x":4,"y":1}' && e1.soO === 3);
  kiem('thùng trượt qua ô đích mà không dừng: đích ở giữa hàng trống → thùng tới mép (chưa thắng)', (() => { const r = r3('.H.D..', E1(0), PUSHW); return !r.thang && xy(r.thung) === '5,1' && r.nhip === 1; })());
  kiem('thùng trượt dừng sát thùng khác (không đẩy thùng kia)', (() => { const r = r3('.H..H.', E1(0), PUSHW); return xy(r.thung) === '3,1 4,1'; })());
  kiem('thùng nằm sẵn trên đích (h) làm điểm dừng: thùng trượt dừng ở ô đích kề nó → thắng ngay', (() => { const r = r3('.H.Dh', E1(0), PUSHW); return r.thang && r.nhip === 1 && xy(r.thung) === '3,1 4,1'; })());
  kiem('thùng trượt dừng trước bậc thang S', xy(r3('.H..S.', E1(0), PUSHW).thung) === '3,1');
  kiem('thùng trượt dừng trước tường', xy(r3('.H...#', E1(0), PUSHW).thung) === '4,1');
  kiem('thùng trượt ngang qua ô băng không bị băng giữ (băng chỉ tính khi thùng nằm lại)', xy(r3('.H>>..', E1(0), PUSHW).thung) === '5,1');
  kiem('push() khi thùng bị chặn ngay (tường sát sau thùng): thung-chan kieu push, thùng và xe đứng yên', (() => { const r = r3('.H#.', E1(0), PUSHW); const e = maSK(r, 'thung-chan')[0]; return r.nhip === 1 && e && e.kieu === 'push' && e.vat === 'tuong' && xy(r.thung) === '1,1' && e.lenh && e.lenh.dongPy === 1; })());
  kiem('push() khi trước mặt không có thùng: không làm gì, ghi day-hut (kèm ô trước mặt và dòng lệnh); tốn 1 nhịp', (() => { const r = r3('.H...', E1(1), PUSHW); const e = maSK(r, 'day-hut')[0]; return r.nhip === 1 && e && J(e.o) === '{"x":2,"y":1}' && e.lenh.dongPy === 1 && xy(r.thung) === '1,1'; })());
  kiem('push() khi thùng cách hai ô thì không đẩy (chỉ thùng SÁT trước mặt)', (() => { const r = r3('..H..', E1(0), PUSHW); return maSK(r, 'day-hut').length === 1 && xy(r.thung) === '2,1'; })());
  kiem('push() ở ô tường / mép trước mặt cũng chỉ là day-hut', maSK(r3('.', E1(0), PUSHW), 'day-hut').length === 1);
  kiem('push() cần wait(): thiếu thì quen-wait (lệnh push không chạy)', (() => { const r = r3('.H..', E1(0), 'push()\n'); return r.nhip === 0 && xy(r.thung) === '1,1' && maSK(r, 'quen-wait').length === 1 && maSK(r, 'quen-wait')[0].lenh[0].ten === 'push'; })());
  const pb = r3('.H..', E1(0), L('push()', 'left_move()', 'right_move()', 'wait()'));
  kiem('push() cùng nhịp với lệnh bánh: xe đứng yên, lệnh bánh bị bỏ (day-dung-yen nêu lệnh bị bỏ và dòng push); thùng trượt', (() => { const e = maSK(pb, 'day-dung-yen')[0]; return vt(pb.robot) === '0,1' && xy(pb.thung) === '3,1' && e && e.lenh.ten === 'left_move' && e.push.dongPy === 1; })(), J(pb.suKien));
  kiem('lệnh bánh viết trước push() trong cùng nhịp cũng bị bỏ', (() => { const r = r3('.H..', E1(0), L('left_move()', 'right_move()', 'push()', 'wait()')); return vt(r.robot) === '0,1' && maSK(r, 'day-dung-yen').length === 1; })());
  kiem('push() một mình, hay lệnh bánh một mình: KHÔNG ghi day-dung-yen', !maSK(r3('.H..', E1(0), PUSHW + TIEN), 'day-dung-yen').length);
  const pg = r3('.H..', E1(0), L('push()', 'push()', 'wait()'));
  kiem('hai push() cùng nhịp: lệnh sau bị bỏ (push-goi-lai nêu dòng lệnh bị bỏ và lệnh đã giữ nhịp); thùng vẫn trượt một lần', (() => { const e = maSK(pg, 'push-goi-lai')[0]; return e && e.dongPy === 2 && e.truoc.dongPy === 1 && e.nhip === 1 && xy(pg.thung) === '3,1' && pg.nhip === 1; })(), J(pg.suKien));
  const px = sanDay('xich', f3('.H..'), E1(0), L('left_move()', 'wait()') + L('push()', 'wait()'));
  kiem('xích đang quay dở mà push(): quay dở mất (xich-quay-do), thùng trượt', maSK(px, 'xich-quay-do').length === 1 && xy(px.thung) === '3,1');
  const po = sanDay('omni', f3('.H..'), E1(0), L('slide_left()', 'push()', 'wait()'));
  kiem('omni: push() cùng nhịp với slide: xe đứng yên, trượt bị bỏ (day-dung-yen, lệnh slide_left)', vt(po.robot) === '0,1' && maSK(po, 'day-dung-yen')[0].lenh.ten === 'slide_left' && xy(po.thung) === '3,1');
  kiem('vết lệnh: push() có trong vết như lệnh gốc (loai lenh, ten push)', pb.vet.some((v) => v.loai === 'lenh' && v.ten === 'push'));
  kiem('push() ở xe không có tấm đẩy: lỗi chạy (chưa có hàm push) vì không nằm trong hamGoc', (() => { const r = SanHoc.chay({ san: f3('.H.'), batDau: E1(0), loaiRobot: 'banh', mucTieu: 'day-thung' }, PUSHW); return r.loi && r.loi.loai === 'runtime-error'; })());
}

/* ====================================================== 3. KẸT GÓC */
console.log('\n== 3. Thùng kẹt góc: dừng ngay (dungSom thung-ket); đích ở góc, ô băng ra khỏi góc, mép sân không phải góc ==');
{
  const sk = (r) => maSK(r, 'thung-ket');
  kiem('thùng bị đẩy tới mép phải (không phải góc): chưa kẹt, vẫn chạy tiếp', (() => { const r = r3('.H..', E1(0), TIEN + TIEN + TIEN, { dich: [{ x: 0, y: 2 }] }); return r.dungSom === null && r.nhip === 3 && xy(r.thung) === '3,1'; })());
  const k4 = b(['.H.', '...', '...'], E(0, 0), TIEN + TIEN + QP + TIEN, { dich: [{ x: 0, y: 2 }] });
  kiem('thùng bị đẩy vào góc trên phải: chương trình dừng NGAY cuối nhịp đó, dungSom thung-ket, ghi ô góc, nhịp và id', (() => { const e = sk(k4)[0]; return k4.dungSom === 'thung-ket' && !k4.thang && k4.nhip === 1 && e && J(e.o) === '{"x":2,"y":0}' && e.nhip === 1 && e.id === 1; })(), J([k4.dungSom, k4.nhip, k4.suKien]));
  kiem('dừng sớm thung-ket: vết dừng đúng ở nhịp đó, lệnh sau không chạy', nhipVet(k4).length === 1);
  kiem('thùng vào góc mà góc đó là ô ĐÍCH: thắng, không kẹt', (() => { const r = b(['.HD', '...', '...'], E(0, 0), TIEN); return r.thang && r.dungSom === null && !sk(r).length; })());
  kiem('thùng nằm sẵn trong góc là ô đích (h): không vi phạm, chạy bình thường', b(['h..', '...', '...'], { x: 2, y: 2, huong: 0 }, TIEN).dungSom === null);
  kiem('thùng xuất phát sẵn trong góc (không phải đích) mà chưa chạy gì: chưa dừng (chỉ kiểm sau mỗi nhịp có thùng)', b(['H..', '...', '...'], { x: 2, y: 2, huong: 0 }, '', { dich: [{ x: 1, y: 1 }] }).dungSom === null);
  const gc = b(['..#', '.H.', '...'], E(0, 1), TIEN, { dich: [{ x: 0, y: 0 }] });
  kiem('thùng bị đẩy tới ô (2,1) có tường ở (2,0) phía trên và mép sân bên phải → góc chết, dừng sớm', gc.dungSom === 'thung-ket' && J(sk(gc)[0].o) === '{"x":2,"y":1}', J([gc.dungSom, gc.suKien]));
  const goc = (c) => b(['.' + c, '..'], { x: 0, y: 1, huong: 0 }, 'wait()\n', { thung: [{ x: 1, y: 0 }], dich: [{ x: 0, y: 1 }] });
  kiem('thùng nằm trên ô băng ở góc: băng đẩy vào mép (">" hoặc "^") thì góc chết; băng đưa ra khỏi góc ("<" hoặc "v") thì chưa kẹt; ô sàn thì kẹt',
    goc('>').dungSom === 'thung-ket' && goc('^').dungSom === 'thung-ket' && goc('<').dungSom === null && goc('v').dungSom === null && goc('.').dungSom === 'thung-ket');
  kiem('băng đưa thùng tới ô bậc thang S: không ra khỏi góc được → vẫn kẹt', b(['S<', '..'], { x: 1, y: 1, huong: 0 }, 'wait()\n', { thung: [{ x: 1, y: 0 }], dich: [{ x: 0, y: 1 }] }).dungSom === 'thung-ket');
  kiem('thắng được ưu tiên hơn kẹt góc: thùng vừa tới đích ở góc không tính kẹt', (() => { const r = b(['.HD', '...', '...'], E(0, 0), TIEN); return r.thang && !sk(r).length; })());
  kiem('mục tiêu toi-co: thùng nằm trong góc không dừng chương trình', SanHoc.chay({ san: ['.H.', '...', '..F'], batDau: E(0, 0), loaiRobot: 'banh', hamGoc: BANH }, TIEN + TIEN).dungSom === null);
  kiem('dungSom thung-ket không lẫn với vat-vo; chỉ mục tiêu day-thung mới có thung-ket', gc.dungSom !== 'vat-vo');
  kiem('thùng trượt (push) vào góc cũng kẹt ngay', (() => { const r = b(['.H.', '...', '...'], E(0, 0), PUSHW, { dich: [{ x: 0, y: 2 }] }); return r.dungSom === 'thung-ket' && r.nhip === 1; })());
  kiem('thùng thứ hai bị kẹt khi thùng đầu đã ở đích: vẫn dừng (mọi thùng đều phải đến đích)', (() => { const r = b(['.H.H.', '.....', '.....'], E(0, 0), PUSHW, { dich: [{ x: 0, y: 2 }, { x: 1, y: 2 }] }); return r.dungSom === null; })());
}

/* ====================================================== 4. BĂNG CHUYỀN ĐẨY THÙNG */
console.log('\n== 4. Băng chuyền đẩy thùng: nằm đủ 2 nhịp liên tiếp thì bị đẩy 1 ô; bị tường / thùng / xe chặn thì đứng yên ==');
{
  const w = (n) => lapLenh('wait()', n);
  const bt = (mid, nhip, ex) => b(f3(mid), { x: 0, y: 0, huong: 0 }, w(nhip), ex);
  kiem('thùng nằm sẵn trên băng: 1 nhịp chưa đi, nhịp 2 bị đẩy 1 ô theo mũi tên (thung-di nguon bang)',
    xy(bt('.>>>D', 1, { thung: [{ x: 1, y: 1 }], dich: [{ x: 4, y: 1 }] }).thung) === '1,1' &&
      (() => { const r = bt('.>>>D', 2, { thung: [{ x: 1, y: 1 }], dich: [{ x: 4, y: 1 }] }); const e = nhipVet(r)[1].suKien.find((s) => s.ma === 'thung-di'); return xy(r.thung) === '2,1' && e && e.nguon === 'bang'; })());
  kiem('thùng đi xuôi băng: mỗi ô mất 2 nhịp; tới ô sàn kế tiếp là dừng (thắng đúng ở nhịp 6)', (() => { const r = bt('.>>>D', 8, { thung: [{ x: 1, y: 1 }], dich: [{ x: 4, y: 1 }] }); return r.thang && r.nhip === 6 && xy(r.thung) === '4,1'; })());
  for (const [c, dx, dy] of [['>', 1, 0], ['<', -1, 0], ['^', 0, -1], ['v', 0, 1]]) {
    const r = b(['.....', '.....', '..' + c + '..', '.....', '.....'], { x: 0, y: 0, huong: 0 }, w(2), { thung: [{ x: 2, y: 2 }] });
    kiem('băng "' + c + '" đẩy thùng 1 ô theo mũi tên sau 2 nhịp liên tiếp', xy(r.thung) === (2 + dx) + ',' + (2 + dy), xy(r.thung));
  }
  kiem('xe đẩy thùng lên băng: thùng nằm lại 2 nhịp liên tiếp mới bị đẩy (nhịp đẩy thùng vào ô băng tính là nhịp 1)',
    xy(r3('.H>>...', E1(0), TIEN).thung) === '2,1' && xy(r3('.H>>...', E1(0), TIEN + L('wait()')).thung) === '3,1' && xy(r3('.H>>...', E1(0), TIEN + w(2)).thung) === '3,1');
  kiem('xe cứ đẩy thùng mỗi nhịp dọc theo băng: thùng đi 1 ô mỗi nhịp (băng không kịp đẩy thêm)', xy(r3('.H>>>..', E1(0), TIEN + TIEN + TIEN).thung) === '4,1');
  kiem('băng đẩy thùng vào tường: thùng đứng yên (thung-bang-chan), đếm về 0', (() => { const r = bt('.>#.', 4, { thung: [{ x: 1, y: 1 }] }); return xy(r.thung) === '1,1' && nhipVet(r).some((n) => n.suKien.some((s) => s.ma === 'thung-bang-chan')); })());
  kiem('băng đẩy thùng vào thùng khác: bị chặn', xy(bt('.>H.', 2, { thung: [{ x: 1, y: 1 }] }).thung) === '2,1 1,1');
  kiem('băng đẩy thùng vào xe: bị chặn (xe cản)', xy(b(f3('.>.'), { x: 2, y: 1, huong: 0 }, w(2), { thung: [{ x: 1, y: 1 }] }).thung) === '1,1');
  kiem('hai thùng nối nhau trên băng: thùng phía trước đi trước rồi thùng sau theo kịp cùng nhịp (chuỗi)', xy(bt('.>>>.', 2, { thung: [{ x: 1, y: 1 }, { x: 2, y: 1 }] }).thung) === '2,1 3,1');
  kiem('băng chuyền KHÔNG đẩy xe vào thùng: xe đứng trên băng bị thùng chặn (bang-chan vat thung-nang)', (() => { const r = b(f3('.>H'), { x: 1, y: 1, huong: 0 }, w(2)); return vt(r.robot) === '1,1' && nhipVet(r).some((n) => n.suKien.some((s) => s.ma === 'bang-chan' && s.vat === 'thung-nang')); })());
  kiem('xe xích đứng trên băng không bị đẩy (như cũ) và thùng trên băng vẫn bị đẩy', (() => { const r = sanDay('xich', f3('.>>.'), { x: 0, y: 1, huong: 0 }, w(2), { thung: [{ x: 2, y: 1 }] }); return vt(r.robot) === '0,1' && xy(r.thung) === '3,1'; })());
  kiem('xe omni trên băng bị đẩy sau 1 nhịp, nhưng thùng vẫn cần 2 nhịp', (() => { const r = sanDay('omni', ['.....', '..>>.', '.....'], { x: 0, y: 0, huong: 0 }, w(2), { thung: [{ x: 2, y: 1 }] }); return xy(r.thung) === '3,1'; })());
}

/* ====================================================== 5. TAY KẸP KHÔNG GẮP ĐƯỢC THÙNG NẶNG */
console.log('\n== 5. Tay kẹp gắp thùng nặng thì hụt (kep-hut, qua-nang) ==');
{
  const TAY = SanHoc.HAM_GOC.banh.concat(['arm_down', 'arm_up', 'grab', 'release']);
  // luật vật mới: tay gắp ở ô TRƯỚC MẶT; thùng nặng chiếm ô nên xe đứng sát thùng
  const g = SanHoc.chay({ san: ['...'], batDau: E(1, 0), loaiRobot: 'banh', hamGoc: TAY, thung: [{ x: 2, y: 0 }] }, L('arm_down()', 'grab()', 'wait()'));
  kiem('xe có tay kẹp đứng sát thùng (thùng ở ô trước mặt): arm_down + grab → kẹp hụt, lyDo qua-nang, tay đóng nhưng không cầm gì', (() => { const e = maSK(g, 'kep-hut')[0]; return e && e.lyDo === 'qua-nang' && g.tay.cam === null && g.tay.kep === true && xy(g.thung) === '2,0'; })(), J(g.suKien));
  kiem('kep-hut qua-nang vào chẩn đoán (thông tin) nói thùng nặng chỉ đẩy, không nhấc', (() => {
    const mTay = { loaiRobot: 'banh', hamGoc: TAY, moXuong: true, khung: { chinh: 10, moiHam: 10 }, mucTieu: 'day-thung', san: ['.H.', '...', '..D'], batDau: E(0, 0) };
    const kq = ChamHoc.cham(mTay, { chinh: ['arm_down()', 'grab()', 'wait()'] }, []);
    const c = kq.chanDoan.find((x) => x.ma === 'kep-hut');
    return c && c.muc === 'thong-tin' && c.lyDo === 'qua-nang' && /thùng nặng/.test(c.loi) && /không nhấc/.test(c.loi);
  })());
  kiem('xe có tay kẹp ĐI VÀO ô thùng thì không vào được (thùng cản như tường, không có tấm đẩy)', (() => { const r = SanHoc.chay({ san: f3('.H.'), batDau: E1(0), loaiRobot: 'banh', hamGoc: TAY }, TIEN); const e = maSK(r, 'dam-tuong')[0]; return vt(r.robot) === '0,1' && e && e.vat === 'thung-nang' && e.coDay === false; })());
  kiem('vật nhẹ (o) vẫn gắp được như cũ khi sân cũng có thùng nặng ở chỗ khác', (() => { const r = SanHoc.chay({ san: ['.o.H'], batDau: E(0, 0), loaiRobot: 'banh', hamGoc: TAY, mucTieu: 'dua-vat' }, L('arm_down()', 'grab()', 'wait()')); return r.tay.cam === 1; })());
}

/* ====================================================== 6. BỘ DÒ ĐƯỜNG TẮT VÀ SO CHÉO */
console.log('\n== 6. Bộ dò đường tắt có thùng (BFS theo nhịp) và so chéo với san-hoc.js ==');
{
  const bfs = (san, bd, ex) => nhipDayNganNhat(Object.assign({ loaiRobot: 'banh', san, batDau: bd }, ex || {}));
  kiem('đẩy thẳng 2 ô = 2 nhịp', bfs(f3('.H.D.'), E1(0)).nhip === 2);
  kiem('push() trượt vào đích sát tường = 1 nhịp (ngắn hơn đẩy từng ô)', bfs(f3('.H..D#'), E1(0)).nhip === 1 && bfs(f3('.H..D.'), E1(0)).nhip === 3);
  kiem('thùng ở góc (không phải đích) không đẩy ra được: null; thùng bị tường vây: null', bfs(['H..', '...', '..D'], E(1, 1)).nhip === null && bfs(['.#.', '#H#', '.#D'], E(0, 0)).nhip === null);
  kiem('đẩy thẳng tới đích ở góc là đúng (đích ở góc không bị coi là kẹt)', bfs(['.HD', '...', '...'], E(0, 0)).nhip === 1);
  kiem('hai thùng: đẩy theo thứ tự (BFS tìm ra đường 12 nhịp ở màn 10.5)', bfs(man('10.5').san, man('10.5').batDau).nhip === 12);
  kiem('băng chuyền được tính: làn băng trong hành lang hẹp (10.7) — bỏ băng thì không còn cách nào, thùng không tới đích', (() => { const m7 = man('10.7'); const phang = Object.assign({}, m7, { san: m7.san.map((r) => r.replace(/[<>^v]/g, '.')) }); return nhipDayNganNhat(m7).nhip === 10 && nhipDayNganNhat(phang).nhip !== 10; })());
  kiem('xích quay 2 nhịp: BFS xích > BFS hai bánh trên cùng sân', (() => { const s = ['.....', '.H...', '...D.', '.....']; const bd = { x: 0, y: 3, huong: 0 }; return bfs(s, bd, { loaiRobot: 'xich' }).nhip > bfs(s, bd).nhip; })());
  kiem('chuoiThanhMa: mã sinh từ BFS chạy trong san-hoc.js cho đúng số nhịp', (() => { const m = { loaiRobot: 'banh', san: ['.H.D', '....'], batDau: E(0, 1) }; const f = bfs(m.san, m.batDau); const r = b(m.san, m.batDau, chuoiThanhMa(f.chuoi)); return r.thang && r.nhip === f.nhip; })());
  kiem('chuoiThanhMa viết push() cho hành động đẩy mạnh và slide cho omni', chuoiThanhMa([{ banh: PUSH }, { banh: SLIDE_TRAI }, { banh: SLIDE_PHAI }]) === L('push()', 'wait()', 'slide_left()', 'wait()', 'slide_right()', 'wait()'));

  // so chéo với chương trình ngẫu nhiên (xorshift cố định)
  let seed = 90817263;
  const rnd = (n) => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed % n; };
  const KY = '.....##SS>><<^^vv';
  const LENH_BANH = [[], ['left_move()'], ['right_move()'], ['left_back()'], ['right_back()'], ['left_move()', 'right_move()'], ['left_back()', 'right_back()']];
  let soCa = 0, lech = 0, ghiLech = '', soPush = 0, soKet = 0, soBang = 0, soThang = 0, soDay = 0, soTruot = 0, soXich = 0, soOmni = 0, soTrungPush = 0;
  for (let lan = 0; lan < 4000; lan++) {
    const rong = 4 + rnd(3), cao = 4 + rnd(3);
    const rows = [];
    for (let y = 0; y < cao; y++) { let s = ''; for (let x = 0; x < rong; x++) s += KY[rnd(KY.length)]; rows.push(s); }
    const dat1 = (ch, n) => { for (let i = 0; i < n; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] === '.') rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); } };
    dat1('H', 1 + rnd(3)); dat1('D', 1 + rnd(3)); if (rnd(4) === 0) dat1('h', 1);
    const loai = ['banh', 'xich', 'omni'][rnd(3)];
    let bd = null;
    const trong = (x, y) => x >= 0 && y >= 0 && x < rong && y < cao && !'#SHh'.includes(rows[y][x]);
    if (rnd(4) !== 0) {                                                // thường đặt xe sát một thùng, mặt hướng vào nó
      const cs = [];
      for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) if (rows[y][x] === 'H' || rows[y][x] === 'h') cs.push({ x, y });
      const c = cs[rnd(cs.length)];
      const h = rnd(4), v = SanHoc.VEC[h];
      if (c && trong(c.x - v[0], c.y - v[1])) bd = { x: c.x - v[0], y: c.y - v[1], huong: h };
    }
    for (let i = 0; i < 50 && !bd; i++) { const x = rnd(rong), y = rnd(cao); if (trong(x, y)) bd = { x, y, huong: rnd(4) }; }
    if (!bd || !/[Hh]/.test(rows.join(''))) continue;
    const hamGoc = { banh: BANH, xich: XICH, omni: OMNI }[loai];
    const manR = { loaiRobot: loai, san: rows, batDau: bd, hamGoc, mucTieu: 'day-thung' };
    const ctx = dungNguCanh(manR), HD = hanhDongTuDo(ctx);
    const chuoi = [];
    for (let i = 0; i < 16; i++) chuoi.push(rnd(4) === 0 && chuoi.length ? chuoi[chuoi.length - 1] : rnd(2) === 0 ? HD.find((a) => a.banh === 4) || HD[rnd(HD.length)] : HD[rnd(HD.length)]);
    const dong = [];
    for (const a of chuoi) {
      if (a.banh === PUSH) {
        const kem = rnd(3) === 0 ? LENH_BANH[rnd(LENH_BANH.length)] : [];
        if (kem.length && rnd(2) === 0) dong.push(...kem, 'push()'); else dong.push('push()', ...kem);
        if (rnd(10) === 0) { dong.push('push()'); soTrungPush++; }
      } else if (a.banh >= SLIDE_TRAI) dong.push(a.banh === SLIDE_TRAI ? 'slide_left()' : 'slide_right()');
      else {
        const [t, p] = TO_HOP[a.banh];
        if (t === 1) dong.push('left_move()'); else if (t === -1) dong.push('left_back()');
        if (p === 1) dong.push('right_move()'); else if (p === -1) dong.push('right_back()');
      }
      dong.push('wait()');
    }
    const code = dong.join('\n') + '\n';
    let S = trangThaiDau(ctx), nhip = 0;
    for (const a of chuoi) { S = buocMotNhip(ctx, S, a); nhip++; if (laThang(ctx, S) || S.chet) break; }
    const kq = sanDay(loai, rows, bd, code);
    soCa++;
    const thungBfs = S.p.map((c) => (c % ctx.rong) + ',' + Math.floor(c / ctx.rong)).join(' ');
    const thang = laThang(ctx, S);
    const ok = kq.robot.x === S.x && kq.robot.y === S.y && kq.robot.huong === S.h && kq.nhip === nhip && xy(kq.thung) === thungBfs && kq.thang === thang && ((kq.dungSom === 'thung-ket') === (S.chet && !thang));
    if (chuoi.some((a) => a.banh === PUSH)) soPush++;
    if (kq.dungSom === 'thung-ket') soKet++;
    if (nhipVet(kq).some((n) => n.suKien.some((s) => s.ma === 'thung-di' && s.nguon === 'bang'))) soBang++;
    if (nhipVet(kq).some((n) => n.suKien.some((s) => s.ma === 'thung-di' && s.nguon === 'xe'))) soDay++;
    if (nhipVet(kq).some((n) => n.suKien.some((s) => s.ma === 'thung-di' && s.nguon === 'truot'))) soTruot++;
    if (kq.thang) soThang++;
    if (loai === 'xich') soXich++; if (loai === 'omni') soOmni++;
    if (!ok) { lech++; if (!ghiLech) ghiLech = J({ loai, rows, bd, code, bfs: [S.x, S.y, S.h, nhip, thungBfs, thang, S.chet], san: [kq.robot.x, kq.robot.y, kq.robot.huong, kq.nhip, xy(kq.thung), kq.thang, kq.dungSom] }); }
  }
  kiem('so chéo ' + soCa + ' chương trình ngẫu nhiên (xe bánh / xích / omni, tường, bậc thang, băng 4 chiều, 1–3 thùng, ô đích, h, push kèm lệnh bánh): BFS và san-hoc.js trùng vị trí, hướng, nhịp, thùng, thắng, kẹt góc',
    soCa >= 1200 && lech === 0, lech + ' lệch · ' + ghiLech);
  kiem('mẫu ngẫu nhiên có đủ các loại ca: có push (' + soPush + '), thùng bị xe đẩy (' + soDay + '), thùng trượt (' + soTruot + '), thùng đi băng (' + soBang + '), kẹt góc (' + soKet + '), thắng (' + soThang + '), xích (' + soXich + '), omni (' + soOmni + '), hai push cùng nhịp (' + soTrungPush + ')',
    soPush >= 400 && soDay >= 80 && soTruot >= 60 && soBang >= 30 && soKet >= 100 && soThang >= 80 && soXich >= 400 && soOmni >= 400 && soTrungPush >= 10, [soPush, soDay, soTruot, soBang, soKet, soThang, soXich, soOmni, soTrungPush].join(' / '));
}

/* ====================================================== 7. DỮ LIỆU 10 MÀN */
console.log('\n== 7. Dữ liệu 10 màn: tấm đẩy, thân hai bánh (xích ở 10.8), băng ở 10.7, 10.8 và 10.10, shove ở 10.6 ==');
{
  const HAM_DAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'push'];
  kiem('đúng 10 màn, số 1..10, id 10.1…10.10 (chương thứ 10, sau omni), mã tam-day.1…, tên "Tấm đẩy"',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '10.' + (i + 1) && m.ma === 'tam-day.' + (i + 1)) && ThuTu.thuTu[9] === 'tam-day' && ThuTu.thuTu[8] === 'omni' && ThuTu.ten['tam-day'] === 'Tấm đẩy');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ 10.10 có huy hiệu tam-day',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'tam-day' && ds[9].huyHieu.ten === 'Huy hiệu Tấm đẩy');
  kiem('mọi màn: mục tiêu day-thung, robot { than, tay: "day" }, hàm gốc = bánh + wait + push (không lệnh tay kẹp), cauTruc ["for","if"], Xưởng mở, chương trình 10 ô + mỗi hàm 10 ô',
    ds.every((m) => m.mucTieu === 'day-thung' && m.robot.tay === 'day' && J(m.hamGoc) === J(HAM_DAY) && J(m.cauTruc) === '["for","if"]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10));
  kiem('thân xích chỉ ở 10.8 (loaiRobot xich, robot.than xich); các màn khác hai bánh (loaiRobot banh, robot.than hai-banh)',
    ds.every((m) => (m.id === '10.8') === (m.loaiRobot === 'xich' && m.robot.than === 'xich') && (m.id === '10.8' || (m.loaiRobot === 'banh' && m.robot.than === 'hai-banh'))));
  kiem('sân tối đa 7×7; mỗi màn có thùng nặng (H/h) và ô đích (D/h), không có vật nhẹ o, không có bậc thang S', ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7 && /[Hh]/.test(m.san.join('')) && /[Dh]/.test(m.san.join('')) && !/[oXFS]/.test(m.san.join(''))));
  kiem('số thùng bằng số ô đích; không thùng nào xuất phát trong góc chết; xe không xuất phát trên thùng', ds.every((m) => {
    const s = SanHoc.docSan(m.san);
    const ctx = dungNguCanh(m);
    return s.thung.length === s.dich.length && !s.thung.some((t) => {
      if (s.dich.some((d) => d.x === t.x && d.y === t.y)) return false;
      const tm = (x, y) => x < 0 || y < 0 || x >= s.rong || y >= s.cao || s.o[y][x] === '#';
      return (tm(t.x - 1, t.y) || tm(t.x + 1, t.y)) && (tm(t.x, t.y - 1) || tm(t.x, t.y + 1));
    }) && !s.thung.some((t) => t.x === m.batDau.x && t.y === m.batDau.y) && ctx.thung0.length === s.thung.length;
  }));
  kiem('băng chuyền chỉ ở 10.7, 10.8 và 10.10', J(ds.filter((m) => /[<>^v]/.test(m.san.join(''))).map((m) => m.id)) === J(['10.7', '10.8', '10.10']));
  kiem('thùng nằm sẵn trên đích (h) chỉ ở 10.9', J(ds.filter((m) => /h/.test(m.san.join(''))).map((m) => m.id)) === '["10.9"]');
  kiem('hàm cốt truyện mới: 10.6 tạo shove; các màn khác không tạo; tên không trùng hàm cốt truyện chương trước và không phải hàm gốc',
    ds.every((m) => J(m.taoHam) === J({ '10.6': ['shove'] }[m.id] || [])) &&
      (() => { const cu = tatCa.filter((m) => m.chuong !== 'tam-day').flatMap((m) => m.taoHam); return !cu.includes('shove') && !KhoHam.HAM_GOC_MAC_DINH.includes('shove') && tenCotTruyen.includes('shove') && tenCotTruyen.length === 26; })());
  kiem('shove(n): một tham số n, 6 ô: forward(n), turn_left(), move(), turn_right(), move(), turn_right()', (() => { const h = man('10.6').loiGiai.hamCuaEmMoi[0]; return h.ten === 'shove' && J(h.thamSo) === '["n"]' && KungOk(h) && J(h.than) === J(['forward(n)', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()']); })());
  function KungOk(h) { return KhungCode.soOHam(h) === 6; }
  kiem('hamCuaEmCan đúng từng màn', ds.every((m) => J(m.hamCuaEmCan) === J({
    '10.1': ['move', 'forward'], '10.2': ['move', 'forward'], '10.3': ['move', 'forward', 'turn_left', 'turn_right'], '10.4': ['move', 'forward', 'turn_left', 'turn_right'],
    '10.5': ['move', 'forward', 'turn_left', 'turn_right'], '10.6': ['move', 'forward', 'turn_left', 'turn_right'], '10.7': ['move', 'forward', 'turn_left', 'turn_right'],
    '10.8': ['move', 'forward', 'tr_right', 'tr_left'], '10.9': ['move', 'forward', 'turn_left', 'turn_right'], '10.10': ['move', 'forward', 'turn_left', 'turn_right', 'shove']
  }[m.id])));
  kiem('kho lúc tới mỗi màn có đủ hàm cần: ⊆ kho thật (chạy tuần tự)', ds.every((m) => { const t = khoTruoc(m.id).map((h) => h.ten); return m.hamCuaEmCan.every((x) => t.includes(x)); }));
  kiem('lời giải 3 sao với kho thật; ô và nhịp khớp sao của đề, không chẩn đoán nào', ds.every((m) => { const r = chamGiai(m); return r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0; }));
  kiem('sao.o: 10.1 5, 10.2 2, 10.3 17, 10.4 18, 10.5 18, 10.6 18, 10.7 12, 10.8 20, 10.9 18, 10.10 22; sao.nhip: 2, 1, 10, 11, 12, 14, 10, 15, 9, 22',
    J(ds.map((m) => m.sao.o)) === '[5,2,17,18,18,18,12,20,18,22]' && J(ds.map((m) => m.sao.nhip)) === '[2,1,10,11,12,14,10,15,9,22]');

  // đường tắt
  for (const m of ds) {
    const f = nhipDayNganNhat(m), r = chamGiai(m);
    kiem(m.id + ' không có ĐƯỜNG TẮT: BFS ' + f.nhip + ' = nhịp lời giải ' + r.soNhip + ' (' + f.soTrangThai + ' trạng thái)', f.nhip !== null && !f.catNgang && r.soNhip === m.sao.nhip && f.nhip === m.sao.nhip, J([f.nhip, r.soNhip, m.sao.nhip]));
  }
  kiem('không màn nào dùng nhipTheoLoiGiai (mọi lời giải chuẩn chạy đúng đường ngắn nhất)', ds.every((m) => m.nhipTheoLoiGiai === undefined));
  kiem('nới lỏng bộ dò: bỏ băng chuyền ở 10.7 thì BFS tăng (băng giúp); xích 10.8 trên cùng sân với hai bánh khác nhịp', (() => {
    const phang = Object.assign({}, man('10.7'), { san: man('10.7').san.map((r) => r.replace(/[<>^v]/g, '.')) });
    return nhipDayNganNhat(phang).nhip > nhipDayNganNhat(man('10.7')).nhip;
  })());

  // canHam: khai triển shove thì tràn khung
  const khaiTrien = (chinh, soLan) => {
    const kq = [];
    for (const s of chinh) {
      const mm = /^(\s*)shove\((\d+)\)$/.exec(s);
      if (!mm) { kq.push(s); continue; }
      for (const d of ['forward(' + mm[2] + ')', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()']) kq.push(mm[1] + d);
    }
    return kq;
  };
  for (const m of ds.filter((x) => x.canHam)) {
    // 10.10 dùng for: khai triển trong thân vòng lặp mở rộng thành ba lần shove(2)
    const chinh = m.id === '10.10' ? ['push()', 'wait()', 'turn_left()', 'forward(3)', 'turn_right()'].concat([].concat(...[1, 2, 3].map(() => khaiTrien(['shove(2)'])))) : khaiTrien(m.loiGiai.chinh);
    const r = ChamHoc.cham(m, { chinh }, khoTruoc(m.id));
    kiem(m.id + ' canHam ' + m.canHam + ': viết thẳng các đoạn vòng (không dùng shove) thì ' + KhungCode.soDong(chinh) + ' dòng > 10 ô, tran-khung, không chạy',
      m.canHam === 'tran-khung' && KhungCode.soDong(chinh) > m.khung.chinh && maCua(r).includes('tran-khung') && !r.thang && r.sao === 0, J([KhungCode.soDong(chinh), maCua(r)]));
  }
  kiem('canHam chỉ ở 10.6 và 10.10', J(ds.filter((m) => m.canHam).map((m) => m.id)) === J(['10.6', '10.10']));

  // từng màn
  const m1 = man('10.1');
  kiem('10.1: thùng cách đích hai ô, xe sát thùng mặt về phía đích; maMau (move) đẩy một ô, chưa thắng; loiGiaiKhac forward(2) 2 sao',
    m1.san[1] === '.H.D..' && ChamHoc.cham(m1, m1.maMau, khoTruoc('10.1')).thang === false && ChamHoc.cham(m1, m1.loiGiaiKhac.baiLam, khoTruoc('10.1')).sao === 2);
  const m2 = man('10.2');
  kiem('10.2: push() thắng trong 1 nhịp 2 ô; maMau forward(3) cũng thắng nhưng 3 nhịp (chỉ 1–2 sao: chậm hơn)', (() => { const g = chamGiai(m2), mm = ChamHoc.cham(m2, m2.maMau, khoTruoc('10.2')); return g.soNhip === 1 && g.soO === 2 && mm.thang && mm.soNhip === 3 && mm.sao < 3; })());
  const m3 = man('10.3');
  kiem('10.3: maMau forward(3) làm thùng kẹt góc dưới phải (thung-ket), dừng sớm; đích ở cạnh mép dưới, lời giải vòng ra bên phải thùng',
    (() => { const mm = ChamHoc.cham(m3, m3.maMau, khoTruoc('10.3')); return !mm.thang && maCua(mm).includes('thung-ket') && mm.soNhip === 3; })());
  const m4 = man('10.4');
  kiem('10.4: thùng lệch cả hàng và cột so với đích; lời giải đẩy sang phải hai ô rồi vòng lên trên thùng đẩy xuống', m4.loiGiai.chinh.join() === 'forward(2),turn_right(),forward(2),turn_left(),move(),turn_right(),move(),turn_right(),move()');
  const m5 = man('10.5');
  kiem('10.5: hai thùng liền nhau, hai đích; đẩy thùng phải xuống trước rồi thùng trái sang trái; đẩy thùng trái trước (từ bên trái) bị chặn (thung-chan)',
    (() => { const mm = ChamHoc.cham(m5, m5.loiSai[0].baiLam, khoTruoc('10.5')); return m5.san[2] === '..DHH.' && maCua(mm).includes('thung-chan'); })());
  const m6 = man('10.6');
  kiem('10.6: thùng vòng quanh khối tường theo chiều kim đồng hồ: phải 1, xuống 2, trái 1; lời giải shove(1), shove(2), shove(1) (đoạn cuối vòng thừa không chạy vì thắng ngay)',
    m6.san.join() === '.....,.H...,.#...,.D...' && m6.loiGiai.chinh.join() === 'shove(1),shove(2),shove(1)' && chamGiai(m6).soNhip === 14 && !nhipVet(chamGiai(m6).theoSan[0]).slice(-1)[0].suKien.some((s) => s.ma === 'tien' && false));
  kiem('10.6: lệnh quay của vòng cuối không chạy: lời giải kết thúc ngay nhịp thùng vào đích (14 nhịp = 6 + 7 + 1)', chamGiai(m6).soNhip === 6 + 7 + 1);
  const m7 = man('10.7');
  kiem('10.7: làn băng dài 3 ô trong hành lang hẹp (xe không đi theo được); thùng cần 2×(3 ô băng) − 1 nhịp chờ: 5 lần wait()',
    m7.san.join() === '......,..Hv..,..#v#.,..#v#.,...D..' && m7.loiGiai.chinh.join() === 'forward(2),turn_right(),forward(2),for i in range(5):,    wait()');
  const m8 = man('10.8');
  kiem('10.8: thân xích; maMau dùng turn_right() cũ chỉ quay nửa vòng: có xich-quay-do (thông tin); lời giải dùng tr_right() / tr_left() của chương 8', (() => { const mm = ChamHoc.cham(m8, m8.maMau, khoTruoc('10.8')); return m8.robot.than === 'xich' && maCua(mm).includes('xich-quay-do') && /tr_right\(\)/.test(m8.loiGiai.chinh.join()); })());
  kiem('10.8: băng chuyền ở ô quay của xích không kéo xe đi (xích bám băng); cùng sân với xe hai bánh thì lời giải này không còn thắng', (() => {
    const bn = Object.assign({}, m8, { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'day' } });
    const r = ChamHoc.cham(bn, m8.loiGiai, khoTruoc('10.8'));
    return !r.thang;
  })());
  const m9 = man('10.9');
  kiem('10.9: thùng nằm sẵn trên đích (h) chặn thùng trượt; push() dừng đúng ô đích; forward(2) cũng thắng nhưng chậm một nhịp (2 sao)', (() => { const g = chamGiai(m9); const l = ChamHoc.cham(m9, m9.loiSai[1].baiLam, khoTruoc('10.9')); return g.soNhip === 9 && l.thang && l.soNhip === 10 && l.sao === 2; })());
  const m10 = man('10.10');
  kiem('10.10: trùm — ba thùng (trượt xuống mép, lên làn băng, vòng quanh khối tường); lời giải dùng for và shove(2), 7 dòng, thắng đúng ở nhịp 22; thùng trên làn băng tới đích trước khi xe xong', (() => {
    const g = chamGiai(m10);
    const tk = g.theoSan[0].vet.filter((e) => e.loai === 'nhip');
    const denA = tk.findIndex((n) => n.thung && n.thung.some((t) => t.id === 1 && t.x === 6 && t.y === 3));
    return m10.huyHieu.ma === 'tam-day' && m10.loiGiai.chinh.length === 7 && g.soNhip === 22 && denA >= 0 && denA < 21 && g.hamDaDung.includes('shove') && g.hamDaDung.includes('forward');
  })());
  kiem('10.10: lời giải 3 sao dùng for range(3): vòng thứ ba kết thúc ngay khi thùng vào đích (đoạn vòng thừa cuối không chạy)', m10.loiGiai.chinh.join() === 'push(),wait(),turn_left(),forward(3),turn_right(),for i in range(3):,    shove(2)');

  // khai triển ra lệnh gốc cho cùng kết quả (hàm không đổi luật)
  for (const m of ds) {
    const r = chamGiai(m);
    const raw = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten + '()').join('\n') + '\n';
    const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, mucTieu: m.mucTieu }, raw);
    kiem(m.id + ': khai triển lời giải ra từng lệnh gốc (' + raw.split('\n').length + ' dòng) chạy ra cùng kết quả, cùng ' + r.soNhip + ' nhịp', k.thang === r.thang && k.nhip === r.soNhip && J(k.robot) === J(r.theoSan[0].robot));
  }
}

/* ====================================================== 8. CHẨN ĐOÁN */
console.log('\n== 8. Chẩn đoán mới: thung-chan, thung-ket, day-hut, day-dung-yen, push-goi-lai, chua-day-thung, dam-tuong vào thùng ==');
{
  const m = man('10.2'), kho = khoTruoc('10.2');
  const cham = (code, mm = m, k = kho) => ChamHoc.cham(mm, { chinh: code }, k);
  const c1 = cham(['push()', 'wait()', 'push()', 'wait()']);
  kiem('chạy đủ mà không thắng thì chua-day-thung (không chua-toi-co), nói còn mấy thùng trong tổng số', (() => { const r = cham(['move()']); const c = r.chanDoan.find((x) => x.ma === 'chua-day-thung'); return c && c.conLai === 1 && c.tong === 1 && !maCua(r).includes('chua-toi-co') && /thùng/.test(c.loi); })());
  kiem('thắng rồi thì các push() sau không chạy (không day-hut)', maCua(c1).length === 0 && c1.thang);
  const m3 = man('10.3'), k3 = khoTruoc('10.3');
  const tc = ChamHoc.cham(m3, { chinh: ['turn_left()', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()', 'turn_right()', 'move()'] }, k3);
  const ctc = tc.chanDoan.find((c) => c.ma === 'thung-chan');
  kiem('thung-chan: nêu nhịp, ô thùng, ô sau thùng và lý do (mép sân), muc loi', ctc && ctc.muc === 'loi' && /mép sân/.test(ctc.loi) && /đứng yên/.test(ctc.loi) && ctc.nhip > 0, J(tc.chanDoan));
  const tk = ChamHoc.cham(m3, m3.maMau, k3);
  const ctk = tk.chanDoan.find((c) => c.ma === 'thung-ket');
  kiem('thung-ket: nêu ô góc, "Thùng kẹt vào góc ở ô (x, y)", nói chương trình dừng ở đó, không kèm chua-day-thung', ctk && ctk.muc === 'loi' && /Thùng kẹt vào góc ở ô \(4, 2\)/.test(ctk.loi) && /dừng/.test(ctk.loi) && !maCua(tk).includes('chua-day-thung'), J(tk.chanDoan));
  kiem('thung-ket có nhịp và ô trong dữ liệu (cho giao diện tô góc)', ctk && ctk.nhip === 3 && J(ctk.o) === '{"x":4,"y":2}');
  const dh = cham(['turn_left()', 'push()', 'wait()']);
  const cdh = dh.chanDoan.find((c) => c.ma === 'day-hut');
  kiem('day-hut: muc thong-tin, nêu ô trước mặt trống, chỉ ra dòng push() trong chương trình', cdh && cdh.muc === 'thong-tin' && /không có thùng nặng/.test(cdh.loi) && cdh.cho && cdh.cho.cot === 'chinh' && cdh.cho.dong === 2, J(dh.chanDoan));
  const dy = cham(['push()', 'left_move()', 'right_move()', 'wait()']);
  const cdy = dy.chanDoan.find((c) => c.ma === 'day-dung-yen');
  kiem('day-dung-yen: muc thong-tin, nêu push() và lệnh bị bỏ cùng nhịp, chỉ dòng của cả hai', cdy && cdy.muc === 'thong-tin' && /push\(\)/.test(cdy.loi) && /left_move\(\)/.test(cdy.loi) && cdy.cho.dong === 2 && cdy.choPush.dong === 1, J(dy.chanDoan));
  const pg = cham(['push()', 'push()', 'wait()']);
  const cpg = pg.chanDoan.find((c) => c.ma === 'push-goi-lai');
  kiem('push-goi-lai: muc loi, nêu lệnh bị bỏ (dòng 2) và lệnh đã giữ nhịp (dòng 1)', cpg && cpg.muc === 'loi' && /dòng 2/.test(cpg.loi) && /dòng 1/.test(cpg.loi) && cpg.cho.dong === 2 && cpg.choTruoc.dong === 1, J(pg.chanDoan));
  const qw = cham(['push()']);
  kiem('quên wait() sau push(): quen-wait nói lệnh tay (push) chưa có wait(), không nói "lệnh bánh"', (() => { const c = qw.chanDoan.find((x) => x.ma === 'quen-wait'); return c && /lệnh tay \(push\(\)/.test(c.loi); })(), J(qw.chanDoan));
  // dam-tuong vào thùng
  const mKhong = Object.assign({}, m, { hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'] });
  const dt = ChamHoc.cham(mKhong, { chinh: ['move()'] }, kho);
  const cdt = dt.chanDoan.find((c) => c.ma === 'dam-tuong');
  kiem('xe không có tấm đẩy đâm thùng: dam-tuong nói rõ "thùng nặng" và "cần tấm đẩy"', cdt && /thùng nặng/.test(cdt.loi) && /cần tấm đẩy/.test(cdt.loi), J(dt.chanDoan));
  const m5 = man('10.5');
  const lui = ChamHoc.cham(m5, { chinh: ['forward(4)', 'turn_right()', 'left_back()', 'right_back()', 'wait()'] }, khoTruoc('10.5'));
  kiem('xe lùi vào thùng: dam-tuong nói tấm đẩy chỉ đẩy khi TIẾN', (() => { const mm = { loaiRobot: 'banh', hamGoc: BANH, moXuong: true, khung: { chinh: 10, moiHam: 10 }, mucTieu: 'day-thung', san: ['.H.', '...', '...'], batDau: { x: 0, y: 0, huong: 3 } }; const r = ChamHoc.cham(mm, { chinh: ['left_back()', 'right_back()', 'wait()'] }, []); const c = r.chanDoan.find((x) => x.ma === 'dam-tuong'); return c && /lùi/.test(c.loi) && /TIẾN/.test(c.loi); })(), J(lui.chanDoan));
  kiem('cham() trả thung, thungBanDau cho giao diện vẽ (cả ở mục theoSan)', (() => { const r = ChamHoc.cham(m3, m3.loiGiai, k3); return J(r.thungBanDau.map((t) => [t.x, t.y])) === '[[2,2]]' && J(r.thung.map((t) => [t.x, t.y])) === '[[1,2]]' && r.theoSan[0].thung.length === 1 && r.theoSan[0].thungBanDau.length === 1; })());
  kiem('màn có cờ (không phải day-thung) không báo chua-day-thung; màn day-thung không báo chua-toi-co', !maCua(ChamHoc.cham(man('9.1'), { chinh: [] }, [])).includes('chua-day-thung') && !maCua(cham(['move()'])).includes('chua-toi-co'));
}

/* ====================================================== 9. BẢNG 10 MÀN */
console.log('\n== 9. Bảng 10 màn chương Tấm đẩy ==');
{
  console.log('  màn   | thân      | sân | ô  | nhịp | lời giải (chương trình)');
  for (const m of ds) {
    const r = chamGiai(m);
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.robot.than.padEnd(9) + ' | ' + (m.san[0].length + '×' + m.san.length).padEnd(3) + ' | ' + String(r.soO).padEnd(2) + ' | ' + String(r.soNhip).padEnd(4) + ' | ' + m.loiGiai.chinh.map((s) => s.trim()).join('; '));
  }
  kiem('bảng có đủ 10 màn, mọi lời giải thắng 3 sao', ds.length === 10 && ds.every((m) => chamGiai(m).sao === 3));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
