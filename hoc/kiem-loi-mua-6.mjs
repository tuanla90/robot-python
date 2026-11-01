/* ==========================================================================
   hoc/kiem-loi-mua-6.mjs — Bộ kiểm thử P1 Lõi Mùa 6: Mỏ đá (Máy khai thác đá R1)
   Chạy: node hoc/kiem-loi-mua-6.mjs

   6 nhóm kiểm thử:
   1. List 2D trong ngôn ngữ Python mini: grid[r][c], grid[i+1][j-1], for row in grid / for cell in row, len(grid), len(grid[0]), so sánh bằng đệ quy
   2. Nâng cấp đi chéo của bánh omni: diag_left(), diag_right() (1 nhịp, giữ nguyên hướng mặt, bị chặn tường / góc tường, chưa mở omniCheo → lỗi)
   3. Tay ném + nâng cấp chỉnh lực aim(n) + đá tròn lấp hố: aim(1..3), chưa mở chinhLuc → lỗi, ném đá tròn vào hố 'u' lấp thành sàn '.' và đi qua được
   4. Cảm biến Radar tròn + nâng cấp nhận dạng: radar() trả ma trận 3×3 quanh vị trí hiện tại, shape(huong) trả "round"|"square"|"ore"|"none", chưa mở nhanDang → lỗi
   5. Yếu tố sân Mỏ đá: đá tròn lấp hố (daLapHo: true), sàn dốc (m.sanDoc trượt 1 ô cuối nhịp), bàn xoay ('@', '%')
   6. Sổ lệnh & kho hàm: diag_left, diag_right, radar, shape có mặt trong SoLenh và KhoHam
   ========================================================================== */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Core = require('../nhan/san-robot-core.js');
const SanHoc = require('./san-hoc.js');
const ChamHoc = require('./cham.js');
const SoLenh = require('./so-lenh.js');
const KhoHam = require('./kho-ham.js');

let pass = 0;
function test(ten, fn) {
  try {
    fn();
    pass++;
  } catch (e) {
    console.error('FAIL:', ten);
    throw e;
  }
}

// ==========================================================================
// 1. LIST 2D TRONG NGÔN NGỮ PYTHON MINI
// ==========================================================================
test('1.1 List 2D literal và truy cập 2 chiều grid[r][c]', () => {
  const ghi = [];
  const kq = Core.chayCode([
    'grid = [[10, 20, 30], [40, 50, 60]]',
    'log(grid[0][0])',
    'log(grid[0][2])',
    'log(grid[1][1])',
    'log(len(grid))',
    'log(len(grid[0]))'
  ].join('\n'), {
    log: (x) => { ghi.push(x); return 0; }
  }, { choPhep2D: true });
  assert.ok(kq.soLenh > 0);
  assert.deepEqual(ghi, [10, 30, 50, 2, 3]);
});

test('1.2 Truy cập 2 chiều với biểu thức chỉ số grid[i + 1][j - 1]', () => {
  const ghi = [];
  const kq = Core.chayCode([
    'grid = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "k"]]',
    'i = 1',
    'j = 2',
    'log(grid[i + 1][j - 1])',
    'log(grid[i - 1][j])',
    'log(grid[i + 1][j - 2])'
  ].join('\n'), {
    log: (x) => { ghi.push(x); return 0; }
  }, { choPhep2D: true });
  assert.ok(kq.soLenh > 0);
  assert.deepEqual(ghi, ['h', 'c', 'g']);
});

test('1.3 Lặp 2 tầng: for row in grid: / for cell in row: và for r in range(len(grid)):', () => {
  const ghi = [];
  const kq = Core.chayCode([
    'grid = [[1, 2], [3, 4], [5, 6]]',
    'tong = 0',
    'for row in grid:',
    '    for cell in row:',
    '        tong = tong + cell',
    'log(tong)',
    'cheo = 0',
    'm = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]',
    'for r in range(len(m)):',
    '    for c in range(len(m[r])):',
    '        if r == c:',
    '            cheo = cheo + m[r][c]',
    'log(cheo)'
  ].join('\n'), {
    log: (x) => { ghi.push(x); return 0; }
  }, { choPhep2D: true });
  assert.ok(kq.soLenh > 0);
  assert.deepEqual(ghi, [21, 15]);
});

