/* ============================================================================
   man-m2-than.js — diem10code-python: MÙA 2 Bãi tái chế, CỘT 1 "Thân nhện" (Nhện + Kẹp + Khoảng cách: tay và cảm biến quen từ mùa 1).
   Nhện không quay: go_up / go_down / go_left / go_right, mỗi bước 2 nhịp. Tay gắp, thả NGAY Ô ĐANG ĐỨNG, nhện đứng trùm lên vật được.
   front_clear() nhìn lên phía trên sân, left_clear() bên trái, right_clear() bên phải. Dạy and, or, elif với cảm biến.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'pick', 'drop', 'front_clear', 'left_clear', 'right_clear'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }

  function man(so, m) {
    m.chuong = 'm2-c1-than';
    m.loaiRobot = 'nhen'; m.robot = { than: 'nhen', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.moXuong = true;
    m.phienBanNoiDung = 3;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Kẹp ngay dưới chân',
      deBai: 'Nhện không quay đầu: đi thẳng lên, xuống, sang trái, sang phải, mỗi bước mất 2 nhịp. Xe hai bánh kẹp ô trước mũi, nhện thì khác. Đọc code, đoán rồi bấm Chạy.',
      san: ['.....', '.o..D', '.....'],
      batDau: { x: 0, y: 1, huong: 0 },
      mucTieu: 'dua-vat',
      duDoan: { hoi: 'Khi drop() chạy, thùng được đặt xuống ô nào?', luaChon: ['Ô nhện đang đứng', 'Ô bên phải nhện', 'Ô phía trên nhện'], dung: 0, xacMinh: { x: 4, y: 1, vat: [{ x: 4, y: 1 }] } },
      sao: { o: 5, nhip: 12 },
      loiGiai: { chinh: ['go_right()', 'pick()'].concat(FOR(3, ['go_right()']), ['drop()']) } }),

    man(2, { ten: 'Ba ngả', dangBai: 'sap-xep',
      deBai: 'Đủ dòng nhưng ba lệnh đi đang nằm sai nhánh. Giữ một dòng rồi kéo sang chỗ đúng: trên trống thì lên, không thì phải trống thì sang phải, còn lại sang trái.',
      san: ['#####', '#F###', '#..##', '##.##', '#..##', '#####'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['for i in range(5):', '    if front_clear():', '        go_left()', '    elif right_clear():', '        go_up()', '    else:', '        go_right()'] },
      goiY: ['elif chỉ được hỏi khi if phía trên sai; else chạy khi mọi điều kiện trên đều sai.'],
      sao: { o: 7, nhip: 10 },
      loiGiai: { chinh: FOR(5, ['if front_clear():', '    go_up()', 'elif right_clear():', '    go_right()', 'else:', '    go_left()']) } }),

    man(3, { ten: 'Sai một chữ nối',
      deBai: 'Code này sai đúng 1 chỗ: nhện đi quá ngõ rẽ rồi đứng húc tường mãi. Bấm Chạy xem lỗi, rồi sửa điều kiện của while.',
      san: ['#####', '#.###', '#.###', '#...F', '#.###', '#.###'],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: ['while front_clear() or not right_clear():', '    go_up()', 'for i in range(3):', '    go_right()'] },
      goiY: ['or đúng chỉ cần MỘT vế đúng, nên ở ngõ rẽ vòng while vẫn chạy tiếp.', 'and đúng khi CẢ HAI vế đúng: phía trên còn trống VÀ bên phải chưa có ngõ.'],
      sao: { o: 4, nhip: 10 },
      loiGiai: { chinh: ['while front_clear() and not right_clear():', '    go_up()', 'for i in range(3):', '    go_right()'] } }),

    man(4, { ten: 'Hết đường thì đặt',
      deBai: 'Màn trống, em tự viết. Hai sân khác đường: nhặt thùng ngay dưới chân, đi tới khi phía trên lẫn bên phải đều hết đường, rồi đặt thùng.',
      san: [
        ['#####', '###D#', '###.#', '#...#', '#.###', '#o###'],
        ['######', '####D#', '###..#', '###.##', '#...##', '#o####']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      mucTieu: 'dua-vat',
      goiY: ['Còn đi tiếp được khi phía trên HOẶC bên phải trống: chạm vào điều kiện của while để ghép or.', 'Trong vòng: phía trên trống thì lên, không thì sang phải.'],
      sao: { o: 7, nhip: 18 },
      loiGiai: { chinh: ['pick()', 'while front_clear() or right_clear():', '    if front_clear():', '        go_up()', '    else:', '        go_right()', 'drop()'] } }),

    man(5, { ten: 'Đường vòng hay đường tắt',
      deBai: 'Tới cờ bằng đường vòng sát mép sân, hoặc luồn đường tắt qua giữa. Nhện mỗi bước mất 2 nhịp nên đi xa rất tốn. Một sao cho bài gọn, một sao cho bài nhanh, có thể lấy bằng hai bài khác nhau.',
      san: ['......F', '.####.#', '.##...#', '.##.###', '.##.###', '....###'],
      batDau: { x: 3, y: 5, huong: 0 },
      goiY: ['Đường vòng chỉ cần dò tới khi hết đường rồi đổi hướng: viết gọn nhưng đi xa.', 'Đường tắt ngắn hơn hẳn, nhưng đoạn nào cũng phải viết riêng.'],
      sao: { o: 6, nhip: 16 },
      doiCho: true,
      loiGiai: { chinh: ['while left_clear():', '    go_left()', 'while front_clear():', '    go_up()', 'while right_clear():', '    go_right()'] },
      cachKhac: [{ chinh: FOR(3, ['go_up()']).concat(FOR(2, ['go_right()']), FOR(2, ['go_up()']), ['go_right()']) }] }),

    man(6, { ten: 'Hai cột hàng: tự viết hàm',
      deBai: 'Hai cột giống nhau, mỗi cột một thùng phải lên ô đích trên đầu cột. Tự viết hàm tên tùy em cho một lượt rồi gọi trong for. Chương trình chính chỉ có 3 ô.',
      san: ['D.D..', '.#...', 'o.o..'],
      batDau: { x: 0, y: 2, huong: 0 },
      mucTieu: 'dua-vat',
      khung: { chinh: 3 },
      goiY: ['Một lượt: nhặt thùng, lên hai ô, đặt, sang phải hai ô, xuống hai ô.'],
      sao: { o: 10, nhip: 32 },
      loiGiai: {
        chinh: FOR(2, ['mang_cot()']),
        hamCuaEmMoi: [H('mang_cot', ['pick()', 'go_up()', 'go_up()', 'drop()', 'go_right()', 'go_right()', 'go_down()', 'go_down()'])]
      } }),

    man(7, { ten: 'Mang thùng đường nào',
      deBai: 'Nhặt thùng dưới chân, mang tới ô đích. Đường sát mép sân viết rất gọn, đường qua hai khe thì ngắn hơn. Hàm nào cũng được, tên tùy em. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['......D', '.####.#', '.......', '.##.###', '......o'],
      batDau: { x: 6, y: 4, huong: 0 },
      mucTieu: 'dua-vat',
      goiY: ['Sang trái hết đường, lên hết đường, sang phải hết đường: ba vòng while là tới.', 'Đường qua khe có hai đoạn lên giống nhau: viết thành hàm thì bớt được vài ô.'],
      sao: { o: 8, nhip: 24 },
      doiCho: true,
      loiGiai: { chinh: ['pick()', 'while left_clear():', '    go_left()', 'while front_clear():', '    go_up()', 'while right_clear():', '    go_right()', 'drop()'] },
      cachKhac: [{ chinh: ['pick()'].concat(FOR(3, ['go_left()']), ['len_hai()'], FOR(2, ['go_right()']), ['len_hai()', 'go_right()', 'drop()']), hamCuaEmMoi: [H('len_hai', FOR(2, ['go_up()']))] }] }),

    man(8, { ten: 'Bãi xe cũ',
      deBai: 'Hai sân, cùng số bước nhưng khác đường. Nhặt thùng ngay dưới chân, mang tới ô đích. Chương trình chính chỉ có 10 ô.',
      san: [
        ['#####', '#D###', '#..##', '##.##', '#..##', '#.###', '#o###'],
        ['#######', '###D###', '###..##', '####.##', '##...##', '##o####', '#######']
      ],
      batDau: [{ x: 1, y: 6, huong: 0 }, { x: 2, y: 5, huong: 0 }],
      mucTieu: 'dua-vat',
      sao: { o: 9, nhip: 18 },
      loiGiai: {
        chinh: ['pick()'].concat(FOR(7, ['if front_clear():', '    go_up()', 'elif right_clear():', '    go_right()', 'else:', '    go_left()']), ['drop()'])
      },
      huyHieu: { ma: 'che-nhen', ten: 'Thợ nhện bãi xe' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
