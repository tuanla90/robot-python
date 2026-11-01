/* ============================================================================
   man-doi-chia-hang.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 4, gói 9 "Đội chia hàng" (PDM4c 31/10, KE-HOACH-PART-DUNG-MUA.md).
   Hai chương doi-nam-cham (so 11..20) và che-doi-nam-cham (so 11..20), 20 màn phối hợp hai robot:
     - R1 (vàng, của Sola): Drone nông nghiệp đầy đủ mùa 4 (thân drone + bộ gieo hạt son + camera bốn hướng có nhìn dưới chân + đáp sạc land/take_off/battery).
     - R2 (lam, của Luna): Robot phân loại đầy đủ mùa 3 (thân nhện + nam châm bụng N/S + cảm biến từ ở hông front_metal/front_pole + co/duỗi chân crouch/stand).
   Mỗi robot làm việc robot kia không làm được:
     - R2 đi dưới đất đè nút M (drone đang bay không đè được nút M), chui qua gầm thấp n trong đường hầm kín, nhảy qua hố u, đọc cảm biến từ front_metal()/front_pole(),
       hút sắt vụn và bao hạt gắn nam châm N/S dưới bụng đặt lên nút M để mở cổng C hoặc dọn sắt khỏi trạm sạc P và đưa mẫu hạt tới chỗ R1 đọc màu.
     - R1 bay qua rào/hố, đáp sạc trên trạm P, đọc màu mẫu hạt bằng camera (color), gieo hạt nở hoa đúng hình mục tiêu (to-hinh).
   Hàm của em chương 2: pad_hold(d) cho R2 chui gầm rồi đặt sắt giữ nút; wait_sow(c, n) cho R1 chờ cổng mở rồi bay qua cổng gieo luống; pole_gate() cho R2 đọc cực hút vật đặt lên nút.
   Màn cũ doi-nam-cham.1..10 và che-doi-nam-cham.1..10 chuyển sang gói chứa ẩn doi-nam-cham-cu ở mùa 5 (lo-trinh-hoc.js).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var SON = ['ink', 'dot', 'pen_down', 'pen_up'];
  var DAP = ['land', 'take_off', 'battery'];
  var CAM_DUOI = { ma: 'camera-4', o: 'tren', taiCho: true };
  var NHEN_HAM = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];

  function R1_DRONE(pin) {
    var coPin = pin !== undefined;
    var d = {
      loaiRobot: 'drone',
      robot: { than: 'drone', tay: 'son', camBien: [CAM_DUOI] },
      hamGoc: BAY.concat(SON, ['color'], coPin ? DAP : ['land', 'take_off'])
    };
    if (coPin) d.pin = pin;
    return d;
  }
  function R2_NHEN() {
    return {
      loaiRobot: 'nhen',
      robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }], son: 'lam' },
      hamGoc: NHEN_HAM.slice()
    };
  }
  function B(c1, c2, them) {
    return Object.assign({ doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }, them || {});
  }
  function LAP(n, lenh) {
    return ['for i in range(' + n + '):'].concat((Array.isArray(lenh) ? lenh : [lenh]).map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  /** m.bd: [batDau R1 drone, batDau R2 nhện]; m.khoa: chỉ số robot khoá. */
  function man(m) {
    var bd = m.bd, pin = m.pin, r1 = R1_DRONE(pin), r2 = R2_NHEN(), khoa = m.khoa;
    delete m.bd; delete m.pin; delete m.khoa;
    m.chuong = m.chuong || 'doi-nam-cham';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.vaHoac = true;
    m.mucTieu = 'to-hinh';
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
  function che(m) { m.chuong = 'che-doi-nam-cham'; return man(m); }

  var T_PAD = ['crawl(d)', 'hold_gate(d)'];
  var T_WAIT_SOW = ['wait_n(4)', 'fly_right(2)', 'span_sow(c, n)'];
  var T_POLE = ['grab_pole()', 'go_right()', 'magnet_off()', 'wait()'];
  function hPad(than) { return H('pad_hold', ['d'], than || T_PAD); }
  function hWaitSow(than) { return H('wait_sow', ['c', 'n'], than || T_WAIT_SOW); }
  function hPole(than) { return H('pole_gate', [], than || T_POLE); }

  var DS = [
    /* ================================================= chương doi-nam-cham "Đội giữ cổng gieo hoa" ================================================= */
    man({
      so: 11, ten: 'Nhện đè nút mở cổng vườn', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoa: [0, 1],
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'crawl'],
      deBai: 'R2 của Luna trở lại nông trại trên khung nhện phân loại để phối hợp với drone nông nghiệp R1 của Sola. Drone đang bay không đè được nút M dưới đất, nên R2 co chân chui qua gầm thấp n tới đứng đè lên nút M mở cổng C cho R1 bay qua gieo ba bông hoa đỏ. Bấm Chạy để xem hai robot phối hợp.',
      veMaMau: 'Hai chương trình đã viết sẵn và khoá. Bấm mũi tên ở cột chương trình để xem từng robot, rồi bấm Chạy.',
      san: ['########', '#.C....#', '########', '#.nM...#', '########'],
      hinh: ['........', '...rrr..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_n(5)', 'fly_right(2)', 'span_sow("red", 2)'], ['crawl("R")']),
      loiGiai: B(['wait_n(5)', 'fly_right(2)', 'span_sow("red", 2)'], ['crawl("R")']),
      sao: { o: 26, nhip: 9 },
      goiY: ['crawl("R") đưa nhện R2 chui qua gầm n(2,3) sang đứng trên nút M(3,3) ở cuối nhịp 5.', 'Cổng C(2,1) mở ra, drone R1 bay 2 ô qua cổng rồi gọi span_sow("red", 2).']
    }),

    man({
      so: 12, ten: 'Đặt sắt giữ cổng vườn', hang: 'lam-quen', khoa: [0],
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'hold_gate'],
      deBai: 'Drone R1 đã có chương trình tự động (đã khoá): chờ 3 nhịp rồi bay qua cổng C gieo luống hoa vàng. Ở làn dưới, nhện R2 đang đứng ngay trên mẩu sắt cạnh nút đè M. Viết chương trình cho R2 dùng hold_gate("R") hút sắt đặt lên nút M để giữ cổng C mở.',
      veMaMau: 'Chương trình của R2 còn trống nên cổng C đóng chặt, R1 đâm vào cổng. Viết chương trình cho R2.',
      san: ['########', '#.C....#', '########', '#.oM...#', '########'],
      vatChat: ['........', '........', '........', '..s.....', '........'],
      hinh: ['........', '...yyy..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: B(['wait_n(3)', 'fly_right(2)', 'span_sow("yellow", 2)'], []),
      loiGiai: B(['wait_n(3)', 'fly_right(2)', 'span_sow("yellow", 2)'], ['hold_gate("R")']),
      sao: { o: 27, nhip: 7 },
      loiSai: [
        { moTa: 'R2 chỉ hút sắt mà không bước sang nút M', baiLam: B(['wait_n(3)', 'fly_right(2)', 'span_sow("yellow", 2)'], ['pull_s()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R2 kéo sắt sang trái thay vì sang phải lên nút M', baiLam: B(['wait_n(3)', 'fly_right(2)', 'span_sow("yellow", 2)'], ['hold_gate("L")']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['hold_gate("R") hút mẩu sắt dưới bụng, bước sang phải lên nút M rồi thả sắt xuống.', 'Nút M có sắt đè từ cuối nhịp 3 nên R1 bay qua cổng C ở nhịp 4 an toàn.']
    }),

    man({
      so: 13, ten: 'Chờ nhện nhảy mở cổng', hang: 'lam-quen', khoa: [1],
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'jump'],
      deBai: 'Lần này nhện R2 đã được khoá chương trình: gọi jump("R") bật qua hố u để đáp lên nút đè M ở cuối nhịp 4. Drone R1 xuất phát sát trước cổng C. Hãy thêm wait_n(4) cho R1 chờ cổng mở rồi mới bay 2 ô qua cổng gieo luống hoa xanh dương.',
      veMaMau: 'Chạy thử: R1 bay ngay ở nhịp đầu khi R2 chưa kịp nhảy tới nút M nên đâm vào cổng C.',
      san: ['########', '#.C....#', '########', '#.uM...#', '########'],
      hinh: ['........', '...bbb..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['fly_right(2)', 'span_sow("blue", 2)'], ['jump("R")']),
      loiGiai: B(['wait_n(4)', 'fly_right(2)', 'span_sow("blue", 2)'], ['jump("R")']),
      sao: { o: 25, nhip: 8 },
      loiSai: [
        { moTa: 'R1 không chờ mà bay ngay vào cổng đang đóng', baiLam: B(['fly_right(2)', 'span_sow("blue", 2)'], ['jump("R")']), phaiCoMa: ['dam-tuong', 'to-thua'] },
        { moTa: 'R1 chỉ chờ 2 nhịp khi R2 còn đang nhảy trên không', baiLam: B(['wait_n(2)', 'fly_right(2)', 'span_sow("blue", 2)'], ['jump("R")']), phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['jump("R") của nhện R2 tốn 4 nhịp để đáp xuống nút M(3,3).', 'Cho R1 gọi wait_n(4), rồi fly_right(2) và span_sow("blue", 2).']
    }),

    man({
      so: 14, ten: 'Chuyển bao hạt lên nút cổng', hang: 'luyen',
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'hold_gate', 'go'],
      deBai: 'Bao hạt sắt màu đỏ nằm ở (2,3) dưới chân nhện R2. Phía trên R2 ở (2,2) là nút đè M mở cổng C(3,1). Cho R2 gọi hold_gate("U") đặt bao hạt lên nút M(2,2) rồi go("D") lùi ra để không che khuất bao hạt. R1 bay sang (2,1), chờ 5 nhịp, đọc c = color("down") rồi bay 2 ô qua cổng gieo luống hoa theo c.',
      veMaMau: 'Chương trình có sẵn chưa đặt bao hạt lên nút M và R1 chưa chờ đọc màu. Viết tiếp cho cả hai robot.',
      san: ['#########', '#..C....#', '##M######', '#.o.....#', '#########'],
      vatChat: ['.........', '.........', '.........', '..s......', '.........'],
      vatMau: ['.........', '.........', '.........', '..r......', '.........'],
      hinh: ['.........', '....rrr..', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: B(['go_right()'], []),
      loiGiai: B(['go_right()', 'wait_n(5)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 2)'], ['hold_gate("U")', 'go("D")']),
      sao: { o: 30, nhip: 10 },
      loiSai: [
        { moTa: 'R2 không đưa bao hạt lên nút M: cổng C đóng và color("down") trả về "none"', baiLam: B(['go_right()', 'wait_n(5)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 2)'], []), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R1 đọc color("down") ngay trước khi chờ R2 thả bao hạt và lùi ra', baiLam: B(['go_right()', 'c = color("down")', 'wait_n(5)', 'fly_right(2)', 'span_sow(c, 2)'], ['hold_gate("U")', 'go("D")']), phaiCoMa: ['mau-son-sai', 'chua-to-hinh'] }
      ],
      goiY: ['hold_gate("U") thả bao hạt lên nút M(2,2) ở nhịp 4, rồi go("D") lùi xuống ở nhịp 6 để thân nhện không che bao hạt.', 'R1 bay sang (2,1) mất 1 nhịp, gọi wait_n(5) hết nhịp 6 rồi đọc c = color("down").']
    }),

    man({
      so: 15, ten: 'Dọn sắt trên trạm sạc', hang: 'luyen', pin: 7,
      hamCuaEmCan: ['fly_dock', 'fly_right', 'span_sow', 'hold_gate'],
      deBai: 'Drone R1 chỉ có 7 pin nên phải đáp sạc ở trạm P(3,1) bằng fly_dock(2), rồi mới bay 2 ô qua cổng C(4,1) gieo ba bông hoa vàng. Nhưng trên trạm P(3,1) đang có một mẩu sắt chặn đáp, còn nút đè M mở cổng C nằm ngay dưới ở (3,2). Cho nhện R2 đứng ở (3,1) gọi hold_gate("D") nhấc sắt khỏi trạm P đem xuống đè nút M!',
      veMaMau: 'Chạy thử: R2 chưa nhấc sắt nên R1 đáp xuống trạm P bị chặn và cổng C vẫn đóng.',
      san: ['##########', '#..PC....#', '###M######', '##########'],
      vatThem: [{ x: 3, y: 1, chat: 'sat' }],
      hinh: ['..........', '.....yyy..', '..........', '..........'],
      bd: [{ x: 1, y: 1 }, { x: 3, y: 1, huong: 1 }],
      maMau: B(['fly_dock(2)', 'fly_right(2)', 'span_sow("yellow", 2)'], []),
      loiGiai: B(['fly_dock(2)', 'fly_right(2)', 'span_sow("yellow", 2)'], ['hold_gate("D")']),
      sao: { o: 30, nhip: 8 },
      loiSai: [
        { moTa: 'R2 không dọn mẩu sắt trên trạm P: R1 đáp bị chặn và đâm cổng', baiLam: B(['fly_dock(2)', 'fly_right(2)', 'span_sow("yellow", 2)'], []), phaiCoMa: ['dap-bi-chan', 'dam-tuong'] },
        { moTa: 'R1 quên đáp sạc ở trạm P mà bay thẳng sớm khi cổng C chưa mở', baiLam: B(['fly_right(4)', 'span_sow("yellow", 2)'], ['hold_gate("D")']), phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['Nhện R2 gọi hold_gate("D") nhấc mẩu sắt khỏi P(3,1) ở nhịp 1 và bước xuống M(3,2) ở nhịp 2..3.', 'Khi R1 bay 2 ô tới P(3,1) và đáp xuống ở nhịp 3 thì trạm P đã trống và cổng C(4,1) cũng mở.']
    }),

    man({
      so: 16, ten: 'Đọc cực mở cổng gieo hoa', hang: 'luyen',
      hamCuaEmCan: ['fly_right', 'wait_n', 'span_sow', 'grab_pole', 'go'],
      deBai: 'Hai ngày làm việc, bao hạt đặt ở (2,2) có gắn nam châm cực N (hạt đỏ) hoặc cực S (hạt xanh dương). Nhện R2 đứng ở (1,2) dùng grab_pole() đọc cực và bước sang hút bao hạt, rồi go("R"), magnet_off(), wait() thả bao hạt lên nút M(3,2) và go("R") bước qua để lộ bao hạt. Drone R1 bay 2 ô sang (3,1), chờ 5 nhịp, đọc c = color("down") từ bao hạt trên nút M rồi bay 2 ô qua cổng C(4,1) gieo 2 bông hoa.',
      veMaMau: 'Chương trình có sẵn của R2 bật cứng một cực và chưa đưa bao hạt lên nút M. Sửa R2 và viết tiếp R1.',
      san: [
        ['#########', '#...C...#', '#.oM....#', '#########'],
        ['#########', '#...C...#', '#.oM....#', '#########']
      ],
      vatChat: [
        ['.........', '.........', '..N......', '.........'],
        ['.........', '.........', '..S......', '.........']
      ],
      vatMau: [
        ['.........', '.........', '..r......', '.........'],
        ['.........', '.........', '..b......', '.........']
      ],
      hinh: [
        ['.........', '.....rr..', '.........', '.........'],
        ['.........', '.....bb..', '.........', '.........']
      ],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(['fly_right(2)'], ['magnet_s()', 'go("R")']),
      loiGiai: B(
        ['fly_right(2)', 'wait_n(5)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 1)'],
        ['grab_pole()', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']
      ),
      sao: { o: 32, nhip: 20 },
      loiSai: [
        { moTa: 'R2 bật cứng magnet_s(): ngày 2 gặp bao hạt cực S cùng cực không hút được', baiLam: B(['fly_right(2)', 'wait_n(5)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 1)'], ['magnet_s()', 'go("R")', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']), phaiCoMa: ['cung-cuc', 'mau-son-sai'], cung: true },
        { moTa: 'R1 gieo cứng màu đỏ: ngày 2 sai màu hoa', baiLam: B(['fly_right(2)', 'wait_n(5)', 'fly_right(2)', 'span_sow("red", 1)', 'wait()'], ['grab_pole()', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']), phaiCoMa: ['chua-to-hinh'], cung: true }
      ],
      goiY: ['grab_pole() đọc front_pole(), bật cực ngược lại dưới bụng rồi bước sang (2,2) hút bao hạt.', 'Sau grab_pole(), R2 gọi go("R"), magnet_off(), wait(), go("R") để thả bao hạt lên nút M(3,2) rồi tránh ra ở nhịp 7.']
    }),

    man({
      so: 17, ten: 'Dò bao hạt sắt trong hầm', hang: 'bien-the',
      hamCuaEmCan: ['wait_n', 'fly_right', 'sow_up', 'seek_row', 'go', 'hold_gate'],
      deBai: 'Hai ngày làm việc: ở khu hầm dưới có hai kiện hàng nằm ở cột 2, một kiện gỗ g và một kiện sắt s cạnh cặp nút đè M1, M2 mở hai cổng C1(2,1), C2(3,1). Nhện R2 dùng seek_row() đi xuống tìm đúng hàng có sắt, rồi gọi go("R"), hold_gate("R") đặt sắt giữ nút M1 và go("R") bước sang đứng đè nút M2. Drone R1 chờ 9 nhịp cho cả hai cổng mở rồi bay 3 ô qua hai cổng và gọi sow_up(3) gieo hoa theo dấu màu hàng trên.',
      veMaMau: 'Chương trình có sẵn của R2 chưa dò hàng có sắt bằng seek_row(). Hoàn thiện cả hai robot.',
      san: [
        ['####...##', '#.CC....#', '#.oMM...#', '#.oMM...#', '#########'],
        ['####...##', '#.CC....#', '#.oMM...#', '#.oMM...#', '#########']
      ],
      vatChat: [
        ['.........', '.........', '..s......', '..g......', '.........'],
        ['.........', '.........', '..g......', '..s......', '.........']
      ],
      noi: [
        [
          { nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 1 }], bang: [] },
          { nut: { x: 3, y: 3 }, cua: [{ x: 2, y: 1 }], bang: [] },
          { nut: { x: 4, y: 2 }, cua: [{ x: 3, y: 1 }], bang: [] },
          { nut: { x: 4, y: 3 }, cua: [{ x: 3, y: 1 }], bang: [] }
        ],
        [
          { nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 1 }], bang: [] },
          { nut: { x: 3, y: 3 }, cua: [{ x: 2, y: 1 }], bang: [] },
          { nut: { x: 4, y: 2 }, cua: [{ x: 3, y: 1 }], bang: [] },
          { nut: { x: 4, y: 3 }, cua: [{ x: 3, y: 1 }], bang: [] }
        ]
      ],
      mau: [
        ['....ryb..', '.........', '.........', '.........', '.........'],
        ['....byr..', '.........', '.........', '.........', '.........']
      ],
      hinh: [
        ['.........', '....ryb..', '.........', '.........', '.........'],
        ['.........', '....byr..', '.........', '.........', '.........']
      ],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(['wait_n(9)', 'fly_right(3)'], ['go("R")', 'hold_gate("R")', 'go("R")']),
      loiGiai: B(
        ['wait_n(9)', 'fly_right(3)', 'sow_up(3)'],
        ['seek_row()', 'go("R")', 'hold_gate("R")', 'go("R")']
      ),
      sao: { o: 33, nhip: 30 },
      loiSai: [
        { moTa: 'R2 không gọi seek_row() mà lấy ngay hàng đầu: ngày 2 gặp thùng gỗ không hút được nên cổng C1 đóng lại khi R2 bước sang M2', baiLam: B(['wait_n(9)', 'fly_right(3)', 'sow_up(3)'], ['go("R")', 'hold_gate("R")', 'go("R")']), phaiCoMa: ['hut-go', 'dam-tuong'], cung: true },
        { moTa: 'R1 không chờ R2 mở cổng mà bay ngay', baiLam: B(['fly_right(3)', 'sow_up(3)'], ['seek_row()', 'go("R")', 'hold_gate("R")', 'go("R")']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['seek_row() lặp while not front_metal(): go_down(), dừng đúng hàng có sắt ở cả hai ngày.', 'Trên hàng có sắt, R2 gọi go("R"), hold_gate("R") để sắt giữ M1, rồi go("R") sang đứng đè M2 mở cả hai cổng.']
    }),

    man({
      so: 18, ten: 'Nhảy mang sắt mở hai cổng', hang: 'bien-the',
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'hop_iron', 'go', 'hold_gate'],
      deBai: 'Hai cánh cổng C1(2,1) và C2(6,1) khóa hai luống hoa. Ở làn dưới, nhện R2 đứng trên mẩu sắt đầu trước hố u: gọi hop_iron("R") nhảy mang sắt qua hố thả lên nút M1(3,3) mở cổng C1, rồi bước sang mẩu sắt thứ hai gọi hold_gate("R") đặt lên nút M2(5,3) mở cổng C2. Drone R1 chờ cổng đầu mở, bay qua gieo hai bông đỏ, rồi bay qua cổng hai gieo hai bông xanh dương.',
      veMaMau: 'Chương trình có sẵn mới mở cổng đầu và gieo luống đầu. Viết tiếp cho cả hai robot.',
      san: ['###########', '#.C...C...#', '###########', '#ouMoM....#', '###########'],
      vatChat: ['...........', '...........', '...........', '.s..s......', '...........'],
      noi: [
        { nut: { x: 3, y: 3 }, cua: [{ x: 2, y: 1 }], bang: [] },
        { nut: { x: 5, y: 3 }, cua: [{ x: 6, y: 1 }], bang: [] }
      ],
      hinh: ['...........', '...rr..bb..', '...........', '...........', '...........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_n(5)', 'fly_right(2)', 'span_sow("red", 1)'], ['hop_iron("R")']),
      loiGiai: B(
        ['wait_n(5)', 'fly_right(2)', 'span_sow("red", 1)', 'wait_n(3)', 'fly_right(3)', 'span_sow("blue", 1)'],
        ['hop_iron("R")', 'go("R")', 'hold_gate("R")']
      ),
      sao: { o: 40, nhip: 15 },
      loiSai: [
        { moTa: 'R2 chỉ mở nút M1 mà quên mở nút M2: R1 đâm vào cổng C2', baiLam: B(['wait_n(5)', 'fly_right(2)', 'span_sow("red", 1)', 'wait_n(3)', 'fly_right(3)', 'span_sow("blue", 1)'], ['hop_iron("R")']), phaiCoMa: ['dam-tuong', 'to-thua'] },
        { moTa: 'R2 đi bộ qua hố thay vì gọi hop_iron("R")', baiLam: B(['wait_n(5)', 'fly_right(2)', 'span_sow("red", 1)', 'wait_n(3)', 'fly_right(3)', 'span_sow("blue", 1)'], ['hold_gate("R")', 'go("R")', 'hold_gate("R")']), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['hop_iron("R") hút sắt ở (1,3), nhảy qua hố (2,3) đáp xuống M1(3,3) ở cuối nhịp 5 và thả sắt ở nhịp 6.', 'Sau đó R2 gọi go("R") sang (4,3) và hold_gate("R") đặt sắt lên M2(5,3) ở cuối nhịp 11.']
    }),

    man({
      so: 19, ten: 'Hai trạm giữ cổng gieo luống', hang: 'bien-the',
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'go', 'hold_gate'],
      deBai: 'Hai trạm cổng C1(2,1), C2(6,1) và nút đè M1(3,3), M2(6,3) xếp nối tiếp nhau. Dùng vòng lặp for i in range(2): cho cả hai robot: ở mỗi trạm, R2 bước lên sắt gọi hold_gate("R") đặt sắt lên nút M rồi bước tiếp 1 ô; R1 chờ 5 nhịp, bay 2 ô qua cổng gieo hai bông hoa vàng bằng span_sow("yellow", 1) rồi bay 1 ô sang đứng trước cổng tiếp theo.',
      veMaMau: 'Chương trình có sẵn mới làm trạm đầu. Bọc chương trình của mỗi robot trong vòng lặp 2 lần.',
      san: ['############', '#.C...C....#', '############', '#.oM.oM....#', '############'],
      vatChat: ['............', '............', '............', '..s..s......', '............'],
      noi: [
        { nut: { x: 3, y: 3 }, cua: [{ x: 2, y: 1 }], bang: [] },
        { nut: { x: 6, y: 3 }, cua: [{ x: 6, y: 1 }], bang: [] }
      ],
      hinh: ['............', '...yy..yy...', '............', '............', '............'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_n(5)', 'fly_right(2)', 'span_sow("yellow", 1)', 'go_right()'], ['go("R")', 'hold_gate("R")', 'go("R")']),
      loiGiai: B(
        LAP(2, ['wait_n(5)', 'fly_right(2)', 'span_sow("yellow", 1)', 'go_right()']),
        LAP(2, ['go("R")', 'hold_gate("R")', 'go("R")'])
      ),
      sao: { o: 32, nhip: 17 },
      loiSai: [
        { moTa: 'Chỉ R1 lặp 2 trạm còn R2 dừng sau trạm đầu: cổng thứ hai vẫn đóng', baiLam: B(LAP(2, ['wait_n(5)', 'fly_right(2)', 'span_sow("yellow", 1)', 'go_right()']), ['go("R")', 'hold_gate("R")', 'go("R")']), phaiCoMa: ['dam-tuong', 'to-thua'] },
        { moTa: 'R2 quên bước go("R") cuối vòng: vòng hai đứng lại trên nút M đầu', baiLam: B(LAP(2, ['wait_n(5)', 'fly_right(2)', 'span_sow("yellow", 1)', 'go_right()']), LAP(2, ['go("R")', 'hold_gate("R")'])), phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['Mỗi vòng của R2: go("R") bước lên sắt, hold_gate("R") đặt sắt lên nút M, rồi go("R") sang ô trước mẩu sắt kế tiếp.', 'Mỗi vòng của R1: wait_n(5), fly_right(2), span_sow("yellow", 1), go_right().']
    }),

    man({
      so: 20, ten: 'Trùm chương: phối hợp mở vườn', hang: 'trum', pin: [12, 13, 14], khung: { chinh: 14, moiHam: 10 },
      hamCuaEmCan: ['fly_dock', 'fly_right', 'wait_n', 'span_sow', 'crawl', 'grab_pole', 'go'],
      deBai: 'Trùm chương 1 qua ba ngày làm việc. Nhện R2 chui qua gầm thấp bằng crawl("R"), dùng grab_pole() đọc cực bao hạt nam châm (N hoặc S) ở (4,2) rồi đặt lên nút M(5,2) và go("R") bước qua để lộ bao hạt. Drone R1 chờ 7 nhịp ở đầu làn, bay 4 ô tới trạm sạc P(5,1) đáp sạc đầy pin bằng fly_dock(4), đọc c = color("down") từ bao hạt trên nút M(5,2) rồi bay 2 ô qua cổng C(6,1) gieo ba bông hoa theo c.',
      veMaMau: 'Chương trình có sẵn mới cho R1 chờ và R2 qua gầm thấp. Viết tiếp cho cả hai robot.',
      san: [
        ['###########', '#....PC...#', '#.n.oM....#', '###########'],
        ['###########', '#....PC...#', '#.n.oM....#', '###########'],
        ['###########', '#....PC...#', '#.n.oM....#', '###########']
      ],
      vatChat: [
        ['...........', '...........', '....N......', '...........'],
        ['...........', '...........', '....S......', '...........'],
        ['...........', '...........', '....N......', '...........']
      ],
      vatMau: [
        ['...........', '...........', '....r......', '...........'],
        ['...........', '...........', '....b......', '...........'],
        ['...........', '...........', '....y......', '...........']
      ],
      hinh: [
        ['...........', '.......rrr.', '...........', '...........'],
        ['...........', '.......bbb.', '...........', '...........'],
        ['...........', '.......yyy.', '...........', '...........']
      ],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(['wait_n(7)'], ['crawl("R")']),
      loiGiai: B(
        ['wait_n(7)', 'fly_dock(4)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 2)'],
        ['crawl("R")', 'grab_pole()', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']
      ),
      sao: { o: 43, nhip: 51 },
      loiSai: [
        { moTa: 'R2 bật cứng magnet_s() thay vì grab_pole(): ngày 2 gặp cực S cùng cực không hút được', baiLam: B(['wait_n(7)', 'fly_dock(4)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 2)'], ['crawl("R")', 'magnet_s()', 'go("R")', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']), phaiCoMa: ['cung-cuc', 'mau-son-sai'], cung: true },
        { moTa: 'R1 gieo cứng màu đỏ thay vì đọc color("down")', baiLam: B(['wait_n(7)', 'fly_dock(4)', 'fly_right(2)', 'span_sow("red", 2)', 'wait()'], ['crawl("R")', 'grab_pole()', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']), phaiCoMa: ['chua-to-hinh'], cung: true },
        { moTa: 'R1 không đáp sạc ở P(5,1) mà bay thẳng: hết pin giữa luống hoa', baiLam: B(['wait_n(7)', 'fly_right(4)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 2)'], ['crawl("R")', 'grab_pole()', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['R2 gọi crawl("R") (6 nhịp), grab_pole() (2 nhịp), go("R") (2 nhịp), magnet_off(), wait() (1 nhịp), go("R") (2 nhịp): thả bao hạt lên nút M(5,2) rồi tránh ra ở nhịp 13.', 'R1 gọi wait_n(7) (7 nhịp), fly_dock(4) (6 nhịp: bay 4 ô + đáp sạc + cất cánh ở nhịp 13), rồi đọc c = color("down"), fly_right(2), span_sow(c, 2).']
    }),

    /* ================================================= chương che-doi-nam-cham "Chế lệnh đội nông trại" ================================================= */
    che({
      so: 11, ten: 'Hàm chui gầm giữ cổng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoa: [0, 1], khoaHamMan: ['open_pad'],
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'crawl', 'hold_gate'],
      deBai: 'Hàm open_pad(d) của màn gói liền hai việc của nhện R2: chui qua gầm thấp bằng crawl(d) tới mẩu sắt rồi gọi hold_gate(d) đặt sắt lên nút đè M giữ cổng mở. Mở Xưởng xem open_pad(d) rồi bấm Chạy.',
      veMaMau: 'Hai chương trình và hàm của màn đã viết sẵn, khoá. Bấm Chạy.',
      san: ['#########', '#.C.....#', '#########', '#.noM...#', '#########'],
      vatChat: ['.........', '.........', '.........', '...s.....', '.........'],
      hinh: ['.........', '...rrr...', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_n(9)', 'fly_right(2)', 'span_sow("red", 2)'], ['open_pad("R")'], { hamCuaMan: [H('open_pad', ['d'], T_PAD)] }),
      loiGiai: B(['wait_n(9)', 'fly_right(2)', 'span_sow("red", 2)'], ['open_pad("R")'], { hamCuaMan: [H('open_pad', ['d'], T_PAD)] }),
      sao: { o: 34, nhip: 13 },
      goiY: ['open_pad(d) gọi crawl(d) (6 nhịp) rồi hold_gate(d) (4 nhịp), đè nút M từ cuối nhịp 9.', 'Màn sau em sẽ tự chế hàm pad_hold(d) giống vậy để dùng suốt gói.']
    }),

    che({
      so: 12, ten: 'Chế hàm pad_hold(d)', hang: 'lam-quen', taoHam: ['pad_hold'],
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'crawl', 'hold_gate'],
      deBai: 'Chế hàm pad_hold(d) cho nhện R2: chui qua gầm thấp theo hướng d bằng crawl(d), rồi gọi hold_gate(d) hút mẩu sắt đặt lên nút đè M. Chương trình chính của hai robot đã gọi sẵn pad_hold("R") để mở cổng C cho R1 gieo luống hoa vàng.',
      veMaMau: 'Bấm Hàm mới để tạo pad_hold có một đối số d.',
      san: ['#########', '#.C.....#', '#########', '#.noM...#', '#########'],
      vatChat: ['.........', '.........', '.........', '...s.....', '.........'],
      hinh: ['.........', '...yyy...', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_n(9)', 'fly_right(2)', 'span_sow("yellow", 2)'], ['pad_hold("R")']),
      loiGiai: B(['wait_n(9)', 'fly_right(2)', 'span_sow("yellow", 2)'], ['pad_hold("R")'], { hamCuaEmMoi: [hPad()] }),
      sao: { o: 34, nhip: 13 },
      loiSai: [
        { moTa: 'Chưa tạo hàm pad_hold mà đã bấm Chạy', baiLam: B(['wait_n(9)', 'fly_right(2)', 'span_sow("yellow", 2)'], ['pad_hold("R")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong pad_hold quên gọi hold_gate(d): R2 chỉ chui qua gầm mà không đặt sắt lên nút M', baiLam: B(['wait_n(9)', 'fly_right(2)', 'span_sow("yellow", 2)'], ['pad_hold("R")']), hamCuaEmMoi: [hPad(['crawl(d)'])], phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['Thân hàm pad_hold(d) gồm hai dòng: crawl(d) rồi hold_gate(d).', 'Nhớ truyền đúng đối số d vào cả hai lệnh.']
    }),

    che({
      so: 13, ten: 'Hai hướng chui gầm giữ cổng', hang: 'lam-quen',
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'pad_hold'],
      deBai: 'Hai cánh cổng C1(2,1) và C2(6,1) cần mở lần lượt. Nhện R2 dùng pad_hold("R") chui gầm ngang đặt sắt lên nút M1(4,2), rồi từ (4,2) gọi tiếp pad_hold("D") chui gầm dọc xuống đặt sắt lên nút M2(4,5)! Drone R1 chờ cổng đầu mở, bay qua gieo hai bông đỏ, chờ cổng hai mở rồi bay qua gieo hai bông xanh lá.',
      veMaMau: 'Chương trình có sẵn mới mở cổng đầu. Viết tiếp cho cả hai robot.',
      san: ['##########', '#.C...C..#', '#.noM#####', '####n#####', '####o#####', '####M#####', '##########'],
      vatChat: ['..........', '..........', '...s......', '..........', '....s.....', '..........', '..........'],
      noi: [
        { nut: { x: 4, y: 2 }, cua: [{ x: 2, y: 1 }], bang: [] },
        { nut: { x: 4, y: 5 }, cua: [{ x: 6, y: 1 }], bang: [] }
      ],
      hinh: ['..........', '...rr..gg.', '..........', '..........', '..........', '..........', '..........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(['wait_n(9)', 'fly_right(2)', 'span_sow("red", 1)'], ['pad_hold("R")']),
      loiGiai: B(
        ['wait_n(9)', 'fly_right(2)', 'span_sow("red", 1)', 'wait_n(7)', 'fly_right(3)', 'span_sow("green", 1)'],
        ['pad_hold("R")', 'pad_hold("D")']
      ),
      sao: { o: 38, nhip: 23 },
      loiSai: [
        { moTa: 'R2 chỉ gọi pad_hold("R") mà quên pad_hold("D"): cổng C2 vẫn đóng', baiLam: B(['wait_n(9)', 'fly_right(2)', 'span_sow("red", 1)', 'wait_n(7)', 'fly_right(3)', 'span_sow("green", 1)'], ['pad_hold("R")']), phaiCoMa: ['dam-tuong', 'to-thua'] },
        { moTa: 'Lần thứ hai R2 truyền nhầm hướng "R" thay vì "D"', baiLam: B(['wait_n(9)', 'fly_right(2)', 'span_sow("red", 1)', 'wait_n(7)', 'fly_right(3)', 'span_sow("green", 1)'], ['pad_hold("R")', 'pad_hold("R")']), phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['Sau pad_hold("R"), R2 đang đứng ngay trên nút M1(4,2), phía dưới là gầm n(4,3), sắt (4,4) và nút M2(4,5): gọi ngay pad_hold("D").', 'pad_hold("D") mở cổng C2 ở cuối nhịp 19, nên R1 gọi wait_n(7) rồi fly_right(3) qua C2(6,1).']
    }),

    che({
      so: 14, ten: 'Chế hàm wait_sow(c, n)', hang: 'luyen', taoHam: ['wait_sow'],
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'hold_gate'],
      deBai: 'Chế hàm wait_sow(c, n) cho drone R1: gọi wait_n(4) chờ đồng đội mở cổng trước mặt, bay sang phải 2 ô qua cổng bằng fly_right(2), rồi gọi span_sow(c, n) gieo luống hoa. Chương trình chính đã gọi wait_sow("blue", 2) cho R1 và hold_gate("R") cho R2.',
      veMaMau: 'Bấm Hàm mới để tạo wait_sow với hai đối số c, n.',
      san: ['########', '#.C....#', '########', '#.oM...#', '########'],
      vatChat: ['........', '........', '........', '..s.....', '........'],
      hinh: ['........', '...bbb..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: B(['wait_sow("blue", 2)'], ['hold_gate("R")']),
      loiGiai: B(['wait_sow("blue", 2)'], ['hold_gate("R")'], { hamCuaEmMoi: [hWaitSow()] }),
      sao: { o: 28, nhip: 8 },
      loiSai: [
        { moTa: 'Chưa tạo hàm wait_sow mà đã bấm Chạy', baiLam: B(['wait_sow("blue", 2)'], ['hold_gate("R")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong wait_sow quên wait_n(4): R1 bay ngay khi cổng chưa mở', baiLam: B(['wait_sow("blue", 2)'], ['hold_gate("R")']), hamCuaEmMoi: [hWaitSow(['fly_right(2)', 'span_sow(c, n)'])], phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['Thân hàm wait_sow(c, n) có 3 dòng: wait_n(4), fly_right(2), span_sow(c, n).', 'wait_n(4) đủ chờ cả hold_gate (3 nhịp) lẫn jump hoặc pole_gate (4 nhịp).']
    }),

    che({
      so: 15, ten: 'Chế hàm pole_gate()', hang: 'luyen', taoHam: ['pole_gate'],
      hamCuaEmCan: ['wait_sow', 'grab_pole'],
      deBai: 'Chế hàm pole_gate() cho nhện R2: dùng grab_pole() đọc cực vật nam châm bên phải rồi bước sang nhấc vật, tiếp theo go_right() lên nút đè M, rồi magnet_off(), wait() thả vật giữ nút. Hai ngày làm việc có vật N và S khác nhau; R1 gọi wait_sow("yellow", 2).',
      veMaMau: 'Bấm Hàm mới để tạo pole_gate không đối số.',
      san: [
        ['########', '#.C....#', '########', '#.oM...#', '########'],
        ['########', '#.C....#', '########', '#.oM...#', '########']
      ],
      vatChat: [
        ['........', '........', '........', '..N.....', '........'],
        ['........', '........', '........', '..S.....', '........']
      ],
      hinh: [
        ['........', '...yyy..', '........', '........', '........'],
        ['........', '...yyy..', '........', '........', '........']
      ],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_sow("yellow", 2)'], ['pole_gate()']),
      loiGiai: B(['wait_sow("yellow", 2)'], ['pole_gate()'], { hamCuaEmMoi: [hPole()] }),
      sao: { o: 23, nhip: 16 },
      loiSai: [
        { moTa: 'Chưa tạo hàm pole_gate mà đã bấm Chạy', baiLam: B(['wait_sow("yellow", 2)'], ['pole_gate()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong pole_gate dùng pull_n() cố định thay vì grab_pole(): ngày 2 gặp cực S cùng cực', baiLam: B(['wait_sow("yellow", 2)'], ['pole_gate()']), hamCuaEmMoi: [hPole(['go_right()', 'pull_n()', 'go_right()', 'magnet_off()', 'wait()'])], phaiCoMa: ['cung-cuc'], cung: true }
      ],
      goiY: ['Thân hàm pole_gate(): grab_pole(), go_right(), magnet_off(), wait().', 'grab_pole() mất 2 nhịp, go_right() lên nút M mất 2 nhịp: cổng C mở ở cuối nhịp 4 vừa khớp với wait_sow của R1.']
    }),

    che({
      so: 16, ten: 'Đọc màu bao hạt trên nút', hang: 'luyen',
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'pole_gate'],
      deBai: 'Hai ngày làm việc: bao hạt gắn nam châm ở (2,2) mang màu khác nhau (ngày 1 cực N màu đỏ, ngày 2 cực S màu xanh dương). Nhện R2 gọi pole_gate() đưa bao hạt lên nút M(3,2) rồi go_right() tránh ra để lộ bao hạt. Drone R1 bay sang (3,1) ngay trên nút M, gọi wait_n(6), đọc c = color("down") rồi fly_right(2) và span_sow(c, 2).',
      veMaMau: 'Chương trình có sẵn của R1 chưa đọc màu bao hạt trên nút M. Hoàn thiện chương trình cho cả hai robot.',
      san: [
        ['##########', '#...C....#', '#.oM.....#', '##########'],
        ['##########', '#...C....#', '#.oM.....#', '##########']
      ],
      vatChat: [
        ['..........', '..........', '..N.......', '..........'],
        ['..........', '..........', '..S.......', '..........']
      ],
      vatMau: [
        ['..........', '..........', '..r.......', '..........'],
        ['..........', '..........', '..b.......', '..........']
      ],
      hinh: [
        ['..........', '.....rrr..', '..........', '..........'],
        ['..........', '.....bbb..', '..........', '..........']
      ],
      bd: [{ x: 2, y: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(['go_right()', 'wait_n(6)'], ['pole_gate()']),
      loiGiai: B(
        ['go_right()', 'wait_n(6)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 2)'],
        ['pole_gate()', 'go_right()']
      ),
      sao: { o: 25, nhip: 22 },
      loiSai: [
        { moTa: 'R1 gieo cứng màu đỏ thay vì đọc color("down"): ngày 2 sai màu', baiLam: B(['go_right()', 'wait_n(6)', 'fly_right(2)', 'span_sow("red", 2)', 'wait()'], ['pole_gate()', 'go_right()']), phaiCoMa: ['chua-to-hinh'], cung: true },
        { moTa: 'R1 đọc color("down") trước khi chờ R2 đưa bao hạt tới nút M và tránh ra', baiLam: B(['go_right()', 'c = color("down")', 'wait_n(6)', 'fly_right(2)', 'span_sow(c, 2)'], ['pole_gate()', 'go_right()']), phaiCoMa: ['mau-son-sai', 'chua-to-hinh'] }
      ],
      goiY: ['pole_gate() thả bao hạt lên nút M(3,2) ở nhịp 5, rồi go_right() bước sang (4,2) ở nhịp 7.', 'R1 bay sang (3,1) ở nhịp 1, wait_n(6) hết nhịp 7 rồi đọc c = color("down"), fly_right(2) và span_sow(c, 2).']
    }),

    che({
      so: 17, ten: 'Sửa hàm hop_pad()', hang: 'bien-the',
      hamCuaEmCan: ['wait_n', 'wait_sow', 'jump', 'hold_gate'],
      deBai: 'Hàm hop_pad() của màn giúp nhện R2 nhảy qua hố u tới mẩu sắt rồi gọi hold_gate("R") đặt sắt lên nút đè M, nhưng trong hàm viết nhầm go("R") thay vì jump("R") nên R2 rơi xuống hố. Hãy sửa hàm hop_pad() và viết tiếp wait_sow("green", 2) cho R1.',
      veMaMau: 'Chạy thử: R2 rơi xuống hố u. Mở Xưởng sửa hop_pad() và hoàn thiện R1.',
      san: ['#########', '#.C.....#', '#########', '#.uoM...#', '#########'],
      vatChat: ['.........', '.........', '.........', '...s.....', '.........'],
      hinh: ['.........', '...ggg...', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_n(3)'], ['hop_pad()'], { hamCuaMan: [H('hop_pad', [], ['go("R")', 'hold_gate("R")'])] }),
      loiGiai: B(
        ['wait_n(3)', 'wait_sow("green", 2)'],
        ['hop_pad()'],
        { hamCuaMan: [H('hop_pad', [], ['jump("R")', 'hold_gate("R")'])] }
      ),
      sao: { o: 35, nhip: 11 },
      loiSai: [
        { moTa: 'Giữ hàm hop_pad() sai: R2 bước thẳng xuống hố', baiLam: B(['wait_n(3)', 'wait_sow("green", 2)'], ['hop_pad()'], { hamCuaMan: [H('hop_pad', [], ['go("R")', 'hold_gate("R")'])] }), phaiCoMa: ['roi-ho'] },
        { moTa: 'Sửa hàm nhưng R1 không gọi wait_n(3) trước wait_sow: R1 bay vào cổng sớm', baiLam: B(['wait_sow("green", 2)'], ['hop_pad()'], { hamCuaMan: [H('hop_pad', [], ['jump("R")', 'hold_gate("R")'])] }), phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['Trong hop_pad(), đổi go("R") thành jump("R") để R2 bật qua hố u(2,3) đáp lên mẩu sắt ở (3,3).', 'jump("R") (4 nhịp) + hold_gate("R") (đè nút ở nhịp 7): R1 gọi wait_n(3) rồi wait_sow("green", 2).']
    }),

    che({
      so: 18, ten: 'Sạc pin rồi chờ cổng mở', hang: 'bien-the', pin: [12, 13],
      hamCuaEmCan: ['fly_dock', 'wait_sow', 'pad_hold'],
      deBai: 'Hai ngày làm việc với mức pin 12 và 13. Drone R1 dùng fly_dock(3) bay 3 ô tới trạm sạc P(4,1) đáp sạc đầy pin, rồi gọi wait_sow("yellow", 2) chờ cổng C(5,1) mở và bay qua gieo hoa. Ở làn dưới, nhện R2 gọi pad_hold("R") chui qua gầm thấp và đặt sắt lên nút M(4,3) đúng lúc R1 vừa chờ xong!',
      veMaMau: 'Chương trình có sẵn của R1 chưa gọi wait_sow("yellow", 2) sau khi sạc. Hoàn thiện cả hai robot.',
      san: [
        ['###########', '#...PC....#', '###########', '#.noM.....#', '###########'],
        ['###########', '#...PC....#', '###########', '#.noM.....#', '###########']
      ],
      vatChat: [
        ['...........', '...........', '...........', '...s.......', '...........'],
        ['...........', '...........', '...........', '...s.......', '...........']
      ],
      hinh: [
        ['...........', '......yyy..', '...........', '...........', '...........'],
        ['...........', '......yyy..', '...........', '...........', '...........']
      ],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['fly_dock(3)'], []),
      loiGiai: B(['fly_dock(3)', 'wait_sow("yellow", 2)'], ['pad_hold("R")']),
      sao: { o: 41, nhip: 26 },
      loiSai: [
        { moTa: 'R1 không đáp sạc ở P mà chỉ lơ lửng chờ: hết pin ở ngày pin 12', baiLam: B(['fly_right(3)', 'wait_n(2)', 'wait_sow("yellow", 2)'], ['pad_hold("R")']), phaiCoMa: ['het-pin'], cung: true },
        { moTa: 'R2 không gọi pad_hold("R"): cổng C đóng chặt', baiLam: B(['fly_dock(3)', 'wait_sow("yellow", 2)'], []), phaiCoMa: ['dam-tuong', 'to-thua'] }
      ],
      goiY: ['fly_dock(3) tốn 5 nhịp (3 nhịp bay + đáp + cất cánh), cộng thêm wait_n(4) trong wait_sow là đúng 9 nhịp.', 'pad_hold("R") của R2 đè nút M ở cuối nhịp 9 nên nhịp 10 R1 bay qua cổng C(5,1) vừa khít.']
    }),

    che({
      so: 19, ten: 'Hai trạm nam châm giữ cổng', hang: 'bien-the',
      hamCuaEmCan: ['wait_sow', 'pole_gate'],
      deBai: 'Hai ngày làm việc, mỗi ngày có hai trạm cổng C1(2,1), C2(6,1) và hai vật nam châm (N hoặc S) xếp nối tiếp nhau. Dùng vòng lặp for i in range(2): cho cả hai robot: R2 gọi pole_gate() rồi go_right() sang trạm kế tiếp; R1 gọi wait_sow("red", 1) rồi go_right() sang trước cổng kế tiếp.',
      veMaMau: 'Chương trình có sẵn mới làm trạm đầu. Bọc chương trình của mỗi robot trong vòng lặp 2 lần.',
      san: [
        ['############', '#.C...C....#', '############', '#.oM.oM....#', '############'],
        ['############', '#.C...C....#', '############', '#.oM.oM....#', '############']
      ],
      vatChat: [
        ['............', '............', '............', '..N..S......', '............'],
        ['............', '............', '............', '..S..N......', '............']
      ],
      noi: [
        [
          { nut: { x: 3, y: 3 }, cua: [{ x: 2, y: 1 }], bang: [] },
          { nut: { x: 6, y: 3 }, cua: [{ x: 6, y: 1 }], bang: [] }
        ],
        [
          { nut: { x: 3, y: 3 }, cua: [{ x: 2, y: 1 }], bang: [] },
          { nut: { x: 6, y: 3 }, cua: [{ x: 6, y: 1 }], bang: [] }
        ]
      ],
      hinh: [
        ['............', '...rr..rr...', '............', '............', '............'],
        ['............', '...rr..rr...', '............', '............', '............']
      ],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_sow("red", 1)', 'go_right()'], ['pole_gate()', 'go_right()']),
      loiGiai: B(
        LAP(2, ['wait_sow("red", 1)', 'go_right()']),
        LAP(2, ['pole_gate()', 'go_right()'])
      ),
      sao: { o: 27, nhip: 30 },
      loiSai: [
        { moTa: 'Chỉ R1 lặp 2 lần còn R2 làm 1 trạm: cổng thứ hai vẫn đóng', baiLam: B(LAP(2, ['wait_sow("red", 1)', 'go_right()']), ['pole_gate()', 'go_right()']), phaiCoMa: ['dam-tuong', 'to-thua'] },
        { moTa: 'R2 dùng hold_gate("R") thay vì pole_gate(): gặp vật nam châm cùng cực không hút được', baiLam: B(LAP(2, ['wait_sow("red", 1)', 'go_right()']), LAP(2, ['go_right()', 'hold_gate("R")', 'go_right()'])), phaiCoMa: ['cung-cuc', 'dam-tuong'] }
      ],
      goiY: ['Mỗi vòng của R2 chỉ cần 2 dòng: pole_gate() rồi go_right().', 'Mỗi vòng của R1 chỉ cần 2 dòng: wait_sow("red", 1) rồi go_right().']
    }),

    che({
      so: 20, ten: 'Trùm gói Đội: mùa hoa nở rộ', hang: 'trum', pin: [12, 13, 14], khung: { chinh: 14, moiHam: 10 },
      hamCuaEmCan: ['fly_dock', 'dock', 'wait_sow', 'wait_n', 'fly_right', 'span_sow', 'pad_hold', 'pole_gate'],
      deBai: 'Trùm gói Đội qua ba ngày làm việc. Trạm 1: R2 gọi pad_hold("R") chui gầm đặt sắt lên M1(4,2) mở cổng C1(5,1); R1 gọi fly_dock(3) tới trạm sạc P1(4,1) rồi wait_sow("yellow", 1) qua cổng C1 gieo hai bông vàng. Trạm 2: R2 bước sang phải 2 ô, gọi pole_gate() đưa bao hạt nam châm (N hoặc S) ở (7,2) lên nút M2(8,2) rồi go_right() tránh ra; R1 bay sang trạm P2(8,1), gọi dock() sạc đầy, wait_n(6), đọc c = color("down") rồi bay 2 ô qua C2 gieo hai bông hoa theo c.',
      veMaMau: 'Chương trình có sẵn mới hoàn thành trạm 1. Viết tiếp trạm 2 cho cả hai robot.',
      san: [
        ['##############', '#...PC..PC...#', '#.noM..oM....#', '##############'],
        ['##############', '#...PC..PC...#', '#.noM..oM....#', '##############'],
        ['##############', '#...PC..PC...#', '#.noM..oM....#', '##############']
      ],
      vatChat: [
        ['..............', '..............', '...s...N......', '..............'],
        ['..............', '..............', '...s...S......', '..............'],
        ['..............', '..............', '...s...N......', '..............']
      ],
      vatMau: [
        ['..............', '..............', '.......r......', '..............'],
        ['..............', '..............', '.......b......', '..............'],
        ['..............', '..............', '.......g......', '..............']
      ],
      noi: [
        [
          { nut: { x: 4, y: 2 }, cua: [{ x: 5, y: 1 }], bang: [] },
          { nut: { x: 8, y: 2 }, cua: [{ x: 9, y: 1 }], bang: [] }
        ],
        [
          { nut: { x: 4, y: 2 }, cua: [{ x: 5, y: 1 }], bang: [] },
          { nut: { x: 8, y: 2 }, cua: [{ x: 9, y: 1 }], bang: [] }
        ],
        [
          { nut: { x: 4, y: 2 }, cua: [{ x: 5, y: 1 }], bang: [] },
          { nut: { x: 8, y: 2 }, cua: [{ x: 9, y: 1 }], bang: [] }
        ]
      ],
      hinh: [
        ['..............', '......yy..rr..', '..............', '..............'],
        ['..............', '......yy..bb..', '..............', '..............'],
        ['..............', '......yy..gg..', '..............', '..............']
      ],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(['fly_dock(3)', 'wait_sow("yellow", 1)'], ['pad_hold("R")']),
      loiGiai: B(
        ['fly_dock(3)', 'wait_sow("yellow", 1)', 'go_right()', 'dock()', 'wait_n(6)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 1)'],
        ['pad_hold("R")', 'go_right()', 'go_right()', 'pole_gate()', 'go_right()']
      ),
      sao: { o: 60, nhip: 72 },
      loiSai: [
        { moTa: 'R2 chỉ mở trạm 1 mà quên pole_gate() ở trạm 2: cổng C2 đóng và mẫu màu trống', baiLam: B(['fly_dock(3)', 'wait_sow("yellow", 1)', 'go_right()', 'dock()', 'wait_n(6)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 1)'], ['pad_hold("R")']), phaiCoMa: ['mau-son-sai', 'chua-to-hinh'] },
        { moTa: 'R1 gieo cứng màu đỏ ở trạm 2 thay vì đọc color("down")', baiLam: B(['fly_dock(3)', 'wait_sow("yellow", 1)', 'go_right()', 'dock()', 'wait_n(6)', 'fly_right(2)', 'span_sow("red", 1)', 'wait()'], ['pad_hold("R")', 'go_right()', 'go_right()', 'pole_gate()', 'go_right()']), phaiCoMa: ['chua-to-hinh'], cung: true },
        { moTa: 'R1 bỏ qua dock() ở trạm sạc P2(8,1): hết pin trước khi gieo xong trạm 2', baiLam: B(['fly_dock(3)', 'wait_sow("yellow", 1)', 'go_right()', 'wait_n(8)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 1)'], ['pad_hold("R")', 'go_right()', 'go_right()', 'pole_gate()', 'go_right()']), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Sau pad_hold("R") dừng ở M1(4,2), R2 gọi hai lần go_right() sang (6,2), gọi pole_gate() đưa bao hạt ở (7,2) lên nút M2(8,2) rồi go_right() tránh ra ở nhịp 20.', 'Sau wait_sow("yellow", 1) dừng ở (7,1), R1 gọi go_right() sang P2(8,1), dock() sạc đầy, wait_n(6) hết nhịp 20, đọc c = color("down"), rồi fly_right(2) và span_sow(c, 1).']
    })
  ];

  ManHoc.manDoiChiaHang = DS;
  if (laNode) module.exports = ManHoc;
})();