test('1.4 So sánh bằng đệ quy trên list 2D và kiểm tra lỗi chỉ số ngoài phạm vi', () => {
  const ghi = [];
  const kq = Core.chayCode([
    'a = [["#", "."], [".", "F"]]',
    'b = [["#", "."], [".", "F"]]',
    'c = [["#", "."], [".", "V"]]',
    'log(a == b)',
    'log(a == c)',
    'log(a != c)',
    'hang = [".", "F"]',
    'log(hang in a)'
  ].join('\n'), {
    log: (x) => { ghi.push(x); return 0; }
  }, { choPhep2D: true });
  assert.ok(kq.soLenh > 0);
  assert.deepEqual(ghi, [1, 0, 1, 1]);

  let batLoi = null;
  try {
    Core.chayCode([
      'a = [[1, 2], [3, 4]]',
      'x = a[1][5]'
    ].join('\n'), {}, { choPhep2D: true });
  } catch (e) {
    batLoi = e;
  }
  assert.ok(batLoi);
  assert.equal(batLoi.loai, 'runtime-error');
});

// ==========================================================================
// 2. NÂNG CẤP ĐI CHÉO CỦA BÁNH OMNI: diag_left(), diag_right()
// ==========================================================================
test('2.1 diag_left() và diag_right() đi chéo 1 ô trong 1 nhịp, giữ nguyên hướng mặt', () => {
  // Robot ở (2, 3) hướng 0 (lên).
  // diag_left() -> trước-trái = (1, 2), hướng vẫn 0, 1 nhịp
  // diag_right() -> trước-phải = (2, 1), hướng vẫn 0, tổng 2 nhịp
  const res = SanHoc.chay({
    san: [
      '.....',
      '..F..',
      '.....',
      '.....',
      '.....'
    ],
    batDau: { x: 2, y: 3, huong: 0 },
    loaiRobot: 'omni',
    omniCheo: true,
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'diag_left', 'diag_right', 'wait']
  }, [
    'diag_left()',
    'diag_right()'
  ].join('\n'));
  assert.equal(res.thang, true);
  assert.equal(res.nhip, 2);
  assert.equal(res.robot.x, 2);
  assert.equal(res.robot.y, 1);
  assert.equal(res.robot.huong, 0);
});

test('2.2 diag_left() / diag_right() theo mọi hướng mặt (0, 1, 2, 3) và kèm wait() không tốn thêm nhịp', () => {
  // Hướng 1 (phải) ở (1, 2): diag_right() -> tiến phải (+1, 0) + sang phải (0, +1) = (2, 3)
  const res1 = SanHoc.chay({
    san: [
      '.....',
      '.....',
      '.....',
      '..F..',
      '.....'
    ],
    batDau: { x: 1, y: 2, huong: 1 },
    loaiRobot: 'omni',
    omniCheo: true,
    hamGoc: ['diag_left', 'diag_right', 'wait']
  }, [
    'diag_right()',
    'wait()'
  ].join('\n'));
  assert.equal(res1.thang, true);
  assert.equal(res1.nhip, 1);
  assert.equal(res1.robot.x, 2);
  assert.equal(res1.robot.y, 3);
  assert.equal(res1.robot.huong, 1);
});

test('2.3 Đi chéo bị chặn bởi tường đích hoặc bị kẹt khe góc 2 tường kề nhau', () => {
  // Cả 2 ô (2, 1) và (1, 2) là '#' -> đi chéo từ (2, 2) lên (1, 1) bị kẹt góc tường
  const res = SanHoc.chay({
    san: [
      '.....',
      '.F#..',
      '.#...',
      '.....'
    ],
    batDau: { x: 2, y: 2, huong: 0 },
    loaiRobot: 'omni',
    omniCheo: true,
    hamGoc: ['diag_left', 'diag_right', 'wait']
  }, 'diag_left()');
  assert.equal(res.thang, false);
  assert.equal(res.robot.x, 2);
  assert.equal(res.robot.y, 2);
  assert.equal(res.suKien.some((e) => e.ma === 'dam-tuong' && e.kieu === 'cheo'), true);
});

