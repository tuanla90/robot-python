/* ============================================================================
   man-che-list.js — "Học lập trình": CHƯƠNG `che-list` · CHẾ LỆNH DANH SÁCH (10 màn). Kế hoạch KE-HOACH-LIST-FLYCAM.md (mục 3) + KE-HOACH-CHE-LENH.md (khuôn chương chế lệnh), làm 17/10.
   Chương thứ 16 (ngay sau Danh sách, man-list.js; trước Bánh xích). Robot là XE HAI BÁNH, 4–10 gắn thêm CẢM BIẾN KHOẢNG CÁCH ở hông (front_clear()):
   robot { than: 'hai-banh', tay: null, camBien: [] | [{ ma: 'khoang-cach', o: 'hong' }] }. Xưởng hàm mở, được dùng hàm của em. Hàm của em có sẵn: forward(n), right(k), turn_right, turn_left, u_turn, move…
   Luật thiết kế (như che-xe): lệnh gốc chỉ đổi MỘT trạng thái; DANH SÁCH là thứ người chơi dùng để mang nhiều con số: hàm nhận danh sách (route(steps)) và hàm GHI vào danh sách (seen.append(n)).
   Mục tiêu `bong-mo` cả chương (xe mờ = tư thế cuối của chương trình), chinhCoDinh ở mọi màn trừ 3, 6, 10 (người chơi tự viết chương trình chính). Mỗi lệnh chế được ít nhất hai cách
   và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (hay `baiLam`), kiem-che-list.mjs chạy từng cách.
   cauTruc ['for', 'if', 'while', 'list'] từ màn 4 (có cảm biến; màn 1, 2, 3, 7 chỉ ['for', 'list']); từ màn 4 (có cảm biến) có biến đếm (man.bienDem): khay hiện nhóm ĐẾM (n = 0, n = n + 1, for i in range(n)) và nhóm DANH SÁCH (seen = [1, 2], for n in a:, a.append(1)).

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-list.1 route(steps)      = for n in steps: forward(n); turn_right()    đi theo từng số trong danh sách, hết đoạn nào rẽ phải (kể cả sau đoạn cuối)
     che-list.2 route_left(steps) = for n in steps: forward(n); turn_left()     như route nhưng rẽ trái
     che-list.4 scan(seen)        = n = 0; while front_clear(): move(), n = n + 1; seen.append(n)   đi tới khi trước mặt có tường, GHI số ô đã đi vào danh sách seen
     che-list.5 box(seen)      = for i in range(3): turn_right(); forward(seen[0])  đi nốt ba cạnh còn lại của hình vuông, cạnh dài bằng số đầu tiên đã ghi
   HÀM CỦA MÀN (không vào kho, không có trong Sổ lệnh; `maMau.hamCuaMan`):
     che-list.7 go_out()          khóa, xem được: route([3, 4, 2]); come_back() thân ban đầu `pass`, lời giải turn_right, route_left([2, 4, 3]), turn_left   đi NGƯỢC lại go_out(): đảo thứ tự, đổi hướng rẽ
     che-list.8 scan2(seen)       như scan nhưng seen.append(n) nằm TRONG vòng while (ghi một danh sách số 1, 2, 3…); lời giải kéo dòng ra ngoài vòng
     che-list.9 scan3(seen)       thân ban đầu = scan (while front_clear()), nhưng CẢM BIẾN LẮP NGƯỢC (daoChieu ['cam']); lời giải while not front_clear()

   KHÔNG GIAN: màn 4, 5, 6, 8, 9, 10 là BÃI TRỐNG (không phải hành lang): chỉ có hai ô tường làm mốc ở cuối hai cạnh đầu, nên cảm biến chỉ dừng được xe ở hai cạnh đầu; hai cạnh sau
   nằm giữa bãi trống, xe chỉ biết độ dài của chúng nhờ số đã GHI trong danh sách (lý do thật để ghi lại). ◆ ở ba góc (xe đứng yên không "thắng"); xe mờ ở chỗ xuất phát, hướng như lúc đầu.
   Ba sân khác nhau (man.san là MẢNG 3 sân, batDau và bongMo song song, nhipTheo 'tong'): viết cứng số bước chỉ đúng một sân.

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật (TỔNG ba sân); máy kiểm (kiem-hoc.mjs, kiem-che-list.mjs) dò BFS (do-duong-che-cam-bien.mjs) rằng không có đường tắt (BFS = sao.nhip, hoặc ≤ khi nhipTheoLoiGiai:
   7: lùi / quay đầu một nhịp ngắn hơn lời giải chuẩn). sao.o = ô chương trình + thân các hàm thực sự được gọi (kể cả hàm lồng nhau, mỗi hàm tính một lần).
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-list.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-list.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var FRONT = ['front_clear'];
  var VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_ROUTE = ['for n in steps:', '    forward(n)', '    turn_right()'];
  var T_ROUTE_L = ['for n in steps:', '    forward(n)', '    turn_left()'];
  var T_SCAN = ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'seen.append(n)'];
  var T_BOX = ['for i in range(3):', '    turn_right()', '    forward(seen[0])'];
  function hRoute(than) { return H('route', ['steps'], than || T_ROUTE); }
  function hRouteL(than) { return H('route_left', ['steps'], than || T_ROUTE_L); }
  function hScan(than) { return H('scan', ['seen'], than || T_SCAN); }
  function hBox(than) { return H('box', ['seen'], than || T_BOX); }

  // hàm của màn
  var T_GO_OUT = ['route([3, 4, 2])'];
  var T_COME_BACK_TRONG = ['pass'];                                                       // thân ban đầu của come_back() ở 7: chưa làm gì (lõi hiểu pass), người chơi viết thay nó
  var T_COME_BACK = ['turn_right()', 'route_left([2, 4, 3])', 'turn_left()'];
  var T_SCAN2_SAI = ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', '    seen.append(n)'];     // 8: append nằm trong vòng while
  var T_SCAN2 = T_SCAN.slice();
  var T_SCAN3_CU = T_SCAN.slice();                                                        // 9: chép scan(), chạy sai vì cảm biến lắp ngược
  var T_SCAN3 = ['n = 0', 'while not front_clear():', '    move()', '    n = n + 1', 'seen.append(n)'];

  /**
   * Điền các trường chung của chương. m.cam: true thì xe có cảm biến khoảng cách (front_clear() trên khay, biến đếm).
   * Ba sân (m.san là mảng) thì nhipTheo 'tong' và batDau là mảng song song.
   */
  function man(m) {
    var cam = !!m.cam; delete m.cam;
    m.chuong = 'che-list';
    m.cauTruc = cam ? ['for', 'if', 'while', 'list'] : ['for', 'list'];        // màn chưa có cảm biến (1, 2, 3, 7) không có điều kiện: khay chỉ có for và danh sách
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: null, camBien: cam ? [{ ma: 'khoang-cach', o: 'hong' }] : [] };
    m.hamGoc = nhieu(BANH, cam ? FRONT : []);
    m.mucTieu = 'bong-mo';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (cam) m.bienDem = true;
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /**
   * BÃI TRỐNG W×H cho màn đo bằng cảm biến. Xe đứng ở s = [x, y] quay mặt f (0 lên, 1 phải, 2 xuống, 3 trái); cạnh đầu dài L1 (theo f), rồi quay (trai: true thì rẽ trái, không thì rẽ phải),
   * cạnh hai dài L2. Hai ô tường mốc: ngay sau cuối cạnh đầu (m1) và ngay sau cuối cạnh hai (m2, bỏ nếu moc2 === false). ◆ ở ba góc c1, c2, c3; xe mờ ở s, mặt f.
   * Trả về { san, batDau, bongMo }. Kiểm: mọi ô trong sân; ở hai cạnh sau, ô ngay sau chỗ dừng cũng nằm trong sân và trống (cảm biến không tự dừng xe ở đó).
   */
  function PHONG(W, H, s, f, L1, L2, trai, moc2) {
    var d2 = trai ? (f + 3) % 4 : (f + 1) % 4;
    var cong = function (p, v, k) { return [p[0] + v[0] * k, p[1] + v[1] * k]; };
    var c1 = cong(s, VEC[f], L1), c2 = cong(c1, VEC[d2], L2), c3 = cong(s, VEC[d2], L2);
    var m1 = cong(s, VEC[f], L1 + 1), m2 = cong(c1, VEC[d2], L2 + 1);
    var moc = [m1].concat(moc2 === false ? [] : [m2]);
    var dsO = [s, c1, c2, c3].concat(moc);
    dsO.forEach(function (p) { if (p[0] < 0 || p[1] < 0 || p[0] >= W || p[1] >= H) throw new Error('PHONG: ô (' + p + ') ngoài sân ' + W + '×' + H); });
    var g = []; for (var y = 0; y < H; y++) { var r = []; for (var x = 0; x < W; x++) r.push('.'); g.push(r); }
    moc.forEach(function (p) { g[p[1]][p[0]] = '#'; });
    return {
      san: g.map(function (r) { return r.join(''); }),
      batDau: { x: s[0], y: s[1], huong: f },
      bongMo: { x: s[0], y: s[1], huong: f, diQua: [c1, c2, c3].map(function (p) { return { x: p[0], y: p[1] }; }) }
    };
  }
  function bo(ds) {                       // gom mảng kết quả PHONG thành ba mảng song song
    return { san: ds.map(function (p) { return p.san; }), batDau: ds.map(function (p) { return p.batDau; }), bongMo: ds.map(function (p) { return p.bongMo; }) };
  }

  /* ------------------------------------------------------------------- sân */
  // 1: ba đoạn 3 - 2 - 4, rẽ phải sau mỗi đoạn (kể cả đoạn cuối): xe ở (1,0) quay phải; xe mờ ở (0,2) quay LÊN
  var SAN_1 = ['#....', '####.', '.....'];
  // 2: ba đoạn 2 - 4 - 3, rẽ trái sau mỗi đoạn: xe ở (4,2) quay lên; xe mờ ở (0,3) quay phải
  var SAN_2 = ['.....', '.###.', '.###.', '.####'];
  // 3: chữ S: 4 - 2 (rẽ phải) rồi 3 - 2 (rẽ trái): xe ở (0,0) quay phải; xe mờ ở (1,4) quay phải
  var SAN_3 = ['.....', '####.', '#....', '#.###', '#.###'];
  // 4: ba bãi 7×7, xe quay phải; cạnh (rộng × cao) 4×2, 2×3, 3×4
  var P4 = bo([PHONG(7, 7, [1, 1], 1, 4, 2), PHONG(7, 7, [2, 1], 1, 2, 3), PHONG(7, 7, [1, 1], 1, 3, 4)]);
  // 5: ba bãi hình vuông cạnh 2, 3, 4 (chỉ có MỘT ô tường mốc, ở cuối cạnh đầu); xe quay phải
  var P5 = bo([PHONG(7, 7, [3, 1], 1, 2, 2, false, false), PHONG(7, 7, [2, 2], 1, 3, 3, false, false), PHONG(7, 7, [1, 1], 1, 4, 4, false, false)]);
  P5.bongMo.forEach(function (b) { b.huong = (b.huong + 3) % 4; });                         // ba lần quay phải sau cạnh đầu: xe về chỗ cũ nhưng quay mặt LÊN
  // 6: ba bãi: vuông 3×3, chữ nhật 4×2, chữ nhật 2×4
  var P6 = bo([PHONG(7, 7, [2, 1], 1, 3, 3), PHONG(7, 7, [1, 2], 1, 4, 2), PHONG(7, 7, [3, 1], 1, 2, 4)]);
  // 7: đường về: go_out() đi 3 - 4 - 2 (rẽ phải): xe ở (0,0) quay phải; ◆ ở chỗ go_out() dừng (1,4); xe mờ ở chỗ cũ
  var SAN_7 = ['....', '###.', '###.', '###.', '#...'];
  // 8: ba bãi: 3×2, 2×3, 4×1
  var P8 = bo([PHONG(7, 7, [1, 1], 1, 3, 2), PHONG(7, 7, [2, 1], 1, 2, 3), PHONG(7, 7, [1, 2], 1, 4, 1)]);
  // 9: ba bãi: 2×2, 4×3, 3×1
  var P9 = bo([PHONG(7, 7, [2, 1], 1, 2, 2), PHONG(7, 7, [1, 1], 1, 4, 3), PHONG(7, 7, [2, 2], 1, 3, 1)]);
  // 10: ba bãi, xe quay xuống / sang trái / lên, quay TRÁI hai lần (đo cạnh đầu theo hướng xe, rồi cạnh bên trái); cạnh 3×3, 3×2, 2×3
  var P10 = bo([PHONG(7, 7, [1, 1], 2, 3, 3, true), PHONG(7, 7, [5, 1], 3, 3, 2, true), PHONG(7, 7, [5, 5], 0, 2, 3, true)]);

  var C_1 = ['route([3, 2, 4])'];
  var C_2 = ['route_left([2, 4, 3])'];
  var L_3 = ['route([4, 2])', 'route_left([3, 2])'];
  function CHINH_DO(ten, re, hoi) { return ['seen = []', ten + '(seen)', re, ten + '(seen)', re, hoi || 'route(seen)']; }
  var C_4 = CHINH_DO('scan', 'turn_right()');
  var C_5 = ['seen = []', 'scan(seen)', 'box(seen)'];
  var L_6 = ['a = []', 'scan(a)', 'turn_right()', 'scan(a)', 'turn_right()', 'route(a)'];
  var C_7 = ['go_out()', 'come_back()'];
  var C_8 = CHINH_DO('scan2', 'turn_right()');
  var C_9 = CHINH_DO('scan3', 'turn_right()');
  var L_10 = ['a = []', 'scan(a)', 'turn_left()', 'scan(a)', 'turn_left()', 'route_left(a)'];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Đi theo danh sách', hang: 'lam-quen', taoHam: ['route'], hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Chương trình chính chỉ gọi route([3, 2, 4]). Em tự chế lệnh route(steps): xe đi theo từng số trong danh sách steps, hết đoạn nào thì rẽ phải, rồi dừng đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi route([3, 2, 4]). Mở Xưởng hàm, tạo route có đối số steps rồi bấm Chạy.',
      san: SAN_1,
      batDau: { x: 1, y: 0, huong: 1 },
      bongMo: { x: 0, y: 2, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 11, nhip: 12 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [hRoute()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [hRoute(nhieu(['# mỗi số là một đoạn'], T_ROUTE))]
      },
      congThucKhac: [
        { moTa: 'Duyệt theo chỉ số: range(len(steps)) và steps[i]', hamCuaEmMoi: [hRoute(['for i in range(len(steps)):', '    forward(steps[i])', '    turn_right()'])] },
        { moTa: 'Không gọi forward(): tiến từng ô bằng một vòng for lồng bên trong', hamCuaEmMoi: [hRoute(['for n in steps:', '    for i in range(n):', '        move()', '    turn_right()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi route() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không rẽ sau mỗi đoạn: xe đi thẳng và đâm tường', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hRoute(['for n in steps:', '    forward(n)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Rẽ trái thay cho rẽ phải: xe đâm tường', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hRoute(T_ROUTE_L)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Rẽ trước rồi mới tiến: xe quay mặt vào tường', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hRoute(['for n in steps:', '    turn_right()', '    forward(n)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ đi đoạn đầu tiên: forward(steps[0]) rồi rẽ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hRoute(['forward(steps[0])', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đưa cả danh sách vào forward(): forward() cần một số', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hRoute(['forward(steps)', 'turn_right()'])], phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['steps là cả danh sách các đoạn. Vòng for n in steps: lấy từng đoạn ra làm n.',
        'Xe mờ quay mặt lên: sau đoạn cuối xe vẫn phải rẽ phải một lần nữa.']
    }),

    man({
      so: 2, ten: 'Danh sách rẽ trái', hang: 'lam-quen', taoHam: ['route_left'], hamCuaEmCan: ['forward', 'turn_left'],
      deBai: 'Chương trình chính chỉ gọi route_left([2, 4, 3]). Em tự chế lệnh route_left(steps): giống route() nhưng hết mỗi đoạn xe rẽ trái, để dừng đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi route_left([2, 4, 3]). Mở Xưởng hàm, tạo route_left có đối số steps rồi bấm Chạy.',
      san: SAN_2,
      batDau: { x: 4, y: 2, huong: 0 },
      bongMo: { x: 0, y: 3, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 11, nhip: 12 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [hRouteL()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [hRouteL(nhieu(['# rẽ trái sau mỗi đoạn'], T_ROUTE_L))]
      },
      congThucKhac: [
        { moTa: 'Rẽ trái bằng right(3): quay phải ba lần', hamCuaEmMoi: [hRouteL(['for n in steps:', '    forward(n)', '    right(3)'])] },
        { moTa: 'Duyệt theo chỉ số: range(len(steps)) và steps[i]', hamCuaEmMoi: [hRouteL(['for i in range(len(steps)):', '    forward(steps[i])', '    turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi route_left() mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Dùng nhầm turn_right(): xe đâm tường ngay khúc rẽ đầu', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hRouteL(T_ROUTE)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không rẽ sau mỗi đoạn: xe đi thẳng và đâm tường', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hRouteL(['for n in steps:', '    forward(n)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Rẽ trái trước rồi mới tiến: xe quay mặt vào tường', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hRouteL(['for n in steps:', '    turn_left()', '    forward(n)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lặp cố định ba lần forward(2): mọi đoạn đều dài 2 ô', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hRouteL(['for i in range(3):', '    forward(2)', '    turn_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Giống route() ở màn trước, chỉ đổi hướng rẽ.',
        'Sau đoạn cuối xe vẫn rẽ trái một lần nữa, nên xe mờ mới quay mặt sang phải.']
    }),

    man({
      so: 3, ten: 'Đường chữ S', hang: 'lam-quen', hamCuaEmCan: ['route', 'route_left'],
      deBai: 'Xe mờ nằm ở cuối một đường chữ S: bốn đoạn dài 4, 2, 3 và 2 ô. Hai đoạn đầu rẽ phải, hai đoạn sau rẽ trái. Tự viết chương trình chính, dùng route() và route_left() em đã chế.',
      veMaMau: 'Chương trình chính còn trống. Mỗi lệnh em chế nhận một danh sách các đoạn; nhớ lệnh nào cũng rẽ thêm một lần sau đoạn cuối.',
      san: SAN_3,
      batDau: { x: 0, y: 0, huong: 1 },
      bongMo: { x: 1, y: 4, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 17, nhip: 15 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Ghi hai danh sách rồi truyền tên vào hai lệnh',
        baiLam: { chinh: ['a = [4, 2]', 'b = [3, 2]', 'route(a)', 'route_left(b)'] }
      },
      congThucKhac: [
        { moTa: 'Không dùng route(): forward() và rẽ từng dòng', baiLam: { chinh: ['forward(4)', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)', 'turn_left()'] } },
        { moTa: 'route() cho hai đoạn đầu, rồi route_left() một đoạn và forward() đoạn cuối', baiLam: { chinh: ['route([4, 2])', 'route_left([3])', 'forward(2)', 'turn_left()'] } }
      ],
      loiSai: [
        { moTa: 'Dùng route() cho cả bốn đoạn: xe rẽ phải suốt nên đâm tường', baiLam: { chinh: ['route([4, 2, 3, 2])'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi route_left() trước, route() sau: xe rẽ nhầm hướng ngay đoạn đầu', baiLam: { chinh: ['route_left([3, 2])', 'route([4, 2])'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Danh sách của route_left() thiếu đoạn cuối: xe dừng giữa đường', baiLam: { chinh: ['route([4, 2])', 'route_left([3])'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo thứ tự các số trong route(): [2, 4] thay cho [4, 2]', baiLam: { chinh: ['route([2, 4])', 'route_left([3, 2])'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Chia đường thành hai phần: các đoạn xe rẽ phải rồi các đoạn xe rẽ trái. Mỗi phần là một lần gọi.',
        'Đếm số ô của từng đoạn từ chỗ xe đứng, theo đúng thứ tự xe đi.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Đo một cạnh', hang: 'luyen', cam: true, taoHam: ['scan'], hamCuaEmCan: ['route', 'turn_right', 'move'],
      deBai: 'Ba bãi trống khác nhau. Xe đo hai cạnh đầu bằng cảm biến, ghi vào danh sách seen, rồi đi nốt hai cạnh sau theo số đã ghi. Em tự chế lệnh scan(seen): đi tới khi trước mặt có tường, ghi số ô đã đi vào seen.',
      veMaMau: 'Chương trình chính bị khóa: scan(seen) hai lần, rồi route(seen). Mở Xưởng hàm, tạo scan có đối số seen rồi bấm Chạy.',
      san: P4.san, batDau: P4.batDau, bongMo: P4.bongMo,
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 21, nhip: 48 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [hScan()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [hScan(nhieu(['# đếm ô tới tường rồi ghi lại'], T_SCAN))]
      },
      congThucKhac: [
        { moTa: 'Đếm trước khi đi: n = n + 1 đặt trước move()', hamCuaEmMoi: [hScan(['n = 0', 'while front_clear():', '    n = n + 1', '    move()', 'seen.append(n)'])] },
        { moTa: 'Đi mỗi ô bằng forward(1) thay cho move()', hamCuaEmMoi: [hScan(['n = 0', 'while front_clear():', '    forward(1)', '    n = n + 1', 'seen.append(n)'])] }
      ],
      loiSai: [
        { moTa: 'Gọi scan() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đi tới tường nhưng quên ghi vào danh sách: route(seen) không có gì để đi, xe đứng ở góc', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hScan(['n = 0', 'while front_clear():', '    move()', '    n = n + 1'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Ghi n trước khi đếm: n vẫn bằng 0', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hScan(['n = 0', 'seen.append(n)', 'while front_clear():', '    move()', '    n = n + 1'])], phaiCoMa: ['lech-bong-mo', 'chua-qua-diem'] },
        { moTa: 'Ghi n trong vòng while: danh sách có thêm nhiều số, đi sai cạnh', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hScan(['n = 0', 'while front_clear():', '    move()', '    n = n + 1', '    seen.append(n)'])], phaiCoMa: ['lech-bong-mo', 'chua-qua-diem'] },
        { moTa: 'Không đếm: ghi cố định số 3 cho mọi cạnh', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hScan(['while front_clear():', '    move()', 'seen.append(3)'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Biến đếm n tăng một mỗi ô xe đi thêm. Khi hết đường, n là độ dài cạnh.',
        'Danh sách seen do chương trình chính đưa vào: chỉ việc thêm n vào cuối nó.']
    }),

    man({
      so: 5, ten: 'Hình vuông', hang: 'luyen', cam: true, taoHam: ['box'], hamCuaEmCan: ['scan', 'turn_right', 'forward'],
      deBai: 'Ba bãi trống hình vuông. Xe đo cạnh đầu bằng cảm biến rồi ghi vào seen. Em tự chế lệnh box(seen): đi nốt ba cạnh còn lại, mỗi cạnh dài bằng số đầu tiên trong seen, để về đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: scan(seen) rồi box(seen). Mở Xưởng hàm, tạo box có đối số seen rồi bấm Chạy.',
      san: P5.san, batDau: P5.batDau, bongMo: P5.bongMo,
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 18, nhip: 45 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [hBox()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [hBox(nhieu(['# cạnh dài bằng số đầu tiên'], T_BOX))]
      },
      congThucKhac: [
        { moTa: 'Không dùng vòng for: viết thẳng ba lần rẽ phải và đi', hamCuaEmMoi: [hBox(['turn_right()', 'forward(seen[0])', 'turn_right()', 'forward(seen[0])', 'turn_right()', 'forward(seen[0])'])] },
        { moTa: 'Quay phải bằng right(1) thay cho turn_right()', hamCuaEmMoi: [hBox(['for i in range(3):', '    right(1)', '    forward(seen[0])'])] }
      ],
      loiSai: [
        { moTa: 'Gọi box() mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên quay: xe cứ đi thẳng theo hướng cũ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBox(['for i in range(3):', '    forward(seen[0])'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ đi hai cạnh (lặp hai lần): xe dừng giữa bãi', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBox(['for i in range(2):', '    turn_right()', '    forward(seen[0])'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lặp bốn lần: xe đi dư một cạnh rồi quay mặt sai hướng', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBox(['for i in range(4):', '    turn_right()', '    forward(seen[0])'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đưa cả danh sách vào forward(): forward() cần một số', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBox(['for i in range(3):', '    turn_right()', '    forward(seen)'])], phaiCoMa: ['loi-chay'] },
        { moTa: 'Đi cố định 3 ô mỗi cạnh: chỉ đúng với bãi vuông cạnh 3', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hBox(['for i in range(3):', '    turn_right()', '    forward(3)'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cạnh đầu đã đo và ghi ở vị trí đầu tiên của seen. Hình vuông thì mọi cạnh dài bằng nhau.',
        'Mỗi cạnh còn lại gồm hai việc: quay phải, rồi đi đúng bấy nhiêu ô.']
    }),

    man({
      so: 6, ten: 'Bãi chữ nhật', hang: 'luyen', cam: true, hamCuaEmCan: ['scan', 'route', 'turn_right'],
      deBai: 'Ba bãi trống: một hình vuông và hai hình chữ nhật. Tự viết chương trình chính: đo hai cạnh đầu, ghi vào một danh sách rồi đi nốt hai cạnh sau, về đúng chỗ xe mờ. Dùng scan() và route() em đã chế.',
      veMaMau: 'Chương trình chính còn trống. Muốn một danh sách rỗng, chèn khối danh sách rồi bỏ hết các ô trong ngoặc.',
      san: P6.san, batDau: P6.batDau, bongMo: P6.bongMo,
      maMau: { chinh: [] },
      sao: { o: 21, nhip: 48 },
      loiGiai: { chinh: L_6.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích',
        baiLam: { chinh: ['a = []', '# đo hai cạnh đầu', 'scan(a)', 'turn_right()', 'scan(a)', 'turn_right()', 'route(a)'] }
      },
      congThucKhac: [
        { moTa: 'Đo hai cạnh đầu bằng vòng for', baiLam: { chinh: ['a = []', 'for i in range(2):', '    scan(a)', '    turn_right()', 'route(a)'] } }
      ],
      loiSai: [
        { moTa: 'Quên khai báo danh sách: scan(a) không có a', baiLam: { chinh: ['scan(a)', 'turn_right()', 'scan(a)', 'turn_right()', 'route(a)'] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Chỉ đo một cạnh rồi route(a): danh sách chỉ có một số nên xe đi một cạnh rồi dừng giữa bãi', baiLam: { chinh: ['a = []', 'scan(a)', 'turn_right()', 'route(a)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không route(a): đo bốn lần cả bốn cạnh, hai cạnh sau cảm biến không dừng đúng chỗ', baiLam: { chinh: ['a = []', 'for i in range(4):', '    scan(a)', '    turn_right()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên quay giữa hai lần đo: xe đo lại cạnh cũ, chỉ ghi một số', baiLam: { chinh: ['a = []', 'scan(a)', 'scan(a)', 'turn_right()', 'route(a)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ đi route(a) mà chưa đo gì: danh sách rỗng, xe đứng yên ở chỗ cũ, chưa qua ◆', baiLam: { chinh: ['a = []', 'route(a)'] }, phaiCoMa: ['chua-qua-diem'] }
      ],
      goiY: ['Hai cạnh sau dài bằng hai cạnh đầu, theo đúng thứ tự đó. Danh sách ghi lại cả hai số.',
        'Sau mỗi lần đo xe còn phải quay phải, ở cả hai cạnh đầu.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về', hang: 'bien-the', nhipTheoLoiGiai: true, hamCuaEmCan: ['route', 'route_left', 'turn_right', 'turn_left'],
      deBai: 'Hàm go_out() của màn đưa xe đi qua ba đoạn dài 3, 4 và 2 ô rồi tới điểm ◆, nó bị khóa. Viết thân hàm come_back() của màn để xe quay về đúng chỗ cũ, mặt quay như lúc đầu.',
      veMaMau: 'Chương trình chính bị khóa: go_out() rồi come_back(). Hàm go_out() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm come_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó.',
      san: SAN_7,
      batDau: { x: 0, y: 0, huong: 1 },
      bongMo: { x: 0, y: 0, huong: 1, diQua: [{ x: 1, y: 4 }] },       // ◆ ở chỗ go_out() dừng: chương trình rỗng hay go_out() hỏng không qua ◆, không thể "thắng" chỉ vì xe còn nguyên chỗ cũ
      chinhCoDinh: true, khoaHamMan: ['go_out'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], T_COME_BACK_TRONG)] },
      sao: { o: 21, nhip: 26 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], T_COME_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], nhieu(['# đi ngược lại go_out()'], T_COME_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Viết thẳng từng lệnh, không dùng route_left()', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], ['turn_right()', 'forward(2)', 'turn_left()', 'forward(4)', 'turn_left()', 'forward(3)', 'turn_left()', 'turn_left()'])] } },
        { moTa: 'Ghi danh sách đã đảo thứ tự rồi truyền tên vào route_left()', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], ['a = [2, 4, 3]', 'turn_right()', 'route_left(a)', 'turn_left()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe vẫn đứng ở điểm ◆, chưa về nhà', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], T_COME_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không đảo thứ tự: route_left([3, 4, 2]) đi quá xa và đâm tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], ['turn_right()', 'route_left([3, 4, 2])', 'turn_left()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo thứ tự nhưng vẫn route() rẽ phải: xe đâm tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], ['turn_right()', 'route([2, 4, 3])', 'turn_left()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Về đúng chỗ nhưng quên quay lại hướng cũ: xe quay mặt xuống', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], ['turn_right()', 'route_left([2, 4, 3])'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên quay mặt trước khi đi: xe đâm tường ngay đoạn đầu', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], ['route_left([2, 4, 3])', 'turn_left()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm come_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Đi ngược lại go_out(): đoạn cuối của nó là đoạn đầu của đường về, và mỗi khúc rẽ phải thành rẽ trái.',
        'go_out() dừng quay mặt lên. Muốn đi ngược đoạn cuối, xe phải quay mặt về phía đã tới.']
    }),

    man({
      so: 8, ten: 'Ghi sai chỗ', hang: 'bien-the', cam: true, hamCuaEmCan: ['route', 'turn_right', 'move'],
      deBai: 'Hàm scan2(seen) của màn ghi nhầm: danh sách seen có thêm nhiều số thừa nên xe đi sai hai cạnh sau. Sửa thân hàm scan2 để xe về đúng chỗ xe mờ ở cả ba bãi.',
      veMaMau: 'Chương trình chính bị khóa: scan2(seen) hai lần, rồi route(seen). Chạy thử, xem xe đi sai ở đâu rồi sửa thân hàm scan2 của màn.',
      san: P8.san, batDau: P8.batDau, bongMo: P8.bongMo,
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('scan2', ['seen'], T_SCAN2_SAI)] },
      sao: { o: 21, nhip: 42 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('scan2', ['seen'], T_SCAN2)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan2', ['seen'], nhieu(['# ghi một lần, sau khi đếm xong'], T_SCAN2))] }
      },
      congThucKhac: [
        { moTa: 'Đếm trước khi đi (n = n + 1 trước move()), ghi sau vòng while', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan2', ['seen'], ['n = 0', 'while front_clear():', '    n = n + 1', '    move()', 'seen.append(n)'])] } }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: seen có thêm các số 1, 2, 3… nên route(seen) đi sai', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan2', ['seen'], T_SCAN2_SAI)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa dòng ghi: danh sách rỗng, route(seen) không đi đâu', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan2', ['seen'], ['n = 0', 'while front_clear():', '    move()', '    n = n + 1'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Kéo dòng ghi lên trên vòng while: ghi n khi còn bằng 0', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan2', ['seen'], ['n = 0', 'seen.append(n)', 'while front_clear():', '    move()', '    n = n + 1'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Ghi cố định số 1 sau vòng while: mọi cạnh đều bị ghi là 1', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan2', ['seen'], ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'seen.append(1)'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm scan2() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_8.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Chạy thử rồi nhìn danh sách seen: có đúng hai số, mỗi cạnh một số không?',
        'Dòng seen.append(n) đang nằm trong vòng while nên chạy sau mỗi ô. Nó chỉ cần chạy một lần, khi xe đã đi hết cạnh.']
    }),

    man({
      so: 9, ten: 'Cảm biến lắp ngược', hang: 'bien-the', cam: true, daoChieu: ['cam'], canhBao: 'Cảm biến lắp ngược', hamCuaEmCan: ['route', 'turn_right', 'move'],
      deBai: 'Cảm biến lắp ngược: front_clear() trả lời ngược lại, trước mặt trống thì báo False. Hàm scan3(seen) của màn chép từ scan() nên chạy sai. Sửa nó để xe về đúng chỗ xe mờ ở cả ba bãi.',
      veMaMau: 'Chương trình chính bị khóa: scan3(seen) hai lần, rồi route(seen). Chạy thử, xem xe dừng ở đâu rồi sửa thân hàm scan3 của màn.',
      san: P9.san, batDau: P9.batDau, bongMo: P9.bongMo,
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('scan3', ['seen'], T_SCAN3_CU)] },
      sao: { o: 21, nhip: 42 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('scan3', ['seen'], T_SCAN3)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('scan3', ['seen'], nhieu(['# cảm biến lắp ngược nên có not'], T_SCAN3))] }
      },
      congThucKhac: [
        { moTa: 'Đếm trước khi đi (n = n + 1 trước move())', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('scan3', ['seen'], ['n = 0', 'while not front_clear():', '    n = n + 1', '    move()', 'seen.append(n)'])] } }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: cảm biến báo ngược nên xe đứng yên, ghi toàn số 0', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('scan3', ['seen'], T_SCAN3_CU)] }, phaiCoMa: ['chua-qua-diem', 'cam-bien-nguoc'] },
        { moTa: 'Thêm not vào cả hai chỗ: front_clear() và dòng while đều đảo', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('scan3', ['seen'], ['n = 0', 'while not not front_clear():', '    move()', '    n = n + 1', 'seen.append(n)'])] }, phaiCoMa: ['chua-qua-diem', 'cam-bien-nguoc'] },
        { moTa: 'Có not nhưng quên ghi vào danh sách: route(seen) không có gì để đi', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('scan3', ['seen'], ['n = 0', 'while not front_clear():', '    move()', '    n = n + 1'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Có not nhưng ghi trong vòng while: danh sách thừa số', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('scan3', ['seen'], ['n = 0', 'while not front_clear():', '    move()', '    n = n + 1', '    seen.append(n)'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm scan3() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Cảm biến báo ngược: lúc trước mặt trống nó nói False. Điều kiện while cần nói ngược lại.',
        'Thêm not trước front_clear() để đảo lại câu trả lời.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Bãi đo xoay chiều', hang: 'trum', cam: true, gioiHanHam: 3, hamCuaEmCan: ['scan', 'route_left', 'turn_left'],
      huyHieu: { ma: 'che-list', ten: 'Huy hiệu Chế lệnh danh sách' },
      deBai: 'Ba bãi trống, xe đứng quay ba hướng khác nhau và lần này cạnh bên trái mới là cạnh thứ hai. Tự viết chương trình chính: đo hai cạnh đầu, ghi lại, đi nốt hai cạnh sau về chỗ xe mờ. Em chỉ được gọi tối đa 3 hàm của em khác nhau.',
      veMaMau: 'Chương trình chính còn trống. Rẽ trái hay rẽ phải đều tính theo hướng xe đang quay mặt, không theo màn hình.',
      san: P10.san, batDau: P10.batDau, bongMo: P10.bongMo,
      maMau: { chinh: [] },
      sao: { o: 21, nhip: 44 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích',
        baiLam: { chinh: ['a = []', '# rẽ trái, tính theo xe', 'scan(a)', 'turn_left()', 'scan(a)', 'turn_left()', 'route_left(a)'] }
      },
      congThucKhac: [
        { moTa: 'Đo hai cạnh đầu bằng vòng for', baiLam: { chinh: ['a = []', 'for i in range(2):', '    scan(a)', '    turn_left()', 'route_left(a)'] } }
      ],
      loiSai: [
        { moTa: 'Rẽ phải thay cho rẽ trái: xe đo nhầm cạnh, đi ra ngoài đường của ◆', baiLam: { chinh: ['a = []', 'scan(a)', 'turn_right()', 'scan(a)', 'turn_right()', 'route(a)'] }, phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Quên khai báo danh sách: scan(a) không có a', baiLam: { chinh: ['scan(a)', 'turn_left()', 'scan(a)', 'turn_left()', 'route_left(a)'] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Đo hai cạnh đầu xong đi bằng route() thay cho route_left(): xe rẽ nhầm sang phải', baiLam: { chinh: ['a = []', 'scan(a)', 'turn_left()', 'scan(a)', 'turn_left()', 'route(a)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ đo cạnh đầu rồi route_left(a): danh sách chỉ có một số nên xe đi một cạnh rồi dừng giữa bãi', baiLam: { chinh: ['a = []', 'scan(a)', 'turn_left()', 'route_left(a)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi 4 hàm khác nhau (scan, turn_left, route_left, forward): vượt giới hạn 3 hàm', baiLam: { chinh: ['a = []', 'scan(a)', 'turn_left()', 'scan(a)', 'turn_left()', 'route_left(a)', 'forward(1)'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Quay trái hai lần giữa hai lần đo, vì xe đo cạnh phía trước rồi cạnh bên trái.',
        'Hai cạnh sau cũng rẽ trái: danh sách ghi cạnh nào trước thì route_left() đi cạnh đó trước.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
