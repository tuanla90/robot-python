/* ============================================================================
   kiem-hoc.mjs — máy kiểm "Đường học": luật sân, khung riêng từng hàm, máy chấm,
   sân thử, 20 màn và bộ dò đường tắt (BFS).
   Chạy: node robotics/hoc/kiem-hoc.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'man-chuoi-2.js'));      // nối cả chuỗi 1
const TV = require(path.join(day, 'thu-vien-mau.js'));

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

console.log('\n== 6. Vết: cho / ngan khi gọi lồng hàm (khung riêng từng hàm) ==');
{
  const man = ManHoc.tim('2.9');
  const kq = ChamHoc.cham(man, man.loiGiai, TV);
  const lenh = kq.vet.filter((e) => e.loai === 'lenh');
  const l0 = lenh[0];
  kiem('lệnh đầu: left_move trong move (HÀM, dòng 1) trong corner (HÀM) gọi từ CHƯƠNG TRÌNH dòng 1',
    l0.ten === 'left_move' && bang(l0.cho, { cot: 'ham', dong: 1, ten: 'move' }) &&
    bang(l0.ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'ham', dong: 1, ten: 'corner' }]), J(l0));
  const turn = lenh.find((e) => e.ten === 'left_move' && e.ngan.length === 2 && e.ngan[1].dong === 3);
  kiem('lệnh trong turn_right (gọi từ corner dòng 3): ngan trỏ đúng dòng 3 của corner',
    turn && bang(turn.ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'ham', dong: 3, ten: 'corner' }]) && bang(turn.cho, { cot: 'ham', dong: 1, ten: 'turn_right' }), J(turn));
  const l2 = lenh.find((e) => e.ngan.length && e.ngan[0].dong === 2);
  kiem('lần gọi corner() thứ hai (CHƯƠNG TRÌNH dòng 2) có ngan[0] = chinh 2', !!l2);
  const wait0 = lenh.find((e) => e.ten === 'wait');
  kiem('wait đầu tiên nằm ở dòng 3 thân move', bang(wait0.cho, { cot: 'ham', dong: 3, ten: 'move' }), J(wait0.cho));
  const t0 = ChamHoc.cham(ManHoc.tim('1.1'), ManHoc.tim('1.1').loiGiai, TV).vet[0];
  kiem('gọi thẳng từ chương trình: ngan rỗng, cho = chinh dòng 1', bang(t0.cho, { cot: 'chinh', dong: 1 }) && t0.ngan.length === 0, J(t0));
  const thuTu = kq.vet.map((e) => (e.loai === 'lenh' ? 'l' : 'n')).join('');
  kiem('vết xen kẽ đúng thứ tự: lệnh … nhịp (nhịp đến sau lệnh wait)', /^(l+n)+$/.test(thuTu));
  const mo = kq.vet.filter((e) => e.loai === 'nhip');
  kiem('nhịp có robot {x,y,huong,banh} và suKien', mo.every((n) => n.robot && n.robot.banh && Array.isArray(n.suKien)) && mo.length === kq.soNhip);
  // hai tầng tự dựng
  const man2 = Object.assign({}, ManHoc.tim('2.3'), { khung: { chinh: 10, moiHam: 10, soHam: 3 } });
  const k2 = ChamHoc.cham(man2, {
    ham: [H('a', T_MOVE), H('b', ['a()', 'a()'])],
    chinh: ['b()', 'b()']
  }, TV);
  const pre = k2.vet.filter((e) => e.loai === 'lenh');
  kiem('hai tầng: left_move đầu tiên ngan = [chinh 1, b dòng 1]', bang(pre[0].ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'ham', dong: 1, ten: 'b' }]), J(pre[0]));
  kiem('lần a() thứ hai trong b: ngan = [chinh 1, b dòng 2]', bang(pre[3].ngan, [{ cot: 'chinh', dong: 1 }, { cot: 'ham', dong: 2, ten: 'b' }]), J(pre[3]));
  kiem('sau khi hàm kết thúc, ngan được rút ra (lệnh b() thứ hai: chinh 2)', pre[6].ngan[0].dong === 2, J(pre[6]));
  // ô trống giữ nguyên số thứ tự ô
  const k3 = ChamHoc.cham(man2, { ham: [H('move', ['', 'left_move()', '', 'right_move()', 'wait()'])], chinh: ['', 'move()'] }, TV);
  const p3 = k3.vet.filter((e) => e.loai === 'lenh');
  kiem('ô trống vẫn tính số thứ tự: left_move ở ô 2 của move, gọi từ ô 2 của chương trình',
    bang(p3[0].cho, { cot: 'ham', dong: 2, ten: 'move' }) && bang(p3[0].ngan, [{ cot: 'chinh', dong: 2 }]), J(p3[0]));
  // thư viện vẫn còn đường ánh xạ
  const manTV = Object.assign({}, ManHoc.tim('2.3'), { thuVien: ['move'] });
  const k4 = ChamHoc.cham(manTV, { ham: [], chinh: ['move()'] }, TV);
  kiem('hàm thư viện: cho = {cot:thuvien, ten, dong} và ngan trỏ dòng gọi ở chương trình',
    bang(k4.vet[0].cho, { cot: 'thuvien', dong: 2, ten: 'move' }) && bang(k4.vet[0].ngan, [{ cot: 'chinh', dong: 1 }]), J(k4.vet[0]));
}

/* ======================================================== 2. KHUNG CODE */
console.log('\n== 7. Khung code: ô riêng từng hàm, ô khóa, sai chỗ ==');
{
  const kh = { chinh: 10, moiHam: 10, soHam: 3, khoaChinh: 0, khoaHam: 0 };
  kiem('khung mặc định 10 / 10, soHam 0', bang(KhungCode.khungDayDu({}), { chinh: 10, moiHam: 10, soHam: 0, khoaChinh: 0, khoaHam: 0 }));
  kiem('vừa khung: không lỗi', KhungCode.kiemTra(kh, { chinh: dong(10), ham: [H('f', dong(10, 'wait()'))] }).length === 0);
  const t = KhungCode.kiemTra({ chinh: 10 }, { chinh: dong(11) });
  kiem('tràn chương trình: tran-khung, nói rõ chương trình, cần bao nhiêu, có bao nhiêu',
    t.length === 1 && t[0].ma === 'tran-khung' && t[0].cot === 'chinh' && t[0].can === 11 && t[0].co === 10 &&
    /Chương trình/.test(t[0].loi) && /11 dòng/.test(t[0].loi) && /10 ô/.test(t[0].loi), J(t));
  const th = KhungCode.kiemTra(kh, { chinh: ['f()'], ham: [H('f', dong(5, 'wait()')), H('goc', dong(11, 'wait()'))] });
  kiem('tràn thân một hàm: nói rõ HÀM nào, các hàm khác không bị tính chung',
    th.length === 1 && th[0].ma === 'tran-khung' && th[0].cot === 'ham' && th[0].ten === 'goc' && th[0].can === 11 && /Hàm "goc"/.test(th[0].loi), J(th));
  kiem('mỗi hàm một khung riêng: hai hàm 10 dòng đều vừa', KhungCode.kiemTra(kh, { ham: [H('a', dong(10, 'wait()')), H('b', dong(10, 'wait()'))] }).length === 0);
  const k = KhungCode.kiemTra(Object.assign({}, kh, { khoaChinh: 5 }), { chinh: dong(6) });
  kiem('ô khóa chương trình: 10 ô khóa 5 → còn 5 ô', k.length === 1 && k[0].co === 5 && k[0].can === 6 && /khóa/.test(k[0].loi), J(k));
  kiem('ô khóa: đủ 5 dòng thì vừa', KhungCode.kiemTra(Object.assign({}, kh, { khoaChinh: 5 }), { chinh: dong(5) }).length === 0);
  const kk = KhungCode.kiemTra(Object.assign({}, kh, { khoaHam: 7 }), { ham: [H('f', dong(4, 'wait()'))] });
  kiem('khoaHam trừ vào khung MỖI hàm (10 − 7 = 3)', kk.length === 1 && kk[0].ten === 'f' && kk[0].co === 3, J(kk));
  kiem('dòng trống không tính ô', KhungCode.soDong(['a', '', '  ', 'b']) === 2 &&
    KhungCode.kiemTra({ chinh: 2 }, { chinh: ['a', '', 'b', '   '] }).length === 0);
  kiem('soO = ô chương trình + tổng ô thân các hàm (def không tốn ô)',
    KhungCode.soO({ chinh: ['a', 'b'], ham: [H('f', ['x', '', 'y']), H('g', ['z'])] }) === 5);
  const d = KhungCode.kiemTra(kh, { chinh: ['move()', 'def f():', '    move()'] });
  kiem('def-trong-chuong-trinh', d.length === 1 && d[0].ma === 'def-trong-chuong-trinh' && d[0].dong === 2, J(d));
  const d0 = KhungCode.kiemTra({ chinh: 10, soHam: 0 }, { chinh: ['def f():'] });
  kiem('def trong chương trình khi chưa có Xưởng hàm: nói thẳng màn chưa có Xưởng hàm', /chưa có Xưởng hàm/.test(d0[0].loi));
  const c = KhungCode.kiemTra({ chinh: 10, soHam: 0 }, { chinh: [], ham: [H('f', ['wait()'])] });
  kiem('chua-mo-xuong khi soHam = 0 mà có hàm', c.length === 1 && c[0].ma === 'chua-mo-xuong', J(c));
  kiem('soHam = 0 và không có hàm → hợp lệ', KhungCode.kiemTra({ chinh: 10, soHam: 0 }, { chinh: ['a'], ham: [] }).length === 0);
  const q = KhungCode.kiemTra({ chinh: 10, soHam: 2 }, { ham: [H('a', ['x']), H('b', ['x']), H('c', ['x'])] });
  kiem('qua-nhieu-ham: vượt soHam', q.length === 1 && q[0].ma === 'qua-nhieu-ham' && q[0].can === 3 && q[0].co === 2 && /tối đa 2 hàm/.test(q[0].loi), J(q));
  const tt = KhungCode.kiemTra(kh, { ham: [H('a', ['x']), H('a', ['y'])] });
  kiem('ham-trung-ten: hai hàm cùng tên', tt.length === 1 && tt[0].ma === 'ham-trung-ten' && tt[0].ten === 'a', J(tt));
  const tg = KhungCode.kiemTra(kh, { ham: [H('wait', ['x'])] }, ['left_move', 'right_move', 'wait']);
  kiem('ham-trung-ten: trùng tên hàm gốc', tg.length === 1 && tg[0].ma === 'ham-trung-ten' && tg[0].ten === 'wait', J(tg));
  kiem('đổi mã cũ: không còn def-o-cot-chinh / lenh-le-o-cot-ham / chua-mo-cot-ham',
    !/def-o-cot-chinh|lenh-le-o-cot-ham|chua-mo-cot-ham/.test(J([d, c, q, tt]) + require('node:fs').readFileSync(path.join(day, 'khung-code.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//, '')));
  kiem('lời tràn khung có gợi ý hướng khi đã mở Xưởng hàm', /lặp lại/.test(KhungCode.kiemTra({ chinh: 2, soHam: 2 }, { chinh: dong(3) })[0].loi));
  kiem('lời tràn khung KHÔNG nói đáp án (không nêu tên hàm cụ thể)', !/move|turn|def /.test(KhungCode.kiemTra({ chinh: 2, soHam: 2 }, { chinh: dong(3) })[0].loi));
}

console.log('\n== 8. Khung code: ghép Python, ánh xạ, xuất .py ==');
{
  const bai = { ham: [H('f', ['', 'move()']), H('g', ['f()', 'f()'], ['n'])], chinh: ['g(1)', '', 'f()'] };
  const g = KhungCode.ghep(bai, [{ ten: 'move', ma: 'def move():\n    left_move()\n    wait()\n' }]);
  const ds = g.ma.split('\n');
  kiem('thứ tự: thư viện → các hàm của em (def + thân thụt 4) → chương trình',
    ds.join('|') === 'def move():|    left_move()|    wait()|def f():||    move()|def g(n):|    f()|    f()|g(1)||f()', ds.join('|'));
  kiem('thư viện không bị thêm dòng trống thừa', ds[2] === '    wait()');
  kiem('ánh xạ thư viện: kèm tên hàm và dòng trong hàm', bang(g.anhXa[2], { cot: 'thuvien', ten: 'move', dong: 2 }), J(g.anhXa[2]));
  kiem('ánh xạ dòng def của hàm em: dong 0 (tên hàm)', bang(g.anhXa[4], { cot: 'ham', ten: 'f', dong: 0 }), J(g.anhXa[4]));
  kiem('ánh xạ thân hàm theo số ô (kể cả ô trống)', bang(g.anhXa[5], { cot: 'ham', ten: 'f', dong: 1 }) && bang(g.anhXa[6], { cot: 'ham', ten: 'f', dong: 2 }), J(g.anhXa[6]));
  kiem('ánh xạ hàm thứ hai', bang(g.anhXa[7], { cot: 'ham', ten: 'g', dong: 0 }) && bang(g.anhXa[9], { cot: 'ham', ten: 'g', dong: 2 }));
  kiem('ánh xạ chương trình', bang(g.anhXa[10], { cot: 'chinh', dong: 1 }) && bang(g.anhXa[12], { cot: 'chinh', dong: 3 }));
  kiem('anhXa[0] bỏ trống (dòng Python tính từ 1)', g.anhXa[0] === null && g.anhXa.length === ds.length + 1);
  const g2 = KhungCode.ghep({ chinh: ['a'] }, []);
  kiem('không thư viện, không hàm: chỉ có chương trình', g2.ma === 'a');
  const g3 = KhungCode.ghep({ chinh: ['x'], ham: [H('f', ['for i in range(2):', '    wait()'])] }, []);
  kiem('khối lồng trong thân thụt thêm như Python', g3.dong[1] === '    for i in range(2):' && g3.dong[2] === '        wait()', J(g3.dong));

  const py = KhungCode.xuatPy({ ham: [H('f', ['move()', '', 'turn_left()'])], chinh: ['f()', '', 'turn_left()'] }, ['move', 'turn_left', 'u_turn']);
  const pd = py.split('\n');
  kiem('xuất .py: dòng chú thích nói thư viện dùng hàm gì', /^# .*move, turn_left/.test(pd[0]) && !/u_turn/.test(pd[0]), pd[0]);
  kiem('xuất .py: có def + thân thụt 4, bỏ ô trống, rồi tới chương trình',
    py.indexOf('def f():\n    move()\n    turn_left()') > 0 && py.indexOf('def f()') < py.indexOf('f()\nturn_left()') && /\nf\(\)\nturn_left\(\)\n$/.test(py), JSON.stringify(py));
  kiem('xuất .py: không chép mã thư viện', !/left_move|def move|def turn_left/.test(py));
  kiem('xuất .py kết thúc bằng xuống dòng', py.endsWith('\n'));
  kiem('xuất .py: không dùng thư viện → chú thích nói rõ',
    /Không dùng/.test(KhungCode.xuatPy({ chinh: ['left_move()'] }, ['move']).split('\n')[0]));
  kiem('xuất .py: hàm tự viết trùng tên thư viện thì không tính là dùng thư viện',
    /Không dùng/.test(KhungCode.xuatPy({ ham: [H('move', ['wait()'])], chinh: ['move()'] }, ['move']).split('\n')[0]));
}

/* =========================================================== 3. MÁY CHẤM */
console.log('\n== 9. Máy chấm: sao, lỗi bọc từ core, mã chẩn đoán ==');
{
  const m12 = ManHoc.tim('1.2');
  const ma = maCua;
  const ok = ChamHoc.cham(m12, m12.loiGiai, TV);
  kiem('thắng đúng 3 sao (1 + ô + nhịp)', ok.thang && ok.sao === 3 && ok.soO === 9 && ok.soNhip === 3, J([ok.thang, ok.sao, ok.soO, ok.soNhip]));
  const dai = ChamHoc.cham(m12, { chinh: ['wait()'].concat(m12.loiGiai.chinh) }, TV);
  kiem('thắng nhưng dùng thêm ô và thêm nhịp → 1 sao', dai.thang && dai.sao === 1 && dai.soO === 10 && dai.soNhip === 4, J([dai.thang, dai.sao, dai.soO, dai.soNhip]));
  const m2 = ManHoc.tim('2.1');
  const k2 = ChamHoc.cham(Object.assign({}, m2, { sao: { o: 99, nhip: 2 } }), m2.loiGiai, TV);
  kiem('chỉ đạt sao ô (không đạt sao nhịp) → 2 sao', k2.sao === 2, String(k2.sao));
  const k3 = ChamHoc.cham(Object.assign({}, m2, { sao: { o: 1, nhip: 99 } }), m2.loiGiai, TV);
  kiem('chỉ đạt sao nhịp → 2 sao', k3.sao === 2);
  kiem('soO tổng = ô chương trình + ô thân hàm (2.1: 4 + 3)', ChamHoc.cham(m2, m2.loiGiai, TV).soO === 7);
  const thua = ChamHoc.cham(m12, { chinh: T_MOVE.slice() }, TV);
  kiem('không thắng → 0 sao, mã chua-toi-co kèm robot ở đâu, hướng nào',
    !thua.thang && thua.sao === 0 && ma(thua).includes('chua-toi-co') &&
    thua.chanDoan[0].robot.x === 2 && /hướng lên/.test(thua.chanDoan[0].loi) && /\(2, 3\)/.test(thua.chanDoan[0].loi), J(thua.chanDoan));

  const m22 = ManHoc.tim('2.2');
  const goiMau = ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'];
  const cu = ChamHoc.cham(m22, { ham: [H('move', [])], chinh: goiMau }, TV);
  kiem('loi-cu-phap: hàm không có thân → đổ lỗi vào phần tên hàm (dòng 0)', ma(cu).join() === 'loi-cu-phap' &&
    bang(cu.chanDoan[0].cho, { cot: 'ham', dong: 0, ten: 'move' }) && /chưa có dòng nào trong thân/.test(cu.chanDoan[0].loi), J(cu.chanDoan));
  const ct = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', 'right_move(', 'wait()'] }, TV);
  kiem('loi-cu-phap: thiếu ngoặc, ghi dòng 2 của chương trình', ma(ct)[0] === 'loi-cu-phap' && /chương trình, dòng 2/.test(ct.chanDoan[0].loi), J(ct.chanDoan));
  const ctH = ChamHoc.cham(m22, { ham: [H('move', ['left_move(', 'right_move()', 'wait()'])], chinh: goiMau }, TV);
  kiem('loi-cu-phap trong thân hàm: ghi tên hàm và dòng', ma(ctH)[0] === 'loi-cu-phap' && /hàm move, dòng 1/.test(ctH.chanDoan[0].loi) && ctH.chanDoan[0].cho.ten === 'move', J(ctH.chanDoan));
  const tl = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', '  right_move()', 'wait()'] }, TV);
  kiem('loi-thut-le: thụt lề thừa giữa chương trình', ma(tl)[0] === 'loi-thut-le' && tl.chanDoan[0].cho.dong === 2, J(tl.chanDoan));
  const td = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['  left_move()', 'right_move()', 'wait()'] }, TV);
  kiem('loi-thut-le: dòng đầu chương trình thụt lề', ma(td)[0] === 'loi-thut-le' && /dòng đầu tiên/.test(td.chanDoan[0].loi), J(td.chanDoan));
  const tdh = ChamHoc.cham(m22, { ham: [H('move', ['    left_move()', 'right_move()', 'wait()'])], chinh: goiMau }, TV);
  kiem('loi-thut-le: dòng đầu thân hàm thụt lề (thân viết ở mức 0)', ma(tdh)[0] === 'loi-thut-le' && /hàm move/.test(tdh.chanDoan[0].loi), J(tdh.chanDoan));
  const lc = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['x = 1 / 0'] }, TV);
  kiem('loi-chay: chia cho 0, ghi chương trình + dòng', ma(lc)[0] === 'loi-chay' && /chương trình, dòng 1/.test(lc.chanDoan[0].loi), J(lc.chanDoan));
  const lcH = ChamHoc.cham(m22, { ham: [H('move', ['x = 1 / 0'])], chinh: goiMau }, TV);
  kiem('loi-chay trong thân hàm: ghi tên hàm', ma(lcH)[0] === 'loi-chay' && /hàm move, dòng 1/.test(lcH.chanDoan[0].loi), J(lcH.chanDoan));
  const vl = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['while True:', '    pass'] }, TV);
  kiem('loi-chay: vòng lặp vô tận không có nhịp', ma(vl)[0] === 'loi-chay', J(vl.chanDoan));
  const qn = ChamHoc.cham(Object.assign({}, ManHoc.tim('1.1'), { nhipToiDa: 30 }), { chinh: ['while True:', '    wait()'] }, TV);
  kiem('qua-nhieu-nhip', ma(qn).join() === 'qua-nhieu-nhip' && qn.soNhip === 30 && !qn.thang, J(qn.chanDoan));
  const hc = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_back()', 'right_back()', 'wait()'] }, TV);
  kiem('ham-chua-co: hàm gốc chưa mở ở màn này (left_back)', ma(hc).join() === 'ham-chua-co' && hc.chanDoan[0].ten === 'left_back' && /left_move, right_move, wait/.test(hc.chanDoan[0].loi), J(hc.chanDoan));
  const hc2 = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['move()'] }, TV);
  kiem('ham-chua-co: hàm chưa tạo, màn chưa mở Xưởng → chỉ nhắc kiểm tra chính tả', ma(hc2).join() === 'ham-chua-co' && !/Xưởng hàm/.test(hc2.chanDoan[0].loi));
  const hc3 = ChamHoc.cham(ManHoc.tim('2.1'), { ham: [], chinh: ['turn_right()'] }, TV);
  kiem('ham-chua-co: màn có Xưởng → nhắc tạo hàm trong Xưởng hàm', ma(hc3).join() === 'ham-chua-co' && /Xưởng hàm/.test(hc3.chanDoan[0].loi));
  const hc4 = ChamHoc.cham(ManHoc.tim('2.4'), { ham: [H('turn_left', ['right_move()', 'wait()'])], chinh: ['turn_left()'] }, TV);
  kiem('hàm tự tạo thì gọi được (không ham-chua-co)', !ma(hc4).includes('ham-chua-co'));
  const tk = ChamHoc.cham(ManHoc.tim('2.1'), { ham: [], chinh: [].concat(T_MOVE, T_MOVE, T_MOVE, T_MOVE) }, TV);
  kiem('tran-khung: không chạy chương trình, 0 sao, vet rỗng', ma(tk).join() === 'tran-khung' && tk.sao === 0 && tk.vet.length === 0 && !tk.thang);
  const dc = ChamHoc.cham(ManHoc.tim('2.1'), { chinh: ['def f():', '    wait()'] }, TV);
  kiem('def-trong-chuong-trinh qua máy chấm', ma(dc).join() === 'def-trong-chuong-trinh');
  const cm = ChamHoc.cham(ManHoc.tim('1.1'), { ham: [H('f', ['wait()'])], chinh: ['f()'] }, TV);
  kiem('chua-mo-xuong qua máy chấm', ma(cm).join() === 'chua-mo-xuong');
  const qh = ChamHoc.cham(ManHoc.tim('2.1'), { ham: [H('a', ['wait()']), H('b', ['wait()'])], chinh: ['a()'] }, TV);
  kiem('qua-nhieu-ham qua máy chấm (2.1 chỉ cho 1 hàm)', ma(qh).join() === 'qua-nhieu-ham');
  const ht = ChamHoc.cham(ManHoc.tim('2.4'), { ham: [H('wait', ['wait()'])], chinh: ['wait()'] }, TV);
  kiem('ham-trung-ten qua máy chấm (trùng tên hàm gốc wait)', ma(ht).join() === 'ham-trung-ten');
  const bg = ChamHoc.cham(ManHoc.tim('1.2'), { chinh: ['left_move()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, TV);
  kiem('banh-goi-lai: lời nêu bánh, dòng, chương trình', ma(bg).includes('banh-goi-lai') && /chương trình, dòng 2/.test(bg.chanDoan.find((c) => c.ma === 'banh-goi-lai').loi), J(bg.chanDoan));
  const bgH = ChamHoc.cham(m22, { ham: [H('move', ['left_move()', 'left_move()', 'right_move()', 'wait()'])], chinh: goiMau }, TV);
  kiem('banh-goi-lai trong thân hàm: ghi tên hàm và dòng', /hàm move, dòng 2/.test(bgH.chanDoan.find((c) => c.ma === 'banh-goi-lai').loi), J(bgH.chanDoan));
  const qw = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', 'right_move()'] }, TV);
  kiem('quen-wait qua máy chấm', ma(qw).includes('quen-wait') && ma(qw).includes('chua-toi-co'));
  const dt = ChamHoc.cham(ManHoc.tim('1.3'), { chinh: ['right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, TV);
  kiem('dam-tuong qua máy chấm: nêu nhịp và ô', ma(dt).includes('dam-tuong') && /nhịp 2/.test(dt.chanDoan.find((c) => c.ma === 'dam-tuong').loi), J(dt.chanDoan));
  kiem('lời chẩn đoán đều là tiếng Việt ngắn (≤ 330 ký tự)',
    [cu, ct, ctH, tl, td, tdh, lc, lcH, vl, qn, hc, hc2, hc3, tk, dc, cm, qh, ht, bg, bgH, qw, dt, thua].every((r) => r.chanDoan.every((c) => c.loi && c.loi.length <= 330 && /[a-zà-ỹ]/.test(c.loi))));
  kiem('py và anhXa được trả về cho giao diện', typeof ok.py === 'string' && ok.anhXa.length > 1);
}

console.log('\n== 10. Máy chấm nhiều sân ==');
{
  const man = {
    id: 'thu', loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], thuVien: [], khung: { chinh: 10, soHam: 0 }, sao: { o: 3, nhip: 1 },
    san: [['.....', '.....', '..F..', '.....', '.....'], ['.....', '..F..', '.....', '.....', '.....']],
    batDau: { x: 2, y: 3, huong: 0 }
  };
  const mot = ChamHoc.cham(man, { chinh: T_MOVE.slice() }, TV);
  kiem('thắng sân 1, trượt sân 2 → không thắng', !mot.thang && mot.sao === 0 && mot.theoSan.length === 2 && mot.theoSan[0].thang && !mot.theoSan[1].thang, J(mot.theoSan.map((s) => s.thang)));
  kiem('chẩn đoán gom từ sân trượt, ghi rõ sân nào', mot.chanDoan.some((c) => c.ma === 'chua-toi-co' && /Sân 2/.test(c.loi)), J(mot.chanDoan));
  const hai = ChamHoc.cham(man, { chinh: ['for i in range(2):', '    left_move()', '    right_move()', '    wait()'] }, TV);
  kiem('chạy chương trình chung: thắng cả hai sân', hai.thang && hai.theoSan.every((s) => s.thang) && hai.soNhip === 2, J(hai.theoSan.map((s) => s.soNhip)));
  kiem('vet lấy từ sân trượt (hoặc sân đầu nếu thắng hết)', J(hai.vet) === J(hai.theoSan[0].vet));
  const bdKhac = Object.assign({}, man, { batDau: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 3, huong: 0 }] });
  kiem('batDau là mảng song song với sân', ChamHoc.cham(bdKhac, { chinh: T_MOVE.slice() }, TV).theoSan.length === 2);
}

console.log('\n== 11. Sân thử của Xưởng hàm (thuHam) ==');
{
  const man = ManHoc.tim('2.4');
  const tr = H('turn_right', ['left_move()', 'wait()']);
  const a = ChamHoc.thuHam(man, { ham: [tr] }, 'turn_right', TV);
  kiem('chạy riêng turn_right: robot ở giữa sân 3×3, quay phải, 1 nhịp, không chẩn đoán',
    bang(a.batDau, { x: 1, y: 1, huong: 0 }) && bang(a.robot, { x: 1, y: 1, huong: 1 }) && a.soNhip === 1 && a.chanDoan.length === 0, J(a));
  kiem('sân thử không có cờ: không báo chua-toi-co', !maCua(a).includes('chua-toi-co') && a.vet.filter((e) => e.loai === 'nhip')[0].suKien.every((s) => s.ma !== 'toi-co'));
  kiem('sân thử là 3×3 trống', bang(ChamHoc.SAN_THU, ['...', '...', '...']));
  const mv = H('move', T_MOVE);
  const b = ChamHoc.thuHam(man, { ham: [mv, tr] }, 'move', TV);
  kiem('chạy riêng move: tiến lên một ô (1,1)→(1,0)', bang(b.robot, { x: 1, y: 0, huong: 0 }) && b.soNhip === 1);
  const c = ChamHoc.thuHam(man, { ham: [H('hai', ['move()', 'move()']), mv] }, 'hai', TV);
  kiem('tiến hai ô trên sân 3×3: đâm ra ngoài sân → dam-tuong, chạy tiếp', maCua(c).includes('dam-tuong') && bang(c.robot, { x: 1, y: 0, huong: 0 }) && c.soNhip === 2, J(c.chanDoan));
  kiem('vết của sân thử: cho / ngan đúng cột, tên hàm, không có dòng gọi giả',
    bang(c.vet[0].cho, { cot: 'ham', dong: 1, ten: 'move' }) && bang(c.vet[0].ngan, [{ cot: 'ham', dong: 1, ten: 'hai' }]), J(c.vet[0]));
  const d = ChamHoc.thuHam(man, { ham: [H('sai', ['left_move()', 'right_move()'])] }, 'sai', TV);
  kiem('quen-wait và banh-goi-lai bắt được ở sân thử', maCua(ChamHoc.thuHam(man, { ham: [H('sai', ['left_move()', 'right_move()'])] }, 'sai', TV)).join() === 'quen-wait');
  const e = ChamHoc.thuHam(man, { ham: [H('sai', ['left_move()', 'left_move()', 'wait()'])] }, 'sai', TV);
  kiem('banh-goi-lai ở sân thử', maCua(e).join() === 'banh-goi-lai', J(e.chanDoan));
  const f = ChamHoc.thuHam(man, { ham: [H('buoc', ['move()', 'turn_left()', 'move()']), mv] }, 'buoc', TV);
  kiem('thân gọi hàm chưa tạo → ham-chua-co', maCua(f).includes('ham-chua-co'), J(f.chanDoan));
  const g = ChamHoc.thuHam(man, { ham: [H('lap', ['while True:', '    wait()'])] }, 'lap', TV, { nhipToiDa: 20 });
  kiem('tuyChon.nhipToiDa chặn hàm chạy mãi: qua-nhieu-nhip', maCua(g).join() === 'qua-nhieu-nhip' && g.soNhip === 20, J(g.chanDoan));
  const h = ChamHoc.thuHam(man, { ham: [H('tien', ['for i in range(n):', '    wait()'], ['n'])] }, 'tien', TV, { doiSo: [3] });
  kiem('hàm có đối số: truyền đối số mặc định (n = 3 → 3 nhịp)', h.soNhip === 3 && h.chanDoan.length === 0, J(h));
  const tran = ChamHoc.thuHam(man, { ham: [H('dai', dong(11, 'wait()'))] }, 'dai', TV);
  kiem('hàm tràn khung riêng của nó: không chạy, báo tran-khung', maCua(tran).join() === 'tran-khung' && tran.vet.length === 0);
  const khac = ChamHoc.thuHam(man, { ham: [H('dai', dong(11, 'wait()')), H('ngan', ['wait()'])] }, 'ngan', TV);
  kiem('hàm khác tràn khung thì không cản việc thử hàm này', maCua(khac).length === 0 && khac.soNhip === 1, J(khac.chanDoan));
  const i = ChamHoc.thuHam(man, { ham: [H('x', ['left_move(', 'wait()'])] }, 'x', TV);
  kiem('lỗi cú pháp trong hàm thử: loi-cu-phap ghi đúng hàm', maCua(i).join() === 'loi-cu-phap' && /hàm x, dòng 1/.test(i.chanDoan[0].loi), J(i.chanDoan));
  const j = ChamHoc.thuHam(Object.assign({}, man, { thuVien: ['move'] }), { ham: [] }, 'move', TV);
  kiem('thử cả hàm thư viện', bang(j.robot, { x: 1, y: 0, huong: 0 }) && j.chanDoan.length === 0);
  const k = ChamHoc.thuHam(man, { ham: [] }, 'khongco', TV);
  kiem('thử hàm không tồn tại: ham-chua-co', maCua(k).join() === 'ham-chua-co');
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

console.log('\n== 13. Hai mươi màn ==');
const NGOAI_LE = [];
{
  const ds = ManHoc.danhSach;
  const TRUONG = ['id', 'ten', 'hang', 'deBai', 'san', 'batDau', 'loaiRobot', 'hamGoc', 'thuVien', 'khung', 'maMau', 'sao', 'loiGiai', 'loiSai', 'goiY'];
  kiem('có đúng 20 màn', ds.length === 20, String(ds.length));
  const ids = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10'];
  kiem('đúng mã màn và thứ tự', J(ds.map((m) => m.id)) === J(ids));
  kiem('ManHoc.tim trả đúng màn', ManHoc.tim('2.7').ten === ds[16].ten && ManHoc.tim('9.9') === null);
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm (mỗi chuỗi)',
    [0, 10].every((o) => J(ds.slice(o, o + 10).map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum'])));
  kiem('chuỗi 1: chương trình 10 ô, chưa mở Xưởng hàm, hàm gốc left_move/right_move/wait (không có left_back)',
    ds.slice(0, 10).every((m) => m.khung.chinh === 10 && m.khung.soHam === 0 && J(m.hamGoc) === J(['left_move', 'right_move', 'wait'])));
  kiem('chuỗi 2: chương trình 10 ô, mỗi hàm 10 ô, mở Xưởng hàm (soHam 1..5)',
    ds.slice(10).every((m) => m.khung.chinh === 10 && m.khung.moiHam === 10 && m.khung.soHam >= 1 && m.khung.soHam <= 5));
  kiem('thư viện của chuỗi 2 RỖNG ở mọi màn (học sinh tự tạo hàm)', ds.every((m) => m.thuVien.length === 0));
  kiem('2.10 thắng thì thư viện nhận move, turn_right, turn_left, u_turn',
    bang(ManHoc.tim('2.10').moThuVien, ['move', 'turn_right', 'turn_left', 'u_turn']) && ManHoc.tim('2.10').moThuVien.every((t) => typeof TV[t] === 'string'));
  kiem('sân tối đa 7×7', ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7));
  kiem('màn bắt buộc có hàm vì thiếu chỗ thật chỉ ở hàng 1 chuỗi 2 (tay viết > 10 dòng): 2.1–2.3',
    ['2.1', '2.2', '2.3'].every((id) => ManHoc.tim(id).loiSai.some((l) => l.phaiCoMa.includes('tran-khung') || id === '2.2')));

  for (const m of ds) {
    const dayDu = TRUONG.every((t) => m[t] !== undefined);
    const loiGiai = ChamHoc.cham(m, m.loiGiai, TV);
    const o = KhungCode.kiemTra(m.khung, m.loiGiai, m.hamGoc);
    kiem(m.id + ' ' + m.ten + ': đủ trường, đề 1–2 câu, gợi ý 1–2 câu, ≥1 lời sai',
      dayDu && m.deBai.length > 20 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 &&
      m.goiY.length >= 1 && m.goiY.length <= 2 && m.loiSai.length >= 1, m.id);
    kiem(m.id + ': lời giải 3 sao, vừa khung, dùng ĐÚNG sao.o ô',
      loiGiai.thang && loiGiai.sao === 3 && o.length === 0 && loiGiai.soO === m.sao.o,
      J({ thang: loiGiai.thang, sao: loiGiai.sao, soO: loiGiai.soO, saoO: m.sao.o, soNhip: loiGiai.soNhip, cd: loiGiai.chanDoan.map((c) => c.ma), o }));
    kiem(m.id + ': lời giải chạy đúng sao.nhip nhịp', loiGiai.soNhip === m.sao.nhip, loiGiai.soNhip + ' ≠ ' + m.sao.nhip);
    const loiMau = KhungCode.kiemTra(m.khung, m.maMau, m.hamGoc);
    kiem(m.id + ': maMau vừa khung', loiMau.length === 0, J(loiMau));
    kiem(m.id + ': lời giải không bị chẩn đoán lỗi nào', loiGiai.chanDoan.length === 0, J(loiGiai.chanDoan.map((c) => c.ma)));
    m.loiSai.forEach((ls, i) => {
      const r = ChamHoc.cham(m, ls.baiLam, TV);
      const co = r.chanDoan.map((c) => c.ma);
      const thieu = ls.phaiCoMa.filter((x) => co.indexOf(x) < 0);
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không đủ 3 sao (không thắng hoặc thiếu sao), đủ mã ' + ls.phaiCoMa.join('+'),
        r.sao < 3 && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + r.sao);
    });

    // ---- đường tắt
    const thuan = nhipNganNhat(m);
    let ghiChu = '';
    let khongTat = thuan === m.sao.nhip;
    if (!khongTat && m.khung.soHam === 0 && m.ngoaiLeKhung) {
      const vuaKhung = nhipNganNhat(m, m.khung.chinh - m.khung.khoaChinh);
      khongTat = vuaKhung === m.sao.nhip;
      ghiChu = ' [ngoại lệ chuỗi 1: đường ' + thuan + ' nhịp không vừa khung viết tay; đường vừa khung ' + vuaKhung + ' nhịp]';
      NGOAI_LE.push(m.id);
    }
    kiem(m.id + ': không có ĐƯỜNG TẮT — nhịp ngắn nhất (BFS) = sao.nhip' + ghiChu, khongTat, 'BFS = ' + thuan + ', sao.nhip = ' + m.sao.nhip +
      (thuan !== null && thuan < m.sao.nhip ? ' → ĐƯỜNG TẮT' : ''));
    if (m.khung.soHam === 0) {
      const vk = nhipNganNhat(m, m.khung.chinh - m.khung.khoaChinh);
      kiem(m.id + ': đường ngắn nhất viết tay vừa khung (≤ ' + (m.khung.chinh - m.khung.khoaChinh) + ' dòng) cũng đúng sao.nhip', vk === m.sao.nhip, 'vừa khung = ' + vk);
    }

    // ---- còn chỗ sáng tạo: có lời giải khác, vừa khung, nhiều ô hơn, chỉ 2 sao
    if (m.id !== '1.1' && m.id !== '1.2') {
      const kh = m.loiGiaiKhac;
      if (!kh) kiem(m.id + ': có loiGiaiKhac', false);
      else {
        const r = ChamHoc.cham(m, kh.baiLam, TV);
        const ok2 = KhungCode.kiemTra(m.khung, kh.baiLam, m.hamGoc);
        kiem(m.id + ': loiGiaiKhac (' + kh.moTa + ') vừa khung, nhiều ô hơn, cùng nhịp, đúng 2 sao',
          ok2.length === 0 && r.thang && r.soO > m.sao.o && r.soNhip === m.sao.nhip && r.sao === 2 && J(kh.baiLam) !== J(m.loiGiai),
          J({ thang: r.thang, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, sao: r.sao, ok2 }));
      }
    }
  }

  // maMau của từng màn đặc biệt
  const m11 = ManHoc.tim('1.1');
  kiem('1.1: maMau = đúng lời giải, bấm chạy là 3 sao', ChamHoc.cham(m11, m11.maMau, TV).sao === 3 && bang(m11.maMau.chinh, m11.loiGiai.chinh) && m11.maMau.chinh.length === 3);
  const m12 = ManHoc.tim('1.2');
  kiem('1.2: maMau = 3 dòng tiến 1 ô, chưa thắng; lời giải tiến 3 ô = 9 dòng', m12.maMau.chinh.length === 3 && !ChamHoc.cham(m12, m12.maMau, TV).thang && m12.loiGiai.chinh.length === 9);
  const m13 = ManHoc.tim('1.3');
  kiem('1.3: maMau = left_move(), wait() (quay phải)', bang(m13.maMau.chinh, ['left_move()', 'wait()']) && ChamHoc.cham(m13, m13.maMau, TV).theoSan[0].vet.filter((e) => e.loai === 'nhip')[0].robot.huong === 1);
  const m18 = ManHoc.tim('1.8');
  kiem('1.8: maMau lạch bạch: không tiến, quay qua quay lại', bang(m18.maMau.chinh, ['left_move()', 'wait()', 'right_move()', 'wait()']) && !ChamHoc.cham(m18, m18.maMau, TV).thang);
  const m21 = ManHoc.tim('2.1');
  kiem('2.1: tiến 4 ô viết tay = 12 dòng > 10 ô; maMau.ham đủ thân, chương trình trống',
    4 * 3 > m21.khung.chinh && m21.maMau.ham.length === 1 && m21.maMau.ham[0].than.length === 3 && m21.maMau.chinh.length === 0);
  const m22 = ManHoc.tim('2.2');
  kiem('2.2: maMau.ham chỉ có tên move, thân trống; chương trình gọi move() sẵn', m22.maMau.ham.length === 1 && m22.maMau.ham[0].than.length === 0 && m22.maMau.chinh.filter((s) => s === 'move()').length === 4);
  const m28 = ManHoc.tim('2.8');
  kiem('2.8: maMau có step_right viết nhầm turn_left()', m28.maMau.ham.some((h) => h.ten === 'step_right' && h.than.some((s) => /turn_left\(\)/.test(s))) && !ChamHoc.cham(m28, m28.maMau, TV).thang);
  const m210 = ManHoc.tim('2.10');
  kiem('2.10: lời giải là two() gọi stair() hai lần; chương trình chỉ 3 dòng', m210.loiGiai.ham.some((h) => h.ten === 'two' && bang(h.than, ['stair()', 'stair()'])) && m210.loiGiai.chinh.length === 3);
  kiem('2.10: stair() gọi nhiều tầng (stair → move → left_move): vết có ngan 3 tầng',
    ChamHoc.cham(m210, m210.loiGiai, TV).vet.some((e) => e.loai === 'lenh' && e.ngan.length === 3));
  console.log('  (màn dùng ngoại lệ "đường nhanh hơn không vừa khung viết tay": ' + (NGOAI_LE.length ? NGOAI_LE.join(', ') : 'không có') + ')');
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