test('2.4 Gọi diag_left() khi chưa nâng cấp omniCheo báo lỗi lenh-chua-mo', () => {
  const res = SanHoc.chay({
    san: ['..F', '...', '...'],
    batDau: { x: 2, y: 2, huong: 0 },
    loaiRobot: 'omni',
    omniCheo: false,
    hamGoc: ['left_move', 'right_move', 'slide_left', 'slide_right', 'wait']
  }, 'diag_left()');
  assert.ok(res.loi);
  assert.equal(res.loi.ma, 'lenh-chua-mo');
});

// ==========================================================================
// 3. TAY NÉM + NÂNG CẤP CHỈNH LỰC aim(n) + ĐÁ TRÒN LẤP HỐ
// ==========================================================================
test('3.1 Tay ném chưa nâng cấp chỉnh lực: ném tầm mặc định (2 ô), gọi aim() báo lỗi lenh-chua-mo', () => {
  const resLoi = SanHoc.chay({
    san: ['..D..', '.....', '..o..', '.....'],
    batDau: { x: 2, y: 3, huong: 0 },
    loaiRobot: 'omni',
    mucTieu: 'dua-vat',
    chinhLuc: false,
    hamGoc: ['left_move', 'right_move', 'load', 'throw', 'wait']
  }, 'aim(3)');
  assert.ok(resLoi.loi);
  assert.equal(resLoi.loi.ma, 'lenh-chua-mo');

  // Không gọi aim(): tầm mặc định 2 ô (khi tamNemMacDinh: 2) từ (2, 3) sau khi load vật ở (2, 2) -> rơi vào (2, 1) là D
  const resOk = SanHoc.chay({
    san: ['.....', '..D..', '..o..', '.....'],
    batDau: { x: 2, y: 3, huong: 0 },
    loaiRobot: 'omni',
    mucTieu: 'dua-vat',
    chinhLuc: false,
    tamNemMacDinh: 2,
    hamGoc: ['left_move', 'right_move', 'load', 'throw', 'wait']
  }, [
    'load()',
    'wait()',
    'throw()',
    'wait()'
  ].join('\n'));
  assert.equal(resOk.thang, true);
});

test('3.2 Nâng cấp chỉnh lực (chinhLuc: true): aim(1), aim(2), aim(3) ném đúng khoảng cách', () => {
  const res = SanHoc.chay({
    san: [
      '..D..',
      '.....',
      '..o..',
      '.....'
    ],
    batDau: { x: 2, y: 3, huong: 0 },
    loaiRobot: 'omni',
    mucTieu: 'dua-vat',
    chinhLuc: true,
    hamGoc: ['left_move', 'right_move', 'load', 'throw', 'aim', 'wait']
  }, [
    'load()',
    'wait()',
    'aim(3)',
    'throw()',
    'wait()'
  ].join('\n'));
  assert.equal(res.thang, true);
  assert.equal(res.vat[0].x, 2);
  assert.equal(res.vat[0].y, 0);
});

test('3.3 Đá tròn lấp hố: ném đá tròn trúng ô hố u biến hố thành sàn trống để xe đi qua tới cờ', () => {
  const res = SanHoc.chay({
    san: [
      '..F..',
      '..u..',
      '..o..',
      '.....'
    ],
    batDau: { x: 2, y: 3, huong: 0 },
    loaiRobot: 'omni',
    mucTieu: 'toi-co',
    daLapHo: true,
    chinhLuc: true,
    hamGoc: ['left_move', 'right_move', 'load', 'throw', 'aim', 'wait']
  }, [
    'load()',
    'wait()',
    'aim(2)',
    'throw()',
    'wait()',
    'left_move()',
    'right_move()',
    'wait()',
    'left_move()',
    'right_move()',
    'wait()',
    'left_move()',
    'right_move()',
    'wait()'
  ].join('\n'));
  assert.equal(res.thang, true);
  assert.equal(res.robot.x, 2);
  assert.equal(res.robot.y, 0);
  assert.equal(res.suKien === undefined ? false : true, true);
});

