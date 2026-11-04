/* ============================================================================
   kiem-ve-mua-9.mjs — máy kiểm GÓI VẼ SÂN mùa 9 (M9H1, 4/11): mọi vật / sự kiện mới của lõi mùa 9 (hoc/san-hoc.js, M9B1 / M9B2 / M9C1 / M9C2) có chỗ vẽ trong hoc/game/san-ve.js.
   Khuôn theo hoc/kiem-ve-mua-song-cang.mjs: chạy SÂN MẪU thật qua SanHoc.chay (sân lấy từ hoc/kiem-lai-mua-9.mjs), gom mọi mã sự kiện, đòi mỗi mã có tên trong san-ve.js;
   rồi kiểm theo mã nguồn: vật mới (người, trạm cứu, thác, cát, container trôi, bè sạc, phao, container lấp hố) được nạp và vẽ, hoạt cảnh có bước riêng (NHIP_9),
   đồng bộ cuối nhịp theo vết, màn cũ không đổi (mọi lớp mới chỉ bật khi cfg có lớp đó).
   Chạy: node hoc/kiem-ve-mua-9.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const doc = (p) => fs.readFileSync(path.join(day, p), 'utf-8');
const sv = doc('game/san-ve.js'), mc = doc('game/man-choi.js'), vs = doc('game/ve-vector-vat-song.js');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const co = (src, re) => (re instanceof RegExp ? re : new RegExp(re.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).test(src);

/** Robot cách lắp `cach` trên màn mở lai `lai` (như kiem-lai-mua-9.mjs). */
function chay(lai, cach, san, batDau, code, them) {
  const m = LapRap.apDung(Object.assign({ ma: 'tam.' + lai, san, batDau, lapRap: { moLai: [lai] } }, them || {}), cach);
  return SanHoc.chay(Object.assign({ san: m.san, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, camBien: m.robot.camBien, pin: m.pin, phanCung: SanHoc.phanCungCua(m) }, them || {}), code);
}
const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const TIEN = 'left_move()\nright_move()\nwait()\n';
const XUONG = BANH.concat(['cast_net', 'drop_net']);
const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
const CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down'];

