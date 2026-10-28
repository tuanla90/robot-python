/* ============================================================================
   man-be-sung.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 9 "Bệ súng xích" (combo) (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `be-sung` (mã be-sung.1 … be-sung.10): chương 1: xích bắn tụ không giật
     - `che-be-sung` (mã che-be-sung.1 … che-be-sung.10): chương 2 "Hàm bệ súng"
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manBeSung, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (28/10): COMBO của mùa 2 = XE BÁNH XÍCH (gói 1) gắn SÚNG HƠI (gói 2) thành BỆ SÚNG (cfg.beSung, luật ở san-hoc.js mục BỆ SÚNG XÍCH):
   xích bắn TỤ (shoot(), shoot("charge"), fire("charge"), jet_back()…) thì bóng bay tới vật cản như cũ nhưng xe KHÔNG GIẬT (thùng sau xe không bị hất);
   bắn nhanh "fast" như cũ (bay tối đa 2 ô, không giật). Xe hai bánh hay xích không khai cờ thì vẫn giật. Mọi màn còn khai xichDay (gói 5: xích tiến vào thùng nặng thì đẩy).
   Ý gói: lúc nào cú giật có hại (sau lưng là hốc, thùng, chỗ rẽ; bắn tụ nhiều phát liền) và bệ súng giải được. MỖI MÀN CẦN BỆ SÚNG: bộ dò (do-duong-be-sung.mjs)
   chứng minh cùng sân trên xích không bệ súng (giật) không có đường nào trong sao.nhip. Xích quay chậm: tr_right() / tr_left() hai nhịp; turn_right() / turn_left()
   của xe hai bánh chỉ quay nửa vòng trên xích (bẫy che-be-sung.3).
   Chương be-sung: chương trình mở, đếm cứng (không cảm biến) ở màn 1–5; từ màn 6, màn đọc cảm biến KHÓA chương trình chính và gọi hàm của màn ở nhiều chỗ.
   Chương che-be-sung: chế hàm của em cho bệ súng (blast_left…), chương trình chính KHÓA, gọi hàm ở nhiều chỗ. MỘT SÂN mỗi màn, nhiều sân chỉ ở trùm.
   Không nhiều robot (gói 8 viết song song), không return (mùa 5). kiem-be-sung.mjs + do-duong-be-sung.mjs kiểm (cả BẢNG RECALL gói 1–7 mùa 2).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'shoot', 'shoot_back'];
  var BANH_MAT = BANH.concat(['distance', 'warm']);

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

  /** Điền trường chung: xe bánh xích gắn súng hơi thành bệ súng (beSung), xích đẩy thùng (xichDay); m.mat: gắn mắt hồng ngoại (distance, warm). */
  function man(m) {
    var mat = !!m.mat;
    delete m.mat;
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'xich';
    m.robot = { than: 'xich', tay: 'hoi', camBien: mat ? [{ ma: 'hong-ngoai', o: 'tren' }] : [] };
    m.hamGoc = mat ? BANH_MAT : BANH;
    m.beSung = true;
    m.xichDay = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // be-sung.1: xe (1,3) quay lên, nút (1,0) cuối hành lang mở cửa (2,3) ngay bên phải xe; cờ (4,3). Dưới xe là ô trống (1,4): xích không bệ súng giật xuống đó, lệch khỏi cửa.
  var SAN_B1 = ['#N####', '#.####', '#.####', '#.C.F#', '#.####', '######'];
  // be-sung.2: xe (4,1) quay phải, nút (0,1) ở đầu kia hành lang, SAU LƯNG xe; cửa (4,2) ngay dưới xe; cờ (4,3). Không bệ súng: bắn ra sau thì xe giật TỚI (5,1), lệch khỏi cửa.
  var SAN_B2 = ['########', 'N......#', '####C###', '####F###', '########'];
  // be-sung.3: xe (2,3) quay lên. Nút A (2,0) mở cửa (3,3) bên phải xe; nút B (5,3) cuối hành lang phải (bóng bay qua cửa (3,3) đã mở) mở cửa (2,4) dưới xe; cờ (2,5).
  //   Không bệ súng: phát thứ hai (quay phải) giật xe sang trái (1,3).
  var SAN_B3 = ['##N####', '##.####', '##.####', '#..C.N#', '##C####', '##F####', '#######'];
  // be-sung.4: xe (2,2) quay lên, nút (2,0) mở cửa (3,2) bên phải xe. Ngay sau lưng xe là thùng nặng (2,3), dưới thùng là cờ (2,4).
  //   Đường tới cờ đi vòng: (3,2) → (3,3) → (3,4) → (2,4). Không bệ súng: cú giật hất thùng trượt xuống nằm đè lên cờ.
  var SAN_B4 = ['##N###', '##.###', '##.C##', '##H.##', '##F.##', '######'];
  // be-sung.5: hành lang (1..6, 3) đi sang phải; hai trạm (2,3), (4,3), mỗi trạm có nút xa phía trên ((2,0), (4,0), giếng hai ô) mở cửa ngay sau trạm ((3,3), (5,3)),
  //   dưới mỗi trạm là một hốc ((2,4), (4,4)): xích không bệ súng bắn lên thì giật xuống hốc. Cờ (6,3).
  var SAN_B5 = ['##N#N###', '##.#.###', '##.#.###', '#..C.CF#', '##.#.###', '########'];
  // be-sung.6: hành lang (1..7, 3), ba trạm LIỀN NHAU (2,3), (3,3), (4,3), mỗi trạm một nút xa phía trên ((2,0), (3,0), (4,0)), dưới là hốc. Nút (2,0) ĐANG BẬT (nutBat);
  //   nút (3,0), (4,0) TẮT mở hai cửa nối tiếp ở cuối hành lang (5,3), (6,3). Cờ (7,3).
  var SAN_B6 = ['##NNN####', '##...####', '##...####', '#....CCF#', '##...####', '#########'];
  // be-sung.7: xe (1,3) quay phải, nút (1,0) xa phía trên mở cửa (2,3) trước mặt; dưới xe là hốc (1,4). Qua cửa tới (3,3), dịch xuống làn dưới (3,4) rồi đi tiếp tới cờ (5,4).
  var SAN_B7 = ['#N#####', '#.#####', '#.#####', '#.C.###', '#.#..F#', '#######'];
  // be-sung.8: xe (1,3) quay phải, ngay trước mũi là thùng (2,3), sau thùng là cửa đóng (3,3) rồi ô đích (5,3), sau ô đích còn một ô (6,3). Nút (1,0) xa phía trên mở cửa;
  //   dưới xe là hốc (1,4). Không bệ súng: cú giật hất thùng trượt quá ô đích vào góc (6,3).
  var SAN_B8 = ['#N######', '#.######', '#.######', '#.HC.D.#', '#.######', '########'];
  // be-sung.9: xe ở ngã tư (3,3) quay lên. Nút trên (3,0) mở cửa phải (4,3); nút phải (6,3) mở cửa dưới (3,4); nút dưới (3,6) mở cửa trái (2,3); cờ (1,3).
  //   Không bệ súng: phát thứ ba (bắn xuống) giật xe lên (3,2).
  var SAN_B9 = ['###N###', '###.###', '###.###', '#FC.C.N', '###C###', '###.###', '###N###'];

  /* ------------------------------------------------------------- chương trình */

  var L_B1 = ['shoot()', 'wait()', 'tr_right()', 'forward(3)'];
  var L_B2 = ['shoot_back()', 'wait()', 'tr_right()', 'forward(2)'];
  var L_B3 = FOR(2, ['shoot()', 'wait()', 'tr_right()']).concat(['forward(2)']);
  var L_B4 = ['shoot()', 'wait()', 'tr_right()', 'move()', 'tr_right()', 'forward(2)', 'tr_right()', 'move()'];
  var L_B5 = ['move()'].concat(FOR(2, ['tr_left()', 'fire("charge")', 'tr_right()', 'forward(2)']));
  var C_B6 = ['move()'].concat(FOR(3, ['check()', 'move()']), ['forward(2)']);
  var T_B6 = ['tr_left()'].concat(IF('not warm()', ['fire("charge")']), ['tr_right()']);
  var BAT_TU = IF('not warm()', ['fire("charge")']);                      // nút chưa nóng thì bắn tụ cho bật (bệ súng: không giật)
  var L_B7 = ['tr_left()', 'fire("charge")', 'tr_right()', 'forward(2)', 'sidestep()', 'forward(2)'];
  var M_B7 = ['turn_left()', 'fire("charge")', 'move()', 'turn_right()', 'forward(2)', 'sidestep()', 'forward(2)'];
  var L_B8 = ['tr_left()', 'fire("charge")', 'tr_right()', 'forward(3)'];
  var L_B9 = FOR(3, ['fire("charge")', 'tr_right()']).concat(['forward(2)']);

  var DS = [
    /* ================================================================ chương be-sung: xích bắn tụ không giật */
    man({
      chuong: 'be-sung', so: 1, ten: 'Bệ súng không giật', yMoi: 'beSung: xích gắn súng hơi bắn tụ thì xe đứng yên, không giật lùi',
      kieuBai: 'sua-thua', hamCuaEmCan: ['tr_right', 'forward', 'move'],
      deBai: 'Xe hai bánh bắn tụ thì giật lùi một ô, nên Sola quen thêm move() sau mỗi phát để quay về chỗ cũ. Xe xích của em đã gắn súng hơi thành BỆ SÚNG: ' +
        'xích bám chắc, bắn tụ không giật. Bắn nút cuối hành lang cho cửa bên phải mở, rồi rẽ phải tới cờ.',
      veMaMau: 'Chương trình của Sola có thêm move() sau phát bắn. Chạy thử: xe xích có giật không? Bỏ dòng thừa.',
      san: SAN_B1, batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['shoot()', 'wait()', 'move()', 'tr_right()', 'forward(3)']),
      sao: { o: 12, nhip: 6 },
      loiGiai: bai(L_B1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bệ súng: bắn tụ không giật'].concat(L_B1)) },
      loiSai: [
        { moTa: 'Để nguyên move() của Sola: xe không giật nên tiến lên quá chỗ rẽ', baiLam: bai(['shoot()', 'wait()', 'move()', 'tr_right()', 'forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Rẽ trước khi bắn: súng chĩa vào cửa, nút không đổi', baiLam: bai(['tr_right()', 'shoot()', 'wait()', 'forward(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Bệ súng xích: bắn tụ xong xe vẫn ở đúng chỗ cũ.', 'shoot(), wait(), rồi rẽ phải và đi ba ô.']
    }),

    man({
      chuong: 'be-sung', so: 2, ten: 'Nút sau lưng', yMoi: 'shoot_back() trên bệ súng: bắn ra sau, xe không giật tới',
      kieuBai: 'ban-sau', hamCuaEmCan: ['tr_right', 'forward', 'move', 'back'],
      deBai: 'Nút nằm ở đầu kia hành lang, ngay sau lưng xe; cánh cửa nó mở nằm ngay dưới xe. Bắn ra sau bằng shoot_back(). Xe hai bánh bắn ra sau thì giật TỚI một ô, ' +
        'còn bệ súng xích thì đứng yên. Mở cửa rồi rẽ phải đi xuống tới cờ.',
      veMaMau: 'Sola viết cho xe hai bánh: bắn ra sau rồi back() để lùi về chỗ cũ. Trên bệ súng, dòng back() làm xe lệch khỏi cửa.',
      san: SAN_B2, batDau: { x: 4, y: 1, huong: 1 },
      maMau: bai(['shoot_back()', 'wait()', 'back()', 'tr_right()', 'forward(2)']),
      sao: { o: 12, nhip: 5 },
      loiGiai: bai(L_B2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bắn ra sau, bệ súng không trôi tới'].concat(L_B2)) },
      loiSai: [
        { moTa: 'Để nguyên back() của Sola: xe lùi khỏi chỗ đứng trên cửa, đi xuống đâm tường', baiLam: bai(['shoot_back()', 'wait()', 'back()', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn ra trước bằng shoot(): bóng trúng tường cuối hành lang, nút không đổi', baiLam: bai(['shoot()', 'wait()', 'tr_right()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['shoot_back() bắn ra sau đuôi xe; bệ súng giữ xe đứng yên.', 'Bắn, rồi rẽ phải và đi hai ô.']
    }),

    man({
      chuong: 'be-sung', so: 3, ten: 'Hai phát một chỗ', yMoi: 'bắn tụ hai phát liền từ cùng một ô: quay giữa hai phát, xe không xê dịch',
      kieuBai: 'mo-cua', hamCuaEmCan: ['tr_right', 'tr_left', 'spin', 'forward', 'move'],
      deBai: 'Hai nút ở xa: nút trên mở cánh cửa bên phải xe, nút bên phải (sau cánh cửa đó) mở cánh cửa dưới xe. Đứng yên một chỗ mà bắn cả hai: bắn, quay phải, bắn, quay phải, ' +
        'rồi đi xuống tới cờ. Bệ súng không giật nên phát sau vẫn bắn từ đúng chỗ phát trước.',
      veMaMau: 'Chương trình có sẵn mới bắn một phát. Dùng vòng lặp cho hai lần "bắn rồi quay phải".',
      san: SAN_B3, batDau: { x: 2, y: 3, huong: 0 }, noi: [noi(2, 0, [[3, 3]]), noi(5, 3, [[2, 4]])],
      maMau: bai(['shoot()', 'wait()', 'tr_right()', 'tr_right()', 'forward(2)']),
      sao: { o: 13, nhip: 8 },
      loiGiai: bai(L_B3),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# hai phát, không xê dịch'].concat(L_B3)) },
      loiSai: [
        { moTa: 'Bắn nút bên phải trước: cửa bên phải còn đóng, bóng dừng ở cửa', baiLam: bai(['tr_right()', 'shoot()', 'wait()', 'tr_left()', 'shoot()', 'wait()', 'spin()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay sau phát thứ hai: xe tiến vào hành lang bên phải', baiLam: bai(['shoot()', 'wait()', 'tr_right()', 'shoot()', 'wait()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Phát trên mở cửa bên phải, nên phát bên phải phải bắn sau.', 'for i in range(2): bắn, wait(), tr_right(); rồi forward(2).']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      chuong: 'be-sung', so: 4, ten: 'Thùng nằm yên', yMoi: 'cú giật hất thùng sau lưng đi xa; bệ súng giữ thùng nằm yên',
      kieuBai: 'thung', hamCuaEmCan: ['tr_right', 'tr_left', 'spin', 'forward', 'move'],
      deBai: 'Ngay sau lưng xe là một thùng nặng, dưới thùng là lá cờ. Nhớ gói Súng hơi: bắn tụ thì cú giật hất thùng sau lưng trượt đi tới khi gặp vật cản. ' +
        'Bắn nút phía trên cho cửa bên phải mở, rồi đi vòng qua cửa xuống tới cờ. Bệ súng giữ thùng nằm yên nên cờ vẫn trống.',
      veMaMau: 'Chương trình có sẵn bắn rồi mới đi được nửa đường. Viết tiếp đoạn vòng xuống cờ.',
      san: SAN_B4, batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['shoot()', 'wait()', 'tr_right()', 'move()']),
      sao: { o: 16, nhip: 11 },
      loiGiai: bai(L_B4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bệ súng giữ thùng nằm yên'].concat(L_B4)) },
      loiSai: [
        { moTa: 'Quay lại đẩy thùng xuống cờ: thùng vướng cờ, ô sau cờ là tường', baiLam: bai(['shoot()', 'wait()', 'spin()', 'move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải lần cuối thay vì rẽ phải: xe quay sai hướng, đâm tường', baiLam: bai(['shoot()', 'wait()', 'tr_right()', 'move()', 'tr_right()', 'forward(2)', 'tr_left()', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thùng không cần dời: chỉ cần nó đừng trượt lên cờ.', 'Bắn, rẽ phải, đi một ô, rẽ phải, đi hai ô, rẽ phải, đi một ô.']
    }),

    man({
      chuong: 'be-sung', so: 5, ten: 'Hành lang có hốc', yMoi: 'bắn tụ fire("charge") ở nhiều trạm; dưới trạm là hốc mà bệ súng không giật xuống',
      kieuBai: 'hanh-lang', hamCuaEmCan: ['tr_left', 'tr_right', 'fire', 'forward', 'move'], lucBan: true,
      deBai: 'Hành lang có hai trạm. Ở mỗi trạm, nút ở cuối cái giếng phía trên, cách xa: bắn nhanh không tới, phải bắn tụ. Nút mở cánh cửa ngay sau trạm. ' +
        'Dưới mỗi trạm là một cái hốc: xe hai bánh bắn lên thì giật tụt xuống hốc. Bệ súng xích thì không. Đi tới cờ.',
      veMaMau: 'Chương trình có sẵn bắn nhanh fire("fast"): bóng rơi giữa giếng. Đổi lực bắn.',
      san: SAN_B5, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(2, 0, [[3, 3]]), noi(4, 0, [[5, 3]])],
      maMau: bai(['move()'].concat(FOR(2, ['tr_left()', 'fire("fast")', 'tr_right()', 'forward(2)']))),
      sao: { o: 19, nhip: 15 },
      loiGiai: bai(L_B5),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bắn tụ, bệ súng không tụt xuống hốc'].concat(L_B5)) },
      loiSai: [
        { moTa: 'Để nguyên bắn nhanh: nút cách ba ô, bóng rơi giữa giếng', baiLam: bai(['move()'].concat(FOR(2, ['tr_left()', 'fire("fast")', 'tr_right()', 'forward(2)']))), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên quay lại sau khi bắn: xe đi lên giếng', baiLam: bai(['move()'].concat(FOR(2, ['tr_left()', 'fire("charge")', 'forward(2)']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nút cách ba ô: bắn nhanh chỉ bay hai ô.', 'Thân vòng lặp: tr_left(), fire("charge"), tr_right(), forward(2).']
    }),

    man({
      chuong: 'be-sung', so: 6, ten: 'Trạm nào còn tắt', yMoi: 'hàm của màn đọc warm(): nút đang bật thì khỏi bắn; chương trình chính khóa',
      kieuBai: 'doc-nhiet', mat: true, chinhCoDinh: true, hamCuaEmCan: ['tr_left', 'tr_right', 'fire', 'forward', 'move'], lucBan: true,
      deBai: 'Ba trạm liền nhau, mỗi trạm một nút xa phía trên. Mỗi nút tắt mở một trong hai cánh cửa cuối hành lang; nút đang bật (quầng đỏ) không mở gì, bắn nó chỉ tắt nó và phí một nhịp. ' +
        'Xe đã gắn mắt hồng ngoại đo nhiệt. Chương trình chính đã khóa, ở mỗi trạm gọi check(). Sửa thân check(): quay lên, nút chưa nóng thì bắn tụ, quay lại.',
      veMaMau: 'Chương trình chính bị khóa. check() có sẵn quay lên bắn nhanh: bóng không tới nút.',
      san: SAN_B6, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(3, 0, [[5, 3]]), noi(4, 0, [[6, 3]])], nutBat: [o(2, 0)],
      maMau: bai(C_B6, [H('check', [], ['tr_left()', 'fire("fast")', 'tr_right()'])]),
      sao: { o: 22, nhip: 20 },
      loiGiai: bai(C_B6, [H('check', [], T_B6)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_B6, [H('check', [], ['# nút chưa nóng thì bắn tụ'].concat(T_B6))]) },
      congThucKhac: [{ moTa: 'Bắn mọi nút không đo: vẫn tới cờ nhưng tắt nút đang bật, phí một nhịp', baiLam: bai(C_B6, [H('check', [], ['tr_left()', 'fire("charge")', 'tr_right()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bắn nhanh: bóng rơi giữa giếng', baiLam: bai(C_B6, [H('check', [], ['tr_left()', 'fire("fast")', 'tr_right()'])]), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Viết if warm(): chỉ tắt nút đang bật, hai nút tắt vẫn tắt', baiLam: bai(C_B6, [H('check', [], ['tr_left()'].concat(IF('warm()', ['fire("charge")']), ['tr_right()']))]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đo trước khi quay lên: mắt hồng ngoại nhìn dọc hành lang', baiLam: bai(C_B6, [H('check', [], IF('not warm()', ['fire("charge")']).concat(['tr_left()', 'tr_right()']))]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['warm() là True khi nút trước mũi xe đang bật.', 'Thân check(): tr_left(), if not warm(): fire("charge"), tr_right().']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      chuong: 'be-sung', so: 7, ten: 'Đố: Sola quay nửa vòng', yMoi: 'tìm lỗi: turn_left() của xe hai bánh chỉ quay nửa vòng trên xích, move() bù giật là thừa',
      kieuBai: 'do', lucBan: true, hamCuaEmCan: ['tr_left', 'tr_right', 'turn_left', 'turn_right', 'fire', 'forward', 'sidestep', 'move'],
      deBai: 'Sola chép chương trình của xe hai bánh sang xe xích: turn_left() để quay lên bắn nút xa, move() để về chỗ cũ sau cú giật. Chạy thử: bóng bay vào cửa, xe đâm cửa. Vì sao? ' +
        'Xích quay chậm: turn_left() chỉ quay nửa vòng, nhịp sau làm việc khác là mất. Còn bệ súng thì không giật. Sửa để xe qua cửa, dịch xuống làn dưới rồi tới cờ.',
      veMaMau: 'Chạy thử chương trình của Sola. Phát bắn bay về hướng nào?',
      san: SAN_B7, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(1, 0, [[2, 3]])],
      maMau: bai(M_B7),
      sao: { o: 22, nhip: 14 },
      loiGiai: bai(L_B7),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích', baiLam: bai(['# xích: tr_left() hai nhịp, bệ súng: không bù giật'].concat(L_B7)) },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: nửa vòng quay bị mất, bóng bay vào cửa', baiLam: bai(M_B7), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chỉ sửa turn_left() thành tr_left(), còn giữ move() bù giật: xe tiến lên giếng', baiLam: bai(['tr_left()', 'fire("charge")', 'move()', 'tr_right()', 'forward(2)', 'sidestep()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Trên xích, quay đủ một góc vuông cần tr_left() hay tr_right(): hai nhịp liền.', 'Bệ súng không giật nên bỏ move() sau phát bắn.']
    }),

    man({
      chuong: 'be-sung', so: 8, ten: 'Đẩy thùng qua cửa', yMoi: 'bắn mở cửa rồi xích đẩy thùng qua cửa vào ô đích',
      kieuBai: 'day-thung', mucTieu: 'day-thung', lucBan: true, hamCuaEmCan: ['tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Ngay trước mũi xe là thùng nặng, sau thùng là cánh cửa đóng, ô đích nằm sau cửa. Nhớ gói Đẩy thùng: xích tiến vào thùng thì đẩy thùng đi một ô, nhưng cửa đóng thì thùng không qua. ' +
        'Nút mở cửa ở xa phía trên, dưới xe là hốc. Bắn mở cửa trước, rồi đẩy thùng vào ô đích.',
      veMaMau: 'Chương trình có sẵn đẩy ngay: thùng vướng cửa đóng.',
      san: SAN_B8, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(1, 0, [[3, 3]])],
      maMau: bai(['forward(3)']),
      sao: { o: 17, nhip: 8 },
      loiGiai: bai(L_B8),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mở cửa trước, đẩy thùng sau'].concat(L_B8)) },
      loiSai: [
        { moTa: 'Đẩy ngay khi cửa còn đóng: thùng không qua được', baiLam: bai(['forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đẩy thiếu một ô: thùng nằm trước ô đích', baiLam: bai(['tr_left()', 'fire("charge")', 'tr_right()', 'forward(2)']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Cửa đóng chặn cả thùng: bắn mở cửa trước.', 'Thùng cách ô đích ba ô.']
    }),

    man({
      chuong: 'be-sung', so: 9, ten: 'Ba phát quanh mình', yMoi: 'ba phát tụ liền từ ngã tư: mỗi phát mở cửa cho phát sau',
      kieuBai: 'mo-cua', lucBan: true, hamCuaEmCan: ['tr_right', 'tr_left', 'fire', 'forward', 'move'],
      deBai: 'Xe đứng giữa ngã tư, bốn phía là bốn hành lang. Nút trên mở cửa bên phải, nút bên phải mở cửa phía dưới, nút dưới mở cửa bên trái, cờ ở bên trái. ' +
        'Đứng yên giữa ngã tư mà bắn đủ ba nút, rồi đi tới cờ. Nhớ: cửa đóng chặn cả bóng.',
      veMaMau: 'Chương trình có sẵn bắn một phát rồi đi. Lặp "bắn rồi quay phải" mấy lần?',
      san: SAN_B9, batDau: { x: 3, y: 3, huong: 0 }, noi: [noi(3, 0, [[4, 3]]), noi(6, 3, [[3, 4]]), noi(3, 6, [[2, 3]])],
      maMau: bai(['fire("charge")', 'tr_left()', 'forward(2)']),
      sao: { o: 14, nhip: 11 },
      loiGiai: bai(L_B9),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# ba phát, mỗi phát mở cửa cho phát sau'].concat(L_B9)) },
      loiSai: [
        { moTa: 'Quay trái thay vì quay phải: bóng thứ hai dừng ở cửa trái còn đóng', baiLam: bai(FOR(3, ['fire("charge")', 'tr_left()']).concat(['forward(2)'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ bắn hai phát: cửa trái còn đóng', baiLam: bai(FOR(2, ['fire("charge")', 'tr_right()']).concat(['tr_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thứ tự: trên, phải, dưới; mỗi lần quay phải.', 'for i in range(3): fire("charge"), tr_right(); rồi forward(2).']
    })
  ];

  ManHoc.manBeSung = DS;
  if (laNode) module.exports = ManHoc;
})();
