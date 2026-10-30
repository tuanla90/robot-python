/* ============================================================================
   kiem-dap-sac.mjs — máy kiểm ĐÁP ĐẤT ĐỂ SẠC (P1 mùa 4, N1, 30/10; user chốt 29/10): drone nâng cấp có land() / take_off().
   Đáp trên ô sạc P thì pin đầy ngay; ô P không còn sạc tự động; đang đậu thì go_*() không bay ('dang-dau'); nhịp đậu trọn không tốn pin;
   ô rào / hố / băng / bậc thang / thùng / vật không đáp được; drone gốc (không có land) giữ luật sạc tự động cũ. Lời cham.js cho các chẩn đoán mới.
   Chạy: node hoc/kiem-dap-sac.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-dap-sac.mjs --loi-gia  (cố ý bẻ luật: phải ĐỎ)
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
const nhip = (kq) => kq.vet.filter((v) => v.loai === 'nhip');
const vt = (kq) => kq.robot.x + ',' + kq.robot.y;
const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
const GOC = BAY.concat(['battery']);
// --loi-gia: drone "nâng cấp" mà khay quên land / take_off, chạy như drone gốc → các ca luật mới phải đỏ
const DAP = LOI_GIA ? GOC : GOC.concat(['land', 'take_off']);
const chay = (hg, cfg, ct) => SanHoc.chay(Object.assign({ loaiRobot: 'drone', hamGoc: hg, mucTieu: 'toi-co' }, cfg), ct);
const coSk = (kq, ma) => kq.suKien.some((e) => e.ma === ma) || nhip(kq).some((n) => n.suKien.some((e) => e.ma === ma));
const pinNhip = (kq) => nhip(kq).map((n) => n.robot.pin);

console.log('A. Lõi: đáp đất để sạc');
let kSac = null;
try {
  // pin 3, bay 2 ô tới P, đáp, cất cánh, bay 2 ô tới cờ (cần 2 pin sau khi sạc)
  kSac = chay(DAP, { san: ['..P.F'], batDau: { x: 0, y: 0 }, pin: 3 }, 'go_right()\ngo_right()\nland()\ntake_off()\ngo_right()\ngo_right()\n');
  kiem('đáp trên P: pin đầy ngay ở nhịp land(), cất cánh bay tiếp tới cờ', kSac.thang === true && coSk(kSac, 'sac-pin') && coSk(kSac, 'dap') && coSk(kSac, 'cat-canh'),
    J({ thang: kSac.thang, pin: pinNhip(kSac), ds: kSac.dungSom }));
  kiem('pin theo nhịp: 2, 1, (land: tốn 1 rồi sạc) 3, (take_off tốn 1) 2, 1, 0', J(pinNhip(kSac)) === J([2, 1, 3, 2, 1, 0]), J(pinNhip(kSac)));
  kiem('vết nhịp có robot.dau: đậu đúng ở nhịp land()', J(nhip(kSac).map((n) => !!n.robot.dau)) === J([false, false, true, false, false, false]), J(nhip(kSac).map((n) => n.robot.dau)));
} catch (e) { kiem('đáp trên P chạy được', false, e.message); }
try {
  const k = chay(DAP, { san: ['..P.F'], batDau: { x: 0, y: 0 }, pin: 3 }, 'go_right()\ngo_right()\nwait()\ngo_right()\ngo_right()\n');
  kiem('drone nâng cấp chỉ DỪNG trên P (không đáp): KHÔNG sạc, hết pin trước cờ', !k.thang && k.dungSom === 'het-pin' && !coSk(k, 'sac-pin'), J({ thang: k.thang, ds: k.dungSom, pin: pinNhip(k) }));
} catch (e) { kiem('dừng trên P chạy được', false, e.message); }
try {
  const k = chay(DAP, { san: ['.P..F'], batDau: { x: 0, y: 0 }, pin: 9 }, 'go_right()\nland()\ngo_right()\ntake_off()\ngo_right()\ngo_right()\ngo_right()\n');
  const sk = k.suKien.find((e) => e.ma === 'dang-dau');
  kiem('đang đậu mà go_right(): đứng yên, mất nhịp, chẩn đoán dang-dau trỏ đúng dòng 3', !!sk && sk.lenh && sk.lenh.dongPy === 3 && k.thang === true && nhip(k)[2].robot.x === 1,
    J({ sk: sk, thang: k.thang, x: nhip(k).map((n) => n.robot.x) }));
} catch (e) { kiem('go lúc đậu chạy được', false, e.message); }
try {
  const k = chay(DAP, { san: ['.P.F'], batDau: { x: 0, y: 0 }, pin: 9 }, 'go_right()\nland()\nwait()\nwait()\nwait()\ntake_off()\ngo_right()\ngo_right()\n');
  kiem('nhịp đậu trọn (wait lúc đậu) không tốn pin: pin 8, 9 (đáp sạc), 9, 9, 9, 8, 7, 6', J(pinNhip(k)) === J([8, 9, 9, 9, 9, 8, 7, 6]) && k.thang === true, J(pinNhip(k)));
} catch (e) { kiem('đậu nghỉ chạy được', false, e.message); }
try {
  const k = chay(DAP, { san: ['..F'], batDau: { x: 0, y: 0 }, pin: 9 }, 'land()\ntake_off()\ngo_right()\ngo_right()\n');
  kiem('đáp ô thường: chỉ đậu, không sạc (không có sac-pin), vẫn cất cánh tới cờ', k.thang === true && coSk(k, 'dap') && !coSk(k, 'sac-pin'), J({ thang: k.thang, pin: pinNhip(k) }));
} catch (e) { kiem('đáp ô thường chạy được', false, e.message); }
try {
  const k = chay(DAP, { san: ['.=F'], batDau: { x: 0, y: 0 }, pin: 9 }, 'go_right()\nland()\ngo_right()\n');
  const sk = k.suKien.find((e) => e.ma === 'dap-bi-chan');
  kiem('đáp trên hàng rào: dap-bi-chan (vat rao), drone vẫn bay, tới cờ', !!sk && sk.vat === 'rao' && k.thang === true, J({ sk: sk, thang: k.thang }));
  const k2 = chay(DAP, { san: ['.u.F'], batDau: { x: 0, y: 0 }, pin: 9 }, 'go_right()\nland()\n');
  kiem('đáp trên hố: dap-bi-chan (vat ho), không rơi', (k2.suKien.find((e) => e.ma === 'dap-bi-chan') || {}).vat === 'ho' && k2.dungSom !== 'roi-ho', J(k2.suKien.map((e) => e.ma)));
} catch (e) { kiem('đáp ô không đáp được chạy được', false, e.message); }
try {
  const k = chay(DAP, { san: ['.F'], batDau: { x: 0, y: 0 }, pin: 9 }, 'take_off()\nland()\nland()\ntake_off()\ngo_right()\n');
  kiem('take_off() lúc đang bay: dang-bay; land() lúc đang đậu: da-dau; vẫn tới cờ', coSk(k, 'dang-bay') && coSk(k, 'da-dau') && k.thang === true, J({ thang: k.thang }));
} catch (e) { kiem('lệnh thừa chạy được', false, e.message); }
{
  // drone gốc: luật cũ (sạc tự động khi dừng trên P) không đổi
  const k = chay(GOC, { san: ['..P.F'], batDau: { x: 0, y: 0 }, pin: 3 }, 'go_right()\ngo_right()\ngo_right()\ngo_right()\n');
  kiem('drone gốc (không có land): bay qua P là sạc tự động như cũ, tới cờ', k.thang === true && coSk(k, 'sac-pin') && J(pinNhip(k)) === J([2, 3, 2, 1]), J(pinNhip(k)));
  let loiCauHinh = null;
  try { chay(BAY.concat(['land']), { san: ['.F'], batDau: { x: 0, y: 0 } }, 'go_right()\n'); } catch (e) { loiCauHinh = e.message; }
  kiem('khay có land mà phần cứng thiếu take_off: lỗi cấu hình', !!loiCauHinh && /take_off/.test(loiCauHinh), loiCauHinh);
  let loiXe = null;
  try { SanHoc.chay({ loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'land', 'take_off'], mucTieu: 'toi-co', san: ['.F'], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n'); } catch (e) { loiXe = e.message; }
  kiem('xe bánh khai land: lỗi cấu hình (chỉ drone)', !!loiXe, loiXe);
}

console.log('B. Lời cham.js');
{
  const man = { loaiRobot: 'drone', hamGoc: DAP, mucTieu: 'toi-co', san: ['.P..F'], batDau: { x: 0, y: 0 }, pin: 9, sao: { o: 99, nhip: 99 } };
  try {
    const r = ChamHoc.cham(man, { chinh: ['go_right()', 'land()', 'go_right()', 'go_right()', 'go_right()'] }, []);
    const cd = r.chanDoan.find((c) => c.ma === 'dang-dau');
    kiem('chẩn đoán dang-dau: lời nhắc take_off()', !!cd && /take_off\(\)/.test(cd.loi || cd.thongDiep || cd.chu || J(cd)), J(r.chanDoan.map((c) => c.ma)));
  } catch (e) { kiem('cham dang-dau chạy được', false, e.message); }
  try {
    const man2 = Object.assign({}, man, { san: ['.=..F'] });
    const r = ChamHoc.cham(man2, { chinh: ['go_right()', 'land()', 'go_right()', 'go_right()', 'go_right()'] }, []);
    const cd = r.chanDoan.find((c) => c.ma === 'dap-bi-chan');
    kiem('chẩn đoán dap-bi-chan: nói hàng rào', !!cd && /rào/.test(J(cd)), J(r.chanDoan.map((c) => c.ma)));
  } catch (e) { kiem('cham dap-bi-chan chạy được', false, e.message); }
}

console.log('---------------------------------------------');
console.log((LOI_GIA ? 'Lỗi giả: ' + (hong ? 'BẮT ĐƯỢC (ĐẠT)' : 'KHÔNG BẮT ĐƯỢC') : (hong ? 'HỎNG ' : 'ĐẠT ') + dat + ' · HỎNG ' + hong));
process.exit(LOI_GIA ? (hong ? 0 : 1) : (hong ? 1 : 0));
