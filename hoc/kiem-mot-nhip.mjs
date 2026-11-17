/* ============================================================================
   kiem-mot-nhip.mjs — máy kiểm cờ bản Ôn thi (cfg.banOnThi) của lõi san-hoc.js / cham.js.
   Kế hoạch: hoc/KE-HOACH-GOP-DIEM10CODE-PYTHON.md mục 2.1 và giai đoạn 2. Lõi bản 5 mùa (diem10code-python, ban-5-mua b419083)
   gộp vào lõi game SAU CỜ: bật cờ thì mỗi lệnh tự tốn nhịp (SO_NHIP), hai bánh / xuồng đi bằng forward / backward / turn_*,
   nhện có nam châm có hướng và tay làm ở ô đang đứng, drone tưới đất; tắt cờ thì bản đầy đủ y như trước.
   Phần "tắt cờ không đổi gì" được chứng minh đầy đủ bằng cách chạy lời giải mọi màn của lộ trình trên lõi cũ và lõi mới
   (giai đoạn 2, 17/11: 2229 màn, kết quả trùng từng byte trừ một câu chẩn đoán sửa "drone" thành "nhện"); bộ này giữ các ca nhỏ.
   Chạy: node hoc/kiem-mot-nhip.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const L = (...d) => d.join('\n');
const J = (o) => JSON.stringify(o);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const coSK = (kq, ma) => kq.vet.some((e) => e.loai === 'nhip' && e.suKien.some((s) => s.ma === ma));
const BANH = ['forward', 'backward', 'turn_left', 'turn_right', 'wait'];
const onThi = (cfg, code) => SanHoc.chay(Object.assign({ banOnThi: true }, cfg), code);
const nemLoi = (f) => { try { f(); return null; } catch (e) { return e.message; } };

console.log('Bảng lệnh bản Ôn thi');
kiem('HAM_GOC bản đầy đủ của hai bánh không đổi', J(SanHoc.HAM_GOC.banh) === J(['left_move', 'right_move', 'left_back', 'right_back', 'wait']));
kiem('HAM_GOC bản đầy đủ của xuồng không đổi', J(SanHoc.HAM_GOC.xuong) === J(['left_move', 'right_move', 'left_back', 'right_back', 'wait']));
kiem('HAM_GOC_ON_THI hai bánh = forward / backward / turn_* / wait', J(SanHoc.HAM_GOC_ON_THI.banh) === J(BANH));
kiem('nhện, drone giữ go_*', SanHoc.HAM_GOC_ON_THI.nhen === SanHoc.HAM_GOC.nhen && SanHoc.HAM_GOC_ON_THI.drone === SanHoc.HAM_GOC.drone);
kiem('phần cứng mặc định bản Ôn thi có forward, không có left_move',
  SanHoc.phanCungMacDinh('banh', [], true).includes('forward') && !SanHoc.phanCungMacDinh('banh', [], true).includes('left_move'));
kiem('phần cứng mặc định bản đầy đủ không đổi', J(SanHoc.phanCungMacDinh('banh', [])) === J(SanHoc.HAM_GOC.banh));
kiem('lệnh ngược forward ↔ backward, turn_left ↔ turn_right (bảng riêng, LENH_NGUOC bản đầy đủ không đổi)',
  SanHoc.LENH_NGUOC_ON_THI.forward === 'backward' && SanHoc.LENH_NGUOC_ON_THI.turn_left === 'turn_right' && SanHoc.LENH_NGUOC.forward === undefined);
kiem('bảng nhịp: xe quay 2, xuồng quay 1, nhện bước 2, pick 2',
  SanHoc.soNhipLenh('banh', 'turn_left') === 2 && SanHoc.soNhipLenh('xuong', 'turn_left') === 1 && SanHoc.soNhipLenh('nhen', 'go_up') === 2 && SanHoc.soNhipLenh('banh', 'pick') === 2);

console.log('\nHai bánh: mỗi lệnh tự tốn nhịp, không cần wait()');
const S5 = ['.....', '.....', '.....'];
let k = onThi({ san: S5, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh' }, L('forward()', 'forward()'));
kiem('forward() hai lần: 2 nhịp, tiến 2 ô', !k.loi && k.nhip === 2 && k.robot.x === 2 && k.robot.y === 1, J({ nhip: k.nhip, robot: k.robot, loi: k.loi }));
k = onThi({ san: S5, batDau: { x: 2, y: 1, huong: 1 }, loaiRobot: 'banh' }, L('backward()'));
kiem('backward(): 1 nhịp, lùi 1 ô, giữ hướng', !k.loi && k.nhip === 1 && k.robot.x === 1 && k.robot.huong === 1, J(k.robot));
k = onThi({ san: S5, batDau: { x: 2, y: 1, huong: 1 }, loaiRobot: 'banh' }, L('turn_right()'));
const nv = nhipVet(k);
kiem('turn_right(): 2 nhịp, nhịp đầu xoay nửa đường (quay-nua), nhịp sau đổi hướng',
  !k.loi && k.nhip === 2 && k.robot.huong === 2 && nv[0].robot.huong === 1 && nv[0].suKien.some((s) => s.ma === 'quay-nua'), J(nv.map((e) => e.robot)));
k = onThi({ san: S5, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh' }, L('forward()', 'wait()', 'forward()'));
kiem('wait() là đứng yên đúng 1 nhịp', !k.loi && k.nhip === 3 && k.robot.x === 2, J({ nhip: k.nhip, robot: k.robot }));
k = onThi({ san: S5, batDau: { x: 3, y: 1, huong: 1 }, loaiRobot: 'banh', damLaThua: true, mucTieu: 'toi-co' }, L('forward()', 'forward()', 'forward()'));
kiem('đâm mép sân vẫn là sự kiện dam-tuong', coSK(k, 'dam-tuong'));

console.log('\nTắt cờ: bản đầy đủ y như trước');
k = SanHoc.chay({ san: S5, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh' }, L('forward()'));
kiem('không có cờ: forward() không phải lệnh gốc (lỗi chạy)', !!k.loi && k.nhip === 0, J(k.loi && k.loi.ma));
kiem('không có cờ: khai hamGoc có forward là lỗi cấu hình',
  !!nemLoi(() => SanHoc.chay({ san: S5, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH }, L('forward()'))));
k = SanHoc.chay({ san: S5, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh' }, L('left_move()', 'right_move()', 'wait()'));
kiem('không có cờ: left_move + right_move + wait vẫn là 1 bước 1 nhịp', !k.loi && k.nhip === 1 && k.robot.x === 1);
k = SanHoc.chay({ san: S5, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] }, L('arm_down()'));
kiem('không có cờ: arm_down() một mình chưa tốn nhịp (chờ wait)', k.nhip === 0, k.nhip);
kiem('không có cờ: nhện không gắn cảm biến khoảng cách',
  !!nemLoi(() => SanHoc.chay({ san: S5, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'front_clear'] }, '')));

console.log('\nTay kẹp');
const TAY = BANH.concat(['pick', 'drop']);
k = onThi({ san: ['.o...', '.....'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh', hamGoc: TAY }, L('pick()'));
kiem('pick(): 2 nhịp, gắp vật trước mũi, tay nâng lên', !k.loi && k.nhip === 2 && k.tay && k.tay.cam !== null && k.tay.tuThe === 'tren', J({ nhip: k.nhip, tay: k.tay, loi: k.loi }));
k = onThi({ san: ['.o...', '.....'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh', hamGoc: TAY }, L('pick()', 'turn_right()', 'drop()'));
kiem('pick() → turn_right() → drop(): 6 nhịp, vật nằm ô dưới', !k.loi && k.nhip === 6 && k.vat.some((v) => v.x === 0 && v.y === 1 && v.trangThai === 'dat'), J({ nhip: k.nhip, vat: k.vat }));
k = onThi({ san: S5, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']) }, L('arm_down()'));
kiem('arm_down() tự tốn 1 nhịp (không có wait để chốt)', !k.loi && k.nhip === 1, k.nhip);
const NHEN_KEP = ['go_up', 'go_down', 'go_left', 'go_right', 'pick', 'drop'];
k = onThi({ san: ['.o...'], batDau: { x: 1, y: 0, huong: 1 }, loaiRobot: 'nhen', hamGoc: NHEN_KEP }, L('pick()'));
kiem('nhện: pick() gắp vật ở ô ĐANG ĐỨNG', !k.loi && k.tay && k.tay.cam !== null, J({ tay: k.tay, loi: k.loi }));
k = onThi({ san: ['.....'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'nhen', hamGoc: NHEN_KEP }, L('go_right()', 'go_right()'));
kiem('nhện: go_* 2 nhịp mỗi bước, nhịp đầu ghi nửa ô', !k.loi && k.nhip === 4 && k.robot.x === 2 && nhipVet(k)[0].suKien.some((s) => s.ma === 'chuan-bi' && s.nua), J(nhipVet(k)[0].suKien));
k = onThi({ san: ['.....'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'nhen', hamGoc: NHEN_KEP.concat(['front_clear']) }, L('if front_clear():', '    go_right()'));
kiem('nhện gắn được cảm biến khoảng cách (đo cạnh trước cố định)', !k.loi && k.robot.x === 1, J({ robot: k.robot, loi: k.loi }));

console.log('\nNam châm có hướng của nhện');
const NHEN_NC = ['go_up', 'go_down', 'go_left', 'go_right', 'magnet_n', 'magnet_s', 'magnet_off'];
k = onThi({ san: ['..o..'], vatChat: ['..s..'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'nhen', hamGoc: NHEN_NC }, L('magnet_n("right")'));
kiem('magnet_n("right"): 1 nhịp, hút thùng sắt về ô sát nhện bên phải', !k.loi && k.nhip === 1 && k.namCham.cam !== null && k.namCham.huong === 1, J({ nhip: k.nhip, nc: k.namCham, loi: k.loi }));
k = onThi({ san: ['..o..'], vatChat: ['..s..'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'nhen', hamGoc: NHEN_NC }, L('magnet_n()'));
kiem('magnet_n() thiếu hướng: lỗi huong-nam-cham-sai', !!k.loi && k.loi.ma === 'huong-nam-cham-sai', J(k.loi));
k = SanHoc.chay({ san: ['o....'], vatChat: ['s....'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'nhen', hamGoc: NHEN_NC.concat(['wait']) }, L('magnet_n()', 'wait()'));
kiem('không có cờ: nhện vẫn là nam châm bụng, magnet_n() không đối số, chờ wait()', !k.loi && k.nhip === 1 && k.namCham.cam !== null && k.namCham.huong === undefined, J({ nhip: k.nhip, nc: k.namCham, loi: k.loi }));

console.log('\nXuồng');
const SONG = ['~~~~~', '~~~~~'];
k = onThi({ san: SONG, batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong' }, L('forward()', 'turn_right()', 'forward()'));
kiem('xuồng: đi 1 nhịp, quay 1 nhịp', !k.loi && k.nhip === 3 && k.robot.x === 1 && k.robot.y === 1, J({ nhip: k.nhip, robot: k.robot, loi: k.loi }));
kiem('không có cờ: xuồng không gắn nam châm',
  !!nemLoi(() => SanHoc.chay({ san: SONG, batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'magnet_n', 'magnet_off'] }, '')));
kiem('bản Ôn thi: xuồng gắn được nam châm',
  !nemLoi(() => onThi({ san: SONG, batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', hamGoc: BANH.concat(['magnet_n', 'magnet_off']) }, '')));

console.log('\nDrone nông trại');
const DRONE = ['go_up', 'go_down', 'go_left', 'go_right', 'spray'];
k = onThi({ san: ['...'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'drone', hamGoc: DRONE, mucTieu: 'cham-dat', datKho: ['.1.'] }, L('go_right()', 'spray()'));
kiem('spray() tưới ô đất khô dưới bụng, hết đất khô là thắng', !k.loi && k.thang && coSK(k, 'tuoi-dat'), J({ thang: k.thang, loi: k.loi }));
k = onThi({ san: ['...'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'drone', hamGoc: DRONE, mucTieu: 'cham-dat', datKho: ['.1.'] }, L('spray()'));
kiem('tưới ô không khô là úng (ung-dat)', !k.thang && k.dungSom === 'ung-dat' && !coSK(k, 'xit-hut'), J({ dungSom: k.dungSom }));
k = SanHoc.chay({ san: ['...'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'drone', hamGoc: DRONE.concat(['wait']) }, L('spray()', 'wait()'));
kiem('không có cờ: drone + vòi phun vẫn là bình xịt bụng mùa 9 (xit-hut)', coSK(k, 'xit-hut') && !coSK(k, 'tuoi-dat'), J(nhipVet(k).map((e) => e.suKien.map((s) => s.ma))));

console.log('\nMáy chấm: hai xe');
const doi = [{ batDau: { x: 0, y: 2, huong: 0 } }, { batDau: { x: 2, y: 2, huong: 0 } }];
const nen = { doi, loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep' }, hamGoc: ['forward', 'wait'], mucTieu: 'toi-co', damLaThua: true, thangKhiXong: true,
  khung: { chinh: 10, moiHam: 10 }, san: ['F.F', '...', '...'], co: [[{ x: 0, y: 1 }], [{ x: 2, y: 1 }]], sao: { o: 1, nhip: 1 }, banOnThi: true };
nen.doi = [{ ...doi[0], co: [{ x: 0, y: 1 }] }, { ...doi[1], co: [{ x: 2, y: 1 }] }];
nen.san = ['...', 'F.F', '...'];
const chayDoi = (m, a, b) => ChamHoc.cham(m, { doi: [{ chinh: a }, { chinh: b }], hamCuaMan: [] }, []);
let kd = chayDoi(nen, ['forward()'], ['forward()']);
kiem('hai xe tới đúng cờ: thắng', kd.thang, J(kd.chanDoan && kd.chanDoan.map((c) => c.ma)));
kd = chayDoi(nen, ['forward()', 'forward()'], ['forward()']);
kiem('chạy xong mới chấm: một xe đi quá cờ thì chưa thắng', !kd.thang);
const khoa = { ...nen, doi: [nen.doi[0], { ...nen.doi[1], coDinh: true }] };
kd = chayDoi(khoa, ['forward()'], ['forward()']);
kiem('bản Ôn thi: xe khóa không tính vào mốc Gọn', kd.soO === 1, kd.soO);
kd = chayDoi({ ...khoa, banOnThi: false, hamGoc: undefined, doi: khoa.doi }, ['left_move()', 'right_move()', 'wait()'], ['left_move()', 'right_move()', 'wait()']);
kiem('bản đầy đủ: xe khóa vẫn tính vào mốc Gọn như trước', kd.soO === 6, kd.soO);

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
