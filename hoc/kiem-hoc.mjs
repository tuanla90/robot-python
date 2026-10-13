/* ============================================================================
   kiem-hoc.mjs — máy kiểm "Đường học": luật sân, khung riêng từng hàm, máy chấm,
   hàm của em (kho bền) + hàm của màn (tạm), cách đếm ô, sân thử, kho hàm, sổ chương
   (đổi thứ tự), chương vòng lặp, đi tuần tự 30 màn như một học sinh thật và bộ dò đường tắt (BFS).
   Chạy: node robotics/hoc/kiem-hoc.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const THU_MUC = day;                                              // 'day' bị che ở mục 13 (kho đầy đủ)
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
require(path.join(day, 'man-chuoi-2.js'));
const ManHoc = require(path.join(day, 'man-vong-lap.js'));      // nối cả chuỗi 1 và 2 (cùng một sổ màn)
const KhoHam = require(path.join(day, 'kho-ham.js'));
const MAU = require(path.join(day, 'thu-vien-mau.js'));          // bộ hàm của em mẫu (mảng)

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);

/* ------------------------------------------------------------ tiện ích sân */

const san9 = (...dong) => dong;
const TRONG = ['.........', '.........', '.........', '.........', '.........'];
const TIEN = 'left_move()\nright_move()\nwait()\n';

function chay(rows, bd, loai, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: loai }, extra || {}), code);
}
const banh = (rows, bd, code, extra) => chay(rows, bd, 'banh', code, extra);
const nhen = (rows, bd, code, extra) => chay(rows, bd, 'nhen', code, extra);
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const vt = (r) => r.x + ',' + r.y;

/* ============================================================ 1. LUẬT SÂN */
console.log('\n== 1. Xe bánh: bảng tổ hợp hai bánh ==');
{
  const bd = { x: 4, y: 2, huong: 0 };
  const bang = [
    ['left_move()\nright_move()', 'tiến', '4,1', 0],
    ['left_back()\nright_back()', 'lùi', '4,3', 0],
    ['left_move()', 'chỉ trái tiến → quay phải', '4,2', 1],
    ['right_move()', 'chỉ phải tiến → quay trái', '4,2', 3],
    ['left_back()', 'chỉ trái lùi → quay trái', '4,2', 3],
    ['right_back()', 'chỉ phải lùi → quay phải', '4,2', 1],
    ['left_move()\nright_back()', 'trái tiến, phải lùi → quay đầu', '4,2', 2],
    ['left_back()\nright_move()', 'trái lùi, phải tiến → quay đầu', '4,2', 2],
    ['', 'không bánh nào → đứng yên', '4,2', 0]
  ];
  for (const [lenh, ten, viTri, huong] of bang) {
    const kq = banh(TRONG, bd, lenh + '\nwait()');
    kiem(ten, vt(kq.robot) === viTri && kq.robot.huong === huong && kq.nhip === 1,
      vt(kq.robot) + ' h' + kq.robot.huong + ' nhịp ' + kq.nhip);
  }
  // quay đầu rồi lùi từ hướng khác: lùi tính theo hướng mặt
  const kq = banh(TRONG, { x: 4, y: 2, huong: 1 }, 'left_back()\nright_back()\nwait()');
  kiem('lùi theo hướng mặt (đang quay phải → lùi sang trái)', vt(kq.robot) === '3,2' && kq.robot.huong === 1, vt(kq.robot));
  // lệnh bánh không tốn thời gian; wait mới tốn
  const k2 = banh(TRONG, bd, 'left_move()\nright_move()');
  kiem('lệnh bánh không tốn nhịp (chưa wait → nhịp 0)', k2.nhip === 0, String(k2.nhip));
  // vết nhịp ghi tổ hợp bánh
  const k3 = banh(TRONG, bd, TIEN);
  const n3 = nhipVet(k3)[0];
  kiem('vết nhịp ghi tổ hợp bánh {trai:1, phai:1}', n3 && n3.robot.banh.trai === 1 && n3.robot.banh.phai === 1, J(n3 && n3.robot));
  const k4 = banh(TRONG, bd, TIEN + 'wait()');
  kiem('lệnh bánh được xóa sau mỗi nhịp (nhịp sau đứng yên)', vt(k4.robot) === '4,1' && nhipVet(k4)[1].robot.banh.trai === 0, vt(k4.robot));
}

console.log('\n== 2. Xe bánh: banh-goi-lai, quen-wait, dam-tuong ==');
{
  const bd = { x: 4, y: 2, huong: 0 };
  const k = banh(TRONG, bd, 'left_move()\nleft_move()\nright_move()\nwait()');
  kiem('banh-goi-lai: ghi sự kiện, bỏ lệnh sau', maSK(k, 'banh-goi-lai').length === 1 && vt(k.robot) === '4,1', J(k.suKien));
  const ev = maSK(k, 'banh-goi-lai')[0];
  kiem('banh-goi-lai kèm bánh nào, dòng nào, nhịp nào', ev && ev.banh === 'trai' && ev.dongPy === 2 && ev.nhip === 1, J(ev));
  const k2 = banh(TRONG, bd, 'left_move()\nleft_back()\nright_back()\nwait()');
  kiem('gọi lại bánh bằng lệnh lùi cũng bị bỏ (trái tiến giữ nguyên, phải lùi) → quay đầu', k2.robot.huong === 2 && maSK(k2, 'banh-goi-lai').length === 1, J(k2.robot));
  const k3 = banh(TRONG, bd, 'left_move()\nwait()\nleft_move()\nwait()');
  kiem('cùng bánh ở hai nhịp khác nhau: không phải gọi lại', maSK(k3, 'banh-goi-lai').length === 0);

  const q = banh(TRONG, bd, 'left_move()\nright_move()');
  kiem('quen-wait: ghi sự kiện, lệnh KHÔNG chạy', maSK(q, 'quen-wait').length === 1 && vt(q.robot) === '4,2' && q.nhip === 0, J(q.suKien));
  kiem('quen-wait liệt kê các lệnh còn treo', maSK(q, 'quen-wait')[0].lenh.length === 2);
  const q2 = banh(TRONG, bd, TIEN);
  kiem('có wait cuối thì không quen-wait', maSK(q2, 'quen-wait').length === 0);
  const q3 = banh(TRONG, bd, TIEN + 'left_move()');
  kiem('wait rồi lại ra lệnh mà không wait → quen-wait', maSK(q3, 'quen-wait').length === 1 && vt(q3.robot) === '4,1');

  const t = banh(['.........', '....#....', '.........', '.........', '.........'], { x: 4, y: 2, huong: 0 }, TIEN + 'left_move()\nwait()\n' + TIEN);
  // tiến vào (4,1)? tường ở (4,1) → đứng yên; sau đó quay phải rồi tiến
  kiem('dam-tuong (tường): đứng yên, nhịp vẫn tính, chạy tiếp',
    vt(t.robot) === '5,2' && t.robot.huong === 1 && t.nhip === 3 && maSK(t, 'dam-tuong').length === 1, J(t.robot) + ' nhịp ' + t.nhip);
  const e = maSK(t, 'dam-tuong')[0];
  kiem('dam-tuong kèm nhịp và ô định đi tới', e.nhip === 1 && e.den.x === 4 && e.den.y === 1 && e.vat === 'tuong', J(e));
  const o = banh(TRONG, { x: 0, y: 0, huong: 0 }, TIEN);
  kiem('dam-tuong (ra ngoài sân)', maSK(o, 'dam-tuong')[0] && maSK(o, 'dam-tuong')[0].vat === 'ngoai-san' && vt(o.robot) === '0,0' && o.nhip === 1, J(o.suKien));
  const o2 = banh(TRONG, { x: 0, y: 0, huong: 1 }, 'left_back()\nright_back()\nwait()');
  kiem('dam-tuong khi lùi ra ngoài sân', maSK(o2, 'dam-tuong').length === 1);
  const s = banh(['.........', '....S....', '.........', '.........', '.........'], { x: 4, y: 2, huong: 0 }, TIEN);
  kiem('xe bánh không leo được bậc thang (dam-tuong, vat=bac-thang)',
    vt(s.robot) === '4,2' && maSK(s, 'dam-tuong')[0].vat === 'bac-thang' && s.nhip === 1, J(s.suKien));
}

console.log('\n== 3. Nhện: 2 nhịp mỗi ô, leo bậc thang ==');
{
  const bd = { x: 4, y: 2, huong: 0 };
  const k = nhen(TRONG, bd, 'go_up()');
  const nv = nhipVet(k);
  kiem('go_up tốn 2 nhịp', k.nhip === 2 && nv.length === 2, String(k.nhip));
  kiem('nhện sang ô mới ở CUỐI nhịp thứ 2 (nhịp 1 chưa rời ô)', vt(nv[0].robot) === '4,2' && vt(nv[1].robot) === '4,1', nv.map((n) => vt(n.robot)).join(' → '));
  const m = nhen(TRONG, bd, 'go_right()\ngo_down()\ngo_left()');
  kiem('bốn hướng go_*: phải, xuống, trái', vt(m.robot) === '4,3' && m.nhip === 6, vt(m.robot));
  const u = nhen(TRONG, bd, 'go_left()');
  kiem('go_left sang trái', vt(u.robot) === '3,2');
  const d = nhen(TRONG, bd, 'go_down()');
  kiem('go_down xuống', vt(d.robot) === '4,3');
  const w = nhen(TRONG, bd, 'wait()');
  kiem('wait của nhện = 1 nhịp đứng yên', w.nhip === 1 && vt(w.robot) === '4,2');
  const st = nhen(['.........', '....S....', '.........', '.........', '.........'], bd, 'go_up()\ngo_up()');
  kiem('nhện leo được bậc thang', vt(st.robot) === '4,0' && maSK(st, 'dam-tuong').length === 0, vt(st.robot));
  const tg = nhen(['.........', '....#....', '.........', '.........', '.........'], bd, 'go_up()\ngo_right()');
  kiem('nhện đâm tường: đứng yên, vẫn tốn 2 nhịp, chạy tiếp',
    vt(tg.robot) === '5,2' && tg.nhip === 4 && maSK(tg, 'dam-tuong').length === 1 && maSK(tg, 'dam-tuong')[0].nhip === 2, vt(tg.robot) + ' ' + tg.nhip);
  const ng = nhen(TRONG, { x: 0, y: 0, huong: 0 }, 'go_up()');
  kiem('nhện ra ngoài sân: dam-tuong', vt(ng.robot) === '0,0' && maSK(ng, 'dam-tuong')[0].vat === 'ngoai-san');
  kiem('nhện không có hướng mặt (huong không đổi)', k.robot.huong === 0 && m.robot.huong === 0);
  kiem('nhện không nhận lệnh bánh: gọi left_move → ham-chua-co qua lỗi core',
    (() => { const r = nhen(TRONG, bd, 'left_move()'); return r.loi && r.loi.loai === 'runtime-error'; })());
}

console.log('\n== 4. Băng chuyền: bảng thuận / nghịch / đứng chờ / đi ngang ==');
{
  const BANG_PHAI = ['.........', '.........', '>>>>>>>>>', '.........', '.........'];
  // xe bánh
  const th = banh(BANG_PHAI, { x: 1, y: 2, huong: 1 }, TIEN + TIEN);
  kiem('xe bánh thuận chiều băng: 3 ô / 2 nhịp', vt(th.robot) === '4,2' && th.nhip === 2, vt(th.robot));
  const ng = banh(BANG_PHAI, { x: 6, y: 2, huong: 3 }, TIEN + TIEN);
  kiem('xe bánh ngược chiều băng: 1 ô / 2 nhịp (lùi 1)', vt(ng.robot) === '5,2', vt(ng.robot));
  const ch = banh(BANG_PHAI, { x: 1, y: 2, huong: 1 }, 'wait()\nwait()');
  kiem('xe bánh đứng chờ trên băng: 1 ô / 2 nhịp', vt(ch.robot) === '2,2', vt(ch.robot));
  const ch1 = banh(BANG_PHAI, { x: 1, y: 2, huong: 1 }, 'wait()');
  kiem('một nhịp đứng chờ chưa đủ để băng đẩy', vt(ch1.robot) === '1,2');
  // nhện
  const nth = nhen(BANG_PHAI, { x: 1, y: 2, huong: 0 }, 'go_right()');
  kiem('nhện thuận chiều băng: 2 ô / 2 nhịp', vt(nth.robot) === '3,2' && nth.nhip === 2, vt(nth.robot));
  const nng = nhen(BANG_PHAI, { x: 6, y: 2, huong: 0 }, 'go_left()');
  kiem('nhện ngược chiều băng: 0 ô (kẹt tại chỗ)', vt(nng.robot) === '6,2' && nng.nhip === 2, vt(nng.robot));
  const nch = nhen(BANG_PHAI, { x: 1, y: 2, huong: 0 }, 'wait()\nwait()');
  kiem('nhện đứng chờ trên băng: 1 ô / 2 nhịp', vt(nch.robot) === '2,2', vt(nch.robot));
  // bốn chiều băng
  const doc = ['..v..', '..v..', '..v..', '..v..', '..v..'];
  const xuong = banh(doc, { x: 2, y: 0, huong: 0 }, 'wait()\nwait()');
  kiem('băng "v" đẩy xuống', vt(xuong.robot) === '2,1', vt(xuong.robot));
  const trai = banh(['<<<<<', '<<<<<', '<<<<<', '<<<<<', '<<<<<'], { x: 3, y: 2, huong: 0 }, 'wait()\nwait()');
  kiem('băng "<" đẩy sang trái', vt(trai.robot) === '2,2', vt(trai.robot));
  const len = banh(['^^^^^', '^^^^^', '^^^^^', '^^^^^', '^^^^^'], { x: 3, y: 3, huong: 0 }, 'wait()\nwait()');
  kiem('băng "^" đẩy lên', vt(len.robot) === '3,2', vt(len.robot));
  // đi ngang băng
  const ngang = ['.........', '.........', '>>>>>>>>>', '.........', '.........'];
  const nb = banh(ngang, { x: 4, y: 3, huong: 0 }, TIEN + TIEN);
  kiem('xe bánh băng ngang băng (vào rồi ra ngay): không bị trôi', vt(nb.robot) === '4,1', vt(nb.robot));
  const nb2 = banh(ngang, { x: 4, y: 3, huong: 0 }, TIEN + 'wait()');
  kiem('xe bánh vào băng rồi đứng lại thêm 1 nhịp: bị trôi 1 ô', vt(nb2.robot) === '5,2', vt(nb2.robot));
  const nb3 = banh(ngang, { x: 4, y: 3, huong: 0 }, TIEN + 'left_move()\nwait()');
  kiem('xe bánh vào băng rồi quay tại chỗ: bị trôi', vt(nb3.robot) === '5,2' && nb3.robot.huong === 1, vt(nb3.robot));
  const sn = nhen(ngang, { x: 4, y: 3, huong: 0 }, 'go_up()\ngo_up()');
  kiem('nhện đi ngang băng bị trôi 1 ô (2 nhịp đứng trên băng-hết lệnh thứ hai)', vt(sn.robot) === '5,1', vt(sn.robot));
  // chặn
  const chan = banh(['.........', '.........', '>>>>>>>>#', '.........', '.........'], { x: 7, y: 2, huong: 1 }, 'wait()\nwait()');
  kiem('băng đẩy vào tường: đứng yên', vt(chan.robot) === '7,2');
  const chan2 = banh(['>>>>>', '.....', '.....', '.....', '.....'], { x: 4, y: 0, huong: 0 }, 'wait()\nwait()');
  kiem('băng đẩy ra ngoài sân: đứng yên', vt(chan2.robot) === '4,0');
  const chan3 = banh(['>>>S.', '.....', '.....', '.....', '.....'], { x: 2, y: 0, huong: 0 }, 'wait()\nwait()');
  kiem('băng đẩy xe bánh vào bậc thang: đứng yên', vt(chan3.robot) === '2,0');
  const chan4 = nhen(['>>>S.', '.....', '.....', '.....', '.....'], { x: 2, y: 0, huong: 0 }, 'wait()\nwait()');
  kiem('băng đẩy nhện vào bậc thang: được', vt(chan4.robot) === '3,0');
  // bộ đếm
  const dem = banh(BANG_PHAI, { x: 1, y: 2, huong: 1 }, 'wait()\nwait()\nwait()\nwait()');
  kiem('bộ đếm đặt lại sau khi đẩy: 4 nhịp = 2 ô', vt(dem.robot) === '3,2', vt(dem.robot));
  const roi = banh(['>....', '.....', '.....', '.....', '.....'], { x: 0, y: 0, huong: 1 }, 'wait()\nleft_move()\nright_move()\nwait()\nwait()\nwait()');
  kiem('rời băng thì bộ đếm về 0 (không bị đẩy nốt)', vt(roi.robot) === '1,0', vt(roi.robot));
}