/* ---------- 1. sự kiện lõi ↔ san-ve.js */
console.log('\n== 1. Sự kiện lõi mùa 9 phát ra đều có chỗ trong san-ve.js ==');
const SAN_MAU = [
  ['R rắc cát (xe + bộ gieo hạt)', () => chay('R', { than: 'hai-banh', tay: 'son' }, ['..I.F', '.....'], { x: 2, y: 0, huong: 1 }, 'ink("yellow")\ndot()\nwait()\n' + TIEN + 'left_back()\nright_back()\nwait()\n')],
  ['R rắc cát (drone)', () => chay('R', { than: 'drone', tay: 'son' }, ['.I.', '..F'], { x: 0, y: 0 }, 'go_right()\nink("yellow")\ndot()\nwait()\n')],
  ['L1 cẩu + nam châm hút / thả', () => chay('L1', { than: 'cau', tay: 'nam-cham' }, ['.....', '.....', '.#o..', '....F'], { x: 0, y: 2, nac: 2, tam: 1 }, 'extend()\nmagnet_n()\nswing_left()\nmagnet_off()\n', { vatChat: ['.....', '.....', '..s..', '.....'] })],
  ['L8 cẩu + gầu ngoạm / thả', () => chay('L8', { than: 'cau', tay: 'kep' }, ['.....', '.....', '.#o..', '....F'], { x: 0, y: 2, nac: 2, tam: 1 }, 'extend()\ngrab()\nswing_left()\nrelease()\n')],
  ['L8 gầu hụt (thùng nặng)', () => chay('L8', { than: 'cau', tay: 'kep' }, ['.....', '.....', '.#H..', '....F'], { x: 0, y: 2, nac: 2, tam: 1 }, 'extend()\ngrab()\n')],
  ['L2 container trôi + lưới', () => chay('L2', { than: 'xuong', tay: 'day-keo', camBien: 'quet-ma' }, ['~~~~~', '~~~B~', '~~~~Q'], { x: 1, y: 1, huong: 1 }, 'a = read_code()\ncast_net()\nwait()\n', { contTroi: [{ x: 3, y: 1, so: 12 }] })],
  ['T2 container lấp hố', () => SanHoc.chay({ san: ['.....', '.#u#.', '.....', '....F'], contLapHo: true, chong: [{ x: 0, y: 2, cont: [{ so: 5 }] }], doi: [
    { batDau: { x: 2, y: 0, nac: 5, tam: 2 }, loaiRobot: 'cau', hamGoc: CAU }, { batDau: { x: 2, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH }] },
    ['pick_up()\nswing_left()\nretract()\nset_down()\n', 'wait()\nwait()\nwait()\nwait()\n' + TIEN + TIEN])],
  ['L3 xe tời bờ kéo bè', () => chay('L3', { than: 'hai-banh', tay: 'day-keo' }, ['.~~B', '...F'], { x: 0, y: 0, huong: 1 }, 'set_length(3)\ncast_net()\nwait()\n')],
  ['L3 xe tời bờ hụt (hết tầm)', () => chay('L3', { than: 'hai-banh', tay: 'day-keo' }, ['.~~B', '...F'], { x: 0, y: 0, huong: 1 }, 'cast_net()\nwait()\n')],
  ['P người tự đi về trạm', () => SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }, 'wait()\n')],
  ['P người chờ robot chắn lối', () => SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 1, y: 0, huong: 2 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }, 'wait()\nwait()\n' + TIEN)],
  ['P người trôi xa (mép sân)', () => SanHoc.chay({ san: ['~~~~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 2 }], dong: [0, 1, 2, 3].map((x) => ({ x, y: 0, huong: 1, suc: 1 })) }, 'wait()\nwait()\nwait()\nwait()\nwait()\n')],
  ['P xuồng kéo người lên bờ', () => SanHoc.chay({ san: ['~~~~~', '~~~~~', '.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: [{ x: 4, y: 3 }] }, 'cast_net()\nwait()\nwait()\n')],
  ['P cấm phun vào người', () => SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH.concat(['spray']), mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: [{ x: 3, y: 0 }] }, 'spray()\nwait()\n')],
  ['P người trôi bị chặn', () => SanHoc.chay({ san: ['~~#~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 0 }], tramCuu: [{ x: 3, y: 2 }], dong: [{ x: 1, y: 0, huong: 1, suc: 1 }] }, 'wait()\nwait()\n')],
  ['T3 vòi phun gạt van', () => SanHoc.chay({ san: ['.V...', '~K~~~', '#####'], doi: [{ batDau: { x: 0, y: 0, huong: 1 }, hamGoc: BANH.concat(['spray']) }, { batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: BANH }] },
    ['spray()\nwait()\n', 'wait()\n' + TIEN + TIEN + TIEN])],
  ['T4 bè sạc trôi, drone đáp', () => SanHoc.chay({ san: ['~B~~', '....', '...F'], batDau: { x: 0, y: 1 }, loaiRobot: 'drone', hamGoc: BAY.concat(['land', 'take_off']), pin: 6, dong: [{ x: 1, y: 0, huong: 1, suc: 1 }, { x: 2, y: 0, huong: 1, suc: 1 }], beSac: [{ x: 1, y: 0 }] }, 'go_right()\ngo_right()\ngo_right()\ngo_up()\nland()\n')],
  ['T4 drone đậu theo bè', () => SanHoc.chay({ san: ['~B~~', '....', '...F'], batDau: { x: 1, y: 0 }, loaiRobot: 'drone', hamGoc: BAY.concat(['land', 'take_off']), pin: 6, dong: [{ x: 1, y: 0, huong: 1, suc: 1 }, { x: 2, y: 0, huong: 1, suc: 1 }], beSac: [{ x: 1, y: 0 }] }, 'land()\nwait()\nwait()\n')],
  ['L10 drone thả phao, người bám, xuồng kéo', () => SanHoc.chay({ san: ['~~~~', '~~~~', '~~~~', '....'], mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 2 }], tramCuu: [{ x: 0, y: 3 }], thac: [{ x: 3, y: 2 }], dong: [{ x: 1, y: 2, huong: 1, suc: 1 }, { x: 2, y: 2, huong: 1, suc: 1 }],
    doi: [{ batDau: { x: 2, y: 2 }, loaiRobot: 'drone', hamGoc: BAY.concat(['cast_net', 'drop_net']) }, { batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG }] }, ['cast_net()\nwait()\n', TIEN + TIEN + 'left_move()\nwait()\ncast_net()\nwait()\n'])],
  ['L10 phao: thu, hụt', () => chay('L10', { than: 'drone', tay: 'day-keo' }, ['~~~~~', '~~~~~', '...F.'], { x: 2, y: 0 }, 'cast_net()\nwait()\ndrop_net()\nwait()\ncast_net()\nwait()\ncast_net()\nwait()\ngo_down()\ngo_down()\ndrop_net()\nwait()\n', { nguoi: [{ x: 1, y: 2 }], tramCuu: [{ x: 0, y: 2 }] })],
  ['L10 thác', () => SanHoc.chay({ san: ['~~~~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 2 }], thac: [{ x: 1, y: 0 }], dong: [{ x: 0, y: 0, huong: 1, suc: 1 }] }, 'wait()\nwait()\n')],
  ['L9 giỏ vớt người, đặt lên bờ', () => chay('L9', { than: 'cau', tay: 'day-keo' }, ['~~~~~', '.....', '.....'], { x: 2, y: 1, nac: 0, tam: 1 }, 'cast_net()\nswing_left()\nswing_left()\ndrop_net()\n', { mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 0, y: 2 }] })],
  ['L9 giỏ hụt (đặt xuống nước)', () => chay('L9', { than: 'cau', tay: 'day-keo' }, ['~~~~~', '.....', '.....'], { x: 2, y: 1, nac: 0, tam: 1 }, 'cast_net()\nswing_right()\ndrop_net()\n', { mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 0, y: 2 }] })]
];
const tenSK = new Set(), thieu = [], nguonSK = {};
function gom(vet, ten) { (vet || []).filter((e) => e.loai === 'nhip').forEach((e) => (e.suKien || []).forEach((s) => { tenSK.add(s.ma); (nguonSK[s.ma] = nguonSK[s.ma] || ten); })); }
for (const [ten, f] of SAN_MAU) {
  let r = null, loi = '';
  try { r = f(); } catch (e) { loi = e.message; }
  kiem('sân mẫu "' + ten + '" chạy được trong lõi', !!r && !loi, loi || '');
  if (!r) continue;
  gom(r.vet, ten); (r.doi || []).forEach((d) => gom(d.vet, ten));
}
const CU = ['tien', 'lui', 'quay-trai', 'quay-phai', 'quay-dau', 'dam-tuong', 'toi-co', 'dung-yen', 'doc-cam-bien', 'xong-dua-vat'];
const MA_9 = ['rac-cat', 'cau-hut', 'cau-tha', 'gau-ngoam', 'gau-tha', 'gau-hut', 'lap-ho', 'nguoi-buoc', 'nguoi-cho', 'nguoi-troi', 'nguoi-troi-chan', 'nguoi-len-bo', 'nguoi-toi-tram', 'nguoi-troi-xa', 'xong-cuu-nguoi', 'cham-nguoi',
  'phun-van', 'be-sac-di', 'theo-be', 'tha-phao', 'bam-phao', 'thu-phao', 'phao-hut', 'gio-vot', 'gio-dat', 'gio-hut'];
const thieuMau = MA_9.filter((k) => !tenSK.has(k));
kiem('sân mẫu phát ra đủ ' + MA_9.length + ' mã sự kiện mới của mùa 9', thieuMau.length === 0, 'sân mẫu chưa phát: ' + thieuMau.join(' '));
for (const ma of tenSK) if (!co(sv, "'" + ma + "'")) thieu.push(ma + ' (' + nguonSK[ma] + ')');
kiem('mọi sự kiện của ' + SAN_MAU.length + ' sân mẫu đều có tên trong san-ve.js (' + tenSK.size + ' mã)', thieu.length === 0, 'thiếu: ' + thieu.join(', '));

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
