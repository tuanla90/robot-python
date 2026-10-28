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
      var R1 = { loaiRobot: 'xich', robot: { than: 'xich', tay: 'hoi', camBien: HN }, hamGoc: BANH.concat(MAT), lucBan: true, xichDay: false };   // bệ súng: không đẩy thùng
      var R2 = { loaiRobot: 'xich', robot: { than: 'xich', tay: null, camBien: HN }, hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'].concat(MAT), xichDay: true };
      delete m.lucBan; delete m.xichDay;                                   // cờ theo từng xe (lucBan chỉ cho xe có súng)
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

  // tong-hop-2.1: xe (1,1) quay phải; thùng A (2,1) trước mũi, sau nó là băng chuyền (3,1) chạy sang phải tới ô đích (4,1). Thùng B (2,3) ở giếng dưới chỗ xe sẽ đứng, ô đích (2,4):
  //   đẩy A lên băng một ô rồi để băng đưa A tới đích trong lúc xe quay xuống đi hai ô đẩy B vào đích. Tự đẩy A tới đích thì xe kẹt cuối băng, không về được giếng.
  var SAN_T1 = ['#######', '#.H>D##', '##.####', '##H####', '##D####', '#######'];
  // tong-hop-2.2: xe (3,2) quay phải; nút (7,2) cách ba ô ở cuối hành lang mở cửa (2,3) ngay dưới ô SAU LƯNG xe; cờ (2,4). Sola lùi bằng jet_back() (bắn tụ, giật lùi): bệ súng không giật.
  var SAN_T2 = ['#########', '#########', '#......N#', '##C######', '##F######', '#########'];
  // tong-hop-2.3: xe (2,2) quay lên; nút (2,5) ở cuối giếng SAU LƯNG (ba ô: phải bắn tụ ra sau); trên đầu xe là hốc (2,1): xe hai bánh bắn ra sau thì giật TỚI vào hốc.
  //   Nút mở cửa (3,2) bên phải xe; cờ (7,2).
  var SAN_T3 = ['#########', '##.######', '##.C...F#', '##.######', '##.######', '##N######', '#########'];
  // tong-hop-2.4: xe (1,1) quay phải ở làn trên; thùng (2,2) và ô đích (7,2) ở làn dưới. Né sang phải (sidestep: xuống làn dưới) rồi đẩy thùng năm ô.
  var SAN_T4 = ['#########', '#.......#', '#.H....D#', '#########'];
  // tong-hop-2.5: xe (2,3) quay lên; nút (2,0) cách ba ô; SAU LƯNG xe là thùng (2,4), rồi hai ô trống, cửa (2,7) đóng, ô đích (2,8). Bắn mở cửa, quay nửa vòng (spin), đẩy thùng bốn ô.
  var SAN_T5 = ['##N##', '##.##', '##.##', '##.##', '##H##', '##.##', '##.##', '##C##', '##D##', '#####'];
  // tong-hop-2.6: hành lang (1..6, 3), xe (1,3) quay phải. Trạm (3,3): một nút ở cuối giếng phía trên (3,0), một ở cuối giếng phía dưới (3,6), đều cách ba ô. Xe quay lên ở trạm:
  //   nút trên là trước mặt, nút dưới là sau lưng. Nút (3,0) mở cửa (4,3), nút (3,6) mở cửa (5,3); cờ (6,3). pair_shot() của Sola bắn hai lần ra trước: nút trên bị bắn hai lần thì tắt lại.
  var SAN_T6 = ['###N####', '###.####', '###.####', '#...CCF#', '###.####', '###.####', '###N####', '########'];
  // tong-hop-2.7: hành lang (1..8, 3); hai trạm (2,3), (4,3): trạm đầu nút (2,1) cách hai ô ĐANG BẬT (không mở gì); trạm sau nút (4,0) cách ba ô, tắt, mở cửa (5,3); hốc phía dưới; cờ (8,3).
  var SAN_T7 = ['####N#####', '##N#.#####', '##.#.#####', '#....C..F#', '##.#.#####', '##########'];
  // tong-hop-2.8 (hai robot): R2 (xe đẩy, không súng) đi hành lang trên (hàng 1) từ (1,1) tới cờ (7,1), đứng ở giếng đầu (2,1) bốn nhịp. R1 (bệ súng) ở hành lang dưới (hàng 3): tại trạm (2,3) và (5,3)
  //   quay lên bắn tụ nút (2,0), (5,0) cách ba ô, qua giếng (·,1), (·,2); R2 đứng trong giếng thì bóng trúng bạn. Nút mở cửa (3,3), (6,3); cờ R1 (8,3). Hốc (2,4), (5,4) dưới trạm.
  var SAN_T8 = ['##N##N####', '#......F##', '##.##.####', '#..C..C.F#', '##.##.####', '##########'];
  // tong-hop-2.9 (hai robot): R2 (xe đẩy, xichDay) ở (4,1) quay xuống, thùng (4,2) trước mũi: đẩy thùng xuống qua ngã tư (4,3), dừng ba nhịp, rồi đẩy tiếp xuống hốc (4,5), đứng ở cờ (4,4).
  //   R1 (bệ súng) đi hành lang (hàng 3) từ (1,3) tới cờ (7,3), mỗi bước gọi box_step(): thùng không nóng (warm() không thấy), phải đo distance().
  var SAN_T9 = ['#########', '####.####', '####H####', '#......F#', '####F####', '####.####', '#########'];
  // tong-hop-2.10 (trùm, ba sân, một chương trình): xe (1,3) quay phải; thùng cách xa gần khác nhau (p = 2 / 3 / 6); đẩy thùng một ô thì xe đứng đúng trạm (p,3) có nút xa phía trên (p,0),
  //   hốc phía dưới (p,4); nút mở cửa (p+2,3) ngay sau thùng; ô đích (p+3,3). Sân 3: nút ĐANG BẬT, cửa đã mở sẵn (thùng ở xa nhất: dãy cố định đếm bước cho hai sân đầu thì hụt).
  //   push(1), lock_left(), push(2).
  var SAN_T10 = [
    ['##N#####', '##.#####', '##.#####', '#.H.CD##', '##.#####', '########'],
    ['###N#####', '###.#####', '###.#####', '#..H.CD##', '###.#####', '#########'],
    ['######N####', '######.####', '######.####', '#.....H.cD#', '######.####', '###########']
  ];

  /* ------------------------------------------------------------- chương trình chương tong-hop-2 */

  var L_T1 = ['move()', 'tr_right()', 'forward(2)'];
  var M_T2 = ['jet_back()', 'tr_right()', 'forward(2)'];                 // Sola: tưởng jet_back() lùi một ô
  var L_T2 = ['jet_back()', 'back()', 'tr_right()', 'forward(2)'];
  var L_T3 = ['fire_back("charge")', 'tr_right()', 'forward(5)'];
  var L_T4 = ['sidestep()', 'forward(5)'];
  var L_T5 = ['fire("charge")', 'spin()', 'forward(4)'];
  var C_T6 = ['forward(2)', 'tr_left()', 'pair_shot()', 'tr_right()', 'forward(3)'];
  var T_PAIR = ['fire("charge")', 'fire_back("charge")'];
  var T_PAIR_LOI = ['fire("charge")', 'fire("charge")'];
  var C_T7 = nhieu(['move()'], FOR(2, ['tr_left()', 'peek()', 'tr_right()', 'forward(2)']), ['forward(2)']);
  var T_PEEK = ['aim_on()'];                                               // peek(): nút chưa nóng thì tự chọn lực theo xa gần (aim_on của gói 7, aim_fire của gói 6)
  var R1_T8 = nhieu(['move()'], FOR(2, ['tr_left()', 'cover_shot()', 'tr_right()', 'forward(3)']));
  var R2_T8 = nhieu(['move()'], CHO(4), ['forward(5)']);
  var T_COVER = ['shot_clear("charge")'];                                  // cover_shot(): chờ bạn đi khỏi đường bóng rồi bắn tụ (gói 8)
  var R1_T9 = FOR(6, ['box_step()']);
  var R2_T9 = nhieu(['move()'], CHO(3), ['forward(2)']);
  var T_BOX = ['step_clear()'];                                            // box_step(): còn sát vật cản (thùng hay bạn) thì chờ, rồi tiến (gói 8)
  var L_T10 = ['push(1)', 'lock_left()', 'push(2)'];

  /* ------------------------------------------------------------------- sân chương trum-mua-2 */

  // trum-mua-2.1: ba làn. Xe (1,1) quay phải ở làn trên; làn giữa có thùng A (3,2) rồi ô đích (4,2); làn dưới có thùng B (6,3) rồi ô đích (7,3).
  //   side_push() = sidestep() (xuống làn dưới) rồi push(1): lần 1 thùng cách một ô, lần 2 cách hai ô (đếm cứng thì hụt).
  var SAN_U1 = ['#########', '#.......#', '#..HD...#', '#.....HD#', '#########'];
  // trum-mua-2.2: hành lang (1..7, 3), hai trạm (2,3), (5,3); mỗi trạm: giếng lên tới nút ((2,0), (5,0)) qua một CỬA NHỊP ((2,1), (5,1)) tự đóng mở; hốc phía dưới.
  //   Nút (2,0) mở cửa (3,3), nút (5,0) mở cửa (6,3); cờ (7,3). fire_on(): bắn tụ tới khi nút nóng: trạm đầu cửa nhịp còn đóng hai nhịp (hai phát trúng cửa), trạm sau mở ngay.
  var SAN_U2 = ['##N##N###', '##c##c###', '##.##.###', '#..C..CF#', '##.##.###', '#########'];
  // trum-mua-2.3: ngã ba ở (2,3). Thùng A (2,2) ngay trước mũi, ô đích (2,1); thùng B (5,3) bên phải cách hai ô, ô đích (6,3); thùng C (2,5) bên dưới cách một ô, ô đích (2,6).
  //   nudge() của Sola: d = distance(), push(1), back(): chỉ lùi một ô, không về ngã ba. Sửa: lùi thêm d ô.
  var SAN_U3 = ['########', '##D#####', '##H#####', '#....HD#', '##.#####', '##H#####', '##D#####', '########'];

  /* ------------------------------------------------------------- chương trình chương trum-mua-2 */

  var C_U1 = FOR(2, ['side_push()']);
  var T_SIDE = ['sidestep()', 'push(1)'];                                 // side_push(): né xuống làn dưới rồi đẩy thùng một ô
  var C_U2 = nhieu(['move()'], FOR(2, ['tr_left()', 'fire_on()', 'tr_right()', 'forward(3)']));
  var T_FON = WHILE('not warm()', ['fire("charge")']);                     // fire_on(): bắn tụ tới khi nút trước mặt nóng
  var C_U3 = ['nudge()', 'tr_right()', 'nudge()', 'tr_right()', 'nudge()'];
  var T_NUDGE_LOI = ['d = distance()', 'push(1)', 'back()'];
  var T_NUDGE = T_NUDGE_LOI.concat(FOR('d', ['back()']));                 // nudge(): đẩy thùng một ô rồi lùi về đúng chỗ cũ

  var DS = [
    /* ================================================================ chương tong-hop-2: Tổng hợp */
    man({
      chuong: 'tong-hop-2', so: 1, ten: 'Băng chuyền giúp một tay', yMoi: 'ôn: băng chuyền đưa thùng A tới đích trong lúc xích đẩy thùng B (gói 4 + gói 5)',
      kieuBai: 'bang-chuyen', mucTieu: 'day-thung', hamCuaEmCan: ['tr_right', 'forward', 'move', 'back'],
      deBai: 'Nhà máy của Sola chạy lại. Hai thùng, hai ô đích. Thùng A nằm trước mũi xe, sau nó là băng chuyền chạy tới ô đích: đẩy A lên băng một ô rồi để băng làm nốt. ' +
        'Thùng B nằm trong giếng phía dưới: xe quay xuống, đi hai ô là đẩy B vào ô đích. Nhớ: băng chuyền đẩy thùng đứng trên nó, nhưng không đẩy được xích.',
      veMaMau: 'Chương trình có sẵn tự đẩy A tới tận đích: xe đứng cuối băng, không về được giếng.',
      san: SAN_T1, batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(2)', 'tr_right()', 'forward(2)']),
      sao: { o: 11, nhip: 5 },
      loiGiai: bai(L_T1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# đẩy A lên băng, băng lo phần còn lại'].concat(L_T1)) },
      loiSai: [
        { moTa: 'Tự đẩy A tới tận đích rồi mới quay xuống: xe kẹt cuối băng, đâm tường', baiLam: bai(['forward(2)', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên đẩy A: băng không có gì để đưa đi', baiLam: bai(['tr_right()', 'forward(2)']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Một ô là đủ: thùng lên băng rồi băng tự đẩy nó.', 'move(), tr_right(), forward(2).']
    }),

    man({
      chuong: 'tong-hop-2', so: 2, ten: 'Đố: jet_back() không lùi', yMoi: 'tìm lỗi: jet_back() của gói Nhà máy lùi nhờ cú giật, trên bệ súng xe đứng yên; muốn lùi phải back()',
      kieuBai: 'do', hamCuaEmCan: ['jet_back', 'fire', 'back', 'tr_right', 'forward', 'move'],
      deBai: 'Sola dùng jet_back() của gói Nhà máy: bắn tụ nút cuối hành lang cho cửa mở, cú giật đưa xe lùi một ô về đúng chỗ rẽ. Chạy thử trên bệ súng: xe không lùi, rẽ phải đâm tường. ' +
        'Vì sao? Bệ súng xích không giật, nên jet_back() chỉ còn là một phát bắn. Sửa cho xe lùi được một ô rồi rẽ xuống cờ.',
      veMaMau: 'Chạy thử chương trình của Sola. Sau phát bắn, xe đứng ở đâu?',
      san: SAN_T2, batDau: { x: 3, y: 2, huong: 1 }, noi: [noi(7, 2, [[2, 3]])],
      maMau: bai(M_T2),
      sao: { o: 17, nhip: 6 },
      loiGiai: bai(L_T2),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích', baiLam: bai(['# bệ súng không giật: lùi bằng back()'].concat(L_T2)) },
      congThucKhac: [{ moTa: 'Bắn bằng fire("charge") rồi back()', baiLam: bai(['fire("charge")', 'back()', 'tr_right()', 'forward(2)']) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: xe không lùi, rẽ phải đâm tường', baiLam: bai(M_T2), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bỏ luôn phát bắn: cửa còn đóng', baiLam: bai(['back()', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['jet_back() = shoot() rồi wait(): trên bệ súng xe đứng yên sau phát bắn.', 'Thêm back() sau jet_back().']
    }),

    man({
      chuong: 'tong-hop-2', so: 3, ten: 'Giếng sau lưng', yMoi: 'ôn: fire_back("charge") của gói Lực bắn trên bệ súng: bắn tụ ra sau, xe không giật tới (gói 6 + gói 9)',
      kieuBai: 'ban-sau', hamCuaEmCan: ['fire', 'fire_back', 'tr_right', 'forward', 'move', 'back'],
      deBai: 'Nút mở cửa nằm ở cuối giếng sau lưng xe, cách ba ô: bắn nhanh không tới, phải bắn tụ ra sau bằng fire_back("charge"). Trên đầu xe là hốc: xe hai bánh bắn ra sau ' +
        'thì giật tới vào hốc, còn bệ súng xích đứng yên. Mở cửa bên phải rồi đi tới cờ.',
      veMaMau: 'Sola viết cho xe hai bánh: bắn xong back() để về chỗ cũ. Trên bệ súng, back() làm xe tụt xuống giếng.',
      san: SAN_T3, batDau: { x: 2, y: 2, huong: 0 }, noi: [noi(2, 5, [[3, 2]])],
      maMau: bai(['fire_back("charge")', 'back()', 'tr_right()', 'forward(5)']),
      sao: { o: 13, nhip: 8 },
      loiGiai: bai(L_T3),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bắn tụ ra sau, bệ súng không trôi'].concat(L_T3)) },
      loiSai: [
        { moTa: 'Để nguyên back() của Sola: xe tụt xuống giếng, rẽ phải đâm tường', baiLam: bai(['fire_back("charge")', 'back()', 'tr_right()', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn nhanh ra sau: nút cách ba ô, bóng rơi giữa giếng', baiLam: bai(['fire_back("fast")', 'tr_right()', 'forward(5)']), phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['fire_back("charge") bắn tụ ra sau đuôi xe và chờ một nhịp.', 'Bắn, rồi tr_right() và forward(5).']
    }),

    man({
      chuong: 'tong-hop-2', so: 4, ten: 'Thùng ở làn dưới', yMoi: 'ôn: sidestep() của xích rồi xích đẩy thùng (gói 1 + gói 5)',
      kieuBai: 'day-thung', mucTieu: 'day-thung', hamCuaEmCan: ['sidestep', 'tr_right', 'tr_left', 'forward', 'move'],
      deBai: 'Thùng hàng nằm ở làn dưới, xe xích đứng ở làn trên. Né sang phải một ô bằng sidestep() của gói Bánh xích (xe quay phải thì làn dưới là bên phải), ' +
        'rồi đẩy thùng năm ô vào ô đích: xích tiến là thùng trượt.',
      veMaMau: 'Chương trình có sẵn đẩy thẳng ở làn trên: không có thùng nào ở đó.',
      san: SAN_T4, batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(5)']),
      sao: { o: 16, nhip: 10 },
      loiGiai: bai(L_T4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# né xuống làn dưới rồi đẩy'].concat(L_T4)) },
      loiSai: [
        { moTa: 'Đẩy ở làn trên: thùng không đi đâu', baiLam: bai(['forward(5)']), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy thiếu một ô: thùng nằm trước ô đích', baiLam: bai(['sidestep()', 'forward(4)']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['sidestep() = tr_right(), move(), tr_left(): sang làn bên phải mà mặt vẫn quay phải.', 'Thùng cách ô đích năm ô: forward(5).']
    }),

    man({
      chuong: 'tong-hop-2', so: 5, ten: 'Mở cửa cho thùng sau lưng', yMoi: 'ôn: bắn tụ mở cửa, spin() quay nửa vòng rồi đẩy thùng sau lưng qua cửa (gói 1 + gói 5 + gói 6)',
      kieuBai: 'mo-cua', mucTieu: 'day-thung', hamCuaEmCan: ['fire', 'spin', 'tr_right', 'tr_left', 'forward', 'move'],
      deBai: 'Nút ở cuối giếng trước mặt, cách ba ô. Sau lưng xe là thùng, xa hơn là cánh cửa đóng rồi ô đích. Bắn tụ mở cửa, quay nửa vòng bằng spin() của gói Bánh xích, ' +
        'rồi đẩy thùng bốn ô qua cửa vào ô đích.',
      veMaMau: 'Chương trình có sẵn quay lại đẩy ngay: cửa còn đóng, thùng kẹt.',
      san: SAN_T5, batDau: { x: 2, y: 3, huong: 0 }, noi: [noi(2, 0, [[2, 7]])],
      maMau: bai(['spin()', 'forward(4)']),
      sao: { o: 15, nhip: 9 },
      loiGiai: bai(L_T5),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mở cửa trước, quay lại đẩy sau'].concat(L_T5)) },
      loiSai: [
        { moTa: 'Quay lại đẩy ngay, chưa mở cửa: thùng vướng cửa đóng', baiLam: bai(['spin()', 'forward(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn nhanh: nút cách ba ô, bóng rơi giữa giếng', baiLam: bai(['fire("fast")', 'spin()', 'forward(4)']), phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['spin() = hai lần tr_right(): bốn nhịp, mặt quay xuống thùng.', 'fire("charge"), spin(), forward(4).']
    }),

    man({
      chuong: 'tong-hop-2', so: 6, ten: 'Sửa hàm pair_shot()', yMoi: 'sửa hàm lỗi: bắn hai lần cùng một nút là nút tắt lại; phát thứ hai phải bắn ra sau (gói 4 + gói 6)',
      kieuBai: 'sua-ham', chinhCoDinh: true, hamCuaEmCan: ['fire', 'fire_back', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Ở trạm có hai nút: một ở cuối giếng phía trên, một ở cuối giếng phía dưới, đều cách ba ô; mỗi nút mở một cánh cửa phía trước. Xe quay lên ở trạm: nút trên trước mặt, nút dưới sau lưng. ' +
        'Sola chế pair_shot() để bắn cả hai, nhưng chép nhầm: hai lần fire("charge"). Nút bắn trúng hai lần thì tắt lại. Chương trình chính đã khóa. Chạy thử rồi sửa hàm.',
      veMaMau: 'Chạy thử. Hai cánh cửa: cánh nào mở, cánh nào không?',
      san: SAN_T6, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(3, 0, [[4, 3]]), noi(3, 6, [[5, 3]])],
      maMau: bai(C_T6, [H('pair_shot', [], T_PAIR_LOI)]),
      sao: { o: 22, nhip: 11 },
      loiGiai: bai(C_T6, [H('pair_shot', [], T_PAIR)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_T6, [H('pair_shot', [], ['# một phát ra trước, một phát ra sau'].concat(T_PAIR))]) },
      congThucKhac: [{ moTa: 'Bắn ra sau trước, ra trước sau', baiLam: bai(C_T6, [H('pair_shot', [], ['fire_back("charge")', 'fire("charge")'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: nút trên bị bắn hai lần nên tắt lại, cửa đầu đóng', baiLam: bai(C_T6, [H('pair_shot', [], T_PAIR_LOI)]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn nhanh ra sau: nút cách ba ô, bóng rơi giữa giếng', baiLam: bai(C_T6, [H('pair_shot', [], ['fire("charge")', 'fire_back("fast")'])]), phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['Nút bắn là công tắc: trúng lần hai là tắt.', 'fire("charge") rồi fire_back("charge").']
    }),

    man({
      chuong: 'tong-hop-2', so: 7, ten: 'Trạm xa trạm gần', yMoi: 'ôn: hàm của màn gọi aim_on() (gói 7): nút chưa nóng thì tự chọn lực theo xa gần; chương trình chính khóa',
      kieuBai: 'doc-nhiet', mat: true, chinhCoDinh: true, hamCuaEmCan: ['aim_on', 'aim_fire', 'fire', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Hai trạm, nút xa gần khác nhau: cách ba ô thì bắn tụ, cách hai ô bắn nhanh là đủ. Nút trạm đầu đang bật (quầng đỏ), không mở gì; nút trạm sau ở xa, mở cánh cửa cuối hành lang. ' +
        'Chương trình chính đã khóa, ở mỗi trạm quay lên rồi gọi peek(). Viết thân peek(): nút chưa nóng thì tự chọn lực: aim_on() của gói Đo nhiệt làm đúng việc đó.',
      veMaMau: 'Chương trình chính bị khóa. peek() có sẵn bắn nhanh mọi nút: nút trạm sau cách ba ô, bóng không tới.',
      san: SAN_T7, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(4, 0, [[5, 3]])], nutBat: [o(2, 1)],
      maMau: bai(C_T7, [H('peek', [], ['fire("fast")'])]),
      sao: { o: 27, nhip: 16 },
      loiGiai: bai(C_T7, [H('peek', [], T_PEEK)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_T7, [H('peek', [], ['# chưa nóng thì đo xa gần rồi bắn'].concat(T_PEEK))]) },
      congThucKhac: [
        { moTa: 'Viết thẳng if not warm(): aim_fire()', baiLam: bai(C_T7, [H('peek', [], IF('not warm()', ['aim_fire()']))]) },
        { moTa: 'Bắn tụ mọi nút không đo: vẫn tới cờ nhưng tắt nút đang bật, phí một nhịp', baiLam: bai(C_T7, [H('peek', [], ['fire("charge")'])]) },
        { moTa: 'Gọi aim_fire() không đo nhiệt: vẫn tới cờ nhưng tắt nút đang bật, phí một nhịp', baiLam: bai(C_T7, [H('peek', [], ['aim_fire()'])]) }
      ],
      loiSai: [
        { moTa: 'Để nguyên bắn nhanh: nút trạm sau cách ba ô, bóng rơi giữa giếng', baiLam: bai(C_T7, [H('peek', [], ['fire("fast")'])]), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Viết if warm(): chỉ bắn nút đang bật, nút tắt vẫn tắt', baiLam: bai(C_T7, [H('peek', [], IF('warm()', ['aim_fire()']))]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['aim_on() = if not warm(): aim_fire(); aim_fire() đo distance() rồi chọn lực.', 'Thân peek() chỉ cần một dòng.']
    }),

    man({
      chuong: 'tong-hop-2', so: 8, ten: 'Bệ súng và xe đẩy', yMoi: 'ôn gói Đội: hai robot, bệ súng chờ bạn đi khỏi đường bóng rồi bắn (shot_clear của gói 8); cả hai chương trình khóa',
      kieuBai: 'doi-ban', hamCuaEmCan: ['shot_clear', 'wait_clear', 'wait_mate', 'fire', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Đội hai xe xích: R1 là bệ súng, R2 là xe đẩy đi hành lang trên và đứng lại ở giếng đầu một lúc. R1 ở mỗi trạm quay lên bắn tụ nút cuối giếng cho cửa mở; ' +
        'R2 còn đứng trong giếng thì bóng trúng bạn. Hai chương trình đã khóa. Viết cover_shot(): chờ bạn đi khỏi rồi bắn tụ. shot_clear(p) của gói Đội làm đúng việc đó.',
      veMaMau: 'Hai chương trình bị khóa. cover_shot() có sẵn bắn ngay: bóng trúng R2 ở trạm đầu.',
      san: SAN_T8, noi: [noi(2, 0, [[3, 3]]), noi(5, 0, [[6, 3]])], bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 1 }], co: [[o(8, 3)], [o(7, 1)]],
      chinh: [R1_T8, R2_T8],
      hamMau: [H('cover_shot', [], ['fire("charge")'])],
      ham: [H('cover_shot', [], T_COVER)],
      sao: { o: 28, nhip: 20 },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', ham: [H('cover_shot', [], ['# bạn đi khỏi rồi mới bắn'].concat(T_COVER))] },
      congThucKhac: [{ moTa: 'Viết wait_clear() rồi fire("charge")', ham: [H('cover_shot', [], ['wait_clear()', 'fire("charge")'])] }],
      loiSai: [
        { moTa: 'Bắn ngay: bóng trúng R2 đang đứng trong giếng đầu', ham: [H('cover_shot', [], ['fire("charge")'])], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Chờ bạn TỚI (wait_mate) rồi bắn: ở trạm sau R2 đã đi qua, chờ mãi', ham: [H('cover_shot', [], ['wait_mate()', 'fire("charge")'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Chờ đúng nhưng bắn nhanh: nút cách ba ô', ham: [H('cover_shot', [], ['shot_clear("fast")'])], phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['warm() thấy R2 trong giếng; wait_clear() chờ tới khi hết thấy.', 'Thân cover_shot(): shot_clear("charge").']
    }),

    man({
      chuong: 'tong-hop-2', so: 9, ten: 'Thùng qua ngã tư', yMoi: 'ôn gói Đội + Đẩy thùng: R2 đẩy thùng qua ngã tư; thùng không nóng nên R1 phải đo distance() (step_clear của gói 8)',
      kieuBai: 'doi-thung', hamCuaEmCan: ['step_clear', 'yield_step', 'wait_clear', 'forward', 'move', 'tr_right'],
      deBai: 'R2 (xe đẩy) đẩy thùng nặng xuống qua ngã tư rồi dừng một lúc; R1 (bệ súng) đi hành lang cắt ngang ngã tư đó, mỗi bước gọi box_step(). ' +
        'Thùng không nóng nên warm() không thấy nó; phải đo distance(): có gì sát mũi xe thì chờ, không thì tiến. step_clear() của gói Đội làm đúng việc đó. Hai chương trình đã khóa.',
      veMaMau: 'Hai chương trình bị khóa. box_step() có sẵn chỉ tiến: R1 húc vào thùng.',
      san: SAN_T9, bd: [{ x: 1, y: 3, huong: 1 }, { x: 4, y: 1, huong: 2 }], co: [[o(7, 3)], [o(4, 4)]],
      chinh: [R1_T9, R2_T9],
      hamMau: [H('box_step', [], ['move()'])],
      ham: [H('box_step', [], T_BOX)],
      sao: { o: 15, nhip: 10 },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', ham: [H('box_step', [], ['# thùng hay bạn sát mũi thì chờ'].concat(T_BOX))] },
      congThucKhac: [{ moTa: 'Viết thẳng while distance() == 0: wait() rồi move()', ham: [H('box_step', [], WHILE('distance() == 0', ['wait()']).concat(['move()']))] }],
      loiSai: [
        { moTa: 'Chỉ tiến: R1 húc vào thùng đang nằm trong ngã tư', ham: [H('box_step', [], ['move()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Dùng yield_step() (chờ khi warm()): thùng không nóng, R1 vẫn húc thùng', ham: [H('box_step', [], ['yield_step()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['distance() là 0 khi ngay trước mũi có thùng hay bạn.', 'Thân box_step(): step_clear().']
    }),

    man({
      chuong: 'tong-hop-2', so: 10, ten: 'Trùm: Ba dây chuyền thùng', yMoi: 'một chương trình cho ba sân: push(1) tới trạm, lock_left() bắn nút còn tắt, push(2) qua cửa vào ô đích',
      hang: 'trum', kieuBai: 'trum', mat: true, mucTieu: 'day-thung', hamCuaEmCan: ['push', 'lock_left', 'lock_on', 'blast_left', 'fire', 'tr_left', 'tr_right', 'forward', 'move'],
      huyHieu: { ma: 'tong-hop-2', ten: 'Huy hiệu Tổng hợp mùa 2' },
      deBai: 'Ba dây chuyền, một chương trình. Thùng nằm xa gần khác nhau; đẩy thùng một ô thì xe đứng đúng trạm có nút xa phía trên, hốc phía dưới. Nút tắt thì mở cánh cửa ngay sau thùng, ' +
        'nút đang bật thì cửa đã mở sẵn. Rồi đẩy thùng hai ô qua cửa vào ô đích. Dùng push(n) của gói Đẩy thùng và lock_left() của gói Bệ súng.',
      veMaMau: 'Chương trình có sẵn đếm cứng theo sân đầu: sân sau thùng ở xa hơn.',
      san: SAN_T10, batDau: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      noi: [[noi(2, 0, [[4, 3]])], [noi(3, 0, [[5, 3]])], []],
      nutBat: [[], [], [o(6, 0)]],
      maMau: bai(['move()', 'blast_left()', 'forward(2)']),
      sao: { o: 22, nhip: 28 },
      loiGiai: bai(L_T10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# tới thùng, bắn nút còn tắt, đẩy qua cửa'].concat(L_T10)) },
      congThucKhac: [{ moTa: 'Bắn mọi nút bằng blast_left(): vẫn tới đích nhưng sân cuối tắt nút đang bật, phí một nhịp', baiLam: bai(['push(1)', 'blast_left()', 'push(2)']) }],
      loiSai: [
        { moTa: 'Đếm cứng theo sân đầu: sân sau thùng ở xa hơn, bắn trúng tường', baiLam: bai(['move()', 'blast_left()', 'forward(2)']), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quên bắn: cửa đóng chặn thùng', baiLam: bai(['push(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đẩy ba ô một mạch rồi mới bắn: xe đã đi quá trạm', baiLam: bai(['push(1)', 'push(2)', 'lock_left()']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['push(1) đo distance() tới thùng, tới sát rồi đẩy một ô: xe đứng đúng trạm.', 'push(1), lock_left(), push(2).']
    }),

    /* ================================================================ chương trum-mua-2: Trùm mùa */
    man({
      chuong: 'trum-mua-2', so: 1, ten: 'Hàm side_push()', yMoi: 'chế hàm cho dây chuyền: sidestep() rồi push(1); chương trình chính khóa gọi hai lần, thùng xa gần khác nhau',
      kieuBai: 'che-ham', mucTieu: 'day-thung', mat: true, chinhCoDinh: true, taoHam: ['side_push'], hamCuaEmCan: ['sidestep', 'push', 'tr_right', 'tr_left', 'forward', 'move'],
      deBai: 'Nhà máy chạy lại từng làn một. Mỗi làn dưới có một thùng cần đẩy một ô vào ô đích, thùng xa gần khác nhau. Em chế side_push(): sidestep() xuống làn dưới rồi push(1) của gói Đẩy thùng ' +
        '(đo distance() tới thùng, tới sát rồi đẩy một ô). Hàm này sẽ theo em suốt chương. Chương trình chính đã khóa: hai lần side_push().',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo side_push() hai dòng.',
      san: SAN_U1, batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(C_U1),
      sao: { o: 19, nhip: 15 },
      loiGiai: { chinh: C_U1.slice(), hamCuaEmMoi: [H('side_push', [], T_SIDE)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U1), hamCuaEmMoi: [H('side_push', [], ['# xuống làn dưới rồi đẩy một ô'].concat(T_SIDE))] },
      loiSai: [
        { moTa: 'Đếm cứng forward(2) theo làn đầu: làn sau thùng ở xa hơn, chưa tới thùng', baiLam: bai(C_U1), hamCuaEmMoi: [H('side_push', [], ['sidestep()', 'forward(2)'])], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quên sidestep(): xe đẩy ở làn trên, không có thùng', baiLam: bai(C_U1), hamCuaEmMoi: [H('side_push', [], ['push(1)'])], phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['push(1) tự đo khoảng cách tới thùng.', 'sidestep(), push(1).']
    }),

    man({
      chuong: 'trum-mua-2', so: 2, ten: 'Hàm fire_on()', yMoi: 'chế hàm while not warm(): fire("charge"): bắn tụ tới khi nút nóng; cửa nhịp chắn bóng lâu chóng khác nhau',
      kieuBai: 'doc-nhiet', mat: true, chinhCoDinh: true, taoHam: ['fire_on'], hamCuaEmCan: ['side_push', 'lock_on', 'fire', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Nút ở cuối giếng nằm sau một cánh cửa tự đóng mở theo nhịp. Cửa đóng thì bóng trúng cửa, nút không đổi. Em chế fire_on(): còn chưa thấy nút nóng thì bắn tụ, rồi bắn nữa. ' +
        'Trạm đầu phải bắn ba phát mới trúng, trạm sau trúng ngay. Chương trình chính đã khóa: ở mỗi trạm quay lên, fire_on(), quay lại, tiến.',
      veMaMau: 'Chương trình chính bị khóa. fire_on() có sẵn chỉ bắn một phát: ở trạm đầu bóng trúng cửa đang đóng.',
      san: SAN_U2, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(2, 0, [[3, 3]]), noi(5, 0, [[6, 3]])],
      cuaNhip: [{ x: 2, y: 1, mo: 3, dong: 4, pha: 2 }, { x: 5, y: 1, mo: 3, dong: 4, pha: 1 }],
      maMau: bai(C_U2),
      sao: { o: 21, nhip: 18 },
      loiGiai: { chinh: C_U2.slice(), hamCuaEmMoi: [H('fire_on', [], T_FON)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U2), hamCuaEmMoi: [H('fire_on', [], ['# bắn tới khi nút nóng'].concat(T_FON))] },
      loiSai: [
        { moTa: 'Chỉ bắn một phát (lock_on): ở trạm đầu bóng trúng cửa đang đóng', baiLam: bai(C_U2), hamCuaEmMoi: [H('fire_on', [], ['lock_on()'])], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Bắn hai phát cứng: trạm đầu cả hai đều trúng cửa đang đóng', baiLam: bai(C_U2), hamCuaEmMoi: [H('fire_on', [], ['fire("charge")', 'fire("charge")'])], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Bắn nhanh trong vòng lặp: nút cách ba ô, không bao giờ nóng, lặp mãi', baiLam: bai(C_U2), hamCuaEmMoi: [H('fire_on', [], WHILE('not warm()', ['fire("fast")']))], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Cửa đóng thì warm() không thấy nút: bắn thêm phát nữa.', 'while not warm(): fire("charge").']
    }),

    man({
      chuong: 'trum-mua-2', so: 3, ten: 'Sửa hàm nudge()', yMoi: 'sửa hàm lỗi: biến d = distance() đã đo mà quên dùng; lùi về chỗ cũ phải lùi thêm d ô',
      kieuBai: 'sua-ham', mucTieu: 'day-thung', mat: true, chinhCoDinh: true, hamCuaEmCan: ['push', 'tr_right', 'forward', 'back', 'move'],
      deBai: 'Xe đứng ở ngã ba, ba thùng ở ba phía, xa gần khác nhau, mỗi thùng cần đẩy một ô vào ô đích. nudge() của Sola đo d = distance(), push(1), rồi back() để về ngã ba, ' +
        'nhưng xe chỉ lùi một ô: thùng ở xa thì xe không về tới ngã ba, lần quay sau lệch chỗ. Chương trình chính đã khóa: nudge(), quay phải, nudge(), quay phải, nudge(). Sửa hàm.',
      veMaMau: 'Chạy thử. Sau thùng bên phải, xe đứng ở đâu?',
      san: SAN_U3, batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai(C_U3, [H('nudge', [], T_NUDGE_LOI)]),
      sao: { o: 22, nhip: 14 },
      loiGiai: bai(C_U3, [H('nudge', [], T_NUDGE)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_U3, [H('nudge', [], ['# lùi về đúng chỗ cũ: một ô đẩy và d ô đã đi'].concat(T_NUDGE))]) },
      congThucKhac: [{ moTa: 'Lùi d + 1 ô bằng một vòng for', baiLam: bai(C_U3, [H('nudge', [], ['d = distance()', 'push(1)'].concat(FOR('d + 1', ['back()'])))]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: sau thùng bên phải xe chưa về ngã ba, quay xuống đẩy vào tường', baiLam: bai(C_U3, [H('nudge', [], T_NUDGE_LOI)]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Lùi cứng ba ô: thùng đầu ở sát, xe lùi quá ngã ba vào thùng dưới', baiLam: bai(C_U3, [H('nudge', [], ['push(1)', 'back()', 'back()', 'back()'])]), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['push(1) đi d + 1 ô: lùi về cũng phải d + 1 ô.', 'Sau back(), thêm for i in range(d): back().']
    })
  ];

  ManHoc.manTrumMua2 = DS;
  if (laNode) module.exports = ManHoc;
})();
