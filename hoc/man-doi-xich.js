/* ============================================================================
   man-doi-xich.js — "Học lập trình": GÓI ĐỘI XÍCH VÀ NHỆN. Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§4, §8).
   Hai chương doi-xich + che-doi-xich, 20 màn, đặt ngay sau chương che-xich: xích (leo bậc S, đứng vững trên băng, quay chậm) với nhện (bật qua hố, chui gầm, không cảm biến).
   R1 luôn là xích (tay kẹp / cảm biến khoảng cách tùy màn), R2 luôn là nhện (tay kẹp tùy màn). Kỹ năng phối hợp của gói là K3: robot tự động có sẵn
   (doi[i].coDinh, chương trình khóa nhưng em đọc được); nhện không hỏi được gì nên em đọc chương trình xích để đếm nhịp cho nhện, còn xích thì chờ bằng cảm biến.
   Mẹo của gói: xích đứng trên băng không bị đẩy nên làm CHỐT cho nhện đang bị băng đẩy về phía hố; nhện đứng yên làm MỐC cho cảm biến của xích.

   Chương 1 doi-xich (khóa = robot tự động):
     1  Làn bậc, làn gầm        toi-co   hai làn riêng, nhện có sẵn chương trình; em viết xích qua băng ngược và bậc thang (tr_left hai nhịp)
     2  Xích làm chốt           toi-co   xích khóa đỗ ở cuối băng; em viết nhện để băng chở tới chốt rồi bước xuống cờ
     3  Xích đi ngược băng      dua-vat  xích lấy hộp ở đầu băng ngược (nhện bị đẩy, không tới được), lùi về thả cho nhện; nhện chờ rồi bật qua hố tới đích xích không tới được
     4  Chờ xích quay xong      toi-co   xích khóa quay chậm ở ngã tư; em đếm nhịp (tr_right = 2 nhịp) cho nhện qua ngã tư rồi bật lên cờ
     5  Hộp từ trên dốc         dua-vat  xích khóa mang hộp xuống thả trên đầu nhện; nhện chờ = nhịp xích trừ nhịp nhện chui gầm
     6  Xích biết chờ           dua-vat  xích khóa chờ bằng cảm biến; nhện không cần đếm nhịp nhưng không được đứng vào ô trước mũi xích
     7  Sửa điều kiện chờ       toi-co   nhện khóa để băng dọc đẩy xuống; sửa xích: chờ nhện tới rồi chờ nhện đi khỏi (right_clear) mới về cờ
     8  Đứng chắn chỗ đáp       dua-vat  nhện khóa bật qua hố; sửa đường xích: đừng đứng ở chỗ nhện đáp, đón hộp từ bên cạnh (sidestep)
     9  Nhện làm mốc            dua-vat  xích lặp ba hộp: go_wall, lùi một ô, thả; nhện leo vào cuối dãy làm mốc cho cảm biến
     10 Ca ba kho               dua-vat  trùm ba sân: làn nhện như nhau; kho của xích sang phải / trái, bậc / băng, dài ngắn khác nhau (left_clear)
   Chương 2 che-doi-xich (hàm cốt truyện mới: wait_box() = xích chờ vật bằng cảm biến, lift_up(n) = xích nhặt, leo n bậc, thả,
   duck() = nhện chui lên hốc rồi chui xuống nhường đường; pause(n) và hop_box(d) đã học ở che-doi-ho-bang nên chỉ dùng lại):
     1  Hàm chờ hàng            nhện khóa mang hộp tới; em chế wait_box() cho xích
     2  Hàm chở lên bậc         nhện khóa mang hai hộp; em chế lift_up(n), xích gọi lift_up(2) rồi lift_up(1)
     3  Hàm trốn vào hốc        xích khóa chạy ngược hành lang; em chế duck() để nhện nhường đường rồi tới cờ
     4  Chuyền qua ba hố        cả hai: xích lấy hộp trên băng (nhện bị đẩy xuống hố nên không tự lấy); nhện pause rồi lặp hop_box ba lần
     5  Kịp giờ nhện            nhện khóa gọi pause(8) và hop_box: em sửa đường xích cho kịp trước nhịp 9
     6  Ba hộp về kho           cả hai: nhện dùng bring() mang ba hộp từ ba hốc; xích lặp wait_box, go_wall, lùi, thả, quay về
     7  Sửa hàm canh băng       xích khóa gọi hold() của màn hỏi nhầm right_clear (hố vẫn là ô trống): sửa thành left_clear
     8  Sửa hàm chuyền hàng     nhện khóa gọi pass_over(d) của màn nhảy hụt vì gầm trước hố: sửa thành crawl_jump; em viết xích
     9  Đổi chỗ qua hốc         cờ riêng: hai robot đổi chỗ trong hành lang một làn; nhện duck() vào hốc, xích chờ bằng pause(n)
     10 Ca trực ba băng         trùm ba sân: xích tới chặn cuối băng bằng cảm biến (lối khác nhau, tới muộn nhất ở sân 3); nhện pause đủ cho sân chậm nhất
   Máy kiểm riêng: kiem-doi-xich.mjs (luật chung: kiem-goi-doi.mjs). Lưu ý lõi: robot R2 bước vào ô R1 vừa rời trong cùng nhịp thì được,
   R1 bước vào ô R2 vừa rời thì bị chặn; nhện gắp được hộp xích vừa thả trong cùng nhịp. Lời giải đếm nhịp theo cách "chắc ăn" (không dựa vào hai điều này).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-xich', CHE = 'che-doi-xich';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-xich.1': { o: 33, nhip: 12 },
    'doi-xich.2': { o: 20, nhip: 13 },
    'doi-xich.3': { o: 46, nhip: 20 },
    'doi-xich.4': { o: 27, nhip: 9 },
    'doi-xich.5': { o: 50, nhip: 16 },
    'doi-xich.6': { o: 41, nhip: 20 },
    'doi-xich.7': { o: 25, nhip: 10 },
    'doi-xich.8': { o: 45, nhip: 12 },
    'doi-xich.9': { o: 47, nhip: 60 },
    'doi-xich.10': { o: 55, nhip: 64 },
    'che-doi-xich.1': { o: 47, nhip: 25 },
    'che-doi-xich.2': { o: 68, nhip: 47 },
    'che-doi-xich.3': { o: 30, nhip: 16 },
    'che-doi-xich.4': { o: 47, nhip: 30 },
    'che-doi-xich.5': { o: 43, nhip: 21 },
    'che-doi-xich.6': { o: 52, nhip: 65 },
    'che-doi-xich.7': { o: 27, nhip: 14 },
    'che-doi-xich.8': { o: 46, nhip: 18 },
    'che-doi-xich.9': { o: 29, nhip: 20 },
    'che-doi-xich.10': { o: 43, nhip: 42 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'];

  /** Phần riêng của xe xích: o.tay (tay kẹp), o.cam (cảm biến khoảng cách ở hông). */
  function XICH(o) {
    o = o || {};
    return { loaiRobot: 'xich', robot: { than: 'xich', tay: o.tay ? 'kep' : null, camBien: o.cam ? [{ ma: 'khoang-cach', o: 'hong' }] : [] }, hamGoc: BANH.concat(o.tay ? TAY : [], o.cam ? BA_HUONG : []) };
  }
  /** Phần riêng của nhện: tay kẹp hay không. */
  function NHEN_(tay) { return { loaiRobot: 'nhen', robot: { than: 'nhen', tay: tay ? 'kep' : null }, hamGoc: NHEN.concat(tay ? TAY : []) }; }

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Bài làm hai robot: R1 xích, R2 nhện. */
  function B(c1, c2, hamCuaMan) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: hamCuaMan || [] }; }
  function LAP(n, lenh) { return ['for i in range(' + n + '):'].concat(lenh.map(function (s) { return '    ' + s; })); }
  function CHO(n) { return LAP(n, ['wait()']); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  var CHO_HANG = ['while front_clear():', '    wait()'];
  // che-doi-xich.2: xích chờ hộp, chở lên hai bậc, lùi về, chờ hộp thứ hai, chở lên một bậc; nhện khóa mang hai hộp qua hai hố
  var X_C2_2 = ['wait_box()', 'lift_up(2)', 'descend(2)', 'wait_box()', 'lift_up(1)'];
  var N_C2_2 = ['pick()', 'leap("RR")', 'drop()', 'leap("LL")', 'go("U")', 'pick()', 'go("D")', 'pause(9)', 'leap("RR")', 'drop()'];
  // che-doi-xich.10: xích đi hết lối dưới, rẽ theo cảm biến, lên chặn ô cuối băng; nhện chờ đủ cho sân xích tới muộn nhất
  var X_C2_4 = ['go_wall()', 'pick()', 'back()', 'back()', 'tr_right()', 'drop()'];
  var X_C2_10 = ['go_wall()', 'if left_clear():', '    tr_left()', 'else:', '    tr_right()', 'go_wall()'];
  var N_C2_10 = ['pause(4)', 'go("R")', 'pause(3)', 'pick()', 'go("U")', 'drop()'];

  /** m.bd: [batDau xích, batDau nhện]; m.xich: tùy chọn XICH(); m.nhen: true = nhện có tay kẹp; m.khoa: chỉ số robot tự động (chương trình khóa); m.co: [cờ xích, cờ nhện]. */
  function man(m) {
    var bd = m.bd, xich = XICH(m.xich), nhen = NHEN_(!!m.nhen), khoa = m.khoa, co = m.co;
    delete m.bd; delete m.xich; delete m.nhen; delete m.khoa; delete m.co;
    m.chuong = m.chuong || CHUONG;                                         // chương 2 của gói khai chuong: 'che-' + CHUONG
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, xich), Object.assign({ batDau: bd[1] }, nhen)];
    if (khoa !== undefined) m.doi[khoa].coDinh = true;
    if (co) m.doi.forEach(function (d, i) { if (co[i]) d.co = co[i]; });
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = xich.loaiRobot; m.robot = sao(xich.robot); m.hamGoc = xich.hamGoc.slice();
    m.taoHam = m.taoHam || []; m.loiSai = m.loiSai || [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------ chương 1: doi-xich */
  var DS = [
    man({
      so: 1, ten: 'Làn bậc, làn gầm', mucTieu: 'toi-co',
      deBai: 'Hai robot ở hai làn riêng, mỗi robot một lá cờ có vạch màu của nó. Nhện đã có chương trình chui gầm và bật qua hố. Làn của xích có băng chuyền chạy ngược và hai bậc thang: viết chương trình đưa xích tới cờ của nó.',
      veMaMau: 'Chạy thử: nhện tới cờ, xích đứng yên. Viết chương trình R1.',
      san: ['#########', '#.n.u..F#', '#########', '#####F###', '#####S###', '#.<<<S###', '#########'],
      bd: [{ x: 1, y: 5, huong: 1 }, { x: 1, y: 1, huong: 1 }], co: [[{ x: 5, y: 3 }], [{ x: 7, y: 1 }]],
      maMau: B([], ['crawl("R")', 'jump("R")', 'walk("RR")']),
      loiGiai: B(['forward(4)', 'tr_left()', 'forward(2)'], ['crawl("R")', 'jump("R")', 'walk("RR")']),
      hamCuaEmCan: ['forward', 'tr_left', 'crawl', 'jump', 'walk'],
      loiSai: [
        { moTa: 'Rẽ bằng turn_left() của xe hai bánh: xích chỉ quay nửa vòng rồi đâm tường', baiLam: B(['forward(4)', 'turn_left()', 'forward(2)'], ['crawl("R")', 'jump("R")', 'walk("RR")']), phaiCoMa: ['xich-quay-do'] }
      ],
      goiY: ['Băng chuyền không đẩy được xích, bậc thang S xích leo như sàn.', 'Xích quay 90° mất hai nhịp: dùng tr_left().']
    }),
    man({
      so: 2, ten: 'Xích làm chốt', mucTieu: 'toi-co', khoa: 0,
      deBai: 'Xích là robot tự động: chương trình của nó bị khóa, em mở thẻ R1 để đọc. Băng chuyền đẩy nhện về phía hố, nhưng xích đứng ở cuối băng sẽ chặn nhện lại. Viết chương trình cho nhện tới cờ của nó ở dưới băng.',
      veMaMau: 'Xích đã có chương trình. Viết chương trình R2.',
      san: ['########', '#.######', '#.>>>>F#', '#####.S#', '#####FS#', '######.#', '########'],
      bd: [{ x: 6, y: 5, huong: 0 }, { x: 1, y: 1, huong: 1 }], co: [[{ x: 6, y: 2 }], [{ x: 5, y: 4 }]],
      maMau: B(['forward(3)'], []),
      loiGiai: B(['forward(3)'], ['walk("DR")'].concat(CHO(5), ['walk("DD")'])),
      hamCuaEmCan: ['forward', 'walk'],
      loiSai: [
        { moTa: 'Chờ 3 nhịp: nhện bước xuống khi chưa tới ô trên cờ, đâm tường', baiLam: B(['forward(3)'], ['walk("DR")'].concat(CHO(3), ['walk("DD")'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nhện đứng trên băng hai nhịp thì bị đẩy một ô. Xích đứng ở ô cuối nên nhện dừng ngay trước nó.', 'Chờ tới khi nhện bị chặn ở ô ngay trên cờ rồi mới bước xuống.']
    }),
    man({
      so: 3, ten: 'Xích đi ngược băng', xich: { tay: true, cam: true }, nhen: true,
      deBai: 'Hộp nằm ở đầu băng chuyền chạy ngược: nhện bị đẩy nên không tới được, còn xích thì đi được. Xích lấy hộp, mang về thả xuống ô ngay trên đầu nhện; nhện bước xuống, bật qua hố rồi thả hộp vào ô đích mà xích không tới được.',
      veMaMau: 'Xích mới đi tới hộp, nhện mới biết gắp, nhảy và thả. Viết tiếp: xích mang hộp về, nhện chờ đủ nhịp.',
      san: ['########', '#o<<<..#', '#####.##', '###D#.##', '###.u.##', '########'],
      bd: [{ x: 6, y: 1, huong: 3 }, { x: 5, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pick()'], ['pick()', 'go("D")', 'jump("L")', 'drop()']),
      loiGiai: B(['go_wall()', 'pick()', 'back()', 'back()', 'back()', 'tr_left()', 'drop()'], CHO(12).concat(['pick()', 'go("D")', 'jump("L")', 'drop()'])),
      hamCuaEmCan: ['go_wall', 'pick', 'drop', 'back', 'tr_left', 'jump'],
      loiSai: [
        { moTa: 'Nhện chờ 8 nhịp: hộp chưa tới, nhện gắp hụt', baiLam: B(['go_wall()', 'pick()', 'back()', 'back()', 'back()', 'tr_left()', 'drop()'], CHO(8).concat(['pick()', 'go("D")', 'jump("L")', 'drop()'])), phaiCoMa: ['kep-hut'] },
        { moTa: 'Xích quay đầu bằng spin() rồi đi về: mất thêm nhịp, nhện gắp hụt', baiLam: B(['go_wall()', 'pick()', 'spin()', 'forward(3)', 'tr_right()', 'drop()'], CHO(12).concat(['pick()', 'go("D")', 'jump("L")', 'drop()'])), phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['Xích nhặt xong thì lùi về, không cần quay đầu.', 'Đếm nhịp của xích: đi 4, nhặt 2, lùi 3, rẽ 2, thả 1 nhịp nữa thì hộp nằm xuống.']
    }),
    man({
      so: 4, ten: 'Chờ xích quay xong', mucTieu: 'toi-co', khoa: 0,
      deBai: 'Xích tự động đi lên ngã tư, quay sang phải rồi leo bậc tới cờ của nó. Nhện phải đi qua ngã tư rồi bật qua hố lên cờ phía trên. Đọc chương trình xích, cho nhện chờ đúng lúc ngã tư trống.',
      veMaMau: 'Chạy thử: nhện bước vào ngã tư khi xích còn ở đó. Thêm vòng chờ cho nhện.',
      san: ['#########', '####F####', '####u####', '###...SF#', '####.####', '####.####', '#########'],
      bd: [{ x: 4, y: 5, huong: 0 }, { x: 3, y: 3, huong: 1 }], co: [[{ x: 7, y: 3 }], [{ x: 4, y: 1 }]],
      maMau: B(['forward(2)', 'tr_right()', 'forward(3)'], ['go("R")', 'jump("U")']),
      loiGiai: B(['forward(2)', 'tr_right()', 'forward(3)'], CHO(4).concat(['go("R")', 'jump("U")'])),
      hamCuaEmCan: ['forward', 'tr_right', 'go', 'jump'],
      loiSai: [
        { moTa: 'Tính tr_right() như quay của xe hai bánh (một nhịp): chờ 2 nhịp, nhện đụng xích ở ngã tư', baiLam: B(['forward(2)', 'tr_right()', 'forward(3)'], CHO(2).concat(['go("R")', 'jump("U")'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Xích quay 90° mất hai nhịp: nó tới ngã tư ở nhịp 2, quay ở nhịp 3 và 4, rời đi ở nhịp 5.', 'Một bước của nhện mất hai nhịp: bước sang ô mới ở cuối nhịp thứ hai.']
    }),
    man({
      so: 5, ten: 'Hộp từ trên dốc', khoa: 0, xich: { tay: true, cam: true }, nhen: true,
      deBai: 'Xích tự động leo xuống dốc lấy hộp rồi thả hộp xuống ô ngay trên đầu nhện. Nhện chui qua gầm tới chỗ nhận hàng, chờ hộp, rồi bật qua hố thả hộp vào ô đích.',
      veMaMau: 'Chạy thử: nhện gắp hụt vì hộp chưa tới. Đếm nhịp của xích, trừ đi nhịp nhện đi đường, rồi thêm vòng chờ.',
      san: ['#######', '#oSS..#', '###.###', '###.#D#', '#.n.u.#', '#######'],
      bd: [{ x: 5, y: 1, huong: 3 }, { x: 1, y: 4, huong: 0 }],
      maMau: B(['go_wall()', 'pick()', 'back()', 'tr_left()', 'move()', 'drop()'], ['crawl("R")', 'pick()', 'jump("R")', 'drop()']),
      loiGiai: B(['go_wall()', 'pick()', 'back()', 'tr_left()', 'move()', 'drop()'], ['crawl("R")'].concat(CHO(5), ['pick()', 'jump("R")', 'drop()'])),
      hamCuaEmCan: ['go_wall', 'pick', 'back', 'tr_left', 'move', 'drop', 'crawl', 'jump'],
      loiSai: [
        { moTa: 'Tính tr_left() như một nhịp: chờ 3 nhịp, nhện gắp hụt', baiLam: B(['go_wall()', 'pick()', 'back()', 'tr_left()', 'move()', 'drop()'], ['crawl("R")'].concat(CHO(3), ['pick()', 'jump("R")', 'drop()'])), phaiCoMa: ['kep-hut'] },
        { moTa: 'Chờ đủ 10 nhịp của xích mà không trừ nhịp nhện chui gầm: vẫn thắng nhưng chậm', baiLam: B(['go_wall()', 'pick()', 'back()', 'tr_left()', 'move()', 'drop()'], ['crawl("R")'].concat(CHO(10), ['pick()', 'jump("R")', 'drop()'])), phaiCoMa: [] }
      ],
      goiY: ['Xích đi 3 nhịp, nhặt 2, lùi 1, rẽ 2, tiến 1: hộp nằm xuống ở nhịp 10. Nhện chui gầm mất 5 nhịp.', 'Nhện chờ thêm 5 nhịp rồi gắp là chắc chắn có hộp.']
    }),
    man({
      so: 6, ten: 'Xích biết chờ', khoa: 0, xich: { tay: true, cam: true }, nhen: true,
      deBai: 'Lần này xích tự động chờ bằng cảm biến: thấy vật trước mũi là gắp rồi leo bậc thả vào ô đích. Nhện mang hộp tới đặt đúng ô trước mũi xích. Cẩn thận: cảm biến cũng thấy nhện nếu nhện đứng vào ô đó.',
      veMaMau: 'Xích đã có chương trình. Viết chương trình R2: nhện không cần đếm nhịp nữa.',
      san: ['#########', '#o###.SD#', '#.n.u.###', '###...###', '#########'],
      bd: [{ x: 5, y: 1, huong: 2 }, { x: 1, y: 2, huong: 0 }],
      maMau: B(CHO_HANG.concat(['pick()', 'tr_left()', 'move()', 'drop()']), []),
      loiGiai: B(CHO_HANG.concat(['pick()', 'tr_left()', 'move()', 'drop()']), ['pick()', 'crawl("R")', 'walk("DRR")', 'drop()']),
      hamCuaEmCan: ['pick', 'drop', 'tr_left', 'move', 'crawl', 'walk'],
      loiSai: [
        { moTa: 'Nhảy qua hố đáp đúng ô trước mũi xích: xích tưởng hàng đã tới, gắp hụt rồi đi mất', baiLam: B(CHO_HANG.concat(['pick()', 'tr_left()', 'move()', 'drop()']), ['pick()', 'crawl("R")', 'jump("R")', 'go("D")', 'drop()']), phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Đi thẳng sang phải: nhện rơi xuống hố', baiLam: B(CHO_HANG.concat(['pick()', 'tr_left()', 'move()', 'drop()']), ['pick()', 'crawl("R")', 'walk("RR")', 'drop()']), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Xích chờ bằng while front_clear(): nhện tới lúc nào cũng được.', 'Nhện đứng ở ô ngay dưới chỗ nhận hàng rồi mới thả: tay nhện hướng lên.']
    }),
    man({
      so: 7, ten: 'Sửa điều kiện chờ', mucTieu: 'toi-co', khoa: 1, xich: { cam: true },
      deBai: 'Nhện tự động bước lên băng chuyền dọc và để băng đẩy xuống. Xích phải đứng trên băng làm chốt cho tới khi nhện bước sang trái rồi mới đi về cờ, nhưng xích đi mất quá sớm và nhện rơi xuống hố. Sửa chương trình xích.',
      veMaMau: 'Chương trình nhện bị khóa. Chạy thử từng nhịp rồi sửa vòng chờ của xích.',
      san: ['#######', '###.###', '###v###', '#F.v###', '#F.vSS#', '###u###', '#######'],
      bd: [{ x: 5, y: 4, huong: 3 }, { x: 3, y: 1, huong: 2 }], co: [[{ x: 1, y: 4 }], [{ x: 1, y: 3 }]],
      maMau: B(['forward(2)', 'while not right_clear():', '    wait()', 'forward(2)'], ['go("D")'].concat(CHO(4), ['walk("LL")'])),
      loiGiai: B(['forward(2)', 'while right_clear():', '    wait()', 'while not right_clear():', '    wait()', 'forward(2)'], ['go("D")'].concat(CHO(4), ['walk("LL")'])),
      hamCuaEmCan: ['forward', 'go', 'walk'],
      loiSai: [
        { moTa: 'Chỉ chờ nhện tới rồi đi ngay: nhện bị băng đẩy tiếp xuống hố', baiLam: B(['forward(2)', 'while right_clear():', '    wait()', 'forward(2)'], ['go("D")'].concat(CHO(4), ['walk("LL")'])), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Xích quay mặt sang trái nên nhện ở phía trên là bên PHẢI của xích: right_clear().', 'Chờ hai lần: chờ tới khi thấy nhện, rồi chờ tới khi nhện đi khỏi.']
    }),
    man({
      so: 8, ten: 'Đứng chắn chỗ đáp', khoa: 1, xich: { tay: true, cam: true }, nhen: true,
      deBai: 'Nhện tự động nhặt hộp, bật qua hố rồi thả hộp lên ô chờ. Xích chạy tới đứng ngay dưới ô chờ để đón, nhưng đó lại là chỗ nhện đáp nên nhện bật hụt. Sửa chương trình xích để nó đón hộp từ bên cạnh rồi leo bậc thả vào ô đích.',
      veMaMau: 'Chương trình nhện bị khóa. Chạy thử, xem nhện bật hụt ở đâu, rồi sửa đường đi của xích.',
      san: ['#######', '####D##', '####S##', '#o#...#', '#.u...#', '#######'],
      bd: [{ x: 5, y: 4, huong: 3 }, { x: 1, y: 4, huong: 0 }],
      maMau: B(['forward(2)', 'tr_right()'].concat(CHO_HANG, ['pick()', 'move()', 'sidestep()', 'move()', 'drop()']), ['pick()', 'jump("R")', 'drop()']),
      loiGiai: B(['sidestep()', 'move()'].concat(CHO_HANG, ['pick()', 'tr_right()', 'move()', 'drop()']), ['pick()', 'jump("R")', 'drop()']),
      hamCuaEmCan: ['sidestep', 'move', 'pick', 'tr_right', 'drop', 'jump'],
      loiSai: [
        { moTa: 'Đứng dưới ô chờ chỉ một nhịp rồi né: nhện vẫn bật hụt vì xích còn ở chỗ đáp', baiLam: B(['forward(2)', 'tr_right()', 'sidestep()'].concat(CHO_HANG, ['pick()', 'tr_right()', 'move()', 'drop()']), ['pick()', 'jump("R")', 'drop()']), phaiCoMa: ['nhay-hut'] }
      ],
      goiY: ['Ô ngay dưới ô chờ là chỗ nhện đáp sau cú nhảy: xích không được đứng đó.', 'Né lên một ô bằng sidestep() rồi tiến tới: ô chờ nằm ngay trước mũi xích.']
    }),
    man({
      so: 9, ten: 'Nhện làm mốc', xich: { tay: true, cam: true },
      deBai: 'Xích chở ba hộp từ đầu dãy sang ba ô đích ở cuối dãy. Cả dãy thông tới tận tường nên xích cần một cái mốc: nhện leo vào ô ngay sau ba ô đích và đứng yên ở đó. Viết thẳng từng hộp thì không đủ 10 ô: hãy lặp.',
      veMaMau: 'Xích mới chở được một hộp tới tường. Viết vòng lặp cho xích và đường đi cho nhện.',
      san: ['############', '#ooo...DDD.#', '##########.#', '########.u.#', '############'],
      bd: [{ x: 5, y: 1, huong: 3 }, { x: 8, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], []),
      loiGiai: B(LAP(3, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()']), ['jump("R")', 'walk("UU")']),
      hamCuaEmCan: ['go_wall', 'pick', 'spin', 'back', 'drop', 'jump', 'walk'],
      loiSai: [
        { moTa: 'Nhện không làm mốc: hộp đầu tiên nằm ở ô sau ba ô đích', baiLam: B(LAP(3, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()']), []), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không lùi trước khi thả: phía trước là mốc hay hộp nên không thả được', baiLam: B(LAP(3, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'drop()', 'spin()']), ['jump("R")', 'walk("UU")']), phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Lặp hai lần: còn một hộp ở đầu dãy', baiLam: B(LAP(2, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()']), ['jump("R")', 'walk("UU")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['go_wall() dừng ngay trước vật cản đầu tiên: hộp, tường hay đồng đội.', 'Lùi một ô rồi thả: hộp nằm đúng ô vừa đi qua, hộp sau dừng sớm hơn một ô.']
    }),
    man({
      so: 10, ten: 'Ca ba kho', xich: { tay: true, cam: true }, nhen: true,
      deBai: 'Ba sân có cùng làn của nhện: nhện nhặt hộp, chui gầm, bật qua hố rồi thả hộp lên trước mũi xích. Kho của xích mỗi sân một kiểu: lối sang phải hay sang trái, có bậc thang hay băng chuyền, dài ngắn khác nhau, ô đích ở cuối lối. Một chương trình cho mỗi robot phải chạy đúng cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: [
        ['############', '#####.SS.D##', '#o###.######', '#.n.u.######', '############'],
        ['############', '#D.>>.######', '#o###.######', '#.n.u.######', '############'],
        ['############', '#####.<<S.D#', '#o###.######', '#.n.u.######', '############']
      ],
      bd: [[{ x: 5, y: 1, huong: 2 }, { x: 5, y: 1, huong: 2 }, { x: 5, y: 1, huong: 2 }], [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }]],
      maMau: B([], []),
      loiGiai: B(CHO_HANG.concat(['pick()', 'if left_clear():', '    tr_left()', 'else:', '    tr_right()', 'go_wall()', 'back()', 'drop()']), ['pick()', 'crawl("R")', 'jump("R")', 'drop()']),
      hamCuaEmCan: ['pick', 'drop', 'tr_left', 'tr_right', 'go_wall', 'back', 'crawl', 'jump'],
      loiSai: [
        { moTa: 'Xích luôn rẽ trái: ở sân thứ hai lối nằm bên kia', baiLam: B(CHO_HANG.concat(['pick()', 'tr_left()', 'go_wall()', 'back()', 'drop()']), ['pick()', 'crawl("R")', 'jump("R")', 'drop()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả ngay khi tới tường, không lùi: phía trước là tường', baiLam: B(CHO_HANG.concat(['pick()', 'if left_clear():', '    tr_left()', 'else:', '    tr_right()', 'go_wall()', 'drop()']), ['pick()', 'crawl("R")', 'jump("R")', 'drop()']), phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Nhện bật thẳng qua gầm: trần thấp chắn cú nhảy', baiLam: B(CHO_HANG.concat(['pick()', 'if left_clear():', '    tr_left()', 'else:', '    tr_right()', 'go_wall()', 'back()', 'drop()']), ['pick()', 'jump("R")', 'jump("R")', 'drop()']), phaiCoMa: ['nhay-hut'] }
      ],
      goiY: ['Xích chờ hộp bằng cảm biến rồi hỏi left_clear() để biết lối đi phía nào.', 'go_wall() đi tới tận tường, nên lùi một ô rồi mới thả hộp vào ô đích cuối lối.'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội xích và nhện' }
    }),

    /* ------------------------------------------------------------ chương 2: che-doi-xich */
    man({
      chuong: CHE, so: 1, ten: 'Hàm chờ hàng', khoa: 1, xich: { tay: true, cam: true }, nhen: true, taoHam: ['wait_box'],
      deBai: 'Nhện tự động chui gầm mang hộp tới trước mũi xích. Chương trình xích gọi wait_box() rồi mới gắp và leo bậc. Em tự chế wait_box(): xích đứng chờ cho tới khi thấy vật trước mũi.',
      veMaMau: 'Chạy thử: xích gắp ngay khi hộp chưa tới. Thêm dòng wait_box() vào đầu chương trình xích, rồi mở Xưởng hàm tạo wait_box().',
      san: ['########', '#####SD#', '####SS##', '#o#..###', '#.n..###', '########'],
      bd: [{ x: 3, y: 3, huong: 1 }, { x: 1, y: 4, huong: 0 }],
      maMau: B(['pick()', 'climb(2)', 'drop()'], ['pick()', 'crawl("R")', 'go("R")', 'drop()']),
      loiGiai: Object.assign(B(['wait_box()', 'pick()', 'climb(2)', 'drop()'], ['pick()', 'crawl("R")', 'go("R")', 'drop()']), { hamCuaEmMoi: [H('wait_box', [], CHO_HANG)] }),
      hamCuaEmCan: ['pick', 'drop', 'climb', 'crawl', 'go'],
      loiSai: [
        { moTa: 'Gọi wait_box() mà chưa chế hàm', baiLam: B(['wait_box()', 'pick()', 'climb(2)', 'drop()'], ['pick()', 'crawl("R")', 'go("R")', 'drop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Điều kiện ngược: chờ khi phía trước có vật, nên xích gắp ngay lúc hộp chưa tới', baiLam: B(['wait_box()', 'pick()', 'climb(2)', 'drop()'], ['pick()', 'crawl("R")', 'go("R")', 'drop()']), hamCuaEmMoi: [H('wait_box', [], ['while not front_clear():', '    wait()'])], phaiCoMa: ['kep-hut'] },
        { moTa: 'Chỉ chờ một nhịp: hộp chưa tới', baiLam: B(['wait_box()', 'pick()', 'climb(2)', 'drop()'], ['pick()', 'crawl("R")', 'go("R")', 'drop()']), hamCuaEmMoi: [H('wait_box', [], ['wait()'])], phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['Ô trước mũi có hộp thì front_clear() trả False.', 'while front_clear(): wait()']
    }),
    man({
      chuong: CHE, so: 2, ten: 'Hàm chở lên bậc', khoa: 1, xich: { tay: true, cam: true }, nhen: true, taoHam: ['lift_up'],
      deBai: 'Nhện tự động bật qua hai hố mang tới hai hộp, từng hộp một. Xích chở hộp thứ nhất lên đích trên cùng, lùi xuống, rồi chở hộp thứ hai lên đích thấp hơn một bậc. Em tự chế lift_up(n): nhặt hộp, leo n bậc, thả hộp.',
      veMaMau: 'Chương trình xích mới chở được hộp thứ nhất. Tạo lift_up có đối số n, rồi viết lại: chờ hộp, lift_up(2), descend(2), chờ hộp, lift_up(1).',
      san: ['#########', '######SD#', '#o###SD##', '#o##..###', '#.u.u.###', '#########'],
      bd: [{ x: 4, y: 3, huong: 1 }, { x: 1, y: 4, huong: 0 }],
      maMau: B(['wait_box()', 'pick()', 'climb(2)', 'drop()'], N_C2_2),
      loiGiai: Object.assign(B(X_C2_2, N_C2_2), { hamCuaEmMoi: [H('lift_up', ['n'], ['pick()', 'climb(n)', 'drop()'])] }),
      hamCuaEmCan: ['wait_box', 'climb', 'descend', 'pick', 'drop', 'leap', 'go', 'pause'],
      loiSai: [
        { moTa: 'Gọi lift_up mà chưa chế hàm', baiLam: B(X_C2_2, N_C2_2), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên dùng n: lần nào cũng leo hai bậc, hộp thứ hai không có chỗ thả', baiLam: B(X_C2_2, N_C2_2), hamCuaEmMoi: [H('lift_up', ['n'], ['pick()', 'climb(2)', 'drop()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm chỉ ba dòng: pick(), climb(n), drop().', 'Hộp thứ nhất lên hai bậc, hộp thứ hai một bậc: cùng một hàm, khác đối số.']
    }),
    man({
      chuong: CHE, so: 3, ten: 'Hàm trốn vào hốc', mucTieu: 'toi-co', khoa: 0, xich: {}, taoHam: ['duck'],
      deBai: 'Xích tự động chạy ngược hành lang về cờ của nó. Nhện đứng giữa đường, ngay dưới một hốc nhỏ sau gầm thấp. Em tự chế duck(): nhện chui lên hốc rồi chui xuống lại, nhường đường cho xích, sau đó đi tới cờ của nhện.',
      veMaMau: 'Chạy thử: nhện đứng chắn đường xích. Tạo duck() rồi viết chương trình nhện.',
      san: ['#########', '###.#####', '###n#####', '##..S>.F#', '##F######', '#########'],
      bd: [{ x: 7, y: 3, huong: 3 }, { x: 3, y: 3, huong: 0 }], co: [[{ x: 2, y: 4 }], [{ x: 7, y: 3 }]],
      maMau: B(['forward(5)', 'tr_left()', 'move()'], ['walk("RRR")']),
      loiGiai: Object.assign(B(['forward(5)', 'tr_left()', 'move()'], ['duck()', 'walk("RRR")']), { hamCuaEmMoi: [H('duck', [], ['crawl("U")', 'crawl("D")'])] }),
      hamCuaEmCan: ['forward', 'tr_left', 'move', 'crawl', 'walk'],
      loiSai: [
        { moTa: 'Chui lên bằng walk(): đứng thẳng thì đâm gầm', baiLam: B(['forward(5)', 'tr_left()', 'move()'], ['duck()', 'walk("RRR")']), hamCuaEmMoi: [H('duck', [], ['walk("UU")', 'walk("DD")'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chui lên mà quên chui xuống: nhện kẹt trong hốc', baiLam: B(['forward(5)', 'tr_left()', 'move()'], ['duck()', 'walk("RRR")']), hamCuaEmMoi: [H('duck', [], ['crawl("U")'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Hốc nằm ngay trên đầu nhện, sau một ô gầm thấp: crawl("U") rồi crawl("D").', 'Ra khỏi hốc thì xích đã đi qua: nhện đi sang phải tới cờ.']
    }),
    man({
      chuong: CHE, so: 4, ten: 'Chuyền qua ba hố', xich: { tay: true, cam: true }, nhen: true,
      deBai: 'Xích đi trên băng chuyền tới hộp, lùi về rồi thả hộp xuống ô ngay trên đầu nhện. Băng đẩy nhện về phía hố nên nhện không tự lấy được. Nhện chờ hộp bằng pause(n), rồi chuyền hộp qua ba hố bằng hop_box() trong một vòng lặp.',
      veMaMau: 'Tự viết cả hai chương trình. Nhện không có cảm biến: đếm nhịp của xích.',
      san: ['###########', '#u<<<<o####', '###.#.#.#D#', '###.u.u.u.#', '###########'],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 3, y: 3, huong: 0 }],
      maMau: B([], []),
      loiGiai: B(X_C2_4, ['pause(10)'].concat(LAP(3, ['hop_box("R")']))),
      hamCuaEmCan: ['go_wall', 'pick', 'tr_right', 'drop', 'pause', 'hop_box'],
      loiSai: [
        { moTa: 'Lặp hai lần: hộp dừng ở ô giữa', baiLam: B(X_C2_4, ['pause(10)'].concat(LAP(2, ['hop_box("R")']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chờ 8 nhịp: quên rẽ của xích mất hai nhịp, nhện gắp hụt', baiLam: B(X_C2_4, ['pause(8)'].concat(LAP(3, ['hop_box("R")']))), phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['Xích: đi 3 nhịp, nhặt 2, lùi 2, rẽ 2, thả ở nhịp 10.', 'Ba lần hop_box("R") giống hệt nhau: một vòng for là đủ.']
    }),
    man({
      chuong: CHE, so: 5, ten: 'Kịp giờ nhện', khoa: 1, xich: { tay: true }, nhen: true,
      deBai: 'Nhện tự động gọi pause(8) rồi hai lần hop_box("R"). Xích phải đặt hộp lên ô chờ trên đầu nhện trước khi nhện gắp. Đọc chương trình nhện để biết xích có bao nhiêu nhịp.',
      veMaMau: 'Chạy thử: xích quay vòng ba lần sang phải nên tới trễ. Sửa chương trình xích cho kịp giờ.',
      san: ['#######', '#.o.###', '#.#####', '#.#.#D#', '#.u.u.#', '#######'],
      bd: [{ x: 3, y: 1, huong: 3 }, { x: 1, y: 4, huong: 0 }],
      maMau: B(['pick()', 'forward(2)', 'tr_right()', 'tr_right()', 'tr_right()', 'move()', 'drop()'], ['pause(8)', 'hop_box("R")', 'hop_box("R")']),
      loiGiai: B(['pick()', 'forward(2)', 'tr_left()', 'move()', 'drop()'], ['pause(8)', 'hop_box("R")', 'hop_box("R")']),
      hamCuaEmCan: ['pick', 'forward', 'tr_left', 'move', 'drop', 'pause', 'hop_box'],
      loiSai: [
        { moTa: 'Quay đầu bằng spin() rồi lùi: tới trễ hai nhịp', baiLam: B(['pick()', 'spin()', 'back()', 'back()', 'tr_right()', 'move()', 'drop()'], ['pause(8)', 'hop_box("R")', 'hop_box("R")']), phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['pause(8): nhện gắp ở nhịp 9, hộp phải nằm sẵn trước đó.', 'Quay trái một lần (2 nhịp) nhanh hơn quay phải ba lần (6 nhịp).']
    }),
    man({
      chuong: CHE, so: 6, ten: 'Ba hộp về kho', xich: { tay: true, cam: true }, nhen: true,
      deBai: 'Nhện mang ba hộp từ ba hốc tới ô chờ trước mũi xích, từng hộp một. Xích lặp ba lần: chờ hộp bằng wait_box(), mang tới cuối dãy, lùi một ô thả xuống, rồi quay về. Mỗi hộp sau dừng sớm hơn hộp trước một ô.',
      veMaMau: 'Tự viết cả hai chương trình. Xích viết thẳng ba lần thì không đủ 10 ô.',
      san: ['###########', '#.o########', '#.#########', '#.o########', '#.#########', '#...S>.DDD#', '#.#########', '#.o########', '###########'],
      bd: [{ x: 3, y: 5, huong: 3 }, { x: 1, y: 3, huong: 1 }],
      maMau: B([], []),
      loiGiai: B(LAP(3, ['wait_box()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()', 'go_wall()']), ['bring("DD")', 'walk("DD")', 'bring("UU")', 'walk("UUUU")', 'bring("DDDD")']),
      hamCuaEmCan: ['wait_box', 'pick', 'spin', 'go_wall', 'back', 'drop', 'bring', 'walk'],
      loiSai: [
        { moTa: 'Xích không chờ hộp: lần đầu gắp hụt rồi chạy tay không', baiLam: B(LAP(3, ['pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()', 'go_wall()']), ['bring("DD")', 'walk("DD")', 'bring("UU")', 'walk("UUUU")', 'bring("DDDD")']), phaiCoMa: ['kep-hut'] },
        { moTa: 'Viết thẳng ba lần: quá 10 ô', baiLam: B(['wait_box()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()', 'go_wall()', 'wait_box()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['bring("DD")', 'walk("DD")', 'bring("UU")', 'walk("UUUU")', 'bring("DDDD")']), phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['go_wall() dừng trước hộp đã thả nên mỗi lần lùi một ô là có chỗ trống.', 'Quay về bằng spin() rồi go_wall(): xích dừng ngay trước hộp mới ở ô chờ.']
    }),
    man({
      chuong: CHE, so: 7, ten: 'Sửa hàm canh băng', mucTieu: 'toi-co', khoa: 0, xich: { cam: true },
      deBai: 'Xích tự động lên đứng trên băng rồi gọi hold(): chờ nhện tới rồi chờ nhện đi khỏi, sau đó mới về cờ. Hàm hold() của màn hỏi nhầm cảm biến nên xích đứng mãi. Sửa thân hàm hold().',
      veMaMau: 'Chương trình chính của xích bị khóa; hàm hold() mở để sửa. Nhện đã có chương trình.',
      san: ['########', '#.###F##', '#.##F.##', '#.>>>>u#', '#####S##', '#####.##', '########'],
      bd: [{ x: 5, y: 5, huong: 0 }, { x: 1, y: 1, huong: 0 }], co: [[{ x: 5, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: B(['forward(2)', 'hold()', 'forward(2)'], ['walk("DDR")', 'pause(4)', 'go("U")'], [H('hold', [], ['while right_clear():', '    wait()', 'while not right_clear():', '    wait()'])]),
      loiGiai: B(['forward(2)', 'hold()', 'forward(2)'], ['walk("DDR")', 'pause(4)', 'go("U")'], [H('hold', [], ['while left_clear():', '    wait()', 'while not left_clear():', '    wait()'])]),
      hamCuaEmCan: ['forward', 'walk', 'pause', 'go'],
      loiSai: [
        { moTa: 'Bỏ vòng chờ thứ hai: xích đi ngay khi nhện vừa tới, băng đẩy nhện qua chỗ trống nên nhện lên nhầm ô', baiLam: B(['forward(2)', 'hold()', 'forward(2)'], ['walk("DDR")', 'pause(4)', 'go("U")'], [H('hold', [], ['while left_clear():', '    wait()'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Xích quay mặt lên, nhện tới từ bên trái. Ô bên phải xích là hố: hố vẫn là ô trống với cảm biến.', 'Đổi right_clear() thành left_clear() ở cả hai vòng.']
    }),
    man({
      chuong: CHE, so: 8, ten: 'Sửa hàm chuyền hàng', khoa: 1, xich: { tay: true, cam: true }, nhen: true,
      deBai: 'Nhện tự động gọi pass_over("R"): nhặt hộp, vượt chướng ngại rồi thả hộp lên trước mũi xích. Nhưng trước hố còn một gầm thấp nên cú nhảy trong pass_over() bị hụt. Sửa thân hàm pass_over(d), rồi viết chương trình xích chở hộp lên kho.',
      veMaMau: 'Chương trình nhện bị khóa, hàm pass_over(d) mở để sửa. Chương trình xích còn trống.',
      san: ['##########', '#####.SSD#', '#o###.####', '#.n.u.####', '##########'],
      bd: [{ x: 5, y: 1, huong: 2 }, { x: 1, y: 3, huong: 0 }],
      maMau: B([], ['pass_over("R")'], [H('pass_over', ['d'], ['pick()', 'jump(d)', 'drop()'])]),
      loiGiai: B(['wait_box()', 'pick()', 'tr_left()', 'go_wall()', 'back()', 'drop()'], ['pass_over("R")'], [H('pass_over', ['d'], ['pick()', 'crawl_jump(d)', 'drop()'])]),
      hamCuaEmCan: ['wait_box', 'pick', 'tr_left', 'go_wall', 'back', 'drop', 'crawl_jump'],
      loiSai: [
        { moTa: 'Chỉ sửa hàm, quên viết chương trình xích', baiLam: B([], ['pass_over("R")'], [H('pass_over', ['d'], ['pick()', 'crawl_jump(d)', 'drop()'])]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chui gầm rồi đi thẳng: nhện rơi xuống hố', baiLam: B(['wait_box()', 'pick()', 'tr_left()', 'go_wall()', 'back()', 'drop()'], ['pass_over("R")'], [H('pass_over', ['d'], ['pick()', 'crawl(d)', 'go(d)', 'go(d)', 'drop()'])]), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Gầm thấp ngay trước hố: crawl_jump(d) chui qua gầm rồi bật qua hố.', 'Xích chờ hộp bằng wait_box(), lên kho bằng go_wall(), lùi một ô rồi thả.']
    }),
    man({
      chuong: CHE, so: 9, ten: 'Đổi chỗ qua hốc', mucTieu: 'toi-co', xich: { cam: true },
      deBai: 'Xích và nhện phải đổi chỗ cho nhau: cờ có vạch vàng của xích ở chỗ nhện đứng, cờ vạch lam của nhện ở chỗ xích đứng. Hành lang chỉ một làn, có một hốc nhỏ sau gầm thấp mà chỉ nhện chui vào được. Nhện dùng duck() vào hốc tránh, xích chờ bằng pause(n) rồi mới đi.',
      veMaMau: 'Chạy thử: hai robot chặn nhau giữa hành lang. Cho nhện vào hốc và cho xích chờ.',
      san: ['########', '###.####', '###n####', '#F..SSF#', '########'],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 6, y: 3, huong: 0 }], co: [[{ x: 6, y: 3 }], [{ x: 1, y: 3 }]],
      maMau: B(['forward(5)'], ['walk("LLLLL")']),
      loiGiai: B(['pause(7)', 'forward(5)'], ['walk("LLL")', 'duck()', 'walk("LL")']),
      hamCuaEmCan: ['pause', 'forward', 'walk', 'duck'],
      loiSai: [
        { moTa: 'Xích không chờ: hai robot chặn nhau ở giữa hành lang', baiLam: B(['forward(5)'], ['walk("LLL")', 'duck()', 'walk("LL")']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xích chờ go_wall(): cảm biến không thấy nhện ở xa nên xích vẫn lao vào hành lang', baiLam: B(['go_wall()'], ['walk("LLL")', 'duck()', 'walk("LL")']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nhện rời ô dưới hốc ở nhịp 8: xích chỉ được bước vào ô đó từ nhịp 9.', 'Xích có cảm biến nhưng không thấy nhện trong hốc: dùng pause(n) như nhện.']
    }),
    man({
      chuong: CHE, so: 10, ten: 'Ca trực ba băng', xich: { cam: true }, nhen: true,
      deBai: 'Ba sân có cùng băng chuyền của nhện: nhện bước lên băng, để băng chở tới ô dưới hộp, gắp hộp rồi bước lên thả vào đích. Xích phải tới đứng chặn ở ô cuối băng trước khi nhện tới, nhưng đường của xích mỗi sân một kiểu: sang phải hay sang trái, dài ngắn khác nhau.',
      veMaMau: 'Tự viết cả hai chương trình. Nhện chờ bao lâu thì đủ cho cả ba sân?',
      san: [
        ['############', '####D#######', '####o#######', '#.>>>>u#####', '#####S######', '#.>>..######', '############', '############', '############'],
        ['############', '####D#######', '####o#######', '#.>>>>u#####', '#####S######', '#####.######', '#####.SS..##', '############', '############'],
        ['############', '####D#######', '####o#######', '#.>>>>u#####', '#####.######', '#####S######', '#####.######', '#####.<<<<.#', '############']
      ],
      bd: [[{ x: 1, y: 5, huong: 1 }, { x: 9, y: 6, huong: 3 }, { x: 10, y: 7, huong: 3 }], [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }]],
      maMau: B([], []),
      loiGiai: B(X_C2_10, N_C2_10),
      hamCuaEmCan: ['go_wall', 'tr_left', 'tr_right', 'pick', 'pause', 'go', 'drop'],
      loiSai: [
        { moTa: 'Nhện chỉ chờ đủ cho hai sân đầu: ở sân thứ ba xích chưa tới chặn, nhện bị băng đẩy qua', baiLam: B(X_C2_10, ['pause(3)'].concat(N_C2_10.slice(1))), phaiCoMa: ['roi-ho'] },
        { moTa: 'Xích luôn rẽ trái: ở sân thứ hai xích quay mặt vào tường', baiLam: B(['go_wall()', 'tr_left()', 'go_wall()'], N_C2_10), phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhện không chờ trên băng mà gắp ngay: băng còn đang đẩy, nhện gắp hụt', baiLam: B(X_C2_10, ['pause(4)', 'go("R")', 'pick()', 'go("U")', 'drop()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xích tới chỗ chặn muộn nhất ở sân thứ ba: nhện phải chờ đủ cho sân đó.', 'Xích đi hết lối dưới, hỏi left_clear() để biết rẽ phía nào, rồi đi lên tới tường.'],
      huyHieu: { ma: CHE, ten: 'Huy hiệu Chế lệnh đội xích' }
    })
  ];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-xich', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội xích và nhện' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội xích' }],
    goi: { ma: CHUONG, ten: 'Đội xích và nhện', hinh: 'xich' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
