/* ============================================================================
   man-trum-mua-6.js — Mùa 6 "Mỏ đá" · Gói 10 "Máy mỏ đá R1" (20 màn)
   PDM6c: Gói 10 "R1 chạy một mình, nhiều sân":
     - MỌI màn MỘT robot: MÁY MỎ ĐÁ R1 ĐẦY ĐỦ (thân omni + tay hất đá chỉnh lực
       + radar tròn nhận dạng đá/quặng + đi chéo + đá lấp hố).
     - MỌI màn 2–3 sân ("ca làm việc"), sao.nhip = TỔNG nhịp mọi ca (nhipTheo: 'tong').
     - Một chương trình tổng quát thắng 3 sao mọi ca; mỗi màn có ít nhất 1 lời sai
       viết cứng (cung: true) thua ở ít nhất một ca.
   Mã màn: tong-hop-6.1 … .10; trum-mua-6.1 … .10.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY_MO_CU = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape'];
  var ROBOT_MO_CU = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }] };

  function chep(x) { return JSON.parse(JSON.stringify(x)); }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function cung(moTa, baiLam, phaiCoMa, them) { return Object.assign({ moTa: moTa, baiLam: baiLam, phaiCoMa: phaiCoMa, cung: true }, them || {}); }

  function man(m) {
    m.chuong = m.chuong || 'tong-hop-6';
    m.hang = m.hang || (m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum');
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'omni';
    m.robot = chep(ROBOT_MO_CU);
    m.omniCheo = true;
    m.chinhLuc = true;
    m.nhanDang = true;
    m.tamNemMacDinh = 2;
    m.daLapHo = true;
    m.hamGoc = KHAY_MO_CU.slice();
    m.mucTieu = m.mucTieu || 'toi-co';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    m.taoHam = m.taoHam || [];
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    if (m.so === 10 && !m.huyHieu) {
      m.huyHieu = {
        ma: m.chuong,
        ten: m.chuong === 'tong-hop-6' ? 'Huy hiệu Tổng hợp mỏ đá' : 'Huy hiệu Máy mỏ đá R1'
      };
    }
    return ManHoc.chuanHoa(m);
  }

  function manChe(m) {
    m.chuong = 'trum-mua-6';
    if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh;
    return man(m);
  }

  var T_FIX_QUARRY = ['s = shape("front")', 'if s == "round":', '    fill_pit()', 'else:', '    move()'];
  var T_FIX_QUARRY_SAI = ['s = shape("front")', 'if s == "ore":', '    fill_pit()', 'else:', '    move()'];

  var T_ORE_PAD = ['pad_kind()', 'forward(2)'];
  var T_DIAG_FILL = ['diag_right()', 'fill_pit()'];
  var T_BELT_PAD = ['belt_lob(n)', 'forward(2)'];
  var T_PIT_STEP = ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(3)'];
  var T_PIT_STEP_SAI = ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(2)'];
  var T_QUARRY_RUN = ['for i in range(n):', '    smart_pad()', '    slide_r(1)'];

  var DS = [
    /* ================================================= chương tong-hop-6 "Tổng hợp mỏ đá" ================================================= */
    man({
      so: 1, ten: 'Ca trực đầu tiên ở mỏ', chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['smart_pad', 'slide_r'],
      deBai: 'Hai ca làm việc mở đầu gói cuối mùa 6: ca 1 gặp đá tròn chắn trước hố sâu u, ca 2 gặp viên quặng chắn trước cổng sắt C và nút đè M. Hàm smart_pad() giúp Máy mỏ đá R1 tự nhận dạng vật trước mặt để lấp hố hoặc hất qua cổng lên nút đè M rồi tiến lên 2 ô. Bấm Chạy để xem R1 vượt cả hai ca.',
      veMaMau: 'Chương trình đã viết sẵn. Bấm Chạy để xem R1 xử lý cả hai ca làm việc.',
      san: [
        ['#######', '#.ou..#', '#..F..#', '#######'],
        ['#######', '#.oCM.#', '#..F..#', '#######']
      ],
      vatDang: [
        ['.......', '..r....', '.......', '.......'],
        ['.......', '..q....', '.......', '.......']
      ],
      noi: [
        [],
        [{ nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 1 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['smart_pad()', 'slide_r(1)']),
      loiGiai: bai(['smart_pad()', 'slide_r(1)']),
      sao: { o: 23, nhip: 10 },
      goiY: ['smart_pad() kiểm tra shape("front") == "round" để lấp hố hoặc gọi lob_pad(3) mở cổng.', 'Sau khi tiến tới (3,1), gọi slide_r(1) để trượt xuống cờ F(3,2).']
    }),

    man({
      so: 2, ten: 'Dò đá lấp hố dọc hầm',
      hamCuaEmCan: ['auto_fill'],
      deBai: 'Hai ca làm việc có vị trí tảng đá và hố sâu khác nhau dọc hành lang 4 bước hướng Bắc. Lặp 4 lần hàm auto_fill() để R1 tự quét radar phía Bắc: hễ gặp đá thì hất lấp hố trước mặt rồi tiến lên tới cờ F.',
      veMaMau: 'Chương trình mẫu lấp hố cứng ngay bước đầu nên rơi xuống hố ở ca 2. Hãy thay bằng vòng lặp 4 lần auto_fill().',
      san: [
        ['###', '#F#', '#.#', '#u#', '#o#', '#.#', '###'],
        ['###', '#F#', '#u#', '#o#', '#.#', '#.#', '###']
      ],
      vatDang: [
        ['...', '...', '...', '...', '.r.', '...', '...'],
        ['...', '...', '...', '.r.', '...', '...', '...']
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['fill_pit()', 'forward(2)']),
      loiGiai: bai(['for i in range(4):', '    auto_fill()']),
      sao: { o: 13, nhip: 12 },
      loiSai: [
        cung('Lấp hố cứng ở đầu đường theo ca 1: hỏng ở ca 2 khi đá và hố lùi xa hơn', bai(['fill_pit()', 'forward(2)']), ['nap-hut', 'dam-tuong']),
        { moTa: 'Chỉ lặp 3 lần auto_fill() nên dừng trước cờ F', baiLam: bai(['for i in range(3):', '    auto_fill()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['auto_fill() kiểm tra radar()[0][1] == "V" để gọi lob() trước khi move().', 'Từ (1,5) lên F(1,1) là 4 bước, nên lặp for i in range(4): auto_fill().']
    }),

    man({
      so: 3, ten: 'Phân loại đá và quặng ba hàng', mucTieu: 'dua-vat',
      hamCuaEmCan: ['sort_lob', 'slide_r'],
      deBai: 'Hai ca làm việc có 3 hàng đá tròn và quặng xếp ngược thứ tự nhau. Đá tròn cần hất tầm 2 vào máng D gần, còn quặng cần hất tầm 3 qua rào sắt = vào máng D xa. Dùng sort_lob() kết hợp slide_r(1) để nộp đủ cả 3 hàng.',
      veMaMau: 'Chương trình mẫu hất cứng tầm 2, 3, 2 theo ca 1 nên làm vỡ đá vào rào sắt ở ca 2.',
      san: [
        ['#######', '#.oD..#', '#.o=D.#', '#.oD..#', '#######'],
        ['#######', '#.o=D.#', '#.oD..#', '#.o=D.#', '#######']
      ],
      vatDang: [
        ['.......', '..r....', '..q....', '..r....', '.......'],
        ['.......', '..q....', '..r....', '..q....', '.......']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['lob()', 'slide_r(1)', 'aim_lob(3)', 'slide_r(1)', 'lob()']),
      loiGiai: bai(['sort_lob()', 'slide_r(1)', 'sort_lob()', 'slide_r(1)', 'sort_lob()']),
      sao: { o: 18, nhip: 16 },
      loiSai: [
        cung('Hất cứng tầm 2, 3, 2 theo ca 1: hỏng ở ca 2 khi thứ tự quặng và đá tròn đảo ngược', bai(['lob()', 'slide_r(1)', 'aim_lob(3)', 'slide_r(1)', 'lob()']), ['nem-vo']),
        { moTa: 'Quên gọi sort_lob() ở hàng thứ ba', baiLam: bai(['sort_lob()', 'slide_r(1)', 'sort_lob()', 'slide_r(1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['sort_lob() tự kiểm tra shape("front") == "ore" để chọn aim_lob(3) hay aim_lob(2).', 'Gọi lần lượt: sort_lob(), slide_r(1), sort_lob(), slide_r(1), sort_lob().']
    }),

    man({
      so: 4, ten: 'Dò trụ đá lách chéo',
      hamCuaEmCan: ['auto_bypass'],
      deBai: 'Hai ca làm việc có trụ đá # chắn ở chặng đầu hoặc chặng sau theo hướng Bắc. Mỗi lần gọi auto_bypass() giúp R1 quét radar phía trước: nếu gặp trụ đá # thì lách chéo bypass_r(), nếu trống thì tiến thẳng 2 ô. Gọi auto_bypass() hai lần để về cờ F.',
      veMaMau: 'Chương trình mẫu lách chéo cứng ở chặng đầu nên đâm vào trụ đá ở ca 2.',
      san: [
        ['####', '#F.#', '#..#', '#..#', '##.#', '#..#', '####'],
        ['####', '#F.#', '##.#', '#..#', '#..#', '#..#', '####']
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['bypass_r()', 'forward(2)']),
      loiGiai: bai(['auto_bypass()', 'auto_bypass()']),
      sao: { o: 14, nhip: 8 },
      loiSai: [
        cung('Lách chéo cứng ở chặng đầu rồi đi thẳng theo ca 1: đâm vào trụ đá ở ca 2', bai(['bypass_r()', 'forward(2)']), ['dam-tuong']),
        { moTa: 'Chỉ gọi auto_bypass() một lần nên dừng giữa đường', baiLam: bai(['auto_bypass()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi lần gọi auto_bypass() đưa R1 tiến lên 2 hàng.', 'Gọi auto_bypass() 2 lần liên tiếp để đi từ (1,5) lên F(1,1).']
    }),

    man({
      so: 5, ten: 'Đọc mốc tường chỉnh lực lấp hố',
      hamCuaEmCan: ['auto_aim'],
      deBai: 'Hai ca làm việc có 2 chặng hố sâu (cách 2 ô hoặc 3 ô) được báo hiệu bởi vách đá # bên phải R1. Gọi auto_aim() hai lần để tự nhìn vách đá bên phải, chỉnh lực hất lấp hố và tiến 3 ô mỗi chặng, rồi gọi move() bước vào cờ F.',
      veMaMau: 'Chương trình mẫu hất cứng tầm 3 rồi tầm 2 theo ca 1 nên rơi xuống hố ở ca 2.',
      san: [
        ['#####', '#.F.#', '#...#', '#.u.#', '#.o.#', '#.u.#', '#...#', '#.o##', '#..##', '#####'],
        ['#####', '#.F.#', '#.u.#', '#...#', '#.o##', '#..##', '#.u.#', '#.o.#', '#...#', '#####']
      ],
      vatDang: [
        ['.....', '.....', '.....', '.....', '..r..', '.....', '.....', '..r..', '.....', '.....'],
        ['.....', '.....', '.....', '.....', '..r..', '.....', '.....', '..r..', '.....', '.....']
      ],
      batDau: { x: 2, y: 8, huong: 0 },
      maMau: bai(['fill_far()', 'fill_pit()', 'forward(2)']),
      loiGiai: bai(['auto_aim()', 'auto_aim()', 'move()']),
      sao: { o: 20, nhip: 22 },
      loiSai: [
        cung('Hất cứng tầm 3 ở chặng 1 và tầm 2 ở chặng 2 theo ca 1: rơi xuống hố ở ca 2', bai(['fill_far()', 'fill_pit()', 'forward(2)']), ['roi-ho']),
        { moTa: 'Quên gọi move() cuối cùng để bước vào cờ F(2,1)', baiLam: bai(['auto_aim()', 'auto_aim()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['auto_aim() kiểm tra radar()[1][2] == "#" để chọn aim_lob(3) hay aim_lob(2), rồi tiến 3 ô.', 'Sau 2 lần auto_aim(), R1 đứng ở (2,2); gọi thêm move() để tới F(2,1).']
    }),

    man({
      so: 6, ten: 'Trượt băng mở cổng rồi dò mỏ',
      hamCuaEmCan: ['belt_lob', 'forward', 'slide_r', 'smart_pad'],
      deBai: 'Ở hàng trên, R1 bước lên băng chuyền > bằng belt_lob(3) để mượn đà hất đá qua cổng C(5,1) lên nút đè M(6,1), rồi tiến 2 ô qua cổng và trượt xuống hàng 2. Ở hàng 2, dùng smart_pad() để tự xử lý hố sâu (ca 1) hoặc cổng sắt (ca 2), rồi trượt xuống cờ F.',
      veMaMau: 'Chương trình mẫu ở hàng 2 dùng fill_pit() cứng nên đâm vào cổng C ở ca 2.',
      san: [
        ['##########', '#.>.oCM..#', '#.....ou.#', '#......F.#', '##########'],
        ['##########', '#.>.oCM..#', '#.....oCM#', '#......F.#', '##########']
      ],
      vatDang: [
        ['..........', '....r.....', '......r...', '..........', '..........'],
        ['..........', '....r.....', '......q...', '..........', '..........']
      ],
      noi: [
        [{ nut: { x: 6, y: 1 }, cua: [{ x: 5, y: 1 }] }],
        [{ nut: { x: 6, y: 1 }, cua: [{ x: 5, y: 1 }] }, { nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['belt_lob(3)', 'forward(2)', 'slide_r(1)', 'fill_pit()', 'slide_r(1)']),
      loiGiai: bai(['belt_lob(3)', 'forward(2)', 'slide_r(1)', 'smart_pad()', 'slide_r(1)']),
      sao: { o: 28, nhip: 22 },
      loiSai: [
        cung('Dùng fill_pit() cứng ở hàng 2 theo ca 1: hỏng ở ca 2 khi gặp quặng và cổng sắt', bai(['belt_lob(3)', 'forward(2)', 'slide_r(1)', 'fill_pit()', 'slide_r(1)']), ['roi-ho']),
        { moTa: 'Dùng belt_lob(2) ở hàng 1 nên đá rơi vào ô cổng C(5,1) thay vì nút M(6,1)', baiLam: bai(['belt_lob(2)', 'forward(2)', 'slide_r(1)', 'smart_pad()', 'slide_r(1)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Hàng 1: belt_lob(3) rồi forward(2) đưa R1 tới (5,1).', 'Trượt xuống (5,2) bằng slide_r(1), gọi smart_pad() để tới (7,2), rồi gọi slide_r(1) vào F(7,3).']
    }),

    man({
      so: 7, ten: 'Mở cổng lối bên rồi vượt chặng chính',
      hamCuaEmCan: ['diag_pad', 'smart_pad', 'slide_l'],
      deBai: 'Cổng sắt đầu tiên C(3,2) có nút đè M(5,3) nằm lệch ở làn dưới sau hàng rào sắt. Gọi diag_pad(3) để R1 lách chéo xuống hất đá mở cổng rồi lách chéo trái về (3,2). Sau đó gọi smart_pad() vượt chặng thứ hai và trượt trái slide_l(1) lên cờ F(5,1).',
      veMaMau: 'Chương trình mẫu ở chặng hai gọi lob_pad(3) cứng nên hỏng ở ca 1 khi gặp đá tròn và hố sâu.',
      san: [
        ['#########', '#....F..#', '#..Cou..#', '#..o=M..#', '#########'],
        ['#########', '#....F..#', '#..CoCM.#', '#..o=M..#', '#########']
      ],
      vatDang: [
        ['.........', '.........', '....r....', '...r.....', '.........'],
        ['.........', '.........', '....q....', '...r.....', '.........']
      ],
      noi: [
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 3, y: 2 }] }],
        [{ nut: { x: 5, y: 3 }, cua: [{ x: 3, y: 2 }] }, { nut: { x: 6, y: 2 }, cua: [{ x: 5, y: 2 }] }]
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(['diag_pad(3)', 'lob_pad(3)', 'slide_l(1)']),
      loiGiai: bai(['diag_pad(3)', 'smart_pad()', 'slide_l(1)']),
      sao: { o: 27, nhip: 18 },
      loiSai: [
        cung('Gọi lob_pad(3) cứng ở chặng hai theo ca 2: ở ca 1 hất đá vọt qua hố u(5,2) nên rơi xuống hố', bai(['diag_pad(3)', 'lob_pad(3)', 'slide_l(1)']), ['roi-ho']),
        { moTa: 'Gọi diag_pad(2) làm đá vướng hàng rào sắt (4,3) nên cổng C(3,2) không mở', baiLam: bai(['diag_pad(2)', 'smart_pad()', 'slide_l(1)']), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      goiY: ['diag_pad(3) đưa R1 lách xuống (2,3), hất đá tầm 3 lên M(5,3) rồi lách về (3,2).', 'Tiếp theo gọi smart_pad() để tới (5,2), rồi slide_l(1) lên cờ F(5,1).']
    }),

    man({
      so: 8, ten: 'Tiến lên lọc đá ba tầng', mucTieu: 'dua-vat',
      hamCuaEmCan: ['pad_kind', 'slide_r'],
      deBai: 'Ba hàng mỏ có các viên đá tròn và quặng đặt lùi dần về bên phải. Hàm pad_kind() giúp R1 tiến 1 ô tới sát viên đá rồi gọi sort_lob() hất đúng tầm vào máng D. Kết hợp pad_kind() và slide_r(1) để nộp đủ cả 3 hàng.',
      veMaMau: 'Chương trình mẫu dùng move_lob() tầm 2 cố định nên làm vỡ quặng vào hàng rào sắt.',
      san: [
        ['#########', '#..oD...#', '#...o=D.#', '#....oD.#', '#########'],
        ['#########', '#..o=D..#', '#...oD..#', '#....o=D#', '#########']
      ],
      vatDang: [
        ['.........', '...r.....', '....q....', '.....r...', '.........'],
        ['.........', '...q.....', '....r....', '.....q...', '.........']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['move()', 'lob()', 'slide_r(1)', 'move()', 'aim_lob(3)', 'slide_r(1)', 'move()', 'lob()']),
      loiGiai: bai(['pad_kind()', 'slide_r(1)', 'pad_kind()', 'slide_r(1)', 'pad_kind()']),
      sao: { o: 23, nhip: 22 },
      loiSai: [
        cung('Hất cứng tầm 2, 3, 2 theo ca 1: hỏng ở ca 2 khi loại vật đảo ngược', bai(['move()', 'lob()', 'slide_r(1)', 'move()', 'aim_lob(3)', 'slide_r(1)', 'move()', 'lob()']), ['nem-vo']),
        { moTa: 'Gọi sort_lob() mà không tiến 1 ô bằng pad_kind() nên nạp hụt', baiLam: bai(['sort_lob()', 'slide_r(1)', 'sort_lob()', 'slide_r(1)', 'sort_lob()']), phaiCoMa: ['nap-hut'] }
      ],
      goiY: ['Mỗi lần gọi pad_kind() giúp R1 tiến 1 ô sang phải rồi hất đúng tầm.', 'Sau đó gọi slide_r(1) xuống hàng dưới sẽ đứng cách viên đá kế tiếp đúng 1 ô trống.']
    }),

    man({
      so: 9, ten: 'Sửa hàm dò đá tròn lấp hố', chinhCoDinh: true,
      hamCuaEmCan: ['fill_pit'],
      deBai: 'Hai ca làm việc: hàm của màn fix_quarry() phải kiểm tra nếu trước mũi là đá tròn (shape("front") == "round") thì gọi fill_pit() lấp hố và tiến 2 ô, ngược lại thì move() 1 ô. Nhưng trong hàm đang viết nhầm điều kiện thành "ore". Hãy sửa lại hàm fix_quarry().',
      veMaMau: 'Chương trình chính đã khoá. Sửa "ore" thành "round" trong hàm fix_quarry().',
      san: [
        ['#######', '#.ou.F#', '#######'],
        ['#######', '#..ouF#', '#######']
      ],
      vatDang: [
        ['.......', '..r....', '.......'],
        ['.......', '...r...', '.......']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['for i in range(3):', '    fix_quarry()'], { hamCuaMan: [H('fix_quarry', [], T_FIX_QUARRY_SAI)] }),
      loiGiai: bai(['for i in range(3):', '    fix_quarry()'], { hamCuaMan: [H('fix_quarry', [], T_FIX_QUARRY)] }),
      sao: { o: 17, nhip: 12 },
      loiSai: [
        { moTa: 'Chưa sửa "ore" thành "round" nên R1 không lấp hố mà bước thẳng vào đá', baiLam: bai(['for i in range(3):', '    fix_quarry()'], { hamCuaMan: [H('fix_quarry', [], T_FIX_QUARRY_SAI)] }), phaiCoMa: ['dam-tuong'] },
        cung('Trong fix_quarry() luôn gọi fill_pit() không kiểm tra shape: hỏng ở bước trống', bai(['for i in range(3):', '    fix_quarry()'], { hamCuaMan: [H('fix_quarry', [], ['fill_pit()'])] }), ['nap-hut', 'dam-tuong'])
      ],
      goiY: ['Viên đá lấp hố có hình dạng "round".', 'Đổi dòng đầu của fix_quarry() thành if shape("front") == "round":.']
    }),

    man({
      so: 10, ten: 'Trùm: Ca khai mỏ liên hoàn', hang: 'trum',
      hamCuaEmCan: ['open_dock', 'forward', 'slide_r', 'smart_pad'],
      deBai: 'Ba ca làm việc trùm chương Tổng hợp: ở tầng 1, dùng open_dock(3) lấp hố rồi hất đá thứ hai qua cổng C(5,1) lên nút M(6,1), tiến 2 ô qua cổng và trượt xuống tầng 2. Ở tầng 2 và tầng 3, mỗi tầng dùng smart_pad() rồi slide_r(1) để tự vượt hố sâu hoặc cổng sắt tiến vào cờ F(9,4).',
      veMaMau: 'Chương trình mẫu đã mở xong tầng 1. Hãy viết tiếp 2 tầng còn lại bằng smart_pad() và slide_r(1).',
      san: [
        ['############', '#.ouoCM....#', '#.....ou...#', '#.......oCM#', '#........F.#', '############'],
        ['############', '#.ouoCM....#', '#.....oCM..#', '#.......ou.#', '#........F.#', '############'],
        ['############', '#.ouoCM....#', '#.....oCM..#', '#.......oCM#', '#........F.#', '############']
      ],
      vatDang: [
        ['............', '..r.r.......', '......r.....', '........q...', '............', '............'],
        ['............', '..r.r.......', '......q.....', '........r...', '............', '............'],
        ['............', '..r.r.......', '......q.....', '........q...', '............', '............']
      ],
      noi: [
        [{ nut: { x: 6, y: 1 }, cua: [{ x: 5, y: 1 }] }, { nut: { x: 10, y: 3 }, cua: [{ x: 9, y: 3 }] }],
        [{ nut: { x: 6, y: 1 }, cua: [{ x: 5, y: 1 }] }, { nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }],
        [{ nut: { x: 6, y: 1 }, cua: [{ x: 5, y: 1 }] }, { nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }, { nut: { x: 10, y: 3 }, cua: [{ x: 9, y: 3 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['open_dock(3)', 'forward(2)', 'slide_r(1)']),
      loiGiai: bai(['open_dock(3)', 'forward(2)', 'slide_r(1)', 'smart_pad()', 'slide_r(1)', 'smart_pad()', 'slide_r(1)']),
      sao: { o: 32, nhip: 57 },
      loiSai: [
        cung('Tầng 2 dùng fill_pit() cứng và tầng 3 dùng lob_pad(3) cứng theo ca 1: hỏng ở ca 2', bai(['open_dock(3)', 'forward(2)', 'slide_r(1)', 'fill_pit()', 'slide_r(1)', 'lob_pad(3)', 'slide_r(1)']), ['roi-ho']),
        { moTa: 'Quên gọi forward(2) sau open_dock(3) nên trượt xuống khi chưa tới cột 5', baiLam: bai(['open_dock(3)', 'slide_r(1)', 'smart_pad()', 'slide_r(1)', 'smart_pad()', 'slide_r(1)']), phaiCoMa: ['nap-hut', 'chua-toi-co'] }
      ],
      goiY: ['open_dock(3) dừng ở (3,1) và mở cổng C(5,1); gọi forward(2), slide_r(1) để tới (5,2).', 'Từ (5,2) gọi smart_pad(), slide_r(1) tới (7,3), rồi gọi smart_pad(), slide_r(1) lần nữa tới F(9,4).']
    }),

    /* ================================================= chương trum-mua-6 "Máy mỏ đá R1" ================================================= */
    manChe({
      so: 1, ten: 'Chế hàm tiến lọc đá mở lối', taoHam: ['ore_pad'],
      hamCuaEmCan: ['pad_kind', 'forward', 'slide_r'],
      deBai: 'Hai ca làm việc: viên đá nằm cách R1 một ô trống, phía sau là hố sâu u (ca 1) hoặc cổng sắt C và nút đè M (ca 2). Hãy tạo hàm ore_pad() gồm 2 dòng: gọi pad_kind() (tiến 1 ô và hất theo loại đá) rồi gọi forward(2) bước lên ô hố đã lấp hoặc cổng đã mở. Chương trình chính đã khoá.',
      veMaMau: 'Bấm "+ Hàm mới" tạo hàm ore_pad() không có đối số.',
      san: [
        ['########', '#..ou..#', '#...F..#', '########'],
        ['########', '#..oCM.#', '#...F..#', '########']
      ],
      vatDang: [
        ['........', '...r....', '........', '........'],
        ['........', '...q....', '........', '........']
      ],
      noi: [
        [],
        [{ nut: { x: 5, y: 1 }, cua: [{ x: 4, y: 1 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['ore_pad()', 'slide_r(1)']),
      loiGiai: bai(['ore_pad()', 'slide_r(1)'], { hamCuaEmMoi: [H('ore_pad', [], T_ORE_PAD)] }),
      sao: { o: 24, nhip: 12 },
      loiSai: [
        { moTa: 'Gọi ore_pad() mà chưa tạo hàm', baiLam: bai(['ore_pad()', 'slide_r(1)']), phaiCoMa: ['ham-chua-co'] },
        cung('Trong ore_pad() dùng fill_pit() cứng theo ca 1: hỏng ở ca 2 khi gặp quặng và cổng C', bai(['ore_pad()', 'slide_r(1)']), ['dam-tuong'], { hamCuaEmMoi: [H('ore_pad', [], ['move()', 'fill_pit()'])] })
      ],
      goiY: ['pad_kind() đã tiến 1 ô và gọi sort_lob() để hất tầm 2 (đá tròn) hoặc tầm 3 (quặng).', 'Thân hàm ore_pad() chỉ cần 2 dòng: pad_kind() và forward(2).']
    }),

    manChe({
      so: 2, ten: 'Chế hàm lách chéo lấp hố', taoHam: ['diag_fill'],
      hamCuaEmCan: ['fill_pit', 'auto_fill'],
      deBai: 'Hai ca làm việc: trụ đá # chắn ngay trước mặt R1 ở (1,7), còn ở cột bên phải (cột 2) có đá tròn và hố sâu u. Hãy tạo hàm diag_fill() gồm: diag_right() lách chéo sang phải, rồi gọi fill_pit() lấp hố và tiến lên 2 ô. Chương trình chính đã khoá.',
      veMaMau: 'Bấm "+ Hàm mới" tạo hàm diag_fill() không có đối số.',
      san: [
        ['####', '#.F#', '#..#', '#.u#', '#.o#', '#.u#', '#.o#', '##.#', '#..#', '####'],
        ['####', '#.F#', '#.u#', '#.o#', '#..#', '#.u#', '#.o#', '##.#', '#..#', '####']
      ],
      vatDang: [
        ['....', '....', '....', '....', '..r.', '....', '..r.', '....', '....', '....'],
        ['....', '....', '....', '..r.', '....', '....', '..r.', '....', '....', '....']
      ],
      batDau: { x: 1, y: 8, huong: 0 },
      maMau: bai(['diag_fill()', 'for i in range(4):', '    auto_fill()']),
      loiGiai: bai(['diag_fill()', 'for i in range(4):', '    auto_fill()'], { hamCuaEmMoi: [H('diag_fill', [], T_DIAG_FILL)] }),
      sao: { o: 20, nhip: 22 },
      loiSai: [
        { moTa: 'Gọi diag_fill() mà chưa tạo hàm', baiLam: bai(['diag_fill()', 'for i in range(4):', '    auto_fill()']), phaiCoMa: ['ham-chua-co'] },
        cung('Trong diag_fill() lấp thêm cả hố thứ hai ở (2,3) theo ca 1: hỏng ở ca 2', bai(['diag_fill()', 'for i in range(4):', '    auto_fill()']), ['nap-hut', 'dam-tuong'], { hamCuaEmMoi: [H('diag_fill', [], ['diag_right()', 'fill_pit()', 'fill_pit()'])] })
      ],
      goiY: ['diag_right() đưa R1 từ (1,8) chéo lên (2,7) ngay trước viên đá tròn (2,6).', 'Sau đó fill_pit() hất đá lấp hố (2,5) và bước tới (2,5) để vòng lặp auto_fill() lo phần còn lại.']
    }),

    manChe({
      so: 3, ten: 'Chế hàm mượn băng mở cổng', taoHam: ['belt_pad'],
      hamCuaEmCan: ['belt_lob', 'forward', 'smart_pad', 'slide_r'],
      deBai: 'Hai ca làm việc: sau khi vượt tầng 1 bằng smart_pad() và trượt xuống tầng 2, R1 gặp ô băng chuyền > dẫn tới viên đá trước cổng sắt C(7,2) và nút đè M(8,2). Hãy tạo hàm belt_pad(n) gồm: belt_lob(n) để bước lên băng và hất đá tầm n, rồi gọi forward(2) bước qua cổng. Chương trình chính đã khoá.',
      veMaMau: 'Bấm "+ Hàm mới" tạo hàm belt_pad(n) với 1 đối số n.',
      san: [
        ['##########', '#.ou.....#', '#...>.oCM#', '#......F.#', '##########'],
        ['##########', '#.oCM....#', '#...>.oCM#', '#......F.#', '##########']
      ],
      vatDang: [
        ['..........', '..r.......', '......r...', '..........', '..........'],
        ['..........', '..q.......', '......r...', '..........', '..........']
      ],
      noi: [
        [{ nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }],
        [{ nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 1 }] }, { nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['smart_pad()', 'slide_r(1)', 'belt_pad(3)', 'slide_r(1)']),
      loiGiai: bai(['smart_pad()', 'slide_r(1)', 'belt_pad(3)', 'slide_r(1)'], { hamCuaEmMoi: [H('belt_pad', ['n'], T_BELT_PAD)] }),
      sao: { o: 29, nhip: 22 },
      loiSai: [
        { moTa: 'Gọi belt_pad(3) mà chưa tạo hàm', baiLam: bai(['smart_pad()', 'slide_r(1)', 'belt_pad(3)', 'slide_r(1)']), phaiCoMa: ['ham-chua-co'] },
        cung('Trong belt_pad(n) hất cứng tầm 2 thay vì n: đá rơi vào cổng C(7,2), không mở được cổng', bai(['smart_pad()', 'slide_r(1)', 'belt_pad(3)', 'slide_r(1)']), ['dam-tuong'], { hamCuaEmMoi: [H('belt_pad', ['n'], ['belt_lob(2)', 'forward(2)'])] })
      ],
      goiY: ['Thân hàm belt_pad(n) gồm 2 dòng: belt_lob(n) và forward(2).', 'Nhớ truyền đúng tham số n vào belt_lob(n).']
    }),

    manChe({
      so: 4, ten: 'Sửa hàm bước mỏ hai nhánh',
      hamCuaEmCan: ['aim_lob', 'forward', 'lob_pad', 'slide_r'],
      deBai: 'Hai ca làm việc: hàm của màn pit_step() kiểm tra nếu shape("front") == "round" thì gọi aim_lob(2) và forward(2) để lấp hố, ngược lại gọi lob_pad(3) để hất quặng qua cổng C lên nút đè M. Nhưng nhánh else đang viết nhầm thành lob_pad(2). Hãy sửa lại hàm pit_step().',
      veMaMau: 'Chương trình chính đã khoá. Sửa lob_pad(2) thành lob_pad(3) trong hàm pit_step().',
      san: [
        ['#########', '#.ou....#', '#...oCM.#', '#....F..#', '#########'],
        ['#########', '#.oCM...#', '#...ou..#', '#....F..#', '#########']
      ],
      vatDang: [
        ['.........', '..r......', '....q....', '.........', '.........'],
        ['.........', '..q......', '....r....', '.........', '.........']
      ],
      noi: [
        [{ nut: { x: 6, y: 2 }, cua: [{ x: 5, y: 2 }] }],
        [{ nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 1 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['pit_step()', 'slide_r(1)', 'pit_step()', 'slide_r(1)'], { hamCuaMan: [H('pit_step', [], T_PIT_STEP_SAI)] }),
      loiGiai: bai(['pit_step()', 'slide_r(1)', 'pit_step()', 'slide_r(1)'], { hamCuaMan: [H('pit_step', [], T_PIT_STEP)] }),
      sao: { o: 25, nhip: 20 },
      loiSai: [
        { moTa: 'Chưa sửa lob_pad(2) thành lob_pad(3) nên quặng không bay tới nút đè M', baiLam: bai(['pit_step()', 'slide_r(1)', 'pit_step()', 'slide_r(1)'], { hamCuaMan: [H('pit_step', [], T_PIT_STEP_SAI)] }), phaiCoMa: ['dam-tuong'] },
        cung('Trong pit_step() luôn gọi aim_lob(2), forward(2) theo tầng 1 ca 1: hỏng khi gặp cổng sắt C', bai(['pit_step()', 'slide_r(1)', 'pit_step()', 'slide_r(1)'], { hamCuaMan: [H('pit_step', [], ['aim_lob(2)', 'forward(2)'])] }), ['dam-tuong'])
      ],
      goiY: ['Từ vị trí trước viên quặng tới nút đè M là 3 ô (quặng, cổng C, nút M).', 'Đổi lob_pad(2) thành lob_pad(3) ở dòng cuối hàm pit_step().']
    }),

    manChe({
      so: 5, ten: 'Chế hàm chuỗi bước mỏ', taoHam: ['quarry_run'],
      hamCuaEmCan: ['smart_pad', 'slide_r'],
      deBai: 'Hai ca làm việc có 3 tầng mỏ liên tiếp xếp bậc thang. Hãy tạo hàm quarry_run(n) lặp n lần: mỗi lần gọi smart_pad() để vượt hố hoặc cổng sắt trên tầng hiện tại, rồi gọi slide_r(1) trượt xuống tầng kế tiếp. Chương trình chính đã khoá với quarry_run(3).',
      veMaMau: 'Bấm "+ Hàm mới" tạo hàm quarry_run(n) với 1 đối số n.',
      san: [
        ['###########', '#.ou......#', '#...oCM...#', '#.....ou..#', '#......F..#', '###########'],
        ['###########', '#.oCM.....#', '#...ou....#', '#.....oCM.#', '#......F..#', '###########']
      ],
      vatDang: [
        ['...........', '..r........', '....q......', '......r....', '...........', '...........'],
        ['...........', '..q........', '....r......', '......q....', '...........', '...........']
      ],
      noi: [
        [{ nut: { x: 6, y: 2 }, cua: [{ x: 5, y: 2 }] }],
        [{ nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 1 }] }, { nut: { x: 8, y: 3 }, cua: [{ x: 7, y: 3 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['quarry_run(3)']),
      loiGiai: bai(['quarry_run(3)'], { hamCuaEmMoi: [H('quarry_run', ['n'], T_QUARRY_RUN)] }),
      sao: { o: 25, nhip: 30 },
      loiSai: [
        { moTa: 'Gọi quarry_run(3) mà chưa tạo hàm', baiLam: bai(['quarry_run(3)']), phaiCoMa: ['ham-chua-co'] },
        cung('Trong quarry_run(n) chỉ lặp cứng 2 lần thay vì n lần: dừng trước tầng cuối', bai(['quarry_run(3)']), ['chua-toi-co'], { hamCuaEmMoi: [H('quarry_run', ['n'], ['for i in range(2):', '    smart_pad()', '    slide_r(1)'])] })
      ],
      goiY: ['Trong thân hàm quarry_run(n), viết vòng lặp for i in range(n):.', 'Bên trong vòng lặp gồm 2 dòng: smart_pad() và slide_r(1).']
    }),

    manChe({
      so: 6, ten: 'Hai chặng tiến lọc đá', chinhCoDinh: false,
      hamCuaEmCan: ['ore_pad', 'slide_r'],
      deBai: 'Hai ca làm việc có hai tầng mỏ mà mỗi viên đá đều nằm cách R1 một ô trống. Hãy viết chương trình chính gọi ore_pad(), slide_r(1), ore_pad(), slide_r(1) để vượt cả hai tầng và đáp xuống cờ F(7,3).',
      veMaMau: 'Chương trình mẫu mới vượt tầng đầu. Hãy viết tiếp tầng thứ hai.',
      san: [
        ['###########', '#..ou.....#', '#.....oCM.#', '#......F..#', '###########'],
        ['###########', '#..oCM....#', '#.....ou..#', '#......F..#', '###########']
      ],
      vatDang: [
        ['...........', '...r.......', '......q....', '...........', '...........'],
        ['...........', '...q.......', '......r....', '...........', '...........']
      ],
      noi: [
        [{ nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }],
        [{ nut: { x: 5, y: 1 }, cua: [{ x: 4, y: 1 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['ore_pad()', 'slide_r(1)']),
      loiGiai: bai(['ore_pad()', 'slide_r(1)', 'ore_pad()', 'slide_r(1)']),
      sao: { o: 26, nhip: 24 },
      loiSai: [
        { moTa: 'Mới đi hết tầng 1, chưa gọi ore_pad() và slide_r(1) ở tầng 2', baiLam: bai(['ore_pad()', 'slide_r(1)']), phaiCoMa: ['chua-toi-co'] },
        cung('Ở tầng 2 tiến rồi gọi fill_pit() cứng theo ca 2: hỏng ở ca 1 khi gặp cổng sắt', bai(['ore_pad()', 'slide_r(1)', 'move()', 'fill_pit()', 'slide_r(1)']), ['dam-tuong'])
      ],
      goiY: ['Mỗi lần gọi ore_pad() đưa R1 tiến 3 ô sang phải.', 'Từ (1,1): ore_pad() tới (4,1), slide_r(1) tới (4,2), ore_pad() tới (7,2), slide_r(1) tới F(7,3).']
    }),

    manChe({
      so: 7, ten: 'Lách chéo rồi tiến lọc đá', chinhCoDinh: false,
      hamCuaEmCan: ['diag_fill', 'ore_pad', 'slide_r'],
      deBai: 'Hai ca làm việc: đầu hầm có trụ đá # chắn ở (2,1). Hãy gọi diag_fill() để lách chéo xuống hàng 2 và lấp hố đầu tiên tới (4,2), sau đó gọi ore_pad() để tiến tới lọc viên đá thứ hai ở (6,2) vượt qua hố hoặc cổng sắt tới (7,2), rồi gọi slide_r(1) vào cờ F(7,3).',
      veMaMau: 'Kết hợp diag_fill(), ore_pad() và slide_r(1) bạn đã chế.',
      san: [
        ['###########', '#.#.......#', '#..ou.ou..#', '#......F..#', '###########'],
        ['###########', '#.#.......#', '#..ou.oCM.#', '#......F..#', '###########']
      ],
      vatDang: [
        ['...........', '...........', '...r..r....', '...........', '...........'],
        ['...........', '...........', '...r..q....', '...........', '...........']
      ],
      noi: [
        [],
        [{ nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['diag_fill()']),
      loiGiai: bai(['diag_fill()', 'ore_pad()', 'slide_r(1)']),
      sao: { o: 29, nhip: 22 },
      loiSai: [
        { moTa: 'Gọi smart_pad() ngay ở (4,2) khi viên đá thứ hai ở (6,2) còn cách 1 ô trống', baiLam: bai(['diag_fill()', 'smart_pad()', 'slide_r(1)']), phaiCoMa: ['nap-hut', 'dam-tuong'] },
        cung('Ở chặng hai gọi move(), fill_pit() cứng theo ca 1: hỏng ở ca 2 khi gặp cổng sắt', bai(['diag_fill()', 'move()', 'fill_pit()', 'slide_r(1)']), ['dam-tuong'])
      ],
      goiY: ['diag_fill() đưa R1 từ (1,1) tới (4,2).', 'Từ (4,2), gọi ore_pad() để tiến lên (5,2), lọc đá ở (6,2) và bước tới (7,2), rồi gọi slide_r(1) xuống F(7,3).']
    }),

    manChe({
      so: 8, ten: 'Trượt băng rồi chạy chuỗi bước mỏ', chinhCoDinh: false,
      hamCuaEmCan: ['belt_pad', 'slide_r', 'quarry_run'],
      deBai: 'Hai ca làm việc: ở tầng 1, dùng belt_pad(3) mượn đà băng chuyền mở cổng C(5,1) và bước lên (5,1), rồi gọi slide_r(1) xuống (5,2). Từ (5,2), gọi quarry_run(2) để vượt tiếp 2 tầng mỏ bên dưới và đáp xuống cờ F(9,4).',
      veMaMau: 'Kết hợp belt_pad(3), slide_r(1) và quarry_run(2).',
      san: [
        ['############', '#.>.oCM....#', '#.....ou...#', '#.......oCM#', '#........F.#', '############'],
        ['############', '#.>.oCM....#', '#.....oCM..#', '#.......ou.#', '#........F.#', '############']
      ],
      vatDang: [
        ['............', '....r.......', '......r.....', '........q...', '............', '............'],
        ['............', '....r.......', '......q.....', '........r...', '............', '............']
      ],
      noi: [
        [{ nut: { x: 6, y: 1 }, cua: [{ x: 5, y: 1 }] }, { nut: { x: 10, y: 3 }, cua: [{ x: 9, y: 3 }] }],
        [{ nut: { x: 6, y: 1 }, cua: [{ x: 5, y: 1 }] }, { nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['belt_pad(3)', 'slide_r(1)']),
      loiGiai: bai(['belt_pad(3)', 'slide_r(1)', 'quarry_run(2)']),
      sao: { o: 31, nhip: 32 },
      loiSai: [
        { moTa: 'Quên gọi slide_r(1) sau belt_pad(3) nên gọi quarry_run(2) ngay ở hàng 1', baiLam: bai(['belt_pad(3)', 'quarry_run(2)']), phaiCoMa: ['dam-tuong'] },
        cung('Viết cứng fill_pit() rồi lob_pad(3) theo ca 1: hỏng ở ca 2', bai(['belt_pad(3)', 'slide_r(1)', 'fill_pit()', 'slide_r(1)', 'lob_pad(3)', 'slide_r(1)']), ['roi-ho'])
      ],
      goiY: ['belt_pad(3) đưa R1 tới (5,1); gọi slide_r(1) để xuống (5,2).', 'Tại (5,2), gọi quarry_run(2) để vượt tầng 2 và tầng 3 vào F(9,4).']
    }),

    manChe({
      so: 9, ten: 'Vượt ba tầng mỏ sâu', chinhCoDinh: false,
      hamCuaEmCan: ['ore_pad', 'slide_r', 'quarry_run'],
      deBai: 'Hai ca làm việc: ở tầng 1, viên đá cách R1 một ô trống nên dùng ore_pad() rồi slide_r(1) để tới (4,2). Ở tầng 2 và tầng 3, các viên đá nằm ngay trước mặt sau mỗi lần trượt xuống nên chỉ cần gọi quarry_run(2) là về tới cờ F(8,4).',
      veMaMau: 'Kết hợp ore_pad(), slide_r(1) và quarry_run(2).',
      san: [
        ['###########', '#..ou.....#', '#....oCM..#', '#......ou.#', '#.......F.#', '###########'],
        ['###########', '#..oCM....#', '#....ou...#', '#......oCM#', '#.......F.#', '###########']
      ],
      vatDang: [
        ['...........', '...r.......', '.....q.....', '.......r...', '...........', '...........'],
        ['...........', '...q.......', '.....r.....', '.......q...', '...........', '...........']
      ],
      noi: [
        [{ nut: { x: 7, y: 2 }, cua: [{ x: 6, y: 2 }] }],
        [{ nut: { x: 5, y: 1 }, cua: [{ x: 4, y: 1 }] }, { nut: { x: 9, y: 3 }, cua: [{ x: 8, y: 3 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['ore_pad()']),
      loiGiai: bai(['ore_pad()', 'slide_r(1)', 'quarry_run(2)']),
      sao: { o: 35, nhip: 32 },
      loiSai: [
        { moTa: 'Gọi quarry_run(3) từ đầu khi viên đá tầng 1 cách 1 ô trống', baiLam: bai(['quarry_run(3)']), phaiCoMa: ['nap-hut', 'dam-tuong'] },
        cung('Ở tầng 1 gọi move(), fill_pit() cứng theo ca 1: hỏng ở ca 2 khi gặp cổng sắt', bai(['move()', 'fill_pit()', 'slide_r(1)', 'quarry_run(2)']), ['dam-tuong'])
      ],
      goiY: ['Tầng 1: ore_pad() đưa R1 từ (1,1) tới (4,1), rồi slide_r(1) xuống (4,2).', 'Từ (4,2), gọi quarry_run(2) để vượt tiếp 2 tầng mỏ vào cờ F(8,4).']
    }),

    manChe({
      so: 10, ten: 'Máy mỏ đá R1 xuất xưởng', hang: 'trum', chinhCoDinh: false,
      hamCuaEmCan: ['diag_fill', 'ore_pad', 'slide_r', 'quarry_run'],
      deBai: 'Trùm cuối mùa 6 trên 3 ca làm việc: Máy mỏ đá R1 xuất xưởng nhận nhiệm vụ mở thông toàn bộ hầm mỏ. Từ (1,1), gọi diag_fill() lách qua trụ đá # và lấp hố đầu tiên tới (4,2), gọi ore_pad() vượt chặng thứ hai trên hàng 2 tới (7,2), trượt xuống hàng 3 bằng slide_r(1), rồi gọi quarry_run(2) vượt tiếp hai tầng cuối để cắm cờ chiến thắng ở F(11,5)!',
      veMaMau: 'Viết chương trình 4 dòng kết hợp diag_fill(), ore_pad(), slide_r(1) và quarry_run(2).',
      san: [
        ['##############', '#.#..........#', '#..ou.ou.....#', '#.......oCM..#', '#.........ou.#', '#..........F.#', '##############'],
        ['##############', '#.#..........#', '#..ou.oCM....#', '#.......ou...#', '#.........oCM#', '#..........F.#', '##############'],
        ['##############', '#.#..........#', '#..ou.oCM....#', '#.......oCM..#', '#.........ou.#', '#..........F.#', '##############']
      ],
      vatDang: [
        ['..............', '..............', '...r..r.......', '........q.....', '..........r...', '..............', '..............'],
        ['..............', '..............', '...r..q.......', '........r.....', '..........q...', '..............', '..............'],
        ['..............', '..............', '...r..q.......', '........q.....', '..........r...', '..............', '..............']
      ],
      noi: [
        [{ nut: { x: 10, y: 3 }, cua: [{ x: 9, y: 3 }] }],
        [{ nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }, { nut: { x: 12, y: 4 }, cua: [{ x: 11, y: 4 }] }],
        [{ nut: { x: 8, y: 2 }, cua: [{ x: 7, y: 2 }] }, { nut: { x: 10, y: 3 }, cua: [{ x: 9, y: 3 }] }]
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['diag_fill()']),
      loiGiai: bai(['diag_fill()', 'ore_pad()', 'slide_r(1)', 'quarry_run(2)']),
      sao: { o: 40, nhip: 63 },
      loiSai: [
        { moTa: 'Quên gọi slide_r(1) sau ore_pad() nên gọi quarry_run(2) ngay trên hàng 2', baiLam: bai(['diag_fill()', 'ore_pad()', 'quarry_run(2)']), phaiCoMa: ['nap-hut', 'dam-tuong'] },
        cung('Ở hàng 2 gọi move(), fill_pit() cứng theo ca 1: hỏng ở ca 2 và ca 3 khi gặp cổng sắt', bai(['diag_fill()', 'move()', 'fill_pit()', 'slide_r(1)', 'quarry_run(2)']), ['dam-tuong'])
      ],
      goiY: [
        'diag_fill() đưa R1 từ (1,1) xuống (4,2).',
        'ore_pad() đưa R1 từ (4,2) sang (7,2); gọi slide_r(1) để xuống (7,3).',
        'Tại (7,3), gọi quarry_run(2) để vượt tầng 3 và tầng 4, đáp đúng vào cờ F(11,5).'
      ]
    })
  ];

  ManHoc.manTrumMua6 = DS;
  if (laNode) module.exports = DS;
})();
