/* ============================================================================
   man-che-sung-hoi.js — "Mật Lệnh Robot": CHƯƠNG `che-sung-hoi` · CHẾ LỆNH VÒI PHUN (10 màn, gói 4 mùa 2 chương 2). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5c.3).
   30/10 (user chốt "phun nhẹ là mặc định, lực mạnh mở khoá ở gói 6"): chương dựng lại theo PHUN NHẸ. Các hàm đi bằng cú giật cũ (jet_back, jet_fwd, kick_*, tap_right) bỏ;
   màn sau gói 6 dùng squirt("high") / squirt_back("high") / squirt_left("high") / squirt_right("high") thay cho chúng.
   Robot là XE HAI BÁNH gắn VÒI PHUN hai đầu: robot { than: 'hai-banh', tay: 'hoi', camBien: [] }.
   Lệnh gốc (luật đầy đủ ở san-hoc.js, phần THÙNG NẶNG + SÚNG HƠI), chỉ RA LỆNH, wait() cho nhịp trôi, mỗi nhịp một phát, cặp lệnh ngược spray ↔ spray_back:
       spray() phun ra TRƯỚC · spray_back() phun ra SAU · không đối số = phun nhẹ: tia bay tối đa hai ô, xe không giật · trúng van thì van quay nửa vòng (mở ↔ đóng).
   Luật thiết kế như che-xe và che-nam-cham: lệnh gốc chỉ đổi MỘT trạng thái; động tác hay (phun một phát, phun van bên hông mà giữ hướng, phun van sau lưng khi đầu sau hỏng…)
   là thứ NGƯỜI CHƠI chế. Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (hay `baiLam` cho hàm của màn).

   Mục tiêu `bong-mo` (san-hoc.js, phần BÓNG MỜ): xe phải đứng đúng tư thế "xe mờ" khi chương trình CHẠY XONG; ◆ (bongMo.diQua) là ô xe phải ghé qua. Màn có taoHam:
   chưa chế hàm thì không thắng. `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`), người chơi chỉ sửa / tạo hàm trong Xưởng; 3, 5 và 10 không khóa.

   KHAY: cả chương mở đủ bánh (có bánh lùi) và cả hai đầu phun. Màn 8 là màn HỎNG: khay = phần cứng, thiếu spray_back (đầu phun sau hỏng).
   Hàm của em có sẵn ở chương này: toàn bộ chương trước (move, turn_left, turn_right, u_turn, back, forward(n)…).

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-sung-hoi.1 puff()        = spray(), wait()                                     phun một phát ra trước (1 nhịp)
     che-sung-hoi.2 puff_back()   = spray_back(), wait()                                phun một phát ra sau (1 nhịp)
     che-sung-hoi.4 open_left()   = turn_left(), spray(), wait(), turn_right()          phun van bên trái xe rồi quay lại, giữ hướng (3 nhịp)
     che-sung-hoi.6 open_right()  = turn_right(), spray(), wait(), turn_left()          phun van bên phải xe rồi quay lại, giữ hướng (3 nhịp)
     che-sung-hoi.8 open_behind() = u_turn(), spray(), wait(), u_turn()                 phun van sau lưng bằng đầu trước (đầu sau hỏng), quay mặt như cũ
   HÀM CỦA MÀN (chỉ đúng cho MỘT màn nên không vào kho; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-sung-hoi.7 fixed_open() thân ban đầu = open_left() (vòi lắp ngược nên tia bay sai phía); lời giải đổi spray() thành spray_back()     (daoChieu ['sung'])
     che-sung-hoi.9 go_out() = puff_back(), move(), turn_right(), move() (khóa, xem được); come_back() thân ban đầu `pass`, lời giải back(), turn_left(), back()

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật (nhipTheoLoiGiai: BFS do-duong-che-sung-hoi.mjs luôn ngắn hơn hay bằng); sao.o = ô của lời giải cách 1.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên. Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var KHAY = BANH.concat(['spray', 'spray_back']);                         // khay cả chương
  var KHAY_HONG = BANH.concat(['spray']);                                  // 8: đầu phun sau hỏng (không có spray_back)

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_PUFF = ['spray()', 'wait()'];
  var T_PUFF_BACK = ['spray_back()', 'wait()'];
  var T_OPEN_LEFT = ['turn_left()', 'spray()', 'wait()', 'turn_right()'];
  var T_OPEN_RIGHT = ['turn_right()', 'spray()', 'wait()', 'turn_left()'];
  var T_OPEN_BEHIND = ['u_turn()', 'spray()', 'wait()', 'u_turn()'];
  // 7: thân ban đầu của fixed_open() = open_left() (sai khi vòi lắp ngược) và bản sửa (đổi spray() thành spray_back())
  var T_FIXED_CU = T_OPEN_LEFT.slice();
  var T_FIXED = ['turn_left()', 'spray_back()', 'wait()', 'turn_right()'];
  // 9: go_out() của màn (khóa) và come_back() (thân ban đầu: pass)
  var T_GO_OUT = ['puff_back()', 'move()', 'turn_right()', 'move()'];
  var T_COME_BACK_TRONG = ['pass'];
  var T_COME_BACK = ['back()', 'turn_left()', 'back()'];

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['puff()', 'turn_right()', 'move()', 'move()'];
  var C_2 = ['puff_back()', 'turn_right()', 'move()', 'move()'];
  var C_4 = ['move()', 'open_left()', 'move()', 'move()'];
  var C_6 = ['move()', 'open_right()', 'move()', 'move()'];
  var C_7 = ['move()', 'fixed_open()', 'move()', 'move()'];
  var C_8 = ['open_behind()', 'move()', 'move()'];
  var C_9 = ['go_out()', 'come_back()'];
  // 3 (người chơi tự viết): phun van trước, phun van sau, quay phải đi qua hai cửa
  var L_3 = ['puff()', 'puff_back()', 'turn_right()', 'forward(3)'];
  // 5 (người chơi tự viết): hai ngách phía trên, mỗi ngách một van mở cửa ngay sau nó
  var L_5 = LAP(2, ['move()', 'open_left()', 'move()']);
  // 10 (người chơi tự viết): van sau lưng, van trên ngách, van dưới ngách; ba cửa
  var L_10 = ['puff_back()', 'forward(1)', 'open_left()', 'forward(2)', 'open_right()', 'forward(2)'];

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

  // 1: xe (1,2) quay mặt lên, van (1,0) cách hai ô; cửa (2,2) bên phải; xe mờ (3,2) quay phải
  var SAN_1 = ['#N##', '#.##', '#.C.', '####'];
  var BD_1 = { x: 1, y: 2, huong: 0 };
  // 2: xe (1,1) quay mặt lên sát tường; van (1,3) sau lưng cách hai ô; cửa (2,1) bên phải; xe mờ (3,1) quay phải
  var SAN_2 = ['####', '#.C.', '#.##', '#N##', '####'];
  var BD_2 = { x: 1, y: 1, huong: 0 };
  // 3: xe (1,2) quay mặt lên giữa hành lang đứng; van trên (1,0) mở cửa (2,2), van dưới (1,4) mở cửa (3,2); xe mờ (4,2) quay phải
  var SAN_3 = ['#N####', '#.####', '#.CC.#', '#.####', '#N####', '######'];
  var BD_3 = { x: 1, y: 2, huong: 0 };
  var NOI_3 = [{ nut: { x: 1, y: 0 }, cua: [{ x: 2, y: 2 }], bang: [] }, { nut: { x: 1, y: 4 }, cua: [{ x: 3, y: 2 }], bang: [] }];
  // 4: hành lang ngang, xe (1,2) quay mặt phải; ngách trên ở cột 2 có van (2,0); cửa (3,2); xe mờ (4,2) quay phải
  var SAN_4 = ['##N###', '##.###', '#..C.#', '######'];
  var BD_HL = { x: 1, y: 2, huong: 1 };
  // 5: hành lang ngang, xe (1,2) quay mặt phải; hai ngách trên ở cột 2, 4, van ngách nào mở cửa ngay sau nó (3,2), (5,2); xe mờ (5,2) ở ô cửa cuối
  var SAN_5 = ['##N#N#', '##.#.#', '#..C.C', '######'];
  var NOI_5 = [2, 4].map(function (x) { return { nut: { x: x, y: 0 }, cua: [{ x: x + 1, y: 2 }], bang: [] }; });
  // 6: hành lang ngang, xe (1,1) quay mặt phải; ngách dưới ở cột 2 có van (2,3); cửa (3,1); xe mờ (4,1) quay phải (gương của màn 4)
  var SAN_6 = ['######', '#..C.#', '##.###', '##N###'];
  var BD_6 = { x: 1, y: 1, huong: 1 };
  // 8: hành lang đứng, xe (1,3) quay mặt lên; cửa (1,2) phía trước, van (1,5) sau lưng cách hai ô; xe mờ (1,1) quay lên
  var SAN_8 = ['###', '#.#', '#C#', '#.#', '#.#', '#N#', '###'];
  var BD_8 = { x: 1, y: 3, huong: 0 };
  // 9: xe (2,1) quay mặt lên; van (2,3) sau lưng mở cửa (2,0) phía trước; go_out() đưa xe qua cửa, quay phải, tới ◆ (3,0); come_back() đưa về chỗ cũ
  var SAN_9 = ['##C.#', '##.##', '##.##', '##N##', '#####'];
  var BD_9 = { x: 2, y: 1, huong: 0 };
  // 10: xe (1,2) quay mặt phải; van (0,2) sau lưng mở cửa xa (6,2); van (2,0) ngách trên mở cửa (3,2); van (4,4) ngách dưới mở cửa (5,2); xe mờ (6,2) quay phải
  var SAN_10 = ['##N####', '##.####', 'N..C.CC', '####.##', '####N##', '#######'];
  var BD_10 = { x: 1, y: 2, huong: 1 };
  var NOI_10 = [{ nut: { x: 0, y: 2 }, cua: [{ x: 6, y: 2 }], bang: [] }, { nut: { x: 2, y: 0 }, cua: [{ x: 3, y: 2 }], bang: [] }, { nut: { x: 4, y: 4 }, cua: [{ x: 5, y: 2 }], bang: [] }];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Phun một phát', hang: 'lam-quen', hamCuaEmCan: ['turn_right', 'move'], taoHam: ['puff'],
      deBai: 'Chương trình chính gọi puff() rồi đi qua cửa: em tự chế puff() để phun một phát ra trước, mở cửa cho xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo puff() rồi bấm Chạy.',
      san: SAN_1, batDau: BD_1,
      bongMo: { x: 3, y: 2, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 11, nhip: 4 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('puff', T_PUFF)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('puff', nhieu(['# phun nhẹ một phát'], T_PUFF))] },
      congThucKhac: [
        { moTa: 'Phun xong chờ thêm một nhịp (chậm hơn một nhịp)', hamCuaEmMoi: [H('puff', ['spray()', 'wait()', 'wait()'])] },
        { moTa: 'Chờ một nhịp rồi mới phun (chậm hơn một nhịp)', hamCuaEmMoi: [H('puff', ['wait()', 'spray()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Dùng spray_back(): tia nước bay ra sau trúng tường, cửa vẫn đóng', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('puff', T_PUFF_BACK)], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quên wait(): lệnh phun nằm chung nhịp với lệnh quay', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('puff', ['spray()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Phun hai phát: van quay lại, cửa đóng', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('puff', nhieu(T_PUFF, T_PUFF))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi puff() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Phun một phát là spray() rồi wait().', 'Phun hai phát thì van quay về như cũ.']
    }),

    man({
      so: 2, ten: 'Phun ra sau', hang: 'lam-quen', hamCuaEmCan: ['turn_right', 'move'], taoHam: ['puff_back'],
      deBai: 'Van lần này ở sau lưng xe. Chương trình chính gọi puff_back(): em tự chế lệnh này để phun một phát ra sau, mở cửa cho xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo puff_back() rồi bấm Chạy.',
      san: SAN_2, batDau: BD_2,
      bongMo: { x: 3, y: 1, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 11, nhip: 4 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('puff_back', T_PUFF_BACK)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('puff_back', nhieu(['# phun ra sau'], T_PUFF_BACK))] },
      congThucKhac: [
        { moTa: 'Quay đầu, phun ra trước, quay đầu lại (chậm hơn bốn nhịp)', hamCuaEmMoi: [H('puff_back', ['u_turn()', 'spray()', 'wait()', 'u_turn()'])] },
        { moTa: 'Phun xong chờ thêm một nhịp (chậm hơn một nhịp)', hamCuaEmMoi: [H('puff_back', ['spray_back()', 'wait()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Dùng spray(): tia nước bay lên trúng tường, cửa vẫn đóng', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('puff_back', T_PUFF)], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Phun hai phát: van quay lại, cửa đóng', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('puff_back', nhieu(T_PUFF_BACK, T_PUFF_BACK))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi puff_back() mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['puff_back() chỉ khác puff() ở chữ _back.', 'Van cách đuôi xe hai ô, vừa tầm tia nước.']
    }),

    man({
      so: 3, ten: 'Van trước van sau', hang: 'lam-quen', hamCuaEmCan: ['puff', 'puff_back', 'turn_right', 'forward'],
      deBai: 'Hai cửa nối tiếp bên phải xe. Van phía trước mở cửa gần, van phía sau mở cửa xa. Dùng puff() và puff_back() em đã chế, rồi đưa xe tới chỗ xe mờ.',
      san: SAN_3, batDau: BD_3, noi: NOI_3,
      bongMo: { x: 4, y: 2, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 15, nhip: 6 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# hai van, hai cửa'], L_3) } },
      congThucKhac: [
        { moTa: 'Phun van sau trước rồi mới tới van trước', baiLam: { chinh: ['puff_back()', 'puff()', 'turn_right()', 'forward(3)'] } },
        { moTa: 'Đi qua cửa bằng ba lần move()', baiLam: { chinh: ['puff()', 'puff_back()', 'turn_right()', 'move()', 'move()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Chỉ phun van trước: cửa xa còn đóng', baiLam: { chinh: ['puff()', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Phun van trước hai lần: cửa gần mở rồi lại đóng', baiLam: { chinh: ['puff()', 'puff()', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Van nào mở cửa nào: van trước cửa gần, van sau cửa xa.', 'Mở cả hai cửa rồi mới quay phải đi.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Van bên trái', hang: 'luyen', hamCuaEmCan: ['move', 'turn_left', 'turn_right'], taoHam: ['open_left'],
      deBai: 'Van nằm trong ngách phía bên trái xe. Chương trình chính gọi open_left(): em tự chế lệnh này để phun van bên trái rồi quay lại hướng cũ, cho xe đi tiếp qua cửa.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo open_left() rồi bấm Chạy.',
      san: SAN_4, batDau: BD_HL,
      bongMo: { x: 4, y: 2, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 15, nhip: 6 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('open_left', T_OPEN_LEFT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('open_left', nhieu(['# quay trái, phun, quay lại'], T_OPEN_LEFT))] },
      congThucKhac: [
        { moTa: 'Quay phải rồi phun ra sau: tia nước cũng bay sang trái', hamCuaEmMoi: [H('open_left', ['turn_right()', 'spray_back()', 'wait()', 'turn_left()'])] },
        { moTa: 'Gọi puff() đã chế thay cho spray() và wait()', hamCuaEmMoi: [H('open_left', ['turn_left()', 'puff()', 'turn_right()'])] }
      ],
      loiSai: [
        { moTa: 'Phun xong không quay lại: xe đi lên ngách, đâm vào van', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('open_left', ['turn_left()', 'spray()', 'wait()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Không quay mà phun luôn: tia nước trúng cửa đóng', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('open_left', T_PUFF)], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quay phải rồi phun ra trước: tia nước bay sang phải trúng tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('open_left', T_OPEN_RIGHT)], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi open_left() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Quay trái thì mũi xe hướng vào ngách.', 'Phun xong thì quay lại cho mặt xe như lúc đầu.']
    }),

    man({
      so: 5, ten: 'Hai ngách một hàng', hang: 'luyen', hamCuaEmCan: ['move', 'open_left'],
      deBai: 'Hai ngách phía trên hành lang, mỗi ngách có một van mở cánh cửa ngay sau nó. Dùng open_left() em đã chế trong một vòng for, rồi đưa xe tới chỗ xe mờ.',
      san: SAN_5, batDau: BD_HL, noi: NOI_5,
      bongMo: { x: 5, y: 2, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 15, nhip: 10 },
      loiGiai: { chinh: L_5.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích trong vòng for', baiLam: { chinh: LAP(2, ['# một ngách, một cửa', 'move()', 'open_left()', 'move()']) } },
      congThucKhac: [
        { moTa: 'Viết thẳng hai lượt, không dùng for', baiLam: { chinh: ['move()', 'open_left()', 'move()', 'move()', 'open_left()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Lặp một lần: cửa thứ hai còn đóng', baiLam: { chinh: nhieu(LAP(1, ['move()', 'open_left()', 'move()']), ['move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quên open_left() trong vòng for: xe đâm cửa thứ nhất', baiLam: { chinh: LAP(2, ['move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Một lượt: tiến một ô tới dưới ngách, open_left(), tiến một ô qua cửa.', 'Lặp hai lượt.']
    }),

    man({
      so: 6, ten: 'Van bên phải', hang: 'luyen', hamCuaEmCan: ['move', 'turn_left', 'turn_right'], taoHam: ['open_right'],
      deBai: 'Lần này van nằm trong ngách bên phải xe. Chương trình chính gọi open_right(): em tự chế lệnh này để phun van bên phải rồi quay lại hướng cũ, cho xe đi tiếp qua cửa.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo open_right() rồi bấm Chạy.',
      san: SAN_6, batDau: BD_6,
      bongMo: { x: 4, y: 1, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 15, nhip: 6 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('open_right', T_OPEN_RIGHT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('open_right', nhieu(['# gương của open_left'], T_OPEN_RIGHT))] },
      congThucKhac: [
        { moTa: 'Quay trái rồi phun ra sau: tia nước cũng bay sang phải', hamCuaEmMoi: [H('open_right', ['turn_left()', 'spray_back()', 'wait()', 'turn_right()'])] },
        { moTa: 'Gọi puff() đã chế thay cho spray() và wait()', hamCuaEmMoi: [H('open_right', ['turn_right()', 'puff()', 'turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Chép nguyên open_left(): tia nước bay lên trúng tường, van bên phải không đổi', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('open_right', T_OPEN_LEFT)], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Phun xong không quay lại: xe đi xuống ngách, đâm vào van', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('open_right', ['turn_right()', 'spray()', 'wait()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi open_right() mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['open_right() là gương của open_left(): quay phải, phun, quay trái.', 'Quay lại cho mặt xe như lúc đầu rồi mới hết hàm.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Vòi phun lắp ngược', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      daoChieu: ['sung'], canhBao: 'Vòi phun lắp ngược',
      deBai: 'Vòi phun bị lắp ngược: spray() phun ra sau, spray_back() phun ra trước. Hàm fixed_open() của màn đang chép open_left() nên tia nước bay sai phía. Sửa fixed_open() để mở van bên trái.',
      veMaMau: 'Chương trình chính bị khóa, gọi fixed_open(). Thử hàm trong sân thử của Xưởng hàm để thấy tia nước bay về đâu.',
      san: SAN_4, batDau: BD_HL,
      bongMo: { x: 4, y: 2, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('fixed_open', T_FIXED_CU)] },
      sao: { o: 15, nhip: 6 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('fixed_open', T_FIXED)] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_open', nhieu(['# vòi phun lắp ngược'], T_FIXED))] } },
      congThucKhac: [
        { moTa: 'Quay phải thay vì quay trái: spray() lúc này phun ra sau, tia nước bay sang trái', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_open', ['turn_right()', 'spray()', 'wait()', 'turn_left()'])] } },
        { moTa: 'Thêm một nhịp chờ trước khi quay lại (chậm hơn nhưng vẫn đúng)', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_open', ['turn_left()', 'spray_back()', 'wait()', 'wait()', 'turn_right()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hàm của màn: vòi ngược nên tia nước bay xuống trúng tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_open', T_FIXED_CU)] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Chỉ đổi hướng quay mà vẫn dùng spray_back(): tia nước lại bay sai phía', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_open', ['turn_right()', 'spray_back()', 'wait()', 'turn_left()'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hàm fixed_open() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử gọi spray() ở sân thử: tia nước bay ra trước hay ra sau?', 'Đổi một lệnh phun, hoặc đổi hướng quay.']
    }),

    man({
      so: 8, ten: 'Đầu phun sau hỏng', hang: 'bien-the', hamGoc: KHAY_HONG, phanCung: KHAY_HONG, canhBao: 'Đầu phun sau hỏng',
      hamCuaEmCan: ['u_turn', 'move'], taoHam: ['open_behind'],
      deBai: 'Đầu phun sau hỏng nên spray_back() không chạy được, mà van lại ở sau lưng xe. Chương trình chính gọi open_behind(): em tự chế lệnh này để phun van sau lưng bằng đầu phun trước, quay mặt như cũ.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo open_behind() rồi bấm Chạy. Khay chỉ còn đầu phun trước spray().',
      san: SAN_8, batDau: BD_8,
      bongMo: { x: 1, y: 1, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice() },
      sao: { o: 13, nhip: 5 },
      loiGiai: { chinh: C_8.slice(), hamCuaEmMoi: [H('open_behind', T_OPEN_BEHIND)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('open_behind', nhieu(['# quay đầu để van ở trước mũi'], T_OPEN_BEHIND))] },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay phải', hamCuaEmMoi: [H('open_behind', ['turn_right()', 'turn_right()', 'spray()', 'wait()', 'turn_right()', 'turn_right()'])] },
        { moTa: 'Gọi puff() đã chế thay cho spray() và wait()', hamCuaEmMoi: [H('open_behind', ['u_turn()', 'puff()', 'u_turn()'])] }
      ],
      loiSai: [
        { moTa: 'Dùng spray_back(): đầu phun sau hỏng nên lệnh không chạy được', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('open_behind', T_PUFF_BACK)], phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Phun xong không quay đầu lại: xe đi xuống, đâm vào van', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('open_behind', ['u_turn()', 'spray()', 'wait()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Phun luôn không quay đầu: tia nước trúng cửa đóng', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('open_behind', T_PUFF)], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi open_behind() mà chưa chế hàm', baiLam: { chinh: C_8.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Chỉ còn đầu phun trước: phải làm sao cho van nằm trước mũi xe.', 'Phun xong thì quay đầu lại cho mặt xe như lúc đầu.']
    }),

    man({
      so: 9, ten: 'Đường về', hang: 'bien-the', hamCuaEmCan: ['puff_back', 'move', 'turn_right', 'back', 'turn_left'],
      deBai: 'Hàm go_out() của màn phun mở cửa rồi đưa xe đi tới điểm ◆. Viết thân hàm come_back() của màn để đưa xe về đúng chỗ và hướng xuất phát, như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: go_out() rồi come_back(). Hàm go_out() cũng bị khóa, em chỉ xem được thân hàm. Thân come_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó.',
      san: SAN_9, batDau: BD_9,
      bongMo: { x: 2, y: 1, huong: 0, diQua: [{ x: 3, y: 0 }] },
      chinhCoDinh: true, khoaHamMan: ['go_out'],
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK_TRONG)] },
      sao: { o: 21, nhip: 7 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK)] },
      loiGiaiKhac: { moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', nhieu(['# làm ngược lại go_out()'], T_COME_BACK))] } },
      congThucKhac: [
        { moTa: 'Quay đầu rồi đi tiến về chỗ cũ, cuối cùng quay đầu lại', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['u_turn()', 'move()', 'turn_left()', 'move()', 'u_turn()'])] } },
        { moTa: 'Viết thẳng hai bánh lùi thay cho back()', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['left_back()', 'right_back()', 'wait()', 'turn_left()', 'left_back()', 'right_back()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe còn đứng ở chỗ go_out() dừng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi lệnh mà không đảo thứ tự: quay trái trước khi lùi, xe đi sai đường', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['turn_left()', 'back()', 'back()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Làm lại đúng thứ tự của go_out(): xe đi xa thêm chứ không về', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['move()', 'turn_right()', 'move()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm come_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_out', T_GO_OUT)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại go_out() từng bước, theo thứ tự ngược: tiến thì lùi, quay phải thì quay trái.', 'Cửa đã mở rồi, không cần phun lại van.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Ba van ba cửa', hang: 'trum', hamCuaEmCan: ['puff_back', 'open_left', 'open_right', 'forward'],
      huyHieu: { ma: 'che-sung-hoi', ten: 'Huy hiệu Chế lệnh vòi phun' },
      gioiHanHam: 4,
      deBai: 'Ba cửa trên hành lang, ba van ở ba phía: sau lưng xe, trong ngách trên và trong ngách dưới. Mở cả ba rồi đưa xe tới chỗ xe mờ. Chương trình chính chỉ được gọi 4 hàm của em khác nhau.',
      san: SAN_10, batDau: BD_10, noi: NOI_10,
      bongMo: { x: 6, y: 2, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 25, nhip: 12 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# ba van, ba cửa'], L_10) } },
      congThucKhac: [
        { moTa: 'Đi bằng move() thay cho forward(): vẫn bốn hàm khác nhau', baiLam: { chinh: ['puff_back()', 'move()', 'open_left()', 'move()', 'move()', 'open_right()', 'move()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Quên van sau lưng: cửa cuối còn đóng', baiLam: { chinh: ['forward(1)', 'open_left()', 'forward(2)', 'open_right()', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Phun ngách dưới bằng open_left(): tia nước bay lên trúng tường', baiLam: { chinh: ['puff_back()', 'forward(1)', 'open_left()', 'forward(2)', 'open_left()', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi 5 hàm khác nhau (puff_back, move, forward, open_left, open_right): vượt giới hạn 4 hàm', baiLam: { chinh: ['puff_back()', 'move()', 'open_left()', 'forward(2)', 'open_right()', 'forward(2)'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Van sau lưng cách đuôi xe một ô: phun ngay ở chỗ xuất phát.', 'Ngách trên dùng open_left(), ngách dưới dùng open_right().']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
