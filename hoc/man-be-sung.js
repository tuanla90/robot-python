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

  /* ------------------------------------------------------------- chương trình */

  var L_B1 = ['shoot()', 'wait()', 'tr_right()', 'forward(3)'];
  var L_B2 = ['shoot_back()', 'wait()', 'tr_right()', 'forward(2)'];
  var L_B3 = FOR(2, ['shoot()', 'wait()', 'tr_right()']).concat(['forward(2)']);

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
    })
  ];

  ManHoc.manBeSung = DS;
  if (laNode) module.exports = ManHoc;
})();
