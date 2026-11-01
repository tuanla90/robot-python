/* ============================================================================
   man-kho-cu.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 2, gói 8 "Góc kho cũ" (PDM2b 31/10, KE-HOACH-PART-DUNG-MUA.md mục 1 và 3).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2): tệp có trong danh sách require của lo-trinh-hoc.js, TEP_MUA_2 và thẻ <script> của game/choi.html.
     - `kho-cu` (mã kho-cu.1 … kho-cu.10): chương 1 "Lách qua kho cũ": xe cứu hỏa gặp yếu tố mùa 1
     - `che-kho-cu` (mã che-kho-cu.1 … che-kho-cu.10): chương 2 "Chế lệnh: dọn kho cũ"
   Mỗi màn khai `chuong` và `so`; mã `ma` = chuong + '.' + so là khóa lưu sao, KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manKhoCu, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG: gói 8 theo khuôn mới "cỗ máy mùa gặp yếu tố của các mùa trước". R1 là XE CỨU HỎA ĐẦY ĐỦ: thân XÍCH (đẩy thùng nặng, xichDay), VÒI PHUN (phun nhẹ / mạnh, lucBan),
   MẮT HỒNG NGOẠI (distance + warm). Nhà máy có một góc kho hàng kiểu mùa 1 (Kho hàng): yếu tố mùa 1 trong MỌI màn:
     M  nút đè: xe hay thùng nặng nằm trên M thì nút bật, cửa C nối với nó mở (rời nút thì đóng lại; cửa không đóng đè lên xe / thùng). Thùng đè thì giữ mãi.
        Ý mới của gói: XE ĐÈ NÚT ĐỂ MỞ CỬA CHO TIA NƯỚC: cửa đóng chặn tia, xe đứng trên M thì cửa trước mũi mở, phun qua cửa trúng van N phía sau.
     =  hàng rào: xe không qua (đâm như tường), mắt hồng ngoại đếm tới rào là dừng (rào là vật cản), nhưng TIA NƯỚC BAY QUA RÀO.
     o  thùng gỗ (vật nằm đất): chắn đường mọi thân (xích không gắp, không đẩy được), chắn tia nước; băng chuyền KHÔNG chở vật (thử lõi 31/10).
     D  ô đích chỉ dùng với thùng nặng (mục tiêu day-thung) nên gói này không dùng.
   Trộn với yếu tố mùa 2: van N, cửa C, thùng nặng H (xích đẩy lên M), lực phun (van xa sau rào / cửa thì "high", xe giật một ô), warm() (van sau cửa đang nóng thì để yên).
   Hàm của em dùng lại: move, back, tr_right / tr_left / spin / sidestep (gói 1), forward(n) (gói 2), go_to_wall (gói 3), open_left (gói 4), squirt(p) (gói 6).
   Đường cong: kho-cu.1 trình diễn (chiChay) cho ý "đè nút mở cửa cho tia"; mỗi màn thêm tối đa một điều mới; màn 10 trùm có huy hiệu. MỘT SÂN mỗi màn.
   Sao: sao.o / sao.nhip đo bằng cham.js trên lộ trình (kiem-kho-cu.mjs so khớp từng số). Hướng: 0 lên, 1 phải, 2 xuống, 3 trái; (x, y) với y = 0 ở hàng trên.
   Tên hàm của em mới (không trùng hàm của em / hàm của màn ở màn nào khác): pad_open, fence_shot, hold_shot, pass_crate, fence_at(n), scan_pads(n), warm_pad.
   Hàm của màn: peek_valve (kho-cu.8), fence_far(n) (che-kho-cu.8), pad_shot (che-kho-cu.9).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back', 'distance', 'warm'];

  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function IF(dk, co) { return ['if ' + dk + ':'].concat(thut(co)); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }
  function o(x, y) { return { x: x, y: y }; }
  /** Nhóm nối: nút (x, y) (van N hay nút đè M) mở các cửa [[x, y], …]. */
  function noi(x, y, cua) { return { nut: o(x, y), cua: cua.map(function (c) { return o(c[0], c[1]); }) }; }

  /** Điền trường chung: xe cứu hỏa đầy đủ (xích đẩy thùng, vòi phun chọn lực, hồng ngoại đo nhiệt). */
  function man(m) {
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'xich';
    m.xichDay = true;
    m.lucBan = true;
    m.robot = { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] };
    m.hamGoc = KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  // thân các hàm của em mới (cách chuẩn)
  var T_PAD_OPEN = ['move()', 'open_left()'];                              // tiến lên nút đè (cửa bên trái mở), phun van bên trái qua cửa rồi quay lại
  var T_FENCE_SHOT = ['squirt("high")', 'move()'];                         // phun mạnh qua rào, tiến một ô bù cú giật
  var T_HOLD_SHOT = ['move()', 'tr_left()', 'squirt("low")'];              // đẩy thùng đè nút (cửa bên phải mở), quay sang phải, phun van qua cửa
  var T_PASS_CRATE = ['sidestep()', 'move()', 'move()', 'tr_left()', 'move()', 'tr_right()'];   // né sang làn phải, qua thùng gỗ, về làn cũ
  var T_FENCE_AT = ['forward(n)', 'squirt("high")', 'move()'];             // tiến n ô tới sát rào, phun mạnh qua rào, bù cú giật
  var T_SCAN_PADS = FOR('n', ['pad_open()', 'move()']);                    // n trạm nút đè liền nhau
  var T_WARM_PAD = ['move()', 'tr_left()', 'if not warm():', '    squirt("low")', 'tr_right()'];   // lên nút đè, nhìn van qua cửa, chưa nóng thì phun
  var T_PEEK = nhieu(['tr_left()'], IF('not warm()', ['squirt("low")']), ['tr_right()']);          // hàm của màn kho-cu.8 (bản đúng)
  var T_PEEK_CU = nhieu(['tr_left()'], IF('warm()', ['squirt("low")']), ['tr_right()']);           // bản lỗi: đảo điều kiện

  /* ------------------------------------------------------------------- sân chương 1 */
  // kho-cu.1 (trình diễn): xe (1,1) quay phải; nút đè M (2,1) mở cửa (3,1) trước mũi; van N (4,1) mở cửa (2,2) dưới nút; cờ (2,3).
  var SAN_K1 = ['######', '#.MCN#', '#.C###', '#.F###', '######'];
  // kho-cu.2: xe (1,1); M (3,1) mở cửa (4,1); van (6,1) cách hai ô trống (phun mạnh, xe giật lùi về (2,1)); van mở cửa (3,2); cờ (3,3).
  var SAN_K2 = ['########', '#..MC.N#', '###C####', '###F####', '########'];
  // kho-cu.3: xe (2,1) quay phải; rào (3,1); van (5,1) sau rào mở cửa (2,2); cú giật đưa xe về (1,1); hành lang xuống tới cờ (2,5).
  var SAN_K3 = ['#######', '#..=.N#', '##C####', '##.####', '##.####', '##.####', '##F####', '#######'];   // hành lang xuống năm ô (9 nhịp: mốc cho kho-cu.4 13 nhịp)
  // kho-cu.4: thùng gỗ (2,1) chắn làn trên; xe (1,1) né xuống làn dưới (sidestep), đi tới (4,2), van (5,2) sát mũi mở cửa (4,3); cờ (4,4).
  var SAN_K4 = ['#######', '#.o...#', '#....N#', '####C##', '####F##', '#######'];
  // kho-cu.5: thùng gỗ (2,1) chắn TIA tới van (4,1); xe né xuống làn dưới, tới (4,2), quay lên nhìn van sát mũi, phun; van mở cửa (5,2); cờ (6,2).
  var SAN_K5 = ['########', '#.o.N###', '#....CF#', '########'];
  // kho-cu.6: go_to_wall() dừng sát rào (5,1) (rào là vật cản của mắt hồng ngoại); phun mạnh qua rào trúng van (7,1) mở cửa (4,2); giật về (3,1), tiến lại, xuống cờ (4,5).
  var SAN_K6 = ['#########', '#....=.N#', '####C####', '####.####', '####.####', '####F####', '#########'];
  // kho-cu.7 / .8: hai trạm nút đè (1,2), (3,2), mỗi nút mở cửa ngay trên nó; sau cửa là van: (1,0) ĐANG NÓNG (để yên), (3,0) đóng → phun, mở cửa (5,2); cờ (6,2).
  var SAN_K7 = ['#N#N###', '#C#C###', '.M.M.CF'];
  var NOI_K7 = [noi(1, 2, [[1, 1]]), noi(3, 2, [[3, 1]]), noi(3, 0, [[5, 2]])];
  // kho-cu.8 (đố): đổi chỗ: van (1,0) đóng mở cửa (5,2), van (3,0) đang nóng.
  var NOI_K8 = [noi(1, 2, [[1, 1]]), noi(3, 2, [[3, 1]]), noi(1, 0, [[5, 2]])];
  // kho-cu.9: xe (5,1) quay xuống, thùng nặng (5,2) ngay trước mũi; đẩy thùng xuống nút đè (5,3): cửa (6,2) mở và giữ; quay sang phải, phun van (7,2) mở cửa (2,2);
  //   quay đầu, đi bốn ô sang trái tới cờ (1,2).
  var SAN_K9 = ['#########', '#####.###', '#FC..HCN#', '#####M###', '#########'];
  var NOI_K9 = [noi(5, 3, [[6, 2]]), noi(7, 2, [[2, 2]])];
  // kho-cu.10 (trùm): như kho-cu.9 nhưng van (7,2) nằm sau RÀO (6,2) + cửa (5,2)… : thùng (4,2) đẩy xuống nút (4,3) mở cửa (5,2); tia mạnh qua cửa và rào (6,2) trúng van (8,2)
  //   mở cửa (2,2); giật bị cửa (2,2) còn đóng chặn (xe đứng yên); quay đầu, tới (1,2), quẹo trái đi xuống cờ (1,5).
  var SAN_K10 = ['##########', '####.#####', '#.CCHC=.N#', '#.##M#####', '#.########', '#F########', '##########'];
  var NOI_K10 = [noi(4, 3, [[5, 2]]), noi(8, 2, [[2, 2], [3, 2]])];

  /* ------------------------------------------------------------------- sân chương 2 */
  // che-kho-cu.1: hai trạm nút đè (1,2), (3,2) mở cửa trên; van (1,0) mở cửa (5,2), van (3,0) mở cửa (6,2); cờ (7,2).
  var SAN_C1 = ['#N#N####', '#C#C####', '.M.M.CCF'];
  var NOI_C1 = [noi(1, 2, [[1, 1]]), noi(3, 2, [[3, 1]]), noi(1, 0, [[5, 2]]), noi(3, 0, [[6, 2]])];
  // che-kho-cu.2: hai rào. Xe (2,1) quay phải: rào (3,1), van (5,1) mở cửa (3,2). Quẹo phải xuống (2,2): rào (2,3), van (2,5) mở cửa (4,2); cờ (5,2).
  var SAN_C2 = ['#######', '#..=.N#', '##.CCF#', '##=####', '##.####', '##N####', '#######'];
  var NOI_C2 = [noi(5, 1, [[3, 2]]), noi(2, 5, [[4, 2]])];
  // che-kho-cu.3: sân kho-cu.9 rộng hơn: cờ (1,2) cách sáu ô (forward(6) sau khi quay đầu).
  var SAN_C3 = ['###########', '#######.###', '#FC....HCN#', '#######M###', '###########'];
  var NOI_C3 = [noi(7, 3, [[8, 2]]), noi(9, 2, [[2, 2]])];
  // che-kho-cu.4: thùng gỗ (2,1); xe (1,1) vòng qua về (3,1); van (5,1) cách một ô trống (phun nhẹ tới) mở cửa (4,2); cờ (4,3).
  var SAN_C4 = ['#######', '#.o..N#', '#...C##', '#...F##', '#######'];
  // che-kho-cu.5 / .8: xe (1,1) quay phải: hai ô rồi rào (4,1), van (6,1) mở cửa (4,4). Quẹo phải tại (3,1) xuống: ba ô tới (3,4), rào (3,5), van (3,7) mở cửa (5,4); cờ (7,4).
  //   Đoạn hai dài hơn đoạn một, nên thân viết cứng forward(2) ở đoạn hai dừng sớm một ô: tia mạnh vẫn trúng van nhưng xe quẹo trái ở (3,3) đâm tường.
  var SAN_C5 = ['#########', '#...=.N##', '###.#####', '###.#####', '###.CC.F#', '###=#####', '###.#####', '###N#####', '#########'];
  var NOI_C5 = [noi(6, 1, [[4, 4]]), noi(3, 7, [[5, 4]])];
  // che-kho-cu.6: ba trạm nút đè liền nhau (1,2), (3,2), (5,2); ba van mở ba cửa (7,2), (8,2), (9,2); cờ (10,2).
  var SAN_C6 = ['#N#N#N#####', '#C#C#C#####', '.M.M.M.CCCF'];
  var NOI_C6 = [noi(1, 2, [[1, 1]]), noi(3, 2, [[3, 1]]), noi(5, 2, [[5, 1]]), noi(1, 0, [[7, 2]]), noi(3, 0, [[8, 2]]), noi(5, 0, [[9, 2]])];
  // che-kho-cu.7: sân kho-cu.7 (van (1,0) nóng, van (3,0) đóng mở cửa (5,2)).
  // che-kho-cu.9: xe (1,1); nút đè (3,1) mở cửa (4,1); van (5,1) mở cửa (3,2); cờ (3,3).
  var SAN_C9 = ['#######', '#..MCN#', '###C###', '###F###', '#######'];
  var NOI_C9 = [noi(3, 1, [[4, 1]]), noi(5, 1, [[3, 2]])];
  // che-kho-cu.10 (trùm): thùng gỗ (1,3) chắn làn, vòng qua về (2,3); nút đè (3,3) mở cửa (3,2) trên nó, van (3,1) mở cửa (4,3) chắn đường; rào (5,3), van (7,3) sau rào mở cửa (4,4); cờ (4,5).
  var SAN_C10 = ['##########', '###N######', '###C######', '.o.MC=.N##', '...#C#####', '####F#####', '##########'];
  var NOI_C10 = [noi(3, 3, [[3, 2]]), noi(3, 1, [[4, 3]]), noi(7, 3, [[4, 4]])];

  /* ------------------------------------------------------------- chương trình */
  var L_K1 = ['move()', 'squirt("low")', 'tr_right()', 'move()', 'move()'];
  var L_K2 = ['forward(2)', 'squirt("high")', 'move()', 'tr_right()', 'forward(2)'];
  var L_K3 = ['squirt("high")', 'move()', 'tr_right()', 'forward(5)'];
  var L_K4 = ['sidestep()', 'forward(3)', 'squirt("low")', 'tr_right()', 'forward(2)'];
  var L_K5 = ['sidestep()', 'forward(3)', 'tr_left()', 'squirt("low")', 'tr_right()', 'forward(2)'];
  var L_K6 = ['go_to_wall()', 'squirt("high")', 'move()', 'tr_right()', 'forward(4)'];
  var L_K7 = nhieu(FOR(2, nhieu(['move()', 'tr_left()'], IF('not warm()', ['squirt("low")']), ['tr_right()', 'move()'])), ['forward(2)']);
  var C_K8 = nhieu(FOR(2, ['move()', 'peek_valve()', 'move()']), ['forward(2)']);
  var L_K9 = ['move()', 'tr_left()', 'squirt("low")', 'spin()', 'forward(4)'];
  var L_K10 = ['move()', 'tr_left()', 'squirt("high")', 'spin()', 'forward(3)', 'tr_left()', 'forward(3)'];
  var C_C1 = ['pad_open()', 'move()', 'pad_open()', 'forward(4)'];
  var C_C2 = ['fence_shot()', 'tr_right()', 'move()', 'fence_shot()', 'tr_left()', 'forward(3)'];
  var C_C3 = ['hold_shot()', 'spin()', 'forward(6)'];
  var C_C4 = ['pass_crate()', 'squirt("low")', 'move()', 'tr_right()', 'forward(2)'];
  var C_C5 = ['fence_at(2)', 'tr_right()', 'fence_at(3)', 'tr_left()', 'forward(4)'];
  var C_C6 = ['scan_pads(3)', 'forward(4)'];
  var C_C7 = ['warm_pad()', 'move()', 'warm_pad()', 'forward(3)'];
  var C_C8 = ['fence_far(2)', 'tr_right()', 'fence_far(3)', 'tr_left()', 'forward(4)'];
  var C_C9 = ['move()', 'pad_shot()', 'tr_right()', 'forward(2)'];
  var L_C10 = ['pass_crate()', 'pad_open()', 'move()', 'fence_shot()', 'tr_right()', 'forward(2)'];

  var DS = [
    /* ================================================================ chương kho-cu: xe cứu hỏa gặp nút đè, hàng rào, thùng gỗ */
    man({
      chuong: 'kho-cu', so: 1, ten: 'Đè nút, phun qua cửa', yMoi: 'nút đè M của kho cũ: xe đứng trên nút thì cửa trước mũi mở, tia nước bay qua cửa tới van',
      hamCuaEmCan: ['move', 'squirt', 'tr_right', 'tr_left'], chiChay: true, chinhCoDinh: true,
      deBai: 'Góc kho cũ của nhà máy còn nút đè M từ thời xe chở hàng: xe đứng lên nút thì cánh cửa nối với nó mở, rời nút thì cửa đóng lại. Cửa đóng chặn cả tia nước. ' +
        'Bấm Chạy xem xe tiến lên nút, cửa trước mũi mở, phun nhẹ qua cửa trúng van; van mở cửa dưới nút cho xe xuống cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: move() lên nút rồi squirt("low") qua cửa vừa mở.',
      san: SAN_K1, batDau: { x: 1, y: 1, huong: 1 }, noi: [noi(2, 1, [[3, 1]]), noi(4, 1, [[2, 2]])],
      maMau: bai(L_K1),
      sao: { o: 13, nhip: 6 },
      loiGiai: bai(L_K1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# lên nút cho cửa mở rồi phun'].concat(L_K1)) },
      loiSai: [
        { moTa: 'Phun ngay chỗ đứng: cửa còn đóng chặn tia, van không mở', baiLam: bai(['squirt("low")', 'move()', 'tr_right()', 'move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quẹo trái sau khi phun: xe đâm tường', baiLam: bai(['move()', 'squirt("low")', 'tr_left()', 'move()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Xe đứng trên M thì cửa nối với nó mở; rời nút là cửa đóng.', 'Màn sau van ở xa hơn: em tự chọn lực phun.']
    }),

    man({
      chuong: 'kho-cu', so: 2, ten: 'Van xa sau cửa', yMoi: 'van sau cửa cách hai ô trống: phun mạnh, cú giật đẩy xe rời nút (cửa đóng lại nhưng van đã mở)',
      hamCuaEmCan: ['forward', 'squirt', 'move', 'tr_right'],
      deBai: 'Nút đè cách xe hai ô; van sau cửa cách nút thêm hai ô trống nên phun nhẹ không tới. Lên nút, phun mạnh qua cửa, rồi tới cờ. Cú giật đẩy xe rời nút: cửa đóng lại, nhưng van đã mở cửa dưới nút.',
      veMaMau: 'Chương trình có sẵn phun nhẹ: tia nước rơi giữa đường. Chạm chữ "low" đổi lực, rồi xem xe giật tới đâu.',
      san: SAN_K2, batDau: { x: 1, y: 1, huong: 1 }, noi: [noi(3, 1, [[4, 1]]), noi(6, 1, [[3, 2]])],
      maMau: bai(['forward(2)', 'squirt("low")', 'tr_right()', 'forward(2)']),
      sao: { o: 15, nhip: 8 },
      loiGiai: bai(L_K2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# van xa thì phun mạnh, nhớ bù cú giật'].concat(L_K2)) },
      loiSai: [
        { moTa: 'Phun nhẹ: tia nước rơi giữa đường, van không mở', baiLam: bai(['forward(2)', 'squirt("low")', 'move()', 'tr_right()', 'forward(2)']), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Chưa lên nút đã phun: cửa còn đóng chặn tia', baiLam: bai(['forward(1)', 'squirt("high")', 'move()', 'tr_right()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên bù cú giật: xe quẹo phải ở ô bên cạnh, đâm tường', baiLam: bai(['forward(2)', 'squirt("high")', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Từ nút, van cách hai ô trống: distance() là 2 thì phải phun mạnh.', 'Phun mạnh xe giật lùi một ô: tiến lại một ô rồi mới quẹo.']
    }),

    man({
      chuong: 'kho-cu', so: 3, ten: 'Tia nước qua rào', yMoi: 'hàng rào của kho cũ: xe không qua được nhưng tia nước bay qua',
      hamCuaEmCan: ['squirt', 'move', 'tr_right', 'forward'],
      deBai: 'Hàng rào thấp chắn ngang hành lang: xe không qua được, nhưng tia nước bay qua. Van sau rào mở cửa ngay dưới xe. Phun mạnh cho tới van, bù cú giật, rồi quẹo phải đi xuống cờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng vào rào. Xe đâm rào như đâm tường.',
      san: SAN_K3, batDau: { x: 2, y: 1, huong: 1 }, noi: [noi(5, 1, [[2, 2]])],
      maMau: bai(['move()', 'move()', 'tr_right()', 'forward(5)']),
      sao: { o: 14, nhip: 9 },
      loiGiai: bai(L_K3),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# tia nước bay qua rào'].concat(L_K3)) },
      loiSai: [
        { moTa: 'Đi thẳng vào rào: xe đâm rào', baiLam: bai(['move()', 'move()', 'tr_right()', 'forward(5)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Phun nhẹ: tia nước qua rào rồi rơi, chưa tới van', baiLam: bai(['squirt("low")', 'move()', 'tr_right()', 'forward(5)']), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên bù cú giật: xe quẹo ở ô bên trái cửa, đâm tường', baiLam: bai(['squirt("high")', 'tr_right()', 'forward(5)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Rào là vật cản với xe, không phải với tia nước.', 'Van cách ba ô (rào cũng tính một ô): phun mạnh, rồi move() bù giật.']
    }),

    man({
      chuong: 'kho-cu', so: 4, ten: 'Thùng gỗ chắn đường', yMoi: 'thùng gỗ nằm đất của kho cũ: xích không gắp, không đẩy được, phải né sang làn bên',
      hamCuaEmCan: ['sidestep', 'forward', 'squirt', 'tr_right'],
      deBai: 'Một thùng gỗ cũ nằm chắn làn trên. Xích không gắp được, cũng không đẩy được thùng gỗ: né xuống làn dưới bằng sidestep(), đi tới sát van, phun nhẹ mở cửa rồi xuống cờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng: xe húc thùng gỗ, đứng yên.',
      san: SAN_K4, batDau: { x: 1, y: 1, huong: 1 }, noi: [noi(5, 2, [[4, 3]])],
      maMau: bai(['forward(3)', 'squirt("low")', 'tr_right()', 'forward(2)']),
      sao: { o: 21, nhip: 13 },
      loiGiai: bai(L_K4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# né thùng gỗ sang làn dưới'].concat(L_K4)) },
      loiSai: [
        { moTa: 'Đi thẳng: xe húc thùng gỗ', baiLam: bai(['forward(3)', 'squirt("low")', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Né rồi đi thiếu một ô: van còn cách một ô trống, cửa vẫn mở nhưng xe quẹo trúng tường', baiLam: bai(['sidestep()', 'forward(2)', 'squirt("low")', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['sidestep() của gói Bánh xích: quẹo phải, một ô, quẹo trái: xe sang làn dưới.', 'Làn dưới đi ba ô là sát van.']
    }),

    man({
      chuong: 'kho-cu', so: 5, ten: 'Thùng gỗ chắn tia', yMoi: 'thùng gỗ chắn cả tia nước: phải né sang làn bên rồi quay lại nhìn van',
      hamCuaEmCan: ['sidestep', 'forward', 'tr_left', 'squirt', 'tr_right'],
      deBai: 'Van ở cuối làn trên, nhưng thùng gỗ nằm giữa đường chắn cả tia nước. Né xuống làn dưới, đi tới ngay dưới van, quay lên phun nhẹ, rồi quay lại đi tiếp qua cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn phun từ chỗ đứng: tia nước đập vào thùng gỗ.',
      san: SAN_K5, batDau: { x: 1, y: 1, huong: 1 }, noi: [noi(4, 1, [[5, 2]])],
      maMau: bai(['squirt("high")', 'sidestep()', 'forward(4)']),
      sao: { o: 22, nhip: 15 },
      loiGiai: bai(L_K5),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# thùng gỗ chắn tia: nhìn van từ làn dưới'].concat(L_K5)) },
      loiSai: [
        { moTa: 'Phun từ chỗ đứng: tia nước bị thùng gỗ chặn', baiLam: bai(['squirt("high")', 'sidestep()', 'forward(4)']), phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Đi thiếu một ô rồi quay lên: trước mũi là ô trống, tia nước bay vào tường', baiLam: bai(['sidestep()', 'forward(2)', 'tr_left()', 'squirt("low")', 'tr_right()', 'forward(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay lại: xe húc van', baiLam: bai(['sidestep()', 'forward(3)', 'tr_left()', 'squirt("low")', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Từ làn dưới, ô ngay dưới van: quay trái là mũi xe hướng lên van.', 'Van sát mũi thì phun nhẹ là đủ, xe không giật.']
    }),

    man({
      chuong: 'kho-cu', so: 6, ten: 'Mắt hồng ngoại thấy rào', yMoi: 'rào là vật cản với mắt hồng ngoại: go_to_wall() dừng sát rào, rồi phun mạnh qua rào',
      hamCuaEmCan: ['go_to_wall', 'squirt', 'move', 'tr_right', 'forward'],
      deBai: 'Hành lang dài, cuối hành lang là hàng rào, van nằm sau rào. Mắt hồng ngoại thấy rào như thấy tường: go_to_wall() đưa xe tới sát rào. Phun mạnh qua rào, bù cú giật, quẹo phải xuống cờ.',
      veMaMau: 'Chương trình có sẵn phun ngay từ đầu hành lang: tia nước mạnh tới van nhưng xe đứng xa cửa.',
      san: SAN_K6, batDau: { x: 1, y: 1, huong: 1 }, noi: [noi(7, 1, [[4, 2]])],
      maMau: bai(['squirt("high")', 'move()', 'tr_right()', 'forward(4)']),
      sao: { o: 17, nhip: 11 },
      loiGiai: bai(L_K6),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mắt hồng ngoại dừng ở rào'].concat(L_K6)) },
      congThucKhac: [{ moTa: 'Đếm cứng forward(3) thay cho go_to_wall(): đúng ở sân này', baiLam: bai(['forward(3)', 'squirt("high")', 'move()', 'tr_right()', 'forward(4)']) }],
      loiSai: [
        { moTa: 'Phun ngay từ đầu hành lang: van mở nhưng xe quẹo vào tường', baiLam: bai(['squirt("high")', 'move()', 'tr_right()', 'forward(4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Phun nhẹ sát rào: tia qua rào rồi rơi trước van', baiLam: bai(['go_to_wall()', 'squirt("low")', 'move()', 'tr_right()', 'forward(4)']), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên bù cú giật: xe quẹo ở ô bên trái cửa', baiLam: bai(['go_to_wall()', 'squirt("high")', 'tr_right()', 'forward(4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['distance() đếm tới rào là dừng, nên go_to_wall() đứng ngay trước rào.', 'Sát rào, van cách ba ô: phun mạnh.']
    }),

    man({
      chuong: 'kho-cu', so: 7, ten: 'Van nóng sau cửa', yMoi: 'xe lên nút đè, cửa mở mới nhìn được van: warm() qua cửa mở, van nóng thì để yên',
      hamCuaEmCan: ['move', 'tr_left', 'squirt', 'tr_right', 'forward'],
      deBai: 'Hai nút đè trên hành lang, mỗi nút mở cánh cửa ngay trên nó; sau mỗi cửa là một van. Cửa đóng thì mắt hồng ngoại chỉ thấy cửa: phải lên nút cho cửa mở rồi mới hỏi warm(). ' +
        'Van nào đang nóng thì để yên, van đóng thì phun nhẹ cho mở; van đóng mở cửa cuối hành lang tới cờ.',
      veMaMau: 'Chương trình có sẵn hỏi warm() ngược: phun van nóng, bỏ van đóng.',
      san: SAN_K7, batDau: { x: 0, y: 2, huong: 1 }, noi: NOI_K7, nutBat: [o(1, 0)],
      maMau: bai(nhieu(FOR(2, nhieu(['move()', 'tr_left()'], IF('warm()', ['squirt("low")']), ['tr_right()', 'move()'])), ['forward(2)'])),
      sao: { o: 21, nhip: 15 },
      loiGiai: bai(L_K7),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# lên nút, cửa mở rồi mới đo nhiệt'].concat(L_K7)) },
      loiSai: [
        { moTa: 'Hỏi warm() ngược: phun van nóng, bỏ van đóng, cửa cuối không mở', baiLam: bai(nhieu(FOR(2, nhieu(['move()', 'tr_left()'], IF('warm()', ['squirt("low")']), ['tr_right()', 'move()'])), ['forward(2)'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi warm() trước khi lên nút: cửa còn đóng, không thấy van', baiLam: bai(nhieu(FOR(2, nhieu(['tr_left()'], IF('not warm()', ['squirt("low")']), ['tr_right()', 'move()', 'move()'])), ['forward(2)'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay lại: xe đi lên cửa rồi húc van', baiLam: bai(nhieu(FOR(2, nhieu(['move()', 'tr_left()'], IF('not warm()', ['squirt("low")']), ['move()'])), ['forward(2)'])), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đứng trên nút, quay trái: cửa đã mở nên warm() thấy van.', 'if not warm(): squirt("low"). Van nóng đang mở, phun là đóng nó lại.']
    }),

    man({
      chuong: 'kho-cu', so: 8, ten: 'Đố: hàm nhìn van lỗi', yMoi: 'sửa hàm lỗi: peek_valve() đổi dấu điều kiện warm()',
      hamCuaEmCan: ['move', 'forward', 'tr_left', 'squirt', 'tr_right'], chinhCoDinh: true,
      deBai: 'Sola viết peek_valve(): quay trái, nhìn van qua cửa, phun nếu cần, quay lại. Chương trình chính đã khóa: lên nút, peek_valve(), tiến. Nhưng xe phun nhầm van nóng và bỏ qua van đóng. Sửa một dòng trong peek_valve().',
      veMaMau: 'Chạy thử. Hàm phun khi warm() là True: lúc đó van đang nóng, tức đang mở.',
      san: SAN_K7, batDau: { x: 0, y: 2, huong: 1 }, noi: NOI_K8, nutBat: [o(3, 0)],
      maMau: bai(C_K8, [H('peek_valve', [], T_PEEK_CU)]),
      sao: { o: 22, nhip: 15 },
      loiGiai: bai(C_K8, [H('peek_valve', [], T_PEEK)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_K8, [H('peek_valve', [], ['# chưa nóng mới phun'].concat(T_PEEK))]) },
      loiSai: [
        { moTa: 'Để nguyên: phun van nóng, bỏ van đóng', baiLam: bai(C_K8, [H('peek_valve', [], T_PEEK_CU)]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa nhầm chỗ, bỏ mất dòng quay lại: xe đi lên cửa rồi húc van', baiLam: bai(C_K8, [H('peek_valve', [], nhieu(['tr_left()'], IF('not warm()', ['squirt("low")'])))]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Van nóng là van đang mở: phun là đóng nó. Chỉ phun khi not warm().', 'Chỉ cần thêm chữ not.']
    }),

    man({
      chuong: 'kho-cu', so: 9, ten: 'Thùng giữ cửa cho tia', yMoi: 'thùng nặng đè nút thì giữ cửa mở mãi: đẩy thùng lên nút, quay sang phun van qua cửa',
      hamCuaEmCan: ['move', 'tr_left', 'tr_right', 'squirt', 'spin', 'forward'],
      deBai: 'Xe không đứng trên nút mãi được, nhưng thùng nặng thì được: đẩy thùng xuống nút đè, cửa bên phải mở và giữ. Quay sang phải, phun van sau cửa; van mở cửa bên trái. Quay đầu, đi sang trái tới cờ.',
      veMaMau: 'Chương trình có sẵn phun trước khi đẩy thùng: tia nước đập vào thùng.',
      san: SAN_K9, batDau: { x: 5, y: 1, huong: 2 }, noi: NOI_K9,
      maMau: bai(['squirt("low")', 'move()', 'tr_left()', 'spin()', 'forward(4)']),
      sao: { o: 20, nhip: 12 },
      loiGiai: bai(L_K9),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# thùng đè nút thì cửa mở mãi'].concat(L_K9)) },
      congThucKhac: [{ moTa: 'Quay đầu bằng hai lần tr_left() thay cho spin()', baiLam: bai(['move()', 'tr_left()', 'squirt("low")', 'tr_left()', 'tr_left()', 'forward(4)']) }],
      loiSai: [
        { moTa: 'Phun trước khi đẩy thùng: thùng chắn tia', baiLam: bai(['squirt("low")', 'move()', 'tr_left()', 'spin()', 'forward(4)']), phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Quay phải thay vì quay trái: tia nước đập vào cửa còn đóng', baiLam: bai(['move()', 'tr_right()', 'squirt("low")', 'spin()', 'forward(4)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay đầu: xe tiến vào cửa đang mở rồi húc van', baiLam: bai(['move()', 'tr_left()', 'squirt("low")', 'forward(4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Xích đẩy thùng: tiến một ô là thùng nằm lên nút.', 'Xe đang quay xuống: tr_left() cho mũi hướng sang phải, sát cửa vừa mở.']
    }),

    man({
      chuong: 'kho-cu', so: 10, ten: 'Trùm: Góc kho cũ', yMoi: 'trùm: thùng đè nút giữ cửa, tia mạnh bay qua cửa và rào tới van, cú giật bị cửa đóng chặn',
      hamCuaEmCan: ['move', 'tr_left', 'tr_right', 'squirt', 'spin', 'forward'],
      deBai: 'Đẩy thùng xuống nút đè cho cửa bên phải mở. Sau cửa là hàng rào rồi van: phun mạnh để tia bay qua cả cửa lẫn rào. Van mở hai cửa bên trái: quay đầu, đi hết hành lang, quẹo trái xuống cờ.',
      veMaMau: 'Tự viết chương trình. Phun mạnh xe giật lùi, nhưng cửa sau lưng còn đóng nên xe đứng yên.',
      san: SAN_K10, batDau: { x: 4, y: 1, huong: 2 }, noi: NOI_K10,
      maMau: bai([]),
      sao: { o: 22, nhip: 16 },
      loiGiai: bai(L_K10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# tia mạnh bay qua cửa mở và rào'].concat(L_K10)) },
      loiSai: [
        { moTa: 'Phun nhẹ: tia rơi ngay sau rào', baiLam: bai(['move()', 'tr_left()', 'squirt("low")', 'spin()', 'forward(3)', 'tr_left()', 'forward(3)']), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên đẩy thùng: cửa đóng chặn tia', baiLam: bai(['tr_left()', 'squirt("high")', 'spin()', 'forward(3)', 'tr_left()', 'forward(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Cuối hành lang quẹo phải: xe đâm tường', baiLam: bai(['move()', 'tr_left()', 'squirt("high")', 'spin()', 'forward(3)', 'tr_right()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Thùng đè nút thì cửa mở mãi, không cần xe đứng giữ.', 'Sau khi phun: spin(), forward(3), tr_left(), forward(3).'],
      huyHieu: { ma: 'kho-cu', ten: 'Huy hiệu Góc kho cũ' }
    }),

    /* ================================================================ chương che-kho-cu: chế lệnh cho góc kho cũ */
    man({
      chuong: 'che-kho-cu', so: 1, ten: 'Hàm pad_open()', yMoi: 'chế pad_open(): lên nút đè rồi open_left() phun van bên trái qua cửa vừa mở',
      hamCuaEmCan: ['open_left', 'open_right', 'move', 'forward', 'tr_left', 'tr_right', 'squirt'], taoHam: ['pad_open'], chinhCoDinh: true,
      deBai: 'Hai trạm nút đè, mỗi nút mở cửa ngay trên nó, sau cửa là van. Chương trình chính đã khóa, gọi pad_open() ở hai trạm. Em chế pad_open(): tiến lên nút, rồi open_left() của gói Băng chuyền để phun van bên trái qua cửa vừa mở.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo pad_open(): hai dòng.',
      san: SAN_C1, batDau: { x: 0, y: 2, huong: 1 }, noi: NOI_C1,
      maMau: bai(C_C1),
      sao: { o: 21, nhip: 17 },
      loiGiai: { chinh: C_C1.slice(), hamCuaEmMoi: [H('pad_open', [], T_PAD_OPEN)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C1), hamCuaEmMoi: [H('pad_open', [], ['# lên nút cho cửa mở rồi phun trái'].concat(T_PAD_OPEN))] },
      congThucKhac: [{ moTa: 'Viết thẳng tr_left(), squirt("low"), tr_right() thay cho open_left()', baiLam: bai(C_C1), hamCuaEmMoi: [H('pad_open', [], ['move()', 'tr_left()', 'squirt("low")', 'tr_right()'])] }],
      loiSai: [
        { moTa: 'Quên tiến lên nút: phun vào cửa còn đóng', baiLam: bai(C_C1), hamCuaEmMoi: [H('pad_open', [], ['open_left()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phun bên phải: tia bay ra mép sân', baiLam: bai(C_C1), hamCuaEmMoi: [H('pad_open', [], ['move()', 'open_right()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi pad_open() mà chưa chế hàm', baiLam: bai(C_C1), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Hàm của em gọi được hàm của em: open_left() đã có từ gói Băng chuyền.', 'Thân hàm: move() rồi open_left().']
    }),

    man({
      chuong: 'che-kho-cu', so: 2, ten: 'Hàm fence_shot()', yMoi: 'chế fence_shot(): phun mạnh qua rào rồi tiến một ô bù cú giật',
      hamCuaEmCan: ['squirt', 'move', 'tr_right', 'tr_left', 'forward'], taoHam: ['fence_shot'], chinhCoDinh: true,
      deBai: 'Hai hàng rào, sau mỗi rào một van; mỗi van mở một cửa trên đường tới cờ. Chương trình chính đã khóa, gọi fence_shot() ở hai chỗ. Em chế fence_shot(): phun mạnh qua rào rồi tiến một ô bù cú giật, để xe lại đứng sát rào.',
      veMaMau: 'Chương trình chính bị khóa. Tạo fence_shot(): hai dòng.',
      san: SAN_C2, batDau: { x: 2, y: 1, huong: 1 }, noi: NOI_C2,
      maMau: bai(C_C2),
      sao: { o: 21, nhip: 12 },
      loiGiai: { chinh: C_C2.slice(), hamCuaEmMoi: [H('fence_shot', [], T_FENCE_SHOT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C2), hamCuaEmMoi: [H('fence_shot', [], ['# phun qua rào rồi bù giật'].concat(T_FENCE_SHOT))] },
      congThucKhac: [{ moTa: 'Viết spray("high"), wait(), move() thay cho squirt("high")', baiLam: bai(C_C2), hamCuaEmMoi: [H('fence_shot', [], ['spray("high")', 'wait()', 'move()'])] }],
      loiSai: [
        { moTa: 'Quên bù cú giật: sau rào thứ nhất xe quẹo ở ô bên trái, đâm tường', baiLam: bai(C_C2), hamCuaEmMoi: [H('fence_shot', [], ['squirt("high")'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Phun nhẹ: tia qua rào rồi rơi trước van', baiLam: bai(C_C2), hamCuaEmMoi: [H('fence_shot', [], ['squirt("low")', 'move()'])], phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Gọi fence_shot() mà chưa chế hàm', baiLam: bai(C_C2), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Phun mạnh thì xe giật lùi một ô: move() ngay sau là xe về chỗ cũ.', 'Thân hàm: squirt("high") rồi move().']
    }),

    man({
      chuong: 'che-kho-cu', so: 3, ten: 'Hàm hold_shot()', yMoi: 'chế hold_shot(): đẩy thùng xuống nút đè, quay sang phải, phun van qua cửa vừa mở',
      hamCuaEmCan: ['move', 'tr_left', 'tr_right', 'squirt', 'spin', 'forward'], taoHam: ['hold_shot'], chinhCoDinh: true,
      deBai: 'Như màn thùng giữ cửa: xe quay xuống, thùng ngay trước mũi, nút đè dưới thùng, cửa và van bên phải. Chương trình chính đã khóa: hold_shot(), quay đầu, đi về cờ. Em chế hold_shot(): đẩy thùng lên nút, quay trái, phun nhẹ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo hold_shot(): ba dòng.',
      san: SAN_C3, batDau: { x: 7, y: 1, huong: 2 }, noi: NOI_C3,
      maMau: bai(C_C3),
      sao: { o: 21, nhip: 14 },
      loiGiai: { chinh: C_C3.slice(), hamCuaEmMoi: [H('hold_shot', [], T_HOLD_SHOT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C3), hamCuaEmMoi: [H('hold_shot', [], ['# thùng đè nút, cửa mở mãi'].concat(T_HOLD_SHOT))] },
      loiSai: [
        { moTa: 'Quay phải: tia nước đập vào cửa bên trái còn đóng', baiLam: bai(C_C3), hamCuaEmMoi: [H('hold_shot', [], ['move()', 'tr_right()', 'squirt("low")'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên đẩy thùng: thùng chắn tia', baiLam: bai(C_C3), hamCuaEmMoi: [H('hold_shot', [], ['tr_left()', 'squirt("low")'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi hold_shot() mà chưa chế hàm', baiLam: bai(C_C3), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Xe quay xuống: tr_left() cho mũi hướng sang phải.', 'Thân hàm: move(), tr_left(), squirt("low").']
    }),

    man({
      chuong: 'che-kho-cu', so: 4, ten: 'Hàm pass_crate()', yMoi: 'chế pass_crate(): né sang làn phải, đi qua thùng gỗ, về làn cũ (sáu dòng)',
      hamCuaEmCan: ['sidestep', 'move', 'tr_left', 'tr_right', 'squirt', 'forward'], taoHam: ['pass_crate'], chinhCoDinh: true,
      deBai: 'Thùng gỗ chắn làn trên, van ở cuối làn trên. Chương trình chính đã khóa: pass_crate() rồi phun nhẹ, đi qua cửa xuống cờ. Em chế pass_crate(): sidestep() sang làn dưới, tiến hai ô, quay trái, tiến một ô về làn trên, quay phải.',
      veMaMau: 'Chương trình chính bị khóa. Tạo pass_crate(): sáu dòng, xe về đúng làn cũ ngay sau thùng gỗ.',
      san: SAN_C4, batDau: { x: 1, y: 1, huong: 1 }, noi: [noi(5, 1, [[4, 2]])],
      maMau: bai(C_C4),
      sao: { o: 27, nhip: 18 },
      loiGiai: { chinh: C_C4.slice(), hamCuaEmMoi: [H('pass_crate', [], T_PASS_CRATE)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C4), hamCuaEmMoi: [H('pass_crate', [], ['# vòng qua thùng gỗ rồi về làn'].concat(T_PASS_CRATE))] },
      loiSai: [
        { moTa: 'Không về làn trên: phun từ làn dưới vào cửa còn đóng', baiLam: bai(C_C4), hamCuaEmMoi: [H('pass_crate', [], ['sidestep()', 'move()', 'move()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi thẳng thay vì né: xe húc thùng gỗ', baiLam: bai(C_C4), hamCuaEmMoi: [H('pass_crate', [], ['move()', 'move()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi pass_crate() mà chưa chế hàm', baiLam: bai(C_C4), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['sidestep() đưa xe sang làn phải (ở đây là làn dưới), mũi vẫn hướng cũ.', 'Về làn: tr_left(), move(), tr_right().']
    }),

    man({
      chuong: 'che-kho-cu', so: 5, ten: 'Hàm fence_at(n)', yMoi: 'hàm có tham số: fence_at(n) tiến n ô tới sát rào rồi phun mạnh qua rào, bù cú giật',
      hamCuaEmCan: ['forward', 'squirt', 'move', 'tr_right', 'tr_left', 'fence_shot'], taoHam: ['fence_at'], chinhCoDinh: true,
      deBai: 'Hai hàng rào ở hai hành lang dài ngắn khác nhau, mỗi van sau rào mở một cửa trên đường tới cờ. Chương trình chính đã khóa, gọi fence_at(2) rồi fence_at(3). Em chế fence_at(n): tiến n ô tới sát rào, phun mạnh, tiến một ô bù cú giật.',
      veMaMau: 'Chương trình chính bị khóa. Tạo fence_at(n) với tham số n: ba dòng.',
      san: SAN_C5, batDau: { x: 1, y: 1, huong: 1 }, noi: NOI_C5,
      maMau: bai(C_C5),
      sao: { o: 21, nhip: 17 },
      loiGiai: { chinh: C_C5.slice(), hamCuaEmMoi: [H('fence_at', ['n'], T_FENCE_AT)] },
      loiGiaiKhac: { moTa: 'Gọi fence_shot() của em sau forward(n)', baiLam: bai(C_C5), hamCuaEmMoi: [H('fence_at', ['n'], ['# tới sát rào rồi phun qua rào', 'forward(n)', 'fence_shot()'])] },
      loiSai: [
        { moTa: 'Viết cứng forward(2): hành lang thứ hai dừng sớm một ô, tia vẫn trúng van nhưng xe quẹo trái vào tường', baiLam: bai(C_C5), hamCuaEmMoi: [H('fence_at', ['n'], ['forward(2)', 'squirt("high")', 'move()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên bù cú giật: xe quẹo ở ô bên trái, đâm tường', baiLam: bai(C_C5), hamCuaEmMoi: [H('fence_at', ['n'], ['forward(n)', 'squirt("high")'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi fence_at() mà chưa chế hàm', baiLam: bai(C_C5), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['fence_at(3) thì n là 3: forward(n) đi đúng ba ô.', 'Thân hàm: forward(n), squirt("high"), move().']
    }),

    man({
      chuong: 'che-kho-cu', so: 6, ten: 'Hàm scan_pads(n)', yMoi: 'vòng for với tham số trong hàm: scan_pads(n) đi qua n trạm nút đè, mỗi trạm pad_open() rồi tiến',
      hamCuaEmCan: ['pad_open', 'move', 'forward'], taoHam: ['scan_pads'], chinhCoDinh: true,
      deBai: 'Ba trạm nút đè liền nhau, ba van mở ba cửa cuối hành lang. Chương trình chính đã khóa: scan_pads(3) rồi đi tới cờ. Em chế scan_pads(n): lặp n lần, mỗi lần pad_open() của em rồi tiến một ô.',
      veMaMau: 'Chương trình chính bị khóa. Tạo scan_pads(n) với for i in range(n): trong thân hàm.',
      san: SAN_C6, batDau: { x: 0, y: 2, huong: 1 }, noi: NOI_C6,
      maMau: bai(C_C6),
      sao: { o: 22, nhip: 25 },
      loiGiai: { chinh: C_C6.slice(), hamCuaEmMoi: [H('scan_pads', ['n'], T_SCAN_PADS)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C6), hamCuaEmMoi: [H('scan_pads', ['n'], ['# n trạm nút đè'].concat(T_SCAN_PADS))] },
      loiSai: [
        { moTa: 'Viết cứng range(2): trạm thứ ba bị bỏ, cửa cuối còn đóng', baiLam: bai(C_C6), hamCuaEmMoi: [H('scan_pads', ['n'], FOR(2, ['pad_open()', 'move()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên tiến sau mỗi trạm: pad_open() thứ hai lên nhầm ô trống', baiLam: bai(C_C6), hamCuaEmMoi: [H('scan_pads', ['n'], FOR('n', ['pad_open()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi scan_pads() mà chưa chế hàm', baiLam: bai(C_C6), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thân hàm cũng chứa được vòng for; số lần là tham số n.', 'for i in range(n): rồi thụt vào pad_open() và move().']
    }),

    man({
      chuong: 'che-kho-cu', so: 7, ten: 'Hàm warm_pad()', yMoi: 'chế warm_pad(): lên nút đè, quay trái nhìn van qua cửa, chưa nóng thì phun, quay lại',
      hamCuaEmCan: ['move', 'tr_left', 'squirt', 'tr_right', 'forward'], taoHam: ['warm_pad'], chinhCoDinh: true,
      deBai: 'Hai trạm nút đè, van sau cửa trạm một đang nóng, trạm hai còn đóng. Chương trình chính đã khóa, gọi warm_pad() ở hai trạm. Em chế warm_pad(): tiến lên nút, quay trái, if not warm(): phun nhẹ, rồi quay lại.',
      veMaMau: 'Chương trình chính bị khóa. Tạo warm_pad(): năm dòng, có if not warm().',
      san: SAN_K7, batDau: { x: 0, y: 2, huong: 1 }, noi: NOI_K7, nutBat: [o(1, 0)],
      maMau: bai(C_C7),
      sao: { o: 22, nhip: 15 },
      loiGiai: { chinh: C_C7.slice(), hamCuaEmMoi: [H('warm_pad', [], T_WARM_PAD)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C7), hamCuaEmMoi: [H('warm_pad', [], ['# van nóng thì để yên'].concat(T_WARM_PAD))] },
      loiSai: [
        { moTa: 'Viết if warm(): phun van nóng, bỏ van đóng', baiLam: bai(C_C7), hamCuaEmMoi: [H('warm_pad', [], ['move()', 'tr_left()', 'if warm():', '    squirt("low")', 'tr_right()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay lại: xe đi lên cửa rồi húc van', baiLam: bai(C_C7), hamCuaEmMoi: [H('warm_pad', [], ['move()', 'tr_left()', 'if not warm():', '    squirt("low")'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi warm_pad() mà chưa chế hàm', baiLam: bai(C_C7), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Giống pad_open() nhưng có hỏi warm() trước khi phun.', 'Thân hàm: move(), tr_left(), if not warm(): squirt("low"), tr_right().']
    }),

    man({
      chuong: 'che-kho-cu', so: 8, ten: 'Đố: fence_far(n) đi cứng', yMoi: 'sửa hàm lỗi: tham số n bị bỏ quên, thân hàm viết cứng forward(2)',
      hamCuaEmCan: ['forward', 'squirt', 'move', 'tr_right', 'tr_left', 'fence_at'], chinhCoDinh: true,
      deBai: 'Sola chế fence_far(n): tiến n ô tới sát rào, phun mạnh, bù cú giật. Chương trình chính đã khóa, gọi fence_far(2) rồi fence_far(3). Nhưng ở hành lang thứ hai xe quẹo sớm rồi đâm tường. Tìm và sửa một dòng trong fence_far(n).',
      veMaMau: 'Chạy thử. Hàm nhận n mà có dùng n ở đâu không?',
      san: SAN_C5, batDau: { x: 1, y: 1, huong: 1 }, noi: NOI_C5,
      maMau: bai(C_C8, [H('fence_far', ['n'], ['forward(2)', 'squirt("high")', 'move()'])]),
      sao: { o: 21, nhip: 17 },
      loiGiai: bai(C_C8, [H('fence_far', ['n'], ['forward(n)', 'squirt("high")', 'move()'])]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_C8, [H('fence_far', ['n'], ['# đi đúng n ô', 'forward(n)', 'squirt("high")', 'move()'])]) },
      congThucKhac: [{ moTa: 'Gọi fence_at(n) của em trong fence_far(n)', baiLam: bai(C_C8, [H('fence_far', ['n'], ['fence_at(n)'])]) }],
      loiSai: [
        { moTa: 'Để nguyên forward(2): hành lang thứ hai dừng sớm, tia vẫn trúng van nhưng xe quẹo trái vào tường', baiLam: bai(C_C8, [H('fence_far', ['n'], ['forward(2)', 'squirt("high")', 'move()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa nhầm chỗ, bỏ mất move() bù giật: xe quẹo ở ô bên trái, đâm tường', baiLam: bai(C_C8, [H('fence_far', ['n'], ['forward(n)', 'squirt("high")'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Tham số n nhận số trong ngoặc của lời gọi: fence_far(3) thì n là 3.', 'Đổi forward(2) thành forward(n).']
    }),

    man({
      chuong: 'che-kho-cu', so: 9, ten: 'Sửa hàm pad_shot()', yMoi: 'sửa hàm lỗi: thứ tự hai dòng đảo ngược, phun trước khi lên nút',
      hamCuaEmCan: ['move', 'squirt', 'tr_right', 'forward'], chinhCoDinh: true,
      deBai: 'Hàm pad_shot() của màn phải tiến lên nút đè rồi phun nhẹ qua cửa, nhưng đang phun trước khi lên nút nên tia đập vào cửa đóng. Đổi thứ tự hai dòng cho đúng.',
      veMaMau: 'Chạy thử. Lúc phun, xe đã đứng trên nút chưa?',
      san: SAN_C9, batDau: { x: 1, y: 1, huong: 1 }, noi: NOI_C9,
      maMau: bai(C_C9, [H('pad_shot', [], ['squirt("low")', 'move()'])]),
      sao: { o: 16, nhip: 7 },
      loiGiai: bai(C_C9, [H('pad_shot', [], ['move()', 'squirt("low")'])]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_C9, [H('pad_shot', [], ['# lên nút trước, phun sau', 'move()', 'squirt("low")'])]) },
      loiSai: [
        { moTa: 'Để nguyên: tia đập vào cửa đóng, van không mở', baiLam: bai(C_C9, [H('pad_shot', [], ['squirt("low")', 'move()'])]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa thành phun mạnh: xe giật lùi rời nút, quẹo phải trúng tường', baiLam: bai(C_C9, [H('pad_shot', [], ['move()', 'squirt("high")'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Cửa chỉ mở khi xe đã đứng trên nút.', 'Dòng move() lên trước.']
    }),

    man({
      chuong: 'che-kho-cu', so: 10, ten: 'Trùm: Dọn góc kho cũ', yMoi: 'trùm: pass_crate(), pad_open(), fence_shot() nối nhau trong một góc kho',
      hamCuaEmCan: ['pass_crate', 'pad_open', 'fence_shot', 'squirt', 'move', 'tr_right', 'forward'],
      deBai: 'Góc kho cũ đủ mọi thứ: thùng gỗ chắn làn, nút đè mở cửa cho van bên trái, van ấy mở cửa chắn đường, rồi hàng rào với van phía sau mở cửa xuống cờ. Dùng các hàm của em: vòng qua thùng gỗ, lên nút phun van, qua cửa, phun qua rào, quẹo phải xuống cờ.',
      veMaMau: 'Tự viết chương trình bằng pass_crate(), pad_open(), fence_shot().',
      san: SAN_C10, batDau: { x: 0, y: 3, huong: 1 }, noi: NOI_C10,
      maMau: bai([]),
      sao: { o: 36, nhip: 25 },
      loiGiai: bai(L_C10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# ba hàm của em nối nhau'].concat(L_C10)) },
      loiSai: [
        { moTa: 'Quên pad_open(): cửa chắn đường còn đóng', baiLam: bai(['pass_crate()', 'move()', 'move()', 'fence_shot()', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Phun nhẹ qua rào: tia rơi trước van, cửa xuống cờ còn đóng', baiLam: bai(['pass_crate()', 'pad_open()', 'move()', 'squirt("low")', 'tr_right()', 'forward(2)']), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Không vòng qua thùng gỗ: xe húc thùng', baiLam: bai(['move()', 'move()', 'pad_open()', 'move()', 'fence_shot()', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Sau pass_crate() xe đứng ngay trước nút đè.', 'Sau pad_open(): move() qua cửa vừa mở, fence_shot(), tr_right(), forward(2).'],
      huyHieu: { ma: 'che-kho-cu', ten: 'Huy hiệu Chế lệnh dọn kho cũ' }
    })
  ];

  ManHoc.manKhoCu = DS;
  if (laNode) module.exports = ManHoc;
})();
