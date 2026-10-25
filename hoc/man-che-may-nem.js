/* ============================================================================
   man-che-may-nem.js — "Robot Chấn Hưng": CHƯƠNG `che-may-nem` · CHẾ LỆNH MÁY NÉM (10 màn). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5c.5, 15/10): chương chế lệnh đi sau chương `may-nem`.
   Robot là XE HAI BÁNH gắn MÁY NÉM ở mũi xe: robot { than: 'hai-banh', tay: 'nem', camBien: [] | [{ ma: 'camera', o: 'tren' }] (6: camera nhìn ô trước mặt) | [{ ma: 'khoang-cach', o: 'hong' }] (10) }.
   Lệnh gốc (luật đầy đủ ở san-hoc.js, phần MÁY NÉM):
       aim(n)   đặt tầm n = 1, 2 hay 3 ô (có hiệu lực NGAY, không tốn nhịp)      load()   nạp vật ở Ô TRƯỚC MẶT vào rổ (rổ chứa một vật)      throw()   ném vật trong rổ
   load() và throw() chỉ RA LỆNH, wait() cho nhịp trôi; mỗi nhịp tay nhận MỘT lệnh (một bộ phận một lệnh mỗi nhịp) và nhịp có load() hay throw() thì xe đứng yên.
   Vật ném bay QUA hàng rào '=' và tường '#', rơi xuống ô cách xe đúng tầm; ô rơi là tường, hàng rào, ngoài sân hay đã có vật khác thì vật VỠ. Vật nằm đất CHIẾM Ô (xe không đi vào).
   Luật thiết kế như che-xe, che-tay và che-nam-cham: lệnh gốc chỉ đổi MỘT trạng thái; động tác hay (ném thẳng, ném sang bên, ném tiếp sức, ném ra sau lưng, chia theo màu…) là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (hay `baiLam` cho hàm của màn).

   MỤC TIÊU. Chế lệnh (1, 2, 4, 5, 6, 7, 9, 10): 'bong-mo' — xe phải đứng đúng tư thế "xe mờ" khi chương trình CHẠY XONG và VẬT MỜ cho biết mỗi vật phải nằm ở ô nào (vật có màu thì chấm theo màu).
   Lý do: việc ở đây là biến vật từ chỗ cũ sang chỗ mới VÀ trả xe về tư thế nhất định (lệnh chế phải "gọn", xe giữ chỗ và hướng), nên bóng mờ nói đúng cả hai điều; 'dua-vat' chỉ xét vật.
   3 (dùng) là 'dua-vat': người chơi tự viết chương trình chính, việc chỉ là đưa mọi vật vào ô đích, xe đứng đâu cũng được. `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`),
   người chơi chỉ sửa / tạo hàm trong Xưởng; 3, 8 và 10 không khóa: người chơi tự viết chương trình chính.

   KHAY: cả chương mở đủ bánh (có bánh lùi), aim, throw, load. Màn 6 thêm color() (xe gắn camera: color() là màu thứ ở ô TRƯỚC MẶT, nơi load() lấy vật), màn 10 thêm front_clear() (cho go_wall()).
   Màn 8 là màn HỎNG: khay = phần cứng, chỉ còn left_move (bánh trái tiến) và wait: xe chỉ QUAY PHẢI được (không đi, không lùi, không quay trái, không quay đầu).
   Hàm của em có sẵn ở chương này: toss(n) = aim(n), throw(), wait() (chương may-nem), cùng toàn bộ chương trước (move, u_turn một nhịp, forward(n), right(k), back, go_wall…).

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-may-nem.1 launch(n)      = load(), wait(), toss(n)                                               nạp vật trước mặt rồi ném thẳng ra xa n ô (2 nhịp)
     che-may-nem.2 side_throw(n)  = load(), wait(), turn_right(), toss(n), turn_left()                    nạp vật trước mặt, quay phải, ném sang phải n ô, quay về (4 nhịp)
     che-may-nem.4 carry_throw(k) = load(), wait(), forward(k), toss(3)                                   nạp vật, CHỞ vật trong rổ đi k ô rồi ném ra xa ba ô (k + 2 nhịp)
     che-may-nem.5 toss_back(n)   = load(), wait(), u_turn(), toss(n), u_turn()                           nạp vật trước mặt rồi ném ra sau lưng n ô, xe giữ ô và hướng (4 nhịp)
     che-may-nem.6 split()        = if color() == "red": side_throw(2) else: load(), wait(), turn_left(), toss(2), turn_right()      vật đỏ sang phải, vật xanh dương sang trái, đều ở ô thứ hai (đúng 8 dòng)
   HÀM CỦA MÀN (15/10: hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-may-nem.7 fixed_toss(n)  thân ban đầu = aim(n - 1), throw(), wait() (máy ném đặt lệch một ô); lời giải aim(n), throw(), wait()
     che-may-nem.9 go_load()      = move(), move(), turn_right(), move(), load(), wait() (khóa, xem được); undo_load() thân ban đầu `pass`, lời giải toss(1), back(), turn_left(), back(), back()
                                   đi NGƯỢC lại go_load(): nạp ↔ ném (ném tầm 1 trả vật về ô nó vừa nằm), tiến ↔ lùi, phải ↔ trái

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật (= BFS do-duong-che-may-nem.mjs: load / throw mỗi lệnh đúng một nhịp riêng, không gộp với lệnh bánh); sao.o = ô của lời giải cách 1.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var NEM = ['aim', 'throw', 'load'];
  var KHAY = BANH.concat(NEM);                                                       // khay cả chương
  var KHAY_MAU = KHAY.concat(['color']);                                             // 6: camera → color()
  var KHAY_KC = KHAY.concat(['front_clear']);                                        // 10: cảm biến khoảng cách → go_wall()
  var KHAY_HONG = ['left_move', 'wait'].concat(NEM);                                 // 8: bánh phải hỏng hẳn, bánh trái chỉ còn quay tới → xe chỉ quay phải được

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_LAUNCH = ['load()', 'wait()', 'toss(n)'];
  var T_SIDE = ['load()', 'wait()', 'turn_right()', 'toss(n)', 'turn_left()'];
  var T_CARRY = ['load()', 'wait()', 'forward(k)', 'toss(3)'];
  var T_BACK = ['load()', 'wait()', 'u_turn()', 'toss(n)', 'u_turn()'];
  var T_SPLIT = ['if color() == "red":', '    side_throw(2)', 'else:', '    load()', '    wait()', '    turn_left()', '    toss(2)', '    turn_right()'];
  function hLaunch(than) { return H('launch', ['n'], than || T_LAUNCH); }
  function hSide(than) { return H('side_throw', ['n'], than || T_SIDE); }
  function hCarry(than) { return H('carry_throw', ['k'], than || T_CARRY); }
  function hBack(than) { return H('toss_back', ['n'], than || T_BACK); }
  function hSplit(than) { return H('split', [], than || T_SPLIT); }
  // 7: fixed_toss(n) của màn đặt tầm lệch một ô (n - 1) → sửa thành n
  var T_FIXED_CU = ['aim(n - 1)', 'throw()', 'wait()'];
  var T_FIXED = ['aim(n)', 'throw()', 'wait()'];
  function hFixed(than) { return H('fixed_toss', ['n'], than || T_FIXED); }
  // 9: go_load() của màn (khóa) và undo_load() (thân ban đầu: pass)
  var T_GO_LOAD = ['move()', 'move()', 'turn_right()', 'move()', 'load()', 'wait()'];
  var T_UNDO_TRONG = ['pass'];
  var T_UNDO = ['toss(1)', 'back()', 'turn_left()', 'back()', 'back()'];

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['launch(3)'];
  var C_2 = ['side_throw(3)'];
  var C_4 = ['carry_throw(2)'];
  var C_5 = ['toss_back(3)'];
  var C_6 = ['split()'];
  var C_7 = ['load()', 'wait()', 'fixed_toss(3)', 'turn_right()', 'load()', 'wait()', 'fixed_toss(2)', 'turn_left()'];
  var C_9 = ['go_load()', 'undo_load()'];
  // 3 (người chơi tự viết): vật phía trước cho bay sang phải, đi lên, ném vật kế thẳng lên, quay phải ném vật bên hông
  var L_3 = ['side_throw(3)', 'forward(3)', 'launch(3)', 'turn_right()', 'launch(3)'];
  // 8 (người chơi tự viết): chỉ quay phải được: ném vật xanh ra xa, quay ba lần (= quay trái) tới vật đỏ, nạp, quay phải, thả vào chỗ vật xanh vừa trống
  var L_8 = ['turn_right()', 'launch(3)', 'right(3)', 'load()', 'wait()', 'turn_right()', 'toss(1)'];
  // 10 (người chơi tự viết): lặp ba lần: đi tới sát vật kế, ném sang trái; tầm giảm dần 3, 2, 1
  var L_10 = ['for i in range(3):', '    go_wall()', '    side_throw(3 - i)'];

  /**
   * m.cb: 'mau' (camera + color(), màn 6) | 'kc' (cảm biến khoảng cách + front_clear, màn 10) | không có. Màn nhiều sân (san là mảng sân) tự có nhipTheo 'tong' và batDau song song.
   */
  function man(m) {
    var cb = m.cb;
    delete m.cb;
    m.chuong = 'che-may-nem';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'nem', camBien: cb === 'mau' ? [{ ma: 'camera', o: 'tren' }] : cb === 'kc' ? [{ ma: 'khoang-cach', o: 'hong' }] : [] };
    m.hamGoc = m.hamGoc || (cb === 'mau' ? KHAY_MAU : cb === 'kc' ? KHAY_KC : KHAY);
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'bong-mo';
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: xe (2,5) quay lên; vật ở ô 1 (2,4); ô 2 là hàng rào trong dãy tường; vật mờ ở ô 3 (2,2)
  var SAN_1 = ['.....', '.....', '.....', '##=##', '..o..', '.....'];
  var BD_1 = { x: 2, y: 5, huong: 0 };
  // 2: xe (1,3) quay lên; vật ở ô 1 (1,2); bên phải xe: ô 1 hàng rào (2,3), ô 2 tường (3,3), ô 3 là vật mờ (4,3)
  var SAN_2 = ['.....', '.....', '.o...', '..=#.', '.....'];
  var BD_2 = { x: 1, y: 3, huong: 0 };
  // 3: xe (1,6) quay lên; vật A (1,5) ngay trước mũi; B (1,2) và C (2,3) ở chỗ xe sẽ đứng (1,3); ba đích: (4,6) bên phải xe sau hàng rào và tường, (1,0) sau hàng rào, (4,3) sau hàng rào
  var SAN_3 = ['.D...', '.=...', '.o...', '..o=D', '.....', '.o...', '..=#D'];
  var BD_3 = { x: 1, y: 6, huong: 0 };
  // 4: xe (2,7) quay lên; vật ở ô 1 (2,6); vật mờ cách xa 4 ô ở (2,2), xe mờ ở (2,5); hàng rào (2,3)
  var SAN_4 = ['.....', '.....', '.....', '..=..', '.....', '.....', '..o..', '.....'];
  var BD_4 = { x: 2, y: 7, huong: 0 };
  // 5: xe (2,2) quay lên; vật ở ô 1 (2,1); phía sau lưng xe: hàng rào (2,3), tường (2,4), vật mờ ở ô thứ ba (2,5)
  var SAN_5 = ['.....', '..o..', '.....', '..=..', '..#..', '.....', '.....'];
  var BD_5 = { x: 2, y: 2, huong: 0 };
  // 6: ba sân giống nhau, chỉ khác màu vật: xe (2,3) quay lên, vật (2,2) ngay trước mũi; hai bên xe: hàng rào ô 1, vật mờ ô 2, ô 3 ra ngoài sân (vỡ)
  var SAN_6 = ['.....', '.....', '..o..', '.=.=.', '.....'];
  var VMAU_6 = [['.....', '.....', '..r..', '.....', '.....'], ['.....', '.....', '..b..', '.....', '.....'], ['.....', '.....', '..b..', '.....', '.....']];
  var BD_6 = { x: 2, y: 3, huong: 0 };
  // 7: xe (2,3) quay lên; A (2,2) ngay trước mũi, hàng rào (2,1), ô 3 (2,0) là vật mờ; B (3,3) bên phải xe, vật mờ ở ô 2 (4,3), ô 3 (5,3) là tường
  var SAN_7 = ['......', '..=...', '..o...', '...o.#'];
  var BD_7 = { x: 2, y: 3, huong: 0 };
  // 8: xe (3,3) quay lên; vật đỏ ở (3,2) trước mũi, vật xanh dương ở (4,3) bên phải xe; bên phải: hàng rào ô 2 (5,3), ô 3 (6,3) là vật mờ xanh dương; ô 1 (4,3) sẽ là chỗ vật mờ đỏ
  var SAN_8 = ['.......', '.......', '...o...', '....o=.', '.......'];
  var VMAU_8 = ['.......', '.......', '...r...', '....b..', '.......'];
  var BD_8 = { x: 3, y: 3, huong: 0 };
  // 9: xe (1,4) quay lên; vật ở (3,2); go_load() đưa xe tới (2,2) quay phải (◆) và nạp vật
  var SAN_9 = ['.....', '.....', '...o.', '.....', '.....'];
  var BD_9 = { x: 1, y: 4, huong: 0 };
  // 10: ba sân 6×7; xe (1,6) quay LÊN ở đầu lối đi thẳng đứng (cột 1), ba vật dọc cột 1 cách nhau khác nhau (ys, từ dưới lên); xe dừng sát dưới từng vật (hàng ys[i] + 1) rồi ném sang phải (đông):
  // ô 1 là hàng rào, ô 2 và ô 3 là tường, trừ ô đúng tầm (vật đầu tầm 3, vật giữa tầm 2, vật cuối tầm 1) là sàn nơi vật mờ nằm — tầm sai thì vật vỡ (hoặc, tầm 1, rơi lại chỗ cũ)
  function san10(ys) {
    var rows = ['......', '......', '......', '......', '......', '......', '......'], bm = [];
    function dat(x, y, c) { rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1); }
    ys.forEach(function (y, i) {
      var tam = 3 - i, yx = y + 1;                                       // xe đứng sát dưới vật (ô y + 1) lúc ném: vật bay sang bên theo HÀNG CỦA XE
      dat(1, y, 'o');
      for (var k = 1; k <= 3; k++) { if (k !== tam) dat(1 + k, yx, k === 1 ? '=' : '#'); }
      bm.push({ x: 1 + tam, y: yx });
    });
    return { rows: rows, bm: bm, cuoi: ys[2] + 1 };
  }
  var S10 = [san10([5, 3, 0]), san10([4, 2, 0]), san10([5, 2, 1])];
  var SAN_10 = S10.map(function (x) { return x.rows; });
  var BD_10 = { x: 1, y: 6, huong: 0 };
  var BM_10 = S10.map(function (x) { return { x: 1, y: x.cuoi, huong: 0, vat: x.bm }; });

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Ném thẳng', hang: 'lam-quen', hamCuaEmCan: ['toss'], taoHam: ['launch'],
      deBai: 'Một vật nằm sát trước mũi xe, phía trước nó là một hàng rào. Chương trình chính chỉ gọi launch(3): em tự chế lệnh này để nạp vật vào rổ rồi ném vật bay qua hàng rào, rơi cách xe ba ô như vật mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi launch(3). Mở Xưởng hàm, tạo launch(n) rồi bấm Chạy.',
      san: SAN_1,
      batDau: BD_1,
      bongMo: { x: 2, y: 5, huong: 0, vat: [{ x: 2, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 7, nhip: 2 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [hLaunch()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [hLaunch(nhieu(['# nạp rồi ném thẳng'], T_LAUNCH))]
      },
      congThucKhac: [
        { moTa: 'Không dùng toss(n): tự đặt tầm rồi ném (nhiều ô hơn)', hamCuaEmMoi: [hLaunch(['load()', 'wait()', 'aim(n)', 'throw()', 'wait()'])] },
        { moTa: 'Chờ thêm một nhịp sau khi nạp (chậm hơn một nhịp)', hamCuaEmMoi: [hLaunch(['load()', 'wait()', 'wait()', 'toss(n)'])] }
      ],
      loiSai: [
        { moTa: 'Quên nạp vật: rổ trống nên throw() không ném gì', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hLaunch(['toss(n)'])], phaiCoMa: ['nem-hut', 'lech-bong-mo'] },
        { moTa: 'Quên wait() sau load(): lệnh ném bị bỏ vì một nhịp tay chỉ nhận một lệnh', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hLaunch(['load()', 'toss(n)'])], phaiCoMa: ['nem-goi-lai', 'lech-bong-mo'] },
        { moTa: 'Đặt tầm cố định 2 thay vì n: vật rơi vào hàng rào nên vỡ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hLaunch(['load()', 'wait()', 'toss(2)'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Nạp xong chỉ đặt tầm, quên ném: vật vẫn nằm trong rổ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hLaunch(['load()', 'wait()', 'aim(n)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi launch(3) mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Nạp vật vào rổ trước, nhớ wait() để nhịp trôi. Ném thì em đã có toss(n).', 'Đếm từ xe: ô một là chỗ vật nằm, ô hai là hàng rào, ô ba là chỗ vật mờ.']
    }),

    man({
      so: 2, ten: 'Ném sang bên', hang: 'lam-quen', hamCuaEmCan: ['toss', 'turn_right', 'turn_left'], taoHam: ['side_throw'],
      deBai: 'Vật nằm sát trước mũi xe, còn vật mờ nằm bên phải xe, cách ba ô, sau hàng rào và tường. Chế lệnh side_throw(n): nạp vật, quay sang phải, ném tới ô cách xe n ô rồi quay về. Xe giữ nguyên chỗ và hướng như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi side_throw(3). Mở Xưởng hàm, tạo side_throw(n) rồi bấm Chạy.',
      san: SAN_2,
      batDau: BD_2,
      bongMo: { x: 1, y: 3, huong: 0, vat: [{ x: 4, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 13, nhip: 4 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [hSide()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [hSide(nhieu(['# nạp, quay phải, ném, quay về'], T_SIDE))]
      },
      congThucKhac: [
        { moTa: 'Không dùng toss(n): tự đặt tầm rồi ném (nhiều ô hơn)', hamCuaEmMoi: [hSide(['load()', 'wait()', 'turn_right()', 'aim(n)', 'throw()', 'wait()', 'turn_left()'])] },
        { moTa: 'Quay phải bằng ba lần quay trái (chậm hơn hai nhịp)', hamCuaEmMoi: [hSide(['load()', 'wait()', 'turn_left()', 'turn_left()', 'turn_left()', 'toss(n)', 'turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Chuyền xong không quay về: xe quay mặt sang phải', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSide(['load()', 'wait()', 'turn_right()', 'toss(n)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay nhầm sang trái: vật bay ra ngoài sân nên vỡ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSide(['load()', 'wait()', 'turn_left()', 'toss(n)', 'turn_right()'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Ném luôn không quay sang phải: vật bay thẳng lên phía trên', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSide(['load()', 'wait()', 'toss(n)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên nạp vật: rổ trống nên throw() không ném gì', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSide(['turn_right()', 'toss(n)', 'turn_left()'])], phaiCoMa: ['nem-hut', 'lech-bong-mo'] },
        { moTa: 'Gọi side_throw(3) mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Nạp vật khi xe còn quay mặt lên. Muốn ném sang phải thì xe phải quay mặt sang phải trước.', 'Ném xong, xe quay mặt lên lại như xe mờ.']
    }),

    man({
      so: 3, ten: 'Dọn kho', hang: 'lam-quen', mucTieu: 'dua-vat',
      hamCuaEmCan: ['launch', 'side_throw', 'forward', 'turn_right'],
      deBai: 'Ba vật nằm rải rác trong kho nhỏ, mỗi vật phải bay qua hàng rào tới một ô đích. Dùng launch() và side_throw() em đã chế, cùng forward() và turn_right(), để đưa cả ba vật vào đích. Chương trình chỉ có 10 ô.',
      san: SAN_3,
      batDau: BD_3,
      maMau: { chinh: [] },
      sao: { o: 25, nhip: 12 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# vật trước mũi sang phải, rồi hai vật còn lại'], L_3) } },
      congThucKhac: [
        { moTa: 'Đi lên bằng ba lần move() thay cho forward(3) (nhiều ô hơn)', baiLam: { chinh: ['side_throw(3)', 'move()', 'move()', 'move()', 'launch(3)', 'turn_right()', 'launch(3)'] } },
        { moTa: 'Ném vật bên hông trước, vật thẳng sau (quay phải rồi quay trái)', baiLam: { chinh: ['side_throw(3)', 'forward(3)', 'turn_right()', 'launch(3)', 'turn_left()', 'launch(3)'] } }
      ],
      loiSai: [
        { moTa: 'Quên đi lên: chỗ xe đứng trước mặt không còn vật nào để nạp', baiLam: { chinh: ['side_throw(3)', 'launch(3)'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tầm 2 cho vật đầu tiên: vật rơi vào tường nên vỡ', baiLam: { chinh: ['side_throw(2)', 'forward(3)', 'launch(3)', 'turn_right()', 'launch(3)'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên quay phải trước khi ném vật bên hông: vật nằm bên hông không ở trước mũi xe', baiLam: { chinh: ['side_throw(3)', 'forward(3)', 'launch(3)', 'launch(3)'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ đi lên hai ô: vật kế còn cách mũi xe hai ô nên không nạp được', baiLam: { chinh: ['side_throw(3)', 'forward(2)', 'launch(3)', 'turn_right()', 'launch(3)'] }, phaiCoMa: ['nap-hut', 'chua-dua-vat'] },
        { moTa: 'Viết thẳng từng lệnh, không dùng hàm đã chế: quá 10 ô', baiLam: { chinh: ['load()', 'wait()', 'turn_right()', 'aim(3)', 'throw()', 'wait()', 'turn_left()', 'forward(3)', 'load()', 'wait()', 'toss(3)', 'turn_right()', 'load()', 'wait()', 'toss(3)'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi lần nạp, vật phải nằm sát trước mũi xe. Muốn nạp vật khác thì xe phải đi tới hoặc quay mặt về phía nó.', 'Ném sang bên thì có side_throw(), ném thẳng thì có launch().']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Chở rồi ném', hang: 'luyen', hamCuaEmCan: ['toss', 'forward'], taoHam: ['carry_throw'],
      deBai: 'Vật mờ nằm cách vật bốn ô, mà máy ném chỉ ném xa tối đa ba ô. Chế lệnh carry_throw(k): nạp vật vào rổ, chở vật đi k ô rồi ném ra xa ba ô. Xe dừng ở chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi carry_throw(2). Mở Xưởng hàm, tạo carry_throw(k) rồi bấm Chạy.',
      san: SAN_4,
      batDau: BD_4,
      bongMo: { x: 2, y: 5, huong: 0, vat: [{ x: 2, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 13, nhip: 4 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [hCarry()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [hCarry(nhieu(['# chở rồi ném'], T_CARRY))]
      },
      congThucKhac: [
        { moTa: 'Chở bằng vòng for thay cho forward(k) (nhiều ô hơn)', hamCuaEmMoi: [hCarry(['load()', 'wait()', 'for i in range(k):', '    move()', 'toss(3)'])] },
        { moTa: 'Không dùng toss(3): tự đặt tầm rồi ném (nhiều ô hơn)', hamCuaEmMoi: [hCarry(['load()', 'wait()', 'forward(k)', 'aim(3)', 'throw()', 'wait()'])] },
        { moTa: 'Chờ thêm một nhịp trước khi ném (chậm hơn một nhịp)', hamCuaEmMoi: [hCarry(['load()', 'wait()', 'forward(k)', 'wait()', 'toss(3)'])] }
      ],
      loiSai: [
        { moTa: 'Quên nạp vật: xe đâm vào vật chắn lối và rổ trống nên throw() không ném gì', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hCarry(['forward(k)', 'toss(3)'])], phaiCoMa: ['dam-tuong', 'nem-hut', 'lech-bong-mo'] },
        { moTa: 'Ném ngay không chở: vật bay ba ô nhưng còn cách vật mờ một ô', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hCarry(['load()', 'wait()', 'toss(3)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ chở một ô: xe đứng sai chỗ và vật rơi vào hàng rào nên vỡ', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hCarry(['load()', 'wait()', 'forward(1)', 'toss(3)'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Chở xong ném tầm 2: vật rơi vào hàng rào nên vỡ', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hCarry(['load()', 'wait()', 'forward(k)', 'toss(2)'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Nạp xong chỉ chở, quên ném: vật vẫn nằm trong rổ', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hCarry(['load()', 'wait()', 'forward(k)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi carry_throw(2) mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Vật nằm trong rổ thì đi theo xe. Chở nó lại gần vật mờ rồi mới ném.', 'Xe mờ cho biết xe phải dừng ở đâu: từ chỗ đó ném ba ô là tới vật mờ.']
    }),

    man({
      so: 5, ten: 'Ném ra sau lưng', hang: 'luyen', hamCuaEmCan: ['toss', 'u_turn'], taoHam: ['toss_back'],
      deBai: 'Vật nằm sát trước mũi xe, còn vật mờ nằm sau lưng xe, bên kia hàng rào và tường. Chế lệnh toss_back(n): nạp vật, quay đầu, ném ra sau lưng n ô rồi quay đầu lại. Xe giữ nguyên chỗ và hướng.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi toss_back(3). Mở Xưởng hàm, tạo toss_back(n) rồi bấm Chạy.',
      san: SAN_5,
      batDau: BD_5,
      bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 2, y: 5 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 12, nhip: 4 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [hBack()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [hBack(nhieu(['# nạp, quay đầu, ném, quay đầu lại'], T_BACK))]
      },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay phải (chậm hơn hai nhịp)', hamCuaEmMoi: [hBack(['load()', 'wait()', 'turn_right()', 'turn_right()', 'toss(n)', 'turn_right()', 'turn_right()'])] },
        { moTa: 'Không dùng toss(n): tự đặt tầm rồi ném (nhiều ô hơn)', hamCuaEmMoi: [hBack(['load()', 'wait()', 'u_turn()', 'aim(n)', 'throw()', 'wait()', 'u_turn()'])] }
      ],
      loiSai: [
        { moTa: 'Ném xong không quay đầu lại: xe quay mặt xuống', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBack(['load()', 'wait()', 'u_turn()', 'toss(n)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Ném luôn không quay đầu: vật bay thẳng lên ra ngoài sân nên vỡ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBack(['load()', 'wait()', 'toss(n)'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Quay đầu trước khi nạp: vật nằm sau lưng xe nên load() không nạp được', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBack(['u_turn()', 'load()', 'wait()', 'toss(n)', 'u_turn()'])], phaiCoMa: ['nap-hut', 'lech-bong-mo'] },
        { moTa: 'Đặt tầm cố định 2: vật rơi vào tường nên vỡ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBack(['load()', 'wait()', 'u_turn()', 'toss(2)', 'u_turn()'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Gọi toss_back(3) mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Vật nằm trước mũi xe, nên phải nạp khi xe còn quay mặt lên rồi mới quay đầu.', 'Quay đầu thì mũi xe hướng xuống: ô cách xe n ô về phía dưới là chỗ vật rơi.']
    }),

    man({
      so: 6, ten: 'Chia theo màu', hang: 'luyen', cb: 'mau', hamCuaEmCan: ['side_throw', 'toss', 'turn_left', 'turn_right'], taoHam: ['split'],
      deBai: 'Xe gắn camera, color() cho biết màu vật trước mũi xe. Mỗi sân có một vật đỏ hoặc xanh dương: chế lệnh split() để vật đỏ bay sang phải, vật xanh dương bay sang trái, đều rơi ở ô thứ hai tính từ xe. Mỗi hàm chỉ có 10 ô, nên hãy dùng side_throw() đã chế.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi split(). Mở Xưởng hàm, tạo split() rồi bấm Chạy. Chạm ảnh nhỏ để xem từng sân.',
      san: [SAN_6, SAN_6, SAN_6], vatMau: VMAU_6,
      batDau: BD_6,
      bongMo: [
        { x: 2, y: 3, huong: 0, vat: [{ x: 4, y: 3, mau: 'red' }] },
        { x: 2, y: 3, huong: 0, vat: [{ x: 0, y: 3, mau: 'blue' }] },
        { x: 2, y: 3, huong: 0, vat: [{ x: 0, y: 3, mau: 'blue' }] }
      ],
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 21, nhip: 12 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [hSplit()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [hSplit(nhieu(['# đỏ sang phải, xanh dương sang trái'], T_SPLIT))]
      },
      congThucKhac: [
        { moTa: 'Đổi chỗ hai nhánh: hỏi màu xanh dương trước, nhánh còn lại là đỏ', hamCuaEmMoi: [hSplit(['if color() == "blue":', '    load()', '    wait()', '    turn_left()', '    toss(2)', '    turn_right()', 'else:', '    side_throw(2)'])] },
        { moTa: 'Nhánh xanh dương quay trái bằng ba lần quay phải (chậm hơn hai nhịp khi gặp vật xanh dương)', hamCuaEmMoi: [hSplit(['if color() == "red":', '    side_throw(2)', 'else:', '    load()', '    wait()', '    right(3)', '    toss(2)', '    turn_right()'])] }
      ],
      loiSai: [
        { moTa: 'Chuyền mọi vật sang phải: vật xanh dương nằm sai bên', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hSplit(['side_throw(2)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo hai nhánh: vật nào cũng nằm sai bên', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hSplit(['if color() == "blue":', '    side_throw(2)', 'else:', '    load()', '    wait()', '    turn_left()', '    toss(2)', '    turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhánh xanh dương quên quay về: xe quay mặt sang trái', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hSplit(['if color() == "red":', '    side_throw(2)', 'else:', '    load()', '    wait()', '    turn_left()', '    toss(2)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết hoa "Red": không khớp màu nào nên luôn chọn nhánh else', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hSplit(['if color() == "Red":', '    side_throw(2)', 'else:', '    load()', '    wait()', '    turn_left()', '    toss(2)', '    turn_right()'])], phaiCoMa: ['ten-mau-sai', 'lech-bong-mo'] },
        { moTa: 'Nhìn màu SAU khi nạp: ô trước mặt đã trống nên color() luôn là "none"', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hSplit(['load()', 'wait()', 'if color() == "red":', '    turn_right()', '    toss(2)', '    turn_left()', 'else:', '    turn_left()', '    toss(2)', '    turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không dùng side_throw(), viết thẳng cả hai nhánh: quá 10 ô', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hSplit(['if color() == "red":', '    load()', '    wait()', '    turn_right()', '    toss(2)', '    turn_left()', 'else:', '    load()', '    wait()', '    turn_left()', '    toss(2)', '    turn_right()'])], phaiCoMa: ['tran-khung'] },
        { moTa: 'Gọi split() mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Hỏi color() trước khi nạp: nạp xong thì ô trước mặt trống, camera không còn thấy vật.', 'Nhánh vật đỏ đã có side_throw(). Nhánh còn lại làm gương: quay sang trái.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Sửa tầm lệch', hang: 'bien-the', hamCuaEmCan: ['toss', 'turn_right', 'turn_left'],
      deBai: 'Máy ném của màn này lắp lệch: hàm fixed_toss(n) của màn ném vật ngắn hơn n ô, nên cả hai vật đều rơi sai chỗ. Sửa fixed_toss(n) để chương trình chính ném đúng hai vật tới vật mờ.',
      veMaMau: 'Chương trình chính bị khóa: nạp vật, ném bằng fixed_toss(), quay sang phải, rồi làm lại với vật thứ hai. Hàm fixed_toss(n) đang đặt tầm sai. Chạy thử để xem vật rơi xuống đâu.',
      san: SAN_7,
      batDau: BD_7,
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 2, y: 0 }, { x: 4, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_7.slice(), hamCuaMan: [hFixed(T_FIXED_CU)] },
      sao: { o: 15, nhip: 6 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [hFixed(T_FIXED)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [hFixed(nhieu(['# tầm đúng bằng n'], T_FIXED))] }
      },
      congThucKhac: [
        { moTa: 'Bỏ hết, gọi toss(n) của em trong hàm', baiLam: { chinh: C_7.slice(), hamCuaMan: [hFixed(['toss(n)'])] } },
        { moTa: 'Đặt tầm n rồi chờ thêm một nhịp sau khi ném (chậm hơn hai nhịp)', baiLam: { chinh: C_7.slice(), hamCuaMan: [hFixed(['aim(n)', 'throw()', 'wait()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hàm của màn: vật đầu rơi vào hàng rào nên vỡ', baiLam: { chinh: C_7.slice(), hamCuaMan: [hFixed(T_FIXED_CU)] }, phaiCoMa: ['nem-vo', 'lech-bong-mo'] },
        { moTa: 'Sửa thành aim(n + 1): tầm quá một ô', baiLam: { chinh: C_7.slice(), hamCuaMan: [hFixed(['aim(n + 1)', 'throw()', 'wait()'])] }, phaiCoMa: ['tam-sai'] },
        { moTa: 'Đặt tầm cố định 3 cho cả hai lần: vật thứ hai rơi vào tường nên vỡ', baiLam: { chinh: C_7.slice(), hamCuaMan: [hFixed(['aim(3)', 'throw()', 'wait()'])] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Sửa quên wait(): lệnh ném dính sang nhịp sau, lúc xe đã quay', baiLam: { chinh: C_7.slice(), hamCuaMan: [hFixed(['aim(n)', 'throw()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm fixed_toss() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử chạy: vật rơi cách xe mấy ô? Tầm trong fixed_toss(n) đang là bao nhiêu khi n là 3?', 'Muốn tầm đúng bằng n thì aim() phải nhận đúng n, không bớt đi.']
    }),

    man({
      so: 8, ten: 'Xe chỉ quay phải', hang: 'bien-the', mucTieu: 'bong-mo', hamGoc: KHAY_HONG,
      phanCung: KHAY_HONG, canhBao: 'Bánh hỏng: xe chỉ quay phải',
      hamCuaEmCan: ['launch', 'turn_right', 'right', 'toss'],
      deBai: 'Bánh phải hỏng hẳn và bánh trái chỉ còn quay tới: xe không đi được, chỉ quay phải được. Ném vật xanh dương ra xa, rồi đưa vật đỏ phía trước vào chỗ vật xanh dương vừa trống, như vật mờ. Em tự viết chương trình; xe quay mặt sang phải như xe mờ.',
      veMaMau: 'Chương trình chính còn trống. Khay chỉ còn bánh trái tiến, nên chỉ turn_right() của em chạy được: các hàm khác quay hay đi sẽ báo hỏng.',
      san: SAN_8, vatMau: VMAU_8,
      batDau: BD_8,
      bongMo: { x: 3, y: 3, huong: 1, vat: [{ x: 4, y: 3, mau: 'red' }, { x: 6, y: 3, mau: 'blue' }] },
      maMau: { chinh: [] },
      sao: { o: 17, nhip: 9 },
      loiGiai: { chinh: L_8.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# xanh dương ra xa trước, đỏ vào chỗ trống sau'], L_8) } },
      congThucKhac: [
        { moTa: 'Quay trái bằng ba dòng turn_right() thay cho right(3) (nhiều ô hơn)', baiLam: { chinh: ['turn_right()', 'launch(3)', 'turn_right()', 'turn_right()', 'turn_right()', 'load()', 'wait()', 'turn_right()', 'toss(1)'] } },
        { moTa: 'Quay phải lần đầu bằng left_move() rồi wait() thay cho turn_right() (nhiều ô hơn)', baiLam: { chinh: ['left_move()', 'wait()', 'launch(3)', 'right(3)', 'load()', 'wait()', 'turn_right()', 'toss(1)'] } }
      ],
      loiSai: [
        { moTa: 'Dùng side_throw(1) đã chế: nó quay trái ở cuối mà bánh trái hết số lùi', baiLam: { chinh: ['turn_right()', 'launch(3)', 'right(3)', 'side_throw(1)'] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Gọi turn_left() của em để quay trái: bánh trái hết số lùi', baiLam: { chinh: ['turn_right()', 'launch(3)', 'turn_left()', 'load()', 'wait()', 'turn_right()', 'toss(1)'] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Gọi u_turn() của em: quay đầu cần cả bánh phải', baiLam: { chinh: ['u_turn()'] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Ném vật đỏ trước: nó rơi vào ô vật xanh dương còn nằm đó nên vỡ', baiLam: { chinh: ['load()', 'wait()', 'turn_right()', 'toss(1)'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Quay hai lần thay vì ba: mũi xe hướng xuống, không còn vật trước mũi để nạp', baiLam: { chinh: ['turn_right()', 'launch(3)', 'right(2)', 'load()', 'wait()', 'turn_right()', 'toss(1)'] }, phaiCoMa: ['nap-hut', 'lech-bong-mo'] }
      ],
      goiY: ['Vật đỏ không rơi được vào ô vật xanh dương còn nằm đó: phải dời vật xanh dương đi trước.', 'Quay phải ba lần cũng là quay trái một lần, mà quay phải thì xe vẫn làm được.']
    }),

    man({
      so: 9, ten: 'Đường về', hang: 'bien-the', hamCuaEmCan: ['toss', 'back', 'turn_left', 'move', 'turn_right'],
      deBai: 'Hàm go_load() của màn đưa xe đi tới nạp vật. Viết thân hàm undo_load() của màn để ném vật về đúng chỗ cũ rồi đưa xe về đúng chỗ và hướng xuất phát, như vật mờ.',
      veMaMau: 'Chương trình chính bị khóa: go_load() rồi undo_load(). Hàm go_load() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm undo_load() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó. Điểm ◆ là chỗ xe đứng nạp vật.',
      san: SAN_9,
      batDau: BD_9,
      bongMo: { x: 1, y: 4, huong: 0, diQua: [{ x: 2, y: 2 }], vat: [{ x: 3, y: 2 }] },       // ◆ ở chỗ xe đứng nạp: chương trình rỗng hay go_load() hỏng không qua ◆, không thể "thắng" chỉ vì xe và vật còn nguyên chỗ cũ
      chinhCoDinh: true, khoaHamMan: ['go_load'],
      maMau: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], T_UNDO_TRONG)] },
      sao: { o: 26, nhip: 10 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], T_UNDO)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], nhieu(['# làm ngược lại go_load()'], T_UNDO))] }
      },
      congThucKhac: [
        { moTa: 'Lùi một ô rồi mới ném (từ đó vật nằm cách xe hai ô), cùng số nhịp', baiLam: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], ['back()', 'toss(2)', 'turn_left()', 'back()', 'back()'])] } },
        { moTa: 'Ném vật, quay đầu, đi lại đường cũ rồi quay đầu lần nữa (chậm hơn)', baiLam: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], ['toss(1)', 'u_turn()', 'move()', 'turn_left()', 'move()', 'move()', 'u_turn()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe còn đứng ở chỗ nạp, vật vẫn nằm trong rổ', baiLam: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], T_UNDO_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi xe về nhưng quên ném vật trả lại: vật còn trong rổ', baiLam: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], ['back()', 'turn_left()', 'back()', 'back()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Ném vật xong không đưa xe về chỗ cũ', baiLam: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], ['toss(1)'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi đúng đường nhưng không quay trái: xe về đúng ô mà quay mặt sang phải', baiLam: { chinh: C_9.slice(), hamCuaMan: [hGoLoad(), H('undo_load', [], ['toss(1)', 'back()', 'back()', 'back()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm undo_load() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [hGoLoad()] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại go_load() từng bước, theo thứ tự ngược.', 'Mỗi lệnh có một lệnh ngược: tiến thì lùi, rẽ phải thì rẽ trái. Còn nạp vật thì ném vật trở lại: vật nằm sát trước mũi xe thì tầm là mấy?']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho hàng ném', hang: 'trum', cb: 'kc',
      hamCuaEmCan: ['go_wall', 'side_throw'],
      huyHieu: { ma: 'che-may-nem', ten: 'Huy hiệu Chế lệnh máy ném' },
      gioiHanHam: 3,
      deBai: 'Ở mỗi sân, ba vật nằm dọc lối đi, cách nhau khác nhau. Xe đi dọc lối rồi ném từng vật sang phải tới vật mờ: vật đầu xa ba ô, vật sau gần dần, hai ô rồi một ô. Chương trình chính chỉ được gọi 3 hàm của em khác nhau.',
      san: SAN_10,
      batDau: BD_10,
      bongMo: BM_10,
      maMau: { chinh: [] },
      sao: { o: 20, nhip: 50 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# ba vật, tầm giảm dần'], L_10) } },
      congThucKhac: [
        { moTa: 'Không dùng for: viết ba lần cặp go_wall() và side_throw() (8 dòng, nhiều ô hơn)', baiLam: { chinh: ['go_wall()', 'side_throw(3)', 'go_wall()', 'side_throw(2)', 'go_wall()', 'side_throw(1)'] } }
      ],
      loiSai: [
        { moTa: 'Viết cứng số bước: ba vật cách xe khác nhau ở mỗi sân', baiLam: { chinh: ['side_throw(3)', 'forward(2)', 'side_throw(2)', 'forward(2)', 'side_throw(1)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đặt tầm 3 cho cả ba vật: vật giữa và vật cuối rơi vào tường nên vỡ', baiLam: { chinh: ['for i in range(3):', '    go_wall()', '    side_throw(3)'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Chỉ lặp hai lần: vật cuối chưa được ném', baiLam: { chinh: ['for i in range(2):', '    go_wall()', '    side_throw(3 - i)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên đi tới vật kế: lần ném thứ hai không có vật trước mũi xe', baiLam: { chinh: ['for i in range(3):', '    side_throw(3 - i)'] }, phaiCoMa: ['nap-hut', 'lech-bong-mo'] },
        { moTa: 'Gọi 4 hàm khác nhau (go_wall, side_throw, move, forward): vượt giới hạn 3 hàm', baiLam: { chinh: ['for i in range(3):', '    go_wall()', '    side_throw(3 - i)', '    move()', '    forward(1)'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Mỗi vật cách xe khác nhau: đi thẳng cho tới khi trước mũi xe có vật rồi mới ném.', 'Tầm giảm dần 3, 2, 1: dùng biến của vòng for để tính tầm.']
    })
  ];

  function hGoLoad() { return H('go_load', [], T_GO_LOAD); }

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
