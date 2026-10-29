/* ============================================================================
   kiem-cam-4.mjs — máy kiểm CAMERA BỐN HƯỚNG color(huong) (P1 mùa 4, N2, 30/10; user chốt 29/10: camera gom về một lệnh color, gốc 4 hướng, nâng cấp thêm "here").
   Xe có mũi đọc "front" / "left" / "right" / "back" theo mũi; drone / nhện đọc "up" / "down" / "left" / "right" theo bản đồ; nâng cấp taiCho thêm "here";
   hướng thiếu / lạ / "here" chưa nâng cấp → lỗi chạy huong-cam-sai; color() không đối số của cảm biến cũ giữ nguyên; color("…") khi không có camera-4 → lỗi.
   Chạy: node hoc/kiem-cam-4.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-cam-4.mjs --loi-gia  (cố ý bẻ luật: phải ĐỎ)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));

const LOI_GIA = process.argv.includes('--loi-gia');
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const XE = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'color'];
const DRONE = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'color'];
// --loi-gia: robot gắn camera trước cũ thay cho camera bốn hướng → đọc sai hướng, lỗi cấu hình / lỗi chạy khác
const CAM = LOI_GIA ? [{ ma: 'mau', o: 'hong' }] : [{ ma: 'camera-4', o: 'tren' }];
const CAM_TC = LOI_GIA ? [{ ma: 'mau', o: 'hong' }] : [{ ma: 'camera-4', o: 'tren', taiCho: true }];
// sân 3×3 có màu bốn phía quanh ô giữa (1,1): trên đỏ, phải xanh lá, dưới xanh dương, trái vàng; ô giữa không màu (lớp sơn sẵn không có)
const SAN = ['.r.', 'y.g', '.b.'];
const doc = (kq) => kq.vet.filter((v) => v.loai === 'lenh' && v.docCamBien).map((v) => v.docCamBien.mau);
const chay = (loai, hg, cam, ct, them) => SanHoc.chay(Object.assign({ loaiRobot: loai, hamGoc: hg, camBien: cam, mucTieu: 'toi-co', san: SAN, batDau: { x: 1, y: 1, huong: 1 } }, them || {}), ct);
const IN4 = (ds) => ds.map((h) => 'a = color("' + h + '")').join('\n') + '\nwait()\n';

console.log('A. Lõi: đọc bốn hướng');
try {
  const k = chay('banh', XE, CAM, IN4(['front', 'right', 'back', 'left']));
  kiem('xe quay phải ở (1,1): front = xanh lá (phải), right = xanh dương (dưới), back = vàng (trái), left = đỏ (trên)', J(doc(k)) === J(['green', 'blue', 'yellow', 'red']), J(doc(k)));
  const d0 = k.vet.find((v) => v.docCamBien).docCamBien;
  kiem('docCamBien có cam camera-4, huong "front", o = ô kề (2,1)', d0.cam === 'camera-4' && d0.huong === 'front' && d0.o.x === 2 && d0.o.y === 1, J(d0));
} catch (e) { kiem('xe đọc bốn hướng chạy được', false, e.message); }
try {
  const k = chay('banh', XE, CAM, IN4(['front', 'right', 'back', 'left']), { batDau: { x: 1, y: 1, huong: 0 } });
  kiem('xe quay lên: front = đỏ, right = xanh lá, back = xanh dương, left = vàng (theo mũi xe)', J(doc(k)) === J(['red', 'green', 'blue', 'yellow']), J(doc(k)));
} catch (e) { kiem('xe quay lên chạy được', false, e.message); }
try {
  const k = chay('drone', DRONE, CAM, IN4(['up', 'right', 'down', 'left']));
  kiem('drone đọc theo bản đồ: up đỏ, right xanh lá, down xanh dương, left vàng', J(doc(k)) === J(['red', 'green', 'blue', 'yellow']), J(doc(k)));
} catch (e) { kiem('drone đọc bốn hướng chạy được', false, e.message); }
try {
  const k = chay('drone', DRONE, CAM, 'a = color("up")\ngo_up()\nb = color("up")\nwait()\n');
  kiem('ngoài sân → "none"', J(doc(k)) === J(['red', 'none']), J(doc(k)));
} catch (e) { kiem('đọc ngoài sân chạy được', false, e.message); }
try {
  const k = chay('drone', DRONE, CAM_TC, 'go_up()\na = color("here")\nwait()\n');
  kiem('nâng cấp taiCho: drone ở (1,0) đọc "here" = đỏ', J(doc(k)) === J(['red']), J(doc(k)));
  const kv = chay('drone', DRONE, CAM_TC, 'a = color("here")\nwait()\n', { san: ['...', '.o.', '...'], vatMau: ['...', '.b.', '...'] });
  kiem('drone đứng trên vật xanh dương: "here" = blue (thấy vật dưới bụng)', J(doc(kv)) === J(['blue']), J(doc(kv)));
} catch (e) { kiem('đọc here chạy được', false, e.message); }
{
  const loiCua = (k) => (k.loi && k.loi.ma) || null;
  let k = null;
  try { k = chay('drone', DRONE, CAM, 'a = color("here")\nwait()\n'); } catch (e) { k = { loi: { ma: 'nem: ' + e.message } }; }
  kiem('"here" khi chưa nâng cấp: lỗi chạy huong-cam-sai, nhắc nâng cấp', loiCua(k) === 'huong-cam-sai' && /nâng cấp/.test(k.loi.thongDiep), J(k.loi));
  try { k = chay('banh', XE, CAM, 'a = color("up")\nwait()\n'); } catch (e) { k = { loi: { ma: 'nem: ' + e.message } }; }
  kiem('xe gọi color("up"): hướng lạ, lời liệt kê "front", "left"…', loiCua(k) === 'huong-cam-sai' && /"front"/.test(k.loi.thongDiep), J(k.loi));
  try { k = chay('drone', DRONE, CAM, 'a = color()\nwait()\n'); } catch (e) { k = { loi: { ma: 'nem: ' + e.message } }; }
  kiem('color() thiếu hướng trên camera bốn hướng: huong-cam-sai', loiCua(k) === 'huong-cam-sai', J(k.loi));
}
{
  // cảm biến cũ không đổi
  const k = SanHoc.chay({ loaiRobot: 'banh', hamGoc: XE, camBien: [{ ma: 'mau', o: 'hong' }], mucTieu: 'toi-co', san: ['r..'], batDau: { x: 0, y: 0, huong: 1 } }, 'a = color()\nwait()\n');
  kiem('cảm biến bụng: color() không đối số vẫn đọc ô dưới xe (đỏ)', J(doc(k)) === J(['red']), J(doc(k)));
  const k2 = SanHoc.chay({ loaiRobot: 'banh', hamGoc: XE, camBien: [{ ma: 'mau', o: 'hong' }], mucTieu: 'toi-co', san: ['r..'], batDau: { x: 0, y: 0, huong: 1 } }, 'a = color("front")\nwait()\n');
  kiem('cảm biến bụng gọi color("front"): lỗi chạy, lời bảo bỏ hướng', k2.loi && k2.loi.ma === 'huong-cam-sai' && /không nhận hướng/.test(k2.loi.thongDiep), J(k2.loi));
  let loiCH = null;
  try { SanHoc.chay({ loaiRobot: 'banh', hamGoc: XE, camBien: [{ ma: 'camera-4', o: 'tren' }, { ma: 'mau', o: 'hong' }], mucTieu: 'toi-co', san: ['...'], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n'); } catch (e) { loiCH = e.message; }
  kiem('camera bốn hướng gắn chung cảm biến bụng: lỗi cấu hình', !!loiCH && /Camera bốn hướng/.test(loiCH), loiCH);
}

console.log('B. cham.js');
{
  const man = { loaiRobot: 'drone', hamGoc: DRONE, robot: { than: 'drone', tay: null, camBien: CAM }, camBien: CAM, mucTieu: 'toi-co', san: ['F..'], batDau: { x: 1, y: 0 }, sao: { o: 99, nhip: 99 } };
  try {
    const r = ChamHoc.cham(man, { chinh: ['if color("left") == "none":', '    go_left()', 'else:', '    go_right()'] }, []);
    kiem('chấm màn có color("left") trong điều kiện: ô cờ bên trái không màu ("none") nên bay trái, thắng, không chẩn đoán', r.thang === true && !r.chanDoan.length, J({ thang: r.thang, cd: r.chanDoan.map((c) => c.ma) }));
    const r2 = ChamHoc.cham(man, { chinh: ['a = color("here")', 'go_left()'] }, []);
    const cd = r2.chanDoan.find((c) => /huong-cam-sai|loi-chay/.test(c.ma));
    kiem('chấm "here" khi chưa nâng cấp: có chẩn đoán lỗi chạy kèm lời nâng cấp', !!cd && /nâng cấp/.test(J(cd)), J(r2.chanDoan));
  } catch (e) { kiem('cham chạy được', false, e.message); }
}

console.log('---------------------------------------------');
console.log((LOI_GIA ? 'Lỗi giả: ' + (hong ? 'BẮT ĐƯỢC (ĐẠT)' : 'KHÔNG BẮT ĐƯỢC') : (hong ? 'HỎNG ' : 'ĐẠT ') + dat + ' · HỎNG ' + hong));
process.exit(LOI_GIA ? (hong ? 0 : 1) : (hong ? 1 : 0));
