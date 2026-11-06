/* ============================================================================
   man-m2-tay.js — diem10code-python: MÙA 2 Bãi tái chế, CỘT 2 "Nam châm" (Nhện + Nam châm + Khoảng cách: đổi đúng tay, cảm biến còn quen).
   Nam châm treo dưới bụng: hút, thả ở ô đang đứng; cực nào cũng hút sắt, không hút gỗ. Mỗi lệnh nam châm tự chạy 1 nhịp, nhện đứng yên trong nhịp đó.
   Dạy chuỗi: for c in "RRU": đọc từng chữ, if c == "R": ... elif ...; và or với cảm biến.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
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
    m.phienBanNoiDung = 1;                     // wait() không còn chốt lệnh: bản nháp cũ không dùng nữa
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Nam châm dưới bụng',
      deBai: 'Bấm Chạy và xem: nhện đứng lên thùng sắt, bật nam châm, mang thùng đi rồi tắt nam châm để thả xuống ô đích. Mỗi lệnh nam châm mất 1 nhịp, nhện đứng yên trong nhịp đó.',
      san: ['.....', '.o.D.', '.....'],
      vatChat: ['.....', '.s...', '.....'],
      batDau: { x: 0, y: 1, huong: 0 },
      mucTieu: 'dua-vat', vatCan: 'sat',
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['go_right()', 'magnet_n()', 'go_right()', 'go_right()', 'magnet_off()'] } }),

    man(2, { ten: 'Sắt hay gỗ',
      deBai: 'Nam châm bật sẵn từ đầu, nhện đi qua hai thùng: một gỗ, một sắt. Đọc code, đoán rồi bấm Chạy.',
      san: ['.....', '.oo.D', '.....'],
      vatChat: ['.....', '.gs..', '.....'],
      batDau: { x: 0, y: 1, huong: 0 },
      mucTieu: 'dua-vat', vatCan: 'sat',
      duDoan: { hoi: 'Khi tới ô đích, nhện mang theo thùng nào?', luaChon: ['Thùng gỗ', 'Thùng sắt', 'Cả hai thùng'], dung: 1, xacMinh: { vat: [{ x: 1, y: 1 }, { x: 4, y: 1 }] } },
      sao: { o: 4, nhip: 10 },
      loiGiai: { chinh: ['magnet_n()'].concat(FOR(4, ['go_right()']), ['magnet_off()']) } }),

    man(3, { ten: 'Chuỗi chỉ đường',
      deBai: 'Vòng for đọc từng chữ trong chuỗi "URRUR": U đi lên, R sang phải. Nhánh R đang thiếu lệnh. Điền vào để nhện tới cờ.',
      san: ['#####', '###.F', '#...#', '#.###'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['for c in "URRUR":', '    if c == "U":', '        go_up()', '    elif c == "R":', '        '] },
      goiY: ['Mỗi lượt lặp, biến c là một chữ của chuỗi.'],
      sao: { o: 5, nhip: 10 },
      loiGiai: { chinh: ['for c in "URRUR":', '    if c == "U":', '        go_up()', '    elif c == "R":', '        go_right()'] } }),

    man(4, { ten: 'Theo chuỗi mang thùng',
      deBai: 'Đủ dòng nhưng sai thứ tự. Giữ một dòng rồi kéo sang chỗ đúng: bật nam châm trước, đi theo chuỗi, tới ô đích mới tắt.',
      san: ['o..', '..D'],
      vatChat: ['s..', '...'],
      batDau: { x: 0, y: 0, huong: 0 },
      mucTieu: 'dua-vat', vatCan: 'sat',
      maMau: { chinh: ['for c in "RDR":', '    if c == "R":', '        go_down()', '    else:', '        go_right()', 'magnet_off()', 'magnet_n()'] },
      goiY: ['Trong chuỗi có hai chữ R, một chữ D. Nhìn sân: R phải là đi hướng nào?'],
      sao: { o: 7, nhip: 8 },
      loiGiai: { chinh: ['magnet_n()', 'for c in "RDR":', '    if c == "R":', '        go_right()', '    else:', '        go_down()', 'magnet_off()'] } }),

    man(5, { ten: 'Sai một chữ trong chuỗi',
      deBai: 'Code này sai đúng 1 chỗ: chuỗi chỉ đường lệch một chữ nên nhện húc tường. Bấm Chạy xem lỗi, rồi chạm vào chuỗi để sửa.',
      san: ['#####', '###.F', '#...#', '#####'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: { chinh: ['for c in "RURR":', '    if c == "R":', '        go_right()', '    else:', '        go_up()'] },
      goiY: ['Đếm trên sân: phải đi sang phải mấy ô rồi mới lên được?'],
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['for c in "RRUR":', '    if c == "R":', '        go_right()', '    else:', '        go_up()'] } }),

    man(6, { ten: 'Hết đường thì thả',
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

    man(7, { ten: 'Ba thùng: tự viết hàm',
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
