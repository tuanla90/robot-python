/* ============================================================================
   kiem-camera-drone.mjs — máy kiểm CAMERA NHÌN XUỐNG của drone (look(), part 'camera-bay'; 16/10, chuẩn bị chương flycam) của "Robot Chấn Hưng".
   Việc (B) của KE-HOACH-LIST-FLYCAM.md mục 4. Chưa có màn nào dùng camera này: máy kiểm dùng cấu hình GIẢ (SanHoc.chay trực tiếp, màn giả dựng từ drone.7) cho mọi ca.
   Gồm:
   1. Lõi (san-hoc.js): look() trả màu ô NGAY DƯỚI drone — sàn "red" / "green" / "blue" / "yellow" / "none"; vật nằm đất che sàn (màu vật, "none" nếu vật không màu); rào / thùng nặng "none" (nguon 'chan');
      vật đang dính dưới nam châm không tính; KHÔNG tốn nhịp (và không tốn pin); mục lệnh có docCamBien { cam 'camera-bay', ham 'look', tu = o, mau, nguon, idVat, nhip } + sự kiện 'doc-cam-bien';
      chung bộ đếm 1000 lần đọc ('infinite-loop'); trả CHUỖI so sánh được trong if / while; lỗi cấu hình (look không có camera-bay, look / camera-bay cho xe, camera 'camera' vẫn cấm trên drone);
      color() ở bụng drone vẫn đọc sàn khi cùng gắn camera nhìn xuống.
   2. Máy chấm (cham.js): drone chưa gắn camera mà gọi look() → chẩn đoán chua-gan-cam-bien nói rõ camera dưới bụng drone; camera hỏng (phanCung thiếu look) → lenh-goc-hong;
      ten-mau-sai / mau-thieu-nhay áp dụng cho look(); vết cham() có docCamBien; sân thử Xưởng (thuHam) đọc look() theo sanThu.mau / sanThu.vat.
   3. Part (game/part/part-camera-bay.js) và ve-robot.js (cauHinhCua nhận camera-bay, tự thêm khi màn có look()), kho-ham.js (look là tên hàm gốc, bị khóa), so-lenh.js (lệnh gốc look),
      game/choi.html nạp part.
   4. Giao diện (chạy trên DOM giả): đèn bộ phận (den-bo-phan.js: look là cảm biến, đèn camBien sáng), khay thẻ Logic (thanh-phan.js: if look() == "red": / while look() != "none": / c = look()), ô chạm được của dòng
      điều kiện look, hàm của em gọi look() vào thẻ Logic và bị ẩn ở màn không có look().
   Chạy: node hoc/kiem-camera-drone.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
for (const f of ['thu-tu-chuong', 'so-lenh', 'man-chuoi-1']) require(path.join(day, f + '.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort()) require(path.join(day, f));
const ManHoc = require(path.join(day, 'man-drone.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
/* V7c2 (28/10): bộ pixel game/part đã xoá; bộ phận, luật ghép, hàm gốc đọc từ bộ vẽ VECTOR (VeVector; lap-rap.js tự nạp ve-vector*.js ở Node) */
const VV = require(path.join(day, 'lap-rap.js')).veVector();

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const L = (...d) => d.join('\n') + '\n';
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
/** Các lần đọc look() của một kết quả chạy, theo thứ tự (docCamBien của mục lệnh). */
const doc = (kq) => kq.vet.filter((e) => e.loai === 'lenh' && e.docCamBien && e.docCamBien.ham === 'look').map((e) => e.docCamBien);
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);

const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
const NC = ['magnet_n', 'magnet_s', 'magnet_off'];
const CAM = [{ ma: 'camera-bay', o: 'bung' }];
/** Chạy một cấu hình drone có camera nhìn xuống (hamGoc: bay + nam châm + look; thêm battery nếu có pin). */
function chay(rows, bd, code, extra) {
  extra = extra || {};
  const hamGoc = BAY.concat(NC, ['look'], extra.pin !== undefined ? ['battery'] : [], extra.them || []);
  const cfg = Object.assign({ san: rows, batDau: bd, loaiRobot: 'drone', hamGoc, camBien: CAM.slice() }, extra);
  delete cfg.them;
  return SanHoc.chay(cfg, code);
}
const RIGHT = 'go_right()\n', DOWN = 'go_down()\n', UP = 'go_up()\n';
const BD0 = { x: 0, y: 0, huong: 0 };

