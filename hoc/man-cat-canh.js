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
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các dòng `than` `n` lần. */
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function W(chuoi) { return 'walk("' + chuoi + '")'; }

  /** m.pin: pin (số). m.nam: true thì gắn nam châm treo (đưa vật sắt lên ô đích). */
  function man(m) {
    var nam = m.nam;
    delete m.nam;
    m.chuong = m.chuong || 'drone';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: nam ? 'nam-cham' : null, camBien: [] };
    m.hamGoc = m.hamGoc || nhieu(BAY, nam ? NC : []);
    if (nam) { m.mucTieu = 'dua-vat'; m.vatCan = 'sat'; m.nhipTheoLoiGiai = true; }
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  /** Màn chương list (Python A danh sách) chạy trên xe hai bánh như các màn list có sẵn (man-list.js). */
  function manList(m) {
    m.chuong = 'list';
    m.cauTruc = ['for', 'list'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: null, camBien: [] };
    m.hamGoc = BANH.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }
  /** for n in a: forward(n), rẽ (2 dòng thân). */
  function DUYET(ds, re) { return ['for n in ' + ds + ':', '    forward(n)', '    ' + (re || 'turn_right()')]; }

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
      so: 14, ten: 'Giao hàng qua phố', hang: 'trum', nam: true, pin: 25,
      deBai: 'Ba thùng sắt nằm ở phố dưới, ba ô đích ở ba tầng thượng phía trên, giữa là dải phân cách. ' +
        'Drone hút từng thùng bằng nam châm treo, bay qua dải phân cách, thả lên ô đích. Pin vừa đủ cho ba chuyến: bay thừa một đoạn là hết pin giữa đường.',
      veMaMau: 'Chương trình có sẵn đưa được thùng thứ nhất. Ba chuyến giống nhau nếu mỗi chuyến bắt đầu bằng bay tới thùng.',
      san: ['..D#D#D', '.======', '..o.o.o'],
      vatChat: ['.......', '.......', '..s.s.s'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai([W('DDRR'), 'magnet_n()', 'wait()', 'go_up()', 'go_up()', 'magnet_off()', 'wait()']),
      loiGiai: bai(LAP(3, [W('DDRR'), 'magnet_n()', 'wait()', 'go_up()', 'go_up()', 'magnet_off()', 'wait()'])),
      sao: { o: 18, nhip: 24 },
      loiGiaiKhac: { moTa: 'Bay lên bằng walk("UU") thay cho hai lệnh go_up()', baiLam: bai(LAP(3, [W('DDRR'), 'magnet_n()', 'wait()', W('UU'), 'magnet_off()', 'wait()'])) },
      loiSai: [
        { moTa: 'Chỉ lặp hai lần: còn một thùng', baiLam: bai(LAP(2, [W('DDRR'), 'magnet_n()', 'wait()', 'go_up()', 'go_up()', 'magnet_off()', 'wait()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên bật nam châm: drone bay lên mà thùng nằm lại', baiLam: bai(LAP(3, [W('DDRR'), 'go_up()', 'go_up()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hạ xuống rồi lên lại sau mỗi chuyến: bay thừa, hết pin', baiLam: bai(LAP(3, [W('DDRR'), 'magnet_n()', 'wait()', 'go_up()', 'go_up()', 'magnet_off()', 'wait()', 'go_down()', 'go_up()'])), phaiCoMa: ['het-pin'] }
      ],
      hamCuaEmCan: ['go', 'walk'],
      goiY: ['Mỗi chuyến: bay tới thùng bằng walk("DDRR"), bật nam châm, chờ, bay lên hai ô, tắt nam châm, chờ.', 'Ba chuyến giống nhau: lặp ba lần.']
    }),

    /* ================================================= chương list "Lập danh sách" ================================================= */
    manList({
      so: 11, ten: 'Sửa một số', hang: 'lam-quen', hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Đường tới cờ có bốn đoạn, hết mỗi đoạn xe rẽ phải. Danh sách a ghi độ dài bốn đoạn theo thứ tự xe đi, nhưng có một số ghi sai. ' +
        'Đếm lại từng đoạn trên sân rồi sửa đúng số đó.',
      veMaMau: 'Chương trình có sẵn đi theo danh sách a. Chạy thử: tới đoạn ghi sai thì xe đâm tường. Chạm vào số sai trong danh sách để sửa.',
      san: ['.....', 'F###.', '.###.', '.....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['a = [4, 2, 4, 2]'].concat(DUYET('a'))),
      loiGiai: bai(['a = [4, 3, 4, 2]'].concat(DUYET('a'))),
      sao: { o: 11, nhip: 16 },
      loiGiaiKhac: { moTa: 'Không dùng danh sách: gọi forward() từng đoạn', baiLam: bai(['forward(4)', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(4)', 'turn_right()', 'forward(2)']) },
      loiSai: [
        { moTa: 'Sửa nhầm số đầu: xe đi thiếu đoạn đầu và rẽ sớm', baiLam: bai(['a = [3, 2, 4, 2]'].concat(DUYET('a'))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ sau mỗi đoạn: xe đi thẳng và đâm tường', baiLam: bai(['a = [4, 3, 4, 2]', 'for n in a:', '    forward(n)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi số trong a là độ dài một đoạn, theo thứ tự xe đi.', 'Đoạn thứ hai đi xuống: đếm có mấy ô từ góc trên xuống góc dưới?']
    })
  ];

  ManHoc.manCatCanh = DS;
  if (laNode) module.exports = ManHoc;
})();
