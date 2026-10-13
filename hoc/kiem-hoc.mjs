/* ============================================================================
   kiem-hoc.mjs — máy kiểm "Đường học": luật sân, khung code, máy chấm, 20 màn.
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

console.log('\n== 6. Vết: cho / ngan khi gọi lồng hàm ==');
{
  const man = ManHoc.tim('2.9');
  const kq = ChamHoc.cham(man, man.loiGiai, TV);
  const lenh = kq.vet.filter((e) => e.loai === 'lenh');
  const l0 = lenh[0];
  kiem('lệnh đầu: left_move trong move (thư viện) trong corner (HÀM) gọi từ CHÍNH dòng 1',
    l0.ten === 'left_move' && J(l0.cho) === J({ cot: 'thuvien', dong: 2, ten: 'move' }) &&
    J(l0.ngan) === J([{ cot: 'chinh', dong: 1 }, { cot: 'ham', dong: 2 }]), J(l0));
  const turn = lenh.find((e) => e.ten === 'left_move' && e.ngan.length === 2 && e.ngan[1].dong === 4);
  kiem('lệnh trong turn_right (gọi từ HÀM dòng 4): ngan trỏ đúng dòng 4',
    turn && J(turn.ngan) === J([{ cot: 'chinh', dong: 1 }, { cot: 'ham', dong: 4 }]), J(turn));
  const l2 = lenh.find((e) => e.ngan.length && e.ngan[0].dong === 2);
  kiem('lần gọi corner() thứ hai (CHÍNH dòng 2) có ngan[0] = chinh 2', !!l2);
  const wait0 = lenh.find((e) => e.ten === 'wait');
  kiem('wait cuối cùng thân move: cho = thư viện dòng 4', J(wait0.cho) === J({ cot: 'thuvien', dong: 4, ten: 'move' }), J(wait0.cho));
  const tren = ChamHoc.cham(ManHoc.tim('1.1'), ManHoc.tim('1.1').loiGiai, TV);
  const t0 = tren.vet[0];
  kiem('gọi thẳng từ CHÍNH: ngan rỗng, cho = chinh dòng 1', J(t0.cho) === J({ cot: 'chinh', dong: 1 }) && t0.ngan.length === 0, J(t0));
  const thuTu = kq.vet.map((e) => e.loai).join('');
  kiem('vết xen kẽ đúng thứ tự: lệnh … nhịp (nhịp đến sau lệnh wait)', /^(l+n)+$/.test(thuTu.replace(/lenh/g, 'l').replace(/nhip/g, 'n')));
  const mo = kq.vet.filter((e) => e.loai === 'nhip');
  kiem('nhịp có robot {x,y,huong,banh} và suKien', mo.every((n) => n.robot && n.robot.banh && Array.isArray(n.suKien)) && mo.length === kq.soNhip);
  // ngan theo ngăn xếp: lời gọi hàm lồng thêm một tầng (tự dựng)
  const man2 = Object.assign({}, ManHoc.tim('2.3'));
  const k2 = ChamHoc.cham(man2, {
    ham: ['def a():', '    left_move()', '    right_move()', '    wait()', 'def b():', '    a()', '    a()'],
    chinh: ['b()', 'b()']
  }, TV);
  const pre = k2.vet.filter((e) => e.loai === 'lenh');
  kiem('hai tầng: left_move đầu tiên ngan = [chinh 1, ham 6]', J(pre[0].ngan) === J([{ cot: 'chinh', dong: 1 }, { cot: 'ham', dong: 6 }]), J(pre[0]));
  kiem('lần a() thứ hai: ngan = [chinh 1, ham 7]', J(pre[3].ngan) === J([{ cot: 'chinh', dong: 1 }, { cot: 'ham', dong: 7 }]), J(pre[3]));
  kiem('sau khi hàm kết thúc, ngan được rút ra (lệnh b() thứ hai: chinh 2)', pre[6].ngan[0].dong === 2, J(pre[6]));
}

/* ======================================================== 2. KHUNG CODE */
console.log('\n== 7. Khung code: ô, ô khóa, sai cột ==');
{
  const kh = { chinh: 8, ham: 8, khoaChinh: 3, khoaHam: 0 };
  const dong = (n, s = 'move()') => Array(n).fill(s);
  kiem('vừa khung: không lỗi', KhungCode.kiemTra(kh, { chinh: dong(5), ham: [] }).length === 0);
  const t = KhungCode.kiemTra({ chinh: 8, ham: 0 }, { chinh: dong(9) });
  kiem('tràn ô: tran-khung, nói rõ cột, cần bao nhiêu, có bao nhiêu',
    t.length === 1 && t[0].ma === 'tran-khung' && t[0].cot === 'chinh' && t[0].can === 9 && t[0].co === 8 &&
    /CHÍNH/.test(t[0].loi) && /9 dòng/.test(t[0].loi) && /8 ô/.test(t[0].loi), J(t));
  const k = KhungCode.kiemTra(kh, { chinh: dong(6), ham: [] });
  kiem('ô khóa: 8 ô khóa 3 → chỉ còn 5 ô dùng được', k.length === 1 && k[0].co === 5 && k[0].can === 6 && /khóa/.test(k[0].loi), J(k));
  kiem('ô khóa: đủ 5 dòng thì vừa', KhungCode.kiemTra(kh, { chinh: dong(5) }).length === 0);
  kiem('khoaHam trừ vào cột HÀM',
    KhungCode.kiemTra({ chinh: 8, ham: 6, khoaHam: 2 }, { ham: ['def f():'].concat(dong(4, '    move()')) }).some((x) => x.ma === 'tran-khung' && x.cot === 'ham' && x.co === 4));
  const ham = KhungCode.kiemTra({ chinh: 8, ham: 4 }, { chinh: [], ham: ['def f():'].concat(dong(4, '    move()')) });
  kiem('tràn cột HÀM nói rõ cột HÀM', ham.length === 1 && ham[0].cot === 'ham' && /HÀM/.test(ham[0].loi));
  kiem('dòng trống không tính ô', KhungCode.soDong(['a', '', '  ', 'b']) === 2 &&
    KhungCode.kiemTra({ chinh: 2, ham: 0 }, { chinh: ['a', '', 'b', '   '] }).length === 0);
  kiem('soO = dòng CHÍNH + dòng HÀM (không tính thư viện)', KhungCode.soO({ chinh: ['a', 'b'], ham: ['def f():', '    x'] }) === 4);
  const d = KhungCode.kiemTra(kh, { chinh: ['move()', 'def f():', '    move()'] });
  kiem('def-o-cot-chinh', d.length === 1 && d[0].ma === 'def-o-cot-chinh' && d[0].dong === 2, J(d));
  const l = KhungCode.kiemTra(kh, { chinh: [], ham: ['def f():', '    move()', 'move()'] });
  kiem('lenh-le-o-cot-ham: dòng không thụt lề, không phải def', l.length === 1 && l[0].ma === 'lenh-le-o-cot-ham' && l[0].dong === 3, J(l));
  kiem('cột HÀM: thân thụt lề và def đều hợp lệ', KhungCode.kiemTra(kh, { ham: ['def f():', '    move()', '', 'def g():', '    f()'] }).length === 0);
  const c = KhungCode.kiemTra({ chinh: 8, ham: 0 }, { chinh: [], ham: ['def f():', '    move()'] });
  kiem('chua-mo-cot-ham khi ham: 0 mà cột HÀM có dòng', c.length === 1 && c[0].ma === 'chua-mo-cot-ham', J(c));
  kiem('ham: 0 và cột HÀM rỗng → hợp lệ', KhungCode.kiemTra({ chinh: 8, ham: 0 }, { chinh: ['a'], ham: [] }).length === 0);
  const d0 = KhungCode.kiemTra({ chinh: 8, ham: 0 }, { chinh: ['def f():'] });
  kiem('ham: 0 mà def ở cột CHÍNH: nói thẳng màn chưa có cột HÀM', d0[0].ma === 'def-o-cot-chinh' && /chưa có cột HÀM/.test(d0[0].loi));
  kiem('lời tràn khung có gợi ý hướng khi đã mở cột HÀM', /lặp lại/.test(KhungCode.kiemTra({ chinh: 2, ham: 4 }, { chinh: dong(3) })[0].loi));
  kiem('lời tràn khung KHÔNG nói đáp án (không nêu tên hàm cụ thể)', !/move|turn|def /.test(KhungCode.kiemTra({ chinh: 2, ham: 4 }, { chinh: dong(3) })[0].loi));
}

