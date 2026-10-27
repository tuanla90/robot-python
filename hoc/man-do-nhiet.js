/* ============================================================================
   man-do-nhiet.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 7 "Đo nhiệt" (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `do-nhiet` (mã do-nhiet.1 … do-nhiet.10): chương 1: warm() (robot, nút đang bật)
     - `che-do-nhiet` (mã che-do-nhiet.1 … che-do-nhiet.10): chương 2 "Hàm đo nhiệt"
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDoNhiet, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (27/10): XE HAI BÁNH gắn SÚNG HƠI + MẮT HỒNG NGOẠI có NÂNG CẤP ĐO NHIỆT (robot { than: 'hai-banh', tay: 'hoi', camBien: [hong-ngoai] }, khay có distance + warm), mọi màn lucBan.
   warm() = True khi vật cản đầu tiên trên tia phía trước NÓNG: nút bắn ĐANG BẬT (quầng đỏ). Hồng ngoại chỉ đo xa gần rồi nhiệt, KHÔNG nhận dạng vật: nút tắt, cửa, thùng, tường
   đều "không nóng" như nhau, distance() của chúng cũng như nhau (luật ở san-hoc.js, mục HỒNG NGOẠI). Robot khác cũng nóng nhưng để gói 8 Đội.
   NÚT BẬT SẴN (cfg.nutBat, san-hoc.js mục SÚNG BÓNG): nút nóng từ đầu màn, KHÔNG nối cửa / băng (lõi cấm), nên mọi sân có cửa đều khai noi cho các nút tắt.
   Bắn nút là ĐỔI trạng thái: bắn nút đang bật thì tắt nó; bắn lại nút mình vừa bật thì cửa của nó đóng lại (bẫy của Sola).
   Chương do-nhiet: đọc nóng / không nóng rồi quyết (if not warm(), while not warm(), kết hợp distance() và lực bắn). Chương che-do-nhiet: chế hàm đọc warm() (switch_on, find_warm…),
   chương trình chính KHÓA và gọi hàm ở nhiều chỗ, nên thân hàm cố định không thắng được. MỘT SÂN mỗi màn, nhiều sân chỉ ở trùm.
   Màn mở: sân có nhiều chỗ quyết định không đều (nút nóng / tắt xen nhau), nên một vòng lặp đọc warm() ngắn hơn viết cứng theo quầng đỏ nhìn thấy.
   kiem-do-nhiet.mjs + do-duong-do-nhiet.mjs kiểm: không lời cố định nào (không đọc cảm biến) được 3 sao. Không beSung (gói 9), không nhiều robot (gói 8).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'shoot', 'shoot_back', 'distance', 'warm'];

  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }
  function o(x, y) { return { x: x, y: y }; }
  /** Nhóm nối: nút (x, y) mở các cửa [[x, y], …]. */
  function noi(x, y, cua) { return { nut: o(x, y), cua: cua.map(function (c) { return o(c[0], c[1]); }) }; }

  /** Điền trường chung: xe hai bánh, súng hơi, mắt hồng ngoại có đo nhiệt; mọi màn chọn được lực bắn. */
  function man(m) {
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] };
    m.hamGoc = HAM_GOC;
    m.lucBan = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  // khối hay dùng
  var BAT = IF('not warm()', ['fire("fast")']);                         // nút chưa nóng thì bắn nhanh cho bật
  var TIM = nhieu(['turn_right()'], WHILE('not warm()', ['turn_right()']));   // quay khỏi nút vừa tới rồi quay tới khi thấy nút nóng

  /* ------------------------------------------------------------------- sân */

  // do-nhiet.1: đường xoắn rẽ phải. Xe (1,2) quay lên, sát nút (1,1) TẮT, nút đó mở cửa (2,2). Khúc 2 tới sát nút (4,2) ĐANG BẬT. Khúc 3 xuống tới sát nút (3,5) TẮT,
  //   nút đó mở cửa (2,4). Khúc 4 sang trái qua cửa tới cờ (1,4).
  var SAN_D1 = ['######', '##N###', '##.CN#', '###.##', '#F#.##', 'N.C.##', '###N##', '######'];
  // do-nhiet.2: bốn nút đều ĐANG BẬT, làm đèn chỉ đường. Xe (2,1) quay lên. Mỗi ngã: quay khỏi nút vừa tới, quay tiếp tới khi thấy nút nóng, đi tới sát nó.
  //   Ngã (4,3) phải quay ba lần (bên trái là tường, phía sau là đường cũ). Cờ (5,4) nằm trước nút cuối (5,5).
  var SAN_D2 = ['########', '##...N##', '####.###', '####..N#', '####NF##', '#####N##', '########'];

  // do-nhiet.3: đường bậc thang lên phải, như do-nhiet.2, nhưng ở ngã có vật cản khác cách xe như nút nóng: cửa đóng không ai mở (2,7), thùng (4,6), nút TẮT (1,4), tường.
  //   Xe (1,5) quay lên. Đèn nóng: (3,5), (2,3), (5,4), (4,1); cờ (4,2) nằm trước đèn cuối. Ngã (2,5) và (4,4) phải quay ba lần.
  var SAN_D3 = ['#######', '####N##', '####F##', '##N#.##', '#N...N#', '#..N.##', '##.#H##', '##C####', '#######'];
  // do-nhiet.4: hành lang (1..6, 2) đi sang phải, năm nút trên tường (1..5, 1). Nút TẮT (1,1), (3,1), (4,1) mở cửa ngay sau nó (2,2), (4,2), (5,2); (2,1), (5,1) ĐANG BẬT. Cờ (6,2).
  var SAN_D4 = ['########', '#NNNNN##', '#.C.CCF#', '########'];

  /* ------------------------------------------------------------- chương trình */

  var L_D1 = FOR(4, nhieu(BAT, ['turn_right()', 'go_to_wall()']));
  var L_D2 = FOR(4, nhieu(TIM, ['go_to_wall()']));
  var L_D4 = FOR(5, nhieu(['turn_left()'], BAT, ['turn_right()', 'move()']));

  var DS = [
    /* ================================================================ chương do-nhiet: đọc nóng / không nóng rồi quyết */
    man({
      chuong: 'do-nhiet', so: 1, ten: 'Nút nào đang nóng', yMoi: 'warm(): vật cản phía trước nóng (nút đang bật) thì True; if not warm(): bắn',
      hamCuaEmCan: ['fire', 'turn_right', 'turn_left', 'go_to_wall', 'move'],
      deBai: 'Mắt hồng ngoại vừa được nâng cấp ĐO NHIỆT: warm() là True khi vật cản trước mũi xe đang nóng. Nút bắn đang bật thì nóng (có quầng đỏ), nút tắt thì không. ' +
        'Đường xoắn có ba khúc quanh, cuối mỗi khúc là một nút; nút tắt nào cũng mở cánh cửa của khúc sau. Ở mỗi khúc quanh: nút chưa nóng thì bắn nhanh cho nó bật, rồi rẽ phải và đi tới sát tường. ' +
        'Bắn nút đang bật là tắt nó, phí một nhịp.',
      veMaMau: 'Chương trình có sẵn chỉ rẽ và đi. Thêm if not warm(): fire("fast") vào đầu vòng lặp.',
      san: SAN_D1, batDau: { x: 2, y: 2, huong: 0 }, noi: [noi(2, 1, [[3, 2]]), noi(3, 6, [[2, 5]])], nutBat: [o(4, 2), o(0, 5)],
      maMau: bai(FOR(4, ['turn_right()', 'go_to_wall()'])),
      sao: { o: 14, nhip: 13 },
      loiGiai: bai(L_D1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# nút chưa nóng thì bắn cho bật'].concat(L_D1)) },
      congThucKhac: [{ moTa: 'Bắn mọi nút không cần đo: vẫn tới cờ nhưng tắt mất nút đang bật, phí một nhịp', baiLam: bai(FOR(4, ['fire("fast")', 'turn_right()', 'go_to_wall()'])) }],
      loiSai: [
        { moTa: 'Viết if warm(): bắn nút đang bật, bỏ qua nút tắt, cửa vẫn đóng', baiLam: bai(FOR(4, nhieu(IF('warm()', ['fire("fast")']), ['turn_right()', 'go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bắn tụ fire("charge"): ở khúc quanh thứ ba cú giật đẩy xe lùi khỏi chỗ rẽ', baiLam: bai(FOR(4, nhieu(IF('not warm()', ['fire("charge")']), ['turn_right()', 'go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái thay vì rẽ phải: xe đi vào ngõ cụt', baiLam: bai(FOR(4, nhieu(BAT, ['turn_left()', 'go_to_wall()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['warm() chỉ trả lời có nóng hay không, như front_clear() trả lời có trống hay không.',
        'Trong vòng lặp: if not warm(): fire("fast"), rồi turn_right() và go_to_wall().']
    }),

    man({
      chuong: 'do-nhiet', so: 2, ten: 'Đèn nóng chỉ đường', yMoi: 'while not warm(): quay tới khi mắt hồng ngoại thấy nút nóng',
      hamCuaEmCan: ['turn_right', 'go_to_wall', 'move'],
      deBai: 'Bốn nút đang bật làm đèn chỉ đường: ở mỗi ngã, đường đi tiếp là hướng có nút nóng ở cuối. Mỗi ngã, quay khỏi nút vừa tới, rồi quay tiếp cho tới khi warm() là True, ' +
        'rồi go_to_wall(). Làm bốn lần thì tới cờ.',
      veMaMau: 'Chương trình có sẵn ngã nào cũng chỉ quay phải một lần. Thêm vòng while not warm(): turn_right().',
      san: SAN_D2, batDau: { x: 2, y: 1, huong: 0 }, nutBat: [o(5, 1), o(4, 4), o(6, 3), o(5, 5)],
      maMau: bai(FOR(4, ['turn_right()', 'go_to_wall()'])),
      sao: { o: 12, nhip: 12 },
      loiGiai: bai(L_D2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# ngã nào cũng tìm nút nóng'].concat(L_D2)) },
      loiSai: [
        { moTa: 'Quên quay khỏi nút vừa tới: xe đang nhìn đúng một nút nóng nên đứng yên', baiLam: bai(FOR(4, nhieu(WHILE('not warm()', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết while warm(): xe quay khỏi nút nóng thì dừng ngay, đi sai hướng', baiLam: bai(FOR(4, nhieu(['turn_right()'], WHILE('warm()', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['while not warm(): turn_right() quay cho tới khi phía trước là một nút nóng.',
        'Tới sát nút rồi thì xe đang nhìn chính nút đó: quay phải một lần trước khi tìm tiếp.']
    }),

    man({
      chuong: 'do-nhiet', so: 3, ten: 'Cửa, thùng hay đèn', yMoi: 'distance() không phân biệt được: cửa, thùng, nút tắt, nút nóng cùng cách 1 ô, chỉ warm() khác',
      hamCuaEmCan: ['turn_right', 'go_to_wall', 'move'],
      deBai: 'Lại đi theo đèn nóng, nhưng ở các ngã có thêm cửa đóng, thùng nặng và nút tắt, cùng cách xe một ô như nút nóng. Mắt hồng ngoại chỉ đo xa gần và đo nhiệt, không biết vật cản là gì: ' +
        'distance() của chúng như nhau, chỉ warm() khác. Đi bốn ngã tới cờ.',
      veMaMau: 'Bản của Sola tìm đường bằng distance(): gặp vật cản không sát mũi là đi. Ở ngã thứ hai, cửa đóng cũng cách 1 ô: Sola đi nhầm. Đổi điều kiện sang warm().',
      san: SAN_D3, batDau: { x: 1, y: 5, huong: 0 }, noi: [], nutBat: [o(3, 5), o(2, 3), o(5, 4), o(4, 1)],
      maMau: bai(FOR(4, nhieu(['turn_right()'], WHILE('distance() == 0', ['turn_right()']), ['go_to_wall()']))),
      sao: { o: 12, nhip: 14 },
      loiGiai: bai(L_D2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# chỉ nút đang bật mới nóng'].concat(L_D2)) },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: cửa đóng cũng cách 1 ô nên xe đi nhầm về phía cửa', baiLam: bai(FOR(4, nhieu(['turn_right()'], WHILE('distance() == 0', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bỏ dòng quay đầu tiên: tới ngã thứ hai xe đang nhìn đúng nút nóng vừa tới nên đứng yên', baiLam: bai(FOR(4, nhieu(WHILE('not warm()', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cửa đóng, thùng, nút tắt hay nút nóng đều là vật cản: distance() chỉ cho biết cách mấy ô.',
        'Chương trình của màn trước dùng lại được nguyên vẹn.']
    }),

    man({
      chuong: 'do-nhiet', so: 4, ten: 'Hành lang năm nút', yMoi: 'vòng lặp đi dọc hành lang: quay trái đo, nút tắt thì bắn, quay lại rồi tiến',
      hamCuaEmCan: ['fire', 'turn_left', 'turn_right', 'move'],
      deBai: 'Năm nút nằm trên tường phía trên hành lang, ngay bên trái xe. Nút tắt nào cũng mở cánh cửa ngay trước nó; nút đang bật thì cửa trước nó đã mở sẵn. ' +
        'Ở mỗi ô: quay trái đo nhiệt, nút chưa nóng thì bắn nhanh, quay lại rồi tiến một ô. Đi tới cờ.',
      veMaMau: 'Chương trình có sẵn quay trái, quay lại rồi tiến, chưa bắn gì. Thêm if not warm(): fire("fast").',
      san: SAN_D4, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(1, 1, [[2, 2]]), noi(3, 1, [[4, 2]]), noi(4, 1, [[5, 2]])], nutBat: [o(2, 1), o(5, 1)],
      maMau: bai(FOR(5, ['turn_left()', 'turn_right()', 'move()'])),
      sao: { o: 15, nhip: 18 },
      loiGiai: bai(L_D4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# nút tắt thì bắn, nút nóng để yên'].concat(L_D4)) },
      loiSai: [
        { moTa: 'Quên quay lại: xe tiến thẳng vào tường phía trên', baiLam: bai(FOR(5, nhieu(['turn_left()'], BAT, ['move()']))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết if warm(): tắt hai nút đang bật, ba nút tắt vẫn tắt', baiLam: bai(FOR(5, nhieu(['turn_left()'], IF('warm()', ['fire("fast")']), ['turn_right()', 'move()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mắt hồng ngoại ở mũi xe: muốn đo nút phía trên thì phải quay mặt về phía nút.',
        'Thân vòng lặp: turn_left(), if not warm(): fire("fast"), turn_right(), move().']
    })
  ];

  ManHoc.manDoNhiet = DS;
  if (laNode) module.exports = ManHoc;
})();