console.log('\n== 5. Thắng ngay khi chạm cờ; giới hạn nhịp ==');
{
  const co = ['.....', '.....', '..F..', '.....', '.....'];
  const a = banh(co, { x: 2, y: 4, huong: 0 }, TIEN + TIEN + TIEN + TIEN);
  kiem('xe tự đi tới cờ: thắng, dừng ngay (nhịp 2)', a.thang && a.nhip === 2 && vt(a.robot) === '2,2', a.nhip + ' ' + vt(a.robot));
  kiem('thắng thì chương trình dừng: vết không có lệnh sau đó', a.vet.filter((e) => e.loai === 'lenh').length === 6, String(a.vet.length));
  const b = banh(['.....', '.....', '.>F..', '.....', '.....'], { x: 1, y: 2, huong: 0 }, 'wait()\nwait()\nwait()');
  kiem('băng đẩy tới cờ: thắng ngay', b.thang && b.nhip === 2 && vt(b.robot) === '2,2', b.nhip + ' ' + vt(b.robot));
  const c = nhen(co, { x: 2, y: 4, huong: 0 }, 'go_up()\ngo_up()\ngo_up()');
  kiem('nhện tới cờ: thắng ở cuối nhịp chạm', c.thang && c.nhip === 4);
  const d = banh(co, { x: 2, y: 4, huong: 0 }, TIEN);
  kiem('chưa tới cờ thì chưa thắng', !d.thang);
  const e = banh(co, { x: 2, y: 4, huong: 0 }, 'while True:\n    wait()', { nhipToiDa: 50 });
  kiem('quá nhịp tối đa: loi qua-nhieu-nhip, đúng 50 nhịp', e.loi && e.loi.loai === 'qua-nhieu-nhip' && e.nhip === 50, J(e.loi) + ' ' + e.nhip);
  const f = banh(co, { x: 2, y: 4, huong: 0 }, 'while True:\n    wait()');
  kiem('nhipToiDa mặc định 200', f.loi && f.loi.loai === 'qua-nhieu-nhip' && f.nhip === 200, String(f.nhip));
  const g = banh(co, { x: 2, y: 4, huong: 0 }, 'while True:\n    pass');
  kiem('vòng lặp không có nhịp: ngân sách lệnh của core chặn', g.loi && g.loi.loai === 'infinite-loop', J(g.loi));
  const h = banh(co, { x: 2, y: 4, huong: 0 }, 'for i in range(3):\n    left_move()\n    right_move()\n    wait()');
  kiem('for … in range chạy được với lệnh bánh', h.thang && h.nhip === 2);
  kiem('hàm không thuộc loại robot bị từ chối khi cấu hình sai',
    (() => { try { banh(co, { x: 2, y: 4, huong: 0 }, 'wait()', { hamGoc: ['go_up'] }); return false; } catch (err) { return true; } })());
}



/* ------------------------------------------------------------ tiện ích bài làm */
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const T_MOVE = ['left_move()', 'right_move()', 'wait()'];
const dong = (n, s = 'move()') => Array(n).fill(s);
const bang = (a, b) => J(a) === J(b);
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc !== 'thong-tin').map((c) => c.ma);
/** Lấy vài hàm trong bộ hàm của em mẫu theo tên. */
const mau = (...tens) => tens.map((t) => MAU.find((h) => h.ten === t));
const EM = mau('move', 'turn_right', 'turn_left', 'u_turn');
/** Trộn hàm vào kho (đè theo tên) — bản sao, không đụng kho gốc. */
const tron = (kho, moi) => {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) {
    const i = kq.findIndex((x) => x.ten === h.ten);
    const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice());
    if (i >= 0) kq[i] = b; else kq.push(b);
  }
  return kq;
};
const dem = (s, mauTim) => s.split(mauTim).length - 1;

console.log('\n== 6. Vết: cho / ngan khi gọi lồng hàm (khung riêng từng hàm) ==');
{
  const man = ManHoc.tim('2.9');
  const kho = tron(mau('move', 'turn_right'), man.loiGiai.hamCuaEmMoi);
  const kq = ChamHoc.cham(man, man.loiGiai, kho);
  const lenh = kq.vet.filter((e) => e.loai === 'lenh');
  const l0 = lenh[0];
  kiem('lệnh đầu: left_move trong move (HÀM CỦA EM, dòng 1) trong corner (HÀM CỦA EM) gọi từ CHƯƠNG TRÌNH dòng 1',
    l0.ten === 'left_move' && bang(l0.cho, { cot: 'hamEm', dong: 1, ten: 'move' }) &&
    bang(l0.ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'hamEm', dong: 1, ten: 'corner' }]), J(l0));
  const turn = lenh.find((e) => e.ten === 'left_move' && e.ngan.length === 2 && e.ngan[1].dong === 3);
  kiem('lệnh trong turn_right (gọi từ corner dòng 3): ngan trỏ đúng dòng 3 của corner',
    turn && bang(turn.ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'hamEm', dong: 3, ten: 'corner' }]) && bang(turn.cho, { cot: 'hamEm', dong: 1, ten: 'turn_right' }), J(turn));
  const l2 = lenh.find((e) => e.ngan.length && e.ngan[0].dong === 2);
  kiem('lần gọi corner() thứ hai (CHƯƠNG TRÌNH dòng 2) có ngan[0] = chinh 2', !!l2);
  const wait0 = lenh.find((e) => e.ten === 'wait');
  kiem('wait đầu tiên nằm ở dòng 3 thân move', bang(wait0.cho, { cot: 'hamEm', dong: 3, ten: 'move' }), J(wait0.cho));
  const t0 = ChamHoc.cham(ManHoc.tim('1.1'), ManHoc.tim('1.1').loiGiai, []).vet[0];
  kiem('gọi thẳng từ chương trình: ngan rỗng, cho = chinh dòng 1', bang(t0.cho, { cot: 'chinh', dong: 1 }) && t0.ngan.length === 0, J(t0));
  const thuTu = kq.vet.map((e) => (e.loai === 'lenh' ? 'l' : 'n')).join('');
  kiem('vết xen kẽ đúng thứ tự: lệnh … nhịp (nhịp đến sau lệnh wait)', /^(l+n)+$/.test(thuTu));
  const mo = kq.vet.filter((e) => e.loai === 'nhip');
  kiem('nhịp có robot {x,y,huong,banh} và suKien', mo.every((n) => n.robot && n.robot.banh && Array.isArray(n.suKien)) && mo.length === kq.soNhip);
  // hai tầng tự dựng
  const man2 = ManHoc.tim('2.3');
  const k2 = ChamHoc.cham(man2, { chinh: ['b()', 'b()'] }, [H('a', T_MOVE), H('b', ['a()', 'a()'])]);
  const pre = k2.vet.filter((e) => e.loai === 'lenh');
  kiem('hai tầng: left_move đầu tiên ngan = [chinh 1, b dòng 1]', bang(pre[0].ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'hamEm', dong: 1, ten: 'b' }]), J(pre[0]));
  kiem('lần a() thứ hai trong b: ngan = [chinh 1, b dòng 2]', bang(pre[3].ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'hamEm', dong: 2, ten: 'b' }]), J(pre[3]));
  kiem('sau khi hàm kết thúc, ngan được rút ra (lệnh b() thứ hai: chinh 2)', pre[6].ngan[0].dong === 2, J(pre[6]));
  // ô trống giữ nguyên số thứ tự ô
  const k3 = ChamHoc.cham(man2, { chinh: ['', 'move()'] }, [H('move', ['', 'left_move()', '', 'right_move()', 'wait()'])]);
  const p3 = k3.vet.filter((e) => e.loai === 'lenh');
  kiem('ô trống vẫn tính số thứ tự: left_move ở ô 2 của move, gọi từ ô 2 của chương trình',
    bang(p3[0].cho, { cot: 'hamEm', dong: 2, ten: 'move' }) && bang(p3[0].ngan, [{ cot: 'chinh', dong: 2 }]), J(p3[0]));
  // hàm của màn có cột riêng
  const m28 = ManHoc.tim('2.8');
  const k4 = ChamHoc.cham(m28, m28.loiGiai, mau('move', 'turn_right', 'turn_left'));
  const p4 = k4.vet.filter((e) => e.loai === 'lenh');
  const lt = p4.find((e) => e.ngan.some((x) => x.cot === 'hamMan'));
  kiem('hàm của màn: ngan có cột hamMan kèm tên và dòng gọi (step_right dòng 1 → turn_right)',
    lt && bang(lt.cho, { cot: 'hamEm', dong: 1, ten: 'turn_right' }) &&
    bang(lt.ngan, [{ cot: 'chinh', dong: 3 }, { cot: 'hamMan', dong: 1, ten: 'step_right' }]), J(lt));
  const lm = p4.find((e) => e.cho.cot === 'hamEm' && e.cho.ten === 'move' && e.ngan.some((x) => x.cot === 'hamMan'));
  kiem('hàm của màn gọi move của em: cho = hamEm move, ngan = [chinh 3, hamMan step_right dòng 2]',
    lm && bang(lm.ngan, [{ cot: 'chinh', dong: 3 }, { cot: 'hamMan', dong: 2, ten: 'step_right' }]), J(lm));
}