console.log('\n== 8. Khung code: ghép Python, ánh xạ, xuất .py ==');
{
  const bai = { ham: ['def f():', '', '    move()'], chinh: ['f()', 'f()'] };
  const g = KhungCode.ghep(bai, [{ ten: 'move', ma: 'def move():\n    left_move()\n    wait()\n' }]);
  const ds = g.ma.split('\n');
  kiem('thứ tự: thư viện → HÀM → CHÍNH', ds.join('|') === 'def move():|    left_move()|    wait()|def f():||    move()|f()|f()', ds.join('|'));
  kiem('thư viện không bị thêm dòng trống thừa', ds[2] === '    wait()');
  kiem('ánh xạ thư viện: kèm tên hàm và dòng trong hàm', J(g.anhXa[2]) === J({ cot: 'thuvien', dong: 2, ten: 'move' }), J(g.anhXa[2]));
  kiem('ánh xạ cột HÀM theo số ô (kể cả ô trống)', J(g.anhXa[4]) === J({ cot: 'ham', dong: 1 }) && J(g.anhXa[6]) === J({ cot: 'ham', dong: 3 }), J(g.anhXa[6]));
  kiem('ánh xạ cột CHÍNH', J(g.anhXa[7]) === J({ cot: 'chinh', dong: 1 }) && J(g.anhXa[8]) === J({ cot: 'chinh', dong: 2 }));
  kiem('anhXa[0] bỏ trống (dòng Python tính từ 1)', g.anhXa[0] === null && g.anhXa.length === ds.length + 1);
  const g2 = KhungCode.ghep({ chinh: ['a'] }, []);
  kiem('không thư viện, không cột HÀM: chỉ có cột CHÍNH', g2.ma === 'a');

  const py = KhungCode.xuatPy({ ham: ['def f():', '    move()'], chinh: ['f()', '', 'turn_left()'] }, ['move', 'turn_left', 'u_turn']);
  const pd = py.split('\n');
  kiem('xuất .py: dòng chú thích nói thư viện dùng hàm gì', /^# .*move, turn_left/.test(pd[0]) && !/u_turn/.test(pd[0]), pd[0]);
  kiem('xuất .py: chỉ HÀM + CHÍNH, không chép mã thư viện', !/left_move|def move|def turn_left/.test(py));
  kiem('xuất .py: HÀM trước CHÍNH, bỏ dòng trống của ô', py.indexOf('def f():') < py.indexOf('f()\nturn_left()') && /f\(\)\nturn_left\(\)/.test(py), JSON.stringify(py));
  kiem('xuất .py kết thúc bằng xuống dòng', py.endsWith('\n'));
  kiem('xuất .py: không dùng thư viện → chú thích nói rõ',
    /Không dùng/.test(KhungCode.xuatPy({ chinh: ['left_move()'] }, ['move']).split('\n')[0]));
  kiem('xuất .py: hàm tự viết trùng tên thư viện thì không tính là dùng thư viện',
    /Không dùng/.test(KhungCode.xuatPy({ ham: ['def move():', '    wait()'], chinh: ['move()'] }, ['move']).split('\n')[0]));
}

/* =========================================================== 3. MÁY CHẤM */
console.log('\n== 9. Máy chấm: sao, lỗi bọc từ core, mã chẩn đoán ==');
{
  const m12 = ManHoc.tim('1.2');
  const ma = (kq) => kq.chanDoan.map((c) => c.ma);
  const ok = ChamHoc.cham(m12, m12.loiGiai, TV);
  kiem('thắng đúng 3 sao (1 + ô + nhịp)', ok.thang && ok.sao === 3 && ok.soO === 6 && ok.soNhip === 2, J([ok.thang, ok.sao, ok.soO, ok.soNhip]));
  const dai = ChamHoc.cham(m12, { chinh: ['wait()', 'wait()'].concat(m12.loiGiai.chinh) }, TV);
  kiem('thắng nhưng dùng quá ô và quá nhịp → 1 sao', dai.thang && dai.sao === 1 && dai.soO === 8 && dai.soNhip === 4, J([dai.thang, dai.sao, dai.soO, dai.soNhip]));
  const m15 = ManHoc.tim('1.5');
  const k15 = ChamHoc.cham(m15, { chinh: m15.loiGiai.chinh }, TV);
  kiem('sao 3 ở màn vừa khít 8 ô', k15.sao === 3 && k15.soO === 8);
  const m2 = ManHoc.tim('2.1');
  const nhieuNhip = Object.assign({}, m2, { sao: { o: 99, nhip: 2 } });
  const k2 = ChamHoc.cham(nhieuNhip, m2.loiGiai, TV);
  kiem('chỉ đạt sao ô (không đạt sao nhịp) → 2 sao', k2.sao === 2, String(k2.sao));
  const k3 = ChamHoc.cham(Object.assign({}, m2, { sao: { o: 1, nhip: 99 } }), m2.loiGiai, TV);
  kiem('chỉ đạt sao nhịp → 2 sao', k3.sao === 2);
  const thua = ChamHoc.cham(m12, { chinh: TIEN.trim().split('\n') }, TV);
  kiem('không thắng → 0 sao, mã chua-toi-co kèm robot ở đâu, hướng nào',
    !thua.thang && thua.sao === 0 && ma(thua).includes('chua-toi-co') &&
    thua.chanDoan[0].robot.x === 2 && /hướng lên/.test(thua.chanDoan[0].loi) && /\(2, 3\)/.test(thua.chanDoan[0].loi), J(thua.chanDoan));

  const cu = ChamHoc.cham(ManHoc.tim('2.2'), { ham: ['def move():'], chinh: ['move()'] }, TV);
  kiem('loi-cu-phap: def thiếu thân → đổ lỗi đúng dòng def (cột HÀM dòng 1)', ma(cu).join() === 'loi-cu-phap' && cu.chanDoan[0].cho.cot === 'ham' && cu.chanDoan[0].cho.dong === 1, J(cu.chanDoan));
  kiem('lời lỗi cú pháp ghi cột và dòng', /cột HÀM, dòng 1/.test(cu.chanDoan[0].loi));
  const ct = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', 'right_move(', 'wait()'] }, TV);
  kiem('loi-cu-phap: thiếu ngoặc, ghi dòng 2 cột CHÍNH', ma(ct)[0] === 'loi-cu-phap' && /cột CHÍNH, dòng 2/.test(ct.chanDoan[0].loi), J(ct.chanDoan));
  const tl = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', '  right_move()', 'wait()'] }, TV);
  kiem('loi-thut-le: thụt lề thừa giữa chương trình', ma(tl)[0] === 'loi-thut-le' && tl.chanDoan[0].cho.dong === 2, J(tl.chanDoan));
  const td = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['  left_move()', 'right_move()', 'wait()'] }, TV);
  kiem('loi-thut-le: dòng đầu cột thụt lề', ma(td)[0] === 'loi-thut-le' && /dòng đầu tiên/.test(td.chanDoan[0].loi), J(td.chanDoan));
  const lc = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['x = 1 / 0'] }, TV);
  kiem('loi-chay: chia cho 0, đổi số dòng sang cột/dòng', ma(lc)[0] === 'loi-chay' && /cột CHÍNH, dòng 1/.test(lc.chanDoan[0].loi), J(lc.chanDoan));
  const vl = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['while True:', '    pass'] }, TV);
  kiem('loi-chay: vòng lặp vô tận không có nhịp', ma(vl)[0] === 'loi-chay', J(vl.chanDoan));
  const qn = ChamHoc.cham(Object.assign({}, ManHoc.tim('1.1'), { nhipToiDa: 30 }), { chinh: ['while True:', '    wait()'] }, TV);
  kiem('qua-nhieu-nhip', ma(qn).join() === 'qua-nhieu-nhip' && qn.soNhip === 30 && !qn.thang, J(qn.chanDoan));
  const hc = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_back()', 'right_back()', 'wait()'] }, TV);
  kiem('ham-chua-co: hàm gốc chưa mở ở màn này (left_back)', ma(hc).join() === 'ham-chua-co' && hc.chanDoan[0].ten === 'left_back' && /left_move, right_move, wait/.test(hc.chanDoan[0].loi), J(hc.chanDoan));
  const hc2 = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['move()'] }, TV);
  kiem('ham-chua-co: thư viện không được phép ở màn này (move ở chuỗi 1)', ma(hc2).join() === 'ham-chua-co');
  const hc3 = ChamHoc.cham(ManHoc.tim('2.1'), { ham: [], chinh: ['turn_right()'] }, TV);
  kiem('ham-chua-co: thư viện chưa mở ở hàng này (turn_right ở 2.1)', ma(hc3).join() === 'ham-chua-co');
  const hc4 = ChamHoc.cham(ManHoc.tim('2.4'), { ham: ['def turn_left():', '    right_move()', '    wait()'], chinh: ['turn_left()'] }, TV);
  kiem('hàm tự viết thì gọi được (không ham-chua-co)', !ma(hc4).includes('ham-chua-co'));
  const tk = ChamHoc.cham(ManHoc.tim('2.1'), { ham: [], chinh: [].concat(TIEN.trim().split('\n'), TIEN.trim().split('\n'), TIEN.trim().split('\n')) }, TV);
  kiem('tran-khung: không chạy chương trình, 0 sao, vet rỗng', ma(tk).join() === 'tran-khung' && tk.sao === 0 && tk.vet.length === 0 && !tk.thang);
  const dc = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['def f():', '    wait()'] }, TV);
  kiem('def-o-cot-chinh qua máy chấm', ma(dc).join() === 'def-o-cot-chinh');
  const lh = ChamHoc.cham(ManHoc.tim('2.1'), { ham: ['move()'], chinh: [] }, TV);
  kiem('lenh-le-o-cot-ham qua máy chấm', ma(lh).join() === 'lenh-le-o-cot-ham');
  const ch = ChamHoc.cham(ManHoc.tim('1.1'), { ham: ['def f():', '    wait()'], chinh: ['f()'] }, TV);
  kiem('chua-mo-cot-ham qua máy chấm', ma(ch).join() === 'chua-mo-cot-ham');
  const bg = ChamHoc.cham(ManHoc.tim('1.2'), { chinh: ['left_move()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, TV);
  kiem('banh-goi-lai: lời nêu bánh, dòng, cột', ma(bg).includes('banh-goi-lai') && /cột CHÍNH, dòng 2/.test(bg.chanDoan.find((c) => c.ma === 'banh-goi-lai').loi), J(bg.chanDoan));
  const qw = ChamHoc.cham(ManHoc.tim('1.1'), { chinh: ['left_move()', 'right_move()'] }, TV);
  kiem('quen-wait qua máy chấm', ma(qw).includes('quen-wait') && ma(qw).includes('chua-toi-co'));
  const dt = ChamHoc.cham(ManHoc.tim('1.3'), { chinh: ['right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, TV);
  kiem('dam-tuong qua máy chấm: nêu nhịp và ô', ma(dt).includes('dam-tuong') && /nhịp 2/.test(dt.chanDoan.find((c) => c.ma === 'dam-tuong').loi), J(dt.chanDoan));
  kiem('lời chẩn đoán đều là tiếng Việt ngắn (≤ 330 ký tự)',
    [cu, ct, tl, td, lc, vl, qn, hc, hc2, tk, dc, lh, ch, bg, qw, dt, thua].every((r) => r.chanDoan.every((c) => c.loi && c.loi.length <= 330 && /[a-zà-ỹ]/.test(c.loi))));
}

console.log('\n== 10. Máy chấm nhiều sân ==');
{
  const man = {
    id: 'thu', loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], thuVien: [], khung: { chinh: 8, ham: 0 }, sao: { o: 3, nhip: 1 },
    san: [['.....', '.....', '..F..', '.....', '.....'], ['.....', '..F..', '.....', '.....', '.....']],
    batDau: { x: 2, y: 3, huong: 0 }
  };
  const mot = ChamHoc.cham(man, { chinh: ['left_move()', 'right_move()', 'wait()'] }, TV);
  kiem('thắng sân 1, trượt sân 2 → không thắng', !mot.thang && mot.sao === 0 && mot.theoSan.length === 2 && mot.theoSan[0].thang && !mot.theoSan[1].thang, J(mot.theoSan.map((s) => s.thang)));
  kiem('chẩn đoán gom từ sân trượt, ghi rõ sân nào', mot.chanDoan.some((c) => c.ma === 'chua-toi-co' && /Sân 2/.test(c.loi)), J(mot.chanDoan));
  const hai = ChamHoc.cham(man, { chinh: ['for i in range(2):', '    left_move()', '    right_move()', '    wait()'] }, TV);
  kiem('chạy chương trình chung: thắng cả hai sân', hai.thang && hai.theoSan.every((s) => s.thang) && hai.soNhip === 2, J(hai.theoSan.map((s) => s.soNhip)));
  kiem('vet lấy từ sân trượt (hoặc sân đầu nếu thắng hết)', hai.vet === hai.theoSan[0].vet || J(hai.vet) === J(hai.theoSan[0].vet));
  const bdKhac = Object.assign({}, man, { batDau: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 3, huong: 0 }] });
  kiem('batDau là mảng song song với sân', ChamHoc.cham(bdKhac, { chinh: ['left_move()', 'right_move()', 'wait()'] }, TV).theoSan.length === 2);
}

/* ============================================================ 4. 20 MÀN */
console.log('\n== 11. Hai mươi màn ==');
{
  const ds = ManHoc.danhSach;
  const TRUONG = ['id', 'ten', 'hang', 'deBai', 'san', 'batDau', 'loaiRobot', 'hamGoc', 'thuVien', 'khung', 'maMau', 'sao', 'loiGiai', 'loiSai', 'goiY'];
  kiem('có đúng 20 màn', ds.length === 20, String(ds.length));
  const ids = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10'];
  kiem('đúng mã màn và thứ tự', J(ds.map((m) => m.id)) === J(ids));
  kiem('ManHoc.tim trả đúng màn', ManHoc.tim('2.7').ten === ds[16].ten && ManHoc.tim('9.9') === null);
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm (mỗi chuỗi)',
    [0, 10].every((o) => J(ds.slice(o, o + 10).map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum'])));
  kiem('chuỗi 1 chỉ có cột CHÍNH 8 ô, chưa mở HÀM, hàm gốc left_move/right_move/wait, không có left_back',
    ds.slice(0, 10).every((m) => m.khung.chinh === 8 && !m.khung.ham && J(m.hamGoc) === J(['left_move', 'right_move', 'wait']) && m.thuVien.length === 0));
  kiem('chuỗi 2 mở cột HÀM, CHÍNH 8 ô', ds.slice(10).every((m) => m.khung.chinh === 8 && m.khung.ham >= 1 && m.khung.ham <= 8));
  kiem('thư viện theo hàng: 2.1–2.3 rỗng', ds.slice(10, 13).every((m) => m.thuVien.length === 0));
  kiem('thư viện theo hàng: 2.4–2.6 = move', ds.slice(13, 16).every((m) => J(m.thuVien) === J(['move'])));
  kiem('thư viện theo hàng: 2.7–2.9 = move, turn_right, turn_left', ds.slice(16, 19).every((m) => J(m.thuVien) === J(['move', 'turn_right', 'turn_left'])));
  kiem('thư viện theo hàng: 2.10 thêm u_turn', J(ds[19].thuVien) === J(['move', 'turn_right', 'turn_left', 'u_turn']));

  for (const m of ds) {
    const dayDu = TRUONG.every((t) => m[t] !== undefined);
    const loiGiai = ChamHoc.cham(m, m.loiGiai, TV);
    const o = KhungCode.kiemTra(m.khung, m.loiGiai);
    kiem(m.id + ' ' + m.ten + ': đủ trường, đề 1–2 câu, gợi ý 1–2 câu, ≥1 lời sai',
      dayDu && m.deBai.length > 20 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 &&
      m.goiY.length >= 1 && m.goiY.length <= 2 && m.loiSai.length >= 1, m.id);
    kiem(m.id + ': lời giải 3 sao, vừa khung', loiGiai.thang && loiGiai.sao === 3 && o.length === 0,
      J({ thang: loiGiai.thang, sao: loiGiai.sao, soO: loiGiai.soO, soNhip: loiGiai.soNhip, cd: loiGiai.chanDoan.map((c) => c.ma), o }));
    const mm = m.maMau, loiMau = KhungCode.kiemTra(m.khung, mm);
    kiem(m.id + ': maMau vừa khung', loiMau.length === 0, J(loiMau));
    kiem(m.id + ': lời giải không bị chẩn đoán lỗi nào', loiGiai.chanDoan.length === 0, J(loiGiai.chanDoan.map((c) => c.ma)));
    m.loiSai.forEach((ls, i) => {
      const r = ChamHoc.cham(m, ls.baiLam, TV);
      const co = r.chanDoan.map((c) => c.ma);
      const thieu = ls.phaiCoMa.filter((x) => co.indexOf(x) < 0);
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không đủ 3 sao (không thắng hoặc thiếu sao), đủ mã ' + ls.phaiCoMa.join('+'),
        r.sao < 3 && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + r.sao);
    });
  }
  // 1.1 và 1.2: maMau
  const m11 = ManHoc.tim('1.1');
  kiem('1.1: maMau = đúng lời giải, bấm chạy là 3 sao', ChamHoc.cham(m11, m11.maMau, TV).sao === 3 && J(m11.maMau.chinh) === J(m11.loiGiai.chinh) && m11.maMau.chinh.length === 3);
  const m12 = ManHoc.tim('1.2');
  kiem('1.2: maMau = 3 dòng tiến 1 ô, chưa thắng', m12.maMau.chinh.length === 3 && !ChamHoc.cham(m12, m12.maMau, TV).thang);
  const m13 = ManHoc.tim('1.3');
  kiem('1.3: maMau = left_move(), wait() (quay phải)', J(m13.maMau.chinh) === J(['left_move()', 'wait()']) && ChamHoc.cham(m13, m13.maMau, TV).theoSan[0].vet.filter((e) => e.loai === 'nhip')[0].robot.huong === 1);
  const m18 = ManHoc.tim('1.8');
  kiem('1.8: maMau lạch bạch: không tiến, quay qua quay lại', J(m18.maMau.chinh) === J(['left_move()', 'wait()', 'right_move()', 'wait()']) && m18.loiGiai.chinh.length === 3);
  const m22 = ManHoc.tim('2.2');
  kiem('2.2: maMau.ham chỉ có dòng def move():', J(m22.maMau.ham) === J(['def move():']) && m22.maMau.chinh.every((s) => s === 'move()'));
  const m21 = ManHoc.tim('2.1');
  kiem('2.1: maMau.ham đủ thân, cột chính trống', m21.maMau.ham.length === 4 && m21.maMau.chinh.length === 0);
  kiem('2.1: không có hàm thì cần 9 dòng > 8 ô', 9 > m21.khung.chinh);
  const m28 = ManHoc.tim('2.8');
  kiem('2.8: maMau có step_right viết nhầm turn_left()', m28.maMau.ham.some((s) => /turn_left\(\)/.test(s)) && !ChamHoc.cham(m28, m28.maMau, TV).thang);
  const m16 = ManHoc.tim('1.9');
  kiem('1.9: lời giải dùng đủ 8 ô', m16.loiGiai.chinh.length === 8);
  kiem('2.6: cột HÀM có 6 ô', ManHoc.tim('2.6').khung.ham === 6);
  kiem('2.4: cột CHÍNH 5 dòng', ManHoc.tim('2.4').loiGiai.chinh.length === 5);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