/* ============================================================================ 1. look() Ở LÕI */
console.log('\n== 1. look(): màu ô ngay dưới drone ==');
{
  // sàn màu: một hàng ".rgby." (r đỏ, g xanh lá, b xanh dương, y vàng) + hàng dưới để rẽ nhánh
  const SAN = ['.rgby.', '......'];
  const k = chay(SAN, BD0, L('a = look()', 'go_right()', 'b = look()', 'go_right()', 'c = look()', 'go_right()', 'd = look()', 'go_right()', 'e = look()', 'go_right()', 'f = look()'));
  const d = doc(k);
  kiem('bay dọc hàng ".rgby.": look() lần lượt "none", "red", "green", "blue", "yellow", "none" (sáu lần đọc)', J(d.map((x) => x.mau)) === J(['none', 'red', 'green', 'blue', 'yellow', 'none']), J(d.map((x) => x.mau)));
  kiem('mỗi lần đọc: cam "camera-bay", ham "look", tu = o = ô của drone lúc đọc, nguon "san", idVat null, nhip = số nhịp đã chạy', d.every((x, i) => x.cam === 'camera-bay' && x.ma === 'doc-cam-bien' && J(x.tu) === J({ x: i, y: 0 }) && J(x.o) === J(x.tu) && x.nguon === 'san' && x.idVat === null && x.nhip === i), J(d));
  kiem('đọc KHÔNG tốn nhịp: sáu lần look() xen năm bước bay = đúng 5 nhịp, không lệnh treo, không lỗi', k.nhip === 5 && k.loi === null && k.lenhTon.length === 0 && k.robot.x === 5, J([k.nhip, k.loi]));
  const bon = chay(SAN, BD0, L('a = look()', 'b = look()', 'c = look()', 'd = look()'));
  kiem('bốn lần look() liền nhau (không bay) = 0 nhịp; soLanDoc đếm 4', bon.nhip === 0 && bon.soLanDoc === 4 && doc(bon).length === 4);
  const sk = ev(k, 'doc-cam-bien');
  kiem('mỗi lần đọc còn có sự kiện doc-cam-bien ở nhịp kế tiếp (giao diện nháy camera); lần đọc cuối (sau nhịp cuối) có thể chưa có nhịp kế', sk.length >= 5 && sk.every((e) => e.cam === 'camera-bay' && e.ham === 'look'), J(sk.length));
  // trả CHUỖI so sánh được
  const r = chay(SAN, { x: 1, y: 0, huong: 0 }, L('if look() == "red":', '    go_down()'));
  kiem('look() trả chuỗi: if look() == "red": đúng ở ô đỏ (bay xuống, 1 nhịp), sai thì không bay', r.robot.y === 1 && r.nhip === 1 && chay(SAN, { x: 2, y: 0, huong: 0 }, L('if look() == "red":', '    go_down()')).nhip === 0);
  const w = chay(['.rrr..', '......'], BD0, L('go_right()', 'while look() == "red":', '    go_right()'));
  kiem('while look() == "red": go_right() bay hết đoạn đỏ rồi dừng ở ô không màu đầu tiên (x = 4), 4 nhịp', w.robot.x === 4 && w.nhip === 4 && w.loi === null, J(w.robot));
  const w2 = chay(['.rgby.', '......'], BD0, L('go_right()', 'while look() != "none":', '    go_right()'));
  kiem('while look() != "none": bay hết dải bốn màu liền nhau, dừng ở ô không màu (x = 5), 5 nhịp', w2.robot.x === 5 && w2.nhip === 5 && w2.loi === null);
  const ss = chay(SAN, { x: 1, y: 0, huong: 0 }, L('c = look()', 'go_right()', 'if look() != c:', '    go_down()'));
  kiem('lưu vào biến rồi so với lần đọc sau: c = look() ở ô đỏ, sang ô xanh lá, look() != c nên bay xuống', ss.robot.y === 1 && ss.robot.x === 2 && ss.nhip === 2);
}

console.log('\n== 1b. look(): vật nằm đất che sàn; rào / thùng nặng; vật đang dính ==');
{
  // hàng: ô 1 sàn đỏ có vật xanh dương; ô 2 sàn xanh lá có vật không màu; ô 3 vật nằm trên sàn không màu
  const SAN = ['.oo..', '.....'];
  const cfg = { mau: ['.r g.', '     '.replace(/ /g, '.')], vatMau: ['.b...', '.....'] };
  const k = chay(SAN, BD0, L('go_right()', 'a = look()', 'go_right()', 'b = look()'), { mau: ['.rg..', '.....'], vatMau: ['.b...', '.....'] });
  const d = doc(k);
  kiem('vật xanh dương nằm trên sàn đỏ: look() = "blue" (vật che sàn), nguon "vat", idVat = vật đó; vật không màu trên sàn xanh lá: look() = "none" (vật che sàn), nguon "vat"',
    d.length === 2 && d[0].mau === 'blue' && d[0].nguon === 'vat' && d[0].idVat === 1 && d[1].mau === 'none' && d[1].nguon === 'vat' && d[1].idVat === 2, J(d));
  kiem('drone bay trên vật nằm đất: không đâm, không chiếm ô (vẫn 2 nhịp, không lỗi)', k.nhip === 2 && k.robot.x === 2 && k.loi === null && !ev(k, 'dam-tuong').length);
  // rào, thùng nặng
  const k2 = chay(['..=H..', '......'], BD0, L('go_right()', 'go_right()', 'a = look()', 'go_right()', 'b = look()'));
  const d2 = doc(k2);
  kiem('hàng rào "=" và thùng nặng "H" dưới drone: look() = "none", nguon "chan" (không thấy sàn, rào và thùng không có màu)', d2.length === 2 && d2.every((x) => x.mau === 'none' && x.nguon === 'chan' && x.idVat === null), J(d2));
  // vật đang dính
  const k3 = chay(['.o...', '.....'], BD0, L('go_right()', 'magnet_n()', 'wait()', 'a = look()', 'go_right()', 'b = look()'), { vatChat: ['.s...', '.....'], vatMau: ['.y...', '.....'], mau: ['..r..', '.....'] });
  const d3 = doc(k3);
  kiem('vật sắt màu vàng đã dính dưới nam châm: look() KHÔNG tính vật đó — ô vừa hút (không còn vật nằm) là "none", sang ô sàn đỏ vẫn "red" (nguon "san")', d3.length === 2 && d3[0].mau === 'none' && d3[0].nguon === 'san' && d3[1].mau === 'red' && d3[1].nguon === 'san', J(d3));
  kiem('…và vật vẫn dính (camera không đổi gì trên sân): vật 1 trangThai "cam"', k3.vat[0].trangThai === 'cam');
  // thả vật xuống ô dưới rồi nhìn: thấy vật vừa thả
  const k4 = chay(['.o...', '.....'], BD0, L('go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()', 'a = look()'), { vatChat: ['.s...', '.....'], vatMau: ['.y...', '.....'] });
  const d4 = doc(k4);
  kiem('thả vật xuống ô dưới rồi look(): thấy chính vật vừa thả ("yellow", nguon "vat")', d4.length === 1 && d4[0].mau === 'yellow' && d4[0].nguon === 'vat', J(d4));
  // sàn màu dưới băng chuyền / bậc thang cũng đọc được (không phải rào / thùng)
  const k5 = chay(['.>S.', '....'], BD0, L('go_right()', 'a = look()', 'go_right()', 'b = look()'), { mau: ['.r..', '....'] });
  const d5 = doc(k5);
  kiem('băng chuyền ">" có màu đỏ dưới drone: look() = "red"; bậc thang "S" không màu: "none" (nguon "san")', d5.length === 2 && d5[0].mau === 'red' && d5[1].mau === 'none' && d5.every((x) => x.nguon === 'san'), J(d5));
}

