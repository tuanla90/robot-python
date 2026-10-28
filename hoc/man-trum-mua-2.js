/* ============================================================================
   man-trum-mua-2.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 10 "Nhà máy chạy lại" (gói cuối mùa, KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `tong-hop-2` (mã tong-hop-2.1 … tong-hop-2.10): chương 1 "Tổng hợp" (màn 10 trùm, huy hiệu tong-hop-2)
     - `trum-mua-2` (mã trum-mua-2.1 … trum-mua-2.10): chương 2 "Trùm mùa" (màn 10 là TRÙM CUỐI MÙA 2, huy hiệu nha-may-chay)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manTrumMua2, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (28/10): "Nhà máy chạy lại": nhà máy của Sola hồi phục, mỗi màn ghép lại 2–4 thứ của mùa 2 (bảng recall ở kiem-trum-mua-2.mjs):
   gói 1 xích + biến + sidestep / spin · gói 2 hàm có tham số forward(n) · gói 3 hồng ngoại distance() · gói 4 nút bắn + cửa, băng chuyền, nút đè M · gói 5 xích đẩy thùng (xichDay)
   · gói 6 lực bắn fire("fast" / "charge") · gói 7 đo nhiệt warm() + nút bật sẵn · gói 8 đội hai robot (hàm của gói 8: wait_clear, step_clear…) · gói 9 bệ súng xích (beSung: bắn tụ không giật).
   Robot: XE XÍCH gắn SÚNG HƠI (+ mắt hồng ngoại khi m.mat), beSung + xichDay + lucBan ở mọi màn. Màn hai robot (m.bd): R1 xích bệ súng + mắt, R2 xích + mắt (+ xichDay),
   cả hai chương trình KHÓA như gói 8 (chưa có bộ dò chung hai robot cho màn mở), người chơi viết thân MỘT hàm; bộ dò gói 8 (do-duong-doi-mua-2.mjs) kiểm thân cố định.
   Luật như gói 9: màn mở một sân KHÔNG đọc cảm biến (lời cố định phải thua ở màn đọc cảm biến); nhiều sân chỉ ở trùm; không return.
   Chương tong-hop-2: ôn từng cặp; chương trum-mua-2: chế / sửa hàm của em cho dây chuyền, trùm cuối ba sân dùng gần hết.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'shoot', 'shoot_back'];
  var MAT = ['distance', 'warm'];
  var HN = [{ ma: 'hong-ngoai', o: 'tren' }];

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: sao(hamCuaMan || []) }; }
  function o(x, y) { return { x: x, y: y }; }
  /** Nhóm nối: nút (x, y) mở các cửa [[x, y], …]. */
  function noi(x, y, cua) { return { nut: o(x, y), cua: cua.map(function (c) { return o(c[0], c[1]); }) }; }
  function CHO(n) { return FOR(n, ['wait()']); }
  /** Bài làm hai robot: chương trình khóa [R1, R2] + hàm của màn (hm) hay hàm của em mới (em). */
  function B(c, hm, em) {
    var b = { doi: [{ chinh: c[0].slice() }, { chinh: c[1].slice() }], hamCuaMan: sao(hm || []) };
    if (em) b.hamCuaEmMoi = sao(em);
    return b;
  }

  /**
   * Điền trường chung. m.mat: gắn mắt hồng ngoại. Mọi màn: xích + súng hơi, beSung, xichDay, lucBan.
   * Màn hai robot: m.bd = [batDau R1, batDau R2], m.co = [cờ R1, cờ R2], m.chinh = [chương trình R1, R2] (KHÓA cả hai), m.hamMau / m.ham (hàm của màn)
   * hay m.hamEm (hàm của em mới); lời giải khác / công thức khác / lời sai khai { moTa, ham | hamEm, phaiCoMa }.
   */
  function man(m) {
    var mat = !!m.mat;
    delete m.mat;
    m.hang = m.hang || (m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum');
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'xich';
    m.robot = { than: 'xich', tay: 'hoi', camBien: mat ? HN : [] };
    m.hamGoc = mat ? BANH.concat(MAT) : BANH;
    m.beSung = true;
    m.xichDay = true;
    m.lucBan = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    if (m.bd) {
      var bd = m.bd, co = m.co, chinh = m.chinh;
      var R1 = { loaiRobot: 'xich', robot: { than: 'xich', tay: 'hoi', camBien: HN }, hamGoc: BANH.concat(MAT) };
      var R2 = { loaiRobot: 'xich', robot: { than: 'xich', tay: null, camBien: HN }, hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'].concat(MAT) };
      var cung = function (x) { return x.ham !== undefined || x.hamEm !== undefined ? B(chinh, x.ham || [], x.hamEm) : x.baiLam; };
      m.doi = [Object.assign({ batDau: bd[0] }, sao(R1)), Object.assign({ batDau: bd[1] }, sao(R2))];
      m.doi.forEach(function (d, i) { d.coDinh = true; if (co && co[i]) d.co = sao(co[i]); });
      m.batDau = bd[0]; m.robot = sao(R1.robot); m.hamGoc = R1.hamGoc.slice();   // cấp ngoài = R1
      m.maMau = B(chinh, m.hamMau || []);
      m.loiGiai = B(chinh, m.ham || [], m.hamEm);
      if (m.loiGiaiKhac) m.loiGiaiKhac = { moTa: m.loiGiaiKhac.moTa, baiLam: cung(m.loiGiaiKhac) };
      if (m.congThucKhac) m.congThucKhac = m.congThucKhac.map(function (x) { return { moTa: x.moTa, baiLam: cung(x) }; });
      m.loiSai = (m.loiSai || []).map(function (x) { return { moTa: x.moTa, baiLam: cung(x), phaiCoMa: x.phaiCoMa }; });
      ['bd', 'co', 'chinh', 'hamMau', 'ham', 'hamEm'].forEach(function (k) { delete m[k]; });
    }
    m.taoHam = m.taoHam || [];
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân chương tong-hop-2 */

  // tong-hop-2.1: xe (1,1) quay phải ở làn trên; thùng (2,2) và ô đích (5,2) ở làn dưới. Né sang phải (sidestep: xuống làn dưới) rồi đẩy thùng ba ô.
  var SAN_T1 = ['#######', '#.....#', '#.H..D#', '#######'];
  // tong-hop-2.2: xe (2,2) quay lên; nút (2,5) ở cuối giếng SAU LƯNG (ba ô: phải bắn tụ ra sau); trên đầu xe là hốc (2,1): xe hai bánh bắn ra sau thì giật TỚI vào hốc.
  //   Nút mở cửa (3,2) bên phải xe; cờ (5,2).
  var SAN_T2 = ['#######', '##.####', '##.C.F#', '##.####', '##.####', '##N####', '#######'];
  // tong-hop-2.3: hành lang (1..8, 3); ba trạm (2,3), (4,3), (6,3): nút xa phía trên cách ba ô ((2,0)), hai ô ((4,1)), ba ô ((6,0)); hốc phía dưới mỗi trạm.
  //   Nút (4,1) ĐANG BẬT (không mở gì). Nút (2,0) mở cửa (7,3), nút (6,0) mở cửa (8,3); cờ (9,3).
  var SAN_T3 = ['##N###N####', '##.#N#.####', '##.#.#.####', '#......CCF#', '##.#.#.####', '###########'];
  // tong-hop-2.4: xe (1,2) quay phải; thùng A (2,1) trước mũi, sau nó là băng chuyền (3,1) chạy sang phải tới ô đích (4,1). Thùng B (2,3) ở giếng dưới chỗ xe sẽ đứng, ô đích (2,4): xe quay xuống đi hai ô là đẩy B vào đích.
  //   Đẩy A lên băng một ô rồi để băng đưa A tới đích trong lúc xe quay xuống đẩy B. Tự đẩy A tới đích thì xe kẹt cuối băng, không về được giếng.
  var SAN_T4 = ['#######', '#.H>D##', '##.####', '##H####', '##D####', '#######'];

  /* ------------------------------------------------------------- chương trình */

  var L_T1 = ['sidestep()', 'forward(3)'];
  var L_T2 = ['fire_back("charge")', 'tr_right()', 'forward(3)'];
  var C_T3 = nhieu(['move()'], FOR(3, ['tr_left()', 'peek()', 'tr_right()', 'forward(2)']), ['move()']);
  var T_PEEK = ['aim_on()'];                                               // peek(): nút chưa nóng thì tự chọn lực theo xa gần (aim_on của gói 7, aim_fire của gói 6)
  var L_T4 = ['move()', 'tr_right()', 'forward(2)'];

  var DS = [
    /* ================================================================ chương tong-hop-2: Tổng hợp */
    man({
      chuong: 'tong-hop-2', so: 1, ten: 'Thùng ở làn dưới', yMoi: 'ôn: sidestep() của xích rồi xích đẩy thùng (gói 1 + gói 5)',
      kieuBai: 'day-thung', mucTieu: 'day-thung', hamCuaEmCan: ['sidestep', 'tr_right', 'tr_left', 'forward', 'move'],
      deBai: 'Nhà máy của Sola chạy lại: thùng hàng còn nằm ở làn dưới, xe xích đứng ở làn trên. Né sang phải một ô bằng sidestep() của gói Bánh xích (xe quay phải thì ' +
        'làn dưới là bên phải), rồi đẩy thùng ba ô vào ô đích: xích tiến là thùng trượt.',
      veMaMau: 'Chương trình có sẵn đẩy thẳng ở làn trên: không có thùng nào ở đó.',
      san: SAN_T1, batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(3)']),
      sao: { o: 16, nhip: 8 },
      loiGiai: bai(L_T1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# né xuống làn dưới rồi đẩy'].concat(L_T1)) },
      loiSai: [
        { moTa: 'Đẩy ở làn trên: thùng không đi đâu', baiLam: bai(['forward(3)']), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy thiếu một ô: thùng nằm trước ô đích', baiLam: bai(['sidestep()', 'forward(2)']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['sidestep() = tr_right(), move(), tr_left(): sang làn bên phải mà mặt vẫn quay phải.', 'Thùng cách ô đích ba ô: forward(3).']
    }),

    man({
      chuong: 'tong-hop-2', so: 2, ten: 'Nút ở sau lưng', yMoi: 'ôn: fire_back("charge") của gói Lực bắn trên bệ súng: bắn tụ ra sau, xe không giật tới (gói 6 + gói 9)',
      kieuBai: 'ban-sau', hamCuaEmCan: ['fire', 'fire_back', 'tr_right', 'forward', 'move', 'back'],
      deBai: 'Nút mở cửa nằm ở cuối giếng sau lưng xe, cách ba ô: bắn nhanh không tới, phải bắn tụ ra sau bằng fire_back("charge"). Trên đầu xe là hốc: xe hai bánh bắn ra sau ' +
        'thì giật tới vào hốc, còn bệ súng xích đứng yên. Mở cửa bên phải rồi đi tới cờ.',
      veMaMau: 'Sola viết cho xe hai bánh: bắn xong back() để về chỗ cũ. Trên bệ súng, back() làm xe tụt xuống giếng.',
      san: SAN_T2, batDau: { x: 2, y: 2, huong: 0 }, noi: [noi(2, 5, [[3, 2]])],
      maMau: bai(['fire_back("charge")', 'back()', 'tr_right()', 'forward(3)']),
      sao: { o: 13, nhip: 6 },
      loiGiai: bai(L_T2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bắn tụ ra sau, bệ súng không trôi'].concat(L_T2)) },
      loiSai: [
        { moTa: 'Để nguyên back() của Sola: xe tụt xuống giếng, rẽ phải đâm tường', baiLam: bai(['fire_back("charge")', 'back()', 'tr_right()', 'forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn nhanh ra sau: nút cách ba ô, bóng rơi giữa giếng', baiLam: bai(['fire_back("fast")', 'tr_right()', 'forward(3)']), phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['fire_back("charge") bắn tụ ra sau đuôi xe và chờ một nhịp.', 'Bắn, rồi tr_right() và forward(3).']
    }),

    man({
      chuong: 'tong-hop-2', so: 3, ten: 'Trạm xa trạm gần', yMoi: 'ôn: hàm của màn gọi aim_on() (gói 7): nút chưa nóng thì tự chọn lực theo xa gần; chương trình chính khóa',
      kieuBai: 'doc-nhiet', mat: true, chinhCoDinh: true, hamCuaEmCan: ['aim_on', 'aim_fire', 'fire', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Ba trạm, nút xa gần khác nhau: cách ba ô thì bắn tụ, cách hai ô bắn nhanh là đủ. Nút trạm giữa đang bật (quầng đỏ), không mở gì. Hai nút tắt mở hai cánh cửa cuối hành lang. ' +
        'Chương trình chính đã khóa, ở mỗi trạm quay lên rồi gọi peek(). Viết thân peek(): nút chưa nóng thì tự chọn lực: aim_on() của gói Đo nhiệt làm đúng việc đó.',
      veMaMau: 'Chương trình chính bị khóa. peek() có sẵn bắn nhanh mọi nút: hai nút cách ba ô, bóng không tới.',
      san: SAN_T3, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(2, 0, [[7, 3]]), noi(6, 0, [[8, 3]])], nutBat: [o(4, 1)],
      maMau: bai(C_T3, [H('peek', [], ['fire("fast")'])]),
      sao: { o: 27, nhip: 22 },
      loiGiai: bai(C_T3, [H('peek', [], T_PEEK)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_T3, [H('peek', [], ['# chưa nóng thì đo xa gần rồi bắn'].concat(T_PEEK))]) },
      congThucKhac: [
        { moTa: 'Viết thẳng if not warm(): aim_fire()', baiLam: bai(C_T3, [H('peek', [], IF('not warm()', ['aim_fire()']))]) },
        { moTa: 'Bắn tụ mọi nút không đo: vẫn tới cờ nhưng tắt nút đang bật, phí một nhịp', baiLam: bai(C_T3, [H('peek', [], ['fire("charge")'])]) },
        { moTa: 'Gọi aim_fire() không đo nhiệt: vẫn tới cờ nhưng tắt nút đang bật, phí một nhịp', baiLam: bai(C_T3, [H('peek', [], ['aim_fire()'])]) }
      ],
      loiSai: [
        { moTa: 'Để nguyên bắn nhanh: hai nút cách ba ô, bóng rơi giữa giếng', baiLam: bai(C_T3, [H('peek', [], ['fire("fast")'])]), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Viết if warm(): chỉ bắn nút đang bật, hai nút tắt vẫn tắt', baiLam: bai(C_T3, [H('peek', [], IF('warm()', ['aim_fire()']))]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['aim_on() = if not warm(): aim_fire(); aim_fire() đo distance() rồi chọn lực.', 'Thân peek() chỉ cần một dòng.']
    }),

    man({
      chuong: 'tong-hop-2', so: 4, ten: 'Băng chuyền giúp một tay', yMoi: 'ôn: băng chuyền đưa thùng A tới đích trong lúc xích đẩy thùng B (gói 4 + gói 5)',
      kieuBai: 'bang-chuyen', mucTieu: 'day-thung', hamCuaEmCan: ['tr_right', 'forward', 'move', 'back'],
      deBai: 'Hai thùng, hai ô đích. Thùng A nằm trước mũi xe, sau nó là băng chuyền chạy tới ô đích: đẩy A lên băng một ô rồi để băng làm nốt. ' +
        'Thùng B nằm trong giếng phía dưới: xe quay xuống, đi hai ô là đẩy B vào ô đích. Nhớ: băng chuyền đẩy thùng đứng trên nó sau hai nhịp, nhưng không đẩy được xích.',
      veMaMau: 'Chương trình có sẵn tự đẩy A tới tận đích: xe đứng cuối băng, không về được giếng.',
      san: SAN_T4, batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(2)', 'tr_right()', 'forward(2)']),
      sao: { o: 11, nhip: 5 },
      loiGiai: bai(L_T4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# đẩy A lên băng, băng lo phần còn lại'].concat(L_T4)) },
      loiSai: [
        { moTa: 'Tự đẩy A tới tận đích rồi mới quay xuống: xe kẹt cuối băng, đâm tường', baiLam: bai(['forward(2)', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên đẩy A: băng không có gì để đưa đi', baiLam: bai(['tr_right()', 'forward(2)']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Một ô là đủ: thùng lên băng rồi băng tự đẩy nó.', 'move(), tr_right(), forward(2).']
    })
  ];

  ManHoc.manTrumMua2 = DS;
  if (laNode) module.exports = ManHoc;
})();
