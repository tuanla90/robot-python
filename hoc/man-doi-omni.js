/* ============================================================================
   man-doi-omni.js — "Đường học": GÓI ĐỘI OMNI VÀ XÍCH (20 màn, gói ngay sau gói Bánh omni). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§3, §3b, §4, §8).
   Hai robot khác bánh chung một sân hẹp; kỹ năng phối hợp của gói là K4: NHƯỜNG ĐƯỜNG, GIỮ KHOẢNG CÁCH, KHÔNG CHẶN NHAU.
     R1 là xe BÁNH XÍCH: leo bậc S, đứng vững trên băng chuyền (băng không đẩy), nhưng QUAY CHẬM (tr_right() / tr_left() mỗi cái 2 nhịp).
     R2 là xe BÁNH OMNI: trượt ngang không quay (slide_r(n) / slide_l(n)), quay 1 nhịp, nhưng không leo bậc và bị băng đẩy ngay nhịp đầu.
   Cả hai có cảm biến khoảng cách ở hông (front_clear / left_clear / right_clear; đồng đội đứng đó thì ô đó KHÔNG trống). Màn 5 (và che 6) có tay kẹp.
   Đồng đội là vật cản: hai robot cùng muốn vào một ô thì cả hai đứng im; R2 vào được ô R1 vừa rời trong cùng nhịp (R1 thì không), nên omni bám sát xích được.
   Robot tự động (doi[i].coDinh) luôn là xích và luôn cho xem chương trình.

   Chương 1 `doi-omni` (lời giải chuẩn; khóa = robot tự động):
     1  Hai làn, hai kiểu bánh  toi-co   xích đã có forward(6) qua bậc; em viết omni trượt ngang slide_r(4), back()
     2  Giao lộ                 toi-co   xích khóa đi thẳng qua ngã tư; omni chờ một nhịp rồi qua sau lưng xích
     3  Hốc bên lối             toi-co   omni đứng chắn lối: đi một ô rồi trượt vào hốc (cờ omni) cho xích chạy suốt
     4  Tránh nhau              toi-co   hành lang một làn, hai xe ngược chiều: omni trượt vào hốc, chờ xích qua, trượt ra đi tiếp
     5  Giao hộp chân bậc       dua-vat  xích leo bậc lấy hộp, đặt xuống chân bậc; omni lùi khỏi ô giao, chờ hộp bằng cảm biến, chở hộp sang đích
     6  Canh xe tuần tra        toi-co   xích khóa bounce() (đi tới tường rồi lùi về); omni chờ xích ngang mặt rồi lách ra sau lưng, rời đường ray trước khi xích quay về
     7  Hỏi nhầm bên hông       toi-co   xích khóa; omni đỗ trong hốc hỏi nhầm right_clear() (bên tường): đổi sang left_clear()
     8  Ai vào trước            toi-co   ngõ cụt hai cờ: omni (cờ gần) chen vào trước nên xích kẹt; sửa: omni chờ xích (cờ xa) vào trước
     9  Ba băng ngang           toi-co   ba hàng băng đẩy sang trái, ngược chiều xích; omni không trượt né trước thì bị đẩy sang làn xích: lặp slide_r(1), forward(2)
     10 Hành lang tránh xe      toi-co   trùm ba sân: xích khóa go_wall() chạy hết hành lang; hốc và giờ xích tới khác nhau, omni tìm hốc, chờ, ra bằng cảm biến

   Chương 2 `che-doi-omni` (chế lệnh phối hợp; ba hàm mới của em, tên không trùng kho):
       give_way()  = slide_l(1); while right_clear(): wait(); slide_r(1)        omni nhường vào hốc bên trái, ra ngay sau lưng đồng đội
       tail(n)     = n lần: while not front_clear(): wait(); move()             bám theo n ô, không húc đuôi (xe nào cũng dùng được)
       let_pass()  = while front_clear(): wait(); while not front_clear(): wait()   chờ đồng đội đi ngang qua trước mặt (xe nào cũng dùng được)
     1  Cho xe vượt             tạo give_way(): omni đi trước nhưng cờ gần hơn, vào hốc cho xích vượt
     2  Bám đuôi qua góc        tạo tail(n); xích khóa đi trước, quay chậm ở góc; omni tail(5), turn_right(), tail(6)
     3  Chờ omni lướt băng      tạo let_pass() cho XÍCH: chờ omni lướt băng qua rồi mới lên băng, đi ngược chiều băng về cờ
     4  Hai ngã tư              let_pass() cho cả hai: ngã tư trên omni nhường, ngã tư dưới xích nhường; omni trượt xuống không quay
     5  Bậc thang bám đuôi      xích khóa climb(3); omni lặp tail(1), turn_left(), tail(1), turn_right()
     6  Đi qua cho xe biết      xích khóa gọi let_pass(): omni trượt né cột băng, đi ngang trước mặt xích, vào hốc cờ
     7  Sửa hàm bám theo        xích khóa gọi follow(8) (hàm của màn dùng if, bỏ bước): sửa thân thành tail(n); omni dẫn đường vào hốc
     8  Đổi chỗ                 cờ riêng: omni ở hốc trên, xích ở hốc dưới, đổi chỗ cho nhau qua lối ngang có một hốc (give_way)
     9  Sửa hàm chờ hai lượt    xích khóa bounce(); next_pass() của màn chỉ chờ xích tới: thêm vòng chờ xích đi khỏi lên trước
     10 Đoàn xe một làn         trùm ba sân: xích tail(11) bám omni; omni to_left_gap(), give_way(), tail(9); hốc và khoảng cách khác nhau

   Tệp chỉ khai báo chương (ManHoc.chuongThem); lo-trinh-hoc.js chèn hai chương ngay sau che-omni. Máy kiểm riêng: hoc/kiem-doi-omni.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-omni';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-omni.1': { o: 14, nhip: 6 },
    'doi-omni.2': { o: 8, nhip: 7 },
    'doi-omni.3': { o: 11, nhip: 8 },
    'doi-omni.4': { o: 17, nhip: 10 },
    'doi-omni.5': { o: 36, nhip: 15 },
    'doi-omni.6': { o: 28, nhip: 17 },
    'doi-omni.7': { o: 17, nhip: 8 },
    'doi-omni.8': { o: 19, nhip: 8 },
    'doi-omni.9': { o: 12, nhip: 9 },
    'doi-omni.10': { o: 20, nhip: 45 },
    'che-doi-omni.1': { o: 19, nhip: 10 },
    'che-doi-omni.2': { o: 20, nhip: 14 },
    'che-doi-omni.3': { o: 19, nhip: 11 },
    'che-doi-omni.4': { o: 23, nhip: 14 },
    'che-doi-omni.5': { o: 28, nhip: 16 },
    'che-doi-omni.6': { o: 23, nhip: 13 },
    'che-doi-omni.7': { o: 16, nhip: 9 },
    'che-doi-omni.8': { o: 37, nhip: 12 },
    'che-doi-omni.9': { o: 27, nhip: 16 },
    'che-doi-omni.10': { o: 23, nhip: 37 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TRUOT = ['slide_left', 'slide_right'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CB = [{ ma: 'khoang-cach', o: 'hong' }];
  function XICH(kep) { return { loaiRobot: 'xich', robot: { than: 'xich', tay: kep ? 'kep' : null, camBien: CB }, hamGoc: BANH.concat(kep ? TAY : [], BA_HUONG) }; }
  function OMNI(kep) { return { loaiRobot: 'omni', robot: { than: 'omni', tay: kep ? 'kep' : null, camBien: CB }, hamGoc: BANH.concat(TRUOT, kep ? TAY : [], BA_HUONG) }; }

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Bài làm hai robot: c1 của xích (R1), c2 của omni (R2). */
  function B(c1, c2, hamCuaMan) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: (hamCuaMan || []).map(sao) }; }
  function H(ten, than, thamSo) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }
  /** Vòng for lặp các dòng `lenh` n lần. */
  function LAP(n, lenh) { return ['for i in range(' + n + '):'].concat(lenh.map(function (s) { return '    ' + s; })); }
  function CHO(dk) { return ['while ' + dk + ':', '    wait()']; }

  /** m.bd: [batDau xích, batDau omni]; m.co: [cờ riêng xích, cờ riêng omni] (mục tiêu toi-co); m.khoa: true = xích là robot tự động khóa; m.kep: cả hai có tay kẹp. */
  function man(m) {
    var bd = m.bd, co = m.co, x = XICH(m.kep), o = OMNI(m.kep);
    m.chuong = m.chuong || CHUONG;                                         // chương 2 của gói khai chuong: 'che-' + CHUONG
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, x), Object.assign({ batDau: bd[1] }, o)];
    if (co) { m.doi[0].co = co[0]; m.doi[1].co = co[1]; }
    if (m.khoa) m.doi[0].coDinh = true;
    delete m.bd; delete m.co; delete m.khoa; delete m.kep;
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = x.loaiRobot; m.robot = sao(x.robot); m.hamGoc = x.hamGoc.slice();
    m.taoHam = m.taoHam || []; m.loiSai = m.loiSai || [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- chương 1: doi-omni */
  var X6 = ['bounce()', 'tr_left()', 'move()'];                                   // 6: xích tuần tra
  var O7_DUNG = CHO('left_clear()').concat(['slide_l(1)'], LAP(4, ['back()']));      // 7: omni trong hốc, chờ xích ngang hông rồi ra
  var X8 = ['forward(2)', 'tr_left()', 'forward(4)'];
  var O8_SAI = ['move()', 'slide_r(3)'];
  var O8_DUNG = ['move()'].concat(LAP(3, ['wait()']), ['move()', 'slide_r(3)']);
  var O9 = LAP(3, ['slide_r(1)', 'forward(2)']);
  var O10 = ['to_left_gap()', 'slide_l(1)'].concat(CHO('right_clear()'), ['slide_r(1)', 'go_wall()']);

  var DS = [
    man({
      so: 1, ten: 'Hai làn, hai kiểu bánh',
      deBai: 'Hai xe ở hai làn riêng. Xe xích đã có chương trình leo qua bậc thang tới cờ. Làn dưới là của xe omni: viết chương trình để omni tới cờ của nó.',
      veMaMau: 'Chạy thử: xích tới cờ, omni đứng yên. Viết chương trình R2.',
      san: ['#########', '#..SS..F#', '#########', '#.....###', '#####F###', '#########'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 0 }], co: [[{ x: 7, y: 1 }], [{ x: 5, y: 4 }]],
      maMau: B(['forward(6)'], []), loiGiai: B(['forward(6)'], ['slide_r(4)', 'back()']),
      hamCuaEmCan: ['forward', 'slide_r', 'back'],
      goiY: ['Omni đang quay mặt lên: slide_r(n) đưa omni sang phải n ô mà không cần quay.', 'Trượt tới ngay trên cờ rồi back() một ô.']
    }),
    man({
      so: 2, ten: 'Giao lộ', khoa: true,
      deBai: 'Xe xích là robot tự động: nó đi thẳng xuống qua ngã tư, em chỉ xem được chương trình. Omni cần đi ngang qua đúng ngã tư đó. Hai xe cùng lao vào một ô thì cả hai đứng im.',
      veMaMau: 'Chương trình R1 đã khóa. Đọc xem xích tới ngã tư ở nhịp nào rồi viết R2.',
      san: ['#########', '####.####', '####.####', '####.####', '#......F#', '####.####', '####.####', '####F####', '#########'],
      bd: [{ x: 4, y: 1, huong: 2 }, { x: 1, y: 4, huong: 1 }], co: [[{ x: 4, y: 7 }], [{ x: 7, y: 4 }]],
      maMau: B(['forward(6)'], []), loiGiai: B(['forward(6)'], ['wait()', 'forward(6)']),
      hamCuaEmCan: ['forward'],
      goiY: ['Xích tới ngã tư ở nhịp 3, đúng lúc omni cũng tới nếu omni đi ngay.', 'Chờ một nhịp: omni tới ngã tư khi xích vừa rời đi.']
    }),
    man({
      so: 3, ten: 'Hốc bên lối',
      deBai: 'Omni đứng giữa lối đi của xích. Phía trước có một hốc nhỏ bên trái, cờ của omni nằm trong hốc. Đưa omni vào hốc để mở đường, rồi cho xích chạy tới cờ cuối lối.',
      veMaMau: 'Omni mới đi một ô. Viết tiếp cho omni và viết chương trình xích.',
      san: ['###########', '####F######', '#........F#', '###########'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 3, y: 2, huong: 1 }], co: [[{ x: 9, y: 2 }], [{ x: 4, y: 1 }]],
      maMau: B([], ['move()']), loiGiai: B(['forward(8)'], ['move()', 'slide_l(1)']),
      hamCuaEmCan: ['forward', 'move', 'slide_l'],
      goiY: ['Omni quay mặt sang phải: slide_l(1) đưa omni lên trên, vào hốc.', 'Xích đi sau omni một ô, nên khi omni rẽ vào hốc thì lối đã trống.']
    }),
    man({
      so: 4, ten: 'Tránh nhau',
      deBai: 'Hành lang chỉ rộng một làn, hai xe đi ngược chiều nhau, mỗi xe tới cờ ở đầu kia. Giữa hành lang có một hốc. Xích quay chậm nên omni là xe nhường: trượt vào hốc, chờ xích qua rồi đi tiếp.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: ['###########', '######.####', '#F.......F#', '###########'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 8, y: 2, huong: 3 }], co: [[{ x: 9, y: 2 }], [{ x: 1, y: 2 }]],
      maMau: B([], []), loiGiai: B(['forward(7)'], ['forward(2)', 'slide_r(1)', 'wait()', 'slide_l(1)', 'forward(5)']),
      hamCuaEmCan: ['forward', 'slide_r', 'slide_l'],
      goiY: ['Omni quay mặt sang trái nên hốc phía trên nằm bên PHẢI omni.', 'Vào hốc trước khi xích tới, chờ một nhịp xích đi ngang, rồi trượt ra ngay sau lưng xích.']
    }),
    man({
      so: 5, ten: 'Giao hộp chân bậc', mucTieu: 'dua-vat', kep: true,
      deBai: 'Hộp nằm trên đỉnh bậc thang, chỉ xích leo được. Xích lấy hộp, lùi xuống rồi đặt hộp vào ô bên phải chân bậc. Omni đang đứng đúng ô đó: lùi ra cho xích đặt, chờ thấy hộp rồi chở hộp sang ô đích.',
      veMaMau: 'Xích mới leo lên và nhặt hộp; omni chưa tránh ô giao hàng. Viết tiếp cho cả hai.',
      san: ['#######', '#o#####', '#S#####', '#S#####', '#..##D#', '##....#', '#######'],
      bd: [{ x: 1, y: 4, huong: 0 }, { x: 2, y: 4, huong: 0 }],
      maMau: B(['forward(2)', 'pick()'], CHO('front_clear()').concat(['pick()', 'slide_r(3)', 'drop()'])),
      loiGiai: B(['forward(2)', 'pick()', 'back()', 'back()', 'tr_right()', 'drop()'], ['back()'].concat(CHO('front_clear()'), ['pick()', 'slide_r(3)', 'drop()'])),
      hamCuaEmCan: ['forward', 'pick', 'back', 'tr_right', 'drop', 'slide_r'],
      goiY: ['Ô giao hàng là ô bên phải chân bậc, chỗ omni đang đứng. Omni back() xuống làn dưới trước.', 'Omni đứng ngay dưới ô giao: while front_clear(): wait() chờ tới khi hộp nằm đó.']
    }),
    man({
      so: 6, ten: 'Canh xe tuần tra', khoa: true,
      deBai: 'Xích tự động chạy trên đường ray: tới tường thì lùi về chỗ cũ (bounce()), rồi rẽ vào cờ. Omni đứng ở lối nhánh, phải lên đường ray và đi về phía trái tới cờ của nó. Lên sớm là húc đầu xích; dùng cảm biến để biết lúc xích đi ngang qua.',
      veMaMau: 'Chương trình R1 đã khóa. Viết R2: chờ, rồi lên đường ray sau lưng xích.',
      san: ['###########', '#F#########', '#.F########', '#.........#', '#####.#####', '###########'],
      bd: [{ x: 2, y: 3, huong: 1 }, { x: 5, y: 4, huong: 0 }], co: [[{ x: 2, y: 2 }], [{ x: 1, y: 1 }]],
      maMau: B(X6, []), loiGiai: B(X6, CHO('front_clear()').concat(['move()', 'slide_l(4)', 'forward(2)'])),
      hamCuaEmCan: ['bounce', 'tr_left', 'move', 'slide_l', 'forward'],
      goiY: ['Xích ở ngay trước mặt thì front_clear() trả False: while front_clear(): wait() chờ tới lúc đó.', 'Xích ngang mặt thì nhịp sau nó đi tiếp: omni move() lên ngay sau lưng nó rồi trượt trái.']
    }),
    man({
      so: 7, ten: 'Hỏi nhầm bên hông', khoa: true,
      deBai: 'Omni đỗ trong hốc bên phải lối đi, chờ xích tự động đi lên rồi mới ra và lùi xuống cờ dưới cùng. Nhưng omni ra quá sớm và chắn đường xích. Tìm chỗ sai trong vòng chờ của omni.',
      veMaMau: 'Chạy thử xem omni ra lúc nào. Sửa chương trình R2.',
      san: ['#######', '###F###', '###.###', '###..##', '###.###', '###.###', '###.###', '###F###', '#######'],
      bd: [{ x: 3, y: 6, huong: 0 }, { x: 4, y: 3, huong: 0 }], co: [[{ x: 3, y: 1 }], [{ x: 3, y: 7 }]],
      maMau: B(['forward(5)'], CHO('right_clear()').concat(['slide_l(1)'], LAP(4, ['back()']))),
      loiGiai: B(['forward(5)'], O7_DUNG),
      hamCuaEmCan: ['forward', 'slide_l', 'back'],
      goiY: ['Lối đi nằm bên TRÁI omni; bên phải omni là tường nên right_clear() luôn False.', 'Hỏi left_clear(): xích tới ngang hông thì nó False và vòng chờ dừng.']
    }),
    man({
      so: 8, ten: 'Ai vào trước',
      deBai: 'Hai xe gặp nhau ở chân một ngõ cụt hẹp. Cờ của xích ở cuối ngõ, cờ của omni ở ô ngay dưới. Chương trình hiện tại cho omni chen vào trước nên xích không vào được. Sửa thứ tự: xe có cờ xa phải vào trước.',
      veMaMau: 'Chạy thử xem hai xe kẹt ở đâu. Sửa chương trình omni.',
      san: ['#########', '####F####', '####F####', '####.####', '####.####', '##.....##', '#########'],
      bd: [{ x: 2, y: 5, huong: 1 }, { x: 6, y: 5, huong: 3 }], co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: B(X8, O8_SAI), loiGiai: B(X8, O8_DUNG),
      hamCuaEmCan: ['forward', 'tr_left', 'move', 'slide_r'],
      goiY: ['Xích tới chân ngõ ở nhịp 2 và mất hai nhịp để quay lên.', 'Omni đi một ô rồi chờ, tới khi xích rời chân ngõ mới vào.']
    }),
    man({
      so: 9, ten: 'Ba băng ngang',
      deBai: 'Xích đi xuống, omni đi lên, hai làn sát nhau. Ba hàng băng chuyền đẩy sang trái, về phía làn xích. Xích đi thẳng qua băng; omni bước lên băng là bị đẩy một ô. Cho omni trượt sang phải trước mỗi hàng băng để băng đẩy nó về đúng làn.',
      veMaMau: 'Tự viết cả hai chương trình. Mỗi khúc băng của omni giống nhau.',
      san: ['#######', '###.F##', '###<<<#', '###...#', '###<<<#', '###...#', '###<<<#', '###F..#', '#######'],
      bd: [{ x: 3, y: 1, huong: 2 }, { x: 4, y: 7, huong: 0 }], co: [[{ x: 3, y: 7 }], [{ x: 4, y: 1 }]],
      maMau: B([], []), loiGiai: B(['forward(6)'], O9),
      hamCuaEmCan: ['forward', 'slide_r'],
      goiY: ['Omni đứng ở cột giữa. Trượt phải một ô rồi bước lên băng: băng đẩy omni về đúng cột giữa.', 'Một khúc là slide_r(1), forward(2); lặp ba lần bằng for.']
    }),
    man({
      so: 10, ten: 'Hành lang tránh xe', khoa: true,
      deBai: 'Ba hành lang một làn, mỗi cái có một hốc bên trái omni. Xích tự động chạy go_wall() hết hành lang về phía omni. Hốc xa gần khác nhau, xích tới sớm muộn khác nhau. Một chương trình omni phải tìm hốc, nhường xích rồi đi tới cờ ở cả ba sân.',
      veMaMau: 'Chương trình R1 đã khóa. Viết R2 chỉ dựa vào cảm biến.',
      san: [
        ['##############', '###.##########', '#F..........F#', '##############'],
        ['##############', '#####.########', '#F..........F#', '##############'],
        ['##############', '####.#########', '#F..........F#', '##############']
      ],
      bd: [[{ x: 9, y: 2, huong: 3 }, { x: 10, y: 2, huong: 3 }, { x: 11, y: 2, huong: 3 }], [{ x: 2, y: 2, huong: 1 }, { x: 2, y: 2, huong: 1 }, { x: 2, y: 2, huong: 1 }]],
      co: [[{ x: 1, y: 2 }], [{ x: 12, y: 2 }]],
      maMau: B(['go_wall()'], []), loiGiai: B(['go_wall()'], O10),
      hamCuaEmCan: ['go_wall', 'to_left_gap', 'slide_l', 'slide_r'],
      goiY: ['to_left_gap() chạy tới khi bên trái trống: đó là hốc.', 'Trong hốc, lối đi ở bên phải: while right_clear(): wait() chờ xích tới ngang hông, rồi trượt ra ngay sau lưng nó.'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội omni và xích' }
    })
  ];

  /* ------------------------------------------------------------- chương 2: che-doi-omni */
  var T_GIVE_WAY = ['slide_l(1)'].concat(CHO('right_clear()'), ['slide_r(1)']);
  var T_TAIL = LAP('n', CHO('not front_clear()').concat(['move()']));
  var T_LET_PASS = CHO('front_clear()').concat(CHO('not front_clear()'));
  var T_FOLLOW_SAI = LAP('n', ['if front_clear():', '    move()']);
  var T_NEXT_SAI = CHO('right_clear()');
  var T_NEXT = CHO('not right_clear()').concat(CHO('right_clear()'));
  function hGiveWay(than) { return H('give_way', than || T_GIVE_WAY); }
  function hTail(than) { return H('tail', than || T_TAIL, ['n']); }
  function hLetPass(than) { return H('let_pass', than || T_LET_PASS); }
  function che(m) { m.chuong = 'che-' + CHUONG; return man(m); }

  var X_2 = ['forward(3)', 'tr_right()', 'forward(7)'];
  var O_5 = LAP(3, ['tail(1)', 'turn_left()', 'tail(1)', 'turn_right()']);
  var X_6 = ['let_pass()', 'move()', 'tr_right()', 'forward(4)'];
  var X_9 = ['bounce()', 'back()'];
  var O_9 = LAP(2, ['next_pass()']).concat(['slide_r(1)', 'forward(4)']);

  DS.push(
    che({
      so: 1, ten: 'Cho xe vượt', taoHam: ['give_way'],
      deBai: 'Hai xe cùng đi sang phải trong hành lang một làn. Cờ của xích ở cuối, cờ của omni ngay trước nó, nên xích phải vượt lên. Chương trình đã gọi give_way(): em tự chế lệnh này để omni trượt vào hốc bên trái, chờ tới khi xích đi ngang qua rồi trượt ra ngay sau lưng nó.',
      veMaMau: 'Xích đã có chương trình; omni mới đi tới cạnh hốc. Tạo give_way() trong Xưởng hàm, gọi nó rồi cho omni đi tiếp tới cờ.',
      san: ['#############', '######.######', '#.........FF#', '#############'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 4, y: 2, huong: 1 }], co: [[{ x: 11, y: 2 }], [{ x: 10, y: 2 }]],
      maMau: B(['forward(10)'], ['forward(2)']),
      loiGiai: Object.assign(B(['forward(10)'], ['forward(2)', 'give_way()', 'forward(4)']), { hamCuaEmMoi: [hGiveWay()] }),
      hamCuaEmCan: ['forward', 'slide_l', 'slide_r'],
      goiY: ['Trong hốc, lối đi nằm bên phải omni: right_clear() là False khi xích ở ngay đó.', 'slide_l(1), chờ while right_clear(): wait(), rồi slide_r(1).']
    }),
    che({
      so: 2, ten: 'Bám đuôi qua góc', taoHam: ['tail'], khoa: true,
      deBai: 'Xích tự động đi trước, tới góc thì quay chậm mất hai nhịp. Omni theo sau mà cứ đi là húc vào đuôi xích. Chương trình omni đã gọi tail(n): em tự chế lệnh này để omni đi n ô, mỗi ô chờ tới khi phía trước trống mới đi.',
      veMaMau: 'R1 đã khóa. R2 đã gọi tail(5) để tới góc: tạo tail có tham số n trong Xưởng hàm, rồi viết đoạn sau góc.',
      san: ['##########', '#......FF#', '#.########', '#.########', '#.########', '#.########', '#.########', '##########'],
      bd: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 6, huong: 0 }], co: [[{ x: 8, y: 1 }], [{ x: 7, y: 1 }]],
      maMau: B(X_2, ['tail(5)', 'turn_right()']),
      loiGiai: Object.assign(B(X_2, ['tail(5)', 'turn_right()', 'tail(6)']), { hamCuaEmMoi: [hTail()] }),
      hamCuaEmCan: ['forward', 'tr_right', 'move', 'turn_right'],
      goiY: ['Mỗi bước: while not front_clear(): wait() rồi move().', 'Lặp bước đó n lần bằng for i in range(n).']
    }),
    che({
      so: 3, ten: 'Chờ omni lướt băng', taoHam: ['let_pass'],
      deBai: 'Omni lướt băng chuyền sang phải rất nhanh. Xích đứng ở lối nhánh, cần lên băng rồi đi ngược chiều băng về cờ bên trái. Lên sớm là chặn omni giữa băng. Chế lệnh let_pass() cho xích: chờ tới khi omni đi ngang trước mặt, rồi chờ tới khi omni đi khỏi.',
      veMaMau: 'Omni đã có chương trình; xích mới gọi let_pass() rồi lên băng. Tạo let_pass() trong Xưởng hàm, rồi viết tiếp đường về cờ của xích.',
      san: ['##########', '#.>>>>>>F#', '###F#.####', '##########'],
      bd: [{ x: 5, y: 2, huong: 0 }, { x: 1, y: 1, huong: 1 }], co: [[{ x: 3, y: 2 }], [{ x: 8, y: 1 }]],
      maMau: B(['let_pass()', 'move()'], ['forward(4)']),
      loiGiai: Object.assign(B(['let_pass()', 'move()', 'tr_left()', 'forward(2)', 'tr_left()', 'move()'], ['forward(4)']), { hamCuaEmMoi: [hLetPass()] }),
      hamCuaEmCan: ['move', 'tr_left', 'forward'],
      goiY: ['Hai vòng chờ nối nhau: while front_clear(): wait() chờ omni tới, while not front_clear(): wait() chờ omni đi.', 'Xích đứng trên băng không bị đẩy nên đi ngược chiều băng được.']
    }),
    che({
      so: 4, ten: 'Hai ngã tư',
      deBai: 'Đường của hai xe cắt nhau ở hai ngã tư. Ở ngã tư trên, xích tới trước nên omni phải nhường; ở ngã tư dưới, omni tới trước nên xích phải nhường. Dùng let_pass() cho cả hai xe.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: ['###########', '###.#######', '##.......##', '###.####.##', '###.####.##', '###......F#', '########.##', '########F##', '###########'],
      bd: [{ x: 3, y: 1, huong: 2 }, { x: 2, y: 2, huong: 1 }], co: [[{ x: 9, y: 5 }], [{ x: 8, y: 7 }]],
      maMau: B([], []),
      loiGiai: B(['forward(4)', 'tr_left()', 'forward(4)', 'let_pass()', 'forward(2)'], ['let_pass()', 'forward(6)', 'slide_r(5)']),
      hamCuaEmCan: ['forward', 'tr_left', 'let_pass', 'slide_r'],
      goiY: ['Omni đứng ngay trước ngã tư trên: gọi let_pass() trước khi đi.', 'Xích dừng ngay trước ngã tư dưới rồi gọi let_pass(); omni trượt xuống mà không cần quay.']
    }),
    che({
      so: 5, ten: 'Bậc thang bám đuôi', khoa: true,
      deBai: 'Xích tự động leo ba bậc thang bằng climb(3), mỗi góc quay chậm hai nhịp. Omni theo sau tới cờ của nó. Viết thẳng từng bước thì tràn khung: lặp tail() và hai lệnh quay.',
      veMaMau: 'R1 đã khóa. Viết R2 bằng một vòng for.',
      san: ['##########', '####F.####', '#####F.###', '######..##', '#######..#', '########.#', '##########'],
      bd: [{ x: 7, y: 4, huong: 0 }, { x: 8, y: 5, huong: 0 }], co: [[{ x: 4, y: 1 }], [{ x: 5, y: 2 }]],
      maMau: B(['climb(3)'], []), loiGiai: B(['climb(3)'], O_5),
      hamCuaEmCan: ['climb', 'tail', 'turn_left', 'turn_right'],
      goiY: ['Mỗi bậc omni đi lên một ô, quay trái, sang trái một ô, quay phải.', 'Dùng tail(1) cho mỗi ô để omni không húc đuôi xích đang quay.']
    }),
    che({
      so: 6, ten: 'Đi qua cho xe biết', khoa: true,
      deBai: 'Xích tự động đứng ở lối nhánh, gọi let_pass(): chờ omni đi ngang trước mặt rồi mới ra đường. Omni phải qua một cột băng chuyền đẩy xuống, đi ngang trước mặt xích rồi vào hốc cờ của nó. Omni không qua thì xích chờ mãi.',
      veMaMau: 'R1 đã khóa. Viết R2.',
      san: ['###########', '##.v###F###', '#..v.....F#', '###.#.#####', '###########'],
      bd: [{ x: 5, y: 3, huong: 0 }, { x: 1, y: 2, huong: 1 }], co: [[{ x: 9, y: 2 }], [{ x: 7, y: 1 }]],
      maMau: B(X_6, []), loiGiai: B(X_6, ['move()', 'slide_l(1)', 'forward(5)', 'slide_l(1)']),
      hamCuaEmCan: ['let_pass', 'move', 'tr_right', 'forward', 'slide_l'],
      goiY: ['Bước thẳng lên băng thì omni bị đẩy xuống hốc dưới. Trượt lên một ô trước, băng sẽ đẩy omni về đúng hàng.', 'Tới ngay dưới hốc cờ thì slide_l(1).']
    }),
    che({
      so: 7, ten: 'Sửa hàm bám theo', khoa: true,
      deBai: 'Xích tự động bám theo omni bằng hàm follow(n) của màn này. Nhưng follow(n) chỉ đi khi phía trước trống, gặp omni thì bỏ luôn bước đó, nên xích tới không đủ ô. Sửa thân follow(n), rồi viết omni dẫn đường vào hốc cờ.',
      veMaMau: 'R1 đã khóa. Sửa hàm follow(n) và viết R2.',
      san: ['###########', '######F####', '#........F#', '###########'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 2, y: 2, huong: 1 }], co: [[{ x: 9, y: 2 }], [{ x: 6, y: 1 }]],
      maMau: B(['follow(8)'], [], [H('follow', T_FOLLOW_SAI, ['n'])]),
      loiGiai: B(['follow(8)'], ['forward(4)', 'slide_l(1)'], [H('follow', ['tail(n)'], ['n'])]),
      hamCuaEmCan: ['tail', 'forward', 'slide_l'],
      goiY: ['if chỉ hỏi một lần rồi đi qua; muốn chờ thì phải dùng while.', 'Thân follow(n) chỉ cần một dòng: tail(n).']
    }),
    che({
      so: 8, ten: 'Đổi chỗ',
      deBai: 'Omni đứng trong hốc trên, xích đứng trong hốc dưới; mỗi xe phải sang đúng hốc của xe kia (cờ có vạch màu của từng xe). Hai xe gặp nhau trên lối ngang một làn. Dùng give_way() cho omni.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: ['#########', '##F.#####', '##.....##', '######F##', '#########'],
      bd: [{ x: 6, y: 3, huong: 0 }, { x: 2, y: 1, huong: 2 }], co: [[{ x: 2, y: 1 }], [{ x: 6, y: 3 }]],
      maMau: B([], []),
      loiGiai: B(['move()', 'tr_left()', 'forward(4)', 'tr_right()', 'move()'], ['move()', 'turn_left()', 'move()', 'give_way()', 'forward(3)', 'turn_right()', 'move()']),
      hamCuaEmCan: ['move', 'tr_left', 'forward', 'tr_right', 'turn_left', 'give_way', 'turn_right'],
      goiY: ['Omni xuống lối ngang rồi quay sang phải: hốc nhỏ ở bên trái omni.', 'Xích quay chậm ở hai góc; give_way() tự chờ đúng lúc, không cần đếm nhịp.']
    }),
    che({
      so: 9, ten: 'Sửa hàm chờ hai lượt', khoa: true,
      deBai: 'Omni đỗ trong hốc. Xích tự động chạy tới tường rồi lùi về (bounce()), nên đi ngang hốc hai lượt; omni chỉ được ra đúng lúc lượt về đi ngang. Hàm next_pass() của màn chờ lượt xích tới KẾ TIẾP, nhưng gọi lần hai lúc xích còn đứng ngang hông thì nó trả về ngay. Sửa thân next_pass().',
      veMaMau: 'R1 đã khóa. Chạy thử xem omni ra lúc nào, rồi sửa next_pass().',
      san: ['###########', '#####.#####', '#F.......F#', '###########'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 5, y: 1, huong: 1 }], co: [[{ x: 1, y: 2 }], [{ x: 9, y: 2 }]],
      maMau: B(X_9, O_9, [H('next_pass', T_NEXT_SAI)]),
      loiGiai: B(X_9, O_9, [H('next_pass', T_NEXT)]),
      hamCuaEmCan: ['bounce', 'back', 'slide_r', 'forward'],
      goiY: ['Xích còn ngang hông thì phải chờ nó đi khỏi trước, rồi mới chờ lượt tới kế tiếp.', 'Thêm while not right_clear(): wait() lên TRƯỚC vòng chờ đang có.']
    }),
    che({
      so: 10, ten: 'Đoàn xe một làn',
      deBai: 'Ba hành lang một làn. Omni đi trước, xích bám theo sau; cờ xích ở cuối, cờ omni ngay trước nó, nên dọc đường omni phải vào hốc cho xích vượt. Hốc xa gần và khoảng cách hai xe mỗi sân một khác. Dùng các hàm em đã chế để một chương trình mỗi xe thắng cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình, chỉ dựa vào cảm biến.',
      san: [
        ['##############', '######.#######', '#..........FF#', '##############'],
        ['##############', '#########.####', '#..........FF#', '##############'],
        ['##############', '#######.######', '#..........FF#', '##############']
      ],
      bd: [[{ x: 1, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }], [{ x: 3, y: 2, huong: 1 }, { x: 2, y: 2, huong: 1 }, { x: 5, y: 2, huong: 1 }]],
      co: [[{ x: 12, y: 2 }], [{ x: 11, y: 2 }]],
      maMau: B([], []),
      loiGiai: B(['tail(11)'], ['to_left_gap()', 'give_way()', 'tail(9)']),
      hamCuaEmCan: ['tail', 'to_left_gap', 'give_way'],
      goiY: ['Xích chỉ cần bám theo: tail() tự chờ khi omni ở ngay trước.', 'Omni tìm hốc bằng to_left_gap(), nhường bằng give_way(), rồi bám theo xích tới cờ. Tới cờ là xe tự dừng, nên số ô của tail() để dư cũng được.'],
      huyHieu: { ma: 'che-' + CHUONG, ten: 'Huy hiệu Chế lệnh đội omni' }
    })
  );

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-omni', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội omni và xích' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội omni' }],
    goi: { ma: CHUONG, ten: 'Đội omni và xích', hinh: 'omni' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