console.log('\n== 1c. Chống vòng lặp, pin, cấu hình, color() cùng drone ==');
{
  const SAN = ['.rgby.', '......'];
  const lap = chay(SAN, BD0, L('while True:', '    x = look()'));
  kiem('vòng đọc mãi không có nhịp: nhân chặn sau hơn 1000 lần đọc (infinite-loop), không treo', lap.loi && lap.loi.loai === 'infinite-loop' && lap.soLanDoc > 1000);
  const w = chay(SAN, BD0, L('while look() == "none":', '    x = look()'));
  kiem('while look() == "none": chỉ đọc (ô đầu không màu) cũng bị chặn như vòng đọc cảm biến khác', w.loi && w.loi.loai === 'infinite-loop');
  // pin: look() không tốn pin, nhịp thì tốn
  const p = chay(SAN, BD0, L('a = look()', 'go_right()', 'b = look()', 'go_right()', 'c = look()', 'x = battery()'), { pin: 5 });
  kiem('look() không tốn pin: 2 bước bay + 3 lần đọc, pin 5 → còn 3; battery() vẫn đọc được cùng look()', p.pin === 3 && p.nhip === 2 && p.loi === null && doc(p).length === 3 && p.vet.some((e) => e.docCamBien && e.docCamBien.cam === 'pin'));
  // lỗi cấu hình
  kiem('hamGoc có look mà cfg.camBien không có camera-bay → lỗi cấu hình tiếng Việt "cần drone gắn camera nhìn xuống dưới bụng"',
    /look\(\) cần drone gắn camera nhìn xuống dưới bụng/.test(loi(() => SanHoc.chay({ san: SAN, batDau: BD0, loaiRobot: 'drone', hamGoc: BAY.concat(['look']) }, ''))) &&
    /camera nhìn xuống/.test(loi(() => SanHoc.chay({ san: SAN, batDau: BD0, loaiRobot: 'drone', hamGoc: BAY.concat(['look']), camBien: [{ ma: 'mau', o: 'hong' }] }, ''))));
  kiem('look() cho xe bánh / nhện / xích / omni → lỗi "chỉ dành cho drone"; camera-bay gắn lên xe → lỗi',
    [['banh', ['left_move', 'right_move', 'wait']], ['nhen', ['go_up', 'wait']], ['xich', ['left_move', 'right_move', 'wait']], ['omni', ['left_move', 'right_move', 'wait']]].every(([lo, hg]) =>
      /look\(\) chỉ dành cho drone/.test(loi(() => SanHoc.chay({ san: SAN, batDau: BD0, loaiRobot: lo, hamGoc: hg.concat(['look']), camBien: CAM.slice() }, ''))) &&
      /camera-bay\) chỉ gắn lên drone/.test(loi(() => SanHoc.chay({ san: SAN, batDau: BD0, loaiRobot: lo, hamGoc: hg, camBien: CAM.slice() }, '')))));
  kiem('camera "camera" (nhìn phía trước) vẫn cấm trên drone; camera-bay mà hamGoc không có look vẫn chạy được (camera gắn nhưng khay chưa mở lệnh)',
    /Drone không gắn camera/.test(loi(() => SanHoc.chay({ san: SAN, batDau: BD0, loaiRobot: 'drone', hamGoc: BAY.concat(['color']), camBien: [{ ma: 'camera', o: 'tren' }] }, ''))) &&
    SanHoc.chay({ san: SAN, batDau: BD0, loaiRobot: 'drone', hamGoc: BAY, camBien: CAM.slice() }, RIGHT).nhip === 1);
  kiem('hamGoc có look nhưng phanCung thiếu look (camera hỏng) vẫn là cấu hình hợp lệ? Không: khay có lệnh mà phần cứng không có → lỗi cấu hình (như mọi lệnh khác)',
    /phần cứng của robot không có/.test(loi(() => SanHoc.chay({ san: SAN, batDau: BD0, loaiRobot: 'drone', hamGoc: BAY.concat(['look']), camBien: CAM.slice(), phanCung: BAY }, ''))));
  // color() ở bụng cùng camera nhìn xuống: hai hàm khác tên
  const cm = SanHoc.chay({ san: ['.o..', '....'], batDau: BD0, loaiRobot: 'drone', hamGoc: BAY.concat(['color', 'look']), camBien: [{ ma: 'mau', o: 'hong' }].concat(CAM), mau: ['.r..', '....'], vatMau: ['.b..', '....'] }, L('go_right()', 'a = color()', 'b = look()'));
  const dd = cm.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  kiem('drone gắn CẢ cảm biến màu ở bụng lẫn camera nhìn xuống: color() = sàn đỏ (cam "mau"), look() = vật xanh dương che sàn (cam "camera-bay"); không báo mơ hồ',
    cm.loi === null && dd.length === 2 && dd[0].cam === 'mau' && dd[0].mau === 'red' && dd[1].cam === 'camera-bay' && dd[1].mau === 'blue', J(dd));
  // vật xuất hiện trong vết nhịp: lệnh look không đổi vị trí vật
  const nhoc = chay(['.o..', '....'], BD0, L('go_right()', 'a = look()'), { vatMau: ['.g..', '....'] });
  kiem('đọc look() không làm thay đổi sân: vật vẫn nằm đất ở (1, 0), trangThai "dat"', nhoc.vat[0].x === 1 && nhoc.vat[0].trangThai === 'dat');
}

