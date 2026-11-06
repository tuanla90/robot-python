/* ============================================================================
   man-m2-tay.js — diem10code-python: MÙA 2 Bãi tái chế, CỘT 2 "Nam châm" (Nhện + Nam châm + Khoảng cách: đổi đúng tay, cảm biến còn quen).
   Nam châm treo dưới bụng: hút, thả ở ô đang đứng; cực nào cũng hút sắt, không hút gỗ. Mỗi lệnh nam châm tự chạy 1 nhịp, nhện đứng yên trong nhịp đó.
   Dạy chuỗi: for c in "RRU": đọc từng chữ, if c == "R": ... elif ...; và or với cảm biến.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'magnet_n', 'magnet_s', 'magnet_off', 'front_clear', 'left_clear', 'right_clear'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }

  function man(so, m) {
    m.chuong = 'm2-c2-tay';
    m.loaiRobot = 'nhen'; m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.moXuong = true;
    m.phienBanNoiDung = 2;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Sắt hay gỗ',
      deBai: 'Nam châm treo dưới bụng nhện: bật rồi đi qua thùng sắt là hút, magnet_off() thả xuống ô đang đứng. Mỗi lệnh nam châm mất 1 nhịp, nhện đứng yên trong nhịp đó. Lần này nam châm bật sẵn từ đầu, nhện đi qua hai thùng: một gỗ, một sắt. Đọc code, đoán rồi bấm Chạy.',
      san: ['.....', '.oo.D', '.....'],
      vatChat: ['.....', '.gs..', '.....'],
      batDau: { x: 0, y: 1, huong: 0 },
      mucTieu: 'dua-vat', vatCan: 'sat',
      duDoan: { hoi: 'Khi tới ô đích, nhện mang theo thùng nào?', luaChon: ['Thùng gỗ', 'Thùng sắt', 'Cả hai thùng'], dung: 1, xacMinh: { vat: [{ x: 1, y: 1 }, { x: 4, y: 1 }] } },
      sao: { o: 4, nhip: 10 },
      loiGiai: { chinh: ['magnet_n()'].concat(FOR(4, ['go_right()']), ['magnet_off()']) } }),

    man(2, { ten: 'Chuỗi chỉ đường',
      deBai: 'Vòng for đọc từng chữ trong chuỗi "URRUR": U đi lên, R sang phải. Nhánh R đang thiếu lệnh. Điền vào để nhện tới cờ.',
      san: ['#####', '###.F', '#...#', '#.###'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['for c in "URRUR":', '    if c == "U":', '        go_up()', '    elif c == "R":', '        '] },
      goiY: ['Mỗi lượt lặp, biến c là một chữ của chuỗi.'],
      sao: { o: 5, nhip: 10 },
      loiGiai: { chinh: ['for c in "URRUR":', '    if c == "U":', '        go_up()', '    elif c == "R":', '        go_right()'] } }),

    man(3, { ten: 'Sai một chữ trong chuỗi',
      deBai: 'Code này sai đúng 1 chỗ: chuỗi chỉ đường lệch một chữ nên nhện húc tường. Bấm Chạy xem lỗi, rồi chạm vào chuỗi để sửa.',
      san: ['#####', '###.F', '#...#', '#####'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: { chinh: ['for c in "RURR":', '    if c == "R":', '        go_right()', '    else:', '        go_up()'] },
      goiY: ['Đếm trên sân: phải đi sang phải mấy ô rồi mới lên được?'],
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['for c in "RRUR":', '    if c == "R":', '        go_right()', '    else:', '        go_up()'] } }),

    man(4, { ten: 'Hết đường thì thả',
      deBai: 'Màn trống, em tự viết. Hai sân khác đường: đang đứng trên thùng sắt, mang nó đi tới khi phía trên lẫn bên phải đều hết đường rồi thả.',
      san: [
        ['######', '#...D#', '#.####', '#.####', '#o####'],
        ['#####', '###D#', '#...#', '#o###']
      ],
      vatChat: [
        ['......', '......', '......', '......', '.s....'],
        ['.....', '.....', '.....', '.s...']
      ],
      batDau: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 3, huong: 0 }],
      mucTieu: 'dua-vat', vatCan: 'sat',
      goiY: ['Bật nam châm ngay từ đầu, trước vòng lặp.', 'Tới ô đích mới magnet_off() để thả thùng.'],
      sao: { o: 7, nhip: 14 },
      loiGiai: { chinh: ['magnet_n()', 'while front_clear() or right_clear():', '    if front_clear():', '        go_up()', '    else:', '        go_right()', 'magnet_off()'] } }),

    man(5, { ten: 'Một chuỗi chỉ đường',
      deBai: 'Tới cờ. Đường vòng dò tới hết đường thì dễ viết nhưng xa. Đường tắt ngoằn ngoèo thì ngắn, và chỉ cần một chuỗi là đi hết. Tìm bài vừa gọn vừa nhanh.',
      san: ['.....F', '.###.#', '.#...#', '.#.###', '.#.###', '...###'],
      batDau: { x: 2, y: 5, huong: 0 },
      goiY: ['Đường dài bao nhiêu thì chuỗi dài bấy nhiêu, còn số ô code không đổi.', 'Chỉ có hai chữ thì if và else là đủ.'],
      sao: { o: 5, nhip: 16 },
      loiGiai: { chinh: ['for c in "UUURRUUR":', '    if c == "U":', '        go_up()', '    else:', '        go_right()'] },
      cachKhac: [{ chinh: ['while left_clear():', '    go_left()', 'while front_clear():', '    go_up()', 'while right_clear():', '    go_right()'] }] }),

    man(6, { ten: 'Ba thùng: tự viết hàm',
      deBai: 'Ba cột giống nhau, mỗi cột một thùng sắt phải lên ô đích trên đầu cột. Tự viết hàm tên tùy em cho một lượt rồi gọi trong for. Chương trình chính chỉ có 3 ô.',
      san: ['D.D.D', '.....', 'o.o.o'],
      vatChat: ['.....', '.....', 's.s.s'],
      batDau: { x: 0, y: 2, huong: 0 },
      mucTieu: 'dua-vat', vatCan: 'sat',
      khung: { chinh: 3 },
      goiY: ['magnet_off() mất 1 nhịp: thùng rơi ngay, rồi nhện mới bước tiếp.'],
      sao: { o: 10, nhip: 34 },
      loiGiai: {
        chinh: FOR(3, ['mang_thung()']),
        hamCuaEmMoi: [H('mang_thung', ['magnet_n()', 'go_up()', 'go_up()', 'magnet_off()', 'go_right()', 'go_right()', 'go_down()', 'go_down()'])]
      } }),

    man(7, { ten: 'Chuỗi ba chữ hay ba vòng while',
      deBai: 'Mang thùng sắt tới ô đích. Đường sát mép sân chỉ cần ba vòng while. Đường qua hai khe ngắn hơn nhưng phải đi cả ba hướng. Hàm nào cũng được, tên tùy em. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['D......', '#.####.', '.......', '###.##.', 'o......'],
      vatChat: ['.......', '.......', '.......', '.......', 's......'],
      batDau: { x: 0, y: 4, huong: 0 },
      mucTieu: 'dua-vat', vatCan: 'sat',
      goiY: ['Ba hướng thì cần if, elif, else trong vòng đọc chuỗi.', 'Nam châm mỗi lệnh chỉ 1 nhịp, còn mỗi bước đi mất 2 nhịp: bớt bước mới là nhanh.'],
      sao: { o: 8, nhip: 22 },
      doiCho: true,
      loiGiai: { chinh: ['magnet_n()', 'while right_clear():', '    go_right()', 'while front_clear():', '    go_up()', 'while left_clear():', '    go_left()', 'magnet_off()'] },
      cachKhac: [{ chinh: ['magnet_n()', 'for c in "RRRUULLUUL":', '    if c == "R":', '        go_right()', '    elif c == "U":', '        go_up()', '    else:', '        go_left()', 'magnet_off()'] }] }),

    man(8, { ten: 'Bản đồ trong chuỗi',
      deBai: 'Hai thùng sắt, hai ô đích. Viết một chuỗi làm bản đồ: có chữ đi, có chữ bật nam châm, có chữ tắt. Chương trình chính chỉ có 10 ô.',
      san: ['....D', '...o.', '..D..', 'o....'],
      vatChat: ['.....', '...s.', '.....', 's....'],
      batDau: { x: 0, y: 3, huong: 0 },
      mucTieu: 'dua-vat', vatCan: 'sat',
      sao: { o: 9, nhip: 18 },
      loiGiai: { chinh: ['for c in "NRRUOURNRUO":', '    if c == "U":', '        go_up()', '    elif c == "R":', '        go_right()', '    elif c == "N":', '        magnet_n()', '    else:', '        magnet_off()'] },
      huyHieu: { ma: 'nam-cham', ten: 'Thợ nam châm' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