/* ======================================================== 2. KHUNG CODE */
console.log('\n== 7. Khung code: ô riêng từng hàm, ô khóa, sai chỗ ==');
{
  const kh = { chinh: 10, moiHam: 10, khoaChinh: 0, khoaHam: 0 };
  kiem('khung mặc định 10 / 10, Xưởng mở, không còn soHam',
    bang(KhungCode.khungDayDu({}), { chinh: 10, moiHam: 10, khoaChinh: 0, khoaHam: 0, moXuong: true }));
  kiem('vừa khung: không lỗi (hàm của màn 10 ô + hàm của em 10 ô)',
    KhungCode.kiemTra(kh, { chinh: dong(10), hamCuaMan: [H('f', dong(10, 'wait()'))] }, [], [H('g', dong(10, 'wait()'))]).length === 0);
  const t = KhungCode.kiemTra({ chinh: 10 }, { chinh: dong(11) });
  kiem('tràn chương trình: tran-khung, nói rõ chương trình, cần bao nhiêu, có bao nhiêu',
    t.length === 1 && t[0].ma === 'tran-khung' && t[0].cot === 'chinh' && t[0].can === 11 && t[0].co === 10 &&
    /Chương trình/.test(t[0].loi) && /11 dòng/.test(t[0].loi) && /10 ô/.test(t[0].loi), J(t));
  const th = KhungCode.kiemTra(kh, { chinh: ['f()'], hamCuaMan: [H('f', dong(5, 'wait()')), H('goc', dong(11, 'wait()'))] });
  kiem('tràn thân một hàm của màn: nói rõ HÀM nào (cot hamMan), các hàm khác không bị tính chung',
    th.length === 1 && th[0].ma === 'tran-khung' && th[0].cot === 'hamMan' && th[0].ten === 'goc' && th[0].can === 11 && /Hàm "goc"/.test(th[0].loi), J(th));
  const the = KhungCode.kiemTra(kh, { chinh: [], hamCuaMan: [] }, [], [H('x', dong(11, 'wait()'))]);
  kiem('tràn thân một hàm của em: cot hamEm', the.length === 1 && the[0].cot === 'hamEm' && the[0].ten === 'x' && the[0].can === 11, J(the));
  kiem('mỗi hàm một khung riêng: hai hàm của màn + một hàm của em 10 dòng đều vừa',
    KhungCode.kiemTra(kh, { hamCuaMan: [H('a', dong(10, 'wait()')), H('b', dong(10, 'wait()'))] }, [], [H('c', dong(10, 'wait()'))]).length === 0);
  const k = KhungCode.kiemTra(Object.assign({}, kh, { khoaChinh: 5 }), { chinh: dong(6) });
  kiem('ô khóa chương trình: 10 ô khóa 5 → còn 5 ô', k.length === 1 && k[0].co === 5 && k[0].can === 6 && /khóa/.test(k[0].loi), J(k));
  kiem('ô khóa: đủ 5 dòng thì vừa', KhungCode.kiemTra(Object.assign({}, kh, { khoaChinh: 5 }), { chinh: dong(5) }).length === 0);
  const kk = KhungCode.kiemTra(Object.assign({}, kh, { khoaHam: 7 }), { hamCuaMan: [H('f', dong(4, 'wait()'))] });
  kiem('khoaHam trừ vào khung MỖI hàm (10 − 7 = 3)', kk.length === 1 && kk[0].ten === 'f' && kk[0].co === 3, J(kk));
  kiem('dòng trống không tính ô', KhungCode.soDong(['a', '', '  ', 'b']) === 2 &&
    KhungCode.kiemTra({ chinh: 2 }, { chinh: ['a', '', 'b', '   '] }).length === 0);
  kiem('demO = ô chương trình + ô thân các hàm đưa vào (def không tốn ô)',
    KhungCode.demO({ chinh: ['a', 'b'] }, [H('f', ['x', '', 'y']), H('g', ['z'])]) === 5);
  kiem('demO: mỗi hàm tính MỘT lần dù xuất hiện nhiều lần', KhungCode.demO({ chinh: ['a'] }, [H('f', ['x', 'y']), H('f', ['x', 'y'])]) === 3);
  const d = KhungCode.kiemTra(kh, { chinh: ['move()', 'def f():', '    move()'] });
  kiem('def-trong-chuong-trinh', d.length === 1 && d[0].ma === 'def-trong-chuong-trinh' && d[0].dong === 2, J(d));
  const d0 = KhungCode.kiemTra({ chinh: 10, moXuong: false }, { chinh: ['def f():'] });
  kiem('def trong chương trình khi chưa mở Xưởng: nói thẳng màn chưa có Xưởng hàm', /chưa có Xưởng hàm/.test(d0[0].loi));
  kiem('def trong chương trình khi Xưởng mở: chỉ cách tạo hàm ở Xưởng', /Xưởng hàm/.test(d[0].loi) && !/chưa có Xưởng/.test(d[0].loi));
  kiem('bỏ khái niệm số hàm theo màn: không còn qua-nhieu-ham / chua-mo-xuong',
    KhungCode.kiemTra({ chinh: 10, moXuong: false }, { chinh: [], hamCuaMan: [H('f', ['wait()'])] }).length === 0 &&
    KhungCode.kiemTra(kh, { hamCuaMan: [H('a', ['x']), H('b', ['x']), H('c', ['x']), H('d', ['x'])] }, [], [H('e', ['x']), H('f', ['x']), H('g', ['x'])]).length === 0);
  const tt = KhungCode.kiemTra(kh, { hamCuaMan: [H('a', ['x']), H('a', ['y'])] });
  kiem('ham-trung-ten: hai hàm của màn cùng tên', tt.length === 1 && tt[0].ma === 'ham-trung-ten' && tt[0].ten === 'a', J(tt));
  const te = KhungCode.kiemTra(kh, { hamCuaMan: [] }, [], [H('a', ['x']), H('a', ['y'])]);
  kiem('ham-trung-ten: hai hàm của em cùng tên', te.length === 1 && te[0].ma === 'ham-trung-ten', J(te));
  const tg = KhungCode.kiemTra(kh, { hamCuaMan: [H('wait', ['x'])] }, ['left_move', 'right_move', 'wait']);
  kiem('ham-trung-ten: hàm của màn trùng tên hàm gốc', tg.length === 1 && tg[0].ma === 'ham-trung-ten' && tg[0].ten === 'wait', J(tg));
  const tge = KhungCode.kiemTra(kh, { hamCuaMan: [] }, ['wait'], [H('wait', ['x'])]);
  kiem('ham-trung-ten: hàm của em trùng tên hàm gốc', tge.length === 1 && tge[0].ten === 'wait', J(tge));
  kiem('hàm của màn trùng tên hàm của em KHÔNG phải lỗi (hàm của màn che; kiemTra chỉ nhận hàm của em còn lại)',
    KhungCode.kiemTra(kh, { hamCuaMan: [H('move', ['x'])] }, ['wait'], []).length === 0);
  const nguon = require('node:fs').readFileSync(path.join(day, 'khung-code.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  kiem('mã cũ biến mất khỏi khung-code.js: chua-mo-xuong, qua-nhieu-ham, soHam, thuvien, cot ham',
    !/chua-mo-xuong|qua-nhieu-ham|soHam|thuvien|'ham'/.test(nguon));
  kiem('lời tràn khung có gợi ý hướng khi Xưởng mở', /lặp lại/.test(KhungCode.kiemTra({ chinh: 2 }, { chinh: dong(3) })[0].loi));
  kiem('lời tràn khung KHÔNG nói đáp án (không nêu tên hàm cụ thể)', !/move|turn|def /.test(KhungCode.kiemTra({ chinh: 2 }, { chinh: dong(3) })[0].loi));
  kiem('lời tràn khung ở màn chưa mở Xưởng không gợi ý gói hàm', !/lặp lại|Gói/.test(KhungCode.kiemTra({ chinh: 2, moXuong: false }, { chinh: dong(3) })[0].loi));
}

console.log('\n== 8. Khung code: dò hàm được gọi, ghép Python, ánh xạ, xuất .py ==');
{
  const goi = KhungCode.tenDuocGoi(['a()', '  b( 1 ) + c(2)', '# d()', 'e()  # f()', 'x = 3']);
  kiem('tenDuocGoi: lấy tên gọi hàm, bỏ chú thích', bang(goi, ['a', 'b', 'c', 'e']), J(goi));
  const em = [H('f', ['move()']), H('g', ['f()']), H('h', ['wait()']), H('move', ['wait()'])];
  const tap = KhungCode.tapHamDung({ chinh: ['g()'], hamCuaMan: [H('m1', ['h()']), H('m2', ['wait()'])] }, em);
  kiem('tapHamDung: đi theo lời gọi gián tiếp (g → f → move); không lấy hàm không với tới',
    bang(tap.em.map((x) => x.ten), ['f', 'g', 'move']) && tap.man.length === 0, J([tap.em.map((x) => x.ten), tap.man.map((x) => x.ten)]));
  const tap2 = KhungCode.tapHamDung({ chinh: ['g()'], hamCuaMan: [H('m1', ['h()']), H('m2', ['wait()'])] }, em, { tatCaHamMan: true });
  kiem('tapHamDung tatCaHamMan: mọi hàm của màn có mặt, và hàm của em mà chúng gọi tới',
    bang(tap2.man.map((x) => x.ten), ['m1', 'm2']) && tap2.em.some((x) => x.ten === 'h'), J(tap2.em.map((x) => x.ten)));
  const tap3 = KhungCode.tapHamDung({ chinh: ['move()'], hamCuaMan: [H('move', ['wait()'])] }, em);
  kiem('tapHamDung: hàm của màn che hàm của em cùng tên', bang(tap3.che, ['move']) && tap3.em.length === 0 && tap3.man.length === 1);
  const tap4 = KhungCode.tapHamDung({ chinh: ['ngoai()'] }, [H('a', ['a()'])]);
  kiem('tapHamDung: tên lạ và hàm gọi chính nó không làm treo', tap4.em.length === 0 && tap4.man.length === 0);
  const tap5 = KhungCode.tapHamDung({ chinh: ['a()'] }, [H('a', ['a()'])]);
  kiem('tapHamDung: hàm tự gọi mình chỉ có mặt một lần', tap5.em.length === 1);
  kiem('soO tĩnh = chương trình + hàm với tới được (thấy g → f → move, bỏ h và hàm của màn rỗng)',
    KhungCode.soO({ chinh: ['g()'], hamCuaMan: [H('m1', ['h()'])] }, em) === 1 + 1 + 1 + 1, String(KhungCode.soO({ chinh: ['g()'], hamCuaMan: [H('m1', ['h()'])] }, em)));

  const bai = { hamCuaMan: [H('g', ['f()', 'f()'], ['n'])], chinh: ['g(1)', '', 'f()'] };
  const ghep = KhungCode.ghep(bai, [H('move', ['left_move()', 'wait()']), H('f', ['', 'move()'])]);
  const ds = ghep.ma.split('\n');
  kiem('thứ tự: hàm của em (def + thân thụt 4) → hàm của màn → chương trình',
    ds.join('|') === 'def move():|    left_move()|    wait()|def f():||    move()|def g(n):|    f()|    f()|g(1)||f()', ds.join('|'));
  kiem('ánh xạ hàm của em: kèm tên hàm và dòng trong hàm', bang(ghep.anhXa[2], { cot: 'hamEm', ten: 'move', dong: 1 }) && bang(ghep.anhXa[3], { cot: 'hamEm', ten: 'move', dong: 2 }), J(ghep.anhXa[3]));
  kiem('ánh xạ dòng def của hàm em: dong 0 (tên hàm)', bang(ghep.anhXa[4], { cot: 'hamEm', ten: 'f', dong: 0 }), J(ghep.anhXa[4]));
  kiem('ánh xạ thân hàm theo số ô (kể cả ô trống)', bang(ghep.anhXa[5], { cot: 'hamEm', ten: 'f', dong: 1 }) && bang(ghep.anhXa[6], { cot: 'hamEm', ten: 'f', dong: 2 }), J(ghep.anhXa[6]));
  kiem('ánh xạ hàm của màn', bang(ghep.anhXa[7], { cot: 'hamMan', ten: 'g', dong: 0 }) && bang(ghep.anhXa[9], { cot: 'hamMan', ten: 'g', dong: 2 }));
  kiem('ánh xạ chương trình', bang(ghep.anhXa[10], { cot: 'chinh', dong: 1 }) && bang(ghep.anhXa[12], { cot: 'chinh', dong: 3 }));
  kiem('anhXa[0] bỏ trống (dòng Python tính từ 1)', ghep.anhXa[0] === null && ghep.anhXa.length === ds.length + 1);
  const g2 = KhungCode.ghep({ chinh: ['a'] }, []);
  kiem('không hàm nào: chỉ có chương trình', g2.ma === 'a');
  const g3 = KhungCode.ghep({ chinh: ['x'], hamCuaMan: [H('f', ['for i in range(2):', '    wait()'])] }, []);
  kiem('khối lồng trong thân thụt thêm như Python', g3.dong[1] === '    for i in range(2):' && g3.dong[2] === '        wait()', J(g3.dong));

  const py = KhungCode.xuatPy({ hamCuaMan: [], chinh: ['f()', '', 'turn_left()'] },
    [H('f', ['move()', '', 'turn_left()']), H('move', ['left_move()', 'right_move()', 'wait()']), H('turn_left', ['right_move()', 'wait()']), H('u_turn', ['turn_right()'])]);
  const pd = py.split('\n');
  kiem('xuất .py: dòng chú thích nói hàm của em dùng trong bài (kể cả gián tiếp), không có hàm không dùng',
    /^# .*f.*move.*turn_left|^# .*f, move, turn_left/.test(pd[0]) && !/u_turn/.test(py), pd[0]);
  kiem('xuất .py: có def + thân thụt 4, bỏ ô trống, rồi tới chương trình',
    py.indexOf('def f():\n    move()\n    turn_left()') > 0 && py.indexOf('def f()') < py.indexOf('f()\nturn_left()') && /\nf\(\)\nturn_left\(\)\n$/.test(py), JSON.stringify(py));
  kiem('xuất .py chép đủ hàm của em đã dùng để chạy một mình (có def move và def turn_left)', /def move\(\):\n    left_move\(\)/.test(py) && /def turn_left\(\):/.test(py));
  kiem('xuất .py kết thúc bằng xuống dòng', py.endsWith('\n'));
  kiem('xuất .py: không dùng hàm của em → chú thích nói rõ',
    /không dùng hàm nào của em/.test(KhungCode.xuatPy({ chinh: ['left_move()'] }, [H('move', ['wait()'])]).split('\n')[0]));
  const pm = KhungCode.xuatPy({ hamCuaMan: [H('move', ['wait()'])], chinh: ['move()'] }, [H('move', ['left_move()'])]);
  kiem('xuất .py: hàm của màn che hàm của em thì chỉ xuất một bản (của màn)', dem(pm, 'def move') === 1 && /def move\(\):\n    wait\(\)/.test(pm) && !/left_move/.test(pm), pm);
  const pc = KhungCode.xuatPy({ hamCuaMan: [H('step', ['move()'])], chinh: ['step()'] }, [H('move', ['wait()'])]);
  kiem('xuất .py: hàm của màn xuất kèm hàm của em mà nó gọi', /def move/.test(pc) && /def step/.test(pc) && pc.indexOf('def move') < pc.indexOf('def step'), pc);
}

/* =========================================================== 3. MÁY CHẤM */
console.log('\n== 9. Máy chấm: sao, lỗi bọc từ core, mã chẩn đoán ==');
{
  const m12 = ManHoc.tim('1.2');
  const ma = maCua;
  const ok = ChamHoc.cham(m12, m12.loiGiai, []);
  kiem('thắng đúng 3 sao (1 + ô + nhịp)', ok.thang && ok.sao === 3 && ok.soO === 9 && ok.soNhip === 3, J([ok.thang, ok.sao, ok.soO, ok.soNhip]));
  kiem('kết quả có hamDaDung (rỗng ở chuỗi 1) và chiTietO', bang(ok.hamDaDung, []) && ok.chiTietO.chinh === 9 && ok.chiTietO.ham.length === 0, J([ok.hamDaDung, ok.chiTietO]));
  const dai = ChamHoc.cham(m12, { chinh: ['wait()'].concat(m12.loiGiai.chinh) }, []);
  kiem('thắng nhưng dùng thêm ô và thêm nhịp → 1 sao', dai.thang && dai.sao === 1 && dai.soO === 10 && dai.soNhip === 4, J([dai.thang, dai.sao, dai.soO, dai.soNhip]));
  const m2 = ManHoc.tim('2.1');
  const k2 = ChamHoc.cham(Object.assign({}, m2, { sao: { o: 99, nhip: 2 } }), m2.loiGiai, []);
  kiem('chỉ đạt sao ô (không đạt sao nhịp) → 2 sao', k2.sao === 2, String(k2.sao));
  const k3 = ChamHoc.cham(Object.assign({}, m2, { sao: { o: 1, nhip: 99 } }), m2.loiGiai, []);
  kiem('chỉ đạt sao nhịp → 2 sao', k3.sao === 2);
  const r21 = ChamHoc.cham(m2, m2.loiGiai, []);
  kiem('soO tổng = ô chương trình + ô thân hàm của màn được gọi (2.1: 4 + 3), hamDaDung = [move]',
    r21.soO === 7 && bang(r21.hamDaDung, ['move']) && bang(r21.chiTietO, { chinh: 4, ham: [{ ten: 'move', cot: 'hamMan', o: 3 }] }), J([r21.soO, r21.hamDaDung, r21.chiTietO]));
  const thua = ChamHoc.cham(m12, { chinh: T_MOVE.slice() }, []);
  kiem('không thắng → 0 sao, mã chua-toi-co kèm robot ở đâu, hướng nào',
    !thua.thang && thua.sao === 0 && ma(thua).includes('chua-toi-co') &&
    thua.chanDoan[0].robot.x === 2 && /hướng lên/.test(thua.chanDoan[0].loi) && /\(2, 3\)/.test(thua.chanDoan[0].loi), J(thua.chanDoan));

  const m22 = ManHoc.tim('2.2');
  const goiMau = ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'];
  const cu = ChamHoc.cham(m22, { chinh: goiMau }, [H('move', [])]);
  kiem('loi-cu-phap: hàm của em không có thân → đổ lỗi vào phần tên hàm (dòng 0)', ma(cu).join() === 'loi-cu-phap' &&
    bang(cu.chanDoan[0].cho, { cot: 'hamEm', dong: 0, ten: 'move' }) && /chưa có dòng nào trong thân/.test(cu.chanDoan[0].loi), J(cu.chanDoan));
  const ct = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', 'right_move(', 'wait()'] }, []);
  kiem('loi-cu-phap: thiếu ngoặc, ghi dòng 2 của chương trình', ma(ct)[0] === 'loi-cu-phap' && /chương trình, dòng 2/.test(ct.chanDoan[0].loi), J(ct.chanDoan));
  const ctH = ChamHoc.cham(m22, { chinh: goiMau }, [H('move', ['left_move(', 'right_move()', 'wait()'])]);
  kiem('loi-cu-phap trong thân hàm của em: ghi tên hàm và dòng', ma(ctH)[0] === 'loi-cu-phap' && /hàm move, dòng 1/.test(ctH.chanDoan[0].loi) && ctH.chanDoan[0].cho.ten === 'move', J(ctH.chanDoan));
  const m28 = ManHoc.tim('2.8');
  const ctM = ChamHoc.cham(m28, { chinh: m28.maMau.chinh, hamCuaMan: [H('step_right', ['turn_right(', 'move()'])] }, mau('move', 'turn_right'));
  kiem('loi-cu-phap trong thân hàm của màn: ghi "hàm step_right của màn, dòng 1"',
    ma(ctM)[0] === 'loi-cu-phap' && /hàm step_right của màn, dòng 1/.test(ctM.chanDoan[0].loi) && ctM.chanDoan[0].cho.cot === 'hamMan', J(ctM.chanDoan));
  const tl = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', '  right_move()', 'wait()'] }, []);
  kiem('loi-thut-le: thụt lề thừa giữa chương trình', ma(tl)[0] === 'loi-thut-le' && tl.chanDoan[0].cho.dong === 2, J(tl.chanDoan));
  const td = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['  left_move()', 'right_move()', 'wait()'] }, []);
  kiem('loi-thut-le: dòng đầu chương trình thụt lề', ma(td)[0] === 'loi-thut-le' && /dòng đầu tiên/.test(td.chanDoan[0].loi), J(td.chanDoan));
  const tdh = ChamHoc.cham(m22, { chinh: goiMau }, [H('move', ['    left_move()', 'right_move()', 'wait()'])]);
  kiem('loi-thut-le: dòng đầu thân hàm thụt lề (thân viết ở mức 0)', ma(tdh)[0] === 'loi-thut-le' && /hàm move/.test(tdh.chanDoan[0].loi) && tdh.chanDoan[0].cho.cot === 'hamEm', J(tdh.chanDoan));
  const lc = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['x = 1 / 0'] }, []);
  kiem('loi-chay: chia cho 0, ghi chương trình + dòng', ma(lc)[0] === 'loi-chay' && /chương trình, dòng 1/.test(lc.chanDoan[0].loi), J(lc.chanDoan));
  const lcH = ChamHoc.cham(m22, { chinh: goiMau }, [H('move', ['x = 1 / 0'])]);
  kiem('loi-chay trong thân hàm của em: ghi tên hàm', ma(lcH)[0] === 'loi-chay' && /hàm move, dòng 1/.test(lcH.chanDoan[0].loi), J(lcH.chanDoan));
  const vl = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['while True:', '    pass'] }, []);
  kiem('loi-chay: vòng lặp vô tận không có nhịp', ma(vl)[0] === 'loi-chay', J(vl.chanDoan));
  const qn = ChamHoc.cham(Object.assign({}, ManHoc.tim('1.1'), { nhipToiDa: 30 }), { chinh: ['while True:', '    wait()'] }, []);
  kiem('qua-nhieu-nhip', ma(qn).join() === 'qua-nhieu-nhip' && qn.soNhip === 30 && !qn.thang, J(qn.chanDoan));
  const hc = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_back()', 'right_back()', 'wait()'] }, []);
  kiem('ham-chua-co: hàm gốc chưa mở ở màn này (left_back)', ma(hc).join() === 'ham-chua-co' && hc.chanDoan[0].ten === 'left_back' && /left_move, right_move, wait/.test(hc.chanDoan[0].loi), J(hc.chanDoan));
  const hc2 = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['move()'] }, []);
  kiem('ham-chua-co: hàm chưa tạo, màn chưa mở Xưởng → chỉ nhắc kiểm tra chính tả', ma(hc2).join() === 'ham-chua-co' && !/Xưởng hàm/.test(hc2.chanDoan[0].loi));
  const hc3 = ChamHoc.cham(ManHoc.tim('2.1'), { chinh: ['turn_right()'], hamCuaMan: [H('move', T_MOVE)] }, []);
  kiem('ham-chua-co: màn có Xưởng → nhắc tạo hàm trong Xưởng hàm; liệt kê hàm của màn', ma(hc3).join() === 'ham-chua-co' && /Xưởng hàm/.test(hc3.chanDoan[0].loi) && /Hàm của màn: move/.test(hc3.chanDoan[0].loi), hc3.chanDoan[0].loi);
  const hc3b = ChamHoc.cham(ManHoc.tim('2.3'), { chinh: ['turn_right()'] }, mau('move'));
  kiem('ham-chua-co: liệt kê hàm của em đang có để học sinh đối chiếu', /Hàm của em: move/.test(hc3b.chanDoan[0].loi), hc3b.chanDoan[0].loi);
  const hc4 = ChamHoc.cham(ManHoc.tim('2.4'), { chinh: ['turn_left()'] }, [H('turn_left', ['right_move()', 'wait()'])]);
  kiem('hàm của em có trong kho thì gọi được (không ham-chua-co)', !ma(hc4).includes('ham-chua-co'));
  const hc5 = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['move()'] }, EM);
  kiem('màn cấm hàm của em (chuỗi 1) dù kho có move: ham-chua-co và nói rõ màn không cho dùng hàm của em',
    ma(hc5).join() === 'ham-chua-co' && /không cho dùng hàm của em/.test(hc5.chanDoan[0].loi) && !hc5.thang, hc5.chanDoan[0].loi);
  const tk = ChamHoc.cham(ManHoc.tim('2.1'), { chinh: [].concat(T_MOVE, T_MOVE, T_MOVE, T_MOVE) }, []);
  kiem('tran-khung: không chạy chương trình, 0 sao, vet rỗng', ma(tk).join() === 'tran-khung' && tk.sao === 0 && tk.vet.length === 0 && !tk.thang);
  kiem('tran-khung vẫn trả soO (đếm tĩnh) để giao diện hiện', tk.soO === 12, String(tk.soO));
  const dc = ChamHoc.cham(ManHoc.tim('2.1'), { chinh: ['def f():', '    wait()'] }, []);
  kiem('def-trong-chuong-trinh qua máy chấm', ma(dc).join() === 'def-trong-chuong-trinh');
  const tn = ChamHoc.cham(ManHoc.tim('2.4'), { chinh: ['wait()'] }, [H('wait', ['wait()'])]);
  kiem('ham-trung-ten qua máy chấm: hàm của em trùng tên hàm gốc wait (khi bài gọi tới)', ma(tn).join() === 'ham-trung-ten');
  const tnk = ChamHoc.cham(ManHoc.tim('2.4'), { chinh: CHINH_24_NHAP() }, tron(mau('move', 'turn_right'), [H('hong_cu_phap', ['left_move(', 'wait()'])]));
  kiem('hàm trong kho hỏng nhưng bài không gọi tới thì không ảnh hưởng (kho dở dang không làm hỏng mọi màn)',
    tnk.thang && maLoi(tnk).length === 0, J(tnk.chanDoan));
  const dtr = ChamHoc.cham(ManHoc.tim('2.4'), { chinh: CHINH_24_NHAP() }, tron(mau('move', 'turn_right'), [H('hong', []), H('dai', dong(11, 'wait()'))]));
  kiem('hàm trong kho rỗng thân / tràn khung nhưng không ai gọi: không cản việc chấm', dtr.thang && maLoi(dtr).length === 0, J(dtr.chanDoan));
  const bg = ChamHoc.cham(ManHoc.tim('1.2'), { chinh: ['left_move()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, []);
  kiem('banh-goi-lai: lời nêu bánh, dòng, chương trình', ma(bg).includes('banh-goi-lai') && /chương trình, dòng 2/.test(bg.chanDoan.find((c) => c.ma === 'banh-goi-lai').loi), J(bg.chanDoan));
  const bgH = ChamHoc.cham(m22, { chinh: goiMau }, [H('move', ['left_move()', 'left_move()', 'right_move()', 'wait()'])]);
  kiem('banh-goi-lai trong thân hàm: ghi tên hàm và dòng', /hàm move, dòng 2/.test(bgH.chanDoan.find((c) => c.ma === 'banh-goi-lai').loi), J(bgH.chanDoan));
  const qw = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', 'right_move()'] }, []);
  kiem('quen-wait qua máy chấm', ma(qw).includes('quen-wait') && ma(qw).includes('chua-toi-co'));
  const dt = ChamHoc.cham(ManHoc.tim('1.3'), { chinh: ['right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, []);
  kiem('dam-tuong qua máy chấm: nêu nhịp và ô', ma(dt).includes('dam-tuong') && /nhịp 2/.test(dt.chanDoan.find((c) => c.ma === 'dam-tuong').loi), J(dt.chanDoan));
  const mac = [cu, ct, ctH, ctM, tl, td, tdh, lc, lcH, vl, qn, hc, hc2, hc3, hc3b, hc5, tk, dc, tn, bg, bgH, qw, dt, thua];
  kiem('lời chẩn đoán đều là tiếng Việt ngắn (≤ 330 ký tự), có muc',
    mac.every((r) => r.chanDoan.every((c) => c.loi && c.loi.length <= 330 && /[a-zà-ỹ]/.test(c.loi) && (c.muc === 'loi' || c.muc === 'thong-tin'))),
    mac.map((r) => r.chanDoan.map((c) => c.loi.length)).join('|'));
  kiem('py và anhXa được trả về cho giao diện', typeof ok.py === 'string' && ok.anhXa.length > 1);
}
function CHINH_24_NHAP() {
  return [].concat(dong(2), ['turn_right()'], dong(2), ['turn_right()'], dong(2));
}

console.log('\n== 10. Máy chấm nhiều sân ==');
{
  const man = {
    id: 'thu', loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], moXuong: false, camHamCuaEm: true, khung: { chinh: 10 }, sao: { o: 3, nhip: 1 },
    san: [['.....', '.....', '..F..', '.....', '.....'], ['.....', '..F..', '.....', '.....', '.....']],
    batDau: { x: 2, y: 3, huong: 0 }
  };
  const mot = ChamHoc.cham(man, { chinh: T_MOVE.slice() }, []);
  kiem('thắng sân 1, trượt sân 2 → không thắng', !mot.thang && mot.sao === 0 && mot.theoSan.length === 2 && mot.theoSan[0].thang && !mot.theoSan[1].thang, J(mot.theoSan.map((s) => s.thang)));
  kiem('chẩn đoán gom từ sân trượt, ghi rõ sân nào', mot.chanDoan.some((c) => c.ma === 'chua-toi-co' && /Sân 2/.test(c.loi)), J(mot.chanDoan));
  const hai = ChamHoc.cham(man, { chinh: ['for i in range(2):', '    left_move()', '    right_move()', '    wait()'] }, []);
  kiem('chạy chương trình chung: thắng cả hai sân', hai.thang && hai.theoSan.every((s) => s.thang) && hai.soNhip === 2, J(hai.theoSan.map((s) => s.soNhip)));
  kiem('vet lấy từ sân trượt (hoặc sân đầu nếu thắng hết)', J(hai.vet) === J(hai.theoSan[0].vet));
  const bdKhac = Object.assign({}, man, { batDau: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 3, huong: 0 }] });
  kiem('batDau là mảng song song với sân', ChamHoc.cham(bdKhac, { chinh: T_MOVE.slice() }, []).theoSan.length === 2);
}

console.log('\n== 11. Sân thử của Xưởng hàm (thuHam) ==');
{
  const man = ManHoc.tim('2.4');
  const tr = H('turn_right', ['left_move()', 'wait()']);
  const a = ChamHoc.thuHam(man, { chinh: [] }, 'turn_right', [tr]);
  kiem('chạy riêng turn_right: robot ở giữa sân thử 5×5 (2,2), quay phải, 1 nhịp, không chẩn đoán',
    bang(a.batDau, { x: 2, y: 2, huong: 0 }) && bang(a.robot, { x: 2, y: 2, huong: 1 }) && a.soNhip === 1 && a.chanDoan.length === 0, J(a));
  kiem('sân thử không có cờ: không báo chua-toi-co', !maCua(a).includes('chua-toi-co') && a.vet.filter((e) => e.loai === 'nhip')[0].suKien.every((s) => s.ma !== 'toi-co'));
  kiem('sân thử mặc định là 5×5 trống, xe (2,2) quay lên (đổi từ 3×3 / 41×41 cũ; cấu hình tùy ý: xem kiem-thu-ham.mjs)',
    bang(ChamHoc.SAN_THU_MAC_DINH, { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [], tuong: [] }));
  const mv = H('move', T_MOVE);
  const b = ChamHoc.thuHam(man, {}, 'move', [mv, tr]);
  kiem('chạy riêng move: tiến lên một ô (2,2)→(2,1)', bang(b.robot, { x: 2, y: 1, huong: 0 }) && b.soNhip === 1);
  const c = ChamHoc.thuHam(man, {}, 'hai', [H('hai', ['move()', 'move()']), mv]);
  kiem('tiến hai ô trên sân thử 5×5: không đâm tường, robot ở (2,0) quay lên',
    !maCua(c).includes('dam-tuong') && bang(c.robot, { x: 2, y: 0, huong: 0 }) && c.soNhip === 2, J([c.chanDoan, c.robot]));
  kiem('vết của sân thử: cho / ngan đúng cột, tên hàm, không có dòng gọi giả',
    bang(c.vet[0].cho, { cot: 'hamEm', dong: 1, ten: 'move' }) && bang(c.vet[0].ngan, [{ cot: 'hamEm', dong: 1, ten: 'hai' }]), J(c.vet[0]));
  kiem('quen-wait bắt được ở sân thử', maCua(ChamHoc.thuHam(man, {}, 'sai', [H('sai', ['left_move()', 'right_move()'])])).join() === 'quen-wait');
  const e = ChamHoc.thuHam(man, {}, 'sai', [H('sai', ['left_move()', 'left_move()', 'wait()'])]);
  kiem('banh-goi-lai ở sân thử', maCua(e).join() === 'banh-goi-lai', J(e.chanDoan));
  const f = ChamHoc.thuHam(man, {}, 'buoc', [H('buoc', ['move()', 'turn_left()', 'move()']), mv]);
  kiem('thân gọi hàm chưa tạo → ham-chua-co', maCua(f).includes('ham-chua-co'), J(f.chanDoan));
  const g = ChamHoc.thuHam(man, {}, 'lap', [H('lap', ['while True:', '    wait()'])], { nhipToiDa: 20 });
  kiem('tuyChon.nhipToiDa chặn hàm chạy mãi: qua-nhieu-nhip', maCua(g).join() === 'qua-nhieu-nhip' && g.soNhip === 20, J(g.chanDoan));
  const h = ChamHoc.thuHam(man, {}, 'tien', [H('tien', ['for i in range(n):', '    wait()'], ['n'])], { doiSo: [3] });
  kiem('hàm có đối số: truyền đối số mặc định (n = 3 → 3 nhịp)', h.soNhip === 3 && h.chanDoan.length === 0, J(h));
  const tran = ChamHoc.thuHam(man, {}, 'dai', [H('dai', dong(11, 'wait()'))]);
  kiem('hàm tràn khung riêng của nó: không chạy, báo tran-khung', maCua(tran).join() === 'tran-khung' && tran.vet.length === 0);
  const khac = ChamHoc.thuHam(man, {}, 'ngan', [H('dai', dong(11, 'wait()')), H('ngan', ['wait()'])]);
  kiem('hàm khác tràn khung thì không cản việc thử hàm này', maCua(khac).length === 0 && khac.soNhip === 1, J(khac.chanDoan));
  const hong = ChamHoc.thuHam(man, {}, 'ngan', [H('hong', []), H('ngan', ['wait()'])]);
  kiem('hàm khác dở dang (thân rỗng) trong kho không cản việc thử hàm này', maCua(hong).length === 0 && hong.soNhip === 1, J(hong.chanDoan));
  const i = ChamHoc.thuHam(man, {}, 'x', [H('x', ['left_move(', 'wait()'])]);
  kiem('lỗi cú pháp trong hàm thử: loi-cu-phap ghi đúng hàm', maCua(i).join() === 'loi-cu-phap' && /hàm x, dòng 1/.test(i.chanDoan[0].loi), J(i.chanDoan));
  const k = ChamHoc.thuHam(man, {}, 'khongco', []);
  kiem('thử hàm không tồn tại: ham-chua-co', maCua(k).join() === 'ham-chua-co');
  // hàm của màn
  const m28 = ManHoc.tim('2.8');
  const sr = H('step_right', ['turn_right()', 'move()']);
  const j = ChamHoc.thuHam(m28, { chinh: [], hamCuaMan: [sr] }, 'step_right', mau('move', 'turn_right'));
  kiem('thử được cả hàm của màn (step_right gọi hàm của em): quay phải rồi tiến → (3,2) hướng phải',
    bang(j.robot, { x: 3, y: 2, huong: 1 }) && j.soNhip === 2 && j.chanDoan.length === 0, J(j));
  kiem('vết thử hàm của màn: cho/ngan có cột hamMan', j.vet.some((x) => x.loai === 'lenh' && x.ngan.some((y) => y.cot === 'hamMan' && y.ten === 'step_right')));
  const jx = ChamHoc.thuHam(m28, { chinh: [], hamCuaMan: [sr] }, 'step_right', mau('move'));
  kiem('hàm của màn gọi hàm của em chưa có trong kho: ham-chua-co ghi đúng chỗ (hàm step_right của màn)',
    maCua(jx).includes('ham-chua-co') && /hàm step_right của màn, dòng 1/.test(jx.chanDoan[0].loi), J(jx.chanDoan));
  const jb = ChamHoc.thuHam(m28, { chinh: [], hamCuaMan: [H('step_right', dong(11, 'wait()'))] }, 'step_right', []);
  kiem('hàm của màn tràn khung: tran-khung cot hamMan', maCua(jb).join() === 'tran-khung' && jb.chanDoan[0].cot === 'hamMan');
  // hàm của màn che hàm của em
  const ch = ChamHoc.thuHam(ManHoc.tim('2.1'), { chinh: [], hamCuaMan: [H('move', T_MOVE)] }, 'move', [H('move', ['left_move()'])]);
  kiem('thử hàm bị che: chạy bản của màn, kèm chẩn đoán thông tin', bang(ch.robot, { x: 2, y: 1, huong: 0 }) && ch.chanDoan.length === 1 && ch.chanDoan[0].muc === 'thong-tin', J(ch));
  // màn cấm hàm của em
  const cam = ChamHoc.thuHam(ManHoc.tim('1.1'), {}, 'move', mau('move'));
  kiem('màn cấm hàm của em: sân thử cũng không thấy hàm của em', maCua(cam).join() === 'ham-chua-co', J(cam.chanDoan));
}

/* ===================================================== 4. 20 MÀN + ĐƯỜNG TẮT */
console.log('\n== 12. Bộ dò đường tắt (BFS trên x, y, hướng, demBang) ==');

/** Số nhịp ngắn nhất để chạm cờ. 4 hành động: tiến, quay trái, quay phải, chờ.
 *  gioiHanDong (tuỳ chọn): chỉ xét đường viết tay vừa khung — tiến 3 dòng, quay 2, chờ 1. */
function nhipNganNhat(man, gioiHanDong) {
  const san = SanHoc.docSan(man.san);
  const bd = man.batDau;
  const khoa = (s) => [s.x, s.y, s.h, s.d, s.l].join();
  let lop = [{ x: bd.x, y: bd.y, h: bd.huong, d: 0, l: 0 }];
  const thay = new Set([khoa(lop[0])]);
  for (let b = 1; b <= 400 && lop.length; b++) {
    const tiep = [];
    for (const s of lop) {
      for (const a of ['tien', 'trai', 'phai', 'cho']) {
        const gia = a === 'tien' ? 3 : a === 'cho' ? 1 : 2;
        const l = gioiHanDong ? s.l + gia : 0;
        if (gioiHanDong && l > gioiHanDong) continue;
        let { x, y, h, d } = s;
        if (a === 'tien') {
          const v = SanHoc.VEC[h];
          if (!SanHoc.lyDoChan(san, man.loaiRobot, x + v[0], y + v[1])) { x += v[0]; y += v[1]; }
        } else if (a === 'trai') h = (h + 3) % 4;
        else if (a === 'phai') h = (h + 1) % 4;
        const o = san.o[y][x];
        if (SanHoc.BANG[o] !== undefined) {
          d++;
          if (d >= 2) {
            const v = SanHoc.VEC[SanHoc.BANG[o]];
            if (!SanHoc.lyDoChan(san, man.loaiRobot, x + v[0], y + v[1])) { x += v[0]; y += v[1]; }
            d = 0;
          }
        } else d = 0;
        if (san.o[y][x] === 'F') return b;
        const n = { x, y, h, d, l };
        if (!thay.has(khoa(n))) { thay.add(khoa(n)); tiep.push(n); }
      }
    }
    lop = tiep;
  }
  return null;
}

{
  // kiểm chính bộ dò: sân tự dựng có đường tắt thì phải bắt được
  const nhoSan = { loaiRobot: 'banh', san: ['.....', '..F..', '.....', '.....', '.....'], batDau: { x: 2, y: 4, huong: 0 } };
  kiem('bộ dò: đường thẳng 3 ô = 3 nhịp', nhipNganNhat(nhoSan) === 3);
  const m24 = ManHoc.tim('2.4');
  const ho = Object.assign({}, m24, { san: ['.....', '.....', '.....', '...F.', '.....'] });
  kiem('bộ dò: bỏ tường hành lang của 2.4 thì có ĐƯỜNG TẮT (3 nhịp < ' + m24.sao.nhip + ')', nhipNganNhat(ho) === 3 && nhipNganNhat(ho) < m24.sao.nhip);
  kiem('bộ dò: hành lang 2.4 đúng nguyên bản thì không có đường tắt', nhipNganNhat(m24) === m24.sao.nhip);
  const bangMan = { loaiRobot: 'banh', san: ['.....', '.....', '.....', '>>>F.', '.....'], batDau: { x: 0, y: 4, huong: 0 } };
  kiem('bộ dò: băng chuyền được tính (đường nhanh nhất 4 nhịp, không phải 6)', nhipNganNhat(bangMan) === 4);
  const tuong = { loaiRobot: 'banh', san: ['.....', '.###.', '.#F#.', '.###.', '.....'], batDau: { x: 0, y: 0, huong: 0 } };
  kiem('bộ dò: cờ bị tường vây kín → không tới được (null)', nhipNganNhat(tuong) === null);
  const hoTrong = { loaiRobot: 'banh', san: ['.....', '.....', '.....', '>>>>F', '.....'], batDau: { x: 0, y: 4, huong: 0 } };
  kiem('bộ dò có giới hạn dòng: băng dài 4 — đường 4 nhịp cần quá 10 dòng, đường vừa khung mất 8 nhịp',
    nhipNganNhat(hoTrong) === 4 && nhipNganNhat(hoTrong, 10) === 8, nhipNganNhat(hoTrong) + ' / ' + nhipNganNhat(hoTrong, 10));
}


console.log('\n== 13. Ba mươi màn: đi tuần tự như một học sinh thật (kho rỗng → mỗi màn → kho lớn dần) ==');
const NGOAI_LE = [];
const BANG_TOM = [];
const KHO_TRUOC = {};
let khoCuoi = null;
{
  const ds = ManHoc.danhSach;
  const TRUONG = ['id', 'ma', 'chuong', 'so', 'cauTruc', 'ten', 'hang', 'deBai', 'san', 'batDau', 'loaiRobot', 'hamGoc', 'moXuong', 'camHamCuaEm', 'khung', 'maMau',
    'hamCuaEmCan', 'taoHam', 'sao', 'loiGiai', 'loiSai', 'goiY'];
  kiem('có đúng 30 màn', ds.length === 30, String(ds.length));
  const ids = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10',
    '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '3.10'];
  kiem('đúng mã màn và thứ tự', J(ds.map((m) => m.id)) === J(ids));
  kiem('ManHoc.tim trả đúng màn', ManHoc.tim('2.7').ten === ds[16].ten && ManHoc.tim('9.9') === null);
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm (mỗi chuỗi)',
    [0, 10, 20].every((o) => J(ds.slice(o, o + 10).map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum'])));
  kiem('chuỗi 1: chương trình 10 ô, chưa mở Xưởng hàm, cấm hàm của em, hàm gốc left_move/right_move/wait (không có left_back)',
    ds.slice(0, 10).every((m) => m.khung.chinh === 10 && m.moXuong === false && m.camHamCuaEm === true && J(m.hamGoc) === J(['left_move', 'right_move', 'wait'])));
  kiem('chuỗi 2: chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em',
    ds.slice(10, 20).every((m) => m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false));
  kiem('chương vong-lap: chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, hàm gốc như chuỗi 2',
    ds.slice(20).every((m) => m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.hamGoc) === J(['left_move', 'right_move', 'wait'])));
  kiem('bỏ thư viện theo trùm và số hàm theo màn: không còn thuVien / moThuVien / khung.soHam',
    ds.every((m) => m.thuVien === undefined && m.moThuVien === undefined && m.khung.soHam === undefined));
  kiem('trùm chỉ nhận huy hiệu: 1.10, 2.10 và 3.10 có huyHieu, các màn khác không',
    ds.every((m) => (m.id === '1.10' || m.id === '2.10' || m.id === '3.10') === !!(m.huyHieu && m.huyHieu.ma && m.huyHieu.ten)));
  kiem('sân tối đa 7×7', ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7));
  kiem('màn bắt buộc có hàm vì thiếu chỗ thật chỉ ở hàng 1 chuỗi 2 (tay viết > 10 dòng): 2.1 và 2.3',
    ['2.1', '2.3'].every((id) => ManHoc.tim(id).loiSai.some((l) => l.phaiCoMa.includes('tran-khung'))));
  kiem('lời giải, lời giải khác, lời sai, maMau đều có hamCuaMan; hamCuaEmMoi mặc định rỗng',
    ds.every((m) => Array.isArray(m.maMau.hamCuaMan) && Array.isArray(m.loiGiai.hamCuaMan) && Array.isArray(m.loiGiai.hamCuaEmMoi) &&
      (!m.loiGiaiKhac || (Array.isArray(m.loiGiaiKhac.baiLam.hamCuaMan) && Array.isArray(m.loiGiaiKhac.hamCuaEmMoi))) &&
      m.loiSai.every((l) => Array.isArray(l.baiLam.hamCuaMan) && Array.isArray(l.hamCuaEmMoi))));

  const kho = KhoHam.moi();
  khoCuoi = kho;
  let soManDungMove = 0;
  for (const m of ds) {
    const khoTruoc = kho.ds();
    KHO_TRUOC[m.id] = khoTruoc;
    const tenTruoc = khoTruoc.map((h) => h.ten);
    kiem(m.id + ' ' + m.ten + ': đủ trường, đề 1–3 câu, gợi ý 1–2 câu, ≥1 lời sai',
      TRUONG.every((t) => m[t] !== undefined) && m.deBai.length > 20 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 &&
      m.goiY.length >= 1 && m.goiY.length <= 2 && m.loiSai.length >= 1, m.id);

    // kho lúc tới màn phải có các hàm màn giả định
    kiem(m.id + ': hamCuaEmCan ⊆ kho lúc tới màn (' + (m.hamCuaEmCan.join(', ') || 'không cần') + ')',
      m.hamCuaEmCan.every((t) => tenTruoc.includes(t)), 'kho = ' + tenTruoc.join());
    // hàm học sinh tạo mới ở màn = taoHam; hàm còn lại trong hamCuaEmMoi là sửa hàm đã có
    const moiTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten);
    const taoMoi = moiTen.filter((t) => !tenTruoc.includes(t));
    kiem(m.id + ': taoHam = các hàm của em lần đầu xuất hiện ở màn này (' + (m.taoHam.join(', ') || 'không') + ')',
      J(taoMoi.slice().sort()) === J(m.taoHam.slice().sort()), 'tạo mới ' + taoMoi.join() + ' ≠ taoHam ' + m.taoHam.join());

    // học sinh tạo / sửa hàm trong Xưởng
    let khoNhan = true, loiKho = '';
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (!kho.tim(h.ten)) { const r = kho.tao(h.ten, h.thamSo); if (!r.ok) { khoNhan = false; loiKho += r.loi; } }
      const r2 = kho.sua(h.ten, h.than);
      if (!r2.ok) { khoNhan = false; loiKho += r2.loi; }
    }
    kiem(m.id + ': kho nhận được các hàm học sinh tạo / sửa', khoNhan, loiKho);
    const khoNay = kho.ds();

    const loiGiai = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ': lời giải 3 sao với kho lúc đó, vừa khung, dùng ĐÚNG sao.o ô',
      loiGiai.thang && loiGiai.sao === 3 && loiGiai.soO === m.sao.o,
      J({ thang: loiGiai.thang, sao: loiGiai.sao, soO: loiGiai.soO, saoO: m.sao.o, soNhip: loiGiai.soNhip, cd: loiGiai.chanDoan.map((c) => c.ma) }));
    kiem(m.id + ': lời giải chạy đúng sao.nhip nhịp', loiGiai.soNhip === m.sao.nhip, loiGiai.soNhip + ' ≠ ' + m.sao.nhip);
    kiem(m.id + ': lời giải không bị chẩn đoán nào (kể cả thông tin)', loiGiai.chanDoan.length === 0, J(loiGiai.chanDoan.map((c) => c.ma)));
    const maMau = ChamHoc.cham(m, m.maMau, khoTruoc);
    kiem(m.id + ': maMau vừa khung', !maCua(maMau).includes('tran-khung') && !maCua(maMau).includes('def-trong-chuong-trinh'), J(maMau.chanDoan.map((c) => c.ma)));
    BANG_TOM.push({ id: m.id, o: loiGiai.soO, nhip: loiGiai.soNhip, tao: m.taoHam.join(', '), dung: loiGiai.hamDaDung.join(', ') });

    // lời giải còn đúng khi học sinh đã có cả kho đầy đủ (chơi lại) — thử sau vòng lặp. Với move lỗi:
    const laHamManMove = m.loiGiai.hamCuaMan.some((h) => h.ten === 'move');
    if (loiGiai.hamDaDung.includes('move') && !laHamManMove) {
      if (m.chuong === 'xuong-ham') soManDungMove++;
      const hong = ChamHoc.cham(m, m.loiGiai, tron(khoNay, [H('move', ['left_move()', 'right_move()'])]));
      kiem(m.id + ': sửa move() trong kho thành bản lỗi (thiếu wait) → không thắng, chẩn đoán nhắc "hàm move"',
        !hong.thang && hong.sao === 0 && hong.chanDoan.some((c) => /hàm move/.test(c.loi)), J(hong.chanDoan.map((c) => c.loi)));
    }

    m.loiSai.forEach((ls, i) => {
      const r = ChamHoc.cham(m, ls.baiLam, tron(khoTruoc, ls.hamCuaEmMoi));
      const co = r.chanDoan.map((c) => c.ma);
      const thieu = ls.phaiCoMa.filter((x) => co.indexOf(x) < 0);
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không đủ 3 sao, đủ mã ' + ls.phaiCoMa.join('+'),
        r.sao < 3 && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + r.sao);
    });

    // ---- đường tắt
    const thuan = nhipNganNhat(m);
    let ghiChu = '';
    let khongTat = thuan === m.sao.nhip;
    if (!khongTat && m.moXuong === false && m.ngoaiLeKhung) {
      const vuaKhung = nhipNganNhat(m, m.khung.chinh - (m.khung.khoaChinh || 0));
      khongTat = vuaKhung === m.sao.nhip;
      ghiChu = ' [ngoại lệ chuỗi 1: đường ' + thuan + ' nhịp không vừa khung viết tay; đường vừa khung ' + vuaKhung + ' nhịp]';
      NGOAI_LE.push(m.id);
    }
    kiem(m.id + ': không có ĐƯỜNG TẮT — nhịp ngắn nhất (BFS) = sao.nhip' + ghiChu, khongTat, 'BFS = ' + thuan + ', sao.nhip = ' + m.sao.nhip +
      (thuan !== null && thuan < m.sao.nhip ? ' → ĐƯỜNG TẮT' : ''));
    if (m.moXuong === false) {
      const vk = nhipNganNhat(m, m.khung.chinh - (m.khung.khoaChinh || 0));
      kiem(m.id + ': đường ngắn nhất viết tay vừa khung (≤ ' + (m.khung.chinh - (m.khung.khoaChinh || 0)) + ' dòng) cũng đúng sao.nhip', vk === m.sao.nhip, 'vừa khung = ' + vk);
    }

    // ---- còn chỗ sáng tạo: có lời giải khác, vừa khung, nhiều ô hơn, chỉ 2 sao
    if (m.id !== '1.1' && m.id !== '1.2') {
      const kh = m.loiGiaiKhac;
      if (!kh) kiem(m.id + ': có loiGiaiKhac', false);
      else {
        const r = ChamHoc.cham(m, kh.baiLam, tron(khoTruoc, kh.hamCuaEmMoi));
        kiem(m.id + ': loiGiaiKhac (' + kh.moTa + ') vừa khung, nhiều ô hơn, cùng nhịp, đúng 2 sao',
          r.thang && !maCua(r).includes('tran-khung') && r.soO > m.sao.o && r.soNhip === m.sao.nhip && r.sao === 2 && J(kh.baiLam) !== J(m.loiGiai),
          J({ thang: r.thang, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, sao: r.sao, cd: maCua(r) }));
      }
    }
  }
  kiem('có đúng 9 màn xuong-ham (2.2–2.10) dùng move của em trong bài move-lỗi', soManDungMove === 9, String(soManDungMove));

  // ---- chơi lại với kho đầy đủ
  const day = kho.ds();
  kiem('kho cuối game: move, turn_right, turn_left, u_turn, corner, stair, two (xuong-ham) + side, row, bend_left, bend_right (vong-lap) = 11 hàm, trong giới hạn 12',
    J(day.map((h) => h.ten)) === J(['move', 'turn_right', 'turn_left', 'u_turn', 'corner', 'stair', 'two', 'side', 'row', 'bend_left', 'bend_right']) && day.length <= KhoHam.SO_HAM_MAC_DINH, J(day.map((h) => h.ten)));
  const choiLai = ds.map((m) => ChamHoc.cham(m, m.loiGiai, tron(day, m.loiGiai.hamCuaEmMoi)));
  kiem('chơi lại mọi màn với kho đầy đủ vẫn 3 sao, cùng số ô và nhịp (hàm thừa trong kho không đổi gì)',
    choiLai.every((r, i) => r.thang && r.sao === 3 && r.soO === ds[i].sao.o && r.soNhip === ds[i].sao.nhip && maLoi(r).length === 0),
    choiLai.map((r, i) => ds[i].id + ':' + r.sao + '/' + r.soO).join(' '));
  kiem('chơi lại 2.1 khi kho đã có move của em: hàm của màn che, có thông tin che (và chỉ màn đó, vì chỉ 2.1 cho sẵn hàm trùng tên)',
    choiLai.map((r, i) => (maCua(r).includes('ham-man-che-ham-em') ? ds[i].id : null)).filter(Boolean).join() === '2.1');
  const chuoi1 = ds.slice(0, 10).map((m) => ChamHoc.cham(m, m.loiGiai, day));
  kiem('chuỗi 1 với kho đầy đủ: màn cấm hàm của em nên kho bị bỏ qua, vẫn 3 sao', chuoi1.every((r) => r.sao === 3 && r.hamDaDung.length === 0));

  // ---- maMau của từng màn đặc biệt
  const m11 = ManHoc.tim('1.1');
  kiem('1.1: maMau = đúng lời giải, bấm chạy là 3 sao', ChamHoc.cham(m11, m11.maMau, []).sao === 3 && bang(m11.maMau.chinh, m11.loiGiai.chinh) && m11.maMau.chinh.length === 3);
  const m12 = ManHoc.tim('1.2');
  kiem('1.2: maMau = 3 dòng tiến 1 ô, chưa thắng; lời giải tiến 3 ô = 9 dòng', m12.maMau.chinh.length === 3 && !ChamHoc.cham(m12, m12.maMau, []).thang && m12.loiGiai.chinh.length === 9);
  const m13 = ManHoc.tim('1.3');
  kiem('1.3: maMau = left_move(), wait() (quay phải)', bang(m13.maMau.chinh, ['left_move()', 'wait()']) && ChamHoc.cham(m13, m13.maMau, []).theoSan[0].vet.filter((e) => e.loai === 'nhip')[0].robot.huong === 1);
  const m18 = ManHoc.tim('1.8');
  kiem('1.8: maMau lạch bạch: không tiến, quay qua quay lại', bang(m18.maMau.chinh, ['left_move()', 'wait()', 'right_move()', 'wait()']) && !ChamHoc.cham(m18, m18.maMau, []).thang);
  const m21 = ManHoc.tim('2.1');
  kiem('2.1: tiến 4 ô viết tay = 12 dòng > 10 ô; hàm của màn move() đủ thân, chương trình trống, kho chưa cần gì',
    4 * 3 > m21.khung.chinh && m21.maMau.hamCuaMan.length === 1 && m21.maMau.hamCuaMan[0].ten === 'move' && m21.maMau.hamCuaMan[0].than.length === 3 &&
    m21.maMau.chinh.length === 0 && m21.hamCuaEmCan.length === 0 && m21.taoHam.length === 0);
  const m22 = ManHoc.tim('2.2');
  kiem('2.2: màn tạo move() của em lần đầu — maMau chỉ gọi move() sẵn (4 lần), không có hàm của màn, kho chưa có',
    m22.maMau.hamCuaMan.length === 0 && m22.maMau.chinh.filter((s) => s === 'move()').length === 4 && bang(m22.taoHam, ['move']) && KHO_TRUOC['2.2'].length === 0);
  const m23 = ManHoc.tim('2.3');
  kiem('2.3: dùng move() của em — cần move, không tạo hàm mới', bang(m23.hamCuaEmCan, ['move']) && m23.taoHam.length === 0 && m23.loiGiai.hamCuaEmMoi.length === 0);
  kiem('2.4 / 2.5 / 2.7 / 2.9 tạo turn_right / turn_left / u_turn / corner',
    bang(ManHoc.tim('2.4').taoHam, ['turn_right']) && bang(ManHoc.tim('2.5').taoHam, ['turn_left']) && bang(ManHoc.tim('2.7').taoHam, ['u_turn']) && bang(ManHoc.tim('2.9').taoHam, ['corner']));
  const m26 = ManHoc.tim('2.6');
  kiem('2.6: dùng kho (move, turn_right, turn_left), không tạo gì', bang(m26.hamCuaEmCan, ['move', 'turn_right', 'turn_left']) && m26.taoHam.length === 0);
  const m27 = ManHoc.tim('2.7');
  kiem('2.7: u_turn() của em gọi turn_right() hai lần (hàm gọi hàm)', bang(m27.loiGiai.hamCuaEmMoi[0].than, ['turn_right()', 'turn_right()']));
  const m28 = ManHoc.tim('2.8');
  kiem('2.8: hàm của màn step_right viết nhầm turn_left(), không thắng khi chưa sửa; lời giải sửa hàm của màn, không đụng kho',
    m28.maMau.hamCuaMan.some((h) => h.ten === 'step_right' && h.than.some((s) => /turn_left\(\)/.test(s))) && !ChamHoc.cham(m28, m28.maMau, KHO_TRUOC['2.8']).thang &&
    m28.loiGiai.hamCuaMan.some((h) => h.ten === 'step_right' && h.than.some((s) => /turn_right\(\)/.test(s))) && m28.loiGiai.hamCuaEmMoi.length === 0);
  const m210 = ManHoc.tim('2.10');
  kiem('2.10: trùm — lời giải mẫu tạo stair() và two() gọi stair() hai lần; chương trình chỉ 3 dòng',
    bang(m210.taoHam, ['stair', 'two']) && m210.loiGiai.hamCuaEmMoi.some((h) => h.ten === 'two' && bang(h.than, ['stair()', 'stair()'])) && m210.loiGiai.chinh.length === 3);
  kiem('2.10: stair() gọi nhiều tầng (two → stair → move → left_move): vết có ngan 3 tầng',
    ChamHoc.cham(m210, m210.loiGiai, kho.ds()).vet.some((e) => e.loai === 'lenh' && e.ngan.length === 3));
  // ---- hai màn cuối chuỗi 1: luyện thao tác sửa code (xóa dòng, kéo đổi chỗ)
  const dayCon = (con, me) => { let i = 0; for (const x of me) if (i < con.length && x === con[i]) i++; return i === con.length; };
  const demLoai = (ds) => ds.reduce((a, x) => { a[x] = (a[x] || 0) + 1; return a; }, {});
  /** me có đủ các dòng của con (đếm theo loại)? Trả về phần dư của me, hoặc null nếu thiếu. */
  const phanDu = (con, me) => { const c = demLoai(me); for (const x of con) { if (!c[x]) return null; c[x]--; } return Object.keys(c).filter((k) => c[k] > 0).map((k) => k + '×' + c[k]); };
  const bo1Dong = (ds) => ds.map((_, i) => ds.slice(0, i).concat(ds.slice(i + 1)));
  const m19 = ManHoc.tim('1.9');
  const r19 = ChamHoc.cham(m19, m19.maMau, []);
  kiem('1.9: hang bien-the, tên "Dọn dòng thừa", có veMaMau dạy xóa dòng', m19.hang === 'bien-the' && m19.ten === 'Dọn dòng thừa' && /thùng rác/.test(m19.veMaMau) && /✕/.test(m19.veMaMau) && /chạm hai lần/.test(m19.veMaMau));
  kiem('1.9: maMau ĐẦY khung (đúng 10 dòng, không viết thêm được), chạy thì KHÔNG thắng',
    m19.maMau.chinh.length === 10 && m19.maMau.chinh.length === m19.khung.chinh && !maCua(r19).includes('tran-khung') && !r19.thang && r19.sao === 0, J([m19.maMau.chinh.length, r19.thang]));
  kiem('1.9: chạy maMau thấy ngay xe không rẽ mà đâm tường (chẩn đoán dam-tuong + chua-toi-co)', maCua(r19).includes('dam-tuong') && maCua(r19).includes('chua-toi-co'), J(maCua(r19)));
  kiem('1.9: lời giải sinh từ maMau CHỈ bằng thao tác xóa: là dãy con, ít hơn đúng 2 dòng (còn 8 dòng)',
    dayCon(m19.loiGiai.chinh, m19.maMau.chinh) && m19.maMau.chinh.length - m19.loiGiai.chinh.length === 2 && m19.loiGiai.chinh.length === 8);
  kiem('1.9: hai dòng thừa là đúng một left_move() và một wait()', J((phanDu(m19.loiGiai.chinh, m19.maMau.chinh) || []).sort()) === J(['left_move()×1', 'wait()×1']), J(phanDu(m19.loiGiai.chinh, m19.maMau.chinh)));
  kiem('1.9: xóa riêng một dòng nào của maMau cũng chưa đủ 3 sao (phải xóa cả hai dòng thừa)',
    bo1Dong(m19.maMau.chinh).every((c) => ChamHoc.cham(m19, { chinh: c }, []).sao < 3));
  kiem('1.9: mọi cách xóa 2 dòng ra 3 sao đều cho đúng chương trình lời giải (không lời giải 8 dòng nào khác)',
    (() => { const ds = m19.maMau.chinh; const kq = new Set(); for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) {
      const c = ds.filter((_, k) => k !== i && k !== j); if (ChamHoc.cham(m19, { chinh: c }, []).sao === 3) kq.add(J(c)); } return kq.size === 1 && kq.has(J(m19.loiGiai.chinh)); })());
  const m110 = ManHoc.tim('1.10');
  const r110 = ChamHoc.cham(m110, m110.maMau, []);
  kiem('1.10: hang trum, tên "Xếp lại cho đúng", giữ huy hiệu hai-banh, có veMaMau dạy kéo đổi chỗ',
    m110.hang === 'trum' && m110.ten === 'Xếp lại cho đúng' && m110.huyHieu.ma === 'hai-banh' && m110.huyHieu.ten === 'Huy hiệu Hai bánh' && /Nhấn giữ/.test(m110.veMaMau) && /kéo/.test(m110.veMaMau));
  kiem('1.10: maMau vừa khung, chạy thì KHÔNG thắng, xe rẽ trước khi tiến nên đâm tường',
    m110.maMau.chinh.length <= m110.khung.chinh && !maCua(r110).includes('tran-khung') && !r110.thang && maCua(r110).includes('dam-tuong'), J([m110.maMau.chinh.length, maCua(r110)]));
  kiem('1.10: lời giải là hoán vị của một tập con của maMau: đủ dòng, thừa đúng 1 dòng (wait())',
    m110.maMau.chinh.length - m110.loiGiai.chinh.length === 1 && J(phanDu(m110.loiGiai.chinh, m110.maMau.chinh)) === J(['wait()×1']), J(phanDu(m110.loiGiai.chinh, m110.maMau.chinh)));
  kiem('1.10: lời giải KHÔNG phải dãy con của maMau (chỉ xóa là chưa đủ, phải đổi thứ tự)', !dayCon(m110.loiGiai.chinh, m110.maMau.chinh));
  kiem('1.10: chỉ xóa một dòng (không đổi chỗ) thì không bao giờ thắng',
    bo1Dong(m110.maMau.chinh).every((c) => !ChamHoc.cham(m110, { chinh: c }, []).thang));
  kiem('1.10: chỉ đổi chỗ hai dòng cạnh nhau (một lần kéo, không xóa) thì không ra 3 sao',
    (() => { const ds = m110.maMau.chinh; for (let i = 0; i + 1 < ds.length; i++) { const c = ds.slice(); const t = c[i]; c[i] = c[i + 1]; c[i + 1] = t; if (ChamHoc.cham(m110, { chinh: c }, []).sao === 3) return false; } return true; })());
  kiem('hai màn cuối chuỗi 1 không còn băng chuyền trên sân', ['1.9', '1.10'].every((id) => !/[><^v]/.test(ManHoc.tim(id).san.join(''))));
  kiem('hai màn cuối: deBai là mục tiêu (không nói về code có sẵn), veMaMau mới nói về code có sẵn',
    ['1.9', '1.10'].every((id) => { const m = ManHoc.tim(id); return !/có sẵn|dòng thừa|xáo/.test(m.deBai) && /có sẵn/.test(m.veMaMau); }));

  // ---- kho màn băng chuyền (tách khỏi chuỗi 1, chờ chương riêng)
  {
    const BC = require(path.join(THU_MUC, 'man-bang-chuyen.js'));
    const nguonBC = require('node:fs').readFileSync(path.join(THU_MUC, 'man-bang-chuyen.js'), 'utf8');
    const choiHtml = require('node:fs').readFileSync(path.join(THU_MUC, 'game', 'choi.html'), 'utf8');
    kiem('kho băng chuyền: bc.1 và bc.2, KHÔNG nằm trong ManHoc, KHÔNG nạp trong game/choi.html',
      J(BC.danhSach.map((m) => m.id)) === J(['bc.1', 'bc.2']) && BC.tim('bc.1').ten === 'Băng chuyền' && BC.tim('bc.2').ten === 'Thuận hay nghịch' &&
      BC.danhSach.every((m) => ManHoc.tim(m.id) === null && !ManHoc.danhSach.includes(m)) && !/man-bang-chuyen/.test(choiHtml));
    kiem('kho băng chuyền: đầu tệp ghi "kho màn băng chuyền, chờ chương riêng"; xuất window.ManBangChuyen', /kho màn băng chuyền, chờ chương riêng/.test(nguonBC) && /window\.ManBangChuyen = /.test(nguonBC));
    for (const m of BC.danhSach) {
      const r = ChamHoc.cham(m, m.loiGiai, []);
      kiem(m.id + ': lời giải 3 sao, đúng sao.o và sao.nhip, sạch chẩn đoán', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J([r.sao, r.soO, r.soNhip, maCua(r)]));
      kiem(m.id + ': không đường tắt (BFS có tính băng chuyền), đường viết tay vừa khung cũng bằng sao.nhip', nhipNganNhat(m) === m.sao.nhip && nhipNganNhat(m, m.khung.chinh) === m.sao.nhip, nhipNganNhat(m) + ' / ' + nhipNganNhat(m, m.khung.chinh));
      const kh = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, []);
      kiem(m.id + ': loiGiaiKhac đúng 2 sao, cùng nhịp', kh.sao === 2 && kh.soNhip === m.sao.nhip, J([kh.sao, kh.soO]));
      m.loiSai.forEach((ls, i) => {
        const rs = ChamHoc.cham(m, ls.baiLam, []);
        const thieu = ls.phaiCoMa.filter((x) => !maCua(rs).includes(x));
        kiem(m.id + ' lời sai #' + (i + 1) + ': không đủ 3 sao, đủ mã ' + ls.phaiCoMa.join('+'), rs.sao < 3 && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + maCua(rs).join());
      });
    }
  }
  console.log('  (màn dùng ngoại lệ "đường nhanh hơn không vừa khung viết tay": ' + (NGOAI_LE.length ? NGOAI_LE.join(', ') : 'không có') + ')');

  console.log('\n  Bảng 30 màn (lời giải mẫu, tính theo cách đếm mới)');
  console.log('  màn   | ô  | nhịp | hàm tạo mới       | hàm dùng (đã gọi tới)');
  for (const b of BANG_TOM) {
    console.log('  ' + b.id.padEnd(5) + ' | ' + String(b.o).padEnd(2) + ' | ' + String(b.nhip).padEnd(4) + ' | ' + (b.tao || '-').padEnd(17) + ' | ' + (b.dung || '-'));
  }
}

