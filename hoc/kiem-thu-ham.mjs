/* ============================================================================
   kiem-thu-ham.mjs — máy kiểm "sân thử" của Xưởng hàm: sân trống đủ rộng, tọa độ dịch về
   khung quy ước (xuất phát = BAT_DAU_THU = (1,1)), và `khung` bao mọi ô robot đã đi qua.
   Chạy: node robotics/hoc/kiem-thu-ham.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'man-chuoi-2.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const man = ManHoc.tim('2.4');
const B = ChamHoc.BAT_DAU_THU;
const TIEN = ['left_move()', 'right_move()', 'wait()'];
const lap = (n, d) => ['for i in range(' + n + '):', ...d.map((x) => '    ' + x)];

console.log('\n== Sân thử rộng: hàm đi xa không còn "ngoài sân" ==');
for (const n of [1, 2, 5, 8]) {
  const kq = ChamHoc.thuHam(man, {}, 'tien', [H('tien', lap(n, TIEN))]);
  kiem('tiến ' + n + ' ô: không chẩn đoán, robot ở y = ' + (B.y - n),
    kq.chanDoan.length === 0 && kq.robot.x === B.x && kq.robot.y === B.y - n && kq.robot.huong === 0 && kq.soNhip === n, J(kq.chanDoan) + J(kq.robot));
  kiem('  khung tiến ' + n + ': minY = ' + (B.y - n) + ', maxY = ' + B.y + ', x không đổi',
    J(kq.khung) === J({ minX: B.x, maxX: B.x, minY: B.y - n, maxY: B.y }), J(kq.khung));
  kiem('  vết của nhịp cuối khớp robot cuối',
    J(kq.vet.filter((e) => e.loai === 'nhip').pop().robot.y) === J(kq.robot.y));
}

console.log('\n== Hình chữ L, đi lùi, quay tại chỗ, hàm rỗng ==');
{
  const qp = ['left_move()', 'wait()'];                       // chỉ bánh trái tiến → quay phải
  const l = ChamHoc.thuHam(man, {}, 'ell', [H('ell', [...TIEN, ...qp, ...lap(2, TIEN)])]);
  kiem('chữ L: 1 ô lên, quay phải, 2 ô sang phải → (3,0) hướng phải',
    l.chanDoan.length === 0 && J(l.robot) === J({ x: 3, y: 0, huong: 1 }), J(l.chanDoan) + J(l.robot));
  kiem('  khung chữ L', J(l.khung) === J({ minX: 1, maxX: 3, minY: 0, maxY: 1 }), J(l.khung));
  const manDay = Object.assign({}, man, { hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'] });
  const lui = ChamHoc.thuHam(manDay, {}, 'lui', [H('lui', ['left_back()', 'right_back()', 'wait()', 'left_back()', 'right_back()', 'wait()'])]);
  kiem('lùi 2 ô: robot y = 3, khung maxY = 3', lui.robot.y === 3 && lui.khung.maxY === 3 && lui.khung.minY === 1 && lui.chanDoan.length === 0, J(lui));
  const q = ChamHoc.thuHam(man, {}, 'q', [H('q', qp)]);
  kiem('quay tại chỗ: khung chỉ một ô xuất phát, robot đổi hướng',
    J(q.khung) === J({ minX: 1, maxX: 1, minY: 1, maxY: 1 }) && q.robot.x === 1 && q.robot.y === 1 && q.robot.huong === 1 && q.chanDoan.length === 0, J(q));
  const rong = ChamHoc.thuHam(man, {}, 'trong', [H('trong', [])]);
  kiem('hàm rỗng: không chạy, robot ở gốc, khung một ô',
    rong.soNhip === 0 && J(rong.robot) === J(B) && J(rong.khung) === J({ minX: 1, maxX: 1, minY: 1, maxY: 1 }), J(rong));
  const ct = ChamHoc.thuHam(man, {}, 'trong', [H('trong', ['wait()'])]);
  kiem('chỉ wait(): 1 nhịp, khung một ô, không chẩn đoán', ct.soNhip === 1 && ct.chanDoan.length === 0 && J(ct.khung) === J(rong.khung), J(ct));
}

console.log('\n== Sự kiện trong vết cũng dùng khung tọa độ quy ước ==');
{
  const kq = ChamHoc.thuHam(man, {}, 'hai', [H('hai', lap(2, TIEN))]);
  const dens = kq.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien.filter((s) => s.den).map((s) => s.den.y));
  kiem('ô đến của từng nhịp: 0 rồi -1', J(dens) === J([0, -1]), J(dens));
}

console.log('\n== Còn lại: lỗi thật vẫn báo; nhịp tối đa ==');
{
  const g = ChamHoc.thuHam(man, {}, 'lap', [H('lap', ['while True:', '    wait()'])], { nhipToiDa: 20 });
  kiem('chạy mãi: qua-nhieu-nhip', maCua(g).join() === 'qua-nhieu-nhip' && g.soNhip === 20, J(g.chanDoan));
  const xa = ChamHoc.thuHam(man, {}, 'xa', [H('xa', lap(19, TIEN))]);
  kiem('hàm đi 19 ô vẫn chạy hết, không chẩn đoán', xa.chanDoan.length === 0 && xa.robot.y === 1 - 19, J(xa.chanDoan) + J(xa.robot));
  const xaQua = ChamHoc.thuHam(man, {}, 'xa', [H('xa', lap(30, TIEN))]);
  kiem('đi 30 ô thì ra khỏi sân 41×41: lời nói rõ là "đi quá xa", không chỉ ô lạ',
    maCua(xaQua).join() === 'dam-tuong' && /quá xa/.test(xaQua.chanDoan[0].loi) && !/\(-?\d+, -?\d+\)/.test(xaQua.chanDoan[0].loi), J(xaQua.chanDoan));
  kiem('tọa độ quy ước ở ĐẦU ra: batDau luôn (1,1) quay lên', J(xa.batDau) === J(B));
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
