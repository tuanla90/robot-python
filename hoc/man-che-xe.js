/* ============================================================================
   man-che-xe.js — "Học lập trình": CHƯƠNG `che-xe` · CHẾ LỆNH XE (10 màn). Kế hoạch "Chế lệnh" 14/10 (KE-HOACH-CHE-LENH.md, mục 4).
   Chương thứ 3 (sau Xưởng hàm). Robot là XE HAI BÁNH, chưa có part nào khác: robot { than: 'hai-banh', tay: null, camBien: [] }.
   Luật thiết kế: lệnh gốc chỉ đổi MỘT trạng thái (một bánh quay tới hay lùi); động tác hay (né, đỗ lùi, đường về…) là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (máy kiểm kiem-che-xe.mjs chạy từng cách).
   Màn dùng HÀM CỦA MÀN (3.7, 3.8: hàm chỉ đúng cho màn đó, không vào kho) khai cách khác bằng `{ moTa, baiLam: { chinh, hamCuaMan } }`.

   Mục tiêu mới `bong-mo` (san-hoc.js, phần BÓNG MỜ): xe phải đứng đúng tư thế của "xe mờ" khi chương trình CHẠY XONG (đi ngang qua rồi đi tiếp thì chưa thắng);
   `bongMo: { x, y, huong, diQua?: [{x,y}] }`, diQua là điểm ◆ xe phải ghé qua. Chẩn đoán lech-bong-mo / chua-qua-diem nói bằng lời xe lệch ở đâu.
   `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`), người chơi chỉ sửa / tạo hàm trong Xưởng (cham.js bỏ qua chương trình chính gửi lên).
   Màn 3.3 và trùm 3.10 không khóa: người chơi tự viết chương trình chính (dùng hàm đã chế). 3.3, 3.8, 3.9 tới cờ (mục tiêu 'toi-co'); còn lại tới bóng mờ.
   KHAY và PHẦN CỨNG (san-hoc.js, phần KHAY VÀ PHẦN CỨNG): `hamGoc` = lệnh trên khay (chương trình chính và hàm của màn chỉ dùng được những lệnh này); phần cứng xe bánh
   luôn có cả left_back / right_back nên hàm của em dùng được lệnh lùi dù khay chưa mở (3.1–3.3 khay vẫn chỉ left_move, right_move, wait). Từ 3.4 khay mở thêm hai lệnh lùi.
   Màn hỏng khai `phanCung` hẹp hơn (3.9) hay `daoChieu` (3.8) và `canhBao` (nhãn ⚠ trên sân).

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-xe.1 dodge_right() = turn_right(), move(), turn_left()          né sang phải một ô, giữ hướng (3 nhịp)
     che-xe.2 dodge_left()  = turn_left(), move(), turn_right()          né sang trái một ô, giữ hướng (3 nhịp)
     che-xe.4 back()        = left_back(), right_back(), wait()          lùi một ô (1 nhịp)
     che-xe.6 park()        = turn_left(), back()                        lùi vào chỗ đỗ bên PHẢI, đầu xe quay ra đường (2 nhịp)
   HÀM CỦA MÀN (15/10: hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`):
     che-xe.7 come_back()   thân ban đầu `pass`; lời giải back(), turn_left(), back(), back()   đi ngược lại đường go_out() (lệnh ngược theo thứ tự ngược)
     che-xe.8 fixed_move()  thân ban đầu = move() cũ (left_move, right_move, wait: chạy sai vì dây bánh trái đấu ngược); lời giải left_back(), right_move(), wait()
   Hàm của em được SỬA ở chương này (không tính là tạo mới):
     che-xe.5 u_turn()      = left_move(), right_back(), wait()          quay đầu trong MỘT nhịp (trái tiến + phải lùi); trước đó là turn_right() hai lần = 2 nhịp
     che-xe.9 turn_right()  = right_back(), wait()   turn_left() = left_back(), wait()   rẽ bằng bánh lùi (bánh tiến hỏng), vẫn đúng ở mọi màn khác
   Các sửa này vào kho nên có hiệu lực ở MỌI màn sau (kể cả chơi lại các chương cũ): người chơi dùng hàm của em nhanh hơn nên có thể vượt sao nhịp cũ — chấp nhận, sao là ngưỡng.

   Sao: sao.nhip = số nhịp ngắn nhất (BFS trên PHẦN CỨNG của màn, do-duong-che-xe.mjs; màn 3.7 tính cả đoạn go_out() cố định); sao.o = ô của lời giải cách 1.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH_DU = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];   // khay từ 3.4: mở thêm hai lệnh lùi
  var BANH_TIEN = ['left_move', 'right_move', 'wait'];                            // khay 3.1–3.3: như chương 2
  var BANH_LUI = ['left_back', 'right_back', 'wait'];                             // 3.9: hộp số chỉ còn số lùi

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_DODGE_RIGHT = ['turn_right()', 'move()', 'turn_left()'];
  var T_DODGE_LEFT = ['turn_left()', 'move()', 'turn_right()'];
  var T_BACK = ['left_back()', 'right_back()', 'wait()'];
  var T_PARK = ['turn_left()', 'back()'];
  var T_COME_BACK = ['back()', 'turn_left()', 'back()', 'back()'];
  var T_COME_BACK_TRONG = ['pass'];                                  // thân ban đầu của come_back() ở 3.7: chưa làm gì (lõi hiểu pass), người chơi viết thay nó
  var T_FIXED_MOVE = ['left_back()', 'right_move()', 'wait()'];
  var T_FIXED_MOVE_CU = ['left_move()', 'right_move()', 'wait()'];   // thân ban đầu của fixed_move() ở 3.8: move() cũ, chạy sai vì bánh trái đấu ngược
  var T_U_TURN_NHANH = ['left_move()', 'right_back()', 'wait()'];
  var T_TURN_RIGHT_LUI = ['right_back()', 'wait()'];
  var T_TURN_LEFT_LUI = ['left_back()', 'wait()'];

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['dodge_right()'];
  var C_2 = ['dodge_left()'];
  var C_4 = ['back()'];
  var C_5 = ['u_turn()', 'move()', 'move()'];
  var C_6 = ['park()'];
  var C_7 = ['go_out()', 'come_back()'];
  var C_8 = ['fixed_move()', 'fixed_move()', 'fixed_move()'];
  var C_9 = ['back()', 'back()', 'turn_left()', 'back()', 'back()', 'turn_right()', 'back()'];
  // 3.3 (người chơi tự viết): hành lang so le, né phải - né trái - né phải
  var L_3 = ['move()', 'dodge_right()', 'move()', 'move()', 'dodge_left()', 'move()', 'move()', 'dodge_right()', 'move()'];
  // 3.10 (người chơi tự viết): ra khỏi chỗ đỗ, né xe giữa đường, tới ◆ rồi lùi vào chỗ trống
  var L_10 = ['move()', 'turn_left()', 'move()', 'move()', 'dodge_right()', 'move()', 'move()', 'back()', 'park()'];

  // hàm của màn 3.7: đưa xe ra khỏi chỗ đỗ (khóa, xem được)
  var T_GO_OUT = ['move()', 'move()', 'turn_right()', 'move()'];
  function hGoOut() { return H('go_out', T_GO_OUT); }

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'che-xe';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: null, camBien: [] };
    m.hamGoc = m.hamGoc || BANH_DU;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = [];
    if (m.mucTieu !== 'toi-co') m.mucTieu = m.mucTieu || 'bong-mo';
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                 // mặc định của lõi
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Né phải', hang: 'lam-quen', hamGoc: BANH_TIEN,
      hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['dodge_right'],
      deBai: 'Phía trước xe có vật cản. Chương trình chính chỉ gọi dodge_right(): em tự chế lệnh này để xe sang đứng ở ô bên phải, mặt vẫn quay lên như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi dodge_right(). Mở Xưởng hàm, tạo dodge_right() rồi bấm Chạy.',
      san: ['.....', '.....', '..#..', '.....', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 3, y: 3, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 11, nhip: 3 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('dodge_right', T_DODGE_RIGHT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [H('dodge_right', nhieu(['# né sang phải'], T_DODGE_RIGHT))]
      },
      congThucKhac: [
        { moTa: 'Quay phải bằng ba lần quay trái', hamCuaEmMoi: [H('dodge_right', ['turn_left()', 'turn_left()', 'turn_left()', 'move()', 'turn_left()'])] },
        { moTa: 'Viết thẳng lệnh bánh, không gọi hàm nào', hamCuaEmMoi: [H('dodge_right', ['left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'right_move()', 'wait()'])] },
        { moTa: 'Quay trái, lùi một ô, quay phải (dùng lệnh lùi ngay trong hàm của em, dù khay chưa có)', hamCuaEmMoi: [H('dodge_right', ['turn_left()', 'left_back()', 'right_back()', 'wait()', 'turn_right()'])] }
      ],
      loiSai: [
        { moTa: 'Né nhầm sang trái', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('dodge_right', T_DODGE_LEFT)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sang phải rồi quên quay mặt lại: xe quay mặt sang phải', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('dodge_right', ['turn_right()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ đi thẳng, đâm vào vật cản', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('dodge_right', ['move()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi dodge_right() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Sang ngang một ô mà mặt vẫn quay lên: xe phải quay, đi, rồi quay lại.', 'Các hàm move(), turn_right(), turn_left() em đã chế sẵn trong kho.']
    }),

    man({
      so: 2, ten: 'Né trái', hang: 'lam-quen', hamGoc: BANH_TIEN,
      hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['dodge_left'],
      deBai: 'Phía trước xe lại có vật cản. Chế lệnh dodge_left() để xe sang đứng ở ô bên trái, mặt vẫn quay lên như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi dodge_left(). Mở Xưởng hàm, tạo dodge_left() rồi bấm Chạy.',
      san: ['.....', '..#..', '.....', '.....', '.....'],
      batDau: { x: 3, y: 2, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 11, nhip: 3 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('dodge_left', T_DODGE_LEFT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [H('dodge_left', nhieu(['# né sang trái'], T_DODGE_LEFT))]
      },
      congThucKhac: [
        { moTa: 'Quay trái bằng ba lần quay phải', hamCuaEmMoi: [H('dodge_left', ['turn_right()', 'turn_right()', 'turn_right()', 'move()', 'turn_right()'])] },
        { moTa: 'Viết thẳng lệnh bánh, không gọi hàm nào', hamCuaEmMoi: [H('dodge_left', ['right_move()', 'wait()', 'right_move()', 'left_move()', 'wait()', 'left_move()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Né nhầm sang phải', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('dodge_left', T_DODGE_RIGHT)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sang trái rồi quên quay mặt lại: xe quay mặt sang trái', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('dodge_left', ['turn_left()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay trái, đi, rồi quay trái nữa thay vì quay lại', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('dodge_left', ['turn_left()', 'move()', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Giống dodge_right() nhưng quay về phía ngược lại.', 'Chạy thử rồi so xe với bóng mờ: xe lệch về phía nào?']
    }),

    man({
      so: 3, ten: 'Đường né', hang: 'lam-quen', hamGoc: BANH_TIEN, mucTieu: 'toi-co',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'dodge_right', 'dodge_left'],
      deBai: 'Hành lang hẹp có các vật cản nằm so le. Dùng dodge_right() và dodge_left() em đã chế để đưa xe tới cờ; chương trình chỉ có 10 ô.',
      san: ['##F#', '#..#', '#.o#', '#..#', '##.#', '#..#', '#..#'],                  // vật gỗ chắn lối thẳng (màn gặp khó trước Tay gắp)
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 22, nhip: 15 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# né dọc đường'], L_3) }
      },
      congThucKhac: [
        { moTa: 'Hai hàm né viết thẳng lệnh bánh, không gọi hàm nào',
          hamCuaEmMoi: [H('dodge_right', ['left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'right_move()', 'wait()']), H('dodge_left', ['right_move()', 'wait()', 'right_move()', 'left_move()', 'wait()', 'left_move()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Né nhầm bên: đâm vào tường hành lang', baiLam: { chinh: ['move()', 'dodge_left()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi thẳng, không né vật cản', baiLam: { chinh: ['move()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng lệnh né, viết từng bước quay: quá 10 ô',
          baiLam: { chinh: ['move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'move()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi lần né xong xe vẫn quay mặt lên, nên chỉ cần đi thẳng tới vật cản kế tiếp rồi né tiếp.', 'Né phải thì xe sang cột bên phải, né trái thì sang cột bên trái.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Bánh lùi', hang: 'luyen',
      hamCuaEmCan: ['move', 'u_turn'], taoHam: ['back'],
      deBai: 'Xe có thêm lệnh lùi: left_back() và right_back(). Chế lệnh back() để xe lùi một ô về phía sau, mặt vẫn quay như cũ, đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi back(). Mở Xưởng hàm, tạo back() rồi bấm Chạy.',
      san: ['.....', '.....', '.....', '.....', '#####'],
      batDau: { x: 2, y: 2, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 4, nhip: 1 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('back', T_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [H('back', nhieu(['# lùi một ô'], T_BACK))]
      },
      congThucKhac: [
        { moTa: 'Quay đầu, đi một ô, quay đầu lại (chậm hơn nhưng vẫn tới)', hamCuaEmMoi: [H('back', ['u_turn()', 'move()', 'u_turn()'])] },
        { moTa: 'Hai lệnh lùi viết sát nhau, wait() ở cuối', hamCuaEmMoi: [H('back', ['right_back()', 'left_back()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Quên wait(): lệnh bánh chưa chạy', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('back', ['left_back()', 'right_back()'])], phaiCoMa: ['quen-wait', 'lech-bong-mo'] },
        { moTa: 'Chỉ lùi một bánh: xe quay thay vì lùi', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('back', ['left_back()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Hai bánh quay tới: xe tiến thay vì lùi', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('back', ['left_move()', 'right_move()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Một bánh quay lùi một mình thì xe quay. Cả hai bánh cùng quay lùi thì xe làm gì?', 'Đừng quên wait() ở cuối nhịp.']
    }),

    man({
      so: 5, ten: 'Quay đầu một nhịp', hang: 'luyen',
      hamCuaEmCan: ['move', 'u_turn'],
      deBai: 'Chương trình chính quay đầu rồi đi hai ô tới bóng mờ. Hàm u_turn() của em đang tốn hai nhịp: sửa nó để xe quay đầu chỉ trong một nhịp.',
      veMaMau: 'Chương trình chính bị khóa: u_turn(), move(), move(). Hàm u_turn() trong Xưởng đang quay đầu bằng hai lần turn_right().',
      san: ['.....', '.....', '.....', '.....', '.....'],
      batDau: { x: 2, y: 1, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 2 },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 9, nhip: 3 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('u_turn', T_U_TURN_NHANH)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [H('u_turn', nhieu(['# quay đầu một nhịp'], T_U_TURN_NHANH))]
      },
      congThucKhac: [
        { moTa: 'Đổi hai bánh cho nhau: trái lùi, phải tiến (vẫn một nhịp)', hamCuaEmMoi: [H('u_turn', ['left_back()', 'right_move()', 'wait()'])] },
        { moTa: 'Quay trái hai lần (tới được nhưng tốn hai nhịp, ít sao hơn)', hamCuaEmMoi: [H('u_turn', ['turn_left()', 'turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: u_turn() cũ vẫn tới nơi nhưng chậm một nhịp, thiếu sao', baiLam: { chinh: C_5.slice() }, phaiCoMa: [] },
        { moTa: 'Hai bánh cùng tiến: xe đi thẳng thay vì quay đầu', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('u_turn', ['left_move()', 'right_move()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ một bánh tiến: xe chỉ quay một góc vuông', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('u_turn', ['left_move()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên wait(): lệnh bánh dính sang nhịp kế', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('u_turn', ['left_move()', 'right_back()'])], phaiCoMa: ['banh-goi-lai', 'lech-bong-mo'] }
      ],
      goiY: ['Hai bánh quay ngược chiều nhau trong cùng một nhịp thì xe xoay tại chỗ.', 'Chạy xong, so số nhịp của em với số nhịp tốt nhất để được thêm sao.']
    }),

    man({
      so: 6, ten: 'Đỗ lùi', hang: 'luyen',
      hamCuaEmCan: ['turn_left', 'back'], taoHam: ['park'],
      deBai: 'Chiếc xe dừng bên đường, chỗ đỗ nằm bên phải. Chế lệnh park() để xe lùi vào chỗ đỗ, đầu xe quay ra đường như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi park(). Mở Xưởng hàm, tạo park() rồi bấm Chạy.',
      san: ['.....', '..#..', '...#.', '..#..', '.....'],
      batDau: { x: 1, y: 2, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 3 },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 8, nhip: 2 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('park', T_PARK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [H('park', nhieu(['# lùi vào chỗ đỗ'], T_PARK))]
      },
      congThucKhac: [
        { moTa: 'Quay phải, tiến vào chỗ đỗ rồi quay đầu (chậm hơn một nhịp)', hamCuaEmMoi: [H('park', ['turn_right()', 'move()', 'u_turn()'])] },
        { moTa: 'Quay trái rồi viết thẳng lệnh lùi', hamCuaEmMoi: [H('park', ['turn_left()', 'left_back()', 'right_back()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Quay nhầm sang phải: lùi về phía đường bên kia', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('park', ['turn_right()', 'back()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay trái rồi tiến: xe chạy sang bên kia đường', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('park', ['turn_left()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ lùi, không quay: xe lùi dọc đường', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('park', ['back()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Muốn đầu xe quay ra đường thì phải lùi vào chỗ đỗ, đừng tiến vào.', 'Quay xe sao cho lùi đúng một lần là vào đúng ô.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về', hang: 'bien-the',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'back', 'u_turn'],
      deBai: 'Hàm go_out() của màn đưa xe ra khỏi chỗ đỗ. Viết thân hàm come_back() của màn để xe về đúng chỗ cũ và đúng hướng cũ, như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: go_out() rồi come_back(). Hàm go_out() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm come_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó.',
      san: ['.....', '...#.', '.....', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      bongMo: { x: 1, y: 3, huong: 0 },
      chinhCoDinh: true, khoaHamMan: ['go_out'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', T_COME_BACK_TRONG)] },
      sao: { o: 20, nhip: 8 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', T_COME_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', nhieu(['# đi ngược lại go_out()'], T_COME_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Quay đầu, đi lại đường cũ rồi quay đầu lần nữa', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', ['u_turn()', 'move()', 'turn_left()', 'move()', 'move()', 'u_turn()'])] } },
        { moTa: 'Lùi bằng lệnh bánh, rẽ bằng hàm turn_left()', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', ['left_back()', 'right_back()', 'wait()', 'turn_left()', 'back()', 'back()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe không làm gì thêm, đứng lại chỗ go_out() dừng', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', T_COME_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi tiếp thay vì đi ngược lại', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', ['move()', 'move()', 'turn_left()', 'move()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đúng lệnh ngược nhưng sai thứ tự', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', ['back()', 'back()', 'back()', 'turn_left()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên đổi turn_right() thành lệnh ngược turn_left()', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoOut(), H('come_back', ['back()', 'turn_right()', 'back()', 'back()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm come_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoOut()] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Đi ngược lại từng bước, theo thứ tự ngược.', 'Mỗi lệnh có một lệnh ngược: tiến thì lùi, quay phải thì quay trái.']
    }),

    man({
      so: 8, ten: 'Đấu dây ngược', hang: 'bien-the', mucTieu: 'toi-co',
      hamCuaEmCan: ['move'],
      daoChieu: ['trai'], canhBao: 'Dây bánh trái đấu ngược',
      deBai: 'Dây bánh trái bị đấu ngược nên hàm fixed_move() của màn chạy sai. Sửa hàm đó để xe tiến thẳng đúng một ô, rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình chính bị khóa, gọi fixed_move() ba lần. Thân hàm fixed_move() của màn đang giống move() của em. Thử nó trong sân thử của Xưởng hàm trước để thấy xe làm gì.',
      san: ['###', '#F#', '#.#', '#.#', '#.#'],
      batDau: { x: 1, y: 4, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', T_FIXED_MOVE_CU)] },
      sao: { o: 6, nhip: 3 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', T_FIXED_MOVE)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', nhieu(['# bánh trái đấu ngược'], T_FIXED_MOVE))] }
      },
      congThucKhac: [
        { moTa: 'Quay đầu bằng move(), lùi một ô, rồi quay đầu lại (chậm hơn nhưng vẫn tới)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', ['move()', 'left_move()', 'right_back()', 'wait()', 'move()'])] } },
        { moTa: 'Đổi chỗ hai lệnh bánh trong nhịp', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', ['right_move()', 'left_back()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân cũ (giống move()): bánh trái ngược nên xe chỉ quay đầu tại chỗ', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', T_FIXED_MOVE_CU)] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi move() của em: bánh trái ngược nên xe chỉ quay đầu tại chỗ', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', ['move()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hai bánh cùng lùi: vì bánh trái ngược nên xe quay đầu', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', ['left_back()', 'right_back()', 'wait()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait(): lệnh bánh dính sang lần gọi kế', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_move', ['left_back()', 'right_move()'])] }, phaiCoMa: ['banh-goi-lai', 'chua-toi-co'] }
      ],
      goiY: ['Thử hàm fixed_move() trong sân thử của Xưởng hàm: bánh trái giờ quay ngược chiều với lệnh.', 'Muốn bánh trái quay tới thì phải ra lệnh cho nó quay lùi.']
    }),

    man({
      so: 9, ten: 'Chỉ còn số lùi', hang: 'bien-the', hamGoc: BANH_LUI, mucTieu: 'toi-co',
      hamCuaEmCan: ['back', 'turn_right', 'turn_left'],
      phanCung: BANH_LUI, canhBao: 'Xe chỉ còn số lùi',
      deBai: 'Hộp số của xe bị kẹt: chỉ còn lệnh lùi. Chương trình chính đã có sẵn nhưng turn_right() và turn_left() của em vẫn dùng bánh tiến. Sửa hai hàm đó để xe lùi tới cờ.',
      veMaMau: 'Chương trình chính bị khóa: lùi, rẽ, lùi, rẽ, lùi. Chạy thử để biết hàm nào của em báo hỏng.',
      san: ['.....', '.....', '..##.', '.....', '.##F.'],
      batDau: { x: 1, y: 1, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice() },
      sao: { o: 14, nhip: 7 },
      loiGiai: { chinh: C_9.slice(), hamCuaEmMoi: [H('turn_right', T_TURN_RIGHT_LUI), H('turn_left', T_TURN_LEFT_LUI)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice() },
        hamCuaEmMoi: [H('turn_right', nhieu(['# rẽ phải bằng bánh phải lùi'], T_TURN_RIGHT_LUI)), H('turn_left', T_TURN_LEFT_LUI)]
      },
      congThucKhac: [
        { moTa: 'Quay trái bằng ba lần quay phải', hamCuaEmMoi: [H('turn_right', T_TURN_RIGHT_LUI), H('turn_left', ['turn_right()', 'turn_right()', 'turn_right()'])] },
        { moTa: 'Quay phải bằng ba lần quay trái', hamCuaEmMoi: [H('turn_right', ['turn_left()', 'turn_left()', 'turn_left()']), H('turn_left', T_TURN_LEFT_LUI)] }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: hai hàm vẫn gọi bánh tiến đã hỏng', baiLam: { chinh: C_9.slice() }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Mới sửa turn_right(), turn_left() vẫn dùng bánh tiến', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('turn_right', T_TURN_RIGHT_LUI)], phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Sửa lộn bánh: rẽ phải thành rẽ trái và ngược lại', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('turn_right', T_TURN_LEFT_LUI), H('turn_left', T_TURN_RIGHT_LUI)], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait() trong hàm đã sửa', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('turn_right', ['right_back()']), H('turn_left', T_TURN_LEFT_LUI)], phaiCoMa: ['banh-goi-lai', 'chua-toi-co'] }
      ],
      goiY: ['Một bánh quay lùi một mình thì xe quay về phía nào? Thử từng bánh.', 'Chạy thử, xem hàm nào báo hỏng rồi sửa hàm đó.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Bãi đỗ xe', hang: 'trum',
      hamCuaEmCan: ['move', 'turn_left', 'turn_right', 'dodge_right', 'back', 'park'],
      huyHieu: { ma: 'che-xe', ten: 'Huy hiệu Chế lệnh xe' },
      deBai: 'Xe đang đỗ ở ô bên trái. Ra khỏi chỗ đỗ, né khối chắn giữa đường, chạy qua điểm ◆ rồi lùi vào chỗ trống bên phải, giống bóng mờ.',
      san: ['###..##', '####..#', '###..##', '###.###', '##..###', '###.###'],
      batDau: { x: 2, y: 4, huong: 1 },
      bongMo: { x: 5, y: 1, huong: 3, diQua: [{ x: 4, y: 0 }] },
      maMau: { chinh: [] },
      sao: { o: 24, nhip: 12 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# ra, né, ◆, lùi vào'], L_10) }
      },
      congThucKhac: [
        { moTa: 'Né phải bằng quay trái, lùi, quay phải', hamCuaEmMoi: [H('dodge_right', ['turn_left()', 'back()', 'turn_right()'])] },
        { moTa: 'Đỗ bằng cách quay phải, tiến vào chỗ đỗ rồi quay đầu (chậm hơn một nhịp, ít sao hơn)', hamCuaEmMoi: [H('park', ['turn_right()', 'move()', 'u_turn()'])] }
      ],
      loiSai: [
        { moTa: 'Bỏ qua điểm ◆: đỗ đúng chỗ nhưng chưa qua ◆', baiLam: { chinh: ['move()', 'turn_left()', 'move()', 'move()', 'dodge_right()', 'move()', 'park()'] }, phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Không né xe giữa đường: đâm vào xe đang dừng', baiLam: { chinh: ['move()', 'turn_left()', 'move()', 'move()', 'move()', 'move()', 'back()', 'park()'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Tiến vào chỗ trống thay vì lùi: đầu xe quay vào trong', baiLam: { chinh: ['move()', 'turn_left()', 'move()', 'move()', 'dodge_right()', 'move()', 'move()', 'back()', 'turn_right()', 'move()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết từng bước quay, không dùng lệnh đã chế: quá 10 ô', baiLam: { chinh: ['move()', 'turn_left()', 'move()', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'move()', 'back()', 'turn_left()', 'back()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Chia đường đi thành từng đoạn nhỏ và dùng lệnh em đã chế cho từng đoạn.', 'Chương trình chỉ có 10 ô nên lệnh chế phải dùng đúng chỗ.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
