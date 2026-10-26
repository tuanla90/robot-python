/* ============================================================================
   man-ban-xoay.js — "Robot Chấn Hưng": GÓI `ban-xoay` · SÂN CƠ KHÍ (20 màn, 2 chương).
   Chương 1: `ban-xoay`     — Bàn xoay và nút đè (10 màn, trùm 3 sân, huy hiệu 'ban-xoay')
   Chương 2: `che-ban-xoay` — Cổng dịch chuyển   (10 màn, trùm 3 sân, huy hiệu 'che-ban-xoay')

   Ba cơ chế sân tương tác mới (san-hoc.js):
   - Bàn xoay: `@` xoay phải 90° (+1), `%` xoay trái 90° (-1) khi xe vừa bước vào ô bàn xoay hoặc đứng chờ wait() trên bàn xoay.
   - Nút đè giữ trên sàn: `M` mở cửa `C` (hoặc đóng cửa `c`) CHỈ KHI đang có xe, vật hay thùng đè lên; rời khỏi `M` thì cửa đóng lại.
   - Cổng dịch chuyển đôi: `1`, `2` (mỗi số đúng 2 ô trên sân); bước vào một cổng thì nhảy ngay sang cổng cặp cùng số, giữ nguyên hướng mặt và vật đang cầm.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC_CO_BAN = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
  var HAM_GOC_CAM = HAM_GOC_CO_BAN.concat(['front_clear', 'left_clear', 'right_clear']);

  function FOR(n, than, bien) {
    return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; }));
  }

  function man(chuong, m) {
    m.chuong = chuong;
    m.phienBanNoiDung = 2;
    m.cauTruc = m.cauTruc || ['for'];
    m.loaiRobot = 'banh';
    m.robot = m.robot || { than: 'hai-banh', tay: 'kep', camBien: m.coCam ? [{ ma: 'khoang-cach', o: 'truoc' }] : [] };
    delete m.coCam;
    m.hamGoc = m.hamGoc || HAM_GOC_CO_BAN;
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: ban-xoay — Bàn xoay và nút đè (10 màn)
       ======================================================================== */
    man('ban-xoay', {
      so: 1, ten: 'Mâm xoay phải', hang: 'lam-quen',
      hamCuaEmCan: ['move'],
      deBai: 'Ô bàn xoay phải (@) tự động xoay xe 90 độ theo chiều kim đồng hồ ngay khi xe bước lên. Cho xe đi thẳng qua bàn xoay để tới cờ.',
      veMaMau: 'Chương trình mẫu mới đi 2 bước tới bàn xoay. Hãy tăng số lần lặp để xe đi tiếp tới cờ sau khi được bàn xoay đổi hướng.',
      san: [
        '#####',
        '#..@#',
        '###.#',
        '###.#',
        '###F#',
        '#####'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: FOR(2, ['move()']) },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: FOR(5, ['move()']) },
      loiSai: [
        { moTa: 'Đi thiếu một bước nên dừng trước cờ', baiLam: { chinh: FOR(4, ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Tự gọi thêm turn_right() ở góc bàn xoay nên bị xoay 180 độ và đâm tường', baiLam: { chinh: ['move()', 'move()', 'turn_right()', 'move()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'Khi xe bước vào ô @ ở góc, bàn xoay tự quay mũi xe xuống dưới mà không tốn lệnh turn_right().',
        'Đếm tổng số bước từ chỗ xuất phát qua @ tới thẳng F.'
      ]
    }),

    man('ban-xoay', {
      so: 2, ten: 'Mâm xoay trái và phải', hang: 'lam-quen',
      hamCuaEmCan: ['forward'],
      deBai: 'Bàn xoay @ quay phải 90 độ, còn bàn xoay % quay trái 90 độ. Chỉ dùng một lệnh forward(n) để xe lướt qua cả hai khúc cua tới cờ.',
      san: [
        '######',
        '####F#',
        '####.#',
        '#@..%#',
        '#.####',
        '#.####',
        '######'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: ['forward(2)'] },
      sao: { o: 6, nhip: 7 },
      loiGiai: { chinh: ['forward(7)'] },
      loiSai: [
        { moTa: 'Mới đi tới bàn xoay thứ hai rồi dừng', baiLam: { chinh: ['forward(5)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi thiếu một bước trước cờ', baiLam: { chinh: ['forward(6)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'Xe đi lên gặp @ sẽ quay sang phải; đi tiếp gặp % sẽ quay lên trên về phía cờ.',
        'Cộng số bước của cả ba đoạn thẳng vào một lệnh forward(n).'
      ]
    }),

    man('ban-xoay', {
      so: 3, ten: 'Chờ trên mâm xoay', hang: 'lam-quen',
      hamCuaEmCan: ['forward'],
      deBai: 'Nếu xe đứng chờ wait() ngay trên bàn xoay, mỗi nhịp chờ bàn xoay lại quay xe thêm 90 độ. Hãy dùng bàn xoay @ để đổi hướng lên cờ.',
      san: [
        '#####',
        '###F#',
        '###.#',
        '#..@#',
        '#####'
      ],
      batDau: { x: 1, y: 3, huong: 1 },
      maMau: { chinh: ['forward(2)', 'forward(2)'] },
      sao: { o: 9, nhip: 6 },
      loiGiai: { chinh: ['forward(2)', 'wait()', 'wait()', 'forward(2)'] },
      loiSai: [
        { moTa: 'Không chờ trên bàn xoay nên xe quay xuống và đâm tường', baiLam: { chinh: ['forward(2)', 'forward(2)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chỉ chờ 1 nhịp nên xe mới quay sang trái, chưa hướng lên cờ', baiLam: { chinh: ['forward(2)', 'wait()', 'forward(2)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'Khi vừa bước lên @, xe đã xoay từ phải sang xuống dưới.',
        'Cần chờ thêm 2 nhịp wait() trên @ để mũi xe quay sang trái rồi hướng thẳng lên cờ.'
      ]
    }),

    man('ban-xoay', {
      so: 4, ten: 'Nút đè giữ cửa', hang: 'luyen',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'pick', 'drop', 'forward'],
      deBai: 'Nút đè M trên sàn chỉ giữ cửa C mở khi có vật hoặc xe đang đè lên nó. Hãy gắp thùng gỗ đặt lên nút M để giữ cửa mở rồi đi tới cờ.',
      san: [
        '#####',
        '###F#',
        '###C#',
        '#.o.#',
        '##M##',
        '#####'
      ],
      batDau: { x: 1, y: 3, huong: 1 },
      maMau: { chinh: ['pick()', 'move()', 'turn_right()', 'drop()'] },
      sao: { o: 27, nhip: 11 },
      loiGiai: { chinh: ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'move()', 'turn_left()', 'forward(2)'] },
      loiSai: [
        { moTa: 'Đặt thùng lên M xong nhưng quên đi qua cửa tới cờ', baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'drop()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Cầm thùng đi luôn mà không đặt lên nút M nên cửa C vẫn đóng', baiLam: { chinh: ['pick()', 'forward(2)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: [
        'Gắp thùng ở (2, 3), tiến 1 ô tới (2, 3), quay phải nhìn xuống nút M ở (2, 4) rồi drop().',
        'Khi thùng đã đè lên M, cửa C mở sẵn; quay trái tiến sang cột 3 rồi đi lên cờ.'
      ]
    }),

    man('ban-xoay', {
      so: 5, ten: 'Bàn xoay gắp hàng', hang: 'luyen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'turn_right', 'pick', 'drop'],
      deBai: 'Bàn xoay trái (%) giúp xe vừa bước vào đã quay mặt lên phía thùng gỗ. Hãy gắp thùng và đặt sang ô đích D bên phải.',
      san: [
        '#####',
        '##o##',
        '#.%D#',
        '#####'
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: { chinh: ['move()', 'pick()'] },
      sao: { o: 19, nhip: 5 },
      loiGiai: { chinh: ['move()', 'pick()', 'turn_right()', 'drop()'] },
      loiSai: [
        { moTa: 'Quên quay phải sau khi gắp nên chưa đặt thùng vào D', baiLam: { chinh: ['move()', 'pick()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: [
        'Bước vào % xe tự quay mặt lên thùng gỗ; khi đang dùng tay (pick/drop) bàn xoay giữ nguyên hướng để xe thao tác.',
        'Gắp xong, gọi turn_right() để hướng về D rồi drop().'
      ]
    }),

    man('ban-xoay', {
      so: 6, ten: 'Dây chuyền mâm xoay', hang: 'luyen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'pick', 'drop'],
      deBai: 'Ba trạm hàng nối tiếp nhau: ở mỗi trạm, % xoay xe lên để gắp thùng và @ xoay xe xuống để thả vào ô đích D. Dùng vòng lặp for để chuyển đủ 3 thùng.',
      san: [
        '#########',
        '##o#o#o##',
        '#.%@%@%@#',
        '###D#D#D#',
        '#########'
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: { chinh: ['move()', 'pick()', 'turn_right()', 'move()', 'drop()'] },
      sao: { o: 24, nhip: 22 },
      loiGiai: { chinh: FOR(3, ['move()', 'pick()', 'turn_right()', 'move()', 'drop()', 'turn_left()']) },
      loiSai: [
        { moTa: 'Chỉ làm 2 trạm nên còn 1 thùng chưa về đích', baiLam: { chinh: FOR(2, ['move()', 'pick()', 'turn_right()', 'move()', 'drop()', 'turn_left()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên turn_left() ở cuối mỗi trạm nên xe không hướng sang trạm kế tiếp', baiLam: { chinh: FOR(3, ['move()', 'pick()', 'turn_right()', 'move()', 'drop()']) }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: [
        'Mỗi trạm gồm: move() lên % (tự quay lên) -> pick() -> turn_right() -> move() sang @ (tự quay xuống) -> drop() -> turn_left().',
        'Đặt cả chu trình 6 lệnh đó vào vòng lặp for i in range(3).'
      ]
    }),

    man('ban-xoay', {
      so: 7, ten: 'Chở hàng đè nút', hang: 'bien-the',
      hamCuaEmCan: ['pick', 'drop', 'turn_right', 'forward'],
      deBai: 'Gắp thùng gỗ đầu hành lang, đi qua bàn xoay @ ở góc trên phải để mang thùng xuống đè lên nút M, rồi rẽ qua cửa C tới cờ.',
      san: [
        '######',
        '#.o.@#',
        '####.#',
        '#FC..#',
        '####M#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pick()', 'forward(3)'] },
      sao: { o: 23, nhip: 13 },
      loiGiai: { chinh: ['pick()', 'forward(3)', 'forward(2)', 'drop()', 'turn_right()', 'forward(3)'] },
      loiSai: [
        { moTa: 'Quên thả thùng xuống M nên cửa C không mở', baiLam: { chinh: ['pick()', 'forward(3)', 'forward(2)', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: [
        'Sau khi pick(), gọi forward(3) để tới @ ở góc (4, 1); bàn xoay tự quay xe xuống dưới.',
        'Đi tiếp forward(2) tới (4, 3), drop() thùng xuống M ở (4, 4), rồi turn_right() và forward(3) về F.'
      ]
    }),

    man('ban-xoay', {
      so: 8, ten: 'Hai nút hai cửa', hang: 'bien-the',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'pick', 'drop', 'forward'],
      noi: [
        { nut: { x: 2, y: 2 }, cua: [{ x: 6, y: 2 }] },
        { nut: { x: 4, y: 2 }, cua: [{ x: 6, y: 3 }] }
      ],
      deBai: 'Hai cánh cửa C dẫn tới cờ được giữ bởi hai nút đè M riêng biệt. Hãy đặt cả hai thùng gỗ lên hai nút M rồi đi qua bàn xoay @ xuống cờ.',
      san: [
        '########',
        '#.o.o.@#',
        '##M#M#C#',
        '######C#',
        '######F#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: FOR(2, ['pick()', 'move()', 'turn_right()', 'drop()']) },
      sao: { o: 28, nhip: 20 },
      loiGiai: {
        chinh: FOR(2, ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'move()']).concat(['move()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Chỉ đè 1 nút M nên cánh cửa thứ hai vẫn đóng', baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'forward(4)', 'forward(3)'] }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: [
        'Mỗi nút M cần: pick(), move(), turn_right(), drop(), turn_left(), move().',
        'Lặp 2 lần xong, xe đang đứng ở (5, 1): gọi move() bước vào @ (6, 1) để tự quay xuống rồi forward(3) qua hai cửa tới F.'
      ]
    }),

    man('ban-xoay', {
      so: 9, ten: 'Băng chuyền nối bàn xoay', hang: 'bien-the',
      hamCuaEmCan: ['forward', 'pick', 'drop', 'turn_right', 'move'],
      deBai: 'Băng chuyền đẩy xe trượt thẳng vào bàn xoay @ ở góc. Hãy tận dụng đà đẩy của băng và bàn xoay để mang thùng gỗ đè lên nút M mở cửa tới cờ.',
      san: [
        '#######',
        '#.o>>@#',
        '#####.#',
        '#FC...#',
        '#####M#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pick()', 'move()', 'forward(2)'] },
      sao: { o: 24, nhip: 14 },
      loiGiai: { chinh: ['pick()', 'move()', 'forward(2)', 'forward(2)', 'drop()', 'turn_right()', 'forward(4)'] },
      loiSai: [
        { moTa: 'Không thả thùng xuống M trước khi rẽ về cửa C', baiLam: { chinh: ['pick()', 'move()', 'forward(2)', 'forward(2)', 'turn_right()', 'forward(4)'] }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: [
        'Sau khi pick() và move() lên (2, 1), chỉ cần forward(2) trên băng >> là băng đẩy xe vào @ (5, 1) và tự xoay xuống.',
        'Đi tiếp forward(2) xuống (5, 3), drop() lên M (5, 4), rồi turn_right() và forward(4) tới F.'
      ]
    }),

    man('ban-xoay', {
      so: 10, ten: 'Trùm: Hành lang cơ khí', hang: 'trum', huyHieu: 'ban-xoay',
      coCam: true, cauTruc: ['for', 'while'],
      hamGoc: HAM_GOC_CAM,
      hamCuaEmCan: ['go_wall', 'pick', 'drop', 'turn_right', 'turn_left', 'move'],
      nhipTheo: 'tong', nhipTheoLoiGiai: true,
      deBai: 'Ba xưởng có hành lang dài ngắn khác nhau nhưng mọi góc cua đều đặt bàn xoay @ hoặc %. Hãy dùng go_wall() lướt qua các bàn xoay tới thùng gỗ, đặt thùng đè nút M để mở cửa C rồi đi tiếp tới cờ.',
      san: [
        [
          '########',
          '#..@####',
          '###.####',
          '###%..@#',
          '######.#',
          '#FC..o.#',
          '#####M##',
          '########'
        ],
        [
          '########',
          '#...@###',
          '####.###',
          '####%.@#',
          '######.#',
          '######.#',
          '#FC..o.#',
          '#####M##',
          '########'
        ],
        [
          '########',
          '#.@#####',
          '##.#####',
          '##%...@#',
          '######.#',
          '#FC..o.#',
          '#####M##',
          '########'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      maMau: { chinh: ['go_wall()', 'pick()'] },
      sao: { o: 27, nhip: 64 },
      loiGiai: {
        chinh: ['go_wall()', 'turn_right()', 'pick()', 'move()', 'turn_left()', 'drop()', 'turn_right()', 'go_wall()']
      },
      loiSai: [
        { moTa: 'Chưa đặt thùng lên nút M nên cửa C ở cuối hành lang vẫn đóng', baiLam: { chinh: ['go_wall()', 'turn_right()', 'pick()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'Nhờ bàn xoay ở mỗi góc, lệnh go_wall() đầu tiên đưa xe tới góc dưới phải ngay cạnh thùng gỗ o.',
        'Quay phải (turn_right()) để nhìn vào thùng gỗ, pick(), move() vào vị trí của thùng (ngay trên nút M), quay trái để drop() lên M, rồi quay phải và go_wall() về F.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-ban-xoay — Cổng dịch chuyển (10 màn)
       ======================================================================== */
    man('che-ban-xoay', {
      so: 1, ten: 'Cổng dịch chuyển số 1', hang: 'lam-quen',
      hamCuaEmCan: ['forward'],
      deBai: 'Hai ô cổng số 1 nối thông nhau qua bức tường dày: xe bước vào cổng 1 bên này sẽ xuất hiện ngay ở cổng 1 bên kia và giữ nguyên hướng mặt. Đưa xe tới cờ.',
      san: [
        '#######',
        '#..1#1F',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['forward(1)'] },
      sao: { o: 6, nhip: 3 },
      loiGiai: { chinh: ['forward(3)'] },
      loiSai: [
        { moTa: 'Mới bước vào cổng dịch chuyển, chưa bước thêm sang ô cờ', baiLam: { chinh: ['forward(2)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'Bước thứ 2 đưa xe vào cổng 1 ở (3, 1) và dịch chuyển ngay sang (5, 1).',
        'Chỉ cần thêm 1 bước nữa là tới cờ ở (6, 1).'
      ]
    }),

    man('che-ban-xoay', {
      so: 2, ten: 'Hai cặp cổng 1 và 2', hang: 'lam-quen',
      hamCuaEmCan: ['forward'],
      deBai: 'Cổng 1 (xanh lam) nối với cổng 1, cổng 2 (tím) nối với cổng 2. Cho xe đi xuyên qua cả ba căn phòng biệt lập để tới cờ.',
      san: [
        '#######',
        '#..1#2F',
        '#######',
        '###1.2#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['forward(2)'] },
      sao: { o: 6, nhip: 5 },
      loiGiai: { chinh: ['forward(5)'] },
      loiSai: [
        { moTa: 'Dừng lại ở căn phòng giữa trước khi tới cổng 2', baiLam: { chinh: ['forward(3)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        '2 bước đầu đưa xe qua cổng 1 xuống phòng dưới; 2 bước tiếp đưa xe qua cổng 2 lên phòng có cờ.',
        'Bước thứ 5 đưa xe vào thẳng ô cờ F.'
      ]
    }),

    man('che-ban-xoay', {
      so: 3, ten: 'Chuyển hàng xuyên tường', hang: 'lam-quen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['pick', 'drop', 'forward'],
      deBai: 'Vật đang cầm trên tay kẹp sẽ dịch chuyển cùng xe qua cổng. Hãy gắp thùng gỗ và mang qua cổng 1 đặt vào ô đích D.',
      san: [
        '#######',
        '#.o1#1D',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pick()', 'forward(1)'] },
      sao: { o: 18, nhip: 5 },
      loiGiai: { chinh: ['pick()', 'forward(2)', 'drop()'] },
      loiSai: [
        { moTa: 'Quên gắp thùng trước khi đi qua cổng', baiLam: { chinh: ['forward(2)', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: [
        'Đứng ở (1, 1) gọi pick() để nhặt thùng ở (2, 1).',
        'Gọi forward(2) để bước qua (2, 1) vào cổng 1 (3, 1); xe hiện ra ở (5, 1) ngay trước ô đích D rồi gọi drop().'
      ]
    }),

    man('che-ban-xoay', {
      so: 4, ten: 'Cổng nối bàn xoay', hang: 'luyen',
      hamCuaEmCan: ['forward'],
      deBai: 'Kết hợp cổng dịch chuyển và bàn xoay: đi qua cổng 1 xuống hành lang dưới, nhờ bàn xoay @ đổi hướng xuống cổng 2 để nhảy về căn phòng có cờ.',
      san: [
        '#######',
        '#..1#2#',
        '#####F#',
        '###1.@#',
        '#####.#',
        '#####2#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['forward(4)'] },
      sao: { o: 6, nhip: 7 },
      loiGiai: { chinh: ['forward(7)'] },
      loiSai: [
        { moTa: 'Mới đi tới bàn xoay @, chưa đi tiếp vào cổng 2', baiLam: { chinh: ['forward(4)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'Xe bước vào cổng 2 theo hướng đi xuống nên khi hiện ra ở cổng 2 phía trên cũng đang hướng thẳng xuống cờ F.',
        'Tính tổng số bước từ đầu tới F rồi truyền vào một lệnh forward(n).'
      ]
    }),

    man('che-ban-xoay', {
      so: 5, ten: 'Khứ hồi mở cửa', hang: 'luyen',
      hamCuaEmCan: ['move', 'turn_left', 'pick', 'drop', 'forward'],
      deBai: 'Cửa C chắn trước cờ, còn thùng gỗ và nút đè M lại nằm ở phòng dưới. Hãy đi qua cổng 1 xuống đặt thùng lên nút M, rồi bước ngược vào cổng 1 để quay về đi qua cửa tới cờ.',
      san: [
        '#######',
        '#FC.1##',
        '#######',
        '##1oM##',
        '#######'
      ],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: { chinh: ['move()', 'pick()', 'move()', 'drop()'] },
      sao: { o: 24, nhip: 12 },
      loiGiai: { chinh: ['move()', 'pick()', 'move()', 'drop()', 'turn_left()', 'turn_left()', 'forward(4)'] },
      loiSai: [
        { moTa: 'Đặt thùng lên M xong nhưng không quay lại cổng 1 để về phòng trên', baiLam: { chinh: ['move()', 'pick()', 'move()', 'drop()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'Bước vào cổng 1 ở (4, 1) để sang (2, 3), gắp thùng ở (3, 3), tiến 1 bước rồi drop() lên nút M ở (4, 3).',
        'Quay đầu 180 độ (hai lần turn_left()), rồi gọi forward(4) để bước vào lại cổng 1 ở (2, 3), nhảy về (4, 1) và đi thẳng qua cửa C tới F.'
      ]
    }),

    man('che-ban-xoay', {
      so: 6, ten: 'Hàm lấy hàng qua cổng', hang: 'luyen',
      mucTieu: 'dua-vat', cauTruc: ['for', 'def'],
      hamCuaEmCan: ['move', 'turn_left', 'pick', 'drop', 'forward'],
      deBai: 'Hoàn thiện hàm warp_fetch(n) để xe đi n bước qua cổng sang phòng bên phải, gắp thùng gỗ rồi quay về đặt vào ô đích D ở đầu hàng. Gọi hàm cho cả 2 tầng (cổng 1 và cổng 2).',
      san: [
        '##########',
        '#D.1#1.o##',
        '##.#######',
        '#D.2#2..o#',
        '##########'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: {
        chinh: ['warp_fetch(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'warp_fetch(3)'],
        hamCuaMan: [{ ten: 'warp_fetch', thamSo: ['n'], than: ['forward(n)', 'pick()'] }]
      },
      sao: { o: 28, nhip: 25 },
      loiGiai: {
        chinh: ['warp_fetch(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'warp_fetch(3)'],
        hamCuaMan: [{ ten: 'warp_fetch', thamSo: ['n'], than: ['forward(n)', 'pick()', 'turn_left()', 'turn_left()', 'forward(n)', 'drop()'] }]
      },
      loiSai: [
        { moTa: 'Hàm warp_fetch mới gắp thùng mà chưa quay đầu đi ngược qua cổng về thả vào D', baiLam: {
          chinh: ['warp_fetch(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'warp_fetch(3)'],
          hamCuaMan: [{ ten: 'warp_fetch', thamSo: ['n'], than: ['forward(n)', 'pick()'] }]
        }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: [
        'Trong warp_fetch(n): sau khi forward(n) và pick(), quay đầu bằng hai lệnh turn_left(), đi tiếp forward(n) để ngược qua cổng về (2, y) rồi drop().',
        'Tầng 1 cần n = 2, tầng 2 cần n = 3.'
      ]
    }),

    man('che-ban-xoay', {
      so: 7, ten: 'Hai trạm dịch chuyển', hang: 'bien-the',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'pick', 'drop', 'forward'],
      deBai: 'Hai thùng gỗ nằm ở hai căn phòng khác nhau, nối qua cổng 1 và cổng 2. Hãy chuyển thùng thứ nhất qua cổng 1 đặt vào đích D bên dưới, rồi qua cổng 2 lấy nốt thùng thứ hai.',
      san: [
        '#########',
        '#.o1#2.o#',
        '#########',
        '##1@.2###',
        '###D#D###',
        '#########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pick()', 'forward(3)', 'drop()'] },
      sao: { o: 29, nhip: 18 },
      loiGiai: {
        chinh: ['pick()', 'forward(3)', 'drop()', 'turn_left()', 'forward(2)', 'move()', 'pick()', 'turn_left()', 'turn_left()', 'move()', 'turn_left()', 'drop()']
      },
      khung: { chinh: 14, moiHam: 10 },
      loiSai: [
        { moTa: 'Mới giao thùng thứ nhất, chưa qua cổng 2 lấy thùng thứ hai', baiLam: { chinh: ['pick()', 'forward(3)', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: [
        'Gắp thùng 1 ở (2, 1), forward(3) qua cổng 1 xuống (2, 3) rồi sang @ (3, 3) tự quay xuống D (3, 4) và drop().',
        'Quay trái, đi vào cổng 2 (5, 3) sang (5, 1), tiến 1 ô gắp thùng 2 ở (7, 1) rồi quay ngược qua cổng 2 về đặt vào D (5, 4).'
      ]
    }),

    man('che-ban-xoay', {
      so: 8, ten: 'Băng chuyền đẩy vào cổng', hang: 'bien-the',
      hamCuaEmCan: ['forward', 'pick', 'drop', 'turn_right', 'move'],
      deBai: 'Băng chuyền đẩy xe trượt thẳng vào cổng 1, nhảy sang phòng giữa có bàn xoay @. Hãy đặt thùng gỗ lên nút đè M mở cửa C rồi bước vào cổng 2 về phòng cờ.',
      san: [
        '########',
        '#.o>>1##',
        '#FC2####',
        '##1..@##',
        '####2.##',
        '#####M##',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pick()', 'move()', 'forward(2)'] },
      sao: { o: 25, nhip: 15 },
      loiGiai: {
        chinh: ['pick()', 'move()', 'forward(2)', 'forward(3)', 'move()', 'drop()', 'turn_right()', 'forward(3)']
      },
      loiSai: [
        { moTa: 'Quên đặt thùng lên nút M trước khi vào cổng 2', baiLam: { chinh: ['pick()', 'move()', 'forward(2)', 'forward(3)', 'move()', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: [
        'Sau khi pick() và move(), forward(2) trên băng >> sẽ đẩy xe vào cổng 1 sang (2, 3).',
        'Đi tiếp tới (5, 4), drop() thùng xuống M (5, 5), rồi turn_right() và forward(3) bước vào cổng 2 (4, 4) nhảy lên (3, 2) đi thẳng qua cửa C tới F.'
      ]
    }),

    man('che-ban-xoay', {
      so: 9, ten: 'Mạch vòng cổng và bàn xoay', hang: 'bien-the',
      coCam: true, cauTruc: ['for', 'while'],
      hamGoc: HAM_GOC_CAM,
      hamCuaEmCan: ['go_wall', 'pick', 'drop', 'turn_left', 'move'],
      deBai: 'Khi kết hợp go_wall() với bàn xoay và cổng dịch chuyển, xe tự động chạy xuyên qua các căn phòng và tự rẽ ở mọi góc bàn xoay cho tới khi gặp thùng gỗ.',
      san: [
        '########',
        '#..1####',
        '########',
        '##1..@##',
        '#FC2..##',
        '#####o2#',
        '#####M##',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 26, nhip: 17 },
      loiGiai: {
        chinh: ['go_wall()', 'pick()', 'move()', 'drop()', 'turn_left()', 'move()', 'turn_left()', 'turn_left()', 'go_wall()']
      },
      loiSai: [
        { moTa: 'Không đặt thùng lên nút M nên cửa C vẫn đóng', baiLam: { chinh: ['go_wall()', 'pick()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'go_wall() đầu tiên đưa xe qua cổng 1, tới bàn xoay @ (5, 3) tự quay xuống và dừng ở (5, 4) ngay trên thùng gỗ o (5, 5).',
        'Gọi pick(), move() xuống (5, 5), drop() thùng đè lên nút M (5, 6); sau đó xem cổng 2 ở (6, 5) nối về (3, 4)!'
      ]
    }),

    man('che-ban-xoay', {
      so: 10, ten: 'Trùm: Lõi dịch chuyển cơ khí', hang: 'trum', huyHieu: 'che-ban-xoay',
      coCam: true, cauTruc: ['for', 'while'],
      hamGoc: HAM_GOC_CAM,
      hamCuaEmCan: ['go_wall', 'pick', 'drop', 'turn_left', 'move'],
      nhipTheo: 'tong', nhipTheoLoiGiai: true,
      deBai: 'Ba nhà máy có khoảng cách giữa các cổng 1, 2 và bàn xoay @ khác nhau. Hãy viết một chương trình chung dùng go_wall() để lấy thùng gỗ đè lên nút M mở cửa C rồi đi qua cổng 2 về cờ F.',
      san: [
        [
          '########',
          '#..1#2CF',
          '########',
          '##1..@##',
          '#####.##',
          '#####o2#',
          '#####M##',
          '########'
        ],
        [
          '#########',
          '#...1#2CF',
          '#########',
          '##1...@##',
          '######.##',
          '######.##',
          '######o2#',
          '######M##',
          '#########'
        ],
        [
          '#########',
          '#..1##2CF',
          '#########',
          '###1..@##',
          '######.##',
          '######o2#',
          '######M##',
          '#########'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      maMau: { chinh: ['go_wall()', 'pick()'] },
      sao: { o: 23, nhip: 48 },
      loiGiai: {
        chinh: ['go_wall()', 'pick()', 'move()', 'drop()', 'turn_left()', 'go_wall()']
      },
      loiSai: [
        { moTa: 'Quên đặt thùng lên nút M nên cửa C trước cờ vẫn đóng', baiLam: { chinh: ['go_wall()', 'pick()', 'move()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: [
        'Ở cả 3 nhà máy, go_wall() đầu tiên đưa xe qua cổng 1 và bàn xoay @ tới dừng ngay trên thùng gỗ o.',
        'Sau khi pick(), move(), drop() thùng xuống M ở ngay dưới, chỉ cần turn_left() (quay sang phải về phía cổng 2) rồi gọi go_wall() để xe bước vào cổng 2, hiện ra ở hàng trên và đi thẳng qua cửa C tới F!'
      ]
    })
  ];

  // Đăng ký gói 2 chương "Sân cơ khí" ngay sau chương 'tham-so' (cuối gói Đường dài của Mùa 2).
  ManHoc.chuongCoChe = (ManHoc.chuongCoChe || []).concat([{
    sau: 'tham-so',
    ds: DS,
    chuong: [
      { ma: 'ban-xoay', ten: 'Bàn xoay và nút đè' },
      { ma: 'che-ban-xoay', ten: 'Cổng dịch chuyển' }
    ],
    goi: { ma: 'ban-xoay', ten: 'Sân cơ khí', loai: 'khai-niem', hinh: 'ban-xoay' }
  }]);
})();
