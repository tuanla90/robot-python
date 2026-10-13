/* ============================================================================
   kiem-thu-ham.mjs — máy kiểm "sân thử" của Xưởng hàm: sân cố định (mặc định 5×5, xe ở (2,2) quay lên)
   do người chơi sắp (xe, vật, tường); tọa độ là tọa độ thật của sân thử.
   Chạy: node robotics/hoc/kiem-thu-ham.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ChamHoc = require(path.join(day, 'cham.js'));
require(path.join(day, 'man-chuoi-2.js'));
const ManHoc = require(path.join(day, 'man-vong-lap.js'));        // nối cả ba chương
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const man = ManHoc.tim('2.4');
const TIEN = ['left_move()', 'right_move()', 'wait()'];
const QP = ['left_move()', 'wait()'];                      // chỉ bánh trái tiến → quay phải
const lap = (n, d) => ['for i in range(' + n + '):', ...d.map((x) => '    ' + x)];
const thu = (than, sanThu, tuyChon = {}) => ChamHoc.thuHam(man, {}, 'h', [H('h', than)], Object.assign({ sanThu }, tuyChon));

console.log('\n== Mặc định: sân 5×5 trống, xe ở giữa (2,2) quay lên ==');
{
  const M = ChamHoc.SAN_THU_MAC_DINH;
  kiem('SAN_THU_MAC_DINH = 5×5, (2,2) hướng 0, không vật, không tường',
    J(M) === J({ rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [], tuong: [] }), J(M));
  for (const n of [1, 2]) {
    const kq = ChamHoc.thuHam(man, {}, 'tien', [H('tien', lap(n, TIEN))]);
    kiem('không truyền sanThu, tiến ' + n + ' ô: không chẩn đoán, xe ở y = ' + (2 - n),
      kq.chanDoan.length === 0 && J(kq.robot) === J({ x: 2, y: 2 - n, huong: 0 }) && kq.soNhip === n, J(kq.chanDoan) + J(kq.robot));
    kiem('  batDau (2,2) hướng lên; kq.sanThu là bản mặc định', J(kq.batDau) === J(M.batDau) && J(kq.sanThu) === J(M));
  }
  const q = ChamHoc.thuHam(man, {}, 'q', [H('q', QP)]);
  kiem('quay tại chỗ: xe đổi hướng, vẫn ở (2,2)', J(q.robot) === J({ x: 2, y: 2, huong: 1 }) && q.chanDoan.length === 0, J(q.robot));
  const rong = ChamHoc.thuHam(man, {}, 'trong', [H('trong', [])]);
  kiem('hàm rỗng: không chạy, xe ở gốc', rong.soNhip === 0 && J(rong.robot) === J(M.batDau), J(rong));
  const lui = ChamHoc.thuHam(Object.assign({}, man, { hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'] }), {}, 'lui',
    [H('lui', ['left_back()', 'right_back()', 'wait()'])]);
  kiem('lùi một ô: y = 3', lui.robot.y === 3 && lui.chanDoan.length === 0, J(lui.robot));
  const dens = ChamHoc.thuHam(man, {}, 'hai', [H('hai', lap(2, TIEN))]).vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien.filter((s) => s.den).map((s) => s.den.y));
  kiem('sự kiện trong vết dùng tọa độ thật của sân thử: ô đến y = 1 rồi 0', J(dens) === J([1, 0]), J(dens));
}

console.log('\n== Xe đặt ở góc dưới trái rồi xoay sang phải ==');
{
  const sanThu = { rong: 5, cao: 5, batDau: { x: 0, y: 4, huong: 1 }, vat: [], tuong: [] };
  const kq = thu(lap(4, TIEN), sanThu);
  kiem('xe ở (0,4) quay phải, đi 4 ô → (4,4), không chẩn đoán', kq.chanDoan.length === 0 && J(kq.robot) === J({ x: 4, y: 4, huong: 1 }) && kq.soNhip === 4, J(kq.chanDoan) + J(kq.robot));
  kiem('  batDau trả về đúng cấu hình đặt', J(kq.batDau) === J({ x: 0, y: 4, huong: 1 }));
  const ra = thu(lap(5, TIEN), sanThu);
  kiem('đi 5 ô thì ô thứ 5 ra ngoài sân: dam-tuong (ngoai-san), xe dừng ở (4,4)',
    maCua(ra).join() === 'dam-tuong' && J(ra.robot) === J({ x: 4, y: 4, huong: 1 }), J(ra.chanDoan) + J(ra.robot));
  kiem('  lời nói "ra ngoài sân thử" và "Đặt xe chỗ khác", không lộ tọa độ',
    /ra ngoài sân thử/.test(ra.chanDoan[0].loi) && /Đặt xe chỗ khác rồi thử lại/.test(ra.chanDoan[0].loi) && !/\(-?\d+, -?\d+\)/.test(ra.chanDoan[0].loi), ra.chanDoan[0].loi);
  const lenTrai = thu(TIEN, { rong: 5, cao: 5, batDau: { x: 0, y: 0, huong: 3 }, vat: [], tuong: [] });
  kiem('xe ở góc trên trái quay trái, tiến: ra ngoài sân', maCua(lenTrai).join() === 'dam-tuong' && J(lenTrai.robot) === J({ x: 0, y: 0, huong: 3 }));
  const nhieu = thu(lap(30, TIEN), { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [], tuong: [] });
  kiem('đi 30 ô trên sân 5×5: một chẩn đoán dam-tuong báo nhiều lần', maCua(nhieu).join() === 'dam-tuong' && nhieu.chanDoan[0].soLan > 1, J(nhieu.chanDoan));
}

console.log('\n== Tường chặn như sân thường ==');
{
  const sanThu = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [], tuong: [{ x: 2, y: 0 }] };
  const ok = thu(TIEN, sanThu);
  kiem('tường cách 2 ô, đi 1 ô: ổn, xe ở (2,1)', ok.chanDoan.length === 0 && J(ok.robot) === J({ x: 2, y: 1, huong: 0 }), J(ok.chanDoan) + J(ok.robot));
  const dam = thu(lap(2, TIEN), sanThu);
  kiem('đi 2 ô thì nhịp 2 đâm tường (2,0): dam-tuong, xe đứng yên ở (2,1), vẫn mất nhịp',
    maCua(dam).join() === 'dam-tuong' && J(dam.robot) === J({ x: 2, y: 1, huong: 0 }) && dam.soNhip === 2, J(dam.chanDoan) + J(dam.robot));
  kiem('  lời nói "đâm vào tường", không phải "ngoài sân"', /đâm vào tường/.test(dam.chanDoan[0].loi) && !/ngoài sân/.test(dam.chanDoan[0].loi), dam.chanDoan[0].loi);
  const sk = dam.vet.filter((e) => e.loai === 'nhip').pop().suKien.filter((s) => s.ma === 'dam-tuong')[0];
  kiem('  sự kiện dam-tuong ghi vat = tuong, ô đến (2,0)', sk && sk.vat === 'tuong' && J(sk.den) === J({ x: 2, y: 0 }), J(sk));
  const quanh = thu(['left_move()', 'wait()', ...TIEN, 'right_move()', 'wait()', ...TIEN], sanThu);
  kiem('đi vòng tránh tường (quay phải, 1 ô, quay trái, 1 ô): không lỗi, xe ở (3,1)', quanh.chanDoan.length === 0 && J(quanh.robot) === J({ x: 3, y: 1, huong: 0 }), J(quanh.chanDoan) + J(quanh.robot));
}

console.log('\n== Vật: chỉ là ô có vật, không chặn đường ==');
{
  const sanThu = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }, { x: 0, y: 0 }], tuong: [] };
  const kq = thu(lap(2, TIEN), sanThu);
  kiem('xe đi xuyên ô có vật, không chẩn đoán, tới (2,0)', kq.chanDoan.length === 0 && J(kq.robot) === J({ x: 2, y: 0, huong: 0 }), J(kq.chanDoan) + J(kq.robot));
  kiem('kq.sanThu.vat trả lại đúng cho giao diện vẽ', J(kq.sanThu.vat) === J(sanThu.vat), J(kq.sanThu));
}

console.log('\n== chuanSanThu: sửa số liệu bậy ==');
{
  const c = ChamHoc.chuanSanThu({
    rong: 5, cao: 5, batDau: { x: 9, y: -3, huong: 6 },
    vat: [{ x: 4, y: 4 }, { x: 4, y: 4 }, { x: 7, y: 0 }, { x: 0, y: 0 }, { x: 'a', y: 1 }],
    tuong: [{ x: 4, y: 4 }, { x: 4, y: 0 }]
  });
  kiem('xe ngoài sân bị kéo vào mép, hướng lấy theo mod 4', J(c.batDau) === J({ x: 4, y: 0, huong: 2 }), J(c.batDau));
  kiem('tường đè lên xe, ô trùng, vật ngoài sân, số lạ đều bị bỏ', J(c.tuong) === J([{ x: 4, y: 4 }]) && J(c.vat) === J([{ x: 0, y: 0 }]), J(c));
  const m = ChamHoc.chuanSanThu(null);
  kiem('null → mặc định', J(m) === J(ChamHoc.SAN_THU_MAC_DINH), J(m));
}

console.log('\n== Còn lại: lỗi thật vẫn báo; nhịp tối đa ==');
{
  const g = ChamHoc.thuHam(man, {}, 'lap', [H('lap', ['while True:', '    wait()'])], { nhipToiDa: 20 });
  kiem('chạy mãi: qua-nhieu-nhip', maCua(g).join() === 'qua-nhieu-nhip' && g.soNhip === 20, J(g.chanDoan));
}

console.log('\n== Kho hàm: khóa tên các hàm theo cốt truyện (taoHam của bất kỳ màn nào) ==');
{
  const tenCuaTruyen = [...new Set(ManHoc.danhSach.flatMap((m) => m.taoHam || []))];
  kiem('các màn khai taoHam: move, turn_right, turn_left, u_turn, corner, stair, two',
    ['move', 'turn_right', 'turn_left', 'u_turn', 'corner', 'stair', 'two'].every((n) => tenCuaTruyen.includes(n)), J(tenCuaTruyen));
  const kho = KhoHam.moi();
  kiem('kho mới chưa khóa tên nào (đúng với các test cũ)', !kho.tenCoDinh('move') && kho.dsTenCoDinh().length === 0);
  kho.datTenCoDinh(tenCuaTruyen);
  kiem('sau datTenCoDinh: tenCoDinh true với hàm cốt truyện, false với tên khác', kho.tenCoDinh('move') && kho.tenCoDinh('two') && !kho.tenCoDinh('tu_toi'));
  kho.tao('move', []); kho.tao('tu_toi', []);
  kho.sua('move', ['left_move()', 'right_move()', 'wait()']);
  const dt = kho.doiTen('move', 'tien');
  kiem('đổi tên hàm cốt truyện: { ok:false, ma:"ten-co-dinh" }, tên và thân giữ nguyên',
    dt.ok === false && dt.ma === 'ten-co-dinh' && kho.tim('move') && !kho.tim('tien') && kho.tim('move').than.length === 3, J(dt));
  const xo = kho.xoa('move');
  kiem('xóa hàm cốt truyện: { ok:false, ma:"ten-co-dinh" }, hàm vẫn còn', xo.ok === false && xo.ma === 'ten-co-dinh' && !!kho.tim('move'), J(xo));
  kiem('  lời báo có chữ "cần cho các màn sau"', /cần cho các màn sau/.test(xo.loi), xo.loi);
  const sua = kho.sua('move', ['wait()']);
  kiem('vẫn sửa thân bình thường', sua.ok && kho.tim('move').than.join() === 'wait()', J(sua));
  const d2 = kho.doiTen('tu_toi', 'tuy_y');
  kiem('hàm em tự tạo (tên ngoài taoHam): đổi tên tự do', d2.ok && !!kho.tim('tuy_y') && !kho.tim('tu_toi'), J(d2));
  const x2 = kho.xoa('tuy_y');
  kiem('hàm em tự tạo: xóa tự do', x2.ok && !kho.tim('tuy_y'), J(x2));
  const luu = {}; luu.setItem = (k, v) => { luu[k] = v; }; luu.getItem = (k) => (k in luu ? luu[k] : null);
  kho.ghiLuu(luu);
  const kho2 = KhoHam.moi({ tenCoDinh: tenCuaTruyen });
  kho2.docLuu(luu);
  kiem('khóa không nằm trong dữ liệu lưu: kho nạp từ đĩa vẫn khóa nhờ tuyChon.tenCoDinh', kho2.tenCoDinh('move') && kho2.xoa('move').ma === 'ten-co-dinh');
  kiem('KhoHam mặc định có đủ hàm datTenCoDinh / tenCoDinh để giao diện dùng', typeof KhoHam.datTenCoDinh === 'function' && typeof KhoHam.tenCoDinh === 'function');
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
