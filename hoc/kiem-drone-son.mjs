/* ============================================================================
   kiem-drone-son.mjs — máy kiểm DRONE GẮN MÁY SƠN (P1 mùa 4, N3, 30/10; combo gói 9): đầu sơn treo dưới bụng tô ô ngay dưới drone, cùng luật máy sơn
   (dot / pen_down / pen_up làm ở nhịp kế, trước khi bay; bút hạ tô ô cuối nhịp); tô được ô xe không tới (trên rào, hố, băng); nhịp có tô tốn thêm 1 pin;
   không đi chung nam châm; mục tiêu to-hinh thắng / to-thua như xe.
   Chạy: node hoc/kiem-drone-son.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-drone-son.mjs --loi-gia  (cố ý bẻ luật: phải ĐỎ)
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
const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
// --loi-gia: drone không có lệnh sơn trên khay → dot() / pen_down() là hàm chưa có, mọi ca tô phải đỏ
const SON = LOI_GIA ? BAY.slice() : BAY.concat(['ink', 'dot', 'pen_down', 'pen_up']);
const chay = (cfg, ct) => { try { return SanHoc.chay(Object.assign({ loaiRobot: 'drone', hamGoc: SON, mucTieu: 'to-hinh', batDau: { x: 0, y: 0 } }, cfg), ct); } catch (e) { return { loi: { ma: 'nem', thongDiep: e.message }, vet: [], suKien: [], daSon: [] }; } };
const son = (kq) => (kq.daSon || []).map((o) => o.x + ',' + o.y + ':' + o.mau).sort().join(' ');

console.log('A. Lõi');
{
  const k = chay({ san: ['....'], hinh: ['r.r.'] }, 'dot()\ngo_right()\ngo_right()\ndot()\nwait()\n');
  kiem('dot() chấm ô dưới drone ở nhịp kế (trước khi bay): (0,0) và (2,0) đỏ, thắng', k.thang === true && son(k) === '0,0:red 2,0:red', J({ thang: k.thang, son: son(k), loi: k.loi }));
}
{
  const k = chay({ san: ['>.=..'], hinh: ['bb.bb'] }, 'ink("blue")\npen_down()\ngo_right()\npen_up()\ngo_right()\ngo_right()\npen_down()\ngo_right()\n');
  kiem('kẻ vạch trên băng chuyền (xe bị đẩy, drone không), nhấc bút bay qua rào, hạ bút kẻ tiếp: bốn ô xanh dương, thắng', k.thang === true && son(k) === '0,0:blue 1,0:blue 3,0:blue 4,0:blue', J({ thang: k.thang, son: son(k), loi: k.loi }));
  const kr = chay({ san: ['>.=..'], hinh: ['bb.bb'] }, 'ink("blue")\npen_down()\ngo_right()\ngo_right()\n');
  kiem('bút còn hạ khi bay qua rào: tô lên rào là tô ngoài hình, to-thua', kr.dungSom === 'to-thua', J({ ds: kr.dungSom, son: son(kr) }));
}
{
  const k = chay({ san: ['...'], hinh: ['r..'] }, 'pen_down()\ngo_right()\n');
  kiem('bút hạ bay sang ô ngoài hình: to-thua, dừng', k.dungSom === 'to-thua' && !k.thang, J({ ds: k.dungSom, loi: k.loi }));
}
{
  // pin 5: dot (tô) + go_right = nhịp 1 tốn 2 (bay + sơn); nhịp 2 go_right tốn 1; nhịp 3 dot+wait tốn 2 → còn 0 nhưng thắng đúng nhịp đó
  const k = chay({ san: ['...'], hinh: ['r.r'], pin: 5 }, 'dot()\ngo_right()\ngo_right()\ndot()\nwait()\n');
  kiem('nhịp có tô tốn thêm 1 pin: pin 3, 2, 0; thắng ở nhịp pin về 0', J(nhip(k).map((n) => n.robot.pin)) === J([3, 2, 0]) && k.thang === true, J({ pin: nhip(k).map((n) => n.robot.pin), thang: k.thang, loi: k.loi }));
  const k2 = chay({ san: ['...'], hinh: ['r.r'], pin: 3 }, 'dot()\ngo_right()\ngo_right()\ndot()\nwait()\n');
  kiem('pin 3: 1, 0 thì hết pin ở nhịp 2 trước khi tô xong (het-pin), không thắng; pin không xuống dưới 0', k2.dungSom === 'het-pin' && !k2.thang && J(nhip(k2).map((n) => n.robot.pin)) === J([1, 0]), J({ ds: k2.dungSom, pin: nhip(k2).map((n) => n.robot.pin) }));
  const k3 = chay({ san: ['...'], hinh: ['r.r'], pin: 4 }, 'dot()\ngo_right()\ngo_right()\ndot()\nwait()\n');
  kiem('pin 4: nhịp 3 tốn 2 mà chỉ còn 1: pin dừng ở 0 (không âm), tô xong đúng nhịp đó vẫn thắng', k3.thang === true && J(nhip(k3).map((n) => n.robot.pin)) === J([2, 1, 0]), J({ thang: k3.thang, pin: nhip(k3).map((n) => n.robot.pin) }));
}
{
  let loi = null;
  try { SanHoc.chay({ loaiRobot: 'drone', hamGoc: BAY.concat(['ink', 'dot', 'magnet_n', 'magnet_off']), mucTieu: 'toi-co', san: ['.F'], batDau: { x: 0, y: 0 } }, 'wait()\n'); } catch (e) { loi = e.message; }
  kiem('drone gắn máy sơn cùng nam châm: lỗi cấu hình (một bụng một món)', !!loi && /một tay/i.test(loi), loi);
  let loiNhen = null;
  try { SanHoc.chay({ loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'ink', 'dot'], mucTieu: 'toi-co', san: ['.F'], batDau: { x: 0, y: 0 } }, 'wait()\n'); } catch (e) { loiNhen = e.message; }
  kiem('nhện gắn máy sơn vẫn là lỗi cấu hình', !!loiNhen, loiNhen);
}
{
  // drone nâng cấp đáp đất + máy sơn: đậu rồi chấm vẫn tô (và tốn 1 pin), đáp trên P sạc
  const k = chay({ san: ['P..'], hinh: ['y..'], pin: 3, hamGoc: SON.concat(LOI_GIA ? [] : ['land', 'take_off']) }, 'ink("yellow")\nland()\ndot()\nwait()\n');
  kiem('drone nâng cấp: land() ở P rồi dot() lúc đậu: tô vàng, thắng', k.thang === true && son(k) === '0,0:yellow', J({ thang: k.thang, son: son(k), loi: k.loi }));
}

console.log('B. cham.js');
{
  const man = { loaiRobot: 'drone', hamGoc: SON, robot: { than: 'drone', tay: 'son', camBien: [] }, mucTieu: 'to-hinh', san: ['.=.'], hinh: ['g.g'], batDau: { x: 0, y: 0 }, sao: { o: 99, nhip: 99 } };
  try {
    const r = ChamHoc.cham(man, { chinh: ['ink("green")', 'dot()', 'go_right()', 'go_right()', 'dot()', 'wait()'] }, []);
    kiem('chấm: hai chấm xanh lá hai bên hàng rào bằng drone: thắng, không chẩn đoán', r.thang === true && !r.chanDoan.length, J({ thang: r.thang, cd: r.chanDoan.map((c) => c.ma) }));
  } catch (e) { kiem('cham chạy được', false, e.message); }
}

console.log('---------------------------------------------');
console.log((LOI_GIA ? 'Lỗi giả: ' + (hong ? 'BẮT ĐƯỢC (ĐẠT)' : 'KHÔNG BẮT ĐƯỢC') : (hong ? 'HỎNG ' : 'ĐẠT ') + dat + ' · HỎNG ' + hong));
process.exit(LOI_GIA ? (hong ? 0 : 1) : (hong ? 1 : 0));
