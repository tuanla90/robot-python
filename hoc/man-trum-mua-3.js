/* ============================================================================
   man-trum-mua-3.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 10 "Tổng hợp + trùm" (KE-HOACH-MUA-3.md, PDM3b2 31/10 KE-HOACH-PART-DUNG-MUA.md).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3): tệp có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html.
     - `tong-hop-3` (mã tong-hop-3.1 … tong-hop-3.10): chương 1 "Tổng hợp"
     - `trum-mua-3` (mã trum-mua-3.1 … trum-mua-3.10): chương 2 "Trùm mùa"
   PDM3b2 (31/10): gói 10 "R1 chạy một mình, nhiều sân" (như gói 10 mùa 1, 2):
     - MỌI màn MỘT robot: ROBOT PHÂN LOẠI ĐẦY ĐỦ = thân nhện + nam châm bụng (hai cực N/S) + cảm biến từ bên hông (front_metal, front_pole).
     - MỌI màn 2–3 SÂN ("ngày làm việc"), sao.nhip = TỔNG nhịp mọi ngày (nhipTheo: 'tong').
     - Một chương trình tổng quát thắng 3 sao mọi ngày; mỗi màn có ít nhất 1 lời sai viết cứng (cung: true) thua ở ít nhất một ngày.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HG = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];

  /** Sao chép sâu đối tượng dữ liệu. */
  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Gộp các mảng dòng lệnh thành một mảng phẳng. */
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Tạo đối tượng định nghĩa hàm. */
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  /** Tạo đối tượng bài làm chuẩn cho màn học. */
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] }, them || {}); }
  /** Tạo lời sai viết cứng (cung: true) thua ở ít nhất một ngày làm việc. */
  function cung(moTa, baiLam, phaiCoMa) { return { moTa: moTa, baiLam: baiLam, phaiCoMa: phaiCoMa, cung: true }; }

  /** Điền trường mặc định cho màn chương 1 `tong-hop-3` trên robot phân loại đầy đủ, nhiều sân, nhipTheo: 'tong'. */
  function man(m) {
    m.chuong = m.chuong || 'tong-hop-3';
    m.hang = m.hang || (m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum');
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = HG;
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 14, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    m.taoHam = m.taoHam || [];
    if (m.mucTieu === undefined) m.mucTieu = 'dua-vat';
    if (m.mucTieu === 'dua-vat' && !m.vatCan) m.vatCan = 'tu';
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /** Điền trường mặc định cho màn chương 2 `trum-mua-3`. */
  function trum(m) { m.chuong = 'trum-mua-3'; return man(m); }

  var DS = [
    /* ================================================= chương tong-hop-3 "Tổng hợp" ================================================= */
    man({
      so: 1, ten: 'Dò sắt đầu ca', hang: 'lam-quen', vatCan: 'sat',
      hamCuaEmCan: ['seek_row', 'pick_iron'],
      deBai: 'Hai ngày làm việc, mẩu sắt nằm ở hàng khác nhau bên phải hành lang. Dùng seek_row() dò xuống tới hàng có sắt rồi gọi pick_iron() sang nhấc sắt về thùng D.',
      veMaMau: 'Chương trình có sẵn bước cứng một hàng nên ngày 2 lệch hàng sắt. Đổi sang seek_row().',
      san: [
        ['######', '#....#', '#.Do.#', '#....#', '######'],
        ['######', '#....#', '#....#', '#.Do.#', '######']
      ],
      vatChat: [
        ['......', '......', '...s..', '......', '......'],
        ['......', '......', '......', '...s..', '......']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['go_down()', 'pick_iron()']),
      loiGiai: bai(['seek_row()', 'pick_iron()']),
      sao: { o: 12, nhip: 22 },
      loiSai: [
        cung('Bước cứng một hàng: ngày 2 chưa tới hàng có sắt', bai(['go_down()', 'pick_iron()']), ['chua-dua-vat']),
        cung('Bước cứng hai hàng: ngày 1 đi lố qua hàng có sắt', bai(['go_down()', 'go_down()', 'pick_iron()']), ['chua-dua-vat'])
      ],
      goiY: ['seek_row() tự đi xuống tới hàng mà front_metal() thấy sắt bên phải.', 'Tìm đúng hàng rồi gọi pick_iron() để sang nhấc sắt đem về thùng.']
    }),

    man({
      so: 2, ten: 'Sắt xa, sắt gần', hang: 'lam-quen', vatCan: 'sat',
      hamCuaEmCan: ['go', 'bring'],
      deBai: 'Hai ngày làm việc, mẩu sắt nằm xa gần khác nhau trên hành lang và ô đích D nằm ngay sau mẩu sắt. Dò sang phải tới khi front_metal() thấy sắt (cách 2 ô), bước hai ô lên mẩu sắt rồi gọi bring("R") mang sắt vào D.',
      veMaMau: 'Chương trình có sẵn bước cứng ba ô nên ngày 2 dừng trước mẩu sắt. Dùng vòng while not front_metal(): ở đầu.',
      san: [
        ['########', '#...oD.#', '########'],
        ['########', '#....oD#', '########']
      ],
      vatChat: [
        ['........', '....s...', '........'],
        ['........', '.....s..', '........']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['go("R")', 'go("R")', 'go("R")', 'bring("R")']),
      loiGiai: bai(['while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'bring("R")']),
      sao: { o: 20, nhip: 22 },
      loiSai: [
        cung('Bước cứng ba ô: ngày 2 chưa tới mẩu sắt', bai(['go("R")', 'go("R")', 'go("R")', 'bring("R")']), ['chua-dua-vat']),
        { moTa: 'Dừng vòng while rồi gọi bring("R") ngay khi còn cách sắt 2 ô', baiLam: bai(['while not front_metal():', '    go("R")', 'bring("R")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['front_metal() thấy sắt cách 2 ô phía trước, nên sau vòng while cần hai lần go("R") để bước lên mẩu sắt.', 'Đứng trên mẩu sắt rồi gọi bring("R") để hút sắt, bước sang D và thả.']
    }),

    man({
      so: 3, ten: 'Báo hiệu trước khe', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: ['walk', 'go', 'jump', 'crawl'],
      deBai: 'Hai ngày làm việc: đi sang phải hai ô bằng walk("RR") tới vị trí quan sát. Nếu trước mặt có cọc sắt báo hiệu (front_metal() là True) thì khe phía sau là hố u, cần go("R") rồi jump("R"). Ngược lại là gầm thấp n, cần go("R") rồi crawl("R"). Qua khe xong gọi walk("RR") tới cờ.',
      veMaMau: 'Chương trình có sẵn luôn nhảy nên ngày 2 đụng gầm thấp. Thêm if front_metal(): / else:.',
      san: [
        ['##########', '#...ou..F#', '##########'],
        ['##########', '#...on..F#', '##########']
      ],
      vatChat: [
        ['..........', '....s.....', '..........'],
        ['..........', '....g.....', '..........']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['walk("RR")', 'go("R")', 'jump("R")', 'walk("RR")']),
      loiGiai: bai(['walk("RR")', 'if front_metal():', '    go("R")', '    jump("R")', 'else:', '    go("R")', '    crawl("R")', 'walk("RR")']),
      sao: { o: 27, nhip: 28 },
      loiSai: [
        cung('Luôn nhảy jump("R"): ngày 2 không qua được gầm thấp', bai(['walk("RR")', 'go("R")', 'jump("R")', 'walk("RR")']), ['chua-toi-co']),
        cung('Luôn chui crawl("R"): ngày 1 bò xuống hố', bai(['walk("RR")', 'go("R")', 'crawl("R")', 'walk("RR")']), ['roi-ho'])
      ],
      goiY: ['Sau walk("RR"), nhện đứng ở (3,1) nhìn thấy ô (4,1): ngày 1 là sắt s (front_metal() True), ngày 2 là gỗ g (False).', 'Sau khi jump("R") hoặc crawl("R") qua khe tới (6,1), gọi walk("RR") tới cờ F(8,1).']
    }),

    man({
      so: 4, ten: 'Đổi cực qua đệm từ', hang: 'luyen', mucTieu: 'toi-co',
      hamCuaEmCan: ['go'],
      deBai: 'Hai ngày làm việc, đệm từ phía trên hố mang cực N hoặc cực S tùy ngày; mẩu nam châm đặt ở đầu hành lang báo đúng cực của đệm hôm đó. Đọc front_pole() để bật CÙNG cực dưới bụng (cùng cực thì đệm đẩy nhện sát tường dưới, an toàn qua hố), rồi đi 6 ô sang phải tới cờ.',
      veMaMau: 'Chương trình có sẵn luôn bật magnet_n() nên ngày 2 bị đệm S hút xuống hố. Dùng if front_pole() == "N": để chọn cực.',
      san: [
        ['####.####', '####u####', '#.o....F#', '#########'],
        ['####.####', '####u####', '#.o....F#', '#########']
      ],
      vatChat: [
        ['.........', '.........', '..N......', '.........'],
        ['.........', '.........', '..S......', '.........']
      ],
      demTu: [
        [{ x: 4, y: 0, cuc: 'N' }],
        [{ x: 4, y: 0, cuc: 'S' }]
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(['magnet_n()', 'for i in range(6):', '    go("R")']),
      loiGiai: bai(['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'for i in range(6):', '    go("R")']),
      sao: { o: 14, nhip: 24 },
      loiSai: [
        cung('Luôn bật magnet_n(): ngày 2 đệm S khác cực hút nhện xuống hố', bai(['magnet_n()', 'for i in range(6):', '    go("R")']), ['dem-roi-ho']),
        cung('Luôn bật magnet_s(): ngày 1 đệm N khác cực hút nhện xuống hố', bai(['magnet_s()', 'for i in range(6):', '    go("R")']), ['dem-roi-ho'])
      ],
      goiY: ['Cùng cực với đệm thì đệm đẩy nhện vào tường dưới, không bị kéo lên hố u(4,1).', 'Nếu front_pole() == "N" thì bật magnet_n(), ngược lại bật magnet_s(), rồi lặp 6 lần go("R").']
    }),

    man({
      so: 5, ten: 'Chui gầm rồi phân loại cực', hang: 'luyen',
      hamCuaEmCan: ['crawl', 'sort_row'],
      deBai: 'Hai ngày làm việc: chui qua gầm thấp bằng crawl("R") sang hành lang bên phải, dò xuống tới hàng có vật nam châm bằng while front_pole() == "none": rồi gọi sort_row() phân loại vật vào đúng ô đích màu.',
      veMaMau: 'Chương trình có sẵn đi cứng một hàng nên ngày 2 chưa tới hàng có vật. Thay bằng vòng while.',
      san: [
        ['######', '#.n.D#', '###.o#', '###.D#', '###..#', '######'],
        ['######', '#.n..#', '###.D#', '###.o#', '###.D#', '######']
      ],
      vatChat: [
        ['......', '......', '....N.', '......', '......', '......'],
        ['......', '......', '......', '....S.', '......', '......']
      ],
      mau: [
        ['......', '....r.', '......', '....b.', '......', '......'],
        ['......', '......', '....r.', '......', '....b.', '......']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['crawl("R")', 'go_down()', 'sort_row()']),
      loiGiai: bai(['crawl("R")', 'while front_pole() == "none":', '    go_down()', 'sort_row()']),
      sao: { o: 31, nhip: 26 },
      loiSai: [
        cung('Chỉ bước xuống 1 hàng: ngày 2 chưa tới vật nam châm', bai(['crawl("R")', 'go_down()', 'sort_row()']), ['chua-dua-vat']),
        cung('Bước cứng 2 hàng: ngày 1 đi lố qua vật nam châm', bai(['crawl("R")', 'go_down()', 'go_down()', 'sort_row()']), ['chua-dua-vat'])
      ],
      goiY: ['crawl("R") đưa nhện qua gầm tới cột 3.', 'Dùng while front_pole() == "none": go_down() rồi gọi sort_row().']
    }),

    man({
      so: 6, ten: 'Dò sắt rồi nhảy qua hố', hang: 'luyen', vatCan: 'sat',
      hamCuaEmCan: ['go', 'hop_iron'],
      deBai: 'Hai ngày làm việc, mẩu sắt và cái hố nằm ở vị trí khác nhau dọc hành lang. Dò sang phải bằng while not front_metal(): go("R"), bước tiếp hai ô lên mẩu sắt rồi gọi hop_iron("R") nhảy mang sắt qua hố vào ô đích D.',
      veMaMau: 'Chương trình có sẵn bước cứng ba ô nên ngày 2 rơi xuống hố hoặc hụt sắt. Dùng vòng while not front_metal():.',
      san: [
        ['#########', '#...ouD.#', '#########'],
        ['#########', '#....ouD#', '#########']
      ],
      vatChat: [
        ['.........', '....s....', '.........'],
        ['.........', '.....s...', '.........']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']),
      loiGiai: bai(['while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']),
      sao: { o: 23, nhip: 24 },
      loiSai: [
        cung('Bước cứng ba ô rồi nhảy: ngày 2 chưa tới sắt, đáp đúng vào hố', bai(['go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']), ['roi-ho']),
        { moTa: 'Quên bước hai ô lên sắt sau vòng while: nhảy khi chưa có sắt dưới bụng', baiLam: bai(['while not front_metal():', '    go("R")', 'hop_iron("R")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Khi front_metal() vừa thấy sắt, nhện còn cách mẩu sắt 2 ô.', 'Bước hai lần go("R") lên đứng trên sắt rồi gọi hop_iron("R").']
    }),

    man({
      so: 7, ten: 'Nhảy băng ngược, mở cổng tới cờ', hang: 'bien-the', mucTieu: 'toi-co',
      hamCuaEmCan: ['hop_belt', 'hold_gate', 'go', 'walk'],
      deBai: 'Hai ngày làm việc: nhảy qua ô băng ngược bằng hop_belt("R"), dò sang phải tới mẩu sắt bằng while not front_metal(): go("R"), bước hai ô lên sắt rồi gọi hold_gate("R") đặt sắt lên nút M mở cửa C và walk("RR") qua cửa tới cờ F.',
      veMaMau: 'Chương trình có sẵn bước cứng sau khi nhảy qua băng ngược nên ngày 2 chưa tới sắt. Thay bằng vòng while not front_metal():.',
      san: [
        ['###########', '#..<..oMCF#', '###########'],
        ['###########', '#..<...oMCF', '###########']
      ],
      vatChat: [
        ['...........', '......s....', '...........'],
        ['...........', '.......s...', '...........']
      ],
      noi: [
        [{ nut: { x: 7, y: 1 }, cua: [{ x: 8, y: 1 }], bang: [] }],
        [{ nut: { x: 8, y: 1 }, cua: [{ x: 9, y: 1 }], bang: [] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['hop_belt("R")', 'go("R")', 'go("R")', 'hold_gate("R")', 'walk("RR")']),
      loiGiai: bai(['hop_belt("R")', 'while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hold_gate("R")', 'walk("RR")']),
      sao: { o: 29, nhip: 36 },
      loiSai: [
        cung('Đi cứng hai ô sau hop_belt("R"): ngày 2 chưa tới mẩu sắt nên cửa C không mở', bai(['hop_belt("R")', 'go("R")', 'go("R")', 'hold_gate("R")', 'walk("RR")']), ['cua-ket', 'chua-toi-co']),
        { moTa: 'Quên hold_gate("R"): rời nút M là cửa C đóng lại', baiLam: bai(['hop_belt("R")', 'while not front_metal():', '    go("R")', 'walk("RRRR")']), phaiCoMa: ['cua-ket', 'chua-toi-co'] }
      ],
      goiY: ['hop_belt("R") nhảy vọt qua băng ngược <(3,1) tới (4,1).', 'Dùng while not front_metal(): go("R"), rồi hai lần go("R"), hold_gate("R") đặt sắt lên M và walk("RR") tới cờ F.']
    }),

    man({
      so: 8, ten: 'Gặp sắt hay gặp nam châm', hang: 'bien-the',
      hamCuaEmCan: ['go', 'walk', 'hop_iron', 'sort_row'],
      deBai: 'Hai ngày làm việc: cuối hành lang có thể là mẩu sắt trước cái hố (ngày 1) hoặc mẩu nam châm giữa hai ô đích đỏ/xanh (ngày 2). Đi sang phải trong khi chưa thấy nam châm VÀ chưa thấy sắt: while front_pole() == "none" and not front_metal(): go("R"). Sau đó nếu front_metal() thì walk("RR") rồi hop_iron("R"), ngược lại walk("RR") rồi sort_row().',
      veMaMau: 'Chương trình có sẵn chỉ dừng khi thấy sắt nên ngày 2 đi lố. Thêm front_pole() == "none" and vào vòng while và rẽ nhánh if / else.',
      san: [
        ['#########', '#########', '#...ouD.#', '#########', '#########'],
        ['#########', '######D##', '#.....o.#', '######D##', '#########']
      ],
      vatChat: [
        ['.........', '.........', '....s....', '.........', '.........'],
        ['.........', '.........', '......N..', '.........', '.........']
      ],
      mau: [
        ['.........', '.........', '.........', '.........', '.........'],
        ['.........', '......r..', '.........', '......b..', '.........']
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(['while not front_metal():', '    go("R")', 'walk("RR")', 'hop_iron("R")']),
      loiGiai: bai(['while front_pole() == "none" and not front_metal():', '    go("R")', 'if front_metal():', '    walk("RR")', '    hop_iron("R")', 'else:', '    walk("RR")', '    sort_row()']),
      sao: { o: 42, nhip: 24 },
      loiSai: [
        cung('Luôn gọi hop_iron("R"): ngày 2 không phân loại nam châm N', bai(['while front_pole() == "none" and not front_metal():', '    go("R")', 'walk("RR")', 'hop_iron("R")']), ['chua-dua-vat']),
        cung('Luôn gọi sort_row(): ngày 1 là mẩu sắt trước hố nên rơi hố', bai(['while front_pole() == "none" and not front_metal():', '    go("R")', 'walk("RR")', 'sort_row()']), ['roi-ho'])
      ],
      goiY: ['Khi vòng while dừng: nếu vì sắt (front_metal() True) thì nhện cách sắt 2 ô, gọi walk("RR") lên sắt rồi hop_iron("R").', 'Nếu vì nam châm (else) thì nhện cách nam châm 3 ô, gọi walk("RR") tới sát bên trái vật rồi gọi sort_row().']
    }),

    man({
      so: 9, ten: 'Nhảy hố, phân loại hai trạm', hang: 'bien-the',
      hamCuaEmCan: ['jump', 'sort_back', 'sort_row'],
      deBai: 'Hai ngày làm việc: nhảy qua hố đầu ca bằng jump("R") sang hành lang phân loại, rồi dò xuống phân loại hai trạm nam châm ở độ sâu khác nhau bằng sort_back() và sort_row().',
      veMaMau: 'Chương trình có sẵn mới xử lý xong trạm đầu. Viết tiếp vòng while thứ hai và sort_row().',
      san: [
        ['######', '#.u.D#', '###.o#', '###.D#', '###.D#', '###.o#', '###.D#', '######'],
        ['######', '#.u..#', '###.D#', '###.o#', '###.D#', '###.D#', '###.o#', '###.D#']
      ],
      vatChat: [
        ['......', '......', '....N.', '......', '......', '....S.', '......', '......'],
        ['......', '......', '......', '....S.', '......', '......', '....N.', '......']
      ],
      mau: [
        ['......', '....r.', '......', '....b.', '....r.', '......', '....b.', '......'],
        ['......', '......', '....r.', '......', '....b.', '....r.', '......', '....b.']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['jump("R")', 'while front_pole() == "none":', '    go_down()', 'sort_back()']),
      loiGiai: bai(['jump("R")', 'while front_pole() == "none":', '    go_down()', 'sort_back()', 'while front_pole() == "none":', '    go_down()', 'sort_row()']),
      sao: { o: 40, nhip: 48 },
      loiSai: [
        cung('Bước cứng số hàng giữa hai trạm: ngày 2 lệch trạm đầu', bai(['jump("R")', 'go_down()', 'sort_back()', 'go_down()', 'sort_row()']), ['chua-dua-vat']),
        { moTa: 'Chỉ phân loại trạm đầu: còn sót trạm thứ hai', baiLam: bai(['jump("R")', 'while front_pole() == "none":', '    go_down()', 'sort_back()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sau sort_back() ở trạm đầu, nhện đã về lại cột 3 và bước qua khỏi trạm đầu.', 'Dùng thêm while front_pole() == "none": go_down() rồi gọi sort_row() cho trạm thứ hai.']
    }),

    man({
      so: 10, ten: 'Trùm tổng hợp: Ba ca trực phân loại', hang: 'trum', khung: { chinh: 16, moiHam: 10 },
      hamCuaEmCan: ['crawl', 'sort_back'],
      deBai: 'Trùm tổng hợp: ba ngày làm việc liên tiếp. Mỗi ngày chui qua gầm thấp đầu ca bằng crawl("R"), rồi lặp 2 lần: dò xuống tới trạm nam châm bằng while front_pole() == "none": go_down() và gọi sort_back() để phân loại cả hai trạm.',
      veMaMau: 'Chương trình có sẵn mới chui qua gầm. Thêm vòng for 2 lần kết hợp while và sort_back().',
      san: [
        ['######', '#.n.D#', '###.o#', '###.D#', '###..#', '###.D#', '###.o#', '###.D#', '######'],
        ['######', '#.n..#', '###.D#', '###.o#', '###.D#', '###.D#', '###.o#', '###.D#', '######'],
        ['######', '#.n.D#', '###.o#', '###.D#', '###.D#', '###.o#', '###.D#', '###..#', '######']
      ],
      vatChat: [
        ['......', '......', '....N.', '......', '......', '......', '....S.', '......', '......'],
        ['......', '......', '......', '....S.', '......', '......', '....N.', '......', '......'],
        ['......', '......', '....S.', '......', '......', '....N.', '......', '......', '......']
      ],
      mau: [
        ['......', '....r.', '......', '....b.', '......', '....r.', '......', '....b.', '......'],
        ['......', '......', '....r.', '......', '....b.', '....r.', '......', '....b.', '......'],
        ['......', '....r.', '......', '....b.', '....r.', '......', '....b.', '......', '......']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['crawl("R")']),
      loiGiai: bai(['crawl("R")', 'for i in range(2):', '    while front_pole() == "none":', '        go_down()', '    sort_back()']),
      sao: { o: 39, nhip: 77 },
      loiSai: [
        cung('Đi cứng theo vị trí trạm của ngày 1: ngày 2 và ngày 3 lệch hàng', bai(['crawl("R")', 'go_down()', 'sort_back()', 'go_down()', 'go_down()', 'sort_back()']), ['chua-dua-vat']),
        { moTa: 'Chỉ lặp 1 lần: trạm thứ hai chưa được phân loại', baiLam: bai(['crawl("R")', 'while front_pole() == "none":', '    go_down()', 'sort_back()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['crawl("R") đưa nhện qua gầm tới cột 3.', 'Bọc while front_pole() == "none": go_down() và sort_back() trong for i in range(2): để xử lý cả hai trạm trên cả ba sân.']
    })
  ];

  /* ================================================= chương trum-mua-3 "Trùm mùa" ================================================= */
  DS.push(
    trum({
      so: 1, ten: 'Chui gầm rồi nhảy mang sắt', hang: 'lam-quen', vatCan: 'sat',
      hamCuaEmCan: ['crawl', 'go', 'hop_iron'],
      deBai: 'Hai ngày làm việc: chui qua gầm bằng crawl("R"), dò sang phải tới khi front_metal() thấy mẩu sắt, bước hai ô lên mẩu sắt rồi gọi hop_iron("R") nhảy qua hố vào ô đích D.',
      veMaMau: 'Chương trình có sẵn bước cứng sau khi chui gầm nên ngày 2 chưa tới sắt. Thay bằng vòng while not front_metal():.',
      san: [
        ['###########', '#.n...ouD.#', '###########'],
        ['###########', '#.n....ouD#', '###########']
      ],
      vatChat: [
        ['...........', '......s....', '...........'],
        ['...........', '.......s...', '...........']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['crawl("R")', 'go("R")', 'go("R")', 'hop_iron("R")']),
      loiGiai: bai(['crawl("R")', 'while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']),
      sao: { o: 29, nhip: 34 },
      loiSai: [
        cung('Bước cứng ba ô sau khi chui gầm: ngày 2 nhảy vào hố', bai(['crawl("R")', 'go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']), ['roi-ho']),
        { moTa: 'Không chui gầm ở đầu ca: đụng gầm thấp n', baiLam: bai(['while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']), phaiCoMa: ['vong-vo-han', 'dam-tuong'] }
      ],
      goiY: ['Gọi crawl("R") để qua gầm n(2,1) sang (3,1).', 'Dùng while not front_metal(): go("R"), rồi hai lần go("R") và hop_iron("R").']
    }),

    trum({
      so: 2, ten: 'Đè nút tắt đệm, mở cổng tới cờ', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: ['hold_gate', 'go', 'walk'],
      deBai: 'Hai ngày làm việc: nhện đứng trên mẩu sắt đầu cạnh nút M1 tắt đệm từ S. Gọi hold_gate("R") đặt sắt lên nút M1 để tắt đệm từ, rồi dò sang phải tới mẩu sắt thứ hai, dùng hold_gate("R") đặt lên nút M2 mở cửa C và walk("RRR") tới cờ F.',
      veMaMau: 'Chương trình có sẵn chưa đặt sắt lên nút M1 nên đệm từ còn bật và kéo nhện xuống hố. Thêm hold_gate("R") đầu ca.',
      san: [
        ['####.#######', '####u#######', '#oM...oM.CF#', '############'],
        ['####.#######', '####u#######', '#oM....oM.CF', '############']
      ],
      vatChat: [
        ['............', '............', '.s....s.....', '............'],
        ['............', '............', '.s.....s....', '............']
      ],
      demTu: [
        [{ x: 4, y: 0, cuc: 'S', nut: { x: 2, y: 2 }, khiDe: 'tat' }],
        [{ x: 4, y: 0, cuc: 'S', nut: { x: 2, y: 2 }, khiDe: 'tat' }]
      ],
      noi: [
        [{ nut: { x: 7, y: 2 }, cua: [{ x: 9, y: 2 }], bang: [] }],
        [{ nut: { x: 8, y: 2 }, cua: [{ x: 10, y: 2 }], bang: [] }]
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(['while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hold_gate("R")', 'walk("RRR")']),
      loiGiai: bai(['hold_gate("R")', 'while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hold_gate("R")', 'walk("RRR")']),
      sao: { o: 23, nhip: 46 },
      loiSai: [
        { moTa: 'Quên hold_gate("R") đầu ca đè nút tắt đệm: bị đệm S kéo lên hố', baiLam: bai(['while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hold_gate("R")', 'walk("RRR")']), phaiCoMa: ['dem-roi-ho'] },
        cung('Bước cứng 3 ô sau nút M1: ngày 2 chưa tới mẩu sắt thứ hai nên cửa C đóng', bai(['hold_gate("R")', 'go("R")', 'go("R")', 'go("R")', 'hold_gate("R")', 'walk("RRR")']), ['dam-tuong', 'chua-toi-co'])
      ],
      goiY: ['hold_gate("R") đầu tiên đặt sắt lên M1(2,2) giữ đệm từ tắt.', 'Sau đó while not front_metal(): go("R"), hai lần go("R"), hold_gate("R") đặt sắt thứ hai lên M2 mở cửa C rồi walk("RRR") tới cờ F.']
    }),

    trum({
      so: 3, ten: 'Trôi băng rồi lọc gỗ mở cổng', hang: 'luyen', mucTieu: 'toi-co',
      hamCuaEmCan: ['ride_belt', 'take_metal_to', 'walk'],
      deBai: 'Hai ngày làm việc: lướt băng chuyền bằng ride_belt("R"), rồi đi qua hai nút đè M bằng take_metal_to("R") để lọc mẩu sắt đặt lên M (bỏ qua thùng gỗ) mở cửa C và walk("RRR") tới cờ F.',
      veMaMau: 'Chương trình có sẵn mới kiểm tra trạm đầu. Thêm go_right() và take_metal_to("R") cho trạm thứ hai.',
      san: [
        ['#############', '#.>.oM.oM.CF#', '#############'],
        ['#############', '#.>.oM.oM.CF#', '#############']
      ],
      vatChat: [
        ['.............', '....s..g.....', '.............'],
        ['.............', '....g..s.....', '.............']
      ],
      noi: [
        [{ nut: { x: 5, y: 1 }, cua: [{ x: 10, y: 1 }], bang: [] }, { nut: { x: 8, y: 1 }, cua: [{ x: 10, y: 1 }], bang: [] }],
        [{ nut: { x: 5, y: 1 }, cua: [{ x: 10, y: 1 }], bang: [] }, { nut: { x: 8, y: 1 }, cua: [{ x: 10, y: 1 }], bang: [] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['ride_belt("R")', 'take_metal_to("R")', 'walk("RRR")']),
      loiGiai: bai(['ride_belt("R")', 'take_metal_to("R")', 'go_right()', 'take_metal_to("R")', 'walk("RRR")']),
      sao: { o: 28, nhip: 42 },
      loiSai: [
        cung('Luôn hút ở trạm đầu bằng hold_gate("R"): ngày 2 trạm đầu là thùng gỗ', bai(['ride_belt("R")', 'go_right()', 'hold_gate("R")', 'walk("RRRRR")']), ['hut-go', 'dam-tuong']),
        { moTa: 'Chỉ kiểm tra trạm đầu: ngày 2 sắt ở trạm hai chưa được đặt lên M nên cửa đóng', baiLam: bai(['ride_belt("R")', 'take_metal_to("R")', 'walk("RRRRR")']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['ride_belt("R") đưa nhện qua băng >(2,1) tới (3,1).', 'Gọi take_metal_to("R"), go_right(), take_metal_to("R"), rồi walk("RRR") qua cửa C(10,1) tới cờ F(11,1).']
    }),

    trum({
      so: 4, ten: 'Trôi băng xuôi, phân loại nam châm', hang: 'luyen',
      hamCuaEmCan: ['ride_belt', 'sort_row'],
      deBai: 'Hai ngày làm việc: lướt qua ô băng chuyền đầu ca bằng ride_belt("R") sang cột phân loại, rồi dò xuống tới hàng có vật nam châm bằng while front_pole() == "none": go_down() và gọi sort_row().',
      veMaMau: 'Chương trình có sẵn đi cứng hai bước xuống nên ngày 2 chưa tới vật nam châm. Đổi sang vòng while.',
      san: [
        ['######', '#.>.##', '###.D#', '###.o#', '###.D#', '###..#', '######'],
        ['######', '#.>.##', '###..#', '###.D#', '###.o#', '###.D#', '######']
      ],
      vatChat: [
        ['......', '......', '......', '....N.', '......', '......', '......'],
        ['......', '......', '......', '......', '....S.', '......', '......']
      ],
      mau: [
        ['......', '......', '....r.', '......', '....b.', '......', '......'],
        ['......', '......', '......', '....r.', '......', '....b.', '......']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['ride_belt("R")', 'go_down()', 'go_down()', 'sort_row()']),
      loiGiai: bai(['ride_belt("R")', 'while front_pole() == "none":', '    go_down()', 'sort_row()']),
      sao: { o: 28, nhip: 26 },
      loiSai: [
        cung('Bước cứng hai hàng xuống: ngày 2 chưa tới hàng có nam châm', bai(['ride_belt("R")', 'go_down()', 'go_down()', 'sort_row()']), ['chua-dua-vat']),
        cung('Bước cứng ba hàng xuống: ngày 1 đi lố qua vật nam châm', bai(['ride_belt("R")', 'go_down()', 'go_down()', 'go_down()', 'sort_row()']), ['chua-dua-vat'])
      ],
      goiY: ['ride_belt("R") bước vào băng >(2,1) và chờ băng đẩy sang (3,1).', 'Từ (3,1), dùng while front_pole() == "none": go_down() rồi gọi sort_row().']
    }),

    trum({
      so: 5, ten: 'Nhảy băng ngược, phân loại hai trạm', hang: 'luyen',
      hamCuaEmCan: ['hop_belt', 'sort_back', 'sort_row'],
      deBai: 'Hai ngày làm việc: nhảy vọt qua dải băng ngược đầu hành lang bằng hop_belt("R"), rồi dò xuống phân loại hai trạm nam châm bằng sort_back() và sort_row().',
      veMaMau: 'Chương trình có sẵn mới phân loại xong trạm đầu. Viết tiếp cho trạm thứ hai.',
      san: [
        ['#######', '#..<..#', '####.D#', '####.o#', '####.D#', '####.D#', '####.o#', '####.D#', '#######'],
        ['#######', '#..<..#', '####..#', '####.D#', '####.o#', '####.D#', '####.D#', '####.o#', '####.D#']
      ],
      vatChat: [
        ['.......', '.......', '.......', '.....S.', '.......', '.......', '.....N.', '.......', '.......'],
        ['.......', '.......', '.......', '.......', '.....N.', '.......', '.......', '.....S.', '.......']
      ],
      mau: [
        ['.......', '.......', '.....r.', '.......', '.....b.', '.....r.', '.......', '.....b.', '.......'],
        ['.......', '.......', '.......', '.....r.', '.......', '.....b.', '.....r.', '.......', '.....b.']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['hop_belt("R")', 'while front_pole() == "none":', '    go_down()', 'sort_back()']),
      loiGiai: bai(['hop_belt("R")', 'while front_pole() == "none":', '    go_down()', 'sort_back()', 'while front_pole() == "none":', '    go_down()', 'sort_row()']),
      sao: { o: 42, nhip: 56 },
      loiSai: [
        cung('Đi cứng theo hàng của ngày 1: ngày 2 lệch trạm đầu', bai(['hop_belt("R")', 'go_down()', 'go_down()', 'sort_back()', 'go_down()', 'sort_row()']), ['chua-dua-vat']),
        { moTa: 'Chỉ làm trạm đầu: trạm thứ hai còn nguyên', baiLam: bai(['hop_belt("R")', 'while front_pole() == "none":', '    go_down()', 'sort_back()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['hop_belt("R") bước tới (2,1) rồi nhảy qua băng <(3,1) sang cột 4.', 'Sau sort_back() ở trạm đầu, thêm while front_pole() == "none": go_down() và sort_row().']
    }),

    trum({
      so: 6, ten: 'Đi vòng né đệm, nhảy sắt qua hố', hang: 'bien-the', vatCan: 'sat',
      hamCuaEmCan: ['detour', 'go', 'hop_iron'],
      deBai: 'Hai ngày làm việc: đệm từ S ở cột 3 luôn bật. Dùng detour(3) vòng xuống né vùng kéo của đệm từ, rồi dò sang phải tới mẩu sắt bằng while not front_metal(): go("R"), bước hai ô lên sắt và hop_iron("R") qua hố vào D.',
      veMaMau: 'Chương trình có sẵn mới đi vòng qua đệm từ. Viết tiếp đoạn dò sắt và hop_iron("R").',
      san: [
        ['###.#######', '#..#...ouD#', '#....######', '###########'],
        ['###.########', '#..#....ouD#', '#....#######', '############']
      ],
      vatChat: [
        ['...........', '.......s...', '...........', '...........'],
        ['............', '........s...', '............', '............']
      ],
      demTu: [
        [{ x: 3, y: 0, cuc: 'S' }],
        [{ x: 3, y: 0, cuc: 'S' }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['detour(3)']),
      loiGiai: bai(['detour(3)', 'while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']),
      sao: { o: 28, nhip: 44 },
      loiSai: [
        cung('Bước cứng 3 ô sau detour(3): ngày 2 nhảy vào hố', bai(['detour(3)', 'go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']), ['roi-ho']),
        { moTa: 'Không dùng detour(3) mà đi thẳng hàng trên: đâm vào tường dưới đệm từ', baiLam: bai(['while not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'hop_iron("R")']), phaiCoMa: ['vong-vo-han', 'dam-tuong'] }
      ],
      goiY: ['detour(3) đi xuống hàng 2, sang phải 3 ô rồi lên lại (4,1) an toàn sau cột đệm từ.', 'Tiếp tục while not front_metal(): go("R"), hai lần go("R") và hop_iron("R").']
    }),

    trum({
      so: 7, ten: 'Chờ thùng trên băng mở cổng', hang: 'bien-the',
      hamCuaEmCan: ['wait_n', 'walk', 'sort_row'],
      deBai: 'Hai ngày làm việc: thùng nặng H đang trôi trên dải băng chuyền hàng trên tới đè nút M mở cửa C. Gọi wait_n(2) chờ thùng đè lên nút M mở cửa, bước qua cửa bằng walk("RR"), rồi dò xuống tới vật nam châm và gọi sort_row().',
      veMaMau: 'Chương trình có sẵn chưa chờ cửa mở nên húc vào cửa C. Thêm wait_n(2) đầu ca và đổi sang vòng while dò xuống.',
      san: [
        ['#>M###', '#.C..#', '###.D#', '###.o#', '###.D#', '###..#', '######'],
        ['#>M###', '#.C..#', '###..#', '###.D#', '###.o#', '###.D#', '######']
      ],
      vatChat: [
        ['......', '......', '......', '....N.', '......', '......', '......'],
        ['......', '......', '......', '......', '....S.', '......', '......']
      ],
      mau: [
        ['......', '......', '....r.', '......', '....b.', '......', '......'],
        ['......', '......', '......', '....r.', '......', '....b.', '......']
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cua: [{ x: 2, y: 1 }], bang: [] }],
        [{ nut: { x: 2, y: 0 }, cua: [{ x: 2, y: 1 }], bang: [] }]
      ],
      thungThem: [
        [{ x: 1, y: 0 }],
        [{ x: 1, y: 0 }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['walk("RR")', 'go_down()', 'go_down()', 'sort_row()']),
      loiGiai: bai(['wait_n(2)', 'walk("RR")', 'while front_pole() == "none":', '    go_down()', 'sort_row()']),
      sao: { o: 31, nhip: 32 },
      loiSai: [
        { moTa: 'Không gọi wait_n(2): bước đầu của walk("RR") húc vào cửa C đang đóng nên lệch cột', baiLam: bai(['walk("RR")', 'while front_pole() == "none":', '    go_down()', 'sort_row()']), phaiCoMa: ['vong-vo-han', 'dam-tuong'] },
        cung('Bước cứng 2 hàng xuống sau khi qua cửa: ngày 2 chưa tới vật nam châm', bai(['wait_n(2)', 'walk("RR")', 'go_down()', 'go_down()', 'sort_row()']), ['chua-dua-vat'])
      ],
      goiY: ['Gọi wait_n(2) cho thùng H trôi qua băng > lên nút M(2,0) mở cửa C(2,1), rồi walk("RR") sang cột 3.', 'Dùng while front_pole() == "none": go_down() rồi gọi sort_row().']
    }),

    trum({
      so: 8, ten: 'Sửa hàm xử lý cuối băng', hang: 'bien-the', chinhCoDinh: true,
      hamCuaEmCan: ['go', 'hop_iron', 'sort_row'],
      deBai: 'Chương trình chính đã khóa: dò sang phải tới khi gặp vật nam châm hoặc mẩu sắt rồi gọi hàm handle_item() của màn. Nhưng handle_item() hiện chỉ xử lý mẩu sắt mà quên nhánh vật nam châm. Mở Xưởng sửa handle_item() bằng if front_metal(): / else:.',
      veMaMau: 'Chương trình chính đã khóa. Mở Xưởng sửa hàm handle_item() để xử lý cả sắt và nam châm.',
      san: [
        ['#########', '#########', '#...ouD.#', '#########', '#########'],
        ['#########', '######D##', '#.....o.#', '######D##', '#########']
      ],
      vatChat: [
        ['.........', '.........', '....s....', '.........', '.........'],
        ['.........', '.........', '......S..', '.........', '.........']
      ],
      mau: [
        ['.........', '.........', '.........', '.........', '.........'],
        ['.........', '......r..', '.........', '......b..', '.........']
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(['while front_pole() == "none" and not front_metal():', '    go("R")', 'handle_item()'], {
        hamCuaMan: [H('handle_item', [], ['go("R")', 'go("R")', 'hop_iron("R")'])]
      }),
      loiGiai: bai(['while front_pole() == "none" and not front_metal():', '    go("R")', 'handle_item()'], {
        hamCuaMan: [H('handle_item', [], ['if front_metal():', '    go("R")', '    go("R")', '    hop_iron("R")', 'else:', '    go("R")', '    go("R")', '    sort_row()'])]
      }),
      sao: { o: 43, nhip: 24 },
      loiSai: [
        cung('Giữ nguyên handle_item() chỉ gọi hop_iron("R"): ngày 2 không phân loại nam châm S', bai(['while front_pole() == "none" and not front_metal():', '    go("R")', 'handle_item()'], {
          hamCuaMan: [H('handle_item', [], ['go("R")', 'go("R")', 'hop_iron("R")'])]
        }), ['chua-dua-vat']),
        cung('Đổi handle_item() sang chỉ gọi sort_row(): ngày 1 rơi xuống hố', bai(['while front_pole() == "none" and not front_metal():', '    go("R")', 'handle_item()'], {
          hamCuaMan: [H('handle_item', [], ['go("R")', 'go("R")', 'sort_row()'])]
        }), ['roi-ho'])
      ],
      goiY: ['Trong handle_item(), kiểm tra if front_metal(): thì go("R"), go("R"), hop_iron("R").', 'Nhánh else: gọi go("R"), go("R"), sort_row().']
    }),

    trum({
      so: 9, ten: 'Chui gầm, lướt băng, phân loại hai trạm', hang: 'bien-the',
      hamCuaEmCan: ['crawl', 'ride_belt', 'sort_back', 'sort_row'],
      deBai: 'Hai ngày làm việc: chui qua gầm bằng crawl("R"), lướt băng chuyền xuống bằng ride_belt("D"), rồi dò xuống phân loại hai trạm nam châm bằng sort_back() và sort_row().',
      veMaMau: 'Chương trình có sẵn mới lướt băng và phân loại trạm đầu. Viết tiếp vòng while thứ hai và sort_row().',
      san: [
        ['######', '#.n..#', '###v.#', '###.D#', '###.o#', '###.D#', '###.D#', '###.o#', '###.D#', '######'],
        ['######', '#.n..#', '###v.#', '###..#', '###.D#', '###.o#', '###.D#', '###.D#', '###.o#', '###.D#']
      ],
      vatChat: [
        ['......', '......', '......', '......', '....N.', '......', '......', '....S.', '......', '......'],
        ['......', '......', '......', '......', '......', '....S.', '......', '......', '....N.', '......']
      ],
      mau: [
        ['......', '......', '......', '....r.', '......', '....b.', '....r.', '......', '....b.', '......'],
        ['......', '......', '......', '......', '....r.', '......', '....b.', '....r.', '......', '....b.']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['crawl("R")', 'ride_belt("D")', 'while front_pole() == "none":', '    go_down()', 'sort_back()']),
      loiGiai: bai(['crawl("R")', 'ride_belt("D")', 'while front_pole() == "none":', '    go_down()', 'sort_back()', 'while front_pole() == "none":', '    go_down()', 'sort_row()']),
      sao: { o: 44, nhip: 58 },
      loiSai: [
        cung('Bước cứng số hàng xuống sau khi lướt băng: ngày 2 lệch trạm đầu', bai(['crawl("R")', 'ride_belt("D")', 'go_down()', 'sort_back()', 'go_down()', 'sort_row()']), ['chua-dua-vat']),
        { moTa: 'Chỉ phân loại trạm đầu: trạm thứ hai còn sót', baiLam: bai(['crawl("R")', 'ride_belt("D")', 'while front_pole() == "none":', '    go_down()', 'sort_back()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['crawl("R") đưa nhện tới (3,1); ride_belt("D") lướt qua băng v(3,2) xuống (3,3).', 'Dùng hai lượt while front_pole() == "none": go_down() kèm sort_back() và sort_row().']
    }),

    trum({
      so: 10, ten: 'Trùm mùa: Robot phân loại phế liệu', hang: 'trum', khung: { chinh: 16, moiHam: 10 },
      hamCuaEmCan: ['crawl', 'go', 'hop_iron', 'sort_row'],
      deBai: 'Trùm mùa 3: robot phân loại phế liệu xuất xưởng qua ba ca trực. Mỗi ca chui qua gầm thấp đầu dây chuyền bằng crawl("R"), rồi đi sang phải trong khi chưa thấy nam châm VÀ chưa thấy sắt (while front_pole() == "none" and not front_metal(): go("R")). Nếu thấy sắt (front_metal()) thì bước hai ô lên sắt rồi gọi hop_iron("R") nhảy qua hố vào ô đích; ngược lại bước hai ô tới trước vật nam châm rồi gọi sort_row() phân loại theo cực N/S.',
      veMaMau: 'Chương trình có sẵn mới chui gầm và chỉ dò nam châm. Hoàn thiện vòng while có and và hai nhánh if / else.',
      san: [
        ['###########', '#######D###', '#.n....o..#', '#######D###', '###########'],
        ['###########', '########D##', '#.n.....o.#', '########D##', '###########'],
        ['###########', '###########', '#.n...ouD.#', '###########', '###########']
      ],
      vatChat: [
        ['...........', '...........', '.......N...', '...........', '...........'],
        ['...........', '...........', '........S..', '...........', '...........'],
        ['...........', '...........', '......s....', '...........', '...........']
      ],
      mau: [
        ['...........', '.......r...', '...........', '.......b...', '...........'],
        ['...........', '........r..', '...........', '........b..', '...........'],
        ['...........', '...........', '...........', '...........', '...........']
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(['crawl("R")', 'while front_pole() == "none":', '    go("R")', 'go("R")', 'go("R")', 'sort_row()']),
      loiGiai: bai(['crawl("R")', 'while front_pole() == "none" and not front_metal():', '    go("R")', 'if front_metal():', '    go("R")', '    go("R")', '    hop_iron("R")', 'else:', '    go("R")', '    go("R")', '    sort_row()']),
      sao: { o: 48, nhip: 50 },
      loiSai: [
        { moTa: 'Vòng while thiếu and not front_metal(): ca 3 gặp sắt không dừng nên rơi xuống hố', baiLam: bai(['crawl("R")', 'while front_pole() == "none":', '    go("R")', 'if front_metal():', '    go("R")', '    go("R")', '    hop_iron("R")', 'else:', '    go("R")', '    go("R")', '    sort_row()']), phaiCoMa: ['roi-ho'] },
        cung('Luôn gọi sort_row() cho mọi ca: ca 3 gặp mẩu sắt trước hố nên rơi xuống hố', bai(['crawl("R")', 'while front_pole() == "none" and not front_metal():', '    go("R")', 'go("R")', 'go("R")', 'sort_row()']), ['roi-ho']),
        cung('Bước cứng số ô theo ca 1: ca 2 và ca 3 lệch vị trí vật', bai(['crawl("R")', 'go("R")', 'go("R")', 'go("R")', 'sort_row()']), ['chua-dua-vat'])
      ],
      goiY: ['Sau crawl("R"), dùng while front_pole() == "none" and not front_metal(): go("R") để dừng đúng khoảng cách trên cả ba ca.', 'Nếu front_metal() là True (ca 3) thì go("R"), go("R"), hop_iron("R"); ngược lại (ca 1, ca 2) thì go("R"), go("R"), sort_row().']
    })
  );

  ManHoc.manTrumMua3 = DS;
  if (laNode) module.exports = ManHoc;
})();
