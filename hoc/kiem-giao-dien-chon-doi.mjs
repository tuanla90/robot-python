/* ============================================================================
   kiem-giao-dien-chon-doi.mjs — máy kiểm GIAO DIỆN CHỌN ĐỘI / LẮP ROBOT THỨ HAI / BA ROBOT (gói M9D2 4/11) của "Mật Lệnh Robot". Node, không trình duyệt.
   1. chuanHoa: màn chỉ có chonDoi (không lapRap) cũng được điền bản mặc định (LapRap.macDinh) qua ManHoc.chuanHoa — không cần gọi macDinh tay.
   2. Nguồn: choi.html nạp man-chon-doi.js sau co-may.js / lap-rap.js, thu-mua-9.js nạp cuối; ung-dung.js rẽ đúng nhánh (đọc chuỗi nguồn).
   3. Màn giả của hoc/game/thu-mua-9.js chạy thật qua máy chấm (đội ghép theo cách mẫu thắng).
   Tự chứng minh: mỗi phép đọc nguồn chạy lại trên chuỗi đã đổi tạm → phải đỏ.
   Chạy: node hoc/kiem-giao-dien-chon-doi.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LapRap = require(path.join(day, 'lap-rap.js'));
const Cham = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
const ThuMua9 = require(path.join(day, 'game', 'thu-mua-9.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1200) : '')); }
}
const J = (o) => JSON.stringify(o);
const docNguon = (p) => fs.readFileSync(path.join(day, p), 'utf8');

console.log('1. chuanHoa điền bản mặc định cho màn chọn đội');
{
  const m = ThuMua9.manChonDoi();                                                       // thu-mua-9.js chỉ gọi ManHoc.chuanHoa, không gọi macDinh tay
  kiem('màn chỉ có chonDoi: chuanHoa điền man.doi theo cachMau[0] (R1 xe chở hàng, R2 xe cứu hỏa), R3 khoá giữ nguyên',
    m.doi[0].loaiRobot === 'banh' && m.doi[1].loaiRobot === 'xich' && m.doi[2].coDinh === true && m.loaiRobot === 'banh' && m.robot.than === 'hai-banh', J(m.doi.map((r) => r.loaiRobot)));
  kiem('chuanHoa: loiGiai đội có đủ 3 chương trình (R3 lấy maMau.doi[2]) và hamCuaEmMoi', Array.isArray(m.loiGiai.doi) && m.loiGiai.doi.length === 3 && Array.isArray(m.loiGiai.hamCuaEmMoi));
  const src = docNguon('man-chuoi-1.js');
  const re = /if \(m\.lapRap \|\| m\.chonDoi\) \{ var LR = laNode \? require\('\.\/lap-rap\.js'\) : window\.LapRap; if \(LR\) LR\.macDinh\(m\); \}/;
  kiem('man-chuoi-1.js: chuanHoaMan gọi LapRap.macDinh khi m.lapRap || m.chonDoi (cả Node lẫn trình duyệt: window.LapRap)', re.test(src));
  kiem('tự chứng minh: bỏ "|| m.chonDoi" → phép trên đỏ', !re.test(src.replace('m.lapRap || m.chonDoi', 'm.lapRap')));
  const thuong = ManHoc.chuanHoa({ ma: 'x', san: ['###', '#.#', '###'], batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'banh', maMau: { chinh: [] }, loiGiai: { chinh: [] }, loiSai: [], khung: { chinh: 10 } });
  kiem('màn thường (không chonDoi / lapRap) không bị điền gì thêm', thuong.loaiRobot === 'banh' && thuong.doi === undefined && thuong.robot === undefined);
}

console.log('3. Màn giả thu-mua-9.js chạy thật');
{
  for (const [ten, m] of [['manChonDoi', ThuMua9.manChonDoi()], ['manLapRobot2', ThuMua9.manLapRobot2()], ['manBaRobot', ThuMua9.manBaRobot()]]) {
    const lg = LapRap.loiGiaiCua(m.loiGiai, m), r = Cham.cham(m, LapRap.baiCua(lg), []);
    kiem(ten + ': lời giải mặc định thắng (' + m.doi.length + ' robot)', r.thang, J(r.chanDoan && r.chanDoan.slice(0, 2)));
  }
  const b = ThuMua9.manBaRobot();
  kiem('manBaRobot: không còn chonDoi / manGoc (màn đội thường), R3 coDinh, maMau.doi[2] có chương trình', !b.chonDoi && !b.manGoc && b.doi[2].coDinh === true && b.maMau.doi[2].chinh.length > 0);
  const l2 = ThuMua9.manLapRobot2();
  kiem('manLapRobot2: lapRap.robot = 1, R1 xe chở hàng đặt sẵn', LapRap.robotLapCua(l2) === 1 && l2.doi[0].loaiRobot === 'banh');
}

console.log('\n' + dat + ' đạt, ' + hong + ' hỏng');
if (hong) process.exit(1);
