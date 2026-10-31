/* ============================================================================
   man-doi-omni-moi.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 6, gói 9 "R2 ở mỏ đá" (PDM6c).
   Hai chương doi-omni (so 11..20) và che-doi-omni (so 11..20), 20 màn phối hợp hai robot:
     - R1 (vàng, của Sola): Máy mỏ đá đầy đủ mùa 6 (thân omni + tay hất đá nem + radar tròn có nhận dạng đá/quặng + đi chéo + chỉnh lực hất + đá lấp hố).
     - R2 (lam, của Luna): Drone nông nghiệp đầy đủ mùa 5 (thân drone + bộ gieo hạt son + camera bốn hướng có nhìn dưới chân + đáp sạc land/take_off/battery).
   Mỗi robot làm việc robot kia không làm được:
     - R1 đi dưới đất trượt ngang, đi chéo, lấp hố u, nhận dạng đá tròn/quặng và hất đá qua rào sắt/hố lên nút đè M (mở cổng C cho R2) hoặc hất mẫu đá màu tới ô camera của R2.
     - R2 bay qua vách ngăn, đáp sạc trên trạm P, đọc màu mẫu đá bằng camera (color), gieo hạt nở hoa đúng hình mục tiêu (to-hinh).
   Hàm của em chương 2: open_dock(n) cho R1 lấp hố rồi hất đá lên nút M; mine_sow(c, n) cho R2 chờ mở lối qua hố rồi bay qua cổng gieo luống; pad_kind() cho R1 tiến lên lọc đá tròn/quặng hất lên nút M.
   Màn cũ doi-omni.1..10 và che-doi-omni.1..10 chuyển sang gói chứa ẩn doi-omni-cu ở mùa 7 (lo-trinh-hoc.js).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY_MO_CU = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape'];
  var ROBOT_MO_CU = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }] };
  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var SON = ['ink', 'dot', 'pen_down', 'pen_up'];
  var DAP = ['land', 'take_off', 'battery'];
  var CAM_DUOI = { ma: 'camera-4', o: 'tren', taiCho: true };

  function R1_OMNI() {
    return {
      loaiRobot: 'omni',
      robot: JSON.parse(JSON.stringify(ROBOT_MO_CU)),
      omniCheo: true,
      chinhLuc: true,
      nhanDang: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: KHAY_MO_CU.slice()
    };
  }
  function R2_DRONE(pin) {
    var coPin = pin !== undefined;
    var d = {
      loaiRobot: 'drone',
      robot: { than: 'drone', tay: 'son', camBien: [CAM_DUOI], son: 'lam' },
      hamGoc: BAY.concat(SON, ['color'], coPin ? DAP : ['land', 'take_off'])
    };
    if (coPin) d.pin = pin;
    return d;
  }
  function B(c1, c2, them) {
    return Object.assign({ doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }, them || {});
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  var T_OPEN_DOCK = ['fill_pit()', 'aim_lob(n)'];
  var T_MINE_SOW = ['wait_n(6)', 'fly_right(2)', 'span_sow(c, n)'];
  var T_PAD_KIND = ['move()', 'sort_lob()'];
  function hOpenDock(than) { return H('open_dock', ['n'], than || T_OPEN_DOCK); }
  function hMineSow(than) { return H('mine_sow', ['c', 'n'], than || T_MINE_SOW); }
  function hPadKind(than) { return H('pad_kind', [], than || T_PAD_KIND); }

  /** m.bd: [batDau R1 omni, batDau R2 drone]; m.pin: pin của R2 drone; m.khoa: chỉ số robot khoá. */
  function man(m) {
    var bd = m.bd, pin = m.pin, r1 = R1_OMNI(), r2 = R2_DRONE(pin), khoa = m.khoa;
    delete m.bd; delete m.pin; delete m.khoa;
    m.chuong = m.chuong || 'doi-omni';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.vaHoac = true;
    m.mucTieu = 'to-hinh';
    m.daLapHo = true;
    m.tamNemMacDinh = 2;
    m.omniCheo = true;
    m.chinhLuc = true;
    m.nhanDang = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.bienDem = true;
    m.nhipTheoLoiGiai = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.doi = [Object.assign({ batDau: bd[0] }, r1), Object.assign({ batDau: bd[1] }, r2)];
    if (khoa !== undefined) [].concat(khoa).forEach(function (k) { m.doi[k].coDinh = true; });
    m.batDau = bd[0];
    m.loaiRobot = r1.loaiRobot;
    m.robot = JSON.parse(JSON.stringify(r1.robot));
    m.hamGoc = r1.hamGoc.slice();
    m.taoHam = m.taoHam || [];
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    return ManHoc.chuanHoa(m);
  }
  function che(m) { m.chuong = 'che-doi-omni'; return man(m); }

  var DS = [
    /* ================================================= chương doi-omni "Drone dò vách đá" ================================================= */
    man({
      so: 11, ten: 'Hất đá đè nút mở cổng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoa: [0, 1],
      hamCuaEmCan: ['lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Drone nông nghiệp R2 của Luna bay tới mỏ đá hỗ trợ máy mỏ đá R1 của Sola gieo thảm cỏ giữ đất trên vách đá. Drone đang bay không đè được nút M dưới đất, nên R1 dùng tay hất đá lob() ném hòn đá trước mặt lên nút M mở cổng C cho R2 bay qua gieo ba cụm hoa đỏ. Bấm Chạy để xem hai robot phối hợp.',
      veMaMau: 'Hai chương trình đã viết sẵn và khoá. Bấm mũi tên ở cột chương trình để xem từng robot, rồi bấm Chạy.',
      san: ['########', '#.C....#', '########', '#.oM...#', '########'],
      hinh: ['........', '...rrr..', '........', '........', '........'],
      noi: [{ nut: { x: 3, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B(['lob()'], ['wait_n(2)', 'fly_right(2)', 'span_sow("red", 2)']),
      loiGiai: B(['lob()'], ['wait_n(2)', 'fly_right(2)', 'span_sow("red", 2)']),
      sao: { o: 17, nhip: 6 },
      goiY: ['lob() của R1 nạp hòn đá ở (2,3) rồi hất 2 ô lên nút M(3,3) ở cuối nhịp 2.', 'Cổng C(2,1) mở ra, R2 chờ 2 nhịp rồi bay 2 ô qua cổng gieo luống hoa đỏ.']
    }),

    man({
      so: 12, ten: 'Hất xa qua rào sắt', hang: 'lam-quen', khoa: [1],
      hamCuaEmCan: ['aim_lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Drone R2 đã có chương trình tự động (đã khoá): chờ 2 nhịp rồi bay qua cổng C gieo luống hoa vàng. Ở làn dưới, giữa hòn đá và nút M có hàng rào sắt =. Hãy sửa chương trình của R1 thành aim_lob(3) để hất đá xa 3 ô qua rào lên nút M.',
      veMaMau: 'Chạy thử: R1 gọi lob() tầm 2 nên đá vướng hàng rào sắt, cổng C không mở.',
      san: ['########', '#.C....#', '########', '#.o=M..#', '########'],
      hinh: ['........', '...yyy..', '........', '........', '........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B(['lob()'], ['wait_n(2)', 'fly_right(2)', 'span_sow("yellow", 2)']),
      loiGiai: B(['aim_lob(3)'], ['wait_n(2)', 'fly_right(2)', 'span_sow("yellow", 2)']),
      sao: { o: 19, nhip: 6 },
      loiSai: [
        { moTa: 'Để nguyên lob() tầm 2: đá rơi trúng hàng rào sắt, cổng C đóng chặt', baiLam: B(['lob()'], ['wait_n(2)', 'fly_right(2)', 'span_sow("yellow", 2)']), phaiCoMa: ['nem-vo', 'dam-tuong'] },
        { moTa: 'Chỉnh aim_lob(1): đá rơi ngay tại chỗ trước rào sắt', baiLam: B(['aim_lob(1)'], ['wait_n(2)', 'fly_right(2)', 'span_sow("yellow", 2)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Từ R1 ở (1,3) tới nút M(4,3) là 3 ô.', 'Dùng aim_lob(3) để chỉnh lực hất tầm 3 và ném đá lên nút M.']
    }),

    man({
      so: 13, ten: 'Chờ hất đá mở cổng', hang: 'lam-quen', khoa: [0],
      hamCuaEmCan: ['forward', 'lob', 'wait_sow'],
      deBai: 'Lần này máy mỏ đá R1 đã khoá chương trình: tiến 2 ô tới trước hòn đá rồi gọi lob() hất đá lên nút M ở cuối nhịp 4. Drone R2 đang đứng sát trước cổng C. Hãy dùng wait_sow("blue", 2) cho R2 chờ đủ 4 nhịp rồi bay qua cổng gieo luống hoa xanh dương.',
      veMaMau: 'Chạy thử: R2 bay ngay từ nhịp đầu khi R1 chưa kịp tới hất đá nên đâm vào cổng C.',
      san: ['#########', '#.C.....#', '#########', '#...oM..#', '#########'],
      hinh: ['.........', '...bbb...', '.........', '.........', '.........'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B(['forward(2)', 'lob()'], ['fly_right(2)', 'span_sow("blue", 2)']),
      loiGiai: B(['forward(2)', 'lob()'], ['wait_sow("blue", 2)']),
      sao: { o: 24, nhip: 8 },
      loiSai: [
        { moTa: 'R2 bay ngay không chờ R1 hất đá mở cổng', baiLam: B(['forward(2)', 'lob()'], ['fly_right(2)', 'span_sow("blue", 2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R2 chỉ chờ 2 nhịp khi R1 mới vừa đi tới trước hòn đá', baiLam: B(['forward(2)', 'lob()'], ['wait_n(2)', 'fly_right(2)', 'span_sow("blue", 2)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['R1 tốn 2 nhịp đi bộ và 2 nhịp lob(), tổng cộng 4 nhịp nút M mới có đá đè.', 'Gọi wait_sow("blue", 2) để R2 chờ 4 nhịp rồi bay 2 ô qua cổng gieo hoa.']
    }),

    man({
      so: 14, ten: 'Lách chéo hất đá mở cổng', hang: 'luyen',
      hamCuaEmCan: ['diag_aim', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Trụ đá chắn trước mặt R1 ở (2,3), còn hòn đá và nút M nằm ở làn dưới (hàng 4) cách nhau hàng rào sắt. Cho R1 gọi diag_aim(3) lách chéo xuống phải tới trước hòn đá rồi hất tầm 3 lên nút M(5,4). R2 chờ 3 nhịp rồi bay 2 ô qua cổng C gieo luống hoa xanh lá.',
      veMaMau: 'Viết chương trình cho cả R1 và R2.',
      san: ['########', '#.C....#', '########', '#.#....#', '#..o=M.#', '########'],
      hinh: ['........', '...ggg..', '........', '........', '........', '........'],
      noi: [{ nut: { x: 5, y: 4 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['diag_aim(3)'], ['wait_n(3)', 'fly_right(2)', 'span_sow("green", 2)']),
      sao: { o: 21, nhip: 7 },
      loiSai: [
        { moTa: 'R1 đi thẳng move() đâm vào trụ đá (2,3)', baiLam: B(['move()', 'aim_lob(3)'], ['wait_n(3)', 'fly_right(2)', 'span_sow("green", 2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R1 dùng diag_aim(2) hất đá trúng hàng rào sắt', baiLam: B(['diag_aim(2)'], ['wait_n(3)', 'fly_right(2)', 'span_sow("green", 2)']), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      goiY: ['diag_aim(3) giúp R1 bước chéo phải xuống (2,4) trong 1 nhịp rồi hất đá tầm 3 lên M(5,4) trong 2 nhịp.', 'R2 gọi wait_n(3), fly_right(2), span_sow("green", 2).']
    }),

    man({
      so: 15, ten: 'Băng chuyền trợ đà hất đá', hang: 'luyen',
      hamCuaEmCan: ['belt_lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Trước mặt R1 là ô băng chuyền > đẩy sang phải tới sát hòn đá ở (4,3). Cho R1 gọi belt_lob(3) để bước lên băng chuyền (được đẩy tới (3,3)) rồi hất đá tầm 3 qua rào sắt lên nút M(6,3). R2 chờ 3 nhịp rồi bay 2 ô qua cổng C gieo 4 bông hoa đỏ.',
      veMaMau: 'Phối hợp belt_lob(3) của R1 với nhịp chờ của R2.',
      san: ['#########', '#.C.....#', '#########', '#.>.o=M.#', '#########'],
      hinh: ['.........', '...rrrr..', '.........', '.........', '.........'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['belt_lob(3)'], ['wait_n(3)', 'fly_right(2)', 'span_sow("red", 3)']),
      sao: { o: 24, nhip: 8 },
      loiSai: [
        { moTa: 'R1 gọi belt_lob(2): đá rơi trúng hàng rào sắt ở (5,3)', baiLam: B(['belt_lob(2)'], ['wait_n(3)', 'fly_right(2)', 'span_sow("red", 3)']), phaiCoMa: ['nem-vo', 'dam-tuong'] },
        { moTa: 'R2 chỉ chờ 1 nhịp khi R1 chưa kịp hất đá lên nút M', baiLam: B(['belt_lob(3)'], ['wait_n(1)', 'fly_right(2)', 'span_sow("red", 3)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['belt_lob(3) tốn 3 nhịp (1 nhịp bước lên băng được đẩy tới (3,3), 2 nhịp hất đá lên M(6,3)).', 'R2 gọi wait_n(3), fly_right(2), span_sow("red", 3).']
    }),

    man({
      so: 16, ten: 'Nhận dạng đá mở cổng', hang: 'luyen',
      hamCuaEmCan: ['sort_lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Hai sân có loại vật khác nhau trước mặt R1: nếu là đá tròn ("round") thì nút M ở cách 2 ô, nếu là quặng ("ore") thì nút M ở cách 3 ô sau hàng rào. Cho R1 gọi sort_lob() để tự nhận dạng và hất đúng tầm lên nút M. R2 chờ 2 nhịp rồi bay 2 ô qua cổng C gieo luống hoa vàng.',
      veMaMau: 'Chương trình phải chạy đúng trên cả 2 sân.',
      san: [
        ['########', '#.C....#', '########', '#.oM...#', '########'],
        ['########', '#.C....#', '########', '#.o=M..#', '########']
      ],
      vatDang: [
        ['........', '........', '........', '..r.....', '........'],
        ['........', '........', '........', '..q.....', '........']
      ],
      hinh: [
        ['........', '...yyy..', '........', '........', '........'],
        ['........', '...yyy..', '........', '........', '........']
      ],
      noi: [
        [{ nut: { x: 3, y: 3 }, cua: [{ x: 2, y: 1 }] }],
        [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }]
      ],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['sort_lob()'], ['wait_n(2)', 'fly_right(2)', 'span_sow("yellow", 2)']),
      sao: { o: 23, nhip: 12 },
      loiSai: [
        { moTa: 'R1 hất cứng lob() tầm 2: hỏng ở sân 2 khi gặp quặng', baiLam: B(['lob()'], ['wait_n(2)', 'fly_right(2)', 'span_sow("yellow", 2)']), phaiCoMa: ['nem-vo', 'dam-tuong'] },
        { moTa: 'R1 hất cứng aim_lob(3) tầm 3: hỏng ở sân 1 khi nút M ở cách 2 ô', baiLam: B(['aim_lob(3)'], ['wait_n(2)', 'fly_right(2)', 'span_sow("yellow", 2)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['sort_lob() kiểm tra shape("front") == "ore" để hất tầm 3 hoặc tầm 2.', 'Cả hai trường hợp của sort_lob() đều mở cổng C ở cuối nhịp 2.']
    }),

    man({
      so: 17, ten: 'Hất mẫu đá màu lên nút', hang: 'bien-the',
      hamCuaEmCan: ['lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Hai sân có viên đá màu khác nhau ở (2,3) trước mặt R1. Khi R1 gọi lob() hất viên đá màu lên nút M(2,2), viên đá vừa đè nút M mở cổng C(3,1) vừa nằm ngay dưới bụng drone R2 đang đứng ở (2,1). Cho R2 chờ 2 nhịp, đọc c = color("down"), rồi bay 2 ô qua cổng gieo luống hoa màu c.',
      veMaMau: 'Một cú hất đá của R1 vừa mở cổng vừa trao mẫu màu cho R2.',
      san: [
        ['########', '#..C...#', '#.M....#', '#.o....#', '#......#', '########'],
        ['########', '#..C...#', '#.M....#', '#.o....#', '#......#', '########']
      ],
      vatMau: [
        ['........', '........', '........', '..r.....', '........', '........'],
        ['........', '........', '........', '..b.....', '........', '........']
      ],
      hinh: [
        ['........', '....rrr.', '........', '........', '........', '........'],
        ['........', '....bbb.', '........', '........', '........', '........']
      ],
      noi: [
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }]
      ],
      bd: [{ x: 2, y: 4, huong: 0 }, { x: 2, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['lob()'], ['wait_n(2)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 2)']),
      sao: { o: 18, nhip: 12 },
      loiSai: [
        { moTa: 'R2 đọc color("down") trước khi R1 kịp hất viên đá màu lên (2,2)', baiLam: B(['lob()'], ['c = color("down")', 'wait_n(2)', 'fly_right(2)', 'span_sow(c, 2)']), phaiCoMa: ['mau-son-sai', 'chua-to-hinh'] },
        { moTa: 'R2 gieo cứng màu đỏ: hỏng ở sân 2 khi viên đá màu xanh dương', baiLam: B(['lob()'], ['wait_n(2)', 'fly_right(2)', 'span_sow("red", 2)']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['R1 đứng ở (2,4) quay mặt lên Bắc (huong 0), gọi lob() sẽ hất viên đá ở (2,3) lên M(2,2).', 'Sau wait_n(2), viên đá đã nằm ở (2,2) ngay dưới R2(2,1) nên R2 đọc c = color("down") rồi bay qua cổng.']
    }),

    man({
      so: 18, ten: 'Mở cổng vào trạm sạc', hang: 'bien-the', pin: 7,
      hamCuaEmCan: ['aim_lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Drone R2 chỉ có 7 pin nên phải vào trạm sạc P(3,1) nằm ngay sau cổng C(2,1) để đáp sạc trước khi gieo 4 bông hoa xanh lá. Cho R1 gọi aim_lob(3) mở cổng C, rồi R2 chờ 2 nhịp, bay 2 ô tới trạm P, gọi land() và take_off() để sạc đầy pin, bay tiếp 1 ô sang phải và gieo luống hoa.',
      veMaMau: 'Nhớ cho R2 đáp sạc trên P(3,1) trước khi gieo luống hoa dài.',
      san: ['#########', '#.CP....#', '#########', '#.o=M...#', '#########'],
      hinh: ['.........', '....gggg.', '.........', '.........', '.........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['aim_lob(3)'], ['wait_n(2)', 'fly_right(2)', 'land()', 'take_off()', 'go_right()', 'span_sow("green", 3)']),
      sao: { o: 22, nhip: 10 },
      loiSai: [
        { moTa: 'R2 bỏ qua trạm sạc P, bay thẳng đi gieo hoa nên hết pin giữa chừng', baiLam: B(['aim_lob(3)'], ['wait_n(2)', 'fly_right(3)', 'span_sow("green", 3)']), phaiCoMa: ['het-pin'] },
        { moTa: 'R1 không mở cổng C nên R2 đâm vào cổng', baiLam: B([], ['wait_n(2)', 'fly_right(2)', 'land()', 'take_off()', 'go_right()', 'span_sow("green", 3)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['R1 gọi aim_lob(3) mở cổng C ở cuối nhịp 2.', 'R2 chờ 2 nhịp, bay 2 ô tới P(3,1), gọi land(), take_off(), rồi go_right() tới (4,1) và span_sow("green", 3).']
    }),

    man({
      so: 19, ten: 'Trượt ngang mở hai cổng mỏ', hang: 'bien-the',
      hamCuaEmCan: ['lob', 'slide_r', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Hành lang trên có hai cổng C(2,1) và C(5,1). Ở dưới, R1 quay mặt lên Bắc trước hai cột đá (cột 2 và cột 5). Cho R1 gọi lob() mở cổng đầu, trượt ngang slide_r(3) sang cột 5 rồi gọi lob() mở cổng thứ hai. R2 chờ 2 nhịp, bay 3 ô qua cổng đầu, chờ 2 nhịp cho cổng hai mở rồi bay 2 ô qua cổng hai gieo 2 bông hoa đỏ.',
      veMaMau: 'R1 dùng slide_r(3) trượt ngang giữa hai cột đá mà không cần quay xe.',
      san: ['#########', '#.C..C..#', '#.M..M..#', '#.o..o..#', '#.......#', '#########'],
      hinh: ['.........', '......rr.', '.........', '.........', '.........', '.........'],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 5, y: 2 }, cua: [{ x: 5, y: 1 }] }],
      bd: [{ x: 2, y: 4, huong: 0 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['lob()', 'slide_r(3)', 'lob()'], ['wait_n(2)', 'fly_right(3)', 'wait_n(2)', 'fly_right(2)', 'span_sow("red", 1)']),
      sao: { o: 24, nhip: 10 },
      loiSai: [
        { moTa: 'R2 không chờ cổng thứ hai mở mà bay thẳng qua (5,1)', baiLam: B(['lob()', 'slide_r(3)', 'lob()'], ['wait_n(2)', 'fly_right(5)', 'span_sow("red", 1)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R1 chỉ trượt slide_r(2) nên lệch cột đá thứ hai', baiLam: B(['lob()', 'slide_r(2)', 'lob()'], ['wait_n(2)', 'fly_right(3)', 'wait_n(2)', 'fly_right(2)', 'span_sow("red", 1)']), phaiCoMa: ['nap-hut', 'dam-tuong'] }
      ],
      goiY: ['R1: lob() (2 nhịp), slide_r(3) (3 nhịp), lob() (2 nhịp) -> cổng hai mở ở cuối nhịp 7.', 'R2: wait_n(2), fly_right(3) tới (4,1) ở nhịp 5, wait_n(2) tới nhịp 7, rồi fly_right(2) và span_sow("red", 1).']
    }),

    man({
      so: 20, ten: 'Trùm: Đội dò vách đá', hang: 'trum',
      hamCuaEmCan: ['sort_lob', 'slide_r', 'aim_lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Ba sân trùm thử thách toàn diện đội mỏ đá. Ở cột 2, R1 dùng sort_lob() nhận dạng đá tròn/quặng để hất đúng lên nút M mở cổng đầu C(2,1). Sau đó R1 trượt ngang slide_r(3) sang cột 5, tiến 1 ô lên (5,4) rồi gọi aim_lob(2) hất viên đá màu ở (5,3) lên nút M(5,2) mở cổng hai C(5,1). R2 chờ 2 nhịp, bay 3 ô qua cổng đầu, chờ 3 nhịp cho cổng hai mở, bay 1 ô vào (5,1) đọc c = color("down"), rồi bay 1 ô sang (6,1) gieo 2 bông hoa màu c.',
      veMaMau: 'Kết hợp sort_lob(), slide_r(3), aim_lob(2) của R1 với camera đọc màu của R2.',
      san: [
        ['#########', '#.C..C..#', '#....M..#', '#.M..o..#', '#.o.....#', '#.......#', '#########'],
        ['#########', '#.C..C..#', '#.M..M..#', '#....o..#', '#.o.....#', '#.......#', '#########'],
        ['#########', '#.C..C..#', '#....M..#', '#.M..o..#', '#.o.....#', '#.......#', '#########']
      ],
      vatDang: [
        ['.........', '.........', '.........', '.........', '..r......', '.........', '.........'],
        ['.........', '.........', '.........', '.........', '..q......', '.........', '.........'],
        ['.........', '.........', '.........', '.........', '..r......', '.........', '.........']
      ],
      vatMau: [
        ['.........', '.........', '.........', '.....r...', '.........', '.........', '.........'],
        ['.........', '.........', '.........', '.....y...', '.........', '.........', '.........'],
        ['.........', '.........', '.........', '.....b...', '.........', '.........', '.........']
      ],
      hinh: [
        ['.........', '......rr.', '.........', '.........', '.........', '.........', '.........'],
        ['.........', '......yy.', '.........', '.........', '.........', '.........', '.........'],
        ['.........', '......bb.', '.........', '.........', '.........', '.........', '.........']
      ],
      noi: [
        [{ nut: { x: 2, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 5, y: 2 }, cua: [{ x: 5, y: 1 }] }],
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 5, y: 2 }, cua: [{ x: 5, y: 1 }] }],
        [{ nut: { x: 2, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 5, y: 2 }, cua: [{ x: 5, y: 1 }] }]
      ],
      bd: [{ x: 2, y: 5, huong: 0 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['sort_lob()', 'slide_r(3)', 'move()', 'aim_lob(2)'], ['wait_n(2)', 'fly_right(3)', 'wait_n(3)', 'go_right()', 'c = color("down")', 'go_right()', 'span_sow(c, 1)']),
      sao: { o: 36, nhip: 33 },
      loiSai: [
        { moTa: 'R1 gọi lob() ở cột 5 mà không gọi aim_lob(2): ở sân 2 tầm ném còn giữ 3 nên ném vọt qua M(5,2)', baiLam: B(['sort_lob()', 'slide_r(3)', 'move()', 'lob()'], ['wait_n(2)', 'fly_right(3)', 'wait_n(3)', 'go_right()', 'c = color("down")', 'go_right()', 'span_sow(c, 1)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R2 gieo cứng màu đỏ: hỏng ở sân 2 và sân 3', baiLam: B(['sort_lob()', 'slide_r(3)', 'move()', 'aim_lob(2)'], ['wait_n(2)', 'fly_right(3)', 'wait_n(3)', 'fly_right(2)', 'span_sow("red", 1)']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Sau sort_lob() ở sân 2, tầm ném đang là 3, nên ở cột 5 R1 phải gọi aim_lob(2) để ném đúng 2 ô lên M(5,2).', 'R2 bay vào ô cổng C(5,1) ở nhịp 9 sẽ đứng ngay trên M(5,2) để đọc c = color("down").']
    }),

    /* ================================================= chương che-doi-omni "Chế lệnh: đội mỏ đá" ================================================= */
    che({
      so: 11, ten: 'Lấp hố rồi hất mở cổng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoa: [0, 1],
      hamCuaEmCan: ['fill_pit', 'aim_lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Trong đường hầm mỏ có hố sâu u(3,3) chắn trước viên đá thứ hai và nút đè M(5,3). R1 gọi fill_pit() lấp hố và bước lên ô hố đã lấp (4 nhịp), rồi gọi aim_lob(2) hất viên đá thứ hai lên nút M (2 nhịp). Bấm Chạy xem hai robot phối hợp trước khi đóng gói thành hàm ở màn sau.',
      veMaMau: 'Hai chương trình đã viết sẵn. Bấm Chạy để xem.',
      san: ['#########', '#.C.....#', '#########', '#.ouoM..#', '#########'],
      hinh: ['.........', '...rrr...', '.........', '.........', '.........'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B(['fill_pit()', 'aim_lob(2)'], ['wait_n(6)', 'fly_right(2)', 'span_sow("red", 2)']),
      loiGiai: B(['fill_pit()', 'aim_lob(2)'], ['wait_n(6)', 'fly_right(2)', 'span_sow("red", 2)']),
      sao: { o: 27, nhip: 10 },
      goiY: ['fill_pit() tốn 4 nhịp và aim_lob(2) tốn 2 nhịp để đè nút M(5,3) ở cuối nhịp 6.', 'R2 chờ 6 nhịp rồi bay qua cổng C(2,1) gieo 3 bông hoa đỏ.']
    }),

    che({
      so: 12, ten: 'Chế hàm mở lối qua hố', hang: 'lam-quen', taoHam: ['open_dock'], khoa: [1],
      hamCuaEmCan: ['fill_pit', 'aim_lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Bấm "+ Hàm mới" tạo hàm open_dock(n) cho R1: gọi fill_pit() để lấp hố trước mặt và tiến lên 2 ô, rồi gọi aim_lob(n) để hất viên đá kế tiếp đi n ô lên nút M. Dùng open_dock(3) vượt rào sắt mở cổng cho R2.',
      veMaMau: 'Drone R2 đã khoá chương trình chờ 6 nhịp. Hãy tạo hàm open_dock(n) và gọi open_dock(3) cho R1.',
      san: ['##########', '#.C......#', '##########', '#.ouo=M..#', '##########'],
      hinh: ['..........', '...yyy....', '..........', '..........', '..........'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], ['wait_n(6)', 'fly_right(2)', 'span_sow("yellow", 2)']),
      loiGiai: B(['open_dock(3)'], ['wait_n(6)', 'fly_right(2)', 'span_sow("yellow", 2)'], { hamCuaEmMoi: [hOpenDock()] }),
      sao: { o: 28, nhip: 10 },
      loiSai: [
        { moTa: 'Viết thẳng trong chương trình của R1 mà không tạo hàm open_dock(n)', baiLam: B(['fill_pit()', 'aim_lob(3)'], ['wait_n(6)', 'fly_right(2)', 'span_sow("yellow", 2)']), phaiCoMa: ['chua-tao-ham'] },
        { moTa: 'Trong open_dock(n) quên gọi fill_pit() nên R1 hất viên đá đầu tiên vọt qua hố', baiLam: B(['open_dock(3)'], ['wait_n(6)', 'fly_right(2)', 'span_sow("yellow", 2)']), hamCuaEmMoi: [hOpenDock(['aim_lob(n)'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thân hàm open_dock(n) gồm 2 dòng: fill_pit() và aim_lob(n).', 'Chương trình của R1 gọi open_dock(3).']
    }),

    che({
      so: 13, ten: 'Mở lối vào trạm sạc', hang: 'lam-quen', pin: 9,
      hamCuaEmCan: ['open_dock', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'R2 chỉ có 9 pin nên phải chờ R1 chạy open_dock(3) mở cổng C(2,1), rồi bay 2 ô tới trạm sạc P(3,1) đáp xuống sạc đầy pin (land(), take_off()) trước khi bay sang (4,1) gieo 4 bông hoa xanh dương.',
      veMaMau: 'Dùng lại hàm open_dock(3) cho R1 và viết chương trình đáp sạc cho R2.',
      san: ['##########', '#.CP.....#', '##########', '#.ouo=M..#', '##########'],
      hinh: ['..........', '....bbbb..', '..........', '..........', '..........'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['open_dock(3)'], ['wait_n(6)', 'fly_right(2)', 'land()', 'take_off()', 'go_right()', 'span_sow("blue", 3)']),
      sao: { o: 31, nhip: 14 },
      loiSai: [
        { moTa: 'R2 không đáp sạc trên P(3,1) nên hết pin trước khi gieo xong 4 bông hoa', baiLam: B(['open_dock(3)'], ['wait_n(6)', 'fly_right(3)', 'span_sow("blue", 3)']), phaiCoMa: ['het-pin'] },
        { moTa: 'R1 gọi open_dock(2) làm đá vướng rào sắt (5,3)', baiLam: B(['open_dock(2)'], ['wait_n(6)', 'fly_right(2)', 'land()', 'take_off()', 'go_right()', 'span_sow("blue", 3)']), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      goiY: ['R1 gọi open_dock(3).', 'R2 gọi wait_n(6), fly_right(2), land(), take_off(), go_right(), span_sow("blue", 3).']
    }),

    che({
      so: 14, ten: 'Chế hàm chờ mở lối gieo hoa', hang: 'luyen', taoHam: ['mine_sow'], khoa: [0],
      hamCuaEmCan: ['open_dock', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Mỗi lần R1 gọi open_dock(n) đều tốn đúng 6 nhịp để mở cổng C. Hãy bấm "+ Hàm mới" tạo hàm mine_sow(c, n) cho R2 gồm: wait_n(6), fly_right(2), span_sow(c, n). Dùng mine_sow("green", 3) cho R2.',
      veMaMau: 'R1 đã khoá với open_dock(2). Tạo hàm mine_sow(c, n) và gọi cho R2.',
      san: ['#########', '#.C.....#', '#########', '#.ouoM..#', '#########'],
      hinh: ['.........', '...gggg..', '.........', '.........', '.........'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B(['open_dock(2)'], []),
      loiGiai: B(['open_dock(2)'], ['mine_sow("green", 3)'], { hamCuaEmMoi: [hMineSow()] }),
      sao: { o: 29, nhip: 11 },
      loiSai: [
        { moTa: 'Viết thẳng trong chương trình của R2 mà không tạo hàm mine_sow(c, n)', baiLam: B(['open_dock(2)'], ['wait_n(6)', 'fly_right(2)', 'span_sow("green", 3)']), phaiCoMa: ['chua-tao-ham'] },
        { moTa: 'Trong mine_sow(c, n) chỉ chờ wait_n(4) nên R2 đâm vào cổng C khi R1 chưa hất viên đá thứ hai', baiLam: B(['open_dock(2)'], ['mine_sow("green", 3)']), hamCuaEmMoi: [hMineSow(['wait_n(4)', 'fly_right(2)', 'span_sow(c, n)'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thân hàm mine_sow(c, n) gồm 3 dòng: wait_n(6), fly_right(2), span_sow(c, n).', 'Chương trình của R2 chỉ cần 1 dòng: mine_sow("green", 3).']
    }),

    che({
      so: 15, ten: 'Chế hàm lọc đá mở cổng', hang: 'luyen', taoHam: ['pad_kind'], khoa: [1],
      hamCuaEmCan: ['sort_lob', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Ở hai sân, viên đá nằm cách R1 một ô trống. Bấm "+ Hàm mới" tạo hàm pad_kind() cho R1: tiến 1 ô (move()) tới sát viên đá rồi gọi sort_lob() để tự nhận dạng đá tròn/quặng và hất đúng tầm lên nút M.',
      veMaMau: 'R2 đã khoá chương trình chờ 3 nhịp. Tạo hàm pad_kind() và gọi cho R1.',
      san: [
        ['#########', '#.C.....#', '#########', '#..oM...#', '#########'],
        ['#########', '#.C.....#', '#########', '#..o=M..#', '#########']
      ],
      vatDang: [
        ['.........', '.........', '.........', '...r.....', '.........'],
        ['.........', '.........', '.........', '...q.....', '.........']
      ],
      hinh: [
        ['.........', '...rrr...', '.........', '.........', '.........'],
        ['.........', '...rrr...', '.........', '.........', '.........']
      ],
      noi: [
        [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }]
      ],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], ['wait_n(3)', 'fly_right(2)', 'span_sow("red", 2)']),
      loiGiai: B(['pad_kind()'], ['wait_n(3)', 'fly_right(2)', 'span_sow("red", 2)'], { hamCuaEmMoi: [hPadKind()] }),
      sao: { o: 28, nhip: 14 },
      loiSai: [
        { moTa: 'Viết thẳng move(), sort_lob() mà không tạo hàm pad_kind()', baiLam: B(['move()', 'sort_lob()'], ['wait_n(3)', 'fly_right(2)', 'span_sow("red", 2)']), phaiCoMa: ['chua-tao-ham'] },
        { moTa: 'Trong pad_kind() dùng lob() cứng thay vì sort_lob() nên hỏng ở sân 2', baiLam: B(['pad_kind()'], ['wait_n(3)', 'fly_right(2)', 'span_sow("red", 2)']), hamCuaEmMoi: [hPadKind(['move()', 'lob()'])], phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      goiY: ['Thân hàm pad_kind() gồm 2 dòng: move() và sort_lob().', 'Chương trình của R1 gọi pad_kind().']
    }),

    che({
      so: 16, ten: 'Lọc đá và đọc màu mẫu', hang: 'luyen',
      hamCuaEmCan: ['pad_kind', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Hai sân vừa khác loại đá trước mặt R1 (đá tròn hay quặng) vừa khác màu viên đá mẫu ở (3,2) ngay sau cổng C(2,1). Cho R1 gọi pad_kind() mở cổng C trong 3 nhịp. R2 chờ 3 nhịp, bay 2 ô tới (3,1), đọc c = color("down"), bay tiếp 1 ô sang phải rồi gieo luống hoa màu c.',
      veMaMau: 'Kết hợp pad_kind() của R1 với camera đọc màu của R2 trên 2 sân.',
      san: [
        ['#########', '#.C.....#', '#..o....#', '#..oM...#', '#########'],
        ['#########', '#.C.....#', '#..o....#', '#..o=M..#', '#########']
      ],
      vatDang: [
        ['.........', '.........', '...r.....', '...r.....', '.........'],
        ['.........', '.........', '...r.....', '...q.....', '.........']
      ],
      vatMau: [
        ['.........', '.........', '...y.....', '.........', '.........'],
        ['.........', '.........', '...b.....', '.........', '.........']
      ],
      hinh: [
        ['.........', '....yyy..', '.........', '.........', '.........'],
        ['.........', '....bbb..', '.........', '.........', '.........']
      ],
      noi: [
        [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }]
      ],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['pad_kind()'], ['wait_n(3)', 'fly_right(2)', 'c = color("down")', 'go_right()', 'span_sow(c, 2)']),
      sao: { o: 30, nhip: 16 },
      loiSai: [
        { moTa: 'R2 gieo cứng màu vàng: hỏng ở sân 2 khi mẫu đá màu xanh dương', baiLam: B(['pad_kind()'], ['wait_n(3)', 'fly_right(3)', 'span_sow("yellow", 2)']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'R2 không tiến thêm go_right() sau khi đọc mẫu nên gieo lệch vị trí', baiLam: B(['pad_kind()'], ['wait_n(3)', 'fly_right(2)', 'c = color("down")', 'span_sow(c, 2)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['R1 chỉ cần gọi pad_kind().', 'R2: wait_n(3), fly_right(2) tới (3,1) trên viên đá mẫu (3,2), đọc c = color("down"), rồi go_right() và span_sow(c, 2).']
    }),

    che({
      so: 17, ten: 'Gieo hai luống qua cổng mỏ', hang: 'bien-the',
      hamCuaEmCan: ['open_dock', 'mine_sow', 'fly_right', 'span_sow'],
      deBai: 'R1 dùng open_dock(3) lấp hố và hất đá qua rào sắt mở cổng C(2,1). R2 gọi mine_sow("red", 1) để chờ mở cổng và gieo luống đỏ đầu tiên (2 bông ở cột 3, 4), sau đó bay tiếp 2 ô sang phải và gọi span_sow("yellow", 1) gieo luống vàng thứ hai (cột 6, 7).',
      veMaMau: 'Dùng open_dock(3) cho R1 và mine_sow("red", 1) kết hợp span_sow("yellow", 1) cho R2.',
      san: ['##########', '#.C......#', '##########', '#.ouo=M..#', '##########'],
      hinh: ['..........', '...rr.yy..', '..........', '..........', '..........'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['open_dock(3)'], ['mine_sow("red", 1)', 'fly_right(2)', 'span_sow("yellow", 1)']),
      sao: { o: 31, nhip: 12 },
      loiSai: [
        { moTa: 'R2 chỉ bay 1 ô giữa hai luống hoa nên gieo đè vào ô trống (5,1)', baiLam: B(['open_dock(3)'], ['mine_sow("red", 1)', 'go_right()', 'span_sow("yellow", 1)']), phaiCoMa: ['to-thua'] },
        { moTa: 'R1 gọi open_dock(2) làm đá vướng rào sắt', baiLam: B(['open_dock(2)'], ['mine_sow("red", 1)', 'fly_right(2)', 'span_sow("yellow", 1)']), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      goiY: ['mine_sow("red", 1) kết thúc khi R2 đang ở (4,1).', 'Từ (4,1) gọi fly_right(2) sẽ đưa R2 tới (6,1) để gọi span_sow("yellow", 1).']
    }),

    che({
      so: 18, ten: 'Hai cổng lọc đá', hang: 'bien-the',
      hamCuaEmCan: ['pad_kind', 'slide_r', 'wait_n', 'fly_right', 'span_sow'],
      deBai: 'Hai sân có hai cổng C(2,1) và C(5,1). Ở dưới, R1 đứng ở (1,3) quay mặt sang Đông: gọi pad_kind() mở cổng đầu (3 nhịp), trượt xuống hàng 4 bằng slide_r(1) rồi gọi pad_kind() lần nữa mở cổng thứ hai ở cuối nhịp 7. R2 chờ 3 nhịp, bay 3 ô qua cổng đầu, chờ 1 nhịp cho cổng hai mở rồi bay 2 ô qua cổng hai gieo 2 bông hoa xanh lá.',
      veMaMau: 'R1 dùng pad_kind(), slide_r(1), pad_kind() để mở lần lượt hai cổng.',
      san: [
        ['#########', '#.C..C..#', '#########', '#..oM...#', '#...o=M.#', '#########'],
        ['#########', '#.C..C..#', '#########', '#..o=M..#', '#...oM..#', '#########']
      ],
      vatDang: [
        ['.........', '.........', '.........', '...r.....', '....q....', '.........'],
        ['.........', '.........', '.........', '...q.....', '....r....', '.........']
      ],
      hinh: [
        ['.........', '......gg.', '.........', '.........', '.........', '.........'],
        ['.........', '......gg.', '.........', '.........', '.........', '.........']
      ],
      noi: [
        [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 6, y: 4 }, cua: [{ x: 5, y: 1 }] }],
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 5, y: 4 }, cua: [{ x: 5, y: 1 }] }]
      ],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['pad_kind()', 'slide_r(1)', 'pad_kind()'], ['wait_n(3)', 'fly_right(3)', 'wait_n(1)', 'fly_right(2)', 'span_sow("green", 1)']),
      sao: { o: 35, nhip: 20 },
      loiSai: [
        { moTa: 'R1 quên slide_r(1) xuống hàng 4 trước khi gọi pad_kind() lần hai', baiLam: B(['pad_kind()', 'pad_kind()'], ['wait_n(3)', 'fly_right(3)', 'wait_n(1)', 'fly_right(2)', 'span_sow("green", 1)']), phaiCoMa: ['nap-hut', 'dam-tuong'] },
        { moTa: 'R2 không chờ cổng hai mở mà bay thẳng qua (5,1)', baiLam: B(['pad_kind()', 'slide_r(1)', 'pad_kind()'], ['wait_n(3)', 'fly_right(5)', 'span_sow("green", 1)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['R1: pad_kind() (3 nhịp), slide_r(1) xuống (2,4) (1 nhịp), pad_kind() (3 nhịp) -> cổng hai mở ở cuối nhịp 7.', 'R2: wait_n(3), fly_right(3) tới (4,1) ở nhịp 6, wait_n(1) tới nhịp 7, rồi fly_right(2) và span_sow("green", 1).']
    }),

    che({
      so: 19, ten: 'Vượt hố rồi lọc đá mở cổng', hang: 'bien-the',
      hamCuaEmCan: ['open_dock', 'slide_r', 'pad_kind', 'mine_sow', 'fly_right', 'span_sow'],
      deBai: 'Hai sân có hai cổng C(2,1) và C(5,1). Ở hàng 3, R1 gọi open_dock(2) (6 nhịp) để lấp hố và mở cổng đầu C(2,1) từ vị trí dừng (3,3). Sau đó R1 trượt xuống hàng 4 bằng slide_r(1) tới (3,4) rồi gọi pad_kind() (3 nhịp) lọc đá ở (5,4) hất lên nút M mở cổng hai C(5,1) ở cuối nhịp 10. Trên không, R2 gọi mine_sow("blue", 1) (xong ở nhịp 9 tại (4,1)), chờ 1 nhịp cho cổng hai mở rồi bay 2 ô qua cổng hai và gieo 2 bông hoa vàng.',
      veMaMau: 'Kết hợp cả ba hàm mới: open_dock(2), pad_kind() trên R1 và mine_sow("blue", 1) trên R2.',
      san: [
        ['##########', '#.C..C...#', '##########', '#.ouoM...#', '#....oM..#', '##########'],
        ['##########', '#.C..C...#', '##########', '#.ouoM...#', '#....o=M.#', '##########']
      ],
      vatDang: [
        ['..........', '..........', '..........', '..r.r.....', '.....r....', '..........'],
        ['..........', '..........', '..........', '..r.r.....', '.....q....', '..........']
      ],
      hinh: [
        ['..........', '...bb.yy..', '..........', '..........', '..........', '..........'],
        ['..........', '...bb.yy..', '..........', '..........', '..........', '..........']
      ],
      noi: [
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 6, y: 4 }, cua: [{ x: 5, y: 1 }] }],
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 7, y: 4 }, cua: [{ x: 5, y: 1 }] }]
      ],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['open_dock(2)', 'slide_r(1)', 'pad_kind()'], ['mine_sow("blue", 1)', 'wait()', 'fly_right(2)', 'span_sow("yellow", 1)']),
      sao: { o: 43, nhip: 26 },
      loiSai: [
        { moTa: 'R1 quên slide_r(1) xuống hàng 4 trước khi gọi pad_kind()', baiLam: B(['open_dock(2)', 'pad_kind()'], ['mine_sow("blue", 1)', 'wait()', 'fly_right(2)', 'span_sow("yellow", 1)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R2 không chờ 1 nhịp trước cổng C(5,1) mà bay ngay ở nhịp 10', baiLam: B(['open_dock(2)', 'slide_r(1)', 'pad_kind()'], ['mine_sow("blue", 1)', 'fly_right(2)', 'span_sow("yellow", 1)']), phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['R1: open_dock(2), slide_r(1), pad_kind() (6 + 1 + 3 = 10 nhịp).', 'R2: mine_sow("blue", 1) xong ở nhịp 9 tại (4,1), gọi wait() chờ nhịp 10 cổng C(5,1) mở rồi gọi fly_right(2), span_sow("yellow", 1).']
    }),

    che({
      so: 20, ten: 'Trùm: Chế lệnh đội mỏ đá', hang: 'trum',
      hamCuaEmCan: ['open_dock', 'slide_r', 'pad_kind', 'mine_sow', 'fly_right', 'span_sow'],
      deBai: 'Ba sân trùm khép lại gói Đội mỏ đá. R1 gọi open_dock(2) mở cổng đầu, trượt xuống slide_r(1) rồi gọi pad_kind() lọc đá tròn/quặng mở cổng hai C(5,1) ở cuối nhịp 10. Trên không, R2 gọi mine_sow("blue", 1) gieo luống đầu, chờ 1 nhịp cho cổng hai mở, bay 2 ô qua cổng hai tới (6,1) đọc màu viên đá mẫu ở (6,2) bằng c = color("down"), rồi tiến 1 ô sang (7,1) và gọi span_sow(c, 1) gieo luống hoa cuối cùng.',
      veMaMau: 'Tổng hợp open_dock, pad_kind, mine_sow và đọc màu camera trên cả 3 sân.',
      san: [
        ['##########', '#.C..C...#', '#.....o..#', '#.ouoM...#', '#....oM..#', '##########'],
        ['##########', '#.C..C...#', '#.....o..#', '#.ouoM...#', '#....o=M.#', '##########'],
        ['##########', '#.C..C...#', '#.....o..#', '#.ouoM...#', '#....oM..#', '##########']
      ],
      vatDang: [
        ['..........', '..........', '......r...', '..r.r.....', '.....r....', '..........'],
        ['..........', '..........', '......r...', '..r.r.....', '.....q....', '..........'],
        ['..........', '..........', '......r...', '..r.r.....', '.....r....', '..........']
      ],
      vatMau: [
        ['..........', '..........', '......r...', '..........', '..........', '..........'],
        ['..........', '..........', '......g...', '..........', '..........', '..........'],
        ['..........', '..........', '......y...', '..........', '..........', '..........']
      ],
      hinh: [
        ['..........', '...bb..rr.', '..........', '..........', '..........', '..........'],
        ['..........', '...bb..gg.', '..........', '..........', '..........', '..........'],
        ['..........', '...bb..yy.', '..........', '..........', '..........', '..........']
      ],
      noi: [
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 6, y: 4 }, cua: [{ x: 5, y: 1 }] }],
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 7, y: 4 }, cua: [{ x: 5, y: 1 }] }],
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 6, y: 4 }, cua: [{ x: 5, y: 1 }] }]
      ],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1 }],
      maMau: B([], []),
      loiGiai: B(['open_dock(2)', 'slide_r(1)', 'pad_kind()'], ['mine_sow("blue", 1)', 'wait()', 'fly_right(2)', 'c = color("down")', 'go_right()', 'span_sow(c, 1)']),
      sao: { o: 45, nhip: 42 },
      loiSai: [
        { moTa: 'R2 gieo cứng màu đỏ ở luống thứ hai: hỏng ở sân 2 và sân 3', baiLam: B(['open_dock(2)', 'slide_r(1)', 'pad_kind()'], ['mine_sow("blue", 1)', 'wait()', 'fly_right(3)', 'span_sow("red", 1)']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'R1 hất cứng aim_lob(2) ở hàng 4 thay vì gọi pad_kind(): hỏng ở sân 2 khi gặp quặng', baiLam: B(['open_dock(2)', 'slide_r(1)', 'move()', 'aim_lob(2)'], ['mine_sow("blue", 1)', 'wait()', 'fly_right(2)', 'c = color("down")', 'go_right()', 'span_sow(c, 1)']), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      goiY: ['R1: open_dock(2), slide_r(1), pad_kind().', 'R2: mine_sow("blue", 1), fly_right(2) tới (6,1) ngay trên viên đá mẫu (6,2), đọc c = color("down"), rồi go_right() và span_sow(c, 1).']
    })
  ];

  ManHoc.manDoiOmniMoi = DS;
  if (laNode) module.exports = DS;
})();