/* ============================================ HÀM CỦA EM · HÀM CỦA MÀN · ĐẾM Ô */
console.log('\n== 14. Hàm của em bền, hàm của màn tạm, cách đếm ô ==');
{
  const m23 = ManHoc.tim('2.3');
  // sửa hàm thì mọi chỗ dùng đều đổi theo
  const kho = KhoHam.moi();
  kho.tao('move', []); kho.sua('move', T_MOVE);
  const r1 = ChamHoc.cham(m23, m23.loiGiai, kho.ds());
  kho.sua('move', ['left_move()', 'right_move()']);
  const r2 = ChamHoc.cham(m23, m23.loiGiai, kho.ds());
  kho.sua('move', T_MOVE);
  const r3 = ChamHoc.cham(m23, m23.loiGiai, kho.ds());
  kiem('sửa hàm trong kho: mọi chỗ dùng đổi theo (đúng → hỏng → sửa lại đúng)', r1.sao === 3 && !r2.thang && r3.sao === 3, J([r1.sao, r2.thang, r3.sao]));
  kiem('bản lỗi báo đúng hàm move (banh-goi-lai ở hàm move, dòng 1)',
    /hàm move, dòng 1/.test(r2.chanDoan.find((c) => c.ma === 'banh-goi-lai').loi), J(r2.chanDoan.map((c) => c.loi)));

  const truoc = J([kho.ds(), m23.loiGiai]);
  ChamHoc.cham(m23, m23.loiGiai, kho.ds());
  kiem('chấm không làm đổi kho hay bài làm (không tác dụng phụ)', J([kho.ds(), m23.loiGiai]) === truoc);

  // ---- đếm ô
  const manMot = Object.assign({}, m23, { san: ['.....', '.....', '.....', '..F..', '.....'], batDau: { x: 2, y: 4, huong: 0 }, sao: { o: 99, nhip: 99 } });
  const a = H('a', T_MOVE), b = H('b', T_MOVE), c = H('c', ['wait()']);
  const u = ChamHoc.cham(manMot, { chinh: ['a()'] }, [a, b, c]);
  kiem('hàm không được gọi thì không tính ô: kho 3 hàm, chỉ gọi a → soO = 1 + 3, hamDaDung = [a]',
    u.thang && u.soO === 4 && bang(u.hamDaDung, ['a']), J([u.soO, u.hamDaDung]));
  const lap3 = ChamHoc.cham(Object.assign({}, manMot, { san: ['.....', '.....', '..F..', '.....', '.....'] }), { chinh: ['a()', 'a()'] }, [a]);
  kiem('mỗi hàm tính MỘT lần dù gọi nhiều lần: gọi a hai lần → 2 + 3', lap3.thang && lap3.soO === 5 && bang(lap3.hamDaDung, ['a']), J([lap3.soO, lap3.hamDaDung]));
  const trong = ChamHoc.cham(manMot, { chinh: ['', 'a()', ''] }, [H('a', ['', 'left_move()', '', 'right_move()', 'wait()'])]);
  kiem('ô trống và dòng def không tốn ô: chương trình 1 ô + thân a 3 ô', trong.thang && trong.soO === 4, String(trong.soO));

  const m27 = ManHoc.tim('2.7');
  const gt = ChamHoc.cham(m27, { chinh: ['u_turn()'] }, EM);
  kiem('hàm gọi gián tiếp có tính ô: chỉ gọi u_turn → có cả turn_right (u_turn gọi nó), không có move / turn_left; soO = 1 + 2 + 2',
    bang(gt.hamDaDung, ['turn_right', 'u_turn']) && gt.soO === 5, J([gt.hamDaDung, gt.soO]));
  kiem('gọi gián tiếp: vết của lệnh trong turn_right có ngan = [chương trình 1, u_turn dòng 1]',
    bang(gt.vet.find((e) => e.loai === 'lenh').ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'hamEm', dong: 1, ten: 'u_turn' }]));
  const ll = ChamHoc.cham(m27, m27.loiGiai, EM);
  kiem('lời giải 2.7 đếm: u_turn → turn_right (gián tiếp), move, turn_left; soO = 6 + 2 + 2 + 3 + 2 = 15',
    ll.soO === 15 && bang(ll.hamDaDung, ['move', 'turn_right', 'turn_left', 'u_turn']), J([ll.soO, ll.hamDaDung]));
  kiem('chiTietO liệt kê từng hàm với số ô của nó', bang(ll.chiTietO, { chinh: 6, ham: [
    { ten: 'move', cot: 'hamEm', o: 3 }, { ten: 'turn_right', cot: 'hamEm', o: 2 }, { ten: 'turn_left', cot: 'hamEm', o: 2 }, { ten: 'u_turn', cot: 'hamEm', o: 2 }] }), J(ll.chiTietO));

  const nhanh = ChamHoc.cham(manMot, { chinh: ['if False:', '    b()', 'a()'] }, [a, b]);
  kiem('nhánh không bao giờ chạy: hàm nằm trong đó không được gọi thật nên không tính (đếm theo lúc chạy, không theo chữ)',
    nhanh.thang && bang(nhanh.hamDaDung, ['a']) && nhanh.soO === 3 + 3, J([nhanh.thang, nhanh.hamDaDung, nhanh.soO, nhanh.chanDoan.map((x) => x.loi)]));

  // nhiều sân: lấy hợp
  const san1 = ['.....', '.....', '.....', '..F..', '.....'], san2 = ['.....', '.....', '..F..', '.....', '.....'];
  const hai = (dsSan) => Object.assign({}, manMot, { san: dsSan, batDau: { x: 2, y: 4, huong: 0 } });
  const chinhAB = { chinh: ['a()', 'b()'] };
  const s12 = ChamHoc.cham(hai([san1, san2]), chinhAB, [a, b]);
  const s21 = ChamHoc.cham(hai([san2, san1]), chinhAB, [a, b]);
  const chiMot = ChamHoc.cham(hai([san1]), chinhAB, [a, b]);
  kiem('một sân thắng sau a() nên không bao giờ gọi b(): chỉ tính a', chiMot.thang && bang(chiMot.hamDaDung, ['a']) && chiMot.soO === 5, J([chiMot.hamDaDung, chiMot.soO]));
  kiem('nhiều sân lấy HỢP các hàm được gọi ở mọi sân (a ở sân 1, a và b ở sân 2) — dù sân nào đứng trước',
    s12.thang && s21.thang && bang(s12.hamDaDung, ['a', 'b']) && bang(s21.hamDaDung, ['a', 'b']) && s12.soO === 8 && s21.soO === 8, J([s12.hamDaDung, s12.soO, s21.hamDaDung, s21.soO]));
  kiem('nhiều sân: mỗi hàm vẫn chỉ tính một lần dù được gọi ở cả hai sân', s12.chiTietO.ham.filter((x) => x.ten === 'a').length === 1);

  // hàm của màn
  const m28 = ManHoc.tim('2.8');
  const khongGoi = ChamHoc.cham(m28, { chinh: ['move()'], hamCuaMan: m28.loiGiai.hamCuaMan }, mau('move', 'turn_right'));
  kiem('hàm của màn không gọi thì không tính ô (step_right có mặt nhưng không ai gọi)', bang(khongGoi.hamDaDung, ['move']) && khongGoi.soO === 1 + 3, J([khongGoi.hamDaDung, khongGoi.soO]));
  const khongGoiHong = ChamHoc.cham(m28, { chinh: ['move()'], hamCuaMan: [H('step_right', ['turn_right(', 'move()'])] }, mau('move', 'turn_right'));
  kiem('hàm của màn luôn được ghép: lỗi cú pháp trong đó vẫn bị báo dù chưa ai gọi (học sinh đang sửa nó)',
    maCua(khongGoiHong).includes('loi-cu-phap') && /hàm step_right của màn/.test(khongGoiHong.chanDoan[0].loi));
  const gian = ChamHoc.cham(m28, m28.loiGiai, mau('move', 'turn_right', 'turn_left'));
  kiem('hàm của màn gọi hàm của em (gián tiếp): 2.8 soO = 5 + 2 (step_right) + 3 (move) + 2 (turn_right), turn_left không dùng không tính',
    gian.soO === 12 && bang(gian.hamDaDung, ['move', 'turn_right', 'step_right']), J([gian.soO, gian.hamDaDung]));
  kiem('chiTietO phân biệt hàm của em và của màn', bang(gian.chiTietO.ham.map((x) => x.cot), ['hamEm', 'hamEm', 'hamMan']), J(gian.chiTietO));

  // hàm của màn che hàm của em
  const m21 = ManHoc.tim('2.1');
  const khoHong = [H('move', ['left_move()', 'right_move()'])];
  const khoTruocChe = J(khoHong);
  const che = ChamHoc.cham(m21, m21.loiGiai, khoHong);
  kiem('hàm của màn che hàm của em cùng tên: 2.1 dùng move của màn nên vẫn thắng 3 sao dù move trong kho hỏng',
    che.thang && che.sao === 3 && che.soO === 7 && bang(che.chiTietO.ham, [{ ten: 'move', cot: 'hamMan', o: 3 }]), J([che.thang, che.sao, che.soO]));
  const info = che.chanDoan.filter((x) => x.ma === 'ham-man-che-ham-em');
  kiem('ghi chẩn đoán loại THÔNG TIN (muc thong-tin, kèm tên hàm) để giao diện báo; không phải lỗi',
    info.length === 1 && info[0].muc === 'thong-tin' && info[0].ten === 'move' && /hàm của màn/.test(info[0].loi) && maLoi(che).length === 0 && che.chanDoan.length === 1, J(che.chanDoan));
  kiem('chỉ ghép MỘT hàm move vào Python (của màn, có wait), không có bản của em', dem(che.py, 'def move') === 1 && /def move\(\):\n    left_move\(\)\n    right_move\(\)\n    wait\(\)/.test(che.py), che.py);
  kiem('hàm của màn che xong thì kho không bị đụng tới', J(khoHong) === khoTruocChe);
  const cheKhongTrung = ChamHoc.cham(m21, m21.loiGiai, [H('khac', ['wait()'])]);
  kiem('không trùng tên thì không có thông tin che', cheKhongTrung.chanDoan.length === 0);
  const cheRoi = ChamHoc.cham(m21, { chinh: lap4(), hamCuaMan: [] }, khoHong);
  kiem('bỏ hàm của màn đi thì hàm move của em (hỏng) lộ ra: không thắng, nhắc "hàm move"', !cheRoi.thang && cheRoi.chanDoan.some((x) => /hàm move/.test(x.loi)));
  const cheTK = ChamHoc.cham(m21, { chinh: [].concat(T_MOVE, T_MOVE, T_MOVE, T_MOVE), hamCuaMan: m21.loiGiai.hamCuaMan }, khoHong);
  kiem('thông tin che có mặt cả khi bài làm bị chặn sớm (tràn khung)', maCua(cheTK).includes('tran-khung') && maCua(cheTK).includes('ham-man-che-ham-em'));
  const cam = ChamHoc.cham(Object.assign({}, ManHoc.tim('2.3'), { camHamCuaEm: true }), ManHoc.tim('2.3').loiGiai, EM);
  kiem('màn khai camHamCuaEm: kho bị bỏ qua — gọi move() báo màn không cho dùng hàm của em', !cam.thang && maCua(cam).join() === 'ham-chua-co' && /không cho dùng hàm của em/.test(cam.chanDoan[0].loi), J(cam.chanDoan));
  const camChe = ChamHoc.cham(Object.assign({}, m21, { camHamCuaEm: true }), m21.loiGiai, khoHong);
  kiem('màn cấm hàm của em thì không có thông tin che (kho coi như vắng mặt)', camChe.thang && camChe.chanDoan.length === 0);

  // dùng chéo
  const tc = ChamHoc.cham(ManHoc.tim('2.4'), { chinh: CHINH_24_NHAP(), hamCuaMan: [] }, mau('move', 'turn_right'));
  kiem('hàm của em gọi hàm của em (kho tự nhất quán) chạy đúng ở màn khác', tc.sao === 3 && tc.soO === 13, J([tc.sao, tc.soO]));
}
function lap4() { return dong(4); }

