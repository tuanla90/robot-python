/* ============================================================================
   man-che-nam-cham.js — "Đường học": CHƯƠNG `che-nam-cham` · CHẾ LỆNH NAM CHÂM (10 màn). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5b.2, 15/10): chương chế lệnh đi sau chương `nam-cham`.
   Robot là XE HAI BÁNH gắn TAY NAM CHÂM CÓ CỰC: robot { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] } (cảm biến từ gắn vào cảm biến khoảng cách ở hông).
   Lệnh gốc (luật đầy đủ ở san-hoc.js, phần NAM CHÂM), đều chỉ RA LỆNH, wait() cho nhịp trôi, mỗi nhịp một lệnh nam châm:
       magnet_n() bật cực N · magnet_s() bật cực S · magnet_off() ngắt điện, thả vật dính xuống ô sát mũi xe        (cặp lệnh ngược: magnet_n ↔ magnet_s)
   Luật tóm tắt: vật SẮT bị hút bởi cực nào cũng được trong 2 ô và KHÔNG BAO GIỜ bị đẩy; vật NAM CHÂM (chữ N hay S là cực quay về phía xe) trong 3 ô: KHÁC cực thì hút, CÙNG cực thì ĐẨY ra xa
   (trượt tối đa 3 ô, dừng trước vật cản); vật đang dính mà tay đổi sang cùng cực thì bị BẮN ra khỏi mũi xe. front_pole() cho biết chữ ("N", "S", "none") của vật nam châm đầu tiên trong 3 ô.
   Luật thiết kế như che-xe và che-tay: lệnh gốc chỉ đổi MỘT trạng thái; động tác hay (đá vật, kéo vật lại gần, chuyền sang làn, phân loại theo cực…) là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (hay `baiLam` cho hàm của màn).

   Mục tiêu `bong-mo` (san-hoc.js, phần BÓNG MỜ): xe phải đứng đúng tư thế "xe mờ" khi chương trình CHẠY XONG, và VẬT MỜ cho biết mỗi vật phải nằm ở ô nào; chưa chế hàm thì không thắng.
   `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`), người chơi chỉ sửa / tạo hàm trong Xưởng. 3, 8 và 10 không khóa: người chơi tự viết chương trình chính.

   KHAY: cả chương mở đủ bánh (có bánh lùi), ba lệnh nam châm và ba cảm biến (front_clear, front_metal, front_pole). Màn 8 là màn HỎNG: khay = phần cứng, thiếu magnet_s.
   Hàm của em có sẵn ở chương này: toàn bộ chương trước (move, u_turn một nhịp, back, go_wall…), cùng fetch() và grip() của chương nam-cham.
       grip() = if front_pole() == "N": magnet_s() else: magnet_n(), wait()     bật cực KHÁC chữ trên vật trước mặt để kéo nó về (vật sắt: cực N)

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-nam-cham.1 kick()  = magnet_n(), wait(), magnet_off(), wait()                         đá vật nam châm chữ N ở trước mặt ra xa (bật cực N cùng chữ, vật trượt 3 ô), rồi ngắt điện (2 nhịp)
     che-nam-cham.2 reel()  = grip(), magnet_off(), wait()                                      kéo vật nam châm trước mặt về, thả xuống ô sát mũi xe (2 nhịp)
     che-nam-cham.4 lane()  = grip(), turn_right(), magnet_off(), wait(), turn_left()          chuyền vật trước mặt sang ô bên PHẢI xe, xe giữ ô và hướng (4 nhịp)
     che-nam-cham.5 sort()  = if front_pole() == "N": lane() else: grip(), turn_left(), magnet_off(), wait(), turn_right()      vật N sang phải, vật S sang trái (đúng 8 dòng)
     che-nam-cham.6 fling() = magnet_s(), wait(), magnet_n(), wait()                           hút vật N rồi đổi cực: vật bị BẮN ra khỏi mũi xe, trượt 3 ô (2 nhịp)
   HÀM CỦA MÀN (15/10: hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-nam-cham.7 fixed_grip() thân ban đầu = grip() cũ (dây cực đấu ngược nên đẩy vật thay vì hút); lời giải đổi chỗ magnet_s ↔ magnet_n        (daoChieu ['cuc'])
     che-nam-cham.9 go_pull() = move(), move(), grip() (khóa, xem được); put_back() thân ban đầu `pass`, lời giải magnet_n(), wait(), back(), back()   đi NGƯỢC lại go_pull(): kéo ↔ bắn (N ↔ S), tiến ↔ lùi

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật (nhipTheoLoiGiai: lệnh nam châm có wait() riêng nên đường ngắn nhất BFS — do-duong-che-nam-cham.mjs, lệnh nam châm gộp
   vào nhịp đi — luôn ngắn hơn hay bằng); sao.o = ô của lời giải cách 1. Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-nam-cham.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-nam-cham.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  var CAM = ['front_clear', 'front_metal', 'front_pole'];
  var KHAY = BANH.concat(NC, CAM);                                           // khay cả chương
  var KHAY_HONG = BANH.concat(['magnet_n', 'magnet_off'], CAM);              // 8: cực S hỏng (không có magnet_s)

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_KICK = ['magnet_n()', 'wait()', 'magnet_off()', 'wait()'];
  var T_REEL = ['grip()', 'magnet_off()', 'wait()'];
  var T_LANE = ['grip()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()'];
  var T_SORT = ['if front_pole() == "N":', '    lane()', 'else:', '    grip()', '    turn_left()', '    magnet_off()', '    wait()', '    turn_right()'];
  var T_FLING = ['magnet_s()', 'wait()', 'magnet_n()', 'wait()'];
  // 7: thân ban đầu của fixed_grip() = grip() cũ (đúng với dây cực bình thường, sai khi dây cực đấu ngược) và bản sửa (đổi chỗ hai cực)
  var T_FIXED_GRIP_CU = ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'];
  var T_FIXED_GRIP = ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'wait()'];
  // 9: go_pull() của màn (khóa) và put_back() (thân ban đầu: pass)
  var T_GO_PULL = ['move()', 'move()', 'grip()'];
  var T_PUT_BACK_TRONG = ['pass'];
  var T_PUT_BACK = ['magnet_n()', 'wait()', 'back()', 'back()'];

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['kick()'];
  var C_2 = ['reel()'];
  var C_4 = ['lane()'];
  var C_5 = ['sort()'];
  var C_6 = ['fling()'];
  var C_7 = ['fixed_grip()', 'turn_right()', 'magnet_off()', 'wait()'];
  var C_9 = ['go_pull()', 'put_back()'];
  // 3 (người chơi tự viết): đá vật N qua khỏi chỗ rẽ vào ngách cụt, lên tới chỗ rẽ, rẽ phải, kéo vật S ở lối rẽ vào xe mang theo, tới cờ
  var L_3 = ['kick()', 'move()', 'move()', 'move()', 'turn_right()', 'grip()', 'move()', 'move()'];
  // 8 (người chơi tự viết): chỉ còn cực N nên chỉ ĐẨY được: đá vật sang phải tới tường, vòng lên hàng trên, đứng trên đầu vật rồi đá xuống tới tường
  var L_8 = ['kick()', 'turn_left()', 'move()', 'turn_right()', 'forward(3)', 'turn_right()', 'kick()'];
  // 10 (người chơi tự viết): lặp ba lần: tiến tới khi thấy vật nam châm trong 3 ô rồi phân loại nó
  var L_10 = ['for i in range(3):', '    while front_pole() == "none":', '        move()', '    sort()'];

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'che-nam-cham';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = m.hamGoc || KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while'];
    if (m.mucTieu !== 'toi-co') m.mucTieu = m.mucTieu || 'bong-mo';
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                 // mặc định của lõi
    m.nhipTheoLoiGiai = true;
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: vật N cách xe 2 ô trên cột xe; đá lên thì trượt tới mép sân (2,0)
  var SAN_1 = ['.....', '.....', '..o..', '.....', '.....'];
  var CHAT_1 = ['.....', '.....', '..N..', '.....', '.....'];
  // 2: vật S cách xe 3 ô; kéo về thả sát mũi xe (2,3)
  var SAN_2 = ['.....', '..o..', '.....', '.....', '.....'];
  var CHAT_2 = ['.....', '..S..', '.....', '.....', '.....'];
  // 3: hành lang đứng, chỗ rẽ phải ở (2,2) dẫn tới cờ (4,2); trên chỗ rẽ còn ngách cụt (2,1) (2,0). Vật N chắn giữa lối (2,4); vật S nằm ngay lối rẽ (3,2).
  //    Đá vật N trượt 3 ô lên (2,1): qua khỏi chỗ rẽ. Vật S: kéo vào xe rồi mang theo.
  var SAN_3 = ['##.##', '##.##', '##.oF', '##.##', '##o##', '##.##'];
  var CHAT_3 = ['.....', '.....', '...S.', '.....', '..N..', '.....'];
  var BD_3 = { x: 2, y: 5, huong: 0 };
  // 4: vật N cách xe 3 ô; chuyền sang ô bên phải xe (3,4)
  var SAN_4 = ['.....', '..o..', '.....', '.....', '.....'];
  var CHAT_4 = ['.....', '..N..', '.....', '.....', '.....'];
  // 5: ba sân, xe ở (2,4) quay lên: vật N cách 2 ô, vật S cách 3 ô, vật N cách 1 ô; N sang phải (3,4), S sang trái (1,4)
  var SAN_5 = [
    ['.....', '.....', '..o..', '.....', '.....'],
    ['.....', '..o..', '.....', '.....', '.....'],
    ['.....', '.....', '.....', '..o..', '.....']
  ];
  var CHAT_5 = [
    ['.....', '.....', '..N..', '.....', '.....'],
    ['.....', '..S..', '.....', '.....', '.....'],
    ['.....', '.....', '.....', '..N..', '.....']
  ];
  // 6: sân 5×7, xe (2,6); vật N cách 2 ô ở (2,4); bắn bằng hút rồi đổi cực: vật rơi ô sát mũi (2,5) rồi trượt 3 ô tới (2,2). (Đá thẳng thì vật trượt từ (2,4) tới (2,1).)
  var SAN_6 = ['.....', '.....', '.....', '.....', '..o..', '.....', '.....'];
  var CHAT_6 = ['.....', '.....', '.....', '.....', '..N..', '.....', '.....'];
  var BD_6 = { x: 2, y: 6, huong: 0 };
  // 7: hai sân, vật N rồi vật S, cùng ở (2,2), xe (2,4); dây cực đấu ngược
  var SAN_7 = [['.....', '.....', '..o..', '.....', '.....'], ['.....', '.....', '..o..', '.....', '.....']];
  var CHAT_7 = [['.....', '.....', '..N..', '.....', '.....'], ['.....', '.....', '..S..', '.....', '.....']];
  var BD_7 = { x: 2, y: 4, huong: 0 };
  // 8: xe (0,1) quay phải, vật N ở (1,1); tường (4,1) chặn vật trượt ở (3,1); tường (3,4) chặn vật trượt xuống ở (3,3)
  var SAN_8 = ['......', '.o..#.', '......', '......', '...#..'];
  var CHAT_8 = ['......', '.N....', '......', '......', '......'];
  var BD_8 = { x: 0, y: 1, huong: 1 };
  // 9: vật N ở hàng trên cùng (2,0), cách xe (2,5) năm ô: go_pull() tiến hai ô rồi kéo vật (cách 3 ô). Bắn vật lại từ ô sát mũi (2,2) thì nó trượt 2 ô rồi dừng ở mép sân (2,0), đúng chỗ cũ
  var SAN_9 = ['..o..', '.....', '.....', '.....', '.....', '.....'];
  var CHAT_9 = ['..N..', '.....', '.....', '.....', '.....', '.....'];
  var BD_9 = { x: 2, y: 5, huong: 0 };

  // 10: ba sân 5×7, xe (2,6) quay lên, ba vật nam châm xếp dọc cột giữa: N S N · S N S · N N S, khoảng cách khác nhau (viết cứng số bước thì trượt); vật N chuyền sang phải, vật S sang trái,
  // xe dừng ở chỗ tiến tới vật cuối cùng (y = 3, 4, 3)
  function vat10(ds) {
    var rows = ['.....', '.....', '.....', '.....', '.....', '.....', '.....'], chat = rows.slice();
    ds.forEach(function (v) { rows[v[1]] = rows[v[1]].slice(0, v[0]) + 'o' + rows[v[1]].slice(v[0] + 1); chat[v[1]] = chat[v[1]].slice(0, v[0]) + v[2] + chat[v[1]].slice(v[0] + 1); });
    return { rows: rows, chat: chat };
  }
  var S10 = [vat10([[2, 4, 'N'], [2, 2, 'S'], [2, 0, 'N']]), vat10([[2, 5, 'S'], [2, 3, 'N'], [2, 1, 'S']]), vat10([[2, 5, 'N'], [2, 2, 'N'], [2, 0, 'S']])];
  var SAN_10 = S10.map(function (x) { return x.rows; }), CHAT_10 = S10.map(function (x) { return x.chat; });
  var BD_10 = { x: 2, y: 6, huong: 0 };
  var BM_10 = [
    { x: 2, y: 3, huong: 0, vat: [{ x: 3, y: 3 }, { x: 1, y: 5 }, { x: 3, y: 6 }] },
    { x: 2, y: 4, huong: 0, vat: [{ x: 1, y: 4 }, { x: 3, y: 6 }, { x: 1, y: 6 }] },
    { x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 3 }, { x: 3, y: 5 }, { x: 3, y: 6 }] }
  ];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Đá vật', hang: 'lam-quen', taoHam: ['kick'],
      deBai: 'Một vật nam châm có chữ N nằm trước mặt xe. Chương trình chính chỉ gọi kick(): em tự chế lệnh này để đá vật bay ra xa, cho vật nằm đúng chỗ như vật mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi kick(). Mở Xưởng hàm, tạo kick() rồi bấm Chạy.',
      san: SAN_1, vatChat: CHAT_1,
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 0 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 5, nhip: 2 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('kick', T_KICK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [H('kick', nhieu(['# đá vật ra xa'], T_KICK))]
      },
      congThucKhac: [
        { moTa: 'Chỉ bật cực N rồi thôi, không ngắt điện (ngắn hơn một nhịp)', hamCuaEmMoi: [H('kick', ['magnet_n()', 'wait()'])] },
        { moTa: 'Bật cực N, chờ thêm một nhịp rồi mới ngắt điện (chậm hơn một nhịp)', hamCuaEmMoi: [H('kick', ['magnet_n()', 'wait()', 'wait()', 'magnet_off()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Bật cực S: khác chữ N nên vật bị hút dính vào xe, không bay đi', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('kick', ['magnet_s()', 'wait()', 'magnet_off()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên wait(): lệnh nam châm chưa chạy', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('kick', ['magnet_n()'])], phaiCoMa: ['quen-wait', 'lech-bong-mo'] },
        { moTa: 'Chỉ ngắt điện: nam châm chưa bao giờ bật', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('kick', ['magnet_off()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi kick() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Cực giống nhau thì đẩy nhau: nhìn chữ trên vật để chọn cực.', 'Đá xong nên ngắt điện, kẻo xe tiến lên thì lại đẩy vật thêm.']
    }),

    man({
      so: 2, ten: 'Kéo lại gần', hang: 'lam-quen', hamCuaEmCan: ['grip'], taoHam: ['reel'],
      deBai: 'Một vật nam châm nằm cách xe 3 ô. Chương trình chính chỉ gọi reel(): em tự chế lệnh này để kéo vật về nằm sát trước mũi xe, xe đứng yên như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi reel(). Mở Xưởng hàm, tạo reel() rồi bấm Chạy.',
      san: SAN_2, vatChat: CHAT_2,
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 9, nhip: 2 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('reel', T_REEL)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [H('reel', nhieu(['# kéo vật lại gần'], T_REEL))]
      },
      congThucKhac: [
        { moTa: 'Không dùng grip(): bật thẳng cực N (vật chữ S) rồi ngắt điện', hamCuaEmMoi: [H('reel', ['magnet_n()', 'wait()', 'magnet_off()', 'wait()'])] },
        { moTa: 'Chờ thêm một nhịp trước khi ngắt điện (chậm hơn một nhịp)', hamCuaEmMoi: [H('reel', ['grip()', 'wait()', 'magnet_off()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Quên ngắt điện: vật còn dính vào xe, chưa nằm trên sàn', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('reel', ['grip()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bật cùng cực với chữ trên vật: vật bị đẩy ra xa chứ không bị kéo về', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('reel', ['magnet_s()', 'wait()', 'magnet_off()', 'wait()'])], phaiCoMa: ['day-vat', 'lech-bong-mo'] },
        { moTa: 'Ngắt điện ngay khi vật còn xa: chưa kéo được gì', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('reel', ['magnet_off()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi reel() mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Em đã chế grip() ở chương trước: nó kéo vật về dù vật mang chữ nào.', 'Kéo xong thì vật đang dính ở mũi xe. Muốn nó nằm xuống sàn thì phải ngắt điện.']
    }),

    man({
      so: 3, ten: 'Dọn đường', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: ['kick', 'grip', 'move', 'turn_right'],
      deBai: 'Hai vật nam châm chắn đường tới cờ trong hành lang hẹp: vật N chắn giữa lối, vật S nằm ngay chỗ rẽ phải. Dùng kick() và grip() em đã chế để dọn lối. Chương trình chỉ có 10 ô.',
      san: SAN_3, vatChat: CHAT_3,
      batDau: BD_3,
      maMau: { chinh: [] },
      sao: { o: 22, nhip: 9 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# đá vật N, mang vật S'], L_3) }
      },
      congThucKhac: [
        { moTa: 'Kéo cả vật N về (grip), mang lên tận ngách cụt rồi thả ở đó', baiLam: { chinh: ['grip()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()', 'turn_right()', 'grip()', 'move()', 'move()'] } },
        { moTa: 'Không dùng kick(): tự bật cực N rồi ngắt điện (viết thẳng lệnh gốc)', baiLam: { chinh: ['magnet_n()', 'wait()', 'magnet_off()', 'wait()', 'forward(3)', 'turn_right()', 'grip()', 'forward(2)'] } }
      ],
      loiSai: [
        { moTa: 'Không dọn gì: xe đâm vật chắn lối', baiLam: { chinh: ['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đá vật N rồi rẽ phải ngay: vật S vẫn chắn lối rẽ', baiLam: { chinh: ['kick()', 'move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dùng cực N kéo vật N: cùng cực nên chỉ đẩy, xe vẫn đâm vật ở lối rẽ khi không đá đủ xa', baiLam: { chinh: ['kick()', 'move()', 'move()', 'turn_right()', 'grip()', 'move()', 'move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ phải ở chỗ rẽ: xe húc vật N đã bị đá lên ngách cụt', baiLam: { chinh: ['kick()', 'move()', 'move()', 'move()', 'grip()', 'move()', 'move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không dùng lệnh đã chế, viết thẳng từng lệnh gốc: quá 10 ô', baiLam: { chinh: ['magnet_n()', 'wait()', 'magnet_off()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'wait()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Vật N nằm giữa lối: đá nó đi thật xa, qua khỏi chỗ rẽ, thì xe đi lên được.', 'Vật S nằm ngay lối rẽ: kéo nó vào xe rồi mang theo cũng là một cách dọn.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Chuyền sang làn', hang: 'luyen', hamCuaEmCan: ['grip', 'turn_right', 'turn_left'], taoHam: ['lane'],
      deBai: 'Một vật nam châm nằm cách xe 3 ô, ngay trước mặt. Chế lệnh lane() để chuyền vật sang ô bên phải xe. Xe giữ nguyên chỗ và hướng, giống xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi lane(). Mở Xưởng hàm, tạo lane() rồi bấm Chạy.',
      san: SAN_4, vatChat: CHAT_4,
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 4, huong: 0, vat: [{ x: 3, y: 4 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 15, nhip: 4 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('lane', T_LANE)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [H('lane', nhieu(['# chuyền vật sang phải'], T_LANE))]
      },
      congThucKhac: [
        { moTa: 'Bật thẳng cực S (vật chữ N) thay cho grip()', hamCuaEmMoi: [H('lane', ['magnet_s()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()'])] },
        { moTa: 'Quay phải bằng ba lần quay trái (chậm hơn hai nhịp)', hamCuaEmMoi: [H('lane', ['grip()', 'turn_left()', 'turn_left()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Chuyền xong không quay về: xe quay mặt sang phải', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('lane', ['grip()', 'turn_right()', 'magnet_off()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay nhầm sang trái: vật nằm bên trái xe', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('lane', ['grip()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thả luôn không quay sang phải: vật rơi xuống ngay trước mũi xe', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('lane', ['grip()', 'magnet_off()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên ngắt điện: vật còn dính vào xe', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('lane', ['grip()', 'turn_right()', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi lane() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Kéo vật vào xe, quay sang phải, ngắt điện cho vật rơi xuống, rồi quay về.', 'Xe mờ nhìn lên như lúc đầu, vật mờ nằm sát bên phải xe.']
    }),

    man({
      so: 5, ten: 'Phân loại', hang: 'luyen', hamCuaEmCan: ['lane', 'grip', 'turn_left', 'turn_right'], taoHam: ['sort'],
      deBai: 'Mỗi sân có một vật nam châm trước mặt xe, có khi chữ N có khi chữ S. Chế lệnh sort(): vật N chuyền sang ô bên phải xe, vật S chuyền sang ô bên trái, xe giữ chỗ và hướng. Mỗi hàm chỉ có 10 ô, nên hãy dùng lane() đã chế.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi sort(). Mở Xưởng hàm, tạo sort() rồi bấm Chạy. Chạm ảnh nhỏ để xem từng sân.',
      san: SAN_5, vatChat: CHAT_5,
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: [
        { x: 2, y: 4, huong: 0, vat: [{ x: 3, y: 4 }] },
        { x: 2, y: 4, huong: 0, vat: [{ x: 1, y: 4 }] },
        { x: 2, y: 4, huong: 0, vat: [{ x: 3, y: 4 }] }
      ],
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 23, nhip: 12 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('sort', T_SORT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [H('sort', nhieu(['# phân loại theo chữ'], T_SORT))]
      },
      congThucKhac: [
        { moTa: 'Đổi chỗ hai nhánh: hỏi chữ S trước, nhánh còn lại là chữ N', hamCuaEmMoi: [H('sort', ['if front_pole() == "S":', '    grip()', '    turn_left()', '    magnet_off()', '    wait()', '    turn_right()', 'else:', '    lane()'])] },
        { moTa: 'Nhánh chữ S quay trái bằng ba lần quay phải (chậm hơn hai nhịp mỗi lần gặp vật S)', hamCuaEmMoi: [H('sort', ['if front_pole() == "N":', '    lane()', 'else:', '    grip()', '    turn_right()', '    turn_right()', '    turn_right()', '    magnet_off()', '    wait()', '    turn_right()'])] }
      ],
      loiSai: [
        { moTa: 'Chuyền mọi vật sang phải: vật chữ S nằm sai bên', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sort', ['lane()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhánh chữ S quên quay về: xe quay mặt sang trái', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sort', ['if front_pole() == "N":', '    lane()', 'else:', '    grip()', '    turn_left()', '    magnet_off()', '    wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bật cùng cực với chữ trên vật ở nhánh chữ S: vật bị đẩy đi chứ không bị kéo về', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sort', ['if front_pole() == "N":', '    lane()', 'else:', '    magnet_s()', '    wait()', '    turn_left()', '    magnet_off()', '    wait()', '    turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không dùng lane(), viết thẳng cả hai nhánh: quá 10 ô', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sort', ['if front_pole() == "N":', '    grip()', '    turn_right()', '    magnet_off()', '    wait()', '    turn_left()', 'else:', '    grip()', '    turn_left()', '    magnet_off()', '    wait()', '    turn_right()'])], phaiCoMa: ['tran-khung'] },
        { moTa: 'Gọi sort() mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Hỏi front_pole() trước khi kéo vật: sau khi vật dính vào xe thì mặt trước trống, không đọc được chữ nữa.', 'Nhánh chữ N đã có lane(). Nhánh còn lại làm gương: quay sang trái.']
    }),

    man({
      so: 6, ten: 'Bắn vật', hang: 'luyen', taoHam: ['fling'],
      deBai: 'Vật nam châm chữ N cách xe 2 ô, mà vật mờ nằm xa hơn chỗ đá thẳng tới được. Chế lệnh fling(): hút vật vào xe rồi đổi cực để bắn nó ra. Xe giữ nguyên chỗ và hướng.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi fling(). Mở Xưởng hàm, tạo fling() rồi bấm Chạy.',
      san: SAN_6, vatChat: CHAT_6,
      batDau: BD_6,
      bongMo: { x: 2, y: 6, huong: 0, vat: [{ x: 2, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 5, nhip: 2 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('fling', T_FLING)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [H('fling', nhieu(['# hút rồi bắn'], T_FLING))]
      },
      congThucKhac: [
        { moTa: 'Hút, thả xuống ô sát mũi, rồi đá từ đó (chậm hơn một nhịp)', hamCuaEmMoi: [H('fling', ['magnet_s()', 'wait()', 'magnet_off()', 'wait()', 'magnet_n()', 'wait()'])] },
        { moTa: 'Dùng grip() để hút rồi đổi sang cực N để bắn', hamCuaEmMoi: [H('fling', ['grip()', 'magnet_n()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Đá thẳng không hút trước: vật trượt từ chỗ cũ, bay quá xa vật mờ một ô', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('fling', ['magnet_n()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Hút xong ngắt điện luôn: vật chỉ rơi sát trước mũi xe', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('fling', ['magnet_s()', 'wait()', 'magnet_off()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Hút xong không đổi cực: vật vẫn dính ở xe', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('fling', ['magnet_s()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Hút rồi bật lại cực S: không đổi gì, vật vẫn dính', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('fling', ['magnet_s()', 'wait()', 'magnet_s()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi fling() mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Đổi cực khi vật đang dính: nếu cực mới cùng chữ với vật thì vật bị bắn ra khỏi mũi xe.', 'Vật bắn ra rơi xuống ô sát mũi rồi trượt thêm 3 ô.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, hamCuaEmCan: ['turn_right'], ten: 'Dây cực đấu ngược', hang: 'bien-the',
      daoChieu: ['cuc'], canhBao: 'Dây cực đấu ngược',
      deBai: 'Dây cực của nam châm bị đấu ngược nên hàm fixed_grip() của màn chạy sai: lệnh magnet_n() bật ra cực S, magnet_s() bật ra cực N. Sửa fixed_grip() cho vật bị kéo về, ở cả hai sân, để chương trình chuyền vật sang phải như vật mờ.',
      veMaMau: 'Chương trình chính bị khóa: kéo vật bằng fixed_grip(), rẽ phải, ngắt điện. Hàm fixed_grip() đang giống grip() cũ. Thử nó trong sân thử của Xưởng hàm để thấy vật đi đâu.',
      san: SAN_7, vatChat: CHAT_7,
      batDau: BD_7,
      bongMo: [
        { x: 2, y: 4, huong: 1, vat: [{ x: 3, y: 4 }] },
        { x: 2, y: 4, huong: 1, vat: [{ x: 3, y: 4 }] }
      ],
      chinhCoDinh: true,
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('fixed_grip', T_FIXED_GRIP_CU)] },
      sao: { o: 11, nhip: 6 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('fixed_grip', T_FIXED_GRIP)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_grip', nhieu(['# dây cực đấu ngược'], T_FIXED_GRIP))] }
      },
      congThucKhac: [
        { moTa: 'Đổi điều kiện thay vì đổi lệnh: hỏi chữ S trước, giữ nguyên hai lệnh', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_grip', ['if front_pole() == "S":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'])] } },
        { moTa: 'Mỗi nhánh thêm một nhịp chờ (chậm hơn nhưng vẫn đúng)', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_grip', ['if front_pole() == "N":', '    magnet_n()', '    wait()', 'else:', '    magnet_s()', '    wait()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hàm của màn: dây ngược nên cực bật ra cùng chữ với vật, vật bị đẩy đi', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_grip', T_FIXED_GRIP_CU)] }, phaiCoMa: ['day-vat', 'lech-bong-mo'] },
        { moTa: 'Chỉ sửa nhánh chữ N: sân có vật chữ S vẫn bị đẩy', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_grip', ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_n()', 'wait()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên wait(): lệnh nam châm dính sang nhịp sau, vật chưa kịp hút lúc xe quay', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('fixed_grip', ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm fixed_grip() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử gọi magnet_n() ở sân thử: nam châm sáng đỏ hay xanh dương?', 'Muốn bật cực S thật thì phải gọi magnet_n(), và ngược lại.']
    }),

    man({
      so: 8, ten: 'Chỉ còn cực N', hang: 'bien-the', mucTieu: 'bong-mo', hamGoc: KHAY_HONG,
      phanCung: KHAY_HONG, canhBao: 'Cực S hỏng',
      hamCuaEmCan: ['kick', 'turn_left', 'turn_right', 'move', 'forward'],
      deBai: 'Cực S của nam châm hỏng, chỉ còn cực N: em đẩy được vật chữ N nhưng không kéo được nó. Hãy đá vật N tới chỗ vật mờ bằng cách đẩy nó hai lần, mỗi lần theo một hướng. Tường chặn giúp vật dừng đúng chỗ.',
      veMaMau: 'Chương trình chính còn trống. Cực S đã hỏng nên khay chỉ còn cực N: em tự viết chương trình, chỉ dùng cực N.',
      san: SAN_8, vatChat: CHAT_8,
      batDau: BD_8,
      bongMo: { x: 3, y: 0, huong: 2, vat: [{ x: 3, y: 3 }] },
      maMau: { chinh: [] },
      sao: { o: 20, nhip: 11 },
      loiGiai: { chinh: L_8.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# đá sang phải rồi đá xuống'], L_8) }
      },
      congThucKhac: [
        { moTa: 'Đi lên hàng trên bằng cách lùi hai bước rẽ khác, tới trên đầu vật rồi đá xuống', baiLam: { chinh: ['kick()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'move()', 'move()', 'turn_right()', 'kick()'] } }
      ],
      loiSai: [
        { moTa: 'Dùng grip() đã chế: grip() cần cực S mà màn này hỏng cực S', baiLam: { chinh: ['grip()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Chỉ đá một lần: vật dừng ở (3,1), chưa xuống tới vật mờ', baiLam: { chinh: ['kick()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đá hai lần cùng một hướng: vật không rẽ xuống được', baiLam: { chinh: ['kick()', 'kick()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đứng sai chỗ khi đá lần hai: vật không nằm thẳng trước mặt xe', baiLam: { chinh: ['kick()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'kick()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Vật chữ N, nam châm cực N: cùng cực thì đẩy. Vật trượt thẳng ra xa và dừng trước tường.', 'Muốn đổi hướng cho vật, xe phải đi vòng tới đứng sau vật ở phía khác rồi mới đá.']
    }),

    man({
      so: 9, ten: 'Đường về', hang: 'bien-the', hamCuaEmCan: ['move', 'back', 'grip'],
      deBai: 'Hàm go_pull() của màn đưa xe lên và kéo vật về. Viết thân hàm put_back() của màn để trả vật về đúng chỗ cũ rồi đưa xe về đúng chỗ và hướng xuất phát, như vật mờ.',
      veMaMau: 'Chương trình chính bị khóa: go_pull() rồi put_back(). Hàm go_pull() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm put_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó. Điểm ◆ là chỗ xe đứng kéo vật.',
      san: SAN_9, vatChat: CHAT_9,
      batDau: BD_9,
      bongMo: { x: 2, y: 5, huong: 0, diQua: [{ x: 2, y: 3 }], vat: [{ x: 2, y: 0 }] },       // ◆ ở chỗ go_pull() dừng kéo vật: chương trình rỗng hay go_pull() hỏng không qua ◆, không thể "thắng" chỉ vì xe và vật còn nguyên chỗ cũ
      chinhCoDinh: true, khoaHamMan: ['go_pull'],
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', T_PUT_BACK_TRONG)] },
      sao: { o: 20, nhip: 6 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', T_PUT_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', nhieu(['# làm ngược lại go_pull()'], T_PUT_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Bắn vật và lùi trong cùng một nhịp (nhanh hơn một nhịp)', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', ['magnet_n()', 'back()', 'back()'])] } },
        { moTa: 'Bắn vật, quay đầu, đi lại đường cũ rồi quay đầu lần nữa (chậm hơn)', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', ['magnet_n()', 'wait()', 'u_turn()', 'move()', 'move()', 'u_turn()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe còn đứng ở chỗ go_pull() dừng, vật vẫn dính', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', T_PUT_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Ngắt điện rồi lùi: vật rơi xuống ô sát mũi, không phải chỗ cũ', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', ['magnet_off()', 'wait()', 'back()', 'back()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi trước rồi mới bắn: vật vẫn dính theo xe tới chỗ xuất phát', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', ['back()', 'back()', 'magnet_off()', 'wait()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bật lại cực S như cũ: không đổi cực nên vật vẫn dính', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL), H('put_back', ['magnet_s()', 'wait()', 'back()', 'back()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm put_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('go_pull', T_GO_PULL)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại go_pull() từng bước, theo thứ tự ngược.', 'Mỗi lệnh có một lệnh ngược: tiến thì lùi, cực S thì cực N. Vật nằm sát mép sân nên bắn ra chỉ trượt tới đúng chỗ cũ.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho từ', hang: 'trum',
      hamCuaEmCan: ['sort', 'move'],
      huyHieu: { ma: 'che-nam-cham', ten: 'Huy hiệu Chế lệnh nam châm' },
      gioiHanHam: 3,
      deBai: 'Ở mỗi sân có ba vật nam châm xếp dọc lối đi, cách nhau khác nhau, có vật N có vật S. Phân loại từng vật: vật N sang phải, vật S sang trái, đi lên cho tới vật cuối rồi dừng đúng chỗ như xe mờ. Chương trình chính chỉ được gọi 3 hàm của em khác nhau.',
      san: SAN_10, vatChat: CHAT_10,
      batDau: BD_10,
      bongMo: BM_10,
      maMau: { chinh: [] },
      sao: { o: 29, nhip: 44 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# phân loại ba vật'], L_10) } },
      congThucKhac: [
        { moTa: 'Không dùng for: viết ba lần cặp while và sort() (9 dòng, nhiều ô hơn)', baiLam: { chinh: ['while front_pole() == "none":', '    move()', 'sort()', 'while front_pole() == "none":', '    move()', 'sort()', 'while front_pole() == "none":', '    move()', 'sort()'] } }
      ],
      loiSai: [
        { moTa: 'Viết cứng số bước: ba vật cách xe khác nhau ở mỗi sân', baiLam: { chinh: ['sort()', 'move()', 'move()', 'sort()', 'move()', 'move()', 'sort()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên tiến lên giữa các vật: lần phân loại thứ hai gặp ô đã có vật nằm sẵn', baiLam: { chinh: ['for i in range(3):', '    sort()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ lặp hai lần: vật cuối chưa được phân loại', baiLam: { chinh: ['for i in range(2):', '    while front_pole() == "none":', '        move()', '    sort()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chuyền mọi vật sang phải bằng lane(): vật S nằm sai bên', baiLam: { chinh: ['for i in range(3):', '    while front_pole() == "none":', '        move()', '    lane()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi 4 hàm khác nhau (sort, lane, grip, move): vượt giới hạn 3 hàm', baiLam: { chinh: ['for i in range(3):', '    while front_pole() == "none":', '        move()', '    grip()', '    sort()', '    lane()'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Mỗi vật cách xe khác nhau: tiến cho tới khi front_pole() thấy một chữ rồi mới phân loại.', 'Lặp lại đúng ba lần, mỗi lần một vật. sort() đã lo cả việc chọn bên.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
