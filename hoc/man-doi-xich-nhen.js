/* ============================================================================
   man-doi-xich-nhen.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 8 "Đội xích và nhện" (KE-HOACH-MUA-3.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `doi-xich`: chương 1 "Đội xích và nhện" (2 màn có sẵn không bậc thang: doi-xich.3, .9); màn mới khai so từ 11
     - `che-doi-xich`: chương 2 "Đội xích và nhện phối hợp" (chưa có màn); màn mới khai so từ 11 (mã che-doi-xich.1 … .10 đã có, ở mùa 4)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước
   màn trùm có sẵn nếu màn cuối có sẵn là trùm); muốn xen giữa thì sửa đúng dòng chương đó trong MUA_3. Chương còn trống thì chưa hiện.
   Ràng buộc mùa 3 (hoc/kiem-lo-trinh.mjs mục mùa 3): thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ;
   không omni, drone, camera, máy sơn, máy ném, color(); không bậc thang S. Chuỗi làm dữ liệu chỉ từ gói 1 chương 2, and / or chỉ từ gói 2 chương 2;
   magnet_s từ gói 6, front_metal từ gói 3, front_pole từ gói 7, crouch / stand / jump / leap từ gói 5; hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDoiXichNhen, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // 30/10 phiên Mùa 3: 18 màn mới của gói 8 (doi-xich.11–.18 xen với doi-xich.3, .9 có sẵn; che-doi-xich.11–.20). Đội hai robot: R1 xe xích (tay kẹp, cảm biến
  // khoảng cách), R2 nhện (có / không tay kẹp). Hai chương trình chạy cùng nhịp; đồng đội là vật cản; nhện bước một ô mất hai nhịp, xích quay 90 độ mất hai nhịp.
  // Hàm có sẵn trong kho lúc tới gói: xích go_wall, pick, drop, back, tr_left, tr_right, spin, forward(n), move; nhện go(d), jump(d), walk(path), crawl(d), leap(path).
  // pause(n) của mùa 2 không còn ở mùa 3: chương 2 cho em tự chế hold(n).
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CHAN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'];
  function XICH(tay) { return { loaiRobot: 'xich', robot: { than: 'xich', tay: tay === false ? null : 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(tay === false ? [] : TAY, BA_HUONG) }; }
  function NHEN(tay) { return { loaiRobot: 'nhen', robot: { than: 'nhen', tay: tay ? 'kep' : null }, hamGoc: CHAN.concat(tay ? TAY : []) }; }
  function B(c1, c2, them) { return Object.assign({ doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }, them || {}); }
  function LAP(n, lenh) { return ['for i in range(' + n + '):'].concat((Array.isArray(lenh) ? lenh : [lenh]).map(function (s) { return '    ' + s; })); }
  function CHO(n) { return LAP(n, 'wait()'); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  /** m.bd: [batDau xích, batDau nhện]; m.tayXich (mặc định có tay kẹp), m.tayNhen; m.khoa: chỉ số robot chạy chương trình khoá; m.co: [cờ xích, cờ nhện]. */
  function man(m) {
    var bd = m.bd, xich = XICH(m.tayXich), nhen = NHEN(!!m.tayNhen), khoa = m.khoa, co = m.co;
    delete m.bd; delete m.tayXich; delete m.tayNhen; delete m.khoa; delete m.co;
    m.chuong = m.chuong || 'doi-xich';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, xich), Object.assign({ batDau: bd[1] }, nhen)];
    if (khoa !== undefined) [].concat(khoa).forEach(function (k) { m.doi[k].coDinh = true; });
    if (co) m.doi.forEach(function (d, i) { if (co[i]) d.co = co[i]; });
    m.batDau = bd[0]; m.loaiRobot = xich.loaiRobot; m.robot = JSON.parse(JSON.stringify(xich.robot)); m.hamGoc = xich.hamGoc.slice();   // cấp ngoài là của R1
    m.taoHam = m.taoHam || []; m.loiSai = m.loiSai || [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================= chương doi-xich "Đội xích và nhện" ================================================= */
    man({
      so: 11, ten: 'Hai robot, một nhịp', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoa: [0, 1], mucTieu: 'toi-co',
      deBai: 'Màn này có hai robot, mỗi robot một chương trình, chạy CÙNG LÚC theo nhịp. Xe xích đi một ô mỗi nhịp. Nhện bước một ô mất hai nhịp, nhảy qua hố mất ba. Bấm Chạy, xem hai robot tới cờ của mình.',
      veMaMau: 'Hai chương trình đã viết sẵn và khoá. Bấm mũi tên ở cột chương trình để xem chương trình của từng robot, rồi bấm Chạy.',
      san: ['########', '#...F###', '########', '#.u.F###', '########'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }], co: [[{ x: 4, y: 1 }], [{ x: 4, y: 3 }]],
      maMau: B(['forward(3)'], ['jump("R")', 'go("R")']),
      loiGiai: B(['forward(3)'], ['jump("R")', 'go("R")']),
      sao: { o: 20, nhip: 5 },
      goiY: ['Mỗi robot chạy chương trình của nó, cùng một đồng hồ nhịp.', 'Robot tới cờ trước thì đứng chờ robot kia.']
    }),

    man({
      so: 12, ten: 'Mỗi robot một việc', hang: 'lam-quen', mucTieu: 'toi-co',
      deBai: 'Xe xích đi tới tường, rẽ phải, đi tiếp hai ô tới cờ của nó. Nhện phải chui qua gầm thấp tới cờ của nhện. Viết cả hai chương trình.',
      veMaMau: 'Chương trình có sẵn: xích mới tới tường, nhện đi thẳng thì đụng gầm. Viết tiếp cả hai.',
      san: ['#######', '#....##', '####.##', '#.nFF##', '#######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }], co: [[{ x: 4, y: 3 }], [{ x: 3, y: 3 }]],
      maMau: B(['go_wall()'], ['walk("RR")']),
      loiGiai: B(['go_wall()', 'tr_right()', 'forward(2)'], ['crawl("R")']),
      sao: { o: 27, nhip: 7 },
      loiSai: [
        { moTa: 'Nhện đi đứng: đụng gầm', baiLam: B(['go_wall()', 'tr_right()', 'forward(2)'], ['walk("RR")']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xích rẽ trái: đi vào tường', baiLam: B(['go_wall()', 'tr_left()', 'forward(2)'], ['crawl("R")']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['crawl("R") co chân, chui qua hai ô, rồi đứng dậy.', 'Xích quay 90 độ bằng tr_right() hay tr_left().']
    }),

    man({
      so: 13, ten: 'Xích qua trước', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Đường của xích và đường của nhện cắt nhau ở một ô. Đi ngay thì nhện đụng xích ngay ô đó. Cho xích đi trước: nhện chờ hai nhịp rồi mới đi. Xích đi tới tường, rẽ phải, đi tới tường lần nữa.',
      veMaMau: 'Chương trình có sẵn: nhện đi ngay, đụng xích ở ngã tư. Viết lại cả hai.',
      san: ['###.###', '###.###', '##....F', '###.###', '###.###', '#F...##', '#######'],
      bd: [{ x: 3, y: 0, huong: 2 }, { x: 2, y: 2, huong: 1 }], co: [[{ x: 1, y: 5 }], [{ x: 6, y: 2 }]],
      maMau: B(['go_wall()', 'tr_right()', 'go_wall()'], ['walk("RRRR")']),
      loiGiai: B(['go_wall()', 'tr_right()', 'go_wall()'], nhieu(CHO(2), ['walk("RRRR")'])),
      sao: { o: 24, nhip: 10 },
      loiSai: [
        { moTa: 'Nhện đi ngay: tới ngã tư đúng lúc xích đi qua', baiLam: B(['go_wall()', 'tr_right()', 'go_wall()'], ['walk("RRRR")']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Xích qua ngã tư ở nhịp 2 rồi đi tiếp.', 'Nhện bước vào ngã tư ở cuối nhịp thứ hai của bước: chờ hai nhịp là đủ.']
    }),

    man({
      so: 14, ten: 'Tránh vào hốc', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Xích và nhện đi ngược chiều trên cùng một hành lang. Hành lang có một hốc nhỏ phía trên. Nhện bước sang trái một ô, lên hốc, chờ xích đi qua, rồi xuống đi tiếp tới cờ. Xích phải chờ nhện vào hốc rồi mới chạy.',
      veMaMau: 'Chương trình có sẵn: cả hai đi ngay, chạm nhau giữa hành lang. Viết lại.',
      san: ['####.###', '#.F....F', '########'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 5, y: 1, huong: 0 }], co: [[{ x: 7, y: 1 }], [{ x: 2, y: 1 }]],
      maMau: B(['forward(6)'], ['walk("LLL")']),
      loiGiai: B(nhieu(CHO(2), ['forward(6)']), nhieu(['walk("LU")'], CHO(2), ['walk("DLL")'])),
      sao: { o: 22, nhip: 12 },
      loiSai: [
        { moTa: 'Xích chạy ngay: tới ô dưới hốc khi nhện còn đứng đó', baiLam: B(['forward(6)'], nhieu(['walk("LU")'], CHO(2), ['walk("DLL")'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xích chỉ chờ một nhịp: tới ô dưới hốc khi nhện chưa kịp lên', baiLam: B(nhieu(CHO(1), ['forward(6)']), nhieu(['walk("LU")'], CHO(2), ['walk("DLL")'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nhện vào tới hốc ở nhịp 4. Xích tới ô dưới hốc ở nhịp thứ ba nó đi.', 'Xích rời ô dưới hốc rồi nhện mới xuống.']
    }),

    man({
      so: 15, ten: 'Chuyền hộp', hang: 'luyen', tayNhen: true,
      deBai: 'Hộp ở đầu hành lang của xích. Xích tới lấy hộp, rẽ trái, thả hộp xuống ô ngay trước mặt nhện. Nhện chờ hộp, gắp lên, nhảy qua hố sang phải, bước thêm một ô rồi thả vào ô đích. Đếm nhịp của xích để nhện gắp đúng lúc.',
      veMaMau: 'Chương trình có sẵn: xích mới lấy được hộp, nhện gắp ngay khi hộp chưa tới. Viết tiếp.',
      san: ['#######', '#o...##', '##.##D#', '##.u..#', '#######'],
      bd: [{ x: 4, y: 1, huong: 3 }, { x: 2, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pick()'], ['pick()', 'jump("R")', 'go("R")', 'drop()']),
      loiGiai: B(['go_wall()', 'pick()', 'tr_left()', 'drop()'], nhieu(CHO(6), ['pick()', 'jump("R")', 'go("R")', 'drop()'])),
      sao: { o: 40, nhip: 14 },
      loiSai: [
        { moTa: 'Nhện gắp ngay: hộp chưa tới', baiLam: B(['go_wall()', 'pick()', 'tr_left()', 'drop()'], ['pick()', 'jump("R")', 'go("R")', 'drop()']), phaiCoMa: ['kep-hut'] },
        { moTa: 'Nhện chờ 4 nhịp: gắp hụt', baiLam: B(['go_wall()', 'pick()', 'tr_left()', 'drop()'], nhieu(CHO(4), ['pick()', 'jump("R")', 'go("R")', 'drop()'])), phaiCoMa: ['kep-hut'] },
        { moTa: 'Xích rẽ phải: thả hộp vào tường', baiLam: B(['go_wall()', 'pick()', 'tr_right()', 'drop()'], nhieu(CHO(6), ['pick()', 'jump("R")', 'go("R")', 'drop()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xích: tới hộp 2 nhịp, nhặt 1, rẽ 2, hộp nằm xuống ở nhịp 6.', 'Nhện gắp ở nhịp đầu của pick(): chờ 6 nhịp thì hộp đã nằm sẵn.']
    }),

    man({
      so: 16, ten: 'Mốc đi đường xa', hang: 'bien-the',
      deBai: 'Xích lấy hộp ở đầu hành lang rồi chở sang ô đích. Hành lang thông tới tận ô sau ô đích, nên xích cần một cái mốc: nhện chui gầm, nhảy hố, đi vòng lên đứng ở ô ngay sau ô đích. Đường nhện xa: xích chờ nhện tới rồi mới chở hộp sang.',
      veMaMau: 'Chương trình có sẵn: xích chở hộp sang ngay, nhện chưa tới, hộp nằm lệch. Thêm vòng chờ cho xích và viết đường của nhện.',
      san: ['##########', '#o.....D.#', '########.#', '#.n.u....#', '##########'],
      bd: [{ x: 5, y: 1, huong: 3 }, { x: 1, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['crawl("R")']),
      loiGiai: B(nhieu(['go_wall()', 'pick()', 'spin()'], CHO(12), ['go_wall()', 'back()', 'drop()']), ['crawl("R")', 'jump("R")', 'walk("RRR")', 'walk("UU")']),
      sao: { o: 54, nhip: 28 },
      loiSai: [
        { moTa: 'Xích không chờ: chạy tới tường, hộp nằm quá ô đích', baiLam: B(['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['crawl("R")', 'jump("R")', 'walk("RRR")', 'walk("UU")']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện đi đứng qua gầm: đụng gầm, không tới mốc', baiLam: B(nhieu(['go_wall()', 'pick()', 'spin()'], CHO(12), ['go_wall()', 'back()', 'drop()']), ['walk("RR")', 'jump("R")', 'walk("RRR")', 'walk("UU")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nhện tới ô mốc ở khoảng nhịp 20. Xích lấy hộp và quay đầu xong ở nhịp 8.', 'Xích đi go_wall() khi mốc đã đứng sẵn: nó dừng ngay trước nhện, lùi một ô, thả hộp vào ô đích.']
    }),

    man({
      so: 17, ten: 'Hai hộp, một mốc', hang: 'bien-the',
      deBai: 'Hai hộp ở đầu dãy, hai ô đích ở cuối dãy. Nhện nhảy qua hố, leo lên đứng làm mốc sau hai ô đích. Xích làm hai chuyến giống nhau: tới hộp, nhặt, quay đầu, chạy tới khi gặp vật cản, lùi một ô, thả, quay đầu. Dùng vòng lặp.',
      veMaMau: 'Chương trình có sẵn: xích mới làm một chuyến. Viết bằng vòng lặp cho cả hai chuyến.',
      san: ['############', '#oo.....DD.#', '##########.#', '########.u.#', '############'],
      bd: [{ x: 6, y: 1, huong: 3 }, { x: 8, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()'], ['jump("R")', 'walk("UU")']),
      loiGiai: B(LAP(2, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()']), ['jump("R")', 'walk("UU")']),
      sao: { o: 47, nhip: 42 },
      loiSai: [
        { moTa: 'Thả mà không lùi: hộp rơi đè lên ô của mốc', baiLam: B(LAP(2, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'drop()', 'spin()']), ['jump("R")', 'walk("UU")']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện không lên làm mốc: hộp đầu nằm quá ô đích', baiLam: B(LAP(2, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()']), ['jump("R")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Chuyến thứ hai xích dừng trước hộp vừa thả: go_wall() tự tìm chỗ dừng.', 'Bảy lệnh của một chuyến đặt vào for i in range(2):.']
    }),

    man({
      so: 18, ten: 'Đội chuyền và làm mốc', hang: 'trum', tayNhen: true, khung: { chinh: 16, moiHam: 10 },
      deBai: 'Hai hộp, hai ô đích. Hộp thứ nhất: xích thả xuống ô trước mặt nhện, nhện gắp, nhảy qua hố, thả vào ô đích dưới. Rồi nhện đi tiếp, leo lên làm mốc ở cuối hành lang. Hộp thứ hai: xích chờ mốc đứng sẵn rồi chở sang ô đích trên.',
      veMaMau: 'Chương trình có sẵn: xích chuyền xong hộp thứ nhất, nhện mới gắp và nhảy. Viết tiếp cả hai.',
      san: ['###########', '#oo.....D.#', '###.#D###.#', '###.u.....#', '###########'],
      bd: [{ x: 4, y: 1, huong: 3 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pick()', 'tr_left()', 'drop()'], nhieu(CHO(5), ['pick()', 'jump("R")'])),
      loiGiai: B(nhieu(['go_wall()', 'pick()', 'tr_left()', 'drop()', 'tr_right()', 'go_wall()', 'pick()', 'spin()'], CHO(6), ['go_wall()', 'back()', 'drop()']),
        nhieu(CHO(5), ['pick()', 'jump("R")', 'drop()', 'walk("RRRR")', 'walk("UU")'])),
      sao: { o: 60, nhip: 30 },
      loiSai: [
        { moTa: 'Xích không chờ mốc: hộp thứ hai nằm quá ô đích', baiLam: B(['go_wall()', 'pick()', 'tr_left()', 'drop()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'],
          nhieu(CHO(5), ['pick()', 'jump("R")', 'drop()', 'walk("RRRR")', 'walk("UU")'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện gắp ngay: hộp thứ nhất chưa tới', baiLam: B(nhieu(['go_wall()', 'pick()', 'tr_left()', 'drop()', 'tr_right()', 'go_wall()', 'pick()', 'spin()'], CHO(6), ['go_wall()', 'back()', 'drop()']),
          ['pick()', 'jump("R")', 'drop()', 'walk("RRRR")', 'walk("UU")']), phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['Nhện: chờ hộp, gắp, nhảy, thả, rồi mới đi làm mốc.', 'Xích lấy xong hộp thứ hai thì chờ: nhện tới mốc muộn hơn nhiều.']
    })
  ];

  /* ================================================= chương che-doi-xich "Đội xích và nhện phối hợp" =================================================
     Hàm của em: wait_n(n) chờ n nhịp (thay pause của mùa 2), pass_box() xích nhặt, rẽ trái, thả cho nhện; hop_drop(d) nhện gắp, nhảy về phía d, thả.
     Mã che-doi-xich.1 … .10 đã dùng ở mùa 4: màn mới khai so từ 11. */
  function che(m) { m.chuong = 'che-doi-xich'; return man(m); }
  var T_IDLE = LAP('n', 'wait()'), T_PASS = ['pick()', 'tr_left()', 'drop()'], T_HOP = ['pick()', 'jump(d)', 'drop()'];
  function hIdle(than) { return H('wait_n', ['n'], than || T_IDLE); }
  function hPass(than) { return H('pass_box', [], than || T_PASS); }
  function hHop(than) { return H('hop_drop', ['d'], than || T_HOP); }
  var SAN_NGA_TU = ['###.###', '###.###', '##....F', '###.###', '###.###', '#F...##', '#######'];

  DS.push(
    che({
      so: 11, ten: 'Hàm chờ của màn', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoa: [0, 1], khoaHamMan: ['rest'], mucTieu: 'toi-co',
      deBai: 'Màn Xích qua trước, viết gọn hơn: hàm rest(n) của màn chờ n nhịp. Nhện gọi rest(2) thay cho vòng lặp chờ. Bấm Chạy.',
      veMaMau: 'Hai chương trình và hàm của màn đã viết sẵn, khoá. Mở Xưởng xem rest, rồi bấm Chạy.',
      san: SAN_NGA_TU,
      bd: [{ x: 3, y: 0, huong: 2 }, { x: 2, y: 2, huong: 1 }], co: [[{ x: 1, y: 5 }], [{ x: 6, y: 2 }]],
      maMau: B(['go_wall()', 'tr_right()', 'go_wall()'], ['rest(2)', 'walk("RRRR")'], { hamCuaMan: [H('rest', ['n'], T_IDLE)] }),
      loiGiai: B(['go_wall()', 'tr_right()', 'go_wall()'], ['rest(2)', 'walk("RRRR")'], { hamCuaMan: [H('rest', ['n'], T_IDLE)] }),
      sao: { o: 25, nhip: 10 },
      goiY: ['n là số nhịp chờ.', 'Màn sau em tự tạo hàm wait_n giống vậy.']
    }),

    che({
      so: 12, ten: 'Hàm wait_n(n)', hang: 'lam-quen', taoHam: ['wait_n'], mucTieu: 'toi-co', hamCuaEmCan: ['forward', 'walk'],
      deBai: 'Tạo hàm wait_n(n): for i in range(n): wait(). Xích chạy thẳng xuống năm ô. Nhện đi ngang, cắt đường xích ở ô thứ ba: cho nhện wait_n(2) rồi mới đi.',
      veMaMau: 'Chương trình có sẵn gọi wait_n(2) nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: ['###.###', '###.###', '###.###', '###.###', '#.....F', '###F###', '#######'],
      bd: [{ x: 3, y: 0, huong: 2 }, { x: 1, y: 4, huong: 1 }], co: [[{ x: 3, y: 5 }], [{ x: 6, y: 4 }]],
      maMau: B(['forward(5)'], ['wait_n(2)', 'walk("RRRRR")']),
      loiGiai: B(['forward(5)'], ['wait_n(2)', 'walk("RRRRR")'], { hamCuaEmMoi: [hIdle()] }),
      sao: { o: 20, nhip: 12 },
      loiSai: [
        { moTa: 'Chưa tạo hàm wait_n mà đã gọi nó', baiLam: B(['forward(5)'], ['wait_n(2)', 'walk("RRRRR")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Nhện không chờ: tới ngã tư đúng lúc xích đi qua', baiLam: B(['forward(5)'], ['walk("RRRRR")']), hamCuaEmMoi: [hIdle()], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thân hàm hai dòng: for i in range(n): rồi wait().', 'Gọi wait_n(2) thì chờ đúng hai nhịp.']
    }),

    che({
      so: 13, ten: 'Hốc bằng hàm', hang: 'luyen', mucTieu: 'toi-co', hamCuaEmCan: ['wait_n', 'forward', 'walk'],
      deBai: 'Hai robot đi ngược chiều trên một hành lang có hốc phía trên. Nhện bước phải một ô, lên hốc, wait_n chờ xích qua, rồi xuống đi tiếp. Xích wait_n chờ nhện vào hốc rồi mới chạy.',
      veMaMau: 'Chương trình có sẵn: cả hai đi ngay. Thêm wait_n cho cả hai.',
      san: ['###.####', 'F.....F.', '########'],
      bd: [{ x: 7, y: 1, huong: 3 }, { x: 2, y: 1, huong: 0 }], co: [[{ x: 0, y: 1 }], [{ x: 6, y: 1 }]],
      maMau: B(['forward(7)'], ['walk("RU")', 'walk("DRRR")']),
      loiGiai: B(['wait_n(3)', 'forward(7)'], ['walk("RU")', 'wait_n(2)', 'walk("DRRR")']),
      sao: { o: 22, nhip: 14 },
      loiSai: [
        { moTa: 'Xích không chờ: tới ô dưới hốc khi nhện còn ở đó', baiLam: B(['forward(7)'], ['walk("RU")', 'wait_n(2)', 'walk("DRRR")']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhện không chờ trong hốc: xuống đụng xích', baiLam: B(['wait_n(3)', 'forward(7)'], ['walk("RU")', 'walk("DRRR")']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nhện vào hốc ở nhịp 4.', 'Xích chờ 3 nhịp thì qua ô dưới hốc ở nhịp 6: nhện xuống sau đó.']
    }),

    che({
      so: 14, ten: 'Hàm pass_box()', hang: 'luyen', taoHam: ['pass_box'], tayNhen: true, hamCuaEmCan: ['pick', 'tr_left', 'drop', 'wait_n', 'jump'],
      deBai: 'Tạo hàm pass_box() cho xích: nhặt hộp trước mặt, rẽ trái, thả xuống. Xích đứng sẵn trước hộp, gọi pass_box(): hộp nằm ngay trước mặt nhện. Nhện wait_n chờ hộp, gắp, nhảy qua hố, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn gọi pass_box() nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: ['######', '#o..##', '##.#D#', '##.u.#', '######'],
      bd: [{ x: 2, y: 1, huong: 3 }, { x: 2, y: 3, huong: 0 }],
      maMau: B(['pass_box()'], ['wait_n(4)', 'pick()', 'jump("R")', 'drop()']),
      loiGiai: B(['pass_box()'], ['wait_n(4)', 'pick()', 'jump("R")', 'drop()'], { hamCuaEmMoi: [hPass()] }),
      sao: { o: 35, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa tạo hàm pass_box mà đã gọi nó', baiLam: B(['pass_box()'], ['wait_n(4)', 'pick()', 'jump("R")', 'drop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm rẽ phải: hộp thả vào tường', baiLam: B(['pass_box()'], ['wait_n(4)', 'pick()', 'jump("R")', 'drop()']), hamCuaEmMoi: [hPass(['pick()', 'tr_right()', 'drop()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm ba dòng: pick(), tr_left(), drop().', 'Đếm nhịp của pass_box(): nhặt, rẽ hai nhịp, thả. Nhện wait_n cho tới lúc hộp nằm xuống.']
    }),

    che({
      so: 15, ten: 'Hàm hop_drop(d)', hang: 'luyen', taoHam: ['hop_drop'], tayNhen: true, hamCuaEmCan: ['go_wall', 'pass_box', 'wait_n', 'pick', 'jump', 'drop'],
      deBai: 'Tạo hàm hop_drop(d) cho nhện: gắp hộp trước mặt, nhảy về phía d, thả. Lần này ô đích ở bên TRÁI hố: xích pass_box(), nhện wait_n chờ rồi hop_drop("L").',
      veMaMau: 'Chương trình có sẵn gọi hop_drop("L") nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: ['##########', '##o......#', '#D#.######', '#.u.######', '##########'],
      bd: [{ x: 8, y: 1, huong: 3 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pass_box()'], ['wait_n(9)', 'hop_drop("L")']),
      loiGiai: B(['go_wall()', 'pass_box()'], ['wait_n(9)', 'hop_drop("L")'], { hamCuaEmMoi: [hHop()] }),
      sao: { o: 42, nhip: 15 },
      loiSai: [
        { moTa: 'Chưa tạo hàm hop_drop mà đã gọi nó', baiLam: B(['go_wall()', 'pass_box()'], ['wait_n(9)', 'hop_drop("L")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm nhảy cứng sang phải: không dùng d', baiLam: B(['go_wall()', 'pass_box()'], ['wait_n(9)', 'hop_drop("L")']), hamCuaEmMoi: [hHop(['pick()', 'jump("R")', 'drop()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm: pick(), jump(d), drop(). Viết d, không viết "L".', 'Xích đi năm ô rồi mới tới hộp: đếm nhịp tới lúc hộp nằm xuống.']
    }),

    che({
      so: 16, ten: 'Hai hộp, hai phía', hang: 'bien-the', tayNhen: true, hamCuaEmCan: ['pass_box', 'spin', 'pick', 'drop', 'wait_n', 'hop_drop', 'jump'],
      deBai: 'Xích đứng sẵn trước hộp thứ nhất; hộp thứ hai nằm trong hốc phía sau lưng xích. Xích pass_box() hộp thứ nhất, quay đầu nhặt hộp thứ hai, quay đầu thả xuống cùng chỗ. Nhện mang hộp thứ nhất sang ô đích phải, nhảy về, chờ, mang hộp thứ hai sang ô đích trái.',
      veMaMau: 'Chương trình có sẵn: hai robot mới làm xong hộp thứ nhất. Viết tiếp.',
      san: ['###o###', '##o.###', '#D#.#D#', '#.u.u.#', '#######'],
      bd: [{ x: 3, y: 1, huong: 3 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['pass_box()'], ['wait_n(4)', 'hop_drop("R")']),
      loiGiai: B(['pass_box()', 'spin()', 'pick()', 'spin()', 'drop()'], ['wait_n(4)', 'hop_drop("R")', 'jump("L")', 'wait_n(2)', 'hop_drop("L")']),
      sao: { o: 48, nhip: 22 },
      loiSai: [
        { moTa: 'Nhện mang cả hai hộp sang phải: ô đích phải đã có hộp', baiLam: B(['pass_box()', 'spin()', 'pick()', 'spin()', 'drop()'], ['wait_n(4)', 'hop_drop("R")', 'jump("L")', 'wait_n(2)', 'hop_drop("R")']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện không chờ hộp thứ hai: gắp hụt', baiLam: B(['pass_box()', 'spin()', 'pick()', 'spin()', 'drop()'], ['wait_n(4)', 'hop_drop("R")', 'jump("L")', 'hop_drop("L")']), phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['Xích thả hộp thứ hai ở nhịp 14.', 'hop_drop với "R" rồi với "L": một hàm, hai chỗ.']
    }),

    che({
      so: 17, ten: 'Sửa go_mark()', hang: 'bien-the', hamCuaEmCan: ['go_wall', 'pick', 'spin', 'wait_n', 'back', 'drop', 'crawl', 'jump', 'walk'],
      deBai: 'Màn Mốc đi đường xa, nay đường của nhện gói trong hàm go_mark() của màn. Hàm viết sai nên nhện rơi xuống hố. Sửa hàm, rồi cho xích wait_n chờ mốc trước khi chở hộp sang.',
      veMaMau: 'Chạy thử: nhện bước thẳng vào hố. Mở Xưởng sửa go_mark, và thêm wait_n cho xích.',
      san: ['##########', '#o.....D.#', '########.#', '#.n.u....#', '##########'],
      bd: [{ x: 5, y: 1, huong: 3 }, { x: 1, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['go_mark()'], { hamCuaMan: [H('go_mark', [], ['crawl("R")', 'go("R")', 'walk("RRR")', 'walk("UU")'])] }),
      loiGiai: B(['go_wall()', 'pick()', 'spin()', 'wait_n(10)', 'go_wall()', 'back()', 'drop()'], ['go_mark()'], { hamCuaMan: [H('go_mark', [], ['crawl("R")', 'jump("R")', 'walk("RRR")', 'walk("UU")'])] }),
      sao: { o: 56, nhip: 26 },
      loiSai: [
        { moTa: 'Sửa hàm mà xích không chờ: hộp nằm quá ô đích', baiLam: B(['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['go_mark()'], { hamCuaMan: [H('go_mark', [], ['crawl("R")', 'jump("R")', 'walk("RRR")', 'walk("UU")'])] }), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Giữ hàm sai: nhện rơi hố', baiLam: B(['go_wall()', 'pick()', 'spin()', 'wait_n(10)', 'go_wall()', 'back()', 'drop()'], ['go_mark()'], { hamCuaMan: [H('go_mark', [], ['crawl("R")', 'go("R")', 'walk("RRR")', 'walk("UU")'])] }), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Qua hố phải nhảy: jump("R"), không phải go("R").', 'Nhện tới mốc khoảng nhịp 20: xích quay đầu xong ở nhịp 8 rồi wait_n(12).']
    }),

    che({
      so: 18, ten: 'Hai hộp chờ mốc', hang: 'bien-the', hamCuaEmCan: ['go_wall', 'pick', 'spin', 'back', 'drop', 'wait_n', 'jump', 'walk'],
      deBai: 'Như màn Hai hộp, một mốc, nhưng nhện ở xa hơn: phải chui gầm rồi mới tới mốc. Xích wait_n chờ ở đầu, rồi lặp hai chuyến như cũ.',
      veMaMau: 'Chương trình có sẵn: xích chạy ngay, mốc chưa tới. Thêm wait_n cho xích và viết đường nhện.',
      san: ['############', '#oo.....DD.#', '##########.#', '####..n.u..#', '############'],
      bd: [{ x: 6, y: 1, huong: 3 }, { x: 4, y: 3, huong: 0 }],
      maMau: B(LAP(2, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()']), ['crawl("R")']),
      loiGiai: B(nhieu(['wait_n(2)'], LAP(2, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()'])), ['go("R")', 'crawl("R")', 'jump("R")', 'go("R")', 'walk("UU")']),
      sao: { o: 58, nhip: 44 },
      loiSai: [
        { moTa: 'Xích không chờ: chuyến đầu chạy quá ô đích', baiLam: B(LAP(2, ['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()', 'spin()']), ['go("R")', 'crawl("R")', 'jump("R")', 'go("R")', 'walk("UU")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nhện tới mốc muộn hơn màn trước: đếm nhịp đường nhện.', 'wait_n ở đầu chương trình xích, trước vòng lặp.']
    }),

    che({
      so: 19, ten: 'Chuyền rồi làm mốc', hang: 'bien-the', tayNhen: true, hamCuaEmCan: ['go_wall', 'pass_box', 'tr_right', 'pick', 'spin', 'wait_n', 'back', 'drop', 'hop_drop', 'walk'],
      deBai: 'Màn Đội chuyền và làm mốc, viết bằng hàm: xích pass_box() hộp thứ nhất, nhện hop_drop("R") rồi đi làm mốc. Xích lấy hộp thứ hai, wait_n chờ mốc, rồi chở sang.',
      veMaMau: 'Chương trình có sẵn mới làm xong hộp thứ nhất. Viết tiếp.',
      san: ['###########', '#oo.....D.#', '###.#D###.#', '###.u.....#', '###########'],
      bd: [{ x: 4, y: 1, huong: 3 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pass_box()'], ['wait_n(5)', 'hop_drop("R")']),
      loiGiai: B(['go_wall()', 'pass_box()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'wait_n(6)', 'go_wall()', 'back()', 'drop()'], ['wait_n(5)', 'hop_drop("R")', 'walk("RRRR")', 'walk("UU")']),
      sao: { o: 62, nhip: 30 },
      loiSai: [
        { moTa: 'Xích không chờ mốc: hộp thứ hai nằm quá ô đích', baiLam: B(['go_wall()', 'pass_box()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['wait_n(5)', 'hop_drop("R")', 'walk("RRRR")', 'walk("UU")']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện quên đi làm mốc', baiLam: B(['go_wall()', 'pass_box()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'wait_n(6)', 'go_wall()', 'back()', 'drop()'], ['wait_n(5)', 'hop_drop("R")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mỗi hàm thay một đoạn ba bốn lệnh: chương trình ngắn lại.', 'Xích thả hộp thứ nhất xong thì rẽ phải để quay về phía hộp thứ hai.']
    }),

    che({
      so: 20, ten: 'Ba hộp, ba chỗ', hang: 'trum', tayNhen: true, khung: { chinh: 16, moiHam: 10 },
      hamCuaEmCan: ['go_wall', 'pass_box', 'spin', 'pick', 'drop', 'tr_right', 'wait_n', 'back', 'hop_drop', 'jump', 'leap', 'walk'],
      deBai: 'Ba hộp, ba ô đích. Xích chuyền hộp trước mặt cho nhện, quay đầu nhặt hộp trong hốc, quay đầu chuyền tiếp. Nhện mang hộp thứ nhất sang phải, nhảy về, mang hộp thứ hai sang trái, rồi nhảy qua hai hố đi làm mốc. Xích lấy hộp cuối ở đầu dãy, chờ mốc rồi chở sang.',
      veMaMau: 'Chương trình có sẵn mới chuyền xong hộp thứ nhất. Viết tiếp cả hai.',
      san: ['###o#######', '#oo.....D.#', '#D#.#D###.#', '#.u.u.....#', '###########'],
      bd: [{ x: 4, y: 1, huong: 3 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pass_box()'], ['wait_n(6)', 'hop_drop("R")']),
      loiGiai: B(['go_wall()', 'pass_box()', 'spin()', 'pick()', 'spin()', 'drop()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'wait_n(10)', 'go_wall()', 'back()', 'drop()'],
        ['wait_n(6)', 'hop_drop("R")', 'jump("L")', 'wait_n(2)', 'hop_drop("L")', 'leap("RR")', 'walk("RRRR")', 'walk("UU")']),
      sao: { o: 72, nhip: 46 },
      loiSai: [
        { moTa: 'Xích không chờ mốc: hộp cuối nằm quá ô đích', baiLam: B(['go_wall()', 'pass_box()', 'spin()', 'pick()', 'spin()', 'drop()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'],
          ['wait_n(6)', 'hop_drop("R")', 'jump("L")', 'wait_n(2)', 'hop_drop("L")', 'leap("RR")', 'walk("RRRR")', 'walk("UU")']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện mang hộp thứ hai sang phải: ô đích phải đã có hộp', baiLam: B(['go_wall()', 'pass_box()', 'spin()', 'pick()', 'spin()', 'drop()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'wait_n(10)', 'go_wall()', 'back()', 'drop()'],
          ['wait_n(6)', 'hop_drop("R")', 'jump("L")', 'wait_n(2)', 'hop_drop("R")', 'walk("RRRR")', 'walk("UU")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hai lần chuyền giống màn Hai hộp, hai phía; phần cuối giống màn Chuyền rồi làm mốc.', 'Đếm nhịp nhện tới mốc rồi mới chọn wait_n cho xích.']
    })
  );

  ManHoc.manDoiXichNhen = DS;
  if (laNode) module.exports = ManHoc;
})();