/* ================================================================ KHO HÀM */
console.log('\n== 15. KhoHam: tạo, sửa, đổi tên, xóa, tên sai, lưu / đọc, phiên bản ==');
{
  const k = KhoHam.moi();
  const t1 = k.tao('move');
  kiem('tạo hàm: ok, thân rỗng, thamSo rỗng, trả bản sao', t1.ok && bang(t1.ham, { ten: 'move', thamSo: [], than: [] }) && k.soHam() === 1, J(t1));
  const t2 = k.tao('tien', ['n']);
  kiem('tạo hàm có đối số', t2.ok && bang(k.tim('tien').thamSo, ['n']));
  const ten = (s) => k.kiemTen(s);
  const sai = [['', 'ten-rong'], ['   ', 'ten-rong'], ['1abc', 'ten-sai-cu-phap'], ['a b', 'ten-sai-cu-phap'], ['a-b', 'ten-sai-cu-phap'], ['tên', 'ten-sai-cu-phap'], ['a()', 'ten-sai-cu-phap'],
    ['class', 'ten-la-tu-khoa'], ['def', 'ten-la-tu-khoa'], ['None', 'ten-la-tu-khoa'], ['while', 'ten-la-tu-khoa'],
    ['wait', 'ten-trung-ham-goc'], ['left_move', 'ten-trung-ham-goc'], ['go_up', 'ten-trung-ham-goc'], ['print', 'ten-trung-ham-goc'], ['range', 'ten-trung-ham-goc'],
    ['move', 'ten-da-co']];
  for (const [s, ma] of sai) {
    const r = ten(s);
    kiem('kiemTen "' + s + '" → ' + ma + ', có lời tiếng Việt', !r.ok && r.ma === ma && typeof r.loi === 'string' && r.loi.length > 5, J(r));
  }
  kiem('kiemTen hợp lệ: move_2, _x, Corner', ten('move_2').ok && ten('_x').ok && ten('Corner').ok);
  kiem('tên khác nhau chữ hoa / thường là hai tên khác nhau', ten('Move').ok);
  const tr = k.tao('wait');
  kiem('tao() cũng chặn tên sai và không thêm gì', !tr.ok && tr.ma === 'ten-trung-ham-goc' && k.soHam() === 2);
  const td = k.tao('move');
  kiem('tạo trùng tên hàm đã có bị từ chối', !td.ok && td.ma === 'ten-da-co' && k.soHam() === 2);
  kiem('đối số sai tên / trùng nhau bị từ chối', k.tao('x1', ['1a']).ma === 'tham-so-sai' && k.tao('x2', ['a', 'a']).ma === 'tham-so-sai' && k.tao('x3', ['class']).ma === 'tham-so-sai' && k.soHam() === 2);

  const s1 = k.sua('move', ['left_move()', 'right_move()', 'wait()']);
  kiem('sửa thân hàm', s1.ok && bang(k.tim('move').than, T_MOVE));
  const gocThan = ['a()', 'b()'];
  k.sua('tien', gocThan); gocThan.push('hỏng');
  kiem('sửa chép bản sao: đổi mảng gốc sau đó không làm đổi kho', bang(k.tim('tien').than, ['a()', 'b()']));
  kiem('sửa hàm không có → khong-co-ham', k.sua('khongco', []).ma === 'khong-co-ham');
  kiem('sửa với thân sai kiểu → than-sai', k.sua('move', 'wait()').ma === 'than-sai' && k.sua('move', [1]).ma === 'than-sai' && bang(k.tim('move').than, T_MOVE));
  kiem('sửa kèm đổi đối số', k.sua('tien', ['wait()'], ['n', 'm']).ok && bang(k.tim('tien').thamSo, ['n', 'm']));

  const ds = k.ds();
  ds[0].than.push('PHÁ'); ds.push({ ten: 'ma' });
  kiem('ds() trả bản sao: sửa kết quả không đụng kho', k.soHam() === 2 && bang(k.tim('move').than, T_MOVE));
  kiem('ds() đúng dạng cham() nhận ({ten, thamSo, than}), giữ thứ tự tạo', bang(k.ds().map((h) => h.ten), ['move', 'tien']) && Object.keys(k.ds()[0]).join() === 'ten,thamSo,than');

  // đổi tên
  const k2 = KhoHam.moi();
  k2.tao('move'); k2.sua('move', T_MOVE);
  k2.tao('two'); k2.sua('two', ['move()', 'move()  # move() đi hai ô', 'x = movement(1)', 'moved()']);
  k2.tao('khac'); k2.sua('khac', ['wait()']);
  const dt = k2.doiTen('move', 'step');
  kiem('đổi tên: ok, báo hàm nào bị sửa chỗ gọi', dt.ok && bang(dt.capNhat, ['two']) && k2.tim('move') === null && k2.tim('step') !== null, J(dt));
  kiem('đổi tên: chỗ gọi trong hàm khác đổi theo; chú thích và tên khác chữ (movement, moved) giữ nguyên',
    bang(k2.tim('two').than, ['step()', 'step()  # move() đi hai ô', 'x = movement(1)', 'moved()']), J(k2.tim('two').than));
  kiem('đổi tên giữ thân và thứ tự', bang(k2.tim('step').than, T_MOVE) && bang(k2.ds().map((h) => h.ten), ['step', 'two', 'khac']));
  const mH2 = Object.assign({}, ManHoc.tim('2.3'), { san: ['.....', '.....', '.....', '..F..', '.....'], batDau: { x: 2, y: 4, huong: 0 } });
  const dungMoi = ChamHoc.cham(mH2, { chinh: ['step()'] }, k2.ds());
  const dungCu = ChamHoc.cham(mH2, { chinh: ['move()'] }, k2.ds());
  kiem('sau khi đổi tên, bài gọi tên mới chạy được, tên cũ thì ham-chua-co', dungMoi.thang && dungCu.chanDoan.some((c) => c.ma === 'ham-chua-co'), J([dungMoi.chanDoan, dungCu.chanDoan]));
  kiem('đổi tên trùng hàm khác bị từ chối, không đổi gì', k2.doiTen('step', 'two').ma === 'ten-da-co' && k2.tim('step') !== null);
  kiem('đổi sang tên sai bị từ chối', k2.doiTen('step', 'class').ma === 'ten-la-tu-khoa' && k2.doiTen('step', 'wait').ma === 'ten-trung-ham-goc' && k2.doiTen('step', '9x').ma === 'ten-sai-cu-phap');
  kiem('đổi tên hàm không có → khong-co-ham', k2.doiTen('khongco', 'abc').ma === 'khong-co-ham');
  kiem('đổi sang chính tên cũ: ok, không làm gì', k2.doiTen('step', 'step').ok);
  kiem('đổi tên rồi đổi lại như cũ', k2.doiTen('step', 'move').ok && bang(k2.tim('two').than.slice(0, 2), ['move()', 'move()  # move() đi hai ô']));

  // xóa
  const x1 = k2.xoa('khac');
  kiem('xóa hàm: ok, không còn trong kho', x1.ok && k2.tim('khac') === null && k2.soHam() === 2 && bang(x1.conDung, []));
  const x2 = k2.xoa('move');
  kiem('xóa hàm còn được hàm khác gọi: vẫn xóa, báo hàm nào còn gọi nó để giao diện cảnh báo', x2.ok && bang(x2.conDung, ['two']) && k2.soHam() === 1, J(x2));
  kiem('xóa hàm không có → khong-co-ham', k2.xoa('khongco').ma === 'khong-co-ham');
  kiem('tên đã xóa tạo lại được', k2.tao('move').ok);

  // giới hạn số hàm
  const k3 = KhoHam.moi();
  let tao12 = true;
  for (let i = 1; i <= 12; i++) tao12 = tao12 && k3.tao('f' + i).ok;
  const t13 = k3.tao('f13');
  kiem('mặc định tối đa 12 hàm của em trong cả game', tao12 && k3.soHamToiDa() === 12 && !t13.ok && t13.ma === 'het-cho' && k3.soHam() === 12, J(t13));
  kiem('xóa bớt thì tạo tiếp được', k3.xoa('f1').ok && k3.tao('f13').ok);
  const k4 = KhoHam.moi({ soHamToiDa: 2 });
  k4.tao('a'); k4.tao('b');
  kiem('soHamToiDa chỉnh được', k4.tao('c').ma === 'het-cho');

  // lưu / đọc qua đối tượng giả
  const luuGia = () => { const m = new Map(); return { m, getItem: (key) => (m.has(key) ? m.get(key) : null), setItem: (key, v) => { m.set(key, String(v)); } }; };
  const L = luuGia();
  const kA = KhoHam.moi();
  kA.tao('move'); kA.sua('move', T_MOVE); kA.tao('tien', ['n']); kA.sua('tien', ['for i in range(n):', '    move()']);
  const g = kA.ghiLuu(L);
  kiem('ghiLuu: ok, ghi vào đúng khóa, là JSON có số phiên bản', g.ok && L.m.has(KhoHam.KHOA_LUU) && JSON.parse(L.m.get(KhoHam.KHOA_LUU)).phienBan === KhoHam.PHIEN_BAN && KhoHam.PHIEN_BAN === 1);
  const kB = KhoHam.moi();
  const d = kB.docLuu(L);
  kiem('docLuu vào kho mới: giống hệt (tên, đối số, thân, thứ tự)', d.ok && d.soHam === 2 && bang(kB.ds(), kA.ds()), J(d));
  const m23 = ManHoc.tim('2.3');
  kiem('hàm đọc về từ nơi lưu dùng được ngay ở màn sau (như tải lại trang)', ChamHoc.cham(m23, m23.loiGiai, kB.ds()).sao === 3);
  const kC = KhoHam.moi();
  kiem('chưa lưu gì: docLuu ok, kho rỗng', kC.docLuu(luuGia()).ok && kC.soHam() === 0);
  kC.tao('cu'); const dd = kC.docLuu(luuGia());
  kiem('docLuu từ nơi trống thay kho bằng rỗng (dữ liệu lưu là nguồn đúng)', dd.ok && dd.moi === true && kC.soHam() === 0);

  const Lhong = luuGia(); Lhong.m.set(KhoHam.KHOA_LUU, '{không phải json');
  const kD = KhoHam.moi(); kD.tao('giu');
  const dh = kD.docLuu(Lhong);
  kiem('dữ liệu lưu hỏng: luu-hong, kho đang có KHÔNG bị xóa', !dh.ok && dh.ma === 'luu-hong' && kD.tim('giu') !== null, J(dh));
  const Lsai = luuGia(); Lsai.m.set(KhoHam.KHOA_LUU, JSON.stringify({ ham: [] }));
  kiem('thiếu số phiên bản: luu-hong', kD.docLuu(Lsai).ma === 'luu-hong');
  const Lmoi = luuGia(); Lmoi.m.set(KhoHam.KHOA_LUU, JSON.stringify({ phienBan: 99, ham: [{ ten: 'tuongLai', thamSo: [], than: ['wait()'] }] }));
  const dm = kD.docLuu(Lmoi);
  kiem('phiên bản lạ (mới hơn): phien-ban-la, không đọc, kho giữ nguyên', !dm.ok && dm.ma === 'phien-ban-la' && dm.phienBan === 99 && kD.tim('giu') !== null && kD.tim('tuongLai') === null, J(dm));
  const gm = kD.ghiLuu(Lmoi);
  kiem('đã gặp dữ liệu phiên bản mới thì ghiLuu không ghi đè', !gm.ok && gm.ma === 'phien-ban-la' && JSON.parse(Lmoi.m.get(KhoHam.KHOA_LUU)).phienBan === 99);
  const Lbo = luuGia(); Lbo.m.set(KhoHam.KHOA_LUU, JSON.stringify({ phienBan: 1, ham: [{ ten: 'ok', thamSo: [], than: ['wait()'] }, { ten: '1bad', than: [] }, { ten: 'ok', than: [] }, { ten: 'wait', than: [] }, null, 'x'] }));
  const kE = KhoHam.moi(); const de = kE.docLuu(Lbo);
  kiem('mục hỏng / trùng tên / trùng hàm gốc bị bỏ riêng, không làm hỏng cả kho', de.ok && de.soHam === 1 && de.boQua === 5 && kE.tim('ok') !== null, J(de));
  const Lloi = { getItem: () => null, setItem: () => { throw new Error('đầy'); } };
  kiem('setItem ném lỗi (hết chỗ): khong-ghi-duoc, không văng ngoại lệ', kA.ghiLuu(Lloi).ma === 'khong-ghi-duoc');
  const Ldoc = { getItem: () => { throw new Error('chặn'); }, setItem: () => {} };
  kiem('getItem ném lỗi: luu-hong, không văng ngoại lệ', KhoHam.moi().docLuu(Ldoc).ma === 'luu-hong');
  kA.sua('move', ['wait()']); kA.ghiLuu(L);
  const kF = KhoHam.moi(); kF.docLuu(L);
  kiem('ghi lại sau khi sửa: lần đọc sau thấy bản mới (sửa là sửa cho mọi nơi dùng)', bang(kF.tim('move').than, ['wait()']));

  // kho mặc định dùng thẳng
  KhoHam.tao('mac_dinh');
  kiem('kho mặc định dùng thẳng KhoHam.tao / ds / xoa', KhoHam.ds().length === 1 && KhoHam.xoa('mac_dinh').ok && KhoHam.ds().length === 0 && KhoHam.macDinh.soHam() === 0);
  kiem('hai kho độc lập không chia sẻ dữ liệu', KhoHam.moi().soHam() === 0 && k.soHam() === 2);
  kiem('hàm gốc mặc định của kho phủ cả xe bánh lẫn nhện', ['left_move', 'right_back', 'wait', 'go_up', 'go_right'].every((t) => KhoHam.HAM_GOC_MAC_DINH.includes(t)));
}

