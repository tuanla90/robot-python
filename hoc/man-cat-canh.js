/* ============================================================================
   man-cat-canh.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 1 "Cất cánh" (KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 29/10).
   Khung mùa 4 (lo-trinh-hoc.js, khối "MÙA 4 = 10 GÓI", mảng MUA_4) xếp màn: dòng chương trong MUA_4 khai ĐỦ thứ tự 10 màn (có sẵn xen màn mới).
     - `drone`: chương 1 "Bay lần đầu": màn mới khai so từ 11 (drone.1 … drone.10 đã có). Thứ tự: 11 (trình diễn) · 1 · 2 · 12 · 3 · 13 · 7 · 8 · 9 · 14 (trùm).
       Cái mới của gói: em lắp R1 vào THÂN DRONE: bay 4 hướng, mỗi ô một nhịp, bay qua dải phân cách (hàng rào =), pin ít (gốc: chưa đáp đất sạc được,
       ô sạc P mở ở gói 5 Trạm sạc). Ôn mùa 1–3: for, hàm của em go / walk (chuỗi, mùa 3), nam châm treo (mùa 3).
     - `list`: chương 2 "Lập danh sách" (10 màn có sẵn list.1 … list.10).
   Mỗi màn khai `chuong` và `so`; mã `ma` = chuong + '.' + so là khóa lưu sao, KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có.
   Luật drone (san-hoc.js phần DRONE): go_* bay đúng 1 ô, 1 nhịp, không cần wait(); bay qua rào, băng chuyền, vật nằm đất; không qua tường #.
   Pin (màn khai pin): mỗi nhịp tốn 1 pin, về 0 mà chưa tới đích là hết pin. Màn chỉ bay: pin 5–6 (user 29/10).
   Máy kiểm: hoc/kiem-man-mua-4.mjs (chấm từng màn mới), hoc/kiem-lo-trinh.mjs mục mùa 4.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các dòng `than` `n` lần. */
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function W(chuoi) { return 'walk("' + chuoi + '")'; }

  /** Màn chương drone (thân drone nguyên bản, chưa gắn tay hay cảm biến). */
  function man(m) {
    m.chuong = m.chuong || 'drone';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: null, camBien: [] };
    m.hamGoc = m.hamGoc || BAY.slice();
    m.mucTieu = 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  /** Màn chương list (Python A danh sách) chạy trên thân drone của mùa 4. */
  function manList(m) {
    m.chuong = 'list';
    m.cauTruc = ['for', 'list'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: null, camBien: [] };
    m.hamGoc = BAY.slice();
    m.mucTieu = 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }
  /** for n in a: fly_right(n), go_down() (2 dòng thân). */
  function DUYET(ds) { return ['for n in ' + ds + ':', '    fly_right(n)', '    go_down()']; }
  var T_FLY_RIGHT = ['for i in range(n):', '    go_right()'];
  var H_TOUR = H('tour', ['steps'], ['for n in steps:', '    fly_right(n)', '    go_down()']);
  var H_TOUR_LEFT = H('tour_left', ['steps'], ['for n in steps:', '    for i in range(n):', '        go_left()', '    go_down()']);

  var DS = [
    man({
      so: 11, ten: 'Drone cất cánh', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Em lắp bộ não R1 vào thân drone. Drone bay trên cao: go_right() bay sang phải một ô, mất một nhịp, không cần wait(). ' +
        'Dải phân cách (=) thấp nên drone bay qua được, xe thì không. Bấm Chạy xem drone bay qua phố tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, xem drone bay thẳng qua hai dải phân cách.',
      san: ['.=.=.F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(LAP(5, 'go_right()')),
      loiGiai: bai(LAP(5, 'go_right()')),
      sao: { o: 2, nhip: 5 },
      goiY: ['Mỗi lệnh go_*() bay đúng một ô, mất một nhịp.', 'Dải phân cách chắn xe, nhưng drone bay qua được.']
    }),

    man({
      so: 12, ten: 'Bay thẳng qua phố', hang: 'luyen',
      deBai: 'Hai dãy nhà cao (#) kẹp một con phố có dải phân cách. Xe phải chạy vòng, còn drone bay thẳng qua dải phân cách là tới cờ. ' +
        'Tìm đường bay ít nhịp nhất.',
      veMaMau: 'Chương trình có sẵn cho drone bay vòng xuống phố dưới như một chiếc xe, và còn dừng giữa đường. Chạy thử, rồi sửa để bay thẳng.',
      san: ['.###.', '.===F', '.###.', '.....'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai([W('DDRR')]),
      loiGiai: bai([W('RRRR')]),
      sao: { o: 11, nhip: 4 },
      loiGiaiKhac: { moTa: 'Bay vòng xuống phố dưới như xe: tới cờ nhưng nhiều nhịp hơn', baiLam: bai([W('DDRRRRUU')]) },
      loiSai: [
        { moTa: 'Bay lên dãy nhà phía trên: drone đâm tường cao', baiLam: bai([W('URRRR')]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thiếu một ô: drone dừng ngay trước cờ', baiLam: bai([W('RRR')]), phaiCoMa: ['chua-toi-co'] }
      ],
      hamCuaEmCan: ['go', 'walk'],
      goiY: ['Dải phân cách (=) không chắn drone.', 'Đường thẳng sang phải là đường ngắn nhất: walk("RRRR").']
    }),

    man({
      so: 13, ten: 'Pin vừa đủ', hang: 'luyen', pin: 6,
      deBai: 'Pin của drone chỉ đủ 6 nhịp bay. Cột bên trái cụt ở trên, cột có dải phân cách thì thông lên tầng thượng. ' +
        'Bay qua dải phân cách để tới cờ, đừng bay thừa ô nào kẻo hết pin.',
      veMaMau: 'Chương trình có sẵn bay thẳng lên ở cột trái. Chạy thử: cột trái cụt, drone đâm tường.',
      san: ['#..F', '.=##', '.=##', '..##'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: bai(nhieu(LAP(3, 'go_up()'), LAP(3, 'go_right()'))),
      loiGiai: bai(nhieu(['go_right()'], LAP(3, 'go_up()'), LAP(2, 'go_right()'))),
      sao: { o: 5, nhip: 6 },
      loiGiaiKhac: { moTa: 'Viết từng lệnh, không dùng vòng lặp', baiLam: bai(['go_right()', 'go_up()', 'go_up()', 'go_up()', 'go_right()', 'go_right()']) },
      loiSai: [
        { moTa: 'Bay thừa: lên rồi xuống lại một ô, tới đỉnh cột thì đã hết 6 vạch pin', baiLam: bai(['go_right()', 'go_up()', 'go_down()', 'go_up()', 'go_up()', 'go_up()', 'go_right()', 'go_right()']), phaiCoMa: ['het-pin'] },
        { moTa: 'Sang phải hai ô trước: drone đâm vào dãy nhà', baiLam: bai(nhieu(LAP(2, 'go_right()'), LAP(3, 'go_up()'))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đếm số ô của từng đường: đường nào không quá 6 ô?', 'Sang phải một ô cho tới cột có dải phân cách, rồi bay thẳng lên.']
    }),

    man({
      so: 14, ten: 'Bay vòng vườn hoa', hang: 'trum', pin: 12, hamCuaEmCan: ['fly_right', 'go', 'walk'],
      deBai: 'Cánh cửa đóng (C) ở giữa dãy bụi cây chắn lối tắt. Drone phải bay sang phải năm ô ở hàng trên, hạ xuống hai ô qua hố ở đầu phải, ' +
        'rồi bay sang trái năm ô ở hàng dưới tới cờ. Pin vừa đủ 12 nhịp bay.',
      veMaMau: 'Chương trình có sẵn mới bay hết hàng trên và xuống một ô. Hạ thêm một ô nữa rồi bay sang trái năm ô tới cờ.',
      san: ['.=..>.', '###C#u', 'F.<.=.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['fly_right(5)', 'go_down()']),
      loiGiai: bai(nhieu(['fly_right(5)', 'go_down()', 'go_down()'], LAP(5, 'go_left()'))),
      sao: { o: 7, nhip: 12 },
      loiGiaiKhac: { moTa: 'Bay sang trái bằng walk("LLLLL") thay cho vòng lặp', baiLam: bai(['fly_right(5)', 'go_down()', 'go_down()', W('LLLLL')]) },
      loiSai: [
        { moTa: 'Chỉ xuống một ô rồi bay sang trái: đâm vào dãy bụi cây', baiLam: bai(nhieu(['fly_right(5)', 'go_down()'], LAP(5, 'go_left()'))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bay xuống rồi bay lên lại: thừa hai nhịp nên hết pin trước cờ', baiLam: bai(nhieu(['fly_right(5)', 'go_down()', 'go_up()', 'go_down()', 'go_down()'], LAP(5, 'go_left()'))), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Hàng trên dài 5 ô: gọi fly_right(5).', 'Xuống hai ô tới hàng dưới rồi lặp 5 lần go_left().']
    }),

    /* ================================================= chương list "Lập danh sách" ================================================= */
    manList({
      so: 11, ten: 'Sửa một số', hang: 'lam-quen', hamCuaEmCan: ['fly_right'],
      deBai: 'Đường bay tới cờ qua ba hàng ngang, hết mỗi hàng drone hạ xuống một ô sang hàng dưới. Danh sách a ghi số bước bay sang phải của từng hàng, nhưng số ở giữa bị ghi sai. ' +
        'Đếm lại hàng giữa rồi sửa đúng số đó.',
      veMaMau: 'Chương trình có sẵn bay theo danh sách a. Chạy thử: hàng thứ hai bay thiếu nên đâm bụi cây. Chạm vào số sai trong danh sách để sửa.',
      san: ['.=.####', '##.u.>#', '#####.=', '######F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = [2, 1, 1]'].concat(DUYET('a'))),
      loiGiai: bai(['a = [2, 3, 1]'].concat(DUYET('a'))),
      sao: { o: 6, nhip: 9 },
      loiGiaiKhac: { moTa: 'Không dùng danh sách: gọi fly_right() và go_down() từng hàng', baiLam: bai(['fly_right(2)', 'go_down()', 'fly_right(3)', 'go_down()', 'fly_right(1)', 'go_down()']) },
      loiSai: [
        { moTa: 'Sửa nhầm số đầu: hàng đầu bay thiếu, hạ xuống đâm bụi cây', baiLam: bai(['a = [1, 1, 1]'].concat(DUYET('a'))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên hạ xuống sau mỗi hàng: drone bay thẳng vào bụi cây', baiLam: bai(['a = [2, 3, 1]', 'for n in a:', '    fly_right(n)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi số trong a là số bước bay sang phải ở một hàng.', 'Hàng thứ hai từ cột 2 sang cột 5 là 3 bước: sửa số 1 ở giữa thành 3.']
    })
  ];

  // Các màn có sẵn (drone.7, 8, 9 và list.1, 3, 6, 4, 7, 9, 5, 8, 10) giữ nguyên trong man-drone.js / man-list.js cho các bộ kiểm riêng;
  // khi nạp lo-trinh-hoc.js cho mùa 4, nâng cấp các màn này sang thân drone nguyên bản (không nam châm, không xe hai bánh).
  function banDrone(d) {
    return Object.assign({
      loaiRobot: 'drone', robot: { than: 'drone', tay: null, camBien: [] },
      hamGoc: BAY.slice(), mucTieu: 'toi-co', cauTruc: ['for', 'if', 'while'],
      vatChat: undefined, vatMau: undefined, vatCan: undefined, nhipTheoLoiGiai: true
    }, d);
  }
  function banList(d) {
    return Object.assign({
      loaiRobot: 'drone', robot: { than: 'drone', tay: null, camBien: [] },
      hamGoc: BAY.slice(), mucTieu: 'toi-co', cauTruc: ['for', 'list'],
      nhipTheoLoiGiai: true
    }, d);
  }

  ManHoc.suaCatCanh = {
    'drone.7': banDrone({
      ten: 'Hàm bay sang phải', hang: 'luyen', chinhCoDinh: true, taoHam: ['fly_right'], hamCuaEmCan: [],
      deBai: 'Gói vòng lặp bay sang phải n ô thành hàm fly_right(n) trong Xưởng hàm. Chương trình chính đã khóa: bay sang phải 3 ô, hạ xuống 1 ô, rồi bay sang phải 2 ô tới cờ.',
      veMaMau: 'Mở Xưởng hàm, tạo fly_right với đối số n: lặp n lần go_right().',
      san: ['.=.>##', '###u.F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['fly_right(3)', 'go_down()', 'fly_right(2)']),
      loiGiai: bai(['fly_right(3)', 'go_down()', 'fly_right(2)'], { hamCuaEmMoi: [H('fly_right', ['n'], T_FLY_RIGHT)] }),
      sao: { o: 5, nhip: 6 },
      loiSai: [
        { moTa: 'Gọi fly_right mà chưa tạo hàm trong Xưởng', baiLam: bai(['fly_right(3)', 'go_down()', 'fly_right(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Lặp cứng 2 lần thay vì dùng đối số n', baiLam: bai(['fly_right(3)', 'go_down()', 'fly_right(2)']), hamCuaEmMoi: [H('fly_right', ['n'], LAP(2, 'go_right()'))], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Trong Xưởng hàm, bấm Hàm mới, đặt tên fly_right và thêm đối số n.', 'Thân hàm: for i in range(n): rồi go_right().']
    }),
    'drone.8': banDrone({
      ten: 'Bậc thang trên không', hang: 'luyen', taoHam: [], hamCuaEmCan: ['fly_right'],
      deBai: 'Ba bậc thang nối tiếp qua hàng rào, hố và băng chuyền: mỗi bậc bay sang phải 2 ô bằng fly_right(2) rồi hạ xuống 1 ô. Dùng vòng lặp cho gọn.',
      veMaMau: 'Chương trình có sẵn mới bay bậc đầu. Đưa hai lệnh vào vòng for lặp 3 lần.',
      san: ['.=.####', '##u.=##', '####>..', '######F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['fly_right(2)', 'go_down()']),
      loiGiai: bai(LAP(3, ['fly_right(2)', 'go_down()'])),
      sao: { o: 5, nhip: 9 },
      loiSai: [
        { moTa: 'Chỉ lặp 2 lần: dừng trước bậc cuối', baiLam: bai(LAP(2, ['fly_right(2)', 'go_down()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hạ xuống trước khi bay sang phải: đâm bụi cây ngay đầu đường', baiLam: bai(LAP(3, ['go_down()', 'fly_right(2)'])), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi bậc giống hệt nhau: fly_right(2) rồi go_down().', 'Ba bậc: for i in range(3):']
    }),
    'drone.9': banDrone({
      ten: 'Sửa đường né cửa đóng', hang: 'bien-the', taoHam: [], hamCuaEmCan: ['fly_right'],
      deBai: 'Drone bay qua được hàng rào và hố, nhưng KHÔNG bay qua được cánh cửa đang đóng (C). Sola viết fly_right(4) ở hàng trên nên drone đâm vào cửa. Sửa số bước ở hai hàng để hạ xuống trước cửa.',
      veMaMau: 'Chạy thử xem drone vướng cửa đóng ở đâu, rồi sửa hai số trong fly_right().',
      san: ['.=uC##', '##.>.=', '#####F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['fly_right(4)', 'go_down()', 'fly_right(1)', 'go_down()']),
      loiGiai: bai(['fly_right(2)', 'go_down()', 'fly_right(3)', 'go_down()']),
      sao: { o: 6, nhip: 7 },
      loiSai: [
        { moTa: 'Giữ nguyên mã của Sola: đâm cửa đóng ở hàng trên', baiLam: bai(['fly_right(4)', 'go_down()', 'fly_right(1)', 'go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hạ xuống quá sớm sau 1 ô: vướng bụi cây ở hàng giữa', baiLam: bai(['fly_right(1)', 'go_down()', 'fly_right(4)', 'go_down()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Cửa đóng nằm ở cột 3: chỉ bay sang phải 2 ô rồi hạ xuống.', 'Ở hàng giữa, bay sang phải 3 ô tới cuối hàng rồi hạ xuống cờ.']
    }),
    'list.1': banList({
      ten: 'Danh sách độ dài', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['fly_right'],
      deBai: 'Danh sách a = [3, 1, 2] giữ ba số trong một biến, theo thứ tự. for n in a: lấy lần lượt từng số ra làm n: lần đầu n là 3, rồi 1, rồi 2. ' +
        'Bấm Chạy xem drone bay đúng ba hàng dài 3, 1, 2 ô, hết mỗi hàng hạ xuống một ô.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, đếm số bước bay ngang ở từng hàng và so với các số trong a.',
      san: ['.=.>###', '###.u##', '####.=>', '######F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = [3, 1, 2]'].concat(DUYET('a'))),
      loiGiai: bai(['a = [3, 1, 2]'].concat(DUYET('a'))),
      sao: { o: 6, nhip: 9 },
      goiY: ['Mỗi số trong danh sách là số bước bay sang phải ở một hàng.', 'Màn sau một số trong danh sách bị ghi sai: bạn sửa.']
    }),
    'list.3': banList({
      ten: 'Bốn hàng qua rào', hang: 'lam-quen', hamCuaEmCan: ['fly_right'],
      deBai: 'Đường bay xuống cờ có bốn hàng ngang dài 3, 1, 2 và 1 ô. Danh sách a mới có ba số đầu. Thêm số thứ tư vào cuối danh sách a.',
      veMaMau: 'Chương trình có sẵn mới bay ba hàng. Chạm vào số cuối trong danh sách a để thêm số của hàng thứ tư.',
      san: ['.=.>####', '###.u###', '####.=.#', '######u.', '#######F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = [3, 1, 2]'].concat(DUYET('a'))),
      loiGiai: bai(['a = [3, 1, 2, 1]'].concat(DUYET('a'))),
      sao: { o: 6, nhip: 11 },
      loiSai: [
        { moTa: 'Chưa thêm số thứ tư: dừng ở hàng thứ tư trước cờ', baiLam: bai(['a = [3, 1, 2]'].concat(DUYET('a'))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa nhầm hàng thứ ba thành 1: hạ xuống đâm bụi cây', baiLam: bai(['a = [3, 1, 1, 1]'].concat(DUYET('a'))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đếm số bước sang phải ở hàng thứ tư trước khi hạ xuống cờ.', 'Danh sách cần đủ bốn số: [3, 1, 2, 1].']
    }),
    'list.6': banList({
      ten: 'Hàm nhận danh sách', hang: 'lam-quen', hamCuaEmCan: ['fly_right'],
      deBai: 'Hàm của màn tour(steps) nhận cả một danh sách steps rồi bay lần lượt từng hàng trong đó. Truyền đúng danh sách bốn độ dài vào tour() để drone tới cờ.',
      veMaMau: 'Chương trình có sẵn mới truyền [3, 2] vào tour(). Sửa danh sách trong ngoặc cho đủ bốn hàng.',
      san: ['.=.>#####', '###.u.###', '#####.=##', '######.>.', '########F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['tour([3, 2])'], { hamCuaMan: [H_TOUR] }),
      loiGiai: bai(['tour([3, 2, 1, 2])'], { hamCuaMan: [H_TOUR] }),
      sao: { o: 6, nhip: 12 },
      loiSai: [
        { moTa: 'Mới có hai số trong danh sách: dừng giữa đường', baiLam: bai(['tour([3, 2])'], { hamCuaMan: [H_TOUR] }), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hàng thứ hai ghi 1 thay vì 2: hạ xuống đâm bụi cây', baiLam: bai(['tour([3, 1, 1, 2])'], { hamCuaMan: [H_TOUR] }), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Một danh sách có thể truyền thẳng làm đối số của hàm.', 'Bốn hàng lần lượt dài 3, 2, 1, 2 ô.']
    }),
    'list.4': banList({
      ten: 'Hàng cuối bay thẳng', hang: 'luyen', hamCuaEmCan: ['fly_right'],
      deBai: 'Ba hàng đầu mỗi hàng bay sang phải rồi hạ xuống một ô, nhưng ở hàng cuối cờ nằm ngay cuối hàng nên không hạ xuống nữa. Dùng danh sách cho ba hàng đầu, rồi bay nốt hàng cuối.',
      veMaMau: 'Chương trình có sẵn đã bay xong ba hàng đầu và hạ xuống hàng cuối. Viết thêm lệnh bay sang phải tới cờ.',
      san: ['.=.>######', '###.u.####', '#####.=.##', '#######.>F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = [3, 2, 2]'].concat(DUYET('a'))),
      loiGiai: bai(['a = [3, 2, 2]'].concat(DUYET('a'), ['fly_right(2)'])),
      sao: { o: 7, nhip: 12 },
      loiSai: [
        { moTa: 'Chưa bay hàng cuối: dừng cách cờ 2 ô', baiLam: bai(['a = [3, 2, 2]'].concat(DUYET('a'))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hàng cuối chỉ bay sang phải 1 ô: dừng ngay trước cờ', baiLam: bai(['a = [3, 2, 2]'].concat(DUYET('a'), ['fly_right(1)'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi phần tử trong vòng for đều kèm go_down() ở cuối.', 'Hàng cuối không có go_down() nên gọi riêng fly_right(2) sau vòng for.']
    }),
    'list.7': banList({
      ten: 'Dùng lại danh sách', hang: 'luyen', hamCuaEmCan: ['fly_right'],
      deBai: 'Đường bay gồm hai nhịp bậc thang giống hệt nhau, mỗi nhịp có hai hàng dài 2 ô và 2 ô. Cất danh sách vào biến a rồi gọi tour(a) hai lần.',
      veMaMau: 'Chương trình có sẵn mới gọi tour(a) một lần. Gọi thêm một lần nữa.',
      san: ['.=.######', '##.u.####', '####.=u.#', '######.>.', '########F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = [2, 2]', 'tour(a)'], { hamCuaMan: [H_TOUR] }),
      loiGiai: bai(['a = [2, 2]', 'tour(a)', 'tour(a)'], { hamCuaMan: [H_TOUR] }),
      sao: { o: 8, nhip: 12 },
      loiSai: [
        { moTa: 'Chỉ gọi tour(a) một lần: mới đi được nửa đường', baiLam: bai(['a = [2, 2]', 'tour(a)'], { hamCuaMan: [H_TOUR] }), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa danh sách thành [2, 1]: lệch nhịp đâm bụi cây', baiLam: bai(['a = [2, 1]', 'tour(a)', 'tour(a)'], { hamCuaMan: [H_TOUR] }), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Cất danh sách vào biến a để truyền cho nhiều lời gọi hàm.', 'Gọi tour(a) hai lần liên tiếp.']
    }),
    'list.9': banList({
      ten: 'Sửa vòng lặp danh sách', hang: 'bien-the', hamCuaEmCan: ['fly_right'],
      deBai: 'Sola ghi đúng danh sách a = [3, 2, 2, 2], nhưng lệnh go_down() lại nằm ngoài vòng for nên drone bay tuột một mạch ở hàng đầu rồi đâm bụi cây. Sửa lại thụt lề.',
      veMaMau: 'Chạy thử xem vì sao drone không hạ xuống sau hàng đầu, rồi thụt go_down() vào trong vòng for.',
      san: ['.=.>######', '###.u.####', '#####.=.##', '#######.>.', '#########F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = [3, 2, 2, 2]', 'for n in a:', '    fly_right(n)', 'go_down()']),
      loiGiai: bai(['a = [3, 2, 2, 2]'].concat(DUYET('a'))),
      sao: { o: 6, nhip: 13 },
      loiSai: [
        { moTa: 'Để go_down() ngoài vòng for: bay thẳng vào bụi cây ở hàng đầu', baiLam: bai(['a = [3, 2, 2, 2]', 'for n in a:', '    fly_right(n)', 'go_down()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Hết MỖI hàng đều phải hạ xuống một ô.', 'Thụt go_down() vào trong thân vòng for n in a:']
    }),
    'list.5': banList({
      ten: 'Mỗi hàng hạ hai ô', hang: 'luyen', hamCuaEmCan: ['fly_right'],
      deBai: 'Giữa hai lối bay ngang là cả một dãy bụi cây và hàng rào, nên hết mỗi hàng trong danh sách a = [3, 2, 2] drone phải hạ xuống HAI ô, cuối cùng bay sang phải 1 ô vào cờ.',
      veMaMau: 'Chương trình có sẵn mới hạ xuống một ô sau mỗi hàng. Thêm một lệnh go_down() trong vòng lặp và một bước sang phải ở cuối.',
      san: ['.=.>#####', '###=#####', '###.u.###', '#####u###', '#####.>.#', '#######=#', '#######.F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = [3, 2, 2]'].concat(DUYET('a'))),
      loiGiai: bai(['a = [3, 2, 2]', 'for n in a:', '    fly_right(n)', '    go_down()', '    go_down()', 'go_right()']),
      sao: { o: 8, nhip: 14 },
      loiSai: [
        { moTa: 'Chỉ hạ xuống một ô trong vòng lặp: đâm bụi cây', baiLam: bai(['a = [3, 2, 2]'].concat(DUYET('a'))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên bước go_right() cuối cùng vào cờ', baiLam: bai(['a = [3, 2, 2]', 'for n in a:', '    fly_right(n)', '    go_down()', '    go_down()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Trong vòng for n in a: sau fly_right(n) cần hai dòng go_down().', 'Sau khi vòng for chạy xong, gọi thêm go_right() để vào ô cờ.']
    }),
    'list.8': banList({
      ten: 'Bay xuôi rồi bay ngược', hang: 'bien-the', hamCuaEmCan: ['fly_right'],
      deBai: 'Màn có hai hàm: tour(steps) bay sang phải rồi hạ xuống theo từng số, còn tour_left(steps) bay sang trái rồi hạ xuống. Nửa trên bay sang phải 3 rồi 2 ô; nửa dưới bay ngược sang trái 2 rồi 3 ô tới cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi tour([3, 2]). Gọi tiếp tour_left() với danh sách của nửa dưới.',
      san: ['.=.>##', '###.u.', '###.<=', '.=.u##', 'F#####'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['tour([3, 2])'], { hamCuaMan: [H_TOUR, H_TOUR_LEFT] }),
      loiGiai: bai(['tour([3, 2])', 'tour_left([2, 3])'], { hamCuaMan: [H_TOUR, H_TOUR_LEFT] }),
      sao: { o: 11, nhip: 14 },
      loiSai: [
        { moTa: 'Chưa gọi tour_left(): dừng ở góc phải giữa sân', baiLam: bai(['tour([3, 2])'], { hamCuaMan: [H_TOUR, H_TOUR_LEFT] }), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi nhầm tour() thay vì tour_left() ở nửa dưới: bay vào mép phải sân', baiLam: bai(['tour([3, 2])', 'tour([2, 3])'], { hamCuaMan: [H_TOUR, H_TOUR_LEFT] }), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Nửa dưới bay về bên trái: dùng tour_left([2, 3]).', 'Gọi cả tour([3, 2]) và tour_left([2, 3]).']
    }),
    'list.10': banList({
      ten: 'Tuần tra hai chiều', hang: 'trum', pin: 20, hamCuaEmCan: ['fly_right'],
      deBai: 'Bay tuần tra hết cánh đồng theo hình chữ Z: ba hàng trên bay sang phải lần lượt 4, 2, 1 ô bằng tour(), ba hàng dưới bay ngược sang trái 2, 3, 2 ô bằng tour_left() về đúng lá cờ. Pin vừa đủ 20 nhịp.',
      veMaMau: 'Chương trình có sẵn mới có lượt đi sang phải. Gọi thêm tour_left() với danh sách độ dài của ba hàng dưới.',
      san: ['.=.>.###', '####.u.#', '######.=', '#####.<=', '##.<.u##', '.=.#####', 'F#######'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['tour([4, 2, 1])'], { hamCuaMan: [H_TOUR, H_TOUR_LEFT] }),
      loiGiai: bai(['tour([4, 2, 1])', 'tour_left([2, 3, 2])'], { hamCuaMan: [H_TOUR, H_TOUR_LEFT] }),
      sao: { o: 11, nhip: 20 },
      loiSai: [
        { moTa: 'Chỉ bay lượt đi: dừng ở mép phải', baiLam: bai(['tour([4, 2, 1])'], { hamCuaMan: [H_TOUR, H_TOUR_LEFT] }), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ghi sai hàng giữa của lượt về thành 2: hạ xuống đâm bụi cây', baiLam: bai(['tour([4, 2, 1])', 'tour_left([2, 2, 2])'], { hamCuaMan: [H_TOUR, H_TOUR_LEFT] }), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Ba hàng dưới bay sang trái lần lượt 2, 3 rồi 2 ô.', 'Truyền [2, 3, 2] vào tour_left().']
    })
  };

  ManHoc.manCatCanh = DS;
  if (laNode) module.exports = ManHoc;
})();