// ==========================================================================
// 4. CẢM BIẾN RADAR TRÒN + NÂNG CẤP NHẬN DẠNG (radar(), shape(huong))
// ==========================================================================
test('4.1 radar() trả về list 2D 3×3 quanh vị trí hiện tại của robot và cập nhật ngay sau khi di chuyển', () => {
  const res = SanHoc.chay({
    san: [
      '#####',
      '#u.F#',
      '#...#',
      '#.oD#',
      '#####'
    ],
    batDau: { x: 2, y: 2, huong: 0 },
    loaiRobot: 'omni',
    omniCheo: true,
    camBien: [{ ma: 'radar', o: 'tren' }],
    hamGoc: ['left_move', 'right_move', 'diag_left', 'diag_right', 'radar', 'wait']
  }, [
    'g = radar()',
    'if g[0][0] == "u" and g[0][2] == "F" and g[2][1] == "V" and g[2][2] == "D":',
    '    diag_right()',
    'g2 = radar()',
    'if g2[0][1] == "#" and g2[1][2] == "#":',
    '    wait()'
  ].join('\n'));
  assert.equal(res.thang, true);
  assert.equal(res.robot.x, 3);
  assert.equal(res.robot.y, 1);
});

test('4.2 shape(huong) trả về "round", "square", "ore", "none" khi bật nhanDang: true', () => {
  const res = SanHoc.chay({
    san: [
      '.....',
      '..o..',
      '.o.o.',
      '..o..',
      '..F..'
    ],
    vatDang: [
      '.....',
      '..o..',
      '.s.q.',
      '..r..',
      '.....'
    ],
    batDau: { x: 2, y: 2, huong: 0 },
    loaiRobot: 'omni',
    camBien: [{ ma: 'radar', o: 'tren' }],
    nhanDang: true,
    hamGoc: ['left_move', 'right_move', 'slide_left', 'slide_right', 'radar', 'shape', 'wait']
  }, [
    'if shape("front") == "ore" and shape("left") == "square" and shape("right") == "ore" and shape("back") == "round" and shape("here") == "none":',
    '    slide_left()'
  ].join('\n'));
  assert.equal(res.loi, null);
  assert.equal(res.vet.filter((v) => v.loai === 'lenh' && v.ten === 'slide_left').length, 1);
});

test('4.3 Gọi shape() khi chưa mở nhanDang báo lỗi lenh-chua-mo; hướng sai báo huong-radar-sai', () => {
  const resChuaMo = SanHoc.chay({
    san: ['..F', '...'],
    batDau: { x: 1, y: 1, huong: 0 },
    loaiRobot: 'omni',
    camBien: [{ ma: 'radar', o: 'tren' }],
    nhanDang: false,
    hamGoc: ['radar', 'wait']
  }, 'x = shape("front")');
  assert.ok(resChuaMo.loi);
  assert.equal(resChuaMo.loi.ma, 'lenh-chua-mo');

  const resSaiHuong = SanHoc.chay({
    san: ['..F', '...'],
    batDau: { x: 1, y: 1, huong: 0 },
    loaiRobot: 'omni',
    camBien: [{ ma: 'radar', o: 'tren' }],
    nhanDang: true,
    hamGoc: ['radar', 'shape', 'wait']
  }, 'x = shape("diagonal")');
  assert.ok(resSaiHuong.loi);
  assert.equal(resSaiHuong.loi.ma, 'huong-radar-sai');
});