/* ================================================================ SỔ CHƯƠNG */
console.log('\n== 16. Sổ chương: mã cố định, id tính theo thứ tự chương, đổi thứ tự ==');
{
  const ds = ManHoc.danhSach;
  const dsMa = ds.map((m) => m.ma);
  kiem('mọi màn có chuong (trong thu-tu-chuong), so nguyên 1–10, ma = chuong + "." + so, ma không trùng',
    ds.every((m) => ThuTu.thuTu.includes(m.chuong) && Number.isInteger(m.so) && m.so >= 1 && m.so <= 10 && m.ma === m.chuong + '.' + m.so) &&
      new Set(dsMa).size === ds.length);
  kiem('thứ tự chương hiện tại: hai-banh, xuong-ham, vong-lap; có tên hiển thị cho từng chương',
    bang(ThuTu.thuTu, ['hai-banh', 'xuong-ham', 'vong-lap']) && ThuTu.thuTu.every((c) => typeof ThuTu.ten[c] === 'string' && ThuTu.ten[c].length > 2));
  kiem('id chuỗi 1 và 2 giữ nguyên (1.1…2.10), vong-lap là 3.1…3.10',
    ds.every((m) => m.id === ({ 'hai-banh': 1, 'xuong-ham': 2, 'vong-lap': 3 })[m.chuong] + '.' + m.so));
  kiem('danhSach xếp theo thứ tự chương rồi theo so', bang(ds.map((m) => m.chuong + '.' + m.so), [].concat(
    ...ThuTu.thuTu.map((c) => Array.from({ length: 10 }, (_, i) => c + '.' + (i + 1))))));
  kiem('ManHoc.chuong(): ba chương theo thứ tự, mỗi chương { ma, ten, so, soMan }',
    bang(ManHoc.chuong(), [{ ma: 'hai-banh', ten: 'Hai bánh', so: 1, soMan: 10 }, { ma: 'xuong-ham', ten: 'Xưởng hàm', so: 2, soMan: 10 }, { ma: 'vong-lap', ten: 'Vòng lặp', so: 3, soMan: 10 }]), J(ManHoc.chuong()));
  kiem('tim(id) và timMa(ma) tìm cùng một màn; id lạ / mã lạ → null',
    ManHoc.tim('3.4') === ManHoc.timMa('vong-lap.4') && ManHoc.tim('3.4').ten === 'Lặp một cụm' && ManHoc.tim('9.9') === null && ManHoc.timMa('khong.co') === null);
  kiem('thêm màn sai (chương lạ, thiếu so, trùng mã) → ném lỗi và không làm bẩn sổ',
    (() => {
      const n = ds.length;
      const thu = (m) => { try { ManHoc.them([m]); return false; } catch (e) { return true; } };
      return thu({ chuong: 'la-hoac', so: 1 }) && thu({ chuong: 'vong-lap' }) && thu({ chuong: 'vong-lap', so: 4 }) && ds.length === n;
    })());

  // đảo hai chương rồi kiểm id
  const gocTT = ThuTu.thuTu.slice();
  try {
    ThuTu.thuTu.splice(0, ThuTu.thuTu.length, 'hai-banh', 'vong-lap', 'xuong-ham');
    ManHoc.tinhLai();
    kiem('đảo xuong-ham ↔ vong-lap: id của vong-lap thành 2.x, xuong-ham thành 3.x, hai-banh vẫn 1.x',
      ds.filter((m) => m.chuong === 'vong-lap').every((m) => m.id === '2.' + m.so) && ds.filter((m) => m.chuong === 'xuong-ham').every((m) => m.id === '3.' + m.so) &&
        ds.filter((m) => m.chuong === 'hai-banh').every((m) => m.id === '1.' + m.so));
    kiem('đảo: ma KHÔNG đổi (khóa lưu tiến độ), danhSach xếp lại: hai-banh, vong-lap, xuong-ham',
      ds.every((m) => m.ma === m.chuong + '.' + m.so) && bang(ds.map((m) => m.chuong).filter((c, i, a) => a.indexOf(c) === i), ['hai-banh', 'vong-lap', 'xuong-ham']));
    kiem('đảo: tim("2.4") giờ là màn 4 của vong-lap, tim("3.4") là màn 4 của xuong-ham, timMa không đổi',
      ManHoc.tim('2.4').ma === 'vong-lap.4' && ManHoc.tim('3.4').ma === 'xuong-ham.4' && ManHoc.timMa('xuong-ham.4').id === '3.4');
    kiem('đảo: ManHoc.chuong() đổi theo (so của vong-lap = 2)',
      bang(ManHoc.chuong().map((c) => c.ma + ':' + c.so), ['hai-banh:1', 'vong-lap:2', 'xuong-ham:3']));
    ThuTu.thuTu.splice(0, ThuTu.thuTu.length, 'vong-lap', 'xuong-ham', 'hai-banh');
    ManHoc.tinhLai();
    kiem('đảo ngược cả ba: vong-lap 1.x, xuong-ham 2.x, hai-banh 3.x; màn đầu danhSach là vong-lap.1',
      ManHoc.timMa('hai-banh.10').id === '3.10' && ManHoc.timMa('vong-lap.1').id === '1.1' && ds[0].ma === 'vong-lap.1');
  } finally {
    ThuTu.thuTu.splice(0, ThuTu.thuTu.length, ...gocTT);
    ManHoc.tinhLai();
  }
  kiem('trả thứ tự về cũ: id về như ban đầu', ds.every((m) => m.id === ({ 'hai-banh': 1, 'xuong-ham': 2, 'vong-lap': 3 })[m.chuong] + '.' + m.so) && ManHoc.tim('2.7').ma === 'xuong-ham.7');
}

