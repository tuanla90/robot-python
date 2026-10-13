/* ============================================================================
   man-tay-gap.js — "Đường học": CHƯƠNG `tay-gap` · TAY GẮP (10 màn).
   Xe hai bánh có thêm tay gắp, Xưởng hàm mở (moXuong true), được dùng hàm của em.
   Chương trình 10 ô; mỗi hàm một khung riêng 10 ô (dòng def không tốn ô). Chưa có `for` (cauTruc []).
   Mục tiêu mới `dua-vat` (man.mucTieu): thắng khi MỌI vật trên sân nằm trên ô đích.
   Ký hiệu sân: o = vật nằm trên đất, D = ô đích, X = ô đích đã có vật sẵn (xem san-hoc.js).

   Hàm gốc: left_move, right_move, wait + 4 lệnh tay arm_down, arm_up, grab, release.
   Luật tay (san-hoc.js): trong MỘT nhịp tay đổi tư thế → kẹp / thả (ở tư thế mới) → bánh chạy.
   Tay hạ thì xe không đi được; thả vật từ tay nâng thì vật vỡ.

   Hàm của em các màn giả định (kho sau chương xuong-ham): move, turn_right, turn_left.
   Màn dạy tạo hàm: tay-gap.5 tạo pick(); tay-gap.6 tạo drop(); tay-gap.10 tạo carry().
     pick() = arm_down(), grab(), wait(), arm_up(), wait()      (nhặt xong, tay về tư thế nâng)
     drop() = arm_down(), release(), wait(), arm_up(), wait()   (thả xong, tay về tư thế nâng)

   CÁCH CHUẨN, tự nhiên: pick() / drop() làm trọn việc rồi trả tay về nâng, nên xe đi tiếp ngay.
   Mọi màn (trừ 3.9) chấm sao theo lời giải viết cách chuẩn: viết đúng tự nhiên là 3 sao. Số nhịp
   của lời giải chuẩn có thể dài hơn đường ngắn nhất (BFS) vì mỗi lần nâng tay mất một nhịp riêng;
   những màn đó đánh dấu `nhipTheoLoiGiai: true` (máy kiểm chỉ đòi BFS <= sao.nhip, lời giải chuẩn
   chạy đúng sao.nhip). Nhập chung lệnh nâng tay với lệnh đi kế tiếp (arm_up() ngay trước move())
   tiết kiệm nhịp mà vẫn là 3 sao.

   Riêng 3.9 "Tiết kiệm nhịp" (`tietKiemNhip: true`): sao.nhip = đường ngắn nhất (BFS). Cách chuẩn chỉ
   được 2 sao; muốn 3 sao phải sửa thân pick() / drop() (bỏ wait() cuối) để nâng tay chung nhịp với
   lệnh đi kế tiếp. sao.o của màn này tính theo lời giải chuẩn (lời giải 3 sao dùng ít ô hơn).

   Màn 3.1 / 3.2 / 3.4 chưa dạy tạo hàm nhưng học sinh ĐÃ CÓ move() (turn_left...) từ chương 2: viết cách chuẩn
   (nhặt 5 dòng + move()) vừa khít 9-10 ô, nên ba màn này cũng chấm theo cách chuẩn (nhipTheoLoiGiai).
   Lời giải của mọi màn vừa khít 10 ô hoặc ít hơn; không gói hàm thì tràn khung (màn 5, 6, 10).

   Sân dựng thành HÀNH LANG (mọi ô ngoài đường đi là tường), trừ màn 1–4 (sân trống nhỏ);
   máy kiểm dò đường tắt bằng BFS riêng cho dua-vat (do-duong-tay.mjs).
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];

  var T_PICK = ['arm_down()', 'grab()', 'wait()'];               // nhặt, tay còn hạ
  var T_THA = ['arm_down()', 'release()', 'wait()'];             // thả, tay còn hạ
  var T_PICK_DAY = T_PICK.concat(['arm_up()', 'wait()']);        // CHUẨN: nhặt xong nâng tay (nhịp riêng) = thân pick()
  var T_THA_DAY = T_THA.concat(['arm_up()', 'wait()']);          // CHUẨN: thả xong nâng tay = thân drop()
  var T_PICK_NHANH = T_PICK.concat(['arm_up()']);                // bản gộp: bỏ wait() cuối, nâng tay chạy chung nhịp với lệnh kế
  var T_THA_NHANH = T_THA.concat(['arm_up()']);
  var NHAT_1 = T_PICK.concat(['arm_up()']);                      // nhặt rồi nâng tay (nâng chung nhịp với lệnh kế)
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function hPick() { return H('pick', T_PICK_DAY); }
  function hDrop() { return H('drop', T_THA_DAY); }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  function man(m) {
    m.chuong = 'tay-gap';
    m.cauTruc = [];
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC; m.mucTieu = 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  var TIEN = ['left_move()', 'right_move()', 'wait()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Nhặt và đặt', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Xe có thêm tay gắp. Một vật nằm ngay dưới xe, ô đích (khung vàng) ở ngay phía trước. Đưa vật tới ô đích.',
      veMaMau: 'Chương trình có sẵn hạ tay, kẹp vật rồi nâng tay lên. Trong mỗi nhịp, tay đổi tư thế trước, sau đó mới tới bánh. Em còn thiếu việc đi tới ô đích và đặt vật xuống.',
      san: ['.....', '.....', '..D..', '..o..', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: T_PICK_DAY.slice() },
      sao: { o: 12, nhip: 4 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: nhieu(T_PICK_DAY, ['move()'], T_THA) },
      loiGiaiKhac: {
        moTa: 'Gói việc thả vào hàm put(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(T_PICK_DAY, ['move()', 'put()']) },
        hamCuaEmMoi: [H('put', T_THA)]
      },
      loiSai: [
        { moTa: 'Không sửa gì: nhặt xong xe đứng yên', baiLam: { chinh: T_PICK_DAY.slice() }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nâng tay trước khi đi: tay vướng sàn', baiLam: { chinh: nhieu(T_PICK, ['move()'], T_THA) },
          phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Thả mà không hạ tay: vật rơi vỡ', baiLam: { chinh: nhieu(T_PICK_DAY, ['move()', 'release()', 'wait()']) },
          phaiCoMa: ['vat-vo'] },
        { moTa: 'Nâng tay và hạ tay chung một nhịp: lệnh hạ tay bị bỏ',
          baiLam: { chinh: nhieu(NHAT_1, ['left_move()', 'right_move()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['tay-goi-lai', 'vat-vo'] },
        { moTa: 'Nhịp cuối thiếu wait()', baiLam: { chinh: nhieu(T_PICK_DAY, ['move()', 'arm_down()', 'release()']) },
          phaiCoMa: ['quen-wait', 'chua-dua-vat'] }
      ],
      goiY: ['Tay hạ sát đất thì xe không đi được; tay còn nâng cao mà thả thì vật vỡ.',
        'Hàm move() em đã có trong kho: gọi một lần là xe tiến một ô.']
    }),

    man({
      so: 2, ten: 'Tự nhặt, tự đặt', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Vật nằm cách xe một ô, ô đích cách vật một ô, cùng một hàng thẳng. Đưa xe tới vật, nhặt rồi đặt vật lên ô đích.',
      san: ['.....', '.....', '..D..', '..o..', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 13, nhip: 5 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: nhieu(['move()'], T_PICK_DAY, ['move()'], T_THA) },
      loiGiaiKhac: {
        moTa: 'Gói việc nhặt vào hàm take(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(['move()', 'take()', 'move()'], T_THA) },
        hamCuaEmMoi: [H('take', T_PICK_DAY)]
      },
      loiSai: [
        { moTa: 'Nhặt xong không nâng tay: xe không đi được', baiLam: { chinh: nhieu(['move()'], T_PICK, ['move()'], T_THA) },
          phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Kẹp mà chưa hạ tay: kẹp hụt', baiLam: { chinh: nhieu(['move()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'move()'], T_THA) },
          phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Đi lố một ô trước khi nhặt: ô đó không có vật', baiLam: { chinh: nhieu(['move()', 'move()'], T_PICK, ['arm_up()', 'move()'], T_THA) },
          phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Nâng tay và hạ tay chung một nhịp', baiLam: { chinh: nhieu(['move()'], T_PICK, ['arm_up()', 'arm_down()', 'move()', 'release()', 'wait()']) },
          phaiCoMa: ['tay-goi-lai', 'vat-vo'] }
      ],
      goiY: ['Trong một nhịp: tay đổi tư thế, rồi kẹp hoặc thả, rồi mới tới bánh.',
        'Nhặt xong phải nâng tay thì xe mới đi được.']
    }),

    man({
      so: 3, ten: 'Đố: kẹp hụt', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Vật nằm dưới xe, ô đích nằm ngay bên phải xe. Đưa vật tới ô đích.',
      veMaMau: 'Chương trình có sẵn đã đủ các bước nhưng vật không đi theo xe. Chạy thử, xem từng nhịp rồi tìm lệnh sai.',
      san: ['....', '....', '....', '.oD.'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: nhieu(['arm_up()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'turn_right()', 'move()'], T_THA) },
      sao: { o: 15, nhip: 5 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: nhieu(T_PICK_DAY, ['turn_right()', 'move()'], T_THA) },
      loiGiaiKhac: {
        moTa: 'Gói việc thả vào hàm put(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(T_PICK_DAY, ['turn_right()', 'move()', 'put()']) },
        hamCuaEmMoi: [H('put', T_THA)]
      },
      loiSai: [
        { moTa: 'Không sửa gì: tay kẹp vào không khí', baiLam: { chinh: nhieu(['arm_up()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'turn_right()', 'move()'], T_THA) },
          phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Hạ tay nhưng quên kẹp', baiLam: { chinh: nhieu(['arm_down()', 'wait()', 'arm_up()', 'wait()', 'turn_right()', 'move()'], T_THA) },
          phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả khi tay còn nâng cao: vật rơi vỡ', baiLam: { chinh: nhieu(T_PICK_DAY, ['turn_right()', 'move()', 'release()', 'wait()']) },
          phaiCoMa: ['vat-vo'] }
      ],
      goiY: ['Chạy thử và để ý tay ở nhịp đầu tiên: nó có chạm tới vật không?',
        'Muốn gắp vật nằm dưới đất thì tay phải ở tư thế nào?']
    }),

    /* ------------------------------------------------------------- hàng 2 */
    man({
      so: 4, ten: 'Đố: xe kẹt', hang: 'luyen', hamCuaEmCan: ['move'],
      deBai: 'Vật nằm dưới xe. Đi lên hai ô tới ô đích rồi đặt vật xuống.',
      veMaMau: 'Chương trình có sẵn nhặt được vật, nhưng xe đứng yên không đi nổi. Chạy thử và xem tay cùng xe ở từng nhịp.',
      san: ['....', '..D.', '....', '..o.'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: nhieu(T_PICK, ['move()', 'move()'], T_THA) },
      sao: { o: 13, nhip: 5 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: nhieu(T_PICK_DAY, ['move()', 'move()'], T_THA) },
      loiGiaiKhac: {
        moTa: 'Gói hai bước đi vào hàm go2(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(T_PICK_DAY, ['go2()'], T_THA) },
        hamCuaEmMoi: [H('go2', ['move()', 'move()'])]
      },
      loiSai: [
        { moTa: 'Không sửa gì: tay còn hạ nên xe không nhúc nhích', baiLam: { chinh: nhieu(T_PICK, ['move()', 'move()'], T_THA) },
          phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Nâng tay chậm một bước: lệnh đi đầu tiên vẫn bị chặn', baiLam: { chinh: nhieu(T_PICK, ['move()', 'arm_up()', 'move()'], T_THA) },
          phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Thả mà không hạ tay: vật rơi vỡ', baiLam: { chinh: nhieu(T_PICK_DAY, ['move()', 'move()', 'release()', 'wait()']) },
          phaiCoMa: ['vat-vo'] }
      ],
      goiY: ['Xe không nhúc nhích: đọc chẩn đoán xem tay đang ở tư thế nào.',
        'Nhặt xong, tay phải ở đâu thì xe mới đi được?']
    }),

    man({
      so: 5, ten: 'Hàm nhặt pick', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right'], taoHam: ['pick'],
      deBai: 'Xe đi lên hai ô tới chỗ vật, nhặt vật, rẽ phải đi tiếp hai ô tới ô đích rồi thả. Tạo hàm pick() để gói việc nhặt vật rồi dùng nó. Nhặt xong, pick() phải trả tay về tư thế nâng để xe đi tiếp được.',
      san: ['#o.D#', '#.###', '#.###'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 19, nhip: 8 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: nhieu(['move()', 'move()', 'pick()', 'turn_right()', 'move()', 'move()'], T_THA), hamCuaEmMoi: [hPick()] },
      loiGiaiKhac: {
        moTa: 'Gói thêm việc thả vào hàm put(), chỉ gọi một lần',
        baiLam: { chinh: ['move()', 'move()', 'pick()', 'turn_right()', 'move()', 'move()', 'put()'] },
        hamCuaEmMoi: [hPick(), H('put', T_THA)]
      },
      loiSai: [
        { moTa: 'Không gói hàm: viết thẳng việc nhặt, quá 10 ô', baiLam: { chinh: nhieu(['move()', 'move()'], T_PICK_DAY, ['turn_right()', 'move()', 'move()'], T_THA) },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'pick() quên hạ tay: kẹp hụt', baiLam: { chinh: nhieu(['move()', 'move()', 'pick()', 'turn_right()', 'move()', 'move()'], T_THA) },
          hamCuaEmMoi: [H('pick', ['grab()', 'wait()', 'arm_up()', 'wait()'])], phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'pick() quên wait() giữa kẹp và nâng tay: lệnh nâng tay bị bỏ vì tay đã nhận lệnh hạ',
          baiLam: { chinh: nhieu(['move()', 'move()', 'pick()', 'turn_right()', 'move()', 'move()'], T_THA) },
          hamCuaEmMoi: [H('pick', ['arm_down()', 'grab()', 'arm_up()', 'wait()'])], phaiCoMa: ['tay-goi-lai', 'chua-dua-vat'] },
        { moTa: 'pick() quên nâng tay: xe không đi được', baiLam: { chinh: nhieu(['move()', 'move()', 'pick()', 'turn_right()', 'move()', 'move()'], T_THA) },
          hamCuaEmMoi: [H('pick', T_PICK)], phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Thêm một wait() thừa sau pick(): vẫn thắng nhưng chậm một nhịp', baiLam: { chinh: nhieu(['move()', 'move()', 'pick()', 'wait()', 'turn_right()', 'move()', 'move()'], T_THA) },
          hamCuaEmMoi: [hPick()], phaiCoMa: [] },
        { moTa: 'Gọi pick() mà chưa tạo hàm', baiLam: { chinh: nhieu(['move()', 'move()', 'pick()', 'turn_right()', 'move()', 'move()'], T_THA) },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Việc nhặt vật là một nhóm lệnh cố định: gói chúng thành hàm pick() rồi gọi.',
        'pick() nên làm trọn việc: hạ tay, kẹp vật, rồi nâng tay lại để lệnh đi sau nó chạy được.']
    }),

    man({
      so: 6, ten: 'Hàm đặt drop', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'pick'], taoHam: ['drop'],
      deBai: 'Xe đứng trên vật. Mang vật đi lên bốn ô, rẽ phải, đi tiếp hai ô tới ô đích rồi thả. Tạo hàm drop() để gói việc đặt vật xuống và trả tay về tư thế nâng, giống pick().',
      san: ['###', '..D', '.##', '.##', '.##', 'o##'],
      batDau: { x: 0, y: 5, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 24, nhip: 10 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: nhieu(['pick()'], lap('move()', 4), ['turn_right()', 'move()', 'move()', 'drop()']), hamCuaEmMoi: [hDrop()] },
      loiGiaiKhac: {
        moTa: 'Gói đoạn đi lên bốn ô vào hàm up4(), chỉ gọi một lần',
        baiLam: { chinh: ['pick()', 'up4()', 'turn_right()', 'move()', 'move()', 'drop()'] },
        hamCuaEmMoi: [hDrop(), H('up4', lap('move()', 4))]
      },
      loiSai: [
        { moTa: 'Không gói hàm drop: viết thẳng việc thả, quá 10 ô', baiLam: { chinh: nhieu(['pick()'], lap('move()', 4), ['turn_right()', 'move()', 'move()'], T_THA) },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'drop() quên hạ tay: vật rơi vỡ', baiLam: { chinh: nhieu(['pick()'], lap('move()', 4), ['turn_right()', 'move()', 'move()', 'drop()']) },
          hamCuaEmMoi: [H('drop', ['release()', 'wait()', 'arm_up()', 'wait()'])], phaiCoMa: ['vat-vo'] },
        { moTa: 'Quên pick() ở đầu: xe đi tay không rồi thả, chẳng có vật nào', baiLam: { chinh: nhieu(lap('move()', 4), ['turn_right()', 'move()', 'move()', 'drop()']) },
          hamCuaEmMoi: [hDrop()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đếm thiếu một ô khi đi lên: rẽ sớm, đâm tường', baiLam: { chinh: nhieu(['pick()'], lap('move()', 3), ['turn_right()', 'move()', 'move()', 'drop()']) },
          hamCuaEmMoi: [hDrop()], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Gọi drop() mà chưa tạo hàm', baiLam: { chinh: nhieu(['pick()'], lap('move()', 4), ['turn_right()', 'move()', 'move()', 'drop()']) },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Việc đặt vật cũng là một nhóm lệnh cố định, giống pick(): gói thành hàm drop().',
        'Chương trình chỉ vừa 10 ô khi đặt vật bằng drop().']
    }),

    /* ------------------------------------------------------------- hàng 3 */
    man({
      so: 7, ten: 'Đường gấp khúc', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'pick', 'drop'],
      deBai: 'Vật nằm cách xe một ô. Mang vật qua đường gấp khúc: rẽ phải, đi hai ô, rẽ trái, đi tiếp hai ô tới ô đích.',
      san: ['###', '##D', '##.', 'o..', '.##'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 26, nhip: 10 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: ['move()', 'pick()', 'turn_right()', 'move()', 'move()', 'turn_left()', 'move()', 'move()', 'drop()'] },
      loiGiaiKhac: {
        moTa: 'Gói đoạn rẽ phải rồi đi hai ô vào hàm right2(), chỉ gọi một lần',
        baiLam: { chinh: ['move()', 'pick()', 'right2()', 'turn_left()', 'move()', 'move()', 'drop()'] },
        hamCuaEmMoi: [H('right2', ['turn_right()', 'move()', 'move()'])]
      },
      loiSai: [
        { moTa: 'Nhặt ở sai chỗ: chưa đi tới vật', baiLam: { chinh: ['pick()', 'turn_right()', 'move()', 'move()', 'turn_left()', 'move()', 'move()', 'drop()'] },
          phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Rẽ nhầm hướng ở khúc thứ hai: xe đâm tường', baiLam: { chinh: ['move()', 'pick()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'drop()'] },
          phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên rẽ trái ở khúc thứ hai: xe đi thẳng đâm tường', baiLam: { chinh: ['move()', 'pick()', 'turn_right()', 'move()', 'move()', 'move()', 'move()', 'drop()'] },
          phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Đoạn cuối đi thiếu một ô: vật bị thả giữa đường', baiLam: { chinh: ['move()', 'pick()', 'turn_right()', 'move()', 'move()', 'turn_left()', 'move()', 'drop()'] },
          phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mỗi khúc cua là một lệnh rẽ; đếm kỹ số ô của từng đoạn thẳng.',
        'Đi tới vật và nhặt bằng pick() trước, rồi mới rẽ.']
    }),

    man({
      so: 8, ten: 'Sửa hàm thả nhanh', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'pick'],
      deBai: 'Màn có sẵn hàm drop_nhanh() để thả vật. Dùng nó đưa vật tới ô đích: lên một ô, rẽ phải, đi tiếp hai ô.',
      veMaMau: 'Hàm drop_nhanh() có sẵn định thả vật xuống ô đích, nhưng vật không nằm yên ở đó. Đọc thân hàm, xem tay ở tư thế nào lúc thả.',
      san: ['###', '..D', 'o##'],
      batDau: { x: 0, y: 2, huong: 0 },
      maMau: {
        chinh: ['pick()', 'move()', 'turn_right()', 'move()', 'move()', 'drop_nhanh()'],
        hamCuaMan: [H('drop_nhanh', ['release()', 'wait()'])]
      },
      sao: { o: 19, nhip: 7 },
      nhipTheoLoiGiai: true,
      loiGiai: {
        chinh: ['pick()', 'move()', 'turn_right()', 'move()', 'move()', 'drop_nhanh()'],
        hamCuaMan: [H('drop_nhanh', T_THA)]
      },
      loiGiaiKhac: {
        moTa: 'Sửa hàm dài hơn: có thêm nâng tay và wait() ở cuối',
        baiLam: {
          chinh: ['pick()', 'move()', 'turn_right()', 'move()', 'move()', 'drop_nhanh()'],
          hamCuaMan: [H('drop_nhanh', T_THA_DAY)]
        }
      },
      loiSai: [
        { moTa: 'Không sửa gì: thả từ trên cao nên vật vỡ',
          baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'move()', 'move()', 'drop_nhanh()'], hamCuaMan: [H('drop_nhanh', ['release()', 'wait()'])] },
          phaiCoMa: ['vat-vo'] },
        { moTa: 'Sửa nhầm: nâng tay thay vì hạ tay',
          baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'move()', 'move()', 'drop_nhanh()'], hamCuaMan: [H('drop_nhanh', ['arm_up()', 'release()', 'wait()'])] },
          phaiCoMa: ['vat-vo'] },
        { moTa: 'Hạ tay nhưng quên mở kẹp: vật vẫn ở trên tay',
          baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'move()', 'move()', 'drop_nhanh()'], hamCuaMan: [H('drop_nhanh', ['arm_down()', 'wait()'])] },
          phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi drop_nhanh() sớm, trước khi tới ô đích',
          baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'move()', 'drop_nhanh()'], hamCuaMan: [H('drop_nhanh', T_THA)] },
          phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hạ tay và thả ở hai nhịp riêng: thắng nhưng chậm một nhịp',
          baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'move()', 'move()', 'drop_nhanh()'], hamCuaMan: [H('drop_nhanh', ['arm_down()', 'wait()', 'release()', 'wait()'])] },
          phaiCoMa: [] }
      ],
      goiY: ['Vật vỡ khi bị thả từ trên cao: xem tay ở đâu lúc hàm gọi release().',
        'Thả nhẹ xuống đất thì tay phải ở tư thế nào, và lệnh đó thuộc nhịp nào?']
    }),

    man({
      so: 9, ten: 'Tiết kiệm nhịp', hang: 'bien-the', hamCuaEmCan: ['move', 'pick', 'drop'],
      deBai: 'Hai vật và hai ô đích xếp xen kẽ trên một hành lang thẳng. Xe đứng trên vật thứ nhất. Đưa cả hai vật lên hai ô đích, và làm trong số nhịp ít nhất để được đủ 3 sao.',
      san: ['#D#', '#o#', '#D#', '#o#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['pick()', 'move()', 'drop()', 'move()', 'pick()', 'move()', 'drop()'] },
      sao: { o: 20, nhip: 7 },
      tietKiemNhip: true,
      loiGiai: {
        chinh: ['pick()', 'move()', 'drop()', 'move()', 'pick()', 'move()', 'drop()'],
        hamCuaEmMoi: [H('pick', T_PICK_NHANH), H('drop', T_THA_NHANH)]
      },
      loiGiaiKhac: {
        moTa: 'Cách chuẩn: gọi pick() và drop() đầy đủ, không sửa gì (thắng nhưng chậm hơn 3 nhịp)',
        baiLam: { chinh: ['pick()', 'move()', 'drop()', 'move()', 'pick()', 'move()', 'drop()'] }
      },
      loiSai: [
        { moTa: 'Đi lố một ô trước khi thả vật thứ nhất: ô đó đã có vật',
          baiLam: { chinh: ['pick()', 'move()', 'move()', 'drop()'] },
          phaiCoMa: ['o-co-vat', 'chua-dua-vat'] },
        { moTa: 'Chỉ chở vật thứ nhất rồi dừng', baiLam: { chinh: ['pick()', 'move()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên đi tới vật thứ hai: pick() nhặt lại đúng vật vừa thả',
          baiLam: { chinh: ['pick()', 'move()', 'drop()', 'pick()', 'move()', 'drop()'] },
          phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhặt vật thứ hai rồi thả ngay tại chỗ, chưa chở lên đích',
          baiLam: { chinh: ['pick()', 'move()', 'drop()', 'move()', 'pick()', 'drop()'] },
          phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ sửa pick(), quên drop(): thắng nhưng vẫn chậm hơn đường ngắn nhất',
          baiLam: { chinh: ['pick()', 'move()', 'drop()', 'move()', 'pick()', 'move()', 'drop()'] },
          hamCuaEmMoi: [H('pick', T_PICK_NHANH)], phaiCoMa: [] },
        { moTa: 'Bỏ nhầm wait() ở giữa pick(): lệnh nâng tay bị bỏ vì tay đã nhận lệnh hạ',
          baiLam: { chinh: ['pick()', 'move()', 'drop()', 'move()', 'pick()', 'move()', 'drop()'] },
          hamCuaEmMoi: [H('pick', ['arm_down()', 'grab()', 'arm_up()'])], phaiCoMa: ['tay-goi-lai', 'chua-dua-vat'] }
      ],
      goiY: ['Lệnh tay và lệnh bánh có thể chạy chung một nhịp: arm_up() đặt ngay trước lệnh đi thì nâng tay và đi cùng nhịp.',
        'pick() và drop() được gọi nhiều lần: thử đọc lại thân hai hàm xem nhịp nào làm chậm chương trình mà không cần.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Ba vật một đường', hang: 'trum', hamCuaEmCan: ['move', 'turn_left', 'pick', 'drop'], taoHam: ['carry'],
      deBai: 'Ba vật nằm rải rác trên một đường dài, mỗi vật cách ô đích của nó hai ô. Đưa cả ba vật tới ba ô đích.',
      san: ['######D', '######.', 'o.Do.Do'],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 25, nhip: 20 },
      nhipTheoLoiGiai: true,
      huyHieu: { ma: 'tay-gap', ten: 'Huy hiệu Tay gắp' },
      loiGiai: {
        chinh: ['carry()', 'move()', 'carry()', 'move()', 'turn_left()', 'carry()'],
        hamCuaEmMoi: [H('carry', ['pick()', 'move()', 'move()', 'drop()'])]
      },
      loiGiaiKhac: {
        moTa: 'carry() gọi thêm hàm two_steps() cho đoạn đi hai ô',
        baiLam: { chinh: ['carry()', 'move()', 'carry()', 'move()', 'turn_left()', 'carry()'] },
        hamCuaEmMoi: [H('carry', ['pick()', 'two_steps()', 'drop()']), H('two_steps', ['move()', 'move()'])]
      },
      loiSai: [
        { moTa: 'Không gói chuyến chở thành hàm: quá 10 ô',
          baiLam: { chinh: ['pick()', 'move()', 'move()', 'drop()', 'move()', 'pick()', 'move()', 'move()', 'drop()', 'move()', 'turn_left()', 'pick()', 'move()', 'move()', 'drop()'] },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'carry() thả bằng release() thẳng: vật rơi vỡ',
          baiLam: { chinh: ['carry()', 'move()', 'carry()', 'move()', 'turn_left()', 'carry()'] },
          hamCuaEmMoi: [H('carry', ['pick()', 'move()', 'move()', 'release()', 'wait()'])], phaiCoMa: ['vat-vo'] },
        { moTa: 'Quên đi tới vật kế tiếp giữa hai chuyến: pick() nhặt lại vật vừa thả',
          baiLam: { chinh: ['carry()', 'carry()', 'move()', 'turn_left()', 'carry()'] },
          hamCuaEmMoi: [H('carry', ['pick()', 'move()', 'move()', 'drop()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên rẽ trái trước chuyến cuối: xe đâm tường',
          baiLam: { chinh: ['carry()', 'move()', 'carry()', 'move()', 'carry()'] },
          hamCuaEmMoi: [H('carry', ['pick()', 'move()', 'move()', 'drop()'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Ba chuyến chở đều giống nhau, mà chương trình chỉ có 10 ô.',
        'Gói cả một chuyến (nhặt, đi hai ô, thả) thành một hàm; giữa hai chuyến xe vẫn phải đi tới vật kế tiếp.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