/* ============================================================================ 2. MÁY CHẤM */
console.log('\n== 2. cham.js: chẩn đoán, vết, Xưởng ==');
{
  const goc = ManHoc.timMa('drone.7');
  const cham = (m, chinh, kho) => ChamHoc.cham(m, { chinh, hamCuaMan: [] }, kho || []);
  const NEN = { san: ['.......', '.......', '.......'], batDau: { x: 0, y: 0, huong: 0 }, mucTieu: undefined, vatCan: undefined, vatChat: undefined, vatMau: undefined, nhipTheoLoiGiai: undefined };       // sân trống 7×3 làm nền cho màn giả
  const manCam = (extra) => Object.assign({}, goc, NEN, { hamGoc: BAY.concat(NC, ['look']), robot: { than: 'drone', tay: 'nam-cham', camBien: CAM.slice() }, mau: ['.......', '.rgby..', '.......'] }, extra || {});
  // chưa gắn camera
  const k1 = cham(goc, ['c = look()', 'go_right()']);
  const c1 = k1.chanDoan.filter((c) => c.ma === 'chua-gan-cam-bien');
  kiem('drone chưa gắn camera mà gọi look(): chẩn đoán chua-gan-cam-bien (muc "loi"), tên look, cho trỏ đúng dòng', c1.length === 1 && c1[0].muc === 'loi' && c1[0].ten === 'look' && c1[0].cho && c1[0].cho.dong === 1, J(k1.chanDoan.map((c) => c.ma)));
  kiem('…lời nói rõ "camera nhìn xuống dưới bụng", nêu look(), liệt kê hàm gốc dùng được; KHÔNG nói "cảm biến khoảng cách" hay "màu ở bụng hay camera"',
    /camera nhìn xuống dưới bụng/.test(c1[0].loi) && /look\(\)/.test(c1[0].loi) && /Hàm gốc dùng được ở màn này: go_up/.test(c1[0].loi) && !/khoảng cách|màu ở bụng/.test(c1[0].loi), c1[0].loi);
  const k1b = cham(Object.assign({}, goc, { hamGoc: BAY.concat(NC, ['battery']), pin: 5 }), ['c = look()']);
  kiem('…kể cả khi màn đã có battery() (dsCam không rỗng): vẫn là lời camera dưới bụng, không bị lẫn thành "màn này mới dùng được battery()"', k1b.chanDoan.some((c) => c.ma === 'chua-gan-cam-bien' && /camera nhìn xuống dưới bụng/.test(c.loi) && !/mới dùng được/.test(c.loi)), J(k1b.chanDoan.map((c) => c.loi)));
  const k1c = cham(manCam({ hamGoc: BAY.concat(NC) }), ['c = look()']);
  kiem('camera nhìn xuống ĐÃ gắn nhưng khay màn này chưa mở look(): vẫn chua-gan-cam-bien nhưng nói đúng "chưa mở lệnh look() trên khay" (không nói chưa gắn camera)',
    k1c.chanDoan.some((c) => c.ma === 'chua-gan-cam-bien' && /chưa mở lệnh look\(\) trên khay/.test(c.loi) && !/chưa gắn camera/.test(c.loi)), J(k1c.chanDoan.map((c) => c.loi)));
  kiem('(đối chứng) color() trên drone không cảm biến vẫn giữ lời cũ "màu ở bụng hay camera"; battery() giữ lời đo pin',
    cham(goc, ['c = color()']).chanDoan.some((c) => c.ma === 'chua-gan-cam-bien' && /màu ở bụng hay camera/.test(c.loi)) && cham(goc, ['c = battery()']).chanDoan.some((c) => c.ma === 'chua-gan-cam-bien' && /đo pin/.test(c.loi)));
  // camera có, chạy được
  const m = manCam();
  const k2 = cham(m, ['go_down()', 'go_right()', 'a = look()', 'go_right()', 'b = look()', 'go_right()', 'c = look()']);
  const d2 = k2.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  kiem('cham() với màn có camera: không chẩn đoán chua-gan-cam-bien; vết cham() có docCamBien cam "camera-bay" với màu "red" / "green" / "blue"', !k2.chanDoan.some((c) => c.ma === 'chua-gan-cam-bien') && J(d2.map((x) => x.mau)) === J(['red', 'green', 'blue']) && d2.every((x) => x.cam === 'camera-bay'), J(k2.chanDoan.map((c) => c.ma)));
  kiem('…theoSan[0].vet cũng có docCamBien (giao diện phát lại); kết quả mauO là lớp màu sàn', k2.theoSan[0].vet.filter((e) => e.loai === 'lenh' && e.docCamBien).length === 3 && Array.isArray(k2.mauO));
  // camera hỏng
  const hong1 = cham(Object.assign({}, m, { hamGoc: BAY.concat(NC), phanCung: BAY.concat(NC) }), ['c = look()']);
  kiem('camera nhìn xuống GẮN mà phần cứng thiếu look() (camera hỏng): chẩn đoán lenh-goc-hong "Camera dưới bụng drone hỏng", không phải chua-gan-cam-bien',
    hong1.chanDoan.some((c) => c.ma === 'lenh-goc-hong' && /Camera dưới bụng drone hỏng/.test(c.loi)) && !hong1.chanDoan.some((c) => c.ma === 'chua-gan-cam-bien'), J(hong1.chanDoan.map((c) => c.ma)));
  // tên màu
  const ts = cham(m, ['go_down()', 'go_right()', 'if look() == "Red":', '    go_right()']);
  kiem('so sánh look() với "Red" (chữ hoa): ten-mau-sai, lời nhắc nhắc đúng tên hàm look() (không phải color())', ts.chanDoan.some((c) => c.ma === 'ten-mau-sai' && /look\(\) chỉ trả về các chữ thường/.test(c.loi) && !/color\(\)/.test(c.loi)), J(ts.chanDoan.map((c) => c.loi)));
  const tn = cham(m, ['go_down()', 'go_right()', 'if look() == red:', '    go_right()']);
  kiem('so sánh look() với red không có dấu nháy: mau-thieu-nhay', tn.chanDoan.some((c) => c.ma === 'mau-thieu-nhay' && c.ten === 'red'), J(tn.chanDoan.map((c) => c.ma)));
  // đúng thì không báo
  const dung = cham(m, ['go_down()', 'go_right()', 'if look() == "red":', '    go_right()']);
  kiem('so sánh đúng chữ thường "red": không ten-mau-mau-sai, không mau-thieu-nhay', !dung.chanDoan.some((c) => c.ma === 'ten-mau-sai' || c.ma === 'mau-thieu-nhay'));
  // Xưởng: sân thử
  const hamNhin = H('peek', ['c = look()']);
  const kho = [hamNhin];
  const t = ChamHoc.thuHam(m, { chinh: [] }, 'peek', kho, { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, mau: [{ x: 2, y: 2, mau: 'green' }], vat: [] } });
  const dt = t.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  kiem('sân thử của Xưởng ở màn có camera: peek() = c = look() đọc ô dưới drone ("green"), cam "camera-bay"', dt.length === 1 && dt[0].mau === 'green' && dt[0].cam === 'camera-bay' && t.soNhip === 0, J(dt));
  const t2 = ChamHoc.thuHam(m, { chinh: [] }, 'peek', kho, { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, mau: [{ x: 2, y: 2, mau: 'green' }], vat: [{ x: 2, y: 2, mau: 'red' }] } });
  const dt2 = t2.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  kiem('…vật đặt đúng ô của drone trong sân thử bị bỏ (vật chiếm ô như sân thật, không nằm dưới xe): look() vẫn thấy sàn "green", nguon "san"', dt2.length === 1 && dt2[0].mau === 'green' && dt2[0].nguon === 'san' && t2.sanThu.vat.length === 0, J([dt2, t2.sanThu.vat]));
  const bay2 = H('peek2', ['go_right()', 'c = look()']);
  const t3 = ChamHoc.thuHam(m, { chinh: [] }, 'peek2', [bay2], { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, mau: [{ x: 3, y: 2, mau: 'green' }], vat: [{ x: 3, y: 2, mau: 'red' }] } });
  const dt3 = t3.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  kiem('…bay sang ô có vật đỏ nằm trên sàn xanh lá: look() = "red" (vật che sàn), nguon "vat", 1 nhịp', dt3.length === 1 && dt3[0].mau === 'red' && dt3[0].nguon === 'vat' && t3.soNhip === 1, J(dt3));
  kiem('soO của chương trình có look(): mỗi dòng một ô như lệnh khác (7 dòng → 7 ô)', k2.soO === 7, k2.soO);
}