/* ======================================================= CHƯƠNG VÒNG LẶP for */
console.log('\n== 17. Dòng thụt lề trong khung; cauTruc; chương vong-lap ==');
{
  // khung code với dòng thụt lề
  const chinh = ['for i in range(2):', '    move()', '', '    turn_right()', 'move()'];
  kiem('thụt lề: mỗi dòng (kể cả for và thân for) là một ô; dòng trống không tính', KhungCode.soDong(chinh) === 4);
  const g = KhungCode.ghep({ chinh, hamCuaMan: [] }, [H('side', ['for i in range(3):', '    move()'])]);
  kiem('ghép: thân hàm có for thụt thêm 4, chương trình giữ nguyên thụt lề của học sinh',
    bang(g.dong, ['def side():', '    for i in range(3):', '        move()'].concat(chinh)), J(g.dong));
  kiem('ánh xạ dòng thụt lề: dòng Python → số ô (kể cả ô trống) của chương trình', bang(g.anhXa[4], { cot: 'chinh', dong: 1 }) && bang(g.anhXa[7], { cot: 'chinh', dong: 4 }) && bang(g.anhXa[3], { cot: 'hamEm', ten: 'side', dong: 2 }), J(g.anhXa));
  kiem('demO đếm dòng thụt lề như dòng thường: 4 ô chương trình + 2 ô thân side', KhungCode.demO({ chinh }, [H('side', ['for i in range(3):', '    move()'])]) === 6);
  const t = KhungCode.kiemTra({ chinh: 4 }, { chinh: ['for i in range(2):', '    a()', '    b()', '    c()', 'd()'] });
  kiem('tràn khung tính cả dòng for và dòng thụt lề (5 dòng > 4 ô)', t.length === 1 && t[0].ma === 'tran-khung' && t[0].can === 5, J(t));

  // cauTruc
  kiem('cauTruc: hai-banh và xuong-ham [], vong-lap ["for"]; khung màn mang theo cauTruc',
    ManHoc.danhSach.every((m) => bang(m.cauTruc, m.chuong === 'vong-lap' ? ['for'] : []) && bang(m.khung.cauTruc, m.cauTruc)));
  kiem('khungDayDu không tự thêm cauTruc (không khai thì không kiểm)', KhungCode.khungDayDu({ chinh: 10 }).cauTruc === undefined);
  const ct = (kh, bai) => KhungCode.kiemTra(kh, bai).map((e) => e.ma);
  kiem('cau-truc-chua-hoc: for trong chương trình khi cauTruc [] → bị báo, nêu dòng', (() => {
    const r = KhungCode.kiemTra({ chinh: 10, cauTruc: [] }, { chinh: ['move()', 'for i in range(2):', '    move()'] });
    return r.length === 1 && r[0].ma === 'cau-truc-chua-hoc' && r[0].cot === 'chinh' && r[0].dong === 2 && /chương trình, dòng 2/.test(r[0].loi);
  })());
  kiem('cau-truc-chua-hoc: có "for" trong cauTruc, hoặc không khai cauTruc → không báo',
    ct({ chinh: 10, cauTruc: ['for'] }, { chinh: ['for i in range(2):', '    move()'] }).length === 0 && ct({ chinh: 10 }, { chinh: ['for i in range(2):', '    move()'] }).length === 0);
  kiem('cau-truc-chua-hoc: chữ "for" trong chú thích hay tên biến (before) không bị báo',
    ct({ chinh: 10, cauTruc: [] }, { chinh: ['# for i in range(2):', 'before()', 'move()  # for'] }).length === 0);
  const ctm = KhungCode.kiemTra({ chinh: 10, cauTruc: [] }, { chinh: ['f()'], hamCuaMan: [H('f', ['for i in range(2):', '    wait()'])] });
  kiem('cau-truc-chua-hoc: for trong hàm của màn → báo, cot hamMan kèm tên hàm', ctm.length === 1 && ctm[0].cot === 'hamMan' && ctm[0].ten === 'f' && /hàm f của màn, dòng 1/.test(ctm[0].loi), J(ctm));
  kiem('cau-truc-chua-hoc: hàm của em không bị kiểm (kho dùng ở mọi màn; sân thử Xưởng cũng chạy được)',
    KhungCode.kiemTra({ chinh: 10, cauTruc: [] }, { chinh: ['f()'] }, [], [H('f', ['for i in range(2):', '    wait()'])]).length === 0);
  const hb = ManHoc.timMa('hai-banh.2'), vl = ManHoc.timMa('vong-lap.1'), xh = ManHoc.timMa('xuong-ham.3');
  const forBai = { chinh: ['for i in range(3):', '    left_move()', '    right_move()', '    wait()'] };
  const rHb = ChamHoc.cham(hb, forBai, []);
  kiem('qua máy chấm: màn hai-banh dùng for → chỉ cau-truc-chua-hoc, không chạy, 0 sao', maCua(rHb).join() === 'cau-truc-chua-hoc' && rHb.sao === 0 && rHb.vet.length === 0, J(maCua(rHb)));
  const rXh = ChamHoc.cham(xh, { chinh: ['for i in range(2):', '    move()'] }, EM);
  kiem('qua máy chấm: màn xuong-ham dùng for → cau-truc-chua-hoc', maCua(rXh).join() === 'cau-truc-chua-hoc', J(maCua(rXh)));
  const rVl = ChamHoc.cham(vl, vl.loiGiai, EM);
  kiem('qua máy chấm: màn vong-lap dùng for → bình thường, 3 sao; chiTietO.chinh = 2 (for + thân)', rVl.sao === 3 && rVl.chiTietO.chinh === 2 && rVl.chanDoan.length === 0, J(rVl.chanDoan));
  const rThieu = ChamHoc.cham(vl, { chinh: ['for i in range(3):'] }, EM);
  kiem('vong-lap: for không có thân → báo lỗi cú pháp ở dòng for, nêu cần dòng thụt vào', maCua(rThieu).join() === 'loi-cu-phap' && /thụt vào/.test(rThieu.chanDoan[0].loi) && /dòng 1/.test(rThieu.chanDoan[0].loi), J(rThieu.chanDoan));
  const rThua = ChamHoc.cham(vl, { chinh: ['move()', '    move()'] }, EM);
  kiem('vong-lap: dòng thụt lề thừa (không có for) → loi-thut-le', maCua(rThua).join() === 'loi-thut-le', J(rThua.chanDoan));
  const rHamFor = ChamHoc.cham(ManHoc.timMa('vong-lap.6'), { chinh: ['side()'] }, tron(EM, [H('side', ['for i in range(3):', '    move()'])]));
  kiem('hàm của em có for: ô được tính theo vết (side 2 ô + move 3 ô + 1 ô chương trình)', rHamFor.soO === 6 && bang(rHamFor.hamDaDung, ['move', 'side']), J([rHamFor.soO, rHamFor.hamDaDung]));

  // 3.7 lệch một, 3.8 thụt lề
  const m37 = ManHoc.timMa('vong-lap.7'), m38 = ManHoc.timMa('vong-lap.8');
  const so37 = (n) => ChamHoc.cham(m37, { chinh: ['for i in range(' + n + '):', '    move()', 'turn_right()', 'for i in range(3):', '    move()'] }, EM);
  kiem('3.7: maMau và lời giải chỉ khác đúng một chỗ: số trong range đầu tiên (5 → 4)',
    m37.maMau.chinh.length === m37.loiGiai.chinh.length && m37.maMau.chinh.filter((s, i) => s !== m37.loiGiai.chinh[i]).join() === 'for i in range(5):' && m37.loiGiai.chinh[0] === 'for i in range(4):');
  kiem('3.7: range(5) xe đi lố một ô, rẽ rồi chạy qua hàng của cờ: chua-toi-co, robot ở (3,0), KHÔNG đâm tường',
    (() => { const r = so37(5); return !r.thang && maCua(r).join() === 'chua-toi-co' && bang(r.chanDoan[0].robot, { x: 3, y: 0, huong: 1 }); })());
  kiem('3.7: range(4) thắng 3 sao; range(3) và range(6) đều trượt', so37(4).sao === 3 && !so37(3).thang && !so37(6).thang);
  kiem('3.7: lời giải thắng ở nhịp thứ 8, mất đúng một nhịp so với đường tắt không có (BFS = 8)', so37(4).soNhip === 8 && nhipNganNhat(m37) === 8);
  const bo4 = (ds, i) => ds.map((s, k) => (k === i ? s.replace(/^ {4}/, '') : s));
  kiem('3.8: maMau và lời giải giống nhau từng chữ, chỉ khác độ thụt của đúng một dòng (turn_left)',
    m38.maMau.chinh.length === 5 && m38.maMau.chinh[2] === '    turn_left()' && bang(bo4(m38.maMau.chinh, 2), m38.loiGiai.chinh) &&
      m38.maMau.chinh.filter((s, i) => s !== m38.loiGiai.chinh[i]).length === 1);
  const r38 = ChamHoc.cham(m38, m38.maMau, EM);
  kiem('3.8: chạy maMau: chương trình hợp lệ nhưng xe quay vòng rồi đâm tường (dam-tuong + chua-toi-co), không có lỗi cú pháp',
    !r38.thang && maCua(r38).includes('dam-tuong') && maCua(r38).includes('chua-toi-co') && !maCua(r38).some((c) => /loi-/.test(c)), J(maCua(r38)));
  kiem('3.8: thụt turn_left ra ngoài vòng lặp → 3 sao', ChamHoc.cham(m38, { chinh: bo4(m38.maMau.chinh, 2) }, EM).sao === 3);
  kiem('3.8: thụt nhầm dòng move() đầu ra ngoài thì vòng for không có thân: lỗi, không thắng', !ChamHoc.cham(m38, { chinh: bo4(m38.maMau.chinh, 1) }, EM).thang);
  kiem('3.8: thụt turn_left VÀO sâu hơn (hai bậc) → loi-thut-le', maCua(ChamHoc.cham(m38, { chinh: ['for i in range(4):', '    move()', '        turn_left()', 'for i in range(3):', '    move()'] }, EM)).includes('loi-thut-le'));

  // cần for: trải for của lời giải ra thì tràn khung hoặc mất sao
  function traiFor(ds) {
    const kq = [];
    for (let i = 0; i < ds.length; i++) {
      const mk = /^for (\w+) in range\((\d+)\):$/.exec(ds[i]);
      if (!mk) { kq.push(ds[i]); continue; }
      const than = [];
      let j = i + 1;
      while (j < ds.length && /^ {4}/.test(ds[j])) { than.push(ds[j].slice(4)); j++; }
      const trong = traiFor(than);
      for (let k = 0; k < +mk[2]; k++) kq.push(...trong);
      i = j - 1;
    }
    return kq;
  }
  kiem('traiFor tự kiểm: trải for lồng nhau', bang(traiFor(['for i in range(2):', '    a()', '    for j in range(2):', '        b()', 'c()']), ['a()', 'b()', 'b()', 'a()', 'b()', 'b()', 'c()']));
  const dsVl = ManHoc.danhSach.filter((m) => m.chuong === 'vong-lap');
  const khoVl = (m) => tron(khoCuoi.ds(), m.loiGiai.hamCuaEmMoi);
  const bangFor = [];
  kiem('mọi màn vong-lap khai canFor ("tran-khung" hoặc "mat-sao") và lời giải có dùng for',
    dsVl.every((m) => ['tran-khung', 'mat-sao'].includes(m.canFor) && m.loiGiai.chinh.concat(...m.loiGiai.hamCuaEmMoi.map((h) => h.than)).some((s) => /^\s*for\b/.test(s))));
  for (const m of dsVl) {
    const bai = {
      chinh: traiFor(m.loiGiai.chinh),
      hamCuaMan: m.loiGiai.hamCuaMan.map((h) => H(h.ten, traiFor(h.than)))
    };
    const emKhong = m.loiGiai.hamCuaEmMoi.map((h) => H(h.ten, traiFor(h.than), h.thamSo));
    const r = ChamHoc.cham(Object.assign({}, m, { cauTruc: [], khung: Object.assign({}, m.khung, { cauTruc: ['for'] }) }), bai, tron(khoCuoi.ds(), emKhong));
    const tran = maCua(r).includes('tran-khung');
    bangFor.push({ id: m.id, canFor: m.canFor, tran, thang: r.thang, sao: r.sao, o: r.soO, saoO: m.sao.o });
    if (m.canFor === 'tran-khung') kiem(m.id + ': CẦN for (tràn khung): trải for ra thì tran-khung, không chạy', tran && !r.thang && r.sao === 0, J(maCua(r)));
    else kiem(m.id + ': for giúp đạt 3 sao: trải for ra vẫn vừa khung, thắng nhưng ' + r.soO + ' ô > ' + m.sao.o + ' → dưới 3 sao', !tran && r.thang && r.soO > m.sao.o && r.sao < 3, J([maCua(r), r.thang, r.soO, r.sao]));
  }
  console.log('\n  Bảng chương vong-lap: viết không dùng for thì?');
  for (const b of bangFor) console.log('  ' + b.id.padEnd(5) + ' | ' + b.canFor.padEnd(10) + ' | ' + (b.tran ? 'tràn khung' : 'ô ' + b.o + ' > ' + b.saoO + ' → ' + b.sao + ' sao'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
