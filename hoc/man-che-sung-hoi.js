/* ============================================================================
   man-che-sung-hoi.js — "Robot Chấn Hưng": CHƯƠNG `che-sung-hoi` · CHẾ LỆNH SÚNG HƠI (10 màn). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5c.3, 15/10): chương chế lệnh đi sau chương `sung-hoi`.
   Robot là XE HAI BÁNH gắn SÚNG HƠI hai nòng: robot { than: 'hai-banh', tay: 'hoi', camBien: [] }.
   Lệnh gốc (luật đầy đủ ở san-hoc.js, phần THÙNG NẶNG + SÚNG HƠI), đều chỉ RA LỆNH, wait() cho nhịp trôi, mỗi nhịp một phát, cặp lệnh ngược shoot ↔ shoot_back:
       shoot() bắn bóng ra TRƯỚC, xe giật LÙI một ô · shoot_back() bắn bóng ra SAU, xe giật TỚI một ô · ô giật vào có thùng nặng thì thùng NHÍCH 1 Ô và xe theo 1 ô (luật 29/10) · ô bị chặn thì xe đứng yên.
   Luật thiết kế như che-xe và che-nam-cham: lệnh gốc chỉ đổi MỘT trạng thái; động tác hay (lùi bằng giật, đá thùng sang bên, bắn nút rồi về chỗ cũ…) là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (hay `baiLam` cho hàm của màn).

   Mục tiêu `bong-mo` (san-hoc.js, phần BÓNG MỜ): xe phải đứng đúng tư thế "xe mờ" khi chương trình CHẠY XONG, THÙNG MỜ (bongMo.thung) cho biết mỗi thùng nặng phải nằm ở ô nào, ô ◆ (diQua) phải đi qua;
   chưa chế hàm thì không thắng. `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`), người chơi chỉ sửa / tạo hàm trong Xưởng; 3 và 10 không khóa: người chơi tự viết chương trình chính.

   KHAY: cả chương mở đủ bánh (có bánh lùi) và cả hai nòng. Màn 8 là màn HỎNG: khay = phần cứng, thiếu shoot_back (nòng sau hỏng).
   Hàm của em có sẵn ở chương này: toàn bộ chương trước (move, turn_left, turn_right, u_turn một nhịp, back, forward…).

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-sung-hoi.1 jet_back()   = shoot(), wait()                                                           lùi một ô bằng cú giật (1 nhịp)
     che-sung-hoi.2 jet_fwd()    = shoot_back(), wait()                                                      tiến một ô bằng cú giật (1 nhịp)
     che-sung-hoi.4 kick_right() = turn_left(), shoot(), wait(), turn_right()                                đá thùng bên phải xe nhích sang phải một ô, xe theo một ô, hướng giữ như cũ (3 nhịp)
     che-sung-hoi.5 tap_right()  = turn_right(), shoot(), wait(), move(), turn_left()                        bắn nút bên phải rồi về đúng chỗ cũ (4 nhịp): cú giật đẩy xe lùi một ô nên phải tiến lại
     che-sung-hoi.6 kick_left()  = turn_right(), shoot(), wait(), turn_left()                                đá thùng bên trái xe nhích sang trái một ô, xe theo một ô, hướng giữ như cũ (3 nhịp)
     che-sung-hoi.8 kick_ahead() = u_turn(), shoot(), wait(), u_turn()                                       đá thùng ngay trước mặt lên một ô bằng nòng trước (nòng sau hỏng): quay đầu, bắn, quay đầu lại (3 nhịp)
   HÀM CỦA MÀN (hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-sung-hoi.7 fixed_kick() thân ban đầu = kick_right() cũ (súng lắp ngược nên xe giật sai chiều); lời giải đổi shoot() thành shoot_back()          (daoChieu ['sung'])
     che-sung-hoi.9 go_out() = jet_back(), turn_right(), jet_back(), jet_back() (khóa, xem được); come_back() thân ban đầu `pass`, lời giải jet_fwd(), jet_fwd(), turn_left(), jet_fwd()   đi NGƯỢC lại go_out()

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật (nhipTheoLoiGiai: BFS do-duong-che-sung-hoi.mjs, mỗi phát bắn một nhịp riêng, luôn ngắn hơn hay bằng); sao.o = ô của lời giải cách 1.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên. Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var KHAY = BANH.concat(['shoot', 'shoot_back']);                         // khay cả chương
  var KHAY_HONG = BANH.concat(['shoot']);                                  // 8: nòng sau hỏng (không có shoot_back)

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function lap(ds, n) { var kq = []; for (var i = 0; i < n; i++) kq = kq.concat(ds); return kq; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_JET_BACK = ['shoot()', 'wait()'];
  var T_JET_FWD = ['shoot_back()', 'wait()'];
  var T_KICK_RIGHT = ['turn_left()', 'shoot()', 'wait()', 'turn_right()'];
  var T_TAP_RIGHT = ['turn_right()', 'shoot()', 'wait()', 'move()', 'turn_left()'];
  var T_KICK_LEFT = ['turn_right()', 'shoot()', 'wait()', 'turn_left()'];
  var T_KICK_AHEAD = ['u_turn()', 'shoot()', 'wait()', 'u_turn()'];
  // 7: thân ban đầu của fixed_kick() = kick_right() cũ (sai khi súng lắp ngược) và bản sửa (đổi shoot() thành shoot_back())
  var T_FIXED_CU = T_KICK_RIGHT.slice();
  var T_FIXED = ['turn_left()', 'shoot_back()', 'wait()', 'turn_right()'];
  // 9: go_out() của màn (khóa) và come_back() (thân ban đầu: pass)
  var T_GO_OUT = ['jet_back()', 'turn_right()', 'jet_back()', 'jet_back()'];
  var T_COME_BACK_TRONG = ['pass'];
  var T_COME_BACK = ['jet_fwd()', 'jet_fwd()', 'turn_left()', 'jet_fwd()'];

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['jet_back()'];
  var C_2 = ['jet_fwd()'];
  var C_4 = ['kick_right()'];
  var C_5 = ['tap_right()', 'forward(2)'];
  var C_6 = ['kick_right()', 'move()', 'kick_left()'];                   // luật giật một ô: đá xong thùng phải, xe đã theo một ô; tiến một ô thì thùng kia nằm ngay bên trái
  var C_7 = ['fixed_kick()'];
  var C_8 = ['kick_ahead()'];
  var C_9 = ['go_out()', 'come_back()'];
  // 3 (người chơi tự viết): lùi ba ô qua ◆, rồi tiến hai ô
  var L_3 = nhieu(LAP(3, 'jet_back()'), ['jet_fwd()', 'jet_fwd()']);
  // 10 (người chơi tự viết): đá thùng phải (xe theo một ô), tiến một ô là thùng kia ở bên trái, đá nó (xe theo một ô), tiến một ô tới hàng van, bắn van rồi về chỗ cũ, tiến hai ô qua cửa
  var L_10 = ['kick_right()', 'forward(1)', 'kick_left()', 'forward(1)', 'tap_right()', 'forward(2)'];

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'che-sung-hoi';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'hoi', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'bong-mo';
    m.nhipTheoLoiGiai = true;
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  var SAN_TRONG = ['.....', '.....', '.....', '.....', '.....'];
  var BD_5X5 = { x: 2, y: 2, huong: 0 };
  // 3: hành lang đứng 3×9, xe (1,3) quay mặt lên; ◆ ở (1,6) cách xe ba ô phía sau; xe mờ ở (1,4) cách xe một ô phía sau
  var SAN_3 = ['###', '#.#', '#.#', '#.#', '#.#', '#.#', '#.#', '#.#', '###'];
  var BD_3 = { x: 1, y: 3, huong: 0 };
  // 4: thùng ngay bên phải xe ở (3,2); đá sang phải thì thùng nhích tới mép sân (4,2), xe theo vào (3,2)
  var SAN_4 = ['.....', '.....', '...H.', '.....', '.....'];
  // 5: xe (2,2) quay mặt lên, cửa ở (2,1) chắn đường lên (2,0); nút ở tường bên phải (4,2)
  var SAN_5 = ['##.##', '##C##', '#...N', '#####'];
  // 6: thùng phải ở (3,2) ngay bên phải xe (2,2); đá xong xe ở (3,2), tiến một ô lên (3,1) thì thùng kia (2,1) nằm ngay bên trái; đá nó sang (1,1), xe theo vào (2,1)
  var SAN_6 = ['.....', '..H..', '...H.', '.....', '.....'];
  // 8: thùng ngay trước xe ở (2,1); đá lên thì thùng nhích tới mép trên (2,0), xe theo vào (2,1)
  var SAN_8 = ['.....', '..H..', '.....', '.....', '.....'];
  // 9: sân trống 5×5; go_out() đưa xe từ (3,1) lùi xuống (3,2), quay phải, lùi hai ô tới (1,2) quay mặt phải
  var BD_9 = { x: 3, y: 1, huong: 0 };
  // 10: xe (3,4) quay mặt lên; thùng phải (4,4), thùng kia (3,3) ngay trước mặt; đá phải xong xe ở (4,4), tiến lên (4,3) thì thùng kia ở bên trái, đá nó sang (2,3), xe ở (3,3);
  //     tiến lên hàng van (3,2), nút ở tường bên phải (6,2), tap_right giật xe sang (2,2) rồi tiến lại; cửa (3,1) chắn đường lên chỗ xe mờ (3,0)
  var SAN_10 = ['###.###', '###C###', '......N', '...H...', '....H..', '#######'];
  var BD_10 = { x: 3, y: 4, huong: 0 };

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Lùi bằng giật', hang: 'lam-quen', taoHam: ['jet_back'],
      deBai: 'Chương trình chính chỉ gọi jet_back(): em tự chế lệnh này để xe lùi một ô bằng cú giật của vòi phun, cho xe nằm đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi jet_back(). Mở Xưởng hàm, tạo jet_back() rồi bấm Chạy.',
      san: SAN_TRONG, batDau: BD_5X5,
      bongMo: { x: 2, y: 3, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 3, nhip: 1 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('jet_back', T_JET_BACK)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('jet_back', nhieu(['# bắn ra trước, xe giật lùi'], T_JET_BACK))] },
      congThucKhac: [
        { moTa: 'Lùi bằng hai bánh lùi, không dùng vòi phun', hamCuaEmMoi: [H('jet_back', ['left_back()', 'right_back()', 'wait()'])] },
        { moTa: 'Bắn xong chờ thêm một nhịp (chậm hơn một nhịp)', hamCuaEmMoi: [H('jet_back', ['shoot()', 'wait()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Dùng shoot_back(): xe giật tới, không lùi', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('jet_back', T_JET_FWD)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên wait(): lệnh bắn chưa kịp chạy', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('jet_back', ['shoot()'])], phaiCoMa: ['quen-wait', 'lech-bong-mo'] },
        { moTa: 'Bắn hai phát: xe lùi hai ô, quá xe mờ một ô', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('jet_back', nhieu(T_JET_BACK, T_JET_BACK))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi jet_back() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Bắn ra trước thì xe bị giật lùi một ô.', 'Nhớ wait() sau lệnh bắn để nhịp trôi.']
    }),

    man({
      so: 2, ten: 'Tiến bằng giật', hang: 'lam-quen', taoHam: ['jet_fwd'],
      deBai: 'Chương trình chính chỉ gọi jet_fwd(): em tự chế lệnh này để xe tiến một ô bằng cú giật của đầu phun sau, cho xe nằm đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi jet_fwd(). Mở Xưởng hàm, tạo jet_fwd() rồi bấm Chạy.',
      san: SAN_TRONG, batDau: BD_5X5,
      bongMo: { x: 2, y: 1, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 3, nhip: 1 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('jet_fwd', T_JET_FWD)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('jet_fwd', nhieu(['# bắn ra sau, xe giật tới'], T_JET_FWD))] },
      congThucKhac: [
        { moTa: 'Tiến bằng hai bánh tiến, không dùng vòi phun', hamCuaEmMoi: [H('jet_fwd', ['left_move()', 'right_move()', 'wait()'])] },
        { moTa: 'Bắn xong chờ thêm một nhịp (chậm hơn một nhịp)', hamCuaEmMoi: [H('jet_fwd', ['shoot_back()', 'wait()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Dùng shoot(): xe giật lùi, không tiến', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('jet_fwd', T_JET_BACK)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên wait(): lệnh bắn chưa kịp chạy', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('jet_fwd', ['shoot_back()'])], phaiCoMa: ['quen-wait', 'lech-bong-mo'] },
        { moTa: 'Bắn hai phát: xe tiến hai ô, quá xe mờ một ô', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('jet_fwd', nhieu(T_JET_FWD, T_JET_FWD))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi jet_fwd() mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Bắn ra sau thì xe được giật tới một ô, ngược với jet_back().', 'Hàm jet_fwd() chỉ khác jet_back() ở chữ _back.']
    }),

    man({
      so: 3, ten: 'Giật tới giật lùi', hang: 'lam-quen', hamCuaEmCan: ['jet_back', 'jet_fwd'],
      deBai: 'Xe phải lùi qua điểm ◆ ở cách xe ba ô, rồi tiến lên hai ô để nằm đúng chỗ xe mờ. Dùng jet_back() và jet_fwd() em đã chế; chương trình chỉ có 10 ô.',
      san: SAN_3, batDau: BD_3,
      bongMo: { x: 1, y: 4, huong: 0, diQua: [{ x: 1, y: 6 }] },
      maMau: { chinh: [] },
      sao: { o: 8, nhip: 5 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# lùi ba ô rồi tiến hai ô'], L_3) } },
      congThucKhac: [
        { moTa: 'Viết thẳng ba lần jet_back() và hai lần jet_fwd(), không dùng for', baiLam: { chinh: nhieu(lap(['jet_back()'], 3), lap(['jet_fwd()'], 2)) } },
        { moTa: 'Lùi và tiến bằng bánh: back() ba lần rồi forward(2)', baiLam: { chinh: nhieu(LAP(3, 'back()'), ['forward(2)']) } }
      ],
      loiSai: [
        { moTa: 'Chỉ lùi, quên tiến lại: xe nằm xa chỗ xe mờ', baiLam: { chinh: LAP(3, 'jet_back()') }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi hai ô rồi tiến một: xe nằm đúng chỗ xe mờ nhưng chưa qua điểm ◆', baiLam: { chinh: ['jet_back()', 'jet_back()', 'jet_fwd()'] }, phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Tiến thay vì lùi: xe không qua điểm ◆ ở phía sau', baiLam: { chinh: nhieu(LAP(3, 'jet_fwd()'), ['jet_back()', 'jet_back()']) }, phaiCoMa: ['lech-bong-mo', 'chua-qua-diem'] }
      ],
      goiY: ['Điểm ◆ nằm sau xe ba ô, mà xe mờ chỉ cách xe một ô: lùi ba rồi tiến lại.', 'Lặp lại jet_back() bằng vòng for cho gọn.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Đá thùng sang phải', hang: 'luyen', hamCuaEmCan: ['turn_left', 'turn_right'], taoHam: ['kick_right'],
      deBai: 'Một thùng nặng nằm ngay bên phải xe. Chương trình chính chỉ gọi kick_right(): em tự chế lệnh này để đá thùng nhích sang phải một ô. Xe theo thùng một ô, hướng giữ như cũ, giống xe mờ và thùng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi kick_right(). Mở Xưởng hàm, tạo kick_right() rồi bấm Chạy.',
      san: SAN_4, batDau: BD_5X5,
      bongMo: { x: 3, y: 2, huong: 0, thung: [{ x: 4, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 9, nhip: 3 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('kick_right', T_KICK_RIGHT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('kick_right', nhieu(['# quay trái, bắn, quay lại'], T_KICK_RIGHT))] },
      congThucKhac: [
        { moTa: 'Quay phải rồi bắn ra sau: cú giật cũng đẩy xe sang phải, đúng vào thùng', hamCuaEmMoi: [H('kick_right', ['turn_right()', 'shoot_back()', 'wait()', 'turn_left()'])] },
        { moTa: 'Quay trái bằng ba lần quay phải (chậm hơn hai nhịp)', hamCuaEmMoi: [H('kick_right', ['turn_right()', 'turn_right()', 'turn_right()', 'shoot()', 'wait()', 'turn_right()'])] }
      ],
      loiSai: [
        { moTa: 'Đá xong không quay lại: xe quay mặt sang trái', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('kick_right', ['turn_left()', 'shoot()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không quay mà bắn luôn: xe giật lùi xuống, thùng không nhúc nhích', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('kick_right', T_JET_BACK)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay phải rồi bắn ra trước: xe giật sang trái, xa khỏi thùng', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('kick_right', ['turn_right()', 'shoot()', 'wait()', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi kick_right() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Xe phải giật về phía thùng. Mặt xe quay trái thì bắn ra trước sẽ giật sang phải: thùng nhích một ô, xe theo một ô.', 'Đá xong thì quay lại cho mặt xe như lúc đầu.']
    }),

    man({
      so: 5, ten: 'Bắn van rồi về', hang: 'luyen', hamCuaEmCan: ['forward', 'move', 'turn_left', 'turn_right', 'back'], taoHam: ['tap_right'],
      deBai: 'Cửa chắn đường lên chỗ xe mờ, còn van mở cửa nằm ở tường bên phải xe. Chương trình chính gọi tap_right() rồi forward(2): em tự chế tap_right() để bắn van rồi trở về đúng chỗ cũ, mặt vẫn quay như cũ.',
      veMaMau: 'Chương trình chính bị khóa: tap_right() rồi forward(2). Mở Xưởng hàm, tạo tap_right() rồi bấm Chạy.',
      san: SAN_5, batDau: BD_5X5,
      bongMo: { x: 2, y: 0, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 16, nhip: 6 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('tap_right', T_TAP_RIGHT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('tap_right', nhieu(['# bắn van, tiến lại chỗ cũ'], T_TAP_RIGHT))] },
      congThucKhac: [
        { moTa: 'Quay trái, bắn ra sau trúng van, rồi lùi về và quay phải', hamCuaEmMoi: [H('tap_right', ['turn_left()', 'shoot_back()', 'wait()', 'back()', 'turn_right()'])] },
        { moTa: 'Bắn thêm một phát ra sau để cú giật đưa xe về chỗ cũ', hamCuaEmMoi: [H('tap_right', ['turn_right()', 'shoot()', 'wait()', 'shoot_back()', 'wait()', 'turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Quên tiến lại: cú giật đẩy xe lùi một ô nên xe lệch cột, đâm tường khi đi lên', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('tap_right', ['turn_right()', 'shoot()', 'wait()', 'turn_left()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quay trái rồi bắn ra trước: tia nước bay sang trái, không tới van nên cửa vẫn đóng', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('tap_right', ['turn_left()', 'shoot()', 'wait()', 'move()', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không quay mà bắn luôn: tia nước bay lên tới cửa, không tới van', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('tap_right', T_JET_BACK)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi tap_right() mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Cú giật đẩy xe lùi một ô khỏi chỗ cũ: sau khi bắn phải đưa xe về lại.', 'Chưa về chỗ cũ thì forward(2) không đưa xe lên đúng cột cửa.']
    }),

    man({
      so: 6, ten: 'Đá thùng sang trái', hang: 'luyen', hamCuaEmCan: ['kick_right', 'move', 'turn_left', 'turn_right'], taoHam: ['kick_left'],
      deBai: 'Hai thùng nặng: một ngay bên phải xe, một ở bên trái phía trước. Chương trình chính gọi kick_right(), move() rồi kick_left(): đá xong thùng phải, xe đã theo một ô, tiến một ô là thùng kia nằm ngay bên trái. kick_left() em tự chế để đá nó sang trái.',
      veMaMau: 'Chương trình chính bị khóa: kick_right(), move() rồi kick_left(). Mở Xưởng hàm, tạo kick_left() rồi bấm Chạy.',
      san: SAN_6, batDau: BD_5X5,
      bongMo: { x: 2, y: 1, huong: 0, thung: [{ x: 4, y: 2 }, { x: 1, y: 1 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 18, nhip: 7 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('kick_left', T_KICK_LEFT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('kick_left', nhieu(['# gương của kick_right'], T_KICK_LEFT))] },
      congThucKhac: [
        { moTa: 'Quay trái rồi bắn ra sau: cú giật đẩy xe sang trái, đúng vào thùng', hamCuaEmMoi: [H('kick_left', ['turn_left()', 'shoot_back()', 'wait()', 'turn_right()'])] },
        { moTa: 'Quay phải bằng ba lần quay trái (chậm hơn hai nhịp)', hamCuaEmMoi: [H('kick_left', ['turn_left()', 'turn_left()', 'turn_left()', 'shoot()', 'wait()', 'turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Chép nguyên kick_right(): cú giật lần hai đẩy xe sang phải, thùng bên trái không nhúc nhích', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('kick_left', T_KICK_RIGHT)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đá xong không quay lại: xe quay mặt sang phải', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('kick_left', ['turn_right()', 'shoot()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không quay mà bắn luôn: xe giật lùi xuống, thùng không nhúc nhích', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('kick_left', T_JET_BACK)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi kick_left() mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['kick_left() là gương của kick_right(): quay phải để cú giật đẩy xe sang trái, thùng nhích một ô và xe theo một ô.', 'Quay lại cho mặt xe như lúc đầu rồi mới hết hàm.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Vòi phun lắp ngược', hang: 'bien-the', hamCuaEmCan: ['turn_left', 'turn_right'],
      daoChieu: ['sung'], canhBao: 'Vòi phun lắp ngược',
      deBai: 'Vòi phun bị lắp ngược nên hàm fixed_kick() của màn chạy sai: shoot() bắn ra sau, shoot_back() bắn ra trước. Sửa fixed_kick() để đá thùng bên phải sang phải như thùng mờ, xe theo một ô và giữ hướng như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ gọi fixed_kick(). Hàm fixed_kick() đang giống kick_right() cũ. Thử nó trong sân thử của Xưởng hàm để thấy xe đi đâu.',
      san: SAN_4, batDau: BD_5X5,
      bongMo: { x: 3, y: 2, huong: 0, thung: [{ x: 4, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('fixed_kick', T_FIXED_CU)] },
      sao: { o: 9, nhip: 3 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('fixed_kick', T_FIXED)] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_kick', nhieu(['# vòi phun lắp ngược'], T_FIXED))] } },
      congThucKhac: [
        { moTa: 'Quay phải thay vì quay trái: shoot() lúc này bắn ra sau, xe giật tới đúng vào thùng', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_kick', ['turn_right()', 'shoot()', 'wait()', 'turn_left()'])] } },
        { moTa: 'Thêm một nhịp chờ trước khi quay lại (chậm hơn nhưng vẫn đúng)', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_kick', ['turn_left()', 'shoot_back()', 'wait()', 'wait()', 'turn_right()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hàm của màn: vòi phun ngược nên xe giật sang trái, thùng không nhúc nhích', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_kick', T_FIXED_CU)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ đổi hướng quay mà vẫn dùng shoot_back(): xe lại giật sang trái', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_kick', ['turn_right()', 'shoot_back()', 'wait()', 'turn_left()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi lệnh bắn nhưng quên quay lại: xe quay mặt sang trái', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_kick', ['turn_left()', 'shoot_back()', 'wait()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm fixed_kick() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử gọi shoot() ở sân thử: xe giật tới hay giật lùi?', 'Muốn xe giật sang phải thì đổi một lệnh bắn, hoặc đổi hướng quay.']
    }),

    man({
      so: 8, ten: 'Đầu phun sau hỏng', hang: 'bien-the', hamGoc: KHAY_HONG, phanCung: KHAY_HONG, canhBao: 'Đầu phun sau hỏng',
      hamCuaEmCan: ['u_turn', 'turn_right'], taoHam: ['kick_ahead'],
      deBai: 'Đầu phun sau của vòi phun hỏng nên shoot_back() không chạy được. Thùng nặng nằm ngay trước xe. Chương trình chính gọi kick_ahead(): em tự chế lệnh này để đá thùng nhích lên một ô bằng đầu phun trước, xe theo một ô và quay mặt như cũ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi kick_ahead(). Mở Xưởng hàm, tạo kick_ahead() rồi bấm Chạy. Khay chỉ còn đầu phun trước shoot().',
      san: SAN_8, batDau: BD_5X5,
      bongMo: { x: 2, y: 1, huong: 0, thung: [{ x: 2, y: 0 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice() },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: C_8.slice(), hamCuaEmMoi: [H('kick_ahead', T_KICK_AHEAD)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('kick_ahead', nhieu(['# quay đầu để thùng ở sau xe'], T_KICK_AHEAD))] },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay phải (chậm hơn hai nhịp)', hamCuaEmMoi: [H('kick_ahead', ['turn_right()', 'turn_right()', 'shoot()', 'wait()', 'turn_right()', 'turn_right()'])] },
        { moTa: 'Quay đầu bằng hai lần quay trái (chậm hơn hai nhịp)', hamCuaEmMoi: [H('kick_ahead', ['turn_left()', 'turn_left()', 'shoot()', 'wait()', 'turn_left()', 'turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Dùng shoot_back(): đầu phun sau hỏng nên lệnh không chạy được', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('kick_ahead', T_JET_FWD)], phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Đá xong không quay đầu lại: xe quay mặt xuống', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('kick_ahead', ['u_turn()', 'shoot()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bắn luôn không quay đầu: xe giật lùi xuống, thùng ở trước không nhúc nhích', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('kick_ahead', T_JET_BACK)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi kick_ahead() mà chưa chế hàm', baiLam: { chinh: C_8.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Giật về phía thùng mới đẩy được thùng. Thùng ở trước xe mà chỉ còn đầu phun trước thì phải làm sao cho thùng nằm sau xe.', 'Đá xong thì quay đầu lại cho mặt xe như lúc đầu.']
    }),

    man({
      so: 9, ten: 'Đường về', hang: 'bien-the', hamCuaEmCan: ['jet_fwd', 'turn_left', 'jet_back', 'turn_right'],
      deBai: 'Hàm go_out() của màn đưa xe đi một vòng, tới điểm ◆. Viết thân hàm come_back() của màn để đưa xe về đúng chỗ và hướng xuất phát, như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: go_out() rồi come_back(). Hàm go_out() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm come_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó. Điểm ◆ là chỗ go_out() dừng.',
      san: SAN_TRONG, batDau: BD_9,
      bongMo: { x: 3, y: 1, huong: 0, diQua: [{ x: 1, y: 2 }] },
      chinhCoDinh: true, khoaHamMan: ['go_out'],
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK_TRONG)] },
      sao: { o: 18, nhip: 8 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK)] },
      loiGiaiKhac: { moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', nhieu(['# làm ngược lại go_out()'], T_COME_BACK))] } },
      congThucKhac: [
        { moTa: 'Tiến bằng bánh thay cho jet_fwd(): move() ba lần', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['move()', 'move()', 'turn_left()', 'move()'])] } },
        { moTa: 'Viết thẳng shoot_back() và wait() thay cho jet_fwd()', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['shoot_back()', 'wait()', 'shoot_back()', 'wait()', 'turn_left()', 'shoot_back()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe còn đứng ở chỗ go_out() dừng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Làm lại đúng thứ tự của go_out() (lùi, quay phải, lùi): xe đi xa thêm chứ không về', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_GO_OUT)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi lệnh mà không đảo thứ tự: quay trái trước khi tiến, xe đi sai đường', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['turn_left()', 'jet_fwd()', 'jet_fwd()', 'jet_fwd()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm come_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại go_out() từng bước, theo thứ tự ngược.', 'Mỗi lệnh có một lệnh ngược: lùi bằng giật thì tiến bằng giật, quay phải thì quay trái.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho hàng', hang: 'trum', hamCuaEmCan: ['kick_right', 'kick_left', 'tap_right', 'forward'],
      huyHieu: { ma: 'che-sung-hoi', ten: 'Huy hiệu Chế lệnh vòi phun' },
      gioiHanHam: 4,
      deBai: 'Một thùng nặng bên phải xe, một thùng chắn ngay trước mặt; cửa chắn đường lên chỗ xe mờ, van mở cửa ở tường bên phải. Đá hai thùng như thùng mờ, mở cửa rồi đưa xe tới chỗ xe mờ. Chương trình chính chỉ được gọi 4 hàm của em khác nhau.',
      san: SAN_10, batDau: BD_10,
      bongMo: { x: 3, y: 0, huong: 0, thung: [{ x: 5, y: 4 }, { x: 2, y: 3 }] },
      maMau: { chinh: [] },
      sao: { o: 28, nhip: 14 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# đá hai thùng, mở cửa, đi lên'], L_10) } },
      congThucKhac: [
        { moTa: 'Dùng move() thay cho forward(1) và forward(2): vẫn bốn hàm khác nhau', baiLam: { chinh: ['kick_right()', 'move()', 'kick_left()', 'move()', 'tap_right()', 'move()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Quên mở cửa: xe đâm vào cửa đóng', baiLam: { chinh: ['kick_right()', 'forward(1)', 'kick_left()', 'forward(4)'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Chỉ đá thùng bên phải: thùng kia còn nằm giữa sân', baiLam: { chinh: ['kick_right()', 'forward(2)', 'tap_right()', 'forward(2)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên tiến một ô trước khi bắn van: tia nước bay ngang hàng thùng, không tới van', baiLam: { chinh: ['kick_right()', 'forward(1)', 'kick_left()', 'tap_right()', 'forward(3)'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi 5 hàm khác nhau (kick_right, kick_left, move, tap_right, forward): vượt giới hạn 4 hàm', baiLam: { chinh: ['kick_right()', 'move()', 'kick_left()', 'move()', 'tap_right()', 'forward(2)'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Mỗi lần đá, xe theo thùng một ô: đá thùng phải xong, tiến một ô là thùng kia nằm ngay bên trái. Van nằm ngang xe sau khi tiến thêm một ô nữa.', 'Dùng lại forward() cho cả ba đoạn đi lên thì chỉ cần 4 hàm.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