/* ============================================================================ 3. PART, VE-ROBOT, KHO HÀM, SỔ LỆNH */
console.log('\n== 3. part camera-bay, ve-robot.cauHinhCua, kho hàm, sổ lệnh, choi.html ==');
{
  const bay = VV.lay('cam-bien', 'camera-bay');
  kiem('bộ phận camera-bay đăng ký ở bộ vẽ vector: loại cam-bien, gắn ổ "bung" của drone, mở đúng hàm look', bay && bay.gan === 'bung' && J(bay.hamGoc) === '["look"]' && VV.lay('than', 'drone').oGan.bung && Number.isInteger(VV.lay('than', 'drone').oGan.bung.x));
  kiem('VeVector.hamGoc(drone + nam châm + camera-bay) có look, không có color; VeVector.robot vẽ được cả ba trạng thái; xe không ghép được (kiemGhep ném)', VV.hamGoc({ than: 'drone', tay: 'nam-cham', camBien: CAM }).includes('look') && !VV.hamGoc({ than: 'drone', tay: 'nam-cham', camBien: CAM }).includes('color') &&
    [{}, { camBien: { bat: true } }, { camBien: { mat: true } }].every((st) => !loi(() => VV.robot({ than: 'drone', tay: 'nam-cham', camBien: CAM }, st, 0, 100))) && !!loi(() => VV.kiemGhep({ than: 'hai-banh', tay: null, camBien: CAM })));
  // ve-robot.cauHinhCua (tải trong ngữ cảnh giả)
  const ctxV = vm.createContext({ console, Ve: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, VeVector: VV });
  ctxV.window = ctxV;
  vm.runInContext(fs.readFileSync(path.join(day, 'game', 've-robot.js'), 'utf8'), ctxV, { filename: 've-robot.js' });
  const VeRobot = ctxV.VeRobot;
  const mc = { loaiRobot: 'drone', hamGoc: BAY.concat(NC, ['look']), robot: { than: 'drone', tay: 'nam-cham', camBien: [{ ma: 'camera-bay', o: 'bung' }, { ma: 'pin', o: 'than' }] } };
  const ch = VeRobot.cauHinhCua(mc);
  kiem('cauHinhCua(màn drone có camera-bay + pin): camBien chỉ còn camera-bay (pin không là bộ phận), cờ pin true, ghép được (VeVector.kiemGhep)', J(ch.camBien) === J([{ ma: 'camera-bay', o: 'bung' }]) && ch.pin === true && ch.than === 'drone' && ch.tay === 'nam-cham' && !loi(() => VV.kiemGhep(ch)));
  const ch2 = VeRobot.cauHinhCua({ loaiRobot: 'drone', hamGoc: BAY.concat(NC, ['look']), robot: { than: 'drone', tay: 'nam-cham', camBien: [] } });
  kiem('cauHinhCua tự thêm camera-bay (ổ bung) khi hamGoc có look() mà màn chưa khai camera; không có look thì không thêm', J(ch2.camBien) === J([{ ma: 'camera-bay', o: 'bung' }]) && VeRobot.cauHinhCua({ loaiRobot: 'drone', hamGoc: BAY.concat(NC), robot: { than: 'drone', tay: 'nam-cham', camBien: [] } }).camBien.length === 0 &&
    VeRobot.cauHinhCua({ loaiRobot: 'drone', hamGoc: BAY.concat(NC, ['look']), robot: { than: 'drone', tay: 'nam-cham', camBien: CAM.slice() } }).camBien.length === 1);
  const kho = KhoHam.moi({});
  kiem('kho hàm: "look" là tên hàm gốc (hàm của em không đặt trùng được, ten-trung-ham-goc); HAM_GOC_MAC_DINH có look', KhoHam.HAM_GOC_MAC_DINH.includes('look') && kho.kiemTen('look').ma === 'ten-trung-ham-goc');
  const sl = SoLenh.lenhGoc.find((x) => x.ten === 'look');
  kiem('sổ lệnh gốc có look (không có lệnh ngược, như battery / color); SanHoc.laHamCamBien("look"), CAM_NHIN_HAM, MA_CAM_BAY', sl && sl.nguoc === null && /camera/i.test(sl.moTa) && SanHoc.laHamCamBien('look') && J(SanHoc.CAM_NHIN_HAM) === '["look"]' && SanHoc.MA_CAM_BAY === 'camera-bay' && SanHoc.LENH_NGUOC.look === undefined);
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const vt = (f) => html.indexOf(f + '.js');
  kiem('game/choi.html nạp ve-vector-cam.js (có camera-bay), sau ve-vector.js / ve-vector-than-drone.js và trước ve-robot.js (V7c2: bộ pixel part/ đã xoá)', vt('ve-vector-cam') > vt('ve-vector') && vt('ve-vector-cam') > vt('ve-vector-than-drone') && vt('ve-vector-cam') < html.indexOf('ve-robot.js') && fs.readFileSync(path.join(day, 'game', 've-vector-cam.js'), 'utf8').includes("'camera-bay'"));
  const xem = fs.readFileSync(path.join(day, 'hinh-mau', 'xem-vector.html'), 'utf8');
  kiem('trang xem bộ vector (hinh-mau/xem-vector.html) nạp ve-vector-cam.js', xem.includes('ve-vector-cam.js'));
  // dữ liệu chụp (chuẩn của kiem-lap-rap / kiem-ve-vector 12) có bộ phận này (không bị bỏ sót khi sửa)
  kiem('du-lieu-chup-pixel.json (chuẩn ghép) có camera-bay', fs.readFileSync(path.join(day, 'du-lieu-chup-pixel.json'), 'utf8').includes('"camera-bay"'));
}