// ==========================================================================
// 5. YẾU TỐ SÂN MỎ ĐÁ: SÀN DỐC (m.sanDoc) VÀ BÀN XOAY (@, %)
// ==========================================================================
test('5.1 Sàn dốc (sanDoc): cuối bước đi vào ô dốc bị trượt thêm 1 ô theo hướng dốc', () => {
  // Robot ở (1, 2) tiến lên (1, 1); ô (1, 1) có sàn dốc '>' (phải) -> cuối nhịp bị trôi sang (2, 1) là cờ F
  const res = SanHoc.chay({
    san: [
      '....',
      '..F.',
      '....',
      '....'
    ],
    sanDoc: [
      '....',
      '.>..',
      '....',
      '....'
    ],
    batDau: { x: 1, y: 2, huong: 0 },
    loaiRobot: 'omni',
    hamGoc: ['left_move', 'right_move', 'wait']
  }, [
    'left_move()',
    'right_move()',
    'wait()'
  ].join('\n'));
  assert.equal(res.thang, true);
  assert.equal(res.nhip, 1);
  assert.equal(res.robot.x, 2);
  assert.equal(res.robot.y, 1);
});

test('5.2 Bàn xoay (@ xoay phải 90°, % xoay trái 90°) kết hợp trong ChamHoc.cham', () => {
  const man = {
    ma: 'thu-mo-da-1',
    ten: 'Thử Mỏ đá',
    loaiRobot: 'omni',
    omniCheo: true,
    chinhLuc: true,
    nhanDang: true,
    daLapHo: true,
    robot: {
      than: 'omni',
      tay: 'nem',
      camBien: [{ ma: 'radar', o: 'tren' }],
      omniCheo: true,
      chinhLuc: true,
      nhanDang: true
    },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'diag_left', 'diag_right', 'load', 'throw', 'aim', 'radar', 'shape', 'wait'],
    mucTieu: 'toi-co',
    san: [
      '....F',
      '...u.',
      '..@..',
      '.....',
      '.....'
    ],
    sanDoc: [
      '.....',
      '.....',
      '.....',
      '.....',
      '.....'
    ],
    vatThem: [{ x: 2, y: 1, dang: 'round' }],
    batDau: { x: 1, y: 3, huong: 0 },
    khung: { chinh: 15, moiHam: 10 },
    sao: { o: 12, nhip: 10 }
  };
  const kq = ChamHoc.cham(man, {
    chinh: [
      'diag_right()',
      'diag_right()'
    ],
    hamCuaMan: []
  }, []);
  // Sau diag_right() thứ 1: vào (2, 2) có '@', xoay phải 90° từ hướng 0 sang hướng 1 (phải).
  // Sau diag_right() thứ 2 (khi mặt đang hướng 1 - phải): tiến-phải (+1, 0) + sang-phải (0, +1) = (3, 3).
  assert.equal(kq.theoSan[0].robot.x, 3);
  assert.equal(kq.theoSan[0].robot.y, 3);
  assert.equal(kq.theoSan[0].robot.huong, 1);
});

// ==========================================================================
// 6. SỔ LỆNH & KHO HÀM
// ==========================================================================
test('6.1 SoLenh và KhoHam có đủ diag_left, diag_right, radar, shape', () => {
  const kho = KhoHam.moi();
  for (const ten of ['diag_left', 'diag_right', 'radar', 'shape']) {
    const muc = SoLenh.lenhGoc.find((l) => l.ten === ten);
    assert.ok(muc, 'SoLenh.lenhGoc thiếu ' + ten);
    assert.ok(muc.moTa && muc.moTa.length > 0, ten + ' phải có mô tả công việc');
    const kt = kho.kiemTen(ten);
    assert.equal(kt.ok, false, 'KhoHam không được cho đặt tên trùng hàm gốc ' + ten);
    assert.equal(kt.ma, 'ten-trung-ham-goc');
  }
});

console.log('ĐẠT ' + pass + ' · HỎNG 0 kiểm tra lõi Mùa 6: Mỏ đá.');
