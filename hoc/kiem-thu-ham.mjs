/* ============================================================================
   kiem-thu-ham.mjs — máy kiểm "sân thử" của Xưởng hàm: sân cố định (mặc định 5×5, xe ở (2,2) quay lên)
   do người chơi sắp (xe, vật, tường); tọa độ là tọa độ thật của sân thử. Màn có tay gắp (chương tay-gap) thì
   vật là vật thật: thử pick() / drop() ngay trong Xưởng. Cũng kiểm khóa tên hàm cốt truyện của kho.
   Chạy: node robotics/hoc/kiem-thu-ham.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ChamHoc = require(path.join(day, 'cham.js'));
require(path.join(day, 'man-chuoi-2.js'));
require(path.join(day, 'man-tay-gap.js'));
const ManHoc = require(path.join(day, 'man-vong-lap.js'));        // nối cả bốn chương
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
  kiem('SAN_THU_MAC_DINH = 5×5, (2,2) hướng 0, không vật, không tường, không thùng nặng',
    J(M) === J({ rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [], tuong: [], thung: [] }), J(M));
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

console.log('\n== Vật chiếm ô (luật 14/10): xe không đi xuyên vật ==');
{
  const sanThu = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }, { x: 0, y: 0 }], tuong: [] };
  const kq = thu(lap(2, TIEN), sanThu);
  kiem('xe tiến vào ô có vật: dam-tuong (vướng vật), xe đứng yên ở (2,2)', maCua(kq).join() === 'dam-tuong' && J(kq.robot) === J({ x: 2, y: 2, huong: 0 }) && kq.chanDoan[0].muc === 'loi', J(kq.chanDoan) + J(kq.robot));
  kiem('  lời nói "vướng vật", không lộ chữ "tường"', /vướng vật/.test(kq.chanDoan[0].loi) && !/đâm vào tường/.test(kq.chanDoan[0].loi), kq.chanDoan[0].loi);
  kiem('kq.sanThu.vat trả lại đúng cho giao diện vẽ', J(kq.sanThu.vat) === J(sanThu.vat), J(kq.sanThu));
  const quanh = thu([...QP, ...TIEN, ...['right_move()', 'wait()'], ...TIEN], sanThu);
  kiem('đi vòng qua vật (quay phải, 1 ô, quay trái, 1 ô): không lỗi, xe ở (3,1)', quanh.chanDoan.length === 0 && J(quanh.robot) === J({ x: 3, y: 1, huong: 0 }), J(quanh.chanDoan) + J(quanh.robot));
}

console.log('\n== Vật thật khi màn có tay gắp: thử pick() / drop() trong Xưởng (ô TRƯỚC MẶT) ==');
{
  const mTay = ManHoc.timMa('tay-gap.5');
  const T_MOVE = ['left_move()', 'right_move()', 'wait()'];
  const pick = H('pick', ['arm_down()', 'grab()', 'wait()']);
  const drop = H('drop', ['arm_down()', 'release()', 'wait()']);
  const move = H('move', T_MOVE);
  const truocXe = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }], tuong: [] };
  const thuT = (ten, kho, sanThu, tuyChon) => ChamHoc.thuHam(mTay, {}, ten, kho, Object.assign({ sanThu }, tuyChon || {}));
  const a = thuT('pick', [pick], truocXe);
  kiem('thử pick() với vật ngay trước mặt: 1 nhịp, tay { duoi, kep, cam 1 }, vật 1 ở trạng thái cam (vẽ ở ô xe), không chẩn đoán',
    a.soNhip === 1 && J(a.tay) === J({ tuThe: 'duoi', kep: true, cam: 1 }) && J(a.vat) === J([{ id: 1, x: 2, y: 2, trangThai: 'cam' }]) && a.chanDoan.length === 0, J([a.tay, a.vat, a.chanDoan]));
  const na = a.vet.find((e) => e.loai === 'nhip');
  kiem('vết nhịp có robot.tay và vat; sự kiện nhat-vat nêu ô vật nằm (2,1)',
    J(na.robot.tay) === J({ tuThe: 'duoi', kep: true, cam: 1 }) && J(na.vat) === J([{ id: 1, x: 2, y: 2, trangThai: 'cam' }]) && na.suKien.some((e) => e.ma === 'nhat-vat' && e.id === 1 && J(e.o) === J({ x: 2, y: 1 })), J(na));
  kiem('kq.sanThu.vat vẫn trả lại cho giao diện (vị trí ban đầu)', J(a.sanThu.vat) === J([{ x: 2, y: 1 }]));
  const b = thuT('chuyen', [pick, drop, move, H('chuyen', ['pick()', 'arm_up()', 'move()', 'drop()'])], truocXe);
  kiem('pick, nâng tay, move, drop: vật được đặt xuống ô trước mặt (2,0); xe ở (2,1); tay hạ; 3 nhịp; không chẩn đoán',
    b.soNhip === 3 && J(b.vat) === J([{ id: 1, x: 2, y: 0, trangThai: 'dat' }]) && J(b.robot) === J({ x: 2, y: 1, huong: 0 }) && J(b.tay) === J({ tuThe: 'duoi', kep: false, cam: null }) && b.chanDoan.length === 0, J([b.soNhip, b.vat, b.robot, b.tay, b.chanDoan]));
  kiem('  vết: nhịp 2 vật đang cầm đi theo xe; nhịp 3 có sự kiện dat-vat ở ô (2,0)',
    (() => { const n = b.vet.filter((e) => e.loai === 'nhip'); return n[1].vat[0].trangThai === 'cam' && n[1].vat[0].y === 1 && n[2].suKien.some((e) => e.ma === 'dat-vat' && e.o.y === 0); })());
  const c = thuT('vo', [pick, H('vo', ['pick()', 'arm_up()', 'release()', 'wait()', 'wait()'])], truocXe);
  kiem('thả từ trên cao: vat-vo, vật vỡ ở ô trước mặt (2,1); sân thử không có đích nên KHÔNG dừng sớm (vẫn chạy hết hàm: 3 nhịp)',
    maCua(c).join() === 'vat-vo' && c.vat[0].trangThai === 'vo' && c.vat[0].y === 1 && c.soNhip === 3 && c.chanDoan[0].muc === 'loi', J([c.chanDoan, c.soNhip, c.vat]));
  const kh = thuT('hut', [H('hut', ['grab()', 'wait()'])], truocXe);
  kiem('kẹp khi tay chưa hạ: kep-hut (tay-nang) là THÔNG TIN (muc thong-tin), không cầm được', maCua(kh).join() === 'kep-hut' && kh.chanDoan[0].lyDo === 'tay-nang' && kh.chanDoan[0].muc === 'thong-tin' && kh.tay.cam === null && kh.vat[0].trangThai === 'dat', J(kh.chanDoan));
  const khong = thuT('hut2', [H('hut2', ['arm_down()', 'grab()', 'wait()'])], { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 0, y: 0 }], tuong: [] });
  kiem('hạ tay kẹp khi ô trước mặt không có vật: kep-hut (khong-co-vat), lời nói rõ "ô trước mặt"', khong.chanDoan.length === 1 && khong.chanDoan[0].lyDo === 'khong-co-vat' && /trước mặt/.test(khong.chanDoan[0].loi), J(khong.chanDoan));
  const xaRoi = thuT('hut3', [H('hut3', ['arm_down()', 'grab()', 'wait()'])], { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 0 }], tuong: [] });
  kiem('vật cách xe hai ô (không sát): kẹp hụt, không với tới', xaRoi.chanDoan.length === 1 && xaRoi.chanDoan[0].lyDo === 'khong-co-vat' && xaRoi.tay.cam === null, J(xaRoi.chanDoan));
  const vuong = thuT('vg', [move, pick, H('vg', ['pick()', 'move()'])], truocXe);
  kiem('tay hạ mà đi: tay-vuong, xe đứng yên (lệnh ghi rõ ở hàm move)', maCua(vuong).includes('tay-vuong') && J(vuong.robot) === J({ x: 2, y: 2, huong: 0 }) && /hàm move/.test(vuong.chanDoan.find((x) => x.ma === 'tay-vuong').loi), J(vuong.chanDoan));
  const ocv = thuT('o', [pick, drop, move, H('o', ['pick()', 'arm_up()', 'move()', 'drop()'])], { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }, { x: 2, y: 0 }], tuong: [] });
  kiem('đặt vật xuống ô trước mặt đã có vật: tha-bi-chan (kieu kep, vat "vat"), vật vẫn ở tay, kẹp vẫn đóng',
    maCua(ocv).join() === 'tha-bi-chan' && ocv.chanDoan[0].vat === 'vat' && ocv.chanDoan[0].kieu === 'kep' && ocv.tay.cam === 1 && ocv.tay.kep === true && ocv.vat[1].trangThai === 'dat', J([ocv.chanDoan, ocv.tay]));
  kiem('  lời nói nhắc release() và "ô ngay trước mặt xe"', /release\(\)/.test(ocv.chanDoan[0].loi) && /trước mặt/.test(ocv.chanDoan[0].loi), ocv.chanDoan[0].loi);
  const thuongTha = thuT('t', [pick, drop, move, H('t', ['pick()', 'arm_up()', 'move()', 'drop()'])], { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }], tuong: [{ x: 2, y: 0 }] });
  kiem('thả vào tường ngay trước mặt: tha-bi-chan (tuong), vật vẫn ở tay', maCua(thuongTha).join() === 'tha-bi-chan' && thuongTha.chanDoan[0].vat === 'tuong' && thuongTha.tay.cam === 1, J(thuongTha.chanDoan));
  const raNgoai = thuT('r', [pick, drop, move, H('r', ['pick()', 'arm_up()', 'move()', 'move()', 'drop()'])], { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }], tuong: [] });
  kiem('thả khi ô trước mặt là mép sân: tha-bi-chan (ngoai-san), vật vẫn ở tay', maCua(raNgoai).join() === 'tha-bi-chan' && raNgoai.chanDoan[0].vat === 'ngoai-san' && raNgoai.tay.cam === 1, J(raNgoai.chanDoan));
  const chanXe = thuT('c', [H('c', ['move()'])].concat([move]), truocXe);
  kiem('vật chặn xe: tiến vào ô vật thì dam-tuong (vướng vật), xe đứng yên', maCua(chanXe).join() === 'dam-tuong' && chanXe.chanDoan[0].muc === 'loi' && J(chanXe.robot) === J({ x: 2, y: 2, huong: 0 }), J(chanXe.chanDoan));
  const xeCamTuong = thuT('t2', [pick, drop, move, H('t2', ['pick()', 'arm_up()', 'move()', 'move()'])], { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }], tuong: [{ x: 2, y: 0 }] });
  kiem('xe đang cầm vật đâm tường (2,0) thì đứng yên ở (2,1); vật vẫn trong kẹp, vẽ ở ô xe',
    maCua(xeCamTuong).join() === 'dam-tuong' && J(xeCamTuong.robot) === J({ x: 2, y: 1, huong: 0 }) && xeCamTuong.vat[0].x === 2 && xeCamTuong.vat[0].y === 1 && xeCamTuong.vat[0].trangThai === 'cam', J([xeCamTuong.chanDoan, xeCamTuong.robot, xeCamTuong.vat]));
  const dung = thuT('p', [pick], truocXe);
  kiem('sân thử không có điều kiện thắng: kết quả không có `thang`, không có chua-dua-vat / chua-toi-co', dung.thang === undefined && !maCua(dung).includes('chua-dua-vat') && !maCua(dung).includes('chua-toi-co'));
  // màn không có tay gắp: vật vẫn chiếm ô (xe vướng vật), không có tay trong vết
  const cu = ChamHoc.thuHam(man, {}, 'tien', [H('tien', TIEN)], { sanThu: truocXe });
  kiem('màn không có tay gắp (2.4): vật vẫn chiếm ô (xe vướng vật), tay null, vết không có tay / vat',
    cu.tay === null && maCua(cu).join() === 'dam-tuong' && cu.vet.filter((e) => e.loai === 'nhip').every((e) => e.robot.tay === undefined && e.vat === undefined) && J(cu.vat) === J([{ id: 1, x: 2, y: 1, trangThai: 'dat' }]), J(cu));
  const mo = thuT('lenh', [H('lenh', ['arm_down()', 'wait()'])], truocXe);
  kiem('lệnh tay gọi thẳng trong hàm thử: tay đổi tư thế sau wait()', mo.tay.tuThe === 'duoi' && mo.soNhip === 1);
  const ng = ChamHoc.thuHam(man, {}, 'lenh2', [H('lenh2', ['arm_down()', 'wait()'])]);
  kiem('màn không có tay gắp gọi arm_down(): ham-chua-co', maCua(ng).includes('ham-chua-co'), J(ng.chanDoan));
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
  const d = ChamHoc.chuanSanThu({ rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 2 }], tuong: [{ x: 2, y: 2 }, { x: 1, y: 2 }] });
  kiem('vật CHIẾM Ô nên không nằm dưới xe được (bị bỏ); tường đè lên xe thì bị bỏ; vật đè lên tường bị bỏ; vật trùng nhau chỉ giữ một',
    J(d.vat) === J([{ x: 3, y: 2 }]) && J(d.tuong) === J([{ x: 1, y: 2 }]), J(d));
}

console.log('\n== Còn lại: lỗi thật vẫn báo; nhịp tối đa ==');
{
  const g = ChamHoc.thuHam(man, {}, 'lap', [H('lap', ['for i in range(500):', '    wait()'])], { nhipToiDa: 20 });
  kiem('chạy mãi: qua-nhieu-nhip', maCua(g).join() === 'qua-nhieu-nhip' && g.soNhip === 20, J(g.chanDoan));
  const gw = ChamHoc.thuHam(man, {}, 'lap', [H('lap', ['while True:', '    wait()'])], { nhipToiDa: 20 });
  kiem('chạy mãi bằng while: vong-vo-han (hàm lap, dòng 1)', maCua(gw).join() === 'vong-vo-han' && gw.soNhip === 20 && /hàm lap, dòng 1/.test(gw.chanDoan[0].loi), J(gw.chanDoan));
}

console.log('\n== Kho hàm: khóa tên các hàm theo cốt truyện (taoHam của bất kỳ màn nào) ==');
{
  const tenCuaTruyen = [...new Set(ManHoc.danhSach.flatMap((m) => m.taoHam || []))];
  kiem('các màn khai taoHam: move, turn_right, turn_left, u_turn, corner, stair, two, pick, drop, carry (và side, row, bend_left, bend_right)',
    ['move', 'turn_right', 'turn_left', 'u_turn', 'corner', 'stair', 'two', 'pick', 'drop', 'carry', 'side', 'row', 'bend_left', 'bend_right'].every((n) => tenCuaTruyen.includes(n)) && tenCuaTruyen.length === 14, J(tenCuaTruyen));
  const kho = KhoHam.moi();
  kiem('kho mới chưa khóa tên nào (đúng với các test cũ)', !kho.tenCoDinh('move') && kho.dsTenCoDinh().length === 0);
  kho.datTenCoDinh(tenCuaTruyen);
  kiem('sau datTenCoDinh: tenCoDinh true với hàm cốt truyện, false với tên khác', kho.tenCoDinh('move') && kho.tenCoDinh('two') && !kho.tenCoDinh('tu_toi'));
  kho.tao('move', [], { taoHam: ['move'] }); kho.tao('tu_toi', []);
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

console.log('\n== Kho hàm: tên hàm cốt truyện chỉ tạo đúng ở màn yêu cầu nó (ten-danh-cho-cot-truyen) ==');
{
  const tenCuaTruyen = [...new Set(ManHoc.danhSach.flatMap((m) => m.taoHam || []))];
  const k = KhoHam.moi({ tenCoDinh: tenCuaTruyen });
  const r = k.kiemTen('pick');
  kiem('chiếm tên cốt truyện ở màn khác (kiemTen không nói màn nào): ten-danh-cho-cot-truyen, có lời tiếng Việt', !r.ok && r.ma === 'ten-danh-cho-cot-truyen' && /màn khác/.test(r.loi), J(r));
  kiem('tao("pick") không kèm tuyChon: bị từ chối, kho không thêm gì', k.tao('pick', []).ma === 'ten-danh-cho-cot-truyen' && k.soHam() === 0);
  kiem('tao("pick", [], { taoHam: ["drop"] }) (màn đang chơi dạy hàm khác): vẫn bị từ chối', k.tao('pick', [], { taoHam: ['drop'] }).ma === 'ten-danh-cho-cot-truyen' && k.soHam() === 0);
  kiem('kiemTen("pick", undefined, { taoHam: ["pick"] }) và tao(…) ở đúng màn yêu cầu nó: ok', k.kiemTen('pick', undefined, { taoHam: ['pick'] }).ok && k.tao('pick', [], { taoHam: ['pick'] }).ok && k.soHam() === 1);
  kiem('kho đã có pick thì tạo lại là ten-da-co (không còn là "dành cho cốt truyện")', k.tao('pick', [], { taoHam: ['pick'] }).ma === 'ten-da-co' && k.kiemTen('pick').ma === 'ten-da-co');
  kiem('tên tự đặt (không phải tên cốt truyện) tạo tự do, không cần tuyChon', k.tao('tu_toi', []).ok && k.kiemTen('lay_vat').ok);
  const d = k.doiTen('tu_toi', 'drop');
  kiem('đổi tên hàm tự đặt sang tên cốt truyện chưa có trong kho: bị từ chối, hàm giữ nguyên tên cũ', d.ma === 'ten-danh-cho-cot-truyen' && !!k.tim('tu_toi') && !k.tim('drop'), J(d));
  const d2 = k.doiTen('tu_toi', 'drop', { taoHam: ['drop'] });
  kiem('đổi tên sang đúng tên màn đang yêu cầu: được', d2.ok && !!k.tim('drop') && !k.tim('tu_toi'), J(d2));
  kiem('hàm cốt truyện đã có trong kho vẫn bị khóa đổi tên / xóa (ten-co-dinh)', k.doiTen('pick', 'nhat').ma === 'ten-co-dinh' && k.xoa('pick').ma === 'ten-co-dinh');
  const k2 = KhoHam.moi();
  kiem('kho chưa khóa tên nào (datTenCoDinh chưa gọi): tên bất kỳ tạo tự do — chỉ chặn khi giao diện đã khóa danh sách cốt truyện', k2.tao('pick', []).ok);
  const k3 = KhoHam.moi({ tenCoDinh: tenCuaTruyen });
  kiem('hàm gốc vẫn chặn trước: "grab" là ten-trung-ham-goc, không phải ten-danh-cho-cot-truyen', k3.kiemTen('grab').ma === 'ten-trung-ham-goc');
}

console.log('\n== Sân thử có THÙNG NẶNG (màn có súng hơi, hamGoc có shoot / shoot_back) ==');
{
  const mDay = { loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'shoot', 'shoot_back'], moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 } };
  const xy = (ds) => ds.map((t) => ({ x: t.x, y: t.y }));
  const thuD = (than, sanThu) => ChamHoc.thuHam(mDay, {}, 'h', [H('h', than)], { sanThu });
  const st = { rong: 5, cao: 5, batDau: { x: 2, y: 4, huong: 0 }, vat: [], tuong: [{ x: 0, y: 0 }], thung: [{ x: 2, y: 2 }] };
  const c = ChamHoc.chuanSanThu(Object.assign({}, st, { thung: [{ x: 2, y: 2 }, { x: 2, y: 2 }, { x: 0, y: 0 }, { x: 2, y: 4 }, { x: 9, y: 9 }] }));
  kiem('chuanSanThu: thùng trùng, đè tường, đè xe hay ngoài sân đều bị bỏ', J(xy(c.thung)) === J([{ x: 2, y: 2 }]), J(c));
  const a = thuD(TIEN, st);
  kiem('tiến một ô: thùng chưa đụng, không chẩn đoán', J(xy(a.thung)) === J([{ x: 2, y: 2 }]) && a.chanDoan.length === 0, J(a.chanDoan));
  const b = thuD([...TIEN, ...TIEN], st);
  kiem('tiến hai ô: xe húc thùng bằng bánh = đâm như tường (dam-tuong), thùng đứng yên ở (2,2), xe dừng ở (2,3); kq.thung trả cho giao diện vẽ; vết nhịp có thung',
    maCua(b).includes('dam-tuong') && J(xy(b.thung)) === J([{ x: 2, y: 2 }]) && b.robot.y === 3 && b.vet.filter((e) => e.loai === 'nhip').every((e) => Array.isArray(e.thung)), J([xy(b.thung), b.robot, b.chanDoan.map((x) => x.ma)]));
  const d = thuD(['shoot_back()', 'wait()'], st);
  kiem('shoot_back() ở xe chưa sát thùng: xe giật tới một ô (2,3), thùng đứng yên, không chẩn đoán (cú giật dời được xe)', J(xy(d.thung)) === J([{ x: 2, y: 2 }]) && d.robot.y === 3 && d.chanDoan.length === 0, J(d.chanDoan));
  const e = thuD([...TIEN, 'shoot_back()', 'wait()'], st);
  kiem('tiến một ô rồi shoot_back(): cú giật đẩy thùng trượt tới mép trên (2,0), xe đứng yên ở (2,3), không chẩn đoán', J(xy(e.thung)) === J([{ x: 2, y: 0 }]) && e.robot.y === 3 && e.chanDoan.length === 0, J([xy(e.thung), e.robot, e.chanDoan]));
  const f = ChamHoc.thuHam(man, {}, 'h', [H('h', [...TIEN, ...TIEN])], { sanThu: st });
  kiem('màn KHÔNG có súng hơi: xe đâm thùng nặng như tường (dam-tuong, nói rõ chỉ cú giật của súng hơi mới dời được thùng)',
    maCua(f).includes('dam-tuong') && /súng hơi/.test(f.chanDoan[0].loi) && J(xy(f.thung)) === J([{ x: 2, y: 2 }]) && f.robot.y === 3, J(f.chanDoan));
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