/* ============================================================================ 4. GIAO DIỆN (DOM giả) */
console.log('\n== 4. đèn bộ phận, khay thẻ Logic, ô chạm được ==');
class El {
  constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.handlers = {}; this._cls = new Set(); this.style = {}; this.parentNode = null; this._text = ''; this.disabled = false; this.scrollTop = 0; this.clientHeight = 400; this.scrollHeight = 400; }
  get className() { return [...this._cls].join(' '); }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() {
    const s = this._cls;
    return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), contains: (c) => s.has(c), toggle: (c, f) => { const on = f === undefined ? !s.has(c) : !!f; if (on) s.add(c); else s.delete(c); return on; } };
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; }
  get firstChild() { return this.children[0] || null; }
  set innerHTML(v) { this.children = []; }
  get innerHTML() { return ''; }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
  click() { (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {} })); }
  querySelector(sel) { const c = sel.replace(/^\./, ''); const walk = (n) => { for (const k of n.children) { if (k._cls.has(c)) return k; const r = walk(k); if (r) return r; } return null; }; return walk(this); }
  getBoundingClientRect() { return { top: 0, bottom: 0, height: 0 }; }
}
const docGia = { addEventListener() {}, createElement: (tag) => new El(tag), createTextNode: (s) => { const e = new El('#text'); e._text = String(s); return e; }, getElementById: () => null, body: new El('body') };
const luuGia = { co: {}, daXem(k) { return !!this.co[k]; }, datDaXem(k) { this.co[k] = true; return true; } };
const ctx = vm.createContext({ console, document: docGia, getComputedStyle: () => ({ fontSize: '11px' }), Ve: { ico: () => new El('i'), khoa: () => new El('i') }, SanHoc, KhungCode, ManHoc, Luu: luuGia, setTimeout, clearTimeout });
ctx.window = ctx;
for (const f of ['chu.js', 'huong-dan.js', 'thanh-phan.js', 'den-bo-phan.js']) vm.runInContext(fs.readFileSync(path.join(day, 'game', f), 'utf8'), ctx, { filename: f });
const TP = ctx.TP, DenBoPhan = ctx.DenBoPhan;

function khayMoi() {
  const bang = new El('div'), bh = new El('div'); bh.className = 'bh';
  const tt = new El('span'); tt.className = 'tt'; bh.appendChild(tt);
  const host = new El('div'); host.className = 'pal';
  bang.appendChild(bh); bang.appendChild(host);
  const pal = new TP.Palette(host, { khiChen() {}, khiSua() {}, khiBien() {}, khiMoi() {} });
  return { pal, host, bh };
}
/** Mọi khối đang hiện trong khay: data-goi của từng khối (đi vào cả khối con). */
function khoi(host) {
  const kq = [];
  (function di(n) { for (const c of n.children) { if (c._cls.has('brick')) kq.push(c.getAttribute('data-goi') || c.getAttribute('data-ten')); else di(c); } })(host);
  return kq;
}
function specMan(m, them) {
  return Object.assign({
    goc: m.hamGoc, loai: m.loaiRobot, vong: TP.coCauTruc(m, 'for'), vongWhile: TP.coCauTruc(m, 'while') && TP.coDieuKienCua(m), cam: TP.camBienCua(m), mau: TP.coMauCua(m), pin: TP.coPinCua(m),
    chuoi: TP.coCauTruc(m, 'for') && (m.hamGoc || []).some((n) => /^go_/.test(n)), dieuKien: TP.coCauTruc(m, 'if') && TP.coDieuKienCua(m),
    em: [], man: [], coNutMoi: true, the: 'cam', lamMoi: true
  }, them || {});
}
const goc7 = ManHoc.timMa('drone.7');
const manCamUI = Object.assign({}, goc7, { hamGoc: BAY.concat(NC, ['look']), robot: { than: 'drone', tay: 'nam-cham', camBien: CAM.slice() } });
const manPinCam = Object.assign({}, goc7, { hamGoc: BAY.concat(NC, ['look', 'battery']), robot: { than: 'drone', tay: 'nam-cham', camBien: CAM.concat([{ ma: 'pin', o: 'than' }]) }, pin: 5 });
{
  // đèn bộ phận
  kiem('DenBoPhan.boPhanCuaMan(drone có look): cánh quạt + nam châm + camBien (đèn cảm biến) theo thứ tự hiển thị', J(DenBoPhan.boPhanCuaMan(manCamUI)) === '["namCham","camBien","canh"]' && !DenBoPhan.boPhanCuaMan(Object.assign({}, goc7, { hamGoc: BAY.concat(NC) })).includes('camBien'), J(DenBoPhan.boPhanCuaMan(manCamUI)));
  const docLook = { ten: 'look', docCamBien: { cam: 'camera-bay', ham: 'look', mau: 'red' } };
  kiem('DenBoPhan.phan: mục lệnh look (có docCamBien, hay chỉ tên look) hoặc sự kiện doc-cam-bien → camBien sáng; nhịp không đọc thì tắt', DenBoPhan.phan({ robot: {}, suKien: [] }, [docLook]).camBien === true && DenBoPhan.phan({ robot: {}, suKien: [] }, [{ ten: 'look' }]).camBien === true &&
    DenBoPhan.phan({ robot: {}, suKien: [{ ma: 'doc-cam-bien' }] }, []).camBien === true && DenBoPhan.phan({ robot: {}, suKien: [{ ma: 'di' }] }, [{ ten: 'go_right' }]).camBien === false);
  // đèn theo vết thật của chương trình có look()
  const kq = ChamHoc.cham(Object.assign({}, manCamUI, { san: ['.......', '.......', '.......'], batDau: { x: 0, y: 0, huong: 0 }, mucTieu: undefined, vatCan: undefined, vatChat: undefined, nhipTheoLoiGiai: undefined, mau: ['.......', '.rgby..', '.......'] }), { chinh: ['go_down()', 'go_right()', 'a = look()', 'go_right()', 'wait()'], hamCuaMan: [] }, []);
  let lenh = [], sang = [];
  for (const e of kq.theoSan[0].vet) { if (e.loai === 'lenh') lenh.push(e); else { sang.push(DenBoPhan.phan(e, lenh).camBien); lenh = []; } }
  kiem('đèn camBien theo vết thật: chương trình go_down, go_right, look(), go_right, wait → bốn nhịp, đèn chỉ sáng ở nhịp 3 (lệnh look nằm ngay trước nhịp đó)', J(sang) === J([false, false, true, false]), J(sang));
}
{
  // khay thẻ Logic
  kiem('TP.coMauCua: màn có look → "look"; có color → "color"; không có gì → false; màn có cả hai → "look"', TP.coMauCua(manCamUI) === 'look' && TP.coMauCua({ hamGoc: ['color'] }) === 'color' && TP.coMauCua({ hamGoc: ['battery'] }) === false && TP.coMauCua({ hamGoc: ['color', 'look'] }) === 'look');
  TP.datCheMau(TP.coMauCua(manCamUI), TP.coPinCua(manCamUI));
  const k = khayMoi(); k.pal.dung(specMan(manCamUI));
  const kh = khoi(k.host);
  kiem('khay thẻ Logic của màn drone có look: if look() == "red": / elif look() == "blue": / else: / c = look() / for / while look() != "none":; KHÔNG có color() và battery()',
    ['if look() == "red":', 'elif look() == "blue":', 'else:', 'c = look()', 'while look() != "none":'].every((s) => kh.includes(s)) && kh.every((s) => !/color\(|battery\(/.test(s)) && kh.some((s) => /^for /.test(s)), J(kh));
  TP.datCheMau(TP.coMauCua(manPinCam), TP.coPinCua(manPinCam));
  const k2 = khayMoi(); k2.pal.dung(specMan(manPinCam));
  const kh2 = khoi(k2.host);
  kiem('drone có cả pin lẫn camera: khối if battery() < 3: đứng cùng các khối look(); while theo look() (không mất khối look vì có pin)', ['if battery() < 3:', 'if look() == "red":', 'elif look() == "blue":', 'c = look()', 'while look() != "none":'].every((s) => kh2.includes(s)), J(kh2));
  TP.datCheMau(TP.coMauCua({ hamGoc: ['color'] }), false);
  const k3 = khayMoi(); k3.pal.dung(specMan(ManHoc.timMa('mau.1')));
  const kh3 = khoi(k3.host);
  kiem('(đối chứng) màn color() cũ không đổi: if color() == "red": / c = color() / while color() != "red": (không look)', ['if color() == "red":', 'elif color() == "blue":', 'c = color()'].every((s) => kh3.includes(s)) && kh3.every((s) => !/look\(/.test(s)), J(kh3));
  // dòng điều kiện look: tách thành ô chạm được
  TP.datCheMau('look', false);
  const t1 = TP.tachDoiSo('    if look() == "red":');
  kiem('dòng "if look() == \\"red\\":" tách thành ô chạm được: lhs look(), toán tử ==, vế phải "red"', t1 && t1.loai === 'dkm' && J(t1.tok.map((x) => x.vt + ':' + x.t)) === J(['lhs:look()', 'op:==', 'rhs:"red"']), J(t1 && t1.tok));
  const t2 = TP.tachDoiSo('while look() != "none" and c != "red":');
  kiem('điều kiện hai vế "look() != \\"none\\" and c != \\"red\\"" tách đủ ô; thayDoiSo đổi vế phải được', t2 && t2.loai === 'dkm' && t2.cl.length === 2 && TP.thayDoiSo('if look() == "red":', 2, '"blue"') === 'if look() == "blue":', J(t2 && t2.cl));
  const html = TP.mauDong('c = look()');
  kiem('dòng "c = look()" vẽ có tên hàm look (không phải color), tên biến c; dòng "c = color()" vẫn vẽ color', /class="vr">c</.test(html) && />look</.test(html) && !/>color</.test(html) && />color</.test(TP.mauDong('c = color()')), html);
  // hàm của em gọi look()
  const he = H('peek', ['c = look()', 'go_right()']);
  kiem('hàm của em gọi look() vào thẻ Logic ("cam"), kể cả gián tiếp', TP.theCuaHam(he, () => null) === 'cam' && TP.theCuaHam(H('x', ['peek()']), (t) => (t === 'peek' ? he : null)) === 'cam');
  const loc = TP.locHamTheoRobot(manCamUI, [he]), loc2 = TP.locHamTheoRobot(Object.assign({}, goc7, { hamGoc: BAY.concat(NC) }), [he]);
  kiem('hàm của em gọi look() hiện ở màn có camera, bị ẩn ở màn drone không có look()', loc.length === 1 && loc2.length === 0, J([loc.length, loc2.length]));
  kiem('màn có look() cũng có điều kiện để viết while / if (coDieuKienCua), kể cả drone không pin', TP.coDieuKienCua(manCamUI) === true && TP.coDieuKienCua(Object.assign({}, goc7, { hamGoc: BAY.concat(NC) })) === false);
}

console.log('\n  --------------------------------------------- ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
